/**
 * Tam Vakti - Kıble Pusulası ve Sensör Yöneticisi
 * Sürüm: 2026.10.12
 */

class QiblaCompass {
  constructor(dialElementId, angleDisplayId, statusDisplayId) {
    this.dialEl = document.getElementById(dialElementId);
    this.angleEl = document.getElementById(angleDisplayId);
    this.statusEl = document.getElementById(statusDisplayId);
    this.targetQiblaAngle = 154.2; // Varsayılan Konya Ilgın açısı
    this.currentHeading = 0;
    this.isListening = false;
  }

  setTargetQibla(angle) {
    this.targetQiblaAngle = angle;
    if (this.angleEl) {
      this.angleEl.textContent = `${angle.toFixed(1)}°`;
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
    if (event.webkitCompassHeading) {
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
    // Kadran cihazın kuzeyine göre ters döner, ibre Kâbe açısını gösterir
    const relativeAngle = (this.targetQiblaAngle - this.currentHeading + 360) % 360;
    this.dialEl.style.transform = `rotate(${relativeAngle}deg)`;

    // Tam kıbleye bakıldığında (±5 derece) titreşim veya renk geri bildirimi
    const diff = Math.abs(relativeAngle);
    if ((diff < 6 || diff > 354) && navigator.vibrate) {
      // Kıble tam hizalandığında hafif titreşim
      navigator.vibrate(20);
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { QiblaCompass };
}
