package fr.valentinthuillier.safevault.repositories;

import fr.valentinthuillier.safevault.models.VaultItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface VaultItemRepository extends JpaRepository<VaultItem, UUID> {

    List<VaultItem> findAllByUserIdOrderByCreatedAtDesc(UUID userId);

}
