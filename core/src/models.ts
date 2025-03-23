export interface Node {
    id: string;
    type: string;
    content: string;
    metadata: Record<string, any>;
}

export interface Edge {
    id: string;
    source: string;
    target: string;
    type: string;
    metadata: Record<string, any>;
}

export interface Graph {
    nodes: Node[];
    edges: Edge[];
} 