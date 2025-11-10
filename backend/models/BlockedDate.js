const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const BlockedDate = sequelize.define('BlockedDate', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    comment: 'Blocked date (YYYY-MM-DD format)'
  },
  reason: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Reason for blocking (e.g., "Holiday", "Vacation", "Maintenance")'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Whether this block is currently active'
  }
}, {
  tableName: 'blocked_dates',
  timestamps: true,
  indexes: [
    {
      fields: ['date']
    },
    {
      fields: ['isActive']
    }
  ]
});

module.exports = BlockedDate;
