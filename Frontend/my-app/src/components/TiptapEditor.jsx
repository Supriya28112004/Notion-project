import React, { useEffect, useState, useRef, useContext } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";

import CollaborationCaret from "@tiptap/extension-collaboration-caret";
import { io } from "socket.io-client";
import throttle from "lodash.throttle";
import { AuthContext } from "../context/AuthContext";
// import { CollaborationCursors } from "../TiptapExtensions/CollaborationCursors";

import { Collaboration } from "@tiptap/extension-collaboration";
import { CollaborationCursor } from "@tiptap/extension-collaboration-cursor";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
// import randomColor from "randomcolor";

// import StarterKit from '@tiptap/starter-kit';
import { Comment } from "../TiptapExtensions/Comment";
import getUserColor from "./colors";
const socket = io("http://localhost:3000");

export default function TiptapEditor({ content, onUpdate, docId }) {
  const { currentUser } = useContext(AuthContext);
  console.log("document is:", docId);
  const [activeComment, setActiveComment] = useState(null);
  const token = localStorage.getItem("token");
  const [allComments, setAllComments] = useState([]);
  const [remoteCursors, setRemoteCursors] = useState({});
  

  const fetchCommentById = async (docId) => {
    const res = await fetch(`http://localhost:3000/api/comments/${docId}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    setActiveComment(data.comment);
  };

  const editor = useEditor({
    extensions: [
      StarterKit,
      Comment,
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    content,
    onUpdate: throttle(({ editor }) => {
      const json = editor.getJSON();
      console.log("✏️ Local update triggered:", json); // ✅ Add this
      onUpdate(json);
      console.log("📤 Emitting changes to backend");
      console.log("docid:", docId);
      socket.emit("send-changes", { docId, content: json });
    }, 500), // 500ms throttle
  });

  useEffect(() => {
    if (!editor || !currentUser || !docId) return;

    const handleSelectionUpdate = () => {
      const { from, to } = editor.state.selection;

      socket.emit("cursor-position", {
        docId,
        userId: currentUser.id,
        username: currentUser.username,
        from,
        to,
        color: getUserColor(currentUser.id),
      });

      console.log("docId emitted to backend:", docId);
    };

    editor.on("selectionUpdate", handleSelectionUpdate);

    return () => {
      editor.off("selectionUpdate", handleSelectionUpdate);
    };
  }, [editor, currentUser, docId]); // ✅ make sure docId is here

  useEffect(() => {
    console.log("Current remoteCursors:", remoteCursors);
  }, [remoteCursors]);

  useEffect(() => {
    // if(!socket) return;
    const handleCursorUpdate = ({ userId, from, to, username, color }) => {
      console.log(`received cursor movement from ${username}`);

      setRemoteCursors((prev) => {
        const updated = {
          ...prev,
          [userId]: { from, to, username, color },
        };
        console.log("🧪 Setting remote cursors:", updated);
        return updated;
      });
    };

    console.log("rendered");
    socket.on("update-cursor", handleCursorUpdate);

    return () => {
      socket.off("update-cursor", handleCursorUpdate);
    };
  }, [socket]);

  // Join doc room on mount
  useEffect(() => {
    if (docId && currentUser?.id) {
      socket.emit("join-document", {
        docId,
        userId: currentUser.id,
        username: currentUser.username,
      });
    }
  }, [docId, currentUser]);

  useEffect(() => {
    if (!socket || !editor) return;

    const handler = (content) => {
      console.log("📥 Received changes from socket:", content);
      if (editor && !editor.isDestroyed) {
        const current = editor.getJSON();
        if (JSON.stringify(current) !== JSON.stringify(content)) {
          editor.commands.setContent(content, false); // don't reset history
          console.log("📥 Applied remote update");
        }
      }
    };

    socket.on("receive-changes", handler);
    return () => {
      socket.off("receive-changes", handler);
    };
  }, [socket, editor]);

  useEffect(() => {
    const fetchComments = async () => {
      const res = await fetch(`http://localhost:3000/api/comments/${docId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setAllComments(data);
    };
    console.log(docId);
    if (editor && docId) fetchComments();
  }, [editor, docId]);

  useEffect(() => {
    if (editor && content) {
      editor.commands.setContent(content);
    }
  }, [editor, content]);

  const [onlineUsers, setOnlineUsers] = useState([]);
  useEffect(() => {
    if (!socket) return;

    const handleUsersUpdate = (users) => {
      console.log("👥 Received document-users:", users);
      setOnlineUsers(users);
    };

    socket.on("document-users", handleUsersUpdate);

    return () => {
      socket.off("document-users", handleUsersUpdate); // Proper cleanup
    };
  }, [socket]);

  // socket.on("receive-changes", (newContent) => {
  //   console.log("📩 Received content from other user:", newContent);
  //   const currentContent = editor.getJSON();
  //   const currentStr = JSON.stringify(currentContent);
  //   const newStr = JSON.stringify(newContent);

  //   if (currentStr !== newStr) {
  //     editor.commands.setContent(newContent, false); // false = don't record in history
  //   }
  // });

  if (!editor) return null;

  const addComment = async () => {
    const selection = editor.state.selection;
    if (selection.empty) return alert("Please select text to comment on.");

    const commentText = prompt("Enter your comment");
    if (!commentText) return;

    const res = await fetch("http://localhost:3000/api/comments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        documentId: docId,
        comment: commentText,
        from: selection.from,
        to: selection.to,
      }),
    });

    const data = await res.json();
    const commentId = data.comment._id;

    editor
      .chain()
      .setTextSelection({ from: selection.from, to: selection.to })
      .setMark("comment", { id: commentId })
      .run();
  };

  return (
    <div className="border border-gray-300 rounded p-4 bg-white space-y-2 text-black min-h-[500px]">
      <MenuBar editor={editor} />

      {activeComment && (
        <div className="fixed right-4 top-20 bg-white shadow-lg rounded-lg p-4 w-80 border border-gray-300">
          <h2 className="font-bold text-lg mb-2">Comment</h2>
          <p className="text-gray-800">{activeComment.comment}</p>
          <button
            onClick={() => setActiveComment(null)}
            className="text-sm text-blue-500 underline mt-2"
          >
            Close
          </button>
        </div>
      )}

      <div className="border">
        <EditorContent editor={editor} />
      </div>

      <button
        className="bg-blue-500 text-white px-4 py-2 rounded mb-2"
        onClick={addComment}
      >
        Add Comment
      </button>

      <div className="p-2 border-b bg-blue-50 flex items-center gap-2">
        <span className="font-semibold text-gray-700">🟢 Online:</span>
        {onlineUsers.map((user) => (
          <span
            key={user.userId}
            className="bg-white px-2 py-1 text-sm rounded border text-gray-600"
          >
            {user.username}
          </span>
        ))}
      </div>

      <div className="absolute right-0 top-0 w-72 h-full bg-gray-50 shadow-lg border-l p-4 overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">Comments</h2>
        {allComments.length === 0 ? (
          <p className="text-sm text-gray-400">No comments yet.</p>
        ) : (
          allComments.map((comment) => (
            <div key={comment._id} className="mb-4 border-b pb-2">
              <p className="text-gray-800 text-sm">{comment.comment}</p>
              <p className="text-xs text-gray-500">
                Position: {comment.from} → {comment.to}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function MenuBar({ editor }) {
  if (!editor) return null;

  return (
    <div className="flex flex-wrap gap-8 justify-center mb-2">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className="font-bold btn border-2 p-2 rounded-xl bg-blue-300"
      >
        B
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className="font-style: italic btn border-2 p-2 rounded-xl bg-blue-300"
      >
        I
      </button>
      <button
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className="underline underline-offset-2 btn border-2 p-2 rounded-xl bg-blue-300"
      >
        U
      </button>
      <button
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
        className="font-bold btn border-2 p-2 rounded-xl bg-blue-300"
      >
        L
      </button>
      <button
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
        className="font-bold btn border-2 p-2 rounded-xl bg-blue-300"
      >
        C
      </button>
      <button
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
        className="font-bold btn border-2 p-2 rounded-xl bg-blue-300"
      >
        R
      </button>
      <button
        onClick={() => editor.chain().focus().undo().run()}
        className="font-bold btn border-2 p-2 rounded-xl bg-blue-300"
      >
        U
      </button>
    </div>
  );
}
