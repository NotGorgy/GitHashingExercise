'use strict';

/**
 * in-memory storage
 */
let books = [];
let authors = [];
let categories = [];

let nextBookId = 1;
let nextAuthorId = 1;
let nextCategoryId = 1;

/**
 * Helpers
 */
function parseId(idValue, name = 'id') {
  const id = Number(idValue);
  if (!Number.isFinite(id)) {
    return Promise.reject({ status: 400, message: `${name} must be a number` });
  }
  return id;
}

function notFound(entityName = 'Resource') {
  return Promise.reject({ status: 404, message: `${entityName} not found` });
}

/**
 * ----------------
 * AUTHORS
 * ----------------
 */

/**
 * Delete an author
 *
 * authorId Long
 * no response value expected for this operation
 **/
exports.authorsAuthorIdDELETE = function (authorId) {
  const id = Number(authorId);
  if (!Number.isFinite(id)) {
    return Promise.reject({ status: 400, message: 'authorId must be a number' });
  }

  const idx = authors.findIndex(a => a.id === id);
  if (idx === -1) return notFound('Author');

  authors.splice(idx, 1);
  return Promise.resolve();
};

/**
 * Get details of a specific author
 *
 * authorId Long
 * returns Author
 **/
exports.authorsAuthorIdGET = function (authorId) {
  const id = Number(authorId);
  if (!Number.isFinite(id)) {
    return Promise.reject({ status: 400, message: 'authorId must be a number' });
  }

  const author = authors.find(a => a.id === id);
  if (!author) return notFound('Author');

  return Promise.resolve(author);
};

/**
 * Update an author
 *
 * body AuthorInput
 * authorId Long
 * returns Author
 **/
exports.authorsAuthorIdPUT = function (body, authorId) {
  const id = Number(authorId);
  if (!Number.isFinite(id)) {
    return Promise.reject({ status: 400, message: 'authorId must be a number' });
  }

  const author = authors.find(a => a.id === id);
  if (!author) return notFound('Author');

  Object.assign(author, body);
  return Promise.resolve(author);
};

/**
 * Get all authors
 *
 * returns List
 **/
exports.authorsGET = function () {
  return Promise.resolve(authors);
};

/**
 * Add a new author
 *
 * body AuthorInput
 * returns Author
 **/
exports.authorsPOST = function (body) {
  const author = {
    id: nextAuthorId++,
    name: body && body.name
  };

  authors.push(author);
  return Promise.resolve(author);
};

/**
 * ----------------
 * BOOKS
 * ----------------
 */

/**
 * Delete a book
 *
 * bookId Long
 * no response value expected for this operation
 **/
exports.booksBookIdDELETE = function (bookId) {
  const id = Number(bookId);
  if (!Number.isFinite(id)) {
    return Promise.reject({ status: 400, message: 'bookId must be a number' });
  }

  const idx = books.findIndex(b => b.id === id);
  if (idx === -1) return notFound('Book');

  books.splice(idx, 1);
  return Promise.resolve();
};

/**
 * Get details of a specific book
 *
 * bookId Long
 * returns Book
 **/
exports.booksBookIdGET = function (bookId) {
  const id = Number(bookId);
  if (!Number.isFinite(id)) {
    return Promise.reject({ status: 400, message: 'bookId must be a number' });
  }

  const book = books.find(b => b.id === id);
  if (!book) return notFound('Book');

  return Promise.resolve(book);
};

/**
 * Update a book
 *
 * body BookInput
 * bookId Long
 * returns Book
 **/
exports.booksBookIdPUT = function (body, bookId) {
  const id = Number(bookId);
  if (!Number.isFinite(id)) {
    return Promise.reject({ status: 400, message: 'bookId must be a number' });
  }

  const book = books.find(b => b.id === id);
  if (!book) return notFound('Book');

  Object.assign(book, body);
  return Promise.resolve(book);
};

/**
 * Get all books
 *
 * returns List
 **/
exports.booksGET = function () {
  return Promise.resolve(books);
};

/**
 * Add a new book
 *
 * body BookInput
 * returns Book
 **/
exports.booksPOST = function (body) {
  const book = {
    id: nextBookId++,
    title: body && body.title,
    author_id: body && body.author_id,
    category_id: body && body.category_id,
    published_year: body && body.published_year
  };

  books.push(book);
  return Promise.resolve(book);
};

/**
 * ----------------
 * CATEGORIES
 * ----------------
 */

/**
 * Delete a category
 *
 * categoryId Long
 * no response value expected for this operation
 **/
exports.categoriesCategoryIdDELETE = function (categoryId) {
  const id = Number(categoryId);
  if (!Number.isFinite(id)) {
    return Promise.reject({ status: 400, message: 'categoryId must be a number' });
  }

  const idx = categories.findIndex(c => c.id === id);
  if (idx === -1) return notFound('Category');

  categories.splice(idx, 1);
  return Promise.resolve();
};

/**
 * Get details of a specific category
 *
 * categoryId Long
 * returns Category
 **/
exports.categoriesCategoryIdGET = function (categoryId) {
  const id = Number(categoryId);
  if (!Number.isFinite(id)) {
    return Promise.reject({ status: 400, message: 'categoryId must be a number' });
  }

  const category = categories.find(c => c.id === id);
  if (!category) return notFound('Category');

  return Promise.resolve(category);
};

/**
 * Update a category
 *
 * body CategoryInput
 * categoryId Long
 * returns Category
 **/
exports.categoriesCategoryIdPUT = function (body, categoryId) {
  const id = Number(categoryId);
  if (!Number.isFinite(id)) {
    return Promise.reject({ status: 400, message: 'categoryId must be a number' });
  }

  const category = categories.find(c => c.id === id);
  if (!category) return notFound('Category');

  Object.assign(category, body);
  return Promise.resolve(category);
};

/**
 * Get all categories
 *
 * returns List
 **/
exports.categoriesGET = function () {
  return Promise.resolve(categories);
};

/**
 * Add a new category
 *
 * body CategoryInput
 * returns Category
 **/
exports.categoriesPOST = function (body) {
  const category = {
    id: nextCategoryId++,
    name: body && body.name
  };

  categories.push(category);
  return Promise.resolve(category);
};
