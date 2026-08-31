const express = require('express');
const router = express.Router();
const controller = require('../controllers/reporteController');
const { verifyToken, requireAdmin, requireBibliotecario } = require('../middleware/auth');

// Todos los reportes requieren autenticación
router.use(verifyToken);

// Usuarios y libros: admin y bibliotecario
router.get('/prestamos/excel', requireBibliotecario, controller.prestamosExcel);
router.get('/prestamos/pdf', requireBibliotecario, controller.prestamosPdf);
router.get('/usuarios/excel', requireAdmin, controller.usuariosExcel);
router.get('/usuarios/pdf', requireAdmin, controller.usuariosPdf);
router.get('/libros/excel', requireBibliotecario, controller.librosExcel);
router.get('/libros/pdf', requireBibliotecario, controller.librosPdf);

module.exports = router;
