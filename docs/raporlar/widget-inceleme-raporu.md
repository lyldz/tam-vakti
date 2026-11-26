# Aşama 7 — Ana Ekran Widget'ları İnceleme ve İyileştirme Raporu

> [!NOTE]
> Bu rapor yalnızca inceleme ve öneri çalışmasıdır. **Onayınız olmadan widget dosyalarında hiçbir kod değişikliği yapılmamıştır.**

7 widget'ın tamamını ([Widgets.kt](file:///root/tam-vakti/android/app/src/main/java/com/tamvakti/app/Widgets.kt), [PrayerWidget.kt](file:///root/tam-vakti/android/app/src/main/java/com/tamvakti/app/PrayerWidget.kt), tüm `widget_*.xml` yerleşimleri ve `widget_bg.xml`) inceledim. Ortak `BaseWidget` / `Widgets` mimarisi ve sistem `Chronometer` kullanımı pil dostu ve temiz kurulmuş.

Hem **güvenilirlik** hem de **Arctic görsel tutarlılık** açısından fark yaratacak **6 somut iyileştirme** öne çıkıyor:

---

## 1. Güvenilirlik ve Mantık Düzeltmeleri

### 1.1. Geri sayımın eksiye (`-00:01`, `-05:12`) düşmesini önlemek
- **Sorun:** `Chronometer` vakit girdiğinde otomatik durmaz; eğer o vaktin bildirimi kapalıysa veya alarm hafif gecikirse widget `00:00`'dan sonra `-00:01, -00:02...` diye eksiye sayar.
- **Öneri:** Aktif en az bir widget varsa, sıradaki vaktin 2 saniye sonrasına (`next.millis + 2000L`) hafif bir `ACTION_TICK` yenileme alarmı kurulsun. Vakit girer girmez tüm widget'lar anında bir sonraki vakte geçer, asla eksiye düşmez.

### 1.2. Widget ekli değilse gereksiz gece yarısı alarmı kurmamak
- **Nerede:** [Widgets.kt](file:///root/tam-vakti/android/app/src/main/java/com/tamvakti/app/Widgets.kt#L117)
- **Sorun:** Ana ekranda hiç Tam Vakti widget'ı olmasa bile `scheduleMidnight()` her senkronda kuruluyor.
- **Öneri:** `hasAnyWidget` kontrolü eklensin; yalnızca ana ekranda en az 1 widget varsa yenileme alarmları kurulsun (sıfır gereksiz uyanma).

### 1.3. Yatsı sonrası `LargeWidget` (Büyük Panel) için `"Yarın"` etiketi + Cuma tutarlılığı
- **Nerede:** [Widgets.kt](file:///root/tam-vakti/android/app/src/main/java/com/tamvakti/app/Widgets.kt#L102), [L140](file:///root/tam-vakti/android/app/src/main/java/com/tamvakti/app/Widgets.kt#L140)
- **Sorun:**
  - `ListWidget` Yatsı'dan sonra `"Bolvadin • Yarın"` yazıyor ama `LargeWidget` yazmıyor (alttaki 6 vaktin yarına ait olduğu belli olmuyor).
  - Klasik `PrayerWidget` Cuma günü `"Cuma (Öğle)"` yazarken diğer 6 widget `"Cuma"` yazıyor.
- **Öneri:** `LargeWidget`'ta da `d.tomorrow` ise `"$city • Yarın"`, `PrayerWidget`'ta da `nextLabel(next)` (`"Cuma"`) kullanılsın.

---

## 2. Görsel Tutarlılık Cilaları

### 2.1. Sabit genişlikli (`monospace`) geri sayım ve saatler
- **Sorun:** Uygulamanın içinde tüm geri sayımlar `monospace` olduğu için akarken hiç titremez; widget'lardaki `Chronometer` ve vakit saatlerinde ise `fontFamily="monospace"` eksik olduğu için saniyeler değişirken yazı hafifçe sağa-sola oynuyor.
- **Öneri:** Tüm 7 widget'taki `Chronometer` ve vakit saatlerine `android:fontFamily="monospace"` eklensin.

### 2.2. Arctic ince çerçeve (`widget_bg.xml`)
- **Sorun:** [widget_bg.xml](file:///root/tam-vakti/android/app/src/main/res/drawable/widget_bg.xml) şu an çerçevesiz; koyu duvar kağıtlarında widget sınırları arka planla karışabiliyor.
- **Öneri:** Uygulama içi kartlarla aynı dilde çok ince bir Arctic sınır (`<stroke android:width="1dp" android:color="#3338BDF8" />`) eklensin.

### 2.3. Büyük Panel (`LargeWidget`) için sade kerahat notu *(isteğe bağlı)*
- **Öneri:** Şu an kerahat vaktindeysek (Güneş'ten sonraki 45 dk, Öğle veya Akşam'a 45 dk kala), `LargeWidget`'ın `w_time` satırında `"12:45 • Kerahat"` şeklinde kısa bir bilgi görünsün (kalabalık etmeden, yalnızca kerahat anında).

---

## 3. Geri Dönüş Güvencesi
- Mevcut 7 widget sınıf adı (`PrayerWidget`, `SmallWidget`, `RowWidget`, `ListWidget`, `LargeWidget`, `ClockWidget`, `MinimalWidget`) ve ID'leri **hiç değiştirilmez**; telefonunuzda halihazırda ekli olan widget'lar bozulmaz veya kaybolmaz.
- Tüm değişiklikler **tek izole commit** olarak uygulanır ve `tamvakti.md` içine kaydedilir.
