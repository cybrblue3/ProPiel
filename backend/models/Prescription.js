const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Prescription = sequelize.define('Prescription', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  appointmentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'appointments',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  medicalCaseId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'medical_cases',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  medicationName: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  dosage: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  frequency: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  duration: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  instructions: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  prescribedDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'prescriptions',
  timestamps: true
});

module.exports = Prescription;
