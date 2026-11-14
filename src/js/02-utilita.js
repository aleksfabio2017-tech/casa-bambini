/* ---------- utilità ---------- */
const $ = (id)=>document.getElementById(id);
function esc(s){ return String(s==null?"":s).replace(/[&<>"']/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
function num(v){
  if(v==null) return null;
  if(typeof v==="number") return isFinite(v)?v:null;
  const t = String(v).trim().replace(/\s/g,"").replace(",",".");
  if(t==="") return null;
  const n = Number(t); return isFinite(n)?n:null;
}
function pad(n){ return String(n).padStart(2,"0"); }
function parseDate(v){
  if(v==null||v==="") return null;
  if(typeof v==="number") return fromSerial(v);
  const s = String(v).trim();
  if(/^\d{5}(?:[.,]\d+)?$/.test(s)) return fromSerial(Number(s.replace(",",".")));
  let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:[ T](\d{1,2}):(\d{2}))?/);
  if(m) return new Date(+m[1], +m[2]-1, +m[3], +(m[4]||12), +(m[5]||0));
  m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2}))?/);
  if(m) return new Date(+m[3], +m[2]-1, +m[1], +(m[4]||12), +(m[5]||0));
  return null;
}
/* Date per il foglio: numero-data di Sheets (giorni dal 30/12/1899, ora locale) */
function fromSerial(n){
  if(!isFinite(n) || n<20000) return null;
  const ms = Math.round((n - 25569) * 864e5 / 60000) * 60000, u = new Date(ms);
  return new Date(u.getUTCFullYear(), u.getUTCMonth(), u.getUTCDate(), u.getUTCHours(), u.getUTCMinutes());
}
function toSerial(v){
  const d = parseDate(v); if(!d) return null;
  return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes()) / 864e5 + 25569;
}
function stamp(d){ return d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate())+" "+pad(d.getHours())+":"+pad(d.getMinutes()); }
const MESI = ["gennaio","febbraio","marzo","aprile","maggio","giugno","luglio","agosto","settembre","ottobre","novembre","dicembre"];
const GIORNI = ["domenica","lunedì","martedì","mercoledì","giovedì","venerdì","sabato"];
function longDate(d){ return GIORNI[d.getDay()]+" "+d.getDate()+" "+MESI[d.getMonth()]; }
function shortDate(d){ return d.getDate()+" "+MESI[d.getMonth()].slice(0,3)+" "+String(d.getFullYear()).slice(2); }
function timeOf(ts){ const d=new Date(ts); return pad(d.getHours())+":"+pad(d.getMinutes()); }
function fmt(n,dec){ return n==null?"":n.toLocaleString("it-IT",{minimumFractionDigits:0,maximumFractionDigits:dec}); }

function ageParts(b,d){
  let y=d.getFullYear()-b.getFullYear(), m=d.getMonth()-b.getMonth(), dd=d.getDate()-b.getDate();
  if(dd<0){ m--; dd += new Date(d.getFullYear(), d.getMonth(), 0).getDate(); }
  if(m<0){ y--; m+=12; }
  return {months:Math.max(0,y*12+m), days:Math.max(0,dd)};
}
function plural(n,one,many){ return n+" "+(n===1?one:many); }
function ageLabel(b,d){
  if(!b||!d||d<b) return "";
  const a = ageParts(b,d);
  if(a.months<24){
    if(a.months===0) return plural(a.days,"giorno","giorni");
    return plural(a.months,"mese","mesi") + (a.days? " e "+plural(a.days,"giorno","giorni"):"");
  }
  const y=Math.floor(a.months/12), r=a.months%12;
  return plural(y,"anno","anni") + (r? " e "+plural(r,"mese","mesi"):"");
}
function shortAge(b,d){
  if(!b||!d||d<b) return "";
  const a=ageParts(b,d);
  if(a.months<24) return a.months+" m";
  return Math.floor(a.months/12)+" a "+(a.months%12)+" m";
}
function birthOf(c){ return parseDate(S.births[c]); }
function toast(msg){ const t=$("toast"); t.textContent=msg; t.classList.add("show"); clearTimeout(toast._t); toast._t=setTimeout(()=>t.classList.remove("show"),2400); }

/* righe: {id,data,bambino,peso,altezza,cc,dove,note,origine} */
function fromSheet(r){
  return {id:r[0]||"", data:r[1]||"", bambino:r[2]||"", peso:num(r[3]), altezza:num(r[4]), cc:num(r[5]), dove:r[6]||"", note:r[7]||"", origine:r[8]||""};
}
function toSheet(o){
  const sd = toSerial(o.data);
  return [o.id, sd==null ? o.data : sd, o.bambino, o.peso==null?"":o.peso, o.altezza==null?"":o.altezza, o.cc==null?"":o.cc, o.dove||"", o.note||"", "app-genitori"];
}
function measuresFor(c){
  const sheetIds = new Set(S.rows.map(r=>r.id));
  const all = S.rows.filter(r=>r.bambino===c && r.origine!=="prova").map(r=>Object.assign({pending:false},r))
    .concat(S.queue.filter(q=>q.bambino===c && !sheetIds.has(q.id)).map(q=>Object.assign({pending:true},q)));
  all.forEach(r=>{ r._d = parseDate(r.data); });
  return all.filter(r=>r._d).sort((a,b)=>a._d-b._d);
}

