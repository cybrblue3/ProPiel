const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const crypto = require('crypto');
const sequelize = require('../config/db');
const { Appointment, Patient, Doctor, Service, Payment, PaymentProof, User, PaymentConfig, BlockedDate, Consent, AppointmentStateHistory } = require('../models');
const auth = require('../middleware/auth');
const { sendWhatsAppNotification } = require('../utils/whatsapp');
const { uploadAdminPaymentProof } = require('../middleware/upload');

// Middleware to check admin role (admin or superadmin)
const adminOnly = (req, res, next) => {
  if (req.userRole !== 'admin' && req.userRole !== 'superadmin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin role required.'
    });
  }
  next();
};

// Apply auth middleware to all admin routes
router.use(auth);
router.use(adminOnly);

// ===================================
// GET /api/admin/appointments
// Get all appointments with filters
// ===================================
router.get('/appointments', async (req, res) => {
  try {
    const { status, date, startDate, endDate, search, specialty, page = 1, limit = 50 } = req.query;

    // Build where clause
    const where = {};

    if (status) {
      // Support multiple statuses separated by comma
      if (status.includes(',')) {
        const statuses = status.split(',').map(s => s.trim());
        where.status = { [Op.in]: statuses };
      } else {
        where.status = status;
      }
    }

    if (date) {
      where.appointmentDate = date;
    } else if (startDate || endDate) {
      where.appointmentDate = {};
      if (startDate) where.appointmentDate[Op.gte] = startDate;
      if (endDate) where.appointmentDate[Op.lte] = endDate;
    }

    // Add specialty filter if provided
    if (specialty) {
      where['$Service.name$'] = specialty;
    }

    // Add search filter if provided
    if (search) {
      where[Op.or] = [
        { '$Patient.fullName$': { [Op.like]: `%${search}%` } },
        { '$Patient.phone$': { [Op.like]: `%${search}%` } },
        { '$Doctor.fullName$': { [Op.like]: `%${search}%` } },
        { '$Service.name$': { [Op.like]: `%${search}%` } }
      ];
    }

    const offset = (page - 1) * limit;

    const { count, rows: appointments } = await Appointment.findAndCountAll({
      where,
      include: [
        {
          model: Patient,
          attributes: ['id', 'fullName', 'phone', 'email', 'birthDate', 'gender']
        },
        {
          model: Doctor,
          attributes: ['id', 'fullName', 'specialty']
        },
        {
          model: Service,
          attributes: ['id', 'name', 'price', 'depositAmount', 'depositPercentage', 'duration']
        },
        {
          model: PaymentProof,
          attributes: ['id', 'filename', 'filepath', 'uploadedAt']
        },
        {
          model: Payment,
          attributes: ['id', 'totalAmount', 'depositAmount', 'remainingBalance', 'status', 'paymentMethod', 'transactionReference']
        },
        {
          model: Consent,
          attributes: ['id', 'signatureImageUrl', 'createdAt']
        }
      ],
      order: [['appointmentDate', 'DESC'], ['appointmentTime', 'DESC']],
      limit: parseInt(limit),
      offset,
      distinct: true,
      subQuery: false
    });

    res.json({
      success: true,
      data: {
        appointments,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener citas',
      error: error.message
    });
  }
});

// ===================================
// GET /api/admin/appointments/pending
// Get pending appointments (awaiting approval)
// ===================================
router.get('/appointments/pending', async (req, res) => {
  try {
    const appointments = await Appointment.findAll({
      where: { status: 'pending' },
      include: [
        {
          model: Patient,
          attributes: ['id', 'fullName', 'phone', 'email', 'birthDate', 'gender']
        },
        {
          model: Doctor,
          attributes: ['id', 'fullName', 'specialty']
        },
        {
          model: Service,
          attributes: ['id', 'name', 'price', 'depositAmount', 'depositPercentage', 'duration']
        },
        {
          model: PaymentProof,
          attributes: ['id', 'filename', 'filepath', 'uploadedAt']
        },
        {
          model: Payment,
          attributes: ['id', 'totalAmount', 'depositAmount', 'remainingBalance', 'status', 'paymentMethod', 'transactionReference']
        },
        {
          model: Consent,
          attributes: ['id', 'signatureImageUrl', 'createdAt']
        }
      ],
      order: [['createdAt', 'ASC']] // Oldest first
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
// GET /api/admin/appointments/:id
// Get single appointment details
// ===================================
router.get('/appointments/:id', async (req, res) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id, {
      include: [
        {
          model: Patient,
          attributes: ['id', 'fullName', 'phone', 'phoneCountryCode', 'email', 'birthDate', 'gender']
        },
        {
          model: Doctor,
          attributes: ['id', 'fullName', 'specialty', 'phone']
        },
        {
          model: Service,
          attributes: ['id', 'name', 'price', 'depositAmount', 'depositPercentage', 'duration']
        },
        {
          model: PaymentProof,
          attributes: ['id', 'filename', 'filepath', 'mimeType', 'fileSize', 'uploadedAt']
        },
        {
          model: Payment,
          attributes: ['id', 'totalAmount', 'depositAmount', 'remainingBalance', 'status', 'paymentMethod', 'transactionReference']
        },
        {
          model: Consent,
          attributes: ['id', 'signatureImageUrl', 'createdAt']
        },
        {
          model: User,
          as: 'confirmer',
          attributes: ['id', 'fullName', 'username']
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
      message: 'Error al obtener cita'
    });
  }
});

// ===================================
// PATCH /api/admin/appointments/:id/confirm
// Confirm/approve appointment
// ===================================
router.patch('/appointments/:id/confirm', async (req, res) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Cita no encontrada'
      });
    }

    if (appointment.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Solo se pueden confirmar citas pendientes'
      });
    }

    // Store previous state for history
    const previousState = appointment.status;

    await appointment.update({
      status: 'confirmed',
      confirmedBy: req.userId,
      confirmedAt: new Date()
    });

    // Create state history record
    await AppointmentStateHistory.create({
      appointmentId: appointment.id,
      previousState: previousState,
      newState: 'confirmed',
      changedBy: req.userId,
      reason: 'Pago aprobado y cita confirmada',
      timestamp: new Date()
    });

    // Reload with associations for WhatsApp notification
    await appointment.reload({
      include: [
        { model: Patient, attributes: ['fullName', 'phone', 'phoneCountryCode'] },
        { model: Service, attributes: ['name'] }
      ]
    });

    // Generate WhatsApp notification
    const whatsappNotification = sendWhatsAppNotification(appointment, 'confirmation');

    res.json({
      success: true,
      message: 'Cita confirmada exitosamente',
      data: appointment,
      whatsapp: whatsappNotification
    });
  } catch (error) {
    console.error('Error confirming appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Error al confirmar cita'
    });
  }
});

