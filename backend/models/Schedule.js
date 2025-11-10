const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Schedule = sequelize.define('Schedule', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
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
    allowNull: true,
    references: {
      model: 'services',
      key: 'id'
    },
    onDelete: 'CASCADE',
    comment: 'If null, applies to all services'
  },
  dayOfWeek: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 0,
      max: 6
    },
    comment: '0=Sunday, 1=Monday, ..., 6=Saturday'
  },
  startTime: {
    type: DataTypes.TIME,
    allowNull: false
  },
  endTime: {
    type: DataTypes.TIME,
    allowNull: false
  },
  slotDuration: {
    type: DataTypes.INTEGER,
    defaultValue: 30,
    comment: 'Duration of each appointment slot in minutes'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'schedules',
  timestamps: true,
  indexes: [
    {
      fields: ['doctorId', 'dayOfWeek']
    }
  ]
});

module.exports = Schedule;
