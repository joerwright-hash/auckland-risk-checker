/**
 * Logo and Sustainability Label Compliance Analysis Engine
 *
 * Analyses uploaded logos/images for compliance with EU Directive 2024/825 (ECGT).
 * Uses a combination of:
 * 1. Filename/metadata heuristics
 * 2. Text-in-image detection patterns
 * 3. Known label database matching
 * 4. Visual pattern risk assessment
 *
 * From September 2026, sustainability labels displayed on consumer products must be:
 * - Based on a certified third-party verification scheme, OR
 * - Established by a public authority
 * Self-made/self-certified labels are explicitly banned.
 */

import {
  SustainabilityLabel,
  LabelStatus,
  allLabels,
  certifiedLabels,
  bannedLabels,
  conditionalLabels,
  suspiciousVisualPatterns,
  searchLabels,
} from './data/sustainability-labels';

export type LogoSeverity = 'compliant' | 'critical' | 'warning' | 'conditional' | 'unknown';

export interface LogoFinding {
  id: string;
  severity: LogoSeverity;
  matchedLabel: SustainabilityLabel | null;
  matchSource: 'filename' | 'text_content' | 'manual_selection' | 'visual_pattern';
  matchConfidence: 'high' | 'medium' | 'low';
  matchedText: string;
  description: string;
  regulation: string;
  recommendation: string;
  alternatives: string[];
}

export interface LogoAnalysisResults {
  timestamp: Date;
  fileName: string;
  fileSize: number;
  riskScore: number; // 0-100
  overallStatus: LogoSeverity;
  findings: LogoFinding[];
  summary: {
    totalFindings: number;
    compliantCount: number;
    criticalCount: number;
    warningCount: number;
    conditionalCount: number;
    unknownCount: number;
  };
  regulatoryContext: string;
}

/**
 * Analyses a logo/image file for EU green claims compliance.
 * Performs analysis based on filename, any extracted text, and manual label selection.
 */
export function analyseLogo(
  fileName: string,
  fileSize: number,
  extractedText?: string,
  manualLabelName?: string,
): LogoAnalysisResults {
  const findings: LogoFinding[] = [];

  // 1. Analyse filename for known labels
  const filenameFindings = analyseFilename(fileName);
  findings.push(...filenameFindings);

  // 2. Analyse extracted text (OCR or embedded text) if available
  if (extractedText && extractedText.trim()) {
    const textFindings = analyseExtractedText(extractedText);
    findings.push(...textFindings);
  }

  // 3. Analyse manual label selection if provided
  if (manualLabelName && manualLabelName.trim()) {
    const manualFindings = analyseManualSelection(manualLabelName);
    findings.push(...manualFindings);
  }

  // 4. If no findings yet, check for suspicious visual patterns in filename
  if (findings.length === 0) {
    const patternFindings = analyseVisualPatterns(fileName);
    findings.push(...patternFindings);
  }

  // 5. If still no findings, mark as unknown
  if (findings.length === 0) {
    findings.push({
      id: 'unknown-label',
      severity: 'unknown',
      matchedLabel: null,
      matchSource: 'filename',
      matchConfidence: 'low',
      matchedText: fileName,
      description: 'Unable to identify the sustainability label from the provided image. Manual identification recommended.',
      regulation: 'EU 2024/825 Art. 2(1)(m)',
      recommendation: 'Please manually identify this label by selecting from the known labels list, or confirm it is based on a certified third-party scheme or public authority.',
      alternatives: [
        'Use the manual label selector to identify this label',
        'Verify with the label issuer that it meets EU 2024/825 requirements',
        'Replace with an EU-recognised certified label (e.g., EU Ecolabel, FSC, PEFC)',
      ],
    });
  }

  // Deduplicate findings
  const deduped = deduplicateFindings(findings);

  // Calculate risk score
  const riskScore = calculateLogoRiskScore(deduped);

  // Determine overall status
  const overallStatus = determineOverallStatus(deduped);

  // Generate summary
  const summary = {
    totalFindings: deduped.length,
    compliantCount: deduped.filter(f => f.severity === 'compliant').length,
    criticalCount: deduped.filter(f => f.severity === 'critical').length,
    warningCount: deduped.filter(f => f.severity === 'warning').length,
    conditionalCount: deduped.filter(f => f.severity === 'conditional').length,
    unknownCount: deduped.filter(f => f.severity === 'unknown').length,
  };

  return {
    timestamp: new Date(),
    fileName,
    fileSize,
    riskScore,
    overallStatus,
    findings: deduped,
    summary,
    regulatoryContext: 'Analysis based on EU Directive 2024/825 (Empowering Consumers for the Green Transition), effective September 27, 2026. Sustainability labels must be based on certified third-party verification schemes or established by public authorities.',
  };
}

/**
 * Analyse filename for matches against known sustainability labels
 */
