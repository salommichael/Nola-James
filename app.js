const Storage = window.Storage;

// ============================================================================
//  DONNÉES PAR DÉFAUT
// ============================================================================
const DAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

const DEFAULT_STATE = {
  children: [
    {
      id: "nola", name: "Nola", age: 5, color: "pink", emoji: "🌸", stars: 0,
      durations: { S: 15, M: 60, L: 240 },
      thresholds: { yellow: 1, orange: 2, red: 4 },
      routines: [
        { id: "n1", icon: "🧸", label: "Je range mes jouets / ma chambre" },
        { id: "n2", icon: "🏠", label: "J'aide à la maison" },
        { id: "n3", icon: "🏫", label: "Déposée à l'école sans crise" },
        { id: "n4", icon: "🪥", label: "Je suis autonome (habillage, dents, douche)" },
        { id: "n5", icon: "🎓", label: "Bon retour école / crèche" },
        { id: "n6", icon: "🙂", label: "Je me comporte bien" }
      ]
    },
    {
      id: "james", name: "James", age: 3, color: "blue", emoji: "🚗", stars: 0,
      durations: { S: 10, M: 30, L: 120 },
      thresholds: { yellow: 0.5, orange: 1, red: 2 },
      routines: [
        { id: "j1", icon: "🧸", label: "Je range mes jouets" },
        { id: "j2", icon: "🚽", label: "Je fais pipi / pot" },
        { id: "j3", icon: "👕", label: "Je m'habille ou j'essaie seul" },
        { id: "j4", icon: "🙂", label: "Je suis gentil" },
        { id: "j5", icon: "👂", label: "J'écoute papa / maman" }
      ]
    }
  ],
  punishments: [
    { id: "p1", size: "S", icon: "🙅", label: "Refus (« non », « je n'ai pas envie »)" },
    { id: "p2", size: "S", icon: "🔁", label: "Répéter une consigne + de 2 fois" },
    { id: "p3", size: "S", icon: "📢", label: "Crier / hurler / faire du bruit sans raison" },
    { id: "p4", size: "S", icon: "😤", label: "Râler" },
    { id: "p5", size: "M", icon: "✋", label: "Violence physique (taper, pincer, pousser)" },
    { id: "p6", size: "M", icon: "🤥", label: "Mensonge maintenu" },
    { id: "p6b", size: "S", icon: "🙊", label: "Mensonge avoué" },
    { id: "p7", size: "M", icon: "💔", label: "Blesser quelqu'un avec ses mots" },
    { id: "p8", size: "L", icon: "🖍️", label: "Dessiner sur les murs" },
    { id: "p9", size: "L", icon: "⚠️", label: "Mettre quelqu'un en danger" },
    { id: "p10", size: "L", icon: "🗯️", label: "Insulter ses parents" }
  ],
  rewards: [
    { id: "w1", tier: 1, cost: 2, icon: "🍬", label: "Bonbon" },
    { id: "w2", tier: 1, cost: 3, icon: "📖", label: "Histoire en plus" },
    { id: "w3", tier: 1, cost: 4, icon: "🎲", label: "Jeu avec papa/maman" },
    { id: "w4", tier: 1, cost: 1, icon: "🧸", label: "Moment câlin" },
    { id: "w5", tier: 1, cost: 5, icon: "🎵", label: "Choisir la musique en voiture" },
    { id: "w6", tier: 2, cost: 6, icon: "❤️", label: "Moment seul avec un parent" },
    { id: "w7", tier: 2, cost: 6, icon: "📚", label: "2 histoires" },
    { id: "w8", tier: 2, cost: 8, icon: "🌳", label: "Parc" },
    { id: "w9", tier: 2, cost: 7, icon: "🍝", label: "Choisir le repas" },
    { id: "w10", tier: 2, cost: 9, icon: "⛺", label: "Cabane dans le salon" },
    { id: "w11", tier: 2, cost: 10, icon: "👨‍👩‍👧", label: "Jeu en famille" },
    { id: "w12", tier: 3, cost: 12, icon: "👫", label: "Inviter un copain/copine" },
    { id: "w13", tier: 3, cost: 12, icon: "🍿", label: "Soirée film popcorn" },
    { id: "w14", tier: 3, cost: 15, icon: "🎯", label: "Choisir l'activité du week-end" },
    { id: "w15", tier: 3, cost: 18, icon: "🎁", label: "Sortie surprise" },
    { id: "w16", tier: 3, cost: 20, icon: "🎡", label: "Activité spéciale (Yatoo)" },
    { id: "w17", tier: 3, cost: 16, icon: "🧗", label: "Accrobranche" },
    { id: "w18", tier: 3, cost: 14, icon: "🏊", label: "Piscine" },
    { id: "w19", tier: 3, cost: 13, icon: "🛌", label: "Soirée pyjama" },
    { id: "w20", tier: 3, cost: 11, icon: "🎨", label: "Activité créative" }
  ],
  week: {},            // { weekKey: { childId: { routineId: [7 bool] } } }
  punishmentLog: [],   // journal de punitions (voir structure dans "give")
  session: null,       // séance de purge en cours : { childId, running, runningSince }
  log: [],             // historique étoiles (validations + récompenses)
  migrations: {}       // marqueurs de migration de données déjà appliquées
};

const TIER_INFO = {
  1: { title: "1 à 5 étoiles", sub: "petites récompenses" },
  2: { title: "5 à 10 étoiles", sub: "moments spéciaux" },
  3: { title: "10+ étoiles", sub: "grandes récompenses" }
};

