// models/Document.js
import mongoose, { model } from 'mongoose';

const DocumentSchema = new mongoose.Schema({
  title: { type: String, default: 'Untitled' },
  content: { type: mongoose.Schema.Types.Mixed }, // JSON or string
  isPublic: { type: Boolean, default: false },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

// module.exports = mongoose.model('Document', DocumentSchema);
export default model('Document', DocumentSchema);
