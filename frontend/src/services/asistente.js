// Asistente Virtual de Biblioteca ("Bibliotecario Virtual").
// Motor de respuestas acotado al dominio de la biblioteca: catálogo,
// sinopsis (adaptadas por edad), recomendaciones (por edad, género y
// estado de ánimo), disponibilidad en tiempo real, normas de préstamo,
// horarios y comunidad. Devuelve respuestas estructuradas para que el
// widget pueda renderizar tarjetas interactivas con botón de préstamo.

import { getLibros } from './api';
import { CATALOGO_DEMO } from '../data/catalogoDemo';

const MENSAJE_LIMITE =
  'Mi función es ayudarte a descubrir libros y gestionar tus préstamos en la biblioteca. ¿Te gustaría que te recomiende alguna lectura para hoy?';

const MENSAJE_AYUDA =
  'Puedo responder consultas sobre:\n\n' +
  '• Resúmenes y sinopsis de libros del catálogo\n' +
  '• Resúmenes adaptados para niños y jóvenes lectores\n' +
  '• Recomendaciones por edad, género o estado de ánimo\n' +
  '• Disponibilidad de ejemplares en tiempo real\n' +
  '• Cómo solicitar un préstamo y las normas\n' +
  '• Horarios de atención, sede y eventos de la comunidad\n\n' +
  'Escribe, por ejemplo: «resumen de El Hobbit», «me siento triste, ¿qué leo?», ' +
  '«recomiéndame un libro de misterio» o «¿está disponible 1984?».';

const listarHorarios = () => {
  let texto = 'Nuestros horarios de atención son:\n\n';
  [['Lunes a Viernes', '8:00 – 20:00'], ['Sábados', '9:00 – 14:00'], ['Domingos', 'Biblioteca de familia (actividades)']].forEach(
    ([dia, hora]) => {
      texto += `🕐 ${dia}: ${hora}\n`;
    }
  );
  texto += '\nTambién puedes consultarlos en la página principal (sección «Tu biblioteca, tu casa»).';
  return texto;
};

const listarNormas = () => {
  return (
    'Estas son las normas de préstamo de la biblioteca:\n\n' +
    '• La solicitud es gratuita y se realiza en línea.\n' +
    '• El plazo estándar de devolución es de 14 días.\n' +
    '• Se permite renovar 1 vez, sin costo adicional.\n' +
    '• Puedes tener hasta 5 ejemplares en préstamo simultáneo.\n' +
    '• Recuerda devolver a tiempo para no generar retrasos.'
  );
};

const pasosPrestamo = () => {
  return (
    'Solicitar un préstamo es muy fácil:\n\n' +
    '1. Explora el catálogo en la sección «Libros».\n' +
    '2. Elige un libro disponible y pulsa «Solicitar».\n' +
    '3. Indica la cantidad deseada y envía la solicitud.\n' +
    '4. El bibliotecario la aprueba: tus fechas se fijan automáticamente (hoy + 14 días).\n' +
    '5. Verás el estado en «Mis Préstamos» y recibirás una notificación al aprobarse o devolverse.\n\n' +
    'Si eres administrador o bibliotecario, también puedes registrar el préstamo manualmente desde la sección «Préstamos».'
  );
};

const listarEventos = () => {
  return (
    'La comunidad de la biblioteca se reúne cada mes:\n\n' +
    '📖 Club de lectura para jóvenes y ' +
    '🍀 Club de lectura para adultos (una vez por mes).\n' +
    '🧒 Cuentacuentos los sábados por la mañana.\n' +
    '✍️ Talleres de escritura para niños.\n' +
    '🎉 Alrededor de 4 eventos culturales al mes.\n\n' +
    'Consulta la sección «Comunidad y Sugerencias» para participar.'
  );
};

