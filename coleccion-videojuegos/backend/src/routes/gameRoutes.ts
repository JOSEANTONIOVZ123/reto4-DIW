import { Router } from "express";
import {
  getGames,
  addGame,
  deleteGame,
  updateGame
} from "../controllers/gameController";

const router = Router();

router.get("/", getGames);
router.post("/", addGame);
router.delete("/:id", deleteGame);
router.put("/:id", updateGame);

export default router;
