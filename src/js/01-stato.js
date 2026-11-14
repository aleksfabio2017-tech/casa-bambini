/* ---------- stato locale ---------- */
function blank(){ return {child:"Sibilla", births:{}, sex:{}, rows:[], queue:[], lastSync:null, edo:null, per:30, sonno:[], diario:[], attiv:[], att:null, svil:[], app:[], pdq:{}, salute:[], allerg:{}, sett:[], asilo:[], qs:{sonno:[], diario:[], attivita:[], sviluppo:[], appunt:[], salute:[], allerg:{}, sett:[], asilo:[]}}; }
function load(){
  try{ const raw = localStorage.getItem(LS_KEY); if(!raw) return blank();
    const s = Object.assign(blank(), JSON.parse(raw));
    if(!CHILDREN.includes(s.child)) s.child = "Sibilla";
    if(![0,7,30].includes(s.per)) s.per = 30;
    if(!s.qs || typeof s.qs!=="object") s.qs = {sonno:[], diario:[]};
    if(!Array.isArray(s.qs.sonno)) s.qs.sonno = []; if(!Array.isArray(s.qs.diario)) s.qs.diario = [];
    if(!Array.isArray(s.sonno)) s.sonno = []; if(!Array.isArray(s.diario)) s.diario = [];
    if(!Array.isArray(s.qs.attivita)) s.qs.attivita = []; if(!Array.isArray(s.attiv)) s.attiv = [];
    if(!Array.isArray(s.qs.sviluppo)) s.qs.sviluppo = []; if(!Array.isArray(s.svil)) s.svil = [];
    if(!Array.isArray(s.qs.appunt)) s.qs.appunt = []; if(!Array.isArray(s.app)) s.app = [];
    if(!s.pdq || typeof s.pdq!=="object") s.pdq = {};
    if(!Array.isArray(s.qs.salute)) s.qs.salute = []; if(!Array.isArray(s.salute)) s.salute = [];
    if(!s.qs.allerg || typeof s.qs.allerg!=="object" || Array.isArray(s.qs.allerg)) s.qs.allerg = {}; if(!s.allerg || typeof s.allerg!=="object") s.allerg = {};
    if(!Array.isArray(s.qs.sett)) s.qs.sett = []; if(!Array.isArray(s.sett)) s.sett = [];
    if(!Array.isArray(s.qs.asilo)) s.qs.asilo = []; if(!Array.isArray(s.asilo)) s.asilo = [];
    return s;
  }catch(e){ return blank(); }
}
function save(){ try{ localStorage.setItem(LS_KEY, JSON.stringify(S)); }catch(e){} }
let S = load();
let tab = "oggi";
let metric = "peso";
let mcp = null, perms = null;
let net = {state:"connecting", code:null, msg:""};
let syncing = false;
let formError = "";
let nDay = "ieri", nVal = null, nErr = "";      /* nanna */
let dCat = "ricordo", dFilter = "tutte", dErr = ""; /* diario */

