const express = require('express');
const router = express.Router();
const injuryExamController = require('../controllers/injuryExamController');
const auth = require('../middlewares/auth');

router.post('/', auth, injuryExamController.create);
router.get('/:injuryId', auth, injuryExamController.getByInjuryId);
router.put('/:injuryId', auth, injuryExamController.update);
router.delete('/:injuryId', auth, injuryExamController.delete);

module.exports = router;
