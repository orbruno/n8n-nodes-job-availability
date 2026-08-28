import { describe, expect, it } from 'vitest';
import dailyWorkflowDocument from '../examples/job-availability-daily.json';
import observeWorkflowDocument from '../examples/job-availability-observe.json';

type WorkflowNode = {
	name: string;
	type: string;
	parameters: Record<string, unknown>;
	credentials?: unknown;
};

type Workflow = {
	name: string;
	active: boolean;
	nodes: WorkflowNode[];
	connections: Record<string, { main: Array<Array<{ node: string }>> }>;
};

function loadWorkflow(name: string): Workflow {
	return (name === 'job-availability-observe.json'
		? observeWorkflowDocument
		: dailyWorkflowDocument) as Workflow;
}

function assertConnectionTargetsExist(workflow: Workflow): void {
	const names = new Set(workflow.nodes.map((node) => node.name));
	for (const outputs of Object.values(workflow.connections)) {
		for (const channel of outputs.main) {
			for (const connection of channel) expect(names.has(connection.node)).toBe(true);
		}
	}
}

describe('example workflows', () => {
	it('ships an inactive synthetic manual observation workflow', () => {
		const workflow = loadWorkflow('job-availability-observe.json');
		const observe = workflow.nodes.find((node) => node.name === 'Observe Synthetic Posting');

		expect(workflow.active).toBe(false);
		expect(observe).toMatchObject({
			type: 'n8n-nodes-job-availability.jobAvailability',
			parameters: {
				resource: 'posting',
				operation: 'observe',
				platform: 'Synthetic Board',
			},
		});
		expect(observe?.parameters.url).toMatch(/\.invalid\//u);
		expect(workflow.nodes.every((node) => node.credentials === undefined)).toBe(true);
		assertConnectionTargetsExist(workflow);
	});

	it('ships one scheduled run with bounded chunk refresh and finalize boundaries', () => {
		const workflow = loadWorkflow('job-availability-daily.json');
		const create = workflow.nodes.find((node) => node.name === 'Create Scheduled Run');
		const expand = workflow.nodes.find((node) => node.name === 'Expand Pending Jobs');
		const loop = workflow.nodes.find((node) => node.name === 'Loop Jobs');
		const check = workflow.nodes.find((node) => node.name === 'Check Job');
		const get = workflow.nodes.find((node) => node.name === 'Get Run');
		const pending = workflow.nodes.find((node) => node.name === 'Pending Jobs Remain');
		const finalize = workflow.nodes.find((node) => node.name === 'Finalize Run');

		expect(workflow.active).toBe(false);
		expect(create?.parameters).toEqual({
			resource: 'availabilityRun',
			operation: 'createScheduled',
			idempotencyKey: "={{$execution.id + ':create-scheduled'}}",
		});
		expect(expand?.parameters.jsCode).toContain('pending_job_ids');
		expect(expand?.parameters.jsCode).not.toContain('$json.job_ids');
		expect(loop?.parameters.options).toEqual({ reset: '={{$json.reset_chunk === true}}' });
		expect(check?.parameters).toMatchObject({ resource: 'job', operation: 'checkAvailability' });
		expect(get?.parameters).toMatchObject({ resource: 'availabilityRun', operation: 'get' });
		expect(pending?.type).toBe('n8n-nodes-base.if');
		expect(finalize?.parameters).toMatchObject({
			resource: 'availabilityRun',
			operation: 'finalize',
		});
		expect(workflow.connections['Loop Jobs'].main[0]?.[0]?.node).toBe('Prepare Run Refresh');
		expect(workflow.connections['Get Run'].main[0]?.[0]?.node).toBe('Pending Jobs Remain');
		expect(workflow.connections['Pending Jobs Remain'].main[0]?.[0]?.node).toBe(
			'Expand Pending Jobs',
		);
		expect(workflow.connections['Pending Jobs Remain'].main[1]?.[0]?.node).toBe('Finalize Run');
		expect(workflow.nodes.some((node) => node.type === 'n8n-nodes-base.splitInBatches')).toBe(true);
		expect(workflow.nodes.every((node) => node.credentials === undefined)).toBe(true);
		assertConnectionTargetsExist(workflow);
	});

	it.each(['job-availability-observe.json', 'job-availability-daily.json'])(
		'contains no embedded bearer secret in %s',
		(name) => {
			expect(JSON.stringify(loadWorkflow(name))).not.toMatch(/Bearer\s+[A-Za-z0-9_-]{32,}/u);
		},
	);
});
