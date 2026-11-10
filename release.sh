#!/usr/bin/env bash
# Tam Vakti - Otomatik Sürümleme ve APK Tetikleme Betiği
set -e

# Bulunduğu dizini repo kökü olarak al
REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$REPO_DIR"

if [ -d "/data/user/0/com.agy/files/usr/libexec/git-core" ]; then
  export GIT_EXEC_PATH="/data/user/0/com.agy/files/usr/libexec/git-core"
  export GIT_CONFIG_NOSYSTEM=1
fi

# Mevcut sürümü oku
CURRENT_VER=$(grep 'versionName = "' "$REPO_DIR/android/app/build.gradle.kts" | cut -d '"' -f2)
CURRENT_CODE=$(grep 'versionCode = ' "$REPO_DIR/android/app/build.gradle.kts" | tr -dc '0-9')
IFS='.' read -r CUR_MAJOR CUR_MINOR CUR_PATCH <<< "$CURRENT_VER"
CUR_PATCH="${CUR_PATCH:-0}"

usage() {
  cat <<USAGE
Kullanım: ./release.sh <tür|sürüm> [commit mesajı] [--dry]
  feature   yeni özellik   : ${CUR_MAJOR}.$((10#$CUR_MINOR + 1)).0   (yeni minor, yeni kod adı)
  fix       yalnızca düzeltme: ${CUR_MAJOR}.${CUR_MINOR}.$((10#$CUR_PATCH + 1))   (aynı kod adı)
  major     büyük değişiklik: $((10#$CUR_MAJOR + 1)).0.0
  X.Y.Z     elle sürüm numarası
  --dry     hiçbir şey değiştirmeden ne yapılacağını göster
Mevcut sürüm: $CURRENT_VER   Kod adları: CODENAMES dosyası
USAGE
}

DRY=0
ARGS=()
for a in "$@"; do
  if [ "$a" = "--dry" ]; then DRY=1; else ARGS+=("$a"); fi
done
KIND="${ARGS[0]:-}"
if [ -z "$KIND" ]; then usage; exit 1; fi

case "$KIND" in
  feature) NEW_VER="${CUR_MAJOR}.$((10#$CUR_MINOR + 1)).0" ;;
  fix)     NEW_VER="${CUR_MAJOR}.${CUR_MINOR}.$((10#$CUR_PATCH + 1))" ;;
  major)   NEW_VER="$((10#$CUR_MAJOR + 1)).0.0" ;;
  [0-9]*.[0-9]*.[0-9]*|[0-9]*.[0-9]*) NEW_VER="$KIND" ;;
  *) echo "Bilinmeyen tür: $KIND"; usage; exit 1 ;;
esac

NEW_CODE=$((CURRENT_CODE + 100))
COMMIT_MSG="${ARGS[1]:-feat: Tam Vakti v$NEW_VER sürümü}"
TAG_NAME="v$NEW_VER"

# Kod adı: sürümün MAJOR.MINOR değerine göre CODENAMES dosyasından
IFS='.' read -r N_MAJOR N_MINOR _ <<< "$NEW_VER"
CODENAME=$(grep -E "^${N_MAJOR}\.${N_MINOR}[[:space:]]" "$REPO_DIR/CODENAMES" | head -1 | sed -E 's/^[0-9]+\.[0-9]+[[:space:]]+//')
if [ -z "$CODENAME" ]; then
  echo "HATA: CODENAMES dosyasında ${N_MAJOR}.${N_MINOR} için kod adı yok. Satır ekleyin (örn: \"${N_MAJOR}.${N_MINOR} Ad\")."
  exit 1
fi

echo "=== Tam Vakti Yeni Sürüm Hazırlanıyor: $CURRENT_VER -> $NEW_VER \"$CODENAME\" (code: $NEW_CODE) ==="
if [ "$DRY" = "1" ]; then
  echo "(--dry: hiçbir dosya değiştirilmedi, commit/push/etiket yapılmadı)"
  exit 0
fi

# 1. build.gradle.kts dosyasındaki sürüm kodlarını güncelle
sed -i "s/versionCode = [0-9]*/versionCode = $NEW_CODE/" "$REPO_DIR/android/app/build.gradle.kts"
sed -i "s/versionName = \"[^\"]*\"/versionName = \"$NEW_VER\"/" "$REPO_DIR/android/app/build.gradle.kts"

# 2. www içindeki sürüm etiketini güncelle
# Yalnızca sürüm rozetlerini ("v2.3 • Kod Adı") ve app.js sürüm değişkenlerini değiştir;
# SVG yol verileri gibi "v3.159" benzeri metinlere dokunma.
sed -i "s/v[0-9]\+\(\.[0-9]\+\)\+ • [^<\"]*/$TAG_NAME • $CODENAME/g" "$REPO_DIR/www/index.html"
# Ayarlar > Hakkında satırındaki yalın sürüm etiketi ("v2.6")
sed -i "s/\(id=\"settingsAboutAction\">\)v[0-9]\+\(\.[0-9]\+\)\+</\1$TAG_NAME</" "$REPO_DIR/www/index.html"
sed -i "s/^ \* Sürüm: v[0-9.]*/ * Sürüm: $TAG_NAME/" "$REPO_DIR/www/js/app.js"
sed -i "s/currentVersion = \"v[0-9.]*\"/currentVersion = \"$TAG_NAME\"/; s/versionDisplay = \"v[0-9.]* • [^\"]*\"/versionDisplay = \"$TAG_NAME • $CODENAME\"/; s/versionCodename = \"[^\"]*\"/versionCodename = \"$CODENAME\"/" "$REPO_DIR/www/js/app.js"
sed -i "s|// Sürüm Yapılandırması: .*|// Sürüm Yapılandırması: $TAG_NAME \"$CODENAME\"|" "$REPO_DIR/android/app/build.gradle.kts"

# 3. Web varlıklarını Android assets klasörüne eşitle
mkdir -p "$REPO_DIR/android/app/src/main/assets/www"
cp -ru "$REPO_DIR/www/"* "$REPO_DIR/android/app/src/main/assets/www/"

# 3b. Sürüm notları: notes/<etiket>.md elle yazılmışsa o kullanılır; yoksa son etiketten bu yana commit konularından üretilir.
# (GitHub Release gövdesi ve uygulamadaki "Neler yeni?" penceresi bu dosyadan beslenir.)
mkdir -p "$REPO_DIR/notes"
NOTES_FILE="$REPO_DIR/notes/$TAG_NAME.md"
if [ ! -f "$NOTES_FILE" ]; then
  LAST_TAG=$(git describe --tags --abbrev=0 2>/dev/null || true)
  RANGE="${LAST_TAG:+$LAST_TAG..}HEAD"
  git log $RANGE --no-merges --pretty=%s \
    | grep -Ev '^(docs|chore|test|ci|build|style)(\(.*\))?:' \
    | grep -Ev '^(feat|fix): Tam Vakti v' \
    | python3 -c '
import re, sys
for line in sys.stdin:
    t = re.sub(r"^(feat|fix|perf|refactor)(\([^)]*\))?: *", "", line.strip())
    t = re.sub(r" *\(v[0-9.]+\)$", "", t)
    if not t:
        continue
    first = {"i": "İ", "ı": "I"}.get(t[0], t[0].upper())
    print("- " + first + t[1:])
' > "$NOTES_FILE" || true
  [ -s "$NOTES_FILE" ] || echo "- Küçük iyileştirmeler ve hata düzeltmeleri." > "$NOTES_FILE"
  echo "Sürüm notları otomatik üretildi: notes/$TAG_NAME.md (gerekirse commit öncesi elle düzenleyin)"
fi

# 4. Git Commit ve Push
git add .
git commit -m "$COMMIT_MSG" || echo "Değişiklik yok, devam ediliyor..."
git push origin main

# 5. Sürüm Etiketi At ve Push Et (GitHub Actions APK derlemesini başlatır)
git tag "$TAG_NAME"
git push origin "$TAG_NAME"

echo ""
echo "🚀 $TAG_NAME başarıyla GitHub'a gönderildi!"
echo "📦 GitHub Actions APK derlemesini başlattı:"
echo "   👉 https://github.com/lyldz/tam-vakti/releases/tag/$TAG_NAME"
