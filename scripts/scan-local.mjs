import {
	SOURCE_FILE_PATTERNS,
	analyzePackage,
} from '@n8n/scan-community-package/scanner/scanner.mjs';

const source = await analyzePackage(process.cwd(), SOURCE_FILE_PATTERNS);
const dist = await analyzePackage(`${process.cwd()}/dist`, ['**/*.js', 'package.json']);
const report = {
	scanner: '0.33.0',
	source,
	dist,
	passed: source.passed === true && dist.passed === true,
};

const stream = report.passed ? process.stdout : process.stderr;
stream.write(`${JSON.stringify(report, null, 2)}\n`);

if (!report.passed) process.exitCode = 1;
