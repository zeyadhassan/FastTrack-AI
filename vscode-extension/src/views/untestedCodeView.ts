import * as vscode from 'vscode';
import { GraphManager } from '../graphManager';
import { FileNode } from '@fasttrack-ai/core';

interface FileWithCount {
  fileId: string;
  count: number;
}

export class UntestedCodeViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'fasttrack-ai-untested';
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
    const files = this._getFilesWithUntestedCode();
    
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Untested Code</title>
      </head>
      <body>
        <h2>Files with Untested Code</h2>
        <div>
          ${files.map(file => `
            <div>
              <p>${file.path} (${file.count} blocks)</p>
            </div>
          `).join('')}
        </div>
      </body>
      </html>
    `;
  }

  private _getFilesWithUntestedCode() {
    const files = this._graphManager.findFilesWithMostAICode();
    return files.map((file: FileWithCount) => {
      const fileNode = this._graphManager.findNodeById(file.fileId) as FileNode;
      return {
        path: fileNode?.path || 'Unknown',
        count: file.count
      };
    });
  }
} 