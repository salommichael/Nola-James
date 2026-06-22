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
  starHistory: {},     // { weekKey: { childId: { total, ts, byRoutine: { id: {label, count} } } } }
  punishmentLog: [],   // journal de punitions (voir structure dans "give")
  sessions: {},        // sabliers en cours : { childId: { running, runningSince } }
  log: [],             // historique étoiles (validations + récompenses)
  parents: ["Papa", "Maman"], // profils (qui met la punition) ; le choix courant est local à l'appareil
  migrations: {}       // marqueurs de migration de données déjà appliquées
};

const TIER_INFO = {
  1: { title: "1 à 5 étoiles", sub: "petites récompenses" },
  2: { title: "6 à 10 étoiles", sub: "moments spéciaux" },
  3: { title: "11+ étoiles", sub: "grandes récompenses" }
};

const MOMENTS = { matin: { label: "Matin", h: 9 }, aprem: { label: "Après-midi", h: 14 }, soir: { label: "Soir", h: 20 } };

// Banque d'emojis avec mots-clés (pour la recherche). c = catégorie.
const EMOJI_DATA = [
  // Étoiles & visages
  { e: "⭐", k: "etoile star recompense", c: "Étoiles & visages" },
  { e: "🌟", k: "etoile brillante star", c: "Étoiles & visages" },
  { e: "✨", k: "etincelles paillettes magie", c: "Étoiles & visages" },
  { e: "🙂", k: "sourire content visage", c: "Étoiles & visages" },
  { e: "😀", k: "sourire joie content visage", c: "Étoiles & visages" },
  { e: "😍", k: "amour yeux coeur content", c: "Étoiles & visages" },
  { e: "🥰", k: "amour calin coeur content", c: "Étoiles & visages" },
  { e: "🤗", k: "calin bras content", c: "Étoiles & visages" },
  { e: "😴", k: "dormir sommeil fatigue dodo", c: "Étoiles & visages" },
  { e: "😇", k: "ange sage gentil", c: "Étoiles & visages" },
  { e: "😎", k: "cool lunettes", c: "Étoiles & visages" },
  { e: "🤩", k: "wow etoile admiratif", c: "Étoiles & visages" },
  { e: "😢", k: "triste pleure larme", c: "Étoiles & visages" },
  { e: "😡", k: "colere fache enerve rouge", c: "Étoiles & visages" },
  { e: "😱", k: "peur cri choc", c: "Étoiles & visages" },
  { e: "🥳", k: "fete anniversaire content", c: "Étoiles & visages" },
  // Maison & école
  { e: "🏠", k: "maison home", c: "Maison & école" },
  { e: "🛏️", k: "lit dormir chambre dodo", c: "Maison & école" },
  { e: "🧸", k: "ours nounours peluche jouet", c: "Maison & école" },
  { e: "🪥", k: "brosse dents hygiene", c: "Maison & école" },
  { e: "🛁", k: "bain douche propre", c: "Maison & école" },
  { e: "🚽", k: "toilette pot pipi wc", c: "Maison & école" },
  { e: "👕", k: "habit tshirt vetement habiller", c: "Maison & école" },
  { e: "🧦", k: "chaussette habiller vetement", c: "Maison & école" },
  { e: "🍽️", k: "assiette repas manger table", c: "Maison & école" },
  { e: "🧹", k: "balai ranger menage nettoyer", c: "Maison & école" },
  { e: "🧺", k: "linge panier ranger", c: "Maison & école" },
  { e: "🎒", k: "sac ecole cartable", c: "Maison & école" },
  { e: "🏫", k: "ecole creche batiment", c: "Maison & école" },
  { e: "🎓", k: "diplome ecole reussite", c: "Maison & école" },
  { e: "📚", k: "livres lecture histoire ecole", c: "Maison & école" },
  { e: "📖", k: "livre histoire lecture", c: "Maison & école" },
  { e: "✏️", k: "crayon ecrire dessiner ecole", c: "Maison & école" },
  // Comportement
  { e: "🤝", k: "partage main accord gentil", c: "Comportement" },
  { e: "🤫", k: "silence chut calme", c: "Comportement" },
  { e: "👂", k: "ecouter oreille obeir", c: "Comportement" },
  { e: "🙅", k: "non refus interdit stop", c: "Comportement" },
  { e: "🔁", k: "repeter consigne encore", c: "Comportement" },
  { e: "📢", k: "crier hurler bruit fort", c: "Comportement" },
  { e: "😤", k: "raler ronchon enerve souffle", c: "Comportement" },
  { e: "✋", k: "taper main violence stop", c: "Comportement" },
  { e: "🤥", k: "mensonge mentir nez", c: "Comportement" },
  { e: "🙊", k: "avouer singe bouche secret", c: "Comportement" },
  { e: "💔", k: "blesser coeur mots tristesse", c: "Comportement" },
  { e: "🖍️", k: "dessiner mur crayon feutre", c: "Comportement" },
  { e: "⚠️", k: "danger attention avertissement", c: "Comportement" },
  { e: "🗯️", k: "insulte cri colere bulle", c: "Comportement" },
  { e: "❤️", k: "coeur amour calin", c: "Comportement" },
  { e: "🧠", k: "cerveau reflechir penser", c: "Comportement" },
  { e: "⏳", k: "sablier temps attendre minuteur", c: "Comportement" },
  // Activités & sport
  { e: "🎲", k: "jeu de societe des jouer", c: "Activités & sport" },
  { e: "🎵", k: "musique chanson note", c: "Activités & sport" },
  { e: "🎨", k: "peinture dessin art creatif", c: "Activités & sport" },
  { e: "⚽", k: "foot ballon sport jouer", c: "Activités & sport" },
  { e: "🏀", k: "basket ballon sport", c: "Activités & sport" },
  { e: "🚲", k: "velo bicyclette rouler", c: "Activités & sport" },
  { e: "🛴", k: "trottinette rouler", c: "Activités & sport" },
  { e: "🏊", k: "piscine nager natation eau", c: "Activités & sport" },
  { e: "🧗", k: "escalade grimper accrobranche", c: "Activités & sport" },
  { e: "🎡", k: "manege parc attraction fete", c: "Activités & sport" },
  { e: "🎢", k: "montagnes russes parc fete", c: "Activités & sport" },
  { e: "🎯", k: "cible objectif activite", c: "Activités & sport" },
  { e: "🌳", k: "arbre parc nature dehors", c: "Activités & sport" },
  { e: "⛺", k: "tente cabane camping", c: "Activités & sport" },
  { e: "🎬", k: "film cinema clap", c: "Activités & sport" },
  { e: "🍿", k: "popcorn film cinema soiree", c: "Activités & sport" },
  { e: "🎮", k: "jeu video manette console", c: "Activités & sport" },
  { e: "🛝", k: "toboggan parc jouer jeux", c: "Activités & sport" },
  { e: "🎤", k: "micro chanter karaoke", c: "Activités & sport" },
  { e: "💃", k: "danse danser", c: "Activités & sport" },
  // Animaux
  { e: "🐶", k: "chien chiot animal", c: "Animaux" },
  { e: "🐱", k: "chat chaton animal", c: "Animaux" },
  { e: "🐰", k: "lapin animal paques", c: "Animaux" },
  { e: "🦄", k: "licorne magie", c: "Animaux" },
  { e: "🦖", k: "dinosaure dino", c: "Animaux" },
  { e: "🐢", k: "tortue animal lent", c: "Animaux" },
  { e: "🐠", k: "poisson animal eau", c: "Animaux" },
  { e: "🦋", k: "papillon animal", c: "Animaux" },
  { e: "🐝", k: "abeille animal miel", c: "Animaux" },
  { e: "🐧", k: "pingouin manchot animal", c: "Animaux" },
  // Nourriture & récompenses
  { e: "🎁", k: "cadeau surprise recompense", c: "Nourriture & récompenses" },
  { e: "🍬", k: "bonbon sucrerie", c: "Nourriture & récompenses" },
  { e: "🍭", k: "sucette bonbon", c: "Nourriture & récompenses" },
  { e: "🍦", k: "glace dessert", c: "Nourriture & récompenses" },
  { e: "🍫", k: "chocolat dessert", c: "Nourriture & récompenses" },
  { e: "🧁", k: "cupcake gateau dessert", c: "Nourriture & récompenses" },
  { e: "🍪", k: "cookie biscuit gateau", c: "Nourriture & récompenses" },
  { e: "🍕", k: "pizza repas manger", c: "Nourriture & récompenses" },
  { e: "🍝", k: "pates spaghetti repas", c: "Nourriture & récompenses" },
  { e: "🥞", k: "pancake crepe dejeuner", c: "Nourriture & récompenses" },
  { e: "🍓", k: "fraise fruit", c: "Nourriture & récompenses" },
  { e: "🍎", k: "pomme fruit", c: "Nourriture & récompenses" },
  { e: "🏆", k: "trophee gagne reussite", c: "Nourriture & récompenses" },
  { e: "🥇", k: "medaille premier gagne", c: "Nourriture & récompenses" },
  // Famille & nature
  { e: "👫", k: "copain copine ami enfants", c: "Famille & nature" },
  { e: "👨‍👩‍👧", k: "famille parents enfant", c: "Famille & nature" },
  { e: "🧑‍🤝‍🧑", k: "amis ensemble", c: "Famille & nature" },
  { e: "🌈", k: "arc en ciel couleur", c: "Famille & nature" },
  { e: "☀️", k: "soleil beau jour", c: "Famille & nature" },
  { e: "🌙", k: "lune nuit dodo soir", c: "Famille & nature" },
  { e: "🌸", k: "fleur rose printemps", c: "Famille & nature" },
  { e: "🚗", k: "voiture auto rouler", c: "Famille & nature" },
  { e: "🎈", k: "ballon fete anniversaire", c: "Famille & nature" }
];
function emojiCategories() {
  const out = {};
  for (const it of EMOJI_DATA) (out[it.c] = out[it.c] || []).push(it.e);
  return out;
}

