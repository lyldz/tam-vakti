// Play Store görselleri: 5 ekran görüntüsü (1080x2400) + öne çıkan görsel (1024x500)
// Çalıştır: cd tools && npm i && node store/make.js
const path = require("path");
const fs = require("fs");
const { launch, openApp, freeze, WWW } = require("../lib");

const OUT = __dirname;
const TIME = "2026-11-10T13:10:00+03:00"; // öğle vakti: güneş yayı tepede, geri sayım dolu

(async () => {
  const b = await launch();

  // ---- Ekran görüntüleri: 360x800 CSS px × 3 = 1080x2400 ----
  const mk = (opts = {}) => openApp(b, { width: 360, height: 800, dsf: 3, time: TIME, ...opts });
  const save = async (p, name) => {
    await p.waitForTimeout(500);
    await p.screenshot({ path: path.join(OUT, name) });
    console.log("yazıldı:", name);
    if (p.errors.length) console.log("  JS HATASI:", p.errors);
    await p.context().close();
  };

  // 1) Ana ekran
  let p = await mk(); await freeze(p);
  await save(p, "screen-1-vakitler.png");

  // 2) Kıble pusulası (kalibrasyon sonrası görünüm; sensör yerine örnek yön)
  p = await mk(); await freeze(p);
  await p.evaluate(() => { app.switchTab("qibla"); });
  await p.waitForTimeout(600);
  await p.evaluate(() => {
    const c = app.compass;
    c._hasData = true; c._heading = 156; c._dialRot = -156; c._accuracy = 3; c._skipped = true;
    c._enterCompass();
    const badge = document.getElementById("qiblaSensorBadge"); // "Web sensörü" rozeti mağaza görselinde olmasın
    if (badge) badge.style.visibility = "hidden";
  });
  await p.waitForTimeout(600);
  await save(p, "screen-2-kible.png");

  // 3) Aylık imsakiye
  p = await mk(); await freeze(p);
  await p.evaluate(() => app.openMonthlyModal());
  await p.waitForTimeout(1500); // uygulamanın "bugüne kaydır" animasyonu bitsin
  await p.evaluate(() => { document.getElementById("monthlyModal").scrollTo({ top: 0, behavior: "instant" }); }); // başlık satırı görünsün
  await p.waitForTimeout(300);
  await save(p, "screen-3-imsakiye.png");

  // 4) Ayarlar
  p = await mk(); await freeze(p);
  await p.evaluate(() => app.openSettingsModal());
  await p.waitForTimeout(500);
  await save(p, "screen-4-ayarlar.png");

  // 5) Kurulum sihirbazı (hoş geldin)
  p = await mk({ onboarding: true }); await freeze(p);
  await save(p, "screen-5-kurulum.png");

  // ---- Öne çıkan görsel 1024x500 ----
  const fontsCss = fs.readFileSync(path.join(WWW, "css", "fonts.css"), "utf8")
    .replace(/url\((['"]?)\.\.\/assets/g, `url($1file://${WWW}/assets`);
  const logo = fs.readFileSync(path.join(__dirname, "..", "icons", "A3.svg"), "utf8");
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>${fontsCss}
    *{margin:0;box-sizing:border-box}
    body{width:1024px;height:500px;overflow:hidden;font-family:'Plus Jakarta Sans',sans-serif;color:#f1f5f9;
      background:radial-gradient(circle at 78% 30%,rgba(56,189,248,.22),transparent 55%),radial-gradient(circle at 12% 110%,rgba(251,146,60,.16),transparent 50%),#090e1a;
      display:flex;align-items:center;padding:0 72px;gap:56px}
    .logo{width:230px;height:230px;flex:none;filter:drop-shadow(0 0 40px rgba(56,189,248,.35))}
    .logo svg{width:100%;height:100%}
    h1{font-size:76px;font-weight:800;letter-spacing:-.02em;line-height:1}
    h1 span{color:#38bdf8}
    p{margin-top:18px;font-size:30px;font-weight:600;color:#94a3b8;line-height:1.3}
    .tags{margin-top:30px;display:flex;gap:14px}
    .tags i{font-style:normal;font-family:'JetBrains Mono',monospace;font-size:20px;font-weight:700;color:#7dd3fc;
      background:rgba(56,189,248,.12);border:1.5px solid rgba(56,189,248,.35);border-radius:999px;padding:8px 20px}
  </style></head><body>
    <div class="logo">${logo}</div>
    <div><h1>Tam <span>Vakti</span></h1>
    <p>Sade, reklamsız namaz vakitleri<br>ve kıble pusulası</p>
    <div class="tags"><i>Reklamsız</i><i>İnternetsiz çalışır</i><i>Kıble</i></div></div>
  </body></html>`;
  const hp = await (await b.newContext({ viewport: { width: 1024, height: 500 } })).newPage();
  const tmp = path.join(OUT, ".feature.html");
  fs.writeFileSync(tmp, html);
  await hp.goto("file://" + tmp);
  await hp.waitForTimeout(600);
  await hp.screenshot({ path: path.join(OUT, "feature-graphic-1024x500.png") });
  fs.unlinkSync(tmp);
  console.log("yazıldı: feature-graphic-1024x500.png");
  await b.close();
})();
