/* ---------- percentili OMS (fase 5a) ---------- */
const PCURVE = [[3,-1.88079],[15,-1.03643],[50,0],[85,1.03643],[97,1.88079]];
function sexOf(c){ const v=String((S.sex||{})[c]||""); if(/^f/i.test(v)) return "F"; if(/^m/i.test(v)) return "M"; return c==="Sibilla"?"F":"M"; }
function ageMonths(b,d){ const b0=new Date(b.getFullYear(),b.getMonth(),b.getDate()); return (d-b0)/(864e5*30.4375); }  /* dalla mezzanotte del giorno di nascita */
/* tabella per misura ed età: sotto i 24 mesi lunghezza (sdraiata), poi altezza (in piedi) */
function omsTab(sex,key,t){ const s=OMS[sex]; if(key==="altezza") return t<24 ? s.lun : s.alt; return key==="peso" ? s.peso : s.cc; }
function omsMax(sex,key){ const tb=omsTab(sex,key,999); return tb.a + tb.d.length/3 - 1; }
function lmsAt(sex,key,t){
  if(t==null || t<0) return null;
  const tb=omsTab(sex,key,t), n=tb.d.length/3, i=t-tb.a;
  if(i<0 || i>n-1) return null;
  const k=Math.min(Math.floor(i), n-2), f=i-k, g=j=>tb.d[k*3+j]+(tb.d[(k+1)*3+j]-tb.d[k*3+j])*f;
  return n<2 ? {L:tb.d[0],M:tb.d[1],S:tb.d[2]} : {L:g(0),M:g(1),S:g(2)};
}
function lmsVal(p,z){ return p.L===0 ? p.M*Math.exp(p.S*z) : p.M*Math.pow(1+p.L*p.S*z, 1/p.L); }
function lmsZ(p,x,restrict){
  let z = p.L===0 ? Math.log(x/p.M)/p.S : (Math.pow(x/p.M,p.L)-1)/(p.L*p.S);
  if(restrict && z>3){ const s3=lmsVal(p,3); z=3+(x-s3)/(s3-lmsVal(p,2)); }        /* metodo OMS oltre ±3 per il peso */
  else if(restrict && z<-3){ const s3=lmsVal(p,-3); z=-3+(x-s3)/(lmsVal(p,-2)-s3); }
  return z;
}
function normCdf(z){ const t=1/(1+0.2316419*Math.abs(z)), d=0.3989423*Math.exp(-z*z/2);
  const p=d*t*(0.3193815+t*(-0.3565638+t*(1.781478+t*(-1.821256+t*1.330274)))); return z>0?1-p:p; }
/* percentile di una misura: {p, z} oppure null se l'età è fuori dalle tabelle */
function percOf(c,key,x,d){
  const b=birthOf(c); if(!b || x==null || !d) return null;
  const t=ageMonths(b,d), p=lmsAt(sexOf(c),key,t); if(!p) return null;
  const z=lmsZ(p,x,key==="peso"); return {z, p:normCdf(z)*100};
}
function pLabel(r){ if(!r) return ""; const p=r.p; if(p<1) return "sotto il 1°"; if(p>99) return "sopra il 99°"; return Math.round(p)+"°"; }
function band(r){ const p=r.p; return p<3?0: p<15?1: p<50?2: p<85?3: p<97?4: 5; }
function niceStep(range,n){ const raw=range/n, pw=Math.pow(10,Math.floor(Math.log10(raw))); const f=raw/pw; return (f<1.5?1:f<3?2:f<7?5:10)*pw; }
function ageTick(t){ t=Math.round(t); if(t<24) return t+" m"; const y=Math.floor(t/12), m=t%12; return y+" a"+(m?" "+m+" m":""); }

function growthSVG(c, ms, key, unit, dec){
  const b=birthOf(c), sex=sexOf(c), now=new Date();
  const pts = ms.filter(m=>m[key]!=null).map(m=>Object.assign({t:ageMonths(b,m._d)}, m)).filter(p=>p.t>=0);
  const tNow=ageMonths(b,now), tMax=omsMax(sex,key);
  const tsData=pts.map(p=>p.t);
  let lo=Math.max(0, Math.min(tNow, ...tsData) - 1), hi=Math.max(tNow, ...tsData) + 2;
  const minSpan = hi<36 ? 12 : 24;
  if(hi-lo<minSpan){ const need=minSpan-(hi-lo); const down=Math.min(lo, need*0.6); lo-=down; hi+=need-down; }
  if(lo>=tMax) return null;                     /* fuori dalle tabelle OMS */
  const cHi=Math.min(hi,tMax);
  const W=340,H=236,L=40,R=30,T=12,B=30;
  /* curve campionate, spezzate a 24 mesi per l'altezza */
  const segs=[]; const cut = key==="altezza" && lo<24 && cHi>24 ? 24 : null;
  const ranges = cut ? [[lo,24-1e-6],[24,cHi]] : [[lo,cHi]];
  ranges.forEach(([a,z])=>{ const n=Math.max(2,Math.ceil((z-a)/(hi-lo)*70)); const s=[];
    for(let i=0;i<=n;i++){ const t=a+(z-a)*i/n, p=lmsAt(sex,key,t); if(p) s.push({t, v:PCURVE.map(q=>lmsVal(p,q[1]))}); }
    if(s.length>1) segs.push(s); });
  let y0=Infinity,y1=-Infinity;
  segs.forEach(s=>s.forEach(q=>{ y0=Math.min(y0,q.v[0]); y1=Math.max(y1,q.v[4]); }));
  pts.forEach(p=>{ if(p.t>=lo-0.01 && p.t<=hi+0.01){ y0=Math.min(y0,p[key]); y1=Math.max(y1,p[key]); } });
  const pad=(y1-y0)*0.05; y0-=pad; y1+=pad;
  const X=t=>L+(t-lo)/(hi-lo)*(W-L-R), Y=v=>T+(1-(v-y0)/(y1-y0))*(H-T-B), f=n=>n.toFixed(1);
  let g='<g class="grid">'; const st=niceStep(y1-y0,4);
  for(let v=Math.ceil(y0/st)*st; v<=y1; v+=st){ const y=Y(v); g+='<line x1="'+L+'" x2="'+(W-R)+'" y1="'+f(y)+'" y2="'+f(y)+'"/><text class="lbl" x="'+(L-6)+'" y="'+f(y+4)+'" text-anchor="end">'+fmt(v,st<1?1:0)+'</text>'; }
  g+='</g>';
  const span=hi-lo, maxLab = lo>=24 ? 4 : 6, xs = [1,2,3,6,12,24].find(s=>span/s<=maxLab) || 24;
  let xl=''; for(let t=Math.ceil(lo/xs)*xs; t<=hi; t+=xs){ const x=X(t); if(x<L+8||x>W-R-4) continue; xl+='<text class="lbl" x="'+f(x)+'" y="'+(H-8)+'" text-anchor="middle">'+esc(ageTick(t))+'</text>'; }
  const poly=(s,i,j)=>s.map(q=>f(X(q.t))+","+f(Y(q.v[i]))).join(" ")+" "+s.slice().reverse().map(q=>f(X(q.t))+","+f(Y(q.v[j]))).join(" ");
  let cv='';
  segs.forEach(s=>{
    cv+='<polygon class="pb out" points="'+poly(s,0,1)+'"/><polygon class="pb mid" points="'+poly(s,1,3)+'"/><polygon class="pb out" points="'+poly(s,3,4)+'"/>';
    PCURVE.forEach((q,i)=>{ cv+='<polyline class="pc'+(q[0]===50?' p50':'')+'" points="'+s.map(r=>f(X(r.t))+","+f(Y(r.v[i]))).join(" ")+'"/>'; });
  });
  if(cut && 24>lo && 24<hi) cv+='<line class="cut" x1="'+f(X(24))+'" x2="'+f(X(24))+'" y1="'+T+'" y2="'+(H-B)+'"/>';
  const last=segs.length? segs[segs.length-1][segs[segs.length-1].length-1] : null;
  if(last && cHi>=hi-0.01){ let prev=-99;
    PCURVE.forEach((q,i)=>{ const y=Y(last.v[i]); if(Math.abs(y-prev)<9) return; cv+='<text class="lbl pl" x="'+(W-R+4)+'" y="'+f(y+4)+'">'+q[0]+'</text>'; prev=y; }); }
  const vis=pts.filter(p=>p.t>=lo-0.01 && p.t<=hi+0.01);
  const line = vis.length>1 ? '<polyline class="mseries" points="'+vis.map(p=>f(X(p.t))+","+f(Y(p[key]))).join(" ")+'"/>' : "";
  const dots = vis.map(p=>{ const r=percOf(c,key,p[key],p._d);
    return '<circle r="4.5" class="m'+(p.pending?" pend":"")+'" cx="'+f(X(p.t))+'" cy="'+f(Y(p[key]))+'"><title>'+esc(ageLabel(b,p._d)+": "+fmt(p[key],dec)+" "+unit+(r?", "+pLabel(r)+" percentile":""))+'</title></circle>'; }).join("");
  const desc = vis.length ? vis.map(p=>{ const r=percOf(c,key,p[key],p._d); return ageLabel(b,p._d)+" "+fmt(p[key],dec)+" "+unit+(r?" ("+pLabel(r)+" percentile)":""); }).join("; ") : "nessuna misura";
  return '<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Curve percentili OMS 3, 15, 50, 85 e 97. Misure: '+esc(desc)+'">'+cv+g+xl+line+dots+'</svg>';
}

/* testo sotto il grafico: ultima misura, avvisi tranquilli */
function percNote(c, ms, key, unit, dec){
  const b=birthOf(c), pts=ms.filter(m=>m[key]!=null);
  const withP = pts.map(m=>({m, r:percOf(c,key,m[key],m._d)})).filter(x=>x.r);
  let h='';
  if(withP.length){
    const lastP=withP[withP.length-1], lt=ageMonths(b,lastP.m._d);
    h+='<p class="pnote"><b>'+esc(pLabel(lastP.r))+' percentile</b> all\'ultima misura ('+esc(fmt(lastP.m[key],dec)+" "+unit+", "+ageLabel(b,lastP.m._d))+').</p>';
    const warn=[];
    if(lastP.r.p<3 || lastP.r.p>97) warn.push('L\'ultima misura è fuori dalla fascia tra 3° e 97° percentile. Una misura da sola dice poco, conta come va nel tempo: mostrala al pediatra al prossimo controllo, o prima se ti preoccupa.');
    const prev = withP.filter(x=>{ const t=ageMonths(b,x.m._d); return t>=1 && lt-t>=2 && lt-t<=12; });
    if(lt>=1 && prev.some(x=>Math.abs(band(x.r)-band(lastP.r))>=2)) warn.push('Negli ultimi mesi la misura ha attraversato due linee percentili. Può succedere, ma è un andamento da far vedere al pediatra.');
    warn.forEach(w=>{ h+='<p class="pwarn">'+w+'</p>'; });
  }
  return h;
}

function chartSVG(ms, key, unit, dec, birth){
  const pts = ms.filter(m=>m[key]!=null);
  if(!pts.length) return '<p class="empty">Nessun dato per questo grafico.</p>';
  const W=340,H=210,L=42,R=12,T=12,B=30;
  let x0=pts[0]._d.getTime(), x1=pts[pts.length-1]._d.getTime();
  if(x1-x0 < 86400000*20){ x0-=86400000*15; x1+=86400000*15; }
  let ys=pts.map(p=>p[key]), y0=Math.min(...ys), y1=Math.max(...ys);
  const span=Math.max(y1-y0, key==="peso"?1:4); const mid=(y0+y1)/2;
  y0=mid-span*0.65; y1=mid+span*0.65;
  const X=t=>L+(t-x0)/(x1-x0)*(W-L-R), Y=v=>T+(1-(v-y0)/(y1-y0))*(H-T-B);
  let g='<g class="grid">';
  for(let i=0;i<=3;i++){ const v=y0+(y1-y0)*i/3, y=Y(v); g+='<line x1="'+L+'" x2="'+(W-R)+'" y1="'+y.toFixed(1)+'" y2="'+y.toFixed(1)+'"/><text class="lbl" x="'+(L-6)+'" y="'+(y+4).toFixed(1)+'" text-anchor="end">'+fmt(v,key==="peso"?1:0)+'</text>'; }
  g+='</g>';
  const xs=[x0,(x0+x1)/2,x1];
  const xl=xs.map((t,i)=>{ const d=new Date(t); const lab = birth? shortAge(birth,d) : shortDate(d);
    return '<text class="lbl" x="'+X(t).toFixed(1)+'" y="'+(H-8)+'" text-anchor="'+(i===0?"start":i===2?"end":"middle")+'">'+esc(lab)+'</text>'; }).join("");
  const line = pts.length>1 ? '<polyline class="series" points="'+pts.map(p=>X(p._d.getTime()).toFixed(1)+","+Y(p[key]).toFixed(1)).join(" ")+'"/>' : "";
  const dots = pts.map(p=>'<circle r="4.5" class="'+(p.pending?"pend":"")+'" cx="'+X(p._d.getTime()).toFixed(1)+'" cy="'+Y(p[key]).toFixed(1)+'"><title>'+esc(shortDate(p._d))+': '+fmt(p[key],dec)+' '+unit+'</title></circle>').join("");
  const desc = pts.map(p=>shortDate(p._d)+" "+fmt(p[key],dec)+" "+unit).join("; ");
  return '<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Andamento: '+esc(desc)+'">'+g+xl+line+dots+'</svg>';
}

function growthBlock(c,ms,cur){
  const b=birthOf(c), key=cur[0];
  if(!b) return chartSVG(ms,key,cur[2],cur[3],null)+'<p class="small-note">Per le curve OMS serve la data di nascita: si legge dal foglio, scheda Bambini.</p>';
  const svg=growthSVG(c,ms,key,cur[2],cur[3]);
  if(!svg){
    const why = key==="peso" ? "Dopo i 10 anni l'OMS non usa più il peso per età: durante la crescita della pubertà conta l'altezza." :
      key==="cc" ? "Le curve OMS della circonferenza cranica arrivano a 5 anni." : "Le curve OMS caricate nell'app arrivano a 12 anni.";
    return chartSVG(ms,key,cur[2],cur[3],b)+'<p class="small-note">'+why+'</p>';
  }
  let h=svg+percNote(c,ms,key,cur[2],cur[3]);
  h+='<p class="small-note">Le fasce vanno dal 3° al 97° percentile, la linea più marcata è il 50°. In basso l\'età. Curve OMS per '+(sexOf(c)==="F"?"bambine":"bambini")+'.'+
    (key==="altezza" && ageMonths(b,new Date())<30 ? ' Fino a 2 anni si misura la lunghezza da sdraiata, poi l\'altezza in piedi, che è circa 0,7 cm in meno: per questo le curve fanno un piccolo salto a 2 anni.' : '')+'</p>';
  return h;
}

function viewCrescita(){
  const c=S.child, b=birthOf(c), ms=measuresFor(c);
  const small = !b || ageParts(b,new Date()).months < 36 || ms.some(m=>m.cc!=null);
  const now=new Date(); const local = now.getFullYear()+"-"+pad(now.getMonth()+1)+"-"+pad(now.getDate())+"T"+pad(now.getHours())+":"+pad(now.getMinutes());
  const metrics = [["peso","Peso","kg",2],["altezza","Altezza","cm",1]].concat(small?[["cc","Circonferenza cranica","cm",1]]:[]);
  if(!metrics.some(m=>m[0]===metric)) metric="peso";
  const cur = metrics.find(m=>m[0]===metric);
  let h = '<div class="pdlink"><button class="btn ghost full" data-go="pediatra">Riepilogo PDF per il pediatra</button></div>'+
    '<h2>Grafici</h2><div class="panel chart"><div class="tabs" role="group" aria-label="Misura">'+
    metrics.map(m=>'<button data-metric="'+m[0]+'" aria-pressed="'+(m[0]===metric)+'">'+m[1]+'</button>').join("")+'</div>'+
    growthBlock(c,ms,cur)+
    '</div>';

  h += '<h2>Nuova misura</h2><div class="panel">'+
    (formError?'<p class="formerr" id="formerr" role="alert">'+esc(formError)+'</p>':'')+
    '<div class="field"><label for="f-data">Data e ora</label><input id="f-data" type="datetime-local" value="'+local+'" max="'+local+'"></div>'+
    '<div class="grid3">'+
      '<div class="field"><label for="f-peso">Peso</label><div class="unit"><input id="f-peso" inputmode="decimal" autocomplete="off" placeholder="0,00"><b>kg</b></div></div>'+
      '<div class="field"><label for="f-alt">Altezza</label><div class="unit"><input id="f-alt" inputmode="decimal" autocomplete="off" placeholder="0,0"><b>cm</b></div></div>'+
      (small?'<div class="field"><label for="f-cc">Circ. cranica</label><div class="unit"><input id="f-cc" inputmode="decimal" autocomplete="off" placeholder="0,0"><b>cm</b></div></div>':'')+
    '</div>'+
    '<div class="field"><label for="f-dove">Dove</label><select id="f-dove"><option value="casa">A casa</option><option value="pediatra">Dal pediatra</option><option value="altro">Altro</option></select></div>'+
    '<div class="field"><label for="f-note">Note</label><textarea id="f-note" placeholder="Facoltative"></textarea></div>'+
    '<button class="btn full" id="f-save">Salva misura</button>'+
    '<p class="lead" style="font-size:14px;margin:10px 0 0">La misura resta sul telefono e parte verso il foglio appena c\'è collegamento.</p>'+
    '</div>';

  h += '<h2>Storico</h2><div class="panel">';
  if(!ms.length) h += '<p class="lead">Ancora nessuna misura per '+esc(c)+'.</p>';
  else{
    h += '<ul class="list">'+ms.slice().reverse().map(m=>{
      const pv=(k,txt)=>{ const r=percOf(c,k,m[k],m._d); return txt+(r?' <span class="pcv">'+esc(pLabel(r))+' percentile</span>':''); };
      const vals=[m.peso!=null?pv("peso",fmt(m.peso,2)+" kg"):"", m.altezza!=null?pv("altezza",fmt(m.altezza,1)+" cm"):"", m.cc!=null?pv("cc","cc "+fmt(m.cc,1)+" cm"):""].filter(Boolean).join("<br>");
      const meta=[b?ageLabel(b,m._d):"", m.dove==="pediatra"?"dal pediatra":m.dove==="casa"?"a casa":m.dove, m.note].filter(Boolean).map(esc).join(", ");
      return '<li><div><div class="when">'+esc(shortDate(m._d))+(m.pending?'<span class="tag">in attesa</span>':'')+'</div><div class="meta">'+meta+'</div>'+
        (m.pending?'<button class="btn ghost small" style="margin-top:6px" data-del="'+esc(m.id)+'">Elimina</button>':'')+
        '</div><div class="vals">'+vals+'</div></li>';
    }).join("")+'</ul><p class="lead" style="font-size:14px;margin:10px 0 0">Per correggere una misura già inviata, modificala nel foglio.</p>';
  }
  h += '</div>';
  return h;
}

