import { events } from "../config/db.js";

const eventsRepository = {
  registerEvent: async (data) => {
    return await events.insertOne(data);
  },
};

export default eventsRepository;
