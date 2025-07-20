import { Link } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useTheme } from "../context/ThemePage";
import { FaSun, FaMoon, FaUserCircle } from "react-icons/fa";

export default function Navbar() {
  const { token, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="absolute top-0 right-0 w-full p-4 flex items-center z-10 text-[var(--text-primary)]">
      {/* Left side: Theme Switcher */}
      <div className="flex-1">
        <button
          onClick={toggleTheme}
          className="bg-[var(--bg-button-nav)] border border-[var(--border-color)] p-2 rounded-lg hover:bg-[var(--bg-button-nav-hover)] transition-colors"
        >
          {theme === 'light' ? <FaMoon /> : <FaSun />}
        </button>
      </div>

      {/* Centered Title */}
      <div className="flex-1 text-center">
        <Link to={token ? "/profile" : "/auth"} className="text-2xl font-bold">
          Notion
        </Link>
      </div>

      {/* Right side: Auth buttons */}
      <div className="flex-1 flex justify-end items-center gap-4">
        {token ? (
          <>
            <Link to="/profile">
              <button className="bg-[var(--bg-button-nav)] border border-[var(--border-color)] px-4 py-2 rounded-lg hover:bg-[var(--bg-button-nav-hover)] font-semibold transition-colors flex items-center gap-2">
                <FaUserCircle />
                Profile
              </button>
            </Link>
            <button
              onClick={logout}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 font-semibold transition-colors"
            >
              Logout
            </button>
          </>
        ) : (
          <Link to="/auth">
            <button className="bg-[var(--bg-button-nav)] border border-[var(--border-color)] px-4 py-2 rounded-lg hover:bg-[var(--bg-button-nav-hover)] font-semibold transition-colors">
              Login / Signup
            </button>
          </Link>
        )}
      </div>
    </nav>
  );
}