/* ---------- dashboard Edoardo (fase 3) ---------- */
const AB_MAP = {"Contare fino a 5":["Marte",1,"Le stelle perse",1],"Contare fino a 10":["Marte",2,"Il deposito dei razzi",1],"Contare fino a 20":["Marte",7,"Il grande ammasso",1],"Più e meno":["Marte",3,"Chi ne ha di più?",1],"Addizioni entro 5":["Marte",4,"Carburante!",1],"Addizioni entro 10":["Marte",8,"Carburante doppio",1],"Sottrazioni entro 5":["Marte",5,"Decollo!",1],"Sottrazioni entro 10":["Marte",9,"Asteroidi in fuga",1],"Addizioni entro 20":["Marte",15,"Sfida 5",1],"Sottrazioni entro 20":["Marte",16,"Sfida 6",1],"Ordine dei numeri":["Marte",6,"Conto alla rovescia",1],"Riconoscere le forme":["Luna",1,"Forme lunari",1],"Sequenze e ritmi":["Luna",2,"La collana di stelle",1],"Grande e piccolo":["Luna",3,"Grandi e piccoli",1],"Trovare l’intruso":["Luna",4,"L’intruso spaziale",1],"Le vocali":["Giove",1,"Le vocali di Giove",1],"Suono iniziale":["Giove",3,"Suoni gemelli",1],"Riconoscere le lettere":["Giove",4,"Le prime consonanti",1],"Dividere in sillabe":["Giove",5,"Batti le mani",1],"Inglese: colori":["Saturno",1,"Colors",1],"Inglese: numeri 1–10":["Saturno",2,"Numbers",1],"Inglese: animali":["Saturno",3,"Animals",1],"Inglese: parole dello spazio":["Saturno",4,"Space words",1],"Inglese: cibo":["Saturno",6,"Food",1],"Inglese: il corpo":["Saturno",7,"My body",1],"Inglese: la famiglia":["Saturno",8,"My family",1],"Decine e unità":["Marte",23,"Sfida 13",1],"Confrontare numeri fino a 100":["Marte",23,"Sfida 13",1],"Addizioni entro 100":["Marte",27,"Sfida 17",1],"Sottrazioni entro 100":["Marte",27,"Sfida 17",1],"Contare a salti":["Marte",27,"Sfida 17",1],"Le tabelline":["Marte",35,"Sfida 25",1],"Prima e dopo":["Luna",16,"Sfida 10",1],"Sillaba iniziale":["Giove",18,"Super sfida 12",1],"Lettera mancante":["Giove",23,"Sfida 17",1],"Le rime":["Giove",27,"Sfida 21",1],"Leggere parole":["Giove",31,"Sfida 25",1],"Inglese: numeri 11–20":["Saturno",15,"Sfida 7",1],"Inglese: vestiti":["Saturno",18,"Sfida 10",1],"Inglese: la scuola":["Saturno",19,"Sfida 11",1],"Inglese: il tempo":["Saturno",21,"Sfida 13",1],"Inglese: i mezzi":["Saturno",23,"Sfida 15",1],"Inglese: numero + parola":["Saturno",31,"Sfida 23",1],"I cinque sensi":["Terra",1,"I cinque sensi",0],"Le stagioni":["Terra",2,"Le stagioni",0],"Dove vivono gli animali":["Terra",3,"Dove vivono gli animali",0],"I paesaggi":["Terra",4,"I paesaggi",0],"Giorno e notte":["Terra",5,"Giorno e notte",0],"I dinosauri":["Terra",6,"I dinosauri",0],"Leggere l’orologio":["Marte",51,"Sfida 41",1],"Contare i soldi":["Marte",51,"Sfida 41",1],"Problemi con i numeri":["Marte",51,"Sfida 41",1],"Destra e sinistra":["Luna",51,"Sfida 45",1],"Le doppie":["Giove",51,"Sfida 45",1],"Inglese: emozioni":["Saturno",51,"Sfida 43",1],"Inglese: la casa":["Saturno",54,"Sfida 46",1],"Capire una storia ascoltata":["Storie",1,"Il razzo di cartone",0],"Numeri fino a 1000":["Marte",61,"Sfida 51",1],"Addizioni entro 1000":["Marte",67,"Sfida 57",1],"Sottrazioni entro 1000":["Marte",67,"Sfida 57",1],"Doppio e metà":["Marte",67,"Sfida 57",1],"Le divisioni":["Marte",73,"Sfida 63",1],"Gn e gli":["Giove",61,"Sfida 55",1],"Sce, sci, sca, sche":["Giove",67,"Sfida 61",1],"Che, chi, ghe, ghi":["Giove",70,"Super sfida 64",1],"Cu, qu e cqu":["Giove",73,"Sfida 67",1],"Le maiuscole":["Giove",73,"Sfida 67",1],"L’apostrofo":["Giove",79,"Sfida 73",1],"Ordine alfabetico":["Giove",79,"Sfida 73",1],"È ed e":["Giove",85,"Sfida 79",1],"Ha e a":["Giove",88,"Sfida 82",1],"L’accento":["Giove",85,"Sfida 79",1],"Leggere e capire":["Giove",91,"Sfida 85",1],"Sequenze di numeri":["Luna",61,"Sfida 55",1],"Le simmetrie":["Luna",67,"Sfida 61",1],"Le figure solide":["Luna",73,"Sfida 67",1],"Percorsi e frecce":["Luna",79,"Sfida 73",1],"Le misure":["Luna",85,"Sfida 79",1],"Ragionamento logico":["Luna",91,"Sfida 85",1],"Inglese: i giorni":["Saturno",61,"Sfida 53",1],"Inglese: i mesi":["Saturno",65,"Sfida 57",1],"Inglese: le azioni":["Saturno",69,"Sfida 61",1],"Inglese: gli sport":["Saturno",75,"Sfida 67",1],"Inglese: natura e montagna":["Saturno",81,"Sfida 73",1],"Inglese: prime frasi":["Saturno",72,"Super sfida 64",1]};
const AREE_EDO = [["Numeri","Marte"],["Forme e logica","Luna"],["Suoni e lettere","Giove"],["Inglese","Saturno"],["Scienza e natura","Terra"],["Ascolto e comprensione","Storie"]];
const LIMITE_GIOCO = 120;
function areaName(a){ return a==="Storie" ? "Ascolto e comprensione" : a; }
function dayKey(d){ return d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate()); }
function dayStart(offset){ const n=new Date(); return new Date(n.getFullYear(), n.getMonth(), n.getDate()-offset); }
function pctTxt(g,t){ return t ? Math.round(g/t*100)+"%" : "–"; }
function edoData(){
  if(!S.edo) return null;
  const withD = (arr,f)=>arr.map(f).filter(o=>o._d).sort((a,b)=>a._d-b._d);
  return {
    mis: withD(S.edo.mis||[], r=>({id:r[0], _d:parseDate(r[1]), missione:r[2], titolo:r[3], area:areaName(r[4]), g:r[5]||0, t:r[6]||0, sec:r[7], orig:r[8]})),
    err: withD(S.edo.err||[], r=>({id:r[0], _d:parseDate(r[1]), ab:r[2], dom:r[3], ris:r[4], orig:r[5], gioco:/^Gioco/i.test(r[6]||"") ? String(r[6]).replace(/^Gioco:\s*/i,"") : ""})),
    gio: withD(S.edo.gio||[], r=>({id:r[0], _d:parseDate(r[1]), gioco:r[2], min:r[3]||0, p:r[4]||0, v:r[5]||0, orig:r[7], tipo:r[8]||"", e:r[9]||0})),
    uso: withD(S.edo.uso||[], r=>({id:r[0], _d:parseDate(r[1]), min:r[2]||0, gio:r[3]||0, lud:r[4]||0, orig:r[5]}))
  };
}
function since(list, days){ if(!days) return list; const c=dayStart(days-1); return list.filter(x=>x._d>=c); }
function sumGT(list){ return list.reduce((a,m)=>{ a.g+=m.g; a.t+=m.t; return a; }, {g:0,t:0}); }
function perLabel(p){ return p===7?"negli ultimi 7 giorni":p===30?"negli ultimi 30 giorni":"da sempre"; }

function tipFor(ab){
  const m = AB_MAP[ab]; if(!m) return "";
  const [pian, liv, tit, allenabile] = m;
  const mis = /^(Super )?[Ss]fida \d+$/.test(tit) ? "il livello "+liv : "la missione «"+tit+"» (livello "+liv+")";
  if(allenabile) return "Su "+pian+": l’allenamento «"+ab.charAt(0).toLowerCase()+ab.slice(1)+"» da «I miei progressi», oppure "+mis+".";
  if(pian==="Terra") return "Sulla Terra: rileggete insieme le schede di «"+tit+"» e rifate il quiz.";
  return "Riascoltate insieme una storia e rifate le domande finali.";
}

