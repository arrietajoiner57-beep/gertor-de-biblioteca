const express = require('express');
const router = express.Router();
const controller = require('../controllers/sugerenciaController');
const { verifyToken, requireBibliotecario } = require('../middleware/auth');

router.use(verifyToken);

router.get('/', controller.getAll);
router.post('/', controller.crear);
router.post('/:id/votar', controller.votar);
router.put('/:id/estado', requireBibliotecario, controller.cambiarEstado);
router.delete('/:id', controller.eliminar);

module.exports = router;