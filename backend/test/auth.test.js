const { test } = require('node:test');
const assert = require('node:assert');
const jwt = require('jsonwebtoken');

process.env.JWT_SECRET = 'secreto-de-prueba';
const { verifyToken, requireAdmin, requireBibliotecario } = require('../src/middleware/auth');

function crearToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET);
}

function hacerReq({ headers = {}, usuario } = {}) {
  const req = { headers, usuario };
  const res = {
    statusCode: null,
    jsonPayload: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.jsonPayload = data;
      return this;
    }
  };
  let llamado = false;
  const next = () => {
    llamado = true;
  };
  return { req, res, next, dameLlamado: () => llamado };
}

test('verifyToken acepta un token válido y carga el usuario', () => {
  const { req, res, next, dameLlamado } = hacerReq({
    headers: { authorization: `Bearer ${crearToken({ id: 1, email: 'a@b.com', rol: 'admin' })}` }
  });
  verifyToken(req, res, next);
  assert.equal(dameLlamado(), true, 'debe llamar a next');
  assert.equal(req.usuario.id, 1);
  assert.equal(req.usuario.rol, 'admin');
});

test('verifyToken rechaza si no hay cabecera de autorización', () => {
  const { req, res, next, dameLlamado } = hacerReq();
  verifyToken(req, res, next);
  assert.equal(dameLlamado(), false);
  assert.equal(res.statusCode, 401);
  assert.equal(res.jsonPayload.code, 'NO_TOKEN');
});

test('verifyToken rechaza si el token es inválido', () => {
  const { req, res, next, dameLlamado } = hacerReq({
    headers: { authorization: 'Bearer token-no-valido' }
  });
  verifyToken(req, res, next);
  assert.equal(dameLlamado(), false);
  assert.equal(res.statusCode, 401);
  assert.equal(res.jsonPayload.code, 'TOKEN_INVALIDO');
});

test('requireAdmin permite solo al rol admin', () => {
  const admin = hacerReq();
  admin.req.usuario = { rol: 'admin' };
  requireAdmin(admin.req, admin.res, admin.next);
  assert.equal(admin.dameLlamado(), true);

  const user = hacerReq();
  user.req.usuario = { rol: 'user' };
  requireAdmin(user.req, user.res, user.next);
  assert.equal(user.dameLlamado(), false);
  assert.equal(user.res.statusCode, 403);
});

test('requireBibliotecario permite a admin y bibliotecario, no a user', () => {
  for (const rol of ['admin', 'bibliotecario']) {
    const ctx = hacerReq();
    ctx.req.usuario = { rol };
    requireBibliotecario(ctx.req, ctx.res, ctx.next);
    assert.equal(ctx.dameLlamado(), true, `debe permitir rol ${rol}`);
  }

  const user = hacerReq();
  user.req.usuario = { rol: 'user' };
  requireBibliotecario(user.req, user.res, user.next);
  assert.equal(user.dameLlamado(), false);
  assert.equal(user.res.statusCode, 403);
});
