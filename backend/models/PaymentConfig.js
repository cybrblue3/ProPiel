const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const PaymentConfig = sequelize.define('PaymentConfig', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  bankName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Name of the bank'
  },
  accountHolder: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Name of account holder'
  },
  accountNumber: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: 'Bank account number'
  },
  clabe: {
    type: DataTypes.STRING(18),
    allowNull: false,
    comment: '18-digit CLABE interbank code (Mexico)'
  },
  referencePrefix: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'PROPIEL',
    comment: 'Prefix for payment references'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Only one config should be active at a time'
  }
}, {
  tableName: 'payment_config',
  timestamps: true
});

module.exports = PaymentConfig;
