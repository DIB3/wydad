const express = require('express');
const router = express.Router();
const attachmentController = require('../controllers/attachmentController');
const auth = require('../middlewares/auth');
const optionalAuth = require('../middlewares/optionalAuth');

// Routes avec authentification OPTIONNELLE (pour permettre window.open)
router.get('/:id/download', optionalAuth, attachmentController.downloadAttachment);
router.get('/:id/view', optionalAuth, attachmentController.viewAttachment);

// Routes PROTÉGÉES (authentification obligatoire)
router.use(auth);

// Upload d'une pièce jointe
router.post('/upload', 
  attachmentController.uploadMiddleware,
  attachmentController.uploadAttachment
);

// Récupération des pièces jointes par entité
router.get('/entity/:entity_type/:entity_id', attachmentController.getAttachmentsByEntity);

// Récupération d'une pièce jointe par ID
router.get('/:id', attachmentController.getAttachmentById);

// Mise à jour des métadonnées
router.put('/:id', attachmentController.updateAttachment);

// Suppression logique (soft delete)
router.delete('/:id/soft', attachmentController.softDeleteAttachment);

// Suppression physique (hard delete)
router.delete('/:id/hard', attachmentController.hardDeleteAttachment);

// Restauration
router.post('/:id/restore', attachmentController.restoreAttachment);

// Statistiques
router.get('/stats', attachmentController.getAttachmentStats);

module.exports = router;
