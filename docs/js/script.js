console.log('script.js loaded – Split is', typeof Split);

// Configure CETEI behaviors
const behaviors = {
  "tei": {
    "l": function(element) {
      // Ensure line numbers are preserved
      let num = element.getAttribute("n");
      if (num) {
        element.setAttribute("n", num);
        // Add a data attribute to the line for linking
        element.setAttribute("data-line", num);
      }
      return false; // Return false to let CETEI handle the rest
    },
    "hi": function(element) {
      let rend = element.getAttribute("rend");
      if (rend) {
        element.setAttribute("rend", rend);
      }
      return false;
    }
  }
};

// Initialize CETEI with behaviors
const cetei = new CETEI();
cetei.addBehaviors(behaviors);

// ============================================================================
// PANEL MANAGEMENT SYSTEM
// ============================================================================

// Panel types
const PANEL_TYPES = {
  TRANSCRIPTION: 'transcription',
  VIEWER: 'viewer',
  COMPANION: 'companion'
};

// Store OpenSeadragon instances per panel
const osdViewers = new Map();

// Store panel states
const panelStates = new Map();

// Store witness XML cache (shared across panels)
const witnessXmlCache = {};

// Helper to construct IIIF manifest URLs
function getManifestUrl(poem, witness) {
  if (witness === 'P') {
    return 'data/iiif-manifests/witness-P.json';
  } else if (witness === 'Y') {
    return 'data/iiif-manifests/witness-Y.json';
  } else if (witness === 'S') {
    return 'data/iiif-manifests/witness-S.json';
  }
  return null;
}

// Get panel-scoped element
function getPanelElement(panel, selector) {
  return panel.querySelector(selector);
}

// Get all panel-scoped elements
function getPanelElements(panel, selector) {
  return panel.querySelectorAll(selector);
}

// Get panel type from data attribute
function getPanelType(panel) {
  return panel.dataset.panelType || PANEL_TYPES.TRANSCRIPTION;
}

// Set panel type
function setPanelType(panel, type) {
  panel.dataset.panelType = type;
}

// Get panel state
function getPanelState(panel) {
  const panelId = panel.id;
  if (!panelStates.has(panelId)) {
    panelStates.set(panelId, {
      type: getPanelType(panel),
      poem: '',
      witness: '',
      activeWitness: null,
      companionExtras: ['commentary']
    });
  }
  return panelStates.get(panelId);
}

// Save panel state
function savePanelState(panel) {
  const state = getPanelState(panel);
  const type = getPanelType(panel);
  
  if (type === PANEL_TYPES.TRANSCRIPTION) {
    const poemSelect = getPanelElement(panel, '.poem-select');
    const witnessSelect = getPanelElement(panel, '.witness-select');
    if (poemSelect) state.poem = poemSelect.value;
    if (witnessSelect) state.witness = witnessSelect.value;
  } else if (type === PANEL_TYPES.VIEWER) {
    const activeBtn = getPanelElement(panel, '.witness-buttons button.active');
    if (activeBtn) {
      state.activeWitness = activeBtn.dataset.witness;
    }
    const poemSelect = getPanelElement(panel, '.poem-select');
    if (poemSelect) state.poem = poemSelect.value;
  } else if (type === PANEL_TYPES.COMPANION) {
    const checkboxes = getPanelElements(panel, '.companion-controls input:checked');
    state.companionExtras = Array.from(checkboxes).map(cb => cb.dataset.extra);
    const poemSelect = getPanelElement(panel, '.poem-select');
    if (poemSelect) state.poem = poemSelect.value;
  }
}

// Restore panel state
function restorePanelState(panel) {
  const state = getPanelState(panel);
  const type = getPanelType(panel);
  
  if (type === PANEL_TYPES.TRANSCRIPTION) {
    const poemSelect = getPanelElement(panel, '.poem-select');
    const witnessSelect = getPanelElement(panel, '.witness-select');
    if (poemSelect && state.poem) {
      poemSelect.value = state.poem;
      poemSelect.dispatchEvent(new Event('change'));
    }
    if (witnessSelect && state.witness) {
      witnessSelect.value = state.witness;
      witnessSelect.dispatchEvent(new Event('change'));
    }
  } else if (type === PANEL_TYPES.VIEWER) {
    const poemSelect = getPanelElement(panel, '.poem-select');
    if (poemSelect && state.poem) {
      poemSelect.value = state.poem;
      poemSelect.dispatchEvent(new Event('change'));
    }
    if (state.activeWitness) {
      const witnessBtn = getPanelElement(panel, `.witness-buttons button[data-witness="${state.activeWitness}"]`);
      if (witnessBtn) {
        witnessBtn.click();
      }
    }
  } else if (type === PANEL_TYPES.COMPANION) {
    const poemSelect = getPanelElement(panel, '.poem-select');
    if (poemSelect && state.poem) {
      poemSelect.value = state.poem;
      poemSelect.dispatchEvent(new Event('change'));
    }
    state.companionExtras.forEach(extra => {
      const checkbox = getPanelElement(panel, `.companion-controls input[data-extra="${extra}"]`);
      if (checkbox) checkbox.checked = true;
    });
    updateCompanionPanel(panel);
  }
}