function weeklySVG(mis){
  const n=new Date(); const mon = new Date(n.getFullYear(), n.getMonth(), n.getDate() - ((n.getDay()+6)%7));
  const weeks=[]; for(let i=7;i>=0;i--){ const s=new Date(mon.getFullYear(), mon.getMonth(), mon.getDate()-7*i); weeks.push({s, e:new Date(s.getFullYear(), s.getMonth(), s.getDate()+7), g:0, t:0, n:0}); }
  mis.forEach(m=>{ const w=weeks.find(w=>m._d>=w.s && m._d<w.e); if(w){ w.g+=m.g; w.t+=m.t; w.n++; } });
  const pts = weeks.map((w,i)=>({i, v: w.t? w.g/w.t*100 : null, w})).filter(p=>p.v!=null);
  if(!pts.length) return '<p class="empty">Nessuna missione nelle ultime 8 settimane.</p>';
  const W=340,H=180,L=36,R=10,T=10,B=26;
  const X=i=>L+i/7*(W-L-R), Y=v=>T+(1-v/100)*(H-T-B);
  let g='<g class="grid">'; [0,50,100].forEach(v=>{ g+='<line x1="'+L+'" x2="'+(W-R)+'" y1="'+Y(v)+'" y2="'+Y(v)+'"/><text class="lbl" x="'+(L-6)+'" y="'+(Y(v)+4)+'" text-anchor="end">'+v+'%</text>'; }); g+='</g>';
  const xl=[0,4,7].map((i,k)=>'<text class="lbl" x="'+X(i)+'" y="'+(H-6)+'" text-anchor="'+(k===0?"start":k===2?"end":"middle")+'">'+(i===7?"questa sett.":esc(weeks[i].s.getDate()+" "+MESI[weeks[i].s.getMonth()].slice(0,3)))+'</text>').join("");
  const line = pts.length>1 ? '<polyline class="series" points="'+pts.map(p=>X(p.i).toFixed(1)+","+Y(p.v).toFixed(1)).join(" ")+'"/>' : "";
  const dots = pts.map(p=>'<circle r="4.5" cx="'+X(p.i).toFixed(1)+'" cy="'+Y(p.v).toFixed(1)+'"><title>Settimana dal '+esc(shortDate(p.w.s))+': '+Math.round(p.v)+'% su '+plural(p.w.n,"missione","missioni")+'</title></circle>').join("");
  const desc = pts.map(p=>"settimana dal "+shortDate(p.w.s)+" "+Math.round(p.v)+"%").join("; ");
  return '<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Risposte giuste per settimana: '+esc(desc)+'">'+g+xl+line+dots+'</svg>';
}

function gamesSVG(gio, days){
  const n = Math.min(days||30, 30), map={};
  gio.forEach(x=>{ const k=dayKey(x._d); map[k]=(map[k]||0)+x.min; });
  const arr=[]; for(let i=n-1;i>=0;i--){ const d=dayStart(i); arr.push({d, m:map[dayKey(d)]||0}); }
  const W=340,H=180,L=36,R=8,T=10,B=26, top=Math.max(150, ...arr.map(a=>a.m))*1.05;
  const bw=(W-L-R)/n, Y=v=>T+(1-v/top)*(H-T-B);
  let g='<g class="grid">'; [0,60,120].forEach(v=>{ g+='<line x1="'+L+'" x2="'+(W-R)+'" y1="'+Y(v).toFixed(1)+'" y2="'+Y(v).toFixed(1)+'"/><text class="lbl" x="'+(L-6)+'" y="'+(Y(v)+4).toFixed(1)+'" text-anchor="end">'+(v/60)+' h</text>'; }); g+='</g>';
  const bars = arr.map((a,i)=> a.m ? '<rect class="b'+(a.m>LIMITE_GIOCO?' over':'')+'" x="'+(L+i*bw+bw*0.15).toFixed(1)+'" width="'+(bw*0.7).toFixed(1)+'" y="'+Y(a.m).toFixed(1)+'" height="'+(Y(0)-Y(a.m)).toFixed(1)+'" rx="2"><title>'+esc(longDate(a.d))+': '+Math.round(a.m)+' min</title></rect>' : '').join("");
  const lim='<line class="limit" x1="'+L+'" x2="'+(W-R)+'" y1="'+Y(LIMITE_GIOCO).toFixed(1)+'" y2="'+Y(LIMITE_GIOCO).toFixed(1)+'"/>';
  const xl=[0,Math.floor((n-1)/2),n-1].map((i,k)=>'<text class="lbl" x="'+(L+i*bw+bw/2).toFixed(1)+'" y="'+(H-6)+'" text-anchor="'+(k===0?"start":k===2?"end":"middle")+'">'+(i===n-1?"oggi":esc(arr[i].d.getDate()+" "+MESI[arr[i].d.getMonth()].slice(0,3)))+'</text>').join("");
  const desc = arr.filter(a=>a.m).map(a=>shortDate(a.d)+" "+Math.round(a.m)+" min").join("; ")||"nessun gioco";
  return '<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Minuti di gioco al giorno: '+esc(desc)+'">'+g+bars+lim+xl+'</svg>';
}

