const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { Op } = require('sequelize');
const sequelize = require('../config/db');

// Models
const {
  Service,
  Doctor,
  Patient,
  Appointment,
  AppointmentHold,
  PaymentProof,
  PaymentConfig,
  BlockedDate
} = require('../models');

// Middleware
const { validateStep1 } = require('../middleware/validation');
const { uploadPaymentProof } = require('../middleware/upload');

// Utils
const { getAvailableSlots, isSlotAvailable } = require('../utils/slotAvailability');

// ===================================
// GET /api/public/services
// Get all active services
// ===================================
router.get('/services', async (req, res) => {
  try {
    const services = await Service.findAll({
      where: { isActive: true },
      attributes: ['id', 'name', 'description', 'price', 'depositPercentage', 'depositAmount', 'duration'],
      order: [['name', 'ASC']]
    });

    res.json({
      success: true,
      data: services
    });
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener servicios'
    });
  }
});

// ===================================
// GET /api/public/blocked-dates
// Get all blocked dates (for calendar)
// ===================================
router.get('/blocked-dates', async (req, res) => {
  try {
    const blockedDates = await BlockedDate.findAll({
      where: { isActive: true },
      attributes: ['date', 'reason'],
      order: [['date', 'ASC']]
    });

    // Return array of date strings
    const dates = blockedDates.map(bd => bd.date);

    res.json({
      success: true,
      data: dates
    });
  } catch (error) {
    console.error('Error fetching blocked dates:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener fechas bloqueadas'
    });
  }
});

// ===================================
// GET /api/public/available-slots
// Get available time slots for a service/date
// ===================================
router.get('/available-slots', async (req, res) => {
  try {
    const { serviceId, date } = req.query;

    if (!serviceId || !date) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere serviceId y date'
      });
    }

    const result = await getAvailableSlots(parseInt(serviceId), date);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json({
      success: true,
      data: result.slots
    });

  } catch (error) {
    console.error('Error fetching available slots:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener horarios disponibles'
    });
  }
});

// ===================================
// POST /api/public/booking/step1
// Validate form data and create temporary hold
// ===================================
router.post('/booking/step1', validateStep1, async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const {
      bookingForSelf,
      patientName,
      patientBirthDate,
      patientGender,
      patientPhone,
      patientPhoneCountryCode = '+52',
      patientEmail,
      bookerName,
      bookerPhone,
      bookerPhoneCountryCode = '+52',
      bookerEmail,
      bookerRelationship,
      serviceId,
      appointmentDate,
      appointmentTime,
      isFirstVisit
    } = req.body;

    // Find service and associated doctor
    const service = await Service.findByPk(serviceId);
    if (!service) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: 'Servicio no encontrado'
      });
    }

    // Find a doctor for this service (get the first one with active schedule)
    const doctor = await Doctor.findOne({
      where: { specialty: service.name, isActive: true }
    });

    if (!doctor) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: 'No hay doctor disponible para este servicio'
      });
    }

    // Check if slot is still available
    const slotAvailable = await isSlotAvailable(
      serviceId,
      doctor.id,
      appointmentDate,
      appointmentTime
    );

    if (!slotAvailable) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'El horario seleccionado ya no está disponible'
      });
    }

    // Generate unique payment reference
    const paymentConfig = await PaymentConfig.findOne({
      where: { isActive: true }
    });
    const referencePrefix = paymentConfig?.referencePrefix || 'PROPIEL';
    const paymentReference = `${referencePrefix}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

    // Create temporary hold (expires in 10 minutes)
    const holdToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const hold = await AppointmentHold.create({
      holdToken,
      doctorId: doctor.id,
      serviceId,
      appointmentDate,
      appointmentTime,
      expiresAt,
      sessionInfo: bookingForSelf ? patientPhone : bookerPhone,
      paymentReference
    }, { transaction: t });

    await t.commit();

    // Return hold token and summary data
    res.json({
      success: true,
      message: 'Datos validados correctamente. Horario reservado temporalmente.',
      data: {
        holdToken,
        expiresAt,
        paymentReference,
        summary: {
          bookingForSelf,
          patientName,
          patientBirthDate,
          patientGender,
          patientPhone: patientPhone || null,
          patientEmail: patientEmail || null,
          bookerName: bookingForSelf ? null : bookerName,
          bookerPhone: bookingForSelf ? null : bookerPhone,
          bookerEmail: bookingForSelf ? null : bookerEmail,
          bookerRelationship: bookingForSelf ? null : bookerRelationship,
          serviceName: service.name,
          servicePrice: service.price,
          depositAmount: service.depositAmount,
          appointmentDate,
          appointmentTime,
          isFirstVisit,
          doctorName: doctor.fullName,
          paymentReference
        }
      }
    });

  } catch (error) {
    await t.rollback();
    console.error('Error in booking step 1:', error);
    res.status(500).json({
      success: false,
      message: 'Error al procesar la reserva'
    });
  }
});

// ===================================
// GET /api/public/payment-config
// Get bank payment configuration
// ===================================
router.get('/payment-config', async (req, res) => {
  try {
    const config = await PaymentConfig.findOne({
      where: { isActive: true },
      attributes: ['bankName', 'accountHolder', 'accountNumber', 'clabe', 'referencePrefix']
    });

    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'Configuración de pago no encontrada'
      });
    }

    // Generate unique payment reference
    const reference = `${config.referencePrefix}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

    res.json({
      success: true,
      data: {
        ...config.toJSON(),
        reference
      }
    });

  } catch (error) {
    console.error('Error fetching payment config:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener configuración de pago'
    });
  }
});

