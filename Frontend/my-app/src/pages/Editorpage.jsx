import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import TiptapEditor from "../components/TiptapEditor";
import { Link } from "react-router-dom";
// import { AuthContext } from "../context/AuthContext";
import { Trash2, Share2, Save } from "lucide-react";
import ShareModal from "../components/ShareModal";

export default function EditorPage() {
  const { id } = useParams();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState([]);
  // const {token} = useContext(AuthContext);
  const token = localStorage.getItem("token");
  const [activeDocId, setActiveDocId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // const [hasInitializedContent, setHasInitializedContent] = useState(false);

  useEffect(() => {
    fetchDocs();
  }, []);

  const fetchDocs = async () => {
    try {
      const ownRes = await fetch(
        `http://localhost:3000/api/documents/user/me`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const ownDocs = await ownRes.json();

      // Fetch shared documents
      const sharedRes = await fetch(
        `http://localhost:3000/api/documents/shared/me`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const sharedData = await sharedRes.json();
      console;

      const sharedDocs = sharedData.map((entry) => ({
        ...entry.document,
        sharedPermission: entry.permission,
        sharedBy: entry.document?.owner?.username || "Unknown",
      }));

      // Combine both
      setDocuments([...ownDocs, ...sharedDocs]);
      // setDocuments(data);
    } catch (error) {
      console.error("❌ Error fetching doc:", error);
      alert("Failed to load document.");
    } finally {
      setLoading(false);
    }
  };

  const handleContentChange = (updatedContent) => {
    setContent(updatedContent);
  };

  const handleSave = async () => {
    try {
      const id = activeDocId;
      const endpoint = activeDocId
        ? `http://localhost:3000/api/documents/${id}`
        : `http://localhost:3000/api/documents`;

      const method = activeDocId ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // ensure your backend reads this
        },
        body: JSON.stringify({
          title,
          content,
          isPublic: false, // or true or make it a checkbox state
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");

      alert("✅ Document created!");
      // Reset title and content after successful save
      setTitle("");
      setContent({
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: "" }],
          },
        ],
      });

      fetchDocs();
    } catch (err) {
      console.error("❌ Save failed:", err);
      alert("Error saving document.");
    }
  };

  const handleClick = (doc) => {
    setActiveDocId(doc._id);
    setTitle(doc.title || "");
    setContent(
      doc.content || {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: "" }],
          },
        ],
      }
    );
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`http://localhost:3000/api/documents/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`, // ensure your backend reads this
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to delete");
      }

      alert("✅ Document deleted successfully");
      setActiveDocId(null);
      fetchDocs();
      setTitle("");
      setContent({
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: "" }],
          },
        ],
      });
    } catch (err) {
      console.error("❌ delete failed:", err);
      alert("Error deleting document.");
    }
  };

  if (loading) return <div className="text-center mt-10">Loading...</div>;

  return (
    <div className="flex">
      <div className="w-64 bg-gray-800 border">
        <div className="p-4 border-r overflow-y-auto">
          <h2 className="text-xl font-semibold mb-4">📁 My Documents</h2>
          <input
            type="text"
            placeholder="Search documents..."
            className="w-full p-2 mb-4 border rounded"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          {documents
            .filter((doc) =>
              doc.title?.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map((doc) => (
              <li key={doc._id} className="flex">
                <button
                  onClick={() => handleClick(doc)}
                  className={`w-full text-left block p-2 rounded hover:bg-blue-100 cursor-pointer ${
                    activeDocId === doc._id ? "bg-blue-200" : ""
                  }`}
                >
                  {doc.title || "Untitled"}
                </button>

                <button onClick={() => handleDelete(doc._id)}>
                  <Trash2 className="hover:text-red-500" />
                </button>
              </li>
            ))}
        </div>
      </div>
      <div className="py-4 px-8">
        <div className="flex gap-10 items-center">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Document Title"
            className="w-full text-2xl font-bold mb-4 border-b p-2"
          />

          <div className="flex items-center gap-6">
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-green-500 p-2 rounded"
            >
              <Share2 size={25} />
            </button>

            {isModalOpen && (
              <ShareModal
                documentId={activeDocId}
                onClose={() => setIsModalOpen(false)}
              />
            )}

            <button
              onClick={handleSave}
              className="px-4 bg-blue-500 text-white rounded h-10"
            >
              <Save />
            </button>
          </div>
        </div>

        <TiptapEditor
          content={content}
          onUpdate={handleContentChange}
          docId={activeDocId}
        />

        
      </div>
      
    </div>
  );
}
