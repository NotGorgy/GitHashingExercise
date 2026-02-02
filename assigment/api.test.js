'use strict';

const test = require('ava');
const http = require('http');
const request = require('supertest');

// IMPORTANT: απαιτεί το app.js που κάνει module.exports = app
const app = require('../app');

test.before((t) => {
  // Start server on an ephemeral port to avoid EADDRINUSE
  t.context.server = http.createServer(app).listen(0);
  t.context.client = request(t.context.server);
});

test.after.always((t) => {
  if (t.context.server) {
    t.context.server.close();
  }
});

test.serial('GET /books returns array', async (t) => {
  const res = await t.context.client
    .get('/books')
    .set('Accept', 'application/json')
    .expect(200);

  t.true(Array.isArray(res.body));
});

test.serial('Books: POST -> GET -> PUT -> DELETE', async (t) => {
  // POST
  const created = await t.context.client
    .post('/books')
    .set('Content-Type', 'application/json')
    .send({ title: 'Dune', author_id: 1, category_id: 1, published_year: 1965 })
    .expect(201);

  t.truthy(created.body);
  t.truthy(created.body.id);

  const bookId = created.body.id;

  // GET by id
  const got = await t.context.client
    .get(`/books/${bookId}`)
    .set('Accept', 'application/json')
    .expect(200);

  t.is(got.body.id, bookId);
  t.is(got.body.title, 'Dune');

  // PUT
  const updated = await t.context.client
    .put(`/books/${bookId}`)
    .set('Content-Type', 'application/json')
    .send({ published_year: 1966 })
    .expect(200);

  t.is(updated.body.published_year, 1966);

  // DELETE
  await t.context.client
    .delete(`/books/${bookId}`)
    .expect(204);
});

test.serial('GET /authors returns array', async (t) => {
  const res = await t.context.client
    .get('/authors')
    .set('Accept', 'application/json')
    .expect(200);

  t.true(Array.isArray(res.body));
});

test.serial('Authors: POST -> GET -> PUT -> DELETE', async (t) => {
  // POST
  const created = await t.context.client
    .post('/authors')
    .set('Content-Type', 'application/json')
    .send({ name: 'JoeMama' })
    .expect(201);

  t.truthy(created.body);
  t.truthy(created.body.id);

  const authorId = created.body.id;

  // GET by id
  const got = await t.context.client
    .get(`/authors/${authorId}`)
    .set('Accept', 'application/json')
    .expect(200);

  t.is(got.body.id, authorId);
  t.is(got.body.name, 'JoeMama');

  // PUT
  const updated = await t.context.client
    .put(`/authors/${authorId}`)
    .set('Content-Type', 'application/json')
    .send({ name: 'JoePapa' })
    .expect(200);

  t.is(updated.body.name, 'JoePapa');

  // DELETE
  await t.context.client
    .delete(`/authors/${authorId}`)
    .expect(204);
});

test.serial('GET /categories returns array', async (t) => {
  const res = await t.context.client
    .get('/categories')
    .set('Accept', 'application/json')
    .expect(200);

  t.true(Array.isArray(res.body));
});

test.serial('Categories: POST -> GET -> PUT -> DELETE', async (t) => {
  // POST
  const created = await t.context.client
    .post('/categories')
    .set('Content-Type', 'application/json')
    .send({ name: 'Fantasy' })
    .expect(201);

  t.truthy(created.body);
  t.truthy(created.body.id);

  const categoryId = created.body.id;

  // GET by id
  const got = await t.context.client
    .get(`/categories/${categoryId}`)
    .set('Accept', 'application/json')
    .expect(200);

  t.is(got.body.id, categoryId);
  t.is(got.body.name, 'Fantasy');

  // PUT
  const updated = await t.context.client
    .put(`/categories/${categoryId}`)
    .set('Content-Type', 'application/json')
    .send({ name: 'HELP' })
    .expect(200);

  t.is(updated.body.name, 'HELP');

  // DELETE
  await t.context.client
    .delete(`/categories/${categoryId}`)
    .expect(204);
});


