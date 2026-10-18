/**
 * Tam Vakti - Minimalist Adaçayı Yeşili & Sade Vakit / Kıble Kontrolcüsü
 * Sürüm: v1.00.05
 */

const PRAYER_LIST = [
  { key: "imsak", name: "İmsak", iconSvg: "assets/icons/imsak.svg" },
  { key: "gunes", name: "Güneş", iconSvg: "assets/icons/gunes.svg" },
  { key: "ogle", name: "Öğle", iconSvg: "assets/icons/ogle.svg" },
  { key: "ikindi", name: "İkindi", iconSvg: "assets/icons/ikindi.svg" },
  { key: "aksam", name: "Akşam", iconSvg: "assets/icons/aksam.svg" },
  { key: "yatsi", name: "Yatsı", iconSvg: "assets/icons/yatsi.svg" }
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
    this.currentVersion = "v1.04";
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
      try { return JSON.parse(saved); } catch (e) {}
    }
    return { name: "Ilgın", lat: 38.2797, lon: 31.9142 };
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

    // Arka planda sessizce yeni GitHub sürümünü denetle
    setTimeout(() => this.checkForUpdates(true), 2500);
  }

  async updatePrayers() {
    const now = new Date();
    
    // Şehir Rozeti
    const displayName = this.currentLocation.name.includes(",") 
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

    // Kıble Açısı ve Mesafe
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
          
          <!-- Sol Kısım: Vektör İkon + Vakit Adı + Sıradaki Rozeti -->
          <div class="card-left-part">
            <div class="card-icon-box">
              <img src="${item.iconSvg}" alt="${displayName}" class="drop-shadow-xs">
            </div>
            <div class="card-title-group">
              <span class="card-row-name">${displayName}</span>
              ${isNext ? `<span class="next-pill">Sıradaki</span>` : ''}
            </div>
          </div>

          <!-- Sağ Kısım: Tabular Saat + Erken Hatırlatma (-15dk) + Net Ses Butonu -->
          <div class="card-right-part flex items-center gap-2">
            <span class="card-row-time">${timeVal}</span>
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
    if (nextLabel) {
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
      nextLabel.textContent = `${suffixName} kalan · ${current.nextTimeStr}`;
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

    // 3. İlerleme Çizgisi: Mevcut vakitten sonraki vakte ne kadar süre geçti
    const totalDuration = Math.max(1, current.end.getTime() - current.start.getTime());
    const elapsed = Math.min(Math.max(0, now.getTime() - current.start.getTime()), totalDuration);
    const pct = ((elapsed / totalDuration) * 100).toFixed(1);

    const barEl = document.getElementById("prayerProgressBar");
    if (barEl) {
      barEl.style.width = `${pct}%`;
    }

    const startLbl = document.getElementById("progressStartLabel");
    if (startLbl) {
      const startTimeStr = this.currentTimes[current.key] || "--:--";
      startLbl.textContent = `${current.name} ${startTimeStr}`;
    }

    const endLbl = document.getElementById("progressEndLabel");
    const kStartZone = document.getElementById("kerahatStartZone");
    const kEndZone = document.getElementById("kerahatEndZone");

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
    } else if (current.key === "ikindi") {
      const kerahatStr = this.getKerahatTime(tAksam, 45);
      if (endLbl) {
        endLbl.innerHTML = `<span class="inline-block w-2 h-2 rounded-full bg-amber-500 mr-0.5"></span> Kerahat: ${kerahatStr}`;
      }
      if (kStartZone) kStartZone.classList.add("hidden");
      if (kEndZone) {
        const endPct = Math.min(25, Math.max(8, (45 * 60 * 1000 / totalDuration) * 100));
        kEndZone.style.width = `${endPct.toFixed(1)}%`;
        kEndZone.classList.remove("hidden");
      }
    } else {
      if (endLbl) {
        endLbl.textContent = `${current.nextName} ${current.nextTimeStr}`;
      }
      if (kStartZone) kStartZone.classList.add("hidden");
      if (kEndZone) kEndZone.classList.add("hidden");
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

  // Sekme Değiştirici: Vakitler / Kıble
  switchTab(tab) {
    const viewPrayer = document.getElementById("viewPrayer");
    const viewQibla = document.getElementById("viewQibla");
    const btnPrayer = document.getElementById("tabBtn-prayer");
    const btnQibla = document.getElementById("tabBtn-qibla");

    if (tab === "prayer") {
      viewPrayer.classList.remove("hidden");
      viewQibla.classList.add("hidden");
      btnPrayer.classList.add("active");
      btnQibla.classList.remove("active");
      if (this.compass) {
        this.compass.stopCompass();
      }
    } else if (tab === "qibla") {
      viewPrayer.classList.add("hidden");
      viewQibla.classList.remove("hidden");
      btnPrayer.classList.remove("active");
      btnQibla.classList.add("active");
      if (this.qiblaMode === "compass") {
        if (this.compass) {
          this.compass.startCompass();
        }
      } else if (this.qiblaMode === "map") {
        this.initQiblaMap();
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

    listEl.innerHTML = TURKEY_CITIES.map(c => {
      let subOptions = "";
      if (c.districts && c.districts.length > 0) {
        subOptions = `
          <div class="flex flex-wrap gap-1 mt-1 pl-2">
            ${c.districts.map(d => `
              <button onclick="app.selectLocation('${d.name}', ${d.lat}, ${d.lon})"
                      class="text-[11px] px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-900 hover:bg-emerald-700 hover:text-white font-semibold transition-colors">
                ${d.name}
              </button>
            `).join("")}
          </div>
        `;
      }

      return `
        <div class="border-b border-slate-100 py-2.5">
          <div class="flex items-center justify-between">
            <button onclick="app.selectLocation('${c.name}', ${c.lat}, ${c.lon})" 
                    class="font-extrabold text-sm text-[#0f3e2e] hover:text-emerald-700 text-left">
              ${c.name}
            </button>
            <span class="text-[10px] text-slate-400 font-medium">${c.lat.toFixed(1)}°K, ${c.lon.toFixed(1)}°D</span>
          </div>
          ${subOptions}
        </div>
      `;
    }).join("");
  }

  selectLocation(name, lat, lon) {
    this.saveLocation({ name, lat, lon });
    this.closeLocationModal();
    this.updatePrayers();
  }

  locateWithGPS() {
    const btn = document.getElementById("gpsLocateBtn");
    if (btn) btn.textContent = "Konum alınıyor...";

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          this.selectLocation("Konumum", lat, lon);
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
    document.getElementById("locationModal").classList.remove("hidden");
  }

  closeLocationModal() {
    document.getElementById("locationModal").classList.add("hidden");
  }

  openSettingsModal() {
    const modal = document.getElementById("settingsModal");
    if (modal) modal.classList.remove("hidden");
    const locDesc = document.getElementById("settingsLocationDesc");
    if (locDesc) {
      locDesc.textContent = `${this.currentLocation.name || "Ilgın"} • Otomatik`;
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
        this.currentLocation.name || "Ilgın",
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
