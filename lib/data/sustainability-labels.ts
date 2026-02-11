/**
 * Comprehensive database of sustainability labels, logos, and certification schemes
 * categorized by their compliance status under EU Directive 2024/825 (ECGT)
 * and the (withdrawn but referenced) Green Claims Directive.
 *
 * From September 2026, only labels based on:
 * 1. Certified third-party verification schemes, or
 * 2. Public authority / EU-regulated schemes
 * are permitted on consumer-facing products in the EU.
 */

export type LabelStatus = 'certified' | 'banned' | 'conditional' | 'unknown';

export interface SustainabilityLabel {
  id: string;
  name: string;
  aliases: string[];
  status: LabelStatus;
  category: 'environmental' | 'climate' | 'recycling' | 'energy' | 'organic' | 'forestry' | 'marine' | 'social' | 'general';
  region: 'eu' | 'global' | 'national';
  certifyingBody: string;
  isThirdPartyVerified: boolean;
  isPublicAuthority: boolean;
  regulation: string;
  description: string;
  complianceNote: string;
  website: string;
  visualIndicators: string[];
}

/**
 * Labels established by public authorities or based on certified third-party schemes.
 * These are PERMITTED under EU 2024/825.
 */
export const certifiedLabels: SustainabilityLabel[] = [
  {
    id: 'eu-ecolabel',
    name: 'EU Ecolabel',
    aliases: ['EU Flower', 'European Ecolabel', 'EU Eco Label', 'Ecolabel EU', 'EU Umweltzeichen'],
    status: 'certified',
    category: 'environmental',
    region: 'eu',
    certifyingBody: 'European Commission (Regulation EC No 66/2010)',
    isThirdPartyVerified: true,
    isPublicAuthority: true,
    regulation: 'EU 2024/825 Recital 25',
    description: 'Official EU environmental label awarded to products and services meeting high environmental standards throughout their lifecycle.',
    complianceNote: 'Explicitly recognised in EU 2024/825 as a label established by public authorities. Fully compliant.',
    website: 'https://environment.ec.europa.eu/topics/circular-economy/eu-ecolabel_en',
    visualIndicators: ['flower logo', 'EU flower', 'green flower with EU stars', 'twelve-star flower'],
  },
  {
    id: 'emas',
    name: 'EMAS',
    aliases: ['Eco-Management and Audit Scheme', 'EU EMAS', 'EMAS Logo', 'EMAS Verified'],
    status: 'certified',
    category: 'environmental',
    region: 'eu',
    certifyingBody: 'European Commission (Regulation EC No 1221/2009)',
    isThirdPartyVerified: true,
    isPublicAuthority: true,
    regulation: 'EU 2024/825 Recital 25',
    description: 'EU voluntary instrument for organisations committing to evaluate, manage, and improve their environmental performance.',
    complianceNote: 'Explicitly recognised in EU 2024/825 as established by public authorities. Fully compliant.',
    website: 'https://environment.ec.europa.eu/topics/management-systems/emas_en',
    visualIndicators: ['EMAS logo', 'green circle with tree'],
  },
  {
    id: 'eu-energy-label',
    name: 'EU Energy Label',
    aliases: ['Energy Efficiency Label', 'EU Energielabel', 'Energy Rating Label'],
    status: 'certified',
    category: 'energy',
    region: 'eu',
    certifyingBody: 'European Commission (EU Regulation 2017/1369)',
    isThirdPartyVerified: true,
    isPublicAuthority: true,
    regulation: 'EU 2017/1369',
    description: 'Mandatory label showing the energy efficiency class of products (A to G scale).',
    complianceNote: 'Required by EU law. Fully compliant and mandatory for applicable products.',
    website: 'https://energy.ec.europa.eu/topics/energy-efficiency/energy-label-and-ecodesign_en',
    visualIndicators: ['A to G scale', 'colored bars', 'energy efficiency class'],
  },
  {
    id: 'eu-organic',
    name: 'EU Organic Logo',
    aliases: ['Euro Leaf', 'EU Bio', 'EU Organic', 'EU Bio-Siegel', 'European Organic'],
    status: 'certified',
    category: 'organic',
    region: 'eu',
    certifyingBody: 'European Commission (EU Regulation 2018/848)',
    isThirdPartyVerified: true,
    isPublicAuthority: true,
    regulation: 'EU 2018/848',
    description: 'Official EU organic farming logo (Euro Leaf) indicating products meet EU organic standards.',
    complianceNote: 'EU public authority label. Fully compliant.',
    website: 'https://agriculture.ec.europa.eu/farming/organic-farming_en',
    visualIndicators: ['Euro Leaf', 'green leaf made of stars', 'leaf with EU stars'],
  },
  {
    id: 'fsc',
    name: 'FSC',
    aliases: ['Forest Stewardship Council', 'FSC Certified', 'FSC Mix', 'FSC 100%', 'FSC Recycled'],
    status: 'certified',
    category: 'forestry',
    region: 'global',
    certifyingBody: 'Forest Stewardship Council (independent third-party)',
    isThirdPartyVerified: true,
    isPublicAuthority: false,
    regulation: 'EU 2024/825 Art. 2 (sustainability label definition)',
    description: 'International certification ensuring wood and paper products come from responsibly managed forests.',
    complianceNote: 'Third-party verified certification scheme meeting ECGT requirements. Compliant.',
    website: 'https://fsc.org',
    visualIndicators: ['tree checkmark', 'FSC tree logo', 'green tree with checkmark'],
  },
  {
    id: 'pefc',
    name: 'PEFC',
    aliases: ['Programme for Endorsement of Forest Certification', 'PEFC Certified', 'PEFC Logo'],
    status: 'certified',
    category: 'forestry',
    region: 'global',
    certifyingBody: 'PEFC International (independent third-party)',
    isThirdPartyVerified: true,
    isPublicAuthority: false,
    regulation: 'EU 2024/825 Art. 2',
    description: 'International forest certification framework endorsing national certification systems.',
    complianceNote: 'Third-party verified certification scheme. Compliant.',
    website: 'https://pefc.org',
    visualIndicators: ['two trees', 'circular arrow logo', 'PEFC green logo'],
  },
  {
    id: 'msc',
    name: 'MSC',
    aliases: ['Marine Stewardship Council', 'MSC Certified', 'MSC Blue Fish', 'MSC Blue Label'],
    status: 'certified',
    category: 'marine',
    region: 'global',
    certifyingBody: 'Marine Stewardship Council (independent third-party)',
    isThirdPartyVerified: true,
    isPublicAuthority: false,
    regulation: 'EU 2024/825 Art. 2',
    description: 'International label for sustainable fishing practices.',
    complianceNote: 'Third-party verified certification scheme. Compliant.',
    website: 'https://msc.org',
    visualIndicators: ['blue fish', 'MSC blue oval', 'fish in blue oval'],
  },
  {
    id: 'asc',
    name: 'ASC',
    aliases: ['Aquaculture Stewardship Council', 'ASC Certified'],
    status: 'certified',
    category: 'marine',
    region: 'global',
    certifyingBody: 'Aquaculture Stewardship Council (independent third-party)',
    isThirdPartyVerified: true,
    isPublicAuthority: false,
    regulation: 'EU 2024/825 Art. 2',
    description: 'International certification for responsible aquaculture/fish farming.',
    complianceNote: 'Third-party verified certification scheme. Compliant.',
    website: 'https://asc-aqua.org',
    visualIndicators: ['teal fish', 'ASC teal logo'],
  },
  {
    id: 'fairtrade',
    name: 'Fairtrade',
    aliases: ['Fairtrade International', 'Fairtrade Certified', 'Fairtrade Mark', 'Fair Trade'],
    status: 'certified',
    category: 'social',
    region: 'global',
    certifyingBody: 'Fairtrade International / FLOCERT (independent third-party)',
    isThirdPartyVerified: true,
    isPublicAuthority: false,
    regulation: 'EU 2024/825 Art. 2',
    description: 'International certification for fair trade and sustainable production.',
    complianceNote: 'Third-party verified. Covers social sustainability aspects. Compliant.',
    website: 'https://www.fairtrade.net',
    visualIndicators: ['person in circle', 'blue and green figure'],
  },
  {
    id: 'blauer-engel',
    name: 'Blauer Engel',
    aliases: ['Blue Angel', 'Der Blaue Engel', 'Blue Angel Ecolabel'],
    status: 'certified',
    category: 'environmental',
    region: 'national',
    certifyingBody: 'German Federal Ministry for the Environment (public authority)',
    isThirdPartyVerified: true,
    isPublicAuthority: true,
    regulation: 'EU 2024/825 Recital 25',
    description: 'German national environmental label, the world\'s oldest ecolabel (since 1978).',
    complianceNote: 'Established by a public authority. Fully compliant.',
    website: 'https://www.blauer-engel.de',
    visualIndicators: ['blue angel', 'angel in blue circle', 'person with laurel wreath'],
  },
  {
    id: 'nordic-swan',
    name: 'Nordic Swan Ecolabel',
    aliases: ['Nordic Swan', 'Svanen', 'Nordic Ecolabel', 'Svanenmärkt'],
    status: 'certified',
    category: 'environmental',
    region: 'national',
    certifyingBody: 'Nordic Council of Ministers (public authority)',
    isThirdPartyVerified: true,
    isPublicAuthority: true,
    regulation: 'EU 2024/825 Recital 25',
    description: 'Official Nordic ecolabel for the Scandinavian countries.',
    complianceNote: 'Established by public authorities (Nordic governments). Compliant.',
    website: 'https://www.nordic-swan-ecolabel.org',
    visualIndicators: ['swan', 'white swan in green circle'],
  },
  {
    id: 'gots',
    name: 'GOTS',
    aliases: ['Global Organic Textile Standard', 'GOTS Certified'],
    status: 'certified',
    category: 'organic',
    region: 'global',
    certifyingBody: 'Global Organic Textile Standard International (independent third-party)',
    isThirdPartyVerified: true,
    isPublicAuthority: false,
    regulation: 'EU 2024/825 Art. 2',
    description: 'International standard for organic textiles, covering ecological and social criteria.',
    complianceNote: 'Third-party verified certification scheme. Compliant.',
    website: 'https://global-standard.org',
    visualIndicators: ['GOTS green shirt', 'organic textile logo'],
  },
  {
    id: 'oeko-tex',
    name: 'OEKO-TEX Standard 100',
    aliases: ['OEKO-TEX', 'Oeko-Tex', 'OEKO-TEX Certified', 'OEKO-TEX Made in Green'],
    status: 'certified',
    category: 'environmental',
    region: 'global',
    certifyingBody: 'OEKO-TEX Association (independent third-party)',
    isThirdPartyVerified: true,
    isPublicAuthority: false,
    regulation: 'EU 2024/825 Art. 2',
    description: 'International testing and certification system for textiles free from harmful substances.',
    complianceNote: 'Third-party verified certification scheme. Compliant.',
    website: 'https://www.oeko-tex.com',
    visualIndicators: ['OEKO-TEX logo', 'blue and white seal'],
  },
  {
    id: 'cradle-to-cradle',
    name: 'Cradle to Cradle Certified',
    aliases: ['C2C', 'Cradle to Cradle', 'C2C Certified'],
    status: 'certified',
    category: 'environmental',
    region: 'global',
    certifyingBody: 'Cradle to Cradle Products Innovation Institute (independent third-party)',
    isThirdPartyVerified: true,
    isPublicAuthority: false,
    regulation: 'EU 2024/825 Art. 2',
    description: 'Multi-level certification for products designed with circular economy principles.',
    complianceNote: 'Third-party verified certification scheme. Compliant.',
    website: 'https://c2ccertified.org',
    visualIndicators: ['infinity symbol', 'C2C circle'],
  },
  {
    id: 'rainforest-alliance',
    name: 'Rainforest Alliance Certified',
    aliases: ['Rainforest Alliance', 'RA Certified', 'Green Frog'],
    status: 'certified',
    category: 'environmental',
    region: 'global',
    certifyingBody: 'Rainforest Alliance (independent third-party)',
    isThirdPartyVerified: true,
    isPublicAuthority: false,
    regulation: 'EU 2024/825 Art. 2',
    description: 'Certification for sustainable agriculture, forestry, and tourism.',
    complianceNote: 'Third-party verified certification scheme. Compliant.',
    website: 'https://www.rainforest-alliance.org',
    visualIndicators: ['green frog', 'frog seal', 'Rainforest Alliance frog'],
  },
  {
    id: 'breeam',
    name: 'BREEAM',
    aliases: ['Building Research Establishment Environmental Assessment Method'],
    status: 'certified',
    category: 'environmental',
    region: 'global',
    certifyingBody: 'BRE Global (independent third-party)',
    isThirdPartyVerified: true,
    isPublicAuthority: false,
    regulation: 'EU 2024/825 Art. 2',
    description: 'Assessment method for sustainable building design and construction.',
    complianceNote: 'Third-party verified certification. Compliant for building claims.',
    website: 'https://bregroup.com/products/breeam',
    visualIndicators: ['BREEAM star', 'green circle rating'],
  },
  {
    id: 'iscc',
    name: 'ISCC',
    aliases: ['International Sustainability and Carbon Certification', 'ISCC PLUS', 'ISCC EU'],
    status: 'certified',
    category: 'climate',
    region: 'global',
    certifyingBody: 'ISCC System GmbH (independent third-party)',
    isThirdPartyVerified: true,
    isPublicAuthority: false,
    regulation: 'EU 2024/825 Art. 2',
    description: 'Certification for sustainable and traceable supply chains across industries.',
    complianceNote: 'Third-party verified. EU-recognised for bioenergy (RED II). Compliant.',
    website: 'https://www.iscc-system.org',
    visualIndicators: ['ISCC logo', 'green and blue globe'],
  },
];

