const express = require('express');
const router = express.Router();
const visitExamenMedicalController = require('../controllers/visitExamenMedicalController');

// Routes - IMPORTANT: Les routes spécifiques doivent être AVANT les routes avec paramètres génériques
router.post('/', visitExamenMedicalController.create);
router.get('/', visitExamenMedicalController.getAll);
// Routes spécifiques en premier
router.get('/player/:playerId', visitExamenMedicalController.getByPlayerId);
// Routes génériques avec :visitId en dernier
router.get('/:visitId', visitExamenMedicalController.getByVisitId);
router.put('/:visitId', visitExamenMedicalController.update);
router.delete('/:visitId', visitExamenMedicalController.delete);

module.exports = router;

