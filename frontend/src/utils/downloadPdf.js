import { jsPDF } from 'jspdf';

const pageWidth = 612;
const pageHeight = 792;
const margin = 56;

const ensureSpace = (document, y, requiredHeight) => {
  if (y + requiredHeight > pageHeight - margin) {
    document.addPage();
    return margin;
  }
  return y;
};

export const downloadPdf = ({ filename, header, sections }) => {
  const document = new jsPDF({ unit: 'pt', format: 'letter' });
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  document.setTextColor(25, 35, 45);
  if (header?.name) {
    document.setFont('helvetica', 'bold');
    document.setFontSize(19);
    document.text(header.name, margin, y);
    y += 24;

    if (header.subtitle) {
      document.setFont('helvetica', 'normal');
      document.setFontSize(10);
      document.text(header.subtitle, margin, y);
      y += 16;
    }

    document.setDrawColor(185, 195, 205);
    document.line(margin, y, pageWidth - margin, y);
    y += 20;
  }

  sections.forEach(({ title, body }) => {
    if (title) {
      y = ensureSpace(document, y, 28);
      document.setFont('helvetica', 'bold');
      document.setFontSize(10);
      document.text(title.toUpperCase(), margin, y);
      y += 15;
    }

    const paragraphs = String(body || '').split('\n');
    paragraphs.forEach((paragraph) => {
      if (!paragraph.trim()) {
        y += 7;
        return;
      }

      document.setFont('helvetica', 'normal');
      document.setFontSize(10.5);
      const lines = document.splitTextToSize(paragraph, contentWidth);
      y = ensureSpace(document, y, lines.length * 15);
      document.text(lines, margin, y);
      y += lines.length * 15 + 4;
    });
    y += 7;
  });

  document.save(filename);
};