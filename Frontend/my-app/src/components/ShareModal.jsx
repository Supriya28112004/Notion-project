import React, { useState } from 'react';

export default function ShareModal({ documentId, onClose }) {
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState('view');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleShare = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token'); // Assuming you're storing JWT

      const res = await fetch(`http://localhost:3000/api/shares/${documentId}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email, permission }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to share');

      setMessage(data.message);
      setEmail('');
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-md text-black">
        <h2 className="text-xl font-semibold mb-4">Share Document</h2>

        <label className="block mb-2  text-sm font-medium">User Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border p-2 mb-4 rounded"
          placeholder="example@example.com"
        />

        <label className="block mb-2 text-sm font-medium">Permission</label>
        <select
          value={permission}
          onChange={(e) => setPermission(e.target.value)}
          className="w-full border p-2 mb-4 rounded"
        >
          <option value="view">View</option>
          <option value="edit">Edit</option>
        </select>

        {message && <p className="text-sm text-blue-700 mb-2">{message}</p>}

        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleShare}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            {loading ? 'Sharing...' : 'Share'}
          </button>
        </div>
      </div>
    </div>
  );
}
