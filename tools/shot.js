// Hızlı ekran görüntüsü: node shot.js [genişlik=390] [yükseklik=844]  → tools/out/
const path = require("path");
const fs = require("fs");
const { launch, openApp, freeze } = require("./lib");
(async () => {
  const width = +process.argv[2] || 390, height = +process.argv[3] || 844;
  const out = path.join(__dirname, "out"); fs.mkdirSync(out, { recursive: true });
  const b = await launch();
  const p = await openApp(b, { width, height });
  await freeze(p);
  const steps = [
    ["prayer", () => {}],
    ["monthly", () => p.evaluate(() => app.openMonthlyModal())],
    ["settings", () => p.evaluate(() => { app.closeMonthlyModal && app.closeMonthlyModal(); app.openSettingsModal(); })],
    ["about", () => p.evaluate(() => { app.closeSettingsModal && app.closeSettingsModal(); app.openAboutModal(); })],
  ];
  for (const [name, fn] of steps) {
    await fn(); await p.waitForTimeout(400);
    await p.screenshot({ path: path.join(out, `${name}-${width}x${height}.png`) });
    console.log("yazıldı:", `out/${name}-${width}x${height}.png`);
  }
  if (p.errors.length) console.log("JS HATASI:", p.errors);
  await b.close();
})();
