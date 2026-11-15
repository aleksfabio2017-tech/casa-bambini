/* ---------- avvio ---------- */
(function start(){
  const h = (location.hash||"").replace("#","");
  if(TABS.some(x=>x[0]===h) || h==="impostazioni" || h==="attivita" || h==="sviluppo" || h==="ambiente" || h==="pediatra" || h==="settimana" || h==="riepilogo") tab=h;
  if(!ponteOk()){
    /* primo avvio sul dispositivo: si parte dalle Impostazioni per inserire ponte e chiave */
    tab = "impostazioni";
    net = {state:"offline", code:"ponte_mancante", msg:errInfo({code:"ponte_mancante"}).msg};
    render(); return;
  }
  render();
  sync(false);
})();
setInterval(()=>{ if(!document.hidden && ponteOk() && S.child==="Edoardo") sync(false); }, 5*60000);
document.addEventListener("visibilitychange", ()=>{ if(document.hidden || !ponteOk()) return;
  if(pendingCount() || !S.edo || Date.now()-S.edo.at > 10*60000) sync(false); });
window.addEventListener("online", ()=>{ if(ponteOk()) sync(false); });
window.addEventListener("offline", ()=>{ if(!syncing){ net = {state:"offline", code:"senza_rete", msg:errInfo({code:"senza_rete"}).msg}; render(); } });
})();
