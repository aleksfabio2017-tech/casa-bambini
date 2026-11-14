/* ---------- eventi ---------- */
document.addEventListener("click", e=>{
  if(e.target.closest("[data-shclose]")){ closeSheet(); return; }
  const t = e.target.closest("button, a"); if(!t) return;
  if(t.id==="fab"){ openSheet(); return; }
  if(t.dataset.attdet){ attDet = t.dataset.attdet==="1"; render(); return; }
  if(t.dataset.asdet){ asDet = t.dataset.asdet==="1"; render(); if(asDet){ const el=$("asilo"); if(el) el.scrollIntoView({block:"start", behavior:"smooth"}); } return; }
  if(t.dataset.umday){ umSel = umSel===t.dataset.umday ? null : t.dataset.umday; render(); return; }
  if(t.dataset.umset){ const x=t.dataset.umset.split("|"); setUmore(S.child, x[0], Number(x[1])); return; }
  if(t.dataset.rwgo!==undefined){ rwOff=Number(t.dataset.rwgo)||0; go("riepilogo"); return; }
  if(t.dataset.rw){ umSel=null; rwOff=Math.min(0, rwOff+Number(t.dataset.rw)); render(); window.scrollTo(0,0); return; }
  if(t.dataset.scroll){ const el=$(t.dataset.scroll); if(el) el.scrollIntoView({block:"start", behavior:"smooth"}); return; }
  if(t.dataset.add){ addAction(t.dataset.add); return; }
  if(t.dataset.pzday){ pzDay=t.dataset.pzday; render(); return; }
  if(t.dataset.pzstep){ pzVal=Math.min(6, Math.max(0.5, pzVal + 0.5*Number(t.dataset.pzstep))); render(); return; }
  if(t.id==="pz-save"){ addPisolino(); return; }
  if(t.id==="pz-back"){ shMode=""; render(); const b=document.querySelector("#sheet .shbtn"); if(b) b.focus(); return; }
  if(t.dataset.asn!==undefined && asF){ asF.nanna = t.dataset.asn==="x" ? null : Number(t.dataset.asn); asF.err=""; render(); return; }
  if(t.dataset.asstep && asF){ asF.nanna=Math.min(240, Math.max(0, (asF.nanna||0) + 5*Number(t.dataset.asstep))); render(); return; }
  if(t.dataset.asc!==undefined && asF){ asF.cacca=t.dataset.asc; asF.err=""; render(); return; }
  if(t.dataset.asq && asF){ const x=t.dataset.asq.split("|"), pp=asF.piatti[Number(x[0])]; if(pp) pp.q = pp.q===x[1] ? "" : x[1]; render(); return; }
  if(t.id==="as-add" && asF){ if(asF.piatti.length<6) asF.piatti.push({n:"",q:""}); render(); const el=$("as-p"+(asF.piatti.length-1)); if(el) el.focus(); return; }
  if(t.dataset.asu && asF){ asF.umore = asF.umore===t.dataset.asu ? "" : t.dataset.asu; asF.err=""; render(); return; }
  if(t.id==="as-dia" && asF){ asF.diario=!asF.diario; asF.err=""; render(); return; }
  if(t.id==="as-save"){ addAsilo(); return; }
  if(t.id==="as-back"){ asF=null; shMode=""; render(); const b=document.querySelector("#sheet .shbtn"); if(b) b.focus(); return; }
  if(t.dataset.asnota && rv){ const x=asiloSummary(rv.c, dayFromKey(rv.mon)); if(x && !rv.nota.includes(x)) rv.nota = (rv.nota.trim() ? rv.nota.trim()+" " : "") + x; rv.nota=rv.nota.slice(0,500); render(); const el=$("r-nota"); if(el) el.scrollIntoView({block:"center"}); return; }
  if(t.dataset.rvmode){ rv.mode=t.dataset.rvmode; rv.err=""; render(); return; }
  if(t.dataset.rvstep){ rv.ore=Math.min(24, Math.max(0, rv.ore + 0.5*Number(t.dataset.rvstep))); render(); return; }
  if(t.dataset.rvamm){ rv.amm=t.dataset.rvamm; rv.err="";
    if(rv.amm==="sì" && !epWeek(rv.c, dayFromKey(rv.mon)).length){ hForm="malattia"; hCosa="Raffreddore"; hEp=""; hErr=""; hVk=""; }
    render(); return; }
  if(t.dataset.rvtap){ const id=t.dataset.rvtap; rv.tappe = rv.tappe.includes(id) ? rv.tappe.filter(x=>x!==id) : rv.tappe.concat([id]); render(); return; }
  if(t.dataset.rvvoto){ rv.voto=Number(t.dataset.rvvoto); render(); return; }
  if(t.id==="rv-next"){ rvNext(); return; }
  if(t.id==="rv-back"){ rv.step=Math.max(1, rv.step-1); rv.err=""; hForm=""; render(); rvTop(); return; }
  if(t.id==="rv-save"){ rvSave(); return; }
  if(t.dataset.delw){ S.qs.sett = S.qs.sett.filter(q=>q.id!==t.dataset.delw); rv=null; save(); toast("Revisione eliminata"); render(); return; }
  if(t.dataset.child){ setChild(t.dataset.child); return; }
  if(t.dataset.go){ go(t.dataset.go); return; }
  if(t.dataset.metric){ metric=t.dataset.metric; render(); return; }
  if(t.dataset.per!==undefined){ S.per=Number(t.dataset.per)||0; save(); render(); return; }
  if(t.dataset.del){ removePending(t.dataset.del); return; }
  if(t.dataset.dels){ removeQueued("sonno", t.dataset.dels); return; }
  if(t.dataset.deld){ removeQueued("diario", t.dataset.deld); return; }
  if(t.dataset.nanna){ nDay=t.dataset.nanna; nVal=null; nErr=""; go("nanna"); return; }
  if(t.dataset.nday){ const k=t.dataset.nday; nDay = k==="altro" ? (nDay!=="ieri"&&nDay!=="oggi" ? nDay : dayKey(dayStart(2))) : k; nVal=null; nErr=""; render(); return; }
  if(t.dataset.nstep){ const map=sonnoDays(S.child); nVal=Math.min(24, Math.max(0, nShown(map) + 0.5*Number(t.dataset.nstep))); nErr=""; render(); return; }
  if(t.id==="n-save"){ addSonno(); if(!nErr && $("n-note")) $("n-note").value=""; render(); return; }
  if(t.dataset.dcat){ dCat=t.dataset.dcat; render(); return; }
  if(t.dataset.dfil){ dFilter=t.dataset.dfil; render(); return; }
  if(t.id==="d-save"){ if(addDiario()){ ["d-testo","d-foto"].forEach(id=>{ const el=$(id); if(el) el.value=""; }); const el=$("d-data"); if(el){ const n=new Date(); el.value=n.getFullYear()+"-"+pad(n.getMonth()+1)+"-"+pad(n.getDate())+"T"+pad(n.getHours())+":"+pad(n.getMinutes()); } } return; }
  if(t.id==="f-save"){ addMeasure(); if(!formError) ["f-peso","f-alt","f-cc","f-note"].forEach(id=>{ const el=$(id); if(el) el.value=""; }); render(); return; }
  if(t.id==="a-open"){ aOpen=true; aVoto=0; aErr=""; render(); const el=$("a-dur"); if(el) el.closest(".afatta").scrollIntoView({block:"center"}); return; }
  if(t.id==="a-cancel"){ aOpen=false; aVoto=0; aErr=""; render(); return; }
  if(t.id==="a-altra"){ attAltra(); return; }
  if(t.dataset.avoto){ aVoto=Number(t.dataset.avoto); aErr=""; render(); return; }
  if(t.id==="a-save"){ addAttivita(); return; }
  if(t.dataset.apick){ attScegli(t.dataset.apick); return; }
  if(t.dataset.topen){ const id=t.dataset.topen, tp=TAPPE.find(x=>x.id===id); if(tp && svilMap(S.child)[tp.t]) return; tOpen = tOpen===id ? null : id; tErr=""; render(); const el=$("t-data"); if(el) el.closest(".tform").scrollIntoView({block:"nearest"}); return; }
  if(t.id==="t-save"){ addTappa(t.dataset.tid); return; }
  if(t.id==="t-cancel"){ tOpen=null; tErr=""; render(); return; }
  if(t.dataset.toff){ togliTappa(t.dataset.toff); return; }
  if(t.dataset.sage){ sAge=Number(t.dataset.sage); tOpen=null; tErr=""; render(); return; }
  if(t.dataset.sact){ arF=fasciaOf(S.child); arM="tutti"; arA=t.dataset.sact; go("attivita"); return; }
  if(t.dataset.ambf){ ambF=Number(t.dataset.ambf); render(); return; }
  if(t.dataset.arf!==undefined){ arF=Number(t.dataset.arf); render(); return; }
  if(t.dataset.arm){ arM=t.dataset.arm; render(); return; }
  if(t.dataset.ara){ arA=t.dataset.ara; render(); return; }
  if(t.id==="p-open"){ pOpen=true; pErr=""; render(); const el=$("p-tit"); if(el){ el.closest(".tform").scrollIntoView({block:"center"}); } return; }
  if(t.id==="p-cancel"){ pOpen=false; pErr=""; render(); return; }
  if(t.dataset.ptipo){ pTipo=t.dataset.ptipo; render(); return; }
  if(t.id==="p-save"){ addAppunt(); return; }
  if(t.dataset.delp){ S.qs.appunt = S.qs.appunt.filter(q=>q.id!==t.dataset.delp); save(); toast("Appuntamento eliminato"); render(); return; }
  if(t.dataset.pdper){ pdPer=t.dataset.pdper; pdMsg=""; render(); return; }
  if(t.dataset.pdopt){ const k=t.dataset.pdopt; pdOpt[k]=!pdOpt[k]; pdMsg=""; render(); return; }
  if(t.id==="pd-go"){ pdDownload(); return; }
  if(t.dataset.hform){ const k=t.dataset.hform, op=episodi(S.child).filter(e=>e.open); hForm=k; hErr=""; hVk=""; hCosa = k==="malattia"?"Raffreddore":k==="visita"?"Pediatra":"";
    hEp = t.dataset.hepto!==undefined ? t.dataset.hepto : (op[0] ? op[0].id : ""); render(); const el=document.querySelector(".hform"); if(el) el.scrollIntoView({block:"center"}); return; }
  if(t.dataset.hcosa){ hCosa=t.dataset.hcosa; hErr=""; render(); return; }
  if(t.dataset.hep!==undefined){ hEp=t.dataset.hep; render(); return; }
  if(t.dataset.hguar){ hForm="guarito"; hEp=t.dataset.hguar; hErr=""; render(); return; }
  if(t.dataset.hvk){ hForm="vaccino"; hVk=t.dataset.hvk; hErr=""; hCal = hCal || !vaccList(S.child).some(v=>v.k===hVk && v.st==="dafare"); render(); const el=$("h-data"); if(el) el.closest(".hform").scrollIntoView({block:"center"}); return; }
  if(t.id==="h-nd"){ const on=t.getAttribute("aria-pressed")!=="true"; t.setAttribute("aria-pressed", String(on)); const bx=t.querySelector(".bx"); if(bx) bx.textContent = on?"✓":""; return; }
  if(t.id==="h-save"){ if(addSalute()){ ["h-cosa","h-temp","h-det","h-note","h-data"].forEach(id=>{ const el=$(id); if(el) el.value=""; }); render(); } return; }
  if(t.id==="h-cancel"){ hForm=""; hErr=""; hVk=""; ["h-cosa","h-temp","h-det","h-note","h-data"].forEach(id=>{ const el=$(id); if(el) el.value=""; }); render(); return; }
  if(t.id==="h-cal"){ hCal=!hCal; if(!hCal && hForm==="vaccino"){ hForm=""; hVk=""; } render(); return; }
  if(t.id==="h-allhist"){ hAll=!hAll; render(); return; }
  if(t.id==="h-alledit"){ hAllEdit=true; render(); const el=$("h-all"); if(el) el.focus(); return; }
  if(t.id==="h-allcancel"){ hAllEdit=false; render(); return; }
  if(t.id==="h-allsave"){ saveAllergie(); return; }
  if(t.id==="h-app"){ pOpen=true; pTipo="visita"; go("oggi"); return; }
  if(t.dataset.delh){ const id=t.dataset.delh; S.qs.salute = S.qs.salute.filter(q=>q.id!==id && q.ep!==id); save(); toast("Eliminato"); render(); return; }
  if(t.id==="sync"||t.id==="sync2"){ sync(true); return; }
  if(t.id==="perm"){ openPerms(); return; }
});

