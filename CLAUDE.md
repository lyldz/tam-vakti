# Tam Vakti — Claude için proje bağlamı

Bu dosya, bu repoda çalışan her Claude oturumunun (VPS'teki Claude Code, claude.ai oturumları, sabah otomatik görevi) **tek bağlam kaynağıdır**. Kalıcı bir karar, kural ya da durum değişince burayı güncelle. `AGENTS.md` ve `HANDOFF.md` yalnızca buraya yönlendirir; içerik orada tutulmaz.

## Uygulama
Reklamsız, sade, çevrimdışı çalışan Android namaz vakti uygulaması. Lacivert/camgöbeği "Arctic" koyu tema (açık tema yok). Yazı tipleri ve Tailwind yerel pakette (offline-first).

- Depo: github.com/lyldz/tam-vakti (herkese açık, MIT, dal `main`)
- Paket: `com.tamvakti.app`, minSdk 24, target/compileSdk 36, JDK 17
- Özellikler (ayrıntı README.md): 6 vakit + saniyelik geri sayım, güneş yolu yayı, kerahat uyarısı, vakit/vakit öncesi bildirimler, sabit bildirim, tam ekran vakit bildirimi, 10 özgün sentez bildirim sesi, kıble pusulası (zorunlu kalibrasyon), aylık imsakiye, 7 ana ekran widget'ı, kurulum sihirbazı, hesaplama yöntemleri (varsayılan "Otomatik"), 81 il / 1002 ilçe ya da GPS, uygulama içi güncelleme.

## Mimari
WebView içinde web arayüzü + Kotlin native katman.

- **Web (`www/`):** `index.html`, `js/app.js` (ana mantık, ayarlar, sihirbaz, alarm olayı üretimi `syncNativeSchedule`), `js/prayer-engine.js` (çevrimdışı astronomi motoru; çevrimiçi Aladhan), `js/compass.js` (kıble), `js/cities.js` (il/ilçe), `css/`, `lib/`, `assets/`.
- **Native (`android/app/src/main/java/com/tamvakti/app/`):**
  - `MainActivity.kt`: WebView + JS köprüsü `AndroidBridge`, sensörler, izin yönlendirmeleri
  - `Scheduler.kt`, `AlarmReceiver.kt`, `BootReceiver.kt`: alarmlar. 30 günlük ufuk; en yakın 120 olay kurulur, her alarmdan sonra pencere kayar (AlarmManager ~500 sınırı)
  - `Notifs.kt`: kanallar ve bildirimler. Ton başına ayrı kanal (`Notifs.alertChannelId`, sesler `res/raw/tone_<ad>.wav`, liste `TamVaktiApp.TONES`)
  - `PrayerAlertActivity.kt`: tam ekran vakit bildirimi (overlay izniyle telefon açıkken de)
  - `Widgets.kt`: 7 widget'ın ortak kodu; `PrayerWidget.kt` eski sınıf, yerleşik widget'lar bozulmasın diye kalıyor
  - `Store.kt`, `Silencer.kt`: kalıcı veri, Rahatsız Etmeyin
- **Dağıtım flavor'ları:** `github` (APK, uygulama içi kendini güncelleme var) / `play` (AAB, `IS_PLAY=true`, kendini güncelleme yok).
- **`www/` eşitleme:** `www/` değişince `cp -r www/. android/app/src/main/assets/www/`; silinen dosyayı iki yerden de sil. Sonra `diff -rq www android/app/src/main/assets/www` ve `node --check` ile JS'i denetle.
- **Araçlar (`tools/`, uygulamaya dahil değil):** `smoke.js` (Playwright duman testi, temiz kalmalı), `fit.js` (ekran sığma), `shot.js`, `store/` (mağaza görselleri), `sounds/` (ses üreticileri).

## Derleme ve CI
- Gradle yerelde çalışmaz; Kotlin yalnızca GitHub Actions'ta derlenir (`build-apk.yml`). VPS'te `gh` oturumu açık.
- `main`'e push: yalnızca deneme derlemesi (artifact `dev`), Release yok.
- `v*` etiketi push: imzalı APK + AAB derlenir, GitHub Release oluşur, gövdesi `notes/<etiket>.md`'den gelir.
- Yalnızca doküman değişen commit'lere (`CLAUDE.md`, `TODO.md`, `docs/` vb.) `[skip ci]` ekle.
- İmza anahtarı depoda değil: GitHub Secrets (`KEYSTORE_BASE64`, `KEYSTORE_PASSWORD`, `KEY_ALIAS`, `KEY_PASSWORD`) ya da yerel `android/keystore.properties`.

## Sürüm kuralları
Katı SemVer `MAJOR.MINOR.PATCH`. **Sürüm numarasını kullanıcıya sorma; değişikliğin türüne göre kendin belirle.**

- **PATCH** (`2.9.1` → `2.9.2`): yalnızca hata düzeltmesi. Kod adı değişmez.
- **MINOR** (`2.9.1` → `2.10.0`): yeni özellik/izin/ayar; PATCH sıfırlanır; yeni kod adı.
- **MAJOR** (`2.x` → `3.0.0`): uyumsuz değişiklik (veri düzeni, minSdk vb.).
- Birikmiş değişikliklerde en büyüğü belirler: içinde bir yeni özellik varsa MINOR.
- `versionCode` her sürümde **+100**, asla düşmez. Etiket `vX.Y.Z`; uygulamada "vX.Y.Z • Kod adı".
- Kod adları `CODENAMES` dosyasında (2.9 İkindi, 2.10 Gurub, 2.11 Şefak, 2.12 İşa, 2.13 Seher, 3.0 Fecr). Yoksa önce satır ekle, `release.sh` durur.
- Sürüm notu: `notes/<etiket>.md` (Türkçe, kullanıcıya dönük madde listesi). Yazılmazsa betik commit konularından üretir; elle yazmak tercih edilir.
- Yayın tek komutla: `./release.sh feature|fix|major|X.Y.Z "mesaj" [--dry]`. Betik sürüm alanlarını (`build.gradle.kts`, `index.html`, `app.js`) günceller, `www/` eşitler, commit + push + etiket atar. Sürüm numarasını elle dosyalara yazma.

## Yayın kararı
- **Yalnızca Lütfi "yayınla" deyince yayınla** ("vX.Y.Z olarak yayınla" ya da kısaca "yayınla"). Numara verilmemişse yukarıdaki kurala göre seç, sorma.
- Sürümler toplu çıkar: birkaç TODO maddesi bitince. Her küçük düzeltmeye ayrı sürüm açma.
- Yeni sürümler Lütfi'nin telefonunda (Xiaomi) test edilir. Telefonda denenmeyen işi TODO'da "Telefonda denenmedi" diye belirt.

## TODO.md işleyişi
- Her sabah otomatik görev en üstteki açık `- [ ]` maddeyi yapar, `[x]` + tarih ile işaretler, `main`'e push eder.
- Yapılamayan madde `- [!]` olur, altına nedeni yazılır. Sonunda `[yayın]` olan madde bitince sürüm de çıkar.
- "BEKLEMEDE" yazan maddeyi atla.

## Ürün kuralları (değişmez)
- Uygulamada "ezan" adlı ses yok. Diyanet/TRT kaydı ve sentetik ezan kullanılmaz. "Diyanet onaylı" denmez. Gerçek ezan/tekbir klibi ancak lisansı kesinse (`docs/EZAN-SESI-ARASTIRMA.md`).
- Reklam yok. Gelir modeli: temel özellikler ücretsiz, isteğe bağlı tek seferlik "Destekçi" (`docs/GELIR-MODELI.md`).
- Açık tema yok; yeni arayüz Arctic koyu temaya uymalı.
- Android 16 Canlı Güncelleme v2.7.2'de denendi, Xiaomi'de başarısız oldu, v2.7.4'te kaldırıldı. İstenmedikçe önerme.
- Güvenlik: WebView dosya erişimi kapalı, dış bağlantılar tarayıcıda açılır, APK indirme yalnızca GitHub'dan (`docs/GUVENLIK.md`).

## Durum (güncel: 2026-11-13)
- Yayında: **v2.10.0 Gurub** (`versionCode` 22800): Cuma tutarlılığı, kıble açısı rozeti, Cuma tebriği; v2.9.1: nefes alan vakit kutusu. Beğenilmezse geri dönüş v2.9.1. `main` temiz.
- 2026-11-11: "tam ekran güncelleme penceresi, 30 dk / öne gelince denetim, izin dönüşünde kurulum devamı" değişikliği yapıldı ve geri alındı (revert).
- Sırada (`TODO.md`): Ramazan modu (beklemede, "erken" denildi); gerçek kısa tekbir klibi (`[!]`, lisans); Google Play hazırlığı (ertelendi, `store/PLAY_STORE.md`).
- Bilinen küçük sorunlar: 320x568'de ana ekran 12 px taşıyor; v2.9.0 widget'ları ve bazı bildirim özellikleri telefonda tek tek doğrulanmadı.

## Dokümanlar
- `docs/KURULUM.md` sihirbaz şeması · `docs/RAKIP-ANALIZI.md` · `docs/GELIR-MODELI.md` · `docs/GUVENLIK.md` · `docs/EZAN-SESI-ARASTIRMA.md` · `store/PLAY_STORE.md`

## Çalışma ortamı
- Geliştirme, VPS'te `/root`'tan çalışan Claude Code ile yapılır; oturumlar telefondan yönetilir. Repo VPS'te `/root/tam-vakti`. `projeler` gibi ara ya da kopya klasör açma, klasör yerini sorma. Devam: `cd /root/tam-vakti && claude --continue`.
- Kardeş uygulamalar: `/root/yeter`, `/root/harf-tepsisi`.
- VPS ve claude.ai oturumları GitHub üzerinden senkron olur: işe başlarken `git pull`, iş bitince commit + push.
- İletişim Türkçe, kısa ve doğrudan.
