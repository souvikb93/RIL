/* EmPower – prototype.
   Step 1: pick a question (Today / Plan / My place). Step 2: explore it on one map.
   Design rules: DESIGN.md.
   Every number comes from ASSUME, DISTRICTS and the slider values. */

const ASSUME = {
  mwPerTurbine: 6.5,        // EPP BB30: 1,769 MW ≈ 272 turbines
  haPerMwWind: 4.17,        // EPP BB30: 7,373 ha / 1,769 MW
  haPerMwpPV: 1.0,          // EPP BB30: 1,329 ha / 1,330 MWp
  flhWind: 2100,            // full-load hours, new onshore turbines
  flhFF: 1000,
  flhRoof: 900,
  kwhPerHousehold: 2500,
  eegEurPerKwh: 0.002,      // § 6 EEG: up to 0.2 ct/kWh to municipalities
  eegRadiusKm: 2.5,         // wind: municipalities within 2.5 km
  co2KgPerKwh: 0.4,
  kwpPerRoof: 10,
  haPerPitch: 0.714,
  windAreaTargetPct: 2.2,   // Brandenburg wind land target 2032
  settleBufferKm: 1.0,      // min. wind distance to settlements (simplified)
};

// Today, per district (estimates; sums match the region's "Today" scenario).
const DISTRICTS = {
  'Märkisch-Oderland': { short: 'MOL', pop: 196000, wind: 620, ff: 380, roof: 160, demand: 1350 },
  'Oder-Spree': { short: 'LOS', pop: 183000, wind: 560, ff: 470, roof: 170, demand: 2000 },
  'Frankfurt (Oder)': { short: 'FF', pop: 57000, wind: 25, ff: 30, roof: 63, demand: 450 },
};
const sumD = (k) => Object.values(DISTRICTS).reduce((a, d) => a + d[k], 0);
const DEMAND_TODAY = sumD('demand');

const SCENARIOS = {
  heute: { label: t('sc.heute'), short: t('sc.heute.tag'), line: t('sc.heute.line'), wind: sumD('wind'), ff: sumD('ff'), roof: sumD('roof'), demand: 100,
    note: 'Approximate current state. Every comparison starts here.' },
  bb30: { label: 'BB 2030', short: t('sc.bb30.tag'), line: t('sc.bb30.line'), wind: 1769, ff: 1330, roof: 1440, demand: 115,
    note: 'Brandenburg Energy Strategy 2030, broken down to this region (15.4 % share).' },
  bb40: { label: 'BB 2040', short: t('sc.bb40.tag'), line: t('sc.bb40.line'), wind: 2387, ff: 2440, roof: 2642, demand: 135,
    note: 'State targets 2040 × 15.4 % regional share. Our derivation, not an official value.' },
  eigen: { label: t('sc.eigen'), short: t('sc.eigen.tag'), line: t('sc.eigen.line') },
};

const SLIDERS = [
  { key: 'wind', label: t('sl.wind'), unit: 'MW', min: 0, max: 4000, step: 25, color: 'var(--wind)', main: true },
  { key: 'ff', label: t('sl.ff'), unit: 'MWp', min: 0, max: 5000, step: 25, color: 'var(--solar)', main: true },
  { key: 'roof', label: t('sl.roof'), unit: 'MWp', min: 0, max: 4000, step: 25, color: 'var(--solar-roof)' },
  { key: 'demand', label: t('sl.demand'), unit: t('sl.ofToday'), min: 50, max: 200, step: 5, color: 'var(--navy)' },
];

// Three per category; unbuilt ones stay visible but disabled.
const METRICS = [
  { group: 'Energy', items: [
    { key: 'share', label: t('m.share'), unit: '%', breaks: [25, 50, 75, 100], d: 0, desc: t('m.share.d') },
    { key: 'gen', label: t('m.gen'), unit: 'GWh', breaks: [100, 500, 1000, 1500], d: 0, desc: t('m.gen.d') },
    { key: 'mw', label: t('m.mw'), unit: 'MW', breaks: [100, 300, 600, 900], d: 0, desc: t('m.mw.d') },
  ] },
  { group: 'Land', items: [
    { key: 'windLand', label: t('m.windLand'), unit: '%', breaks: [0.25, 0.5, 1, 2.2], d: 2, desc: t('m.windLand.d') },
    { key: 'windTarget', label: t('m.windTarget'), unit: '%', breaks: [25, 50, 75, 100], d: 0, desc: t('m.windTarget.d') },
    { key: 'pvLand', label: t('m.pvLand'), unit: '%', breaks: [0.05, 0.1, 0.2, 0.4], d: 2, desc: t('m.pvLand.d') },
  ] },
  { group: 'Demand', items: [
    { key: 'demand', label: t('m.demand'), unit: 'GWh', breaks: [250, 500, 1000, 1500], d: 0, desc: t('m.demand.d') },
    { key: 'perCap', label: t('m.perCap'), unit: 'kWh', breaks: [4000, 6000, 8000, 10000], d: 0, desc: t('m.perCap.d') },
    { key: 'heat', label: t('m.heat'), soon: true, desc: t('m.heat.d') },
  ] },
];
const METRIC = Object.fromEntries(METRICS.flatMap((g) => g.items).map((m) => [m.key, m]));
const SCALE = ['#e6edf1', '#bccbd4', '#8aa3b1', '#56778a', '#214152'];

const CONTEXT_LAYERS = [
  { group: 'Energy potential', items: [
    { id: 'potential', label: t('ly.potential'), color: 'rgba(3,126,158,.18)' },
    { id: 'pvpotential', label: t('ly.pvpotential'), color: 'rgba(255,216,0,.35)' },
  ] },
  { group: 'Settlements & infrastructure', items: [
    { id: 'excluded', label: t('ly.excluded'), color: 'rgba(142,154,161,.4)' },
    { id: 'grid', label: t('ly.grid'), soon: true },
  ] },
  { group: 'Nature', items: [
    { id: 'nature', label: t('ly.nature'), color: 'rgba(102,204,102,.45)' },
    { id: 'water', label: t('ly.water'), soon: true },
  ] },
];

const fmt = (n, d = 0) => n.toLocaleString(I18N.locale, { maximumFractionDigits: d, minimumFractionDigits: d });
// € amounts: "€10.1m" / "10,1 Mio. €"
const eurM = (m) => (I18N.lang === 'de' ? `${fmt(m, 1)} Mio. €` : `€${fmt(m, 1)}m`);
const eur = (n) => {
  if (n >= 1e6) return eurM(n / 1e6);
  const v = n > 0 ? fmt(Math.round(n / 1000) * 1000) : '0';
  return I18N.lang === 'de' ? `${v} €` : `€${v}`;
};
const $ = (s) => document.querySelector(s);

const state = {
  mode: 'home', scenario: 'bb30', lastPreset: 'bb30', metric: 'share',
  ...pick(SCENARIOS.bb30), check: null, layers: new Set(),
};
function pick(s) { return { wind: s.wind, ff: s.ff, roof: s.roof, demand: s.demand }; }

/* ---------- Model ---------- */
function compute(v) {
  const windGWh = v.wind * ASSUME.flhWind / 1000;
  const ffGWh = v.ff * ASSUME.flhFF / 1000;
  const roofGWh = v.roof * ASSUME.flhRoof / 1000;
  const gen = windGWh + ffGWh + roofGWh;
  const demand = DEMAND_TODAY * v.demand / 100;
  const windHa = v.wind * ASSUME.haPerMwWind;
  const pvHa = v.ff * ASSUME.haPerMwpPV;
  return {
    windGWh, ffGWh, roofGWh, gen, demand,
    share: demand ? gen / demand * 100 : 0,
    households: gen * 1e6 / ASSUME.kwhPerHousehold,
    turbines: Math.round(v.wind / ASSUME.mwPerTurbine),
    windHa, pvHa,
    windPct: windHa / geo.regionHa * 100,
    pvPct: pvHa / geo.regionHa * 100,
    eeg: (windGWh + ffGWh) * 1e6 * ASSUME.eegEurPerKwh,
    co2t: gen * 1e6 * ASSUME.co2KgPerKwh / 1000,
  };
}

