const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const MedicalCase = sequelize.define('MedicalCase', {
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
    onDelete: 'RESTRICT' // Don't delete cases if doctor is deleted
  },
  conditionName: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  specialty: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  severity: {
    type: DataTypes.ENUM('Leve', 'Moderado', 'Severo'),
    allowNull: false,
    defaultValue: 'Moderado'
  },
  symptoms: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  affectedArea: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  onsetDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  previousTreatments: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  treatmentGoal: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('En Tratamiento', 'Curado', 'Crónico', 'Inactivo'),
    allowNull: false,
    defaultValue: 'En Tratamiento'
  },
  startDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  endDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'medical_cases',
  timestamps: true
});

module.exports = MedicalCase;
