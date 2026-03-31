import playerRepository from "../repositories/playerRepository.js";
import AppError from "../utils/AppError.js";
import { updatePlayerSchema } from "../validators/playerValidator.js";
import { ObjectId } from "mongodb";

const playerService = {
  getAllPlayers: async () => {
    const players = await playerRepository.findAll();

    return players.map((player) => ({
      ...player,
      teamId: player.teamId || null,
    }));
  },

  updatePlayer: async (playerId, data) => {
    const { error, value } = updatePlayerSchema.validate(data);

    if (error) {
      throw new AppError(error.details[0].message, 400);
    }

    if (!ObjectId.isValid(playerId)) {
      throw new AppError("Invalid player Id", 400);
    }

    const result = await playerRepository.findOneAndUpdate(playerId, value);

    if (!result) {
      throw new AppError("Player not found", 404);
    }

    return result;
  },
};

export default playerService;
