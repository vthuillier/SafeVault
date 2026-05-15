import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { api } from "../api/client";
import { encryptText, decryptText, generatePassword } from "../crypto/crypto";
import type { VaultItem } from "../types/vault";

type DecryptedItem = {
    id: string;
    name: string;
    username: string;
    password: string;
    url: string;
    notes: string;
};

export default function VaultPage() {
    const { derivedKey, logout } = useAuth();

    const [items, setItems] = useState<DecryptedItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const [name, setName] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [url, setUrl] = useState("");
    const [notes, setNotes] = useState("");

    useEffect(() => {
        if (derivedKey) {
            loadItems();
        }
    }, [derivedKey]);

    async function loadItems() {
        if (!derivedKey) return;

        try {
            setLoading(true);

            const response = await api.get<VaultItem[]>("/vault/items");

            const decrypted = await Promise.all(
                response.data.map(async (item) => ({
                    id: item.id,
                    name: await decryptText(item.encryptedName, item.nonce, derivedKey),
                    username: item.encryptedUsername
                        ? await decryptText(item.encryptedUsername, item.nonce, derivedKey)
                        : "",
                    password: item.encryptedPassword
                        ? await decryptText(item.encryptedPassword, item.nonce, derivedKey)
                        : "",
                    url: item.encryptedUrl
                        ? await decryptText(item.encryptedUrl, item.nonce, derivedKey)
                        : "",
                    notes: item.encryptedNotes
                        ? await decryptText(item.encryptedNotes, item.nonce, derivedKey)
                        : "",
                }))
            );

            setItems(decrypted);
        } catch (err) {
            console.error("Failed to load items:", err);
        } finally {
            setLoading(false);
        }
    }

    async function handleCreate(event: FormEvent) {
        event.preventDefault();
        if (!derivedKey) return;

        try {
            const encryptedName = await encryptText(name, derivedKey);
            const encryptedUsername = await encryptText(username, derivedKey);
            const encryptedPassword = await encryptText(password, derivedKey);
            const encryptedUrl = await encryptText(url, derivedKey);
            const encryptedNotes = await encryptText(notes, derivedKey);

            await api.post("/vault/items", {
                encryptedName: encryptedName.ciphertext,
                encryptedUsername: encryptedUsername.ciphertext,
                encryptedPassword: encryptedPassword.ciphertext,
                encryptedUrl: encryptedUrl.ciphertext,
                encryptedNotes: encryptedNotes.ciphertext,
                nonce: encryptedName.iv,
            });

            setName("");
            setUsername("");
            setPassword("");
            setUrl("");
            setNotes("");

            await loadItems();
        } catch (err) {
            console.error("Failed to create item:", err);
        }
    }

    async function handleDelete(id: string) {
        await api.delete(`/vault/items/${id}`);
        await loadItems();
    }

    const filteredItems = items.filter(item => 
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.username.toLowerCase().includes(search.toLowerCase()) ||
        item.url.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen px-6 py-8">
            <div className="max-w-5xl mx-auto space-y-6">
                <header className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold">SafeVault</h1>
                        <p className="text-zinc-500">Ton coffre-fort hautement sécurisé</p>
                    </div>

                    <button
                        onClick={logout}
                        className="border rounded-xl px-4 py-2 bg-white hover:bg-zinc-50 transition-colors"
                    >
                        Déconnexion
                    </button>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <form
                        onSubmit={handleCreate}
                        className="bg-white rounded-2xl shadow-sm border p-6 space-y-4 h-fit"
                    >
                        <h2 className="text-xl font-semibold">Ajouter</h2>

                        <input
                            className="w-full border rounded-xl p-3"
                            placeholder="Nom (ex: Gmail)"
                            value={name}
                            required
                            onChange={(e) => setName(e.target.value)}
                        />

                        <input
                            className="w-full border rounded-xl p-3"
                            placeholder="Identifiant"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />

                        <div className="relative">
                            <input
                                className="w-full border rounded-xl p-3 pr-24"
                                placeholder="Mot de passe"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={() => setPassword(generatePassword())}
                                className="absolute right-2 top-2 bottom-2 px-3 bg-zinc-100 rounded-lg text-xs font-medium hover:bg-zinc-200"
                            >
                                Générer
                            </button>
                        </div>

                        <input
                            className="w-full border rounded-xl p-3"
                            placeholder="URL"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                        />

                        <textarea
                            className="w-full border rounded-xl p-3"
                            placeholder="Notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />

                        <button className="w-full bg-black text-white rounded-xl p-3 hover:bg-zinc-800 transition-colors">
                            Ajouter au coffre
                        </button>
                    </form>

                    <section className="md:col-span-2 space-y-4">
                        <div className="flex gap-3">
                            <input 
                                className="flex-1 border rounded-xl p-3 bg-white"
                                placeholder="Rechercher un identifiant..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        <div className="grid gap-3">
                            {loading ? (
                                <p className="text-center py-8 text-zinc-500">Chargement du coffre...</p>
                            ) : filteredItems.length === 0 ? (
                                <div className="bg-white rounded-2xl border p-8 text-center">
                                    <p className="text-zinc-500">
                                        {search ? "Aucun résultat pour cette recherche." : "Votre coffre est vide."}
                                    </p>
                                </div>
                            ) : (
                                filteredItems.map((item) => (
                                    <div
                                        key={item.id}
                                        className="bg-white border rounded-2xl p-5 flex justify-between items-start group hover:shadow-md transition-shadow"
                                    >
                                        <div className="space-y-1">
                                            <h3 className="font-bold text-lg">{item.name}</h3>
                                            <p className="text-sm text-zinc-600">{item.username}</p>
                                            {item.url && (
                                                <a 
                                                    href={item.url} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="text-sm text-blue-600 hover:underline block"
                                                >
                                                    {item.url}
                                                </a>
                                            )}
                                            <div className="mt-3 p-3 bg-zinc-50 rounded-xl border border-zinc-100 flex items-center justify-between gap-4">
                                                <code className="text-sm font-mono">{item.password || "••••••••"}</code>
                                                <button 
                                                    onClick={() => navigator.clipboard.writeText(item.password)}
                                                    className="text-xs text-zinc-500 hover:text-black"
                                                >
                                                    Copier
                                                </button>
                                            </div>
                                            {item.notes && (
                                                <p className="text-xs text-zinc-400 mt-3 italic">{item.notes}</p>
                                            )}
                                        </div>

                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="text-zinc-300 hover:text-red-600 p-2 transition-colors"
                                            title="Supprimer"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}