import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Document",
    required: true,
  },
  from: { type: Number, required: true },
  to: { type: Number, required: true },
  text: { type: String }, // optional: snapshot of text
  comment: { type: String, required: true },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Comment", commentSchema);
