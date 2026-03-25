import express from "express";
import { verifyToken } from "../middlewares/authMiddleware.js";
import profileController from "../controllers/profileController.js";

const router = express.Router();

router.get("/", verifyToken, profileController.profile);

export default router;
