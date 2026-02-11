/**
 * Test texts for scanning functionality
 * These texts are designed to produce different risk scores when scanned
 */

export const testTexts = {
  /**
   * HIGH RISK (score >70)
   * Contains multiple critical terms: klimaneutral, 100% umweltfreundlich, 
   * vollständig nachhaltig, CO2-frei, biologisch abbaubar
   */
  highRisk: `Unser klimaneutrales Produkt ist 100% umweltfreundlich und vollständig nachhaltig hergestellt. Die CO2-freie Produktion erfolgt mit grüner Energie. Unsere Verpackung ist biologisch abbaubar.`,

  /**
   * MEDIUM RISK (score 40-60)
   * Contains warning terms: nachhaltig, umweltfreundlich, ökologisch
   * No critical absolute claims
   */
  mediumRisk: `Wir setzen auf nachhaltige Praktiken und verwenden umweltfreundliche Materialien. Unser Produkt trägt zur Reduzierung des ökologischen Fußabdrucks bei.`,

  /**
   * LOW RISK (score <30)
   * Contains specific, verifiable claims with certifications
   * No banned terms, uses acceptable language
   */
  lowRisk: `Hergestellt mit 80% recycelten Materialien (GRS-zertifiziert). Produktion in Solarenergie-Fabrik (40% Energiebedarf). Energieeffizienzklasse A+++`,
} as const;

/**
 * Get all test texts as an array
 */
export function getAllTestTexts(): string[] {
  return Object.values(testTexts);
}

/**
 * Get test text by risk level
 */
export function getTestText(level: 'highRisk' | 'mediumRisk' | 'lowRisk'): string {
  return testTexts[level];
}

/**
 * Test text with English critical terms (for testing English scanning)
 */
export const testTextEnglishHighRisk = `Our carbon neutral product is 100% eco-friendly and fully sustainable. The zero emissions production uses green energy. Our packaging is completely biodegradable.`;

/**
 * Test text with mixed German/English terms
 */
export const testTextMixed = `Unser klimaneutral product is 100% umweltfreundlich. Made with sustainable materials and completely carbon neutral.`;
