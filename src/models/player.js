const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Player = sequelize.define('Player', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  licence_id: {
    type: DataTypes.STRING,
    unique: true,
  },
  first_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  last_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  sex: {
    type: DataTypes.ENUM('M', 'F'),
  },
  birth_date: DataTypes.DATEONLY,
  nationality: DataTypes.STRING,
  club: DataTypes.STRING,
  country: DataTypes.STRING,
  position: DataTypes.STRING,
  dominant_foot: DataTypes.STRING,
  height_cm: DataTypes.DECIMAL(5,2),
  weight_kg: DataTypes.DECIMAL(5,2),
  allergies: DataTypes.TEXT,
  notes: DataTypes.TEXT,
}, {
  tableName: 'players',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});

module.exports = Player;
