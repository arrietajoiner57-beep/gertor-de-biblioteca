const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const UPLOADS_DIR = path.join(__dirname, '../../uploads');

const LIBROS_DEMO = [
  {
    titulo: 'Cien Años de Soledad',
    autor: 'Gabriel García Márquez',
    archivo: 'cien-anos-de-soledad.pdf',
    paginas: 80
  },
  {
    titulo: 'Don Quijote de la Mancha',
    autor: 'Miguel de Cervantes',
    archivo: 'don-quijote.pdf',
    paginas: 60
  }
];

function escaparTexto(titulo, autor) {
  return `
    ==============================================
    ${titulo}
    ${autor}

    EY de la Lectura Digital
    ==============================================
  `;
}

async function generarLibro(libro) {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }

  const ruta = path.join(UPLOADS_DIR, libro.archivo);
  const doc = new PDFDocument({ size: 'LETTER', margins: { top: 72, bottom: 72, left: 72, right: 72 } });

  return new Promise((resolve, reject) => {
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

    const contenido = `Este es un documento de demostracion generado para la plataforma de lectura
digital. Sirve para probar el lector integrado, el guardado automatico del
progreso y las estadisticas de lectura.

Agrega aqui el contenido completo del libro (por ejemplo, exportado a PDF)
para publicarlo en la biblioteca digital.

La pagina actual se sincroniza automaticamente con tu perfil gracias al
modulo "progreso_lectura" del backend, y se retoma donde la dejaste al
volver a abrir el libro.`;

    doc.moveDown(1).fontSize(12).fillColor('#38271a').text(contenido, { lineGap: 6 });

    for (let p = 1; p <= libro.paginas; p++) {
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
}

async function main() {
  for (const libro of LIBROS_DEMO) {
    await generarLibro(libro);
    console.log(`Generado: ${libro.archivo} (${libro.paginas + 1} paginas)`);
  }
  console.log(`\nLos archivos quedaron en: ${UPLOADS_DIR}`);
  console.log('Ahora asigna archivo_url a cada libro desde el panel de administracion (editar libro).');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});