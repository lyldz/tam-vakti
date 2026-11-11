/**
 * Tam Vakti - Minimalist Adaçayı Yeşili & Sade Vakit / Kıble Kontrolcüsü
 * Sürüm: v2.9.0
 */

const PRAYER_LIST = [
  { key: "imsak", name: "İmsak", arabic: "الفجر", iconSvg: "assets/icons/imsak.svg" },
  { key: "gunes", name: "Güneş", arabic: "الشروق", iconSvg: "assets/icons/gunes.svg" },
  { key: "ogle", name: "Öğle", arabic: "الظهر", iconSvg: "assets/icons/ogle.svg" },
  { key: "ikindi", name: "İkindi", arabic: "العصر", iconSvg: "assets/icons/ikindi.svg" },
  { key: "aksam", name: "Akşam", arabic: "المغرب", iconSvg: "assets/icons/aksam.svg" },
  { key: "yatsi", name: "Yatsı", arabic: "العشاء", iconSvg: "assets/icons/yatsi.svg" }
];

const POLICY_URL = "https://lyldz.github.io/tam-vakti/";

const DOWNLOAD_BTN_HTML = `<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v12m0 0l-5-5m5 5l5-5M5 20h14"/></svg><span>İndir</span>`;

class TamVaktiApp {
  // Kurulum sihirbazı sürümü: artırılınca sihirbaz mevcut kullanıcılara bir kez daha açılır
  static ONBOARDING_VERSION = 2;
  // Özgün, sentezlenmiş sade hatırlatma sesleri (tools/sounds/make-tones.py; ezan değildir)
  static TONES = [
    { id: "telefon", label: "Telefon sesi", desc: "Telefonun kendi bildirim sesi" },
    { id: "cagri", label: "Çağrı", desc: "İki notalı yumuşak zil" },
    { id: "billur", label: "Billur", desc: "Tek, berrak çan" },
    { id: "seher", label: "Seher", desc: "Yükselen üç nota" },
    { id: "damla", label: "Damla", desc: "İki kısa yumuşak vuruş" },
    { id: "sabahcani", label: "Sabah Çanı", desc: "Cam çan, dört notalı" },
    { id: "sudamlasi", label: "Su Damlası", desc: "Üç yumuşak damla" },
    { id: "neynefesi", label: "Ney Nefesi", desc: "Nefesli, hicaz havasında" },
    { id: "udteli", label: "Ud Teli", desc: "Hicaz arpej, ud teli" },
    { id: "kanun", label: "Kanun Çiseleyişi", desc: "Hızlı inen kanun notaları" },
    { id: "akor", label: "Yumuşak Akor", desc: "Sakin, uzun sönümlü akor" }
  ];

  constructor() {
    window.app = this;
    window.onNativeCompassUpdate = (heading, accuracy, pitch, roll) => {
      this.onNativeCompassUpdate(heading, accuracy, pitch, roll);
    };

    this.engine = new PrayerEngine();
    this.compass = null;

    this.currentLocation = this.loadSavedLocation();
    this.currentTimes = null;
    this.activePrayerKey = null;

    // Ses Tercihleri
    this.prayerAlerts = this.loadPrayerAlerts();

    // Sabit Bildirim Tercihi (Varsayılan: Açık)
    this.ongoingNotifEnabled = this.loadOngoingNotifSetting();

    // Otomatik Güncelleme Sistemi (GitHub Releases)
    // Dağıtım: "play" (kendini güncelleme yok), "github" (APK güncelleyici var) veya "web"
    this.distribution = (window.AndroidBridge && window.AndroidBridge.getDistribution) ? window.AndroidBridge.getDistribution() : "web";
    this.canSelfUpdate = this.distribution !== "play";
    this.currentVersion = "v2.9.0";
    this.versionCodename = "İkindi";
    this.versionDisplay = "v2.9.0 • İkindi";
    this.onboardingStep = 1;
    this.monthlyYear = null;
    this.monthlyMonth = null;
    this.updateInfo = null;
    this.isDownloadingUpdate = false;

    this.autoSilent = localStorage.getItem("tamvakti_auto_silent") !== "false";

    // Bildirim tercihleri
    // bip = telefonun kendi bildirim sesi, sessiz = yalnızca yazı (eski "ezan" ayarı bip'e taşınır)
    this.notifMode = localStorage.getItem("tamvakti_notif_mode") === "sessiz" ? "sessiz" : "bip";
    this.kerahatAlert = localStorage.getItem("tamvakti_kerahat_alert") !== "false";
    this.fullScreenAlert = localStorage.getItem("tamvakti_fullscreen_alert") === "true"; // varsayılan kapalı
    // Vakit bildirim sesi: "telefon" = telefonun bildirim sesi, ya da Tam Vakti'nin özgün sade tonlarından biri
    this.alertTone = localStorage.getItem("tamvakti_alert_tone") || "telefon";
    if (!TamVaktiApp.TONES.some(t => t.id === this.alertTone)) this.alertTone = "telefon";
    // Hesaplama yöntemi: "auto" = konuma göre en sık kullanılan yöntem; ya da CALC_METHODS anahtarı
    this.calcMethodPref = localStorage.getItem("tamvakti_calc_method") || "auto";
    // İhtiyat: tüm vakitlere eklenen dakika (Diyanet ± ayarı)
    this.timeOffsetMin = parseInt(localStorage.getItem("tamvakti_time_offset"), 10) || 0;
    this._syncSeq = 0;

    this.isFriday = false;

    this.init();
  }

  onNativeCompassUpdate(heading, accuracy, pitch, roll) {
    if (this.compass) {
      this.compass.onNativeUpdate(heading, accuracy, pitch, roll);
    }
  }

  loadOngoingNotifSetting() {
    const saved = localStorage.getItem("tamvakti_ongoing_notif");
    return saved !== null ? saved === "true" : true;
  }

  setOngoingNotifSetting(enabled) {
    this.ongoingNotifEnabled = enabled;
    localStorage.setItem("tamvakti_ongoing_notif", enabled ? "true" : "false");
    if (!enabled) {
      if (window.AndroidBridge && window.AndroidBridge.cancelPrayerNotification) {
        window.AndroidBridge.cancelPrayerNotification();
      }
    } else {
      if (window.AndroidBridge && window.AndroidBridge.requestNotificationPermission) {
        window.AndroidBridge.requestNotificationPermission();
      }
      this.evaluateCurrentPrayer();
    }
    this.scheduleSync();
  }

  toggleOngoingNotification(checked) {
    this.setOngoingNotifSetting(checked);
  }

  // Bildirim ve başlıklarda yalnızca bulunulan yer gösterilir: "Konya/Ilgın" -> "Ilgın"
  shortPlaceName(name) {
    const n = String(name !== undefined ? name : (this.currentLocation && this.currentLocation.name) || "").trim();
    if (n.includes("/")) return n.split("/").pop().trim();
    if (n.includes(",")) return (n.split(",")[1] || n.split(",")[0]).trim();
    return n;
  }

