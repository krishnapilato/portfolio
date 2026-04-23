CREATE TABLE users (
    id BIGINT NOT NULL AUTO_INCREMENT,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    phone_number VARCHAR(20),
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    locked BOOLEAN NOT NULL DEFAULT FALSE,
    account_non_expired BOOLEAN NOT NULL DEFAULT TRUE,
    credentials_non_expired BOOLEAN NOT NULL DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    profile_picture_url VARCHAR(500),
    bio VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_users PRIMARY KEY (id),
    CONSTRAINT uc_user_email UNIQUE (email),
    CONSTRAINT uc_user_phone_number UNIQUE (phone_number)
);

CREATE INDEX idx_user_email ON users (email);
CREATE INDEX idx_user_enabled ON users (enabled);

CREATE TABLE jwt_keys (
    id BIGINT NOT NULL AUTO_INCREMENT,
    key_id VARCHAR(50) NOT NULL,
    secret_key TEXT NOT NULL,
    created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expiration_date TIMESTAMP NOT NULL,
    CONSTRAINT pk_jwt_keys PRIMARY KEY (id),
    CONSTRAINT uc_jwt_key_id UNIQUE (key_id)
);

CREATE INDEX idx_jwt_key_id ON jwt_keys (key_id);
CREATE INDEX idx_jwt_expiration ON jwt_keys (expiration_date);

CREATE TABLE password_reset_tokens (
    id BIGINT NOT NULL AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    token_hash VARCHAR(64) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    CONSTRAINT pk_password_reset_tokens PRIMARY KEY (id),
    CONSTRAINT uc_password_reset_token_hash UNIQUE (token_hash),
    CONSTRAINT fk_password_reset_tokens_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX idx_password_reset_token_hash ON password_reset_tokens (token_hash);
CREATE INDEX idx_password_reset_expires_at ON password_reset_tokens (expires_at);
CREATE INDEX idx_password_reset_user ON password_reset_tokens (user_id);
