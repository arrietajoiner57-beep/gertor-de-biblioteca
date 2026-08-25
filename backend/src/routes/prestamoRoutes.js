const express = require('express');
const router = express.Router();
const controller = require('../controllers/prestamoController');
const { verifyToken, requireAdmin } = require('../middleware/auth');

router.use(verifyToken);

router.get('/', requireAdmin, controller.getAll);
router.get('/mis', controller.getMisPrestamos);
router.get('/:id', requireAdmin, controller.getById);
router.post('/', requireAdmin, controller.create);
router.post('/solicitar', controller.solicitar);
router.put('/:id/aprobar', requireAdmin, controller.aprobar);
router.put('/:id/rechazar', requireAdmin, controller.rechazar);
router.put('/:id/devolver', requireAdmin, controller.devolver);
router.put('/:id', requireAdmin, controller.update);
router.delete('/:id', requireAdmin, controller.delete);

module.exports = router;
