# Tam Vakti: devir notu (güncel: 2026-11-10, v2.8.0 "Zeval")

Depo: /root/tam-vakti (github.com/lyldz/tam-vakti, herkese açık, dal: main). Hafıza: /root/.claude/projects/-root/memory/tam-vakti.md

## Devam
    cd /root/tam-vakti && claude --continue
Yerelde Gradle çalışmaz; Kotlin yalnızca GitHub Actions'ta derlenir (`gh` oturumu açık). Web: `www/` → `android/app/src/main/assets/www/` eşitle (`cp -r www/. ...`, `diff -rq`, `node --check`).

## Durum
- Yayında: v2.8.0 "Zeval" (10 bildirim sesi: 6 yeni, kullanıcı dinledi, hepsi beğenildi; sabit bildirimde ilerleme çubuğu + logo simgesi + açık/koyu tema; güvenlik sıkılaştırması ve çöp temizliği v2.7.3'te).
- Canlı Güncelleme (Android 16) v2.7.2'de denendi, Xiaomi'de başarısız, v2.7.4'te kaldırıldı. Kullanıcı istemedikçe önerme (ayrıntı hafızada).
- main temiz, tüm iş yayında.

## Sürümleme
Katı SemVer, her minor için kod adı (CODENAMES). `./release.sh feature|fix|major|X.Y.Z "mesaj" [--dry]`; sürüm notu `notes/<etiket>.md`. Yalnızca kullanıcı "vX.Y.Z olarak yayınla" deyince yayınla. Ayrıntı: AGENTS.md bölüm 2.

## Sırada (TODO.md)
1. Ramazan modu (beklemede, kullanıcı "erken" dedi)
2. Gerçek ezan klibi (düşük öncelik, lisans şartı)
3. Google Play hazırlığı (ertelendi): hesap, alan adı + destek e-postası, gizlilik, veri güvenliği formu, izin beyanları (tam ekran/overlay riski), ekran görüntüleri, 14 gün kapalı test
