# Tam Vakti (v2.12.0) — Teknik İnceleme ve İyileştirme Raporu

Uygulamanın sadece namaz vakti, kıble ve imsakiyeye odaklanan sade yaklaşımı kod tabanında da açıkça hissediliyor. Reklamsız, çevrimdışı çalışabilen (fontlar + Tailwind gömülü), izinleri adım adım açıklayan, WebView güvenliği sıkılaştırılmış (dosya erişimi kapalı, indirme alan adı doğrulamalı) ve `www/` ile `assets/www/` kopyaları senkron tutulmuş temiz bir yapı kurulmuş.

Aşağıda **yeni özellik / kalabalık eklemeden**, doğrudan mevcut işleyişin güvenilirliğini, pil dostluğunu ve günlük kullanım hissini iyileştirecek dokunuşları öncelik sırasıyla listeledim.

---

## 1. Kritik — Öncelikle Dokunulması Gerekenler

### 1.1. Aynı dakikadaki alarmlarda iptal yarışı (Bildirim / sessize alma kaçırma riski)
- **Nerede:** [AlarmReceiver.kt](file:///root/tam-vakti/android/app/src/main/java/com/tamvakti/app/AlarmReceiver.kt#L58), [Scheduler.kt](file:///root/tam-vakti/android/app/src/main/java/com/tamvakti/app/Scheduler.kt#L85-L135), [app.js](file:///root/tam-vakti/www/js/app.js#L1676-L1716)
- **Sorun:** Bir vakit girişinde aynı milisaniye (`t`) için birden fazla ayrı alarm kuruluyor: `prayer`, `vakit`, `silent_start` (ve Güneş'te ek olarak `kerahat`). Bunlardan ilk tetiklenen (örneğin `prayer`) çalıştığında `AlarmReceiver` hemen `Scheduler.reschedule(app)` çağırıyor. `reschedule()` önce `cancelAll()` ile tüm kurulu alarmları iptal ediyor, sonra yalnızca `t > now` olanları yeniden kuruyor. O an `now >= t` olduğu için, **aynı dakikada henüz teslim edilmemiş `vakit`, `silent_start` veya `kerahat` alarmları iptal edilip bir daha kurulmayabilir.**
- **Öneri:**
  1. Aynı `t` zamanına düşen olayları tek bir alarmda birleştirin (veya `vakit` varsa ayrıca boş `prayer` olayı üretmeyin).
  2. `Scheduler.reschedule()` her alarmda çalışmak yerine yalnızca kalan kurulu alarm sayısı azaldığında (ör. `< 30` kaldığında) çalışsın. Hem bu yarış durumu ortadan kalkar hem de günde 10–15 kez 120 alarmı silip yeniden kurma yükü biter.

### 1.2. Sabit bildirim (kilit ekranı sayacı) Ayarlar'da yok
- **Nerede:** [app.js](file:///root/tam-vakti/www/js/app.js#L174), [index.html](file:///root/tam-vakti/www/index.html#L513-L605)
- **Sorun:** `app.js` içinde `ongoingNotifToggle` ID'si aranıyor ancak `settingsModal` içinde bu anahtar yok; yalnızca kurulum sihirbazında (`onboardingOngoingToggle`) yer alıyor. Kurulumdan sonra sabit bildirimi açıp kapatmak isteyen kullanıcı Ayarlar'da bu seçeneği bulamıyor.
- **Öneri:** Ayarlar → Bildirim bölümüne "Sabit bildirim (canlı sayaç)" anahtarını (`id="ongoingNotifToggle"`) ekleyin.

### 1.3. Sabit bildirim kapatılsa da 3 dakikalık alarm iptal edilmiyor + pil etkisi
- **Nerede:** [Notifs.kt](file:///root/tam-vakti/android/app/src/main/java/com/tamvakti/app/Notifs.kt#L235-L257), [MainActivity.kt](file:///root/tam-vakti/android/app/src/main/java/com/tamvakti/app/MainActivity.kt#L248-L252)
- **Sorun:** `postOngoing()` ilerleme çubuğunu tazelemek için her 3 dakikada bir `setAndAllowWhileIdle(..., 7771, ...)` kuruyor. Sabit bildirim kapatıldığında bildirim siliniyor ama `7771` kodlu alarm `AlarmManager.cancel()` ile iptal edilmiyor; sonraki tetikte duruyor. Ayrıca ekran kapalıyken bile her 3 dakikada bir `AllowWhileIdle` ile tetiklenmesi Doze modunda gereksiz uyanma yaratır.
- **Öneri:** Kapatma yolunda `7771` PendingIntent'ini açıkça iptal edin; ilerleme çubuğu güncelleme aralığını 10–15 dakikaya çıkarın ve `setAndAllowWhileIdle` yerine `set()` (Doze'a saygılı) kullanın (zaten `Chronometer` saniyeyi sistem tarafından akıtıyor).

### 1.4. Tam ekran bildirim ekranı 30 dakika boyunca açık tutuyor
- **Nerede:** [PrayerAlertActivity.kt](file:///root/tam-vakti/android/app/src/main/java/com/tamvakti/app/PrayerAlertActivity.kt#L89), [L115](file:///root/tam-vakti/android/app/src/main/java/com/tamvakti/app/PrayerAlertActivity.kt#L115)
- **Sorun:** `FLAG_KEEP_SCREEN_ON` bayrağı ve 30 dakikalık `AUTO_CLOSE_MS` birleşince, telefon masadayken veya kullanıcı uyurken (özellikle İmsak vaktinde) ekran yarım saat boyunca sönmeden açık kalır. Bu hem ciddi pil tüketimi hem de OLED ekranlarda yanma riski doğurur.
- **Öneri:** 45–60 saniye sonra `window.clearFlags(FLAG_KEEP_SCREEN_ON)` çağırarak sistemin ekranı normal zaman aşımında kapatmasına izin verin (veya oto-kapanmayı 1–2 dakikaya indirin).

### 1.5. Android geri tuşu modalları ve Kıble sekmesini kapatmak yerine uygulamadan çıkıyor
- **Nerede:** [MainActivity.kt](file:///root/tam-vakti/android/app/src/main/java/com/tamvakti/app/MainActivity.kt#L196-L205)
- **Sorun:** `handleOnBackPressed()` yalnızca `webView.canGoBack()` kontrolü yapıyor. Arayüz tek sayfa olduğu için geçmiş yok; Ayarlar, İmsakiye, Şehir Seçici, Vakit Detayı veya Kıble açıkken geri tuşuna/hareketine basınca uygulama doğrudan kapanıyor.
- **Öneri:** JS tarafında `app.handleBack()` fonksiyonu ekleyip açık modalı (öncelik sırasıyla `choiceSheet` → `locationModal` → `detailModal` → `aboutModal` → `updateFoundModal` → `monthlyModal` → `settingsModal` → `viewQibla`) kapatın; hiçbir şey açık değilse `false` dönüp uygulamadan çıkın.

### 1.6. Yatsı'dan gece yarısına kadar "İmsak'a Kalan" yarının değil bugünün imsağını kullanıyor
- **Nerede:** [app.js](file:///root/tam-vakti/www/js/app.js#L653)
- **Sorun:** `new Date(tImsak.getTime() + 86400000)` ile bugünün imsak saatine 24 saat ekleniyor. Bahar/sonbahar aylarında imsak günde 2–3 dakika kaydığı için Yatsı sonrası ana ekrandaki geri sayım ile widget'lardaki (30 günlük gerçek listeden okuyan) geri sayım arasında 1–3 dakika fark oluşuyor.
- **Öneri:** `updatePrayers()` sırasında ertesi günün imsak vaktini de (çevrimdışı hesap veya önbellekten anlık) alıp `this.tomorrowImsak` olarak saklayın; Yatsı sonrasında hedefi buna bağlayın.

---

## 2. Önemli İyileştirmeler — Akıcılık, Dayanıklılık ve Kenar Durumlar

### 2.1. Zayıf internette açılış beklemesi (Timeout eksikliği + offline-first sırası)
- **Nerede:** [prayer-engine.js](file:///root/tam-vakti/www/js/prayer-engine.js#L286), [L347](file:///root/tam-vakti/www/js/prayer-engine.js#L347), [app.js](file:///root/tam-vakti/www/js/app.js#L2104)
- **Sorun:** `getPrayerTimes()` önce `offlineTimes` hesaplıyor ama `await fetch(url)` yanıtı gelene kadar (timeout olmadan) bekliyor. Zayıf/donuk mobil bağlantıda ana ekran uzun süre bekleyebilir.
- **Öneri:** Tüm `fetch` çağrılarına `AbortController` ile 3–4 saniyelik zaman aşımı ekleyin. Önbellekte veri yoksa açılışta önce `offlineTimes` ile ekranı anında çizin, API yanıtı gelirse arka planda güncelleyin.

### 2.2. `localStorage` önbelleğinin sınırsız büyümesi
- **Nerede:** [prayer-engine.js](file:///root/tam-vakti/www/js/prayer-engine.js#L266), [L303](file:///root/tam-vakti/www/js/prayer-engine.js#L303), [L317](file:///root/tam-vakti/www/js/prayer-engine.js#L317)
- **Sorun:** Günlük (`tamvakti_v2_...`) ve aylık (`tamvakti_monthly_v2_...`) önbellek kayıtları hiç silinmiyor. Uzun süreli kullanımda (özellikle otomatik konum açıkken farklı ilçeler gezildikçe) `localStorage` kotası dolup yeni ayarların kaydedilmesini sessizce bozabilir.
- **Öneri:** Uygulama açılışında 45 günden eski günlük kayıtları ve 3 aydan eski aylık kayıtları temizleyen küçük bir bakım fonksiyonu ekleyin.

### 2.3. Her öne gelişte (`onAppResume`) tüm 30 günlük alarmların yeniden kurulması
- **Nerede:** [MainActivity.kt](file:///root/tam-vakti/android/app/src/main/java/com/tamvakti/app/MainActivity.kt#L364-L370), [app.js](file:///root/tam-vakti/www/js/app.js#L608-L617)
- **Sorun:** Kullanıcı uygulamadan çıkıp birkaç saniye sonra geri döndüğünde `onAppResume()` → `updatePrayers()` → `scheduleSync()` zinciri çalışıp 120 alarmı iptal edip baştan kuruyor.
- **Öneri:** Gün değişmediyse ve vakitler zaten yüklüyse `onAppResume()` içinde sadece `evaluateCurrentPrayer()` + `refreshPermissionStatus()` çalıştırın; `scheduleSync()` yalnızca gün döndüğünde veya ayar/konum değiştiğinde tetiklensin.

### 2.4. Saat dilimi varsayımı (`tz = 3.0`) ve yurt dışı otomatik konum
- **Nerede:** [prayer-engine.js](file:///root/tam-vakti/www/js/prayer-engine.js#L115), [L146](file:///root/tam-vakti/www/js/prayer-engine.js#L146), [app.js](file:///root/tam-vakti/www/js/app.js#L1287-L1295)
- **Sorun:**
  - `getSunPositionNow` ve `calculateQiblaHour` varsayılan `tz = 3.0` ile çağrılıyor. Türkiye dışına çıkıldığında güneş yolu yayı ve "Günün Kıble Saati" yanlış saati gösterir (`-date.getTimezoneOffset() / 60` kullanılmalı).
  - `checkAutoLocation()` koordinat ne olursa olsun `TURKEY_CITIES` içinden en yakın ilçeyi seçiyor. Kullanıcı yurt dışındayken otomatik konum açıksa vakitler Türkiye'deki en yakın sınır ilçesine kayabilir. Türkiye sınır kutusu dışındayken `TURKEY_CITIES` eşleştirmesi yapılmamalı.

### 2.5. Uygulama içi APK kurulumunda "Bilinmeyen kaynaklar" izin akışı
- **Nerede:** [MainActivity.kt](file:///root/tam-vakti/android/app/src/main/java/com/tamvakti/app/MainActivity.kt#L983-L1002)
- **Sorun:** `canRequestPackageInstalls()` `false` ise sistem ayar ekranı açılıyor ama hemen ardından `return` edilmeden `startActivity(installIntent)` de çağrılıyor; iki ekran çakışıyor.
- **Öneri:** İzin yoksa ayar ekranını açıp `return` edin; indirilen APK yolunu saklayıp `onResume()` içinde izin verilmişse kurulumu otomatik başlatın.

---

## 3. Küçük Cilalar ve Kod Temizliği

- **Ayarlar yerleşimi:** "Konumu otomatik güncelle" anahtarı [index.html](file:///root/tam-vakti/www/index.html#L565-L577) içinde **Bildirim** grubunun altında kalmış; **Konum** grubuna taşınmalı. Ayrıca konum izni kapalıyken açılırsa sessizce başarısız olmak yerine kullanıcıya bilgi/izin istemi göstermeli.
- **Ayarlar ikonları ve kontrast:** "Tam ekran bildirim" satırında Kerahat'ın ünlem ikonu tekrarlanmış (`index.html:593`). "Hakkında" penceresindeki "Denetle" düğmesi (`text-sky-700`, `index.html:838`) koyu zeminde düşük kontrastlı; `text-sky-400` daha okunaklı olur.
- **Ses önizleme temizliği:** `MainActivity.onPause()` içinde `Notifs.stopTone()` çağrılmıyor; kullanıcı ton dinlerken uygulamadan çıkarsa ses çalmaya devam eder.
- **Mükerrer CSS keyframe:** [style.css](file:///root/tam-vakti/www/css/style.css#L23-L30) ve [L208-L217](file:///root/tam-vakti/www/css/style.css#L208-L217) içinde `@keyframes pulse-subtle` iki kez tanımlı (ikincisi ilkini eziyor).
- **Changelog HTML hijyeni:** [app.js](file:///root/tam-vakti/www/js/app.js#L1989) `formatChangelog()` metni doğrudan `innerHTML` ile basıyor; öncesinde `<`, `>`, `&` karakterlerini kaçırmak (escape) iyi bir savunma alışkanlığı olur.
- **Release R8 / küçültme:** [build.gradle.kts](file:///root/tam-vakti/android/app/build.gradle.kts#L67) `isMinifyEnabled = false`. İleride APK boyutunu küçültmek için `@JavascriptInterface` metodlarına ProGuard keep kuralı ekleyerek R8 açılabilir.
