const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./user');

const Attachment = sequelize.define('Attachment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  // Association polymorphe : peut être lié à n'importe quel modèle
  entity_type: {
    type: DataTypes.ENUM(
      'player',
      'visit',
      'visit_pcma',
      'visit_impedance',
      'visit_gps',
      'visit_injury',
      'visit_nutrition',
      'visit_care',
      'medical_certificate',
      'injury_exam',
      'injury_intervention'
    ),
    allowNull: false,
    comment: 'Type d\'entité auquel le fichier est attaché'
  },
  entity_id: {
    type: DataTypes.UUID,
    allowNull: false,
    comment: 'ID de l\'entité auquel le fichier est attaché'
  },
  // Catégorie du fichier
  category: {
    type: DataTypes.ENUM(
      // Catégories générales
      'general',
      'identification',
      'administrative',
      
      // Catégories médicales PCMA
      'pcma_general',
      'anthropometry',
      'vital_signs',
      'ecg',
      'echocardiography',
      'respiratory_function',
      'blood_test',
      'urine_test',
      'radiology',
      'mri',
      'ct_scan',
      'ultrasound',
      'musculoskeletal_exam',
      'fitness_decision',
      
      // Catégories blessures
      'injury_photo',
      'injury_xray',
      'injury_mri',
      'injury_report',
      'treatment_plan',
      
      // Catégories nutrition
      'meal_plan',
      'nutrition_analysis',
      'body_composition',
      
      // Catégories GPS/Performance
      'gps_report',
      'performance_analysis',
      'training_data',
      
      // Catégories impédance
      'impedance_report',
      'body_scan',
      
      // Catégories certificats
      'certificate',
      'medical_clearance',
      'vaccination_record',
      
      // Autres
      'prescription',
      'lab_result',
      'consent_form',
      'signature',
      'other'
    ),
    defaultValue: 'general',
    comment: 'Catégorie du fichier'
  },
  filename: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Nom original du fichier'
  },
  original_filename: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Nom du fichier tel qu\'uploadé par l\'utilisateur'
  },
  mime_type: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Type MIME du fichier (image/jpeg, application/pdf, etc.)'
  },
  storage_path: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Chemin de stockage du fichier sur le serveur'
  },
  url: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'URL d\'accès au fichier'
  },
  size_bytes: {
    type: DataTypes.BIGINT,
    allowNull: false,
    comment: 'Taille du fichier en octets'
  },
  sha256: {
    type: DataTypes.STRING(64),
    allowNull: true,
    comment: 'Hash SHA256 du fichier pour vérification d\'intégrité'
  },
  uploaded_by: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: 'ID de l\'utilisateur qui a uploadé le fichier'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Description ou notes sur le fichier'
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Métadonnées supplémentaires (EXIF, dates d\'examen, etc.)'
  },
  is_sensitive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Indique si le fichier contient des données sensibles'
  },
  is_deleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Soft delete : fichier marqué comme supprimé'
  },
  deleted_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Date de suppression (soft delete)'
  },
  deleted_by: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: 'ID de l\'utilisateur qui a supprimé le fichier'
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'attachments',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['entity_type', 'entity_id'],
      name: 'idx_entity'
    },
    {
      fields: ['category'],
      name: 'idx_category'
    },
    {
      fields: ['uploaded_by'],
      name: 'idx_uploaded_by'
    },
    {
      fields: ['is_deleted'],
      name: 'idx_is_deleted'
    }
  ]
});

// Associations désactivées pour éviter les erreurs de clés étrangères
// Attachment.belongsTo(User, { foreignKey: 'uploaded_by', as: 'uploader', constraints: false });
// Attachment.belongsTo(User, { foreignKey: 'deleted_by', as: 'deleter', constraints: false });

module.exports = Attachment;
