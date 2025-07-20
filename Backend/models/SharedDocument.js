// models/SharedDocument.js
import mongoose, { model } from "mongoose";

const SharedDocumentSchema = new mongoose.Schema(
  {
    document: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: true,
    },
    sharedWith: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    email: { type: String, required: false }, // new: stores email even if user doesn't exist
    permission: { type: String, enum: ["view", "edit"], default: "view" },
  },
  { timestamps: true }
);

// module.exports = mongoose.model('SharedDocument', SharedDocumentSchema);
export default model("SharedDocument", SharedDocumentSchema);
