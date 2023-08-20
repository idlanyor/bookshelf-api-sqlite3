/* eslint-disable import/no-extraneous-dependencies */
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./src/books.db');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS books (
  id TEXT PRIMARY KEY,
  name TEXT,
  year INTEGER,
  author TEXT,
  summary TEXT,
  publisher TEXT,
  pageCount INTEGER,
  readPage INTEGER,
  finished BOOLEAN,
  reading BOOLEAN,
  insertedAt TEXT,
  updatedAt TEXT
)`);
});

function closeDatabase() {
  db.close();
}

module.exports = { db, closeDatabase };
