import * as vscode from 'vscode';
import { GraphManager } from './graphManager';
import { StatusViewProvider } from './views/statusView';
import { AIFilesViewProvider } from './views/aiFilesView';
import { UntestedCodeViewProvider } from './views/untestedCodeView';

export function activate(context: vscode.ExtensionContext) {
  const graphManager = new GraphManager();
  const statusViewProvider = new StatusViewProvider(context.extensionUri, graphManager);
  const aiFilesViewProvider = new AIFilesViewProvider(context.extensionUri, graphManager);
  const untestedCodeViewProvider = new UntestedCodeViewProvider(context.extensionUri, graphManager);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(StatusViewProvider.viewType, statusViewProvider)
  );

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(AIFilesViewProvider.viewType, aiFilesViewProvider)
  );

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(UntestedCodeViewProvider.viewType, untestedCodeViewProvider)
  );

  const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  statusBarItem.text = "$(symbol-misc) FastTrack AI";
  statusBarItem.command = 'fasttrack-ai.toggleTracking';
  statusBarItem.show();

  let disposable = vscode.commands.registerCommand('fasttrack-ai.toggleTracking', () => {
    // Toggle tracking state
    vscode.window.showInformationMessage('FastTrack AI tracking toggled');
  });

  context.subscriptions.push(disposable);

  disposable = vscode.commands.registerCommand('fasttrack-ai.openDashboard', () => {
    const panel = vscode.window.createWebviewPanel(
      'fasttrackDashboard',
      'FastTrack AI Dashboard',
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        localResourceRoots: [context.extensionUri]
      }
    );

    panel.webview.html = getDashboardHtml(context.extensionUri);
  });

  context.subscriptions.push(disposable);

  // Register file system watcher
  const watcher = vscode.workspace.createFileSystemWatcher('**/*');
  watcher.onDidChange(uri => {
    if (uri.fsPath.endsWith('.ts') || uri.fsPath.endsWith('.js')) {
      graphManager.updateFile(uri.fsPath);
      statusViewProvider.refresh();
      aiFilesViewProvider.refresh();
      untestedCodeViewProvider.refresh();
    }
  });

  context.subscriptions.push(watcher);
}

function getDashboardHtml(extensionUri: vscode.Uri): string {
  const styleUri = vscode.Uri.joinPath(extensionUri, 'dashboard', 'style.css');
  const scriptUri = vscode.Uri.joinPath(extensionUri, 'dashboard', 'script.js');

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>FastTrack AI Dashboard</title>
      <link rel="stylesheet" href="${styleUri}">
    </head>
    <body>
      <div class="container">
        <h1>FastTrack AI Dashboard</h1>
        <div class="content">
          <div class="card">
            <h2>Statistics</h2>
            <div class="stats">
              <div class="stat-item">
                <span class="stat-value" id="total-files">0</span>
                <span class="stat-label">Total Files</span>
              </div>
              <div class="stat-item">
                <span class="stat-value" id="ai-blocks">0</span>
                <span class="stat-label">AI-Generated Code</span>
              </div>
              <div class="stat-item">
                <span class="stat-value" id="untested-blocks">0</span>
                <span class="stat-label">Untested Code</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <script src="${scriptUri}"></script>
    </body>
    </html>
  `;
}

export function deactivate() {
  // Cleanup when the extension is deactivated
}