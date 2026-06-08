/// <reference types="vite/client" />

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Calendar,
  Tag, 
  Info, 
  Search, 
  ExternalLink, 
  Sparkles, 
  Check, 
  Heart,
  ChevronRight,
  BookOpen,
  ArrowLeft,
  Share2
} from 'lucide-react';
import { SITE_CONFIG } from './config';

interface Article {
  slug: string;
  title: string;
  date: string;
  author: string;
  category: string;
  tags: string[];
  description: string;
  content: string;
  readTime: string;
  image?: string;
}

// Dynamically import all markdown files from /content at build-time using Vite's glob import.
// This ensures that whenever a commit is pushed on GitHub, the site rebuilds and shows the new article automatically!
const mdModules = import.meta.glob('../content/*.md', { query: '?raw', eager: true }) as Record<string, { default: string }>;

const parseMarkdownFile = (filepath: string, rawContent: string): Article => {
  const slug = filepath.split('/').pop()?.replace('.md', '') || 'articolo';
  
  // Extract frontmatter block: between the two ---
  const match = rawContent.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) {
    return {
      slug,
      title: 'Nuovo Articolo',
      date: new Date().toISOString().split('T')[0],
      author: 'Redazione',
      category: 'News',
      tags: [],
      description: 'Leggi l\'articolo completo su La Voce del Fumagalli.',
      content: rawContent,
      readTime: '3 min'
    };
  }
  
  const yamlText = match[1];
  const bodyText = match[2];
  
  const metadata: Record<string, string> = {};
  yamlText.split('\n').forEach(line => {
    const colonIndex = line.indexOf(':');
    if (colonIndex > -1) {
      const key = line.substring(0, colonIndex).trim();
      let val = line.substring(colonIndex + 1).trim();
      
      // Strip outer quotes if present
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.substring(1, val.length - 1);
      }
      metadata[key] = val;
    }
  });
  
  // Parse tags array
  let parsedTags: string[] = [];
  if (metadata.tags) {
    let tVal = metadata.tags;
    if (tVal.startsWith('[') && tVal.endsWith(']')) {
      tVal = tVal.substring(1, tVal.length - 1);
    }
    parsedTags = tVal.split(',').map(s => s.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean);
  }
  
  const wordCount = bodyText.split(/\s+/).length;
  const calcReadTime = `${Math.max(1, Math.ceil(wordCount / 200))} min`;
  
  return {
    slug,
    title: metadata.title || 'Nuovo Articolo',
    date: metadata.date || new Date().toISOString().split('T')[0],
    author: metadata.author || 'La Redazione',
    category: metadata.category || (parsedTags.includes('progetti') ? 'Progetti' : 'News'),
    tags: parsedTags,
    description: metadata.description || 'Leggi l\'articolo completo su La Voce del Fumagalli.',
    content: bodyText.trim(),
    readTime: metadata.readTime || calcReadTime,
    image: metadata.image || undefined
  };
};

// Dynamic text parsing utilities to fill cards beautifully with text when they don't have images
const getArticlePreviewText = (art: Article) => {
  if (art.description && art.description !== 'Leggi l\'articolo completo su La Voce del Fumagalli.') {
    return art.description;
  }
  const paras = art.content.split('\n\n')
    .map(p => p.trim())
    .filter(p => {
      if (!p) return false;
      if (p.startsWith('#')) return false;
      if (p.startsWith('![')) return false;
      if (p.startsWith('---')) return false;
      if (p.startsWith('<')) return false;
      if (p.startsWith('*') || p.startsWith('-') || p.startsWith('>')) return false;
      if (p.length < 15) return false; // skip headers or tiny fragments
      return true;
    });
  return paras[0] || '';
};

const getSpotlightBlocksToShow = (art: Article) => {
  const allBlocks = art.content.split('\n\n');
  const filtered = allBlocks.filter(block => {
    const trimmed = block.trim();
    if (!trimmed) return false;
    if (trimmed.startsWith('#') || trimmed.startsWith('![') || trimmed.startsWith('---')) return false;
    return true;
  });
  // If the article has no image, render up to 4 paragraphs to fully utilize notebook paper. Otherwise render 2 paragraphs.
  const limit = art.image ? 2 : 4;
  return filtered.slice(0, limit);
};

//// Dynamic card styling themed by the section (Orange for Emphasis, Cyan for regular first-page articles, Lime for projects)
const getCardCustomTheme = (tags: string[] = [], category: string = '', isSpotlight = false) => {
  const isProgetto = tags.some(t => t.toLowerCase().includes('progett') || t.toLowerCase().includes('progetto')) || category.toLowerCase().includes('progett') || category.toLowerCase().includes('progetto');
  
  if (isSpotlight) {
    // Emphasis Theme (Orange)
    return {
      bg: 'bg-white hover:bg-neutral-50/50',
      badgeBg: 'bg-orange-600',
      badgeText: 'text-white',
      tagBg: 'bg-orange-50 text-orange-950 border-orange-200',
      tagText: 'text-orange-950',
      btnBg: 'bg-orange-500 hover:bg-orange-400 text-black border-black font-black',
      borderLine: 'border-dashed border-orange-300',
      emoji: '🔥',
      textColor: 'text-slate-950',
      textHover: 'group-hover:text-orange-600',
      accentBorder: 'border-l-3 border-orange-500 pl-3',
      stickerBg: 'bg-orange-500 text-black border-2 border-black px-2 py-0.5 rounded text-[9px] uppercase font-bold shadow-[1.5px_1.5px_0px_#000]',
      shadowClass: 'shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_rgba(0,0,0,1)]'
    };
  }

  if (isProgetto) {
    // Projects Theme (Lime)
    return {
      bg: 'bg-white hover:bg-neutral-50/50',
      badgeBg: 'bg-lime-950',
      badgeText: 'text-lime-300',
      tagBg: 'bg-lime-50 text-lime-950 border-lime-250',
      tagText: 'text-lime-950',
      btnBg: 'bg-lime-400 hover:bg-lime-300 text-slate-950 border-black font-black',
      borderLine: 'border-dashed border-lime-350',
      emoji: '🧪',
      textColor: 'text-slate-950',
      textHover: 'group-hover:text-lime-600',
      accentBorder: 'border-l-3 border-lime-500 pl-3',
      stickerBg: 'bg-lime-400 text-slate-950 border-2 border-black px-2 py-0.5 rounded text-[9px] uppercase font-bold shadow-[1.5px_1.5px_0px_#000]',
      shadowClass: 'shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_rgba(0,0,0,1)]'
    };
  }

  // Articles on the First Page Theme (Cyan)
  return {
    bg: 'bg-white hover:bg-neutral-50/50',
    badgeBg: 'bg-cyan-950',
    badgeText: 'text-cyan-300',
    tagBg: 'bg-cyan-50 text-cyan-950 border-cyan-200',
    tagText: 'text-cyan-950',
    btnBg: 'bg-cyan-300 hover:bg-cyan-200 text-slate-950 border-black font-black',
    borderLine: 'border-dashed border-cyan-300',
    emoji: '📝',
    textColor: 'text-slate-950',
    textHover: 'group-hover:text-cyan-600',
    accentBorder: 'border-l-3 border-cyan-500 pl-3',
    stickerBg: 'bg-cyan-300 text-slate-950 border-2 border-black px-2 py-0.5 rounded text-[9px] uppercase font-bold shadow-[1.5px_1.5px_0px_#000]',
    shadowClass: 'shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_rgba(0,0,0,1)]'
  };
};


