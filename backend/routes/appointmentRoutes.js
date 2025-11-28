const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { Op } = require('sequelize');

// Models
const {
  Appointment,
  AppointmentStateHistory,
  Patient,
  Doctor,
  Service,
  PaymentProof,
  Payment,
  PaymentApprovalLog,
  User
} = require('../models');

// Middleware
const authenticateToken = require('../middleware/auth');

// Utils
const { sendWhatsAppNotification } = require('../utils/whatsapp');
const { generateAppointmentReceiptPDF, generateConsentPDF, generatePaymentReceiptPDF } = require('../utils/pdfGenerator');

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

    // Store previous state for history
    const previousState = appointment.status;

    // Update appointment status
    appointment.status = 'confirmed';
    appointment.confirmedBy = userId;
    appointment.confirmedAt = new Date();
    await appointment.save();

    // Create state history record
    await AppointmentStateHistory.create({
      appointmentId: id,
      previousState: previousState,
      newState: 'confirmed',
      changedBy: userId,
      reason: 'Pago aprobado y cita confirmada',
      timestamp: new Date()
    });

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

    // Store previous state for history
    const previousState = appointment.status;

    // Update appointment status
    appointment.status = 'cancelled';
    appointment.cancellationReason = reason;
    appointment.cancelledBy = userId;
    appointment.cancelledAt = new Date();
    await appointment.save();

    // Create state history record
    await AppointmentStateHistory.create({
      appointmentId: id,
      previousState: previousState,
      newState: 'cancelled',
      changedBy: userId,
      reason: reason,
      timestamp: new Date()
    });

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

// ===================================
// GET /api/appointments/:id/pdf
// Generate and download appointment receipt PDF
// ===================================
router.get('/:id/pdf', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Find appointment with all related data
    const appointment = await Appointment.findByPk(id, {
      include: [
        { model: Patient, attributes: ['id', 'fullName', 'phone', 'email'] },
        { model: Doctor, attributes: ['id', 'fullName', 'specialty'] },
        { model: Service, attributes: ['id', 'name', 'duration'] }
      ]
    });

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Cita no encontrada' });
    }

    // Format date
    const formatDate = (date) => {
      if (!date) return 'N/A';
      return new Date(date).toLocaleDateString('es-MX', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    // Format time
    const formatTime = (time) => {
      if (!time) return 'N/A';
      return time.substring(0, 5);
    };

    // Prepare data for PDF
    const appointmentData = {
      appointmentId: appointment.id,
      status: appointment.status,
      appointmentDate: formatDate(appointment.appointmentDate),
      appointmentTime: formatTime(appointment.appointmentTime),
      serviceName: appointment.Service?.name,
      serviceDuration: appointment.Service?.duration,
      doctorName: appointment.Doctor?.fullName,
      doctorSpecialty: appointment.Doctor?.specialty,
      patientName: appointment.Patient?.fullName,
      patientPhone: appointment.Patient?.phone,
      patientEmail: appointment.Patient?.email
    };

    // Create uploads/pdfs directory if it doesn't exist
    const pdfDir = path.join(__dirname, '../uploads/pdfs');
    if (!fs.existsSync(pdfDir)) {
      fs.mkdirSync(pdfDir, { recursive: true });
    }

    // Generate PDF
    const fileName = `comprobante_cita_${appointment.id}_${Date.now()}.pdf`;
    const outputPath = path.join(pdfDir, fileName);

    await generateAppointmentReceiptPDF(appointmentData, outputPath);

    // Send the PDF file
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    const fileStream = fs.createReadStream(outputPath);
    fileStream.pipe(res);

    // Clean up the file after sending
    fileStream.on('end', () => {
      fs.unlink(outputPath, (err) => {
        if (err) console.error('Error deleting temp PDF:', err);
      });
    });

  } catch (error) {
    console.error('Error generating appointment PDF:', error);
    res.status(500).json({ success: false, message: 'Error al generar el PDF' });
  }
});

