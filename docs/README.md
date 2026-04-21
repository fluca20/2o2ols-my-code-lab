# 🧠 MyCodeLab – Il tuo hub personale di strumenti

## 📁 Struttura

my-code-lab/
├── run.bat # Avvio rapido (Windows)
├── docs/
│ ├── README.md # Questa documentazione
│ └── privacy.html # Informativa privacy
├── scripts/
│ └── run.bat # Script legacy
├── tests/
│ └── weekly/ # Test dashboard settimanale
└── tools/
├── launcher/ # Menu principale (homepage)
├── weekly-dashboard/ # Strumento: tracking attività
└── ai-advisor/ # Strumento: consigli AI


## 🚀 Come avviare

**Doppio click** su `run.bat` nella cartella principale, oppure apri direttamente:
- `index.html` per il menu
- `tools/weekly-dashboard/index.html` per il tracking settimanale
- `tools/ai-advisor/index.html` per AI Advisor

## 🛠️ Strumenti disponibili

| Strumento | Descrizione | Percorso |
|-----------|-------------|----------|
| Dashboard Settimanale | Tracciamento attività, punti e livelli | `tools/weekly-dashboard/` |
| AI Advisor | Trova la miglior AI gratis per ogni compito | `tools/ai-advisor/` |

## 📌 Prerequisiti

- Browser moderno (Chrome, Edge, Firefox)
- Nessun server richiesto (100% locale)

## 🔧 Come aggiungere un nuovo strumento

1. Crea cartella in `tools/nome-strumento/`
2. Inserisci `index.html` (e CSS/JS)
3. Aggiungi card in `index.html`
4. Aggiungi link nella navbar di TUTTE le pagine