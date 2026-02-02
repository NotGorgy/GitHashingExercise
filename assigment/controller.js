'use strict';

var utils = require('../utils/writer.js');
var Default = require('../service/DefaultService');

module.exports.authorsAuthorIdDELETE = function authorsAuthorIdDELETE (req, res, next, authorId) {
  Default.authorsAuthorIdDELETE(authorId)
    .then(function (response) {
      utils.writeJson(res, response, 204);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.authorsAuthorIdGET = function authorsAuthorIdGET (req, res, next, authorId) {
  Default.authorsAuthorIdGET(authorId)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.authorsAuthorIdPUT = function authorsAuthorIdPUT (req, res, next, body, authorId) {
  Default.authorsAuthorIdPUT(body, authorId)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.authorsGET = function authorsGET (req, res, next) {
  Default.authorsGET()
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.authorsPOST = function authorsPOST (req, res, next, body) {
  Default.authorsPOST(body)
    .then(function (response) {
      utils.writeJson(res, response, 201);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.booksBookIdDELETE = function booksBookIdDELETE (req, res, next, bookId) {
  Default.booksBookIdDELETE(bookId)
    .then(function (response) {
      utils.writeJson(res, response, 204);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.booksBookIdGET = function booksBookIdGET (req, res, next, bookId) {
  Default.booksBookIdGET(bookId)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.booksBookIdPUT = function booksBookIdPUT (req, res, next, body, bookId) {
  Default.booksBookIdPUT(body, bookId)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.booksGET = function booksGET (req, res, next) {
  Default.booksGET()
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.booksPOST = function booksPOST (req, res, next, body) {
  Default.booksPOST(body)
    .then(function (response) {
      utils.writeJson(res, response, 201);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.categoriesCategoryIdDELETE = function categoriesCategoryIdDELETE (req, res, next, categoryId) {
  Default.categoriesCategoryIdDELETE(categoryId)
    .then(function (response) {
      utils.writeJson(res, response, 204);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.categoriesCategoryIdGET = function categoriesCategoryIdGET (req, res, next, categoryId) {
  Default.categoriesCategoryIdGET(categoryId)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.categoriesCategoryIdPUT = function categoriesCategoryIdPUT (req, res, next, body, categoryId) {
  Default.categoriesCategoryIdPUT(body, categoryId)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.categoriesGET = function categoriesGET (req, res, next) {
  Default.categoriesGET()
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.categoriesPOST = function categoriesPOST (req, res, next, body) {
  Default.categoriesPOST(body)
    .then(function (response) {
      utils.writeJson(res, response, 201);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
