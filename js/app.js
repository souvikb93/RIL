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
  heute: { label: 'Today', short: 'estimate', wind: sumD('wind'), ff: sumD('ff'), roof: sumD('roof'), demand: 100,
    note: 'Approximate current state. Every comparison starts here.' },
  bb30: { label: 'BB 2030', short: 'state target', wind: 1769, ff: 1330, roof: 1440, demand: 115,
    note: 'Brandenburg Energy Strategy 2030, broken down to this region (15.4 % share).' },
  bb40: { label: 'BB 2040', short: 'derived', wind: 2387, ff: 2440, roof: 2642, demand: 135,
    note: 'State targets 2040 × 15.4 % regional share. Our derivation, not an official value.' },
  eigen: { label: 'Custom', short: 'yours' },
};

const SLIDERS = [
  { key: 'wind', label: 'Wind power', unit: 'MW', min: 0, max: 4000, step: 25, color: 'var(--wind)', main: true },
  { key: 'ff', label: 'Ground-mounted solar', unit: 'MWp', min: 0, max: 5000, step: 25, color: 'var(--solar)', main: true },
  { key: 'roof', label: 'Rooftop solar', unit: 'MWp', min: 0, max: 4000, step: 25, color: 'var(--solar-roof)' },
  { key: 'demand', label: 'Electricity demand', unit: '% of today', min: 50, max: 200, step: 5, color: 'var(--navy)' },
];

// Every selectable option is listed; unbuilt ones are visible but disabled.
const METRICS = [
  { group: 'Energy', items: [
    { key: 'share', label: 'Renewable share of demand', unit: '%', breaks: [25, 50, 75, 100], d: 0 },
    { key: 'gen', label: 'Renewable generation', unit: 'GWh', breaks: [100, 500, 1000, 1500], d: 0 },
    { key: 'battery', label: 'Battery storage', soon: true },
  ] },
  { group: 'Land', items: [
    { key: 'windLand', label: 'Land used for wind', unit: '%', breaks: [0.25, 0.5, 1, 2.2], d: 2 },
    { key: 'pvLand', label: 'Land used for solar', unit: '%', breaks: [0.05, 0.1, 0.2, 0.4], d: 2 },
  ] },
  { group: 'Demand', items: [
    { key: 'demand', label: 'Electricity demand', unit: 'GWh', breaks: [250, 500, 1000, 1500], d: 0 },
    { key: 'perCap', label: 'Demand per inhabitant', unit: 'kWh', breaks: [4000, 6000, 8000, 10000], d: 0 },
    { key: 'heat', label: 'Heat demand', soon: true },
  ] },
];
const METRIC = Object.fromEntries(METRICS.flatMap((g) => g.items).map((m) => [m.key, m]));
const SCALE = ['#e6edf1', '#bccbd4', '#8aa3b1', '#56778a', '#214152'];

const CONTEXT_LAYERS = [
  { group: 'Energy potential', items: [
    { id: 'potential', label: 'Suitable for wind (demo)', color: 'rgba(3,126,158,.18)' },
    { id: 'pvpotential', label: 'Suitable for solar (demo)', color: 'rgba(255,216,0,.35)' },
  ] },
  { group: 'Settlements & infrastructure', items: [
    { id: 'excluded', label: 'Within 1 km of settlements', color: 'rgba(142,154,161,.4)' },
    { id: 'grid', label: 'Power grid ≥ 110 kV', soon: true },
  ] },
  { group: 'Nature', items: [
    { id: 'nature', label: 'Nature & forest (demo)', color: 'rgba(102,204,102,.45)' },
    { id: 'water', label: 'Water protection areas', soon: true },
  ] },
];

