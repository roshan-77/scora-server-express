import { users } from "../config/db.js";

const profileController = {
  profile: async (req, res) => {
    const email = req.user.email;
    const user = await users.findOne({ email });

    if (!user) {
      res.status(401).send("User not found");
    }
    const { _id, firstName, lastName } = user;
    res.json({ _id, firstName, lastName, email });
  },
};

export default profileController;
