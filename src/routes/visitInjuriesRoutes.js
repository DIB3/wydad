const express = require('express');
const router = express.Router();
const visitInjuriesController = require('../controllers/visitInjuriesController');
const auth = require('../middlewares/auth');

router.post('/', auth, visitInjuriesController.create);
router.get('/:visitId', auth, visitInjuriesController.getByVisitId);
router.put('/:visitId', auth, visitInjuriesController.update);
router.delete('/:visitId', auth, visitInjuriesController.delete);

module.exports = router;
