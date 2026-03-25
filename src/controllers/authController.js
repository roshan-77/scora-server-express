import { users, players } from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { registerSchema } from "../validators/authValidator.js";

const authController = {
  loginUser: async (req, res) => {
    const { email, password } = req.body;

    const foundUser = await users.findOne({ email });
    if (!foundUser) {
      return res.status(401).send("Email not found");
    }

    const isMatch = await bcrypt.compare(password, foundUser.password);
    if (!isMatch) {
      return res.status(401).send("Invalid password");
    }
    const token = jwt.sign(
      { userId: foundUser._id, email },
      process.env.JWT_SECRET,
      { expiresIn: "1hr" },
    );

    res.json({ token });
  },

  registerUser: async (req, res) => {
    try {
      const { error, value } = registerSchema.validate(req.body);

      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const { email } = value;
      const existingUser = await users.findOne({ email });

      if (existingUser) {
        return res.status(400).send("User already exists");
      }

      const { password } = value;
      const hashedPassword = await bcrypt.hash(password, 10);

      //Define a role for a player
      value.role = "player";

      //Enter user into a database
      const result = await users.insertOne({
        ...value,
        password: hashedPassword,
      });

      //Enter user into user database
      await players.insertOne({
        userId: result.insertedId,
        firstName: value.firstName,
        lastName: value.lastName,
        sport: value.sport,
        stats: {},
      });

      res.status(201).send("User registered");
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal server error");
    }
  },
};

export default authController;