function nannaSVG(map){
  const W=340,H=180,L=30,R=8,T=12,B=26, N=14;
  const days=[]; for(let o=N-1;o>=0;o--){ const k=dayKey(dayStart(o)); days.push({k, d:dayStart(o), r:map[k]}); }
  const vals = days.filter(x=>x.r).map(x=>x.r.ore);
  if(!vals.length) return '<p class="empty">Ancora nessun giorno segnato nelle ultime due settimane.</p>';
  const top = Math.max(16, Math.ceil(Math.max(...vals)/2)*2+2);
  const bw=(W-L-R)/N, Y=v=>T+(1-v/top)*(H-T-B);
  let g='<g class="grid">';
  for(let v=0; v<=top; v+=4){ const y=Y(v); g+='<line x1="'+L+'" x2="'+(W-R)+'" y1="'+y.toFixed(1)+'" y2="'+y.toFixed(1)+'"/><text class="lbl" x="'+(L-5)+'" y="'+(y+4).toFixed(1)+'" text-anchor="end">'+v+'</text>'; }
  g+='</g>';
  let bars='';
  days.forEach((x,i)=>{
    const cx=L+bw*i+bw/2;
    if(x.r){ const y=Y(x.r.ore); bars+='<rect class="nb'+(x.r.pending?' pend':'')+'" x="'+(cx-bw*0.34).toFixed(1)+'" y="'+y.toFixed(1)+'" width="'+(bw*0.68).toFixed(1)+'" height="'+(Y(0)-y).toFixed(1)+'" rx="3"><title>'+esc(dayWord(x.k))+': '+fmt(x.r.ore,1)+' ore</title></rect>'; }
    else bars+='<circle class="miss" cx="'+cx.toFixed(1)+'" cy="'+(Y(0)-3).toFixed(1)+'" r="2.5"/>';
    if(i%2===1 || i===N-1) bars+='<text class="lbl" x="'+cx.toFixed(1)+'" y="'+(H-8)+'" text-anchor="middle">'+x.d.getDate()+'</text>';
  });
  const a7=avgDays(map,0,6);
  const avg = a7 ? '<line class="avg" x1="'+(L+bw*7).toFixed(1)+'" x2="'+(W-R)+'" y1="'+Y(a7.avg).toFixed(1)+'" y2="'+Y(a7.avg).toFixed(1)+'"/>' : '';
  const desc = days.filter(x=>x.r).map(x=>dayWord(x.k)+" "+fmt(x.r.ore,1)+" ore").join("; ");
  return '<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Ore di sonno degli ultimi 14 giorni: '+esc(desc)+'">'+g+bars+avg+'</svg>';
}

function viewNanna(){
  const c=S.child, map=sonnoDays(c), k=nKey(), cur=map[k], v=nShown(map);
  const custom = nDay!=="ieri" && nDay!=="oggi";
  const today = dayKey(dayStart(0));
  let h = '<h2>Quante ore ha dormito?</h2><div class="panel">'+
    (nErr?'<p class="formerr" role="alert">'+esc(nErr)+'</p>':'')+
    '<div class="seg" role="group" aria-label="Giorno">'+
      [["ieri","Ieri"],["oggi","Oggi"],["altro","Altro giorno"]].map(([key,l])=>
        '<button data-nday="'+key+'" aria-pressed="'+(key==="altro"?custom:nDay===key)+'">'+l+'</button>').join("")+
    '</div>'+
    (custom?'<div class="field"><label for="n-day">Giorno</label><input id="n-day" type="date" value="'+esc(dayFromKey(nDay)?nDay:dayKey(dayStart(2)))+'" max="'+today+'"></div>':'')+
    (cur?'<p class="already">Per '+esc(dayWord(k))+' c’è già <b>'+fmt(cur.ore,1)+' ore</b>'+(cur.pending?' (su questo telefono, in attesa)':' (dal foglio)')+'. Se salvi, il nuovo valore lo sostituisce.</p>':'')+
    '<p class="lead" style="text-align:center;margin:0">Totale della giornata, notte e pisolini</p>'+
    '<div class="stepper"><button data-nstep="-1" aria-label="Mezz’ora in meno"'+(v<=0?' disabled':'')+'>−</button>'+
      '<output aria-live="polite">'+fmt(v,1)+' <small>ore</small></output>'+
      '<button data-nstep="1" aria-label="Mezz’ora in più"'+(v>=24?' disabled':'')+'>+</button></div>'+
    '<div class="field"><label for="n-note">Note</label><input id="n-note" autocomplete="off" maxlength="300" placeholder="Facoltative, per esempio: risvegli, dentini"></div>'+
    '<button class="btn full" id="n-save">'+(cur?'Correggi con '+fmt(v,1)+' ore':'Salva '+fmt(v,1)+' ore per '+esc(dayWord(k)))+'</button>'+
    '<div class="fresh"><span>'+(S.lastSync?'Controllato sul foglio alle '+timeOf(S.lastSync):'Non ancora controllato sul foglio')+'</span><button class="refresh" id="sync">Aggiorna</button></div>'+
  '</div>';

  const a7=avgDays(map,0,6), a14=avgDays(map,0,13);
  h += '<h2>Ultimi 14 giorni</h2><div class="panel chart">';
  if(a7||a14){
    h += '<div class="kpi" style="margin-bottom:12px">'+
      '<div><div class="big">'+(a7?fmt(a7.avg,1):"–")+' <small>ore</small></div><div class="lead">media 7 giorni'+(a7?', su '+plural(a7.n,"giorno segnato","giorni segnati"):'')+'</div></div>'+
      '<div><div class="big">'+(a14?fmt(a14.avg,1):"–")+' <small>ore</small></div><div class="lead">media 14 giorni'+(a14?', su '+plural(a14.n,"giorno","giorni"):'')+'</div></div></div>';
  }
  h += nannaSVG(map);
  h += '<p style="margin:12px 0 0"><button class="btn ghost small" data-rwgo="0">Riepilogo settimanale</button></p>';
  if(a7) h += '<div class="legend"><span><i></i>ore del giorno</span><span><i class="a"></i>media 7 giorni</span></div>';
  h += '</div>';

  const recent = Object.values(map).filter(r=>r.day>=dayKey(dayStart(13))).sort((a,b)=>a.day<b.day?1:-1);
  if(recent.length){
    h += '<h2>Giorni segnati</h2><div class="panel"><ul class="list">'+recent.map(r=>
      '<li><div><div class="when">'+esc(dayWord(r.day))+(r.pending?'<span class="tag">in attesa</span>':'')+'</div>'+
        (r.note?'<div class="meta">'+esc(r.note)+'</div>':'')+
        (r.pending?'<button class="btn ghost small" style="margin-top:6px" data-dels="'+esc(r.id)+'">Elimina</button>':'')+
      '</div><div class="vals"><b>'+fmt(r.ore,1)+' h</b></div></li>').join("")+
      '</ul><p class="lead" style="font-size:14px;margin:10px 0 0">Per correggere un giorno basta salvarlo di nuovo: vale l’ultimo valore inserito, da qualunque telefono.</p></div>';
  }
  return h;
}

function viewDiario(){
  const c=S.child, all=diarioFor(c);
  const now=new Date(); const local = now.getFullYear()+"-"+pad(now.getMonth()+1)+"-"+pad(now.getDate())+"T"+pad(now.getHours())+":"+pad(now.getMinutes());
  let h = '<h2>Nuova nota</h2><div class="panel">'+
    (dErr?'<p class="formerr" role="alert">'+esc(dErr)+'</p>':'')+
    '<div class="seg" role="group" aria-label="Categoria">'+CATS.map(([k,l])=>'<button data-dcat="'+esc(k)+'" aria-pressed="'+(dCat===k)+'">'+l+'</button>').join("")+'</div>'+
    '<div class="field"><label for="d-testo">Nota</label><textarea id="d-testo" maxlength="1000" placeholder="'+(dCat==="parola"?"Quale parola, e quando l’ha detta?":dCat==="prima volta"?"Che cosa ha fatto per la prima volta?":dCat==="salute"?"Febbre, dentini, visite…":"Che cosa è successo?")+'"></textarea></div>'+
    '<div class="grid3">'+
      '<div class="field"><label for="d-data">Data e ora</label><input id="d-data" type="datetime-local" value="'+local+'" max="'+local+'"></div>'+
      '<div class="field"><label for="d-foto">Link foto</label><input id="d-foto" type="url" inputmode="url" autocomplete="off" placeholder="Facoltativo"></div>'+
    '</div>'+
    '<button class="btn full" id="d-save">Salva nota</button>'+
    (dCat==="salute"?'<p class="lead" style="font-size:14px;margin:10px 0 0">Febbre, farmaci, visite e vaccini hanno la loro sezione: <button class="linkbtn" data-go="salute">Salute</button>.</p>':'')+
    '<p class="lead" style="font-size:14px;margin:10px 0 0">Per la foto, incolla il link di condivisione (per esempio da Google Foto).</p>'+
  '</div>';

  const counts = {}; all.forEach(n=>{ const k=String(n.cat).toLowerCase(); counts[k]=(counts[k]||0)+1; });
  const list = dFilter==="tutte" ? all : all.filter(n=>String(n.cat).toLowerCase()===dFilter);
  h += '<h2>Diario di '+esc(c)+'</h2>';
  if(all.length){
    h += '<div class="seg" role="group" aria-label="Filtra per categoria"><button data-dfil="tutte" aria-pressed="'+(dFilter==="tutte")+'">Tutte '+all.length+'</button>'+
      CATS.filter(([k])=>counts[k]).map(([k,l])=>'<button data-dfil="'+esc(k)+'" aria-pressed="'+(dFilter===k)+'">'+l+' '+counts[k]+'</button>').join("")+'</div>';
  }
  h += '<div class="panel">';
  if(!list.length) h += '<p class="lead">'+(all.length?'Nessuna nota in questa categoria.':'Il diario è ancora vuoto. La prima nota può essere anche solo una parola.')+'</p>';
  else{
    let lastM = "", html = "";
    list.forEach(n=>{
      const m = MESI[n._d.getMonth()]+" "+n._d.getFullYear();
      if(m!==lastM){ if(lastM) html += '</ul>'; html += '<div class="month">'+esc(m.charAt(0).toUpperCase()+m.slice(1))+'</div><ul class="dlist">'; lastM = m; }
      const foto = safeUrl(n.foto);
      html += '<li><div class="when"><span class="ctag">'+esc(catLabel(n.cat))+'</span>'+esc(GIORNI[n._d.getDay()]+" "+n._d.getDate()+", "+pad(n._d.getHours())+":"+pad(n._d.getMinutes()))+
        (n.pending?'<span class="tag">in attesa</span>':'')+'</div>'+
        '<div class="note-txt">'+esc(n.testo)+'</div>'+
        (foto?'<div style="margin-top:4px"><a href="'+esc(foto)+'" target="_blank" rel="noopener">Apri la foto</a></div>':'')+
        (n.pending?'<button class="btn ghost small" style="margin-top:6px" data-deld="'+esc(n.id)+'">Elimina</button>':'')+
      '</li>';
    });
    h += html + '</ul><p class="lead" style="font-size:14px;margin:12px 0 0">Per correggere una nota già inviata, modificala nel foglio, scheda Diario.</p>';
  }
  h += '</div>';
  return h;
}

/* ---------- salute (blocco 5d) ----------
   Scheda Salute del foglio: ID | Data | Bambino | Tipo | Che cosa | Dettagli | Febbre (°C) | Episodio (ID) | Note | Origine.
   Tipo: vaccino, malattia (episodio), febbre, farmaco, visita, guarito (chiude l'episodio), nota.
   Febbre, farmaci, visite e guarito di un episodio hanno in Episodio l'ID della riga malattia. Le righe non si modificano.
   Calendario vaccinale: Regione Marche, PRPV 2023-2025 (DGR 797 del 27/05/2024, recepisce il PNPV 2023-2025),
   tabella e note su vaccinarsinellemarche.org, controllate il 25/10/2026. Mesi e anni compiuti (2 mesi = dal 61° giorno).
   m = età in mesi da cui si fa; w = mesi dopo i quali, se non segnato, diventa "da controllare sul libretto".
   Vaccino = nome + dose (testo esatto): non cambiare i testi, le righe vecchie non verrebbero più riconosciute. */
const VACC = [
  {k:"esa1", n:"Esavalente", d:"1ª dose", m:2, w:3, eta:"2 mesi", info:"Difterite, tetano, pertosse, polio, epatite B, Hib."},
  {k:"pcv1", n:"Pneumococco coniugato", d:"1ª dose", m:2, w:3, eta:"2 mesi"},
  {k:"menb1", n:"Meningococco B", d:"1ª dose", m:2, w:3, eta:"2 mesi"},
  {k:"rv1", n:"Rotavirus", d:"1ª dose", m:2, w:3, eta:"2 mesi", info:"Per bocca. Ciclo da 2 o 3 dosi secondo il vaccino, da finire entro le 24 o 32 settimane."},
  {k:"rv2", n:"Rotavirus", d:"2ª dose", m:3, w:3, eta:"3 mesi"},
  {k:"esa2", n:"Esavalente", d:"2ª dose", m:4, w:3, eta:"4 mesi"},
  {k:"pcv2", n:"Pneumococco coniugato", d:"2ª dose", m:4, w:3, eta:"4 mesi"},
  {k:"menb2", n:"Meningococco B", d:"2ª dose", m:4, w:3, eta:"4 mesi", info:"Almeno 2 mesi dopo la prima."},
  {k:"rv3", n:"Rotavirus", d:"3ª dose", m:4, w:3, eta:"4 mesi", opt:true, info:"Solo con il vaccino a 3 dosi."},
  {k:"esa3", n:"Esavalente", d:"richiamo", m:10, w:3, eta:"10 mesi"},
  {k:"pcv3", n:"Pneumococco coniugato", d:"richiamo", m:10, w:3, eta:"10 mesi", info:"Ciclo da 3 o 4 dosi secondo il vaccino."},
  {k:"mprv1", n:"Morbillo, parotite, rosolia, varicella (MPRV)", d:"1ª dose", m:12, w:6, eta:"12 mesi"},
  {k:"acwy1", n:"Meningococco ACWY", d:"1 dose", m:12, w:6, eta:"dai 12 mesi (13–15)"},
  {k:"menb3", n:"Meningococco B", d:"richiamo", m:12, w:6, eta:"2° anno di vita", info:"Almeno 6 mesi dopo la 2ª dose."},
  {k:"dtp6", n:"Difterite, tetano, pertosse, polio (DTPa-IPV)", d:"richiamo", m:60, w:24, eta:"5–6 anni"},
  {k:"mprv2", n:"Morbillo, parotite, rosolia, varicella (MPRV)", d:"2ª dose", m:60, w:24, eta:"5–6 anni"},
  {k:"hpv", n:"Papillomavirus (HPV)", d:"ciclo", m:132, w:72, eta:"11 anni", info:"2 o 3 dosi secondo l’età."},
  {k:"menb11", n:"Meningococco B", d:"dose adolescenti", m:132, w:72, eta:"11 anni", info:"Marche: offerta agli undicenni, insieme all’HPV."},
  {k:"acwy2", n:"Meningococco ACWY", d:"richiamo", m:144, w:72, eta:"12–18 anni"},
  {k:"dtpad", n:"Difterite, tetano, pertosse, polio (dTpa-IPV)", d:"richiamo", m:144, w:72, eta:"12–18 anni"}
];
const MAL = ["Raffreddore","Tosse","Febbre","Mal d’orecchio","Mal di gola","Gastroenterite","Congiuntivite","Altro"];
const VIS = ["Pediatra","Bilancio di salute","Specialista","Pronto soccorso","Altro"];
const FARM_SUGG = ["Paracetamolo","Ibuprofene","Antibiotico","Vitamina D","Aerosol","Collirio"];
const VACC_SUGG = ["Antinfluenzale","Anticorpo VRS (nirsevimab)","Epatite A","Meningococco C"];
let hForm = "", hErr = "", hEp = "", hCosa = "", hVk = "", hCal = false, hAll = false, hAllEdit = false;

