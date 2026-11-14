/* ---------- riepilogo per il pediatra (fase 5c) ---------- */
const PDF_LIBS = ["https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js","https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js"];
const PD_OPT = [["mis","Misure e percentili"],["graf","Grafici con le curve OMS"],["salute","Salute: allergie, vaccini, malattie, visite"],["nanna","Nanna giorno per giorno"],["sett","Nanna settimana per settimana"],["asilo","Asilo: nanna, cacca, pappa e umore"],["diario","Note di diario «Salute»"],["tappe","Tappe di sviluppo raggiunte"],["nonsegn","Tappe dell’età attuale non ancora segnate"],["app","Prossimi appuntamenti"]];
let pdPer = "tutto", pdOpt = {mis:true, graf:true, salute:true, nanna:true, sett:true, asilo:true, diario:true, tappe:true, nonsegn:false, app:true}, pdBusy = false, pdMsg = "", pdErr = "";
function loadScript(src){ return new Promise((ok,ko)=>{ const s=document.createElement("script"); s.src=src; s.async=true; s.onload=()=>ok(); s.onerror=()=>{ s.remove(); ko(new Error("load")); }; document.head.appendChild(s); }); }
async function pdfLib(){
  if(window.PDFLib) return window.PDFLib;
  for(const u of PDF_LIBS){ try{ await loadScript(u); if(window.PDFLib) return window.PDFLib; }catch(e){} }
  throw {code:"lib"};
}
function pdFrom(){ if(pdPer==="tutto") return null; const n=pdPer==="12"?12:6, d=dayStart(0); return new Date(d.getFullYear(), d.getMonth()-n, d.getDate()); }
function pdPerLabel(){ return pdPer==="tutto" ? "tutto lo storico" : pdPer==="12" ? "ultimi 12 mesi" : "ultimi 6 mesi"; }
function pdQ(c){ return String(((S.pdq||{})[c])||""); }
function ageShort(b,d){ if(!b||!d||d<b) return ""; const a=ageParts(b,d); return a.months<24 ? a.months+" m "+a.days+" g" : Math.floor(a.months/12)+" a "+(a.months%12)+" m"; }
function dateIt(d){ return d.getDate()+" "+MESI[d.getMonth()]+" "+d.getFullYear(); }
function pdMonths(map, from){
  const g = {};
  Object.values(map).forEach(r=>{ const d=dayFromKey(r.day); if(!d || (from && d<from)) return; const k=r.day.slice(0,7); (g[k]=g[k]||{s:0,n:0}); g[k].s+=r.ore; g[k].n++; });
  return Object.keys(g).sort().reverse().map(k=>({k, avg:g[k].s/g[k].n, n:g[k].n}));
}
function pdData(c){
  const from = pdFrom(), inP = d=>!from || (d && d>=from);
  const b = birthOf(c), ms = measuresFor(c).filter(m=>inP(m._d));
  const sal = diarioFor(c).filter(r=>String(r.cat).toLowerCase()==="salute" && inP(r._d));
  const sib = c==="Sibilla", map = sib ? svilMap(c) : {};
  const raggiunte = sib ? TAPPE.filter(t=>map[t.t]).map(t=>({t, r:map[t.t]})) : [];
  const age = sib ? tappeAge(c) : null;
  const mancano = sib ? TAPPE.filter(t=>t.m===age && !map[t.t]) : [];
  const smap = sonnoDays(c), mesi = pdMonths(smap, from);
  const a7 = avgDays(smap,0,6), a30 = avgDays(smap,0,29);
  const small = !b || ageParts(b,new Date()).months < 36 || ms.some(m=>m.cc!=null);
  /* salute (5f): vaccini sempre tutti, episodi e righe sciolte del periodo */
  const allerg = allergOf(c).trim(), vl = b ? vaccList(c) : [], vAltri = vaccAltri(c);
  const vFatti = vl.filter(v=>v.st==="fatto").map(v=>({n:v.n, d:v.d, r:v.row}))
    .concat(vAltri.map(r=>({n:r.cosa||"Vaccino", d:r.det||"", r}))).sort((x,y)=>x.r._d-y.r._d);
  const vDaFare = vl.filter(v=>v.st==="dafare" || v.st==="contr");
  const eps = episodi(c).filter(e=>inP(e.fine ? e.fine._d : new Date()));
  const allEp = new Set(episodi(c).map(e=>e.id));
  const sciolte = saluteFor(c).filter(r=>["febbre","farmaco","visita","nota"].includes(r.tipo) && !(r.ep && allEp.has(r.ep)) && inP(r._d));
  const salN = vFatti.length + vDaFare.length + eps.length + sciolte.length + (allerg?1:0);
  /* settimane (5f): una riga per settimana, l'ultima scritta */
  const sm = settMap(c), sett = Object.keys(sm).sort().reverse().map(k=>Object.assign({_m:dayFromKey(k)}, sm[k])).filter(r=>r._m && inP(addDays(r._m,6)));
  /* asilo (28/10/2026): una riga per settimana, dalla più recente */
  const amap = sib ? asiloMap(c) : {}, aw = {};
  Object.keys(amap).forEach(k=>{ const dd=dayFromKey(k); if(dd && inP(dd)) aw[dayKey(weekMon(dd))]=1; });
  const asW = Object.keys(aw).sort().reverse().map(k=>{ const m=dayFromKey(k); return Object.assign({_m:m}, asiloWeek(c,m)); });
  return {b, ms, sal, sib, raggiunte, age, mancano, smap, mesi, a7, a30, app:appProssimi(c), small, from,
    allerg, vFatti, vDaFare, flu:fluInfo(c), eps, sciolte, salN, an:epAnno(c), sett, rg:sonnoRange(c), asW};
}
function pdAvail(c, d){
  return {
    mis: plural(d.ms.length,"misura","misure"),
    graf: !d.b ? "serve la data di nascita: senza, grafici semplici" : d.ms.length ? (d.small?"peso, lunghezza/altezza e circonferenza cranica":"peso e altezza") : "nessuna misura",
    salute: d.salN ? [d.vFatti.length ? plural(d.vFatti.length,"vaccino fatto","vaccini fatti") : (d.b ? "nessun vaccino segnato" : ""), (d.vFatti.length ? d.vDaFare.length : d.vDaFare.filter(v=>v.st==="dafare").length) ? (d.vFatti.length ? d.vDaFare.length : d.vDaFare.filter(v=>v.st==="dafare").length)+(d.vFatti.length?" da fare o controllare":" da fare") : "", plural(d.eps.length,"malattia","malattie"), d.sciolte.length ? plural(d.sciolte.length,"altra voce","altre voci") : "", d.allerg ? "allergie e note" : ""].filter(Boolean).join(", ") : "niente segnato nel periodo",
    sett: d.sett.length ? plural(d.sett.length,"settimana","settimane")+", con le ore consigliate" : "nessuna revisione nel periodo",
    asilo: d.sib ? (d.asW.length ? plural(d.asW.length,"settimana","settimane")+", "+plural(d.asW.reduce((a,w)=>a+w.n,0),"giornata","giornate") : "nessuna giornata nel periodo") : null,
    nanna: (d.a7||d.a30||d.mesi.length) ? "medie 7 e 30 giorni"+(d.mesi.length?", "+plural(d.mesi.length,"mese","mesi"):"") : (d.sib ? "nessun giorno segnato" : null),
    diario: d.sal.length ? plural(d.sal.length,"nota","note") : "nessuna nota nel periodo",
    tappe: d.sib ? plural(d.raggiunte.length,"tappa","tappe")+", tutte le età" : null,
    nonsegn: d.sib ? (d.mancano.length ? plural(d.mancano.length,"tappa","tappe")+" dei "+d.age+" mesi" : "tutte segnate per i "+d.age+" mesi") : null,
    app: d.app.length ? plural(d.app.length,"appuntamento","appuntamenti") : "nessuno in programma"
  };
}
function viewPediatra(){
  const c=S.child, d=pdData(c), av=pdAvail(c,d);
  let h = '<p style="margin:20px 0 0"><button class="btn ghost small" data-go="crescita">Torna a Crescita</button></p>'+
    '<h2>Riepilogo per il pediatra</h2>'+
    '<div class="panel"><p class="lead">Un PDF per '+esc(c)+' da mostrare o mandare al pediatra, con i dati inseriti da voi. Scegli che cosa metterci, poi scaricalo.</p></div>';
  h += '<h2>Periodo</h2><div class="panel"><div class="seg" role="group" aria-label="Periodo" style="margin:0">'+
    [["tutto","Tutto"],["12","Ultimi 12 mesi"],["6","Ultimi 6 mesi"]].map(([k,l])=>'<button data-pdper="'+k+'" aria-pressed="'+(pdPer===k)+'">'+l+'</button>').join("")+'</div>'+
    '<p class="lead" style="font-size:14px;margin:10px 0 0">Vale per misure, grafici, malattie, visite, nanna e note di diario. Vaccini e tappe raggiunte ci sono sempre tutti.</p></div>';
  h += '<h2>Che cosa metterci</h2><div class="panel pdopts">'+
    PD_OPT.filter(([k])=>av[k]!=null).map(([k,l])=>'<button class="pdopt" data-pdopt="'+k+'" aria-pressed="'+(!!pdOpt[k])+'"><span class="bx" aria-hidden="true">'+(pdOpt[k]?"✓":"")+'</span><span><b>'+esc(l)+'</b><small>'+esc(av[k])+'</small></span></button>').join("")+
    '<p class="lead" style="font-size:14px;margin:12px 0 0">Le voci senza dati restano fuori dal PDF.</p></div>';
  h += '<h2>Domande per il pediatra</h2><div class="panel"><div class="field" style="margin:0"><label for="pd-q">Da chiedere alla visita</label>'+
    '<textarea id="pd-q" maxlength="1000" placeholder="Facoltative, per esempio: dorme poco di giorno, è normale?">'+esc(pdQ(c))+'</textarea>'+
    '<span class="hint">Restano su questo telefono finché non le cancelli, e finiscono in cima al PDF.</span></div></div>';
  h += '<div class="panel" style="margin-top:16px">'+
    (pdErr?'<p class="formerr" role="alert">'+esc(pdErr)+'</p>':'')+
    (pdMsg?'<p class="already" role="status">'+esc(pdMsg)+'</p>':'')+
    '<button class="btn full" id="pd-go"'+(pdBusy?' disabled':'')+'>'+(pdBusy?'Preparo il PDF…':'Scarica il PDF di '+esc(c))+'</button>'+
    '<p class="lead" style="font-size:14px;margin:10px 0 0">'+(S.lastSync?'Dati controllati sul foglio alle '+timeOf(S.lastSync)+'.':'Dati non ancora controllati sul foglio.')+(pendingCount()?' Ci sono anche dati di questo telefono ancora in attesa: entrano nel PDF.':'')+'</p></div>';
  return h;
}

