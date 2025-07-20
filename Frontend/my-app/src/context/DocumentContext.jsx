
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';

const DocumentContext = createContext();

const API_URL = 'http://localhost:3000/api';

export const DocumentProvider = ({ children }) => {
  const [folders, setFolders] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const authHeader = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };

        const [foldersRes, documentsRes] = await Promise.all([
          fetch(`${API_URL}/folders`, { headers: authHeader }),
          fetch(`${API_URL}/documents`, { headers: authHeader })
        ]);

        if (!foldersRes.ok || !documentsRes.ok) {
          throw new Error('Unauthorized or failed to fetch data');
        }

        const foldersData = await foldersRes.json();
        const documentsData = await documentsRes.json();
        
        setFolders(foldersData.map(f => ({ ...f, id: f._id || f.id })));
        setDocuments(documentsData.map(d => ({ ...d, id: d._id || d.id })));

      } catch (error) {
        console.error("Failed to fetch initial data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [token]);

  const addFolder = async (name) => {
    try {
      const res = await fetch(`${API_URL}/folders`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`, 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ name }),
      });
      
      if (!res.ok) {
        throw new Error(`Failed to create folder: ${res.status}`);
      }
      
      const newFolder = await res.json();
      setFolders(prev => [...prev, { ...newFolder, id: newFolder._id || newFolder.id }]);
      return newFolder;
    } catch (error) {
      console.error("Error creating folder:", error);
      throw error;
    }
  };

  const deleteFolder = async (folderId) => {
    try {
      const res = await fetch(`${API_URL}/folders/${folderId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!res.ok) {
        throw new Error(`Failed to delete folder: ${res.status}`);
      }
      
      setFolders(prev => prev.filter(f => f.id !== folderId));
      setDocuments(prev => prev.filter(d => d.folderId !== folderId)); // Fixed: was d.id !== folderId
      navigate('/folders');
    } catch (error) {
      console.error("Error deleting folder:", error);
      throw error;
    }
  };

  const addDocument = async (folderId) => {
    if (!token) {
      console.error("No token found. Cannot create document.");
      return;
    }
    
    try {
      console.log("Creating document for folder:", folderId); // Debug log
      
      const res = await fetch(`${API_URL}/documents`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`, 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ 
          folderId, 
          title: 'Untitled', 
          content: '' 
        }),
      });
       const newDoc = await res.json();
      if (!res.ok) {
        const errorText = await res.text();
        console.error("API Error:", res.status, errorText);
         throw new Error(newDoc.message);
       // throw new Error(`Failed to create document: ${res.status} - ${errorText}`);
      }
      
     // const newDoc = await res.json();
      console.log("Created document:", newDoc); // Debug log
      
      const newDocWithId = { ...newDoc, id: newDoc._id || newDoc.id };
      setDocuments(prev => [...prev, newDocWithId]);
      navigate(`/documents/${folderId}/${newDocWithId.id}`);
      
      return newDocWithId;
    } catch (error) {
      console.error("Error creating document:", error);
      throw error;
    }
  };
  
  const updateDocument = async (docId, updatedFields) => {
    try {
      // Optimistically update the UI
      setDocuments(prev => prev.map(doc => 
        doc.id === docId ? { ...doc, ...updatedFields } : doc
      ));
      
      const res = await fetch(`${API_URL}/documents/${docId}`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`, 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(updatedFields),
      });
      
      if (!res.ok) {
        throw new Error(`Failed to update document: ${res.status}`);
      }
    } catch (error) {
      console.error("Error updating document:", error);
      // Revert the optimistic update on error
      // You might want to fetch the document again or show an error message
    }
  };

  const deleteDocument = async (docId) => {
    const docToDelete = documents.find(d => d.id === docId);
    if (!docToDelete) return;
    
    try {
      const res = await fetch(`${API_URL}/documents/${docId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!res.ok) {
        throw new Error(`Failed to delete document: ${res.status}`);
      }
      
      setDocuments(prev => prev.filter(d => d.id !== docId));
      navigate(`/documents/${docToDelete.folderId}`);
    } catch (error) {
      console.error("Error deleting document:", error);
      throw error;
    }
  };
  
  const value = { 
    folders, 
    documents, 
    loading, 
    addFolder, 
    deleteFolder, 
    addDocument, 
    updateDocument, 
    deleteDocument 
  };

  return (
    <DocumentContext.Provider value={value}>
      {children}
    </DocumentContext.Provider>
  );
};

export const useDocuments = () => useContext(DocumentContext);