// ===================================
// GET /api/appointments/:id/consent-pdf
// Generate and download consent form PDF
// ===================================
router.get('/:id/consent-pdf', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Find appointment with all related data including consent
    const appointment = await Appointment.findByPk(id, {
      include: [
        { model: Patient, attributes: ['id', 'fullName', 'phone', 'email', 'birthDate', 'gender'] },
        { model: Doctor, attributes: ['id', 'fullName', 'specialty'] },
        { model: Service, attributes: ['id', 'name'] },
        {
          model: require('../models').Consent,
          attributes: ['id', 'signatureImageUrl', 'createdAt']
        }
      ]
    });

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Cita no encontrada' });
    }

    // Check if consent exists
    if (!appointment.Consent) {
      return res.status(404).json({ success: false, message: 'No se encontró consentimiento para esta cita' });
    }

    // Format date
    const formatDate = (date) => {
      if (!date) return 'N/A';
      return new Date(date).toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    // Format time
    const formatTime = (time) => {
      if (!time) return 'N/A';
      return time.substring(0, 5);
    };

    // Prepare data for PDF
    const appointmentData = {
      patientName: appointment.Patient?.fullName,
      patientBirthDate: formatDate(appointment.Patient?.birthDate),
      patientGender: appointment.Patient?.gender,
      patientPhone: appointment.Patient?.phone,
      serviceName: appointment.Service?.name,
      appointmentDate: formatDate(appointment.appointmentDate),
      appointmentTime: formatTime(appointment.appointmentTime),
      doctorName: appointment.Doctor?.fullName
    };

    // Create uploads/pdfs directory if it doesn't exist
    const pdfDir = path.join(__dirname, '../uploads/pdfs');
    if (!fs.existsSync(pdfDir)) {
      fs.mkdirSync(pdfDir, { recursive: true });
    }

    // Get signature image path
    const signaturePath = appointment.Consent.signatureImageUrl ?
      path.join(__dirname, '..', appointment.Consent.signatureImageUrl) : null;

    // Generate PDF
    const fileName = `consentimiento_${appointment.id}_${Date.now()}.pdf`;
    const outputPath = path.join(pdfDir, fileName);

    await generateConsentPDF(appointmentData, signaturePath, outputPath);

    // Send the PDF file for inline viewing
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);

    const fileStream = fs.createReadStream(outputPath);
    fileStream.pipe(res);

    // Clean up the file after sending
    fileStream.on('end', () => {
      fs.unlink(outputPath, (err) => {
        if (err) console.error('Error deleting temp PDF:', err);
      });
    });

  } catch (error) {
    console.error('Error generating consent PDF:', error);
    res.status(500).json({ success: false, message: 'Error al generar el PDF del consentimiento' });
  }
});

