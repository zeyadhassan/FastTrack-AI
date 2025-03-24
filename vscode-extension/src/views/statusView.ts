import * as vscode from 'vscode';
import { GraphManager } from '../graphManager';
import { NodeType } from '@fasttrack-ai/core';

export class StatusViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'fasttrack-ai-status';
  private _view?: vscode.WebviewView;

  constructor(
    private readonly _extensionUri: vscode.Uri,
    private readonly _graphManager: GraphManager
  ) {}

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken,
  ) {
    this._view = webviewView;
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri]
    };

    webviewView.webview.html = this._getHtmlForWebview();
  }

  public refresh() {
    if (this._view) {
      this._view.webview.html = this._getHtmlForWebview();
    }
  }

  private _getHtmlForWebview() {
    const stats = this._getStats();
    
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>FastTrack AI Status</title>
      </head>
      <body>
        <h2>Status</h2>
        <div>
          <p>Total Files: ${stats.totalFiles}</p>
          <p>AI-Generated Blocks: ${stats.aiBlocks}</p>
          <p>Untested Blocks: ${stats.untestedBlocks}</p>
        </div>
      </body>
      </html>
    `;
  }

  private _getStats() {
    const totalFiles = this._graphManager.findNodesByType(NodeType.File).length;
    const aiBlocks = this._graphManager.findFilesWithMostAICode().reduce((sum, file) => sum + file.count, 0);
    const untestedBlocks = this._graphManager.findUntestedCodeBlocks().length;

    return {
      totalFiles,
      aiBlocks,
      untestedBlocks
    };
  }
} 