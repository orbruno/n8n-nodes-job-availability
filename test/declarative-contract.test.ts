import { describe, expect, it } from 'vitest';
import type { INodeProperties, INodePropertyOptions } from 'n8n-workflow';
import { evaluateExpression } from 'n8n-workflow/dist/cjs/expression-evaluator-proxy.js';
import { JobAvailability } from '../nodes/JobAvailability/JobAvailability.node';

const node = new JobAvailability();

function operationProperty(resource: string): INodeProperties {
	const property = node.description.properties.find(
		(candidate) =>
			candidate.name === 'operation' &&
			(candidate.displayOptions?.show?.resource ?? []).includes(resource),
	);

	if (!property) throw new Error(`Missing operation property for ${resource}`);
	return property;
}

function operation(resource: string, value: string): INodePropertyOptions {
	const option = operationProperty(resource).options?.find(
		(candidate) => 'value' in candidate && candidate.value === value,
	) as INodePropertyOptions | undefined;

	if (!option) throw new Error(`Missing ${resource}/${value} operation`);
	return option;
}

function field(resource: string, operationName: string, name: string): INodeProperties {
	const property = node.description.properties.find(
		(candidate) =>
			candidate.name === name &&
			(candidate.displayOptions?.show?.resource ?? []).includes(resource) &&
			(candidate.displayOptions?.show?.operation ?? []).includes(operationName),
	);

	if (!property) throw new Error(`Missing ${resource}/${operationName}/${name} field`);
	return property;
}

function evaluateDescriptor(expression: string, data: Record<string, unknown>): unknown {
	expect(expression.startsWith('={{')).toBe(true);
	return evaluateExpression(expression.slice(1), { encodeURIComponent, ...data });
}

describe('declarative operation contract', () => {
	it('declares the exact resource and operation surface', () => {
		const resource = node.description.properties.find((property) => property.name === 'resource');
		expect(resource?.options?.map((option) => ('value' in option ? option.value : undefined))).toEqual([
			'availabilityRun',
			'job',
			'posting',
		]);
		expect(operationProperty('posting').options?.map((option) => option.name)).toEqual(['Observe']);
		expect(operationProperty('availabilityRun').options?.map((option) => option.name)).toEqual([
			'Cancel',
			'Create',
			'Create Scheduled',
			'Finalize',
			'Get',
		]);
		expect(operationProperty('job').options?.map((option) => option.name)).toEqual([
			'Check Availability',
			'Get Availability',
		]);
	});

	it.each([
		['posting', 'observe', 'POST', '/v1/postings/observe'],
		['availabilityRun', 'create', 'POST', '/v1/availability/runs'],
		['availabilityRun', 'createScheduled', 'POST', '/v1/availability/runs/scheduled'],
	] as const)('routes %s/%s to the expected fixed endpoint', (resource, operationName, method, url) => {
		expect(operation(resource, operationName).routing?.request).toMatchObject({ method, url });
	});

	it.each([
		['posting', 'observe'],
		['availabilityRun', 'create'],
		['availabilityRun', 'createScheduled'],
	] as const)('sends schema version 1 in the %s/%s body', (resource, operationName) => {
		expect(operation(resource, operationName).routing?.request?.body).toEqual({ schema_version: 1 });
	});

	it('maps the explicit run job collection to an actual JSON array body', () => {
		const jobIds = field('availabilityRun', 'create', 'jobIds');
		const expression = jobIds.routing?.send?.value;
		expect(jobIds.typeOptions).toMatchObject({
			multipleValues: true,
			minRequiredFields: 1,
			maxAllowedFields: 100,
		});
		expect(expression).toBeTypeOf('string');

		const nfcId = 'München–Café-001'.normalize('NFC');
		const longId = '職'.repeat(80);
		const value = [{ jobId: nfcId }, { jobId: longId }];
		const evaluated = evaluateDescriptor(expression as string, { $value: value });
		const body = { [jobIds.routing?.send?.property as string]: evaluated };

		expect(body).toEqual({ job_ids: [nfcId, longId] });
		expect(JSON.parse(JSON.stringify(body))).toEqual(body);
		expect(Buffer.byteLength(longId, 'utf8')).toBe(240);
	});

	it('keeps scheduled creation inputs service-owned', () => {
		const visibleNames = node.description.properties
			.filter(
				(property) =>
					(property.displayOptions?.show?.resource ?? []).includes('availabilityRun') &&
					(property.displayOptions?.show?.operation ?? []).includes('createScheduled'),
			)
			.map((property) => property.name);
		expect(visibleNames).toEqual(['idempotencyKey']);
		expect(operation('availabilityRun', 'createScheduled').routing?.request?.body).toEqual({
			schema_version: 1,
		});
	});

	it.each([
		['availabilityRun', 'finalize'],
		['availabilityRun', 'cancel'],
		['job', 'checkAvailability'],
	] as const)('keeps %s/%s request bodyless', (resource, operationName) => {
		expect(operation(resource, operationName).routing?.request).not.toHaveProperty('body');
	});

	it('declares the optional n8n execution ID correlation header expression', () => {
		const descriptor = node.description.requestDefaults?.headers?.['X-N8N-Execution-Id'];
		expect(descriptor).toBeTypeOf('string');
		expect(
			evaluateDescriptor(descriptor as string, { $execution: { id: 'execution-synthetic-123' } }),
		).toBe('execution-synthetic-123');
	});

	it.each([
		['posting', 'observe'],
		['availabilityRun', 'create'],
		['availabilityRun', 'createScheduled'],
		['availabilityRun', 'finalize'],
		['availabilityRun', 'cancel'],
		['job', 'checkAvailability'],
	] as const)('sends an idempotency header for %s/%s', (resource, operationName) => {
		expect(field(resource, operationName, 'idempotencyKey').routing?.request?.headers).toEqual({
			'Idempotency-Key': '={{$value}}',
		});
	});

	it('percent-encodes every supplied path segment with the n8n expression evaluator', () => {
		const runId = 'run/β%42';
		const nfcId = 'München–Café/Role%25'.normalize('NFC');
		const decomposedId = nfcId.normalize('NFD');
		const longId = '職'.repeat(80);
		const descriptor = operation('job', 'checkAvailability').routing?.request?.url;
		expect(descriptor).toBeTypeOf('string');

		for (const jobId of [nfcId, decomposedId, longId]) {
			const url = evaluateDescriptor(descriptor as string, {
				$parameter: { runId, jobId },
			});
			expect(url).toBeTypeOf('string');
			const segments = (url as string).split('/');
			expect(decodeURIComponent(segments[4])).toBe(runId);
			expect(decodeURIComponent(segments[6])).toBe(jobId);
			expect(segments[4]).not.toContain('%42/');
			expect(segments[6]).not.toContain('/');
		}
	});

	it.each([
		['availabilityRun', 'get', { runId: 'run/α%10' }],
		['availabilityRun', 'finalize', { runId: 'run/α%10' }],
		['availabilityRun', 'cancel', { runId: 'run/α%10' }],
		['job', 'getAvailability', { jobId: 'München/職%25' }],
	] as const)('evaluates the encoded %s/%s path descriptor', (resource, operationName, parameters) => {
		const descriptor = operation(resource, operationName).routing?.request?.url;
		expect(evaluateDescriptor(descriptor as string, { $parameter: parameters })).toMatch(
			/^\/v1\//,
		);
	});
});
