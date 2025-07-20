import DocumentHistory from '../models/DocumentHistory.js';
import Document from '../models/Document.js';

// Get document history by document ID
const getDocumentHistory = async (req, res) => {
  try {
    const { documentId } = req.params;

    const history = await DocumentHistory.find({ document: documentId })
      .populate('changedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json(history);
  } catch (err) {
    console.error('Error fetching history:', err);
    res.status(500).json({ error: 'Failed to fetch document history' });
  }
};

// Restore a specific version
const restoreVersion = async (req, res) => {
  try {
    const { historyId } = req.params;

    const history = await DocumentHistory.findById(historyId);
    if (!history) return res.status(404).json({ error: 'Version not found' });

    const doc = await Document.findById(history.document);
    if (!doc) return res.status(404).json({ error: 'Document not found' });

    if (!doc.owner.equals(req.user._id)) {
      return res.status(403).json({ error: 'Only the owner can restore versions' });
    }

    doc.content = history.contentSnapshot;
    await doc.save();

    res.status(200).json({ message: 'Document restored successfully', document: doc });
  } catch (err) {
    console.error('Error restoring version:', err);
    res.status(500).json({ error: 'Failed to restore version' });
  }
};

export {restoreVersion, getDocumentHistory}