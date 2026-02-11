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
      pricing: "Pricing",
      docs: "Docs",
      blog: "Blog",
      signIn: "Sign In",
      tryFree: "Try Free",
    },
    hero: {
      headline: "Vermeiden Sie Bußgelder bis zu €40.000\nfür Greenwashing-Verstöße",
      subheadline: "Prüfen Sie Ihre Marketing-Aussagen automatisch auf EU-Compliance – in Sekunden, nicht Stunden.",
      cta: "Jetzt kostenlos prüfen",
      trustBadge: "Basierend auf EU-Richtlinie 2024/825",
      socialProof: "Vertraut von 500+ Marketing-Teams in der EU",
    },
    problem: {
      title: "The Greenwashing Crisis",
      stat1: {
        value: "53%",
        description: "of environmental claims are misleading",
        source: "(EU Study)",
      },
      stat2: {
        value: "€40,000+",
        description: "average fine per violation",
      },
      stat3: {
        value: "260+",
        description: "banned terms and phrases",
      },
    },
    howItWorks: {
      title: "How It Works",
      step1: {
        title: "Paste Your Text",
        description: "Copy your marketing content into our scanner",
      },
      step2: {
        title: "AI Analysis",
        description: "Our AI scans for 260+ risky terms in seconds",
      },
      step3: {
        title: "Get Results",
        description: "See risk level and flagged terms with explanations",
      },
      step4: {
        title: "Stay Compliant",
        description: "Download PDF report or get legal review",
      },
    },
    demo: {
      title: "Try It Free",
      placeholder: "Paste your marketing text here...",
      charLimit: "Enter your marketing text (250 char limit for demo)",
      scanNow: "Scan Now",
      results: "Results",
      risk: "Risk",
      critical: "Critical",
      warnings: "Warnings",
      minor: "Minor",
      flaggedTerms: "Flagged Terms",
      getFullAnalysis: "Get Full Analysis",
    },
    pricing: {
      title: "Pricing",
      monthly: "Monthly",
      yearly: "Yearly",
      save: "Save 20%",
      free: {
        name: "FREE",
        features: ["3 scans/month", "500 characters", "Basic risk report"],
        cta: "Start Free",
      },
      starter: {
        name: "STARTER",
        features: ["100 scans/month", "Unlimited characters", "PDF reports", "Email support"],
        cta: "Start Trial",
        trial: "14 days",
      },
      pro: {
        name: "PRO",
        features: ["Unlimited scans", "API access", "Team (5 users)", "Priority support"],
        cta: "Start Trial",
        trial: "14 days",
        badge: "MOST POPULAR",
      },
    },
    faq: {
      title: "Frequently Asked Questions",
      items: [
        {
          question: "What is the Green Claims Directive?",
          answer: "The EU Green Claims Directive (2024/825) is a regulation that requires companies to substantiate all environmental claims in their marketing. It comes into effect in September 2026 and can result in fines of up to 4% of annual revenue for violations.",
        },
        {
          question: "How accurate is the scanner?",
          answer: "Our scanner checks against 260+ banned terms and phrases from the EU regulation. However, this tool is for guidance only and does not constitute legal advice. Always consult with legal experts for final compliance verification.",
        },
        {
          question: "Can I use this for legal compliance?",
          answer: "This tool helps identify potentially problematic claims, but it's not a substitute for legal review. We recommend consulting with compliance experts, especially for high-stakes marketing materials.",
        },
        {
          question: "What happens after I'm flagged?",
          answer: "Our tool provides specific alternative suggestions for each flagged term. You can review the suggestions, update your text, and re-scan to verify compliance.",
        },
        {
          question: "Do you store my data?",
          answer: "For free users, scans are processed client-side and not stored on our servers. For paid plans, we may store scan history for your convenience, but all data is encrypted and can be deleted upon request.",
        },
      ],
    },
    footer: {
      product: "Product",
      company: "Company",
      legal: "Legal",
      social: "Social",
      copyright: "© 2026 Green Claim Check. Made in Cologne 🇩🇪",
    },
    app: {
      inputText: "Input Text",
      characters: "characters",
      templates: "Templates",
      scanText: "Scan Text",
      highlightedText: "Highlighted Text",
      noResults: "No scan results yet",
      noResultsDesc: "Enter your marketing text on the left to start scanning",
      riskLevel: "Risk Level",
      exportPDF: "Export PDF",
      flaggedTerms: "Flagged Terms",
      noIssues: "No issues found! Your text appears compliant.",
      noIssuesDesc: "",
      history: "History",
      searchHistory: "Search history...",
      noHistory: "No scan history found",
      critical: "Critical",
      warnings: "Warnings",
      minor: "Minor",
    },
  },
  de: {
    nav: {
      features: "Funktionen",
      pricing: "Preise",
      docs: "Dokumentation",
      blog: "Blog",
      signIn: "Anmelden",
      tryFree: "Kostenlos testen",
    },
    hero: {
      headline: "Vermeiden Sie Bußgelder bis zu €40.000\nfür Greenwashing-Verstöße",
      subheadline: "Prüfen Sie Ihre Marketing-Aussagen automatisch auf EU-Compliance – in Sekunden, nicht Stunden.",
      cta: "Jetzt kostenlos prüfen",
      trustBadge: "Basierend auf EU-Richtlinie 2024/825",
      socialProof: "Vertraut von 500+ Marketing-Teams in der EU",
    },
    problem: {
      title: "Die Greenwashing-Krise",
      stat1: {
        value: "53%",
        description: "der Umweltaussagen sind irreführend",
        source: "(EU-Studie)",
      },
      stat2: {
        value: "€40.000+",
        description: "durchschnittliches Bußgeld pro Verstoß",
      },
      stat3: {
        value: "260+",
        description: "verbotene Begriffe und Phrasen",
      },
    },
    howItWorks: {
      title: "So funktioniert's",
      step1: {
        title: "Text einfügen",
        description: "Kopieren Sie Ihren Marketing-Text in unseren Scanner",
      },
      step2: {
        title: "KI-Analyse",
        description: "Unsere KI scannt in Sekunden nach 260+ riskanten Begriffen",
      },
      step3: {
        title: "Ergebnisse erhalten",
        description: "Sehen Sie Risikostufe und markierte Begriffe mit Erklärungen",
      },
      step4: {
        title: "Compliance sicherstellen",
        description: "PDF-Bericht herunterladen oder rechtliche Prüfung erhalten",
      },
    },
    demo: {
      title: "Kostenlos testen",
      placeholder: "Fügen Sie hier Ihren Marketing-Text ein...",
      charLimit: "Geben Sie Ihren Marketing-Text ein (250 Zeichen Limit für Demo)",
      scanNow: "Jetzt scannen",
      results: "Ergebnisse",
      risk: "Risiko",
      critical: "Kritisch",
      warnings: "Warnungen",
      minor: "Geringfügig",
      flaggedTerms: "Markierte Begriffe",
      getFullAnalysis: "Vollständige Analyse erhalten",
    },
    pricing: {
      title: "Preise",
      monthly: "Monatlich",
      yearly: "Jährlich",
      save: "20% sparen",
      free: {
        name: "KOSTENLOS",
        features: ["3 Scans/Monat", "500 Zeichen", "Basis-Risikobericht"],
        cta: "Kostenlos starten",
      },
      starter: {
        name: "STARTER",
        features: ["100 Scans/Monat", "Unbegrenzte Zeichen", "PDF-Berichte", "E-Mail-Support"],
        cta: "Test starten",
        trial: "14 Tage",
      },
      pro: {
        name: "PRO",
        features: ["Unbegrenzte Scans", "API-Zugang", "Team (5 Benutzer)", "Prioritäts-Support"],
        cta: "Test starten",
        trial: "14 Tage",
        badge: "BELIEBTEST",
      },
    },
    faq: {
      title: "Häufig gestellte Fragen",
      items: [
        {
          question: "Was ist die Green Claims Directive?",
          answer: "Die EU Green Claims Directive (2024/825) ist eine Verordnung, die Unternehmen verpflichtet, alle Umweltaussagen in ihrem Marketing zu belegen. Sie tritt im September 2026 in Kraft und kann zu Bußgeldern von bis zu 4% des Jahresumsatzes bei Verstößen führen.",
        },
        {
          question: "Wie genau ist der Scanner?",
          answer: "Unser Scanner prüft gegen 260+ verbotene Begriffe und Phrasen aus der EU-Verordnung. Dieses Tool dient jedoch nur als Orientierungshilfe und stellt keine Rechtsberatung dar. Konsultieren Sie immer Rechtsexperten für die endgültige Compliance-Prüfung.",
        },
        {
          question: "Kann ich dies für rechtliche Compliance verwenden?",
          answer: "Dieses Tool hilft dabei, potenziell problematische Aussagen zu identifizieren, ersetzt aber keine rechtliche Prüfung. Wir empfehlen die Konsultation von Compliance-Experten, insbesondere für wichtige Marketing-Materialien.",
        },
        {
          question: "Was passiert nach einer Markierung?",
          answer: "Unser Tool bietet spezifische Alternativvorschläge für jeden markierten Begriff. Sie können die Vorschläge überprüfen, Ihren Text aktualisieren und erneut scannen, um die Compliance zu überprüfen.",
        },
        {
          question: "Speichern Sie meine Daten?",
          answer: "Für kostenlose Nutzer werden Scans clientseitig verarbeitet und nicht auf unseren Servern gespeichert. Für kostenpflichtige Pläne können wir den Scan-Verlauf zu Ihrer Bequemlichkeit speichern, aber alle Daten sind verschlüsselt und können auf Anfrage gelöscht werden.",
        },
      ],
    },
    footer: {
      product: "Produkt",
      company: "Unternehmen",
      legal: "Rechtliches",
      social: "Social Media",
      copyright: "© 2026 Green Claim Check. Hergestellt in Köln 🇩🇪",
    },
    app: {
      inputText: "Text eingeben",
      characters: "Zeichen",
      templates: "Vorlagen",
      scanText: "Text scannen",
      highlightedText: "Hervorgehobener Text",
      noResults: "Noch keine Scan-Ergebnisse",
      noResultsDesc: "Geben Sie Ihren Marketing-Text links ein, um mit dem Scannen zu beginnen",
      riskLevel: "Risikostufe",
      exportPDF: "PDF exportieren",
      flaggedTerms: "Markierte Begriffe",
      noIssues: "Keine Probleme gefunden! Ihr Text scheint konform zu sein.",
      noIssuesDesc: "",
      history: "Verlauf",
      searchHistory: "Verlauf durchsuchen...",
      noHistory: "Kein Scan-Verlauf gefunden",
      critical: "Kritisch",
      warnings: "Warnungen",
      minor: "Geringfügig",
    },
  },
};
