const Notification = require('../models/notification');
const { emitNotificationCreated, emitNotificationRead, emitNotificationDeleted } = require('../socket');

// Créer une notification
exports.create = async (req, res) => {
  try {
    const notification = await Notification.create(req.body);
    emitNotificationCreated(notification); // Temps réel
    res.status(201).json(notification);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Récupérer toutes les notifications d'un utilisateur
exports.getByUserId = async (req, res) => {
  try {
    const { user_id } = req.params;
    const notifications = await Notification.findAll({
      where: { user_id },
      order: [['created_at', 'DESC']]
    });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Récupérer toutes les notifications non lues d'un utilisateur
exports.getUnreadByUserId = async (req, res) => {
  try {
    const { user_id } = req.params;
    const notifications = await Notification.findAll({
      where: { 
        user_id,
        is_read: false
      },
      order: [['created_at', 'DESC']]
    });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Compter les notifications non lues
exports.countUnreadByUserId = async (req, res) => {
  try {
    const { user_id } = req.params;
    const count = await Notification.count({
      where: { 
        user_id,
        is_read: false
      }
    });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Marquer une notification comme lue
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findByPk(req.params.id);
    if (!notification) {
      return res.status(404).json({ error: 'Notification non trouvée' });
    }
    
    await notification.update({ is_read: true });
    emitNotificationRead(notification); // Temps réel
    res.json(notification);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Marquer toutes les notifications comme lues
exports.markAllAsRead = async (req, res) => {
  try {
    const { user_id } = req.params;
    await Notification.update(
      { is_read: true },
      { 
        where: { 
          user_id,
          is_read: false
        }
      }
    );
    res.json({ message: 'Toutes les notifications ont été marquées comme lues' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Supprimer une notification
exports.delete = async (req, res) => {
  try {
    const notification = await Notification.findByPk(req.params.id);
    if (!notification) {
      return res.status(404).json({ error: 'Notification non trouvée' });
    }
    
    await notification.destroy();
    emitNotificationDeleted(req.params.id); // Temps réel
    res.json({ message: 'Notification supprimée' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Supprimer toutes les notifications lues d'un utilisateur
exports.deleteAllRead = async (req, res) => {
  try {
    const { user_id } = req.params;
    await Notification.destroy({
      where: {
        user_id,
        is_read: true
      }
    });
    res.json({ message: 'Toutes les notifications lues ont été supprimées' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Fonction utilitaire pour créer une notification (utilisée par d'autres contrôleurs)
exports.createNotificationForUser = async (userId, data) => {
  try {
    const notification = await Notification.create({
      user_id: userId,
      ...data
    });
    emitNotificationCreated(notification);
    return notification;
  } catch (err) {
    console.error('Erreur lors de la création de la notification:', err);
    return null;
  }
};

// Fonction utilitaire pour créer une notification pour tous les utilisateurs
exports.createNotificationForAll = async (data) => {
  try {
    const User = require('../models/user');
    const users = await User.findAll({ attributes: ['id'] });
    
    const notifications = await Promise.all(
      users.map(user => 
        Notification.create({
          user_id: user.id,
          ...data
        })
      )
    );
    
    notifications.forEach(notification => emitNotificationCreated(notification));
    return notifications;
  } catch (err) {
    console.error('Erreur lors de la création des notifications:', err);
    return [];
  }
};

