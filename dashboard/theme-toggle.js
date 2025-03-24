/**
 * Theme toggle functionality for FastTrack AI Dashboard
 */
class ThemeToggle {
    constructor() {
      this.createToggle();
      this.initializeTheme();
      this.setupListeners();
    }
  
    createToggle() {
      // Create toggle button
      const toggle = document.createElement('button');
      toggle.id = 'theme-toggle';
      toggle.className = 'theme-toggle';
      toggle.setAttribute('aria-label', 'Toggle theme');
      toggle.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="sun-icon">
          <circle cx="12" cy="12" r="5"></circle>
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </svg>
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="moon-icon">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        </svg>
      `;
  
      // Add toggle styles
      const style = document.createElement('style');
      style.textContent = `
        .theme-toggle {
          background: transparent;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.5rem;
          border-radius: 50%;
          transition: background-color 0.2s;
          color: var(--foreground);
          position: relative;
          width: 36px;
          height: 36px;
        }
        
        .theme-toggle:hover {
          background-color: hsl(var(--secondary));
        }
        
        .theme-toggle .sun-icon,
        .theme-toggle .moon-icon {
          position: absolute;
          transition: transform 0.5s, opacity 0.5s;
        }
        
        .theme-toggle .sun-icon {
          opacity: 1;
          transform: scale(1);
        }
        
        .theme-toggle .moon-icon {
          opacity: 0;
          transform: scale(0);
        }
        
        .dark .theme-toggle .sun-icon {
          opacity: 0;
          transform: scale(0);
        }
        
        .dark .theme-toggle .moon-icon {
          opacity: 1;
          transform: scale(1);
        }
      `;
      
      document.head.appendChild(style);
      
      // Insert toggle into header
      const header = document.querySelector('header');
      const projectStats = document.querySelector('.project-stats');
      header.insertBefore(toggle, projectStats);
    }
  
    initializeTheme() {
      // Check for saved theme preference or respect OS preference
      const savedTheme = localStorage.getItem('fasttrack-theme');
      if (savedTheme === 'dark') {
        this.setTheme(true);
      } else if (savedTheme === 'light') {
        this.setTheme(false);
      } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        this.setTheme(true);
      }
    }
  
    setupListeners() {
      // Toggle theme on button click
      const toggle = document.getElementById('theme-toggle');
      toggle.addEventListener('click', () => {
        const isDark = document.documentElement.classList.contains('dark');
        this.setTheme(!isDark);
      });
  
      // Listen for system theme changes
      if (window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
          if (localStorage.getItem('fasttrack-theme') === null) {
            this.setTheme(e.matches);
          }
        });
      }
    }
  
    setTheme(isDark) {
      if (isDark) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('fasttrack-theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('fasttrack-theme', 'light');
      }
  
      // Update chart themes if they exist
      this.updateChartThemes(isDark);
    }
  
    updateChartThemes(isDark) {
      const textColor = isDark ? 'rgba(236, 237, 240, 0.8)' : 'rgba(25, 26, 28, 0.8)';
      const gridColor = isDark ? 'rgba(159, 161, 178, 0.1)' : 'rgba(86, 88, 102, 0.1)';
  
      // Update chart.js defaults if it's loaded
      if (window.Chart) {
        Chart.defaults.color = textColor;
        Chart.defaults.borderColor = gridColor;
  
        // Update existing charts
        Object.values(window.dashboard?.charts || {}).forEach(chart => {
          if (chart && typeof chart.update === 'function') {
            chart.options.scales.x.grid.color = gridColor;
            chart.options.scales.y.grid.color = gridColor;
            chart.update();
          }
        });
      }
    }
  }
  
  // Initialize the theme toggle when the DOM is loaded
  document.addEventListener('DOMContentLoaded', () => {
    new ThemeToggle();
  });