import { Router } from "express";
import {
  getGames,
  addGame,
  deleteGame,
  updateGame
} from "../controllers/gameController";
import authMiddleware from "../middleware/authMiddleware";

const router = Router();

// protect all game routes
router.use(authMiddleware);

router.get("/", getGames);
router.post("/", addGame);
router.delete("/:id", deleteGame);
router.put("/:id", updateGame);

export default router;
