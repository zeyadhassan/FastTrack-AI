import { Graph } from './models';
import * as fs from 'fs';
import * as path from 'path';

export class Storage {
    private baseDir: string;

    constructor(baseDir: string = '.fasttrack') {
        this.baseDir = baseDir;
        this.ensureDirectoryExists();
    }

    private ensureDirectoryExists(): void {
        if (!fs.existsSync(this.baseDir)) {
            fs.mkdirSync(this.baseDir, { recursive: true });
        }
    }

    public async saveGraph(graph: Graph): Promise<void> {
        const filePath = path.join(this.baseDir, 'graph.json');
        await fs.promises.writeFile(
            filePath,
            JSON.stringify(graph, null, 2)
        );
    }

    public async loadGraph(): Promise<Graph> {
        const filePath = path.join(this.baseDir, 'graph.json');
        try {
            const content = await fs.promises.readFile(filePath, 'utf-8');
            return JSON.parse(content);
        } catch (error) {
            return { nodes: [], edges: [] };
        }
    }
} 