# Contributing

## Development setup

Use Node.js 22.22.0 or 24.19.0 and npm 11.6.2. Install exactly from the committed lockfile:

```bash
npm ci
```

## Required checks

Run the complete local gate before submitting a change:

```bash
npm run validate
```

The command runs the strict community-node linter, TypeScript typecheck, build, tests, and dry-run package inspection. Add or update tests whenever a credential, parameter, route, expression, workflow, file allowlist, or compatibility claim changes.

When the service API contract changes, update the API v1 contract fixture intentionally and verify its recorded OpenAPI, public-schema, fixture-manifest, and corpus hashes before changing node routing.

## Design boundaries

- Keep the node declarative. Do not add `execute()` or local domain classification.
- Keep normal dependencies empty and preserve `n8n-workflow: "*"` as the peer dependency.
- Keep credentials masked and keep secrets out of fixtures, workflows, logs, and errors.
- Keep schedules, loops, branches, retries across steps, recovery, and notifications in workflows.
- Do not publish, deploy, or create external release state without release approval.

Use concise changes, English documentation, synthetic examples, and a user-visible changelog entry.
