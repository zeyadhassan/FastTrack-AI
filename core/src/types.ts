export interface Node {
  id: string;
  type: string;
  createdAt: string;
  updatedAt: string;
}

export interface Edge {
  source: string;
  target: string;
  type: string;
}

export interface Graph {
  nodes: Node[];
  edges: Edge[];
} 