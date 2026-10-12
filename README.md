# 🕌 Tam Vakti - Namaz & İbadet Asistanı

> **Modern, reklamsız, Diyanet uyumlu ve çevrimdışı (offline) çalışabilen Android namaz vakti ve ibadet takip uygulaması.**

[![Build APK](https://github.com/USER_OR_ORG/tam-vakti/actions/workflows/build-apk.yml/badge.svg)](https://github.com/USER_OR_ORG/tam-vakti/actions/workflows/build-apk.yml)
[![Sürüm](https://img.shields.io/badge/Sürüm-2026.10.12-10B981.svg)](https://github.com/USER_OR_ORG/tam-vakti/releases)
[![Lisans](https://img.shields.io/badge/Lisans-MIT-blue.svg)](LICENSE)

---

## 📱 Sürümleme Modeli (CalVer)

Bu projede sürüm numaraları tarih tabanlıdır (**Yıl.Ay.Gün**):
- **Örnek Sürüm Adı (`versionName`):** `2026.10.12`
- **Örnek Derleme No (`versionCode`):** `20261012`
- Her yeni güncellemede o günün tarihi versiyon numarası olarak atanır (örn: `2026.10.15`, `2027.02.12`).

---

## ✨ Temel Özellikler

- ⏱️ **Diyanet Uyumlu & Canlı Sayaç:**
  - İmsak, Güneş, Öğle, İkindi, Akşam, Yatsı vakitleri.
  - Vaktin dolum oranı (ilerleme çubuğu) ve bir sonraki vakte kalan saniyelik dijital geri sayım.
  - **Kerahat Vakti Uyarısı:** Güneş doğuşu ve batışı öncesindeki kerahet vakitlerinde otomatik sarı ikaz.
- 🌐 **İki Katmanlı Offline-First Mimari:**
  - İnternet varken Diyanet API'den en güncel verileri alır ve önbelleğe yazar.
  - İnternet yokken bile yerleşik matematiksel astronomi motoru (İmsak 18°, Yatsı 17°) sayesinde kesintisiz çalışır.
- 📍 **Konum Desteği:**
  - Türkiye'nin 81 ili ve Ilgın gibi ilçeler için yerleşik koordinat kütüphanesi.
  - Tek dokunuşla GPS üzerinden anlık koordinat tespiti.
- 🧭 **Canlı Kıble Pusulası:**
  - Telefonun manyetometre ve yön sensörünü kullanarak Kâbe yönüne dönen akıcı pusula kadranı.
  - Kâbe'ye olan kuş uçuşu mesafe (km) ve derece göstergesi.
- 📿 **Akıllı Zikirmatik:**
  - Namaz sonrası 33 Sübhanallah, 33 Elhamdülillah, 33 Allahuekber tesbihatı.
  - Dokunma ve aşama geçişlerinde haptik titreşim geri bildirimi.
- 📋 **Kaza Namazı Defteri:**
  - Sabah, Öğle, İkindi, Akşam, Yatsı, Vitir ve Kaza Orucu borçlarını takip eden yerel depolamalı sayaç.
- 📅 **Aylık İmsakiye:**
  - Seçili il veya ilçe için tüm ayın namaz vakitlerini listeleyen tablo.
- 🛡️ **Sıfır Reklam, Sıfır İzleyici:**
  - Tamamen açık kaynak ve kullanıcı gizliliğine saygılı.

---

## 📦 APK İndirme & Kurulum

1. GitHub'da **[Releases](https://github.com/USER_OR_ORG/tam-vakti/releases)** sekmesine gidin.
2. En güncel sürüme ait `TamVakti-2026.10.12.apk` dosyasını telefonunuza indirin.
3. İndirilen APK'ya dokunup kurulumu tamamlayın.

---

## 🚀 GitHub'a Yükleme Adımları

Projeyi kendi GitHub hesabınıza yüklemek için terminalden sırasıyla şu komutları çalıştırabilirsiniz:

```bash
cd "/storage/emulated/0/Documents/tam-vakti"

# 1. Git deposunu hazırla
git init
git add .
git commit -m "feat: Tam Vakti v2026.10.12 ilk sürüm"

# 2. GitHub reponuzu bağlayın (kendi kullanıcı adınızı yazın)
git remote add origin https://github.com/KULLANICI_ADINIZ/tam-vakti.git
git branch -M main
git push -u origin main

# 3. Otomatik APK Derlemesini Başlatmak İçin Sürüm Etiketi Atın:
git tag v2026.10.12
git push origin v2026.10.12
```

> [!TIP]
> Etiket (`v2026.10.12`) push edildiğinde **GitHub Actions** devreye girer; projeyi bulutta derler ve saniyeler içinde GitHub Releases sayfasına hazır `.apk` dosyasını otomatik olarak ekler!

---

## 📂 Proje Dizin Yapısı

```
tam-vakti/
├── .github/workflows/
│   └── build-apk.yml           # Otomatik APK derleme ve Releases CI/CD
├── android/                    # Android Studio & Gradle Yerel Projesi
│   ├── app/
│   │   ├── build.gradle.kts    # CalVer 2026.10.12 tanımları
│   │   └── src/main/
│   │       ├── AndroidManifest.xml
│   │       ├── java/com/tamvakti/app/MainActivity.kt
│   │       ├── res/
│   │       └── assets/www/     # Gömülü çevrimdışı web varlıkları
├── www/                        # Uygulama Web Çekirdeği
│   ├── index.html              # Ana kullanıcı arayüzü
│   ├── css/style.css           # Zümrüt & Gece teması
│   └── js/
│       ├── cities.js           # 81 İl ve ilçe koordinatları
│       ├── prayer-engine.js    # Diyanet & astronomik hesaplama motoru
│       ├── compass.js          # Kıble yön sensörü yöneticisi
│       ├── dhikr.js            # Zikirmatik & kaza takipçisi
│       └── app.js              # Canlı saat, sayaç ve sekme kontrolcüsü
├── README.md
├── LICENSE
└── .gitignore
```

---

## 📄 Lisans

Bu proje [MIT Lisansı](LICENSE) ile lisanslanmıştır. Herkes serbestçe geliştirebilir, kullanabilir ve paylaşabilir.
