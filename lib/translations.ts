export type Language = "en" | "de";

export interface Translations {
  // Navigation
  nav: {
    features: string;
    pricing: string;
    docs: string;
    blog: string;
    signIn: string;
    tryFree: string;
  };
  // Hero Section
  hero: {
    headline: string;
    subheadline: string;
    cta: string;
    trustBadge: string;
    socialProof?: string;
  };
  // Problem Section
  problem: {
    title: string;
    stat1: {
      value: string;
      description: string;
      source: string;
    };
    stat2: {
      value: string;
      description: string;
    };
    stat3: {
      value: string;
      description: string;
    };
  };
  // How It Works
  howItWorks: {
    title: string;
    step1: {
      title: string;
      description: string;
    };
    step2: {
      title: string;
      description: string;
    };
    step3: {
      title: string;
      description: string;
    };
    step4: {
      title: string;
      description: string;
    };
  };
  // Demo Section
  demo: {
    title: string;
    placeholder: string;
    charLimit: string;
    scanNow: string;
    results: string;
    risk: string;
    critical: string;
    warnings: string;
    minor: string;
    flaggedTerms: string;
    getFullAnalysis: string;
  };
  // Pricing
  pricing: {
    title: string;
    monthly: string;
    yearly: string;
    save: string;
    free: {
      name: string;
      features: string[];
      cta: string;
    };
    starter: {
      name: string;
      features: string[];
      cta: string;
      trial: string;
    };
    pro: {
      name: string;
      features: string[];
      cta: string;
      trial: string;
      badge: string;
    };
  };
  // FAQ
  faq: {
    title: string;
    items: Array<{
      question: string;
      answer: string;
    }>;
  };
  // Footer
  footer: {
    product: string;
    company: string;
    legal: string;
    social: string;
    copyright: string;
  };
  // App Page
  app: {
    inputText: string;
    characters: string;
    templates: string;
    scanText: string;
    highlightedText: string;
    noResults: string;
    noResultsDesc: string;
    riskLevel: string;
    exportPDF: string;
    flaggedTerms: string;
    noIssues: string;
    noIssuesDesc: string;
    history: string;
    searchHistory: string;
    noHistory: string;
    critical: string;
    warnings: string;
    minor: string;
  };
}

