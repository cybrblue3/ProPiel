const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const ensureUploadDirs = () => {
  const dirs = [
    path.join(__dirname, '../uploads'),
    path.join(__dirname, '../uploads/comprobantes'),
    path.join(__dirname, '../uploads/consents')
  ];

  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

ensureUploadDirs();

// ===================================
// PAYMENT PROOF UPLOAD CONFIGURATION
// ===================================

const paymentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/comprobantes'));
  },
  filename: (req, file, cb) => {
    // Format: comp_TIMESTAMP_RANDOM.ext
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const ext = path.extname(file.originalname);
    cb(null, `comp_${timestamp}_${random}${ext}`);
  }
});

const paymentFileFilter = (req, file, cb) => {
  // Accept only images and PDFs
  const allowedMimes = ['image/jpeg', 'image/png', 'application/pdf'];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Formato de archivo no permitido. Solo JPG, PNG o PDF.'), false);
  }
};

const uploadPaymentProof = multer({
  storage: paymentStorage,
  fileFilter: paymentFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max
  }
});

// ===================================
// CONSENT SIGNATURE UPLOAD CONFIGURATION
// ===================================

const consentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/consents'));
  },
  filename: (req, file, cb) => {
    // Format: sign_TIMESTAMP_RANDOM.png
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    cb(null, `sign_${timestamp}_${random}.png`);
  }
});

const consentFileFilter = (req, file, cb) => {
  // Accept only PNG images (from canvas)
  if (file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes PNG para firmas.'), false);
  }
};

const uploadConsentSignature = multer({
  storage: consentStorage,
  fileFilter: consentFileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB max
  }
});

// ===================================
// EXPORT
// ===================================

module.exports = {
  uploadPaymentProof: uploadPaymentProof.single('comprobante'),
  uploadConsentSignature: uploadConsentSignature.single('signature')
};
