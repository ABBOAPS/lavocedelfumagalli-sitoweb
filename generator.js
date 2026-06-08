/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from 'fs';
import path from 'path';

// Configurazione canali e site URL per la sitemap SEO
const SITE_URL = 'https://abboaps.github.io/lavocedelfumagalli-sitoweb'; // URL di esempio modificabile per GH Pages
const CONTENT_DIR = './content';
const OUT_DIR = './dist';

// Assicuriamoci che la cartella /dist esista
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

// Funzione di utility per estrarre e parsare il front-matter e il corpo Markdown
function parseMarkdown(fileContent) {
  const match = fileContent.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) {
    return { metadata: {}, body: fileContent };
  }
  const yamlText = match[1];
  const bodyText = match[2];
  
  const metadata = {};
  yamlText.split('\n').forEach(line => {
    const colonIndex = line.indexOf(':');
    if (colonIndex > -1) {
      const key = line.substring(0, colonIndex).trim();
      let val = line.substring(colonIndex + 1).trim();
      
      // Rimuoviamo virgolette iniziali/finali se presenti
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.substring(1, val.length - 1);
      }
      
      // Parsiamo array per i tags nel formato: [tag1, tag2, tag3]
      if (val.startsWith('[') && val.endsWith(']')) {
        val = val.substring(1, val.length - 1)
                 .split(',')
                 .map(s => s.trim().replace(/^['"]|['"]$/g, ''));
      }
      
      metadata[key] = val;
    }
  });
  
  return { metadata, body: bodyText };
}

// Traduttore Markdown minimale integrato per evitare dipendenze pesanti (NO Framework)
function markdownToHtml(md) {
  let html = md.trim();
  
  // Intestazioni (Headers)
  html = html.replace(/^### (.*?)$/gm, '<h3 class="text-xl font-extrabold text-slate-900 mt-6 mb-2 font-display uppercase tracking-tight">$1</h3>');
  html = html.replace(/^## (.*?)$/gm, '<h2 class="text-2xl font-extrabold text-slate-900 mt-8 mb-3 bg-cyan-100 border-2 border-black inline-block px-3 py-1 rotate-[-1deg] font-display">$1</h2>');
  html = html.replace(/^# (.*?)$/gm, '<h1 class="text-3xl md:text-4xl font-black text-black mt-4 mb-4 font-display leading-tight tracking-tight uppercase border-b-4 border-black pb-2">$1</h1>');
  
  // Linea divisoria (Dashed)
  html = html.replace(/^---$/gm, '<hr class="my-8 border-t-4 border-black border-dashed" />');
  
  // Elenchi Puntati e Numerati
  const lines = html.split('\n');
  let inList = false;
  let listType = ''; // 'ul' o 'ol'
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('* ') || line.startsWith('- ')) {
      const content = line.substring(2);
      if (!inList || listType !== 'ul') {
        let prefix = '';
        if (inList) prefix = `</${listType}>\n`;
        lines[i] = prefix + '<ul class="list-disc pl-6 my-4 space-y-2 font-sans text-slate-900">\n<li class="pl-1 font-medium">' + content + '</li>';
        inList = true;
        listType = 'ul';
      } else {
        lines[i] = '<li class="pl-1 font-medium">' + content + '</li>';
      }
    } else if (line.match(/^\d+\.\s(.*)/)) {
      const content = line.replace(/^\d+\.\s/, '');
      if (!inList || listType !== 'ol') {
        let prefix = '';
        if (inList) prefix = `</${listType}>\n`;
        lines[i] = prefix + '<ol class="list-decimal pl-6 my-4 space-y-2 font-sans text-slate-900">\n<li class="pl-1 font-medium">' + content + '</li>';
        inList = true;
        listType = 'ol';
      } else {
        lines[i] = '<li class="pl-1 font-medium">' + content + '</li>';
      }
    } else {
      if (inList && line !== '') {
        lines[i-1] = lines[i-1] + `\n</${listType}>`;
        inList = false;
        listType = '';
      }
    }
  }
  if (inList) {
    lines[lines.length - 1] = lines[lines.length - 1] + `\n</${listType}>`;
  }
  html = lines.join('\n');
  
  // Grassetti e Corsivi
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold bg-yellow-100 border-b-2 border-black px-1 text-black">$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em class="italic text-slate-900 font-semibold">$1</em>');
  
  // Citazioni (Blockquotes) - Ned survival style tips
  html = html.replace(/^>\s?(.*?)$/gm, '<div class="border-4 border-black bg-amber-50 p-4 my-6 shadow-[4px_4px_0px_0px_#000] rotate-[0.5deg]"><span class="block text-xs font-black uppercase text-amber-600 mb-1 font-mono">💡 CONSIGLIO DI SOPRAVVIVENZA:</span><p class="font-sans italic text-slate-900 font-medium">$1</p></div>');
  
  // Paragrafi
  html = html.split(/\n\n+/).map(p => {
    p = p.trim();
    if (!p) return '';
    // Evitiamo di inserire tag strutturali già esistenti in tag <p>
    if (p.startsWith('<h') || p.startsWith('<ul') || p.startsWith('<ol') || p.startsWith('<div') || p.startsWith('<hr') || p.startsWith('<li')) {
      return p;
    }
    return `<p class="my-4 font-sans leading-relaxed text-slate-800 text-base md:text-lg font-medium">${p}</p>`;
  }).join('\n');
  
  return html;
}

// 1. CARICAMENTO E PRE-ELABORAZIONE DEGLI ARTICOLI
const articles = [];

if (fs.existsSync(CONTENT_DIR)) {
  const files = fs.readdirSync(CONTENT_DIR);
  files.forEach(file => {
    if (file.endsWith('.md')) {
      const filePath = path.join(CONTENT_DIR, file);
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const { metadata, body } = parseMarkdown(fileContent);
      
      const slug = file.replace('.md', '');
      articles.push({
        slug,
        title: metadata.title || 'Senza Titolo',
        date: metadata.date ? new Date(metadata.date) : new Date(),
        dateStr: metadata.date || 'Data sconosciuta',
        tags: metadata.tags || [],
        description: metadata.description || 'Leggi l\'articolo completo su La Voce del Fumagalli.',
        htmlContent: markdownToHtml(body),
        originalFile: file
      });
    }
  });
}

// Ordiniamo dal più recente al più vecchio
articles.sort((a, b) => b.date - a.date);

// Dividiamo i contenuti in base ai requisiti richiesti
// 1. ARTICOLO FISSO IN PRIMA PAGINA (Sticky)
// Cerchiamo l'ultimo articolo che ha il tag 'prima-pagina'. Se non c'è, prendiamo semplicemente il più recente.
let stickyArticle = articles.find(art => art.tags.includes('prima-pagina'));
if (!stickyArticle && articles.length > 0) {
  stickyArticle = articles[0]; // Fallback sul più recente
}

// 2. ARTICOLI "IN EVIDENZA" NEL FOOTER DELLA HOME PAGE (I successivi 2 più recenti escluso lo sticky)
const remainingArticles = articles.filter(art => art.slug !== (stickyArticle ? stickyArticle.slug : ''));
const featuredArticles = remainingArticles.slice(0, 2);

// Template Shared: Navigation and Ned School Survival styles (pop colors, big borders, grids)
const NAVIGATION_HTML = `
  <header class="w-full max-w-5xl mx-auto px-4 pt-8 pb-4">
    <!-- Main Title Block with Ned-style offset visual shadow -->
    <div class="border-4 md:border-8 border-black bg-yellow-400 p-6 md:p-8 shadow-[8px_8px_0px_0px_#000] rotate-[-0.5deg] relative overflow-hidden mb-8">
      <div class="absolute top-0 right-0 h-40 w-40 bg-orange-500 opacity-20 rounded-full translate-x-20 -translate-y-20"></div>
      <div class="absolute bottom-2 left-4 px-2 py-0.5 bg-black text-yellow-400 font-mono text-xs font-bold rounded uppercase tracking-wider rotate-[2deg]">
        ★ IL GIORNALINO SCOLASTICO UFFICIALE ★
      </div>
      <h1 class="text-4xl md:text-6xl font-black tracking-tight text-black uppercase font-display select-none">
        La Voce del Fumagalli
      </h1>
      <p class="text-sm md:text-lg font-mono text-black font-extrabold mt-2 uppercase tracking-wide">
        Survival tips, gossip & progetti dell'I.I.S. Fumagalli ⚡
      </p>
    </div>

    <!-- Navigation Buttons in Notebook-Tabs style (Neo-brutalist pop tabs) -->
    <nav class="flex flex-wrap gap-3 md:gap-4 justify-start font-display text-base md:text-lg font-black uppercase">
      <a href="index.html" class="nav-home border-4 border-black bg-cyan-300 text-black px-5 py-2.5 shadow-[4px_4px_0px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_#000] transition-all flex items-center gap-1.5 rounded rotate-[-1deg]">
        🏠 Home
      </a>
      <a href="archivio.html" class="nav-archive border-4 border-black bg-orange-400 text-black px-5 py-2.5 shadow-[4px_4px_0px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_#000] transition-all flex items-center gap-1.5 rounded rotate-[1deg]">
        📅 Archivio
      </a>
      <a href="progetti.html" class="nav-projects border-4 border-black bg-lime-300 text-black px-5 py-2.5 shadow-[4px_4px_0px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_#000] transition-all flex items-center gap-1.5 rounded rotate-[-0.5deg]">
        💻 Progetti
      </a>
    </nav>
  </header>
`;

const WATERMARK_HTML = `
  <!-- SITE OFFERED BY WATERMARK: Brand ABBO APS richiesto -->
  <div class="w-full max-w-5xl mx-auto px-4 mt-12 mb-8">
    <div class="border-4 border-black bg-purple-500 text-white p-4 text-center rounded shadow-[6px_6px_0px_0px_#000] font-display uppercase font-black tracking-wider text-sm md:text-base rotate-[-0.5deg] relative overflow-hidden flex flex-wrap justify-center items-center gap-2">
      <span>🤝 SITO OFFERTO DA:</span>
      <span class="bg-black text-rose-300 px-3 py-1 text-sm rounded font-black border-2 border-rose-300 animate-pulse">ABBO APS</span>
      <span class="font-mono text-xs normal-case font-bold block md:inline text-purple-100">Associazione Promozione Sociale per la scuola e i territori.</span>
    </div>
  </div>
`;

// Genera un blocco HTML condiviso con le tag eleganti stile sticker
function renderTags(tags) {
  if (!tags || tags.length === 0) return '';
  const colors = [
    'bg-yellow-300 text-black border-yellow-500', 
    'bg-cyan-300 text-black border-cyan-500', 
    'bg-orange-300 text-black border-orange-500', 
    'bg-lime-300 text-black border-lime-500', 
    'bg-purple-300 text-black border-purple-500',
    'bg-rose-300 text-black border-rose-500'
  ];
  return '<div class="flex flex-wrap gap-2 mt-3">' + 
    tags.map((tag, i) => {
      const colorClass = colors[i % colors.length];
      return `<span class="px-2.5 py-1 text-xs font-black uppercase tracking-wider border-2 border-black shadow-[2px_2px_0px_0px_#000] rounded-sm ${colorClass}">#${tag}</span>`;
    }).join('') + 
    '</div>';
}

// Funzione base per assemblare una pagina intera iniettando i metadati SEO (Title, Description, OpenGraph)
function buildHtmlPage(title, description, canonicalUrl, mainContent, activeNavClass) {
  return `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - La Voce del Fumagalli</title>
  <meta name="description" content="${description}">
  
  <!-- SEO Open Graph Meta Tags -->
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:site_name" content="La Voce del Fumagalli">
  
  <!-- Tailwind CSS Playful CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  
  <!-- Font Google Popolari per un look fresco e giovanile: Fredoka One e Outfit -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;800;900&family=Fredoka:wght@400;600;700&display=swap" rel="stylesheet">
  
  <style>
    body {
      font-family: 'Outfit', sans-serif;
      /* Background quadrettato tipico del diario scolastico */
      background-color: #f7f3e9;
      background-image: 
        linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px);
      background-size: 20px 20px;
    }
    .font-display {
      font-family: 'Fredoka', cursive;
    }
    a.nav-${activeNavClass} {
      transform: scale(1.05) rotate(0deg) !important;
      border-color: #000000 !important;
      box-shadow: 6px 6px 0px 0px #000000 !important;
      filter: brightness(1.05);
    }
  </style>
</head>
<body class="min-h-screen text-slate-900 pb-12 flex flex-col justify-between">

  <div>
    ${NAVIGATION_HTML}
    
    <main class="w-full max-w-5xl mx-auto px-4 mt-4">
      ${mainContent}
    </main>
  </div>

  <div>
    ${WATERMARK_HTML}
    
    <footer class="w-full text-center text-xs font-mono font-bold text-slate-500 mt-4 px-4">
      <p>© 2026 La Voce del Fumagalli - Creato con il Generatore Statico Minimale di Scuola.</p>
      <p class="mt-1">Pagine generate dinamicamente pronte per GitHub Pages 🚀</p>
    </footer>
  </div>

</body>
</html>
`;
}

// ============================================
// PAGINA 1: HOME PAGE (index.html)
// ============================================
let homeHtml = '';
if (!stickyArticle) {
  homeHtml = `
    <div class="border-4 border-black bg-white p-8 text-center shadow-[6px_6px_0px_0px_#000] rotate-[-0.5deg]">
      <h2 class="text-2xl font-black font-display uppercase">Ops! Nessun articolo trovato</h2>
      <p class="font-sans text-slate-500 mt-2">Aggiungi file Markdown nella cartella <strong>/content</strong> per iniziare!</p>
    </div>
  `;
} else {
  // Prepariamo l'articolo principale
  homeHtml = `
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      <!-- Prima Pagina / Sticky Article Box (2 Colonne per dargli massima importanza) -->
      <section class="lg:col-span-2 border-4 border-black bg-white p-6 md:p-8 shadow-[8px_8px_0px_0px_#000] relative rounded-md">
        
        <!-- Badge Stile Adesivo "Sticky" -->
        <div class="absolute -top-4 -right-2 bg-rose-500 text-white border-4 border-black px-4 py-1.5 font-display font-black text-xs md:text-sm skew-x-3 rotate-[3deg] shadow-[3px_3px_0px_0px_#000] uppercase tracking-wider z-10 animate-bounce">
          📌 PRIMA PAGINA !!
        </div>
        
        <div class="mb-4">
          <span class="font-mono text-xs font-extrabold bg-slate-900 text-white px-2 py-1 rounded">
            🗓️ ${stickyArticle.dateStr}
          </span>
        </div>
        
        <!-- Articolo vero e proprio -->
        <article class="prose max-w-none">
          <h1 class="text-3xl md:text-5xl font-black text-black font-display leading-tight uppercase border-b-4 border-black pb-3">
            ${stickyArticle.title}
          </h1>
          
          <div class="mt-6 md:mt-8 space-y-4 text-slate-800">
            ${stickyArticle.htmlContent}
          </div>
        </article>
        
        <!-- Render Tags -->
        <div class="mt-8 pt-4 border-t-2 border-black/10">
          <p class="text-xs font-black uppercase text-slate-500 font-mono">Etichette scolastiche:</p>
          ${renderTags(stickyArticle.tags)}
        </div>
      </section>
      
      <!-- Barra Laterale con Info Generali e Regolamento del Fumagalli -->
      <aside class="col-span-1 space-y-6">
        
        <!-- Chi Siamo Block (Pop stamp) -->
        <div class="border-4 border-black bg-cyan-100 p-6 shadow-[6px_6px_0px_0px_#000] rounded rotate-[1deg]">
          <h3 class="text-xl font-black font-display text-black uppercase mb-2 border-b-2 border-black pb-1">⚡ Che cos'è questo?</h3>
          <p class="font-sans font-medium text-slate-800 text-sm leading-relaxed">
            È la voce degli studenti dell'istituto Fumagalli! Articoli freschi, suggerimenti di sopravvivenza per le interrogazioni e news sui laboratori di robotica, grafica e sport.
          </p>
          <div class="mt-4 bg-white/75 border-2 border-black p-2 text-xs font-mono font-bold rounded">
            📝 Scritto interamente in semplice Markdown.
          </div>
        </div>

        <!-- Survival Tips Banner -->
        <div class="border-4 border-black bg-yellow-300 p-6 shadow-[6px_6px_0px_0px_#000] rounded rotate-[-1deg] relative overflow-hidden">
          <div class="absolute -top-6 -right-6 text-6xl text-amber-500/20 font-bold opacity-30 select-none">🔑</div>
          <h3 class="text-xl font-black font-display text-black uppercase mb-2">📒 SURVIVAL KIT</h3>
          <p class="font-sans font-medium text-sm text-slate-900">
            "Se il prof ti fissa alla lavagna, bevi una sorsata d'acqua molto lentamente. Ti farà guadagnare almeno 15 secondi di autonomia!"
          </p>
          <p class="font-mono text-xs font-black mt-2 text-amber-800">— Ned's Tip #102</p>
        </div>
        
        <!-- Statistiche sito statico -->
        <div class="border-4 border-black bg-lime-200 p-6 shadow-[6px_6px_0px_0px_#000] rounded">
          <h3 class="text-lg font-black font-display text-black uppercase mb-3 text-center border-b-2 border-black pb-1">📊 Numeri Veloci</h3>
          <div class="grid grid-cols-2 gap-2 text-center">
            <div class="bg-white border-2 border-black p-2 rounded">
              <span class="block text-2xl font-black">${articles.length}</span>
              <span class="text-[10px] font-mono font-bold uppercase text-slate-500">Post Totali</span>
            </div>
            <div class="bg-white border-2 border-black p-2 rounded">
              <span class="block text-2xl font-black">${articles.filter(a => a.tags.includes('progetti')).length}</span>
              <span class="text-[10px] font-mono font-bold uppercase text-slate-500">Progetti</span>
            </div>
          </div>
        </div>
        
      </aside>
    </div>

    <!-- SEZIONE IN EVIDENZA (Footer della Home Page) - Altri 2 articoli recenti richiesti -->
    <section class="mt-12">
      <div class="border-4 border-black bg-orange-400 p-4 shadow-[4px_4px_0px_0px_#000] inline-block mb-6 rotate-[-1deg]">
        <h2 class="text-2xl font-black font-display uppercase text-black flex items-center gap-2">
          🔥 IN EVIDENZA QUESTA SETTIMANA:
        </h2>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        ${featuredArticles.length === 0 ? `
          <div class="col-span-2 border-4 border-black bg-white p-6 text-center shadow-[4px_4px_0px_0px_#000]">
            <p class="font-mono text-slate-500">Nessun altro articolo recente disponibile.</p>
          </div>
        ` : featuredArticles.map(art => `
          <div class="border-4 border-black bg-white p-6 shadow-[6px_6px_0px_0px_#000] relative hover:translate-y-1 transition-all flex flex-col justify-between">
            <div>
              <span class="text-xs font-mono font-extrabold text-slate-500 block mb-2">🗓️ ${art.dateStr}</span>
              <h3 class="text-xl md:text-2xl font-black font-display leading-tight uppercase mb-2 hover:text-cyan-600 transition-colors">
                ${art.title}
              </h3>
              <p class="font-sans text-sm md:text-base font-medium text-slate-600 line-clamp-3">
                ${art.description}
              </p>
            </div>
            <div class="mt-4 pt-3 border-t border-slate-150">
              ${renderTags(art.tags)}
              <div class="mt-4 text-right">
                <a href="archivio.html" class="inline-block border-2 border-black bg-yellow-400 text-black px-3.5 py-1.5 text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_#000] hover:bg-yellow-300">
                  Leggi nell'Archivio →
                </a>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </section>
  `;
}

const finalHomeHtml = buildHtmlPage(
  'Home', 
  stickyArticle ? stickyArticle.description : 'La Voce del Fumagalli - Il Giornalino Scolastico',
  `${SITE_URL}/index.html`,
  homeHtml,
  'home'
);
fs.writeFileSync(path.join(OUT_DIR, 'index.html'), finalHomeHtml);


// ============================================
// PAGINA 2: ARCHIVIO (archivio.html)
// ============================================
let archiveHtml = `
  <div class="mb-8 border-4 border-black bg-orange-300 p-6 shadow-[6px_6px_0px_0px_#000] rotate-[-0.5deg]">
    <h2 class="text-3xl font-black font-display uppercase tracking-tight text-black">📚 ARCHIVIO STORICO GENERALE</h2>
    <p class="font-sans text-sm md:text-base font-semibold text-slate-800 mt-2">
      Tutti gli articoli della Gazzetta scolastica in ordine cronologico inverso, dal più recente al più datato.
    </p>
  </div>

  <div class="space-y-8 mt-6">
    ${articles.length === 0 ? `
      <div class="border-4 border-black bg-white p-8 text-center shadow-[4px_4px_0px_0px_#000]">
        <p class="font-mono text-slate-500">Nessun articolo registrato.</p>
      </div>
    ` : articles.map((art, index) => `
      <article id="${art.slug}" class="border-4 border-black bg-white p-6 md:p-8 shadow-[6px_6px_0px_0px_#000] rounded-md relative ${index % 2 === 0 ? 'rotate-[-0.3deg]' : 'rotate-[0.3deg]'}">
        
        <!-- Floating Post Label counter -->
        <span class="absolute -top-3 -left-3 bg-black text-rose-300 font-mono text-xs font-black border-2 border-rose-300 px-2.5 py-0.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded uppercase">
          POST #${articles.length - index}
        </span>

        <div class="flex flex-wrap items-center justify-between gap-2 mb-4">
          <span class="font-mono text-xs font-extrabold bg-slate-900 text-white px-2.5 py-1 rounded inline-block">
            📅 DATA DI PUBBLICAZIONE: ${art.dateStr}
          </span>
          <div class="flex items-center gap-2">
            ${art.tags.includes('prima-pagina') ? '<span class="bg-rose-500 border-2 border-black text-white px-2 py-0.5 text-xs font-black font-display uppercase rounded">PRIMA PAGINA</span>' : ''}
            <button onclick="navigator.clipboard.writeText(window.location.origin + window.location.pathname + '#${art.slug}').then(() => { this.innerText = 'Copiato! ✓'; const btn = this; setTimeout(() => btn.innerText = 'Condividi 🔗', 2000); })" class="border-2 border-black bg-pink-300 hover:bg-pink-400 text-black px-3 py-1 text-xs font-black uppercase shadow-[2px_2px_0px_0px_#000] rounded transition-all active:translate-y-0.5 cursor-pointer">
              Condividi 🔗
            </button>
          </div>
        </div>
        
        <h2 class="text-2xl md:text-3xl font-black font-display uppercase text-black leading-tight border-b-2 border-black pb-2">
          ${art.title}
        </h2>
        
        <div class="mt-4 text-slate-800 prose max-w-none">
          ${art.htmlContent}
        </div>
        
        <div class="mt-6 pt-4 border-t-2 border-dashed border-black/10">
          ${renderTags(art.tags)}
        </div>
      </article>
    `).join('')}
  </div>
`;

const finalArchiveHtml = buildHtmlPage(
  'Archivio', 
  'Archivio completo degli articoli della Gazzetta scolastica dell\'IIS Fumagalli.',
  `${SITE_URL}/archivio.html`,
  archiveHtml,
  'archive'
);
fs.writeFileSync(path.join(OUT_DIR, 'archivio.html'), finalArchiveHtml);


// ============================================
// PAGINA 3: PROGETTI (progetti.html)
// ============================================
const projectArticles = articles.filter(art => art.tags.includes('progetti'));

let projectsHtml = `
  <div class="mb-8 border-4 border-black bg-lime-300 p-6 shadow-[6px_6px_0px_0px_#000] rotate-[0.5deg]">
    <h2 class="text-3xl font-black font-display uppercase tracking-tight text-black">🔬 WORKSHOP & PROGETTI ATTIVI</h2>
    <p class="font-sans text-sm md:text-base font-semibold text-slate-800 mt-2">
      In questa pagina raccogliamo tutti i file Markdown che contengono il tag speciale <code class="bg-white px-1.5 py-0.5 rounded border border-black font-mono">progetti</code>.
    </p>
  </div>

  <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
    ${projectArticles.length === 0 ? `
      <div class="col-span-2 border-4 border-black bg-white p-8 text-center shadow-[4px_4px_0px_0px_#000]">
        <p class="font-mono text-slate-500">Nessun progetto didattico trovato con la tag 'progetti'.</p>
      </div>
    ` : projectArticles.map((art, index) => `
      <article id="${art.slug}" class="border-4 border-black bg-white p-6 shadow-[6px_6px_0px_0px_#000] flex flex-col justify-between rounded-md relative ${index % 2 === 0 ? 'rotate-[-0.5deg]' : 'rotate-[0.5deg]'}">
        
        <div>
          <div class="flex items-center justify-between mb-3 gap-2">
            <span class="text-xs font-mono font-extrabold text-slate-500">🧪 PROGETTO SCOLASTICO</span>
            <div class="flex items-center gap-2">
              <span class="text-xs font-mono font-bold bg-lime-100 text-lime-800 px-2 py-0.5 rounded border border-lime-300">${art.dateStr}</span>
              <button onclick="navigator.clipboard.writeText(window.location.origin + window.location.pathname + '#${art.slug}').then(() => { this.innerText = 'Copiato! ✓'; const btn = this; setTimeout(() => btn.innerText = 'Condividi 🔗', 2000); })" class="border-2 border-black bg-pink-300 hover:bg-pink-400 text-black px-2 py-0.5 text-[10px] font-black uppercase shadow-[1.5px_1.5px_0px_0px_#000] rounded transition-all active:translate-y-0.5 cursor-pointer">
                Condividi 🔗
              </button>
            </div>
          </div>
          
          <h3 class="text-2xl font-black font-display text-black uppercase leading-snug border-b-2 border-black pb-2">
            ${art.title}
          </h3>
          
          <div class="mt-4 prose text-slate-800 text-sm md:text-base leading-relaxed font-sans font-medium">
            ${art.htmlContent}
          </div>
        </div>
        
        <div class="mt-6 pt-4 border-t border-slate-100">
          <p class="text-[10px] font-mono font-black uppercase text-slate-400 mb-2">Ambiti e tecnologie:</p>
          ${renderTags(art.tags)}
        </div>
      </article>
    `).join('')}
  </div>
`;

const finalProjectsHtml = buildHtmlPage(
  'Progetti', 
  'Progetti scolastici dei ragazzi e laboratori attivi dell\'I.I.S. Fumagalli.',
  `${SITE_URL}/progetti.html`,
  projectsHtml,
  'projects'
);
fs.writeFileSync(path.join(OUT_DIR, 'progetti.html'), finalProjectsHtml);


// ============================================
// GENERAZIONE DYNAMIC SITEMAP.XML (SEO)
// ============================================
const sitemapUrlEntries = [
  'index.html',
  'archivio.html',
  'progetti.html'
];

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${sitemapUrlEntries.map(page => `
  <url>
    <loc>${SITE_URL}/${page}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>${page === 'index.html' ? '1.0' : '0.8'}</priority>
  </url>`).join('')}
</urlset>`;

fs.writeFileSync(path.join(OUT_DIR, 'sitemap.xml'), sitemapXml.trim());

console.log('✨ CONFIGURAZIONE BUILD COMPLETATA CON SUCCESSO! SITO COMBILATO IN /dist ✨');
console.log(' Pagine generate: index.html, archivio.html, progetti.html');
console.log(' File SEO esportato: sitemap.xml');