/* grafico SVG dell'app → immagine PNG per il PDF */
function pdSvgPng(svg, acc){
  return new Promise((ok,ko)=>{
    const vb = (svg.match(/viewBox="0 0 (\d+) (\d+)"/)||[]); const w=+vb[1]||340, h=+vb[2]||236, k=3;
    const css = '.grid line{stroke:#D2DCD8;stroke-width:1}.lbl{fill:#5B6A6F;font-size:11px;font-family:Helvetica,Arial,sans-serif}'+
      '.pb{stroke:none}.pb.out{fill:'+acc+';opacity:.10}.pb.mid{fill:'+acc+';opacity:.20}.pc{fill:none;stroke:'+acc+';stroke-width:1;opacity:.55}.pc.p50{stroke-width:1.6;opacity:.9}'+
      '.cut{stroke:#5B6A6F;stroke-width:1;stroke-dasharray:3 3;opacity:.7}.mseries{fill:none;stroke:#1E2A30;stroke-width:2;stroke-linejoin:round;stroke-linecap:round}'+
      '.series{fill:none;stroke:'+acc+';stroke-width:2.5;stroke-linejoin:round}circle{fill:#fff;stroke:'+acc+';stroke-width:2.5}circle.m,circle.m.pend{stroke:#1E2A30}';
    const s = svg.replace(/<title>[\s\S]*?<\/title>/g,"").replace(/^<svg /, '<svg xmlns="http://www.w3.org/2000/svg" width="'+w+'" height="'+h+'" ').replace(/^(<svg[^>]*>)/, '$1<style>'+css+'</style>');
    const img = new Image();
    img.onload = ()=>{ try{
      const cv=document.createElement("canvas"); cv.width=w*k; cv.height=h*k;
      const x=cv.getContext("2d"); x.fillStyle="#fff"; x.fillRect(0,0,cv.width,cv.height); x.drawImage(img,0,0,cv.width,cv.height);
      cv.toBlob(bl=>{ if(!bl) return ko(new Error("png")); bl.arrayBuffer().then(buf=>ok({bytes:new Uint8Array(buf), w, h}), ko); }, "image/png");
    }catch(e){ ko(e); } };
    img.onerror = ()=>ko(new Error("svg"));
    img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(s);
  });
}

