const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Appointment = sequelize.define('Appointment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  patientId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'patients',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  doctorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'doctors',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  serviceId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'services',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  appointmentDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  appointmentTime: {
    type: DataTypes.TIME,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no-show'),
    allowNull: false,
    defaultValue: 'pending',
    comment: 'pending=awaiting approval, confirmed=approved, in_progress=patient in consultation, completed=finished, cancelled=cancelled, no-show=patient did not arrive'
  },
  isFirstVisit: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  cancellationReason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  confirmedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  confirmedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  cancelledBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  cancelledAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  // Smart Booking Contact System - For proxy bookings
  bookedByName: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Name of person who booked (if different from patient)'
  },
  bookedByPhone: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'Phone of person who booked (receives notifications)'
  },
  bookedByEmail: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Email of person who booked'
  },
  bookedByRelationship: {
    type: DataTypes.ENUM('hijo', 'hija', 'madre', 'padre', 'esposo', 'esposa', 'hermano', 'hermana', 'otro'),
    allowNull: true,
    comment: 'Relationship to patient'
  },
  consentPdfPath: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Path to signed consent PDF file'
  },
  consentSignedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Timestamp when consent was signed'
  },
  paymentReference: {
    type: DataTypes.STRING(50),
    allowNull: true,
    unique: true,
    comment: 'Unique payment reference code (e.g., PROPIEL-A7F2E9)'
  },
  // State transition tracking
  arrivedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'When patient arrived at clinic'
  },
  arrivedMarkedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'Who marked patient as arrived'
  },
  enteredConsultationAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'When patient entered consultation room (in_progress state)'
  },
  enteredConsultationBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'Who marked patient as entered consultation'
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'When consultation was completed'
  },
  completedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'Who marked consultation as completed'
  },
  // Last state change info
  stateChangedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Last time status was changed'
  },
  stateChangedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'Who last changed the status'
  },
  stateChangeReason: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Reason for last status change'
  }
}, {
  tableName: 'appointments',
  timestamps: true,
  indexes: [
    {
      fields: ['appointmentDate', 'appointmentTime']
    },
    {
      fields: ['status']
    },
    {
      fields: ['bookedByPhone']
    }
  ]
});

module.exports = Appointment;
