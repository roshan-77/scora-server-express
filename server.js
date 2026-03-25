import express from "express";
import allRoutes from "./src/routes/index.js";
import dotenv from "dotenv";

const app = express();
app.use(express.json());
dotenv.config();

//Registers all routes
allRoutes(app);

app.listen(3000);
