const express = require('express');
const router = express.Router();
const Doctor = require('../models/Doctor');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const Service = require('../models/Service');
const auth = require('../middleware/auth');

// Apply authentication to all routes
router.use(auth);

// GET /api/doctors - Get all doctors
router.get('/', async (req, res) => {
  try {
    const doctors = await Doctor.findAll({
      order: [['fullName', 'ASC']],
      include: [{
        model: User,
        attributes: ['id', 'username', 'role', 'isActive']
      }]
    });

    res.json({
      success: true,
      data: doctors
    });
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener doctores',
      error: error.message
    });
  }
});

// GET /api/doctors/:id - Get single doctor
router.get('/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findByPk(req.params.id, {
      include: [{
        model: User,
        attributes: ['id', 'username', 'role', 'isActive']
      }]
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor no encontrado'
      });
    }

    res.json({
      success: true,
      data: doctor
    });
  } catch (error) {
    console.error('Error fetching doctor:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener doctor',
      error: error.message
    });
  }
});

// POST /api/doctors - Create new doctor
router.post('/', async (req, res) => {
  try {
    const { fullName, email, phone, specialty, licenseNumber, schedule, isActive } = req.body;

    // Validate required fields
    if (!fullName) {
      return res.status(400).json({
        success: false,
        message: 'El nombre completo es requerido'
      });
    }

    // Create doctor record
    const doctor = await Doctor.create({
      fullName,
      email: email && email.trim() !== '' ? email : null,
      phone: phone && phone.trim() !== '' ? phone : null,
      specialty: specialty && specialty.trim() !== '' ? specialty : null,
      licenseNumber: licenseNumber && licenseNumber.trim() !== '' ? licenseNumber : null,
      schedule: schedule && schedule.trim() !== '' ? schedule : null,
      isActive: isActive !== undefined ? isActive : true,
      userId: 1 // Placeholder - in a real app, this would be created alongside a User record
    });

    res.status(201).json({
      success: true,
      message: 'Doctor creado exitosamente',
      data: doctor
    });
  } catch (error) {
    console.error('Error creating doctor:', error);

    // Handle unique constraint violations
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'El número de licencia ya está registrado'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al crear doctor',
      error: error.message
    });
  }
});

// PUT /api/doctors/:id - Update doctor
router.put('/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findByPk(req.params.id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor no encontrado'
      });
    }

    const { fullName, email, phone, specialty, licenseNumber, schedule, isActive } = req.body;

    // Update doctor with proper null handling for optional fields
    await doctor.update({
      fullName: fullName !== undefined ? fullName : doctor.fullName,
      email: email !== undefined ? (email.trim() === '' ? null : email) : doctor.email,
      phone: phone !== undefined ? (phone.trim() === '' ? null : phone) : doctor.phone,
      specialty: specialty !== undefined ? (specialty.trim() === '' ? null : specialty) : doctor.specialty,
      licenseNumber: licenseNumber !== undefined ? (licenseNumber.trim() === '' ? null : licenseNumber) : doctor.licenseNumber,
      schedule: schedule !== undefined ? (schedule.trim() === '' ? null : schedule) : doctor.schedule,
      isActive: isActive !== undefined ? isActive : doctor.isActive
    });

    res.json({
      success: true,
      message: 'Doctor actualizado exitosamente',
      data: doctor
    });
  } catch (error) {
    console.error('Error updating doctor:', error);

    // Handle unique constraint violations
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'El número de licencia ya está registrado'
      });
    }

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
      message: 'Error al actualizar doctor',
      error: error.message
    });
  }
});

// PATCH /api/doctors/:id/toggle-active - Toggle doctor active status
router.patch('/:id/toggle-active', async (req, res) => {
  try {
    const doctor = await Doctor.findByPk(req.params.id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor no encontrado'
      });
    }

    await doctor.update({
      isActive: !doctor.isActive
    });

    res.json({
      success: true,
      message: `Doctor ${doctor.isActive ? 'activado' : 'desactivado'} exitosamente`,
      data: doctor
    });
  } catch (error) {
    console.error('Error toggling doctor status:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cambiar estado del doctor',
      error: error.message
    });
  }
});

// GET /api/doctors/:id/appointments - Get doctor's appointments
router.get('/:id/appointments', async (req, res) => {
  try {
    const doctor = await Doctor.findByPk(req.params.id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor no encontrado'
      });
    }

    const appointments = await Appointment.findAll({
      where: { doctorId: req.params.id },
      include: [
        {
          model: Patient,
          attributes: ['id', 'fullName', 'phone']
        },
        {
          model: Service,
          attributes: ['id', 'name']
        }
      ],
      order: [['appointmentDate', 'DESC'], ['appointmentTime', 'DESC']],
      limit: 50 // Limit to most recent 50 appointments
    });

    res.json({
      success: true,
      data: appointments
    });
  } catch (error) {
    console.error('Error fetching doctor appointments:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener citas del doctor',
      error: error.message
    });
  }
});

module.exports = router;
