const express = require('express');
const router = express.Router();
const { Patient, Appointment, Service, Doctor } = require('../models');
const auth = require('../middleware/auth');

// Apply auth middleware to all patient routes
router.use(auth);

// ===================================
// GET /api/patients
// Get all patients
// ===================================
router.get('/', async (req, res) => {
  try {
    const patients = await Patient.findAll({
      where: { isActive: true },
      order: [['fullName', 'ASC']]
    });

    res.json({
      success: true,
      data: patients
    });
  } catch (error) {
    console.error('Error fetching patients:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener pacientes',
      error: error.message
    });
  }
});

// ===================================
// GET /api/patients/:id
// Get single patient details
// ===================================
router.get('/:id', async (req, res) => {
  try {
    const patient = await Patient.findByPk(req.params.id);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Paciente no encontrado'
      });
    }

    res.json({
      success: true,
      data: patient
    });
  } catch (error) {
    console.error('Error fetching patient:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener paciente'
    });
  }
});

// ===================================
// POST /api/patients
// Create new patient
// ===================================
router.post('/', async (req, res) => {
  try {
    const {
      fullName,
      birthDate,
      gender,
      phone,
      email,
      address,
      emergencyContact,
      emergencyPhone,
      bloodType,
      allergies,
      notes
    } = req.body;

    // Validate required fields
    if (!fullName || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Nombre completo y teléfono son requeridos'
      });
    }

    // Create patient with proper null handling for optional fields
    const patient = await Patient.create({
      fullName,
      birthDate: birthDate && birthDate.trim() !== '' ? birthDate : null,
      gender: gender || 'female',
      phone,
      email: email && email.trim() !== '' ? email : null,
      address: address && address.trim() !== '' ? address : null,
      emergencyContact: emergencyContact && emergencyContact.trim() !== '' ? emergencyContact : null,
      emergencyPhone: emergencyPhone && emergencyPhone.trim() !== '' ? emergencyPhone : null,
      bloodType: bloodType && bloodType.trim() !== '' ? bloodType : null,
      allergies: allergies && allergies.trim() !== '' ? allergies : null,
      notes: notes && notes.trim() !== '' ? notes : null,
      isActive: true
    });

    res.status(201).json({
      success: true,
      message: 'Paciente creado exitosamente',
      data: patient
    });
  } catch (error) {
    console.error('Error creating patient:', error);

    // Handle validation errors
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Error de validación',
        errors: error.errors.map(e => e.message)
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al crear paciente',
      error: error.message
    });
  }
});

// ===================================
// PUT /api/patients/:id
// Update patient
// ===================================
router.put('/:id', async (req, res) => {
  try {
    const patient = await Patient.findByPk(req.params.id);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Paciente no encontrado'
      });
    }

    const {
      fullName,
      birthDate,
      gender,
      phone,
      phoneCountryCode,
      email,
      address,
      emergencyContact,
      emergencyPhone,
      bloodType,
      allergies,
      notes
    } = req.body;

    await patient.update({
      fullName: fullName || patient.fullName,
      birthDate: birthDate || patient.birthDate,
      gender: gender || patient.gender,
      phone: phone || patient.phone,
      phoneCountryCode: phoneCountryCode || patient.phoneCountryCode,
      email: email !== undefined ? (email.trim() === '' ? null : email) : patient.email,
      address: address !== undefined ? (address.trim() === '' ? null : address) : patient.address,
      emergencyContact: emergencyContact !== undefined ? (emergencyContact.trim() === '' ? null : emergencyContact) : patient.emergencyContact,
      emergencyPhone: emergencyPhone !== undefined ? (emergencyPhone.trim() === '' ? null : emergencyPhone) : patient.emergencyPhone,
      bloodType: bloodType !== undefined ? (bloodType.trim() === '' ? null : bloodType) : patient.bloodType,
      allergies: allergies !== undefined ? (allergies.trim() === '' ? null : allergies) : patient.allergies,
      notes: notes !== undefined ? (notes.trim() === '' ? null : notes) : patient.notes
    });

    res.json({
      success: true,
      message: 'Paciente actualizado exitosamente',
      data: patient
    });
  } catch (error) {
    console.error('Error updating patient:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar paciente',
      error: error.message
    });
  }
});

module.exports = router;
