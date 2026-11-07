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

# Argüman verilmişse kullan
if [ -n "$1" ]; then
  NEW_VER="$1"
  NEW_CODE=$((CURRENT_CODE + 100))
  COMMIT_MSG="${2:-feat: Tam Vakti v$NEW_VER sürümü}"
else
  # Otomatik versiyon artırma (örn: 1.06 -> 1.07)
  IFS='.' read -r major minor patch <<< "$CURRENT_VER"
  if [ -n "$patch" ]; then
    patch_num=$((10#$patch + 1))
    NEW_VER="${major}.${minor}.${patch_num}"
  else
    minor_num=$((10#$minor + 1))
    NEW_VER="${major}.${minor_num}"
  fi
  NEW_CODE=$((CURRENT_CODE + 100))
  COMMIT_MSG="feat: Tam Vakti v$NEW_VER sürüm güncellemesi"
fi

TAG_NAME="v$NEW_VER"

echo "=== Tam Vakti Yeni Sürüm Hazırlanıyor: $CURRENT_VER -> $NEW_VER (code: $NEW_CODE) ==="

# 1. build.gradle.kts dosyasındaki sürüm kodlarını güncelle
sed -i "s/versionCode = [0-9]*/versionCode = $NEW_CODE/" "$REPO_DIR/android/app/build.gradle.kts"
sed -i "s/versionName = \"[^\"]*\"/versionName = \"$NEW_VER\"/" "$REPO_DIR/android/app/build.gradle.kts"

# 2. www içindeki sürüm etiketini güncelle
# Yalnızca sürüm rozetlerini ("v2.3 • Kod Adı") ve app.js sürüm değişkenlerini değiştir;
# SVG yol verileri gibi "v3.159" benzeri metinlere dokunma.
sed -i "s/v[0-9]\+\.[0-9]\+\( • \)/$TAG_NAME\1/g" "$REPO_DIR/www/index.html"
sed -i "s/currentVersion = \"v[0-9.]*\"/currentVersion = \"$TAG_NAME\"/; s/versionDisplay = \"v[0-9.]*\( • \)/versionDisplay = \"$TAG_NAME\1/" "$REPO_DIR/www/js/app.js"

# 3. Web varlıklarını Android assets klasörüne eşitle
mkdir -p "$REPO_DIR/android/app/src/main/assets/www"
cp -ru "$REPO_DIR/www/"* "$REPO_DIR/android/app/src/main/assets/www/"

# 4. Git Commit ve Push
git add .
git commit -m "$COMMIT_MSG" || echo "Değişiklik yok, devam ediliyor..."
git push origin main

# 5. Sürüm Etiketi At ve Push Et (GitHub Actions APK derlemesini başlatır)
git tag -f "$TAG_NAME"
git push -f origin "$TAG_NAME"

echo ""
echo "🚀 $TAG_NAME başarıyla GitHub'a gönderildi!"
echo "📦 GitHub Actions APK derlemesini başlattı:"
echo "   👉 https://github.com/lyldz/tam-vakti/releases/tag/$TAG_NAME"