// Panel type templates
function createTranscriptionPanelBody() {
  const div = document.createElement('div');
  div.className = 'panel-body';
  div.innerHTML = `
    <select class="poem-select">
      <option value="">Select a poem…</option>
    </select>
    <label class="witness-label">Witness:</label>
    <select class="witness-select">
      <option value="" selected>Select a witness...</option>
      <option value="P">P</option>
      <option value="Y">Y</option>
      <option value="S">S</option>
      <option value="LL">LL</option>
    </select>
    <div class="text-content">
      <p>Please select a poem to see its text.</p>
    </div>
  `;
  
  // Populate poem select
  const poemSelect = div.querySelector('.poem-select');
  Object.keys(companionData).forEach(poem => {
    const opt = document.createElement('option');
    opt.value = poem;
    opt.textContent = `Amores ${poem}`;
    poemSelect.appendChild(opt);
  });
  
  return div;
}

function createViewerPanelBody() {
  const div = document.createElement('div');
  div.className = 'panel-body';
  div.innerHTML = `
    <select class="poem-select">
      <option value="">Select a poem…</option>
    </select>
    <div class="witness-buttons">
      <button data-witness="P">Witness P</button>
      <button data-witness="Y">Witness Y</button>
      <button data-witness="S">Witness S</button>
    </div>
    <div class="viewer"></div>
    <div class="page-controls">
      <button class="prev-page" disabled>&larr;</button>
      <span class="page-indicator"></span>
      <input type="number" class="page-input" min="1" disabled>
      <button class="go-to-page" disabled>Go</button>
      <button class="next-page" disabled>&rarr;</button>
    </div>
    <div class="progress-container">
      <div class="progress-bar"></div>
    </div>
  `;
  
  // Populate poem select
  const poemSelect = div.querySelector('.poem-select');
  Object.keys(companionData).forEach(poem => {
    const opt = document.createElement('option');
    opt.value = poem;
    opt.textContent = `Amores ${poem}`;
    poemSelect.appendChild(opt);
  });
  
  return div;
}

function createCompanionPanelBody() {
  const div = document.createElement('div');
  div.className = 'panel-body';
  div.innerHTML = `
    <select class="poem-select">
      <option value="">Select a poem…</option>
    </select>
    <div class="companion-controls">
      <label><input type="checkbox" data-extra="commentary" checked> Commentary</label>
      <label><input type="checkbox" data-extra="text-commentary"> Text Commentary</label>
      <label><input type="checkbox" data-extra="vocab"> Vocabulary</label>
    </div>
    <div class="extra-content">
      <p>Choose a companion feature to display.</p>
    </div>
  `;
  
  // Populate poem select
  const poemSelect = div.querySelector('.poem-select');
  Object.keys(companionData).forEach(poem => {
    const opt = document.createElement('option');
    opt.value = poem;
    opt.textContent = `Amores ${poem}`;
    poemSelect.appendChild(opt);
  });
  
  return div;
}

// Switch panel type
function switchPanelType(panel, newType) {
  if (getPanelType(panel) === newType) {
    return; // Already this type
  }
  
  // Save current state
  savePanelState(panel);
  
  // Destroy OpenSeadragon if switching away from viewer
  if (getPanelType(panel) === PANEL_TYPES.VIEWER) {
    const panelId = panel.id;
    if (osdViewers.has(panelId)) {
      osdViewers.get(panelId).destroy();
      osdViewers.delete(panelId);
    }
  }
  
  // Set new type
  setPanelType(panel, newType);
  
  // Remove old body
  const oldBody = getPanelElement(panel, '.panel-body');
  if (oldBody) {
    oldBody.remove();
  }
  
  // Create new body based on type
  let newBody;
  if (newType === PANEL_TYPES.TRANSCRIPTION) {
    newBody = createTranscriptionPanelBody();
  } else if (newType === PANEL_TYPES.VIEWER) {
    newBody = createViewerPanelBody();
  } else if (newType === PANEL_TYPES.COMPANION) {
    newBody = createCompanionPanelBody();
  }
  
  // Insert new body
  const header = getPanelElement(panel, '.panel-header');
  if (header && newBody) {
    header.insertAdjacentElement('afterend', newBody);
  }
  
  // Attach event handlers for new panel type
  attachPanelEventHandlers(panel);
  
  // Restore state
  restorePanelState(panel);
  
  // Update header dropdown
  updatePanelHeaderDropdown(panel);
}

// Update panel header dropdown
function updatePanelHeaderDropdown(panel) {
  const dropdown = getPanelElement(panel, '.panel-type-select');
  if (dropdown) {
    dropdown.value = getPanelType(panel);
  }
}

