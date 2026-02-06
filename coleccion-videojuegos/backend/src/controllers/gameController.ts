import db from "../db/database";
import { Request, Response } from "express";

type AuthRequest = Request & { user?: { id: number; username?: string } };

export const getGames = (req: AuthRequest, res: Response) => {
  const usuario_id = req.user?.id;

  const juegos = db
    .prepare("SELECT * FROM videojuegos WHERE usuario_id=?")
    .all(usuario_id);

  res.json(juegos);
};

export const addGame = (req: AuthRequest, res: Response) => {
  const { titulo, plataforma, genero, estado } = req.body;
  const usuario_id = req.user?.id;

  db.prepare(`
    INSERT INTO videojuegos(titulo, plataforma, genero, estado, usuario_id)
    VALUES (?,?,?,?,?)
  `).run(titulo, plataforma, genero, estado, usuario_id);

  res.json({ mensaje: "Juego añadido" });
};

export const deleteGame = (req: AuthRequest, res: Response) => {
  const game: any = db.prepare("SELECT * FROM videojuegos WHERE id=?").get(req.params.id);
  if (!game) return res.status(404).json({ error: "Juego no encontrado" });
  if (game.usuario_id !== req.user?.id) return res.status(403).json({ error: "No autorizado" });

  db.prepare("DELETE FROM videojuegos WHERE id=?").run(req.params.id);

  res.json({ mensaje: "Juego eliminado" });
};

export const updateGame = (req: AuthRequest, res: Response) => {
  const { titulo, plataforma, genero, estado } = req.body;
  const game: any = db.prepare("SELECT * FROM videojuegos WHERE id=?").get(req.params.id);
  if (!game) return res.status(404).json({ error: "Juego no encontrado" });
  if (game.usuario_id !== req.user?.id) return res.status(403).json({ error: "No autorizado" });

  db.prepare(`
    UPDATE videojuegos
    SET titulo=?, plataforma=?, genero=?, estado=?
    WHERE id=?
  `).run(titulo, plataforma, genero, estado, req.params.id);

  res.json({ mensaje: "Juego actualizado" });
};
