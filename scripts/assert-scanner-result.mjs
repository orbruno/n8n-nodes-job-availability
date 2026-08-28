import { readFileSync } from 'node:fs';

const path = process.argv[2];
if (!path) {
	process.stderr.write('Usage: npm run scanner:assert -- <scanner-result.json>\n');
	process.exit(2);
}

let document;
try {
	document = JSON.parse(readFileSync(path, 'utf8'));
} catch {
	process.stderr.write('Scanner result is not valid JSON\n');
	process.exit(2);
}

const result = Array.isArray(document) ? document.at(-1) : document;
if (result?.passed !== true) {
	process.stderr.write(`${JSON.stringify({ passed: false, result }, null, 2)}\n`);
	process.exit(1);
}

process.stdout.write(
	`${JSON.stringify(
		{
			passed: true,
			warnings: Array.isArray(result.warnings) ? result.warnings : [],
			errors: Array.isArray(result.errors) ? result.errors : [],
		},
		null,
		2,
	)}\n`,
);
