/**
 * Tam Vakti - Kıble Pusulası
 * Akış: Kıble sekmesi açılınca önce zorunlu kalibrasyon ekranı, sensör doğruluğu
 * (native accuracy 0..3) >= 2 olup ~1 sn kararlı kalınca pusula gösterilir.
 * Kadran requestAnimationFrame + düşük geçiren filtre ile (açısal sarma doğru) döner;
 * yalnızca transform: rotate yazılır, tüm DOM yazımları önbelleklenir.
 */

const QIBLA_MIN_ACCURACY = 2;      // 2 = orta, 3 = yüksek
const QIBLA_STABLE_MS = 1000;      // kalibrasyondan çıkmak için kararlı süre
const QIBLA_RECALIB_MS = 1500;     // doğruluk bu kadar düşük kalırsa tekrar kalibrasyon
const QIBLA_MOTION_DEG = 720;      // kalibrasyon için gereken toplam hareket (heading+eğim, derece)
const QIBLA_MIN_CALIB_MS = 6000;   // kalibrasyon en az bu kadar sürer
const QIBLA_SKIP_MS = 15000;       // "Atla" düğmesi gecikmesi
const QIBLA_NO_SENSOR_MS = 3000;   // bu sürede hiç veri gelmezse sensör yok say
const QIBLA_ALIGN_IN = 4;          // hizalanma eşiği (derece)
const QIBLA_ALIGN_OUT = 7;         // hizalanmadan çıkış eşiği (histerezis)
const QIBLA_TAU_MS = 90;           // düşük geçiren filtre zaman sabiti

const ACC_LABELS = ["Güvenilmez", "Düşük", "Orta", "Yüksek"];

function wrap180(d) {
  return ((d + 180) % 360 + 360) % 360 - 180;
}

class QiblaCompass {
  constructor(engine) {
    this.engine = engine || (window.app ? window.app.engine : null);
    this.targetQiblaAngle = 156.0;
    this.sunAzimuth = 0;
    this.userLat = 38.28;
    this.userLon = 31.9;

    this.isListening = false;
    this.phase = "calib"; // "calib" | "compass"
    this._raf = 0;
    this._lastFrame = 0;

    // Sensör durumu (onNativeUpdate yalnızca bunları yazar)
    this._heading = 0;
    this._accuracy = -1;
    this._pitch = 0;
    this._roll = 0;
    this._hasData = false;
    this._startTs = 0;
    this._lastUpdateTs = 0;

    // Kalibrasyon durumu
    this._goodSince = 0;
    this._lowSince = 0;
    this._skipped = false;
    this._noSensor = false;

    // Çizim durumu
    this._dialRot = 0;          // süzülmüş, sarmasız kadran açısı (= -heading)
    this._dialRotApplied = null;
    this._aligned = false;
    this._lastVibrate = 0;
    this._lastSunTs = 0;
    this._cache = {};
    this._ticksBuilt = false;

    this._tick = this._tick.bind(this);
    this._onVisibility = this._onVisibility.bind(this);
    this._pausedByVisibility = false;
    document.addEventListener("visibilitychange", this._onVisibility);
  }

  // ---- DOM yardımcıları (önbellekli yazım) ----
  _el(id) {
    const c = this._els || (this._els = {});
    let e = c[id];
    if (!e || !e.isConnected) {
      e = document.getElementById(id);
      c[id] = e;
    }
    return e;
  }

  _text(id, v) {
    const k = "t:" + id;
    if (this._cache[k] === v) return;
    const e = this._el(id);
    if (!e) return;
    this._cache[k] = v;
    e.textContent = v;
  }

  _hidden(id, hide) {
    const k = "h:" + id;
    if (this._cache[k] === hide) return;
    const e = this._el(id);
    if (!e) return;
    this._cache[k] = hide;
    e.classList.toggle("hidden", hide);
  }

