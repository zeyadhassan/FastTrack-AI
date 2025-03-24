// @ts-check
/// <reference types="@types/vscode-webview" />

// Get the VS Code webview API
const vscode = acquireVsCodeApi();

// Initialize the dashboard
function initializeDashboard() {
  const content = document.getElementById('content');
  
  // Create stats card
  const statsCard = document.createElement('div');
  statsCard.className = 'card';
  statsCard.innerHTML = `
    <h2>Statistics</h2>
    <div class="stat">
      <div class="stat-name">Total Files</div>
      <div class="stat-value" id="total-files">0</div>
    </div>
    <div class="stat">
      <div class="stat-name">AI-Generated Code Blocks</div>
      <div class="stat-value" id="ai-blocks">0</div>
    </div>
    <div class="stat">
      <div class="stat-name">Untested Code Blocks</div>
      <div class="stat-value" id="untested-blocks">0</div>
    </div>
  `;
  
  content.appendChild(statsCard);
  
  // Request initial data
  vscode.postMessage({ command: 'getData' });
}

// Handle messages from the extension
window.addEventListener('message', event => {
  const message = event.data;
  
  switch (message.command) {
    case 'updateData':
      updateDashboard(message.data);
      break;
  }
});

// Update the dashboard with new data
function updateDashboard(data) {
  document.getElementById('total-files').textContent = data.totalFiles;
  document.getElementById('ai-blocks').textContent = data.aiBlocks;
  document.getElementById('untested-blocks').textContent = data.untestedBlocks;
}

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', initializeDashboard); 