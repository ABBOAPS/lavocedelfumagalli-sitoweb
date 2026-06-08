// Configuration file for "La Voce del Fumagalli"
// Teachers can easily update all static site texts here.

export interface InfoCardConfig {
  title: string;
  body: string;
}

export interface SurvivalCardConfig {
  title: string;
  quote: string;
  author: string;
}

export interface FooterConfig {
  primaryText: string;
  copyright: string;
  schoolRights: string;
  creatorText: string;
  creatorUrl: string;
}

export interface TopBarConfig {
  activeNumber: string;
  message: string;
  label: string;
}

export interface NavigationConfig {
  homeTab: string;
  archiveTab: string;
  projectsTab: string;
}

export interface SectionsConfig {
  inEvidenza: string;
  primaPagina: string;
  archivioStorico: string;
  archivioDescrizione: string;
  progettiDidattici: string;
  progettiDescrizione: string;
  ultimoProgettoSmartLabel: string;
}

export interface ScrupoloConfig {
  title: string;
  body: string;
}

export interface SiteConfig {
  siteTitle: string;
  siteSubtitle: string;
  topBar: TopBarConfig;
  navigation: NavigationConfig;
  sections: SectionsConfig;
  infoDialCard: InfoCardConfig;
  survivalTipCard: SurvivalCardConfig;
  scrupoloFilosofico: ScrupoloConfig;
  footer: FooterConfig;
}

export const SITE_CONFIG: SiteConfig = {
  siteTitle: "LA VOCE DEL FUMAGALLI",
  siteSubtitle: "⚡ Survival tips, progetti & bacheca dell'istituto Fumagalli!",
  topBar: {
    activeNumber: "",
    message: "LA VOCE DEL FUMAGALLI E' LIVE CON L'EDIZIONE SPECIALE!",
    label: "🔴 ULTIMA ORA"
  },
  navigation: {
    homeTab: "🏠 PRIMA PAGINA",
    archiveTab: "📅 ARCHIVIO COMPLETO",
    projectsTab: "🔬 PROGETTI"
  },
  sections: {
    inEvidenza: "🔥 IN EVIDENZA QUESTA SETTIMANA:",
    primaPagina: "📌 ARTICOLI IN PRIMA PAGINA:",
    archivioStorico: "📅 ARCHIVIO STORICO GENERALE",
    archivioDescrizione: "Utilizza la barra di ricerca o premi sui coloratissimi badge adesivi per filtrare istantaneamente la lista degli articoli in base agli argomenti. I progetti e i laboratori fisici sono ospitati nella sezione dedicata.",
    progettiDidattici: "🔬 PROGETTI DIDATTICI & ATTIVITA’ LABORATORIO",
    progettiDescrizione: "Catalogo speciale riservato ai lavori maker, tecnologici, elettronici o creativi realizzati dagli studenti (contrassegnati con l'etichetta progetti).",
    ultimoProgettoSmartLabel: "🔬 ULTIMO PROGETTO SMART"
  },
  infoDialCard: {
    title: "⚡ INFO DIARIO",
    body: "Questo portale è autoprodotto dai gruppi studenteschi con l'aiuto dei docenti di laboratorio per raccogliere i progetti, gli articoli e i racconti del Fumagalli."
  },
  survivalTipCard: {
    title: "📒 Bla bla blah",
    quote: '"Se scordi la giacca nei laboratori, inventati che sei andato ad aiutare il tecnico coi PC. Nel 90% dei casi ti lascerà cercare in totale libertà!"',
    author: "— IL FUMAGALLIANO DI QUARTA"
  },
  scrupoloFilosofico: {
    title: "📝 Non so cosa scrivere",
    body: "è un bellissimo sito ecc ecc..."
  },
  footer: {
    primaryText: "🏫 IIS FUMAGALLI — LA VOCE DELLO STUDENTE",
    copyright: "Copyright 2026 • La voce del fumagalli",
    schoolRights: "Tutti i diritti degli articoli sono detenuti dall'I.I.S. Fumagalli.",
    creatorText: "Sito web creato da Abbo APS",
    creatorUrl: "https://www.abbops.org"
  }
};
