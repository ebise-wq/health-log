/* Daily log — vanilla JS, no build step, no network.
   When you change anything here, bump VERSION below AND the cache name at the
   top of sw.js. The version in the corner is how you check a new build loaded. */

var VERSION = "v1.28.0";
var STORE_KEY = "sr-daily-log-v1";
var STORE_VERSION = 3;

/* ---------- scales ---------- */

/* Severity reads as heat: nothing, yellow, orange, red. Yellow to red through
   orange is the one multi-hue ramp that is not a rainbow — the hues carry the
   meaning rather than decorating it. Every step takes dark ink at 4.9:1 or
   better, and none of them is bright enough to glare in a dark room. */
var RAMP4 = ["#2B333C", "#A88A38", "#C07A3E", "#CE6A55"];
var RAMP6 = ["#2B333C", "#645429", "#A88A38", "#C07A3E", "#CE6A55", "#D8806C"];

/* Sleep quality runs the other way — 3 is a good night — so it runs down
   through the same heat and out the other side into green. */
var SLEEP_RAMP = ["#CE6A55", "#C07A3E", "#454F5C", "#53946A"];

/* Mood is the one genuinely two-sided scale: neutral in the middle, and
   intensity growing outwards in both directions rather than only upwards. */
var MOOD_RAMP = ["#53946A", "#35604A", "#454F5C", "#C07A3E", "#CE6A55"];

/* Pacing is scored on the value, not the distance from baseline: 0 and 1 are
   both paced days and both pay, so both read green, with 0 the stronger of
   the two. Yellow is skipped — there is no "slightly off" here. */
var PACING_RAMP = ["#53946A", "#35604A", "#C07A3E", "#CE6A55"];

/* On Home, colour is distance from your baseline rather than the raw value,
   so the heat continues past the neutral into green for better than normal. */
var VAL = {
  good2: "#53946A",   /* two or more better than baseline */
  good1: "#35604A",
  same:  "#454F5C",
  bad1:  "#A88A38",   /* one worse  — yellow */
  bad2:  "#C07A3E",   /* two worse  — orange */
  bad3:  "#CE6A55",   /* three or more worse — red */
  none:  "transparent"
};

/* Three line slots, assigned in this fixed order and never cycled.

   Three is the cap because of what the numbers say, not taste: at this
   lightness these three are ΔE 6.2 apart under protanopia — inside the floor
   band, which is only legal alongside a second channel that is not colour. So
   each slot also owns a dash pattern, and every point carries a dot. A fourth
   hue muted enough for this screen collapses into one of these (a purple I
   tried sat ΔE 0.5 from the blue under deuteranopia — indistinguishable). */
var SERIES_DETAIL = { week: "#C4714C", pem: "#8FB6E0" };

/* A score's colour follows its value rather than sitting in one of three
   buckets: seven steps from green through neutral into the heat, each one
   checked against the page background rather than chosen by eye (the weakest
   is 5.17:1, the strongest 8.82:1).

   Both numbers are fed the same way — as "how good is this", which for the PEM
   predictor means 100 minus the score — so a green 80 and a green 20 mean the
   same thing even though the numbers point opposite ways. */
var SCORE_HUES = [
  { at: 90, hue: "#7FBF97" },
  { at: 80, hue: "#6FAF87" },
  { at: 70, hue: "#8FB49B" },
  { at: 60, hue: "#A9B3BD" },
  { at: 45, hue: "#C9A45C" },
  { at: 30, hue: "#D08A6B" },
  { at: 0,  hue: "#C4704F" }
];

function scoreHue(goodness) {
  for (var i = 0; i < SCORE_HUES.length; i++) {
    if (goodness >= SCORE_HUES[i].at) return SCORE_HUES[i].hue;
  }
  return SCORE_HUES[SCORE_HUES.length - 1].hue;
}

var SLOTS = [
  { colour: "#C4714C", dash: "" },
  { colour: "#8FB6E0", dash: "6 3" },
  { colour: "#3E7F72", dash: "1.5 3" }
];
var MAX_LINES = SLOTS.length;

/* Whichever of the two text colours actually reads on each fill. */
var INK = {
  "#A88A38": "#14181C", "#C07A3E": "#14181C", "#CE6A55": "#14181C",
  "#D8806C": "#14181C", "#53946A": "#14181C",
  "#2B333C": "#C6CED6", "#645429": "#C6CED6", "#454F5C": "#C6CED6",
  "#35604A": "#C6CED6"
};

/* A 0-100 load, banded the same way the PEM predictor bands itself. */
function heatFill(score) {
  if (score === null || score === undefined) return VAL.none;
  if (score === 0) return VAL.same;
  if (score <= 20) return VAL.bad1;
  if (score <= 40) return VAL.bad2;
  return VAL.bad3;
}

function valenceFill(delta) {
  if (delta === null || delta === undefined) return VAL.none;
  if (delta <= -2) return VAL.good2;
  if (delta === -1) return VAL.good1;
  if (delta === 0) return VAL.same;
  if (delta === 1) return VAL.bad1;
  if (delta === 2) return VAL.bad2;
  return VAL.bad3;
}

/* ---------- what the numbers mean ---------- */

/* A bare 0-3 tells you nothing at three in the morning, and two of these
   scales run the opposite way to the rest. Every rated row carries its anchors
   under the buttons.

   Sleep quality and pacing are the two that genuinely invert: on both, a high
   number is the bad end everywhere else, and here it is the good one for sleep
   and the bad one for pacing despite both being about doing well. */
var SCALE_SEVERITY = ["none", "mild", "moderate", "severe"];
var SCALE_DEMAND = ["none", "a little", "a fair bit", "a lot"];

/* Read once under the band header rather than repeated under all sixteen
   rows. Only the scales that cannot be inferred from their neighbours — sleep,
   pacing, the 0-5 episode — carry their words per row. */
var BAND_SCALE = {
  Symptoms: SCALE_SEVERITY,
  Exertion: SCALE_DEMAND
};
/* Laid out in the same columns as the buttons below it, so each word sits over
   the number it names. The four button rows are the majority; Mood and the
   no/yes pairs carry their own words anyway. */
function bandLegend(band) {
  var words = BAND_SCALE[band];
  if (!words) return null;
  var row = el("div", { class: "scale band-legend" });
  words.forEach(function (w, i) {
    row.appendChild(el("span", { text: i + " " + w }));
  });
  return row;
}
var SCALE_SLEEP = ["awful", "poor", "ok", "good"];
var SCALE_PACING = ["paced well", "slipped", "pushed", "pushed hard"];
var SCALE_EPISODE = ["none", "slight", "mild", "clear", "strong", "severe"];

/* ---------- items ---------- */

var BUILTIN_SECTIONS = [
  { title: "Energy", band: "Symptoms", items: [
    { key: "tired", label: "Feeling tired / sluggish" },
    { key: "pem", label: "PEM" },
    { key: "crash", label: "Crash", max: 1, labels: ["no", "yes"] }
  ]},
  { title: "Brain", items: [
    { key: "mood", label: "Mood", max: 4, ramp: MOOD_RAMP,
      labels: ["happy", "good", "neutral", "meh", "bad"] },
    { key: "brainFog", label: "Brain fog" },
    { key: "headache", label: "Headache" },
    { key: "noise", label: "Noise sensitivity" }
  ]},
  { title: "Body", items: [
    { key: "muscleAches", label: "Muscle burn" },
    { key: "muscleWeakness", label: "Muscle weakness" },
    { key: "breath", label: "Shortness of breath" },
    { key: "soreThroat", label: "Sore throat" },
    { key: "sweating", label: "Sweating / thermal dysregulation" },
    { key: "hyper", label: "Hyper / sympathetic overdrive" },
    { key: "mcas", label: "MCAS" }
  ]},
  { title: "Gut", items: [
    { key: "constipation", label: "Constipation" },
    { key: "diarrhea", label: "Diarrhea" },
    { key: "indigestion", label: "Post-dinner indigestion" }
  ]},
  { title: "What the day asked of you", band: "Exertion", items: [
    { key: "physical", label: "Physically active" },
    { key: "orthostatic", label: "Orthostatic exertion" },
    { key: "mental", label: "Mentally demanding" },
    { key: "social", label: "Socially demanding" },
    { key: "emotional", label: "Emotionally stressful" },
    { key: "other", label: "Other" },
    { key: "pacing", label: "Pacing", ramp: PACING_RAMP, scale: SCALE_PACING }
  ]}
];

var BUILTIN_MORNING = [
  { key: "sleep", label: "Sleep quality", ramp: SLEEP_RAMP, higherIsBetter: true,
    scale: SCALE_SLEEP },
  { key: "episode", label: "Dysautonomic episode", max: 5, ramp: RAMP6,
    scale: SCALE_EPISODE },
  { key: "syncope", label: "Near-syncope", max: 1, labels: ["no", "yes"] }
];

/* The registry is rebuilt rather than fixed, because what is tracked is a
   setting now: items can be hidden, and your own can be added. Everything
   downstream — the entry screens, the scores, the panels, the chart picker —
   reads these, so there is one place that decides what exists.

   Hidden items keep their history. They stop being offered for entry and stop
   counting toward the scores, but every value ever recorded still exports. */
var EVENING_SECTIONS, EVENING_ITEMS, MORNING_ITEMS, ALL_ITEMS, ITEM_BY_KEY,
    EVENING_KEYS, ALL_KEYS, MORNING_KEYS, CARRY_KEYS,
    LOAD_KEYS, SCORE_ITEMS, DEMAND_ITEMS, MIN_SCORED, MIN_LOAD_ITEMS;

var BUILTIN_LOAD_KEYS = ["physical", "orthostatic", "mental", "social", "emotional",
  "other", "pacing"];

function customItems(band) {
  return (state.custom || []).filter(function (c) { return c.band === band; })
    .map(function (c) {
      var item = { key: c.key, label: c.label, custom: true };
      if (c.section) item.section = c.section;
      if (c.max !== undefined) item.max = c.max;
      if (c.max === 1) item.labels = ["no", "yes"];
      else if (c.max === 3) item.scale = band === "exertion" ? SCALE_DEMAND : SCALE_SEVERITY;
      return item;
    });
}

/* The sections a custom symptom can be filed under. Everything before the
   Exertion band belongs to Symptoms. */
function symptomSectionTitles() {
  var out = [];
  for (var i = 0; i < BUILTIN_SECTIONS.length; i++) {
    if (BUILTIN_SECTIONS[i].band === "Exertion") break;
    out.push(BUILTIN_SECTIONS[i].title);
  }
  return out;
}

/* What the settings list prints beside a custom item's name. */
function customWhere(c) {
  if (c.band === "symptoms" && c.section && symptomSectionTitles().indexOf(c.section) >= 0) {
    return c.section;
  }
  return bandName(c.band);
}

function isHidden(key) {
  return !!(state.hidden && state.hidden[key]);
}

function rebuildItems() {
  var visible = function (i) { return !isHidden(i.key); };
  var mine = customItems("symptoms").filter(visible);
  var titles = symptomSectionTitles();
  var placed = {};

  EVENING_SECTIONS = BUILTIN_SECTIONS.map(function (sec) {
    var items = sec.items.filter(visible);
    if (sec.band === "Exertion") {
      items = items.concat(customItems("exertion").filter(visible));
    } else if (titles.indexOf(sec.title) >= 0) {
      /* A custom symptom filed under this section joins the end of it. The
         concat happens before the empty-section filter, so a section whose
         built-in items are all hidden still appears for its custom ones. */
      mine.forEach(function (it) {
        if (it.section === sec.title) { items = items.concat([it]); placed[it.key] = true; }
      });
    }
    return { title: sec.title, band: sec.band, items: items };
  }).filter(function (sec) { return sec.items.length > 0; });

  /* Anything with no section chosen, or a section that no longer exists,
     sits at the end of the Symptoms band, before Exertion. */
  var loose = mine.filter(function (it) { return !placed[it.key]; });
  if (loose.length) {
    var at = EVENING_SECTIONS.length;
    for (var i = 0; i < EVENING_SECTIONS.length; i++) {
      if (EVENING_SECTIONS[i].band === "Exertion") { at = i; break; }
    }
    EVENING_SECTIONS.splice(at, 0, { title: "Your own", items: loose });
  }
  /* A band header belongs to whichever section now opens that band. */
  var seen = {};
  EVENING_SECTIONS.forEach(function (sec) {
    if (sec.band) { seen[sec.band] = true; }
  });
  if (!seen.Symptoms && EVENING_SECTIONS.length && !EVENING_SECTIONS[0].band) {
    EVENING_SECTIONS[0].band = "Symptoms";
  }

  MORNING_ITEMS = BUILTIN_MORNING.filter(visible).concat(customItems("night").filter(visible));

  EVENING_ITEMS = [];
  EVENING_SECTIONS.forEach(function (sec) { EVENING_ITEMS = EVENING_ITEMS.concat(sec.items); });
  ALL_ITEMS = EVENING_ITEMS.concat(MORNING_ITEMS);
  ITEM_BY_KEY = {};
  ALL_ITEMS.forEach(function (i) { ITEM_BY_KEY[i.key] = i; });
  EVENING_KEYS = EVENING_ITEMS.map(function (i) { return i.key; });
  ALL_KEYS = ALL_ITEMS.map(function (i) { return i.key; });
  MORNING_KEYS = MORNING_ITEMS.map(function (i) { return i.key; });
  CARRY_KEYS = EVENING_KEYS;

  LOAD_KEYS = BUILTIN_LOAD_KEYS.concat(customItems("exertion").map(function (i) { return i.key; }));
  SCORE_ITEMS = ALL_ITEMS.filter(function (i) { return LOAD_KEYS.indexOf(i.key) < 0; });
  DEMAND_ITEMS = ALL_ITEMS.filter(function (i) { return LOAD_KEYS.indexOf(i.key) >= 0; });

  /* The floors have to bend to what is actually tracked, or hiding a handful
     of items would silently switch a score off for good. */
  MIN_SCORED = Math.max(1, Math.min(8, Math.ceil(SCORE_ITEMS.length / 2)));
  MIN_LOAD_ITEMS = Math.max(1, Math.min(3, Math.ceil((DEMAND_ITEMS.length + 2) / 2)));
}

/* Every key that has ever been defined, so hiding or deleting an item never
   drops its history out of the CSV. */
function exportKeys() {
  var keys = [];
  BUILTIN_SECTIONS.forEach(function (sec) {
    sec.items.forEach(function (i) { keys.push(i.key); });
  });
  BUILTIN_MORNING.forEach(function (i) { keys.push(i.key); });
  (state.custom || []).forEach(function (c) {
    if (keys.indexOf(c.key) < 0) keys.push(c.key);
  });
  Object.keys(state.retired || {}).forEach(function (k) {
    if (keys.indexOf(k) < 0) keys.push(k);
  });
  return keys;
}

function exportNameFor(key) {
  if (EXPORT_NAME[key]) return EXPORT_NAME[key];
  var c = (state.custom || []).filter(function (x) { return x.key === key; })[0];
  if (c) return c.label;
  return (state.retired || {})[key] || key;
}

var DEFAULT_BASELINES = {
  tired: 2, pem: 1, crash: 0, mood: 2, brainFog: 2, headache: 0, noise: 2,
  muscleAches: 1, muscleWeakness: 2, breath: 1, soreThroat: 0,
  sweating: 0, hyper: 1, mcas: 0, constipation: 0, diarrhea: 0, indigestion: 0,
  other: 0,
  physical: 1, orthostatic: 1, mental: 1, social: 1, emotional: 0, pacing: 1,
  sleep: 2, episode: 0, syncope: 0,
  /* Not a 0-3 rating: the hours you normally need. Only shortfall counts. */
  hoursTarget: 8
};

var TAGS = ["episode", "visitor", "extra med", "bad night", "GI", "heat", "appointment"];
/* "Stomach at bedtime" was a four way pick until v1.6.0, when it became the
   rated Post-dinner indigestion item. Old values still export unchanged. */

/* ---------- export naming (matches the Visible CSV) ---------- */

var EXPORT_NAME = {
  tired: "Feeling tired/sluggish", pem: "Post-exertional malaise",
  crash: "Crash", mood: "Mood", brainFog: "Brain Fog",
  headache: "Headache", noise: "Noise sensitivity", muscleAches: "Muscle aches",
  muscleWeakness: "Muscle weakness", breath: "Shortness of breath",
  soreThroat: "Sore throat", sweating: "Sweating & thermal dysregulation",
  hyper: "Hyper/sympathetic overdrive", mcas: "MCAS",
  other: "Other exertion",
  constipation: "Constipation",
  diarrhea: "Diarrhea", indigestion: "Post-dinner indigestion",
  physical: "Physically active", orthostatic: "Orthostatic exertion",
  mental: "Mentally demanding",
  social: "Socially demanding", emotional: "Emotionally stressful",
  pacing: "Pacing (low = better)", sleep: "Sleep",
  episode: "Dysautonomic episode (0-5)", syncope: "Near-syncope",
  lastBite: "Time of last bite", stomach: "Stomach at bedtime",
  sleepHours: "Sleep hours"
};

var CATEGORY = {
  tired: "General", pem: "General", crash: "Experience",
  mood: "Emotional", brainFog: "Brain", headache: "Brain",
  noise: "Sensory", muscleAches: "Muscles", muscleWeakness: "Muscles",
  breath: "Heart and Lungs", soreThroat: "Pain", sweating: "Custom",
  hyper: "Custom", mcas: "Custom", other: "Custom",
  constipation: "Gastrointestinal", diarrhea: "Gastrointestinal",
  indigestion: "Gastrointestinal",
  physical: "Physical", orthostatic: "Physical", mental: "Cognitive", social: "Social",
  emotional: "Emotional", pacing: "Custom", sleep: "Sleep",
  episode: "Custom", syncope: "Custom", lastBite: "Custom", stomach: "Custom",
  sleepHours: "Sleep"
};

/* ---------- dates ---------- */

function iso(d) {
  return d.getFullYear() + "-" +
    String(d.getMonth() + 1).padStart(2, "0") + "-" +
    String(d.getDate()).padStart(2, "0");
}
function today() { return iso(new Date()); }
function shiftDay(dateStr, n) {
  var p = dateStr.split("-").map(Number);
  return iso(new Date(p[0], p[1] - 1, p[2] + n));
}
var DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
var MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                   "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
/* Written out by hand: toLocaleDateString gives "Mon, 14 Sept", which is
   noisier than it needs to be at night. */
function pretty(dateStr) {
  var p = dateStr.split("-").map(Number);
  var d = new Date(p[0], p[1] - 1, p[2]);
  return DAY_NAMES[d.getDay()] + " " + d.getDate() + " " + MONTH_NAMES[d.getMonth()];
}
function relativeWord(dateStr) {
  var t = today();
  if (dateStr === t) return "today";
  if (dateStr === shiftDay(t, -1)) return "yesterday";
  if (dateStr === shiftDay(t, 1)) return "tomorrow";
  return "";
}

/* ---------- storage ---------- */

var state = {
  days: {},
  baselines: Object.assign({}, DEFAULT_BASELINES),
  tab: "home",
  eveDate: today(),
  mornDate: shiftDay(today(), -1),
  storeOk: true,
  storeMsg: "",
  lastBackupAt: null,
  chartKeys: ["symptoms", "exertion"],
  detail: "week",
  settings: null,
  hidden: {},
  custom: [],
  retired: {},
  pay: { on: true, win: 0.20, pacing1: 0.25, pacing0: 0.50, start: 0 },
  home: { scores: true, chart: true, pacing: true, done: true, pot: true, backup: true,
          chartStyle: "rows" },
  purchases: [],
  /* An imported episode log (or null) and changes added here. */
  episodeLog: { file: null, changes: [] }
};

/* Mood went from four points to five in v1.9.0, with neutral inserted in the
   middle. Under the old scale 2 meant "meh" and 3 meant "bad"; under the new
   one those are 3 and 4. Without this, a day logged as bad would quietly
   redisplay as meh. Runs on anything written before store version 3, and on
   restored backups too. */
function migrate(parsed) {
  if (!parsed || (parsed.version || 0) >= 3) return parsed;
  var bump = function (v) { return v === 2 ? 3 : v === 3 ? 4 : v; };
  Object.keys(parsed.days || {}).forEach(function (d) {
    var e = parsed.days[d];
    if (e && e.v && e.v.mood !== undefined) e.v.mood = bump(e.v.mood);
  });
  if (parsed.baselines && parsed.baselines.mood !== undefined) {
    parsed.baselines.mood = bump(parsed.baselines.mood);
  }
  parsed.version = 3;
  return parsed;
}