const ubicacionTexto = () => {
  return (
    'Nos encontramos en la Av. del Libertador 1200, primera planta del centro cultural.\n\n' +
    '• Acceso para sillas de ruedas.\n' +
    '• Salas silenciosas.\n' +
    '• Zona de lectura al aire libre.'
  );
};

/* ===== Normalización de texto (a-minúsculas y sin acentos) ===== */
const norm = (s = '') =>
  String(s)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[¿?¡!.,;:()"'\-–—]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const PALABRAS_SOBRANTES = new Set([
  'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas', 'del',
  'de', 'que', 'en', 'y', 'o', 'a', 'para', 'por', 'me', 'mi', 'tu',
  'sobre', 'es', 'como', 'cual', 'estos', 'estas', 'este', 'esta',
  'libro', 'libros', 'resumen', 'sinopsis', 'argumento', 'cuentame',
  'hablame', 'dime', 'quiero', 'necesito', 'busco', 'por favor',
  'disponible', 'disponibilidad', 'estado', 'stock', 'tienen',
  'tiene', 'hay', 'recomiendame', 'recomienda', 'sugiere', 'sugiereme'
]);

/* ===== Tarjeta interactiva: respuesta estructurada para el chat ===== */
const tarjetaLibro = (l, texto) => ({
  tipo: 'libro',
  texto,
  libro: {
    id: l.id ?? null,
    _demo: !!l._demo,
    titulo: l.titulo,
    autor: l.autor,
    genero: l.genero || 'General',
    portada: l.portada || '',
    isbn: l.isbn || '',
    rating: l.rating || null,
    paginas: l.paginas || null,
    anio_publicacion: l.anio_publicacion || null,
    cantidad_disponible: Number(l.cantidad_disponible) || 0,
    sinopsis: l.sinopsis || ''
  }
});

const textoSimple = (t) => ({ tipo: 'texto', texto: t });

/* Enriquecer un libro real con la ficha demo (sinopsis, páginas, rating) */
const ficha = (libro) => {
  if (!libro) return null;
  const match = CATALOGO_DEMO.find(
    (d) =>
      (libro.isbn && d.isbn === libro.isbn) ||
      String(d.titulo).toLowerCase() === String(libro.titulo || '').toLowerCase()
  );
  if (match) return match;
  const hash = String(libro.id || 1).split('').reduce((a, c) => a + Number(c), 0);
  return {
    sinopsis: `«${libro.titulo}» de ${libro.autor} es una de las obras destacadas del catálogo. Sumérgete en sus páginas y descubre una historia inolvidable que enriquece la colección de la biblioteca.`,
    paginas: 120 + ((hash * 37) % 400),
    rating: Math.min(5, 3.5 + (hash % 14) / 10)
  };
};

/* ===== Resúmenes adaptados por edad ===== */
const SIMPLIFICADOS = {
  '1984': 'Un mundo donde todo está vigilado. Winston es un hombre valiente que quiere pensar en secreto y ser libre. Una historia para reflexionar sobre la libertad.',
  'el hobbit': 'Bilbo es un hobbit tranquilo que viaja junto a enanos y un mago para recuperar un tesoro custodiado por un gran dragón. ¡Una aventura de lujo!',
  'el principito': 'Un aviador se pierde en el desierto y conoce a un niño que viene de otro planeta y le enseña cosas hermosas sobre la amistad, el amor y lo que de verdad importa.',
  'cien anos de soledad': 'En un pueblo llamado Macondo vive la familia Buendía. A lo largo de muchas historias mágicas descubrimos la aventura de una familia muy especial.',
  'el aleph': 'Borges descubre «el Aleph», un punto donde se ven todas las cosas del mundo a la vez. Un viaje de imaginación y palabras.',
  'mujer que leia diez horas': 'Teresa dedica diez horas del día a leer. Un día un libro la lleva a una aventura que cambiará su vida para siempre.',
  'grandes esperanzas': 'Pip es un niño que sueña con ser importante. Con ayuda de un misterioso benefactor descubre que el verdadero valor no son las riquezas, sino el corazón.'
};

