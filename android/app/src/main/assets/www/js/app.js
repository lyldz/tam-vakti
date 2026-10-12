/**
 * Tam Vakti - Özel Zümrüt Kubbe & Canlı İlerleyen Zaman Çizelgesi
 * Sürüm: 2026.10.12 (CalVer)
 */

const PRAYER_DETAILS = {
  imsak: {
    name: "İmsak",
    sub: "Sahur Sonu & Sabah Namazı",
    icon: "🌅",
    bgClass: "bg-amber-50 text-amber-600",
    rakahs: [
      { name: "2 Rekât Sünnet", type: "Sünnet-i Müekkede" },
      { name: "2 Rekât Farz", type: "Farz" }
    ],
    total: "4 Rekât",
    desc: "Yeme-içmenin sona erdiği ve sabah namazı vaktinin başladığı andır. Güneş doğuşuna kadar kılınabilir."
  },
  gunes: {
    name: "Güneş",
    sub: "Sabah Namazı Sonu (Kerahat)",
    icon: "🌄",
    bgClass: "bg-orange-50 text-orange-500",
    rakahs: [
      { name: "Güneş Doğuşu", type: "Kerahat Vakti" }
    ],
    total: "Kerahat",
    desc: "Güneş doğduktan sonraki ilk 45 dakika namaz kılmak mekruhtur. Güneş 45-50 dk yükseldikten sonra Kuşluk (Duhâ) namazı kılınabilir."
  },
  ogle: {
    name: "Öğle",
    sub: "Zeval Vakti Sonu",
    icon: "☀️",
    bgClass: "bg-yellow-50 text-amber-500",
    rakahs: [
      { name: "4 Rekât İlk Sünnet", type: "Sünnet-i Müekkede" },
      { name: "4 Rekât Farz", type: "Farz" },
      { name: "2 Rekât Son Sünnet", type: "Sünnet-i Müekkede" }
    ],
    total: "10 Rekât",
    desc: "Güneşin tepe noktasından batıya meyletmesiyle başlar, ikindiye kadar devam eder. Cuma günleri bu vakitte Cuma namazı kılınır."
  },
  ikindi: {
    name: "İkindi",
    sub: "Asr Vakti",
    icon: "🌤️",
    bgClass: "bg-emerald-50 text-emerald-600",
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
    icon: "🌇",
    bgClass: "bg-rose-50 text-rose-500",
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
    icon: "🌙",
    bgClass: "bg-indigo-50 text-indigo-600",
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
    this.dhikr = new DhikrManager();
    this.compass = null;

    this.currentLocation = this.loadSavedLocation();
    this.currentTimes = null;
    this.activePrayerKey = null;

    // Ses Tercihleri
    this.soundSettings = this.loadSoundSettings();

    this.init();
  }

  loadSavedLocation() {
    const saved = localStorage.getItem("tamvakti_active_location");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return { name: "Konya, Ilgın", lat: 38.2797, lon: 31.9142 };
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
    return { imsak: true, gunes: false, ogle: false, ikindi: false, aksam: true, yatsi: false };
  }

  saveSoundSettings() {
    localStorage.setItem("tamvakti_sound_settings", JSON.stringify(this.soundSettings));
  }

  toggleSound(key, event) {
    if (event) event.stopPropagation();
    this.soundSettings[key] = !this.soundSettings[key];
    this.saveSoundSettings();
    this.renderTimeline();
    if (this.soundSettings[key]) {
      this.playAlertTone();
    }
  }

  async init() {
    this.renderCitySelector();
    this.compass = new QiblaCompass("compassDial", "qiblaAngleVal", "compassStatusText");

    // Canlı Saat Sayacı (Her Saniye)
    setInterval(() => this.tick(), 1000);
    this.tick();

    await this.updatePrayers();

    this.initDhikrUI();
    this.initKazaUI();
    this.initImsakiyeUI();
  }

  async updatePrayers() {
    const now = new Date();
    document.getElementById("domeLocationText").textContent = this.currentLocation.name;

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

    // Alt Özet (İmsak & İftar)
    document.getElementById("subFajrTime").textContent = this.currentTimes.imsak;
    document.getElementById("subIftarTime").textContent = this.currentTimes.aksam;

    this.renderTimeline();
    this.evaluateCurrentPrayer();
  }

  renderTimeline() {
    const container = document.getElementById("prayerTimelineList");
    if (!container || !this.currentTimes) return;

    const items = [
      { key: "imsak", start: this.currentTimes.imsak, end: this.currentTimes.gunes },
      { key: "gunes", start: this.currentTimes.gunes, end: this.currentTimes.ogle },
      { key: "ogle", start: this.currentTimes.ogle, end: this.currentTimes.ikindi },
      { key: "ikindi", start: this.currentTimes.ikindi, end: this.currentTimes.aksam },
      { key: "aksam", start: this.currentTimes.aksam, end: this.currentTimes.yatsi },
      { key: "yatsi", start: this.currentTimes.yatsi, end: this.currentTimes.imsak }
    ];

    container.innerHTML = items.map(item => {
      const info = PRAYER_DETAILS[item.key];
      const isActive = item.key === this.activePrayerKey;
      const isSoundOn = this.soundSettings[item.key];

      const soundSvg = isSoundOn 
        ? `<svg class="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 24 24"><path d="M14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77zm-2.5-1.23L6.5 6H2v12h4.5l5 4V2z"/></svg>`
        : `<svg class="w-4 h-4 text-slate-400" fill="currentColor" viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>`;

      return `
        <div class="relative">
          <div class="timeline-node ${isActive ? 'active' : ''}"></div>

          <div onclick="app.showPrayerDetail('${item.key}')" 
               class="prayer-row-card ${isActive ? 'active-prayer' : ''}">
            
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-2xl ${info.bgClass} flex items-center justify-center text-lg shadow-2xs">
                ${info.icon}
              </div>

              <div>
                <h4 class="font-extrabold text-xs sm:text-sm text-slate-800 tracking-tight">
                  ${info.name}
                </h4>
                <p class="font-mono text-[11px] font-semibold text-slate-400 mt-0.5">
                  ${item.start} - ${item.end}
                </p>
              </div>
            </div>

            <button onclick="app.toggleSound('${item.key}', event)" 
                    class="sound-toggle-btn ${isSoundOn ? '' : 'muted'}"
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
      <div class="flex items-center justify-between p-2 rounded-xl bg-slate-50 text-xs">
        <span class="font-semibold text-slate-700">${r.name}</span>
        <span class="px-2 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 font-bold">${r.type}</span>
      </div>
    `).join("");

    document.getElementById("detailModal").classList.remove("hidden");
  }

  closePrayerDetail() {
    document.getElementById("detailModal").classList.add("hidden");
  }

  tick() {
    const now = new Date();

    // Üst Bar Canlı Saat (24 Saat Formatı)
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const s = String(now.getSeconds()).padStart(2, '0');
    const clockEl = document.getElementById("headerLiveClock");
    if (clockEl) clockEl.textContent = `${h}:${m}:${s}`;

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
      { key: "imsak", name: "İmsak Vakti", start: tImsak, end: tGunes, nextName: "Güneş Doğuşu", nextTime: tGunes },
      { key: "gunes", name: "Güneş (Kerahat)", start: tGunes, end: tOgle, nextName: "Öğle Vakti", nextTime: tOgle },
      { key: "ogle", name: "Öğle Vakti", start: tOgle, end: tIkindi, nextName: "İkindi Vakti", nextTime: tIkindi },
      { key: "ikindi", name: "İkindi Vakti", start: tIkindi, end: tAksam, nextName: "Akşam (İftar)", nextTime: tAksam },
      { key: "aksam", name: "Akşam Vakti", start: tAksam, end: tYatsi, nextName: "Yatsı Vakti", nextTime: tYatsi },
      { key: "yatsi", name: "Yatsı Vakti", start: tYatsi, end: new Date(tImsak.getTime() + 86400000), nextName: "İmsak (Sahur)", nextTime: new Date(tImsak.getTime() + 86400000) }
    ];

    let current = null;
    if (now < tImsak) {
      const prevYatsi = new Date(tYatsi.getTime() - 86400000);
      current = {
        key: "yatsi",
        name: "Yatsı Vakti (Gece)",
        start: prevYatsi,
        end: tImsak,
        nextName: "İmsak (Sahur)",
        nextTime: tImsak
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
      this.renderTimeline();
    }

    // 1. Kubbe İçindeki Vakit Başlığı
    document.getElementById("domeCurrentPrayerLabel").textContent = current.name;
    document.getElementById("sheetCurrentVakitBadge").textContent = current.name;

    // 2. Kalan Süre Canlı Geri Sayım (HH:MM:SS)
    const diffMs = Math.max(0, current.nextTime.getTime() - now.getTime());
    const totalMs = current.end.getTime() - current.start.getTime();
    const passedMs = Math.max(0, now.getTime() - current.start.getTime());

    const diffSec = Math.floor(diffMs / 1000);
    const hrs = Math.floor(diffSec / 3600);
    const mins = Math.floor((diffSec % 3600) / 60);
    const secs = diffSec % 60;

    document.getElementById("domeCountdownTimer").textContent = 
      `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    // Kalan Zamana Göre Akıllı Renk Skalası (Yeşil -> Sarı -> Turuncu -> Kırmızı)
    const remainingMinutes = Math.floor(diffMs / 60000);
    let arcColor = "#10b981"; // Canlı Zümrüt Yeşili (>90 dk)
    let shadowColor = "rgba(16, 185, 129, 0.7)";
    let urgencyText = "";

    if (remainingMinutes <= 20) {
      arcColor = "#ef4444"; // Kırmızı Alarm (Son 20 dakika!)
      shadowColor = "rgba(239, 68, 68, 0.85)";
      urgencyText = " ⚠️";
    } else if (remainingMinutes <= 45) {
      arcColor = "#f97316"; // Turuncu (Son 45 dakika - Vaktin çıkışı yaklaşıyor)
      shadowColor = "rgba(249, 115, 22, 0.8)";
      urgencyText = " ⏳";
    } else if (remainingMinutes <= 90) {
      arcColor = "#facc15"; // Altın Sarısı (45 - 90 dakika)
      shadowColor = "rgba(250, 204, 21, 0.7)";
    }

    // 3. Vakit İlerleme Yüzdesi ve Hedef Başlığı
    const percent = Math.min(100, Math.max(0, Math.round((passedMs / totalMs) * 100)));
    const targetEl = document.getElementById("domeTargetLabel");
    if (targetEl) {
      targetEl.textContent = `${current.nextName}'ne Kalan • %${percent}${urgencyText}`;
      targetEl.style.color = arcColor;
    }

    // 4. GÜNEŞ YAYININ ZAMAN VE RENK ENDEKSLİ CANLI İLERLEMESİ
    // Yay toplam çevre uzunluğu: 377px
    const arcPath = document.getElementById("solarArcProgressPath");
    if (arcPath) {
      const totalArcLength = 377;
      const progressFraction = Math.min(1, Math.max(0, passedMs / totalMs));
      const strokeOffset = totalArcLength - (totalArcLength * progressFraction);
      arcPath.style.strokeDashoffset = strokeOffset;
      arcPath.style.stroke = arcColor;
      arcPath.style.filter = `drop-shadow(0 0 10px ${shadowColor})`;
    }

    // 5. Kerahat Vakti Kontrolü
    const kerahatBadge = document.getElementById("kerahatPillBadge");
    const isMorningKerahat = now >= tGunes && (now.getTime() - tGunes.getTime()) < 45 * 60000;
    const isEveningKerahat = (tAksam.getTime() - now.getTime()) <= 45 * 60000 && now < tAksam;

    if (isMorningKerahat || isEveningKerahat) {
      kerahatBadge.classList.remove("hidden");
    } else {
      kerahatBadge.classList.add("hidden");
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
              <button onclick="app.selectLocation('${c.name}, ${d.name}', ${d.lat}, ${d.lon})"
                      class="text-[11px] px-2 py-0.5 rounded bg-slate-100 hover:bg-emerald-600 hover:text-white transition-colors">
                ${d.name}
              </button>
            `).join("")}
          </div>
        `;
      }

      return `
        <div class="border-b border-slate-100 py-2">
          <div class="flex items-center justify-between">
            <button onclick="app.selectLocation('${c.name}', ${c.lat}, ${c.lon})" 
                    class="font-semibold text-xs sm:text-sm text-slate-800 hover:text-emerald-600 text-left">
              ${c.name}
            </button>
            <span class="text-[10px] text-slate-400">${c.lat.toFixed(1)}°K, ${c.lon.toFixed(1)}°D</span>
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
          this.selectLocation("Bulunduğum Konum", lat, lon);
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

  // Zikirmatik
  initDhikrUI() {
    this.updateDhikrView(this.dhikr.getCurrentState());
  }

  onDhikrClick() {
    this.dhikr.increment((state) => this.updateDhikrView(state));
  }

  onDhikrReset() {
    this.dhikr.reset((state) => this.updateDhikrView(state));
  }

  updateDhikrView(state) {
    document.getElementById("dhikrWordDisplay").textContent = state.title;
    document.getElementById("dhikrMeaningDisplay").textContent = state.meaning;
    document.getElementById("dhikrCountDisplay").textContent = `${state.count} / ${state.target}`;
    const stageBadge = document.getElementById("dhikrStageBadge");
    if (stageBadge) stageBadge.textContent = `${state.stageIndex + 1} / 4 Aşama`;
  }

  // Kaza Defteri
  initKazaUI() {
    this.renderKazaTable();
  }

  renderKazaTable() {
    const records = this.dhikr.getKazaRecords();
    const keys = [
      { id: "sabah", name: "Sabah", icon: "🌙" },
      { id: "ogle", name: "Öğle", icon: "☀️" },
      { id: "ikindi", name: "İkindi", icon: "🌤️" },
      { id: "aksam", name: "Akşam", icon: "🌇" },
      { id: "yatsi", name: "Yatsı", icon: "🌌" },
      { id: "vitir", name: "Vitir", icon: "✨" },
      { id: "oruc", name: "Kaza Orucu", icon: "🍽️" }
    ];

    const container = document.getElementById("kazaGridContainer");
    if (!container) return;

    container.innerHTML = keys.map(k => `
      <div class="p-2.5 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span>${k.icon}</span>
          <span class="text-xs font-semibold text-slate-700">${k.name}</span>
        </div>
        <div class="flex items-center gap-2">
          <button onclick="app.modifyKaza('${k.id}', -1)" class="w-6 h-6 rounded bg-white hover:bg-rose-100 font-bold text-xs shadow-2xs">-</button>
          <span id="kazaVal-${k.id}" class="font-mono text-sm font-bold min-w-[28px] text-center">${records[k.id] || 0}</span>
          <button onclick="app.modifyKaza('${k.id}', 1)" class="w-6 h-6 rounded bg-white hover:bg-emerald-100 font-bold text-xs shadow-2xs">+</button>
        </div>
      </div>
    `).join("");
  }

  modifyKaza(key, delta) {
    const updated = this.dhikr.updateKaza(key, delta);
    const el = document.getElementById(`kazaVal-${key}`);
    if (el) el.textContent = updated[key];
  }

  // İmsakiye
  initImsakiyeUI() {
    const tableBody = document.getElementById("imsakiyeTableBody");
    if (!tableBody) return;

    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    let rows = "";

    for (let d = 1; d <= daysInMonth; d++) {
      const dayDate = new Date(now.getFullYear(), now.getMonth(), d);
      const times = this.engine.calculateTimesOffline(dayDate, this.currentLocation.lat, this.currentLocation.lon);
      const isToday = d === now.getDate();

      rows += `
        <tr class="${isToday ? 'bg-emerald-50 font-bold text-emerald-800' : 'border-b border-slate-100'} text-xs">
          <td class="py-1 px-1.5">${d}</td>
          <td class="py-1 px-1.5 font-mono">${times.imsak}</td>
          <td class="py-1 px-1.5 font-mono">${times.gunes}</td>
          <td class="py-1 px-1.5 font-mono">${times.ogle}</td>
          <td class="py-1 px-1.5 font-mono">${times.ikindi}</td>
          <td class="py-1 px-1.5 font-mono">${times.aksam}</td>
          <td class="py-1 px-1.5 font-mono">${times.yatsi}</td>
        </tr>
      `;
    }
    tableBody.innerHTML = rows;
  }

  // Sekme Değiştirici
  switchTab(tabId) {
    const tabs = ["home", "compass", "dhikr", "kaza", "imsakiye"];
    tabs.forEach(t => {
      const content = document.getElementById(`tabContent-${t}`);
      const btn = document.getElementById(`tabBtn-${t}`);
      if (content) {
        if (t === tabId) {
          content.classList.remove("hidden");
        } else {
          content.classList.add("hidden");
        }
      }
      if (btn) {
        if (t === tabId) {
          btn.classList.add("active");
        } else {
          btn.classList.remove("active");
        }
      }
    });

    if (tabId === "compass" && this.compass) {
      this.compass.startCompass();
    }
  }

  // Sesli Ton
  playAlertTone() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880.00, ctx.currentTime + 0.4);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.8);
    } catch (e) {}
  }
}

let app = null;
window.addEventListener("DOMContentLoaded", () => {
  app = new TamVaktiApp();
});
