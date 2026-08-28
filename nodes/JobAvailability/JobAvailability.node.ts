import { NodeConnectionTypes, type INodeType, type INodeTypeDescription } from 'n8n-workflow';
import { availabilityRunDescription } from './resources/availability-run';
import { jobDescription } from './resources/job';
import { postingDescription } from './resources/posting';

export class JobAvailability implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Job Availability',
		name: 'jobAvailability',
		icon: { light: 'file:jobAvailability.svg', dark: 'file:jobAvailability.dark.svg' },
		group: ['input'],
		version: 1,
		subtitle: '={{$parameter["resource"] + ": " + $parameter["operation"]}}',
		description: 'Observe job postings and manage durable availability runs',
		defaults: {
			name: 'Job Availability',
		},
		usableAsTool: false as never,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [{ name: 'jobAvailabilityApi', required: true }],
		requestDefaults: {
			baseURL:
				'={{$credentials.baseUrl.endsWith("/") ? $credentials.baseUrl.slice(0, -1) : $credentials.baseUrl}}',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
				'X-N8N-Execution-Id': '={{$execution.id}}',
			},
		},
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Availability Run',
						value: 'availabilityRun',
					},
					{
						name: 'Job',
						value: 'job',
					},
					{
						name: 'Posting',
						value: 'posting',
					},
				],
				default: 'posting',
			},
			...availabilityRunDescription,
			...jobDescription,
			...postingDescription,
		],
	};
}
