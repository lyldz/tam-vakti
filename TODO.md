# Tam Vakti — Yapılacaklar

Her sabah otomatik görev bu listeden **en üstteki açık (`- [ ]`) maddeyi** yapar,
`[x]` olarak işaretler, tarihini yazar ve `main`'e push eder.
Yeni madde eklemek için "Sıradakiler" altına `- [ ] ...` satırı ekle; sıra = öncelik.
Sürüm/APK yayını istiyorsan maddenin sonuna `[yayın]` yaz.
Bir madde yapılamazsa `- [!]` ile işaretlenir ve altına nedeni yazılır.

## Sıradakiler

- [ ] Kurulum şemasını çıkar: `docs/KURULUM.md` oluştur. Mevcut 5 adımlı sihirbazı (`www/index.html` → `onboardingModal`, `app.js` onboarding fonksiyonları) ve AndroidManifest izinlerini incele. İlk açılış akışını adım adım yaz: Hoş geldin → Konum (GPS izni ya da elle il/ilçe seçimi) → Bildirim izni (Android 13+ POST_NOTIFICATIONS) → Tam zamanlı alarm izni (SCHEDULE_EXACT_ALARM, sistem ayarına yönlendirme) → Pil optimizasyonu muafiyeti (yönlendirme) → Rahatsız etmeyin erişimi (otomatik sessize alma için, ACCESS_NOTIFICATION_POLICY) → Tercihler → Bitir. Her adım için: neden istendiği, izin verilirse/reddedilirse ne olacağı, "Ayarlara git" yönlendirmesi, atlanabilir mi, sonradan Ayarlar'dan nasıl açılacağı. Mermaid akış şeması ekle. Mevcut sihirbazla farkları "Yapılacak değişiklikler" başlığı altında listele. Bu maddede kod değiştirme.
- [ ] Kurulum sihirbazını `docs/KURULUM.md` şemasına göre uygula: eksik adımları ekle, her izin adımında gerçek izin isteğini ve durum rozetini (Verildi / Reddedildi / Ayarlara git) göster, reddedilen izin için sistem ayar sayfasına yönlendir (MainActivity.kt JS köprüsü gerekiyorsa ekle; pil muafiyeti için manifest'e REQUEST_IGNORE_BATTERY_OPTIMIZATIONS ekle). Sihirbaz yalnızca ilk açılışta çıksın, Ayarlar'dan "Kurulumu yeniden başlat" ile tekrar açılabilsin. Arctic koyu temaya uy; açık tema (`dark:` olmayan beyaz/yeşil) sınıflarını bu modalda koyu temaya çevir. `www/` → `android/app/src/main/assets/www/` eşitle.
- [ ] Kullanılmayan eski kodları temizle: `www/` ve `android/` içinde hiçbir yerden çağrılmayan JS fonksiyonları, kullanılmayan CSS sınıfları/dosyaları, referansı olmayan asset'ler, eski ezan sesi/servisi kalıntıları, açık tema ve CalVer artıkları, yorum satırına alınmış ölü kod blokları. Sildiğin her şeyin referansını `grep` ile doğrula; emin olmadığın şeyi silme, commit mesajında listele. `assets/www` kopyasından da sil. `node --check` ile JS'leri kontrol et.
- [ ] README.md'yi güncelle: CalVer anlatımını AGENTS.md'deki Major.Minor şemasına çevir, `USER_OR_ORG` / `KULLANICI_ADINIZ` yerine `lyldz` yaz, tema açıklamasını "Arctic" koyu temaya göre düzelt

## Tamamlananlar

