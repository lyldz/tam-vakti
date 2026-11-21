# Tam Vakti — Geliştirme ve İyileştirme Günlüğü

Bu dosya, Tam Vakti uygulamasında yapılan her aşamayı, alınan tasarım kararlarını ve geri dönüş noktalarını kayıt altına alır.

- **Başlangıç (referans kararlı sürüm):** `v2.12.0` (`8d62231`, İşa)
- **Ürün ilkesi:** Yalnızca namaz vakti, kıble ve imsakiyeye odaklanan, reklamsız, çevrimdışı çalışabilen sade uygulama.

---

## Aşama 1 — Güvenilirlik, Pil ve Kullanım Düzeltmeleri (2026-11-21)

**Durum:** Tamamlandı ve **`v2.12.1` İşa** (`versionCode`: 23200) olarak GitHub Release yayınlandı.

### 1.1. Kritik Düzeltmeler
- [x] **Aynı dakikadaki alarm iptal yarışı giderildi:**
  - `www/js/app.js` (`syncNativeSchedule`): Vaktinde bildirim (`vakit`) kuruluysa aynı milisaniyeye ayrıca boş `prayer` olayı eklenmiyor.
  - `android/app/src/main/java/com/tamvakti/app/Scheduler.kt`: `rescheduleIfNeeded()` eklendi; her alarmda tüm 120 alarmı silip baştan kurmak yerine kalan kurulu alarm sayısı `<= 30` olunca pencere yenileniyor.
  - `android/app/src/main/java/com/tamvakti/app/AlarmReceiver.kt`: `Scheduler.reschedule()` yerine `Scheduler.rescheduleIfNeeded()` çağrılıyor; aynı dakikadaki `vakit` + `silent_start` + `kerahat` alarmları artık birbirini iptal etmiyor.
- [x] **Sabit bildirim (canlı sayaç) Ayarlar'a eklendi:**
  - `www/index.html` & `www/js/app.js`: Ayarlar → Bildirim altına `ongoingNotifToggle` anahtarı eklendi ve `openSettingsModal()` içinde durumu senkronize edildi.
- [x] **Sabit bildirim kapatılınca `ongoing_tick` alarmı iptal ediliyor (pil iyileştirmesi):**
  - `android/app/src/main/java/com/tamvakti/app/Notifs.kt`: `cancelTick()` ve `cancelOngoing()` eklendi; ilerleme çubuğu tazeleme alarmı 3 dk `setAndAllowWhileIdle` yerine 10 dk Doze dostu `set(RTC)` yapıldı.
  - `android/app/src/main/java/com/tamvakti/app/MainActivity.kt`: `cancelOngoingPrayerNotification()` artık `Notifs.cancelOngoing(this)` çağırıyor.
- [x] **Tam ekran bildirimde ekran açık tutma süresi güvenli hale getirildi:**
  - `android/app/src/main/java/com/tamvakti/app/PrayerAlertActivity.kt`: `FLAG_KEEP_SCREEN_ON` 60 saniye sonra kaldırılıyor; otomatik kapanma 30 dakikadan 5 dakikaya indirildi (pil ve OLED koruması).
- [x] **Android fiziksel geri tuşu modalları ve Kıble sekmesini kapatıyor:**
  - `www/js/app.js`: `handleBack()` eklendi (`choiceSheet` → `locationModal` → `detailModal` → `aboutModal` → `updateFoundModal` → `monthlyModal` → `settingsModal` → `viewQibla`).
  - `android/app/src/main/java/com/tamvakti/app/MainActivity.kt`: Geri tuşu önce `app.handleBack()` soruyor; yalnızca ana ekrandaysa uygulamadan çıkıyor.
