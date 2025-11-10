const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Photo, MedicalCase, Doctor } = require('../models');
const auth = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/medical-photos');

    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename: medicalCaseId_timestamp_originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext);
    cb(null, `case-${req.body.medicalCaseId}-${uniqueSuffix}${ext}`);
  }
});

// File filter - only accept images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos de imagen (jpeg, jpg, png, gif, webp)'));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
});

// POST /api/photos - Upload photo
router.post('/', auth, upload.single('photo'), async (req, res) => {
  try {
    const {
      medicalCaseId,
      photoType,
      uploadDate,
      description
    } = req.body;

    // Validation
    if (!medicalCaseId || !req.file) {
      return res.status(400).json({
        success: false,
        message: 'Caso médico y archivo de foto son requeridos'
      });
    }

    // Verify medical case exists
    const medicalCase = await MedicalCase.findByPk(medicalCaseId);
    if (!medicalCase) {
      // Delete uploaded file if medical case not found
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ success: false, message: 'Caso médico no encontrado' });
    }

    // Check permissions (doctors can only upload photos to their own cases)
    if (req.userRole === 'doctor') {
      const doctor = await Doctor.findOne({ where: { userId: req.userId } });
      if (doctor && medicalCase.doctorId !== doctor.id) {
        // Delete uploaded file if no permission
        fs.unlinkSync(req.file.path);
        return res.status(403).json({
          success: false,
          message: 'No tienes permiso para agregar fotos a este caso'
        });
      }
    }

    // Generate photo URL
    const photoUrl = `/uploads/medical-photos/${req.file.filename}`;

    // Create photo record
    const photo = await Photo.create({
      medicalCaseId,
      photoUrl,
      photoType: photoType || 'during',
      uploadDate: uploadDate || new Date().toISOString().split('T')[0],
      description: description || null
    });

    res.status(201).json({
      success: true,
      message: 'Foto subida exitosamente',
      data: photo
    });
  } catch (error) {
    console.error('Error uploading photo:', error);

    // Delete uploaded file if there was an error
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting file:', unlinkError);
      }
    }

    res.status(500).json({ success: false, message: 'Error al subir foto' });
  }
});

// GET /api/photos/case/:medicalCaseId - Get all photos for a medical case
router.get('/case/:medicalCaseId', auth, async (req, res) => {
  try {
    const { medicalCaseId } = req.params;

    // Verify medical case exists
    const medicalCase = await MedicalCase.findByPk(medicalCaseId);
    if (!medicalCase) {
      return res.status(404).json({ success: false, message: 'Caso médico no encontrado' });
    }

    // Check permissions
    if (req.userRole === 'doctor') {
      const doctor = await Doctor.findOne({ where: { userId: req.userId } });
      if (doctor && medicalCase.doctorId !== doctor.id) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permiso para ver estas fotos'
        });
      }
    }

    // Get photos
    const photos = await Photo.findAll({
      where: { medicalCaseId },
      order: [['uploadDate', 'DESC'], ['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: photos
    });
  } catch (error) {
    console.error('Error fetching photos:', error);
    res.status(500).json({ success: false, message: 'Error al obtener fotos' });
  }
});

// DELETE /api/photos/:id - Delete photo
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Find photo
    const photo = await Photo.findByPk(id, {
      include: [{ model: MedicalCase }]
    });

    if (!photo) {
      return res.status(404).json({ success: false, message: 'Foto no encontrada' });
    }

    // Check permissions (doctors can only delete photos from their own cases)
    if (req.userRole === 'doctor') {
      const doctor = await Doctor.findOne({ where: { userId: req.userId } });
      if (doctor && photo.MedicalCase.doctorId !== doctor.id) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permiso para eliminar esta foto'
        });
      }
    }

    // Delete physical file
    const filePath = path.join(__dirname, '..', photo.photoUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete database record
    await photo.destroy();

    res.json({
      success: true,
      message: 'Foto eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error deleting photo:', error);
    res.status(500).json({ success: false, message: 'Error al eliminar foto' });
  }
});

module.exports = router;
