const express = require('express');
const router = express.Router();
const visitSoinsController = require('../controllers/visitSoinsController');

// Routes - IMPORTANT: Les routes spécifiques doivent être AVANT les routes avec paramètres génériques
router.post('/', visitSoinsController.create);
router.get('/', visitSoinsController.getAll);
// Routes spécifiques en premier
router.get('/player/:playerId', visitSoinsController.getByPlayerId);
router.get('/blessure/:blessureId', visitSoinsController.getByBlessureId);
// Routes génériques avec :visitId en dernier
router.get('/:visitId', visitSoinsController.getByVisitId);
router.put('/:visitId', visitSoinsController.update);
router.delete('/:visitId', visitSoinsController.delete);

module.exports = router;

