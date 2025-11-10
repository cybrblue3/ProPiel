const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Photo = sequelize.define('Photo', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
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
  photoUrl: {
    type: DataTypes.STRING(500),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  photoType: {
    type: DataTypes.ENUM('before', 'during', 'after'),
    allowNull: false,
    defaultValue: 'during'
  },
  uploadDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'photos',
  timestamps: true
});

module.exports = Photo;
