# Tam Vakti — Detay Ekranı Nokta İşaretleri Sadeleştirme Raporu

> [!NOTE]
> Bu rapor yalnızca inceleme ve seçenek sunumudur. **Onayınız olmadan hiçbir kod değişikliği yapılmamıştır.**

---

## 1. Ekrandaki Noktalar Neden Var ve Neden Göz Yoruyor?

Paylaştığınız `v2.13.0` ekran görüntüsünde toplam **8 adet dekoratif/durum noktası** aynı anda görünüyor:

| Konum | Ne İşe Yarıyor? | Sorun |
|---|---|---|
| **3×2 vakit kutuları** (`İmsak •`, `Güneş •`, … 6 adet) | O vakit için uyarı açık (`isAlertOn`) göstergesi ([app.js](file:///root/tam-vakti/www/js/app.js#L463)) | Neredeyse tüm vakitlerde uyarı açık olduğu için 6 kutunun 6'sında da parlak mavi nokta yanıyor; ayrıca metnin sağına eklendiği için vakit adlarını hafif sola kaydırıyor. |
| **`• Geçen süre 0 sa 16 dk`** (1 adet) | Yalnızca görsel süs ([index.html](file:///root/tam-vakti/www/index.html#L212)) | İşlevi yok, gereksiz kalabalık ekliyor. |
| **`• Şu an: Öğle`** (1 adet) | Canlı aktif vakit göstergesi ([index.html](file:///root/tam-vakti/www/index.html#L142)) | Tek olduğu için göze batmıyor, ancak istenirse kaldırılabilir. |

*(Güneş yolu yayındaki noktalar grafiğin doğal vakit işaretleri olduğu için bu kapsama dahil değildir.)*

---

## 2. 3×2 Vakit Kutuları İçin 3 Sadeleştirme Seçeneği

### Seçenek A — Sadece Uyarı Kapalıysa Soluk İkon Göster *(Önerilen)*
- **Mantık:** Çoğu kullanıcı 5 veya 6 vakitte uyarıyı açık tutar. "Açık" olanı işaretlemek yerine **yalnızca uyarı kapalıysa** işaret göstermek ekranı tamamen ferahlatır.
- **Görünüm:**
  - Uyarı **açık** vakitler: Hiç nokta/ikon yok — sadece tam ortalı `Öğle` ve `12:47`.
  - Uyarı **kapalı** vakitler: Kutunun sağ üst köşesinde çok küçük (11 px), düşük opaklıklı (`%35`) ince çizgi "kapalı zil" SVG ikonu.
- **Artısı:** 6 parlak mavi nokta tamamen yok olur; yine de hangi vaktin susturulduğu tek bakışta anlaşılır; vakit adları milimetrik ortalanır.

### Seçenek B — Kutularda Hiç İşaret Olmasın *(En Sade)*
- **Mantık:** Vakit kutuları yalnızca vakit adı ve saatini gösterir. Bir vakte dokununca zaten o vaktin uyarı penceresi açılır ve durum anında görülür.
- **Görünüm:** 6 kutunun tamamında sıfır nokta, sıfır ikon.
- **Artısı:** Maksimum sakinlik ve simetri.
- **Eksisi:** Ana ekrandan tek bakışta hangi vaktin uyarısının kapalı olduğu anlaşılmaz (dokunmak gerekir).

### Seçenek C — İlk Kullanım İpucu / Tek Seferlik Kaldırma
- **Mantık:** Kullanıcı herhangi bir vakit kutusuna ilk kez dokunup uyarısını düzenleyene kadar kutularda çok soluk bir işaret görünür; ilk ayardan sonra tüm nokta/işaretler kalıcı olarak kalkar (veya Ayarlar'dan istenirse geri açılabilir).
- **Artısı:** Yeni kullanıcıya kutuların tıklanabilir olduğunu sezdirir, ardından ekran tamamen sadeleşir.

---

## 3. Diğer Noktalar İçin Önerilen Değişiklik Listesi

Onaylarsanız uygulanacak değişiklik listesi:

1. **3×2 vakit kutuları ([app.js](file:///root/tam-vakti/www/js/app.js#L463)):** Seçeceğiniz opsiyona (**A**, **B** veya **C**) göre 6 parlak mavi nokta kaldırılır / değiştirilir.
2. **`• Geçen süre` satırı ([index.html](file:///root/tam-vakti/www/index.html#L212)):** Başındaki gereksiz gri nokta kaldırılır (`Geçen süre 0 sa 16 dk`).
3. **`• Şu an: Öğle` rozeti ([index.html](file:///root/tam-vakti/www/index.html#L142)):** İsteğinize göre **kalsın** (önerilen, tek canlı işaret) ya da **kaldırılsın**.
4. **Kayıt & eşitleme:** `www/` → `assets/www/` eşitlenir, `tamvakti.md` güncellenir.
