// routes/documentRoutes.js
import express from "express";
const router = express.Router();
import auth from "../middlewares/authMiddleware.js";
import {
  getDocumentsByUser,
  deleteDocument,
  updateDocument,
  getDocumentById,
  createDocument,
  sharedDocs,
} from "../controllers/documentController.js";
import checkPermission from "../middlewares/checkPermission.js";

router.post("/", auth, createDocument);
router.get("/:id", auth, checkPermission("view"), getDocumentById);
router.put("/:id", auth, checkPermission("edit"), updateDocument);
router.delete("/:id", auth, deleteDocument);
router.get("/user/me", auth, getDocumentsByUser);
router.get("/shared/me", auth, sharedDocs );

export default router;
