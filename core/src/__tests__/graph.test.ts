import { GraphManager } from '../graph';
import { NodeType, EdgeType } from '../models';

describe('GraphManager', () => {
  let graphManager: GraphManager;

  beforeEach(() => {
    graphManager = new GraphManager();
  });

  test('should add a node to the graph', () => {
    const node = {
      id: 'test-node-1',
      type: NodeType.Developer,
      name: 'Test Developer',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    graphManager.addNode(node);
    const graph = graphManager.getGraph();
    
    expect(graph.nodes.length).toBe(1);
    expect(graph.nodes[0].id).toBe('test-node-1');
  });

  test('should add an edge to the graph', () => {
    const sourceNode = {
      id: 'source-node',
      type: NodeType.Developer,
      name: 'Source Developer',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const targetNode = {
      id: 'target-node',
      type: NodeType.CodeBlock,
      fileId: 'file-1',
      startLine: 1,
      endLine: 10,
      content: 'test code',
      lastModified: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    graphManager.addNode(sourceNode);
    graphManager.addNode(targetNode);

    const edge = {
      id: 'test-edge-1',
      type: EdgeType.Authored,
      source: 'source-node',
      target: 'target-node',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    graphManager.addEdge(edge);
    const graph = graphManager.getGraph();
    
    expect(graph.edges.length).toBe(1);
    expect(graph.edges[0].id).toBe('test-edge-1');
    expect(graph.edges[0].source).toBe('source-node');
    expect(graph.edges[0].target).toBe('target-node');
  });

  test('should remove a node and its connected edges', () => {
    // Add nodes
    graphManager.createDeveloperNode('dev-1', 'Test Developer');
    graphManager.createFileNode('file-1', '/test/file.js', 'javascript');
    graphManager.createCodeBlockNode('code-1', 'file-1', 1, 10, 'test code');
    
    // Add edges
    graphManager.createEdge('edge-1', EdgeType.Authored, 'dev-1', 'code-1');
    
    // Verify initial state
    let graph = graphManager.getGraph();
    expect(graph.nodes.length).toBe(3);
    expect(graph.edges.length).toBe(1);
    
    // Remove a node
    graphManager.removeNode('dev-1');
    
    // Verify node and connected edge are removed
    graph = graphManager.getGraph();
    expect(graph.nodes.length).toBe(2);
    expect(graph.edges.length).toBe(0);
  });

  test('should find untested code blocks', () => {
    // Create file
    graphManager.createFileNode('file-1', '/test/file.js', 'javascript');
    
    // Create code blocks
    graphManager.createCodeBlockNode('code-1', 'file-1', 1, 10, 'function a() {}');
    graphManager.createCodeBlockNode('code-2', 'file-1', 11, 20, 'function b() {}');
    
    // Create test
    graphManager.createTestNode('test-1', '/test/file.test.js', ['code-1']);
    
    // Create edges
    graphManager.createEdge('edge-1', EdgeType.TestedBy, 'code-1', 'test-1');
    
    // Find untested code blocks
    const untestedBlocks = graphManager.findUntestedCodeBlocks();
    
    expect(untestedBlocks.length).toBe(1);
    expect(untestedBlocks[0].id).toBe('code-2');
  });
});