const MOMENTS = { matin: { label: "Matin", h: 9 }, aprem: { label: "Après-midi", h: 14 }, soir: { label: "Soir", h: 20 } };

const EMOJI_BANK = {
  "Étoiles & visages": ["⭐", "🌟", "✨", "🙂", "😀", "😍", "🤗", "😴", "😇", "🥰", "😎", "🤩"],
  "Maison & école": ["🏠", "🛏️", "🧸", "🪥", "🚽", "👕", "🍽️", "🧹", "🎒", "🏫", "🎓", "📚", "📖", "✏️"],
  "Comportement": ["🤝", "🤫", "👂", "🙅", "🔁", "📢", "😤", "✋", "🤥", "💔", "🖍️", "⚠️", "🗯️", "❤️", "🧠"],
  "Activités": ["🎲", "🎵", "🎨", "⚽", "🚲", "🏊", "🧗", "🎡", "🎯", "🌳", "⛺", "🎬", "🍿", "🎮", "🛝"],
  "Récompenses": ["🎁", "🍬", "🍭", "🍦", "🧁", "🍕", "🍝", "🥞", "👫", "👨‍👩‍👧", "🐶", "🦖", "🌈", "🏆"]
};

// ============================================================================
//  ÉTAT
// ============================================================================
let state = null;
let currentTab = "routines";
let selectedChild = "nola";

const child = (id) => state.children.find(c => c.id === id);
function uid() { return "x" + Math.floor(performance.now() * 1000).toString(36) + Math.floor(performance.now() % 1000).toString(36); }
function save() { Storage.save(state); }
function commit() { save(); render(); }

// migration douce
function hydrate(loaded) {
  const base = structuredClone(DEFAULT_STATE);
  if (!loaded) return base;
  const s = { ...base, ...loaded };
  s.week = loaded.week || {};
  s.log = loaded.log || [];
  s.punishmentLog = loaded.punishmentLog || [];
  s.session = loaded.session || null;
  s.punishments = loaded.punishments || base.punishments;
  s.rewards = loaded.rewards || base.rewards;
  s.children = (loaded.children || base.children).map(c => ({
    ...c,
    durations: { S: 15, M: 60, L: 240, ...(c.durations || {}) },
    thresholds: { yellow: 1, orange: 2, red: 4, ...(c.thresholds || {}) }
  }));
  // Migration : mensonge unique → mensonge maintenu (M) + mensonge avoué (S)
  s.migrations = loaded.migrations || {};
  if (!s.migrations.mensonge2) {
    const p6 = s.punishments.find(x => x.id === "p6");
    if (p6 && p6.label === "Mentir et maintenir le mensonge") p6.label = "Mensonge maintenu";
    if (!s.punishments.find(x => x.id === "p6b")) {
      const i = s.punishments.findIndex(x => x.id === "p6");
      s.punishments.splice(i >= 0 ? i + 1 : s.punishments.length, 0, { id: "p6b", size: "S", icon: "🙊", label: "Mensonge avoué" });
    }
    s.migrations.mensonge2 = true;
  }
  return s;
}

// ============================================================================
//  SEMAINE
// ============================================================================
function weekKey(d = new Date()) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = (date.getUTCDay() + 6) % 7;
  date.setUTCDate(date.getUTCDate() - dayNum + 3);
  const firstThursday = new Date(Date.UTC(date.getUTCFullYear(), 0, 4));
  const week = 1 + Math.round(((date - firstThursday) / 86400000 - 3 + ((firstThursday.getUTCDay() + 6) % 7)) / 7);
  return date.getUTCFullYear() + "-S" + String(week).padStart(2, "0");
}
function weekCells(childId) {
  const wk = weekKey();
  state.week[wk] = state.week[wk] || {};
  state.week[wk][childId] = state.week[wk][childId] || {};
  return state.week[wk][childId];
}
function weekTotal(childId) {
  const cells = weekCells(childId);
  let n = 0;
  for (const k in cells) n += cells[k].filter(Boolean).length;
  return n;
}