- [x] **Yatsı sonrası "İmsak'a Kalan" yarının gerçek İmsak saatini kullanıyor:**
  - `www/js/app.js`: `updatePrayers()` içinde ertesi günün imsak saati (`tomorrowImsak`) hesaplanıp `evaluateCurrentPrayer()` içinde kullanılıyor (ana ekran ile widget'lar arasında 1–3 dk fark kalmadı).

### 1.2. Önemli İyileştirmeler
- [x] **Zayıf internette anlık açılış + ağ zaman aşımı:**
  - `www/js/prayer-engine.js`: `_fetchWithTimeout()` (4–5 sn), `getCachedPrayerTimes()` eklendi.
  - `www/js/app.js`: Önbellek yoksa önce çevrimdışı hesapla ekran anında çiziliyor, ardından API yanıtı gelince sessizce güncelleniyor. GitHub güncelleme kontrolüne 5 sn timeout eklendi.
- [x] **`localStorage` önbellek temizliği:**
  - `www/js/prayer-engine.js`: `pruneCache()` eklendi; açılışta 45 günden eski günlük ve 3 aydan eski aylık kayıtlar temizleniyor.
- [x] **`onAppResume()` gereksiz yeniden senkronizasyonu önlendi:**
  - `www/js/app.js`: Gün değişmediyse ve vakitler zaten yüklüyse öne gelişte 120 alarm yeniden kurulmuyor; yalnızca sayaç ve güneş yayı tazeleniyor.
- [x] **Saat dilimi ve yurt dışı otomatik konum koruması:**
  - `www/js/prayer-engine.js`: `getSunPositionNow()` ve `calculateQiblaHour()` varsayılan `tz = 3.0` yerine cihaz saat dilimini (`-date.getTimezoneOffset() / 60`) alıyor.
  - `www/js/app.js`: `checkAutoLocation()` Türkiye + KKTC sınırları dışındayken `TURKEY_CITIES` eşleştirmesini atlıyor.
- [x] **APK kurulumunda "Bilinmeyen kaynaklar" izin akışı düzeltildi:**
  - `android/app/src/main/java/com/tamvakti/app/MainActivity.kt`: İzin yoksa ayar ekranı açılıp `return` ediliyor; `pendingInstallApk` saklanarak izin dönüşünde (`onResume`) kurulum otomatik başlatılıyor.

### 1.3. Küçük Cilalar ve Arayüz Düzeltmeleri
- [x] **İlerleme kartındaki `Öğle 12:51` sağ kenar taşması giderildi** (`www/index.html`).
- [x] **"Konumu otomatik güncelle"** anahtarı Bildirim bölümünden **Konum** bölümüne taşındı; konum izni kapalıysa açılırken bilgi veriliyor (`www/index.html`, `www/js/app.js`).
- [x] **"Tam ekran bildirim"** ikonu düzeltildi; Hakkında → **"Denetle"** düğmesinin koyu zemin kontrastı (`text-sky-400`) iyileştirildi (`www/index.html`).
- [x] **`MainActivity.onPause()` / `onDestroy()`** içinde `Notifs.stopTone()` ve `webView.destroy()` çağrıları eklendi.
- [x] **`www/css/style.css`** içindeki mükerrer `@keyframes pulse-subtle` tanımı temizlendi.
- [x] **`formatChangelog()`** HTML kaçış (escape) koruması eklendi (`www/js/app.js`).
- [x] **`www/` → `android/app/src/main/assets/www/`** eşitlendi ve `node --check` doğrulandı.
- [x] **Üst tarih rozeti taşma düzeltmesi (2026-11-21):** Uzun ilçe adlarında (`Bolvadin` vb.) tarih kutusunun 4 satıra kırılıp `rounded-full` nedeniyle daireye dönüşmesi ve `Cemaziyelahir` yazısının kenardan taşması giderildi (`rounded-2xl`, `whitespace-nowrap truncate`, şehir rozetine `max-w-[40%] truncate` ve kıble açısı eşiği `410px`).

---

## Aşama 2 — Sade / Odak ↔ Detay Ana Ekran Arayüzü (Planlanan — Sonraki Sürüm)

**Durum:** Planlandı (kullanıcı kararları alındı; Aşama 1 yayınlandıktan sonra ayrı sürümde yapılacak, ör. `v2.13.0 Seher`).

### Alınan Tasarım Kararları
1. **Güneş yolu yayı:** Şimdilik kalsın; gerekirse sonraki değerlendirmede yalnızca Detay kısmına alınabilir.
2. **İlk açılış ve yönlendirme:** İlk açılışta **Detay** görünümü açık gelsin; ekranda tek seferlik sade bir not/ipucu ile ekran alt orta kısımdan **Sade ↔ Detay** geçişi gösterilsin.
3. **Kalıcı hafıza:** Kullanıcı alt orta kısma dokunup hangi görünümde bırakırsa (`sade` veya `detay`) son hali kalıcı olarak (`localStorage`: `tamvakti_home_mode`) saklansın.
4. **Güvenli geri dönüş:** Mevcut Detay düzeni tahribatsız (`data-mode="focus|detail"`) korunacak; izole dal/commit ile geliştirilip beğenilmezse tek `git revert` ile veri kaybı olmadan geri alınabilecek.
