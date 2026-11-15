/* ---------- collegamento al foglio ---------- */
function errInfo(e){
  const code = (e && e.code) || "errore_ponte";
  const det = e && e.message ? e.message : "";
  const app = "Il ponte ha rifiutato la richiesta ("+code+"): va aggiornato il ponte o l'app. I dati restano sul telefono.";
  const map = {
    ponte_mancante:"Manca il collegamento al foglio: inserisci qui sotto l'indirizzo del ponte e la chiave.",
    senza_rete:"Il telefono è senza rete. I dati restano qui e partono quando torna la connessione.",
    rete:"Il foglio non è raggiungibile (rete assente o instabile). I dati restano sul telefono e partono alla prossima sincronizzazione.",
    tempo_scaduto:"Il foglio ci mette troppo a rispondere. I dati restano sul telefono e partono alla prossima sincronizzazione.",
    token_errato:"La chiave non è giusta: controllala qui sotto. Se è stata cambiata, inserisci quella nuova.",
    ponte_non_configurato:"Il ponte non ha ancora la sua chiave: va messa in Apps Script, Proprietà dello script, voce TOKEN.",
    risposta_non_valida:"Il ponte ha risposto con una pagina invece che con i dati: controlla l'indirizzo (deve finire con /exec) e che il deployment abbia accesso «Chiunque».",
    ponte_http:"Il ponte ha risposto con un errore"+(det?" (HTTP "+det+")":"")+": controlla l'indirizzo. I dati restano sul telefono.",
    errore_foglio:"Google Sheets ha dato un errore"+(det?": "+det:"")+". I dati restano sul telefono e partono alla prossima sincronizzazione.",
    json_non_valido:app, azione_non_ammessa:app, range_non_valido:app, scheda_non_ammessa:app,
    sola_lettura:app, valori_non_validi:app, troppi_dati:app
  };
  return {code, msg: map[code] || "Collegamento al foglio non riuscito. I dati restano sul telefono e partono alla prossima sincronizzazione."};
}
async function read(range){ return await dati.leggi(range); }
/* Scrive righe nuove: su scheda vuota la prima va in riga 2 (già formattata), le altre in coda */
async function pushRows(sheet, lastCol, hasData, vals){
  if(!vals.length) return;
  if(!hasData){
    await dati.aggiorna(sheet+"!A2:"+lastCol+"2", [vals[0]]);
    if(vals.length>1) await dati.aggiungi(sheet+"!A1:"+lastCol+"1", vals.slice(1));
  }else{
    await dati.aggiungi(sheet+"!A1:"+lastCol+"1", vals);
  }
}
async function sync(manual){
  if(syncing) return;
  if(!ponteOk()){ net={state:"offline",code:"ponte_mancante",msg:errInfo({code:"ponte_mancante"}).msg}; render(); if(manual) toast("Imposta prima il collegamento al foglio"); return; }
  syncing = true; net = Object.assign({}, net, {state:"syncing"}); render();
  let sent = 0;
  try{
    const bam = await read("Bambini!A2:E");
    /* allergie e note (blocco 5d): colonna E, una cella per bambino; vale l'ultima scritta */
    for(const c of Object.keys(S.qs.allerg)){
      const i = bam.findIndex(r=>r && r[0]===c);
      if(i<0){ delete S.qs.allerg[c]; continue; }
      await dati.aggiorna("Bambini!E"+(i+2), [[S.qs.allerg[c].text]]);
      bam[i][4] = S.qs.allerg[c].text; delete S.qs.allerg[c]; sent++; save();
    }
    S.allerg = {}; bam.forEach(r=>{ if(r && CHILDREN.includes(r[0])) S.allerg[r[0]] = String(r[4]||""); });
    bam.forEach(r=>{ if(CHILDREN.includes(r[0]) && r[1]) S.births[r[0]] = String(r[1]); if(CHILDREN.includes(r[0]) && r[2]){ S.sex=S.sex||{}; S.sex[r[0]]=String(r[2]).trim(); } });
    /* Crescita */
    const cre = (await read("Crescita!A2:I")).filter(r=>r && r[0]);
    let rows = cre.map(fromSheet);
    const ids = new Set(rows.map(r=>r.id));
    const pending = S.queue.filter(q=>!ids.has(q.id));
    await pushRows("Crescita", "I", cre.length>0, pending.map(toSheet));
    rows = rows.concat(pending.map(q=>Object.assign({}, q, {origine:"app-genitori"})));
    sent += pending.length;
    S.rows = rows; S.queue = []; save();
    /* Sonno: un valore al giorno, vale la riga più recente */
    const son = (await read("Sonno!A2:F")).filter(r=>r && r[0]);
    const sIds = new Set(son.map(r=>r[0]));
    const sPend = S.qs.sonno.filter(q=>!sIds.has(q.id));
    await pushRows("Sonno", "F", son.length>0, sPend.map(sonnoToSheet));
    sent += sPend.length;
    S.sonno = son.map((r,i)=>{ const d=parseDate(r[1]); return {id:r[0], day:d?dayKey(d):"", bambino:r[2]||"", ore:num(r[3]), note:r[4]||"", origine:r[5]||"", i}; })
      .concat(sPend.map((q,k)=>Object.assign({}, q, {origine:"app-genitori", i:son.length+k})));
    S.qs.sonno = []; save();
    /* Diario */
    const dia = (await read("Diario!A2:G")).filter(r=>r && r[0]);
    const dIds = new Set(dia.map(r=>r[0]));
    const dPend = S.qs.diario.filter(q=>!dIds.has(q.id));
    await pushRows("Diario", "G", dia.length>0, dPend.map(diarioToSheet));
    sent += dPend.length;
    S.diario = dia.map(r=>({id:r[0], data:r[1]||"", bambino:r[2]||"", cat:r[3]||"", testo:r[4]||"", foto:r[5]||"", origine:r[6]||""}))
      .concat(dPend.map(q=>Object.assign({}, q, {origine:"app-genitori"})));
    S.qs.diario = []; save();
    /* Attività */
    const atv = (await read("Attività!A2:I")).filter(r=>r && r[0]);
    const aIds = new Set(atv.map(r=>r[0]));
    const aPend = S.qs.attivita.filter(q=>!aIds.has(q.id));
    await pushRows("Attività", "I", atv.length>0, aPend.map(attToSheet));
    sent += aPend.length;
    S.attiv = atv.map(r=>({id:r[0], data:r[1]||"", bambino:r[2]||"", titolo:r[3]||"", metodo:r[4]||"", durata:num(r[5]), voto:num(r[6]), note:r[7]||"", origine:r[8]||""}))
      .concat(aPend.map(q=>Object.assign({}, q, {origine:"app-genitori"})));
    S.qs.attivita = []; save();
    /* Sviluppo: vale l'ultima riga di ogni tappa ("tolta" in Note = spunta tolta) */
    const sv = (await read("Sviluppo!A2:G")).filter(r=>r && r[0]);
    const svIds = new Set(sv.map(r=>r[0]));
    const svPend = S.qs.sviluppo.filter(q=>!svIds.has(q.id));
    await pushRows("Sviluppo", "G", sv.length>0, svPend.map(svToSheet));
    sent += svPend.length;
    S.svil = sv.map((r,i)=>{ const d=parseDate(r[1]); return {id:r[0], day:d?dayKey(d):"", bambino:r[2]||"", area:r[3]||"", tappa:r[4]||"", note:r[5]||"", origine:r[6]||"", i}; })
      .concat(svPend.map((q,k)=>Object.assign({}, q, {origine:"app-genitori", i:sv.length+k})));
    S.qs.sviluppo = []; save();
    /* Appuntamenti (blocco 5b): li scrive Claude dalla chat insieme agli eventi sul calendario, o l'app */
    const ap = (await read("Appuntamenti!A2:J")).filter(r=>r && r[0]);
    const apIds = new Set(ap.map(r=>r[0]));
    const apPend = S.qs.appunt.filter(q=>!apIds.has(q.id));
    await pushRows("Appuntamenti", "J", ap.length>0, apPend.map(appToSheet));
    sent += apPend.length;
    S.app = ap.map(r=>({id:r[0], data:r[1]||"", bambino:r[2]||"", tipo:r[3]||"", titolo:r[4]||"", entro:r[5]||"", luogo:r[6]||"", note:r[7]||"", stato:r[8]||"", origine:r[9]||""}))
      .concat(apPend.map(q=>Object.assign({}, q, {origine:"app-genitori"})));
    S.qs.appunt = []; save();
    /* Salute (blocco 5d) */
    const sa = (await read("Salute!A2:J")).filter(r=>r && r[0]);
    const saIds = new Set(sa.map(r=>r[0]));
    const saPend = S.qs.salute.filter(q=>!saIds.has(q.id));
    await pushRows("Salute", "J", sa.length>0, saPend.map(saluteToSheet));
    sent += saPend.length;
    S.salute = sa.map((r,i)=>({id:r[0], data:r[1]||"", bambino:r[2]||"", tipo:r[3]||"", cosa:r[4]||"", det:r[5]||"", temp:num(r[6]), ep:r[7]||"", note:r[8]||"", origine:r[9]||"", i}))
      .concat(saPend.map(q=>Object.assign({}, q, {origine:"app-genitori"})));
    S.qs.salute = []; save();
    /* Asilo (28/10/2026): una riga per giornata, vale l'ultima */
    const as = (await read("Asilo!A2:J")).filter(r=>r && r[0]);
    const asIds = new Set(as.map(r=>r[0]));
    const asPend = S.qs.asilo.filter(q=>!asIds.has(q.id));
    await pushRows("Asilo", "J", as.length>0, asPend.map(asiloToSheet));
    sent += asPend.length;
    S.asilo = as.map((r,i)=>{ const d=parseDate(r[1]); return {id:r[0], day:d?dayKey(d):"", bambino:r[2]||"", nanna:num(r[3]), cacca:caccaNorm(r[4]), cibo:r[5]||"", quanto:r[6]||"", umore:r[7]||"", note:r[8]||"", origine:r[9]||"", i}; })
      .concat(asPend.map((q,k)=>Object.assign({}, q, {origine:"app-genitori", i:as.length+k})));
    S.qs.asilo = []; save();
    /* Settimane (blocco 5e): una riga per bambino e settimana, vale l'ultima */
    const se = (await read("Settimane!A2:L")).filter(r=>r && r[0]);
    const seIds = new Set(se.map(r=>r[0]));
    const sePend = S.qs.sett.filter(q=>!seIds.has(q.id));
    await pushRows("Settimane", "L", se.length>0, sePend.map(settToSheet));
    sent += sePend.length;
    S.sett = se.map((r,i)=>{ const d=parseDate(r[1]); return {id:r[0], mon:d?dayKey(d):"", bambino:r[2]||"", ore:num(r[3]), come:r[4]||"", orari:r[5]||"", prima:r[6]||"", cons:r[7]||"", amm:r[8]||"", voto:num(r[9]), nota:r[10]||"", origine:r[11]||"", i}; })
      .concat(sePend.map((q,k)=>Object.assign({}, q, {origine:"app-genitori", i:se.length+k})));
    S.qs.sett = []; S.lastSync = Date.now(); save();
    /* dati dell'app di Edo: solo lettura, mai scrittura */
    try{
      const mis = (await read("'Edo - Missioni'!A2:I")).filter(r=>r && r[0]);
      const err = (await read("'Edo - Errori'!A2:G")).filter(r=>r && r[0]);
      const gio = (await read("'Edo - Giochi'!A2:J")).filter(r=>r && r[0]);
      let uso = []; try{ uso = (await read("'Edo - Uso'!A2:F")).filter(r=>r && r[0]); }catch(e){}
      S.edo = {at:Date.now(),
        mis: mis.map(r=>[r[0], r[1]||"", r[2]||"", r[3]||"", r[4]||"", num(r[5]), num(r[6]), num(r[7]), r[8]||""]),
        err: err.map(r=>[r[0], r[1]||"", r[2]||"", r[3]||"", r[4]||"", r[5]||"", r[6]||""]),
        gio: gio.map(r=>[r[0], r[1]||"", r[2]||"", num(r[3]), num(r[4]), num(r[5]), r[6]||"", r[7]||"", r[8]||"", num(r[9])]),
        uso: uso.map(r=>[r[0], r[1]||"", num(r[2]), num(r[3]), num(r[4]), r[5]||""])};
      save();
    }catch(e){ if(!S.edo) throw e; }
    net = {state:"ok", code:null, msg:""};
    if(manual || sent) toast(sent ? plural(sent,"dato inviato","dati inviati")+" al foglio" : "Foglio sincronizzato");
  }catch(e){
    const info = errInfo(e);
    net = {state:"error", code:info.code, msg:info.msg};
    save();
  }finally{
    syncing = false; render();
  }
}

