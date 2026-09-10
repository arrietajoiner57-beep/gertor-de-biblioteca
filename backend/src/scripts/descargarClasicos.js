const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const UPLOADS_DIR = path.join(__dirname, '../../uploads');
const API_BASE = process.env.API_BASE || 'http://localhost:4000/api';

const LIBROS = [
  { id: 2, es: 'Don Quijote', en: 'Don Quijote' },
  { id: 5, es: 'Crimen y castigo', en: 'Crime and Punishment' },
  { id: 6, es: 'Orgullo y prejuicio', en: 'Pride and Prejudice' },
  { id: 8, es: 'La metamorfosis', en: 'Metamorphosis' },
  { id: 15, es: 'Guerra y paz', en: 'War and Peace' },
  { id: 23, es: 'Fábulas de Esopo', en: 'Aesop\'s Fables' },
  { id: 24, es: 'Alicia en el país de las maravillas', en: 'Alice\'s Adventures in Wonderland' },
  { id: 25, es: 'El maravilloso mago de Oz', en: 'The Wonderful Wizard of Oz' },
  { id: 26, es: 'Peter Pan', en: 'Peter Pan' },
  { id: 27, es: 'Cumbres borrascosas', en: 'Wuthering Heights' },
  { id: 28, es: 'Romeo y Julieta', en: 'Romeo and Juliet' },
  { id: 29, es: 'Persuasión', en: 'Persuasion' },
  { id: 30, es: 'Sentido y sensibilidad', en: 'Sense and Sensibility' },
  { id: 31, es: 'El retrato de Dorian Gray', en: 'The Picture of Dorian Gray' },
  { id: 32, es: 'Anna Karenina', en: 'Anna Karenina' },
  { id: 33, es: 'Los hermanos Karamazov', en: 'The Brothers Karamazov' },
  { id: 34, es: 'Middlemarch', en: 'Middlemarch' },
  { id: 36, es: 'Madame Bovary', en: 'Madame Bovary' },
  { id: 38, es: 'Al faro', en: 'To the Lighthouse' },
  { id: 44, es: 'Las aventuras de Sherlock Holmes', en: 'The Adventures of Sherlock Holmes' },
  { id: 47, es: 'La isla del tesoro', en: 'Treasure Island' },
  { id: 48, es: 'Viaje al centro de la Tierra', en: 'A Journey to the Centre of the Earth' },
  { id: 49, es: 'El corazón de las tinieblas', en: 'Heart of Darkness' },
  { id: 50, es: 'La vuelta al mundo en 80 días', en: 'Around the World in Eighty Days' },
  { id: 51, es: 'La Ilíada', en: 'The Iliad' },
  { id: 52, es: 'Beowulf', en: 'Beowulf' },
  { id: 53, es: 'La Eneida', en: 'The Aeneid' },
  { id: 54, es: 'Gargantúa y Pantagruel', en: 'Gargantua and Pantagruel' },
  { id: 59, es: 'Drácula', en: 'Dracula' },
  { id: 60, es: 'Frankenstein', en: 'Frankenstein' }
];

const CHARS_POR_PAGINA = 1650;

const SOLO_ID = parseInt(process.argv[2], 10) || null;

