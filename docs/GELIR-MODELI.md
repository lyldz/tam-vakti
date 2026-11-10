# Tam Vakti: gelir modeli raporu ve yol haritası (2026-11-10)

**Güven işaretleri:** [K] resmi kaynaktan doğrulandı, [Y] üçüncü taraf/kısmen doğrulandı, [?] doğrulanamadı (tahmin ya da genel bilgi). Web aracı sınırlıydı: AdMob politikaları, abonelik politikası ve Play ödeme eşiği sayfaları okunamadı. Vergi/hukuk kısmı genel bilgidir, **hukuki ya da mali tavsiye değildir**; gelir elde etmeden önce bir mali müşavire danışın.

## Özet (kısa cevap)
1. **Ücretli kısım:** Vakit, kıble, bildirim, imsakiye, widget ücretsiz kalsın. İsteğe bağlı **tek seferlik "Destekçi"** satın alma (Play Billing) ekleyin. Düşük fiyatlı yıllık abonelik yalnızca sürekli maliyeti olan bir özellik (bulut yedek vb.) gelirse mantıklı.
2. **Reklam:** Teknik olarak mümkün ama bu uygulama için önermiyorum. Küçük ölçekte gelir çok düşük, "reklamsız" farklılaştırıcınızı ve itibarı bozar. Eklenecekse yalnızca Ayarlar/İmsakiye altı küçük banner.
3. **Gerçekçi gelir:** 10.000 aylık aktif kullanıcıda bile aylık birkaç yüz dolar ya da altı. İlk hedef gelir değil, Play'e çıkış ve kullanıcı güveni.
4. **Önce:** Play'e çıkış 3-4 hafta sürer (12 testçi, 14 gün). Gelir kararları bundan sonra.

## 1. Google Play maliyet ve ödeme
- Geliştirici hesabı: tek seferlik **25 USD** [K]. Ön ödemeli kart olmaz; kimlik doğrulaması geçemezse iade yok [K].
- **Yeni kişisel hesapta üretime çıkmak için kapalı test şartı** [K]: en az **12 test kullanıcısı**, kesintisiz **14 gün** opt-in. Açık test sayılmaz [Y]. Güvenli olması için 15-20 testçi toplayın. İnceleme genelde ≤7 gün [K]. Kurumsal hesap (D-U-N-S) bu şarttan muaf [Y].
- Türkiye'den satış geliri alma destekleniyor, varsayılan para birimi TRY [K]. Ödeme eşiği: USD wire ~100 USD, yerel para EFT ~1 USD [Y]; Türkiye'nin hangi yöntemde olduğunu Play Console > Ödeme profilinde doğrulayın [?]. Banka ücreti 0-50 USD olabilir [Y]. Vergi formu (W-8BEN türü) gerekir [Y].
- **Komisyon** [K, "Service fees"]: "kalan pazarlar"da abonelik **%15**; diğer satışlarda yıllık ilk 1 milyon USD için **%15**, üstü %30. ABD/İngiltere/AEA için 30 Haziran 2026'dan beri yeni yapı var (abonelik %10 + %5 faturalama). Türkiye için yayılma tarihi bilinmiyor [?]: kesin oranı Play Console'da görün.
- AdMob ödeme eşiği (TRY): **200 TL** [K]; ödeme genelde sonraki ayın ~21'i [Y]; PIN ve vergi bilgisi gerekir [?].

## 2. Ücretli model seçenekleri (bizim için değerlendirme)
| Seçenek | Uygunluk | Not |
|---|---|---|
| **Tek seferlik "Destekçi/Pro"** (Play Billing) | **En uygun** | Kullanıcı dostu, politika uyumu kolay, abonelikten az tepki alır |
| Düşük fiyatlı yıllık abonelik | Koşullu | Yalnızca sürekli maliyetli özellikle (bulut yedek/senkron). Haftalık abonelik dini uygulamada itibar riski |
| Ücretli uygulama | Önerilmez | Büyümeyi öldürür, mevcut ücretsiz dağıtımla çelişir |
| Bağış/"kahve ısmarla" | Dikkatli | Uygulama içinde **harici ödeme linkine yönlendirmeyin** (Play ödeme politikası, steering). Uygulama içinde "Destekçi" ürünü olarak Play Billing kullanın; harici bağış yalnızca GitHub/web sitesinde. Politika metninde "tipping" geçmiyor [?] |
| Ücretli ezan sesi paketi | Riskli | Dini ses için ücret kullanıcı tepkisi çekebilir [?] |
- Sektör: Muslim Pro ~12,99 USD/ay, ~34,99 USD/yıl [Y]; Ezan Vakti Pro (App Store) yıllık ~12,99 USD [Y]. Muslim Pro reklam, sürekli yükseltme istemi ve 2020 veri skandalıyla güven kaybetti (Trustpilot 2,2/5, doğrulanmadı) [Y]. **Güven bu alanda en değerli varlık.**
- Türkiye fiyatı için kaynak bulunamadı [?]. Tahmin: tek seferlik Destekçi **49-149 TL**, yıllık abonelik **99-249 TL**.

