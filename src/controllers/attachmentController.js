const Attachment = require('../models/attachment');
const User = require('../models/user');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');
const { sequelize } = require('../config/db');

// Configuration du stockage des fichiers
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/attachments');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (err) {
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    // Génération d'un nom unique
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  }
});

// Filtrage des types de fichiers autorisés
const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv'
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Type de fichier non autorisé. Formats acceptés: images, PDF, Word, Excel, texte'));
  }
};

// Configuration multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10 MB
  }
});

// Fonction pour calculer le hash SHA256 d'un fichier
const calculateFileHash = async (filePath) => {
  try {
    const fileBuffer = await fs.readFile(filePath);
    return crypto.createHash('sha256').update(fileBuffer).digest('hex');
  } catch (err) {
    console.error('Erreur calcul hash:', err);
    return null;
  }
};

// Upload d'une pièce jointe
exports.uploadAttachment = async (req, res) => {
  try {
    const { entity_type, entity_id, category, description, metadata } = req.body;

    console.log('📎 Upload attachment:', { entity_type, entity_id, category, file: req.file });

    if (!req.file) {
      return res.status(400).json({ error: 'Aucun fichier fourni' });
    }

    if (!entity_type || !entity_id) {
      return res.status(400).json({ error: 'entity_type et entity_id sont requis' });
    }

    // Calcul du hash du fichier
    const filePath = req.file.path;
    const sha256 = await calculateFileHash(filePath);

    // Création de l'URL d'accès
    const url = `/api/attachments/${req.file.filename}`;

    // Création de l'enregistrement
    const attachment = await Attachment.create({
      entity_type,
      entity_id,
      category: category || 'general',
      filename: req.file.filename,
      original_filename: req.file.originalname,
      mime_type: req.file.mimetype,
      storage_path: req.file.path,
      url,
      size_bytes: req.file.size,
      sha256,
      uploaded_by: req.user?.id,
      description,
      metadata: metadata ? JSON.parse(metadata) : null,
      is_sensitive: true
    });

    // Récupération avec les relations
    const attachmentWithUser = await Attachment.findByPk(attachment.id, {
      include: [
        { model: User, as: 'uploader', attributes: ['id', 'first_name', 'last_name', 'email'] }
      ]
    });

    res.status(201).json(attachmentWithUser);
  } catch (err) {
    console.error('❌ Erreur upload attachment:', err);
    
    // Suppression du fichier en cas d'erreur
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkErr) {
        console.error('Erreur suppression fichier:', unlinkErr);
      }
    }

    res.status(500).json({ error: err.message });
  }
};

// Récupération des pièces jointes d'une entité
exports.getAttachmentsByEntity = async (req, res) => {
  try {
    const { entity_type, entity_id } = req.params;
    const { category, include_deleted } = req.query;

    console.log('📎 Get attachments:', { entity_type, entity_id, category });

    const where = {
      entity_type,
      entity_id,
      is_deleted: include_deleted === 'true' ? undefined : false
    };

    if (category) {
      where.category = category;
    }

    const attachments = await Attachment.findAll({
      where,
      // include désactivé car associations désactivées
      // include: [
      //   { model: User, as: 'uploader', attributes: ['id', 'first_name', 'last_name', 'email'] },
      //   { model: User, as: 'deleter', attributes: ['id', 'first_name', 'last_name', 'email'] }
      // ],
      order: [['created_at', 'DESC']]
    });

    res.json(attachments);
  } catch (err) {
    console.error('❌ Erreur get attachments:', err);
    res.status(500).json({ error: err.message });
  }
};

// Récupération d'une pièce jointe par ID
exports.getAttachmentById = async (req, res) => {
  try {
    const { id } = req.params;

    const attachment = await Attachment.findByPk(id);
      // include désactivé car associations désactivées
      // include: [
      //   { model: User, as: 'uploader', attributes: ['id', 'first_name', 'last_name', 'email'] },
      //   { model: User, as: 'deleter', attributes: ['id', 'first_name', 'last_name', 'email'] }
      // ]

    if (!attachment) {
      return res.status(404).json({ error: 'Pièce jointe non trouvée' });
    }

    res.json(attachment);
  } catch (err) {
    console.error('❌ Erreur get attachment:', err);
    res.status(500).json({ error: err.message });
  }
};

// Téléchargement d'un fichier
exports.downloadAttachment = async (req, res) => {
  try {
    const { id } = req.params;

    const attachment = await Attachment.findByPk(id);

    if (!attachment) {
      return res.status(404).json({ error: 'Pièce jointe non trouvée' });
    }

    if (attachment.is_deleted) {
      return res.status(410).json({ error: 'Fichier supprimé' });
    }

    // Vérification de l'existence du fichier
    try {
      await fs.access(attachment.storage_path);
    } catch (err) {
      return res.status(404).json({ error: 'Fichier physique non trouvé' });
    }

    // Envoi du fichier
    res.download(attachment.storage_path, attachment.original_filename);
  } catch (err) {
    console.error('❌ Erreur download attachment:', err);
    res.status(500).json({ error: err.message });
  }
};

