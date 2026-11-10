#!/usr/bin/env python3
"""Namaz vakti bildirimi icin 6 ozgun sentez ses (44.1 kHz, 16 bit, mono).
Yalnizca standart kutuphane. Cikti: aday/tone_<ad>.wav ; denetim: python3 make-tones-v2.py"""
import math, os, random, struct, wave, cmath

SR = 44100
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "aday")
TAU = 2 * math.pi


def n_(t): return int(t * SR)


def mix(buf, t0, x, g=1.0):
    s = n_(t0)
    for i, v in enumerate(x):
        j = s + i
        if j >= len(buf): break
        buf[j] += v * g


def attack(i, a):  # dogrusal giris
    return i / a if i < a else 1.0


# ---------- sesler ----------
def glass_bell(f, dur, tau):
    # cam cinirdagi: hafif inharmonik kismi tonlar
    parts = [(1.0, 1.0, 1.0), (2.0, 0.35, 0.6), (2.76, 0.30, 0.45), (4.07, 0.10, 0.25), (5.4, 0.06, 0.15)]
    n = n_(dur); out = [0.0] * n; a = n_(0.004)
    for r, amp, td in parts:
        fr = f * r
        if fr > 4500: continue
        w = TAU * fr / SR; tt = tau * td
        for i in range(n):
            out[i] += amp * math.sin(w * i) * math.exp(-i / SR / tt) * attack(i, a)
    return out


def drop(f, dur, tau, sweep=0.55):
    # pitch'i dusen damla: frekans f*(1+sweep*e^{-t/0.06}) -> f
    n = n_(dur); out = [0.0] * n; ph = 0.0; a = n_(0.006)
    for i in range(n):
        t = i / SR
        fi = f * (1.0 + sweep * math.exp(-t / 0.07))
        ph += TAU * fi / SR
        env = math.exp(-t / tau) * attack(i, a)
        out[i] = env * (math.sin(ph) + 0.18 * math.sin(2 * ph)) 
    return out


def ney_phrase(notes, total, rng):
    # notes: (f, start, end). Tek faz biriktiricisi, legato; sinus + harmonikler + nefes gurultusu
    n = n_(total); out = [0.0] * n; ph = 0.0
    lp1 = lp2 = 0.0; f_cur = notes[0][0]
    for i in range(n):
        t = i / SR
        tgt = None; env = 0.0
        for (f, s, e) in notes:
            if s <= t < e + 0.25:
                a_ = min(1.0, (t - s) / 0.09)
                if t < e: r_ = 1.0
                else: r_ = math.exp(-(t - e) / 0.12)
                v = a_ * r_
                if v > env or tgt is None:
                    if v >= env: env = v; tgt = f
        if tgt is None: tgt = f_cur
        f_cur += (tgt - f_cur) * 0.0025  # yumusak glissando
        # hafif sonum (son nota)
        last_e = notes[-1][2]
        if t > last_e: env *= math.exp(-(t - last_e) / 0.5)
        vib_depth = 0.004 * min(1.0, t / 0.5)
        fi = f_cur * (1 + vib_depth * math.sin(TAU * 5.0 * t))
        ph += TAU * fi / SR
        tone = math.sin(ph) + 0.28 * math.sin(2 * ph) + 0.12 * math.sin(3 * ph) + 0.04 * math.sin(4 * ph)
        # nefes: bandlimitli gurultu (1 kutuplu iki alcak gecirgen farki ~ bant gecirgen)
        w = rng.uniform(-1, 1)
        lp1 += (w - lp1) * 0.25; lp2 += (w - lp2) * 0.04
        breath = (lp1 - lp2) * 1.2
        swell = 0.85 + 0.15 * math.sin(TAU * 0.4 * t)
        out[i] = env * swell * (0.8 * tone + 0.30 * breath * (1.0 + 0.5 * math.sin(TAU * 5.0 * t)))
    return out


def karplus(f, dur, t60, bright, rng, pick=0.5, cur=0.5):
    n = n_(dur); P = SR / f - 0.5
    N = int(P - 0.5); d = P - N; a = (1 - d) / (1 + d)
    # uyarim: alcak gecirilmis gurultu (parlaklik = kutup katsayisi), cekim noktasi comb'u
    buf = []; y = 0.0
    for _ in range(N):
        y += (rng.uniform(-1, 1) - y) * bright
        buf.append(y)
    k = max(1, int(N * pick * 0.5))
    buf = [buf[i] - 0.5 * buf[i - k] for i in range(N)]
    m = sum(buf) / N; buf = [v - m for v in buf]
    g = 0.001 ** (1.0 / (f * t60))
    out = [0.0] * n; prev = 0.0; x1 = y1 = 0.0; idx = 0
    for i in range(n):
        x = buf[idx]; out[i] = x
        lp = (cur * x + (1 - cur) * prev) * g; prev = x
        yy = a * lp + x1 - a * y1; x1 = lp; y1 = yy
        buf[idx] = yy
        idx += 1
        if idx == N: idx = 0
    # kisa atak yumusatma
    for i in range(n_(0.003)): out[i] *= i / n_(0.003)
    return out


