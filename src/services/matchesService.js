import matchesRepository from "../repositories/matchesRepository.js";
import sportHandlers from "./matches/sportHandlers.js";
import normalizeMatch from "../utils/normalizeMatch.js";
import AppError from "../utils/AppError.js";

const matchesService = {
  getMatches: async () => {
    const matches = await matchesRepository.findAll();
    return matches;
  },

  createMatch: async (data, userId) => {
    const handler = sportHandlers[data.sport];

    if (!handler) {
      throw new AppError("Invalid sport", 400);
    }

    const match = handler(data, userId);
    const normalizedMatch = normalizeMatch(match);

    try {
      const result = await matchesRepository.insertOne({
        ...match,
        ...normalizedMatch,
      });

      return result;
    } catch (error) {
      if (error.code === 11000) {
        throw new AppError("Duplicate match!", 409);
      }
      throw new AppError("Internal server error", 500, false);
    }
  },
};

export default matchesService;
