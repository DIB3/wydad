const express = require('express');
const router = express.Router();
const visitGpsController = require('../controllers/visitGpsController');
const auth = require('../middlewares/auth');

router.post('/', auth, visitGpsController.create);
router.get('/:visitId', auth, visitGpsController.getByVisitId);
router.put('/:visitId', auth, visitGpsController.update);
router.delete('/:visitId', auth, visitGpsController.delete);

module.exports = router;
