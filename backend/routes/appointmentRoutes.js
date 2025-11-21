const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');

// Models
const {
  Appointment,
  Patient,
  Doctor,
  Service,
  PaymentProof
} = require('../models');

// Middleware
const authenticateToken = require('../middleware/auth');

// Utils
const { sendWhatsAppNotification } = require('../utils/whatsapp');

// ===================================
// GET /api/appointments/pending
// Get all pending appointments (requires authentication)
// ===================================
router.get('/pending', authenticateToken, async (req, res) => {
  try {
    const appointments = await Appointment.findAll({
      where: { status: 'pending' },
      include: [
        {
          model: Patient,
          attributes: ['id', 'fullName', 'phone', 'phoneCountryCode', 'email', 'birthDate', 'gender']
        },
        {
          model: Doctor,
          attributes: ['id', 'fullName', 'specialty']
        },
        {
          model: Service,
          attributes: ['id', 'name', 'price', 'depositAmount']
        },
        {
          model: PaymentProof,
          attributes: ['id', 'filename', 'filepath', 'mimeType', 'uploadedAt']
        }
      ],
      order: [['appointmentDate', 'ASC'], ['appointmentTime', 'ASC']],
      limit: 100
    });

    res.json({
      success: true,
      data: appointments
    });

  } catch (error) {
    console.error('Error fetching pending appointments:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener citas pendientes'
    });
  }
});

// ===================================
// GET /api/appointments
// Get all appointments with filters (requires authentication)
// ===================================
router.get('/', authenticateToken, async (req, res) => {
  try {
    const {
      status,
      startDate,
      endDate,
      patientId,
      doctorId,
      serviceId,
      page = 1,
      limit = 20
    } = req.query;

    // Build where clause
    const where = {};

    if (status) {
      where.status = status;
    }

    if (startDate && endDate) {
      where.appointmentDate = {
        [Op.between]: [startDate, endDate]
      };
    } else if (startDate) {
      where.appointmentDate = {
        [Op.gte]: startDate
      };
    } else if (endDate) {
      where.appointmentDate = {
        [Op.lte]: endDate
      };
    }

    if (patientId) {
      where.patientId = patientId;
    }

    if (doctorId) {
      where.doctorId = doctorId;
    }

    if (serviceId) {
      where.serviceId = serviceId;
    }

    // Pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: appointments } = await Appointment.findAndCountAll({
      where,
      include: [
        {
          model: Patient,
          attributes: ['id', 'fullName', 'phone', 'phoneCountryCode', 'email']
        },
        {
          model: Doctor,
          attributes: ['id', 'fullName', 'specialty']
        },
        {
          model: Service,
          attributes: ['id', 'name', 'price']
        }
      ],
      order: [['appointmentDate', 'DESC'], ['appointmentTime', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    res.json({
      success: true,
      data: {
        appointments,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener citas'
    });
  }
});

// ===================================
// GET /api/appointments/doctor/today
// Get today's appointments for logged-in doctor
// IMPORTANT: This route must come BEFORE /:id to avoid being caught by the param route
// ===================================
router.get('/doctor/today', authenticateToken, async (req, res) => {
  try {
    // Get doctor ID from user
    const doctor = await Doctor.findOne({
      where: { userId: req.userId }
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor no encontrado'
      });
    }

    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayStr = today.toISOString().split('T')[0];

    // Get appointments
    const appointments = await Appointment.findAll({
      where: {
        doctorId: doctor.id,
        appointmentDate: todayStr,
        status: {
          [Op.in]: ['pending', 'confirmed', 'completed']
        }
      },
      include: [
        {
          model: Patient,
          attributes: ['id', 'fullName', 'phone', 'email', 'birthDate', 'gender', 'bloodType', 'allergies', 'notes']
        },
        {
          model: Service,
          attributes: ['id', 'name', 'duration']
        }
      ],
      order: [['appointmentTime', 'ASC']]
    });

    res.json({
      success: true,
      data: appointments
    });
  } catch (error) {
    console.error('Error fetching today appointments:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener citas de hoy'
    });
  }
});

// ===================================
// GET /api/appointments/doctor/all
// Get ALL appointments for logged-in doctor (for "Mis Pacientes" page)
// ===================================
router.get('/doctor/all', authenticateToken, async (req, res) => {
  try {
    // Get doctor ID from user
    const doctor = await Doctor.findOne({
      where: { userId: req.userId }
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor no encontrado'
      });
    }

    // Get ALL appointments for this doctor
    const appointments = await Appointment.findAll({
      where: {
        doctorId: doctor.id,
        status: {
          [Op.in]: ['pending', 'confirmed', 'completed']
        }
      },
      include: [
        {
          model: Patient,
          attributes: ['id', 'fullName', 'phone', 'email', 'birthDate', 'gender', 'bloodType', 'allergies', 'notes']
        },
        {
          model: Service,
          attributes: ['id', 'name', 'duration']
        }
      ],
      order: [['appointmentDate', 'DESC'], ['appointmentTime', 'ASC']]
    });

    res.json({
      success: true,
      data: appointments
    });
  } catch (error) {
    console.error('Error fetching all doctor appointments:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener citas del doctor'
    });
  }
});

