import type { FormEvent } from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { motion } from "framer-motion";
import { Shield, Mail, Lock, LogIn, ArrowRight, RefreshCw, AlertCircle } from "lucide-react";

export default function LoginPage() {
    const { setAuth } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleLogin(e: FormEvent) {
        e.preventDefault();
        try {
            setLoading(true);
            setError("");
            const response = await api.post("/auth/login", { email, password });
            await setAuth(response.data.token, password, response.data.kdfSalt);
            navigate("/vault");
        } catch (err: any) {
            setError(err.response?.data?.message || "Identifiants incorrects ou erreur serveur.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full space-y-8"
            >
                <div className="text-center">
                    <div className="mx-auto h-16 w-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-200 mb-6">
                        <Shield className="w-8 h-8" />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900">Content de vous revoir</h2>
                    <p className="mt-2 text-slate-500 font-medium">
                        Connectez-vous pour déverrouiller votre coffre.
                    </p>
                </div>

                <div className="bg-white p-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100">
                    <form className="space-y-6" onSubmit={handleLogin}>
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-600 ml-1">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                                    <input
                                        type="email"
                                        required
                                        className="input-field pl-12"
                                        placeholder="votre@email.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-600 ml-1">Mot de passe maître</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                                    <input
                                        type="password"
                                        required
                                        className="input-field pl-12"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {error && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex items-center gap-3 text-red-600 text-sm bg-red-50 p-4 rounded-2xl border border-red-100"
                            >
                                <AlertCircle className="w-5 h-5 shrink-0" />
                                <p className="font-medium">{error}</p>
                            </motion.div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full py-4 flex items-center justify-center gap-2 group"
                        >
                            {loading ? (
                                <RefreshCw className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <LogIn className="w-5 h-5" />
                                    Connexion
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-slate-500 font-medium">
                            Nouveau ici ?{" "}
                            <Link to="/register" className="text-indigo-600 hover:text-indigo-700 font-bold underline decoration-indigo-200 underline-offset-4">
                                Créer un compte
                            </Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}