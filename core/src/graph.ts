import { Graph, Node, Edge } from './models';

export class GraphOperations {
    private graph: Graph;

    constructor() {
        this.graph = { nodes: [], edges: [] };
    }

    public addNode(node: Node): void {
        this.graph.nodes.push(node);
    }

    public addEdge(edge: Edge): void {
        this.graph.edges.push(edge);
    }

    public getGraph(): Graph {
        return this.graph;
    }

    public getNode(id: string): Node | undefined {
        return this.graph.nodes.find(node => node.id === id);
    }

    public getEdgesForNode(nodeId: string): Edge[] {
        return this.graph.edges.filter(edge => 
            edge.source === nodeId || edge.target === nodeId
        );
    }
} 