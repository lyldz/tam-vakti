#!/usr/bin/env bash
# Play Store simgesi (512x512, tam kare: Play köşeleri kendisi yuvarlar) ve yuvarlak önizleme.
# Kaynak: A3.svg (www/assets/icons/logo.svg ile aynı). Gerekli: rsvg-convert
set -e
cd "$(dirname "${BASH_SOURCE[0]}")"
sed 's/ rx="24"/ rx="0"/' A3.svg > /tmp/A3-square.svg
rsvg-convert -w 512 -h 512 /tmp/A3-square.svg -o play-store-icon-512.png
echo "play-store-icon-512.png hazır"

# Tam ekran vakit bildirimi için yüksek çözünürlüklü logo (köşeleri yuvarlak, saydam arka plan)
rsvg-convert -w 1024 -h 1024 A3.svg -o ../../android/app/src/main/res/drawable-nodpi/logo_full.png
echo "android/.../drawable-nodpi/logo_full.png hazır"