// ============================================================================
//  ÉTAT
// ============================================================================
let state = null;
let currentTab = "routines";
let selectedChild = "nola";

const child = (id) => state.children.find(c => c.id === id);
function currentParent() {
  const p = localStorage.getItem("rnj_parent");
  if (p && state.parents.includes(p)) return p;
  return state.parents[0] || "Parent";
}
function uid() { return "x" + Math.floor(performance.now() * 1000).toString(36) + Math.floor(performance.now() % 1000).toString(36); }
function save() { Storage.save(state); }
function commit() { save(); render(); }

// migration douce
function hydrate(loaded) {
  const base = structuredClone(DEFAULT_STATE);
  if (!loaded) return base;
  const s = { ...base, ...loaded };
  s.week = loaded.week || {};
  s.starHistory = loaded.starHistory || {};
  s.log = loaded.log || [];
  s.punishmentLog = loaded.punishmentLog || [];
  s.sessions = loaded.sessions || (loaded.session && loaded.session.childId
    ? { [loaded.session.childId]: { running: loaded.session.running, runningSince: loaded.session.runningSince } }
    : {});
  delete s.session;
  s.punishments = loaded.punishments || base.punishments;
  s.rewards = loaded.rewards || base.rewards;
  s.parents = (loaded.parents && loaded.parents.length) ? loaded.parents : base.parents;
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

// applique le temps écoulé du sablier d'un enfant aux punitions (plus ancienne d'abord)
function commitConsumed(childId) {
  const s = state.sessions[childId];
  if (!s) return;
  let consumed = (s.running && s.runningSince) ? (Date.now() - s.runningSince) / 60000 : 0;
  for (const e of orderedPending(childId)) {
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
  updateWhoBadge();
  updateDemoBanner();
  document.querySelectorAll(".tab").forEach(t => t.classList.toggle("active", t.dataset.tab === currentTab));
  if (currentTab === "routines") renderRoutines();
  else if (currentTab === "punitions") renderPunitions();
  else if (currentTab === "recompenses") renderRecompenses();
  else if (currentTab === "journal") renderJournal();
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
  view.innerHTML = `<div style="text-align:center;margin-bottom:10px">
      <p class="muted" style="margin:0 0 8px">Semaine ${weekKey()} · clique une étoile quand l'enfant réussit</p>
      <button class="btn ghost small" data-act="show-history">📜 Historique des étoiles</button>
    </div>` +
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
    }).join("") + renderBonusBlock();
}

