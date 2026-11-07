/**
 * Tam Vakti - Minimalist Adaçayı Yeşili & Sade Vakit / Kıble Kontrolcüsü
 * Sürüm: v2.3
 */

const PRAYER_LIST = [
  { key: "imsak", name: "İmsak", arabic: "الفجر", iconSvg: "assets/icons/imsak.svg" },
  { key: "gunes", name: "Güneş", arabic: "الشروق", iconSvg: "assets/icons/gunes.svg" },
  { key: "ogle", name: "Öğle", arabic: "الظهر", iconSvg: "assets/icons/ogle.svg" },
  { key: "ikindi", name: "İkindi", arabic: "العصر", iconSvg: "assets/icons/ikindi.svg" },
  { key: "aksam", name: "Akşam", arabic: "المغرب", iconSvg: "assets/icons/aksam.svg" },
  { key: "yatsi", name: "Yatsı", arabic: "العشاء", iconSvg: "assets/icons/yatsi.svg" }
];

const PRAYER_DETAILS = {
  imsak: {
    name: "İmsak",
    sub: "Sahur Sonu & Sabah Namazı",
    rakahs: [
      { name: "2 Rekât Sünnet", type: "Sünnet-i Müekkede" },
      { name: "2 Rekât Farz", type: "Farz" }
    ],
    total: "4 Rekât",
    desc: "Yeme-içmenin sona erdiği ve sabah namazı vaktinin başladığı andır. Güneş doğuşuna kadar kılınabilir."
  },
  gunes: {
    name: "Güneş Doğuşu",
    sub: "Sabah Namazı Sonu (Kerahat)",
    rakahs: [
      { name: "Güneş Doğuşu", type: "Kerahat Vakti" }
    ],
    total: "Kerahat",
    desc: "Güneş doğduktan sonraki ilk 45 dakika namaz kılmak mekruhtur. Güneş 45-50 dk yükseldikten sonra Kuşluk (Duhâ) namazı kılınabilir."
  },
  ogle: {
    name: "Öğle",
    sub: "Zeval Vakti Sonu",
    rakahs: [
      { name: "4 Rekât İlk Sünnet", type: "Sünnet-i Müekkede" },
      { name: "4 Rekât Farz", type: "Farz" },
      { name: "2 Rekât Son Sünnet", type: "Sünnet-i Müekkede" }
    ],
    total: "10 Rekât",
    desc: "Güneşin tepe noktasından batıya meyletmesiyle başlar, ikindiye kadar devam eder. Cuma günleri Cuma namazı bu vakitte kılınır."
  },
  ikindi: {
    name: "İkindi",
    sub: "Asr Vakti",
    rakahs: [
      { name: "4 Rekât Sünnet", type: "Sünnet-i Gayr-i Müekkede" },
      { name: "4 Rekât Farz", type: "Farz" }
    ],
    total: "8 Rekât",
    desc: "Güneşin batmasına 45 dakika kalana kadar kılınmalıdır; son 45 dakika kerahat vaktidir."
  },
  aksam: {
    name: "Akşam",
    sub: "İftar & Akşam Namazı",
    rakahs: [
      { name: "3 Rekât Farz", type: "Farz" },
      { name: "2 Rekât Sünnet", type: "Sünnet-i Müekkede" },
      { name: "6 Rekât Evvâbîn", type: "Müstehab" }
    ],
    total: "5 Rekât",
    desc: "Güneşin tamamen batmasıyla başlar. Oruçlular için iftar vaktidir. Akşam namazında önce farz kılınır."
  },
  yatsi: {
    name: "Yatsı",
    sub: "İşa & Vitir Namazı",
    rakahs: [
      { name: "4 Rekât İlk Sünnet", type: "Sünnet-i Gayr-i Müekkede" },
      { name: "4 Rekât Farz", type: "Farz" },
      { name: "2 Rekât Son Sünnet", type: "Sünnet-i Müekkede" },
      { name: "3 Rekât Vitir", type: "Vacip" }
    ],
    total: "13 Rekât",
    desc: "Batı ufkundaki kızıllık ve beyazlığın kaybolmasıyla başlar, imsak vaktine kadar devam eder."
  }
};

