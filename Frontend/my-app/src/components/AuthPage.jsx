import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
// import { useTheme } from '../context/ThemePage';
import {
  FaEnvelope,
  FaLock,
  FaUser,
  FaUserCog,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  // State for showing the Terms and Conditions modal
  const [showTerms, setShowTerms] = useState(false);

  // State for password visibility toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // A single state object to hold all form data
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmpassword: "",
    acceptTerms: false,
    role: "viewer",
  });

  const token = localStorage.getItem("token");
  // console.log("token in auth:", token);
  if(token){
    navigate("/profile")
  }

  // A single handler for all form inputs
  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // The main function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // --- Client-side validation for the Sign Up form ---
    if (isSignUp) {
      if (form.password !== form.confirmpassword) {
        alert("Passwords do not match!");
        return;
      }
      if (!form.acceptTerms) {
        alert("You must accept the Terms and Conditions to sign up.");
        return;
      }
    }

    const endpoint = isSignUp ? "signup" : "login";

    // --- The API Payload ---
    // This object's keys MUST match what the backend validation schema expects.
    const payload = isSignUp
      ? {
          username: form.username,
          email: form.email,
          password: form.password,
          confirmpassword: form.confirmpassword,
          role: form.role,
          acceptterms: form.acceptTerms, // Backend expects 'acceptterms' (lowercase) to be true
        }
      : { email: form.email, password: form.password };

    try {
      console.log("Payload being sent:", payload);

      const res = await fetch(`http://localhost:3000/api/auth/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      let data;
      try {
        data = await res.json(); // This might throw if response is not JSON
      } catch (error) {
        throw new Error("Invalid JSON response from server", error);
      }

      if (data.success) {
        if (isSignUp) {
          alert("Signup successful! Please sign in.");
          setIsSignUp(false); // Switch to the sign-in tab
          // Fully reset the form for the next user
          setForm({
            username: "",
            email: "",
            password: "",
            confirmpassword: "",
            acceptTerms: false,
            role: "viewer",
          });
        } else {
          login(data.token);
          navigate("/profile");
        }
      } else {
        // If the backend sends a complex error object, format it for the alert.
        const errorMessage =
          typeof data.message === "string"
            ? data.message
            : JSON.stringify(data.message, null, 2); // Pretty-print JSON errors
        alert(errorMessage);
      }
    } catch (error) {
      alert(
        `A network error occurred. Please ensure the server is running and try again.\n\n${error.message}`
      );
    }
  };
  //
  // --- Dynamic styles for theming ---
  const formStyle = {
    background: "var(--bg-form)",
    color: "var(--text-primary)",
    borderColor: "var(--border-color)",
    backdropFilter: "blur(10px)",
  };
  const inputStyle = {
    background: "var(--bg-input)",
    borderColor: "var(--border-color)",
    color: "var(--text-primary)",
  };
  const toggleStyle = { background: "var(--bg-input)" };
  const activeToggleStyle = {
    background: "var(--toggle-active-bg)",
    color: "var(--toggle-active-text)",
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center p-4">
        <div
          className="w-full max-w-md rounded-2xl shadow-lg p-8 border"
          style={formStyle}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 w-16 h-16 flex items-center justify-center bg-purple-500 rounded-full text-white">
              <FaLock size={30} />
            </div>
            <h2 className="text-3xl font-bold mb-2">
              {isSignUp ? "Create Account" : "Welcome Back"}
            </h2>
            <p style={{ color: "var(--text-secondary)" }}>
              {isSignUp
                ? "Get started with a new account"
                : "Sign in to your account"}
            </p>
          </div>

          {/* Sign In / Sign Up Toggles */}
          <div className="flex rounded-lg p-1 mb-6" style={toggleStyle}>
            <button
              onClick={() => setIsSignUp(false)}
              className="w-1/2 py-2 rounded-md transition-colors font-semibold"
              style={!isSignUp ? activeToggleStyle : {}}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsSignUp(true)}
              className="w-1/2 py-2 rounded-md transition-colors font-semibold"
              style={isSignUp ? activeToggleStyle : {}}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* --- Sign-Up Only Fields --- */}
            {isSignUp && (
              <>
                <div>
                  <label
                    className="block mb-1 text-sm font-medium"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Username
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="username"
                      value={form.username}
                      onChange={handleChange}
                      placeholder="Enter your username"
                      className="w-full p-3 pl-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      style={inputStyle}
                      required
                    />
                    <FaUser
                      style={{ color: "var(--icon-color)" }}
                      className="absolute right-4 top-1/2 -translate-y-1/2"
                    />
                  </div>
                </div>
              </>
            )}

            {/* --- Common Fields --- */}
            <div>
              <label
                className="block mb-1 text-sm font-medium"
                style={{ color: "var(--text-secondary)" }}
              >
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className="w-full p-3 pl-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  style={inputStyle}
                  required
                />
                <FaEnvelope
                  style={{ color: "var(--icon-color)" }}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                />
              </div>
            </div>

            <div>
              <label
                className="block mb-1 text-sm font-medium"
                style={{ color: "var(--text-secondary)" }}
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="w-full p-3 pl-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  style={inputStyle}
                  required
                />
                <div
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <FaEyeSlash style={{ color: "var(--icon-color)" }} />
                  ) : (
                    <FaEye style={{ color: "var(--icon-color)" }} />
                  )}
                </div>
              </div>
            </div>

            {/* --- More Sign-Up Only Fields --- */}
            {isSignUp && (
              <>
                <div>
                  <label
                    className="block mb-1 text-sm font-medium"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmpassword"
                      value={form.confirmpassword}
                      onChange={handleChange}
                      placeholder="Confirm your password"
                      className="w-full p-3 pl-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      style={inputStyle}
                      required
                    />
                    <div
                      className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? (
                        <FaEyeSlash style={{ color: "var(--icon-color)" }} />
                      ) : (
                        <FaEye style={{ color: "var(--icon-color)" }} />
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="role"
                    className="block mb-1 text-sm font-medium"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Role
                  </label>
                  <div className="relative">
                    <select
                      name="role"
                      id="role"
                      value={form.role}
                      onChange={handleChange}
                      className="w-full p-3 pl-4 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none"
                      style={inputStyle}
                      required
                    >
                      <option value="viewer">Viewer</option>
                      <option value="editor">Editor</option>
                      <option value="admin">Admin</option>
                    </select>
                    <FaUserCog
                      style={{ color: "var(--icon-color)" }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"
                    />
                  </div>
                </div>

                <div className="flex items-start text-sm">
                  <input
                    type="checkbox"
                    name="acceptTerms"
                    id="acceptTerms"
                    checked={form.acceptTerms}
                    onChange={handleChange}
                    className="mr-2 mt-1 h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    style={inputStyle}
                    required
                  />
                  <label
                    htmlFor="acceptTerms"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    I accept the{" "}
                    <button
                      type="button"
                      className="text-purple-400 hover:underline font-semibold"
                      onClick={() => setShowTerms(true)}
                    >
                      Terms and Conditions
                    </button>
                  </label>
                </div>
              </>
            )}

            <button
              type="submit"
              className="w-full py-3 mt-4 rounded-lg bg-gradient-to-r from-pink-600 to-purple-600 hover:opacity-90 transition-opacity font-semibold text-lg text-white"
            >
              {isSignUp ? "Sign Up" : "Sign In"}
            </button>
          </form>
        </div>
      </div>

      {/* --- Terms and Conditions Modal --- */}
      {showTerms && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm">
          <div
            className="w-full max-w-lg p-6 rounded-lg shadow-xl border m-4"
            style={formStyle}
          >
            <h3 className="text-xl font-semibold mb-4">Terms and Conditions</h3>
            <ul
              className="space-y-3 list-disc list-inside"
              style={{ color: "var(--text-secondary)" }}
            >
              <li>
                You may need to create an account to access certain features of
                the app.
              </li>
              <li>
                You're responsible for maintaining the confidentiality of your
                account information.
              </li>
              <li>
                You agree not to misuse the service or create unauthorized
                accounts.
              </li>
            </ul>
            <button
              onClick={() => setShowTerms(false)}
              className="mt-6 bg-purple-600 text-white px-5 py-2 rounded-lg hover:bg-purple-700 font-semibold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