// ===================================
// PATCH /api/admin/appointments/:id/cancel
// Cancel appointment
// ===================================
router.patch('/appointments/:id/cancel', async (req, res) => {
  try {
    const { cancellationReason } = req.body;

    const appointment = await Appointment.findByPk(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Cita no encontrada'
      });
    }

    if (appointment.status === 'cancelled' || appointment.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'No se puede cancelar esta cita'
      });
    }

    // Store previous state for history
    const previousState = appointment.status;

    await appointment.update({
      status: 'cancelled',
      cancellationReason: cancellationReason || 'Cancelada por administrador',
      cancelledBy: req.userId,
      cancelledAt: new Date()
    });

    // Create state history record
    await AppointmentStateHistory.create({
      appointmentId: appointment.id,
      previousState: previousState,
      newState: 'cancelled',
      changedBy: req.userId,
      reason: cancellationReason || 'Cancelada por administrador',
      timestamp: new Date()
    });

    // Reload with associations for WhatsApp notification
    await appointment.reload({
      include: [
        { model: Patient, attributes: ['fullName', 'phone', 'phoneCountryCode'] },
        { model: Service, attributes: ['name'] }
      ]
    });

    // Generate WhatsApp notification
    const whatsappNotification = sendWhatsAppNotification(appointment, 'cancellation');

    res.json({
      success: true,
      message: 'Cita cancelada exitosamente',
      data: appointment,
      whatsapp: whatsappNotification
    });
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cancelar cita'
    });
  }
});

