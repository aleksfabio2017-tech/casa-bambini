# Ponte Apps Script

`Code.gs` collega la PWA al foglio "(FAB) Bambini – Database app". Fa le stesse tre cose del connettore Google Sheets di claude.ai (`get_values`, `append_values`, `update_values`) e usa le stesse chiamate dell'API Sheets. Così date, numeri e celle vuote arrivano identici a oggi.

## Installazione (una volta, da PC)
1. Apri il foglio → **Estensioni → Apps Script**.
2. Cancella il contenuto di `Codice.gs` e incolla tutto `Code.gs`. Rinomina il progetto in "Casa Bambini – ponte" e salva (💾).
3. A sinistra, **Servizi +** → **Google Sheets API** → *Aggiungi* (identificatore `Sheets`, lascia così).
4. ⚙️ **Impostazioni progetto** → in fondo **Proprietà dello script** → *Aggiungi proprietà*: nome `TOKEN`, valore = la chiave lunga (non è nel repository) → *Salva*.
5. Torna all'editor, scegli la funzione `provaLocale` → **Esegui**. La prima volta chiede le autorizzazioni: *Rivedi autorizzazioni* → il tuo account → *Avanzate* → *Vai a Casa Bambini – ponte (non sicuro)* → *Consenti*. Nel registro devono comparire Edoardo e Sibilla.
6. **Esegui il deployment → Nuovo deployment** → tipo **App web**: *Esegui come*: **Me**; *Chi ha accesso*: **Chiunque** (proprio "Chiunque": con "Chiunque con account Google" Google risponde con la pagina di accesso e l'app non riceve i dati; la protezione è il token) → *Esegui il deployment*. Copia l'**URL dell'app web** (finisce con `/exec`).

## Aggiornare il codice dopo una modifica
Incolla il nuovo `Code.gs` → salva → **Esegui il deployment → Gestisci deployment** → ✏️ → *Versione*: **Nuova versione** → *Esegui il deployment*. L'URL `/exec` resta lo stesso.

## Cambiare il token (se perso o rubato)
Impostazioni progetto → Proprietà dello script → modifica `TOKEN`. Vale subito, senza ridistribuire; i telefoni col vecchio token ricevono `token_errato`.

## Chiamata
`POST` all'URL `/exec`, header `Content-Type: text/plain` (così il browser non fa la richiesta preliminare CORS), corpo:
```json
{"token":"…","azione":"leggi","range":"Bambini!A2:E"}
{"token":"…","azione":"aggiungi","range":"Crescita!A1:I1","valori":[["id", 46319.57, "Sibilla", 7.8]]}
{"token":"…","azione":"aggiorna","range":"Bambini!E3","valori":[["nessuna allergia"]]}
```
Risposte: `{ok:true, range, valori}` per la lettura, `{ok:true, range, righe, celle}` per la scrittura, `{ok:false, codice, errore}` in caso di errore.
Codici di errore: `json_non_valido`, `ponte_non_configurato`, `token_errato`, `azione_non_ammessa`, `range_non_valido`, `scheda_non_ammessa`, `sola_lettura`, `valori_non_validi`, `troppi_dati`, `errore_foglio`.

Regole:
- si usano solo le schede della lista `SCHEDE`, e le "Edo - …" sono in sola lettura;
- niente cancellazioni;
- al massimo 500 righe per scrittura;
- un testo che inizia con `=` si scrive come testo, mai come formula.

Un `GET` sull'URL risponde solo `{ok:true, ponte, versione}`, senza dati: serve per vedere che il link è attivo.

## Prova veloce dalla console del browser (PC)
Su una pagina qualsiasi, F12 → Console:
```js
const U="https://script.google.com/macros/s/…/exec", T="…token…";
const p=b=>fetch(U,{method:"POST",headers:{"Content-Type":"text/plain"},body:JSON.stringify(Object.assign({token:T},b))}).then(r=>r.json());
console.log(await p({azione:"leggi",range:"Bambini!A2:C"}));
console.log(await p({azione:"aggiungi",range:"'Edo - Missioni'!A1:I1",valori:[["no"]]})); // atteso: sola_lettura
console.log(await p({token:"sbagliato",azione:"leggi",range:"Bambini!A2:C"}));            // atteso: token_errato
```

## Prove del 15/11/2026 (versione 1.0, sull'URL vero)
Tutte superate:
- letture di Bambini, Crescita e Asilo identiche al connettore (date `2026-10-24 13:44`, numeri `7,8`, celle vuote in mezzo `""`, celle e righe vuote in fondo tolte);
- scrittura di 2 righe in una scheda di prova: il numero-data `46341.5` è stato salvato come numero e mostrato `2026-11-15 12:00`; `"7,25"` è diventato il numero 7,25; `"=1+1"` è rimasto testo; la rilettura è identica a quella del connettore;
- una scheda "Edo - …" in scrittura → `sola_lettura`; una scheda fuori lista → `scheda_non_ammessa`; token sbagliato o assente → `token_errato`, senza dati.

Dalla versione 1.1 la scheda di prova non è più nella lista.