def pad(freqs_amps, dur, rng):
    n = n_(dur); out = [0.0] * n
    for f, amp in freqs_amps:
        for det in (-1.6, 0.0, 1.8):  # hafif koro
            fd = f * 2 ** (det / 1200)
            w = TAU * fd / SR; p0 = rng.uniform(0, TAU)
            for i in range(n):
                t = i / SR
                env = (1 - math.exp(-t / 0.05)) ** 2 * math.exp(-max(0.0, t - 0.15) / 1.1)
                ph = w * i + p0
                out[i] += amp * env * (math.sin(ph) + 0.35 * math.sin(2 * ph) + 0.12 * math.sin(3 * ph)) / 3
    # yavas atak ~120 ms: ek gerceklestirme
    for i in range(n_(0.12)):
        out[i] *= 0.5 - 0.5 * math.cos(math.pi * i / n_(0.12))
    return out


# ---------- isleme ----------
def reverb(x, wet, fb=0.82, damp=0.35, scale=1.0):
    combs = [1557, 1617, 1491, 1422, 1277, 1356]
    aps = [225, 556, 441]
    n = len(x); acc = [0.0] * n
    for cd in combs:
        D = int(cd * scale); b = [0.0] * D; idx = 0; lp = 0.0
        for i in range(n):
            o = b[idx]; lp = o * (1 - damp) + lp * damp
            b[idx] = x[i] + lp * fb
            acc[i] += o
            idx += 1
            if idx == D: idx = 0
    for ad in aps:
        b = [0.0] * ad; idx = 0; gg = 0.5
        for i in range(n):
            o = b[idx]; v = acc[i] + gg * o
            b[idx] = v; acc[i] = o - gg * v
            idx += 1
            if idx == ad: idx = 0
    return [x[i] + wet * acc[i] / len(combs) * 2.2 for i in range(n)]


def onepole_lp(x, fc):
    a = 1 - math.exp(-TAU * fc / SR); y = 0.0; o = []
    for v in x:
        y += a * (v - y); o.append(y)
    return o


def highpass(x, fc):
    lp = onepole_lp(x, fc)
    return [a - b for a, b in zip(x, lp)]


def finish(x, T, target_rms=0.1, peak_max=0.70):
    x = highpass(x, 35)
    for _ in range(2): x = onepole_lp(x, 3300)
    x = x[:n_(T)]
    n = len(x)
    fi = n_(0.012); fo = n_(0.150)
    for i in range(fi): x[i] *= 0.5 - 0.5 * math.cos(math.pi * i / fi)
    for i in range(fo): x[n - 1 - i] *= 0.5 - 0.5 * math.cos(math.pi * i / fo)
    # yumusak sinirlama sonra olcekleme
    pk = max(abs(v) for v in x); rms = math.sqrt(sum(v * v for v in x) / n)
    g = min(target_rms / rms, peak_max / pk)
    return [v * g for v in x]


