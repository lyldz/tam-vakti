# Tam Vakti: devir notu (güncel: 2026-11-09)

Depo: /root/projeler/tam-vakti  (github.com/lyldz/tam-vakti, dal: main, son uygulama commit'i 4ea3cb6)
Sürüm: v2.5 (versionName "2.5", versionCode 20500), YAYINLANDI: v2.5 etiketi ve GitHub Release (Latest) 2026-11-09, v2.4 de yayınlandı (2026-11-08)

## tmux ile devam
    tmux new -s tamvakti          # Ctrl+b d ile ayrıl, tmux attach -t tamvakti ile dön
    cd /root/projeler/tam-vakti
    claude --continue             # son oturum + hafıza notları yüklenir

## Şu an GitHub'daki durum
- Kurulum sihirbazı v2.5'te yenilendi: docs/KURULUM.md şemasına göre, her izin adımında durum rozeti (Verildi / Reddedildi / Ayarlara git), pil muafiyeti ve Rahatsız Etmeyin adımları; ONBOARDING_VERSION = 2 (v2.4'ten güncelleyenlere bir kez açılır); Ayarlar'dan "Kurulumu yeniden başlat" ile tekrar açılır
- Uygulama: koyu lacivert/camgöbeği tasarım, güneş yolu yayı, 3x2 büyük vakit kutuları, kaydırmasız ana sayfa
- Uyarılar: her vakit için "vakit girince" + "vakitten önce"; bildirim sesi telefonun sesi (ezan yok)
- Ayarlar: Konum/İhtiyat, Bildirim, İzinler (durum + kısayol), Uygulama
- İki dağıtım: github (APK, uygulama içi güncelleme) ve play (AAB, kendini güncelleme yok)
- targetSdk/compileSdk 36 (AGP 8.9.1, Gradle 8.11.1, Kotlin 2.0.21), edge-to-edge insets MainActivity'de
- Gizlilik politikası: docs/index.html (Pages AÇIK DEĞİL, aşağıya bak)
- Mağaza metinleri/beyanlar: store/PLAY_STORE.md

## Seni bekleyen işler
1. GitHub Pages aç (henüz doğrulanmadı, kontrol et): depo Settings > Pages > Deploy from a branch > main > /docs (gizlilik bağlantısı için şart)
2. v2.5 APK'sını telefonda dene: yeni kurulum sihirbazı (temiz kurulum ve v2.4'ten güncelleme), izin rozetleri, sistem ayar yönlendirmeleri, edge-to-edge kenarlar
3. TODO.md içindeki "Sıradakiler" maddeleri: eski kod temizliği, Kıble/pusula yenileme, arka planda güncelleme bildirimi, README güncelleme. Her sabah otomatik görev en üstteki açık maddeyi yapıyor; sıra = öncelik.
4. Play Console yükleme/formlar (store/PLAY_STORE.md)

## Dosyalar
- Anahtar + şifre: /root/.tamvakti-keys/ (YEDEKLE). GitHub Secrets'ta 4 secret var.
- İkonlar/kaynaklar: /root/projeler/tam-vakti/tools/icons (A3.svg, play-store-icon-512.png)
- Mağaza görselleri: /root/projeler/tam-vakti/tools/store (öne çıkan görsel 1024x500 + 5 ekran görüntüsü, make.js)
- Test araçları: /root/projeler/tam-vakti/tools (shot.js ekranlar, flow.js etkileşim, fit.js kaydırmasız kontrol, place.js bildirim yer adı, audit.js renk, sim.js alarm listesi). Önce playwright-core kurulmalı (hafıza notunda yazılı).
- Push için kayıtlı token yok: yeni token iste, iş bitince iptal ettir. Bu konuşmada yapıştırılan token'ları iptal et.
- Hafıza: /root/.claude/projects/-root-projeler-tam-vakti/memory/
