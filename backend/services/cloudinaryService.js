const fs = require('fs');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');

// Ensure uploads directory exists on disk
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Check if Cloudinary credentials are provided via environment variables
const isCloudinaryConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log('[Storage] Cloudinary document storage configured and active.');
} else {
  console.log('[Storage] Using local disk storage in backend/uploads/.');
}

/**
 * Upload PDF buffer directly to Cloudinary (if configured) or local disk storage
 */
const uploadPDFDocument = async (fileBuffer, originalName) => {
  if (isCloudinaryConfigured) {
    return new Promise((resolve, reject) => {
      const safePrefix = (originalName || 'document.pdf').replace(/[^a-zA-Z0-9.-]/g, '_');
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'raw',
          folder: 'rajpatra_orders',
          public_id: `${Date.now()}_${safePrefix}`,
          format: 'pdf',
        },
        (error, result) => {
          if (error) {
            console.error('[Cloudinary Upload Error]', error);
            return reject(error);
          }
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            size: result.bytes || fileBuffer.length,
            storageType: 'cloudinary',
          });
        }
      );
      streamifier.createReadStream(fileBuffer).pipe(uploadStream);
    });
  }

  // Fallback: Resilient local disk storage
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
 * Delete document from Cloudinary or local storage
 */
const deletePDFDocument = async (publicId) => {
  if (!publicId) return;

  if (isCloudinaryConfigured && !publicId.endsWith('.pdf')) {
    try {
      await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
      return;
    } catch (err) {
      console.warn(`[Cloudinary Cleanup Warning] Could not remove ${publicId}:`, err.message);
    }
  }

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
  isCloudinaryConfigured,
};