function saluteToSheet(o){ const sd=toSerial(o.data); return [o.id, sd==null?o.data:sd, o.bambino, o.tipo, o.cosa||"", o.det||"", o.temp==null?"":o.temp, o.ep||"", o.note||"", "app-genitori"]; }
function saluteFor(c){
  const ids = new Set(S.salute.map(r=>r.id));
  const all = S.salute.filter(r=>r.bambino===c && r.origine!=="test" && r.origine!=="prova").map(r=>Object.assign({pending:false}, r))
    .concat(S.qs.salute.filter(q=>q.bambino===c && !ids.has(q.id)).map(q=>Object.assign({pending:true}, q)));
  all.forEach(r=>{ r._d=parseDate(r.data); r.tipo=String(r.tipo||"").toLowerCase().trim(); });
  return all.filter(r=>r._d).sort((a,b)=>(b._d-a._d) || (ordOf(b.id)-ordOf(a.id)));
}
function addMonths(b,m){ return new Date(b.getFullYear(), b.getMonth()+m, b.getDate()); }
function vKey(n,d){ return (String(n||"")+"|"+String(d||"")).toLowerCase().replace(/\s+/g," ").trim(); }
const VKEYS = new Set(VACC.map(v=>vKey(v.n,v.d)));
function vaccList(c){
  const b=birthOf(c), all=saluteFor(c).filter(r=>r.tipo==="vaccino"), done={};
  all.forEach(r=>{ const k=vKey(r.cosa,r.det); if(!done[k] || r._d<done[k]._d) done[k]=r; });
  return VACC.map(v=>{
    const row=done[vKey(v.n,v.d)], due=b? addMonths(b,v.m) : null;
    let st="piu";
    if(row) st="fatto";
    else if(due){ const dd=daysTo(due); st = dd>30 ? "piu" : dd >= -Math.round(v.w*30.4) ? "dafare" : (v.opt ? "opz" : "contr"); }
    return Object.assign({}, v, {row, due, st});
  });
}
function vaccAltri(c){ return saluteFor(c).filter(r=>r.tipo==="vaccino" && !VKEYS.has(vKey(r.cosa,r.det))); }
/* antinfluenzale: consigliata ogni autunno dai 6 mesi ai 6 anni (circolare annuale del Ministero della Salute) */
function fluInfo(c){
  const b=birthOf(c); if(!b) return null;
  const now=new Date(), mo=ageParts(b,now).months, m=now.getMonth();
  if(mo<6 || mo>=84 || !(m>=9 || m<=1)) return null;
  const y = m>=9 ? now.getFullYear() : now.getFullYear()-1, from=new Date(y,8,1), to=new Date(y+1,2,31);
  const fatto = saluteFor(c).find(r=>r.tipo==="vaccino" && /influenz/i.test(r.cosa) && r._d>=from && r._d<=to);
  return {stag: y+"/"+String(y+1).slice(2), fatto};
}
function episodi(c){
  const all=saluteFor(c);
  return all.filter(r=>r.tipo==="malattia").map(e=>{
    const kids = all.filter(r=>r.ep===e.id);
    const fini = kids.filter(r=>r.tipo==="guarito").sort((a,b)=>b._d-a._d);
    const feb = kids.filter(r=>r.tipo==="febbre");
    const temps = [e.temp].concat(feb.map(r=>r.temp)).filter(x=>x!=null);
    return Object.assign({}, e, {fine:fini[0]||null, open:!fini.length, fmax: temps.length? Math.max.apply(null,temps) : null,
      feb, farm:kids.filter(r=>r.tipo==="farmaco"), vis:kids.filter(r=>r.tipo==="visita")});
  });
}
function epGiorni(e){ const end = e.fine ? e.fine._d : new Date(); return Math.max(1, Math.round((d0(end)-d0(e._d))/864e5)+1); }
function epAnno(c){
  const from = dayStart(365), eps = episodi(c).filter(e=>(e.fine? e.fine._d : new Date()) >= from);
  let gg=0; eps.forEach(e=>{ const s = e._d<from ? from : d0(e._d), end = e.fine ? d0(e.fine._d) : dayStart(0); gg += Math.max(1, Math.round((end-s)/864e5)+1); });
  return {n:eps.length, gg, feb:eps.filter(e=>e.fmax!=null && e.fmax>=38).length};
}
function tTxt(t){ return fmt(t,1)+" °C"; }
function dLocal(d, withTime){ return d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate())+(withTime? "T"+pad(d.getHours())+":"+pad(d.getMinutes()) : ""); }
function hVal(id){ const el=$(id); return el ? el.value.trim() : ""; }
function hSave(row, msg){
  S.qs.salute.push(Object.assign({id:"genitori-salute-"+Date.now(), bambino:S.child}, row)); save();
  hForm=""; hErr=""; hVk=""; hCosa=""; toast(msg); render(); sync(false); return true;
}
function hFail(m){ hErr=m; render(); const el=$("h-err"); if(el) el.scrollIntoView({block:"center"}); return false; }
function hWhen(id, withTime){
  const v=hVal(id); if(!v) return null;
  const d = withTime ? new Date(v) : dayFromKey(v); if(!d || isNaN(d)) return null;
  if(!withTime) d.setHours(12,0,0,0);
  return d;
}
function addSalute(){
  const openEp = hEp && episodi(S.child).find(e=>e.id===hEp && e.open) ? hEp : "";
  if(hForm==="malattia"){
    const cosa = hCosa==="Altro" ? hVal("h-cosa") : hCosa, d=hWhen("h-data",false), t=num(hVal("h-temp"));
    if(!cosa) return hFail("Scegli che cosa ha, o scrivilo in «Altro».");
    if(!d) return hFail("Indica il giorno in cui è iniziato.");
    if(d0(d) > dayStart(0)) return hFail("Il giorno è nel futuro: controllalo.");
    if(t!=null && (t<34 || t>43)) return hFail("La febbre va in gradi, tra 34 e 43.");
    return hSave({tipo:"malattia", data:stamp(d), cosa:cosa.slice(0,60), det:hVal("h-det").slice(0,300), temp:t, note:hVal("h-note").slice(0,300)}, "Malattia segnata");
  }
  if(hForm==="febbre"){
    const t=num(hVal("h-temp")), d=hWhen("h-data",true);
    if(t==null || t<34 || t>43) return hFail("Scrivi la temperatura in gradi, tra 34 e 43.");
    if(!d) return hFail("Indica giorno e ora.");
    if(d.getTime() > Date.now()+60000) return hFail("L’ora è nel futuro: controllala.");
    const note=hVal("h-note").slice(0,300);
    if(openEp) return hSave({tipo:"febbre", data:stamp(d), temp:t, ep:openEp, note}, "Febbre segnata");
    return hSave({tipo:"malattia", data:stamp(d), cosa:"Febbre", temp:t, note}, "Febbre segnata");
  }
  if(hForm==="farmaco"){
    const cosa=hVal("h-cosa"), d=hWhen("h-data",true);
    if(!cosa) return hFail("Scrivi il nome del farmaco.");
    if(!d) return hFail("Indica giorno e ora.");
    if(d.getTime() > Date.now()+60000) return hFail("L’ora è nel futuro: controllala.");
    return hSave({tipo:"farmaco", data:stamp(d), cosa:cosa.slice(0,60), det:hVal("h-det").slice(0,120), ep:openEp, note:hVal("h-note").slice(0,300)}, "Farmaco segnato");
  }
  if(hForm==="visita"){
    const cosa = hCosa==="Altro" ? (hVal("h-cosa")||"Visita") : hCosa, d=hWhen("h-data",true);
    if(!cosa) return hFail("Scegli il tipo di visita.");
    if(!d) return hFail("Indica giorno e ora.");
    if(d.getTime() > Date.now()+60000) return hFail("Le visite future vanno negli appuntamenti, in Oggi.");
    return hSave({tipo:"visita", data:stamp(d), cosa:cosa.slice(0,60), det:hVal("h-det").slice(0,300), ep:openEp, note:hVal("h-note").slice(0,300)}, "Visita segnata");
  }
  if(hForm==="guarito"){
    const e=episodi(S.child).find(x=>x.id===hEp), d=hWhen("h-data",false);
    if(!e) return hFail("Episodio non trovato.");
    if(!d) return hFail("Indica il giorno.");
    if(d0(d) > dayStart(0)) return hFail("Il giorno è nel futuro: controllalo.");
    if(d0(d) < d0(e._d)) return hFail("Il giorno è prima dell’inizio ("+shortDate(e._d)+").");
    return hSave({tipo:"guarito", data:stamp(d), cosa:e.cosa, ep:e.id, note:hVal("h-note").slice(0,300)}, "Guarito: episodio chiuso");
  }
  if(hForm==="vaccino"){
    const v = VACC.find(x=>x.k===hVk), nd = $("h-nd") && $("h-nd").getAttribute("aria-pressed")==="true";
    let d = hWhen("h-data",false); const note = hVal("h-note").slice(0,200);
    if(!v) return hFail("Vaccino non trovato.");
    if(!d && nd){ const b=birthOf(S.child); if(b){ d=addMonths(b,v.m); d.setHours(12,0,0,0); } }
    if(!d) return hFail("Scrivi la data dal libretto, oppure tocca «Non ricordo la data».");
    if(d0(d) > dayStart(0)) return hFail("La data è nel futuro: i vaccini da fare vanno negli appuntamenti.");
    return hSave({tipo:"vaccino", data:stamp(d), cosa:v.n, det:v.d, note: nd && !hVal("h-data") ? ("data non nota"+(note?"; "+note:"")) : note}, "Vaccino segnato");
  }
  if(hForm==="valtro"){
    const cosa=hVal("h-cosa"), d=hWhen("h-data",false);
    if(!cosa) return hFail("Scrivi quale vaccino.");
    if(!d) return hFail("Indica la data.");
    if(d0(d) > dayStart(0)) return hFail("La data è nel futuro: i vaccini da fare vanno negli appuntamenti.");
    return hSave({tipo:"vaccino", data:stamp(d), cosa:cosa.slice(0,60), det:hVal("h-det").slice(0,40), note:hVal("h-note").slice(0,200)}, "Vaccino segnato");
  }
  return false;
}
function saveAllergie(){
  const t = hVal("h-all").slice(0,300);
  S.allerg[S.child] = t; S.qs.allerg[S.child] = {text:t, t:Date.now()}; save();
  hAllEdit=false; toast("Allergie e note salvate"); render(); sync(false);
}
function allergOf(c){ const q=S.qs.allerg[c]; return q ? q.text : (S.allerg[c]||""); }

/* card in Oggi: solo se c'è qualcosa da fare o in corso */
function viewSaluteOggi(c){
  const open = episodi(c).filter(e=>e.open), dafare = vaccList(c).filter(v=>v.st==="dafare");
  if(!open.length && !dafare.length) return "";
  let h = '<h2>Salute</h2><div class="panel"><ul class="dlist">';
  open.forEach(e=>{
    h += '<li><div class="when"><span class="ctag">In corso</span>da '+esc(plural(epGiorni(e),"giorno","giorni"))+'</div>'+
      '<div class="note-txt">'+esc(e.cosa||"Malattia")+(e.fmax!=null?'<span style="color:var(--muted)"> · febbre max '+esc(tTxt(e.fmax))+'</span>':'')+
      (e.farm.length?'<span style="color:var(--muted)"> · '+esc(plural(e.farm.length,"farmaco","farmaci"))+'</span>':'')+'</div></li>';
  });
  dafare.slice(0,3).forEach(v=>{
    const n=daysTo(v.due);
    h += '<li><div class="when"><span class="ctag">Vaccino</span>'+esc(n>0 ? "dal "+shortDate(v.due)+" · "+traTxt(n) : "da fare, dal "+shortDate(v.due))+'</div>'+
      '<div class="note-txt">'+esc(v.n)+' – '+esc(v.d)+'</div></li>';
  });
  if(dafare.length>3) h += '<li><div class="note-txt" style="color:var(--muted)">'+(dafare.length===4?'E un altro vaccino da fare.':'E altri '+(dafare.length-3)+' vaccini da fare.')+'</div></li>';
  return h + '</ul><p style="margin:14px 0 0"><button class="btn ghost" data-go="salute">Apri Salute</button></p></div>';
}

