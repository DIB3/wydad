const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Player = require('./player');
const User = require('./user');

const PlanSemaineNutrition = sequelize.define('PlanSemaineNutrition', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  player_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  created_by: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  start_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  end_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  comments: {
    type: DataTypes.TEXT,
    allowNull: true,
  }
}, {
  tableName: 'plan_semaine_nutrition',
  timestamps: false,
});

// Associations désactivées pour éviter les erreurs de clés étrangères
// PlanSemaineNutrition.belongsTo(Player, { foreignKey: 'player_id', constraints: false });
// PlanSemaineNutrition.belongsTo(User, { foreignKey: 'created_by', constraints: false });

module.exports = PlanSemaineNutrition;