// ===================================
// GET /api/admin/stats
// Get dashboard statistics
// ===================================
router.get('/stats', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      pendingCount,
      todayCount,
      confirmedCount,
      totalCount
    ] = await Promise.all([
      Appointment.count({ where: { status: 'pending' } }),
      Appointment.count({
        where: {
          appointmentDate: today.toISOString().split('T')[0]
        }
      }),
      Appointment.count({ where: { status: 'confirmed' } }),
      Appointment.count()
    ]);

    res.json({
      success: true,
      data: {
        pending: pendingCount,
        today: todayCount,
        confirmed: confirmedCount,
        total: totalCount
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas'
    });
  }
});

// ===================================
// Blocked Dates Management
// ===================================

// GET /api/admin/blocked-dates
router.get('/blocked-dates', async (req, res) => {
  try {
    const { BlockedDate } = require('../models');
    const blockedDates = await BlockedDate.findAll({
      order: [['date', 'ASC']]
    });

    res.json({
      success: true,
      data: blockedDates
    });
  } catch (error) {
    console.error('Error fetching blocked dates:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener fechas bloqueadas'
    });
  }
});

// POST /api/admin/blocked-dates
router.post('/blocked-dates', async (req, res) => {
  try {
    const { BlockedDate } = require('../models');
    const { date, reason } = req.body;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'La fecha es requerida'
      });
    }

    // Check if date already exists
    const existingDate = await BlockedDate.findOne({ where: { date } });
    if (existingDate) {
      return res.status(400).json({
        success: false,
        message: 'Esta fecha ya está bloqueada'
      });
    }

    const blockedDate = await BlockedDate.create({
      date,
      reason: reason || null,
      isActive: true
    });

    res.status(201).json({
      success: true,
      message: 'Fecha bloqueada agregada exitosamente',
      data: blockedDate
    });
  } catch (error) {
    console.error('Error creating blocked date:', error);
    res.status(500).json({
      success: false,
      message: 'Error al agregar fecha bloqueada'
    });
  }
});

// DELETE /api/admin/blocked-dates/:id
router.delete('/blocked-dates/:id', async (req, res) => {
  try {
    const { BlockedDate } = require('../models');
    const blockedDate = await BlockedDate.findByPk(req.params.id);

    if (!blockedDate) {
      return res.status(404).json({
        success: false,
        message: 'Fecha bloqueada no encontrada'
      });
    }

    await blockedDate.destroy();

    res.json({
      success: true,
      message: 'Fecha bloqueada eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error deleting blocked date:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar fecha bloqueada'
    });
  }
});

// ===================================
// Services Management
// ===================================

// GET /api/admin/services
router.get('/services', async (req, res) => {
  try {
    const services = await Service.findAll({
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

// POST /api/admin/services
router.post('/services', async (req, res) => {
  try {
    const { name, description, price, depositPercentage, duration } = req.body;

    if (!name || !price || !duration) {
      return res.status(400).json({
        success: false,
        message: 'Nombre, precio y duración son requeridos'
      });
    }

    // Calculate deposit amount
    const depositAmount = (price * (depositPercentage || 50)) / 100;

    const service = await Service.create({
      name,
      description,
      price,
      depositPercentage: depositPercentage || 50,
      depositAmount,
      duration,
      isActive: true
    });

    res.status(201).json({
      success: true,
      message: 'Servicio creado exitosamente',
      data: service
    });
  } catch (error) {
    console.error('Error creating service:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear servicio'
    });
  }
});

// PUT /api/admin/services/:id
router.put('/services/:id', async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Servicio no encontrado'
      });
    }

    const { name, description, price, depositPercentage, duration, isActive } = req.body;

    // Calculate deposit amount if price or percentage changed
    let depositAmount = service.depositAmount;
    if (price !== undefined || depositPercentage !== undefined) {
      const finalPrice = price !== undefined ? price : service.price;
      const finalPercentage = depositPercentage !== undefined ? depositPercentage : service.depositPercentage;
      depositAmount = (finalPrice * finalPercentage) / 100;
    }

    await service.update({
      name: name !== undefined ? name : service.name,
      description: description !== undefined ? description : service.description,
      price: price !== undefined ? price : service.price,
      depositPercentage: depositPercentage !== undefined ? depositPercentage : service.depositPercentage,
      depositAmount,
      duration: duration !== undefined ? duration : service.duration,
      isActive: isActive !== undefined ? isActive : service.isActive
    });

    res.json({
      success: true,
      message: 'Servicio actualizado exitosamente',
      data: service
    });
  } catch (error) {
    console.error('Error updating service:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar servicio'
    });
  }
});

