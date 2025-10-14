const express = require('express');
const router = express.Router();
const visitExamenMedicalController = require('../controllers/visitExamenMedicalController');

// Routes
router.post('/', visitExamenMedicalController.create);
router.get('/', visitExamenMedicalController.getAll);
router.get('/:visitId', visitExamenMedicalController.getByVisitId);
router.put('/:visitId', visitExamenMedicalController.update);
router.delete('/:visitId', visitExamenMedicalController.delete);
router.get('/player/:playerId', visitExamenMedicalController.getByPlayerId);

module.exports = router;

