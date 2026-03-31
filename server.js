import express from "express";
import allRoutes from "./src/routes/index.js";
import dotenv from "dotenv";
import errorMiddleware from "./src/middlewares/errorMiddleware.js";

const app = express();
app.use(express.json());
dotenv.config();

//Registers all routes
allRoutes(app);

//Error middleware at last after everything
app.use(errorMiddleware);

app.listen(3000);
