import { bannedTerms, BannedTerm } from './data/banned-terms';

export interface ScanMatch {
  term: BannedTerm;
  matchText: string;
  position: number;
  lineNumber: number;
  context: string; // 50 chars before/after
}

export interface ScanResults {
  inputText: string;
  timestamp: Date;
  riskScore: number; // 0-100
  findings: {
    critical: ScanMatch[];
    warnings: ScanMatch[];
    minor: ScanMatch[];
  };
  summary: {
    totalFindings: number;
    uniqueTerms: number;
    estimatedPenalty: string;
  };
}

interface FindingsBySeverity {
  critical: ScanMatch[];
  warnings: ScanMatch[];
  minor: ScanMatch[];
}

const SEVERITY_WEIGHTS = {
  critical: 30,
  warnings: 10,
  minor: 3,
} as const;

/**
 * Scans input text for banned terms according to EU regulation 2024/825
 * @param inputText - The text to scan
 * @returns ScanResults with findings grouped by severity
 * @throws Error if input text is invalid
 */
function scanTextInternal(inputText: string): ScanResults {
  // Input validation
  if (typeof inputText !== 'string') {
    throw new Error('Input text must be a string');
  }

  if (inputText.length === 0) {
    return createEmptyResults(inputText);
  }

  // 1. Initialize results
  const findings: FindingsBySeverity = {
    critical: [],
    warnings: [],
    minor: [],
  };

  try {
    // 2. Scan for each banned term
    bannedTerms.forEach((term) => {
      try {
        const regex = term.regex;
        
        // Use matchAll for better performance and to get all matches
        const matches = Array.from(inputText.matchAll(regex));
        
        matches.forEach((match) => {
          if (match.index === undefined) {
            return; // Skip if index is undefined (shouldn't happen with matchAll)
          }

          // Get line number
          const textBeforeMatch = inputText.substring(0, match.index);
          const lineNumber = textBeforeMatch.split('\n').length;

          // Get context (50 chars before/after)
          const start = Math.max(0, match.index - 50);
          const end = Math.min(
            inputText.length,
            match.index + match[0].length + 50
          );
          let context = inputText.substring(start, end);
          
          // Add ellipsis if context is truncated
          if (start > 0) context = '...' + context;
          if (end < inputText.length) context = context + '...';

          // Create match object
          const scanMatch: ScanMatch = {
            term: term,
            matchText: match[0],
            position: match.index,
            lineNumber: lineNumber,
            context: context,
          };

          // Add to appropriate severity category
          // Map 'warning' to 'warnings' for consistency
          const severityKey = term.severity === 'warning' ? 'warnings' : term.severity;
          if (severityKey in findings) {
            findings[severityKey as keyof FindingsBySeverity].push(scanMatch);
          }
        });
      } catch (error) {
        // Log error for individual term but continue scanning
        console.warn(`Error scanning for term "${term.term}":`, error);
      }
    });

    // 3. Calculate risk score
    const riskScore = calculateRiskScore(findings);

    // 4. Generate summary
    const totalFindings =
      findings.critical.length +
      findings.warnings.length +
      findings.minor.length;

    const uniqueTerms = new Set([
      ...findings.critical.map((f) => f.term.term),
      ...findings.warnings.map((f) => f.term.term),
      ...findings.minor.map((f) => f.term.term),
    ]).size;

    return {
      inputText,
      timestamp: new Date(),
      riskScore,
      findings,
      summary: {
        totalFindings,
        uniqueTerms,
        estimatedPenalty: estimatePenalty(findings.critical.length),
      },
    };
  } catch (error) {
    // Fallback: return empty results with error info
    console.error('Error during text scanning:', error);
    return createEmptyResults(inputText);
  }
}

/**
 * Creates empty scan results for edge cases
 */
function createEmptyResults(inputText: string): ScanResults {
  return {
    inputText,
    timestamp: new Date(),
    riskScore: 0,
    findings: {
      critical: [],
      warnings: [],
      minor: [],
    },
    summary: {
      totalFindings: 0,
      uniqueTerms: 0,
      estimatedPenalty: 'Kein Risiko',
    },
  };
}

/**
 * Calculates risk score based on findings
 * @param findings - Findings grouped by severity
 * @returns Risk score from 0-100
 */
function calculateRiskScore(findings: FindingsBySeverity): number {
  const score =
    findings.critical.length * SEVERITY_WEIGHTS.critical +
    findings.warnings.length * SEVERITY_WEIGHTS.warnings +
    findings.minor.length * SEVERITY_WEIGHTS.minor;

  return Math.min(100, Math.max(0, score));
}

/**
 * Estimates penalty range based on critical findings count
 * @param criticalCount - Number of critical findings
 * @returns Estimated penalty range string
 */
function estimatePenalty(criticalCount: number): string {
  if (criticalCount === 0) return 'Kein Risiko';
  if (criticalCount <= 2) return '€10.000 - €50.000';
  if (criticalCount <= 5) return '€50.000 - €100.000';
  return '€100.000+';
}