function loadStore() {
  try {
    var raw = localStorage.getItem(STORE_KEY);
    if (!raw) return;
    var parsed = migrate(JSON.parse(raw));
    state.days = parsed.days || {};
    state.baselines = Object.assign({}, DEFAULT_BASELINES, parsed.baselines || {});
    state.lastBackupAt = parsed.lastBackupAt || null;
    if (parsed.chartKeys && parsed.chartKeys.length) state.chartKeys = parsed.chartKeys;
    state.hidden = parsed.hidden || {};
    state.custom = parsed.custom || [];
    state.retired = parsed.retired || {};
    state.pay = Object.assign({ on: true, win: 0.20, pacing1: 0.25, pacing0: 0.50, start: 0 },
      parsed.pay || {});
    state.purchases = parsed.purchases || [];
    state.episodeLog = Object.assign({ file: null, changes: [] }, parsed.episodeLog || {});
    state.home = Object.assign({ scores: true, chart: true, pacing: true, done: true,
      pot: true, backup: true, chartStyle: "rows" }, parsed.home || {});
    rebuildItems();
  } catch (e) {
    state.storeOk = false;
    state.storeMsg = "read: " + (e && e.message ? e.message : String(e));
  }
}

var saveTimer = null;
function saveNow() {
  if (saveTimer) { clearTimeout(saveTimer); saveTimer = null; }
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify({
      version: STORE_VERSION, days: state.days, baselines: state.baselines,
      lastBackupAt: state.lastBackupAt, chartKeys: state.chartKeys,
      hidden: state.hidden, custom: state.custom, retired: state.retired, pay: state.pay,
      purchases: state.purchases, home: state.home, episodeLog: state.episodeLog
    }));
    if (!state.storeOk) { state.storeOk = true; state.storeMsg = ""; renderBanner(); }
    flash("Saved");
  } catch (e) {
    state.storeOk = false;
    state.storeMsg = "write: " + (e && e.message ? e.message : String(e));
    renderBanner();
    flash("Not saved");
  }
}
function saveSoon(ms) {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(saveNow, ms === undefined ? 400 : ms);
}

var flashTimer = null;
function flash(text) {
  var el = document.getElementById("status");
  el.textContent = text;
  el.style.color = state.storeOk ? "var(--dim)" : "var(--warn)";
  if (flashTimer) clearTimeout(flashTimer);
  flashTimer = setTimeout(function () { el.textContent = ""; }, 1500);
}

/* ---------- entries ---------- */

/* Only the rated items — state.baselines also carries hoursTarget, which is a
   setting rather than a value a day can hold. */
function baselineValues() {
  var v = {};
  ALL_KEYS.forEach(function (k) { v[k] = state.baselines[k]; });
  return v;
}

function emptyEntry(date) {
  return {
    date: date, v: baselineValues(), touched: {},
    lastBite: "", stomach: "", sleepHours: "", wins: [], tags: [],
    note: "", detail: {}, nightNote: "",
    complete: false, morningDone: false, savedAt: null, updatedAt: null
  };
}
/* Read-only view of a day. Days that do not exist yet read as baseline. */
function getEntry(date) {
  return state.days[date] || emptyEntry(date);
}
/* Write path: creates the day if it is not there yet. */
function update(date, fn) {
  var e = state.days[date];
  if (!e) { e = emptyEntry(date); state.days[date] = e; }
  fn(e);
  e.updatedAt = new Date().toISOString();
  return e;
}
function offBaselineKeys(entry, keys) {
  return keys.filter(function (k) {
    return entry.v[k] !== undefined && entry.v[k] !== state.baselines[k];
  });
}

/* ---------- tiny DOM helpers ---------- */

function el(tag, props, kids) {
  var n = document.createElement(tag);
  if (props) Object.keys(props).forEach(function (k) {
    if (k === "class") n.className = props[k];
    else if (k === "text") n.textContent = props[k];
    else if (k === "html") n.innerHTML = props[k];
    else if (k.slice(0, 2) === "on") n.addEventListener(k.slice(2), props[k]);
    else if (k === "style") Object.assign(n.style, props[k]);
    else n.setAttribute(k, props[k]);
  });
  (kids || []).forEach(function (c) { if (c) n.appendChild(c); });
  return n;
}
function section(title, kids) {
  return el("div", { class: "section" },
    [title ? el("h2", { class: "section-head", text: title }) : null].concat(kids || []));
}

/* ---------- rating row ---------- */

/* item: {key,label,max,labels,ramp}
   getValue/setValue work on whatever record the screen is editing.
   baselineOf returns the marked baseline, or undefined on the Baseline screen. */
function ratingRow(item, getValue, setValue, baselineOf, onAfter) {
  var max = item.max === undefined ? 3 : item.max;
  var ramp = item.ramp || RAMP4;
  var dot = el("span", { class: "dot", text: "●" });
  var label = el("div", { class: "label" }, [
    el("span", { text: item.label }), dot
  ]);
  var opts = el("div", { class: "opts" });
  var buttons = [];
  for (var n = 0; n <= max; n++) {
    (function (n) {
      var b = el("button", {
        type: "button",
        "aria-pressed": "false",
        text: item.labels ? item.labels[n] : String(n),
        onclick: function () { setValue(n); refresh(); if (onAfter) onAfter(); }
      });
      buttons.push(b);
      opts.appendChild(b);
    })(n);
  }
  function refresh() {
    var value = getValue();
    var base = baselineOf ? baselineOf() : undefined;
    buttons.forEach(function (b, n) {
      var on = value === n;
      var isBase = base === n;
      b.setAttribute("aria-pressed", on ? "true" : "false");
      b.setAttribute("data-baseline", isBase ? "1" : "0");
      /* On a no/yes item, yes is the severe end, not step one of four. A crash
         drawn in the mildest colour on the scale would read as a small thing. */
      var fill = ramp[max === 1 && n === 1 ? ramp.length - 1 : Math.min(n, ramp.length - 1)];
      /* The warm ramps go dark-on-fill from step 2 up. A valenced ramp is not
         monotone in lightness, so it says which ink it takes. */
      b.setAttribute("data-dark", (INK[fill] || (n >= 2 ? "#14181C" : "")) === "#14181C" ? "1" : "0");
      b.style.background = on ? fill : "";
      /* The baseline keeps its dashed outline even while it is the value you
         picked, so normal is always visible. On a filled button the dash is
         drawn in that button's own text colour. */
      b.style.borderColor = isBase
        ? (on ? (b.getAttribute("data-dark") === "1" ? "#14181C" : "var(--text)") : "var(--dim)")
        : (on ? fill : "");
    });
    var off = base !== undefined && value !== undefined && value !== base;
    dot.style.display = off ? "" : "none";
    if (off) {
      /* The dot says which way it went, not just that it moved. */
      var worse = item.higherIsBetter ? value < base : value > base;
      dot.style.color = worse ? "var(--accent)" : "#6FAF87";
    }
  }
  refresh();
  /* Anchors go under the buttons, one per button, so the words line up with
     the numbers they belong to. Rows whose buttons already carry words — the
     no/yes pairs and mood — need nothing. */
  var kids = [label, opts];
  if (item.scale && !item.labels) {
    var anchors = el("div", { class: "scale" });
    for (var k = 0; k <= max; k++) {
      anchors.appendChild(el("span", { text: item.scale[k] === undefined ? "" : item.scale[k] }));
    }
    kids.push(anchors);
  }
  return { el: el("div", { class: "row" }, kids), refresh: refresh };
}

/* Stepper buttons so a value needs no keyboard in the dark; the field still
   takes a typed number. Used for hours of sleep and for the reward amounts. */
function numberStepper(get, set, opts) {
  opts = opts || {};
  var step = opts.step === undefined ? 0.5 : opts.step;
  var min = opts.min === undefined ? 0 : opts.min;
  var max = opts.max === undefined ? 24 : opts.max;
  var dp = opts.decimals === undefined ? 1 : opts.decimals;
  var field = el("input", { type: "number", step: String(step), min: String(min), max: String(max),
    inputmode: "decimal", class: "hours-field", placeholder: opts.placeholder || "\u2013" });

  function show(n) {
    field.value = n === "" || n === null || n === undefined ? "" : String(Number(n));
  }
  show(get());

  function write(v) {
    var n = v === "";
    if (!n) {
      var f = parseFloat(v);
      if (isNaN(f)) { n = true; }
      else {
        f = Math.max(min, Math.min(max, Math.round(f / step) * step));
        v = Number(f.toFixed(dp));
      }
    }
    if (n) v = opts.required ? get() : "";
    show(v);
    set(v);
    saveSoon(200);
  }
  field.addEventListener("change", function () { write(field.value); });

  function bump(by) {
    /* From blank the first press lands on the anchor, not anchor plus a step. */
    var v = parseFloat(field.value);
    write(isNaN(v) ? (opts.anchor === undefined ? 8 : opts.anchor) : v + by);
    saveNow();
  }
  return el("div", { class: "stepper" }, [
    el("button", { class: "btn", type: "button", text: "\u2212", "aria-label": "Less",
      onclick: function () { bump(-step); } }),
    field,
    el("button", { class: "btn", type: "button", text: "+", "aria-label": "More",
      onclick: function () { bump(step); } })
  ]);
}

function hoursStepper(get, set, opts) {
  return numberStepper(get, set, Object.assign({ step: 0.5, max: 24, anchor: 8 }, opts || {}));
}

/* ---------- date navigation ---------- */

function dateNav(getDate, setDate, caption) {
  var cap = el("div", { class: "caption" });
  function paint() { cap.innerHTML = ""; caption(cap); }
  paint();
  return el("div", { class: "datenav" }, [
    el("button", { type: "button", "aria-label": "Previous day", text: "‹",
      onclick: function () { setDate(shiftDay(getDate(), -1)); } }),
    cap,
    el("button", { type: "button", "aria-label": "Next day", text: "›",
      onclick: function () { setDate(shiftDay(getDate(), 1)); } })
  ]);
}

/* ---------- scoring ---------- */

/* The score is about how you were, not what the day asked of you. Being
   physically active is a cause, not a symptom, so those five items are left
   out of it. */

/* How far one item sits the wrong side of its baseline, as 0..1.
   0 = at your normal or better. 1 = as bad as that item goes. */
function itemBurden(item, value, base) {
  if (value === undefined || base === undefined) return null;
  var max = item.max === undefined ? 3 : item.max;
  var headroom = item.higherIsBetter ? base : max - base;
  if (headroom <= 0) return null;            /* no room to get worse: no signal */
  var worse = item.higherIsBetter ? base - value : value - base;
  return Math.max(0, Math.min(1, worse / headroom));
}

/* Does this item on this day carry a value you actually stand behind?

   Every record is created pre-filled at baseline, so a value being present
   means nothing on its own — a night you never logged would otherwise count
   as a normal night and quietly flatter the score. It counts if you moved it
   yourself, or if you pressed Save day (evening items) or finished the
   morning (night items), which is where leaving something at baseline becomes
   a statement that it was normal. */

function itemCounts(entry, key) {
  if (entry.touched && entry.touched[key]) return true;
  if (MORNING_KEYS.indexOf(key) >= 0) return nightIsLogged(entry);
  return !!entry.complete;
}

/* A day part way through entry says almost nothing. One item tapped at its
   worst would otherwise read as a score of 0. Half the items is the floor for
   a day to count at all; pressing Save day clears it comfortably. */

/* As above, for the symptom side. */
function scoreParts(entry) {
  var parts = [];
  SCORE_ITEMS.forEach(function (it) {
    if (!itemCounts(entry, it.key)) return;
    var b = itemBurden(it, entry.v[it.key], state.baselines[it.key]);
    if (b !== null) parts.push({ key: it.key, label: it.label, burden: b });
  });
  return parts;
}

/* Mean burden across the items that day actually stands behind. */
function dayBurden(entry) {
  if (!entry) return null;
  var parts = scoreParts(entry);
  if (parts.length < MIN_SCORED) return null;
  var sum = 0;
  parts.forEach(function (p) { sum += p.burden; });
  return sum / parts.length;
}

function dayScore(entry) {
  var b = dayBurden(entry);
  return b === null ? null : Math.round(100 * (1 - b));
}

/* ---------- room left: the forward-looking half ---------- */

/* Six inputs: the five demand items the week score leaves out, plus sleep
   quality. All the demand items read higher = more demand, pacing included —
   its label is "low = better", so a high value is a day you pushed through
   rather than paced. Sleep runs the other way and itemBurden already knows it.

   Sleep is in both numbers on purpose. In the week score it is a symptom, part
   of how the week went. Here it is a risk factor: a bad night leaves less to
   spend the next day. Same reading, two jobs.

   Note the two axes, which are easy to confuse: these six items are averaged
   into one burden for a day, and then four DAYS of that burden are weighted
   below. Six items, four days. */

/* Hours short of the hours you normally need, as 0..1. Sleeping longer than
   target scores 0 rather than earning credit, the same as every other item.
   A blank is not a zero — it is no reading at all. */
function hoursBurden(entry) {
  var h = entry.sleepHours;
  if (h === "" || h === undefined || h === null) return null;
  var target = state.baselines.hoursTarget || DEFAULT_BASELINES.hoursTarget;
  if (!target) return null;
  return Math.max(0, Math.min(1, (target - Number(h)) / target));
}

/* Everything the predictor weighs on one day, as a flat list. Both the score
   and the panel that explains it read from here, so they cannot disagree about
   what counted. Sleep quality and sleep hours are separate items: two readings
   of the same night, but each carries its own weight. */
function loadParts(entry) {
  var parts = [];
  DEMAND_ITEMS.forEach(function (it) {
    if (!itemCounts(entry, it.key)) return;
    var b = itemBurden(it, entry.v[it.key], state.baselines[it.key]);
    if (b !== null) parts.push({ key: it.key, label: it.label, burden: b });
  });
  if (itemCounts(entry, "sleep")) {
    var q = itemBurden(ITEM_BY_KEY.sleep, entry.v.sleep, state.baselines.sleep);
    if (q !== null) parts.push({ key: "sleep", label: "Sleep quality", burden: q });
  }
  var h = nightIsLogged(entry) ? hoursBurden(entry) : null;
  if (h !== null) parts.push({ key: "sleepHours", label: "Sleep hours", burden: h });
  return parts;
}

function loadBurden(entry) {
  if (!entry) return null;
  var parts = loadParts(entry);
  if (parts.length < MIN_LOAD_ITEMS) return null;
  var sum = 0;
  parts.forEach(function (p) { sum += p.burden; });
  return sum / parts.length;
}

/* Exertion that has not landed yet.

   PEM is delayed, typically by 12 to 48 hours, and it stacks: several ordinary
   days in a row can do what no single day would. So today and yesterday carry
   full weight — their PEM is still in flight — and the two days before that
   taper off as their effect has largely already arrived.

   These weights are a rule of thumb, not a measured curve. There is no
   validated formula for predicting PEM from self-reported exertion; the
   closest research idea is Jason's energy envelope, which is correlational.
   Treat the number as a prompt to think, not a forecast. */
var LOAD_WEIGHTS = [1, 1, 0.6, 0.3];

/* Runs the opposite way to the week score: here a high number is a warning,
   not a good sign, because that is the only reading of "PEM predictor" that
   makes sense. The band word next to it always says which way it points. */
function pemRisk(endDate) {
  var sum = 0, weight = 0, days = 0;
  for (var i = 0; i < LOAD_WEIGHTS.length; i++) {
    var b = loadBurden(settledEntry(shiftDay(endDate, -i)));
    if (b === null) continue;
    sum += LOAD_WEIGHTS[i] * b; weight += LOAD_WEIGHTS[i]; days++;
  }
  if (days < 2) return { risk: null, days: days };
  return { risk: Math.round(100 * (sum / weight)), days: days };
}

/* Has the cost already arrived, or is it still coming? */
function symptomsHoldingUp(endDate) {
  var scores = [];
  for (var i = 0; i < 2; i++) {
    var sc = dayScore(settledEntry(shiftDay(endDate, -i)));
    if (sc !== null) scores.push(sc);
  }
  if (scores.length === 0) return null;
  return scores.reduce(function (a, b) { return a + b; }, 0) / scores.length >= 85;
}

/* Seven days ending at endDate, weighted by recency with a three day half
   life: today counts 1, three days back counts a half, six days back a
   quarter. Days with no entry are skipped and the weights renormalised.
   Under three days of data there is nothing worth averaging. */
function weekScore(endDate) {
  var sum = 0, weight = 0, days = 0;
  for (var i = 0; i < 7; i++) {
    var b = dayBurden(settledEntry(shiftDay(endDate, -i)));
    if (b === null) continue;
    var w = Math.pow(0.5, i / 3);
    sum += w * b; weight += w; days++;
  }
  if (days < 3) return { score: null, days: days };
  return { score: Math.round(100 * (1 - sum / weight)), days: days };
}

/* Today is still happening. Until you press Save day it is a day in progress,
   not a reading: a couple of items tapped in the afternoon would otherwise feed
   both scores, and today carries the heaviest weight in the PEM predictor of
   any day in the window. So every backward-looking view — the scores, their
   panels, the chart, the strips — reads days through here, and today joins the
   record when the evening is submitted.

   The pot is deliberately not gated: a win should pay the moment you log it. */
function settledEntry(date) {
  var e = state.days[date];
  if (!e) return null;
  if (date === today() && !e.complete) return null;
  return e;
}

/* The day both scores are read at: the last day whose evening was saved.

   Reading them at today's date instead made them move on their own. At
   midnight the window slid a day and the weights shifted under the same data,
   so the numbers changed overnight with nothing logged, and the change that
   saving an evening made was hard to see against that drift. Anchored here,
   they change at exactly two moments: when an evening is saved (both scores),
   and when a morning is logged, because the night is stored on the evening
   before it and sleep feeds both. The pacing row uses the same idea. */
function scoreEnd() {
  var t = today();
  for (var i = 0; i < 14; i++) {
    var d = shiftDay(t, -i);
    if (state.days[d] && state.days[d].complete) return d;
  }
  return t;
}

/* An anchor older than yesterday means an evening was missed, and the number
   on show is older than it looks. Say so rather than pass it off as current. */
function staleSince(end) {
  if (end >= shiftDay(today(), -1)) return null;
  var p = end.split("-").map(Number);
  return DAY_NAMES[new Date(p[0], p[1] - 1, p[2]).getDay()];
}

/* ---------- the pot ---------- */

/* Paid for the two things worth reinforcing: noticing you did something well,
   and pacing. Pacing is scored on the value itself rather than on the distance
   from baseline — 1 is your normal and still earns, 0 earns double. */
function payWin() { return state.pay.on ? state.pay.win : 0; }
function payPacing(v) {
  if (!state.pay.on) return 0;
  return v === 0 ? state.pay.pacing0 : v === 1 ? state.pay.pacing1 : 0;
}

function euro(n) {
  /* The sign belongs in front of the symbol, not between it and the digits. */
  return (n < 0 ? "\u2212\u20ac" : "\u20ac") + Math.abs(n).toFixed(2);
}

/* A day only pays for pacing you actually stood behind, so days that merely
   exist at their pre-filled baseline do not quietly earn. */
function pacingPay(entry) {
  if (!entry || !itemCounts(entry, "pacing")) return 0;
  return payPacing(entry.v.pacing);
}
function winCount(entry) {
  return entry && entry.wins ? entry.wins.length : 0;
}
function dayPay(entry) {
  return winCount(entry) * payWin() + pacingPay(entry);
}

function winTotal() {
  var n = 0;
  Object.keys(state.days).forEach(function (d) { n += winCount(state.days[d]); });
  return n;
}

function earnedTotal() {
  var total = 0;
  Object.keys(state.days).forEach(function (d) { total += dayPay(state.days[d]); });
  return total;
}

function spentTotal() {
  var total = 0;
  (state.purchases || []).forEach(function (x) { total += Number(x.amount) || 0; });
  return total;
}

/* Money that was already in the pot before this tracker existed. It lives in
   state.pay so it rides along in every save, backup and restore without a
   field of its own. */
function startTotal() {
  return Number(state.pay.start) || 0;
}

/* What is actually left to spend. */
function potTotal() {
  return startTotal() + earnedTotal() - spentTotal();
}

function logWin(date, text) {
  update(date, function (e) {
    if (!e.wins) e.wins = [];
    e.wins = e.wins.concat([{ at: new Date().toISOString(), text: text || "" }]);
  });
  saveNow();
}

/* pendingMsg is declared with the History screen and reused here. */

function removeWin(date, index) {
  update(date, function (e) {
    e.wins = (e.wins || []).slice();
    e.wins.splice(index, 1);
  });
  saveNow();
}

