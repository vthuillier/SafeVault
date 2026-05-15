package fr.valentinthuillier.safevault.controllers;

import fr.valentinthuillier.safevault.models.User;
import fr.valentinthuillier.safevault.dto.CreateVaultItemRequest;
import fr.valentinthuillier.safevault.dto.UpdateVaultItemRequest;
import fr.valentinthuillier.safevault.dto.VaultItemResponse;
import fr.valentinthuillier.safevault.services.VaultService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/vault/items")
@RequiredArgsConstructor
public class VaultController {

    private final VaultService vaultService;

    @PostMapping
    public VaultItemResponse create(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody CreateVaultItemRequest request
    ) {
        return vaultService.create(user, request);
    }

    @GetMapping
    public List<VaultItemResponse> findAll(
            @AuthenticationPrincipal User user
    ) {
        return vaultService.findAll(user);
    }

    @PutMapping("/{id}")
    public VaultItemResponse update(
            @PathVariable UUID id,
            @AuthenticationPrincipal User user,
            @Valid @RequestBody UpdateVaultItemRequest request
    ) {
        return vaultService.update(id, user, request);
    }

    @DeleteMapping("/{id}")
    public void delete(
            @PathVariable UUID id,
            @AuthenticationPrincipal User user
    ) {
        vaultService.delete(id, user);
    }
}