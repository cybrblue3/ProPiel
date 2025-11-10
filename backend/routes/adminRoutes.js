const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { Appointment, Patient, Doctor, Service, PaymentProof, User } = require('../models');
const auth = require('../middleware/auth');

// Middleware to check admin/receptionist role
const adminOnly = (req, res, next) => {
  if (req.userRole !== 'admin' && req.userRole !== 'receptionist') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin or receptionist role required.'
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
    const { status, date, startDate, endDate, page = 1, limit = 50 } = req.query;

    // Build where clause
    const where = {};

    if (status) {
      where.status = status;
    }

    if (date) {
      where.appointmentDate = date;
    } else if (startDate || endDate) {
      where.appointmentDate = {};
      if (startDate) where.appointmentDate[Op.gte] = startDate;
      if (endDate) where.appointmentDate[Op.lte] = endDate;
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
          attributes: ['id', 'name', 'price']
        },
        {
          model: PaymentProof,
          attributes: ['id', 'filename', 'filepath', 'uploadedAt']
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
          attributes: ['id', 'fullName', 'phone', 'email', 'birthDate']
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
          attributes: ['id', 'filename', 'filepath', 'uploadedAt']
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
          attributes: ['id', 'name', 'price', 'depositAmount', 'duration']
        },
        {
          model: PaymentProof,
          attributes: ['id', 'filename', 'filepath', 'mimeType', 'fileSize', 'uploadedAt']
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

    await appointment.update({
      status: 'confirmed',
      confirmedBy: req.userId,
      confirmedAt: new Date()
    });

    // Reload with associations
    await appointment.reload({
      include: [
        { model: Patient, attributes: ['fullName', 'phone'] },
        { model: Service, attributes: ['name'] }
      ]
    });

    res.json({
      success: true,
      message: 'Cita confirmada exitosamente',
      data: appointment
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

    await appointment.update({
      status: 'cancelled',
      cancellationReason: cancellationReason || 'Cancelada por administrador',
      cancelledBy: req.userId,
      cancelledAt: new Date()
    });

    res.json({
      success: true,
      message: 'Cita cancelada exitosamente',
      data: appointment
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
// Create appointment from admin panel (receptionist booking)
// ===================================
router.post('/appointments/create', async (req, res) => {
  try {
    const {
      patientId,
      serviceId,
      doctorId,
      appointmentDate,
      appointmentTime,
      paymentMethod,
      depositPaid,
      notes,
      status
    } = req.body;

    // Validate required fields
    if (!patientId || !serviceId || !doctorId || !appointmentDate || !appointmentTime) {
      return res.status(400).json({
        success: false,
        message: 'Todos los campos requeridos deben ser completados'
      });
    }

    // Get service details for deposit amount
    const service = await Service.findByPk(serviceId);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Servicio no encontrado'
      });
    }

    // Create appointment
    const appointment = await Appointment.create({
      patientId,
      serviceId,
      doctorId,
      appointmentDate,
      appointmentTime,
      depositAmount: service.depositAmount,
      paymentMethod: paymentMethod || 'efectivo',
      depositPaid: depositPaid || false,
      notes: notes || null,
      status: status || (depositPaid ? 'confirmed' : 'pending'),
      createdBy: req.userId
    });

    // Load related data
    const fullAppointment = await Appointment.findByPk(appointment.id, {
      include: [
        { model: Patient, attributes: ['id', 'fullName', 'phone', 'email'] },
        { model: Service, attributes: ['id', 'name', 'price', 'depositAmount'] },
        { model: Doctor, attributes: ['id', 'fullName', 'specialty'] }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Cita creada exitosamente',
      data: fullAppointment
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

module.exports = router;
