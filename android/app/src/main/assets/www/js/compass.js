/**
 * Tam Vakti - Gelişmiş Kıble Pusulası ve Sensör Yöneticisi
 * Android Native Donanım Entegrasyonu & Su Terazisi
 * Sürüm: 1.07
 */

class QiblaCompass {
  constructor(engine) {
    this.engine = engine || (window.app ? window.app.engine : null);
    this._ensureElements();

    this.targetQiblaAngle = 156.0;
    this.sunAzimuth = 0;
    this.currentHeading = 0;
    this._currentDialRotation = 0;
    this.isListening = false;
    this.wasAligned = false;
    this.userLat = 38.28;
    this.userLon = 31.9;
  }

  _ensureElements() {
    this.dialEl = document.getElementById("compassDial");
    this.needleEl = document.getElementById("qiblaNeedle");
    this.angleEl = document.getElementById("qiblaAngleBig");
    this.outerRingEl = document.getElementById("qiblaOuterRing");
    this.guidePillEl = document.getElementById("qiblaGuidePill");
    this.calibAlertEl = document.getElementById("compassCalibAlert");
    this.tiltAlertEl = document.getElementById("compassTiltAlert");
    this.bubbleDotEl = document.getElementById("compassBubbleDot");
    this.sunIndicatorEl = document.getElementById("compassSunIndicator");
    this.qiblaHourEl = document.getElementById("qiblaHourValue");
    this.qiblaSensorBadgeEl = document.getElementById("qiblaSensorBadge");
  }

  setTargetQibla(angle, lat, lon) {
    this._ensureElements();
    this.targetQiblaAngle = angle || 156.0;
    if (lat && lon) {
      this.userLat = lat;
      this.userLon = lon;
    }
    if (this.angleEl) {
      this.angleEl.textContent = `${Math.round(this.targetQiblaAngle)}°`;
    }
    this.updateSunPosition();
    this.updateCompassUI();
  }

  updateSunPosition() {
    this._ensureElements();
    const eng = this.engine || (window.app ? window.app.engine : null);
    if (eng) {
      const now = new Date();
      if (eng.getSunPositionNow) {
        const sun = eng.getSunPositionNow(now, this.userLat, this.userLon);
        if (sun) {
          this.sunAzimuth = sun.azimuth;
          if (this.sunIndicatorEl) {
            if (sun.isDaylight) {
              this.sunIndicatorEl.classList.remove("hidden");
              this.sunIndicatorEl.style.transform = `rotate(${this.sunAzimuth}deg) translate(0, -96px)`;
              this.sunIndicatorEl.title = `Güneş açısı: ${Math.round(this.sunAzimuth)}°`;
            } else {
              this.sunIndicatorEl.classList.add("hidden");
            }
          }
        }
      }

      if (this.qiblaHourEl && eng.calculateQiblaHour) {
        const qHour = eng.calculateQiblaHour(now, this.userLat, this.userLon, this.targetQiblaAngle);
        if (qHour) {
          this.qiblaHourEl.textContent = qHour;
        }
      }
    }
  }

  startCompass() {
    this._ensureElements();
    if (this.isListening) return;
    this.isListening = true;

    // 1. Android Native Donanım Sensörünü Başlat
    if (window.AndroidBridge && window.AndroidBridge.startCompass) {
      window.AndroidBridge.startCompass(this.userLat, this.userLon);
      if (this.qiblaSensorBadgeEl) {
        this.qiblaSensorBadgeEl.innerHTML = `<span class="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span><span>Donanım Sensörü</span>`;
      }
    } else if (window.DeviceOrientationEvent) {
      // Web Fallback (Tarayıcı ortamı için)
      this.bindWebOrientation();
      if (this.qiblaSensorBadgeEl) {
        this.qiblaSensorBadgeEl.innerHTML = `<span class="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span><span>Web Sensörü</span>`;
      }
    }
  }

  stopCompass() {
    if (!this.isListening) return;
    this.isListening = false;

    if (window.AndroidBridge && window.AndroidBridge.stopCompass) {
      window.AndroidBridge.stopCompass();
    }
    if (this._webHandler) {
      window.removeEventListener('deviceorientationabsolute', this._webHandler, true);
      window.removeEventListener('deviceorientation', this._webHandler, true);
      this._webHandler = null;
    }
  }

