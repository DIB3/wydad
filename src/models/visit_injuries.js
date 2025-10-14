const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Visit = require('./visit');

const VisitInjuries = sequelize.define('VisitInjuries', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  visit_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  injury_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  type: DataTypes.STRING,
  severity: {
    type: DataTypes.ENUM('legere','moderee','severe'),
  },
  location: DataTypes.STRING,
  side: {
    type: DataTypes.ENUM('G','D','NA'),
  },
  mechanism: DataTypes.STRING,
  circumstance: DataTypes.STRING,
  description: DataTypes.TEXT,
  pain_level: {
    type: DataTypes.INTEGER,
    validate: { min: 0, max: 10 },
  },
  treatment: DataTypes.TEXT,
  immobilization: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  surgery: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  recovery_status: {
    type: DataTypes.ENUM('en_cours','reeducation','retour_partiel','retour_complet'),
  },
  estimated_duration_days: DataTypes.INTEGER,
  next_evaluation: DataTypes.DATEONLY,
  return_planned: DataTypes.DATEONLY,
  return_actual: DataTypes.DATEONLY,
  notes: DataTypes.TEXT,
}, {
  tableName: 'visit_injuries',
  timestamps: false,
});

// Associations désactivées pour éviter les erreurs de clés étrangères
// VisitInjuries.belongsTo(Visit, { foreignKey: 'visit_id', constraints: false });

module.exports = VisitInjuries;
