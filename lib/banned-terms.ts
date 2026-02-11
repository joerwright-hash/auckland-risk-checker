export interface BannedTerm {
  term: string;
  regex: string;
  language: "de" | "en" | "both";
  category: string;
  regulation: string;
  penaltyRange: string;
  description: string;
  alternatives: string[];
  severity: "critical" | "warning" | "minor";
}

export const BANNED_TERMS: BannedTerm[] = [
  // Critical terms
  {
    term: "klimaneutral",
    regex: "klima\\s*neutral|klimaneutralität",
    language: "de",
    category: "climate",
    regulation: "EU 2024/825 Art 3.1",
    penaltyRange: "4-10% revenue",
    description: "Absolute climate claims require full lifecycle proof",
    alternatives: [
      "Reduzierung der CO2-Emissionen um X%",
      "Kompensation durch zertifizierte Projekte",
      "CO2-Reduktion durch nachgewiesene Maßnahmen"
    ],
    severity: "critical"
  },
  {
    term: "carbon neutral",
    regex: "carbon\\s*neutral|co2\\s*neutral",
    language: "en",
    category: "climate",
    regulation: "EU 2024/825 Art 3.1",
    penaltyRange: "4-10% revenue",
    description: "Absolute climate claims require full lifecycle proof",
    alternatives: [
      "Reducing carbon emissions by X%",
      "Offset through verified programs",
      "CO2 reduction through verified measures"
    ],
    severity: "critical"
  },
  {
    term: "100% umweltfreundlich",
    regex: "100%\\s*umweltfreundlich|vollständig\\s*umweltfreundlich",
    language: "de",
    category: "general",
    regulation: "EU 2024/825 Art 3.1",
    penaltyRange: "4-10% revenue",
    description: "Absolute environmental claims are prohibited without complete proof",
    alternatives: [
      "Hergestellt mit 80% recycelten Materialien",
      "Umweltfreundliche Produktion nach ISO 14001",
      "Reduzierter ökologischer Fußabdruck"
    ],
    severity: "critical"
  },
  {
    term: "vollständig nachhaltig",
    regex: "vollständig\\s*nachhaltig|komplett\\s*nachhaltig",
    language: "de",
    category: "general",
    regulation: "EU 2024/825 Art 3.1",
    penaltyRange: "4-10% revenue",
    description: "Absolute sustainability claims require comprehensive proof",
    alternatives: [
      "Nachhaltige Praktiken in der Produktion",
      "Zertifiziert nach GOTS Standard",
      "Nachhaltigkeitsinitiativen in der Lieferkette"
    ],
    severity: "critical"
  },
  {
    term: "emissionsfrei",
    regex: "emissionsfrei|emission\\s*frei",
    language: "de",
    category: "climate",
    regulation: "EU 2024/825 Art 3.1",
    penaltyRange: "4-10% revenue",
    description: "Zero-emission claims require complete lifecycle verification",
    alternatives: [
      "Reduzierte Emissionen in der Produktion",
      "Klimaneutrale Produktion durch Kompensation",
      "Niedrige Emissionen durch erneuerbare Energien"
    ],
    severity: "critical"
  },
  {
    term: "klimapositiv",
    regex: "klimapositiv|climate\\s*positive",
    language: "both",
    category: "climate",
    regulation: "EU 2024/825 Art 3.1",
    penaltyRange: "4-10% revenue",
    description: "Climate positive claims require verified carbon removal proof",
    alternatives: [
      "Mehr CO2 eingespart als emittiert",
      "Netto-negative Emissionen durch zertifizierte Projekte",
      "Klimaschutzbeitrag durch nachgewiesene Maßnahmen"
    ],
    severity: "critical"
  },
  {
    term: "net zero",
    regex: "net\\s*zero|netto\\s*null",
    language: "both",
    category: "climate",
    regulation: "EU 2024/825 Art 3.1",
    penaltyRange: "4-10% revenue",
    description: "Net zero claims require verified offset programs",
    alternatives: [
      "Auf dem Weg zu Netto-Null-Emissionen bis 2030",
      "Reduzierung der Emissionen um X%",
      "Kompensation durch zertifizierte Klimaschutzprojekte"
    ],
    severity: "critical"
  },
  
  // Warning terms
  {
    term: "umweltfreundlich",
    regex: "umweltfreundlich(?!keit)",
    language: "de",
    category: "general",
    regulation: "EU 2024/825 Art 3.2",
    penaltyRange: "2-4% revenue",
    description: "Generic environmental claim requires specific data",
    alternatives: [
      "Hergestellt aus X% recycelten Materialien",
      "Energieeffizienzklasse A+++",
      "Reduzierter Wasserverbrauch um X%"
    ],
    severity: "warning"
  },
  {
    term: "nachhaltig",
    regex: "nachhaltig(?!keit)",
    language: "de",
    category: "general",
    regulation: "EU 2024/825 Art 3.2",
    penaltyRange: "2-4% revenue",
    description: "Generic sustainability claim requires evidence",
    alternatives: [
      "Zertifiziert nach FSC Standard",
      "Nachhaltige Beschaffung nach ISO 20400",
      "Nachhaltigkeitsinitiativen in der Lieferkette"
    ],
    severity: "warning"
  },
  {
    term: "grün",
    regex: "\\bgrün\\b(?!\\s*(?:Energie|Strom|Welle))",
    language: "de",
    category: "general",
    regulation: "EU 2024/825 Art 3.2",
    penaltyRange: "2-4% revenue",
    description: "Generic green claim needs specific context",
    alternatives: [
      "Umweltbewusste Produktion",
      "Ressourcenschonende Herstellung",
      "Ökologisch optimierte Prozesse"
    ],
    severity: "warning"
  },
  {
    term: "öko",
    regex: "\\böko\\b|\\boeko\\b",
    language: "de",
    category: "general",
    regulation: "EU 2024/825 Art 3.2",
    penaltyRange: "2-4% revenue",
    description: "Generic eco claim requires proof",
    alternatives: [
      "Ökologisch zertifiziert",
      "Umweltfreundliche Materialien nach Standard X",
      "Nachhaltige Produktionsmethoden"
    ],
    severity: "warning"
  },
  {
    term: "eco-friendly",
    regex: "eco\\s*friendly|eco\\s*friendly",
    language: "en",
    category: "general",
    regulation: "EU 2024/825 Art 3.2",
    penaltyRange: "2-4% revenue",
    description: "Generic eco-friendly claim requires specific data",
    alternatives: [
      "Made with 80% recycled materials",
      "Energy Star certified",
      "Reduced water consumption by X%"
    ],
    severity: "warning"
  },
  {
    term: "green",
    regex: "\\bgreen\\b(?!\\s*(?:energy|power|wave))",
    language: "en",
    category: "general",
    regulation: "EU 2024/825 Art 3.2",
    penaltyRange: "2-4% revenue",
    description: "Generic green claim needs specific context",
    alternatives: [
      "Environmentally conscious production",
      "Resource-efficient manufacturing",
      "Ecologically optimized processes"
    ],
    severity: "warning"
  },
  {
    term: "sustainable",
    regex: "\\bsustainable\\b(?!\\s*(?:development|fashion))",
    language: "en",
    category: "general",
    regulation: "EU 2024/825 Art 3.2",
    penaltyRange: "2-4% revenue",
    description: "Generic sustainable claim requires evidence",
    alternatives: [
      "Certified to FSC standard",
      "Sustainable sourcing per ISO 20400",
      "Sustainability initiatives in supply chain"
    ],
    severity: "warning"
  },
  {
    term: "biologisch abbaubar",
    regex: "biologisch\\s*abbaubar|biodegradable",
    language: "both",
    category: "materials",
    regulation: "EU 2024/825 Art 3.2",
    penaltyRange: "2-4% revenue",
    description: "Biodegradable claim requires certification and conditions",
    alternatives: [
      "Biologisch abbaubar nach EN 13432 (industrielle Kompostierung)",
      "Kompostierbar unter bestimmten Bedingungen",
      "Zertifiziert biologisch abbaubar nach Standard X"
    ],
    severity: "warning"
  },
  
  // Minor terms
  {
    term: "recycelbar",
    regex: "recycelbar|recyclable",
    language: "both",
    category: "materials",
    regulation: "EU 2024/825 Art 3.3",
    penaltyRange: "1-2% revenue",
    description: "Recyclable claim should specify recycling system",
    alternatives: [
      "Recycelbar im gelben Sack/Gelbe Tonne",
      "Recycelbar nach System X",
      "Zu 100% recycelbar in bestehenden Systemen"
    ],
    severity: "minor"
  },
  {
    term: "energieeffizient",
    regex: "energieeffizient|energy\\s*efficient",
    language: "both",
    category: "energy",
    regulation: "EU 2024/825 Art 3.3",
    penaltyRange: "1-2% revenue",
    description: "Energy efficient claim should specify efficiency class",
    alternatives: [
      "Energieeffizienzklasse A+++",
      "30% weniger Energieverbrauch als Standard",
      "Energieeffizient nach EU-Energielabel"
    ],
    severity: "minor"
  },
  {
    term: "wasser sparend",
    regex: "wasser\\s*sparend|water\\s*saving",
    language: "both",
    category: "resources",
    regulation: "EU 2024/825 Art 3.3",
    penaltyRange: "1-2% revenue",
    description: "Water saving claim should specify amount",
    alternatives: [
      "50% weniger Wasserverbrauch",
      "Wassersparend: X Liter pro Zyklus",
      "Reduzierter Wasserverbrauch um X%"
    ],
    severity: "minor"
  }
];

export function getTermsBySeverity(severity: "critical" | "warning" | "minor"): BannedTerm[] {
  return BANNED_TERMS.filter(term => term.severity === severity);
}

export function getAllTerms(): BannedTerm[] {
  return BANNED_TERMS;
}
