"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const storage_1 = require("../storage");
const models_1 = require("../models");
// Mock fs-extra
jest.mock('fs-extra');
describe('Storage', () => {
    let storage;
    const projectRoot = '/test/project';
    const fasttrackDir = path.join(projectRoot, '.fasttrack');
    const graphFilePath = path.join(fasttrackDir, 'graph.json');
    const settingsFilePath = path.join(fasttrackDir, 'settings.json');
    beforeEach(() => {
        jest.clearAllMocks();
        storage = new storage_1.Storage(projectRoot);
    });
    test('should initialize .fasttrack directory and files', async () => {
        // Setup mock responses
        fs.pathExists
            .mockResolvedValueOnce(false) // .fasttrack dir doesn't exist
            .mockResolvedValueOnce(false) // graph.json doesn't exist
            .mockResolvedValueOnce(false); // settings.json doesn't exist
        await storage.initialize();
        // Check if directory and files were created
        expect(fs.mkdir).toHaveBeenCalledWith(fasttrackDir);
        expect(fs.writeFile).toHaveBeenCalledTimes(2);
        expect(fs.writeFile).toHaveBeenCalledWith(graphFilePath, JSON.stringify({ nodes: [], edges: [] }, null, 2), 'utf-8');
        expect(fs.writeFile).toHaveBeenCalledWith(settingsFilePath, expect.any(String), 'utf-8');
    });
    test('should load graph from disk', async () => {
        const mockNode = {
            id: 'test',
            type: models_1.NodeType.File,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        const mockGraph = { nodes: [mockNode], edges: [] };
        fs.readFile.mockResolvedValueOnce(JSON.stringify(mockGraph));
        const result = await storage.loadGraph();
        expect(result).toEqual(mockGraph);
        expect(fs.readFile).toHaveBeenCalledWith(graphFilePath, 'utf-8');
    });
    test('should save graph to disk', async () => {
        const mockNode = {
            id: 'test',
            type: models_1.NodeType.File,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        const mockGraph = { nodes: [mockNode], edges: [] };
        await storage.saveGraph(mockGraph);
        expect(fs.writeFile).toHaveBeenCalledWith(graphFilePath, JSON.stringify(mockGraph, null, 2), 'utf-8');
    });
    test('should get file content', async () => {
        const filePath = 'src/test.js';
        const content = 'test content';
        fs.readFile.mockResolvedValueOnce(content);
        const result = await storage.getFileContent(filePath);
        expect(result).toBe(content);
        expect(fs.readFile).toHaveBeenCalledWith(path.join(projectRoot, filePath), 'utf-8');
    });
});
