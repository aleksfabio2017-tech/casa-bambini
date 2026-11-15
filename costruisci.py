#!/usr/bin/env python3
"""Rimette insieme Casa Bambini: src/ -> dist/index.html.

- In src/index.html la riga "@@css@@" diventa il contenuto di src/css/*.css
  e la riga "@@js@@" quello di src/js/*.js, in ordine alfabetico
  (per questo i file JS hanno il numero davanti: 00-, 01-, 02b-, ...).
- Tutti i file JS finiscono nello stesso <script>, dentro un'unica funzione:
  00-inizio.js la apre, 12-avvio.js la chiude. Variabili e funzioni sono
  quindi condivise tra i file, come nell'artifact originale.

Uso:  python3 costruisci.py              -> scrive dist/index.html
      python3 costruisci.py --verifica   -> scrive e controlla:
          1. nessun resto di claude.ai nel codice (window.claude, claude.use);
          2. sintassi JavaScript (node --check);
          3. prove/prova.html in Chrome headless, con il ponte finto
             (sincronizzazione, anti-doppioni, offline, errori, Impostazioni).
      python3 costruisci.py --originale  -> confronto byte per byte con
          artifact-originale.html: vale solo per il commit dell'import (390b020).
"""
import pathlib
import re
import shutil
import subprocess
import sys
import tempfile

QUI = pathlib.Path(__file__).resolve().parent
SRC = QUI / "src"
DIST = QUI / "dist"
PROVE = QUI / "prove"


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


def originale(uscita):
    orig = (QUI / "artifact-originale.html").read_text(encoding="utf-8").split("\n")
    atteso = "\n".join(orig[1:3617]) + "\n"   # righe 2-3617: senza l'involucro
    if uscita.read_text(encoding="utf-8") == atteso:
        print("OK: dist/index.html è identico all'artifact originale.")
        return True
    print("ATTENZIONE: dist/index.html è diverso dall'artifact originale (normale dopo la Fase 3).")
    return False


def trova_chrome():
    for nome in ("google-chrome", "chromium", "chromium-browser", "chrome"):
        p = shutil.which(nome)
        if p:
            return p
    return None


def verifica(uscita):
    html = uscita.read_text(encoding="utf-8")
    tutto_ok = True

    resti = sorted(set(re.findall(r"window\.claude|claude\.use|claude\?\.use", html)))
    if resti:
        print("NO   restano chiamate a claude.ai:", ", ".join(resti))
        tutto_ok = False
    else:
        print("ok   nessuna chiamata a claude.ai")

    js = html.split("<script>\n", 1)[1].rsplit("</script>", 1)[0]
    node = shutil.which("node")
    if node:
        with tempfile.NamedTemporaryFile("w", suffix=".js", delete=False, encoding="utf-8") as t:
            t.write(js)
        r = subprocess.run([node, "--check", t.name], capture_output=True, text=True)
        pathlib.Path(t.name).unlink()
        if r.returncode:
            print("NO   sintassi JavaScript:\n" + r.stderr)
            tutto_ok = False
        else:
            print("ok   sintassi JavaScript")
    else:
        print("--   node non trovato: salto il controllo della sintassi")

    chrome = trova_chrome()
    if not chrome:
        print("--   Chrome non trovato: salto prove/prova.html")
        return tutto_ok
    # app con il ponte finto al posto della rete
    prova_app = PROVE / "_app_prova.html"
    prova_app.write_text(html.replace("<script>\n", '<script src="ponte-finto.js"></script>\n<script>\n', 1), encoding="utf-8")
    with tempfile.TemporaryDirectory() as profilo:
        r = subprocess.run([chrome, "--headless=new", "--no-sandbox", "--disable-gpu", "--allow-file-access-from-files",
                            "--user-data-dir=" + profilo, "--virtual-time-budget=120000", "--dump-dom",
                            (PROVE / "prova.html").as_uri()], capture_output=True, text=True, timeout=300)
    m = re.search(r'<pre id="out">(.*?)</pre>', r.stdout, re.S)
    testo = (m.group(1) if m else "nessun risultato da Chrome\n" + r.stderr[-2000:])
    testo = testo.replace("&lt;", "<").replace("&gt;", ">").replace("&amp;", "&").replace("&quot;", '"')
    print("\nprove/prova.html (ponte finto):\n" + testo)
    if "ESITO: OK" not in testo:
        tutto_ok = False
    return tutto_ok


if __name__ == "__main__":
    f = costruisci()
    print("Scritto", f.relative_to(QUI), f"({f.stat().st_size:,} byte)")
    if "--originale" in sys.argv and not originale(f):
        sys.exit(1)
    if "--verifica" in sys.argv and not verifica(f):
        print("\nVERIFICA NON RIUSCITA")
        sys.exit(1)
