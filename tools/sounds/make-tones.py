#!/usr/bin/env python3
"""Tam Vakti bildirim sesleri: tamamen sentezlenmiş, özgün tonlar (telif konusu yok).
Python standart kütüphanesi yeterli. Çıktı: android/app/src/main/res/raw/tone_<ad>.wav (22,05 kHz, mono, 16 bit).
Çalıştır: python3 tools/sounds/make-tones.py
"""
import math, os, struct, wave

SR = 22050
OUT = os.path.join(os.path.dirname(__file__), "..", "..", "android", "app", "src", "main", "res", "raw")

def bell(freq, dur, amp=1.0, partials=((1, 1.0, 1.0), (2.0, 0.45, 1.6), (2.76, 0.28, 2.2), (5.4, 0.12, 3.5))):
    """Çan benzeri nota: (oran, genlik, sönüm çarpanı) ortak tonlarının toplamı."""
    n = int(SR * dur)
    out = [0.0] * n
    for ratio, a, decay in partials:
        f = freq * ratio
        if f > SR / 2.2:
            continue
        for i in range(n):
            t = i / SR
            out[i] += amp * a * math.sin(2 * math.pi * f * t) * math.exp(-t * (3.2 * decay) / dur * 1.0)
    return out

def soft(freq, dur, amp=1.0):
    """Yumuşak sine + ikinci harmonik, hızlı sönümlü (marimba/damla benzeri)."""
    n = int(SR * dur)
    out = [0.0] * n
    for i in range(n):
        t = i / SR
        env = math.exp(-t * 7.0 / dur)
        out[i] = amp * env * (math.sin(2 * math.pi * freq * t) + 0.25 * math.sin(2 * math.pi * 2 * freq * t))
    return out

def mix(total, parts):
    out = [0.0] * int(SR * total)
    for start, samples in parts:
        s = int(SR * start)
        for i, v in enumerate(samples):
            if s + i < len(out):
                out[s + i] += v
    return out

def finish(samples):
    # 6 ms giriş, 60 ms çıkış yumuşatma; tepe -2 dBFS
    n = len(samples)
    a = int(SR * 0.006); r = int(SR * 0.06)
    for i in range(min(a, n)):
        samples[i] *= i / a
    for i in range(min(r, n)):
        samples[n - 1 - i] *= i / r
    peak = max(abs(x) for x in samples) or 1.0
    k = 0.79 / peak
    return [int(max(-1.0, min(1.0, x * k)) * 32767) for x in samples]

def save(name, samples):
    path = os.path.join(OUT, f"tone_{name}.wav")
    with wave.open(path, "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes(b"".join(struct.pack("<h", x) for x in finish(samples)))
    print(f"{name}: {os.path.getsize(path)//1024} KB, {len(samples)/SR:.1f} sn")

os.makedirs(OUT, exist_ok=True)
# Çağrı: iki notalı yumuşak zil (Mi5 -> Si5)
save("cagri", mix(2.1, [(0.0, bell(659.25, 1.5, 0.9)), (0.38, bell(987.77, 1.7, 1.0))]))
# Billur: tek, berrak ve uzun sönümlü çan (La5)
save("billur", mix(2.4, [(0.0, bell(880.0, 2.4, 1.0))]))
# Seher: yükselen üç nota (Do5 Mi5 Sol5)
save("seher", mix(2.3, [(0.0, soft(523.25, 1.3)), (0.30, soft(659.25, 1.3)), (0.60, soft(783.99, 1.7))]))
# Damla: iki kısa yumuşak vuruş (Sol4 -> Re5)
save("damla", mix(1.3, [(0.0, soft(392.0, 0.7)), (0.30, soft(587.33, 0.9))]))
