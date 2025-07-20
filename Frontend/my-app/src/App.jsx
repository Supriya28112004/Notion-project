// src/App.jsx


import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react"; // Added useContext import
import Profile from "./components/Profile";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import { AuthProvider, AuthContext } from "./context/AuthContext"; // Also import AuthContext
import AuthPage from "./components/AuthPage";
import { ThemeProvider } from "./context/ThemePage";
import SideBar from "./components/SideBar";
import Editorpage from "./pages/Editorpage";




function AppRoutes() {
  const { token } = useContext(AuthContext);

  console.log("token in app.jsx:", token);

  return (
    <>
     
      <main>
        <Routes>
         
          {/* <Route
            path="/"
            element={localStorage.getItem("token") ? <Profile /> : <AuthPage />}
          /> */}

          <Route path="/" element = {<AuthPage />} />

          
          <Route path="/auth" element={<AuthPage />} />
          <Route
            path="/sidebar"
            element={
              <ProtectedRoute>
                <SideBar />
              </ProtectedRoute>
            }
          />

         
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          
          {/* <Route path="/documents" element={<DocumentsPage />} /> */}
          <Route path="/new" element={<Editorpage />} />
          <Route path="/edit/:id" element={<Editorpage />} />

          <Route
            path="/editor"
            element={
              <div style={{ padding: "2rem" }}>
                <h1>My Tiptap Editor</h1>
                {/* <RichTextEditor /> */}
              </div>
            }
          />

          {/* Fallback Route: Redirect any unknown URL to the home page */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        {/* <DocumentProvider> */}
        <ThemeProvider>
          {/* We render the new AppRoutes component here */}
          <AppRoutes />
        </ThemeProvider>
        {/* </DocumentProvider> */}
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
