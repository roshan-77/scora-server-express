import express from "express";
import matchesController from "../controllers/matchesController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", matchesController.getMatches);
router.get("/:id", matchesController.getMatch);
router.post("/create-match", verifyToken, matchesController.createMatch);
router.patch("/:id/start-first-half", matchesController.startFirstHalf);
router.post("/:id/end-first-half", matchesController.endFirstHalf);
router.post("/:id/start-second-half", matchesController.startSecondHalf);
router.post("/:id/end-second-half", matchesController.endSecondHalf);
router.post("/:id/score-a-match", matchesController.scoreAMatch);

export default router;
