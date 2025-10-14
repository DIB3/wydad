const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const VisitSoins = sequelize.define('VisitSoins', {
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
  date_soin: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    defaultValue: DataTypes.NOW
  },
  type_soin: {
    type: DataTypes.STRING(80),
    allowNull: true,
    comment: 'pansement, massage, reeducation, injection, cryotherapie, electrostimulation, infiltration, autre'
  },
  zone_concernee: {
    type: DataTypes.STRING(80),
    allowNull: true,
    comment: 'tete, cou, epaule, bras, avant_bras, cuisse, genou, cheville, pied, dos, autre'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Détails du soin effectué'
  },
  produits_utilises: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Médicaments, matériels utilisés'
  },
  resultat: {
    type: DataTypes.ENUM('amelioration', 'stable', 'deterioration'),
    allowNull: true
  },
  recommandations: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Suivi ou repos'
  },
  document_path: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Compte rendu ou photo'
  },
  lien_blessure_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'visit_injuries',
      key: 'id'
    },
    comment: 'Lien optionnel avec une blessure'
  },
  statut: {
    type: DataTypes.ENUM('brouillon', 'valide'),
    allowNull: false,
    defaultValue: 'brouillon'
  }
}, {
  tableName: 'visit_soins',
  timestamps: true,
  underscored: false,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
});

module.exports = VisitSoins;

