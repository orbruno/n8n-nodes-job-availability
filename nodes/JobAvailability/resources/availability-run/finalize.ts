import type { INodeProperties } from 'n8n-workflow';

const showOnlyForAvailabilityRunFinalize = {
	operation: ['finalize'],
	resource: ['availabilityRun'],
};

export const availabilityRunFinalizeDescription: INodeProperties[] = [
	{
		displayName: 'Run ID',
		name: 'runId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: showOnlyForAvailabilityRunFinalize },
		description: 'Server-issued run identifier, up to 128 characters',
	},
	{
		displayName: 'Idempotency Key',
		name: 'idempotencyKey',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'execution-123:finalize',
		displayOptions: { show: showOnlyForAvailabilityRunFinalize },
		description: 'Unique visible-ASCII request key, from 1 to 128 characters',
		routing: {
			request: {
				headers: {
					'Idempotency-Key': '={{$value}}',
				},
			},
		},
	},
];
