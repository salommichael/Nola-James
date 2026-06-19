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
    { id: "p6", size: "M", icon: "🤥", label: "Mentir et maintenir le mensonge" },
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
  activePunishments: [], // { id, childId, punishmentId, label, size, icon, startTs, durationMin }
  log: []              // historique
};

const TIER_INFO = {
  1: { title: "1 à 5 étoiles", sub: "petites récompenses" },
  2: { title: "5 à 10 étoiles", sub: "moments spéciaux" },
  3: { title: "10+ étoiles", sub: "grandes récompenses" }
};

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

function uid() { return "x" + Math.floor(performance.now() * 1000).toString(36) + Math.floor(performance.now() % 1000).toString(36); }

function save() { Storage.save(state); }

function commit() { save(); render(); }

// migration douce : fusionne l'état chargé avec les défauts manquants
function hydrate(loaded) {
  if (!loaded) return structuredClone(DEFAULT_STATE);
  const base = structuredClone(DEFAULT_STATE);
  return {
    ...base,
    ...loaded,
    week: loaded.week || {},
    activePunishments: loaded.activePunishments || [],
    log: loaded.log || []
  };
}

// ============================================================================
//  SEMAINE
// ============================================================================
function weekKey(d = new Date()) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = (date.getUTCDay() + 6) % 7; // lundi = 0
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
  document.getElementById("balances").innerHTML = state.children.map(c => `
    <div class="balance-pill">
      <span class="avatar ${c.color === 'pink' ? '' : ''}" style="background:${c.color === 'pink' ? 'var(--pink-soft)' : 'var(--blue-soft)'}">${c.emoji}</span>
      <span>${c.name} <small>${c.age} ans</small><br><span class="stars">⭐ ${c.stars}</span></span>
    </div>`).join("");
}

// ---- ROUTINES --------------------------------------------------------------
function renderRoutines() {
  view.innerHTML = `<p class="muted" style="text-align:center">Semaine ${weekKey()} · clique une étoile quand l'enfant réussit</p>` +
    state.children.map(c => {
      const cells = weekCells(c.id);
      const rows = c.routines.map(r => {
        const arr = cells[r.id] || (cells[r.id] = [false,false,false,false,false,false,false]);
        const stars = DAYS.map((_, d) =>
          `<td><button class="star-cell ${arr[d] ? 'on' : ''}" data-act="star" data-child="${c.id}" data-routine="${r.id}" data-day="${d}">★</button></td>`
        ).join("");
        return `<tr><td class="label"><span class="ic">${r.icon}</span>${r.label}</td>${stars}</tr>`;
      }).join("");
      return `
        <div class="child-card ${c.color}">
          <div class="child-head"><span class="badge">${c.emoji} ${c.name}</span><span class="age">${c.age} ans</span></div>
          <div class="grid-wrap">
            <table class="routine">
              <thead><tr><th class="label"></th>${DAYS.map(d => `<th class="day">${d}</th>`).join("")}</tr></thead>
              <tbody>${rows}</tbody>
            </table>
          </div>
          <div class="week-bar">
            <span class="week-total">Cette semaine : <b>⭐ ${weekTotal(c.id)}</b></span>
            <button class="btn ${c.color === 'pink' ? 'primary' : 'blue'}" data-act="validate" data-child="${c.id}">✅ Valider la semaine de ${c.name}</button>
          </div>
        </div>`;
    }).join("");
}

// ---- PUNITIONS -------------------------------------------------------------
function renderPunitions() {
  const actives = state.activePunishments;
  const activeHtml = actives.length ? actives.map(renderActivePun).join("") :
    `<p class="empty">Aucune punition en cours 🎉</p>`;

  const picker = state.children.map(c => {
    const cards = state.punishments.map(p => {
      const dur = c.durations[p.size];
      return `<button class="pun-pick" data-act="apply" data-child="${c.id}" data-pun="${p.id}" style="border-color:${c.color === 'pink' ? 'var(--pink)' : 'var(--blue)'}">
        <div class="ic">${p.icon}</div>
        <div class="nm">${p.label}</div>
        <div style="margin-top:6px"><span class="size-tag size-${p.size}">${p.size}</span> <span class="muted">${fmtDur(dur)}</span></div>
      </button>`;
    }).join("");
    return `<div class="setting-block">
      <h3>${c.emoji} Donner une punition à ${c.name}</h3>
      <div class="pun-list">${cards}</div>
    </div>`;
  }).join("");

  view.innerHTML = `
    <div class="setting-block">
      <h3>⏳ Punitions en cours</h3>
      ${activeHtml}
    </div>
    ${picker}`;
}

