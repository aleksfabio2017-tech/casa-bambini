/* ---------- attività del giorno (blocco 4b) ---------- */
const FASCE = [[1,"9–12 mesi"],[2,"12–18 mesi"],[3,"18–24 mesi"]];
const AREE_ATT = ["Movimento","Mani","Linguaggio","Sensi","Vita pratica"];
const FACCE = [[1,"😕","Così così"],[2,"🙂","Bene"],[3,"😄","Benissimo"]];
let aOpen = false, aVoto = 0, aErr = "", attDet = false, asDet = false;                  /* card "Fatta" */
let arF = null, arM = "tutti", arA = "tutte";             /* filtri archivio */
function fasciaOf(c){ const b=birthOf(c); const m = b? ageParts(b,new Date()).months : 12; return m<12 ? 1 : m<18 ? 2 : 3; }
function fasciaLabel(f){ const x=FASCE.find(y=>y[0]===f); return x? x[1] : ""; }
function metodoLabel(m){ return m==="altro" ? "Altro" : m; }
function attByTitle(t){ return ATT.find(a=>a.t===t); }
function attToSheet(o){ const sd=toSerial(o.data); return [o.id, sd==null?o.data:sd, o.bambino, o.titolo, o.metodo, o.durata, o.voto, o.note||"", "app-genitori"]; }
/* righe fatte: foglio + coda locale, dalla più recente */
function attFatte(c){
  const ids = new Set(S.attiv.map(r=>r.id));
  const all = S.attiv.filter(r=>r.bambino===c && r.origine!=="test" && r.origine!=="prova").map(r=>Object.assign({pending:false}, r))
    .concat(S.qs.attivita.filter(q=>q.bambino===c && !ids.has(q.id)).map(q=>Object.assign({pending:true}, q)));
  all.forEach(r=>{ r._d=parseDate(r.data); });
  return all.filter(r=>r._d).sort((a,b)=>(b._d-a._d) || (ordOf(b.id)-ordOf(a.id)));
}
function attStats(c){
  const m = {};
  attFatte(c).forEach(r=>{ const a=attByTitle(r.titolo); if(!a) return;
    const s = m[a.id] || (m[a.id]={n:0, last:null, voto:null}); s.n++;
    if(!s.last || r._d>s.last){ s.last=r._d; s.voto=r.voto; } });
  return m;
}
function hashStr(s){ let h=2166136261; for(let i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=Math.imul(h,16777619); } return h>>>0; }
/* ordine del giorno, uguale su tutti i telefoni: mescolato con la data, in fondo quelle fatte negli ultimi 14 giorni (oggi escluso) */
function attOrder(c, day){
  const f=fasciaOf(c), t0=dayStart(0), lim=dayStart(14);
  const recent = new Set(attFatte(c).filter(r=>r._d>=lim && r._d<t0).map(r=>{ const a=attByTitle(r.titolo); return a? a.id : ""; }));
  const list = ATT.filter(a=>a.f===f).map(a=>({a, k:hashStr(day+"|"+c+"|"+a.id)})).sort((x,y)=>x.k-y.k).map(x=>x.a);
  return list.filter(a=>!recent.has(a.id)).concat(list.filter(a=>recent.has(a.id)));
}
function attState(){ const day=dayKey(dayStart(0)); if(!S.att || S.att.day!==day) S.att={day, n:0, pick:null}; return S.att; }
function attToday(c){
  const st=attState(), ord=attOrder(c, st.day);
  if(st.pick){ const p=ATT.find(a=>a.id===st.pick); if(p) return p; }
  return ord.length ? ord[st.n % ord.length] : null;
}
function attAltra(){ const st=attState(); st.n++; st.pick=null; aOpen=false; aVoto=0; aErr=""; save(); render(); }
function attScegli(id){ const st=attState(); st.pick=id; aOpen=false; aVoto=0; aErr=""; save(); go("oggi"); }
function addAttivita(){
  const a = attToday(S.child); if(!a) return;
  aErr = "";
  if(!aVoto){ aErr = "Scegli com'è andata."; render(); return; }
  let dur = num($("a-dur") ? $("a-dur").value : "");
  if(dur==null) dur = a.d;
  if(!(dur>=1 && dur<=180)){ aErr = "La durata va in minuti, tra 1 e 180."; render(); return; }
  const note = $("a-note") ? $("a-note").value.trim().slice(0,300) : "";
  S.qs.attivita.push({id:"genitori-attivita-"+Date.now(), data:stamp(new Date()), bambino:S.child, titolo:a.t, metodo:a.m, durata:Math.round(dur), voto:aVoto, note});
  aOpen=false; aVoto=0; save();
  toast("Attività segnata"); render(); sync(false);
}
function attBody(a){
  return '<div class="atags"><span class="ctag">'+esc(metodoLabel(a.m))+'</span><span class="chip">'+esc(a.ar)+'</span><span class="chip">'+a.d+' min</span><span class="chip">'+esc(fasciaLabel(a.f))+'</span></div>'+
    '<div class="asub">Materiali</div><ul class="amat">'+a.mat.map(x=>'<li>'+esc(x)+'</li>').join("")+'</ul>'+
    '<div class="asub">Come fare</div><ol class="asteps">'+a.p.map(x=>'<li>'+esc(x)+'</li>').join("")+'</ol>'+
    '<p class="princ">'+esc(a.n)+'</p>'+
    (a.s ? '<p class="asafe">'+esc(ATT_SAFE)+'</p>' : '');
}
function faceOf(v){ const f=FACCE.find(x=>x[0]===Number(v)); return f? f[1] : ""; }
function viewAttOggi(c){
  const a = attToday(c);
  let h = '<h2>Attività del giorno</h2><div class="panel att">';
  if(!a) return h + '<p class="lead">Nessuna attività per questa età.</p></div>';
  const t0 = dayStart(0), oggi = attFatte(c).filter(r=>r._d>=t0);
  const thisDone = oggi.find(r=>r.titolo===a.t);
  if(thisDone) h += '<p class="already">Fatta oggi alle '+pad(thisDone._d.getHours())+':'+pad(thisDone._d.getMinutes())+' '+faceOf(thisDone.voto)+(thisDone.pending?' <span class="tag">in attesa</span>':'')+'</p>';
  h += '<h3 class="atitle">'+esc(a.t)+'</h3><div class="atags"><span class="ctag">'+esc(metodoLabel(a.m))+'</span><span class="chip">'+esc(a.ar)+'</span><span class="chip">'+a.d+' min</span></div>';
  if(attDet || aOpen) h += '<div class="asub">Materiali</div><ul class="amat">'+a.mat.map(x=>'<li>'+esc(x)+'</li>').join("")+'</ul>'+
    '<div class="asub">Come fare</div><ol class="asteps">'+a.p.map(x=>'<li>'+esc(x)+'</li>').join("")+'</ol>'+
    '<p class="princ">'+esc(a.n)+'</p>'+(a.s ? '<p class="asafe">'+esc(ATT_SAFE)+'</p>' : '')+
    (aOpen?'':'<p style="margin:10px 0 0"><button class="linkbtn" data-attdet="0">Nascondi i dettagli</button></p>');
  else h += '<p style="margin:10px 0 0"><button class="linkbtn" data-attdet="1">Materiali e come fare</button></p>';
  if(aOpen){
    h += '<div class="afatta"><div class="asub">Com\u2019è andata?</div><div class="faces" role="group" aria-label="Com\u2019è andata">'+
      FACCE.map(f=>'<button data-avoto="'+f[0]+'" aria-pressed="'+(aVoto===f[0])+'"><span aria-hidden="true">'+f[1]+'</span>'+f[2]+'</button>').join("")+'</div>'+
      '<div class="grid3"><div class="field"><label for="a-dur">Durata</label><div class="unit"><input id="a-dur" inputmode="numeric" value="'+a.d+'"><b>min</b></div></div></div>'+
      '<div class="field"><label for="a-note">Note <span class="hint">(facoltative)</span></label><textarea id="a-note" maxlength="300" placeholder="Cosa l\u2019ha incuriosita, cosa cambiare la prossima volta"></textarea></div>'+
      (aErr?'<p class="formerr" id="aerr">'+esc(aErr)+'</p>':'')+
      '<div class="arow"><button class="btn" id="a-save">Salva</button><button class="btn ghost" id="a-cancel">Annulla</button></div></div>';
  }else{
    h += '<div class="arow"><button class="btn" id="a-open">'+(thisDone?"Fatta di nuovo":"Fatta")+'</button><button class="btn ghost" id="a-altra">Un\u2019altra</button></div>';
  }
  const altre = oggi.filter(r=>r.titolo!==a.t);
  if(altre.length) h += '<p class="lead" style="margin:14px 0 0;font-size:15px">Oggi anche: '+altre.map(r=>esc(r.titolo)+' '+faceOf(r.voto)).join(", ")+'</p>';
  return h + '</div>';
}
function viewArchivio(){
  const c=S.child, cur=fasciaOf(c), f = arF==null ? cur : arF, st=attStats(c);
  const list = ATT.filter(a=>(f===0||a.f===f) && (arM==="tutti"||a.m===arM) && (arA==="tutte"||a.ar===arA));
  let h = '<p style="margin:20px 0 0"><button class="btn ghost small" data-go="oggi">Torna a Oggi</button></p>'+
    '<h2>Tutte le attività</h2><div class="panel">'+
    '<div class="asub">Età</div><div class="seg">'+[[0,"Tutte"]].concat(FASCE).map(x=>'<button data-arf="'+x[0]+'" aria-pressed="'+(f===x[0])+'">'+x[1]+(x[0]===cur&&c==="Sibilla"?' ●':'')+'</button>').join("")+'</div>'+
    '<div class="asub">Metodo</div><div class="seg">'+[["tutti","Tutti"],["Pikler","Pikler"],["Montessori","Montessori"],["altro","Altro"]].map(x=>'<button data-arm="'+x[0]+'" aria-pressed="'+(arM===x[0])+'">'+x[1]+'</button>').join("")+'</div>'+
    '<div class="asub">Area</div><div class="seg" style="margin:0">'+["tutte"].concat(AREE_ATT).map(x=>'<button data-ara="'+x+'" aria-pressed="'+(arA===x)+'">'+(x==="tutte"?"Tutte":x)+'</button>').join("")+'</div>'+
    '</div>';
  h += '<p class="lead" style="margin:14px 2px 8px">'+plural(list.length,"attività","attività")+(c==="Sibilla"&&f===cur?', fascia di Sibilla':'')+'</p>';
  if(!list.length) return h + '<div class="panel"><p class="empty">Nessuna attività con questi filtri.</p></div>';
  h += '<div class="panel arch">'+list.map(a=>{
    const s=st[a.id];
    return '<details><summary><span class="stit">'+esc(a.t)+(s?' <span class="done">✓</span>':'')+'</span>'+
      '<span class="smeta">'+esc(metodoLabel(a.m))+', '+esc(a.ar.toLowerCase())+', '+a.d+' min'+(f===0?', '+esc(fasciaLabel(a.f)):'')+
      (s?'<br>fatta '+(s.n===1?'una volta':s.n+' volte')+', l\u2019ultima il '+esc(shortDate(s.last))+' '+faceOf(s.voto):'')+'</span></summary>'+
      '<div class="att">'+attBody(a)+(c==="Sibilla"?'<p style="margin:12px 0 4px"><button class="btn small" data-apick="'+a.id+'">Scegli per oggi</button></p>':'')+'</div></details>';
  }).join("")+'</div>';
  return h;
}