// Create panel header with dropdown
function createPanelHeader(type, title) {
  const header = document.createElement('div');
  header.className = 'panel-header';
  header.innerHTML = `
    <span class="drag-handle" title="Drag to reorder">☰</span>
    <select class="panel-type-select">
      <option value="${PANEL_TYPES.TRANSCRIPTION}">Transcription</option>
      <option value="${PANEL_TYPES.VIEWER}">IIIF Viewer</option>
      <option value="${PANEL_TYPES.COMPANION}">Companion</option>
    </select>
    <button class="toggle-btn" title="Collapse panel">×</button>
  `;
  
  const dropdown = header.querySelector('.panel-type-select');
  dropdown.value = type;
  
  return header;
}

// ============================================================================
// PANEL-SCOPED FUNCTIONS
// ============================================================================

// Update UI for viewer panel
function updateViewerUI(panel, currentPage, totalPages) {
  const pageIndicator = getPanelElement(panel, '.page-indicator');
  const pageInput = getPanelElement(panel, '.page-input');
  const progressBar = getPanelElement(panel, '.progress-bar');
  
  if (pageIndicator) {
    pageIndicator.textContent = `${currentPage + 1} / ${totalPages}`;
  }
  
  if (pageInput) {
    pageInput.value = currentPage + 1;
    pageInput.max = totalPages;
  }
  
  if (progressBar) {
    const progress = totalPages > 1 ? (currentPage / (totalPages - 1)) * 100 : 0;
    progressBar.style.width = `${progress}%`;
  }
}

// Update page buttons for viewer panel
function updateViewerPageButtons(panel) {
  const panelId = panel.id;
  if (!osdViewers.has(panelId)) return;
  
  const osdViewer = osdViewers.get(panelId);
  const currentPage = osdViewer.currentPage();
  const totalPages = osdViewer.tileSources.length;
  
  const prevBtn = getPanelElement(panel, '.prev-page');
  const nextBtn = getPanelElement(panel, '.next-page');
  const pageInput = getPanelElement(panel, '.page-input');
  const goToPageBtn = getPanelElement(panel, '.go-to-page');
  
  if (prevBtn) prevBtn.disabled = currentPage === 0;
  if (nextBtn) nextBtn.disabled = currentPage === totalPages - 1;
  if (pageInput) pageInput.disabled = false;
  if (goToPageBtn) goToPageBtn.disabled = false;
}