function renderActivePun(a) {
  const c = state.children.find(x => x.id === a.childId);
  return `<div class="active-pun" data-id="${a.id}">
    <span class="ic">${a.icon}</span>
    <div class="grow">
      <div><b>${c ? c.name : "?"}</b> · ${a.label} <span class="size-tag size-${a.size}">${a.size}</span></div>
      <div class="meta" data-meta>—</div>
    </div>
    <div class="timer" data-timer>—</div>
    <button class="btn danger small" data-act="stop-pun" data-id="${a.id}">Terminer</button>
  </div>`;
}

function tickTimers() {
  const now = Date.now();
  document.querySelectorAll(".active-pun").forEach(el => {
    const a = state.activePunishments.find(x => x.id === el.dataset.id);
    if (!a) return;
    const end = a.startTs + a.durationMin * 60000;
    const remain = end - now;
    const t = el.querySelector("[data-timer]");
    const m = el.querySelector("[data-meta]");
    if (remain <= 0) {
      el.classList.add("done");
      t.classList.add("done");
      t.textContent = "Terminé ✓";
      if (m) m.textContent = "Durée : " + fmtDur(a.durationMin);
    } else {
      const s = Math.floor(remain / 1000);
      const hh = Math.floor(s / 3600), mm = Math.floor((s % 3600) / 60), ss = s % 60;
      t.textContent = (hh ? hh + ":" : "") + String(mm).padStart(2, "0") + ":" + String(ss).padStart(2, "0");
      if (m) m.textContent = "Durée totale : " + fmtDur(a.durationMin);
    }
  });
}

