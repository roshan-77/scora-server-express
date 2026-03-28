import express from "express";
import playerController from "../controllers/playerController.js";

const router = express.Router();

router.get("/", playerController.getPlayers);
router.patch("/update-player/:id", playerController.updatePlayer);

export default router;