/**
 * Labels that are BANNED or require phase-out under EU 2024/825.
 * These are self-certified, unverified, or do not meet the certification requirements.
 */
export const bannedLabels: SustainabilityLabel[] = [
  {
    id: 'self-certified-green',
    name: 'Self-certified "Green" labels',
    aliases: ['green seal', 'eco seal', 'green badge', 'eco badge', 'green mark', 'sustainable badge'],
    status: 'banned',
    category: 'general',
    region: 'global',
    certifyingBody: 'Self-certified (company/brand created)',
    isThirdPartyVerified: false,
    isPublicAuthority: false,
    regulation: 'EU 2024/825 Art. 2(1)(m), Annex I point 4a',
    description: 'Any sustainability label created by the company itself without independent third-party verification.',
    complianceNote: 'BANNED from September 2026. Must be removed or replaced with a certified scheme label.',
    website: '',
    visualIndicators: ['leaf icon', 'green leaf', 'tree icon', 'globe icon', 'earth icon', 'recycling symbol (when not certified)', 'generic green seal', 'self-made eco badge'],
  },
  {
    id: 'self-certified-carbon-neutral',
    name: 'Self-certified "Carbon Neutral" labels',
    aliases: ['carbon neutral certified', 'CO2 neutral label', 'climate neutral badge', 'net zero badge'],
    status: 'banned',
    category: 'climate',
    region: 'global',
    certifyingBody: 'Self-certified or offset-only based',
    isThirdPartyVerified: false,
    isPublicAuthority: false,
    regulation: 'EU 2024/825 Annex I point 4a, Art. 3.1',
    description: 'Labels claiming carbon/climate neutrality based solely on offsetting or without independent verification.',
    complianceNote: 'BANNED from September 2026. Offset-based neutrality claims on products are prohibited.',
    website: '',
    visualIndicators: ['CO2 zero', 'carbon neutral stamp', 'climate neutral seal', 'net zero badge', 'carbon footprint zero'],
  },
  {
    id: 'unverified-eco-scoring',
    name: 'Unverified Environmental Scoring Labels',
    aliases: ['eco score', 'planet score', 'green score', 'sustainability score', 'environmental score'],
    status: 'banned',
    category: 'general',
    region: 'global',
    certifyingBody: 'Various (not EU-approved)',
    isThirdPartyVerified: false,
    isPublicAuthority: false,
    regulation: 'EU 2024/825 Annex I point 2a',
    description: 'Environmental impact scoring labels not established under EU rules.',
    complianceNote: 'BANNED from September 2026. Environmental scoring must be based on EU-established methodologies.',
    website: '',
    visualIndicators: ['letter grade A-E', 'traffic light score', 'color-coded score', 'numerical eco rating'],
  },
  {
    id: 'generic-sustainability-mark',
    name: 'Generic Sustainability Trust Marks',
    aliases: ['sustainable choice', 'eco choice', 'green choice', 'planet friendly', 'earth friendly'],
    status: 'banned',
    category: 'general',
    region: 'global',
    certifyingBody: 'Self-certified',
    isThirdPartyVerified: false,
    isPublicAuthority: false,
    regulation: 'EU 2024/825 Annex I point 2, Art. 2(1)(m)',
    description: 'Generic sustainability marks that imply environmental benefits without certified scheme backing.',
    complianceNote: 'BANNED from September 2026. Generic, unverified sustainability labels must be removed.',
    website: '',
    visualIndicators: ['generic leaf', 'green circle', 'tree symbol', 'earth/globe', 'generic green checkmark', 'sustainable choice ribbon'],
  },
  {
    id: 'offset-climate-label',
    name: 'Offset-based Climate Labels',
    aliases: ['climate partner', 'CO2 compensated', 'carbon offset certified', 'climate compensated'],
    status: 'banned',
    category: 'climate',
    region: 'global',
    certifyingBody: 'Various offset providers',
    isThirdPartyVerified: false,
    isPublicAuthority: false,
    regulation: 'EU 2024/825 Annex I point 4a',
    description: 'Product-level labels claiming neutral/reduced/positive climate impact based on greenhouse gas offsetting.',
    complianceNote: 'BANNED from September 2026. Product-level claims relying on offsetting are explicitly prohibited by ECGT.',
    website: '',
    visualIndicators: ['CO2 compensated stamp', 'carbon offset seal', 'climate partner logo', 'offset badge'],
  },
];

