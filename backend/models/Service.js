const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Service = sequelize.define('Service', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
    validate: {
      min: 0
    }
  },
  depositPercentage: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 50,
    validate: {
      min: 0,
      max: 100
    }
  },
  depositAmount: {
    type: DataTypes.VIRTUAL,
    get() {
      if (this.price && this.depositPercentage) {
        return (parseFloat(this.price) * this.depositPercentage / 100).toFixed(2);
      }
      return 0;
    }
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Duration in minutes'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'services',
  timestamps: true
});

module.exports = Service;
