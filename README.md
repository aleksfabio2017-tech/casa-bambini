# Casa Bambini

App di famiglia per Sibilla ed Edoardo (crescita, nanna, diario, asilo, salute, dashboard di Edo, PDF per il pediatra).
Sta passando da artifact su claude.ai a PWA su GitHub Pages: vedi `docs/inventario.md` e il piano `FAB_Casa_Bambini_PWA_piano.md` nel progetto Claude «FABIO – Bambini».

## Struttura
- `artifact-originale.html` – fotografia dell'artifact del 14/11/2026 (non si modifica).
- `src/index.html`, `src/css/`, `src/js/NN-nome.js` – il codice, diviso per sezioni. Tutti i JS stanno nella stessa funzione: `00-inizio.js` la apre, `12-avvio.js` la chiude.
- `costruisci.py` – rimette insieme i pezzi in `dist/index.html` (non salvato nel repository).

## Comandi
```
python3 costruisci.py              # costruisce dist/index.html
python3 costruisci.py --verifica   # e controlla che sia identico all'originale
```
La verifica vale solo finché il codice non cambia (fino alla Fase 3).
