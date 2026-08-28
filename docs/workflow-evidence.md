# Workflow Evidence

## Shipped examples

Manual observation: `examples/job-availability-observe.json` starts manually and calls Posting / Observe with a synthetic, non-resolving example URL. It is safe to import and remains inactive. Replace the synthetic URL only when testing against the bounded local service.

Daily durable run: `examples/job-availability-daily.json` schedules one run at 05:00 Europe/Berlin and calls Availability Run / Create Scheduled. It expands the bounded `pending_job_ids` window, processes the window through Loop Over Items and Job / Check Availability, collapses the completed window to one item, and calls Availability Run / Get. When `pending_count` remains above zero, the reset-enabled loop consumes the next returned window; otherwise the workflow calls Availability Run / Finalize.

AI Agent posting observation: `examples/job-availability-ai-tool.json` connects the synthetic `Job Availability Tool` variant to an AI Agent. The workflow fixes Posting / Observe, a public-board platform label, and a workflow-derived idempotency key. Only the public posting URL, expected title, and optional company are delegated through `$fromAI()`. The example remains inactive, contains no credentials, and requires a separately configured chat model.

The daily example preserves one run identity for the entire canonical inventory, including inventories above the RunDTO's 100-ID response window. Its workflow owns the schedule, bounded refresh cycle, expansion, item loop, retries, and recovery. The service ceiling of 1,000 jobs bounds the cycle to at most ten complete 100-ID windows when every initial job is pending. A terminal cancellation starts a new scheduled or explicit run; it never resumes the cancelled identity.

## Evidence states

- Static import shape: covered by package tests.
- Declarative route and parameter shape: covered by package tests and strict lint/build.
- Credential masking and authenticated test route: covered by package tests.
- AI-tool eligibility, fixed Posting / Observe authority, delegated-field allowlist, and connection shape: covered by package tests.
- Package runtime loading: confirmed on n8n 2.0.0, 2.23.2, and 2.36.7.
- T1 synthetic routing-spike execution: confirmed against a synthetic service on n8n 2.0.0, 2.23.2, and 2.36.7.
- T6 inactive WF06 release-candidate and synthetic-driver execution against the actual isolated service: confirmed on n8n 2.23.2, including bounded failure, recovery, 101-item, and 1,000-item scenarios.
- T6 sanitized workflow, configuration, execution, and terminal-output inspection: passed with synthetic data and no credentials or canonical writes.
- Production execution: not performed and not implied.

## Fresh-runtime scenarios

Use synthetic service data and a temporary n8n user folder. Record the n8n version and package tarball integrity before testing:

1. Import all examples with no import warnings.
2. Select a local credential and confirm a successful credential test.
3. Confirm an invalid token fails without revealing it.
4. Execute manual observation for open, closed, and inconclusive synthetic responses.
5. Execute scheduled runs with 1, 100, 101, and 1,000 synthetic jobs; confirm each refresh exposes no more than 100 pending IDs and finalization occurs only at `pending_count = 0`.
6. Inject one job failure and confirm unrelated items continue according to workflow settings.
7. Cancel a run during a check and confirm the run remains cancelled.
8. Create a new run and confirm recovery uses a different run ID.
9. Stop the service and confirm an actionable service-unavailable failure.
10. Export sanitized workflow and execution evidence with no credentials, URLs, titles, page content, or workflow payloads.
11. Connect the Job Availability Tool to an AI Agent, keep Posting / Observe fixed, delegate only the posting details, and confirm one explicit user request produces one tool call and one bounded service response.

Screenshots are evidence only after manual inspection confirms that they contain synthetic identifiers and no prohibited fields.
