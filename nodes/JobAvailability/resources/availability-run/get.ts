import type { INodeProperties } from 'n8n-workflow';

const showOnlyForAvailabilityRunGet = {
	operation: ['get'],
	resource: ['availabilityRun'],
};

export const availabilityRunGetDescription: INodeProperties[] = [
	{
		displayName: 'Run ID',
		name: 'runId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: showOnlyForAvailabilityRunGet },
		description: 'Server-issued run identifier, up to 128 characters',
	},
];
