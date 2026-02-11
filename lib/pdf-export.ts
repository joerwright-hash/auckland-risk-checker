import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { ScanResults } from "./scanner-logic";

// Color definitions matching the app theme
const COLORS = {
  primary: [74, 107, 90] as [number, number, number], // #4A6B5A
  danger: [200, 90, 79] as [number, number, number], // #C85A4F
  accent: [184, 134, 91] as [number, number, number], // #B8865B
  success: [90, 124, 107] as [number, number, number], // #5A7C6B
  gray: [107, 114, 128] as [number, number, number], // #6B7280
  lightGray: [243, 244, 246] as [number, number, number], // #F3F4F6
};

/**
 * Generates a professional PDF report from scan results
 * @param results - Scan results to include in the report
 * @param companyName - Optional company name for header
 */
export function exportToPDF(results: ScanResults, companyName?: string): void {
  if (typeof window === "undefined") {
    console.error("PDF export can only be called from the browser");
    return;
  }

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let yPos = margin;

  /**
   * Helper function to check if content will fit on current page
   * Automatically adds a new page if content would overflow
   * @param requiredHeight - Minimum height needed for the next content block
   * @returns true if a new page was added, false otherwise
   */
  const checkPageBreak = (requiredHeight: number) => {
    // Check if adding content would exceed page boundaries (accounting for bottom margin)
    if (yPos + requiredHeight > pageHeight - margin) {
      doc.addPage(); // Create new page
      yPos = margin; // Reset vertical position to top margin
      return true;
    }
    return false;
  };

  // ========== HEADER ==========
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, pageWidth, 50, "F");

  // Logo/Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("Green Claim Check", margin, 25);

  // Subtitle
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("EU Compliance Report", margin, 35);

  // Timestamp (right aligned)
  const timestamp = results.timestamp.toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  doc.text(`Generated: ${timestamp}`, pageWidth - margin, 35, {
    align: "right",
  });

  yPos = 60;

  // ========== RISK SCORE ==========
  checkPageBreak(40);
  
  /**
   * Determine risk score color based on score thresholds:
   * - 81-100: Critical (red/danger)
   * - 61-80: High (orange)
   * - 31-60: Medium (amber/accent)
   * - 0-30: Low (green/success)
   */
  const scoreColor: [number, number, number] = 
    results.riskScore >= 81 ? COLORS.danger :
    results.riskScore >= 61 ? [255, 165, 0] : // Orange for high risk
    results.riskScore >= 31 ? COLORS.accent :
    COLORS.success;

  doc.setFillColor(...scoreColor);
  doc.circle(pageWidth / 2, yPos + 20, 25, "F");

  // Risk Score Text
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(32);
  doc.setFont("helvetica", "bold");
  doc.text(`${results.riskScore}`, pageWidth / 2, yPos + 25, { align: "center" });

  doc.setFontSize(12);
  doc.text("/100", pageWidth / 2, yPos + 32, { align: "center" });

  // Risk Level Label
  const riskLevel = 
    results.riskScore >= 81 ? "Critical Risk" :
    results.riskScore >= 61 ? "High Risk" :
    results.riskScore >= 31 ? "Medium Risk" :
    "Low Risk";

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(riskLevel, pageWidth / 2, yPos + 40, { align: "center" });

  yPos += 55;

  // ========== SUMMARY STATISTICS ==========
  checkPageBreak(50);

  doc.setTextColor(...COLORS.gray);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Summary", margin, yPos);

  yPos += 8;

  /**
   * Calculate summary box dimensions:
   * - 3 boxes side by side with 10px spacing between them
   * - Total available width = page width minus left/right margins minus spacing
   */
  const boxWidth = (pageWidth - 2 * margin - 20) / 3; // 20px = 2 * 10px spacing
  const boxHeight = 30;

  // Total Findings
  doc.setFillColor(...COLORS.lightGray);
  doc.rect(margin, yPos, boxWidth, boxHeight, "F");
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Total Findings", margin + boxWidth / 2, yPos + 8, { align: "center" });
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(`${results.summary.totalFindings}`, margin + boxWidth / 2, yPos + 20, { align: "center" });

  // Unique Terms
  doc.setFillColor(...COLORS.lightGray);
  doc.rect(margin + boxWidth + 10, yPos, boxWidth, boxHeight, "F");
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Unique Terms", margin + boxWidth + 10 + boxWidth / 2, yPos + 8, { align: "center" });
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(`${results.summary.uniqueTerms}`, margin + boxWidth + 10 + boxWidth / 2, yPos + 20, { align: "center" });

  // Estimated Penalty
  doc.setFillColor(...COLORS.danger);
  doc.rect(margin + 2 * (boxWidth + 10), yPos, boxWidth, boxHeight, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Est. Penalty", margin + 2 * (boxWidth + 10) + boxWidth / 2, yPos + 8, { align: "center" });
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(results.summary.estimatedPenalty, margin + 2 * (boxWidth + 10) + boxWidth / 2, yPos + 20, { align: "center" });

  yPos += boxHeight + 15;

  // ========== FINDINGS BY SEVERITY ==========
  
  // Critical Findings
  if (results.findings.critical.length > 0) {
    checkPageBreak(30);
    doc.setTextColor(...COLORS.danger);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(`Critical Findings (${results.findings.critical.length})`, margin, yPos);
    yPos += 10;

    const criticalData = results.findings.critical.map((finding, idx) => [
      idx + 1,
      finding.term.term,
      finding.lineNumber.toString(),
      finding.term.regulation,
      finding.term.description.substring(0, 60) + (finding.term.description.length > 60 ? "..." : ""),
    ]);

    /**
     * Generate table using jspdf-autotable plugin
     * Automatically handles pagination, column sizing, and styling
     */
    autoTable(doc, {
      startY: yPos, // Start table at current vertical position
      head: [["#", "Term", "Line", "Regulation", "Description"]], // Table headers
      body: criticalData, // Table rows (array of arrays)
      headStyles: {
        fillColor: COLORS.danger, // Red background for critical findings header
        textColor: [255, 255, 255], // White text
        fontStyle: "bold",
      },
      bodyStyles: {
        textColor: [0, 0, 0], // Black text for body
      },
      alternateRowStyles: {
        fillColor: [255, 245, 245], // Light red tint for alternating rows
      },
      margin: { left: margin, right: margin }, // Match page margins
      styles: { fontSize: 8 }, // Small font to fit more data
    });

    // Update vertical position to after the table (with 10px spacing)
    // finalY is set by autoTable after rendering
    yPos = (doc as any).lastAutoTable.finalY + 10;
  }

  // Warning Findings
  if (results.findings.warnings.length > 0) {
    checkPageBreak(30);
    doc.setTextColor(...COLORS.accent);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(`Warnings (${results.findings.warnings.length})`, margin, yPos);
    yPos += 10;

    const warningData = results.findings.warnings.map((finding, idx) => [
      idx + 1,
      finding.term.term,
      finding.lineNumber.toString(),
      finding.term.regulation,
      finding.term.description.substring(0, 60) + (finding.term.description.length > 60 ? "..." : ""),
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [["#", "Term", "Line", "Regulation", "Description"]],
      body: warningData,
      headStyles: {
        fillColor: COLORS.accent,
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      bodyStyles: {
        textColor: [0, 0, 0],
      },
      alternateRowStyles: {
        fillColor: [255, 250, 240],
      },
      margin: { left: margin, right: margin },
      styles: { fontSize: 8 },
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;
  }

  // Minor Findings
  if (results.findings.minor.length > 0) {
    checkPageBreak(30);
    doc.setTextColor(...COLORS.success);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(`Minor Issues (${results.findings.minor.length})`, margin, yPos);
    yPos += 10;

    const minorData = results.findings.minor.map((finding, idx) => [
      idx + 1,
      finding.term.term,
      finding.lineNumber.toString(),
      finding.term.regulation,
      finding.term.description.substring(0, 60) + (finding.term.description.length > 60 ? "..." : ""),
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [["#", "Term", "Line", "Regulation", "Description"]],
      body: minorData,
      headStyles: {
        fillColor: COLORS.success,
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      bodyStyles: {
        textColor: [0, 0, 0],
      },
      alternateRowStyles: {
        fillColor: [240, 253, 244],
      },
      margin: { left: margin, right: margin },
      styles: { fontSize: 8 },
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;
  }

  // ========== DETAILED FINDINGS ==========
  // Add detailed findings with recommendations on new pages if needed
  const allFindings = [
    ...results.findings.critical.map(f => ({ ...f, severity: "critical" as const })),
    ...results.findings.warnings.map(f => ({ ...f, severity: "warning" as const })),
    ...results.findings.minor.map(f => ({ ...f, severity: "minor" as const })),
  ];

  if (allFindings.length > 0) {
    checkPageBreak(40);
    doc.setTextColor(...COLORS.gray);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Detailed Findings & Recommendations", margin, yPos);
    yPos += 15;

    allFindings.forEach((finding, idx) => {
      checkPageBreak(60);

      // Severity badge
      const severityColor: [number, number, number] = 
        finding.severity === "critical" ? COLORS.danger :
        finding.severity === "warning" ? COLORS.accent :
        COLORS.success;

      doc.setFillColor(...severityColor);
      doc.rect(margin, yPos - 5, 15, 5, "F");

      // Term name
      doc.setTextColor(...severityColor);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text(`${idx + 1}. ${finding.term.term}`, margin + 18, yPos);

      // Line number and regulation
      doc.setTextColor(...COLORS.gray);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text(`Line ${finding.lineNumber} • ${finding.term.regulation}`, margin + 18, yPos + 7);

      /**
       * Display context around the matched term
       * splitTextToSize automatically wraps text to fit within specified width
       * Returns array of lines that fit within the width constraint
       */
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100); // Gray color for context
      const contextLines = doc.splitTextToSize(
        `Context: ${finding.context}`, 
        pageWidth - 2 * margin - 18 // Available width (page width minus margins and left padding)
      );
      doc.text(contextLines, margin + 18, yPos + 14);

      // Description
      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);
      const descLines = doc.splitTextToSize(`Description: ${finding.term.description}`, pageWidth - 2 * margin - 18);
      doc.text(descLines, margin + 18, yPos + 14 + contextLines.length * 4);

      // Penalty range
      doc.setFontSize(8);
      doc.setTextColor(...COLORS.danger);
      doc.setFont("helvetica", "bold");
      doc.text(`Penalty Range: ${finding.term.penaltyRange}`, margin + 18, yPos + 14 + contextLines.length * 4 + descLines.length * 4);

      // Recommendations
      if (finding.term.alternatives && finding.term.alternatives.length > 0) {
        doc.setFontSize(9);
        doc.setTextColor(...COLORS.primary);
        doc.setFont("helvetica", "bold");
        doc.text("Recommendations:", margin + 18, yPos + 14 + contextLines.length * 4 + descLines.length * 4 + 6);
        
        doc.setFontSize(8);
        doc.setTextColor(0, 0, 0);
        doc.setFont("helvetica", "normal");
        finding.term.alternatives.forEach((alt, altIdx) => {
          const altY = yPos + 14 + contextLines.length * 4 + descLines.length * 4 + 12 + altIdx * 5;
          doc.text(`• ${alt}`, margin + 25, altY);
        });
      }

      /**
       * Calculate new vertical position after rendering this finding:
       * - Base offset: 14px
       * - Context lines: number of lines * 4px line height
       * - Description lines: number of lines * 4px line height
       * - Alternatives: number of alternatives * 5px line height
       * - Bottom spacing: 15px
       */
      yPos += 14 + contextLines.length * 4 + descLines.length * 4 + (finding.term.alternatives?.length || 0) * 5 + 15;
    });
  }

  /**
   * ========== FOOTER ==========
   * Add footer to every page with disclaimer and page numbers
   * Must iterate through all pages since footer is added after content generation
   */
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i); // Switch to page i
    
    // Footer line
    doc.setDrawColor(...COLORS.gray);
    doc.setLineWidth(0.5);
    doc.line(margin, pageHeight - 25, pageWidth - margin, pageHeight - 25);

    // Disclaimer
    doc.setTextColor(...COLORS.gray);
    doc.setFontSize(7);
    doc.setFont("helvetica", "italic");
    const disclaimer = "This report is generated automatically and serves as a preliminary assessment. " +
      "It does not constitute legal advice. Please consult with legal professionals for compliance verification. " +
      "Based on EU Regulation 2024/825 (effective September 2026).";
    const disclaimerLines = doc.splitTextToSize(disclaimer, pageWidth - 2 * margin);
    doc.text(disclaimerLines, margin, pageHeight - 20, { align: "justify" });

    // Page number
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 10, { align: "right" });
  }

  /**
   * ========== SAVE PDF ==========
   * Generate filename with current date and trigger browser download
   * Format: green-claim-report-YYYY-MM-DD.pdf
   */
  const fileName = `green-claim-report-${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(fileName); // Triggers browser download dialog
}
