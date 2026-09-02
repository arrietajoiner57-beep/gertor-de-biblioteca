// Catálogo demo curado para el módulo "Libros".
// Se fusiona con los datos reales de la base de datos para garantizar
// un catálogo visualmente rico: sinopsis, valoración, nº de páginas,
// género y portadas HD (servicio público de portadas de Open Library).
// Todos los ISBN usan portadas públicas por ISBN.
// Nota: los ISBN de "Un mundo feliz" y "Cien años de soledad" usan
// ediciones con cubierta validada en Open Library (los anteriores no tenían).

const cover = (isbn) => `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;

export const CATALOGO_DEMO = [
  {
    isbn: '978-0451524935',
    titulo: '1984',
    autor: 'George Orwell',
    genero: 'Distopía',
    anio_publicacion: 1949,
    paginas: 328,
    rating: 4.7,
    sinopsis:
      'En un futuro totalitario donde el Gran Hermano lo vigila todo, Winston Smith, funcionario del Ministerio de la Verdad, comienza a cuestionar el sistema mientras intenta preservar la libertad de pensamiento en una sociedad que la ha erradicado por completo.',
    portada: cover('978-0451524935'),
    destacado: true
  },
  {
    isbn: '978-0547928227',
    titulo: 'El Hobbit',
    autor: 'J.R.R. Tolkien',
    genero: 'Fantasía',
    anio_publicacion: 1937,
    paginas: 310,
    rating: 4.6,
    sinopsis:
      'Bilbo Bolsón, un hobbit tranquilo, es arrastrado por el mago Gandalf y una compañía de enanos en una aventura para recuperar el tesoro custodio del dragón Smaug. Un viaje que cambiará para siempre el destino de la Tierra Media.',
    portada: cover('978-0547928227'),
    destacado: true
  },
  {
    isbn: '978-0156012195',
    titulo: 'El Principito',
    autor: 'Antoine de Saint-Exupéry',
    genero: 'Fábula',
    anio_publicacion: 1943,
    paginas: 96,
    rating: 4.8,
    sinopsis:
      'Un aviador varado en el desierto conoce a un pequeño príncipe que viene de otro planeta. A través de sus diálogos sencillos y profundos, explora el amor, la amistad y el sentido de la vida con la ternura que atraviesa generaciones.',
    portada: cover('978-0156012195'),
    destacado: true
  },
  {
    isbn: '978-0141439518',
    titulo: 'Orgullo y prejuicio',
    autor: 'Jane Austen',
    genero: 'Romance',
    anio_publicacion: 1813,
    paginas: 432,
    rating: 4.5,
    sinopsis:
      'Elizabeth Bennet y el orgulloso señor Darcy protagonizan una de las historias de amor más célebres de la literatura. Una sátira ingeniosa de las costumbres y las apariencias en la Inglaterra victoriana.',
    portada: cover('978-0141439518')
  },
  {
    isbn: '978-0143058144',
    titulo: 'Crimen y castigo',
    autor: 'Fiódor Dostoievski',
    genero: 'Clásico',
    anio_publicacion: 1866,
    paginas: 671,
    rating: 4.6,
    sinopsis:
      'Rodion Raskólnikov, un estudiante empobrecido, comete un crimen que cree justificado y se ve sumido en una espiral de culpa y paranoia. Un retrato magistral de la conciencia humana y la redención.',
    portada: cover('978-0143058144')
  },
  {
    isbn: '978-0553213690',
    titulo: 'La Metamorfosis',
    autor: 'Franz Kafka',
    genero: 'Realismo',
    anio_publicacion: 1915,
    paginas: 104,
    rating: 4.2,
    sinopsis:
      'Una mañana, Gregor Samsa despierta convertido en un enorme insecto. A partir de esa premisa absurda, Kafka construye una metáfora desgarradora sobre la alienación, la familia y la identidad en el mundo moderno.',
    portada: cover('978-0553213690')
  },
  {
    isbn: '978-8437604573',
    titulo: 'Rayuela',
    autor: 'Julio Cortázar',
    genero: 'Novela',
    anio_publicacion: 1963,
    paginas: 736,
    rating: 4.4,
    sinopsis:
      'Un juego literario que puede leerse de múltiples maneras. La historia de Horacio Oliveira y la Maga en París y Buenos Aires se convierte en una exploración vanguardista del lenguaje, el amor y el destino.',
    portada: cover('978-8437604573')
  },
  {
    isbn: '978-0060883287',
    titulo: 'Cien años de soledad',
    autor: 'Gabriel García Márquez',
    genero: 'Realismo Mágico',
    anio_publicacion: 1967,
    paginas: 471,
    rating: 4.8,
    sinopsis:
      'La saga de la familia Buendía en el mítico pueblo de Macondo. Una obra cumbre del realismo mágico que atraviesa siete generaciones marcadas por la soledad, la pasión y el destino inexorable.',
    portada: cover('978-0307474728'),
    destacado: true
  },
  {
    isbn: '978-8420412146',
    titulo: 'Rayuela',
    autor: 'Julio Cortázar',
    genero: 'Novela',
    anio_publicacion: 1963,
    paginas: 736,
    rating: 4.4,
    sinopsis:
      'Un juego literario que puede leerse de múltiples maneras. La historia de Horacio Oliveira y la Maga en París y Buenos Aires se convierte en una exploración vanguardista del lenguaje y el destino.',
    portada: cover('978-8420412146')
  },
  {
    isbn: '978-8420471839',
    titulo: 'La sombra del viento',
    autor: 'Carlos Ruiz Zafón',
    genero: 'Misterio',
    anio_publicacion: 2001,
    paginas: 416,
    rating: 4.6,
    sinopsis:
      'En la Barcelona de la posguerra, un joven descubre un libro maldito en el Cementerio de los Libros Olvidados. Su búsqueda del autor lo arrastra a un laberinto de secretos, conspiraciones y amor prohibido.',
    portada: cover('978-8420471839'),
    destacado: true
  },
  {
    isbn: '978-0061120084',
    titulo: 'El Alquimista',
    autor: 'Paulo Coelho',
    genero: 'Aventura',
    anio_publicacion: 1988,
    paginas: 208,
    rating: 4.3,
    sinopsis:
      'Santiago, un joven pastor andaluz, emprende un viaje hacia las pirámides de Egipto persiguiendo su leyenda personal. Una fábula inspiradora sobre seguir los sueños y escuchar al corazón.',
    portada: cover('978-0061120084')
  },
  {
    isbn: '978-0140449266',
    titulo: 'La Odisea',
    autor: 'Homero',
    genero: 'Épica',
    anio_publicacion: -800,
    paginas: 352,
    rating: 4.4,
    sinopsis:
      'El regreso de Odiseo a Ítaca tras la guerra de Troya se convierte en una epopeya de monstruos, dioses y pruebas. El relato fundacional de la literatura occidental sobre el viaje y la supervivencia.',
    portada: cover('978-0140449266')
  },
  {
    isbn: '978-0307387899',
    titulo: 'Nunca me abandones',
    autor: 'Kazuo Ishiguro',
    genero: 'Ciencia Ficción',
    anio_publicacion: 2005,
    paginas: 288,
    rating: 4.2,
    sinopsis:
      'Kathy, Ruth y Tommy crecen en un internado idílico que esconde un inquietante secreto. Una reflexión conmovedora sobre la identidad, la memoria y lo que significa ser humano.',
    portada: cover('978-0307387899')
  },
  {
    isbn: '978-0307390615',
    titulo: 'El nombre del viento',
    autor: 'Patrick Rothfuss',
    genero: 'Fantasía',
    anio_publicacion: 2007,
    paginas: 662,
    rating: 4.7,
    sinopsis:
      'Kvothe, leyenda viviente, narra su propia historia: de niño prodigio de una familia de artistas ambulantes a la universidad de magia, perseguido por los demonios que destruyeron a los suyos.',
    portada: cover('978-0307390615'),
    destacado: true
  },
  {
    isbn: '978-1400033416',
    titulo: 'Coraline',
    autor: 'Neil Gaiman',
    genero: 'Terror',
    anio_publicacion: 2002,
    paginas: 162,
    rating: 4.3,
    sinopsis:
      'Coraline descubre una puerta secreta que lleva a un mundo paralelo donde otra madre, con botones por ojos, quiere retenerla para siempre. Una fábula inquietante sobre el coraje y la valentía.',
    portada: cover('978-1400033416')
  },
  {
    isbn: '978-0142437209',
    titulo: 'Moby Dick',
    autor: 'Herman Melville',
    genero: 'Clásico',
    anio_publicacion: 1851,
    paginas: 720,
    rating: 4.1,
    sinopsis:
      'El capitán Ahab persigue obsesivamente a la ballena blanca que le arrebató una pierna. Una epopeya marítima sobre la obsesión, la naturaleza y los límites de la voluntad humana.',
    portada: cover('978-0142437209')
  },
  {
    isbn: '978-0060850524',
    titulo: 'Un mundo feliz',
    autor: 'Aldous Huxley',
    genero: 'Distopía',
    anio_publicacion: 1932,
    paginas: 259,
    rating: 4.4,
    sinopsis:
      'En un futuro donde la humanidad es genéticamente diseñada y el placer es la única ley, un salvaje que creció fuera del sistema desafía los valores de una sociedad aparentemente perfecta.',
    portada: cover('978-0307477421')
  },
  {
    isbn: '978-0307743657',
    titulo: 'El secreto de la mansión',
    autor: 'Sarah Waters',
    genero: 'Thriller',
    anio_publicacion: 2002,
    paginas: 528,
    rating: 4.0,
    sinopsis:
      'Tras su liberación de prisión, una mujer consigue un puesto de institutriz en una inquietante mansión victoriana donde nada es lo que parece y cada secreto desentierra otro más oscuro.',
    portada: cover('978-0307743657')
  }
];

// Géneros curados con su cápsula / emoji de apoyo.
export const GENEROS_DEMO = [
  'Distopía',
  'Fantasía',
  'Fábula',
  'Romance',
  'Clásico',
  'Realismo',
  'Novela',
  'Realismo Mágico',
  'Misterio',
  'Aventura',
  'Épica',
  'Ciencia Ficción',
  'Terror',
  'Thriller'
];