def write_wav(path, x):
    with wave.open(path, "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes(b"".join(struct.pack("<h", max(-32767, min(32767, int(round(v * 32767))))) for v in x))


# ---------- besteler ----------
def sabah_cani():
    T = 3.2; buf = [0.0] * n_(T + 1.5)
    for k, (f, t0) in enumerate([(392, 0.0), (440, 0.38), (494, 0.76), (587, 1.14)]):
        mix(buf, t0, glass_bell(f, 2.6, 0.9 + 0.1 * k), 1.0)
    mix(buf, 1.14, glass_bell(196, 2.0, 1.0), 0.18)  # sol, hafif alt zemin
    return finish(reverb(buf, 0.9, fb=0.84, damp=0.4), T)


def su_damlasi():
    T = 2.8; buf = [0.0] * n_(T + 1.5)
    for f, t0, g in [(587, 0.0, 1.0), (440, 0.55, 0.85), (294, 1.15, 0.8)]:
        mix(buf, t0, drop(f, 0.9, 0.17), g)
    return finish(reverb(buf, 1.2, fb=0.86, damp=0.45, scale=1.25), T)


def ney_nefesi():
    rng = random.Random(7); T = 4.0; buf = [0.0] * n_(T + 1.0)
    notes = [(294, 0.0, 0.75), (311, 0.75, 1.2), (370, 1.2, 1.8), (392, 1.8, 2.3), (440, 2.3, 3.3)]
    x = ney_phrase(notes, T + 1.0, rng)
    for i, v in enumerate(x): buf[i] = v
    return finish(reverb(buf, 0.7, fb=0.8, damp=0.5), T)


def ud_teli():
    rng = random.Random(11); T = 3.2; buf = [0.0] * n_(T + 1.2)
    for f, t0 in [(294, 0.0), (370, 0.30), (440, 0.60), (587, 0.90)]:
        mix(buf, t0, karplus(f, 2.8, 4.0, 0.12, rng, pick=0.35, cur=0.72), 1.0)
    return finish(reverb(buf, 0.55, fb=0.8, damp=0.45), T)


def kanun_ciseleyisi():
    rng = random.Random(23); T = 3.2; buf = [0.0] * n_(T + 1.2)
    for k, (f, t0) in enumerate([(880, 0.0), (784, 0.17), (659, 0.34), (587, 0.51), (440, 0.68)]):
        for det in (-3, 0, 3):  # uc tel
            mix(buf, t0, karplus(f * 2 ** (det / 1200), 2.8, 3.5, 0.2, rng, pick=0.2, cur=0.65), 0.55)
    return finish(reverb(buf, 0.7, fb=0.82, damp=0.4), T)


def yumusak_akor():
    rng = random.Random(5); T = 3.4
    x = pad([(196, 1.0), (247, 0.8), (294, 0.8), (587, 0.12)], T + 1.0, rng)
    return finish(reverb(x, 0.5, fb=0.8, damp=0.5), T)


TONES = {"sabah_cani": sabah_cani, "su_damlasi": su_damlasi, "ney_nefesi": ney_nefesi,
         "ud_teli": ud_teli, "kanun_ciseleyisi": kanun_ciseleyisi, "yumusak_akor": yumusak_akor}


# ---------- denetim ----------
def fft(a):
    n = len(a); j = 0
    for i in range(1, n):
        bit = n >> 1
        while j & bit: j ^= bit; bit >>= 1
        j ^= bit
        if i < j: a[i], a[j] = a[j], a[i]
    L = 2
    while L <= n:
        w = cmath.exp(-TAU * 1j / L); h = L // 2
        for s in range(0, n, L):
            ww = 1
            for k in range(h):
                u = a[s + k]; v = a[s + k + h] * ww
                a[s + k] = u + v; a[s + k + h] = u - v; ww *= w
        L <<= 1
    return a


def db(v): return 20 * math.log10(max(v, 1e-9))


def check(name, path):
    with wave.open(path) as w:
        assert (w.getframerate(), w.getsampwidth(), w.getnchannels()) == (SR, 2, 1)
        raw = w.readframes(w.getnframes())
    x = [s / 32768 for s in struct.unpack("<%dh" % (len(raw) // 2), raw)]
    n = len(x); rms = lambda s: math.sqrt(sum(v * v for v in s) / len(s))
    pk = max(abs(v) for v in x)
    jump = max(abs(x[i] - x[i - 1]) for i in range(1, n))
    tail = next((k for k, v in enumerate(reversed(x)) if abs(v) > 0.001), n) / SR * 1000
    N = 1 << 18; sp = fft([complex(v) for v in x] + [0j] * (N - n))
    tot = sum(abs(c) ** 2 for c in sp[:N // 2]); hf = sum(abs(c) ** 2 for c in sp[int(4000 * N / SR):N // 2])
    return (name, n / SR, db(pk), db(rms(x)), db(rms(x[:n_(.05)])), db(rms(x[-n_(.05):])),
            jump, sum(x) / n, tail, 10 * math.log10(max(hf / tot, 1e-12)))


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    rows = []
    for name, fn in TONES.items():
        p = os.path.join(OUT, "tone_%s.wav" % name)
        write_wav(p, fn()); rows.append(check(name, p))
    print("ad              sure  tepe   RMS   ilk50  son50  sicrama  DC      sessiz_ms >4k_dB")
    for r in rows:
        print("%-16s%4.2f %6.1f %6.1f %6.1f %6.1f  %.3f  %+.5f  %5.1f  %6.1f" % r)
