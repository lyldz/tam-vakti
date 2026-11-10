// Ana ekran kaydırmasız sığıyor mu? (sayfa ekran yüksekliğine sabit olmalı)
// Çalıştır: cd tools && node fit.js
const { launch, openApp } = require("./lib");
(async () => {
  const b = await launch();
  let bad = 0;
  for (const [w, h] of [[320, 568], [360, 640], [360, 800], [390, 844], [412, 915]]) {
    const p = await openApp(b, { width: w, height: h, time: "2026-11-10T13:10:00+03:00" });
    const r = await p.evaluate(() => {
      const de = document.documentElement;
      const app = document.querySelector(".minimal-app");
      return { sh: Math.max(de.scrollHeight, document.body.scrollHeight), vh: innerHeight, appSh: app ? app.scrollHeight : 0, appCh: app ? app.clientHeight : 0 };
    });
    const ok = r.sh <= r.vh + 1 && r.appSh <= r.appCh + 1;
    if (!ok) bad++;
    console.log(`${ok ? "✓" : "✗"} ${w}x${h}: sayfa ${r.sh}/${r.vh}, kapsayıcı ${r.appSh}/${r.appCh}`);
    await p.context().close();
  }
  await b.close();
  process.exit(bad ? 1 : 0);
})();
