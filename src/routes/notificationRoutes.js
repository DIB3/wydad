const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const auth = require('../middlewares/auth');

// Toutes les routes nécessitent l'authentification
router.use(auth);

// Créer une notification
router.post('/', notificationController.create);

// Récupérer toutes les notifications d'un utilisateur
router.get('/user/:user_id', notificationController.getByUserId);

// Récupérer les notifications non lues d'un utilisateur
router.get('/user/:user_id/unread', notificationController.getUnreadByUserId);

// Compter les notifications non lues
router.get('/user/:user_id/unread/count', notificationController.countUnreadByUserId);

// Marquer une notification comme lue
router.patch('/:id/read', notificationController.markAsRead);

// Marquer toutes les notifications comme lues
router.patch('/user/:user_id/read-all', notificationController.markAllAsRead);

// Supprimer une notification
router.delete('/:id', notificationController.delete);

// Supprimer toutes les notifications lues
router.delete('/user/:user_id/read', notificationController.deleteAllRead);

module.exports = router;

