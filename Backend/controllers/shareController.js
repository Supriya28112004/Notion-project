import SharedDocument from "../models/SharedDocument.js";
import Document from "../models/Document.js";
import User from "../models/Users.js";
import sendEmail from "../utils/sendEmail.js";

const shareDocument = async (req, res) => {
  try {
    const { documentId } = req.params;
    const { email, permission } = req.body;

    const document = await Document.findById(documentId);
    if (!document) return res.status(404).json({ error: "Document not found" });

    if (!document.owner.equals(req.user.id)) {
      return res
        .status(403)
        .json({ error: "You are not the owner of this document" });
    }

    const invitingUser = await User.findById(req.user.id); // who is inviting
    let targetUser = await User.findOne({ email });

    const existingShare = await SharedDocument.findOne({
      document: documentId,
      email, // match by email
    });

    if (existingShare) {
      existingShare.permission = permission;
      await existingShare.save();
    } else {
      await SharedDocument.create({
        document: documentId,
        sharedWith: targetUser ? targetUser._id : null, // null if not registered yet
        email,
        permission,
      });
    }

    // TODO: Send email invite with link
    // Example: http://yourapp.com/signup?email=someone@example.com&docId=xyz
    // Use Nodemailer or SendGrid here

    const link = `http://localhost:5173/auth?email=${encodeURIComponent(
      email
    )}&docId=${documentId}`;
    const subject = `${invitingUser.username} invited you to collaborate on a document`;

    const html = `
      <p>Hello,</p>
      <p><strong>${invitingUser.username}</strong> has shared a document with you.</p>
      <p>Click the link below to access it:</p>
      <a href="${link}">${link}</a>
      <p>If you don’t have an account, sign up using the same email to gain access.</p>
    `;

    await sendEmail({ to: email, subject, html });

    res
      .status(200)
      .json({ message: `Document shared with ${email}. Invitation sent.` });
  } catch (err) {
    console.error("Error sharing document:", err);
    res.status(500).json({ error: "Failed to share document" });
  }
};

// Get all users document is shared with
const getSharedUsers = async (req, res) => {
  try {
    const { documentId } = req.params;

    const shares = await SharedDocument.find({ document: documentId }).populate(
      "sharedWith",
      "name email"
    );
    res.status(200).json(shares);
  } catch (err) {
    console.error("Error fetching shared users:", err);
    res.status(500).json({ error: "Failed to fetch shared users" });
  }
};

export { getSharedUsers, shareDocument };
