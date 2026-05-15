import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import VaultPage from "./pages/VaultPage";
import UnlockPage from "./pages/UnlockPage";
import { AuthProvider, useAuth } from "./auth/AuthContext";

function AppRoutes() {
  const { isAuthenticated, isLocked } = useAuth();

  return (
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={!isAuthenticated ? <LoginPage /> : (isLocked ? <Navigate to="/unlock" /> : <Navigate to="/vault" />)} />
        <Route path="/register" element={!isAuthenticated ? <RegisterPage /> : (isLocked ? <Navigate to="/unlock" /> : <Navigate to="/vault" />)} />
        
        {/* Protected Routes */}
        <Route 
            path="/vault" 
            element={
                !isAuthenticated ? <Navigate to="/login" /> : 
                isLocked ? <Navigate to="/unlock" /> : 
                <VaultPage />
            } 
        />
        
        <Route 
            path="/unlock" 
            element={
                !isAuthenticated ? <Navigate to="/login" /> : 
                !isLocked ? <Navigate to="/vault" /> : 
                <UnlockPage />
            } 
        />

        {/* Fallback */}
        <Route path="/" element={<Navigate to="/vault" />} />
      </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}