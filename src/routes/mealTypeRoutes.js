const express = require('express');
const router = express.Router();
const controller = require('../controllers/mealTypeController');
const auth = require('../middlewares/auth');

router.post('/', auth, controller.create);
router.get('/', auth, controller.getAll);
router.get('/:id', auth, controller.getById);
router.put('/:id', auth, controller.update);
router.delete('/:id', auth, controller.delete);

module.exports = router;

