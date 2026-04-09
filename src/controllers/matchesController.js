import { matches } from "../config/db.js";
import { players } from "../config/db.js";
import sportHandlers from "../services/matches/sportHandlers.js";
import normalizeMatch from "../utils/normalizeMatch.js";
import { ObjectId } from "mongodb";
import matchesService from "../services/matchesService.js";
import AppError from "../utils/AppError.js";

const matchesController = {
  getMatches: async (req, res, next) => {
    try {
      const result = await matchesService.getMatches();

      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  getMatch: async (req, res) => {
    const matchId = req.params.id;

    const match = await matches.findOne(
      { _id: new ObjectId(matchId) },
      {
        projection: {
          normalizeSport: 0,
          normalizeTeamA: 0,
          normalizeTeamB: 0,
          normalizeDatetime: 0,
          normalizedKey: 0,
          createdAt: 0,
          createdBy: 0,
        },
      },
    );
    if (!match) {
      return res.status(404).send("Match not found");
    }

    res.send(match);
  },

  createMatch: async (req, res, next) => {
    try {
      const result = await matchesService.createMatch(
        req.body,
        req.user.userId,
      );
      res.status(201).json({
        message: "Match created",
        id: result.insertedId.toString(),
      });
    } catch (error) {
      next(error);
    }
  },

  startFirstHalf: async (req, res, next) => {
    try {
      const matchId = req.params.id;
      const match = await matchesService.startFirstHalf(matchId);

      res.status(200).json({
        message: "First half started",
        matchId: match._id,
        status: match.status,
        periods: match.periods,
      });
    } catch (error) {
      next(error);
    }
  },

  endFirstHalf: async (req, res, next) => {
    try {
      const matchId = req.params.id;
      const match = await matchesService.endFirstHalf(matchId);

      res.status(200).json({
        message: "First half ended",
        matchId: match._id,
        status: match.status,
        periods: match.periods,
      });
    } catch (error) {
      next(error);
    }
  },

  startSecondHalf: async (req, res, next) => {
    try {
      const matchId = req.params.id;

      const match = await matchesService.startSecondHalf(matchId);

      res.status(200).json({
        message: "Second Half started",
        matchId: match._id,
        status: match.status,
        periods: match.periods,
      });
    } catch (error) {
      next(error);
    }
  },

  endSecondHalf: async (req, res) => {
    try {
      const matchId = req.params.id;

      const match = await matches.findOne({ _id: new ObjectId(matchId) });

      if (!match) {
        return res.status(404).send("Match not found");
      }

      if (!match.periods[0].endTime) {
        return res.status(400).send("First half has not ended");
      }

      if (match.periods[1].endTime) {
        return res.status(400).send("Match already ended");
      }

      if (!match.periods[1].startTime) {
        return res.status(400).send("Second half has not started");
      }

      if (match.status != "live") {
        return res.status(400).send("Match is not currently live");
      }

      const elapsedTime = Math.floor(
        (new Date() - match.periods[1].startTime) / 60000,
      );

      if (elapsedTime <= match.halfDuration) {
        return res.status(400).send("Match can not be ended before full time");
      }

      match.status = "ended";
      match.periods[1].endTime = new Date();

      match.events.push({
        type: "MATCH_ENDED",
        period: match.periods[1].name,
        timestamp: new Date(),
      });

      await matches.updateOne(
        { _id: new ObjectId(matchId) },
        {
          $set: {
            status: match.status,
            periods: match.periods,
            events: match.events,
          },
        },
      );

      res.status(200).json({
        message: "Match ended",
        matchId: match._id,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  scoreAMatch: async (req, res) => {
    try {
      const matchId = req.params.id;
      const { team, goalScorerId, assistProviderId } = req.body || {}; // home away

      const error = [];
      if (!team) {
        error.push({ field: team, message: "Team is required" });
      }
      if (!goalScorerId) {
        error.push({ field: goalScorerId, message: "Goal scorer is required" });
      }
      if (assistProviderId && typeof assistProvider != "string") {
        error.push({
          field: assistProviderId,
          message: "Assist provider should be valid Id",
        });
      }

      if (error.length > 0) {
        return res.status(400).json({
          error: "VALIDATION_ERROR",
          error,
        });
      }

      const foundMatch = await matches.findOne({ _id: new ObjectId(matchId) });
      if (!foundMatch) {
        return res.status(404).send("Invalid Match Id");
      }

      const goalScorer = await players.findOne({
        _id: new ObjectId(goalScorerId),
      });
      if (!goalScorer) {
        return res.status(400).send("Goal scorer not found");
      }
      let assistProvider;
      if (assistProviderId) {
        assistProvider = await players.findOne({
          _id: new ObjectId(assistProviderId),
        });
        if (!assistProvider) {
          return res.status(400).json({ message: "Assist provider not found" });
        }
      }

      if (foundMatch.status != "live") {
        return res.status(400).send("Match must be live to score");
      }

      if (!["home", "away"].includes(team)) {
        return res.status(400).send("Invalid team");
      }

      //First or second half
      let halfIndex;
      if (!foundMatch.periods[0].endTime) {
        halfIndex = 0;
      } else {
        halfIndex = 1;
      }

      const currentPeriod = foundMatch.periods[halfIndex];
      const goalTime = Math.floor(
        (new Date() - foundMatch.periods[0].startTime) / 60000,
      );

      if (team === "home") {
        foundMatch.score.home += 1;
      } else if (team === "away") {
        foundMatch.score.away += 1;
      }

      foundMatch.events.push({
        type: "GOAL",
        half: currentPeriod.name,
        time: goalTime,
        timestamp: new Date(),
        goalScorer: goalScorer.firstName[0] + ". " + goalScorer.lastName,
        assistProvider:
          assistProvider.firstName[0] + ". " + assistProvider.lastName,
      });

      await matches.updateOne(
        { _id: new ObjectId(matchId) },
        {
          $set: {
            score: foundMatch.score,
            events: foundMatch.events,
          },
        },
      );

      res.status(200).send("Match successfully scored");
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
};

export default matchesController;
