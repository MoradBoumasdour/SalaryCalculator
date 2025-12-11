Salary Calculator — Calcolatore RAL → Netto
Converti la tua Retribuzione Annua Lorda (RAL) in stipendio netto mensile e annuo, con supporto a 13ª/14ª, modalità scura, esportazione in PDF e interfaccia moderna costruita con Astro + React + TailwindCSS.

🚀 Tech Stack
Questo progetto utilizza una combinazione moderna di tecnologie:
Framework & UI
Astro – struttura statica, componenti server-first
React (isola dinamica) – per la logica interattiva del calcolatore
TailwindCSS – styling utility-first
Dark Mode nativa – con persistenza via localStorage e preferenze sistema (prefers-color-scheme)

Funzionalità aggiuntive
Esportazione PDF tramite @react-pdf/renderer
Componenti Astro + integrazione React
Supporto SVG (icone PDF)
Tema dark/light switch con icone animate

📂 Struttura del progetto
/
├── src/
│   ├── components/
│   │   └── Calculator.jsx         # Calcolatore React (isola)
│   ├── layouts/
│   │   └── Layout.astro           # Layout principale + gestione tema
│   ├── pages/
│   │   └── index.astro            # Pagina principale
│   └── styles/
│       └── global.css             # TailwindCSS e stili globali
└── public/
    └── pdf.svg                    # icona PDF

✨ Funzionalità
🔹 Calcolo completo da RAL → Netto
Il calcolatore gestisce automaticamente:
Contributi INPS
Reddito imponibile
IRPEF
Netto annuo
Netto mensile (13 mensilità — estendibile a 14)

🔹 Dark Mode
Tema scuro gestito via classi Tailwind (dark:)
Persistenza tramite localStorage
Fallback automatico al tema del sistema (prefers-color-scheme)
Toggle in alto a destra con icone ☀️ / 🌙

🔹 Esportazione PDF
Generazione istantanea tramite:
@react-pdf/renderer
Con layout dedicato e valori formattati in stile monetario 🇮🇹.

🔹 UI moderna e responsiva
Grazie a Tailwind:
layout reattivo
palette light/dark
card per i risultati
focus ring accessibile
icone SVG

🛠️ Installazione
Clona il repository:
git clone https://github.com/tuo-username/salary-calculator.git
cd salary-calculator


Installa le dipendenze:
npm install


Avvia il server di sviluppo:
npm run dev

Apri il browser →
👉 http://localhost:4321
📦 Build

Per generare i file statici:
npm run build

Per avviare l'anteprima:
npm run preview

🧩 Personalizzazione
▸ Modifica aliquote / logica
Dentro Calculator.jsx:
const inpsRate = 0.0949;
const irpef = taxable * 0.25;
const netMonthly = netAnnual / 13;


Puoi aggiungere il toggle 13/14 mensilità qui.
🗂️ Licensing
Questo progetto è distribuito con licenza MIT.

🤝 Contributi
I contributi sono benvenuti!
Apri una issue o una pull request per miglioramenti, bugfix o nuove funzionalità.

💬 Contatti
Per supporto, domande o miglioramenti puoi aprire una issue o scrivere a:
📧 morad.boumasdour@gmail.com