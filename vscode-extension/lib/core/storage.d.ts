/**
 * File system operations for FastTrack AI
 */
import { Graph } from './models';
/**
 * Storage class for file system operations
 */
export declare class Storage {
    private projectRoot;
    private fasttrackDir;
    private graphFilePath;
    private settingsFilePath;
    constructor(projectRoot: string);
    /**
     * Initialize the FastTrack directory
     */
    initialize(): Promise<void>;
    /**
     * Load the graph from disk
     */
    loadGraph(): Promise<Graph>;
    /**
     * Save the graph to disk
     */
    saveGraph(graph: Graph): Promise<void>;
    /**
     * Load settings from disk
     */
    loadSettings(): Promise<any>;
    /**
     * Save settings to disk
     */
    saveSettings(settings: any): Promise<void>;
    /**
     * Get the content of a file
     */
    getFileContent(filePath: string): Promise<string>;
    /**
     * Check if a file exists
     */
    fileExists(filePath: string): Promise<boolean>;
    /**
     * Log activity for debugging purposes
     */
    logActivity(activity: string): Promise<void>;
}
