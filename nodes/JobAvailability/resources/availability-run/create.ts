import type { INodeProperties } from 'n8n-workflow';

const showOnlyForAvailabilityRunCreate = {
	operation: ['create'],
	resource: ['availabilityRun'],
};

export const availabilityRunCreateDescription: INodeProperties[] = [
	{
		displayName: 'Job IDs',
		name: 'jobIds',
		type: 'collection',
		typeOptions: {
			multipleValues: true,
			multipleValueButtonText: 'Add Job ID',
			minRequiredFields: 1,
			maxAllowedFields: 100,
		},
		required: true,
		default: { jobId: '' },
		placeholder: 'Add Job ID',
		displayOptions: { show: showOnlyForAvailabilityRunCreate },
		description: 'Unique existing job IDs to include, from 1 to 100 entries',
		options: [
			{
				displayName: 'Job ID',
				name: 'jobId',
				type: 'string',
				default: '',
				placeholder: 'München–synthetic-role-001',
				description:
					'Canonical job identifier matched by NFC equivalence, up to 255 UTF-8 bytes',
			},
		],
		routing: {
			send: {
				type: 'body',
				property: 'job_ids',
				value: '={{$value.map((entry) => entry.jobId)}}',
			},
		},
	},
	{
		displayName: 'Trigger',
		name: 'trigger',
		type: 'string',
		required: true,
		default: 'manual',
		displayOptions: { show: showOnlyForAvailabilityRunCreate },
		description: 'Operator-facing trigger label, from 1 to 64 characters',
		routing: {
			send: {
				type: 'body',
				property: 'trigger',
			},
		},
	},
	{
		displayName: 'Idempotency Key',
		name: 'idempotencyKey',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'execution-123:create',
		displayOptions: { show: showOnlyForAvailabilityRunCreate },
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