const fmt = (n, d = 0) => n.toLocaleString('en-GB', { maximumFractionDigits: d, minimumFractionDigits: d });
const eur = (n) => n >= 1e6 ? `€${fmt(n / 1e6, 1)}m` : n > 0 ? `€${fmt(Math.round(n / 1000) * 1000)}` : '€0';
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
    case 'demand': return d.demand;
    case 'perCap': return d.demand * 1e6 / d.pop;
  }
}
function regionMetric(key) {
  const r = compute(SCENARIOS.heute);
  return { share: r.share, gen: r.gen, windLand: r.windPct, pvLand: r.pvPct, demand: r.demand,
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
function pill(d, unit, digits = 0, prefix = '') {
  if (isTodayLike()) return '';
  if (Math.abs(d) < 1e-9) return '<span class="pill">same as today</span>';
  return `<span class="pill" title="Change vs today">${d > 0 ? '▲' : '▼'} ${prefix}${fmt(Math.abs(d), digits)}${unit}</span>`;
}

function renderKpis(r, base) {
  const today = isTodayLike();
  const v = today ? base : r;
  const landTarget = ASSUME.windAreaTargetPct;
  $('#kpis').innerHTML = `
    <div class="kcard ctx">
      <span class="klabel">Showing</span>
      <span class="kval">${today ? 'Today' : SCENARIOS[state.scenario].label}</span>
      <span class="ksub">${today ? 'current estimate' : 'scenario · <button type="button" data-goto="plan">change</button>'}</span>
    </div>
    <div class="kcard">
      <div class="khead"><span class="klabel"><i style="background:var(--navy)"></i>Renewable share</span>${pill(r.share - base.share, ' pts')}</div>
      <span class="kval">${fmt(v.share)} %</span>
      <div class="kmeter"><span style="width:${Math.min(v.share, 200) / 2}%;background:var(--navy)"></span><i class="target" style="left:50%"></i></div>
      <span class="ksub">of electricity demand · target 100 %</span>
    </div>
    <div class="kcard">
      <div class="khead"><span class="klabel"><i style="background:var(--wind)"></i>Wind turbines</span>${pill(r.turbines - base.turbines, '')}</div>
      <span class="kval">≈ ${fmt(v.turbines)}</span>
      <span class="ksub">6.5 MW equivalents · ${fmt(v.windGWh / 1000, 1)} TWh/yr</span>
    </div>
    <div class="kcard">
      <div class="khead"><span class="klabel"><i style="background:var(--wind)"></i>Land for wind</span>${pill(r.windPct - base.windPct, ' pts', 2)}</div>
      <span class="kval">${fmt(v.windPct, 2)} %</span>
      <div class="kmeter"><span style="width:${Math.min(v.windPct / (landTarget * 1.5), 1) * 100}%;background:var(--wind)"></span><i class="target" style="left:${100 / 1.5}%"></i></div>
      <span class="ksub">of the region · target ${fmt(landTarget, 1)} %</span>
    </div>
    <div class="kcard">
      <div class="khead"><span class="klabel"><i style="background:var(--navy)"></i>For municipalities</span>${pill((r.eeg - base.eeg) / 1e6, 'm', 1, '€')}</div>
      <span class="kval">${eur(v.eeg)} <small>/ year</small></span>
      <span class="ksub">§ 6 EEG payments from wind &amp; solar</span>
    </div>`;
}

/* ---------- Today ---------- */
function buildToday() {
  $('#metricList').innerHTML = METRICS.map((g) => `<div class="mgroup"><span>${g.group}</span>${g.items.map((m) =>
    m.soon
      ? `<button type="button" class="mopt" disabled>${m.label}<span class="soon">soon</span></button>`
      : `<button type="button" class="mopt" role="radio" data-m="${m.key}">${m.label}<em>${fmt(regionMetric(m.key), m.d)} ${m.unit}</em></button>`,
  ).join('')}</div>`).join('');
  $('#metricList').addEventListener('click', (e) => {
    const b = e.target.closest('.mopt[data-m]'); if (!b) return;
    state.metric = b.dataset.m;
    update();
  });
}

function renderToday(base) {
  $('#metricList').querySelectorAll('.mopt[data-m]').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.m === state.metric)));
  const m = METRIC[state.metric];
  const rows = geo.region.features.map((f) => ({
    name: f.properties.name, v: districtMetric(DISTRICTS[f.properties.name], f.properties.ha, m.key),
  }));
  const max = Math.max(...rows.map((r) => r.v), m.key === 'share' ? 150 : 0);
  const mix = [
    ['wind', 'Wind', base.windGWh], ['solar', 'Ground-mounted solar', base.ffGWh], ['solar-roof', 'Rooftop solar', base.roofGWh],
  ];
  $('#todayDeep').innerHTML = `
    <div class="deep">
      <h4>Electricity mix today</h4>
      <div class="mixbar">${mix.map(([c, , g]) => `<span style="width:${g / base.gen * 100}%;background:var(--${c})"></span>`).join('')}</div>
      <div class="mixkey">${mix.map(([c, l, g]) => `<span class="k"><i class="sw" style="background:var(--${c})"></i>${l}</span><span class="v">${fmt(g)} GWh · ${fmt(g / base.gen * 100)} %</span>`).join('')}</div>
      <h4>${m.label} by district</h4>
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
  $('#seg').innerHTML = Object.entries(SCENARIOS).map(([k, s]) =>
    `<button type="button" role="radio" data-k="${k}"${k === 'eigen' ? ' class="custom" tabindex="-1"' : ''}>${s.label}<small>${s.short}</small></button>`).join('');
  $('#seg').addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b || b.dataset.k === 'eigen') return;
    applyPreset(b.dataset.k);
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
        aria-label="Set ${s.label} to ${SCENARIOS[k].label}">${{ heute: 'today', bb30: '2030', bb40: '2040' }[k]}</button>`;
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
    case 'wind': return `≈ ${fmt(r.turbines)} turbines on ${fmt(r.windHa)} ha`;
    case 'ff': return `≈ ${fmt(r.pvHa / ASSUME.haPerPitch)} football pitches of land`;
    case 'roof': return `≈ ${fmt(v.roof * 1000 / ASSUME.kwpPerRoof)} house roofs`;
    case 'demand': return `≈ ${fmt(r.demand)} GWh a year${v.demand > 100 ? ' (heat pumps, EVs, industry)' : ''}`;
  }
}

