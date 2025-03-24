import * as fs from 'fs-extra';
import * as path from 'path';
import { Storage } from '../storage';
import { Graph, Node } from '../types';

// Mock fs-extra
jest.mock('fs-extra');

describe('Storage', () => {
  let storage: Storage;
  const projectRoot = '/test/project';
  const fasttrackDir = path.join(projectRoot, '.fasttrack');
  const graphFilePath = path.join(fasttrackDir, 'graph.json');
  const settingsFilePath = path.join(fasttrackDir, 'settings.json');

  beforeEach(() => {
    jest.clearAllMocks();
    storage = new Storage(projectRoot);
  });

  test('should initialize .fasttrack directory and files', async () => {
    // Setup mock responses
    (fs.pathExists as jest.Mock)
      .mockResolvedValueOnce(false) // .fasttrack dir doesn't exist
      .mockResolvedValueOnce(false) // graph.json doesn't exist
      .mockResolvedValueOnce(false); // settings.json doesn't exist
    
    await storage.initialize();
    
    // Check if directory and files were created
    expect(fs.mkdir).toHaveBeenCalledWith(fasttrackDir);
    expect(fs.writeFile).toHaveBeenCalledTimes(2);
    expect(fs.writeFile).toHaveBeenCalledWith(
      graphFilePath,
      JSON.stringify({ nodes: [], edges: [] }, null, 2),
      'utf-8'
    );
    expect(fs.writeFile).toHaveBeenCalledWith(
      settingsFilePath,
      expect.any(String),
      'utf-8'
    );
  });

  test('should load graph from disk', async () => {
    const mockNode: Node = {
      id: 'test',
      type: 'file',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const mockGraph: Graph = { nodes: [mockNode], edges: [] };
    
    (fs.readFile as jest.Mock).mockResolvedValueOnce(JSON.stringify(mockGraph));
    
    const result = await storage.loadGraph();
    
    expect(result).toEqual(mockGraph);
    expect(fs.readFile).toHaveBeenCalledWith(graphFilePath, 'utf-8');
  });

  test('should save graph to disk', async () => {
    const mockNode: Node = {
      id: 'test',
      type: 'file',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const mockGraph: Graph = { nodes: [mockNode], edges: [] };
    
    await storage.saveGraph(mockGraph);
    
    expect(fs.writeFile).toHaveBeenCalledWith(
      graphFilePath,
      JSON.stringify(mockGraph, null, 2),
      'utf-8'
    );
  });

  test('should get file content', async () => {
    const filePath = 'src/test.js';
    const content = 'test content';
    
    (fs.readFile as jest.Mock).mockResolvedValueOnce(content);
    
    const result = await storage.getFileContent(filePath);
    
    expect(result).toBe(content);
    expect(fs.readFile).toHaveBeenCalledWith(
      path.join(projectRoot, filePath),
      'utf-8'
    );
  });
}); 