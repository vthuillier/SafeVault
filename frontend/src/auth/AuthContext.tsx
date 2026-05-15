import type { ReactNode } from "react";
import { createContext, useContext, useState } from "react";
import { deriveKey, base64ToUint8Array, decryptText } from "../crypto/crypto";

interface AuthContextType {
    token: string | null;
    salt: string | null;
    masterPassword: string | null;
    derivedKey: CryptoKey | null;
    isAuthenticated: boolean;
    isLocked: boolean;
    setAuth: (
        token: string, 
        masterPassword: string, 
        salt: string, 
        encryptedVerification?: string, 
        verificationNonce?: string
    ) => Promise<void>;
    logout: () => void;
    unlock: (masterPassword: string, salt: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
    const [salt, setSalt] = useState<string | null>(localStorage.getItem("kdfSalt"));
    const [derivedKey, setDerivedKey] = useState<CryptoKey | null>(null);

    const isAuthenticated = !!token;
    const isLocked = isAuthenticated && !derivedKey;

    async function setAuth(
        newToken: string, 
        newMasterPassword: string, 
        saltBase64: string,
        encryptedVerification?: string,
        verificationNonce?: string
    ) {
        localStorage.setItem("token", newToken);
        localStorage.setItem("kdfSalt", saltBase64);
        if (encryptedVerification) localStorage.setItem("vEnc", encryptedVerification);
        if (verificationNonce) localStorage.setItem("vNonce", verificationNonce);
        
        setToken(newToken);
        setSalt(saltBase64);
        
        await unlock(newMasterPassword, saltBase64);
    }

    async function unlock(password: string, saltBase64: string) {
        const saltBytes = base64ToUint8Array(saltBase64);
        const key = await deriveKey(password, saltBytes);
        
        // Verification logic
        const vEnc = localStorage.getItem("vEnc");
        const vNonce = localStorage.getItem("vNonce");
        
        if (vEnc && vNonce) {
            try {
                const decrypted = await decryptText(vEnc, vNonce, key);
                if (decrypted !== "VERIFIED") {
                    throw new Error("Mot de passe maître incorrect.");
                }
            } catch (err) {
                throw new Error("Mot de passe maître incorrect.");
            }
        }
        
        setDerivedKey(key);
    }

    function logout() {
        localStorage.removeItem("token");
        localStorage.removeItem("kdfSalt");
        localStorage.removeItem("vEnc");
        localStorage.removeItem("vNonce");
        setToken(null);
        setSalt(null);
        setDerivedKey(null);
    }

    return (
        <AuthContext.Provider value={{ 
            token, 
            salt,
            masterPassword: null, // No longer stored
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
