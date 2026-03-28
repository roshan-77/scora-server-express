import { ObjectId } from "mongodb";
import { players } from "../config/db.js";
import { playerSchema } from "../validators/playerValidator.js";

const playerController = {
  getPlayers: async (req, res) => {
    const player = await players.find().toArray();
    res.status(200).send(player);
  },

  updatePlayer: async (req, res) => {
    try {
      const { error, value } = playerSchema.validate(req.body);
      const playerId = req.params.id;

      if (error) {
        return res.status(400).json({ message: error.details[0].message });
      }

      if (!ObjectId.isValid(playerId)) {
        return res.status(400).json({ message: "Invalid player Id" });
      }

      const updatedPlayer = await players.findOneAndUpdate(
        { _id: new ObjectId(playerId) },
        { $set: value },
        { returnDocument: "after" },
      );

      if (!updatedPlayer) {
        return res.status(404).json({ message: "Player not found" });
      }

      res.status(200).json({
        data: updatedPlayer,
        message: "Player detail successfully updated",
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Something went wrong", error: error.message });
    }
  },
};

export default playerController;
