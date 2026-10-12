# Tam Vakti - Geliştirici & Agent Hafızası (AGENTS.md)

Bu dosya, "Tam Vakti" projesinin mimari kurallarını, sürümleme standartlarını ve güncelleme prosedürlerini kalıcı olarak tanımlar. Gelecekteki tüm konuşmalarda ve geliştirmelerde bu kurallara uyulacaktır.

---

## 1. Proje Kimliği & Standartlar
- **Uygulama Adı:** Tam Vakti
- **Paket Adı:** `com.tamvakti.app`
- **Konum:** `/storage/emulated/0/Documents/tam-vakti`
- **GitHub Reposu:** `https://github.com/lyldz/tam-vakti.git`
- **Tasarım:** Reklamsız, sade, zümrüt yeşili & gece teması, offline-first.

---

## 2. Sürümleme Mantığı (CalVer)
Her yeni derleme o günün tarihini alır (**Yıl.Ay.Gün**):
- **`versionName` (Format: `YYYY.MM.DD`):** Örn: `2026.10.12`, `2026.10.15`, `2027.02.12`
- **`versionCode` (Format: `YYYYMMDD`):** Örn: `20261012`, `20261015`, `20270212`
- **Git Tag (Format: `vYYYY.MM.DD`):** Örn: `v2026.10.12`, `v2026.10.15`

---

## 3. Yeni Güncelleme ve APK Yayınlama Prosedürü
Kullanıcı yeni bir özellik eklemek veya yeni bir sürüm derlemek istediğinde sırasıyla şu adımlar izlenir:

1. **Sürüm Numaralarını Güncelle:**
   - `android/app/build.gradle.kts` içinde `versionName` ve `versionCode` güncellenir.
   - `www/index.html` başlığındaki sürüm rozeti (`vYYYY.MM.DD`) güncellenir.
   - Gerekirse web varlıkları `android/app/src/main/assets/www/` klasörüne kopyalanır (`cp -r www/* android/app/src/main/assets/www/`).
2. **Git Commit & Push:**
   ```bash
   cd "/storage/emulated/0/Documents/tam-vakti"
   export GIT_EXEC_PATH="/data/user/0/com.agy/files/usr/libexec/git-core"
   export GIT_CONFIG_NOSYSTEM=1
   git add .
   git commit -m "feat: [yapılan değişiklikler] (vYYYY.MM.DD)"
   git push origin main
   ```
3. **APK Derlemesini Tetikleme (Tag Push):**
   ```bash
   git tag vYYYY.MM.DD
   git push origin vYYYY.MM.DD
   ```
4. **Sonuç Takibi:**
   - GitHub Actions bulutta Gradle ile APK'yı derler.
   - Kullanıcıya `https://github.com/lyldz/tam-vakti/releases` linki verilir.

---

## 4. Hızlı Yayınlama Betiği (`release.sh`)
Projeye eklenen `./release.sh` betiği bugünün tarihini otomatik alarak tüm bu sürümleme, etiketleme ve GitHub'a yükleme adımlarını tek seferde gerçekleştirir.