const SIMPLIFICADOS_FALLBACK = (l) => {
  const oracion = (l.sinopsis || '').split('.').filter(Boolean).slice(0, 2).join('.');
  if (oracion.length > 190) return oracion.slice(0, 187).trimEnd() + '...';
  return `${oracion}. Es una de las historias favoritas de nuestra biblioteca, ¡anímate a conocerla!`;
};

function resumenSimple(l) {
  const clave = norm(l.titulo);
  for (const [k, v] of Object.entries(SIMPLIFICADOS)) {
    if (clave === k || clave.includes(k) || k.includes(clave)) return v;
  }
  return SIMPLIFICADOS_FALLBACK(l);
}

/* ¿El usuario pidió un resumen adaptado para niños/jóvenes? */
function solicitaResumenSimple(texto) {
  if (/(para nin|para jov|nin (os|as)|niñ (os|as)|peque|cuento para|resumen facil|facil de entender)/.test(texto)) return true;
  const edad = texto.match(/(\d{1,2})\s*(anos|anios)/);
  return !!(edad && Number(edad[1]) <= 12);
}

/* ===== Recomendación por estado de ánimo ===== */
const ANIMOS = [
  {
    clave: 'feliz',
    etiqueta: 'algo alegre y lleno de energía',
    generos: ['Aventura', 'Fantasía', 'Fábula'],
    palabras: ['feliz', 'alegre', 'contento', 'euforico', 'emocionado', 'felicidad', 'optimista', 'enchufado']
  },
  {
    clave: 'tristeza',
    etiqueta: 'consuelo y esperanza',
    generos: ['Fábula', 'Realismo Mágico', 'Clásico'],
    palabras: ['triste', 'tristeza', 'deprimido', 'melancolico', 'nostalgico', 'decaido', 'bajoneado', 'desanimado']
  },
  {
    clave: 'tenso',
    etiqueta: 'calma y sosiego',
    generos: ['Poesía', 'Fábula', 'Clásico'],
    palabras: ['estresado', 'estres', 'ansioso', 'ansiedad', 'preocupado', 'abrumado', 'nervioso', 'tenso', 'agobiado']
  },
  {
    clave: 'aburrimiento',
    etiqueta: 'una aventura intensa',
    generos: ['Misterio', 'Ciencia Ficción', 'Thriller', 'Terror'],
    palabras: ['aburrido', 'aburrimiento', 'aburro', 'aburro', 'mucho tiempo libre', 'monotonia']
  },
  {
    clave: 'inspiracion',
    etiqueta: 'inspiración y corazón valiente',
    generos: ['Épica', 'Aventura', 'Clásico', 'Romance'],
    palabras: ['inspirado', 'inspiracion', 'motivado', 'animado', 'creativo', 'romantico', 'enamorado', 'apasionado']
  },
  {
    clave: 'curiosidad',
    etiqueta: 'curiosidad por descubrir el mundo',
    generos: ['Ciencia Ficción', 'Realismo', 'Historia', 'Misterio'],
    palabras: ['curioso', 'curiosidad', 'explorar', 'descubrir algo nuevo', 'aprender cosas nuevas']
  }
];

function detectarAnimo(texto) {
  const t = norm(texto);
  let mejor = null;
  for (const a of ANIMOS) {
    if (a.palabras.some((p) => t.includes(p))) {
      if (!mejor || a.palabras.length > mejor.palabras.length) mejor = a;
    }
  }
  return mejor;
}

/* ===== Catálogo en cache ===== */
let catalogoEnCache = null;

