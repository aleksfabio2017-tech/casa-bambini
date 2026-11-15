/* ---------- disegno ---------- */
const ICONS = {
  oggi:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  crescita:'<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  nanna:'<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>',
  diario:'<path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z"/><path d="M5 17a3 3 0 0 1 3-3h11"/>',
  salute:'<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/><path d="M12 10v4M10 12h4"/>',
  impostazioni:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>'
};
const TABS = [["oggi","Oggi"],["crescita","Crescita"],["salute","Salute"],["nanna","Nanna"],["diario","Diario"]];

function statusChip(){
  const q = pendingCount();
  if(syncing || net.state==="connecting") return '<span class="dot"><i></i>Sincronizzo</span>';
  if(net.state==="error"||net.state==="offline") return '<button class="dot err" data-go="impostazioni" aria-label="Foglio non collegato"><i></i>'+(q?q+" in attesa":"Offline")+'</button>';
  if(q) return '<button class="dot wait" data-go="impostazioni"><i></i>'+q+' in attesa</button>';
  return '<button class="dot ok" data-go="impostazioni" aria-label="Foglio collegato"><i></i>'+(S.lastSync?timeOf(S.lastSync):"Collegato")+'</button>';
}

function renderHead(){
  const c=S.child, b=birthOf(c), now=new Date();
  const age = b ? esc(ageLabel(b,now)) : 'data di nascita non letta';
  $("head").innerHTML =
    '<div class="hbar"><div class="switch" role="group" aria-label="Bambino">'+
      CHILDREN.map(n=>'<button data-child="'+n+'" aria-pressed="'+(n===c)+'"><i class="av" aria-hidden="true">'+n.charAt(0)+'</i>'+n+'</button>').join("")+
    '</div><span class="tright">'+statusChip()+
      '<button class="gear" data-go="impostazioni" aria-label="Impostazioni"'+(tab==="impostazioni"?' aria-current="page"':'')+'><svg viewBox="0 0 24 24" aria-hidden="true">'+ICONS.impostazioni+'</svg></button></span></div>'+
    '<h1 class="sr">'+esc(c)+'</h1><div class="hsub"><b>'+esc(c)+'</b> · '+age+' · '+esc(longDate(now))+(P.chi?' · '+esc(P.chi):'')+'</div>';
}

const NAV = [["oggi","Oggi"],["crescita","Crescita"],["+","Aggiungi"],["salute","Salute"],["diario","Diario"]];
function renderNav(){
  const cur = (k)=> k===tab || (k==="oggi"&&["attivita","sviluppo","ambiente","settimana","nanna","riepilogo"].includes(tab)) || (k==="crescita"&&tab==="pediatra");
  $("nav").innerHTML = NAV.map(([k,l])=> k==="+"
    ? '<button class="navplus" id="fab" aria-haspopup="dialog" aria-label="Aggiungi"><span aria-hidden="true">+</span></button>'
    : '<button data-go="'+k+'"'+(cur(k)?' aria-current="page"':'')+'><svg viewBox="0 0 24 24" aria-hidden="true">'+ICONS[k]+'</svg>'+l+'</button>').join("");
}

function lastValues(c){
  const ms = measuresFor(c);
  const pick = k=>{ for(let i=ms.length-1;i>=0;i--) if(ms[i][k]!=null) return ms[i]; return null; };
  return {peso:pick("peso"), altezza:pick("altezza"), cc:pick("cc"), count:ms.length};
}

