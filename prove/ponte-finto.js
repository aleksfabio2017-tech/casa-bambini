/* Ponte finto per le prove: sostituisce fetch() e si comporta come apps-script/Code.gs.
   Il "foglio" sta in localStorage (chiave prova-foglio), così sopravvive ai ricaricamenti. */
(function(){
  const SCHEDE = {"Bambini":true,"Crescita":true,"Sonno":true,"Diario":true,"Attività":true,"Sviluppo":true,
    "Appuntamenti":true,"Salute":true,"Asilo":true,"Settimane":true,
    "Edo - Missioni":false,"Edo - Errori":false,"Edo - Giochi":false,"Edo - Uso":false};
  const TOKEN = "prova-prova-prova-prova-prova-prova-1234";
  const leggiStato = ()=>JSON.parse(localStorage.getItem("prova-foglio") || '{"schede":{},"chiamate":[]}');
  const scriviStato = s=>localStorage.setItem("prova-foglio", JSON.stringify(s));
  const conf = ()=>JSON.parse(localStorage.getItem("prova-config") || "{}");
  const col = l=>{ let n=0; for(const ch of l) n=n*26+(ch.charCodeAt(0)-64); return n-1; };
  function rng(r){
    const m = String(r).match(/^(?:'((?:[^']|'')+)'|([^'!:]+))!([A-Z]+)(\d*)(?::([A-Z]+)(\d*))?$/);
    if(!m) return null;
    return {scheda: m[1]!==undefined ? m[1].replace(/''/g,"'") : m[2], c1:col(m[3]), r1:m[4]?Number(m[4]):1, c2:m[5]?col(m[5]):col(m[3])};
  }
  const err = (codice)=>({ok:false, codice, errore:codice});
  function esegui(b){
    const c = conf();
    if(b.token!==TOKEN) return err("token_errato");
    const r = rng(b.range); if(!r) return err("range_non_valido");
    if(!(r.scheda in SCHEDE)) return err("scheda_non_ammessa");
    const st = leggiStato();
    st.chiamate.push({azione:b.azione, range:b.range, righe:(b.valori||[]).length});
    const mancanti = c.mancanti || [];
    if(mancanti.includes(r.scheda)){ scriviStato(st); return err("errore_foglio"); }
    const sh = st.schede[r.scheda] = st.schede[r.scheda] || [];   /* sh[0] = riga 1 (intestazione) */
    let out;
    if(b.azione==="leggi"){
      let v = sh.slice(r.r1-1).map(x=>{ const y=(x||[]).slice(r.c1, r.c2+1); while(y.length && (y[y.length-1]===""||y[y.length-1]==null)) y.pop(); return y; });
      while(v.length && !v[v.length-1].length) v.pop();
      out = {ok:true, range:b.range, valori:v};
    }else{
      if(!SCHEDE[r.scheda]){ scriviStato(st); return err("sola_lettura"); }
      if(!Array.isArray(b.valori) || !b.valori.length) return err("valori_non_validi");
      if(c.scritturaFallisce){ scriviStato(st); return err("errore_foglio"); }
      if(b.azione==="aggiungi"){ if(!sh.length) sh.push(["intestazione"]); b.valori.forEach(x=>sh.push(x.slice())); }
      else b.valori.forEach((x,i)=>{ const row = sh[r.r1-1+i] = (sh[r.r1-1+i]||[]).slice(); x.forEach((v,j)=>{ while(row.length<r.c1+j) row.push(""); row[r.c1+j]=v; }); });
      out = {ok:true, range:b.range, righe:b.valori.length, celle:0};
    }
    scriviStato(st); return out;
  }
  window.fetch = async (url, opt)=>{
    if(conf().rete===false) throw new TypeError("Failed to fetch");
    let b; try{ b = JSON.parse(opt.body); }catch(e){ return new Response("<html>login</html>", {status:200}); }
    await new Promise(r=>setTimeout(r, 5));
    return new Response(JSON.stringify(esegui(b)), {status:200, headers:{"Content-Type":"application/json"}});
  };
  window.__PROVA_TOKEN = TOKEN;
})();