  _cls(id, name, on) {
    const k = "c:" + id + name;
    if (this._cache[k] === on) return;
    const e = this._el(id);
    if (!e) return;
    this._cache[k] = on;
    e.classList.toggle(name, on);
  }

  _style(id, prop, v) {
    const k = "s:" + id + prop;
    if (this._cache[k] === v) return;
    const e = this._el(id);
    if (!e) return;
    this._cache[k] = v;
    e.style[prop] = v;
  }

  // ---- Hedef kıble ----
  setTargetQibla(angle, lat, lon) {
    this.targetQiblaAngle = angle || 156.0;
    if (lat && lon) {
      this.userLat = lat;
      this.userLon = lon;
    }
    const a = `${Math.round(this.targetQiblaAngle)}°`;
    this._text("qiblaAngleBig", a);
    this._text("qiblaCalibAngle", a);
    const needle = this._el("qiblaNeedle");
    if (needle) needle.setAttribute("transform", `rotate(${this.targetQiblaAngle.toFixed(1)})`);
    this.updateSunPosition();
    this._cache["t:qiblaGuidePill"] = null;
  }

  updateSunPosition() {
    const eng = this.engine || (window.app ? window.app.engine : null);
    if (!eng) return;
    const now = new Date();
    this._lastSunTs = now.getTime();
    if (eng.getSunPositionNow) {
      const sun = eng.getSunPositionNow(now, this.userLat, this.userLon);
      if (sun) {
        this.sunAzimuth = sun.azimuth;
        const g = this._el("compassSunIndicator");
        if (g) {
          g.setAttribute("transform", `rotate(${this.sunAzimuth.toFixed(1)})`);
          this._hidden("compassSunIndicator", !sun.isDaylight);
        }
      }
    }
    if (eng.calculateQiblaHour) {
      const qHour = eng.calculateQiblaHour(now, this.userLat, this.userLon, this.targetQiblaAngle);
      if (qHour) this._text("qiblaHourValue", qHour);
    }
  }

  _buildTicks() {
    if (this._ticksBuilt) return;
    const g = this._el("qiblaTicks");
    if (!g) return;
    let d = "";
    let dMajor = "";
    for (let a = 0; a < 360; a += 5) {
      if (a % 90 === 0) continue;
      const major = a % 45 === 0;
      const r1 = major ? 86 : 94;
      const r2 = 100;
      const rad = (a * Math.PI) / 180;
      const x1 = (Math.sin(rad) * r1).toFixed(2), y1 = (-Math.cos(rad) * r1).toFixed(2);
      const x2 = (Math.sin(rad) * r2).toFixed(2), y2 = (-Math.cos(rad) * r2).toFixed(2);
      const seg = `M${x1} ${y1}L${x2} ${y2}`;
      if (major || a % 15 === 0) dMajor += seg; else d += seg;
    }
    g.innerHTML =
      `<path d="${d}" stroke="#475569" stroke-width="1" fill="none"/>` +
      `<path d="${dMajor}" stroke="#94a3b8" stroke-width="2" fill="none"/>` +
      `<path d="M0 -84L0 -100" stroke="#f43f5e" stroke-width="3" fill="none"/>`;
    this._ticksBuilt = true;
  }

  // ---- Yaşam döngüsü ----
  // Kıble sekmesi her açıldığında çağrılır: kalibrasyondan başlar.
  startCompass() {
    if (this.isListening) return;
    this._buildTicks();
    this._enterCalib();
    this._skipped = false;
    this._noSensor = false;
    this._hasData = false;
    this._accuracy = -1;
    this._startTs = performance.now();
    this._lastUpdateTs = 0;
    this._attach();
  }

  // Uygulama arka plandan dönünce / modal kapanınca: aşamayı koruyarak sensörü yeniden aç
  resumeCompass() {
    if (this.isListening) return;
    this._goodSince = 0;
    this._lowSince = 0;
    this._startTs = performance.now();
    this._attach();
  }

