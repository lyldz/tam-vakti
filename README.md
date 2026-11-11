<p align="center">
  <img src="docs/logo.png" alt="Tam Vakti simgesi" width="160" height="160">
</p>

<h1 align="center">Tam Vakti</h1>

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
- 🧩 **7 ana ekran widget'ı:** Sıradaki Vakit, Geri Sayım (2x1), Günün Vakitleri (4x1, yatay), Vakit Listesi (dikey), Büyük Panel (4x2), Saat ve Vakit, Sade (şeffaf). Hepsi Arctic koyu; geri sayım saniye saniye işler, sıradaki vakit vurgulanır.
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

## 🏷️ Sürümleme (SemVer)

- **`versionName`:** `MAJOR.MINOR.PATCH` (ör. `2.7.2`, Git etiketi: `v2.7.2`); her minor sürümün bir kod adı vardır (`CODENAMES`)
- **`versionCode`:** her sürümde +100
- Etiket (`vX.Y.Z`) push edildiğinde **GitHub Actions** APK'yı bulutta derler ve Releases sayfasına ekler.
- Uygulama içi güncelleme denetimi etiketleri bu şemayla karşılaştırır.

Yeni sürüm çıkarmak için:

```bash
./release.sh feature   # yeni minor (2.7.2 -> 2.8.0, yeni kod adı)
./release.sh fix       # yalnızca düzeltme (2.7.2 -> 2.7.3)
./release.sh 2.7.3     # ya da sürümü kendiniz verin (--dry: denemeyi göster)
```

Betik `build.gradle.kts`, `www/index.html` rozetleri ve `app.js` sürümünü günceller, `notes/<etiket>.md` dosyasını sürüm notu olarak kullanır.

---

## 🛠️ Geliştirme

Uygulama, yerel bir Android WebView kabuğunun içinde çalışan HTML/CSS/JS arayüzünden oluşur.

- Web varlıklarını (`www/`) değiştirdikten sonra Android'in gömülü kopyasıyla eşitleyin: `cp -r www/* android/app/src/main/assets/www/`. Silinen dosyaları iki yerden de silin.
- JS dosyalarını `node --check www/js/<dosya>.js` ile denetleyin.
- **İmza anahtarı depoda yoktur.** GitHub Secrets (`KEYSTORE_BASE64`, `KEYSTORE_PASSWORD`, `KEY_ALIAS`, `KEY_PASSWORD`) veya yerel `android/keystore.properties` kullanılır.
- Proje bağlamı ve kurallar için `CLAUDE.md`, yapılacaklar için `TODO.md` dosyasına bakın.

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
├── CLAUDE.md  TODO.md  (AGENTS.md, HANDOFF.md → CLAUDE.md)
└── LICENSE
```

---

## 🙏 Kaynaklar

Vakit verisi: Aladhan API. Yazı tipleri: Plus Jakarta Sans, JetBrains Mono, Amiri (SIL OFL).

## 📄 Lisans

[MIT Lisansı](LICENSE).
