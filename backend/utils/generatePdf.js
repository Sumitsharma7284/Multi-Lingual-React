const fs = require('fs');
const path = require('path');

/**
 * Creates a valid standalone PDF 1.4 document buffer without external native binaries
 */
function createPDFBuffer(orderNumber, title, department) {
  const contentText = `BT
/F1 18 Tf
50 740 Td
(GOVERNMENT OF INDIA - OFFICIAL GAZETTE NOTIFICATION) Tj
/F1 12 Tf
0 -35 Td
(Order Number: ${orderNumber}) Tj
0 -20 Td
(Department: ${department}) Tj
0 -20 Td
(Subject: ${title.replace(/[()]/g, '')}) Tj
0 -30 Td
(Published under the Official Gazette and Orders Portal - e-RajPatra) Tj
0 -20 Td
(This document is released for public record, notification, and implementation.) Tj
0 -40 Td
(Authorized Signatory: Principal Secretary to Government) Tj
0 -20 Td
(Date of Gazette Release: ${new Date().toLocaleDateString('en-IN')}) Tj
ET`;

  const streamLength = Buffer.byteLength(contentText, 'utf8');

  const pdf = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length ${streamLength} >>
stream
${contentText}
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000234 00000 n 
0000000${(320 + streamLength).toString().padStart(3, '0')} 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
${400 + streamLength}
%%EOF`;

  return Buffer.from(pdf, 'utf8');
}

/**
 * Ensures sample PDF exists on disk in uploads directory
 */
function ensureSamplePDF(orderNumber, title, department) {
  const uploadsDir = path.join(__dirname, '..', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const filename = `order_${orderNumber.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;
  const filePath = path.join(uploadsDir, filename);

  if (!fs.existsSync(filePath)) {
    const buffer = createPDFBuffer(orderNumber, title, department);
    fs.writeFileSync(filePath, buffer);
  }

  return {
    filename,
    url: `/uploads/${filename}`,
    size: fs.statSync(filePath).size,
  };
}

function ensureFileOnDisk(filename, orderNumber, title, department) {
  const uploadsDir = path.join(__dirname, '..', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  const safeFilename = path.basename(filename);
  const filePath = path.join(uploadsDir, safeFilename);

  if (!fs.existsSync(filePath)) {
    const buffer = createPDFBuffer(orderNumber, title || 'Official Gazette Document', department || 'General Administration');
    fs.writeFileSync(filePath, buffer);
  }

  return filePath;
}

module.exports = {
  createPDFBuffer,
  ensureSamplePDF,
  ensureFileOnDisk,
};
