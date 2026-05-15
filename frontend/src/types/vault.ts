export type VaultItem = {
    id: string;
    encryptedName: string;
    encryptedUsername?: string;
    encryptedPassword?: string;
    encryptedUrl?: string;
    encryptedNotes?: string;
    nonce: string;
    createdAt: string;
    updatedAt: string;
};