# Security Policy

## Supported versions

Version 0.1.x is a local release candidate. No public package version is supported yet.

## Reporting

Use the repository's **Security** tab and select **Report a vulnerability** to send a private report. Do not open a public issue for an unpatched vulnerability. Do not include service tokens, source URLs, page content, workflow payloads, or personal data in the report. Include a minimal synthetic reproduction, affected version, and observed impact.

## Security boundary

The package stores the service token through n8n credentials and sends it as a bearer token. It performs declarative requests only and has no runtime dependencies, filesystem access, environment access, dynamic execution, subprocess use, or console output.

The self-hosted service owns authentication, URL and network policy, SSRF controls, persistence confinement, idempotency, cancellation, redaction, and bounded problem responses. A configurable HTTP Base URL is appropriate only on a controlled local network. Use HTTPS across network boundaries.

Never commit a real service token or export one in workflow JSON. Rotate or revoke a suspected token immediately and verify that the former value returns 401.
