const express = require('express');
const router = express.Router();
const controller = require('../controllers/libroController');
const { verifyToken, requireAdmin } = require('../middleware/auth');

router.use(verifyToken);

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', requireAdmin, controller.create);
router.put('/:id', requireAdmin, controller.update);
router.delete('/:id', requireAdmin, controller.delete);

module.exports = router;
