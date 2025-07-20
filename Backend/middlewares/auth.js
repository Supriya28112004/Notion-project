import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config(); // load JWT_SECRET from .env

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify token
    req.userId = decoded.id;
    req.user=decoded //##
    next(); // Proceed to route handler
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

