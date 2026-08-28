import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const result = spawnSync('npm', ['pack', '--json', '--dry-run', '--ignore-scripts'], {
	encoding: 'utf8',
	env: { ...process.env, npm_config_cache: 'node_modules/.cache/npm' },
});

if (result.status !== 0) {
	process.stderr.write(result.stderr || result.stdout || 'npm pack dry-run failed\n');
	process.exit(result.status ?? 1);
}

let report;
try {
	report = JSON.parse(result.stdout);
} catch {
	process.stderr.write('npm pack did not return valid JSON\n');
	process.exit(1);
}

if (!Array.isArray(report) || report.length !== 1 || !Array.isArray(report[0]?.files)) {
	process.stderr.write('npm pack returned an unexpected report shape\n');
	process.exit(1);
}

const paths = report[0].files.map((entry) => entry.path).sort();
const expectedPaths = [
	'README.md',
	'LICENSE.md',
	'package.json',
	'dist/package.json',
	'dist/credentials/JobAvailabilityApi.credentials.d.ts',
	'dist/credentials/JobAvailabilityApi.credentials.js',
	'dist/credentials/JobAvailabilityApi.credentials.js.map',
	'dist/credentials/jobAvailabilityApi.dark.svg',
	'dist/credentials/jobAvailabilityApi.svg',
	'dist/nodes/JobAvailability/JobAvailability.node.d.ts',
	'dist/nodes/JobAvailability/JobAvailability.node.js',
	'dist/nodes/JobAvailability/JobAvailability.node.js.map',
	'dist/nodes/JobAvailability/JobAvailability.node.json',
	'dist/nodes/JobAvailability/jobAvailability.dark.svg',
	'dist/nodes/JobAvailability/jobAvailability.svg',
	'dist/nodes/JobAvailability/resources/availability-run/cancel.d.ts',
	'dist/nodes/JobAvailability/resources/availability-run/cancel.js',
	'dist/nodes/JobAvailability/resources/availability-run/cancel.js.map',
	'dist/nodes/JobAvailability/resources/availability-run/create-scheduled.d.ts',
	'dist/nodes/JobAvailability/resources/availability-run/create-scheduled.js',
	'dist/nodes/JobAvailability/resources/availability-run/create-scheduled.js.map',
	'dist/nodes/JobAvailability/resources/availability-run/create.d.ts',
	'dist/nodes/JobAvailability/resources/availability-run/create.js',
	'dist/nodes/JobAvailability/resources/availability-run/create.js.map',
	'dist/nodes/JobAvailability/resources/availability-run/finalize.d.ts',
	'dist/nodes/JobAvailability/resources/availability-run/finalize.js',
	'dist/nodes/JobAvailability/resources/availability-run/finalize.js.map',
	'dist/nodes/JobAvailability/resources/availability-run/get.d.ts',
	'dist/nodes/JobAvailability/resources/availability-run/get.js',
	'dist/nodes/JobAvailability/resources/availability-run/get.js.map',
	'dist/nodes/JobAvailability/resources/availability-run/index.d.ts',
	'dist/nodes/JobAvailability/resources/availability-run/index.js',
	'dist/nodes/JobAvailability/resources/availability-run/index.js.map',
	'dist/nodes/JobAvailability/resources/job/check-availability.d.ts',
	'dist/nodes/JobAvailability/resources/job/check-availability.js',
	'dist/nodes/JobAvailability/resources/job/check-availability.js.map',
	'dist/nodes/JobAvailability/resources/job/get-availability.d.ts',
	'dist/nodes/JobAvailability/resources/job/get-availability.js',
	'dist/nodes/JobAvailability/resources/job/get-availability.js.map',
	'dist/nodes/JobAvailability/resources/job/index.d.ts',
	'dist/nodes/JobAvailability/resources/job/index.js',
	'dist/nodes/JobAvailability/resources/job/index.js.map',
	'dist/nodes/JobAvailability/resources/posting/index.d.ts',
	'dist/nodes/JobAvailability/resources/posting/index.js',
	'dist/nodes/JobAvailability/resources/posting/index.js.map',
	'dist/nodes/JobAvailability/resources/posting/observe.d.ts',
	'dist/nodes/JobAvailability/resources/posting/observe.js',
	'dist/nodes/JobAvailability/resources/posting/observe.js.map',
	'docs/operations.md',
	'docs/security-evidence.md',
	'docs/workflow-evidence.md',
	'examples/job-availability-observe.json',
	'examples/job-availability-daily.json',
].sort();
const expected = new Set(expectedPaths);
const actual = new Set(paths);
const unexpected = paths.filter((path) => !expected.has(path));
const missing = expectedPaths.filter((path) => !actual.has(path));
const duplicate = paths.filter((path, index) => paths.indexOf(path) !== index);

if (unexpected.length > 0 || missing.length > 0 || duplicate.length > 0) {
	process.stderr.write(
		`${JSON.stringify({ passed: false, unexpected, missing, duplicate }, null, 2)}\n`,
	);
	process.exit(1);
}

const allowlistSha256 = createHash('sha256').update(`${expectedPaths.join('\n')}\n`).digest('hex');

process.stdout.write(
	`${JSON.stringify(
		{
			passed: true,
			package: report[0].filename,
			files: paths.length,
			packedSize: report[0].size,
			unpackedSize: report[0].unpackedSize,
			shasum: report[0].shasum,
			integrity: report[0].integrity,
			allowlistSha256,
		},
		null,
		2,
	)}\n`,
);
