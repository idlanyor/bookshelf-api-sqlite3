const { nanoid } = require('nanoid');
const { db } = require('./database');

async function addBooks(req, h) {
  const query = 'INSERT INTO books VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
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
  try {
    await db.run(query, [
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
    ]);

    const insertedBook = await new Promise((resolve, reject) => {
      const selectQuery = 'SELECT * FROM books WHERE id = ?';
      db.get(selectQuery, [id], (err, row) => {
        if (err) reject(err);
        resolve(row);
      });
    });
    if (insertedBook) {
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
      data: {
        bookId: id,
      },
    }).code(400);
  } catch (e) {
    return h.response({
      status: 'error',
      message: 'Terjadi kesalahan pada server',
    }).code(500);
  }
}

async function getAllBooks(req, h) {
  const query = 'SELECT * FROM books';

  try {
    const booksFromDB = await new Promise((resolve, reject) => {
      db.all(query, (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    });

    return h.response({
      status: 'success',
      data: {
        books: booksFromDB,
      },
    }).code(200);
  } catch (error) {
    return h.response({
      status: 'error',
      message: 'Terjadi kesalahan pada server',
    }).code(500);
  }
}

async function getBookById(req, h) {
  const { id } = req.params;
  const query = 'SELECT * FROM books WHERE id = ?';

  try {
    const bookFromDB = await new Promise((resolve, reject) => {
      db.get(query, [id], (err, row) => {
        if (err) reject(err);
        resolve(row);
      });
    });

    if (bookFromDB !== undefined) {
      return h.response({
        status: 'success',
        data: {
          book: bookFromDB,
        },
      }).code(200);
    }
    return h.response({
      status: 'fail',
      message: 'Buku tidak ditemukan',
    }).code(404);
  } catch (error) {
    return h.response({
      status: 'error',
      message: 'Terjadi kesalahan pada server',
    }).code(500);
  }
}

async function updateBookById(req, h) {
  const { id } = req.params;
  const {
    name, year, author, summary, publisher, pageCount, readPage, reading,
  } = req.payload;

  if (!name) {
    return h.response({
      status: 'fail',
      message: 'Gagal memperbarui buku. Mohon isi nama buku',
    }).code(400);
  }

  const query = `
    UPDATE books
    SET
      name = ?,
      year = ?,
      author = ?,
      summary = ?,
      publisher = ?,
      pageCount = ?,
      readPage = ?,
      reading = ?,
      updatedAt = ?
    WHERE id = ?
  `;

  try {
    const updatedAt = new Date().toISOString();
    const { pageCount: pgCount } = await new Promise((resolve, reject) => {
      const selectQuery = 'SELECT pageCount FROM books WHERE id = ?';
      db.get(selectQuery, [id], (err, row) => {
        if (err) reject(err);
        resolve(row);
      });
    });

    if (readPage > pageCount || readPage > pgCount) {
      return h.response({
        status: 'fail',
        message: 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount',
      }).code(400);
    }

    await new Promise((resolve, reject) => {
      db.run(query, [
        name,
        year,
        author,
        summary,
        publisher,
        pageCount,
        readPage,
        reading,
        updatedAt,
        id,
      ], (err) => {
        if (err) reject(err);
        resolve();
      });
    });

    return h.response({
      status: 'success',
      message: 'Buku berhasil diperbarui',
    }).code(200);
  } catch (error) {
    return h.response({
      status: 'error',
      message: 'Terjadi kesalahan pada server',
    }).code(500);
  }
}

async function deleteBookById(req, h) {
  const { id } = req.params;
  const query = 'DELETE FROM books WHERE id = ?';

  try {
    await new Promise((resolve, reject) => {
      db.run(query, [id], (err) => {
        if (err) reject(err);
        resolve();
      });
    });

    return h.response({
      status: 'success',
      message: 'Buku berhasil dihapus',
    }).code(200);
  } catch (error) {
    return h.response({
      status: 'error',
      message: 'Terjadi kesalahan pada server',
    }).code(500);
  }
}

module.exports = {
  addBooks,
  getAllBooks,
  getBookById,
  updateBookById,
  deleteBookById,
};
