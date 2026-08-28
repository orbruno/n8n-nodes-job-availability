import type { INodeProperties } from 'n8n-workflow';

const showOnlyForPostingObserve = {
	operation: ['observe'],
	resource: ['posting'],
};

export const postingObserveDescription: INodeProperties[] = [
	{
		displayName: 'Platform',
		name: 'platform',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'Example Board',
		displayOptions: { show: showOnlyForPostingObserve },
		description: 'Source platform label, from 1 to 64 characters',
		routing: {
			send: {
				type: 'body',
				property: 'platform',
			},
		},
	},
	{
		displayName: 'URL',
		name: 'url',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'https://jobs.example.invalid/postings/example-123',
		validateType: 'url',
		displayOptions: { show: showOnlyForPostingObserve },
		description:
			'Public HTTP or HTTPS posting URL, from 1 to 2,048 characters and without embedded credentials',
		routing: {
			send: {
				type: 'body',
				property: 'url',
			},
		},
	},
	{
		displayName: 'Expected Title',
		name: 'expectedTitle',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: showOnlyForPostingObserve },
		description: 'Expected posting title, from 1 to 300 characters',
		routing: {
			send: {
				type: 'body',
				property: 'expected_title',
			},
		},
	},
	{
		displayName: 'Expected Company',
		name: 'expectedCompany',
		type: 'string',
		default: '',
		displayOptions: { show: showOnlyForPostingObserve },
		description: 'Expected company name, up to 200 characters',
		routing: {
			send: {
				type: 'body',
				property: 'expected_company',
			},
		},
	},
	{
		displayName: 'Idempotency Key',
		name: 'idempotencyKey',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'execution-123:observe',
		displayOptions: { show: showOnlyForPostingObserve },
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