function districtMetric(d, ha, key) {
  const gen = d.wind * ASSUME.flhWind / 1000 + d.ff * ASSUME.flhFF / 1000 + d.roof * ASSUME.flhRoof / 1000;
  switch (key) {
    case 'share': return gen / d.demand * 100;
    case 'gen': return gen;
    case 'windLand': return d.wind * ASSUME.haPerMwWind / ha * 100;
    case 'pvLand': return d.ff * ASSUME.haPerMwpPV / ha * 100;
    case 'mw': return d.wind + d.ff + d.roof;
    case 'windTarget': return d.wind * ASSUME.haPerMwWind / ha * 100 / ASSUME.windAreaTargetPct * 100;
    case 'demand': return d.demand;
    case 'perCap': return d.demand * 1e6 / d.pop;
  }
}
function regionMetric(key) {
  const r = compute(SCENARIOS.heute);
  const t = SCENARIOS.heute;
  return { share: r.share, gen: r.gen, mw: t.wind + t.ff + t.roof, windLand: r.windPct, pvLand: r.pvPct,
    windTarget: r.windPct / ASSUME.windAreaTargetPct * 100, demand: r.demand,
    perCap: r.demand * 1e6 / sumD('pop') }[key];
}

/* ---------- Geo prep (demo suitability on real boundaries + OSM settlements) ---------- */
const geo = { regionHa: 1, cells: [], cellHa: 1, windOrder: [], pvOrder: [], places: [] };
const KX = 111.32 * Math.cos(52.4 * Math.PI / 180), KY = 111.2;
const distKm = (ax, ay, bx, by) => Math.hypot((ax - bx) * KX, (ay - by) * KY);

// Smooth deterministic field in 0..1 – stands in for wind yield / nature conflicts.
function field(x, y, s) {
  const v = 0.5 + 0.2 * Math.sin(x * 23 + s) + 0.15 * Math.sin(y * 31 + 2 * s)
    + 0.1 * Math.sin((x - y) * 47 + 3 * s) + 0.05 * Math.sin((x + 2 * y) * 91 + s);
  return Math.min(1, Math.max(0, v));
}

function prepareGeo(bb, places) {
  const region = bb.features.filter((f) => f.properties.region);
  region.forEach((f, i) => { f.id = i; f.properties.ha = turf.area(f) / 1e4; });
  geo.regionHa = region.reduce((a, f) => a + f.properties.ha, 0);
  geo.places = places;

  const bbox = turf.bbox({ type: 'FeatureCollection', features: region });
  const hex = turf.hexGrid(bbox, 0.9, { units: 'kilometers' });
  geo.cellHa = turf.area(hex.features[0]) / 1e4;
  const radius = { c: 3.0, t: 1.5, v: 0.5 };

  const cells = [];
  hex.features.forEach((f) => {
    const [x, y] = turf.centroid(f).geometry.coordinates;
    if (!region.some((r) => turf.booleanPointInPolygon([x, y], r))) return;
    let dEff = Infinity;
    for (const p of places) {
      const d = distKm(x, y, p.x, p.y) - radius[p.t];
      if (d < dEff) dEff = d;
    }
    const conflict = field(x, y, 7.3);
    const windRes = field(x, y, 1.1);
    const windOk = dEff >= ASSUME.settleBufferKm && conflict < 0.68;
    const pvOk = dEff >= 0.15 && conflict < 0.62;
    const south = (52.95 - y) / 1.0;
    const id = cells.length;
    cells.push({
      id, x, y, dEff, windOk, pvOk,
      windScore: 0.65 * windRes + 0.35 * Math.min(dEff / 4, 1),
      pvScore: 0.5 * (1 - conflict) + 0.3 * Math.max(0, 1 - Math.abs(dEff - 1.5) / 3) + 0.2 * south,
    });
    f.id = id;
    f.properties = { ex: dEff < ASSUME.settleBufferKm ? 1 : 0, ok: windOk ? 1 : 0, pv: pvOk ? 1 : 0, nat: conflict >= 0.68 ? 1 : 0 };
  });
  geo.cells = cells;
  geo.hex = { type: 'FeatureCollection', features: hex.features.filter((f) => f.id !== undefined) };
  geo.windOrder = cells.filter((c) => c.windOk).sort((a, b) => b.windScore - a.windScore).map((c) => c.id);
  const windReserved = new Set(geo.windOrder.slice(0, 110));
  geo.pvOrder = cells.filter((c) => c.pvOk && !windReserved.has(c.id))
    .sort((a, b) => b.pvScore - a.pvScore).map((c) => c.id);
  geo.region = { type: 'FeatureCollection', features: region };
  try { geo.outline = turf.union(geo.region) || geo.region; } catch { geo.outline = geo.region; }
  geo.others = { type: 'FeatureCollection', features: bb.features.filter((f) => !f.properties.region) };
}

/* Allocation: state per cell. 1 wind existing, 2 wind new, 3 solar existing, 4 solar new */
let cellState = [];
function allocate(v) {
  const today = SCENARIOS.heute;
  const n = (ha) => (ha > 0 ? Math.ceil(ha / geo.cellHa) : 0);
  const next = new Array(geo.cells.length).fill(0);
  const wN = Math.min(n(v.wind * ASSUME.haPerMwWind), geo.windOrder.length);
  const wT = n(today.wind * ASSUME.haPerMwWind);
  geo.windOrder.slice(0, wN).forEach((id, i) => { next[id] = i < wT ? 1 : 2; });
  const pN = Math.min(n(v.ff * ASSUME.haPerMwpPV), geo.pvOrder.length);
  const pT = n(today.ff * ASSUME.haPerMwpPV);
  geo.pvOrder.slice(0, pN).forEach((id, i) => { next[id] = i < pT ? 3 : 4; });

  if (map && map.getSource('cells')) {
    next.forEach((s, id) => {
      if (cellState[id] !== s) map.setFeatureState({ source: 'cells', id }, { s });
    });
  }
  cellState = next;
  return {
    windShort: v.wind * ASSUME.haPerMwWind > geo.windOrder.length * geo.cellHa,
    windAvailHa: geo.windOrder.length * geo.cellHa,
  };
}

/* ---------- KPI cards (always present) ---------- */
const isTodayLike = () => state.mode === 'today' || state.mode === 'home';

// One shape for every card: label · change badge / value / bar (today tick, target) / note.
const KPI_CARDS = [
  { id: 'share', label: t('k.share'), dot: 'var(--navy)', v: (r) => r.share, show: (v) => [fmt(v), '%'],
    max: 200, target: 100, delta: (d) => `${fmt(d)}${t('k.pts')}`, note: t('k.share.n') },
  { id: 'turbines', label: t('k.turbines'), dot: 'var(--wind)', v: (r) => r.turbines, show: (v) => [`≈ ${fmt(v)}`, ''],
    max: 620, delta: (d) => fmt(d), note: t('k.turbines.n') },
  { id: 'land', label: t('k.land'), dot: 'var(--wind)', v: (r) => r.windPct, show: (v) => [fmt(v, 2), '%'],
    max: 3.3, target: 2.2, delta: (d) => `${fmt(d, 2)}${t('k.pts')}`, note: t('k.land.n') },
  { id: 'eeg', label: t('k.eeg'), dot: 'var(--navy)', v: (r) => r.eeg / 1e6, show: (v) => [eurM(v), t('perYear')],
    max: 27, delta: (d) => eurM(d), note: t('k.eeg.n') },
];
const kpiShown = {};   // last value per card, for count-up

