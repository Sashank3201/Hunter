#!/bin/sh
# Compares model settings on the natural validation set (collected chats held out), two at a time.
# Usage: sh tune.sh <outdir>
OUT=${1:-/tmp/arrow-tune}; mkdir -p "$OUT"; cd "$(dirname "$0")"
run(){ name=$1; shift; node train.js --natval --out "$OUT/$name.bin" "$@" > "$OUT/$name.log" 2>&1; echo "$name: $(grep -o 'natural [0-9.]*%' "$OUT/$name.log" | tail -1)  $(grep -o '([0-9]* KB)' "$OUT/$name.log")"; }
run base   --epochs 10 &
run wide   --epochs 10 --H 128 &
wait
run ng345  --epochs 10 --ng 3,4,5 &
run skip   --epochs 10 --skip &
wait
run small  --epochs 10 --B 8192 &
run d24    --epochs 10 --D 24 &
wait
