import Database from "better-sqlite3";

const db = new Database("database.sqlite");

db.prepare(`
CREATE TABLE IF NOT EXISTS usuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE,
  password TEXT
)
`).run();

db.prepare(`
CREATE TABLE IF NOT EXISTS videojuegos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  titulo TEXT,
  plataforma TEXT,
  genero TEXT,
  estado TEXT,
  usuario_id INTEGER,
  FOREIGN KEY(usuario_id) REFERENCES usuarios(id)
)
`).run();

export default db;
