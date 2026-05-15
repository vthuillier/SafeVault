import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { api } from "../api/client";
import { encryptText, decryptText, generatePassword } from "../crypto/crypto";
import type { VaultItem } from "../types/vault";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Plus, 
    Search, 
    LogOut, 
    Copy, 
    Check, 
    Trash2, 
    ExternalLink, 
    Eye, 
    EyeOff, 
    Key,
    Shield,
    RefreshCw,
    User as UserIcon,
    Globe,
    FileText
} from "lucide-react";

type DecryptedItem = {
    id: string;
    name: string;
    username: string;
    password: string;
    url: string;
    notes: string;
};

const Favicon = ({ url }: { url: string }) => {
    const [error, setError] = useState(false);
    
    const getFaviconUrl = (u: string) => {
        try {
            const domain = new URL(u).hostname;
            return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
        } catch {
            return null;
        }
    };

    const favicon = getFaviconUrl(url);

    if (error || !favicon) {
        return <Globe className="w-6 h-6 text-slate-400 group-hover:text-indigo-500 transition-colors" />;
    }

    return (
        <img 
            src={favicon} 
            alt="" 
            className="w-8 h-8 object-contain"
            onError={() => setError(true)}
        />
    );
};

export default function VaultPage() {
    const { derivedKey, logout } = useAuth();

    const [items, setItems] = useState<DecryptedItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [search, setSearch] = useState("");
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

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
            setSaving(true);
            const iv = crypto.getRandomValues(new Uint8Array(12));
            
            const encryptedName = await encryptText(name, derivedKey, iv);
            const encryptedUsername = await encryptText(username, derivedKey, iv);
            const encryptedPassword = await encryptText(password, derivedKey, iv);
            const encryptedUrl = await encryptText(url, derivedKey, iv);
            const encryptedNotes = await encryptText(notes, derivedKey, iv);

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
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Supprimer cet identifiant ?")) return;
        try {
            await api.delete(`/vault/items/${id}`);
            await loadItems();
        } catch (err) {
            console.error(err);
        }
    }

    const handleCopy = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const togglePasswordVisibility = (id: string) => {
        setVisiblePasswords(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const filteredItems = items.filter(item => 
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.username.toLowerCase().includes(search.toLowerCase()) ||
        item.url.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-50/50">
            {/* Header / Navbar */}
            <header className="sticky top-0 z-30 w-full border-b bg-white/80 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="bg-indigo-600 p-1.5 rounded-lg shadow-lg shadow-indigo-200">
                            <Shield className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-indigo-400">
                            SafeVault
                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={logout}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            Déconnexion
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* Sidebar / Add Form */}
                    <aside className="lg:col-span-4 space-y-6">
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass-card rounded-3xl p-6"
                        >
                            <div className="flex items-center gap-2 mb-6">
                                <Plus className="w-5 h-5 text-indigo-600" />
                                <h2 className="text-lg font-bold text-slate-800">Ajouter un identifiant</h2>
                            </div>

                            <form onSubmit={handleCreate} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-slate-600 ml-1">Nom</label>
                                    <input
                                        className="input-field"
                                        placeholder="ex: Gmail, GitHub..."
                                        value={name}
                                        required
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-slate-600 ml-1">Identifiant</label>
                                    <div className="relative">
                                        <UserIcon className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
                                        <input
                                            className="input-field pl-11"
                                            placeholder="Email ou nom d'utilisateur"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-slate-600 ml-1">Mot de passe maître</label>
                                    <div className="relative">
                                        <Key className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
                                        <input
                                            className="input-field pl-11 pr-24"
                                            placeholder="••••••••"
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setPassword(generatePassword())}
                                            className="absolute right-2 top-2 bottom-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-all"
                                        >
                                            <RefreshCw className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-slate-600 ml-1">URL</label>
                                    <div className="relative">
                                        <Globe className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
                                        <input
                                            className="input-field pl-11"
                                            placeholder="https://..."
                                            value={url}
                                            onChange={(e) => setUrl(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-slate-600 ml-1">Notes</label>
                                    <div className="relative">
                                        <FileText className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
                                        <textarea
                                            className="input-field pl-11 min-h-[100px] resize-none"
                                            placeholder="Notes additionnelles..."
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <button 
                                    disabled={saving || !name}
                                    className="btn-primary w-full mt-4 flex items-center justify-center gap-2"
                                >
                                    {saving ? (
                                        <RefreshCw className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            <Plus className="w-5 h-5" />
                                            Ajouter au coffre
                                        </>
                                    )}
                                </button>
                            </form>
                        </motion.div>
                    </aside>

                    {/* Main Content / Items List */}
                    <div className="lg:col-span-8 space-y-6">
                        
                        {/* Search Bar */}
                        <div className="relative group">
                            <Search className="absolute left-5 top-4.5 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                            <input 
                                className="w-full bg-white border border-slate-200 rounded-3xl py-4 pl-14 pr-6 text-lg shadow-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                                placeholder="Rechercher par nom, site ou identifiant..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        {/* List */}
                        <div className="space-y-4">
                            {loading ? (
                                // Skeleton Loaders
                                [1, 2, 3].map(i => (
                                    <div key={i} className="h-32 rounded-3xl animate-shimmer" />
                                ))
                            ) : (
                                <AnimatePresence mode="popLayout">
                                    {filteredItems.length === 0 ? (
                                        <motion.div 
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-12 text-center"
                                        >
                                            <div className="bg-slate-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                                <Search className="w-8 h-8 text-slate-400" />
                                            </div>
                                            <h3 className="text-xl font-bold text-slate-800">
                                                {search ? "Aucun résultat trouvé" : "Votre coffre est vide"}
                                            </h3>
                                            <p className="text-slate-500 mt-2">
                                                {search 
                                                    ? "Essayez d'ajuster vos filtres de recherche." 
                                                    : "Commencez par ajouter votre premier identifiant à l'aide du formulaire."}
                                            </p>
                                        </motion.div>
                                    ) : (
                                        filteredItems.map((item) => (
                                            <motion.div
                                                layout
                                                key={item.id}
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                className="bg-white border border-slate-200 rounded-3xl p-6 flex items-start gap-4 group hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/5 transition-all"
                                            >
                                                <div className="bg-slate-50 w-12 h-12 rounded-2xl flex items-center justify-center group-hover:bg-indigo-50 transition-colors overflow-hidden border border-slate-100 shrink-0">
                                                    <Favicon url={item.url} />
                                                </div>

                                                <div className="flex-1 min-w-0 space-y-3">
                                                    <div className="flex items-start justify-between">
                                                        <div className="min-w-0">
                                                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 truncate">
                                                                <span className="truncate">{item.name}</span>
                                                                {item.url && (
                                                                    <a 
                                                                        href={item.url} 
                                                                        target="_blank" 
                                                                        rel="noopener noreferrer"
                                                                        className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-indigo-600 transition-all shrink-0"
                                                                    >
                                                                        <ExternalLink className="w-4 h-4" />
                                                                    </a>
                                                                )}
                                                            </h3>
                                                            <p className="text-slate-500 text-sm font-medium truncate">{item.username}</p>
                                                        </div>

                                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                                            <button 
                                                                onClick={() => handleDelete(item.id)}
                                                                className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                            >
                                                                <Trash2 className="w-5 h-5" />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-wrap items-center gap-3">
                                                        <div className="flex-1 min-w-[200px] bg-slate-50 rounded-2xl border border-slate-100 p-1.5 flex items-center gap-2">
                                                            <div className="flex-1 px-3 py-1.5 overflow-hidden">
                                                                <code className="text-sm font-mono font-bold text-indigo-900 truncate block">
                                                                    {visiblePasswords[item.id] ? item.password : "••••••••••••••••"}
                                                                </code>
                                                            </div>
                                                            <button 
                                                                onClick={() => togglePasswordVisibility(item.id)}
                                                                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-xl transition-all shrink-0"
                                                            >
                                                                {visiblePasswords[item.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                            </button>
                                                            <div className="w-px h-6 bg-slate-200 mx-1 shrink-0" />
                                                            <button 
                                                                onClick={() => handleCopy(item.password, item.id)}
                                                                className={`p-2 flex items-center gap-2 rounded-xl transition-all shrink-0 ${
                                                                    copiedId === item.id 
                                                                        ? "bg-green-500 text-white" 
                                                                        : "text-slate-400 hover:text-indigo-600 hover:bg-white"
                                                                }`}
                                                            >
                                                                {copiedId === item.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                                                {copiedId === item.id && <span className="text-xs font-bold pr-1">Copié</span>}
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {item.notes && (
                                                        <div className="bg-amber-50/50 border border-amber-100/50 p-3 rounded-2xl">
                                                            <p className="text-xs text-amber-700 leading-relaxed font-medium">
                                                                {item.notes}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        ))
                                    )}
                                </AnimatePresence>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}