import { describe, expect, it } from 'vitest';
import { JobAvailabilityApi } from '../credentials/JobAvailabilityApi.credentials';
import { JobAvailability } from '../nodes/JobAvailability/JobAvailability.node';
import nodeMetadataDocument from '../nodes/JobAvailability/JobAvailability.node.json';
import manifestDocument from '../package.json';

const nodeMetadata = nodeMetadataDocument as Record<string, unknown>;
const manifest = manifestDocument as Record<string, unknown>;

describe('package manifest and metadata', () => {
	it('registers only the intended node and credential', () => {
		expect(manifest.name).toBe('n8n-nodes-job-availability');
		expect(manifest.n8n).toEqual({
			n8nNodesApiVersion: 1,
			strict: true,
			credentials: ['dist/credentials/JobAvailabilityApi.credentials.js'],
			nodes: ['dist/nodes/JobAvailability/JobAvailability.node.js'],
		});
		expect(manifest).not.toHaveProperty('dependencies');
		expect(manifest.peerDependencies).toEqual({ 'n8n-workflow': '*' });
	});

	it('uses the fully qualified node identifier in metadata', () => {
		const node = new JobAvailability();
		expect(nodeMetadata.node).toBe(`${manifest.name}.${node.description.name}`);
		expect(nodeMetadata.node).toBe('n8n-nodes-job-availability.jobAvailability');
	});

	it('exposes the declarative surface through n8n app tools', () => {
		const node = new JobAvailability();
		expect(node.description.usableAsTool).toBe(true);
		expect(node.description.inputs).toHaveLength(1);
		expect(node.description.outputs).toHaveLength(1);
		expect(Object.getOwnPropertyNames(Object.getPrototypeOf(node))).not.toContain('execute');
	});

	it('declares generic bearer authentication and an authenticated readiness test', () => {
		const credential = new JobAvailabilityApi();
		const token = credential.properties.find((property) => property.name === 'serviceToken');
		const baseUrl = credential.properties.find((property) => property.name === 'baseUrl');

		expect(credential.icon).toEqual({
			light: 'file:jobAvailabilityApi.svg',
			dark: 'file:jobAvailabilityApi.dark.svg',
		});
		expect(token?.typeOptions?.password).toBe(true);
		expect(baseUrl).toMatchObject({ required: true, validateType: 'url' });
		expect(typeof credential.authenticate).toBe('object');
		expect(credential.authenticate).toMatchObject({
			type: 'generic',
			properties: {
				headers: { Authorization: '=Bearer {{$credentials.serviceToken}}' },
			},
		});
		expect(credential.test?.request).toMatchObject({
			method: 'GET',
			url: '/v1/credentials/test',
		});
	});

	it('pins the captured development tools while preserving the peer wildcard', () => {
		expect(manifest.engines).toEqual({ node: '>=22.22.0' });
		expect(manifest.packageManager).toBe('npm@11.6.2');
		expect(manifest.devDependencies).toMatchObject({
			'@n8n/node-cli': '0.46.0',
			'@n8n/scan-community-package': '0.33.0',
			eslint: '9.32.0',
			prettier: '3.6.2',
			'release-it': '19.2.4',
			typescript: '5.9.2',
			vitest: '4.1.9',
		});
	});
});
