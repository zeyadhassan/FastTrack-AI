/**
 * Node and edge type definitions for the FastTrack AI graph
 */

// Node Types
export enum NodeType {
    Developer = 'Developer',
    AI_Suggestion = 'AI_Suggestion',
    CodeBlock = 'CodeBlock',
    File = 'File',
    Test = 'Test',
    Commit = 'Commit'
  }
  
  // Edge Types
  export enum EdgeType {
    Generated = 'generated',
    Authored = 'authored',
    Modified = 'modified',
    LinkedTo = 'linked_to',
    TestedBy = 'tested_by',
    UnchangedFor = 'unchanged_for'
  }
  
  // Base Node interface
  export interface Node {
    id: string;
    type: NodeType;
    createdAt: string; // ISO date string
    updatedAt: string; // ISO date string
  }
  
  // Base Edge interface
  export interface Edge {
    id: string;
    type: EdgeType;
    source: string; // Source node ID
    target: string; // Target node ID
    createdAt: string; // ISO date string
    updatedAt: string; // ISO date string
  }
  
  // Developer Node
  export interface DeveloperNode extends Node {
    type: NodeType.Developer;
    name: string;
    email?: string;
  }
  
  // AI_Suggestion Node
  export interface AISuggestionNode extends Node {
    type: NodeType.AI_Suggestion;
    aiTool: string; // "Copilot", "Cursor", etc.
    timestamp: string; // ISO date string
  }
  
  // CodeBlock Node
  export interface CodeBlockNode extends Node {
    type: NodeType.CodeBlock;
    fileId: string; // Reference to File node
    startLine: number;
    endLine: number;
    content: string;
    complexity?: number; // Cyclomatic complexity
    lastModified: string; // ISO date string
    isTested?: boolean;
  }
  
  // File Node
  export interface FileNode extends Node {
    type: NodeType.File;
    path: string;
    language: string; // "javascript", "typescript", etc.
  }
  
  // Test Node
  export interface TestNode extends Node {
    type: NodeType.Test;
    path: string;
    testedCodeBlockIds: string[]; // Array of CodeBlock IDs this test covers
  }
  
  // Commit Node
  export interface CommitNode extends Node {
    type: NodeType.Commit;
    hash: string;
    message: string;
    timestamp: string; // ISO date string
    authorId: string; // Reference to Developer node
  }
  
  // Graph data structure
  export interface Graph {
    nodes: Node[];
    edges: Edge[];
  }