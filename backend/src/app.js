require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./config/db');
const { verifyToken, requireAdmin } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/usuarios', require('./routes/usuarioRoutes'));
app.use('/api/libros', require('./routes/libroRoutes'));
app.use('/api/prestamos', require('./routes/prestamoRoutes'));

// Dashboard del administrador
app.get('/api/stats', verifyToken, requireAdmin, async (req, res) => {
  try {
    const [usuarios] = await pool.query('SELECT COUNT(*) as total FROM usuario');
    const [libros] = await pool.query('SELECT COUNT(*) as total, COALESCE(SUM(cantidad_disponible),0) as disponibles FROM libros');
    const [prestados] = await pool.query(`
      SELECT COALESCE(SUM(dp.cantidad),0) as total
      FROM prestamo p INNER JOIN detalle_prestamo dp ON p.id = dp.prestamo_id
      WHERE p.estado = 'activo'
    `);
    const [activos] = await pool.query("SELECT COUNT(*) as total FROM prestamo WHERE estado = 'activo' AND fecha_devolucion >= CURDATE()");
    const [vencidos] = await pool.query("SELECT COUNT(*) as total FROM prestamo WHERE estado = 'activo' AND fecha_devolucion < CURDATE()");
    const [devueltos] = await pool.query("SELECT COUNT(*) as total FROM prestamo WHERE estado = 'devuelto'");
    const [ultimosPrestamos] = await pool.query(`
      SELECT p.id, p.fecha_prestamo, p.fecha_devolucion,
        CASE WHEN p.estado = 'activo' AND p.fecha_devolucion < CURDATE() THEN 'vencido' ELSE p.estado END AS estado,
        u.nombre AS nombre_usuario
      FROM prestamo p INNER JOIN usuario u ON p.usuario_id = u.id
      ORDER BY p.id DESC LIMIT 5
    `);
    const [ultimosUsuarios] = await pool.query('SELECT id, nombre, email, rol FROM usuario ORDER BY id DESC LIMIT 5');
    const [ultimosLibros] = await pool.query('SELECT id, titulo, autor, cantidad_disponible FROM libros ORDER BY id DESC LIMIT 5');

    res.json({
      totalUsuarios: usuarios[0].total,
      totalLibros: libros[0].total,
      librosDisponibles: Number(libros[0].disponibles),
      librosPrestados: Number(prestados[0].total),
      prestamosActivos: activos[0].total,
      prestamosVencidos: vencidos[0].total,
      prestamosDevueltos: devueltos[0].total,
      recientes: {
        prestamos: ultimosPrestamos,
        usuarios: ultimosUsuarios,
        libros: ultimosLibros
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'No se pudieron obtener las estadísticas' });
  }
});

// Dashboard del usuario normal (solo sus datos)
app.get('/api/stats/me', verifyToken, async (req, res) => {
  try {
    const id = req.usuario.id;
    const [activos] = await pool.query("SELECT COUNT(*) as total FROM prestamo WHERE usuario_id = ? AND estado = 'activo' AND fecha_devolucion >= CURDATE()", [id]);
    const [vencidos] = await pool.query("SELECT COUNT(*) as total FROM prestamo WHERE usuario_id = ? AND estado = 'activo' AND fecha_devolucion < CURDATE()", [id]);
    const [devueltos] = await pool.query("SELECT COUNT(*) as total FROM prestamo WHERE usuario_id = ? AND estado = 'devuelto'", [id]);
    const [librosPrestados] = await pool.query(`
      SELECT COALESCE(SUM(dp.cantidad),0) as total
      FROM prestamo p INNER JOIN detalle_prestamo dp ON p.id = dp.prestamo_id
      WHERE p.usuario_id = ? AND p.estado = 'activo'
    `, [id]);
    const [historial] = await pool.query(`
      SELECT p.id, p.fecha_prestamo, p.fecha_devolucion,
        CASE WHEN p.estado = 'activo' AND p.fecha_devolucion < CURDATE() THEN 'vencido' ELSE p.estado END AS estado
      FROM prestamo p
      WHERE p.usuario_id = ?
      ORDER BY p.id DESC LIMIT 5
    `, [id]);
    const [proximas] = await pool.query(`
      SELECT p.id, MIN(p.fecha_devolucion) AS proxima_entrega
      FROM prestamo p
      WHERE p.usuario_id = ? AND p.estado = 'activo'
      GROUP BY p.id ORDER BY proxima_entrega ASC LIMIT 1
    `, [id]);

    res.json({
      prestamosActivos: activos[0].total,
      prestamosVencidos: vencidos[0].total,
      prestamosDevueltos: devueltos[0].total,
      librosPrestados: Number(librosPrestados[0].total),
      proximaEntrega: proximas.length ? proximas[0].proxima_entrega : null,
      historial
    });
  } catch (error) {
    res.status(500).json({ message: 'No se pudo obtener tu información' });
  }
});

app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'conectada' });
  } catch (error) {
    res.status(500).json({ status: 'error', database: 'sin conexión', error: error.message });
  }
});

app.use((req, res) => {
  res.status(404).json({ message: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
});

async function start() {
  try {
    await pool.query('SELECT 1');
    console.log('Conexión a MySQL establecida');
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
      console.log(`API disponible en http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('No se pudo conectar a MySQL:', error.message);
    console.error('Revisa que XAMPP/WAMP tenga MySQL iniciado y las credenciales en backend/.env');
    process.exit(1);
  }
}

start();
