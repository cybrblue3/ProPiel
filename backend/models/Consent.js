const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Consent = sequelize.define('Consent', {
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
  patientId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'patients',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  signatureImageUrl: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  consentText: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'The consent form text that was agreed to'
  },
  ipAddress: {
    type: DataTypes.STRING(45),
    allowNull: true
  },
  userAgent: {
    type: DataTypes.STRING(255),
    allowNull: true
  }
}, {
  tableName: 'consents',
  timestamps: true
});

module.exports = Consent;
