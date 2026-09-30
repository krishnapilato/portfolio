CREATE TABLE users (
    id BIGINT NOT NULL AUTO_INCREMENT,
    version BIGINT NOT NULL DEFAULT 0,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(254) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL,
    failed_logins INT NOT NULL DEFAULT 0,
    locked_until DATETIME(6) NULL,
    last_login_at DATETIME(6) NULL,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    CONSTRAINT pk_users PRIMARY KEY (id),
    CONSTRAINT uk_users_email UNIQUE (email)
);
CREATE INDEX ix_users_status_role ON users (status, role);

CREATE TABLE user_tokens (
    id BIGINT NOT NULL AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    purpose VARCHAR(30) NOT NULL,
    fingerprint VARCHAR(64) NOT NULL,
    family VARCHAR(36) NULL,
    expires_at DATETIME(6) NOT NULL,
    consumed_at DATETIME(6) NULL,
    created_at DATETIME(6) NOT NULL,
    CONSTRAINT pk_user_tokens PRIMARY KEY (id),
    CONSTRAINT uk_user_tokens_fingerprint UNIQUE (fingerprint),
    CONSTRAINT fk_user_tokens_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);
CREATE INDEX ix_user_tokens_owner ON user_tokens (user_id, purpose);
CREATE INDEX ix_user_tokens_family ON user_tokens (family);
CREATE INDEX ix_user_tokens_expiry ON user_tokens (expires_at);

CREATE TABLE mail_messages (
    id BIGINT NOT NULL AUTO_INCREMENT,
    version BIGINT NOT NULL DEFAULT 0,
    recipients VARCHAR(4000) NOT NULL,
    cc VARCHAR(4000) NOT NULL,
    bcc VARCHAR(4000) NOT NULL,
    reply_to VARCHAR(254) NULL,
    subject VARCHAR(255) NOT NULL,
    body LONGTEXT NOT NULL,
    html BOOLEAN NOT NULL,
    status VARCHAR(20) NOT NULL,
    attempts INT NOT NULL DEFAULT 0,
    scheduled_at DATETIME(6) NOT NULL,
    sent_at DATETIME(6) NULL,
    last_error VARCHAR(1000) NULL,
    request_id VARCHAR(64) NULL,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    CONSTRAINT pk_mail_messages PRIMARY KEY (id)
);
CREATE INDEX ix_mail_messages_due ON mail_messages (status, scheduled_at);

CREATE TABLE mail_attachments (
    message_id BIGINT NOT NULL,
    sort_order INT NOT NULL,
    filename VARCHAR(255) NOT NULL,
    content_type VARCHAR(127) NOT NULL,
    content LONGBLOB NOT NULL,
    CONSTRAINT pk_mail_attachments PRIMARY KEY (message_id, sort_order),
    CONSTRAINT fk_mail_attachments_message FOREIGN KEY (message_id) REFERENCES mail_messages (id) ON DELETE CASCADE
);
