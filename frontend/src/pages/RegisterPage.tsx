import type { FormEvent } from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { generateSalt, uint8ArrayToBase64 } from "../crypto/crypto";

export default function RegisterPage() {
    const navigate = useNavigate();
    const { setAuth } = useAuth();

    const [email, setEmail] = useState("test@test.com");
    const [password, setPassword] = useState("password123");
    const [error, setError] = useState("");

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();
        setError("");

        try {
            const salt = generateSalt();
            const saltBase64 = uint8ArrayToBase64(salt);

            const response = await api.post("/auth/register", {
                email,
                password,
                kdfSalt: saltBase64
            });

            await setAuth(response.data.token, password, saltBase64);

            navigate("/vault");
        } catch (err) {
            console.error(err);
            setError("Impossible de créer le compte.");
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-sm bg-white rounded-2xl shadow p-6 space-y-4"
            >
                <div>
                    <h1 className="text-2xl font-bold">Créer un compte</h1>
                    <p className="text-sm text-zinc-500">
                        Ton coffre sera chiffré côté navigateur.
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
                    Créer le compte
                </button>

                <p className="text-sm text-center">
                    Déjà un compte ?{" "}
                    <Link className="underline" to="/login">
                        Se connecter
                    </Link>
                </p>
            </form>
        </div>
    );
}