# Uygulama Logosu Kontrolü ve Aşama 6: Aylık İmsakiye Raporu

> [!NOTE]
> Bu rapor yalnızca inceleme ve öneri çalışmasıdır. **Onayınız olmadan hiçbir kod veya görsel dosyasında değişiklik yapılmamıştır.**

---

## 1. Uygulama Logosu Kontrolü — Değiştirmek Gerekli mi?

Tüm logo dosyalarını (`A3.svg`, `ic_launcher_foreground.xml`, `ic_launcher_background.xml`, `ic_launcher_monochrome.xml`, `logo_full.png`, `mipmap-xxxhdpi/ic_launcher.png`, `play-store-icon-512.png`) tek tek inceledim.

- **Dürüst sonuç: Ana renkli logoyu değiştirmeye GEREK YOK.**
- **Neden?**
  - Durum çubuğu simgesini (`ic_stat_tamvakti.xml`) düzeltmemizin sebebi, **tek renk beyaz + 24dp** boyutta güneş ile yayın aynı beyaz renkte birleşip *"A harfi / üçgen"* gibi okunmasıydı.
  - Renkli ana logoda ise güneş **parlak altın-sarı**, yay ise **camgöbeği → şeftali** geçişli olduğu için güneş ile yay zaten birbirinden net biçimde ayrılıyor.
  - Android 13+ temalı tek renk simge (`ic_launcher_monochrome.xml`) de `v2.13.4` ile zaten boşluklu yeni çizime geçirildi.
- **İsteğe bağlı çok ufak bir cila (yapılmasa da olur):**
  - Mevcut `A3.svg`'de yatay ufuk çizgisi (`y=74`) yayın kalın yuvarlak uçlarının tam ortasından geçtiği için yayın sol/sağ ucu çizginin hafifçe altına sarkıyor gibi duruyor. Ufuk çizgisini `y=78`'e (yayın tam tabanına) çekmek küçük bir simetri cilası sağlar; ama mevcut hali de gayet şık.

---

## 2. Aşama 6 — Aylık İmsakiye İncelemesi (`#monthlyModal`)

Mevcut [index.html](file:///root/tam-vakti/www/index.html#L371-L456), [app.js](file:///root/tam-vakti/www/js/app.js#L889-L1050) ve [prayer-engine.js](file:///root/tam-vakti/www/js/prayer-engine.js#L315-L455) kodlarını incelediğimde **5 somut iyileştirme** öne çıkıyor:

### 2.1. Hicri ay başlığı: İki Hicri ayın kesişimini doğru göstermek
- **Mevcut durum:** Bir Miladi ayın içinde neredeyse her zaman iki Hicri ay yer alır (ör. *Cemaziyelevvel* ve *Cemaziyelahir*). Şu an başlık yalnızca ayın ilk gününün (çevrimiçi) veya 15. gününün (çevrimdışı) adını yazıyor.
- **Öneri:** Ayın 1. günü ile son gününün Hicri ayı farklıysa başlıkta **`Cemaziyelevvel – Cemaziyelahir 1448`** şeklinde tam aralık gösterilsin.

### 2.2. Gün sütununda küçük Hicri gün bilgisi (veri zaten hesaplanıyor)
- **Mevcut durum:** `prayer-engine.js` her gün için `hijriDay` (`"11 Cemaziyelahir"`) değerini zaten üretiyor ama tabloda hiç gösterilmiyor.
- **Öneri:** İlk sütundaki `21 Cmt` satırının hemen altında çok sade ve soluk (`9.5px`) Hicri gün (ör. `11 Cem.`) gösterilsin; yatay genişliği hiç artırmadan takvim değeri yükselir.

### 2.3. Hızlı ay değiştirmede yarış durumu (race condition) koruması
- **Mevcut durum:** Kullanıcı `›` düğmesine art arda hızlı basınca önceki ayın geç dönen API yanıtı, son seçilen ayın tablosunun üzerine yazabilir.
- **Öneri:** `syncNativeSchedule`'da olduğu gibi `_monthlySeq` sayacıyla yalnızca en son istenen ayın yanıtı ekrana basılsın.

### 2.4. İhtiyat (± dk) bilgisi ve bugünkü sıradaki vakit vurgusu
- **Öneri:**
  - Kullanıcı ihtiyat dakikası (`+2 dk` vb.) ayarlamışsa tablo altındaki notta **`İhtiyat (+2 dk) uygulanmıştır.`** bilgisi de görünsün.
  - Bugünkü satırda (`monthlyRow-today`) sıradaki vaktin saati hafif camgöbeği vurgulu olsun.

### 2.5. Üst çubuk sadeleştirmesi
- **Mevcut durum:** İmsakiye üst çubuğunda hem solda `← Vakitler` hem sağda `×` kapatma düğmesi var (iki ayrı kapatma düğmesi).
- **Öneri:** Sağdaki gereksiz `×` kaldırılıp şehir rozeti sağda daha ferah dursun (sol `← Vakitler` + Android geri tuşu zaten kapatıyor).

---

## 3. Onayınız İçin Kısa Sorular

1. **Logo:** Mevcut renkli logoyu olduğu gibi bırakalım mı, yoksa ufuk çizgisini yayın tabanına hizalayan ufak simetri cilasını yapalım mı?
2. **Aylık İmsakiye:** Yukarıdaki 5 maddenin tamamını uygulayıp tek izole commit ile (`v2.13.6`) yayınlayalım mı?
