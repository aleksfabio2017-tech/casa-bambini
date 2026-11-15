/* ---------- livello dati: ponte Apps Script (PWA, fase 3) ---------- */
/* Al posto del connettore di claude.ai: le stesse tre azioni (leggi / aggiungi / aggiorna)
   vanno al ponte Apps Script del foglio. Indirizzo, chiave e "chi sei" stanno solo su questo
   dispositivo, in una chiave localStorage separata (così il backup JSON non contiene la chiave). */
const VERSIONE = "2.0.0";
const VERSIONE_DATA = "15 novembre 2026";
const PONTE_KEY = "casa-bambini-ponte";
const PONTE_TIMEOUT = 25000;

function ponteLoad(){
  try{ const o = JSON.parse(localStorage.getItem(PONTE_KEY) || "{}") || {};
    return {url:String(o.url||""), token:String(o.token||""), chi:(o.chi==="Babbo"||o.chi==="Mamma") ? o.chi : ""}; }
  catch(e){ return {url:"", token:"", chi:""}; }
}
let P = ponteLoad();
function ponteSave(){ try{ localStorage.setItem(PONTE_KEY, JSON.stringify(P)); }catch(e){} }
function ponteOk(){ return !!(P.url && P.token); }
function ponteUrlValido(u){ return /^https:\/\/[^\s/]+\/\S*\/exec$/.test(String(u||"")); }

const dati = (function(){
  const pausa = ms => new Promise(r=>setTimeout(r, ms));
  async function chiama(corpo, riprova){
    if(!ponteOk()) throw {code:"ponte_mancante"};
    if(typeof navigator!=="undefined" && navigator.onLine===false) throw {code:"senza_rete"};
    const ctrl = typeof AbortController!=="undefined" ? new AbortController() : null;
    const timer = ctrl ? setTimeout(()=>ctrl.abort(), PONTE_TIMEOUT) : null;
    let r, p = null;
    try{
      r = await fetch(P.url, {method:"POST", headers:{"Content-Type":"text/plain;charset=utf-8"},
        body:JSON.stringify(Object.assign({token:P.token}, corpo)), redirect:"follow", cache:"no-store",
        signal: ctrl ? ctrl.signal : undefined});
      const txt = await r.text();
      try{ p = JSON.parse(txt); }catch(e){ p = null; }
    }catch(e){
      const err = {code: e && e.name==="AbortError" ? "tempo_scaduto" : "rete", retryable:true};
      if(riprova){ await pausa(800 + Math.random()*700); return chiama(corpo, false); }
      throw err;
    }finally{ if(timer) clearTimeout(timer); }
    if(!p || typeof p!=="object"){
      throw r && !r.ok ? {code:"ponte_http", message:String(r.status)} : {code:"risposta_non_valida"};
    }
    if(p.ok!==true){
      const err = {code:String(p.codice||"errore_ponte"), message:String(p.errore||"")};
      if(riprova && err.code==="errore_foglio"){ await pausa(800 + Math.random()*700); return chiama(corpo, false); }
      throw err;
    }
    return p;
  }
  return {
    /* le letture si possono ripetere una volta; le scritture no (gli ID anti-doppioni
       sistemano al giro dopo una scrittura arrivata ma senza risposta) */
    leggi: async range => { const p = await chiama({azione:"leggi", range}, true); return Array.isArray(p.valori) ? p.valori : []; },
    aggiungi: (range, valori) => chiama({azione:"aggiungi", range, valori}, false),
    aggiorna: (range, valori) => chiama({azione:"aggiorna", range, valori}, false)
  };
})();

