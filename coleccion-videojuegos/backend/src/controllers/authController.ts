import db from "../db/database";
import { Request, Response } from "express";

export const login = (req: Request, res: Response) => {
  const { username, password } = req.body;

  const user = db
    .prepare("SELECT * FROM usuarios WHERE username=? AND password=?")
    .get(username, password);

  if (!user) return res.status(401).json({ error: "Credenciales incorrectas" });

  res.json(user);
};

export const register = (req: Request, res: Response) => {
  const { username, password } = req.body;

  try {
    db.prepare("INSERT INTO usuarios(username,password) VALUES(?,?)")
      .run(username, password);

    res.json({ mensaje: "Usuario creado" });
  } catch {
    res.status(400).json({ error: "Usuario ya existe" });
  }
};
