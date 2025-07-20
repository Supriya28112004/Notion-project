import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDocuments } from '../context/DocumentContext';
// import TiptapEditor from './TiptapEditor';
import { FaFile, FaTrash, FaPlus, FaSpinner, FaFileAlt, FaFolderOpen } from 'react-icons/fa';

export default function DocumentsPage() {
  const { folderId, documentId } = useParams();
  // const navigate = useNavigate();
  const { documents, folders, addDocument, updateDocument, deleteDocument, loading } = useDocuments();

  // Find the current folder based on the folderId from the URL
  // Note: API IDs can be strings, so we compare them loosely or parse them
  const currentFolder = folders.find(f => f.id == folderId);

  // Filter documents to get only those belonging to the current folder
  const docsInFolder = documents.filter(d => d.folderId == folderId);

  // Find the currently active document based on the documentId from the URL
  const activeDocument = documents.find(d => d.id == documentId);

  // --- Handlers ---
  const handleAddDocument = () => {
     alert("Create button clicked");
  console.log("folderId:", folderId);
  // console.log("token exists:", !!token);
    // The addDocument function in the context will handle navigation
    // addDocument(folderId);
  };

  const handleDeleteDocument = (docId) => {
    // The deleteDocument function in the context will handle navigation
    deleteDocument(docId);
  };


  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <FaSpinner className="animate-spin text-white text-4xl" />
      </div>
    );
  }

  // 2. If the folderId from the URL is invalid, show an error message
  // This check runs after loading is complete
  if (!currentFolder) {
    return (
        <div className="text-center text-gray-400 mt-16">
            <FaFolderOpen className="mx-auto text-6xl mb-4" />
            <h2 className="text-2xl font-semibold text-white">Folder Not Found</h2>
            <p>The folder you are looking for does not exist.</p>
            <Link to="/folders" className="mt-4 inline-block bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700">
                Go to Folders
            </Link>
        </div>
    );
  }

  // 3. Render the main two-column layout
  return (
    <div className="flex h-[calc(100vh-150px)] gap-6 animate-fade-in">

      {/* Left Column: Document List */}
      <aside className="w-1/3 md:w-1/4 bg-gray-900 p-4 rounded-lg flex flex-col shadow-lg">
        <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white truncate" title={currentFolder.name}>
            {currentFolder.name}
          </h2>
          <button type="button"
            onClick={handleAddDocument}
            className="p-2 text-purple-300 hover:bg-purple-700 rounded-full transition"
            title="New Document"
          >add
            {/* <FaPlus className="text-white" /> */}
          </button>
        </div>
        <ul className="space-y-1 overflow-y-auto flex-1">
          {docsInFolder.length > 0 ? (
            docsInFolder.map(doc => (
              <li key={doc.id}>
                <Link
                  to={`/documents/${folderId}/${doc.id}`}
                  className={`flex justify-between items-center p-2 rounded cursor-pointer group transition ${
                    doc.id == documentId ? 'bg-purple-800 text-white' : 'text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  <span className="truncate">{doc.title || 'Untitled'}</span>
                  <button
                    onClick={(e) => {
                      e.preventDefault(); e.stopPropagation(); // Prevent link navigation
                      handleDeleteDocument(doc.id);
                    }}
                    className="p-1 text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete Document"
                  >
                    <FaTrash />
                  </button>
                </Link>
              </li>
            ))
          ) : (
            <div className="text-center text-gray-500 mt-8 px-2">
                <p>This folder is empty.</p>
            </div>
          )}
        </ul>
      </aside>

      {/* Right Column: Editor or Empty State */}
      <main className="flex-1 flex flex-col">
        {activeDocument ? (
          <div className="flex flex-col h-full gap-4">
            <input
              type="text"
              value={activeDocument.title}
              onChange={(e) => updateDocument(activeDocument.id, { title: e.target.value })}
              placeholder="Document Title"
              className="bg-transparent text-white text-4xl font-bold focus:outline-none border-b-2 border-transparent focus:border-purple-500 transition-all pb-2"
            />
            <TiptapEditor
              content={activeDocument.content}
              onUpdate={(newContent) => {
                // Check to prevent redundant updates if content is identical
                if (newContent !== activeDocument.content) {
                  updateDocument(activeDocument.id, { content: newContent });
                }
              }}
            />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-center text-gray-400 bg-gray-900 rounded-lg">
            <div>
              <FaFileAlt className="mx-auto text-6xl mb-4" />
              <h1 className="text-2xl font-semibold">Select a document</h1>
              <p>Choose a document from the list on the left, or create a new one.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}