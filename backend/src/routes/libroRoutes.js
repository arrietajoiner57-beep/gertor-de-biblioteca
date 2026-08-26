const express = require('express');
const router = express.Router();
const controller = require('../controllers/libroController');
const { verifyToken, requireBibliotecario } = require('../middleware/auth');

router.use(verifyToken);

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', requireBibliotecario, controller.create);
router.put('/:id', requireBibliotecario, controller.update);
router.delete('/:id', requireBibliotecario, controller.delete);

module.exports = router;