// ===================================
// POST /api/public/booking/step3
// Upload payment proof and create appointment + patient
// ===================================
router.post('/booking/step3', uploadPaymentProof, async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { holdToken, bookingData } = req.body;

    // Parse bookingData (sent as JSON string in FormData)
    const data = typeof bookingData === 'string' ? JSON.parse(bookingData) : bookingData;

    // Validate file upload
    if (!req.file) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'El comprobante de pago es requerido'
      });
    }

    // Find and validate hold
    const hold = await AppointmentHold.findOne({
      where: { holdToken },
      lock: t.LOCK.UPDATE,
      transaction: t
    });

    if (!hold) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: 'Reserva no encontrada o expirada'
      });
    }

    // Check if hold is expired
    if (new Date() > hold.expiresAt) {
      await hold.destroy({ transaction: t });
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'La reserva ha expirado. Por favor intenta nuevamente.'
      });
    }

    // Double-check slot is still available (excluding current user's hold)
    const slotStillAvailable = await isSlotAvailable(
      hold.serviceId,
      hold.doctorId,
      hold.appointmentDate,
      hold.appointmentTime,
      holdToken  // Exclude current user's hold
    );

    if (!slotStillAvailable) {
      await hold.destroy({ transaction: t });
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'El horario ya no está disponible'
      });
    }

    // Check if patient already exists (by phone)
    // If booking for self: use patient's phone
    // If booking for someone else: use booker's phone as contact
    const phoneToCheck = data.bookingForSelf ? data.patientPhone : data.bookerPhone;
    const phoneCountryCode = data.bookingForSelf ? (data.patientPhoneCountryCode || '+52') : (data.bookerPhoneCountryCode || '+52');
    let patient = null;

    if (phoneToCheck) {
      patient = await Patient.findOne({
        where: { phone: phoneToCheck },
        transaction: t
      });
    }

    // Create patient if doesn't exist
    if (!patient) {
      patient = await Patient.create({
        fullName: data.patientName,
        birthDate: data.patientBirthDate,
        gender: data.patientGender,
        phone: phoneToCheck,
        phoneCountryCode: phoneCountryCode,
        email: data.patientEmail || null,
        isActive: true
      }, { transaction: t });
    }

    // Create appointment
    const appointment = await Appointment.create({
      patientId: patient.id,
      doctorId: hold.doctorId,
      serviceId: hold.serviceId,
      appointmentDate: hold.appointmentDate,
      appointmentTime: hold.appointmentTime,
      status: 'pending',
      isFirstVisit: data.isFirstVisit !== undefined ? data.isFirstVisit : true,
      bookedByName: data.bookingForSelf ? null : data.bookerName,
      bookedByPhone: data.bookingForSelf ? null : data.bookerPhone,
      bookedByEmail: data.bookingForSelf ? null : data.bookerEmail,
      bookedByRelationship: data.bookingForSelf ? null : data.bookerRelationship,
      paymentReference: hold.paymentReference
    }, { transaction: t });

    // Save payment proof
    await PaymentProof.create({
      appointmentId: appointment.id,
      filename: req.file.originalname,
      filepath: req.file.path,
      mimeType: req.file.mimetype,
      fileSize: req.file.size,
      uploadedAt: new Date()
    }, { transaction: t });

    // Delete the hold
    await hold.destroy({ transaction: t });

    await t.commit();

    res.json({
      success: true,
      message: 'Cita creada exitosamente. Pendiente de confirmación.',
      data: {
        appointmentId: appointment.id,
        patientId: patient.id,
        status: 'pending'
      }
    });

  } catch (error) {
    await t.rollback();
    console.error('Error in booking step 3:', error);
    res.status(500).json({
      success: false,
      message: 'Error al procesar el pago: ' + error.message
    });
  }
});

