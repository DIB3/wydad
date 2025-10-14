const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Visit = require('./visit');

const VisitImpedance = sequelize.define('VisitImpedance', {
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
  device: DataTypes.STRING,
  height_cm: DataTypes.DECIMAL(5,2),
  weight_kg: DataTypes.DECIMAL(5,2),
  bmi: DataTypes.DECIMAL(5,2),
  body_fat_percent: DataTypes.DECIMAL(5,2),
  lean_mass_kg: DataTypes.DECIMAL(6,2),
  muscle_mass_kg: DataTypes.DECIMAL(6,2),
  bone_mass_kg: DataTypes.DECIMAL(5,2),
  tbw_l: DataTypes.DECIMAL(6,2),
  icw_l: DataTypes.DECIMAL(6,2),
  ecw_l: DataTypes.DECIMAL(6,2),
  phase_angle_deg: DataTypes.DECIMAL(5,2),
  visceral_fat_index: DataTypes.DECIMAL(5,2),
  basal_metabolism_kcal: DataTypes.DECIMAL(6,2),
  metabolic_age_years: DataTypes.INTEGER,
  hydration_percent: DataTypes.DECIMAL(5,2),
  fat_mass_trunk_percent: DataTypes.DECIMAL(5,2),
  fat_mass_limbs_percent: DataTypes.DECIMAL(5,2),
  impedance_kohm: DataTypes.DECIMAL(6,2),
  notes: DataTypes.TEXT,
}, {
  tableName: 'visit_impedance',
  timestamps: false,
});

// Associations désactivées pour éviter les erreurs de clés étrangères
// VisitImpedance.belongsTo(Visit, { foreignKey: 'visit_id', constraints: false });

module.exports = VisitImpedance;