async function pdBuild(c){
  const L = await pdfLib(), {PDFDocument, StandardFonts, rgb} = L;
  const d = pdData(c), now = new Date(), sib = d.sib, b = d.b;
  const doc = await PDFDocument.create();
  doc.setTitle("Riepilogo per il pediatra – "+c); doc.setAuthor("Casa Bambini"); doc.setCreator("Casa Bambini"); doc.setProducer("Casa Bambini");
  doc.setSubject("Dati inseriti dai genitori"); doc.setLanguage("it-IT"); doc.setCreationDate(now); doc.setModificationDate(now);
  const F = await doc.embedFont(StandardFonts.Helvetica), FB = await doc.embedFont(StandardFonts.HelveticaBold), FI = await doc.embedFont(StandardFonts.HelveticaOblique);
  const hex = s=>rgb(parseInt(s.slice(1,3),16)/255, parseInt(s.slice(3,5),16)/255, parseInt(s.slice(5,7),16)/255);
  const ACCH = sib ? "#6E4FA3" : "#17695F", ACC = hex(ACCH), SOFT = hex(sib ? "#ECE4F7" : "#D6EEEA");
  const INK = hex("#1E2A30"), MUT = hex("#5B6A6F"), LINE = hex("#D2DCD8"), PALE = hex("#F5F7F6");
  const PW = 595.28, PH = 841.89, M = 42, CW = PW-2*M, TOP = PH-M, BOT = M+30;
  const ok = {};
  const clean = v=>{ let o=""; for(const ch of String(v==null?"":v).replace(/\r/g,"")){
      if(ch==="\n"){ o+=ch; continue; }
      if(ok[ch]===undefined){ try{ F.encodeText(ch); FB.encodeText(ch); ok[ch]=true; }catch(e){ ok[ch]=false; } }
      o += ok[ch] ? ch : (/\s/.test(ch) ? " " : ""); }
    return o.replace(/[ ]{2,}/g," "); };
  const wid = (s,f,z)=>f.widthOfTextAtSize(s,z);
  const wrap = (txt,f,z,w)=>{
    const out=[];
    clean(txt).split("\n").forEach(par=>{
      const words=par.trim().split(" ").filter(Boolean); let line="";
      if(!words.length){ out.push(""); return; }
      words.forEach(wd=>{
        while(wid(wd,f,z)>w){ let i=wd.length; while(i>1 && wid((line?line+" ":"")+wd.slice(0,i),f,z)>w) i--; if(i<=1 && line){ out.push(line); line=""; continue; } out.push((line?line+" ":"")+wd.slice(0,i)); line=""; wd=wd.slice(i); }
        const t = line ? line+" "+wd : wd;
        if(wid(t,f,z)<=w) line=t; else { out.push(line); line=wd; }
      });
      if(line) out.push(line);
    });
    return out;
  };
  let page = null, y = 0;
  const T = (s,x,yy,f,z,col)=>{ s=clean(s); if(s) page.drawText(s,{x,y:yy,size:z,font:f,color:col||INK}); };
  const newPage = ()=>{
    page = doc.addPage([PW,PH]); y = TOP;
    if(doc.getPageCount()>1){ T("Riepilogo per il pediatra · "+c, M, y-8, FB, 9, ACC); page.drawLine({start:{x:M,y:y-14}, end:{x:PW-M,y:y-14}, thickness:.6, color:LINE}); y -= 30; }
  };
  const ensure = h=>{ if(y-h<BOT) newPage(); };
  const para = (txt,o)=>{ o=o||{}; const f=o.f||F, z=o.z||10, lh=o.lh||z*1.38, x=o.x||M, w=o.w||CW-(x-M);
    wrap(txt,f,z,w).forEach(l=>{ ensure(lh); T(l, x, y-z, f, z, o.col); y-=lh; }); };
  const heading = (title, sub)=>{ ensure(sub?62:48); y-=14; T(title, M, y-13, FB, 13, ACC); y-=19;
    page.drawLine({start:{x:M,y}, end:{x:PW-M,y}, thickness:.8, color:ACC}); y-=8;
    if(sub){ para(sub,{z:8.5, col:MUT}); y-=2; } };
  const kv = (k,v)=>{ const kw=118; const lines=wrap(v,F,10,CW-kw); ensure(lines.length*13.8);
    T(k, M, y-10, FB, 10, INK); lines.forEach((l,i)=>T(l, M+kw, y-10-i*13.8, F, 10)); y -= lines.length*13.8+2; };
  const subh = t=>{ ensure(40); y-=6; T(t, M, y-10.5, FB, 10.5, INK); y-=17; };
  /* tabella: cols = [{t:titolo, w}], rows = [[cella, …]] e cella = testo oppure [[testo, stile], …] */
  const table = (cols, rows)=>{
    const pad=4, z=8.8, lh=11.4;
    const drawHead = ()=>{ ensure(24); page.drawRectangle({x:M, y:y-18, width:CW, height:18, color:SOFT});
      let x=M; cols.forEach(cl=>{ T(cl.t, x+pad, y-12.4, FB, 8.3, INK); x+=cl.w; }); y-=18; };
    drawHead();
    rows.forEach((r,ri)=>{
      const cells = r.map((cell,i)=>{ const parts = Array.isArray(cell) ? cell : [[cell,""]]; const out=[];
        parts.forEach(([txt,st])=>{ const f = st==="b"?FB : st==="m"?F : F, zz = st==="m"?7.8:z; wrap(txt,f,zz,cols[i].w-pad*2).forEach(l=>out.push([l,f,zz,st==="m"?MUT:INK])); });
        return out; });
      const hgt = Math.max(1,...cells.map(c=>c.length))*lh + pad*2 - 2;
      if(y-hgt<BOT){ newPage(); drawHead(); }
      if(ri%2===1) page.drawRectangle({x:M, y:y-hgt, width:CW, height:hgt, color:PALE});
      let x=M; cells.forEach((cl,i)=>{ cl.forEach((ln,j)=>T(ln[0], x+pad, y-pad-ln[2]-j*lh+1, ln[1], ln[2], ln[3])); x+=cols[i].w; });
      y-=hgt; page.drawLine({start:{x:M,y}, end:{x:PW-M,y}, thickness:.4, color:LINE});
    });
    y-=4;
  };

  /* intestazione */
  newPage();
  page.drawRectangle({x:0, y:PH-118, width:PW, height:118, color:SOFT});
  page.drawRectangle({x:0, y:PH-118, width:6, height:118, color:ACC});
  T("RIEPILOGO PER IL PEDIATRA", M, PH-44, FB, 9.5, ACC);
  T(c, M, PH-74, FB, 26, INK);
  const sx = sexOf(c)==="F";
  T(b ? (sx?"Nata":"Nato")+" il "+dateIt(b)+"  ·  "+ageLabel(b,now)+"  ·  "+(sx?"femmina":"maschio") : "Data di nascita non indicata  ·  "+(sx?"femmina":"maschio"), M, PH-93, F, 10.5, INK);
  T("Preparato dai genitori il "+dateIt(now)+"  ·  periodo: "+pdPerLabel(), M, PH-108, F, 9, MUT);
  y = PH-118-6;

  /* domande */
  const q = pdQ(c).trim();
  if(q){ heading("Domande per il pediatra"); para(q,{z:10.5, lh:14.5}); }

  /* misure */
  const lying = !b || d.ms.some(m=>ageMonths(b,m._d)<24), standing = !b || d.ms.some(m=>ageMonths(b,m._d)>=24);
  const altL = lying && standing ? "Lunghezza / altezza" : lying ? "Lunghezza" : "Altezza", hasCc = d.ms.some(m=>m.cc!=null);
  const metr = [["peso","Peso","kg",2],["altezza",altL,"cm",1]].concat(d.small && hasCc?[["cc","Circonferenza cranica","cm",1]]:[]);
  if(pdOpt.mis || pdOpt.graf){
    heading("Crescita", "Percentili calcolati con gli standard OMS 2006 (0–5 anni) e i riferimenti OMS 2007 (5–19 anni)."+(lying?" Fino a 24 mesi la lunghezza è misurata da sdraiati, poi l’altezza in piedi.":""));
    if(!d.ms.length) para("Nessuna misura nel periodo scelto.",{col:MUT});
    else{
      metr.forEach(([k,l,u,dec])=>{
        let last=null; for(let i=d.ms.length-1;i>=0;i--) if(d.ms[i][k]!=null){ last=d.ms[i]; break; }
        if(!last) return; const r=percOf(c,k,last[k],last._d);
        kv(k==="altezza" ? (b && ageMonths(b,last._d)<24 ? "Lunghezza" : "Altezza") : l,
          fmt(last[k],dec)+" "+u+(r?"  ·  "+pLabel(r)+" percentile":"")+"  ·  "+dateIt(last._d)+(b?" ("+ageLabel(b,last._d)+")":""));
      });
      y-=4;
    }
  }
  if(pdOpt.graf && d.ms.length){
    const imgs=[];
    for(const [k,l,u,dec] of metr){
      if(!d.ms.some(m=>m[k]!=null)) continue;
      let svg = b ? growthSVG(c,d.ms,k,u,dec) : null, oms = !!svg;
      if(!svg){ svg = chartSVG(d.ms,k,u,dec,b); if(!/^<svg/.test(svg)) continue; }
      try{ imgs.push({k, l:l+" ("+u+")", oms, png: await pdSvgPng(svg, ACCH)}); }catch(e){}
    }
    if(imgs.length){
      const gw=(CW-14)/2;
      for(let i=0;i<imgs.length;i+=2){
        const row=imgs.slice(i,i+2), gh=Math.max(...row.map(g=>gw*g.png.h/g.png.w));
        ensure(gh+22);
        for(let j=0;j<row.length;j++){ const g=row[j], x=M+j*(gw+14), im=await doc.embedPng(g.png.bytes), hh=gw*g.png.h/g.png.w;
          T(g.l, x, y-10, FB, 9, INK); page.drawImage(im,{x, y:y-14-hh, width:gw, height:hh}); }
        y -= gh+20;
      }
      para(imgs.some(g=>g.oms) ? "Nei grafici: fasce dal 3° al 97° percentile (linee 3°, 15°, 50°, 85°, 97°; la 50° più marcata), misure in nero, in basso l’età." : b ? "Grafici semplici, fuori dalle tabelle OMS caricate nell’app." : "Grafici semplici: per le curve OMS serve la data di nascita (scheda Bambini del foglio).",{z:8.5, col:MUT});
    }
  }
  if(pdOpt.mis && d.ms.length){
    ensure(60); y-=6;
    const cols=[{t:"Data",w:58},{t:"Età",w:52},{t:"Peso (kg)",w:72},{t:(lying&&standing?"Lungh./altezza":altL)+" (cm)",w:86}].concat(hasCc?[{t:"Circ. cranica (cm)",w:80}]:[]).concat([{t:"Dove",w:50}]);
    cols.push({t:"Note", w:CW-cols.reduce((a,x)=>a+x.w,0)});
    const cell=(m,k,dec)=>{ if(m[k]==null) return ""; const r=percOf(c,k,m[k],m._d); const ln=[[fmt(m[k],dec),""]]; if(r) ln.push([pLabel(r)+" perc.","m"]); return ln; };
    table(cols, d.ms.slice().reverse().map(m=>[
      [[shortDate(m._d),""]].concat(m.pending?[["sul telefono","m"]]:[]), b?ageShort(b,m._d):"", cell(m,"peso",2), cell(m,"altezza",1)].concat(hasCc?[cell(m,"cc",1)]:[]).concat([
      m.dove==="pediatra"?"pediatra":m.dove==="casa"?"casa":(m.dove||""), m.note||""])));
  }

  /* salute (5f) */
  if(pdOpt.salute && d.salN){
    heading("Salute", "Segnata dai genitori nell’app (scheda Salute). Per vaccini, date e dosi fa fede il libretto vaccinale.");
    kv("Allergie e note", d.allerg || "nessuna indicata");
    kv("Ultimo anno", plural(d.an.n,"volta","volte")+(sexOf(c)==="F"?" malata":" malato")+", "+plural(d.an.gg,"giorno","giorni")+" di malattia, "+plural(d.an.feb,"episodio","episodi")+" con febbre da 38 °C");
    if(d.vFatti.length){
      subh("Vaccini fatti");
      table([{t:"Vaccino",w:200},{t:"Dose",w:90},{t:"Data",w:86},{t:"Note",w:CW-376}],
        d.vFatti.map(v=>{ const nd=/data non nota/i.test(v.r.note||""); return [v.n, v.d, [[shortDate(v.r._d),""]].concat(nd?[["data non nota (età prevista)","m"]]:[]).concat(v.r.pending?[["sul telefono","m"]]:[]),
          String(v.r.note||"").replace(/data non nota/i,"").replace(/^[\s,;·.–-]+|[\s,;·.–-]+$/g,"")]; }));
    }
    const nessuno = !d.vFatti.length && d.b, vDF = nessuno ? d.vDaFare.filter(v=>v.st==="dafare") : d.vDaFare;
    if(vDF.length || d.flu || nessuno){
      subh(nessuno ? "Vaccini" : "Vaccini da fare o da controllare");
      if(nessuno) para("Nessun vaccino segnato nell’app: quelli già fatti sono sul libretto vaccinale."+(vDF.length?" Secondo l’età, da fare adesso:":""),{z:9.6});
      if(vDF.length) table([{t:"Vaccino",w:200},{t:"Dose",w:90},{t:"Età prevista",w:86},{t:"Stato",w:CW-376}],
        vDF.map(v=>[v.n, v.d, v.eta, v.st==="contr" ? "non segnato: da controllare sul libretto" : (daysTo(v.due)>0 ? "dal "+shortDate(v.due) : "da fare, dal "+shortDate(v.due))]));
      if(d.flu) para("Antinfluenzale, stagione "+d.flu.stag+": "+(d.flu.fatto ? "fatta il "+shortDate(d.flu.fatto._d)+"." : "non segnata (consigliata ogni autunno dai 6 mesi ai 6 anni)."),{z:9.2});
      if(!nessuno) para("Calendario della Regione Marche (piano vaccinale 2023–2025). «Da controllare» vuol dire che la finestra è passata e nell’app non risulta: spesso è solo da segnare dal libretto.",{z:8.2, col:MUT});
    }
    subh("Malattie"+(d.from?" nel periodo":""));
    if(!d.eps.length) para("Nessuna malattia segnata"+(d.from?" nel periodo scelto.":"."),{col:MUT});
    else table([{t:"Quando",w:92},{t:"Che cosa",w:118},{t:"Febbre",w:70},{t:"Farmaci",w:120},{t:"Visite",w:CW-400}],
      d.eps.map(e=>{
        const quando=[[shortDate(e._d)+(e.fine?" – "+shortDate(e.fine._d):""),""],[e.fine?plural(epGiorni(e),"giorno","giorni"):"in corso","m"]].concat(e.pending?[["sul telefono","m"]]:[]);
        const cosa=[[e.cosa||"Malattia",""]].concat(e.det?[[e.det,"m"]]:[]).concat(e.note?[[e.note,"m"]]:[]);
        const n=e.feb.length+(e.temp!=null?1:0);
        const feb=e.fmax!=null ? [["max "+tTxt(e.fmax),""],[plural(n,"misura","misure"),"m"]] : [["no","m"]];
        const farm=e.farm.length ? e.farm.slice().sort((a,b)=>a._d-b._d).map(f=>[(f.cosa||"Farmaco")+(f.det?" – "+f.det:""),""]) : [["nessuno","m"]];
        const vis=e.vis.length ? e.vis.slice().sort((a,b)=>a._d-b._d).map(v=>[shortDate(v._d)+" "+(v.cosa||"Visita")+(v.det?": "+v.det:""),""]) : [["nessuna","m"]];
        return [quando, cosa, feb, farm, vis];
      }));
    if(d.sciolte.length){
      subh("Visite, farmaci e note non legati a una malattia");
      const lab={febbre:"Febbre",farmaco:"Farmaco",visita:"Visita",nota:"Nota"};
      table([{t:"Data",w:70},{t:"Tipo",w:60},{t:"Che cosa",w:140},{t:"Dettagli",w:CW-270}],
        d.sciolte.map(r=>[[[shortDate(r._d),""]].concat(r.pending?[["sul telefono","m"]]:[]), lab[r.tipo]||"Salute",
          r.tipo==="febbre" ? tTxt(r.temp) : (r.cosa||""), [r.det, r.note].filter(Boolean).join(" · ")]));
    }
  }

  /* nanna */
  if(pdOpt.nanna && (d.a7||d.a30||d.mesi.length)){
    heading("Nanna", "Ore totali di sonno nelle 24 ore (notte più pisolini), segnate dai genitori: un valore al giorno.");
    kv("Ultimi 7 giorni", d.a7 ? fmt(d.a7.avg,1)+" ore di media, "+plural(d.a7.n,"giorno segnato","giorni segnati") : "nessun giorno segnato");
    kv("Ultimi 30 giorni", d.a30 ? fmt(d.a30.avg,1)+" ore di media, "+plural(d.a30.n,"giorno segnato","giorni segnati") : "nessun giorno segnato");
    if(d.mesi.length>1 || (d.mesi.length===1 && !d.a30)){
      y-=4; const mm=d.mesi.slice(0,12);
      table([{t:"Mese",w:150},{t:"Media ore al giorno",w:130},{t:"Giorni segnati",w:CW-280}],
        mm.map(x=>{ const p=x.k.split("-"); const n=MESI[+p[1]-1]; return [n.charAt(0).toUpperCase()+n.slice(1)+" "+p[0], fmt(x.avg,1), String(x.n)]; }));
    }
  }

  /* nanna settimana per settimana (5f) */
  if(pdOpt.sett && d.sett.length){
    heading("Nanna settimana per settimana", "Dalla revisione della settimana fatta dai genitori nel weekend: ore medie al giorno, notte più pisolini. Ore consigliate oggi per l’età: "+d.rg[0]+"–"+d.rg[1]+" ore nelle 24 ore ("+d.rg[2]+"). Confronti calcolati al momento della revisione: «Sett. prima» rispetto alla media delle 4 settimane precedenti (in linea entro mezz’ora), «Consigliato» rispetto alle ore consigliate.");
    const come = r=>r.come==="orari" ? [["orari","m"]].concat(r.orari?[[r.orari,"m"]]:[]) : [[r.come==="calcolata"?"dai giorni segnati":r.come==="stima"?"stima":(r.come||""),"m"]];
    table([{t:"Settimana",w:64},{t:"Ore medie",w:48},{t:"Come",w:66},{t:"Sett. prima",w:58},{t:"Consigliato",w:62},{t:"Ammalato",w:52},{t:"Da notare",w:CW-360}],
      d.sett.slice(0,26).map(r=>[[["dal "+shortDate(r._m),""]].concat(r.pending?[["sul telefono","m"]]:[]), r.ore!=null ? fmt(r.ore,1) : "non segnata", come(r), r.prima||"", r.cons||"", r.amm||"", r.nota||""]));
    if(d.sett.length>26) para("Mostrate le ultime 26 settimane su "+d.sett.length+".",{z:8.2, col:MUT});
  }

  /* asilo (28/10/2026) */
  if(sib && pdOpt.asilo && d.asW.length){
    heading("Asilo", "Giornate segnate dai genitori con quello che riferiscono le educatrici. Nanna all’asilo: media in minuti dei giorni segnati. Cacca: giorni con la cacca sui giorni segnati. Pappa: quanto ha mangiato di ogni piatto.");
    table([{t:"Settimana",w:64},{t:"Giorni",w:38},{t:"Nanna",w:46},{t:"Cacca",w:40},{t:"Umore",w:84},{t:"Cosa ha mangiato",w:CW-272}],
      d.asW.slice(0,26).map(w=>{
        const um={}; w.days.forEach(r=>{ const u=umoreOf(r.umore); if(u) um[u[0]]=(um[u[0]]||0)+1; });
        const pi={"tutto":[], "metà":[], "assaggi":[], "niente":[], "":[]}; w.days.forEach(r=>piattiOf(r).forEach(q=>pi[q.q||""].push(q.n)));
        const cibo=[["tutto","tutto"],["metà","metà"],["assaggi","assaggi"],["niente","non mangiato"],["","quantità non segnata"]].filter(([k])=>pi[k].length).map(([k,l])=>[l+": "+pi[k].join(", "),""]);
        return [[["dal "+shortDate(w._m),""]].concat(w.days.some(r=>r.pending)?[["sul telefono","m"]]:[]), String(w.n),
          w.nanna ? fmt(Math.round(w.nanna.avg),0)+" min" : "–", w.cacca ? w.cacca.si+"/"+w.cacca.n : "–",
          Object.entries(um).map(e=>e[0]+(e[1]>1?" ("+e[1]+")":"")).join(", ") || "–", cibo.length ? cibo : "non segnato"]; }));
    if(d.asW.length>26) para("Mostrate le ultime 26 settimane su "+d.asW.length+".",{z:8.2, col:MUT});
  }

  /* diario salute */
  if(pdOpt.diario && d.sal.length){
    heading("Note di salute dal diario", "Scritte dai genitori nel diario dell’app, dalla più recente.");
    d.sal.forEach(n=>{ ensure(30); T(dateIt(n._d)+", "+pad(n._d.getHours())+":"+pad(n._d.getMinutes()), M, y-9.5, FB, 9.5, INK); y-=14; para(n.testo,{z:10, x:M+10}); y-=5; });
  }

  /* tappe */
  if(sib && pdOpt.tappe){
    heading("Tappe di sviluppo raggiunte", "Elenco delle tappe CDC/AAP 2022 (Zubler et al., Pediatrics 2022): cose che fa almeno 3 bambini su 4 a quell’età. Spuntate dai genitori, con il giorno in cui le hanno notate.");
    if(!d.raggiunte.length) para("Nessuna tappa segnata finora.",{col:MUT});
    ETA_SV.forEach(a=>{
      const l = d.raggiunte.filter(x=>x.t.m===a); if(!l.length) return;
      ensure(36); y-=4; T(a+" mesi  ·  "+l.length+" di "+TAPPE.filter(t=>t.m===a).length, M, y-10, FB, 10, ACC); y-=16;
      AREE_SV.forEach(([ar,al])=>{ l.filter(x=>x.t.ar===ar).forEach(x=>{
        const dd = dayFromKey(x.r.day), extra = [al, dd?"il "+shortDate(dd):"", x.r.note].filter(Boolean).join(" · ");
        const lines = wrap(x.t.t, F, 9.6, CW-14), ex = wrap(extra, F, 8.2, CW-14);
        ensure(lines.length*12.6 + ex.length*10.5 + 4);
        T("•", M+2, y-9.6, F, 9.6, ACC); lines.forEach((ln,i)=>T(ln, M+14, y-9.6-i*12.6, F, 9.6)); y -= lines.length*12.6;
        ex.forEach((ln,i)=>T(ln, M+14, y-8.2-i*10.5, F, 8.2, MUT)); y -= ex.length*10.5 + 4;
      }); });
    });
  }
  if(sib && pdOpt.nonsegn && d.mancano.length){
    heading("Tappe dei "+d.age+" mesi non ancora segnate", "Tappe dell’età attuale che i genitori non hanno ancora spuntato. Può voler dire anche solo che non sono state notate o segnate: è un promemoria per parlarne, non una valutazione.");
    d.mancano.forEach(t=>{ const lines=wrap(t.t, F, 9.6, CW-14); ensure(lines.length*12.6+12);
      T("–", M+2, y-9.6, F, 9.6, MUT); lines.forEach((ln,i)=>T(ln, M+14, y-9.6-i*12.6, F, 9.6)); y -= lines.length*12.6;
      T(areaSv(t.ar), M+14, y-8.2, F, 8.2, MUT); y -= 14; });
  }

  /* appuntamenti */
  if(pdOpt.app && d.app.length){
    heading("Prossimi appuntamenti");
    table([{t:"Data",w:70},{t:"Tipo",w:62},{t:"Che cosa",w:170},{t:"Entro",w:66},{t:"Stato",w:CW-368}],
      d.app.map(a=>[shortDate(a._d), tipoLabel(a.tipo), [[a.titolo||"",""]].concat(a.luogo?[[a.luogo,"m"]]:[]), a._e?shortDate(a._e):"", a.stato||""]));
  }

  /* piè di pagina */
  const n = doc.getPageCount();
  doc.getPages().forEach((p,i)=>{
    p.drawLine({start:{x:M,y:M+14}, end:{x:PW-M,y:M+14}, thickness:.5, color:LINE});
    const ft = clean("Casa Bambini · dati inseriti dai genitori, non una cartella clinica · "+dateIt(now));
    p.drawText(ft,{x:M, y:M, size:7.8, font:F, color:MUT});
    const pg = "pag. "+(i+1)+" di "+n; p.drawText(pg,{x:PW-M-F.widthOfTextAtSize(pg,7.8), y:M, size:7.8, font:F, color:MUT});
  });
  return await doc.save();
}

