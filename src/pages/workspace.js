// Workspace Page Custom Element
let templateContent = null;

async function loadTemplate() {
  if (!templateContent) {
    const template = await import('./workspace.html?raw');
    templateContent = template.default;
  }
  return templateContent;
}

class WorkspacePage extends HTMLElement {
  constructor() {
    super();
    this.activeFilters = [];
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
    
    // Defer setup until DOM is settled
    await new Promise(resolve => requestAnimationFrame(resolve));
    this.setupFilters();
    this.setupSideMenuInitialState();
  }

  setupSideMenuNavigation() {
    const menuItems = this.querySelectorAll('goa-work-side-menu-item');
    menuItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        menuItems.forEach(i => i.current = false);
        item.current = true;
      });
    });
  }

  setupSideMenuInitialState() {
    const menuItems = this.querySelectorAll('goa-work-side-menu-item');
    if (menuItems.length > 0) {
      menuItems[0].current = true;
    }
  }

  setupFilters() {
    const searchInput = this.querySelector('#searchInput');
    const filterForm = this.querySelector('#filterForm');
    const clearStatusFilter = this.querySelector('#clearStatusFilter');
    const applyFilterBtn = this.querySelector('#applyFilterBtn');
    const filterChipsContainer = this.querySelector('#filterChipsContainer');

    // Setup work-side-menu-item navigation
    this.setupSideMenuNavigation();

    // Search input - filter as you type
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.filterTable(e.target.value, this.getStatusFilter());
      });
    }

    // Apply filter button
    if (applyFilterBtn) {
      applyFilterBtn.addEventListener('click', () => {
        const searchValue = searchInput ? searchInput.value : '';
        this.filterTable(searchValue, this.getStatusFilter());
      });
    }

    // Clear status filter button
    if (clearStatusFilter) {
      clearStatusFilter.addEventListener('click', (e) => {
        e.preventDefault();
        const radioGroup = filterForm.querySelector('goa-radio-group');
        if (radioGroup) {
          const radios = radioGroup.querySelectorAll('goa-radio-item');
          radios[0].checked = true; // Select first option (Pending Review)
        }
        this.activeFilters = this.activeFilters.filter(f => !f.startsWith('status:'));
        this.updateFilterChips();
        const searchValue = searchInput ? searchInput.value : '';
        this.filterTable(searchValue, 'Pending Review');
      });
    }

    // Update filter chips display
    this.updateFilterChips();
  }

  getStatusFilter() {
    const filterForm = this.querySelector('#filterForm');
    const radioGroup = filterForm.querySelector('goa-radio-group');
    if (radioGroup) {
      const selected = radioGroup.querySelector('goa-radio-item[checked]');
      return selected ? selected.value : '';
    }
    return '';
  }

  filterTable(searchText, statusFilter) {
    const rows = this.querySelectorAll('tbody tr');
    const searchLower = searchText.toLowerCase();

    let visibleCount = 0;
    rows.forEach(row => {
      const cells = row.querySelectorAll('td');
      let matches = true;

      // Filter by search text (check all cells)
      if (searchLower) {
        let cellMatch = false;
        cells.forEach(cell => {
          if (cell.textContent.toLowerCase().includes(searchLower)) {
            cellMatch = true;
          }
        });
        matches = matches && cellMatch;
      }

      // Filter by status
      if (statusFilter) {
        const badge = row.querySelector('goa-badge');
        if (badge) {
          matches = matches && badge.getAttribute('content') === statusFilter;
        }
      }

      row.style.display = matches ? '' : 'none';
      if (matches) visibleCount++;
    });

    // Show no results message
    const applicationsList = this.querySelector('.applications-list');
    let noResultsMsg = applicationsList.querySelector('.no-results');
    if (visibleCount === 0) {
      if (!noResultsMsg) {
        noResultsMsg = document.createElement('goa-block');
        noResultsMsg.className = 'no-results';
        noResultsMsg.setAttribute('mt', 'l');
        noResultsMsg.setAttribute('mb', 'l');
        noResultsMsg.textContent = 'No results found';
        applicationsList.appendChild(noResultsMsg);
      }
    } else if (noResultsMsg) {
      noResultsMsg.remove();
    }
  }

  updateFilterChips() {
    const filterChipsContainer = this.querySelector('#filterChipsContainer');
    if (!filterChipsContainer) return;

    filterChipsContainer.innerHTML = '';

    if (this.activeFilters.length > 0) {
      const filterLabel = document.createElement('goa-text');
      filterLabel.setAttribute('tag', 'span');
      filterLabel.setAttribute('color', 'secondary');
      filterLabel.setAttribute('mb', 'xs');
      filterLabel.setAttribute('mr', 'xs');
      filterLabel.textContent = 'Filter:';
      filterChipsContainer.appendChild(filterLabel);

      this.activeFilters.forEach(filter => {
        const chip = document.createElement('goa-filter-chip');
        chip.setAttribute('content', filter);
        chip.setAttribute('mb', 'xs');
        chip.setAttribute('mr', 'xs');
        chip.addEventListener('click', () => this.removeFilter(filter));
        filterChipsContainer.appendChild(chip);
      });

      const clearAllBtn = document.createElement('goa-button');
      clearAllBtn.setAttribute('type', 'tertiary');
      clearAllBtn.setAttribute('size', 'compact');
      clearAllBtn.setAttribute('mb', 'xs');
      clearAllBtn.textContent = 'Clear all';
      clearAllBtn.addEventListener('click', () => this.clearAllFilters());
      filterChipsContainer.appendChild(clearAllBtn);
    }
  }

  removeFilter(filter) {
    this.activeFilters = this.activeFilters.filter(f => f !== filter);
    this.updateFilterChips();
    const searchInput = this.querySelector('#searchInput');
    const searchValue = searchInput ? searchInput.value : '';
    this.filterTable(searchValue, this.getStatusFilter());
  }

  clearAllFilters() {
    this.activeFilters = [];
    const searchInput = this.querySelector('#searchInput');
    if (searchInput) searchInput.value = '';
    const filterForm = this.querySelector('#filterForm');
    const radioGroup = filterForm.querySelector('goa-radio-group');
    if (radioGroup) {
      const radios = radioGroup.querySelectorAll('goa-radio-item');
      radios[0].checked = true;
    }
    this.updateFilterChips();
    this.filterTable('', 'Pending Review');
  }
}

customElements.define('workspace-page', WorkspacePage);
