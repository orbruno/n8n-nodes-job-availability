# Roadmap

This roadmap describes the public release path for `n8n-nodes-job-availability`. It summarizes intended direction rather than promising dates. User-visible changes are recorded in [CHANGELOG.md](CHANGELOG.md), while proposed changes and defects are tracked in [GitHub Issues](https://github.com/orbruno/n8n-nodes-job-availability/issues).

## 0.1.0 public-source candidate — complete

- Publish the standalone source repository under the MIT license.
- Provide the declarative Job Availability node, credential, eight operations, and synthetic example workflows.
- Validate linting, type safety, builds, tests, package contents, and local scanner rules on supported Node.js versions.
- Confirm package loading and isolated workflow behavior across the documented n8n compatibility range.
- Provide contribution, security, operational, and release documentation.

## 0.1.x self-hosted npm preview — planned

- Distribute or document deployment of the required companion Job Availability service.
- Complete sustained shadow validation against representative workloads.
- Publish the package from GitHub Actions with npm provenance.
- Install the exact published version in a fresh self-hosted n8n environment and repeat the end-to-end smoke tests.
- Document supported service versions, rollback, and upgrade procedures.

The npm preview will target self-hosted n8n. Publication will not imply n8n verification or n8n Cloud availability.

## n8n verification — conditional

- Recheck the current n8n community-node verification requirements against the released package.
- Run the official scanner against the exact npm version.
- Confirm that users can deploy a compatible service endpoint reachable from their n8n environment.
- Submit the package through the n8n Creator Portal and address review findings.

Verification depends on the companion service distribution and the requirements in force when the package is submitted.

## Later improvements

- Expand compatibility testing when new n8n release lines become relevant.
- Add further workflow examples based on validated user scenarios.
- Improve operational diagnostics without exposing credentials, source content, or personal data.
- Evaluate additional operations only when they preserve the service-owned domain and persistence boundaries.

## Scope boundaries

The node remains a thin declarative integration. Scraping, classification, persistence, scheduling, branching, multi-step retries, recovery, and notifications remain outside the node package.
