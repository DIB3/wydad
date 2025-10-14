const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Visit = require('./visit');
const User = require('./user');
const MealType = require('./meal_type');

const VisitNutrition = sequelize.define('VisitNutrition', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  visit_id: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
  },
  consultation_date: DataTypes.DATEONLY,
  consultation_type: DataTypes.STRING,
  kcal_target: DataTypes.INTEGER,
  protein_g: DataTypes.DECIMAL(6,2),
  carbs_g: DataTypes.DECIMAL(6,2),
  fat_g: DataTypes.DECIMAL(6,2),
  hydration_l: DataTypes.DECIMAL(6,2),
  breakfast: DataTypes.TEXT,
  lunch: DataTypes.TEXT,
  dinner: DataTypes.TEXT,
  snacks: DataTypes.TEXT,
  pre_match_meal: DataTypes.TEXT,
  post_match_meal: DataTypes.TEXT,
  allergies: DataTypes.TEXT,
  comments: DataTypes.TEXT,
  // meal_type_id supprimé - n'existe pas dans la table MySQL
  created_by: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'visit_nutrition',
  timestamps: false,
});

// Associations désactivées pour éviter les erreurs de clés étrangères
// VisitNutrition.belongsTo(Visit, { foreignKey: 'visit_id', constraints: false });
// VisitNutrition.belongsTo(User, { foreignKey: 'created_by', constraints: false });
// VisitNutrition.belongsTo(MealType, { foreignKey: 'meal_type_id', constraints: false });

module.exports = VisitNutrition;