// Generate final list of articles loaded dynamically!
const LOADED_ARTICLES: Article[] = Object.entries(mdModules).map(([path, mod]) => {
  return parseMarkdownFile(path, mod.default || '');
});

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'archivio' | 'progetti'>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeArchiveTag, setActiveArchiveTag] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [shareText, setShareText] = useState('Condividi 🔗');

  // Read article from URL query params on mount
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const articleSlug = params.get('articolo');
    if (articleSlug) {
      const art = LOADED_ARTICLES.find(a => a.slug === articleSlug);
      if (art) {
        setSelectedArticle(art);
      }
    }
  }, []);

  // Update URL search parameters when selected article changes
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (selectedArticle) {
      params.set('articolo', selectedArticle.slug);
      window.history.replaceState(null, '', `?${params.toString()}`);
    } else {
      params.delete('articolo');
      const newSearch = params.toString();
      window.history.replaceState(null, '', newSearch ? `?${newSearch}` : window.location.pathname);
    }
    setShareText('Condividi 🔗');
  }, [selectedArticle]);

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url)
      .then(() => {
        setShareText('Copiato! ✓');
        setTimeout(() => setShareText('Condividi 🔗'), 2000);
      })
      .catch(() => {
        setShareText('Errore copia ❌');
        setTimeout(() => setShareText('Condividi 🔗'), 2000);
      });
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: selectedArticle?.title || 'La Voce del Fumagalli',
        text: selectedArticle?.description || 'Leggi l\'articolo su La Voce del Fumagalli',
        url: shareUrl,
      })
      .then(() => {
        setShareText('Condiviso! 🎉');
        setTimeout(() => setShareText('Condividi 🔗'), 2000);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          copyToClipboard(shareUrl);
        }
      });
    } else {
      copyToClipboard(shareUrl);
    }
  };

  // Chronologically sorted articles (newest first)
  const sortedArticles = useMemo(() => {
    return [...LOADED_ARTICLES].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, []);

  // Split articles: projects are kept separate!
  const progettiArticles = useMemo(() => {
    return sortedArticles.filter(art => 
      art.tags.includes('progetti') || 
      art.category.toLowerCase() === 'progetti'
    );
  }, [sortedArticles]);

  const ordinaryArticles = useMemo(() => {
    // Keep all articles synchronized to ensure everything is searchable, indexable, and synced beautifully on the main sections
    return sortedArticles;
  }, [sortedArticles]);

  // "Gli articoli che staranno per sempre in prima pagina" (specifically with prima-pagina tag)
  const permanentFirstPageArticles = useMemo(() => {
    return ordinaryArticles.filter(art => art.tags.includes('prima-pagina'));
  }, [ordinaryArticles]);

  // "Gli ultimi articoli": actual recent news (excluding permanent ones to keep home fresh)
  const latestNewsArticles = useMemo(() => {
    return ordinaryArticles.filter(art => !art.tags.includes('prima-pagina'));
  }, [ordinaryArticles]);

  // Ultimate latest article to display in absolute marquee update bar
  const latestArticle = useMemo(() => {
    return latestNewsArticles[0] || ordinaryArticles[0];
  }, [latestNewsArticles, ordinaryArticles]);

  // Unique tags for Archive tag-cloud filtering (isolated to ordinary articles only!)
  const allUniqueTags = useMemo(() => {
    const tagsSet = new Set<string>();
    ordinaryArticles.forEach(art => art.tags.forEach(t => tagsSet.add(t)));
    return Array.from(tagsSet);
  }, [ordinaryArticles]);

  // Filtered articles for Archive Search (ordinary articles only!)
  const filteredArchiveArticles = useMemo(() => {
    return ordinaryArticles.filter(art => {
      const matchQuery = searchQuery.toLowerCase().trim();
      const matchesSearch = !matchQuery || 
        art.title.toLowerCase().includes(matchQuery) || 
        art.description.toLowerCase().includes(matchQuery) ||
        art.content.toLowerCase().includes(matchQuery) ||
        art.tags.some(t => t.toLowerCase().includes(matchQuery));
      
      const matchesTag = !activeArchiveTag || art.tags.includes(activeArchiveTag);
      
      return matchesSearch && matchesTag;
    });
  }, [ordinaryArticles, searchQuery, activeArchiveTag]);

  // Helper to render responsive images beautifully inside polaroid layout
  const renderCardImage = (art: Article, customHeight: string = "h-48 sm:h-64") => {
    if (!art.image) return null;
    return (
      <div className={`border-3 border-black overflow-hidden rounded shadow-[4px_4px_0px_rgba(0,0,0,1)] relative transition-all group-hover:rotate-[-0.5deg] ${customHeight} image-wrapper`}>
        <img 
          src={art.image} 
          alt={art.title} 
          referrerPolicy="no-referrer" 
          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300" 
          onError={(e) => {
            // Find the closest wrapper container and hide it safely to avoid broken empty image frames
            const wrapper = e.currentTarget.closest('.image-wrapper');
            if (wrapper) {
              wrapper.classList.add('hidden');
            }
          }}
        />
        <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white font-display font-black text-xs uppercase tracking-widest gap-2">
          <span>Leggi Articolo</span>
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>
    );
  };

  // Inline styling compiler for compiled Markdown text chunks
  const parseInline = (text: string): React.ReactNode[] => {
    const regex = /(\*\*.*?\*\*|\*.*\*|\[.*?\]\(.*?\))/g;
    const parts = text.split(regex);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-extrabold bg-yellow-200 border-b border-black/80 px-1 text-slate-950">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return (
          <em key={i} className="italic text-slate-950 font-bold">
            {part.slice(1, -1)}
          </em>
        );
      }
      const matchLink = part.match(/\[(.*?)\]\((.*?)\)/);
      if (matchLink) {
        return (
          <a
            key={i}
            href={matchLink[2]}
            target="_blank"
            rel="noreferrer"
            referrerPolicy="no-referrer"
            className="text-pink-600 font-extrabold underline hover:text-pink-500 hover:scale-105 transition-transform inline-flex items-center gap-0.5"
          >
            {matchLink[1]}
            <ExternalLink className="w-3.5 h-3.5 inline" />
          </a>
        );
      }
      return part;
    });
  };

  // Block compiler for markdown elements
  const renderBlock = (block: string, index: number, isSerious = false) => {
    const trimmed = block.trim();
    if (!trimmed) return null;

    // Check for images
    const imgMatch = trimmed.match(/^!\[(.*?)\]\((.*?)\)$/);
    if (imgMatch) {
      const alt = imgMatch[1];
      const url = imgMatch[2];
      return (
        <div key={index} className="my-6 flex flex-col items-center">
          <div className="border-4 border-black bg-white p-3.5 shadow-[5px_5px_0px_rgba(0,0,0,1)] rounded-sm hover:scale-[1.01] transition-transform duration-350 max-w-xl w-full">
            <img src={url} alt={alt} referrerPolicy="no-referrer" className="w-full h-auto object-cover border-2 border-black rounded-sm" />
            <div className="pt-2.5 text-center text-xs font-mono font-black text-slate-500 uppercase tracking-tight italic">
              ✏️ {alt || 'Illustrazione'}
            </div>
          </div>
        </div>
      );
    }

    // Heading H1
    if (trimmed.startsWith('# ')) {
      return (
        <h1 key={index} className="text-2xl sm:text-3xl font-black font-display text-black mt-8 mb-4 border-b-4 border-black pb-2.5 uppercase tracking-wide">
          {parseInline(trimmed.substring(2))}
        </h1>
      );
    }

    // Heading H2
    if (trimmed.startsWith('## ')) {
      return (
        <h2 key={index} className="text-xl sm:text-2xl font-black font-display text-slate-900 mt-8 mb-4 border-b-2 border-black pb-1 uppercase tracking-tight">
          {parseInline(trimmed.substring(3))}
        </h2>
      );
    }

    // Heading H3
    if (trimmed.startsWith('### ')) {
      return (
        <h3 key={index} className="text-lg sm:text-xl font-bold font-sans text-slate-800 mt-6 mb-3 border-l-4 border-yellow-400 pl-3">
          {parseInline(trimmed.substring(4))}
        </h3>
      );
    }

    // Blockquote
    if (trimmed.startsWith('> ')) {
      const rawLines = trimmed.split('\n').map(l => l.replace(/^>\s?/, '').trim()).join('\n');
      return (
        <div key={index} className="border-l-5 border-black bg-slate-50 p-5 my-6 shadow-[3px_3px_0px_rgba(0,0,0,0.05)] rounded-r-md">
          <span className="block text-xs font-black uppercase text-amber-600 mb-2 font-mono tracking-wider">
            💡 CONSIGLIO DI SOPRAVVIVENZA DELL'AULA:
          </span>
          <p className="font-sans italic text-slate-950 text-sm sm:text-base font-bold leading-relaxed">
            {parseInline(rawLines.replace(/^[💡\s]*CONSIGLIO[^\n:]*:\s*/i, '').replace(/^[💡\s]*MANUALE[^\n:]*:\s*/i, ''))}
          </p>
        </div>
      );
    }

    // Bullet Lists
    if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
      return (
        <ul key={index} className="list-none pl-2 my-4 space-y-2.5">
          {trimmed.split('\n').map((line, liIdx) => {
            const content = line.replace(/^[\*\-]\s?/, '');
            return (
              <li key={liIdx} className="flex items-start gap-2.5 font-sans font-bold text-slate-800 text-sm sm:text-base">
                <span className="text-rose-500 text-lg select-none">⚡</span>
                <span>{parseInline(content)}</span>
              </li>
            );
          })}
        </ul>
      );
    }

    // Numbered Lists
    if (/^\d+\.\s/.test(trimmed)) {
      return (
        <ol key={index} className="list-none pl-2 my-4 space-y-2.5">
          {trimmed.split('\n').map((line, liIdx) => {
            const content = line.replace(/^\d+\.\s/, '');
            const matchNum = line.match(/^(\d+)\.\s/);
            const num = matchNum ? matchNum[1] : (liIdx + 1);
            return (
              <li key={liIdx} className="flex items-start gap-3.5 font-sans font-bold text-slate-800 text-sm sm:text-base">
                <span className="bg-black text-lime-400 font-display font-black text-xs w-5.5 h-5.5 flex items-center justify-center rounded-full border-2 border-black shrink-0 shadow-[1.5px_1.5px_0px_#000]">
                  {num}
                </span>
                <span>{parseInline(content)}</span>
              </li>
            );
          })}
        </ol>
      );
    }

    // Default Paragraphs
    return (
      <p key={index} className="font-sans leading-relaxed text-slate-850 text-sm sm:text-base font-bold">
        {parseInline(trimmed)}
      </p>
    );
  };

  const getPresetTagStyle = (tag: string, isActive: boolean) => {
    if (isActive) {
      return "border-3 border-black bg-pink-400 text-black shadow-[3px_3px_0px_#000] scale-105 rotate-[-1deg] font-black";
    }
    // Colorful retro notebook sticker style per tag when inactive for maximum clarity
    const styles: Record<string, string> = {
      'sopravvivenza': 'bg-teal-50 hover:bg-teal-100 border-2 border-black text-teal-950 shadow-[2px_2px_0px_#000]',
      'consigli': 'bg-amber-50 hover:bg-amber-100 border-2 border-black text-amber-950 shadow-[2px_2px_0px_#000]',
      'prima-pagina': 'bg-rose-50 hover:bg-rose-100 border-2 border-black text-rose-950 shadow-[2px_2px_0px_#000]',
      'sport': 'bg-blue-50 hover:bg-blue-100 border-2 border-black text-blue-950 shadow-[2px_2px_0px_#000]',
      'calcetto': 'bg-indigo-50 hover:bg-indigo-150 border-2 border-black text-indigo-950 shadow-[2px_2px_0px_#000]',
      'gite': 'bg-purple-50 hover:bg-purple-100 border-2 border-black text-purple-950 shadow-[2px_2px_0px_#000]',
      'cultura': 'bg-emerald-50 hover:bg-emerald-100 border-2 border-black text-emerald-950 shadow-[2px_2px_0px_#000]',
      'milano': 'bg-fuchsia-50 hover:bg-fuchsia-100 border-2 border-black text-fuchsia-950 shadow-[2px_2px_0px_#000]'
    };
    return styles[tag] || 'bg-slate-50 hover:bg-slate-100 border-2 border-black text-slate-800 shadow-[2px_2px_0px_#000]';
  };

  return (
    <div className="min-h-screen pb-16 flex flex-col font-sans selection:bg-pink-300 selection:text-black bg-[#fcfaf2] relative" id="it-main-app-container">
      
      {/* ================= 🔴 PROMINENT ULTIMA ORA BAR ================= */}
      {latestArticle && (
        <div 
          onClick={() => {
            setSelectedArticle(latestArticle);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="bg-orange-500 text-black text-center font-black py-3 px-4 text-xs sm:text-sm tracking-wide border-b-4 border-black select-none cursor-pointer hover:bg-orange-400 transition-colors flex items-center justify-center gap-2"
          id="top-marquee-bar"
        >
          <span className="bg-black text-white px-2.5 py-0.5 text-[10px] font-mono rounded uppercase tracking-widest animate-pulse shrink-0">
            {SITE_CONFIG.topBar.label}
          </span>
          <span className="font-display uppercase underline hover:text-white transition-colors truncate">
            {latestArticle.title}
          </span>
          <ChevronRight className="w-4 h-4 shrink-0" />
        </div>
      )}

      {/* ================= CONTENUTI PRINCIPALI CO-LAYOUT SPACING OUT FOR WIDE SCREENS ================= */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 mt-8 flex-grow">
        
        {/* HEADER PRINCIPALE (Ned Survival Guide Card) */}
        <header className="mb-8 relative" id="school-logo-banner">
          <div className="absolute top-2 left-2 w-full h-full bg-black rounded-lg"></div>
          <div className="border-4 md:border-6 border-black bg-yellow-400 p-6 sm:p-8 md:p-10 rounded-lg relative overflow-hidden transition-transform hover:scale-[1.005] duration-200">
            {/* Ambient Background blobs */}
            <div className="absolute top-0 right-0 h-48 w-48 bg-orange-500 opacity-20 rounded-full translate-x-24 -translate-y-24"></div>
            <div className="absolute -bottom-8 -left-8 h-32 w-32 bg-cyan-400 opacity-15 rounded-full"></div>
            
            <div className="absolute bottom-3 right-4 px-3 py-1 bg-black text-yellow-300 font-display text-[9px] sm:text-xs font-black rounded uppercase tracking-widest rotate-[-1deg] shadow-[2px_2px_0px_#000] flex items-center gap-1.5 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-red-500 inline-block animate-ping"></span>
              <span>LIVE SPECIAL EDITION</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tight text-black uppercase font-display leading-none select-none">
              {SITE_CONFIG.siteTitle}
            </h1>
            <p className="text-xs sm:text-sm md:text-lg font-mono font-black text-black mt-4 flex items-center gap-2 select-none uppercase tracking-wide">
              <span>{SITE_CONFIG.siteSubtitle}</span>
            </p>
          </div>
        </header>

        {/* BARRA NAVIGAZIONE INTERATTIVA (Tabs quadernino, offset tactile shadow) */}
        <nav className="flex flex-wrap gap-3 sm:gap-4 font-display font-black text-sm sm:text-base border-b-4 border-black pb-4 mb-10" id="navigation-tabs-board">
          
          <button 
            onClick={() => { setActiveTab('home'); setSelectedArticle(null); }}
            className={`border-3 sm:border-4 border-black px-4 sm:px-5 py-3 rounded shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[5px_5px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all cursor-pointer flex items-center gap-1.5 rotate-[-0.5deg] ${
              activeTab === 'home' && !selectedArticle ? 'bg-[#22d3ee] text-black shadow-[4px_4px_0px_rgba(0,0,0,1)] translate-y-0.5' : 'bg-white text-slate-800'
            }`}
          >
            {SITE_CONFIG.navigation.homeTab}
          </button>
          
          <button 
            onClick={() => { setActiveTab('archivio'); setSelectedArticle(null); }}
            className={`border-3 sm:border-4 border-black px-4 sm:px-5 py-3 rounded shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[5px_5px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all cursor-pointer flex items-center gap-1.5 rotate-[1deg] ${
              activeTab === 'archivio' && !selectedArticle ? 'bg-orange-400 text-black shadow-[4px_4px_0px_rgba(0,0,0,1)] translate-y-0.5' : 'bg-white text-slate-800'
            }`}
          >
            {SITE_CONFIG.navigation.archiveTab}
          </button>
          
          <button 
            onClick={() => { setActiveTab('progetti'); setSelectedArticle(null); }}
            className={`border-3 sm:border-4 border-black px-4 sm:px-5 py-3 rounded shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[5px_5px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all cursor-pointer flex items-center gap-1.5 rotate-[-1deg] ${
              activeTab === 'progetti' && !selectedArticle ? 'bg-lime-400 text-black shadow-[4px_4px_rgba(0,0,0,1)] translate-y-0.5' : 'bg-white text-slate-800'
            }`}
          >
            {SITE_CONFIG.navigation.projectsTab}
          </button>
        </nav>

        {/* ================= CONTENUTI PRINCIPALI ================= */}
        {selectedArticle ? (
          /* ================= PAGINA DETTAGLIO ARTICOLO (Pristine student reader) ================= */
          <div className="border-4 border-black bg-white p-5 sm:p-8 md:p-12 shadow-[8px_8px_0px_0px_#000] rounded-lg mt-2 relative overflow-hidden" id="article-detail-view">
            
            {/* Back button and Share button */}
            <div className="flex flex-wrap gap-3 items-center justify-between mb-8 pb-4 border-b-2 border-slate-100">
              <button 
                onClick={() => {
                  setSelectedArticle(null);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="bg-cyan-300 hover:bg-cyan-400 hover:-translate-y-1 hover:shadow-[4px_4px_0px_#000] active:translate-y-0.5 active:shadow-[1px_1px_0px_#000] text-black font-black font-display text-xs sm:text-sm border-3 border-black px-4 py-2.5 rounded shadow-[3px_3px_0px_#000] transition-all cursor-pointer flex items-center gap-1.5 uppercase animate-pulse"
              >
                ⬅️ Torna alla lista
              </button>

              <button 
                onClick={handleShare}
                className="bg-pink-300 hover:bg-pink-400 hover:-translate-y-1 hover:shadow-[4px_4px_0px_#000] active:translate-y-0.5 active:shadow-[1px_1px_0px_#000] text-black font-black font-display text-xs sm:text-sm border-3 border-black px-4 py-2.5 rounded shadow-[3px_3px_0px_#000] transition-all cursor-pointer flex items-center gap-1.5 uppercase"
              >
                <Share2 className="w-4 h-4 text-black" />
                <span>{shareText}</span>
              </button>
            </div>

            {/* Tags placed ABOVE title */}
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedArticle.tags.map((tag, idx) => (
                <span key={idx} className="bg-slate-200 border-2 border-black px-2.5 py-0.5 text-xs font-black uppercase text-black font-mono shadow-[2px_2px_0px_0px_#000]">
                  #{tag}
                </span>
              ))}
            </div>

            {/* Display Title */}
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-display text-black uppercase leading-tight tracking-tight mb-2">
              {selectedArticle.title}
            </h2>

            {/* Author information valorized beneath the title - clean details, without profile images or initials avatar */}
            <div className="flex flex-wrap items-center gap-4 border-y-3 border-black border-dashed py-4 my-6 bg-slate-50/60 px-4 sm:px-6">
              <div>
                <span className="text-slate-500 font-mono text-xs font-bold uppercase">Scritto da:</span>{' '}
                <span className="text-slate-950 font-display font-black text-sm sm:text-base">{selectedArticle.author}</span>
              </div>
              <div className="h-5 w-0.5 bg-black/25 hidden sm:block"></div>
              <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-slate-700">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>{selectedArticle.date}</span>
              </div>
              <div className="h-5 w-0.5 bg-black/25 hidden sm:block"></div>
              <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-slate-700">
                <span>⏱️ {selectedArticle.readTime} di lettura</span>
              </div>
              <div className="sm:ml-auto bg-black text-rose-300 font-mono text-[10px] font-black px-2.5 py-1 rounded select-none uppercase tracking-wider self-center shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)]">
                {selectedArticle.category}
              </div>
            </div>

            {/* Featured Post Cover Image inside Polaroid layout */}
            {selectedArticle.image && (
              <div className="my-8">
                <div className="border-4 border-black bg-white p-4 shadow-[8px_8px_0px_rgba(0,0,0,1)] rounded-sm max-w-4xl mx-auto">
                  <img 
                    src={selectedArticle.image} 
                    alt={selectedArticle.title} 
                    referrerPolicy="no-referrer" 
                    className="w-full h-[250px] sm:h-[400px] object-cover border-2 border-black rounded-sm" 
                  />
                  <div className="pt-3 text-center text-xs font-mono font-black text-slate-400 uppercase tracking-widest italic">
                    📷 Archivio Grafico La Voce del Fumagalli
                  </div>
                </div>
              </div>
            )}

            {/* Narrative Body - Clean layout, properly spaced */}
            <div className="max-w-none text-slate-900 space-y-5 selection:bg-pink-100 font-sans">
              {selectedArticle.content.split('\n\n').map((block, idx) => {
                const isProgetto = selectedArticle.tags.some(t => t.toLowerCase().includes('progett') || t.toLowerCase().includes('progetto')) || selectedArticle.category.toLowerCase().includes('progett') || selectedArticle.category.toLowerCase().includes('progetto');
                return renderBlock(block, idx, isProgetto);
              })}
            </div>
          </div>
        ) : (
          /* ================= TABS SECTIONS CONTAINER ================= */
          <div>
            
            {/* ---- TAB 1: HOME (PRIMA PAGINA) ---- */}
            {activeTab === 'home' && (
              <div className="space-y-12" id="home-view">
                
                {/* Two Column Layout: Sticky Article + Sidebar Info Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10 items-start">
                  
                  {/* Spotlight Article - Left 8 columns with ring binder spiral effect. NO overflow-hidden so sticker is never cut off! */}
                  {latestNewsArticles[0] ? (
                    <div className="lg:col-span-8 border-4 border-black bg-[#fffdf5] p-6 sm:p-9 shadow-[10px_10px_0px_rgba(0,0,0,1)] relative rounded-md flex flex-col justify-between group">
                      {/* Ring Binder decoration on the left to make it a perfect retro school notebook! */}
                      <div className="absolute left-2 top-0 bottom-0 w-2.5 flex flex-col justify-around py-8 pointer-events-none select-none z-20">
                        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                          <div key={i} className="w-5 h-2.5 bg-gradient-to-r from-slate-400 to-slate-200 border-2 border-black rounded-full shadow-[1px_1px_1px_rgba(0,0,0,0.15)] -translate-x-4"></div>
                        ))}
                      </div>

                      <div className="pl-4 sm:pl-7 relative">
                        {/* Interactive sticker badge featuring the EMPHASIS section color */}
                        <div className="absolute -top-10 sm:-top-13 -right-2 bg-orange-500 text-black border-3 border-black px-4 py-1.5 font-display font-black text-xs sm:text-sm skew-x-3 rotate-[3deg] shadow-[3px_3px_0px_0px_#000] uppercase tracking-wider z-30 animate-pulse">
                          📌 NUOVO ARTICOLO
                        </div>
 
                        <div className="mb-4">
                          <span className="font-mono text-xs font-black bg-slate-950 text-white px-3 py-1.5 rounded uppercase tracking-wider">
                            🗓️ Rilasciato il {latestNewsArticles[0].date} • {latestNewsArticles[0].author}
                          </span>
                        </div>
 
                        <article className="space-y-4">
                          <h2 
                            onClick={() => {
                              setSelectedArticle(latestNewsArticles[0]);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="text-2.5xl sm:text-4xl font-black text-slate-950 font-display leading-tight uppercase border-b-4 border-black pb-3 cursor-pointer hover:text-orange-600 hover:scale-[1.005] transition-all"
                          >
                            {latestNewsArticles[0].title}
                          </h2>
 
                          {/* Render cover image ONLY if it exists in the article! Otherwise skip it natively! */}
                          {latestNewsArticles[0].image && (
                            <div 
                              onClick={() => {
                                setSelectedArticle(latestNewsArticles[0]);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                              className="cursor-pointer"
                            >
                              {renderCardImage(latestNewsArticles[0], "h-56 sm:h-72")}
                            </div>
                          )}
 
                          {/* Brief preview of actual article content - parsed cleanly directly from the markdown content */}
                          <div className="py-2 text-slate-800 text-sm sm:text-base leading-relaxed space-y-3 pr-2">
                            {getSpotlightBlocksToShow(latestNewsArticles[0]).map((block, i) => {
                              return renderBlock(block, i);
                            })}
                          </div>
                        </article>
                      </div>
 
                      <div className="pt-6 mt-6 ml-4 sm:ml-7 border-t-2 border-dashed border-slate-250 flex flex-wrap justify-between items-center gap-4">
                        <div className="flex flex-wrap gap-1.5">
                          {latestNewsArticles[0].tags.map((tag, i) => (
                            <span key={i} className="text-[10px] font-black border-2 border-black bg-orange-100 text-orange-950 px-2 py-0.5 rounded uppercase font-mono">
                              #{tag}
                            </span>
                          ))}
                        </div>
                        <button 
                          onClick={() => {
                            setSelectedArticle(latestNewsArticles[0]);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="bg-orange-500 hover:bg-orange-400 hover:-translate-y-1 hover:shadow-[4px_4px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-[1px_1px_0px_#000] border-3 border-black px-4 py-2 text-xs font-black uppercase shadow-[2.5px_2.5px_0px_rgba(0,0,0,1)] transition-all cursor-pointer rounded-sm"
                        >
                          Leggi tutto →
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Fallback to first ever ordinary article if news list is blanked */
                    ordinaryArticles[0] && (
                      <div className="lg:col-span-8 border-4 border-black bg-[#fffdf5] p-6 sm:p-9 shadow-[10px_10px_0px_rgba(0,0,0,1)] relative rounded-md flex flex-col justify-between group">
                        <div className="absolute left-2 top-0 bottom-0 w-2.5 flex flex-col justify-around py-8 pointer-events-none select-none z-20">
                          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                            <div key={i} className="w-5 h-2.5 bg-gradient-to-r from-slate-400 to-slate-200 border-2 border-black rounded-full -translate-x-4"></div>
                          ))}
                        </div>
                        <div className="pl-4 sm:pl-7">
                          <h2 
                            onClick={() => {
                              setSelectedArticle(ordinaryArticles[0]);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="text-2.5xl sm:text-4xl font-black text-slate-950 font-display leading-tight uppercase border-b-4 border-black pb-3 cursor-pointer hover:text-orange-600 hover:scale-[1.005]"
                          >
                            {ordinaryArticles[0].title}
                          </h2>
                          <p className="font-sans text-sm font-bold text-slate-850 mt-4 leading-relaxed">{parseInline(getArticlePreviewText(ordinaryArticles[0]))}</p>
                        </div>
                      </div>
                    )
                  )}

                  {/* Sidebar Blocks — Right 4 columns */}
                  <aside className="lg:col-span-4 space-y-6 flex flex-col justify-start">
                    
                    {/* Block Info Diario: school self config */}
                    <div className="border-4 border-black bg-cyan-100 p-5 shadow-[5px_5px_0px_#000] rounded rotate-[-0.5deg]">
                      <h3 className="text-lg font-black font-display text-black uppercase mb-3 border-b-2 border-black pb-1">
                        {SITE_CONFIG.infoDialCard.title}
                      </h3>
                      <p className="font-sans font-bold text-slate-800 text-[13px] leading-relaxed">
                        {SITE_CONFIG.infoDialCard.body}
                      </p>
                    </div>

                    {/* Block Survival Tip: configurable */}
                    <div className="border-4 border-black bg-yellow-300 p-5 shadow-[5px_5px_0px_#000] rounded rotate-[1deg] relative overflow-hidden">
                      <span className="absolute -top-4 -right-4 text-5xl text-yellow-550 opacity-20 font-bold select-none rotate-[15deg]">✏️</span>
                      <h3 className="text-lg font-black font-display text-black uppercase mb-1">
                        {SITE_CONFIG.survivalTipCard.title}
                      </h3>
                      <p className="font-sans italic font-bold text-slate-900 text-xs sm:text-[13px] leading-relaxed">
                        {SITE_CONFIG.survivalTipCard.quote}
                      </p>
                      <span className="block font-mono text-[9px] font-black mt-2 text-amber-900 uppercase">
                        {SITE_CONFIG.survivalTipCard.author}
                      </span>
                    </div>

                    {/* Fun decorative quote about markdown simplicity */}
                    <div className="border-4 border-black bg-pink-100 p-5 shadow-[5px_5px_0px_#000] rounded rotate-[-1deg] relative">
                      <h3 className="text-sm font-black font-display text-pink-700 tracking-wider uppercase mb-1 flex items-center gap-1">
                        <span>{SITE_CONFIG.scrupoloFilosofico.title}</span>
                      </h3>
                      <p className="font-mono text-[11px] font-semibold text-slate-700 leading-normal">
                        {SITE_CONFIG.scrupoloFilosofico.body}
                      </p>
                    </div>

                    {/* Latest Project highlights card on sidebar! - Bigger size, shows project image perfectly */}
                    {progettiArticles.length > 0 && (
                      <div className="border-4 border-black bg-lime-100 p-5 shadow-[6px_6px_0px_rgba(0,0,0,1)] rounded rotate-[0.5deg] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 bg-black text-lime-400 font-mono text-[8.5px] font-black uppercase px-2.5 py-0.5 rounded-bl select-none">
                          LAB MASTERPIECE
                        </div>
                        <h3 className="text-xs font-black font-display text-slate-900 uppercase tracking-widest mb-3 flex items-center gap-1 mt-1">
                          <span>{SITE_CONFIG.sections.ultimoProgettoSmartLabel}</span>
                        </h3>

                        {/* Shows image field of projects prominently in Sidebar as requested! */}
                        {progettiArticles[0].image && (
                          <div className="mb-3.5 border-2 border-black rounded shadow-[2px_2px_0px_#000] overflow-hidden leading-none select-none h-40">
                            <img 
                              src={progettiArticles[0].image} 
                              alt={progettiArticles[0].title}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300" 
                            />
                          </div>
                        )}

                        <h4 className="text-base font-black uppercase text-slate-950 font-display leading-tight group-hover:text-lime-600 transition-colors line-clamp-2">
                          {progettiArticles[0].title}
                        </h4>
                        <p className="text-slate-750 font-sans text-xs sm:text-[13px] font-bold mt-2 leading-relaxed line-clamp-3">
                          {parseInline(getArticlePreviewText(progettiArticles[0]))}
                        </p>
                        <div className="mt-4 pt-3 border-t border-dashed border-slate-350 flex justify-between items-center text-xs font-mono">
                          <span className="font-black text-slate-600">⏱️ {progettiArticles[0].readTime}</span>
                          <button 
                            onClick={() => {
                              setSelectedArticle(progettiArticles[0]);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="bg-lime-400 hover:bg-lime-300 hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_#000] active:translate-y-0 border-3 border-black text-[9.5px] font-black font-display px-3 py-1.5 tracking-wider uppercase shadow-[2px_2px_0px_#000] transition-all cursor-pointer rounded-sm"
                          >
                            Scopri Progetto ⚡
                          </button>
                        </div>
                      </div>
                    )}

                  </aside>
                </div>

                {/* ================= SECTION: FEATURED ARTICLES GRID ================= */}
                {latestNewsArticles.length > 0 && (
                  <div className="mt-12 pt-6">
                    <div className="inline-block bg-orange-400 border-3 border-black px-4 py-2 rotate-[-1deg] shadow-[4px_4px_0px_rgba(0,0,0,1)] mb-6">
                      <h3 className="text-base sm:text-lg font-black font-display uppercase tracking-wide text-black flex items-center gap-1">
                        <Sparkles className="w-5 h-5 text-black" />
                        <span>🔥 IN EVIDENZA QUESTA SETTIMANA:</span>
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {latestNewsArticles.map((art) => {
                        const hasImage = !!art.image;
                        const cardTheme = getCardCustomTheme(art.tags, art.category, false);
                        return (
                          <div 
                            key={art.slug}
                            onClick={() => {
                              setSelectedArticle(art);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className={`${cardTheme.bg} border-4 border-black p-5 sm:p-6 ${cardTheme.shadowClass} flex flex-col justify-between hover:-translate-y-1 transition-all duration-200 cursor-pointer rounded-md relative group animate-fade-in min-h-[290px]`}
                          >
                            <div className="absolute top-2.5 right-3.5 text-2.5xl opacity-20 select-none font-bold">
                              {cardTheme.emoji}
                            </div>
                            
                            <div>
                              {hasImage && (
                                <div className="mb-4">
                                  {renderCardImage(art, "h-44 sm:h-48")}
                                </div>
                              )}
                              
                              <div className="flex justify-between items-center text-xs font-mono font-black text-slate-500 mb-3">
                                <span>🗓️ {art.date}</span>
                                <span className={cardTheme.stickerBg}>{art.category}</span>
                              </div>
                              
                              <h4 className={`${hasImage ? 'text-xl sm:text-2xl' : 'text-2xl sm:text-[25px] md:text-3xl'} font-black font-display text-slate-900 leading-tight uppercase my-3 ${cardTheme.textHover} transition-colors border-b-3 border-black border-dashed pb-3.5`}>
                                {art.title}
                              </h4>
                              
                              <p className={`text-slate-755 font-sans text-xs sm:text-sm font-semibold leading-relaxed ${hasImage ? 'line-clamp-2 mt-2' : 'line-clamp-5 mt-2'} ${cardTheme.accentBorder}`}>
                                {parseInline(getArticlePreviewText(art))}
                              </p>
                            </div>

                            <div className="mt-6 pt-4 border-t border-black/10 flex justify-between items-center">
                              <div className="flex gap-1.5 flex-wrap">
                                {art.tags.slice(0, 2).map((t, i) => (
                                  <span key={i} className="bg-white border border-slate-300 text-[9px] font-black uppercase px-2 py-0.5 rounded font-mono text-slate-700">
                                    #{t}
                                  </span>
                                ))}
                              </div>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation(); // Avoid double click triggers
                                  setSelectedArticle(art);
                                  window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                className={`${cardTheme.btnBg} hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_#000] active:translate-y-0 border-3 border-black px-3.5 py-1.5 text-xs font-black uppercase shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all cursor-pointer rounded-sm`}
                              >
                                Leggi →
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ================= SECTION: PRIMA PAGINA (ARTICOLI FISSI E PERENNI) ================= */}
                {permanentFirstPageArticles.length > 0 && (
                  <div className="mt-16 pt-8 border-t-4 border-black border-dashed">
                    <div className="inline-block bg-pink-400 border-3 border-black px-4 py-2 rotate-[1deg] shadow-[4px_4px_0px_rgba(0,0,0,1)] mb-6">
                      <h3 className="text-base sm:text-lg font-black font-display uppercase tracking-wide text-black flex items-center gap-1">
                        <span>📌 ARTICOLI IN PRIMA PAGINA:</span>
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {permanentFirstPageArticles.map((art) => {
                        const hasImage = !!art.image;
                        const cardTheme = getCardCustomTheme(art.tags, art.category, false);
                        return (
                          <div 
                            key={art.slug}
                            onClick={() => {
                              setSelectedArticle(art);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className={`${cardTheme.bg} border-4 border-black p-5 sm:p-6 ${cardTheme.shadowClass} flex flex-col justify-between hover:-translate-y-1 transition-all duration-200 cursor-pointer rounded-md relative group animate-fade-in min-h-[290px]`}
                          >
                            <div className="absolute top-2.5 right-3.5 text-2.5xl opacity-20 select-none font-bold">
                              {cardTheme.emoji}
                            </div>
                            
                            <div>
                              {hasImage && (
                                <div className="mb-4">
                                  {renderCardImage(art, "h-44 sm:h-48")}
                                </div>
                              )}
                              
                              <div className="flex justify-between items-center text-xs font-mono font-black text-slate-500 mb-3">
                                <span>🗓️ {art.date} • {art.author}</span>
                                <span className={cardTheme.stickerBg}>{art.category}</span>
                              </div>
                              
                              <h4 className={`${hasImage ? 'text-xl sm:text-2xl' : 'text-2xl sm:text-[25px] md:text-3xl'} font-black font-display text-slate-900 leading-tight uppercase my-3 ${cardTheme.textHover} transition-colors border-b-3 border-black border-dashed pb-3.5`}>
                                {art.title}
                              </h4>
                              
                              <p className={`text-slate-755 font-sans text-xs sm:text-sm font-semibold leading-relaxed ${hasImage ? 'line-clamp-2 mt-2' : 'line-clamp-5 mt-2'} ${cardTheme.accentBorder}`}>
                                {parseInline(getArticlePreviewText(art))}
                              </p>
                            </div>

                            <div className="mt-6 pt-4 border-t border-black/10 flex justify-between items-center">
                              <div className="flex gap-1.5 flex-wrap">
                                {art.tags.map((t, i) => (
                                  <span key={i} className="bg-white border border-slate-300 text-[9px] font-black uppercase px-2 py-0.5 rounded font-mono text-slate-700">
                                    #{t}
                                  </span>
                                ))}
                              </div>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedArticle(art);
                                  window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                className={`${cardTheme.btnBg} hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_#000] active:translate-y-0 border-3 border-black px-3.5 py-1.5 text-xs font-black uppercase shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all cursor-pointer rounded-sm`}
                              >
                                Leggi →
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* ---- TAB 2: ARCHIVIO (CON FILTRO PER COMPRESENZA TAGS SPECIALE) ---- */}
            {activeTab === 'archivio' && (
              <div className="space-y-8 animate-fade-in" id="archive-view">
                
                {/* Archivio Header info banner */}
                <div className="border-4 border-black bg-orange-400 p-6 shadow-[6px_6px_0px_#000] rotate-[-0.5deg]">
                  <h2 className="text-2xl sm:text-3xl font-black font-display uppercase text-black">{SITE_CONFIG.sections.archivioStorico}</h2>
                  <p className="font-sans text-sm sm:text-base font-bold text-slate-900 mt-1.5">
                    {SITE_CONFIG.sections.archivioDescrizione}
                  </p>
                </div>

                {/* Filtro per Tag - Colorful thick school sticker styling */}
                <div className="border-4 border-black bg-white p-5 shadow-[4px_4px_0px_#000] rounded-sm relative">
                  <span className="block font-display font-black text-xs uppercase text-slate-400 mb-3 select-none">
                    🏷️ SELEZIONA TAG ADESIVO PER ARGOMENTO:
                  </span>
                  <div className="flex flex-wrap gap-2.5">
                    <button
                      onClick={() => setActiveArchiveTag(null)}
                      className={`px-3 py-1.5 rounded-sm text-xs font-black font-mono tracking-wider cursor-pointer uppercase transition-all ${
                        activeArchiveTag === null 
                          ? 'border-3 border-black bg-black text-rose-300 shadow-[3px_3px_0px_rgba(0,0,0,1)] scale-105' 
                          : 'bg-white hover:bg-slate-50 border-2 border-black text-slate-800 shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5'
                      }`}
                    >
                      ★ MOSTRA TUTTI ★
                    </button>
                    {allUniqueTags.map((tag) => {
                      const isActive = activeArchiveTag === tag;
                      return (
                        <button
                          key={tag}
                          onClick={() => setActiveArchiveTag(isActive ? null : tag)}
                          className={`px-3.5 py-1.5 rounded-sm text-xs font-mono tracking-wide cursor-pointer uppercase transition-all ${getPresetTagStyle(tag, isActive)}`}
                        >
                          #{tag}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Search Text Box input */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-650">
                    <Search className="w-5 h-5" />
                  </div>
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cerca parole chiave, titoli, autori o tag nell'archivio..."
                    className="w-full bg-white border-4 border-black rounded p-4 pl-12 text-sm sm:text-base font-bold placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-cyan-200 shadow-[4.5px_4.5px_0px_rgba(0,0,0,1)]"
                  />
                </div>

                {/* Archive Dynamic Grid list */}
                <div className="space-y-6" id="archive-results-list">
                  {filteredArchiveArticles.length === 0 ? (
                    <div className="border-4 border-black border-dashed bg-rose-50 text-center p-12 rounded">
                      <p className="font-display font-black text-lg text-slate-900 uppercase">Nessun articolo trovato!</p>
                      <p className="font-sans text-xs sm:text-sm font-semibold text-slate-500 mt-1">Provate a cercare qualcos'altro o a deselezionare il tag filtro attivo.</p>
                    </div>
                  ) : (
                    filteredArchiveArticles.map((art, idx) => {
                      const hasImage = !!art.image;
                      return (
                        <article 
                          key={art.slug}
                          onClick={() => {
                            setSelectedArticle(art);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="bg-white hover:bg-neutral-50/50 border-4 border-black p-5 shadow-[5px_5px_0px_#000] flex flex-col md:flex-row items-stretch md:items-center gap-5 hover:-translate-y-1 hover:shadow-[7px_7px_0px_#000] transition-all duration-200 cursor-pointer rounded-md relative group"
                        >
                          {/* Polaroid frame ONLY shown if project has an image! Otherwise skipped entirely to satisfy requirements! */}
                          {hasImage && (
                            <div className="w-full md:w-36 h-28 md:h-24 shrink-0 rounded border-2 border-black overflow-hidden shadow-[2.5px_2.5px_0px_#000] rotate-[-0.5deg] group-hover:rotate-0 transition-transform">
                              <img src={art.image} alt={art.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            </div>
                          )}

                          <div className="space-y-1 flex-grow">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[9px] font-black bg-black text-white px-2 py-0.5 rounded uppercase">🗓️ {art.date}</span>
                              <span className="bg-cyan-100 text-cyan-800 text-[9px] font-black uppercase border-2 border-black px-2 py-0.5 rounded shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)]">
                                {art.category}
                              </span>
                            </div>
                            <h3 className="text-xl sm:text-2xl font-black font-display text-slate-950 uppercase group-hover:text-pink-600 transition-colors">
                              {art.title}
                            </h3>
                            <p className="text-xs sm:text-sm text-slate-600 font-sans font-bold leading-normal line-clamp-2 max-w-4xl">{parseInline(getArticlePreviewText(art))}</p>
                          </div>

                          <div className="flex flex-row md:flex-col lg:flex-row items-center gap-3 w-full md:w-auto justify-between md:justify-center border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 shrink-0">
                            <div className="flex flex-wrap gap-1">
                              {art.tags.slice(0, 3).map((t, i) => (
                                <span key={i} className="text-[9px] font-mono font-black bg-slate-100 text-slate-600 px-2 py-0.5 border border-slate-300 rounded uppercase">
                                  #{t}
                                </span>
                              ))}
                            </div>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedArticle(art);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                              className="bg-cyan-300 hover:bg-cyan-200 hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_#000] active:translate-y-0 border-3 border-black px-3.5 py-1.5 text-xs font-black uppercase shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all cursor-pointer rounded-sm"
                            >
                              Leggi →
                            </button>
                          </div>
                        </article>
                      );
                    })
                  )}
                </div>

              </div>
            )}

            {/* ---- TAB 3: PROGETTI ---- */}
            {activeTab === 'progetti' && (
              <div className="space-y-8 animate-fade-in" id="projects-view">
                
                <div className="border-4 border-black bg-lime-300 p-6 shadow-[6px_6px_0px_#000] rotate-[0.5deg]">
                  <h2 className="text-2xl sm:text-3xl font-black font-display uppercase text-black">{SITE_CONFIG.sections.progettiDidattici}</h2>
                  <p className="font-sans text-sm sm:text-base font-bold text-slate-950 mt-2">
                    {SITE_CONFIG.sections.progettiDescrizione}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {progettiArticles.map((art) => (
                    <article 
                      key={art.slug}
                      onClick={() => {
                        setSelectedArticle(art);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="bg-white border-4 border-black shadow-[6px_6px_0px_rgba(0,0,0,1)] flex flex-col justify-between overflow-hidden rounded-md relative hover:-translate-y-1 hover:shadow-[8px_8px_0px_rgba(0,0,0,1)] transition-all cursor-pointer group"
                    >
                      <div className="bg-lime-400 text-slate-950 font-black font-display text-xs border-b-3 border-black py-2.5 px-4 tracking-wider flex justify-between items-center select-none uppercase">
                        <span>🧪 LABORATORIO MAKER DETTAGLI</span>
                        <span className="text-[10px] font-mono font-black uppercase text-slate-800">{art.date}</span>
                      </div>

                      {art.image && (
                        <div className="h-44 w-full overflow-hidden border-b-3 border-black">
                          <img src={art.image} alt={art.title} referrerPolicy="no-referrer" className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300" />
                        </div>
                      )}

                      <div className="p-5 flex-grow flex flex-col justify-between">
                        <div>
                          <h3 className={`${art.image ? 'text-xl' : 'text-2xl sm:text-[25px]'} font-black font-display text-slate-950 leading-snug uppercase mb-2 group-hover:text-lime-600 transition-colors`}>
                            {art.title}
                          </h3>
                          <p className={`text-slate-700 font-sans text-xs sm:text-sm font-semibold mb-4 leading-relaxed ${art.image ? 'line-clamp-3' : 'line-clamp-5'}`}>
                            {parseInline(getArticlePreviewText(art))}
                          </p>
                        </div>

                        <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-4">
                          <div className="flex gap-1.5 flex-wrap">
                            {art.tags.map((t, idx) => (
                              <span key={idx} className="bg-lime-50 text-lime-950 border border-lime-300 px-1.5 py-0.5 text-[10px] font-mono font-black uppercase rounded">
                                #{t}
                              </span>
                            ))}
                          </div>
                          
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedArticle(art);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="bg-lime-400 hover:bg-lime-300 hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_#000] border-3 border-black px-3.5 py-1.5 text-xs font-black uppercase shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all cursor-pointer rounded-sm"
                          >
                            Dettaglio 🔬
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>

              </div>
            )}
          </div>
        )}

        {/* ================= EXTRA SPACING ================= */}
        <div className="h-6"></div>

        {/* ================= FOOTER DEL SITO WEB ================= */}
        <footer className="w-full text-center mt-16 pt-8 border-t-4 border-black border-dashed flex flex-col items-center justify-center gap-4" id="gazzetta-footer">
          <p className="font-display font-black text-slate-950 text-base sm:text-lg uppercase select-none tracking-wide">
            {SITE_CONFIG.footer.primaryText}
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 font-mono text-xs font-black text-slate-500">
            <span>{SITE_CONFIG.footer.copyright}</span>
            <span className="hidden md:inline text-slate-300">•</span>
            <span>{SITE_CONFIG.footer.schoolRights}</span>
          </div>

          <div className="mt-1">
            <a 
              href={SITE_CONFIG.footer.creatorUrl} 
              target="_blank" 
              rel="noreferrer" 
              referrerPolicy="no-referrer"
              className="bg-black text-rose-300 font-display font-black text-xs border-3 border-black hover:border-rose-300 hover:-translate-y-1 hover:shadow-[4px_4px_0px_#000] active:translate-y-0 active:shadow-[1px_1px_0px_#000] px-4 py-2.5 rounded shadow-[2.5px_2.5px_0px_#000] transition-all flex items-center gap-2 cursor-pointer tracking-wider uppercase"
              title="Visita il sito ufficiale ABBO APS"
            >
              <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400 animate-pulse" />
              <span>{SITE_CONFIG.footer.creatorText}</span>
              <ExternalLink className="w-3 h-3 text-rose-300 inline" />
            </a>
          </div>
        </footer>

      </div>
    </div>
  );
}
