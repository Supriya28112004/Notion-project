import Document from "../models/Document.js";
import DocumentHistory from "../models/DocumentHistory.js";
import SharedDocument from "../models/SharedDocument.js";
// Create a new document
const createDocument = async (req, res) => {
  try {
    const { title, content, isPublic } = req.body;
    const ownerId = req.user.id; // assumes you're using auth middleware that sets req.user
    console.log("owner:", ownerId);
    const doc = new Document({
      title,
      content,
      isPublic,
      owner: ownerId,
    });

    await doc.save();
    res.status(201).json(doc);
  } catch (err) {
    console.error("Error creating document:", err);
    res.status(500).json({ error: "Failed to create document" });
  }
};

// Get a document by ID
// const getDocumentById = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const doc = await Document.findById(id).populate('owner', 'name email');

//     if (!doc) return res.status(404).json({ error: 'Document not found' });

//     // Add permission check if needed here
//     res.status(200).json(doc);
//   } catch (err) {
//     console.error('Error fetching document:', err);
//     res.status(500).json({ error: 'Failed to fetch document' });
//   }
// };

const getDocumentById = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document)
      return res.status(404).json({ message: "Document not found" });

    const isOwner = document.owner.toString() === req.user.id;
    const isShared = document.sharedWith.some(
      (entry) => entry.user.toString() === req.user.id
    );

    if (!isOwner && !isShared) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(document);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update a document
const updateDocument = async (req, res) => {
  try {
    const { id } = req.params;
    // console.log("doc id:", id);
    const { title, content, isPublic } = req.body;
    // console.log(req.body);

    const doc = await Document.findById(id);

    if (!doc) return res.status(404).json({ error: "Document not found" });

    if (!doc.owner.equals(req.user.id)) {
      return res
        .status(403)
        .json({ error: "Unauthorized to update this document" });
    }

    const oldSnapshot = {
      title: doc.title,
      content: doc.content,
      isPublic: doc.isPublic,
    };

    doc.title = title || doc.title;
    doc.content = content || doc.content;
    doc.isPublic = isPublic !== undefined ? isPublic : doc.isPublic;

    await doc.save();

    // Save to history
    await DocumentHistory.create({
      document: doc._id,
      changedBy: req.user.id,
      changeType: "edit",
      contentSnapshot: oldSnapshot, // optional: only content if preferred
    });

    res.status(200).json(doc);
  } catch (err) {
    console.error("Error updating document:", err);
    res.status(500).json({ error: "Failed to update document" });
  }
};

// Delete a document
const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await Document.findById(id);

    if (!doc) return res.status(404).json({ error: "Document not found" });

    if (!doc.owner.equals(req.user.id)) {
      return res
        .status(403)
        .json({ error: "Unauthorized to delete this document" });
    }

    await Document.deleteOne({ _id: id });
    res.status(200).json({ message: "Document deleted successfully" });
  } catch (err) {
    console.error("Error deleting document:", err);
    res.status(500).json({ error: "Failed to delete document" });
  }
};

// Get all documents for a user
const getDocumentsByUser = async (req, res) => {
  try {
    const userId = req.user.id;

    const docs = await Document.find({ owner: userId });
    // console.log(docs);
    res.status(200).json(docs);
  } catch (err) {
    console.error("Error fetching user documents:", err);
    res.status(500).json({ error: "Failed to fetch documents" });
  }
};

const sharedDocs = async (req, res) => {
  try {
    const userId = req.user.id;
    const userEmail = req.user.email;
    const sharedDocs = await SharedDocument.find({
      $or: [
        { sharedWith: userId }, // for registered users
        { email: userEmail }, // for users invited via email before registration
      ],
    })
      .populate({
        path: "document",
        populate: { path: "owner", select: "username email" },
      })
      .exec();

    // Filter out any null documents (in case of deletions)
    const filteredDocs = sharedDocs.filter((doc) => doc.document !== null);

    res.status(200).json(filteredDocs);
  } catch (err) {
    console.error("Error fetching shared documents:", err);
    res.status(500).json({ error: "Failed to fetch shared documents" });
  }
};

export {
  getDocumentsByUser,
  deleteDocument,
  updateDocument,
  getDocumentById,
  createDocument,
  sharedDocs,
};