export async function obtenerCatalogo() {
  if (catalogoEnCache) return catalogoEnCache;

  let reales = [];
  try {
    const r = await getLibros();
    reales = r.data || [];
  } catch (e) {
    /* sin conexión al backend: se usa el catálogo demo */
  }

  const presentes = new Set(
    reales.map((l) => norm(l.isbn || '') || norm(l.titulo || ''))
  );
  const realesEnriquecidos = reales.map((l) => ({ ...l, ...ficha(l) }));

  const demo = CATALOGO_DEMO.filter(
    (d) => !presentes.has(norm(d.isbn)) && !presentes.has(norm(d.titulo))
  ).map((d) => ({
    titulo: d.titulo,
    autor: d.autor,
    genero: d.genero,
    isbn: d.isbn,
    portada: d.portada,
    anio_publicacion: d.anio_publicacion,
    paginas: d.paginas,
    rating: d.rating,
    sinopsis: d.sinopsis,
    cantidad_disponible: 2 + (d.isbn.length % 4),
    _demo: true
  }));

  catalogoEnCache = [...realesEnriquecidos, ...demo];
  return catalogoEnCache;
}

/* Buscar un libro por título/autor usando coincidencia por tokens */
function buscarLibro(catalogo, query) {
  const q = norm(query);
  if (!q) return null;

  const tokens = q.split(' ').filter((p) => p && !PALABRAS_SOBRANTES.has(p));
  if (tokens.length === 0) return null;

  const coincidir = (l, palabra) => {
    const titulo = norm(l.titulo);
    const autor = norm(l.autor || '');
    return titulo.includes(palabra) || autor.includes(palabra);
  };

  /* Coincidencia completa del título normalizado */
  const porTitulo = catalogo.find((l) => norm(l.titulo) === q);
  if (porTitulo) return porTitulo;

  let mejor = null;
  let mejorScore = 0;
  for (const l of catalogo) {
    let score = 0;
    for (const token of tokens) {
      if (coincidir(l, token)) score += token.length;
    }
    if (score > mejorScore) {
      mejor = l;
      mejorScore = score;
    }
  }

  if (mejorScore >= (tokens.length > 1 ? 3 : 2)) return mejor;
  return null;
}

const formatearLibro = (l) => {
  const estado =
    Number(l.cantidad_disponible) > 0
      ? `Disponible (${l.cantidad_disponible} ejemplar${l.cantidad_disponible === 1 ? '' : 'es'} en estantería)`
      : 'Agotado por el momento';
  const rating = l.rating ? ` · ★ ${Number(l.rating).toFixed(1)}` : '';
  return `📖 «${l.titulo}» de ${l.autor} (${(l.genero || 'General')}${rating})\n   ${estado}.`;
};

const resumenLibro = (l, simple) => {
  const header = simple
    ? `Aquí tienes un resumen adaptado para los más pequeños 🧒:\n\n${resumenSimple(l)}`
    : `Aquí tienes el resumen de «${l.titulo}»:\n\n${l.sinopsis || 'Sin sinopsis disponible.'}`;
  return (
    header +
    (l.paginas ? `\n\n📄 ${l.paginas} páginas${l.anio_publicacion ? ` · ${l.anio_publicacion}` : ''}.` : '') +
    `\n\n${formatearLibro(l)}`
  );
};

const disponibilidadLibro = (l) => {
  if (Number(l.cantidad_disponible) > 0) {
    return (
      `«${l.titulo}» está DISPONIBLE en la biblioteca: quedan ${l.cantidad_disponible} ejemplar${l.cantidad_disponible === 1 ? '' : 'es'} ahora mismo.\n\n` +
      `Pulsa el botón «Solicitar préstamo» de la tarjeta para reservarlo. 📚`
    );
  }
  return `«${l.titulo}» está agotado en este momento. 🙁\n\nNo te preocupes: puedes enviar una sugerencia en «Comunidad» para pedir más ejemplares o revisar de nuevo en unos días.`;
};

