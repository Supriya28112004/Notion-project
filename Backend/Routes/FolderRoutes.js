import express from "express";
import Folder from "../models/Folder.js";
import { verifyToken } from "../middlewares/auth.js";

const router = express.Router();

// Create a folder
router.post("/", verifyToken, async (req, res) => {
  try {
    const { name } = req.body; 
    const folder = new Folder({ name, owner: req.userId });
    const saved = await folder.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



router.get("/", verifyToken, async (req, res) => {
  try {
    const folders = await Folder.find({ owner: req.userId });
    res.json(folders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