// Load manifest for a specific panel
async function loadManifest(panel, poem, witness) {
  const viewerEl = getPanelElement(panel, '.viewer');
  if (!viewerEl) return;
  
  const panelId = panel.id;
  const manifestUrl = getManifestUrl(poem, witness);
  
  if (!manifestUrl) {
    if (osdViewers.has(panelId)) {
      await osdViewers.get(panelId).destroy();
      osdViewers.delete(panelId);
    }
    viewerEl.innerHTML = '<p class="viewer-placeholder">IIIF manifest not available for this witness.</p>';
    return;
  }
  
  // Destroy existing viewer
  if (osdViewers.has(panelId)) {
    await osdViewers.get(panelId).destroy();
    osdViewers.delete(panelId);
  }
  
  // Disable controls
  const prevBtn = getPanelElement(panel, '.prev-page');
  const nextBtn = getPanelElement(panel, '.next-page');
  const pageInput = getPanelElement(panel, '.page-input');
  const goToPageBtn = getPanelElement(panel, '.go-to-page');
  const pageIndicator = getPanelElement(panel, '.page-indicator');
  const progressBar = getPanelElement(panel, '.progress-bar');
  
  if (prevBtn) prevBtn.disabled = true;
  if (nextBtn) nextBtn.disabled = true;
  if (pageInput) pageInput.disabled = true;
  if (goToPageBtn) goToPageBtn.disabled = true;
  if (pageIndicator) pageIndicator.textContent = '';
  if (progressBar) progressBar.style.width = '0%';
  
  // Fetch manifest
  let manifest;
  try {
    const resp = await fetch(manifestUrl);
    manifest = await resp.json();
  } catch (e) {
    viewerEl.innerHTML = '<p>Failed to load IIIF manifest.</p>';
    return;
  }
  
  // Validate manifest exists
  if (!manifest) {
    viewerEl.innerHTML = '<p>Failed to load IIIF manifest.</p>';
    return;
  }
  
  // Extract tile sources
  const canvases = manifest.sequences?.[0]?.canvases || manifest.items || [];
  const tileSources = canvases.map(canvas => {
    let imageService = null;
    if (canvas.images && canvas.images[0]?.resource?.service) {
      imageService = canvas.images[0].resource.service['@id'] || canvas.images[0].resource.service.id;
    } else if (canvas.image && canvas.image.service) {
      imageService = canvas.image.service['@id'] || canvas.image.service.id;
    } else if (canvas.items && canvas.items[0]?.items && canvas.items[0].items[0]?.body?.service) {
      imageService = canvas.items[0].items[0].body.service['@id'] || canvas.items[0].items[0].body.service.id;
    }
    if (imageService && canvas.height && canvas.width) {
      return {
        '@context': 'http://iiif.io/api/image/2/context.json',
        '@id': imageService,
        'height': canvas.height,
        'width': canvas.width,
        'profile': [ 'http://iiif.io/api/image/2/level2.json' ],
        'protocol': 'http://iiif.io/api/image',
        'tiles': [{
          'scaleFactors': [1,2,4,8,16,32],
          'width': 1024
        }]
      };
    }
    return null;
  }).filter(Boolean);
  
  if (!tileSources.length) {
    viewerEl.innerHTML = '<p>No IIIF images found in manifest.</p>';
    return;
  }
  
  // Determine initial page
  let initialPage = 0;
  const poemIndex = parseInt(poem.split('.')[1]) - 1;
  const pageTarget = witnessPageData[witness] && witnessPageData[witness][poemIndex];
  
  if (pageTarget !== null && pageTarget !== undefined) {
    if (typeof pageTarget === 'number' && pageTarget < canvases.length) {
      initialPage = pageTarget;
    } else if (typeof pageTarget === 'string') {
      const pageIndex = canvases.findIndex(canvas => canvas.label === pageTarget);
      if (pageIndex !== -1) {
        initialPage = pageIndex;
      }
    }
  }
  
  // Ensure viewer element has dimensions before initializing OpenSeadragon
  // Use requestAnimationFrame to ensure DOM is ready and dimensions are calculated
  requestAnimationFrame(() => {
    // Check if element has dimensions
    const rect = viewerEl.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      // If no dimensions yet, wait a bit more
      setTimeout(() => {
        initializeOpenSeadragon();
      }, 100);
    } else {
      initializeOpenSeadragon();
    }
  });
  
  function initializeOpenSeadragon() {
    // Create OpenSeadragon instance
    const osdViewer = OpenSeadragon({
      element: viewerEl,
      prefixUrl: 'https://openseadragon.github.io/openseadragon/images/',
      tileSources: tileSources,
      sequenceMode: true,
      initialPage: initialPage,
      crossOriginPolicy: 'Anonymous'
    });
    
    osdViewers.set(panelId, osdViewer);
    
    osdViewer.addHandler('open', () => {
      updateViewerPageButtons(panel);
      updateViewerUI(panel, osdViewer.currentPage(), osdViewer.tileSources.length);
    });
    
    osdViewer.addHandler('page', (event) => {
      updateViewerUI(panel, event.page, osdViewer.tileSources.length);
      updateViewerPageButtons(panel);
    });
  }
}

