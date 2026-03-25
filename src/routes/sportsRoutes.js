import express from "express";
import sportsController from "../controllers/sportsController.js";

const router = express.Router();

router.get("/", sportsController.getSports);

export default router;