function renderBonusBlock() {
  return `<div class="child-card" style="border:2px dashed var(--gold)">
    <div class="child-head"><span class="badge" style="background:#fff6d8;color:#b9870b">✨ Étoiles spontanées</span></div>
    <p class="muted">Pour récompenser un bon geste sur le moment. Une raison sera demandée (obligatoire).</p>
    ${state.children.map(c => `
      <div class="row" style="border:none">
        <span class="avatar" style="width:38px;height:38px;border-radius:50%;display:grid;place-items:center;font-size:1.2rem;background:${c.color === 'pink' ? 'var(--pink-soft)' : 'var(--blue-soft)'}">${c.emoji}</span>
        <b style="min-width:54px">${esc(c.name)}</b>
        <input type="number" class="num" id="bonus-${c.id}" value="1" />
        <span class="muted">⭐</span>
        <button class="btn ${c.color === 'pink' ? 'primary' : 'blue'} small" data-act="give-bonus" data-child="${c.id}">Donner</button>
      </div>`).join("")}
  </div>`;
}

// ---- PUNITIONS -------------------------------------------------------------
function renderPunitions() {
  let html = state.children.filter(c => state.sessions[c.id]).map(c => renderSessionPanel(c.id)).join("");
  html += state.children.map(c => {
    const total = pendingMin(c.id);
    const lvl = colorLevel(c);
    const disabled = (total <= 0 || state.sessions[c.id]) ? "disabled" : "";
    return `
      <div class="child-card ${c.color}">
        <div class="child-head">
          <span class="badge">${c.emoji} ${esc(c.name)}</span>
          <span class="lvl-pill lvl-${lvl}">⏳ ${total > 0 ? fmtDur(Math.ceil(total)) : "0 min"} en attente</span>
        </div>
        <button class="btn ${c.color === 'pink' ? 'primary' : 'blue'}" data-act="launch" data-child="${c.id}" ${disabled} style="width:100%">⏳ Lancer le sablier de ${esc(c.name)}</button>
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
  const map = { pending: ["En attente", "st-pending"], in_progress: ["En cours", "st-prog"], served: ["Fait ✓", "st-served"], pardoned: ["Pardonné", "st-pard"] };
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
       <button class="btn small green" data-act="mark-served" data-id="${e.id}">Fait ✓</button>
       <button class="btn small" style="background:#eee;color:#777" data-act="pardon-log" data-id="${e.id}">Pardon</button>
       <button class="btn small danger" data-act="del-log" data-id="${e.id}">🗑</button>`
    : `<button class="btn small ghost" data-act="edit-log" data-id="${e.id}">✏️</button>
       <button class="btn small danger" data-act="del-log" data-id="${e.id}">🗑</button>`;
  const extra = e.status === "in_progress" ? ` · reste ${fmtDur(Math.ceil(e.remainingMin))}` : "";
  const by = e.by ? ` · par ${esc(e.by)}` : "";
  return `<div class="jrow ${e.status}">
    <span class="ic">${e.icon}</span>
    <div class="grow">
      <div><b>${esc(e.typeLabel)}</b> <span class="size-tag size-${e.size}">${e.size}</span> ${e.edited ? '<span class="edited">édité</span>' : ""}</div>
      <div class="muted">${fmtDur(e.durationMin)}${extra} · reçue ${fmtLogged(e)}${by}${e.comment ? " · 💬 " + esc(e.comment) : ""}</div>
    </div>
    ${statusBadge(e)}
    <div class="jactions">${actions}</div>
  </div>`;
}

function renderSessionPanel(childId) {
  const s = state.sessions[childId];
  const c = child(childId);
  const entries = orderedPending(childId);
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
  }).join("") : `<p class="empty">Tout est fait 🎉</p>`;
  const controls = done
    ? `<button class="btn green" data-act="stop-session" data-child="${childId}">✓ Terminer le sablier</button>`
    : (s.running
      ? `<button class="btn ghost" data-act="pause-session" data-child="${childId}">⏸ Pause</button> <button class="btn danger" data-act="stop-session" data-child="${childId}">⏹ Arrêter</button>`
      : `<button class="btn green" data-act="resume-session" data-child="${childId}">▶️ Reprendre</button> <button class="btn danger" data-act="stop-session" data-child="${childId}">⏹ Arrêter</button>`);
  const statusTxt = done ? "Terminé ✓" : (s.running ? "En cours…" : "En pause");
  return `<div class="session-panel ${c.color}" data-sess-child="${childId}">
    <h3>⏳ Sablier · ${c.emoji} ${esc(c.name)}</h3>
    <div class="sess-total" data-sess-total>${fmtClock(total)}</div>
    <div class="muted" style="text-align:center;margin-bottom:10px">${statusTxt}</div>
    <div class="sess-list">${list}</div>
    <div style="text-align:center;margin-top:14px">${controls}</div>
  </div>`;
}

