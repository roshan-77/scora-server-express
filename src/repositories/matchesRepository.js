import { matches } from "../config/db.js";

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
};

export default matchesRepository;