// ===================================
// GET /api/appointments/:id/payment-receipt-pdf
// Generate and download payment receipt PDF (for SAT/tax declarations)
// ===================================
router.get('/:id/payment-receipt-pdf', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Find appointment with all payment-related data
    const appointment = await Appointment.findByPk(id, {
      include: [
        { model: Patient, attributes: ['id', 'fullName', 'phone', 'email'] },
        { model: Doctor, attributes: ['id', 'fullName', 'specialty'] },
        { model: Service, attributes: ['id', 'name', 'cost'] },
        {
          model: Payment,
          attributes: ['id', 'totalAmount', 'depositAmount', 'remainingBalance', 'status', 'paymentMethod', 'transactionReference']
        }
      ]
    });

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Cita no encontrada' });
    }

    if (!appointment.Payment) {
      return res.status(404).json({ success: false, message: 'No se encontró información de pago para esta cita' });
    }

    if (appointment.Payment.status !== 'approved') {
      return res.status(400).json({ success: false, message: 'El pago debe estar aprobado para generar el recibo' });
    }

    // Calculate total paid (total - remaining balance)
    const totalPaid = parseFloat(appointment.Payment.totalAmount) - parseFloat(appointment.Payment.remainingBalance);
    const balancePaid = parseFloat(appointment.Payment.totalAmount) - parseFloat(appointment.Payment.depositAmount);

    // Prepare payment data for PDF
    const paymentData = {
      // Receipt info
      paymentId: appointment.Payment.id,
      receiptNumber: `REC-${appointment.id}-${Date.now()}`,
      receiptDate: new Date().toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),

      // Patient info
      patientName: appointment.Patient?.fullName || 'N/A',
      patientEmail: appointment.Patient?.email || null,
      patientPhone: appointment.Patient?.phone || null,
      patientRFC: appointment.Patient?.rfc || null,

      // Service info
      serviceName: appointment.Service?.name || 'N/A',
      doctorName: appointment.Doctor?.fullName || 'N/A',
      appointmentDate: new Date(appointment.appointmentDate).toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      appointmentTime: appointment.appointmentTime,

      // Payment breakdown
      totalAmount: appointment.Payment.totalAmount,
      depositAmount: appointment.Payment.depositAmount,
      balancePaid: balancePaid > 0 ? balancePaid : 0,
      totalPaid: totalPaid,

      // Payment method
      paymentMethod: appointment.Payment.paymentMethod || 'cash',
      paymentReference: appointment.Payment.transactionReference || null
    };

    // Generate PDF
    const pdfDir = path.join(__dirname, '../uploads/pdfs');
    if (!fs.existsSync(pdfDir)) {
      fs.mkdirSync(pdfDir, { recursive: true });
    }

    const fileName = `recibo_pago_${appointment.id}_${Date.now()}.pdf`;
    const outputPath = path.join(pdfDir, fileName);

    await generatePaymentReceiptPDF(paymentData, outputPath);

    // Send the PDF file for inline viewing
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);

    const fileStream = fs.createReadStream(outputPath);
    fileStream.pipe(res);

    // Clean up temp file after sending
    fileStream.on('end', () => {
      fs.unlink(outputPath, (err) => {
        if (err) console.error('Error deleting temp PDF:', err);
      });
    });

  } catch (error) {
    console.error('Error generating payment receipt PDF:', error);
    res.status(500).json({ success: false, message: 'Error al generar el recibo de pago', error: error.message });
  }
});

// ===================================
// GET /api/appointments/reminders
// Get appointments that need attention (upcoming, late, etc.)
// For reception dashboard reminder system
// ===================================
router.get('/reminders', authenticateToken, async (req, res) => {
  try {
    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];

    // Current time in HH:MM:SS format
    const currentTime = now.toTimeString().split(' ')[0];

    // Time 15 minutes from now
    const fifteenMinsFromNow = new Date(now.getTime() + 15 * 60000);
    const fifteenMinsTime = fifteenMinsFromNow.toTimeString().split(' ')[0];

    // Get today's confirmed appointments
    const appointments = await Appointment.findAll({
      where: {
        appointmentDate: todayStr,
        status: {
          [Op.in]: ['confirmed', 'in_progress']
        }
      },
      include: [
        {
          model: Patient,
          attributes: ['id', 'fullName', 'phone', 'phoneCountryCode']
        },
        {
          model: Doctor,
          attributes: ['id', 'fullName']
        },
        {
          model: Service,
          attributes: ['id', 'name', 'duration']
        },
        {
          model: Payment,
          attributes: ['id', 'totalAmount', 'depositAmount', 'remainingBalance', 'status']
        }
      ],
      order: [['appointmentTime', 'ASC']]
    });

    // Categorize appointments
    const reminders = {
      upcoming: [], // 15 mins or less until appointment
      atTime: [], // At appointment time (within 5 min window)
      late: [], // Past appointment time, patient hasn't arrived
      inProgress: [], // Currently in consultation
      needsPayment: [] // Completed but has remaining balance
    };

    appointments.forEach(apt => {
      const aptTime = apt.appointmentTime;
      const aptDateTime = new Date(`${todayStr}T${aptTime}`);
      const timeDiff = (aptDateTime - now) / 60000; // Difference in minutes

      if (apt.status === 'in_progress') {
        reminders.inProgress.push({
          ...apt.toJSON(),
          reminderType: 'in_progress',
          message: `${apt.Patient.fullName} está en consulta`
        });
      } else if (timeDiff <= 15 && timeDiff > 5) {
        reminders.upcoming.push({
          ...apt.toJSON(),
          reminderType: 'upcoming',
          message: `${apt.Patient.fullName} llega en ${Math.round(timeDiff)} minutos`
        });
      } else if (timeDiff <= 5 && timeDiff >= -5) {
        reminders.atTime.push({
          ...apt.toJSON(),
          reminderType: 'at_time',
          message: `${apt.Patient.fullName} debe llegar ahora`
        });
      } else if (timeDiff < -5) {
        reminders.late.push({
          ...apt.toJSON(),
          reminderType: 'late',
          message: `${apt.Patient.fullName} lleva ${Math.abs(Math.round(timeDiff))} minutos de retraso`
        });
      }
    });

    // Get completed appointments with remaining balance
    const completedWithBalance = await Appointment.findAll({
      where: {
        appointmentDate: todayStr,
        status: 'completed'
      },
      include: [
        {
          model: Patient,
          attributes: ['id', 'fullName', 'phone']
        },
        {
          model: Payment,
          where: {
            remainingBalance: {
              [Op.gt]: 0
            }
          },
          attributes: ['id', 'remainingBalance']
        }
      ]
    });

    completedWithBalance.forEach(apt => {
      reminders.needsPayment.push({
        ...apt.toJSON(),
        reminderType: 'needs_payment',
        message: `${apt.Patient.fullName} debe $${apt.Payment.remainingBalance}`
      });
    });

    res.json({
      success: true,
      data: reminders,
      summary: {
        totalReminders: reminders.upcoming.length + reminders.atTime.length +
                       reminders.late.length + reminders.inProgress.length +
                       reminders.needsPayment.length,
        upcoming: reminders.upcoming.length,
        atTime: reminders.atTime.length,
        late: reminders.late.length,
        inProgress: reminders.inProgress.length,
        needsPayment: reminders.needsPayment.length
      }
    });

  } catch (error) {
    console.error('Error fetching appointment reminders:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener recordatorios'
    });
  }
});

