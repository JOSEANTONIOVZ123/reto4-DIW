import db from "../db/database";
import { Request, Response } from "express";

export const getGames = (req: Request, res: Response) => {
  const { usuario_id } = req.query;

  const juegos = db
    .prepare("SELECT * FROM videojuegos WHERE usuario_id=?")
    .all(usuario_id);

  res.json(juegos);
};

export const addGame = (req: Request, res: Response) => {
  const { titulo, plataforma, genero, estado, usuario_id } = req.body;

  db.prepare(`
    INSERT INTO videojuegos(titulo, plataforma, genero, estado, usuario_id)
    VALUES (?,?,?,?,?)
  `).run(titulo, plataforma, genero, estado, usuario_id);

  res.json({ mensaje: "Juego añadido" });
};

export const deleteGame = (req: Request, res: Response) => {
  db.prepare("DELETE FROM videojuegos WHERE id=?")
    .run(req.params.id);

  res.json({ mensaje: "Juego eliminado" });
};

export const updateGame = (req: Request, res: Response) => {
  const { titulo, plataforma, genero, estado } = req.body;

  db.prepare(`
    UPDATE videojuegos
    SET titulo=?, plataforma=?, genero=?, estado=?
    WHERE id=?
  `).run(titulo, plataforma, genero, estado, req.params.id);

  res.json({ mensaje: "Juego actualizado" });
};
