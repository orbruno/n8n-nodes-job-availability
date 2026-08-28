import type { INodeProperties } from 'n8n-workflow';
import { availabilityRunCancelDescription } from './cancel';
import { availabilityRunCreateDescription } from './create';
import { availabilityRunCreateScheduledDescription } from './create-scheduled';
import { availabilityRunFinalizeDescription } from './finalize';
import { availabilityRunGetDescription } from './get';

const showOnlyForAvailabilityRun = {
	resource: ['availabilityRun'],
};

export const availabilityRunDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForAvailabilityRun,
		},
		options: [
			{
				name: 'Cancel',
				value: 'cancel',
				action: 'Cancel an availability run',
				description: 'Cancel a run permanently; recovery creates a new run',
				routing: {
					request: {
						method: 'POST',
						url: "={{'/v1/availability/runs/' + encodeURIComponent($parameter.runId) + '/cancel'}}",
					},
				},
			},
			{
				name: 'Create',
				value: 'create',
				action: 'Create an availability run',
				description: 'Create a run for 1 to 100 explicit existing job IDs',
				routing: {
					request: {
						body: { schema_version: 1 },
						method: 'POST',
						url: '/v1/availability/runs',
					},
				},
			},
			{
				name: 'Create Scheduled',
				value: 'createScheduled',
				action: 'Create a scheduled availability run',
				description: 'Create one run from the complete canonical inventory of 1 to 1,000 jobs',
				routing: {
					request: {
						body: { schema_version: 1 },
						method: 'POST',
						url: '/v1/availability/runs/scheduled',
					},
				},
			},
			{
				name: 'Finalize',
				value: 'finalize',
				action: 'Finalize an availability run',
				description: 'Finalize a run after all pending jobs have been processed',
				routing: {
					request: {
						method: 'POST',
						url: "={{'/v1/availability/runs/' + encodeURIComponent($parameter.runId) + '/finalize'}}",
					},
				},
			},
			{
				name: 'Get',
				value: 'get',
				action: 'Get an availability run',
				description: 'Get bounded status, counts, job IDs, and errors for a run',
				routing: {
					request: {
						method: 'GET',
						url: "={{'/v1/availability/runs/' + encodeURIComponent($parameter.runId)}}",
					},
				},
			},
		],
		default: 'create',
	},
	...availabilityRunCancelDescription,
	...availabilityRunCreateDescription,
	...availabilityRunCreateScheduledDescription,
	...availabilityRunFinalizeDescription,
	...availabilityRunGetDescription,
];
