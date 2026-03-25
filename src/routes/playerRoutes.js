import express from "express";
import playerController from "../controllers/playerController.js";

const router = express.Router();

router.get("/", playerController.getPlayers);

export default router;
