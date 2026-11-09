# Tam Vakti: devir notu (güncel: 2026-11-09, v2.6.4 + yayınlanmamış değişiklikler)

Depo: /root/tam-vakti  (github.com/lyldz/tam-vakti, dal: main, son sürüm commit'i 7645f7c)
Sürüm: v2.6.4 (versionName "2.6.4", versionCode 21000), YAYINLANDI: v2.6.4 etiketi + GitHub Release (APK'lar yüklü). Önceki: v2.6, v2.6.1, v2.6.3 (v2.6.2 etiketi var ama derlemesi iptal edildi, Release'i yok), v2.5, v2.4.

## tmux ile devam
    tmux new -s tamvakti          # Ctrl+b d ile ayrıl, tmux attach -t tamvakti ile dön
    cd /root/tam-vakti
    claude --continue             # son oturum + hafıza notları yüklenir

## Şu an GitHub'daki durum
- v2.6 serisinde yapılanlar: Kıble sekmesi yenilendi (harita modu ve Leaflet kalktı; her açılışta zorunlu kalibrasyon: 8 çizme hareketi ~720° + en az 6 sn + doğruluk >= orta; yumuşak rAF dönüşü; SVG kadran; yeni çizim Kâbe simgesi; hizalanınca titreşim). Native köprü (MainActivity.kt): doğruluk manyetometreden okunuyor, ~30 Hz sınırlama, ekran dönüşüne göre eksen remap. Kullanıcı Kıble'nin doğru çalıştığını ve 156° (Ilgın) değerinin doğru olduğunu teyit etti.
- Ana sayfada kerahat süresi saat+dakika ("Kerahate 1 sa 36 dk"); 360/390 px'te tek satır, 320 px'te zaten sarıyordu.
- Kurulum sihirbazı v2.5'ten: docs/KURULUM.md şeması, izin rozetleri, ONBOARDING_VERSION = 2. Sihirbazdaki cami emojileri v2.6.1'de kaldırıldı.
- README baştan yazıldı (Major.Minor, lyldz, gerçek özellikler, başlıkta uygulama simgesi docs/logo.png).
- Uyarılar: her vakit için "vakit girince" + "vakitten önce"; bildirim sesi telefonun sesi (ezan yok)
- İki dağıtım: github (APK, uygulama içi güncelleme) ve play (AAB, kendini güncelleme yok)
- targetSdk/compileSdk 36 (AGP 8.9.1, Gradle 8.11.1, Kotlin 2.0.21)
- Gizlilik politikası: docs/index.html. GitHub Pages derlemesi çalışıyor (pages-build-deployment başarılı), canlı bağlantı yine de kontrol edilmeli.
- Mağaza metinleri/beyanlar: store/PLAY_STORE.md

## Bu oturumdan dersler
- Cami emojisi (🕌) hiçbir yerde istenmiyor; başlıkta gerçek uygulama simgesi kullan (hafıza: no-mosque-emoji).
- release.sh: sürüm yazılarını (rozetler, Hakkında satırı, app.js currentVersion) üç haneli sürümlerle de güncelliyor (v2.6.3'te düzeltildi). Etiketi artık zorla itmiyor; hatalı etiket varsa yeni sürüm numarasıyla yeniden yayınla (zorla push ve Actions iptali izin sistemince engellenebiliyor).
- Yerelde Gradle çalışmıyor (eklenti çevrimdışı önbellekte yok); Kotlin doğrulaması GitHub Actions derlemesiyle yapılıyor. `gh` oturumu açık (lyldz), push için token gerekmiyor.
- Pusula testi: scratchpad'de playwright betikleri vardı (t.js, m.js, k.js); depoda yok. (tools/ klasörü depoda yok) betiklere benzer şekilde yeniden yazılabilir.

## Seni bekleyen işler
1. Yayınlanmamış (main'de, etiketsiz): eski kod temizliği (984a3dd) ve arka planda güncelleme bildirimi (025921d). Yeni sürüm olarak yayınlamak için release.sh; telefonda önce denenmeli (rozet nokta, "Sonra" 24 saat).
2. GitHub Pages gizlilik politikası canlı (200, doğru başlık). Not: Pages API son iki derlemeyi "errored" gösteriyor ama iş akışı (build/deploy) başarılı; bir sonraki docs/ değişikliğinde tekrar bak.
3. Birleşmiş dallar origin/modern-merge ve origin/target36 silinmeyi bekliyor (main'de olmayan commit yok): `git push origin --delete modern-merge target36`
4. Play Console yükleme/formlar (store/PLAY_STORE.md)
5. TODO.md "Sıradakiler" boş; yeni madde eklenebilir.

## Dosyalar
- Anahtar + şifre: /root/anahtarlar/ ve /root/.tamvakti-keys/ (YEDEKLE, silme/taşıma). GitHub Secrets'ta 4 secret var.
- İkonlar/kaynaklar: tools/icons (A3.svg, play-store-icon-512.png)  [UYARI: tools/ şu an diskte yok; /root/projeler ile birlikte kaybolmuş. docs/logo.png ve android/ simge kaynaklarından yeniden üretilebilir]
- Mağaza görselleri: tools/store (öne çıkan görsel 1024x500 + 5 ekran görüntüsü, make.js)  [UYARI: tools/ şu an diskte yok; /root/projeler ile birlikte kaybolmuş. docs/logo.png ve android/ simge kaynaklarından yeniden üretilebilir]
- Test araçları: tools (shot.js ekranlar, flow.js etkileşim, fit.js kaydırmasız kontrol, place.js bildirim yer adı, audit.js renk, sim.js alarm listesi). Önce playwright-core kurulmalı (hafıza notunda yazılı).  [UYARI: tools/ şu an diskte yok; /root/projeler ile birlikte kaybolmuş. docs/logo.png ve android/ simge kaynaklarından yeniden üretilebilir]
- Push için kayıtlı token yok: yeni token iste, iş bitince iptal ettir. Bu konuşmada yapıştırılan token'ları iptal et.
- Hafıza: /root/.claude/projects/-root-tam-vakti/memory/ (taşındıysa /root/.claude/projects/ altında ara)
