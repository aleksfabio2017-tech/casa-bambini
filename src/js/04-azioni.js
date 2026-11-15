/* ---------- azioni ---------- */
function setChild(c){ S.child=c; save(); document.documentElement.dataset.child=c; render(); }
function go(t){ tab=t; tOpen=null; tErr=""; hForm=""; hErr=""; hVk=""; hAllEdit=false; pdMsg=""; pdErr=""; bkMsg=""; setErr=""; try{ history.replaceState(null,"","#"+t); }catch(e){} render(); $("main").focus({preventScroll:true}); window.scrollTo(0,0);
  if((t==="nanna"||t==="diario"||t==="oggi"||t==="attivita"||t==="sviluppo"||t==="pediatra"||t==="salute"||t==="settimana"||t==="riepilogo") && ponteOk() && !syncing && (!S.lastSync || Date.now()-S.lastSync > 2*60000)) sync(false); }

function addMeasure(){
  const v = id=>$(id) ? $(id).value : "";
  const when = v("f-data");
  const d = when ? new Date(when) : null;
  const peso = num(v("f-peso")), alt = num(v("f-alt")), cc = num(v("f-cc"));
  formError = "";
  if(!d || isNaN(d)) formError = "Indica la data della misura.";
  else if(d.getTime() > Date.now()+60000) formError = "La data è nel futuro: controllala.";
  else if(peso==null && alt==null && cc==null) formError = "Inserisci almeno peso, altezza o circonferenza.";
  else if(peso!=null && (peso<1 || peso>150)) formError = "Il peso va in chilogrammi, tra 1 e 150.";
  else if(alt!=null && (alt<30 || alt>220)) formError = "L'altezza va in centimetri, tra 30 e 220.";
  else if(cc!=null && (cc<25 || cc>65)) formError = "La circonferenza cranica va in centimetri, tra 25 e 65.";
  if(formError){ render(); const el=$("formerr"); if(el) el.scrollIntoView({block:"center"}); return; }
  const row = {id:"genitori-crescita-"+Date.now(), data:stamp(d), bambino:S.child, peso, altezza:alt, cc,
               dove:v("f-dove"), note:v("f-note").trim(), origine:"app-genitori"};
  S.queue.push(row); save();
  toast("Misura salvata");
  render();
  sync(false);
}
function removePending(id){
  S.queue = S.queue.filter(q=>q.id!==id); save(); toast("Misura eliminata"); render();
}

