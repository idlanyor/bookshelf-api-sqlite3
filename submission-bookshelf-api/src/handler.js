const { nanoid } = require('nanoid');
const books = require('./books');

function addBooks(req, h) {
  const {
    name, year, author, summary, publisher, pageCount, readPage, reading,
  } = req.payload;
  const id = nanoid(16);
  const insertedAt = new Date().toISOString();
  const updatedAt = insertedAt;
  const finished = pageCount === readPage;

  if (!name) {
    return h.response({
      status: 'fail',
      message: 'Gagal menambahkan buku. Mohon isi nama buku',
    }).code(400);
  }

  if (readPage > pageCount) {
    return h.response({
      status: 'fail',
      message: 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount',
    }).code(400);
  }

  const newBook = {
    id,
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    finished,
    reading,
    insertedAt,
    updatedAt,
  };
  try {
    books.push(newBook);
    // console.log(newBook);
    const isSuccess = books.filter((book) => book.id === id).length > 0;
    if (isSuccess) {
      return h.response({
        status: 'success',
        message: 'Buku berhasil ditambahkan',
        data: {
          bookId: id,
        },
      }).code(201);
    }
    return h.response({
      status: 'fail',
      message: 'Buku gagal ditambahkan',
    }).code(500);
  } catch (e) {
    return h.response({
      status: 'error',
      message: 'Terjadi kesalahan pada server',
    }).code(500);
  }
}

function getAllBooks(req, h) {
  const { name, reading, finished } = req.query;

  let filteredBooks = [...books];

  if (name) {
    const searchTerm = name.toLowerCase();
    filteredBooks = filteredBooks.filter((b) => b.name.toLowerCase().includes(searchTerm));
  }

  if (reading !== undefined) {
    const isReading = parseInt(reading, 10) === 1;
    filteredBooks = filteredBooks.filter((b) => b.reading === isReading);
  }

  if (finished !== undefined) {
    const isFinished = parseInt(finished, 10) === 1;
    filteredBooks = filteredBooks.filter((b) => b.finished === isFinished);
  }

  const simplifiedBooks = filteredBooks.map((
    { id, name: nama, publisher },
  ) => ({ id, name: nama, publisher }));

  return h.response({
    status: 'success',
    data: {
      books: simplifiedBooks,
    },
  }).code(200);
}

function getBookById(req, h) {
  const { id } = req.params;
  const book = books.filter((b) => b.id === id)[0];

  if (book !== undefined) {
    return h.response({
      status: 'success',
      data: {
        book,
      },
    }).code(200);
  }
  return h.response({
    status: 'fail',
    message: 'Buku tidak ditemukan',
  }).code(404);
}

function updateBookById(req, h) {
  const { id } = req.params;
  const index = books.findIndex((b) => b.id === id);

  if (index === -1) {
    return h.response({
      status: 'fail',
      message: 'Gagal memperbarui buku. Id tidak ditemukan',
    }).code(404);
  }

  const {
    name, year, author, summary, publisher, pageCount, readPage, reading,
  } = req.payload;

  if (!name) {
    return h.response({
      status: 'fail',
      message: 'Gagal memperbarui buku. Mohon isi nama buku',
    }).code(400);
  }

  const { pageCount: pgCount } = books[index];

  if (readPage > pageCount || readPage > pgCount) {
    return h.response({
      status: 'fail',
      message: 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount',
    }).code(400);
  }

  const updatedAt = new Date().toISOString();

  books[index] = {
    ...books[index],
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    reading,
    updatedAt,
  };

  return h.response({
    status: 'success',
    message: 'Buku berhasil diperbarui',
  }).code(200);
}

function deleteBookById(req, h) {
  const { id } = req.params;
  const index = books.findIndex((b) => b.id === id);

  if (index !== -1) {
    books.splice(index, 1);
    return h.response({
      status: 'success',
      message: 'Buku berhasil dihapus',
    }).code(200);
  }

  return h.response({
    status: 'fail',
    message: 'Buku gagal dihapus. Id tidak ditemukan',
  }).code(404);
}

module.exports = {
  addBooks,
  getAllBooks,
  getBookById,
  updateBookById,
  deleteBookById,
};
