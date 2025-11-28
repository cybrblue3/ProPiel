const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const sequelize = require('../config/db');
const { Payment, PaymentApprovalLog, PaymentProof, Appointment, Patient, Doctor, Service, User } = require('../models');
const auth = require('../middleware/auth');

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

// Apply auth and admin middleware to all payment routes
router.use(auth);
router.use(adminOnly);

// ===================================
// GET /api/payments
// Get all payments with filters
// ===================================
router.get('/', async (req, res) => {
  try {
    const {
      status,
      paymentMethod,
      startDate,
      endDate,
      patientId,
      serviceId,
      page = 1,
      limit = 20
    } = req.query;

    // Build where clause
    const where = {};

    if (status) {
      where.status = status;
    }

    if (paymentMethod) {
      where.paymentMethod = paymentMethod;
    }

    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    // Pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: payments } = await Payment.findAndCountAll({
      where,
      include: [
        {
          model: Appointment,
          include: [
            {
              model: Patient,
              attributes: ['id', 'fullName', 'phone', 'email']
            },
            {
              model: Service,
              attributes: ['id', 'name', 'price', 'duration']
            },
            {
              model: Doctor,
              attributes: ['id', 'fullName', 'specialty']
            }
          ]
        },
        {
          model: User,
          as: 'approver',
          attributes: ['id', 'fullName', 'username']
        },
        {
          model: User,
          as: 'rejecter',
          attributes: ['id', 'fullName', 'username']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    // Calculate totals
    const stats = await Payment.findAll({
      where,
      attributes: [
        [sequelize.fn('SUM', sequelize.col('amount')), 'totalAmount'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      raw: true
    });

    res.json({
      success: true,
      data: payments,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / parseInt(limit))
      },
      stats: {
        totalAmount: stats[0]?.totalAmount || 0,
        count: count
      }
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener los pagos',
      error: error.message
    });
  }
});

// ===================================
// GET /api/payments/stats
// Get payment statistics
// ===================================
router.get('/stats', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Pending payments count
    const pendingCount = await Payment.count({
      where: { status: 'pending' }
    });

    // Approved today
    const approvedToday = await Payment.count({
      where: {
        status: 'approved',
        approvedAt: {
          [Op.between]: [today, tomorrow]
        }
      }
    });

    // Total collected today
    const collectedToday = await Payment.sum('amount', {
      where: {
        status: 'approved',
        approvedAt: {
          [Op.between]: [today, tomorrow]
        }
      }
    });

    // Total pending amount
    const pendingAmount = await Payment.sum('amount', {
      where: { status: 'pending' }
    });

    // Outstanding balances (remaining to be paid)
    const outstandingBalance = await Payment.sum('remainingBalance', {
      where: {
        status: 'approved',
        remainingBalance: { [Op.gt]: 0 }
      }
    });

    // Payment method breakdown
    const byMethod = await Payment.findAll({
      attributes: [
        'paymentMethod',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('amount')), 'totalAmount']
      ],
      where: { status: 'approved' },
      group: ['paymentMethod'],
      raw: true
    });

    res.json({
      success: true,
      data: {
        pendingCount,
        approvedToday,
        collectedToday: collectedToday || 0,
        pendingAmount: pendingAmount || 0,
        outstandingBalance: outstandingBalance || 0,
        byMethod: byMethod.map(item => ({
          method: item.paymentMethod,
          count: parseInt(item.count),
          total: parseFloat(item.totalAmount) || 0
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching payment stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas de pagos',
      error: error.message
    });
  }
});

// ===================================
// GET /api/payments/:id
// Get single payment details with full info
// ===================================
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const payment = await Payment.findByPk(id, {
      include: [
        {
          model: Appointment,
          include: [
            {
              model: Patient,
              attributes: ['id', 'fullName', 'phone', 'email', 'birthDate']
            },
            {
              model: Service,
              attributes: ['id', 'name', 'price', 'duration', 'depositPercentage']
            },
            {
              model: Doctor,
              attributes: ['id', 'fullName', 'specialty']
            },
            {
              model: PaymentProof
            }
          ]
        },
        {
          model: User,
          as: 'approver',
          attributes: ['id', 'fullName', 'username']
        },
        {
          model: User,
          as: 'rejecter',
          attributes: ['id', 'fullName', 'username']
        },
        {
          model: PaymentApprovalLog,
          include: [
            {
              model: User,
              attributes: ['id', 'fullName', 'username']
            }
          ],
          order: [['timestamp', 'DESC']]
        }
      ]
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Pago no encontrado'
      });
    }

    res.json({
      success: true,
      data: payment
    });
  } catch (error) {
    console.error('Error fetching payment:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener el pago',
      error: error.message
    });
  }
});

