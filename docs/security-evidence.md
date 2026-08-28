# Security Evidence

Evidence date: 2026-08-28. Tool runtime: Node.js 24.19.0 and npm 11.6.2.

## Runtime surface

- Normal dependencies: none.
- Peer dependency: `n8n-workflow: "*"`.
- `npm audit --omit=dev --json`: 0 vulnerabilities at every severity.
- Scanner 0.33.0 local source analysis: passed.
- Scanner 0.33.0 local compiled-distribution analysis: passed.
- Package tests reject custom execution, direct HTTP helpers, restricted imports, filesystem or environment access, dynamic execution, subprocess use, console output, and cleartext bearer values in runtime source.

The local scanner results above are prepublication evidence. Every release must also pass an exact-version provenance scan after the registry publishes it; that result belongs to the external release record because it cannot be embedded in the package it evaluates.

## AI-tool boundary

- n8n synthesizes the tool variant from the same declarative route definitions; the package adds no custom execution method.
- The shipped agent example fixes Posting / Observe and derives idempotency from the workflow execution.
- The example delegates only public posting details and contains no credential reference or secret.
- The companion service continues to enforce authentication, public-network restrictions, request bounds, idempotency, and state transitions.
- Durable mutating tool operations require human review before workflow activation.

## Development-tool audit

`npm audit --json` reports 10 development-only findings: 6 moderate, 4 high, and 0 critical. The exact affected paths are:

- `node_modules/uuid`: GHSA-w5hq-g745-h8pq, moderate, through the current node development tool's language-chain utilities.
- `node_modules/@langchain/classic`: moderate roll-up from `uuid`.
- `node_modules/@n8n/ai-utilities/node_modules/@langchain/community`: moderate roll-up from `uuid` and the classic package.
- `node_modules/@n8n/ai-utilities`: moderate roll-up.
- `node_modules/@n8n/ai-node-sdk`: moderate roll-up.
- `node_modules/@n8n/node-cli`: moderate roll-up; direct development tool.
- `node_modules/release-it/node_modules/undici`: GHSA-f269-vfmq-vjvj, GHSA-2mjp-6q6p-2qxm, GHSA-vrm6-8vpv-qv8q, GHSA-v9p9-hfj2-hcw8, GHSA-4992-7rv2-5pvq, GHSA-p88m-4jfj-68fv, GHSA-vxpw-j846-p89q, GHSA-g8m3-5g58-fq7m, GHSA-8xcm-r25x-g524, GHSA-m8rv-5g2x-5cg5, GHSA-v3r7-h72x-cjcm, and GHSA-35p6-xmwp-9g52; high roll-up.
- `node_modules/release-it`: high roll-up from `undici`; direct generated release tool.
- `node_modules/@n8n/scan-community-package/node_modules/tmp`: GHSA-ph9p-34f9-6g65, high.
- `node_modules/@n8n/scan-community-package`: high roll-up from `tmp`; direct local scanner.

The registry proposes incompatible tool changes: node development tool 0.20.0, scanner 0.9.7, or release tool 21.0.2. Those changes would diverge from the captured official scaffold and scanner versions and are not applied silently. The affected packages are development and release tools and are excluded from the installed runtime dependency surface. Recheck immediately before publication and upgrade when the official compatible toolchain resolves them.
