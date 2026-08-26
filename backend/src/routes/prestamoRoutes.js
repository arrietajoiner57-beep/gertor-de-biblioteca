const express = require('express');
const router = express.Router();
const controller = require('../controllers/prestamoController');
const { verifyToken, requireAdmin, requireBibliotecario } = require('../middleware/auth');

router.use(verifyToken);

router.get('/', requireBibliotecario, controller.getAll);
router.get('/mis', controller.getMisPrestamos);
router.get('/:id', requireBibliotecario, controller.getById);
router.post('/', requireBibliotecario, controller.create);
router.post('/solicitar', controller.solicitar);
router.put('/:id/aprobar', requireBibliotecario, controller.aprobar);
router.put('/:id/rechazar', requireBibliotecario, controller.rechazar);
router.put('/:id/devolver', requireBibliotecario, controller.devolver);
router.put('/:id', requireBibliotecario, controller.update);
router.delete('/:id', requireBibliotecario, controller.delete);

module.exports = router;
