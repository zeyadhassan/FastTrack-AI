/**
 * File system operations for FastTrack AI
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import { Graph } from './models';

/**
 * Storage class for file system operations
 */
export class Storage {
  private projectRoot: string;
  private fasttrackDir: string;
  private graphFilePath: string;
  private settingsFilePath: string;

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
    this.fasttrackDir = path.join(projectRoot, '.fasttrack');
    this.graphFilePath = path.join(this.fasttrackDir, 'graph.json');
    this.settingsFilePath = path.join(this.fasttrackDir, 'settings.json');
  }

  /**
   * Initialize the FastTrack directory
   */
  async initialize(): Promise<void> {
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
  async loadGraph(): Promise<Graph> {
    try {
      const graphData = await fs.readFile(this.graphFilePath, 'utf-8');
      return JSON.parse(graphData) as Graph;
    } catch (error) {
      console.error('Error loading graph:', error);
      return { nodes: [], edges: [] };
    }
  }

  /**
   * Save the graph to disk
   */
  async saveGraph(graph: Graph): Promise<void> {
    try {
      await fs.writeFile(this.graphFilePath, JSON.stringify(graph, null, 2), 'utf-8');
    } catch (error) {
      console.error('Error saving graph:', error);
      throw error;
    }
  }

  /**
   * Load settings from disk
   */
  async loadSettings(): Promise<any> {
    try {
      const settingsData = await fs.readFile(this.settingsFilePath, 'utf-8');
      return JSON.parse(settingsData);
    } catch (error) {
      console.error('Error loading settings:', error);
      return {};
    }
  }

  /**
   * Save settings to disk
   */
  async saveSettings(settings: any): Promise<void> {
    try {
      await fs.writeFile(this.settingsFilePath, JSON.stringify(settings, null, 2), 'utf-8');
    } catch (error) {
      console.error('Error saving settings:', error);
      throw error;
    }
  }

  /**
   * Get the content of a file
   */
  async getFileContent(filePath: string): Promise<string> {
    try {
      return await fs.readFile(path.join(this.projectRoot, filePath), 'utf-8');
    } catch (error) {
      console.error(`Error reading file: ${filePath}`, error);
      throw error;
    }
  }

  /**
   * Check if a file exists
   */
  async fileExists(filePath: string): Promise<boolean> {
    try {
      return await fs.pathExists(path.join(this.projectRoot, filePath));
    } catch (error) {
      console.error(`Error checking if file exists: ${filePath}`, error);
      return false;
    }
  }

  /**
   * Log activity for debugging purposes
   */
  async logActivity(activity: string): Promise<void> {
    const logFilePath = path.join(this.fasttrackDir, 'activity.log');
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${activity}\n`;
    
    try {
      await fs.appendFile(logFilePath, logEntry);
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  }
}