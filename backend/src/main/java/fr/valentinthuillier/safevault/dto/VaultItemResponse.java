package fr.valentinthuillier.safevault.dto;

import java.time.Instant;
import java.util.UUID;

public record VaultItemResponse(

        UUID id,

        String encryptedName,

        String encryptedUsername,

        String encryptedPassword,

        String encryptedUrl,

        String encryptedNotes,

        String nonce,

        Instant createdAt,

        Instant updatedAt

) {
}