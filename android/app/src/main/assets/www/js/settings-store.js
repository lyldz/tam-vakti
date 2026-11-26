(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.TamVaktiSettings = factory();
})(typeof self !== 'undefined' ? self : globalThis, function () {
  'use strict';

  const PRAYER_KEYS = ['imsak', 'gunes', 'ogle', 'ikindi', 'aksam', 'yatsi'];
  const VALID_TONES = new Set([
    'telefon', 'cagri', 'billur', 'seher', 'damla', 'sabahcani',
    'sudamlasi', 'neynefesi', 'udteli', 'kanun', 'akor',
  ]);
  const VALID_NOTIF_MODES = new Set(['bip', 'sessiz']);
  const VALID_HOME_MODES = new Set(['detail', 'focus']);

  function defaultPrayerAlerts() {
    const out = {};
    for (const k of PRAYER_KEYS) out[k] = { at: k !== 'gunes', before: 0 };
    return out;
  }

  function createDefaults() {
    return {
      ongoingNotifEnabled: true,
      autoSilent: true,
      autoLocation: false,
      homeMode: 'detail',
      notifMode: 'bip',
      kerahatAlert: true,
      fullScreenAlert: false,
      alertTone: 'telefon',
      calcMethodPref: 'auto',
      timeOffsetMin: 0,
      prayerAlerts: defaultPrayerAlerts(),
      // Yeni dinamik ayarlar ve aç/kapa anahtarları
      silentDurationMin: 30,
      fridaySilentDurationMin: 60,
      kerahatMinutes: 45,
      showSeconds: true,
      showHijriDate: true,
      showSolarArc: true,
      autoUpdateCheck: true,
      permReminderHint: true,
      showHomeModeHint: true,
      toastDurationMs: 3000,
      // Eskiden koda gömülüydü; varsayılanlar eski değerlerle aynı
      onlineGeocode: true,
      autoLocationIntervalMin: 15,
      autoLocationHysteresisKm: 1,
      updateDismissHours: 24,
      updateCheckTimeoutSec: 5,
      geocodeTimeoutSec: 2,
      scheduleHorizonDays: 30,
      scheduleSyncDelayMs: 600,
    };
  }

  function clampNum(v, min, max, fallback, digits) {
    if (typeof v === 'boolean' || v === null || v === undefined || v === '') return fallback;
    const n = Number(v);
    if (!Number.isFinite(n)) return fallback;
    const c = Math.min(max, Math.max(min, n));
    return Number(c.toFixed(digits === undefined ? 1 : digits));
  }

  function clampInt(v, min, max, fallback) {
    if (typeof v === 'boolean' || v === null || v === undefined || v === '') return fallback;
    const n = Number(v);
    if (!Number.isFinite(n)) return fallback;
    return Math.min(max, Math.max(min, Math.round(n)));
  }

  function boolVal(v, fallback) {
    return typeof v === 'boolean' ? v : fallback;
  }

  function sanitizePrayerAlerts(raw) {
    const def = defaultPrayerAlerts();
    if (!raw || typeof raw !== 'object') return def;
    for (const k of PRAYER_KEYS) {
      if (raw[k] && typeof raw[k] === 'object') {
        def[k] = {
          at: typeof raw[k].at === 'boolean' ? raw[k].at : def[k].at,
          before: clampInt(raw[k].before, 0, 60, 0),
        };
      }
    }
    return def;
  }

  function sanitizeSettings(raw) {
    const def = createDefaults();
    const s = (raw && typeof raw === 'object') ? raw : {};
    return {
      ongoingNotifEnabled: boolVal(s.ongoingNotifEnabled, def.ongoingNotifEnabled),
      autoSilent: boolVal(s.autoSilent, def.autoSilent),
      autoLocation: boolVal(s.autoLocation, def.autoLocation),
      homeMode: VALID_HOME_MODES.has(s.homeMode) ? s.homeMode : def.homeMode,
      notifMode: VALID_NOTIF_MODES.has(s.notifMode) ? s.notifMode : def.notifMode,
      kerahatAlert: boolVal(s.kerahatAlert, def.kerahatAlert),
      fullScreenAlert: boolVal(s.fullScreenAlert, def.fullScreenAlert),
      alertTone: VALID_TONES.has(s.alertTone) ? s.alertTone : def.alertTone,
      calcMethodPref: (typeof s.calcMethodPref === 'string' && s.calcMethodPref.trim()) ? s.calcMethodPref.trim().slice(0, 32) : def.calcMethodPref,
      timeOffsetMin: clampInt(s.timeOffsetMin, -15, 15, def.timeOffsetMin),
      prayerAlerts: sanitizePrayerAlerts(s.prayerAlerts),
      silentDurationMin: clampInt(s.silentDurationMin, 10, 90, def.silentDurationMin),
      fridaySilentDurationMin: clampInt(s.fridaySilentDurationMin, 20, 120, def.fridaySilentDurationMin),
      kerahatMinutes: clampInt(s.kerahatMinutes, 20, 60, def.kerahatMinutes),
      showSeconds: boolVal(s.showSeconds, def.showSeconds),
      showHijriDate: boolVal(s.showHijriDate, def.showHijriDate),
      showSolarArc: boolVal(s.showSolarArc, def.showSolarArc),
      autoUpdateCheck: boolVal(s.autoUpdateCheck, def.autoUpdateCheck),
      permReminderHint: boolVal(s.permReminderHint, def.permReminderHint),
      showHomeModeHint: boolVal(s.showHomeModeHint, def.showHomeModeHint),
      toastDurationMs: clampInt(s.toastDurationMs, 1500, 8000, def.toastDurationMs),
      onlineGeocode: boolVal(s.onlineGeocode, def.onlineGeocode),
      autoLocationIntervalMin: clampInt(s.autoLocationIntervalMin, 1, 120, def.autoLocationIntervalMin),
      autoLocationHysteresisKm: clampNum(s.autoLocationHysteresisKm, 0, 10, def.autoLocationHysteresisKm, 1),
      updateDismissHours: clampInt(s.updateDismissHours, 1, 168, def.updateDismissHours),
      updateCheckTimeoutSec: clampInt(s.updateCheckTimeoutSec, 2, 30, def.updateCheckTimeoutSec),
      geocodeTimeoutSec: clampInt(s.geocodeTimeoutSec, 1, 10, def.geocodeTimeoutSec),
      scheduleHorizonDays: clampInt(s.scheduleHorizonDays, 7, 30, def.scheduleHorizonDays),
      scheduleSyncDelayMs: clampInt(s.scheduleSyncDelayMs, 200, 3000, def.scheduleSyncDelayMs),
    };
  }

  function exportBackupJson(settings, location, version) {
    return JSON.stringify({
      format: 'tam-vakti-settings',
      version: 1,
      appVersion: version || '',
      exportedAt: new Date().toISOString(),
      settings: sanitizeSettings(settings),
      location: location && !location.isPlaceholder ? { name: location.name, lat: location.lat, lon: location.lon } : null,
    }, null, 2);
  }

  function parseBackupJson(rawText) {
    try {
      const obj = JSON.parse(rawText);
      if (!obj || typeof obj !== 'object') return null;
      if (obj.format && obj.format !== 'tam-vakti-settings') return null;
      const settingsObj = (obj.settings && typeof obj.settings === 'object') ? obj.settings : obj;
      const loc = obj.location && typeof obj.location === 'object' && typeof obj.location.lat === 'number' && typeof obj.location.lon === 'number'
        ? { name: String(obj.location.name || '').slice(0, 80), lat: obj.location.lat, lon: obj.location.lon }
        : null;
      return { settings: sanitizeSettings(settingsObj), location: loc };
    } catch {
      return null;
    }
  }

  return { createDefaults, sanitizeSettings, exportBackupJson, parseBackupJson };
});
