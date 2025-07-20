import Comment from "../models/Comment.js";
import Document from "../models/Document.js";

// Create a comment
const createComment = async (req, res) => {
  try {
    const { documentId, from, to, text, comment } = req.body;

    const newComment = new Comment({
      documentId,
      from,
      to,
      text,
      comment,
      userId: req.user.id,
    });

    const saved = await newComment.save();
    res.status(201).json(saved);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to create comment", details: err.message });
  }
};

// Get all comments on a document
const getComments = async (req, res) => {
  try {
    const comments = await Comment.find({
      documentId: req.params.documentId,
    }).populate("userId", "username email");
    res.json(comments);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to fetch comments", details: err.message });
  }
};

// Delete a comment (by author or document owner)
const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ error: "Comment not found" });
    if (comment.userId.toString() !== req.userId)
      return res.status(403).json({ error: "Not authorized" });

    await comment.deleteOne();
    res.json({ message: "Comment deleted" });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to delete comment", details: err.message });
  }
};

export { deleteComment, getComments, createComment };