// Affichage d'un fichier (inline)
exports.viewAttachment = async (req, res) => {
  try {
    const { id } = req.params;

    const attachment = await Attachment.findByPk(id);

    if (!attachment) {
      return res.status(404).json({ error: 'Pièce jointe non trouvée' });
    }

    if (attachment.is_deleted) {
      return res.status(410).json({ error: 'Fichier supprimé' });
    }

    // Vérification de l'existence du fichier
    try {
      await fs.access(attachment.storage_path);
    } catch (err) {
      return res.status(404).json({ error: 'Fichier physique non trouvé' });
    }

    // Configuration du type de contenu
    res.setHeader('Content-Type', attachment.mime_type);
    res.setHeader('Content-Disposition', `inline; filename="${attachment.original_filename}"`);

    // Envoi du fichier
    res.sendFile(path.resolve(attachment.storage_path));
  } catch (err) {
    console.error('❌ Erreur view attachment:', err);
    res.status(500).json({ error: err.message });
  }
};

// Mise à jour d'une pièce jointe (métadonnées)
exports.updateAttachment = async (req, res) => {
  try {
    const { id } = req.params;
    const { category, description, metadata } = req.body;

    const attachment = await Attachment.findByPk(id);

    if (!attachment) {
      return res.status(404).json({ error: 'Pièce jointe non trouvée' });
    }

    // Mise à jour
    await attachment.update({
      category: category || attachment.category,
      description: description !== undefined ? description : attachment.description,
      metadata: metadata ? JSON.parse(metadata) : attachment.metadata,
      updated_at: new Date()
    });

    // Récupération avec les relations (désactivé car associations désactivées)
    const updatedAttachment = await Attachment.findByPk(id);
      // include: [
      //   { model: User, as: 'uploader', attributes: ['id', 'first_name', 'last_name', 'email'] },
      //   { model: User, as: 'deleter', attributes: ['id', 'first_name', 'last_name', 'email'] }
      // ]

    res.json(updatedAttachment);
  } catch (err) {
    console.error('❌ Erreur update attachment:', err);
    res.status(500).json({ error: err.message });
  }
};

// Suppression logique (soft delete)
exports.softDeleteAttachment = async (req, res) => {
  try {
    const { id } = req.params;

    const attachment = await Attachment.findByPk(id);

    if (!attachment) {
      return res.status(404).json({ error: 'Pièce jointe non trouvée' });
    }

    if (attachment.is_deleted) {
      return res.status(400).json({ error: 'Fichier déjà supprimé' });
    }

    // Suppression logique
    await attachment.update({
      is_deleted: true,
      deleted_at: new Date(),
      deleted_by: req.user?.id
    });

    res.json({ message: 'Pièce jointe supprimée avec succès', attachment });
  } catch (err) {
    console.error('❌ Erreur soft delete attachment:', err);
    res.status(500).json({ error: err.message });
  }
};

// Suppression physique (hard delete)
exports.hardDeleteAttachment = async (req, res) => {
  try {
    const { id } = req.params;

    const attachment = await Attachment.findByPk(id);

    if (!attachment) {
      return res.status(404).json({ error: 'Pièce jointe non trouvée' });
    }

    // Suppression du fichier physique
    try {
      await fs.unlink(attachment.storage_path);
      console.log('✅ Fichier physique supprimé:', attachment.storage_path);
    } catch (err) {
      console.warn('⚠️ Fichier physique non trouvé ou déjà supprimé:', err.message);
    }

    // Suppression de l'enregistrement
    await attachment.destroy();

    res.json({ message: 'Pièce jointe supprimée définitivement' });
  } catch (err) {
    console.error('❌ Erreur hard delete attachment:', err);
    res.status(500).json({ error: err.message });
  }
};

// Restauration d'une pièce jointe supprimée
exports.restoreAttachment = async (req, res) => {
  try {
    const { id } = req.params;

    const attachment = await Attachment.findByPk(id);

    if (!attachment) {
      return res.status(404).json({ error: 'Pièce jointe non trouvée' });
    }

    if (!attachment.is_deleted) {
      return res.status(400).json({ error: 'Fichier non supprimé' });
    }

    // Restauration
    await attachment.update({
      is_deleted: false,
      deleted_at: null,
      deleted_by: null
    });

    res.json({ message: 'Pièce jointe restaurée avec succès', attachment });
  } catch (err) {
    console.error('❌ Erreur restore attachment:', err);
    res.status(500).json({ error: err.message });
  }
};

// Statistiques des pièces jointes
exports.getAttachmentStats = async (req, res) => {
  try {
    const { entity_type, entity_id } = req.query;

    const where = {
      is_deleted: false
    };

    if (entity_type) where.entity_type = entity_type;
    if (entity_id) where.entity_id = entity_id;

    const stats = await Attachment.findAll({
      where,
      attributes: [
        'category',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('size_bytes')), 'total_size']
      ],
      group: ['category']
    });

    const total = await Attachment.count({ where });
    const totalSize = await Attachment.sum('size_bytes', { where });

    res.json({
      total,
      total_size: totalSize || 0,
      by_category: stats
    });
  } catch (err) {
    console.error('❌ Erreur stats attachments:', err);
    res.status(500).json({ error: err.message });
  }
};

// Export de la configuration multer pour utilisation dans les routes
exports.uploadMiddleware = upload.single('file');