// ---- RÉCOMPENSES -----------------------------------------------------------
function renderRecompenses() {
  const childBtns = state.children.map((c, i) =>
    `<button class="btn ${c.color === 'pink' ? 'primary' : 'blue'} ${selectedChild === c.id ? '' : 'ghost'}" data-act="select-child" data-child="${c.id}">${c.emoji} ${c.name} · ⭐${c.stars}</button>`
  ).join(" ");

  const tiers = [1, 2, 3].map(t => {
    const items = state.rewards.filter(r => r.tier === t).map(r => {
      const child = state.children.find(c => c.id === selectedChild);
      const locked = !child || child.stars < r.cost;
      return `<button class="reward ${locked ? 'locked' : ''}" data-act="redeem" data-reward="${r.id}" ${locked ? "disabled" : ""}>
        <div class="ic">${r.icon}</div>
        <div class="nm">${r.label}</div>
        <div class="cost">⭐ ${r.cost}</div>
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
    </div>
    ${tiers}`;
}
let selectedChild = "nola";

// ---- RÉGLAGES --------------------------------------------------------------
function renderReglages() {
  const childrenBlocks = state.children.map(c => `
    <div class="setting-block">
      <h3>${c.emoji} ${c.name}</h3>
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
        <label>Étoiles (solde)</label>
        <div class="row" style="border:none">
          <input type="number" class="num" value="${c.stars}" data-act="edit-stars" data-child="${c.id}" />
          <span class="muted">tu peux corriger le solde à la main si besoin</span>
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
      <p class="muted">Taille S = mineur · M = modéré · L = grave. La durée dépend de l'enfant (réglée ci-dessus).</p>
      ${state.punishments.map(p => `
        <div class="row">
          <button class="ic-btn" data-act="pick-emoji" data-target="pun" data-id="${p.id}">${p.icon}</button>
          <input type="text" class="grow" value="${esc(p.label)}" data-act="edit-pun-label" data-id="${p.id}" />
          <select data-act="edit-pun-size" data-id="${p.id}">
            ${["S","M","L"].map(s => `<option value="${s}" ${p.size === s ? "selected" : ""}>${s}</option>`).join("")}
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
            <option value="1" ${r.tier===1?"selected":""}>1-5</option>
            <option value="2" ${r.tier===2?"selected":""}>5-10</option>
            <option value="3" ${r.tier===3?"selected":""}>10+</option>
          </select>
          <button class="btn danger small" data-act="del-rew" data-id="${r.id}">✕</button>
        </div>`).join("")}
      <button class="btn ghost small" data-act="add-rew" style="margin-top:8px">+ Ajouter une récompense</button>
    </div>`;

  const dataBlock = `
    <div class="setting-block">
      <h3>💾 Données</h3>
      <p class="muted">Sauvegarde / restauration manuelle (utile avant d'activer la synchro, ou pour changer d'appareil).</p>
      <div class="row" style="border:none">
        <button class="btn ghost small" data-act="export">⬇️ Exporter</button>
        <button class="btn ghost small" data-act="import">⬆️ Importer</button>
        <button class="btn danger small" data-act="reset">🗑️ Tout réinitialiser</button>
      </div>
    </div>`;

  view.innerHTML = childrenBlocks + punBlock + rewBlock + dataBlock;
}

// ============================================================================
//  ACTIONS (délégation d'événements)
// ============================================================================
view.addEventListener("click", (e) => {
  const el = e.target.closest("[data-act]");
  if (!el) return;
  const a = el.dataset.act;
  const childId = el.dataset.child, id = el.dataset.id;

  if (a === "star") {
    const cells = weekCells(childId);
    const arr = cells[el.dataset.routine] || (cells[el.dataset.routine] = [false,false,false,false,false,false,false]);
    arr[+el.dataset.day] = !arr[+el.dataset.day];
    commit();
  }
  else if (a === "validate") {
    const c = state.children.find(x => x.id === childId);
    const won = weekTotal(childId);
    if (won === 0) { toast("Aucune étoile à valider cette semaine"); return; }
    if (!confirm(`Valider la semaine de ${c.name} ?\n${won} ⭐ seront ajoutées à son solde (total : ${c.stars + won}).\nLe tableau de la semaine sera remis à zéro.`)) return;
    c.stars += won;
    state.log.unshift({ ts: Date.now(), type: "semaine", child: c.name, n: won });
    const wk = weekKey();
    if (state.week[wk]) delete state.week[wk][childId];
    toast(`+${won} ⭐ pour ${c.name} !`);
    commit();
  }
  else if (a === "apply") {
    const c = state.children.find(x => x.id === childId);
    const p = state.punishments.find(x => x.id === el.dataset.pun);
    let durationMin = c.durations[p.size];
    let label = p.label;
    if (p.size === "M") {
      if (confirm(`${p.label}\n\nA-t-elle/il dit la VÉRITÉ immédiatement ?\n\nOK = oui → durée réduite à ${fmtDur(c.durations.S)}\nAnnuler = non → ${fmtDur(durationMin)}`)) {
        durationMin = c.durations.S;
        label += " (vérité immédiate)";
      }
    }
    state.activePunishments.unshift({
      id: uid(), childId, punishmentId: p.id, label, size: p.size, icon: p.icon,
      startTs: Date.now(), durationMin
    });
    state.log.unshift({ ts: Date.now(), type: "punition", child: c.name, label, dur: durationMin });
    toast(`Punition lancée pour ${c.name} · ${fmtDur(durationMin)}`);
    currentTab = "punitions";
    commit();
  }
  else if (a === "stop-pun") {
    state.activePunishments = state.activePunishments.filter(x => x.id !== id);
    commit();
  }
  else if (a === "select-child") { selectedChild = childId; render(); }
  else if (a === "redeem") {
    const r = state.rewards.find(x => x.id === el.dataset.reward);
    const c = state.children.find(x => x.id === selectedChild);
    if (!c || c.stars < r.cost) return;
    if (!confirm(`${c.name} échange ${r.cost} ⭐ contre « ${r.label} » ?\nSolde restant : ${c.stars - r.cost} ⭐`)) return;
    c.stars -= r.cost;
    state.log.unshift({ ts: Date.now(), type: "récompense", child: c.name, label: r.label, n: -r.cost });
    toast(`🎁 ${r.label} pour ${c.name} !`);
    commit();
  }
  // ---- Réglages ----
  else if (a === "add-routine") {
    const c = state.children.find(x => x.id === childId);
    c.routines.push({ id: uid(), icon: "⭐", label: "Nouvelle action" });
    commit();
  }
  else if (a === "del-routine") {
    const c = state.children.find(x => x.id === childId);
    c.routines = c.routines.filter(r => r.id !== id);
    commit();
  }
  else if (a === "add-pun") { state.punishments.push({ id: uid(), size: "S", icon: "⚠️", label: "Nouveau comportement" }); commit(); }
  else if (a === "del-pun") { state.punishments = state.punishments.filter(p => p.id !== id); commit(); }
  else if (a === "add-rew") { state.rewards.push({ id: uid(), tier: 1, cost: 3, icon: "🎁", label: "Nouvelle récompense" }); commit(); }
  else if (a === "del-rew") { state.rewards = state.rewards.filter(r => r.id !== id); commit(); }
  else if (a === "pick-emoji") { openEmojiPicker(el.dataset); }
  else if (a === "export") doExport();
  else if (a === "import") doImport();
  else if (a === "reset") {
    if (confirm("Tout réinitialiser ? Les étoiles, l'historique et la config seront effacés.")) {
      state = structuredClone(DEFAULT_STATE); commit();
    }
  }
});

// inputs (change)
view.addEventListener("change", (e) => {
  const el = e.target.closest("[data-act]");
  if (!el) return;
  const a = el.dataset.act, id = el.dataset.id, childId = el.dataset.child;
  const c = () => state.children.find(x => x.id === childId);
  if (a === "edit-child-name") c().name = el.value;
  else if (a === "edit-child-age") c().age = +el.value || 0;
  else if (a === "edit-dur") c().durations[el.dataset.size] = +el.value || 0;
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
//  PICKER EMOJI + MODALE
// ============================================================================
const modal = document.getElementById("modal");
const modalContent = document.getElementById("modal-content");
document.getElementById("modal-close").onclick = closeModal;
modal.addEventListener("click", e => { if (e.target === modal) closeModal(); });
function closeModal() { modal.classList.add("hidden"); }
function openModal(html) { modalContent.innerHTML = html; modal.classList.remove("hidden"); }

function openEmojiPicker(ds) {
  const cats = Object.entries(EMOJI_BANK).map(([cat, list]) =>
    `<div class="emoji-cat">${cat}</div><div class="emoji-grid">${list.map(em =>
      `<button data-em="${em}">${em}</button>`).join("")}</div>`).join("");
  openModal(`<h3>Choisir une icône</h3>${cats}`);
  modalContent.querySelectorAll("[data-em]").forEach(b => {
    b.onclick = () => { applyEmoji(ds, b.dataset.em); closeModal(); };
  });
}

function applyEmoji(ds, em) {
  const { target, child, id } = ds;
  if (target === "child-emoji") state.children.find(c => c.id === child).emoji = em;
  else if (target === "routine") state.children.find(c => c.id === child).routines.find(r => r.id === id).icon = em;
  else if (target === "pun") state.punishments.find(p => p.id === id).icon = em;
  else if (target === "rew") state.rewards.find(r => r.id === id).icon = em;
  commit();
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
    reader.onload = () => {
      try { state = hydrate(JSON.parse(reader.result)); commit(); toast("Données importées ✓"); }
      catch (e) { toast("Fichier invalide"); }
    };
    reader.readAsText(f);
  };
  input.click();
}

// ============================================================================
//  UTILITAIRES
// ============================================================================
function fmtDur(min) {
  if (min >= 60) { const h = Math.floor(min / 60), m = min % 60; return h + "h" + (m ? String(m).padStart(2, "0") : ""); }
  return min + " min";
}
function esc(s) { return String(s).replace(/"/g, "&quot;").replace(/</g, "&lt;"); }
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
  const loaded = await Storage.init((remote) => {
    state = hydrate(remote); render();
  });
  state = hydrate(loaded);
  render();
  setInterval(tickTimers, 1000);
})();
