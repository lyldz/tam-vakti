# Google Play yayın kontrol listesi (Tam Vakti)

Paket: `com.tamvakti.app` • AAB: GitHub Actions > Artifacts > **TamVakti-Play-AAB** • Gizlilik politikası: https://lyldz.github.io/tam-vakti/

## Mağaza sayfası
- **Ad (30):** Tam Vakti: Namaz Vakitleri
- **Kısa açıklama (80):** Reklamsız, sade namaz vakitleri, kıble ve vakit uyarıları. İnternetsiz de çalışır.
- **Uzun açıklama:**
  Tam Vakti, namaz vakitlerini sade ve reklamsız gösteren bir uygulamadır.
  • Gün boyu güneşin yolu üzerinde altı vakit, canlı geri sayım ve ilerleme çubuğu
  • İsteğe göre her vakit için "vakit girince" ve "vakitten önce" uyarısı
  • Kerahat vakitlerinde haber verme
  • Namaz vaktinde telefonu geçici olarak titreşime alma (isteğe bağlı)
  • Kıble pusulası (her açılışta kalibrasyonlu, kıbleye hizalanınca titreşir)
  • 81 il ve 1002 ilçe, aylık imsakiye çizelgesi
  • Ana ekran widget'ı
  • İnternet yokken yerleşik hesapla çalışır; hesap, reklam ve izleme yoktur
- **Kategori:** Yaşam tarzı (Lifestyle) • **Etiket önerisi:** namaz vakitleri, kıble, imsakiye
- **İkon:** `tools/icons/play-store-icon-512.png (üretici: tools/icons/make-icons.sh)` • **Öne çıkan görsel:** tools/store/feature-graphic-1024x500.png • **Ekran görüntüsü:** en az 2 adet (telefon)

## Uygulama içeriği
- **Reklam:** Yok • **Hedef kitle:** 13+ ya da "Tüm yaşlar" (çocuklara özel değil) • **İçerik derecelendirme:** anket sonucu "Herkes"
- **Gizlilik politikası URL:** yukarıdaki sayfa (Pages açık olmalı)

## Veri güvenliği formu (Data safety)
| Soru | Cevap |
|---|---|
| Veri topluyor musunuz? | **Evet** (yalnızca konum, cihazdan çıkarak üçüncü taraf hizmetlere) |
| Konum (yaklaşık) | Toplanır ve **paylaşılır**: Aladhan API (vakit hesabı), BigDataCloud (ilçe adı, yalnızca "GPS ile bul") |
| Amaç | Uygulama işlevselliği (reklam/analiz yok) |
| Zorunlu mu? | **İsteğe bağlı** (şehir listesinden de seçilebilir) |
| Aktarım şifreli mi? | Evet (HTTPS) |
| Silme isteği | Veri cihazdadır; uygulama kaldırılınca silinir |
| Kişisel bilgi/Finansal/Sağlık/Mesaj/Foto/Kişi/Uygulama etkinliği | Toplanmıyor |

## İzin beyanları (Play Console > Uygulama içeriği)
- **Tam zamanlı alarm (SCHEDULE_EXACT_ALARM):** Çekirdek işlev: kullanıcının seçtiği namaz vakitlerinde dakikasında bildirim. Takvim/saat benzeri zaman duyarlı bildirim.
- **Rahatsız Etme erişimi (ACCESS_NOTIFICATION_POLICY):** Yalnızca kullanıcı "Namazda sessize al" seçeneğini açarsa, vakitte telefonu 30 dk titreşime alıp geri döndürür. Bildirim içeriği okunmaz.
- **Açılışta çalış (RECEIVE_BOOT_COMPLETED):** Yeniden başlatma sonrası vakit alarmlarını yeniden kurar.
- **Yaklaşık konum:** İlçeyi bulup vakitleri hesaplamak için, isteğe bağlı. Arka planda konum **kullanılmaz**.
- **Tam ekran vakit bildirimi (isteğe bağlı, varsayılan kapalı):** `USE_FULL_SCREEN_INTENT` ve `SYSTEM_ALERT_WINDOW` ("Diğer uygulamaların üzerinde göster"). Yalnızca kullanıcı Ayarlar'da "Tam ekran bildirim"i açıp izni verirse ve yalnızca vakit girişinde, namaz vaktini hatırlatan tam ekranı açmak için kullanılır. **Play riski:** bu iki izin Play'de kısıtlıdır (tam ekran bildirim: arama/alarm uygulamaları; yer paylaşımı: gerekçe ister). İnceleme sorunu çıkarsa Play sürümünde (`IS_PLAY`) bu özelliği kapatıp yalnızca GitHub sürümünde bırakmak gerekebilir.
- Play sürümünde **kendini güncelleme ve REQUEST_INSTALL_PACKAGES yoktur**.

## Teknik not
- `targetSdk` / `compileSdk` **36** (AGP 8.9.1, Gradle 8.11.1, Kotlin 2.0.21). Android 15+ ekranı kenardan kenara çizdiği için sistem çubuğu ve klavye boşlukları `MainActivity` içinde `WindowInsets` ile yönetilir. **Gerçek telefonda durum çubuğu/gezinme çubuğu çevresini ve klavye açılışını (şehir arama kutusu) kontrol edin.**
- Play App Signing: yükleme anahtarı olarak mevcut anahtar kullanılabilir.
- Görseller: `tools/store/` (öne çıkan görsel 1024×500, 5 ekran görüntüsü 1080×2400); ikon 512: `tools/icons/play-store-icon-512.png`.