  loadSavedLocation() {
    const saved = localStorage.getItem("tamvakti_active_location");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && (parsed.name === "Konumum" || parsed.name === "Konum") && parsed.lat && parsed.lon) {
          const nearest = this.findNearestLocation(parsed.lat, parsed.lon);
          if (nearest) {
            parsed.name = (nearest.districtName && nearest.districtName !== "Merkez" && nearest.districtName !== nearest.cityName)
              ? `${nearest.cityName}/${nearest.districtName}`
              : nearest.cityName;
            localStorage.setItem("tamvakti_active_location", JSON.stringify(parsed));
          }
        }
        return parsed;
      } catch (e) {}
    }
    return { name: "Konum Seçiniz", lat: 39.9334, lon: 32.8597, isPlaceholder: true };
  }

  saveLocation(loc) {
    this.currentLocation = loc;
    localStorage.setItem("tamvakti_active_location", JSON.stringify(loc));
  }

  async init() {
    this.renderCitySelector();
    this.compass = new QiblaCompass(this.engine);

    // Eski kayıtlı 'Konumum' varsa otomatik ilçe/ile yükselt
    if (this.currentLocation && (this.currentLocation.name === "Konumum" || this.currentLocation.name === "Konum") && this.currentLocation.lat && this.currentLocation.lon) {
      const nearest = this.findNearestLocation(this.currentLocation.lat, this.currentLocation.lon);
      if (nearest) {
        this.currentLocation.name = (nearest.districtName && nearest.districtName !== "Merkez" && nearest.districtName !== nearest.cityName)
          ? `${nearest.cityName}/${nearest.districtName}`
          : nearest.cityName;
        this.saveLocation(this.currentLocation);
      }
    }

    // Modal açıldığında toggle durumunu senkronize et
    ["ongoingNotifToggle", "onboardingOngoingToggle"].forEach(id => {
      const cb = document.getElementById(id);
      if (cb) cb.checked = this.ongoingNotifEnabled;
    });

    // Bildirim izni: kurulum tamamlandıysa burada, değilse sihirbazın bildirim adımında istenir
    const setupDone = localStorage.getItem("tamvakti_onboarding_completed") === "true";
    if (setupDone && this.ongoingNotifEnabled && window.AndroidBridge && window.AndroidBridge.requestNotificationPermission) {
      window.AndroidBridge.requestNotificationPermission();
    }

    // Canlı Saat & Tarih Sayacı
    setInterval(() => this.tick(), 1000);
    this.tick();

    await this.updatePrayers();
    if (typeof this.updateOnboardingLocationDisplay === "function") {
      this.updateOnboardingLocationDisplay();
    }

    // Kurulum sihirbazı: yalnızca ilk açılışta; konum kaybolduysa doğrudan konum adımından
    // Sihirbaz sürümü: yeni adımlar eklenince (v2: izin adımları) eski kullanıcılara bir kez daha gösterilir
    const onboardingDone = localStorage.getItem("tamvakti_onboarding_completed") === "true" &&
      (parseInt(localStorage.getItem("tamvakti_onboarding_version"), 10) || 1) >= TamVaktiApp.ONBOARDING_VERSION;
    const hasSavedLocation = !!localStorage.getItem("tamvakti_active_location");
    if (!onboardingDone) {
      this.openOnboarding(1);
    } else if (!hasSavedLocation) {
      this.openOnboarding("location");
    }

    // Eksik izin varsa (alarm / bildirim) bir kez nazikçe hatırlat
    setTimeout(() => {
      const p = this.getPermissionState();
      if (p && !this._permHinted && (!p.exact || !p.notif) && localStorage.getItem("tamvakti_onboarding_completed") === "true") {
        this._permHinted = true;
        this.showToast("Uyarıların zamanında gelmesi için Ayarlar › İzinler bölümünü kontrol edin.", "⏰", 4500);
      }
    }, 5000);

    // Arka planda sessizce yeni GitHub sürümünü denetle (bilinen sürüm için rozet hemen görünür)
    if (this.canSelfUpdate) {
      this.loadCachedUpdate();
      setTimeout(() => this.checkForUpdates(true), 2500);
    }
  }

  // Aktif hesaplama yöntemini (otomatik ya da seçilen) motora uygula; değiştiyse true döner
  applyCalcMethod() {
    const loc = this.currentLocation;
    let key = this.calcMethodPref;
    if (key === "auto" || !CALC_METHODS[key]) {
      key = (loc && loc.lat != null) ? this.engine.methodForLocation(loc.lat, loc.lon) : "diyanet";
    }
    const changed = this.engine.method !== key;
    this.engine.setMethod(key);
    return changed;
  }

  async updatePrayers() {
    this.applyCalcMethod();
    const now = new Date();
    
    // Şehir Rozeti
    const isPlaceholder = !this.currentLocation || this.currentLocation.isPlaceholder || this.currentLocation.name === "Konum Seçiniz";
    const displayName = isPlaceholder ? "Konum Seçiniz" : this.shortPlaceName();
    document.getElementById("headerCityName").textContent = displayName;

    // Vakitleri Al
    const rawTimes = await this.engine.getPrayerTimes(
      now, 
      this.currentLocation.lat, 
      this.currentLocation.lon
    );
    this.currentTimes = this.applyOffset(rawTimes);

    // Miladi + Hicri tarih (Hicri, API verisi geldikten sonra yazılır)
    this.updateMiladiDate();

    // Kıble Açısı ve Mesafe (Kıble etkinse güvenli çalıştır)
    if (this.compass) {
      const qiblaInfo = this.engine.calculateQibla(this.currentLocation.lat, this.currentLocation.lon);
      const angleBigEl = document.getElementById("qiblaAngleBig");
      if (angleBigEl) angleBigEl.textContent = `${Math.round(qiblaInfo.angle)}°`;
      const distSubEl = document.getElementById("qiblaDistanceSub");
      if (distSubEl) distSubEl.textContent = `Kâbe'ye ≈ ${qiblaInfo.distanceKm.toLocaleString('tr-TR')} km`;
      const headerCityEl = document.getElementById("qiblaHeaderCity");
      if (headerCityEl) headerCityEl.textContent = displayName;
      this.compass.setTargetQibla(qiblaInfo.angle, this.currentLocation.lat, this.currentLocation.lon);
    }

    this.renderDayRibbon();
    this.evaluateCurrentPrayer();
    this.updateSolarTransitCurve(); // güneş yayı etiketleri yöntem/ihtiyat/konum değişince hemen yenilensin
    this.scheduleSync();
  }

  // ==========================================
  // İHTİYAT (dakika ayarı)
  // ==========================================
  shiftTime(str, minutes) {
    if (!str || !/^\d{1,2}:\d{2}$/.test(str) || !minutes) return str;
    const [h, m] = str.split(":").map(Number);
    const total = (((h * 60 + m + minutes) % 1440) + 1440) % 1440;
    return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
  }

  applyOffset(times) {
    if (!times || !this.timeOffsetMin) return times;
    const out = { ...times };
    PRAYER_LIST.forEach(p => { out[p.key] = this.shiftTime(times[p.key], this.timeOffsetMin); });
    return out;
  }

  offsetLabel() {
    const o = this.timeOffsetMin;
    return `${o > 0 ? "+" : o < 0 ? "−" : "±"}${Math.abs(o)} dk`;
  }

  updateMiladiDate() {
    const now = new Date();
    const months = [
      "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
      "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
    ];
    const days = [
      "Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"
    ];

    const dayNum = now.getDate();
    const monthName = months[now.getMonth()];
    const dayName = days[now.getDay()];
    this.isFriday = (now.getDay() === 5);

    const mainEl = document.getElementById("miladiDateMain");
    if (mainEl) mainEl.textContent = `${dayName}, ${dayNum} ${monthName}`;

    // Hicri Takvim (Diyanet / civil uyumlu format: "Pazartesi • 29 Rebiülahir")
    const hicriEl = document.getElementById("hicriDateSub");
    if (hicriEl) {
      try {
        const islamicMonths = [
          "",
          "Muharrem", "Sefer", "Rebiülevvel", "Rebiülahir",
          "Cemaziyelevvel", "Cemaziyelahir", "Recep", "Şaban",
          "Ramazan", "Şevval", "Zilkade", "Zilhicce"
        ];
        const parts = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {
          day: 'numeric',
          month: 'numeric'
        }).formatToParts(now);
        const hDay = parts.find(p => p.type === 'day')?.value || '';
        const hMonthNum = parseInt(parts.find(p => p.type === 'month')?.value || '1', 10);
        const hMonth = islamicMonths[hMonthNum] || '';
        // Çevrimiçi Diyanet/Aladhan verisi varsa onu esas al; yoksa Ümmü'l-Kurâ hesabı
        const apiHijri = this.currentTimes && this.currentTimes.hijriDay;
        hicriEl.textContent = apiHijri || `${hDay} ${hMonth}`;
      } catch (e) {
        hicriEl.textContent = "";
      }
    }
  }

  // Günün güneş yolu: x = günün saati (00:00-24:00), y = o andaki gerçek güneş yüksekliği.
  // Vakit noktaları gerçek saatlerine oturur; şu anki yerde güneş (geceleyin hilal) parlar.
  updateSolarTransitCurve() {
    const nodesEl = document.getElementById("solarArcNodes");
    const sunEl = document.getElementById("solarArcSun");
    const baseEl = document.getElementById("arcBase");
    const passedEl = document.getElementById("arcPassed");
    if (!nodesEl || !sunEl || !baseEl || !passedEl || !this.currentTimes || !this.currentLocation) return;

    const W = 340, PAD = 16, Y0 = 150, K = 1.9;
    const { lat, lon } = this.currentLocation;
    const now = new Date();
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const xOf = (min) => PAD + (min / 1440) * (W - 2 * PAD);
    const altAt = (min) => {
      const d = new Date(dayStart.getTime() + min * 60000);
      return this.engine.getSunPositionNow(d, lat, lon).altitude;
    };
    // Ufkun üstü tam ölçek, altı sıkıştırılmış (eğri kırpılmadan sığsın)
    const yOf = (alt) => alt >= 0 ? Y0 - Math.min(alt, 80) * K : Y0 - Math.max(alt, -75) * 0.7;
    const nowMin = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;

    // Eğri: 10 dakikalık adımlarla
    let dBase = "", dPassed = "";
    for (let m = 0; m <= 1440; m += 10) {
      const pt = `${xOf(m).toFixed(1)} ${yOf(altAt(m)).toFixed(1)}`;
      dBase += (m === 0 ? "M " : " L ") + pt;
      if (m <= nowMin) dPassed += (dPassed ? " L " : "M ") + pt;
    }
    dPassed += ` L ${xOf(nowMin).toFixed(1)} ${yOf(altAt(nowMin)).toFixed(1)}`;
    baseEl.setAttribute("d", dBase);
    passedEl.setAttribute("d", dPassed);

    // Vakit işaretleri (isim + saat)
    const keys = ["imsak", "gunes", "ogle", "ikindi", "aksam", "yatsi"];
    const names = { imsak: "İmsak", gunes: "Güneş", ogle: this.isFriday ? "Cuma" : "Öğle", ikindi: "İkindi", aksam: "Akşam", yatsi: "Yatsı" };
    // Etiketler eğrinin çizgisine binmesin: yükselen tarafta sola/aşağı-sağa, alçalan tarafta sağa/aşağı-sola
    // anchor: yazının hizası, dx: yatay kayma, dy: isim satırının y farkı
    const place = {
      imsak:  { anchor: "start",  dx: 9,  dy: 21 },
      gunes:  { anchor: "end",    dx: -9, dy: -19 },
      ogle:   { anchor: "middle", dx: 0,  dy: -25 },
      ikindi: { anchor: "start",  dx: 9,  dy: -19 },
      aksam:  { anchor: "end",    dx: -9, dy: 21 },
      yatsi:  { anchor: "start",  dx: 9,  dy: -23 }
    };
    const curIdx = keys.indexOf(this.activePrayerKey);
    let html = "";
    keys.forEach((k, idx) => {
      const str = this.currentTimes[k];
      if (!/^\d{1,2}:\d{2}$/.test(str || "")) return;
      const [h, mi] = str.split(":").map(Number);
      const min = h * 60 + mi;
      const x = xOf(min), y = yOf(altAt(min));
      const past = idx < curIdx, active = idx === curIdx;
      const fill = active ? "#38bdf8" : past ? "#fb923c" : "#475569";
      const nameCol = active ? "#7dd3fc" : past ? "#fdba74" : "#94a3b8";
      const pl = place[k];
      const tx = x + pl.dx, ty = y + pl.dy;
      html += `
        <g onclick="app.showPrayerDetail('${k}')" class="cursor-pointer">
          <circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${active ? 5.5 : 4.2}" fill="${fill}" stroke="#090e1a" stroke-width="1.5"/>
          <circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="16" fill="transparent"/>
          <text x="${tx.toFixed(1)}" y="${ty.toFixed(1)}" text-anchor="${pl.anchor}" fill="${nameCol}" font-size="13.5" font-weight="${active ? 800 : 700}">${names[k]}</text>
          <text x="${tx.toFixed(1)}" y="${(ty + 11.5).toFixed(1)}" text-anchor="${pl.anchor}" fill="${active ? "#e0f2fe" : "#94a3b8"}" font-size="12" font-family="'JetBrains Mono', monospace">${str}</text>
        </g>`;
    });
    nodesEl.innerHTML = html;

    // Şu anki yer: gündüz güneş, gece hilal
    const altNow = altAt(nowMin);
    const sx = xOf(nowMin), sy = yOf(altNow);
    if (altNow > -0.833) {
      let rays = "";
      for (let a = 0; a < 8; a++) {
        const r = (a * 45) * Math.PI / 180;
        rays += `<line x1="${(Math.cos(r) * 12.5).toFixed(1)}" y1="${(Math.sin(r) * 12.5).toFixed(1)}" x2="${(Math.cos(r) * 17.5).toFixed(1)}" y2="${(Math.sin(r) * 17.5).toFixed(1)}" stroke="#fcd34d" stroke-width="2" stroke-linecap="round"/>`;
      }
      sunEl.innerHTML = `
        <g transform="translate(${sx.toFixed(1)} ${sy.toFixed(1)})" pointer-events="none">
          <circle r="30" fill="url(#sunHalo)"/>
          <g>${rays}<animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="40s" repeatCount="indefinite"/></g>
          <circle r="9.5" fill="url(#sunCore)"/>
        </g>`;
    } else {
      sunEl.innerHTML = `
        <g transform="translate(${sx.toFixed(1)} ${sy.toFixed(1)})" pointer-events="none">
          <circle r="28" fill="url(#moonHalo)"/>
          <path d="M 4 -9.5 A 10 10 0 1 0 4 9.5 A 8 8 0 1 1 4 -9.5 Z" fill="#bae6fd"/>
        </g>`;
    }
  }

  renderDayRibbon() {
    const ribbon = document.getElementById("dayTimesRibbon");
    if (!ribbon || !this.currentTimes) return;

    const orderKeys = ["imsak", "gunes", "ogle", "ikindi", "aksam", "yatsi"];
    const currentIdx = Math.max(0, orderKeys.indexOf(this.activePrayerKey));
    const nextIdx = (currentIdx + 1) % 6;

    // 3x2 büyük kutu: yaşlılar ve küçük ekranlar için okunaklı (ad 15px, saat 22px)
    ribbon.innerHTML = PRAYER_LIST.map((item, idx) => {
      const timeVal = this.currentTimes[item.key] || "--:--";
      const isCurrent = (item.key === this.activePrayerKey);
      const isNext = (idx === nextIdx);

      let box = "flex flex-col items-center justify-center py-3 px-1 rounded-2xl transition-all border";
      let nameColor, timeColor;
      if (isCurrent) {
        box += " bg-sky-500/20 border-sky-400/70 shadow-[0_0_14px_rgba(56,189,248,0.28)]";
        nameColor = "text-sky-200 font-bold";
        timeColor = "text-white font-bold";
      } else if (isNext) {
        box += " bg-slate-800/60 border-slate-500/60";
        nameColor = "text-sky-100 font-semibold";
        timeColor = "text-sky-50 font-bold";
      } else {
        box += " bg-slate-900/40 border-transparent";
        nameColor = "text-slate-300 font-semibold";
        timeColor = "text-slate-200 font-semibold";
      }

      const displayName = (item.key === "ogle" && this.isFriday) ? "Cuma" : item.name;
      const dot = this.isAlertOn(item.key) ? '<span class="inline-block w-1.5 h-1.5 rounded-full bg-sky-400 ml-1.5 align-middle" title="Uyarı açık"></span>' : '';

      return `
        <div onclick="app.showPrayerDetail('${item.key}')" class="${box} cursor-pointer active:scale-95" title="${displayName}: ${timeVal}">
          <span class="text-[15px] ${nameColor}">${displayName}${dot}</span>
          <span class="text-[22px] leading-tight font-mono mt-0.5 ${timeColor}">${timeVal}</span>
        </div>
      `;
    }).join("");
  }

  // ==========================================
  // VAKİT UYARILARI (her vakit için: vaktinde + vakitten önce)
  // ==========================================
  loadPrayerAlerts() {
    const keys = ["imsak", "gunes", "ogle", "ikindi", "aksam", "yatsi"];
    // Varsayılan: Güneş hariç beş vakitte vaktinde uyarı açık, vakitten önce kapalı
    const def = {};
    keys.forEach(k => { def[k] = { at: k !== "gunes", before: 0 }; });
    try {
      const saved = JSON.parse(localStorage.getItem("tamvakti_prayer_alerts"));
      if (saved) {
        keys.forEach(k => { if (saved[k]) def[k] = { at: !!saved[k].at, before: Number(saved[k].before) || 0 }; });
        return def;
      }
      // Eski sürümün tek anahtarlı ayarından taşı
      const old = JSON.parse(localStorage.getItem("tamvakti_sound_settings"));
      if (old) {
        const rem = parseInt(localStorage.getItem("tamvakti_reminder_min"), 10) || 15;
        keys.forEach(k => { def[k] = old[k] ? { at: true, before: rem } : { at: false, before: 0 }; });
      }
    } catch (e) {}
    return def;
  }

  savePrayerAlerts() {
    localStorage.setItem("tamvakti_prayer_alerts", JSON.stringify(this.prayerAlerts));
  }

  isAlertOn(key) {
    const a = this.prayerAlerts[key];
    return !!a && (a.at || a.before > 0);
  }

  alertSummary(key) {
    const a = this.prayerAlerts[key];
    const parts = [];
    if (a.before > 0) parts.push(`${a.before} dk önce`);
    if (a.at) parts.push("vaktinde");
    return parts.length ? parts.join(" + ") : "Kapalı";
  }

  prayerDisplayName(key) {
    const p = PRAYER_LIST.find(x => x.key === key);
    return (key === "ogle" && this.isFriday) ? "Cuma (Öğle)" : (p ? p.name : key);
  }

  // Vakte dokununca: o vakit için uyarı ayarları
  showPrayerDetail(key) {
    if (!this.prayerAlerts[key]) return;
    this._detailKey = key;
    const set = (id, txt) => { const el = document.getElementById(id); if (el) el.textContent = txt; };
    set("detailModalTitle", this.prayerDisplayName(key));
    set("detailModalTime", (this.currentTimes && this.currentTimes[key]) || "--:--");
    this.refreshDetailAlerts();
    document.getElementById("detailModal").classList.remove("hidden");
  }

  refreshDetailAlerts() {
    const key = this._detailKey;
    if (!key) return;
    const a = this.prayerAlerts[key];
    const at = document.getElementById("detailAtToggle");
    if (at) at.checked = a.at;
    const before = document.getElementById("detailBeforeValue");
    if (before) before.textContent = a.before > 0 ? `${a.before} dk önce` : "Kapalı";
    const how = document.getElementById("detailAtHint");
    if (how) how.textContent = this.notifMode === "sessiz" ? "Sessiz bildirim gelir" : "Seçtiğiniz sesle bildirim gelir";
  }

  setPrayerAlertAt(checked) {
    const key = this._detailKey;
    if (!key) return;
    this.prayerAlerts[key].at = !!checked;
    this.savePrayerAlerts();
    this.afterAlertChange();
  }

  openBeforeSheet() {
    const key = this._detailKey;
    if (!key) return;
    const opts = [0, 5, 10, 15, 20, 30, 45].map(m => ({ value: m, label: m === 0 ? "Kapalı" : `${m} dakika önce` }));
    this.openChoice(`${this.prayerDisplayName(key)} • vakitten önce uyar`, "Vakit girmeden ne kadar önce haber verilsin?", opts, this.prayerAlerts[key].before, (v) => {
      this.prayerAlerts[key].before = Number(v);
      this.savePrayerAlerts();
      this.afterAlertChange();
    });
  }

  afterAlertChange() {
    this.refreshDetailAlerts();
    this.renderDayRibbon();
    this.updateSolarTransitCurve();
    this.updateSettingsLabels();
    this.scheduleSync();
  }

  // Ayarlar: altı vaktin özeti; birine dokununca aynı pencere açılır
  openPrayerAlertList() {
    const keys = ["imsak", "gunes", "ogle", "ikindi", "aksam", "yatsi"];
    const opts = keys.map(k => ({
      value: k,
      label: `${this.prayerDisplayName(k)}  ${(this.currentTimes && this.currentTimes[k]) || ""}`.trim(),
      desc: this.alertSummary(k)
    }));
    this.openChoice("Vakit uyarıları", "Düzenlemek istediğiniz vakte dokunun.", opts, null, (k) => this.showPrayerDetail(k));
  }

  closePrayerDetail() {
    document.getElementById("detailModal").classList.add("hidden");
  }

  tick() {
    const _n = new Date();
    if (this.currentTimes && this._arcMin !== _n.getMinutes()) {
      this._arcMin = _n.getMinutes();
      this.updateSolarTransitCurve();
    }
    // Gece yarısı geçildiyse tarihi ve vakitleri yeniden yükle
    const t = new Date();
    const todayKey = `${t.getFullYear()}-${t.getMonth()}-${t.getDate()}`;
    if (this._dayKey && this._dayKey !== todayKey && !this._refreshingDay) {
      this._refreshingDay = true;
      this._dayKey = todayKey;
      this.updatePrayers().finally(() => { this._refreshingDay = false; });
      return;
    }
    this._dayKey = todayKey;

    if (this.currentTimes) {
      this.evaluateCurrentPrayer();
    }
  }

  // Android uygulaması arka plandan döndüğünde çağrılır
  onAppResume() {
    this.updatePrayers();
    this.refreshPermissionStatus();
    this.onOnboardingResume();
    const viewQibla = document.getElementById("viewQibla");
    const qiblaVisible = viewQibla && !viewQibla.classList.contains("hidden");
    if (this.compass && qiblaVisible) {
      this.compass.resumeCompass(); // native taraf onPause'da durdu
    }
  }

  parseTimeToDate(timeStr, baseDate) {
    if (!timeStr) return null;
    const [h, m] = timeStr.split(":").map(Number);
    const d = new Date(baseDate);
    d.setHours(h, m, 0, 0);
    return d;
  }

  getKerahatTime(targetDate, minusMinutes = 45) {
    if (!targetDate) return "--:--";
    const kerahatDate = new Date(targetDate.getTime() - minusMinutes * 60 * 1000);
    const kh = String(kerahatDate.getHours()).padStart(2, '0');
    const km = String(kerahatDate.getMinutes()).padStart(2, '0');
    return `${kh}:${km}`;
  }

  evaluateCurrentPrayer() {
    if (!this.currentTimes) return;
    const now = new Date();

    const tImsak = this.parseTimeToDate(this.currentTimes.imsak, now);
    const tGunes = this.parseTimeToDate(this.currentTimes.gunes, now);
    const tOgle = this.parseTimeToDate(this.currentTimes.ogle, now);
    const tIkindi = this.parseTimeToDate(this.currentTimes.ikindi, now);
    const tAksam = this.parseTimeToDate(this.currentTimes.aksam, now);
    const tYatsi = this.parseTimeToDate(this.currentTimes.yatsi, now);

    const prayerOrder = [
      { key: "imsak", name: "İmsak", start: tImsak, end: tGunes, nextName: "Güneş", nextTime: tGunes, nextTimeStr: this.currentTimes.gunes },
      { key: "gunes", name: "Güneş", start: tGunes, end: tOgle, nextName: "Öğle", nextTime: tOgle, nextTimeStr: this.currentTimes.ogle },
      { key: "ogle", name: "Öğle", start: tOgle, end: tIkindi, nextName: "İkindi", nextTime: tIkindi, nextTimeStr: this.currentTimes.ikindi },
      { key: "ikindi", name: "İkindi", start: tIkindi, end: tAksam, nextName: "Akşam", nextTime: tAksam, nextTimeStr: this.currentTimes.aksam },
      { key: "aksam", name: "Akşam", start: tAksam, end: tYatsi, nextName: "Yatsı", nextTime: tYatsi, nextTimeStr: this.currentTimes.yatsi },
      { key: "yatsi", name: "Yatsı", start: tYatsi, end: new Date(tImsak.getTime() + 86400000), nextName: "İmsak", nextTime: new Date(tImsak.getTime() + 86400000), nextTimeStr: this.currentTimes.imsak }
    ];

    let current = null;
    if (now < tImsak) {
      const prevYatsi = new Date(tYatsi.getTime() - 86400000);
      current = {
        key: "yatsi",
        name: "Yatsı",
        start: prevYatsi,
        end: tImsak,
        nextName: "İmsak",
        nextTime: tImsak,
        nextTimeStr: this.currentTimes.imsak
      };
    } else {
      for (let p of prayerOrder) {
        if (now >= p.start && now < p.end) {
          current = p;
          break;
        }
      }
    }

    if (!current) current = prayerOrder[0];

    // Aktif Vakit Rozeti
    if (this.activePrayerKey !== current.key) {
      this.activePrayerKey = current.key;
      this.renderDayRibbon();
    }

    // 1. Üst Başlık: "Akşam'a kalan · 18:26"
    const nextLabel = document.getElementById("nextPrayerInfo");
    const suffixes = {
      "imsak": "İmsak'a",
      "gunes": "Güneş'e",
      "ogle": "Öğle'ye",
      "ikindi": "İkindi'ye",
      "aksam": "Akşam'a",
      "yatsi": "Yatsı'ya"
    };
    const orderKeys = ["imsak", "gunes", "ogle", "ikindi", "aksam", "yatsi"];
    const currentIdx = orderKeys.indexOf(current.key);
    const nextKey = currentIdx >= 0 ? orderKeys[(currentIdx + 1) % 6] : "aksam";
    const suffixName = suffixes[nextKey] || `${current.nextName}'e`;
    if (nextLabel) {
      nextLabel.textContent = `${suffixName} Kalan`;
    }

    // Horizon 2B: Şu An Vakit Rozeti
    const currentBadge = document.getElementById("currentPrayerBadge");
    if (currentBadge) {
      currentBadge.textContent = `Şu an: ${current.name}`;
    }

    // 2. Canlı Geri Sayım (HH:MM:SS) - Tabular ve Soluk Saniye
    const diffMs = Math.max(0, current.nextTime.getTime() - now.getTime());
    const diffSec = Math.floor(diffMs / 1000);
    const hrs = Math.floor(diffSec / 3600);
    const mins = Math.floor((diffSec % 3600) / 60);
    const secs = diffSec % 60;

    const hrsStr = String(hrs).padStart(2, '0');
    const minsStr = String(mins).padStart(2, '0');
    const secsStr = String(secs).padStart(2, '0');

    const countEl = document.getElementById("mainCountdown");
    if (countEl) {
      countEl.innerHTML = `<span class="cd-main">${hrsStr}:${minsStr}:</span><span class="cd-sec">${secsStr}</span>`;
    }

    // 2. İlerleme çizgisi: mevcut vaktin ne kadarı geçti
    const totalDuration = Math.max(1, current.end.getTime() - current.start.getTime());
    const elapsed = Math.min(Math.max(0, now.getTime() - current.start.getTime()), totalDuration);
    const pct = ((elapsed / totalDuration) * 100).toFixed(1);

    const setText = (id, txt) => { const el = document.getElementById(id); if (el) el.textContent = txt; };
    const hPassed = document.getElementById("horizonPassedSegment");
    if (hPassed) hPassed.style.width = `${pct}%`;
    setText("horizonStartName", current.name);
    setText("horizonStartTime", this.currentTimes[current.key] || "--:--");
    setText("horizonEndName", current.nextName);
    setText("horizonEndTime", current.nextTimeStr || "--:--");
    setText("horizonElapsedText", `${Math.floor(elapsed / 3600000)} sa ${Math.floor((elapsed % 3600000) / 60000)} dk`);

    // 3. Kerahat: doğuştan sonraki 45 dk, öğleye ve akşama 45 dk kala
    const K = 45 * 60000;
    const nowMs = now.getTime();
    let kerahatEnd = null;        // şu an kerahattaysak bitiş zamanı
    let kerahatNextStart = null;  // yaklaşan kerahatin başlangıcı
    let zoneStart = null;         // çubuktaki kerahat bölgesinin başlangıcı
    if (current.key === "gunes") {
      zoneStart = tOgle.getTime() - K;
      if (nowMs < tGunes.getTime() + K) kerahatEnd = tGunes.getTime() + K;
      else if (nowMs >= zoneStart) kerahatEnd = tOgle.getTime();
      else kerahatNextStart = zoneStart;
    } else if (current.key === "ikindi") {
      zoneStart = tAksam.getTime() - K;
      if (nowMs >= zoneStart) kerahatEnd = tAksam.getTime();
      else kerahatNextStart = zoneStart;
    }

    const kZone = document.getElementById("horizonKerahatZone");
    if (kZone) {
      if (zoneStart !== null) {
        const w = Math.min(60, Math.max(8, (K / totalDuration) * 100));
        kZone.style.width = `${w.toFixed(1)}%`;
        kZone.classList.remove("hidden");
      } else {
        kZone.classList.add("hidden");
      }
    }
    const kBadge = document.getElementById("horizonKerahatBadge");
    const kRemain = document.getElementById("horizonKerahatRemainText");
    const fmtHM = (ms) => this.getKerahatTime(new Date(ms), 0);
    // 60 dk ve üstü "1 sa 36 dk", altı "45 dk" olarak yazılır
    const fmtDur = (ms) => {
      const mins = Math.max(1, Math.ceil(ms / 60000));
      if (mins < 60) return `${mins} dk`;
      const h = Math.floor(mins / 60), m = mins % 60;
      return m === 0 ? `${h} sa` : `${h} sa ${m} dk`;
    };
    let badgeTxt = "", remainTxt = "", warn = false;
    if (kerahatEnd !== null) {
      badgeTxt = "Kerahat vakti";
      remainTxt = `${fmtDur(kerahatEnd - nowMs)} sonra biter`;
      warn = true;
    } else if (kerahatNextStart !== null) {
      badgeTxt = `Kerahat ${fmtHM(kerahatNextStart)}`;
      remainTxt = `Kerahate ${fmtDur(kerahatNextStart - nowMs)}`;
      warn = true;
    }
    // Kerahat yoksa hiçbir şey gösterme (sade)
    if (kBadge) {
      kBadge.classList.toggle("hidden", !warn);
      const sp = kBadge.querySelector("span:last-child");
      if (sp) sp.textContent = badgeTxt;
    }
    if (kRemain) {
      kRemain.textContent = remainTxt;
      kRemain.classList.toggle("hidden", !warn);
    }

    // 3. Android Durum Çubuğu Sabit Bildirimini Güncelle
    if (this.ongoingNotifEnabled && window.AndroidBridge && window.AndroidBridge.updatePrayerNotification) {
      const targetTimeMillis = current.nextTime.getTime();
      // Her saniye gereksiz IPC çağrısı yapmamak için hedef vakit değiştiğinde güncelle
      if (this._lastNotifTargetMillis !== targetTimeMillis || this._lastNotifCity !== this.currentLocation.name) {
        this._lastNotifTargetMillis = targetTimeMillis;
        this._lastNotifCity = this.currentLocation.name;
        const cityName = this.shortPlaceName();
        window.AndroidBridge.updatePrayerNotification(
          cityName,
          current.nextName,
          current.nextTimeStr,
          targetTimeMillis
        );
      }
    }
  }

  // Sekme Değiştirici: Vakitler / Kıble / Aylık Vakitler / Ayarlar
  toggleQiblaTab() {
    const viewQibla = document.getElementById("viewQibla");
    const isQiblaVisible = viewQibla && !viewQibla.classList.contains("hidden");
    if (isQiblaVisible) {
      this.switchTab("prayer");
    } else {
      this.switchTab("qibla");
    }
  }

  switchTab(tab) {
    const viewPrayer = document.getElementById("viewPrayer");
    const viewQibla = document.getElementById("viewQibla");
    const btnPrayer = document.getElementById("tabBtn-prayer");
    const btnQibla = document.getElementById("tabBtn-qibla");
    const btnMonthly = document.getElementById("tabBtn-monthly");
    const headerQiblaBtn = document.getElementById("headerQiblaBtn");

    if (tab === "prayer") {
      this.closeMonthlyModal();
      this.closeSettingsModal();
      if (viewPrayer) viewPrayer.classList.remove("hidden");
      if (viewQibla) viewQibla.classList.add("hidden");
      if (btnPrayer) {
        btnPrayer.classList.add("text-sky-400", "font-bold");
        btnPrayer.classList.remove("text-slate-400");
      }
      if (btnQibla) {
        btnQibla.classList.add("text-slate-400");
        btnQibla.classList.remove("text-sky-400", "font-bold");
      }
      if (headerQiblaBtn) {
        headerQiblaBtn.classList.remove("text-sky-400", "border-sky-400/80", "bg-sky-500/25");
        headerQiblaBtn.classList.add("text-slate-300");
      }
      if (this.compass) {
        this.compass.stopCompass();
      }
    } else if (tab === "qibla") {
      this.closeMonthlyModal();
      this.closeSettingsModal();
      if (viewPrayer) viewPrayer.classList.add("hidden");
      if (viewQibla) viewQibla.classList.remove("hidden");
      if (btnPrayer) {
        btnPrayer.classList.add("text-slate-400");
        btnPrayer.classList.remove("text-sky-400", "font-bold");
      }
      if (btnQibla) {
        btnQibla.classList.add("text-sky-400", "font-bold");
        btnQibla.classList.remove("text-slate-400");
      }
      if (headerQiblaBtn) {
        headerQiblaBtn.classList.add("text-sky-400", "border-sky-400/80", "bg-sky-500/25");
        headerQiblaBtn.classList.remove("text-slate-300");
      }

      if (this.compass) {
        const qiblaInfo = this.engine.calculateQibla(this.currentLocation.lat, this.currentLocation.lon);
        this.compass.setTargetQibla(qiblaInfo.angle, this.currentLocation.lat, this.currentLocation.lon);
        this.compass.startCompass();
      }
    } else if (tab === "monthly") {
      this.openMonthlyModal();
    } else if (tab === "settings") {
      this.openSettingsModal();
    }
  }

  // ==========================================
  // AYLIK NAMAZ VAKİTLERİ (İMSAKİYE) YÖNETİMİ
  // ==========================================
  openMonthlyModal() {
    if (this.compass) {
      this.compass.stopCompass();
    }
    const modal = document.getElementById("monthlyModal");
    if (!modal) return;

    const btnPrayer = document.getElementById("tabBtn-prayer");
    const btnQibla = document.getElementById("tabBtn-qibla");
    const btnMonthly = document.getElementById("tabBtn-monthly");
    if (btnPrayer) btnPrayer.classList.remove("active");
    if (btnQibla) btnQibla.classList.remove("active");
    if (btnMonthly) btnMonthly.classList.add("active");

    const now = new Date();
    if (!this.monthlyYear || !this.monthlyMonth) {
      this.monthlyYear = now.getFullYear();
      this.monthlyMonth = now.getMonth() + 1;
    }

    modal.classList.remove("hidden");
    document.body.classList.add("overflow-hidden");

    this.loadMonthlyData();
  }

  closeMonthlyModal() {
    const modal = document.getElementById("monthlyModal");
    if (modal) modal.classList.add("hidden");
    document.body.classList.remove("overflow-hidden");

    const btnMonthly = document.getElementById("tabBtn-monthly");
    if (btnMonthly) btnMonthly.classList.remove("active");

    const viewQibla = document.getElementById("viewQibla");
    const isQiblaActive = viewQibla && !viewQibla.classList.contains("hidden");
    const btnPrayer = document.getElementById("tabBtn-prayer");
    const btnQibla = document.getElementById("tabBtn-qibla");

    if (isQiblaActive) {
      if (btnQibla) btnQibla.classList.add("active");
      if (btnPrayer) btnPrayer.classList.remove("active");
      if (this.compass) {
        this.compass.resumeCompass();
      }
    } else {
      if (btnPrayer) btnPrayer.classList.add("active");
      if (btnQibla) btnQibla.classList.remove("active");
    }
  }

  changeMonthlyMonth(delta) {
    this.monthlyMonth += delta;
    if (this.monthlyMonth < 1) {
      this.monthlyMonth = 12;
      this.monthlyYear -= 1;
    } else if (this.monthlyMonth > 12) {
      this.monthlyMonth = 1;
      this.monthlyYear += 1;
    }
    this.loadMonthlyData();
  }

  scrollMonthlyToToday() {
    const todayRow = document.getElementById("monthlyRow-today");
    if (todayRow) {
      todayRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
      this.showToast("Bugünkü vakitler gösteriliyor");
    } else {
      const now = new Date();
      this.monthlyYear = now.getFullYear();
      this.monthlyMonth = now.getMonth() + 1;
      this.loadMonthlyData(true);
    }
  }

  async loadMonthlyData(autoScroll = true) {
    this.applyCalcMethod();
    const titleEl = document.getElementById("monthlyTitleText");
    const hijriEl = document.getElementById("monthlyHijriText");
    const cityEl = document.getElementById("monthlyCityName");
    const tableBody = document.getElementById("monthlyTableBody");
    const sourceEl = document.getElementById("monthlySourceBadge");

    if (cityEl) cityEl.textContent = (this.currentLocation && !this.currentLocation.isPlaceholder) ? this.currentLocation.name : "Konum Seçiniz";

    const trMonths = [
      '', 'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
      'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
    ];
    if (titleEl) {
      titleEl.textContent = `${trMonths[this.monthlyMonth] || ''} ${this.monthlyYear}`;
    }

    if (tableBody) {
      tableBody.innerHTML = `<tr><td colspan="7" class="py-8 text-center text-slate-400 font-sans text-xs">Vakitler yükleniyor...</td></tr>`;
    }

    try {
      const data = await this.engine.getMonthlyPrayerTimes(
        this.monthlyYear,
        this.monthlyMonth,
        this.currentLocation.lat,
        this.currentLocation.lon
      );

      if (hijriEl) {
        hijriEl.textContent = data.hijriSummary || "Hicri Takvim";
      }

      if (sourceEl) {
        const mi = this.engine.methodInfo();
        sourceEl.textContent = `${mi.short} ${data.source === 'offline-astronomical' ? 'Çevrimdışı' : 'Çevrimiçi'}`;
      }
      const noteEl = document.getElementById("monthlyMethodNote");
      if (noteEl) {
        noteEl.textContent = this.engine.method === "diyanet"
          ? "Vakitler Diyanet İşleri Başkanlığı takvim ve astronomik kriterlerine tam uyumludur."
          : `Vakitler "${this.engine.methodInfo().name}" yöntemiyle hesaplanır.`;
      }

      if (!tableBody || !data.days) return;

      tableBody.innerHTML = data.days.map(d0 => {
        const d = this.applyOffset(d0) === d0 ? d0 : { ...d0, ...this.applyOffset(d0) };
        const rowClass = d.isToday ? 'monthly-row-today' : (d.isFriday ? 'monthly-row-friday' : '');
        const rowId = d.isToday ? 'id="monthlyRow-today"' : '';
        const todayBadge = d.isToday ? '<span class="monthly-today-badge">Bugün</span>' : '';
        const friDot = d.isFriday && !d.isToday ? ' •' : '';

        return `
          <tr ${rowId} class="${rowClass} hover:bg-slate-800/60 transition-colors">
            <td class="py-2.5 px-1.5 text-left pl-3 font-sans">
              <span class="font-extrabold">${d.day}</span>
              <span class="text-[10px] opacity-75 font-semibold ml-0.5">${d.dayOfWeekShort}${friDot}</span>
              ${todayBadge}
            </td>
            <td class="py-2 px-1">${d.imsak}</td>
            <td class="py-2 px-1">${d.gunes}</td>
            <td class="py-2 px-1">${d.ogle}</td>
            <td class="py-2 px-1">${d.ikindi}</td>
            <td class="py-2 px-1">${d.aksam}</td>
            <td class="py-2 px-1 pr-3 font-semibold">${d.yatsi}</td>
          </tr>
        `;
      }).join('');

      if (autoScroll) {
        setTimeout(() => {
          const todayRow = document.getElementById("monthlyRow-today");
          if (todayRow) {
            todayRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 120);
      }
    } catch (e) {
      if (tableBody) {
        tableBody.innerHTML = `<tr><td colspan="7" class="py-6 text-center text-rose-500 font-sans text-xs">Hesaplama yapılamadı: ${e.message}</td></tr>`;
      }
    }
  }

  // Şehir / Konum Seçimi
  renderCitySelector() {
    const listEl = document.getElementById("cityListContainer");
    if (!listEl) return;
    this._renderCityList(listEl, TURKEY_CITIES, "");
  }

  _renderCityList(listEl, cities, query) {
    const q = this._normalizeForSearch(query);
    let html = "";
    let matchCount = 0;

    cities.forEach(c => {
      const cityNorm = this._normalizeForSearch(c.name);
      const cityMatch = !q || cityNorm.includes(q);
      
      // District matches
      let matchingDistricts = [];
      let allDistricts = c.districts || [];
      
      if (q && !cityMatch) {
        matchingDistricts = allDistricts.filter(d => 
          this._normalizeForSearch(d.name).includes(q)
        );
        if (matchingDistricts.length === 0) return;
      } else if (q && cityMatch) {
        matchingDistricts = allDistricts;
      } else {
        matchingDistricts = allDistricts;
      }

      matchCount++;
      const hasDistricts = allDistricts.length > 0;
      const showDistricts = q ? true : false;
      
      html += `
        <div class="border-b border-slate-100 dark:border-sky-900/15 py-2">
          <div class="flex items-center justify-between">
            <button onclick="app.selectLocation('${c.name.replace(/'/g, "\\'")}', ${c.lat}, ${c.lon})" 
                    class="font-extrabold text-sm text-sky-100 hover:text-sky-400 text-left flex-1 cursor-pointer">
              ${c.name}
            </button>
            ${hasDistricts ? `
              <button onclick="app.toggleCityDistricts(${c.id})" 
                      id="cityExpandBtn-${c.id}"
                      class="text-[10px] px-2 py-1 rounded-lg bg-sky-50 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400 font-bold hover:bg-sky-100 dark:hover:bg-sky-900/50 transition-colors cursor-pointer flex items-center gap-1">
                <span>${allDistricts.length} ilçe</span>
                <svg class="w-3 h-3 transition-transform ${showDistricts ? 'rotate-180' : ''}" id="cityExpandIcon-${c.id}" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/></svg>
              </button>
            ` : `
              <span class="text-[10px] text-slate-400 dark:text-sky-700 font-medium">${c.lat.toFixed(2)}°K</span>
            `}
          </div>
          ${hasDistricts ? `
            <div id="cityDistricts-${c.id}" class="mt-1.5 pl-1 ${showDistricts ? '' : 'hidden'}">
              <div class="flex flex-wrap gap-1">
                ${(q && !cityMatch ? matchingDistricts : allDistricts).map(d => `
                  <button onclick="app.selectLocation('${c.name.replace(/'/g, "\\'")}/${d.name.replace(/'/g, "\\'")}', ${d.lat}, ${d.lon})"
                          class="text-[11px] px-2.5 py-1.5 rounded-xl bg-sky-50 dark:bg-sky-900/30 text-sky-900 dark:text-sky-200 hover:bg-sky-700 hover:text-white font-semibold transition-colors cursor-pointer border border-sky-100 dark:border-sky-800/30">
                    ${d.name}
                  </button>
                `).join("")}
              </div>
            </div>
          ` : ''}
        </div>
      `;
    });

    listEl.innerHTML = html || `
      <div class="text-center py-8">
        <div class="text-3xl mb-2">🔍</div>
        <div class="text-sm font-bold text-slate-400 dark:text-sky-600">Sonuç bulunamadı</div>
        <div class="text-[11px] text-slate-300 dark:text-sky-700 mt-1">Farklı bir arama deneyin</div>
      </div>
    `;

    const countEl = document.getElementById("cityResultCount");
    if (countEl) {
      countEl.textContent = q ? `${matchCount} il bulundu` : `${cities.length} il listelendi`;
    }
  }

  _normalizeForSearch(str) {
    return str
      .toLowerCase()
      .replace(/ı/g, "i")
      .replace(/ö/g, "o")
      .replace(/ü/g, "u")
      .replace(/ş/g, "s")
      .replace(/ç/g, "c")
      .replace(/ğ/g, "g")
      .replace(/â/g, "a")
      .replace(/î/g, "i")
      .replace(/û/g, "u")
      .trim();
  }

  filterCities(query) {
    const listEl = document.getElementById("cityListContainer");
    if (!listEl) return;
    this._renderCityList(listEl, TURKEY_CITIES, query);
  }

  toggleCityDistricts(cityId) {
    const el = document.getElementById(`cityDistricts-${cityId}`);
    const icon = document.getElementById(`cityExpandIcon-${cityId}`);
    if (el) {
      el.classList.toggle("hidden");
      if (icon) icon.classList.toggle("rotate-180");
    }
  }

  selectLocation(name, lat, lon) {
    this.saveLocation({ name, lat, lon });
    this.closeLocationModal();
    this.updatePrayers();

    // Kurulum sihirbazı açıksa konum adımından bir sonrakine geç
    const onboardingModal = document.getElementById("onboardingModal");
    if (onboardingModal && !onboardingModal.classList.contains("hidden")) {
      this.updateOnboardingLocationDisplay();
      this.advanceOnboardingFrom("location", 500);
    }

    const monthlyModal = document.getElementById("monthlyModal");
    if (monthlyModal && !monthlyModal.classList.contains("hidden")) {
      this.loadMonthlyData();
    }
  }

  findNearestLocation(lat, lon) {
    if (typeof TURKEY_CITIES === "undefined" || !Array.isArray(TURKEY_CITIES) || !TURKEY_CITIES.length) {
      return null;
    }

    let closest = null;
    let minDistanceSq = Infinity;
    const radLat = (lat * Math.PI) / 180;
    const cosLat = Math.cos(radLat);

    for (const city of TURKEY_CITIES) {
      // İl merkezi kontrolü
      const dLatCity = city.lat - lat;
      const dLonCity = (city.lon - lon) * cosLat;
      const distCitySq = dLatCity * dLatCity + dLonCity * dLonCity;

      if (distCitySq < minDistanceSq) {
        minDistanceSq = distCitySq;
        closest = {
          cityName: city.name,
          districtName: city.name,
          lat: city.lat,
          lon: city.lon
        };
      }

      // Tüm ilçeleri kontrol et
      if (city.districts && city.districts.length) {
        for (const district of city.districts) {
          const dLat = district.lat - lat;
          const dLon = (district.lon - lon) * cosLat;
          const distSq = dLat * dLat + dLon * dLon;

          if (distSq < minDistanceSq) {
            minDistanceSq = distSq;
            closest = {
              cityName: city.name,
              districtName: district.name,
              lat: district.lat,
              lon: district.lon
            };
          }
        }
      }
    }

    return closest;
  }

  async resolveLocationName(lat, lon) {
    // 1. Çevrimdışı ve anlık en yakın ilçe tespiti (TURKEY_CITIES veritabanından)
    const nearest = this.findNearestLocation(lat, lon);
    let fallbackName = "Konum";
    if (nearest) {
      if (nearest.districtName && nearest.districtName !== "Merkez" && nearest.districtName !== nearest.cityName) {
        fallbackName = `${nearest.cityName}/${nearest.districtName}`;
      } else {
        fallbackName = nearest.cityName;
      }
    }

    // 2. İnternet bağlantısı varsa daha detaylı ilçe tespiti için hızlı ters coğrafi kodlama dene
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=tr`, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        const district = data.locality || data.district || "";
        const city = data.principalSubdivision || data.city || "";
        if (city && district && district.toLowerCase() !== city.toLowerCase()) {
          return `${city}/${district}`;
        } else if (district) {
          return district;
        } else if (city) {
          return city;
        }
      }
    } catch (e) {
      // Çevrimdışı veya ağ hatasında yerleşik veritabanı (fallbackName) kullanılır
    }

    return fallbackName;
  }

  locateWithGPS() {
    const btn = document.getElementById("gpsLocateBtn");
    if (btn) btn.textContent = "İlçe ve konum tespit ediliyor...";

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          const locName = await this.resolveLocationName(lat, lon);
          this.selectLocation(locName, lat, lon);
          const districtDisplay = locName.includes("/") ? locName.split("/")[1] : locName;
          this.showToast(`Konumunuz tespit edildi: ${districtDisplay}`, "📍");
          if (btn) btn.textContent = "GPS ile Otomatik Bul";
        },
        (err) => {
          this.showToast("GPS konumu alınamadı. Lütfen listeden şehir seçiniz.", "⚠️");
          if (btn) btn.textContent = "GPS ile Otomatik Bul";
        },
        { enableHighAccuracy: false, timeout: 10000 }
      );
    } else {
      this.showToast("GPS desteği bulunamadı.", "⚠️");
      if (btn) btn.textContent = "GPS ile Otomatik Bul";
    }
  }

  openLocationModal() {
    const modal = document.getElementById("locationModal");
    if (modal) {
      modal.classList.remove("hidden");
      // Arama kutusunu temizle ve tam listeyi göster
      const searchInput = document.getElementById("citySearchInput");
      if (searchInput) {
        searchInput.value = "";
        setTimeout(() => searchInput.focus(), 300);
      }
      this.renderCitySelector();
    }
  }

  closeLocationModal() {
    document.getElementById("locationModal").classList.add("hidden");
  }

  openSettingsModal() {
    if (this.compass) {
      this.compass.stopCompass();
    }
    const modal = document.getElementById("settingsModal");
    if (modal) modal.classList.remove("hidden");
    const locDesc = document.getElementById("settingsLocationDesc");
    if (locDesc) {
      locDesc.textContent = (this.currentLocation && !this.currentLocation.isPlaceholder)
        ? this.currentLocation.name.replace("/", " / ")
        : "Konum Seçiniz";
    }
    const silentToggle = document.getElementById("autoSilentToggle");
    if (silentToggle) {
      silentToggle.checked = this.autoSilent;
    }
    this.updateSettingsLabels();
  }

  updateSettingsLabels() {
    const modeNames = { bip: "Sesli", sessiz: "Sessiz" };
    const set = (id, txt) => { const el = document.getElementById(id); if (el) el.textContent = txt; };
    const nOn = ["imsak", "gunes", "ogle", "ikindi", "aksam", "yatsi"].filter(k => this.isAlertOn(k)).length;
    set("settingsAlertsSummary", nOn === 0 ? "Kapalı" : `${nOn} vakit açık`);
    set("settingsNotifMode", modeNames[this.notifMode] || "Sesli");
    const tone = TamVaktiApp.TONES.find(t => t.id === this.alertTone) || TamVaktiApp.TONES[0];
    set("settingsSoundAction", tone.label);
    set("settingsSoundDesc", "Seçince kısa önizleme çalar");
    set("settingsCalcMethod", this.timeOffsetMin === 0 ? "Yok" : this.offsetLabel());
    this.applyCalcMethod();
    const mi = this.engine.methodInfo();
    set("settingsMethodValue", this.calcMethodPref === "auto" ? "Otomatik" : mi.short);
    set("settingsMethodDesc", this.calcMethodPref === "auto" ? `Konuma göre: ${mi.name}` : mi.name);
    const k = document.getElementById("kerahatToggle");
    if (k) k.checked = this.kerahatAlert;
    const fs = document.getElementById("fullScreenToggle");
    if (fs) fs.checked = this.fullScreenAlert;
    const fsRow = document.getElementById("fsTestRow");
    if (fsRow) fsRow.classList.toggle("hidden", !(window.AndroidBridge && window.AndroidBridge.testFullScreenAlert));
    this.refreshPermissionStatus();
  }

  closeSettingsModal() {
    const modal = document.getElementById("settingsModal");
    if (modal) modal.classList.add("hidden");

    const viewQibla = document.getElementById("viewQibla");
    const isQiblaActive = viewQibla && !viewQibla.classList.contains("hidden");
    const btnPrayer = document.getElementById("tabBtn-prayer");
    const btnQibla = document.getElementById("tabBtn-qibla");

    if (isQiblaActive) {
      if (btnQibla) btnQibla.classList.add("active");
      if (btnPrayer) btnPrayer.classList.remove("active");
      if (this.compass) {
        this.compass.resumeCompass();
      }
    } else {
      if (btnPrayer) btnPrayer.classList.add("active");
      if (btnQibla) btnQibla.classList.remove("active");
    }
  }

  sendTestNotification() {
    if (window.AndroidBridge && window.AndroidBridge.testAlert) {
      window.AndroidBridge.testAlert(
        "vakit",
        "Test: vakit girdi",
        (this.currentLocation && !this.currentLocation.isPlaceholder) ? this.shortPlaceName() : "Tam Vakti",
        this.notifMode
      );
      this.showToast("Test bildirimi gönderildi", "🔔", 2500);
      return;
    }
    this.playAlertTone();
    if (navigator.vibrate) navigator.vibrate(200);
    this.showToast("Test sesi çalındı (bildirimler yalnızca Android uygulamasında çalışır).", "🔔");
  }

  // Bildirim sesi: telefonun kendi kanal ayarı açılır, istediğiniz sesi seçersiniz
  // Vakit bildirim sesi seçimi (seçince kısa önizleme çalar); sistem ses ayarına da kısayol
  openToneModal() {
    const opts = TamVaktiApp.TONES.map(t => ({ value: t.id, label: t.label, desc: t.desc }))
      .concat([{ value: "__sys", label: "Telefon ses ayarları", desc: "Ses düzeyi, titreşim ve kanal ayarı" }]);
    this.openChoice("Bildirim sesi", "Bir sese dokununca seçilir ve kısa bir önizleme çalar. Vakit bildirimi “Sessiz” ise ses çalmaz.", opts, this.alertTone, (v) => {
      if (v === "__sys") return this.openSoundSettings();
      this.alertTone = v;
      localStorage.setItem("tamvakti_alert_tone", v);
      this.updateSettingsLabels();
      this.scheduleSync();
      const b = window.AndroidBridge;
      if (b && b.playTone) b.playTone(v);
      else this.playAlertTone();
      const t = TamVaktiApp.TONES.find(x => x.id === v);
      this.showToast(`Bildirim sesi: ${t ? t.label : v}`, "🔔", 2200);
    });
  }

  openSoundSettings() {
    if (window.AndroidBridge && window.AndroidBridge.openSoundSettings) {
      window.AndroidBridge.openSoundSettings();
    } else {
      this.showToast("Bu ayar yalnızca Android uygulamasında vardır.", "ℹ️");
    }
  }

  // ==========================================
  // İZİNLER (alarm, rahatsız etme, bildirim)
  // Sıradaki uyarı bilgisi, "Vakit uyarıları" satırının altında kısa gösterilir
  refreshAlarmInfo() {
    const el = document.getElementById("settingsAlertsDesc");
    if (!el) return;
    el.textContent = "Vaktinde ve vakitten önce, her vakit ayrı";
    if (!window.AndroidBridge || !window.AndroidBridge.getScheduleInfo) return;
    try {
      const i = JSON.parse(window.AndroidBridge.getScheduleInfo());
      if (i.nextT) {
        const hm = new Date(i.nextT).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
        const days = i.lastT ? Math.max(0, Math.floor((i.lastT - Date.now()) / 86400000)) : 0;
        el.textContent = `Sıradaki uyarı: ${hm}` + (days >= 1 ? ` • ${days} gün kurulu` : " • yakında bitiyor, uygulamayı açın");
      }
    } catch (e) {}
  }

  // İzinler bölümü: her izin için durum ve doğru ayar ekranına kısayol
  refreshPermissionStatus() {
    this.refreshAlarmInfo();
    const sec = document.getElementById("permSection");
    if (!sec) return;
    const p = this.getPermissionState();
    sec.classList.toggle("hidden", !p);
    if (!p) return;
    const chip = (id, ok, okTxt, badTxt) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.textContent = ok ? okTxt : badTxt;
      el.className = "text-[13px] font-semibold " + (ok ? "text-sky-300" : "text-amber-300");
    };
    // Bildirim izni var ama vakit bildirim kanalı sistem ayarından kapatılmış olabilir
    if (p.notif && p.chan === false) chip("permChipNotif", false, "Açık", "Kanal kapalı");
    else chip("permChipNotif", p.notif, "Açık", "Kapalı");
    // Uygulamayı arka planda öldüren üreticiler için ek ipucu satırı
    const oemRow = document.getElementById("permRowOem");
    if (oemRow) oemRow.hidden = !this.oemHint(p.mfr);
    chip("permChipExact", p.exact, "Açık", "Kapalı");
    chip("permChipDnd", p.dnd, "Açık", "Kapalı");
    chip("permChipBattery", p.battery, "Serbest", "Kısıtlı");
    const dndRow = document.getElementById("permRowDnd");
    if (dndRow) dndRow.classList.toggle("hidden", !this.autoSilent);
  }

  // Üreticiye özel adımlar (yalnızca arka planda uygulama öldürmesiyle bilinen markalarda gösterilir)
  oemInfo(mfr) {
    const m = String(mfr || "");
    if (/xiaomi|redmi|poco/.test(m)) return { name: "Xiaomi / Redmi / POCO", steps: [
      "“Otomatik başlat”: Ayarlar > Uygulamalar > İzinler > Otomatik başlat listesinde Tam Vakti'ni açın (düğme bu listeyi doğrudan açar; açılmazsa bu yolu elle izleyin).",
      "UYGULAMAYI KİLİTLEYİN (en önemlisi): Güvenlik > Hız artır > ⚙ > “Uygulamaları kilitle” listesinde Tam Vakti'ni açın (düğme Güvenlik uygulamasını açar, oradan bu yolu izleyin). Ya da son uygulamalar ekranında Tam Vakti kartına basılı tutup kilit simgesine dokunun.",
      "“İzin sayfası”: “Kilit ekranında göster” ve “Arka planda açılır pencere” anahtarlarını açın (tam ekran bildirim için).",
      "“Pil ayarı”: “Kısıtlama yok” seçin (Pil tasarrufu kapalı).",
      "“Bildirim kanalı”: Vakit bildirimlerinde “Kilit ekranında göster” ve “Yüzen bildirim” açık olsun."] };
    if (/samsung/.test(m)) return { name: "Samsung", steps: [
      "Son uygulamalar ekranında Tam Vakti simgesine dokunup “Açık tut”u seçin (cihazınızda varsa).",
      "Pil > Arka plan kullanım sınırları sayfasında “Kullanılmayan uygulamaları uyut”u kapatın.",
      "“Uyutulmayacak uygulamalar” listesine Tam Vakti'ni ekleyin.",
      "Uygulama bilgisi > Pil > “Sınırlandırılmamış” seçin."] };
    if (/huawei|honor/.test(m)) return { name: "Huawei / Honor", steps: [
      "Son görevler ekranında Tam Vakti kartını aşağı kaydırıp kilit simgesine dokunarak kilitleyin.",
      "Açılan listede Tam Vakti'ni bulun, “Otomatik yönet”i kapatın.",
      "Açılan pencerede “Otomatik başlat”, “İkincil başlatma” ve “Arka planda çalış” anahtarlarının üçünü de açın."] };
    if (/oppo|realme|oneplus/.test(m)) return { name: "Oppo / Realme / OnePlus", steps: [
      "Son uygulamalar ekranında Tam Vakti kartına basılı tutup (OnePlus'ta sağ üstteki) kilit simgesine dokunarak kilitleyin.",
      "Açılan listede Tam Vakti için “Otomatik başlat”ı açın.",
      "Uygulama bilgisi > Pil kullanımı > “Arka planda çalışmaya izin ver”i açın.",
      "İsteğe bağlı: son uygulamalar ekranında Tam Vakti kartını kilitleyin."] };
    if (/vivo|iqoo/.test(m)) return { name: "Vivo / iQOO", steps: [
      "Son uygulamalar ekranında Tam Vakti kartının menüsünden “Kilitle”yi seçin.",
      "Açılan listede Tam Vakti için arka planda başlatmaya izin verin (Otomatik başlat).",
      "Uygulama bilgisi > Pil > “Arka plan güç tüketimi”: “Kısıtlama yok” seçin."] };
    return null;
  }
  oemHint(mfr) { const i = this.oemInfo(mfr); return i ? i.name : ""; }

  // Markaya özel arka plan ayar rehberi: adımlar + doğrudan ayar sayfalarını açan düğmeler
  openOemGuide(mfr) {
    const b = window.AndroidBridge;
    const info = this.oemInfo(mfr);
    const steps = info ? info.steps.map((t, i) => `${i + 1}) ${t}`).join("\n") : "Uygulama bilgisinden arka plan kısıtlamasını kaldırın.";
    const xiaomi = /xiaomi|redmi|poco/.test(String(mfr));
    const opts = [];
    if (xiaomi) opts.push({ value: "auto", label: "1. Otomatik başlat", desc: "Uygulama listesinde Tam Vakti'ni açın" });
    if (xiaomi) opts.push({ value: "lock", label: "2. Uygulamayı kilitle", desc: "Güvenlik uygulaması: Hız artır > ⚙ > Uygulamaları kilitle" });
    opts.push({ value: "perm", label: xiaomi ? "3. İzin sayfası" : "Ayarları aç", desc: xiaomi ? "Kilit ekranında göster, arka planda açılır pencere" : "Otomatik başlatma / izin sayfası" });
    if (xiaomi) opts.push({ value: "batt", label: "4. Pil ayarı (Kısıtlama yok)", desc: "Xiaomi pil tasarrufu sayfası" });
    if (xiaomi) opts.push({ value: "chan", label: "5. Bildirim kanalı ayarı", desc: "Kilit ekranı ve yüzen bildirim" });
    opts.push({ value: "ign", label: "Pil muafiyeti isteği", desc: "Android'in pil optimizasyonu penceresi" });
    opts.push({ value: "app", label: "Uygulama bilgisi", desc: "Genel sistem sayfası (yedek yol)" });
    this.openChoice(info ? `${info.name}: arka planda çalışma` : "Arka planda çalışma", steps, opts, null, (v) => {
      if (!b) return;
      let ok = false;
      if (v === "chan") return void (b.openSoundSettings ? b.openSoundSettings() : (b.openAppNotificationSettings && b.openAppNotificationSettings()));
      if (v === "ign") return void (b.requestIgnoreBatteryOptimizations ? b.requestIgnoreBatteryOptimizations() : (b.openBatteryOptimizationSettings && b.openBatteryOptimizationSettings()));
      if (v === "perm") ok = !!(b.openOemSettings && b.openOemSettings(0));
      else if (v === "auto") ok = !!(b.openOemSettings && b.openOemSettings(2));
      else if (v === "lock") {
        ok = !!(b.openOemSettings && b.openOemSettings(3));
        if (ok) { this.showToast("Hız artır > ⚙ > Uygulamaları kilitle: Tam Vakti'ni açın", "🔒", 6000); return; }
        this.showToast("Güvenlik uygulaması açılamadı: Son uygulamalar ekranında Tam Vakti kartını kilitleyin", "🔒", 6000);
        return;
      }
      else if (v === "batt") ok = !!(b.openOemSettings && b.openOemSettings(1));
      if (v === "perm" || v === "batt" || v === "auto") {
        if (ok) return;
        this.showToast("Bu telefonda doğrudan açılamadı: Uygulama bilgisi açılıyor", "ℹ️", 3500);
        if (v === "batt" && b.openBatteryOptimizationSettings) return setTimeout(() => b.openBatteryOptimizationSettings(), 800);
      }
      setTimeout(() => b.openAppDetailsSettings && b.openAppDetailsSettings(), 800);
    });
  }

  // Alarmları baştan kur ve sonucu göster (uyarılar gelmiyorsa ilk deneme)
  async resyncAlarms() {
    if (!window.AndroidBridge || !window.AndroidBridge.syncSchedule) {
      return this.showToast("Alarmlar yalnızca Android uygulamasında kurulur.", "ℹ️");
    }
    this.showToast("Alarmlar yeniden kuruluyor…", "⏰", 1500);
    clearTimeout(this._syncTimer);
    await this.syncNativeSchedule();
    this.refreshAlarmInfo();
    try {
      const i = JSON.parse(window.AndroidBridge.getScheduleInfo());
      const days = i.lastT ? Math.max(0, Math.floor((i.lastT - Date.now()) / 86400000)) : 0;
      this.showToast(`${i.count} alarm kuruldu (${days} gün ilerisi)` + (i.exact ? "" : " • tam zamanlı izin kapalı"), "✓", 3500);
    } catch (e) {
      this.showToast("Alarmlar kuruldu", "✓", 2500);
    }
  }

  fixPermission(kind) {
    const b = window.AndroidBridge;
    const p = this.getPermissionState();
    if (!b || !p) return;
    if (kind === "notif") {
      if (p.notif && p.chan === false) {
        this.showToast("Vakit bildirimlerini açın (kanal kapalı)", "🔔", 3500);
        setTimeout(() => (b.openSoundSettings || b.openAppNotificationSettings) && (b.openSoundSettings ? b.openSoundSettings() : b.openAppNotificationSettings()), 700);
        return;
      }
      if (p.notif) return this.showToast("Bildirimler açık", "✓", 1800);
      b.openAppNotificationSettings && b.openAppNotificationSettings();
    } else if (kind === "oem") {
      this.openOemGuide(p.mfr);
    } else if (kind === "exact") {
      if (p.exact) return this.showToast("Tam zamanlı uyarı açık", "✓", 1800);
      this.showToast("“Alarmlar ve hatırlatıcılar” iznini açın", "⏰", 3000);
      setTimeout(() => b.openExactAlarmSettings && b.openExactAlarmSettings(), 700);
    } else if (kind === "dnd") {
      if (p.dnd) return this.showToast("Sessize alma erişimi açık", "✓", 1800);
      this.showToast("Listeden Tam Vakti'ni açın", "📵", 3000);
      setTimeout(() => b.openDndSettings && b.openDndSettings(), 700);
    } else if (kind === "battery") {
      if (p.battery) return this.showToast("Pil kısıtlaması yok", "✓", 1800);
      this.showToast("Tam Vakti için “Kısıtlama yok” seçin", "🔋", 3000);
      setTimeout(() => b.openBatteryOptimizationSettings && b.openBatteryOptimizationSettings(), 700);
    }
  }

  // ==========================================
  getPermissionState() {
    if (!window.AndroidBridge || !window.AndroidBridge.getPermissionState) return null;
    try { return JSON.parse(window.AndroidBridge.getPermissionState()); } catch (e) { return null; }
  }

  // ==========================================
  scheduleSync() {
    if (!window.AndroidBridge || !window.AndroidBridge.syncSchedule) return;
    clearTimeout(this._syncTimer);
    this._syncTimer = setTimeout(() => this.syncNativeSchedule(), 600);
  }

  async syncNativeSchedule() {
    if (!window.AndroidBridge || !window.AndroidBridge.syncSchedule) return;
    if (!this.currentLocation || this.currentLocation.isPlaceholder) return;
    this.applyCalcMethod();
    const seq = ++this._syncSeq;
    const { lat, lon } = this.currentLocation;
    const city = this.shortPlaceName();

    const DAYS = 30; // uygulama günlerce açılmasa da alarmlar sürsün (native taraf en yakın 120 olayı kurar, kendini yeniler)
    const monthCache = {};
    const prayers = [];
    const events = [];
    const mode = this.notifMode;
    const MIN = 60000;
    const start = new Date();

    for (let i = -1; i < DAYS; i++) { // -1: dünün vakitleri yalnız bildirimdeki ilerleme çubuğu (önceki vakit) için
      const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
      const y = d.getFullYear(), m = d.getMonth() + 1;
      const k = `${y}-${m}`;
      if (!monthCache[k]) {
        try {
          monthCache[k] = await this.engine.getMonthlyPrayerTimes(y, m, lat, lon);
        } catch (e) { monthCache[k] = null; }
      }
      if (seq !== this._syncSeq) return; // daha yeni bir senkronizasyon başladı
      const data = monthCache[k];
      const row = data && data.days ? data.days.find(x => x.day === d.getDate()) : null;
      if (!row) continue;

      const isFri = d.getDay() === 5;
      const at = {};
      PRAYER_LIST.forEach(p => {
        const str = this.shiftTime(row[p.key], this.timeOffsetMin);
        const dt = /^\d{1,2}:\d{2}$/.test(str || "") ? this.parseTimeToDate(str, d) : null;
        if (!dt) return;
        at[p.key] = { dt, str };
        const name = (p.key === "ogle" && isFri) ? "Cuma (Öğle)" : p.name;
        prayers.push({ key: p.key, name, time: str, t: dt.getTime() });
      });
      if (i < 0) continue; // dünün alarmı kurulmaz

      PRAYER_LIST.forEach(p => {
        const x = at[p.key];
        if (!x) return;
        const t = x.dt.getTime();
        const name = (p.key === "ogle" && isFri) ? "Cuma (Öğle)" : p.name;

        events.push({ t, type: "prayer" });

        const al = this.prayerAlerts[p.key];
        if (al && al.before > 0) {
          events.push({
            t: t - al.before * MIN, type: "reminder",
            title: `${name} vaktine ${al.before} dk kaldı`,
            body: `${city} • ${x.str}`,
            mode: mode === "sessiz" ? "sessiz" : "bip"
          });
        }
        if (al && al.at) {
          events.push({
            t, type: "vakit",
            title: `${name} vakti girdi`,
            body: `${city} • ${x.str}`,
            mode: mode,
            name: (p.key === "ogle" && isFri) ? "Cuma" : p.name,
            time: x.str,
            info: this.prayerInfoText(p.key, isFri)
          });
        }

        if (this.autoSilent && p.key !== "gunes") {
          const dur = (p.key === "ogle" && isFri) ? 60 : 30;
          events.push({ t, type: "silent_start" });
          events.push({ t: t + dur * MIN, type: "silent_end" });
        }
      });

      if (this.kerahatAlert) {
        if (at.gunes) {
          events.push({ t: at.gunes.dt.getTime(), type: "kerahat", title: "Kerahat vakti başladı", body: "Güneş doğdu; yaklaşık 45 dk nafile namaz kılınmaz." });
        }
        if (at.ogle) {
          events.push({ t: at.ogle.dt.getTime() - 45 * MIN, type: "kerahat", title: "Kerahat vakti (istiva)", body: "Öğle vaktine 45 dk kaldı." });
        }
        if (at.aksam) {
          events.push({ t: at.aksam.dt.getTime() - 45 * MIN, type: "kerahat", title: "Kerahat vakti", body: "Güneş batımına 45 dk kaldı; ikindi namazını kılmadıysanız acele edin." });
        }
      }
    }

    events.sort((a, b) => a.t - b.t);
    prayers.sort((a, b) => a.t - b.t);

    try {
      window.AndroidBridge.syncSchedule(JSON.stringify({
        city,
        ongoing: !!this.ongoingNotifEnabled,
        fullscreen: !!this.fullScreenAlert,
        tone: this.alertTone,
        prayers,
        events: events.slice(0, 1500)
      }));
    } catch (e) {
      console.warn("Alarm senkronizasyonu başarısız:", e);
    }
  }

  // Vakit bildirimi türü: telefonun bildirim sesi veya sessiz (sadece yazı)
  // ==========================================
  // SEÇİM PENCERESİ (alttan açılır, ayarlar için ortak)
  // ==========================================
  openChoice(title, note, options, current, onPick) {
    this._choiceOptions = options;
    this._choiceOnPick = onPick;
    const set = (id, txt) => { const el = document.getElementById(id); if (el) el.textContent = txt; };
    set("choiceTitle", title);
    set("choiceNote", note || "");
    const list = document.getElementById("choiceList");
    if (!list) return;
    list.innerHTML = options.map((o, i) => {
      const on = current !== null && String(o.value) === String(current);
      return `
        <div class="flex items-center gap-2">
          <button onclick="app.pickChoice(${i})" class="flex-1 min-w-0 flex items-center gap-3 px-3 py-3 rounded-2xl text-left border ${on ? "bg-sky-400/15 border-sky-400/40" : "bg-slate-800/40 border-transparent"}">
            ${current === null ? "" : `<span class="w-4 h-4 rounded-full border-2 shrink-0 ${on ? "border-sky-400 bg-sky-400" : "border-slate-500"}"></span>`}
            <span class="min-w-0">
              <span class="block text-[14px] font-semibold text-slate-100">${o.label}</span>
              ${o.desc ? `<span class="block text-[12px] text-slate-400">${o.desc}</span>` : ""}
            </span>
          </button>
        </div>`;
    }).join("");
    const sheet = document.getElementById("choiceSheet");
    if (sheet) sheet.classList.remove("hidden");
  }

  pickChoice(i) {
    const o = this._choiceOptions && this._choiceOptions[i];
    const cb = this._choiceOnPick;
    this.closeChoice();
    if (o && cb) cb(o.value);
  }

  closeChoice() {
    const sheet = document.getElementById("choiceSheet");
    if (sheet) sheet.classList.add("hidden");
  }

  openPrayerModesModal() {
    this.openChoice("Vakit bildirimi", "Vakit girince ne olsun?", [
      { value: "bip", label: "Sesli bildirim", desc: "Sesi Bildirim sesi satırından seçebilirsiniz" },
      { value: "sessiz", label: "Sessiz", desc: "Yalnızca bildirim yazısı gösterilir" }
    ], this.notifMode, (v) => {
      this.notifMode = v;
      localStorage.setItem("tamvakti_notif_mode", v);
      this.updateSettingsLabels();
      this.scheduleSync();
    });
  }

  // Hesaplama yöntemi seçimi: otomatik (konuma göre) ya da elle
  openCalcMethodModal() {
    const loc = this.currentLocation;
    const auto = (loc && loc.lat != null) ? CALC_METHODS[this.engine.methodForLocation(loc.lat, loc.lon)] : CALC_METHODS.diyanet;
    // Her yöntemin bugünkü yaklaşık İmsak / Yatsı saati: farkı seçmeden görebilmek için
    const prev = (k) => {
      try {
        if (!loc || loc.lat == null) return "";
        const t = this.engine.previewTimes(k, new Date(), loc.lat, loc.lon);
        return `İmsak ${t.imsak} • Yatsı ${t.yatsi}`;
      } catch (e) { return ""; }
    };
    const opts = [{ value: "auto", label: "Otomatik (önerilen)", desc: `Konumunuza göre: ${auto.name}` }]
      .concat(Object.keys(CALC_METHODS).map(k => ({ value: k, label: CALC_METHODS[k].name, desc: `${CALC_METHODS[k].region}${prev(k) ? " • " + prev(k) : ""}` })));
    this.openChoice("Hesaplama yöntemi", "Vakitler seçilen yönteme göre hesaplanır. Türkiye'de Diyanet kullanılır.", opts, this.calcMethodPref, (v) => {
      this.calcMethodPref = String(v);
      localStorage.setItem("tamvakti_calc_method", this.calcMethodPref);
      this.applyCalcMethod();
      this.updateSettingsLabels();
      this.updatePrayers();
      this.scheduleSync();
      const monthly = document.getElementById("monthlyModal");
      if (monthly && !monthly.classList.contains("hidden")) this.loadMonthlyData(false);
      this.showToast(`Yöntem: ${this.engine.methodInfo().short}`, "🧮", 2200);
    });
  }

  openIhtiyatModal() {
    const opts = [-3, -2, -1, 0, 1, 2, 3, 5].map(m => ({
      value: m,
      label: m === 0 ? "Yok (hesaplanan vakit aynen)" : `${m > 0 ? "+" : "−"}${Math.abs(m)} dk`
    }));
    this.openChoice("İhtiyat", "Seçilen dakika tüm vakitlere eklenir.", opts, this.timeOffsetMin, (v) => {
      this.timeOffsetMin = Number(v);
      localStorage.setItem("tamvakti_time_offset", String(this.timeOffsetMin));
      this.updateSettingsLabels();
      this.updatePrayers();
      const monthly = document.getElementById("monthlyModal");
      if (monthly && !monthly.classList.contains("hidden")) this.loadMonthlyData(false);
    });
  }

  // Tam ekran bildirim: yalnızca Android uygulamasında; Android 14+ için ayrı izin gerekir
  toggleFullScreenAlert(checked) {
    const b = window.AndroidBridge;
    if (!b || !b.testFullScreenAlert) {
      this.fullScreenAlert = false;
      const cb = document.getElementById("fullScreenToggle");
      if (cb) cb.checked = false;
      this.showToast("Tam ekran bildirim yalnızca Android uygulamasında vardır.", "ℹ️");
      return;
    }
    this.fullScreenAlert = !!checked;
    localStorage.setItem("tamvakti_fullscreen_alert", this.fullScreenAlert ? "true" : "false");
    if (this.fullScreenAlert && !this.hasFullScreenPermission()) {
      this.askFullScreenPermission();
    } else {
      this.showToast(this.fullScreenAlert ? "Vakit girince tam ekran bildirim gelecek" : "Tam ekran bildirim kapatıldı", "🔔", 2500);
    }
    this.scheduleSync();
  }

  // Telefon açıkken tam ekran için "diğer uygulamaların üzerinde göster" izni gerekir;
  // yoksa yalnızca ekran kapalı/kilitliyken tam ekran (Android 14+'ta ayrı izinle) çalışır.
  hasFullScreenPermission() {
    const b = window.AndroidBridge;
    if (!b) return false;
    if (b.canDrawOverlays && b.canDrawOverlays()) return true;
    return false;
  }

  askFullScreenPermission() {
    const b = window.AndroidBridge;
    this.showToast("Açılan sayfada \"Diğer uygulamaların üzerinde göster\" iznini verin", "🔔", 4500);
    if (b && b.openOverlaySettings) setTimeout(() => b.openOverlaySettings(), 700);
  }

  testFullScreenAlert() {
    const b = window.AndroidBridge;
    if (!b || !b.testFullScreenAlert) return;
    if (!this.hasFullScreenPermission()) {
      this.askFullScreenPermission();
      return;
    }
    b.testFullScreenAlert(10);
    this.showToast("10 sn sonra tam ekran gelecek (başka uygulamada ya da kilitliyken deneyebilirsiniz)", "🔔", 4500);
  }

  // Giren vakte ait kısa bilgi (tam ekran bildirimde gösterilir; Hanefi/Diyanet rekât düzeni)
  prayerInfoText(key, isFri) {
    const t = {
      imsak: "Sabah namazı: 2 rekât sünnet, 2 rekât farz.",
      gunes: "Sabah vakti çıktı. Güneşin doğuşundan itibaren yaklaşık 45 dk kerahat vaktidir; nafile namaz kılınmaz.",
      ogle: "Öğle namazı: 4 rekât ilk sünnet, 4 rekât farz, 2 rekât son sünnet.",
      ikindi: "İkindi namazı: 4 rekât sünnet, 4 rekât farz.",
      aksam: "Akşam namazı: 3 rekât farz, 2 rekât sünnet.",
      yatsi: "Yatsı namazı: 4 rekât ilk sünnet, 4 rekât farz, 2 rekât son sünnet, 3 rekât vitir."
    };
    if (key === "ogle" && isFri) return "Cuma namazı: 4 rekât ilk sünnet, 2 rekât farz, 4 rekât son sünnet, 2 rekât sünnet.";
    return t[key] || "";
  }

  toggleKerahatAlert(checked) {
    this.kerahatAlert = !!checked;
    localStorage.setItem("tamvakti_kerahat_alert", this.kerahatAlert ? "true" : "false");
    this.showToast(this.kerahatAlert ? "Kerahat vakitlerinde bildirim gelecek" : "Kerahat bildirimi kapatıldı", "⚠️", 2500);
    this.scheduleSync();
  }

  toggleAutoSilent(checked) {
    this.autoSilent = !!checked;
    localStorage.setItem("tamvakti_auto_silent", this.autoSilent ? "true" : "false");
    if (this.autoSilent) {
      const perm = this.getPermissionState();
      this.refreshPermissionStatus();
      if (window.AndroidBridge && perm && !perm.dnd) {
        this.showToast("Bunun için 'Rahatsız Etme' erişimi gerekli. Açılan ekranda Tam Vakti'ni etkinleştirin.", "📵", 4500);
        setTimeout(() => window.AndroidBridge.openDndSettings && window.AndroidBridge.openDndSettings(), 1200);
      } else {
        this.showToast("Namaz esnasında telefon otomatik titreşime alınacak.", "📵", 3000);
      }
    } else {
      this.showToast("Otomatik sessize alma kapatıldı.", "🔔", 2500);
    }
    ["autoSilentToggle", "onboardingSilentToggle"].forEach(id => {
      const cb = document.getElementById(id);
      if (cb) cb.checked = this.autoSilent;
    });
    this.scheduleSync();
  }

  // Gizlilik politikası: Android'de dış tarayıcıda, web'de yeni sekmede açılır
  openPrivacy() {
    if (window.AndroidBridge && window.AndroidBridge.openUrl) {
      window.AndroidBridge.openUrl(POLICY_URL);
    } else {
      window.open(POLICY_URL, "_blank");
    }
  }

  openAboutModal() {
    const row = document.getElementById("updateCheckRow");
    if (row) row.classList.toggle("hidden", !this.canSelfUpdate);
    this.renderUpdateCard();
    document.getElementById("aboutModal").classList.remove("hidden");
  }

  closeAboutModal() {
    document.getElementById("aboutModal").classList.add("hidden");
  }

  // Semver / sürüm karşılaştırma (örn: v1.00.05 > v1.00.04 ise 1 döner)
  compareVersions(v1, v2) {
    const parse = (v) => (v || "").replace(/^v/, "").split(".").map(Number);
    const p1 = parse(v1);
    const p2 = parse(v2);
    for (let i = 0; i < Math.max(p1.length, p2.length); i++) {
      const n1 = p1[i] || 0;
      const n2 = p2[i] || 0;
      if (n1 > n2) return 1;
      if (n1 < n2) return -1;
    }
    return 0;
  }

  showToast(msg, icon = "✓", duration = 3000) {
    const toast = document.getElementById("appToast");
    const msgEl = document.getElementById("toastMsg");
    const iconEl = document.getElementById("toastIcon");
    if (!toast || !msgEl) return;

    msgEl.textContent = msg;
    if (iconEl) iconEl.textContent = icon;

    toast.classList.add("toast-visible");

    if (this._toastTimeout) clearTimeout(this._toastTimeout);
    this._toastTimeout = setTimeout(() => {
      toast.classList.remove("toast-visible");
    }, duration);
  }

  formatChangelog(rawText) {
    if (!rawText) return "<div class='text-slate-300 py-1'>Yeni özellikler ve performans iyileştirmeleri.</div>";

    const lines = rawText.split("\n");
    const bulletItems = [];

    for (let line of lines) {
      let trimmed = line.trim();
      if (!trimmed) continue;
      if (trimmed.startsWith("#") || trimmed.startsWith("- **Sürüm:**") || trimmed.startsWith("- **Paket Adı:**")) {
        continue;
      }
      // Otomatik "Full Changelog" bağlantı satırı ve dosya adı satırları gösterilmez
      if (/^\**Full Changelog/i.test(trimmed) || trimmed.includes(".apk")) {
        continue;
      }
      if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        let content = trimmed.substring(2).trim();
        content = content.replace(/\*\*(.*?)\*\*/g, "<strong class='text-white font-bold'>$1</strong>");
        bulletItems.push(content);
      } else if (trimmed.length > 5 && !trimmed.startsWith("```")) {
        let content = trimmed.replace(/\*\*(.*?)\*\*/g, "<strong class='text-white font-bold'>$1</strong>");
        bulletItems.push(content);
      }
    }

    if (bulletItems.length === 0) {
      return "<div class='text-slate-300 py-1'>Hata düzeltmeleri ve iyileştirmeler.</div>";
    }

    return bulletItems.map(item => `
      <div class="flex items-start gap-2 py-1.5 border-b border-white/5 last:border-0">
        <span class="text-sky-400 text-sm leading-none mt-0.5">•</span>
        <div class="text-[12px] text-slate-100 leading-snug">${item}</div>
      </div>
    `).join("");
  }

  openUpdateFoundModal() {
    if (!this.updateInfo) return;
    const modal = document.getElementById("updateFoundModal");
    const tagEl = document.getElementById("updateModalNewTag");
    const notesEl = document.getElementById("updateModalChangelog");
    const progressArea = document.getElementById("modalUpdateProgressArea");
    const btn = document.getElementById("modalBtnStartUpdate");

    if (tagEl) tagEl.textContent = this.updateInfo.version;
    if (notesEl) notesEl.innerHTML = this.formatChangelog(this.updateInfo.body);
    if (progressArea) progressArea.classList.add("hidden");
    if (btn) {
      btn.classList.remove("opacity-50", "pointer-events-none");
      btn.innerHTML = DOWNLOAD_BTN_HTML;
    }

    if (modal) {
      modal.classList.remove("hidden");
    }
  }

  // "Sonra" / kapat: aynı sürüm için 24 saat boyunca pencere tekrar açılmaz (rozet kalır)
  closeUpdateFoundModal() {
    const modal = document.getElementById("updateFoundModal");
    if (modal) modal.classList.add("hidden");
    if (this.updateInfo && !this.isDownloadingUpdate) {
      try {
        localStorage.setItem("tamvakti_update_dismissed", JSON.stringify({ version: this.updateInfo.version, ts: Date.now() }));
      } catch (e) {}
    }
  }

  // Bu sürüm için pencere gösterilmeli mi? (daha yeni sürüm çıktıysa ya da 24 saat dolduysa evet)
  shouldShowUpdatePrompt() {
    if (!this.updateInfo) return false;
    try {
      const d = JSON.parse(localStorage.getItem("tamvakti_update_dismissed"));
      if (d && d.version === this.updateInfo.version && Date.now() - d.ts < 24 * 60 * 60 * 1000) return false;
    } catch (e) {}
    const ob = document.getElementById("onboardingModal");
    if (ob && !ob.classList.contains("hidden")) return false; // kurulum sırasında rahatsız etme
    return true;
  }

  // Rozet nokta + Ayarlar'daki "Yeni sürüm" işareti (güncelleme yapılana kadar görünür)
  renderUpdateIndicators() {
    const dot = document.getElementById("updateBadgeDot");
    const statusEl = document.getElementById("updateCheckStatus");
    const aboutDesc = document.getElementById("settingsAboutDesc");
    const has = !!this.updateInfo;
    if (dot) dot.classList.toggle("hidden", !has);
    if (statusEl && has) statusEl.textContent = `Yeni sürüm ${this.updateInfo.version}`;
    if (aboutDesc) {
      aboutDesc.textContent = has ? `Yeni sürüm ${this.updateInfo.version}` : "Sürüm, güncelleme, lisanslar";
      aboutDesc.classList.toggle("text-sky-300", has);
      aboutDesc.classList.toggle("font-semibold", has);
      aboutDesc.classList.toggle("text-slate-400", !has);
    }
    this.renderUpdateCard();
  }

  // Son bulunan sürümü sakla: internet yokken de rozet görünsün
  loadCachedUpdate() {
    if (!this.canSelfUpdate) return;
    try {
      const c = JSON.parse(localStorage.getItem("tamvakti_update_info"));
      if (c && c.version && this.compareVersions(c.version, this.currentVersion) > 0) {
        this.updateInfo = c;
        this.renderUpdateIndicators();
      } else if (c) {
        localStorage.removeItem("tamvakti_update_info");
      }
    } catch (e) {}
  }

  startUpdateDownloadFromModal() {
    const progressArea = document.getElementById("modalUpdateProgressArea");
    const btn = document.getElementById("modalBtnStartUpdate");
    if (progressArea) progressArea.classList.remove("hidden");
    if (btn) {
      btn.classList.add("opacity-50", "pointer-events-none");
      btn.innerHTML = `<span>İndiriliyor…</span>`;
    }
    this.startUpdateDownload();
  }

  async checkForUpdates(silent = true) {
    if (!this.canSelfUpdate) return;
    const statusEl = document.getElementById("updateCheckStatus");

    if (!silent && statusEl) {
      statusEl.textContent = "Denetleniyor...";
    }

    try {
      const res = await fetch("https://api.github.com/repos/lyldz/tam-vakti/releases/latest", {
        headers: { "Accept": "application/vnd.github.v3+json" }
      });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const data = await res.json();
      const latestTag = data.tag_name || "";

      // APK assetini bul
      let apkUrl = data.html_url;
      if (data.assets && data.assets.length > 0) {
        const apkAsset = data.assets.find(a => a.name.endsWith(".apk") && !a.name.includes("-v1.00.01")) || data.assets.find(a => a.name.endsWith(".apk"));
        if (apkAsset) {
          apkUrl = apkAsset.browser_download_url;
        }
      }

      if (this.compareVersions(latestTag, this.currentVersion) > 0) {
        // Yeni sürüm bulundu!
        this.updateInfo = {
          version: latestTag,
          name: data.name || latestTag,
          body: data.body || "Yeni sürüm yayınlandı.",
          downloadUrl: apkUrl
        };

        try { localStorage.setItem("tamvakti_update_info", JSON.stringify(this.updateInfo)); } catch (e) {}
        this.renderUpdateIndicators();

        // Elle denetimde her zaman, sessiz denetimde "Sonra" süresi dolduysa pencere açılır
        if (!silent || this.shouldShowUpdatePrompt()) this.openUpdateFoundModal();
      } else {
        // Güncel
        this.updateInfo = null;
        try {
          localStorage.removeItem("tamvakti_update_info");
          localStorage.removeItem("tamvakti_update_dismissed");
        } catch (e) {}
        this.renderUpdateIndicators();
        if (statusEl) statusEl.textContent = "✓ Sürüm güncel";

        if (!silent) {
          this.showToast("Uygulamanız zaten en güncel sürümde (" + this.currentVersion + ").", "✓");
        }
      }
    } catch (e) {
      // İnternet yoksa / hata varsa sessizce geç (bilinen güncelleme rozeti kalır)
      if (!silent) {
        if (this.updateInfo) this.renderUpdateIndicators();
        else if (statusEl) statusEl.textContent = "Denetlenemedi";
        this.showToast("Güncelleme kontrolü yapılamadı. İnternet bağlantınızı kontrol ediniz.", "⚠️");
      }
    }
  }

  renderUpdateCard() {
    const card = document.getElementById("updateNoticeCard");
    if (!card) return;

    if (this.updateInfo) {
      card.classList.remove("hidden");
      const tagEl = document.getElementById("updateNewVersionTag");
      const notesEl = document.getElementById("updateReleaseNotes");
      if (tagEl) tagEl.textContent = this.updateInfo.version;
      if (notesEl) {
        const firstLine = this.updateInfo.body
          .split("\n")
          .map(l => l.trim())
          .filter(l => l && !l.startsWith("#"))[0] || "Yeni özellikler ve iyileştirmeler eklendi.";
        notesEl.textContent = firstLine;
      }
    } else {
      card.classList.add("hidden");
    }
  }

  startUpdateDownload() {
    if (!this.canSelfUpdate) return;
    if (!this.updateInfo || !this.updateInfo.downloadUrl) return;
    if (this.isDownloadingUpdate) return;

    this.isDownloadingUpdate = true;
    const progressArea = document.getElementById("updateProgressArea");
    const btn = document.getElementById("btnStartUpdate");
    if (progressArea) progressArea.classList.remove("hidden");
    if (btn) {
      btn.classList.add("opacity-50", "pointer-events-none");
      btn.innerHTML = `<span>İndiriliyor…</span>`;
    }

    if (window.AndroidBridge && window.AndroidBridge.downloadAndInstallApk) {
      window.AndroidBridge.downloadAndInstallApk(this.updateInfo.downloadUrl);
    } else {
      window.open(this.updateInfo.downloadUrl, "_blank");
      this.isDownloadingUpdate = false;
      if (btn) {
        btn.classList.remove("opacity-50", "pointer-events-none");
        btn.innerHTML = `<span>İndir</span>`;
      }
    }
  }

  onUpdateDownloadProgress(percent, statusText) {
    const bar = document.getElementById("updateProgressBar");
    const status = document.getElementById("updateProgressStatus");
    const btn = document.getElementById("btnStartUpdate");

    const modalBar = document.getElementById("modalUpdateProgressBar");
    const modalStatus = document.getElementById("modalUpdateProgressStatus");
    const modalBtn = document.getElementById("modalBtnStartUpdate");

    const txt = statusText || `İndiriliyor... %${percent}`;
    if (bar) bar.style.width = `${percent}%`;
    if (status) status.textContent = txt;
    if (modalBar) modalBar.style.width = `${percent}%`;
    if (modalStatus) modalStatus.textContent = txt;

    if (percent >= 100) {
      const finishText = `<span>📦</span><span>Paket Yükleyici Başlatılıyor...</span>`;
      if (btn) btn.innerHTML = finishText;
      if (modalBtn) modalBtn.innerHTML = finishText;
    }
  }

  onUpdateDownloadError(errorMsg) {
    this.isDownloadingUpdate = false;
    const progressArea = document.getElementById("updateProgressArea");
    const btn = document.getElementById("btnStartUpdate");
    const modalProgressArea = document.getElementById("modalUpdateProgressArea");
    const modalBtn = document.getElementById("modalBtnStartUpdate");

    if (progressArea) progressArea.classList.add("hidden");
    if (modalProgressArea) modalProgressArea.classList.add("hidden");

    if (btn) {
      btn.classList.remove("opacity-50", "pointer-events-none");
      btn.innerHTML = `<span>🔄</span><span>Tekrar Dene</span>`;
    }
    if (modalBtn) {
      modalBtn.classList.remove("opacity-50", "pointer-events-none");
      modalBtn.innerHTML = DOWNLOAD_BTN_HTML;
    }

    this.showToast("İndirme sırasında hata oluştu: " + errorMsg, "⚠️", 4000);
  }


  // ==========================================
  // BAŞLANGIÇ & KURULUM SİHİRBAZI (ONBOARDING)
  // ==========================================
  // Kurulum adımları (docs/KURULUM.md). Liste sihirbaz açılırken bir kez çıkarılır;
  // izin bu Android sürümünde gerekmiyorsa ya da zaten verilmişse adım gösterilmez.
  onboardingSteps() {
    const p = this.getPermissionState();
    const steps = ["welcome", "location"];
    if (p) {
      const sdk = p.sdk || 0;
      if (sdk >= 33 && !p.notif) steps.push("notif");
      if (sdk >= 31 && !p.exact) steps.push("exact");
      if (sdk >= 23 && !p.battery) steps.push("battery");
      if (!p.dnd) steps.push("dnd");
    }
    steps.push("prefs", "done");
    return steps;
  }

  isOnboardingOpen() {
    const m = document.getElementById("onboardingModal");
    return !!m && !m.classList.contains("hidden");
  }

  hasChosenLocation() {
    return !!localStorage.getItem("tamvakti_active_location") && !!this.currentLocation && !this.currentLocation.isPlaceholder;
  }

  // step: 1 tabanlı sıra numarası ya da adım anahtarı ("location" gibi)
  openOnboarding(step = 1) {
    const modal = document.getElementById("onboardingModal");
    if (!modal) return;
    this._obSteps = this.onboardingSteps();
    this._obDenied = { notif: false, loc: false };
    this._obVisited = {};
    this._obAwaiting = null;

    // Noktalar adım listesine göre üretilir
    const dots = document.getElementById("onboardingDotsBar");
    if (dots) {
      dots.innerHTML = "";
      this._obSteps.forEach((key, i) => {
        const b = document.createElement("button");
        b.className = "onboarding-dot";
        b.title = `Adım ${i + 1}`;
        b.onclick = () => this.goToOnboardingStep(i + 1);
        dots.appendChild(b);
      });
    }

    // Tercih anahtarlarını mevcut ayarlarla eşitle
    const sync = (id, val) => { const cb = document.getElementById(id); if (cb) cb.checked = !!val; };
    sync("onboardingOngoingToggle", this.ongoingNotifEnabled);
    sync("onboardingKerahatToggle", this.kerahatAlert);
    sync("onboardingSilentToggle", this.autoSilent);
    const tk = document.getElementById("obTemkinValue");
    if (tk) tk.textContent = this.timeOffsetMin ? `${this.timeOffsetMin > 0 ? "+" : ""}${this.timeOffsetMin} dk` : "Kapalı (0 dk)";

    modal.classList.remove("hidden");
    document.body.classList.add("overflow-hidden");
    document.body.classList.add("onboarding-active");

    // Kurulum esnasında alt sekmeler / dock tamamen gizlenir
    const dock = document.getElementById("mainBottomDock") || document.querySelector(".minimal-dock");
    if (dock) {
      dock.classList.add("hidden");
      dock.style.setProperty("display", "none", "important");
    }

    this.goToOnboardingStep(step);
  }

  // Ayarlar › Kurulumu yeniden başlat (tercihler silinmez)
  restartOnboarding() {
    this.closeSettingsModal();
    this.openOnboarding(1);
  }

  closeOnboarding(savePreference = true) {
    if (savePreference) {
      localStorage.setItem("tamvakti_onboarding_completed", "true");
      localStorage.setItem("tamvakti_onboarding_version", String(TamVaktiApp.ONBOARDING_VERSION));
    }
    const modal = document.getElementById("onboardingModal");
    if (modal) modal.classList.add("hidden");
    document.body.classList.remove("overflow-hidden");
    document.body.classList.remove("onboarding-active");
    this._obAwaiting = null;

    // Kurulum bittiğinde veya atlandığında alt sekmeleri geri aç
    const dock = document.getElementById("mainBottomDock") || document.querySelector(".minimal-dock");
    if (dock) {
      dock.classList.remove("hidden");
      dock.style.removeProperty("display");
    }
    this.refreshPermissionStatus();
  }

  // "Atla": konum yoksa konum adımına götürür, varsa kurulumu kapatır
  skipOnboarding() {
    if (!this.hasChosenLocation()) {
      this.showToast("Önce konumunuzu seçin; vakitler buna göre hesaplanır.", "📍", 3000);
      this.goToOnboardingStep("location");
      return;
    }
    this.scheduleSync();
    this.closeOnboarding(true);
  }

  updateOnboardingLocationDisplay() {
    const cEl = document.getElementById("onboardingCurrentCity");
    const badge = document.getElementById("onboardingLocationBadge");
    const contBtn = document.getElementById("onboardingStep2ContinueBtn");
    const chosen = this.hasChosenLocation();
    if (contBtn) contBtn.classList.toggle("hidden", !chosen);
    if (badge) badge.classList.toggle("opacity-50", !chosen);
    if (cEl) cEl.textContent = chosen ? this.shortPlaceName() : "Henüz seçilmedi";
    const denied = document.getElementById("obLocDenied");
    if (denied) denied.classList.toggle("hidden", !(this._obDenied && this._obDenied.loc) || chosen);
  }

  currentOnboardingKey() {
    return this._obSteps ? this._obSteps[this.onboardingStep - 1] : null;
  }

  goToOnboardingStep(step) {
    if (!this._obSteps) this._obSteps = this.onboardingSteps();
    const steps = this._obSteps;
    let idx = typeof step === "string" ? steps.indexOf(step) + 1 : step;
    if (!idx) idx = 1;
    idx = Math.max(1, Math.min(steps.length, idx));

    // Konum seçilmeden konum adımının ötesine geçilmez
    const locIdx = steps.indexOf("location") + 1;
    if (idx > locIdx && !this.hasChosenLocation()) {
      if (this.onboardingStep === locIdx) this.showToast("Önce konumunuzu seçin.", "📍", 2200);
      idx = locIdx;
    }

    this.onboardingStep = idx;
    this._obAwaiting = null;
    const key = steps[idx - 1];

    document.querySelectorAll("#onboardingModal .onboarding-step-pane").forEach(el => {
      el.classList.toggle("hidden", el.id !== `onboardingStep-${key}`);
    });
    document.querySelectorAll("#onboardingActionArea > [id^='onboardingBtnGroup-']").forEach(el => {
      el.classList.toggle("hidden", el.id !== `onboardingBtnGroup-${key}`);
    });

    const backBtn = document.getElementById("onboardingBackBtn");
    if (backBtn) backBtn.classList.toggle("invisible", idx <= 1);

    const dots = document.querySelectorAll("#onboardingDotsBar .onboarding-dot");
    dots.forEach((dot, i) => dot.classList.toggle("active", i + 1 === idx));

    this.updateOnboardingLocationDisplay();
    this.refreshOnboardingPermissions();
  }

  nextOnboardingStep() {
    this.goToOnboardingStep(this.onboardingStep + 1);
  }

  prevOnboardingStep() {
    if (this.onboardingStep > 1) {
      this.goToOnboardingStep(this.onboardingStep - 1);
    }
  }

  // Yalnızca hâlâ o adımdaysak ilerle (çift tetiklemeye karşı)
  advanceOnboardingFrom(key, delay = 500) {
    setTimeout(() => {
      if (this.isOnboardingOpen() && this.currentOnboardingKey() === key) this.nextOnboardingStep();
    }, delay);
  }

  // İzin durumu: ok (Verildi) / bad (Reddedildi) / go (Ayarlara git) / wait (Bekliyor)
  onboardingPermStatus(kind, p) {
    if (!p) return "wait";
    if (kind === "notif") return p.notif ? "ok" : (this._obDenied.notif ? "bad" : "wait");
    if (kind === "exact") return p.exact ? "ok" : (this._obVisited.exact ? "bad" : "go");
    if (kind === "battery") return p.battery ? "ok" : (this._obVisited.battery ? "bad" : "wait");
    if (kind === "dnd") return p.dnd ? "ok" : (this._obVisited.dnd ? "bad" : "go");
    return "wait";
  }

  refreshOnboardingPermissions() {
    if (!this._obSteps) return;
    const p = this.getPermissionState();
    const labels = { ok: "Verildi", bad: "Reddedildi", go: "Ayarlara git", wait: "Bekliyor" };
    const actions = {
      notif: { ok: "Devam", wait: "Bildirimlere izin ver", go: "Ayarlara git", bad: "Ayarlara git" },
      exact: { ok: "Devam", wait: "Ayarlara git", go: "Ayarlara git", bad: "Tekrar dene" },
      battery: { ok: "Devam", wait: "İzin ver", go: "Ayarlara git", bad: "Tekrar dene" },
      dnd: { ok: "Devam", wait: "Ayarlara git", go: "Ayarlara git", bad: "Tekrar dene" }
    };
    ["notif", "exact", "battery", "dnd"].forEach(kind => {
      const st = this.onboardingPermStatus(kind, p);
      const badge = document.getElementById(`obBadge-${kind}`);
      if (badge) {
        badge.textContent = labels[st];
        badge.className = `ob-badge ${st}`;
        badge.onclick = st === "go" || st === "bad" ? () => this.obRequest(kind) : null;
      }
      const lbl = document.getElementById(`obBtnLabel-${kind}`);
      if (lbl) lbl.textContent = actions[kind][st];
    });

    // Sessize alma kapalıysa izin gerekmez
    const dndRow = document.getElementById("obDndStatusRow");
    if (dndRow) dndRow.classList.toggle("invisible", !this.autoSilent);
    if (!this.autoSilent) {
      const l = document.getElementById("obBtnLabel-dnd");
      if (l) l.textContent = "Devam";
    }

    const note = document.getElementById("obOngoingNote");
    if (note) note.classList.toggle("hidden", !(p && !p.notif && this.ongoingNotifEnabled));

    if (this.currentOnboardingKey() === "done") this.renderOnboardingSummary(p);
  }

  renderOnboardingSummary(p) {
    const box = document.getElementById("obSummary");
    if (!box) return;
    const rows = [["📍 Konum", this.hasChosenLocation() ? this.shortPlaceName() : "Seçilmedi", this.hasChosenLocation() ? "ok" : "bad"]];
    let missing = false;
    if (p) {
      const add = (label, ok) => { rows.push([label, ok ? "Verildi" : "Kapalı", ok ? "ok" : "bad"]); if (!ok) missing = true; };
      add("🔔 Bildirimler", p.notif);
      add("⏰ Tam zamanında uyarı", p.exact);
      add("🔋 Pil kısıtlaması yok", p.battery);
      if (this.autoSilent) add("📵 Sessize alma erişimi", p.dnd);
    }
    box.innerHTML = "";
    rows.forEach(([label, val, st]) => {
      const row = document.createElement("div");
      row.className = "flex items-center justify-between gap-3 px-3.5 py-2.5";
      const l = document.createElement("span");
      l.className = "text-xs font-bold text-sky-50";
      l.textContent = label;
      const v = document.createElement("span");
      v.className = `ob-badge ${st}`;
      v.textContent = val;
      row.append(l, v);
      box.appendChild(row);
    });
    const note = document.getElementById("obSummaryNote");
    if (note) note.classList.toggle("hidden", !missing);
  }

  // İzin adımlarının ana düğmesi
  obRequest(kind) {
    const b = window.AndroidBridge;
    const p = this.getPermissionState();
    if (!b || !p) return this.nextOnboardingStep();

    if (kind === "dnd" && !this.autoSilent) return this.nextOnboardingStep();
    if (p[kind]) return this.nextOnboardingStep();

    this._obAwaiting = kind;
    if (kind === "notif") {
      if (this._obDenied.notif) {
        this.showToast("Bildirimler › İzin ver seçeneğini açın", "🔔", 3000);
        b.openAppNotificationSettings && b.openAppNotificationSettings();
      } else {
        b.requestNotificationPermission && b.requestNotificationPermission();
      }
    } else if (kind === "exact") {
      this._obVisited.exact = true;
      this.showToast("“Alarmlar ve hatırlatıcılar” iznini açın", "⏰", 3000);
      setTimeout(() => b.openExactAlarmSettings && b.openExactAlarmSettings(), 600);
    } else if (kind === "battery") {
      this._obVisited.battery = true;
      if (b.requestIgnoreBatteryOptimizations) {
        b.requestIgnoreBatteryOptimizations();
      } else {
        this.showToast("Tam Vakti için “Kısıtlama yok” seçin", "🔋", 3000);
        setTimeout(() => b.openBatteryOptimizationSettings && b.openBatteryOptimizationSettings(), 600);
      }
    } else if (kind === "dnd") {
      this._obVisited.dnd = true;
      this.showToast("Listeden Tam Vakti'ni açın", "📵", 3000);
      setTimeout(() => b.openDndSettings && b.openDndSettings(), 600);
    }
  }

  obOpenAppDetails() {
    const b = window.AndroidBridge;
    if (b && b.openAppDetailsSettings) {
      this.showToast("İzinler › Konum › Uygulamayı kullanırken izin ver", "📍", 3500);
      b.openAppDetailsSettings();
    }
  }

  // Sihirbazdaki sessize alma anahtarı: ayar ekranını kendiliğinden açmaz
  obSetAutoSilent(checked) {
    this.autoSilent = !!checked;
    localStorage.setItem("tamvakti_auto_silent", this.autoSilent ? "true" : "false");
    const cb = document.getElementById("autoSilentToggle");
    if (cb) cb.checked = this.autoSilent;
    this.scheduleSync();
    this.refreshOnboardingPermissions();
  }

  // Native izin penceresi sonucu (MainActivity.notifyPermissionResult)
  onPermissionResult(kind, granted) {
    if (!this._obDenied) this._obDenied = { notif: false, loc: false };
    if (kind === "notif") {
      this._obDenied.notif = !granted;
      if (granted) this.evaluateCurrentPrayer();
    } else if (kind === "loc") {
      this._obDenied.loc = !granted;
    }
    this.refreshPermissionStatus();
    if (!this.isOnboardingOpen()) return;
    this.updateOnboardingLocationDisplay();
    this.refreshOnboardingPermissions();
    if (granted && kind === "notif") this.advanceOnboardingFrom("notif", 600);
  }

  // Sistem ayar ekranından dönüş: rozetleri tazele, izin verildiyse ilerle
  onOnboardingResume() {
    if (!this.isOnboardingOpen()) return;
    this.refreshOnboardingPermissions();
    const kind = this._obAwaiting;
    const p = this.getPermissionState();
    if (kind && p && p[kind] && this.currentOnboardingKey() === kind) {
      this._obAwaiting = null;
      this.showToast("İzin verildi", "✓", 1500);
      this.advanceOnboardingFrom(kind, 700);
    }
  }

  onboardingLocateWithGPS() {
    const btn = document.getElementById("onboardingGpsBtn");
    const origHtml = btn ? btn.innerHTML : "";
    if (btn) btn.innerHTML = `<span>⏳</span><span>Konum tespiti yapılıyor...</span>`;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          const locName = await this.resolveLocationName(lat, lon);
          this.selectLocation(locName, lat, lon); // konum adımından kendiliğinden ilerler
          const districtDisplay = locName.includes("/") ? locName.split("/")[1] : locName;
          this.showToast(`Konum tespit edildi: ${districtDisplay}`, "📍");
          if (btn) btn.innerHTML = origHtml;
        },
        (err) => {
          if (err && err.code === 1 && this._obDenied) this._obDenied.loc = true;
          this.updateOnboardingLocationDisplay();
          this.showToast("GPS konumu alınamadı, lütfen listeden seçiniz.", "⚠️");
          if (btn) btn.innerHTML = origHtml;
          this.openLocationModal();
        },
        { enableHighAccuracy: false, timeout: 10000 }
      );
    } else {
      this.showToast("GPS desteği bulunamadı.", "⚠️");
      if (btn) btn.innerHTML = origHtml;
      this.openLocationModal();
    }
  }

  completeOnboarding() {
    this.scheduleSync();
    this.closeOnboarding(true);
    this.showToast("Tam Vakti\x27ne Hoş Geldiniz! Hayırlı ibadetler dileriz.", "✓", 3500);
  }

  playAlertTone() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880.00, ctx.currentTime + 0.35);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.7);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.7);
    } catch (e) {}
  }


}

let app = null;
window.addEventListener("DOMContentLoaded", () => {
  app = new TamVaktiApp();
  window.app = app;
});