function tickSession() {
  const ids = Object.keys(state.sessions || {});
  if (!ids.length) return;
  let needRender = false;
  for (const childId of ids) {
    const s = state.sessions[childId];
    const entries = orderedPending(childId);
    const consumed = (s.running && s.runningSince) ? (Date.now() - s.runningSince) / 60000 : 0;

    // franchissement d'un palier → on enregistre (et on synchronise) une fois
    if (consumed > 0 && entries.length && consumed >= entries[0].remainingMin) {
      commitConsumed(childId); save();
      if (orderedPending(childId).reduce((a, e) => a + e.remainingMin, 0) <= 0) { s.running = false; s.runningSince = null; }
      needRender = true;
      continue;
    }

    const panel = document.querySelector(`[data-sess-child="${childId}"]`);
    if (!panel) continue;
    const stateTotal = entries.reduce((a, e) => a + e.remainingMin, 0);
    const liveTotal = Math.max(0, stateTotal - consumed);
    const totEl = panel.querySelector("[data-sess-total]");
    if (totEl) totEl.textContent = fmtClock(liveTotal);
    let c2 = consumed;
    for (const e of entries) {
      let rem = e.remainingMin;
      if (c2 > 0) { if (c2 >= rem) { c2 -= rem; rem = 0; } else { rem -= c2; c2 = 0; } }
      const el = panel.querySelector(`[data-sess-entry="${e.id}"]`);
      if (el) {
        const r = el.querySelector("[data-rem]"); if (r) r.textContent = fmtDur(Math.max(0, Math.ceil(rem)));
        const f = el.querySelector("[data-fill]"); if (f) f.style.width = Math.min(100, Math.max(0, (e.durationMin - rem) / e.durationMin * 100)) + "%";
        if (rem <= 0) el.classList.add("served");
      }
    }
    if (liveTotal <= 0 && s.running) { commitConsumed(childId); s.running = false; s.runningSince = null; save(); needRender = true; }
  }
  if (needRender) render();
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

// ---- JOURNAL (historisation + export) --------------------------------------
const STATUS_TEXT = { pending: "En attente", in_progress: "En cours", served: "Fait", pardoned: "Pardonné" };
function fmtDate(ts) { const d = new Date(ts); return String(d.getDate()).padStart(2, "0") + "." + String(d.getMonth() + 1).padStart(2, "0") + "." + d.getFullYear(); }

// Lignes "Punitions & récompenses" (tout, trié du plus récent au plus ancien)
function journalRows() {
  const rows = [];
  state.punishmentLog.forEach(e => rows.push({
    ts: e.loggedTs,
    Date: fmtLogged(e),
    Enfant: child(e.childId) ? child(e.childId).name : (e.childId || ""),
    "Catégorie": "Punition",
    "Détail": e.typeLabel,
    Taille: e.size,
    Montant: fmtDur(e.durationMin),
    Statut: STATUS_TEXT[e.status] || e.status,
    Par: e.by || "",
    "Fait le": e.servedTs ? fmtDate(e.servedTs) : "",
    Commentaire: e.comment || ""
  }));
  (state.log || []).filter(l => l.type === "récompense").forEach(l => rows.push({
    ts: l.ts,
    Date: fmtDate(l.ts),
    Enfant: l.child,
    "Catégorie": "Récompense",
    "Détail": l.label,
    Taille: "",
    Montant: l.n + " ⭐",
    Statut: "Échangé",
    Par: "",
    "Fait le": "",
    Commentaire: ""
  }));
  (state.log || []).filter(l => l.type === "bonus").forEach(l => rows.push({
    ts: l.ts,
    Date: fmtDate(l.ts),
    Enfant: l.child,
    "Catégorie": "Étoile bonus",
    "Détail": "Étoile spontanée",
    Taille: "",
    Montant: (l.n > 0 ? "+" : "") + l.n + " ⭐",
    Statut: "",
    Par: l.by || "",
    "Fait le": "",
    Commentaire: l.reason || ""
  }));
  rows.sort((a, b) => b.ts - a.ts);
  return rows;
}

// Lignes "Historique des routines" (par semaine, enfant, action)
function routineRows() {
  const rows = [];
  Object.keys(state.starHistory || {}).sort().reverse().forEach(wk => {
    const per = state.starHistory[wk];
    state.children.forEach(c => {
      const h = per[c.id];
      if (!h) return;
      Object.values(h.byRoutine || {}).forEach(b => rows.push({ Semaine: wk, Enfant: c.name, Action: b.label, "Étoiles": b.count }));
      rows.push({ Semaine: wk, Enfant: c.name, Action: "— Total semaine —", "Étoiles": h.total });
    });
  });
  return rows;
}

function dataTable(rows, cols, catCol) {
  if (!rows.length) return `<p class="empty">Rien pour l'instant.</p>`;
  const head = cols.map(c => `<th>${c}</th>`).join("");
  const body = rows.map(r => {
    const cls = catCol && r[catCol] ? " class=\"cat-" + normalize(r[catCol]) + "\"" : "";
    return `<tr${cls}>${cols.map(c => `<td>${esc(r[c] == null ? "" : r[c])}</td>`).join("")}</tr>`;
  }).join("");
  return `<div class="tbl-wrap"><table class="data-tbl"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>`;
}

function renderJournal() {
  const jr = journalRows(), rr = routineRows();
  view.innerHTML = `
    <div class="setting-block">
      <div class="jhead">
        <h3>⏳🎁 Punitions &amp; récompenses <span class="muted">(${jr.length})</span></h3>
        <button class="btn primary small" data-act="export-xlsx" data-kind="journal" ${jr.length ? "" : "disabled"}>⬇️ Excel</button>
      </div>
      ${dataTable(jr, ["Date", "Enfant", "Catégorie", "Détail", "Taille", "Montant", "Statut", "Par", "Fait le", "Commentaire"], "Catégorie")}
    </div>
    <div class="setting-block">
      <div class="jhead">
        <h3>⭐ Historique des routines <span class="muted">(${rr.length})</span></h3>
        <button class="btn primary small" data-act="export-xlsx" data-kind="routines" ${rr.length ? "" : "disabled"}>⬇️ Excel</button>
      </div>
      ${dataTable(rr, ["Semaine", "Enfant", "Action", "Étoiles"], null)}
    </div>`;
}

async function exportJournalXlsx(kind) {
  const isRoutines = kind === "routines";
  const rows = isRoutines ? routineRows() : journalRows().map(({ ts, ...keep }) => keep);
  const sheetName = isRoutines ? "Routines" : "Punitions & récompenses";
  const fileBase = isRoutines ? "historique-routines" : "historique-punitions-recompenses";
  if (!rows.length) { toast("Rien à exporter"); return; }
  try {
    const XLSX = await import("https://cdn.sheetjs.com/xlsx-0.20.3/package/xlsx.mjs");
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), sheetName);
    XLSX.writeFile(wb, fileBase + ".xlsx");
    toast("Export Excel téléchargé ✓");
  } catch (e) {
    console.warn("SheetJS indisponible, repli CSV", e);
    exportCsvSingle(rows, fileBase);
  }
}