/* Which of the tab's occasional panels is open: "spend", "win", "more" or
   none. Held for the session only. Everything on this tab that is used now and
   then — recording a purchase, back-filling a win, the totals, the starting
   amount — sits folded behind one tap, so what shows by default is the balance
   and the record, which is what the tab is opened for. */
var rlhfOpen = null;

function rewardsScreen() {
  var wrap = el("div");
  var dates = Object.keys(state.days).sort().reverse();
  var wins = 0, pacing1 = 0, pacing0 = 0;
  dates.forEach(function (d) {
    var e = state.days[d];
    wins += winCount(e);
    if (itemCounts(e, "pacing") && e.v.pacing === 0) pacing0++;
    else if (itemCounts(e, "pacing") && e.v.pacing === 1) pacing1++;
  });

  var money = state.pay.on;
  if (!money && (rlhfOpen === "spend" || rlhfOpen === "more")) rlhfOpen = null;
  wrap.appendChild(el("div", { class: "score" }, [
    el("div", { class: "score-label", text: money ? "In the pot" : "Things done well" }),
    el("div", { class: "score-head" }, [
      el("span", { class: "score-num pot", text: money ? euro(potTotal()) : String(wins) })
    ]),
    el("div", { class: "score-cap", text: money
      ? (startTotal() ? "Brought in " + euro(startTotal()) + " · earned " : "Earned ")
        + euro(earnedTotal()) + " · spent " + euro(spentTotal())
      : "Paying for them is switched off in Settings" })
  ]));

  if (pendingMsg) {
    wrap.appendChild(el("div", { class: "msg", text: pendingMsg }));
    pendingMsg = "";
  }

  /* ---- the occasional actions, one row, each opening in place ---- */
  var actions = [];
  if (money) actions.push({ key: "spend", label: "Spend" });
  actions.push({ key: "win", label: "Add a missed win" });
  var actionRow = el("div", { class: "tags" });
  actions.forEach(function (a) {
    actionRow.appendChild(el("button", { type: "button", text: a.label,
      "aria-pressed": rlhfOpen === a.key ? "true" : "false",
      "aria-expanded": rlhfOpen === a.key ? "true" : "false",
      onclick: function () { rlhfOpen = rlhfOpen === a.key ? null : a.key; render(); } }));
  });
  wrap.appendChild(actionRow);

  if (rlhfOpen === "spend") {
    var buyAmount = el("input", { type: "number", step: "0.05", min: "0", inputmode: "decimal",
      class: "hours-field", placeholder: "0.00" });
    var buyText = el("input", { type: "text", placeholder: "What did you get?" });
    var buyDate = el("input", { type: "date", value: today() });
    var buyMsg = el("div", { class: "msg", style: { display: "none" } });
    wrap.appendChild(el("div", { class: "field-label", text: "Amount (€)" }));
    wrap.appendChild(buyAmount);
    wrap.appendChild(el("div", { class: "spacer" }));
    wrap.appendChild(buyText);
    wrap.appendChild(el("div", { class: "spacer" }));
    wrap.appendChild(buyDate);
    wrap.appendChild(el("div", { class: "spacer" }));
    wrap.appendChild(el("button", { class: "btn wide raised", type: "button", text: "Record it",
      onclick: function () {
        var amount = parseFloat(buyAmount.value);
        if (isNaN(amount) || amount <= 0) {
          buyMsg.textContent = "Put an amount in first."; buyMsg.style.display = ""; return;
        }
        state.purchases = (state.purchases || []).concat([{
          id: "p" + Date.now().toString(36),
          date: /^\d{4}-\d{2}-\d{2}$/.test(buyDate.value) ? buyDate.value : today(),
          text: buyText.value, amount: Math.round(amount * 100) / 100
        }]);
        saveNow();
        rlhfOpen = null;
        pendingMsg = "Recorded " + euro(amount) + ".";
        render();
      }}));
    wrap.appendChild(buyMsg);
    wrap.appendChild(el("div", { class: "note-line",
      text: "Nothing stops you going over — it is a record, not a lock." }));
  }

  if (rlhfOpen === "win") {
    var addMsg = el("div", { class: "msg", style: { display: "none" } });
    var winDate = el("input", { type: "date", value: today() });
    var winText = el("input", { type: "text", placeholder: "What was it? (optional)" });
    wrap.appendChild(el("div", { class: "field-label", text: "Day" }));
    wrap.appendChild(winDate);
    wrap.appendChild(el("div", { class: "spacer" }));
    wrap.appendChild(winText);
    wrap.appendChild(el("div", { class: "spacer" }));
    wrap.appendChild(el("button", { class: "btn wide raised", type: "button", text: "Add it to that day",
      onclick: function () {
        var d = winDate.value;
        if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) {
          addMsg.textContent = "Pick a day first."; addMsg.style.display = ""; return;
        }
        logWin(d, winText.value);
        rlhfOpen = null;
        pendingMsg = "Added to " + pretty(d) + ".";
        render();
      }}));
    wrap.appendChild(addMsg);
  }

  /* ---- the record: earning days and spending in one list, newest first ---- */
  var earning = dates.filter(function (d) {
    return money ? dayPay(state.days[d]) > 0 : winCount(state.days[d]) > 0;
  });
  var rows = earning.map(function (d) { return { date: d, day: d }; });
  if (money) {
    (state.purchases || []).forEach(function (x) { rows.push({ date: x.date, buy: x }); });
  }
  /* Newest first; on the same date, the spending sits above the earning. */
  rows.sort(function (a, b) {
    if (a.date !== b.date) return a.date < b.date ? 1 : -1;
    return (a.buy ? 0 : 1) - (b.buy ? 0 : 1);
  });

  wrap.appendChild(el("h2", { class: "band", text: "Record" }));
  if (rows.length === 0) {
    wrap.appendChild(el("div", { class: "hint",
      text: money
        ? "Nothing yet. Tap “Did something well” on Home, or log a day paced at 1 or 0."
        : "Nothing yet. Tap “Did something well” on Home." }));
  }
  rows.forEach(function (r) {
    if (r.buy) {
      var x = r.buy;
      wrap.appendChild(el("div", { class: "day spend-row" }, [
        el("div", { class: "line" }, [
          el("span", { text: pretty(x.date) + (x.text ? " · " + x.text : "") }),
          el("span", { class: "meta" }, [
            el("span", { class: "day-pay", text: "−" + euro(Number(x.amount)) }),
            el("button", { class: "quiet-btn spend-remove", type: "button", text: "remove",
              "aria-label": "Remove this purchase",
              onclick: function () {
                state.purchases = state.purchases.filter(function (y) { return y.id !== x.id; });
                saveNow(); render();
              }})
          ])
        ])
      ]));
      return;
    }
    var d = r.day, e = state.days[d];
    var bits = [];
    if (winCount(e)) bits.push(winCount(e) + (winCount(e) === 1 ? " win" : " wins"));
    if (pacingPay(e)) bits.push("pacing " + e.v.pacing);
    var row = el("button", { class: "day", type: "button",
      onclick: function () { openEvening(d); } }, [
      el("div", { class: "line" }, [
        el("span", { text: pretty(d) }),
        el("span", { class: "meta" }, [
          el("span", { text: bits.join(" · ") }),
          money ? el("span", { class: "day-pay", text: euro(dayPay(e)) }) : null
        ])
      ])
    ]);
    (e.wins || []).forEach(function (w) {
      if (w.text) row.appendChild(el("div", { class: "win-text", text: "“" + w.text + "”" }));
    });
    wrap.appendChild(row);
  });

  /* ---- totals and the one-off starting amount, folded at the foot ---- */
  if (money) {
    wrap.appendChild(el("button", { class: "quiet-btn more-toggle", type: "button",
      "aria-expanded": rlhfOpen === "more" ? "true" : "false",
      text: rlhfOpen === "more" ? "Hide totals ‹" : "Totals and starting amount ›",
      onclick: function () { rlhfOpen = rlhfOpen === "more" ? null : "more"; render(); } }));
  }
  if (rlhfOpen === "more") {
    wrap.appendChild(el("div", { class: "section" }, [
      el("h2", { class: "section-head", text: "Where it came from" }),
      startTotal() ? payLine("From before this tracker", "", startTotal()) : null,
      payLine(wins + (wins === 1 ? " thing done well" : " things done well"),
        wins + " × " + euro(state.pay.win), wins * payWin()),
      payLine(pacing1 + (pacing1 === 1 ? " day pacing at 1" : " days pacing at 1"),
        pacing1 + " × " + euro(state.pay.pacing1), pacing1 * payPacing(1)),
      payLine(pacing0 + (pacing0 === 1 ? " day pacing at 0" : " days pacing at 0"),
        pacing0 + " × " + euro(state.pay.pacing0), pacing0 * payPacing(0))
    ]));

    /* One figure rather than a list: it is what was saved up before the first
       day logged here. Setting it again replaces it, and 0 clears it. */
    var startField = el("input", { type: "number", step: "0.05", inputmode: "decimal",
      class: "hours-field", placeholder: "0.00",
      value: startTotal() ? startTotal().toFixed(2) : "" });
    var startMsg = el("div", { class: "msg", style: { display: "none" } });
    wrap.appendChild(el("div", { class: "field-label", text: "Already saved before this tracker (€)" }));
    wrap.appendChild(startField);
    wrap.appendChild(el("div", { class: "spacer" }));
    wrap.appendChild(el("button", { class: "btn wide raised", type: "button",
      text: startTotal() ? "Change it" : "Add it to the pot",
      onclick: function () {
        var raw = startField.value.trim();
        var amount = raw === "" ? 0 : parseFloat(raw);
        if (isNaN(amount)) {
          startMsg.textContent = "That is not an amount."; startMsg.style.display = ""; return;
        }
        state.pay.start = Math.round(amount * 100) / 100;
        saveNow();
        pendingMsg = state.pay.start
          ? "Starting amount set to " + euro(state.pay.start) + "."
          : "Starting amount cleared.";
        render();
      }}));
    wrap.appendChild(startMsg);
  }
  return wrap;
}

function payLine(label, sum, amount) {
  return el("div", { class: "pay-line" }, [
    el("span", { text: label }),
    el("span", { class: "pay-sum", text: sum }),
    el("span", { class: "pay-amount", text: euro(amount) })
  ]);
}

/* ---------- score detail ---------- */

/* Both scores are a weighted mean of daily burdens, and each daily burden is a
   plain mean over the items counted that day. That decomposes exactly: an
   item's share is the same weighted mean of its own burden divided by the
   number of items counted alongside it, and the shares add up to the points
   the score is down. Nothing here is an approximation of the number on Home. */
function contributions(kind) {
  var t = scoreEnd();
  /* Derived from the same half life weekScore uses, rather than copied, so the
     two can never drift apart. */
  var weights = LOAD_WEIGHTS;
  if (kind !== "pem") {
    weights = [];
    for (var k = 0; k < 7; k++) weights.push(Math.pow(0.5, k / 3));
  }
  var contrib = {}, totalWeight = 0, daysUsed = 0;

  for (var i = 0; i < weights.length; i++) {
    var e = settledEntry(shiftDay(t, -i));
    if (!e) continue;
    var parts = kind === "pem" ? loadParts(e) : scoreParts(e);
    if (parts.length < (kind === "pem" ? MIN_LOAD_ITEMS : MIN_SCORED)) continue;
    var w = weights[i];
    totalWeight += w;
    daysUsed++;
    parts.forEach(function (p) {
      if (!contrib[p.key]) contrib[p.key] = { key: p.key, label: p.label, points: 0 };
      contrib[p.key].points += w * p.burden / parts.length;
    });
  }

  var rows = Object.keys(contrib).map(function (k) {
    contrib[k].points = totalWeight ? 100 * contrib[k].points / totalWeight : 0;
    return contrib[k];
  });
  rows.sort(function (a, b) { return b.points - a.points; });
  return { rows: rows, days: daysUsed };
}

/* The score itself, recomputed as it stood at the end of each of the last
   fourteen days. Days after the anchor get no point: a score read at a date
   whose evening is not in yet is the drift scoreEnd exists to avoid. */
function scoreHistory(kind) {
  var t = today(), end = scoreEnd(), out = [];
  for (var i = 13; i >= 0; i--) {
    var d = shiftDay(t, -i);
    if (d > end) { out.push({ date: d, value: null }); continue; }
    var r = kind === "pem" ? pemRisk(d) : weekScore(d);
    out.push({ date: d, value: kind === "pem" ? r.risk : r.score });
  }
  return out;
}

/* One line, fourteen points, fixed 0-100. A single series needs no legend —
   the heading above it says what it is. */
/* A fortnight of the week score lives inside about ten points, because the
   score is a mean across twenty symptom items and most of them sit at baseline
   on any given day. Drawn against a fixed 0-100 axis that is a flat line every
   week, whatever the week did. So the axis fits the fortnight instead.

   Three guards keep a zoomed axis from lying. It never narrows below
   MIN_SPAN, so an unremarkable week is not magnified into drama. It pads and
   rounds outward to fives, so the highest and lowest points are not glued to
   the rules. And both ends are labelled on the chart, because an axis that
   does not start at zero and does not say so is the oldest chart lie there is.
   Position carries the value here, not length, so a truncated axis is fair as
   long as it is legible.

   MIN_SPAN is 15 because of what the score does, not taste. The week score
   moves about two and a half points per symptom item that shifts one step, so
   fifteen points is roughly six items changing — comfortably more than a week
   of noise, and small enough that an ordinary fortnight still fills a useful
   part of the height. */
var MIN_SPAN = 15;

function chartBounds(points) {
  var lo = null, hi = null;
  points.forEach(function (p) {
    if (p.value === null) return;
    if (lo === null || p.value < lo) lo = p.value;
    if (hi === null || p.value > hi) hi = p.value;
  });
  if (lo === null) return { lo: 0, hi: 100 };
  lo -= 2; hi += 2;
  var grow = (MIN_SPAN - (hi - lo)) / 2;
  if (grow > 0) { lo -= grow; hi += grow; }
  lo = Math.floor(lo / 5) * 5;
  hi = Math.ceil(hi / 5) * 5;
  /* Push the window back inside 0-100 rather than squeezing it, so a score
     near either end keeps the same amount of axis as one in the middle. */
  if (lo < 0) { hi = Math.min(100, hi - lo); lo = 0; }
  if (hi > 100) { lo = Math.max(0, lo - (hi - 100)); hi = 100; }
  return { lo: lo, hi: hi };
}

function detailChart(points, colour) {
  var W = 320, H = 100, padL = 26, padR = 6, padT = 10, padB = 10;
  var plotW = W - padL - padR, plotH = H - padT - padB;
  var b = chartBounds(points);
  var span = b.hi - b.lo;
  var x = function (i) { return padL + (plotW * i) / (points.length - 1); };
  var y = function (v) { return padT + plotH * (1 - (v - b.lo) / span); };
  var ns = "http://www.w3.org/2000/svg";
  var svg = document.createElementNS(ns, "svg");
  svg.setAttribute("viewBox", "0 0 " + W + " " + H);
  svg.setAttribute("class", "chart");
  function node(name, attrs) {
    var n = document.createElementNS(ns, name);
    Object.keys(attrs).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    return n;
  }
  [b.lo, (b.lo + b.hi) / 2, b.hi].forEach(function (v, i) {
    svg.appendChild(node("line", { x1: padL, x2: padL + plotW, y1: y(v), y2: y(v),
      stroke: "#252D36", "stroke-width": i === 0 ? 1 : 0.5 }));
  });
  /* Only the two ends are labelled. A number on the middle rule as well is one
     more thing to read at 2am for nothing. */
  [b.lo, b.hi].forEach(function (v) {
    var t = node("text", { x: padL - 5, y: y(v) + 3, "text-anchor": "end",
      "font-size": 9, fill: "#77828E" });
    t.textContent = String(v);
    svg.appendChild(t);
  });
  var run = [];
  function flush() {
    if (run.length > 1) {
      svg.appendChild(node("path", { d: "M" + run.map(function (p) { return p[0] + " " + p[1]; }).join("L"),
        fill: "none", stroke: colour, "stroke-width": 2, "stroke-linecap": "round", "stroke-linejoin": "round" }));
    }
    run = [];
  }
  points.forEach(function (p, i) {
    if (p.value === null) { flush(); return; }
    run.push([x(i), y(p.value)]);
  });
  flush();
  points.forEach(function (p, i) {
    if (p.value === null) return;
    svg.appendChild(node("circle", { cx: x(i), cy: y(p.value), r: 3, fill: colour,
      stroke: "#171C22", "stroke-width": 1.2 }));
  });
  return svg;
}

/* Seven cells of what you actually entered for one item. */
function itemStrip(key) {
  var t = scoreEnd();
  var strip = el("div", { class: "mini-strip" });
  for (var i = 6; i >= 0; i--) {
    (function (i) {
      var d = shiftDay(t, -i);
      var e = settledEntry(d);
      var text = "\u2013", fill = VAL.none;
      if (key === "sleepHours") {
        var hb = e && nightIsLogged(e) ? hoursBurden(e) : null;
        if (hb !== null) {
          text = String(e.sleepHours);
          fill = hb === 0 ? VAL.same : heatFill(Math.round(100 * hb));
        }
      } else if (e && itemCounts(e, key) && e.v[key] !== undefined) {
        var item = ITEM_BY_KEY[key];
        var base = state.baselines[key];
        text = item.labels ? item.labels[e.v[key]].slice(0, 4) : String(e.v[key]);
        fill = key === "pacing"
          ? PACING_RAMP[Math.min(e.v[key], PACING_RAMP.length - 1)]
          : valenceFill(item.higherIsBetter ? base - e.v[key] : e.v[key] - base);
      }
      var cell = el("div", { class: "mini-cell" + (fill === VAL.none ? " empty" : ""), text: text });
      if (fill !== VAL.none) { cell.style.background = fill; cell.style.color = INK[fill]; }
      strip.appendChild(cell);
    })(i);
  }
  return strip;
}

function detailScreen() {
  var kind = state.detail === "pem" ? "pem" : "week";
  var t = scoreEnd();
  var wrap = el("div");
  var now = kind === "pem" ? pemRisk(t) : weekScore(t);
  var value = kind === "pem" ? now.risk : now.score;

  var band;
  if (value === null) band = ["#77828E", "not enough logged days yet"];
  else if (kind === "pem") {
    band = [scoreHue(100 - value),
      value <= 20 ? "low" : value <= 40 ? "raised" : "high"];
  } else {
    band = [scoreHue(value), value >= 85 ? "at or near your normal"
      : value >= 70 ? "somewhat below your normal" : "well below your normal"];
  }

  var stale = value === null ? null : staleSince(t);
  var head = el("div", { class: "score-head" }, [
    el("span", { class: "score-num", text: value === null ? "\u2013" : String(value) }),
    el("span", { class: "score-band", text: band[1] + (stale ? " \u00b7 as of " + pretty(t) : "") })
  ]);
  head.querySelector(".score-num").style.color = band[0];
  wrap.appendChild(el("div", { class: "score" }, [
    el("div", { class: "score-label", text: kind === "pem" ? "PEM predictor" : "Week score" }),
    head,
    el("div", { class: "score-cap", text: kind === "pem"
      ? "Demand, pacing and sleep over four days, weighted so today and yesterday count most. Higher is a warning."
      : "Symptoms against your own baseline over seven days, recent days weighted. Higher is better." })
  ]));

  wrap.appendChild(el("h2", { class: "section-head panel-head", text: "Last 14 days" }));
  var hist = scoreHistory(kind);
  var bounds = chartBounds(hist);
  wrap.appendChild(detailChart(hist, kind === "pem" ? SERIES_DETAIL.pem : SERIES_DETAIL.week));
  wrap.appendChild(el("div", { class: "strip-cap",
    text: bounds.lo === 0 && bounds.hi === 100
      ? "0-100, same scale as the number above"
      : "Axis zoomed to " + bounds.lo + "-" + bounds.hi + ". The full scale is 0-100." }));

  var made = contributions(kind);
  wrap.appendChild(el("h2", { class: "section-head panel-head",
    text: kind === "pem" ? "What is driving it" : "Where the points went" }));

  if (made.rows.length === 0) {
    wrap.appendChild(el("div", { class: "hint", text: "Nothing logged recently enough to break down." }));
  } else {
    var carrying = made.rows.filter(function (r) { return r.points >= 0.05; });
    var clear = made.rows.filter(function (r) { return r.points < 0.05; });
    var worst = carrying.length ? carrying[0].points : 1;

    carrying.forEach(function (r) {
      var bar = el("div", { class: "contrib-bar" });
      var fill = el("div", { class: "contrib-fill" });
      fill.style.width = Math.max(2, Math.round(100 * r.points / worst)) + "%";
      fill.style.background = kind === "pem" ? SERIES_DETAIL.pem : SERIES_DETAIL.week;
      bar.appendChild(fill);
      var row = el("div", { class: "contrib" }, [
        el("div", { class: "contrib-top" }, [
          el("span", { text: r.label }),
          el("span", { class: "contrib-points",
            text: (kind === "pem" ? "+" : "\u2212") + r.points.toFixed(1) })
        ]),
        bar
      ]);
      if (r.key === "sleepHours") {
        row.appendChild(el("div", { class: "contrib-note", text: sleepNote() }));
      }
      row.appendChild(itemStrip(r.key));
      wrap.appendChild(row);
    });

    if (clear.length) {
      wrap.appendChild(el("div", { class: "hint", text: "At baseline or better: " +
        clear.map(function (r) { return r.label; }).join(", ") }));
    }
    wrap.appendChild(el("div", { class: "strip-cap",
      text: "Cells are the last 7 days of what you entered, newest on the right. The figures add up to the "
        + (kind === "pem" ? "score" : "points below 100") + ", give or take rounding." }));
  }

  wrap.appendChild(el("button", { class: "btn primary", type: "button", text: "Done",
    onclick: function () { state.tab = "home"; render(); } }));
  return wrap;
}

