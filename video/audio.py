#!/usr/bin/env python3
"""
Синтез музыкальной подложки под ролик.

Темп 120 BPM: доля 0.5 с, такт 2 с, вся дорожка — 25 тактов. Все склейки
монтажа стоят на чётных секундах, поэтому удары и переходы падают ровно
в такт без ручной подгонки.

Выход: out/audio.wav (44.1 кГц, стерео, 16 бит).
"""
import math
import os
import struct
import wave

import numpy as np

SR = 44100
BPM = 120
BEAT = 60.0 / BPM          # 0.5 с
BAR = BEAT * 4             # 2.0 с
DUR = 50.0
N = int(SR * DUR)

# Склейки монтажа — те же значения, что в blocks.js
CUTS = [6, 8, 16, 22, 28, 33, 36, 42, 45, 46.8]

t = np.arange(N) / SR
mix = np.zeros(N)

rng = np.random.default_rng(20240)


def env(start, length, attack=0.005, decay=None, curve=3.0):
    """Огибающая «щипок»: быстрая атака, экспоненциальный спад."""
    e = np.zeros(N)
    i0 = int(start * SR)
    i1 = min(N, i0 + int(length * SR))
    if i0 >= N or i1 <= i0:
        return e
    n = i1 - i0
    a = max(1, int(attack * SR))
    seg = np.ones(n)
    seg[:a] = np.linspace(0, 1, a)
    d = np.linspace(0, 1, n)
    seg *= np.exp(-curve * d) if decay is None else np.exp(-decay * d)
    e[i0:i1] = seg
    return e


def add(sig, gain=1.0):
    global mix
    mix += sig * gain


# ---------------------------------------------------------------- бас-пульс
# Основа трека: одна нота на долю, с подтяжкой высоты в атаке — даёт «удар»,
# который держит ритм даже на телефонном динамике.
beat_i = 0
tt = 0.0
while tt < DUR - 0.1:
    bar_no = int(tt / BAR)
    # мягкая гармония: тоника / субдоминанта по 4 такта
    root = 55.0 if (bar_no // 4) % 2 == 0 else 49.0   # A1 / G1
    strong = beat_i % 4 == 0
    e = env(tt, 0.46, attack=0.004, decay=7.5 if strong else 10.0)
    ph = 2 * np.pi * root * t + 2 * np.pi * 26 * np.exp(-38 * np.maximum(t - tt, 0))
    body = np.sin(ph) + 0.28 * np.sin(2 * ph)
    add(body * e, 0.50 if strong else 0.30)
    beat_i += 1
    tt += BEAT

# ---------------------------------------------------------------- хэты
# Восьмые с лёгкой качкой: чётные чуть громче, нечётные приглушены.
noise = rng.normal(0, 1, N)
# простой хай-пасс через разность — дешевле полноценного фильтра и звучит суше
hp = np.diff(noise, prepend=0)
hp = np.diff(hp, prepend=0)
tt = 0.0
k = 0
while tt < DUR - 0.1:
    if tt > 3.0:                       # вступают после первой фразы хука
        e = env(tt, 0.09, attack=0.001, decay=26)
        add(hp * e, 0.055 if k % 2 == 0 else 0.030)
    k += 1
    tt += BEAT / 2

# ---------------------------------------------------------------- арпеджио
# Появляется на демо-блоках (сайт, бот, кейсы) — там, где на экране интерфейс.
SCALE = [220.0, 261.63, 329.63, 392.0, 440.0, 523.25]
ARP_WINDOWS = [(16, 22), (22, 28), (36, 42)]
tt = 0.0
k = 0
while tt < DUR - 0.1:
    if any(a <= tt < b for a, b in ARP_WINDOWS):
        f = SCALE[k % len(SCALE)]
        e = env(tt, 0.42, attack=0.006, decay=9)
        v = np.sin(2 * np.pi * f * t) + 0.4 * np.sin(2 * np.pi * f * 2.005 * t)
        add(v * e, 0.052)
    k += 1
    tt += BEAT / 2

# ---------------------------------------------------------------- пэд
# Тихая подушка на весь ролик — склеивает блоки, чтобы паузы не звучали пусто.
pad = np.zeros(N)
for f, g in [(110.0, 1.0), (164.81, 0.6), (220.0, 0.42), (329.63, 0.22)]:
    drift = 1 + 0.0016 * np.sin(2 * np.pi * 0.07 * t + f)
    pad += g * np.sin(2 * np.pi * f * t * drift)
pad_env = np.clip((t - 1.0) / 3.0, 0, 1) * np.clip((DUR - 1.2 - t) / 3.0, 0, 1)
pad_env *= 0.85 + 0.15 * np.sin(2 * np.pi * 0.11 * t)
add(pad * pad_env, 0.030)

# ---------------------------------------------------------------- удары на склейках
for c in CUTS:
    add(env(c, 1.1, attack=0.002, decay=5.5) * np.sin(2 * np.pi * 44 * t
        + 2 * np.pi * 30 * np.exp(-16 * np.maximum(t - c, 0))), 0.42)
    add(env(c, 0.30, attack=0.001, decay=15) * hp, 0.12)

# ---------------------------------------------------------------- райзер к логотипу
# 43.0 → 46.8: шум с подъёмом полосы + глиссандо, обрывается на появлении лого.
r0, r1 = 43.0, 46.8
ri0, ri1 = int(r0 * SR), int(r1 * SR)
ramp = np.zeros(N)
ramp[ri0:ri1] = np.linspace(0, 1, ri1 - ri0) ** 2.2
sweep = np.sin(2 * np.pi * (180 + 900 * np.clip((t - r0) / (r1 - r0), 0, 1) ** 2) * t)
add(hp * ramp, 0.10)
add(sweep * ramp, 0.055)

# Финальный удар и «выдох» на логотипе
add(env(46.8, 2.6, attack=0.002, decay=2.2) * np.sin(2 * np.pi * 55 * t), 0.55)
add(env(46.8, 0.6, attack=0.001, decay=9) * hp, 0.22)

# ---------------------------------------------------------------- сведение
# Мягкое ограничение вместо жёсткого клиппинга: tanh не даёт «песка» на пиках.
mix = np.tanh(mix * 1.25) * 0.86

# фейды по краям
fi = int(0.25 * SR)
mix[:fi] *= np.linspace(0, 1, fi)
fo = int(0.55 * SR)
mix[-fo:] *= np.linspace(1, 0, fo)

# Стерео: арпеджио и хэты чуть разводятся по каналам коротким сдвигом.
d = int(0.006 * SR)
left = mix.copy()
right = np.concatenate([np.zeros(d), mix[:-d]]) * 0.92 + mix * 0.08
stereo = np.stack([left, right], axis=1)
stereo = np.clip(stereo, -1.0, 1.0)

out = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'out', 'audio.wav')
os.makedirs(os.path.dirname(out), exist_ok=True)
with wave.open(out, 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((stereo * 32767).astype('<i2').tobytes())

print(f'аудио: {out} · {DUR:.0f}с · {BPM} BPM · удары на {len(CUTS)} склейках')