async function pdDownload(){
  if(pdBusy) return;
  const c=S.child; pdBusy=true; pdErr=""; pdMsg=""; render();
  try{
    const dl = await window.claude?.use?.("downloads");
    if(!dl) throw {code:"unavailable"};
    const bytes = await pdBuild(c);
    const name = "Riepilogo pediatra - "+c+" - "+dayKey(new Date())+".pdf";
    await dl.save({filename:name, data:new Blob([bytes],{type:"application/pdf"})});
    pdMsg = "PDF pronto: "+name;
  }catch(e){
    const code = (e && e.code) || "";
    pdErr = code==="declined" ? "" :
      code==="lib" ? "Non riesco a caricare lo strumento per creare il PDF: controlla la connessione e riprova." :
      code==="rate_limited" ? "C’è già una richiesta di salvataggio aperta: rispondi a quella, poi riprova." :
      code==="too_large" ? "Il PDF è troppo grande per questa destinazione: prova senza grafici." :
      (code==="unavailable"||code==="not_granted"||code==="capability_disabled"||code==="capability_removed"||code==="extension_not_enabled") ? "In questa vista non si può scaricare il file: apri l’app dal link in claude.ai o dall’app Claude." :
      "Qualcosa non ha funzionato nel creare il PDF. Riprova; se capita ancora, prova a togliere i grafici.";
    if(code==="declined") pdMsg = "Salvataggio annullato.";
  }
  pdBusy=false; render();
}

