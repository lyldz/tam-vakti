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

## Aşama 2 — Sade / Odak ↔ Detay Ana Ekran Arayüzü (2026-11-21)

**Durum:** Tamamlandı ve **`v2.13.0` Seher** (`versionCode`: 23300) olarak GitHub Release yayınlandı.

### Uygulanan Tasarım ve Kararlar
- [x] **Güneş yolu yayı korundu:** Hem Sade hem Detay görünümünde güneş yolu yayı görünür kalır (istenirse ileride yalnızca Detay moduna alınabilir).
- [x] **İlk açılış Detay + tek seferlik ipucu:** İlk açılışta mevcut Detay görünümü açılır (`tamvakti_home_mode` varsayılan `"detail"`). Alt orta düğmenin hemen üzerinde tek seferlik bir not (`✨ Alt ortaya dokunarak Sade / Detay arasında geçebilirsiniz`) gösterilir; ilk dokunuşta veya kapatılınca bir daha çıkmaz (`tamvakti_home_mode_hint_seen`).
- [x] **Tek dokunuş ve kalıcı hafıza:** Ekranın alt orta kısmındaki düğmeyle (`Sade görünüm` ↔ `Tüm vakitler & detay`) tek dokunuşta geçiş yapılır; kullanıcının bıraktığı son görünüm `localStorage` (`tamvakti_home_mode`) içinde kalıcı saklanır.
- [x] **Sade / Odak görünümü:** İlerleme kartı (`#horizonCard`) ve 6 vakit kutusu (`#dayTimesRibbon`) gizlenir; sayaç büyür, alt başlıkta sıradaki vaktin saati (`Öğle'ye Kalan · 12:51`), ince bir ilerleme çizgisi ve yalnızca kerahat varken tek satır kerahat hapı gösterilir.
- [x] **Ayarlar'da görünüm seçeneği:** Ayarlar → Uygulama altına *"Ana ekran görünümü (Detay / Sade)"* satırı eklendi.
- [x] **Güvenli geri dönüş:** Mevcut Detay düzeni silinmeden `data-mode="focus|detail"` üzerinden korundu; tüm Aşama 2 değişikliği izole tek commit olarak gönderildi (beğenilmezse tek `git revert` ile veri kaybı olmadan geri alınabilir).

---

## Aşama 3 — Detay Ekranı Nokta Temizliği (2026-11-21)

**Durum:** Tamamlandı ve **`v2.13.1` Seher** (`versionCode`: 23400) olarak GitHub Release yayınlandı.

- [x] **3×2 vakit kutuları (Seçenek A):** Her vaktin yanındaki parlak mavi noktalar kaldırıldı; vakit adları tam ortalandı. Yalnızca uyarısı **kapalı** olan vakitlerde kutunun sağ üst köşesinde soluk, ince bir kapalı zil SVG ikonu gösteriliyor (`www/js/app.js`).
- [x] **`Geçen süre` satırı:** Başındaki gereksiz gri nokta kaldırıldı (`www/index.html`).
- [x] **`www/` → `android/app/src/main/assets/www/`** eşitlendi ve `node --check` doğrulandı.

---

## Aşama 4 — Dinamik Parlaklıklı Atmosferik Güneş Yayı (2026-11-21)

**Durum:** Tamamlandı ve **`v2.13.2` Seher** (`versionCode`: 23500) olarak GitHub Release yayınlandı.

- [x] **Vakte göre dinamik güneş parıltısı:** Gündüzleri güneş yüksekliğine bağlı olarak sabah yumuşak başlar, **Öğle** tepe noktasında maksimum atmosferik parlaklığa ulaşır, **Akşam**a doğru yavaşça azalır (`sunAtmos` + `sunCorona` + çekirdek, `www/index.html`, `www/js/app.js`).
- [x] **Gece hilal parıltısı:** **Yatsı** civarında en parlak gümüşi-camgöbeği parıltıda olur, güneş doğuşuna yaklaştıkça kademeli olarak sönümlenir (`moonAtmos`).
- [x] **Atmosferik gündüz dolgusu ve ufuk ışıltısı:** Geçen gündüz yayının altına hafif gün ışığı dolgusu (`#arcDayFill`), yay arkasına yumuşak parıltı (`#arcPassedGlow`) ve ışıklı ufuk çizgisi (`#arcHorizon`) eklendi.
- [x] **Etiket çakışma düzeltmesi:** `Öğle` etiketi yukarı (`dy: -36`) alınarak güneş tepe noktasındayken `12:47` yazısıyla çakışması önlendi.
- [x] **Sade mod dikey dengesi:** `#solarTransitContainer` dikey ritmi dengelendi (`www/css/style.css`).