### Hangi özellikler Pro olabilir / ücretsiz kalmalı
- **Ücretsiz kalmalı:** vakitler, kıble, temel bildirim, imsakiye, çevrimdışı çalışma, temel widget, hesaplama yöntemleri, Ramazan modu (çekirdek), tam ekran bildirim (izin riski ayrı).
- **Pro/Destekçi olabilir (kozmetik ve ek):** ek temalar, ek widget stilleri, ek ezan sesi paketleri (dikkat), ayar/alarm yedekleme, rozet ("Destekçi").
- **Kural:** Mevcut ücretsiz özelliği sonradan ücretli yapmayın (yanıltıcı sayılabilir, itibar kaybı).

## 3. Reklam (AdMob) ve Play'de reklamdan para kazanma
- Adımlar: AdMob hesabı > uygulamayı ekle > reklam birimi (banner) > SDK entegrasyonu > Play listesinde "reklam içerir" beyanı > Data safety formu ve gizlilik politikası güncellemesi > `app-ads.txt` (geliştirici web sitesi alan adının kökünde; bu yüzden alan adı lazım).
- **Politika [K, Play Ads]:** tıklamaya zorlama yok; tam ekran reklamda net kapatma; işlev düğmelerine yakın beklenmedik reklam yok; uygulama açılış/çıkışında zorla tam ekran yok; kilit ekranında para kazanma yok; sistem bildirimine benzeyen reklam yok.
- **Bu uygulamada kesinlikle uygun değil:** ezan/vakit bildirimi ve tam ekran bildirim ekranı, kıble pusulası ekranı, açılışta interstitial/app-open, kilit ekranı, widget içi reklam, çıkışta tam ekran.
- **Mantıklı tek yerleşim:** Ayarlar altı ya da İmsakiye listesi altı küçük sabit banner, işlev düğmelerinden uzak.
- Dini içerikte alkol/kumar/bahis/flört reklamları sorun; AdMob'da **kategori engelleme** yapın [?]. Reklam kimliği kullanımı Data safety'de beyan edilmeli [K]. AEA/İngiltere için UMP onayı, Türkiye için KVKK aydınlatma/rıza [?]. Çocuk hedeflemeyin (hedef kitle yetişkin/karma).
- WebView ağırlıklı uygulama: reklamı **native katmanda** gösterin (WebView içine reklam koymayın) [?].
- eCPM Türkiye için güvenilir veri yok [?]; tahmin: banner 0,05-0,30 USD.

## 4. Gelir senaryoları (TAHMİN: varsayımlar belirsiz)
Varsayım: ayarlar/imsakiye banner ~5 gösterim/gün, eCPM 0,10 USD ⇒ ~0,015 USD/kullanıcı/ay; Pro: dönüşüm %1-3 [?], net 3 USD/yıl.

| MAU | Reklam (ay) | Pro %1 | Pro %3 |
|---|---|---|---|
| 1.000 | ~15 USD | ~2,5 USD | ~7,5 USD |
| 10.000 | ~150 USD | ~25 USD | ~75 USD |
| 100.000 | ~1.500 USD | ~250 USD | ~750 USD |
eCPM 0,50 olursa reklam 5 katı. 1.000 MAU'da AdMob 200 TL eşiği 1-2 ayda bir aşılır. **Sonuç:** Küçük ölçekte reklam, itibar kaybına değmez.

