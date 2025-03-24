/**
 * Node and edge type definitions for the FastTrack AI graph
 */
export declare enum NodeType {
    Developer = "Developer",
    AI_Suggestion = "AI_Suggestion",
    CodeBlock = "CodeBlock",
    File = "File",
    Test = "Test",
    Commit = "Commit"
}
export declare enum EdgeType {
    Generated = "generated",
    Authored = "authored",
    Modified = "modified",
    LinkedTo = "linked_to",
    TestedBy = "tested_by",
    UnchangedFor = "unchanged_for"
}
export interface Node {
    id: string;
    type: NodeType;
    createdAt: string;
    updatedAt: string;
}
export interface Edge {
    id: string;
    type: EdgeType;
    source: string;
    target: string;
    createdAt: string;
    updatedAt: string;
}
export interface DeveloperNode extends Node {
    type: NodeType.Developer;
    name: string;
    email?: string;
}
export interface AISuggestionNode extends Node {
    type: NodeType.AI_Suggestion;
    aiTool: string;
    timestamp: string;
}
export interface CodeBlockNode extends Node {
    type: NodeType.CodeBlock;
    fileId: string;
    startLine: number;
    endLine: number;
    content: string;
    complexity?: number;
    lastModified: string;
    isTested?: boolean;
}
export interface FileNode extends Node {
    type: NodeType.File;
    path: string;
    language: string;
}
export interface TestNode extends Node {
    type: NodeType.Test;
    path: string;
    testedCodeBlockIds: string[];
}
export interface CommitNode extends Node {
    type: NodeType.Commit;
    hash: string;
    message: string;
    timestamp: string;
    authorId: string;
}
export interface Graph {
    nodes: Node[];
    edges: Edge[];
}
