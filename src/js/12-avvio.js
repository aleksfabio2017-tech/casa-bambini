/* ---------- avvio ---------- */
(function start(){
  const h = (location.hash||"").replace("#","");
  if(TABS.some(x=>x[0]===h) || h==="impostazioni" || h==="attivita" || h==="sviluppo" || h==="ambiente" || h==="pediatra" || h==="settimana" || h==="riepilogo") tab=h;
  render();
  if(!(window.claude && typeof window.claude.use==="function")){
    net={state:"offline",code:"not_granted",msg:errInfo({code:"not_granted"}).msg}; render(); return;
  }
  window.claude.use("permissions").then(p=>{ perms=p; }).catch(()=>{});
  window.claude.use("mcp").then(m=>{
    mcp = m;
    if(!mcp){ net={state:"offline",code:"not_granted",msg:errInfo({code:"not_granted"}).msg}; render(); return; }
    sync(false);
  }).catch(()=>{ net={state:"offline",code:"not_granted",msg:errInfo({code:"not_granted"}).msg}; render(); });
  setInterval(()=>{ if(!document.hidden && mcp && S.child==="Edoardo") sync(false); }, 5*60000);
  document.addEventListener("visibilitychange", ()=>{ if(document.hidden || !mcp) return;
    if(pendingCount() || !S.edo || Date.now()-S.edo.at > 10*60000) sync(false); });
})();
})();
