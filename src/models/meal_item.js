const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const MealType = require('./meal_type');

const MealItem = sequelize.define('MealItem', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  meal_type_id: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'meal_items',
  timestamps: false,
});

// Associations désactivées pour éviter les erreurs de clés étrangères
// MealItem.belongsTo(MealType, { foreignKey: 'meal_type_id', constraints: false });

module.exports = MealItem;

