const test = require('node:test');
const assert = require('node:assert/strict');
const { createDefaults, sanitizeSettings, exportBackupJson, parseBackupJson } = require('../www/js/settings-store.js');

const BOOL_KEYS = [
  'ongoingNotifEnabled', 'autoSilent', 'autoLocation', 'kerahatAlert', 'fullScreenAlert',
  'showSeconds', 'showHijriDate', 'showSolarArc', 'autoUpdateCheck', 'permReminderHint', 'showHomeModeHint',
];

test('all 31 settings fields exist and pass sanitization cleanly', () => {
  const def = createDefaults();
  assert.equal(Object.keys(def).length, 31);
  assert.deepEqual(sanitizeSettings(def), def);
});

test('all boolean toggles flip true <-> false and persist through JSON export/import', () => {
  const off = { ...createDefaults() };
  for (const k of BOOL_KEYS) off[k] = false;
  const parsedOff = parseBackupJson(exportBackupJson(off, null, 'v2.14.0'));
  assert.ok(parsedOff);
  for (const k of BOOL_KEYS) assert.equal(parsedOff.settings[k], false, `${k} should be false`);

  const on = { ...parsedOff.settings };
  for (const k of BOOL_KEYS) on[k] = true;
  const parsedOn = parseBackupJson(exportBackupJson(on, null, 'v2.14.0'));
  assert.ok(parsedOn);
  for (const k of BOOL_KEYS) assert.equal(parsedOn.settings[k], true, `${k} should be true`);
});

test('custom numeric, enum, and per-prayer settings round-trip via JSON backup', () => {
  const custom = {
    ...createDefaults(),
    homeMode: 'focus',
    notifMode: 'sessiz',
    alertTone: 'neynefesi',
    calcMethodPref: 'mwl',
    timeOffsetMin: 3,
    silentDurationMin: 45,
    fridaySilentDurationMin: 90,
    kerahatMinutes: 30,
    toastDurationMs: 5000,
    prayerAlerts: {
      imsak: { at: true, before: 15 },
      gunes: { at: true, before: 10 },
      ogle: { at: false, before: 30 },
      ikindi: { at: true, before: 0 },
      aksam: { at: true, before: 5 },
      yatsi: { at: false, before: 0 },
    },
  };
  const loc = { name: 'Ankara/Çankaya', lat: 39.9, lon: 32.85 };
  const parsed = parseBackupJson(exportBackupJson(custom, loc, 'v2.14.0'));
  assert.deepEqual(parsed.settings, custom);
  assert.deepEqual(parsed.location, loc);
});

test('extreme, zero, empty, NaN, and invalid values never crash and clamp/fallback safely', () => {
  const bad = {
    ongoingNotifEnabled: 'yes',
    autoSilent: 0,
    homeMode: 'invalid',
    notifMode: 'ezan',
    alertTone: 'nonexistent',
    calcMethodPref: '   ',
    timeOffsetMin: 999,
    silentDurationMin: 0,
    fridaySilentDurationMin: -20,
    kerahatMinutes: NaN,
    toastDurationMs: 0,
    prayerAlerts: { imsak: { at: 'yes', before: 999 } },
  };
  const safe = sanitizeSettings(bad);
  const def = createDefaults();
  assert.equal(safe.ongoingNotifEnabled, def.ongoingNotifEnabled);
  assert.equal(safe.homeMode, def.homeMode);
  assert.equal(safe.notifMode, def.notifMode);
  assert.equal(safe.alertTone, def.alertTone);
  assert.equal(safe.calcMethodPref, def.calcMethodPref);
  assert.equal(safe.timeOffsetMin, 15);
  assert.equal(safe.silentDurationMin, 10);
  assert.equal(safe.fridaySilentDurationMin, 20);
  assert.equal(safe.kerahatMinutes, 45);
  assert.equal(safe.toastDurationMs, 1500);
  assert.equal(safe.prayerAlerts.imsak.before, 60);
  assert.equal(parseBackupJson('not json'), null);
  assert.equal(parseBackupJson('{"format":"wrong"}'), null);
  assert.equal(parseBackupJson('{"a":1}'), null);
  const badLoc = parseBackupJson(JSON.stringify({
    format: 'tam-vakti-settings',
    settings: { homeMode: 'focus' },
    location: { name: 'Mars', lat: 95, lon: 200 },
  }));
  assert.ok(badLoc);
  assert.equal(badLoc.location, null);
});

test('PrayerEngine: calculateQiblaHour matches sun azimuth and high-latitude times stay ordered', () => {
  const { PrayerEngine } = require('../www/js/prayer-engine.js');
  const eng = new PrayerEngine();
  // İstanbul için yaz günü kıble saati: güneş azimutu kıble açısına (~152°) yakın olmalı
  const istQ = eng.calculateQibla(41.0082, 28.9784).angle;
  const qTime = eng.calculateQiblaHour(new Date(2026, 5, 21, 12, 0, 0), 41.0082, 28.9784, istQ, 3);
  assert.ok(qTime && /^\d{2}:\d{2}$/.test(qTime), `qTime=${qTime}`);
  const [qh, qm] = qTime.split(':').map(Number);
  const sun = eng.getSunPositionNow(new Date(2026, 5, 21, qh, qm, 0), 41.0082, 28.9784, 3);
  const azDiff = Math.abs(((sun.azimuth - istQ + 540) % 360) - 180);
  assert.ok(azDiff < 3, `Güneş azimutu (${sun.azimuth}°) kıble açısına (${istQ}°) yakın olmalı`);

  // Yüksek enlemde (Stockholm 59.3°N, 21 Haziran) vakit sırası bozulmamalı
  eng.setMethod('mwl');
  const hi = eng.calculateTimesOffline(new Date(2026, 5, 21, 12, 0, 0), 59.3293, 18.0686, 2);
  const toMin = (s) => { const [h, m] = s.split(':').map(Number); return h * 60 + m; };
  assert.ok(toMin(hi.imsak) < toMin(hi.gunes), `${hi.imsak} < ${hi.gunes}`);
  assert.ok(toMin(hi.gunes) < toMin(hi.ogle), `${hi.gunes} < ${hi.ogle}`);
  assert.ok(toMin(hi.ogle) < toMin(hi.ikindi), `${hi.ogle} < ${hi.ikindi}`);
  assert.ok(toMin(hi.ikindi) < toMin(hi.aksam), `${hi.ikindi} < ${hi.aksam}`);
  assert.ok(toMin(hi.aksam) < toMin(hi.yatsi), `${hi.aksam} < ${hi.yatsi}`);
});
