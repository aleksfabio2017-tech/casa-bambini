/* ---------- nanna e diario (fase 4a) ---------- */
function dayFromKey(k){ const m=String(k).match(/^(\d{4})-(\d{2})-(\d{2})$/); return m? new Date(+m[1], +m[2]-1, +m[3]) : null; }
function daySerial(k){ const d=dayFromKey(k); return d? Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())/864e5 + 25569 : k; }
function sonnoToSheet(o){ return [o.id, daySerial(o.day), o.bambino, o.ore, o.note||"", "app-genitori"]; }
function diarioToSheet(o){ const sd=toSerial(o.data); return [o.id, sd==null?o.data:sd, o.bambino, o.cat, o.testo, o.foto||"", "app-genitori"]; }
function pendingCount(){ return S.queue.length + S.qs.sonno.length + S.qs.diario.length + S.qs.attivita.length + S.qs.sviluppo.length + S.qs.appunt.length + S.qs.salute.length + Object.keys(S.qs.allerg).length + S.qs.sett.length + S.qs.asilo.length; }
function ordOf(id){ const m=String(id||"").match(/(\d{12,})/); return m? Number(m[1]) : 0; }
function newer(a,b){ if(a.ord && b.ord && a.ord!==b.ord) return a.ord>b.ord; return a.idx>b.idx; }
/* per ogni giorno la riga più recente (ordine per ID con timestamp, poi ordine delle righe) */
function sonnoDays(c){
  const sheetIds = new Set(S.sonno.map(r=>r.id));
  const all = S.sonno.filter(r=>r.bambino===c && r.day && r.ore!=null && r.origine!=="test" && r.origine!=="prova")
      .map(r=>Object.assign({}, r, {pending:false, ord:ordOf(r.id), idx:r.i||0}))
    .concat(S.qs.sonno.filter(q=>q.bambino===c && !sheetIds.has(q.id))
      .map(q=>Object.assign({}, q, {pending:true, ord:ordOf(q.id), idx:1e12+ordOf(q.id)})));
  const map = {};
  all.forEach(r=>{ if(!map[r.day] || newer(r, map[r.day])) map[r.day]=r; });
  return map;
}
function defaultOre(c){ const b=birthOf(c); const m = b? ageParts(b,new Date()).months : 12; return m<24 ? 13 : m<36 ? 12 : 10.5; }
function nKey(){ return nDay==="ieri" ? dayKey(dayStart(1)) : nDay==="oggi" ? dayKey(dayStart(0)) : nDay; }
function dayWord(k){
  if(k===dayKey(dayStart(0))) return "oggi";
  if(k===dayKey(dayStart(1))) return "ieri";
  const d=dayFromKey(k); return d? GIORNI[d.getDay()]+" "+d.getDate()+" "+MESI[d.getMonth()] : k;
}
function oreTxt(v){ return fmt(v,1)+" h"; }
function lastOre(map){ const ks=Object.keys(map).sort(); return ks.length? map[ks[ks.length-1]].ore : null; }
function nShown(map){ const k=nKey(); return nVal!=null ? nVal : map[k] ? map[k].ore : (lastOre(map) ?? defaultOre(S.child)); }
function avgDays(map, from, to){
  let sum=0, n=0;
  for(let o=from;o<=to;o++){ const r=map[dayKey(dayStart(o))]; if(r && !/solo pisolino/i.test(String(r.note||""))){ sum+=r.ore; n++; } }
  return n? {avg:sum/n, n} : null;
}
function addSonno(){
  const map=sonnoDays(S.child), k=nKey(), d=dayFromKey(k), v=nShown(map);
  nErr = "";
  if(!d) nErr = "Scegli il giorno.";
  else if(d > dayStart(0)) nErr = "Il giorno è nel futuro: controllalo.";
  else if(!(v>=0 && v<=24)) nErr = "Le ore vanno tra 0 e 24.";
  if(nErr){ render(); return; }
  const had = map[k];
  const note = $("n-note") ? $("n-note").value.trim().slice(0,300) : "";
  S.qs.sonno.push({id:"genitori-sonno-"+Date.now(), day:k, bambino:S.child, ore:Math.round(v*2)/2, note});
  save(); nVal = null;
  toast(had ? "Nanna corretta" : "Nanna salvata");
  render(); sync(false);
}
const CATS = [["prima volta","Prima volta"],["parola","Parola nuova"],["ricordo","Ricordo"],["salute","Salute"]];
function catLabel(c){ const f=CATS.concat([["asilo","Asilo"],["scuola","Scuola"],["umore","Umore"]]).find(x=>x[0]===String(c).toLowerCase()); return f? f[1] : (c||"Nota"); }
function diarioFor(c){
  const sheetIds = new Set(S.diario.map(r=>r.id));
  const all = S.diario.filter(r=>r.bambino===c && r.origine!=="test" && r.origine!=="prova").map(r=>Object.assign({pending:false}, r))
    .concat(S.qs.diario.filter(q=>q.bambino===c && !sheetIds.has(q.id)).map(q=>Object.assign({pending:true}, q)));
  all.forEach(r=>{ r._d=parseDate(r.data); });
  return all.filter(r=>r._d && String(r.cat).toLowerCase()!=="umore").sort((a,b)=>(b._d-a._d) || (ordOf(b.id)-ordOf(a.id)));
}
function safeUrl(u){ u=String(u||"").trim(); return /^https?:\/\/\S+$/i.test(u) ? u : ""; }
function addDiario(){
  const v = id=>$(id) ? $(id).value : "";
  const testo = v("d-testo").trim(), when = v("d-data"), foto = v("d-foto").trim();
  const d = when ? new Date(when) : null;
  dErr = "";
  if(!testo) dErr = "Scrivi qualcosa nella nota.";
  else if(testo.length>1000) dErr = "La nota è troppo lunga (massimo 1000 caratteri).";
  else if(!d || isNaN(d)) dErr = "Indica la data.";
  else if(d.getTime() > Date.now()+60000) dErr = "La data è nel futuro: controllala.";
  else if(foto && !safeUrl(foto)) dErr = "Il link della foto deve iniziare con https://";
  if(dErr){ render(); return false; }
  S.qs.diario.push({id:"genitori-diario-"+Date.now(), data:stamp(d), bambino:S.child, cat:dCat, testo, foto:safeUrl(foto)});
  save(); toast("Nota salvata"); render(); sync(false);
  return true;
}
function removeQueued(kind, id){
  S.qs[kind] = S.qs[kind].filter(q=>q.id!==id); save();
  toast(kind==="sonno" ? "Nanna eliminata" : "Nota eliminata"); render();
}