function hErrHtml(){ return hErr ? '<p class="formerr" id="h-err" role="alert">'+esc(hErr)+'</p>' : ''; }
function hButtons(saveTxt){ return '<div class="arow"><button class="btn" id="h-save">'+saveTxt+'</button><button class="btn ghost" id="h-cancel">Annulla</button></div>'; }
function hEpPick(open, allowNone){
  if(!open.length) return "";
  return '<div class="asub">Fa parte di</div><div class="seg" role="group" aria-label="Episodio">'+
    open.map(e=>'<button data-hep="'+esc(e.id)+'" aria-pressed="'+(hEp===e.id)+'">'+esc(e.cosa||"Malattia")+' del '+esc(shortDate(e._d))+'</button>').join("")+
    (allowNone?'<button data-hep="" aria-pressed="'+(!hEp)+'">Nessuno</button>':'')+'</div>';
}
function viewHForm(c){
  const now=new Date(), oggi=dLocal(now,false), adesso=dLocal(now,true), open=episodi(c).filter(e=>e.open);
  let h = '<div class="hform">'+hErrHtml();
  if(hForm==="malattia"){
    h += '<h3>Malattia o raffreddore</h3><div class="seg" role="group" aria-label="Che cosa">'+MAL.map(m=>'<button data-hcosa="'+esc(m)+'" aria-pressed="'+(hCosa===m)+'">'+esc(m)+'</button>').join("")+'</div>'+
      (hCosa==="Altro"?'<div class="field"><label for="h-cosa">Che cosa</label><input id="h-cosa" maxlength="60" placeholder="Per esempio: varicella"></div>':'')+
      '<div class="grid3"><div class="field"><label for="h-data">Iniziato il</label><input id="h-data" type="date" value="'+oggi+'" max="'+oggi+'"></div>'+
      '<div class="field"><label for="h-temp">Febbre</label><div class="unit"><input id="h-temp" inputmode="decimal" placeholder="Se c’è"><b>°C</b></div></div></div>'+
      '<div class="field"><label for="h-det">Sintomi</label><input id="h-det" maxlength="300" placeholder="Facoltativo: naso chiuso, tosse di notte…"></div>'+
      '<div class="field"><label for="h-note">Note</label><input id="h-note" maxlength="300" placeholder="Facoltative"></div>'+hButtons("Salva")+
      '<p class="small-note">Resta «in corso» finché non tocchi «Guarito».</p>';
  }else if(hForm==="febbre"){
    if(open.length && !open.some(e=>e.id===hEp)) hEp = open[0].id;
    h += '<h3>Febbre</h3><div class="grid3"><div class="field"><label for="h-temp">Temperatura</label><div class="unit"><input id="h-temp" inputmode="decimal" placeholder="38,2"><b>°C</b></div></div>'+
      '<div class="field"><label for="h-data">Giorno e ora</label><input id="h-data" type="datetime-local" value="'+adesso+'" max="'+adesso+'"></div></div>'+
      hEpPick(open,false)+
      '<div class="field"><label for="h-note">Note</label><input id="h-note" maxlength="300" placeholder="Facoltative"></div>'+hButtons("Salva")+
      (open.length?'':'<p class="small-note">Non c’è una malattia in corso: la febbre apre un episodio nuovo, che chiuderai con «Guarito».</p>');
  }else if(hForm==="farmaco"){
    h += '<h3>Farmaco</h3><div class="field"><label for="h-cosa">Quale</label><input id="h-cosa" maxlength="60" list="h-farm" placeholder="Per esempio: paracetamolo"><datalist id="h-farm">'+FARM_SUGG.map(f=>'<option value="'+esc(f)+'">').join("")+'</datalist></div>'+
      '<div class="grid3"><div class="field"><label for="h-det">Dose data</label><input id="h-det" maxlength="120" placeholder="Per esempio: 5 ml"></div>'+
      '<div class="field"><label for="h-data">Giorno e ora</label><input id="h-data" type="datetime-local" value="'+adesso+'" max="'+adesso+'"></div></div>'+
      hEpPick(open,true)+
      '<div class="field"><label for="h-note">Note</label><input id="h-note" maxlength="300" placeholder="Facoltative: per quanti giorni, chi l’ha prescritto…"></div>'+hButtons("Salva")+
      '<p class="small-note">Qui si segna che cosa è stato dato; per le dosi vale l’indicazione del pediatra.</p>';
  }else if(hForm==="visita"){
    h += '<h3>Visita fatta</h3><div class="seg" role="group" aria-label="Tipo di visita">'+VIS.map(m=>'<button data-hcosa="'+esc(m)+'" aria-pressed="'+(hCosa===m)+'">'+esc(m)+'</button>').join("")+'</div>'+
      (hCosa==="Altro"?'<div class="field"><label for="h-cosa">Che visita</label><input id="h-cosa" maxlength="60"></div>':'')+
      '<div class="field"><label for="h-data">Giorno e ora</label><input id="h-data" type="datetime-local" value="'+adesso+'" max="'+adesso+'"></div>'+
      '<div class="field"><label for="h-det">Che cosa ha detto il medico</label><textarea id="h-det" maxlength="300" placeholder="Facoltativo"></textarea></div>'+
      hEpPick(open,true)+
      '<div class="field"><label for="h-note">Note</label><input id="h-note" maxlength="300" placeholder="Facoltative"></div>'+hButtons("Salva")+
      '<p class="small-note">Le visite da fare si aggiungono in Oggi, «Prossimi appuntamenti».</p>';
  }else if(hForm==="valtro"){
    h += '<h3>Altro vaccino</h3><div class="field"><label for="h-cosa">Quale</label><input id="h-cosa" maxlength="60" list="h-vsug" placeholder="Per esempio: antinfluenzale"><datalist id="h-vsug">'+VACC_SUGG.map(f=>'<option value="'+esc(f)+'">').join("")+'</datalist></div>'+
      '<div class="grid3"><div class="field"><label for="h-det">Dose</label><input id="h-det" maxlength="40" placeholder="Facoltativa"></div>'+
      '<div class="field"><label for="h-data">Data</label><input id="h-data" type="date" value="'+oggi+'" max="'+oggi+'"></div></div>'+
      '<div class="field"><label for="h-note">Note</label><input id="h-note" maxlength="200" placeholder="Facoltative: lotto, ambulatorio…"></div>'+hButtons("Salva");
  }
  return h + '</div>';
}
function viewVaccForm(v){
  const oggi=dLocal(new Date(),false);
  return '<div class="hform" style="margin-top:10px">'+hErrHtml()+
    '<div class="field"><label for="h-data">Data dal libretto</label><input id="h-data" type="date" max="'+oggi+'"></div>'+
    '<button class="pdopt" id="h-nd" aria-pressed="false" style="border-top:0;padding-top:0"><span class="bx" aria-hidden="true"></span><span>Non ricordo la data<small>Si salva con l’età prevista ('+esc(v.eta)+') e la nota «data non nota».</small></span></button>'+
    '<div class="field"><label for="h-note">Note</label><input id="h-note" maxlength="200" placeholder="Facoltative: lotto, ambulatorio…"></div>'+hButtons("Segna fatto")+'</div>';
}
function vaccItem(v){
  const stTxt = v.st==="fatto" ? "fatto il "+shortDate(v.row._d)+(/data non nota/i.test(v.row.note||"")?" (data non nota)":"")
    : v.st==="dafare" ? (daysTo(v.due)>0 ? "dal "+shortDate(v.due)+" · "+traTxt(daysTo(v.due)) : "da fare, dal "+shortDate(v.due))
    : v.st==="contr" ? "da controllare sul libretto" : v.st==="opz" ? "solo se previsto" : (v.due ? "dal "+shortDate(v.due) : v.eta);
  let h = '<li class="vrow '+v.st+'"><div class="trow"><span class="tchk" aria-hidden="true" '+(v.st==="fatto"?'style="background:var(--acc);border-color:var(--acc)"':'')+'>'+(v.st==="fatto"?"✓":"")+'</span>'+
    '<div class="ttx"><b>'+esc(v.n)+'</b> – '+esc(v.d)+'<div class="tmeta">'+esc(v.eta)+' · '+esc(stTxt)+(v.row&&v.row.pending?' <span class="tag">in attesa</span>':'')+'</div>'+
    (v.info?'<div class="tmeta">'+esc(v.info)+'</div>':'')+
    (v.st!=="fatto" && hVk!==v.k ? '<button class="linkbtn" data-hvk="'+v.k+'" style="margin-top:4px">Segna fatto</button>' : '')+'</div></div>';
  if(hVk===v.k && hForm==="vaccino") h += viewVaccForm(v);
  return h + '</li>';
}
function viewSalute(){
  const c=S.child, b=birthOf(c), eps=episodi(c), open=eps.filter(e=>e.open), vl=vaccList(c);
  const all = allergOf(c);
  let h = '<h2>Allergie e note</h2><div class="panel">';
  if(hAllEdit){
    h += '<div class="field"><label for="h-all">Allergie, intolleranze, note da sapere sempre</label><textarea id="h-all" maxlength="300" placeholder="Per esempio: nessuna allergia nota">'+esc(all)+'</textarea></div>'+
      '<div class="arow"><button class="btn" id="h-allsave">Salva</button><button class="btn ghost" id="h-allcancel">Annulla</button></div>'+
      '<p class="small-note">Si vede sui due telefoni e nel foglio, scheda Bambini, colonna E.</p>';
  }else{
    h += (all ? '<div class="note-txt" style="margin-top:0">'+esc(all)+'</div>' : '<p class="lead">Nessuna allergia o nota segnata.</p>')+
      (S.qs.allerg[c]?'<p class="small-note"><span class="tag" style="margin-left:0">in attesa</span></p>':'')+
      '<p style="margin:12px 0 0"><button class="btn ghost small" id="h-alledit">'+(all?"Modifica":"Aggiungi")+'</button></p>';
  }
  h += '</div>';

  /* segna al volo */
  h += '<h2>Segna</h2><div class="panel">';
  if(hForm && hForm!=="vaccino" && hForm!=="guarito") h += viewHForm(c);
  else h += '<div class="hbtns">'+[["malattia","Malattia o raffreddore"],["febbre","Febbre"],["farmaco","Farmaco"],["visita","Visita fatta"]]
      .map(([k,l])=>'<button class="btn ghost" data-hform="'+k+'">'+l+'</button>').join("")+'</div>';
  h += '</div>';

  /* in corso */
  if(open.length){
    h += '<h2>In corso</h2>';
    open.forEach(e=>{
      h += '<div class="panel"><div class="svh"><h3 style="margin:0">'+esc(e.cosa||"Malattia")+'</h3><span class="svn">'+esc(plural(epGiorni(e),"giorno","giorni"))+'</span></div>'+
        '<div class="tmeta">dal '+esc(longDate(e._d))+(e.pending?' <span class="tag">in attesa</span>':'')+'</div>'+
        (e.det?'<div class="note-txt">'+esc(e.det)+'</div>':'')+
        (e.fmax!=null?'<p style="margin:8px 0 0">Febbre max <b>'+esc(tTxt(e.fmax))+'</b>'+(e.feb.length?' <span style="color:var(--muted)">· '+esc(plural(e.feb.length+(e.temp!=null?1:0),"misura","misure"))+'</span>':'')+'</p>':'')+
        (e.farm.length?'<p style="margin:6px 0 0">Farmaci: '+esc(e.farm.slice().reverse().map(f=>f.cosa+(f.det?" "+f.det:"")).join(", "))+'</p>':'')+
        (e.vis.length?'<p style="margin:6px 0 0">Visite: '+esc(e.vis.map(v=>v.cosa+" il "+shortDate(v._d)).join(", "))+'</p>':'')+
        (epGiorni(e)>21?'<p class="pwarn">In corso da più di 3 settimane: se è finito, tocca «Guarito».</p>':'');
      if(hForm==="guarito" && hEp===e.id){
        const oggi=dLocal(new Date(),false);
        h += '<div class="hform" style="margin-top:12px">'+hErrHtml()+'<div class="field"><label for="h-data">Guarito il</label><input id="h-data" type="date" value="'+oggi+'" max="'+oggi+'" min="'+dLocal(e._d,false)+'"></div>'+
          '<div class="field"><label for="h-note">Note</label><input id="h-note" maxlength="300" placeholder="Facoltative"></div>'+hButtons("Guarito")+'</div>';
      }else{
        h += '<div class="arow"><button class="btn ghost small" data-hform="febbre" data-hepto="'+esc(e.id)+'">+ Febbre</button><button class="btn ghost small" data-hform="farmaco" data-hepto="'+esc(e.id)+'">+ Farmaco</button><button class="btn small" data-hguar="'+esc(e.id)+'">Guarito</button></div>';
      }
      h += '</div>';
    });
  }

  /* vaccini */
  const fatti=vl.filter(v=>v.st==="fatto").length, dafare=vl.filter(v=>v.st==="dafare"), contr=vl.filter(v=>v.st==="contr").length, flu=fluInfo(c);
  h += '<h2>Vaccini</h2><div class="panel">';
  if(!b) h += '<p class="lead">Serve la data di nascita (scheda Bambini del foglio) per calcolare il calendario.</p>';
  else{
    h += '<p class="lead" style="color:var(--ink)"><b>'+fatti+'</b> fatti'+(dafare.length?' · <b>'+dafare.length+'</b> da fare':'')+(contr?' · <b>'+contr+'</b> da controllare sul libretto':'')+'</p>';
    if(dafare.length) h += '<div class="asub">Da fare adesso</div><ul class="tlist">'+dafare.map(vaccItem).join("")+'</ul>';
    if(flu) h += '<div class="asub">Antinfluenzale, stagione '+esc(flu.stag)+'</div><p style="margin:0">'+(flu.fatto?'Fatta il '+esc(shortDate(flu.fatto._d))+'.':'Consigliata ogni autunno dai 6 mesi ai 6 anni: chiedi al pediatra. Se la fa, segnala con «Altro vaccino».')+'</p>';
    if(!dafare.length && !flu){ const nx=vl.find(v=>v.st==="piu"); h += '<p style="margin:8px 0 0">'+(nx?'Prossimo: '+esc(nx.n)+' – '+esc(nx.d)+', dal '+esc(shortDate(nx.due))+'.':'Nessun vaccino in programma a breve.')+'</p>'; }
    h += '<p style="margin:14px 0 0;display:flex;gap:10px;flex-wrap:wrap"><button class="btn ghost small" id="h-cal">'+(hCal?"Chiudi il calendario":"Calendario completo"+(contr?" e libretto":""))+'</button><button class="btn ghost small" data-hform="valtro">Altro vaccino</button></p>';
    if(hForm==="valtro") h += viewHForm(c);
    if(hCal){
      h += '<ul class="tlist" style="margin-top:12px">'+vl.filter(v=>v.st!=="dafare").map(vaccItem).join("")+'</ul>';
      const altri=vaccAltri(c);
      if(altri.length) h += '<div class="asub">Altri vaccini</div><ul class="tlist">'+altri.map(r=>'<li><b>'+esc(r.cosa)+'</b>'+(r.det?' – '+esc(r.det):'')+'<div class="tmeta">'+esc(shortDate(r._d))+(r.pending?' <span class="tag">in attesa</span>':'')+'</div></li>').join("")+'</ul>';
      h += '<p class="small-note">Calendario della Regione Marche (piano vaccinale 2023–2025), età in mesi e anni compiuti. Per date e dosi fa fede il libretto: confrontalo con il pediatra o con il centro vaccinale.</p>';
    }
  }
  h += '</div>';

  /* visite in programma */
  const pv = appProssimi(c).filter(a=>["visita","bilancio","vaccino"].includes(String(a.tipo).toLowerCase())).slice(0,3);
  h += '<h2>Visite in programma</h2><div class="panel">';
  h += pv.length ? '<ul class="dlist">'+pv.map(a=>'<li><div class="when"><span class="ctag">'+esc(tipoLabel(a.tipo))+'</span>'+esc(longDate(a._d))+' · '+esc(traTxt(daysTo(a._d)))+'</div><div class="note-txt">'+esc(a.titolo||tipoLabel(a.tipo))+'</div></li>').join("")+'</ul>'
    : '<p class="lead">Nessuna visita in programma.</p>';
  h += '<p style="margin:12px 0 0"><button class="btn ghost small" id="h-app">Aggiungi appuntamento</button></p></div>';

  /* ultimo anno */
  const an = epAnno(c);
  h += '<h2>Ultimo anno</h2><div class="panel"><div class="stats">'+
    '<div><div class="big">'+an.n+'</div><div class="lead">'+(an.n===1?"volta":"volte")+(sexOf(c)==="F"?" malata":" malato")+'</div></div>'+
    '<div><div class="big">'+an.gg+'</div><div class="lead">giorni di malattia</div></div>'+
    '<div><div class="big">'+an.feb+'</div><div class="lead">con febbre da 38 °C</div></div></div></div>';

  /* storico */
  const items = [];
  eps.forEach(e=>items.push({_d:e._d, k:"ep", e}));
  saluteFor(c).filter(r=>r.tipo!=="malattia" && r.tipo!=="guarito" && !(r.ep && (r.tipo==="febbre"||r.tipo==="farmaco"||r.tipo==="visita") && eps.some(e=>e.id===r.ep))).forEach(r=>items.push({_d:r._d, k:"r", r}));
  diarioFor(c).filter(n=>String(n.cat).toLowerCase()==="salute").forEach(n=>items.push({_d:n._d, k:"d", n}));
  items.sort((a,b)=>b._d-a._d);
  const lim = dayStart(365), shown = hAll ? items : items.filter(x=>x._d>=lim);
  h += '<h2>Storico</h2><div class="panel">';
  if(!items.length) h += '<p class="lead">Ancora niente. Quando segni una malattia, un farmaco, una visita o un vaccino, lo trovi qui.</p>';
  else{
    let lastM="", html="";
    shown.forEach(x=>{
      const m = MESI[x._d.getMonth()]+" "+x._d.getFullYear();
      if(m!==lastM){ if(lastM) html+='</ul>'; html += '<div class="month">'+esc(m.charAt(0).toUpperCase()+m.slice(1))+'</div><ul class="dlist">'; lastM=m; }
      if(x.k==="ep"){ const e=x.e;
        html += '<li><div class="when"><span class="ctag">Malattia</span>'+esc(shortDate(e._d))+(e.fine?' – '+esc(shortDate(e.fine._d))+' · '+esc(plural(epGiorni(e),"giorno","giorni")):' · in corso')+(e.pending?'<span class="tag">in attesa</span>':'')+'</div>'+
          '<div class="note-txt">'+esc(e.cosa||"Malattia")+(e.fmax!=null?' · febbre max '+esc(tTxt(e.fmax)):'')+(e.farm.length?' · '+esc(e.farm.map(f=>f.cosa).filter((v,i,a)=>a.indexOf(v)===i).join(", ")):'')+'</div>'+
          (e.det?'<div class="tmeta">'+esc(e.det)+'</div>':'')+(e.pending?'<button class="btn ghost small" style="margin-top:6px" data-delh="'+esc(e.id)+'">Elimina</button>':'')+'</li>';
      }else if(x.k==="r"){ const r=x.r, lab={vaccino:"Vaccino",febbre:"Febbre",farmaco:"Farmaco",visita:"Visita",nota:"Nota"}[r.tipo]||"Salute";
        const testo = r.tipo==="febbre" ? tTxt(r.temp) : (r.cosa||"")+(r.det?" – "+r.det:"");
        html += '<li><div class="when"><span class="ctag">'+lab+'</span>'+esc(r.tipo==="vaccino"?shortDate(r._d):shortDate(r._d)+", "+pad(r._d.getHours())+":"+pad(r._d.getMinutes()))+(r.pending?'<span class="tag">in attesa</span>':'')+'</div>'+
          '<div class="note-txt">'+esc(testo||r.note||lab)+'</div>'+(r.note&&testo?'<div class="tmeta">'+esc(r.note)+'</div>':'')+
          (r.pending?'<button class="btn ghost small" style="margin-top:6px" data-delh="'+esc(r.id)+'">Elimina</button>':'')+'</li>';
      }else{ const n=x.n;
        html += '<li><div class="when"><span class="ctag">Diario</span>'+esc(shortDate(n._d))+'</div><div class="note-txt">'+esc(n.testo)+'</div></li>';
      }
    });
    if(shown.length) h += html + '</ul>'; else h += '<p class="lead">Niente negli ultimi 12 mesi.</p>';
    if(items.length > shown.length || hAll) h += '<p style="margin:12px 0 0"><button class="btn ghost small" id="h-allhist">'+(hAll?"Solo ultimi 12 mesi":"Mostra tutto ("+items.length+")")+'</button></p>';
    h += '<p class="small-note">Per correggere una riga già inviata se ne aggiunge una nuova, oppure si modifica il foglio, scheda Salute. Le note di diario «Salute» compaiono qui in sola lettura.</p>';
  }
  h += '</div>';
  return h;
}

/* ---------- "+ Aggiungi" e revisione della settimana (blocco 5e) ----------
   Scheda Settimane del foglio: ID | Settimana (lunedì) | Bambino | Ore medie nanna | Come (calcolata/stima/orari) | Orari (a letto–sveglia) |
   Rispetto alle settimane prima | Rispetto al consigliato | Ammalato (sì/no) | Com'è andata (1-3) | Da notare | Origine.
   Una riga per bambino e settimana; per correggere se ne aggiunge una nuova: vale l'ultima (ID con timestamp, poi ordine delle righe).
   Ore di sonno consigliate nelle 24 ore, pisolini compresi: consenso AASM 2016 (Paruthi et al., J Clin Sleep Med 2016;12(6):785),
   sottoscritto dall'AAP; sotto i 5 anni coincide con le linee guida OMS 2019 (0–3 mesi: 14–17 h, solo OMS). Controllate il 25/10/2026.
   Revisione: la card compare in Oggi da sabato a martedì; sabato e domenica riguarda la settimana in corso, lunedì e martedì quella appena finita. */
