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

test.serial('Authors: POST then GET list', async (t) => {
  const created = await t.context.client
    .post('/authors')
    .set('Content-Type', 'application/json')
    .send({ name: 'Frank Herbert' })
    .expect(201);

  t.truthy(created.body);
  t.truthy(created.body.id);

  const list = await t.context.client
    .get('/authors')
    .set('Accept', 'application/json')
    .expect(200);

  t.true(Array.isArray(list.body));
  t.true(list.body.length >= 1);
});

test.serial('Categories: POST then GET by id', async (t) => {
  const created = await t.context.client
    .post('/categories')
    .set('Content-Type', 'application/json')
    .send({ name: 'Sci-Fi' })
    .expect(201);

  t.truthy(created.body);
  t.truthy(created.body.id);

  const categoryId = created.body.id;

  const got = await t.context.client
    .get(`/categories/${categoryId}`)
    .set('Accept', 'application/json')
    .expect(200);

  t.is(got.body.name, 'Sci-Fi');
});

test.serial('GET /authors/:id and GET /categories/:id (smoke)', async (t) => {
  // create author
  const a = await t.context.client
    .post('/authors')
    .send({ name: 'Test Author' })
    .expect(201);

  const authorId = a.body.id;

  // create category
  const c = await t.context.client
    .post('/categories')
    .send({ name: 'Test Category' })
    .expect(201);

  const categoryId = c.body.id;

  // GET author by id
  const gotAuthor = await t.context.client
    .get(`/authors/${authorId}`)
    .expect(200);

  t.is(gotAuthor.body.id, authorId);

  // GET category by id
  const gotCategory = await t.context.client
    .get(`/categories/${categoryId}`)
    .expect(200);

  t.is(gotCategory.body.id, categoryId);
});
