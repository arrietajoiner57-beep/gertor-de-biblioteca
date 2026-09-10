const express = require('express');
const router = express.Router();
const controller = require('../controllers/libroController');
const lecturaController = require('../controllers/lecturaController');
const { verifyToken, requireBibliotecario } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(verifyToken);

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.get('/:id/acceso', lecturaController.checkAcceso);
router.get('/:id/texto', lecturaController.getTexto);
router.post('/upload', requireBibliotecario, upload.single('archivo'), controller.subirArchivo);
router.get('/:id/lectura', lecturaController.streamLibro);
router.post('/', requireBibliotecario, controller.create);
router.put('/:id', requireBibliotecario, controller.update);
router.delete('/:id', requireBibliotecario, controller.delete);

module.exports = router;
