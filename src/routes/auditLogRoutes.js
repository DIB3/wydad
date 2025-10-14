const express = require('express');
const router = express.Router();
const auditLogController = require('../controllers/auditLogController');
const auth = require('../middlewares/auth');

router.get('/', auth, auditLogController.getAll);
router.get('/:id', auth, auditLogController.getById);

module.exports = router;