document.addEventListener("input", e=>{
  if(e.target && e.target.id==="pd-q"){ S.pdq[S.child] = e.target.value.slice(0,1000); save(); }
  if(e.target && e.target.id==="r-nota" && rv){ rv.nota = e.target.value.slice(0,500); }
  if(e.target && e.target.dataset && e.target.dataset.asp!==undefined && asF){ const pp=asF.piatti[Number(e.target.dataset.asp)]; if(pp) pp.n = e.target.value.slice(0,80); }
  if(e.target && e.target.id==="as-note" && asF){ asF.note = e.target.value.slice(0,300); }
});

document.addEventListener("keydown", e=>{ if(e.key==="Escape" && shOpen) closeSheet(); });

document.addEventListener("change", e=>{
  if(e.target && (e.target.id==="r-letto" || e.target.id==="r-sveglia") && rv){ if(e.target.value){ rv[e.target.id==="r-letto"?"letto":"sveglia"] = e.target.value; } render(); return; }
  if(e.target && e.target.id==="as-day" && asF){ const v=e.target.value; if(dayFromKey(v)){ if(asiloMap(S.child)[v] || asF.had) asInit(S.child, v); else asF.day=v; asF.err=""; render(); } return; }
  if(e.target && e.target.id==="n-day"){ const v=e.target.value; if(dayFromKey(v)){ nDay=v; nVal=null; nErr=""; render(); } }
});