// ===================================
// POST /api/admin/appointments/create
// Create appointment from admin panel
// Handles both cash (efectivo) and transfer (transferencia) payments
// ===================================
router.post('/appointments/create', uploadAdminPaymentProof, async (req, res) => {
  try {
    // Debug logging
    console.log('=== APPOINTMENT CREATE REQUEST ===');
    console.log('req.body:', req.body);
    console.log('req.file:', req.file);

    const {
      patientId,
      serviceId,
      doctorId,
      appointmentDate,
      appointmentTime,
      paymentMethod
    } = req.body;

    // Validate required fields
    if (!patientId || !serviceId || !doctorId || !appointmentDate || !appointmentTime) {
      console.log('Validation failed - missing fields:', {
        patientId: !!patientId,
        serviceId: !!serviceId,
        doctorId: !!doctorId,
        appointmentDate: !!appointmentDate,
        appointmentTime: !!appointmentTime
      });
      return res.status(400).json({
        success: false,
        message: 'Todos los campos requeridos deben ser completados'
      });
    }

    // Validate payment method
    if (!paymentMethod || !['efectivo', 'transferencia'].includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: 'Método de pago inválido'
      });
    }

    // If transferencia, payment proof is required
    if (paymentMethod === 'transferencia' && !req.file) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere comprobante de pago para transferencia'
      });
    }

    // Get service details
    const service = await Service.findByPk(serviceId);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Servicio no encontrado'
      });
    }

    // Generate unique payment reference
    const paymentConfig = await PaymentConfig.findOne();
    const prefix = paymentConfig?.referencePrefix || 'PROPIEL';
    const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
    const paymentReference = `${prefix}-${randomHex}`;

    // Admin-created appointments are always confirmed immediately
    // Admin is already verifying payment (either cash in person or transfer proof upload)
    const appointmentStatus = 'confirmed';

    // Create appointment
    const appointment = await Appointment.create({
      patientId,
      serviceId,
      doctorId,
      appointmentDate,
      appointmentTime,
      paymentReference,
      status: appointmentStatus,
      confirmedBy: req.userId,
      confirmedAt: new Date()
    });

    // Calculate payment amounts
    const totalAmount = parseFloat(service.price);
    const depositPercentage = service.depositPercentage || 50;
    const depositAmount = (totalAmount * depositPercentage) / 100;
    const remainingBalance = totalAmount - depositAmount;

    // Create payment record (auto-approved for admin bookings)
    await Payment.create({
      appointmentId: appointment.id,
      totalAmount,
      depositAmount,
      amount: depositAmount, // Deposit paid now
      remainingBalance,
      paymentMethod: paymentMethod === 'efectivo' ? 'cash' : 'transfer',
      status: 'approved', // Auto-approved (admin verified)
      paymentReference,
      transactionReference: paymentReference,
      approvedBy: req.userId,
      approvedAt: new Date(),
      notes: paymentMethod === 'efectivo' ? 'Pago en efectivo verificado por recepción' : 'Transferencia verificada por recepción'
    });

    // If transferencia with payment proof, save it
    if (paymentMethod === 'transferencia' && req.file) {
      await PaymentProof.create({
        appointmentId: appointment.id,
        filename: req.file.originalname,
        filepath: req.file.path,
        mimeType: req.file.mimetype,
        fileSize: req.file.size,
        uploadedAt: new Date(),
        status: 'verified', // Auto-verified
        verifiedBy: req.userId,
        verifiedAt: new Date()
      });
    }

    // Create automatic consent record (admin-created, no signature required)
    // Since admin creates this in-person, consent is implicit - we auto-generate with patient name
    await Consent.create({
      appointmentId: appointment.id,
      patientId: patientId,
      signatureImageUrl: null, // No signature for admin-created appointments
      consentText: 'Consentimiento informado registrado por personal de recepción al momento de agendar la cita.',
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent') || 'Admin Panel'
    });

    // Load related data
    const fullAppointment = await Appointment.findByPk(appointment.id, {
      include: [
        { model: Patient, attributes: ['id', 'fullName', 'phone', 'phoneCountryCode', 'email'] },
        { model: Service, attributes: ['id', 'name', 'price', 'depositAmount'] },
        { model: Doctor, attributes: ['id', 'fullName', 'specialty'] },
        { model: PaymentProof, attributes: ['id', 'filename', 'uploadedAt'] }
      ]
    });

    // Send WhatsApp notification (all admin-created appointments are confirmed)
    const whatsappNotification = sendWhatsAppNotification(fullAppointment, 'confirmation');

    res.status(201).json({
      success: true,
      message: 'Cita creada exitosamente',
      data: fullAppointment,
      whatsapp: whatsappNotification
    });
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear la cita',
      error: error.message
    });
  }
});

