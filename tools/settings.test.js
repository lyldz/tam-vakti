const test = require('node:test');
const assert = require('node:assert/strict');
const { createDefaults, sanitizeSettings, exportBackupJson, parseBackupJson } = require('../www/js/settings-store.js');

const BOOL_KEYS = [
  'ongoingNotifEnabled', 'autoSilent', 'autoLocation', 'kerahatAlert', 'fullScreenAlert',
  'showSeconds', 'showHijriDate', 'showSolarArc', 'autoUpdateCheck', 'permReminderHint', 'showHomeModeHint',
];

test('all 21 settings fields exist and pass sanitization cleanly', () => {
  const def = createDefaults();
  assert.equal(Object.keys(def).length, 21);
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
});
