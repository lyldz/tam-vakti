# Namaz vakti uygulamaları: özellik araştırması (2026-11-10)

**Güvenilirlik uyarısı:** Web araması sınırlıydı. Google Play yorumlarına doğrudan erişilemedi; bulunan karşılaştırma yazılarının çoğu rakip uygulama yapımcılarından, yani taraflı. Türkçe uygulamalar (Diyanet Namaz Vakitleri, Namaz Vaktim, Ezan Vakti Pro, Hakkı Namaz vb.) için doğrulanabilir yorum verisi bulunamadı. **[K]** = kaynakta doğrudan geçiyor, **[G]** = genel Android bilgisi, doğrulanmadı.

## 1) Olmazsa olmazlar ve bizde durum
- Doğru vakit + birden fazla hesaplama yöntemi (Diyanet, MWL, ISNA, Umm al-Qura) [K]. Bizde: Diyanet uyumlu + ihtiyat VAR; Diyanet dışı yöntem YOK (yurt dışı kullanıcı için gerekir).
- Güvenilir vakit bildirimi [K]. Bizde VAR; farklı marka telefonlarda test edilmeli.
- **Ezan sesi seçeneği** [K]. Bizde YOK (bilinçli tercih). En büyük özellik boşluğu; Türkiye'de beklenti yüksek [G].
- Çevrimdışı çalışma [K]: VAR. Kıble pusulası [K]: VAR (kalibrasyon + titreşim farklılaştırıcı). Widget: VAR. Vakitten önce hatırlatma: VAR. Kalıcı bildirim: VAR. Reklamsız: VAR.
- GPS ile otomatik il/ilçe bulma: VAR (BigDataCloud ile ilçe adı); doğrulanmadı.
- Aylık imsakiye: VAR; yıllık liste YOK.
- Pil optimizasyonu / tam alarm / bildirim izni yönlendirmesi [K]: kurulum sihirbazında VAR (v2.5).

## 2) Olsa iyi olur (etki / zahmet)
- Ezan sesi seçeneği, kısa klipler, varsayılan kapalı. Etki yüksek, zahmet orta (telif, APK boyutu).
- Dini günler/kandiller/Üç Aylar takvimi. Orta-yüksek / düşük-orta, çevrimdışı hesaplanır.
- Hicri tarih: VAR (ana ekranda).
- **Ramazan modu:** sahur/iftar geri sayımı + sahur alarmı. Yüksek (sezonluk) / düşük-orta.
- Hesaplama yöntemi ve ikindi mezhebi (Hanefi/Şafii) seçimi. Orta / düşük.
- Widget çeşitliliği. Orta / orta. Kaza namazı / namaz takibi. Orta / orta.
- Wear OS, yedekleme/dışa aktarma, çoklu dil (EN/AR), cami bulucu: düşük-orta etki, orta-yüksek zahmet.
- Zikirmatik/dua/Kur'an: zahmet yüksek, odağı dağıtır, önerilmez.

## 3) En çok şikayet edilenler ve kaçınma yolu
- **Ezan/bildirim gelmiyor ya da geç geliyor** (Doze, üretici pil yönetimi; dontkillmyapp: Huawei, Xiaomi, OnePlus, Samsung kötü) [K]. Kaçınma [G]: `setExactAndAllowWhileIdle`, tam alarm izni, pil muafiyeti yönlendirmesi, boot/saat dilimi/saat değişimi sonrası yeniden kurma, "test bildirimi" düğmesi, kapatılmış bildirim kanalı kontrolü. (Çoğu bizde var.)
- Reklam ve abonelik duvarı (Muslim Pro şikayetlerinin başı) [K]: bizde yok; öne çıkarılmalı.
- Yanlış vakit (eski/kapalı konum) [K]: seçili il/ilçe ana ekranda hep görünsün; yaz/kış saati ve ilçe farkları test edilsin.
- Tam ekran bildirim [G]: Android 14+ `USE_FULL_SCREEN_INTENT` kısıtlı; Play'de varsayılan olarak yalnız arama/alarm uygulamalarına. Doğrulanmadı.

## 4) Güçlü yanlarımız
Sıfır reklam/abonelik; tam çevrimdışı Diyanet uyumlu hesap; güneş yayı + canlı geri sayım; namazda otomatik sessize + kerahat uyarısı (rakiplerde öne çıkmıyor); kalibrasyonlu kıble; kurulum sihirbazı; uygulama içi güncelleme; küçük boyut.

## 5) Önerilen öncelik (TODO adayları)
1. Bildirim güvenilirliğini sağlamlaştır (alarmı yeniden kur, tanı ekranı) ve "Alarmları yeniden kur" düğmesi ekle.
2. Xiaomi/Huawei/Samsung için "otomatik başlatma / uyku listesi" yönergeleri; eksik izinde ana ekranda uyarı.
3. Tam ekran bildirimi tamamla ve telefonda dene (yapıldı, deneme bekliyor).
4. İsteğe bağlı ezan sesi (kısa klipler, varsayılan kapalı; "telefon sesi" modu korunur).
5. Ramazan modu: sahur/iftar geri sayımı ve sahur alarmı; dini günler takvimi.
6. Hesaplama yöntemi ve ikindi mezhebi seçeneği.
7. Seçili konum ana ekranda hep görünsün; widget çeşitliliği.
8. Yıllık imsakiye / yedekleme.

## Kaynaklar (çoğu yalnızca arama özeti)
makkahcompass.pages.dev karşılaştırması; FivePrayer blog; Muslim Friend; Muslim Expert vs Muslim Pro; Dhaka Tribune (Muslim Pro alternatifleri); Unstar.app; Islamtics; Trustpilot (Muslim Pro); Muslim Pro Help Center; dontkillmyapp.com; Android Developers (Doze/App Standby); App Store Türkiye listeleri; sorularlaislamiyet.com (Diyanet/Namaz Vaktim).
