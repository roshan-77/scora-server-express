import { players } from "../config/db.js";

const playerController = {
  getPlayers: async (req, res) => {
    const player = await players.find().toArray();
    res.send(player);
  },
};

export default playerController;