// Load transcription from XML for a specific panel
async function loadTranscriptionFromXml(panel, poem, witness) {
  const textContent = getPanelElement(panel, '.text-content');
  if (!textContent) return;
  
  if (!poem || !witness) {
    textContent.innerHTML = '<p>Please select a poem and a witness.</p>';
    return;
  }
  
  const xmlPath = witnessFiles[witness];
  if (!xmlPath) {
    textContent.innerHTML = `<p>No data file specified for witness ${witness}.</p>`;
    return;
  }
  
  try {
    let xmlDoc;
    if (witnessXmlCache[witness]) {
      xmlDoc = witnessXmlCache[witness];
    } else {
      const response = await fetch(xmlPath);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${xmlPath}`);
      }
      const xmlString = await response.text();
      const parser = new DOMParser();
      xmlDoc = parser.parseFromString(xmlString, 'application/xml');
      witnessXmlCache[witness] = xmlDoc;
    }
    
    const poemNode = xmlDoc.querySelector(`poem[n="${poem}"] > TEI`);
    
    if (poemNode && poemNode.firstElementChild) {
      const serializer = new XMLSerializer();
      const teiString = serializer.serializeToString(poemNode);
      const teiDoc = new DOMParser().parseFromString(teiString, "application/xml");
      
      const html = cetei.domToHTML5(teiDoc);
      textContent.innerHTML = '';
      textContent.appendChild(html);
      setupHighlightListeners(panel);
    } else {
      textContent.innerHTML = '<p>Transcription not available for this poem.</p>';
    }
  } catch (e) {
    console.error('Error loading or processing transcription:', e);
    textContent.innerHTML = '<p>Error loading transcription data.</p>';
  }
}

// Update transcription for a specific panel
function updateTranscription(panel, poem, witness) {
  if (witness) {
    loadTranscriptionFromXml(panel, poem, witness);
  } else {
    const textContent = getPanelElement(panel, '.text-content');
    if (textContent) {
      textContent.innerHTML = '<p>Select a witness to see the transcription.</p>';
    }
  }
}

// Update companion panel for a specific panel
async function updateCompanionPanel(panel) {
  const poemSelect = getPanelElement(panel, '.poem-select');
  const extraContent = getPanelElement(panel, '.extra-content');
  
  if (!poemSelect || !extraContent) return;
  
  const poem = poemSelect.value;
  if (!poem) {
    extraContent.innerHTML = '<p>Please select a poem.</p>';
    return;
  }
  
  const companionCheckboxes = getPanelElements(panel, '.companion-controls input');
  const selectedExtras = Array.from(companionCheckboxes)
                              .filter(cb => cb.checked)
                              .map(cb => cb.dataset.extra);
  
  if (selectedExtras.length === 0) {
    extraContent.innerHTML = '<p>Select a companion feature to display.</p>';
    return;
  }
  
  extraContent.innerHTML = '<p>Loading...</p>';
  
  try {
    const fetchPromises = selectedExtras.map(extra => {
      const toPascalCase = s => s.replace(/-(\w)/g, (_, c) => c.toUpperCase()).replace(/^\w/, c => c.toUpperCase());
      const extraName = toPascalCase(extra);
      const path = `data/Companion/${extraName}/${poem}.json`;
      return fetch(path).then(res => res.json().catch(() => ({})));
    });
    
    const datasets = await Promise.all(fetchPromises);
    const combinedData = {};
    
    datasets.forEach((data, index) => {
      const extra = selectedExtras[index];
      for (const lineRange in data) {
        if (!combinedData[lineRange]) {
          combinedData[lineRange] = {};
        }
        combinedData[lineRange][extra] = data[lineRange];
      }
    });
    
    const lineNumbers = Object.keys(combinedData).sort((a, b) => {
      const aStart = parseInt(a.split('-')[0]);
      const bStart = parseInt(b.split('-')[0]);
      return aStart - bStart;
    });
    
    if (lineNumbers.length === 0) {
      extraContent.innerHTML = '<p>No companion data available for this selection.</p>';
      return;
    }
    
    let html = '';
    for (const lineRange of lineNumbers) {
      const linePrefix = `<span class="line-ref">${lineRange}.</span>`;
      let linePrefixAdded = false;
      
      for (const extraName of selectedExtras) {
        if (combinedData[lineRange][extraName]) {
          const colorClass = `${extraName.toLowerCase()}-color`;
          const content = combinedData[lineRange][extraName].replace(/\n/g, '<br>');
          html += `<div class="companion-item ${extraName} ${colorClass}" data-line-range="${lineRange}">`;
          if (!linePrefixAdded) {
            html += `${linePrefix} ${content}`;
            linePrefixAdded = true;
          } else {
            html += content;
          }
          html += `</div>`;
        }
      }
    }
    
    extraContent.innerHTML = html;
    setupHighlightListeners(panel);
  } catch (error) {
    console.error('Failed to load companion data:', error);
    extraContent.innerHTML = '<p>Error loading companion data. See console for details.</p>';
  }
}

// Setup highlight listeners for a specific panel
function setupHighlightListeners(panel) {
  const textContent = getPanelElement(panel, '.text-content');
  const extraContent = getPanelElement(panel, '.extra-content');
  
  if (!textContent && !extraContent) return;
  
  // Get all transcription and companion panels for cross-panel highlighting
  const allTextPanels = Array.from(document.querySelectorAll('section[data-panel-type="transcription"]'));
  const allCompanionPanels = Array.from(document.querySelectorAll('section[data-panel-type="companion"]'));
  
  const allTextContents = allTextPanels.map(p => getPanelElement(p, '.text-content')).filter(Boolean);
  const allExtraContents = allCompanionPanels.map(p => getPanelElement(p, '.extra-content')).filter(Boolean);
  
  const allElements = () => {
    const elements = [];
    allTextContents.forEach(tc => {
      elements.push(...tc.querySelectorAll('[data-line]'));
    });
    allExtraContents.forEach(ec => {
      elements.push(...ec.querySelectorAll('[data-line-range]'));
    });
    return elements;
  };
  
  const clearHighlights = () => {
    allElements().forEach(el => el.classList.remove('highlight'));
  };
  
  const handleMouseover = (event) => {
    const target = event.target.closest('[data-line], [data-line-range]');
    if (!target) return;
    
    clearHighlights();
    
    const isTextLine = target.matches('[data-line]');
    const isCompanionItem = target.matches('[data-line-range]');
    
    if (isTextLine) {
      const line = parseInt(target.dataset.line, 10);
      if (!isNaN(line)) {
        allExtraContents.forEach(extraContent => {
          const companionItems = extraContent.querySelectorAll('[data-line-range]');
          companionItems.forEach(item => {
            const [start, end] = item.dataset.lineRange.split('-').map(Number);
            const itemRange = Array.from({ length: (end || start) - start + 1 }, (_, i) => start + i);
            if (itemRange.includes(line)) {
              item.classList.add('highlight');
            }
          });
        });
      }
    } else if (isCompanionItem) {
      const range = target.dataset.lineRange;
      if (range) {
        const [start, end] = range.split('-').map(Number);
        const lineNumbers = Array.from({ length: (end || start) - start + 1 }, (_, i) => start + i);
        lineNumbers.forEach(ln => {
          allTextContents.forEach(textContent => {
            const teiLine = textContent.querySelector(`[data-line="${ln}"]`);
            if (teiLine) teiLine.classList.add('highlight');
          });
        });
      }
    }
  };
  
  const handleClick = (event) => {
    const target = event.target.closest('[data-line], [data-line-range]');
    if (!target) return;
    
    let elementToScrollTo;
    if (target.matches('[data-line]')) {
      const line = target.dataset.line;
      // Find in any companion panel
      for (const extraContent of allExtraContents) {
        elementToScrollTo = extraContent.querySelector(`[data-line-range="${line}"], [data-line-range^="${line}-"]`);
        if (elementToScrollTo) break;
      }
    } else if (target.matches('[data-line-range]')) {
      const line = target.dataset.lineRange.split('-')[0];
      // Find in any text panel
      for (const textContent of allTextContents) {
        elementToScrollTo = textContent.querySelector(`[data-line="${line}"]`);
        if (elementToScrollTo) break;
      }
    }
    
    if (elementToScrollTo) {
      elementToScrollTo.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };
  
  // Remove old listeners and attach new ones
  allTextContents.forEach(tc => {
    tc.removeEventListener('mouseover', handleMouseover);
    tc.removeEventListener('mouseleave', clearHighlights);
    tc.removeEventListener('click', handleClick);
    tc.addEventListener('mouseover', handleMouseover);
    tc.addEventListener('mouseleave', clearHighlights);
    tc.addEventListener('click', handleClick);
  });
  
  allExtraContents.forEach(ec => {
    ec.removeEventListener('mouseover', handleMouseover);
    ec.removeEventListener('mouseleave', clearHighlights);
    ec.removeEventListener('click', handleClick);
    ec.addEventListener('mouseover', handleMouseover);
    ec.addEventListener('mouseleave', clearHighlights);
    ec.addEventListener('click', handleClick);
  });
}

// Attach event handlers for a panel
function attachPanelEventHandlers(panel) {
  const type = getPanelType(panel);
  
  if (type === PANEL_TYPES.TRANSCRIPTION) {
    const poemSelect = getPanelElement(panel, '.poem-select');
    const witnessSelect = getPanelElement(panel, '.witness-select');
    
    if (poemSelect) {
      poemSelect.onchange = (e) => {
        const poem = e.target.value;
        const witness = witnessSelect ? witnessSelect.value : '';
        updateTranscription(panel, poem, witness);
        savePanelState(panel);
      };
    }
    
    if (witnessSelect) {
      witnessSelect.onchange = (e) => {
        const poem = poemSelect ? poemSelect.value : '';
        const witness = e.target.value;
        updateTranscription(panel, poem, witness);
        savePanelState(panel);
      };
    }
  } else if (type === PANEL_TYPES.VIEWER) {
    const poemSelect = getPanelElement(panel, '.poem-select');
    const witnessBtns = getPanelElements(panel, '.witness-buttons button');
    const prevBtn = getPanelElement(panel, '.prev-page');
    const nextBtn = getPanelElement(panel, '.next-page');
    const pageInput = getPanelElement(panel, '.page-input');
    const goToPageBtn = getPanelElement(panel, '.go-to-page');
    
    if (poemSelect) {
      poemSelect.onchange = (e) => {
        const poem = e.target.value;
        const activeBtn = getPanelElement(panel, '.witness-buttons button.active');
        if (activeBtn && poem) {
          const witness = activeBtn.dataset.witness;
          loadManifest(panel, poem, witness);
        }
        savePanelState(panel);
      };
    }
    
    witnessBtns.forEach(btn => {
      btn.onclick = () => {
        const poem = poemSelect ? poemSelect.value : '';
        const witness = btn.dataset.witness;
        if (!poem) {
          return alert('Please select a poem first.');
        }
        
        witnessBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        loadManifest(panel, poem, witness);
        savePanelState(panel);
      };
    });
    
    if (prevBtn) {
      prevBtn.onclick = () => {
        const panelId = panel.id;
        if (osdViewers.has(panelId)) {
          const osdViewer = osdViewers.get(panelId);
          if (osdViewer.currentPage() > 0) {
            osdViewer.goToPage(osdViewer.currentPage() - 1);
          }
        }
      };
    }
    
    if (nextBtn) {
      nextBtn.onclick = () => {
        const panelId = panel.id;
        if (osdViewers.has(panelId)) {
          const osdViewer = osdViewers.get(panelId);
          if (osdViewer.currentPage() < osdViewer.tileSources.length - 1) {
            osdViewer.goToPage(osdViewer.currentPage() + 1);
          }
        }
      };
    }
    
    if (goToPageBtn && pageInput) {
      goToPageBtn.onclick = () => {
        const panelId = panel.id;
        if (osdViewers.has(panelId)) {
          const osdViewer = osdViewers.get(panelId);
          const page = parseInt(pageInput.value, 10) - 1;
          if (!isNaN(page) && page >= 0 && page < osdViewer.tileSources.length) {
            osdViewer.goToPage(page);
          }
        }
      };
      
      pageInput.onkeydown = (event) => {
        if (event.key === 'Enter') {
          goToPageBtn.click();
        }
      };
    }
  } else if (type === PANEL_TYPES.COMPANION) {
    const poemSelect = getPanelElement(panel, '.poem-select');
    const companionCheckboxes = getPanelElements(panel, '.companion-controls input');
    
    if (poemSelect) {
      poemSelect.onchange = () => {
        updateCompanionPanel(panel);
        savePanelState(panel);
      };
    }
    
    companionCheckboxes.forEach(checkbox => {
      checkbox.onchange = () => {
        updateCompanionPanel(panel);
        savePanelState(panel);
      };
    });
  }
}

// ============================================================================
// INITIALIZATION
// ============================================================================

// Initialize panels
function initializePanels() {
  const panelsContainer = document.getElementById('panels');
  if (!panelsContainer) return;
  
  const panels = panelsContainer.querySelectorAll('section');
  
  panels.forEach((panel, index) => {
    // Determine initial type from ID or dropdown value
    let initialType = PANEL_TYPES.TRANSCRIPTION;
    if (panel.id === 'text-panel') {
      initialType = PANEL_TYPES.TRANSCRIPTION;
    } else if (panel.id === 'viewer-panel') {
      initialType = PANEL_TYPES.VIEWER;
    } else if (panel.id === 'comm-panel') {
      initialType = PANEL_TYPES.COMPANION;
    }
    
    setPanelType(panel, initialType);
    
    // Check if header already has dropdown (from HTML)
    const existingDropdown = getPanelElement(panel, '.panel-type-select');
    if (!existingDropdown) {
      // Replace header with new header that has dropdown
      const oldHeader = getPanelElement(panel, '.panel-header');
      if (oldHeader) {
        const newHeader = createPanelHeader(initialType, '');
        oldHeader.replaceWith(newHeader);
      }
    } else {
      // Ensure dropdown value matches panel type
      existingDropdown.value = initialType;
    }
    
    // Ensure panel-body exists
    let existingBody = getPanelElement(panel, '.panel-body');
    if (!existingBody) {
      const body = document.createElement('div');
      body.className = 'panel-body';
      // Move all children except header into body
      const header = getPanelElement(panel, '.panel-header');
      const children = Array.from(panel.children);
      children.forEach(child => {
        if (child !== header) {
          body.appendChild(child);
        }
      });
      panel.appendChild(body);
    }
    
    // Convert IDs to classes for panel-scoped queries
    convertPanelIdsToClasses(panel);
    
    // Populate poem selects if they exist
    const poemSelects = getPanelElements(panel, '.poem-select');
    poemSelects.forEach(poemSelect => {
      if (poemSelect.options.length === 1) { // Only has default option
        Object.keys(companionData).forEach(poem => {
          const opt = document.createElement('option');
          opt.value = poem;
          opt.textContent = `Amores ${poem}`;
          poemSelect.appendChild(opt);
        });
      }
    });
    
    // Attach event handlers
    attachPanelEventHandlers(panel);
    
    // Attach type switcher
    const dropdown = getPanelElement(panel, '.panel-type-select');
    if (dropdown) {
      dropdown.onchange = (e) => {
        switchPanelType(panel, e.target.value);
      };
    }
  });
  
  // Initialize Split.js
  initializeSplit();
}

// Convert panel IDs to classes for scoped queries
function convertPanelIdsToClasses(panel) {
  const idToClassMap = {
    'poem-select': 'poem-select',
    'witness-select': 'witness-select',
    'text-content': 'text-content',
    'witness-buttons': 'witness-buttons',
    'viewer': 'viewer',
    'page-controls': 'page-controls',
    'prev-page': 'prev-page',
    'next-page': 'next-page',
    'page-indicator': 'page-indicator',
    'page-input': 'page-input',
    'go-to-page': 'go-to-page',
    'progress-container': 'progress-container',
    'progress-bar': 'progress-bar',
    'companion-controls': 'companion-controls',
    'extra-content': 'extra-content'
  };
  
  Object.keys(idToClassMap).forEach(id => {
    const element = panel.querySelector(`#${id}`);
    if (element) {
      element.classList.add(idToClassMap[id]);
    }
  });
}

