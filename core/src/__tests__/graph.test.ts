import { GraphOperations } from '../graph';
import { Node, Edge } from '../models';

describe('GraphOperations', () => {
    let graphOps: GraphOperations;

    beforeEach(() => {
        graphOps = new GraphOperations();
    });

    test('should add a node', () => {
        const node: Node = {
            id: '1',
            type: 'code',
            content: 'test code',
            metadata: {}
        };
        graphOps.addNode(node);
        const graph = graphOps.getGraph();
        expect(graph.nodes).toHaveLength(1);
        expect(graph.nodes[0]).toEqual(node);
    });

    test('should add an edge', () => {
        const node1: Node = {
            id: '1',
            type: 'code',
            content: 'test code 1',
            metadata: {}
        };
        const node2: Node = {
            id: '2',
            type: 'code',
            content: 'test code 2',
            metadata: {}
        };
        graphOps.addNode(node1);
        graphOps.addNode(node2);

        const edge: Edge = {
            id: 'edge1',
            source: '1',
            target: '2',
            type: 'depends_on',
            metadata: {}
        };
        graphOps.addEdge(edge);

        const graph = graphOps.getGraph();
        expect(graph.edges).toHaveLength(1);
        expect(graph.edges[0]).toEqual(edge);
    });

    test('should get edges for a node', () => {
        const node1: Node = {
            id: '1',
            type: 'code',
            content: 'test code 1',
            metadata: {}
        };
        const node2: Node = {
            id: '2',
            type: 'code',
            content: 'test code 2',
            metadata: {}
        };
        graphOps.addNode(node1);
        graphOps.addNode(node2);

        const edge: Edge = {
            id: 'edge1',
            source: '1',
            target: '2',
            type: 'depends_on',
            metadata: {}
        };
        graphOps.addEdge(edge);

        const edges = graphOps.getEdgesForNode('1');
        expect(edges).toHaveLength(1);
        expect(edges[0]).toEqual(edge);
    });
}); 