const { test } = require('node:test');
const assert = require('node:assert');
const resenaController = require('../src/controllers/resenaController');
const sugerenciaController = require('../src/controllers/sugerenciaController');

function contexto(req = {}) {
  const res = {
    statusCode: null,
    jsonPayload: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.jsonPayload = data;
      return this;
    }
  };
  const completo = { ...req, res };
  return { req: completo, res };
}

test('crear reseña exige indicar un libro', async () => {
  const { req, res } = contexto({ body: {} });
  resenaController.crear(req, res);
  await Promise.resolve();
  assert.equal(res.statusCode, 400);
  assert.match(res.jsonPayload.message, /libro/i);
});

test('crear sugerencia exige título', async () => {
  const { req, res } = contexto({ body: {} });
  await sugerenciaController.crear(req, res);
  assert.equal(res.statusCode, 400);
  assert.match(res.jsonPayload.message, /t.tulo/i);
});

test('crear sugerencia exige autor', async () => {
  const { req, res } = contexto({ body: { titulo: 'Dune' } });
  await sugerenciaController.crear(req, res);
  assert.equal(res.statusCode, 400);
  assert.match(res.jsonPayload.message, /autor/i);
});

test('crear sugerencia rechaza títulos demasiado largos', async () => {
  const { req, res } = contexto({ body: { titulo: 'x'.repeat(201), autor: 'Autor' } });
  await sugerenciaController.crear(req, res);
  assert.equal(res.statusCode, 400);
  assert.match(res.jsonPayload.message, /demasiado largo/i);
});

test('cambiar estado de sugerencia rechaza estados inválidos', async () => {
  const { req, res } = contexto({ body: { estado: 'comprado' } });
  await sugerenciaController.cambiarEstado(req, res);
  assert.equal(res.statusCode, 400);
  assert.match(res.jsonPayload.message, /estado/i);
});