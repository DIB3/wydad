const express = require('express');
const router = express.Router();
const visitSoinsController = require('../controllers/visitSoinsController');

// Routes
router.post('/', visitSoinsController.create);
router.get('/', visitSoinsController.getAll);
router.get('/:visitId', visitSoinsController.getByVisitId);
router.put('/:visitId', visitSoinsController.update);
router.delete('/:visitId', visitSoinsController.delete);
router.get('/player/:playerId', visitSoinsController.getByPlayerId);
router.get('/blessure/:blessureId', visitSoinsController.getByBlessureId);

module.exports = router;

