const express = require('express');
const router = express.Router();
const visitCareController = require('../controllers/visitCareController');
const auth = require('../middlewares/auth');

// Routes - IMPORTANT: Les routes spécifiques doivent être AVANT les routes avec paramètres génériques
router.post('/', auth, visitCareController.create);
router.get('/', auth, visitCareController.getAll);
// Routes spécifiques en premier
router.get('/player/:playerId', auth, visitCareController.getByPlayerId);
// Routes génériques avec :visitId en dernier
router.get('/:visitId', auth, visitCareController.getByVisitId);
router.put('/:visitId', auth, visitCareController.update);
router.delete('/:visitId', auth, visitCareController.delete);

module.exports = router;