function buildKpis() {
  $('#kpis').innerHTML = `
    <button type="button" class="kcard ctx" data-goto="plan-start" aria-label="${t('k.change')}">
      <span class="khead"><span class="klabel">${t('k.showing')}</span><span class="pill ghost">·</span></span>
      <span class="kval" id="k-ctx"></span>
      <span class="kmeter ctx-meter" aria-hidden="true"><span id="k-ctx-bar"></span></span>
      <span class="ksub" id="k-ctx-sub"></span>
    </button>
    ${KPI_CARDS.map((c) => `
    <button type="button" class="kcard" data-k="${c.id}" aria-expanded="false" aria-controls="kdrawer">
      <span class="khead"><span class="klabel"><i style="background:${c.dot}"></i>${c.label}</span><span class="pill" id="k-${c.id}-pill"></span></span>
      <span class="kval"><span id="k-${c.id}-val"></span> <small id="k-${c.id}-unit"></small></span>
      <span class="kmeter"><span class="fill" id="k-${c.id}-bar" style="background:${c.dot}"></span>
        <i class="today-tick" id="k-${c.id}-tick" title="${t('k.today')}"></i>${c.target ? `<i class="target" style="left:${c.target / c.max * 100}%" title="Target"></i>` : ''}</span>
      <span class="ksub">${c.note}</span>
      <span class="kmore" aria-hidden="true">${t('k.details')}</span>
    </button>`).join('')}`;
  $('#kpis').addEventListener('click', (e) => {
    const card = e.target.closest('.kcard[data-k]'); if (!card) return;
    openDrawer(state.drawer === card.dataset.k ? null : card.dataset.k);
  });
}

function tween(el, from, to, show, ms = 1400) {
  cancelAnimationFrame(el._raf);
  const t0 = performance.now();
  const step = (t) => {
    const k = Math.min(1, (t - t0) / ms), e = 1 - Math.pow(1 - k, 3);
    el.textContent = show(from + (to - from) * e)[0];
    if (k < 1) el._raf = requestAnimationFrame(step);
  };
  el._raf = requestAnimationFrame(step);
}

function renderKpis(r, base) {
  const today = isTodayLike();
  const v = today ? base : r;
  $('#k-ctx').textContent = today ? t('k.today') : SCENARIOS[state.scenario].label;
  $('#k-ctx-sub').textContent = today ? t('k.estimate') : t('k.scenario');
  $('#k-ctx-bar').style.width = `${{ heute: 25, bb30: 50, bb40: 75, eigen: 100 }[today ? 'heute' : state.scenario]}%`;

  KPI_CARDS.forEach((c) => {
    const now = c.v(v), then = c.v(base);
    const valEl = $(`#k-${c.id}-val`);
    const prev = kpiShown[c.id] ?? now;
    if (Math.abs(prev - now) > 1e-9) tween(valEl, prev, now, c.show); else valEl.textContent = c.show(now)[0];
    kpiShown[c.id] = now;
    $(`#k-${c.id}-unit`).textContent = c.show(now)[1];
    $(`#k-${c.id}-bar`).style.width = `${Math.min(now / c.max, 1) * 100}%`;
    const tick = $(`#k-${c.id}-tick`);
    tick.style.left = `${Math.min(then / c.max, 1) * 100}%`;
    tick.hidden = today;
    const p = $(`#k-${c.id}-pill`), d = now - then;
    const txt = today ? '·' : Math.abs(d) < 1e-9 ? t('k.same') : `${d > 0 ? '▲' : '▼'} ${c.delta(Math.abs(d))}`;
    if (p.textContent !== txt) { p.textContent = txt; p.classList.remove('pop'); void p.offsetWidth; p.classList.add('pop'); }
    p.classList.toggle('ghost', today);
  });
  if (state.drawer) renderDrawer(r, base);
}

/* ---------- KPI detail drawer ---------- */
function openDrawer(id) {
  state.drawer = id;
  document.querySelectorAll('.kcard[data-k]').forEach((c) => {
    c.classList.toggle('active', c.dataset.k === id);
    c.setAttribute('aria-expanded', String(c.dataset.k === id));
  });
  $('#kdrawer').classList.toggle('open', !!id);
  $('#kdrawer').setAttribute('aria-hidden', String(!id));
  syncBackdrop();
  if (id) { update(); if (!isMobile()) $('#kdrawerClose').focus({ preventScroll: true }); }
}

function renderDrawer(r, base) {
  const today = isTodayLike();
  const v = today ? base : r;
  const ctx = today ? t('k.today') : SCENARIOS[state.scenario].label;
  const bar = (label, val, max, color, txt) => `<div class="dline"><span>${label}</span>
    <span class="dtrack"><span style="width:${Math.min(val / max, 1) * 100}%;background:${color}"></span></span><b>${txt}</b></div>`;
  const cmp = (label, a, b) => `<dt>${label}</dt><dd>${a}${today ? '' : ` <small>${t('res.today', { x: b })}</small>`}</dd>`;
  let title = '', body = '';
  switch (state.drawer) {
    case 'share': {
      const max = Math.max(v.gen, v.demand);
      title = t('k.share');
      body = `<p class="dlead">${t('d.share.lead', { v: `${fmt(v.share)} %`, ctx })}</p>
        <h4>${t('d.share.h')}</h4>
        ${bar(t('src.wind'), v.windGWh, max, 'var(--wind)', fmt(v.windGWh))}
        ${bar(t('src.ffShort'), v.ffGWh, max, 'var(--solar)', fmt(v.ffGWh))}
        ${bar(t('src.roof'), v.roofGWh, max, 'var(--solar-roof)', fmt(v.roofGWh))}
        ${bar(t('src.demand'), v.demand, max, 'var(--s4)', fmt(v.demand))}
        <p class="dnote">${t('d.share.note')}</p>`;
      break;
    }
    case 'turbines':
      title = t('k.turbines');
      body = `<p class="dlead">${t('d.turb.lead', { n: fmt(v.turbines) })}${today ? '' : t('d.turb.more', { n: fmt(Math.max(0, r.turbines - base.turbines)) })}.</p>
        <dl class="kv">${cmp(t('d.capacity'), `${fmt(today ? SCENARIOS.heute.wind : state.wind)} MW`, `${fmt(SCENARIOS.heute.wind)} MW`)}
        ${cmp(t('d.electricity'), `${fmt(v.windGWh / 1000, 1)} ${t('u.twhYr')}`, `${fmt(base.windGWh / 1000, 1)} TWh`)}
        <dt>${t('d.perTurbine')}</dt><dd>${fmt(ASSUME.mwPerTurbine, 1)} MW · ${fmt(ASSUME.mwPerTurbine * ASSUME.flhWind / 1000, 1)} ${t('u.gwhYr')}</dd></dl>
        <p class="dnote">${t('d.turb.note')}</p>
        <button type="button" class="btn secondary" data-layer-on="potential">${t('d.showMap')}</button>`;
      break;
    case 'land': {
      const targetHa = geo.regionHa * ASSUME.windAreaTargetPct / 100;
      title = t('k.land');
      body = `<p class="dlead">${t('d.land.lead', { pct: `${fmt(v.windPct, 2)} %`, ha: fmt(v.windHa), t: `${fmt(ASSUME.windAreaTargetPct, 1)} %`, tha: fmt(targetHa) })}</p>
        <h4>${t('d.land.h')}</h4>
        ${bar(t('d.windLand'), v.windHa, targetHa, 'var(--wind)', `${fmt(v.windHa / targetHa * 100)} %`)}
        <dl class="kv">${cmp(t('d.windLand'), `${fmt(v.windHa)} ha`, `${fmt(base.windHa)} ha`)}
        ${cmp(t('d.solarLand'), `${fmt(v.pvHa)} ha`, `${fmt(base.pvHa)} ha`)}
        <dt>${t('d.suitable')}</dt><dd>${fmt(geo.windOrder.length * geo.cellHa)} ha</dd></dl>
        <button type="button" class="btn secondary" data-layer-on="potential">${t('d.showMap')}</button>`;
      break;
    }
    case 'eeg': {
      const perTurbine = ASSUME.mwPerTurbine * ASSUME.flhWind * 1000 * ASSUME.eegEurPerKwh;
      title = t('d.eeg.title');
      body = `<p class="dlead">${t('d.eeg.lead', { v: eur(v.eeg) })}</p>
        <dl class="kv">${cmp(t('d.fromWind'), eur(v.windGWh * 1e6 * ASSUME.eegEurPerKwh), eur(base.windGWh * 1e6 * ASSUME.eegEurPerKwh))}
        ${cmp(t('d.fromFF'), eur(v.ffGWh * 1e6 * ASSUME.eegEurPerKwh), eur(base.ffGWh * 1e6 * ASSUME.eegEurPerKwh))}
        <dt>${t('d.oneTurbine')}</dt><dd>≈ ${eur(perTurbine)} ${t('perYear')}</dd></dl>
        <p class="dnote">${t('d.eeg.note')}</p>
        <button type="button" class="btn secondary" data-goto="place">${t('d.checkTown')}</button>`;
      break;
    }
  }
  $('#kdrawerTitle').textContent = title;
  $('#kdrawerCtx').textContent = ctx;
  $('#kdrawerBody').innerHTML = body;
}

