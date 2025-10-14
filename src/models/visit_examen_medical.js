const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const VisitExamenMedical = sequelize.define('VisitExamenMedical', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  visit_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'visits',
      key: 'id'
    },
    onDelete: 'CASCADE',
    unique: true
  },
  player_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'players',
      key: 'id'
    }
  },
  medecin_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  date_consultation: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    defaultValue: DataTypes.NOW
  },
  type_consultation: {
    type: DataTypes.ENUM('controle', 'urgence', 'suivi', 'autre'),
    allowNull: true,
    defaultValue: 'controle'
  },
  motif: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  symptomes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  diagnostic: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  temperature_c: {
    type: DataTypes.DECIMAL(4, 1),
    allowNull: true
  },
  tension_arterielle: {
    type: DataTypes.STRING(15),
    allowNull: true,
    comment: 'Format: 120/80 mmHg'
  },
  frequence_cardiaque_bpm: {
    type: DataTypes.SMALLINT,
    allowNull: true
  },
  examens_demandes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Liste des examens prescrits'
  },
  fichier_examens: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  traitement: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Médicaments ou soins prescrits'
  },
  ordonnance_path: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'PDF généré automatiquement'
  },
  recommandations: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  date_suivi: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: 'Prochaine visite prévue'
  },
  statut: {
    type: DataTypes.ENUM('brouillon', 'valide'),
    allowNull: false,
    defaultValue: 'brouillon'
  }
}, {
  tableName: 'visit_examen_medical',
  timestamps: true,
  underscored: false,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
});

module.exports = VisitExamenMedical;

