import { describe, expect, it } from 'vitest';
import aiToolWorkflowDocument from '../examples/job-availability-ai-tool.json';
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
	connections: Record<string, Record<string, Array<Array<{ node: string }>>>>;
};

function loadWorkflow(name: string): Workflow {
	if (name === 'job-availability-observe.json') return observeWorkflowDocument as Workflow;
	if (name === 'job-availability-ai-tool.json') return aiToolWorkflowDocument as Workflow;
	return dailyWorkflowDocument as Workflow;
}

function assertConnectionTargetsExist(workflow: Workflow): void {
	const names = new Set(workflow.nodes.map((node) => node.name));
	for (const outputs of Object.values(workflow.connections)) {
		for (const channels of Object.values(outputs)) {
			for (const channel of channels) {
				for (const connection of channel) expect(names.has(connection.node)).toBe(true);
			}
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

	it('ships an inactive posting-observation tool with fixed authority boundaries', () => {
		const workflow = loadWorkflow('job-availability-ai-tool.json');
		const tool = workflow.nodes.find((node) => node.name === 'Observe Public Posting');

		expect(workflow.active).toBe(false);
		expect(tool).toMatchObject({
			type: 'n8n-nodes-job-availability.jobAvailabilityTool',
			parameters: {
				resource: 'posting',
				operation: 'observe',
				platform: 'Public Job Board',
				idempotencyKey: "={{$execution.id + ':ai-tool-observe'}}",
			},
		});
		expect(tool?.parameters.url).toContain("$fromAI('url'");
		expect(tool?.parameters.expectedTitle).toContain("$fromAI('expected_title'");
		expect(tool?.parameters.expectedCompany).toContain("$fromAI('expected_company'");
		expect(tool?.parameters.idempotencyKey).not.toContain('$fromAI');
		expect(workflow.connections['Observe Public Posting'].ai_tool[0]?.[0]?.node).toBe('AI Agent');
		expect(workflow.connections['Chat Model'].ai_languageModel[0]?.[0]?.node).toBe('AI Agent');
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

	it.each([
		'job-availability-observe.json',
		'job-availability-daily.json',
		'job-availability-ai-tool.json',
	])(
		'contains no embedded bearer secret in %s',
		(name) => {
			expect(JSON.stringify(loadWorkflow(name))).not.toMatch(/Bearer\s+[A-Za-z0-9_-]{32,}/u);
		},
	);
});