function buildDrawer() {
  $('#kdrawerClose').addEventListener('click', () => openDrawer(null));
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (state.drawer) openDrawer(null);
    if (!$('#layersPop').hidden) setLayers(false);
  });
  $('#kdrawerBody').addEventListener('click', (e) => {
    const b = e.target.closest('[data-layer-on]'); if (!b) return;
    state.layers.add(b.dataset.layerOn);
    const cb = document.querySelector(`[data-layer="${b.dataset.layerOn}"]`);
    if (cb) { cb.checked = true; Anim.set(cb.nextElementSibling, true, false); }
    update();
  });
}

/* ---------- Today ---------- */
const catOf = (key) => METRICS.find((g) => g.items.some((m) => m.key === key)).group;

function buildToday() {
  $('#catTabs').innerHTML = METRICS.map((g) => `<button type="button" role="tab" data-cat="${g.group}">${t(`grp.${g.group}`)}</button>`).join('');
  $('#catTabs').addEventListener('click', (e) => {
    const b = e.target.closest('[data-cat]'); if (!b) return;
    state.metric = METRICS.find((g) => g.group === b.dataset.cat).items[0].key;
    update();
  });
  $('#metricList').addEventListener('click', (e) => {
    const b = e.target.closest('.mopt[data-m]'); if (!b) return;
    state.metric = b.dataset.m;
    update();
  });
}

function renderToday(base) {
  const cat = catOf(state.metric);
  $('#catTabs').querySelectorAll('[data-cat]').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.cat === cat)));
  const group = METRICS.find((g) => g.group === cat);
  if ($('#metricList').dataset.cat !== cat) {
    $('#metricList').dataset.cat = cat;
    $('#metricList').innerHTML = group.items.map((m) => m.soon
      ? `<button type="button" class="mopt" disabled><span class="radio radio-off" aria-hidden="true"></span><span class="mtxt"><b>${m.label}</b><span>${m.desc}</span></span><span class="soon">${t('soon')}</span></button>`
      : `<button type="button" class="mopt" role="radio" data-m="${m.key}"><span class="anim radio" data-anim="radioButton" data-on="false" aria-hidden="true"></span><span class="mtxt"><b>${m.label}</b><span>${m.desc}</span></span><em>${fmt(regionMetric(m.key), m.d)} ${m.unit}</em></button>`).join('');
  }
  $('#metricList').querySelectorAll('.mopt[data-m]').forEach((b) => {
    const on = b.dataset.m === state.metric;
    b.setAttribute('aria-checked', String(on));
    const r = b.querySelector('.radio');
    Anim.mount(r).then(() => Anim.set(r, on));
  });
  const m = METRIC[state.metric];
  const rows = geo.region.features.map((f) => ({
    name: f.properties.name, v: districtMetric(DISTRICTS[f.properties.name], f.properties.ha, m.key),
  }));
  const max = Math.max(...rows.map((r) => r.v), m.key === 'share' ? 150 : 0);
  const mix = [
    ['wind', t('src.wind'), base.windGWh], ['solar', t('src.ff'), base.ffGWh], ['solar-roof', t('src.roof'), base.roofGWh],
  ];
  $('#todayDeep').innerHTML = `
    <div class="deep">
      <h4>${t('mix.title')}</h4>
      <div class="mixbar">${mix.map(([c, , g]) => `<span style="width:${g / base.gen * 100}%;background:var(--${c})"></span>`).join('')}</div>
      <div class="mixkey">${mix.map(([c, l, g]) => `<span class="k"><i class="sw" style="background:var(--${c})"></i>${l}</span><span class="v">${fmt(g)} GWh · ${fmt(g / base.gen * 100)} %</span>`).join('')}</div>
      <h4>${t('mix.byDistrict', { x: m.label })}</h4>
      ${rows.map((r) => `<div class="drow"><span>${r.name}</span>
        <div class="dbar"><span style="width:${r.v / max * 100}%"></span>${m.key === 'share' ? `<i class="target" style="left:${100 / max * 100}%"></i>` : ''}</div>
        <span class="v">${fmt(r.v, m.d)} ${m.unit}</span></div>`).join('')}
    </div>`;

  if (map && map.getSource('districts')) {
    geo.region.features.forEach((f) => {
      map.setFeatureState({ source: 'districts', id: f.id }, { v: districtMetric(DISTRICTS[f.properties.name], f.properties.ha, m.key) });
    });
    map.setPaintProperty('districts-fill', 'fill-color', ['step', ['coalesce', ['feature-state', 'v'], 0],
      SCALE[0], m.breaks[0], SCALE[1], m.breaks[1], SCALE[2], m.breaks[2], SCALE[3], m.breaks[3], SCALE[4]]);
    districtMarkers.forEach(({ el, f }) => {
      const v = districtMetric(DISTRICTS[f.properties.name], f.properties.ha, m.key);
      el.innerHTML = `${DISTRICTS[f.properties.name].short} <b>${fmt(v, m.d)} ${m.unit}</b>`;
    });
  }
}

