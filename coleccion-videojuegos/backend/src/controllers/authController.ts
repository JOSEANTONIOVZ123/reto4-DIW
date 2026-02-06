import db from "../db/database";
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "cambiame_por_una_secreta";

export const login = (req: Request, res: Response) => {
  const { username, password } = req.body;

  const user: any = db
    .prepare("SELECT * FROM usuarios WHERE username=?")
    .get(username);

  if (!user) return res.status(401).json({ error: "Credenciales incorrectas" });

  const match = bcrypt.compareSync(password, user.password);
  if (!match) return res.status(401).json({ error: "Credenciales incorrectas" });

  const token = jwt.sign({ id: user.id, username: user.username }, SECRET, { expiresIn: "1h" });

  res.json({ token, user: { id: user.id, username: user.username } });
};

export const register = (req: Request, res: Response) => {
  const { username, password } = req.body;

  try {
    const hash = bcrypt.hashSync(password, 8);
    const result = db.prepare("INSERT INTO usuarios(username,password) VALUES(?,?)")
      .run(username, hash);

  const userId = (result as any).lastInsertRowid;
    const token = jwt.sign({ id: userId, username }, SECRET, { expiresIn: "1h" });

    res.status(201).json({ token, user: { id: userId, username } });
  } catch (err) {
    res.status(400).json({ error: "Usuario ya existe" });
  }
};
