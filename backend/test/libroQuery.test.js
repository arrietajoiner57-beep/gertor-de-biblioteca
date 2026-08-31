const { test } = require('node:test');
const assert = require('node:assert');
const { construirBusqueda } = require('../src/utils/libroQuery');

test('sin término de búsqueda devuelve cláusula vacía', () => {
  const { clausula, params } = construirBusqueda();
  assert.equal(clausula, '');
  assert.deepEqual(params, []);
});

test('con término vacío o espacios devuelve cláusula vacía', () => {
  assert.equal(construirBusqueda('').clausula, '');
  assert.equal(construirBusqueda('   ').clausula, '');
});

test('genera cláusula WHERE y 5 parámetros con comodines', () => {
  const { clausula, params } = construirBusqueda('Quijote');
  assert.match(clausula, /WHERE/);
  assert.equal(params.length, 5);
  assert.ok(params.every((p) => p === '%Quijote%'));
});

test('recorta espacios del término', () => {
  const { params } = construirBusqueda('  1984  ');
  assert.ok(params.every((p) => p === '%1984%'));
});
