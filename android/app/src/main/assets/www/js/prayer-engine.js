/**
 * Tam Vakti - Diyanet Uyumlu Namaz Vakti ve Astronomik Hesaplama Motoru
 * Sürüm: v2.4
 */

// Hicri ay adları (Aladhan "month.number" 1-12 ile eşleşir; API Türkçe ad döndürmez)
const HIJRI_MONTHS_TR = [
  '', 'Muharrem', 'Sefer', 'Rebiülevvel', 'Rebiülahir',
  'Cemaziyelevvel', 'Cemaziyelahir', 'Recep', 'Şaban',
  'Ramazan', 'Şevval', 'Zilkade', 'Zilhicce'
];

// Hesaplama yöntemleri (id = Aladhan API yöntem numarası). temkin: dakika cinsinden eklenen paylar (yalnızca Diyanet).
const CALC_METHODS = {
  diyanet:   { id: 13, name: 'Diyanet (Türkiye)', short: 'Diyanet', region: 'Türkiye', fajr: 18, isha: 17, temkin: { imsak: -2, gunes: -3, ogle: 6, ikindi: 5, aksam: 7, yatsi: 1 } },
  mwl:       { id: 3,  name: 'Dünya İslam Birliği (MWL)', short: 'MWL', region: 'Avrupa, Afrika, Orta ve Doğu Asya, diğer', fajr: 18, isha: 17 },
  isna:      { id: 2,  name: 'ISNA (Kuzey Amerika)', short: 'ISNA', region: 'ABD, Kanada', fajr: 15, isha: 15 },
  makkah:    { id: 4,  name: 'Ümmü\'l-Kurâ (Mekke)', short: 'Ümmü\'l-Kurâ', region: 'Arap Yarımadası, Körfez', fajr: 18.5, ishaMin: 90 },
  egypt:     { id: 5,  name: 'Mısır Genel Otoritesi', short: 'Mısır', region: 'Mısır', fajr: 19.5, isha: 17.5 },
  karachi:   { id: 1,  name: 'Karaçi İslami Bilimler Üniv.', short: 'Karaçi', region: 'Pakistan, Hindistan, Bangladeş, Afganistan', fajr: 18, isha: 18 },
  singapore: { id: 11, name: 'Singapur / Malezya (MUIS, JAKIM)', short: 'Singapur', region: 'Malezya, Endonezya, Singapur, Brunei', fajr: 20, isha: 18 }
};

// Konuma göre en sık kullanılan yöntem (kaba bölge kutuları; kullanıcı Ayarlar'dan değiştirebilir)
function methodForLocation(lat, lon) {
  const inBox = (la0, la1, lo0, lo1) => lat >= la0 && lat <= la1 && lon >= lo0 && lon <= lo1;
  if (inBox(35.8, 42.2, 25.6, 44.9)) return 'diyanet';   // Türkiye
  if (inBox(34.9, 35.75, 32.2, 34.7)) return 'diyanet';  // KKTC (Kıbrıs)
  if (inBox(24, 72, -170, -50)) return 'isna';           // ABD, Kanada
  if (inBox(21.5, 31.8, 24.5, 36.0)) return 'egypt';     // Mısır
  if (inBox(12, 32.5, 34.5, 60)) return 'makkah';        // Arap Yarımadası, Körfez
  if (inBox(5, 37, 60.5, 93)) return 'karachi';          // Pakistan, Hindistan, Bangladeş, Afganistan
  if (inBox(-11, 8, 95, 141)) return 'singapore';        // Malezya, Endonezya, Singapur
  return 'mwl';                                          // Avrupa ve diğer
}

function hijriMonthTr(h) {
  if (!h || !h.month) return '';
  const n = parseInt(h.month.number, 10);
  return HIJRI_MONTHS_TR[n] || h.month.en || '';
}

class PrayerEngine {
  constructor() {
    this.KAABA_LAT = 21.4225;
    this.KAABA_LON = 39.8262;
    this.FAJR_ANGLE = 18.0;   // Diyanet İmsak açısı
    this.ISHA_ANGLE = 17.0;   // Diyanet Yatsı açısı
    this.DEFAULT_TZ = 3.0;    // Türkiye UTC+3 sabit saat
    this.method = 'diyanet';  // aktif hesaplama yöntemi (CALC_METHODS anahtarı)
  }