function exportCsvSingle(rows, fileBase) {
  const cell = v => '"' + String(v == null ? "" : v).replace(/"/g, '""') + '"';
  const cols = Object.keys(rows[0]);
  const csv = "﻿" + [cols.map(cell).join(";"), ...rows.map(r => cols.map(c => cell(r[c])).join(";"))].join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = fileBase + ".csv"; a.click();
  URL.revokeObjectURL(url);
  toast("Export CSV téléchargé (ouvrable dans Excel)");
}

// ---- Tri par glisser-déposer (souris + tactile) ----
function makeSortable(container, onDrop) {
  function moveTo(clientY) {
    const drag = container.querySelector(".dragging");
    if (!drag) return;
    const others = [...container.querySelectorAll("[data-sort-id]")].filter(r => r !== drag);
    let target = null;
    for (const r of others) {
      const rect = r.getBoundingClientRect();
      if (clientY < rect.top + rect.height / 2) { target = r; break; }
    }
    if (target) container.insertBefore(drag, target);
    else container.appendChild(drag);
  }
  container.querySelectorAll("[data-drag-handle]").forEach(h => {
    h.addEventListener("pointerdown", e => {
      e.preventDefault();
      const row = h.closest("[data-sort-id]");
      if (!row) return;
      row.classList.add("dragging");
      const move = ev => moveTo(ev.clientY);
      const up = () => {
        document.removeEventListener("pointermove", move);
        document.removeEventListener("pointerup", up);
        row.classList.remove("dragging");
        const ids = [...container.querySelectorAll("[data-sort-id]")].map(r => r.dataset.sortId);
        onDrop(ids);
      };
      document.addEventListener("pointermove", move);
      document.addEventListener("pointerup", up);
    });
  });
}
function setupSortables() {
  view.querySelectorAll("[data-sortable]").forEach(cont => {
    const key = cont.dataset.sortable;
    makeSortable(cont, (ids) => {
      const byId = (arr) => arr.sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id));
      if (key === "punishments") byId(state.punishments);
      else if (key === "rewards") byId(state.rewards);
      else if (key.startsWith("routines:")) { const c = child(key.split(":")[1]); if (c) byId(c.routines); }
      commit();
    });
  });
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
      <div class="sortable" data-sortable="routines:${c.id}">
      ${c.routines.map(r => `
        <div class="row" data-sort-id="${r.id}">
          <span class="drag-handle" data-drag-handle title="Glisser pour réordonner">☰</span>
          <button class="ic-btn" data-act="pick-emoji" data-target="routine" data-child="${c.id}" data-id="${r.id}">${r.icon}</button>
          <input type="text" class="grow" value="${esc(r.label)}" data-act="edit-routine" data-child="${c.id}" data-id="${r.id}" />
          <button class="btn small ghost" data-act="dup-routine" data-child="${c.id}" data-id="${r.id}" title="Dupliquer">⧉</button>
          <button class="btn danger small" data-act="del-routine" data-child="${c.id}" data-id="${r.id}">✕</button>
        </div>`).join("")}
      </div>
      <button class="btn ghost small" data-act="add-routine" data-child="${c.id}" style="margin-top:8px">+ Ajouter une action</button>
    </div>`).join("");

  const punBlock = `
    <div class="setting-block">
      <h3>⏳ Punitions (catalogue)</h3>
      <p class="muted">Taille S = mineur · M = modéré · L = grave. La durée dépend de l'enfant (réglée ci-dessus). Supprimer un type ici n'efface pas les punitions déjà loggées.</p>
      <div class="sortable" data-sortable="punishments">
      ${state.punishments.map(p => `
        <div class="row" data-sort-id="${p.id}">
          <span class="drag-handle" data-drag-handle title="Glisser pour réordonner">☰</span>
          <button class="ic-btn" data-act="pick-emoji" data-target="pun" data-id="${p.id}">${p.icon}</button>
          <input type="text" class="grow" value="${esc(p.label)}" data-act="edit-pun-label" data-id="${p.id}" />
          <select data-act="edit-pun-size" data-id="${p.id}">
            ${["S", "M", "L"].map(s => `<option value="${s}" ${p.size === s ? "selected" : ""}>${s}</option>`).join("")}
          </select>
          <button class="btn danger small" data-act="del-pun" data-id="${p.id}">✕</button>
        </div>`).join("")}
      </div>
      <button class="btn ghost small" data-act="add-pun" style="margin-top:8px">+ Ajouter une punition</button>
    </div>`;

  const rewBlock = `
    <div class="setting-block">
      <h3>🎁 Récompenses (catalogue)</h3>
      <div class="sortable" data-sortable="rewards">
      ${state.rewards.map(r => `
        <div class="row" data-sort-id="${r.id}">
          <span class="drag-handle" data-drag-handle title="Glisser pour réordonner">☰</span>
          <button class="ic-btn" data-act="pick-emoji" data-target="rew" data-id="${r.id}">${r.icon}</button>
          <input type="text" class="grow" value="${esc(r.label)}" data-act="edit-rew-label" data-id="${r.id}" />
          <label class="muted">⭐</label><input type="number" class="num" value="${r.cost}" data-act="edit-rew-cost" data-id="${r.id}" />
          <select data-act="edit-rew-tier" data-id="${r.id}">
            <option value="1" ${r.tier === 1 ? "selected" : ""}>1-5</option>
            <option value="2" ${r.tier === 2 ? "selected" : ""}>6-10</option>
            <option value="3" ${r.tier === 3 ? "selected" : ""}>11+</option>
          </select>
          <button class="btn danger small" data-act="del-rew" data-id="${r.id}">✕</button>
        </div>`).join("")}
      </div>
      <button class="btn ghost small" data-act="add-rew" style="margin-top:8px">+ Ajouter une récompense</button>
    </div>`;

  const parentsBlock = `
    <div class="setting-block">
      <h3>👤 Parents</h3>
      <p class="muted">Sert à savoir qui a mis chaque punition. Chaque appareil choisit son profil en haut à gauche (👤). Sans mot de passe.</p>
      ${state.parents.map((nm, i) => `
        <div class="row">
          <input type="text" class="grow" value="${esc(nm)}" data-act="edit-parent" data-idx="${i}" />
          <button class="btn danger small" data-act="del-parent" data-idx="${i}" ${state.parents.length <= 1 ? "disabled" : ""}>✕</button>
        </div>`).join("")}
      <button class="btn ghost small" data-act="add-parent" style="margin-top:8px">+ Ajouter un parent</button>
    </div>`;

  const demoBlock = `
    <div class="setting-block">
      <h3>🧪 Mode démo</h3>
      <p class="muted">Pour montrer l'app sans toucher aux vraies données. Tout reste dans un bac à sable local, non synchronisé.</p>
      <div class="row" style="border:none">
        ${Storage.demo
          ? `<button class="btn green" data-act="exit-demo">✓ Quitter le mode démo (revenir aux vraies données)</button>`
          : `<button class="btn ghost" data-act="enter-demo">🧪 Activer le mode démo (sur cet appareil)</button>`}
      </div>
      <label class="muted" style="font-weight:700;display:block;margin-top:12px">Envoyer une démo à des copains</label>
      <p class="muted">Ce lien ouvre une démo isolée avec des données d'exemple. Tes copains peuvent tout tester : <b>ça ne touche jamais la base de tes enfants</b> (aucune connexion à la vraie base).</p>
      <div class="row" style="border:none;flex-wrap:wrap">
        <button class="btn blue small" data-act="copy-demo-link">🔗 Copier le lien démo</button>
        <code class="muted" style="word-break:break-all">${esc(location.origin + location.pathname)}?demo=1</code>
      </div>
    </div>`;

  const dataBlock = `
    <div class="setting-block">
      <h3>💾 Données & remise à zéro</h3>
      <p class="muted">Sauvegarde complète, ou effacement <b>ciblé par catégorie</b> (chaque action demande confirmation).</p>
      <div class="row" style="border:none;flex-wrap:wrap">
        <button class="btn ghost small" data-act="export">⬇️ Exporter (sauvegarde)</button>
        <button class="btn ghost small" data-act="import">⬆️ Importer</button>
      </div>
      <label class="muted" style="font-weight:700;display:block;margin-top:12px">Effacer une catégorie</label>
      <div class="row" style="border:none;flex-wrap:wrap">
        <button class="btn danger small" data-act="clear-punitions">🗑 Punitions (journal + sabliers)</button>
        <button class="btn danger small" data-act="clear-stars">🗑 Étoiles &amp; récompenses (soldes, semaine, historique, échanges)</button>
        <button class="btn danger small" data-act="reset-config">🗑 Configuration (enfants, routines, catalogues — garde les soldes)</button>
      </div>
      <div class="row" style="border:none;margin-top:8px">
        <button class="btn danger small" data-act="reset">🗑 Tout réinitialiser (config + données)</button>
      </div>
    </div>`;

  view.innerHTML = childrenBlocks + punBlock + rewBlock + parentsBlock + demoBlock + dataBlock;
  setupSortables();
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
    const won = weekTotal(childId);
    if (won === 0) { toast("Aucune étoile à valider cette semaine"); return; }
    openWeekConfirm(childId, won);
  }
  else if (a === "show-history") openHistory();
  else if (a === "export-xlsx") exportJournalXlsx(el.dataset.kind);
  else if (a === "give-bonus") {
    const inp = document.getElementById("bonus-" + childId);
    const n = Math.round(+(inp && inp.value) || 0);
    if (!n) { toast("Indique un nombre d'étoiles"); return; }
    openBonusModal(childId, n);
  }
  // ---- Punitions : donner ----
  else if (a === "give") {
    const c = child(childId);
    const p = state.punishments.find(x => x.id === el.dataset.pun);
    const durationMin = c.durations[p.size];
    state.punishmentLog.unshift({
      id: uid(), childId, typeLabel: p.label, icon: p.icon, size: p.size,
      durationMin, remainingMin: durationMin, status: "pending",
      loggedTs: Date.now(), moment: currentMoment(), comment: "", edited: false, servedTs: null,
      by: currentParent()
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
    if (state.sessions[childId]) { toast("Le sablier tourne déjà"); return; }
    if (pendingMin(childId) <= 0) { toast("Rien dans le sablier"); return; }
    state.sessions[childId] = { running: true, runningSince: Date.now() };
    commit();
  }
  else if (a === "pause-session") { commitConsumed(childId); state.sessions[childId].running = false; state.sessions[childId].runningSince = null; commit(); }
  else if (a === "resume-session") { state.sessions[childId].running = true; state.sessions[childId].runningSince = Date.now(); commit(); }
  else if (a === "stop-session") { commitConsumed(childId); delete state.sessions[childId]; commit(); }
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
  else if (a === "move-routine") {
    const c = child(childId), arr = c.routines, i = arr.findIndex(r => r.id === id), dir = +el.dataset.dir, j = i + dir;
    if (i >= 0 && j >= 0 && j < arr.length) { [arr[i], arr[j]] = [arr[j], arr[i]]; commit(); }
  }
  else if (a === "dup-routine") {
    const c = child(childId), i = c.routines.findIndex(r => r.id === id);
    if (i >= 0) { const o = c.routines[i]; c.routines.splice(i + 1, 0, { id: uid(), icon: o.icon, label: o.label }); commit(); }
  }
  else if (a === "add-pun") { state.punishments.push({ id: uid(), size: "S", icon: "⚠️", label: "Nouveau comportement" }); commit(); }
  else if (a === "del-pun") { state.punishments = state.punishments.filter(p => p.id !== id); commit(); }
  else if (a === "move-pun") {
    const arr = state.punishments, i = arr.findIndex(p => p.id === id), j = i + (+el.dataset.dir);
    if (i >= 0 && j >= 0 && j < arr.length) { [arr[i], arr[j]] = [arr[j], arr[i]]; commit(); }
  }
  else if (a === "add-parent") { state.parents.push("Parent"); commit(); }
  else if (a === "del-parent") { state.parents.splice(+el.dataset.idx, 1); commit(); }
  else if (a === "enter-demo") {
    Storage.enterDemo(state);
    toast("🧪 Mode démo activé");
    render();
  }
  else if (a === "exit-demo") {
    state = hydrate(Storage.exitDemo());
    toast("Retour aux vraies données ✓");
    render();
  }
  else if (a === "copy-demo-link") {
    const url = location.origin + location.pathname + "?demo=1";
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(() => toast("Lien démo copié ✓")).catch(() => prompt("Copie ce lien :", url));
    } else { prompt("Copie ce lien :", url); }
  }
  else if (a === "add-rew") { state.rewards.push({ id: uid(), tier: 1, cost: 3, icon: "🎁", label: "Nouvelle récompense" }); commit(); }
  else if (a === "del-rew") { state.rewards = state.rewards.filter(r => r.id !== id); commit(); }
  else if (a === "pick-emoji") openEmojiPicker(el.dataset);
  else if (a === "export") doExport();
  else if (a === "import") doImport();
  else if (a === "clear-punitions") {
    if (confirm("Effacer TOUTES les punitions (journal + sabliers en cours) ?\nLes étoiles et la configuration ne sont pas touchées.")) {
      state.punishmentLog = []; state.sessions = {}; commit(); toast("Punitions effacées");
    }
  }
  else if (a === "clear-stars") {
    if (confirm("Remettre à ZÉRO les étoiles ?\nSoldes, semaine en cours, historique des routines et échanges de récompenses.\nPunitions et configuration conservées.")) {
      state.children.forEach(c => c.stars = 0);
      state.week = {}; state.starHistory = {}; state.log = [];
      commit(); toast("Étoiles & récompenses remises à zéro");
    }
  }
  else if (a === "reset-config") {
    if (confirm("Réinitialiser la CONFIGURATION aux valeurs d'origine ?\n(enfants, routines, durées, seuils, catalogues punitions & récompenses, parents)\nLes soldes d'étoiles sont conservés, mais tes personnalisations seront perdues.")) {
      const base = structuredClone(DEFAULT_STATE);
      state.punishments = base.punishments;
      state.rewards = base.rewards;
      state.parents = base.parents;
      state.children = base.children.map(bc => { const cur = child(bc.id); return { ...bc, stars: cur ? cur.stars : 0 }; });
      commit(); toast("Configuration réinitialisée");
    }
  }
  else if (a === "reset") { if (confirm("TOUT réinitialiser (configuration + données) ? Étoiles, journal et config effacés.")) { state = structuredClone(DEFAULT_STATE); commit(); } }
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
  else if (a === "edit-parent") { const old = state.parents[+el.dataset.idx]; state.parents[+el.dataset.idx] = el.value || "Parent"; if (localStorage.getItem("rnj_parent") === old) localStorage.setItem("rnj_parent", el.value || "Parent"); save(); updateWhoBadge(); return; }
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
  openModal(`<h3>Choisir une icône</h3>
    <input id="emoji-search" type="text" placeholder="🔎 Rechercher (ex : chien, glace, ranger…)" autocomplete="off" />
    <div id="emoji-results"></div>`);
  const search = modalContent.querySelector("#emoji-search");
  const results = modalContent.querySelector("#emoji-results");
  const pick = (em) => { applyEmoji(ds, em); closeModal(); };
  function draw(q) {
    q = normalize(q.trim());
    let html;
    if (!q) {
      html = Object.entries(emojiCategories()).map(([cat, list]) =>
        `<div class="emoji-cat">${cat}</div><div class="emoji-grid">${list.map(em => `<button data-em="${em}">${em}</button>`).join("")}</div>`).join("");
    } else {
      const hits = EMOJI_DATA.filter(it => normalize(it.k + " " + it.c).includes(q));
      html = hits.length
        ? `<div class="emoji-grid">${hits.map(it => `<button data-em="${it.e}">${it.e}</button>`).join("")}</div>`
        : `<p class="empty">Aucun emoji pour « ${esc(q)} »</p>`;
    }
    results.innerHTML = html;
    results.querySelectorAll("[data-em]").forEach(b => b.onclick = () => pick(b.dataset.em));
  }
  search.addEventListener("input", () => draw(search.value));
  draw("");
  setTimeout(() => search.focus(), 50);
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
  openModal(`<h3>Marquer comme fait ✓</h3>
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
    closeModal(); toast("Punition marquée faite ✓"); commit();
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

