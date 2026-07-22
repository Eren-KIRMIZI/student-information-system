import PDFDocument from 'pdfkit';
import path from 'path';
import { fileURLToPath } from 'url';
import { computeSemesterGPA } from './gradeScale.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FONT_DIR = 'C:/Windows/Fonts';

const registerFont = (doc) => {
  try {
    doc.registerFont('Arial', path.join(FONT_DIR, 'arial.ttf'));
    doc.registerFont('ArialBold', path.join(FONT_DIR, 'arialbd.ttf'));
    return { regular: 'Arial', bold: 'ArialBold' };
  } catch {
    return { regular: 'Helvetica', bold: 'Helvetica-Bold' };
  }
};

const SEMESTER_LABEL = { FALL: 'Güz', SPRING: 'Bahar', SUMMER: 'Yaz' };

export const generateTranscriptPDF = (transcriptData, res) => {
  const { student, grades, gpa, totalCredits } = transcriptData;
  const fonts = registerFont(new PDFDocument({ autoFirstPage: false }));

  const doc = new PDFDocument({
    size: 'A4',
    margin: 50,
    bufferPages: true,
    info: { Title: `Transkript - ${student.firstName} ${student.lastName}`, Author: 'OBS' },
  });
  doc.pipe(res);

  const pageW = doc.page.width - 100;

  const drawHeader = () => {
    doc.font(fonts.bold).fontSize(16).text('ÜNİVERSİTESİ', 50, 50, { align: 'center', width: pageW });
    doc
      .font(fonts.regular)
      .fontSize(11)
      .text('Öğrenci Bilgi Sistemi — Transkript Belgesi', { align: 'center', width: pageW });
    doc.moveDown(0.8);
    doc
      .moveTo(50, doc.y)
      .lineTo(50 + pageW, doc.y)
      .stroke('#2563eb');
    doc.moveDown(0.8);
  };

  drawHeader();

  doc.fontSize(12).font(fonts.bold).text('Öğrenci Bilgileri', 50, doc.y);
  doc.moveDown(0.3);
  doc.font(fonts.regular).fontSize(10);
  const infoY = doc.y;
  doc.text(`Ad Soyad: ${student.firstName} ${student.lastName}`, 50, infoY, { width: pageW / 2 });
  doc.text(`Öğrenci No: ${student.studentNumber || '—'}`, 50 + pageW / 2, infoY, { width: pageW / 2 });
  doc.text(`Bölüm: ${student.department?.name || '—'}`, 50, infoY + 16, { width: pageW / 2 });
  doc.text(`Fakülte: ${student.department?.faculty?.name || '—'}`, 50 + pageW / 2, infoY + 16, { width: pageW / 2 });
  doc.text(`Genel Not Ortalaması: ${gpa?.toFixed(2) ?? '0.00'}`, 50, infoY + 32, { width: pageW / 2 });
  doc.text(`Toplam Kredi: ${totalCredits}`, 50 + pageW / 2, infoY + 32, { width: pageW / 2 });
  doc.y = infoY + 52;

  const groupedBySemester = {};
  grades.forEach((g) => {
    const s = g.enrollment.courseSection;
    const key = `${s.academicYear} ${s.semester}`;
    if (!groupedBySemester[key]) groupedBySemester[key] = [];
    groupedBySemester[key].push(g);
  });

  Object.entries(groupedBySemester).forEach(([key, semGrades]) => {
    const [year, sem] = key.split(' ');
    if (doc.y > 680) {
      doc.addPage();
      drawHeader();
    }
    doc.moveDown(0.5);
    doc
      .font(fonts.bold)
      .fontSize(11)
      .text(`${year} — ${SEMESTER_LABEL[sem] ?? sem} Dönemi`, 50, doc.y, { width: pageW });
    doc.moveDown(0.3);

    const tableTop = doc.y;
    const colW = [pageW * 0.35, 50, 50, 50, 60, 50];
    const headers = ['Ders', 'Kredi', 'Vize', 'Final', 'Harf', 'Puan'];
    const colX = [50];
    let cx = 50;
    for (let i = 0; i < colW.length - 1; i++) {
      cx += colW[i];
      colX.push(cx);
    }

    doc.font(fonts.bold).fontSize(9);
    doc
      .fillColor('#f1f5f9')
      .rect(50, tableTop - 2, pageW, 18)
      .fill();
    doc.fillColor('#000');
    headers.forEach((h, i) => doc.text(h, colX[i], tableTop, { width: colW[i], align: i === 0 ? 'left' : 'center' }));
    doc.y = tableTop + 18;

    doc.font(fonts.regular).fontSize(9);
    semGrades.forEach((g) => {
      if (doc.y > 760) {
        doc.addPage();
        drawHeader();
        doc.y = 50;
      }
      const rowY = doc.y;
      const c = g.enrollment.courseSection.course;
      doc.text(c.name, colX[0], rowY, { width: colW[0] });
      doc.text(String(c.credit), colX[1], rowY, { width: colW[1], align: 'center' });
      doc.text(g.midtermScore != null ? String(g.midtermScore) : '—', colX[2], rowY, {
        width: colW[2],
        align: 'center',
      });
      doc.text(
        g.makeupScore != null ? String(g.makeupScore) : g.finalScore != null ? String(g.finalScore) : '—',
        colX[3],
        rowY,
        { width: colW[3], align: 'center' },
      );
      doc.text(g.letterGrade || '—', colX[4], rowY, { width: colW[4], align: 'center' });
      doc.text(g.gradePoint != null ? g.gradePoint.toFixed(1) : '—', colX[5], rowY, {
        width: colW[5],
        align: 'center',
      });
      doc.y = rowY + 16;
    });

    const { gpa: semGPA } = computeSemesterGPA(semGrades);
    doc.moveDown(0.2);
    doc
      .font(fonts.bold)
      .fontSize(9)
      .text(`Dönem Ortalaması: ${semGPA.toFixed(2)}`, 50, doc.y, { width: pageW, align: 'right' });
    doc.moveDown(0.3);
  });

  const totalPages = doc.bufferedPageRange().count;
  for (let i = 0; i < totalPages; i++) {
    doc.switchToPage(i);
    doc
      .font(fonts.regular)
      .fontSize(8)
      .fillColor('#94a3b8')
      .text(`Sayfa ${i + 1} / ${totalPages}`, 50, doc.page.height - 40, { width: pageW, align: 'center' });
  }

  doc.end();
};
