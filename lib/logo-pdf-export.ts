import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { LogoAnalysisResults, LogoFinding } from "./logo-analysis";

const COLORS = {
  primary: [74, 107, 90] as [number, number, number],
  danger: [200, 90, 79] as [number, number, number],
  accent: [184, 134, 91] as [number, number, number],
  success: [90, 124, 107] as [number, number, number],
  blue: [59, 130, 246] as [number, number, number],
  gray: [107, 114, 128] as [number, number, number],
  lightGray: [243, 244, 246] as [number, number, number],
};

/**
 * Generates a PDF report for logo compliance analysis results
 */
export function exportLogoPDF(results: LogoAnalysisResults): void {
  if (typeof window === "undefined") {
    console.error("PDF export can only be called from the browser");
    return;
  }

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let yPos = margin;

  const checkPageBreak = (requiredHeight: number) => {
    if (yPos + requiredHeight > pageHeight - margin) {
      doc.addPage();
      yPos = margin;
      return true;
    }
    return false;
  };

  // ========== HEADER ==========
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, pageWidth, 50, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("Green Lens", margin, 25);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Logo & Label Compliance Report", margin, 35);

  const timestamp = results.timestamp.toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  doc.text(`Generated: ${timestamp}`, pageWidth - margin, 35, { align: "right" });

  yPos = 60;

  // ========== COMPLIANCE STATUS ==========
  checkPageBreak(50);

  const statusColor: [number, number, number] =
    results.riskScore >= 61 ? COLORS.danger :
    results.riskScore >= 31 ? COLORS.accent :
    results.riskScore >= 11 ? COLORS.blue :
    COLORS.success;

  doc.setFillColor(...statusColor);
  doc.circle(pageWidth / 2, yPos + 20, 25, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(32);
  doc.setFont("helvetica", "bold");
  doc.text(`${results.riskScore}`, pageWidth / 2, yPos + 25, { align: "center" });

  doc.setFontSize(12);
  doc.text("/100", pageWidth / 2, yPos + 32, { align: "center" });

  const statusLabel =
    results.riskScore >= 61 ? "Non-Compliant" :
    results.riskScore >= 31 ? "Requires Review" :
    results.riskScore >= 11 ? "Conditional" :
    "Compliant";

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(statusLabel, pageWidth / 2, yPos + 40, { align: "center" });

  yPos += 55;

  // ========== FILE INFO ==========
  checkPageBreak(20);
  doc.setTextColor(...COLORS.gray);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`File: ${results.fileName}`, margin, yPos);
  if (results.fileSize > 0) {
    doc.text(`Size: ${(results.fileSize / 1024).toFixed(1)} KB`, pageWidth - margin, yPos, { align: "right" });
  }
  yPos += 10;

  // ========== SUMMARY ==========
  checkPageBreak(50);
  doc.setTextColor(...COLORS.gray);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Summary", margin, yPos);
  yPos += 8;

  const boxWidth = (pageWidth - 2 * margin - 30) / 4;
  const boxHeight = 30;

  // Compliant
  doc.setFillColor(...COLORS.success);
  doc.rect(margin, yPos, boxWidth, boxHeight, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Compliant", margin + boxWidth / 2, yPos + 8, { align: "center" });
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(`${results.summary.compliantCount}`, margin + boxWidth / 2, yPos + 22, { align: "center" });

  // Critical
  doc.setFillColor(...COLORS.danger);
  doc.rect(margin + boxWidth + 10, yPos, boxWidth, boxHeight, "F");
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Banned", margin + boxWidth + 10 + boxWidth / 2, yPos + 8, { align: "center" });
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(`${results.summary.criticalCount}`, margin + boxWidth + 10 + boxWidth / 2, yPos + 22, { align: "center" });

  // Warning
  doc.setFillColor(...COLORS.accent);
  doc.rect(margin + 2 * (boxWidth + 10), yPos, boxWidth, boxHeight, "F");
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Warning", margin + 2 * (boxWidth + 10) + boxWidth / 2, yPos + 8, { align: "center" });
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(`${results.summary.warningCount}`, margin + 2 * (boxWidth + 10) + boxWidth / 2, yPos + 22, { align: "center" });

  // Conditional
  doc.setFillColor(...COLORS.blue);
  doc.rect(margin + 3 * (boxWidth + 10), yPos, boxWidth, boxHeight, "F");
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Conditional", margin + 3 * (boxWidth + 10) + boxWidth / 2, yPos + 8, { align: "center" });
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(`${results.summary.conditionalCount}`, margin + 3 * (boxWidth + 10) + boxWidth / 2, yPos + 22, { align: "center" });

  yPos += boxHeight + 15;

  // ========== FINDINGS TABLE ==========
  if (results.findings.length > 0) {
    checkPageBreak(30);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Detailed Findings", margin, yPos);
    yPos += 10;

    const findingsData = results.findings.map((finding, idx) => {
      const statusText =
        finding.severity === 'compliant' ? 'COMPLIANT' :
        finding.severity === 'critical' ? 'BANNED' :
        finding.severity === 'warning' ? 'WARNING' :
        finding.severity === 'conditional' ? 'CONDITIONAL' :
        'UNKNOWN';

      return [
        idx + 1,
        finding.matchedLabel?.name || finding.matchedText,
        statusText,
        finding.matchSource.replace('_', ' '),
        finding.matchConfidence,
      ];
    });

    autoTable(doc, {
      startY: yPos,
      head: [["#", "Label", "Status", "Match Source", "Confidence"]],
      body: findingsData,
      headStyles: {
        fillColor: COLORS.primary,
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      bodyStyles: {
        textColor: [0, 0, 0],
      },
      didParseCell: (data: any) => {
        if (data.section === 'body' && data.column.index === 2) {
          const cellText = data.cell.text[0];
          if (cellText === 'BANNED') data.cell.styles.textColor = COLORS.danger;
          else if (cellText === 'COMPLIANT') data.cell.styles.textColor = COLORS.success;
          else if (cellText === 'WARNING') data.cell.styles.textColor = COLORS.accent;
          else if (cellText === 'CONDITIONAL') data.cell.styles.textColor = COLORS.blue;
        }
      },
      margin: { left: margin, right: margin },
      styles: { fontSize: 8 },
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;
  }

  // ========== DETAILED RECOMMENDATIONS ==========
  results.findings.forEach((finding, idx) => {
    checkPageBreak(50);

    const severityColor: [number, number, number] =
      finding.severity === 'compliant' ? COLORS.success :
      finding.severity === 'critical' ? COLORS.danger :
      finding.severity === 'warning' ? COLORS.accent :
      finding.severity === 'conditional' ? COLORS.blue :
      COLORS.gray;

    doc.setFillColor(...severityColor);
    doc.rect(margin, yPos - 5, 15, 5, "F");

    doc.setTextColor(...severityColor);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(`${idx + 1}. ${finding.matchedLabel?.name || finding.matchedText}`, margin + 18, yPos);

    doc.setTextColor(...COLORS.gray);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`${finding.regulation} | Confidence: ${finding.matchConfidence}`, margin + 18, yPos + 7);

    doc.setFontSize(8);
    doc.setTextColor(0, 0, 0);
    const descLines = doc.splitTextToSize(`Description: ${finding.description}`, pageWidth - 2 * margin - 18);
    doc.text(descLines, margin + 18, yPos + 14);

    doc.setTextColor(...severityColor);
    doc.setFont("helvetica", "bold");
    const recLines = doc.splitTextToSize(`Recommendation: ${finding.recommendation}`, pageWidth - 2 * margin - 18);
    doc.text(recLines, margin + 18, yPos + 14 + descLines.length * 4);

    if (finding.alternatives.length > 0) {
      doc.setFontSize(9);
      doc.setTextColor(...COLORS.primary);
      doc.setFont("helvetica", "bold");
      const altY = yPos + 14 + descLines.length * 4 + recLines.length * 4 + 4;
      doc.text("Actions:", margin + 18, altY);

      doc.setFontSize(8);
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "normal");
      finding.alternatives.forEach((alt, altIdx) => {
        doc.text(`- ${alt}`, margin + 25, altY + 6 + altIdx * 5);
      });

      yPos = altY + 6 + finding.alternatives.length * 5 + 10;
    } else {
      yPos += 14 + descLines.length * 4 + recLines.length * 4 + 10;
    }
  });

  // ========== REGULATORY CONTEXT ==========
  checkPageBreak(30);
  doc.setTextColor(...COLORS.gray);
  doc.setFontSize(9);
  doc.setFont("helvetica", "italic");
  const contextLines = doc.splitTextToSize(results.regulatoryContext, pageWidth - 2 * margin);
  doc.text(contextLines, margin, yPos);

  // ========== FOOTER ==========
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(...COLORS.gray);
    doc.setLineWidth(0.5);
    doc.line(margin, pageHeight - 25, pageWidth - margin, pageHeight - 25);

    doc.setTextColor(...COLORS.gray);
    doc.setFontSize(7);
    doc.setFont("helvetica", "italic");
    const disclaimer = "This report is generated automatically and serves as a preliminary assessment. " +
      "It does not constitute legal advice. Please consult with legal professionals for compliance verification. " +
      "Based on EU Directive 2024/825 (effective September 2026).";
    const disclaimerLines = doc.splitTextToSize(disclaimer, pageWidth - 2 * margin);
    doc.text(disclaimerLines, margin, pageHeight - 20, { align: "justify" });
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 10, { align: "right" });
  }

  const fileName = `logo-compliance-report-${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(fileName);
}