function viewSoon(title, phase, text){
  return '<h2>'+title+'</h2><div class="panel"><p class="lead">'+text+'</p><p class="lead" style="margin-top:8px">Arriva nella '+phase+'.</p></div>';
}

function viewImpostazioni(){
  const q=pendingCount();
  const qTxt = [[S.queue.length,"misura","misure"],[S.qs.sonno.length,"nanna","nanne"],[S.qs.diario.length,"nota","note"],[S.qs.attivita.length,"attività","attività"],[S.qs.sviluppo.length,"tappa","tappe"],[S.qs.appunt.length,"appuntamento","appuntamenti"],[S.qs.salute.length,"dato di salute","dati di salute"],[Object.keys(S.qs.allerg).length,"nota allergie","note allergie"],[S.qs.sett.length,"settimana","settimane"],[S.qs.asilo.length,"giornata d’asilo","giornate d’asilo"]].filter(x=>x[0]).map(x=>plural(x[0],x[1],x[2])).join(", ");
  let h = '<h2>Foglio Google</h2><div class="panel">';
  if(net.state==="error"||net.state==="offline"){
    h += '<div class="notice"><p>'+esc(net.msg)+'</p>'+
      (net.code==="not_in_manifest"?'<p><button class="btn small" id="perm">Apri i permessi</button></p>':'')+
      (net.code==="approval_required"?'<p><button class="btn small" id="sync2">Consenti e sincronizza</button></p>':'')+
      '</div>';
  }
  h += '<dl class="kv">'+
    '<dt>Stato</dt><dd>'+(syncing?"Sincronizzo…":net.state==="ok"?"Collegato":net.state==="connecting"?"In collegamento…":"Non collegato")+'</dd>'+
    '<dt>Ultimo aggiornamento</dt><dd>'+(S.lastSync? esc(shortDate(new Date(S.lastSync))+", "+timeOf(S.lastSync)) : "mai")+'</dd>'+
    '<dt>In attesa</dt><dd>'+(q?esc(qTxt):"niente")+'</dd>'+
    '<dt>Nanna e diario</dt><dd>'+plural(S.sonno.length,"riga","righe")+' di nanna, '+plural(S.diario.length,"nota","note")+' nel diario</dd>'+
    '<dt>Attività</dt><dd>'+plural(S.attiv.length,"attività fatta","attività fatte")+'</dd>'+
    '<dt>Sviluppo</dt><dd>'+plural(svCount(svilMap("Sibilla"),null).done,"tappa raggiunta","tappe raggiunte")+' da Sibilla</dd>'+
    '<dt>Appuntamenti</dt><dd>'+plural(S.app.filter(a=>!AP_CHIUSI.includes(String(a.stato).toLowerCase())).length,"aperto","aperti")+' nel foglio</dd>'+
    '<dt>Salute</dt><dd>'+plural(S.salute.length,"riga","righe")+' nel foglio</dd>'+
    '<dt>Settimane</dt><dd>'+plural(S.sett.length,"revisione","revisioni")+' nel foglio</dd>'+
    '<dt>Asilo</dt><dd>'+plural(S.asilo.length,"giornata","giornate")+' nel foglio</dd>'+
    '<dt>Dati di Edo</dt><dd>'+(S.edo? plural((S.edo.mis||[]).length,"missione","missioni")+", "+plural((S.edo.err||[]).length,"errore","errori")+", "+plural((S.edo.gio||[]).length,"sessione","sessioni")+" di gioco" : "non ancora letti")+'</dd>'+
    '<dt>Foglio</dt><dd><a href="'+SHEET_URL+'" target="_blank" rel="noopener">(FAB) Bambini – Database app</a></dd>'+
  '</dl><p style="margin:16px 0 0"><button class="btn full" id="sync" '+(syncing?"disabled":"")+'>Sincronizza ora</button></p></div>';

  h += '<h2>Bambini</h2><div class="panel"><dl class="kv">'+
    CHILDREN.map(c=>{ const b=birthOf(c); return '<dt>'+c+'</dt><dd>'+(b? "nato"+(c==="Sibilla"?"a":"")+" il "+b.getDate()+" "+MESI[b.getMonth()]+" "+b.getFullYear() : "data non letta")+'</dd>'; }).join("")+
    '</dl><p class="lead" style="font-size:14px;margin:12px 0 0">Le date di nascita si cambiano nel foglio, scheda Bambini.</p></div>';

  h += '<h2>Versione</h2><div class="panel"><p class="lead" style="margin:0">Sviluppo completato il 25 ottobre 2026 (blocco 5f); asilo di Sibilla aggiunto il 28 ottobre 2026. Per correzioni o idee nuove: una chat nel progetto «FABIO – Bambini» con il file di progetto.</p></div>';
  return h;
}

