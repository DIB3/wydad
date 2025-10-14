const express = require('express');
const router = express.Router();
const visitController = require('../controllers/visitController');
const auth = require('../middlewares/auth');

router.post('/', auth, visitController.create);
router.get('/', auth, visitController.getAll);
router.get('/:id', auth, visitController.getById);
router.put('/:id', auth, visitController.update);
router.delete('/:id', auth, visitController.delete);
router.post('/:id/validate', auth, visitController.validate);

module.exports = router;