function viewEdo(misure){
  const E = edoData(), per = S.per;
  let h = '';
  if(!E){
    return '<h2>Progressi di Edo</h2><div class="panel"><p class="lead">I dati dell’app di Edo non sono ancora stati letti dal foglio.</p><p style="margin:12px 0 0"><button class="btn" id="sync">Sincronizza ora</button></p></div>'+misure;
  }
  if(!E.mis.length && !E.err.length && !E.gio.length){
    return '<h2>Progressi di Edo</h2><div class="panel"><p class="lead">Nel foglio non c’è ancora niente dall’app di Edo. Si collega dall’area genitori di «Edo nello spazio»: Foglio di famiglia → Collega al foglio, poi «Invia lo storico».</p></div>'+misure;
  }
  const hasTest = [].concat(E.mis,E.err,E.gio).some(x=>x.orig==="test");

  /* 1. oggi */
  const today=dayKey(new Date());
  const isT = x=>dayKey(x._d)===today;
  const mT=E.mis.filter(isT), eT=E.err.filter(isT), gT=E.gio.filter(isT), sT=sumGT(mT);
  const minT = gT.reduce((a,x)=>a+x.min,0);
  const wd=["domenica","lunedì","martedì","mercoledì","giovedì","venerdì","sabato"][new Date().getDay()];
  h += '<h2>Oggi <button class="refresh" id="sync">Aggiorna</button></h2><div class="panel">';
  if(!mT.length && !gT.length){
    const last=[].concat(E.mis,E.gio).sort((a,b)=>b._d-a._d)[0];
    h += '<p class="lead">Oggi, '+wd+', Edo non ha ancora usato l’app.'+(last?' L’ultima volta: '+esc(longDate(last._d))+' alle '+pad(last._d.getHours())+':'+pad(last._d.getMinutes())+'.':'')+'</p>';
  } else {
    h += '<div class="kpi">'+
      '<div><div class="big">'+mT.length+'</div><div class="lead">'+(mT.length===1?"missione":"missioni")+(mT.length?', '+pctTxt(sT.g,sT.t)+' giuste':'')+'</div></div>'+
      '<div><div class="big">'+eT.length+'</div><div class="lead">'+(eT.length===1?"errore":"errori")+(eT.length?' su '+plural(new Set(eT.map(e=>e.ab)).size,"abilità","abilità"):'')+'</div></div></div>';
    const uT = (E.uso||[]).find(isT), usoT = uT ? uT.min : minT;
    const pc=Math.min(100,usoT/LIMITE_GIOCO*100), rest=Math.max(0,Math.round(LIMITE_GIOCO-usoT));
    h += '<div style="margin-top:14px"><div class="lead" style="font-size:15px"><b style="color:var(--ink)">'+Math.round(usoT)+' min</b> '+(uT?'di uso dell’app':'di gioco')+' su 120</div>'+
      '<div class="today-bar" role="img" aria-label="'+Math.round(usoT)+' minuti su 120"><div class="'+(usoT>LIMITE_GIOCO?'over':'')+'" style="width:'+Math.max(2,pc).toFixed(0)+'%"></div></div>'+
      '<div class="lead" style="font-size:14px">'+(usoT>LIMITE_GIOCO?'Oltre il limite di '+Math.round(usoT-LIMITE_GIOCO)+' min.':'Restano '+rest+' min.')+(uT?' Di cui '+Math.round(uT.gio)+' min di giochi, '+Math.round(uT.lud)+' ludici.':'')+'</div></div>';
    const ev = mT.map(m=>({d:m._d, h:'<div><div><b>'+esc(m.titolo||m.missione)+'</b></div><div class="k">Missione, '+esc(m.area)+'</div></div><div class="v">'+m.g+' su '+m.t+'</div>'}))
      .concat(gT.map(x=>({d:x._d, h:'<div><div><b>'+esc(x.gioco)+'</b></div><div class="k">Gioco, '+plural(x.p,"partita","partite")+', '+x.v+(x.v===1?' vinta o completata':' vinte o completate')+'</div></div><div class="v">'+Math.round(x.min)+' min</div>'})))
      .sort((a,b)=>b.d-a.d);
    h += '<h3 style="margin-top:16px">Cosa ha fatto</h3><ul class="tl">'+ev.map(e=>'<li><span class="h">'+pad(e.d.getHours())+':'+pad(e.d.getMinutes())+'</span>'+e.h+'</li>').join("")+'</ul>';
    if(eT.length){
      const byA={}; eT.forEach(e=>{ (byA[e.ab]=byA[e.ab]||[]).push(e); });
      h += '<h3 style="margin-top:14px">Errori di oggi</h3>'+Object.entries(byA).map(([ab,l])=>'<div style="margin-top:6px"><b style="font-size:15px">'+esc(ab)+'</b><div class="chips">'+l.map(e=>'<span class="chip">'+(e.gioco?'🎮 ':'')+esc(e.dom)+' → '+esc(e.ris)+'</span>').join("")+'</div></div>').join("")+
      (eT.some(e=>e.gioco)?'<p class="lead" style="font-size:14px;margin:6px 0 0">🎮 = errore corretto dentro un gioco educativo.</p>':'');
    }
  }
  h += (hasTest?'<p class="testnote">Nel foglio ci sono righe di prova (Origine «test»).</p>':'')+'</div>';

  /* 2. medie e tendenze */
  function stats(days){
    const ms = days ? E.mis.filter(m=>m._d>=dayStart(days-1)) : mT, gs = days ? E.gio.filter(x=>x._d>=dayStart(days-1)) : gT, es = days ? E.err.filter(x=>x._d>=dayStart(days-1)) : eT;
    const n = days||1, s = sumGT(ms), act = new Set(ms.map(m=>dayKey(m._d)).concat(gs.map(x=>dayKey(x._d)))).size;
    const us = days ? (E.uso||[]).filter(x=>x._d>=dayStart(days-1)) : (E.uso||[]).filter(isT);
    return {mis:ms.length/n, pct: s.t? s.g/s.t*100 : null, min: gs.reduce((a,x)=>a+x.min,0)/n, uso: us.reduce((a,x)=>a+x.min,0)/n, err: es.length/n, act, n};
  }
  const sO=stats(0), s7=stats(7), s30=stats(30);
  const f1=v=>v==null?"–":fmt(v, v<10&&v%1?1:0);
  function trend(a,b,isPct){
    if(a==null||b==null||(!a&&!b)) return "–";
    const d = isPct ? a-b : (b? (a-b)/b*100 : 100);
    if(Math.abs(d) < (isPct?3:10)) return "= stabile";
    return d>0 ? "↑ in aumento" : "↓ in calo";
  }
  const rows=[
    ["Missioni al giorno", f1(sO.mis), f1(s7.mis), f1(s30.mis), trend(s7.mis,s30.mis)],
    ["Risposte giuste", sO.pct==null?"–":Math.round(sO.pct)+"%", s7.pct==null?"–":Math.round(s7.pct)+"%", s30.pct==null?"–":Math.round(s30.pct)+"%", trend(s7.pct,s30.pct,true)],
    ...((E.uso||[]).length ? [["Minuti di uso al giorno", Math.round(sO.uso), Math.round(s7.uso), Math.round(s30.uso), trend(s7.uso,s30.uso)]] : []),
    ["Minuti di gioco al giorno", Math.round(sO.min), Math.round(s7.min), Math.round(s30.min), trend(s7.min,s30.min)],
    ["Errori al giorno", f1(sO.err), f1(s7.err), f1(s30.err), trend(s7.err,s30.err)],
    ["Giorni in cui ha usato l’app", sO.act?"sì":"no", s7.act+"/7", s30.act+"/30", trend(s7.act/7,s30.act/30)]
  ];
  const byArea7 = {}; E.mis.filter(m=>m._d>=dayStart(6)).forEach(m=>{ const a=byArea7[m.area]||(byArea7[m.area]={g:0,t:0,n:0}); a.g+=m.g; a.t+=m.t; a.n++; });
  const weak = Object.entries(byArea7).filter(([,a])=>a.n>=2 && a.t).sort((x,y)=>x[1].g/x[1].t - y[1].g/y[1].t)[0];
  const days7 = {}; ((E.uso||[]).length ? E.uso : E.gio).filter(x=>x._d>=dayStart(6)).forEach(x=>{ const k=dayKey(x._d); days7[k]=(days7[k]||0)+x.min; });
  const over7 = Object.values(days7).filter(v=>v>LIMITE_GIOCO).length;
  h += '<h2>Medie e tendenze</h2><div class="panel"><table class="cmp"><thead><tr><th></th><th>Oggi</th><th>7 gg</th><th>30 gg</th></tr></thead><tbody>'+
    rows.map(r=>'<tr><td>'+r[0]+'<div class="k" style="font-size:13px;color:var(--muted)">'+r[4]+'</div></td><td><b>'+r[1]+'</b></td><td>'+r[2]+'</td><td>'+r[3]+'</td></tr>').join("")+
    '</tbody></table><p class="lead" style="font-size:14px;margin:10px 0 0">Le medie contano tutti i giorni, anche quelli senza app. La tendenza confronta gli ultimi 7 giorni con gli ultimi 30.</p>'+
    '<p class="lead" style="font-size:15px;margin:12px 0 0">'+(weak?'Area più debole della settimana: <b style="color:var(--ink)">'+esc(weak[0])+'</b>, '+pctTxt(weak[1].g,weak[1].t)+' di risposte giuste.':'Per l’area più debole servono almeno 2 missioni nella stessa area in 7 giorni.')+
    (over7?' <b style="color:var(--warn)">'+plural(over7,"giorno","giorni")+' oltre le 2 ore'+((E.uso||[]).length?' di app':' di gioco')+'</b> questa settimana.':'')+'</p></div>';

  /* filtro */
  h += '<h2>Nel dettaglio</h2><div class="period" role="group" aria-label="Periodo">'+
    [[7,"7 giorni"],[30,"30 giorni"],[0,"Tutto"]].map(([v,l])=>'<button data-per="'+v+'" aria-pressed="'+(per===v)+'">'+l+'</button>').join("")+'</div>';

  /* 2. missioni per area */
  const mp = since(E.mis, per), byArea={};
  mp.forEach(m=>{ const a=byArea[m.area]||(byArea[m.area]={g:0,t:0,n:0}); a.g+=m.g; a.t+=m.t; a.n++; });
  h += '<h2>Missioni per area</h2><div class="panel">';
  if(!mp.length) h += '<p class="lead">Nessuna missione '+perLabel(per)+'.</p>';
  else{
    const known = AREE_EDO.map(a=>a[0]); const extra = Object.keys(byArea).filter(a=>!known.includes(a));
    h += known.concat(extra).map(a=>{
      const x=byArea[a], pl=(AREE_EDO.find(z=>z[0]===a)||[])[1];
      if(!x) return '<div class="bar-row"><div class="lab">'+esc(a)+(pl?'<small>'+pl+'</small>':'')+'</div><div class="bar-track"></div><div class="pct" style="color:var(--muted);font-weight:400">–</div></div>';
      const p = x.t ? x.g/x.t*100 : 0, cls = p<60?"low":p<75?"mid":"";
      return '<div class="bar-row"><div class="lab">'+esc(a)+'<small>'+(pl?pl+", ":"")+plural(x.n,"missione","missioni")+'</small></div><div class="bar-track" role="img" aria-label="'+Math.round(p)+'% giuste"><div class="bar-fill '+cls+'" style="width:'+Math.max(3,p).toFixed(0)+'%"></div></div><div class="pct">'+Math.round(p)+'%</div></div>';
    }).join("");
    h += '<p class="lead" style="font-size:14px;margin:10px 0 0">Percentuale di risposte giuste '+perLabel(per)+'.</p>';
  }
  h += '</div>';
  h += '<div class="panel chart"><h3>Andamento per settimana</h3>'+weeklySVG(E.mis)+'<p class="lead" style="font-size:14px;margin-top:6px">Risposte giuste su tutte le aree, ultime 8 settimane.</p></div>';
  if(mp.length){
    h += '<div class="panel"><h3>Ultime missioni</h3><ul class="list">'+mp.slice(-6).reverse().map(m=>
      '<li><div><div class="when">'+esc(m.titolo||m.missione)+'</div><div class="meta">'+esc(m.area)+', '+esc(shortDate(m._d))+' '+pad(m._d.getHours())+':'+pad(m._d.getMinutes())+'</div></div><div class="vals">'+m.g+' su '+m.t+'<div class="meta">'+pctTxt(m.g,m.t)+'</div></div></li>').join("")+'</ul></div>';
  }

  /* 3. errori ricorrenti */
  const ep = since(E.err, per), byAb={};
  ep.forEach(e=>{ const a=byAb[e.ab]||(byAb[e.ab]={n:0, g:0, dom:{}, last:null}); a.n++; if(e.gioco) a.g++; const k=e.dom+"\u0000"+e.ris; a.dom[k]=(a.dom[k]||0)+1; a.last=e._d; });
  const top = Object.entries(byAb).sort((x,y)=>y[1].n-x[1].n || y[1].last-x[1].last).slice(0,5);
  h += '<h2>Da allenare</h2><div class="panel">';
  if(!top.length) h += '<p class="lead">Nessun errore '+perLabel(per)+'. Bravo Edo!</p>';
  else{
    h += top.map(([ab,a])=>{
      const ex = Object.entries(a.dom).sort((x,y)=>y[1]-x[1]).slice(0,4).map(([k,n])=>{ const [d,r]=k.split("\u0000"); return '<span class="chip">'+esc(d)+' → '+esc(r)+(n>1?' ×'+n:'')+'</span>'; }).join("");
      const tip = tipFor(ab);
      return '<div class="err"><div class="top"><b>'+esc(ab)+'</b><span class="n">'+plural(a.n,"errore","errori")+(a.g?' (🎮 '+a.g+' nei giochi)':'')+'</span></div>'+
        '<div class="ex">Domanda → risposta data, ultimo errore il '+esc(shortDate(a.last))+'</div><div class="chips">'+ex+'</div>'+
        (tip?'<div class="tip">'+esc(tip)+'</div>':'')+'</div>';
    }).join("");
    if(Object.keys(byAb).length>5) h += '<p class="lead" style="font-size:14px;margin:10px 0 0">Altre '+(Object.keys(byAb).length-5)+' abilità con qualche errore: le trovi nel foglio, scheda Edo - Errori.</p>';
  }
  h += '</div>';

  /* 4. giochi */
  const gp = since(E.gio, per), byG={};
  gp.forEach(x=>{ const a=byG[x.gioco]||(byG[x.gioco]={min:0,p:0,v:0,e:0,tipo:x.tipo}); a.min+=x.min; a.p+=x.p; a.v+=x.v; a.e+=x.e||0; if(x.tipo) a.tipo=x.tipo; });
  const minEdu = gp.filter(x=>/^educ/i.test(x.tipo)).reduce((a,x)=>a+x.min,0), minLud = gp.filter(x=>/^ludic/i.test(x.tipo)).reduce((a,x)=>a+x.min,0);
  const totMin = gp.reduce((a,x)=>a+x.min,0), totP=gp.reduce((a,x)=>a+x.p,0), totV=gp.reduce((a,x)=>a+x.v,0);
  const usaUso = (E.uso||[]).length>0;
  h += '<h2>Giochi e tempo</h2><div class="panel chart"><h3>'+(usaUso?'Minuti di app al giorno':'Minuti di gioco al giorno')+'</h3>'+gamesSVG(usaUso?E.uso:E.gio, per)+
    '<div class="legend"><span><i class="l"></i>limite di 2 ore</span><span><i class="o"></i>oltre il limite</span></div>'+
    (usaUso?'<p class="lead" style="font-size:14px;margin-top:6px">Conta tutto l’uso: quiz, giochi, storie e disegno.</p>':'')+
    (per===0?'<p class="lead" style="font-size:14px;margin-top:6px">Il grafico mostra gli ultimi 30 giorni.</p>':'')+'</div>';
  h += '<div class="panel">';
  if(!gp.length) h += '<p class="lead">Nessun gioco '+perLabel(per)+'.</p>';
  else{
    h += '<div class="kpi" style="margin-bottom:8px"><div><div class="big">'+fmt(totMin/60,1)+' <small>ore</small></div><div class="lead">di gioco '+perLabel(per)+'</div></div>'+
      '<div><div class="big">'+totV+' <small>su '+totP+'</small></div><div class="lead">partite completate o vinte</div></div></div>'+
      ((minEdu||minLud)?'<p class="lead" style="font-size:15px;margin:4px 0 0">🧠 Educativi <b style="color:var(--ink)">'+Math.round(minEdu)+' min</b> · 🎮 Ludici <b style="color:var(--ink)">'+Math.round(minLud)+' min</b></p>':'')+
      '<h3 style="margin-top:12px">I preferiti</h3><ul class="list">'+Object.entries(byG).sort((x,y)=>y[1].min-x[1].min).slice(0,6).map(([n,a])=>
        '<li><div><div class="when">'+esc(n)+'</div><div class="meta">'+(a.tipo?esc(a.tipo.toLowerCase())+', ':'')+plural(a.p,"partita","partite")+', '+a.v+' completate o vinte'+(a.e?', '+plural(a.e,"errore","errori"):'')+'</div></div><div class="vals">'+Math.round(a.min)+' min</div></li>').join("")+'</ul>';
  }
  h += '</div>';
  h += misure;
  h += '<p class="lead" style="font-size:14px;margin:14px 2px 0">Dati letti dal foglio il '+esc(shortDate(new Date(S.edo.at)))+' alle '+timeOf(S.edo.at)+'.</p>';
  return h;
}

