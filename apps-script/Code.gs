/**
 * Casa Bambini – ponte Apps Script tra la PWA e il foglio
 * "(FAB) Bambini – Database app".
 *
 * Si incolla nell'editor Apps Script del foglio (Estensioni → Apps Script).
 * Richiede il servizio avanzato "Google Sheets API" (Servizi + → Google Sheets API, identificatore "Sheets").
 * Il token NON sta qui: va nelle Proprietà dello script, chiave TOKEN.
 *
 * Richiesta (POST, corpo JSON, Content-Type text/plain):
 *   { "token": "...", "azione": "leggi" | "aggiungi" | "aggiorna",
 *     "range": "Scheda!A2:E", "valori": [[...], ...] }
 * Risposta:
 *   { "ok": true,  "range": "...", "valori": [[...]] }          (leggi)
 *   { "ok": true,  "range": "...", "righe": n, "celle": n }     (aggiungi / aggiorna)
 *   { "ok": false, "codice": "...", "errore": "testo in italiano" }
 *
 * Si comporta come il connettore Google Sheets di claude.ai, perché usa le stesse chiamate dell'API:
 *   - leggi    = values.get, valori formattati (celle vuote e righe vuote in fondo già tolte dall'API);
 *   - aggiungi = values.append, USER_ENTERED;
 *   - aggiorna = values.update, USER_ENTERED.
 * Niente cancellazioni, niente altre schede; un testo che inizia con "=" si scrive come testo, mai come formula.
 */

var VERSIONE_PONTE = "1.1 (15/11/2026)";
var ID_FOGLIO = "1J7f5P0r4ZrJrZgPpljw3WuzguzlfAGzfHeCmhGDcoiA";

/* Schede ammesse: true = lettura e scrittura, false = solo lettura */
var SCHEDE = {
  "Bambini": true,
  "Crescita": true,
  "Sonno": true,
  "Diario": true,
  "Attività": true,
  "Sviluppo": true,
  "Appuntamenti": true,
  "Salute": true,
  "Asilo": true,
  "Settimane": true,
  "Edo - Missioni": false,
  "Edo - Errori": false,
  "Edo - Giochi": false,
  "Edo - Uso": false
};

var MAX_RIGHE = 500;      // righe per singola scrittura
var MAX_COLONNE = 26;     // colonne per riga
var MAX_TESTO = 20000;    // caratteri per cella

function doPost(e) {
  try {
    var corpo;
    try {
      corpo = JSON.parse(e && e.postData ? e.postData.contents : "");
    } catch (err) {
      return risposta_(errore_("json_non_valido", "La richiesta non è un JSON valido."));
    }
    if (!corpo || typeof corpo !== "object") return risposta_(errore_("json_non_valido", "La richiesta non è un JSON valido."));

    var atteso = PropertiesService.getScriptProperties().getProperty("TOKEN");
    if (!atteso || atteso.length < 32) return risposta_(errore_("ponte_non_configurato", "Il ponte non ha un token valido nelle Proprietà dello script."));
    if (!uguali_(String(corpo.token || ""), atteso)) {
      Utilities.sleep(400);
      return risposta_(errore_("token_errato", "Chiave di accesso non valida."));
    }

    var azione = corpo.azione;
    if (azione !== "leggi" && azione !== "aggiungi" && azione !== "aggiorna") {
      return risposta_(errore_("azione_non_ammessa", "Azione non ammessa: usa leggi, aggiungi o aggiorna."));
    }

    var r = analizzaRange_(corpo.range);
    if (!r) return risposta_(errore_("range_non_valido", "Intervallo non valido: serve la forma Scheda!A1:B2."));
    if (!SCHEDE.hasOwnProperty(r.scheda)) return risposta_(errore_("scheda_non_ammessa", "La scheda \"" + r.scheda + "\" non è tra quelle ammesse."));

    if (azione === "leggi") return risposta_(leggi_(corpo.range));

    if (SCHEDE[r.scheda] !== true) return risposta_(errore_("sola_lettura", "La scheda \"" + r.scheda + "\" è in sola lettura."));
    var check = controllaValori_(corpo.valori);
    if (check) return risposta_(check);

    var lock = LockService.getScriptLock();
    lock.waitLock(20000);
    try {
      return risposta_(azione === "aggiungi" ? aggiungi_(corpo.range, corpo.valori) : aggiorna_(corpo.range, corpo.valori));
    } finally {
      lock.releaseLock();
    }
  } catch (err) {
    return risposta_(errore_("errore_foglio", String(err && err.message ? err.message : err)));
  }
}