// ===================================
// PATCH /api/appointments/:id/change-state
// Universal endpoint for changing appointment state
// Creates audit trail and updates relevant timestamps
// ===================================
router.patch('/:id/change-state', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { newState, reason, metadata } = req.body;
    const userId = req.user.id;

    // Validate new state
    const validStates = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no-show'];
    if (!validStates.includes(newState)) {
      return res.status(400).json({
        success: false,
        message: `Estado inválido. Debe ser uno de: ${validStates.join(', ')}`
      });
    }

    // Find appointment
    const appointment = await Appointment.findByPk(id, {
      include: [
        { model: Patient, attributes: ['id', 'fullName', 'phone', 'phoneCountryCode'] },
        { model: Doctor, attributes: ['id', 'fullName'] },
        { model: Service, attributes: ['id', 'name'] }
      ]
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Cita no encontrada'
      });
    }

    const previousState = appointment.status;

    // Don't allow changing if already in the same state (unless providing a reason for correction)
    if (previousState === newState && !reason) {
      return res.status(400).json({
        success: false,
        message: 'La cita ya está en ese estado'
      });
    }

    // Prepare update data
    const updateData = {
      status: newState,
      stateChangedAt: new Date(),
      stateChangedBy: userId,
      stateChangeReason: reason || null
    };

    // Update specific audit fields based on new state
    if (newState === 'confirmed') {
      updateData.confirmedBy = userId;
      updateData.confirmedAt = new Date();
    } else if (newState === 'in_progress') {
      updateData.enteredConsultationAt = new Date();
      updateData.enteredConsultationBy = userId;
      // Also mark as arrived if not already
      if (!appointment.arrivedAt) {
        updateData.arrivedAt = new Date();
        updateData.arrivedMarkedBy = userId;
      }
    } else if (newState === 'completed') {
      updateData.completedAt = new Date();
      updateData.completedBy = userId;
    } else if (newState === 'cancelled') {
      updateData.cancelledBy = userId;
      updateData.cancelledAt = new Date();
      updateData.cancellationReason = reason || 'Sin motivo especificado';
    }

    // Update appointment
    await appointment.update(updateData);

    // Create audit trail entry
    await AppointmentStateHistory.create({
      appointmentId: id,
      previousState,
      newState,
      changedBy: userId,
      reason: reason || null,
      metadata: metadata || null,
      timestamp: new Date()
    });

    // Send WhatsApp notification for certain state changes
    if (newState === 'confirmed') {
      sendWhatsAppNotification(appointment, 'confirmation');
    } else if (newState === 'cancelled') {
      sendWhatsAppNotification(appointment, 'cancellation');
    }

    res.json({
      success: true,
      message: `Estado cambiado de "${previousState}" a "${newState}"`,
      data: {
        appointmentId: appointment.id,
        previousState,
        newState,
        changedAt: updateData.stateChangedAt,
        changedBy: userId
      }
    });

  } catch (error) {
    console.error('Error changing appointment state:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cambiar el estado de la cita'
    });
  }
});