/**
 * Labels that are CONDITIONALLY compliant - they may comply if certain requirements are met.
 */
export const conditionalLabels: SustainabilityLabel[] = [
  {
    id: 'b-corp',
    name: 'B Corp Certification',
    aliases: ['Certified B Corporation', 'B Corp', 'B-Corp'],
    status: 'conditional',
    category: 'social',
    region: 'global',
    certifyingBody: 'B Lab (non-profit third-party)',
    isThirdPartyVerified: true,
    isPublicAuthority: false,
    regulation: 'EU 2024/825 Art. 2(1)(m)',
    description: 'Certification for companies meeting social and environmental performance standards.',
    complianceNote: 'CONDITIONAL: Third-party verified but covers whole business, not product-specific environmental claims. Must not be used to imply specific product environmental benefits without substantiation.',
    website: 'https://www.bcorporation.net',
    visualIndicators: ['B Corp seal', 'Certified B logo'],
  },
  {
    id: 'carbon-trust',
    name: 'Carbon Trust Standard',
    aliases: ['Carbon Trust', 'Carbon Trust Footprint', 'Carbon Trust Certification'],
    status: 'conditional',
    category: 'climate',
    region: 'global',
    certifyingBody: 'Carbon Trust (independent third-party)',
    isThirdPartyVerified: true,
    isPublicAuthority: false,
    regulation: 'EU 2024/825 Art. 2(1)(m)',
    description: 'Certification for verified carbon footprint measurement and reduction.',
    complianceNote: 'CONDITIONAL: Third-party verified, but carbon footprint labels must not imply carbon neutrality via offsetting. Claims must relate to actual reduction, not offsets.',
    website: 'https://www.carbontrust.com',
    visualIndicators: ['Carbon Trust footprint logo', 'black footprint seal'],
  },
  {
    id: 'iso-14001',
    name: 'ISO 14001',
    aliases: ['ISO 14001 Certified', 'ISO Environmental Management'],
    status: 'conditional',
    category: 'environmental',
    region: 'global',
    certifyingBody: 'ISO-accredited certification bodies (independent third-party)',
    isThirdPartyVerified: true,
    isPublicAuthority: false,
    regulation: 'EU 2024/825 Art. 2(1)(m)',
    description: 'International standard for environmental management systems.',
    complianceNote: 'CONDITIONAL: ISO 14001 certifies management systems, not product performance. Must not be used as a product-level sustainability label implying environmental benefits without additional product-specific substantiation.',
    website: 'https://www.iso.org/iso-14001-environmental-management.html',
    visualIndicators: ['ISO 14001 badge', 'ISO certification logo'],
  },
  {
    id: 'science-based-targets',
    name: 'Science Based Targets initiative',
    aliases: ['SBTi', 'Science Based Targets', 'SBTi Committed', 'SBTi Validated'],
    status: 'conditional',
    category: 'climate',
    region: 'global',
    certifyingBody: 'Science Based Targets initiative (third-party)',
    isThirdPartyVerified: true,
    isPublicAuthority: false,
    regulation: 'EU 2024/825 Art. 2(1)(m)',
    description: 'Validation of corporate emissions reduction targets aligned with climate science.',
    complianceNote: 'CONDITIONAL: Validates corporate targets, not product claims. Using SBTi logo on products could be misleading if it implies the product itself is climate-neutral.',
    website: 'https://sciencebasedtargets.org',
    visualIndicators: ['SBTi logo', 'target symbol'],
  },
];