  setMethod(key) { if (CALC_METHODS[key]) this.method = key; }
  methodInfo() { return CALC_METHODS[this.method] || CALC_METHODS.diyanet; }
  // Yöntemi geçici değiştirip o günün çevrimdışı hesabını döndürür (seçim listesindeki önizleme için)
  previewTimes(key, date, lat, lon) {
    const old = this.method;
    this.setMethod(key);
    try { return this.calculateTimesOffline(date, lat, lon); } finally { this.method = old; }
  }
  methodForLocation(lat, lon) { return methodForLocation(lat, lon); }
  // Önbellek anahtarı eki: Diyanet için boş (eski önbellek geçerli kalır)
  _mk() { return this.method === 'diyanet' ? '' : `_${this.method}`; }

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

    // Zaman denklemi (saat cinsinden); 24 sa sarmasını [-12, 12) aralığına indir
    let EqT = q / 15 - RA;
    EqT = ((EqT + 12) % 24 + 24) % 24 - 12;
    return { declination: d, equationOfTime: EqT };
  }

  // Canlı Güneş Azimutu (0-360 derece, Kuzeyden saat yönünde) ve Yükseklik Açısı
  getSunPositionNow(date, lat, lon, tz = 3.0) {
    const jd = this.julianDate(date.getFullYear(), date.getMonth() + 1, date.getDate());
    const solar = this.getSolarPosition(jd);
    const declination = solar.declination;
    const EqT = solar.equationOfTime;

    const hours = date.getHours() + date.getMinutes() / 60 + date.getSeconds() / 3600;
    const solarTime = hours + EqT + ((lon - 15 * tz) / 15);
    const hourAngleDeg = (solarTime - 12) * 15;
    const H = this.d2r(hourAngleDeg);
    const phi = this.d2r(lat);
    const delta = this.d2r(declination);

    // Güneş Yüksekliği (Altitude)
    const sinAlt = Math.sin(phi) * Math.sin(delta) + Math.cos(phi) * Math.cos(delta) * Math.cos(H);
    const altitudeDeg = this.r2d(Math.asin(Math.max(-1, Math.min(1, sinAlt))));

    // Güneş Azimutu (Kuzeyden saat yönünde 0-360°)
    const y = -Math.sin(H);
    const x = Math.tan(delta) * Math.cos(phi) - Math.sin(phi) * Math.cos(H);
    let azimuth = this.r2d(Math.atan2(y, x));
    azimuth = (azimuth + 360) % 360;

    return {
      azimuth: parseFloat(azimuth.toFixed(1)),
      altitude: parseFloat(altitudeDeg.toFixed(1)),
      isDaylight: altitudeDeg > -0.833
    };
  }

  // Diyanet Klasik Kıble Saati (Güneşin tam Kâbe açısında olduğu saat)
  calculateQiblaHour(date, lat, lon, qiblaAngle, tz = 3.0) {
    try {
      const jd = this.julianDate(date.getFullYear(), date.getMonth() + 1, date.getDate());
      const solar = this.getSolarPosition(jd);
      const delta = this.d2r(solar.declination);
      const phi = this.d2r(lat);
      const q = this.d2r(qiblaAngle);

      const A = 1 / Math.tan(q);
      const B = -Math.sin(phi);
      const C = -Math.cos(phi) * Math.tan(delta);

      const R = Math.sqrt(A * A + B * B);
      if (R === 0 || Math.abs(C / R) > 1) return null;

      const theta = Math.atan2(B, A);
      const asinVal = Math.asin(C / R);

      const H1 = this.r2d(asinVal - theta);
      const H2 = this.r2d(Math.PI - asinVal - theta);

      const candidates = [H1, H2];
      for (const hDeg of candidates) {
        const Hrad = this.d2r(hDeg);
        const sinAlt = Math.sin(phi) * Math.sin(delta) + Math.cos(phi) * Math.cos(delta) * Math.cos(Hrad);
        if (sinAlt > 0) {
          const solarHours = 12 + (hDeg / 15);
          const localHours = solarHours - solar.equationOfTime - ((lon - 15 * tz) / 15);
          return this.formatTime(localHours);
        }
      }
    } catch (e) {
      console.warn("Kıble saati hesaplanamadı:", e);
    }
    return null;
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
    const M = this.methodInfo();
    // Diyanet: Türkiye saati (UTC+3). Diğer yöntemler yurt dışında da kullanılabilir: cihazın saat dilimi esas alınır.
    if (this.method !== 'diyanet') tz = -date.getTimezoneOffset() / 60;
    const tk = M.temkin || { imsak: 0, gunes: 0, ogle: 0, ikindi: 0, aksam: 0, yatsi: 0 };
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    const JD = this.julianDate(year, month, day);
    const { declination, equationOfTime } = this.getSolarPosition(JD);

    // Gerçek Güneş Öğlesi (Dhuhr / Zeval)
    const solarNoon = 12 + tz - (lon / 15) - equationOfTime;

    // Saat Açıları
    const haSunrise = this.getHourAngle(lat, declination, -0.8333); // Ufuk kırılması
    const haFajr = this.getHourAngle(lat, declination, -M.fajr);
    const haIsha = M.ishaMin ? null : this.getHourAngle(lat, declination, -M.isha);
    const haAsr = this.getAsrHourAngle(lat, declination, 1);

    // Temkin Payları (Diyanet Standart Temkini)
    // Öğle: +6 dk temkin, İkindi: +5 dk temkin, Akşam: +7 dk temkin, Yatsı: +1 dk temkin
    const imsak = solarNoon - (haFajr || 6) + (tk.imsak / 60);
    const gunes = solarNoon - (haSunrise || 6) + (tk.gunes / 60);
    const ogle = solarNoon + (tk.ogle / 60);
    const ikindi = solarNoon + (haAsr || 3) + (tk.ikindi / 60);
    const aksam = solarNoon + (haSunrise || 6) + (tk.aksam / 60);
    // Ümmü'l-Kurâ: yatsı = akşam + 90 dk; diğerleri açıya göre
    const yatsi = M.ishaMin ? aksam + (M.ishaMin / 60) : solarNoon + (haIsha || 7) + (tk.yatsi / 60);

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
    const cacheKey = `tamvakti_v2_${lat.toFixed(2)}_${lon.toFixed(2)}_${dateStr}${this._mk()}`;

    // Önbellek kontrolü
    const cached = typeof localStorage !== "undefined" ? localStorage.getItem(cacheKey) : null;
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
      const url = `https://api.aladhan.com/v1/timings/${d}-${m}-${y}?latitude=${lat}&longitude=${lon}&method=${this.methodInfo().id}`;
      
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
            hijri: json.data.date.hijri ? `${json.data.date.hijri.day} ${hijriMonthTr(json.data.date.hijri)} ${json.data.date.hijri.year}` : null,
            hijriDay: json.data.date.hijri ? `${parseInt(json.data.date.hijri.day, 10)} ${hijriMonthTr(json.data.date.hijri)}` : null,
            source: this.method === 'diyanet' ? 'diyanet-api' : 'api'
          };
          try { localStorage.setItem(cacheKey, JSON.stringify(apiTimes)); } catch (e) {}
          return apiTimes;
        }
      }
    } catch (e) {
      // Ağ hatasında offlineTimes ile devam et
    }

    return offlineTimes;
  }

  // Aylık Namaz Vakitleri (Çevrimiçi Diyanet API veya %100 Çevrimdışı Astronomik Hesaplama)
  async getMonthlyPrayerTimes(year, month, lat, lon, tz = 3.0) {
    const monthPadded = String(month).padStart(2, '0');
    const cacheKey = `tamvakti_monthly_v2_${lat.toFixed(2)}_${lon.toFixed(2)}_${year}_${monthPadded}${this._mk()}`;

    const trMonths = [
      '', 'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
      'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
    ];
    const trDaysShort = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
    const trDaysFull = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];

    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    // 1. Önbellek kontrolü
    const cached = typeof localStorage !== "undefined" ? localStorage.getItem(cacheKey) : null;
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed && Array.isArray(parsed.days) && parsed.days.length > 0) {
          // Güncel 'isToday' durumunu yenile
          parsed.days.forEach(d => {
            d.isToday = (d.dateStr === todayStr);
          });
          return parsed;
        }
      } catch (e) {}
    }

    // 2. Çevrimiçi Aladhan Diyanet Calendar API (Method 13)
    try {
      const url = `https://api.aladhan.com/v1/calendar/${year}/${month}?latitude=${lat}&longitude=${lon}&method=${this.methodInfo().id}`;
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        if (json && Array.isArray(json.data) && json.data.length > 0) {
          let hijriSummary = '';
          const days = json.data.map(item => {
            const t = item.timings;
            const greg = item.date.gregorian;
            const hijri = item.date.hijri;
            const dNum = parseInt(greg.day, 10);
            const dDate = new Date(year, month - 1, dNum);
            const dateStr = `${year}-${monthPadded}-${String(dNum).padStart(2, '0')}`;

            if (hijri && hijri.month && !hijriSummary) {
              hijriSummary = `${hijriMonthTr(hijri)} ${hijri.year}`;
            }

            return {
              day: dNum,
              dateStr: dateStr,
              dayOfWeekShort: trDaysShort[dDate.getDay()],
              dayOfWeekFull: trDaysFull[dDate.getDay()],
              isFriday: (dDate.getDay() === 5),
              isToday: (dateStr === todayStr),
              imsak: t.Fajr.substring(0, 5),
              gunes: t.Sunrise.substring(0, 5),
              ogle: t.Dhuhr.substring(0, 5),
              ikindi: t.Asr.substring(0, 5),
              aksam: t.Maghrib.substring(0, 5),
              yatsi: t.Isha.substring(0, 5),
              hijriDay: hijri ? `${parseInt(hijri.day, 10)} ${hijriMonthTr(hijri)}` : null
            };
          });

          const result = {
            year,
            month,
            monthName: trMonths[month] || '',
            hijriSummary: hijriSummary || '',
            days,
            source: this.method === 'diyanet' ? 'diyanet-api' : 'api'
          };
          try {
            if (typeof localStorage !== "undefined") { localStorage.setItem(cacheKey, JSON.stringify(result)); }
          } catch(e) {}
          return result;
        }
      }
    } catch (e) {
      // Ağ hatasında hemen yerel hesaba geç
    }

    // 3. %100 Çevrimdışı Astronomik Hesaplama (Yedek & Tam Güvenilirlik)
    const daysInMonth = new Date(year, month, 0).getDate();
    const days = [];
    let hijriSummaryOffline = '';

    for (let d = 1; d <= daysInMonth; d++) {
      const dDate = new Date(year, month - 1, d);
      const times = this.calculateTimesOffline(dDate, lat, lon, tz);
      const isFri = (dDate.getDay() === 5);
      const isTod = (times.date === todayStr);

      let hijriDayStr = null;
      try {
        const parts = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {
          day: 'numeric',
          month: 'numeric'
        }).formatToParts(dDate);
        const islamicMonths = [
          '', 'Muharrem', 'Sefer', 'Rebiülevvel', 'Rebiülahir',
          'Cemaziyelevvel', 'Cemaziyelahir', 'Recep', 'Şaban',
          'Ramazan', 'Şevval', 'Zilkade', 'Zilhicce'
        ];
        const hDay = parts.find(p => p.type === 'day')?.value || '';
        const hMonthNum = parseInt(parts.find(p => p.type === 'month')?.value || '1', 10);
        const hMonth = islamicMonths[hMonthNum] || '';
        hijriDayStr = `${hDay} ${hMonth}`;
        if (d === 15) {
          hijriSummaryOffline = hMonth;
        }
      } catch(e) {}

      days.push({
        day: d,
        dateStr: times.date,
        dayOfWeekShort: trDaysShort[dDate.getDay()],
        dayOfWeekFull: trDaysFull[dDate.getDay()],
        isFriday: isFri,
        isToday: isTod,
        imsak: times.imsak,
        gunes: times.gunes,
        ogle: times.ogle,
        ikindi: times.ikindi,
        aksam: times.aksam,
        yatsi: times.yatsi,
        hijriDay: hijriDayStr
      });
    }

    return {
      year,
      month,
      monthName: trMonths[month] || '',
      hijriSummary: hijriSummaryOffline,
      days,
      source: 'offline-astronomical'
    };
  }
}


if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PrayerEngine, hijriMonthTr, CALC_METHODS, methodForLocation };
}