// ===================================
// DELETE /api/public/booking/release-hold
// Release a temporary appointment hold when user goes back
// ===================================
router.delete('/booking/release-hold/:holdToken', async (req, res) => {
  try {
    const { holdToken } = req.params;

    if (!holdToken) {
      return res.status(400).json({
        success: false,
        message: 'Hold token es requerido'
      });
    }

    // Find and delete the hold
    const hold = await AppointmentHold.findOne({
      where: { holdToken }
    });

    if (!hold) {
      // Hold doesn't exist (maybe already expired/deleted) - not an error
      return res.json({
        success: true,
        message: 'Hold no encontrado (probablemente ya expiró)'
      });
    }

    await hold.destroy();

    res.json({
      success: true,
      message: 'Hold liberado exitosamente'
    });

  } catch (error) {
    console.error('Error releasing hold:', error);
    res.status(500).json({
      success: false,
      message: 'Error al liberar la reserva'
    });
  }
});

// ===================================
// POST /api/public/booking/step4
// Save digital consent (for services that require it)
// ===================================
router.post('/booking/step4', async (req, res) => {
  const fs = require('fs');
  const path = require('path');
  const { generateConsentPDF } = require('../utils/pdfGenerator');

  try {
    const { appointmentId, signatureDataURL } = req.body;

    if (!appointmentId || !signatureDataURL) {
      return res.status(400).json({
        success: false,
        message: 'appointmentId y signatureDataURL son requeridos'
      });
    }

    // Validate signature data URL format
    if (!signatureDataURL.startsWith('data:image/png;base64,')) {
      return res.status(400).json({
        success: false,
        message: 'Formato de firma inválido'
      });
    }

    // Find appointment with related data
    const appointment = await Appointment.findByPk(appointmentId, {
      include: [
        {
          model: Patient,
          attributes: ['id', 'fullName', 'birthDate', 'gender', 'phone']
        },
        {
          model: Service,
          attributes: ['id', 'name', 'price']
        },
        {
          model: Doctor,
          attributes: ['id', 'fullName']
        }
      ]
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Cita no encontrada'
      });
    }

    // Extract base64 data from data URL
    const base64Data = signatureDataURL.replace(/^data:image\/png;base64,/, '');
    const signatureBuffer = Buffer.from(base64Data, 'base64');

    // Save signature image to file
    const timestamp = Date.now();
    const signatureFilename = `signature_${appointmentId}_${timestamp}.png`;
    const signaturePath = path.join(__dirname, '../uploads/signatures', signatureFilename);

    // Ensure signatures directory exists
    const signaturesDir = path.join(__dirname, '../uploads/signatures');
    if (!fs.existsSync(signaturesDir)) {
      fs.mkdirSync(signaturesDir, { recursive: true });
    }

    fs.writeFileSync(signaturePath, signatureBuffer);

    // Prepare appointment data for PDF
    const appointmentData = {
      patientName: appointment.Patient.fullName,
      patientBirthDate: appointment.Patient.birthDate,
      patientGender: appointment.Patient.gender,
      patientPhone: appointment.Patient.phone,
      serviceName: appointment.Service.name,
      appointmentDate: appointment.appointmentDate,
      appointmentTime: appointment.appointmentTime,
      doctorName: appointment.Doctor.fullName
    };

    // Generate PDF filename and path
    const pdfFilename = `consent_${appointmentId}_${timestamp}.pdf`;
    const pdfPath = path.join(__dirname, '../uploads/consents', pdfFilename);

    // Ensure consents directory exists
    const consentsDir = path.join(__dirname, '../uploads/consents');
    if (!fs.existsSync(consentsDir)) {
      fs.mkdirSync(consentsDir, { recursive: true });
    }

    // Generate PDF with signature
    await generateConsentPDF(appointmentData, signaturePath, pdfPath);

    // Update appointment with consent PDF path
    const relativePath = `consents/${pdfFilename}`;
    appointment.consentPdfPath = relativePath;
    appointment.consentSignedAt = new Date();
    await appointment.save();

    res.json({
      success: true,
      message: 'Consentimiento guardado exitosamente',
      data: {
        appointmentId: appointment.id,
        consentSaved: true,
        pdfPath: appointment.consentPdfPath
      }
    });

  } catch (error) {
    console.error('Error saving consent:', error);
    res.status(500).json({
      success: false,
      message: 'Error al guardar el consentimiento: ' + error.message
    });
  }
});

module.exports = router;