// ============================================================================
//  PUNITIONS — helpers
// ============================================================================
function orderedPending(childId) {
  return state.punishmentLog
    .filter(e => e.childId === childId && (e.status === "pending" || e.status === "in_progress"))
    .sort((a, b) => a.loggedTs - b.loggedTs);
}
function pendingMin(childId) {
  return orderedPending(childId).reduce((s, e) => s + e.remainingMin, 0);
}
function colorLevel(c) {
  const h = pendingMin(c.id) / 60;
  const t = c.thresholds;
  if (h >= t.red) return "red";
  if (h >= t.orange) return "orange";
  if (h >= t.yellow) return "yellow";
  return "green";
}
function currentMoment() { const h = new Date().getHours(); return h < 12 ? "matin" : h < 18 ? "aprem" : "soir"; }
function todayStr(offset = 0) { const d = new Date(); d.setDate(d.getDate() - offset); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
function makeTs(dateStr, moment) { const d = new Date(dateStr + "T00:00:00"); d.setHours(MOMENTS[moment] ? MOMENTS[moment].h : 12, 0, 0, 0); return d.getTime(); }
function dayOffset(ts) { const d = new Date(ts); d.setHours(0, 0, 0, 0); const t = new Date(); t.setHours(0, 0, 0, 0); return Math.round((t - d) / 86400000); }
function fmtLogged(e) {
  const d = new Date(e.loggedTs);
  const wd = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"][d.getDay()];
  const dd = String(d.getDate()).padStart(2, "0"), mm = String(d.getMonth() + 1).padStart(2, "0");
  const mo = MOMENTS[e.moment] ? MOMENTS[e.moment].label.toLowerCase() : "";
  return `${wd} ${dd}.${mm}${mo ? " · " + mo : ""}`;
}

// applique le temps écoulé de la séance aux punitions (plus ancienne d'abord)
function commitConsumed() {
  const s = state.session;
  if (!s) return;
  let consumed = (s.running && s.runningSince) ? (Date.now() - s.runningSince) / 60000 : 0;
  for (const e of orderedPending(s.childId)) {
    if (consumed <= 0) break;
    if (consumed >= e.remainingMin) {
      consumed -= e.remainingMin;
      e.remainingMin = 0; e.status = "served"; e.servedTs = Date.now();
    } else {
      e.remainingMin = +(e.remainingMin - consumed).toFixed(3); consumed = 0; e.status = "in_progress";
    }
  }
  if (s.running) s.runningSince = Date.now();
}

// ============================================================================
//  RENDU
// ============================================================================
const view = document.getElementById("view");

function render() {
  renderBalances();
  document.querySelectorAll(".tab").forEach(t => t.classList.toggle("active", t.dataset.tab === currentTab));
  if (currentTab === "routines") renderRoutines();
  else if (currentTab === "punitions") renderPunitions();
  else if (currentTab === "recompenses") renderRecompenses();
  else if (currentTab === "reglages") renderReglages();
}

function renderBalances() {
  document.getElementById("balances").innerHTML = state.children.map(c => {
    const total = pendingMin(c.id);
    const punTag = total > 0 ? `<span class="mini-lvl lvl-${colorLevel(c)}">⏳ ${fmtDur(Math.ceil(total))}</span>` : "";
    return `
    <div class="balance-pill">
      <span class="avatar" style="background:${c.color === 'pink' ? 'var(--pink-soft)' : 'var(--blue-soft)'}">${c.emoji}</span>
      <span>${esc(c.name)} <small>${c.age} ans</small><br><span class="stars">⭐ ${c.stars}</span> ${punTag}</span>
    </div>`;
  }).join("");
}

// ---- ROUTINES --------------------------------------------------------------
function renderRoutines() {
  view.innerHTML = `<p class="muted" style="text-align:center">Semaine ${weekKey()} · clique une étoile quand l'enfant réussit</p>` +
    state.children.map(c => {
      const cells = weekCells(c.id);
      const rows = c.routines.map(r => {
        const arr = cells[r.id] || (cells[r.id] = [false, false, false, false, false, false, false]);
        const stars = DAYS.map((_, d) =>
          `<td><button class="star-cell ${arr[d] ? 'on' : ''}" data-act="star" data-child="${c.id}" data-routine="${r.id}" data-day="${d}">★</button></td>`
        ).join("");
        return `<tr><td class="label"><span class="ic">${r.icon}</span>${esc(r.label)}</td>${stars}</tr>`;
      }).join("");
      return `
        <div class="child-card ${c.color}">
          <div class="child-head"><span class="badge">${c.emoji} ${esc(c.name)}</span><span class="age">${c.age} ans</span></div>
          <div class="grid-wrap">
            <table class="routine">
              <thead><tr><th class="label"></th>${DAYS.map(d => `<th class="day">${d}</th>`).join("")}</tr></thead>
              <tbody>${rows}</tbody>
            </table>
          </div>
          <div class="week-bar">
            <span class="week-total">Cette semaine : <b>⭐ ${weekTotal(c.id)}</b></span>
            <button class="btn ${c.color === 'pink' ? 'primary' : 'blue'}" data-act="validate" data-child="${c.id}">✅ Valider la semaine de ${esc(c.name)}</button>
          </div>
        </div>`;
    }).join("");
}

// ---- PUNITIONS -------------------------------------------------------------
function renderPunitions() {
  let html = state.session ? renderSessionPanel() : "";
  html += state.children.map(c => {
    const total = pendingMin(c.id);
    const lvl = colorLevel(c);
    const disabled = (total <= 0 || state.session) ? "disabled" : "";
    return `
      <div class="child-card ${c.color}">
        <div class="child-head">
          <span class="badge">${c.emoji} ${esc(c.name)}</span>
          <span class="lvl-pill lvl-${lvl}">⏳ ${total > 0 ? fmtDur(Math.ceil(total)) : "0 min"} en attente</span>
        </div>
        <button class="btn ${c.color === 'pink' ? 'primary' : 'blue'}" data-act="launch" data-child="${c.id}" ${disabled} style="width:100%">▶️ Lancer la séance de purge</button>
        <h4 class="sec">Donner une punition</h4>
        <div class="pun-list">${pickerCards(c)}</div>
        <h4 class="sec">Journal de ${esc(c.name)}</h4>
        ${journalList(c)}
      </div>`;
  }).join("");
  view.innerHTML = html;
}

function pickerCards(c) {
  return state.punishments.map(p => {
    const dur = c.durations[p.size];
    return `<button class="pun-pick bg-${p.size}" data-act="give" data-child="${c.id}" data-pun="${p.id}">
      <div class="ic">${p.icon}</div>
      <div class="nm">${esc(p.label)}</div>
      <div style="margin-top:6px"><span class="size-tag size-${p.size}">${p.size}</span> <span class="muted">${fmtDur(dur)}</span></div>
    </button>`;
  }).join("");
}

function statusBadge(e) {
  const map = { pending: ["En attente", "st-pending"], in_progress: ["En cours", "st-prog"], served: ["Purgé", "st-served"], pardoned: ["Pardonné", "st-pard"] };
  const [t, cls] = map[e.status] || ["?", ""];
  return `<span class="stbadge ${cls}">${t}</span>`;
}

function journalList(c) {
  const entries = state.punishmentLog.filter(e => e.childId === c.id);
  if (!entries.length) return `<p class="empty">Aucune punition enregistrée 🎉</p>`;
  entries.sort((a, b) => {
    const ga = (a.status === "pending" || a.status === "in_progress") ? 0 : 1;
    const gb = (b.status === "pending" || b.status === "in_progress") ? 0 : 1;
    if (ga !== gb) return ga - gb;
    return ga === 0 ? a.loggedTs - b.loggedTs : b.loggedTs - a.loggedTs;
  });
  return entries.map(journalRow).join("");
}

function journalRow(e) {
  const pending = e.status === "pending" || e.status === "in_progress";
  const actions = pending
    ? `<button class="btn small ghost" data-act="edit-log" data-id="${e.id}">✏️</button>
       <button class="btn small green" data-act="mark-served" data-id="${e.id}">Purgé</button>
       <button class="btn small" style="background:#eee;color:#777" data-act="pardon-log" data-id="${e.id}">Pardon</button>
       <button class="btn small danger" data-act="del-log" data-id="${e.id}">🗑</button>`
    : `<button class="btn small ghost" data-act="edit-log" data-id="${e.id}">✏️</button>
       <button class="btn small danger" data-act="del-log" data-id="${e.id}">🗑</button>`;
  const extra = e.status === "in_progress" ? ` · reste ${fmtDur(Math.ceil(e.remainingMin))}` : "";
  return `<div class="jrow ${e.status}">
    <span class="ic">${e.icon}</span>
    <div class="grow">
      <div><b>${esc(e.typeLabel)}</b> <span class="size-tag size-${e.size}">${e.size}</span> ${e.edited ? '<span class="edited">édité</span>' : ""}</div>
      <div class="muted">${fmtDur(e.durationMin)}${extra} · reçue ${fmtLogged(e)}${e.comment ? " · 💬 " + esc(e.comment) : ""}</div>
    </div>
    ${statusBadge(e)}
    <div class="jactions">${actions}</div>
  </div>`;
}

function renderSessionPanel() {
  const s = state.session;
  const c = child(s.childId);
  const entries = orderedPending(s.childId);
  const total = entries.reduce((a, e) => a + e.remainingMin, 0);
  const done = total <= 0;
  const list = entries.length ? entries.map((e, i) => {
    const pct = Math.min(100, Math.max(0, (e.durationMin - e.remainingMin) / e.durationMin * 100));
    return `
    <div class="sess-row ${i === 0 ? "current" : ""}" data-sess-entry="${e.id}">
      <span class="sess-fill" data-fill style="width:${pct}%"></span>
      <span class="ic">${e.icon}</span>
      <span class="grow"><b>${esc(e.typeLabel)}</b> <span class="size-tag size-${e.size}">${e.size}</span><br><span class="muted">reçue ${fmtLogged(e)}</span></span>
      <span class="rem" data-rem>${fmtDur(Math.ceil(e.remainingMin))}</span>
    </div>`;
  }).join("") : `<p class="empty">Tout est purgé 🎉</p>`;
  const controls = done
    ? `<button class="btn green" data-act="stop-session">✓ Terminer la séance</button>`
    : (s.running
      ? `<button class="btn ghost" data-act="pause-session">⏸ Pause</button> <button class="btn danger" data-act="stop-session">⏹ Arrêter</button>`
      : `<button class="btn green" data-act="resume-session">▶️ Reprendre</button> <button class="btn danger" data-act="stop-session">⏹ Arrêter</button>`);
  const statusTxt = done ? "Terminé ✓" : (s.running ? "En cours…" : "En pause");
  return `<div class="session-panel ${c.color}">
    <h3>⏳ Séance de purge · ${c.emoji} ${esc(c.name)}</h3>
    <div class="sess-total" data-sess-total>${fmtClock(total)}</div>
    <div class="muted" style="text-align:center;margin-bottom:10px">${statusTxt}</div>
    <div class="sess-list">${list}</div>
    <div style="text-align:center;margin-top:14px">${controls}</div>
  </div>`;
}

function tickSession() {
  const s = state.session;
  if (!s) return;
  const entries = orderedPending(s.childId);
  const consumed = (s.running && s.runningSince) ? (Date.now() - s.runningSince) / 60000 : 0;

  // franchissement d'un palier → on enregistre (et on synchronise) une fois
  if (consumed > 0 && entries.length && consumed >= entries[0].remainingMin) {
    commitConsumed(); save();
    if (orderedPending(s.childId).reduce((a, e) => a + e.remainingMin, 0) <= 0) { s.running = false; s.runningSince = null; }
    render();
    return;
  }

  // sinon : mise à jour visuelle uniquement
  const stateTotal = entries.reduce((a, e) => a + e.remainingMin, 0);
  const liveTotal = Math.max(0, stateTotal - consumed);
  const totEl = document.querySelector("[data-sess-total]");
  if (totEl) totEl.textContent = fmtClock(liveTotal);
  let c2 = consumed;
  for (const e of entries) {
    let rem = e.remainingMin;
    if (c2 > 0) { if (c2 >= rem) { c2 -= rem; rem = 0; } else { rem -= c2; c2 = 0; } }
    const el = document.querySelector(`[data-sess-entry="${e.id}"]`);
    if (el) {
      const r = el.querySelector("[data-rem]"); if (r) r.textContent = fmtDur(Math.max(0, Math.ceil(rem)));
      const f = el.querySelector("[data-fill]"); if (f) f.style.width = Math.min(100, Math.max(0, (e.durationMin - rem) / e.durationMin * 100)) + "%";
      if (rem <= 0) el.classList.add("served");
    }
  }
  if (liveTotal <= 0 && s.running) { commitConsumed(); s.running = false; s.runningSince = null; save(); render(); }
}

// ---- RÉCOMPENSES -----------------------------------------------------------
function renderRecompenses() {
  const childBtns = state.children.map(c =>
    `<button class="btn ${c.color === 'pink' ? 'primary' : 'blue'} ${selectedChild === c.id ? '' : 'ghost'}" data-act="select-child" data-child="${c.id}">${c.emoji} ${esc(c.name)} · ⭐${c.stars}</button>`
  ).join(" ");
  const tiers = [1, 2, 3].map(t => {
    const items = state.rewards.filter(r => r.tier === t).map(r => {
      const c = child(selectedChild);
      const locked = !c || c.stars < r.cost;
      return `<button class="reward ${locked ? 'locked' : ''}" data-act="redeem" data-reward="${r.id}" ${locked ? "disabled" : ""}>
        <div class="ic">${r.icon}</div><div class="nm">${esc(r.label)}</div><div class="cost">⭐ ${r.cost}</div>
      </button>`;
    }).join("");
    return `<div class="tier tier-${t}">
      <div class="tier-head">⭐ ${TIER_INFO[t].title} <span class="muted">— ${TIER_INFO[t].sub}</span></div>
      <div class="reward-grid">${items || '<p class="muted">Aucune récompense</p>'}</div>
    </div>`;
  }).join("");
  view.innerHTML = `
    <div style="text-align:center;margin-bottom:16px">
      <p class="muted">Pour qui ?</p>
      <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap">${childBtns}</div>
    </div>${tiers}`;
}

// ---- RÉGLAGES --------------------------------------------------------------
function renderReglages() {
  const childrenBlocks = state.children.map(c => `
    <div class="setting-block">
      <h3>${c.emoji} ${esc(c.name)}</h3>
      <div class="row">
        <button class="ic-btn" data-act="pick-emoji" data-target="child-emoji" data-child="${c.id}">${c.emoji}</button>
        <input type="text" class="grow" value="${esc(c.name)}" data-act="edit-child-name" data-child="${c.id}" />
        <label class="muted">Âge</label>
        <input type="number" class="num" value="${c.age}" data-act="edit-child-age" data-child="${c.id}" />
      </div>
      <div class="field" style="margin-top:10px">
        <label>Durées des punitions (minutes)</label>
        <div class="row" style="border:none">
          <span class="size-tag size-S">S</span><input type="number" class="num" value="${c.durations.S}" data-act="edit-dur" data-child="${c.id}" data-size="S" />
          <span class="size-tag size-M">M</span><input type="number" class="num" value="${c.durations.M}" data-act="edit-dur" data-child="${c.id}" data-size="M" />
          <span class="size-tag size-L">L</span><input type="number" class="num" value="${c.durations.L}" data-act="edit-dur" data-child="${c.id}" data-size="L" />
        </div>
      </div>
      <div class="field">
        <label>Seuils de couleur du stock en attente (en heures)</label>
        <div class="row" style="border:none">
          <span class="lvl-pill lvl-yellow">🟡</span><input type="number" step="0.25" class="num" value="${c.thresholds.yellow}" data-act="edit-thr" data-child="${c.id}" data-lvl="yellow" />
          <span class="lvl-pill lvl-orange">🟠</span><input type="number" step="0.25" class="num" value="${c.thresholds.orange}" data-act="edit-thr" data-child="${c.id}" data-lvl="orange" />
          <span class="lvl-pill lvl-red">🔴</span><input type="number" step="0.25" class="num" value="${c.thresholds.red}" data-act="edit-thr" data-child="${c.id}" data-lvl="red" />
        </div>
        <span class="muted">En dessous du 🟡 = vert. Ex : 🟡 1, 🟠 2, 🔴 4 → rouge dès 4 h de punitions en attente.</span>
      </div>
      <div class="field">
        <label>Étoiles (solde)</label>
        <div class="row" style="border:none">
          <input type="number" class="num" value="${c.stars}" data-act="edit-stars" data-child="${c.id}" />
          <span class="muted">correction manuelle si besoin</span>
        </div>
      </div>
      <label class="muted" style="font-weight:700">Actions de la routine</label>
      ${c.routines.map(r => `
        <div class="row">
          <button class="ic-btn" data-act="pick-emoji" data-target="routine" data-child="${c.id}" data-id="${r.id}">${r.icon}</button>
          <input type="text" class="grow" value="${esc(r.label)}" data-act="edit-routine" data-child="${c.id}" data-id="${r.id}" />
          <button class="btn danger small" data-act="del-routine" data-child="${c.id}" data-id="${r.id}">✕</button>
        </div>`).join("")}
      <button class="btn ghost small" data-act="add-routine" data-child="${c.id}" style="margin-top:8px">+ Ajouter une action</button>
    </div>`).join("");

  const punBlock = `
    <div class="setting-block">
      <h3>⏳ Punitions (catalogue)</h3>
      <p class="muted">Taille S = mineur · M = modéré · L = grave. La durée dépend de l'enfant (réglée ci-dessus). Supprimer un type ici n'efface pas les punitions déjà loggées.</p>
      ${state.punishments.map(p => `
        <div class="row">
          <button class="ic-btn" data-act="pick-emoji" data-target="pun" data-id="${p.id}">${p.icon}</button>
          <input type="text" class="grow" value="${esc(p.label)}" data-act="edit-pun-label" data-id="${p.id}" />
          <select data-act="edit-pun-size" data-id="${p.id}">
            ${["S", "M", "L"].map(s => `<option value="${s}" ${p.size === s ? "selected" : ""}>${s}</option>`).join("")}
          </select>
          <button class="btn danger small" data-act="del-pun" data-id="${p.id}">✕</button>
        </div>`).join("")}
      <button class="btn ghost small" data-act="add-pun" style="margin-top:8px">+ Ajouter une punition</button>
    </div>`;

  const rewBlock = `
    <div class="setting-block">
      <h3>🎁 Récompenses (catalogue)</h3>
      ${state.rewards.map(r => `
        <div class="row">
          <button class="ic-btn" data-act="pick-emoji" data-target="rew" data-id="${r.id}">${r.icon}</button>
          <input type="text" class="grow" value="${esc(r.label)}" data-act="edit-rew-label" data-id="${r.id}" />
          <label class="muted">⭐</label><input type="number" class="num" value="${r.cost}" data-act="edit-rew-cost" data-id="${r.id}" />
          <select data-act="edit-rew-tier" data-id="${r.id}">
            <option value="1" ${r.tier === 1 ? "selected" : ""}>1-5</option>
            <option value="2" ${r.tier === 2 ? "selected" : ""}>5-10</option>
            <option value="3" ${r.tier === 3 ? "selected" : ""}>10+</option>
          </select>
          <button class="btn danger small" data-act="del-rew" data-id="${r.id}">✕</button>
        </div>`).join("")}
      <button class="btn ghost small" data-act="add-rew" style="margin-top:8px">+ Ajouter une récompense</button>
    </div>`;

  const dataBlock = `
    <div class="setting-block">
      <h3>💾 Données</h3>
      <p class="muted">Sauvegarde / restauration manuelle.</p>
      <div class="row" style="border:none">
        <button class="btn ghost small" data-act="export">⬇️ Exporter</button>
        <button class="btn ghost small" data-act="import">⬆️ Importer</button>
        <button class="btn danger small" data-act="reset">🗑️ Tout réinitialiser</button>
      </div>
    </div>`;

  view.innerHTML = childrenBlocks + punBlock + rewBlock + dataBlock;
}

// ============================================================================
//  ACTIONS (clics)
// ============================================================================
view.addEventListener("click", (e) => {
  const el = e.target.closest("[data-act]");
  if (!el) return;
  const a = el.dataset.act;
  const childId = el.dataset.child, id = el.dataset.id;

  if (a === "star") {
    const cells = weekCells(childId);
    const arr = cells[el.dataset.routine] || (cells[el.dataset.routine] = [false, false, false, false, false, false, false]);
    arr[+el.dataset.day] = !arr[+el.dataset.day];
    commit();
  }
  else if (a === "validate") {
    const c = child(childId);
    const won = weekTotal(childId);
    if (won === 0) { toast("Aucune étoile à valider cette semaine"); return; }
    if (!confirm(`Valider la semaine de ${c.name} ?\n${won} ⭐ ajoutées à son solde (total : ${c.stars + won}).\nLe tableau de la semaine sera remis à zéro.`)) return;
    c.stars += won;
    state.log.unshift({ ts: Date.now(), type: "semaine", child: c.name, n: won });
    const wk = weekKey();
    if (state.week[wk]) delete state.week[wk][childId];
    toast(`+${won} ⭐ pour ${c.name} !`);
    commit();
  }
  // ---- Punitions : donner ----
  else if (a === "give") {
    const c = child(childId);
    const p = state.punishments.find(x => x.id === el.dataset.pun);
    const durationMin = c.durations[p.size];
    state.punishmentLog.unshift({
      id: uid(), childId, typeLabel: p.label, icon: p.icon, size: p.size,
      durationMin, remainingMin: durationMin, status: "pending",
      loggedTs: Date.now(), moment: currentMoment(), comment: "", edited: false, servedTs: null
    });
    toast(`Punition enregistrée pour ${c.name} · ${fmtDur(durationMin)}`);
    commit();
  }
  // ---- Punitions : journal ----
  else if (a === "mark-served") openMarkServed(id);
  else if (a === "edit-log") openEditLog(id);
  else if (a === "pardon-log") {
    const ent = state.punishmentLog.find(x => x.id === id);
    ent.status = "pardoned"; ent.remainingMin = 0;
    toast("Punition pardonnée (non comptée)"); commit();
  }
  else if (a === "del-log") {
    if (confirm("Supprimer définitivement cette punition du journal ? (à réserver aux erreurs de saisie)")) {
      state.punishmentLog = state.punishmentLog.filter(x => x.id !== id); commit();
    }
  }
  // ---- Punitions : séance ----
  else if (a === "launch") {
    if (state.session) { toast("Une séance est déjà en cours"); return; }
    if (pendingMin(childId) <= 0) { toast("Rien à purger"); return; }
    state.session = { childId, running: true, runningSince: Date.now() };
    commit();
  }
  else if (a === "pause-session") { commitConsumed(); state.session.running = false; state.session.runningSince = null; commit(); }
  else if (a === "resume-session") { state.session.running = true; state.session.runningSince = Date.now(); commit(); }
  else if (a === "stop-session") { commitConsumed(); state.session = null; commit(); }
  // ---- Récompenses ----
  else if (a === "select-child") { selectedChild = childId; render(); }
  else if (a === "redeem") {
    const r = state.rewards.find(x => x.id === el.dataset.reward);
    const c = child(selectedChild);
    if (!c || c.stars < r.cost) return;
    if (!confirm(`${c.name} échange ${r.cost} ⭐ contre « ${r.label} » ?\nSolde restant : ${c.stars - r.cost} ⭐`)) return;
    c.stars -= r.cost;
    state.log.unshift({ ts: Date.now(), type: "récompense", child: c.name, label: r.label, n: -r.cost });
    toast(`🎁 ${r.label} pour ${c.name} !`);
    commit();
  }
  // ---- Réglages ----
  else if (a === "add-routine") { child(childId).routines.push({ id: uid(), icon: "⭐", label: "Nouvelle action" }); commit(); }
  else if (a === "del-routine") { const c = child(childId); c.routines = c.routines.filter(r => r.id !== id); commit(); }
  else if (a === "add-pun") { state.punishments.push({ id: uid(), size: "S", icon: "⚠️", label: "Nouveau comportement" }); commit(); }
  else if (a === "del-pun") { state.punishments = state.punishments.filter(p => p.id !== id); commit(); }
  else if (a === "add-rew") { state.rewards.push({ id: uid(), tier: 1, cost: 3, icon: "🎁", label: "Nouvelle récompense" }); commit(); }
  else if (a === "del-rew") { state.rewards = state.rewards.filter(r => r.id !== id); commit(); }
  else if (a === "pick-emoji") openEmojiPicker(el.dataset);
  else if (a === "export") doExport();
  else if (a === "import") doImport();
  else if (a === "reset") { if (confirm("Tout réinitialiser ? Étoiles, journal et config effacés.")) { state = structuredClone(DEFAULT_STATE); commit(); } }
});

// inputs (change)
view.addEventListener("change", (e) => {
  const el = e.target.closest("[data-act]");
  if (!el) return;
  const a = el.dataset.act, id = el.dataset.id, childId = el.dataset.child;
  const c = () => child(childId);
  if (a === "edit-child-name") c().name = el.value;
  else if (a === "edit-child-age") c().age = +el.value || 0;
  else if (a === "edit-dur") c().durations[el.dataset.size] = +el.value || 0;
  else if (a === "edit-thr") { c().thresholds[el.dataset.lvl] = +el.value || 0; save(); renderBalances(); return; }
  else if (a === "edit-stars") c().stars = +el.value || 0;
  else if (a === "edit-routine") c().routines.find(r => r.id === id).label = el.value;
  else if (a === "edit-pun-label") state.punishments.find(p => p.id === id).label = el.value;
  else if (a === "edit-pun-size") state.punishments.find(p => p.id === id).size = el.value;
  else if (a === "edit-rew-label") state.rewards.find(r => r.id === id).label = el.value;
  else if (a === "edit-rew-cost") state.rewards.find(r => r.id === id).cost = +el.value || 0;
  else if (a === "edit-rew-tier") state.rewards.find(r => r.id === id).tier = +el.value;
  else return;
  save();
  if (a === "edit-child-name" || a === "edit-stars") renderBalances();
});

// ============================================================================
//  MODALE + PICKER EMOJI
// ============================================================================
const modal = document.getElementById("modal");
const modalContent = document.getElementById("modal-content");
document.getElementById("modal-close").onclick = closeModal;
modal.addEventListener("click", e => { if (e.target === modal) closeModal(); });
function closeModal() { modal.classList.add("hidden"); }
function openModal(html) { modalContent.innerHTML = html; modal.classList.remove("hidden"); }
function segSelect(wrap, onChange) {
  wrap.querySelectorAll("button").forEach(b => b.onclick = () => {
    wrap.querySelectorAll("button").forEach(x => x.classList.remove("on"));
    b.classList.add("on");
    if (onChange) onChange(b.dataset.v);
  });
}

function openEmojiPicker(ds) {
  const cats = Object.entries(EMOJI_BANK).map(([cat, list]) =>
    `<div class="emoji-cat">${cat}</div><div class="emoji-grid">${list.map(em => `<button data-em="${em}">${em}</button>`).join("")}</div>`).join("");
  openModal(`<h3>Choisir une icône</h3>${cats}`);
  modalContent.querySelectorAll("[data-em]").forEach(b => b.onclick = () => { applyEmoji(ds, b.dataset.em); closeModal(); });
}
function applyEmoji(ds, em) {
  const { target, child: cid, id } = ds;
  if (target === "child-emoji") child(cid).emoji = em;
  else if (target === "routine") child(cid).routines.find(r => r.id === id).icon = em;
  else if (target === "pun") state.punishments.find(p => p.id === id).icon = em;
  else if (target === "rew") state.rewards.find(r => r.id === id).icon = em;
  commit();
}

// ---- Pop-up "marquer purgé" (jour + moment) ----
function openMarkServed(id) {
  openModal(`<h3>Marquer comme purgé</h3>
    <p class="muted">Quand cette punition a-t-elle été faite ?</p>
    <div class="field"><label>Jour</label>
      <div class="seg" id="ms-day"><button data-v="0" class="on">Aujourd'hui</button><button data-v="1">Hier</button><button data-v="2">Avant-hier</button></div>
    </div>
    <div class="field"><label>Moment</label>
      <div class="seg" id="ms-moment"><button data-v="matin">Matin</button><button data-v="aprem" class="on">Après-midi</button><button data-v="soir">Soir</button></div>
    </div>
    <button class="btn green" id="ms-ok" style="width:100%">Confirmer purgé</button>`);
  const dayW = modalContent.querySelector("#ms-day"), momW = modalContent.querySelector("#ms-moment");
  segSelect(dayW); segSelect(momW);
  modalContent.querySelector("#ms-ok").onclick = () => {
    const off = +dayW.querySelector(".on").dataset.v, mom = momW.querySelector(".on").dataset.v;
    const ent = state.punishmentLog.find(x => x.id === id);
    ent.status = "served"; ent.remainingMin = 0; ent.servedTs = makeTs(todayStr(off), mom);
    closeModal(); toast("Punition marquée purgée"); commit();
  };
}

// ---- Pop-up édition d'une ligne du journal ----
function openEditLog(id) {
  const e = state.punishmentLog.find(x => x.id === id);
  const off = dayOffset(e.loggedTs);
  const dayBtns = [["0", "Aujourd'hui"], ["1", "Hier"], ["2", "Avant-hier"], ["-1", "Autre date"]]
    .map(([v, t]) => `<button data-v="${v}" class="${(off >= 0 && off <= 2 ? off : -1) == v ? "on" : ""}">${t}</button>`).join("");
  const momBtns = Object.entries(MOMENTS).map(([k, m]) => `<button data-v="${k}" class="${e.moment === k ? "on" : ""}">${m.label}</button>`).join("");
  const dateStr = todayStr(off >= 0 ? off : 0);
  openModal(`<h3>Modifier la punition</h3>
    <div class="field"><label>Type</label><input id="el-type" type="text" value="${esc(e.typeLabel)}"></div>
    <div class="field"><label>Taille</label><select id="el-size">${["S", "M", "L"].map(s => `<option value="${s}" ${e.size === s ? "selected" : ""}>${s}</option>`).join("")}</select></div>
    <div class="field"><label>Temps (minutes)</label><input id="el-dur" type="number" value="${e.durationMin}"></div>
    <div class="field"><label>Jour de saisie</label>
      <div class="seg" id="el-day">${dayBtns}</div>
      <input id="el-date" type="date" value="${new Date(e.loggedTs).toISOString().slice(0,10)}" style="margin-top:8px;${off >= 0 && off <= 2 ? "display:none" : ""}">
    </div>
    <div class="field"><label>Moment</label><div class="seg" id="el-moment">${momBtns}</div></div>
    <div class="field"><label>Commentaire</label><textarea id="el-comment" rows="2">${esc(e.comment || "")}</textarea></div>
    <button class="btn primary" id="el-ok" style="width:100%">Enregistrer</button>`);
  const dayW = modalContent.querySelector("#el-day"), dateI = modalContent.querySelector("#el-date");
  segSelect(dayW, (v) => { dateI.style.display = v === "-1" ? "block" : "none"; });
  segSelect(modalContent.querySelector("#el-moment"));
  modalContent.querySelector("#el-ok").onclick = () => {
    const v = dayW.querySelector(".on").dataset.v;
    const mom = modalContent.querySelector("#el-moment .on").dataset.v;
    const ds = v === "-1" ? (dateI.value || todayStr(0)) : todayStr(+v);
    e.typeLabel = modalContent.querySelector("#el-type").value || e.typeLabel;
    e.size = modalContent.querySelector("#el-size").value;
    const nd = +modalContent.querySelector("#el-dur").value || 0;
    if (e.status === "pending" || e.status === "in_progress") e.remainingMin = nd;
    e.durationMin = nd;
    e.loggedTs = makeTs(ds, mom); e.moment = mom;
    e.comment = modalContent.querySelector("#el-comment").value.trim();
    e.edited = true;
    closeModal(); toast("Punition modifiée"); commit();
  };
}

// ============================================================================
//  IMPORT / EXPORT
// ============================================================================
function doExport() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "etoiles-nola-james.json"; a.click();
  URL.revokeObjectURL(url);
}
function doImport() {
  const input = document.createElement("input");
  input.type = "file"; input.accept = "application/json";
  input.onchange = () => {
    const f = input.files[0]; if (!f) return;
    const reader = new FileReader();
    reader.onload = () => { try { state = hydrate(JSON.parse(reader.result)); commit(); toast("Données importées ✓"); } catch (e) { toast("Fichier invalide"); } };
    reader.readAsText(f);
  };
  input.click();
}

