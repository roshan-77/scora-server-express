import { matches } from "../config/db.js";
import sportHandlers from "../services/matches/sportHandlers.js";
import normalizeMatch from "../utils/normalizeMatch.js";
import { ObjectId } from "mongodb";

const matchesController = {
  getMatches: async (req, res) => {
    try {
      //This will remove the unwanted fields in the output
      const allMatches = await matches
        .find(
          {},
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
        )
        .toArray();

      if (allMatches.length === 0) {
        return res.status(404).send("No matches found");
      }

      res.json(allMatches);
    } catch (error) {
      console.error(error);
      res.status(500).send("Server Error");
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

  createMatch: async (req, res) => {
    const { sport } = req.body;
    const { userId } = req.user;
    const normalizedMatch = normalizeMatch(req.body);

    const handler = sportHandlers[sport.toLowerCase()];
    if (!handler) {
      return res.status(400).send("Invalid sport");
    }

    try {
      const match = handler(req.body, userId); //Returns an object to be inserted in the database

      const result = await matches.insertOne({ ...match, ...normalizedMatch }); // Store both normal and normalized values in database. During insetOne, it checks normalizedKey and avoids duplicate entries
      res.status(201).json({
        message: "Match created",
        id: result.insertedId,
      });
    } catch (error) {
      if (error.code == 11000) return res.status(409).send("Duplicate match!");
      res.status(500).send("Server Error");
    }
  },

  startFirstHalf: async (req, res) => {
    try {
      const matchId = req.params.id;

      const match = await matches.findOne({ _id: new ObjectId(matchId) });
      if (!match) {
        return res.status(404).send("Match not found");
      }

      //Validate current state of the match
      if (match.status !== "not_started") {
        return res.status(400).send("Match already started or match ended.");
      }
      const currentTime = new Date();
      const matchTime = new Date(match.dateTime);
      if (currentTime < matchTime) {
        return res.status(400).json({
          error: "Match cannot be started before the start date and time.",
          message: `Match start time is ${matchTime}`,
        });
      }

      match.periods[0].startTime = currentTime;
      match.status = "live";

      //Log events
      match.events.push({
        type: "MATCH_STARTED",
        period: match.periods[0].name,
        timeStamp: new Date(),
      });

      //Update in database
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
        message: "First half started",
        matchId: match._id,
        status: match.status,
        periods: match.periods,
      });
    } catch (err) {
      es.status(500).json({ message: err.message });
    }
  },

  endFirstHalf: async (req, res) => {
    const matchId = req.params.id;

    const match = await matches.findOne({ _id: new ObjectId(matchId) });

    if (!match) {
      return res.status(404).send("Match not found");
    }

    if (match.status !== "live") {
      return res
        .status(400)
        .send("Match is not currently live to end the first half");
    }

    if (!match.periods[0].startTime) {
      return res.status(400).send("First half has not started");
    }

    try {
      const timeElapsed = Math.floor(
        (new Date() - match.periods[0].startTime) / 60000,
      );

      match.status = "half_time";
      match.periods[0].endTime = new Date();

      //Log events
      match.events.push({
        type: "HALF_TIME",
        period: match.periods[0].name,
        timestamp: new Date(),
      });

      if (timeElapsed >= match.halfDuration) {
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
          message: "First half ended",
          matchId: match._id,
        });
      } else {
        res.status(400).json({
          message: "First half cannot end before the half time",
          matchId: match._id,
        });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  startSecondHalf: async (req, res) => {
    try {
      const matchId = req.params.id;

      const match = await matches.findOne({ _id: new ObjectId(matchId) });

      if (!match) {
        return res.status(404).send("Match not found");
      }

      if (match.status != "half_time") {
        return res
          .status(400)
          .send(
            "Second half can not be started because the match has not started, it is live or already ended.",
          );
      }

      if (match.periods[1].startTime) {
        return res.status(400).send("Second half already satrted");
      }

      match.periods[1].startTime = new Date();
      match.status = "live";

      match.events.push({
        type: "SECOND_HALF",
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
        message: "Second Half started",
        matchId: match._id,
        status: match.status,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
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
      const { team } = req.body; // home away

      const foundMatch = await matches.findOne({ _id: new ObjectId(matchId) });

      if (!foundMatch) {
        return res.status(404).send("Match not found");
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