function sleepNote() {
  var t = today(), sum = 0, n = 0;
  for (var i = 0; i < 7; i++) {
    var e = settledEntry(shiftDay(t, -i));
    if (!e || !nightIsLogged(e)) continue;
    var h = e.sleepHours;
    if (h === "" || h === undefined || h === null) continue;
    sum += Number(h); n++;
  }
  var target = state.baselines.hoursTarget || DEFAULT_BASELINES.hoursTarget;
  return n
    ? "Target " + target + "h · last " + n + (n === 1 ? " night " : " nights ") + (sum / n).toFixed(1) + "h"
    : "Target " + target + "h · no hours logged yet";
}

/* ---------- home ---------- */

/* The hour the evening card appears. */
var EVENING_FROM_HOUR = 21;

/* The night that just ended is logged under yesterday's date. */
function nightIsLogged(entry) {
  if (!entry) return false;
  if (entry.morningDone) return true;
  return !!(entry.touched.sleep || entry.touched.episode || entry.touched.syncope);
}

function openEvening(date) {
  state.eveDate = date; eveDateManual = true; state.tab = "evening"; render();
}
function openMorning(date) {
  state.mornDate = date; mornDateManual = true; state.tab = "morning"; render();
}

/* A job still to do: full size, accent edge. */
function dueCard(title, sub, onclick, extra) {
  return el("div", { class: "card due" }, [
    el("button", { class: "card-main", type: "button", onclick: onclick }, [
      el("div", { class: "card-line" }, [
        el("span", { class: "card-title", text: title }),
        el("span", { class: "card-arrow", text: "\u203a" })
      ]),
      el("div", { class: "card-sub", text: sub })
    ])
  ].concat(extra ? [extra] : []));
}

/* Done for the day: one dim line, out of the way but still editable. */
function doneLine(text, onclick) {
  return el("button", { class: "card done", type: "button", onclick: onclick }, [
    el("div", { class: "line" }, [
      el("span", { text: text }),
      el("span", { class: "meta", text: "edit" })
    ])
  ]);
}

/* The week in one number, plus how it compares with the week before. */
/* The two scores side by side and small. Stacked full width tiles took four
   hundred pixels to say two numbers, and being one above the other made them
   read as a list rather than as a pair to compare. The method line that used
   to sit under each one lives in the panel behind the chevron. */
function miniScore(label, value, hue, word, onclick) {
  var num = el("span", { class: "num", text: value === null ? "\u2013" : String(value) });
  num.style.color = hue;
  return el("button", { class: "mini-score", type: "button", onclick: onclick }, [
    el("div", { class: "cap" }, [
      el("span", { text: label }),
      el("span", { class: "arrow", text: "\u203a" })
    ]),
    el("div", { class: "val" }, [num, el("span", { class: "word", text: word })])
  ]);
}

function scorePair() {
  var t = scoreEnd();
  var week = weekScore(t);
  var pem = pemRisk(t);
  var stale = staleSince(t);
  return el("div", { class: "score-pair" }, [
    miniScore("Week score", week.score,
      week.score === null ? "var(--dim)" : scoreHue(week.score),
      week.score === null ? "not enough days" : stale ? "as of " + stale :
        week.score >= 85 ? "near normal" : week.score >= 70 ? "below normal" : "well below",
      function () { state.detail = "week"; state.tab = "detail"; render(); }),
    miniScore("PEM risk", pem.risk,
      pem.risk === null ? "var(--dim)" : scoreHue(100 - pem.risk),
      pem.risk === null ? "not enough days" : stale ? "as of " + stale :
        pem.risk <= 20 ? "low" : pem.risk <= 40 ? "raised" : "high",
      function () { state.detail = "pem"; state.tab = "detail"; render(); })
  ]);
}

/* The figure beside each row: the average over the last seven days, written
   against the scale it sits on. A bare number said nothing — "Brain fog 2"
   could have been today's value, the week's, or something scaled. "1.4/3" says
   which of the three it is and how far up the scale that sits. */
function seriesSummary(def, dates, vals) {
  /* The week ends at the last day that has anything in it, the same anchor the
     pacing row uses. Anchoring on today instead would quietly average six days
     rather than seven for most of every day. */
  var end = dates.length - 1;
  while (end > 0 && (vals[end] === null || vals[end] === undefined)) end--;
  var sum = 0, n = 0;
  for (var i = end; i >= 0 && i > end - 7; i--) {
    var v;
    if (def.numByDate) v = def.numByDate(dates[i]);
    else {
      var e = settledEntry(dates[i]);
      v = e ? (def.num ? def.num(e) : def.value(e)) : null;
    }
    if (v === null || v === undefined || isNaN(Number(v))) continue;
    sum += Number(v); n++;
  }
  if (!n) return "\u2013";
  var max = typeof def.scaleMax === "function" ? def.scaleMax() : def.scaleMax;
  var dp = def.dp === undefined ? 1 : def.dp;
  var mean = sum / n;
  /* A whole number does not need a decimal point pretending to precision. */
  var text = dp && Math.abs(mean - Math.round(mean)) > 0.04 ? mean.toFixed(dp) : String(Math.round(mean));
  return text + "/" + max + (def.unit || "");
}

/* One row per variable: a name, its own small chart, and today's figure.

   This is the answer to the three line cap. Overlaid lines have to be told
   apart by hue, and at the brightness this screen can take, a fourth hue
   collapses into one of the others — so three was the honest ceiling. Give
   each variable its own row and the question never arises: nothing has to be
   distinguished from anything, and the list can be as long as you like.

   What it gives up is seeing two lines cross, which is the whole point of
   exertion against symptoms. Lines mode is still there for that. */
var SPARK_HUES = ["#C4714C", "#6890C6", "#8FB49B", "#C9A45C", "#7FBF97", "#D08A6B",
                  "#A9B3BD", "#CE7A54"];

function sparkRows(picked, dates, data) {
  var wrap = el("div", { class: "sparks" });
  var W = 200, H = 30, pad = 3;
  var ns = "http://www.w3.org/2000/svg";
  var x = function (i) { return pad + (W - pad * 2) * i / (dates.length - 1); };

  picked.forEach(function (def, si) {
    var colour = SPARK_HUES[si % SPARK_HUES.length];
    var vals = data[si];
    /* Each row fits its own fortnight, under the same guards as the score
       panels. Comparing rows on one shared axis is what Lines mode is for. */
    var b = chartBounds(vals.map(function (v) { return { value: v }; }));
    var y = function (v) { return pad + (H - pad * 2) * (1 - (v - b.lo) / (b.hi - b.lo)); };
    var svg = document.createElementNS(ns, "svg");
    svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    svg.setAttribute("preserveAspectRatio", "none");
    svg.setAttribute("class", "spark-svg");
    function node(name, attrs) {
      var n = document.createElementNS(ns, name);
      Object.keys(attrs).forEach(function (k) { n.setAttribute(k, attrs[k]); });
      return n;
    }
    svg.appendChild(node("line", { x1: pad, x2: W - pad, y1: y(b.lo), y2: y(b.lo),
      stroke: "#252D36", "stroke-width": 0.8 }));
    var run = [];
    function flush() {
      if (run.length > 1) {
        svg.appendChild(node("path", {
          d: "M" + run.map(function (p) { return p[0] + " " + p[1]; }).join("L"),
          fill: "none", stroke: colour, "stroke-width": 1.8,
          "stroke-linecap": "round", "stroke-linejoin": "round" }));
      }
      run = [];
    }
    vals.forEach(function (v, i) {
      if (v === null) { flush(); return; }
      run.push([x(i), y(v)]);
    });
    flush();
    vals.forEach(function (v, i) {
      if (v === null) return;
      svg.appendChild(node("circle", { cx: x(i), cy: y(v), r: 2.2, fill: colour,
        stroke: "#171C22", "stroke-width": 1 }));
    });

    var last = null;
    for (var i = vals.length - 1; i >= 0; i--) { if (vals[i] !== null) { last = i; break; } }
    var shown = seriesSummary(def, dates, vals);
    var row = el("button", { class: "spark-row", type: "button",
      "aria-label": def.label + ", last 14 days",
      onclick: function () { if (last !== null) openEvening(dates[last]); } }, [
      el("span", { class: "spark-name", text: def.label })
    ]);
    row.appendChild(svg);
    var now = el("span", { class: "spark-now", text: shown });
    now.style.color = colour;
    row.appendChild(now);
    wrap.appendChild(row);
  });
  return wrap;
}

/* Fourteen days of whichever lines you pick, everything scaled to 0-100 with
   up meaning worse, so lines built different ways can still share one axis.
   Symptoms and Exertion are the same loads the two scores are built from. A
   single item is drawn as its share of its own scale, and the readout gives
   you back the number you actually entered.

   Every logged day carries a dot, so a gap in entry is visible as a gap rather
   than having to be inferred from the line. Missing days break the line rather
   than being drawn through — a straight segment across a gap would invent days
   you never logged. */
var CHART_DAYS = 14;
var chartPick = null;        /* index of the day being read, or null */
var pickerOpen = false;

function shortLabel(label) {
  return label.split(" / ")[0].split(" (")[0];
}

function seriesDefs() {
  var defs = [
    { key: "symptoms", label: "Symptoms", scaleMax: 100, dp: 0,
      value: function (e) { var b = dayBurden(e); return b === null ? null : Math.round(100 * b); } },
    { key: "exertion", label: "Exertion", scaleMax: 100, dp: 0,
      value: function (e) { var b = loadBurden(e); return b === null ? null : Math.round(100 * b); } }
  ];
  /* These two are functions of a date rather than of one day's record, so they
     carry their own reader. Both are drawn up-is-worse like everything else,
     which for the week score means plotting 100 minus it — the figure on the
     right is still the score itself. */
  defs.push({
    key: "score:week", label: "Week score", scaleMax: 100, dp: 0,
    byDate: function (d) {
      if (d > scoreEnd()) return null;
      var r = weekScore(d); return r.score === null ? null : 100 - r.score;
    },
    numByDate: function (d) { return d > scoreEnd() ? null : weekScore(d).score; }
  });
  defs.push({
    key: "score:pem", label: "PEM risk", scaleMax: 100, dp: 0,
    byDate: function (d) { return d > scoreEnd() ? null : pemRisk(d).risk; },
    numByDate: function (d) { return d > scoreEnd() ? null : pemRisk(d).risk; }
  });
  defs.push({
    key: "i:sleepHours", label: "Sleep hours", dp: 1, unit: "h",
    scaleMax: function () { return state.baselines.hoursTarget || DEFAULT_BASELINES.hoursTarget; },
    value: function (e) {
      var b = nightIsLogged(e) ? hoursBurden(e) : null;
      return b === null ? null : Math.round(100 * b);
    },
    num: function (e) {
      if (!nightIsLogged(e)) return null;
      var h = e.sleepHours;
      return h === "" || h === undefined || h === null ? null : Number(h);
    }
  });
  ALL_ITEMS.forEach(function (it) {
    var max = it.max === undefined ? 3 : it.max;
    defs.push({
      key: "i:" + it.key, label: shortLabel(it.label), item: it,
      scaleMax: max, dp: 1,
      value: function (e) {
        if (!itemCounts(e, it.key)) return null;
        var v = e.v[it.key];
        if (v === undefined) return null;
        /* share of the item's own scale, in the direction that is worse */
        return Math.round(100 * (it.higherIsBetter ? (max - v) / max : v / max));
      },
      num: function (e) {
        if (!itemCounts(e, it.key)) return null;
        return e.v[it.key] === undefined ? null : e.v[it.key];
      }
    });
  });
  return defs;
}

function rowsMode() { return state.home.chartStyle !== "lines"; }
function lineCap() { return rowsMode() ? 99 : MAX_LINES; }

function activeSeries() {
  var defs = seriesDefs();
  var out = [];
  (state.chartKeys || []).forEach(function (k) {
    for (var i = 0; i < defs.length; i++) if (defs[i].key === k) { out.push(defs[i]); return; }
  });
  return out.slice(0, lineCap());
}

function chart() {
  var host = el("div", { class: "chart-wrap" });

  function paint() {
    host.innerHTML = "";
    var picked = activeSeries();
    var t = today();
    var dates = [];
    for (var i = CHART_DAYS - 1; i >= 0; i--) dates.push(shiftDay(t, -i));

    var data = picked.map(function (def) {
      return dates.map(function (d) {
        if (def.byDate) return def.byDate(d);
        var e = settledEntry(d);
        return e ? def.value(e) : null;
      });
    });

    if (rowsMode()) {
      if (!picked.length) {
        host.appendChild(el("div", { class: "hint", text: "Pick something to show below." }));
      } else {
        host.appendChild(sparkRows(picked, dates, data));
      }
      host.appendChild(el("div", { class: "chart-foot" }, [
        el("span", { class: "item", text: "up is worse · zoomed · 7 day avg" }),
        el("button", { class: "lines", type: "button",
          text: (pickerOpen ? "done" : "choose variables") + " \u203a",
          onclick: function () { pickerOpen = !pickerOpen; paint(); } })
      ]));
      if (pickerOpen) host.appendChild(picker());
      return;
    }

    var W = 320, H = 116, padL = 6, padR = 6, padT = 10, padB = 10;
    var plotW = W - padL - padR, plotH = H - padT - padB;
    var x = function (i) { return padL + (plotW * i) / (CHART_DAYS - 1); };
    var y = function (v) { return padT + plotH * (1 - v / 100); };

    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    svg.setAttribute("class", "chart");
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", picked.length
      ? picked.map(function (p) { return p.label; }).join(" and ") + " over 14 days"
      : "No lines chosen");
    function node(name, attrs) {
      var n = document.createElementNS("http://www.w3.org/2000/svg", name);
      Object.keys(attrs).forEach(function (k) { n.setAttribute(k, attrs[k]); });
      return n;
    }

    [0, 50, 100].forEach(function (v) {
      svg.appendChild(node("line", { x1: padL, x2: padL + plotW, y1: y(v), y2: y(v),
        stroke: "#252D36", "stroke-width": v === 0 ? 1 : 0.5 }));
    });

    picked.forEach(function (def, si) {
      var slot = SLOTS[si];
      var vals = data[si];
      var run = [];
      function flush() {
        if (run.length > 1) {
          svg.appendChild(node("path", {
            d: "M" + run.map(function (p) { return p[0] + " " + p[1]; }).join("L"),
            fill: "none", stroke: slot.colour, "stroke-width": 2,
            "stroke-dasharray": slot.dash, "stroke-linecap": "round", "stroke-linejoin": "round"
          }));
        }
        run = [];
      }
      vals.forEach(function (v, i) {
        if (v === null) { flush(); return; }
        run.push([x(i), y(v)]);
      });
      flush();
      /* a dot on every logged day, ringed so overlapping points stay readable */
      vals.forEach(function (v, i) {
        if (v === null) return;
        svg.appendChild(node("circle", { cx: x(i), cy: y(v), r: 3,
          fill: slot.colour, stroke: "#171C22", "stroke-width": 1.2 }));
      });
    });

    var marker = node("g", {});
    svg.appendChild(marker);
    function paintPick() {
      marker.innerHTML = "";
      if (chartPick === null) return;
      marker.appendChild(node("line", { x1: x(chartPick), x2: x(chartPick), y1: padT, y2: padT + plotH,
        stroke: "#77828E", "stroke-width": 1 }));
      picked.forEach(function (def, si) {
        var v = data[si][chartPick];
        if (v === null) return;
        marker.appendChild(node("circle", { cx: x(chartPick), cy: y(v), r: 5,
          fill: SLOTS[si].colour, stroke: "#0F1216", "stroke-width": 2 }));
      });
    }

    var half = plotW / (CHART_DAYS - 1) / 2;
    dates.forEach(function (d, i) {
      var hit = node("rect", { x: x(i) - half, y: 0, width: half * 2, height: H,
        fill: "transparent", style: "cursor:pointer" });
      hit.addEventListener("pointerdown", function () {
        chartPick = chartPick === i ? null : i;
        paintPick(); paintReadout();
      });
      svg.appendChild(hit);
    });
    host.appendChild(svg);

    /* legend: swatch carries the dash pattern, not just the hue */
    var legend = el("div", { class: "legend" });
    picked.forEach(function (def, si) {
      var sw = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      sw.setAttribute("viewBox", "0 0 16 4");
      sw.setAttribute("class", "swatch-line");
      sw.appendChild(node("line", { x1: 0, y1: 2, x2: 16, y2: 2, stroke: SLOTS[si].colour,
        "stroke-width": 2, "stroke-dasharray": SLOTS[si].dash, "stroke-linecap": "round" }));
      var item = el("span", { class: "item" }, [el("span", { text: def.label })]);
      item.insertBefore(sw, item.firstChild);
      legend.appendChild(item);
    });
    legend.appendChild(el("span", { class: "note", text: "up is worse" }));
    host.appendChild(legend);

    var readout = el("div", { class: "readout" });
    function paintReadout() {
      readout.innerHTML = "";
      if (chartPick === null) {
        readout.appendChild(el("span", { class: "readout-hint",
          text: picked.length ? "Tap any day to read it off" : "Pick a line below" }));
        return;
      }
      var d = dates[chartPick];
      var e = settledEntry(d);
      var open = el("button", { class: "readout-open", type: "button",
        onclick: function () { openEvening(d); } }, [
        el("span", { text: pretty(d) })
      ]);
      picked.forEach(function (def, si) {
        var shown = def.numByDate ? def.numByDate(d)
          : e && def.num ? def.num(e) : data[si][chartPick];
        var span = el("span", { class: "key",
          text: def.label + " " + (shown === null || shown === undefined ? "–" : shown) });
        span.style.color = SLOTS[si].colour;
        open.appendChild(span);
      });
      open.appendChild(el("span", { class: "readout-go", text: "open" }));
      readout.appendChild(open);
    }
    paintPick();
    paintReadout();
    host.appendChild(readout);

    host.appendChild(el("div", { class: "chart-foot" }, [
      el("button", { class: "lines", type: "button",
        text: (pickerOpen ? "done" : "choose variables") + " \u203a",
        onclick: function () { pickerOpen = !pickerOpen; paint(); } })
    ]));
    if (pickerOpen) host.appendChild(picker());
  }

  function picker() {
    var box = el("div");
    var msg = el("div", { class: "msg", style: { display: "none" } });
    var chips = el("div", { class: "tags picker" });
    seriesDefs().forEach(function (def) {
      var on = (state.chartKeys || []).indexOf(def.key) >= 0;
      chips.appendChild(el("button", {
        type: "button", text: def.label, "aria-pressed": on ? "true" : "false",
        onclick: function () {
          var keys = (state.chartKeys || []).slice();
          var at = keys.indexOf(def.key);
          if (at >= 0) {
            keys.splice(at, 1);
          } else if (keys.length >= lineCap()) {
            msg.textContent = "Three at a time as lines — past that the colours stop being "
              + "reliably different. Switch to rows in Settings for as many as you like.";
            msg.style.display = "";
            return;
          } else {
            keys.push(def.key);
          }
          state.chartKeys = keys;
          saveNow();
          paint();
        }
      }));
    });
    box.appendChild(chips);
    box.appendChild(msg);
    return box;
  }

  paint();
  return host;
}

/* One row: seven days of pacing, coloured by how it sits against your normal.
   Pacing is the thing you can actually steer, so it is the thing kept in view. */
/* Today only joins the row once its evening is in, the same rule the scores
   use. Until then the week ends yesterday, so all seven cells carry a day
   rather than one of them always being a dash. */
