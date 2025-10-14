const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Player = require('./player');
const Visit = require('./visit');
const Attachment = require('./attachment');
const User = require('./user');

const MedicalCertificate = sequelize.define('MedicalCertificate', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  player_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  source_visit_id: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('APTE','APTE_RESTRICTIONS','TEMP_INAPTE','INAPTE'),
    allowNull: false,
    field: 'status'
  },
  fitness_status: {
    type: DataTypes.VIRTUAL,
    get() {
      return this.getDataValue('status')
    },
    set(value) {
      this.setDataValue('status', value)
    }
  },
  restrictions: DataTypes.TEXT,
  valid_from: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'valid_from'
  },
  issue_date: {
    type: DataTypes.VIRTUAL,
    get() {
      return this.getDataValue('valid_from')
    },
    set(value) {
      this.setDataValue('valid_from', value)
    }
  },
  valid_until: {
    type: DataTypes.DATEONLY,
    field: 'valid_until'
  },
  expiry_date: {
    type: DataTypes.VIRTUAL,
    get() {
      return this.getDataValue('valid_until')
    },
    set(value) {
      this.setDataValue('valid_until', value)
    }
  },
  physician_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  pdf_attachment_id: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  created_by: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'medical_certificates',
  timestamps: false,
});

// Associations activées
MedicalCertificate.belongsTo(Player, { 
  foreignKey: 'player_id', 
  as: 'player',
  constraints: false 
});

MedicalCertificate.belongsTo(Visit, { 
  foreignKey: 'source_visit_id', 
  as: 'sourceVisit',
  constraints: false 
});

MedicalCertificate.belongsTo(User, { 
  foreignKey: 'created_by', 
  as: 'creator',
  constraints: false 
});

module.exports = MedicalCertificate;
