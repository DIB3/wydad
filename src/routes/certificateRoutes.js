const express = require('express');
const router = express.Router();
const certificateController = require('../controllers/certificateController');
const auth = require('../middlewares/auth');

router.post('/', auth, certificateController.create);
router.get('/', auth, certificateController.getAll);
router.get('/player/:playerId', auth, certificateController.getByPlayerId);
router.get('/player/:playerId/latest', auth, certificateController.getLatest);
router.get('/:id/download', auth, certificateController.download);
router.get('/:id', auth, certificateController.getById);
router.delete('/:id', auth, certificateController.delete);

module.exports = router;