function pacingEnd() {
  var t = today();
  return settledEntry(t) ? t : shiftDay(t, -1);
}

function pacingRow() {
  var t = pacingEnd();
  var grid = el("div", { class: "grid" });
  grid.appendChild(el("div", {}));
  var dates = [];
  for (var i = 6; i >= 0; i--) dates.push(shiftDay(t, -i));

  dates.forEach(function (d) {
    var p = d.split("-").map(Number);
    grid.appendChild(el("div", { class: "grid-day" + (d === today() ? " now" : ""),
      text: DAY_NAMES[new Date(p[0], p[1] - 1, p[2]).getDay()].charAt(0) }));
  });

  grid.appendChild(el("div", { class: "grid-label", text: "Pacing" }));
  dates.forEach(function (d) {
    var e = settledEntry(d);
    var text = "\u2013", fill = VAL.none;
    if (e && itemCounts(e, "pacing") && e.v.pacing !== undefined) {
      text = String(e.v.pacing);
      /* by value, not by distance from baseline: both paced days read green */
      fill = PACING_RAMP[Math.min(e.v.pacing, PACING_RAMP.length - 1)];
    }
    var cell = el("button", {
      class: "cell" + (fill === VAL.none ? " empty" : ""), type: "button", text: text,
      "aria-label": pretty(d) + " pacing " + text,
      onclick: function () { openEvening(d); }
    });
    if (fill !== VAL.none) {
      cell.style.background = fill;
      cell.style.color = INK[fill];
    }
    grid.appendChild(cell);
  });

  return el("div", { class: "grid-wrap" }, [grid]);
}

function backupLine() {
  var last = state.lastBackupAt;
  var text, stale;
  if (!last) {
    text = "never";
    stale = true;
  } else {
    var days = Math.floor((Date.now() - new Date(last).getTime()) / 86400000);
    text = days === 0 ? "today" : days === 1 ? "yesterday" : days + " days ago";
    stale = days >= 14;
  }
  var btn = el("button", { class: "backup" + (stale ? " stale" : ""), type: "button",
    onclick: function () { state.tab = "history"; render(); } }, [
    el("span", { class: "foot-label", text: "Backup" }),
    el("span", { class: "foot-value", text: text })
  ]);
  if (stale) btn.querySelector(".foot-value").style.color = "var(--warn)";
  return btn;
}

function homeScreen() {
  var t = today();
  var y = shiftDay(t, -1);
  var eve = state.days[t];
  var eveDone = !!(eve && eve.complete);
  var night = state.days[y];
  var nightDone = nightIsLogged(night);
  var wrap = el("div");
  var due = [], done = [], later = [];

  wrap.appendChild(el("div", { class: "home-head" }, [
    el("span", { text: pretty(t) }),
    el("span", { class: "sub", text: eveDone && nightDone ? " · all logged"
      : eveDone ? " · night still to log" : nightDone ? " · evening still to log" : "" })
  ]));

  if (state.home.scores) wrap.appendChild(scorePair());
  wrap.appendChild(el("h2", { class: "home-band", text: "To log" }));

  /* The evening belongs to the evening. Before then the card is out of the
     way, but the screen is still one tap from here — a card that only exists
     after nine would otherwise leave no route in at four in the afternoon. */
  var eveningOpen = new Date().getHours() >= EVENING_FROM_HOUR;

  /* Evening */
  if (eveDone) {
    done.push(doneLine("Evening logged · " + offBaselineKeys(eve, EVENING_KEYS).length + " off baseline",
      function () { openEvening(t); }));
  } else if (!eveningOpen) {
    later.push(el("button", { class: "quiet-btn", type: "button",
      text: eve ? "Evening — draft saved, open it now" : "Evening — open it now",
      onclick: function () { openEvening(t); } }));
  } else if (eve) {
    due.push(dueCard("Finish the evening",
      "Draft · " + offBaselineKeys(eve, EVENING_KEYS).length + " off baseline",
      function () { openEvening(t); }));
  } else {
    due.push(dueCard("Evening", "How today went", function () { openEvening(t); },
      el("button", { class: "card-quick", type: "button", text: "Nothing off baseline — save it",
        onclick: function () {
          update(t, function (e) { e.complete = true; e.savedAt = new Date().toISOString(); });
          saveNow(); render(); flash("Day saved");
        }})));
  }

  /* Morning — the night that just ended */
  var nightSub = "Night of " + pretty(y) + " → " + pretty(t);
  if (nightDone) {
    var n = state.days[y];
    done.push(doneLine("Night logged · sleep " + n.v.sleep +
      (n.v.episode ? " · ep " + n.v.episode : ""), function () { openMorning(y); }));
  } else {
    due.push(dueCard("Morning", nightSub, function () { openMorning(y); }));
  }

  /* Before mid-afternoon the night comes first. */
  if (new Date().getHours() < 15) due.reverse();
  due.forEach(function (c) { wrap.appendChild(c); });
  later.forEach(function (c) { wrap.appendChild(c); });

  /* Something done well: a plus and a line to write on, one row.

     The order flips from what it was. It used to log on the tap and offer the
     words afterwards; now the words come first and the plus commits them. The
     cheap path survives — a plus tapped on an empty line still logs one
     without any typing — and the row keeps its shape either way, which the
     old appearing-and-disappearing field did not. */
  var winBox = el("div", { class: "win-box" });
  function paintWins() {
    winBox.innerHTML = "";
    var field = el("input", { type: "text", class: "win-field",
      placeholder: "Did something well\u2026" });

    function commit() {
      logWin(t, field.value.trim());
      paintWins();
      winBox.querySelector(".win-field").focus();
      flash(state.pay.on ? "Logged \u00b7 " + euro(payWin()) : "Logged");
    }
    field.addEventListener("keydown", function (ev) {
      if (ev.key === "Enter") { ev.preventDefault(); commit(); }
    });

    winBox.appendChild(el("div", { class: "win-row" }, [
      el("button", { class: "win-add", type: "button", text: "+",
        "aria-label": "Log something done well", onclick: commit }),
      field
    ]));

    var wins = (state.days[t] && state.days[t].wins) || [];
    if (!wins.length) return;
    var last = wins.length - 1;
    var said = wins[last].text ? " \u00b7 \u201c" + wins[last].text + "\u201d" : "";
    winBox.appendChild(el("div", { class: "win-added" }, [
      el("span", { class: "win-count",
        text: wins.length + (wins.length === 1 ? " thing" : " things") + " today"
          + (state.pay.on ? " \u00b7 " + euro(wins.length * payWin()) : "") + said }),
      el("button", { class: "win-undo", type: "button", text: "remove last",
        onclick: function () { removeWin(t, last); paintWins(); } })
    ]));
  }
  paintWins();
  wrap.appendChild(winBox);

  if (state.home.chart || state.home.pacing) {
    wrap.appendChild(el("h2", { class: "home-band", text: "Last 14 days" }));
    if (state.home.chart) wrap.appendChild(chart());
    if (state.home.pacing) {
      wrap.appendChild(pacingRow());
      wrap.appendChild(pacingStreak());
    }
  }

  /* One quiet group at the foot instead of three strays of different shapes. */
  if (state.home.done && done.length) {
    wrap.appendChild(el("h2", { class: "home-band", text: "Logged today" }));
    done.forEach(function (c) { wrap.appendChild(c); });
  }

  var feet = [];
  if (state.home.pot) {
    feet.push(el("button", { type: "button",
      onclick: function () { state.tab = "rlhf"; render(); } }, [
      el("span", { class: "foot-label", text: state.pay.on ? "In the pot" : "Things done well" }),
      el("span", { class: "foot-value",
        text: state.pay.on ? euro(potTotal()) : String(winTotal()) })
    ]));
  }
  if (state.home.backup) feet.push(backupLine());
  if (feet.length) {
    wrap.appendChild(el("div", { class: "footer-row" }, feet));
  }
  return wrap;
}

/* The streak is the point of keeping pacing in view: it is the one row that
   rewards a run of good days rather than only reporting them. */
function pacingStreak() {
  var t = pacingEnd(), paced = 0, logged = 0, pay = 0;
  for (var i = 0; i < 7; i++) {
    var e = settledEntry(shiftDay(t, -i));
    if (!e || !itemCounts(e, "pacing") || e.v.pacing === undefined) continue;
    logged++;
    if (e.v.pacing <= 1) paced++;
    pay += pacingPay(e);
  }
  if (!logged) return el("div", { class: "strip-cap", text: "0 and 1 both pay" });
  var text = paced + " paced " + (paced === 1 ? "day" : "days") + " in the last " + logged;
  if (state.pay.on && pay > 0) text += " · " + euro(pay) + " from pacing";
  var line = el("div", { class: "streak", text: text });
  if (paced === 0) line.style.color = "var(--dim)";
  return line;
}

/* ---------- evening ---------- */

function eveningScreen() {
  var date = state.eveDate;
  var entry = getEntry(date);
  var rows = [];
  var wrap = el("div");

  wrap.appendChild(dateNav(
    function () { return state.eveDate; },
    function (d) { state.eveDate = d; eveDateManual = true; render(); },
    function (cap) {
      var word = relativeWord(date);
      cap.appendChild(el("span", { text: "Evening — " + pretty(date) }));
      if (word) cap.appendChild(el("span", { class: "sub", text: " · " + word }));
    }
  ));

  var msg = el("div", { class: "msg", style: { display: "none" } });

  wrap.appendChild(el("div", { class: "pair" }, [
    el("button", { class: "btn", type: "button", text: "Copy yesterday", onclick: function () {
      var prev = state.days[shiftDay(date, -1)];
      if (!prev) { msg.textContent = "No entry for the day before."; msg.style.display = ""; return; }
      update(date, function (e) {
        EVENING_KEYS.forEach(function (k) {
          if (prev.v[k] !== undefined) { e.v[k] = prev.v[k]; e.touched[k] = true; }
        });
      });
      saveNow(); render();
    }}),
    el("button", { class: "btn", type: "button", text: "Reset to baseline", onclick: function () {
      update(date, function (e) {
        EVENING_KEYS.forEach(function (k) { e.v[k] = state.baselines[k]; delete e.touched[k]; });
      });
      saveNow(); render();
    }})
  ]));
  wrap.appendChild(msg);

  var counter = el("div", { class: "note-line" });
  function paintCounter() {
    var n = offBaselineKeys(getEntry(date), EVENING_KEYS).length;
    counter.textContent = n + (n === 1 ? " item" : " items") + " away from baseline";
  }

  /* One line box under whichever exertion row was tapped last, so the detail
     lands against the thing it describes. A row that already has text keeps
     its box, otherwise saved detail would be invisible. */
  var detailKey = null;
  var detailSlots = [];
  function paintDetails() {
    detailSlots.forEach(function (d) {
      var text = (getEntry(date).detail || {})[d.key] || "";
      var want = d.key === detailKey || text !== "";
      if (!want) { d.slot.innerHTML = ""; return; }
      if (d.slot.firstChild) return;
      var field = el("input", { type: "text", class: "detail-field",
        placeholder: "What was it? (optional)" });
      field.value = text;
      field.addEventListener("input", function () {
        update(date, function (e) {
          if (!e.detail) e.detail = {};
          e.detail[d.key] = field.value;
        });
        saveSoon();
      });
      d.slot.appendChild(field);
      if (d.key === detailKey) field.focus();
    });
  }

  var band = null;
  EVENING_SECTIONS.forEach(function (sec) {
    var exertionBand = sec.band === "Exertion" || band === "Exertion";
    if (sec.band && sec.band !== band) {
      band = sec.band;
      wrap.appendChild(el("h2", { class: "band", text: band }));
      var legend = bandLegend(band);
      if (legend) wrap.appendChild(legend);
    }
    var kids = sec.items.map(function (it) {
      var isExertion = exertionBand;
      var host = el("div");
      var row = ratingRow(it,
        function () { return getEntry(date).v[it.key]; },
        function (n) {
          update(date, function (e) { e.v[it.key] = n; e.touched[it.key] = true; });
          saveNow();
          if (isExertion) { detailKey = it.key; paintDetails(); }
          paintCounter();
        },
        function () { return state.baselines[it.key]; },
        isExertion ? null : paintCounter);
      rows.push(row);
      host.appendChild(row.el);
      if (isExertion) {
        var slot = el("div");
        host.appendChild(slot);
        detailSlots.push({ key: it.key, slot: slot });
      }
      return host;
    });
    wrap.appendChild(section(sec.title, kids));
  });
  paintDetails();

  /* bedtime */
  var bite = el("input", { type: "time", value: entry.lastBite || "" });
  bite.addEventListener("input", function () {
    update(date, function (e) { e.lastBite = bite.value; });
    saveSoon(200);
  });
  /* Neither a symptom nor something the day asked of you, so it gets its own
     band rather than sitting under Exertion by accident. */
  wrap.appendChild(el("h2", { class: "band", text: "Bedtime and notes" }));
  wrap.appendChild(section(null, [
    el("div", { class: "field-label", text: "Time of last bite" }),
    bite
  ]));

  /* note + tags */
  var tagWrap = el("div", { class: "tags" });
  TAGS.forEach(function (tag) {
    var b = el("button", { type: "button", text: tag, "aria-pressed": "false", onclick: function () {
      update(date, function (e) {
        e.tags = e.tags.indexOf(tag) >= 0
          ? e.tags.filter(function (t) { return t !== tag; })
          : e.tags.concat([tag]);
      });
      saveNow();
      b.setAttribute("aria-pressed", getEntry(date).tags.indexOf(tag) >= 0 ? "true" : "false");
    }});
    b.setAttribute("aria-pressed", (entry.tags || []).indexOf(tag) >= 0 ? "true" : "false");
    tagWrap.appendChild(b);
  });
  var note = el("textarea", { rows: "3", placeholder: "Anything worth writing down" });
  note.value = entry.note || "";
  note.addEventListener("input", function () {
    update(date, function (e) { e.note = note.value; });
    saveSoon();
  });
  wrap.appendChild(section("Note", [tagWrap, note]));

  var nightNote = el("textarea", { rows: "3", placeholder: "What you want to remember about tonight" });
  nightNote.value = entry.nightNote || "";
  nightNote.addEventListener("input", function () {
    update(date, function (e) { e.nightNote = nightNote.value; });
    saveSoon();
  });
  wrap.appendChild(section("For tonight — you'll see this in the morning", [nightNote]));

  wrap.appendChild(el("button", {
    class: "btn primary", type: "button",
    text: state.days[date] && state.days[date].complete ? "Update this day" : "Save day",
    onclick: function () {
      update(date, function (e) {
        e.complete = true;
        e.savedAt = new Date().toISOString();
      });
      saveNow();
      state.tab = "home";
      render();
      flash("Day saved");
    }
  }));
  paintCounter();
  wrap.appendChild(counter);
  return wrap;
}

/* ---------- morning ---------- */

function morningScreen() {
  var date = state.mornDate;
  var entry = getEntry(date);
  var wrap = el("div");

  wrap.appendChild(dateNav(
    function () { return state.mornDate; },
    function (d) { state.mornDate = d; mornDateManual = true; render(); },
    function (cap) {
      cap.appendChild(el("span", {
        text: "Night of " + pretty(date) + " → " + pretty(shiftDay(date, 1))
      }));
    }
  ));

  wrap.appendChild(el("div", { class: "hint",
    text: "A night belongs to the evening date, so this is logged under " + pretty(date) + "." }));

  MORNING_ITEMS.forEach(function (it) {
    var row = ratingRow(it,
      function () { return getEntry(date).v[it.key]; },
      function (n) {
        update(date, function (e) { e.v[it.key] = n; e.touched[it.key] = true; });
        saveNow();
      },
      function () { return state.baselines[it.key]; });
    wrap.appendChild(row.el);
  });

  wrap.appendChild(section("Hours slept", [
    hoursStepper(
      function () { return getEntry(date).sleepHours; },
      function (n) { update(date, function (e) { e.sleepHours = n; }); }
    ),
    el("div", { class: "note-line", text: "Time asleep, not time lying down. Leave it blank if you have no idea." })
  ]));

  var nightNote = el("textarea", { rows: "5", placeholder: "Written last night, or add to it now" });
  nightNote.value = entry.nightNote || "";
  nightNote.addEventListener("input", function () {
    update(date, function (e) { e.nightNote = nightNote.value; });
    saveSoon();
  });
  wrap.appendChild(section("Note for this night", [nightNote]));

  wrap.appendChild(el("button", { class: "btn primary", type: "button", text: "Done",
    onclick: function () {
      update(date, function (e) { e.morningDone = true; });
      saveNow(); state.tab = "home"; render();
    }}));
  return wrap;
}

/* ---------- baseline ---------- */

/* The setup screen. Baselines were the whole of it once; what is tracked and
   what it pays are settings now too, so they live here behind their own band
   headers rather than in the code. */
/* ---------- settings ---------- */

/* The settings screen is a short menu. Baselines used to sit at the top of it
   as twenty-odd rating rows, which made everything else feel like a footnote
   you had to scroll past. Each section is its own page now. */
var SETTINGS_PAGES = [
  { key: "baselines", title: "Baselines", blurb: "Your normal value for each item" },
  { key: "track", title: "What to track", blurb: "Hide items, or add your own" },
  { key: "sleep", title: "Sleep", blurb: "Hours you normally need" },
  { key: "rewards", title: "Rewards", blurb: "What a win and pacing pay" },
  { key: "home", title: "Home screen", blurb: "Which blocks show, and the chart style" }
];

var HOME_BLOCKS = [
  { key: "scores", label: "Week score and PEM risk" },
  { key: "chart", label: "The 14 day chart" },
  { key: "pacing", label: "Pacing row and streak" },
  { key: "done", label: "Logged today" },
  { key: "pot", label: "In the pot" },
  { key: "backup", label: "Backup reminder" }
];

function settingsValue(key) {
  if (key === "home") {
    var off = HOME_BLOCKS.filter(function (b) { return !state.home[b.key]; }).length;
    return off ? off + " hidden" : "all shown";
  }
  if (key === "sleep") return (state.baselines.hoursTarget || 8) + "h";
  if (key === "rewards") return state.pay.on ? euro(state.pay.win) + " a win" : "off";
  if (key === "track") {
    var hidden = Object.keys(state.hidden || {}).filter(function (k) { return state.hidden[k]; }).length;
    var mine = (state.custom || []).length;
    var bits = [];
    if (mine) bits.push(mine + " of your own");
    if (hidden) bits.push(hidden + " hidden");
    return bits.length ? bits.join(" · ") : ALL_ITEMS.length + " items";
  }
  return "";   /* baselines have no single value worth summarising */
}

function baselineScreen() {
  var page = state.settings;
  if (!page) return settingsMenu();
  var wrap = el("div");
  var def = SETTINGS_PAGES.filter(function (x) { return x.key === page; })[0];
  wrap.appendChild(el("button", { class: "back-btn", type: "button",
    text: "\u2039  Settings",
    onclick: function () { state.settings = null; render(); } }));
  wrap.appendChild(el("h2", { class: "band", text: def ? def.title : "Settings" }));

  if (page === "baselines") settingsBaselines(wrap);
  else if (page === "track") settingsTrack(wrap);
  else if (page === "sleep") settingsSleep(wrap);
  else if (page === "rewards") settingsRewards(wrap);
  else if (page === "home") settingsHome(wrap);

  wrap.appendChild(el("button", { class: "btn primary", type: "button", text: "Back to settings",
    onclick: function () { state.settings = null; render(); } }));
  wrap.appendChild(el("div", { class: "note-line",
    text: "Everything here applies straight away." }));
  return wrap;
}

function settingsMenu() {
  var wrap = el("div");
  wrap.appendChild(el("div", { class: "hint",
    text: "How the app is set up. Nothing here changes what you have already logged." }));
  SETTINGS_PAGES.forEach(function (pg) {
    wrap.appendChild(el("button", { class: "menu-row", type: "button",
      onclick: function () { state.settings = pg.key; render(); } }, [
      el("div", { class: "menu-main" }, [
        el("div", { class: "menu-title", text: pg.title }),
        el("div", { class: "menu-blurb", text: pg.blurb })
      ]),
      el("div", { class: "menu-side" }, [
        el("span", { class: "menu-value", text: settingsValue(pg.key) }),
        el("span", { class: "menu-arrow", text: "\u203a" })
      ])
    ]));
  });
  wrap.appendChild(el("button", { class: "btn primary", type: "button", text: "Done",
    onclick: function () { state.tab = "home"; render(); } }));
  return wrap;
}