function render(){
  document.documentElement.dataset.child = S.child;
  renderHead(); renderNav();
  let h="";
  if(tab==="oggi") h=viewOggi();
  else if(tab==="crescita") h=viewCrescita();
  else if(tab==="nanna") h=viewNanna();
  else if(tab==="diario") h=viewDiario();
  else if(tab==="attivita") h=viewArchivio();
  else if(tab==="sviluppo") h=viewSviluppo();
  else if(tab==="ambiente") h=viewAmbiente();
  else if(tab==="pediatra") h=viewPediatra();
  else if(tab==="salute") h=viewSalute();
  else if(tab==="settimana") h=viewSettimana();
  else if(tab==="riepilogo") h=viewRiepilogo();
  else h=viewImpostazioni();
  // conserva i valori del modulo durante i ridisegni
  const keep = {}; ["f-data","f-peso","f-alt","f-cc","f-dove","f-note","n-note","d-testo","d-data","d-foto","a-dur","a-note","t-data","t-note","p-tit","p-data","p-luogo","p-note","h-cosa","h-data","h-temp","h-det","h-note","h-all","r-letto","r-sveglia","r-nota"].forEach(id=>{ const el=$(id); if(el) keep[id]=el.value; });
  $("main").innerHTML = h;
  Object.keys(keep).forEach(id=>{ const el=$(id); if(el) el.value=keep[id]; });
  renderSheet();
}

