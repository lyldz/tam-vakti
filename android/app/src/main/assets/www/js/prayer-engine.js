/**
 * Tam Vakti - Diyanet Uyumlu Namaz Vakti ve Astronomik Hesaplama Motoru
 * Sürüm: 2026.10.12
 */

class PrayerEngine {
  constructor() {
    this.KAABA_LAT = 21.4225;
    this.KAABA_LON = 39.8262;
    this.FAJR_ANGLE = 18.0;   // Diyanet İmsak açısı
    this.ISHA_ANGLE = 17.0;   // Diyanet Yatsı açısı
    this.DEFAULT_TZ = 3.0;    // Türkiye UTC+3 sabit saat
  }

  // Derece / Radyan Dönüşümleri
  d2r(deg) { return (deg * Math.PI) / 180.0; }
  r2d(rad) { return (rad * 180.0) / Math.PI; }

  // Kıble Açısı ve Mesafesi (Büyük Daire Formülü)
  calculateQibla(lat, lon) {
    const phi1 = this.d2r(lat);
    const phi2 = this.d2r(this.KAABA_LAT);
    const deltaLambda = this.d2r(this.KAABA_LON - lon);

    const y = Math.sin(deltaLambda);
    const x = Math.cos(phi1) * Math.tan(phi2) - Math.sin(phi1) * Math.cos(deltaLambda);
    let qibla = this.r2d(Math.atan2(y, x));
    qibla = (qibla + 360) % 360;

    // Kabe'ye Kuş Uçuşu Mesafe (Haversine)
    const R = 6371; // km
    const dLat = this.d2r(this.KAABA_LAT - lat);
    const dLon = this.d2r(this.KAABA_LON - lon);
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(phi1) * Math.cos(phi2) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distanceKm = Math.round(R * c);

    return {
      angle: parseFloat(qibla.toFixed(1)),
      distanceKm: distanceKm
    };
  }

  // Astronomik Güneş Pozisyonu ve Denklem Zamanı
  getSolarPosition(julianDay) {
    const D = julianDay - 2451545.0;
    const g = (357.529 + 0.98560028 * D) % 360;
    const q = (280.459 + 0.98564736 * D) % 360;
    const L = (q + 1.915 * Math.sin(this.d2r(g)) + 0.020 * Math.sin(this.d2r(2 * g))) % 360;

    const e = 23.439 - 0.00000036 * D;
    const d = this.r2d(Math.asin(Math.sin(this.d2r(e)) * Math.sin(this.d2r(L))));
    let RA = this.r2d(Math.atan2(Math.cos(this.d2r(e)) * Math.sin(this.d2r(L)), Math.cos(this.d2r(L)))) / 15;
    RA = (RA + 24) % 24;

    const EqT = q / 15 - RA;
    return { declination: d, equationOfTime: EqT };
  }

  julianDate(year, month, day) {
    if (month <= 2) {
      year -= 1;
      month += 12;
    }
    const A = Math.floor(year / 100);
    const B = 2 - A + Math.floor(A / 4);
    return Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + B - 1524.5;
  }

  // Güneş batımı/doğumu veya belirli bir açı için saat açısı hesabı
  getHourAngle(lat, declination, angle) {
    const cosHA = (Math.sin(this.d2r(angle)) - Math.sin(this.d2r(lat)) * Math.sin(this.d2r(declination))) /
                  (Math.cos(this.d2r(lat)) * Math.cos(this.d2r(declination)));
    if (cosHA > 1 || cosHA < -1) return null;
    return this.r2d(Math.acos(cosHA)) / 15;
  }

  // İkindi Vakti Açı Hesabı (Gölge faktörü t = 1, Asr-ı Evvel)
  getAsrHourAngle(lat, declination, factor = 1) {
    const phi = this.d2r(lat);
    const delta = this.d2r(declination);
    const noonAlt = 90 - Math.abs(lat - declination);
    const tAlt = this.r2d(Math.atan(1 / (factor + Math.tan(this.d2r(90 - noonAlt)))));
    return this.getHourAngle(lat, declination, tAlt);
  }