function analyseFilename(fileName: string): LogoFinding[] {
  const findings: LogoFinding[] = [];
  const normalised = fileName.toLowerCase().replace(/[-_./\\]/g, ' ');

  for (const label of allLabels) {
    const nameMatch = label.name.toLowerCase();
    const aliasMatch = label.aliases.find(alias =>
      normalised.includes(alias.toLowerCase().replace(/[-_]/g, ' '))
    );
    const idMatch = normalised.includes(label.id.replace(/-/g, ' '));

    if (normalised.includes(nameMatch) || aliasMatch || idMatch) {
      findings.push(createFindingFromLabel(label, aliasMatch || label.name, 'filename', 'high'));
    }
  }

  return findings;
}

/**
 * Analyse text extracted from image (OCR or embedded text)
 */
function analyseExtractedText(text: string): LogoFinding[] {
  const findings: LogoFinding[] = [];
  const normalised = text.toLowerCase();

  for (const label of allLabels) {
    const nameMatch = normalised.includes(label.name.toLowerCase());
    const aliasMatch = label.aliases.find(alias =>
      normalised.includes(alias.toLowerCase())
    );

    if (nameMatch || aliasMatch) {
      findings.push(createFindingFromLabel(label, aliasMatch || label.name, 'text_content', 'high'));
    }
  }

  // Check for generic green claim text patterns
  const genericPatterns = [
    { regex: /carbon\s*neutral/gi, desc: 'Carbon neutrality claim detected' },
    { regex: /climate\s*neutral/gi, desc: 'Climate neutrality claim detected' },
    { regex: /co2\s*neutral/gi, desc: 'CO2 neutrality claim detected' },
    { regex: /net\s*zero/gi, desc: 'Net zero claim detected' },
    { regex: /100\s*%?\s*(green|eco|sustainable|renewable)/gi, desc: 'Absolute environmental claim detected' },
    { regex: /eco\s*-?\s*friendly/gi, desc: 'Eco-friendly claim detected in label' },
    { regex: /planet\s*friendly/gi, desc: 'Planet-friendly claim detected' },
    { regex: /environmentally\s*friendly/gi, desc: 'Environmental friendliness claim detected' },
    { regex: /klimaneutral/gi, desc: 'Klimaneutral claim detected' },
    { regex: /umweltfreundlich/gi, desc: 'Umweltfreundlich claim detected' },
    { regex: /nachhaltig/gi, desc: 'Generic sustainability claim detected' },
    { regex: /zero\s*emissions?/gi, desc: 'Zero emissions claim detected' },
    { regex: /emission\s*free/gi, desc: 'Emission-free claim detected' },
  ];

  for (const pattern of genericPatterns) {
    const match = normalised.match(pattern.regex);
    if (match) {
      // Only add if not already covered by a known label match
      const alreadyCovered = findings.some(f => f.matchedLabel !== null);
      if (!alreadyCovered) {
        findings.push({
          id: `text-pattern-${match[0].replace(/\s/g, '-')}`,
          severity: 'critical',
          matchedLabel: null,
          matchSource: 'text_content',
          matchConfidence: 'high',
          matchedText: match[0],
          description: `${pattern.desc} in label text. Under EU 2024/825, this type of claim on a label requires third-party certification.`,
          regulation: 'EU 2024/825 Art. 2(1)(m), Annex I point 2',
          recommendation: 'Remove this label or replace with a certified scheme label that substantiates the specific claim.',
          alternatives: [
            'Replace with EU Ecolabel if environmental performance is verified',
            'Use certified scheme labels (FSC, PEFC, GOTS, etc.) relevant to your product',
            'Remove generic claim and use specific, substantiated statements instead',
          ],
        });
      }
    }
  }

  return findings;
}

/**
 * Analyse a manually selected/entered label name
 */
function analyseManualSelection(labelName: string): LogoFinding[] {
  const findings: LogoFinding[] = [];

  // Search in database
  const matches = searchLabels(labelName);

  if (matches.length > 0) {
    // Use the best match (first result)
    const bestMatch = matches[0];
    findings.push(createFindingFromLabel(bestMatch, labelName, 'manual_selection', 'high'));
  } else {
    // No match found - likely self-certified
    findings.push({
      id: 'manual-unrecognised',
      severity: 'warning',
      matchedLabel: null,
      matchSource: 'manual_selection',
      matchConfidence: 'medium',
      matchedText: labelName,
      description: `The label "${labelName}" was not found in the database of recognised certification schemes. It may be a self-certified label.`,
      regulation: 'EU 2024/825 Art. 2(1)(m), Annex I point 4a',
      recommendation: 'Verify that this label is based on a certified third-party scheme. If self-created, it must be removed by September 2026.',
      alternatives: [
        'Verify with the label issuer that third-party certification exists',
        'Replace with an EU-recognised certified label',
        'Apply for certification under an established scheme',
      ],
    });
  }

  return findings;
}

/**
 * Check filename for suspicious visual patterns associated with self-certified labels
 */
