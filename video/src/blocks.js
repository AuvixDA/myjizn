/* eslint-disable no-unused-vars */

(function () {
'use strict';
/**
 * Блоки ролика. Каждый блок строит свой DOM один раз (build) и затем на каждом
 * кадре только переписывает transform/opacity (update). Ничего не создаётся и
 * не удаляется во время рендера — иначе Chromium начинает переразмечать
 * страницу и кадры расходятся по таймингам.
 */
const { el, splitWords, splitChars } = window.DOM;
const { clamp, seg, ease, hold, nz } = window.M;
const C = window.CONTENT;

/** Точки склейки — по ним же бьёт вспышка и стоят такты в аудио. */
const CUTS = [6, 8, 16, 22, 28, 33, 36, 42, 45, 46.8];

const layers = document.getElementById('layers');
const blocks = [];

function block(name, from, to, build) {
  const root = el('div', 'block', layers);
  root.id = 'b-' + name;
  const api = { root, from, to, update: () => {} };
  api.update = build(root, api) || (() => {});
  blocks.push(api);
  return api;
}

/* ================= 0:00–0:06 · хук ================= */

block('hook', 0, 6, (root) => {
  const wrap = el('div', 'center', root);
  const lines = C.hook.map((txt) => {
    const h = el('div', 'kinetic', wrap);
    h.style.position = 'absolute';
    return { node: h, words: splitWords(h, txt) };
  });

  return (t) => {
    lines.forEach((ln, i) => {
      const a = i * 2;
      const inP = seg(t, a, a + 0.9);
      const outP = seg(t, a + 1.55, a + 2.05);
      ln.node.style.opacity = String(1 - outP);
      ln.words.forEach((w, wi) => {
        const d = wi * 0.075;
        const p = ease.outQuint(clamp((inP * 0.9 - d) / 0.45));
        const o = ease.inCubic(outP);
        w.style.opacity = String(p);
        w.style.filter = `blur(${(1 - p) * 16 + o * 14}px)`;
        w.style.transform =
          `translateY(${(1 - p) * 34 - o * 22}px) scale(${0.94 + p * 0.06 + o * 0.05})`;
      });
    });
  };
});

/* ================= 0:06–0:08 · стинг логотипа ================= */

// Классическая «А»: без перекладины вложенные шевроны читались
// как стрелка, а не как буква.
const MARK_D = 'M50 246 L160 38 L270 246 M102 178 L218 178';

block('sting', 6, 8.35, (root) => {
  const wrap = el('div', 'center', root);
  const svg = el('div', '', wrap);
  svg.innerHTML = `<svg id="sting-mark" viewBox="0 0 320 280" width="360" height="315">
    <path d="${MARK_D}"/></svg>`;
  const path = svg.querySelector('path');
  path.style.fill = 'none';
  path.style.stroke = 'var(--lime)';
  path.style.strokeWidth = '24';
  path.style.strokeLinecap = 'round';
  path.style.strokeLinejoin = 'round';
  path.style.filter = 'drop-shadow(0 0 26px rgba(198,241,50,.8))';
  const len = 900;
  path.style.strokeDasharray = String(len);

  return (t) => {
    const lt = t - 6;
    const draw = ease.outExpo(seg(lt, 0.05, 0.85));
    path.style.strokeDashoffset = String(len * (1 - draw));
    const pop = ease.spring(seg(lt, 0.85, 1.5));
    const out = seg(lt, 1.85, 2.35);
    wrap.style.opacity = String(1 - ease.inCubic(out));
    wrap.style.transform =
      `scale(${(0.9 + pop * 0.1) * (1 + out * 0.45)})`;
    wrap.style.filter = `blur(${out * 18}px)`;
  };
});

/* ================= 0:08–0:16 · шесть услуг ================= */

block('services', 8, 16.1, (root) => {
  const eyebrow = el('div', 'eyebrow', root);
  eyebrow.textContent = 'что мы делаем';
  Object.assign(eyebrow.style, {
    position: 'absolute', left: '0', right: '0', top: '196px',
    textAlign: 'center', zIndex: '3',
  });

  const stage = el('div', '', root);
  Object.assign(stage.style, {
    position: 'absolute', inset: '0', perspective: '1500px',
    perspectiveOrigin: '50% 50%',
  });

  // Растворяем ленту у верхней и нижней кромки: без этого карточки
  // упираются в край кадра и «барабан» читается как обычный список.
  const fade = el('div', '', root);
  Object.assign(fade.style, {
    position: 'absolute', inset: '0', zIndex: '2', pointerEvents: 'none',
    background:
      'linear-gradient(180deg,#05070A 0%,rgba(5,7,10,.92) 12%,rgba(5,7,10,0) 30%,' +
      'rgba(5,7,10,0) 70%,rgba(5,7,10,.92) 88%,#05070A 100%)',
  });
  const rail = el('div', '', stage);
  rail.id = 'svc-rail';
  rail.style.transformStyle = 'preserve-3d';

  const PITCH = 372;
  const cards = C.services.map((s, i) => {
    const c = el('div', 'svc', rail);
    c.style.top = i * PITCH + 'px';
    const txt = el('div', 'txt', c);
    const n = el('span', 'n', txt); n.textContent = s.n;
    const tt = el('div', 't', txt); tt.textContent = s.title;
    const nt = el('div', 'note', txt); nt.textContent = s.note;
    window.chromeArt(s.art, c);
    return c;
  });

  return (t) => {
    const lt = t - 8;
    // Скролл «со щелчком»: каждая карточка доезжает и на мгновение замирает.
    let s = 0;
    for (let k = 0; k < 5; k++) {
      s += ease.inOutCubic(seg(lt, 0.55 + k * 1.2, 0.55 + k * 1.2 + 0.72));
    }
    const appear = ease.outCubic(seg(lt, 0, 0.5));
    const outP = ease.inCubic(seg(lt, 7.55, 8.1));
    eyebrow.style.opacity = String(appear * (1 - ease.inCubic(seg(lt, 7.2, 7.8))));
    eyebrow.style.letterSpacing = 0.34 - (1 - appear) * 0.12 + 'em';
    stage.style.opacity = String(appear * (1 - outP));

    rail.style.transform = `translateY(${960 - 150 - s * PITCH}px)`;

    cards.forEach((c, i) => {
      const d = i - s;                       // расстояние от центра в карточках
      const ad = Math.abs(d);
      const rx = clamp(-d * 7, -38, 38);     // наклон по X даёт «барабан»
      const z = -ad * 250 - outP * 500;
      const sc = clamp(1 - ad * 0.12, 0.5, 1);
      const op = clamp(1 - ad * 0.62, 0, 1);
      c.style.transform =
        `translateZ(${z}px) rotateX(${rx}deg) scale(${sc}) translateY(${d * 16}px)`;
      c.style.opacity = String(op);
      c.style.filter = `blur(${clamp(ad - 0.55, 0, 3) * 3.4}px)`;
      // Активная карточка получает лаймовую окантовку — глаз ловит фокус сразу.
      c.style.borderColor = ad < 0.35
        ? `rgba(198,241,50,${(0.5 - ad) * 1.2})` : '';
      const art = c.querySelector('.art');
      // Хром медленно вращается — иначе градиент читается как плоская картинка.
      art.style.transform = `rotate(${(lt * 26 + i * 61) % 360}deg)`;
      art.style.opacity = String(clamp(1.15 - ad * 0.5, 0, 1));
    });
  };
});

/* ================= 0:16–0:22 · демо «сайт» ================= */

block('site', 16, 22.15, (root) => {
  const S = C.site;
  const eyebrow = el('div', 'eyebrow', root);
  eyebrow.textContent = S.label;
  Object.assign(eyebrow.style, {
    position: 'absolute', left: '0', right: '0', top: '212px', textAlign: 'center',
  });

  const phone = el('div', 'phone', root);
  el('div', 'notch', phone);

  const url = el('div', 'urlbar', phone);
  const lock = el('span', 'lock', url);
  const utxt = el('span', '', url);
  const caret = el('span', 'caret', url);

  const body = el('div', 'site-body', phone);

  const hero = el('div', 'sb hero', body);
  Object.assign(hero.style, { top: '20px', height: '360px' });
  const hh = el('div', 'h', hero); hh.textContent = S.hero;
  const hb = el('div', 'btn', hero); hb.textContent = S.cta;

  const rows = [0, 1, 2].map((i) => {
    const r = el('div', 'sb', body);
    Object.assign(r.style, { top: 400 + i * 200 + 'px', height: '180px' });
    el('div', 'ph', r).style.top = '38px';
    const p2 = el('div', 'ph', r);
    p2.style.top = '78px'; p2.style.right = '120px';
    const p3 = el('div', 'ph', r);
    p3.style.top = '118px'; p3.style.right = '210px';
    return r;
  });

  const badges = S.stats.map((st, i) => {
    const b = el('div', 'badge', root);
    Object.assign(b.style, i === 0
      ? { left: '58px', top: '640px' }
      : { right: '58px', top: '1180px' });
    const v = el('div', 'v', b);
    const l = el('div', 'l', b); l.textContent = st.l;
    return { node: b, v, target: st.v };
  });

  return (t) => {
    const lt = t - 16;
    const inP = ease.spring(seg(lt, 0, 0.75));
    const outP = ease.inCubic(seg(lt, 5.6, 6.15));
    // Медленный наезд камеры на всём блоке — кадр не «замирает».
    const push = 1 + ease.inOutCubic(seg(lt, 0.6, 5.6)) * 0.04;

    root.style.opacity = String(1 - outP);
    eyebrow.style.opacity = String(ease.outCubic(seg(lt, 0.15, 0.7)));
    phone.style.transform =
      `scale(${(0.86 + inP * 0.14) * push}) translateY(${(1 - inP) * 90 - outP * 60}px)`;
    phone.style.opacity = String(inP);

    // Адрес печатается посимвольно, каретка мигает по кадрам.
    const typed = Math.round(ease.linear(seg(lt, 0.55, 1.65)) * S.url.length);
    utxt.textContent = S.url.slice(0, typed);
    const done = typed >= S.url.length;
    caret.style.opacity = done ? (Math.floor(lt * 2) % 2 ? '0' : '.7')
      : (typed > 0 ? '1' : '0');
    lock.style.opacity = String(ease.outCubic(seg(lt, 1.6, 1.95)));

    const heroP = ease.outBack(seg(lt, 1.5, 2.15));
    hero.style.opacity = String(clamp(heroP));
    hero.style.transform = `translateY(${(1 - heroP) * 70}px)`;

    rows.forEach((r, i) => {
      const p = ease.outCubic(seg(lt, 2.0 + i * 0.28, 2.6 + i * 0.28));
      r.style.opacity = String(p);
      r.style.transform = `translateY(${(1 - p) * 80}px) scale(${0.96 + p * 0.04})`;
    });

    badges.forEach((b, i) => {
      const p = ease.spring(seg(lt, 3.1 + i * 0.55, 3.95 + i * 0.55));
      b.node.style.opacity = String(clamp(p));
      b.node.style.transform =
        `translateY(${(1 - p) * 40}px) scale(${0.8 + clamp(p) * 0.2})`;
      // Число досчитывается вместо мгновенного появления.
      if (b.target === '98') {
        const cp = ease.outExpo(seg(lt, 3.2, 4.5));
        b.v.textContent = String(Math.round(cp * 98));
      } else {
        b.v.textContent = b.target;
      }
    });
  };
});

/* ============ 0:22–0:33 · бот + связка (один блок: камера непрерывна) ============ */

block('bot', 22, 33.15, (root) => {
  const B = C.bot;
  const eyebrow = el('div', 'eyebrow', root);
  eyebrow.textContent = B.label;
  Object.assign(eyebrow.style, {
    position: 'absolute', left: '0', right: '0', top: '212px', textAlign: 'center',
  });

  const title = el('div', 'sect-title', root);
  title.textContent = C.wiring.title;
  Object.assign(title.style, {
    position: 'absolute', left: '0', right: '0', top: '196px',
    textAlign: 'center', opacity: '0',
  });

  const phone = el('div', 'phone', root);
  el('div', 'notch', phone);

  const head = el('div', 'chat-head', phone);
  el('div', 'av', head);
  const hi = el('div', '', head);
  const nm = el('div', 'nm', hi); nm.textContent = B.name;
  const st = el('div', 'st', hi); st.textContent = B.status;

  const msgs = el('div', 'msgs', phone);
  const bubbles = B.dialog.map((d) => {
    const m = el('div', 'msg ' + d.side, msgs);
    m.textContent = d.text;
    return m;
  });
  const typing = el('div', 'typing', msgs);
  [0, 1, 2].forEach(() => el('i', '', typing));

  // Раскладка считается один раз после первичной вёрстки.
  let layout = null;
  function measure() {
    let y = 0;
    layout = bubbles.map((m) => {
      const h = m.offsetHeight;
      const r = { y, h };
      y += h + 22;
      return r;
    });
    layout.typingY = y;
  }

  const wires = el('div', '', root);
  wires.id = 'wires';
  wires.innerHTML = `<svg viewBox="0 0 1080 1920" width="1080" height="1920">
    <path id="w0"/><path id="w1"/><path id="w2"/></svg>`;
  const wpaths = [0, 1, 2].map((i) => wires.querySelector('#w' + i));

  const ICONS = {
    calendar: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M8 3v4M16 3v4M3 11h18"/>',
    crm: '<path d="M4 20v-2a4 4 0 014-4h2a4 4 0 014 4v2"/><circle cx="9" cy="7" r="3.2"/><path d="M17 11h4M19 9v4"/>',
    bell: '<path d="M18 9a6 6 0 10-12 0c0 5-2 6-2 6h16s-2-1-2-6"/><path d="M10.5 20a2 2 0 003 0"/>',
  };
  const NODE_X = [58, 395, 732];
  const nodes = C.wiring.nodes.map((n, i) => {
    const d = el('div', 'node', root);
    Object.assign(d.style, { left: NODE_X[i] + 'px', top: '1420px', opacity: '0' });
    const ic = el('div', 'ic', d);
    ic.innerHTML = `<svg viewBox="0 0 24 24" stroke-linecap="round"
      stroke-linejoin="round">${ICONS[n.icon]}</svg>`;
    const lb = el('div', 'lb', d); lb.textContent = n.label;
    const nt = el('div', 'nt', d); nt.textContent = n.note;
    return d;
  });

  const gridEl = document.getElementById('grid');

  return (t) => {
    if (!layout) measure();
    const lt = t - 22;

    const inP = ease.spring(seg(lt, 0, 0.7));
    const outP = ease.inCubic(seg(lt, 10.6, 11.15));
    root.style.opacity = String(1 - outP);

    // Отъезд камеры: телефон уменьшается и уходит вверх, освобождая место схеме.
    const pull = ease.inOutCubic(seg(lt, 6.0, 7.0));
    const sc = (0.86 + inP * 0.14) * (1 - pull * 0.53);
    const ty = (1 - inP) * 90 - pull * 330;
    phone.style.transform = `scale(${sc}) translateY(${ty}px)`;
    phone.style.opacity = String(inP);

    eyebrow.style.opacity = String(ease.outCubic(seg(lt, 0.15, 0.7)) * (1 - ease.inCubic(seg(lt, 5.6, 6.2))));
    const tp = ease.outCubic(seg(lt, 6.5, 7.2));
    title.style.opacity = String(tp * (1 - ease.inCubic(seg(lt, 10.3, 10.9))));
    title.style.transform = `translateY(${(1 - tp) * 30}px)`;

    // --- диалог ---
    // Реплики появляются парами «вопрос → печатает… → ответ».
    const APPEAR = [0.55, 1.95, 2.95, 4.35];
    const TYPING = [[1.15, 1.95], [3.55, 4.35]];

    let visible = 0;
    bubbles.forEach((m, i) => {
      const p = ease.outBack(seg(lt, APPEAR[i], APPEAR[i] + 0.42));
      m.style.opacity = String(clamp(p));
      const L = layout[i];
      m.style.top = L.y + 'px';
      m.style.transform =
        `translateY(${(1 - p) * 26}px) scale(${0.9 + clamp(p) * 0.1})`;
      if (lt >= APPEAR[i]) visible = i + 1;
    });

    let typeOn = 0, typeY = 0;
    TYPING.forEach(([a, b], k) => {
      if (lt >= a && lt < b) {
        typeOn = Math.min(seg(lt, a, a + 0.2), 1 - seg(lt, b - 0.12, b));
        typeY = layout[k * 2 + 1].y;
      }
    });
    typing.style.opacity = String(typeOn);
    typing.style.top = typeY + 'px';
    typing.querySelectorAll('i').forEach((dot, di) => {
      const ph = (lt * 3.4 + di * 0.33) % 1;
      dot.style.opacity = String(0.35 + 0.65 * (0.5 + 0.5 * Math.sin(ph * Math.PI * 2)));
    });

    // Лента подтягивается вверх, чтобы свежая реплика не уезжала за экран.
    const lastY = visible ? layout[visible - 1].y + layout[visible - 1].h : 0;
    const shift = Math.max(0, lastY - 700);
    msgs.style.transform = `translateY(${-shift}px)`;

    // --- схема связки ---
    gridEl.style.opacity = String(ease.outCubic(seg(lt, 6.2, 7.4)) * (1 - ease.inCubic(seg(lt, 10.2, 10.9))));

    const phoneBottomY = 960 - 620 * sc + 1240 * sc + ty * sc;
    wpaths.forEach((p, i) => {
      const x1 = 540, y1 = clamp(phoneBottomY, 300, 1200);
      const x2 = NODE_X[i] + 145, y2 = 1400;
      const mid = (y1 + y2) / 2;
      p.setAttribute('d', `M${x1} ${y1} C${x1} ${mid} ${x2} ${mid} ${x2} ${y2}`);
      const len = p.getTotalLength ? p.getTotalLength() : 600;
      const dp = ease.outCubic(seg(lt, 7.2 + i * 0.55, 7.95 + i * 0.55));
      p.style.strokeDasharray = String(len);
      p.style.strokeDashoffset = String(len * (1 - dp));
      p.style.opacity = String(dp * (1 - ease.inCubic(seg(lt, 10.2, 10.8))));
    });

    nodes.forEach((n, i) => {
      const p = ease.spring(seg(lt, 7.85 + i * 0.55, 8.6 + i * 0.55));
      n.style.opacity = String(clamp(p) * (1 - ease.inCubic(seg(lt, 10.3, 10.9))));
      n.style.transform = `translateY(${(1 - p) * 40}px) scale(${0.82 + clamp(p) * 0.18})`;
    });
  };
});

/* ================= 0:33–0:36 · связка-мост ================= */

block('bridge', 33, 36.1, (root) => {
  const wrap = el('div', 'center', root);
  const h = el('div', 'kinetic', wrap);
  const words = splitWords(h, C.bridge);

  return (t) => {
    const lt = t - 33;
    const inP = seg(lt, 0.1, 1.1);
    const outP = ease.inCubic(seg(lt, 2.45, 3.0));
    h.style.opacity = String(1 - outP);
    words.forEach((w, wi) => {
      const p = ease.outQuint(clamp((inP - wi * 0.055) / 0.4));
      w.style.opacity = String(p);
      w.style.filter = `blur(${(1 - p) * 15 + outP * 12}px)`;
      w.style.transform = `translateY(${(1 - p) * 30 - outP * 18}px)`;
    });
  };
});

/* ================= 0:36–0:42 · кейсы ================= */

block('cases', 36, 42.15, (root) => {
  const CS = C.cases;
  const eyebrow = el('div', 'eyebrow', root);
  eyebrow.textContent = CS.label;
  Object.assign(eyebrow.style, {
    position: 'absolute', left: '0', right: '0', top: '470px', textAlign: 'center',
  });

  const grid = el('div', '', root);
  grid.id = 'case-grid';
  const cards = CS.grid.map((c) => {
    const d = el('div', 'case', grid);
    el('div', 'thumb', d);
    const tt = el('div', 't', d); tt.textContent = c.t;
    const kk = el('div', 'k', d); kk.textContent = c.k;
    return d;
  });

  const det = el('div', '', root);
  det.id = 'case-detail';
  det.style.top = '700px';
  const dt = el('div', 't', det); dt.textContent = CS.featured.t;
  const dk = el('div', 'k', det); dk.textContent = CS.featured.k;
  const row = el('div', 'row', det);
  const stats = CS.featured.stats.map((s) => {
    const b = el('div', 'st', row);
    const v = el('div', 'v', b); v.textContent = s.v;
    const l = el('div', 'l', b); l.textContent = s.l;
    return b;
  });

  const cur = window.CUR.makeCursor(root);

  return (t) => {
    const lt = t - 36;
    const outP = ease.inCubic(seg(lt, 5.6, 6.15));
    root.style.opacity = String(1 - outP);
    eyebrow.style.opacity = String(ease.outCubic(seg(lt, 0.1, 0.6)));

    // Плитки высыпаются по диагонали.
    cards.forEach((c, i) => {
      const d = (i % 2) * 0.09 + Math.floor(i / 2) * 0.14;
      const p = ease.outBack(seg(lt, 0.3 + d, 0.85 + d));
      c.style.opacity = String(clamp(p));
      c.style.transform = `translateY(${(1 - p) * 60}px) scale(${0.88 + clamp(p) * 0.12})`;
    });

    // Курсор подъезжает к первой плитке и кликает.
    const cp = seg(lt, 1.5, 2.6);
    window.CUR.moveCursor(cur, [980, 1560], [300, 690], cp, 0.86);
    cur.style.opacity = String(ease.outCubic(seg(lt, 1.35, 1.7)) * (1 - ease.inCubic(seg(lt, 3.1, 3.4))));

    // Ховер: плитка приподнимается прямо перед кликом.
    const hov = seg(lt, 2.25, 2.5) * (1 - seg(lt, 2.62, 2.75));
    cards[0].style.transform =
      `translateY(${-hov * 12}px) scale(${1 + hov * 0.03})`;
    cards[0].style.borderColor = hov > 0.3 ? 'rgba(198,241,50,.55)' : '';

    // Раскрытие: плитка «прорастает» в панель, остальные уезжают.
    const ex = ease.outQuint(seg(lt, 2.72, 3.5));
    det.style.opacity = String(ex);
    det.style.transform =
      `scale(${0.84 + ex * 0.16}) translateY(${(1 - ex) * 30}px)`;
    grid.style.opacity = String(1 - ex * 0.92);
    grid.style.transform = `scale(${1 - ex * 0.07}) translateY(${ex * 26}px)`;
    grid.style.filter = `blur(${ex * 7}px)`;

    stats.forEach((s, i) => {
      const p = ease.spring(seg(lt, 3.3 + i * 0.18, 3.95 + i * 0.18));
      s.style.opacity = String(clamp(p));
      s.style.transform = `translateY(${(1 - p) * 26}px)`;
    });
  };
});

/* ================= 0:42–0:45 · процесс ================= */

block('process', 42, 45.1, (root) => {
  const eyebrow = el('div', 'eyebrow', root);
  eyebrow.textContent = 'как мы работаем';
  Object.assign(eyebrow.style, {
    position: 'absolute', left: '0', right: '0', top: '700px', textAlign: 'center',
  });

  const rail = el('div', '', root);
  rail.id = 'proc-rail';
  const steps = C.process.map((s) => {
    const d = el('div', 'step', rail);
    const n = el('div', 'n', d); n.textContent = s.n;
    const tt = el('div', 't', d); tt.textContent = s.t;
    return d;
  });

  const PITCH = 456;
  return (t) => {
    const lt = t - 42;
    const outP = ease.inCubic(seg(lt, 2.6, 3.1));
    root.style.opacity = String(ease.outCubic(seg(lt, 0, 0.4)) * (1 - outP));
    eyebrow.style.opacity = String(ease.outCubic(seg(lt, 0.1, 0.55)));

    let s = 0;
    for (let k = 0; k < 3; k++) {
      s += ease.inOutCubic(seg(lt, 0.45 + k * 0.62, 0.45 + k * 0.62 + 0.5));
    }
    rail.style.transform = `translateX(${330 - s * PITCH}px)`;

    steps.forEach((d, i) => {
      const ad = Math.abs(i - s);
      d.style.opacity = String(clamp(1 - ad * 0.42));
      d.style.transform = `scale(${clamp(1 - ad * 0.07, 0.7, 1)})`;
      d.style.borderColor = ad < 0.4 ? 'rgba(198,241,50,.45)' : '';
    });
  };
});

/* ================= 0:45–0:50 · призыв и логотип ================= */

block('final', 45, 50, (root) => {
  const wrap = el('div', 'center', root);
  const cta = C.cta.map((txt) => {
    const h = el('div', 'kinetic', wrap);
    h.style.position = 'absolute';
    h.style.fontSize = '86px';
    return { node: h, words: splitWords(h, txt) };
  });

  const parts = el('div', '', root);
  parts.id = 'parts';
  const P = 90;
  const dots = [];
  for (let i = 0; i < P; i++) {
    const d = el('i', '', parts);
    const a = nz(i * 3.1) * Math.PI * 2;
    const r = 420 + nz(i * 7.7) * 620;
    dots.push({
      node: d,
      x0: 540 + Math.cos(a) * r,
      y0: 960 + Math.sin(a) * r * 1.35,
      x1: 540 + (nz(i * 11.3) - 0.5) * 300,
      y1: 830 + (nz(i * 13.9) - 0.5) * 300,
      dl: nz(i * 17.1) * 0.3,
    });
  }

  const lw = el('div', '', root);
  lw.id = 'logo-wrap';
  const mk = el('div', '', lw);
  mk.innerHTML = `<svg id="mark" viewBox="0 0 320 280"><path d="${MARK_D}"/></svg>`;
  const mpath = mk.querySelector('path');
  const MLEN = 900;
  mpath.style.strokeDasharray = String(MLEN);

  const wm = el('div', 'wordmark', lw);
  const wa = el('div', 'a', wm); wa.textContent = C.brand.name;
  const wb = el('div', 'b', wm); wb.textContent = C.brand.sub;

  const end = el('div', 'endline', lw);
  end.textContent = C.brand.site + '  ·  ' + C.brand.handle;

  return (t) => {
    const lt = t - 45;

    // 0.0–1.8 — две строки призыва
    cta.forEach((ln, i) => {
      const a = i * 0.72;
      const inP = seg(lt, a, a + 0.62);
      const outP = ease.inCubic(seg(lt, 1.55, 1.9));
      ln.node.style.opacity = String(1 - outP);
      ln.node.style.transform = `translateY(${i === 0 ? -60 : 60}px)`;
      ln.words.forEach((w, wi) => {
        const p = ease.outQuint(clamp((inP - wi * 0.06) / 0.42));
        w.style.opacity = String(p);
        w.style.filter = `blur(${(1 - p) * 14 + outP * 12}px)`;
        w.style.transform = `translateY(${(1 - p) * 26}px)`;
      });
    });

    // 1.55–2.1 — частицы слетаются к центру
    const burst = seg(lt, 1.45, 2.15);
    const fade = 1 - seg(lt, 2.05, 2.5);
    parts.style.opacity = String(burst > 0 ? fade : 0);
    dots.forEach((d) => {
      const p = ease.outQuint(clamp((burst - d.dl) / 0.7));
      const x = d.x0 + (d.x1 - d.x0) * p;
      const y = d.y0 + (d.y1 - d.y0) * p;
      d.node.style.transform = `translate(${x}px,${y}px) scale(${0.4 + p * 1.1})`;
      d.node.style.opacity = String(p * 0.9);
    });

    // 1.8–3.2 — логотип прорисовывается на месте схлопнувшихся частиц
    const draw = ease.outExpo(seg(lt, 1.9, 2.85));
    mpath.style.strokeDashoffset = String(MLEN * (1 - draw));
    const pop = ease.spring(seg(lt, 2.75, 3.5));

    const wmP = ease.outCubic(seg(lt, 2.85, 3.5));
    wm.style.opacity = String(wmP);
    wm.style.transform = `translateY(${(1 - wmP) * 24}px)`;
    wb.style.letterSpacing = 0.2 + wmP * 0.32 + 'em';

    const endP = ease.outCubic(seg(lt, 3.5, 4.05));
    end.style.opacity = String(endP * 0.9);
    end.style.transform = `translateY(${(1 - endP) * 16}px)`;

    lw.style.opacity = String(draw > 0 ? 1 : 0);
    lw.style.transform = `scale(${0.94 + pop * 0.06})`;

    // Затемнение в конце — ролик не обрывается на полном свете.
    const fin = ease.inOutCubic(seg(lt, 4.55, 5.0));
    root.style.opacity = String(1 - fin);
  };
});

/* ================= сборка кадра ================= */

const bg = document.getElementById('bg');
const flash = document.getElementById('flash');
const grain = document.getElementById('grain');

window.renderFrame = function (t) {
  blocks.forEach((b) => {
    const on = t >= b.from && t < b.to;
    if (on !== b._on) {
      b.root.classList.toggle('on', on);
      b._on = on;
    }
    if (on) b.update(t);
  });

  // Фон дышит и слегка плывёт — иначе статичные блоки выглядят «замороженными».
  const br = 0.9 + 0.14 * Math.sin(t * 0.62) + 0.05 * Math.sin(t * 1.9);
  bg.style.transform =
    `translate(${Math.sin(t * 0.31) * 26}px, ${Math.cos(t * 0.24) * 34}px) scale(${1.02 + br * 0.02})`;
  bg.style.opacity = String(0.82 + br * 0.16);

  // Вспышка на склейках.
  let f = 0;
  for (const c of CUTS) {
    if (t >= c - 0.02 && t < c + 0.2) f = Math.max(f, (1 - (t - c + 0.02) / 0.22) * 0.4);
  }
  flash.style.opacity = String(f);

  // Зерно: одна текстура, сдвигаемая по кадрам — дёшево и без мерцания.
  const step = Math.floor(t * 15);
  const gx = Math.floor(nz(step * 1.7) * 400);
  const gy = Math.floor(nz(step * 2.9) * 400);
  grain.style.backgroundPosition = `${gx}px ${gy}px`;
};

})();
