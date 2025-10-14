const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const VisitInjuries = require('./visit_injuries');
const Attachment = require('./attachment');

const InjuryExam = sequelize.define('InjuryExam', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  injury_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  exam_type: DataTypes.STRING,
  exam_date: DataTypes.DATEONLY,
  conclusion: DataTypes.TEXT,
  attachment_id: {
    type: DataTypes.UUID,
    allowNull: true,
  },
}, {
  tableName: 'injury_exams',
  timestamps: false,
});

// Associations désactivées pour éviter les erreurs de clés étrangères
// InjuryExam.belongsTo(VisitInjuries, { foreignKey: 'injury_id', constraints: false });
// InjuryExam.belongsTo(Attachment, { foreignKey: 'attachment_id', constraints: false });

module.exports = InjuryExam;
