#!/usr/bin/env bash
# Tam Vakti - v1.00.01 Formatlı Otomatik Sürümleme ve APK Tetikleme Betiği
set -e

REPO_DIR="/storage/emulated/0/Documents/tam-vakti"
cd "$REPO_DIR"

export GIT_EXEC_PATH="/data/user/0/com.agy/files/usr/libexec/git-core"
export GIT_CONFIG_NOSYSTEM=1

# Mevcut sürümü oku
CURRENT_VER=$(grep 'versionName = "' "$REPO_DIR/android/app/build.gradle.kts" | cut -d '"' -f2)
CURRENT_CODE=$(grep 'versionCode = ' "$REPO_DIR/android/app/build.gradle.kts" | tr -dc '0-9')

# Eğer argüman verilmişse onu al, yoksa otomatik 1 artır (örn 1.00.01 -> 1.00.02)
if [ -n "$1" ] && [[ "$1" =~ ^[0-9]+\.[0-9]{2}\.[0-9]{2}$ ]]; then
  NEW_VER="$1"
  NEW_CODE=$((CURRENT_CODE + 1))
  COMMIT_MSG="${2:-feat: Tam Vakti v$NEW_VER sürümü}"
else
  # Otomatik son parçayı artır
  IFS='.' read -r major minor patch <<< "$CURRENT_VER"
  patch_num=$((10#$patch + 1))
  printf -v next_patch "%02d" $patch_num
  NEW_VER="${major}.${minor}.${next_patch}"
  NEW_CODE=$((CURRENT_CODE + 1))
  COMMIT_MSG="${1:-feat: Tam Vakti v$NEW_VER sürüm güncellemesi}"
fi

TAG_NAME="v$NEW_VER"

echo "=== Tam Vakti Yeni Sürüm Hazırlanıyor: $CURRENT_VER -> $NEW_VER (code: $NEW_CODE) ==="

# 1. build.gradle.kts dosyasındaki sürüm kodlarını güncelle
sed -i "s/versionCode = [0-9]*/versionCode = $NEW_CODE/" "$REPO_DIR/android/app/build.gradle.kts"
sed -i "s/versionName = \"[^\"]*\"/versionName = \"$NEW_VER\"/" "$REPO_DIR/android/app/build.gradle.kts"

# 2. www/index.html içindeki sürüm etiketini güncelle
sed -i "s/v[0-9]\+\.[0-9]\{2\}\.[0-9]\{2\}/$TAG_NAME/g" "$REPO_DIR/www/index.html"
sed -i "s/v[0-9]\+\.[0-9]\{2\}\.[0-9]\{2\}/$TAG_NAME/g" "$REPO_DIR/www/js/app.js"

# 3. Web varlıklarını Android assets klasörüne eşitle
mkdir -p "$REPO_DIR/android/app/src/main/assets/www"
cp -r "$REPO_DIR/www/"* "$REPO_DIR/android/app/src/main/assets/www/"

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
