# Casa Bambini – inventario dell'artifact (Fase 1)

Fonte: `artifact-originale.html`, versione live `1793831897-528d` del 14/11/2026 (3.618 righe, 316 KB).

## Struttura del file

| Righe | Contenuto | Dimensione |
|---|---|---|
| 1 e 3618 | involucro aggiunto da claude.ai (`<!doctype html><html><head>…<body>` / `</body></html>`) | – |
| 2–10 | `<head>` vero: `lang="it"`, viewport, titolo, font Google | – |
| 11–447 | un unico `<style>` | ~33 KB |
| 449–457 | corpo HTML minimo: `#head`, `#main`, `#nav`, `#sheet`, `#toast` | <1 KB |
| 458–3615 | un unico `<script>` in una IIFE con `"use strict"`; tutto viene disegnato da JS | ~281 KB |

Sezioni del JS (commenti `/* ---------- … ---------- */`):

| Riga | Sezione |
|---|---|
| 467 | stato locale |
| 499 | utilità |
| 581 | collegamento al foglio |
| 747 | azioni |
| 776 | nanna e diario (fase 4a) |
| 1009 | attività del giorno (blocco 4b) |
| 1320 | disegno |
| 1364 | dashboard Edoardo (fase 3) |
| 1771 | percentili OMS (fase 5a) – il blocco più grande, ~1.270 righe |
| 3045 | riepilogo per il pediatra (fase 5c) |
| 3484 | eventi |
| 3596 | avvio |

## Capacità di Claude usate (`claude.use`)

| Capacità | Dove | Uso | Sostituto nella PWA |
|---|---|---|---|
| `mcp` | 3605 | connettore **Google Sheets**: `get_values`, `update_values`, `append_values` (tramite la funzione `call()`, riga 598) | `dati.js` → ponte Apps Script |
| `permissions` | 3604, 742 | pulsante "Apri i permessi" (`perms.manage()`) | si toglie |
| `downloads` | 3405 | salvataggio del PDF per il pediatra (`dl.save`) | download normale (Blob + link) |

Non usa `db`, `user` né `assets`.
Tutte le chiamate al foglio passano da **tre funzioni** (`call`, `read`, `pushRows`, righe 598–621): il cambio del livello dati è molto circoscritto.

## Foglio Google

ID `1J7f5P0r4ZrJrZgPpljw3WuzguzlfAGzfHeCmhGDcoiA` (costante `SHEET_ID`, riga 461).

| Scheda | Intervallo letto | Scrittura | Note |
|---|---|---|---|
| Bambini | `A2:E` | `update_values` sulla cella `E{n}` (allergie) | A nome, B nascita, C sesso, E allergie/note |
| Crescita | `A2:I` | sì | 9 colonne |
| Sonno | `A2:F` | sì | |
| Diario | `A2:G` | sì | scrive anche Claude dalla chat |
| Attività | `A2:I` | sì | nome con accento |
| Sviluppo | `A2:G` | sì | |
| Appuntamenti | `A2:J` | sì | scrive anche Claude dalla chat |
| Salute | `A2:J` | sì | |
| Asilo | `A2:J` | sì | |
| Settimane | `A2:L` | sì | |
| Edo - Missioni | `A2:I` | **solo lettura** | scritta dall'app di Edo |
| Edo - Errori | `A2:G` | **solo lettura** | |
| Edo - Giochi | `A2:J` | **solo lettura** | |
| Edo - Uso | `A2:F` | **solo lettura** | può mancare |

Come scrive (`pushRows`): se la scheda è vuota, la prima riga va con `update_values` su `Scheda!A2:X2` e le altre con `append_values`; altrimenti tutto con `append_values` su `Scheda!A1:X1`. Nessuna cancellazione.

### Formati: cosa deve fare uguale il ponte
- **Date scritte come numero-data di Sheets** (giorni dal 30/12/1899: `toSerial`, `daySerial`), non come testo. In lettura `parseDate` accetta numeri-data, `YYYY-MM-DD[ HH:MM]` e `GG/MM/AAAA[ HH:MM]`.
- Numeri scritti come numeri JS; in lettura `num()` accetta anche `"9,5"`.
- Le righe lette possono essere più corte (celle vuote finali omesse).
- ⇒ Il ponte in Fase 2 deve scrivere con `USER_ENTERED` (come il connettore) e leggere i **valori formattati** (`getDisplayValues`), togliendo le celle vuote in fondo a ogni riga e le righe vuote finali. Da confrontare in Fase 2 con una lettura vera del connettore.

## Dati locali
- Una sola chiave `localStorage`: **`casa-bambini-v1`** (oggetto `S`).
- Code di invio: `S.queue` (misure) e `S.qs.{sonno, diario, attivita, sviluppo, appunt, salute, allerg, sett, asilo}`; ID tipo `genitori-diario-<timestamp>`, anti-doppioni confrontando gli ID già nel foglio.
- Sincronizzazione automatica: all'avvio, cambiando sezione (se l'ultima ha più di 2 minuti), ogni 5 minuti se il bambino scelto è Edoardo, al ritorno sulla pagina se ci sono dati in attesa.

## Librerie esterne
- Font Google: Bricolage Grotesque (500, 700) e Atkinson Hyperlegible (400, 700).
- `pdf-lib` 1.17.1, caricata solo quando serve il PDF: prima jsDelivr, poi cdnjs.
- Grafici: SVG disegnati a mano, nessuna libreria.

## Testi da cambiare con la PWA
- Messaggi di errore del connettore (righe 585–594) e riga 744, che rimandano a claude.ai.
- Messaggio "apri l'app dal link in claude.ai" del PDF (riga 3417).
- Riquadro "Versione" nelle Impostazioni (riga 3457).