// ---- Validation de semaine (confirmation explicite) ----
function openWeekConfirm(childId, won) {
  const c = child(childId);
  openModal(`<h3>Valider la semaine de ${esc(c.name)} ?</h3>
    <p>On ajoute <b>${won} ⭐</b> à son solde (total : <b>${c.stars + won} ⭐</b>), puis le tableau de la semaine est remis à zéro.</p>
    <div style="display:flex;gap:10px;margin-top:18px">
      <button class="btn ghost" id="wk-cancel" style="flex:1">Annuler</button>
      <button class="btn green" id="wk-ok" style="flex:1.4">✅ Oui, valider ${won} ⭐</button>
    </div>`);
  modalContent.querySelector("#wk-cancel").onclick = closeModal;
  modalContent.querySelector("#wk-ok").onclick = () => {
    const wk = weekKey(), cells = weekCells(childId), byRoutine = {};
    c.routines.forEach(r => { const n = (cells[r.id] || []).filter(Boolean).length; if (n) byRoutine[r.id] = { label: r.label, count: n }; });
    state.starHistory[wk] = state.starHistory[wk] || {};
    state.starHistory[wk][childId] = { total: won, ts: Date.now(), byRoutine };
    c.stars += won;
    state.log.unshift({ ts: Date.now(), type: "semaine", child: c.name, n: won });
    if (state.week[wk]) delete state.week[wk][childId];
    closeModal(); toast(`+${won} ⭐ pour ${c.name} !`); commit();
  };
}

