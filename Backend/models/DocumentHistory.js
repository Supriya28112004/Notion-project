// models/DocumentHistory.js
import mongoose, { model } from 'mongoose';

const DocumentHistorySchema = new mongoose.Schema({
  document: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', required: true },
  changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  changeType: { type: String }, // e.g., edit, rename
  contentSnapshot: { type: mongoose.Schema.Types.Mixed },
}, { timestamps: true });

// module.exports = mongoose.model('DocumentHistory', DocumentHistorySchema);
export default model('DocumentHistory', DocumentHistorySchema);