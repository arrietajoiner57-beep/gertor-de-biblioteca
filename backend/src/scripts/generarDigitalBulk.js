const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const UPLOADS_DIR = path.join(__dirname, '../../uploads');

function slugificar(texto) {
  return String(texto)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function generarLibro(libro, paginas) {
  const archivo = `${slugificar(libro.titulo)}.pdf`;
  const ruta = path.join(UPLOADS_DIR, archivo);

  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }

  const doc = new PDFDocument({ size: 'LETTER', margins: { top: 72, bottom: 72, left: 72, right: 72 } });

  await new Promise((resolve, reject) => {
    const flujo = fs.createWriteStream(ruta);
    doc.pipe(flujo);

    doc
      .fontSize(28)
      .font('Helvetica-Bold')
      .fillColor('#3d2314')
      .text(libro.titulo, { align: 'center' });

    doc
      .moveDown(0.3)
      .fontSize(14)
      .font('Helvetica')
      .fillColor('#6b5847')
      .text(`por ${libro.autor}`, { align: 'center' });

    doc.moveDown(1);
    doc.moveTo(72, doc.y).lineTo(72 + 468, doc.y).strokeColor('#d97706').lineWidth(1.2).stroke();

    doc
      .moveDown(1)
      .fontSize(12)
      .fillColor('#38271a')
      .text(
        `Este es un documento de demostracion de la biblioteca digital.\n
La pagina actual se sincroniza automaticamente con tu perfil y se
retoma donde la dejaste al volver a abrir el libro.`,
        { lineGap: 6 }
      );

    for (let p = 1; p <= paginas; p++) {
      doc.addPage();
      doc
        .fontSize(22)
        .font('Helvetica-Bold')
        .fillColor('#3d2314')
        .text(`Capitulo de muestra ${p}`, { align: 'center' });
      doc
        .moveDown(1)
        .fontSize(12)
        .font('Helvetica')
        .fillColor('#38271a')
        .text(
          `Pagina ${p} de la obra "${libro.titulo}". Este texto de relleno permite
          comprobar la navegacion entre paginas, el zoom, el cambio de tema y el
          guardado automatico del progreso.`,
          { lineGap: 6 }
        );
      doc
        .moveDown(2)
        .fillColor('#8a7765')
        .fontSize(9)
        .text(`Biblioteca Nova - Lectura digital autorizada`, { align: 'center' });
    }

    doc.end();
    flujo.on('finish', resolve);
    flujo.on('error', reject);
  });

  return { archivo, paginas };
}

async function main() {
  const pool = require('../config/db');

  const [libros] = await pool.query(
    `SELECT id, titulo, autor
     FROM libros
     WHERE (archivo_url IS NULL OR archivo_url = '')
     ORDER BY id DESC`
  );

  if (libros.length === 0) {
    console.log('No hay libros pendientes por asignar archivo digital.');
    await pool.end();
    return;
  }

  const conexion = await pool.getConnection();
  try {
    await conexion.beginTransaction();
    for (const libro of libros) {
      const paginas = 24 + (libro.id % 30);
      const { archivo } = await generarLibro(libro, paginas);
      await conexion.query(
        'UPDATE libros SET archivo_url = ?, formato = ?, paginas = ?, es_digital = 1 WHERE id = ?',
        [archivo, 'pdf', paginas, libro.id]
      );
      console.log(`id=${libro.id} | ${libro.titulo} | ${archivo} (${paginas} paginas)`);
    }
    await conexion.commit();
  } catch (e) {
    await conexion.rollback();
    throw e;
  } finally {
    conexion.release();
    await pool.end();
  }
  console.log(`\nListo: ${libros.length} libros digitales asignados.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});