/* ---------- Plan ---------- */
function buildPlan() {
  $('#startList').innerHTML = ['heute', 'bb30', 'bb40', 'eigen'].map((k) => {
    const s = SCENARIOS[k];
    const nums = k === 'eigen' ? '' : `<span class="start-nums">
        <span><i style="background:var(--wind)"></i><b>${fmt(s.wind)}</b> ${t('start.wind')}</span>
        <span><i style="background:var(--solar)"></i><b>${fmt(s.ff + s.roof)}</b> ${t('start.solar')}</span></span>`;
    return `<button type="button" class="start" data-start="${k}">
      <span class="start-hd"><b>${s.label}</b><span class="tag">${s.short}</span></span>
      <span class="start-line">${s.line}</span>${nums}
    </button>`;
  }).join('');
  $('#startList').addEventListener('click', (e) => {
    const b = e.target.closest('[data-start]'); if (!b) return;
    const k = b.dataset.start;
    if (k === 'eigen') state.customising = true;
    else { state.customising = false; Object.assign(state, pick(SCENARIOS[k])); state.scenario = k; state.lastPreset = k; }
    setMode('plan');
  });
  $('#scenarioNote').addEventListener('click', (e) => {
    if (e.target.matches('[data-reset]')) applyPreset(state.lastPreset);
  });

  const sliderHtml = (s) => {
    let prev = -100;
    const ticks = ['heute', 'bb30', 'bb40'].map((k) => {
      const val = SCENARIOS[k][s.key];
      const pos = (val - s.min) / (s.max - s.min) * 100;
      const low = pos - prev < 13; // stagger labels that would collide
      prev = low ? -100 : pos;
      return `<button type="button" class="tick${low ? ' low' : ''}" style="left:${pos}%" data-key="${s.key}" data-val="${val}"
        aria-label="${t('sl.set', { what: s.label, to: SCENARIOS[k].label })}">${{ heute: t('tick.today'), bb30: '2030', bb40: '2040' }[k]}</button>`;
    }).join('');
    return `<div class="slider">
      <div class="slider-head">
        <label for="sl-${s.key}"><i class="sw" style="background:${s.color}"></i>${s.label}</label>
        <span class="slider-val" id="val-${s.key}"></span>
      </div>
      <div class="slider-plain" id="plain-${s.key}"></div>
      <div class="range-wrap">
        <input type="range" id="sl-${s.key}" min="${s.min}" max="${s.max}" step="${s.step}" style="--fill:${s.color}">
        <div class="ticks">${ticks}</div>
      </div>
    </div>`;
  };
  $('#slidersMain').innerHTML = SLIDERS.filter((s) => s.main).map(sliderHtml).join('');
  $('#slidersMore').innerHTML = SLIDERS.filter((s) => !s.main).map(sliderHtml).join('');

  SLIDERS.forEach((s) => {
    $(`#sl-${s.key}`).addEventListener('input', (e) => {
      state[s.key] = +e.target.value;
      state.scenario = matchScenario();
      update();
    });
  });
  $('#panel').addEventListener('click', (e) => {
    const t = e.target.closest('.tick'); if (!t) return;
    state[t.dataset.key] = +t.dataset.val;
    state.scenario = matchScenario();
    update();
  });
}

function applyPreset(k) {
  Object.assign(state, pick(SCENARIOS[k]));
  state.scenario = k;
  state.lastPreset = k;
  state.customising = false;
  update();
}

function matchScenario() {
  for (const k of ['heute', 'bb30', 'bb40']) {
    const s = SCENARIOS[k];
    if (['wind', 'ff', 'roof', 'demand'].every((key) => s[key] === state[key])) return k;
  }
  return 'eigen';
}

function plain(key, v, r) {
  switch (key) {
    case 'wind': return t('plain.wind', { n: fmt(r.turbines), ha: fmt(r.windHa) });
    case 'ff': return t('plain.ff', { n: fmt(r.pvHa / ASSUME.haPerPitch) });
    case 'roof': return t('plain.roof', { n: fmt(v.roof * 1000 / ASSUME.kwpPerRoof) });
    case 'demand': return t('plain.demand', { n: fmt(r.demand) }) + (v.demand > 100 ? t('plain.demandUp') : '');
  }
}

function renderPlan(r, base, alloc) {
  const own = state.scenario === 'eigen';
  $('#startList').querySelectorAll('[data-start]').forEach((b) => b.setAttribute('aria-current', String(b.dataset.start === state.scenario)));
  $('#planTitle').textContent = own ? t('plan.own') : t('plan.from', { x: SCENARIOS[state.scenario].label });
  $('#scenarioNote').innerHTML = own
    ? `${t('plan.builtOn', { x: SCENARIOS[state.lastPreset].label })} <button type="button" data-reset>${t('plan.reset', { x: SCENARIOS[state.lastPreset].label })}</button>`
    : state.customising ? t('plan.moveOwn') : t('plan.move');

  SLIDERS.forEach((s) => {
    const el = $(`#sl-${s.key}`);
    el.value = state[s.key];
    el.style.setProperty('--p', `${(state[s.key] - s.min) / (s.max - s.min) * 100}%`);
    $(`#val-${s.key}`).textContent = `${fmt(state[s.key])} ${s.unit}`;
    el.parentElement.querySelectorAll('.tick').forEach((t) => t.classList.toggle('on', +t.dataset.val === state[s.key]));
    $(`#plain-${s.key}`).textContent = plain(s.key, state, r);
  });

  const warn = $('#pWarn');
  if (warn._on !== alloc.windShort) {
    warn._on = alloc.windShort;
    warn.innerHTML = alloc.windShort
      ? `<div class="warn"><span class="anim warn-ico" data-anim="alertTriangle" data-color="#B80000" aria-hidden="true"></span><span>${t('plan.warn', { ha: fmt(alloc.windAvailHa) })}</span></div>` : '';
    if (alloc.windShort) Anim.replay(warn.querySelector('.anim'));
  }

  const row = (label, now, then, unit, d = 0) =>
    `<dt>${label}</dt><dd>${fmt(now, d)}${unit} <small>(${t('res.today', { x: fmt(then, d) })})</small></dd>`;
  $('#moreResults').innerHTML = `<dl class="kv">
    ${row(t('res.gen'), r.gen / 1000, base.gen / 1000, ' TWh', 1)}
    ${row(t('res.demand'), r.demand / 1000, base.demand / 1000, ' TWh', 1)}
    ${row(t('res.households'), r.households / 1e6, base.households / 1e6, t('u.m'), 2)}
    ${row(t('res.pvLand'), r.pvPct, base.pvPct, ' %', 2)}
    ${row(t('res.co2'), r.co2t / 1e6, base.co2t / 1e6, t('u.mt'), 2)}
  </dl>`;
}

/* ---------- My place ---------- */
const COMPASS = t('compass').split(',');
function bearing(ax, ay, bx, by) {
  const a = Math.atan2((bx - ax) * KX, (by - ay) * KY) * 180 / Math.PI;
  return COMPASS[Math.round(((a + 360) % 360) / 45) % 8];
}

