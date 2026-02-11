export interface BannedTerm {
  term: string;
  regex: RegExp;
  language: 'de' | 'en';
  category: 'climate' | 'general' | 'recycling' | 'energy';
  severity: 'critical' | 'warning' | 'minor';
  regulation: string;
  penaltyRange: string;
  description: string;
  alternatives: string[];
}

export const bannedTerms: BannedTerm[] = [
  // ========== CRITICAL TERMS (German) ==========
  {
    term: 'klimaneutral',
    regex: /\b(klima\s*neutral|klimaneutralität|klimaneutralen|klimaneutrale|klimaneutraler)\b/gi,
    language: 'de',
    category: 'climate',
    severity: 'critical',
    regulation: 'EU 2024/825 Art. 3.1',
    penaltyRange: '4-10% des Jahresumsatzes',
    description: 'Absolute Klimaneutralitäts-Claims erfordern vollständigen Lebenszyklus-Nachweis',
    alternatives: [
      'Reduzierung der CO2-Emissionen um X%',
      'Kompensation durch zertifizierte Klimaschutzprojekte',
      'CO2-reduziert'
    ]
  },
  {
    term: 'CO2-neutral',
    regex: /\b(CO2\s*[-]?\s*neutral|CO2-neutralität|CO2-neutralen|CO2-neutrale|CO2-neutraler|kohlenstoffneutral)\b/gi,
    language: 'de',
    category: 'climate',
    severity: 'critical',
    regulation: 'EU 2024/825 Art. 3.1',
    penaltyRange: '4-10% des Jahresumsatzes',
    description: 'CO2-Neutralität erfordert vollständigen Nachweis über den gesamten Lebenszyklus',
    alternatives: [
      'CO2-reduziert',
      'CO2-Kompensation durch zertifizierte Projekte',
      'Reduzierung der CO2-Emissionen'
    ]
  },
  {
    term: '100% umweltfreundlich',
    regex: /\b(100\s*%?\s*umweltfreundlich|vollständig\s*umweltfreundlich|komplett\s*umweltfreundlich)\b/gi,
    language: 'de',
    category: 'general',
    severity: 'critical',
    regulation: 'EU 2024/825 Art. 3.2',
    penaltyRange: '4-10% des Jahresumsatzes',
    description: 'Absolute Umweltfreundlichkeits-Claims sind ohne vollständigen Nachweis nicht zulässig',
    alternatives: [
      'Umweltfreundlicher als vergleichbare Produkte',
      'Reduzierte Umweltauswirkungen',
      'Nachhaltigere Alternative'
    ]
  },
  {
    term: 'vollständig nachhaltig',
    regex: /\b(vollständig\s*nachhaltig|komplett\s*nachhaltig|100\s*%?\s*nachhaltig|total\s*nachhaltig)\b/gi,
    language: 'de',
    category: 'general',
    severity: 'critical',
    regulation: 'EU 2024/825 Art. 3.2',
    penaltyRange: '4-10% des Jahresumsatzes',
    description: 'Absolute Nachhaltigkeits-Claims erfordern umfassenden Nachweis aller Aspekte',
    alternatives: [
      'Nachhaltiger als vergleichbare Produkte',
      'Nachhaltigkeitsaspekte: [spezifische Angaben]',
      'Teilweise nachhaltig'
    ]
  },
  {
    term: 'emissionsfrei',
    regex: /\b(emissionsfrei|emissionsfreie|emissionsfreien|emissionsfreier|null\s*emissionen|keine\s*emissionen)\b/gi,
    language: 'de',
    category: 'climate',
    severity: 'critical',
    regulation: 'EU 2024/825 Art. 3.1',
    penaltyRange: '4-10% des Jahresumsatzes',
    description: 'Emissionsfreiheit erfordert Nachweis für alle Emissionstypen im gesamten Lebenszyklus',
    alternatives: [
      'Reduzierte Emissionen',
      'Niedrigere Emissionen als [Vergleich]',
      'Emissionsarm'
    ]
  },
  {
    term: 'klimapositiv',
    regex: /\b(klimapositiv|klima\s*positiv|klimapositive|klimapositiven|klimapositiver)\b/gi,
    language: 'de',
    category: 'climate',
    severity: 'critical',
    regulation: 'EU 2024/825 Art. 3.1',
    penaltyRange: '4-10% des Jahresumsatzes',
    description: 'Klimapositiv-Claims erfordern Nachweis der Netto-Negativ-Emissionen',
    alternatives: [
      'Kompensation von mehr CO2 als produziert',
      'CO2-negativ durch zertifizierte Projekte'
    ]
  },
  {
    term: 'kohlenstofffrei',
    regex: /\b(kohlenstofffrei|kohlenstofffreie|kohlenstofffreien|kohlenstofffreier|carbon\s*free)\b/gi,
    language: 'de',
    category: 'climate',
    severity: 'critical',
    regulation: 'EU 2024/825 Art. 3.1',
    penaltyRange: '4-10% des Jahresumsatzes',
    description: 'Kohlenstofffreiheit erfordert vollständigen Nachweis über alle Kohlenstoffquellen',
    alternatives: [
      'Kohlenstoffreduziert',
      'Niedrige Kohlenstoffemissionen',
      'CO2-arm'
    ]
  },
  {
    term: '100% biologisch abbaubar',
    regex: /\b(100\s*%?\s*biologisch\s*abbaubar|vollständig\s*biologisch\s*abbaubar|komplett\s*biologisch\s*abbaubar)\b/gi,
    language: 'de',
    category: 'recycling',
    severity: 'critical',
    regulation: 'EU 2024/825 Art. 3.3',
    penaltyRange: '4-10% des Jahresumsatzes',
    description: 'Absolute Abbaubarkeits-Claims erfordern Nachweis unter realen Bedingungen',
    alternatives: [
      'Biologisch abbaubar unter [spezifischen Bedingungen]',
      'Kompostierbar nach [Standard]',
      'Teilweise biologisch abbaubar'
    ]
  },
  {
    term: 'vollständig recycelbar',
    regex: /\b(vollständig\s*recycelbar|100\s*%?\s*recycelbar|komplett\s*recycelbar|total\s*recycelbar)\b/gi,
    language: 'de',
    category: 'recycling',
    severity: 'critical',
    regulation: 'EU 2024/825 Art. 3.3',
    penaltyRange: '4-10% des Jahresumsatzes',
    description: 'Absolute Recycelbarkeits-Claims erfordern Nachweis der tatsächlichen Recycling-Infrastruktur',
    alternatives: [
      'Recycelbar wo entsprechende Infrastruktur vorhanden ist',
      'Recycelbar nach [Standard]',
      'Teilweise recycelbar'
    ]
  },
  {
    term: 'null CO2',
    regex: /\b(null\s*CO2|null\s*CO₂|zero\s*CO2|zero\s*CO₂|kein\s*CO2|kein\s*CO₂)\b/gi,
    language: 'de',
    category: 'climate',
    severity: 'critical',
    regulation: 'EU 2024/825 Art. 3.1',
    penaltyRange: '4-10% des Jahresumsatzes',
    description: 'Null-CO2-Claims erfordern Nachweis für den gesamten Lebenszyklus',
    alternatives: [
      'CO2-reduziert',
      'Niedrige CO2-Emissionen',
      'CO2-Kompensation'
    ]
  },
  {
    term: 'klimaneutral bis 2025',
    regex: /\b(klimaneutral\s*(bis|bis\s*zum)\s*\d{4}|klimaneutral\s*in\s*\d{4})\b/gi,
    language: 'de',
    category: 'climate',
    severity: 'critical',
    regulation: 'EU 2024/825 Art. 3.1',
    penaltyRange: '4-10% des Jahresumsatzes',
    description: 'Zukunftsversprechen erfordern konkreten, überprüfbaren Plan',
    alternatives: [
      'Ziel: CO2-Reduktion um X% bis [Jahr]',
      'Auf dem Weg zur Klimaneutralität',
      'Klimaneutralitätsplan: [spezifische Maßnahmen]'
    ]
  },
  {
    term: '100% erneuerbar',
    regex: /\b(100\s*%?\s*erneuerbar|vollständig\s*erneuerbar|komplett\s*erneuerbar)\b/gi,
    language: 'de',
    category: 'energy',
    severity: 'critical',
    regulation: 'EU 2024/825 Art. 3.4',
    penaltyRange: '4-10% des Jahresumsatzes',
    description: 'Absolute Erneuerbarkeits-Claims erfordern Nachweis der Energiequelle',
    alternatives: [
      'Erneuerbare Energie aus [Quelle]',
      'X% erneuerbare Energie',
      'Erneuerbare Energie wo verfügbar'
    ]
  },
  {
    term: 'klimaneutral produziert',
    regex: /\b(klimaneutral\s*produziert|klimaneutral\s*hergestellt|klimaneutral\s*gefertigt)\b/gi,
    language: 'de',
    category: 'climate',
    severity: 'critical',
    regulation: 'EU 2024/825 Art. 3.1',
    penaltyRange: '4-10% des Jahresumsatzes',
    description: 'Produktions-Claims erfordern Nachweis nur für Produktionsphase, nicht Gesamtlebenszyklus',
    alternatives: [
      'CO2-reduzierte Produktion',
      'Nachhaltigere Produktion',
      'Produktion mit erneuerbaren Energien'
    ]
  },
  {
    term: 'vollständig kompostierbar',
    regex: /\b(vollständig\s*kompostierbar|100\s*%?\s*kompostierbar|komplett\s*kompostierbar)\b/gi,
    language: 'de',
    category: 'recycling',
    severity: 'critical',
    regulation: 'EU 2024/825 Art. 3.3',
    penaltyRange: '4-10% des Jahresumsatzes',
    description: 'Kompostierbarkeits-Claims erfordern Nachweis nach EN 13432 oder ähnlichen Standards',
    alternatives: [
      'Kompostierbar nach EN 13432',
      'Kompostierbar unter industriellen Bedingungen',
      'Kompostierbar in [spezifischen] Kompostieranlagen'
    ]
  },
  {
    term: 'klimaneutral geliefert',
    regex: /\b(klimaneutral\s*geliefert|klimaneutral\s*versendet|klimaneutral\s*transportiert)\b/gi,
    language: 'de',
    category: 'climate',
    severity: 'critical',
    regulation: 'EU 2024/825 Art. 3.1',
    penaltyRange: '4-10% des Jahresumsatzes',
    description: 'Transport-Claims erfordern Nachweis der Kompensation oder emissionsfreien Transport',
    alternatives: [
      'CO2-kompensierter Versand',
      'Nachhaltiger Versand',
      'Versand mit erneuerbaren Energien'
    ]
  },

  // ========== CRITICAL TERMS (English) ==========
  {
    term: 'carbon neutral',
    regex: /\b(carbon\s*neutral|carbon\s*neutrality)\b/gi,
    language: 'en',
    category: 'climate',
    severity: 'critical',
    regulation: 'EU 2024/825 Art. 3.1',
    penaltyRange: '4-10% of annual turnover',
    description: 'Absolute carbon neutrality claims require complete lifecycle proof',
    alternatives: [
      'CO2 reduction of X%',
      'Compensation through certified climate protection projects',
      'CO2-reduced'
    ]
  },
  {
    term: 'climate neutral',
    regex: /\b(climate\s*neutral|climate\s*neutrality)\b/gi,
    language: 'en',
    category: 'climate',
    severity: 'critical',
    regulation: 'EU 2024/825 Art. 3.1',
    penaltyRange: '4-10% of annual turnover',
    description: 'Absolute climate neutrality claims require complete lifecycle proof',
    alternatives: [
      'CO2 reduction of X%',
      'Climate compensation through certified projects',
      'Reduced climate impact'
    ]
  },
  {
    term: '100% eco-friendly',
    regex: /\b(100\s*%?\s*eco\s*-?\s*friendly|fully\s*eco\s*-?\s*friendly|completely\s*eco\s*-?\s*friendly)\b/gi,
    language: 'en',
    category: 'general',
    severity: 'critical',
    regulation: 'EU 2024/825 Art. 3.2',
    penaltyRange: '4-10% of annual turnover',
    description: 'Absolute eco-friendliness claims are not permitted without complete proof',
    alternatives: [
      'More eco-friendly than comparable products',
      'Reduced environmental impact',
      'More sustainable alternative'
    ]
  },
  {
    term: 'fully sustainable',
    regex: /\b(fully\s*sustainable|completely\s*sustainable|100\s*%?\s*sustainable|totally\s*sustainable)\b/gi,
    language: 'en',
    category: 'general',
    severity: 'critical',
    regulation: 'EU 2024/825 Art. 3.2',
    penaltyRange: '4-10% of annual turnover',
    description: 'Absolute sustainability claims require comprehensive proof of all aspects',
    alternatives: [
      'More sustainable than comparable products',
      'Sustainability aspects: [specific details]',
      'Partially sustainable'
    ]
  },
  {
    term: 'zero emissions',
    regex: /\b(zero\s*emissions|no\s*emissions|emission\s*free)\b/gi,
    language: 'en',
    category: 'climate',
    severity: 'critical',
    regulation: 'EU 2024/825 Art. 3.1',
    penaltyRange: '4-10% of annual turnover',
    description: 'Zero emissions claims require proof for all emission types across entire lifecycle',
    alternatives: [
      'Reduced emissions',
      'Lower emissions than [comparison]',
      'Low-emission'
    ]
  },
  {
    term: 'climate positive',
    regex: /\b(climate\s*positive|carbon\s*negative|carbon\s*positive)\b/gi,
    language: 'en',
    category: 'climate',
    severity: 'critical',
    regulation: 'EU 2024/825 Art. 3.1',
    penaltyRange: '4-10% of annual turnover',
    description: 'Climate positive claims require proof of net-negative emissions',
    alternatives: [
      'Compensation of more CO2 than produced',
      'CO2-negative through certified projects'
    ]
  },
  {
    term: 'carbon free',
    regex: /\b(carbon\s*free|carbon\s*-?\s*free)\b/gi,
    language: 'en',
    category: 'climate',
    severity: 'critical',
    regulation: 'EU 2024/825 Art. 3.1',
    penaltyRange: '4-10% of annual turnover',
    description: 'Carbon-free claims require complete proof across all carbon sources',
    alternatives: [
      'Carbon-reduced',
      'Low carbon emissions',
      'CO2-low'
    ]
  },
  {
    term: '100% biodegradable',
    regex: /\b(100\s*%?\s*biodegradable|fully\s*biodegradable|completely\s*biodegradable)\b/gi,
    language: 'en',
    category: 'recycling',
    severity: 'critical',
    regulation: 'EU 2024/825 Art. 3.3',
    penaltyRange: '4-10% of annual turnover',
    description: 'Absolute biodegradability claims require proof under real conditions',
    alternatives: [
      'Biodegradable under [specific conditions]',
      'Compostable according to [standard]',
      'Partially biodegradable'
    ]
  },
  {
    term: 'fully recyclable',
    regex: /\b(fully\s*recyclable|100\s*%?\s*recyclable|completely\s*recyclable|totally\s*recyclable)\b/gi,
    language: 'en',
    category: 'recycling',
    severity: 'critical',
    regulation: 'EU 2024/825 Art. 3.3',
    penaltyRange: '4-10% of annual turnover',
    description: 'Absolute recyclability claims require proof of actual recycling infrastructure',
    alternatives: [
      'Recyclable where corresponding infrastructure exists',
      'Recyclable according to [standard]',
      'Partially recyclable'
    ]
  },
  {
    term: 'zero carbon',
    regex: /\b(zero\s*carbon|zero\s*CO2|zero\s*CO₂)\b/gi,
    language: 'en',
    category: 'climate',
    severity: 'critical',
    regulation: 'EU 2024/825 Art. 3.1',
    penaltyRange: '4-10% of annual turnover',
    description: 'Zero carbon claims require proof across entire lifecycle',
    alternatives: [
      'Carbon-reduced',
      'Low carbon emissions',
      'Carbon compensation'
    ]
  },
  {
    term: 'carbon neutral by 2025',
    regex: /\b(carbon\s*neutral\s*(by|before)\s*\d{4}|climate\s*neutral\s*(by|before)\s*\d{4})\b/gi,
    language: 'en',
    category: 'climate',
    severity: 'critical',
    regulation: 'EU 2024/825 Art. 3.1',
    penaltyRange: '4-10% of annual turnover',
    description: 'Future promises require concrete, verifiable plan',
    alternatives: [
      'Goal: CO2 reduction of X% by [year]',
      'On the path to carbon neutrality',
      'Carbon neutrality plan: [specific measures]'
    ]
  },
  {
    term: '100% renewable',
    regex: /\b(100\s*%?\s*renewable|fully\s*renewable|completely\s*renewable)\b/gi,
    language: 'en',
    category: 'energy',
    severity: 'critical',
    regulation: 'EU 2024/825 Art. 3.4',
    penaltyRange: '4-10% of annual turnover',
    description: 'Absolute renewable energy claims require proof of energy source',
    alternatives: [
      'Renewable energy from [source]',
      'X% renewable energy',
      'Renewable energy where available'
    ]
  },
  {
    term: 'carbon neutral production',
    regex: /\b(carbon\s*neutral\s*production|climate\s*neutral\s*production)\b/gi,
    language: 'en',
    category: 'climate',
    severity: 'critical',
    regulation: 'EU 2024/825 Art. 3.1',
    penaltyRange: '4-10% of annual turnover',
    description: 'Production claims require proof only for production phase, not entire lifecycle',
    alternatives: [
      'CO2-reduced production',
      'More sustainable production',
      'Production with renewable energy'
    ]
  },
  {
    term: 'fully compostable',
    regex: /\b(fully\s*compostable|100\s*%?\s*compostable|completely\s*compostable)\b/gi,
    language: 'en',
    category: 'recycling',
    severity: 'critical',
    regulation: 'EU 2024/825 Art. 3.3',
    penaltyRange: '4-10% of annual turnover',
    description: 'Compostability claims require proof according to EN 13432 or similar standards',
    alternatives: [
      'Compostable according to EN 13432',
      'Compostable under industrial conditions',
      'Compostable in [specific] composting facilities'
    ]
  },
  {
    term: 'carbon neutral shipping',
    regex: /\b(carbon\s*neutral\s*shipping|carbon\s*neutral\s*delivery|climate\s*neutral\s*shipping)\b/gi,
    language: 'en',
    category: 'climate',
    severity: 'critical',
    regulation: 'EU 2024/825 Art. 3.1',
    penaltyRange: '4-10% of annual turnover',
    description: 'Shipping claims require proof of compensation or emission-free transport',
    alternatives: [
      'CO2-compensated shipping',
      'Sustainable shipping',
      'Shipping with renewable energy'
    ]
  },

  // ========== WARNING TERMS ==========
  {
    term: 'umweltfreundlich',
    regex: /\b(umweltfreundlich|umweltfreundliche|umweltfreundlichen|umweltfreundlicher)\b/gi,
    language: 'de',
    category: 'general',
    severity: 'warning',
    regulation: 'EU 2024/825 Art. 4.1',
    penaltyRange: '2-4% des Jahresumsatzes',
    description: 'Umweltfreundlichkeits-Claims erfordern spezifische Angaben und Nachweise',
    alternatives: [
      'Umweltfreundlicher als [Vergleich]',
      'Reduzierte Umweltauswirkungen in [Bereich]',
      'Nachhaltigere Alternative'
    ]
  },
  {
    term: 'nachhaltig',
    regex: /\b(nachhaltig|nachhaltige|nachhaltigen|nachhaltiger|nachhaltigkeit)\b/gi,
    language: 'de',
    category: 'general',
    severity: 'warning',
    regulation: 'EU 2024/825 Art. 4.1',
    penaltyRange: '2-4% des Jahresumsatzes',
    description: 'Nachhaltigkeits-Claims erfordern Spezifizierung der Nachhaltigkeitsaspekte',
    alternatives: [
      'Nachhaltig in [spezifischem Bereich]',
      'Nachhaltigkeitsaspekte: [spezifische Angaben]',
      'Nachhaltiger als [Vergleich]'
    ]
  },
  {
    term: 'grün',
    regex: /\b(grün|grüne|grünen|grüner|grünes)\b/gi,
    language: 'de',
    category: 'general',
    severity: 'warning',
    regulation: 'EU 2024/825 Art. 4.1',
    penaltyRange: '2-4% des Jahresumsatzes',
    description: 'Generische "grün"-Claims erfordern Konkretisierung',
    alternatives: [
      'Umweltfreundlich in [Bereich]',
      'Nachhaltig in [Aspekt]',
      'CO2-reduziert'
    ]
  },
  {
    term: 'öko',
    regex: /\b(öko|öko-|ökologisch|ökologische|ökologischen|ökologischer)\b/gi,
    language: 'de',
    category: 'general',
    severity: 'warning',
    regulation: 'EU 2024/825 Art. 4.1',
    penaltyRange: '2-4% des Jahresumsatzes',
    description: 'Öko-Claims erfordern Spezifizierung der ökologischen Aspekte',
    alternatives: [
      'Ökologisch in [spezifischem Bereich]',
      'Umweltfreundlich in [Aspekt]',
      'Nachhaltig in [Bereich]'
    ]
  },
  {
    term: 'biologisch abbaubar',
    regex: /\b(biologisch\s*abbaubar|biologisch\s*abbaubare|biologisch\s*abbaubaren)\b/gi,
    language: 'de',
    category: 'recycling',
    severity: 'warning',
    regulation: 'EU 2024/825 Art. 4.2',
    penaltyRange: '2-4% des Jahresumsatzes',
    description: 'Abbaubarkeits-Claims erfordern Angabe der Bedingungen',
    alternatives: [
      'Biologisch abbaubar unter [Bedingungen]',
      'Kompostierbar nach [Standard]',
      'Abbaubar in [Umgebung]'
    ]
  },
  {
    term: 'recycelbar',
    regex: /\b(recycelbar|recycelbare|recycelbaren|recycelbarer)\b/gi,
    language: 'de',
    category: 'recycling',
    severity: 'warning',
    regulation: 'EU 2024/825 Art. 4.2',
    penaltyRange: '2-4% des Jahresumsatzes',
    description: 'Recycelbarkeits-Claims erfordern Angabe der Verfügbarkeit der Infrastruktur',
    alternatives: [
      'Recycelbar wo Infrastruktur vorhanden ist',
      'Recycelbar nach [Standard]',
      'Recycelbar in [Regionen]'
    ]
  },
  {
    term: 'eco-friendly',
    regex: /\b(eco\s*-?\s*friendly|environmentally\s*friendly)\b/gi,
    language: 'en',
    category: 'general',
    severity: 'warning',
    regulation: 'EU 2024/825 Art. 4.1',
    penaltyRange: '2-4% of annual turnover',
    description: 'Eco-friendly claims require specific details and proof',
    alternatives: [
      'More eco-friendly than [comparison]',
      'Reduced environmental impact in [area]',
      'More sustainable alternative'
    ]
  },
  {
    term: 'sustainable',
    regex: /\b(sustainable|sustainability)\b/gi,
    language: 'en',
    category: 'general',
    severity: 'warning',
    regulation: 'EU 2024/825 Art. 4.1',
    penaltyRange: '2-4% of annual turnover',
    description: 'Sustainability claims require specification of sustainability aspects',
    alternatives: [
      'Sustainable in [specific area]',
      'Sustainability aspects: [specific details]',
      'More sustainable than [comparison]'
    ]
  },
  {
    term: 'green',
    regex: /\b(green|greener|greenest)\b/gi,
    language: 'en',
    category: 'general',
    severity: 'warning',
    regulation: 'EU 2024/825 Art. 4.1',
    penaltyRange: '2-4% of annual turnover',
    description: 'Generic "green" claims require specification',
    alternatives: [
      'Environmentally friendly in [area]',
      'Sustainable in [aspect]',
      'CO2-reduced'
    ]
  },
  {
    term: 'eco',
    regex: /\b(eco|ecological|ecologically)\b/gi,
    language: 'en',
    category: 'general',
    severity: 'warning',
    regulation: 'EU 2024/825 Art. 4.1',
    penaltyRange: '2-4% of annual turnover',
    description: 'Eco claims require specification of ecological aspects',
    alternatives: [
      'Ecological in [specific area]',
      'Environmentally friendly in [aspect]',
      'Sustainable in [area]'
    ]
  },
  {
    term: 'biodegradable',
    regex: /\b(biodegradable)\b/gi,
    language: 'en',
    category: 'recycling',
    severity: 'warning',
    regulation: 'EU 2024/825 Art. 4.2',
    penaltyRange: '2-4% of annual turnover',
    description: 'Biodegradability claims require specification of conditions',
    alternatives: [
      'Biodegradable under [conditions]',
      'Compostable according to [standard]',
      'Degradable in [environment]'
    ]
  },
  {
    term: 'recyclable',
    regex: /\b(recyclable|recycleable)\b/gi,
    language: 'en',
    category: 'recycling',
    severity: 'warning',
    regulation: 'EU 2024/825 Art. 4.2',
    penaltyRange: '2-4% of annual turnover',
    description: 'Recyclability claims require specification of infrastructure availability',
    alternatives: [
      'Recyclable where infrastructure exists',
      'Recyclable according to [standard]',
      'Recyclable in [regions]'
    ]
  },
  {
    term: 'energieeffizient',
    regex: /\b(energieeffizient|energieeffiziente|energieeffizienten|energieeffizienter)\b/gi,
    language: 'de',
    category: 'energy',
    severity: 'warning',
    regulation: 'EU 2024/825 Art. 4.3',
    penaltyRange: '2-4% des Jahresumsatzes',
    description: 'Energieeffizienz-Claims erfordern Vergleichsangaben',
    alternatives: [
      'X% energieeffizienter als [Vergleich]',
      'Energieeffizienzklasse [Klasse]',
      'Niedriger Energieverbrauch'
    ]
  },
  {
    term: 'energy efficient',
    regex: /\b(energy\s*efficient|energy\s*efficiency)\b/gi,
    language: 'en',
    category: 'energy',
    severity: 'warning',
    regulation: 'EU 2024/825 Art. 4.3',
    penaltyRange: '2-4% of annual turnover',
    description: 'Energy efficiency claims require comparison details',
    alternatives: [
      'X% more energy efficient than [comparison]',
      'Energy efficiency class [class]',
      'Low energy consumption'
    ]
  },
  {
    term: 'natürlich',
    regex: /\b(natürlich|natürliche|natürlichen|natürlicher|natürliches)\b/gi,
    language: 'de',
    category: 'general',
    severity: 'warning',
    regulation: 'EU 2024/825 Art. 4.1',
    penaltyRange: '2-4% des Jahresumsatzes',
    description: 'Natürlichkeits-Claims erfordern Spezifizierung',
    alternatives: [
      'Natürliche Inhaltsstoffe: [Liste]',
      'Aus natürlichen Materialien',
      'Natürlich in [Aspekt]'
    ]
  },
  {
    term: 'natural',
    regex: /\b(natural|naturally)\b/gi,
    language: 'en',
    category: 'general',
    severity: 'warning',
    regulation: 'EU 2024/825 Art. 4.1',
    penaltyRange: '2-4% of annual turnover',
    description: 'Natural claims require specification',
    alternatives: [
      'Natural ingredients: [list]',
      'Made from natural materials',
      'Natural in [aspect]'
    ]
  },
  {
    term: 'umweltbewusst',
    regex: /\b(umweltbewusst|umweltbewusste|umweltbewussten|umweltbewusster)\b/gi,
    language: 'de',
    category: 'general',
    severity: 'warning',
    regulation: 'EU 2024/825 Art. 4.1',
    penaltyRange: '2-4% des Jahresumsatzes',
    description: 'Umweltbewusstseins-Claims erfordern Konkretisierung',
    alternatives: [
      'Umweltbewusst in [Bereich]',
      'Mit Fokus auf Umweltschutz',
      'Nachhaltig in [Aspekt]'
    ]
  },
  {
    term: 'environmentally conscious',
    regex: /\b(environmentally\s*conscious|eco\s*conscious)\b/gi,
    language: 'en',
    category: 'general',
    severity: 'warning',
    regulation: 'EU 2024/825 Art. 4.1',
    penaltyRange: '2-4% of annual turnover',
    description: 'Environmentally conscious claims require specification',
    alternatives: [
      'Environmentally conscious in [area]',
      'With focus on environmental protection',
      'Sustainable in [aspect]'
    ]
  },
  {
    term: 'klimafreundlich',
    regex: /\b(klimafreundlich|klimafreundliche|klimafreundlichen|klimafreundlicher)\b/gi,
    language: 'de',
    category: 'climate',
    severity: 'warning',
    regulation: 'EU 2024/825 Art. 4.1',
    penaltyRange: '2-4% des Jahresumsatzes',
    description: 'Klimafreundlichkeits-Claims erfordern Spezifizierung',
    alternatives: [
      'Klimafreundlicher als [Vergleich]',
      'Reduzierte CO2-Emissionen',
      'CO2-reduziert'
    ]
  },
  {
    term: 'climate friendly',
    regex: /\b(climate\s*friendly|climate\s*-?\s*friendly)\b/gi,
    language: 'en',
    category: 'climate',
    severity: 'warning',
    regulation: 'EU 2024/825 Art. 4.1',
    penaltyRange: '2-4% of annual turnover',
    description: 'Climate friendly claims require specification',
    alternatives: [
      'More climate friendly than [comparison]',
      'Reduced CO2 emissions',
      'CO2-reduced'
    ]
  },
  {
    term: 'ressourcenschonend',
    regex: /\b(ressourcenschonend|ressourcenschonende|ressourcenschonenden|ressourcenschonender)\b/gi,
    language: 'de',
    category: 'general',
    severity: 'warning',
    regulation: 'EU 2024/825 Art. 4.1',
    penaltyRange: '2-4% des Jahresumsatzes',
    description: 'Ressourcenschonungs-Claims erfordern Spezifizierung',
    alternatives: [
      'Ressourcenschonend in [Bereich]',
      'Reduzierter Ressourcenverbrauch',
      'Effizienter Ressourceneinsatz'
    ]
  },
  {
    term: 'resource efficient',
    regex: /\b(resource\s*efficient|resource\s*-?\s*efficient)\b/gi,
    language: 'en',
    category: 'general',
    severity: 'warning',
    regulation: 'EU 2024/825 Art. 4.1',
    penaltyRange: '2-4% of annual turnover',
    description: 'Resource efficiency claims require specification',
    alternatives: [
      'Resource efficient in [area]',
      'Reduced resource consumption',
      'Efficient resource use'
    ]
  },

  // ========== MINOR TERMS ==========
  {
    term: 'umweltverträglich',
    regex: /\b(umweltverträglich|umweltverträgliche|umweltverträglichen|umweltverträglicher)\b/gi,
    language: 'de',
    category: 'general',
    severity: 'minor',
    regulation: 'EU 2024/825 Art. 5.1',
    penaltyRange: 'bis zu 2% des Jahresumsatzes',
    description: 'Umweltverträglichkeits-Claims sollten spezifiziert werden',
    alternatives: [
      'Umweltverträglich in [Bereich]',
      'Mit reduzierten Umweltauswirkungen',
      'Nachhaltig in [Aspekt]'
    ]
  },
  {
    term: 'environmentally compatible',
    regex: /\b(environmentally\s*compatible|eco\s*compatible)\b/gi,
    language: 'en',
    category: 'general',
    severity: 'minor',
    regulation: 'EU 2024/825 Art. 5.1',
    penaltyRange: 'up to 2% of annual turnover',
    description: 'Environmental compatibility claims should be specified',
    alternatives: [
      'Environmentally compatible in [area]',
      'With reduced environmental impact',
      'Sustainable in [aspect]'
    ]
  },
  {
    term: 'klimaschonend',
    regex: /\b(klimaschonend|klimaschonende|klimaschonenden|klimaschonender)\b/gi,
    language: 'de',
    category: 'climate',
    severity: 'minor',
    regulation: 'EU 2024/825 Art. 5.1',
    penaltyRange: 'bis zu 2% des Jahresumsatzes',
    description: 'Klimaschonungs-Claims sollten spezifiziert werden',
    alternatives: [
      'Klimaschonend in [Bereich]',
      'Mit reduzierten CO2-Emissionen',
      'CO2-reduziert'
    ]
  },
  {
    term: 'climate preserving',
    regex: /\b(climate\s*preserving|climate\s*-?\s*preserving)\b/gi,
    language: 'en',
    category: 'climate',
    severity: 'minor',
    regulation: 'EU 2024/825 Art. 5.1',
    penaltyRange: 'up to 2% of annual turnover',
    description: 'Climate preserving claims should be specified',
    alternatives: [
      'Climate preserving in [area]',
      'With reduced CO2 emissions',
      'CO2-reduced'
    ]
  },
  {
    term: 'nachhaltig produziert',
    regex: /\b(nachhaltig\s*produziert|nachhaltig\s*hergestellt|nachhaltig\s*gefertigt)\b/gi,
    language: 'de',
    category: 'general',
    severity: 'minor',
    regulation: 'EU 2024/825 Art. 5.1',
    penaltyRange: 'bis zu 2% des Jahresumsatzes',
    description: 'Produktions-Claims sollten spezifiziert werden',
    alternatives: [
      'Nachhaltig produziert in [Bereich]',
      'Mit nachhaltigen Produktionsmethoden',
      'Nachhaltigere Produktion'
    ]
  },
  {
    term: 'sustainably produced',
    regex: /\b(sustainably\s*produced|sustainably\s*manufactured)\b/gi,
    language: 'en',
    category: 'general',
    severity: 'minor',
    regulation: 'EU 2024/825 Art. 5.1',
    penaltyRange: 'up to 2% of annual turnover',
    description: 'Production claims should be specified',
    alternatives: [
      'Sustainably produced in [area]',
      'With sustainable production methods',
      'More sustainable production'
    ]
  },
  {
    term: 'umweltgerecht',
    regex: /\b(umweltgerecht|umweltgerechte|umweltgerechten|umweltgerechter)\b/gi,
    language: 'de',
    category: 'general',
    severity: 'minor',
    regulation: 'EU 2024/825 Art. 5.1',
    penaltyRange: 'bis zu 2% des Jahresumsatzes',
    description: 'Umweltgerechtigkeits-Claims sollten spezifiziert werden',
    alternatives: [
      'Umweltgerecht in [Bereich]',
      'Mit Fokus auf Umweltschutz',
      'Nachhaltig in [Aspekt]'
    ]
  },
  {
    term: 'environmentally sound',
    regex: /\b(environmentally\s*sound|eco\s*sound)\b/gi,
    language: 'en',
    category: 'general',
    severity: 'minor',
    regulation: 'EU 2024/825 Art. 5.1',
    penaltyRange: 'up to 2% of annual turnover',
    description: 'Environmentally sound claims should be specified',
    alternatives: [
      'Environmentally sound in [area]',
      'With focus on environmental protection',
      'Sustainable in [aspect]'
    ]
  },
  {
    term: 'klimaverträglich',
    regex: /\b(klimaverträglich|klimaverträgliche|klimaverträglichen|klimaverträglicher)\b/gi,
    language: 'de',
    category: 'climate',
    severity: 'minor',
    regulation: 'EU 2024/825 Art. 5.1',
    penaltyRange: 'bis zu 2% des Jahresumsatzes',
    description: 'Klimaverträglichkeits-Claims sollten spezifiziert werden',
    alternatives: [
      'Klimaverträglich in [Bereich]',
      'Mit reduzierten Klimaauswirkungen',
      'CO2-reduziert'
    ]
  },
  {
    term: 'climate compatible',
    regex: /\b(climate\s*compatible|climate\s*-?\s*compatible)\b/gi,
    language: 'en',
    category: 'climate',
    severity: 'minor',
    regulation: 'EU 2024/825 Art. 5.1',
    penaltyRange: 'up to 2% of annual turnover',
    description: 'Climate compatibility claims should be specified',
    alternatives: [
      'Climate compatible in [area]',
      'With reduced climate impact',
      'CO2-reduced'
    ]
  },

  // ========== ECGT DIRECTIVE - OFFSET-BASED CLAIMS (CRITICAL) ==========
  {
    term: 'net zero',
    regex: /\b(net\s*zero|net\s*-?\s*zero\s*emissions?)\b/gi,
    language: 'en',
    category: 'climate',
    severity: 'critical',
    regulation: 'EU 2024/825 Annex I point 4a',
    penaltyRange: '4-10% of annual turnover',
    description: 'Net zero claims on products are prohibited when based on greenhouse gas offsetting under ECGT',
    alternatives: [
      'Verified X% reduction in emissions compared to [baseline]',
      'On track to reduce emissions by X% by [year] (with published plan)',
      'Science-based emissions reduction of X%'
    ]
  },
  {
    term: 'CO2 compensated',
    regex: /\b(CO2\s*compensat(ed|ion)|carbon\s*compensat(ed|ion)|climate\s*compensat(ed|ion)|kohlenstoff\s*kompensiert)\b/gi,
    language: 'en',
    category: 'climate',
    severity: 'critical',
    regulation: 'EU 2024/825 Annex I point 4a',
    penaltyRange: '4-10% of annual turnover',
    description: 'Product-level claims relying on carbon offsetting/compensation are prohibited under ECGT',
    alternatives: [
      'Reduced CO2 emissions by X% through [specific measures]',
      'Lower carbon footprint than [comparison] based on [methodology]',
      'Invested in certified climate projects (without claiming neutrality)'
    ]
  },
  {
    term: 'carbon offset',
    regex: /\b(carbon\s*offset|carbon\s*offsets|carbon\s*offsetting|CO2\s*offset)\b/gi,
    language: 'en',
    category: 'climate',
    severity: 'warning',
    regulation: 'EU 2024/825 Annex I point 4a',
    penaltyRange: '2-4% of annual turnover',
    description: 'References to carbon offsets in consumer marketing should not imply product neutrality or positive impact',
    alternatives: [
      'Supporting certified climate projects',
      'Contributing to [specific project] for emissions reduction',
      'Investing in climate action beyond our supply chain'
    ]
  },
  {
    term: 'planet friendly',
    regex: /\b(planet\s*friendly|planet\s*-?\s*friendly)\b/gi,
    language: 'en',
    category: 'general',
    severity: 'warning',
    regulation: 'EU 2024/825 Art. 4.1',
    penaltyRange: '2-4% of annual turnover',
    description: 'Generic planet-friendly claims require substantiation with specific, verifiable details',
    alternatives: [
      'Reduced environmental impact in [specific area]',
      'Lower [specific metric] compared to [benchmark]',
      '[Specific certified label] certified'
    ]
  },
  {
    term: 'earth friendly',
    regex: /\b(earth\s*friendly|earth\s*-?\s*friendly)\b/gi,
    language: 'en',
    category: 'general',
    severity: 'warning',
    regulation: 'EU 2024/825 Art. 4.1',
    penaltyRange: '2-4% of annual turnover',
    description: 'Generic earth-friendly claims require substantiation with specific, verifiable details',
    alternatives: [
      'Reduced environmental impact in [specific area]',
      'Lower [specific metric] compared to [benchmark]',
      '[Specific certified label] certified'
    ]
  },
  {
    term: 'clean',
    regex: /\b(clean\s*energy|clean\s*product|clean\s*brand|clean\s*beauty)\b/gi,
    language: 'en',
    category: 'general',
    severity: 'warning',
    regulation: 'EU 2024/825 Art. 4.1',
    penaltyRange: '2-4% of annual turnover',
    description: '"Clean" claims in environmental context are generic and require specification of what makes the product clean',
    alternatives: [
      'Free from [specific substances]',
      'Made with [specific clean ingredients]',
      'Certified by [specific scheme] for [specific aspect]'
    ]
  },
  {
    term: 'Netto-Null',
    regex: /\b(netto\s*null|netto\s*-?\s*null\s*emissionen?)\b/gi,
    language: 'de',
    category: 'climate',
    severity: 'critical',
    regulation: 'EU 2024/825 Annex I Punkt 4a',
    penaltyRange: '4-10% des Jahresumsatzes',
    description: 'Netto-Null-Claims auf Produktebene sind verboten, wenn sie auf Kompensation basieren',
    alternatives: [
      'Verifizierte Reduktion der Emissionen um X% gegenüber [Vergleich]',
      'Wissenschaftsbasierte Emissionsreduktion um X%',
      'Auf dem Weg zur Emissionsreduktion mit veröffentlichtem Plan'
    ]
  },
  {
    term: 'CO2-kompensiert',
    regex: /\b(CO2\s*-?\s*kompensiert|kohlenstoff\s*kompensiert|klima\s*kompensiert|CO2\s*-?\s*Kompensation)\b/gi,
    language: 'de',
    category: 'climate',
    severity: 'critical',
    regulation: 'EU 2024/825 Annex I Punkt 4a',
    penaltyRange: '4-10% des Jahresumsatzes',
    description: 'Produktbezogene Kompensations-Claims sind unter der ECGT-Richtlinie verboten',
    alternatives: [
      'CO2-Emissionen um X% reduziert durch [spezifische Maßnahmen]',
      'Geringerer CO2-Fußabdruck als [Vergleich]',
      'Investition in zertifizierte Klimaprojekte (ohne Neutralitäts-Claim)'
    ]
  },
  {
    term: 'planetenfreundlich',
    regex: /\b(planetenfreundlich|planetenfreundliche|planetenfreundlichen)\b/gi,
    language: 'de',
    category: 'general',
    severity: 'warning',
    regulation: 'EU 2024/825 Art. 4.1',
    penaltyRange: '2-4% des Jahresumsatzes',
    description: 'Generische planetenfreundlich-Claims erfordern spezifische, überprüfbare Details',
    alternatives: [
      'Reduzierte Umweltauswirkungen in [spezifischem Bereich]',
      'Geringerer [spezifischer Messwert] im Vergleich zu [Benchmark]',
      'Zertifiziert nach [spezifischem Schema]'
    ]
  },
  {
    term: 'conscious',
    regex: /\b(conscious\s*collection|conscious\s*choice|conscious\s*product)\b/gi,
    language: 'en',
    category: 'general',
    severity: 'warning',
    regulation: 'EU 2024/825 Art. 4.1',
    penaltyRange: '2-4% of annual turnover',
    description: '"Conscious" product claims are generic environmental claims requiring substantiation under ECGT',
    alternatives: [
      'Made with [X%] recycled materials',
      'Certified by [specific scheme]',
      '[Specific environmental improvement] compared to [previous product]'
    ]
  },
  {
    term: 'circular',
    regex: /\b(circular\s*economy|circular\s*product|fully\s*circular|100\s*%?\s*circular)\b/gi,
    language: 'en',
    category: 'recycling',
    severity: 'warning',
    regulation: 'EU 2024/825 Art. 4.2',
    penaltyRange: '2-4% of annual turnover',
    description: 'Circular economy claims on products require specification of which aspects are circular',
    alternatives: [
      'Made with [X%] recycled content',
      'Designed for disassembly and recycling',
      'Take-back programme available at [locations]'
    ]
  },
  {
    term: 'plastic free',
    regex: /\b(plastic\s*free|plastic\s*-?\s*free|plastikfrei)\b/gi,
    language: 'en',
    category: 'recycling',
    severity: 'minor',
    regulation: 'EU 2024/825 Art. 5.1',
    penaltyRange: 'up to 2% of annual turnover',
    description: 'Plastic-free claims should specify scope (packaging, product, or both) and be verifiable',
    alternatives: [
      'Plastic-free packaging',
      'Product made without plastic components',
      'X% less plastic than [comparison]'
    ]
  },
  {
    term: 'vegan leather',
    regex: /\b(vegan\s*leather|faux\s*leather|eco\s*leather|öko\s*leder)\b/gi,
    language: 'en',
    category: 'general',
    severity: 'minor',
    regulation: 'EU 2024/825 Art. 5.1',
    penaltyRange: 'up to 2% of annual turnover',
    description: 'Material claims implying environmental benefits should specify the actual material and its environmental profile',
    alternatives: [
      'Made from [specific material, e.g., polyurethane, mushroom mycelium]',
      'Non-animal material: [specific material]',
      'Plant-based material from [source]'
    ]
  }
];

// Helper function to get all terms
export function getAllTerms(): BannedTerm[] {
  return bannedTerms;
}

// Helper function to get terms by severity
export function getTermsBySeverity(severity: 'critical' | 'warning' | 'minor'): BannedTerm[] {
  return bannedTerms.filter(term => term.severity === severity);
}

// Helper function to get terms by language
export function getTermsByLanguage(language: 'de' | 'en'): BannedTerm[] {
  return bannedTerms.filter(term => term.language === language);
}

// Helper function to get terms by category
export function getTermsByCategory(category: BannedTerm['category']): BannedTerm[] {
  return bannedTerms.filter(term => term.category === category);
}
