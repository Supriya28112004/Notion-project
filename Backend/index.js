import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { setupSwagger } from './swagger.js';

import http from "http";
import { Server } from "socket.io";

dotenv.config();
import cors from "cors";
import authroutes from "./Routes/auth.js";
import protectedRoutes from "./Routes/Protected.js";
import connectDB from "./config/db.js";
// import folderRoutes from "./Routes/FolderRoutes.js";
import documentRoutes from "./Routes/DocumentRoutes.js";

// import documentRoutes from './Routes/documentRoutes.js';
import sharedDocRoutes from "./Routes/sharedDocuments.js";
import docHistoryRoutes from "./Routes/docHistory.js";
import commentRoutes from "./Routes/commentRoutes.js";

import verifyToken from "./middlewares/authMiddleware.js";
// dotenv.config();
const app = express();
setupSwagger(app); 
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // your React frontend
    methods: ["GET", "POST"],
  },
});

const docIdToUsers = new Map();
const userCursors = new Map();

// 🔌 Socket.IO logic
io.on("connection", (socket) => {
  console.log("🟢 Socket connected:", socket.id);

  socket.on("join-document", ({ docId, userId, username }) => {
    const previousDocId = socket.docId;

    // Leave previous doc (if any)
    if (previousDocId && docIdToUsers.has(previousDocId)) {
      const userMap = docIdToUsers.get(previousDocId);
      userMap.delete(userId);

      if (userMap.size === 0) {
        docIdToUsers.delete(previousDocId);
      } else {
        const users = Array.from(userMap).map(([id, name]) => ({
          userId: id,
          username: name,
        }));
        io.to(previousDocId).emit("document-users", users);
      }

      socket.leave(previousDocId);
    }

    // Join new doc
    socket.join(docId);
    socket.docId = docId;
    socket.userId = userId;

    if (!docIdToUsers.has(docId)) {
      docIdToUsers.set(docId, new Map());
    }

    docIdToUsers.get(docId).set(userId, username);

    const users = Array.from(docIdToUsers.get(docId)).map(([id, name]) => ({
      userId: id,
      username: name,
    }));

    io.to(docId).emit("document-users", users);

    console.log(`✅ ${username} (${userId}) switched to doc ${docId}`);
  });

  socket.on("send-changes", ({ docId, content }) => {
    console.log(`📩 Changes received from ${socket.id} for doc ${docId}`);
    socket.to(docId).emit("receive-changes", content);
  });

  socket.on(
    "cursor-position",
    ({ docId, userId, username, from, to, color }) => {
      console.log(`📍 Cursor movement by ${username}: ${from} → ${to}`);

      // Store cursor position
      userCursors.set(userId, { docId, from, to, username, color });

      console.log("docId in backnd:", docId);

      // Broadcast to other users in the same document (not to sender)
      socket.to(docId).emit("update-cursor", {
        userId,
        username,
        from,
        to,
        color,
      });
      console.log("📤 Sent cursor update", { userId, username });
    }
  );

  socket.on("disconnect", () => {
    const { docId, userId } = socket;

    if (docId && docIdToUsers.has(docId)) {
      const userMap = docIdToUsers.get(docId);
      userMap.delete(userId);

      if (userMap.size === 0) {
        docIdToUsers.delete(docId);
      } else {
        const users = Array.from(userMap).map(([id, name]) => ({
          userId: id,
          username: name,
        }));
        io.to(docId).emit("document-users", users);
      }
    }

    console.log(`❌ ${userId} disconnected from doc ${docId}`);
  });
});

app.use("/api/auth", authroutes);
app.use("/api/protected", protectedRoutes);
app.get("/", (req, res) => {
  res.send("hi");
});
app.use(verifyToken);
app.use("/api/documents", documentRoutes);
app.use("/api/shares", sharedDocRoutes);
app.use("/api/documents/:documentId/history", docHistoryRoutes);
app.use("/api/comments", commentRoutes);

const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  // app.listen(PORT,()=>console.log(`Server running on ${PORT}`));
  server.listen(PORT, () => {
    console.log("Express + Socket.IO server running on port 3000");
  });
});
