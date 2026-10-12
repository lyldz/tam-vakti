/**
 * Tam Vakti - Minimalist Adaçayı Yeşili & Sade Vakit / Kıble Kontrolcüsü
 * Sürüm: v1.00.04
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

class TamVaktiApp {
  constructor() {
    this.engine = new PrayerEngine();
    this.compass = null;

    this.currentLocation = this.loadSavedLocation();
    this.currentTimes = null;
    this.activePrayerKey = null;

    // Ses Tercihleri
    this.soundSettings = this.loadSoundSettings();

    // Sabit Bildirim Tercihi (Varsayılan: Açık)
    this.ongoingNotifEnabled = this.loadOngoingNotifSetting();

    this.init();
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
    this.compass = new QiblaCompass("compassDial", "qiblaAngleVal", "compassStatusText");

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

    await this.updatePrayers();
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

    // Kıble Açısı
    const qiblaInfo = this.engine.calculateQibla(this.currentLocation.lat, this.currentLocation.lon);
    document.getElementById("qiblaAngleVal").textContent = `${qiblaInfo.angle}° GD`;
    document.getElementById("qiblaDistVal").textContent = `${qiblaInfo.distanceKm.toLocaleString('tr-TR')} km`;
    this.compass.setTargetQibla(qiblaInfo.angle);

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

    const mainEl = document.getElementById("miladiDateMain");
    if (mainEl) mainEl.textContent = `${dayNum} ${monthName} ${yearNum}`;

    // Hicri Takvim (Diyanet / civil uyumlu format: "Pazartesi • 29 Rebiülahir")
    const hicriEl = document.getElementById("hicriDateSub");
    if (hicriEl) {
      try {
        const parts = new Intl.DateTimeFormat('tr-TR-u-ca-islamic-civil', {
          day: 'numeric',
          month: 'long'
        }).formatToParts(now);
        const hDay = parts.find(p => p.type === 'day')?.value || '';
        const hMonth = parts.find(p => p.type === 'month')?.value || '';
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
      const isCurrent = item.key === this.activePrayerKey;
      const isNext = idx === nextIdx;
      const isPast = currentIdx >= 0 ? idx < currentIdx : false;
      const isSoundOn = this.soundSettings[item.key];

      let cardClass = "prayer-card-item";
      if (isCurrent) {
        cardClass += " current";
      } else if (isNext) {
        cardClass += " next";
      } else if (isPast) {
        cardClass += " past";
      }

      // Net ve kontrastlı ses ikonu
      const soundSvg = isSoundOn
        ? `<svg class="w-5 h-5 sound-icon-on" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>`
        : `<svg class="w-5 h-5 sound-icon-off" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /><path stroke-linecap="round" stroke-linejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>`;

      return `
        <div onclick="app.showPrayerDetail('${item.key}')" class="${cardClass}">
          
          <!-- Sol Kısım: Vektör İkon + Vakit Adı + (Şimdi Rozeti) -->
          <div class="card-left-part">
            <div class="card-icon-box">
              <img src="${item.iconSvg}" alt="${item.name}" class="drop-shadow-xs">
            </div>
            <div class="card-title-group">
              <span class="card-row-name">${item.name}</span>
              ${isCurrent ? `<span class="now-pill">Şimdi</span>` : ''}
            </div>
          </div>

          <!-- Sağ Kısım: Tabular Saat + Net Ses Butonu -->
          <div class="card-right-part">
            <span class="card-row-time">${timeVal}</span>
            <button onclick="app.toggleSound('${item.key}', event)" 
                    class="card-sound-btn"
                    title="${isSoundOn ? 'Ses Açık' : 'Sessiz'}">
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
    if (endLbl) {
      endLbl.textContent = `${current.nextName} ${current.nextTimeStr}`;
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
    } else if (tab === "qibla") {
      viewPrayer.classList.add("hidden");
      viewQibla.classList.remove("hidden");
      btnPrayer.classList.remove("active");
      btnQibla.classList.add("active");
      if (this.compass) {
        this.compass.startCompass();
      }
    }
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
          alert("GPS konumu alınamadı. Lütfen listeden şehir seçiniz.");
          if (btn) btn.textContent = "GPS ile Otomatik Bul";
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      alert("GPS desteği bulunamadı.");
      if (btn) btn.textContent = "GPS ile Otomatik Bul";
    }
  }

  openLocationModal() {
    document.getElementById("locationModal").classList.remove("hidden");
  }

  closeLocationModal() {
    document.getElementById("locationModal").classList.add("hidden");
  }

  openAboutModal() {
    document.getElementById("aboutModal").classList.remove("hidden");
  }

  closeAboutModal() {
    document.getElementById("aboutModal").classList.add("hidden");
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
});