const ATHAN_SOUNDS = {
  "Hicaz": "assets/audio/ezan_turkey_1.mp3",
  "Saba": "assets/audio/ezan_fajr.mp3",
  "Rast": "assets/audio/ezan_madinah.mp3",
  "Segah": "assets/audio/ezan_turkey_2.mp3",
  "Mekke": "assets/audio/ezan_makkah.mp3",
  "Kudüs": "assets/audio/ezan_alaqsa.mp3",
  "Afasi": "assets/audio/ezan_alafasy.mp3"
};
const ATHAN_ORDER = ["Hicaz", "Saba", "Rast", "Segah", "Mekke", "Kudüs", "Afasi"];

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
    this.soundSettings = this.loadSoundSettings();

    // Sabit Bildirim Tercihi (Varsayılan: Açık)
    this.ongoingNotifEnabled = this.loadOngoingNotifSetting();

    // Otomatik Güncelleme Sistemi (GitHub Releases)
    this.currentVersion = "v2.3";
    this.versionCodename = "Seher";
    this.versionDisplay = "v2.3 • Seher";
    this.onboardingStep = 1;
    this.monthlyYear = null;
    this.monthlyMonth = null;
    this.updateInfo = null;
    this.isDownloadingUpdate = false;

    // Ezan Makamı & Ses Önizleme
    this.currentAthanTone = localStorage.getItem("tamvakti_athan_tone") || "Hicaz";
    this.athanAudio = null;
    this.autoSilent = localStorage.getItem("tamvakti_auto_silent") !== "false";

    // Bildirim tercihleri
    this.reminderMin = parseInt(localStorage.getItem("tamvakti_reminder_min"), 10) || 15;
    this.notifMode = localStorage.getItem("tamvakti_notif_mode") || "ezan"; // ezan | bip | sessiz
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

  loadSoundSettings() {
    const saved = localStorage.getItem("tamvakti_sound_settings");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return { imsak: true, gunes: false, ogle: true, ikindi: false, aksam: true, yatsi: false };
  }

  saveSoundSettings() {
    localStorage.setItem("tamvakti_sound_settings", JSON.stringify(this.soundSettings));
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
    setTimeout(() => this.checkForUpdates(true), 2500);
  }

  async updatePrayers() {
    const now = new Date();
    
    // Şehir Rozeti
    const isPlaceholder = !this.currentLocation || this.currentLocation.isPlaceholder || this.currentLocation.name === "Konum Seçiniz";
    const displayName = isPlaceholder
      ? "Konum Seçiniz"
      : this.currentLocation.name.includes(",") 
      ? this.currentLocation.name.split(",")[1].trim() 
      : this.currentLocation.name.includes("/")
      ? this.currentLocation.name.split("/")[1].trim()
      : this.currentLocation.name;
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

  cycleIhtiyat() {
    const steps = [0, 1, 2, 3, 5, -1, -2, -3];
    const next = steps[(steps.indexOf(this.timeOffsetMin) + 1) % steps.length];
    this.timeOffsetMin = next;
    localStorage.setItem("tamvakti_time_offset", String(next));
    this.updateSettingsLabels();
    this.updatePrayers();
    const monthlyModal = document.getElementById("monthlyModal");
    if (monthlyModal && !monthlyModal.classList.contains("hidden")) this.loadMonthlyData(false);
    this.showToast(`İhtiyat: ${this.offsetLabel()} — tüm vakitlere uygulandı`, "🎛️", 2800);
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
    if (mainEl) mainEl.textContent = `${dayNum} ${monthName} ${yearNum} • ${dayName}`;

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

  updateSolarTransitCurve() {
    const container = document.getElementById("solarTransitNodes");
    if (!container || !this.currentTimes) return;

    const coords = [
      { key: "imsak", name: "İmsak", x: 25, y: 38 },
      { key: "gunes", name: "Güneş", x: 75, y: 22 },
      { key: "ogle", name: "Öğle", x: 130, y: 10 },
      { key: "ikindi", name: "İkindi", x: 190, y: 24 },
      { key: "aksam", name: "Akşam", x: 250, y: 44 },
      { key: "yatsi", name: "Yatsı", x: 310, y: 34 }
    ];

    const orderKeys = ["imsak", "gunes", "ogle", "ikindi", "aksam", "yatsi"];
    const currentIdx = Math.max(0, orderKeys.indexOf(this.activePrayerKey));

    // Canlı İlerleme Dalgası (Aktif vakte kadar turuncu akış)
    const pathEl = document.getElementById("solarPassedWave");
    if (pathEl) {
      if (currentIdx <= 0) {
        pathEl.setAttribute("d", "M 25 38");
      } else if (currentIdx === 1) {
        pathEl.setAttribute("d", "M 25 38 C 45 38, 60 28, 75 22");
      } else if (currentIdx === 2) {
        pathEl.setAttribute("d", "M 25 38 C 55 38, 75 10, 130 10");
      } else if (currentIdx === 3) {
        pathEl.setAttribute("d", "M 25 38 C 55 38, 75 10, 130 10 C 160 10, 175 18, 190 24");
      } else if (currentIdx === 4) {
        pathEl.setAttribute("d", "M 25 38 C 55 38, 75 10, 130 10 C 185 10, 215 44, 250 44");
      } else {
        pathEl.setAttribute("d", "M 25 38 C 55 38, 75 10, 130 10 C 185 10, 215 44, 250 44 C 275 44, 295 38, 310 34");
      }
    }

    let nodesHtml = "";
    coords.forEach((c, idx) => {
      const isPast = (idx < currentIdx);
      const isActive = (idx === currentIdx);
      const labelY = (c.y < 20) ? (c.y - 7) : (c.y + 11);
      const displayName = (c.key === "ogle" && this.isFriday) ? "Cuma" : c.name;

      if (isActive) {
        nodesHtml += `
          <g onclick="app.showPrayerDetail('${c.key}')" class="cursor-pointer" title="${displayName}: ${this.currentTimes[c.key]} (Şu An)">
            <circle cx="${c.x}" cy="${c.y}" r="6.5" fill="none" stroke="#38bdf8" stroke-width="1.5">
              <animate attributeName="r" values="5.5;8.5;5.5" dur="2.4s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.85;0.25;0.85" dur="2.4s" repeatCount="indefinite" />
            </circle>
            <circle cx="${c.x}" cy="${c.y}" r="5" fill="#38bdf8" filter="url(#solarGlow)"/>
            <text x="${c.x}" y="${labelY}" text-anchor="middle" fill="#38bdf8" font-size="7.5" font-weight="800">${displayName}</text>
          </g>
        `;
      } else if (isPast) {
        nodesHtml += `
          <g onclick="app.showPrayerDetail('${c.key}')" class="cursor-pointer" title="${displayName}: ${this.currentTimes[c.key]} (Geçti)">
            <circle cx="${c.x}" cy="${c.y}" r="4" fill="#fb923c" filter="drop-shadow(0 0 4px rgba(251,146,60,0.8))"/>
            <text x="${c.x}" y="${labelY}" text-anchor="middle" fill="#fb923c" font-size="7" font-weight="600" opacity="0.9">${displayName}</text>
          </g>
        `;
      } else {
        nodesHtml += `
          <g onclick="app.showPrayerDetail('${c.key}')" class="cursor-pointer" title="${displayName}: ${this.currentTimes[c.key]}">
            <circle cx="${c.x}" cy="${c.y}" r="3" fill="#334155"/>
            <text x="${c.x}" y="${labelY}" text-anchor="middle" fill="#64748b" font-size="6.5">${displayName}</text>
          </g>
        `;
      }
    });

    container.innerHTML = nodesHtml;
  }

  renderDayRibbon() {
    const ribbon = document.getElementById("dayTimesRibbon");
    if (!ribbon || !this.currentTimes) return;

    const orderKeys = ["imsak", "gunes", "ogle", "ikindi", "aksam", "yatsi"];
    const currentIdx = Math.max(0, orderKeys.indexOf(this.activePrayerKey));
    const nextIdx = (currentIdx + 1) % 6;

    ribbon.innerHTML = PRAYER_LIST.map((item, idx) => {
      const timeVal = this.currentTimes[item.key] || "--:--";
      const isCurrent = (item.key === this.activePrayerKey);
      const isNext = (idx === nextIdx);

      let itemStyle = "flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all";
      let nameColor = "text-slate-400";
      let timeColor = "text-slate-200";

      if (isCurrent) {
        itemStyle += " bg-sky-500/20 border border-sky-400/50 shadow-[0_0_12px_rgba(56,189,248,0.25)]";
        nameColor = "text-sky-300 font-bold";
        timeColor = "text-white font-bold";
      } else if (isNext) {
        itemStyle += " bg-slate-800/40 border border-slate-700/60";
        nameColor = "text-sky-200/80 font-medium";
        timeColor = "text-sky-100 font-semibold";
      } else {
        nameColor = "text-slate-400 opacity-75";
        timeColor = "text-slate-300";
      }

      const displayName = (item.key === "ogle" && this.isFriday) ? "Cuma" : item.name;

      return `
        <div onclick="app.showPrayerDetail('${item.key}')" class="${itemStyle} cursor-pointer active:scale-95" title="${displayName}: ${timeVal}">
          <span class="text-[10px] tracking-tight ${nameColor}">${displayName}${this.soundSettings[item.key] ? '<span class="inline-block w-1 h-1 rounded-full bg-sky-400 ml-1 align-middle" title="Bildirim açık"></span>' : ''}</span>
          <span class="text-xs font-mono font-medium tracking-tight mt-0.5 ${timeColor}">${timeVal}</span>
        </div>
      `;
    }).join("");
  }

  showPrayerDetail(key) {
    const info = PRAYER_DETAILS[key];
    if (!info) return;

    document.getElementById("detailModalTitle").textContent = `${info.name} Vakti`;
    document.getElementById("detailModalSub").textContent = info.sub;
    const descEl = document.getElementById("detailModalDesc");
    if (descEl) descEl.textContent = info.desc;
    document.getElementById("detailModalTotal").textContent = info.total;

    const listEl = document.getElementById("detailModalRakahs");
    listEl.innerHTML = info.rakahs.map(r => `
      <div class="flex items-center justify-between p-2 rounded-2xl bg-slate-800/40 text-xs">
        <span class="font-bold text-slate-100">${r.name}</span>
        <span class="px-2 py-0.5 rounded-full text-[10px] bg-sky-400/15 text-sky-200 font-extrabold">${r.type}</span>
      </div>
    `).join("");

    this._detailKey = key;
    const nt = document.getElementById("detailNotifToggle");
    if (nt) nt.checked = !!this.soundSettings[key];
    this.updateDetailNotifHint();
    document.getElementById("detailModal").classList.remove("hidden");
  }

  updateDetailNotifHint() {
    const el = document.getElementById("detailNotifHint");
    if (!el) return;
    const modes = { ezan: "ezan okunur", bip: "bildirim sesi çalar", sessiz: "sessiz bildirim" };
    const rem = this.reminderMin > 0 ? `${this.reminderMin} dk önce hatırlatılır, ` : "";
    el.textContent = `${rem}vakit girince ${modes[this.notifMode] || ""}`;
  }

  toggleSoundFromDetail(checked) {
    const key = this._detailKey;
    if (!key) return;
    this.soundSettings[key] = !!checked;
    this.saveSoundSettings();
    this.renderDayRibbon();
    this.scheduleSync();
    this.showToast(checked ? "Bu vakit için bildirim açıldı" : "Bu vakit için bildirim kapatıldı", "🔔", 2000);
  }

  closePrayerDetail() {
    document.getElementById("detailModal").classList.add("hidden");
  }

  tick() {
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
      currentBadge.textContent = `ŞU AN: ${current.name.toUpperCase()}`;
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
    setText("horizonStartName", current.name.toUpperCase());
    setText("horizonStartTime", this.currentTimes[current.key] || "--:--");
    setText("horizonEndName", current.nextName.toUpperCase());
    setText("horizonEndTime", current.nextTimeStr || "--:--");
    setText("horizonElapsedText", `${Math.floor(elapsed / 3600000)}s ${Math.floor((elapsed % 3600000) / 60000)}dk`);

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
    let badgeHtml = "✨ İbadet Vakti", remainTxt = "Kerahat Yok", warn = false;
    if (kerahatEnd !== null) {
      badgeHtml = "⚠️ Kerahat Vakti";
      remainTxt = `${Math.max(1, Math.ceil((kerahatEnd - nowMs) / 60000))} dk sonra biter`;
      warn = true;
    } else if (kerahatNextStart !== null) {
      badgeHtml = `⚠️ Kerahat ${fmtHM(kerahatNextStart)}`;
      remainTxt = `Kerahate ${Math.max(1, Math.ceil((kerahatNextStart - nowMs) / 60000))} dk`;
      warn = true;
    }
    if (kBadge) kBadge.innerHTML = badgeHtml;
    if (kRemain) {
      kRemain.textContent = remainTxt;
      kRemain.classList.toggle("text-amber-300", warn);
      kRemain.classList.toggle("text-slate-500", !warn);
    }

    // 3. Android Durum Çubuğu Sabit Bildirimini Güncelle
    if (this.ongoingNotifEnabled && window.AndroidBridge && window.AndroidBridge.updatePrayerNotification) {
      const targetTimeMillis = current.nextTime.getTime();
      // Her saniye gereksiz IPC çağrısı yapmamak için hedef vakit değiştiğinde güncelle
      if (this._lastNotifTargetMillis !== targetTimeMillis || this._lastNotifCity !== this.currentLocation.name) {
        this._lastNotifTargetMillis = targetTimeMillis;
        this._lastNotifCity = this.currentLocation.name;
        const cityName = this.currentLocation.name.includes(",")
          ? this.currentLocation.name.split(",")[1].trim()
          : this.currentLocation.name;
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
        { enableHighAccuracy: true, timeout: 8000 }
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
        ? `${this.currentLocation.name} • Otomatik`
        : "Konum Seçiniz";
    }
    const toneEl = document.getElementById("settingsAthanTone");
    if (toneEl) {
      toneEl.textContent = this.currentAthanTone || "Hicaz";
    }
    const silentToggle = document.getElementById("autoSilentToggle");
    if (silentToggle) {
      silentToggle.checked = this.autoSilent;
    }
    this.updateSettingsLabels();
  }

  updateSettingsLabels() {
    const modeNames = { ezan: "Ezan", bip: "Bip", sessiz: "Sessiz" };
    const set = (id, txt) => { const el = document.getElementById(id); if (el) el.textContent = txt; };
    set("settingsReminderTime", `${this.reminderMin} dk önce`);
    set("settingsNotifMode", modeNames[this.notifMode] || "Ezan");
    set("settingsCalcMethod", `Diyanet • ${this.offsetLabel()}`);
    const k = document.getElementById("kerahatToggle");
    if (k) k.checked = this.kerahatAlert;
    this.refreshPermissionStatus();
  }

  closeSettingsModal() {
    this.stopAthanPreview();
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
    const tone = (ATHAN_SOUNDS[this.currentAthanTone] || ATHAN_SOUNDS["Hicaz"]).split("/").pop();
    if (window.AndroidBridge && window.AndroidBridge.testAlert) {
      window.AndroidBridge.testAlert(
        "athan",
        "Test: Vakit girdi",
        (this.currentLocation && !this.currentLocation.isPlaceholder) ? this.currentLocation.name : "Tam Vakti",
        tone,
        this.notifMode
      );
      this.showToast(this.notifMode === "ezan" ? "Test: ezan çalıyor (bildirimden durdurabilirsiniz)" : "Test bildirimi gönderildi", "🔔", 3000);
      return;
    }
    this.playAlertTone();
    if (navigator.vibrate) navigator.vibrate(200);
    this.showToast("Test sesi çalındı (bildirimler yalnızca Android uygulamasında çalışır).", "🔔");
  }

  // ==========================================
  // İZİNLER (alarm, rahatsız etme, bildirim)
  // ==========================================
  getPermissionState() {
    if (!window.AndroidBridge || !window.AndroidBridge.getPermissionState) return null;
    try { return JSON.parse(window.AndroidBridge.getPermissionState()); } catch (e) { return null; }
  }

  refreshAlarmInfo() {
    const el = document.getElementById("settingsAlarmInfo");
    if (!el || !window.AndroidBridge || !window.AndroidBridge.getScheduleInfo) return;
    try {
      const i = JSON.parse(window.AndroidBridge.getScheduleInfo());
      if (!i.count) { el.textContent = "Henüz alarm kurulmadı (konum seçin)"; return; }
      let txt = `${i.count} alarm kuruldu`;
      if (i.nextT) {
        const hm = new Date(i.nextT).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
        txt += ` • Sıradaki: ${hm} ${i.nextTitle}`;
      }
      el.textContent = txt;
    } catch (e) {}
  }

  refreshPermissionStatus() {
    this.refreshAlarmInfo();
    const el = document.getElementById("settingsPermStatus");
    if (!el) return;
    const p = this.getPermissionState();
    if (!p) { el.textContent = "Yalnızca Android"; return; }
    const missing = [];
    if (!p.notif) missing.push("bildirim");
    if (!p.exact) missing.push("alarm");
    if (this.autoSilent && !p.dnd) missing.push("sessiz mod");
    el.textContent = missing.length ? `Eksik: ${missing.join(", ")}` : "Tamam ✓";
    el.className = missing.length ? "text-amber-600" : "text-sky-700";
  }

  openPermissionsFlow() {
    const p = this.getPermissionState();
    if (!p) { this.showToast("Bu izinler yalnızca Android uygulamasında gerekir.", "ℹ️"); return; }
    if (!p.notif) {
      window.AndroidBridge.requestNotificationPermission();
    } else if (!p.exact) {
      this.showToast("Vakitlerde tam zamanında uyarı için 'Alarmlar ve hatırlatıcılar' iznini verin.", "⏰", 4000);
      setTimeout(() => window.AndroidBridge.openExactAlarmSettings(), 900);
    } else if (this.autoSilent && !p.dnd) {
      this.showToast("'Rahatsız Etme' erişiminde Tam Vakti'ni etkinleştirin.", "📵", 4000);
      setTimeout(() => window.AndroidBridge.openDndSettings(), 900);
    } else {
      this.showToast("Tüm izinler tamam. Pil tasarrufundan muaf tutmak için üstteki uyarıyı kullanabilirsiniz.", "✓", 3500);
    }
  }

  // ==========================================
  // ANDROID ALARM LİSTESİ SENKRONİZASYONU
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
    const city = this.currentLocation.name.includes("/")
      ? this.currentLocation.name.split("/")[1].trim()
      : this.currentLocation.name.includes(",")
      ? this.currentLocation.name.split(",")[1].trim()
      : this.currentLocation.name;

    const DAYS = 7;
    const monthCache = {};
    const prayers = [];
    const events = [];
    const toneFile = (ATHAN_SOUNDS[this.currentAthanTone] || ATHAN_SOUNDS["Hicaz"]).split("/").pop();
    const mode = this.notifMode;
    const rem = this.reminderMin;
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

        if (this.soundSettings[p.key]) {
          if (rem > 0) {
            events.push({
              t: t - rem * MIN, type: "reminder",
              title: `${name} vaktine ${rem} dk kaldı`,
              body: `${city} • ${x.str}`,
              mode: mode === "sessiz" ? "sessiz" : "bip"
            });
          }
          events.push({
            t, type: "athan",
            title: `${name} vakti girdi`,
            body: `${city} • ${x.str}`,
            tone: toneFile,
            // Güneş doğuşunda ezan okunmaz; yalnızca bildirim
            mode: (p.key === "gunes" && mode === "ezan") ? "bip" : mode
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

  // Vakit bildirimi türü: Ezan sesi → Bip (bildirim sesi) → Sessiz (sadece yazı)
  openPrayerModesModal() {
    const order = ["ezan", "bip", "sessiz"];
    this.notifMode = order[(order.indexOf(this.notifMode) + 1) % order.length];
    localStorage.setItem("tamvakti_notif_mode", this.notifMode);
    this.updateSettingsLabels();
    const msgs = {
      ezan: "Vakit girince ezan okunacak",
      bip: "Vakit girince bildirim sesi çalacak",
      sessiz: "Vakit bildirimleri sessiz olacak"
    };
    this.showToast(msgs[this.notifMode], "🔔", 2600);
    this.scheduleSync();
  }

  cycleReminderMinutes() {
    const minutes = [0, 5, 10, 15, 20, 30, 45];
    const nextVal = minutes[(minutes.indexOf(this.reminderMin) + 1) % minutes.length];
    this.reminderMin = nextVal;
    localStorage.setItem("tamvakti_reminder_min", String(nextVal));
    this.updateSettingsLabels();
    this.renderDayRibbon();
    this.showToast(nextVal === 0 ? "Vakit öncesi hatırlatma kapatıldı" : `Vakit çıkmadan ${nextVal} dk önce hatırlatılacak`, "⏱️", 2500);
    this.scheduleSync();
  }

  toggleKerahatAlert(checked) {
    this.kerahatAlert = !!checked;
    localStorage.setItem("tamvakti_kerahat_alert", this.kerahatAlert ? "true" : "false");
    this.showToast(this.kerahatAlert ? "Kerahat vakitlerinde bildirim gelecek" : "Kerahat bildirimi kapatıldı", "⚠️", 2500);
    this.scheduleSync();
  }

  cycleAthanTone() {
    const current = this.currentAthanTone || "Hicaz";
    const nextIndex = (ATHAN_ORDER.indexOf(current) + 1) % ATHAN_ORDER.length;
    const nextVal = ATHAN_ORDER[nextIndex];
    this.currentAthanTone = nextVal;
    localStorage.setItem("tamvakti_athan_tone", nextVal);

    const el = document.getElementById("settingsAthanTone");
    if (el) el.textContent = nextVal;

    if (this.athanAudio && !this.athanAudio.paused) {
      this.playAthanPreview();
    }
    this.showToast(`${nextVal} Makamı seçildi`, "🔊", 2000);
    this.scheduleSync();
  }

  toggleAthanPreview(event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    if (this.athanAudio && !this.athanAudio.paused) {
      this.stopAthanPreview();
    } else {
      this.playAthanPreview();
    }
  }

  playAthanPreview() {
    this.stopAthanPreview();

    const tone = this.currentAthanTone || "Hicaz";
    const soundFile = ATHAN_SOUNDS[tone] || ATHAN_SOUNDS["Hicaz"];

    const btn = document.getElementById("athanPreviewBtn");
    const icon = document.getElementById("athanPreviewIcon");
    const text = document.getElementById("athanPreviewText");

    try {
      this.athanAudio = new Audio(soundFile);
      this.athanAudio.onended = () => {
        this.stopAthanPreview();
      };
      this.athanAudio.onerror = () => {
        this.stopAthanPreview();
        this.showToast("Ezan sesi yüklenemedi", "⚠️");
      };

      if (btn) {
        btn.classList.remove("bg-sky-100", "text-sky-800");
        btn.classList.add("bg-amber-100", "text-amber-900", "ring-1", "ring-amber-300");
      }
      if (icon) icon.textContent = "⏹";
      if (text) text.textContent = "Durdur";

      this.athanAudio.play().catch(err => {
        console.warn("Audio play error:", err);
        this.stopAthanPreview();
      });
    } catch (err) {
      console.error(err);
      this.stopAthanPreview();
    }
  }

  stopAthanPreview() {
    if (this.athanAudio) {
      try {
        this.athanAudio.pause();
        this.athanAudio.currentTime = 0;
      } catch (e) {}
      this.athanAudio = null;
    }

    const btn = document.getElementById("athanPreviewBtn");
    const icon = document.getElementById("athanPreviewIcon");
    const text = document.getElementById("athanPreviewText");

    if (btn) {
      btn.classList.remove("bg-amber-100", "text-amber-900", "ring-1", "ring-amber-300");
      btn.classList.add("bg-sky-100", "text-sky-800");
    }
    if (icon) icon.textContent = "▶";
    if (text) text.textContent = "Dinle";
  }

  toggleAutoSilent(checked) {
    this.autoSilent = !!checked;
    localStorage.setItem("tamvakti_auto_silent", this.autoSilent ? "true" : "false");
    if (this.autoSilent) {
      const perm = this.getPermissionState();
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

  openIhtiyatModal() {
    this.cycleIhtiyat();
  }

  showWidgetInfo() {
    this.showToast("Ana ekrana uzun basarak Tam Vakti widget'ını ekleyebilirsiniz.", "🪟", 4000);
  }

  openAboutModal() {
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
    const cityName = this.currentLocation.name.includes(",")
      ? this.currentLocation.name.split(",")[1].trim()
      : this.currentLocation.name.includes("/")
      ? this.currentLocation.name.split("/")[1].trim()
      : this.currentLocation.name;
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
        { enableHighAccuracy: true, timeout: 8000 }
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
