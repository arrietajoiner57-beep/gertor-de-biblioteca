/**
 * Construye la cláusula WHERE y los parámetros para buscar libros
 * por coincidencia de texto (título, autor, ISBN, género, editorial).
 * Función pura, sin dependencias de la base de datos.
 */
function construirBusqueda(q) {
  if (!q || !q.trim()) {
    return { clausula: '', params: [] };
  }
  const termino = `%${q.trim()}%`;
  return {
    clausula:
      'WHERE titulo LIKE ? OR autor LIKE ? OR isbn LIKE ? OR genero LIKE ? OR editorial LIKE ?',
    params: [termino, termino, termino, termino, termino]
  };
}

module.exports = { construirBusqueda };
