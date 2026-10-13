/**
 * Tam Vakti - Kıble Pusulası ve Sensör Yöneticisi
 * Sürüm: 2026.10.12
 */

class QiblaCompass {
  constructor(dialElementId, angleDisplayId, statusDisplayId) {
    this.dialEl = document.getElementById(dialElementId);
    this.angleEl = document.getElementById(angleDisplayId);
    this.statusEl = document.getElementById(statusDisplayId);
    this.outerRingEl = document.getElementById("qiblaOuterRing");
    this.alignedBadgeEl = document.getElementById("qiblaAlignedBadge");
    this.targetQiblaAngle = 152.0; // Varsayılan Ilgın kıble açısı
    this.currentHeading = 0;
    this.isListening = false;
    this.wasAligned = false;
  }

  setTargetQibla(angle) {
    this.targetQiblaAngle = angle;
    if (this.angleEl) {
      this.angleEl.textContent = `${Math.round(angle)}°`;
    }
    this.updateDial();
  }

  startCompass() {
    if (this.isListening) return;

    if (window.DeviceOrientationEvent) {
      // iOS 13+ izin kontrolü
      if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission()
          .then(permissionState => {
            if (permissionState === 'granted') {
              this.bindOrientation();
            } else if (this.statusEl) {
              this.statusEl.textContent = "Pusula izni verilmedi (Sensör kilitli).";
            }
          })
          .catch(err => {
            if (this.statusEl) this.statusEl.textContent = "Sensör başlatılamadı.";
          });
      } else {
        this.bindOrientation();
      }
    } else if (this.statusEl) {
      this.statusEl.textContent = "Cihazınızda yön sensörü bulunamadı. Sabit açı gösteriliyor.";
    }
  }

  bindOrientation() {
    this.isListening = true;
    window.addEventListener('deviceorientationabsolute', (e) => this.handleOrientation(e), true);
    window.addEventListener('deviceorientation', (e) => this.handleOrientation(e), true);
    if (this.statusEl) {
      this.statusEl.textContent = "Canlı pusula devrede. Telefonu düz tutunuz.";
    }
  }

  handleOrientation(event) {
    let heading = 0;
    if (event.webkitCompassHeading !== undefined && event.webkitCompassHeading !== null) {
      // iOS Safari
      heading = event.webkitCompassHeading;
    } else if (event.alpha !== null) {
      // Android
      heading = 360 - event.alpha;
    }

    this.currentHeading = heading;
    this.updateDial();
  }

  updateDial() {
    if (!this.dialEl) return;
    // Kadran cihazın kuzeyine göre döner, ibre Kâbe istikametini gösterir
    const relativeAngle = (this.targetQiblaAngle - this.currentHeading + 360) % 360;
    this.dialEl.style.transform = `rotate(${relativeAngle}deg)`;

    // Kıbleye tam hizalanma kontrolü (±3 derece hassasiyet)
    const isAligned = (relativeAngle <= 3 || relativeAngle >= 357);

    if (this.outerRingEl) {
      if (isAligned) {
        this.outerRingEl.classList.add("qibla-aligned");
      } else {
        this.outerRingEl.classList.remove("qibla-aligned");
      }
    }

    if (this.alignedBadgeEl) {
      if (isAligned) {
        this.alignedBadgeEl.classList.remove("hidden");
      } else {
        this.alignedBadgeEl.classList.add("hidden");
      }
    }

    if (isAligned) {
      if (!this.wasAligned) {
        this.wasAligned = true;
        // Zarif tek seferlik cihaz titreşimi
        if (window.AndroidBridge && window.AndroidBridge.vibrateDevice) {
          window.AndroidBridge.vibrateDevice(200);
        } else if (navigator.vibrate) {
          navigator.vibrate(200);
        }
      }
    } else {
      if (relativeAngle > 4 && relativeAngle < 356) {
        this.wasAligned = false;
      }
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { QiblaCompass };
}