// Initialize Split.js
function initializeSplit() {
  const panelsContainer = document.getElementById('panels');
  if (!panelsContainer) return;
  
  const panels = Array.from(panelsContainer.querySelectorAll('section'));
  const selectors = panels.map(p => `#${p.id}`);
  
  let splitInstance = Split(selectors, {
    sizes: [30, 40, 30],
    minSize: [100, 200, 100],
    gutterSize: 6,
    cursor: 'col-resize'
  });
  
  const originalSizes = splitInstance.getSizes();
  
  // Panel reordering
  const sortableInstance = Sortable.create(panelsContainer, {
    handle: '.drag-handle',
    draggable: 'section',
    animation: 150,
    ghostClass: 'sortable-ghost',
    onEnd: () => {
      splitInstance.destroy();
      const newPanels = Array.from(panelsContainer.querySelectorAll('section'));
      const newSelectors = newPanels.map(p => `#${p.id}`);
      
      splitInstance = Split(newSelectors, {
        sizes: originalSizes,
        minSize: [100, 200, 100],
        gutterSize: 6,
        cursor: 'col-resize'
      });
    }
  });
  
  // Panel collapse/expand
  document.querySelectorAll('.toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const section = btn.closest('section');
      const panels = Array.from(panelsContainer.querySelectorAll('section'));
      const idx = panels.indexOf(section);
      const isCollapsed = section.classList.toggle('collapsed');
      
      if (isCollapsed) {
        splitInstance.collapse(idx);
        btn.textContent = '☰';
        btn.title = 'Expand panel';
      } else {
        splitInstance.setSizes(originalSizes);
        btn.textContent = '×';
        btn.title = 'Collapse panel';
      }
    });
  });
  
  // Store split instance globally for potential future use
  window.splitInstance = splitInstance;
}

