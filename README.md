<div align="center">
  <h1>🏫 La Voce del Fumagalli</h1>
  <p><strong>Il giornalino scolastico dell'I.I.S. Fumagalli di Casatenovo (LC)</strong></p>
  <p><em>Sito web ufficiale e generatore di contenuti statici con stile grafico retro "Ned's Declassified School Survival Guide" (diario scolastico).</em></p>
  
  <p>
    <a href="https://github.com/ABBO-APS/lavocedelfumagalli-siteweb/actions/workflows/deploy.yml">
      <img src="https://github.com/ABBO-APS/lavocedelfumagalli-siteweb/actions/workflows/deploy.yml/badge.svg" alt="Deploy status" />
    </a>
    <a href="https://github.com/ABBO-APS/lavocedelfumagalli-siteweb/actions/workflows/main.yml">
      <img src="https://github.com/ABBO-APS/lavocedelfumagalli-siteweb/actions/workflows/main.yml/badge.svg" alt="CI Status" />
    </a>
  </p>
</div>

---

## 📌 Cos'è "La Voce del Fumagalli"

Questo repository contiene il codice sorgente e i contenuti per il giornalino scolastico de **La Voce del Fumagalli**. Il progetto è stato sviluppato in collaborazione con **ABBO APS** (Associazione di Promozione Sociale) per offrire agli studenti e ai docenti dell'istituto uno spazio dove pubblicare articoli, progetti di laboratorio (robotica, maker, ecc.) e consigli di sopravvivenza scolastica.

Il sito web adotta uno stile **Neo-brutalist / Diario scolastico** con colori accesi, bordi spessi e badge adesivi, ispirato alle estetiche dei notebook studenteschi.

---

## 🚀 Come Eseguire il Progetto in Locale

### Prerequisiti
* **Node.js** (versione 20 o superiore consigliata)
* **npm** (incluso con Node.js)

### 1. Installazione delle dipendenze
Dalla cartella principale del progetto, esegui:
```bash
npm install
```

### 2. Sviluppo in locale (Vite + React)
Per avviare il server di sviluppo con HMR (Hot Module Replacement):
```bash
npm run dev
```
Il sito sarà accessibile all'indirizzo [http://localhost:3000](http://localhost:3000).

### 3. Compilazione dell'applicazione (React)
Per generare la build di produzione del sito in modalità Single Page Application (SPA):
```bash
npm run build
```
I file compilati verranno salvati nella cartella `dist/`.

### 4. Generazione del sito statico puro (Alternativa)
Nel repository è presente anche uno script generatore statico (`generator.js`) che converte i file Markdown in pagine HTML statiche tradizionali:
```bash
node generator.js
```
Questo genererà le pagine `index.html`, `archivio.html` e `progetti.html` all'interno di `dist/`, oltre alla sitemap SEO.

---

## ✍️ Come Aggiungere o Modificare gli Articoli

Tutti gli articoli sono scritti in semplice formato **Markdown** e sono ospitati nella cartella `content/`. Qualsiasi commit o Pull Request con un nuovo file `.md` attiverà la build automatica tramite GitHub Actions e pubblicherà il nuovo articolo.

Ogni file Markdown deve iniziare con un blocco **Frontmatter** delimitato da tre trattini (`---`).

### Esempio di Struttura File (`content/nuovo-articolo.md`):

```markdown
---
title: "Titolo dell'Articolo"
date: "2026-06-08"
author: "Il Fumagalliano di Quarta"
category: "News"
tags: [sopravvivenza, consigli, gite]
image: "https://ai.google.dev/static/site-assets/images/share-ais-513315318.png"
description: "Una breve descrizione di due righe che comparirà nell'anteprima dell'archivio."
---

Questo è il corpo dell'articolo scritto in Markdown. Puoi usare:
* **Grassetto** usando i doppi asterischi
* *Corsivo* usando l'asterisco singolo
* Liste puntate o numerate

> E anche le citazioni (blockquotes), che compariranno come una card dorata "Consiglio di Sopravvivenza".
```

### Tag Speciali:
* **`prima-pagina`**: Inserendo questo tag tra i tag dell'articolo, il post verrà ancorato permanentemente nella sezione della prima pagina (Home) anziché scorrere via nei post recenti.
* **`progetti`**: Questo tag identifica le attività laboratoriali e i lavori maker. Gli articoli con questo tag verranno mostrati automaticamente nella scheda **Progetti**.

---

## 🗂️ Struttura del Progetto

* `content/` - Contiene tutti gli articoli e i post in formato `.md`.
* `src/` - Contiene l'applicazione React con i componenti e gli stili.
  * `App.tsx` - File principale con l'interfaccia interattiva del giornalino.
  * `config.ts` - Configurazione globale dei testi statici per consentire rapide modifiche da parte dei docenti.
  * `index.css` - Foglio di stile CSS con stili personalizzati Tailwind v4.
* `generator.js` - Script Node.js per compilare il Markdown in HTML statico puro.
* `.github/workflows/` - Automazioni di CI/CD per il controllo del codice e il deployment su GitHub Pages.

---

## ⚖️ Licenza e Diritti d'Autore (Proprietary License)

> [!IMPORTANT]
> **TUTTI I DIRITTI RISERVATI (ALL RIGHTS RESERVED)**

Questo software e tutti i suoi contenuti (inclusi, ma non limitati a: testi degli articoli, immagini, loghi, grafica, fogli di stile ed elementi di design) sono protetti dalle leggi sul diritto d'autore.

* **Divieto di utilizzo**: È vietato utilizzare questo codice per ospitare versioni clonate o derivate del sito web al di fuori dei canali ufficiali autorizzati da ABBO APS e dall'I.I.S. Fumagalli.
* **Divieto di ridistribuzione**: È espressamente vietato copiare, ridistribuire, vendere, sublicenziare o trasferire in qualsiasi forma il codice sorgente o i contenuti a terzi.
* **Proprietà dei Contenuti**: Tutti gli articoli pubblicati sono di proprietà intellettuale dell'I.I.S. Fumagalli e dei rispettivi autori scolastici.

Per maggiori dettagli consultare il file [LICENSE](file:///home/tonnoconsorzio/Progetti/ABBO/la-voce-del-fumagalli/LICENSE).

---
*Sviluppato con ❤️ da [ABBO APS](https://www.abbops.org) per la comunità scolastica dell'I.I.S. Fumagalli.*
# lavocedelfumagalli-siteweb
# lavocedelfumagalli-siteweb
# lavocedelfumagalli-sitoweb
