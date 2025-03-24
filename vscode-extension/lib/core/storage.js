"use strict";
/**
 * File system operations for FastTrack AI
 */
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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Storage = void 0;
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
/**
 * Storage class for file system operations
 */
class Storage {
    constructor(projectRoot) {
        this.projectRoot = projectRoot;
        this.fasttrackDir = path.join(projectRoot, '.fasttrack');
        this.graphFilePath = path.join(this.fasttrackDir, 'graph.json');
        this.settingsFilePath = path.join(this.fasttrackDir, 'settings.json');
    }
    /**
     * Initialize the FastTrack directory
     */
    async initialize() {
        // Create .fasttrack directory if it doesn't exist
        if (!await fs.pathExists(this.fasttrackDir)) {
            await fs.mkdir(this.fasttrackDir);
        }
        // Create graph.json if it doesn't exist
        if (!await fs.pathExists(this.graphFilePath)) {
            await this.saveGraph({ nodes: [], edges: [] });
        }
        // Create settings.json if it doesn't exist
        if (!await fs.pathExists(this.settingsFilePath)) {
            await this.saveSettings({
                complexity: {
                    threshold: 10 // Default threshold for complexity warnings
                },
                staleCode: {
                    days: 30 // Default threshold for stale code warnings
                }
            });
        }
    }
    /**
     * Load the graph from disk
     */
    async loadGraph() {
        try {
            const graphData = await fs.readFile(this.graphFilePath, 'utf-8');
            return JSON.parse(graphData);
        }
        catch (error) {
            console.error('Error loading graph:', error);
            return { nodes: [], edges: [] };
        }
    }
    /**
     * Save the graph to disk
     */
    async saveGraph(graph) {
        try {
            await fs.writeFile(this.graphFilePath, JSON.stringify(graph, null, 2), 'utf-8');
        }
        catch (error) {
            console.error('Error saving graph:', error);
            throw error;
        }
    }
    /**
     * Load settings from disk
     */
    async loadSettings() {
        try {
            const settingsData = await fs.readFile(this.settingsFilePath, 'utf-8');
            return JSON.parse(settingsData);
        }
        catch (error) {
            console.error('Error loading settings:', error);
            return {};
        }
    }
    /**
     * Save settings to disk
     */
    async saveSettings(settings) {
        try {
            await fs.writeFile(this.settingsFilePath, JSON.stringify(settings, null, 2), 'utf-8');
        }
        catch (error) {
            console.error('Error saving settings:', error);
            throw error;
        }
    }
    /**
     * Get the content of a file
     */
    async getFileContent(filePath) {
        try {
            return await fs.readFile(path.join(this.projectRoot, filePath), 'utf-8');
        }
        catch (error) {
            console.error(`Error reading file: ${filePath}`, error);
            throw error;
        }
    }
    /**
     * Check if a file exists
     */
    async fileExists(filePath) {
        try {
            return await fs.pathExists(path.join(this.projectRoot, filePath));
        }
        catch (error) {
            console.error(`Error checking if file exists: ${filePath}`, error);
            return false;
        }
    }
    /**
     * Log activity for debugging purposes
     */
    async logActivity(activity) {
        const logFilePath = path.join(this.fasttrackDir, 'activity.log');
        const timestamp = new Date().toISOString();
        const logEntry = `[${timestamp}] ${activity}\n`;
        try {
            await fs.appendFile(logFilePath, logEntry);
        }
        catch (error) {
            console.error('Error logging activity:', error);
        }
    }
}
exports.Storage = Storage;
