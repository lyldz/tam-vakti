#!/usr/bin/env bash
# Tam Vakti - Otomatik Sürümleme ve APK Tetikleme Betiği
set -e

REPO_DIR="/storage/emulated/0/Documents/tam-vakti"
cd "$REPO_DIR"

export GIT_EXEC_PATH="/data/user/0/com.agy/files/usr/libexec/git-core"
export GIT_CONFIG_NOSYSTEM=1

# Bugünün Tarihini Al (YYYY.MM.DD ve YYYYMMDD)
TODAY_VERSION=$(date +"%Y.%m.%d")
TODAY_CODE=$(date +"%Y%m%d")
TAG_NAME="v$TODAY_VERSION"
COMMIT_MSG="${1:-feat: Tam Vakti sürüm güncellemesi ($TODAY_VERSION)}"

echo "=== Tam Vakti Yeni Sürüm Hazırlanıyor: $TODAY_VERSION ==="

# 1. build.gradle.kts dosyasındaki sürüm kodlarını güncelle
sed -i "s/versionCode = [0-9]*/versionCode = $TODAY_CODE/" "$REPO_DIR/android/app/build.gradle.kts"
sed -i "s/versionName = \"[0-9.]*\"/versionName = \"$TODAY_VERSION\"/" "$REPO_DIR/android/app/build.gradle.kts"

# 2. www/index.html içindeki rozet sürümünü güncelle
sed -i "s/v[0-9]\{4\}\.[0-9]\{2\}\.[0-9]\{2\}/$TAG_NAME/" "$REPO_DIR/www/index.html"

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
echo "   👉 https://github.com/lyldz/tam-vakti/releases"
