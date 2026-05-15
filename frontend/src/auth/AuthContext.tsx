import type { ReactNode } from "react";
import { createContext, useContext, useState } from "react";
import { deriveKey } from "../crypto/crypto";

interface AuthContextType {
    token: string | null;
    masterPassword: string | null;
    derivedKey: CryptoKey | null;
    isAuthenticated: boolean;
    isLocked: boolean;
    setAuth: (token: string, masterPassword: string, salt: string) => Promise<void>;
    logout: () => void;
    unlock: (masterPassword: string, salt: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function uint8ArrayToBase64(bytes: Uint8Array): string {
    return btoa(String.fromCharCode(...bytes));
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
    const [masterPassword, setMasterPassword] = useState<string | null>(null);
    const [derivedKey, setDerivedKey] = useState<CryptoKey | null>(null);

    const isAuthenticated = !!token;
    const isLocked = isAuthenticated && !derivedKey;

    async function setAuth(newToken: string, newMasterPassword: string, saltBase64: string) {
        localStorage.setItem("token", newToken);
        setToken(newToken);
        
        await unlock(newMasterPassword, saltBase64);
    }

    async function unlock(password: string, saltBase64: string) {
        // Convert base64 salt to Uint8Array
        const salt = Uint8Array.from(atob(saltBase64), c => c.charCodeAt(0));
        
        const key = await deriveKey(password, salt);
        
        setMasterPassword(password);
        setDerivedKey(key);
    }

    function logout() {
        localStorage.removeItem("token");
        setToken(null);
        setMasterPassword(null);
        setDerivedKey(null);
    }

    return (
        <AuthContext.Provider value={{ 
            token, 
            masterPassword, 
            derivedKey, 
            isAuthenticated, 
            isLocked, 
            setAuth, 
            logout, 
            unlock 
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
