# Aşama 5 — Kıble Pusulası İnceleme ve İyileştirme Raporu

> [!NOTE]
> Bu rapor yalnızca inceleme ve öneri çalışmasıdır. **Onayınız olmadan Kıble pusulası kodunda hiçbir değişiklik yapılmamıştır.**

Mevcut Kıble pusulasının altyapısı oldukça sağlam: `TYPE_ROTATION_VECTOR` öncelikli, `GeomagneticField` ile gerçek kuzey (manyetik sapma) düzeltmeli, `requestAnimationFrame` + açısal sarmalı (`wrap180`) akıcı dönüşlü, hizalanınca histerezisli titreşimli ve sekme kapanınca sensörü durduran pil dostu bir yapısı var ([MainActivity.kt](file:///root/tam-vakti/android/app/src/main/java/com/tamvakti/app/MainActivity.kt#L287-L520), [compass.js](file:///root/tam-vakti/www/js/compass.js)).

Günlük kullanımda ve doğruluk hissinde fark yaratacak **6 somut iyileştirme** öne çıkıyor:

---

## 1. Öncelikli İyileştirmeler

### 1.1. Kalibrasyon süresi: Doğruluk zaten "Yüksek" ise 6 sn + 720° zorunluluğunu yumuşatmak
- **Nerede:** [compass.js](file:///root/tam-vakti/www/js/compass.js#L12-L13), [L372-L384](file:///root/tam-vakti/www/js/compass.js#L372-L384)
- **Mevcut durum:** Kıble sekmesi her açıldığında sensör doğruluğu zaten `3 (Yüksek)` olsa bile kullanıcıdan **en az 6 saniye + 720° 8 çizme hareketi** istiyor ve "Atla" düğmesi 15 saniye sonra çıkıyor.
- **Öneri:**
  - Sensör doğruluğu **Yüksek (`3`)** geldiğinde 1,5 saniye kararlı kalınca pusulayı doğrudan açsın (gereksiz bekletme biter).
  - Doğruluk **Orta (`2`)** ise kısa kalibrasyon (~3 sn + 360° hareket), **Düşük / Güvenilmez (`0–1`)** ise mevcut tam 8 çizme kalibrasyonu (6 sn + 720°) istensin.
  - "Atla" düğmesi 15 sn yerine 8 sn sonra görünsün.

### 1.2. Kıble ekranında ekranın kararmasını önlemek (`FLAG_KEEP_SCREEN_ON`)
- **Nerede:** [MainActivity.kt](file:///root/tam-vakti/android/app/src/main/java/com/tamvakti/app/MainActivity.kt#L287-L357)
- **Mevcut durum:** Kullanıcı telefonu çevirip Kıble'yi ararken telefonun kısa ekran zaman aşımı (15–30 sn) devreye girip ekranı karartabiliyor.
- **Öneri:** `startCompassListening()` içinde `window.addFlags(FLAG_KEEP_SCREEN_ON)`, `stopCompassListening()` içinde `window.clearFlags(FLAG_KEEP_SCREEN_ON)` eklensin. Kıble sekmesinden çıkınca veya uygulama arka plana geçince otomatik kalkar (pil etkisi sıfır).

### 1.3. Pusula ekranında canlı doğruluk rozeti ve "Yeniden kalibre et" kısayolu
- **Nerede:** [index.html](file:///root/tam-vakti/www/index.html#L218-L226), [compass.js](file:///root/tam-vakti/www/js/compass.js#L248-L255)
- **Mevcut durum:** Üst sağdaki rozet pusula açıkken hep sabit `"Donanım sensörü"` yazıyor; kullanıcı o anki manyetik doğruluğun *Orta* mı *Yüksek* mi olduğunu göremiyor. Ayrıca kullanıcı metal/hoparlör yanındayken isterse manuel yeniden kalibrasyon başlatacak bir düğme yok.
- **Öneri:**
  - Üst rozet canlı olarak `Yüksek doğruluk` (camgöbeği) / `Orta doğruluk` (camgöbeği) / `Düşük doğruluk` (amber) göstersin.
  - Rozete (veya yanındaki küçük yenile simgesine) dokununca tek tıkla yeniden kalibrasyon ekranı açılsın.

---

## 2. Görsel ve Teknik Cilalar

### 2.1. Çifte yumuşatma (Double EMA) gecikmesini dengelemek
- **Nerede:** [MainActivity.kt](file:///root/tam-vakti/android/app/src/main/java/com/tamvakti/app/MainActivity.kt#L77) (`smoothingFactor = 0.18`) + [compass.js](file:///root/tam-vakti/www/js/compass.js#L18) (`QIBLA_TAU_MS = 90`)
- **Mevcut durum:** Hem Kotlin hem JS ayrı ayrı düşük geçiren filtre uyguladığı için telefonu hızla çevirince ibre hafif geriden geliyor.
- **Öneri:** Native `smoothingFactor` değerini `0.35`, JS `QIBLA_TAU_MS` değerini `65` yaparsak titreşimsiz ama çok daha tepkisel bir pusula hissi elde edilir.

### 2.2. Kıble saati olmayan günlerde `--:--` yerine net mesaj
- **Nerede:** [compass.js](file:///root/tam-vakti/www/js/compass.js#L148-L151)
- **Mevcut durum:** `calculateQiblaHour()` `null` döndüğünde `#qiblaHourValue` güncellenmiyor (`--:--` veya önceki konumun saati kalabiliyor).
- **Öneri:** `qHour ? qHour : "Bugün yok"` şeklinde temiz yazılsın.

### 2.3. Hizalanınca (Kıble yönündesin) daha belirgin görsel geri bildirim
- **Nerede:** [index.html](file:///root/tam-vakti/www/index.html#L283-L329), [style.css](file:///root/tam-vakti/www/css/style.css#L131-L132)
- **Öneri:** Kâbe doğrultusu `±4°` içine girdiğinde mevcut dış halka parlamasına ek olarak üstteki Kâbe simgesi de hafif altın parıltı kazansın; kullanıcı göz ucuyla bile hizalandığını anında hissetsin.

---

## 3. Geri Dönüş Güvencesi
- Onayladığınız maddeler **tek bir izole commit** (`feat: kıble pusulası akıllı kalibrasyon, ekran uyanık tutma ve canlı doğruluk`) olarak uygulanacak ve `tamvakti.md` içine kaydedilecek. Herhangi bir sorun görülürse tek `git revert` ile anında geri alınabilir.
