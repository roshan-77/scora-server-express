import { ObjectId } from "mongodb";
import { players } from "../config/db.js";

const playerRepository = {
  findAll: async () => {
    return await players.find().toArray();
  },

  findOneAndUpdate: async (id, updateData) => {
    return await players.findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: updateData,
      },
      { returnDocument: "after" },
    );
  },
};

export default playerRepository;
