const fs = require('fs');
const path = require('path');

const UPLOADS_DIR = path.join(__dirname, '../../uploads');
const TEXTOS_DIR = path.join(UPLOADS_DIR, 'textos');
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

async function main() {
  if (!fs.existsSync(TEXTOS_DIR)) fs.mkdirSync(TEXTOS_DIR, { recursive: true });

  const ok = [];
  const errores = [];

  for (const libro of LIBROS) {
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
      const archivo = `${slugificar(libro.es)}.txt`;
      fs.writeFileSync(path.join(TEXTOS_DIR, archivo), texto, 'utf8');
      ok.push(`id=${libro.id} | ${libro.es} | ${encontrado.languages[0]} | ${texto.length} caracteres`);
    } catch (e) {
      errores.push(`id=${libro.id} ${libro.es}: ${e.message}`);
    }
  }

  console.log('\n=== TEXTOS GUARDADOS ===');
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