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
  
    // ... rest of the original dashboard code ...
  
    // Improved showError function
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
      
      // Automatically remove after 10 seconds
      setTimeout(() => {
        if (document.body.contains(notification)) {
          notification.style.opacity = '0';
          notification.style.transform = 'translateY(10px)';
          notification.style.transition = 'opacity 0.3s, transform 0.3s';
          
          setTimeout(() => {
            if (document.body.contains(notification)) {
              document.body.removeChild(notification);
            }
          }, 300);
        }
      }, 10000);
    }
  }
  
  // Initialize the dashboard when the DOM is loaded
  document.addEventListener('DOMContentLoaded', () => {
    const dashboard = new DashboardController();
  });