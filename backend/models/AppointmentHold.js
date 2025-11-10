const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const AppointmentHold = sequelize.define('AppointmentHold', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  holdToken: {
    type: DataTypes.STRING(64),
    allowNull: false,
    unique: true,
    comment: 'Unique token to identify this hold (stored in session)'
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
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: 'Hold expires after 10 minutes'
  },
  sessionInfo: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Phone number or session ID for reference'
  },
  paymentReference: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Unique payment reference code (e.g., PROPIEL-A7F2E9)'
  }
}, {
  tableName: 'appointment_holds',
  timestamps: true,
  indexes: [
    {
      fields: ['expiresAt']
    },
    {
      fields: ['appointmentDate', 'appointmentTime', 'doctorId']
    },
    {
      fields: ['holdToken']
    }
  ]
});

module.exports = AppointmentHold;
