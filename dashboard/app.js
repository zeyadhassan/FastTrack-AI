/**
 * FastTrack AI Dashboard
 * 
 * This script powers the FastTrack AI dashboard, visualizing AI-generated code metrics.
 */

// Main Dashboard Controller
class DashboardController {
    constructor() {
      this.graph = null;
      this.selectedSection = 'overview';
      this.dateRange = 30; // Default to 30 days
      this.complexityThreshold = 10;
      this.staleDays = 30;
      this.aiToolFilter = 'all';
      this.untestedOnly = true;
  
      // Chart instances
      this.charts = {};
      
      this.initializeListeners();
      this.loadData();
      
      // Make dashboard available globally for theme toggle
      window.dashboard = this;
    }
  
    async loadData() {
      try {
        this.showLoader();
        // In production, this would use the core module's Storage class
        // For this demo, we're directly fetching the JSON file
        const response = await fetch('../.fasttrack/graph.json');
        if (!response.ok) {
          throw new Error(`Failed to load graph data: ${response.status} ${response.statusText}`);
        }
        
        this.graph = await response.json();
        this.updateDashboard();
        this.hideLoader();
      } catch (error) {
        console.error('Error loading graph data:', error);
        this.hideLoader();
        this.showError('Failed to load graph data. Make sure the FastTrack AI extension is installed and active.');
      }
    }
  
