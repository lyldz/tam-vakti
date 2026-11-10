# Kısa ezan/takbir bildirim sesi: ön araştırma (2026-11-10)

**Güven işaretleri:** [D] doğrulandı, [K] kısmen, [Y] doğrulanamadı. Hukuki tavsiye değildir. Alt ajan raporu; ses indirilmedi.

## Karar (bu proje için)
1. **Önce özgün, sade bildirim sesleri** (bu depoda sentezlendi: `tools/sounds/make-tones.py`): Çağrı, Billur, Seher, Damla. Telif ve dini hassasiyet riski en düşük, Play için en kolay. **Adlarda "ezan" geçmez.** Yapıldı.
2. **Gerçek ezan/takbir sesi sonra, yalnızca lisansı kesin olursa:** (c) izinli hafız/müezzinle kendi kaydımız (hak zinciri net), ya da (b) CC0 aday (aşağıda) + dinleme/kaynak kontrolü. Henüz eklenmedi.

## Özet bulgular
- Ezanın sözü serbest; **belirli bir kaydın** icra/fonogram hakkı ayrıdır (FSEK 5846) [K]. Diyanet/TRT kayıtları için kamuya açık lisans/izin şartı bulunamadı [Y]: **kullanma**.
- Google Play, telifli sesi değiştirilmiş olsa da ihlal sayar; en güvenli yol özgün içerik ya da yazılı izinli içerik [D]. Metinlerde "Diyanet onaylı" gibi bağlantı kurma (Impersonation riski) [K].
- Bildirim sesi paketlemeye özel Play sınırı bulunamadı [Y]. Sentetik/TTS ezan için Diyanet'in resmi görüşü bulunamadı [Y]; dolaylı kaynaklar kayıtla ezan okutmaya saygı/ihtiyat vurguluyor [K] → **sentetik ezan üretme**.
- Teknik [D]: kanal sesi sonradan değişmez, yeni ses = yeni kanal kimliği. `res/raw` + `setSound(Uri, AudioAttributes)`. Kısa klip (5-20 sn, tercihen <15 sn), başı/sonu fade. USAGE_NOTIFICATION varsayılan.

## CC0 adaylar (Wikimedia Commons; sayfa lisansı okundu, icracı doğrulanamadı)
| Dosya | Süre | Not |
|---|---|---|
| Allahuakbar.opus | 2,6 sn | En uygun aday; yeni (15.07.2026), icracı belirsiz |
| Adhan.ogg | 42 sn | Yeni, icracı belirsiz |
| Azan.ogg | 2 dk 34 sn | Kesmek gerekir (ezan açısından hassas) |
CC-BY-SA / CC-BY-NC-ND olanlar uygun değil. "Own work" + CC0 beyanı yükleyenin kendi beyanıdır; Play'in hak kanıtı talebinde zayıf nokta.

## (c) İzinli müezzin kaydı: yazılı izinde bulunması gerekenler (hukukçu gözden geçirmeli)
Taraflar ve kimlik; kayıt tarihi/yeri/kaydı yapan; ticari uygulama, GitHub APK + Google Play, dünya çapında, süre, münhasır olup olmadığı; kısaltma/kesme/fade/format dönüşümü ve bildirim sesi olarak kullanım izni; manevi haklar (atıf, saygısız bağlam yasağı, dini koşullar); ücret/geri çağırma/sorumluluk; yapay zekâ eğitimi için kullanılamama; imzalı kopyanın saklanması; sesin kimliğine dair "X onaylı" ifadesi kurulmaması.

## İlk sürüm için ek notlar
- Ses seçeneği kullanıcı seçimiyle açılır (varsayılan: telefon sesi).
- Uygulama içi metinde bu sesler "hatırlatma sesi" olarak adlandırılır.
