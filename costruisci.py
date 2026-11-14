#!/usr/bin/env python3
"""Rimette insieme Casa Bambini: src/ -> dist/index.html.

- In src/index.html la riga "@@css@@" diventa il contenuto di src/css/*.css
  e la riga "@@js@@" quello di src/js/*.js, in ordine alfabetico
  (per questo i file JS hanno il numero davanti: 00-, 01-, ...).
- Tutti i file JS finiscono nello stesso <script>, dentro un'unica funzione:
  00-inizio.js la apre, 12-avvio.js la chiude. Variabili e funzioni sono
  quindi condivise tra i file, come nell'artifact originale.

Uso:  python3 costruisci.py            -> scrive dist/index.html
      python3 costruisci.py --verifica -> controlla anche che dist/index.html
                                          sia identico all'artifact originale
                                          (senza l'involucro di claude.ai)
"""
import pathlib
import sys

QUI = pathlib.Path(__file__).resolve().parent
SRC = QUI / "src"
DIST = QUI / "dist"


def unisci(cartella, estensione):
    file = sorted((SRC / cartella).glob("*." + estensione))
    return "".join(f.read_text(encoding="utf-8") for f in file)


def costruisci():
    righe = []
    for riga in (SRC / "index.html").read_text(encoding="utf-8").splitlines(keepends=True):
        if riga.strip() == "@@css@@":
            righe.append(unisci("css", "css"))
        elif riga.strip() == "@@js@@":
            righe.append(unisci("js", "js"))
        else:
            righe.append(riga)
    DIST.mkdir(exist_ok=True)
    uscita = DIST / "index.html"
    uscita.write_text("".join(righe), encoding="utf-8")
    return uscita


def verifica(uscita):
    originale = (QUI / "artifact-originale.html").read_text(encoding="utf-8").split("\n")
    atteso = "\n".join(originale[1:3617]) + "\n"   # righe 2-3617: senza l'involucro
    if uscita.read_text(encoding="utf-8") == atteso:
        print("OK: dist/index.html è identico all'artifact originale.")
        return True
    print("ATTENZIONE: dist/index.html è diverso dall'artifact originale.")
    return False


if __name__ == "__main__":
    f = costruisci()
    print("Scritto", f.relative_to(QUI), f"({f.stat().st_size:,} byte)")
    if "--verifica" in sys.argv and not verifica(f):
        sys.exit(1)
