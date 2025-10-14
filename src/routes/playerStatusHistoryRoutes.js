const express = require('express');
const router = express.Router();
const playerStatusHistoryController = require('../controllers/playerStatusHistoryController');
const auth = require('../middlewares/auth');

router.post('/', auth, playerStatusHistoryController.create);
router.get('/', auth, playerStatusHistoryController.getAll);
router.get('/:id', auth, playerStatusHistoryController.getById);
router.delete('/:id', auth, playerStatusHistoryController.delete);

module.exports = router;