let shOpen = false, shMode = "", pzDay = "oggi", pzVal = 1;   /* pannello "+ Aggiungi" */
let rv = null;                                                /* revisione in corso */
const ADD = [
  ["Nanna",[["nanna","Nanna di un giorno"],["pisolino","Pisolino"],["settimana","Nanna della settimana"]]],
  ["Salute",[["malattia","Malattia o raffreddore"],["febbre","Febbre"],["farmaco","Farmaco"],["vaccino","Vaccino"],["visita","Visita fatta"]]],
  ["Crescita e diario",[["misura","Misura"],["nota","Nota nel diario"],["tappa","Tappa di sviluppo"],["attivita","Attività fatta"]]],
  ["Asilo",[["asilo","Giornata all’asilo"]]],
  ["Agenda",[["appuntamento","Appuntamento"]]]
];
function settToSheet(o){ return [o.id, daySerial(o.mon), o.bambino, o.ore==null?"":o.ore, o.come||"", o.orari||"", o.prima||"", o.cons||"", o.amm||"", o.voto||"", o.nota||"", "app-genitori"]; }
function addDays(d,n){ return new Date(d.getFullYear(), d.getMonth(), d.getDate()+n); }
function revMon(){ const t=dayStart(0), dw=(t.getDay()+6)%7; return dw>=5 ? addDays(t,-dw) : addDays(t,-dw-7); }
function revWindow(){ const dw=(dayStart(0).getDay()+6)%7; return dw>=5 || dw<=1; }
function weekLabel(mon){ const sun=addDays(mon,6); return "da lunedì "+mon.getDate()+(mon.getMonth()!==sun.getMonth()?" "+MESI[mon.getMonth()]:"")+" a domenica "+sun.getDate()+" "+MESI[sun.getMonth()]; }
function settMap(c){
  const ids = new Set(S.sett.map(r=>r.id));
  const all = S.sett.filter(r=>r.bambino===c && r.mon && r.origine!=="test" && r.origine!=="prova")
      .map(r=>Object.assign({}, r, {pending:false, ord:ordOf(r.id), idx:r.i||0}))
    .concat(S.qs.sett.filter(q=>q.bambino===c && !ids.has(q.id))
      .map(q=>Object.assign({}, q, {pending:true, ord:ordOf(q.id), idx:1e12+ordOf(q.id)})));
  const map = {};
  all.forEach(r=>{ if(!map[r.mon] || newer(r, map[r.mon])) map[r.mon]=r; });
  return map;
}
/* [min, max, fonte] ore nelle 24 ore per l'età di oggi */
function sonnoRange(c){
  const b=birthOf(c), m = b ? ageParts(b,new Date()).months : (c==="Sibilla" ? 12 : 72);
  if(m<4) return [14,17,"OMS 2019"]; if(m<12) return [12,16,"AASM 2016 e OMS 2019"]; if(m<36) return [11,14,"AASM 2016 e OMS 2019"];
  if(m<60) return [10,13,"AASM 2016 e OMS 2019"]; if(m<72) return [10,13,"AASM 2016"]; if(m<156) return [9,12,"AASM 2016"]; return [8,10,"AASM 2016"];
}
/* nelle medie non contano il giorno in corso né i giorni con il solo pisolino (notte non ancora segnata) */
function soloPz(r){ return /solo pisolino/i.test(String(r && r.note || "")); }
function weekDays(c, mon){
  const map=sonnoDays(c), l=[], oggi=dayStart(0);
  for(let i=0;i<7;i++){ const d=addDays(mon,i); if(d>=oggi) break; const r=map[dayKey(d)]; if(r && !soloPz(r)) l.push(r.ore); }
  return l.length ? {avg:l.reduce((a,b)=>a+b,0)/l.length, n:l.length} : null;
}
/* media delle 4 settimane prima (dalla scheda Settimane), altrimenti dei giorni segnati nei 28 giorni prima */
function prevAvg(c, mon){
  const sm=settMap(c), l=[];
  for(let w=1;w<=4;w++){ const r=sm[dayKey(addDays(mon,-7*w))]; if(r && r.ore!=null) l.push(r.ore); }
  if(l.length) return {avg:l.reduce((a,b)=>a+b,0)/l.length, n:l.length, da:"settimane"};
  const map=sonnoDays(c); let s=0, n=0;
  for(let i=1;i<=28;i++){ const r=map[dayKey(addDays(mon,-i))]; if(r && !soloPz(r)){ s+=r.ore; n++; } }
  return n>=3 ? {avg:s/n, n, da:"giorni"} : null;
}
function cmpPrima(ore, p){ if(ore==null || !p) return ""; const d=ore-p.avg; return Math.abs(d)<0.5 ? "in linea" : d<0 ? "meno" : "più"; }
function cmpCons(ore, rg){ if(ore==null) return ""; return ore<rg[0] ? "meno" : ore>rg[1] ? "più" : "in linea"; }
function consTxt(v){ return v==="in linea" ? "in linea con le ore consigliate" : v==="meno" ? "sotto le ore consigliate" : v==="più" ? "sopra le ore consigliate" : ""; }
function orariOre(a,b){
  const m=s=>{ const x=String(s||"").match(/^(\d{1,2}):(\d{2})/); return x ? (+x[1])*60+(+x[2]) : null; };
  const A=m(a), B=m(b); if(A==null || B==null) return null;
  const d=((B-A)+1440)%1440; return d>=120 ? Math.round(d/6)/10 : null;
}
function epWeek(c, mon){ const end=addDays(mon,7); return episodi(c).filter(e=>e._d && e._d<end && (e.open || !e.fine || e.fine._d>=mon)); }
function ammWord(c){ return sexOf(c)==="F" ? "ammalata" : "ammalato"; }
function guarWord(c){ return sexOf(c)==="F" ? "Guarita" : "Guarito"; }

function rvInit(c){
  const mon=revMon(), k=dayKey(mon), prev=settMap(c)[k], wd=weekDays(c,mon), ew=epWeek(c,mon), p=prevAvg(c,mon);
  const last = Object.values(settMap(c)).filter(r=>r.orari).sort((a,b)=>a.mon<b.mon?1:-1)[0];
  const orari = String((prev && prev.orari) || (last && last.orari) || "").split(/[–-]/);
  const mode = prev ? (prev.ore==null ? "salta" : prev.come==="orari" ? "orari" : (prev.come==="calcolata" && wd) ? "calc" : "stima")
                    : c==="Edoardo" ? "orari" : (wd && wd.n>=3 ? "calc" : "stima");
  rv = {c, mon:k, step:1, mode,
    ore: prev && prev.ore!=null ? Math.round(prev.ore*2)/2 : wd ? Math.round(wd.avg*2)/2 : p ? Math.round(p.avg*2)/2 : defaultOre(c),
    letto: /^\d{1,2}:\d{2}$/.test(orari[0]||"") ? orari[0] : "21:30", sveglia: /^\d{1,2}:\d{2}$/.test(orari[1]||"") ? orari[1] : "07:00",
    amm: prev ? (prev.amm||"") : (ew.length ? "sì" : ""), tappe:[], voto: prev && prev.voto ? Number(prev.voto) : 0,
    nota: prev ? String(prev.nota||"") : "", err:"", rev:!!prev};
}
function rvOre(c, mon){
  if(rv.mode==="calc"){ const wd=weekDays(c,mon); return wd ? Math.round(wd.avg*10)/10 : null; }
  if(rv.mode==="stima") return rv.ore;
  if(rv.mode==="orari") return orariOre(rv.letto, rv.sveglia);
  return null;
}
function rvCome(){ return {calc:"calcolata", stima:"stima", orari:"orari"}[rv.mode] || ""; }

function weekLine(r){
  const p=[];
  if(r.ore!=null) p.push("nanna "+fmt(r.ore,1)+" h"+(r.cons ? ", "+consTxt(r.cons) : ""));
  if(r.amm) p.push(r.amm==="sì" ? "si è "+ammWord(r.bambino) : "niente malattie");
  let h='<div class="note-txt" style="margin-top:2px">'+(r.voto ? '<span aria-hidden="true">'+faceOf(r.voto)+'</span> ' : '')+esc(p.join(" · ") || "Revisione senza risposte")+'</div>';
  if(r.nota) h += '<div class="tmeta">'+esc(r.nota)+'</div>';
  return h;
}
/* card in Oggi, da sabato a martedì */
function weekCard(c){
  if(!revWindow()) return "";
  const mon=revMon(), r=settMap(c)[dayKey(mon)];
  let h = '<h2>La settimana</h2><div class="panel">';
  if(r){
    h += '<div class="when" style="font-size:14px;color:var(--muted)"><span class="ctag">Fatta</span>'+esc(weekLabel(mon))+(r.pending?'<span class="tag">in attesa</span>':'')+'</div>'+weekLine(r)+
      '<p style="margin:12px 0 0"><button class="btn ghost small" data-go="settimana">Rivedi</button></p>';
  }else{
    const wd=weekDays(c,mon);
    h += '<p style="margin:0">Com’è andata la settimana '+esc(weekLabel(mon))+'?</p>'+
      '<p class="lead" style="font-size:15px;margin:4px 0 0">Nanna, salute, novità e una faccina: quattro passi, un paio di minuti'+(wd?'. La nanna è già calcolata da '+plural(wd.n,"giorno segnato","giorni segnati"):'')+'.</p>'+
      '<p style="margin:14px 0 0"><button class="btn" data-go="settimana">Inizia la revisione</button></p>';
  }
  return h + '</div>';
}

function rvCmpHtml(ore, rg, p){
  const cp=cmpPrima(ore,p), cc=cmpCons(ore,rg);
  let h = '<ul class="rvcmp">'+
    '<li><span>Ore consigliate per l’età</span><b>'+rg[0]+'–'+rg[1]+' h</b><em class="'+(cc==="in linea"?"ok":"lo")+'">'+esc(cc)+'</em></li>'+
    '<li><span>Settimane prima'+(p?'<small>'+(p.da==="settimane"?'media di '+plural(p.n,"settimana","settimane"):'dai giorni segnati')+'</small>':'')+'</span><b>'+(p?fmt(p.avg,1)+' h':'–')+'</b>'+
      (cp?'<em class="'+(cp==="in linea"?"ok":"lo")+'">'+esc(cp)+'</em>':'<em>prima volta</em>')+'</li></ul>';
  if(cc!=="in linea") h += '<p class="small-note">Un po’ '+(cc==="meno"?"sotto":"sopra")+' la fascia consigliata. Una settimana diversa capita (malattie, dentini, viaggi); se succede spesso, parlatene con il pediatra.</p>';
  return h + '<p class="small-note">Fascia per l’età: '+esc(rg[2])+', ore nelle 24 ore con i pisolini.</p>';
}
function rvNanna(c, mon){
  const wd=weekDays(c,mon); if(rv.mode==="calc" && !wd) rv.mode="stima";
  const rg=sonnoRange(c), p=prevAvg(c,mon), ore=rvOre(c,mon);
  const modes=[["calc","Dai giorni segnati"],["stima","Ore al giorno"],["orari","A letto e sveglia"],["salta","Non la segno"]].filter(m=>m[0]!=="calc" || wd);
  let h = '<h3>Nanna</h3><p class="lead" style="font-size:15px;margin:0 0 10px">Quanto ha dormito in media al giorno'+(c==="Sibilla"?', notte e pisolini?':'?')+'</p>'+
    '<div class="seg" role="group" aria-label="Come segnarla">'+modes.map(([k,l])=>'<button data-rvmode="'+k+'" aria-pressed="'+(rv.mode===k)+'">'+l+'</button>').join("")+'</div>';
  if(rv.mode==="calc") h += '<div class="rvbig">'+fmt(ore,1)+' <small>ore</small></div><p class="small-note" style="text-align:center;margin:0">media di '+plural(wd.n,"giorno segnato","giorni segnati")+' nella Nanna</p>';
  else if(rv.mode==="stima") h += '<div class="stepper"><button data-rvstep="-1" aria-label="Mezz’ora in meno"'+(rv.ore<=0?' disabled':'')+'>−</button><output aria-live="polite">'+fmt(rv.ore,1)+' <small>ore</small></output><button data-rvstep="1" aria-label="Mezz’ora in più"'+(rv.ore>=24?' disabled':'')+'>+</button></div>';
  else if(rv.mode==="orari") h += '<div class="grid3"><div class="field"><label for="r-letto">Di solito a letto alle</label><input id="r-letto" type="time" value="'+esc(rv.letto)+'"></div>'+
      '<div class="field"><label for="r-sveglia">Si sveglia alle</label><input id="r-sveglia" type="time" value="'+esc(rv.sveglia)+'"></div></div>'+
      '<div class="rvbig">'+(ore!=null?fmt(ore,1):'–')+' <small>ore di notte</small></div>'+(c==="Sibilla"?'<p class="small-note" style="text-align:center;margin:0">Gli orari contano solo la notte, senza i pisolini.</p>':'');
  else h += '<p class="lead">Va bene anche così: la settimana si salva senza la nanna.</p>';
  if(ore!=null) h += rvCmpHtml(ore, rg, p);
  return h;
}
function rvSalute(c, mon){
  const ew=epWeek(c,mon);
  let h = '<h3>Salute</h3>';
  if(hForm==="guarito"){
    const e=episodi(c).find(x=>x.id===hEp), oggi=dLocal(new Date(),false);
    return h+'<div class="hform">'+hErrHtml()+'<h3>'+esc((e&&e.cosa)||"Malattia")+'</h3><div class="field"><label for="h-data">'+guarWord(c)+' il</label><input id="h-data" type="date" value="'+oggi+'" max="'+oggi+'"'+(e?' min="'+dLocal(e._d,false)+'"':'')+'></div>'+
      '<div class="field"><label for="h-note">Note</label><input id="h-note" maxlength="300" placeholder="Facoltative"></div>'+hButtons(guarWord(c))+'</div>';
  }
  if(hForm && hForm!=="vaccino") return h + viewHForm(c);
  h += '<p class="lead" style="font-size:15px;margin:0 0 10px">Si è '+ammWord(c)+' questa settimana?</p>'+
    '<div class="seg" role="group" aria-label="Si è '+ammWord(c)+'"><button data-rvamm="no" aria-pressed="'+(rv.amm==="no")+'">No</button><button data-rvamm="sì" aria-pressed="'+(rv.amm==="sì")+'">Sì</button></div>';
  if(ew.length){
    h += '<ul class="dlist">'+ew.map(e=>'<li><div class="when"><span class="ctag">'+(e.open?'In corso':guarWord(c))+'</span>dal '+esc(shortDate(e._d))+(e.fine?' al '+esc(shortDate(e.fine._d)):'')+(e.pending?'<span class="tag">in attesa</span>':'')+'</div>'+
      '<div class="note-txt">'+esc(e.cosa||"Malattia")+(e.fmax!=null?'<span style="color:var(--muted)"> · febbre max '+esc(tTxt(e.fmax))+'</span>':'')+(e.farm.length?'<span style="color:var(--muted)"> · '+esc(plural(e.farm.length,"farmaco","farmaci"))+'</span>':'')+'</div>'+
      (e.open?'<div class="arow" style="margin-top:8px"><button class="btn ghost small" data-hform="febbre" data-hepto="'+esc(e.id)+'">+ Febbre</button><button class="btn ghost small" data-hform="farmaco" data-hepto="'+esc(e.id)+'">+ Farmaco</button><button class="btn small" data-hguar="'+esc(e.id)+'">'+guarWord(c)+'</button></div>':'')+'</li>').join("")+'</ul>';
    if(rv.amm==="no") h += '<p class="small-note">Qui sopra c’è una malattia che tocca questa settimana: se è così, rispondi «Sì».</p>';
  }
  if(rv.amm==="sì") h += '<p style="margin:12px 0 0"><button class="btn ghost small" data-hform="malattia">'+(ew.length?'Segna un’altra malattia':'Segna la malattia')+'</button></p>';
  return h;
}
function rvNovita(c, mon){
  const end=addDays(mon,7);
  if(c==="Sibilla"){
    const map=svilMap(c), age=tappeAge(c), list=TAPPE.filter(t=>t.m===age && !map[t.t]);
    const nuove=Object.values(map).filter(r=>{ const d=dayFromKey(r.day); return d && d>=mon && d<end; });
    const fatte=attFatte(c).filter(r=>r._d>=mon && r._d<end);
    let h = '<h3>Novità</h3><p class="lead" style="font-size:15px;margin:0 0 6px">Ha fatto qualcosa di nuovo? Tocca le tappe dei '+age+' mesi che avete visto.</p>';
    if(nuove.length) h += '<p class="already">Già segnate questa settimana: '+esc(nuove.map(r=>r.tappa).join("; "))+'</p>';
    h += list.length ? '<ul class="tlist">'+list.map(t=>{ const on=rv.tappe.includes(t.id);
        return '<li><div class="trow"><button class="tchk rvtap" data-rvtap="'+t.id+'" aria-pressed="'+on+'" aria-label="'+esc(t.t)+'">'+(on?'✓':'')+'</button><div class="ttx">'+esc(t.t)+'<div class="tmeta">'+esc(areaSv(t.ar))+'</div></div></div></li>'; }).join("")+'</ul>'
      : '<p class="lead">Le tappe dei '+age+' mesi sono già tutte segnate.</p>';
    h += '<div class="asub">Attività fatte questa settimana</div><p style="margin:0">'+(fatte.length ? esc(fatte.map(r=>r.titolo+" "+faceOf(r.voto)).join(", ")) : 'Nessuna segnata. Se ne avete fatte, aggiungile dopo con «+ Aggiungi».')+'</p>';
    return h;
  }
  const E=edoData();
  let h = '<h3>La settimana nell’app di Edo</h3>';
  if(!E) return h + '<p class="lead">I dati dell’app di Edo non sono ancora stati letti dal foglio.</p>';
  const inW=x=>x._d>=mon && x._d<end, ms=E.mis.filter(inW), gs=E.gio.filter(inW), es=E.err.filter(inW), s=sumGT(ms);
  if(!ms.length && !gs.length) return h + '<p class="lead">Questa settimana Edo non ha usato l’app, oppure il tablet non ha ancora inviato i dati.</p>';
  const perDay={}; gs.forEach(x=>{ const k=dayKey(x._d); perDay[k]=(perDay[k]||0)+x.min; });
  const giorni=new Set(ms.map(m=>dayKey(m._d)).concat(gs.map(x=>dayKey(x._d)))).size, over=Object.values(perDay).filter(v=>v>LIMITE_GIOCO).length, minT=gs.reduce((a,x)=>a+x.min,0);
  h += '<div class="kpi"><div><div class="big">'+ms.length+'</div><div class="lead">'+(ms.length===1?'missione':'missioni')+(ms.length?', '+pctTxt(s.g,s.t)+' giuste':'')+'</div></div>'+
    '<div><div class="big">'+Math.round(minT)+' <small>min</small></div><div class="lead">di gioco in '+plural(giorni,"giorno","giorni")+(over?', '+over+' oltre le 2 ore':'')+'</div></div></div>';
  const byA={}; es.forEach(e=>{ byA[e.ab]=(byA[e.ab]||0)+1; });
  const top=Object.entries(byA).sort((a,b)=>b[1]-a[1]).slice(0,2);
  if(top.length) h += '<p style="margin:12px 0 0">Da allenare: '+esc(top.map(([a,n])=>a+" ("+plural(n,"errore","errori")+")").join(", "))+'.</p>';
  return h + '<p class="small-note">Il dettaglio è nella dashboard di Edo, in Oggi.</p>';
}
function rvChiusura(c, mon){
  const end=addDays(mon,7);
  let h = c==="Sibilla" ? '<h3>All’asilo</h3>'+asiloBox(c,mon,true)+(asiloWeek(c,mon).n?'<p style="margin:12px 0 18px"><button class="btn ghost small" data-asnota="1">Aggiungi alle cose da notare</button></p>':'<div style="height:14px"></div>') : '';
  h += '<h3>Com’è andata la settimana?</h3><div class="faces" role="group" aria-label="Com’è andata la settimana">'+
    FACCE.map(f=>'<button data-rvvoto="'+f[0]+'" aria-pressed="'+(rv.voto===f[0])+'"><span aria-hidden="true">'+f[1]+'</span>'+f[2]+'</button>').join("")+'</div>'+
    '<div class="field"><label for="r-nota">Cose da notare <span class="hint">(facoltative)</span></label><textarea id="r-nota" maxlength="500" placeholder="'+(c==="Sibilla"?'Umore, pappa, parole nuove, dentini…':'Umore, scuola, ginnastica, amici…')+'">'+esc(rv.nota)+'</textarea></div>';
  const d27=[0,1].map(i=>new Date(mon.getFullYear(), mon.getMonth()+i, 27)).find(d=>d>=mon && d<end);
  if(d27 && (c==="Sibilla" || [1,4,7,10].includes(d27.getMonth()))){
    const m=measuresFor(c).filter(x=>x._d>=mon && x._d<end).pop();
    h += '<div class="asub">Misura del 27</div><p style="margin:0">'+(m ? 'Fatta il '+esc(shortDate(m._d))+(m.peso!=null?': '+fmt(m.peso,2)+' kg':'')+(m.altezza!=null?(m.peso!=null?', ':': ')+fmt(m.altezza,1)+' cm':'')+'.'
      : d27>dayStart(0) ? esc(longDate(d27).replace(/^./,x=>x.toUpperCase()))+' c’è la misura di peso e altezza.' : 'Il 27 c’era la misura di peso e altezza: non è ancora segnata.')+'</p>'+
      (m?'':'<p style="margin:8px 0 0"><button class="btn ghost small" data-add="misura">Inserisci la misura</button></p>');
  }
  return h;
}
function rvRiepilogo(c, mon){
  const ore=rvOre(c,mon), rg=sonnoRange(c), p=prevAvg(c,mon);
  const come = {calc:"dai giorni segnati", stima:"stima", orari:"a letto alle "+rv.letto+", sveglia alle "+rv.sveglia}[rv.mode];
  const f = FACCE.find(x=>x[0]===rv.voto);
  const rows = [
    ["Nanna", ore!=null ? fmt(ore,1)+" ore al giorno ("+come+")" : "non segnata"],
    ore!=null ? ["Rispetto al consigliato", consTxt(cmpCons(ore,rg))+" ("+rg[0]+"–"+rg[1]+" h)"] : null,
    ore!=null && p ? ["Rispetto alle settimane prima", cmpPrima(ore,p)+" (media "+fmt(p.avg,1)+" h)"] : null,
    ["Si è "+ammWord(c), rv.amm || "non risposto"],
    c==="Sibilla" ? ["Tappe nuove", rv.tappe.length ? TAPPE.filter(t=>rv.tappe.includes(t.id)).map(t=>t.t).join("; ") : "nessuna"] : null,
    ["Com’è andata", f ? f[1]+" "+f[2] : "non risposto"],
    ["Da notare", rv.nota.trim() || "niente"]
  ].filter(Boolean);
  return '<h3>Riepilogo</h3><dl class="kv rvkv">'+rows.map(r=>'<dt>'+esc(r[0])+'</dt><dd>'+esc(r[1])+'</dd>').join("")+'</dl>'+
    '<p class="small-note">Va nel foglio, scheda Settimane'+(rv.tappe.length?'; le tappe anche nella scheda Sviluppo':'')+'.</p>';
}
function rvStorico(c){
  const list=Object.values(settMap(c)).sort((a,b)=>a.mon<b.mon?1:-1).slice(0,8);
  if(!list.length) return "";
  return '<h2>Settimane passate</h2><div class="panel"><ul class="dlist">'+list.map(r=>{ const d=dayFromKey(r.mon);
      return '<li><div class="when">Settimana dal '+esc(d?shortDate(d):r.mon)+(r.pending?'<span class="tag">in attesa</span>':'')+'</div>'+weekLine(r)+
        (r.pending?'<button class="btn ghost small" style="margin-top:6px" data-delw="'+esc(r.id)+'">Elimina</button>':'')+'</li>'; }).join("")+'</ul>'+
    '<p class="small-note">La settimana da rivedere si corregge rifacendo la revisione: vale l’ultima salvata. Le altre si correggono nel foglio, scheda Settimane.</p></div>';
}
function viewSettimana(){
  const c=S.child, mon=revMon(), k=dayKey(mon);
  if(!rv || rv.c!==c || rv.mon!==k) rvInit(c);
  const st=rv.step, N=4;
  let h = '<p style="margin:20px 0 0"><button class="btn ghost small" data-go="oggi">Torna a Oggi</button></p>'+
    '<h2>La settimana di '+esc(c)+'</h2><p class="lead" style="margin:-6px 0 12px">'+esc(weekLabel(mon).replace(/^./,x=>x.toUpperCase()))+'.'+(rv.rev?' Già fatta: se salvi di nuovo, vale questa.':'')+'</p>'+
    '<div class="panel">';
  if(st<=N) h += '<div class="rvsteps" aria-hidden="true">'+[1,2,3,4].map(i=>'<span class="'+(i<st?"done":i===st?"cur":"")+'"></span>').join("")+'</div><div class="rvn">Passo '+st+' di '+N+'</div>';
  if(rv.err) h += '<p class="formerr" id="rv-err" role="alert">'+esc(rv.err)+'</p>';
  h += st===1 ? rvNanna(c,mon) : st===2 ? rvSalute(c,mon) : st===3 ? rvNovita(c,mon) : st===4 ? rvChiusura(c,mon) : rvRiepilogo(c,mon);
  if(!(st===2 && hForm))
    h += '<div class="arow">'+(st>1?'<button class="btn ghost" id="rv-back">Indietro</button>':'')+
      (st<=N ? '<button class="btn" id="rv-next">'+(st===N?'Vedi il riepilogo':'Avanti')+'</button>' : '<button class="btn" id="rv-save">Salva la settimana</button>')+'</div>';
  return h + '</div>' + rvStorico(c);
}
function rvNext(){
  const c=rv.c, mon=dayFromKey(rv.mon); rv.err="";
  if(rv.step===1 && rv.mode==="orari" && rvOre(c,mon)==null) rv.err="Controlla gli orari: a letto e sveglia devono essere diversi di almeno 2 ore.";
  if(rv.step===2 && !rv.amm) rv.err="Rispondi «Sì» o «No».";
  if(!rv.err) rv.step++;
  render(); rvTop();
}
function rvTop(){ const el = $("rv-err") || document.querySelector("main h2"); if(el) el.scrollIntoView({block:"start"}); }
function rvSave(){
  const c=rv.c, mon=dayFromKey(rv.mon), ore=rvOre(c,mon), rg=sonnoRange(c), p=prevAvg(c,mon), t=Date.now();
  S.qs.sett.push({id:"genitori-settimana-"+t, mon:rv.mon, bambino:c, ore: ore==null ? null : Math.round(ore*10)/10, come:rvCome(),
    orari: rv.mode==="orari" ? rv.letto+"–"+rv.sveglia : "", prima:cmpPrima(ore,p), cons:cmpCons(ore,rg), amm:rv.amm, voto:rv.voto||"", nota:rv.nota.trim().slice(0,500)});
  const sun=addDays(mon,6), day=dayKey(sun<dayStart(0) ? sun : dayStart(0));
  rv.tappe.forEach((id,i)=>{ const tp=TAPPE.find(x=>x.id===id); if(tp) S.qs.sviluppo.push({id:"genitori-sviluppo-"+(t+1+i), day, bambino:c, area:tp.ar, tappa:tp.t, note:"dalla revisione della settimana"}); });
  rv=null; save(); toast("Settimana salvata"); go("oggi"); sync(false);
}

