# Güvenlik taraması — 2026-11-10

Kapsam: git geçmişi (tüm dallar), izlenen dosyalar, workflow, v2.7.2 APK içeriği, manifest, WebView, güncelleme indirmesi.

## Bulgular
| # | Durum | Bulgu | Ne yapıldı |
|---|---|---|---|
| 1 | **Bilgi** | Eski imza anahtarı (`android/app/release-key.jks`) ve parolası (`build.gradle.kts` içinde) eski commitlerde (2eb94eb, 98c13b6) **herkese açık depoda** duruyor. | Yayın artık yeni anahtarla imzalanıyor (APK sertifikası SHA-256 `566d48be…17f5`, eski anahtar `E53C8BD2…D3B1`). Eski anahtar yayında kullanılmıyor. Eski anahtarla imzalı eski sürümü hâlâ kuran biri olursa o anahtarla sahte güncelleme imzalanabilir; bu yüzden eski anahtar bir daha kullanılmamalı. Geçmişi silmek tüm etiket/yayınları bozar, önerilmez. |
| 2 | **Bilgi** | 19 commit'te yazar e-postası Gmail adresi olarak görünüyor (açık depoda). | Geçmişten silinmedi (zorla yeniden yazma gerekir). Yeni commitler `noreply` ile atılıyor. GitHub > Settings > Emails > "Keep my email addresses private" + "Block command line pushes that expose my email" açılsın. |
| 3 | Düzeltildi | WebView `allowFileAccess`/`allowContentAccess` açıktı. | Kapatıldı; `allowFileAccessFromFileURLs`/`UniversalAccess` kapalı, karma içerik engelli. |
| 4 | Düzeltildi | `window.open` / dış bağlantılar uygulama sayfasının yerine yüklenebilir, `AndroidBridge` dış siteye açılabilirdi. | `shouldOverrideUrlLoading`: yalnızca `file:///android_asset/` uygulama içinde, http(s) bağlantılar tarayıcıda açılır. |
| 5 | Düzeltildi | APK indirirken yönlendirmeler doğrulanmıyordu. | Yönlendirme yalnızca `https` + `github.com` / `*.githubusercontent.com`. (Kurulumda Android zaten aynı imzayı şart koşar.) |
| 6 | Düzeltildi | `.gitignore` `.env`, `.pem`, `.p12`, `KEYSTORE_BASE64*` dosyalarını kapsamıyordu. | Eklendi. |

## Temiz çıkanlar
- Mevcut izlenen dosyalarda ve APK içinde (`assets`, `classes.dex`, manifest) API anahtarı, token, parola, `.env`, `AIza…`, `ghp_…` bulunmadı.
- Keystore GitHub Secrets'ta (`KEYSTORE_BASE64`, `KEYSTORE_PASSWORD`, `KEY_ALIAS`, `KEY_PASSWORD`); workflow gizli bilgiyi günlüğe yazmıyor, `permissions: contents: write` ile sınırlı.
- Manifest: `AlarmReceiver` ve diğer iç bileşenler `exported=false`; dışa açık olanlar (Main, BootReceiver, Widget) gerekli ve yalnızca sistem eylemleri dinliyor. `usesCleartextTraffic` yok, `http://` adresi yok.
- Güncelleme indirme köprüsü yalnızca `https://github.com/lyldz/tam-vakti/` adresine izin veriyor.

## Açık (kullanıcı kararı)
- `allowBackup="true"`: ayarlar ve konum yedeğe girer. Gizlilik istenirse `false` yapılabilir (cihaz değişince ayarlar geri gelmez).
- Workflow'daki action'lar sürüm etiketiyle (`@v4`) kullanılıyor; en sıkı güvenlik için tam commit SHA'sına sabitlenebilir.
- Eski anahtar dosyaları `/root/anahtarlar` ve `/root/.tamvakti-keys` içinde duruyor; sunucu yedeği dışında paylaşılmamalı.
