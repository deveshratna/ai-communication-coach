import { jsPDF } from 'jspdf';

export function downloadJSONReport(analysisData, mode = 'session') {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(analysisData, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `Cadence_Studio_Report_${mode}_${Date.now()}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function downloadPDFReport(analysisData) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Colors
  const purple = '#7c3aed';
  const darkBg = '#0f172a';
  const textDark = '#1e293b';
  const textMuted = '#64748b';

  let y = 20;

  // Header Banner
  doc.setFillColor(15, 23, 42); // dark background
  doc.rect(0, 0, pageWidth, 40, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('CADENCE STUDIO', 16, 22);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(192, 132, 252);
  doc.text('EXECUTIVE COMMUNICATION DIAGNOSTIC REPORT', 16, 30);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.text(`Date: ${new Date().toLocaleDateString()} | Mode: ${(analysisData.mode || 'General').toUpperCase()}`, pageWidth - 16, 25, { align: 'right' });

  y = 52;

  // Overall Score Box
  const score = analysisData.overall_score !== undefined ? analysisData.overall_score : (analysisData.overallScore || 0);
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(16, y, pageWidth - 32, 28, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(124, 58, 237);
  doc.text(`${score} / 100`, 28, y + 18);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59);
  doc.text('OVERALL COMMUNICATION SCORE', 70, y + 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  const msg = (analysisData.coach_message || analysisData.coachMessage || "Data-grounded communication feedback.").substring(0, 85);
  doc.text(`"${msg}"`, 70, y + 20);

  y += 38;

  // Key Metrics Section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(30, 41, 59);
  doc.text('1. SPOKEN SESSION METRICS', 16, y);
  y += 8;

  const metrics = analysisData.metrics || {};
  const paceText = metrics.wpmFormatted || `${metrics.wpm || '--'} WPM`;
  const fillersText = `${metrics.fillersCount || 0} (${metrics.fillerRate || '0%'})`;
  const wordCount = metrics.words || (analysisData.transcript_text ? analysisData.transcript_text.split(/\s+/).length : 0);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(51, 65, 85);
  doc.text(`• Total Spoken Words: ${wordCount}`, 20, y);
  doc.text(`• Speech Pace: ${paceText}`, 110, y);
  y += 6;
  doc.text(`• Filler Words Detected: ${fillersText}`, 20, y);
  doc.text(`• Pauses (>1.5s): ${metrics.pausesCount || 0}`, 110, y);

  y += 14;

  // Complete Transcript Section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(30, 41, 59);
  doc.text('2. CAPTURED SPEECH TRANSCRIPT', 16, y);
  y += 8;

  const rawTranscript = analysisData.transcript_text || analysisData.transcript || "No speech captured during session.";
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);

  const splitTranscript = doc.splitTextToSize(`"${rawTranscript}"`, pageWidth - 40);
  doc.text(splitTranscript, 20, y);
  y += (splitTranscript.length * 5) + 12;

  // Priority Improvements
  const priorityIssues = analysisData.priority_issues || analysisData.priorityIssues || [];
  if (priorityIssues.length > 0 && y < 240) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(30, 41, 59);
    doc.text('3. TOP HIGH-LEVERAGE IMPROVEMENTS', 16, y);
    y += 8;

    priorityIssues.forEach((issue, idx) => {
      if (y > 270) return;
      const title = typeof issue === 'object' ? (issue.issue || issue.title) : issue;
      const fix = typeof issue === 'object' ? (issue.how_to_fix || issue.fix) : '';
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(124, 58, 237);
      doc.text(`#${idx + 1} ${title}`, 20, y);
      y += 5;
      if (fix) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(71, 85, 105);
        const splitFix = doc.splitTextToSize(`Action: ${fix}`, pageWidth - 44);
        doc.text(splitFix, 24, y);
        y += (splitFix.length * 4) + 4;
      }
    });
  }

  // Footer
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('Cadence Studio • Data-Grounded AI Communication Training System', pageWidth / 2, 285, { align: 'center' });

  // Save PDF
  doc.save(`Cadence_Studio_Report_${Date.now()}.pdf`);
}