/* pannello "+ Aggiungi": ogni voce apre il modulo che c'è già */
function openSheet(){ shOpen=true; shMode=""; render(); const b=document.querySelector("#sheet .shbtn"); if(b) b.focus(); }
function closeSheet(){ shOpen=false; shMode=""; render(); const f=$("fab"); if(f) f.focus(); }
function renderSheet(){
  const el=$("sheet"), fab=$("fab"); if(!el) return;
  
  if(!shOpen){ el.hidden=true; el.innerHTML=""; return; }
  const c=S.child, sib=c==="Sibilla";
  let h = '<div class="sh-back" data-shclose="1"></div><div class="sh" role="dialog" aria-modal="true" aria-labelledby="sh-t">'+
    '<div class="sh-head"><h2 id="sh-t">'+(shMode==="pisolino"?"Pisolino di ":shMode==="asilo"?"Asilo di ":"Aggiungi per ")+esc(c)+'</h2><button class="sh-x" data-shclose="1" aria-label="Chiudi">×</button></div>';
  if(shMode==="pisolino") h += viewPisolino(c);
  else if(shMode==="asilo" && asF) h += viewAsiloForm(c);
  else h += ADD.map(([g,items])=>{ const it=items.filter(([k])=>sib || (k!=="tappa" && k!=="attivita" && k!=="asilo")); if(!it.length) return "";
      return '<div class="asub">'+g+'</div><div class="shgrid">'+it.map(([k,l])=>'<button class="shbtn" data-add="'+k+'">'+l+'</button>').join("")+'</div>'; }).join("")+
    '<button class="btn full" data-add="revisione" style="margin-top:18px">Revisione della settimana</button>';
  const old=el.querySelector(".sh"), st=old?old.scrollTop:0;
  el.innerHTML = h + '</div>'; el.hidden=false;
  const nw=el.querySelector(".sh"); if(nw && old){ nw.classList.add("noanim"); nw.scrollTop=st; }
}
function pzKey(){ return pzDay==="ieri" ? dayKey(dayStart(1)) : dayKey(dayStart(0)); }
function viewPisolino(c){
  const k=pzKey(), cur=sonnoDays(c)[k], tot=Math.min(24, (cur?cur.ore:0)+pzVal);
  return '<div class="seg" role="group" aria-label="Giorno" style="margin-top:8px"><button data-pzday="oggi" aria-pressed="'+(pzDay==="oggi")+'">Oggi</button><button data-pzday="ieri" aria-pressed="'+(pzDay==="ieri")+'">Ieri</button></div>'+
    '<div class="stepper"><button data-pzstep="-1" aria-label="Mezz’ora in meno"'+(pzVal<=0.5?' disabled':'')+'>−</button><output aria-live="polite">'+fmt(pzVal,1)+' <small>ore</small></output><button data-pzstep="1" aria-label="Mezz’ora in più"'+(pzVal>=6?' disabled':'')+'>+</button></div>'+
    '<p class="already">'+(cur ? 'Per '+esc(dayWord(k))+' ci sono già '+fmt(cur.ore,1)+' ore: diventano <b>'+fmt(tot,1)+' ore</b>.'
      : 'Per '+esc(dayWord(k))+' non c’è ancora la nanna: si salvano '+fmt(tot,1)+' ore. Quando segni la notte, scrivi il totale del giorno.')+'</p>'+
    '<div class="arow"><button class="btn" id="pz-save">Aggiungi il pisolino</button><button class="btn ghost" id="pz-back">Indietro</button></div>';
}
function addPisolino(){
  const c=S.child, k=pzKey(), cur=sonnoDays(c)[k], tot=Math.min(24, Math.round(((cur?cur.ore:0)+pzVal)*2)/2);
  S.qs.sonno.push({id:"genitori-sonno-"+Date.now(), day:k, bambino:c, ore:tot, note:"pisolino +"+fmt(pzVal,1)+" h"+(cur?"":", solo pisolino")});
  save(); shOpen=false; shMode=""; pzVal=1; toast("Pisolino aggiunto: "+fmt(tot,1)+" ore per "+dayWord(k)); render(); sync(false);
}
function addAction(k){
  if(k==="asilo"){ shOpen=true; shMode="asilo"; asInit(S.child, asDefDay()); render(); const b=document.querySelector("#sheet #as-day"); if(b) b.focus(); return; }
  if(k==="pisolino"){ shMode="pisolino"; pzDay="oggi"; pzVal=1; render(); const b=document.querySelector("#sheet [data-pzday]"); if(b) b.focus(); return; }
  shOpen=false; shMode="";
  const show=(el, start)=>{ if(el){ el.scrollIntoView({block:start?"start":"center"}); try{ el.focus({preventScroll:true}); }catch(e){} } };
  if(k==="nanna"){ nDay="ieri"; nVal=null; nErr=""; go("nanna"); return; }
  if(k==="settimana" || k==="revisione"){ if(rv) rv.step=1; go("settimana"); return; }
  if(k==="misura"){ go("crescita"); show($("f-peso")); return; }
  if(k==="malattia" || k==="febbre" || k==="farmaco" || k==="visita"){
    go("salute"); const op=episodi(S.child).filter(e=>e.open);
    hForm=k; hErr=""; hVk=""; hCosa = k==="malattia" ? "Raffreddore" : k==="visita" ? "Pediatra" : ""; hEp = op[0] ? op[0].id : "";
    render(); show(document.querySelector(".hform h3")); return; }
  if(k==="vaccino"){ go("salute"); hCal=true; render(); const b=$("h-cal"); if(b) b.closest(".panel").scrollIntoView({block:"start"}); return; }
  if(k==="nota"){ go("diario"); show($("d-testo")); return; }
  if(k==="tappa"){ go("sviluppo"); return; }
  if(k==="attivita"){ aOpen=true; aVoto=0; aErr=""; go("oggi"); const el=document.querySelector(".afatta"); if(el) el.scrollIntoView({block:"center"}); return; }
  if(k==="appuntamento"){ pOpen=true; pErr=""; pTipo="visita"; go("oggi"); show($("p-tit")); return; }
}

/* ---------- asilo di Sibilla (28/10/2026) ----------
   Scheda Asilo del foglio: ID | Data | Bambino | Nanna (min) | Cacca (sì/no) | Cosa ha mangiato | Quanto (assaggi/metà/tutto) | Umore | Note | Origine.
   Una riga per giornata (ora fissa 13:00); per correggere se ne aggiunge una nuova: vale l'ultima (ID con timestamp, poi ordine delle righe).
   In «Cosa ha mangiato» i piatti sono separati da virgole, con la quantità tra parentesi: «risotto (metà), polpettine (assaggio)».
   Quanto = le quantità della giornata (es. «assaggi/metà»). Umore: serena, tranquilla, stanca, nervosa.
   Il riquadro in Oggi mostra la settimana in corso; la revisione del weekend quella che si sta rivedendo, con il confronto sulla settimana prima. */
