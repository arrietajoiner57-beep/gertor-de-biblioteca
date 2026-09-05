const express = require('express');
const router = express.Router();
const controller = require('../controllers/resenaController');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);

router.get('/', controller.getAllRecientes);
router.get('/libro/:libroId', controller.getByLibro);
router.post('/', controller.crear);
router.post('/:id/like', controller.toggleLike);
router.delete('/:id', controller.eliminar);

module.exports = router;