// ===================================
// PATCH /api/payments/:id/approve
// Approve a payment
// ===================================
router.patch('/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    const userId = req.userId;

    const payment = await Payment.findByPk(id, {
      include: [{ model: Appointment }]
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Pago no encontrado'
      });
    }

    if (payment.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `El pago ya fue ${payment.status === 'approved' ? 'aprobado' : 'rechazado'}`
      });
    }

    // Update payment
    await payment.update({
      status: 'approved',
      approvedBy: userId,
      approvedAt: new Date()
    });

    // Update appointment status to confirmed
    if (payment.Appointment) {
      await payment.Appointment.update({
        status: 'confirmed',
        confirmedBy: userId,
        confirmedAt: new Date()
      });
    }

    // Update payment proof if exists
    const proof = await PaymentProof.findOne({
      where: { appointmentId: payment.appointmentId }
    });
    if (proof) {
      await proof.update({
        status: 'verified',
        verifiedBy: userId,
        verifiedAt: new Date()
      });
    }

    // Log the approval
    await PaymentApprovalLog.create({
      paymentId: payment.id,
      action: 'approved',
      userId,
      notes: notes || 'Pago aprobado',
      timestamp: new Date()
    });

    res.json({
      success: true,
      message: 'Pago aprobado exitosamente',
      data: payment
    });
  } catch (error) {
    console.error('Error approving payment:', error);
    res.status(500).json({
      success: false,
      message: 'Error al aprobar el pago',
      error: error.message
    });
  }
});

// ===================================
// PATCH /api/payments/:id/reject
// Reject a payment
// ===================================
router.patch('/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;
    const userId = req.userId;

    if (!rejectionReason || rejectionReason.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Se requiere una razón de rechazo'
      });
    }

    const payment = await Payment.findByPk(id, {
      include: [{ model: Appointment }]
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Pago no encontrado'
      });
    }

    if (payment.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `El pago ya fue ${payment.status === 'approved' ? 'aprobado' : 'rechazado'}`
      });
    }

    // Update payment
    await payment.update({
      status: 'rejected',
      rejectedBy: userId,
      rejectedAt: new Date(),
      rejectionReason
    });

    // Cancel the appointment (airline style)
    if (payment.Appointment) {
      await payment.Appointment.update({
        status: 'cancelled',
        cancelledBy: userId,
        cancellationReason: `Pago rechazado: ${rejectionReason}`
      });
    }

    // Update payment proof if exists
    const proof = await PaymentProof.findOne({
      where: { appointmentId: payment.appointmentId }
    });
    if (proof) {
      await proof.update({
        status: 'rejected',
        verifiedBy: userId,
        verifiedAt: new Date(),
        rejectionReason
      });
    }

    // Log the rejection
    await PaymentApprovalLog.create({
      paymentId: payment.id,
      action: 'rejected',
      userId,
      notes: rejectionReason,
      timestamp: new Date()
    });

    res.json({
      success: true,
      message: 'Pago rechazado',
      data: payment
    });
  } catch (error) {
    console.error('Error rejecting payment:', error);
    res.status(500).json({
      success: false,
      message: 'Error al rechazar el pago',
      error: error.message
    });
  }
});

// ===================================
// PATCH /api/payments/:id/record-balance
// Record remaining balance payment
// ===================================
router.patch('/:id/record-balance', async (req, res) => {
  try {
    const { id } = req.params;
    const { amountPaid, paymentMethod, notes } = req.body;
    const userId = req.userId;

    const payment = await Payment.findByPk(id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Pago no encontrado'
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
        message: 'Este pago ya está pagado en su totalidad'
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

module.exports = router;
