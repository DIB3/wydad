const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const MealType = sequelize.define('MealType', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  description: {
    type: DataTypes.TEXT,
  },
}, {
  tableName: 'meal_types',
  timestamps: false,
});

module.exports = MealType;
