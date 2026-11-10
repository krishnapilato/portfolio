# 4. Mustache for templates that change at run time

Date: 2026-11-10. Status: accepted.

## Context

Templates are stored in the database and edited through the API, so a template is data that came from outside the code. Thymeleaf templates can evaluate Spring expressions: a template saved through a stolen administrator token could run code on the server.

## Decision

Stored templates are Mustache (JMustache). Mustache has no logic: it can only fill in values and repeat sections. Values are HTML-escaped in the body; the subject is plain text kept on one line. The service's own pages, which are part of the code, stay Thymeleaf.

## Consequences

- The worst a malicious template can do is send odd mail, never run code.
- Templates cannot format dates or numbers themselves; whoever sends the message passes them ready to show.
