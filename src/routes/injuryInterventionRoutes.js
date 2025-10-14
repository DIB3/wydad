const express = require('express');
const router = express.Router();
const injuryInterventionController = require('../controllers/injuryInterventionController');
const auth = require('../middlewares/auth');

router.post('/', auth, injuryInterventionController.create);
router.get('/:injuryId', auth, injuryInterventionController.getByInjuryId);
router.put('/:injuryId', auth, injuryInterventionController.update);
router.delete('/:injuryId', auth, injuryInterventionController.delete);

module.exports = router;