/**
 * All labels combined for searching
 */
export const allLabels: SustainabilityLabel[] = [
  ...certifiedLabels,
  ...bannedLabels,
  ...conditionalLabels,
];

/**
 * Common visual patterns in logos that may indicate self-certified green claims.
 * Used for heuristic analysis of uploaded logo images (via filename/metadata).
 */
export const suspiciousVisualPatterns = [
  { pattern: 'leaf', description: 'Leaf icon commonly used in self-certified green labels' },
  { pattern: 'tree', description: 'Tree icon commonly used in self-certified eco labels' },
  { pattern: 'globe', description: 'Globe/earth icon commonly used in unverified environmental labels' },
  { pattern: 'recycle', description: 'Recycling symbol used without certified scheme backing' },
  { pattern: 'green', description: 'Green coloring used to imply environmental benefits' },
  { pattern: 'eco', description: 'Eco prefix commonly used in unverified labels' },
  { pattern: 'planet', description: 'Planet imagery used in unverified sustainability labels' },
  { pattern: 'carbon', description: 'Carbon/CO2 imagery used in offset-based labels' },
  { pattern: 'neutral', description: 'Neutrality claims commonly found in banned offset labels' },
  { pattern: 'zero', description: 'Zero-emission/zero-carbon imagery in banned labels' },
  { pattern: 'sustainable', description: 'Generic sustainability text without certification' },
  { pattern: 'natural', description: 'Natural claims without substantiation' },
  { pattern: 'organic', description: 'Organic claims without official EU organic certification' },
  { pattern: 'bio', description: 'Bio claims without certified organic backing' },
];

// Helper functions
export function getLabelById(id: string): SustainabilityLabel | undefined {
  return allLabels.find(label => label.id === id);
}

export function getLabelsByStatus(status: LabelStatus): SustainabilityLabel[] {
  return allLabels.filter(label => label.status === status);
}

export function getLabelsByCategory(category: SustainabilityLabel['category']): SustainabilityLabel[] {
  return allLabels.filter(label => label.category === category);
}

export function searchLabels(query: string): SustainabilityLabel[] {
  const q = query.toLowerCase();
  return allLabels.filter(label =>
    label.name.toLowerCase().includes(q) ||
    label.aliases.some(alias => alias.toLowerCase().includes(q)) ||
    label.id.toLowerCase().includes(q)
  );
}
