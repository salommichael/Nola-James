// ============================================================================
//  SAUVEGARDE & SYNCHRONISATION
// ----------------------------------------------------------------------------
//  Par défaut l'app sauvegarde dans le navigateur (localStorage) : ça marche
//  tout de suite, mais les données ne sont PAS partagées entre appareils.
//
//  Pour partager les données entre toi et ta femme :
//   1. Crée un projet sur https://console.firebase.google.com (gratuit)
//   2. Active "Firestore Database" (mode production)
//   3. Récupère la config web (Paramètres du projet > Tes applications > Web)
//   4. Colle-la dans FIREBASE_CONFIG ci-dessous et mets ENABLE_SYNC = true
//   5. Règles Firestore conseillées (onglet Rules) :
//        rules_version = '2';
//        service cloud.firestore {
//          match /databases/{db}/documents {
//            match /familles/{id} { allow read, write: if true; }
//          }
//        }
//      (suffisant pour un usage familial ; le code de famille ci-dessous
//       sert de "clé" pour que seuls vous deux tombiez sur les mêmes données.)
// ============================================================================

const ENABLE_SYNC = true;

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyDEqmxDPpP2tDRUe_991dN3dhLT1AppdBs",
  authDomain: "nola-james.firebaseapp.com",
  projectId: "nola-james",
  storageBucket: "nola-james.firebasestorage.app",
  messagingSenderId: "704929755659",
  appId: "1:704929755659:web:4a771653be058c805a8d0e"
};

// Code commun à saisir sur chaque appareil. Garde-le secret : il joue le rôle
// de mot de passe partagé. Change-le par ce que tu veux.
const CODE_FAMILLE = "famille-devillard";

const LS_KEY = "rnj_state_v1";
const LS_DEMO = "rnj_demo_state";       // bac à sable démo (jamais synchronisé)
const LS_DEMO_FLAG = "rnj_demo_on";

// ----------------------------------------------------------------------------
class StorageEngine {
  constructor() {
    this.mode = "local";
    this.demo = false;
    this.onRemote = null;
    this._db = null;
    this._docRef = null;
    this._saveTimer = null;
    this._suppressNext = false;
  }

  loadLocal() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }
  saveLocal(state) {
    try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch (e) {}
  }
  demoLoad() {
    try { const r = localStorage.getItem(LS_DEMO); return r ? JSON.parse(r) : null; } catch (e) { return null; }
  }

  // Appelée par app.js au démarrage. onRemote(state) reçoit les mises à jour distantes.
  async init(onRemote) {
    this.onRemote = onRemote;
    this.demo = localStorage.getItem(LS_DEMO_FLAG) === "1";
    if (!ENABLE_SYNC || !FIREBASE_CONFIG.projectId) {
      this.mode = "local";
      this._setBadge();
      return this.demo ? this.demoLoad() : this.loadLocal();
    }
    try {
      const appMod = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js");
      const fsMod = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js");
      const app = appMod.initializeApp(FIREBASE_CONFIG);
      this._db = fsMod.getFirestore(app);
      this._fs = fsMod;
      this._docRef = fsMod.doc(this._db, "familles", CODE_FAMILLE);
      this.mode = "cloud";
      this._setBadge();

      // Écoute temps réel (ignorée en mode démo)
      fsMod.onSnapshot(this._docRef, (snap) => {
        if (this.demo) return;
        if (this._suppressNext) { this._suppressNext = false; return; }
        if (snap.exists() && this.onRemote) {
          const data = snap.data();
          if (data && data.payload) this.onRemote(JSON.parse(data.payload));
        }
      });

      if (this.demo) return this.demoLoad();
      const snap = await fsMod.getDoc(this._docRef);
      if (snap.exists() && snap.data().payload) return JSON.parse(snap.data().payload);
      return this.loadLocal();
    } catch (e) {
      console.warn("Firestore indisponible, repli en local.", e);
      this.mode = "local";
      this._setBadge();
      return this.demo ? this.demoLoad() : this.loadLocal();
    }
  }

  // Sauvegarde. En démo : uniquement dans le bac à sable local, jamais le cloud.
  save(state) {
    if (this.demo) {
      try { localStorage.setItem(LS_DEMO, JSON.stringify(state)); } catch (e) {}
      return;
    }
    this.saveLocal(state);
    if (this.mode !== "cloud") return;
    clearTimeout(this._saveTimer);
    this._saveTimer = setTimeout(() => {
      this._suppressNext = true;
      this._fs.setDoc(this._docRef, { payload: JSON.stringify(state), updated: Date.now() })
        .catch((e) => console.warn("Échec sauvegarde cloud", e));
    }, 600);
  }

  // Bascule en mode démo : seed = copie de l'état réel courant.
  enterDemo(seedState) {
    this.demo = true;
    localStorage.setItem(LS_DEMO_FLAG, "1");
    try { localStorage.setItem(LS_DEMO, JSON.stringify(seedState)); } catch (e) {}
    this._setBadge();
  }
  // Quitte la démo et rend l'état réel (dernier cache local synchronisé).
  exitDemo() {
    this.demo = false;
    localStorage.removeItem(LS_DEMO_FLAG);
    localStorage.removeItem(LS_DEMO);
    this._setBadge();
    return this.loadLocal();
  }

  _setBadge() {
    if (this.demo) return this._badge("demo", "🧪 Mode démo");
    if (this.mode === "cloud") return this._badge("cloud", "☁️ Synchro activée");
    this._badge("local", "💾 Local (cet appareil)");
  }
  _badge(cls, text) {
    const el = document.getElementById("sync-badge");
    if (el) { el.className = "sync-badge " + cls; el.textContent = text; }
  }
}

window.Storage = new StorageEngine();
