import { 
    Graph, 
    Node, 
    Edge, 
    NodeType, 
    EdgeType,
    DeveloperNode,
    AISuggestionNode,
    CodeBlockNode,
    FileNode,
    TestNode,
    CommitNode
  } from '@fasttrack-ai/core';
  
  /**
   * GraphManager class for interfacing with the graph data structure
   * This is a simplified version that delegates to the core module's GraphManager
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
    createCodeBlockNode(id: string, fileId: string, startLine: number, endLine: number, content: string): CodeBlockNode {
      const node: CodeBlockNode = {
        id,
        type: NodeType.CodeBlock,
        fileId,
        startLine,
        endLine,
        content,
        lastModified: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
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
    createCommitNode(id: string, hash: string, message: string, timestamp: string, authorId: string): CommitNode {
      const node: CommitNode = {
        id,
        type: NodeType.Commit,
        hash,
        message,
        timestamp,
        authorId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      this.addNode(node);
      return node;
    }
    
    /**
     * Find code blocks that have no associated tests
     */
    findUntestedCodeBlocks(): CodeBlockNode[] {
      const codeBlocks = this.graph.nodes.filter(
        node => node.type === NodeType.CodeBlock
      ) as CodeBlockNode[];
      
      return codeBlocks.filter(codeBlock => {
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
        const aiGeneratedEdges = this.graph.edges.filter(
          edge => edge.target === codeBlock.id && edge.type === EdgeType.Generated
        );
        
        if (aiGeneratedEdges.length === 0) {
          return false;
        }
        
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
      const fileCounts = new Map<string, number>();
      
      const aiGeneratedEdges = this.graph.edges.filter(
        edge => edge.type === EdgeType.Generated
      );
      
      for (const edge of aiGeneratedEdges) {
        const codeBlock = this.graph.nodes.find(
          node => node.id === edge.target && node.type === NodeType.CodeBlock
        ) as CodeBlockNode | undefined;
        
        if (codeBlock) {
          const fileId = codeBlock.fileId;
          fileCounts.set(fileId, (fileCounts.get(fileId) || 0) + 1);
        }
      }
      
      const result = Array.from(fileCounts.entries()).map(([fileId, count]) => ({ fileId, count }));
      result.sort((a, b) => b.count - a.count);
      
      return result.slice(0, limit);
    }

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

    /**
     * Update a file in the graph
     */
    updateFile(filePath: string): void {
      // Find or create file node
      let fileNode = this.graph.nodes.find(node => 
        node.type === NodeType.File && (node as FileNode).path === filePath
      ) as FileNode;

      if (!fileNode) {
        fileNode = this.createFileNode(
          `file_${Date.now()}`,
          filePath,
          this._getFileLanguage(filePath)
        );
      } else {
        // Update the file node's timestamp
        fileNode.updatedAt = new Date().toISOString();
      }
    }

    /**
     * Get the language of a file based on its extension
     */
    private _getFileLanguage(filePath: string): string {
      const extension = filePath.split('.').pop()?.toLowerCase();
      switch (extension) {
        case 'ts':
          return 'typescript';
        case 'js':
          return 'javascript';
        case 'py':
          return 'python';
        case 'java':
          return 'java';
        default:
          return 'unknown';
      }
    }
  }