// ===================================
// PATCH /api/appointments/:id/mark-arrived
// Quick action: Mark patient as arrived (but not yet in consultation)
// ===================================
router.patch('/:id/mark-arrived', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

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
        message: 'Solo se pueden marcar como llegado las citas confirmadas'
      });
    }

    // Update arrival time
    await appointment.update({
      arrivedAt: new Date(),
      arrivedMarkedBy: userId
    });

    res.json({
      success: true,
      message: 'Paciente marcado como llegado',
      data: {
        appointmentId: appointment.id,
        arrivedAt: appointment.arrivedAt
      }
    });

  } catch (error) {
    console.error('Error marking patient as arrived:', error);
    res.status(500).json({
      success: false,
      message: 'Error al marcar llegada del paciente'
    });
  }
});

// ===================================
// PATCH /api/appointments/:id/record-balance
// Record remaining balance payment for an appointment
// ===================================
router.patch('/:id/record-balance', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { amountPaid, paymentMethod, notes } = req.body;
    const userId = req.userId;

    // Find appointment's payment
    const payment = await Payment.findOne({
      where: { appointmentId: id }
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Pago no encontrado para esta cita'
      });
    }

    if (payment.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Solo se puede registrar balance en pagos aprobados'
      });
    }

    if (payment.remainingBalance === 0) {
      return res.status(400).json({
        success: false,
        message: 'Este pago ya está completamente pagado'
      });
    }

    if (parseFloat(amountPaid) > parseFloat(payment.remainingBalance)) {
      return res.status(400).json({
        success: false,
        message: 'El monto pagado excede el saldo pendiente'
      });
    }

    // Update remaining balance
    const newBalance = parseFloat(payment.remainingBalance) - parseFloat(amountPaid);

    await payment.update({
      remainingBalance: newBalance,
      notes: notes ? `${payment.notes || ''}\n${notes}` : payment.notes
    });

    // Log the balance payment
    await PaymentApprovalLog.create({
      paymentId: payment.id,
      action: 'updated',
      userId,
      notes: `Balance pagado: $${amountPaid} (${paymentMethod}). Saldo restante: $${newBalance}`,
      metadata: {
        amountPaid: parseFloat(amountPaid),
        paymentMethod,
        previousBalance: parseFloat(payment.remainingBalance),
        newBalance
      },
      timestamp: new Date()
    });

    res.json({
      success: true,
      message: 'Balance registrado exitosamente',
      data: payment
    });
  } catch (error) {
    console.error('Error recording balance:', error);
    res.status(500).json({
      success: false,
      message: 'Error al registrar el balance',
      error: error.message
    });
  }
});

// ===================================
// GET /api/appointments/:id/history
// Get state change history for an appointment
// ===================================
router.get('/:id/history', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if appointment exists
    const appointment = await Appointment.findByPk(id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Cita no encontrada'
      });
    }

    // Get state history
    const history = await AppointmentStateHistory.findAll({
      where: { appointmentId: id },
      include: [
        {
          model: User,
          as: 'changer',
          attributes: ['id', 'fullName', 'username', 'role']
        }
      ],
      order: [['timestamp', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        appointmentId: id,
        currentState: appointment.status,
        history
      }
    });

  } catch (error) {
    console.error('Error fetching appointment history:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener el historial de la cita'
    });
  }
});

module.exports = router;