/* ---------- sviluppo e ambiente (blocco 4c) ----------
   Tappe: CDC "Learn the Signs. Act Early." 2022 (Zubler et al., Pediatrics 2022;149(3):e2021052138), 9–24 mesi.
   Le tappe CDC su mangiare, bere, lavarsi e vestirsi sono raccolte nell'area "autonomia".
   Il testo di "t" è quello scritto nella colonna Tappa del foglio: non cambiarlo, o le righe vecchie non vengono più riconosciute. */
const AREE_SV = [["motorio","Movimento"],["linguaggio","Linguaggio"],["sociale","Relazioni ed emozioni"],["cognitivo","Pensiero e scoperta"],["autonomia","Autonomia"]];
const SV_ATT = {motorio:"Movimento", linguaggio:"Linguaggio", cognitivo:"Mani", autonomia:"Vita pratica"};
const ETA_SV = [9,12,15,18,24];
const TAPPE = [
{id:"t09-s1", m:9, ar:"sociale", t:"È timida, si aggrappa a te o ha paura con gli estranei"},
{id:"t09-s2", m:9, ar:"sociale", t:"Fa diverse espressioni del viso: felice, triste, arrabbiata, sorpresa"},
{id:"t09-s3", m:9, ar:"sociale", t:"Si gira quando la chiami per nome"},
{id:"t09-s4", m:9, ar:"sociale", t:"Reagisce quando ti allontani: ti guarda, ti cerca con le braccia o piange"},
{id:"t09-s5", m:9, ar:"sociale", t:"Sorride o ride quando giocate a cucù"},
{id:"t09-l1", m:9, ar:"linguaggio", t:"Fa tanti suoni diversi, come «mamamama» e «babababa»"},
{id:"t09-l2", m:9, ar:"linguaggio", t:"Alza le braccia per farsi prendere in braccio"},
{id:"t09-c1", m:9, ar:"cognitivo", t:"Cerca un oggetto che cade e sparisce dalla vista, come il cucchiaio o un gioco"},
{id:"t09-c2", m:9, ar:"cognitivo", t:"Batte due oggetti uno contro l'altro"},
{id:"t09-m1", m:9, ar:"motorio", t:"Si mette seduta da sola"},
{id:"t09-m2", m:9, ar:"motorio", t:"Passa un oggetto da una mano all'altra"},
{id:"t09-m3", m:9, ar:"motorio", t:"Usa le dita per «rastrellare» il cibo verso di sé"},
{id:"t09-m4", m:9, ar:"motorio", t:"Sta seduta senza appoggio"},

{id:"t12-s1", m:12, ar:"sociale", t:"Fa giochi con te, come «batti le manine»"},
{id:"t12-l1", m:12, ar:"linguaggio", t:"Fa «ciao ciao» con la mano"},
{id:"t12-l2", m:12, ar:"linguaggio", t:"Chiama un genitore «mamma», «papà» o con un nome tutto suo"},
{id:"t12-l3", m:12, ar:"linguaggio", t:"Capisce il «no»: si ferma un attimo o smette quando lo dici"},
{id:"t12-c1", m:12, ar:"cognitivo", t:"Mette un oggetto in un contenitore, come un cubo in una tazza"},
{id:"t12-c2", m:12, ar:"cognitivo", t:"Cerca un gioco che ti ha visto nascondere, per esempio sotto una coperta"},
{id:"t12-m1", m:12, ar:"motorio", t:"Si tira su in piedi"},
{id:"t12-m2", m:12, ar:"motorio", t:"Cammina tenendosi ai mobili"},
{id:"t12-m3", m:12, ar:"motorio", t:"Prende cose piccole tra pollice e indice, come pezzetti di cibo"},
{id:"t12-a1", m:12, ar:"autonomia", t:"Beve da un bicchiere senza coperchio, se glielo tieni tu"},

{id:"t15-s1", m:15, ar:"sociale", t:"Imita gli altri bambini mentre gioca, per esempio toglie i giochi da un contenitore come fa un altro"},
{id:"t15-s2", m:15, ar:"sociale", t:"Ti mostra un oggetto che le piace"},
{id:"t15-s3", m:15, ar:"sociale", t:"Batte le mani quando è contenta"},
{id:"t15-s4", m:15, ar:"sociale", t:"Abbraccia un pupazzo o una bambola"},
{id:"t15-s5", m:15, ar:"sociale", t:"Ti mostra affetto con abbracci, coccole o baci"},
{id:"t15-l1", m:15, ar:"linguaggio", t:"Prova a dire una o due parole oltre a «mamma» e «papà», come «pa» per palla"},
{id:"t15-l2", m:15, ar:"linguaggio", t:"Guarda un oggetto familiare quando lo nomini"},
{id:"t15-l3", m:15, ar:"linguaggio", t:"Segue una richiesta fatta con un gesto e con le parole, come «dammi il gioco» con la mano tesa"},
{id:"t15-l4", m:15, ar:"linguaggio", t:"Indica col dito per chiedere qualcosa o farsi aiutare"},
{id:"t15-c1", m:15, ar:"cognitivo", t:"Prova a usare le cose nel modo giusto, come un telefono, un bicchiere o un libro"},
{id:"t15-c2", m:15, ar:"cognitivo", t:"Impila almeno due oggetti piccoli, come due cubi"},
{id:"t15-m1", m:15, ar:"motorio", t:"Fa qualche passo da sola"},
{id:"t15-a1", m:15, ar:"autonomia", t:"Mangia da sola qualche cibo con le dita"},

{id:"t18-s1", m:18, ar:"sociale", t:"Si allontana da te, ma si gira a controllare che tu sia vicino"},
{id:"t18-s2", m:18, ar:"sociale", t:"Indica per mostrarti qualcosa di interessante"},
{id:"t18-s3", m:18, ar:"sociale", t:"Guarda qualche pagina di un libro insieme a te"},
{id:"t18-l1", m:18, ar:"linguaggio", t:"Prova a dire tre o più parole oltre a «mamma» e «papà»"},
{id:"t18-l2", m:18, ar:"linguaggio", t:"Segue una richiesta semplice senza gesti, come «dammelo»"},
{id:"t18-c1", m:18, ar:"cognitivo", t:"Ti imita nelle faccende, come spazzare con la scopa"},
{id:"t18-c2", m:18, ar:"cognitivo", t:"Gioca con i giochi in modo semplice, come spingere una macchinina"},
{id:"t18-m1", m:18, ar:"motorio", t:"Cammina senza tenersi a niente e a nessuno"},
{id:"t18-m2", m:18, ar:"motorio", t:"Scarabocchia"},
{id:"t18-m3", m:18, ar:"motorio", t:"Sale e scende da un divano o da una sedia senza aiuto"},
{id:"t18-a1", m:18, ar:"autonomia", t:"Porge le mani per farsele lavare"},
{id:"t18-a2", m:18, ar:"autonomia", t:"Ti aiuta a vestirla infilando il braccio nella manica o alzando il piede"},
{id:"t18-a3", m:18, ar:"autonomia", t:"Beve da un bicchiere senza coperchio, anche se a volte rovescia"},
{id:"t18-a4", m:18, ar:"autonomia", t:"Mangia da sola con le dita"},
{id:"t18-a5", m:18, ar:"autonomia", t:"Prova a usare il cucchiaio"},

{id:"t24-s1", m:24, ar:"sociale", t:"Si accorge quando qualcuno si è fatto male o è triste: si ferma o diventa seria"},
{id:"t24-s2", m:24, ar:"sociale", t:"Ti guarda in viso per capire come reagire in una situazione nuova"},
{id:"t24-l1", m:24, ar:"linguaggio", t:"Indica le figure di un libro quando chiedi, per esempio, «dov'è l'orso?»"},
{id:"t24-l2", m:24, ar:"linguaggio", t:"Dice almeno due parole insieme, come «ancora latte»"},
{id:"t24-l3", m:24, ar:"linguaggio", t:"Indica almeno due parti del corpo quando glielo chiedi"},
{id:"t24-l4", m:24, ar:"linguaggio", t:"Usa altri gesti oltre a salutare e indicare, come mandare un bacio o fare sì con la testa"},
{id:"t24-c1", m:24, ar:"cognitivo", t:"Tiene una cosa in una mano mentre usa l'altra, per esempio regge un barattolo e toglie il coperchio"},
{id:"t24-c2", m:24, ar:"cognitivo", t:"Prova a usare interruttori, manopole o pulsanti di un gioco"},
{id:"t24-c3", m:24, ar:"cognitivo", t:"Gioca con più giochi insieme, come mettere il cibo finto su un piattino"},
{id:"t24-m1", m:24, ar:"motorio", t:"Calcia una palla"},
{id:"t24-m2", m:24, ar:"motorio", t:"Corre"},
{id:"t24-m3", m:24, ar:"motorio", t:"Sale qualche gradino camminando (non a gattoni), con o senza aiuto"},
{id:"t24-a1", m:24, ar:"autonomia", t:"Mangia con il cucchiaio"}
];
let sAge = null, tOpen = null, tErr = "";   /* sviluppo */
let ambF = null;                             /* ambiente */
function areaSv(a){ const x=AREE_SV.find(y=>y[0]===a); return x? x[1] : a; }
function svToSheet(o){ return [o.id, daySerial(o.day), o.bambino, o.area, o.tappa, o.note||"", "app-genitori"]; }
function isTolta(note){ return /^tolta/i.test(String(note||"").trim()); }
/* per ogni tappa la riga più recente: raggiunta, oppure "tolta" */
function svilMap(c){
  const ids = new Set(S.svil.map(r=>r.id));
  const all = S.svil.filter(r=>r.bambino===c && r.tappa && r.origine!=="test" && r.origine!=="prova")
      .map(r=>Object.assign({}, r, {pending:false, ord:ordOf(r.id), idx:r.i||0}))
    .concat(S.qs.sviluppo.filter(q=>q.bambino===c && !ids.has(q.id))
      .map(q=>Object.assign({}, q, {pending:true, ord:ordOf(q.id), idx:1e12+ordOf(q.id)})));
  const map = {};
  all.forEach(r=>{ if(!map[r.tappa] || newer(r, map[r.tappa])) map[r.tappa]=r; });
  Object.keys(map).forEach(k=>{ if(isTolta(map[k].note)) delete map[k]; });
  return map;
}
/* età delle tappe da guardare: la prima che non ha ancora superato (11 mesi → 12) */
function tappeAge(c){ const b=birthOf(c); const m = b? ageParts(b,new Date()).months : 12; return ETA_SV.find(a=>a>=m) || 24; }
function svCount(map, age){ const l=TAPPE.filter(t=>age==null||t.m===age); return {done:l.filter(t=>map[t.t]).length, tot:l.length}; }
function addTappa(id){
  const tp = TAPPE.find(t=>t.id===id); if(!tp) return;
  const k = $("t-data") ? $("t-data").value : "", d = dayFromKey(k), b = birthOf(S.child);
  tErr = "";
  if(!d) tErr = "Indica il giorno.";
  else if(d > dayStart(0)) tErr = "Il giorno è nel futuro: controllalo.";
  else if(b && d < new Date(b.getFullYear(), b.getMonth(), b.getDate())) tErr = "Il giorno è prima della nascita: controllalo.";
  if(tErr){ render(); return; }
  let note = $("t-note") ? $("t-note").value.trim().slice(0,200) : "";
  if(isTolta(note)) note = "· " + note;
  S.qs.sviluppo.push({id:"genitori-sviluppo-"+Date.now(), day:k, bambino:S.child, area:tp.ar, tappa:tp.t, note});
  tOpen = null; save(); toast("Tappa segnata"); render(); sync(false);
}
function togliTappa(id){
  const tp = TAPPE.find(t=>t.id===id); if(!tp) return;
  S.qs.sviluppo.push({id:"genitori-sviluppo-"+Date.now(), day:dayKey(dayStart(0)), bambino:S.child, area:tp.ar, tappa:tp.t, note:"tolta"});
  save(); toast("Spunta tolta"); render(); sync(false);
}
function onlySibilla(title){
  return '<p style="margin:20px 0 0"><button class="btn ghost small" data-go="oggi">Torna a Oggi</button></p><h2>'+title+'</h2>'+
    '<div class="panel"><p class="lead">Questa sezione è pensata per Sibilla.</p><p style="margin:12px 0 0"><button class="btn" data-child="Sibilla">Passa a Sibilla</button></p></div>';
}
function viewSviluppo(){
  const c = S.child; if(c!=="Sibilla") return onlySibilla("Tappe di sviluppo");
  const map = svilMap(c), cur = tappeAge(c), age = sAge || cur, all = svCount(map, null);
  let h = '<p style="margin:20px 0 0"><button class="btn ghost small" data-go="oggi">Torna a Oggi</button></p>'+
    '<h2>Tappe di sviluppo</h2><div class="panel">'+
    '<p class="lead">Cose che fa la maggior parte dei bambini (almeno 3 su 4) entro una certa età. Ognuno ha i suoi tempi: segnatele quando le vedete, come in un diario.</p>'+
    '<div class="asub">Età</div><div class="seg" style="margin:0">'+ETA_SV.map(a=>{ const n=svCount(map,a);
      return '<button data-sage="'+a+'" aria-pressed="'+(a===age)+'">'+a+' mesi <small class="segn">'+n.done+'/'+n.tot+'</small>'+(a===cur?' ●':'')+'</button>'; }).join("")+'</div>'+
    '<p class="lead" style="font-size:14.5px;margin:12px 0 0">In tutto '+plural(all.done,"tappa raggiunta","tappe raggiunte")+' su '+all.tot+'. ● = l\u2019età da osservare adesso.</p></div>';
  AREE_SV.forEach(([ak,al])=>{
    const list = TAPPE.filter(t=>t.m===age && t.ar===ak); if(!list.length) return;
    const done = list.filter(t=>map[t.t]).length;
    h += '<div class="panel svp"><div class="svh"><h3>'+al+'</h3><span class="svn">'+done+'/'+list.length+'</span></div><ul class="tlist">';
    list.forEach(t=>{
      const r = map[t.t], open = tOpen===t.id;
      h += '<li><div class="trow"><button class="tchk" data-topen="'+t.id+'" aria-pressed="'+(!!r)+'" aria-label="'+(r?"Raggiunta: ":"Segna: ")+esc(t.t)+'">'+(r?'✓':'')+'</button>'+
        '<div class="ttx"><div>'+esc(t.t)+'</div>'+
        (r ? '<div class="tmeta">dal '+esc(shortDate(dayFromKey(r.day)||new Date()))+(r.pending?' <span class="tag">in attesa</span>':'')+(r.note?' · '+esc(r.note):'')+
             ' · <button class="linkbtn" data-toff="'+t.id+'">togli</button></div>' : '')+'</div></div>';
      if(open && !r){
        h += '<div class="tform"><div class="grid3"><div class="field"><label for="t-data">Da quando</label><input type="date" id="t-data" max="'+dayKey(dayStart(0))+'" value="'+dayKey(dayStart(0))+'"></div></div>'+
          '<div class="field"><label for="t-note">Nota <span class="hint">(facoltativa)</span></label><input id="t-note" maxlength="200" placeholder="Dove, con chi, com\u2019è andata"></div>'+
          (tErr?'<p class="formerr">'+esc(tErr)+'</p>':'')+
          '<div class="arow" style="margin-top:4px"><button class="btn" id="t-save" data-tid="'+t.id+'">Salva</button><button class="btn ghost" id="t-cancel">Annulla</button></div></div>';
      }
      h += '</li>';
    });
    h += '</ul>';
    if(SV_ATT[ak]) h += '<p style="margin:10px 0 0"><button class="btn ghost small" data-sact="'+SV_ATT[ak]+'">Attività per '+esc(SV_ATT[ak].toLowerCase())+'</button></p>';
    h += '</div>';
  });
  h += '<div class="panel"><p class="lead" style="font-size:14.5px;margin:0">Se qualcosa vi preoccupa, se a un\u2019età mancano più tappe o se perde capacità che aveva, parlatene con il pediatra: non serve aspettare il bilancio di salute.</p>'+
    '<p class="lead" style="font-size:13.5px;margin:10px 0 0">Fonte: tappe CDC «Learn the Signs. Act Early.» (2022), tradotte. In Autonomia sono raccolte le tappe CDC su mangiare, bere, lavarsi e vestirsi. Per togliere una spunta l\u2019app aggiunge una riga «tolta» nel foglio.</p></div>';
  return h;
}

