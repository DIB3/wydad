const express = require('express');
const router = express.Router();
const visitImpedanceController = require('../controllers/visitImpedanceController');
const auth = require('../middlewares/auth');

router.post('/', auth, visitImpedanceController.create);
router.get('/:visitId', auth, visitImpedanceController.getByVisitId);
router.put('/:visitId', auth, visitImpedanceController.update);
router.delete('/:visitId', auth, visitImpedanceController.delete);

module.exports = router;