---

## Sıradaki Çalışma Planı (Her Aşama İzole Commit + Geri Dönüş Güvenceli)
- [x] **Aşama 5 — Kıble Pusulası (2026-11-21, `v2.13.3` Seher, `versionCode`: 23600):**
  - Akıllı kalibrasyon (Yüksek doğrulukta ~1,5 sn hızlı geçiş, Orta'da 3 sn / 360°, Düşük'te tam 8 çizme; "Atla" 8 sn).
  - Kıble sekmesinde `FLAG_KEEP_SCREEN_ON` (çıkınca otomatik temizlenir).
  - Üst rozette canlı doğruluk göstergesi (`Yüksek / Orta / Düşük doğruluk`) ve dokununca manuel yeniden kalibrasyon (`recalibrate()`).
  - Çifte EMA gecikmesi dengelendi (`MainActivity` `0.35`, `compass.js` `65 ms`).
  - Kıble saati yoksa `"Bugün yok"` yazısı ve `±4°` hizalanmada Kâbe simgesine altın parıltı eklendi.
- [x] **Ara Aşama — Tam Ekran Bildirim, Kayan Bildirim ve Durum Simgesi (2026-11-21, `v2.13.4` Seher, `versionCode`: 23700):**
  - Tam ekran bildirim (`activity_prayer_alert.xml`, `PrayerAlertActivity.kt`, `values/colors.xml`): rekât kartı ve tekrar satırı kaldırıldı, daima Arctic koyu tema, 76dp logo + konum + dev saat + tek satır sıradaki vakit.
  - Kayan bildirim (`Notifs.kt`, `AlarmReceiver.kt`): sağda renkli `logo_full` (`setLargeIcon`), üstte şehir (`setSubText`), gövdede `"saat · Sıradaki: ..."`.
  - Durum çubuğu ve tek renk simge (`ic_stat_tamvakti.xml`, `ic_launcher_monochrome.xml`): güneş–yay–ufuk arası net boşluklu yeni çizim.
- [x] **Ara Aşama 2 — Ayarlar Ekranı Sadeleştirme (2026-11-21):**
  - 22 satırlık uzun liste hiçbir özellik silinmeden 4 grup altında 13 satıra indirildi (`Konum ve Vakit`, `Bildirimler`, `Görünüm ve Sistem`, `Uygulama`).
  - `Vakit bildirimi` (Sesli/Sessiz) ve `Bildirim sesi` tek `Bildirim sesi` satırında birleştirildi (`Sessiz` en üstte).
  - `Hesaplama yöntemi` ve `İhtiyat` tek `Hesaplama ve ihtiyat` satırında toplandı.
  - 5 satırlık `İzinler` bloğu akıllı özet satıra (`✓ Tümü hazır` / `N izin eksik`, dokununca açılır) dönüştürüldü.
  - 4 test/bakım düğmesi tek `Test ve sorun giderme` alt penceresinde toplandı.
- [x] **Ara Aşama 3 — Modern 2 Adımlı Şehir ve İlçe Seçimi (2026-11-21, `v2.13.5` Seher, `versionCode`: 23800):**
  - Ayarlar sadeleştirmesi + yeni Arctic 2 adımlı konum seçici (`#locationModal`: Adım 1 plaka+il 2 sütunlu kartlar → Adım 2 ilçe kartları, canlı arama, son seçilen 3 yer hapı, geri tuşu Adım 2 → Adım 1 desteği; yurt dışı Google Play aşamasına bırakıldı) `v2.13.5` olarak yayınlandı.
- [x] **Aşama 6 — Logo Ufuk Cilası ve Aylık İmsakiye İyileştirmeleri (2026-11-21, `v2.13.6` Seher, `versionCode`: 23900):**
  - Logo ufuk çizgisi yayın tam tabanına (`y=78`) hizalandı (`A3.svg`, `logo.svg`, `ic_launcher_foreground.xml`, `logo_full.png`, `mipmap-*`, `play-store-icon-512.png`, `docs/logo.png`).
  - Aylık İmsakiye: çift Hicri ay aralığı başlığı, gün sütununda kısa Hicri tarih, `_monthlySeq` hızlı ay değiştirme koruması, bugünkü sıradaki vakit vurgusu, ihtiyat notu ve sadeleştirilmiş üst bar.
