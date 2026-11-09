# 🕌 Tam Vakti

> **Reklamsız, sade ve çevrimdışı çalışabilen Android namaz vakti uygulaması.** Lacivert & camgöbeği "Arctic" koyu tema.

[![Build APK](https://github.com/lyldz/tam-vakti/actions/workflows/build-apk.yml/badge.svg)](https://github.com/lyldz/tam-vakti/actions/workflows/build-apk.yml)
[![Sürüm](https://img.shields.io/github/v/release/lyldz/tam-vakti?label=S%C3%BCr%C3%BCm&color=22d3ee)](https://github.com/lyldz/tam-vakti/releases)
[![Lisans](https://img.shields.io/badge/Lisans-MIT-blue.svg)](LICENSE)

Paket adı: `com.tamvakti.app`

---

## ✨ Özellikler

- ⏱️ **Canlı vakit takibi:** İmsak, Güneş, Öğle, İkindi, Akşam ve Yatsı. Bir sonraki vakte saniyelik geri sayım, güneş yolu yayı ve kaydırmasız ana sayfada 3x2 büyük vakit kutuları.
- ⚠️ **Kerahat vakti uyarısı:** Kerahat vakitlerinde ana sayfada ikaz gösterilir.
- 🔔 **Esnek uyarılar:** Her vakit için "vakit girince" ve "vakitten önce" bildirimi. Bildirimler **telefonun kendi bildirim sesiyle** gelir. Ses, Ayarlar'daki "Bildirim sesi" satırıyla telefonun kanal ayarından seçilir. Uygulamada ezan dosyası yoktur.
- 🌐 **Offline-first:** İnternet varken güncel vakitleri alır. İnternet yokken yerleşik astronomi motoruyla hesaplamaya devam eder. Yazı tipleri ve Tailwind pakete gömülüdür.
- 📍 **Konum:** GPS ile otomatik konum ya da il/ilçeyi listeden seçme. İhtiyat süreleri Ayarlar'dan ayarlanır.
- 🧭 **Kıble pusulası:** Telefonun sensörleriyle Kâbe yönünü gösterir. Kullanım öncesi kalibrasyon ister. Kâbe'ye mesafeyi ve günün kıble saatini de gösterir.
- 🧙 **Kurulum sihirbazı:** Konum, bildirim, tam zamanlı alarm, pil muafiyeti ve Rahatsız Etmeyin izinlerini adım adım ister. Her izin için durum rozeti gösterir (Verildi / Reddedildi / Ayarlara git). Ayarlar'dan yeniden başlatılabilir. Akış `docs/KURULUM.md` içinde anlatılmıştır.
- 🧩 **Ana ekran widget'ı:** Sıradaki vakti ana ekranda gösterir.
- 🛡️ **Reklamsız, izleyicisiz:** Hesap, reklam veya takip yok.

---

## 📦 İndirme ve kurulum

1. **[Releases](https://github.com/lyldz/tam-vakti/releases)** sayfasına gidin.
2. En güncel sürümün `.apk` dosyasını telefonunuza indirin.
3. APK'ya dokunup kurulumu tamamlayın. Gerekirse "bilinmeyen kaynaklardan kuruluma izin ver" seçeneğini açın.
4. GitHub APK'sı yeni sürümleri uygulama içinden denetler.

İki dağıtım türü vardır:

| Dağıtım | Çıktı | Kendini güncelleme |
|---|---|---|
| `github` | APK | Var |
| `play` | AAB (Google Play) | Yok |

---

## 🏷️ Sürümleme (Major.Minor)

- **`versionName`:** `2.5`, `2.6`, ... (Git etiketi: `v2.5`)
- **`versionCode`:** her sürümde +100 (örn. `20500`)
- Etiket (`vX.Y`) push edildiğinde **GitHub Actions** APK'yı bulutta derler ve Releases sayfasına ekler.
- Uygulama içi güncelleme denetimi etiketleri bu şemayla karşılaştırır.

Yeni sürüm çıkarmak için:

```bash
./release.sh          # sürümü otomatik artırır, commit atar, etiketler ve push eder
./release.sh 2.6      # ya da sürümü kendiniz verin
```

Betik `android/app/build.gradle.kts` içindeki sürümü günceller. `www/index.html` içindeki sürüm rozetini ayrıca kontrol edin.

---

## 🛠️ Geliştirme

Uygulama, yerel bir Android WebView kabuğunun içinde çalışan HTML/CSS/JS arayüzünden oluşur.

- Web varlıklarını (`www/`) değiştirdikten sonra Android'in gömülü kopyasıyla eşitleyin: `cp -r www/* android/app/src/main/assets/www/`. Silinen dosyaları iki yerden de silin.
- JS dosyalarını `node --check www/js/<dosya>.js` ile denetleyin.
- **İmza anahtarı depoda yoktur.** GitHub Secrets (`KEYSTORE_BASE64`, `KEYSTORE_PASSWORD`, `KEY_ALIAS`, `KEY_PASSWORD`) veya yerel `android/keystore.properties` kullanılır.
- Yapılacaklar için `TODO.md`, devir notu için `HANDOFF.md` dosyasına bakın.

---

## 📂 Proje yapısı

```
tam-vakti/
├── .github/workflows/build-apk.yml   # APK derleme ve Releases CI/CD
├── android/                          # Android (Gradle/Kotlin) projesi
│   └── app/src/main/
│       ├── java/com/tamvakti/app/    # MainActivity, Scheduler, Notifs, Widget...
│       └── assets/www/               # www/ klasörünün gömülü kopyası
├── www/                              # Uygulama arayüzü
│   ├── index.html
│   ├── css/
│   ├── lib/tailwind/                 # Yerel Tailwind
│   └── js/
│       ├── app.js                    # Ana denetleyici
│       ├── prayer-engine.js          # Vakit ve astronomi hesaplama motoru
│       ├── compass.js                # Kıble pusulası
│       └── cities.js                 # İl/ilçe koordinatları
├── docs/                             # Gizlilik politikası, kurulum şeması
├── store/PLAY_STORE.md               # Google Play mağaza metinleri
├── tools/                            # Test ve görsel üretim araçları
├── release.sh                        # Sürümleme ve yayın betiği
├── AGENTS.md  HANDOFF.md  TODO.md
└── LICENSE
```

---

## 🙏 Kaynaklar

Vakit verisi: Aladhan API. Yazı tipleri: Plus Jakarta Sans, JetBrains Mono, Amiri (SIL OFL).

## 📄 Lisans

[MIT Lisansı](LICENSE).
