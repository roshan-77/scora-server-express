import { matches } from "../config/db.js";
import { ObjectId } from "mongodb";

const matchesRepository = {
  findAll: async () => {
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

    return allMatches;
  },

  insertOne: async (data) => {
    return await matches.insertOne(data);
  },

  findById: async (id) => {
    return await matches.findOne({ _id: new ObjectId(id) });
  },

  updateMatch: async (matchId, matchData) => {
    return await matches.findOneAndUpdate(
      { _id: new ObjectId(matchId) },
      {
        $set: {
          status: matchData.status,
          periods: matchData.periods,
        },
      },
      { returnDocument: "after" },
    );
  },
};

export default matchesRepository;