function analyseVisualPatterns(fileName: string): LogoFinding[] {
  const findings: LogoFinding[] = [];
  const normalised = fileName.toLowerCase().replace(/[-_./\\]/g, ' ');

  const matchedPatterns = suspiciousVisualPatterns.filter(p =>
    normalised.includes(p.pattern)
  );

  if (matchedPatterns.length > 0) {
    findings.push({
      id: 'visual-pattern-match',
      severity: 'warning',
      matchedLabel: null,
      matchSource: 'visual_pattern',
      matchConfidence: 'low',
      matchedText: matchedPatterns.map(p => p.pattern).join(', '),
      description: `Filename contains patterns commonly associated with self-certified environmental labels: ${matchedPatterns.map(p => p.description).join('; ')}. Manual verification recommended.`,
      regulation: 'EU 2024/825 Art. 2(1)(m)',
      recommendation: 'Manually identify this label to determine compliance. If self-certified, it must be removed or replaced with a certified scheme label.',
      alternatives: [
        'Use the manual label selector to identify this specific label',
        'Replace with a recognised certified label (EU Ecolabel, FSC, etc.)',
        'Remove the label if it cannot be verified as part of a certified scheme',
      ],
    });
  }

  return findings;
}

/**
 * Create a finding from a matched sustainability label
 */
function createFindingFromLabel(
  label: SustainabilityLabel,
  matchedText: string,
  source: LogoFinding['matchSource'],
  confidence: LogoFinding['matchConfidence'],
): LogoFinding {
  let severity: LogoSeverity;
  let recommendation: string;
  let alternatives: string[];

  switch (label.status) {
    case 'certified':
      severity = 'compliant';
      recommendation = `This label (${label.name}) is recognised as a certified scheme. It is compliant with EU 2024/825.`;
      alternatives = [
        'Continue using this certified label',
        'Ensure the certification is current and valid',
        'Display the label according to the scheme\'s usage guidelines',
      ];
      break;
    case 'banned':
      severity = 'critical';
      recommendation = `This label type is BANNED under EU 2024/825 from September 2026. ${label.complianceNote}`;
      alternatives = [
        'Remove this label from all consumer-facing materials',
        'Replace with an EU-recognised certified label (e.g., EU Ecolabel)',
        'Apply for third-party certification under a recognised scheme',
        'Use specific, substantiated claims instead of generic labels',
      ];
      break;
    case 'conditional':
      severity = 'conditional';
      recommendation = `This label (${label.name}) may be compliant depending on usage context. ${label.complianceNote}`;
      alternatives = [
        'Ensure the label is not used to imply product-specific environmental benefits without substantiation',
        'Supplement with product-specific certified labels where possible',
        'Consult legal counsel on specific usage context',
      ];
      break;
    default:
      severity = 'unknown';
      recommendation = 'Unable to determine compliance status. Manual verification recommended.';
      alternatives = [
        'Verify with the label issuer',
        'Consult legal counsel',
      ];
  }

  return {
    id: label.id,
    severity,
    matchedLabel: label,
    matchSource: source,
    matchConfidence: confidence,
    matchedText,
    description: `${label.name}: ${label.description}`,
    regulation: label.regulation,
    recommendation,
    alternatives,
  };
}

/**
 * Deduplicate findings by ID, keeping the highest confidence match
 */
function deduplicateFindings(findings: LogoFinding[]): LogoFinding[] {
  const seen = new Map<string, LogoFinding>();
  const confidenceOrder: Record<string, number> = { high: 3, medium: 2, low: 1 };

  for (const finding of findings) {
    const existing = seen.get(finding.id);
    if (!existing || confidenceOrder[finding.matchConfidence] > confidenceOrder[existing.matchConfidence]) {
      seen.set(finding.id, finding);
    }
  }

  return Array.from(seen.values());
}

/**
 * Calculate risk score for logo analysis (0-100)
 */
function calculateLogoRiskScore(findings: LogoFinding[]): number {
  if (findings.length === 0) return 0;

  const weights = {
    compliant: 0,
    critical: 40,
    warning: 20,
    conditional: 10,
    unknown: 15,
  };

  let score = 0;
  for (const finding of findings) {
    score += weights[finding.severity];
  }

  return Math.min(100, Math.max(0, score));
}

/**
 * Determine overall compliance status from findings
 */
function determineOverallStatus(findings: LogoFinding[]): LogoSeverity {
  if (findings.some(f => f.severity === 'critical')) return 'critical';
  if (findings.some(f => f.severity === 'warning')) return 'warning';
  if (findings.some(f => f.severity === 'conditional')) return 'conditional';
  if (findings.some(f => f.severity === 'unknown')) return 'unknown';
  return 'compliant';
}

/**
 * Get all certified labels for the manual selection dropdown
 */
export function getCertifiedLabelOptions(): Array<{ id: string; name: string; category: string }> {
  return certifiedLabels.map(label => ({
    id: label.id,
    name: label.name,
    category: label.category,
  }));
}

/**
 * Get all labels organised by status for display
 */
export function getLabelsByStatusGroup(): Record<LabelStatus, SustainabilityLabel[]> {
  return {
    certified: certifiedLabels,
    banned: bannedLabels,
    conditional: conditionalLabels,
    unknown: [],
  };
}
