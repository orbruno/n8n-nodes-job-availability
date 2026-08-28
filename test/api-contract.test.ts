import { describe, expect, it } from 'vitest';
import type { INodeProperties, INodePropertyOptions } from 'n8n-workflow';
import { JobAvailabilityApi } from '../credentials/JobAvailabilityApi.credentials';
import { JobAvailability } from '../nodes/JobAvailability/JobAvailability.node';
import contractDocument from './fixtures/job-availability-api-v1.contract.json';

type ContractOperation = (typeof contractDocument.node_operations)[number];

const node = new JobAvailability();

function operationOption(resource: string, operation: string): INodePropertyOptions {
	const property = node.description.properties.find(
		(candidate) =>
			candidate.name === 'operation' &&
			(candidate.displayOptions?.show?.resource ?? []).includes(resource),
	);
	const option = property?.options?.find(
		(candidate) => 'value' in candidate && candidate.value === operation,
	) as INodePropertyOptions | undefined;

	if (!option) throw new Error(`Missing ${resource}/${operation}`);
	return option;
}

function operationFields(resource: string, operation: string): INodeProperties[] {
	return node.description.properties.filter(
		(property) =>
			(property.displayOptions?.show?.resource ?? []).includes(resource) &&
			(property.displayOptions?.show?.operation ?? []).includes(operation),
	);
}

function routedBodyFields(operation: ContractOperation): string[] {
	const option = operationOption(operation.resource, operation.operation);
	const body = option.routing?.request?.body ?? {};
	const parameterFields = operationFields(operation.resource, operation.operation).flatMap(
		(property) => {
			const routedName = property.routing?.send?.property;
			return typeof routedName === 'string' ? [routedName] : [];
		},
	);

	return [...Object.keys(body), ...parameterFields].sort();
}

describe('frozen API v1 node contract', () => {
	it('records the approved contract and language-neutral fixture provenance', () => {
		expect(contractDocument).toMatchObject({
			interface: 'job-availability-api-v1-node-contract',
			contract_version: '1.0.0',
			source_provenance: {
				openapi_sha256: '0e4cb0aa002a4fd959c1c03fb7f6e134d62c3eb88bff07a8065a85fbcfde46ee',
				public_schema_sha256: 'dded385139c13df12530c1e312105675af17fd3f82b01af2fba04ef93fe598b8',
				fixture_manifest_sha256: '96ac56414301388ae48464a1ff8acbebed9fcd7d40cf74c30035f710be0d9b70',
				fixture_corpus_sha256: 'a2a1d23d653976525ea62bd761b2828ff85ec65a3f96cc8150a4c62343a5e868',
				fixture_case_count: 65,
			},
		});
	});

	it('maps the credential test and all eight node operations exactly', () => {
		const credential = new JobAvailabilityApi();
		expect(credential.test?.request).toMatchObject({
			method: contractDocument.credential_operation.method,
			url: contractDocument.credential_operation.url,
		});
		expect(contractDocument.node_operations).toHaveLength(8);

		for (const operation of contractDocument.node_operations) {
			const option = operationOption(operation.resource, operation.operation);
			expect(option.routing?.request, operation.id).toMatchObject({
				method: operation.method,
				url: operation.url,
			});
			expect(
				operationFields(operation.resource, operation.operation).map(({ name }) => name),
				operation.id,
			).toEqual(operation.ui_fields);
			expect(routedBodyFields(operation), operation.id).toEqual([...operation.body_fields].sort());
		}
	});

	it('requires idempotency for every mutation and never sends it on reads', () => {
		for (const operation of contractDocument.node_operations) {
			const fields = operationFields(operation.resource, operation.operation);
			const idempotency = fields.find(({ name }) => name === 'idempotencyKey');

			if (operation.method === 'POST') {
				expect(idempotency?.required, operation.id).toBe(true);
				expect(idempotency?.routing?.request?.headers, operation.id).toEqual({
					'Idempotency-Key': '={{$value}}',
				});
			} else {
				expect(idempotency, operation.id).toBeUndefined();
			}
		}
	});

	it('returns only the bounded service body without full-response or local transformation modes', () => {
		for (const operation of contractDocument.node_operations) {
			const routing = operationOption(operation.resource, operation.operation).routing;
			expect(routing?.output, operation.id).toBeUndefined();
			expect(routing?.request, operation.id).not.toHaveProperty('returnFullResponse');
			expect(routing?.request, operation.id).not.toHaveProperty('resolveWithFullResponse');
		}

		expect(contractDocument.response_contracts.ObservePostingResponse).toMatchObject({
			fields: ['schema_version', 'service_version', 'duration_ms', 'observation'],
			source_evidence_fields: ['platform', 'outcome', 'evidence_code', 'checked_at', 'http_status'],
		});
		expect(contractDocument.response_contracts.Run).toMatchObject({
			pending_job_ids_max_items: 100,
			processed_job_ids_max_items: 100,
			errors_max_items: 100,
		});
		expect(contractDocument.response_contracts.CheckJobResponse.sources_max_items).toBe(20);
		expect(contractDocument.response_contracts.JobAvailability).toMatchObject({
			closure_run_ids_max_items: 2,
			sources_max_items: 20,
		});
		expect(contractDocument.response_contracts.Problem).toMatchObject({
			detail_max_characters: 500,
			request_id_max_characters: 128,
		});
	});

	it('locks the complete bounded problem surface', () => {
		expect(contractDocument.problem_statuses).toEqual([
			400, 401, 404, 409, 413, 415, 429, 500, 503,
		]);
		expect(contractDocument.problem_codes).toEqual([
			'invalid_request',
			'authentication_failed',
			'not_found',
			'payload_too_large',
			'unsupported_media_type',
			'idempotency_conflict',
			'run_cancelled',
			'run_has_pending_jobs',
			'run_terminal',
			'job_not_checkable',
			'no_jobs_available',
			'inventory_limit_exceeded',
			'rate_limited',
			'internal_error',
			'service_unavailable',
		]);
	});

	it('keeps every user-visible request bound aligned with the contract', () => {
		const bounds = contractDocument.request_bounds;
		const createJobIds = operationFields('availabilityRun', 'create').find(
			({ name }) => name === 'jobIds',
		);
		expect(createJobIds?.typeOptions).toMatchObject({
			minRequiredFields: bounds.job_ids_min_items,
			maxAllowedFields: bounds.job_ids_max_items,
		});

		const descriptions = node.description.properties
			.map(({ description }) => description ?? '')
			.join('\n');
		expect(descriptions).toContain(`${bounds.run_id_max_characters} characters`);
		expect(descriptions).toContain(`${bounds.job_id_max_utf8_bytes} UTF-8 bytes`);
		expect(descriptions).toContain(`${bounds.idempotency_key_max_characters} characters`);
		expect(descriptions).toContain(`${bounds.trigger_max_characters} characters`);
		expect(descriptions).toContain(`${bounds.platform_max_characters} characters`);
		expect(descriptions).toContain(
			`${bounds.url_max_characters.toLocaleString('en-US')} characters`,
		);
		expect(descriptions).toContain(`${bounds.expected_title_max_characters} characters`);
		expect(descriptions).toContain(`${bounds.expected_company_max_characters} characters`);
	});
});