- [x] **Aşama 7 — Ana Ekran Widget'ları İyileştirmeleri (2026-11-21, `v2.13.7` Seher, `versionCode`: 24000):**
  - Sıradaki vakit sınırına (`+2 sn`) hafif widget tazeleme alarmı (`scheduleNextBoundary`) eklendi (Chronometer eksiye düşmez); aktif widget yoksa alarm kurulmaz.
  - Tüm 7 widget'ta `Chronometer` ve vakit saatleri `monospace` yapıldı; `widget_bg.xml`'e 1dp Arctic camgöbeği çerçeve eklendi.
  - `LargeWidget`: Yatsı sonrası `"• Yarın"` ve kerahat anında `"• Kerahat"` notu; `PrayerWidget`: Cuma günü `"Cuma"` tutarlılığı.
- [x] **Aşama 8 — Bildirimler ve Otomatik Sessize Alma (2026-11-21, `v2.13.8` Seher, `versionCode`: 24100):**
  - Tür bazlı sabit bildirim ID'leri (`3001/3002/3003`) ile bildirim yığılması önlendi; vakit girince eski hatırlatma otomatik temizlenir.
  - Sabit bildirimde açık/koyu tema uyumlu `notif_accent`, `monospace` kronometre ve vakit sınırına tam yenileme (`min(10 dk, kalan + 2 sn)`).
  - `setLargeIcon` 128×128 (`inSampleSize = 8`) hafif Bitmap; kullanılmayan eski `tamvakti_alert_*` kanalları otomatik silinir.
  - `Silencer.endIfExpired()` ile yeniden başlatmada titreşimde takılı kalma önlendi.

- [x] **Ara Düzeltme — Güncelleme İptal Sonrası Yeniden Kurulum/İndirme Kilidi (2026-11-21, `v2.13.9` Seher, `versionCode`: 24200):**
  - `www/js/app.js`: İndirme %100'e ulaşıp paket yükleyici açıldığında `isDownloadingUpdate` sıfırlanıyor, `onAppResume()` ve 2.5 sn yedek zamanlayıcı ile `resetUpdateDownloadUI()` çağrılarak düğmeler yeniden tıklanabilir hale geliyor ("Kur" / "Kurulumu Başlat").
  - `MainActivity.kt`: Aynı oturumda zaten indirilmiş APK önbellekte duruyorsa (`downloadedApkUrl`) tekrar indirme yapmadan doğrudan paket yükleyiciyi açıyor; eşzamanlı indirme kilidi (`isApkDownloading`), eksik dosya kontrolü ve bilinmeyen kaynak izni iptalinde `pendingInstallApk` temizliği eklendi.
  - Gerçek cihazda `v2.13.9` sorunsuz kuruldu (Play Protect uyarısı vermedi).

## Kaldığımız Yer (Sonraki Oturum İçin)
- **Güncel yayınlanan sürüm:** `v2.13.10` ("Seher", `versionCode: 24300`, `main` temiz ve `origin/main` ile eşit).
- **Tamamlanan inceleme ve iyileştirmeler:** Ana ekran Sade/Detay modu, güneş yayı, kıble pusulası, bildirim/tam ekran/simgeler, Ayarlar sadeleştirme, 2 adımlı şehir seçici, logo ufuk cilası, aylık imsakiye, widget'lar, bildirim hijyeni & otomatik sessiz, güncelleme iptal kilidi, eski bildirimlerin otomatik temizlenmesi, yeni GPS konum kartı ve kararlılık düzeltmeleri (`Scheduler` `@Synchronized`, `MainActivity` akış/bağlantı güvenliği, `compass.js`).
- **Google Play aşamasına bırakılanlar:** Yurt dışı konum seçimi, Play (`play` flavor) AAB yayın hazırlığı.

## Yapılacak / Düzeltilecek Listesi (Hatırlatılacak)
- [x] **GPS ile konum bulunduğunda gösterilen bildirim/toast tasarımı (2026-11-24):**
  - `#gpsLocationBanner` eklendi: kırmızı toplu iğne yerine nabızlı camgöbeği halka içinde yerel GPS hedef SVG simgesi, 2 satırlı net tipografi (`GPS KONUMU BULUNDU` / `KONUM GÜNCELLENDİ` + `İl · İlçe`) ve 3,2 sn sonunda ekrandan yumuşakça silinerek (`gps-dissolve`, opacity + blur) kaybolma animasyonu.
- [x] **Eski bildirimlerin (özellikle kerahat / vakit bildirimlerinin) otomatik silinmemesi (2026-11-24):**
  - `Notifs.postAlert()` içine Android yerel `setTimeoutAfter(timeoutMs)` desteği eklendi.
  - `AlarmReceiver.kt`: Kerahat bildirimine `45 dk` zaman aşımı + yeni vakit girdiğinde anında `cancelAlert(ID_ALERT_KERAHAT)`; vakit öncesi hatırlatmaya sıradaki vakte kalan süre kadar zaman aşımı; vakit girişi bildirimine `60 dk` zaman aşımı eklendi.
