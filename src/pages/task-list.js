// Task List Page Custom Element
let templateContent = null;

async function loadTemplate() {
  if (!templateContent) {
    const template = await import('./task-list.html?raw');
    templateContent = template.default;
  }
  return templateContent;
}

class TaskList extends HTMLElement {
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

    // Add click handlers to all goa-link elements to navigate to question page
    this.querySelectorAll('goa-link, a').forEach(link => {
      link.onclick = (e) => {
        e.preventDefault();
        this.dispatchEvent(new CustomEvent('navigate-to', { 
          detail: { page: 'question-page' },
          bubbles: true
        }));
      };
    });
  }
}

customElements.define('task-list', TaskList);
