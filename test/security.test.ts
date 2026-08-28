import { describe, expect, it } from 'vitest';

const modules = import.meta.glob(['../credentials/**/*.ts', '../nodes/**/*.ts'], {
	query: '?raw',
	import: 'default',
	eager: true,
}) as Record<string, string>;
const sources = Object.entries(modules).map(([path, content]) => ({ path, content }));

describe('runtime security surface', () => {
	it('contains no custom execution method or request function', () => {
		for (const source of sources) {
			expect(source.content, source.path).not.toMatch(/\bexecute\s*\(/u);
			expect(source.content, source.path).not.toMatch(/httpRequest(?:WithAuthentication)?\s*\(/u);
		}
	});

	it('contains no restricted runtime capability', () => {
		const prohibited = [
			/\b(?:process|global|globalThis|__dirname|__filename)\b/u,
			/\b(?:eval|Function)\s*\(/u,
			/\bchild_process\b/u,
			/\bconsole\.(?:log|info|warn|error|debug)\s*\(/u,
			/\b(?:fs|node:fs|node:path)\b/u,
		];

		for (const source of sources) {
			for (const pattern of prohibited) {
				expect(source.content, `${source.path} matched ${pattern}`).not.toMatch(pattern);
			}
		}
	});

	it('contains no cleartext bearer value', () => {
		for (const source of sources) {
			expect(source.content, source.path).not.toMatch(/Bearer\s+[A-Za-z0-9_-]{32,}/u);
		}
	});
});
