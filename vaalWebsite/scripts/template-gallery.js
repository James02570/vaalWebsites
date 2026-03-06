// template-gallery.js - Load templates from Firestore REST API
async function initTemplateGallery() {
  const templatesContainer = document.getElementById('templates-container');
  const filterIndustry = document.getElementById('filter-industry');
  const filterTier = document.getElementById('filter-tier');
  const searchInput = document.getElementById('search-templates');

  if (!templatesContainer) return;

  let templatesData = [];
  const projectId = 'vaalwebsites'; // from firebase-config

  async function loadTemplates() {
    try {
      const response = await fetch(
        `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/templates`,
        { headers: { 'Accept': 'application/json' } }
      );

      if (!response.ok) {
        throw new Error(`Firestore API error: ${response.status}`);
      }

      const data = await response.json();
      const documents = data.documents || [];

      templatesData = documents.map(doc => {
        const fields = doc.fields || {};
        return {
          id: doc.name.split('/').pop(),
          name: fields.name?.stringValue || '',
          industry: fields.industry?.stringValue || '',
          tier: fields.tier?.stringValue || '',
          description: fields.description?.stringValue || '',
          storageUrl: fields.storageUrl?.stringValue || '',
          previewFile: fields.previewFile?.stringValue || '',
          html: fields.html?.stringValue || ''
        };
      });

      if (templatesData.length === 0) {
        templatesContainer.innerHTML = '<p style="grid-column:1/-1;text-align:center;padding:40px;">No templates found in database.</p>';
        return;
      }

      renderTemplates(templatesData);
    } catch (err) {
      console.error('Failed to load templates:', err);
      templatesContainer.innerHTML = `<p style="grid-column:1/-1;text-align:center;padding:40px;color:red;">Error loading templates: ${err.message}</p>`;
    }
  }

  function renderTemplates(data) {
    if (data.length === 0) {
      templatesContainer.innerHTML = '<p style="grid-column:1/-1;text-align:center;padding:40px;">No templates match your filters.</p>';
      return;
    }

    templatesContainer.innerHTML = data.map(template => `
      <article class="template-card" data-id="${template.id}">
        <div class="template-card__image" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); width: 100%; height: 160px; display:flex; align-items:center; justify-content:center; color:white; font-size:14px;">Preview</div>
        <div class="template-card__body">
          <h3 class="template-card__title">${template.name}</h3>
          <p class="template-card__industry">${template.industry.charAt(0).toUpperCase() + template.industry.slice(1)}</p>
          <span class="template-card__tier tier-${template.tier}">${template.tier.toUpperCase()}</span>
          <p class="template-card__description">${template.description}</p>
          <div class="template-card__actions">
            <button class="template-card__view" data-id="${template.id}">View Template</button>
            <a href="#contact" class="template-card__cta" data-template-id="${template.id}">Request</a>
          </div>
        </div>
      </article>
    `).join('');

    document.querySelectorAll('.template-card__view').forEach(btn => {
      btn.addEventListener('click', e => viewTemplate(e.currentTarget.dataset.id));
    });

    document.querySelectorAll('.template-card__cta').forEach(link => {
      link.addEventListener('click', e => {
        const template = templatesData.find(t => t.id === e.currentTarget.dataset.templateId);
        if (template) sessionStorage.setItem('selectedTemplate', JSON.stringify(template));
      });
    });
  }

  function viewTemplate(templateId) {
    const template = templatesData.find(t => t.id === templateId);
    if (!template) return;

    const viewer = document.getElementById('template-viewer');
    const iframe = document.getElementById('template-iframe');

    document.getElementById('template-viewer-title').textContent = template.name;

    // Priority: html (stored in Firestore, load via srcdoc) → previewFile (local fallback)
    if (template.html && template.html.trim()) {
      iframe.srcdoc = template.html;
    } else if (template.previewFile && template.previewFile.trim()) {
      iframe.src = template.previewFile;
    } else {
      iframe.srcdoc = '<p>No preview available</p>';
    }

    const requestBtn = document.getElementById('request-template-btn');
    requestBtn.dataset.templateId = template.id;
    requestBtn.onclick = () => sessionStorage.setItem('selectedTemplate', JSON.stringify(template));

    viewer.classList.remove('hidden');
  }

  document.getElementById('close-viewer').addEventListener('click', () => {
    document.getElementById('template-viewer').classList.add('hidden');
  });

  function applyFilters() {
    const industry = filterIndustry.value;
    const tier = filterTier.value;
    const search = searchInput.value.toLowerCase();

    const filtered = templatesData.filter(template => {
      const matchIndustry = !industry || template.industry === industry;
      const matchTier = !tier || template.tier === tier;
      const matchSearch = !search || template.name.toLowerCase().includes(search) || template.description.toLowerCase().includes(search);
      return matchIndustry && matchTier && matchSearch;
    });

    renderTemplates(filtered);
  }

  filterIndustry.addEventListener('change', applyFilters);
  filterTier.addEventListener('change', applyFilters);
  searchInput.addEventListener('input', applyFilters);

  loadTemplates();
}

// Expose globally so inline scripts can call it
window.initTemplateGallery = initTemplateGallery;
