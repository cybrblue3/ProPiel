const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const AppointmentStateHistory = sequelize.define('AppointmentStateHistory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  appointmentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'appointments',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  previousState: {
    type: DataTypes.ENUM('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no-show'),
    allowNull: true,
    comment: 'Previous status (null if this is initial creation)'
  },
  newState: {
    type: DataTypes.ENUM('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no-show'),
    allowNull: false,
    comment: 'New status after change'
  },
  changedBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'Who made the change'
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Reason for status change'
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Additional context (e.g., reschedule details, payment info)'
  },
  timestamp: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'appointment_state_history',
  timestamps: false,
  indexes: [
    {
      fields: ['appointmentId']
    },
    {
      fields: ['changedBy']
    },
    {
      fields: ['newState']
    },
    {
      fields: ['timestamp']
    }
  ]
});

module.exports = AppointmentStateHistory;
