/**
 * Tam Vakti - Minimalist Adaçayı Yeşili & Sade Vakit / Kıble Kontrolcüsü
 * Sürüm: v1.00.05
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
    this.currentVersion = "v2.2";
    this.versionCodename = "Kandil";
    this.versionDisplay = "v2.2 • Kandil";
    this.onboardingStep = 1;
    this.monthlyYear = null;
    this.monthlyMonth = null;
    this.updateInfo = null;
    this.isDownloadingUpdate = false;

    // Ezan Makamı & Ses Önizleme
    this.currentAthanTone = localStorage.getItem("tamvakti_athan_tone") || "Hicaz";
    this.athanAudio = null;
    this.autoSilent = localStorage.getItem("tamvakti_auto_silent") !== "false";
    this.themeMode = localStorage.getItem("tamvakti_theme_mode") || "Otomatik";

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

  toggleSound(key, event) {
    if (event) event.stopPropagation();
    this.soundSettings[key] = !this.soundSettings[key];
    this.saveSoundSettings();
    this.renderPrayerCards();
    if (this.soundSettings[key]) {
      this.playAlertTone();
    }
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
    const notifCheckbox = document.getElementById("ongoingNotifToggle");
    if (notifCheckbox) {
      notifCheckbox.checked = this.ongoingNotifEnabled;
    }

    // Android bildirim iznini ilk açılışta nazikçe iste
    if (this.ongoingNotifEnabled && window.AndroidBridge && window.AndroidBridge.requestNotificationPermission) {
      window.AndroidBridge.requestNotificationPermission();
    }

    // Canlı Saat & Tarih Sayacı
    setInterval(() => this.tick(), 1000);
    this.tick();

    // Tema Sistemini Başlat (Otomatik / Koyu / Açık)
    this.applyTheme(this.themeMode);
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (this.themeMode === "Otomatik") {
          this.applyTheme("Otomatik");
        }
      });
    }

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

    // Miladi Tarih
    this.updateMiladiDate();

    // Vakitleri Al
    this.currentTimes = await this.engine.getPrayerTimes(
      now, 
      this.currentLocation.lat, 
      this.currentLocation.lon
    );

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

    this.renderPrayerCards();
    this.evaluateCurrentPrayer();
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
    if (mainEl) mainEl.textContent = `${dayNum} ${monthName} ${yearNum}`;

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
        const parts = new Intl.DateTimeFormat('en-u-ca-islamic-civil', {
          day: 'numeric',
          month: 'numeric'
        }).formatToParts(now);
        const hDay = parts.find(p => p.type === 'day')?.value || '';
        const hMonthNum = parseInt(parts.find(p => p.type === 'month')?.value || '1', 10);
        const hMonth = islamicMonths[hMonthNum] || '';
        hicriEl.textContent = `${dayName} • ${hDay} ${hMonth}`;
      } catch (e) {
        hicriEl.textContent = dayName;
      }
    }
  }

  renderPrayerCards() {
    const container = document.getElementById("prayerCardsList");
    if (!container || !this.currentTimes) return;

    const orderKeys = ["imsak", "gunes", "ogle", "ikindi", "aksam", "yatsi"];
    const currentIdx = orderKeys.indexOf(this.activePrayerKey);
    const nextIdx = currentIdx >= 0 ? (currentIdx + 1) % 6 : -1;

    container.innerHTML = PRAYER_LIST.map((item, idx) => {
      const timeVal = this.currentTimes[item.key] || "--:--";
      const isNext = (idx === nextIdx);
      
      // Geçmiş vakit: Sıradaki vakitten öncekiler tamamen soluklaştırılır (Güneş de dahil)
      let isPast = false;
      if (nextIdx === 0) {
        // Eğer sıradaki yarınki İmsak ise, bugünün tüm vakitleri geçmiştir
        isPast = (idx !== 0);
      } else {
        isPast = (idx < nextIdx);
      }

      const isSoundOn = this.soundSettings[item.key];

      let cardClass = "prayer-card-item";
      if (isNext) {
        cardClass += " next";
      } else if (isPast) {
        cardClass += " past";
      }

      // Cuma günleri Öğle vaktinin adı "Cuma (Öğle)" olarak gösterilir
      let displayName = item.name;
      if (item.key === "ogle" && this.isFriday) {
        displayName = "Cuma (Öğle)";
      }

      // Net ve kontrastlı ses ikonu
      const soundSvg = isSoundOn
        ? `<svg class="w-5 h-5 sound-icon-on" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>`
        : `<svg class="w-5 h-5 sound-icon-off" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /><path stroke-linecap="round" stroke-linejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>`;

      return `
        <div onclick="app.showPrayerDetail('${item.key}')" class="${cardClass}">
          
          <!-- Sol Kısım: Vektör İkon + Vakit Adı + Arapça Hat + Sıradaki Rozeti -->
          <div class="card-left-part">
            <div class="card-icon-box">
              <img src="${item.iconSvg}" alt="${displayName}" class="drop-shadow-xs">
            </div>
            <div class="card-title-group">
              <div class="flex items-center gap-2">
                <span class="card-row-name">${displayName}</span>
                <span class="card-arabic-sub font-serif text-[11px] opacity-60">${item.arabic || ''}</span>
              </div>
              ${isNext ? `<span class="next-pill flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-white inline-block animate-ping"></span>Sıradaki</span>` : ''}
            </div>
          </div>

          <!-- Sağ Kısım: Tabular Saat + Erken Hatırlatma (-15dk) + Net Ses Butonu -->
          <div class="card-right-part flex items-center gap-2">
            <span class="card-row-time font-serif">${timeVal}</span>
            ${(isNext && isSoundOn) ? `<span class="early-reminder-pill">-15dk</span>` : ''}
            <button onclick="app.toggleSound('${item.key}', event)" 
                    class="card-sound-btn"
                    title="${isSoundOn ? '15 Dk Önce Hatırlatıcı Açık' : 'Sessiz'}">
              ${soundSvg}
            </button>
          </div>

        </div>
      `;
    }).join("");

    this.renderDayRibbon();
    this.updateSolarTransitCurve();
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
          <span class="text-[10px] tracking-tight ${nameColor}">${displayName}</span>
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
    document.getElementById("detailModalDesc").textContent = info.desc;
    document.getElementById("detailModalTotal").textContent = info.total;

    const listEl = document.getElementById("detailModalRakahs");
    listEl.innerHTML = info.rakahs.map(r => `
      <div class="flex items-center justify-between p-2 rounded-2xl bg-emerald-50/50 text-xs">
        <span class="font-bold text-[#0f3e2e]">${r.name}</span>
        <span class="px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-extrabold">${r.type}</span>
      </div>
    `).join("");

    document.getElementById("detailModal").classList.remove("hidden");
  }

  closePrayerDetail() {
    document.getElementById("detailModal").classList.add("hidden");
  }

  tick() {
    if (this.currentTimes) {
      this.evaluateCurrentPrayer();
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
      this.renderPrayerCards();
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

    // Sub-times Reference: "İkindi 15:31 • Akşam 17:56"
    const subTimesEl = document.getElementById("subTimesLabel");
    if (subTimesEl) {
      const startTimeVal = this.currentTimes[current.key] || "--:--";
      subTimesEl.innerHTML = `<span>${current.name} ${startTimeVal}</span><span class="opacity-40">•</span><span>${current.nextName} ${current.nextTimeStr}</span>`;
    }

    // 3. İlerleme Çizgisi: Mevcut vakitten sonraki vakte ne kadar süre geçti
    const totalDuration = Math.max(1, current.end.getTime() - current.start.getTime());
    const elapsed = Math.min(Math.max(0, now.getTime() - current.start.getTime()), totalDuration);
    const pct = ((elapsed / totalDuration) * 100).toFixed(1);

    const barEl = document.getElementById("prayerProgressBar");
    if (barEl) {
      barEl.style.width = `${pct}%`;
    }

    // Horizon 2B Core Bar Elements
    const hPassed = document.getElementById("horizonPassedSegment");
    if (hPassed) {
      hPassed.style.width = `${pct}%`;
    }
    const hStartName = document.getElementById("horizonStartName");
    if (hStartName) hStartName.textContent = current.name.toUpperCase();
    const hStartTime = document.getElementById("horizonStartTime");
    if (hStartTime) hStartTime.textContent = this.currentTimes[current.key] || "--:--";
    const hEndName = document.getElementById("horizonEndName");
    if (hEndName) hEndName.textContent = current.nextName.toUpperCase();
    const hEndTime = document.getElementById("horizonEndTime");
    if (hEndTime) hEndTime.textContent = current.nextTimeStr || "--:--";

    const elapsedHrs = Math.floor(elapsed / 3600000);
    const elapsedMins = Math.floor((elapsed % 3600000) / 60000);
    const hElapsedText = document.getElementById("horizonElapsedText");
    if (hElapsedText) {
      hElapsedText.textContent = `${elapsedHrs}s ${elapsedMins}dk`;
    }

    const startLbl = document.getElementById("progressStartLabel");
    if (startLbl) {
      const startTimeStr = this.currentTimes[current.key] || "--:--";
      startLbl.textContent = `${current.name} ${startTimeStr}`;
    }

    const endLbl = document.getElementById("progressEndLabel");
    const kStartZone = document.getElementById("kerahatStartZone");
    const kEndZone = document.getElementById("kerahatEndZone");
    const hKerahatBadge = document.getElementById("horizonKerahatBadge");
    const hKerahatZone = document.getElementById("horizonKerahatZone");
    const hKerahatRemain = document.getElementById("horizonKerahatRemainText");
    const statusTitle = document.getElementById("statusTitleText");
    const statusSubtitle = document.getElementById("statusSubtitleText");

    if (current.key === "gunes") {
      const kerahatStr = this.getKerahatTime(tOgle, 45);
      if (endLbl) {
        endLbl.innerHTML = `<span class="inline-block w-2 h-2 rounded-full bg-amber-500 mr-0.5"></span> Kerahat: ${kerahatStr}`;
      }
      if (kStartZone) {
        const startPct = Math.min(25, Math.max(8, (45 * 60 * 1000 / totalDuration) * 100));
        kStartZone.style.width = `${startPct.toFixed(1)}%`;
        kStartZone.classList.remove("hidden");
      }
      if (kEndZone) {
        const endPct = Math.min(25, Math.max(8, (45 * 60 * 1000 / totalDuration) * 100));
        kEndZone.style.width = `${endPct.toFixed(1)}%`;
        kEndZone.classList.remove("hidden");
      }
      if (hKerahatZone) {
        hKerahatZone.style.width = "25%";
        hKerahatZone.classList.remove("hidden");
      }
      const msUntilKerahat = (tOgle.getTime() - 45 * 60000) - now.getTime();
      const minsUntil = Math.floor(msUntilKerahat / 60000);
      if (minsUntil > 0) {
        if (hKerahatBadge) hKerahatBadge.innerHTML = `⚠️ Kerahat ${kerahatStr}`;
        if (hKerahatRemain) hKerahatRemain.textContent = `Kerahate ${minsUntil} dk`;
        if (statusTitle) statusTitle.innerHTML = `Kerahat vaktine <span class="text-secondary font-bold">${minsUntil} dk</span> kaldı`;
        if (statusSubtitle) statusSubtitle.textContent = "Öğle öncesi kerahet (istiva) vaktine dikkat ediniz.";
      } else {
        if (hKerahatBadge) hKerahatBadge.innerHTML = `⚠️ Kerahat Vakti`;
        if (hKerahatRemain) hKerahatRemain.textContent = `Kerahat Vaktindesiniz`;
        if (statusTitle) statusTitle.innerHTML = `<span class="text-secondary font-bold">Kerahat Vaktindesiniz</span>`;
        if (statusSubtitle) statusSubtitle.textContent = "Güneş tam tepe noktasındayken namaz mekruhtur.";
      }
    } else if (current.key === "ikindi") {
      const kerahatStr = this.getKerahatTime(tAksam, 45);
      if (endLbl) {
        endLbl.innerHTML = `<span class="inline-block w-2 h-2 rounded-full bg-amber-500 mr-0.5"></span> Kerahat: ${kerahatStr}`;
      }
      if (kStartZone) kStartZone.classList.add("hidden");
      if (kEndZone) {
        const endPct = Math.min(30, Math.max(12, (45 * 60 * 1000 / totalDuration) * 100));
        kEndZone.style.width = `${endPct.toFixed(1)}%`;
        kEndZone.classList.remove("hidden");
      }
      if (hKerahatZone) {
        const endPct = Math.min(32, Math.max(14, (45 * 60 * 1000 / totalDuration) * 100));
        hKerahatZone.style.width = `${endPct.toFixed(1)}%`;
        hKerahatZone.classList.remove("hidden");
      }
      const msUntilKerahat = (tAksam.getTime() - 45 * 60000) - now.getTime();
      const minsUntil = Math.floor(msUntilKerahat / 60000);
      if (minsUntil > 0) {
        if (hKerahatBadge) hKerahatBadge.innerHTML = `⚠️ Kerahat ${kerahatStr}`;
        if (hKerahatRemain) hKerahatRemain.textContent = `Kerahate ${minsUntil} dk`;
        if (statusTitle) statusTitle.innerHTML = `Kerahat vaktine <span class="text-secondary font-bold">${minsUntil} dk</span> kaldı`;
        if (statusSubtitle) statusSubtitle.textContent = "İbadet için uygun zaman dilimi. Farz namazını geciktirmeyiniz.";
      } else {
        if (hKerahatBadge) hKerahatBadge.innerHTML = `⚠️ Kerahat Vakti`;
        if (hKerahatRemain) hKerahatRemain.textContent = `Kerahat Vaktindesiniz`;
        if (statusTitle) statusTitle.innerHTML = `<span class="text-secondary font-bold">Kerahat Vaktindesiniz</span>`;
        if (statusSubtitle) statusSubtitle.textContent = "Güneş batarken kerahet vaktidir (mekruh vakit).";
      }
    } else {
      if (endLbl) {
        endLbl.textContent = `${current.nextName} ${current.nextTimeStr}`;
      }
      if (kStartZone) kStartZone.classList.add("hidden");
      if (kEndZone) kEndZone.classList.add("hidden");
      if (hKerahatZone) hKerahatZone.classList.add("hidden");
      if (hKerahatBadge) hKerahatBadge.innerHTML = `✨ İbadet Vakti`;
      if (hKerahatRemain) hKerahatRemain.textContent = `Kerahat Yok`;
      if (statusTitle) statusTitle.innerHTML = `Vaktin bereketi üzerinize olsun`;
      if (statusSubtitle) statusSubtitle.textContent = "Namaz dinin direğidir; vaktinde dosdoğru eda ediniz.";
    }

    // Sunset Micro Stat
    const sunsetEl = document.getElementById("sunsetStat");
    if (sunsetEl && this.currentTimes) {
      sunsetEl.textContent = this.currentTimes.aksam || "--:--";
    }

    // Namaz Takip Butonu Durumu
    this.updatePrayerLogButton(current.key, current.name);

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

  getTodayDateString() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }

  isPrayerLogged(key) {
    if (!key) return false;
    const dateStr = this.getTodayDateString();
    return localStorage.getItem(`tamvakti_prayer_logged_${dateStr}_${key}`) === "true";
  }

  updatePrayerLogButton(key, prayerName) {
    const btn = document.getElementById("prayerLogBtn");
    if (!btn || !key) return;
    const logged = this.isPrayerLogged(key);
    const labelName = prayerName || (this.activePrayerKey ? this.activePrayerKey.toUpperCase() : "Vakit");
    if (logged) {
      btn.classList.add("bg-sky-500/20", "border-sky-400/60", "text-sky-300");
      btn.classList.remove("text-slate-200");
      btn.innerHTML = `
        <span class="w-4 h-4 rounded-full bg-sky-400 text-slate-950 flex items-center justify-center text-[10px] font-black">✓</span>
        <span class="text-xs font-semibold tracking-wide">${labelName} Namazı Kılındı ✓</span>
      `;
    } else {
      btn.classList.remove("bg-sky-500/20", "border-sky-400/60", "text-sky-300");
      btn.classList.add("text-slate-200");
      btn.innerHTML = `
        <span class="w-4 h-4 rounded-full border border-slate-400/60 flex items-center justify-center text-[10px]">○</span>
        <span class="text-xs font-semibold tracking-wide">${labelName} Namazını Kıldım</span>
      `;
    }
  }

  togglePrayerLog() {
    if (!this.activePrayerKey) return;
    const key = this.activePrayerKey;
    const dateStr = this.getTodayDateString();
    const currentStatus = this.isPrayerLogged(key);
    const newStatus = !currentStatus;
    localStorage.setItem(`tamvakti_prayer_logged_${dateStr}_${key}`, newStatus ? "true" : "false");
    
    const prayerObj = PRAYER_LIST.find(p => p.key === key);
    const name = prayerObj ? prayerObj.name : key;
    this.updatePrayerLogButton(key, name);

    if (newStatus) {
      this.showToast(`${name} namazı eda edildi olarak kaydedildi. Allah kabul etsin.`, "🤲");
    } else {
      this.showToast(`${name} namazı kaydı kaldırıldı.`, "ℹ️");
    }
  }

  toggleAllPrayersList() {
    const container = document.getElementById("allPrayersContainer");
    const label = document.getElementById("toggleAllPrayersLabel");
    if (!container) return;
    const isHidden = container.classList.contains("hidden");
    if (isHidden) {
      container.classList.remove("hidden");
      if (label) label.textContent = "▲ Detaylı Vakitleri Gizle";
    } else {
      container.classList.add("hidden");
      if (label) label.textContent = "▼ Tüm Vakitleri Göster";
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

      tableBody.innerHTML = data.days.map(d => {
        const rowClass = d.isToday ? 'monthly-row-today' : (d.isFriday ? 'monthly-row-friday' : '');
        const rowId = d.isToday ? 'id="monthlyRow-today"' : '';
        const todayBadge = d.isToday ? '<span class="monthly-today-badge">Bugün</span>' : '';
        const friDot = d.isFriday && !d.isToday ? ' •' : '';

        return `
          <tr ${rowId} class="${rowClass} hover:bg-emerald-50/40 transition-colors">
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
          html: '<div style="width:16px;height:16px;border-radius:50%;background:#059669;border:3px solid #ffffff;box-shadow:0 0 10px rgba(5,150,105,0.9);"></div>',
          iconSize: [16, 16],
          iconAnchor: [8, 8]
        });

        this.qiblaMapUserMarker = L.marker([userLat, userLon], { icon: userIcon }).addTo(this.qiblaMap)
          .bindPopup(`<b>Bulunduğunuz Yer</b><br>${this.currentLocation.name}`);

        this.qiblaMapKaabaMarker = L.marker([kaabaLat, kaabaLon], { icon: kaabaIcon }).addTo(this.qiblaMap)
          .bindPopup("<b>Mekke-i Mükerreme</b><br>Kâbe-i Muazzama");

        this.qiblaMapLine = L.polyline([[userLat, userLon], [kaabaLat, kaabaLon]], {
          color: '#059669',
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
        <div class="border-b border-slate-100 dark:border-emerald-900/15 py-2">
          <div class="flex items-center justify-between">
            <button onclick="app.selectLocation('${c.name.replace(/'/g, "\\'")}', ${c.lat}, ${c.lon})" 
                    class="font-extrabold text-sm text-[#0f3e2e] dark:text-emerald-100 hover:text-emerald-700 dark:hover:text-emerald-400 text-left flex-1 cursor-pointer">
              ${c.name}
            </button>
            ${hasDistricts ? `
              <button onclick="app.toggleCityDistricts(${c.id})" 
                      id="cityExpandBtn-${c.id}"
                      class="text-[10px] px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors cursor-pointer flex items-center gap-1">
                <span>${allDistricts.length} ilçe</span>
                <svg class="w-3 h-3 transition-transform ${showDistricts ? 'rotate-180' : ''}" id="cityExpandIcon-${c.id}" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/></svg>
              </button>
            ` : `
              <span class="text-[10px] text-slate-400 dark:text-emerald-700 font-medium">${c.lat.toFixed(2)}°K</span>
            `}
          </div>
          ${hasDistricts ? `
            <div id="cityDistricts-${c.id}" class="mt-1.5 pl-1 ${showDistricts ? '' : 'hidden'}">
              <div class="flex flex-wrap gap-1">
                ${(q && !cityMatch ? matchingDistricts : allDistricts).map(d => `
                  <button onclick="app.selectLocation('${c.name.replace(/'/g, "\\'")}/${d.name.replace(/'/g, "\\'")}', ${d.lat}, ${d.lon})"
                          class="text-[11px] px-2.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-900 dark:text-emerald-200 hover:bg-emerald-700 hover:text-white font-semibold transition-colors cursor-pointer border border-emerald-100 dark:border-emerald-800/30">
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
        <div class="text-sm font-bold text-slate-400 dark:text-emerald-600">Sonuç bulunamadı</div>
        <div class="text-[11px] text-slate-300 dark:text-emerald-700 mt-1">Farklı bir arama deneyin</div>
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
    const themeEl = document.getElementById("settingsThemeMode");
    if (themeEl) {
      themeEl.textContent = this.themeMode || "Otomatik";
    }
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

  requestExactAlarmSetting() {
    if (window.AndroidBridge && window.AndroidBridge.openExactAlarmSettings) {
      window.AndroidBridge.openExactAlarmSettings();
    } else {
      this.showToast("Tam zamanlı alarm izni sistemde etkindir.", "✓");
    }
  }

  sendTestNotification() {
    if (window.AndroidBridge && window.AndroidBridge.showOngoingPrayerNotification) {
      const nextTarget = Date.now() + 15 * 60 * 1000;
      window.AndroidBridge.showOngoingPrayerNotification(
        (this.currentLocation && !this.currentLocation.isPlaceholder) ? this.currentLocation.name : "Tam Vakti",
        "Akşam (Test)",
        "18:26",
        nextTarget
      );
    }
    this.playAlertTone();
    if (window.AndroidBridge && window.AndroidBridge.vibrateDevice) {
      window.AndroidBridge.vibrateDevice(200);
    } else if (navigator.vibrate) {
      navigator.vibrate(200);
    }
    this.showToast("Test bildirimi ve ezan sesi gönderildi!", "🔔");
  }

  openPrayerModesModal() {
    this.showToast("Vakit bildirim sesini ana ekrandaki hoparlör simgesinden değiştirebilirsiniz.", "💡", 4000);
  }

  cycleReminderMinutes() {
    const minutes = [10, 15, 20, 30, 45];
    const el = document.getElementById("settingsReminderTime");
    const current = el ? parseInt(el.textContent) || 15 : 15;
    const nextIndex = (minutes.indexOf(current) + 1) % minutes.length;
    const nextVal = minutes[nextIndex];
    if (el) el.textContent = `${nextVal} dk önce`;
    this.showToast(`Vakit çıkmadan ${nextVal} dk önce hatırlatılacak`, "⏱️", 2500);
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
        btn.classList.remove("bg-emerald-100", "text-emerald-800");
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
      btn.classList.add("bg-emerald-100", "text-emerald-800");
    }
    if (icon) icon.textContent = "▶";
    if (text) text.textContent = "Dinle";
  }

  toggleAutoSilent(checked) {
    this.autoSilent = !!checked;
    localStorage.setItem("tamvakti_auto_silent", this.autoSilent ? "true" : "false");
    if (this.autoSilent) {
      this.showToast("Namaz esnasında telefon otomatik sessize alınacak.", "📵", 3000);
    } else {
      this.showToast("Otomatik sessize alma kapatıldı.", "🔔", 2500);
    }
  }

  openIhtiyatModal() {
    this.showToast("Hesaplama yöntemi: Diyanet İşleri Başkanlığı (±0 dk)", "🎛️", 3500);
  }

  applyTheme(mode) {
    let isDark = false;
    if (mode === "Koyu") {
      isDark = true;
    } else if (mode === "Açık") {
      isDark = false;
    } else {
      // Otomatik: Sistem renk düzenini denetle
      isDark = !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }

    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }

  cycleTheme() {
    const themes = ["Otomatik", "Koyu", "Açık"];
    const current = this.themeMode || "Otomatik";
    const nextIndex = (themes.indexOf(current) + 1) % themes.length;
    const nextVal = themes[nextIndex];
    this.themeMode = nextVal;
    localStorage.setItem("tamvakti_theme_mode", nextVal);

    this.applyTheme(nextVal);

    const el = document.getElementById("settingsThemeMode");
    if (el) el.textContent = nextVal;
    this.showToast(`Görünüm teması: ${nextVal}`, "🎨", 2000);
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
        content = content.replace(/\*\*(.*?)\*\*/g, "<strong class='text-emerald-950 font-bold'>$1</strong>");
        bulletItems.push(content);
      } else if (trimmed.length > 5 && !trimmed.startsWith("```")) {
        let content = trimmed.replace(/\*\*(.*?)\*\*/g, "<strong class='text-emerald-950 font-bold'>$1</strong>");
        bulletItems.push(content);
      }
    }

    if (bulletItems.length === 0) {
      return `<div class="p-1 text-slate-700">${rawText.replace(/\n/g, "<br>")}</div>`;
    }

    return bulletItems.map(item => `
      <div class="flex items-start gap-2 py-1.5 border-b border-emerald-900/5 last:border-0">
        <span class="text-emerald-600 text-sm leading-none mt-0.5">•</span>
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
    }

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
