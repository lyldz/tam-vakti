const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createDefaults, sanitizeSettings, exportBackupJson, parseBackupJson } = require('../www/js/settings-store.js');

const DEF = createDefaults();
const KEYS = Object.keys(DEF);
const BOOLS = KEYS.filter(k => typeof DEF[k] === 'boolean');
const NUMS = KEYS.filter(k => typeof DEF[k] === 'number');
const STRS = KEYS.filter(k => typeof DEF[k] === 'string');
const OBJS = KEYS.filter(k => typeof DEF[k] === 'object');
const NASTY = [0, -1, '', null, undefined, 'abc', [], {}, 1e12, -1e12, NaN, Infinity, -Infinity, true, false, '0'];
const roundTrip = s => parseBackupJson(exportBackupJson(s, null, 'x')).settings;

test('every key is classified and defaults survive sanitize + backup round trip', () => {
  assert.equal(BOOLS.length + NUMS.length + STRS.length + OBJS.length, KEYS.length);
  assert.deepEqual(sanitizeSettings(DEF), DEF);
  assert.deepEqual(roundTrip(DEF), DEF);
});

test('every boolean toggles true<->false and persists through JSON backup', () => {
  for (const k of BOOLS) for (const v of [!DEF[k], DEF[k]]) assert.equal(roundTrip({ ...DEF, [k]: v })[k], v, k);
});

test('every key survives every nasty value (no throw, same shape, finite numbers)', () => {
  for (const k of KEYS) for (const bad of NASTY) {
    const out = sanitizeSettings({ ...DEF, [k]: bad });
    assert.deepEqual(Object.keys(out).sort(), KEYS.slice().sort(), `${k}=${String(bad)}`);
    assert.equal(typeof out[k], typeof DEF[k], `${k}=${String(bad)}`);
    if (typeof out[k] === 'number') assert.ok(Number.isFinite(out[k]), `${k}=${String(bad)}`);
  }
});

test('every number clamps and both edges persist through backup', () => {
  for (const k of NUMS) {
    const lo = sanitizeSettings({ ...DEF, [k]: -1e9 })[k];
    const hi = sanitizeSettings({ ...DEF, [k]: 1e9 })[k];
    assert.ok(lo <= hi, k);
    for (const e of [lo, hi]) assert.equal(roundTrip({ ...DEF, [k]: e })[k], e, k);
  }
});

test('enum strings reject garbage', () => {
  for (const k of STRS) {
    if (k === 'calcMethodPref') continue; // serbest metin (yöntem adı), boş olamaz
    assert.equal(sanitizeSettings({ ...DEF, [k]: 'zzz-gecersiz' })[k], DEF[k], k);
  }
});

test('old saved settings without the new keys keep the old hardcoded behaviour', () => {
  const old = sanitizeSettings({ kerahatMinutes: 30 });
  assert.equal(old.kerahatMinutes, 30);
  assert.deepEqual(
    [old.onlineGeocode, old.autoLocationIntervalMin, old.autoLocationHysteresisKm, old.updateDismissHours,
      old.updateCheckTimeoutSec, old.geocodeTimeoutSec, old.scheduleHorizonDays, old.scheduleSyncDelayMs],
    [true, 15, 1, 24, 5, 2, 30, 600],
  );
});

test('hysteresis keeps one decimal and the 0 edge is valid', () => {
  assert.equal(sanitizeSettings({ autoLocationHysteresisKm: 0 }).autoLocationHysteresisKm, 0);
  assert.equal(sanitizeSettings({ autoLocationHysteresisKm: 0.5 }).autoLocationHysteresisKm, 0.5);
  assert.equal(sanitizeSettings({ autoLocationHysteresisKm: 2.26 }).autoLocationHysteresisKm, 2.3);
});

const app = fs.readFileSync(path.join(__dirname, '..', 'www', 'js', 'app.js'), 'utf8');
const html = fs.readFileSync(path.join(__dirname, '..', 'www', 'index.html'), 'utf8');

test('every setting is wired in app.js (load, save, snapshot, apply) and exposed in the settings UI', () => {
  for (const k of KEYS) {
    const n = (app.match(new RegExp(`\\b${k}\\b`, 'g')) || []).length;
    assert.ok(n >= 2, `app.js içinde ${k} yeterince geçmiyor (${n})`);
  }
  const extra = KEYS.filter(k => new RegExp(`${k}:`).test(app.slice(app.indexOf('const EXT_EXTRA_DEFAULTS'), app.indexOf('const EXT_NUM_DEFS'))));
  for (const k of extra) {
    if (typeof DEF[k] === 'boolean') assert.ok(html.includes(`${k}Toggle`) || html.includes(`'${k}'`), `index.html'de ${k} anahtarı yok`);
    else assert.ok(html.includes(`openExtNumModal('${k}')`), `index.html'de ${k} satırı yok`);
  }
  assert.equal(extra.length, 10);
});

test('www and android assets stay identical', () => {
  const a = path.join(__dirname, '..', 'www');
  const b = path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'assets', 'www');
  for (const f of ['index.html', 'js/app.js', 'js/settings-store.js']) {
    assert.equal(fs.readFileSync(path.join(a, f), 'utf8'), fs.readFileSync(path.join(b, f), 'utf8'), f);
  }
});
