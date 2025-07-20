import express from "express";
// import verifyToken from "../middlewares/authMiddleware.js";
import { authRole } from "../middlewares/authRole.js";
import { verifyToken } from "../middlewares/auth.js";

const router = express.Router();

router.get(
  "/admindata",
  verifyToken,
  authRole(['admin']),
  (req, res) => {
    res.json({ success: true, message: "Welcome Admin!" });
  }
);

router.post(
  "/editdoc",
  verifyToken,
  authRole(['admin', 'editor']),
  (req, res) => {
    res.json({ success: true, message: "Editor or Admin can edit document." });
  }
);

export default router;