// ============================================================================
// TUTORIAL OVERLAY SYSTEM
// ============================================================================

// Check if this is the user's first visit
function checkFirstVisit() {
  return !localStorage.getItem('amores-tutorial-seen');
}

function bindTutorialEvents() {
  const overlay = document.getElementById('tutorial-overlay');
  if (!overlay || overlay.dataset.bound === 'true') return;

  const closeBtn = overlay.querySelector('.tutorial-close');
  const primaryBtn = overlay.querySelector('.tutorial-primary');

  // Dismiss when clicking the dimmed backdrop (not the modal)
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      dismissTutorial();
    }
  });

  if (closeBtn) closeBtn.addEventListener('click', dismissTutorial);
  if (primaryBtn) primaryBtn.addEventListener('click', dismissTutorial);

  overlay.dataset.bound = 'true';
}

// Show the tutorial overlay
function showTutorial() {
  const overlay = document.getElementById('tutorial-overlay');
  if (!overlay) return;
  
  overlay.classList.remove('hidden');

  // Allow Escape key to dismiss
  document.addEventListener('keydown', handleEscapeKey);

  // Focus primary action for quick dismissal/keyboard users
  setTimeout(() => {
    overlay.querySelector('.tutorial-primary')?.focus?.();
  }, 0);
}