// ---- Étoiles spontanées (raison obligatoire) ----
function openBonusModal(childId, n) {
  const c = child(childId);
  const sign = n > 0 ? "+" : "";
  openModal(`<h3>${sign}${n} ⭐ pour ${esc(c.name)}</h3>
    <div class="field"><label>Raison (obligatoire)</label>
      <textarea id="bonus-reason" rows="2" placeholder="Ex : a aidé son frère sans qu'on lui demande"></textarea>
    </div>
    <button class="btn green" id="bonus-ok" style="width:100%">Confirmer ${sign}${n} ⭐</button>`);
  const ta = modalContent.querySelector("#bonus-reason");
  setTimeout(() => ta.focus(), 50);
  modalContent.querySelector("#bonus-ok").onclick = () => {
    const reason = ta.value.trim();
    if (!reason) { toast("La raison est obligatoire"); ta.focus(); return; }
    c.stars = (c.stars || 0) + n;
    state.log.unshift({ ts: Date.now(), type: "bonus", child: c.name, childId, n, reason, by: currentParent() });
    closeModal(); toast(`${sign}${n} ⭐ pour ${c.name}`); commit();
  };
}

// ---- Historique des étoiles (par semaine, enfant, action) ----
function openHistory() {
  const weeks = Object.keys(state.starHistory).sort().reverse();
  let body;
  if (!weeks.length) body = `<p class="empty">Aucune semaine validée pour l'instant.</p>`;
  else body = weeks.map(wk => {
    const perChild = state.starHistory[wk];
    const blocks = state.children.filter(c => perChild[c.id]).map(c => {
      const h = perChild[c.id];
      const lines = Object.values(h.byRoutine || {}).map(b => `<div class="hist-line"><span>${esc(b.label)}</span><b>⭐ ${b.count}</b></div>`).join("") || `<div class="muted">—</div>`;
      return `<div class="hist-child ${c.color}"><div class="hist-head">${c.emoji} ${esc(c.name)} <span class="stars">⭐ ${h.total}</span></div>${lines}</div>`;
    }).join("");
    return `<div class="hist-week"><div class="hist-wk">📅 Semaine ${wk}</div>${blocks}</div>`;
  }).join("");
  openModal(`<h3>📜 Historique des étoiles</h3>${body}`);
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
function normalize(s) { return String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""); }
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

