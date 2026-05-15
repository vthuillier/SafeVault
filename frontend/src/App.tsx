import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import VaultPage from "./pages/VaultPage";
import { AuthProvider, useAuth } from "./auth/AuthContext";

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
      <Routes>
        <Route path="/" element={<Navigate to={isAuthenticated ? "/vault" : "/login"} />} />
        <Route path="/login" element={isAuthenticated ? <Navigate to="/vault" /> : <LoginPage />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/vault" /> : <RegisterPage />} />
        <Route path="/vault" element={isAuthenticated ? <VaultPage /> : <Navigate to="/login" />} />
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