// ===================================
// GET /api/appointments/:id
// Get single appointment details (requires authentication)
// ===================================
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findByPk(id, {
      include: [
        {
          model: Patient,
          attributes: ['id', 'fullName', 'phone', 'phoneCountryCode', 'email', 'birthDate', 'gender', 'address']
        },
        {
          model: Doctor,
          attributes: ['id', 'fullName', 'specialty', 'phone', 'email']
        },
        {
          model: Service,
          attributes: ['id', 'name', 'description', 'price', 'depositAmount']
        },
        {
          model: PaymentProof,
          attributes: ['id', 'filename', 'filepath', 'mimeType', 'fileSize', 'uploadedAt']
        }
      ]
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Cita no encontrada'
      });
    }

    res.json({
      success: true,
      data: appointment
    });

  } catch (error) {
    console.error('Error fetching appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener la cita'
    });
  }
});

// ===================================
// PUT /api/appointments/:id/confirm
// Confirm an appointment and send WhatsApp notification
// ===================================
router.put('/:id/confirm', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id; // From auth token

    // Find appointment with related data
    const appointment = await Appointment.findByPk(id, {
      include: [
        {
          model: Patient,
          attributes: ['id', 'fullName', 'phone', 'phoneCountryCode']
        },
        {
          model: Service,
          attributes: ['id', 'name']
        }
      ]
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Cita no encontrada'
      });
    }

    if (appointment.status === 'confirmed') {
      return res.status(400).json({
        success: false,
        message: 'La cita ya está confirmada'
      });
    }

    if (appointment.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'No se puede confirmar una cita cancelada'
      });
    }

    // Update appointment status
    appointment.status = 'confirmed';
    appointment.confirmedBy = userId;
    appointment.confirmedAt = new Date();
    await appointment.save();

    // Update patient as confirmed
    await Patient.update(
      { isActive: true },
      { where: { id: appointment.patientId } }
    );

    // Generate WhatsApp notification
    const whatsappResult = sendWhatsAppNotification(appointment, 'confirmation');

    res.json({
      success: true,
      message: 'Cita confirmada exitosamente',
      data: {
        appointmentId: appointment.id,
        status: appointment.status,
        confirmedAt: appointment.confirmedAt,
        whatsapp: whatsappResult
      }
    });

  } catch (error) {
    console.error('Error confirming appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Error al confirmar la cita'
    });
  }
});

// ===================================
// PUT /api/appointments/:id/cancel
// Cancel an appointment with reason
// ===================================
router.put('/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user.id; // From auth token

    if (!reason || reason.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'El motivo de cancelación es requerido'
      });
    }

    // Find appointment with related data
    const appointment = await Appointment.findByPk(id, {
      include: [
        {
          model: Patient,
          attributes: ['id', 'fullName', 'phone', 'phoneCountryCode']
        },
        {
          model: Service,
          attributes: ['id', 'name']
        }
      ]
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Cita no encontrada'
      });
    }

    if (appointment.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'La cita ya está cancelada'
      });
    }

    if (appointment.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'No se puede cancelar una cita completada'
      });
    }

    // Update appointment status
    appointment.status = 'cancelled';
    appointment.cancellationReason = reason;
    appointment.cancelledBy = userId;
    appointment.cancelledAt = new Date();
    await appointment.save();

    // Generate WhatsApp notification
    const whatsappResult = sendWhatsAppNotification(appointment, 'cancellation');

    res.json({
      success: true,
      message: 'Cita cancelada exitosamente',
      data: {
        appointmentId: appointment.id,
        status: appointment.status,
        cancelledAt: appointment.cancelledAt,
        whatsapp: whatsappResult
      }
    });

  } catch (error) {
    console.error('Error cancelling appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cancelar la cita'
    });
  }
});

// ===================================
// PUT /api/appointments/:id/complete
// Mark appointment as completed
// ===================================
router.put('/:id/complete', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findByPk(id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Cita no encontrada'
      });
    }

    if (appointment.status !== 'confirmed') {
      return res.status(400).json({
        success: false,
        message: 'Solo se pueden marcar como completadas las citas confirmadas'
      });
    }

    appointment.status = 'completed';
    await appointment.save();

    res.json({
      success: true,
      message: 'Cita marcada como completada',
      data: appointment
    });

  } catch (error) {
    console.error('Error completing appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Error al completar la cita'
    });
  }
});

// ===================================
// PUT /api/appointments/:id/medical-notes
// Add/update medical notes for an appointment
// ===================================
router.put('/:id/medical-notes', authenticateToken, async (req, res) => {
  try {
    const { diagnosis, treatment, prescriptions, medicalNotes, status } = req.body;

    const appointment = await Appointment.findByPk(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Cita no encontrada'
      });
    }

    // Update medical notes
    const updateData = {};
    if (diagnosis !== undefined) updateData.diagnosis = diagnosis;
    if (treatment !== undefined) updateData.treatment = treatment;
    if (prescriptions !== undefined) updateData.prescriptions = prescriptions;
    if (medicalNotes !== undefined) updateData.medicalNotes = medicalNotes;
    if (status !== undefined) updateData.status = status;

    await appointment.update(updateData);

    res.json({
      success: true,
      message: 'Notas médicas actualizadas exitosamente',
      data: appointment
    });
  } catch (error) {
    console.error('Error updating medical notes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar notas médicas'
    });
  }
});

// ===================================
// PATCH /api/appointments/:id/complete
// Mark appointment as completed (alternative endpoint for doctors)
// ===================================
router.patch('/:id/complete', authenticateToken, async (req, res) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Cita no encontrada'
      });
    }

    await appointment.update({ status: 'completed' });

    res.json({
      success: true,
      message: 'Cita marcada como completada',
      data: appointment
    });
  } catch (error) {
    console.error('Error completing appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Error al completar la cita'
    });
  }
});

module.exports = router;
