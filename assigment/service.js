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
 * Delete an author
 *
 * authorId Long 
 * no response value expected for this operation
 **/
exports.authorsAuthorIdDELETE = function(authorId) {
  authors = authors.filter(a => a.id !== Number(authorId));
  return Promise.resolve();
};


/**
 * Get details of a specific author
 *
 * authorId Long 
 * returns Author
 **/
exports.authorsAuthorIdGET = function(authorId) {
  const author = authors.find(a => a.id === Number(authorId));
  return Promise.resolve(author);
};


/**
 * Update an author
 *
 * body AuthorInput 
 * authorId Long 
 * returns Author
 **/
exports.authorsAuthorIdPUT = function(body,authorId) {
  const author = authors.find(a => a.id === Number(authorId));
  if(author) {
    Object.assign(author, body);
  }
  return Promise.resolve(author);
};


/**
 * Get all authors
 *
 * returns List
 **/
exports.authorsGET = function() {
  return Promise.resolve(authors);
};


/**
 * Add a new author
 *
 * body AuthorInput 
 * returns Author
 **/
exports.authorsPOST = function(body) {
  const author = {
    id: nextAuthorId++,
    name: body.name
  };

  authors.push(author);
  return Promise.resolve(author);
};


/**
 * Delete a book
 *
 * bookId Long 
 * no response value expected for this operation
 **/
exports.booksBookIdDELETE = function(bookId) {
  books = books.filter(b => b.id !== Number(bookId));
  return Promise.resolve();
};


/**
 * Get details of a specific book
 *
 * bookId Long 
 * returns Book
 **/
exports.booksBookIdGET = function(bookId) {
 const book = books.find(b => b.id === Number(bookId));
 return Promise.resolve(book);
};


/**
 * Update a book
 *
 * body BookInput 
 * bookId Long 
 * returns Book
 **/
exports.booksBookIdPUT = function(body,bookId) {
  const book = books.find(b => b.id === Number(bookId));
  if(book) {
    Object.assign(book, body);
  }
  return Promise.resolve(book);
};


/**
 * Get all books
 *
 * returns List
 **/
exports.booksGET = function() {
  return Promise.resolve(books);
};


/**
 * Add a new book
 *
 * body BookInput 
 * returns Book
 **/
exports.booksPOST = function(body) {
  const book = {
    id: nextBookId++,
    title: body.title,
    author_id: body.author_id,
    category_id: body.category_id,
    published_year: body.published_year
  };

  books.push(book);
  return Promise.resolve(book);
};


/**
 * Delete a category
 *
 * categoryId Long 
 * no response value expected for this operation
 **/
exports.categoriesCategoryIdDELETE = function(categoryId) {
  categories = categories.filter(c => c.id !== Number(categoryId));
  return Promise.resolve();
};


/**
 * Get details of a specific category
 *
 * categoryId Long 
 * returns Category
 **/
exports.categoriesCategoryIdGET = function(categoryId) {
  const category = categories.find(c => c.id === Number(categoryId));
  return Promise.resolve(category);
};


/**
 * Update a category
 *
 * body CategoryInput 
 * categoryId Long 
 * returns Category
 **/
exports.categoriesCategoryIdPUT = function(body,categoryId) {
  const category = categories.find(c => c.id === Number(categoryId));
  if(category) {
    Object.assign(category, body);
  }
  return Promise.resolve(category);
};


/**
 * Get all categories
 *
 * returns List
 **/
exports.categoriesGET = function() {
  return Promise.resolve(categories);
};


/**
 * Add a new category
 *
 * body CategoryInput 
 * returns Category
 **/
exports.categoriesPOST = function(body) {
  const category = {
    id: nextCategoryId++,
    name: body.name
  };

  categories.push(category);
  return Promise.resolve(category);
};

