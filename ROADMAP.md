# Roadmap

This roadmap describes the public release path for `n8n-nodes-job-availability`. It summarizes intended direction rather than promising dates. User-visible changes are recorded in [CHANGELOG.md](CHANGELOG.md), while proposed changes and defects are tracked in [GitHub Issues](https://github.com/orbruno/n8n-nodes-job-availability/issues).

## 0.1.0 public-source candidate — complete

- Publish the standalone source repository under the MIT license.
- Provide the declarative Job Availability node, credential, eight operations, and synthetic example workflows.
- Validate linting, type safety, builds, tests, package contents, and local scanner rules on supported Node.js versions.
- Confirm package loading and isolated workflow behavior across the documented n8n compatibility range.
- Provide contribution, security, operational, and release documentation.
- Publish the companion [Job Availability API](https://github.com/orbruno/job-availability-api) with private self-hosting and n8n connectivity instructions.

## 0.1.x self-hosted npm publication — complete

- Publish versions 0.1.0 and 0.1.1 from GitHub Actions with npm provenance.
- Install the exact published version in a fresh self-hosted n8n environment and repeat the end-to-end smoke tests.
- Document supported service versions, rollback, and upgrade procedures.

The npm preview targets self-hosted n8n. Publication does not imply n8n verification or n8n Cloud availability.

## 0.2.0 AI-tool preview — complete

- Enable the node as an n8n app tool without adding custom execution code.
- Ship a constrained Posting / Observe agent example and safety guidance.
- Validate the exact published package in a fresh self-hosted n8n instance.

## 0.2.1 node-metadata correction — complete

- Use the fully qualified `n8n-nodes-job-availability.jobAvailability` identifier in the node metadata file.
- Protect the required identifier with a package-level regression test.
- Publish the correction as a provenance-backed patch release.

## n8n verification — complete

Version 0.2.0 and its uninterrupted capability demonstration were submitted through the Creator Portal on 2026-08-30. On 2026-09-03, n8n requested the fully qualified node metadata identifier before approval. Version 0.2.1 contains the correction, passed the complete release workflow, and was published to npm with provenance from the tagged source commit. The corrected package was resubmitted on 2026-09-03, and n8n approval was confirmed on 2026-09-05. The package is now a verified community node.

## Later improvements

- Expand compatibility testing when new n8n release lines become relevant.
- Add further workflow examples based on validated user scenarios.
- Improve operational diagnostics without exposing credentials, source content, or personal data.
- Evaluate additional operations only when they preserve the service-owned domain and persistence boundaries.

## Scope boundaries

The node remains a thin declarative integration. Scraping, classification, persistence, scheduling, branching, multi-step retries, recovery, and notifications remain outside the node package.
