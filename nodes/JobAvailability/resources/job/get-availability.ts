import type { INodeProperties } from 'n8n-workflow';

const showOnlyForJobGetAvailability = {
	operation: ['getAvailability'],
	resource: ['job'],
};

export const jobGetAvailabilityDescription: INodeProperties[] = [
	{
		displayName: 'Job ID',
		name: 'jobId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: showOnlyForJobGetAvailability },
		description: 'Canonical job identifier matched by NFC equivalence, up to 255 UTF-8 bytes',
	},
];