// Handle Escape key to dismiss tutorial
function handleEscapeKey(e) {
  if (e.key === 'Escape') {
    dismissTutorial();
  }
}

// Dismiss the tutorial overlay
function dismissTutorial() {
  const overlay = document.getElementById('tutorial-overlay');
  if (!overlay) return;
  
  overlay.classList.add('fade-out');
  setTimeout(() => {
    overlay.classList.add('hidden');
    overlay.classList.remove('fade-out');
  }, 300);
  
  localStorage.setItem('amores-tutorial-seen', 'true');
  document.removeEventListener('keydown', handleEscapeKey);
}

// Developer shortcut: Ctrl+Shift+T to reset tutorial
document.addEventListener('keydown', function(e) {
  if (e.ctrlKey && e.shiftKey && e.key === 'T') {
    localStorage.removeItem('amores-tutorial-seen');
    location.reload();
  }
});

// Theme toggle (unchanged)
document.addEventListener('DOMContentLoaded', function() {
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    const currentTheme = localStorage.getItem('theme');
    
    if (currentTheme === 'dark') {
      document.body.classList.add('dark-mode');
    }
    
    themeToggle.addEventListener('click', function() {
      document.body.classList.toggle('dark-mode');
      let theme = 'light';
      if (document.body.classList.contains('dark-mode')) {
        theme = 'dark';
      }
      localStorage.setItem('theme', theme);
    });
  }
  
  // Initialize panels after DOM is ready
  initializePanels();

  // Ensure tutorial overlay event handlers are attached
  bindTutorialEvents();
  
  // Show tutorial on first visit
  if (checkFirstVisit()) {
    // Delay to ensure panels are fully rendered
    setTimeout(() => {
      try {
        showTutorial();
      } catch (error) {
        console.error('Tutorial overlay error:', error);
        // Fail silently - don't break the page if tutorial fails
      }
    }, 500);
  }
});
