/**
 * Tam Vakti - Minimalist Adaçayı Yeşili & Sade Vakit / Kıble Kontrolcüsü
 * Sürüm: v2.4
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

class TamVaktiApp {
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
    this.currentVersion = "v2.4";
    this.versionCodename = "Şafak";
    this.versionDisplay = "v2.4 • Şafak";
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
    // İhtiyat: tüm vakitlere eklenen dakika (Diyanet ± ayarı)
    this.timeOffsetMin = parseInt(localStorage.getItem("tamvakti_time_offset"), 10) || 0;
    this._syncSeq = 0;

    // Kıble Modu (compass: Canlı Pusula, map: Harita Görünümü)
    this.qiblaMode = "compass";
    this.qiblaMap = null;
    this.qiblaMapLine = null;
    this.qiblaMapUserMarker = null;
    this.qiblaMapKaabaMarker = null;

    this.isFriday = false;

    this.init();
  }

  onNativeCompassUpdate(heading, accuracy, pitch, roll) {
    if (this.compass && this.qiblaMode === "compass") {
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

    // Android bildirim iznini ilk açılışta nazikçe iste
    if (this.ongoingNotifEnabled && window.AndroidBridge && window.AndroidBridge.requestNotificationPermission) {
      window.AndroidBridge.requestNotificationPermission();
    }

    // Canlı Saat & Tarih Sayacı
    setInterval(() => this.tick(), 1000);
    this.tick();

    await this.updatePrayers();
    if (typeof this.updateOnboardingLocationDisplay === "function") {
      this.updateOnboardingLocationDisplay();
    }

    // Başlangıç Kurulum Sihirbazı (İlk açılışta veya henüz konum seçilmemişse açılır)
    const onboardingDone = localStorage.getItem("tamvakti_onboarding_completed") === "true";
    const hasSavedLocation = !!localStorage.getItem("tamvakti_active_location");
    if (!onboardingDone || !hasSavedLocation) {
      this.openOnboarding(1);
    }

    // Eksik izin varsa (alarm / bildirim) bir kez nazikçe hatırlat
    setTimeout(() => {
      const p = this.getPermissionState();
      if (p && !this._permHinted && (!p.exact || !p.notif) && localStorage.getItem("tamvakti_onboarding_completed") === "true") {
        this._permHinted = true;
        this.showToast("Uyarıların zamanında gelmesi için Ayarlar › İzinler bölümünü kontrol edin.", "⏰", 4500);
      }
    }, 5000);

    // Arka planda sessizce yeni GitHub sürümünü denetle
    if (this.canSelfUpdate) setTimeout(() => this.checkForUpdates(true), 2500);
  }

  async updatePrayers() {
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
      if (this.qiblaMode === "map" && this.qiblaMap) {
        this.updateQiblaMap();
      }
    }

    this.renderDayRibbon();
    this.evaluateCurrentPrayer();
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
    const yearNum = now.getFullYear();
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
    if (how) how.textContent = this.notifMode === "sessiz" ? "Sessiz bildirim gelir" : "Telefonun bildirim sesiyle bildirim gelir";
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
    const viewQibla = document.getElementById("viewQibla");
    const qiblaVisible = viewQibla && !viewQibla.classList.contains("hidden");
    if (this.compass && qiblaVisible && this.qiblaMode === "compass") {
      this.compass.isListening = false; // native taraf onPause'da durdu
      this.compass.startCompass();
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
    let badgeTxt = "", remainTxt = "", warn = false;
    if (kerahatEnd !== null) {
      badgeTxt = "Kerahat vakti";
      remainTxt = `${Math.max(1, Math.ceil((kerahatEnd - nowMs) / 60000))} dk sonra biter`;
      warn = true;
    } else if (kerahatNextStart !== null) {
      badgeTxt = `Kerahat ${fmtHM(kerahatNextStart)}`;
      remainTxt = `Kerahate ${Math.max(1, Math.ceil((kerahatNextStart - nowMs) / 60000))} dk`;
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
    const btnSettings = document.getElementById("tabBtn-settings");
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
        if (this.qiblaMode === "compass") {
          this.compass.startCompass();
        } else if (this.qiblaMode === "map") {
          this.initQiblaMap();
        }
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
      if (this.compass && this.qiblaMode === "compass") {
        this.compass.startCompass();
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
        sourceEl.textContent = data.source === 'diyanet-api' ? 'Diyanet Çevrimiçi' : 'Diyanet Çevrimdışı';
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

  // Kıble Alt Modu: Canlı Pusula vs Harita / Sokak Yönü
  switchQiblaMode(mode) {
    this.qiblaMode = mode;
    const btnCompass = document.getElementById("qiblaSubTab-compass");
    const btnMap = document.getElementById("qiblaSubTab-map");
    const cCompass = document.getElementById("qiblaModeContainer-compass");
    const cMap = document.getElementById("qiblaModeContainer-map");

    if (mode === "compass") {
      if (btnCompass) btnCompass.className = "qibla-mode-btn active flex-1 py-1.5 rounded-xl text-xs font-black transition-all";
      if (btnMap) btnMap.className = "qibla-mode-btn flex-1 py-1.5 rounded-xl text-xs font-bold text-slate-500 transition-all";
      if (cCompass) cCompass.classList.remove("hidden");
      if (cMap) cMap.classList.add("hidden");
      if (this.compass) {
        this.compass.startCompass();
      }
    } else if (mode === "map") {
      if (btnCompass) btnCompass.className = "qibla-mode-btn flex-1 py-1.5 rounded-xl text-xs font-bold text-slate-500 transition-all";
      if (btnMap) btnMap.className = "qibla-mode-btn active flex-1 py-1.5 rounded-xl text-xs font-black transition-all";
      if (cCompass) cCompass.classList.add("hidden");
      if (cMap) cMap.classList.remove("hidden");
      if (this.compass) {
        this.compass.stopCompass();
      }
      this.initQiblaMap();
    }
  }

  initQiblaMap() {
    setTimeout(() => {
      const mapContainer = document.getElementById("qiblaMapContainer");
      if (!mapContainer || typeof L === 'undefined') return;

      const userLat = this.currentLocation.lat;
      const userLon = this.currentLocation.lon;
      const kaabaLat = 21.4225;
      const kaabaLon = 39.8262;

      if (!this.qiblaMap) {
        this.qiblaMap = L.map('qiblaMapContainer', {
          zoomControl: true,
          attributionControl: false
        }).setView([userLat, userLon], 16);

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19
        }).addTo(this.qiblaMap);

        const kaabaIcon = L.divIcon({
          className: 'kaaba-map-icon',
          html: '<div style="font-size:24px;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.5));">🕋</div>',
          iconSize: [30, 30],
          iconAnchor: [15, 15]
        });

        const userIcon = L.divIcon({
          className: 'user-map-icon',
          html: '<div style="width:16px;height:16px;border-radius:50%;background:#10548b;border:3px solid #ffffff;box-shadow:0 0 10px rgba(16, 84, 139,0.9);"></div>',
          iconSize: [16, 16],
          iconAnchor: [8, 8]
        });

        this.qiblaMapUserMarker = L.marker([userLat, userLon], { icon: userIcon }).addTo(this.qiblaMap)
          .bindPopup(`<b>Bulunduğunuz Yer</b><br>${this.currentLocation.name}`);

        this.qiblaMapKaabaMarker = L.marker([kaabaLat, kaabaLon], { icon: kaabaIcon }).addTo(this.qiblaMap)
          .bindPopup("<b>Mekke-i Mükerreme</b><br>Kâbe-i Muazzama");

        this.qiblaMapLine = L.polyline([[userLat, userLon], [kaabaLat, kaabaLon]], {
          color: '#10548b',
          weight: 4,
          opacity: 0.95,
          dashArray: '8, 8'
        }).addTo(this.qiblaMap);
      } else {
        this.updateQiblaMap();
      }
      this.qiblaMap.invalidateSize();
    }, 150);
  }

  updateQiblaMap() {
    if (!this.qiblaMap) return;
    const userLat = this.currentLocation.lat;
    const userLon = this.currentLocation.lon;
    const kaabaLat = 21.4225;
    const kaabaLon = 39.8262;

    this.qiblaMap.setView([userLat, userLon], 16);
    if (this.qiblaMapUserMarker) {
      this.qiblaMapUserMarker.setLatLng([userLat, userLon]);
      this.qiblaMapUserMarker.setPopupContent(`<b>Bulunduğunuz Yer</b><br>${this.currentLocation.name}`);
    }
    if (this.qiblaMapLine) {
      this.qiblaMapLine.setLatLngs([[userLat, userLon], [kaabaLat, kaabaLon]]);
    }
    this.qiblaMap.invalidateSize();
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

    // Eğer onboarding aktifse konum bilgisini güncelle ve otomatik adım 3'e geç
    const onboardingModal = document.getElementById("onboardingModal");
    if (onboardingModal && !onboardingModal.classList.contains("hidden")) {
      this.updateOnboardingLocationDisplay();
      setTimeout(() => this.goToOnboardingStep(3), 400);
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
    const modeNames = { bip: "Telefon sesi", sessiz: "Sessiz" };
    const set = (id, txt) => { const el = document.getElementById(id); if (el) el.textContent = txt; };
    const nOn = ["imsak", "gunes", "ogle", "ikindi", "aksam", "yatsi"].filter(k => this.isAlertOn(k)).length;
    set("settingsAlertsSummary", nOn === 0 ? "Kapalı" : `${nOn} vakit açık`);
    set("settingsNotifMode", modeNames[this.notifMode] || "Telefon sesi");
    set("settingsCalcMethod", this.timeOffsetMin === 0 ? "Yok" : this.offsetLabel());
    const k = document.getElementById("kerahatToggle");
    if (k) k.checked = this.kerahatAlert;
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
      if (this.compass && this.qiblaMode === "compass") {
        this.compass.startCompass();
      }
    } else {
      if (btnPrayer) btnPrayer.classList.add("active");
      if (btnQibla) btnQibla.classList.remove("active");
    }
  }

  openBatterySettings() {
    if (window.AndroidBridge && window.AndroidBridge.openBatteryOptimizationSettings) {
      window.AndroidBridge.openBatteryOptimizationSettings();
    } else {
      this.showToast("Android pil optimizasyon ayarlarına yönlendiriliyor...", "⚙️");
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
        el.textContent = `Sıradaki uyarı: ${hm}`;
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
    chip("permChipNotif", p.notif, "Açık", "Kapalı");
    chip("permChipExact", p.exact, "Açık", "Kapalı");
    chip("permChipDnd", p.dnd, "Açık", "Kapalı");
    chip("permChipBattery", p.battery, "Serbest", "Kısıtlı");
    const dndRow = document.getElementById("permRowDnd");
    if (dndRow) dndRow.classList.toggle("hidden", !this.autoSilent);
  }

  fixPermission(kind) {
    const b = window.AndroidBridge;
    const p = this.getPermissionState();
    if (!b || !p) return;
    if (kind === "notif") {
      if (p.notif) return this.showToast("Bildirimler açık", "✓", 1800);
      b.openAppNotificationSettings && b.openAppNotificationSettings();
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
    const seq = ++this._syncSeq;
    const { lat, lon } = this.currentLocation;
    const city = this.shortPlaceName();

    const DAYS = 7;
    const monthCache = {};
    const prayers = [];
    const events = [];
    const mode = this.notifMode;
    const MIN = 60000;
    const start = new Date();

    for (let i = 0; i < DAYS; i++) {
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
            mode: mode
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
        prayers,
        events: events.slice(0, 400)
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
      { value: "bip", label: "Telefonun bildirim sesi", desc: "Sesi Bildirim sesi satırından değiştirebilirsiniz" },
      { value: "sessiz", label: "Sessiz", desc: "Yalnızca bildirim yazısı gösterilir" }
    ], this.notifMode, (v) => {
      this.notifMode = v;
      localStorage.setItem("tamvakti_notif_mode", v);
      this.updateSettingsLabels();
      this.scheduleSync();
    });
  }

  openIhtiyatModal() {
    const opts = [-3, -2, -1, 0, 1, 2, 3, 5].map(m => ({
      value: m,
      label: m === 0 ? "Yok (Diyanet vakti aynen)" : `${m > 0 ? "+" : "−"}${Math.abs(m)} dk`
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
    if (!rawText) return "<div class='text-slate-500 py-1'>Yeni özellikler ve performans iyileştirmeleri.</div>";

    const lines = rawText.split("\n");
    const bulletItems = [];

    for (let line of lines) {
      let trimmed = line.trim();
      if (!trimmed) continue;
      if (trimmed.startsWith("#") || trimmed.startsWith("- **Sürüm:**") || trimmed.startsWith("- **Paket Adı:**")) {
        continue;
      }
      if (trimmed.includes("Kurulum") || trimmed.includes("TamVakti") || trimmed.includes(".apk")) {
        continue;
      }
      if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        let content = trimmed.substring(2).trim();
        content = content.replace(/\*\*(.*?)\*\*/g, "<strong class='text-sky-950 font-bold'>$1</strong>");
        bulletItems.push(content);
      } else if (trimmed.length > 5 && !trimmed.startsWith("```")) {
        let content = trimmed.replace(/\*\*(.*?)\*\*/g, "<strong class='text-sky-950 font-bold'>$1</strong>");
        bulletItems.push(content);
      }
    }

    if (bulletItems.length === 0) {
      return `<div class="p-1 text-slate-700">${rawText.replace(/\n/g, "<br>")}</div>`;
    }

    return bulletItems.map(item => `
      <div class="flex items-start gap-2 py-1.5 border-b border-sky-900/5 last:border-0">
        <span class="text-sky-600 text-sm leading-none mt-0.5">•</span>
        <div class="text-[11.5px] text-slate-700 leading-snug">${item}</div>
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
      btn.innerHTML = `<span>⚡</span><span>Şimdi Güncelle</span>`;
    }

    if (modal) {
      modal.classList.remove("hidden");
    }
  }

  closeUpdateFoundModal() {
    const modal = document.getElementById("updateFoundModal");
    if (modal) modal.classList.add("hidden");
  }

  startUpdateDownloadFromModal() {
    const progressArea = document.getElementById("modalUpdateProgressArea");
    const btn = document.getElementById("modalBtnStartUpdate");
    if (progressArea) progressArea.classList.remove("hidden");
    if (btn) {
      btn.classList.add("opacity-50", "pointer-events-none");
      btn.innerHTML = `<span>⏳</span><span>İndirme Başlatılıyor...</span>`;
    }
    this.startUpdateDownload();
  }

  async checkForUpdates(silent = true) {
    if (!this.canSelfUpdate) return;
    const statusEl = document.getElementById("updateCheckStatus");
    const badgeDot = document.getElementById("updateBadgeDot");

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

        if (badgeDot) badgeDot.classList.remove("hidden");
        if (statusEl) statusEl.textContent = `🚀 Yeni: ${latestTag}`;
        this.renderUpdateCard();

        // Otomatik olarak yeni güncelleme ekranını ve değişiklik listesini aç!
        this.openUpdateFoundModal();
      } else {
        // Güncel
        this.updateInfo = null;
        if (badgeDot) badgeDot.classList.add("hidden");
        if (statusEl) statusEl.textContent = "✓ Sürüm güncel";
        this.renderUpdateCard();

        if (!silent) {
          this.showToast("Uygulamanız zaten en güncel sürümde (" + this.currentVersion + ").", "✓");
        }
      }
    } catch (e) {
      console.warn("Update check failed:", e);
      if (statusEl) statusEl.textContent = "Denetlenemedi";
      if (!silent) {
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
      btn.innerHTML = `<span>⏳</span><span>İndirme Başlatılıyor...</span>`;
    }

    if (window.AndroidBridge && window.AndroidBridge.downloadAndInstallApk) {
      window.AndroidBridge.downloadAndInstallApk(this.updateInfo.downloadUrl);
    } else {
      window.open(this.updateInfo.downloadUrl, "_blank");
      this.isDownloadingUpdate = false;
      if (btn) {
        btn.classList.remove("opacity-50", "pointer-events-none");
        btn.innerHTML = `<span>⚡</span><span>Şimdi Güncelle ve İndir</span>`;
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
      modalBtn.innerHTML = `<span>⚡</span><span>Şimdi Güncelle</span>`;
    }

    this.showToast("İndirme sırasında hata oluştu: " + errorMsg, "⚠️", 4000);
  }


  // ==========================================
  // BAŞLANGIÇ & KURULUM SİHİRBAZI (ONBOARDING)
  // ==========================================
  openOnboarding(step = 1) {
    const modal = document.getElementById("onboardingModal");
    if (!modal) return;
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
    this.updateOnboardingLocationDisplay();
  }

  closeOnboarding(savePreference = true) {
    if (savePreference) {
      localStorage.setItem("tamvakti_onboarding_completed", "true");
    }
    const modal = document.getElementById("onboardingModal");
    if (modal) modal.classList.add("hidden");
    document.body.classList.remove("overflow-hidden");
    document.body.classList.remove("onboarding-active");

    // Kurulum bittiğinde veya atlandığında alt sekmeleri geri aç
    const dock = document.getElementById("mainBottomDock") || document.querySelector(".minimal-dock");
    if (dock) {
      dock.classList.remove("hidden");
      dock.style.removeProperty("display");
    }
  }

  updateOnboardingLocationDisplay() {
    const hasChosen = !!localStorage.getItem("tamvakti_active_location");
    const cEl = document.getElementById("onboardingCurrentCity");
    const nEl = document.getElementById("onboardingNotifCity");
    const badge = document.getElementById("onboardingLocationBadge");

    if (!hasChosen || !this.currentLocation || this.currentLocation.isPlaceholder) {
      if (cEl) cEl.textContent = "Henüz seçilmedi";
      if (nEl) nEl.textContent = "Vakit Bildirimi";
      if (badge) badge.classList.add("opacity-50");
      return;
    }

    if (badge) badge.classList.remove("opacity-50");
    const cityName = this.shortPlaceName();
    if (cEl) cEl.textContent = cityName;
    if (nEl) nEl.textContent = cityName;
  }

  goToOnboardingStep(step) {
    this.onboardingStep = Math.max(1, Math.min(5, step));

    // 1. Panelleri ve buton gruplarını göster/gizle
    for (let i = 1; i <= 5; i++) {
      const pane = document.getElementById(`onboardingStep-${i}`);
      const btnGroup = document.getElementById(`onboardingBtnGroup-${i}`);
      if (pane) {
        if (i === this.onboardingStep) {
          pane.classList.remove("hidden");
        } else {
          pane.classList.add("hidden");
        }
      }
      if (btnGroup) {
        if (i === this.onboardingStep) {
          btnGroup.classList.remove("hidden");
        } else {
          btnGroup.classList.add("hidden");
        }
      }
    }

    // Adım 2 İlerleme Butonu
    if (this.onboardingStep === 2) {
      const contBtn = document.getElementById("onboardingStep2ContinueBtn");
      const hasLoc = !!localStorage.getItem("tamvakti_active_location");
      if (contBtn) {
        if (hasLoc) contBtn.classList.remove("hidden");
        else contBtn.classList.add("hidden");
      }
    }

    // 2. Geri Butonu Yönetimi (1. adımda gizli, 2-5 te görünür)
    const backBtn = document.getElementById("onboardingBackBtn");
    if (backBtn) {
      if (this.onboardingStep > 1) {
        backBtn.classList.remove("invisible");
      } else {
        backBtn.classList.add("invisible");
      }
    }

    // 3. Nokta İndikatörleri
    const dotsContainer = document.getElementById("onboardingDotsBar");
    if (dotsContainer) {
      const dots = dotsContainer.querySelectorAll(".onboarding-dot");
      dots.forEach((dot, idx) => {
        if (idx + 1 === this.onboardingStep) {
          dot.classList.add("active");
        } else {
          dot.classList.remove("active");
        }
      });
    }

    this.updateOnboardingLocationDisplay();
  }

  prevOnboardingStep() {
    if (this.onboardingStep > 1) {
      this.goToOnboardingStep(this.onboardingStep - 1);
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
          this.selectLocation(locName, lat, lon);
          this.updateOnboardingLocationDisplay();
          const districtDisplay = locName.includes("/") ? locName.split("/")[1] : locName;
          this.showToast(`Konum tespit edildi: ${districtDisplay}`, "📍");
          if (btn) btn.innerHTML = origHtml;
          setTimeout(() => this.goToOnboardingStep(3), 600);
        },
        (err) => {
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

  onboardingEnableNotifications() {
    this.setOngoingNotifSetting(true);
    if (window.AndroidBridge && window.AndroidBridge.requestNotificationPermission) {
      window.AndroidBridge.requestNotificationPermission();
    } else if (window.Notification && Notification.requestPermission) {
      Notification.requestPermission();
    }
    this.showToast("Bildirimler etkinleştirildi.", "🔔");
    this.goToOnboardingStep(4);
  }

  completeOnboarding() {
    const kerahatToggle = document.getElementById("onboardingKerahatToggle");
    if (kerahatToggle) {
      localStorage.setItem("tamvakti_kerahat_alert", kerahatToggle.checked ? "true" : "false");
      this.kerahatAlert = kerahatToggle.checked;
    }
    this.scheduleSync();

    this.closeOnboarding(true);
    this.showToast("Tam Vakti\x27ne Hoş Geldiniz! Hayırlı ibadetler dileriz.", "🕌", 3500);
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
