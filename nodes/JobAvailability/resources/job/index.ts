import type { INodeProperties } from 'n8n-workflow';
import { jobCheckAvailabilityDescription } from './check-availability';
import { jobGetAvailabilityDescription } from './get-availability';

const showOnlyForJob = {
	resource: ['job'],
};

export const jobDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForJob,
		},
		options: [
			{
				name: 'Check Availability',
				value: 'checkAvailability',
				action: 'Check job availability',
				description: 'Check one registered job within a durable availability run',
				routing: {
					request: {
						method: 'POST',
						url: "={{'/v1/availability/runs/' + encodeURIComponent($parameter.runId) + '/jobs/' + encodeURIComponent($parameter.jobId) + '/check'}}",
					},
				},
			},
			{
				name: 'Get Availability',
				value: 'getAvailability',
				action: 'Get job availability',
				description: 'Get the current bounded availability state for a registered job',
				routing: {
					request: {
						method: 'GET',
						url: "={{'/v1/jobs/' + encodeURIComponent($parameter.jobId) + '/availability'}}",
					},
				},
			},
		],
		default: 'checkAvailability',
	},
	...jobCheckAvailabilityDescription,
	...jobGetAvailabilityDescription,
];
