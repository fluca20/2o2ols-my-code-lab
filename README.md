# 🧠 MyCodeLab – Il tuo hub personale di strumenti

## 📁 Struttura

my-code-lab/
├── index.html # Menu principale (launcher)
├── navbar.css # Stile condiviso della navigazione
├── run.bat / run.sh # Script di avvio rapido
├── tools/ # Tutti gli strumenti
│ ├── index.html # Dashboard Settimanale
│ ├── script.js # Logica della dashboard
│ └── style.css # Stile della dashboard
├── scripts/ # Script singoli (futuri)
├── libs/ # Librerie riusabili
└── docs/ # Documentazione


## 🚀 Come avviare

- **Doppio click** su `index.html` nel browser
- Oppure esegui `./run.sh` (Linux/macOS) o `run.bat` (Windows)

## 🛠️ Strumenti disponibili

| Strumento | Descrizione | Percorso |
|-----------|-------------|----------|
| Dashboard Settimanale | Tracciamento attività, punti e livelli | `tools/index.html` |

## ➕ Come aggiungere un nuovo strumento

1. Crea una nuova cartella in `tools/` (es. `tools/mio-strumento/`)
2. Inserisci i file (HTML, JS, CSS)
3. Aggiungi una **card** nel menu principale (`index.html`) nella sezione `.tools-grid`
4. Aggiungi un **link** nella navbar (`navbar-universale`) su **tutte le pagine**

## 📌 Prerequisiti

- Un browser moderno (Chrome, Edge, Firefox)
- Nessun server richiesto (funziona completamente in locale)

## 🎯 Prossimi passi

- Aggiungere altri strumenti
- Centralizzare stili e utility comuni
- Aggiungere test automatici