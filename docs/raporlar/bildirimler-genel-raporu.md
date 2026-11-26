# Aşama 8 — Bildirimler ve Otomatik Sessize Alma İnceleme Raporu

> [!NOTE]
> Bu rapor yalnızca inceleme ve öneri çalışmasıdır. **Onayınız olmadan hiçbir kod değişikliği yapılmamıştır.**

Tüm bildirim ve sessize alma katmanını ([Notifs.kt](file:///root/tam-vakti/android/app/src/main/java/com/tamvakti/app/Notifs.kt), [AlarmReceiver.kt](file:///root/tam-vakti/android/app/src/main/java/com/tamvakti/app/AlarmReceiver.kt), [Scheduler.kt](file:///root/tam-vakti/android/app/src/main/java/com/tamvakti/app/Scheduler.kt), [Silencer.kt](file:///root/tam-vakti/android/app/src/main/java/com/tamvakti/app/Silencer.kt), [notif_ongoing.xml](file:///root/tam-vakti/android/app/src/main/res/layout/notif_ongoing.xml)) inceledim. Önceki aşamalarda alarm çakışması, tam ekran sadeleştirmesi ve durum simgesini çözmüştük; kalan **6 gerçek iyileştirme** aşağıda:

---

## 1. Kritik ve Önemli İyileştirmeler

### 1.1. Eski bildirimlerin üst üste yığılmasını önlemek (Bildirim hijyeni)
- **Nerede:** [Scheduler.kt](file:///root/tam-vakti/android/app/src/main/java/com/tamvakti/app/Scheduler.kt#L120), [AlarmReceiver.kt](file:///root/tam-vakti/android/app/src/main/java/com/tamvakti/app/AlarmReceiver.kt#L32-L49)
- **Sorun:** Her alarma farklı ID (`5000..5119`) verildiği için telefon gün boyu elinize alınmadığında bildirim çubuğunda **8–13 adet eski Tam Vakti bildirimi** alt alta birikiyor (ör. saat 16:00'da hâlâ "Sabah vaktine 15 dk kaldı" duruyor).
- **Öneri:** Tür bazlı sabit bildirim kimliği kullanılsın:
  - `vakit` → `3001` (yeni vakit girince eski vaktin bildirimi yerini yenisine bırakır)
  - `reminder` → `3002` (ayrıca **vakit girdiğinde** o vaktin eski hatırlatma bildirimi `nm.cancel(3002)` ile otomatik silinir!)
  - `kerahat` → `3003`

### 1.2. Sabit bildirimde açık tema kontrast düzeltmesi + vakit geçiş zamanlaması
- **Nerede:** [notif_ongoing.xml](file:///root/tam-vakti/android/app/src/main/res/layout/notif_ongoing.xml#L21), [Notifs.kt](file:///root/tam-vakti/android/app/src/main/java/com/tamvakti/app/Notifs.kt#L249-L263)
- **Sorun:**
  1. `v2.13.4`'te tam ekran bildirimi daima koyu yaptığımızda `alert_accent` açık kaynakta da `#38BDF8` oldu; `notif_ongoing.xml` bu rengi paylaştığı için **açık temalı bildirim çekmecesinde** geçen vakit yazısı biraz soluk kalır.
  2. `scheduleTick()` sabit 10 dk kuruyor; sıradaki vakte 4 dk kalmışsa 10 dk bekleyip sayaç geç yenilenebilir.
- **Öneri:**
  - Sabit bildirim için ayrı `notif_accent` rengi tanımlansın (açık temada `#0369A1`, koyu temada `#38BDF8`) ve kronometrelere `monospace` eklensin.
  - `scheduleTick()` bir sonraki yenilemeyi `minOf(10 dk, kalan süre + 2 sn)` olarak kursun.

### 1.3. `setLargeIcon()` bellek optimizasyonu (4 MB → 64 KB)
- **Nerede:** [Notifs.kt](file:///root/tam-vakti/android/app/src/main/java/com/tamvakti/app/Notifs.kt#L156-L163)
- **Sorun:** `logo_full.png` `1024×1024` çözünürlükte (~4 MB ham Bitmap). Bildirim ikonu olarak ham boyutta verilmesi gereksiz bellek ve IPC yükü oluşturur.
- **Öneri:** `128×128` ölçekli hafif Bitmap (~64 KB) üretilip önbelleklensin.

### 1.4. Namaz esnasında telefon yeniden başlarsa titreşimde takılı kalma önlemi
- **Nerede:** [Silencer.kt](file:///root/tam-vakti/android/app/src/main/java/com/tamvakti/app/Silencer.kt), [Scheduler.kt](file:///root/tam-vakti/android/app/src/main/java/com/tamvakti/app/Scheduler.kt#L138)
- **Sorun:** Namazda sessize alınmışken telefon yeniden başlarsa ve `silent_end` süresi bu sırada geçmişse, ertesi günün `silent_end` olayları listede olduğu için `hasSilentEnd` yine `true` döner ve telefon bir sonraki vakte kadar titreşimde kalabilir.
- **Öneri:** `Silencer.start()` sırasında bitiş zamanı (`silent_until`) saklansın; `reschedule()` / `BootReceiver` çalıştığında bu süre dolmuşsa `Silencer.end()` telefonu hemen normal sese döndürsün.

### 1.5. Kullanılmayan eski ton kanallarının temizlenmesi
- **Nerede:** [Notifs.kt](file:///root/tam-vakti/android/app/src/main/java/com/tamvakti/app/Notifs.kt#L82-L106)
- **Sorun:** Kullanıcı birkaç kez farklı bildirim sesi seçtiğinde Android Sistem Ayarları → Bildirim Kanalları listesinde artık kullanılmayan eski `tamvakti_alert_<eski_ton>` kanalları birikiyor.
- **Öneri:** Aktif ton kanalı oluşturulurken diğer kullanılmayan `tamvakti_alert_*` kanalları otomatik silinsin (yalnızca seçili sesin kanalı kalsın).

---

## 2. Geri Dönüş Güvencesi
- Tüm 5 madde **tek izole commit** olarak uygulanacak ve `tamvakti.md` içine kaydedilecek. Beğenilmeyen bir durum olursa tek `git revert` ile anında geri alınabilir.
