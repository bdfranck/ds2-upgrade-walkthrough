import "@abgov/web-components";
import appTemplate from './app.template.html?raw'
import './pages/public-form.js'
import './pages/workspace.js'
import javascriptLogo from './assets/javascript.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import { setupCounter } from './counter.js'

// Version Manager
const VersionManager = {
  current: '1',
  styling: 'broken',
  custom: 'hardcoded',
  step: '1',
  app: null,
  observer: null,

  init(appElement) {
    this.app = appElement;
    this.loadVersion();
    this.loadStyling();
    this.loadCustom();
    this.loadStep();
    this.updateStylesheet();
    this.setupObserver();
    this.setupHistory();
    this.checkHash();
    this.render();
  },

  checkHash() {
    const hash = window.location.hash.slice(1); // Remove #
    if (hash && ['public-form', 'workspace'].includes(hash)) {
      this.initialPage = hash === 'workspace' ? 'workspace-page' : hash;
    } else {
      this.initialPage = 'public-form';
    }
  },

  setupHistory() {
    // Handle browser back/forward
    window.addEventListener('popstate', (e) => {
      if (e.state && e.state.page) {
        this.navigateTo(e.state.page, false); // Don't push history again
      }
    });

    // Handle direct hash navigation (e.g., clicking <a href="#page">)
    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.slice(1);
      if (hash) {
        this.navigateTo(hash);
      }
    });
  },

  setupObserver() {
    this.observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          // Check the node itself
          this.updateNode(node);
          // Check all descendants
          if (node.querySelectorAll) {
            node.querySelectorAll('*').forEach(el => this.updateNode(el));
          }
        });
      });
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  },

  updateNode(node) {
    if (node.tagName) {
      const tag = node.tagName.toUpperCase();
      if (tag.startsWith('GOA-') || tag === 'PUBLIC-FORM' || tag === 'WORKSPACE-PAGE') {
        // Only update components inside demo-main-column
        if (node.closest('.demo-main-column')) {
          node.setAttribute('version', this.current);
        }
      }
    }
  },

  loadVersion() {
    const saved = localStorage.getItem('goa-version');
    if (saved) this.current = saved;
  },

  loadStyling() {
    const saved = localStorage.getItem('goa-styling');
    if (saved) this.styling = saved;
  },

  loadCustom() {
    const saved = localStorage.getItem('goa-custom');
    if (saved) this.custom = saved;
  },

  loadStep() {
    const saved = localStorage.getItem('goa-step');
    if (saved) this.step = saved;
  },

  setVersion(version) {
    this.current = version;
    localStorage.setItem('goa-version', version);
    this.updateVersionClass();
    this.updateStylesheet();
    this.updateComponents();
  },

  updateVersionClass() {
    const mainColumn = this.app.querySelector('.demo-main-column');
    if (mainColumn) {
      mainColumn.classList.remove('v1', 'v2');
      mainColumn.classList.add(`v${this.current}`);
    }
  },

  updateStyling() {
    // Apply styling class to demo-main-column
    const mainColumn = this.app.querySelector('.demo-main-column');
    if (mainColumn) {
      mainColumn.classList.remove('broken', 'fixed');
      mainColumn.classList.add(this.styling);
    }

    // Apply styling state to components in demo-main-column only
    document.querySelectorAll('.demo-main-column *').forEach(el => {
      if (el.tagName) {
        const tag = el.tagName.toUpperCase();
        if (tag.startsWith('GOA-') || tag === 'PUBLIC-FORM' || tag === 'WORKSPACE-PAGE') {
          el.setAttribute('styling', this.styling);
        }
      }
    });
  },

  updateCustom() {
    // Apply custom class to demo-main-column
    const mainColumn = this.app.querySelector('.demo-main-column');
    if (mainColumn) {
      mainColumn.classList.remove('hardcoded', 'variables', 'replaced');
      mainColumn.classList.add(this.custom);
    }

    // Apply custom state to components in demo-main-column only
    document.querySelectorAll('.demo-main-column *').forEach(el => {
      if (el.tagName) {
        const tag = el.tagName.toUpperCase();
        if (tag.startsWith('GOA-') || tag === 'PUBLIC-FORM' || tag === 'WORKSPACE-PAGE') {
          el.setAttribute('custom', this.custom);
        }
      }
    });
  },

  updateStep() {
    // Apply step state to components in demo-main-column only
    document.querySelectorAll('.demo-main-column *').forEach(el => {
      if (el.tagName) {
        const tag = el.tagName.toUpperCase();
        if (tag.startsWith('GOA-') || tag === 'PUBLIC-FORM' || tag === 'WORKSPACE-PAGE') {
          el.setAttribute('step', this.step);
        }
      }
    });

    this.updateStepButtons();
  },

  updateStepButtons() {
    // Add "current" class to the button matching current step
    for (let i = 1; i <= 5; i++) {
      const btn = this.app.querySelector(`#step-${i}`);
      if (btn) {
        if (this.step === String(i)) {
          btn.setAttribute('current', 'true');
        } else {
          btn.removeAttribute('current');
        }
      }
    }
  },

  toggle() {
    this.setVersion(this.current === '1' ? '2' : '1');
  },

  toggleStyling() {
    this.setStyling(this.styling === 'broken' ? 'fixed' : 'broken');
  },

  setStyling(styling) {
    this.styling = styling;
    localStorage.setItem('goa-styling', styling);
    this.updateStyling();
  },

  toggleCustom() {
    const states = ['hardcoded', 'variables', 'replaced'];
    const currentIndex = states.indexOf(this.custom);
    const nextIndex = (currentIndex + 1) % states.length;
    this.setCustom(states[nextIndex]);
  },

  setCustom(custom) {
    this.custom = custom;
    localStorage.setItem('goa-custom', custom);
    this.updateCustom();
  },

  setStep(step) {
    this.step = step;
    localStorage.setItem('goa-step', step);
    this.updateStep();
  },

  navigateTo(pageName, pushHistory = true) {
    const container = this.app.querySelector('#page-container');
    if (container) {
      const elementName = pageName === 'workspace' ? 'workspace-page' : pageName;
      container.innerHTML = `<${elementName} version="${this.current}"></${elementName}>`;

      // Update browser history
      if (pushHistory) {
        history.pushState({ page: pageName }, '', `#${pageName}`);
      }
    }
    
    // Switch to step 1 when navigating to public-form or workspace
    if (pageName === 'public-form' || pageName === 'workspace') {
      this.setVersion('1');
      this.setStyling('broken');
      this.setCustom('hardcoded');
      this.setStep('1');
    }
  },

  updateStylesheet() {
    const links = document.querySelectorAll('link[data-tokens-version]');
    links.forEach(link => link.remove());

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `/tokens-v${this.current}.css`;
    link.dataset.tokensVersion = this.current;
    document.head.appendChild(link);
  },

  updateComponents() {
    // Update ALL custom elements that start with "goa-"
    document.querySelectorAll('*').forEach(el => this.updateNode(el));
  },

  updateToggleButton() {
    // Start page removed - no toggle button to update
  },

  async render() {
    const html = appTemplate
      .replace(/version="1"/g, `version="${this.current}"`);

    this.app.innerHTML = html;

    // Add version class to demo-main-column
    const mainColumn = this.app.querySelector('.demo-main-column');
    if (mainColumn) {
      mainColumn.classList.remove('v1', 'v2');
      mainColumn.classList.add(`v${this.current}`);
    }

    // Set initial page from hash if present
    if (this.initialPage) {
      const container = this.app.querySelector('#page-container');
      if (container) {
        const elementName = this.initialPage === 'workspace' ? 'workspace-page' : this.initialPage;
        container.innerHTML = `<${elementName} version="${this.current}"></${elementName}>`;
      }
    }

    // Listen for toggle-version event from any page
    this.app.addEventListener('toggle-version', () => {
      this.toggle();
    });

    // Listen for navigation events from any page
    this.app.addEventListener('navigate-to', (e) => {
      this.navigateTo(e.detail.page);
    });

    // Add click handler to header version toggle (goa-link or a)
    const headerToggle = this.app.querySelector('#header-version-toggle, goa-link#header-version-toggle');
    if (headerToggle) {
      headerToggle.onclick = (e) => {
        e.preventDefault();
        this.toggle();
      };
    }

    // Add click handlers to step buttons
    const step1Btn = this.app.querySelector('#step-1');
    const step2Btn = this.app.querySelector('#step-2');
    const step3Btn = this.app.querySelector('#step-3');

    if (step1Btn) {
      step1Btn.onclick = () => {
        this.setVersion('1');
        this.setStyling('broken');
        this.setCustom('hardcoded');
        this.setStep('1');
      };
    }
    if (step2Btn) {
      step2Btn.onclick = () => {
        this.setVersion('2');
        this.setStyling('broken');
        this.setCustom('hardcoded');
        this.setStep('2');
      };
    }
    if (step3Btn) {
      step3Btn.onclick = () => {
        this.setVersion('2');
        this.setStyling('fixed');
        this.setCustom('hardcoded');
        this.setStep('3');
      };
    }

    const step4Btn = this.app.querySelector('#step-4');
    if (step4Btn) {
      step4Btn.onclick = () => {
        this.setVersion('2');
        this.setStyling('fixed');
        this.setCustom('variables');
        this.setStep('4');
      };
    }

    const step5Btn = this.app.querySelector('#step-5');
    if (step5Btn) {
      step5Btn.onclick = () => {
        this.setVersion('2');
        this.setStyling('fixed');
        this.setCustom('replaced');
        this.setStep('5');
      };
    }

    // Set initial version on all components and sidebar
    this.updateComponents();
    this.updateStyling();
    this.updateCustom();
    this.updateStep();
  }
};

// Make VersionManager globally available
window.VersionManager = VersionManager;

// Initialize version manager with the app element
const appElement = document.querySelector('#app');
VersionManager.init(appElement);

setupCounter(document.querySelector('#counter'))
