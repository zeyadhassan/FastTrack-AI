import * as vscode from 'vscode';
import { CodeDetector } from './codeDetector';
import { GraphManager } from './graphManager';

export function activate(context: vscode.ExtensionContext) {
    const codeDetector = new CodeDetector();
    const graphManager = new GraphManager();

    let disposable = vscode.commands.registerCommand('fasttrack-ai.startTracking', () => {
        vscode.window.showInformationMessage('Starting AI Code Tracking...');
        // TODO: Implement tracking logic
    });

    context.subscriptions.push(disposable);

    disposable = vscode.commands.registerCommand('fasttrack-ai.showGraph', () => {
        vscode.window.showInformationMessage('Showing Code Graph...');
        // TODO: Implement graph visualization
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {} 