const express = require('express');
const router = express.Router();
const visitCareController = require('../controllers/visitCareController');
const auth = require('../middlewares/auth');

router.post('/', auth, visitCareController.create);
router.get('/', auth, visitCareController.getAll);
router.get('/:visitId', auth, visitCareController.getByVisitId);
router.put('/:visitId', auth, visitCareController.update);
router.delete('/:visitId', auth, visitCareController.delete);

module.exports = router;

