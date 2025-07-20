import { createContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
// import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(null);
  // const navigate = useNavigate();
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        const decoded = jwtDecode(token);
        setCurrentUser(decoded);
      } catch (error) {
        console.error("Invalid token. Removing...", error);
        localStorage.removeItem("token");
        setCurrentUser(null);
      }
    }
  }, []);

  const login = (newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    try {
    const decoded = jwtDecode(newToken);
    setCurrentUser(decoded);
  } catch (error) {
    console.error("Invalid token during login");
    localStorage.removeItem("token");
    setCurrentUser(null);
  }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setCurrentUser(null);
    // navigate("/auth");
  };

  return (
    <AuthContext.Provider value={{ currentUser, logout, login,  token }}>
      {children}
    </AuthContext.Provider>
  );
};