function renderPlace() {
  const c = state.check;
  const scen = `${t('pl.basedOn', { x: SCENARIOS[state.scenario].label })} <button type="button" data-goto="plan-start">${t('k.change')}</button>`;
  if (!c) {
    $('#placeOut').innerHTML = `<p class="note">${scen}</p>`;
    return;
  }
  const [x, y] = c;
  let nearPlace = null, nearPlaceD = Infinity;
  for (const p of geo.places) {
    const d = distKm(x, y, p.x, p.y);
    if (d < nearPlaceD) { nearPlaceD = d; nearPlace = p; }
  }
  let nearWind = null, nearWindD = Infinity, within = 0, withinNew = 0, pvNear = 0;
  geo.cells.forEach((cell, id) => {
    const s = cellState[id];
    if (!s) return;
    const d = distKm(x, y, cell.x, cell.y);
    if (s <= 2) {
      if (d < nearWindD) { nearWindD = d; nearWind = cell; }
      if (d <= ASSUME.eegRadiusKm) { within++; if (s === 2) withinNew++; }
    } else if (d <= 2) pvNear++;
  });
  const mwPerCell = geo.cellHa / ASSUME.haPerMwWind;
  const turbines = Math.round(within * mwPerCell / ASSUME.mwPerTurbine);
  const newT = Math.round(withinNew * mwPerCell / ASSUME.mwPerTurbine);
  const revenue = within * mwPerCell * ASSUME.flhWind * 1000 * ASSUME.eegEurPerKwh;
  const edge = Math.max(0, nearWindD - 0.78); // centroid → hex edge
  const name = c.name || (nearPlace && nearPlaceD < 2.5 ? t('pl.near', { n: nearPlace.n }) : t('pl.point'));

  $('#placeOut').innerHTML = `
    <div class="place-hero">
      <span class="place-name">${name}</span>
      <span class="place-num">${eur(revenue)} <small>${t('perYear')}</small></span>
      <span class="place-sub">${revenue ? t('pl.subYes') : t('pl.subNo')}</span>
    </div>
    <dl class="kv">
      <dt>${t('pl.nearest')}</dt><dd>${nearWind ? `${fmt(edge, 1)} km ${bearing(x, y, nearWind.x, nearWind.y)}` : t('pl.none')}</dd>
      <dt>${t('pl.turbines')}</dt><dd>≈ ${fmt(turbines)}${newT ? ` <small>(${t('pl.new', { n: fmt(newT) })})</small>` : ''}</dd>
      <dt>${t('pl.solar')}</dt><dd>${pvNear ? `≈ ${fmt(pvNear * geo.cellHa)} ha` : t('pl.none')}</dd>
    </dl>
    <p class="note">${scen}</p>`;

  if (map.getSource('check')) {
    map.getSource('check').setData({
      type: 'FeatureCollection',
      features: [turf.circle([x, y], ASSUME.eegRadiusKm, { units: 'kilometers', steps: 72 }), turf.point([x, y])],
    });
  }
}

function setCheck(x, y, name) {
  state.check = [x, y];
  state.check.name = name;
  geo.syncPlaceInput?.(name);
  if (state.mode !== 'place') setMode('place'); else update();
}

function buildPlace() {
  const input = $('#placeInput'), list = $('#placeList'), combo = $('#placeCombo');
  const all = geo.places.map((p, i) => ({ ...p, i })).filter((p) => p.r)
    .sort((a, b) => (a.t === 'v') - (b.t === 'v') || a.n.localeCompare(b.n, 'de'));
  let shown = [], hl = -1;

  const esc = (t) => t.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  let typed = false; // until the user types, show the full list even if a town is selected
  function render() {
    const q = typed ? input.value.trim().toLowerCase() : '';
    shown = all.filter((p) => !q || p.n.toLowerCase().includes(q));
    hl = shown.length ? 0 : -1;
    if (!shown.length) { list.innerHTML = `<li class="none">${t('pl.noneFound')}</li>`; return; }
    let html = '', grp = null;
    shown.forEach((p, k) => {
      const g = p.t === 'v' ? t('pl.villages') : t('pl.towns');
      if (g !== grp) { html += `<li class="grp" role="presentation">${g}</li>`; grp = g; }
      const name = q ? esc(p.n).replace(new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'i'), '<mark>$1</mark>') : esc(p.n);
      const cur = state.check?.name === p.n;
      if (cur && !q) hl = k;
      html += `<li class="opt${k === hl ? ' hl' : ''}${cur ? ' current' : ''}" role="option" aria-selected="${cur}" id="po-${k}" data-k="${k}">${name}${p.p ? `<small>${t('pl.inh', { n: fmt(p.p) })}</small>` : ''}</li>`;
    });
    list.innerHTML = html;
    list.querySelectorAll('.opt').forEach((o) => o.classList.toggle('hl', +o.dataset.k === hl));
    $(`#po-${hl}`)?.scrollIntoView({ block: 'nearest' });
    input.setAttribute('aria-activedescendant', hl >= 0 ? `po-${hl}` : '');
  }
  function open() { render(); list.hidden = false; combo.classList.add('open'); input.setAttribute('aria-expanded', 'true'); }
  function close() { list.hidden = true; combo.classList.remove('open'); input.setAttribute('aria-expanded', 'false'); }
  function choose(k) {
    const p = shown[k]; if (!p) return;
    typed = false;
    input.value = p.n; close(); input.blur();
    if (isMobile()) setSheet('half');
    map.flyTo({ center: [p.x, p.y], zoom: 11, duration: 900, padding: mapPadding() });
    setCheck(p.x, p.y, p.n);
  }
  function move(d) {
    if (!shown.length) return;
    hl = (hl + d + shown.length) % shown.length;
    list.querySelectorAll('.opt').forEach((o) => o.classList.toggle('hl', +o.dataset.k === hl));
    const el = $(`#po-${hl}`); el?.scrollIntoView({ block: 'nearest' });
    input.setAttribute('aria-activedescendant', `po-${hl}`);
  }
  input.addEventListener('focus', () => { typed = false; input.select(); open(); if (isMobile()) setSheet('full'); });
  input.addEventListener('click', () => { if (list.hidden) open(); });
  const icon = $('#placeIcon .anim');
  const syncIcon = () => {
    Anim.set(icon, !!input.value);
    $('#placeIcon').setAttribute('aria-label', input.value ? t('pl.clear') : t('pl.search'));
  };
  input.addEventListener('input', () => { typed = true; syncIcon(); open(); });
  $('#placeIcon').addEventListener('click', () => {
    if (input.value) { typed = true; input.value = ''; syncIcon(); }
    input.focus(); open();
  });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); list.hidden ? open() : move(1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
    else if (e.key === 'Enter') { e.preventDefault(); choose(hl); }
    else if (e.key === 'Escape') { typed = false; input.value = state.check?.name || ''; close(); }
  });
  list.addEventListener('mousedown', (e) => {
    const o = e.target.closest('.opt'); if (!o) return;
    e.preventDefault(); choose(+o.dataset.k);
  });
  document.addEventListener('click', (e) => { if (!combo.contains(e.target)) close(); });
  geo.syncPlaceInput = (name) => { typed = false; input.value = name || ''; syncIcon(); };
}

/* ---------- Layers + legend ---------- */
function setLayers(open) {
  $('#layersPop').hidden = !open;
  $('#layersBtn').setAttribute('aria-expanded', String(open));
  syncBackdrop();
}

function buildLayers() {
  $('#layersPop').innerHTML = `<div class="pop-hd"><b>${t('map.layersTitle')}</b>
      <button type="button" class="icon-btn" id="layersClose" aria-label="${t('map.layersClose')}">${X_ICON}</button></div>` + CONTEXT_LAYERS.map((g) => `<div class="lgroup"><span>${t(`lg.${g.group}`)}</span>${g.items.map((l) =>
    l.soon
      ? `<label class="lopt disabled"><input type="checkbox" disabled> ${l.label}<span class="soon">${t('soon')}</span></label>`
      : `<label class="lopt"><input type="checkbox" class="vh" data-layer="${l.id}"><span class="anim cb" data-anim="checkBox" data-on="false" aria-hidden="true"></span><i class="sw" style="background:${l.color}"></i>${l.label}</label>`,
  ).join('')}</div>`).join('');
  $('#layersBtn').addEventListener('click', () => setLayers($('#layersPop').hidden));
  $('#layersClose').addEventListener('click', () => setLayers(false));
  $('#layersPop').addEventListener('change', (e) => {
    const id = e.target.dataset.layer; if (!id) return;
    e.target.checked ? state.layers.add(id) : state.layers.delete(id);
    Anim.set(e.target.nextElementSibling, e.target.checked);
    update();
  });
}