/* ---------- archivio attività (blocco 4b) ----------
   f: fascia 1 = 9–12 mesi, 2 = 12–18, 3 = 18–24. m: Pikler | Montessori | altro (come il menu del foglio).
   Fonti: principi Pikler (libertà di movimento, gioco autonomo e ininterrotto, cura attenta; Pikler Institute, WAIMH 2010),
   attività Montessori 0–3 per età (S. Davies, AMI), cestino dei tesori (E. Goldschmied), sicurezza: Ministero della Salute. */
const ATT_SAFE = "Niente oggetti piccoli (bottoni, monete, tappi di penna, palline piccole, pile, magneti): resta sempre vicino.";
const ATT = [
/* 9–12 mesi */
{id:"a1-01", f:1, t:"Il cestino dei tesori", m:"altro", ar:"Sensi", d:15,
 mat:["un cestino basso e robusto","6–8 oggetti di casa di materiali diversi: cucchiaio di legno, frusta piccola, pigna grande, spazzola, mestolo di metallo, gomitolo di lana"],
 p:["Siediti a terra con il cestino davanti a lei, alla sua portata.","Lascia che scelga da sola cosa prendere: guarda, non proporre.","Se ti cerca con lo sguardo, rispondi con una parola semplice: «legno», «freddo», «morbido».","Quando perde interesse, rimetti a posto senza fretta."],
 n:"Il cestino dei tesori di Elinor Goldschmied: oggetti veri, non giocattoli. Tu sei presente e calma, lei esplora con tutti i sensi.", s:true},
{id:"a1-02", f:1, t:"Il foulard che sparisce", m:"Pikler", ar:"Sensi", d:10,
 mat:["un foulard leggero di cotone o di seta"],
 p:["Appoggia il foulard a terra vicino a lei, spiegazzato, così che lo possa afferrare.","Lascialo esplorare: lo tira, lo agita, lo mette sulla testa.","Se ti invita, copri per un attimo un suo gioco e lascia che sia lei a scoprirlo.","Dai un nome a quello che succede: «non c'è… eccolo!»."],
 n:"I veli di cotone sono tra i primi materiali di gioco all'Istituto Pikler: leggeri, facili da prendere, mai uguali."},
{id:"a1-03", f:1, t:"La scatola della palla", m:"Montessori", ar:"Mani", d:10,
 mat:["una scatola da scarpe con un foro rotondo sul coperchio","una palla da tennis o una pallina morbida che passi giusta nel foro"],
 p:["Mostra una volta, lentamente e senza parlare, come la palla entra nel foro.","Apri il coperchio insieme: la palla è lì.","Lascia che ci provi da sola, anche con le mani al posto della palla.","Non correggere: ogni tentativo è il lavoro."],
 n:"Imbucare aiuta a capire che le cose esistono anche quando non si vedono (permanenza dell'oggetto), che emerge verso gli 8–10 mesi.", s:true},
{id:"a1-04", f:1, t:"Il percorso a terra", m:"Pikler", ar:"Movimento", d:20,
 mat:["un tappeto ampio","due o tre cuscini del divano","un rotolo di asciugamano"],
 p:["Disponi cuscini e asciugamano sul tappeto, con spazio libero intorno.","Mettila a terra nella posizione che sa già prendere da sola.","Lasciala strisciare, gattonare, salire e scendere a modo suo.","Resta vicino senza aiutare: intervieni solo se è davvero in pericolo."],
 n:"Pikler: non mettere il bambino in una posizione che non sa raggiungere da solo. Si muove meglio e con più sicurezza se trova da sé il proprio modo."},
{id:"a1-05", f:1, t:"Tirarsi su da sola", m:"Pikler", ar:"Movimento", d:15,
 mat:["un mobile basso e pesante che non si ribalta, o il divano","un gioco che le piace appoggiato sopra"],
 p:["Controlla che il mobile sia stabile e senza spigoli vivi.","Appoggia il gioco sul bordo, alla sua altezza.","Lascia che trovi da sola come aggrapparsi e alzarsi.","Non tenerla per le mani per farla stare in piedi: aspetta che ci arrivi."],
 n:"Pikler consigliava di non tenere il bambino in piedi per le mani prima che sappia alzarsi da solo: così impara anche a scendere e a cadere bene."},
{id:"a1-06", f:1, t:"Pentole e cucchiai", m:"Pikler", ar:"Sensi", d:15,
 mat:["2 pentolini o ciotole di metallo di misure diverse","un cucchiaio di legno","un coperchio leggero"],
 p:["Metti pentole e cucchiaio a terra, capovolti e dritti.","Lascia che batta, infili, sovrapponga, ascolti i suoni.","Non insegnare la «giusta» combinazione: scoprirla è il gioco.","Se fa troppo rumore per te, spostatevi su un tappeto."],
 n:"Pochi oggetti semplici e di casa lasciano più spazio all'iniziativa del bambino di un gioco che «fa» tutto da solo."},
{id:"a1-07", f:1, t:"Apri e chiudi", m:"Montessori", ar:"Mani", d:10,
 mat:["2 contenitori con coperchio facile (scatola di cartone, barattolo di plastica a vite larga, borsellino con bottone grande)","un oggetto grande da nascondere dentro"],
 p:["Metti un oggetto dentro ogni contenitore.","Mostra piano come si apre il primo, poi lasciale il turno.","Se si blocca, aspetta qualche secondo prima di aiutare.","Quando ce la fa, basta un sorriso: niente applausi."],
 n:"Montessori: il bambino trova la soddisfazione nel riuscire da solo. Non serve il nostro «bravo», basta che ci sia.", s:true},
{id:"a1-08", f:1, t:"Bere dal bicchierino", m:"Montessori", ar:"Vita pratica", d:5,
 mat:["un bicchiere piccolo e pesante (vetro spesso o acciaio)","poca acqua, due dita"],
 p:["A tavola, offri il bicchiere con pochissima acqua.","Aiutala tenendo il bicchiere dal fondo, poi lascia sempre di più a lei.","Se rovescia, asciugate insieme con calma.","Ripeti a ogni pasto: diventa un gesto quotidiano."],
 n:"Il bicchiere vero, piccolo e pieno a metà, insegna più della tazza antigoccia: l'errore si vede e si corregge da sé."},
{id:"a1-09", f:1, t:"Il libro con le foto vere", m:"Montessori", ar:"Linguaggio", d:10,
 mat:["un libro cartonato con fotografie reali (animali, oggetti di casa, cibi)"],
 p:["Sedetevi vicini, con lei che tiene il libro.","Lasciala sfogliare come vuole, anche al contrario.","Nomina con una parola sola quello che guarda: «gatto», «mela».","Quando tocca un'immagine, aspetta: forse sta per dirti qualcosa."],
 n:"Montessori preferisce immagini realistiche per i più piccoli: collegano la parola alle cose che il bambino vede davvero."},
{id:"a1-10", f:1, t:"Il cestino delle parole", m:"Montessori", ar:"Linguaggio", d:10,
 mat:["un cestino","3 oggetti veri della casa (un cucchiaio, un calzino, una spazzola)"],
 p:["Tira fuori un oggetto alla volta, lentamente.","Dì il nome chiaro, due volte: «cucchiaio… cucchiaio».","Daglielo da esplorare.","Alla fine rimettili nel cestino uno per uno, nominandoli di nuovo."],
 n:"Parole precise per cose vere: non «coso», ma «frusta». Il bambino assorbe la lingua che sente."},
{id:"a1-11", f:1, t:"Lo specchio a terra", m:"Montessori", ar:"Sensi", d:10,
 mat:["uno specchio infrangibile fissato al muro all'altezza del pavimento, o appoggiato in modo stabile"],
 p:["Mettila a terra davanti allo specchio, nella posizione che sa prendere da sola.","Lascia che si guardi, si avvicini, tocchi.","Siediti accanto: vedrà anche te nello specchio.","Nomina le parti del viso se ti guarda: «naso», «occhi»."],
 n:"Lo specchio basso è un classico dello spazio Montessori per i piccoli: osserva i propri movimenti e impara a conoscersi."},
{id:"a1-12", f:1, t:"La coperta sul prato", m:"Pikler", ar:"Movimento", d:20,
 mat:["una coperta grande","un prato pulito, all'ombra (o un pavimento vicino a una finestra aperta)"],
 p:["Stendi la coperta e mettila giù con un paio di oggetti semplici.","Lasciala libera di uscire dalla coperta e toccare l'erba.","Guarda cosa la incuriosisce: foglie, vento, rumori.","Togli prima i sassolini e controlla che non ci siano piante pericolose."],
 n:"All'Istituto Pikler i bambini passano molto tempo all'aperto: spazio, luce e suoni nuovi sono il miglior gioco.", s:true},
/* 12–18 mesi */
{id:"a2-01", f:2, t:"Imbucare i dischi", m:"Montessori", ar:"Mani", d:10,
 mat:["un barattolo grande di plastica con una fessura nel coperchio","4–5 dischi di cartone spesso (diametro di un palmo)"],
 p:["Mostra una volta, piano, come il disco entra nella fessura.","Lascia che provi: girare il polso è la parte difficile.","Quando sono tutti dentro, apri insieme e ricomincia se vuole.","Non contare e non insegnare i colori: ora conta solo il gesto."],
 n:"Dalla palla nel foro alla fessura: la difficoltà cresce un passo alla volta, come nei materiali Montessori."},
{id:"a2-02", f:2, t:"Anelli sul bastone", m:"Montessori", ar:"Mani", d:10,
 mat:["un portarotolo da cucina verticale o un mattarello fissato in piedi","3–4 anelli grandi (braccialetti di legno, anelli di tende)"],
 p:["Infila gli anelli sul bastone e metti tutto davanti a lei.","Lascia che li tolga: all'inizio è la parte più bella.","Mostra una volta come si rimettono, senza insistere.","Verso i 12 mesi molti iniziano a rimetterli: aspetta il suo momento."],
 n:"Montessori: un'attività, un obiettivo chiaro. Toglierli e rimetterli allena la coordinazione occhio-mano."},
{id:"a2-03", f:2, t:"Spingere la scatola", m:"Pikler", ar:"Movimento", d:15,
 mat:["una scatola di cartone robusta con dentro due libri pesanti","un pavimento libero"],
 p:["Proponila solo se cammina già da sola o si alza da sola.","Metti la scatola in mezzo alla stanza e lascia che la scopra.","Spingere, fermarsi, girare: lasciala fare senza guidarla.","Togli tappeti che scivolano e oggetti contro cui sbattere."],
 n:"Pikler: niente girello e niente «camminare tenuti per mano». Il bambino che cammina quando è pronto si muove con equilibrio e calma."},
{id:"a2-04", f:2, t:"Su e giù dai cuscini", m:"Pikler", ar:"Movimento", d:15,
 mat:["2–3 cuscini del divano a terra","un gradino basso o un pouf stabile"],
 p:["Crea una piccola collina di cuscini vicino al gradino.","Lascia che salga e scenda come vuole.","Se è in difficoltà, descrivi invece di aiutare: «il piede cerca il gradino».","In baita: è un buon allenamento per imparare a scendere le scale all'indietro, sempre con te accanto."],
 n:"Il bambino che sale da solo sa anche scendere: impara i propri limiti. Il nostro compito è rendere sicuro lo spazio, non il movimento."},
{id:"a2-05", f:2, t:"Le mani nell'acqua", m:"Montessori", ar:"Sensi", d:15,
 mat:["una bacinella bassa con due dita di acqua tiepida","un bicchiere di plastica","una spugna","un asciugamano sotto"],
 p:["Metti la bacinella su un asciugamano, a terra o sul seggiolone.","Lascia che tocchi, schizzi, riempia il bicchiere, strizzi la spugna.","Dai le parole: «bagnato», «gocce», «strizza».","Alla fine asciugate insieme e svuota subito la bacinella."],
 n:"L'acqua è il materiale sensoriale per eccellenza. Ma con l'acqua mai un attimo da sola, anche con pochi centimetri.", s:true},
{id:"a2-06", f:2, t:"I calzini nel cesto", m:"Montessori", ar:"Vita pratica", d:10,
 mat:["il cesto del bucato","calzini e piccoli panni asciutti"],
 p:["Quando stendi o ritiri il bucato, chiamala vicino.","Dalle un calzino alla volta da mettere nel cesto.","Ringrazia come con un adulto: «grazie, mi hai aiutato».","Accetta che ne tolga qualcuno: fa parte del gioco."],
 n:"Montessori: il bambino vuole partecipare alla vita vera della casa. Un compito piccolo e reale vale più di un gioco finto."},
{id:"a2-07", f:2, t:"Lavarsi le mani", m:"Montessori", ar:"Vita pratica", d:5,
 mat:["uno sgabello stabile davanti al lavandino","sapone liquido","un asciugamano piccolo appeso alla sua altezza"],
 p:["Prima dei pasti, accompagnala al lavandino.","Mostra i gesti lentamente: bagna, sapone, strofina, sciacqua, asciuga.","Lascia che lo faccia lei, anche se ci mette tanto.","Controlla l'acqua: deve uscire solo tiepida."],
 n:"Rallentare i gesti quando li mostriamo è un principio Montessori: il bambino osserva e poi imita."},
{id:"a2-08", f:2, t:"Pulire con la spugna", m:"Montessori", ar:"Vita pratica", d:10,
 mat:["una spugna piccola leggermente umida","il tavolino basso o il ripiano del seggiolone"],
 p:["Dopo il pasto, dalle la spugna.","Mostra un movimento ampio, da un lato all'altro.","Lasciala pulire a modo suo.","Ripassa tu dopo, senza farglielo notare."],
 n:"Non conta il risultato, conta il gesto e il sentirsi utile. Correggerla le toglierebbe la voglia di riprovare."},
{id:"a2-09", f:2, t:"Dov'è?", m:"Montessori", ar:"Linguaggio", d:10,
 mat:["un libro con immagini semplici e chiare","3–4 oggetti veri nella stanza"],
 p:["Sfogliate il libro e chiedi: «dov'è il cane?».","Aspetta che indichi, anche con calma.","Poi fate lo stesso con le cose intorno: «dov'è la palla?».","Se non risponde, indica tu e dì il nome: nessuna verifica."],
 n:"A questa età capisce molte più parole di quelle che dice. Indicare è già una risposta."},
{id:"a2-10", f:2, t:"Il primo scarabocchio", m:"Montessori", ar:"Mani", d:10,
 mat:["un pastello a cera grosso","un foglio grande fissato al tavolo con lo scotch"],
 p:["Siediti con lei al tavolo e dalle un solo pastello.","Lasciala fare segni, battere, provare.","Descrivi senza giudicare: «un segno lungo», «tanti puntini».","Se mette il pastello in bocca, riprova un altro giorno."],
 n:"Un colore e un foglio grande: pochi materiali, tanta concentrazione. Niente disegni da imitare."},
{id:"a2-11", f:2, t:"Il puzzle con il pomello", m:"Montessori", ar:"Mani", d:10,
 mat:["un incastro di legno con 1–3 pezzi e pomelli (cerchio, quadrato, triangolo o animali)"],
 p:["Metti l'incastro davanti a lei con un solo pezzo fuori.","Lascia che lo prenda dal pomello ed esplori.","Mostra una volta come torna al suo posto.","All'inizio toglie e basta: rimetterli arriva più avanti, spesso verso i 18 mesi."],
 n:"Si comincia con pochi pezzi e si aggiunge solo quando il bambino è padrone dell'attività."},
{id:"a2-12", f:2, t:"Il cestino del bosco", m:"Montessori", ar:"Sensi", d:20,
 mat:["un cestino","una passeggiata lenta vicino a casa o alla baita"],
 p:["Uscite con il cestino e camminate al suo passo.","Raccogliete insieme cose grandi: pigne, foglie, cortecce.","A casa, guardatele e toccatele nominandole.","Lasciate fuori sassolini, bacche e funghi: non vanno in bocca."],
 n:"Montessori considerava la natura parte dell'educazione: andare piano e lasciarsi sorprendere insieme.", s:true},
/* 18–24 mesi */
{id:"a3-01", f:3, t:"Versare l'acqua", m:"Montessori", ar:"Vita pratica", d:10,
 mat:["una brocchetta piccola con poca acqua","un bicchiere","un vassoio","una spugna"],
 p:["Metti brocca e bicchiere sul vassoio, al tavolo.","Mostra lentamente: prendi la brocca dal manico, versa, appoggia.","Lascia che ci provi; se esce acqua, la spugna è lì.","Può bere quello che ha versato: è il premio naturale."],
 n:"Versare è un'attività di vita pratica a un solo passaggio, adatta dai 18 mesi: concentrazione, coordinazione, autonomia."},
{id:"a3-02", f:3, t:"Abbinare i calzini", m:"Montessori", ar:"Sensi", d:10,
 mat:["4 paia di calzini ben diversi tra loro (colori o disegni)","un cestino"],
 p:["Mescola i calzini nel cestino.","Prendine uno e cerca il gemello con calma, a voce: «uguale… uguale».","Lascia che continui lei.","Se sbaglia, prendi tu il calzino giusto e mettilo accanto, senza dire «no»."],
 n:"Abbinare è il primo passo della classificazione. Iniziare con pochi elementi molto diversi rende possibile riuscire."},
{id:"a3-03", f:3, t:"Mandarini con il mestolo", m:"Montessori", ar:"Mani", d:10,
 mat:["2 ciotole","3–4 mandarini","un mestolo grande o un cucchiaio da insalata"],
 p:["Metti i mandarini in una ciotola, l'altra vuota accanto, da sinistra a destra.","Mostra come si spostano uno alla volta con il mestolo.","Lascia che lo faccia lei, anche con le mani se il mestolo è difficile.","Alla fine può sbucciarne uno insieme a te."],
 n:"I travasi preparano la mano agli strumenti. Oggetti grandi e tondi sono più facili da gestire e più sicuri dei legumi secchi."},
{id:"a3-04", f:3, t:"Lavare la frutta", m:"Montessori", ar:"Vita pratica", d:10,
 mat:["una bacinella con acqua","frutta o verdura da lavare (mele, carote, zucchine)","uno strofinaccio"],
 p:["Prepara tutto su un tavolo basso o sulla torre di apprendimento.","Mostra come si strofina sotto l'acqua e si appoggia sullo strofinaccio.","Lascia che lavi lei, un pezzo alla volta.","Usate la frutta lavata per la merenda: il lavoro serve davvero."],
 n:"Montessori: le attività in cucina sono amatissime perché sono vere e utili a tutta la famiglia."},
{id:"a3-05", f:3, t:"Apparecchiare il suo posto", m:"Montessori", ar:"Vita pratica", d:5,
 mat:["la sua tovaglietta","il suo piatto infrangibile, cucchiaio e bicchiere, in un cassetto basso"],
 p:["Prima del pasto, invitala a prendere le sue cose dal cassetto.","Mostra dove va ogni cosa sulla tovaglietta.","Lascia che porti un oggetto alla volta.","Dopo mangiato, può portare il piatto verso il lavandino."],
 n:"Avere le proprie cose a portata di mano, sempre nello stesso posto, risponde al bisogno d'ordine forte a questa età."},
{id:"a3-06", f:3, t:"Togliere calze e scarpe", m:"Montessori", ar:"Vita pratica", d:5,
 mat:["scarpe con lo strappo","uno sgabello basso"],
 p:["Al rientro, siedila sullo sgabello.","Apri tu lo strappo e lascia che sfili la scarpa.","Per le calze, abbassale fino al tallone: lei tira la punta.","Mettete insieme le scarpe al loro posto."],
 n:"Spogliarsi viene prima di vestirsi. Dividere il gesto in passaggi e lasciare a lei l'ultimo dà la soddisfazione di finire."},
{id:"a3-07", f:3, t:"Calciare la palla grande", m:"altro", ar:"Movimento", d:15,
 mat:["una palla grande e leggera","un prato o un corridoio libero"],
 p:["Mettete la palla a terra davanti a lei.","Lasciala provare a calciarla: spesso prima la spinge col piede.","Rimandagliela piano, rotolando.","Correte a riprenderla insieme."],
 n:"Verso i 2 anni molti bambini iniziano a calciare una palla e a correre: il prato della baita è perfetto."},
{id:"a3-08", f:3, t:"Oggetto e figura", m:"Montessori", ar:"Linguaggio", d:10,
 mat:["3 oggetti veri (cucchiaio, chiave grande, mela)","le 3 foto stampate degli stessi oggetti"],
 p:["Metti le foto sul tavolo, una accanto all'altra.","Prendi un oggetto, nominalo e appoggialo sulla sua foto.","Dai a lei gli altri due da abbinare.","Quando è facile, cambia oggetti."],
 n:"Passare dall'oggetto all'immagine è un piccolo salto verso il simbolo: un passo alla volta."},
{id:"a3-09", f:3, t:"Filastrocche con i gesti", m:"altro", ar:"Linguaggio", d:10,
 mat:["nessuno: solo voi due"],
 p:["Scegli una filastrocca breve che conosci, con gesti delle mani.","Ripetila lentamente, sempre uguale.","Lascia spazio: fermati prima dell'ultima parola e aspetta.","Ripetila nei giorni seguenti: la ripetizione è il gioco."],
 n:"Ritmo, rima e ripetizione aiutano il linguaggio che esplode verso i 18–24 mesi."},
{id:"a3-10", f:3, t:"Dipingere con l'acqua", m:"Montessori", ar:"Mani", d:15,
 mat:["un pennello grosso","un bicchiere con poca acqua","una lavagna, una pietra grande o il pavimento della terrazza"],
 p:["Mostra come si intinge il pennello e si «dipinge» la superficie.","Lascia che faccia lei: il segno scuro scompare asciugando.","Descrivi: «bagnato», «scompare», «ancora».","D'estate funziona benissimo sui sassi davanti alla baita."],
 n:"Nessun risultato da conservare, nessun errore possibile: solo il piacere del gesto."},
{id:"a3-11", f:3, t:"La torre di scatole", m:"Pikler", ar:"Mani", d:15,
 mat:["4–5 scatole di cartone o cubi di legno grandi"],
 p:["Metti scatole o cubi a terra, sparsi.","Lascia che li impili, li allinei o li butti giù.","Non costruire tu la torre da imitare.","Se crolla, guarda la sua reazione prima di dire qualcosa."],
 n:"Gioco autonomo Pikler: materiali semplici e tempo senza interruzioni. L'adulto c'è, ma non dirige."},
{id:"a3-12", f:3, t:"Annaffiare le piante", m:"Montessori", ar:"Vita pratica", d:10,
 mat:["un annaffiatoio piccolo con poca acqua","una pianta in vaso stabile, o le aiuole della baita"],
 p:["Mostra come si inclina l'annaffiatoio vicino alla terra.","Lascia che annaffi lei, una pianta alla volta.","Guardate insieme la terra che cambia colore.","Prendersi cura di qualcosa ogni giorno, alla stessa ora, dà ritmo."],
 n:"La cura dell'ambiente è una delle tre aree della vita pratica Montessori, insieme alla cura di sé e degli altri."}
];