  _attach() {
    this.isListening = true;
    this._pausedByVisibility = false;
    let label = null;
    if (window.AndroidBridge && window.AndroidBridge.startCompass) {
      window.AndroidBridge.startCompass(this.userLat, this.userLon);
      label = "Donanım sensörü";
    } else if (window.DeviceOrientationEvent) {
      this._bindWebOrientation();
      label = "Web sensörü";
    }
    this._setBadge(label || "Sensör yok");
    this._lastFrame = 0;
    if (!this._raf) this._raf = requestAnimationFrame(this._tick);
  }

  stopCompass() {
    if (!this.isListening) return;
    this.isListening = false;
    if (this._raf) {
      cancelAnimationFrame(this._raf);
      this._raf = 0;
    }
    if (window.AndroidBridge && window.AndroidBridge.stopCompass) {
      window.AndroidBridge.stopCompass();
    }
    if (this._webHandler) {
      window.removeEventListener("deviceorientationabsolute", this._webHandler, true);
      window.removeEventListener("deviceorientation", this._webHandler, true);
      this._webHandler = null;
    }
  }

  _onVisibility() {
    if (document.hidden) {
      if (this.isListening) {
        this.stopCompass();
        this._pausedByVisibility = true;
      }
    } else if (this._pausedByVisibility) {
      this._pausedByVisibility = false;
      const v = document.getElementById("viewQibla");
      if (v && !v.classList.contains("hidden")) this.resumeCompass();
    }
  }

  _setBadge(label) {
    const k = "badge";
    if (this._cache[k] === label) return;
    const e = this._el("qiblaSensorBadge");
    if (!e) return;
    this._cache[k] = label;
    e.innerHTML = `<span class="inline-block w-2 h-2 rounded-full bg-sky-400 animate-pulse"></span><span>${label}</span>`;
  }

  _bindWebOrientation() {
    this._webHandler = (e) => {
      let heading = 0;
      if (e.webkitCompassHeading !== undefined && e.webkitCompassHeading !== null) {
        heading = e.webkitCompassHeading;
      } else if (e.alpha !== null && e.alpha !== undefined) {
        heading = (360 - e.alpha) % 360;
      } else {
        return;
      }
      this.onNativeUpdate(heading, 3, e.beta || 0, e.gamma || 0);
    };
    const add = () => {
      window.addEventListener("deviceorientationabsolute", this._webHandler, true);
      window.addEventListener("deviceorientation", this._webHandler, true);
    };
    if (typeof DeviceOrientationEvent !== "undefined" && typeof DeviceOrientationEvent.requestPermission === "function") {
      DeviceOrientationEvent.requestPermission().then((r) => { if (r === "granted" && this._webHandler) add(); }).catch(() => {});
    } else {
      add();
    }
  }

  // ---- Sensör girişi: yalnızca durumu günceller, çizim rAF'ta yapılır ----
  onNativeUpdate(heading, accuracy, pitch, roll) {
    if (!this.isListening) return;
    if (this.phase === "calib" && this._hasData && typeof heading === "number" && !isNaN(heading)) {
      // 8 çizme hareketini ölç: ani sıçramaları (gürültü) saymadan toplam açısal hareketi biriktir
      let dh = Math.abs(heading - this._heading); if (dh > 180) dh = 360 - dh;
      const dp = Math.abs((pitch || 0) - (this._pitch || 0));
      const dr = Math.abs((roll || 0) - (this._roll || 0));
      const d = Math.min(dh, 40) + Math.min(dp, 40) + Math.min(dr, 40);
      this._motion = (this._motion || 0) + d;
    }
    if (typeof heading === "number" && !isNaN(heading)) this._heading = heading;
    this._accuracy = typeof accuracy === "number" ? accuracy : 3;
    this._pitch = pitch || 0;
    this._roll = roll || 0;
    this._lastUpdateTs = performance.now();
    if (!this._hasData) {
      this._hasData = true;
      this._dialRot = -this._heading; // ilk veride atlama yerine doğrudan otur
    }
  }

