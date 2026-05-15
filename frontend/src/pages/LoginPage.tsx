import type { FormEvent } from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../auth/AuthContext";

export default function LoginPage() {
    const navigate = useNavigate();
    const { setAuth } = useAuth();

    const [email, setEmail] = useState("test@test.com");
    const [password, setPassword] = useState("password123");
    const [error, setError] = useState("");

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();
        setError("");

        try {
            const response = await api.post("/auth/login", {
                email,
                password,
            });

            await setAuth(response.data.token, password, response.data.kdfSalt);

            navigate("/vault");
        } catch(error: any) {
            console.error("Login error:", error);
            setError("Identifiants invalides.");
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-sm bg-white rounded-2xl shadow p-6 space-y-4"
            >
                <div>
                    <h1 className="text-2xl font-bold">SafeVault</h1>
                    <p className="text-sm text-zinc-500">
                        Connecte-toi à ton coffre-fort.
                    </p>
                </div>

                {error && <p className="text-sm text-red-600">{error}</p>}

                <input
                    className="w-full border rounded-xl p-3"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <input
                    className="w-full border rounded-xl p-3"
                    placeholder="Mot de passe maître"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button className="w-full bg-black text-white rounded-xl p-3">
                    Connexion
                </button>

                <p className="text-sm text-center">
                    Pas encore de compte ?{" "}
                    <Link className="underline" to="/register">
                        Créer un compte
                    </Link>
                </p>
            </form>
        </div>
    );
}