function slugificar(texto) {
  return String(texto)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function puntuarLenguaje(libro, idiomas) {
  if (idiomas.includes('es')) return 300;
  if (idiomas.includes('en')) return 100;
  return 0;
}

async function buscarEnGutendex(titulo) {
  const url = `https://gutendex.com/books?search=${encodeURIComponent(titulo)}`;
  const resp = await fetch(url);
  const datos = await resp.json();
  if (!datos.results || datos.results.length === 0) return [];
  return datos.results
    .map((r) => ({
      id: r.id,
      title: r.title,
      languages: r.languages || [],
      formats: r.formats || {}
    }))
    .sort((a, b) => puntuarLenguaje(null, b.languages) - puntuarLenguaje(null, a.languages));
}

async function elegirLibro(libro) {
  const aceptar = (candidatos) =>
    candidatos.find((r) => r.languages.includes('es')) ||
    candidatos.find((r) => r.languages.includes('en')) ||
    null;
  const candidatosEs = await buscarEnGutendex(libro.es);
  let mejor = aceptar(candidatosEs);
  if (!mejor) {
    const candidatosEn = await buscarEnGutendex(libro.en);
    mejor = aceptar(candidatosEn);
  }
  return mejor || null;
}

async function descargarTexto(libroG) {
  const url = libroG.formats['text/plain; charset=utf-8'] ||
    libroG.formats['text/plain'] ||
    libroG.formats['text/plain; charset=us-ascii'] ||
    libroG.formats['text/html; charset=utf-8'];
  if (!url) return null;
  const resp = await fetch(url);
  if (!resp.ok) return null;
  const texto = await resp.text();
  const inicio = texto.indexOf('*** START');
  const fin = texto.indexOf('*** END');
  const cuerpo = inicio >= 0
    ? (fin > inicio ? texto.slice(inicio, fin) : texto.slice(inicio))
    : texto;
  return cuerpo.replace(/\r/g, '').replace(/[ \t]+\n/g, '\n');
}

function dividirEnPaginas(texto) {
  const parrafos = texto.split(/\n\s*\n/).map((p) => p.replace(/\s*\n\s*/g, ' ').trim()).filter(Boolean);
  const paginas = [];
  let actual = '';
  for (const parrafo of parrafos) {
    if ((actual + '\n\n' + parrafo).length > CHARS_POR_PAGINA && actual) {
      paginas.push(actual);
      actual = parrafo;
    } else {
      actual = actual ? `${actual}\n\n${parrafo}` : parrafo;
    }
  }
  if (actual) paginas.push(actual);
  return paginas;
}

async function generarPdf(titulo, tituloOriginal, idioma, paginasTexto, ruta) {
  const doc = new PDFDocument({ size: 'LETTER', margins: { top: 64, bottom: 64, left: 64, right: 64 } });
  return new Promise((resolve, reject) => {
    const flujo = fs.createWriteStream(ruta);
    doc.pipe(flujo);
    doc.fontSize(22).font('Helvetica-Bold').fillColor('#3d2314').text(titulo, { align: 'center' });
    doc.moveDown(0.3);
    doc.fontSize(12).font('Helvetica').fillColor('#6b5847').text(`${tituloOriginal} · ${idioma.toUpperCase()}`, { align: 'center' });
    doc.moveDown(0.6);
    doc.moveTo(64, doc.y).lineTo(64 + 482, doc.y).strokeColor('#d97706').lineWidth(1.2).stroke();
    doc.moveDown(0.6);
    for (let i = 0; i < paginasTexto.length; i++) {
      if (i > 0) doc.addPage();
      doc.fontSize(11).font('Helvetica').fillColor('#38271a').text(paginasTexto[i], { lineGap: 4 });
    }
    doc.end();
    flujo.on('finish', resolve);
    flujo.on('error', reject);
  });
}

async function login() {
  const resp = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@biblioteca.com', contrasena: 'admin123' })
  });
  const datos = await resp.json();
  return datos.token;
}

async function main() {
  if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

  let token;
  try {
    token = await login();
  } catch (e) {
    console.error('No se pudo iniciar sesión con la API:', e.message);
    process.exit(1);
  }

  const ok = [];
  const errores = [];

  for (const libro of LIBROS) {
    if (SOLO_ID && libro.id !== SOLO_ID) continue;
    try {
      const encontrado = await elegirLibro(libro);
      if (!encontrado) {
        errores.push(`id=${libro.id} ${libro.es}: no encontrado`);
        continue;
      }
      const texto = await descargarTexto(encontrado);
      if (!texto) {
        errores.push(`id=${libro.id} ${libro.es}: sin texto descargable`);
        continue;
      }
      const paginasTexto = dividirEnPaginas(texto);
      const archivo = `${slugificar(libro.es)}.pdf`;
      const ruta = path.join(UPLOADS_DIR, archivo);
      await generarPdf(libro.es, encontrado.title, encontrado.languages[0] || '??', paginasTexto, ruta);

      const resp = await fetch(`${API_BASE}/libros/${libro.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          es_digital: 1,
          archivo_url: archivo,
          formato: 'pdf',
          paginas: paginasTexto.length
        })
      });
      if (!resp.ok) {
        errores.push(`id=${libro.id} ${libro.es}: error API ${resp.status}`);
        continue;
      }
      ok.push(`id=${libro.id} | ${libro.es} | ${encontrado.languages[0]} | ${paginasTexto.length} paginas`);
    } catch (e) {
      errores.push(`id=${libro.id} ${libro.es}: ${e.message}`);
    }
  }

  console.log('\n=== ASIGNADOS ===');
  ok.forEach((l) => console.log(l));
  if (errores.length > 0) {
    console.log('\n=== ERRORES ===');
    errores.forEach((l) => console.log(l));
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});