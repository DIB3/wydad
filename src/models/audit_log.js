const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./user');

const AuditLog = sequelize.define('AuditLog', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  occurred_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  actor_id: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  action: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  module: DataTypes.STRING,
  entity: DataTypes.STRING,
  entity_id: DataTypes.UUID,
  details: DataTypes.JSON,
}, {
  tableName: 'audit_log',
  timestamps: false,
});

// Associations désactivées pour éviter les erreurs de clés étrangères
// AuditLog.belongsTo(User, { foreignKey: 'actor_id', constraints: false });

module.exports = AuditLog;
