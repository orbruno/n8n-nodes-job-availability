import type { INodeProperties } from 'n8n-workflow';

const showOnlyForAvailabilityRunCreateScheduled = {
	operation: ['createScheduled'],
	resource: ['availabilityRun'],
};

export const availabilityRunCreateScheduledDescription: INodeProperties[] = [
	{
		displayName: 'Idempotency Key',
		name: 'idempotencyKey',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'execution-123:create-scheduled',
		displayOptions: { show: showOnlyForAvailabilityRunCreateScheduled },
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
