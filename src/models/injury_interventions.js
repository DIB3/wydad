const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const VisitInjuries = require('./visit_injuries');
const Attachment = require('./attachment');

const InjuryIntervention = sequelize.define('InjuryIntervention', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  injury_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  intervention_type: DataTypes.STRING,
  intervention_date: DataTypes.DATEONLY,
  details: DataTypes.TEXT,
  attachment_id: {
    type: DataTypes.UUID,
    allowNull: true,
  },
}, {
  tableName: 'injury_interventions',
  timestamps: false,
});

// Associations désactivées pour éviter les erreurs de clés étrangères
// InjuryIntervention.belongsTo(VisitInjuries, { foreignKey: 'injury_id', constraints: false });
// InjuryIntervention.belongsTo(Attachment, { foreignKey: 'attachment_id', constraints: false });

module.exports = InjuryIntervention;