const GENEROS_CONOCIDOS = {
  distopia: 'Distopía',
  fantasia: 'Fantasía',
  fabula: 'Fábula',
  romance: 'Romance',
  clasico: 'Clásico',
  realismo: 'Realismo Mágico',
  novela: 'Novela',
  misterio: 'Misterio',
  aventura: 'Aventura',
  epica: 'Épica',
  cienciaficcion: 'Ciencia Ficción',
  terror: 'Terror',
  thriller: 'Thriller',
  poesia: 'Poesía',
  historia: 'Historia'
};

const encontrarGenero = (texto) => {
  const orden = ['ciencia ficcion', 'realismo magico', 'distopia', 'fantasia', 'fabula', 'romance', 'clasico', 'realismo', 'novela', 'misterio', 'aventura', 'epica', 'terror', 'thriller', 'poesia', 'historia'];
  for (const clave of orden) {
    const candidato = clave.replace(/ /g, '');
    const genero = GENEROS_CONOCIDOS[candidato];
    if (genero && texto.includes(clave)) return genero;
  }
  return null;
};

const normalizaGenero = (g) =>
  norm(g).replace(/[^a-z0-9]+/g, '');

const recomendacionesGenero = (catalogo, genero, limite = 3) => {
  const coincide = catalogo.filter(
    (l) => normalizaGenero(l.genero) === normalizaGenero(genero)
  );
  if (coincide.length === 0) return null;
  return coincide.slice(0, limite);
};

const mensajeRecomendacion = (titulo, libros) => {
  let texto = `${titulo}\n\n`;
  libros.forEach((l) => {
    texto += `• ${formatearLibro(l)}`;
  });
  texto += '\nPuedes verlos a detalle en la sección «Libros» del sistema.';
  return texto;
};

const EDADES = [
  {
    max: 9,
    etiqueta: 'los más pequeños (niños)',
    generos: ['Fábula', 'Fantasía', 'Aventura']
  },
  {
    max: 15,
    etiqueta: 'jóvenes lectores',
    generos: ['Ciencia Ficción', 'Misterio', 'Aventura', 'Fantasía']
  },
  {
    max: 99,
    etiqueta: 'lectores adultos',
    generos: ['Clásico', 'Realismo Mágico', 'Romance', 'Novela']
  }
];

function rangoEdad(numero) {
  if (numero <= 9) return EDADES[0];
  if (numero <= 15) return EDADES[1];
  return EDADES[2];
}

const TEMA_FUERA = [
  'futbol', 'deporte', 'partido', 'noticia', 'clima', 'receta', 'cocinar',
  'cocina', 'politica', 'presidente', 'gobierno', 'eleccion', 'economia',
  'bolsa', 'cripto', 'bitcoin', 'programacion', 'javascript', 'python',
  'videojuego', 'playstation', 'xbox', 'nintendo', 'celular', 'telefono',
  'musica', 'spotify', 'moda', 'famoso', 'celebridad', 'fotografia',
  'automovil', 'mecanica', 'restaurante', 'comida', 'salud', 'vacunas'
];

const esFueraDeTema = (texto) => {
  const bibliotecaRelacionado = /libro|biblioteca|leer|lectura|catalogo|prestamo|resena|autor|sinopsis|genero|novela|orwell|tolkien/;
  if (bibliotecaRelacionado.test(texto)) return false;
  return TEMA_FUERA.some((t) => texto.includes(t));
};