const UMORI = [["serena","😊","Serena"],["tranquilla","🙂","Tranquilla"],["stanca","😴","Stanca"],["nervosa","😣","Nervosa"]];
const QUANTI = [["niente","Niente"],["assaggi","Assaggi"],["metà","Metà"],["tutto","Tutto"]];
let asF = null;   /* modulo "Giornata all'asilo" nel pannello Aggiungi */
function caccaNorm(v){ const x=String(v||"").trim().toLowerCase(); return /^s[iì]/.test(x) ? "sì" : /^no/.test(x) ? "no" : ""; }
function asiloToSheet(o){ const sd=toSerial(o.day+" 13:00"); return [o.id, sd==null?o.day:sd, o.bambino, o.nanna==null?"":o.nanna, o.cacca||"", o.cibo||"", o.quanto||"", o.umore||"", o.note||"", "app-genitori"]; }
function asiloMap(c){
  const ids = new Set(S.asilo.map(r=>r.id));
  const all = S.asilo.filter(r=>r.bambino===c && r.day && r.origine!=="test" && r.origine!=="prova")
      .map(r=>Object.assign({}, r, {pending:false, ord:ordOf(r.id), idx:r.i||0}))
    .concat(S.qs.asilo.filter(q=>q.bambino===c && !ids.has(q.id))
      .map(q=>Object.assign({}, q, {pending:true, ord:ordOf(q.id), idx:1e12+ordOf(q.id)})));
  const map = {};
  all.forEach(r=>{ if(!map[r.day] || newer(r, map[r.day])) map[r.day]=r; });
  return map;
}
function umoreOf(v){ const x=String(v||"").trim().toLowerCase().slice(0,5); return x ? UMORI.find(u=>u[0].slice(0,5)===x) || null : null; }
function qNorm(v){ const x=String(v||"").toLowerCase(); return /niente|rifiut|non mangiat|non gradit|non l.ha/.test(x) ? "niente" : /tutt|bis/.test(x) ? "tutto" : /met[àa]/.test(x) ? "metà" : /assagg|pochin|pezzett|un po/.test(x) ? "assaggi" : ""; }
function qCls(q){ return q==="niente" ? "qn" : q==="tutto" ? "qt" : q==="metà" ? "qm" : q==="assaggi" ? "qa" : ""; }
function piattiOf(r){
  const cibo=String(r.cibo||""), def = /\(/.test(cibo) || /\//.test(r.quanto||"") ? "" : qNorm(r.quanto);
  return cibo.split(/[,;]/).map(x=>x.trim()).filter(Boolean).map(x=>{ const m=x.match(/^(.*?)\s*\(([^)]*)\)\s*$/); return m ? {n:m[1].trim(), q:qNorm(m[2])||def} : {n:x, q:def}; });
}
function weekMon(d){ return addDays(d, -((d.getDay()+6)%7)); }
function asiloWeek(c, mon){
  const map=asiloMap(c), days=[];
  for(let i=0;i<7;i++){ const r=map[dayKey(addDays(mon,i))]; if(r) days.push(Object.assign({}, r, {wd:i})); }
  const nn=days.filter(r=>r.nanna!=null), cc=days.filter(r=>r.cacca==="sì" || r.cacca==="no");
  return {days, n:days.length,
    nanna: nn.length ? {avg:nn.reduce((a,r)=>a+r.nanna,0)/nn.length, n:nn.length} : null,
    cacca: cc.length ? {si:cc.filter(r=>r.cacca==="sì").length, n:cc.length} : null};
}
function wdShort(i){ return GIORNI[(i+1)%7].slice(0,3); }
function asiloBox(c, mon, full){
  const w=asiloWeek(c,mon), p=asiloWeek(c,addDays(mon,-7));
  if(!w.n) return '<p class="lead" style="margin:0">'+(full ? 'Nessuna giornata d’asilo segnata in questa settimana.' : 'Ancora nessuna giornata segnata questa settimana.')+'</p>';
  let h = '<div class="kpi">';
  if(w.nanna){
    const d = p.nanna ? w.nanna.avg - p.nanna.avg : null;
    h += '<div><div class="big">'+fmt(Math.round(w.nanna.avg),0)+' <small>min</small></div><div class="lead">nanna media'+(w.nanna.n<w.n ? ' ('+plural(w.nanna.n,"giorno","giorni")+')' : '')+'</div>'+
      '<div class="lead" style="font-size:13.5px">'+(d==null ? 'settimana prima non segnata' : Math.abs(d)<5 ? 'come la settimana prima ('+fmt(Math.round(p.nanna.avg),0)+' min)' : (d>0?'↑ ':'↓ ')+fmt(Math.round(Math.abs(d)),0)+' min rispetto alla settimana prima')+'</div></div>';
  }else h += '<div><div class="big">–</div><div class="lead">nanna non segnata</div></div>';
  h += '<div><div class="big">'+(w.cacca ? w.cacca.si+'<small>/'+w.cacca.n+'</small>' : '–')+'</div><div class="lead">'+(w.cacca ? 'giorni con la cacca' : 'cacca non segnata')+'</div></div></div>';
  h += '<div class="asub">Umore</div><div class="asmood">'+[0,1,2,3,4].map(i=>{ const r=w.days.find(x=>x.wd===i), u=r ? umoreOf(r.umore) : null;
      return '<div aria-label="'+esc(GIORNI[(i+1)%7]+": "+(u ? u[0] : r ? "umore non segnato" : "giornata non segnata"))+'"><span class="d" aria-hidden="true">'+wdShort(i)+'</span><span class="e" aria-hidden="true">'+(u ? u[1] : '–')+'</span><span class="t" aria-hidden="true">'+(u ? u[2] : '&nbsp;')+'</span></div>'; }).join("")+'</div>';
  const pi = w.days.map(r=>({r, l:piattiOf(r)})).filter(x=>x.l.length);
  h += '<div class="asub">Cosa ha mangiato</div>'+(pi.length ? '<ul class="aslist">'+pi.map(x=>'<li><span class="d">'+wdShort(x.r.wd)+'</span><span class="chips">'+
      x.l.map(q=>'<span class="chip"><i class="q '+qCls(q.q)+'" aria-hidden="true"></i>'+esc(q.n)+(q.q ? ' <small>'+esc(q.q)+'</small>' : '')+'</span>').join("")+'</span></li>').join("")+'</ul>'
    : '<p style="margin:0">Non segnato.</p>');
  if(full){
    const nt = w.days.filter(r=>String(r.note||"").trim());
    if(nt.length) h += '<div class="asub">Note</div><ul class="aslist">'+nt.map(r=>'<li><span class="d">'+wdShort(r.wd)+'</span><span style="padding-top:4px">'+esc(r.note)+'</span></li>').join("")+'</ul>';
  }
  if(w.days.some(r=>r.pending)) h += '<p class="small-note">Alcune giornate sono in attesa di arrivare al foglio.</p>';
  return h;
}
function asiloSummary(c, mon){
  const w=asiloWeek(c,mon); if(!w.n) return "";
  const p=[];
  if(w.nanna) p.push("nanna media "+Math.round(w.nanna.avg)+" min");
  if(w.cacca) p.push("cacca "+w.cacca.si+"/"+w.cacca.n+" giorni");
  const um = w.days.map(r=>umoreOf(r.umore)).filter(Boolean).map(u=>u[0]);
  if(um.length){ const cnt={}; um.forEach(u=>{ cnt[u]=(cnt[u]||0)+1; }); p.push("umore "+Object.entries(cnt).sort((a,b)=>b[1]-a[1]).map(e=>e[0]).join(", ")); }
  const tutti = [].concat(...w.days.map(piattiOf)).filter(q=>q.q==="tutto").map(q=>q.n);
  if(tutti.length) p.push("mangiato tutto: "+tutti.join(", "));
  return "Asilo: "+p.join("; ")+".";
}
function asiloCard(c){
  if(c!=="Sibilla") return "";
  const t=dayStart(0), dw=(t.getDay()+6)%7, today=asiloMap(c)[dayKey(t)];
  return '<h2>Settimana all’asilo</h2><div class="panel">'+asiloBox(c, weekMon(t), false)+
    '<p style="margin:16px 0 0"><button class="btn'+(today || dw>=5 ? ' ghost' : '')+'" data-add="asilo">'+(dw>=5 ? 'Segna una giornata' : today ? 'Correggi la giornata di oggi' : 'Segna la giornata di oggi')+'</button></p></div>';
}
function asDefDay(){ const t=dayStart(0), dw=(t.getDay()+6)%7; return dayKey(dw>=5 ? addDays(t, 4-dw) : t); }
function asInit(c, k){
  const r=asiloMap(c)[k], pl = r ? piattiOf(r) : [];
  asF = {day:k, had:!!r, err:"", diario:false,
    nanna: r && r.nanna!=null ? r.nanna : null, cacca: r ? (r.cacca||"") : "", umore: r && umoreOf(r.umore) ? umoreOf(r.umore)[0] : "", note: r ? String(r.note||"") : "",
    piatti: pl.length ? pl.map(q=>({n:q.n, q:q.q})) : [{n:"", q:""}]};
}
function viewAsiloForm(c){
  const f=asF, r=asiloMap(c)[f.day];
  let h = (f.err ? '<p class="formerr" id="as-err" role="alert" style="margin-top:10px">'+esc(f.err)+'</p>' : '')+
    '<div class="field" style="margin-top:10px"><label for="as-day">Giorno</label><input id="as-day" type="date" value="'+esc(f.day)+'" max="'+dayKey(dayStart(0))+'"></div>'+
    (r ? '<p class="already">Per '+esc(dayWord(f.day))+' c’è già una giornata: qui sotto c’è quella salvata. Se salvi, vale la nuova.</p>' : '');
  h += '<div class="asub">Nanna</div><div class="seg" role="group" aria-label="Nanna all’asilo">'+
    [0,15,20,30,45,60,90].map(v=>'<button data-asn="'+v+'" aria-pressed="'+(f.nanna===v)+'">'+(v ? v+' min' : 'Niente')+'</button>').join("")+
    '<button data-asn="x" aria-pressed="'+(f.nanna==null)+'">Non so</button></div>';
  if(f.nanna!=null && f.nanna>0) h += '<div class="stepper" style="margin-top:-4px"><button data-asstep="-1" aria-label="5 minuti in meno">−</button><output aria-live="polite">'+fmt(f.nanna,1)+' <small>min</small></output><button data-asstep="1" aria-label="5 minuti in più"'+(f.nanna>=240?' disabled':'')+'>+</button></div>';
  h += '<div class="asub">Cacca</div><div class="seg" role="group" aria-label="Cacca"><button data-asc="sì" aria-pressed="'+(f.cacca==="sì")+'">Sì</button><button data-asc="no" aria-pressed="'+(f.cacca==="no")+'">No</button><button data-asc="" aria-pressed="'+(!f.cacca)+'">Non so</button></div>';
  h += '<div class="asub">Cosa ha mangiato</div>'+f.piatti.map((q,i)=>'<div class="aspiatto"><input id="as-p'+i+'" data-asp="'+i+'" maxlength="80" autocomplete="off" placeholder="'+(i ? 'Altro piatto' : 'Es. pasta al pomodoro')+'" value="'+esc(q.n)+'" aria-label="Piatto '+(i+1)+'">'+
      '<div class="seg" role="group" aria-label="Quanto ne ha mangiato">'+QUANTI.map(([k,l])=>'<button data-asq="'+i+'|'+k+'" aria-pressed="'+(q.q===k)+'">'+l+'</button>').join("")+'</div></div>').join("")+
    (f.piatti.length<6 ? '<p style="margin:0 0 4px"><button class="btn ghost small" id="as-add">+ Altro piatto</button></p>' : '');
  h += '<div class="asub">Umore</div><div class="faces f4" role="group" aria-label="Umore">'+UMORI.map(u=>'<button data-asu="'+u[0]+'" aria-pressed="'+(f.umore===u[0])+'"><span aria-hidden="true">'+u[1]+'</span>'+u[2]+'</button>').join("")+'</div>';
  h += '<div class="field"><label for="as-note">Note <span class="hint">(facoltative)</span></label><textarea id="as-note" maxlength="300" placeholder="Feste, novità, cose dette dalle maestre…">'+esc(f.note)+'</textarea></div>'+
    '<div class="seg" role="group" aria-label="Diario"><button id="as-dia" aria-pressed="'+f.diario+'">'+(f.diario ? '✓ ' : '')+'Metti la nota anche nel Diario</button></div>'+
    '<div class="arow"><button class="btn" id="as-save">Salva la giornata</button><button class="btn ghost" id="as-back">Indietro</button></div>';
  return h;
}
function addAsilo(){
  const c=S.child, f=asF; if(!f) return;
  const d=dayFromKey(f.day), note=String(f.note||"").trim();
  const piatti=f.piatti.map(q=>({n:String(q.n||"").replace(/[(),;]/g," ").replace(/\s+/g," ").trim(), q:q.q})).filter(q=>q.n);
  f.err="";
  if(!d) f.err="Indica il giorno.";
  else if(d>dayStart(0)) f.err="Il giorno è nel futuro: controllalo.";
  else if(f.nanna==null && !f.cacca && !piatti.length && !f.umore && !note) f.err="Segna almeno una cosa: nanna, cacca, pappa, umore o una nota.";
  else if(f.diario && !note) f.err="Per metterla nel Diario, scrivi la nota.";
  if(f.err){ render(); const el=$("as-err"); if(el) el.scrollIntoView({block:"center"}); return; }
  const t=Date.now(), qs=QUANTI.map(x=>x[0]).filter(k=>piatti.some(q=>q.q===k));
  S.qs.asilo.push({id:"genitori-asilo-"+t, day:f.day, bambino:c, nanna:f.nanna, cacca:f.cacca, cibo:piatti.map(q=>q.n+(q.q ? " ("+q.q+")" : "")).join(", "),
    quanto:qs.join("/"), umore:f.umore, note:note.slice(0,300)});
  if(f.diario && note) S.qs.diario.push({id:"genitori-diario-"+(t+1), data:f.day+" 13:00", bambino:c, cat:"asilo", testo:"Giornata all’asilo: "+note.slice(0,300)});
  asF=null; shOpen=false; shMode=""; save(); toast("Giornata all’asilo salvata"); render(); sync(false);
}


/* ---------- umore del giorno (4/11/2026) ----------
   Una faccina al giorno per bambino, salvata nella scheda Diario con Categoria «umore» e Testo «3 – Bene» (1 Difficile, 2 Così così, 3 Bene, 4 Benissimo), alle 20:00.
   Vale l'ultima riga del giorno. Non compare nell'elenco del Diario. */
const UMD = [[1,"😣","Difficile"],[2,"😕","Così così"],[3,"🙂","Bene"],[4,"😄","Benissimo"]];
let umSel = null;
function umoreMap(c){
  const ids = new Set(S.diario.map(r=>r.id)), map = {};
  S.diario.map((r,i)=>Object.assign({pending:false, idx:i}, r)).concat(S.qs.diario.filter(q=>!ids.has(q.id)).map(q=>Object.assign({pending:true, idx:1e12+ordOf(q.id)}, q)))
    .filter(r=>r.bambino===c && String(r.cat).toLowerCase()==="umore" && r.origine!=="test" && r.origine!=="prova")
    .forEach(r=>{ const d=parseDate(r.data), m=String(r.testo||"").match(/^\s*([1-4])/); if(!d || !m) return;
      const k=dayKey(d), o={v:Number(m[1]), pending:r.pending, ord:ordOf(r.id), idx:r.idx};
      if(!map[k] || newer(o, map[k])) map[k]=o; });
  return map;
}
function umFace(v){ const x=UMD.find(u=>u[0]===Math.round(v)); return x || null; }
function setUmore(c, k, v){
  const u=UMD.find(x=>x[0]===v), d=dayFromKey(k); if(!u || !d || d>dayStart(0)) return;
  S.qs.diario.push({id:"genitori-umore-"+Date.now(), data:k+" 20:00", bambino:c, cat:"umore", testo:v+" – "+u[2], foto:""});
  umSel=null; save(); toast(u[1]+" "+u[2]+" per "+dayWord(k)); render(); sync(false);
}
function umWeekAvg(c, mon){ const m=umoreMap(c), l=[]; for(let i=0;i<7;i++){ const r=m[dayKey(addDays(mon,i))]; if(r) l.push(r.v); } return l.length ? {avg:l.reduce((a,b)=>a+b,0)/l.length, n:l.length, l} : null; }
function umPicker(k){
  return '<div class="faces f4 umpick" role="group" aria-label="Umore di '+esc(dayWord(k))+'">'+UMD.map(u=>'<button data-umset="'+k+'|'+u[0]+'"><span aria-hidden="true">'+u[1]+'</span>'+u[2]+'</button>').join("")+'</div>';
}
function umWeekHtml(c, mon){
  const m=umoreMap(c), oggi=dayStart(0);
  let h='<div class="umweek">';
  for(let i=0;i<7;i++){ const d=addDays(mon,i), k=dayKey(d), r=m[k], u=r?umFace(r.v):null, fut=d>oggi;
    h+='<button data-umday="'+k+'"'+(fut?' disabled':'')+' aria-pressed="'+(umSel===k)+'" aria-label="'+esc(GIORNI[d.getDay()]+" "+d.getDate()+": "+(u?u[2]:"non segnato"))+'">'+
      '<span class="d">'+wdShort(i)+'</span><span class="e">'+(u?u[1]:fut?'':'+')+'</span><span class="t">'+d.getDate()+'</span>'+(r&&r.pending?'<i class="pd" aria-hidden="true"></i>':'')+'</button>'; }
  h+='</div>';
  if(umSel && dayFromKey(umSel)>=mon && dayFromKey(umSel)<addDays(mon,7)) h+='<p class="lead" style="margin:10px 0 6px;font-size:14.5px">Com’è stata '+esc(dayWord(umSel))+'?</p>'+umPicker(umSel);
  else h+='<p class="small-note">Tocca un giorno per scegliere la faccina.</p>';
  return h;
}
function umOggi(c){
  const k=dayKey(dayStart(1)); if(umoreMap(c)[k]) return "";
  return '<div class="panel" style="margin-top:12px"><div class="phead"><b style="font-size:15px">Com’è stata la giornata di ieri?</b><button class="linkbtn" data-rwgo="0">Settimana</button></div>'+
    '<div style="margin-top:10px">'+umPicker(k)+'</div></div>';
}

/* ---------- riepilogo settimanale (4/11/2026) ----------
   Solo lettura: mette insieme per una settimana (lunedì–domenica) nanna, umore, salute, asilo, novità e app di Edo.
   Niente di nuovo nel foglio: usa le schede che ci sono già (Sonno, Settimane, Asilo, Salute, Diario, Sviluppo, Attività, Edo). */
