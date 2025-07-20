import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/Users.js";
import { signupschema, loginschema } from "../user.validator.js";
import verifyToken  from "../middlewares/authMiddleware.js";
import dotenv from "dotenv";
dotenv.config();


const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET
// console.log("JWT_SECRET loaded:", JWT_SECRET);
if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
}

router.get("/profile", verifyToken, (req, res) => {
    res.json({
        success: true,
        message: "You accessed a protected route",
        user: req.user,
    });
});
router.post("/signup", async (req, res) => {
  try {
    const parseddata = signupschema.parse(req.body);
    const { username, email, password, confirmpassword, acceptterms, role } =
      req.body;

    if (password != confirmpassword) {
      return res
        .status(400)
        .json({ success: false, message: "Passwords are not same" });
    }
    if (!acceptterms) {
      return res
        .status(400)
        .json({
          success: false,
          message: "You must accept the terms and conditions",
        });
    }
    const existinguser = await User.findOne({ email });
    if (existinguser) {
      return res
        .status(400)
        .json({ success: false, message: "account already exists" });
    }

    const hashedpassword = await bcrypt.hash(password, 15);
    const newuser = await User.create({
      username,
      email,
      password: hashedpassword,
      role: role || "viewer",
    });
    res
      .status(201)
      .json({ success: true, message: "Account created successfully" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    console.log("Received body at backend:", req.body);

    const { email, password } = loginschema.parse(req.body);
    const user = await User.findOne({ email });
    console.log("User from DB:", user);
    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid user" });
    }
    const matched = await bcrypt.compare(password, user.password);
    if (!matched) {
      return res
        .status(401)
        .json({ success: false, message: "invalid credentials" });
    }
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "15d" }
    );
    res.status(200).json({ success: true, token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(400).json({ success: false, message: error.message });
  }
});
export default router;
