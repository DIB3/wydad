const socketio = require('socket.io');
let io;
function initSocket(server) {
  io = socketio(server, { cors: { origin: '*' } });
  io.on('connection', (socket) => {
    console.log('Client connecté:', socket.id);
    
    // Rejoindre une room par joueur
    socket.on('joinPlayer', (playerId) => {
      socket.join(`player_${playerId}`)
      console.log(`Socket ${socket.id} a rejoint la room player_${playerId}`)
    });
    
    // Rejoindre une room par utilisateur (pour les notifications)
    socket.on('joinUser', (userId) => {
      socket.join(`user_${userId}`)
      console.log(`Socket ${socket.id} a rejoint la room user_${userId}`)
    });
    
    socket.on('disconnect', () => console.log('Déconnecté:', socket.id));
  });
}
// Exemples d'émission d'événements temps réel
function emitVisitValidated(playerId, visitId) {
  if (io) io.to(`player_${playerId}`).emit('visitValidated', { visitId });
}
function emitCertificateCreated(playerId, certificateId) {
  if (io) io.to(`player_${playerId}`).emit('certificateCreated', { certificateId });
}
function emitCertificateDeleted(playerId, certificateId) {
  if (io) io.to(`player_${playerId}`).emit('certificateDeleted', { certificateId });
}
function emitAttachmentUploaded(playerId, attachmentId) {
  if (io) io.to(`player_${playerId}`).emit('attachmentUploaded', { attachmentId });
}
function emitAttachmentDeleted(playerId, attachmentId) {
  if (io) io.to(`player_${playerId}`).emit('attachmentDeleted', { attachmentId });
}
function emitUserCreated(user) {
  if (io) io.emit('userCreated', user);
}
function emitUserUpdated(user) {
  if (io) io.emit('userUpdated', user);
}
function emitUserDeleted(userId) {
  if (io) io.emit('userDeleted', { id: userId });
}
function emitPlayerCreated(player) {
  if (io) io.emit('playerCreated', player);
}
function emitPlayerUpdated(player) {
  if (io) io.emit('playerUpdated', player);
}
function emitPlayerDeleted(playerId) {
  if (io) io.emit('playerDeleted', { id: playerId });
}
function emitVisitCreated(visit) {
  if (io) io.emit('visitCreated', visit);
}
function emitVisitUpdated(visit) {
  if (io) io.emit('visitUpdated', visit);
}
function emitVisitDeleted(visitId) {
  if (io) io.emit('visitDeleted', { id: visitId });
}
function emitModuleCreated(module, data) {
  if (io) io.emit(`${module}Created`, data);
}
function emitModuleUpdated(module, data) {
  if (io) io.emit(`${module}Updated`, data);
}
function emitModuleDeleted(module, id) {
  if (io) io.emit(`${module}Deleted`, { id });
}
// Notifications temps réel
function emitNotificationCreated(notification) {
  if (io) {
    // Émettre à l'utilisateur spécifique
    io.to(`user_${notification.user_id}`).emit('notificationCreated', notification);
    // Émettre aussi globalement pour le compteur
    io.emit('notificationCountUpdated', { userId: notification.user_id });
  }
}
function emitNotificationRead(notification) {
  if (io) {
    io.to(`user_${notification.user_id}`).emit('notificationRead', notification);
    io.emit('notificationCountUpdated', { userId: notification.user_id });
  }
}
function emitNotificationDeleted(notificationId) {
  if (io) io.emit('notificationDeleted', { id: notificationId });
}
module.exports = {
  initSocket,
  emitVisitValidated,
  emitCertificateCreated,
  emitCertificateDeleted,
  emitAttachmentUploaded,
  emitAttachmentDeleted,
  emitUserCreated,
  emitUserUpdated,
  emitUserDeleted,
  emitPlayerCreated,
  emitPlayerUpdated,
  emitPlayerDeleted,
  emitVisitCreated,
  emitVisitUpdated,
  emitVisitDeleted,
  emitModuleCreated,
  emitModuleUpdated,
  emitModuleDeleted,
  emitNotificationCreated,
  emitNotificationRead,
  emitNotificationDeleted
};
