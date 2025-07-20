import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const { logout } = useContext(AuthContext);
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleLogout = ()=>{
    logout();
    navigate("/auth");
  }

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/auth/profile", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Failed to fetch profile");
        }

        setUser(data.user); // assuming { user: { username, email, role } }
      } catch (err) {
        setError(err.message);
      }
    };

    if (token) fetchProfile();
    else setError("No token found. Please login.");
  }, [token]);

  const onHandleGet = () => {
    navigate("/sideBar");
  };

  const profileCardStyle = {
    background: "var(--bg-form)",
    color: "var(--text-primary)",
    borderColor: "var(--border-color)",
    backdropFilter: "blur(10px)",
  };

  if (error) {
    return (
      <div className="text-red-600 p-4 text-center">
        {error}. Please{" "}
        <a href="/login" className="underline text-blue-600">
          log in again
        </a>.
      </div>
    );
  }

  if (!user) return <div className="text-center mt-10">Loading profile...</div>;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div
        className="w-full max-w-md rounded-2xl shadow-lg p-8 text-center border"
        style={profileCardStyle}
      >
        <h1 className="text-4xl font-bold mb-4">Welcome, {user.username}</h1>
        <p className="text-lg mb-6" style={{ color: "var(--text-secondary)" }}>
          Email: {user.email}
        </p>
        <p className="text-md mb-4 font-semibold text-gray-500">
          Role: {user.role}
        </p>
        <button
          onClick={handleLogout}
          className="mt-4 bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors font-semibold"
        >
          Logout
        </button>
      </div>
      <button
        onClick={onHandleGet}
        className="mt-6 bg-green-600 text-white px-10 py-2 rounded-lg hover:bg-green-700 transition-colors font-semibold"
      >
        Get Started
      </button>
    </div>
  );
}