function renderLegend() {
  let html;
  if (isTodayLike()) {
    const m = METRIC[state.metric];
    const edges = [0, ...m.breaks];
    html = `<h4>${m.label} (${m.unit})</h4><div class="scale">${SCALE.map((c, i) =>
      `<div><i style="background:${c}"></i>${i < 4 ? `${fmt(edges[i], m.d)}–${fmt(edges[i + 1], m.d)}` : `> ${fmt(edges[4], m.d)}`}</div>`).join('')}</div>`;
  } else {
    html = `<h4>${SCENARIOS[state.scenario].label}</h4>
      <div class="row"><i class="sw wind-old"></i>${t('leg.windOld')}</div>
      <div class="row"><i class="sw wind-new"></i>${t('leg.windNew')}</div>
      <div class="row"><i class="sw solar-old"></i>${t('leg.solarOld')}</div>
      <div class="row"><i class="sw solar-new"></i>${t('leg.solarNew')}</div>`;
  }
  const active = CONTEXT_LAYERS.flatMap((g) => g.items).filter((l) => state.layers.has(l.id));
  if (active.length) html += `<hr>${active.map((l) => `<div class="row"><i class="sw" style="background:${l.color}"></i>${l.label}</div>`).join('')}`;
  $('#legend').innerHTML = html;
  $('#layersBtn').textContent = state.layers.size ? t('map.layersN', { n: state.layers.size }) : t('map.layers');
}

/* ---------- Mobile: bottom sheet, modals, legend chip ---------- */
const X_ICON = '<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
const mq = matchMedia('(max-width: 899px)');
const isMobile = () => mq.matches;
const sheet = { state: 'half' };

function sheetHeights() {
  const vh = window.innerHeight, top = $('.top').offsetHeight;
  return { peek: 112, half: Math.round(vh * 0.48), full: vh - top - 10 };
}
function setSheet(st, animate = true) {
  const panel = $('#panel');
  sheet.state = st;
  if (!isMobile()) { panel.style.height = ''; panel.removeAttribute('data-sheet'); return; }
  panel.classList.toggle('dragging', !animate);
  panel.dataset.sheet = st;
  panel.style.height = `${sheetHeights()[st]}px`;
  $('#sheetHandle').setAttribute('aria-label', st === 'full' ? t('sheet.collapse') : t('sheet.expand'));
}
// Map padding so fitted areas aren't hidden under the sheet.
function mapPadding() {
  if (!isMobile()) return FIT.padding;
  return { top: 20, left: 16, right: 16, bottom: Math.min(sheetHeights()[sheet.state], window.innerHeight * 0.5) + 16 };
}
function syncBackdrop() {
  const on = isMobile() && (!!state.drawer || !$('#layersPop').hidden);
  $('#backdrop').hidden = !on;
}

function buildMobile() {
  const panel = $('#panel'), handle = $('#sheetHandle');
  let startY = 0, startH = 0, lastY = 0, lastT = 0, v = 0, moved = false;
  handle.addEventListener('pointerdown', (e) => {
    if (!isMobile()) return;
    handle.setPointerCapture(e.pointerId);
    startY = lastY = e.clientY; lastT = performance.now(); startH = panel.offsetHeight; moved = false; v = 0;
    panel.classList.add('dragging');
  });
  handle.addEventListener('pointermove', (e) => {
    if (!handle.hasPointerCapture(e.pointerId)) return;
    const h = sheetHeights();
    const next = Math.max(h.peek - 30, Math.min(h.full, startH + (startY - e.clientY)));
    if (Math.abs(e.clientY - startY) > 4) moved = true;
    const now = performance.now();
    v = (lastY - e.clientY) / Math.max(1, now - lastT); lastY = e.clientY; lastT = now;
    panel.style.height = `${next}px`;
  });
  handle.addEventListener('pointerup', (e) => {
    if (!handle.hasPointerCapture(e.pointerId)) return;
    handle.releasePointerCapture(e.pointerId);
    if (!moved) { setSheet({ peek: 'half', half: 'full', full: 'half' }[sheet.state]); return; }
    // Snap to the nearest point, nudged by flick velocity.
    const h = sheetHeights(), cur = panel.offsetHeight + v * 180;
    const st = Object.entries(h).sort((a, b) => Math.abs(a[1] - cur) - Math.abs(b[1] - cur))[0][0];
    setSheet(st);
  });
  $('#backdrop').addEventListener('click', () => { if (state.drawer) openDrawer(null); if (!$('#layersPop').hidden) setLayers(false); });
  $('#legend').addEventListener('click', () => { if (isMobile()) $('#legend').classList.toggle('open'); });
  mq.addEventListener('change', () => { setSheet(sheet.state, false); syncBackdrop(); });
  window.addEventListener('resize', () => { if (isMobile()) setSheet(sheet.state, false); });
  setSheet('half', false);
}

/* ---------- Map ---------- */
let map;
const districtMarkers = [];
const FIT = { padding: { top: 60, bottom: 30, left: 30, right: 30 } };

