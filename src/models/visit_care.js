const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Visit = require('./visit');

const VisitCare = sequelize.define('VisitCare', {
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
  
  // Date et durée
  care_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  duration_min: DataTypes.INTEGER,
  
  // 1. Tecar thérapie
  tecar_used: DataTypes.BOOLEAN,
  tecar_duration_min: DataTypes.INTEGER,
  tecar_power_level: DataTypes.INTEGER,
  tecar_body_area: DataTypes.TEXT,
  tecar_notes: DataTypes.TEXT,
  
  // 2. Ultrason
  ultrason_used: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  ultrason_duration_min: DataTypes.INTEGER,
  ultrason_frequency_mhz: {
    type: DataTypes.DECIMAL(5,2),
    allowNull: true,
  },
  ultrason_body_area: DataTypes.TEXT,
  ultrason_notes: DataTypes.TEXT,
  
  // 3. Massages (manuels et pistolets)
  massage_used: DataTypes.BOOLEAN,
  massage_type: {
    type: DataTypes.ENUM('manuel', 'pistolet', 'les_deux'),
  },
  massage_duration_min: DataTypes.INTEGER,
  massage_body_area: DataTypes.TEXT,
  massage_notes: DataTypes.TEXT,
  
  // 4. Normatec
  normatec_used: DataTypes.BOOLEAN,
  normatec_duration_min: DataTypes.INTEGER,
  normatec_pressure_level: DataTypes.INTEGER,
  normatec_notes: DataTypes.TEXT,
  
  // 5. Cryothérapie (Game Ready / Cabine / Bain de glace)
  cryo_used: DataTypes.BOOLEAN,
  cryo_type: {
    type: DataTypes.ENUM('game_ready', 'cabine', 'bain_glace'),
  },
  cryo_duration_min: DataTypes.INTEGER,
  cryo_temperature_c: DataTypes.DECIMAL(4,1),
  cryo_body_area: DataTypes.TEXT,
  cryo_notes: DataTypes.TEXT,
  
  // 6. BTL CRYO PUSH
  btl_cryo_used: DataTypes.BOOLEAN,
  btl_cryo_duration_min: DataTypes.INTEGER,
  btl_cryo_body_area: DataTypes.TEXT,
  btl_cryo_notes: DataTypes.TEXT,
  
  // 7. Compex Electrostimulation
  compex_used: DataTypes.BOOLEAN,
  compex_program: DataTypes.TEXT,
  compex_duration_min: DataTypes.INTEGER,
  compex_body_area: DataTypes.TEXT,
  compex_notes: DataTypes.TEXT,
  
  // 8. Ondes de choc
  shockwave_used: DataTypes.BOOLEAN,
  shockwave_duration_min: DataTypes.INTEGER,
  shockwave_intensity: DataTypes.INTEGER,
  shockwave_body_area: DataTypes.TEXT,
  shockwave_notes: DataTypes.TEXT,
  
  // 9. Salle de renforcement
  gym_used: DataTypes.BOOLEAN,
  gym_duration_min: DataTypes.INTEGER,
  gym_exercises: DataTypes.TEXT,
  gym_load_description: DataTypes.TEXT,
  gym_notes: DataTypes.TEXT,
  
  // 10. Cabine de sauna
  sauna_used: DataTypes.BOOLEAN,
  sauna_duration_min: DataTypes.INTEGER,
  sauna_temperature_c: DataTypes.DECIMAL(4,1),
  sauna_notes: DataTypes.TEXT,
  
  // Observations générales
  overall_condition: {
    type: DataTypes.ENUM('excellent', 'bon', 'moyen', 'fatigue'),
  },
  pain_level_before: DataTypes.INTEGER, // 0-10
  pain_level_after: DataTypes.INTEGER, // 0-10
  therapist_name: DataTypes.TEXT,
  general_notes: DataTypes.TEXT,
  
}, {
  tableName: 'visit_care',
  timestamps: true,
  underscored: true,
});

// Associations désactivées pour éviter les erreurs de clés étrangères
// VisitCare.belongsTo(Visit, { foreignKey: 'visit_id', as: 'visit', constraints: false });

module.exports = VisitCare;