## 5. Riskler
- **İtibar:** "Reklamsız" şu an en güçlü farkınız; mevcut APK kullanıcıları reklamsız beklentisiyle geldi.
- **Play izin incelemesi:** `USE_FULL_SCREEN_INTENT` ve `SYSTEM_ALERT_WINDOW` kısıtlı/gerekçe ister [?]. Reddedilirse Play sürümünde tam ekran özelliğini kapatıp yalnız GitHub sürümünde bırakın (`IS_PLAY` bayrağı hazır).
- Ücretli/abonelik: fiyat, süre, iptal şeffaf olmalı; gizli ücretli özellik reddedilir [?].
- Data safety formu ve gizlilik politikası eksikliği reddedilme sebebi [K].
- Komisyon ve KDV kuralları Türkiye için doğrulanmadı; 2026'da Play ücret yapısı değişiyor.

## 6. Vergi/yasal (genel bilgi, tavsiye değil) [Y]
- Yurt dışındaki alıcıya yapılan hizmette ihracat istisnası mümkün; Türkiye'deki kullanıcılardan gelen gelirde istisna zayıflar, genel KDV hükümleri gündeme gelebilir. Şahıs şirketi/mükellefiyet gerekliliği gelir tutarına ve sürekliliğe bağlı; kaynaklar net değil [?].
- **Gelir elde etmeden önce SMMM ile görüşün.** Play/AdMob ödemeleri TRY ya da USD olabilir.

## 7. Alan adı ve e-posta
- Play'de geliştirici e-postası mağaza sayfasında herkese görünür; `destek@alanadiniz` hem düzenli hem güvenli. Gizlilik politikası ve destek sayfası aynı alan adında durabilir. Reklam eklenirse `app-ads.txt` bu alan adının köküne konur.
- Ücretsiz e-posta: Cloudflare Email Routing ile `destek@...` → Gmail yönlendirme; yanıt için Gmail "başka adres olarak gönder".
- `tamvakti.com` başkasına ait görünüyor; `.app/.org/.net/.dev` için DNS kaydı bulunamadı (boş olabilir, kayıt şirketinden doğrulayın). `.com.tr` firma belgesi ister.

## 8. Yol haritası
| Dönem | İş | Gelir |
|---|---|---|
| **0-1 ay (hazırlık)** | Alan adı + destek e-postası; Play hesabı (25 USD); gizlilik politikası güncelle; Data safety; izin gerekçeleri (tam ekran/yer paylaşımı); mağaza görselleri (hazır: `tools/store`); 15-20 testçi bul | Yok |
| **1-2 ay (kapalı test)** | 14 gün kesintisiz kapalı test; hataları düzelt; Android vitals; sürüm notu | Yok |
| **2-3 ay (Play'e çıkış)** | Üretime çıkış; yorum ve puanlara yanıt; kararlılığı izle | Yok |
| **3-6 ay** | MAU ve tutundurma ölç (Play Console). Mali müşavirle mükellefiyet kararı. İsteğe bağlı **tek seferlik Destekçi** (Play Billing); çekirdek ücretsiz | Küçük |
| **6-12 ay** | Destekçi dönüşümünü ölç; gerekirse kozmetik Pro (tema/widget/yedek). Reklam **ancak** veri destekliyorsa ve yalnız Ayarlar/İmsakiye banner olarak | Büyümeye bağlı |
- **Ölçüm:** Play Console istatistikleri ve Android vitals öncelikli. Firebase kullanılacaksa Analytics varsayılan kapalı + onayla açılsın (KVKK), IP/reklam kimliği toplanmasın.

## Tavsiye edilen model
**Ücretsiz, reklamsız çekirdek + isteğe bağlı tek seferlik "Destekçi/Pro" (Play Billing).** Nedeni: ölçek küçükken reklam geliri düşük ve itibar riski yüksek; dini uygulamada güven ana varlık; Play Billing ile politika uyumu kolay. Reklam en son seçenek.

## Kaynaklar (sayfa adları)
Google Play Console Yardım: Service fees (112622), Create a developer account (6112435), Testing requirements for new personal developer accounts (14151465), Payments policy (9858738), Ads policy (9857753), Supported locations for merchant registration (9306917), Wire transfer payouts (2700656), Data safety (10787469). AdMob Yardım: Payment thresholds (2772208). Alomaliye.com (18.02.2026), mukellef.co, muhasebenews.com (vergi). islamtics.com, The National (Kas 2020), ProPrivacy (Muslim Pro). foxdata.com, adapty.io, appbot.co (Play 2026 ücret değişikliği, ikincil kaynak). Apple App Store (Ezan Vakti Pro listesi).
