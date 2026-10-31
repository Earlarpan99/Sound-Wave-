const yearEl = document.getElementById('year');
const form = document.getElementById('signup-form');

document.addEventListener('keydown', (event) => {
  if (!event.ctrlKey || event.key.toLowerCase() !== 'g') return;

  event.preventDefault();

  let dialog = document.getElementById('admin-password-dialog');

  if (!dialog) {
    dialog = document.createElement('dialog');
    dialog.id = 'admin-password-dialog';
    dialog.className = 'admin-password-dialog';
    dialog.innerHTML = `
      <form class="admin-password-form">
        <h2>Admin access</h2>
        <label for="admin-password">Admin password</label>
        <input id="admin-password" type="password" autocomplete="current-password" required />
        <p class="admin-password-status" role="status">Password verification is not configured yet.</p>
        <div class="admin-password-actions">
          <button type="button" class="admin-password-cancel">Cancel</button>
          <button type="submit">Continue</button>
        </div>
      </form>`;
    document.body.append(dialog);

    const passwordForm = dialog.querySelector('form');
    const passwordInput = dialog.querySelector('input');
    const status = dialog.querySelector('.admin-password-status');

    passwordForm.addEventListener('submit', (submitEvent) => {
      submitEvent.preventDefault();
      passwordInput.value = '';
      status.textContent = 'Password verification is not configured yet.';
      passwordInput.focus();
    });

    dialog.querySelector('.admin-password-cancel').addEventListener('click', () => {
      dialog.close();
    });
  }

  if (!dialog.open) dialog.showModal();
  dialog.querySelector('input').focus();
});

if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

if (form) {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const emailInput = form.querySelector('input[type="email"]');
    const button = form.querySelector('button');

    if (!emailInput) return;

    button.textContent = 'You’re in!';
    button.disabled = true;
    emailInput.value = '';
    emailInput.placeholder = 'Thanks for joining';
  });
}

const batchesPage = document.querySelector('[data-batches-page]');

if (batchesPage) {
  initializeBatchesPage(batchesPage);
}

