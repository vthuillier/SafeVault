package fr.valentinthuillier.safevault.services;

import fr.valentinthuillier.safevault.dto.AuthResponse;
import fr.valentinthuillier.safevault.dto.LoginRequest;
import fr.valentinthuillier.safevault.dto.RegisterRequest;
import fr.valentinthuillier.safevault.models.User;
import fr.valentinthuillier.safevault.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthResponse register(RegisterRequest registerRequest) {

        if (userRepository.existsByEmail(registerRequest.email())) {
            throw new RuntimeException("Email already exists");
        }

        User user = User.builder()
                .id(UUID.randomUUID())
                .email(registerRequest.email())
                .passwordHash(passwordEncoder.encode(registerRequest.password()))
                .kdfSalt("TEMPORAIRE")
                .kdfAlgorithm("Argon2id")
                .build();

        userRepository.save(user);

        String token = jwtService.generateToken(user.getId());

        return new AuthResponse(token);

    }

    public AuthResponse login(LoginRequest loginRequest) {

        User user = userRepository.findByEmail(loginRequest.email())
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        boolean matches = passwordEncoder.matches(
                loginRequest.password(),
                user.getPasswordHash()
        );

        if (!matches) {
            throw new RuntimeException("Invalid credentials");
        }

        String token = jwtService.generateToken(user.getId());

        return new AuthResponse(token);

    }

}
