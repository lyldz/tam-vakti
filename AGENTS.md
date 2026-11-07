# Tam Vakti - Geliştirici & Agent Hafızası (AGENTS.md)

Bu dosya, "Tam Vakti" projesinin mimari kurallarını, sürümleme standartlarını ve güncelleme prosedürlerini kalıcı olarak tanımlar. Gelecekteki tüm konuşmalarda ve geliştirmelerde bu kurallara uyulacaktır.

---

## 1. Proje Kimliği & Standartlar
- **Uygulama Adı:** Tam Vakti
- **Paket Adı:** `com.tamvakti.app`
- **Konum:** `/storage/emulated/0/Documents/tam-vakti`
- **GitHub Reposu:** `https://github.com/lyldz/tam-vakti.git`
- **Tasarım:** Reklamsız, sade, lacivert & camgöbeği "Arctic" koyu teması (açık tema yok), offline-first (yazı tipleri ve Tailwind yerel pakette).

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
   git commit -m "feat: [yapılan değişiklikler] (vX.Y)"
   git push origin main
   ```
3. **APK Derlemesini Tetikleme (Tag Push):**
   ```bash
   git tag vX.Y
   git push origin vX.Y
   ```
4. **Sonuç Takibi:**
   - GitHub Actions bulutta Gradle ile APK'yı derler.
   - Kullanıcıya `https://github.com/lyldz/tam-vakti/releases` linki verilir.

---

## 4. Hızlı Yayınlama Betiği (`release.sh`)
Projeye eklenen `./release.sh` betiği bugünün tarihini otomatik alarak tüm bu sürümleme, etiketleme ve GitHub'a yükleme adımlarını tek seferde gerçekleştirir.

---

## 5. Notlar (2026-11 güncellemesi)
- Vakit bildirimleri **telefonun kendi bildirim sesiyle** gelir (kanal: `tamvakti_alert`); uygulamada ezan dosyası/servisi yoktur. Ses, Ayarlar > Bildirim sesi satırıyla telefon kanal ayarından seçilir.
- İmza anahtarı depoda değildir: GitHub Secrets (`KEYSTORE_BASE64`, `KEYSTORE_PASSWORD`, `KEY_ALIAS`, `KEY_PASSWORD`) veya yerel `android/keystore.properties`.
- `www/` değişince `cp -r www/* android/app/src/main/assets/www/` ile eşitle; silinen dosyaları iki yerden de sil.
