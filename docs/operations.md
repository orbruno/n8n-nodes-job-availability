# Operations

## Service boundary

The node is a declarative client for one self-hosted [Job Availability API](https://github.com/orbruno/job-availability-api). The service listens on configurable port 5002 by project convention and exposes JSON under `/v1`. The node supplies `Authorization: Bearer <service-token>` through its credential definition. Every POST supplies `Idempotency-Key`.

When the runtime exposes `$execution.id` to declarative request defaults, the node also supplies `X-N8N-Execution-Id` for privacy-safe request correlation. n8n 2.0.0 omits this optional header; n8n 2.23.2 and 2.36.7 include it. Service-side logs and problem responses must remain correlatable when it is absent.

The node does not classify postings, persist state, resolve network addresses, or schedule work. Those responsibilities belong to the service or workflow.

## AI Agent tool boundary

n8n may synthesize a `Job Availability Tool` from the same declarative node. In an agent workflow, the workflow author must select and fix the resource and operation before execution. Use `$fromAI()` only for the minimum action inputs and keep credentials, the service origin, and the idempotency key outside model control.

Posting / Observe is the recommended demonstration action: it performs a bounded public-URL observation without creating a canonical product job. Durable run creation, job checks, finalization, and cancellation can change service state and require explicit human review before they are enabled as agent actions. The service continues to enforce bearer authentication, public-network restrictions, idempotency, request bounds, and state transitions regardless of whether n8n invokes the node through a main connection or an AI-tool connection.

## Route map

- Credential test: `GET /v1/credentials/test`
- Posting / Observe: `POST /v1/postings/observe`
- Availability Run / Create: `POST /v1/availability/runs`
- Availability Run / Create Scheduled: `POST /v1/availability/runs/scheduled`
- Availability Run / Get: `GET /v1/availability/runs/{run_id}`
- Availability Run / Finalize: `POST /v1/availability/runs/{run_id}/finalize`
- Availability Run / Cancel: `POST /v1/availability/runs/{run_id}/cancel`
- Job / Check Availability: `POST /v1/availability/runs/{run_id}/jobs/{job_id}/check`
- Job / Get Availability: `GET /v1/jobs/{job_id}/availability`

Observe, Create, and Create Scheduled send `schema_version: 1`. Create accepts 1–100 explicit job IDs. Create Scheduled accepts no user-controlled trigger or job list; the service fixes `trigger` to `schedule`, snapshots the canonical inventory in one durable run, and fails rather than truncating when the inventory is empty or above 1,000 jobs. This avoids splitting one daily availability cycle into multiple closure identities.

Run responses expose at most 100 `pending_job_ids`. For a scheduled inventory above that response bound, process the returned IDs, call Get for the same run, and repeat while `pending_count > 0`. The shipped daily example uses Loop Over Items with an expression-controlled reset to initialize every new pending-ID window, and finalizes only after Get reports zero pending jobs.

## Idempotency

Provide a visible-ASCII key from 1 to 128 characters for every POST: Observe, Create, Create Scheduled, Check Availability, Finalize, and Cancel. The service retains idempotency records for 24 hours, and replaying Observe avoids another fetch.

Within one execution:

- use one key for run creation;
- include the job ID in each check key;
- use distinct suffixes for finalize and cancel;
- reuse the same key only when retrying the same body.

A key reused with a different body returns 409 `idempotency_conflict`.

## Credential lifecycle

Provision:

1. Generate at least 32 cryptographically random bytes with the service command.
2. Store the encoded token in the approved local secret mechanism and the n8n credential.
3. Start the service and run the credential test.
4. Confirm readiness without returning product data or the token.

Rotate:

1. Stop the service during a maintenance window.
2. Generate and configure a replacement token.
3. Update the n8n credential.
4. Restart and run the credential test.
5. Confirm the former token returns 401.

Revoke by removing or replacing the service secret, restarting the service, and proving the revoked value returns 401. Never place a token in workflow JSON, screenshots, tracked configuration, or command history intended for sharing.

## Problem responses

- 400 `invalid_request`: correct the named parameter or bound.
- 401 `authentication_failed`: test the credential, then rotate if needed.
- 404 `not_found`: verify the registered job ID or server-issued run ID.
- 409 `no_jobs_available`: add at least one canonical inventory job before a scheduled run.
- 409 `inventory_limit_exceeded`: reduce the canonical inventory to the 1,000-job service ceiling.
- 409 `idempotency_conflict`: use the original body or a new key.
- 409 `run_cancelled`: create a new run; cancellation is terminal.
- 409 `run_has_pending_jobs`: continue processing pending IDs before finalize.
- 409 `run_terminal`: create a new run for work that cannot apply to the terminal run.
- 409 `job_not_checkable`: verify the job belongs to the run and is still eligible for checking.
- 413 `payload_too_large`: reduce the request below the 256 KiB API limit.
- 415 `unsupported_media_type`: send JSON through the node's declarative request mapping.
- 429 `rate_limited`: use workflow-level retry with bounded delay.
- 500 `internal_error`: inspect privacy-safe service logs by request ID.
- 503 `service_unavailable`: verify service readiness and sole-writer ownership.

Posting outcome `inconclusive` is not an API error. It must never be converted to closed by workflow logic.

## Backup, rollback, and uninstall

This package writes no files. Service cutover and storage rollback remain separate operations. During migration, the existing implementation remains the sole canonical writer; release-candidate workflows use fixtures or isolated copies.

To roll back the node integration, deactivate the copied workflow, route it back to the prior HTTP integration, and uninstall the package. Do not remove the prior implementation or its compatible state files. Production cutover requires a recoverable backup and separate approval.

## Package verification

Run `npm run validate` before creating a tarball. `npm run scanner:local` applies scanner 0.33.0 rules to the source patterns and compiled distribution. `npm run package:inspect` executes a JSON dry-run pack and rejects source, tests, context files, CI files, locks, or other unexpected content. `npm run scanner:assert -- <result.json>` asserts the semantic `passed` field of a separately captured exact-version publication scan. That provenance scan runs after the exact version is available from the registry and is recorded with the external release evidence.

The API v1 contract fixture under `test/fixtures/` records upstream OpenAPI, public-schema, fixture-manifest, and fixture-corpus hashes. It also fixes all nine API operations, request bounds, bounded response fields, and problem semantics used by the node tests. The AI-tool example test additionally fixes Posting / Observe and the workflow-derived idempotency key while allowing only posting details to use `$fromAI()`.