function decidir(mensaje) {
  const texto = norm(mensaje);

  /* 1) Saludo */
  if (/(^|\s)(hola|buenos dias|buenas tardes|buenas noches|que tal|hey|holii|buenas)(\s|$)/.test(texto)) {
    return textoSimple(
      '¡Hola! 👋 Soy tu Bibliotecario Virtual y estoy aquí para ayudarte.\n\n' +
      'Puedo contarte sobre nuestros libros, recomendarte lecturas según cómo te sientas, ' +
      'explicarte cómo pedir un préstamo o decirte los horarios de la biblioteca. ¿Qué necesitas?'
    );
  }

  /* 2) Agradecimiento */
  if (/(gracias|thank)/.test(texto)) {
    return textoSimple('¡De nada! 😊 Es un placer ayudarte. Si necesitas algo más del catálogo o de la biblioteca, aquí estaré.');
  }

  /* 3) Horarios */
  if (/(horario|abren|abierto|atienden|atencion|que hora|a que hora)/.test(texto) && !/(libros de)/.test(texto)) {
    return textoSimple(listarHorarios());
  }

  /* 4) Ubicación / sede */
  if (/(ubicacion|donde estan|donde esta|direccion|sede|encontramos la biblioteca|como llego)/.test(texto)) {
    return textoSimple(ubicacionTexto());
  }

  /* 5) Eventos / comunidad */
  if (/(evento|taller|club de lectura|cuentacuentos|actividades|comunidad)/.test(texto)) {
    return textoSimple(listarEventos());
  }

  /* 6) Normas y reglamento */
  if (/(reglamento|norma|normas|devolver|renovar|renovacion|multa|plazo|sancion|retraso)/.test(texto) && !/(libros de)/.test(texto)) {
    return textoSimple(listarNormas());
  }

  /* 7) Cómo solicitar un préstamo */
  if (/(solicitar un prestamo|solicito un prestamo|como solicito|como solicitar|como pido|como pedir|como hago para pedir|pedir prestado|reservar un libro|reservar)/.test(texto)) {
    return textoSimple(pasosPrestamo());
  }

  return { catalogo: true, texto };
}

