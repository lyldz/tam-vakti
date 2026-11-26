# Ayarlar Ekranı İnceleme ve Sadeleştirme Raporu

> [!NOTE]
> Bu rapor yalnızca inceleme ve yeniden düzenleme önerisidir. **Onayınız olmadan Ayarlar ekranında hiçbir kod değişikliği yapılmamıştır.**

---

## 1. Mevcut Durum: Neden Karışık Hissediliyor?

Mevcut [settingsModal](file:///root/tam-vakti/www/index.html#L470-L760) içinde **4 grup altında toplam 22 satır** tek bir uzun listede alt alta duruyor:

| Mevcut Grup | Satır Sayısı | Gözlem |
|---|---|---|
| **Konum** | 4 satır | En düzenli grup (`Konum`, `Otomatik güncelle`, `Hesaplama yöntemi`, `İhtiyat`). Ancak `Hesaplama yöntemi` ve `İhtiyat` Türkiye'deki kullanıcıların %95'inin neredeyse hiç dokunmadığı gelişmiş ayarlardır. |
| **Bildirim** | 7 satır | En kalabalık blok. `Vakit bildirimi` (Sesli/Sessiz) ile `Bildirim sesi` (Ton seçimi) iki ayrı satırda bölünmüş. Ayrıca 4 adet anahtar (`Sessize al`, `Sabit bildirim`, `Kerahat`, `Tam ekran`) arka arkaya geliyor. |
| **İzinler** | 5 satır | Tüm izinler verilmiş olsa bile her açılışta **5 satır birden** yer kaplıyor (`Bildirimler`, `Tam zamanında`, `Sessize alma`, `Pil`, `Arka plan`). |
| **Uygulama** | 6 satır | Günlük ayar (`Ana ekran görünümü`, `Hakkında`) ile **4 adet tanı/bakım düğmesi** (`Bildirimi test et`, `Alarmları yeniden kur`, `Tam ekranı dene`, `Kurulumu yeniden başlat`) aynı düzlemde yan yana duruyor. |

---

## 2. Sadeleştirme Önerisi: 22 Satırdan ~11 Satıra

Hiçbir özelliği silmeden, yalnızca **günlük kullanılanları öne alıp**, seyrek kullanılanları ve test/izin detaylarını **katlanabilir / alt menü** yapısına taşıyarak ekranı yarı yarıya ferahlatabiliriz:

### Grup 1 — Konum ve Vakit *(3 satır)*
1. **Konum** (`Bolvadin` → Değiştir)
2. **Konumu otomatik güncelle** *(anahtar)*
3. **Hesaplama ve ihtiyat** (`Diyanet · ±0 dk` → dokununca iki seçenekli alt pencere: *Hesaplama yöntemi* / *İhtiyat dakikası*) — *veya mevcut 2 satır aynen kalabilir.*

### Grup 2 — Bildirimler *(6 satır, daha net)*
1. **Vakit uyarıları** (`5 vakit açık` + altında `Sıradaki uyarı: 15:24 · 29 gün kurulu`)
2. **Bildirim sesi** (`Sabah Çanı` veya `Sessiz` → **Vakit bildirimi (Sesli/Sessiz) ile Bildirim sesi tek satırda birleşir!** Seçim listesinin en üstünde `Sessiz (yalnızca yazı)` seçeneği bulunur; iki ayrı satır karmaşası biter.)
3. **Sabit bildirim (canlı sayaç)** *(anahtar)*
4. **Namazda sessize al** *(anahtar)*
5. **Kerahat uyarısı** *(anahtar)*
6. **Tam ekran bildirim** *(anahtar)*

### Grup 3 — Görünüm ve Sistem *(3 satır)*
1. **Ana ekran görünümü** (`Detay` / `Sade`)
2. **Sistem izinleri** — **Akıllı özet satır:**
   - Tüm izinler tamamsa tek satırda sakin **`✓ Tümü hazır`** yazar (5 satırlık blok gizlenir; dokununca izin detayları ve OEM arka plan rehberi açılır).
   - Eksik bir izin varsa satır **amber** vurgulu **`⚠️ 1 izin eksik`** gösterir ve dokununca doğrudan ilgili izin listesi açılır!
3. **Test ve sorun giderme** — Tek satır, dokununca alt pencere açılır:
   - *Bildirimi test et*
   - *Tam ekran bildirimi dene (10 sn)*
   - *Alarmları yeniden kur*
   - *Kurulum sihirbazını yeniden başlat*

### Grup 4 — Uygulama *(1 satır)*
1. **Hakkında** (`v2.13.4` · güncelleme varsa camgöbeği rozet)

---

## 3. Karşılaştırma Özeti

| Metrik | Mevcut Ayarlar | Önerilen Ayarlar |
|---|---|---|
| Ana listedeki satır sayısı | **22 satır** (uzun kaydırma) | **13 satır** (tek ekrana yakın, ferah) |
| Kaybedilen özellik | — | **0** (tüm ayarlar ve test araçları aynen durur) |
| İzinler tamamsa kapladığı yer | 5 satır | **1 özet satır** (`✓ Tümü hazır`) |
| Test / bakım düğmeleri | 4 ayrı satır | **1 satır** (`Test ve sorun giderme`) |
| Sesli/Sessiz + Ton seçimi | 2 ayrı satır | **1 birleşik satır** (`Bildirim sesi`) |

---

## 4. Görüşünüzü Almak İstediğim 3 Nokta

1. **İzinler grubu:** Tüm izinler açıkken tek özet satıra (`✓ Tümü hazır`, dokununca açılsın) düşmesi hoşunuza gider mi, yoksa 5 satır hep açık mı dursun?
2. **Test ve bakım düğmeleri:** `Bildirimi test et`, `Tam ekranı dene`, `Alarmları yeniden kur` ve `Kurulumu yeniden başlat` tek bir **"Test ve sorun giderme"** satırında toplansın mı?
3. **Vakit bildirimi + Bildirim sesi:** İkisini tek **"Bildirim sesi"** satırında (en üstte `Sessiz` seçeneğiyle) birleştirelim mi?