// ---- Profil parent (qui suis-je) ----
function updateWhoBadge() {
  const el = document.getElementById("who-badge");
  if (el) el.textContent = "👤 " + currentParent();
}
function openParentPicker() {
  const cur = currentParent();
  openModal(`<h3>Qui utilise l'app ?</h3>
    <p class="muted">Sert à estampiller les punitions que tu mets. Sans mot de passe, modifiable à tout moment.</p>
    <div class="seg" id="who-seg">${state.parents.map(p => `<button data-v="${esc(p)}" class="${p === cur ? "on" : ""}">${esc(p)}</button>`).join("")}</div>`);
  modalContent.querySelectorAll("#who-seg button").forEach(b => b.onclick = () => {
    localStorage.setItem("rnj_parent", b.dataset.v);
    closeModal(); updateWhoBadge(); render(); toast("Profil : " + b.dataset.v);
  });
}
document.getElementById("who-badge").addEventListener("click", openParentPicker);

// ---- Bannière mode démo ----
function updateDemoBanner() {
  const el = document.getElementById("demo-banner");
  const sync = document.getElementById("sync-badge");
  if (!el) return;
  if (Storage.demo) {
    el.classList.remove("hidden");
    el.innerHTML = Storage.urlDemo
      ? `🧪 DÉMO DE TEST — données d'exemple, rien de réel`
      : `🧪 MODE DÉMO — tes changements ne sont pas enregistrés <button data-act="exit-demo">Quitter</button>`;
    if (sync) sync.style.display = "none";
  } else {
    el.classList.add("hidden");
    el.innerHTML = "";
    if (sync) sync.style.display = "";
  }
}
document.getElementById("demo-banner").addEventListener("click", e => {
  if (e.target.closest('[data-act="exit-demo"]')) { state = hydrate(Storage.exitDemo()); toast("Retour aux vraies données ✓"); render(); }
});

const DEMO_TTL = 12 * 3600000; // la démo se réinitialise toutes les 12 h

(async function start() {
  const loaded = await Storage.init((remote) => { if (!Storage.urlDemo) { state = hydrate(remote); render(); } });

  if (Storage.urlDemo) {
    const fresh = !loaded || !loaded._demoSeededAt || (Date.now() - loaded._demoSeededAt > DEMO_TTL);
    state = fresh ? buildDemoSeed(Storage.realConfigState) : hydrate(loaded);
    render();
    if (fresh) save();
    // contrôle périodique : reset à zéro toutes les 12 h même si la page reste ouverte
    setInterval(() => {
      if (state._demoSeededAt && Date.now() - state._demoSeededAt > DEMO_TTL) {
        state = buildDemoSeed(Storage.realConfigState); save(); render(); toast("Démo réinitialisée 🔄");
      }
    }, 5 * 60000);
    setInterval(tickSession, 1000);
    return;
  }

  state = hydrate(loaded);
  render();
  // Sécurité : ne sauvegarder au démarrage que si on a vraiment chargé des données
  // (ou en démo locale), pour ne jamais écraser la vraie base avec des valeurs par défaut.
  if (loaded || Storage.demo) save();
  setInterval(tickSession, 1000);
})();

// Jeu de données démo : config calquée sur le réel, opérationnel aléatoire et réaliste.
function rnd(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function buildDemoSeed(realState) {
  const base = realState ? hydrate(realState) : structuredClone(DEFAULT_STATE);
  const s = structuredClone(DEFAULT_STATE);
  // CONFIG = celle du réel (ou défaut), soldes réinitialisés aléatoirement
  s.children = base.children.map(c => ({ ...structuredClone(c), stars: rnd(2, 14) }));
  s.punishments = structuredClone(base.punishments);
  s.rewards = structuredClone(base.rewards);
  s.parents = base.parents.slice();
  s.week = {}; s.sessions = {}; s.punishmentLog = []; s.starHistory = {}; s.log = [];

  const now = Date.now(), H = 3600000;
  // punitions aléatoires
  const nPun = rnd(2, 5);
  for (let i = 0; i < nPun; i++) {
    const p = pick(s.punishments), c = pick(s.children);
    const status = pick(["pending", "pending", "served", "in_progress"]);
    const dur = c.durations[p.size] || 15;
    s.punishmentLog.push({
      id: uid(), childId: c.id, typeLabel: p.label, icon: p.icon, size: p.size,
      durationMin: dur, remainingMin: status === "served" ? 0 : status === "in_progress" ? Math.round(dur / 2) : dur,
      status, loggedTs: now - rnd(1, 72) * H, moment: pick(["matin", "aprem", "soir"]),
      comment: "", edited: false, servedTs: status === "served" ? now - rnd(1, 40) * H : null, by: pick(s.parents)
    });
  }
  // historique de la semaine passée
  const wk = weekKey(new Date(now - 7 * 86400000));
  s.starHistory[wk] = {};
  s.children.forEach(c => {
    const byRoutine = {}; let total = 0;
    c.routines.forEach(r => { if (Math.random() < 0.8) { const n = rnd(1, 7); byRoutine[r.id] = { label: r.label, count: n }; total += n; } });
    s.starHistory[wk][c.id] = { total, ts: now - 7 * 86400000, byRoutine };
  });
  // étoiles aléatoires dans la grille de la semaine EN COURS (jusqu'au jour actuel)
  const cwk = weekKey();
  const todayIdx = (new Date().getDay() + 6) % 7; // lundi = 0
  s.week[cwk] = {};
  s.children.forEach(c => {
    s.week[cwk][c.id] = {};
    c.routines.forEach(r => {
      s.week[cwk][c.id][r.id] = Array.from({ length: 7 }, (_, d) => d <= todayIdx && Math.random() < 0.6);
    });
  });

  // une récompense échangée + un bonus
  if (s.rewards.length) s.log.push({ ts: now - rnd(2, 30) * H, type: "récompense", child: pick(s.children).name, label: pick(s.rewards).label, n: -rnd(2, 8) });
  s.log.push({ ts: now - rnd(2, 30) * H, type: "bonus", child: pick(s.children).name, n: rnd(1, 3), reason: pick(["a aidé à ranger", "a été adorable avec sa sœur", "a partagé ses jouets", "s'est habillé tout seul"]), by: pick(s.parents) });

  s._demoSeededAt = now;
  return s;
}