// ===================================
// GET /api/admin/appointments/availability
// Check available time slots for a doctor on a specific date
// ===================================
router.get('/appointments/availability', async (req, res) => {
  try {
    const { doctorId, date } = req.query;

    if (!doctorId || !date) {
      return res.status(400).json({
        success: false,
        message: 'Doctor y fecha son requeridos'
      });
    }

    // Get all appointments for this doctor on this date
    const appointments = await Appointment.findAll({
      where: {
        doctorId,
        appointmentDate: date,
        status: { [Op.in]: ['pending', 'confirmed'] }
      },
      attributes: ['appointmentTime']
    });

    // Extract booked times
    const bookedTimes = appointments.map(apt => apt.appointmentTime);

    // Generate available time slots (9 AM to 6 PM, every 30 minutes)
    const availableSlots = [];
    for (let hour = 9; hour < 18; hour++) {
      for (let minute of [0, 30]) {
        const timeSlot = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        if (!bookedTimes.includes(timeSlot)) {
          availableSlots.push(timeSlot);
        }
      }
    }

    res.json({
      success: true,
      data: availableSlots
    });
  } catch (error) {
    console.error('Error checking availability:', error);
    res.status(500).json({
      success: false,
      message: 'Error al verificar disponibilidad',
      error: error.message
    });
  }
});