  skipCalibration() {
    this._skipped = true;
    this._enterCompass();
  }

  // ---- Aşama geçişleri ----
  _enterCalib() {
    this.phase = "calib";
    this._goodSince = 0;
    this._lowSince = 0;
    this._motion = 0;
    this._hidden("qiblaCompass", true);
    this._hidden("qiblaCalib", false);
    this._hidden("qiblaCalibSkip", true);
    this._hidden("qiblaNoSensor", true);
    this._style("qiblaCalibProgress", "transform", "scaleX(0)");
    this._calibStart = performance.now();
  }

  _enterCompass() {
    this.phase = "compass";
    this._goodSince = 0;
    this._lowSince = 0;
    this._hidden("qiblaCalib", true);
    this._hidden("qiblaCompass", false);
    this._dialRotApplied = null; // yeniden yaz
    this._cache["t:qiblaGuidePill"] = null;
    if (this._hasData) this._dialRot = -this._heading;
    this.updateSunPosition();
  }

  // ---- rAF döngüsü ----
  _tick(ts) {
    this._raf = 0;
    if (!this.isListening) return;
    const now = performance.now();
    const dt = this._lastFrame ? Math.min(now - this._lastFrame, 100) : 16;
    this._lastFrame = now;

    if (this.phase === "calib") this._tickCalib(now);
    else this._tickCompass(now, dt);

    this._raf = requestAnimationFrame(this._tick);
  }

  _tickCalib(now) {
    const acc = this._hasData ? this._accuracy : -1;

    // Canlı doğruluk göstergesi
    for (let i = 0; i < 4; i++) this._cls("qiblaAccBar" + i, "on", acc >= 0 && i <= acc);
    const bars = this._el("qiblaAccBar0");
    if (bars && bars.parentElement) {
      const low = acc >= 0 && acc < QIBLA_MIN_ACCURACY;
      if (this._cache.accLow !== low) {
        this._cache.accLow = low;
        bars.parentElement.classList.toggle("low", low);
      }
    }
    this._text("qiblaAccLabel", acc >= 0 ? `Doğruluk: ${ACC_LABELS[Math.min(3, acc)]}` : "Sensör bekleniyor…");

    // Sensör var mı?
    const noSensor = !this._hasData && now - this._startTs > QIBLA_NO_SENSOR_MS;
    this._hidden("qiblaNoSensor", !noSensor);
    this._noSensor = noSensor;

    // Atla düğmesi: 15 sn sonra (sensör yoksa hemen)
    const elapsed = now - (this._calibStart || this._startTs);
    this._hidden("qiblaCalibSkip", !(noSensor || elapsed > QIBLA_SKIP_MS));

    // İlerleme: yeterli hareket + en az süre + yeterli doğruluk (kararlı)
    if (this._hasData && acc >= QIBLA_MIN_ACCURACY) {
      if (!this._goodSince) this._goodSince = now;
    } else {
      this._goodSince = 0;
    }
    const motionP = Math.min(1, (this._motion || 0) / QIBLA_MOTION_DEG);
    const timeP = Math.min(1, elapsed / QIBLA_MIN_CALIB_MS);
    const stableOk = this._goodSince && now - this._goodSince >= QIBLA_STABLE_MS;
    let p = Math.min(motionP, timeP);
    if (!stableOk) p = Math.min(p, 0.95);
    this._style("qiblaCalibProgress", "transform", `scaleX(${p.toFixed(2)})`);
    if (p >= 1 && stableOk) this._enterCompass();
  }