    showLoader() {
      // Create loader if it doesn't exist
      if (!document.getElementById('dashboard-loader')) {
        const loader = document.createElement('div');
        loader.id = 'dashboard-loader';
        loader.innerHTML = `
          <div class="loader-content">
            <div class="spinner"></div>
            <p>Loading dashboard data...</p>
          </div>
        `;
        
        // Add loader styles
        const style = document.createElement('style');
        style.textContent = `
          #dashboard-loader {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(var(--bg-color), 0.7);
            backdrop-filter: blur(4px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
          }
          
          .loader-content {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 1rem;
            color: hsl(var(--foreground));
          }
          
          .spinner {
            width: 40px;
            height: 40px;
            border: 3px solid hsl(var(--primary), 0.3);
            border-top-color: hsl(var(--primary));
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(loader);
      } else {
        document.getElementById('dashboard-loader').style.display = 'flex';
      }
    }
  
    hideLoader() {
      const loader = document.getElementById('dashboard-loader');
      if (loader) {
        loader.style.display = 'none';
      }
    }
  
    // Initialize event listeners
    initializeListeners() {
      // Navigation buttons
      document.getElementById('overview-btn').addEventListener('click', () => this.switchSection('overview'));
      document.getElementById('ai-code-btn').addEventListener('click', () => this.switchSection('ai-code'));
      document.getElementById('test-coverage-btn').addEventListener('click', () => this.switchSection('test-coverage'));
      document.getElementById('complexity-btn').addEventListener('click', () => this.switchSection('complexity'));
      document.getElementById('stale-code-btn').addEventListener('click', () => this.switchSection('stale-code'));
  
      // Filters
      document.getElementById('date-range').addEventListener('change', (e) => {
        this.dateRange = parseInt(e.target.value) || 'all';
        this.updateDashboard();
      });
  
      document.getElementById('complexity-threshold').addEventListener('input', (e) => {
        this.complexityThreshold = parseInt(e.target.value);
        document.getElementById('threshold-value').textContent = this.complexityThreshold;
        this.updateComplexitySection();
      });
  
      document.getElementById('stale-days').addEventListener('change', (e) => {
        this.staleDays = parseInt(e.target.value);
        this.updateStaleCodeSection();
      });
  
      document.getElementById('ai-tool-filter').addEventListener('change', (e) => {
        this.aiToolFilter = e.target.value;
        this.updateAICodeSection();
      });
  
      document.getElementById('untested-only').addEventListener('change', (e) => {
        this.untestedOnly = e.target.checked;
        this.updateTestCoverageSection();
      });
  
      // Modal
      const modal = document.getElementById('code-modal');
      document.querySelector('.close-modal').addEventListener('click', () => {
        modal.style.display = 'none';
      });
      window.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.style.display = 'none';
        }
      });
  
      // Modal buttons
      document.getElementById('add-test-btn').addEventListener('click', () => {
        // This would integrate with the VS Code extension to create a test
        alert('This feature would create a test template in your editor.');
      });
  
      document.getElementById('open-in-editor-btn').addEventListener('click', () => {
        // This would integrate with the VS Code extension to open the file
        alert('This feature would open the file in your editor.');
      });
      
      // Keyboard shortcut for section navigation
      document.addEventListener('keydown', (e) => {
        // Alt + 1-5 for switching sections
        if (e.altKey && e.key >= '1' && e.key <= '5') {
          const sections = ['overview', 'ai-code', 'test-coverage', 'complexity', 'stale-code'];
          const index = parseInt(e.key) - 1;
          if (index >= 0 && index < sections.length) {
            this.switchSection(sections[index]);
          }
        }
        
        // Escape key to close modal
        if (e.key === 'Escape') {
          const modal = document.getElementById('code-modal');
          if (modal.style.display === 'block') {
            modal.style.display = 'none';
          }
        }
      });
    }
  
    switchSection(sectionName) {
      // Update buttons
      document.querySelectorAll('nav button').forEach(btn => {
        btn.classList.remove('active');
      });
      document.getElementById(`${sectionName}-btn`).classList.add('active');
  
      // Update sections
      document.querySelectorAll('main section').forEach(section => {
        section.classList.remove('active-section');
      });
      document.getElementById(`${sectionName}-section`).classList.add('active-section');
  
      this.selectedSection = sectionName;
      this.updateDashboard();
    }
  
    // Main dashboard update function
    updateDashboard() {
      if (!this.graph) return;
      
      // Update section based on current selection
      switch (this.selectedSection) {
        case 'overview':
          this.updateOverviewSection();
          break;
        case 'ai-code':
          this.updateAICodeSection();
          break;
        case 'test-coverage':
          this.updateTestCoverageSection();
          break;
        case 'complexity':
          this.updateComplexitySection();
          break;
        case 'stale-code':
          this.updateStaleCodeSection();
          break;
      }
      
      // Always update the header stats
      this.updateHeaderStats();
    }
    
    // Update header statistics
    updateHeaderStats() {
      // Calculate AI code percentage
      const codeBlocks = this.graph.nodes.filter(node => node.type === 'CodeBlock');
      const aiGeneratedEdges = this.graph.edges.filter(edge => edge.type === 'Generated');
      
      const aiCodePercentage = codeBlocks.length > 0 
        ? Math.round((aiGeneratedEdges.length / codeBlocks.length) * 100) 
        : 0;
      
      document.getElementById('ai-percentage').textContent = `${aiCodePercentage}%`;
      
      // Calculate test coverage
      const testedByEdges = this.graph.edges.filter(edge => edge.type === 'TestedBy');
      const testCoverage = codeBlocks.length > 0 
        ? Math.round((testedByEdges.length / codeBlocks.length) * 100) 
        : 0;
      
      document.getElementById('test-coverage').textContent = `${testCoverage}%`;
      
      // Calculate stale blocks
      const now = new Date();
      const staleBlocks = codeBlocks.filter(block => {
        if (!block.lastModified) return false;
        const lastModified = new Date(block.lastModified);
        const diffDays = Math.ceil((now - lastModified) / (1000 * 60 * 60 * 24));
        return diffDays >= this.staleDays;
      });
      
      document.getElementById('stale-blocks').textContent = staleBlocks.length;
    }
    
    // Update overview section
    updateOverviewSection() {
      this.updateAIUsageChart();
      this.updateDeveloperChart();
      this.updateAIFilesList();
      this.updateRecentAIList();
    }
    
    // Update AI Code section with list view and heatmap
    updateAICodeSection() {
      this.updateAICodeList();
      this.updateAIHeatmap();
    }
    
    // Update Test Coverage section
    updateTestCoverageSection() {
      this.updateTestCoverageChart();
      this.updateUntestedList();
    }
    
    // Update Complexity section
    updateComplexitySection() {
      this.updateComplexityChart();
      this.updateComplexCodeList();
    }
    
    // Update Stale Code section
    updateStaleCodeSection() {
      this.updateStaleChart();
      this.updateStaleCodeList();
    }
    
    // Filter nodes by date range
    filterByDateRange(nodes) {
      if (this.dateRange === 'all') return nodes;
      
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.dateRange);
      
      return nodes.filter(node => {
        const nodeDate = new Date(node.createdAt);
        return nodeDate >= cutoffDate;
      });
    }
    
    // Filter AI suggestions by tool
    filterByAITool(edges) {
      if (this.aiToolFilter === 'all') return edges;
      
      // Get AI suggestion nodes with matching tool
      const aiNodes = this.graph.nodes.filter(node => 
        node.type === 'AI_Suggestion' && node.aiTool === this.aiToolFilter
      );
      
      // Get the IDs of these nodes
      const aiNodeIds = aiNodes.map(node => node.id);
      
      // Filter edges that have these nodes as source
      return edges.filter(edge => 
        edge.type === 'Generated' && aiNodeIds.includes(edge.source)
      );
    }
  
    // Show error notification
    showError(message) {
      // Create error notification
      const notification = document.createElement('div');
      notification.className = 'error-notification animate-in';
      notification.innerHTML = `
        <div class="error-icon">⚠️</div>
        <div class="error-message">${message}</div>
        <div class="error-close">×</div>
      `;
      
      // Style the notification
      Object.assign(notification.style, {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        backgroundColor: 'hsl(var(--destructive))',
        color: 'hsl(var(--destructive-foreground))',
        padding: '15px',
        borderRadius: 'var(--radius)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        zIndex: '1000',
        maxWidth: '400px'
      });
      
      // Add close button behavior
      const closeButton = notification.querySelector('.error-close');
      closeButton.style.cursor = 'pointer';
      closeButton.addEventListener('click', () => {
        document.body.removeChild(notification);
      });
      
      // Add to document
      document.body.appendChild(notification);
      
      // Auto-remove after 5 seconds
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 5000);
    }
    
    // Create the AI Code List view
    updateAICodeList() {
      const listContainer = document.getElementById('ai-code-list');
      listContainer.innerHTML = '';
      
      // Get AI-generated edges filtered by the selected AI tool
      const aiGeneratedEdges = this.filterByAITool(
        this.graph.edges.filter(edge => edge.type === 'Generated')
      );
      
      if (aiGeneratedEdges.length === 0) {
        listContainer.innerHTML = '<div class="empty-state">No AI-generated code blocks found.</div>';
        return;
      }
      
      // For each edge, get the code block (target)
      const codeBlocks = aiGeneratedEdges.map(edge => {
        const codeBlockNode = this.graph.nodes.find(node => 
          node.id === edge.target && node.type === 'CodeBlock'
        );
        
        if (!codeBlockNode) return null;
        
        // Get the file node
        const fileNode = this.graph.nodes.find(node => 
          node.id === codeBlockNode.fileId && node.type === 'File'
        );
        
        // Get the AI suggestion node
        const aiNode = this.graph.nodes.find(node => 
          node.id === edge.source && node.type === 'AI_Suggestion'
        );
        
        return {
          id: codeBlockNode.id,
          fileId: codeBlockNode.fileId,
          fileName: fileNode ? fileNode.name : 'Unknown file',
          filePath: fileNode ? fileNode.path : '',
          startLine: codeBlockNode.startLine,
          endLine: codeBlockNode.endLine,
          content: codeBlockNode.content,
          complexity: codeBlockNode.complexity || 1,
          lastModified: codeBlockNode.lastModified || codeBlockNode.createdAt,
          aiTool: aiNode ? aiNode.aiTool : 'Unknown',
          createdAt: codeBlockNode.createdAt
        };
      }).filter(block => block !== null);
      
      // Sort by most recent
      codeBlocks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      // Create list items
      codeBlocks.forEach(block => {
        const listItem = document.createElement('div');
        listItem.className = 'code-list-item';
        
        // Add risk indicators
        const riskIndicators = [];
        if (block.complexity > this.complexityThreshold) {
          riskIndicators.push('<span class="risk-indicator complexity-risk" title="High complexity">⚠️</span>');
        }
        
        // Check if tested
        const isCodeTested = this.graph.edges.some(edge => 
          edge.type === 'TestedBy' && edge.source === block.id
        );
        
        if (!isCodeTested) {
          riskIndicators.push('<span class="risk-indicator test-risk" title="Not tested">🧪</span>');
        }
        
        // Check if stale
        const lastModified = new Date(block.lastModified);
        const now = new Date();
        const diffDays = Math.ceil((now - lastModified) / (1000 * 60 * 60 * 24));
        
        if (diffDays >= this.staleDays) {
          riskIndicators.push('<span class="risk-indicator stale-risk" title="Stale code">⏱️</span>');
        }
        
        const riskHtml = riskIndicators.length > 0 
          ? `<div class="risk-indicators">${riskIndicators.join('')}</div>` 
          : '';
        
        // Format the code preview
        const previewLines = block.content.split('\n').slice(0, 2).join('\n');
        const contentPreview = previewLines + (block.content.split('\n').length > 2 ? '...' : '');
        
        listItem.innerHTML = `
          <div class="code-item-header">
            <div class="code-item-path">${block.fileName}</div>
            <div class="code-item-meta">
              <span>Lines ${block.startLine}-${block.endLine}</span>
              <span>${block.aiTool}</span>
            </div>
            ${riskHtml}
          </div>
          <pre class="code-preview"><code class="language-javascript">${this.escapeHtml(contentPreview)}</code></pre>
        `;
        
        // Add click event to show the modal
        listItem.addEventListener('click', () => {
          this.showCodeModal(block);
        });
        
        listContainer.appendChild(listItem);
      });
      
      // Initialize syntax highlighting
      document.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightElement(block);
      });
    }
    
    // Create the AI File Heatmap
    updateAIHeatmap() {
      const heatmapContainer = document.getElementById('ai-heatmap');
      heatmapContainer.innerHTML = '';
      
      // Get AI-generated edges filtered by the selected AI tool
      const aiGeneratedEdges = this.filterByAITool(
        this.graph.edges.filter(edge => edge.type === 'Generated')
      );
      
      if (aiGeneratedEdges.length === 0) {
        heatmapContainer.innerHTML = '<div class="empty-state">No AI-generated code blocks found to display on heatmap.</div>';
        return;
      }
      
      // Group code blocks by file
      const fileMap = new Map();
      
      aiGeneratedEdges.forEach(edge => {
        const codeBlock = this.graph.nodes.find(node => 
          node.id === edge.target && node.type === 'CodeBlock'
        );
        
        if (!codeBlock || !codeBlock.fileId) return;
        
        if (!fileMap.has(codeBlock.fileId)) {
          fileMap.set(codeBlock.fileId, []);
        }
        
        fileMap.get(codeBlock.fileId).push(codeBlock);
      });
      
      // Convert to array and sort by number of AI blocks descending
      const fileData = Array.from(fileMap.entries())
        .map(([fileId, blocks]) => {
          const fileNode = this.graph.nodes.find(node => 
            node.id === fileId && node.type === 'File'
          );
          
          return {
            fileId,
            filePath: fileNode ? fileNode.path : 'Unknown file',
            fileName: fileNode ? fileNode.name : 'Unknown file',
            blocks,
            blockCount: blocks.length,
            // Calculate risk score based on complexity, test coverage, and staleness
            riskScore: this.calculateFileRiskScore(blocks)
          };
        })
        .sort((a, b) => b.blockCount - a.blockCount);
      
      // Create heatmap content
      const heatmapContent = document.createElement('div');
      heatmapContent.className = 'file-heatmap';
      
      fileData.forEach(file => {
        // Create the file block
        const fileBlock = document.createElement('div');
        fileBlock.className = 'heatmap-file';
        
        // Set the size based on number of blocks (proportionally)
        const maxBlocks = Math.max(...fileData.map(f => f.blockCount));
        const sizePercent = Math.max(30, Math.min(100, (file.blockCount / maxBlocks) * 100));
        
        // Set the color based on risk score (red for high risk, green for low)
        const riskColor = this.getRiskColor(file.riskScore);
        
        // Style the block
        Object.assign(fileBlock.style, {
          width: `${sizePercent}px`,
          height: `${sizePercent}px`,
          backgroundColor: riskColor,
          position: 'relative'
        });
        
        // Add file info in tooltip
        fileBlock.title = `${file.fileName}\nAI Blocks: ${file.blockCount}\nRisk Score: ${file.riskScore.toFixed(1)}/10`;
        
        // Add click event to show file details
        fileBlock.addEventListener('click', () => {
          this.showFileDetails(file);
        });
        
        heatmapContent.appendChild(fileBlock);
      });
      
      heatmapContainer.appendChild(heatmapContent);
      
      // Add legend
      const legend = document.createElement('div');
      legend.className = 'heatmap-legend';
      legend.innerHTML = `
        <div class="legend-item">
          <div class="color-box" style="background-color: hsl(var(--success))"></div>
          <span>Low Risk</span>
        </div>
        <div class="legend-item">
          <div class="color-box" style="background-color: hsl(var(--warning))"></div>
          <span>Medium Risk</span>
        </div>
        <div class="legend-item">
          <div class="color-box" style="background-color: hsl(var(--destructive))"></div>
          <span>High Risk</span>
        </div>
        <div class="legend-size">
          <div class="size-box small"></div>
          <div class="size-box large"></div>
          <span>Block size = AI code quantity</span>
        </div>
      `;
      
      heatmapContainer.appendChild(legend);
    }
    
    // Calculate file risk score (0-10)
    calculateFileRiskScore(codeBlocks) {
      if (codeBlocks.length === 0) return 0;
      
      let riskScore = 0;
      
      // 1. Check complexity
      const avgComplexity = codeBlocks.reduce((sum, block) => 
        sum + (block.complexity || 1), 0) / codeBlocks.length;
      riskScore += (avgComplexity > this.complexityThreshold) ? 3 : 0;
      
      // 2. Check test coverage
      const testedCount = codeBlocks.filter(block => 
        this.graph.edges.some(edge => 
          edge.type === 'TestedBy' && edge.source === block.id
        )
      ).length;
      
      const testCoverage = testedCount / codeBlocks.length;
      riskScore += (testCoverage < 0.5) ? 4 : (testCoverage < 0.8) ? 2 : 0;
      
      // 3. Check staleness
      const now = new Date();
      const staleCount = codeBlocks.filter(block => {
        if (!block.lastModified) return false;
        const lastModified = new Date(block.lastModified);
        const diffDays = Math.ceil((now - lastModified) / (1000 * 60 * 60 * 24));
        return diffDays >= this.staleDays;
      }).length;
      
      const stalePercentage = staleCount / codeBlocks.length;
      riskScore += (stalePercentage > 0.5) ? 3 : (stalePercentage > 0.2) ? 1 : 0;
      
      return riskScore;
    }
    
    // Get color based on risk score
    getRiskColor(riskScore) {
      if (riskScore >= 7) {
        return 'hsl(var(--destructive))';
      } else if (riskScore >= 4) {
        return 'hsl(var(--warning))';
      } else {
        return 'hsl(var(--success))';
      }
    }
    
    // Show code modal for a specific block
    showCodeModal(block) {
      document.getElementById('modal-title').textContent = `Code Block - ${block.fileName}`;
      document.getElementById('modal-file').textContent = `File: ${block.filePath}`;
      document.getElementById('modal-lines').textContent = `Lines: ${block.startLine}-${block.endLine}`;
      document.getElementById('modal-complexity').textContent = `Complexity: ${block.complexity}`;
      document.getElementById('modal-date').textContent = `Last Modified: ${new Date(block.lastModified).toLocaleDateString()}`;
      
      const modalCode = document.getElementById('modal-code');
      modalCode.textContent = block.content;
      modalCode.className = `language-${this.getLanguageFromFileName(block.fileName)}`;
      
      hljs.highlightElement(modalCode);
      
      document.getElementById('code-modal').style.display = 'block';
    }
    
    // Show file details (would expand to show all blocks in the file)
    showFileDetails(file) {
      // In a full implementation, this would open a detailed view of all AI blocks in the file
      // For now, we'll simply alert with the file info
      alert(`${file.fileName}\nContains ${file.blockCount} AI-generated code blocks\nRisk Score: ${file.riskScore.toFixed(1)}/10`);
    }
    
    // Helper to get language for syntax highlighting
    getLanguageFromFileName(fileName) {
      const extension = fileName.split('.').pop().toLowerCase();
      const languageMap = {
        'js': 'javascript',
        'ts': 'typescript',
        'jsx': 'javascript',
        'tsx': 'typescript',
        'html': 'html',
        'css': 'css',
        'json': 'json',
        'py': 'python',
        'rb': 'ruby',
        'go': 'go',
        'java': 'java',
        'php': 'php',
        'cs': 'csharp',
        'cpp': 'cpp',
        'c': 'c'
      };
      
      return languageMap[extension] || 'javascript';
    }
    
    // Escape HTML for safe rendering
    escapeHtml(unsafe) {
      return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }
    
    // Create Test Coverage Chart
    updateTestCoverageChart() {
      const chartContainer = document.getElementById('test-coverage-chart');
      
      // Get all code blocks
      const codeBlocks = this.graph.nodes.filter(node => node.type === 'CodeBlock');
      
      // Filter by date range if needed
      const filteredBlocks = this.filterByDateRange(codeBlocks);
      
      if (filteredBlocks.length === 0) {
        chartContainer.innerHTML = '<div class="empty-state">No code blocks found for the selected period.</div>';
        return;
      }
      
      // Group by file
      const fileMap = new Map();
      
      filteredBlocks.forEach(block => {
        if (!block.fileId) return;
        
        if (!fileMap.has(block.fileId)) {
          fileMap.set(block.fileId, {
            total: 0,
            tested: 0
          });
        }
        
        const fileStats = fileMap.get(block.fileId);
        fileStats.total++;
        
        // Check if the block is tested
        const isTested = this.graph.edges.some(edge => 
          edge.type === 'TestedBy' && edge.source === block.id
        );
        
        if (isTested) {
          fileStats.tested++;
        }
      });
      
      // Convert to array and get file names
      const fileData = Array.from(fileMap.entries())
        .map(([fileId, stats]) => {
          const fileNode = this.graph.nodes.find(node => 
            node.id === fileId && node.type === 'File'
          );
          
          const fileName = fileNode ? fileNode.name : 'Unknown file';
          const coverage = stats.total > 0 ? (stats.tested / stats.total) * 100 : 0;
          
          return {
            fileName,
            coverage: Math.round(coverage),
            total: stats.total,
            tested: stats.tested
          };
        })
        .sort((a, b) => a.coverage - b.coverage) // Sort by coverage ascending
        .slice(0, 10); // Show only top 10 files
      
      // Destroy existing chart if it exists
      if (this.charts.testCoverage) {
        this.charts.testCoverage.destroy();
      }
      
      // Prepare chart data
      const labels = fileData.map(file => file.fileName);
      const coverageData = fileData.map(file => file.coverage);
      
      // Create the chart
      const ctx = chartContainer.getContext('2d');
      this.charts.testCoverage = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Test Coverage (%)',
            data: coverageData,
            backgroundColor: coverageData.map(coverage => 
              coverage < 50 ? 'hsla(var(--destructive), 0.7)' : 
              coverage < 80 ? 'hsla(var(--warning), 0.7)' : 
              'hsla(var(--success), 0.7)'
            ),
            borderColor: coverageData.map(coverage => 
              coverage < 50 ? 'hsl(var(--destructive))' : 
              coverage < 80 ? 'hsl(var(--warning))' : 
              'hsl(var(--success))'
            ),
            borderWidth: 1
          }]
        },
        options: {
          indexAxis: 'y',
          scales: {
            x: {
              beginAtZero: true,
              max: 100,
              title: {
                display: true,
                text: 'Coverage %'
              }
            }
          },
          plugins: {
            tooltip: {
              callbacks: {
                label: function(context) {
                  const file = fileData[context.dataIndex];
                  return `Coverage: ${file.coverage}% (${file.tested}/${file.total} blocks)`;
                }
              }
            }
          }
        }
      });
    }
    
    // Create Untested AI Code List
    updateUntestedList() {
      const listContainer = document.getElementById('untested-list');
      listContainer.innerHTML = '';
      
      // Get all AI-generated edges
      const aiGeneratedEdges = this.filterByAITool(
        this.graph.edges.filter(edge => edge.type === 'Generated')
      );
      
      if (aiGeneratedEdges.length === 0) {
        listContainer.innerHTML = '<div class="empty-state">No AI-generated code blocks found.</div>';
        return;
      }
      
      // Get untested AI code blocks
      const untestedBlocks = [];
      
      aiGeneratedEdges.forEach(edge => {
        const codeBlock = this.graph.nodes.find(node => 
          node.id === edge.target && node.type === 'CodeBlock'
        );
        
        if (!codeBlock) return;
        
        // Check if tested
        const isTested = this.graph.edges.some(edge => 
          edge.type === 'TestedBy' && edge.source === codeBlock.id
        );
        
        if (this.untestedOnly && isTested) return;
        
        // Get the file node
        const fileNode = this.graph.nodes.find(node => 
          node.id === codeBlock.fileId && node.type === 'File'
        );
        
        // Get the AI suggestion node
        const aiNode = this.graph.nodes.find(node => 
          node.id === edge.source && node.type === 'AI_Suggestion'
        );
        
        untestedBlocks.push({
          id: codeBlock.id,
          fileId: codeBlock.fileId,
          fileName: fileNode ? fileNode.name : 'Unknown file',
          filePath: fileNode ? fileNode.path : '',
          startLine: codeBlock.startLine,
          endLine: codeBlock.endLine,
          content: codeBlock.content,
          complexity: codeBlock.complexity || 1,
          lastModified: codeBlock.lastModified || codeBlock.createdAt,
          aiTool: aiNode ? aiNode.aiTool : 'Unknown',
          tested: isTested,
          createdAt: codeBlock.createdAt
        });
      });
      
      // Sort by complexity descending
      untestedBlocks.sort((a, b) => b.complexity - a.complexity);
      
      if (untestedBlocks.length === 0) {
        listContainer.innerHTML = '<div class="empty-state">No untested AI code blocks found.</div>';
        return;
      }
      
      // Create list items
      untestedBlocks.forEach(block => {
        const listItem = document.createElement('div');
        listItem.className = 'code-list-item';
        
        // Format content preview
        const previewLines = block.content.split('\n').slice(0, 2).join('\n');
        const contentPreview = previewLines + (block.content.split('\n').length > 2 ? '...' : '');
        
        // Get test status indicator
        const testStatus = block.tested 
          ? '<span class="test-status tested">Tested</span>' 
          : '<span class="test-status untested">Untested</span>';
        
        listItem.innerHTML = `
          <div class="code-item-header">
            <div class="code-item-path">${block.fileName}</div>
            <div class="code-item-meta">
              <span>Lines ${block.startLine}-${block.endLine}</span>
              <span>Complexity: ${block.complexity}</span>
            </div>
            ${testStatus}
          </div>
          <pre class="code-preview"><code class="language-javascript">${this.escapeHtml(contentPreview)}</code></pre>
        `;
        
        // Add click event to show the modal
        listItem.addEventListener('click', () => {
          this.showCodeModal(block);
        });
        
        listContainer.appendChild(listItem);
      });
      
      // Initialize syntax highlighting
      document.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightElement(block);
      });
    }
    
    // Update Complexity section
    updateComplexitySection() {
      this.updateComplexityChart();
      this.updateComplexCodeList();
    }
    
    // Create Complexity Chart
    updateComplexityChart() {
      const chartContainer = document.getElementById('complexity-chart');
      
      // Get all code blocks
      const codeBlocks = this.graph.nodes.filter(node => node.type === 'CodeBlock');
      
      if (codeBlocks.length === 0) {
        chartContainer.innerHTML = '<div class="empty-state">No code blocks found.</div>';
        return;
      }
      
      // Count complexity distribution
      const complexityBuckets = {
        '1-5': 0,
        '6-10': 0,
        '11-15': 0,
        '16-20': 0,
        '21+': 0
      };
      
      // Track AI vs non-AI distribution
      const aiComplexityBuckets = { ...complexityBuckets };
      const nonAiComplexityBuckets = { ...complexityBuckets };
      
      codeBlocks.forEach(block => {
        const complexity = block.complexity || 1;
        let bucket;
        
        if (complexity <= 5) bucket = '1-5';
        else if (complexity <= 10) bucket = '6-10';
        else if (complexity <= 15) bucket = '11-15';
        else if (complexity <= 20) bucket = '16-20';
        else bucket = '21+';
        
        // Check if this is AI-generated
        const isAIGenerated = this.graph.edges.some(edge => 
          edge.type === 'Generated' && edge.target === block.id
        );
        
        if (isAIGenerated) {
          aiComplexityBuckets[bucket]++;
        } else {
          nonAiComplexityBuckets[bucket]++;
        }
      });
      
      // Destroy existing chart if it exists
      if (this.charts.complexity) {
        this.charts.complexity.destroy();
      }
      
      // Prepare chart data
      const labels = Object.keys(complexityBuckets);
      const aiData = labels.map(bucket => aiComplexityBuckets[bucket]);
      const nonAiData = labels.map(bucket => nonAiComplexityBuckets[bucket]);
      
      // Create the chart
      const ctx = chartContainer.getContext('2d');
      this.charts.complexity = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'AI-Generated',
              data: aiData,
              backgroundColor: 'hsla(var(--primary), 0.7)',
              borderColor: 'hsl(var(--primary))',
              borderWidth: 1
            },
            {
              label: 'Human-Written',
              data: nonAiData,
              backgroundColor: 'hsla(var(--muted), 0.5)',
              borderColor: 'hsl(var(--muted-foreground))',
              borderWidth: 1
            }
          ]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Number of Code Blocks'
              }
            },
            x: {
              title: {
                display: true,
                text: 'Cyclomatic Complexity'
              }
            }
          },
          plugins: {
            title: {
              display: true,
              text: 'Code Complexity Distribution'
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const label = context.dataset.label || '';
                  return `${label}: ${context.raw} blocks`;
                }
              }
            }
          }
        }
      });
    }
    
    // Create Complex AI Code List
    updateComplexCodeList() {
      const listContainer = document.getElementById('complex-code-list');
      listContainer.innerHTML = '';
      
      // Get AI-generated edges
      const aiGeneratedEdges = this.filterByAITool(
        this.graph.edges.filter(edge => edge.type === 'Generated')
      );
      
      if (aiGeneratedEdges.length === 0) {
        listContainer.innerHTML = '<div class="empty-state">No AI-generated code blocks found.</div>';
        return;
      }
      
      // Get complex AI code blocks
      const complexBlocks = [];
      
      aiGeneratedEdges.forEach(edge => {
        const codeBlock = this.graph.nodes.find(node => 
          node.id === edge.target && node.type === 'CodeBlock'
        );
        
        if (!codeBlock) return;
        
        // Check complexity threshold
        if ((codeBlock.complexity || 0) < this.complexityThreshold) return;
        
        // Get the file node
        const fileNode = this.graph.nodes.find(node => 
          node.id === codeBlock.fileId && node.type === 'File'
        );
        
        // Get the AI suggestion node
        const aiNode = this.graph.nodes.find(node => 
          node.id === edge.source && node.type === 'AI_Suggestion'
        );
        
        complexBlocks.push({
          id: codeBlock.id,
          fileId: codeBlock.fileId,
          fileName: fileNode ? fileNode.name : 'Unknown file',
          filePath: fileNode ? fileNode.path : '',
          startLine: codeBlock.startLine,
          endLine: codeBlock.endLine,
          content: codeBlock.content,
          complexity: codeBlock.complexity || 1,
          lastModified: codeBlock.lastModified || codeBlock.createdAt,
          aiTool: aiNode ? aiNode.aiTool : 'Unknown',
          createdAt: codeBlock.createdAt
        });
      });
      
      // Sort by complexity descending
      complexBlocks.sort((a, b) => b.complexity - a.complexity);
      
      if (complexBlocks.length === 0) {
        listContainer.innerHTML = `<div class="empty-state">No AI code blocks with complexity >= ${this.complexityThreshold} found.</div>`;
        return;
      }
      
      // Create list items
      complexBlocks.forEach(block => {
        const listItem = document.createElement('div');
        listItem.className = 'code-list-item';
        
        // Format complexity class
        const complexityClass = block.complexity > 15 ? 'high-complexity' : 
                               block.complexity > 10 ? 'medium-complexity' : 'normal-complexity';
        
        // Format content preview
        const previewLines = block.content.split('\n').slice(0, 2).join('\n');
        const contentPreview = previewLines + (block.content.split('\n').length > 2 ? '...' : '');
        
        listItem.innerHTML = `
          <div class="code-item-header">
            <div class="code-item-path">${block.fileName}</div>
            <div class="code-item-meta">
              <span>Lines ${block.startLine}-${block.endLine}</span>
              <span class="${complexityClass}">Complexity: ${block.complexity}</span>
            </div>
          </div>
          <pre class="code-preview"><code class="language-javascript">${this.escapeHtml(contentPreview)}</code></pre>
        `;
        
        // Add click event to show the modal
        listItem.addEventListener('click', () => {
          this.showCodeModal(block);
        });
        
        listContainer.appendChild(listItem);
      });
      
      // Initialize syntax highlighting
      document.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightElement(block);
      });
    }
    
    // Create Stale Code Chart
    updateStaleChart() {
      const chartContainer = document.getElementById('stale-chart');
      
      // Get all AI-generated code blocks
      const aiGeneratedEdges = this.filterByAITool(
        this.graph.edges.filter(edge => edge.type === 'Generated')
      );
      
      if (aiGeneratedEdges.length === 0) {
        chartContainer.innerHTML = '<div class="empty-state">No AI-generated code blocks found.</div>';
        return;
      }
      
      // Age buckets in days
      const ageBuckets = {
        '0-7 days': 0,
        '8-14 days': 0,
        '15-30 days': 0,
        '31-60 days': 0,
        '60+ days': 0
      };
      
      const now = new Date();
      
      // Count blocks by age
      aiGeneratedEdges.forEach(edge => {
        const codeBlock = this.graph.nodes.find(node => 
          node.id === edge.target && node.type === 'CodeBlock'
        );
        
        if (!codeBlock) return;
        
        const lastModified = new Date(codeBlock.lastModified || codeBlock.createdAt);
        const diffDays = Math.ceil((now - lastModified) / (1000 * 60 * 60 * 24));
        
        let bucket;
        if (diffDays <= 7) bucket = '0-7 days';
        else if (diffDays <= 14) bucket = '8-14 days';
        else if (diffDays <= 30) bucket = '15-30 days';
        else if (diffDays <= 60) bucket = '31-60 days';
        else bucket = '60+ days';
        
        ageBuckets[bucket]++;
      });
      
      // Destroy existing chart if it exists
      if (this.charts.stale) {
        this.charts.stale.destroy();
      }
      
      // Prepare chart data
      const labels = Object.keys(ageBuckets);
      const data = labels.map(bucket => ageBuckets[bucket]);
      
      // Define colors based on age (green to red)
      const backgroundColors = [
        'hsla(var(--success), 0.7)',
        'hsla(var(--success), 0.5)',
        'hsla(var(--warning), 0.7)',
        'hsla(var(--destructive), 0.5)',
        'hsla(var(--destructive), 0.7)'
      ];
      
      const borderColors = [
        'hsl(var(--success))',
        'hsl(var(--success))',
        'hsl(var(--warning))',
        'hsl(var(--destructive))',
        'hsl(var(--destructive))'
      ];
      
      // Create the chart
      const ctx = chartContainer.getContext('2d');
      this.charts.stale = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'AI Code Blocks by Age',
            data: data,
            backgroundColor: backgroundColors,
            borderColor: borderColors,
            borderWidth: 1
          }]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Number of Code Blocks'
              }
            }
          },
          plugins: {
            tooltip: {
              callbacks: {
                label: function(context) {
                  return `${context.raw} block(s)`;
                }
              }
            }
          }
        }
      });
    }
    
    // Create Stale AI Code List
    updateStaleCodeList() {
      const listContainer = document.getElementById('stale-code-list');
      listContainer.innerHTML = '';
      
      // Get all AI-generated code blocks
      const aiGeneratedEdges = this.filterByAITool(
        this.graph.edges.filter(edge => edge.type === 'Generated')
      );
      
      if (aiGeneratedEdges.length === 0) {
        listContainer.innerHTML = '<div class="empty-state">No AI-generated code blocks found.</div>';
        return;
      }
      
      // Get stale AI code blocks
      const staleBlocks = [];
      const now = new Date();
      
      aiGeneratedEdges.forEach(edge => {
        const codeBlock = this.graph.nodes.find(node => 
          node.id === edge.target && node.type === 'CodeBlock'
        );
        
        if (!codeBlock) return;
        
        const lastModified = new Date(codeBlock.lastModified || codeBlock.createdAt);
        const diffDays = Math.ceil((now - lastModified) / (1000 * 60 * 60 * 24));
        
        // Check if stale based on threshold
        if (diffDays < this.staleDays) return;
        
        // Get the file node
        const fileNode = this.graph.nodes.find(node => 
          node.id === codeBlock.fileId && node.type === 'File'
        );
        
        // Get the AI suggestion node
        const aiNode = this.graph.nodes.find(node => 
          node.id === edge.source && node.type === 'AI_Suggestion'
        );
        
        staleBlocks.push({
          id: codeBlock.id,
          fileId: codeBlock.fileId,
          fileName: fileNode ? fileNode.name : 'Unknown file',
          filePath: fileNode ? fileNode.path : '',
          startLine: codeBlock.startLine,
          endLine: codeBlock.endLine,
          content: codeBlock.content,
          complexity: codeBlock.complexity || 1,
          lastModified: lastModified.toISOString(),
          aiTool: aiNode ? aiNode.aiTool : 'Unknown',
          ageDays: diffDays,
          createdAt: codeBlock.createdAt
        });
      });
      
      // Sort by age descending
      staleBlocks.sort((a, b) => b.ageDays - a.ageDays);
      
      if (staleBlocks.length === 0) {
        listContainer.innerHTML = `<div class="empty-state">No AI code blocks older than ${this.staleDays} days found.</div>`;
        return;
      }
      
      // Create list items
      staleBlocks.forEach(block => {
        const listItem = document.createElement('div');
        listItem.className = 'code-list-item';
        
        // Age class based on how stale it is
        const ageClass = block.ageDays > 60 ? 'very-stale' : 
                         block.ageDays > 30 ? 'stale' : 'semi-stale';
        
        // Format content preview
        const previewLines = block.content.split('\n').slice(0, 2).join('\n');
        const contentPreview = previewLines + (block.content.split('\n').length > 2 ? '...' : '');
        
        const lastModifiedDate = new Date(block.lastModified).toLocaleDateString();
        
        listItem.innerHTML = `
          <div class="code-item-header">
            <div class="code-item-path">${block.fileName}</div>
            <div class="code-item-meta">
              <span>Lines ${block.startLine}-${block.endLine}</span>
              <span class="${ageClass}">Age: ${block.ageDays} days</span>
            </div>
            <div class="stale-date">Last modified: ${lastModifiedDate}</div>
          </div>
          <pre class="code-preview"><code class="language-javascript">${this.escapeHtml(contentPreview)}</code></pre>
        `;
        
        // Add click event to show the modal
        listItem.addEventListener('click', () => {
          this.showCodeModal(block);
        });
        
        listContainer.appendChild(listItem);
      });
      
      // Initialize syntax highlighting
      document.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightElement(block);
      });
    }
    
    // Create AI Usage over time chart
    updateAIUsageChart() {
      const chartContainer = document.getElementById('ai-usage-chart');
      
      // Get AI suggestion nodes
      const aiSuggestions = this.graph.nodes.filter(node => 
        node.type === 'AI_Suggestion'
      );
      
      if (aiSuggestions.length === 0) {
        chartContainer.innerHTML = '<div class="empty-state">No AI-generated code data available.</div>';
        return;
      }
      
      // Filter by date range if needed
      const filteredSuggestions = this.filterByDateRange(aiSuggestions);
      
      if (filteredSuggestions.length === 0) {
        chartContainer.innerHTML = '<div class="empty-state">No AI-generated code found in selected date range.</div>';
        return;
      }
      
      // Group by day
      const dailyUsage = new Map();
      const toolUsage = new Map();
      
      filteredSuggestions.forEach(suggestion => {
        const date = new Date(suggestion.timestamp);
        const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
        
        // Count by day
        if (!dailyUsage.has(dateKey)) {
          dailyUsage.set(dateKey, 0);
        }
        dailyUsage.set(dateKey, dailyUsage.get(dateKey) + 1);
        
        // Count by tool
        if (!toolUsage.has(suggestion.aiTool)) {
          toolUsage.set(suggestion.aiTool, 0);
        }
        toolUsage.set(suggestion.aiTool, toolUsage.get(suggestion.aiTool) + 1);
      });
      
      // Fill in missing days
      const dates = Array.from(dailyUsage.keys()).sort();
      if (dates.length > 0) {
        const startDate = new Date(dates[0]);
        const endDate = new Date(dates[dates.length - 1]);
        
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
          const dateKey = d.toISOString().split('T')[0];
          if (!dailyUsage.has(dateKey)) {
            dailyUsage.set(dateKey, 0);
          }
        }
      }
      
      // Sort dates
      const sortedDates = Array.from(dailyUsage.keys()).sort();
      const usageData = sortedDates.map(date => dailyUsage.get(date));
      
      // Destroy existing chart if it exists
      if (this.charts.aiUsage) {
        this.charts.aiUsage.destroy();
      }
      
      // Create the chart
      const ctx = chartContainer.getContext('2d');
      this.charts.aiUsage = new Chart(ctx, {
        type: 'line',
        data: {
          labels: sortedDates.map(date => new Date(date).toLocaleDateString()),
          datasets: [{
            label: 'AI Code Blocks',
            data: usageData,
            fill: false,
            borderColor: 'hsl(var(--primary))',
            backgroundColor: 'hsla(var(--primary), 0.5)',
            tension: 0.2,
            pointBackgroundColor: 'hsl(var(--primary))',
            pointRadius: 3,
            pointHoverRadius: 5
          }]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Number of AI Suggestions'
              }
            }
          },
          plugins: {
            tooltip: {
              callbacks: {
                title: function(tooltipItems) {
                  return new Date(sortedDates[tooltipItems[0].dataIndex]).toLocaleDateString();
                }
              }
            }
          }
        }
      });
    }
    
    // Create AI code by developer chart
    updateDeveloperChart() {
      const chartContainer = document.getElementById('developer-chart');
      
      // Get developers
      const developers = this.graph.nodes.filter(node => 
        node.type === 'Developer'
      );
      
      if (developers.length === 0) {
        chartContainer.innerHTML = '<div class="empty-state">No developer data available.</div>';
        return;
      }
      
      // Count AI code blocks authored by each developer
      const developerAICode = new Map();
      
      developers.forEach(developer => {
        // Get code blocks authored by this developer
        const authoredEdges = this.graph.edges.filter(edge => 
          edge.type === 'Authored' && edge.source === developer.id
        );
        
        // Count how many of these blocks are AI-generated
        let aiBlockCount = 0;
        
        authoredEdges.forEach(authoredEdge => {
          const codeBlockId = authoredEdge.target;
          
          // Check if this block has a "Generated" edge pointing to it
          const isAIGenerated = this.graph.edges.some(edge => 
            edge.type === 'Generated' && edge.target === codeBlockId
          );
          
          if (isAIGenerated) {
            aiBlockCount++;
          }
        });
        
        developerAICode.set(developer.id, {
          name: developer.name || 'Anonymous',
          aiBlockCount,
          totalBlockCount: authoredEdges.length
        });
      });
      
      // Convert to array for chart
      const developerData = Array.from(developerAICode.values())
        .filter(dev => dev.totalBlockCount > 0) // Only include developers with blocks
        .sort((a, b) => {
          // Calculate AI usage percentage
          const aPercent = a.totalBlockCount > 0 ? (a.aiBlockCount / a.totalBlockCount) : 0;
          const bPercent = b.totalBlockCount > 0 ? (b.aiBlockCount / b.totalBlockCount) : 0;
          return bPercent - aPercent; // Sort by percentage descending
        });
      
      if (developerData.length === 0) {
        chartContainer.innerHTML = '<div class="empty-state">No developer code block data available.</div>';
        return;
      }
      
      // Destroy existing chart if it exists
      if (this.charts.developer) {
        this.charts.developer.destroy();
      }
      
      // Prepare chart data
      const labels = developerData.map(dev => dev.name);
      const aiData = developerData.map(dev => dev.aiBlockCount);
      const humanData = developerData.map(dev => dev.totalBlockCount - dev.aiBlockCount);
      
      // Create the chart
      const ctx = chartContainer.getContext('2d');
      this.charts.developer = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'AI-Generated',
              data: aiData,
              backgroundColor: 'hsla(var(--primary), 0.7)'
            },
            {
              label: 'Human-Written',
              data: humanData,
              backgroundColor: 'hsla(var(--muted), 0.5)'
            }
          ]
        },
        options: {
          scales: {
            x: {
              stacked: true
            },
            y: {
              stacked: true,
              beginAtZero: true,
              title: {
                display: true,
                text: 'Number of Code Blocks'
              }
            }
          },
          plugins: {
            tooltip: {
              callbacks: {
                footer: function(tooltipItems) {
                  const index = tooltipItems[0].dataIndex;
                  const dev = developerData[index];
                  const percentage = (dev.aiBlockCount / dev.totalBlockCount) * 100;
                  return `AI Usage: ${percentage.toFixed(1)}%`;
                }
              }
            }
          }
        }
      });
    }
    
    // Update top AI-heavy files list
    updateAIFilesList() {
      const listContainer = document.getElementById('ai-files-list');
      listContainer.innerHTML = '';
      
      // Get AI-generated edges
      const aiGeneratedEdges = this.graph.edges.filter(edge => 
        edge.type === 'Generated'
      );
      
      if (aiGeneratedEdges.length === 0) {
        listContainer.innerHTML = '<div class="empty-state">No AI-generated code blocks found.</div>';
        return;
      }
      
      // Group by file
      const fileMap = new Map();
      
      aiGeneratedEdges.forEach(edge => {
        const codeBlock = this.graph.nodes.find(node => 
          node.id === edge.target && node.type === 'CodeBlock'
        );
        
        if (!codeBlock || !codeBlock.fileId) return;
        
        if (!fileMap.has(codeBlock.fileId)) {
          fileMap.set(codeBlock.fileId, 0);
        }
        
        fileMap.set(codeBlock.fileId, fileMap.get(codeBlock.fileId) + 1);
      });
      
      // Convert to array and add file info
      const fileData = Array.from(fileMap.entries())
        .map(([fileId, count]) => {
          const fileNode = this.graph.nodes.find(node => 
            node.id === fileId && node.type === 'File'
          );
          
          return {
            fileId,
            fileName: fileNode ? fileNode.name : 'Unknown file',
            filePath: fileNode ? fileNode.path : '',
            count
          };
        })
        .sort((a, b) => b.count - a.count) // Sort by count descending
        .slice(0, 10); // Top 10 files
      
      if (fileData.length === 0) {
        listContainer.innerHTML = '<div class="empty-state">No files with AI-generated code found.</div>';
        return;
      }
      
      // Create list
      const list = document.createElement('ul');
      list.className = 'ai-files-list';
      
      fileData.forEach((file, index) => {
        const listItem = document.createElement('li');
        
        // Calculate color based on index (gradient from primary to muted)
        const hue = index === 0 ? 'var(--primary)' : 'var(--muted)';
        const opacity = 1 - (index / fileData.length * 0.6);
        
        listItem.innerHTML = `
          <div class="file-item">
            <div class="file-rank" style="background-color: hsla(${hue}, ${opacity})">${index + 1}</div>
            <div class="file-name" title="${file.filePath}">${file.fileName}</div>
            <div class="file-count">${file.count} block${file.count !== 1 ? 's' : ''}</div>
          </div>
        `;
        
        list.appendChild(listItem);
      });
      
      listContainer.appendChild(list);
    }
    
    // Update recent AI suggestions list
    updateRecentAIList() {
      const listContainer = document.getElementById('recent-ai-list');
      listContainer.innerHTML = '';
      
      // Get AI suggestion nodes
      const aiSuggestions = this.graph.nodes.filter(node => 
        node.type === 'AI_Suggestion'
      );
      
      // Filter by date range
      const filteredSuggestions = this.filterByDateRange(aiSuggestions);
      
      if (filteredSuggestions.length === 0) {
        listContainer.innerHTML = '<div class="empty-state">No recent AI suggestions found.</div>';
        return;
      }
      
      // Sort by most recent
      const sortedSuggestions = filteredSuggestions.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      ).slice(0, 10); // Top 10
      
      // Get associated code blocks
      const recentBlocks = [];
      
      sortedSuggestions.forEach(suggestion => {
        // Find the Generated edge
        const generatedEdge = this.graph.edges.find(edge => 
          edge.type === 'Generated' && edge.source === suggestion.id
        );
        
        if (!generatedEdge) return;
        
        // Find the code block
        const codeBlock = this.graph.nodes.find(node => 
          node.id === generatedEdge.target && node.type === 'CodeBlock'
        );
        
        if (!codeBlock) return;
        
        // Get the file
        const fileNode = this.graph.nodes.find(node => 
          node.id === codeBlock.fileId && node.type === 'File'
        );
        
        recentBlocks.push({
          id: codeBlock.id,
          fileId: codeBlock.fileId,
          fileName: fileNode ? fileNode.name : 'Unknown file',
          filePath: fileNode ? fileNode.path : '',
          startLine: codeBlock.startLine,
          endLine: codeBlock.endLine,
          content: codeBlock.content,
          complexity: codeBlock.complexity || 1,
          aiTool: suggestion.aiTool,
          timestamp: suggestion.timestamp
        });
      });
      
      if (recentBlocks.length === 0) {
        listContainer.innerHTML = '<div class="empty-state">No recent AI-generated code blocks found.</div>';
        return;
      }
      
      // Create list
      const list = document.createElement('ul');
      list.className = 'recent-ai-list';
      
      recentBlocks.forEach(block => {
        const listItem = document.createElement('li');
        
        const date = new Date(block.timestamp);
        const timeAgo = this.getTimeAgo(date);
        
        listItem.innerHTML = `
          <div class="recent-item">
            <div class="recent-meta">
              <div class="recent-file" title="${block.filePath}">${block.fileName}</div>
              <div class="recent-time">${timeAgo}</div>
            </div>
            <div class="recent-info">
              <div class="recent-lines">Lines ${block.startLine}-${block.endLine}</div>
              <div class="recent-tool">${block.aiTool}</div>
            </div>
          </div>
        `;
        
        // Add click event to show the modal
        listItem.addEventListener('click', () => {
          this.showCodeModal(block);
        });
        
        list.appendChild(listItem);
      });
      
      listContainer.appendChild(list);
    }
    
    // Helper to get readable time ago
    getTimeAgo(date) {
      const now = new Date();
      const diffMs = now - date;
      const diffSec = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffSec / 60);
      const diffHour = Math.floor(diffMin / 60);
      const diffDay = Math.floor(diffHour / 24);
      
      if (diffDay > 0) {
        return `${diffDay} day${diffDay !== 1 ? 's' : ''} ago`;
      } else if (diffHour > 0) {
        return `${diffHour} hour${diffHour !== 1 ? 's' : ''} ago`;
      } else if (diffMin > 0) {
        return `${diffMin} minute${diffMin !== 1 ? 's' : ''} ago`;
      } else {
        return 'Just now';
      }
    }
  }

// Initialize dashboard on load
document.addEventListener('DOMContentLoaded', () => {
  new DashboardController();
});