  formatTime(decimalHours) {
    if (decimalHours === null || isNaN(decimalHours)) return "--:--";
    decimalHours = (decimalHours + 24) % 24;
    const totalMinutes = Math.round(decimalHours * 60);
    const hours = Math.floor(totalMinutes / 60) % 24;
    const minutes = totalMinutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }

  // Tam Diyanet Modeliyle Çevrimdışı Vakit Hesaplama
  calculateTimesOffline(date, lat, lon, tz = 3.0) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    const JD = this.julianDate(year, month, day);
    const { declination, equationOfTime } = this.getSolarPosition(JD);

    // Gerçek Güneş Öğlesi (Dhuhr / Zeval)
    const solarNoon = 12 + tz - (lon / 15) - equationOfTime;

    // Saat Açıları
    const haSunrise = this.getHourAngle(lat, declination, -0.8333); // Ufuk kırılması
    const haFajr = this.getHourAngle(lat, declination, -this.FAJR_ANGLE);
    const haIsha = this.getHourAngle(lat, declination, -this.ISHA_ANGLE);
    const haAsr = this.getAsrHourAngle(lat, declination, 1);

    // Temkin Payları (Diyanet Standart Temkini)
    // Öğle: +6 dk temkin, İkindi: +5 dk temkin, Akşam: +7 dk temkin, Yatsı: +1 dk temkin
    const imsak = solarNoon - (haFajr || 6) - (2 / 60);
    const gunes = solarNoon - (haSunrise || 6) - (3 / 60);
    const ogle = solarNoon + (6 / 60);
    const ikindi = solarNoon + (haAsr || 3) + (5 / 60);
    const aksam = solarNoon + (haSunrise || 6) + (7 / 60);
    const yatsi = solarNoon + (haIsha || 7) + (1 / 60);

    return {
      date: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      imsak: this.formatTime(imsak),
      gunes: this.formatTime(gunes),
      ogle: this.formatTime(ogle),
      ikindi: this.formatTime(ikindi),
      aksam: this.formatTime(aksam),
      yatsi: this.formatTime(yatsi),
      source: 'offline-astronomical'
    };
  }

  // Çevrimiçi Diyanet API'den Çekme ve Yerel Önbelleğe (Cache) Alma
  async getPrayerTimes(date, lat, lon, tz = 3.0) {
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const cacheKey = `tamvakti_${lat.toFixed(2)}_${lon.toFixed(2)}_${dateStr}`;

    // Önbellek kontrolü
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {}
    }

    // Çevrimdışı hesaplamayı anında üret (Gecikmesiz yedek)
    const offlineTimes = this.calculateTimesOffline(date, lat, lon, tz);

    // İnternet varsa Aladhan Diyanet API'den asenkron dene (Method 13: Diyanet İşleri Başkanlığı)
    try {
      const d = String(date.getDate()).padStart(2, '0');
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const y = date.getFullYear();
      const url = `https://api.aladhan.com/v1/timings/${d}-${m}-${y}?latitude=${lat}&longitude=${lon}&method=13`;
      
      const res = await fetch(url, { cache: "force-cache" });
      if (res.ok) {
        const json = await res.json();
        if (json && json.data && json.data.timings) {
          const t = json.data.timings;
          const apiTimes = {
            date: dateStr,
            imsak: t.Fajr.substring(0, 5),
            gunes: t.Sunrise.substring(0, 5),
            ogle: t.Dhuhr.substring(0, 5),
            ikindi: t.Asr.substring(0, 5),
            aksam: t.Maghrib.substring(0, 5),
            yatsi: t.Isha.substring(0, 5),
            hijri: json.data.date.hijri ? `${json.data.date.hijri.day} ${json.data.date.hijri.month.tr || json.data.date.hijri.month.en} ${json.data.date.hijri.year}` : null,
            source: 'diyanet-api'
          };
          localStorage.setItem(cacheKey, JSON.stringify(apiTimes));
          return apiTimes;
        }
      }
    } catch (e) {
      // Ağ hatasında offlineTimes ile devam et
    }

    return offlineTimes;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PrayerEngine };
}
