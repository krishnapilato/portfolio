CREATE TABLE auth_rate_limits (
    client VARCHAR(64) NOT NULL,
    window_end_ms BIGINT NOT NULL,
    requests INT NOT NULL,
    CONSTRAINT pk_auth_rate_limits PRIMARY KEY (client)
);
CREATE INDEX ix_auth_rate_limits_expiry ON auth_rate_limits (window_end_ms);