function buildMap() {
  map = new maplibregl.Map({
    container: 'map',
    style: 'https://tiles.openfreemap.org/styles/positron',
    bounds: turf.bbox(geo.region),
    fitBoundsOptions: { padding: mapPadding() },
    attributionControl: { compact: true },
  });
  map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');

  map.on('load', () => {
    map.addSource('others', { type: 'geojson', data: geo.others });
    map.addSource('districts', { type: 'geojson', data: geo.region });
    map.addSource('outline', { type: 'geojson', data: geo.outline });
    map.addSource('cells', { type: 'geojson', data: geo.hex });
    map.addSource('check', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
    // Data layers sit under the basemap's place labels so town names stay readable.
    const below = map.getStyle().layers.find((l) => l.type === 'symbol')?.id;

    map.addLayer({ id: 'others-fill', type: 'fill', source: 'others', paint: { 'fill-color': '#ffffff', 'fill-opacity': 0.55 } }, below);
    map.addLayer({ id: 'districts-fill', type: 'fill', source: 'districts', paint: { 'fill-color': SCALE[2], 'fill-opacity': 0.75 } }, below);

    const ctx = (id, filterKey, color) => map.addLayer({ id, type: 'fill', source: 'cells', filter: ['==', ['get', filterKey], 1],
      layout: { visibility: 'none' }, paint: { 'fill-color': color } }, below);
    ctx('potential', 'ok', 'rgba(3,126,158,.18)');
    ctx('pvpotential', 'pv', 'rgba(255,216,0,.35)');
    ctx('excluded', 'ex', 'rgba(142,154,161,.4)');
    ctx('nature', 'nat', 'rgba(102,204,102,.45)');

    const s = ['coalesce', ['feature-state', 's'], 0];
    map.addLayer({ id: 'alloc', type: 'fill', source: 'cells', paint: {
      'fill-color': ['match', s, 1, '#037E9E', 2, '#037E9E', 3, '#FFD800', 4, '#FFD800', 'rgba(0,0,0,0)'],
      'fill-opacity': ['match', s, 1, 0.45, 3, 0.45, 2, 0.95, 4, 0.95, 0],
    } }, below);
    map.addLayer({ id: 'alloc-new', type: 'line', source: 'cells', paint: {
      'line-color': ['match', s, 4, '#8a6d00', '#025a71'], 'line-width': 1.2,
      'line-opacity': ['match', s, 2, 1, 4, 1, 0],
    } }, below);

    map.addLayer({ id: 'district-line', type: 'line', source: 'districts', paint: { 'line-color': '#5a6a74', 'line-width': 1, 'line-dasharray': [2, 2] } });
    map.addLayer({ id: 'region-line', type: 'line', source: 'outline', paint: { 'line-color': '#E60000', 'line-width': 2.5 } });

    map.addLayer({ id: 'check-ring', type: 'fill', source: 'check', filter: ['==', ['geometry-type'], 'Polygon'],
      paint: { 'fill-color': '#214152', 'fill-opacity': 0.06 } });
    map.addLayer({ id: 'check-ring-line', type: 'line', source: 'check', filter: ['==', ['geometry-type'], 'Polygon'],
      paint: { 'line-color': '#214152', 'line-width': 1.5, 'line-dasharray': [3, 2] } });
    map.addLayer({ id: 'check-pt', type: 'circle', source: 'check', filter: ['==', ['geometry-type'], 'Point'],
      paint: { 'circle-radius': 7, 'circle-color': '#214152', 'circle-stroke-color': '#fff', 'circle-stroke-width': 2.5 } });

    geo.region.features.forEach((f) => {
      const el = document.createElement('div');
      el.className = 'dlabel';
      const at = f.properties.name === 'Frankfurt (Oder)' ? turf.centroid(f) : turf.pointOnFeature(f);
      new maplibregl.Marker({ element: el }).setLngLat(at.geometry.coordinates).addTo(map);
      districtMarkers.push({ el, f });
    });

    cellState = [];
    update();
    $('#mapLoading').classList.add('done');
  });

  map.on('click', (e) => {
    setCheck(e.lngLat.lng, e.lngLat.lat);
    if (isMobile()) setSheet('half');
  });
}

function syncMap() {
  if (!map || !map.getLayer('alloc')) return;
  const vis = (id, on) => map.setLayoutProperty(id, 'visibility', on ? 'visible' : 'none');
  const today = isTodayLike();
  vis('districts-fill', today);
  vis('alloc', !today);
  vis('alloc-new', !today);
  ['check-ring', 'check-ring-line', 'check-pt'].forEach((id) => vis(id, state.mode === 'place'));
  CONTEXT_LAYERS.flatMap((g) => g.items).filter((l) => !l.soon).forEach((l) => vis(l.id, state.layers.has(l.id)));
  districtMarkers.forEach(({ el }) => { el.style.display = today ? '' : 'none'; });
  map.getCanvas().style.cursor = state.mode === 'place' ? 'crosshair' : '';

  const hint = $('#mapHint');
  const msg = state.mode === 'place' && !state.check ? t('map.hintPlace')
    : state.mode === 'plan' ? t('map.hintPlan') : '';
  hint.hidden = !msg;
  hint.textContent = msg;
}

/* ---------- Mode + update loop ---------- */
function setMode(mode) {
  state.mode = mode;
  $('#welcome').hidden = mode !== 'home';
  if (mode === 'home') document.querySelectorAll('.wcheck').forEach((el, i) => Anim.replay(el, 350 + i * 90));
  document.querySelectorAll('.view').forEach((v) => v.classList.toggle('active', v.dataset.view === mode));
  $('#panel').scrollTop = 0;
  if (isMobile() && mode !== 'home') setSheet(mode === 'place' && !state.check ? 'half' : 'half');
  if (isTodayLike() && map?.loaded()) map.fitBounds(turf.bbox(geo.region), { padding: mapPadding(), duration: 600 });
  update();
}

function update() {
  const r = compute(state);
  const base = compute(SCENARIOS.heute);
  const alloc = allocate(state);
  renderKpis(r, base);
  if (isTodayLike()) renderToday(base);
  renderPlan(r, base, alloc);
  if (state.mode === 'place') renderPlace();
  renderLegend();
  syncMap();
  history.replaceState(null, '', `#m=${state.mode}&w=${state.wind}&f=${state.ff}&r=${state.roof}&d=${state.demand}&k=${state.metric}`);
}

function readHash() {
  const p = new URLSearchParams(location.hash.slice(1));
  const keys = { w: 'wind', f: 'ff', r: 'roof', d: 'demand' };
  for (const [k, key] of Object.entries(keys)) {
    const v = Number(p.get(k));
    if (p.has(k) && Number.isFinite(v)) state[key] = v;
  }
  state.scenario = matchScenario();
  if (['home', 'today', 'plan-start', 'plan', 'place'].includes(p.get('m'))) state.mode = p.get('m');
  if (METRIC[p.get('k')] && !METRIC[p.get('k')].soon) state.metric = p.get('k');
}

function buildAssumptions() {
  const row = (key, val) => `<tr><td>${t(key)}</td><td>${val}</td></tr>`;
  $('#assumptions').innerHTML = `
    <table>
      ${row('as.mw', `${fmt(ASSUME.mwPerTurbine, 1)} MW`)}
      ${row('as.land', `${fmt(ASSUME.haPerMwWind, 2)} / ${fmt(ASSUME.haPerMwpPV, 1)} ha`)}
      ${row('as.flh', `${fmt(ASSUME.flhWind)} / ${fmt(ASSUME.flhFF)} / ${fmt(ASSUME.flhRoof)} h`)}
      ${row('as.demand', `${fmt(DEMAND_TODAY)} GWh`)}
      ${row('as.eeg', `${fmt(0.2, 1)} ct/kWh`)}
      ${row('as.dist', `${fmt(ASSUME.settleBufferKm, 1)} km`)}
    </table>
    <p>${t('as.scen')}</p>
    <p>${t('as.real')}</p>
    <p>${t('as.demo')}</p>
    <p>${t('as.disc')}</p>`;
}

function buildUser() {
  let name = '';
  try { name = sessionStorage.getItem('empower.user') || ''; } catch { /* private mode */ }
  if (name === 'Guest') name = '';
  $('#userName').textContent = name || t('user.guest');
  const first = name.charAt(0).toUpperCase() + name.slice(1);
  $('#wTitle').textContent = name ? t('w.titleUser', { name: first }) : t('w.titleGuest');
  $('#avatar').textContent = (name || t('user.guest'))[0];
  const btn = $('#userBtn'), menu = $('#userMenu');
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    menu.hidden = !menu.hidden;
    btn.setAttribute('aria-expanded', String(!menu.hidden));
  });
  document.addEventListener('click', () => { menu.hidden = true; btn.setAttribute('aria-expanded', 'false'); });
  // Close the Layers popover on outside click too.
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.layers') && !$('#layersPop').hidden) setLayers(false);
  });
}

/* ---------- Boot ---------- */
(async function init() {
  const [bb, places] = await Promise.all([
    fetch('data/brandenburg.geo.json').then((r) => r.json()),
    fetch('data/places.json').then((r) => r.json()),
  ]);
  prepareGeo(bb, places);
  readHash();
  I18N.apply();
  I18N.mountSwitcher($('#langDd'));
  buildKpis();
  buildDrawer();
  $('#wsToday').textContent = `${fmt(compute(SCENARIOS.heute).share)} %`;
  $('#wsPlan').textContent = `${fmt(compute(SCENARIOS.bb30).share)} %`;
  $('#wsPlace').textContent = fmt(geo.places.filter((p) => p.r).length);
  buildToday();
  buildPlan();
  buildPlace();
  buildLayers();
  buildAssumptions();
  buildUser();
  document.addEventListener('click', (e) => {
    const g = e.target.closest('[data-goto]'); if (!g) return;
    e.preventDefault();
    const card = g.closest('.wcard');
    if (!card || matchMedia('(prefers-reduced-motion: reduce)').matches) { setMode(g.dataset.goto); return; }
    $('#welcome').classList.add('choosing');
    card.classList.add('chosen');
    setTimeout(() => {
      setMode(g.dataset.goto);
      setTimeout(() => { $('#welcome').classList.remove('choosing'); card.classList.remove('chosen'); }, 300);
    }, 420);
  });
  buildMobile();
  buildMap();
  Anim.mountAll();
  setMode(state.mode);
})();