/**
 * Highlights matches in text with HTML mark tags
 * @param text - Original text
 * @param matches - Array of scan matches to highlight
 * @returns HTML string with highlighted matches
 */
export function highlightMatches(
  text: string,
  matches: ScanMatch[]
): string {
  if (!text || matches.length === 0) {
    return text;
  }

  try {
    // Sort matches by position (descending) to avoid offset issues when replacing
    const sortedMatches = [...matches].sort((a, b) => b.position - a.position);

    let result = text;

    sortedMatches.forEach((match) => {
      const severityClass = `risk-${match.term.severity}`;
      const highlighted = `<mark class="${severityClass}">${escapeHtml(match.matchText)}</mark>`;
      
      // Replace the match text with highlighted version
      const before = result.substring(0, match.position);
      const after = result.substring(match.position + match.matchText.length);
      result = before + highlighted + after;
    });

    return result;
  } catch (error) {
    console.error('Error highlighting matches:', error);
    return text; // Return original text on error
  }
}

/**
 * Escapes HTML special characters
 * @param text - Text to escape
 * @returns Escaped HTML string
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * Legacy interface for backward compatibility
 * Converts new ScanResults to old ScanResponse format
 */
export interface ScanResponse {
  score: number;
  findings: ScanResult[];
  timestamp: Date;
  totalMatches: number;
  criticalCount: number;
  warningCount: number;
  minorCount: number;
}

export interface ScanResult {
  term: string;
  matches: Match[];
  severity: 'critical' | 'warning' | 'minor';
  regulation: string;
  penaltyRange: string;
  description: string;
  alternatives: string[];
}

export interface Match {
  index: number;
  length: number;
  line: number;
  context: string;
}

/**
 * Scans text and returns results in new format (grouped by severity)
 * @param inputText - The text to scan
 * @returns ScanResults with findings grouped by severity
 */
export function scanTextNew(inputText: string): ScanResults {
  return scanTextInternal(inputText);
}

/**
 * Legacy scanText function for backward compatibility
 * Returns ScanResponse format (old interface)
 * This is the default export to maintain backward compatibility
 * @param inputText - The text to scan
 * @returns ScanResponse in legacy format
 */
export function scanText(inputText: string): ScanResponse {
  const results = scanTextInternal(inputText);
  return convertToLegacyFormat(results);
}

/**
 * Converts new ScanResults format to legacy ScanResponse format
 * @param results - New format scan results
 * @returns Legacy format scan response
 */
function convertToLegacyFormat(results: ScanResults): ScanResponse {
  const allFindings: ScanResult[] = [];

  // Convert critical findings
  results.findings.critical.forEach((match) => {
    const existing = allFindings.find((f) => f.term === match.term.term);
    if (existing) {
      existing.matches.push({
        index: match.position,
        length: match.matchText.length,
        line: match.lineNumber,
        context: match.context,
      });
    } else {
      allFindings.push({
        term: match.term.term,
        matches: [
          {
            index: match.position,
            length: match.matchText.length,
            line: match.lineNumber,
            context: match.context,
          },
        ],
        severity: match.term.severity,
        regulation: match.term.regulation,
        penaltyRange: match.term.penaltyRange,
        description: match.term.description,
        alternatives: match.term.alternatives,
      });
    }
  });

  // Convert warning findings
  results.findings.warnings.forEach((match) => {
    const existing = allFindings.find((f) => f.term === match.term.term);
    if (existing) {
      existing.matches.push({
        index: match.position,
        length: match.matchText.length,
        line: match.lineNumber,
        context: match.context,
      });
    } else {
      allFindings.push({
        term: match.term.term,
        matches: [
          {
            index: match.position,
            length: match.matchText.length,
            line: match.lineNumber,
            context: match.context,
          },
        ],
        severity: match.term.severity,
        regulation: match.term.regulation,
        penaltyRange: match.term.penaltyRange,
        description: match.term.description,
        alternatives: match.term.alternatives,
      });
    }
  });

  // Convert minor findings
  results.findings.minor.forEach((match) => {
    const existing = allFindings.find((f) => f.term === match.term.term);
    if (existing) {
      existing.matches.push({
        index: match.position,
        length: match.matchText.length,
        line: match.lineNumber,
        context: match.context,
      });
    } else {
      allFindings.push({
        term: match.term.term,
        matches: [
          {
            index: match.position,
            length: match.matchText.length,
            line: match.lineNumber,
            context: match.context,
          },
        ],
        severity: match.term.severity,
        regulation: match.term.regulation,
        penaltyRange: match.term.penaltyRange,
        description: match.term.description,
        alternatives: match.term.alternatives,
      });
    }
  });

  return {
    score: results.riskScore,
    findings: allFindings,
    timestamp: results.timestamp,
    totalMatches: results.summary.totalFindings,
    criticalCount: results.findings.critical.length,
    warningCount: results.findings.warnings.length,
    minorCount: results.findings.minor.length,
  };
}
