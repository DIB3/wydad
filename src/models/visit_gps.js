const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Visit = require('./visit');

const VisitGPS = sequelize.define('VisitGPS', {
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
  session_date: DataTypes.DATEONLY,
  session_type: DataTypes.STRING,
  surface: DataTypes.STRING,
  duration_min: DataTypes.DECIMAL(6,2),
  distance_m: DataTypes.INTEGER,
  hid_m: DataTypes.INTEGER,
  hsd_m: DataTypes.INTEGER,
  vmax_kmh: DataTypes.DECIMAL(5,2),
  sprints_count: DataTypes.INTEGER,
  acc_gt3_count: DataTypes.INTEGER,
  decel_hard_count: DataTypes.INTEGER,
  player_load: DataTypes.DECIMAL(7,2),
  avg_speed_kmh: DataTypes.DECIMAL(5,2),
  max_heart_rate_bpm: DataTypes.INTEGER,
  avg_heart_rate_bpm: DataTypes.INTEGER,
  recovery_index: DataTypes.DECIMAL(5,2),
  notes: DataTypes.TEXT,
}, {
  tableName: 'visit_gps',
  timestamps: false,
});

// Associations désactivées pour éviter les erreurs de clés étrangères
// VisitGPS.belongsTo(Visit, { foreignKey: 'visit_id', constraints: false });

module.exports = VisitGPS;
