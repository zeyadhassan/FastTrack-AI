/**
 * Graph operations for FastTrack AI
 */

import { 
    Node, Edge, NodeType, EdgeType, Graph,
    DeveloperNode, AISuggestionNode, CodeBlockNode, FileNode, TestNode, CommitNode
  } from './models';
  
  /**
   * Graph Manager class for performing operations on the graph
   */
  export class GraphManager {
    private graph: Graph;
  
    constructor(graph?: Graph) {
      this.graph = graph || { nodes: [], edges: [] };
    }
  
    /**
     * Get the current graph
     */
    getGraph(): Graph {
      return this.graph;
    }
  
    /**
     * Set the graph
     */
    setGraph(graph: Graph): void {
      this.graph = graph;
    }
  
    /**
     * Find a node by ID
     */
    findNodeById(id: string): Node | undefined {
      return this.graph.nodes.find(node => node.id === id);
    }
  
    /**
     * Find nodes by type
     */
    findNodesByType(type: NodeType): Node[] {
      return this.graph.nodes.filter(node => node.type === type);
    }
  
    /**
     * Find edges by type
     */
    findEdgesByType(type: EdgeType): Edge[] {
      return this.graph.edges.filter(edge => edge.type === type);
    }
  
    /**
     * Find edges by source node ID
     */
    findEdgesBySource(sourceId: string): Edge[] {
      return this.graph.edges.filter(edge => edge.source === sourceId);
    }
  
    /**
     * Find edges by target node ID
     */
    findEdgesByTarget(targetId: string): Edge[] {
      return this.graph.edges.filter(edge => edge.target === targetId);
    }
  
    /**
     * Add a node to the graph
     */
    addNode(node: Node): void {
      // Check if node with same ID already exists
      const existingNodeIndex = this.graph.nodes.findIndex(n => n.id === node.id);
      
      if (existingNodeIndex !== -1) {
        // Replace existing node
        this.graph.nodes[existingNodeIndex] = {
          ...node,
          updatedAt: new Date().toISOString()
        };
      } else {
        // Add new node
        this.graph.nodes.push({
          ...node,
          createdAt: node.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
    }
  
    /**
     * Add an edge to the graph
     */
    addEdge(edge: Edge): void {
      // Check if edge with same ID already exists
      const existingEdgeIndex = this.graph.edges.findIndex(e => e.id === edge.id);
      
      if (existingEdgeIndex !== -1) {
        // Replace existing edge
        this.graph.edges[existingEdgeIndex] = {
          ...edge,
          updatedAt: new Date().toISOString()
        };
      } else {
        // Add new edge
        this.graph.edges.push({
          ...edge,
          createdAt: edge.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
    }
  
    /**
     * Remove a node from the graph
     */
    removeNode(id: string): void {
      // Remove the node
      this.graph.nodes = this.graph.nodes.filter(node => node.id !== id);
      
      // Remove all edges connected to this node
      this.graph.edges = this.graph.edges.filter(
        edge => edge.source !== id && edge.target !== id
      );
    }
  
    /**
     * Remove an edge from the graph
     */
    removeEdge(id: string): void {
      this.graph.edges = this.graph.edges.filter(edge => edge.id !== id);
    }
  
    /**
     * Find code blocks that have no associated tests
     */
    findUntestedCodeBlocks(): CodeBlockNode[] {
      const codeBlocks = this.graph.nodes.filter(
        node => node.type === NodeType.CodeBlock
      ) as CodeBlockNode[];
      
      return codeBlocks.filter(codeBlock => {
        // Find edges where this code block is the source and the edge type is TestedBy
        const testedByEdges = this.graph.edges.filter(
          edge => edge.source === codeBlock.id && edge.type === EdgeType.TestedBy
        );
        
        return testedByEdges.length === 0;
      });
    }
  
    /**
     * Find AI-generated code blocks that have not been modified in X days
     */
    findStaleAIGeneratedBlocks(days: number): CodeBlockNode[] {
      const now = new Date();
      const codeBlocks = this.graph.nodes.filter(
        node => node.type === NodeType.CodeBlock
      ) as CodeBlockNode[];
      
      return codeBlocks.filter(codeBlock => {
        // Check if the code block is AI-generated
        const aiGeneratedEdges = this.graph.edges.filter(
          edge => edge.target === codeBlock.id && edge.type === EdgeType.Generated
        );
        
        if (aiGeneratedEdges.length === 0) {
          return false;
        }
        
        // Check if the code block has not been modified in X days
        const lastModified = new Date(codeBlock.lastModified);
        const diffTime = Math.abs(now.getTime() - lastModified.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return diffDays >= days;
      });
    }
  
    /**
     * Find files with the most AI-generated code
     */
    findFilesWithMostAICode(limit = 10): Array<{ fileId: string, count: number }> {
      // Map to count AI-generated code blocks per file
      const fileCounts = new Map<string, number>();
      
      // Find all AI-generated code blocks
      const aiGeneratedEdges = this.graph.edges.filter(
        edge => edge.type === EdgeType.Generated
      );
      
      // For each AI-generated edge, find the target code block and increment the count for its file
      for (const edge of aiGeneratedEdges) {
        const codeBlock = this.graph.nodes.find(
          node => node.id === edge.target && node.type === NodeType.CodeBlock
        ) as CodeBlockNode | undefined;
        
        if (codeBlock) {
          const fileId = codeBlock.fileId;
          fileCounts.set(fileId, (fileCounts.get(fileId) || 0) + 1);
        }
      }
      
      // Convert the map to an array and sort by count in descending order
      const result = Array.from(fileCounts.entries()).map(([fileId, count]) => ({ fileId, count }));
      result.sort((a, b) => b.count - a.count);
      
      // Return the top N results
      return result.slice(0, limit);
    }
  
    /**
     * Create a new developer node
     */
    createDeveloperNode(id: string, name: string, email?: string): DeveloperNode {
      const node: DeveloperNode = {
        id,
        type: NodeType.Developer,
        name,
        email,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      this.addNode(node);
      return node;
    }
  
    /**
     * Create a new AI suggestion node
     */
    createAISuggestionNode(id: string, aiTool: string): AISuggestionNode {
      const timestamp = new Date().toISOString();
      const node: AISuggestionNode = {
        id,
        type: NodeType.AI_Suggestion,
        aiTool,
        timestamp,
        createdAt: timestamp,
        updatedAt: timestamp
      };
      
      this.addNode(node);
      return node;
    }
  
    /**
     * Create a new code block node
     */
    createCodeBlockNode(
      id: string,
      fileId: string,
      startLine: number,
      endLine: number,
      content: string
    ): CodeBlockNode {
      const timestamp = new Date().toISOString();
      const node: CodeBlockNode = {
        id,
        type: NodeType.CodeBlock,
        fileId,
        startLine,
        endLine,
        content,
        lastModified: timestamp,
        createdAt: timestamp,
        updatedAt: timestamp
      };
      
      this.addNode(node);
      return node;
    }
  
    /**
     * Create a new file node
     */
    createFileNode(id: string, path: string, language: string): FileNode {
      const node: FileNode = {
        id,
        type: NodeType.File,
        path,
        language,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      this.addNode(node);
      return node;
    }
  
    /**
     * Create a new test node
     */
    createTestNode(id: string, path: string, testedCodeBlockIds: string[] = []): TestNode {
      const node: TestNode = {
        id,
        type: NodeType.Test,
        path,
        testedCodeBlockIds,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      this.addNode(node);
      return node;
    }
  
    /**
     * Create a new commit node
     */
    createCommitNode(id: string, hash: string, message: string, authorId: string): CommitNode {
      const timestamp = new Date().toISOString();
      const node: CommitNode = {
        id,
        type: NodeType.Commit,
        hash,
        message,
        timestamp,
        authorId,
        createdAt: timestamp,
        updatedAt: timestamp
      };
      
      this.addNode(node);
      return node;
    }
  
    /**
     * Create an edge between two nodes
     */
    createEdge(id: string, type: EdgeType, sourceId: string, targetId: string): Edge {
      const edge: Edge = {
        id,
        type,
        source: sourceId,
        target: targetId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      this.addEdge(edge);
      return edge;
    }
  }