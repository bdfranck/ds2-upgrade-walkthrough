// Question Page Custom Element
let templateContent = null;

async function loadTemplate() {
  if (!templateContent) {
    const template = await import('./question.html?raw');
    templateContent = template.default;
  }
  return templateContent;
}

class QuestionPage extends HTMLElement {
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

    // Add click handler to back link
    const backLink = this.querySelector('.back-link, goa-link.back-link');
    if (backLink) {
      backLink.onclick = (e) => {
        e.preventDefault();
        this.dispatchEvent(new CustomEvent('navigate-to', { 
          detail: { page: 'public-form' },
          bubbles: true
        }));
      };
    }

    // Add click handler to Save and continue button
    const saveBtn = this.querySelector('goa-button[type="submit"]');
    if (saveBtn) {
      saveBtn.onclick = (e) => {
        e.preventDefault();
        this.dispatchEvent(new CustomEvent('navigate-to', { 
          detail: { page: 'review-page' },
          bubbles: true
        }));
      };
    }
  }
}

customElements.define('question-page', QuestionPage);
