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

## 2. Sürümleme Mantığı (Major.Minor)
Projenin fiilen kullandığı şema budur (CalVer'den vazgeçildi):
- **`versionName`:** `2.3`, `2.4`, ... (kod adıyla: "v2.3 • Seher")
- **`versionCode`:** her sürümde +100 (örn. `20300`)
- **Git Tag:** `v2.3`
- `release.sh` bu şemaya göre otomatik artırır; uygulama içi güncelleme denetimi tag'leri bu şemayla karşılaştırır.

---

## 3. Yeni Güncelleme ve APK Yayınlama Prosedürü
Kullanıcı yeni bir özellik eklemek veya yeni bir sürüm derlemek istediğinde sırasıyla şu adımlar izlenir:

1. **Sürüm Numaralarını Güncelle:**
   - `android/app/build.gradle.kts` içinde `versionName` ve `versionCode` güncellenir.
   - `www/index.html` başlığındaki sürüm rozeti (`vX.Y`) güncellenir.
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
