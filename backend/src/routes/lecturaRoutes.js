const express = require('express');
const router = express.Router();
const controller = require('../controllers/lecturaController');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);

router.get('/stats', controller.getStatsLectura);

router.get('/mis-libros', controller.getMisLibros);

router.post('/tiempo', controller.submitTiempoLectura);

router.get('/:libroId/progreso', controller.getProgreso);
router.post('/:libroId/progreso', controller.saveProgreso);

module.exports = router;