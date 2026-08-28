import { describe, expect, it } from 'vitest';
import type { INodeProperties, INodePropertyOptions } from 'n8n-workflow';
import { JobAvailabilityApi } from '../credentials/JobAvailabilityApi.credentials';
import { JobAvailability } from '../nodes/JobAvailability/JobAvailability.node';
import routingGoldenDocument from './fixtures/job-availability-routing.golden.json';

type GoldenOperation = (typeof routingGoldenDocument.operations)[number];

const node = new JobAvailability();

function operationOption(resource: string, operation: string): INodePropertyOptions {
	const operationProperty = node.description.properties.find(
		(property) =>
			property.name === 'operation' &&
			(property.displayOptions?.show?.resource ?? []).includes(resource),
	);
	const option = operationProperty?.options?.find(
		(candidate) => 'value' in candidate && candidate.value === operation,
	) as INodePropertyOptions | undefined;

	if (!option) throw new Error(`Missing ${resource}/${operation}`);
	return option;
}

function routedParameters(resource: string, operation: string): INodeProperties[] {
	return node.description.properties
		.filter(
			(property) =>
				(property.displayOptions?.show?.resource ?? []).includes(resource) &&
				(property.displayOptions?.show?.operation ?? []).includes(operation) &&
				(property.routing?.send !== undefined || property.routing?.request?.headers !== undefined),
		)
		.sort((left, right) => left.name.localeCompare(right.name));
}

function actualOperation(expected: GoldenOperation): GoldenOperation {
	const [resource, operation] = expected.id.split('.');
	const option = operationOption(resource, operation);
	const request = option.routing?.request;
	const parameterRouting = routedParameters(resource, operation).map((property) => ({
		parameter: property.name,
		...(property.routing?.request?.headers
			? { request_headers: property.routing.request.headers }
			: {}),
		...(property.routing?.send ? { send: property.routing.send } : {}),
	}));

	return JSON.parse(
		JSON.stringify({
			id: expected.id,
			request: {
				body: request?.body ?? null,
				method: request?.method,
				url: request?.url,
			},
			parameter_routing: parameterRouting,
		}),
	) as GoldenOperation;
}

describe('declarative routing golden fixture', () => {
	it('matches credentials and request defaults exactly', () => {
		const credential = new JobAvailabilityApi();
		const actual = {
			credential: {
				authentication: {
					type: credential.authenticate.type,
					headers: credential.authenticate.properties.headers,
				},
				test: credential.test?.request,
			},
			request_defaults: node.description.requestDefaults,
		};

		expect(actual).toEqual({
			credential: routingGoldenDocument.credential,
			request_defaults: routingGoldenDocument.request_defaults,
		});
	});

	it('matches every operation and routed parameter exactly', () => {
		const actual = routingGoldenDocument.operations.map((operation) => actualOperation(operation));
		expect(actual).toEqual(routingGoldenDocument.operations);
	});
});
