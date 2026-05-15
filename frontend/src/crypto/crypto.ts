function getSubtleCrypto(): SubtleCrypto {

    if (!window.crypto?.subtle) {
        throw new Error(
            "WebCrypto API indisponible. Utilise http://localhost:5173 ou HTTPS."
        );
    }

    return window.crypto.subtle;
}

export function generateSalt(): Uint8Array {
    return crypto.getRandomValues(new Uint8Array(16));
}

export async function deriveKey(
    password: string,
    salt: Uint8Array
): Promise<CryptoKey> {

    const subtle = getSubtleCrypto();

    const encoder = new TextEncoder();

    const baseKey = await subtle.importKey(
        "raw",
        encoder.encode(password),
        "PBKDF2",
        false,
        ["deriveKey"]
    );

    return subtle.deriveKey(
        {
            name: "PBKDF2",
            salt,
            iterations: 600_000,
            hash: "SHA-256",
        },
        baseKey,
        {
            name: "AES-GCM",
            length: 256,
        },
        false,
        ["encrypt", "decrypt"]
    );
}

export async function encryptText(
    text: string,
    key: CryptoKey
) {

    const subtle = getSubtleCrypto();

    const encoder = new TextEncoder();

    const iv = crypto.getRandomValues(new Uint8Array(12));

    const encrypted = await subtle.encrypt(
        {
            name: "AES-GCM",
            iv,
        },
        key,
        encoder.encode(text)
    );

    return {
        ciphertext: arrayBufferToBase64(encrypted),
        iv: uint8ArrayToBase64(iv),
    };
}

export async function decryptText(
    ciphertext: string,
    iv: string,
    key: CryptoKey
): Promise<string> {

    const subtle = getSubtleCrypto();

    const encryptedBytes = base64ToUint8Array(ciphertext);

    const ivBytes = base64ToUint8Array(iv);

    const decrypted = await subtle.decrypt(
        {
            name: "AES-GCM",
            iv: ivBytes,
        },
        key,
        encryptedBytes
    );

    return new TextDecoder().decode(decrypted);
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
    return uint8ArrayToBase64(new Uint8Array(buffer));
}

export function uint8ArrayToBase64(bytes: Uint8Array): string {
    return btoa(String.fromCharCode(...bytes));
}

function base64ToUint8Array(base64: string): Uint8Array {
    return Uint8Array.from(
        atob(base64),
        char => char.charCodeAt(0)
    );
}