// ===================================
// GET /api/admin/reports/revenue
// Get revenue statistics (daily, weekly, monthly)
// ===================================
router.get('/reports/revenue', async (req, res) => {
  try {
    const now = new Date();

    // Calculate date ranges
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Week: from Monday to Sunday
    const startOfWeek = new Date(now);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 7);

    // Month: from first day to last day
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    startOfMonth.setHours(0, 0, 0, 0);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    endOfMonth.setHours(23, 59, 59, 999);

    // Daily revenue (completed appointments today)
    const dailyRevenue = await Payment.sum('totalAmount', {
      include: [{
        model: Appointment,
        where: {
          status: 'completed',
          appointmentDate: {
            [Op.between]: [today.toISOString().split('T')[0], today.toISOString().split('T')[0]]
          }
        },
        attributes: []
      }],
      where: { status: 'approved' }
    });

    const dailyCount = await Appointment.count({
      where: {
        status: 'completed',
        appointmentDate: today.toISOString().split('T')[0]
      }
    });

    // Weekly revenue
    const weeklyRevenue = await Payment.sum('totalAmount', {
      include: [{
        model: Appointment,
        where: {
          status: 'completed',
          appointmentDate: {
            [Op.between]: [startOfWeek.toISOString().split('T')[0], endOfWeek.toISOString().split('T')[0]]
          }
        },
        attributes: []
      }],
      where: { status: 'approved' }
    });

    const weeklyCount = await Appointment.count({
      where: {
        status: 'completed',
        appointmentDate: {
          [Op.between]: [startOfWeek.toISOString().split('T')[0], endOfWeek.toISOString().split('T')[0]]
        }
      }
    });

    // Monthly revenue
    const monthlyRevenue = await Payment.sum('totalAmount', {
      include: [{
        model: Appointment,
        where: {
          status: 'completed',
          appointmentDate: {
            [Op.between]: [startOfMonth.toISOString().split('T')[0], endOfMonth.toISOString().split('T')[0]]
          }
        },
        attributes: []
      }],
      where: { status: 'approved' }
    });

    const monthlyCount = await Appointment.count({
      where: {
        status: 'completed',
        appointmentDate: {
          [Op.between]: [startOfMonth.toISOString().split('T')[0], endOfMonth.toISOString().split('T')[0]]
        }
      }
    });

    // Total clinic revenue (all time)
    const totalRevenue = await Payment.sum('totalAmount', {
      include: [{
        model: Appointment,
        where: { status: 'completed' },
        attributes: []
      }],
      where: { status: 'approved' }
    });

    const totalCount = await Appointment.count({
      where: { status: 'completed' }
    });

    // Outstanding balance (remaining to be collected)
    const outstandingBalance = await Payment.sum('remainingBalance', {
      where: {
        status: 'approved',
        remainingBalance: { [Op.gt]: 0 }
      }
    });

    res.json({
      success: true,
      data: {
        daily: {
          revenue: dailyRevenue || 0,
          count: dailyCount || 0,
          average: dailyCount > 0 ? (dailyRevenue || 0) / dailyCount : 0
        },
        weekly: {
          revenue: weeklyRevenue || 0,
          count: weeklyCount || 0,
          average: weeklyCount > 0 ? (weeklyRevenue || 0) / weeklyCount : 0
        },
        monthly: {
          revenue: monthlyRevenue || 0,
          count: monthlyCount || 0,
          average: monthlyCount > 0 ? (monthlyRevenue || 0) / monthlyCount : 0
        },
        total: {
          revenue: totalRevenue || 0,
          count: totalCount || 0,
          average: totalCount > 0 ? (totalRevenue || 0) / totalCount : 0
        },
        outstandingBalance: outstandingBalance || 0
      }
    });
  } catch (error) {
    console.error('Error fetching revenue stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas de ingresos',
      error: error.message
    });
  }
});

// ===================================
// GET /api/admin/reports/revenue-by-service
// Get revenue breakdown by service type
// ===================================
router.get('/reports/revenue-by-service', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Build where clause for appointments
    const appointmentWhere = { status: 'completed' };

    if (startDate && endDate) {
      appointmentWhere.appointmentDate = {
        [Op.between]: [startDate, endDate]
      };
    }

    // Get revenue by service
    const revenueByService = await Payment.findAll({
      attributes: [
        [sequelize.fn('SUM', sequelize.col('Payment.totalAmount')), 'revenue'],
        [sequelize.fn('COUNT', sequelize.col('Payment.id')), 'count']
      ],
      include: [{
        model: Appointment,
        where: appointmentWhere,
        attributes: [],
        include: [{
          model: Service,
          attributes: ['id', 'name', 'price']
        }]
      }],
      where: { status: 'approved' },
      group: ['Appointment.Service.id', 'Appointment.Service.name', 'Appointment.Service.price'],
      raw: true
    });

    // Format the response
    const formattedData = revenueByService.map(item => ({
      serviceId: item['Appointment.Service.id'],
      serviceName: item['Appointment.Service.name'],
      servicePrice: parseFloat(item['Appointment.Service.price']),
      revenue: parseFloat(item.revenue) || 0,
      count: parseInt(item.count) || 0,
      averagePerAppointment: parseInt(item.count) > 0 ? (parseFloat(item.revenue) || 0) / parseInt(item.count) : 0
    }));

    // Sort by revenue descending
    formattedData.sort((a, b) => b.revenue - a.revenue);

    res.json({
      success: true,
      data: formattedData
    });
  } catch (error) {
    console.error('Error fetching revenue by service:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener ingresos por servicio',
      error: error.message
    });
  }
});

