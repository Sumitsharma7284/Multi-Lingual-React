const multer = require('multer');

// Store file in memory as Buffer for flexible routing (Cloudinary stream OR local disk)
const storage = multer.memoryStorage();

// Validate file type
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'application/pdf' ||
    file.originalname.toLowerCase().endsWith('.pdf')
  ) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type! Only official PDF documents are permitted.'), false);
  }
};

const uploadPDF = multer({
  storage,
  limits: {
    fileSize: 15 * 1024 * 1024, // 15 Megabytes max limit
  },
  fileFilter,
});

module.exports = uploadPDF;