export const translations: Record<Language, Translations> = {
  en: {
    nav: {
      features: "Features",
      pricing: "Plans",
      docs: "Docs",
      blog: "Blog",
      signIn: "Sign In",
      tryFree: "Start Screening",
    },
    hero: {
      headline: "Vermeiden Sie Bußgelder bis zu 4%\nIhres EU-Jahresumsatzes",
      subheadline: "Prüfen Sie Marketing-Aussagen und Nachhaltigkeitslabels auf EU-Compliance — automatisiert, in Sekunden.",
      cta: "Compliance-Check starten",
      trustBadge: "EU-Richtlinie 2024/825 · Empowering Consumers Directive",
      socialProof: "Trusted by compliance, legal and sustainability teams",
    },
    problem: {
      title: "The Regulatory Landscape",
      stat1: {
        value: "53%",
        description: "of environmental claims found misleading by the EU Commission",
        source: "(EU Sweep Study)",
      },
      stat2: {
        value: "4%",
        description: "of annual EU turnover — maximum penalty for non-compliance",
      },
      stat3: {
        value: "280+",
        description: "regulated terms and phrases screened by Green Lens",
      },
    },
    howItWorks: {
      title: "How Green Lens Works",
      step1: {
        title: "Submit Content",
        description: "Paste marketing copy, upload documents, or enter a URL for screening",
      },
      step2: {
        title: "Compliance Screening",
        description: "Green Lens screens against 280+ regulated terms and 30+ sustainability labels",
      },
      step3: {
        title: "Risk Assessment",
        description: "Receive a risk score with flagged terms, severity levels, and regulatory references",
      },
      step4: {
        title: "Remediation Guidance",
        description: "Get compliant alternatives, export PDF reports, and share with your team",
      },
    },
    demo: {
      title: "Compliance Screening",
      placeholder: "Paste marketing copy here for compliance screening...",
      charLimit: "Enter marketing copy for pre-publication review (250 characters)",
      scanNow: "Screen Now",
      results: "Results",
      risk: "Risk",
      critical: "Critical",
      warnings: "Warnings",
      minor: "Minor",
      flaggedTerms: "Flagged Terms",
      getFullAnalysis: "View Full Assessment",
    },
    pricing: {
      title: "Plans",
      monthly: "Monthly",
      yearly: "Yearly",
      save: "Save 20%",
      free: {
        name: "ESSENTIAL",
        features: ["Unlimited scans", "Full risk reports", "PDF export"],
        cta: "Get Started",
      },
      starter: {
        name: "TEAM",
        features: ["Everything in Essential", "Unlimited characters", "PDF reports", "Email support"],
        cta: "Contact Us",
        trial: "14 days",
      },
      pro: {
        name: "ENTERPRISE",
        features: ["Everything in Team", "API access", "Multi-user access", "Priority support"],
        cta: "Contact Us",
        trial: "14 days",
        badge: "RECOMMENDED",
      },
    },
    faq: {
      title: "Frequently Asked Questions",
      items: [
        {
          question: "What regulations does Green Lens screen against?",
          answer: "Green Lens screens marketing claims against the EU Empowering Consumers Directive (2024/825) and the forthcoming Green Claims Directive. This includes 280+ regulated terms and phrases, plus 30+ sustainability label compliance checks. Enforcement begins September 2026, with penalties of up to 4% of annual EU turnover.",
        },
        {
          question: "How reliable is the compliance screening?",
          answer: "Green Lens provides a thorough first-pass screening against a comprehensive database of regulated terms and label requirements. It is designed to support — not replace — legal review. We recommend using Green Lens for pre-publication screening and consulting compliance counsel for final sign-off.",
        },
        {
          question: "Is this a substitute for legal advice?",
          answer: "No. Green Lens is a compliance screening tool that identifies regulatory risk flags and evidence gaps in marketing materials. It is designed to complement your legal and compliance workflow, not replace qualified legal counsel.",
        },
        {
          question: "What happens when a claim is flagged?",
          answer: "Green Lens provides the specific regulation reference, a risk severity rating, and compliant alternative wording for each flagged term. You can revise your copy and re-screen to confirm compliance before publication.",
        },
        {
          question: "How is submitted content handled?",
          answer: "All screening is performed client-side in your browser. No marketing content is transmitted to or stored on external servers. Your data remains entirely under your control.",
        },
      ],
    },
    footer: {
      product: "Product",
      company: "Company",
      legal: "Legal",
      social: "Social",
      copyright: "© 2026 Green Lens. All rights reserved.",
    },
    app: {
      inputText: "Input Text",
      characters: "characters",
      templates: "Templates",
      scanText: "Screen Content",
      highlightedText: "Highlighted Text",
      noResults: "No screening results yet",
      noResultsDesc: "Submit marketing copy on the left to begin compliance screening",
      riskLevel: "Risk Level",
      exportPDF: "Export PDF",
      flaggedTerms: "Flagged Terms",
      noIssues: "No compliance issues detected. Content appears regulation-ready.",
      noIssuesDesc: "",
      history: "History",
      searchHistory: "Search history...",
      noHistory: "No screening history found",
      critical: "Critical",
      warnings: "Warnings",
      minor: "Minor",
    },
  },
  de: {
    nav: {
      features: "Funktionen",
      pricing: "Tarife",
      docs: "Dokumentation",
      blog: "Blog",
      signIn: "Anmelden",
      tryFree: "Screening starten",
    },
    hero: {
      headline: "Vermeiden Sie Bußgelder bis zu 4%\nIhres EU-Jahresumsatzes",
      subheadline: "Prüfen Sie Marketing-Aussagen und Nachhaltigkeitslabels auf EU-Compliance — automatisiert, in Sekunden.",
      cta: "Compliance-Check starten",
      trustBadge: "EU-Richtlinie 2024/825 · Empowering Consumers Directive",
      socialProof: "Vertraut von Compliance-, Rechts- und Nachhaltigkeitsteams",
    },
    problem: {
      title: "Die regulatorische Lage",
      stat1: {
        value: "53%",
        description: "der Umweltaussagen von der EU-Kommission als irreführend eingestuft",
        source: "(EU-Sweep-Studie)",
      },
      stat2: {
        value: "4%",
        description: "des EU-Jahresumsatzes — maximale Strafe bei Nichteinhaltung",
      },
      stat3: {
        value: "280+",
        description: "regulierte Begriffe und Phrasen, geprüft durch Green Lens",
      },
    },
    howItWorks: {
      title: "So funktioniert Green Lens",
      step1: {
        title: "Inhalte einreichen",
        description: "Marketing-Texte einfügen, Dokumente hochladen oder URL zur Prüfung eingeben",
      },
      step2: {
        title: "Compliance-Screening",
        description: "Green Lens prüft gegen 280+ regulierte Begriffe und 30+ Nachhaltigkeitslabels",
      },
      step3: {
        title: "Risikobewertung",
        description: "Risiko-Score mit markierten Begriffen, Schweregrade und Regulierungsverweise erhalten",
      },
      step4: {
        title: "Handlungsempfehlungen",
        description: "Konforme Alternativen erhalten, PDF-Berichte exportieren und mit dem Team teilen",
      },
    },
    demo: {
      title: "Compliance-Screening",
      placeholder: "Marketing-Text hier einfügen für Compliance-Screening...",
      charLimit: "Marketing-Text zur Vorab-Prüfung eingeben (250 Zeichen)",
      scanNow: "Jetzt prüfen",
      results: "Ergebnisse",
      risk: "Risiko",
      critical: "Kritisch",
      warnings: "Warnungen",
      minor: "Geringfügig",
      flaggedTerms: "Markierte Begriffe",
      getFullAnalysis: "Vollständige Bewertung anzeigen",
    },
    pricing: {
      title: "Tarife",
      monthly: "Monatlich",
      yearly: "Jährlich",
      save: "20% sparen",
      free: {
        name: "ESSENTIAL",
        features: ["Unbegrenzte Scans", "Vollständige Risikoberichte", "PDF-Export"],
        cta: "Jetzt starten",
      },
      starter: {
        name: "TEAM",
        features: ["Alles aus Essential", "Unbegrenzte Zeichen", "PDF-Berichte", "E-Mail-Support"],
        cta: "Kontaktieren",
        trial: "14 Tage",
      },
      pro: {
        name: "ENTERPRISE",
        features: ["Alles aus Team", "API-Zugang", "Mehrbenutzerzugang", "Prioritäts-Support"],
        cta: "Kontaktieren",
        trial: "14 Tage",
        badge: "EMPFOHLEN",
      },
    },
    faq: {
      title: "Häufig gestellte Fragen",
      items: [
        {
          question: "Gegen welche Vorschriften prüft Green Lens?",
          answer: "Green Lens prüft Marketing-Aussagen gegen die EU-Richtlinie zur Stärkung der Verbraucher (2024/825) und die kommende Green Claims Directive. Dies umfasst 280+ regulierte Begriffe und Phrasen sowie 30+ Nachhaltigkeitslabel-Compliance-Prüfungen. Die Durchsetzung beginnt im September 2026 mit Strafen von bis zu 4% des EU-Jahresumsatzes.",
        },
        {
          question: "Wie zuverlässig ist das Compliance-Screening?",
          answer: "Green Lens bietet ein gründliches Erst-Screening gegen eine umfassende Datenbank regulierter Begriffe und Label-Anforderungen. Es ist als Unterstützung — nicht als Ersatz — für die rechtliche Prüfung konzipiert. Wir empfehlen Green Lens für die Vorab-Prüfung und die Konsultation von Compliance-Beratern für die abschließende Freigabe.",
        },
        {
          question: "Ersetzt dies eine Rechtsberatung?",
          answer: "Nein. Green Lens ist ein Compliance-Screening-Tool, das regulatorische Risikoflaggen und Nachweislücken in Marketing-Materialien identifiziert. Es ergänzt Ihren Rechts- und Compliance-Workflow, ersetzt jedoch keine qualifizierte Rechtsberatung.",
        },
        {
          question: "Was passiert, wenn eine Aussage markiert wird?",
          answer: "Green Lens liefert die spezifische Regulierungsreferenz, eine Risiko-Schweregrad-Bewertung und konforme Alternativformulierungen für jeden markierten Begriff. Sie können Ihren Text überarbeiten und erneut prüfen, um die Compliance vor der Veröffentlichung zu bestätigen.",
        },
        {
          question: "Wie werden eingereichte Inhalte behandelt?",
          answer: "Das gesamte Screening wird clientseitig in Ihrem Browser durchgeführt. Keine Marketing-Inhalte werden an externe Server übertragen oder dort gespeichert. Ihre Daten bleiben vollständig unter Ihrer Kontrolle.",
        },
      ],
    },
    footer: {
      product: "Produkt",
      company: "Unternehmen",
      legal: "Rechtliches",
      social: "Social Media",
      copyright: "© 2026 Green Lens. Alle Rechte vorbehalten.",
    },
    app: {
      inputText: "Text eingeben",
      characters: "Zeichen",
      templates: "Vorlagen",
      scanText: "Inhalte prüfen",
      highlightedText: "Hervorgehobener Text",
      noResults: "Noch keine Screening-Ergebnisse",
      noResultsDesc: "Marketing-Text links eingeben, um das Compliance-Screening zu starten",
      riskLevel: "Risikostufe",
      exportPDF: "PDF exportieren",
      flaggedTerms: "Markierte Begriffe",
      noIssues: "Keine Compliance-Probleme erkannt. Inhalt erscheint regulierungskonform.",
      noIssuesDesc: "",
      history: "Verlauf",
      searchHistory: "Verlauf durchsuchen...",
      noHistory: "Kein Screening-Verlauf gefunden",
      critical: "Kritisch",
      warnings: "Warnungen",
      minor: "Geringfügig",
    },
  },
};
