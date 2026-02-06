import express from "express";
import cors from "cors";
import "./db/database";
import authRoutes from "./routes/authRoutes";
import gameRoutes from "./routes/gameRoutes";


const app = express();

// middlewares
app.use(cors());
app.use(express.json());

// routes
app.use("/auth", authRoutes);
app.use("/games", gameRoutes);

app.listen(3000, () => {
  console.log("Servidor en http://localhost:3000");
});