/* Solo per controllare che il link funzioni: nessun dato */
function doGet() {
  return risposta_({ ok: true, ponte: "Casa Bambini", versione: VERSIONE_PONTE });
}

/* ---------- le tre azioni (stesse chiamate del connettore) ---------- */

function leggi_(range) {
  var p = Sheets.Spreadsheets.Values.get(ID_FOGLIO, range, { valueRenderOption: "FORMATTED_VALUE" });
  return { ok: true, range: p.range, valori: p.values || [] };
}

function aggiungi_(range, valori) {
  var p = Sheets.Spreadsheets.Values.append({ values: valori }, ID_FOGLIO, range, { valueInputOption: "USER_ENTERED" });
  var u = p.updates || {};
  return { ok: true, range: u.updatedRange || "", righe: u.updatedRows || 0, celle: u.updatedCells || 0 };
}

function aggiorna_(range, valori) {
  var p = Sheets.Spreadsheets.Values.update({ values: valori }, ID_FOGLIO, range, { valueInputOption: "USER_ENTERED" });
  return { ok: true, range: p.updatedRange || "", righe: p.updatedRows || 0, celle: p.updatedCells || 0 };
}

/* ---------- controlli ---------- */

/* "Scheda!A2:E", "'Edo - Missioni'!A2:I", "Bambini!E3". Il nome della scheda è obbligatorio. */
function analizzaRange_(range) {
  if (typeof range !== "string" || range.length > 200) return null;
  var m = range.match(/^(?:'((?:[^']|'')+)'|([^'!:]+))!([A-Z]{1,3}[0-9]{0,7})(?::([A-Z]{1,3}[0-9]{0,7}))?$/);
  if (!m) return null;
  return { scheda: m[1] !== undefined ? m[1].replace(/''/g, "'") : m[2] };
}

function controllaValori_(valori) {
  if (!Array.isArray(valori) || valori.length === 0) return errore_("valori_non_validi", "Mancano le righe da scrivere.");
  if (valori.length > MAX_RIGHE) return errore_("troppi_dati", "Troppe righe in una sola richiesta (massimo " + MAX_RIGHE + ").");
  for (var i = 0; i < valori.length; i++) {
    var riga = valori[i];
    if (!Array.isArray(riga)) return errore_("valori_non_validi", "La riga " + (i + 1) + " non è un elenco di celle.");
    if (riga.length > MAX_COLONNE) return errore_("troppi_dati", "Troppe colonne nella riga " + (i + 1) + ".");
    for (var j = 0; j < riga.length; j++) {
      var v = riga[j], t = typeof v;
      if (v === null || t === "boolean") continue;
      if (t === "number") { if (!isFinite(v)) return errore_("valori_non_validi", "Numero non valido nella riga " + (i + 1) + "."); continue; }
      if (t !== "string") return errore_("valori_non_validi", "Cella non valida nella riga " + (i + 1) + ": solo testo, numeri o sì/no.");
      if (v.length > MAX_TESTO) return errore_("troppi_dati", "Testo troppo lungo nella riga " + (i + 1) + ".");
      /* niente formule: un testo che inizia con "=" viene salvato come testo (apostrofo davanti, invisibile nel foglio) */
      if (v.charAt(0) === "=") riga[j] = "'" + v;
    }
  }
  return null;
}

/* confronto a tempo costante */
function uguali_(a, b) {
  var diff = a.length ^ b.length;
  for (var i = 0; i < b.length; i++) diff |= (a.charCodeAt(i) || 0) ^ b.charCodeAt(i);
  return diff === 0;
}

function errore_(codice, testo) { return { ok: false, codice: codice, errore: testo }; }

function risposta_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/* ---------- prova dall'editor (Esegui → provaLocale): legge senza passare dal web ---------- */
function provaLocale() {
  Logger.log("Versione: " + VERSIONE_PONTE);
  Logger.log("Token impostato: " + (PropertiesService.getScriptProperties().getProperty("TOKEN") ? "sì" : "NO"));
  Logger.log(JSON.stringify(leggi_("Bambini!A2:C")));
  Logger.log(JSON.stringify(leggi_("Crescita!A2:I3")));
  Logger.log("Range accettati: " + JSON.stringify([analizzaRange_("'Edo - Missioni'!A2:I"), analizzaRange_("Bambini!E3")]));
  Logger.log("Range rifiutati: " + JSON.stringify([analizzaRange_("Bambini"), analizzaRange_("A1:B2"), analizzaRange_("Bambini!A1:B2;x")]));
}
