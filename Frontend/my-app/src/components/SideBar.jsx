import { useState, useContext } from "react";
import { FaHome, FaSearch, FaFolder, FaBars, FaTimes } from "react-icons/fa"; // Added FaTimes for the close icon
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { jwtDecode } from "jwt-decode";
import { User, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
// import { useContext } from "react";
// import { AuthContext } from "../context/AuthContext";
import { useTheme } from "../context/ThemePage";
import { FaSun, FaMoon, FaUserCircle } from "react-icons/fa";

export default function Sidebar() {
  // This state now controls the slidebar's visibility. It starts closed.
  const [isOpen, setIsOpen] = useState(false);
  // const { token, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const { token, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useTheme();

  let username = "User";
  try {
    if (token) {
      const decoded = jwtDecode(token);
      username = decoded.username || "User";
    }
  } catch (err) {
    console.error("Invalid token:", err.message);
  }

 
  const navItems = [
    { name: "DashBoard", icon: <FaHome />, path: "/home" },
    // { name: "Search", icon: <FaSearch />, path: "/search" },
    { name: "Folders", icon: <FaFolder />, path: "/new" },
  ];

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  return (
    <>
      <button
        className="fixed top-4 left-4 z-50 text-white bg-purple-900 p-3 rounded-full shadow-lg hover:bg-purple-700 transition-all"
        onClick={() => setIsOpen(true)}
      >
        <FaBars />
      </button>
      <div className="flex-1 fixed top-4 right-10">
        <button
          onClick={toggleTheme}
          className="bg-[var(--bg-button-nav)] border border-[var(--border-color)] p-2 rounded-lg hover:bg-[var(--bg-button-nav-hover)] transition-colors"
        >
          {theme === "light" ? <FaMoon /> : <FaSun />}
        </button>
      </div>

      {/* 2. THE SLIDING PANEL ITSELF */}
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-purple-900 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center text-white text-2xl font-bold p-6 border-b border-purple-800">
          <span>Hello, {username}</span>
          {/* Added a close button inside the panel */}
          <button
            onClick={() => setIsOpen(false)}
            className="hover:text-purple-300"
          >
            <FaTimes />
          </button>
        </div>
        <ul className="flex flex-col gap-2 mt-4 px-4 text-white">
          {navItems.map((item) => (
            <li key={item.name}>
              <Link
                to={item.path}
                onClick={() => setIsOpen(false)} // Close sidebar when a link is clicked
                className={`flex items-center gap-4 p-3 rounded-lg transition-all ${
                  location.pathname.startsWith(item.path)
                    ? "bg-purple-700 font-semibold"
                    : "hover:bg-purple-800"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="text-md font-semibold">{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-auto px-4 py-6 text-white border-t border-purple-800">
          <ul className="flex flex-col gap-2">
            <li className="flex gap-2 items-center">
              <LogOut size={20} />
              <button className="hover:text-red-400" onClick={handleLogout}>
                Logout
              </button>
            </li>
          </ul>
        </div>
      </div>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
        <h1 className="text-5xl font-bold text-white mb-4">
          Welcome to Notion!!
          <span role="img" aria-label="waving hand">
            👋
          </span>
        </h1>
      </div>
    </>
  );
}
