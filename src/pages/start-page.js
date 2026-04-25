// Start Page Custom Element
let templateContent = null;

async function loadTemplate() {
  if (!templateContent) {
    const template = await import('./start-page.html?raw');
    templateContent = template.default;
  }
  return templateContent;
}

class StartPage extends HTMLElement {
  constructor() {
    super();
  }

  static get observedAttributes() {
    return ['version'];
  }

  async connectedCallback() {
    const template = await loadTemplate();
    await this.updateVersion(this.getAttribute('version') || '1');
  }

  async attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'version' && oldValue !== newValue) {
      await this.updateVersion(newValue);
    }
  }

  async updateVersion(version) {
    const template = await loadTemplate();
    this.innerHTML = template;

    // Add click handler to Get started button
    const getStartedBtn = this.querySelector('#get-started');
    if (getStartedBtn) {
      getStartedBtn.onclick = () => {
        this.dispatchEvent(new CustomEvent('navigate-to', { 
          detail: { page: 'public-form' },
          bubbles: true
        }));
      };
    }

    // Add click handler for version toggle if it exists
    const toggleBtn = this.querySelector('#version-toggle');
    if (toggleBtn) {
      toggleBtn.onclick = () => {
        this.dispatchEvent(new CustomEvent('toggle-version', { bubbles: true }));
      };
    }
  }
}

customElements.define('start-page', StartPage);
