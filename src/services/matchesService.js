import matchesRepository from "../repositories/matchesRepository.js";
import sportHandlers from "./matches/sportHandlers.js";
import normalizeMatch from "../utils/normalizeMatch.js";
import AppError from "../utils/AppError.js";
import calculateTimeElapsed from "../utils/calculateTimeElapsed.js";
import eventsRepository from "../repositories/eventsRepository.js";
import matchStatus from "../constants/matchStatus.js";

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

  startFirstHalf: async (matchId) => {
    const match = await matchesRepository.findById(matchId);

    if (!match) {
      throw new AppError("No match found", 404);
    }

    if (match.status !== "not_started") {
      throw new AppError("Match already started", 400);
    }

    const currentTime = new Date();
    const matchTime = new Date(match.dateTime);

    if (currentTime < matchTime) {
      throw new AppError(
        `Match cannot start before the start time.
        Match start time is ${matchTime}`,
        400,
      );
    }

    const updatedMatchData = {
      status: matchStatus.LIVE,
      periods: match.periods.map((p, index) =>
        index === 0 ? { ...p, startTime: currentTime } : p,
      ),
    };
    const updatedMatch = await matchesRepository.updateMatch(
      matchId,
      updatedMatchData,
    );

    //Log events
    const event = {
      matchId: match._id,
      type: matchStatus.FIRST_HALF,
      matchHalf: updatedMatch.periods[0].name,
      time: calculateTimeElapsed(matchTime).minutes,
    };

    await eventsRepository.registerEvent(event);

    return updatedMatch;
  },

  endFirstHalf: async (matchId) => {
    const match = await matchesRepository.findById(matchId);

    if (!match) {
      throw new AppError("Match not found", 404);
    }

    if (match.status !== matchStatus.LIVE) {
      throw new AppError(
        `Cannot end first half when the match status is ${match.status}`,
        400,
      );
    }

    if (!match.periods[0].startTime) {
      throw new AppError("First half has not started", 400);
    }

    const matchStartTime = match.periods[0].startTime;
    const matchEndTime = new Date();

    const timeElapsed = calculateTimeElapsed(matchStartTime);
    // if (timeElapsed.minutes < match.halfDuration) {
    //   throw new AppError("Cannot end first half before minimum duration", 400);
    // }

    const updatedMatchData = {
      status: matchStatus.HALF_TIME,
      periods: match.periods.map((p, index) =>
        index === 0 ? { ...p, endTime: matchEndTime } : p,
      ),
    };

    const updatedMatch = await matchesRepository.updateMatch(
      matchId,
      updatedMatchData,
    );

    //Log events
    const event = {
      matchId: match._id,
      type: matchStatus.HALF_TIME,
      matchHalf: updatedMatch.periods[0].name,
      time: timeElapsed,
    };

    await eventsRepository.registerEvent(event);

    return updatedMatch;
  },

  startSecondHalf: async (matchId) => {
    const match = await matchesRepository.findById(matchId);

    if (!match) {
      throw new AppError("No match found", 404);
    }

    if (match.status !== matchStatus.HALF_TIME) {
      throw new AppError(
        "Second half can not be started because the match has not started, it is live or already ended",
        400,
      );
    }

    if (match.periods[1].startTime) {
      throw new AppError("Second half already started", 400);
    }

    const currentTime = new Date();

    const periods = match.periods.map((p, index) =>
      index === 1 ? { ...p, startTime: currentTime } : p,
    );

    const updatedMatchData = {
      periods,
      status: matchStatus.LIVE,
    };

    const updatedMatch = await matchesRepository.updateMatch(
      matchId,
      updatedMatchData,
    );

    //Log events
    const event = {
      matchId: match._id,
      type: matchStatus.SECOND_HALF,
      matchHalf: updatedMatch.periods[1].name,
      time: updatedMatch.halfDuration,
    };

    await eventsRepository.registerEvent(event);
    return updatedMatch;
  },
};

export default matchesService;
