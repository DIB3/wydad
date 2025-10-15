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
  session_date: {
    type: DataTypes.DATEONLY,
    defaultValue: null,
  },
  session_type: {
    type: DataTypes.STRING,
    defaultValue: 'training',
  },
  surface: {
    type: DataTypes.STRING,
    defaultValue: 'grass',
  },
  duration_min: {
    type: DataTypes.DECIMAL(8,2),
    defaultValue: 0,
  },
  distance_m: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  hid_m: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  hsd_m: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  vmax_kmh: {
    type: DataTypes.DECIMAL(8,2),
    defaultValue: 0,
  },
  sprints_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  acc_gt3_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  decel_hard_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  player_load: {
    type: DataTypes.DECIMAL(10,2),
    defaultValue: 0,
  },
  avg_speed_kmh: {
    type: DataTypes.DECIMAL(8,2),
    defaultValue: 0,
  },
  max_heart_rate_bpm: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  avg_heart_rate_bpm: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  recovery_index: {
    type: DataTypes.DECIMAL(8,2),
    defaultValue: 0,
  },
  notes: {
    type: DataTypes.TEXT,
    defaultValue: '',
  },
}, {
  tableName: 'visit_gps',
  timestamps: false,
});

// Associations désactivées pour éviter les erreurs de clés étrangères
// VisitGPS.belongsTo(Visit, { foreignKey: 'visit_id', constraints: false });

module.exports = VisitGPS;
