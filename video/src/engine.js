/**
 * Детерминированный движок анимации.
 *
 * Ключевой принцип: ни одной CSS-анимации и ни одного requestAnimationFrame.
 * Всё состояние сцены — чистая функция от номера кадра. Это даёт побитово
 * повторяемый рендер: Playwright может шагать по кадрам как угодно медленно,
 * а картинка будет ровно той же, что при воспроизведении в реальном времени.
 */

(function () {
'use strict';

const FPS = 30;
const DUR = 50; // секунд
const W = 1080;
const H = 1920;

window.VIDEO = { FPS, DUR, W, H, FRAMES: FPS * DUR };

/* ---------- математика ---------- */

const clamp = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v);

/** Локальный прогресс 0..1 на отрезке [a,b] абсолютного времени. */
const seg = (t, a, b) => clamp((t - a) / (b - a));

const ease = {
  linear: (p) => p,
  outCubic: (p) => 1 - Math.pow(1 - p, 3),
  outQuint: (p) => 1 - Math.pow(1 - p, 5),
  inCubic: (p) => p * p * p,
  inOutCubic: (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2),
  outExpo: (p) => (p >= 1 ? 1 : 1 - Math.pow(2, -10 * p)),
  inOutExpo: (p) =>
    p === 0 ? 0 : p >= 1 ? 1 : p < 0.5
      ? Math.pow(2, 20 * p - 10) / 2
      : (2 - Math.pow(2, -20 * p + 10)) / 2,
  outBack: (p) => {
    const c = 1.70158, c3 = c + 1;
    return 1 + c3 * Math.pow(p - 1, 3) + c * Math.pow(p - 1, 2);
  },
  /** Затухающая пружина — для «щелчка» карточек и логотипа. */
  spring: (p) => {
    if (p >= 1) return 1;
    return 1 - Math.pow(2, -9 * p) * Math.cos(p * Math.PI * 3.2);
  },
};

/** Трапеция: 0 → 1 (за rise) → держим → 0 (за fall). Для показа блоков. */
function hold(t, start, end, rise = 0.4, fall = 0.4) {
  if (t < start || t > end) return 0;
  return Math.min(seg(t, start, start + rise), 1 - seg(t, end - fall, end));
}

/** Детерминированный шум: одинаковый на одном и том же кадре. */
function nz(seed) {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

window.M = { clamp, seg, ease, hold, nz };

/* ---------- DOM-хелперы ---------- */

function el(tag, cls, parent) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (parent) parent.appendChild(n);
  return n;
}

/** Разбивает строку на слова-спаны (\n = перенос) для пословной анимации. */
function splitWords(node, text) {
  node.textContent = '';
  const out = [];
  text.split('\n').forEach((line, li, lines) => {
    const lineEl = el('span', 'line', node);
    line.split(' ').forEach((w) => {
      const s = el('span', 'w', lineEl);
      s.textContent = w;
      out.push(s);
    });
    if (li < lines.length - 1) el('br', null, node);
  });
  return out;
}

/** То же, но по буквам — для крупных заголовков. */
function splitChars(node, text) {
  node.textContent = '';
  const out = [];
  [...text].forEach((c) => {
    const s = el('span', 'c', node);
    s.textContent = c === ' ' ? ' ' : c;
    out.push(s);
  });
  return out;
}

window.DOM = { el, splitWords, splitChars };

/* ---------- «жидкий хром» ---------- */

/**
 * Хром-объекты собраны из conic-gradient + SVG-фильтра искажения, а не из
 * готовых 3D-рендеров: так они остаются векторными, весят ноль и
 * перекрашиваются под лаймовую палитру одной переменной.
 */
function chromeArt(kind, parent) {
  const wrap = el('div', 'art art-' + kind, parent);
  const core = el('div', 'art-core', wrap);
  el('div', 'art-shine', wrap);
  el('div', 'art-rim', wrap);
  if (kind === 'wave') {
    core.innerHTML = `<svg viewBox="0 0 200 200" preserveAspectRatio="none">
      <path class="wv" d="M8 100 L28 100 L38 62 L50 138 L62 40 L74 160 L86 74 L98 126 L110 52 L122 148 L134 88 L146 112 L158 100 L192 100"
            fill="none" stroke="currentColor" stroke-width="4"
            stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  } else if (kind === 'grid') {
    let d = '';
    for (let i = 0; i <= 4; i++) {
      const p = 20 + i * 40;
      d += `M20 ${p} L180 ${p} M${p} 20 L${p} 180 `;
    }
    core.innerHTML = `<svg viewBox="0 0 200 200"><path d="${d}" fill="none"
      stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>`;
  } else if (kind === 'knot') {
    core.innerHTML = `<svg viewBox="0 0 200 200"><path fill="none" stroke="currentColor"
      stroke-width="6" stroke-linecap="round"
      d="M100 30 C160 30 170 100 100 100 C30 100 40 170 100 170 C160 170 170 100 100 100 C30 100 40 30 100 30 Z"/></svg>`;
  }
  return wrap;
}

window.chromeArt = chromeArt;

/* ---------- курсор ---------- */

function makeCursor(parent) {
  const c = el('div', 'cursor', parent);
  c.innerHTML = `<svg viewBox="0 0 24 24"><path d="M4 2 L4 20 L9 15.5 L12.2 22 L15.6 20.4 L12.4 14 L19 14 Z"
    fill="#fff" stroke="#05070A" stroke-width="1.2" stroke-linejoin="round"/></svg>
    <span class="ripple"></span>`;
  return c;
}

/**
 * @param {number} p        прогресс перелёта 0..1
 * @param {number} clickAt  момент клика внутри перелёта (в долях p)
 */
function moveCursor(c, from, to, p, clickAt) {
  const e = ease.inOutCubic(clamp(p));
  const x = from[0] + (to[0] - from[0]) * e;
  const y = from[1] + (to[1] - from[1]) * e;
  let s = 1;
  let rp = 0;
  if (clickAt != null && p >= clickAt) {
    rp = clamp((p - clickAt) / 0.18);
    s = 1 - 0.18 * Math.sin(clamp(rp / 0.5) * Math.PI);
  }
  c.style.transform = `translate(${x}px, ${y}px) scale(${s})`;
  const r = c.querySelector('.ripple');
  r.style.opacity = rp > 0 && rp < 1 ? String((1 - rp) * 0.55) : '0';
  r.style.transform = `translate(-50%,-50%) scale(${0.2 + rp * 2.6})`;
}

window.CUR = { makeCursor, moveCursor };

})();