// ============================================================================
//  UTILITAIRES
// ============================================================================
function fmtDur(min) {
  min = Math.round(min);
  if (min >= 60) { const h = Math.floor(min / 60), m = min % 60; return h + "h" + (m ? String(m).padStart(2, "0") : ""); }
  return min + " min";
}
function fmtClock(min) {
  let s = Math.max(0, Math.round(min * 60));
  const h = Math.floor(s / 3600); s -= h * 3600;
  const m = Math.floor(s / 60); s -= m * 60;
  return (h ? h + ":" : "") + String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
}
function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;"); }
let toastTimer;
function toast(msg) {
  document.querySelector(".toast")?.remove();
  const t = document.createElement("div");
  t.className = "toast"; t.textContent = msg;
  document.body.appendChild(t);
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.remove(), 2200);
}

// ============================================================================
//  NAVIGATION + DÉMARRAGE
// ============================================================================
document.getElementById("tabs").addEventListener("click", e => {
  const b = e.target.closest(".tab"); if (!b) return;
  currentTab = b.dataset.tab; render();
});

(async function start() {
  const loaded = await Storage.init((remote) => { state = hydrate(remote); render(); });
  state = hydrate(loaded);
  render();
  save(); // fixe les migrations appliquées
  setInterval(tickSession, 1000);
})();
