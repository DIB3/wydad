const express = require('express');
const router = express.Router();
const controller = require('../controllers/planSemaineNutritionController');
const auth = require('../middlewares/auth');

// CRUD Plan semaine
router.post('/', auth, controller.createPlan);
router.delete('/:planId', auth, controller.deletePlan);
router.get('/player/:playerId', auth, controller.getPlansByPlayer);
router.get('/:planId/details', auth, controller.getPlanDetails);

// Ajouter repas au plan
router.post('/repas', auth, controller.addRepas);

module.exports = router;
