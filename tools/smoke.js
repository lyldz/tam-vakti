// Duman testi: farklı genişliklerde sekmeleri/modalları aç; JS hatası ve yatay taşma bildir.
// Çalıştır: cd tools && npm i && node smoke.js   (hata varsa çıkış kodu 1)
const { launch, openApp, freeze } = require("./lib");
(async () => {
  const b = await launch();
  let bad = 0;
  for (const w of [320, 360, 390, 412]) {
    const p = await openApp(b, { width: w, height: 800, time: "2026-11-10T13:10:00+03:00" });
    const overflow = () => p.evaluate(() => {
      const bad = [];
      const vw = document.documentElement.clientWidth;
      const visible = (e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
      // Görünür bir kaydırma kapsayıcısı içinde olmayan, ekran dışına taşan öğeler
      document.querySelectorAll("body *").forEach((e) => {
        if (!visible(e)) return;
        const r = e.getBoundingClientRect();
        if (r.right > vw + 1 || r.left < -1) {
          let q = e.parentElement, scroller = false;
          while (q && q !== document.body) { const o = getComputedStyle(q).overflowX; if (o === "auto" || o === "scroll" || o === "hidden") { scroller = true; break; } q = q.parentElement; }
          if (!scroller) bad.push((e.id || e.className || e.tagName).toString().slice(0, 40));
        }
      });
      // Kaydırılabilir ama taşan tablo/kapsayıcı
      document.querySelectorAll("#monthlyModal *, #settingsModal *").forEach((e) => {
        if (visible(e) && e.scrollWidth > e.clientWidth + 1 && /auto|scroll/.test(getComputedStyle(e).overflowX)) bad.push("kaydırmalı:" + (e.id || e.tagName));
      });
      return [...new Set(bad)];
    });
    const steps = [
      ["ana", () => {}],
      ["kıble", () => p.evaluate(() => app.switchTab("qibla"))],
      ["vakitler", () => p.evaluate(() => app.switchTab("prayer"))],
      ["imsakiye", () => p.evaluate(() => app.openMonthlyModal())],
      ["ayarlar", () => p.evaluate(() => { app.closeMonthlyModal(); app.openSettingsModal(); })],
      ["hakkında", () => p.evaluate(() => { app.closeSettingsModal(); app.openAboutModal(); })],
    ];
    for (const [name, fn] of steps) {
      await fn(); await p.waitForTimeout(700);
      const o = await overflow();
      if (o.length) { bad++; console.log(`✗ ${w}px ${name}: taşma`, o.slice(0, 6)); }
    }
    if (p.errors.length) { bad++; console.log(`✗ ${w}px JS hatası:`, p.errors); }
    else console.log(`✓ ${w}px: hata yok`);
    await p.context().close();
  }
  await b.close();
  process.exit(bad ? 1 : 0);
})();