function initializeBatchesPage(pageRoot) {
  const batchRecords = [
    {
      name: 'G6 B1_Cambridge HS_2026-27',
      grade: 'Grade 6',
      curriculum: 'IGCSE',
      section: 'G6 B1',
      status: 'active',
      subjects: [
        'Hindi',
        'Social Studies',
        'Global Perspective',
        'French',
        'Maths',
        'ICT',
        'Science',
        'Marathi',
        'Arts',
        'English',
        'Financial Literacy',
      ],
      teacher: 'AR',
      members: 44,
      href: 'batch.html',
    },
  ];
  const results = pageRoot.querySelector('#batch-results');
  const emptyState = pageRoot.querySelector('#batch-empty-state');
  const errorState = pageRoot.querySelector('#batch-load-error');
  const cardTemplate = document.querySelector('#batch-card-template');
  const searchInput = pageRoot.querySelector('#batch-search');
  const clearSearchButton = pageRoot.querySelector('.clear-search');
  const resetSearchButton = pageRoot.querySelector('.reset-search');
  const rowsPerPageSelect = pageRoot.querySelector('#rows-per-page');
  const paginationSummary = pageRoot.querySelector('#pagination-summary');
  const pageIndicator = pageRoot.querySelector('#page-indicator');
  const resultSummary = pageRoot.querySelector('#batch-results-summary');
  const pageButtons = pageRoot.querySelectorAll('[data-page]');
  const statusTabs = pageRoot.querySelectorAll('[data-status]');
  let batches = [];
  let activeStatus = 'active';
  let searchTerm = '';
  let currentPage = 1;
  let pageSize = Number(rowsPerPageSelect.value);

  function createBatchCard(batch) {
    const batchCard = cardTemplate.content.firstElementChild.cloneNode(true);
    const statusPill = batchCard.querySelector('.batch-status-pill');
    const subjects = batchCard.querySelector('[data-field="subjects"]');

    batchCard.href = batch.href;
    batchCard.setAttribute('aria-label', `Open ${batch.name}, ${batch.members} members, ${batch.status}`);
    batchCard.querySelector('[data-field="name"]').textContent = batch.name;
    batchCard.querySelector('[data-field="grade"]').textContent = batch.grade;
    batchCard.querySelector('[data-field="curriculum"]').textContent = batch.curriculum;
    batchCard.querySelector('[data-field="section"]').textContent = batch.section;
    batchCard.querySelector('[data-field="status"]').textContent = batch.status === 'active' ? 'Active' : 'Inactive';
    batchCard.querySelector('[data-field="teacher"]').textContent = batch.teacher;
    batchCard.querySelector('[data-field="members"]').textContent = `${batch.members} members`;
    statusPill.dataset.status = batch.status;

    batch.subjects.forEach((subject) => {
      const badge = document.createElement('span');
      badge.textContent = subject;
      subjects.append(badge);
    });

    return batchCard;
  }

  function getVisibleBatches() {
    const normalizedSearch = searchTerm.trim().toLocaleLowerCase();

    return batches.filter((batch) => {
      const matchesStatus = batch.status === activeStatus;
      const searchableText = `${batch.name} ${batch.section} ${batch.grade} ${batch.curriculum}`.toLocaleLowerCase();
      return matchesStatus && (!normalizedSearch || searchableText.includes(normalizedSearch));
    });
  }

  function updateTabs() {
    const activeCount = batches.filter((batch) => batch.status === 'active').length;
    const inactiveCount = batches.filter((batch) => batch.status === 'inactive').length;

    pageRoot.querySelector('[data-count="active"]').textContent = activeCount;
    pageRoot.querySelector('[data-count="inactive"]').textContent = inactiveCount;
    pageRoot.querySelector('[data-total-batches]').textContent = batches.length;
    pageRoot.querySelector('.batches-total span').textContent = batches.length === 1 ? 'total batch' : 'total batches';

    statusTabs.forEach((tab) => {
      const isSelected = tab.dataset.status === activeStatus;
      tab.classList.toggle('active', isSelected);
      tab.setAttribute('aria-selected', String(isSelected));
      tab.tabIndex = isSelected ? 0 : -1;
    });

    results.setAttribute('aria-labelledby', activeStatus === 'active' ? 'active-tab' : 'inactive-tab');
  }

  function render() {
    updateTabs();
    const visibleBatches = getVisibleBatches();
    const totalPages = Math.max(1, Math.ceil(visibleBatches.length / pageSize));
    currentPage = Math.min(currentPage, totalPages);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, visibleBatches.length);
    const pageBatches = visibleBatches.slice(startIndex, endIndex);
    const hasResults = pageBatches.length > 0;
    const hasSearch = searchTerm.trim().length > 0;

    results.replaceChildren(...pageBatches.map(createBatchCard));
    results.hidden = !hasResults;
    results.setAttribute('aria-busy', 'false');
    emptyState.hidden = hasResults;
    errorState.hidden = true;
    pageRoot.querySelector('.data-footer').hidden = false;
    clearSearchButton.hidden = !hasSearch;
    resetSearchButton.hidden = !hasSearch;

    if (!hasResults) {
      pageRoot.querySelector('[data-empty-title]').textContent = hasSearch ? 'No matching batches' : `No ${activeStatus} batches`;
      pageRoot.querySelector('[data-empty-description]').textContent = hasSearch
        ? 'Try another batch name or clear your search.'
        : 'There are no batches in this status yet.';
    }

    resultSummary.textContent = hasResults
      ? `Showing ${startIndex + 1}-${endIndex} of ${visibleBatches.length} ${visibleBatches.length === 1 ? 'batch' : 'batches'}`
      : `Showing 0 of ${visibleBatches.length} ${visibleBatches.length === 1 ? 'batch' : 'batches'}`;
    paginationSummary.textContent = `${hasResults ? startIndex + 1 : 0}-${endIndex} of ${visibleBatches.length}`;
    pageIndicator.textContent = `${currentPage} / ${totalPages}`;
    pageIndicator.setAttribute('aria-label', `Page ${currentPage} of ${totalPages}`);
    pageButtons.forEach((button) => {
      button.disabled = button.dataset.page === 'previous' ? currentPage <= 1 : currentPage >= totalPages;
    });
  }

  function showLoading() {
    results.hidden = false;
    results.setAttribute('aria-busy', 'true');
    results.innerHTML = `
      <div class="batch-skeleton" aria-hidden="true">
        <span class="skeleton-line skeleton-title"></span>
        <span class="skeleton-line skeleton-meta"></span>
        <span class="skeleton-line skeleton-meta-short"></span>
        <div class="skeleton-badges"><i></i><i></i><i></i><i></i></div>
        <span class="skeleton-line skeleton-footer"></span>
      </div>`;
    emptyState.hidden = true;
    errorState.hidden = true;
    pageRoot.querySelector('.data-footer').hidden = true;
  }

  async function loadBatches() {
    showLoading();

    try {
      batches = await Promise.resolve(batchRecords);
      currentPage = 1;
      render();
    } catch (error) {
      results.hidden = true;
      results.setAttribute('aria-busy', 'false');
      emptyState.hidden = true;
      errorState.hidden = false;
      pageRoot.querySelector('.data-footer').hidden = true;
    }
  }

  searchInput.addEventListener('input', () => {
    searchTerm = searchInput.value;
    currentPage = 1;
    render();
  });

  clearSearchButton.addEventListener('click', () => {
    searchInput.value = '';
    searchTerm = '';
    currentPage = 1;
    render();
    searchInput.focus();
  });

  resetSearchButton.addEventListener('click', () => {
    searchInput.value = '';
    searchTerm = '';
    currentPage = 1;
    render();
    searchInput.focus();
  });

  statusTabs.forEach((tab, tabIndex) => {
    tab.addEventListener('click', () => {
      activeStatus = tab.dataset.status;
      currentPage = 1;
      render();
    });

    tab.addEventListener('keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const nextIndex = event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? statusTabs.length - 1
          : (tabIndex + (event.key === 'ArrowRight' ? 1 : -1) + statusTabs.length) % statusTabs.length;
      const nextTab = statusTabs[nextIndex];
      activeStatus = nextTab.dataset.status;
      currentPage = 1;
      render();
      nextTab.focus();
    });
  });

  rowsPerPageSelect.addEventListener('change', () => {
    pageSize = Number(rowsPerPageSelect.value);
    currentPage = 1;
    render();
  });

  pageButtons.forEach((button) => {
    button.addEventListener('click', () => {
      currentPage += button.dataset.page === 'next' ? 1 : -1;
      render();
    });
  });

  pageRoot.querySelector('[data-retry]').addEventListener('click', loadBatches);

  document.addEventListener('keydown', (event) => {
    const isTyping = event.target instanceof HTMLElement
      && (event.target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target.tagName));

    if (event.key === '/' && !isTyping && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault();
      searchInput.focus();
    }

    if (event.key === 'Escape' && event.target === searchInput && searchInput.value) {
      searchInput.value = '';
      searchTerm = '';
      currentPage = 1;
      render();
    }
  });

  loadBatches();
}
