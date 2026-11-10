// Ortak yardımcılar: tarayıcıyı bul, uygulamayı kurulum tamamlanmış ve konum seçilmiş hâlde aç.
const fs = require("fs");
const path = require("path");
const os = require("os");
const { chromium } = require("playwright-core");

const WWW = path.resolve(__dirname, "..", "www");

function findChrome() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  const base = path.join(os.homedir(), ".cache", "ms-playwright");
  if (!fs.existsSync(base)) return undefined;
  for (const d of fs.readdirSync(base).sort().reverse()) {
    for (const rel of ["chrome-linux/headless_shell", "chrome-linux/chrome", "chrome-headless-shell-linux64/chrome-headless-shell"]) {
      const p = path.join(base, d, rel);
      if (fs.existsSync(p)) return p;
    }
  }
}

async function launch() {
  return chromium.launch({ executablePath: findChrome() });
}

const LOCATION = { name: "Konya/Ilgın", lat: 38.28, lon: 31.91 };

// opts: { width, height, dsf, time: ISO, onboarding: false, errors: [] }
async function openApp(browser, opts = {}) {
  const { width = 390, height = 844, dsf = 1, time, onboarding = false, route } = opts;
  const ctx = await browser.newContext({
    viewport: { width, height }, deviceScaleFactor: dsf, locale: "tr-TR", timezoneId: "Europe/Istanbul",
    isMobile: true, hasTouch: true,
  });
  const page = await ctx.newPage();
  page.errors = [];
  page.on("pageerror", (e) => page.errors.push(e.message));
  if (time) await page.clock.install({ time: new Date(time) });
  await page.addInitScript(({ loc, ob }) => {
    if (!ob) {
      localStorage.setItem("tamvakti_onboarding_completed", "true");
      localStorage.setItem("tamvakti_onboarding_version", "2");
      localStorage.setItem("tamvakti_active_location", JSON.stringify(loc));
    }
  }, { loc: LOCATION, ob: onboarding });
  // Güncelleme denetimi ve vakit API'si ekran görüntüsünü etkilemesin
  await page.route("https://**/*", (r) => (route ? route(r) : r.abort()));
  await page.goto("file://" + path.join(WWW, "index.html"));
  await page.waitForTimeout(1800);
  return page;
}

// Animasyonları dondur (karşılaştırılabilir görüntü için)
async function freeze(page) {
  await page.addStyleTag({ content: "*,*::before,*::after{animation:none!important;transition:none!important}" });
  await page.waitForTimeout(250);
}

module.exports = { launch, openApp, freeze, WWW, LOCATION };
