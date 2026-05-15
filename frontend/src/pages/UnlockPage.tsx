import type { FormEvent } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

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
            setError("Mot de passe maître incorrect ou erreur de déchiffrement.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-3xl shadow-xl border border-slate-100">
                <div className="text-center">
                    <div className="mx-auto h-16 w-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900">Coffre Verrouillé</h2>
                    <p className="mt-2 text-slate-500">
                        Entrez votre mot de passe maître pour accéder à vos données.
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleUnlock}>
                    <div>
                        <input
                            type="password"
                            required
                            className="w-full px-4 py-4 rounded-2xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                            placeholder="Mot de passe maître"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    {error && (
                        <p className="text-red-500 text-sm text-center bg-red-50 py-2 rounded-xl border border-red-100">
                            {error}
                        </p>
                    )}

                    <div className="flex flex-col gap-3">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 px-4 border border-transparent rounded-2xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/50 transition-all font-semibold disabled:opacity-50"
                        >
                            {loading ? "Déverrouillage..." : "Déverrouiller le coffre"}
                        </button>
                        
                        <button
                            type="button"
                            onClick={logout}
                            className="w-full py-4 px-4 text-slate-500 hover:text-slate-800 transition-colors text-sm font-medium"
                        >
                            Se déconnecter (oublier cette session)
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