// ===================================
// GET /api/admin/reports/revenue-trends
// Get revenue trends over time (for charts)
// ===================================
router.get('/reports/revenue-trends', async (req, res) => {
  try {
    const { period = 'month' } = req.query; // 'week', 'month', 'year'

    let dateFormat;
    let groupBy;
    let startDate = new Date();

    // Determine date range and grouping based on period
    if (period === 'week') {
      // Last 7 days
      startDate.setDate(startDate.getDate() - 7);
      dateFormat = '%Y-%m-%d';
      groupBy = [sequelize.fn('DATE_FORMAT', sequelize.col('Appointment.appointmentDate'), '%Y-%m-%d')];
    } else if (period === 'month') {
      // Last 30 days
      startDate.setDate(startDate.getDate() - 30);
      dateFormat = '%Y-%m-%d';
      groupBy = [sequelize.fn('DATE_FORMAT', sequelize.col('Appointment.appointmentDate'), '%Y-%m-%d')];
    } else if (period === 'year') {
      // Last 12 months
      startDate.setMonth(startDate.getMonth() - 12);
      dateFormat = '%Y-%m';
      groupBy = [sequelize.fn('DATE_FORMAT', sequelize.col('Appointment.appointmentDate'), '%Y-%m')];
    }

    startDate.setHours(0, 0, 0, 0);

    // Get revenue trends
    const trends = await Payment.findAll({
      attributes: [
        [sequelize.fn('DATE_FORMAT', sequelize.col('Appointment.appointmentDate'), dateFormat), 'date'],
        [sequelize.fn('SUM', sequelize.col('Payment.totalAmount')), 'revenue'],
        [sequelize.fn('COUNT', sequelize.col('Payment.id')), 'count']
      ],
      include: [{
        model: Appointment,
        where: {
          status: 'completed',
          appointmentDate: {
            [Op.gte]: startDate.toISOString().split('T')[0]
          }
        },
        attributes: []
      }],
      where: { status: 'approved' },
      group: groupBy,
      order: [[sequelize.fn('DATE_FORMAT', sequelize.col('Appointment.appointmentDate'), dateFormat), 'ASC']],
      raw: true
    });

    // Format the response
    const formattedTrends = trends.map(item => ({
      date: item.date,
      revenue: parseFloat(item.revenue) || 0,
      count: parseInt(item.count) || 0
    }));

    res.json({
      success: true,
      data: formattedTrends
    });
  } catch (error) {
    console.error('Error fetching revenue trends:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener tendencias de ingresos',
      error: error.message
    });
  }
});

// ===================================
// GET /api/admin/reports/best-months
// Get best performing months
// ===================================
router.get('/reports/best-months', async (req, res) => {
  try {
    const { limit = 12 } = req.query;

    // Get revenue by month for the last 12 months (or more)
    const bestMonths = await Payment.findAll({
      attributes: [
        [sequelize.fn('YEAR', sequelize.col('Appointment.appointmentDate')), 'year'],
        [sequelize.fn('MONTH', sequelize.col('Appointment.appointmentDate')), 'month'],
        [sequelize.fn('SUM', sequelize.col('Payment.totalAmount')), 'revenue'],
        [sequelize.fn('COUNT', sequelize.col('Payment.id')), 'count']
      ],
      include: [{
        model: Appointment,
        where: { status: 'completed' },
        attributes: []
      }],
      where: { status: 'approved' },
      group: [
        sequelize.fn('YEAR', sequelize.col('Appointment.appointmentDate')),
        sequelize.fn('MONTH', sequelize.col('Appointment.appointmentDate'))
      ],
      order: [[sequelize.fn('SUM', sequelize.col('Payment.totalAmount')), 'DESC']],
      limit: parseInt(limit),
      raw: true
    });

    // Format the response with month names
    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const formattedMonths = bestMonths.map(item => ({
      year: item.year,
      month: item.month,
      monthName: monthNames[item.month - 1],
      yearMonth: `${monthNames[item.month - 1]} ${item.year}`,
      revenue: parseFloat(item.revenue) || 0,
      count: parseInt(item.count) || 0,
      average: parseInt(item.count) > 0 ? (parseFloat(item.revenue) || 0) / parseInt(item.count) : 0
    }));

    res.json({
      success: true,
      data: formattedMonths
    });
  } catch (error) {
    console.error('Error fetching best months:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener mejores meses',
      error: error.message
    });
  }
});

module.exports = router;