  _tickCompass(now, dt) {
    // Doğruluk düştü mü? (atlanmışsa veya sensör hiç yoksa kapıya geri dönme)
    if (this._hasData && !this._skipped) {
      if (this._accuracy < QIBLA_MIN_ACCURACY) {
        if (!this._lowSince) this._lowSince = now;
        else if (now - this._lowSince > QIBLA_RECALIB_MS) {
          this._enterCalib();
          return;
        }
      } else {
        this._lowSince = 0;
      }
    }

    // Düşük geçiren filtre (açısal sarma doğru): hedef = -heading
    if (this._hasData) {
      const diff = wrap180(-this._heading - this._dialRot);
      const alpha = 1 - Math.exp(-dt / QIBLA_TAU_MS);
      this._dialRot += diff * alpha;
      if (this._dialRot > 720 || this._dialRot < -720) this._dialRot = wrap180(this._dialRot);
    }
    const rot = Math.round(this._dialRot * 10) / 10;
    if (rot !== this._dialRotApplied) {
      this._dialRotApplied = rot;
      const dial = this._el("compassDial");
      if (dial) dial.style.transform = `rotate(${rot}deg)`;
    }

    // Süzülmüş yön ve kıbleye göreli açı
    const smoothHeading = ((-this._dialRot % 360) + 360) % 360;
    const rel = wrap180(this.targetQiblaAngle - smoothHeading);
    const abs = Math.abs(rel);

    // Hizalanma (histerezisli, girişte bir kez titreşim)
    if (!this._aligned && abs <= QIBLA_ALIGN_IN && this._hasData) {
      this._aligned = true;
      this._vibrate(now);
    } else if (this._aligned && abs > QIBLA_ALIGN_OUT) {
      this._aligned = false;
    }
    this._cls("qiblaOuterRing", "qibla-aligned", this._aligned);

    // Yönlendirme rozeti
    let pillKey, pillClass, pillHtml;
    if (!this._hasData) {
      pillKey = "nodata"; pillClass = "qibla-guide-pill guide-turn";
      pillHtml = "<span>Sensör verisi yok · Kıble açısı " + Math.round(this.targetQiblaAngle) + "°</span>";
    } else if (this._aligned) {
      pillKey = "aligned"; pillClass = "qibla-guide-pill guide-aligned";
      pillHtml = `<svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg><span>KIBLE YÖNÜNDESİN</span>`;
    } else {
      const deg = Math.round(abs);
      pillKey = (rel > 0 ? "r" : "l") + deg; pillClass = "qibla-guide-pill guide-turn";
      pillHtml = rel > 0 ? `<span>→ ${deg}° Sağa dön</span>` : `<span>← ${deg}° Sola dön</span>`;
    }
    if (this._cache["t:qiblaGuidePill"] !== pillKey) {
      const pill = this._el("qiblaGuidePill");
      if (pill) {
        this._cache["t:qiblaGuidePill"] = pillKey;
        pill.className = pillClass;
        pill.innerHTML = pillHtml;
      }
    }

    // Eğim uyarısı ve su terazisi
    const tiltMag = Math.hypot(this._pitch, this._roll);
    this._hidden("compassTiltAlert", !(tiltMag > 26));
    const bX = Math.round(Math.max(-12, Math.min(12, this._roll * 0.8)) * 2) / 2;
    const bY = Math.round(Math.max(-12, Math.min(12, this._pitch * 0.8)) * 2) / 2;
    this._style("compassBubbleDot", "transform", `translate(${bX}px, ${bY}px)`);
    this._cls("compassBubbleDot", "bubble-centered", tiltMag < 7);

    // Güneş yönü dakikada bir tazelenir
    if (Date.now() - this._lastSunTs > 60000) this.updateSunPosition();
  }

  _vibrate(now) {
    if (now - this._lastVibrate < 3000) return; // debounce
    this._lastVibrate = now;
    try {
      if (window.AndroidBridge && window.AndroidBridge.vibrateDevice) {
        window.AndroidBridge.vibrateDevice(60);
      } else if (navigator.vibrate) {
        navigator.vibrate(60);
      }
    } catch (e) { /* titreşim desteklenmiyor */ }
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { QiblaCompass };
}
