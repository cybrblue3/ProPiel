const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const PaymentApprovalLog = sequelize.define('PaymentApprovalLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  paymentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'payments',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  action: {
    type: DataTypes.ENUM('created', 'approved', 'rejected', 'updated'),
    allowNull: false,
    comment: 'Action performed on the payment'
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'Who performed this action'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Additional notes or reason for action'
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Additional context (previous values, etc.)'
  },
  timestamp: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'payment_approval_logs',
  timestamps: false,
  indexes: [
    {
      fields: ['paymentId']
    },
    {
      fields: ['userId']
    },
    {
      fields: ['action']
    },
    {
      fields: ['timestamp']
    }
  ]
});

module.exports = PaymentApprovalLog;
