import type { INodeProperties } from 'n8n-workflow';

const showOnlyForAvailabilityRunCancel = {
	operation: ['cancel'],
	resource: ['availabilityRun'],
};

export const availabilityRunCancelDescription: INodeProperties[] = [
	{
		displayName: 'Run ID',
		name: 'runId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: showOnlyForAvailabilityRunCancel },
		description: 'Server-issued run identifier, up to 128 characters',
	},
	{
		displayName: 'Idempotency Key',
		name: 'idempotencyKey',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'execution-123:cancel',
		displayOptions: { show: showOnlyForAvailabilityRunCancel },
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
