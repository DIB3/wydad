const express = require('express');
const router = express.Router();
const visitPcmaController = require('../controllers/visitPcmaController');
const auth = require('../middlewares/auth');

router.post('/', auth, visitPcmaController.create);
router.get('/:visitId', auth, visitPcmaController.getByVisitId);
router.put('/:visitId', auth, visitPcmaController.update);
router.delete('/:visitId', auth, visitPcmaController.delete);

module.exports = router;
