const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Player = require('./player');
const User = require('./user');

const Visit = sequelize.define('Visit', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  player_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  visit_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false,
  },
  module: {
    type: DataTypes.ENUM('pcma','impedance','gps','injury','nutrition','care','examen_medical','soins'),
    allowNull: false,
  },
  created_by: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('draft','validated'),
    defaultValue: 'validated',
  },
  notes: DataTypes.TEXT,
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'visits',
  timestamps: false,
});

// Associations
Visit.belongsTo(Player, { 
  foreignKey: 'player_id', 
  as: 'player',
  constraints: false 
});

Visit.belongsTo(User, { 
  foreignKey: 'created_by', 
  as: 'creator',
  constraints: false 
});

module.exports = Visit;
