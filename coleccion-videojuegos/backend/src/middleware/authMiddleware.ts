import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "cambiame_por_una_secreta";

export default function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers["authorization"] as string | undefined;
  if (!auth) return res.status(401).json({ error: "No token" });

  const parts = auth.split(" ");
  if (parts.length !== 2) return res.status(401).json({ error: "Token mal formado" });

  const token = parts[1];

  try {
    const payload = jwt.verify(token, SECRET) as any;
    // attach user info to request
    (req as any).user = { id: payload.id, username: payload.username };
    next();
  } catch (err) {
    return res.status(401).json({ error: "Token inválido" });
  }
}
