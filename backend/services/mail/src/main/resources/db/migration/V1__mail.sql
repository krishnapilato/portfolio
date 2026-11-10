CREATE TABLE message_template (
    id         BINARY(16)   NOT NULL PRIMARY KEY,
    name       VARCHAR(64)  NOT NULL UNIQUE,
    subject    VARCHAR(255) NOT NULL,
    body       MEDIUMTEXT   NOT NULL,
    updated_at DATETIME(6)  NOT NULL
);

CREATE TABLE message (
    id              BINARY(16)   NOT NULL PRIMARY KEY,
    recipient       VARCHAR(254) NOT NULL,
    subject         VARCHAR(255) NOT NULL,
    html            MEDIUMTEXT   NULL,
    unsubscribe_url VARCHAR(512) NULL,
    status          VARCHAR(16)  NOT NULL,
    created_at      DATETIME(6)  NOT NULL,
    finished_at     DATETIME(6)  NULL,
    INDEX message_by_created (created_at)
);

CREATE TABLE audience (
    id          BINARY(16)   NOT NULL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(500) NOT NULL,
    created_at  DATETIME(6)  NOT NULL
);

CREATE TABLE subscriber (
    id           BINARY(16)   NOT NULL PRIMARY KEY,
    audience_id  BINARY(16)   NOT NULL,
    email        VARCHAR(254) NOT NULL,
    name         VARCHAR(100) NOT NULL,
    status       VARCHAR(16)  NOT NULL,
    created_at   DATETIME(6)  NOT NULL,
    confirmed_at DATETIME(6)  NULL,
    CONSTRAINT subscriber_audience FOREIGN KEY (audience_id) REFERENCES audience (id) ON DELETE CASCADE,
    CONSTRAINT subscriber_once UNIQUE (audience_id, email)
);

INSERT INTO message_template (id, name, subject, body, updated_at) VALUES
(UUID_TO_BIN('019a6c1e-0000-7000-8000-000000000001'), 'subscription-confirmation', 'Confirm your subscription to {{audience}}',
 '<p>Hi {{name}},</p><p>Please confirm that you want to receive <strong>{{audience}}</strong>.</p><p><a href="{{confirmUrl}}">Confirm my subscription</a></p><p>If you did not ask for this, ignore this message: nothing will be sent.</p>',
 CURRENT_TIMESTAMP(6)),
(UUID_TO_BIN('019a6c1e-0000-7000-8000-000000000002'), 'newsletter', '{{headline}}',
 '<h1>{{headline}}</h1><p>Hi {{name}},</p><p>{{body}}</p><p><a href="{{unsubscribeUrl}}">Unsubscribe</a></p>',
 CURRENT_TIMESTAMP(6));