/* ---------- prossimi appuntamenti (blocco 5b) ----------
   Le pagine non leggono il calendario: la fonte è la scheda Appuntamenti del foglio.
   Misure: Sibilla il 27 di ogni mese, Edoardo il 27 ogni 3 mesi (febbraio, maggio, agosto, novembre). */
const AP_TIPI = [["visita","Visita"],["vaccino","Vaccino"],["bilancio","Bilancio"],["altro","Altro"]];
const AP_CHIUSI = ["fatto","annullato"];
let pOpen = false, pTipo = "visita", pErr = "";
function appToSheet(o){ const sd=toSerial(o.data); return [o.id, sd==null?o.data:sd, o.bambino, o.tipo, o.titolo, "", o.luogo||"", o.note||"", "da mettere in calendario", "app-genitori"]; }
function d0(d){ return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
function daysTo(d){ return Math.round((d0(d) - dayStart(0)) / 864e5); }
function traTxt(n){ return n===0 ? "oggi" : n===1 ? "domani" : n===-1 ? "ieri" : n>1 ? "tra "+n+" giorni" : plural(-n,"giorno fa","giorni fa"); }
function tipoLabel(t){ const x=AP_TIPI.concat([["misura","Misura"]]).find(y=>y[0]===String(t).toLowerCase()); return x? x[1] : (t||"Appuntamento"); }
function appFor(c){
  const ids = new Set(S.app.map(a=>a.id));
  return S.app.concat(S.qs.appunt.filter(q=>!ids.has(q.id)).map(q=>Object.assign({pending:true, stato:"da mettere in calendario"}, q)))
    .filter(a=>a.bambino===c || /^tutt/i.test(a.bambino))
    .map(a=>Object.assign({}, a, {_d:parseDate(a.data), _e:parseDate(a.entro)}))
    .filter(a=>a._d && !AP_CHIUSI.includes(String(a.stato).toLowerCase()));
}
/* prossimi: dal giorno di oggi in poi; un bilancio resta finché la sua finestra ("Entro") è aperta */
function appProssimi(c){
  return appFor(c).filter(a=>daysTo(a._d)>=0 || (a._e && daysTo(a._e)>=0)).sort((a,b)=>a._d-b._d);
}
function nextMisura(c){
  const ms = measuresFor(c), last = ms.length ? ms[ms.length-1] : null, oggi = dayStart(0);
  const ok = m=> c==="Sibilla" ? true : [1,4,7,10].includes(m);
  for(let i=0;i<14;i++){
    const d = new Date(oggi.getFullYear(), oggi.getMonth()+i, 27);
    if(d<oggi || !ok(d.getMonth())) continue;
    if(i===0 && daysTo(d)===0 && last && last._d && dayKey(last._d)===dayKey(oggi)) continue;
    return {d, last};
  }
  return null;
}
function viewAppOggi(c){
  const list = appProssimi(c), nm = nextMisura(c);
  const now=new Date(); const local = now.getFullYear()+"-"+pad(now.getMonth()+1)+"-"+pad(now.getDate())+"T09:00";
  let h = '<h2>Prossimi appuntamenti</h2><div class="panel"><ul class="dlist">';
  if(nm){
    const n = daysTo(nm.d);
    h += '<li><div class="when"><span class="ctag">Misura</span>'+esc(longDate(nm.d))+' · '+esc(traTxt(n))+'</div>'+
      '<div class="note-txt">Peso e altezza'+(c==="Edoardo"?' (ogni 3 mesi)':' (ogni mese)')+
      (nm.last && nm.last._d ? '<span style="color:var(--muted)"> · ultima misura il '+esc(shortDate(nm.last._d))+'</span>' : '')+'</div>'+
      (n===0?'<button class="btn small" style="margin-top:6px" data-go="crescita">Inserisci la misura</button>':'')+'</li>';
  }
  list.slice(0,3).forEach(a=>{
    const n = daysTo(a._d), aperta = n<0 && a._e;
    const ora = (a._d.getHours()||a._d.getMinutes()) && !aperta ? ', '+pad(a._d.getHours())+':'+pad(a._d.getMinutes()) : '';
    const quando = aperta ? 'finestra aperta, entro il '+shortDate(a._e)+' · '+traTxt(daysTo(a._e)).replace(/^tra /,"mancano ")
      : longDate(a._d)+ora+' · '+traTxt(n)+(a._e ? ' · entro il '+shortDate(a._e) : '');
    const st = String(a.stato||"").toLowerCase();
    h += '<li><div class="when"><span class="ctag">'+esc(tipoLabel(a.tipo))+'</span>'+esc(quando)+
      (st && st!=="prenotato" ? '<span class="tag">'+esc(st)+'</span>' : '')+(a.pending?'<span class="tag">in attesa</span>':'')+'</div>'+
      '<div class="note-txt">'+esc(a.titolo||tipoLabel(a.tipo))+(a.luogo?'<span style="color:var(--muted)"> · '+esc(a.luogo)+'</span>':'')+'</div>'+
      (a.pending?'<button class="btn ghost small" style="margin-top:6px" data-delp="'+esc(a.id)+'">Elimina</button>':'')+'</li>';
  });
  if(!nm && !list.length) h += '<li><div class="note-txt">Nessun appuntamento in programma.</div></li>';
  h += '</ul>';
  if(list.length>3) h += '<p class="lead" style="font-size:14px;margin:8px 0 0">E altri '+(list.length-3)+' più avanti, nella scheda Appuntamenti del foglio.</p>';
  if(pOpen){
    h += '<div class="tform" style="margin:14px 0 0">'+(pErr?'<p class="formerr" role="alert">'+esc(pErr)+'</p>':'')+
      '<div class="seg" role="group" aria-label="Tipo">'+AP_TIPI.map(([k,l])=>'<button data-ptipo="'+k+'" aria-pressed="'+(pTipo===k)+'">'+l+'</button>').join("")+'</div>'+
      '<div class="field"><label for="p-tit">Che cosa</label><input id="p-tit" maxlength="80" placeholder="'+(pTipo==="vaccino"?"Quale vaccino?":pTipo==="bilancio"?"Bilancio di salute":"Per esempio: visita dal pediatra")+'"></div>'+
      '<div class="grid3"><div class="field"><label for="p-data">Data e ora</label><input id="p-data" type="datetime-local" value="'+local+'"></div>'+
      '<div class="field"><label for="p-luogo">Dove</label><input id="p-luogo" maxlength="60" placeholder="Facoltativo"></div></div>'+
      '<div class="field"><label for="p-note">Note</label><input id="p-note" maxlength="200" placeholder="Facoltative"></div>'+
      '<div class="row" style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn" id="p-save">Salva</button><button class="btn ghost" id="p-cancel">Annulla</button></div>'+
      '<p class="lead" style="font-size:14px;margin:10px 0 0">Va sul foglio come «da mettere in calendario»: per l’evento sul telefono, chiedilo a Claude in chat.</p></div>';
  }else{
    h += '<p style="margin:14px 0 0"><button class="btn ghost" id="p-open">Aggiungi appuntamento</button></p>';
  }
  h += '<p class="lead" style="font-size:14px;margin:10px 0 0">Per segnare «fatto» o cambiare un appuntamento, modifica la colonna Stato nella scheda Appuntamenti del foglio.</p></div>';
  return h;
}
function addAppunt(){
  const v = id=>$(id) ? $(id).value.trim() : "";
  const titolo = v("p-tit") || tipoLabel(pTipo), when = v("p-data"), d = when ? new Date(when) : null;
  if(!d || isNaN(d)){ pErr="Scegli data e ora."; render(); return false; }
  if(daysTo(d) < -1){ pErr="La data è già passata: le visite fatte si segnano in Salute."; render(); return false; }
  S.qs.appunt.push({id:"genitori-appuntamento-"+Date.now(), data:stamp(d), bambino:S.child, tipo:pTipo, titolo, luogo:v("p-luogo"), note:v("p-note"), stato:"da mettere in calendario"});
  save(); pOpen=false; pErr=""; toast("Appuntamento salvato"); render(); sync(false); return true;
}

const TICON = {
  peso:'<path d="M6 7h12l2 13H4z"/><path d="M9 7a3 3 0 0 1 6 0"/>',
  alt:'<path d="M12 3v18M8 7l4-4 4 4M8 17l4 4 4-4"/>',
  nanna:ICONS.nanna,
  asilo:'<path d="M3 10l9-6 9 6v10H3z"/><path d="M9 20v-6h6v6"/>',
  agenda:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  tappe:'<path d="M4 20l5-6 4 3 7-9"/><path d="M15 8h5v5"/>',
  edo:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'
};
function tile(icon, k, v, sub, attrs, todo){
  return '<button class="tile'+(todo?' todo':'')+'" '+attrs+'><span class="k"><svg viewBox="0 0 24 24" aria-hidden="true">'+TICON[icon]+'</svg>'+k+'</span>'+
    '<span class="v">'+v+'</span>'+(sub?'<span class="s">'+sub+'</span>':'')+'</button>';
}
function prossimo(c){
  const nm = nextMisura(c), l = appProssimi(c).map(a=>({d: daysTo(a._d)<0 && a._e ? a._e : a._d, t:a.titolo||tipoLabel(a.tipo), tipo:tipoLabel(a.tipo), a}));
  if(nm) l.push({d:nm.d, t:"Peso e altezza", tipo:"Misura", nm:true});
  return l.sort((x,y)=>x.d-y.d);
}
function ggTxt(n){ return n===0 ? "Oggi" : n===1 ? "Domani" : n<0 ? "In corso" : n+' <small>giorni</small>'; }
function alertsHtml(c){
  const l = [];
  const al = (cls, ic, t, sub, attrs)=>'<button class="al '+cls+'" '+attrs+'><span class="ic" aria-hidden="true">'+ic+'</span><span class="tx"><b>'+t+'</b>'+(sub?'<small>'+sub+'</small>':'')+'</span><span class="chev" aria-hidden="true"></span></button>';
  episodi(c).filter(e=>e.open).forEach(e=>l.push(al("w","🤒", esc(e.cosa||"Malattia")+" in corso", "da "+esc(plural(epGiorni(e),"giorno","giorni"))+(e.fmax!=null?" · febbre max "+esc(tTxt(e.fmax)):""), 'data-go="salute"')));
  const vf = vaccList(c).filter(v=>v.st==="dafare");
  if(vf.length) l.push(al("","💉", vf.length===1 ? "Vaccino da fare" : vf.length+" vaccini da fare", esc(vf[0].n)+" – "+esc(vf[0].d)+(vf.length>1?" e altri":""), 'data-go="salute"'));
  prossimo(c).filter(x=>{ const n=daysTo(x.d); return n>=0 && n<=1; }).forEach(x=>{ const n=daysTo(x.d);
    l.push(al("a","📅", esc(x.t)+" "+(n===0?"oggi":"domani"), esc(x.tipo)+(x.a&&x.a.luogo?" · "+esc(x.a.luogo):"")+(x.nm&&n===0?" · tocca per inserirla":""), x.nm&&n===0?'data-go="crescita"':'data-scroll="agenda"')); });
  if(revWindow()){ const mon=revMon(); if(!settMap(c)[dayKey(mon)]) l.push(al("a","📝","Revisione della settimana", "4 passi, un paio di minuti · "+esc(weekLabel(mon)), 'data-go="settimana"')); }
  return l.length ? '<div class="alerts">'+l.join("")+'</div>' : '';
}
function quickHtml(c){
  const sib = c==="Sibilla";
  const q = [["🌙","Nanna",'data-nanna="ieri"'],["💤","Pisolino",'data-add="pisolino"']]
    .concat(sib?[["🏫","Asilo",'data-add="asilo"']]:[])
    .concat([["📏","Misura",'data-add="misura"'],["✏️","Nota",'data-add="nota"'],["🌡️","Febbre",'data-add="febbre"'],["🩺","Visita",'data-add="visita"']]);
  return '<div class="quick" role="group" aria-label="Aggiungi al volo">'+q.map(x=>'<button class="qa" '+x[2]+'><span aria-hidden="true">'+x[0]+'</span>'+x[1]+'</button>').join("")+'</div>';
}
function tilesHtml(c){
  const lv = lastValues(c), sib = c==="Sibilla", t = [];
  const pp = (k,m)=>{ const r=percOf(c,k,m[k],m._d); return (r?esc(pLabel(r))+' perc. · ':'')+esc(shortDate(m._d)); };
  if(lv.peso) t.push(tile("peso","Peso", fmt(lv.peso.peso,2)+' <small>kg</small>', pp("peso",lv.peso), 'data-go="crescita"'));
  else t.push(tile("peso","Peso","Prima misura","peso e altezza bastano",'data-add="misura"',true));
  if(lv.altezza) t.push(tile("alt","Altezza", fmt(lv.altezza.altezza,1)+' <small>cm</small>', pp("altezza",lv.altezza), 'data-go="crescita"'));
  else t.push(tile("alt","Altezza","–","non ancora misurata",'data-go="crescita"'));
  const map = sonnoDays(c), ieri = map[dayKey(dayStart(1))], a7 = avgDays(map,0,6);
  if(ieri) t.push(tile("nanna","Nanna ieri", fmt(ieri.ore,1)+' <small>ore</small>', a7?'media 7 gg '+fmt(a7.avg,1)+' h':'', 'data-go="nanna"'));
  else t.push(tile("nanna","Nanna ieri","Segna ieri", a7?'media 7 gg '+fmt(a7.avg,1)+' h':'non ancora segnata', 'data-nanna="ieri"', true));
  if(sib){
    const td=dayStart(0), dw=(td.getDay()+6)%7, r=asiloMap(c)[dayKey(td)], w=asiloWeek(c, weekMon(td));
    if(r){ const u=umoreOf(r.umore); t.push(tile("asilo","Asilo oggi", u ? u[1]+' <small>'+esc(u[2])+'</small>' : '✓', [r.nanna!=null?'nanna '+r.nanna+' min':'', r.cacca?'cacca '+r.cacca:''].filter(Boolean).join(' · '), 'data-asdet="1"')); }
    else if(dw<5) t.push(tile("asilo","Asilo oggi","Segna la giornata", w.n?plural(w.n,"giornata","giornate")+' questa settimana':'nanna, pappa, umore', 'data-add="asilo"', true));
    else t.push(tile("asilo","Asilo", w.n+' <small>'+(w.n===1?'giornata':'giornate')+'</small>', w.nanna?'nanna media '+Math.round(w.nanna.avg)+' min':'questa settimana', 'data-asdet="1"'));
  }
  const nx = prossimo(c).find(x=>daysTo(x.d)>=0) || prossimo(c)[0];
  if(nx) t.push(tile("agenda","Prossimo", ggTxt(daysTo(nx.d)), esc(nx.t), 'data-scroll="agenda"'));
  else t.push(tile("agenda","Prossimo","–","nessun appuntamento",'data-scroll="agenda"'));
  if(sib){ const sm=svilMap(c), age=tappeAge(c), n=svCount(sm,age);
    t.push(tile("tappe","Tappe", n.done+' <small>di '+n.tot+'</small>', 'dei '+age+' mesi', 'data-go="sviluppo"')); }
  return '<div class="tiles">'+t.join("")+'</div>';
}
function agendaCard(c){
  if(pOpen) return '<div id="agenda"></div>'+viewAppOggi(c);
  const l = prossimo(c).slice(0,4);
  let h = '<h2 id="agenda">Agenda</h2><div class="panel">';
  if(!l.length) h += '<p class="lead" style="margin:0">Nessun appuntamento in programma.</p>';
  else h += '<ul class="rows">'+l.map(x=>{ const n=daysTo(x.d), a=x.a, st=a?String(a.stato||"").toLowerCase():"";
      return '<li><div class="cal" aria-hidden="true"><b>'+x.d.getDate()+'</b><span>'+MESI[x.d.getMonth()].slice(0,3)+'</span></div>'+
        '<div><div class="t">'+esc(x.t)+(a&&a.pending?'<span class="tag">in attesa</span>':'')+(st&&st!=="prenotato"?'<span class="tag">'+esc(st)+'</span>':'')+'</div>'+
        '<div class="m">'+esc(x.tipo)+(a&&a.luogo?' · '+esc(a.luogo):'')+(x.nm?(c==="Edoardo"?' · ogni 3 mesi':' · ogni mese'):'')+'</div>'+
        (a&&a.pending?'<button class="linkbtn" data-delp="'+esc(a.id)+'">Elimina</button>':'')+'</div>'+
        '<div class="r">'+esc(n<0&&a&&a._e?'entro il '+shortDate(a._e):traTxt(n))+'</div></li>'; }).join("")+'</ul>';
  return h + '<p style="margin:14px 0 0"><button class="btn ghost small" id="p-open">+ Appuntamento</button></p></div>';
}
function asiloSection(c){
  if(c!=="Sibilla") return "";
  const td=dayStart(0), dw=(td.getDay()+6)%7, today=asiloMap(c)[dayKey(td)], w=asiloWeek(c, weekMon(td));
  let h = '<h2 id="asilo">Settimana all’asilo</h2><div class="panel"><div class="phead"><span class="lead" style="margin:0;font-size:15px">'+
    (w.n ? plural(w.n,"giornata segnata","giornate segnate")+(w.nanna?' · nanna media '+Math.round(w.nanna.avg)+' min':'') : 'Nessuna giornata segnata')+'</span>'+
    (w.n?'<button class="linkbtn" data-asdet="'+(asDet?0:1)+'">'+(asDet?'Chiudi':'Dettagli')+'</button>':'')+'</div>';
  if(asDet && w.n) h += '<div style="margin-top:12px">'+asiloBox(c, weekMon(td), false)+'</div>';
  if(today || dw>=5) h += '<p style="margin:12px 0 0"><button class="btn ghost small" data-add="asilo">'+(dw>=5?'Segna una giornata':'Correggi la giornata di oggi')+'</button></p>';
  return h + '</div>';
}
function diarioMini(c){
  const n = diarioFor(c)[0];
  let h = '<h2>Diario</h2><div class="panel">';
  if(n) h += '<div class="phead"><span class="lead" style="margin:0;font-size:13.5px"><span class="ctag">'+esc(catLabel(n.cat))+'</span>'+esc(shortDate(n._d))+'</span><button class="linkbtn" data-go="diario">Tutto</button></div>'+
    '<div class="note-txt" style="margin-top:6px">'+esc(n.testo.length>140 ? n.testo.slice(0,140)+"…" : n.testo)+'</div>';
  else h += '<div class="phead"><span class="lead" style="margin:0;font-size:15px">Prime volte, parole nuove, ricordi.</span><button class="linkbtn" data-add="nota">Scrivi</button></div>';
  return h + '</div>';
}
function linksHtml(c){
  if(c!=="Sibilla") return "";
  const row=(ic,t,sub,attrs)=>'<button class="lrow" '+attrs+'><span class="ic" aria-hidden="true">'+ic+'</span><span class="tx"><b>'+t+'</b><small>'+sub+'</small></span><span class="chev" aria-hidden="true"></span></button>';
  const sm=svilMap(c), all=svCount(sm,null);
  return '<h2>Approfondisci</h2><div class="panel links">'+
    row("🌱","Tappe di sviluppo", plural(all.done,"tappa raggiunta","tappe raggiunte")+' in tutto', 'data-go="sviluppo"')+
    row("🧺","Tutte le attività", ATT.length+' idee Montessori e Pikler per età', 'data-go="attivita"')+
    row("🏠","Ambiente di casa", 'spazi, materiali e sicurezza, anche in baita', 'data-go="ambiente"')+'</div>';
}
function viewOggi(){
  const c=S.child;
  const top = alertsHtml(c) + tilesHtml(c) + quickHtml(c) + umOggi(c) + rwMini(c);
  if(c==="Edoardo") return top + viewEdo(agendaCard(c) + diarioMini(c));
  return top + viewAttOggi(c) + agendaCard(c) + asiloSection(c) + diarioMini(c) + linksHtml(c);
}

/* Standard OMS 2006 (0–5 anni) e riferimenti OMS 2007 (5–19 anni): L, M, S per mese di età, dal mese a.
   Fonte: tabelle z-score/percentili su who.int, scaricate e verificate il 25/10/2026. Non modificare. */
const OMS = {
 F:{peso:{a:0,d:[0.3809,3.2322,0.14171,0.1714,4.1873,0.13724,0.0962,5.1282,0.13,0.0402,5.8458,0.12619,-0.005,6.4237,0.12402,-0.043,6.8985,0.12274,-0.0756,7.297,0.12204,-0.1039,7.6422,0.12178,-0.1288,7.9487,0.12181,-0.1507,8.2254,0.12199,-0.17,8.48,0.12223,-0.1872,8.7192,0.12247,-0.2024,8.9481,0.12268,-0.2158,9.1699,0.12283,-0.2278,9.387,0.12294,-0.2384,9.6008,0.12299,-0.2478,9.8124,0.12303,-0.2562,10.0226,0.12306,-0.2637,10.2315,0.12309,-0.2703,10.4393,0.12315,-0.2762,10.6464,0.12323,-0.2815,10.8534,0.12335,-0.2862,11.0608,0.1235,-0.2903,11.2688,0.12369,-0.2941,11.4775,0.1239,-0.2975,11.6864,0.12414,-0.3005,11.8947,0.12441,-0.3032,12.1015,0.12472,-0.3057,12.3059,0.12506,-0.308,12.5073,0.12545,-0.3101,12.7055,0.12587,-0.312,12.9006,0.12633,-0.3138,13.093,0.12683,-0.3155,13.2837,0.12737,-0.3171,13.4731,0.12794,-0.3186,13.6618,0.12855,-0.3201,13.8503,0.12919,-0.3216,14.0385,0.12988,-0.323,14.2265,0.13059,-0.3243,14.414,0.13135,-0.3257,14.601,0.13213,-0.327,14.7873,0.13293,-0.3283,14.9727,0.13376,-0.3296,15.1573,0.1346,-0.3309,15.341,0.13545,-0.3322,15.524,0.1363,-0.3335,15.7064,0.13716,-0.3348,15.8882,0.138,-0.3361,16.0697,0.13884,-0.3374,16.2511,0.13968,-0.3387,16.4322,0.14051,-0.34,16.6133,0.14132,-0.3414,16.7942,0.14213,-0.3427,16.9748,0.14293,-0.344,17.1551,0.14371,-0.3453,17.3347,0.14448,-0.3466,17.5136,0.14525,-0.3479,17.6916,0.146,-0.3492,17.8686,0.14675,-0.3505,18.0445,0.14748,-0.3518,18.2193,0.14821]},
  lun:{a:0,d:[1,49.1477,0.0379,1,53.6872,0.0364,1,57.0673,0.03568,1,59.8029,0.0352,1,62.0899,0.03486,1,64.0301,0.03463,1,65.7311,0.03448,1,67.2873,0.03441,1,68.7498,0.0344,1,70.1435,0.03444,1,71.4818,0.03452,1,72.771,0.03464,1,74.015,0.03479,1,75.2176,0.03496,1,76.3817,0.03514,1,77.5099,0.03534,1,78.6055,0.03555,1,79.671,0.03576,1,80.7079,0.03598,1,81.7182,0.0362,1,82.7036,0.03643,1,83.6654,0.03666,1,84.604,0.03688,1,85.5202,0.03711,1,86.4153,0.03734]},
  alt:{a:24,d:[1,85.7153,0.03764,1,86.5904,0.03786,1,87.4462,0.03808,1,88.283,0.0383,1,89.1004,0.03851,1,89.8991,0.03872,1,90.6797,0.03893,1,91.443,0.03913,1,92.1906,0.03933,1,92.9239,0.03952,1,93.6444,0.03971,1,94.3533,0.03989,1,95.0515,0.04006,1,95.7399,0.04024,1,96.4187,0.04041,1,97.0885,0.04057,1,97.7493,0.04073,1,98.4015,0.04089,1,99.0448,0.04105,1,99.6795,0.0412,1,100.306,0.04135,1,100.924,0.0415,1,101.534,0.04164,1,102.136,0.04179,1,102.731,0.04193,1,103.32,0.04206,1,103.902,0.0422,1,104.479,0.04233,1,105.049,0.04246,1,105.615,0.04259,1,106.175,0.04272,1,106.73,0.04285,1,107.279,0.04298,1,107.823,0.0431,1,108.361,0.04322,1,108.895,0.04334,1,109.423,0.04347]},
  cc:{a:0,d:[1,33.8787,0.03496,1,36.5463,0.0321,1,38.2521,0.03168,1,39.5328,0.0314,1,40.5817,0.03119,1,41.459,0.03102,1,42.1995,0.03087,1,42.829,0.03075,1,43.3671,0.03063,1,43.83,0.03053,1,44.2319,0.03044,1,44.5844,0.03035,1,44.8965,0.03027,1,45.1752,0.03019,1,45.4265,0.03012,1,45.6551,0.03006,1,45.865,0.02999,1,46.0598,0.02993,1,46.2424,0.02987,1,46.4152,0.02982,1,46.5801,0.02977,1,46.7384,0.02972,1,46.8913,0.02967,1,47.0391,0.02962,1,47.1822,0.02957,1,47.3204,0.02953,1,47.4536,0.02949,1,47.5817,0.02945,1,47.7045,0.02941,1,47.8219,0.02937,1,47.934,0.02933,1,48.041,0.02929,1,48.1432,0.02926,1,48.2408,0.02922,1,48.3343,0.02919,1,48.4239,0.02915,1,48.5099,0.02912,1,48.5926,0.02909,1,48.6722,0.02906,1,48.7489,0.02903,1,48.8228,0.029,1,48.8941,0.02897,1,48.9629,0.02894,1,49.0294,0.02891,1,49.0937,0.02888,1,49.156,0.02886,1,49.2164,0.02883,1,49.2751,0.0288,1,49.3321,0.02878,1,49.3877,0.02875,1,49.4419,0.02873,1,49.4947,0.0287,1,49.5464,0.02868,1,49.5969,0.02865,1,49.6464,0.02863,1,49.6947,0.02861,1,49.7421,0.02859,1,49.7885,0.02856,1,49.8341,0.02854,1,49.8789,0.02852,1,49.9229,0.0285]}},
 M:{peso:{a:0,d:[0.3487,3.3464,0.14602,0.2297,4.4709,0.13395,0.197,5.5675,0.12385,0.1738,6.3762,0.11727,0.1553,7.0023,0.11316,0.1395,7.5105,0.1108,0.1257,7.934,0.10958,0.1134,8.297,0.10902,0.1021,8.6151,0.10882,0.0917,8.9014,0.10881,0.082,9.1649,0.10891,0.073,9.4122,0.10906,0.0644,9.6479,0.10925,0.0563,9.8749,0.10949,0.0487,10.0953,0.10976,0.0413,10.3108,0.11007,0.0343,10.5228,0.11041,0.0275,10.7319,0.11079,0.0211,10.9385,0.11119,0.0148,11.143,0.11164,0.0087,11.3462,0.11211,0.0029,11.5486,0.11261,-0.0028,11.7504,0.11314,-0.0083,11.9514,0.11369,-0.0137,12.1515,0.11426,-0.0189,12.3502,0.11485,-0.024,12.5466,0.11544,-0.0289,12.7401,0.11604,-0.0337,12.9303,0.11664,-0.0385,13.1169,0.11723,-0.0431,13.3,0.11781,-0.0476,13.4798,0.11839,-0.052,13.6567,0.11896,-0.0564,13.8309,0.11953,-0.0606,14.0031,0.12008,-0.0648,14.1736,0.12062,-0.0689,14.3429,0.12116,-0.0729,14.5113,0.12168,-0.0769,14.6791,0.1222,-0.0808,14.8466,0.12271,-0.0846,15.014,0.12322,-0.0883,15.1813,0.12373,-0.092,15.3486,0.12425,-0.0957,15.5158,0.12478,-0.0993,15.6828,0.12531,-0.1028,15.8497,0.12586,-0.1063,16.0163,0.12643,-0.1097,16.1827,0.127,-0.1131,16.3489,0.12759,-0.1165,16.515,0.12819,-0.1198,16.6811,0.1288,-0.123,16.8471,0.12943,-0.1262,17.0132,0.13005,-0.1294,17.1792,0.13069,-0.1325,17.3452,0.13133,-0.1356,17.5111,0.13197,-0.1387,17.6768,0.13261,-0.1417,17.8422,0.13325,-0.1447,18.0073,0.13389,-0.1477,18.1722,0.13453,-0.1506,18.3366,0.13517,-0.2026,18.5057,0.12988,-0.213,18.6802,0.13028,-0.2234,18.8563,0.13067,-0.2338,19.034,0.13105,-0.2443,19.2132,0.13142,-0.2548,19.394,0.13178,-0.2653,19.5765,0.13213,-0.2758,19.7607,0.13246,-0.2864,19.9468,0.13279,-0.2969,20.1344,0.13311,-0.3075,20.3235,0.13342,-0.318,20.5137,0.13372,-0.3285,20.7052,0.13402,-0.339,20.8979,0.13432,-0.3494,21.0918,0.13462,-0.3598,21.287,0.13493,-0.3701,21.4833,0.13523,-0.3804,21.681,0.13554,-0.3906,21.8799,0.13586,-0.4007,22.08,0.13618,-0.4107,22.2813,0.13652,-0.4207,22.4837,0.13686,-0.4305,22.6872,0.13722,-0.4402,22.8915,0.13759,-0.4499,23.0968,0.13797,-0.4594,23.3029,0.13838,-0.4688,23.5101,0.1388,-0.4781,23.7182,0.13923,-0.4873,23.9272,0.13969,-0.4964,24.1371,0.14016,-0.5053,24.3479,0.14065,-0.5142,24.5595,0.14117,-0.5229,24.7722,0.1417,-0.5315,24.9858,0.14226,-0.5399,25.2005,0.14284,-0.5482,25.4163,0.14344,-0.5564,25.6332,0.14407,-0.5644,25.8513,0.14472,-0.5722,26.0706,0.14539,-0.5799,26.2911,0.14608,-0.5873,26.5128,0.14679,-0.5946,26.7358,0.14752,-0.6017,26.9602,0.14828,-0.6085,27.1861,0.14905,-0.6152,27.4137,0.14984,-0.6216,27.6432,0.15066,-0.6278,27.875,0.15149,-0.6337,28.1092,0.15233,-0.6393,28.3459,0.15319,-0.6446,28.5854,0.15406,-0.6496,28.8277,0.15493,-0.6543,29.0731,0.15581,-0.6585,29.3217,0.1567,-0.6624,29.5736,0.1576,-0.6659,29.8289,0.1585,-0.6689,30.0877,0.1594,-0.6714,30.3501,0.16031,-0.6735,30.616,0.16122,-0.6752,30.8854,0.16213,-0.6764,31.1586,0.16305]},
  lun:{a:0,d:[1,49.8842,0.03795,1,54.7244,0.03557,1,58.4249,0.03424,1,61.4292,0.03328,1,63.886,0.03257,1,65.9026,0.03204,1,67.6236,0.03165,1,69.1645,0.03139,1,70.5994,0.03124,1,71.9687,0.03117,1,73.2812,0.03118,1,74.5388,0.03125,1,75.7488,0.03137,1,76.9186,0.03154,1,78.0497,0.03174,1,79.1458,0.03197,1,80.2113,0.03222,1,81.2487,0.0325,1,82.2587,0.03279,1,83.2418,0.0331,1,84.1996,0.03342,1,85.1348,0.03376,1,86.0477,0.0341,1,86.941,0.03445,1,87.8161,0.03479]},
  alt:{a:24,d:[1,87.1161,0.03507,1,87.972,0.03542,1,88.8065,0.03576,1,89.6197,0.0361,1,90.412,0.03642,1,91.1828,0.03674,1,91.9327,0.03704,1,92.6631,0.03733,1,93.3753,0.03761,1,94.0711,0.03787,1,94.7532,0.03812,1,95.4236,0.03836,1,96.0835,0.03858,1,96.7337,0.03879,1,97.3749,0.039,1,98.0073,0.03919,1,98.631,0.03937,1,99.2459,0.03954,1,99.8515,0.03971,1,100.448,0.03986,1,101.037,0.04002,1,101.619,0.04016,1,102.193,0.04031,1,102.763,0.04045,1,103.327,0.04059,1,103.889,0.04073,1,104.447,0.04086,1,105.004,0.041,1,105.56,0.04113,1,106.114,0.04126,1,106.667,0.04139,1,107.219,0.04152,1,107.77,0.04165,1,108.32,0.04177,1,108.869,0.0419,1,109.417,0.04202,1,109.964,0.04214,1,110.265,0.04164,1,110.801,0.04172,1,111.334,0.0418,1,111.864,0.04187,1,112.389,0.04195,1,112.911,0.04203,1,113.428,0.04211,1,113.941,0.04218,1,114.45,0.04226,1,114.955,0.04234,1,115.455,0.04241,1,115.951,0.04249,1,116.443,0.04257,1,116.933,0.04264,1,117.42,0.04272,1,117.905,0.0428,1,118.388,0.04287,1,118.87,0.04295,1,119.351,0.04303,1,119.83,0.04311,1,120.308,0.04318,1,120.785,0.04326,1,121.26,0.04334,1,121.734,0.04342,1,122.205,0.0435,1,122.675,0.04358,1,123.143,0.04366,1,123.609,0.04374,1,124.074,0.04382,1,124.536,0.0439,1,124.996,0.04398,1,125.454,0.04406,1,125.91,0.04414,1,126.364,0.04422,1,126.816,0.0443,1,127.265,0.04438,1,127.713,0.04446,1,128.159,0.04454,1,128.603,0.04462,1,129.047,0.0447,1,129.489,0.04478,1,129.93,0.04487,1,130.37,0.04495,1,130.81,0.04503,1,131.25,0.04511,1,131.688,0.04519,1,132.127,0.04527,1,132.565,0.04535,1,133.003,0.04543,1,133.44,0.04551,1,133.877,0.04559,1,134.313,0.04566,1,134.748,0.04574,1,135.183,0.04582,1,135.617,0.04589,1,136.05,0.04597,1,136.483,0.04604,1,136.915,0.04612,1,137.347,0.04619,1,137.78,0.04626,1,138.212,0.04633,1,138.645,0.0464,1,139.08,0.04647,1,139.516,0.04654,1,139.954,0.04661,1,140.395,0.04667,1,140.839,0.04674,1,141.286,0.0468,1,141.737,0.04686,1,142.192,0.04692,1,142.65,0.04698,1,143.113,0.04703,1,143.579,0.04709,1,144.051,0.04714,1,144.528,0.04719,1,145.009,0.04723,1,145.496,0.04728,1,145.989,0.04732,1,146.488,0.04736,1,146.993,0.0474,1,147.504,0.04744,1,148.022,0.04747,1,148.548,0.0475,1,149.081,0.04753]},
  cc:{a:0,d:[1,34.4618,0.03686,1,37.2759,0.03133,1,39.1285,0.02997,1,40.5135,0.02918,1,41.6317,0.02868,1,42.5576,0.02837,1,43.3306,0.02817,1,43.9803,0.02804,1,44.53,0.02796,1,44.9998,0.02792,1,45.4051,0.0279,1,45.7573,0.02789,1,46.0661,0.02789,1,46.3395,0.02789,1,46.5844,0.02791,1,46.806,0.02792,1,47.0088,0.02795,1,47.1962,0.02797,1,47.3711,0.028,1,47.5357,0.02803,1,47.6919,0.02806,1,47.8408,0.0281,1,47.9833,0.02813,1,48.1201,0.02817,1,48.2515,0.02821,1,48.3777,0.02825,1,48.4989,0.0283,1,48.6151,0.02834,1,48.7264,0.02838,1,48.8331,0.02842,1,48.9351,0.02847,1,49.0327,0.02851,1,49.126,0.02855,1,49.2153,0.02859,1,49.3007,0.02863,1,49.3826,0.02867,1,49.4612,0.02871,1,49.5367,0.02875,1,49.6093,0.02878,1,49.6791,0.02882,1,49.7465,0.02886,1,49.8116,0.02889,1,49.8745,0.02893,1,49.9354,0.02896,1,49.9942,0.02899,1,50.0512,0.02903,1,50.1064,0.02906,1,50.1598,0.02909,1,50.2115,0.02912,1,50.2617,0.02915,1,50.3105,0.02918,1,50.3578,0.02921,1,50.4039,0.02924,1,50.4488,0.02927,1,50.4926,0.02929,1,50.5354,0.02932,1,50.5772,0.02935,1,50.6183,0.02938,1,50.6587,0.0294,1,50.6984,0.02943,1,50.7375,0.02946]}}
};

