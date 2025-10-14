const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Player = require('./player');
const MedicalCertificate = require('./medical_certificates');

const PlayerStatusHistory = sequelize.define('PlayerStatusHistory', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  player_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('APTE','APTE_RESTRICTIONS','TEMP_INAPTE','INAPTE'),
    allowNull: false,
  },
  from_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  to_date: DataTypes.DATEONLY,
  reason: DataTypes.TEXT,
  source_certificate_id: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'player_status_history',
  timestamps: false,
});

// Associations désactivées pour éviter les erreurs de clés étrangères
// PlayerStatusHistory.belongsTo(Player, { foreignKey: 'player_id', constraints: false });
// PlayerStatusHistory.belongsTo(MedicalCertificate, { foreignKey: 'source_certificate_id', constraints: false });

module.exports = PlayerStatusHistory;