function settingsBaselines(wrap) {
  wrap.appendChild(el("div", { class: "hint",
    text: "Your normal value for each item. New days start here, and anything different gets a dot." }));
  ALL_ITEMS.forEach(function (it) {
    var row = ratingRow(it,
      function () { return state.baselines[it.key]; },
      function (n) { state.baselines[it.key] = n; saveNow(); },
      null);
    wrap.appendChild(row.el);
  });

}

function settingsSleep(wrap) {
  wrap.appendChild(el("div", { class: "field-label", text: "Hours you normally need" }));
  wrap.appendChild(hoursStepper(
    function () { return state.baselines.hoursTarget; },
    function (n) { state.baselines.hoursTarget = n === "" ? DEFAULT_BASELINES.hoursTarget : n; },
    { anchor: 8, required: true }
  ));
  wrap.appendChild(el("div", { class: "note-line",
    text: "Only sleeping short of this counts against the PEM predictor." }));

}

function settingsTrack(wrap) {
  /* ---- what to track ---- */
  wrap.appendChild(el("h2", { class: "band", text: "What to track" }));
  wrap.appendChild(el("div", { class: "hint",
    text: "Hidden items stop being asked for and stop counting toward the scores. Everything already recorded is kept and still exports." }));
  wrap.appendChild(el("div", { class: "hint",
    text: "Both scores are an average across the items tracked, so hiding or adding one changes what the number is an average of. Scores from before a change are not strictly comparable with scores after it." }));

  function trackRow(key, label, custom) {
    var off = isHidden(key);
    var row = el("div", { class: "track-row" + (off ? " off" : "") }, [
      el("button", { class: "track-name", type: "button",
        onclick: function () {
          if (off) delete state.hidden[key]; else state.hidden[key] = true;
          saveNow(); rebuildItems(); render(true);
        }
      }, [
        el("span", { text: label }),
        el("span", { class: "track-state", text: off ? "hidden" : "shown" })
      ])
    ]);
    if (custom) {
      row.appendChild(el("button", { class: "track-remove", type: "button", text: "remove",
        onclick: function () {
          state.retired = state.retired || {};
          state.retired[key] = label;
          state.custom = state.custom.filter(function (c) { return c.key !== key; });
          delete state.hidden[key];
          saveNow(); rebuildItems(); render(true);
        }}));
    }
    return row;
  }

  BUILTIN_SECTIONS.forEach(function (sec) {
    wrap.appendChild(el("div", { class: "section-head", text: sec.title }));
    sec.items.forEach(function (it) { wrap.appendChild(trackRow(it.key, it.label)); });
  });
  wrap.appendChild(el("div", { class: "section-head", text: "Night" }));
  BUILTIN_MORNING.forEach(function (it) { wrap.appendChild(trackRow(it.key, it.label)); });

  if ((state.custom || []).length) {
    wrap.appendChild(el("div", { class: "section-head", text: "Your own" }));
    state.custom.forEach(function (c) {
      wrap.appendChild(trackRow(c.key, c.label + " · " + customWhere(c), true));
    });
  }

  /* ---- add your own ---- */
  var draft = { label: "", max: 3, band: "symptoms", section: "", base: 0 };
  var addMsg = el("div", { class: "msg", style: { display: "none" } });
  var nameField = el("input", { type: "text", placeholder: "Name it" });
  nameField.addEventListener("input", function () { draft.label = nameField.value; });

  function chipRow(options, get, set) {
    var row = el("div", { class: "tags" });
    options.forEach(function (o) {
      var btn = el("button", { type: "button", text: o.label,
        "aria-pressed": get() === o.value ? "true" : "false",
        onclick: function () {
          set(o.value);
          Array.prototype.forEach.call(row.children, function (c, i) {
            c.setAttribute("aria-pressed", options[i].value === get() ? "true" : "false");
          });
        }});
      row.appendChild(btn);
    });
    return row;
  }

  wrap.appendChild(el("div", { class: "section-head", text: "Add your own" }));
  wrap.appendChild(nameField);
  wrap.appendChild(el("div", { class: "field-label", text: "Scale" }));
  wrap.appendChild(chipRow([{ label: "0-3", value: 3 }, { label: "no / yes", value: 1 }],
    function () { return draft.max; },
    function (v) { draft.max = v; if (draft.base > v) draft.base = v; paintBase(); }));
  wrap.appendChild(el("div", { class: "field-label", text: "Where it belongs" }));
  wrap.appendChild(chipRow(
    [{ label: "Symptoms", value: "symptoms" }, { label: "Exertion", value: "exertion" },
     { label: "Night", value: "night" }],
    function () { return draft.band; },
    function (v) { draft.band = v; paintCat(); }));

  /* A symptom can also pick the section it sits in. Exertion and Night each
     have one section already, so the question only makes sense for symptoms. */
  var catHost = el("div");
  function paintCat() {
    catHost.innerHTML = "";
    if (draft.band !== "symptoms") return;
    var options = symptomSectionTitles().map(function (t) { return { label: t, value: t }; });
    options.push({ label: "Your own", value: "" });
    catHost.appendChild(el("div", { class: "field-label", text: "Which group" }));
    catHost.appendChild(chipRow(options,
      function () { return draft.section; },
      function (v) { draft.section = v; }));
  }
  paintCat();
  wrap.appendChild(catHost);

  var baseHost = el("div");
  function paintBase() {
    baseHost.innerHTML = "";
    baseHost.appendChild(el("div", { class: "field-label", text: "Its normal value" }));
    var row = ratingRow({ key: "draft", label: "Baseline", max: draft.max,
        labels: draft.max === 1 ? ["no", "yes"] : undefined },
      function () { return draft.base; },
      function (n) { draft.base = n; },
      null);
    baseHost.appendChild(row.el);
  }
  paintBase();
  wrap.appendChild(baseHost);

  wrap.appendChild(el("button", { class: "btn wide raised", type: "button", text: "Add it",
    onclick: function () {
      var label = (draft.label || "").trim();
      if (!label) { addMsg.textContent = "Give it a name first."; addMsg.style.display = ""; return; }
      var key = "c" + Date.now().toString(36);
      var entry = { key: key, label: label, max: draft.max, band: draft.band };
      if (draft.band === "symptoms" && draft.section) entry.section = draft.section;
      state.custom = (state.custom || []).concat([entry]);
      state.baselines[key] = draft.base;
      saveNow(); rebuildItems(); render(true);
    }}));
  wrap.appendChild(el("div", { class: "note-line",
    text: "It joins the Baselines page too, so the normal can be changed later." }));
  wrap.appendChild(addMsg);

}

function settingsRewards(wrap) {
  /* ---- rewards ---- */
  wrap.appendChild(el("h2", { class: "band", text: "Rewards" }));
  wrap.appendChild(el("button", { class: "track-row", type: "button",
    onclick: function () { state.pay.on = !state.pay.on; saveNow(); render(true); }
  }, [
    el("span", { class: "track-name-plain" }, [
      el("span", { text: "Pay for wins and pacing" }),
      el("span", { class: "track-state", text: state.pay.on ? "on" : "off" })
    ])
  ]));

  if (state.pay.on) {
    [["Each thing done well", "win", 0.20],
     ["A day paced at 1", "pacing1", 0.25],
     ["A day paced at 0", "pacing0", 0.50]].forEach(function (row) {
      wrap.appendChild(el("div", { class: "field-label", text: row[0] + " (\u20ac)" }));
      wrap.appendChild(numberStepper(
        function () { return state.pay[row[1]]; },
        function (n) { state.pay[row[1]] = n === "" ? row[2] : n; },
        { step: 0.05, min: 0, max: 20, decimals: 2, anchor: row[2], required: true }
      ));
    });
    wrap.appendChild(el("div", { class: "note-line",
      text: "Changing an amount re-prices every day already logged — the pot is worked out from the log, not banked." }));
  } else {
    wrap.appendChild(el("div", { class: "note-line",
      text: "Wins are still logged and still counted. Only the money is off." }));
  }
}

function settingsHome(wrap) {
  wrap.appendChild(el("div", { class: "hint",
    text: "What Home shows. The date and the things still to log always stay." }));
  HOME_BLOCKS.forEach(function (bl) {
    var off = !state.home[bl.key];
    wrap.appendChild(el("button", { class: "track-row" + (off ? " off" : ""), type: "button",
      onclick: function () { state.home[bl.key] = off; saveNow(); render(true); }
    }, [
      el("span", { class: "track-name-plain" }, [
        el("span", { text: bl.label }),
        el("span", { class: "track-state", text: off ? "hidden" : "shown" })
      ])
    ]));
  });

  wrap.appendChild(el("div", { class: "section-head", text: "Chart style" }));
  [["rows", "Rows", "One small chart per variable, each zoomed to its own range. As many as you like."],
   ["lines", "Lines", "All on one chart, so you can see them cross. Three at a time."]]
    .forEach(function (opt) {
      var on = (state.home.chartStyle || "rows") === opt[0];
      wrap.appendChild(el("button", { class: "track-row" + (on ? "" : " off"), type: "button",
        onclick: function () {
          state.home.chartStyle = opt[0];
          /* Dropping to lines has to drop the extras, or the cap would be a
             lie the moment it mattered. */
          if (opt[0] === "lines" && (state.chartKeys || []).length > MAX_LINES) {
            state.chartKeys = state.chartKeys.slice(0, MAX_LINES);
          }
          saveNow(); render(true);
        }
      }, [
        el("span", { class: "track-name-plain" }, [
          el("span", { text: opt[1] }),
          el("span", { class: "track-state", text: on ? "on" : "" })
        ])
      ]));
      wrap.appendChild(el("div", { class: "note-line", text: opt[2] }));
    });
}

function bandName(band) {
  return band === "exertion" ? "Exertion" : band === "night" ? "Night" : "Symptoms";
}

/* ---------- backup files ---------- */

function backupJson() {
  return JSON.stringify({
    app: "daily-log", version: STORE_VERSION, exportedAt: new Date().toISOString(),
    baselines: state.baselines, hidden: state.hidden, custom: state.custom,
    retired: state.retired, pay: state.pay, purchases: state.purchases,
    episodeLog: state.episodeLog,
    home: state.home, days: state.days
  }, null, 2);
}

function csvCell(v) {
  var s = String(v === undefined || v === null ? "" : v).replace(/[\r\n]+/g, " ");
  return /[",]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}

function backupCsv() {
  var rows = [["observation_date", "tracker_name", "tracker_category", "observation_value", "baseline"]];
  Object.keys(state.days).sort().forEach(function (d) {
    var e = state.days[d];
    /* Everything ever defined, not just what is on screen today, so hiding an
       item never drops its history out of the export. */
    exportKeys().forEach(function (k) {
      if (e.v[k] === undefined) return;
      rows.push([d, exportNameFor(k), CATEGORY[k] || "Custom", e.v[k],
        state.baselines[k] === undefined ? "" : state.baselines[k]]);
    });
    if (e.sleepHours !== "" && e.sleepHours !== undefined && e.sleepHours !== null) {
      rows.push([d, EXPORT_NAME.sleepHours, CATEGORY.sleepHours, e.sleepHours, ""]);
    }
    if (e.lastBite) rows.push([d, EXPORT_NAME.lastBite, CATEGORY.lastBite, e.lastBite, ""]);
    if (e.stomach) rows.push([d, EXPORT_NAME.stomach, CATEGORY.stomach, e.stomach, ""]);
    (e.wins || []).forEach(function (w) {
      rows.push([d, "Done well", "Custom", w.text || "logged", ""]);
    });
    if (e.tags && e.tags.length) rows.push([d, "Tags", "Note", e.tags.join("|"), ""]);
    Object.keys(e.detail || {}).forEach(function (k) {
      if (e.detail[k]) rows.push([d, exportNameFor(k) + " note", "Note", e.detail[k], ""]);
    });
    /* v1.14.0 had one note for the whole band; it still exports where it exists. */
    if (e.exertionNote) rows.push([d, "Exertion note", "Note", e.exertionNote, ""]);
    if (e.note) rows.push([d, "Note", "Note", e.note, ""]);
    if (e.nightNote) rows.push([d, "Night note", "Note", e.nightNote, ""]);
  });
  return rows.map(function (r) { return r.map(csvCell).join(","); }).join("\n");
}

function download(name, text, type) {
  try {
    var blob = new Blob([text], { type: type });
    var url = URL.createObjectURL(blob);
    var a = el("a", { href: url, download: name });
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(url); a.remove(); }, 2000);
    return true;
  } catch (e) {
    return false;
  }
}

/* Merge, never clobber: a day already here is only replaced by a newer one. */
function restore(parsed) {
  parsed = migrate(parsed);
  var added = 0, updated = 0, kept = 0;
  var days = parsed.days || {};
  Object.keys(days).forEach(function (d) {
    var incoming = days[d];
    var mine = state.days[d];
    if (!mine) { state.days[d] = incoming; added++; return; }
    var a = incoming.updatedAt || incoming.savedAt || "";
    var b = mine.updatedAt || mine.savedAt || "";
    if (a > b) { state.days[d] = incoming; updated++; } else { kept++; }
  });
  if (parsed.baselines) {
    state.baselines = Object.assign({}, DEFAULT_BASELINES, parsed.baselines);
  }
  /* A backup carries what was being tracked, not just the numbers. */
  if (parsed.custom) state.custom = parsed.custom;
  if (parsed.hidden) state.hidden = parsed.hidden;
  if (parsed.retired) state.retired = parsed.retired;
  if (parsed.pay) state.pay = Object.assign({}, state.pay, parsed.pay);
  if (parsed.home) state.home = Object.assign({}, state.home, parsed.home);
  /* Purchases are a flat list, so merge by id rather than replacing: restoring
     an older backup must not wipe spending recorded since. */
  if (parsed.purchases) {
    var have = {};
    (state.purchases || []).forEach(function (x) { have[x.id] = true; });
    parsed.purchases.forEach(function (x) { if (!have[x.id]) state.purchases.push(x); });
  }
  /* The imported log is one file, so a backup's copy replaces it; changes
     added here are a list, so they merge by id like purchases. */
  if (parsed.episodeLog) {
    if (parsed.episodeLog.file) state.episodeLog.file = parsed.episodeLog.file;
    var seen = {};
    (state.episodeLog.changes || []).forEach(function (c) { seen[c.id] = true; });
    (parsed.episodeLog.changes || []).forEach(function (c) {
      if (!seen[c.id]) state.episodeLog.changes = (state.episodeLog.changes || []).concat([c]);
    });
  }
  rebuildItems();
  saveNow();
  return { added: added, updated: updated, kept: kept };
}

/* ---------- history ---------- */

var pendingMsg = "";

function historyScreen() {
  var wrap = el("div");
  var dates = Object.keys(state.days).sort().reverse();
  var msg = el("div", { class: "msg", style: { display: "none" } });
  function say(text) { msg.textContent = text; msg.style.display = ""; }
  if (pendingMsg) { say(pendingMsg); pendingMsg = ""; }

  wrap.appendChild(el("div", { class: "hint",
    text: dates.length + (dates.length === 1 ? " day logged" : " days logged") }));

  if (dates.length === 0) {
    wrap.appendChild(el("div", { class: "hint",
      text: "Nothing saved yet. Fill in the Evening screen and press Save day." }));
  }

  dates.forEach(function (d) {
    var e = state.days[d];
    var off = offBaselineKeys(e, ALL_KEYS).length;
    var meta = off + " off baseline" +
      (e.v.crash ? " · crash" : "") +
      (e.v.episode ? " · ep " + e.v.episode : "");
    wrap.appendChild(el("button", {
      class: "day" + (e.complete ? "" : " draft"), type: "button",
      onclick: function () { state.eveDate = d; eveDateManual = true; state.tab = "evening"; render(); }
    }, [
      el("div", { class: "line" }, [
        el("span", { text: pretty(d) + (e.complete ? "" : " — draft") }),
        el("span", { class: "meta", text: meta })
      ])
    ]));
  });

  /* Backups. Browser storage gets wiped sooner or later, so this is the part
     that has to work. */
  var file = el("input", { type: "file", accept: "application/json,.json", id: "restore-file", class: "hidden-file" });
  file.addEventListener("change", function () {
    var f = file.files && file.files[0];
    if (!f) return;
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var parsed = JSON.parse(String(reader.result));
        if (!parsed || typeof parsed !== "object" || !parsed.days) {
          say("That file has no days in it."); return;
        }
        var r = restore(parsed);
        pendingMsg = "Restored: " + r.added + " new, " + r.updated + " updated, " +
          r.kept + " already newer here.";
        render();
      } catch (err) {
        say("That file isn't valid JSON.");
      }
    };
    reader.readAsText(f);
  });

  wrap.appendChild(section("Backup", [
    el("div", { class: "pair" }, [
      el("button", { class: "btn raised", type: "button", text: "Download JSON", onclick: function () {
        if (download("daily-log-" + today() + ".json", backupJson(), "application/json")) {
          state.lastBackupAt = new Date().toISOString();
          saveNow();
          say("JSON file downloaded.");
        } else {
          say("Download failed — use Copy JSON below.");
        }
      }}),
      el("button", { class: "btn raised", type: "button", text: "Download CSV", onclick: function () {
        say(download("daily-log-" + today() + ".csv", backupCsv(), "text/csv")
          ? "CSV file downloaded." : "Download failed — use Copy JSON below.");
      }})
    ]),
    el("label", { class: "btn raised wide file-btn", for: "restore-file",
      text: "Restore from a JSON file" }),
    file,
    el("div", { class: "note-line",
      text: "Merged in. A day already here is only replaced by a newer copy." }),
    el("div", { class: "spacer" }),
    el("button", { class: "btn raised wide", type: "button", text: "Copy JSON to clipboard",
      onclick: function () {
        var text = backupJson();
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(
            function () { say("JSON copied."); },
            function () { say("Copy failed."); });
        } else {
          say("Clipboard not available on this phone.");
        }
      }}),
    msg
  ]));

  return wrap;
}

/* ---------- episodes ---------- */

/* A timeline of autonomic episodes: the nights logged on the Morning screen,
   plus a log kept elsewhere and imported from a file.

   The file is read on this phone with FileReader and kept in this phone's
   storage, like every other record here. It is never sent anywhere — the app
   makes no network calls — and it is not part of the code, so nothing personal
   reaches the repository the app is published from. It does go into the JSON
   backup, because a log that can be wiped is not a log.

   Rows are keyed by the morning date: the night of 3 to 4 March sits on
   4 March. That is how the imported logs label their rows, and it keeps an
   evening event ("4 Mar (eve)") and the night after it on different days. */

/* Teal for medication changes and dose nights, purple for the average. Both
   checked with the palette validator against each other and against every
   bar colour: the nearest pair is teal against the lightest red, ΔE 8.3 under
   deuteranopia, and the two overlays also differ in shape — dotted lines with
   labels against one solid line — so neither leans on colour alone. A blue
   was tried for the average and sat ΔE 11.3 from the teal: too close. */
var EP_TEAL = "#4FB3A5", EP_PURPLE = "#9C8FE0";

var EP_MONTH_LONG = ["January", "February", "March", "April", "May", "June", "July",
  "August", "September", "October", "November", "December"];

var EP_MONTHS = { jan: 1, feb: 2, mar: 3, mrt: 3, maa: 3, apr: 4, may: 5, mei: 5, jun: 6,
  jul: 7, aug: 8, sep: 9, oct: 10, okt: 10, nov: 11, dec: 12 };

