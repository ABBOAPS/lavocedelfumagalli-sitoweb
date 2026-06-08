---
title: "Tutorial: Come Funziona il Sito e Come Creare Nuovi Post"
date: 2026-06-04
tags: [tutorial, guida, prima-pagina, web]
description: "Una guida dettagliata per gli studenti redattori del Fumagalli: impara a pubblicare autonomamente nuovi articoli scrivendo semplici file Markdown."
category: "Guida"
image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1200&auto=format&fit=crop&q=80"
author: "Prof. Tecnico"
---

# Benvenuti nella Redazione di 'La Voce del Fumagalli'!

Se stai leggendo questo post, significa che sei pronto a lasciare la tua firma sul giornalino scolastico ufficiale del nostro istituto. La piattaforma è stata progettata per essere incredibilmente fluida, reattiva e, soprattutto, **offline-first e basata su Git**.

Non avrai bisogno di pannelli di controllo amministrativi complicati o database instabili: tutto quello che ti serve è saper scrivere un semplice file di testo in formato **Markdown (.md)** e inserirlo nella cartella redazionale.

---

## 🛠️ Come funziona l'architettura del sito?

Il nostro sito web scansiona autonomamente la cartella `content/` contenente tutti gli articoli scritti in formato Markdown. Quando un file viene aggiunto o caricato in questa cartella, il sito scolastico esegue automaticamente le seguenti operazioni:

1. **Lettura dei Metadati**: Estrae il blocchetto iniziale di configurazione dell'articolo.
2. **Generazione Automatica**: Calcola il tempo di lettura ideale in base al numero di parole presenti.
3. **Distribuzione nelle Sezioni**: Assegna l'articolo alla categoria e alle schede corrispondenti (Prima Pagina, Archivio o Progetti).
4. **Impaginazione Polaroid**: Carica un'immagine di copertina (se specificata) rendendola responsive per ogni dispositivo.

---

## ✍️ Come creare il tuo primo articolo

Per scrivere un articolo, crea un file con estensione `.md` (ad esempio `il_mio_articolo.md`) nella cartella `/content/` del progetto. Ciascun articolo deve contenere una sezione iniziale racchiusa tra tre trattini `---`, chiamata **Frontmatter**, contenente i dati essenziali:

```yaml
---
title: "Il Titolo del tuo Fantastico Post"
date: 2026-06-04
tags: [news, cultura, consigli]
description: "Un breve riassunto accattivante per invogliare lo studente a cliccare."
category: "News" # Esempi: News, Gite, Progetti, Sport, Guida
image: "https://images.unsplash.com/photo-X" # URL opzionale di un'immagine di copertina
---
```

Dopo la chiusura del blocco `---`, puoi iniziare a scrivere il testo del tuo articolo utilizzando la formattazione Markdown standard.

---

## 🎨 Guida alla formattazione del testo

Puoi rendere il testo dinamico e leggibile utilizzando queste semplici regole:

### Intestazioni e Sezioni
Usa i cancelletti per creare gerarchie chiare all'interno del post:
`## Sottotitolo del paragrafo` per le sezioni principali
`### Approfondimento` per concetti secondari

### Formattazione dei caratteri
* Per scrivere in **grassetto**, racchiudi le parole tra due asterischi: `**parola**`.
* Per scrivere parole in *corsivo*, usa un singolo asterisco: `*parola*`.

### Liste ed Elenchi
Se vuoi creare un elenco puntato, usa un asterisco seguito da uno spazio all'inizio della riga:
* Primo punto dell'elenco
* Secondo punto dell'elenco

Se vuoi creare un elenco numerato, usa semplicemente i numeri:
1. Sguardo basso e concentrato
2. Quaderno aperto sulla scrivania
3. Evita il contatto visivo diretto!

### Blocchi di Consiglio
Se vuoi aggiungere un consiglio o una perla di saggezza da evidenziare graficamente, usa il carattere maggiore `>` seguito da uno spazio all'inizio del paragrafo:
> CONSIGLIO: Ricordati di fare un salto al bar scolastico entro i primi due minuti della ricreazione se vuoi sperare di trovare ancora delle brioche calde!

---

## 🚀 Pubblicazione e Aggiornamento

Una volta terminata la scrittura del tuo file, effettua un commit del file creato o modificato all'interno della cartella `/content/`. Il sistema di integrazione farà il resto, e nel giro di pochi istanti il tuo articolo sarà online e consultabile da tutta la scuola!

Buona scrittura e viva il giornalino di istituto!