  bindWebOrientation() {
    this._webHandler = (e) => {
      let heading = 0;
      if (e.webkitCompassHeading !== undefined && e.webkitCompassHeading !== null) {
        heading = e.webkitCompassHeading;
      } else if (e.alpha !== null) {
        heading = (360 - e.alpha) % 360;
      }
      const pitch = e.beta || 0;
      const roll = e.gamma || 0;
      this.onNativeUpdate(heading, 3, pitch, roll);
    };

    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission()
        .then(res => {
          if (res === 'granted') {
            window.addEventListener('deviceorientationabsolute', this._webHandler, true);
            window.addEventListener('deviceorientation', this._webHandler, true);
          }
        })
        .catch(() => {});
    } else {
      window.addEventListener('deviceorientationabsolute', this._webHandler, true);
      window.addEventListener('deviceorientation', this._webHandler, true);
    }
  }

  // Native Android katmanından veya web eventinden çağrılır
  onNativeUpdate(heading, accuracy, pitch, roll) {
    this._ensureElements();
    this.currentHeading = heading;

    // 1. Kalibrasyon uyarısı (accuracy 0=güvensiz, 1=düşük)
    if (this.calibAlertEl) {
      if (accuracy !== undefined && accuracy <= 1) {
        this.calibAlertEl.classList.remove("hidden");
      } else {
        this.calibAlertEl.classList.add("hidden");
      }
    }

    // 2. Eğim Kontrolü & Su Terazisi
    const tiltMag = Math.hypot(pitch, roll);
    if (this.tiltAlertEl) {
      if (tiltMag > 26) {
        this.tiltAlertEl.classList.remove("hidden");
      } else {
        this.tiltAlertEl.classList.add("hidden");
      }
    }

    if (this.bubbleDotEl) {
      // Su terazisi balonu hareketi (-18px ile +18px arası sınırla)
      const bX = Math.max(-18, Math.min(18, roll * 1.2));
      const bY = Math.max(-18, Math.min(18, pitch * 1.2));
      this.bubbleDotEl.style.transform = `translate(${bX}px, ${bY}px)`;

      if (tiltMag < 7) {
        this.bubbleDotEl.classList.add("bubble-centered");
      } else {
        this.bubbleDotEl.classList.remove("bubble-centered");
      }
    }

    this.updateCompassUI();
  }

  updateCompassUI() {
    this._ensureElements();

    // 1. Kadran rotasyonu: Kuzey (K) her zaman gerçek Coğrafi Kuzeyi gösterir
    if (this.dialEl) {
      const targetRotation = -this.currentHeading;
      let diff = targetRotation - this._currentDialRotation;
      diff = ((diff + 180) % 360 + 360) % 360 - 180;
      this._currentDialRotation += diff;
      this.dialEl.style.transform = `rotate(${this._currentDialRotation}deg)`;
    }

    // 2. Kıble İbresi: Kâbe doğrultusunu hedefler (Kadrana göre sabit açısı)
    if (this.needleEl) {
      this.needleEl.style.transform = `rotate(${this.targetQiblaAngle}deg)`;
    }

    // 3. Tam Hizalanma Kontrolü (±4.0 derece tolerans)
    const relativeAngle = ((this.targetQiblaAngle - this.currentHeading + 540) % 360) - 180;
    const absDiff = Math.abs(relativeAngle);
    const isAligned = absDiff <= 4.0;

    if (this.outerRingEl) {
      if (isAligned) {
        this.outerRingEl.classList.add("qibla-aligned");
      } else {
        this.outerRingEl.classList.remove("qibla-aligned");
      }
    }

    // 4. Dinamik Yönlendirme Rozeti (Sağa dön / Sola dön / Kıble'desin)
    if (this.guidePillEl) {
      if (isAligned) {
        this.guidePillEl.className = "qibla-guide-pill guide-aligned";
        this.guidePillEl.innerHTML = `
          <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
          <span>✓ KIBLE YÖNÜNDESİN (${Math.round(this.targetQiblaAngle)}°)</span>
        `;
      } else if (relativeAngle > 0) {
        this.guidePillEl.className = "qibla-guide-pill guide-turn";
        this.guidePillEl.innerHTML = `
          <span>→ ${Math.round(relativeAngle)}° Sağa dön</span>
        `;
      } else {
        this.guidePillEl.className = "qibla-guide-pill guide-turn";
        this.guidePillEl.innerHTML = `
          <span>← ${Math.round(-relativeAngle)}° Sola dön</span>
        `;
      }
    }

    // 5. Titreşimli Geri Bildirim
    if (isAligned) {
      if (!this.wasAligned) {
        this.wasAligned = true;
        if (window.AndroidBridge && window.AndroidBridge.vibrateDevice) {
          window.AndroidBridge.vibrateDevice(150);
        } else if (navigator.vibrate) {
          navigator.vibrate(150);
        }
      }
    } else {
      if (absDiff > 6.0) {
        this.wasAligned = false;
      }
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { QiblaCompass };
}
