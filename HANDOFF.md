# Tam Vakti: devir notu (güncel: 2026-11-10, v2.7.2 "Duha")

Depo: /root/tam-vakti (github.com/lyldz/tam-vakti, herkese açık, dal: main). Hafıza: /root/.claude/projects/-root/memory/tam-vakti.md

## Devam
    cd /root/tam-vakti && claude --continue
Yerelde Gradle çalışmaz; Kotlin yalnızca GitHub Actions'ta derlenir (`gh` oturumu açık). Web: `www/` → `android/app/src/main/assets/www/` eşitle (`cp -r www/. ...`, `diff -rq`, `node --check`).

## Durum
- Yayında: v2.7.2 (Android 16 Canlı Güncelleme, sabit bildirimde ilerleme çubuğu, logo durum simgesi, açık/koyu tema, bildirim sesi seçimi, tam ekran vakit bildirimi, hesaplama yöntemi seçimi, 30 günlük alarm ufku).
- main'de, sürüme girmemiş: güvenlik sıkılaştırması (docs/GUVENLIK.md) ve çöp temizliği.
- Telefonda (Xiaomi, HyperOS 3) DENENMEDİ: canlı bildirim, tam ekran bildirim, ses seçimi, Xiaomi uygulama kilidi adımları, Alarmları yeniden kur.

## Sürümleme
Katı SemVer, her minor için kod adı (CODENAMES). `./release.sh feature|fix|major|X.Y.Z "mesaj" [--dry]`; sürüm notu `notes/<etiket>.md`. Yalnızca kullanıcı "vX.Y.Z olarak yayınla" deyince yayınla. Ayrıntı: AGENTS.md bölüm 2.

## Sırada (TODO.md)
1. Daha kaliteli bildirim sesleri (alt ajanlarla)
2. Çöp temizliği + işleyiş/hata taraması (devam ediyor)
3. Ramazan modu (beklemede), gerçek ezan klibi (düşük öncelik, lisans şartı)
4. Play Console: store/PLAY_STORE.md (acele yok), alan adı + destek e-postası kararı kullanıcıda

## Dosyalar
- İmza anahtarları: /root/anahtarlar ve /root/.tamvakti-keys (silme/taşıma/git'e ekleme). GitHub Secrets'ta 4 secret var.
- Araçlar: tools/ (smoke.js, fit.js, shot.js, lib.js, store/make.js, icons/, sounds/make-tones.py; `cd tools && npm i`)
- Dokümanlar: docs/ (RAKIP-ANALIZI, GELIR-MODELI, EZAN-SESI-ARASTIRMA, GUVENLIK, KURULUM, gizlilik sayfası index.html)
