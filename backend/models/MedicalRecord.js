const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const MedicalRecord = sequelize.define('MedicalRecord', {
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
  doctorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'doctors',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  chiefComplaint: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Motivo de consulta'
  },
  diagnosis: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  treatment: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  observations: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  vitalSigns: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Blood pressure, temperature, etc.'
  },
  imageBeforeUrl: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  imageAfterUrl: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  followUpDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  followUpNotes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'medicalRecords',
  timestamps: true,
  indexes: [
    {
      fields: ['patientId']
    },
    {
      fields: ['doctorId']
    }
  ]
});

module.exports = MedicalRecord;
