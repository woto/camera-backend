#!/usr/bin/env bash
set -euo pipefail

# multicam_offsets_json.sh
#
# Prints ONLY JSON to stdout.
# Computes audio-based offsets for each input file relative to the first file (base).
#
# Definition:
#   offset_sec (can be +/-)
#     + -> file starts later than base
#     - -> file starts earlier than base
#
# Usage:
#   ./multicam_offsets_json.sh [-d SECONDS] [-r HZ] base.mp4 cam2.mp4 [cam3.mp4 ...]
#
# Requirements:
#   ffmpeg, ffprobe, python3, numpy (pip install numpy)

export LC_ALL=C
export LANG=C

DUR=90
SR=8000

while getopts ":d:r:" opt; do
  case "$opt" in
  d) DUR="$OPTARG" ;;
  r) SR="$OPTARG" ;;
  *)
    echo "Usage: $0 [-d seconds] [-r hz] base.mp4 cam2.mp4 [cam3.mp4 ...]" >&2
    exit 1
    ;;
  esac
done
shift $((OPTIND - 1))

if [ "$#" -lt 2 ]; then
  echo "Usage: $0 [-d seconds] [-r hz] base.mp4 cam2.mp4 [cam3.mp4 ...]" >&2
  exit 1
fi

command -v ffmpeg >/dev/null || {
  echo "ERROR: ffmpeg not found" >&2
  exit 1
}
command -v ffprobe >/dev/null || {
  echo "ERROR: ffprobe not found" >&2
  exit 1
}
command -v python3 >/dev/null || {
  echo "ERROR: python3 not found" >&2
  exit 1
}

has_audio() {
  local f="$1"
  ffprobe -hide_banner -loglevel error \
    -select_streams a:0 -show_entries stream=codec_name -of csv=p=0 "$f" | grep -q .
}

extract_f32() {
  local in="$1"
  local out="$2"
  ffmpeg -hide_banner -loglevel error \
    -t "$DUR" -i "$in" -vn -ac 1 -ar "$SR" -f f32le "$out"
}

BASE="$1"
shift
FILES=("$BASE" "$@")
N="${#FILES[@]}"

TMPDIR="$(mktemp -d)"
cleanup() { rm -rf "$TMPDIR"; }
trap cleanup EXIT

if ! has_audio "$BASE"; then
  echo "ERROR: base file has no audio stream; cannot compute offsets: $BASE" >&2
  exit 1
fi

BASE_F32="$TMPDIR/base.f32"
extract_f32 "$BASE" "$BASE_F32"

calc_offset_py='
import sys, numpy as np
sr = int(sys.argv[1])
ref_path = sys.argv[2]
tgt_path = sys.argv[3]

def read_f32(p):
    x = np.fromfile(p, dtype=np.float32)
    if x.size == 0:
        raise SystemExit("empty audio")
    x = x - np.mean(x)
    m = np.max(np.abs(x))
    if m > 0:
        x = x / m
    return x

a = read_f32(ref_path)
b = read_f32(tgt_path)

n = min(a.size, b.size)
a = a[:n]; b = b[:n]

m = 1
while m < 2*n:
    m <<= 1

A = np.fft.rfft(a, m)
B = np.fft.rfft(b, m)
corr = np.fft.irfft(A * np.conj(B), m)

corr = np.concatenate((corr[-(n-1):], corr[:n]))
lag = int(np.argmax(corr) - (n-1))
offset_seconds = -lag / sr   # + => target starts later than ref
print(offset_seconds)
'

# Offsets array aligned with FILES: base offset is 0.0
OFFSETS=("0.0")

for ((i = 1; i < N; i++)); do
  f="${FILES[$i]}"

  if ! has_audio "$f"; then
    # If no audio, fall back to 0.0 (still emit JSON; caller can decide what to do)
    OFFSETS+=("0.0")
    continue
  fi

  tgt_f32="$TMPDIR/file$((i + 1)).f32"
  extract_f32 "$f" "$tgt_f32"

  off="$(
    python3 - "$SR" "$BASE_F32" "$tgt_f32" <<PY
$calc_offset_py
PY
  )"
  off="$(printf "%s" "$off" | tr -d ' \n\r\t')"
  # minimal sanity: if empty, use 0.0
  if [ -z "$off" ]; then off="0.0"; fi
  OFFSETS+=("$off")
done

# Emit JSON only
python3 - "$BASE" "$DUR" "$SR" "${FILES[@]}" "${OFFSETS[@]}" <<'PY'
import sys, json

base = sys.argv[1]
dur = float(sys.argv[2])
sr  = int(sys.argv[3])

rest = sys.argv[4:]
n = len(rest)//2
files = rest[:n]
offs  = rest[n:n+n]

cams = []
for f, o in zip(files, offs):
    try:
        off = float(o)
    except:
        off = 0.0
    cams.append({"file": f, "offset_sec": off})

out = {
    "base_file": base,
    "analyze_duration_sec": dur,
    "sample_rate_hz": sr,
    "files": cams
}

print(json.dumps(out, ensure_ascii=False))
PY
