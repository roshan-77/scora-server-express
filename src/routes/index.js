import sportsRoutes from "./sportsRoutes.js";
import matchesRoutes from "./matchesRoutes.js";
import authRoutes from "./authRoutes.js";
import profileRoutes from "./profileRoutes.js";
import playerRoutes from "./playerRoutes.js";

const allRoutes = (app) => {
  app.use("/api/matches", matchesRoutes);
  app.use("/api/sports", sportsRoutes);
  app.use("/api/auth", authRoutes);
  app.use("/api/profile", profileRoutes);
  app.use("/api/players", playerRoutes);
};

export default allRoutes;
