const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const PaymentProof = sequelize.define('PaymentProof', {
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
  filename: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Original filename uploaded by user'
  },
  filepath: {
    type: DataTypes.STRING(500),
    allowNull: false,
    comment: 'Path to stored file (relative to uploads directory)'
  },
  mimeType: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'MIME type (image/jpeg, image/png, application/pdf)'
  },
  fileSize: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'File size in bytes'
  },
  uploadedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  // Verification status
  status: {
    type: DataTypes.ENUM('uploaded', 'verified', 'rejected'),
    allowNull: false,
    defaultValue: 'uploaded'
  },
  // Who verified this proof
  verifiedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  // When was it verified
  verifiedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  // Rejection reason if status is rejected
  rejectionReason: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'payment_proofs',
  timestamps: true,
  indexes: [
    {
      fields: ['appointmentId']
    },
    {
      fields: ['status']
    }
  ]
});

module.exports = PaymentProof;
