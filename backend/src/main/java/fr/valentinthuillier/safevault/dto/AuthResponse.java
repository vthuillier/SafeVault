package fr.valentinthuillier.safevault.dto;

public record AuthResponse(
        String token,
        String kdfSalt,
        String encryptedVerification,
        String verificationNonce
) {
}
