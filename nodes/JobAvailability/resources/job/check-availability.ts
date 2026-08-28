import type { INodeProperties } from 'n8n-workflow';

const showOnlyForJobCheckAvailability = {
	operation: ['checkAvailability'],
	resource: ['job'],
};

export const jobCheckAvailabilityDescription: INodeProperties[] = [
	{
		displayName: 'Run ID',
		name: 'runId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: showOnlyForJobCheckAvailability },
		description: 'Server-issued run identifier, up to 128 characters',
	},
	{
		displayName: 'Job ID',
		name: 'jobId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: showOnlyForJobCheckAvailability },
		description: 'Canonical job identifier matched by NFC equivalence, up to 255 UTF-8 bytes',
	},
	{
		displayName: 'Idempotency Key',
		name: 'idempotencyKey',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'execution-123:check:München-role-001',
		displayOptions: { show: showOnlyForJobCheckAvailability },
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
