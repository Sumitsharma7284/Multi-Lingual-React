const fs = require('fs');
const path = require('path');

const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');

// Ensure uploads directory exists on disk
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

/**
 * Upload PDF buffer directly to resilient local disk storage
 * Saves directly into backend/uploads/ and returns static URI
 */
const uploadPDFDocument = async (fileBuffer, originalName) => {
  const safeName = (originalName || 'document.pdf').replace(/[^a-zA-Z0-9.-]/g, '_');
  const uniquePrefix = `${Date.now()}_${Math.round(Math.random() * 1e5)}`;
  const filename = `${uniquePrefix}_${safeName}`;
  const filePath = path.join(UPLOADS_DIR, filename);

  await fs.promises.writeFile(filePath, fileBuffer);

  return {
    url: `/uploads/${filename}`,
    publicId: filename,
    size: fileBuffer.length,
    storageType: 'local',
  };
};

/**
 * Delete document from local storage
 */
const deletePDFDocument = async (publicId) => {
  if (!publicId) return;

  try {
    const filename = path.basename(publicId);
    const filePath = path.join(UPLOADS_DIR, filename);
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
    }
  } catch (err) {
    console.warn(`[Storage Cleanup Warning] Could not remove file ${publicId}:`, err.message);
  }
};

module.exports = {
  uploadPDFDocument,
  deletePDFDocument,
  isCloudinaryConfigured: false,
};
