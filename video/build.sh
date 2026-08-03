#!/usr/bin/env bash
# Полная сборка ролика: кадры → видео → звук → финальный MP4.
#
#   ./build.sh              30 fps (по умолчанию)
#   FPS=60 ./build.sh       60 fps
#   SHARDS=4 ./build.sh     число параллельных рендер-процессов
set -euo pipefail
cd "$(dirname "$0")"

FPS="${FPS:-30}"
# CRF 26 — зерно съедает битрейт, но на глаз 26 и 20 неотличимы даже на
# мелком тексте, а файл получается в пять раз легче. CRF=20 — для архива.
CRF="${CRF:-26}"
SHARDS="${SHARDS:-4}"
OUT="out/auvix-studio-${FPS}fps.mp4"

echo "▸ рендер кадров (${FPS} fps, ${SHARDS} процессов)"
rm -rf out/frames && mkdir -p out/frames
pids=()
for i in $(seq 0 $((SHARDS - 1))); do
  FPS="$FPS" node render.mjs --shard "$i/$SHARDS" &
  pids+=($!)
done
for p in "${pids[@]}"; do wait "$p"; done

COUNT=$(find out/frames -name '*.png' | wc -l)
EXPECT=$((FPS * 50))
echo "▸ кадров: $COUNT из $EXPECT"
[ "$COUNT" -eq "$EXPECT" ] || { echo "!! кадры потеряны"; exit 1; }

echo "▸ звук"
python3 audio.py

echo "▸ сборка"
ffmpeg -y -v error -framerate "$FPS" -pattern_type glob -i 'out/frames/*.png' \
  -i out/audio.wav \
  -c:v libx264 -preset slow -crf "$CRF" -pix_fmt yuv420p \
  -profile:v high -level 4.2 -movflags +faststart \
  -c:a aac -b:a 160k -ar 44100 \
  -shortest "$OUT"

ls -lh "$OUT"
echo "▸ готово: $OUT"
