const express = require('express');
const router = express.Router();
const visitNutritionController = require('../controllers/visitNutritionController');
const auth = require('../middlewares/auth');

router.post('/', auth, visitNutritionController.create);
router.get('/:visitId', auth, visitNutritionController.getByVisitId);
router.put('/:visitId', auth, visitNutritionController.update);
router.delete('/:visitId', auth, visitNutritionController.delete);
router.get('/type/:mealTypeId', auth, visitNutritionController.getAllByType);

module.exports = router;