/* Ambiente: fonti Montessori 0–3 (S. Davies, AMI), principi Pikler, Ministero della Salute e Società Italiana di Pediatria (prevenzione incidenti domestici). */
const AMB = {
1:{intro:"Gattona, si siede e si tira su: la casa va vista dal pavimento, alla sua altezza.",
  spazi:["Un pezzo di pavimento libero e sicuro dove muoversi a lungo, con un tappeto non scivoloso: meglio del box o della sdraietta.","Un mobile basso e pesante (o una barra fissata al muro) per tirarsi su da sola.","Uno specchio infrangibile basso, fissato al muro, accanto allo spazio di gioco.","Se dorme in un letto a terra, tutta la stanza deve essere sicura come lo spazio di gioco."],
  mat:["Uno scaffale basso con pochi oggetti (4–6), da cambiare ogni tanto, invece di una cesta piena.","Cestino dei tesori, palle di stoffa, scatole per imbucare, contenitori da aprire e chiudere.","Libri di cartone con immagini vere, appoggiati con la copertina in vista."],
  sic:["Copriprese, cavi e caricabatterie fuori portata, cordini di tende e veneziane legati in alto.","Mobili alti (librerie, cassettiere, TV) ancorati al muro.","Niente oggetti piccoli a terra: se passa dentro un rotolo di carta igienica, è troppo piccolo. Attenzione speciale a pile a bottone e magneti.","Detersivi e farmaci in alto e chiusi, mai in bottiglie da bevanda.","Niente girello: non aiuta a camminare e fa cadere (lo sconsiglia la Società Italiana di Pediatria). Pikler: niente posizioni che non sa prendere da sola."]},
2:{intro:"Comincia a camminare e arriva più in alto: piani dei tavoli, cassetti, maniglie.",
  spazi:["Un tavolino e uno sgabello alla sua misura, dove i piedi toccano terra.","Un gancio basso per la giacca e un cestino per le scarpe vicino alla porta.","Un angolo libri con pochi titoli in vista e un cuscino.","Un percorso libero per camminare e spingere un carrello pesante e stabile."],
  mat:["Bicchiere piccolo vero, piattino e cucchiaio alla sua misura.","Incastri semplici, cubi grandi, palle, scatole con coperchio.","Un triangolo o una scaletta bassa per arrampicarsi, sempre con un adulto vicino."],
  sic:["Manici delle pentole girati verso l\u2019interno, fornelli dietro quando si può, niente tovaglie che si possono tirare.","Bevande calde mai in mano mentre la tieni in braccio, né sul bordo del tavolo.","Fermaporta contro le dita schiacciate; cassetti con farmaci e coltelli chiusi.","Borse e zaini degli ospiti fuori portata: spesso dentro ci sono farmaci.","Mai sola vicino all\u2019acqua: bastano pochi centimetri (vasca, secchio, catino)."]},
3:{intro:"Si arrampica, corre e vuole fare da sola: l\u2019ambiente può aiutarla a riuscirci.",
  spazi:["Una torre di apprendimento o uno sgabello stabile in cucina, per guardare e aiutare con un adulto accanto.","Un angolo per la vita pratica: spugna, panno, scopino piccolo, una brocca piccola.","Uno specchio con spazzola vicino al gancio dei vestiti.","Se iniziate a proporre il vasino, mettilo sempre nello stesso posto."],
  mat:["Pastelli grossi e fogli grandi fissati al tavolo con il nastro.","Travasi con acqua o cibi grandi (niente legumi secchi né frutta secca).","Vestiti facili da infilare per provare da sola."],
  sic:["Niente sedie o mobili sotto finestre e vicino ai piani di lavoro: diventano scale.","Finestre con fermo e balconi senza punti d\u2019appoggio per arrampicarsi.","Chiavi, accendini e fiammiferi in alto.","Seggiolone e sgabelli sempre con cintura o con un adulto accanto."]}
};
const BAITA = [
["Scale",["Cancelletto in alto e in basso; quello in alto avvitato al muro, non a pressione.","Insegnale a scendere a gattoni all\u2019indietro, con calma, sempre con te sotto.","Dai 18 mesi può salire tenendo la tua mano o un corrimano alla sua altezza."]],
["Stufa",["Un parafuoco fisso attorno alla stufa: il vetro scotta anche quando il fuoco si sta spegnendo.","Un rilevatore di monossido di carbonio nella stanza della stufa.","Cenere in un secchio di metallo con coperchio, fuori casa; attizzatoio e fiammiferi in alto."]],
["Legna",["Catasta stabile e fuori dal suo percorso: può crollare se si arrampica.","Attenzione alle schegge; guanti piccoli quando vuole aiutarti.","Dai 18 mesi può portare un rametto alla cesta insieme a te: è vita pratica vera."]],
["Prato e aiuole",["Prima di lasciarla libera, un giro per togliere sassolini, pigne piccole, bacche e funghi.","Cappellino e crema solare: in quota il sole è più forte, anche quando fa fresco.","Dopo l\u2019erba alta, controlla la pelle per le zecche; secchi e abbeveratoi vuoti o coperti."]]
];
function viewAmbiente(){
  const c = S.child; if(c!=="Sibilla") return onlySibilla("Ambiente di casa");
  const cur = fasciaOf(c), f = ambF || cur, a = AMB[f];
  const sec = (tit, list)=>'<div class="asub">'+tit+'</div><ul class="amat">'+list.map(x=>'<li>'+esc(x)+'</li>').join("")+'</ul>';
  let h = '<p style="margin:20px 0 0"><button class="btn ghost small" data-go="oggi">Torna a Oggi</button></p>'+
    '<h2>Ambiente di casa</h2><div class="panel">'+
    '<div class="seg" style="margin:0">'+FASCE.map(x=>'<button data-ambf="'+x[0]+'" aria-pressed="'+(f===x[0])+'">'+x[1]+(x[0]===cur?' ●':'')+'</button>').join("")+'</div>'+
    '<p class="princ">'+esc(a.intro)+'</p>'+sec("Spazi", a.spazi)+sec("Materiali", a.mat)+'</div>'+
    '<h2>Sicurezza</h2><div class="panel"><ul class="amat">'+a.sic.map(x=>'<li>'+esc(x)+'</li>').join("")+'</ul>'+
    (f>1?'<p class="lead" style="font-size:14.5px;margin:10px 0 0">Valgono ancora le regole delle età prima: prese, mobili ancorati, oggetti piccoli, farmaci chiusi.</p>':'')+'</div>'+
    '<h2>In baita</h2><div class="panel">'+BAITA.map(b=>sec(b[0], b[1])).join("")+'</div>'+
    '<div class="panel"><p class="lead" style="font-size:13.5px;margin:0">Fonti: Montessori 0–3 (Simone Davies, AMI), principi Pikler, Ministero della Salute e Società Italiana di Pediatria sulla prevenzione degli incidenti in casa. Per dubbi specifici, il pediatra.</p></div>';
  return h;
}
function viewSvOggi(c){
  const map = svilMap(c), age = tappeAge(c), n = svCount(map, age), all = svCount(map, null);
  const next = TAPPE.filter(t=>t.m===age && !map[t.t]).slice(0,2);
  let h = '<h2>Sviluppo e casa</h2><div class="panel">'+
    '<div class="stats"><div><div class="big">'+n.done+' <small>di '+n.tot+'</small></div><div class="lead">tappe dei '+age+' mesi</div></div>'+
    '<div><div class="big">'+all.done+'</div><div class="lead">'+(all.done===1?"tappa raggiunta":"tappe raggiunte")+' in tutto</div></div></div>';
  if(next.length) h += '<p class="lead" style="font-size:15px;margin:12px 0 0">Da osservare: '+next.map(t=>esc(t.t.charAt(0).toLowerCase()+t.t.slice(1))).join("; ")+'.</p>';
  h += '<div class="arow"><button class="btn ghost" data-go="sviluppo">Tappe di sviluppo</button><button class="btn ghost" data-go="ambiente">Ambiente di casa</button></div></div>';
  return h;
}

