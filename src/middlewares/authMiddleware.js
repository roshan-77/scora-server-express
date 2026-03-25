import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).send("Access denied");
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); //This stores the payload once verified
    req.user = decoded; //Sends the payload as request.
    next();
  } catch (error) {
    res.status(401).send("Invalid token");
  }
};
