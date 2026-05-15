import type { FormEvent } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { motion } from "framer-motion";
import { Shield, Lock, ArrowRight, RefreshCw, AlertCircle, LogOut } from "lucide-react";

export default function UnlockPage() {
    const { salt, unlock, logout } = useAuth();
    const navigate = useNavigate();

    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleUnlock(e: FormEvent) {
        e.preventDefault();
        if (!salt) {
            logout();
            return;
        }

        try {
            setLoading(true);
            setError("");
            await unlock(password, salt);
            navigate("/vault");
        } catch (err) {
            setError("Mot de passe maître incorrect.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full space-y-8"
            >
                <div className="text-center">
                    <div className="mx-auto h-20 w-20 bg-indigo-100 text-indigo-600 rounded-3xl flex items-center justify-center shadow-inner mb-6">
                        <Lock className="w-10 h-10" />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900">Session Verrouillée</h2>
                    <p className="mt-2 text-slate-500 font-medium">
                        Entrez votre mot de passe pour déchiffrer votre coffre.
                    </p>
                </div>

                <div className="bg-white p-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100">
                    <form className="space-y-6" onSubmit={handleUnlock}>
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-600 ml-1">Mot de passe maître</label>
                            <input
                                type="password"
                                required
                                autoFocus
                                className="input-field text-center text-2xl tracking-[0.5em]"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        {error && (
                            <motion.div 
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center gap-3 text-red-600 text-sm bg-red-50 p-4 rounded-2xl border border-red-100"
                            >
                                <AlertCircle className="w-5 h-5 shrink-0" />
                                <p className="font-medium">{error}</p>
                            </motion.div>
                        )}

                        <div className="flex flex-col gap-3">
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary w-full py-4 flex items-center justify-center gap-2 group"
                            >
                                {loading ? (
                                    <RefreshCw className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        Déverrouiller
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                            
                            <button
                                type="button"
                                onClick={logout}
                                className="flex items-center justify-center gap-2 py-3 text-slate-400 hover:text-red-500 transition-colors text-sm font-bold"
                            >
                                <LogOut className="w-4 h-4" />
                                Se déconnecter
                            </button>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
}
