# Arka plan konum takibi: araştırma raporu (2026-11-17)

Durum: BEKLEMEDE. Kullanıcı "şimdilik dursun, rapor hazırla, hatırlat" dedi. v2.12.0'da yalnızca uygulama açıkken/öne gelince konum kontrolü var (`checkAutoLocation`, `www/js/app.js`).

## Amaç
Sürekli yer değiştiren kullanıcı için, uygulama kapalıyken de il/ilçe değişince vakitlerin ve alarmların yenilenmesi. Sabit kullanıcıda kapalı kalmalı (ayarda isteğe bağlı anahtar).

## Android kuralları (resmi belgelere göre)
- Android 10+: Uygulama arka plandayken konuma bakmak için ayrı izin gerekir: `ACCESS_BACKGROUND_LOCATION`. Kullanıcı bunu çoğu telefonda ayarlar ekranından "Her zaman izin ver" diyerek verir (Android 11+ uygulama içinden doğrudan istenemez).
- Alternatif: `location` türünde ön plan servisi (foreground service). Android 14+ için `FOREGROUND_SERVICE_LOCATION` izni de gerekir. Arka plandan başlatılan ön plan servisi (Android 12+) çoğu durumda `ForegroundServiceStartNotAllowedException` verir; konum için ayrıca arka plan konum izni yoksa servis konuma erişemez (Android 11+).
- Android 15/16: Ön plan servisi kuralları sıkılaştı ve hedef sürümden bağımsız uygulanıyor.
- Henüz doğrulanmadı (uygulamadan önce resmi belgeden denetlenecek): vakit alarmı (AlarmManager) tetiklenince alınan tek seferlik konum isteğinin arka plan izniyle çalışıp çalışmadığı; alarmdan `location` ön plan servisi başlatmanın izinli istisnalara girip girmediği.

## Google Play kuralı
- Arka plan konumu Play Console'da "Hassas uygulama izinleri > Konum izinleri" formu ister: izin bildirim formu, tanıtım videosu ve uygulama içinde belirgin bilgilendirme (prominent disclosure). Gizlilik politikasında da yazmalı.
- Google "bu özellik uygulamanın ana işlevi için şart mı" diye sorar; ön planda çözülebiliyorsa reddedilir. Namaz vakti uygulamasında ön plan çözümü (uygulamayı açınca kontrol) var, bu yüzden Play onayı riskli.
- Reddedilirse güncellemeler engellenebilir.

## Seçenekler
1. **Alarmda tek bakış (önerilen taslak):** Her vakit alarmında düşük güçlü tek konum bakışı, günde en fazla 6 kez. İzin: `ACCESS_BACKGROUND_LOCATION`. Pil etkisi düşük. Önce yukarıdaki doğrulanmamış noktalar denenmeli.
2. **Sürekli ön plan servisi:** Güvenilir ama sürekli bildirim ve pil maliyeti; sabit kullanıcıya gereksiz. Önerilmez.
3. **İzinsiz yol:** Bildirimdeki ya da widget'taki düğmeye dokununca uygulama açılıp konumu günceller (bugünkü ön plan mantığı). Ek izin yok, Play riski yok.

## Öneri
- Yalnızca `github` flavor'da (APK) seçenek 1, ayarlarda varsayılan KAPALI anahtar, açınca izin yönlendirmesi ve açıklama. `play` flavor'a koyma (inceleme riski, Play hazırlığı zorlaşır).
- Telefonda (Xiaomi/HyperOS) doğrulanmalı: "Her zaman izin ver" ve pil kısıtlaması (otomatik başlatma) ayarları arka plan alarmlarını etkileyebilir.
- Kotlin yalnızca GitHub Actions'ta derlenir; birkaç deneme turu beklenmeli.

## Kaynaklar
- Android: Request location permissions, Changes to foreground services (developer.android.com)
- Google Play: Use of location permissions / permission declaration (support.google.com/googleplay/android-developer/answer/9799150)
