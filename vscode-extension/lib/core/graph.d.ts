/**
 * Graph operations for FastTrack AI
 */
import { Node, Edge, NodeType, EdgeType, Graph, DeveloperNode, AISuggestionNode, CodeBlockNode, FileNode, TestNode, CommitNode } from './models';
/**
 * Graph Manager class for performing operations on the graph
 */
export declare class GraphManager {
    private graph;
    constructor(graph?: Graph);
    /**
     * Get the current graph
     */
    getGraph(): Graph;
    /**
     * Set the graph
     */
    setGraph(graph: Graph): void;
    /**
     * Find a node by ID
     */
    findNodeById(id: string): Node | undefined;
    /**
     * Find nodes by type
     */
    findNodesByType(type: NodeType): Node[];
    /**
     * Find edges by type
     */
    findEdgesByType(type: EdgeType): Edge[];
    /**
     * Find edges by source node ID
     */
    findEdgesBySource(sourceId: string): Edge[];
    /**
     * Find edges by target node ID
     */
    findEdgesByTarget(targetId: string): Edge[];
    /**
     * Add a node to the graph
     */
    addNode(node: Node): void;
    /**
     * Add an edge to the graph
     */
    addEdge(edge: Edge): void;
    /**
     * Remove a node from the graph
     */
    removeNode(id: string): void;
    /**
     * Remove an edge from the graph
     */
    removeEdge(id: string): void;
    /**
     * Find code blocks that have no associated tests
     */
    findUntestedCodeBlocks(): CodeBlockNode[];
    /**
     * Find AI-generated code blocks that have not been modified in X days
     */
    findStaleAIGeneratedBlocks(days: number): CodeBlockNode[];
    /**
     * Find files with the most AI-generated code
     */
    findFilesWithMostAICode(limit?: number): Array<{
        fileId: string;
        count: number;
    }>;
    /**
     * Create a new developer node
     */
    createDeveloperNode(id: string, name: string, email?: string): DeveloperNode;
    /**
     * Create a new AI suggestion node
     */
    createAISuggestionNode(id: string, aiTool: string): AISuggestionNode;
    /**
     * Create a new code block node
     */
    createCodeBlockNode(id: string, fileId: string, startLine: number, endLine: number, content: string): CodeBlockNode;
    /**
     * Create a new file node
     */
    createFileNode(id: string, path: string, language: string): FileNode;
    /**
     * Create a new test node
     */
    createTestNode(id: string, path: string, testedCodeBlockIds?: string[]): TestNode;
    /**
     * Create a new commit node
     */
    createCommitNode(id: string, hash: string, message: string, authorId: string): CommitNode;
    /**
     * Create an edge between two nodes
     */
    createEdge(id: string, type: EdgeType, sourceId: string, targetId: string): Edge;
}
