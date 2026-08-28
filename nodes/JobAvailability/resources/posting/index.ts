import type { INodeProperties } from 'n8n-workflow';
import { postingObserveDescription } from './observe';

const showOnlyForPosting = {
	resource: ['posting'],
};

export const postingDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForPosting,
		},
		options: [
			{
				name: 'Observe',
				value: 'observe',
				action: 'Observe a posting',
				description: 'Observe one posting without creating or updating a canonical job',
				routing: {
					request: {
						body: { schema_version: 1 },
						method: 'POST',
						url: '/v1/postings/observe',
					},
				},
			},
		],
		default: 'observe',
	},
	...postingObserveDescription,
];