/* Markdown down to the words: links keep their text, emphasis goes. */
function epPlain(s) {
  return String(s === undefined || s === null ? "" : s)
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/\*+|`/g, "")
    .replace(/\s+/g, " ").trim();
}

function epYear(text) {
  var m = String(text).match(/\b(20\d\d)\b/);
  return m ? Number(m[1]) : new Date().getFullYear();
}

/* "3–4 Mar", "31 Mar – 1 Apr", "4 Mar (eve)", "12 Mar", "From ~10 Mar".
   The row date is the last day named, which for a night is the morning
   after it. A log that runs from December into January only names the year
   once, so a date that would land well before the previous row moves on a
   year. */
function epLabelDate(label, year, prev) {
  var toks = epPlain(label).toLowerCase().match(/\d{1,2}|[a-z]+/g) || [];
  var day = null, month = null, lastMonth = null, nums = 0;
  toks.forEach(function (t) {
    if (/^\d/.test(t)) { day = Number(t); nums++; month = null; return; }
    var m = EP_MONTHS[t.slice(0, 3)];
    if (!m) return;
    lastMonth = m;
    if (day !== null && month === null) month = m;
  });
  month = month || lastMonth;
  if (day === null || month === null || day < 1 || day > 31) return null;
  var date = iso(new Date(year, month - 1, day));
  if (prev && date < shiftDay(prev, -200)) date = iso(new Date(year + 1, month - 1, day));
  var part = /\b(eve|evening|avond)\b/i.test(label) ? "eve" : nums >= 2 ? "night" : "day";
  return { date: date, part: part };
}

/* "**4 · S**" → 4 with the near-syncope flag; "—" → a night with no score;
   an empty cell → not a night at all, but a change worth marking. */
function epScore(cell) {
  var c = epPlain(cell);
  if (c === "") return { marker: true };
  var m = c.match(/^(\d)/);
  return { v: m ? Math.min(5, Number(m[1])) : null,
    flag: /(^|[^a-z])s([^a-z]|$)/i.test(c.replace(/^\d/, "")) ? "S" : "" };
}

/* A change's label is its first clause: the rest goes in its detail. */
function epShort(text) {
  var t = epPlain(text).split(/[;.]\s/)[0];
  return t.length > 70 ? t.slice(0, 67) + "…" : t;
}

function epTables(text) {
  var out = [], cur = null;
  String(text).split(/\r?\n/).forEach(function (ln) {
    var t = ln.trim();
    if (t.charAt(0) !== "|") { cur = null; return; }
    var cells = t.replace(/^\|/, "").replace(/\|\s*$/, "").split("|")
      .map(function (c) { return c.trim(); });
    if (!cur) {
      cur = { head: cells.map(function (h) { return epPlain(h).toLowerCase(); }), rows: [] };
      out.push(cur);
      return;
    }
    if (cells.every(function (c) { return c === "" || /^:?-{2,}:?$/.test(c); })) return;
    cur.rows.push(cells);
  });
  return out;
}

function epCol(head, words) {
  for (var i = 0; i < head.length; i++) {
    for (var j = 0; j < words.length; j++) if (head[i].indexOf(words[j]) >= 0) return i;
  }
  return -1;
}

/* The log as a Markdown file: a timeline table with a date column, a Score
   column and a "What happened" column, optionally a Notes column, a Scale
   table (Score | Definition), and a table of medication changes (Date |
   Change). Only the timeline is required. */
function epFromMarkdown(text) {
  var year = epYear(text);
  var out = { nights: [], changes: [], doses: [], scale: {} };
  epTables(text).forEach(function (t) {
    var sc = epCol(t.head, ["score"]);
    var def = epCol(t.head, ["definition", "meaning"]);
    var what = epCol(t.head, ["what", "happen", "description"]);
    if (sc >= 0 && def >= 0) {
      t.rows.forEach(function (r) {
        var k = epPlain(r[sc]).charAt(0);
        if (/[0-5]/.test(k)) out.scale[k] = epPlain(r[def]);
      });
      return;
    }
    if (sc >= 0 && what >= 0) {
      var dc = epCol(t.head, ["night", "date", "day"]);
      if (dc < 0) dc = 0;
      var notes = epCol(t.head, ["note", "context"]);
      var prev = null;
      t.rows.forEach(function (r) {
        var d = epLabelDate(r[dc], year, prev);
        if (!d) return;
        prev = d.date;
        var s = epScore(r[sc]);
        var w = epPlain(r[what]);
        if (s.marker) { out.changes.push({ date: d.date, text: epShort(w), detail: w }); return; }
        out.nights.push({ date: d.date, part: d.part, label: epPlain(r[dc]), v: s.v,
          flag: s.flag, what: w, ctx: notes >= 0 ? epPlain(r[notes]) : "" });
      });
      return;
    }
    var chg = epCol(t.head, ["change", "medication"]);
    var dd = epCol(t.head, ["date", "day"]);
    if (chg >= 0 && dd >= 0) {
      var p = null;
      t.rows.forEach(function (r) {
        var d = epLabelDate(r[dd], year, p);
        if (!d || !epPlain(r[chg])) return;
        p = d.date;
        out.changes.push({ date: d.date, text: epShort(r[chg]), detail: epPlain(r[chg]) });
      });
    }
  });
  var flag = String(text).match(/flag s[^:\n]*:\**\s*([^\n]+)/i);
  if (flag) out.scale.S = epPlain(flag[1]);
  return out;
}

/* Pull one JavaScript literal out of a page: the text from an opening bracket
   to its matching close, skipping brackets inside strings. */
function epLiteral(text, re) {
  var m = re.exec(text);
  if (!m) return null;
  var start = m.index + m[0].length - 1, open = text.charAt(start);
  var close = open === "[" ? "]" : "}", depth = 0, inStr = false;
  for (var i = start; i < text.length; i++) {
    var c = text.charAt(i);
    if (inStr) {
      if (c === "\\") i++;
      else if (c === inStr) inStr = false;
      continue;
    }
    if (c === "\"" || c === "'") inStr = c;
    else if (c === open) depth++;
    else if (c === close && --depth === 0) return text.slice(start, i + 1);
  }
  return null;
}

/* The log as a timeline page: its data array (lab, v, flag, what, ctx) and
   its scale. Markers drawn into such a page are only positions on a drawing,
   not data, so they cannot come across; add them here, or put them in the
   Markdown as a Date | Change table. */
function epFromHtml(text) {
  var out = { nights: [], changes: [], doses: [], scale: {} };
  var body = text.indexOf("<body") >= 0 ? text.slice(text.indexOf("<body")) : text;
  var year = epYear(body);
  var data = epLiteral(text, /(?:const|var|let)\s+D\s*=\s*\[/);
  if (!data) return out;
  var prev = null;
  JSON.parse(data).forEach(function (r) {
    var d = epLabelDate(r.lab, year, prev);
    if (!d) return;
    prev = d.date;
    out.nights.push({ date: d.date, part: d.part, label: epPlain(r.lab),
      v: typeof r.v === "number" ? r.v : null, flag: r.flag === "S" ? "S" : "",
      what: epPlain(r.what), ctx: epPlain(r.ctx) });
  });
  var sc = epLiteral(text, /(?:const|var|let)\s+SC\s*=\s*\{/);
  if (sc) {
    try {
      var obj = JSON.parse(sc);
      Object.keys(obj).forEach(function (k) {
        if (/^[0-5S]$/.test(k) && obj[k] && obj[k][3]) out.scale[k] = epPlain(obj[k][3]);
      });
    } catch (e) { /* a scale it cannot read is not worth refusing the file over */ }
  }
  return out;
}

/* Whatever came in, keep only what is well formed. A file is data, never
   code: nothing in it is run or inserted as markup. */
function epClean(raw) {
  var okDate = function (d) { return typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d); };
  var str = function (s, n) { return epPlain(s).slice(0, n || 2000); };
  var out = { nights: [], changes: [], doses: [], scale: {} };
  (raw.nights || []).forEach(function (r) {
    if (!r || !okDate(r.date)) return;
    var v = typeof r.v === "number" && r.v >= 0 && r.v <= 5 ? Math.round(r.v) : null;
    out.nights.push({ date: r.date, part: r.part === "eve" || r.part === "day" ? r.part : "night",
      label: str(r.label, 40), v: v, flag: r.flag === "S" ? "S" : "",
      what: str(r.what), ctx: str(r.ctx) });
  });
  (raw.changes || []).forEach(function (c) {
    if (c && okDate(c.date) && epPlain(c.text)) {
      out.changes.push({ date: c.date, text: str(c.text, 80), detail: str(c.detail || "") });
    }
  });
  (raw.doses || []).forEach(function (g) {
    if (!g || !epPlain(g.name) || !Array.isArray(g.dates)) return;
    var notes = {};
    Object.keys(g.notes || {}).forEach(function (d) { if (okDate(d)) notes[d] = str(g.notes[d], 80); });
    out.doses.push({ name: str(g.name, 40), dates: g.dates.filter(okDate), notes: notes });
  });
  Object.keys(raw.scale || {}).forEach(function (k) {
    if (/^[0-5S]$/.test(k)) out.scale[k] = str(raw.scale[k], 600);
  });
  out.nights.sort(function (a, b) { return a.date < b.date ? -1 : a.date > b.date ? 1 : 0; });
  return out;
}

function epParse(text, name) {
  var t = String(text);
  var parsed;
  if (/^\s*[{[]/.test(t)) {
    var j = JSON.parse(t);
    if (j && j.episodeLog && j.episodeLog.file) parsed = j.episodeLog.file;
    else if (j && j.nights) parsed = j;
    else throw new Error("That file has no episode log in it.");
  } else if (/<html|<script/i.test(t)) {
    parsed = epFromHtml(t);
  } else {
    parsed = epFromMarkdown(t);
  }
  var clean = epClean(parsed);
  if (!clean.nights.length) {
    throw new Error("Couldn't find any nights in " + (name || "that file") +
      ". It needs a table with a date, a Score and a What happened column.");
  }
  return clean;
}

/* ---- the merged record ---- */

function epMonthDay(dateStr) {
  var p = dateStr.split("-").map(Number);
  return p[2] + " " + MONTH_NAMES[p[1] - 1];
}

/* "3–4 Mar", or "31 Mar – 1 Apr" across a month. */
function epNightLabel(evening) {
  var a = evening.split("-").map(Number), b = shiftDay(evening, 1).split("-").map(Number);
  return a[1] === b[1]
    ? a[2] + "–" + b[2] + " " + MONTH_NAMES[b[1] - 1]
    : epMonthDay(evening) + " – " + epMonthDay(shiftDay(evening, 1));
}

/* A night logged here sits on the evening before it (that is where the
   Morning screen writes it), so it moves on a day to land on its morning. The
   imported log wins where both have the same night: it is the one that was
   gone over afterwards. */
function epRows() {
  var file = state.episodeLog.file;
  var rows = [], taken = {};
  if (file) {
    file.nights.forEach(function (n) {
      rows.push(Object.assign({ src: "file" }, n));
      if (n.part !== "eve") taken[n.date] = true;
    });
  }
  Object.keys(state.days).forEach(function (d) {
    var e = state.days[d];
    if (!e || !nightIsLogged(e) || e.v.episode === undefined) return;
    var morning = shiftDay(d, 1);
    if (taken[morning]) return;
    rows.push({ src: "app", date: morning, part: "night", label: epNightLabel(d),
      v: e.v.episode, flag: e.v.syncope === 1 ? "S" : "", what: e.nightNote || "", ctx: "" });
  });
  var order = { day: 0, night: 0, eve: 1 };
  rows.sort(function (a, b) {
    if (a.date !== b.date) return a.date < b.date ? -1 : 1;
    return order[a.part] - order[b.part];
  });
  return rows;
}

function epChanges() {
  var out = [];
  var file = state.episodeLog.file;
  if (file) file.changes.forEach(function (c) { out.push(Object.assign({ src: "file" }, c)); });
  (state.episodeLog.changes || []).forEach(function (c) { out.push(Object.assign({ src: "app" }, c)); });
  out.sort(function (a, b) { return a.date < b.date ? -1 : a.date > b.date ? 1 : 0; });
  return out;
}

/* What the scale numbers mean: the imported log's own definitions where it
   has them, otherwise the words the Morning screen uses. */
function epScaleText(k) {
  var file = state.episodeLog.file;
  if (file && file.scale && file.scale[k]) return file.scale[k];
  if (k === "S") return "Near-syncope.";
  var w = SCALE_EPISODE[Number(k)];
  return w ? w.charAt(0).toUpperCase() + w.slice(1) + "." : "";
}

/* One value per day, the worst of that day's rows. Inside the imported log's
   date range a blank night counts as 0 — the logs this is built for only write
   a night down when something happened, so skipping blanks would average only
   the bad ones. Outside it, nights are logged here every morning, and a blank
   is a night nobody logged, so it is left out. */
function epDayValues(rows) {
  var vals = {};
  rows.forEach(function (r) {
    if (r.v === null || r.v === undefined) return;
    vals[r.date] = Math.max(vals[r.date] === undefined ? 0 : vals[r.date], r.v);
  });
  var file = state.episodeLog.file;
  var lo = null, hi = null;
  if (file && file.nights.length) { lo = file.nights[0].date; hi = file.nights[file.nights.length - 1].date; }
  return function (d) {
    if (vals[d] !== undefined) return vals[d];
    return lo && d >= lo && d <= hi ? 0 : null;
  };
}

/* Gaps between the nights that reached 3 or more. */
function epIntervals(rows) {
  var dates = [];
  rows.forEach(function (r) {
    if (r.v !== null && r.v >= 3 && dates.indexOf(r.date) < 0) dates.push(r.date);
  });
  var gaps = [];
  for (var i = 1; i < dates.length; i++) {
    gaps.push(Math.round((new Date(dates[i]) - new Date(dates[i - 1])) / 864e5));
  }
  return { dates: dates, gaps: gaps };
}

/* ---- the chart ---- */

var epShow = { changes: true, avg: false, doses: {} };
var epOpen = null;            /* "import" or "change" — the folded panels */
var epMsg = "";

/* Words onto lines of about n characters, at most three. */
function epWrap(text, n) {
  var lines = [], cur = "";
  text.split(" ").forEach(function (w) {
    if (cur && (cur + " " + w).length > n) { lines.push(cur); cur = w; } else cur = cur ? cur + " " + w : w;
  });
  if (cur) lines.push(cur);
  if (lines.length > 3) { lines = lines.slice(0, 3); lines[2] = lines[2].replace(/.$/, "…"); }
  return lines;
}

function epChart(rows, changes, doses) {
  var W = 360, xDate = 33, xDose = 39.5, x0 = 46, U = 26, xS = x0 + 5 * U + 13, xMark = 202;
  var RH = 13, HEAD = 26, MONTH = 22, GAP = 22, GAPMIN = 7;
  var ns = "http://www.w3.org/2000/svg";
  function node(name, attrs, text) {
    var n = document.createElementNS(ns, name);
    Object.keys(attrs).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    if (text !== undefined) n.textContent = text;
    return n;
  }

  /* Lay out: a row per event, a thin row per empty day, a single break for a
     long empty stretch, and a header where the month turns. */
  var byDate = {};
  rows.forEach(function (r, i) { (byDate[r.date] = byDate[r.date] || []).push(i); });
  var first = rows[0].date, last = rows[rows.length - 1].date;
  var items = [], y = HEAD, month = null, rowY = {}, dayY = {};
  function monthOf(d) { return d.slice(0, 7); }
  function addMonth(d) {
    if (monthOf(d) === month) return;
    month = monthOf(d);
    var p = d.split("-").map(Number);
    items.push({ type: "month", y: y, label: EP_MONTH_LONG[p[1] - 1] + (p[1] === 1 || items.length === 0 ? " " + p[0] : "") });
    y += MONTH;
  }
  for (var d = first; d <= last; d = shiftDay(d, 1)) {
    if (!byDate[d]) {
      var run = 0, e = d;
      while (e <= last && !byDate[e]) { run++; e = shiftDay(e, 1); }
      if (run >= GAPMIN) {
        addMonth(d);
        items.push({ type: "gap", y: y, n: run });
        for (var g = d; g < e; g = shiftDay(g, 1)) dayY[g] = y + GAP / 2;
        y += GAP;
        d = shiftDay(e, -1);
        continue;
      }
      addMonth(d);
      items.push({ type: "empty", y: y, date: d });
      dayY[d] = y + RH / 2;
      y += RH;
      continue;
    }
    addMonth(d);
    byDate[d].forEach(function (i, k) {
      items.push({ type: "row", y: y, i: i, first: k === 0 });
      rowY[i] = y + RH / 2;
      if (k === 0) dayY[d] = y + RH / 2;
      y += RH;
    });
  }
  var H = y + 8;

  /* An empty day still gets its date when something is drawn on it. */
  var marked = {};
  if (epShow.changes) changes.forEach(function (c) { marked[c.date] = true; });
  doses.forEach(function (gp) { if (epShow.doses[gp.name]) gp.dates.forEach(function (d) { marked[d] = true; }); });

  var svg = node("svg", { viewBox: "0 0 " + W + " " + H, class: "ep-chart", role: "img",
    "aria-label": "Episode severity, night by night" });

  /* grid */
  for (var k = 0; k <= 5; k++) {
    svg.appendChild(node("line", { x1: x0 + k * U, x2: x0 + k * U, y1: HEAD - 4, y2: H - 4,
      stroke: k === 0 ? "#3A4550" : "#222A32", "stroke-width": k === 0 ? 1 : 0.6 }));
  }
  /* the scale along the top, each number a way into its definition */
  var keys = ["0", "1", "2", "3", "4", "5", "S"];
  keys.forEach(function (key, i) {
    var x = key === "S" ? xS : x0 + i * U;
    var gEl = node("g", { class: "ep-key", "data-key": key, tabindex: "0", role: "button",
      "aria-label": key === "S" ? "What S means" : "What " + key + " means" });
    gEl.appendChild(node("rect", { x: x - 11, y: 0, width: 22, height: HEAD - 4, fill: "transparent" }));
    if (key === "S") {
      gEl.appendChild(node("circle", { cx: x, cy: 12, r: 5.5, fill: "none", stroke: RAMP6[4], "stroke-width": 1.2 }));
      gEl.appendChild(node("text", { x: x, y: 15, "text-anchor": "middle", class: "ep-sflag", fill: RAMP6[4] }, "S"));
    } else {
      gEl.appendChild(node("text", { x: x, y: 16, "text-anchor": "middle", class: "ep-ax" }, key));
    }
    svg.appendChild(gEl);
  });

  items.forEach(function (it) {
    if (it.type === "month") {
      svg.appendChild(node("line", { x1: 0, x2: W, y1: it.y + 3, y2: it.y + 3, stroke: "#2A333C", "stroke-width": 0.8 }));
      svg.appendChild(node("text", { x: x0 + 5, y: it.y + 16, class: "ep-month" }, it.label));
    } else if (it.type === "gap") {
      svg.appendChild(node("rect", { x: x0 - 4, y: it.y + 2, width: 8, height: GAP - 4, fill: "#171C22" }));
      svg.appendChild(node("path", { d: "M" + (x0 - 5) + " " + (it.y + 13) + "l10 -5 M" + (x0 - 5) + " " + (it.y + 17) + "l10 -5",
        stroke: "#5C6873", "stroke-width": 0.9, fill: "none" }));
      svg.appendChild(node("text", { x: x0 + 9, y: it.y + 15, class: "ep-gap" },
        it.n + " days, no entries"));
    } else if (it.type === "empty") {
      svg.appendChild(node("line", { x1: x0 - 3, x2: x0, y1: it.y + RH / 2, y2: it.y + RH / 2,
        stroke: "#3A4550", "stroke-width": 1 }));
      if (marked[it.date]) {
        svg.appendChild(node("text", { x: xDate, y: it.y + RH / 2 + 3.3, "text-anchor": "end",
          class: "ep-date ep-date-empty" }, epMonthDay(it.date)));
      }
    } else {
      var r = rows[it.i], cy = it.y + RH / 2;
      var gRow = node("g", { class: "ep-row", "data-i": String(it.i), tabindex: "0", role: "button",
        "aria-label": r.label + ", " + (r.v === null ? "not scored" : "score " + r.v) + (r.flag ? ", near-syncope" : "") });
      gRow.appendChild(node("rect", { x: 0, y: it.y, width: W, height: RH, fill: "transparent" }));
      gRow.appendChild(node("rect", { class: "ep-sel", x: x0 - 2, y: it.y + 0.5, width: (r.v ? r.v * U : 6) + 4,
        height: RH - 1, rx: 2.5, fill: "none", stroke: "#C6CED6", "stroke-width": 1.1 }));
      if (it.first) {
        gRow.appendChild(node("text", { x: xDate, y: cy + 3.3, "text-anchor": "end", class: "ep-date" },
          epMonthDay(r.date)));
      }
      if (r.v === null) {
        gRow.appendChild(node("text", { x: x0 + 4, y: cy + 3.3, class: "ep-date" }, "–"));
      } else {
        var fill = RAMP6[r.v];
        gRow.appendChild(node("rect", { x: x0, y: cy - 4.5, width: r.v ? r.v * U : 3, height: 9, rx: 1.5, fill: fill }));
        /* Numbers only on the nights that matter most, not on every bar. */
        if (r.v >= 3) {
          gRow.appendChild(node("text", { x: x0 + r.v * U - 4, y: cy + 3.3, "text-anchor": "end",
            class: "ep-val", fill: INK[fill] || "#14181C" }, String(r.v)));
        }
      }
      if (r.flag === "S") {
        gRow.appendChild(node("circle", { cx: xS, cy: cy, r: 5, fill: "#171C22", stroke: RAMP6[4], "stroke-width": 1.1 }));
        gRow.appendChild(node("text", { x: xS, y: cy + 2.8, "text-anchor": "middle", class: "ep-sflag", fill: RAMP6[4] }, "S"));
      }
      svg.appendChild(gRow);
    }
  });

  /* dose nights: a ring beside the date */
  doses.forEach(function (gp) {
    if (!epShow.doses[gp.name]) return;
    gp.dates.forEach(function (d) {
      if (dayY[d] === undefined) return;
      svg.appendChild(node("circle", { cx: xDose, cy: dayY[d], r: gp.notes[d] ? 2.9 : 2.2,
        fill: "none", stroke: EP_TEAL, "stroke-width": 1.1 }));
      if (gp.notes[d]) svg.appendChild(node("circle", { cx: xDose, cy: dayY[d], r: 1, fill: EP_TEAL }));
    });
  });

  /* 7-day average */
  if (epShow.avg) {
    var val = epDayValues(rows), pts = [], lines = [];
    var flushAvg = function () { if (pts.length > 1) lines.push(pts); pts = []; };
    items.forEach(function (it) {
      if (it.type === "gap") { flushAvg(); return; }
      if (it.type === "month") return;
      if (it.type === "row" && !it.first) return;
      var date = it.type === "empty" ? it.date : rows[it.i].date;
      var sum = 0, n = 0;
      for (var b = 0; b < 7; b++) {
        var v = val(shiftDay(date, -b));
        if (v !== null) { sum += v; n++; }
      }
      if (n < 4) { flushAvg(); return; }
      pts.push((x0 + (sum / n) * U).toFixed(1) + "," + (it.y + RH / 2).toFixed(1));
    });
    flushAvg();
    lines.forEach(function (p) {
      svg.appendChild(node("polyline", { points: p.join(" "), fill: "none", stroke: EP_PURPLE,
        "stroke-width": 1.6, "stroke-linejoin": "round", "stroke-linecap": "round" }));
    });
  }

  /* medication changes: a dot on the axis, a dotted lead to a label in the
     clear space to the right, nudged down when two would collide */
  if (epShow.changes) {
    /* The lead starts where that day's bar ends, so it never runs through a
       bar or the number on it. */
    var barEnd = {};
    rows.forEach(function (r) {
      var end = x0 + (r.v ? r.v * U : r.v === 0 ? 3 : 8);
      barEnd[r.date] = Math.max(barEnd[r.date] || x0, end);
    });
    var nextFree = 0;
    changes.forEach(function (c, ci) {
      if (dayY[c.date] === undefined) return;
      var cy = dayY[c.date];
      var lines = epWrap(c.text, 30);
      /* The next label starts a full line below this one's last line. */
      var ly = Math.max(cy, nextFree);
      nextFree = ly + lines.length * 10.5 + 1;
      var gC = node("g", { class: "ep-change", "data-c": String(ci), tabindex: "0", role: "button",
        "aria-label": "Change on " + epMonthDay(c.date) + ": " + c.text });
      gC.appendChild(node("rect", { x: xMark - 6, y: ly - 8, width: W - xMark + 6,
        height: lines.length * 10.5 + 6, fill: "transparent" }));
      gC.appendChild(node("line", { x1: (barEnd[c.date] || x0) + 3, y1: cy, x2: xMark - 5, y2: ly, stroke: EP_TEAL,
        "stroke-width": 0.8, "stroke-dasharray": "2 2.4" }));
      gC.appendChild(node("circle", { cx: x0, cy: cy, r: 2.3, fill: EP_TEAL }));
      var tx = node("text", { x: xMark, y: ly + 3.4, class: "ep-mark", fill: EP_TEAL });
      lines.forEach(function (ln, li) {
        tx.appendChild(node("tspan", { x: xMark, dy: li ? 10.5 : 0 }, ln));
      });
      gC.appendChild(tx);
      svg.appendChild(gC);
    });
  }
  return { svg: svg, H: H };
}

/* ---- the screen ---- */

function epScreen() {
  var wrap = el("div");
  var rows = epRows(), changes = epChanges();
  var file = state.episodeLog.file;
  var doses = file ? file.doses : [];

  if (epMsg) { wrap.appendChild(el("div", { class: "msg", text: epMsg })); epMsg = ""; }

  if (!rows.length) {
    wrap.appendChild(el("div", { class: "hint",
      text: "No episodes yet. Nights you log on the Morning screen land here, and a log kept elsewhere can be imported below." }));
    if (!epOpen) epOpen = "import";
  } else {
    epChartSection(wrap, rows, changes, doses);
  }
  epActions(wrap, file);
  return wrap;
}

function epChartSection(wrap, rows, changes, doses) {
    /* toggles */
    var chips = el("div", { class: "tags" });
    var chip = function (label, on, flip) {
      chips.appendChild(el("button", { type: "button", text: label, "aria-pressed": on ? "true" : "false",
        onclick: function () { flip(); render(true); } }));
    };
    if (changes.length) chip("Medication changes", epShow.changes, function () { epShow.changes = !epShow.changes; });
    doses.forEach(function (gp) {
      chip(gp.name + " nights", !!epShow.doses[gp.name], function () { epShow.doses[gp.name] = !epShow.doses[gp.name]; });
    });
    chip("7-day average", epShow.avg, function () { epShow.avg = !epShow.avg; });
    wrap.appendChild(chips);

    var chart = epChart(rows, changes, doses);
    var box = el("div", { class: "ep-wrap" });
    box.appendChild(chart.svg);
    var panel = el("div", { class: "ep-panel", style: { display: "none" } });
    box.appendChild(panel);
    wrap.appendChild(box);

    var scored = rows.map(function (r, i) { return i; });
    var current = null;

    function chipFor(v, flag) {
      var c = el("span", { class: "ep-chip", text: v === null || v === undefined ? "–" : String(v) });
      if (v !== null && v !== undefined) { c.style.background = RAMP6[v]; c.style.color = INK[RAMP6[v]] || "#14181C"; }
      return c;
    }
    function place(target) {
      var br = box.getBoundingClientRect(), tr = target.getBoundingClientRect();
      panel.style.display = "";
      var ph = panel.offsetHeight, top = tr.bottom - br.top + 6;
      if (top + ph > box.offsetHeight && tr.top - br.top - ph - 6 >= 0) top = tr.top - br.top - ph - 6;
      panel.style.top = Math.max(0, top) + "px";
    }
    function mark(i) {
      Array.prototype.forEach.call(chart.svg.querySelectorAll(".ep-row"), function (g) {
        g.classList.toggle("on", Number(g.getAttribute("data-i")) === i);
      });
    }
    function close() { panel.style.display = "none"; current = null; mark(-1); }
    function closeBtn() {
      return el("button", { class: "ep-x", type: "button", text: "×", "aria-label": "Close", onclick: close });
    }
    function showRow(i) {
      current = i;
      var r = rows[i];
      panel.innerHTML = "";
      panel.appendChild(el("div", { class: "ep-top" }, [
        chipFor(r.v),
        el("span", { class: "ep-label", text: r.label || epMonthDay(r.date) }),
        r.flag === "S" ? el("span", { class: "ep-s", text: "S" }) : null,
        closeBtn()
      ]));
      if (r.v === null) panel.appendChild(el("div", { class: "ep-ctx", text: "Not scored." }));
      if (r.what) panel.appendChild(el("p", { class: "ep-what", text: r.what }));
      if (r.ctx) panel.appendChild(el("p", { class: "ep-ctx", text: r.ctx }));
      if (r.flag === "S") panel.appendChild(el("p", { class: "ep-ctx", text: "S: " + epScaleText("S") }));
      panel.appendChild(el("div", { class: "ep-src",
        text: r.src === "app" ? "From the Morning log" : "From the imported log" }));
      var at = scored.indexOf(i);
      var earlier = el("button", { class: "btn raised", type: "button", text: "‹ Earlier",
        onclick: function () { if (at > 0) go(scored[at - 1]); } });
      var later = el("button", { class: "btn raised", type: "button", text: "Later ›",
        onclick: function () { if (at < scored.length - 1) go(scored[at + 1]); } });
      if (at <= 0) earlier.disabled = true;
      if (at >= scored.length - 1) later.disabled = true;
      panel.appendChild(el("div", { class: "ep-steps" }, [earlier, later]));
      mark(i);
      var g = chart.svg.querySelector('.ep-row[data-i="' + i + '"]');
      place(g);
    }
    function go(i) {
      showRow(i);
      var g = chart.svg.querySelector('.ep-row[data-i="' + i + '"]');
      if (g && g.scrollIntoView) g.scrollIntoView({ block: "nearest" });
      panel.scrollIntoView && panel.scrollIntoView({ block: "nearest" });
    }
    function showKey(k, g) {
      current = null; mark(-1);
      panel.innerHTML = "";
      var c = k === "S" ? el("span", { class: "ep-s", text: "S" }) : chipFor(Number(k));
      panel.appendChild(el("div", { class: "ep-top" }, [c, el("span", { class: "ep-label", text: "Scale" }), closeBtn()]));
      panel.appendChild(el("p", { class: "ep-what", text: epScaleText(k) }));
      place(g);
    }
    function showChange(ci, g) {
      current = null; mark(-1);
      var c = changes[ci];
      panel.innerHTML = "";
      panel.appendChild(el("div", { class: "ep-top" }, [
        el("span", { class: "ep-dot" }),
        el("span", { class: "ep-label", text: epMonthDay(c.date) }), closeBtn()]));
      panel.appendChild(el("p", { class: "ep-what", text: c.detail || c.text }));
      panel.appendChild(el("div", { class: "ep-src",
        text: c.src === "app" ? "Added here" : "From the imported log" }));
      place(g);
    }
    chart.svg.addEventListener("click", function (ev) {
      var g = ev.target.closest ? ev.target.closest(".ep-row, .ep-key, .ep-change") : null;
      if (!g) return;
      if (g.classList.contains("ep-key")) { showKey(g.getAttribute("data-key"), g); return; }
      if (g.classList.contains("ep-change")) { showChange(Number(g.getAttribute("data-c")), g); return; }
      var i = Number(g.getAttribute("data-i"));
      if (current === i) close(); else showRow(i);
    });
    chart.svg.addEventListener("keydown", function (ev) {
      if (ev.key !== "Enter" && ev.key !== " ") return;
      ev.preventDefault();
      ev.target.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    wrap.appendChild(el("div", { class: "strip-cap",
      text: "Tap a night, a number or a change for the detail." +
        (epShow.avg ? " The average counts blank nights in the imported log as 0." : "") }));

    var iv = epIntervals(rows);
    if (iv.gaps.length) {
      var lastHigh = iv.dates[iv.dates.length - 1];
      var since = Math.round((new Date(today()) - new Date(lastHigh)) / 864e5);
      wrap.appendChild(el("h2", { class: "section-head ep-gap-head", text: "Gaps between nights of 3 or more" }));
      wrap.appendChild(el("div", { class: "ep-iv", text: iv.gaps.join(" · ") + " days" }));
      wrap.appendChild(el("div", { class: "note-line ep-left",
        text: "Last one " + epMonthDay(lastHigh) + ", " + since + (since === 1 ? " day ago." : " days ago.") }));
    }
}

/* Importing and adding changes are occasional, so they sit folded at the
   foot, one tap away, the same way the RLHF tab handles its forms. */
function epActions(wrap, file) {
  var acts = el("div", { class: "tags ep-acts" });
  [["import", file ? "Imported log" : "Import a log"], ["change", "Add a medication change"]].forEach(function (a) {
    acts.appendChild(el("button", { type: "button", text: a[1],
      "aria-pressed": epOpen === a[0] ? "true" : "false", "aria-expanded": epOpen === a[0] ? "true" : "false",
      onclick: function () { epOpen = epOpen === a[0] ? null : a[0]; render(true); } }));
  });
  wrap.appendChild(acts);

  if (epOpen === "import") {
    var msg = el("div", { class: "msg", style: { display: "none" } });
    var input = el("input", { type: "file", id: "ep-file", class: "hidden-file",
      accept: ".md,.markdown,.txt,.html,.htm,.json,text/markdown,text/plain,text/html,application/json" });
    input.addEventListener("change", function () {
      var f = input.files && input.files[0];
      if (!f) return;
      if (f.size > 2e6) { msg.textContent = "That file is too big to be a log."; msg.style.display = ""; return; }
      var reader = new FileReader();
      reader.onload = function () {
        try {
          var log = epParse(reader.result, f.name);
          log.name = f.name;
          log.importedAt = new Date().toISOString();
          state.episodeLog.file = log;
          saveNow();
          epOpen = null;
          epMsg = "Imported " + log.nights.length + " nights" +
            (log.changes.length ? " and " + log.changes.length + (log.changes.length === 1 ? " change" : " changes") : "") + ".";
          render();
        } catch (err) {
          msg.textContent = err && err.message && !/JSON|Unexpected/.test(err.message)
            ? err.message : "Couldn't read that file.";
          msg.style.display = "";
        }
      };
      reader.readAsText(f);
    });
    wrap.appendChild(input);
    if (file) {
      wrap.appendChild(el("div", { class: "day" }, [
        el("div", { class: "line" }, [
          el("span", { text: file.name }),
          el("span", { class: "meta" }, [
            el("span", { text: file.nights.length + " nights · " + pretty(iso(new Date(file.importedAt))) }),
            el("button", { class: "quiet-btn", type: "button", text: "remove",
              onclick: function () {
                state.episodeLog.file = null; saveNow();
                epMsg = "Imported log removed. Nights logged here are untouched."; render(true);
              }})
          ])
        ])
      ]));
    }
    wrap.appendChild(el("div", { class: "note-line ep-left",
      text: "Read on this phone and kept on it. Nothing is uploaded." }));
    wrap.appendChild(el("label", { class: "btn raised wide file-btn", for: "ep-file",
      text: file ? "Import a newer version" : "Choose a .md, .html or .json file" }));
    if (file) wrap.appendChild(el("div", { class: "note-line ep-left",
      text: "A new file replaces this one. Nights logged here are never touched." }));
    wrap.appendChild(msg);
  }

  if (epOpen === "change") {
    var cDate = el("input", { type: "date", value: today() });
    var cText = el("input", { type: "text", placeholder: "What changed? e.g. new dose, stopped something" });
    var cMsg = el("div", { class: "msg", style: { display: "none" } });
    wrap.appendChild(el("div", { class: "field-label", text: "Day" }));
    wrap.appendChild(cDate);
    wrap.appendChild(el("div", { class: "spacer" }));
    wrap.appendChild(cText);
    wrap.appendChild(el("div", { class: "spacer" }));
    wrap.appendChild(el("button", { class: "btn wide raised", type: "button", text: "Add it",
      onclick: function () {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(cDate.value) || !cText.value.trim()) {
          cMsg.textContent = "A day and a few words, please."; cMsg.style.display = ""; return;
        }
        state.episodeLog.changes = (state.episodeLog.changes || []).concat([{
          id: "m" + Date.now().toString(36), date: cDate.value, text: cText.value.trim().slice(0, 80) }]);
        saveNow();
        epMsg = "Added " + cText.value.trim() + " on " + epMonthDay(cDate.value) + ".";
        render(true);
      }}));
    wrap.appendChild(cMsg);
    (state.episodeLog.changes || []).slice().reverse().forEach(function (c) {
      wrap.appendChild(el("div", { class: "day spend-row" }, [
        el("div", { class: "line" }, [
          el("span", { text: epMonthDay(c.date) + " · " + c.text }),
          el("span", { class: "meta" }, [
            el("button", { class: "quiet-btn spend-remove", type: "button", text: "remove",
              onclick: function () {
                state.episodeLog.changes = state.episodeLog.changes.filter(function (x) { return x.id !== c.id; });
                saveNow(); render(true);
              }})
          ])
        ])
      ]));
    });
  }
}

/* ---------- shell ---------- */

/* Evening and Morning are not permanent tabs. You reach them from Home, and
   the tab only appears while you are on one, so there is a way back. */
var TABS = [["home", "Home"], ["rlhf", "RLHF"], ["history", "History"], ["baseline", "Settings"]];

function renderTabs() {
  var nav = document.getElementById("tabs");
  nav.innerHTML = "";
  var tabs = TABS.slice();
  /* Episodes is a tab for anyone tracking them: shown unless the episode item
     is hidden and nothing has been imported. */
  if (!isHidden("episode") || state.episodeLog.file) tabs.splice(2, 0, ["episodes", "Episodes"]);
  if (state.tab === "evening") tabs.splice(1, 0, ["evening", "Evening"]);
  if (state.tab === "detail") tabs.splice(1, 0, ["detail", "Score"]);
  if (state.tab === "morning") tabs.splice(1, 0, ["morning", "Morning"]);
  /* Six tabs only fit if each takes the width its word needs rather than an
     equal share, at a slightly smaller size. */
  nav.classList.toggle("many", tabs.length > 5);
  tabs.forEach(function (t) {
    nav.appendChild(el("button", {
      type: "button", role: "tab", text: t[1],
      "aria-selected": state.tab === t[0] ? "true" : "false",
      onclick: function () {
        /* Tapping Settings while inside one of its pages comes back out. */
        if (t[0] === "baseline") state.settings = null;
        state.tab = t[0];
        render();
      }
    }));
  });
}

function renderBanner() {
  var b = document.getElementById("banner");
  b.innerHTML = "";
  if (state.storeOk) return;
  b.appendChild(el("div", { class: "banner" }, [
    el("div", { text: "This phone isn't letting the app save. Copy the JSON from History before you close it." }),
    el("div", { class: "small", text: state.storeMsg })
  ]));
}

function render(keepScroll) {
  renderTabs();
  renderBanner();
  var main = document.getElementById("screen");
  main.innerHTML = "";
  if (state.tab === "home") main.appendChild(homeScreen());
  else if (state.tab === "evening") main.appendChild(eveningScreen());
  else if (state.tab === "morning") main.appendChild(morningScreen());
  else if (state.tab === "rlhf") main.appendChild(rewardsScreen());
  else if (state.tab === "detail") main.appendChild(detailScreen());
  else if (state.tab === "baseline") main.appendChild(baselineScreen());
  else if (state.tab === "episodes") main.appendChild(epScreen());
  else main.appendChild(historyScreen());
  if (!keepScroll) window.scrollTo(0, 0);
}

/* ---------- start ---------- */

var startedAt = Date.now();
loadStore();
rebuildItems();
document.getElementById("version").textContent = VERSION;
render();
renderBanner();

/* Dates roll over while the app sits open in the background. Unless you moved
   the date yourself, coming back should land on the current day again. */
var eveDateManual = false, mornDateManual = false;
document.addEventListener("visibilitychange", function () {
  if (document.visibilityState !== "visible") { saveNow(); return; }
  var changed = false;
  if (!eveDateManual && state.eveDate !== today()) { state.eveDate = today(); changed = true; }
  if (!mornDateManual && state.mornDate !== shiftDay(today(), -1)) {
    state.mornDate = shiftDay(today(), -1); changed = true;
  }
  if (changed) render();
});
window.addEventListener("pagehide", function () { saveNow(); });

/* Service worker: offline shell and updates.

   A new build installs in the background whenever the app is opened with a
   connection. If you have not touched anything yet, it swaps itself in and
   reloads on its own within a few seconds of opening. If you are already
   entering a day, it waits and offers a tap in the corner instead, so nothing
   moves under your thumb. */
var touchedThisSession = false;
document.addEventListener("pointerdown", function () { touchedThisSession = true; }, true);

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js", { updateViaCache: "none" }).then(function (reg) {
    function watch(worker) {
      if (!worker) return;
      worker.addEventListener("statechange", function () {
        if (worker.state === "installed" && navigator.serviceWorker.controller) offerUpdate(reg);
      });
    }
    if (reg.waiting && navigator.serviceWorker.controller) offerUpdate(reg);
    watch(reg.installing);
    reg.addEventListener("updatefound", function () { watch(reg.installing); });
    /* Firefox only re-checks on its own once a day. */
    setTimeout(function () { reg.update().catch(function () {}); }, 3000);
  }).catch(function () { /* offline install is best-effort */ });

  var reloading = false;
  navigator.serviceWorker.addEventListener("controllerchange", function () {
    if (reloading) return;
    /* Another window may have swapped the build in. Don't yank this one out
       from under a half-entered day. */
    if (touchedThisSession) { updateButton(null); return; }
    reloading = true;
    location.reload();
  });
}

function offerUpdate(reg) {
  if (!touchedThisSession && Date.now() - startedAt < 20000) {
    saveNow();
    if (reg.waiting) reg.waiting.postMessage("skip-waiting");
    return;
  }
  updateButton(reg);
}

function updateButton(reg) {
  if (document.getElementById("update-btn")) return;
  document.querySelector(".foot").insertBefore(
    el("button", { id: "update-btn", type: "button", text: "new build ready · load it",
      onclick: function () {
        saveNow();
        if (reg && reg.waiting) reg.waiting.postMessage("skip-waiting");
        else location.reload();
      }}),
    document.getElementById("status"));
}