function renderPlan(r, base, alloc) {
  $('#seg').querySelectorAll('button').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.k === state.scenario)));
  $('#scenarioNote').innerHTML = state.scenario === 'eigen'
    ? `Your own settings. <button type="button" data-reset>Back to ${SCENARIOS[state.lastPreset].label}</button>`
    : SCENARIOS[state.scenario].note;

  SLIDERS.forEach((s) => {
    const el = $(`#sl-${s.key}`);
    el.value = state[s.key];
    el.style.setProperty('--p', `${(state[s.key] - s.min) / (s.max - s.min) * 100}%`);
    $(`#val-${s.key}`).textContent = `${fmt(state[s.key])} ${s.unit}`;
    $(`#plain-${s.key}`).textContent = plain(s.key, state, r);
  });

  $('#pWarn').innerHTML = alloc.windShort
    ? `<div class="warn">This needs more land than the analysis rates as suitable (${fmt(alloc.windAvailHa)} ha). Distances or protection rules would have to change.</div>` : '';

  const row = (label, now, then, unit, d = 0) =>
    `<dt>${label}</dt><dd>${fmt(now, d)} ${unit} <small>(today ${fmt(then, d)})</small></dd>`;
  $('#moreResults').innerHTML = `<dl class="kv">
    ${row('Electricity generated', r.gen / 1000, base.gen / 1000, 'TWh', 1)}
    ${row('Electricity demand', r.demand / 1000, base.demand / 1000, 'TWh', 1)}
    ${row('Households supplied', r.households / 1e6, base.households / 1e6, 'm', 2)}
    ${row('Land for solar', r.pvPct, base.pvPct, '%', 2)}
    ${row('CO₂ avoided', r.co2t / 1e6, base.co2t / 1e6, 'm t', 2)}
  </dl>`;
}

/* ---------- My place ---------- */
const COMPASS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
function bearing(ax, ay, bx, by) {
  const a = Math.atan2((bx - ax) * KX, (by - ay) * KY) * 180 / Math.PI;
  return COMPASS[Math.round(((a + 360) % 360) / 45) % 8];
}

