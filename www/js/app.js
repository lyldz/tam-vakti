/**
 * Tam Vakti - Ana Uygulama Kontrolcüsü
 * Sürüm: 2026.10.12 (CalVer)
 */

// Vakit Açıklamaları ve Rekât Bilgileri
const PRAYER_DETAILS = {
  imsak: {
    name: "İmsak",
    sub: "Sahur & Sabah Namazı Başlangıcı",
    rakahs: [
      { name: "2 Rekât Sünnet", type: "Sünnet-i Müekkede" },
      { name: "2 Rekât Farz", type: "Farz" }
    ],
    total: "4 Rekât",
    desc: "Yeme-içmenin sona erdiği ve sabah namazı vaktinin başladığı andır. Sabah namazı Güneş doğuşuna kadar kılınabilir."
  },
  gunes: {
    name: "Güneş",
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
    desc: "Güneşin tam tepe noktasından batıya meyletmesiyle başlar, ikindiye kadar devam eder. Cuma günleri Cuma namazı bu vakitte kılınır."
  },
  ikindi: {
    name: "İkindi",
    sub: "Asr Vakti",
    rakahs: [
      { name: "4 Rekât Sünnet", type: "Sünnet-i Gayr-i Müekkede" },
      { name: "4 Rekât Farz", type: "Farz" }
    ],
    total: "8 Rekât",
    desc: "Güneşin batmasına 45 dakika kalana kadar ikindi kılınmalıdır. Son 45 dakika kerahet vaktidir."
  },
  aksam: {
    name: "Akşam",
    sub: "İftar / Mağrib",
    rakahs: [
      { name: "3 Rekât Farz", type: "Farz" },
      { name: "2 Rekât Sünnet", type: "Sünnet-i Müekkede" },
      { name: "6 Rekât Evvâbîn", type: "Müstehab (Nafile)" }
    ],
    total: "5 Rekât",
    desc: "Güneşin batmasıyla başlar. Oruçlular için iftar vaktidir. Akşam namazında önce farz kılınır."
  },
  yatsi: {
    name: "Yatsı",
    sub: "İşa & Vitir",
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

    // Aktif Lokasyon (Varsayılan: Konya Ilgın veya kaydedilmiş)
    this.currentLocation = this.loadSavedLocation();
    this.currentTimes = null;
    this.activePrayerKey = null;

    this.init();
  }

  loadSavedLocation() {
    const saved = localStorage.getItem("tamvakti_active_location");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    // Varsayılan Konya Ilgın
    return { name: "Konya / Ilgın", lat: 38.2797, lon: 31.9142 };
  }

  saveLocation(loc) {
    this.currentLocation = loc;
    localStorage.setItem("tamvakti_active_location", JSON.stringify(loc));
  }

  async init() {
    this.renderCitySelector();
    this.compass = new QiblaCompass("compassDial", "qiblaAngleText", "compassStatusText");

    // Canlı Saat Sayacı (Her Saniye)
    setInterval(() => this.tick(), 1000);
    this.tick();

    // Vakitleri Yükle
    await this.updatePrayers();

    // Zikir ve Kaza Arayüzlerini Kur
    this.initDhikrUI();
    this.initKazaUI();
    this.initImsakiyeUI();
  }

  async updatePrayers() {
    const now = new Date();
    document.getElementById("locationBadge").textContent = this.currentLocation.name;
    document.getElementById("locHeader").textContent = this.currentLocation.name;

    // Vakitleri hesapla/getir
    this.currentTimes = await this.engine.getPrayerTimes(
      now, 
      this.currentLocation.lat, 
      this.currentLocation.lon
    );

    // Kıble açısını güncelle
    const qiblaInfo = this.engine.calculateQibla(this.currentLocation.lat, this.currentLocation.lon);
    document.getElementById("qiblaAngleVal").textContent = `${qiblaInfo.angle}° GD`;
    document.getElementById("qiblaDistVal").textContent = `${qiblaInfo.distanceKm.toLocaleString('tr-TR')} km`;
    this.compass.setTargetQibla(qiblaInfo.angle);

    // Kartları oluştur
    this.renderPrayerCards();
    this.evaluateCurrentPrayer();
  }

  renderPrayerCards() {
    const container = document.getElementById("prayerGrid");
    if (!container || !this.currentTimes) return;

    const keys = ["imsak", "gunes", "ogle", "ikindi", "aksam", "yatsi"];
    const icons = { imsak: "🌙", gunes: "🌅", ogle: "☀️", ikindi: "🌤️", aksam: "🌇", yatsi: "🌌" };

    container.innerHTML = keys.map(k => {
      const timeVal = this.currentTimes[k] || "--:--";
      const info = PRAYER_DETAILS[k];
      return `
        <div id="card-${k}" onclick="app.showPrayerDetail('${k}')" 
             class="prayer-card cursor-pointer p-3 rounded-xl border border-[var(--border)] bg-[var(--card)]/90 backdrop-blur hover:border-emerald-500/50 transition-all flex flex-col justify-between">
          <div class="flex items-center justify-between text-xs text-[var(--muted-foreground)]">
            <span class="font-medium">${info.name}</span>
            <span>${icons[k]}</span>
          </div>
          <div class="my-1.5 font-mono text-base sm:text-lg font-black text-[var(--foreground)] tracking-tight">
            ${timeVal}
          </div>
          <div class="text-[10px] text-[var(--muted-foreground)] truncate">
            ${info.total}
          </div>
        </div>
      `;
    }).join("");
  }

  showPrayerDetail(key) {
    const info = PRAYER_DETAILS[key];
    if (!info) return;

    document.getElementById("detailModalTitle").textContent = `${info.name} Vakti Detayları`;
    document.getElementById("detailModalSub").textContent = info.sub;
    document.getElementById("detailModalDesc").textContent = info.desc;
    document.getElementById("detailModalTotal").textContent = info.total;

    const listEl = document.getElementById("detailModalRakahs");
    listEl.innerHTML = info.rakahs.map(r => `
      <div class="flex items-center justify-between p-2 rounded-lg bg-[var(--border)]/20 text-xs">
        <span class="font-semibold text-[var(--foreground)]">${r.name}</span>
        <span class="px-2 py-0.5 rounded text-[11px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium">${r.type}</span>
      </div>
    `).join("");

    document.getElementById("detailModal").classList.remove("hidden");
  }

  closePrayerDetail() {
    document.getElementById("detailModal").classList.add("hidden");
  }

  tick() {
    const now = new Date();

    // Canlı dijital saat
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const s = String(now.getSeconds()).padStart(2, '0');
    const clockEl = document.getElementById("liveClock");
    if (clockEl) clockEl.textContent = `${h}:${m}:${s}`;

    // Tarih etiketi
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateStr = now.toLocaleDateString('tr-TR', options);
    const dateEl = document.getElementById("dateLabel");
    if (dateEl) dateEl.textContent = dateStr;

    // Sayaç ve mevcut vakit kontrolü
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
      { key: "imsak", name: "İmsak (Sabah)", start: tImsak, end: tGunes, nextName: "Güneş Doğuşu", nextTime: tGunes },
      { key: "gunes", name: "Güneş (Kerahat)", start: tGunes, end: tOgle, nextName: "Öğle Vakti", nextTime: tOgle },
      { key: "ogle", name: "Öğle Vakti", start: tOgle, end: tIkindi, nextName: "İkindi Vakti", nextTime: tIkindi },
      { key: "ikindi", name: "İkindi Vakti", start: tIkindi, end: tAksam, nextName: "Akşam (İftar)", nextTime: tAksam },
      { key: "aksam", name: "Akşam Vakti", start: tAksam, end: tYatsi, nextName: "Yatsı Vakti", nextTime: tYatsi },
      { key: "yatsi", name: "Yatsı Vakti", start: tYatsi, end: new Date(tImsak.getTime() + 86400000), nextName: "İmsak (Sahur)", nextTime: new Date(tImsak.getTime() + 86400000) }
    ];

    let current = null;

    if (now < tImsak) {
      // Gece yarısı ile imsak arası (Yatsı vaktinin devamı)
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

    // Aktif kartı vurgula
    const keys = ["imsak", "gunes", "ogle", "ikindi", "aksam", "yatsi"];
    keys.forEach(k => {
      const card = document.getElementById(`card-${k}`);
      if (card) {
        if (k === current.key) {
          card.classList.add("ring-2", "ring-emerald-500", "bg-emerald-500/10", "shadow-sm");
        } else {
          card.classList.remove("ring-2", "ring-emerald-500", "bg-emerald-500/10", "shadow-sm");
        }
      }
    });

    // Ana Sayaç Bilgileri
    document.getElementById("currentPrayerName").textContent = current.name;
    document.getElementById("nextPrayerTarget").textContent = `Hedef: ${current.nextName}`;

    // Kalan Süre
    const diffMs = Math.max(0, current.nextTime.getTime() - now.getTime());
    const totalMs = current.end.getTime() - current.start.getTime();
    const passedMs = Math.max(0, now.getTime() - current.start.getTime());

    const diffSec = Math.floor(diffMs / 1000);
    const hrs = Math.floor(diffSec / 3600);
    const mins = Math.floor((diffSec % 3600) / 60);
    const secs = diffSec % 60;

    document.getElementById("countdownDisplay").textContent = 
      `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    // İlerleme Yüzdesi
    const percent = Math.min(100, Math.max(0, Math.round((passedMs / totalMs) * 100)));
    document.getElementById("progressPercentage").textContent = `%${percent}`;
    document.getElementById("prayerProgressBar").style.width = `${percent}%`;

    // Kerahat Vakti Kontrolü
    const kerahatBadge = document.getElementById("kerahatAlertBadge");
    const isMorningKerahat = now >= tGunes && (now.getTime() - tGunes.getTime()) < 45 * 60000;
    const isEveningKerahat = (tAksam.getTime() - now.getTime()) <= 45 * 60000 && now < tAksam;

    if (isMorningKerahat || isEveningKerahat) {
      kerahatBadge.classList.remove("hidden");
    } else {
      kerahatBadge.classList.add("hidden");
    }
  }

  // Şehir / Konum Seçici Arayüzü
  renderCitySelector() {
    const listEl = document.getElementById("cityListContainer");
    if (!listEl) return;

    listEl.innerHTML = TURKEY_CITIES.map(c => {
      let subOptions = "";
      if (c.districts && c.districts.length > 0) {
        subOptions = `
          <div class="flex flex-wrap gap-1 mt-1 pl-2">
            ${c.districts.map(d => `
              <button onclick="app.selectLocation('${c.name} / ${d.name}', ${d.lat}, ${d.lon})"
                      class="text-[11px] px-2 py-0.5 rounded bg-[var(--border)]/40 hover:bg-emerald-500 hover:text-white transition-colors">
                ${d.name}
              </button>
            `).join("")}
          </div>
        `;
      }

      return `
        <div class="border-b border-[var(--border)]/40 py-2">
          <div class="flex items-center justify-between">
            <button onclick="app.selectLocation('${c.name}', ${c.lat}, ${c.lon})" 
                    class="font-semibold text-xs sm:text-sm text-[var(--foreground)] hover:text-emerald-500 text-left">
              ${c.name}
            </button>
            <span class="text-[10px] text-[var(--muted-foreground)]">${c.lat.toFixed(1)}°K, ${c.lon.toFixed(1)}°D</span>
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
          this.selectLocation("Bulunduğum Konum (GPS)", lat, lon);
          if (btn) btn.textContent = "GPS ile Otomatik Bul";
        },
        (err) => {
          alert("GPS konumu alınamadı. Lütfen listeden şehir seçiniz.");
          if (btn) btn.textContent = "GPS ile Otomatik Bul";
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      alert("Cihazınızda GPS desteği bulunamadı.");
      if (btn) btn.textContent = "GPS ile Otomatik Bul";
    }
  }

  openLocationModal() {
    document.getElementById("locationModal").classList.remove("hidden");
  }

  closeLocationModal() {
    document.getElementById("locationModal").classList.add("hidden");
  }

  // Zikirmatik Arayüzü
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

  // Kaza Namazı Defteri Arayüzü
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
      <div class="p-2.5 rounded-xl border border-[var(--border)] bg-[var(--card)] flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span>${k.icon}</span>
          <span class="text-xs font-semibold">${k.name}</span>
        </div>
        <div class="flex items-center gap-2">
          <button onclick="app.modifyKaza('${k.id}', -1)" class="w-6 h-6 rounded bg-[var(--border)]/50 hover:bg-red-500/20 font-bold text-xs">-</button>
          <span id="kazaVal-${k.id}" class="font-mono text-sm font-bold min-w-[28px] text-center">${records[k.id] || 0}</span>
          <button onclick="app.modifyKaza('${k.id}', 1)" class="w-6 h-6 rounded bg-[var(--border)]/50 hover:bg-emerald-500/20 font-bold text-xs">+</button>
        </div>
      </div>
    `).join("");
  }

  modifyKaza(key, delta) {
    const updated = this.dhikr.updateKaza(key, delta);
    const el = document.getElementById(`kazaVal-${key}`);
    if (el) el.textContent = updated[key];
  }

  // Aylık İmsakiye Tablosu
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
        <tr class="${isToday ? 'bg-emerald-500/15 font-bold text-emerald-600 dark:text-emerald-400' : 'border-b border-[var(--border)]/30'} text-xs">
          <td class="py-1 px-2">${d}</td>
          <td class="py-1 px-2 font-mono">${times.imsak}</td>
          <td class="py-1 px-2 font-mono">${times.gunes}</td>
          <td class="py-1 px-2 font-mono">${times.ogle}</td>
          <td class="py-1 px-2 font-mono">${times.ikindi}</td>
          <td class="py-1 px-2 font-mono">${times.aksam}</td>
          <td class="py-1 px-2 font-mono">${times.yatsi}</td>
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
          btn.classList.add("text-emerald-500", "border-b-2", "border-emerald-500");
          btn.classList.remove("text-[var(--muted-foreground)]");
        } else {
          btn.classList.remove("text-emerald-500", "border-b-2", "border-emerald-500");
          btn.classList.add("text-[var(--muted-foreground)]");
        }
      }
    });

    if (tabId === "compass" && this.compass) {
      this.compass.startCompass();
    }
  }

  // Sesli Uyarı Tonu (Web Audio API)
  playAlertTone() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5 tonu
      osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.5); // G5 tonu
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1.2);
    } catch (e) {}
  }
}

// Uygulama Başlatıcı
let app = null;
window.addEventListener("DOMContentLoaded", () => {
  app = new TamVaktiApp();
});
