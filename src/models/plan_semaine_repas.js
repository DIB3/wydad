const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const PlanSemaineNutrition = require('./plan_semaine_nutrition');
const MealType = require('./meal_type');

const PlanSemaineRepas = sequelize.define('PlanSemaineRepas', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  plan_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  meal_type_id: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  jour_semaine: {
    type: DataTypes.ENUM('lundi','mardi','mercredi','jeudi','vendredi','samedi','dimanche'),
    allowNull: false,
  },
  details: {
    type: DataTypes.TEXT,
    allowNull: true,
  }
}, {
  tableName: 'plan_semaine_repas',
  timestamps: false,
});

// Associations désactivées pour éviter les erreurs de clés étrangères
// PlanSemaineRepas.belongsTo(PlanSemaineNutrition, { foreignKey: 'plan_id', constraints: false });
// PlanSemaineRepas.belongsTo(MealType, { foreignKey: 'meal_type_id', constraints: false });

module.exports = PlanSemaineRepas;