export async function responder(mensaje) {
  const primer = decidir(mensaje);

  if (primer.tipo) return primer;

  const texto = primer.texto;
  const catalogo = await obtenerCatalogo();

  /* 8) Libros de un género concreto */
  const generoPorPalabra = encontrarGenero(texto);
  if (generoPorPalabra && /(libros|recomienda|recomiendame|sugiere|sugiereme|busco|alguna)/.test(texto)) {
    const encontrados = recomendacionesGenero(catalogo, generoPorPalabra, 5);
    if (encontrados) {
      return textoSimple(mensajeRecomendacion(`Te muestro algunas opciones de ${generoPorPalabra} que tenemos en el catálogo:`, encontrados));
    }
    return textoSimple(`No encontré libros del género «${generoPorPalabra}» en el catálogo. Prueba con otro género o revisa la sección «Libros».`);
  }

  /* 9) Resumen / sinopsis de un libro específico (adaptado por edad) */
  if (/(resumen|sinopsis|de que trata|argumento|cuentame sobre|cuentame de|hablame sobre|hablame de|cuentame|resume)/.test(texto)) {
    const libro = buscarLibro(catalogo, texto);
    const simple = solicitaResumenSimple(texto);
    if (libro) return tarjetaLibro(libro, resumenLibro(libro, simple));

    const tokensLibro = texto.split(' ').filter((p) => p && !PALABRAS_SOBRANTES.has(p));
    if (tokensLibro.length === 0 || simple) {
      return textoSimple('¡Claro! Cuéntame de qué libro quieres el resumen 😊\n\nPor ejemplo: «resumen de El Hobbit», «sinopsis de 1984» o «de qué trata Cien años de soledad».');
    }
    return textoSimple('No encontré ese libro en nuestro catálogo. ¿Puedes confirmarme el título? Por ejemplo: «resumen de El Hobbit».');
  }

  /* 10) Disponibilidad en tiempo real */
  if (/(disponib|stock|en que estado|esta (o )?(el )?libro|tienen disponibles|esta agotado|hay ejemplares)/.test(texto)) {
    const libro = buscarLibro(catalogo, texto);
    if (libro) return tarjetaLibro(libro, disponibilidadLibro(libro));
    return textoSimple('No encontré ese libro en el catálogo para consultar su disponibilidad. Escribe el título, por ejemplo: «¿está disponible 1984?».');
  }

  /* 11) Recomendación por estado de ánimo */
  const animo = detectarAnimo(texto);
  if (animo && /(recomiendame|recomienda|sugiere|que leo|que leer|lectura|libro|estado de animo|como me siento|me siento)/.test(texto)) {
    const elegidos = [...catalogo]
      .filter((l) => animo.generos.includes(l.genero))
      .sort((a, b) => Number(b.rating) - Number(a.rating))
      .slice(0, 3);

    if (elegidos.length > 0) {
      return textoSimple(mensajeRecomendacion(
        `Si te sientes con ganas de ${animo.etiqueta}, estas lecturas te van a encantar:`,
        elegidos
      ));
    }
  }

  /* 12) Recomendaciones por edad o preferencias */
  const edadMatch = texto.match(/(\d{1,2})\s*(anos|anios|a os|viejos?)/);
  if (edadMatch || /(para nin|para jov|para adult|mi edad|recomiendame|recomienda|sugiere|alguna recomendacion)/.test(texto)) {
    const generoFav = encontrarGenero(texto);
    const rango = edadMatch ? rangoEdad(Number(edadMatch[1])) : null;

    const candidatos = catalogo.filter((l) => {
      const coincideGenero = generoFav ? normalizaGenero(l.genero) === normalizaGenero(generoFav) : true;
      const coincideEdad = rango ? rango.generos.includes(l.genero) : true;
      return coincideGenero && coincideEdad;
    });

    if (candidatos.length > 0) {
      const elegidos = [...candidatos].sort((a, b) => Number(b.rating) - Number(a.rating)).slice(0, 3);
      const titulo = rango
        ? `Para ${rango.etiqueta}${generoFav ? ` y aficionados a ${generoFav}` : ''}, te recomiendo:`
        : generoFav
          ? `Según tu gusto por ${generoFav}, te recomiendo:`
          : 'Basándome en tus preferencias, te recomiendo:';
      return textoSimple(mensajeRecomendacion(titulo, elegidos));
    }
    return textoSimple(
      rango
        ? 'Por ahora no tengo títulos que coincidan con esa edad y esos gustos. Prueba pidiendo otro género o visita la sección «Libros».'
        : 'Cuéntame más: dime tu edad, un género que te guste (misterio, fantasía, ciencia ficción...) o cómo te sientes hoy, y te recomiendo lecturas.'
    );
  }

  /* 13) Consulta genérica de un título del catálogo */
  const libroDetectado = buscarLibro(catalogo, texto);
  if (libroDetectado) {
    const detalle =
      `Te encontré este título en el catálogo:\n\n${formatearLibro(libroDetectado)}` +
      `\n${libroDetectado.sinopsis ? libroDetectado.sinopsis.split('.')[0] + '.' : ''}` +
      `\n\n${libroDetectado.cantidad_disponible > 0 ? `Quedan ${libroDetectado.cantidad_disponible} ejemplares disponibles.` : 'Actualmente está agotado.'}` +
      ` Toca «Solicitar préstamo» para reservarlo o pregúntame por su resumen.`;
    return tarjetaLibro(libroDetectado, detalle);
  }

  /* 14) ¿Cuántos libros hay? */
  if (/(cuantos|cuantas) libros/.test(texto)) {
    const total = catalogo.length;
    const disponibles = catalogo.filter((l) => Number(l.cantidad_disponible) > 0).length;
    return textoSimple(`Nuestro catálogo cuenta con ${total} títulos registrados, con ${disponibles} disponibles en este momento. Puedes explorarlos todos en la sección «Libros». 📚`);
  }

  /* 15) Guardrail: temas ajenos a la biblioteca */
  if (esFueraDeTema(texto)) {
    return textoSimple(MENSAJE_LIMITE);
  }

  /* 16) Respuesta de apoyo para consultas no reconocidas */
  return textoSimple(MENSAJE_AYUDA);
}