function renderPlace() {
  const c = state.check;
  const scen = `Based on <b>${SCENARIOS[state.scenario].label}</b>. <button type="button" data-goto="plan">Change scenario</button>`;
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
  const name = c.name || (nearPlace && nearPlaceD < 2.5 ? `Near ${nearPlace.n}` : 'Selected point');

  $('#placeOut').innerHTML = `
    <div class="place-hero">
      <span class="place-name">${name}</span>
      <span class="place-num">${eur(revenue)} <small>/ year</small></span>
      <span class="place-sub">${revenue ? 'for municipalities within 2.5 km of turbines (§ 6 EEG)' : 'No wind turbines within 2.5 km, so no § 6 EEG payment here'}</span>
    </div>
    <dl class="kv">
      <dt>Nearest wind area</dt><dd>${nearWind ? `${fmt(edge, 1)} km ${bearing(x, y, nearWind.x, nearWind.y)}` : 'none'}</dd>
      <dt>Turbines within 2.5 km</dt><dd>≈ ${fmt(turbines)}${newT ? ` <small>(${fmt(newT)} new)</small>` : ''}</dd>
      <dt>Solar within 2 km</dt><dd>${pvNear ? `≈ ${fmt(pvNear * geo.cellHa)} ha` : 'none'}</dd>
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
  function render() {
    const q = input.value.trim().toLowerCase();
    shown = all.filter((p) => !q || p.n.toLowerCase().includes(q)).slice(0, 80);
    hl = shown.length ? 0 : -1;
    if (!shown.length) { list.innerHTML = '<li class="none">No place found</li>'; return; }
    let html = '', grp = null;
    shown.forEach((p, k) => {
      const g = p.t === 'v' ? 'Villages' : 'Towns';
      if (g !== grp) { html += `<li class="grp" role="presentation">${g}</li>`; grp = g; }
      const name = q ? esc(p.n).replace(new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'i'), '<mark>$1</mark>') : esc(p.n);
      html += `<li class="opt${k === hl ? ' hl' : ''}" role="option" id="po-${k}" data-k="${k}">${name}${p.p ? `<small>${fmt(p.p)} inh.</small>` : ''}</li>`;
    });
    list.innerHTML = html;
    input.setAttribute('aria-activedescendant', hl >= 0 ? `po-${hl}` : '');
  }
  function open() { render(); list.hidden = false; combo.classList.add('open'); input.setAttribute('aria-expanded', 'true'); }
  function close() { list.hidden = true; combo.classList.remove('open'); input.setAttribute('aria-expanded', 'false'); }
  function choose(k) {
    const p = shown[k]; if (!p) return;
    input.value = p.n; close(); input.blur();
    map.flyTo({ center: [p.x, p.y], zoom: 11, duration: 900 });
    setCheck(p.x, p.y, p.n);
  }
  function move(d) {
    if (!shown.length) return;
    hl = (hl + d + shown.length) % shown.length;
    list.querySelectorAll('.opt').forEach((o) => o.classList.toggle('hl', +o.dataset.k === hl));
    const el = $(`#po-${hl}`); el?.scrollIntoView({ block: 'nearest' });
    input.setAttribute('aria-activedescendant', `po-${hl}`);
  }
  input.addEventListener('focus', () => { input.select(); open(); });
  input.addEventListener('input', open);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); list.hidden ? open() : move(1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
    else if (e.key === 'Enter') { e.preventDefault(); choose(hl); }
    else if (e.key === 'Escape') { close(); }
  });
  list.addEventListener('mousedown', (e) => {
    const o = e.target.closest('.opt'); if (!o) return;
    e.preventDefault(); choose(+o.dataset.k);
  });
  document.addEventListener('click', (e) => { if (!combo.contains(e.target)) close(); });
  geo.syncPlaceInput = (name) => { input.value = name || ''; };
}

