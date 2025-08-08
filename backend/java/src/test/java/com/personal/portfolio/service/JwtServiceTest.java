package com.personal.portfolio.service;

import com.personal.portfolio.model.JwtKeys;
import com.personal.portfolio.repository.JwtKeysRepository;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import javax.crypto.SecretKey;
import java.util.Base64;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.BDDMockito.*;

class JwtServiceTest {

    @Mock
    private JwtKeysRepository keyRepository;

    @InjectMocks
    private JwtService jwtService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void shouldRotateKeyAndCreateNew() {
        given(keyRepository.findFirstByOrderByCreatedDateDesc())
                .willReturn(Optional.empty());

        // Clear interactions before the test action
        clearInvocations(keyRepository);

        jwtService.rotateKey();

        verify(keyRepository, times(1)).save(any(JwtKeys.class));
    }

    @Test
    void shouldCleanupExpiredKeys() {
        List<JwtKeys> expiredKeys = List.of(new JwtKeys(), new JwtKeys());

        given(keyRepository.findExpiredKeys(any()))
                .willReturn(expiredKeys);

        jwtService.rotateKey();

        verify(keyRepository).deleteAllInBatch(expiredKeys);
    }

    @Test
    void shouldReturnExistingKeyOrCreateNew() {
        given(keyRepository.findFirstByOrderByCreatedDateDesc())
                .willReturn(Optional.empty());

        SecretKey key = jwtService.getSignInKey();

        assertThat(key).isNotNull();
    }

    @Test
    void shouldDecodeKeyCorrectly() {
        SecretKey originalKey = Keys.secretKeyFor(io.jsonwebtoken.SignatureAlgorithm.HS512);
        String encoded = Base64.getEncoder().encodeToString(originalKey.getEncoded());

        SecretKey decodedKey = jwtService.decodeKey(encoded);
        assertThat(decodedKey).isNotNull();
        assertThat(decodedKey.getAlgorithm()).isEqualTo("HmacSHA512");
    }
}