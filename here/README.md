
# Calcolatore RAL → Netto

## Report Tecnico e Tecnologie Utilizzate

Questa applicazione web calcola lo stipendio netto a partire dalla RAL (Retribuzione Annua Lorda), secondo le regole fiscali italiane aggiornate al 2025. Il progetto è pensato per essere veloce, accessibile e facilmente estendibile.

---

### Stack Tecnologico

- **Astro**: framework principale per la generazione di HTML statico e l'integrazione di componenti React solo dove necessario (islands architecture).
- **React**: per la logica interattiva del calcolatore e la generazione dinamica dei risultati.
- **TypeScript**: per la sicurezza dei tipi e la manutenzione del codice.
- **TailwindCSS**: per uno styling rapido e responsivo con approccio utility-first, inclusa la dark mode.
- **@react-pdf/renderer**: per generare PDF direttamente lato client, senza backend.

---

### Funzionalità Implementate

- Calcolo netto da RAL con scaglioni IRPEF reali 2025:
  - 23% fino a 28.000€
  - 35% da 28.001€ a 50.000€
  - 43% oltre 50.000€
- Calcolo e visualizzazione delle addizionali regionali (automatiche in base alla regione selezionata) e comunali (valore fisso personalizzabile).
- Selezione regione e mensilità (13/14 mesi) tramite dropdown.
- Risultati dettagliati e scaricabili in PDF.
- Tema chiaro/scuro con toggle e salvataggio preferenza.

---

### Struttura del Progetto

```
here/
├── astro.config.mjs
├── tailwind.config.cjs
├── tsconfig.json
├── package.json
├── public/
│   └── pdf.svg
└── src/
    ├── components/
    │   ├── Calculator.tsx         # componente React principale
    │   └── SalaryCalculator.astro # wrapper Astro
    ├── layouts/
    │   └── Layout.astro           # layout base
    ├── lib/
    │   └── aliquoteRegioni2025.ts # aliquote regionali IRPEF
    ├── pages/
    │   └── index.astro
    └── styles/
        └── global.css
```

---

### Logica di Calcolo

1. **Contributi INPS**: 9,49% della RAL (quota dipendente)
2. **Reddito imponibile**: RAL - INPS
3. **IRPEF**: calcolata con scaglioni 2025
4. **Addizionali regionali**: in base alla regione selezionata
5. **Addizionali comunali**: valore fisso (modificabile nel codice)
6. **Netto annuo**: RAL - INPS - IRPEF - addizionali
7. **Netto mensile**: netto annuo diviso per mensilità

Esempio funzione IRPEF:

```typescript
function calcolaIrpef(imponibile: number): number {
  if (imponibile <= 28000) return imponibile * 0.23;
  if (imponibile <= 50000) return 28000 * 0.23 + (imponibile - 28000) * 0.35;
  return 28000 * 0.23 + 22000 * 0.35 + (imponibile - 50000) * 0.43;
}
```

Tutti i valori sono formattati in euro secondo la localizzazione italiana.

---

### Modalità Scura (Dark Mode)

Gestita tramite TailwindCSS (`dark:`), con preferenza salvata in localStorage e fallback su `prefers-color-scheme` di sistema.

---

### PDF Client-Side

Il PDF viene generato direttamente nel browser tramite `@react-pdf/renderer`, senza invio dati a server esterni.

---

### Installazione e Avvio

```bash
# clona il repo
git clone <url-repo>
cd here

# installa le dipendenze
npm install

# avvia in sviluppo
npm run dev
```

Server di sviluppo: `http://localhost:4321`

Per la build di produzione:

```bash
npm run build
npm run preview
```

---

### Contatti

Morad Boumasdour  
morad.boumasdour@gmail.com

---

*Ultimo aggiornamento: Dicembre 2025*
