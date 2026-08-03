/**
 * Рендер сцены в PNG-секвенцию.
 *
 *   node render.mjs                 полный прогон
 *   node render.mjs --preview 6,17  только кадры на 6-й и 17-й секунде
 *
 * Сцена отдаётся через локальный http-сервер, а не через file:// — иначе
 * Chromium режет загрузку шрифтов и canvas.toDataURL по политике origin.
 */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { mkdir } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';

const ROOT = fileURLToPath(new URL('.', import.meta.url));
const FPS = Number(process.env.FPS || 60);   // рендерим в 60, motion blur сводит в 30
const DUR = 50;
const W = 1080, H = 1920;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
};

function serve() {
  const srv = createServer(async (req, res) => {
    const rel = normalize(decodeURIComponent(req.url.split('?')[0])).replace(/^(\.\.[/\\])+/, '');
    const file = join(ROOT, rel === '/' ? 'src/scene.html' : rel);
    try {
      const buf = await readFile(file);
      res.writeHead(200, { 'content-type': MIME[extname(file)] || 'application/octet-stream' });
      res.end(buf);
    } catch {
      res.writeHead(404).end('nope');
    }
  });
  return new Promise((ok) => srv.listen(0, '127.0.0.1', () => ok(srv)));
}

const args = process.argv.slice(2);
const flag = (n) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : null; };
const preview = flag('--preview')?.split(',').map(Number) || null;

// Рендер шардируется по кадрам: 4 процесса × отдельный Chromium.
// Кадры независимы (сцена — чистая функция времени), поэтому шардинг
// не меняет результат, только делит стену времени на число ядер.
const shard = flag('--shard');           // формат "0/4"
const [shardIdx, shardTotal] = shard ? shard.split('/').map(Number) : [0, 1];

const srv = await serve();
const port = srv.address().port;
// Каталог только создаётся, никогда не чистится: при параллельном запуске
// удаление из одного шарда сносило кадры, которые уже писали соседние.
// За очистку отвечает build.sh — до старта воркеров.
const outDir = join(ROOT, preview ? 'out/preview' : 'out/frames');
await mkdir(outDir, { recursive: true });

const browser = await chromium.launch({
  args: [
    '--force-color-profile=srgb',
    '--font-render-hinting=none',
    '--disable-lcd-text',
    '--disable-gpu-vsync',
    '--hide-scrollbars',
  ],
});
const page = await browser.newPage({
  viewport: { width: W, height: H },
  deviceScaleFactor: 1,
});
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });

await page.goto(`http://127.0.0.1:${port}/src/scene.html`, { waitUntil: 'load' });
await page.evaluate(() => window.__ready);
await page.waitForTimeout(400);

if (errors.length) {
  console.error('ОШИБКИ В СЦЕНЕ:\n' + errors.join('\n'));
  await browser.close(); srv.close();
  process.exit(1);
}

const total = FPS * DUR;
const all = preview || Array.from({ length: total }, (_, i) => i / FPS);
const pad = String(total).length + 1;

// Каждый шард берёт свои кадры «через один» — нагрузка по тяжёлым и лёгким
// блокам делится поровну, иначе шард со сценой услуг тормозил бы остальные.
const mine = [];
for (let i = 0; i < all.length; i++) {
  if (i % shardTotal === shardIdx) mine.push([i, all[i]]);
}

const t0 = Date.now();
let done = 0;
for (const [i, t] of mine) {
  await page.evaluate((tt) => window.seek(tt), t);
  const name = preview
    ? `t${String(t).replace('.', '_')}.png`
    : `f${String(i).padStart(pad, '0')}.png`;
  await page.screenshot({ path: join(outDir, name) });
  done++;
  if (!preview && done % 60 === 0) {
    const elapsed = (Date.now() - t0) / 1000;
    const eta = (elapsed / done) * (mine.length - done);
    process.stdout.write(
      `  шард ${shardIdx}: ${done}/${mine.length} · ${elapsed.toFixed(0)}с · ещё ~${eta.toFixed(0)}с\n`);
  }
}
const times = mine;

if (errors.length) console.error('ОШИБКИ ВО ВРЕМЯ РЕНДЕРА:\n' + errors.join('\n'));
console.log(`готово: ${times.length} кадров за ${((Date.now() - t0) / 1000).toFixed(0)}с → ${outDir}`);

await browser.close();
srv.close();