let rwOff = 0;   /* 0 = settimana in corso, -1 = la precedente, … */
function rwMon(off){ return addDays(weekMon(dayStart(0)), 7*(off||0)); }
function rwShortRange(mon){ const sun=addDays(mon,6); return mon.getDate()+(mon.getMonth()!==sun.getMonth()?" "+MESI[mon.getMonth()].slice(0,3):"")+" – "+sun.getDate()+" "+MESI[sun.getMonth()].slice(0,3); }
/* media nanna della settimana: dai giorni segnati, altrimenti dalla revisione */
function rwSleep(c, mon){
  const wd = weekDays(c, mon);
  if(wd) return {avg:wd.avg, n:wd.n, da:"giorni"};
  const r = settMap(c)[dayKey(mon)];
  return r && r.ore!=null ? {avg:r.ore, n:0, da:"revisione"} : null;
}
function rwDaySVG(c, mon){
  const map=sonnoDays(c), rg=sonnoRange(c), oggi=dayStart(0);
  const days=[]; for(let i=0;i<7;i++){ const d=addDays(mon,i); days.push({d, r:map[dayKey(d)], fut:d>=oggi}); }
  const vals=days.filter(x=>x.r).map(x=>x.r.ore);
  if(!vals.length) return '<p class="empty">Nessun giorno di nanna segnato in questa settimana.</p>';
  const W=340,H=170,L=30,R=8,T=10,B=24, top=Math.max(rg[1]+2, Math.ceil(Math.max(...vals)/2)*2+1);
  const bw=(W-L-R)/7, Y=v=>T+(1-v/top)*(H-T-B), f=n=>n.toFixed(1);
  let g='<rect class="band" x="'+L+'" width="'+(W-L-R)+'" y="'+f(Y(rg[1]))+'" height="'+f(Y(rg[0])-Y(rg[1]))+'"/><g class="grid">';
  for(let v=0; v<=top; v+=4) g+='<line x1="'+L+'" x2="'+(W-R)+'" y1="'+f(Y(v))+'" y2="'+f(Y(v))+'"/><text class="lbl" x="'+(L-5)+'" y="'+f(Y(v)+4)+'" text-anchor="end">'+v+'</text>';
  g+='</g>';
  let bars='';
  days.forEach((x,i)=>{ const cx=L+bw*i+bw/2;
    if(x.r){ const y=Y(x.r.ore), lo=x.r.ore<rg[0];
      bars+='<rect class="nb'+(x.r.pending?' pend':'')+(lo?' lo':'')+'" x="'+f(cx-bw*0.3)+'" y="'+f(y)+'" width="'+f(bw*0.6)+'" height="'+f(Y(0)-y)+'" rx="4"><title>'+esc(longDate(x.d))+': '+fmt(x.r.ore,1)+' ore</title></rect>'+
        '<text class="lbl" x="'+f(cx)+'" y="'+f(y-4)+'" text-anchor="middle">'+fmt(x.r.ore,1)+'</text>'; }
    else if(!x.fut) bars+='<circle class="miss" cx="'+f(cx)+'" cy="'+f(Y(0)-3)+'" r="2.5"/>';
    bars+='<text class="lbl" x="'+f(cx)+'" y="'+(H-7)+'" text-anchor="middle">'+wdShort(i)+'</text>'; });
  const desc=days.filter(x=>x.r).map(x=>GIORNI[x.d.getDay()]+" "+fmt(x.r.ore,1)+" ore").join("; ");
  return '<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Nanna giorno per giorno: '+esc(desc)+'. Fascia consigliata '+rg[0]+'–'+rg[1]+' ore">'+g+bars+'</svg>';
}
function rwTrendSVG(c, endMon){
  const rg=sonnoRange(c), sm=settMap(c), N=8, w=[];
  for(let i=N-1;i>=0;i--){ const m=addDays(endMon,-7*i), s=rwSleep(c,m), r=sm[dayKey(m)]; const ua=umWeekAvg(c,m); w.push({m, s, voto:r&&r.voto?Number(r.voto):0, um:ua?umFace(ua.avg)[1]:''}); }
  if(!w.some(x=>x.s)) return '<p class="empty">Ancora nessuna settimana con la nanna segnata.</p>';
  const vals=w.filter(x=>x.s).map(x=>x.s.avg);
  const W=340,H=190,L=30,R=8,T=26,B=24, lo=Math.max(0,Math.floor(Math.min(rg[0],...vals))-1), hi=Math.ceil(Math.max(rg[1],...vals))+1;
  const bw=(W-L-R)/N, Y=v=>T+(1-(v-lo)/(hi-lo))*(H-T-B), f=n=>n.toFixed(1);
  let g='<rect class="band" x="'+L+'" width="'+(W-L-R)+'" y="'+f(Y(rg[1]))+'" height="'+f(Y(rg[0])-Y(rg[1]))+'"/><g class="grid">';
  for(let v=lo; v<=hi; v+=2) g+='<line x1="'+L+'" x2="'+(W-R)+'" y1="'+f(Y(v))+'" y2="'+f(Y(v))+'"/><text class="lbl" x="'+(L-5)+'" y="'+f(Y(v)+4)+'" text-anchor="end">'+v+'</text>';
  g+='</g>';
  const pts=w.map((x,i)=>({x:L+bw*i+bw/2, ...x})).filter(p=>p.s);
  let out = pts.length>1 ? '<polyline class="series" points="'+pts.map(p=>f(p.x)+","+f(Y(p.s.avg))).join(" ")+'"/>' : '';
  out += pts.map(p=>'<circle r="4.5" class="'+(p.s.da==="revisione"?"pend":"")+'" cx="'+f(p.x)+'" cy="'+f(Y(p.s.avg))+'"><title>Settimana dal '+esc(shortDate(p.m))+': '+fmt(p.s.avg,1)+' ore</title></circle>').join("");
  w.forEach((x,i)=>{ const cx=L+bw*i+bw/2;
    if(x.um||x.voto) out+='<text x="'+f(cx)+'" y="16" text-anchor="middle" font-size="14">'+(x.um||faceOf(x.voto))+'</text>';
    if(i%2===1||i===N-1) out+='<text class="lbl" x="'+f(cx)+'" y="'+(H-7)+'" text-anchor="middle">'+(i===N-1&&rwOff===0?"questa":x.m.getDate()+" "+MESI[x.m.getMonth()].slice(0,3))+'</text>'; });
  const desc=pts.map(p=>"settimana dal "+shortDate(p.m)+" "+fmt(p.s.avg,1)+" ore").join("; ");
  return '<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Media nanna per settimana: '+esc(desc)+'">'+g+out+'</svg>';
}
function rwCmp(a, b){ if(a==null||b==null) return ""; const d=a-b; return Math.abs(d)<0.25 ? "come la settimana prima" : (d>0?"↑ ":"↓ ")+fmt(Math.abs(d),1)+" h rispetto alla settimana prima"; }
/* frase di sintesi in cima */
function rwHeadline(c, mon){
  const s=rwSleep(c,mon), rg=sonnoRange(c), ew=epWeek(c,mon), r=settMap(c)[dayKey(mon)], p=[];
  if(s) p.push("ha dormito in media "+fmt(s.avg,1)+" ore al giorno, "+consTxt(cmpCons(s.avg,rg)));
  else p.push("la nanna non è segnata");
  p.push(ew.length ? "si è "+ammWord(c)+" ("+ew.map(e=>String(e.cosa||"malattia").toLowerCase()).join(", ")+")" : "niente malattie segnate");
  const ua=umWeekAvg(c,mon);
  if(ua) p.push("umore in media «"+umFace(ua.avg)[2].toLowerCase()+"»");
  else if(r && r.voto) p.push("settimana "+({1:"così così",2:"buona",3:"ottima"})[Number(r.voto)]);
  const t=p.join(", ")+".";
  return t.charAt(0).toUpperCase()+t.slice(1);
}
function rwMini(c){
  const mon=rwMon(0), s=rwSleep(c,mon), pm=rwSleep(c,addDays(mon,-7));
  const sub = s ? "nanna media "+fmt(s.avg,1)+" h"+(pm?" · settimana prima "+fmt(pm.avg,1)+" h":"") : (pm ? "settimana scorsa: nanna media "+fmt(pm.avg,1)+" h" : "nanna, umore, salute e novità");
  return '<div class="alerts" style="margin-top:12px"><button class="al a" data-rwgo="0"><span class="ic" aria-hidden="true">📊</span><span class="tx"><b>Riepilogo della settimana</b><small>'+esc(sub)+'</small></span><span class="chev" aria-hidden="true"></span></button></div>';
}
function viewRiepilogo(){
  const c=S.child, sib=c==="Sibilla", mon=rwMon(rwOff), end=addDays(mon,7), prevMon=addDays(mon,-7);
  const inW = d=>d && d>=mon && d<end;
  const s=rwSleep(c,mon), ps=rwSleep(c,prevMon), rg=sonnoRange(c), r=settMap(c)[dayKey(mon)];
  let h = '<p style="margin:16px 0 0"><button class="btn ghost small" data-go="oggi">Torna a Oggi</button></p>'+
    '<div class="wknav"><button class="sh-x" data-rw="-1" aria-label="Settimana prima">‹</button>'+
    '<div><b>'+(rwOff===0?"Questa settimana":rwOff===-1?"Settimana scorsa":"Settimana")+'</b><span>'+esc(rwShortRange(mon))+'</span></div>'+
    '<button class="sh-x" data-rw="1" aria-label="Settimana dopo"'+(rwOff>=0?' disabled':'')+'>›</button></div>'+
    '<div class="panel"><p style="margin:0">'+esc(rwHeadline(c,mon))+'</p>'+(rwOff===0?'<p class="small-note">Settimana in corso: i numeri si completano fino a domenica.</p>':'')+'</div>';

  /* nanna */
  h += '<h2>Nanna</h2><div class="panel chart"><div class="kpi" style="margin-bottom:10px">'+
    '<div><div class="big">'+(s?fmt(s.avg,1):'–')+' <small>ore</small></div><div class="lead">media al giorno'+(s?(s.da==="revisione"?', dalla revisione':', '+plural(s.n,"giorno segnato","giorni segnati")):'')+'</div></div>'+
    '<div><div class="big">'+rg[0]+'–'+rg[1]+' <small>ore</small></div><div class="lead">consigliate per l’età</div></div></div>';
  if(s) h += '<p style="margin:0 0 8px;font-size:15px"><span class="ctag">'+esc(cmpCons(s.avg,rg)==="in linea"?"In linea":cmpCons(s.avg,rg)==="meno"?"Sotto":"Sopra")+'</span>'+esc(rwCmp(s.avg, ps&&ps.avg))+'</p>';
  h += rwDaySVG(c,mon)+'<div class="legend"><span><i class="bd"></i>fascia consigliata</span><span><i></i>ore del giorno</span></div>';
  if(r && r.orari) h += '<p class="small-note">Orari della settimana: '+esc(r.orari.replace(/[–-]/," a letto, sveglia "))+'.</p>';
  const pz=Object.values(sonnoDays(c)).filter(x=>{ const d=dayFromKey(x.day); return inW(d) && /pisolino/i.test(String(x.note||"")); }).length;
  if(pz) h += '<p class="small-note">'+plural(pz,"giorno","giorni")+' con un pisolino aggiunto.</p>';
  h += '</div>';

  /* umore */
  const ua=umWeekAvg(c,mon);
  h += '<h2>Umore</h2><div class="panel">'+(ua?'<p style="margin:0 0 10px;font-size:15px"><b>'+esc(umFace(ua.avg)[1]+" "+umFace(ua.avg)[2])+'</b> in media, '+plural(ua.n,"giorno segnato","giorni segnati")+'</p>':'')+umWeekHtml(c,mon)+'<div class="asub">Revisione della settimana</div>';
  if(r && r.voto) h += '<p style="margin:0 0 6px;font-size:16px"><span style="font-size:24px;vertical-align:-3px" aria-hidden="true">'+faceOf(r.voto)+'</span> <b>'+esc(({1:"Così così",2:"Bene",3:"Benissimo"})[Number(r.voto)])+'</b> </p>'+(r.nota?'<div class="note-txt" style="color:var(--muted)">'+esc(r.nota)+'</div>':'');
  else h += '<p class="lead" style="margin:0;font-size:15px">Non ancora fatta.</p>';
  if(sib){ const w=asiloWeek(c,mon);
    if(w.n){ h += '<div class="asub">All’asilo</div><div class="asmood">'+[0,1,2,3,4].map(i=>{ const x=w.days.find(y=>y.wd===i), u=x?umoreOf(x.umore):null;
      return '<div><span class="d">'+wdShort(i)+'</span><span class="e">'+(u?u[1]:'–')+'</span><span class="t">'+(u?u[2]:'&nbsp;')+'</span></div>'; }).join("")+'</div>'; } }
  if(rwOff>=-1 && revWindow() && dayKey(revMon())===dayKey(mon)) h += '<p style="margin:12px 0 0"><button class="btn ghost small" data-go="settimana">'+(r?'Rivedi la revisione':'Fai la revisione')+'</button></p>';
  h += '</div>';

  /* salute */
  const ew=epWeek(c,mon), sal=saluteFor(c).filter(x=>inW(x._d) && ["vaccino","visita","farmaco"].includes(x.tipo) && !x.ep);
  h += '<h2>Salute</h2><div class="panel">';
  if(!ew.length && !sal.length) h += '<p style="margin:0">✓ Niente malattie, visite o farmaci segnati.</p>';
  else{
    h += '<ul class="dlist">'+ew.map(e=>'<li><div class="when"><span class="ctag">'+(e.open?'In corso':guarWord(c))+'</span>dal '+esc(shortDate(e._d))+(e.fine?' al '+esc(shortDate(e.fine._d)):'')+'</div>'+
      '<div class="note-txt">'+esc(e.cosa||"Malattia")+(e.fmax!=null?'<span style="color:var(--muted)"> · febbre max '+esc(tTxt(e.fmax))+'</span>':'')+(e.farm.length?'<span style="color:var(--muted)"> · '+esc(e.farm.map(f=>f.cosa).filter((v,i,a)=>a.indexOf(v)===i).join(", "))+'</span>':'')+'</div></li>').join("")+
      sal.map(x=>'<li><div class="when"><span class="ctag">'+esc({vaccino:"Vaccino",visita:"Visita",farmaco:"Farmaco"}[x.tipo])+'</span>'+esc(shortDate(x._d))+'</div><div class="note-txt">'+esc((x.cosa||"")+(x.det?" – "+x.det:""))+'</div></li>').join("")+'</ul>';
  }
  h += '</div>';

  /* asilo */
  if(sib && asiloWeek(c,mon).n) h += '<h2>Asilo</h2><div class="panel">'+asiloBox(c,mon,true)+'</div>';

  /* app di Edo */
  if(!sib){ const E=edoData();
    h += '<h2>App di Edo</h2><div class="panel">';
    if(!E) h += '<p class="lead" style="margin:0">Dati dell’app non ancora letti dal foglio.</p>';
    else{ const iw=x=>inW(x._d), ms=E.mis.filter(iw), gs=E.gio.filter(iw), es=E.err.filter(iw), us=(E.uso||[]).filter(iw), sg=sumGT(ms);
      const per={}; (us.length?us:gs).forEach(x=>{ const k=dayKey(x._d); per[k]=(per[k]||0)+x.min; });
      const gg=Object.keys(per).length, tot=Object.values(per).reduce((a,b)=>a+b,0), over=Object.values(per).filter(v=>v>LIMITE_GIOCO).length;
      if(!ms.length && !gs.length && !us.length) h += '<p class="lead" style="margin:0">Nessun uso dell’app in questa settimana.</p>';
      else{
        h += '<div class="kpi"><div><div class="big">'+ms.length+'</div><div class="lead">'+(ms.length===1?'missione':'missioni')+(ms.length?', '+pctTxt(sg.g,sg.t)+' giuste':'')+'</div></div>'+
          '<div><div class="big">'+(gg?Math.round(tot/gg):0)+' <small>min</small></div><div class="lead">al giorno, in '+plural(gg,"giorno","giorni")+(over?' · '+over+' oltre le 2 ore':'')+'</div></div></div>';
        const byA={}; es.forEach(e=>{ byA[e.ab]=(byA[e.ab]||0)+1; }); const top=Object.entries(byA).sort((a,b)=>b[1]-a[1]).slice(0,3);
        if(top.length) h += '<p style="margin:12px 0 0;font-size:15px">Da allenare: '+esc(top.map(([a,n])=>a+" ("+n+")").join(", "))+'</p>';
      } }
    h += '</div>'; }

  /* novità */
  const dia=diarioFor(c).filter(n=>inW(n._d) && String(n.cat).toLowerCase()!=="salute");
  const tp = sib ? Object.values(svilMap(c)).filter(x=>inW(dayFromKey(x.day))) : [];
  const at = sib ? attFatte(c).filter(x=>inW(x._d)) : [];
  const ms = measuresFor(c).filter(m=>inW(m._d));
  h += '<h2>Novità</h2><div class="panel">';
  if(!dia.length && !tp.length && !at.length && !ms.length) h += '<p class="lead" style="margin:0">Niente di segnato nel diario, nelle tappe o nelle misure.</p>';
  else{ h += '<ul class="dlist">';
    ms.forEach(m=>{ h += '<li><div class="when"><span class="ctag">Misura</span>'+esc(shortDate(m._d))+'</div><div class="note-txt">'+[m.peso!=null?fmt(m.peso,2)+' kg':'', m.altezza!=null?fmt(m.altezza,1)+' cm':''].filter(Boolean).join(' · ')+'</div></li>'; });
    tp.forEach(x=>{ h += '<li><div class="when"><span class="ctag">Tappa</span>'+esc(shortDate(dayFromKey(x.day)))+'</div><div class="note-txt">'+esc(x.tappa)+'</div></li>'; });
    dia.slice(0,6).forEach(n=>{ h += '<li><div class="when"><span class="ctag">'+esc(catLabel(n.cat))+'</span>'+esc(shortDate(n._d))+'</div><div class="note-txt">'+esc(n.testo.length>160?n.testo.slice(0,160)+"…":n.testo)+'</div></li>'; });
    if(at.length) h += '<li><div class="when"><span class="ctag">Attività</span>'+plural(at.length,"fatta","fatte")+'</div><div class="note-txt">'+esc(at.map(x=>x.titolo+" "+faceOf(x.voto)).join(", "))+'</div></li>';
    h += '</ul>'; }
  h += '</div>';

  /* andamento */
  h += '<h2>Ultime 8 settimane</h2><div class="panel chart">'+rwTrendSVG(c,mon)+
    '<div class="legend"><span><i class="bd"></i>fascia consigliata</span><span><i></i>media nanna</span><span>🙂 umore medio</span></div>'+
    '<p class="small-note">Ogni punto è la media dei giorni segnati; se mancano, vale la nanna della revisione (punto giallo). Fascia: '+esc(rg[2])+'.</p></div>';
  return h;
}