/* ---------- Layers + legend ---------- */
function buildLayers() {
  $('#layersPop').innerHTML = CONTEXT_LAYERS.map((g) => `<div class="lgroup"><span>${g.group}</span>${g.items.map((l) =>
    l.soon
      ? `<label class="lopt disabled"><input type="checkbox" disabled> ${l.label}<span class="soon">soon</span></label>`
      : `<label class="lopt"><input type="checkbox" data-layer="${l.id}"> <i class="sw" style="background:${l.color}"></i>${l.label}</label>`,
  ).join('')}</div>`).join('');
  $('#layersBtn').addEventListener('click', () => {
    const pop = $('#layersPop');
    pop.hidden = !pop.hidden;
    $('#layersBtn').setAttribute('aria-expanded', String(!pop.hidden));
  });
  $('#layersPop').addEventListener('change', (e) => {
    const id = e.target.dataset.layer; if (!id) return;
    e.target.checked ? state.layers.add(id) : state.layers.delete(id);
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
      <div class="row"><i class="sw wind-old"></i>Wind · existing</div>
      <div class="row"><i class="sw wind-new"></i>Wind · new</div>
      <div class="row"><i class="sw solar-old"></i>Solar · existing</div>
      <div class="row"><i class="sw solar-new"></i>Solar · new</div>`;
  }
  const active = CONTEXT_LAYERS.flatMap((g) => g.items).filter((l) => state.layers.has(l.id));
  if (active.length) html += `<hr>${active.map((l) => `<div class="row"><i class="sw" style="background:${l.color}"></i>${l.label}</div>`).join('')}`;
  $('#legend').innerHTML = html;
  $('#layersBtn').textContent = state.layers.size ? `Layers (${state.layers.size})` : 'Layers';
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
    fitBoundsOptions: FIT,
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
  });

  map.on('click', (e) => setCheck(e.lngLat.lng, e.lngLat.lat));
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
  const msg = state.mode === 'place' && !state.check ? 'Click anywhere on the map to see what the scenario means there'
    : state.mode === 'plan' ? 'Tip: click the map to check a specific place' : '';
  hint.hidden = !msg;
  hint.textContent = msg;
}

/* ---------- Mode + update loop ---------- */
function setMode(mode) {
  state.mode = mode;
  document.querySelectorAll('.view').forEach((v) => v.classList.toggle('active', v.dataset.view === mode));
  const home = mode === 'home';
  $('#step1').className = home ? 'on' : 'done';
  $('#step2').className = home ? '' : 'on';
  document.querySelector('.stepper .bar').classList.toggle('done', !home);
  $('#step2Label').textContent = home ? 'Explore' : { today: 'Today', plan: 'Plan', place: 'My place' }[mode];
  $('#panel').scrollTop = 0;
  if (isTodayLike() && map?.loaded()) map.fitBounds(turf.bbox(geo.region), { ...FIT, duration: 600 });
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
  if (['home', 'today', 'plan', 'place'].includes(p.get('m'))) state.mode = p.get('m');
  if (METRIC[p.get('k')] && !METRIC[p.get('k')].soon) state.metric = p.get('k');
}

function buildAssumptions() {
  $('#assumptions').innerHTML = `
    <table>
      <tr><td>Capacity per wind turbine</td><td>${fmt(ASSUME.mwPerTurbine, 1)} MW</td></tr>
      <tr><td>Land per MW wind / MWp solar</td><td>${fmt(ASSUME.haPerMwWind, 2)} / ${fmt(ASSUME.haPerMwpPV, 1)} ha</td></tr>
      <tr><td>Full-load hours wind / ground / rooftop</td><td>${fmt(ASSUME.flhWind)} / ${fmt(ASSUME.flhFF)} / ${fmt(ASSUME.flhRoof)} h</td></tr>
      <tr><td>Electricity demand today</td><td>${fmt(DEMAND_TODAY)} GWh</td></tr>
      <tr><td>Municipal payment, § 6 EEG</td><td>0.2 ct/kWh</td></tr>
      <tr><td>Min. distance wind → settlements</td><td>${fmt(ASSUME.settleBufferKm, 1)} km</td></tr>
    </table>
    <p><b>Real data:</b> district boundaries (GADM), settlements (© OpenStreetMap contributors), BB 2030 targets and land ratios from the
      <a href="https://epp.rl-institut.de/de/" target="_blank" rel="noopener">EmPowerPlan tool</a> (RLI).</p>
    <p><b>Estimates &amp; demo data:</b> district values are estimates; wind resource and nature/forest areas are simulated to show the principle.</p>
    <p>Independent design prototype. Not a service of the State of Brandenburg; figures are not legally binding.</p>`;
}

function buildUser() {
  let name = 'Guest';
  try { name = sessionStorage.getItem('empower.user') || 'Guest'; } catch { /* private mode */ }
  $('#userName').textContent = name;
  $('#avatar').textContent = name[0];
  const btn = $('#userBtn'), menu = $('#userMenu');
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    menu.hidden = !menu.hidden;
    btn.setAttribute('aria-expanded', String(!menu.hidden));
  });
  document.addEventListener('click', () => { menu.hidden = true; btn.setAttribute('aria-expanded', 'false'); });
  // Close the Layers popover on outside click too.
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.layers')) { $('#layersPop').hidden = true; $('#layersBtn').setAttribute('aria-expanded', 'false'); }
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
  buildToday();
  buildPlan();
  buildPlace();
  buildLayers();
  buildAssumptions();
  buildUser();
  document.addEventListener('click', (e) => {
    const g = e.target.closest('[data-goto]'); if (!g) return;
    e.preventDefault();
    setMode(g.dataset.goto);
  });
  buildMap();
  setMode(state.mode);
})();
