console.log('script.js loaded – Split is', typeof Split);

const FACSIMILE_WITNESSES = ['P', 'Y', 'S', 'O'];
const DEFAULT_LINE_WITNESSES = ['P', 'Y', 'S'];

function getSelectedLineWitnesses(panel) {
  return Array.from(getPanelElements(panel, '.manuscript-checkbox:checked'), input => input.value);
}

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

// Initialize CETEI only on pages that load the transcription dependency.
// Shared features such as the theme toggle must still work on content pages.
const cetei = typeof CETEI === 'function' ? new CETEI() : null;
if (cetei) {
  cetei.addBehaviors(behaviors);
}

// ============================================================================
// PANEL MANAGEMENT SYSTEM
// ============================================================================

// Panel types
const PANEL_TYPES = {
  TRANSCRIPTION: 'transcription',
  VIEWER: 'viewer',
  LINE_VIEWER: 'line-viewer',
  COMPANION: 'companion'
};

// Store OpenSeadragon instances per panel
const osdViewers = new Map();
const lineViewerLoadTokens = new Map();
const singleViewerLoadTokens = new Map();
// Expose for debugging and external access
try { window.osdViewers = osdViewers; } catch (e) { /* ignore in non-browser env */ }

// Annotation state for line-linked markup and preview drawing
const annotationState = {
  selectedLineId: null,
  selectedLineWitness: null,
  selectedPoem: null,
  annotations: [],
  activePanelId: null,
  activeWitness: null,
  drawing: false,
  drawStart: null,
  previewRect: null,
  activeOverlay: null,
  boundMoveHandler: null,
  boundUpHandler: null
};

const ANNOTATION_STORAGE_KEY = 'amores-annotations';
const ANNOTATION_FALLBACK_URL = 'data/annotations.json';

function saveAnnotationsToStorage() {
  try {
    localStorage.setItem(ANNOTATION_STORAGE_KEY, JSON.stringify(annotationState.annotations));
  } catch (error) {
    console.warn('Unable to save annotations to localStorage:', error);
  }
}

function loadAnnotationsFromStorage() {
  try {
    const stored = localStorage.getItem(ANNOTATION_STORAGE_KEY);
    if (!stored) return false;

    const parsed = JSON.parse(stored);
    if (Array.isArray(parsed)) {
      annotationState.annotations = normalizeAnnotationList(parsed);
      return annotationState.annotations.length > 0;
    }
    return false;
  } catch (error) {
    console.warn('Unable to load annotations from localStorage:', error);
    annotationState.annotations = [];
    return false;
  }
}

function normalizeAnnotationList(items) {
  if (!Array.isArray(items)) return [];

  const normalizedItems = items
    .filter(item => item && item.panelId && item.witness && item.lineId)
    .map(item => {
      const normalized = { ...item };
      if (!normalized.poem) {
        const inferred = inferAnnotationPoem(normalized);
        if (inferred) {
          normalized.poem = inferred;
        }
      }
      return normalized;
    });

  // Annotations describe poem lines, not a particular panel slot. Keep the
  // last record for a line so later corrections in the source file win while
  // the original JSON remains preserved verbatim in the repository.
  const uniqueAnnotations = new Map();
  normalizedItems.forEach(annotation => {
    uniqueAnnotations.set(buildAnnotationKey(annotation), annotation);
  });
  return Array.from(uniqueAnnotations.values());
}

function buildAnnotationKey(annotation) {
  return [
    annotation.witness || '',
    annotation.lineId || '',
    annotation.poem || ''
  ].join('|');
}

function mergeAnnotationLists(fallbackList, storageList) {
  const merged = new Map();

  // Start with fallback annotations, then let storage override matching keys.
  fallbackList.forEach(annotation => {
    merged.set(buildAnnotationKey(annotation), annotation);
  });

  storageList.forEach(annotation => {
    const key = buildAnnotationKey(annotation);
    const published = merged.get(key);
    // Repair only cached copies of the original O export, which used a
    // zero-based canvas index where the viewer expects a one-based page.
    // Locally drawn or edited rectangles continue to override published data.
    const staleOExport = annotation.witness === 'O' && published &&
      annotation.page === published.page - 1 &&
      ['x', 'y', 'width', 'height'].every(field => annotation[field] === published[field]);
    if (!staleOExport) merged.set(key, annotation);
  });

  return Array.from(merged.values());
}

async function loadAnnotationsFromFallbackFile() {
  try {
    const resp = await fetch(ANNOTATION_FALLBACK_URL, { cache: 'no-cache' });
    if (!resp.ok) {
      return false;
    }

    const parsed = await resp.json();
    const normalized = normalizeAnnotationList(parsed);
    if (!normalized.length) {
      return false;
    }

    annotationState.annotations = normalized;
    saveAnnotationsToStorage();
    console.log(`Loaded ${normalized.length} annotations from fallback file.`);
    return true;
  } catch (error) {
    console.warn('Unable to load fallback annotation file:', error);
    return false;
  }
}

async function loadAnnotations() {
  const loadedFromStorage = loadAnnotationsFromStorage();
  const storageAnnotations = loadedFromStorage ? [...annotationState.annotations] : [];

  const loadedFromFallback = await loadAnnotationsFromFallbackFile();
  const fallbackAnnotations = loadedFromFallback ? [...annotationState.annotations] : [];

  if (loadedFromStorage && loadedFromFallback) {
    annotationState.annotations = mergeAnnotationLists(fallbackAnnotations, storageAnnotations);
    saveAnnotationsToStorage();
    return annotationState.annotations.length > 0;
  }

  if (loadedFromStorage) {
    annotationState.annotations = storageAnnotations;
    return true;
  }

  return loadedFromFallback;
}

function restoreAnnotationsForAllViewerPanels() {
  document.querySelectorAll(`section[data-panel-type="${PANEL_TYPES.LINE_VIEWER}"]`).forEach(panel => {
    restoreAnnotationRectanglesForPanel(panel);
  });
}

function applyImportedAnnotations(parsed, sourceLabel = 'file') {
  const normalized = normalizeAnnotationList(parsed);
  if (!normalized.length) {
    return { ok: false, message: 'No valid annotations found in the selected file.' };
  }

  annotationState.annotations = normalized;
  saveAnnotationsToStorage();
  restoreAnnotationsForAllViewerPanels();
  refreshAllAnnotationToolbars();

  return {
    ok: true,
    message: `Loaded ${normalized.length} annotation(s) from ${sourceLabel}.`
  };
}

async function importAnnotationsFromFile(file) {
  const text = await file.text();
  const parsed = JSON.parse(text);
  return applyImportedAnnotations(parsed, file.name || 'selected file');
}

function inferAnnotationPoem(annotation) {
  if (annotation.poem) return annotation.poem;
  const witness = annotation.witness;
  const page = annotation.page;
  if (!witness || page == null || !witnessPageData[witness]) return null;
  const poemKeys = Object.keys(companionData);
  let bestMatch = null;

  for (let i = 0; i < poemKeys.length; i++) {
    const startPage = witnessPageData[witness][i];
    if (startPage == null) continue;
    let nextStart = null;
    for (let j = i + 1; j < poemKeys.length; j++) {
      if (witnessPageData[witness][j] != null) {
        nextStart = witnessPageData[witness][j];
        break;
      }
    }

    if (nextStart != null) {
      if (page >= startPage && page < nextStart) {
        return poemKeys[i];
      }
    } else if (page >= startPage) {
      bestMatch = poemKeys[i];
    }
  }

  return bestMatch;
}

function upsertAnnotation(annotation) {
  annotationState.annotations = annotationState.annotations.filter(a =>
    !(a.witness === annotation.witness &&
      a.lineId === annotation.lineId &&
      (a.poem === annotation.poem || !a.poem))
  );
  annotationState.annotations.push(annotation);
  saveAnnotationsToStorage();
}

function removeSavedAnnotationRects(overlay, lineId, poem) {
  const selector = poem
    ? `.annotation-rect[data-line-id="${lineId}"][data-poem="${poem}"]`
    : `.annotation-rect[data-line-id="${lineId}"]`;
  overlay.querySelectorAll(selector).forEach(el => el.remove());
}

function getOverlayRectFromImageRect(osdViewer, imageRect) {
  const topLeftViewport = osdViewer.viewport.imageToViewportCoordinates(new OpenSeadragon.Point(imageRect.x, imageRect.y));
  const bottomRightViewport = osdViewer.viewport.imageToViewportCoordinates(new OpenSeadragon.Point(imageRect.x + imageRect.width, imageRect.y + imageRect.height));

  const topLeftViewer = osdViewer.viewport.viewportToViewerElementCoordinates(topLeftViewport);
  const bottomRightViewer = osdViewer.viewport.viewportToViewerElementCoordinates(bottomRightViewport);

  return {
    left: topLeftViewer.x,
    top: topLeftViewer.y,
    width: bottomRightViewer.x - topLeftViewer.x,
    height: bottomRightViewer.y - topLeftViewer.y
  };
}

function restoreAnnotationRectanglesForOverlay(panel, witness) {
  const overlay = getPanelElement(panel, `.annotation-overlay[data-witness="${witness}"]`);
  if (!overlay) return;

  const viewerId = getViewerId(panel, witness);
  const osdViewer = osdViewers.get(viewerId);
  if (!osdViewer) return;

  // Remove any existing rendered annotation rectangles for this overlay
  overlay.querySelectorAll('.annotation-rect').forEach(el => el.remove());

  const currentPoem = getPanelElement(panel, '.poem-select')?.value;
  const annotations = annotationState.annotations.filter(a =>
    a.witness === witness &&
    (!currentPoem || a.poem === currentPoem)
  );

  annotations.forEach(annotation => {
    const rect = getOverlayRectFromImageRect(osdViewer, annotation);
    createAnnotationRect(overlay, rect.left, rect.top, rect.width, rect.height, annotation.page, annotation.lineId, false, annotation.poem);
  });
}

function restoreAnnotationRectanglesForPanel(panel) {
  FACSIMILE_WITNESSES.forEach(witness => {
    restoreAnnotationRectanglesForOverlay(panel, witness);
  });
}

// Store panel states
const panelStates = new Map();

// Store witness XML cache (shared across panels)
const witnessXmlCache = {};

async function loadWitnessXml(witness, poem) {
  const xmlPath = await resolveWitnessFile(witness, poem);
  if (witnessXmlCache[xmlPath]) return witnessXmlCache[xmlPath];
  if (!xmlPath) {
    throw new Error(`No data file specified for witness ${witness}.`);
  }

  const response = await fetch(xmlPath);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${xmlPath}`);
  }

  const xmlString = await response.text();
  const xmlDoc = new DOMParser().parseFromString(xmlString, 'application/xml');
  if (xmlDoc.querySelector('parsererror')) {
    throw new Error(`Invalid XML in ${xmlPath}`);
  }

  witnessXmlCache[xmlPath] = xmlDoc;
  return xmlDoc;
}

function getTranscriptionNode(xmlDoc, poem) {
  return selectTeiPoem(xmlDoc, poem);
}

async function getAvailableTranscriptionWitnesses(poem) {
  const witnesses = Object.keys(witnessFiles);
  const availability = await Promise.all(witnesses.map(async witness => {
    try {
      const xmlDoc = await loadWitnessXml(witness, poem);
      const poemNode = getTranscriptionNode(xmlDoc, poem);
      return poemNode && poemNode.firstElementChild ? witness : null;
    } catch (error) {
      return null;
    }
  }));

  return availability
    .filter(Boolean)
    .sort((a, b) => (a === 'LL' ? -1 : b === 'LL' ? 1 : a.localeCompare(b)));
}

function renderTranscriptionUnavailable(panel, poem, witness, availableWitnesses) {
  const textContent = getPanelElement(panel, '.text-content');
  if (!textContent) return;

  textContent.innerHTML = '';

  const emptyState = document.createElement('div');
  emptyState.className = 'transcription-empty-state';

  const heading = document.createElement('h3');
  heading.textContent = 'Transcription not yet available';
  emptyState.appendChild(heading);

  const message = document.createElement('p');
  message.textContent = `Witness ${witness} does not currently have a transcription for Amores ${poem}.`;
  emptyState.appendChild(message);

  if (availableWitnesses.length) {
    const suggestion = document.createElement('p');
    suggestion.textContent = availableWitnesses.includes('LL')
      ? 'Continue with the Latin Library (LL) text or another available witness:'
      : 'Continue with an available witness:';
    emptyState.appendChild(suggestion);

    const actions = document.createElement('div');
    actions.className = 'transcription-fallback-actions';

    availableWitnesses.forEach(availableWitness => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'transcription-fallback';
      button.dataset.witness = availableWitness;
      button.textContent = availableWitness === 'LL'
        ? 'View LL text'
        : `View witness ${availableWitness}`;
      button.addEventListener('click', () => {
        const witnessSelect = getPanelElement(panel, '.witness-select');
        if (!witnessSelect) return;
        witnessSelect.value = availableWitness;
        witnessSelect.dispatchEvent(new Event('change'));
      });
      actions.appendChild(button);
    });

    emptyState.appendChild(actions);
  } else {
    const noAlternative = document.createElement('p');
    noAlternative.textContent = 'No transcription is currently available for this poem.';
    emptyState.appendChild(noAlternative);
  }

  textContent.appendChild(emptyState);
}

// Helper to construct IIIF manifest URLs
function getManifestUrl(poem, witness) {
  if (FACSIMILE_WITNESSES.includes(witness)) {
    return `data/iiif-manifests/witness-${witness}.json`;
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
      manuscripts: [...DEFAULT_LINE_WITNESSES],
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
  } else if (type === PANEL_TYPES.LINE_VIEWER) {
    // The line viewer remembers both its poem and manuscript layout.
    const poemSelect = getPanelElement(panel, '.poem-select');
    if (poemSelect) state.poem = poemSelect.value;
    state.manuscripts = getSelectedLineWitnesses(panel);
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
  } else if (type === PANEL_TYPES.LINE_VIEWER) {
    const poemSelect = getPanelElement(panel, '.poem-select');
    const selected = state.manuscripts || DEFAULT_LINE_WITNESSES;
    getPanelElements(panel, '.manuscript-checkbox').forEach(input => {
      input.checked = selected.includes(input.value);
    });
    if (poemSelect && state.poem) poemSelect.value = state.poem;
    updateLineWitnessSelection(panel);
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
        <option value="O">O</option>
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
      <button data-witness="O" title="O — Teubner 1888 (printed edition)">Witness O</button>
    </div>
    <div class="single-viewer-wrapper">
      <div class="viewer"></div>
      <div class="annotation-overlay single-viewer-annotation-overlay hidden-rects"></div>
    </div>
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

  const poemSelect = div.querySelector('.poem-select');
  Object.keys(companionData).forEach(poem => {
    const opt = document.createElement('option');
    opt.value = poem;
    opt.textContent = `Amores ${poem}`;
    poemSelect.appendChild(opt);
  });

  return div;
}

function updateLineWitnessSelection(panel, reload = false) {
  const selected = getSelectedLineWitnesses(panel);
  const poem = getPanelElement(panel, '.poem-select')?.value;
  const container = getPanelElement(panel, '.viewers-container');
  container?.classList.toggle('single-view', selected.length === 1);
  const empty = getPanelElement(panel, '.witness-selection-empty');
  if (empty) empty.hidden = selected.length !== 0;

  if (annotationState.activePanelId === panel.id && !selected.includes(annotationState.activeWitness)) {
    annotationState.activePanelId = null;
    annotationState.activeWitness = null;
    removePreviewRectangle();
  }
  FACSIMILE_WITNESSES.forEach(witness => {
    const section = getPanelElement(panel, `.viewer-section[data-witness="${witness}"]`);
    if (section) section.hidden = !selected.includes(witness);
    const viewerEl = getPanelElement(panel, `.viewer[data-witness="${witness}"]`);
    if (selected.includes(witness) && poem && (reload || viewerEl?.dataset.poem !== poem)) {
      loadManifestForWitness(panel, poem, witness);
    }
  });
  const target = getPanelElement(panel, '.annotation-witness-select');
  if (target) {
    Array.from(target.options).forEach(option => { option.disabled = !selected.includes(option.value); });
    if (!selected.includes(target.value)) target.value = selected[0] || '';
    target.disabled = selected.length === 0;
  }
  savePanelState(panel);
  refreshAnnotationToolbar(panel);
  setTimeout(() => {
    selected.forEach(witness => {
      const viewer = osdViewers.get(getViewerId(panel, witness));
      if (!viewer) return;
      viewer.forceRedraw?.();
      restoreAnnotationRectanglesForOverlay(panel, witness);
      const annotation = getAnnotationForViewer(panel, annotationState.selectedLineId, witness, poem);
      if (annotation && annotationState.selectedPoem === poem) zoomViewerToAnnotation(panel, witness, annotation);
    });
  }, 120);
}

function createLineViewerPanelBody() {
  const div = document.createElement('div');
  div.className = 'panel-body';
  div.innerHTML = `
    <select class="poem-select">
      <option value="">Select a poem…</option>
    </select>

    <fieldset class="manuscript-checkboxes">
      <legend>Witnesses</legend>
      ${FACSIMILE_WITNESSES.map(witness => `<label title="${witness === 'O' ? 'O — Teubner 1888 (printed edition)' : `Manuscript ${witness}`}"><input class="manuscript-checkbox" type="checkbox" value="${witness}"${DEFAULT_LINE_WITNESSES.includes(witness) ? ' checked' : ''}> ${witness}</label>`).join('')}
    </fieldset>
    <p class="witness-selection-empty" hidden>Select a witness to view its pages.</p>

    <div class="annotation-toolbar">
      <div class="annotation-status">
        <span>Line: <strong class="annotation-active-line">None</strong></span>
        <span><span class="visually-hidden">Source witness: </span><span aria-hidden="true">·</span> <strong class="annotation-source-witness">—</strong></span>
      </div>
      <details class="annotation-tools">
        <summary aria-label="Annotation tools">Tools</summary>
        <div class="annotation-controls">
          <label>
            Target:
            <select class="annotation-witness-select">
              <option value="P">P</option>
              <option value="Y">Y</option>
              <option value="S">S</option>
              <option value="O">O</option>
            </select>
          </label>
          <button class="toggle-annotation" type="button">Start annotation</button>
          <button class="clear-annotations" type="button">Clear annotations</button>
          <button class="import-annotations" type="button">Import annotations</button>
          <button class="export-annotations" type="button">Export annotations</button>
          <input class="annotation-import-input" type="file" accept="application/json,.json" hidden>
          <span class="annotation-message" aria-live="polite"></span>
        </div>
      </details>
    </div>

    <div class="viewers-container">
      ${FACSIMILE_WITNESSES.map(witness => `
      <div class="viewer-section" data-witness="${witness}"${DEFAULT_LINE_WITNESSES.includes(witness) ? '' : ' hidden'}>
        <div class="viewer-wrapper">
          <span class="viewer-label" title="Witness ${witness}">${witness}</span>
          <div class="viewer" data-witness="${witness}"></div>
          <div class="annotation-overlay" data-witness="${witness}"></div>
        </div>
      </div>`).join('')}
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
      <label><input type="checkbox" data-extra="text-commentary"> Manuscript Commentary</label>
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
  
  // Destroy the active panel's OpenSeadragon viewer(s) before replacing it.
  if (getPanelType(panel) === PANEL_TYPES.VIEWER) {
    const panelId = panel.id;
    singleViewerLoadTokens.delete(panelId);
    if (osdViewers.has(panelId)) {
      osdViewers.get(panelId).destroy();
      osdViewers.delete(panelId);
    }
  } else if (getPanelType(panel) === PANEL_TYPES.LINE_VIEWER) {
    const panelId = panel.id;
    FACSIMILE_WITNESSES.forEach(witness => {
      const viewerId = `${panelId}-${witness}`;
      lineViewerLoadTokens.delete(viewerId);
      if (osdViewers.has(viewerId)) {
        osdViewers.get(viewerId).destroy();
        osdViewers.delete(viewerId);
      }
    });
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
  } else if (newType === PANEL_TYPES.LINE_VIEWER) {
    newBody = createLineViewerPanelBody();
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
      <option value="${PANEL_TYPES.VIEWER}">Single Manuscript Viewer</option>
      <option value="${PANEL_TYPES.LINE_VIEWER}">Line-by-line Viewer</option>
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

// Update UI for the standard, single-manuscript IIIF viewer.
function updateSingleViewerUI(panel, currentPage, totalPages) {
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

function updateSingleViewerPageButtons(panel) {
  const osdViewer = osdViewers.get(panel.id);
  if (!osdViewer) return;

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

// Update UI for a specific witness in the line-by-line viewer.
function updateLineViewerUI(panel, witness, currentPage, totalPages) {
  refreshAnnotationOverlayVisibility(panel, witness, currentPage);
}

// Load manifest for a specific panel
async function loadManifest(panel, poem, witness) {
  const viewerEl = getPanelElement(panel, '.viewer');
  if (!viewerEl) return;

  const focusOverlay = getPanelElement(panel, '.single-viewer-annotation-overlay');
  if (focusOverlay) clearCurrentAnnotationMarkers(focusOverlay);
  
  const panelId = panel.id;
  const loadToken = Symbol(`${panelId}-${poem}-${witness}`);
  singleViewerLoadTokens.set(panelId, loadToken);
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
    await loadTeiCorpus();
    const resp = await fetch(manifestUrl);
    manifest = await resp.json();
  } catch (e) {
    if (singleViewerLoadTokens.get(panelId) === loadToken) {
      viewerEl.innerHTML = '<p>Failed to load IIIF manifest.</p>';
    }
    return;
  }

  if (singleViewerLoadTokens.get(panelId) !== loadToken) return;
  
  // Validate manifest exists
  if (!manifest) {
    viewerEl.innerHTML = '<p>Failed to load IIIF manifest.</p>';
    return;
  }
  
  // Extract tile sources
  const canvases = manifest.sequences?.[0]?.canvases || manifest.items || [];
  const tileSources = canvases.map(canvas => {
    const services = canvas.images?.[0]?.resource?.service || canvas.image?.service || canvas.items?.[0]?.items?.[0]?.body?.service;
    const service = Array.isArray(services) ? services[0] : services;
    const imageService = service?.['@id'] || service?.id;
    if (imageService && (service.type === 'ImageService3' || imageService.includes('/image/iiif/3/'))) {
      return `${imageService}/info.json`;
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
  
  // Ensure viewer element has dimensions before initializing OpenSeadragon.
  // If the viewer already has a size, initialize immediately; otherwise wait briefly.
  const rect = viewerEl.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) {
    setTimeout(() => {
      initializeOpenSeadragon();
    }, 100);
  } else {
    initializeOpenSeadragon();
  }
  
  function initializeOpenSeadragon() {
    if (singleViewerLoadTokens.get(panelId) !== loadToken) return;
    // Create OpenSeadragon instance
    const osdViewer = OpenSeadragon({
      element: viewerEl,
      prefixUrl: 'https://openseadragon.github.io/openseadragon/images/',
      tileSources: tileSources,
      sequenceMode: true,
      initialPage: initialPage,
      crossOriginPolicy: 'Anonymous'
    });

    viewerEl.dataset.poem = poem;
    viewerEl.dataset.witness = witness;
    osdViewers.set(panelId, osdViewer);
    attachFocusedAnnotationViewportHandlers(panel, witness, osdViewer);
    
    osdViewer.addHandler('open', () => {
      updateSingleViewerPageButtons(panel);
      updateSingleViewerUI(panel, osdViewer.currentPage(), osdViewer.tileSources.length);

      if (annotationState.selectedPoem === poem && annotationState.selectedLineId) {
        const annotation = getAnnotationForViewer(panel, annotationState.selectedLineId, witness, poem);
        if (annotation) zoomViewerToAnnotation(panel, witness, annotation);
      }
    });
    
    osdViewer.addHandler('page', (event) => {
      updateSingleViewerUI(panel, event.page, osdViewer.tileSources.length);
      updateSingleViewerPageButtons(panel);
      refreshAnnotationOverlayVisibility(panel, witness, event.page);
    });
  }
}

// Load a witness manifest into its comparison container.
async function loadManifestForWitness(panel, poem, witness) {
  // Find the viewer container for this specific witness
  const viewerEl = panel.querySelector(`.viewer[data-witness="${witness}"]`);
  if (!viewerEl) return;
  
  const panelId = panel.id;
  const viewerId = `${panelId}-${witness}`; // composite key for osdViewers Map
  const loadToken = Symbol(`${viewerId}-${poem}`);
  lineViewerLoadTokens.set(viewerId, loadToken);
  const manifestUrl = getManifestUrl(poem, witness);
  
  if (!manifestUrl) {
    if (osdViewers.has(viewerId)) {
      await osdViewers.get(viewerId).destroy();
      osdViewers.delete(viewerId);
    }
    viewerEl.innerHTML = '<p class="viewer-placeholder">IIIF manifest not available.</p>';
    return;
  }
  
  // Destroy existing viewer for this witness
  if (osdViewers.has(viewerId)) {
    await osdViewers.get(viewerId).destroy();
    osdViewers.delete(viewerId);
  }
  
  // Clear the container and its previous poem while the next manifest loads.
  delete viewerEl.dataset.poem;
  viewerEl.innerHTML = '';
  
  // Fetch manifest
  let manifest;
  try {
    await loadTeiCorpus();
    const resp = await fetch(manifestUrl);
    manifest = await resp.json();
  } catch (e) {
    if (lineViewerLoadTokens.get(viewerId) === loadToken) {
      viewerEl.innerHTML = '<p>Failed to load IIIF manifest.</p>';
    }
    return;
  }

  // Ignore a slower response for a poem that has already been superseded.
  if (lineViewerLoadTokens.get(viewerId) !== loadToken) return;
  
  // Validate manifest exists
  if (!manifest) {
    viewerEl.innerHTML = '<p>Failed to load IIIF manifest.</p>';
    return;
  }
  
  // Extract tile sources
  const canvases = manifest.sequences?.[0]?.canvases || manifest.items || [];
  const tileSources = canvases.map(canvas => {
    const services = canvas.images?.[0]?.resource?.service || canvas.image?.service || canvas.items?.[0]?.items?.[0]?.body?.service;
    const service = Array.isArray(services) ? services[0] : services;
    const imageService = service?.['@id'] || service?.id;
    if (imageService && (service.type === 'ImageService3' || imageService.includes('/image/iiif/3/'))) {
      return `${imageService}/info.json`;
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
    viewerEl.innerHTML = '<p>No IIIF images found.</p>';
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
  
  const rect = viewerEl.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) {
    setTimeout(() => {
      initializeOpenSeadragonForWitness();
    }, 100);
  } else {
    initializeOpenSeadragonForWitness();
  }
  
  function initializeOpenSeadragonForWitness() {
    if (lineViewerLoadTokens.get(viewerId) !== loadToken) return;
    const osdViewer = OpenSeadragon({
      element: viewerEl,
      prefixUrl: 'https://openseadragon.github.io/openseadragon/images/',
      tileSources: tileSources,
      sequenceMode: true,
      showNavigationControl: false,
      showSequenceControl: false,
      initialPage: initialPage,
      crossOriginPolicy: 'Anonymous'
    });
    
    viewerEl.dataset.poem = poem;
    osdViewers.set(viewerId, osdViewer);

    attachFocusedAnnotationViewportHandlers(panel, witness, osdViewer);
    
    osdViewer.addHandler('open', () => {
      updateLineViewerUI(panel, witness, osdViewer.currentPage(), osdViewer.tileSources.length);
      restoreAnnotationRectanglesForOverlay(panel, witness);

      // Slightly increase initial zoom so single-view images appear larger by default
      try {
        if (osdViewer && osdViewer.viewport && typeof osdViewer.viewport.getHomeZoom === 'function') {
          const homeZoom = osdViewer.viewport.getHomeZoom();
          if (typeof homeZoom === 'number' && isFinite(homeZoom)) {
            osdViewer.viewport.zoomTo(homeZoom * 1.18, null, true);
          }
        }
      } catch (err) {
        // ignore if viewport methods differ by version
      }

      if (annotationState.selectedPoem === poem && annotationState.selectedLineId) {
        const annotation = getAnnotationForViewer(panel, annotationState.selectedLineId, witness, poem);
        if (annotation) zoomViewerToAnnotation(panel, witness, annotation);
      }
    });
    
    osdViewer.addHandler('page', (event) => {
      updateLineViewerUI(panel, witness, event.page, osdViewer.tileSources.length);
    });

  }
}

// Load transcription from XML for a specific panel
async function loadTranscriptionFromXml(panel, poem, witness) {
  const textContent = getPanelElement(panel, '.text-content');
  if (!textContent) return;
  const loadToken = {};
  panel.transcriptionLoadToken = loadToken;
  textContent.classList.remove('has-tei-edition');
  
  if (!poem || !witness) {
    textContent.innerHTML = '<p>Please select a poem and a witness.</p>';
    return;
  }
  
  if (!witnessFiles[witness]) {
    textContent.innerHTML = `<p>No data file specified for witness ${witness}.</p>`;
    return;
  }
  
  try {
    const xmlDoc = await loadWitnessXml(witness, poem);
    if (panel.transcriptionLoadToken !== loadToken) return;
    
    const poemNode = getTranscriptionNode(xmlDoc, poem);
    
    if (poemNode && poemNode.firstElementChild) {
      const serializer = new XMLSerializer();
      const teiString = serializer.serializeToString(poemNode);
      const teiDoc = new DOMParser().parseFromString(teiString, "application/xml");
      
      const html = cetei.domToHTML5(teiDoc);
      textContent.innerHTML = '';
      const isTrial = Array.from(poemNode.getElementsByTagNameNS(TEI_NS, 'div'))
        .some(div => div.getAttribute('type') === 'poem' && div.getAttribute('n') === poem);
      textContent.classList.toggle('has-tei-edition', isTrial);
      textContent.appendChild(isTrial ? renderTrialEdition(html, poemNode, panel, witness, poem) : html);
      setupHighlightListeners(panel);
      attachClickableLineHandlers(panel);
    } else {
      const availableWitnesses = await getAvailableTranscriptionWitnesses(poem);
      const currentPoem = getTextPanelPoem(panel);
      const currentWitness = getTextPanelWitness(panel);
      if (currentPoem === poem && currentWitness === witness) {
        renderTranscriptionUnavailable(panel, poem, witness, availableWitnesses);
      }
    }
  } catch (e) {
    if (panel.transcriptionLoadToken !== loadToken) return;
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

// Attach click handlers to rendered poem lines in the transcription panel
function attachClickableLineHandlers(panel) {
  const textContent = getPanelElement(panel, '.text-content');
  if (!textContent) return;

  const lineElements = Array.from(textContent.querySelectorAll('tei-l'));
  lineElements.forEach((lineEl, index) => {
    let lineId = lineEl.dataset.line || lineEl.getAttribute('n');
    if (!lineId) {
      // Fallback: if no explicit line number attribute exists, expose a sequential line index
      lineId = String(index + 1);
      lineEl.dataset.line = lineId;
    }

    lineEl.classList.add('clickable-line');

    if (lineEl.__clickableLineHandler) {
      lineEl.removeEventListener('click', lineEl.__clickableLineHandler);
    }

    const handler = (event) => {
      if (event.target.closest('button, a')) return;
      event.stopPropagation();
      const poem = getTextPanelPoem(panel);
      setSelectedAnnotationLine(lineId, getTextPanelWitness(panel), poem);
      zoomAllViewersToLine(lineId, poem);
      console.log('Clicked poem line', lineId, 'poem', poem);
    };

    lineEl.__clickableLineHandler = handler;
    lineEl.addEventListener('click', handler);
    lineEl.tabIndex = 0;
    lineEl.onkeydown = event => {
      if (event.target !== lineEl || !['Enter', ' '].includes(event.key)) return;
      event.preventDefault();
      handler(event);
    };
  });
}

function getTextPanelWitness(panel) {
  const witnessSelect = getPanelElement(panel, '.witness-select');
  return witnessSelect ? witnessSelect.value : null;
}

function getTextPanelPoem(panel) {
  const poemSelect = getPanelElement(panel, '.poem-select');
  return poemSelect ? poemSelect.value : null;
}

function getViewerId(panel, witness) {
  return `${panel.id}-${witness}`;
}

function getAnnotationViewer(panel, witness) {
  return getPanelType(panel) === PANEL_TYPES.VIEWER
    ? osdViewers.get(panel.id)
    : osdViewers.get(getViewerId(panel, witness));
}

function getAnnotationOverlay(panel, witness) {
  return getPanelType(panel) === PANEL_TYPES.VIEWER
    ? getPanelElement(panel, '.single-viewer-annotation-overlay')
    : getPanelElement(panel, `.annotation-overlay[data-witness="${witness}"]`);
}

function setSelectedAnnotationLine(lineId, sourceWitness, poem) {
  const changedLine = annotationState.selectedLineId !== lineId || annotationState.selectedPoem !== poem;
  annotationState.selectedLineId = lineId;
  annotationState.selectedLineWitness = sourceWitness || null;
  annotationState.selectedPoem = poem || null;
  annotationState.activePanelId = annotationState.activePanelId || null;

  if (changedLine) {
    document.querySelectorAll('#panels .annotation-overlay').forEach(overlay => {
      clearCurrentAnnotationMarkers(overlay);
    });
  }

  refreshAllAnnotationToolbars();
}

function getAnnotationForViewer(panel, lineId, witness, poem) {
  const annotation = annotationState.annotations.find(annotation =>
    annotation.lineId === lineId &&
    annotation.witness === witness &&
    (annotation.poem ? annotation.poem === poem : poem == null)
  );
  // A scholar's rectangle takes precedence over a reviewed page-only fallback.
  return annotation ? applyReviewedNavigation(annotation, witness, poem, lineId)
    : getReviewedSurfaceNavigation(witness, poem, lineId);
}

function getViewerViewportRectFromImageRect(osdViewer, imageRect) {
  const topLeftViewport = osdViewer.viewport.imageToViewportCoordinates(new OpenSeadragon.Point(imageRect.x, imageRect.y));
  const bottomRightViewport = osdViewer.viewport.imageToViewportCoordinates(new OpenSeadragon.Point(imageRect.x + imageRect.width, imageRect.y + imageRect.height));

  return new OpenSeadragon.Rect(
    topLeftViewport.x,
    topLeftViewport.y,
    bottomRightViewport.x - topLeftViewport.x,
    bottomRightViewport.y - topLeftViewport.y
  );
}

function zoomViewerToAnnotation(panel, witness, annotation) {
  const osdViewer = getAnnotationViewer(panel, witness);
  if (!osdViewer) return;

  const pageIndex = Math.max(0, annotation.page - 1);
  if (annotation.unlocated) {
    const overlay = getAnnotationOverlay(panel, witness);
    if (overlay) clearCurrentAnnotationMarkers(overlay);
    if (osdViewer.currentPage() !== pageIndex) {
      osdViewer.goToPage(pageIndex);
    } else {
      osdViewer.viewport.goHome(true);
      if (overlay) {
        const label = document.createElement('span');
        label.className = 'annotation-focus-label';
        label.textContent = 'Verse location unverified';
        overlay.appendChild(label);
        overlay.classList.add('hidden-rects');
      }
    }
    return;
  }
  const fitBounds = () => {
    const fitRectangle = getViewerViewportRectFromImageRect(osdViewer, annotation);
    if (fitRectangle.width <= 0 || fitRectangle.height <= 0) return;
    osdViewer.viewport.fitBounds(fitRectangle, true);

    showFocusedAnnotation(panel, witness, annotation);
  };

  if (osdViewer.currentPage() !== pageIndex) {
    // The page event fires before the new image opens. Both viewer modes'
    // open handlers refocus the currently selected annotation using the new
    // image dimensions; fitting here would use the preceding page's geometry.
    osdViewer.goToPage(pageIndex);
  } else {
    fitBounds();
  }
}

function zoomAllViewersToLine(lineId, poem) {
  const viewerPanels = Array.from(document.querySelectorAll(`section[data-panel-type="${PANEL_TYPES.LINE_VIEWER}"]`));
  viewerPanels.forEach(panel => {
    const poemSelect = getPanelElement(panel, '.poem-select');
    if (poemSelect && poemSelect.value !== poem) {
      poemSelect.value = poem;
      poemSelect.dispatchEvent(new Event('change'));
    }

    getSelectedLineWitnesses(panel).forEach(witness => {
      const annotation = getAnnotationForViewer(panel, lineId, witness, poem);
      const viewerEl = panel.querySelector(`.viewer[data-witness="${witness}"]`);
      if (annotation && viewerEl?.dataset.poem === poem) {
        zoomViewerToAnnotation(panel, witness, annotation);
      }
    });
  });

  const singleViewerPanels = Array.from(document.querySelectorAll(`section[data-panel-type="${PANEL_TYPES.VIEWER}"]`));
  singleViewerPanels.forEach(panel => {
    const activeWitnessButton = getPanelElement(panel, '.witness-buttons button.active');
    const poemSelect = getPanelElement(panel, '.poem-select');
    if (!activeWitnessButton || !poemSelect) return;

    const witness = activeWitnessButton.dataset.witness;
    if (poemSelect.value !== poem) {
      poemSelect.value = poem;
      poemSelect.dispatchEvent(new Event('change'));
      return;
    }

    const annotation = getAnnotationForViewer(panel, lineId, witness, poem);
    const viewerEl = getPanelElement(panel, '.viewer');
    if (annotation && viewerEl?.dataset.poem === poem && viewerEl.dataset.witness === witness) {
      zoomViewerToAnnotation(panel, witness, annotation);
    }
  });
}

function refreshAllAnnotationToolbars() {
  document.querySelectorAll(`section[data-panel-type="${PANEL_TYPES.LINE_VIEWER}"]`).forEach(panel => {
    refreshAnnotationToolbar(panel);
  });
}

function refreshAnnotationToolbar(panel) {
  const activeLineEl = getPanelElement(panel, '.annotation-active-line');
  const sourceEl = getPanelElement(panel, '.annotation-source-witness');
  const toggleBtn = getPanelElement(panel, '.toggle-annotation');
  const messageEl = getPanelElement(panel, '.annotation-message');
  const targetSelect = getPanelElement(panel, '.annotation-witness-select');
  const isActive = annotationState.activePanelId === panel.id && annotationState.activeWitness;

  if (activeLineEl) {
    activeLineEl.textContent = annotationState.selectedLineId || 'None';
  }

  if (sourceEl) {
    sourceEl.textContent = annotationState.selectedLineWitness || '—';
  }

  if (toggleBtn) {
    toggleBtn.textContent = isActive ? 'Stop annotation' : 'Start annotation';
    toggleBtn.disabled = !annotationState.selectedLineId || getSelectedLineWitnesses(panel).length === 0;
  }

  if (messageEl && !messageEl.textContent) {
    messageEl.textContent = '';
  }

  if (targetSelect && annotationState.selectedLineWitness && getSelectedLineWitnesses(panel).includes(annotationState.selectedLineWitness)) {
    targetSelect.value = annotationState.selectedLineWitness;
  }

  FACSIMILE_WITNESSES.forEach(witness => {
    const overlay = getPanelElement(panel, `.annotation-overlay[data-witness="${witness}"]`);
    if (overlay) {
      const shouldEnable = isActive && annotationState.activeWitness === witness;
      overlay.classList.toggle('active', shouldEnable);
      overlay.style.pointerEvents = shouldEnable ? 'auto' : 'none';
    }
  });
}

function showAnnotationMessage(panel, message) {
  const messageEl = getPanelElement(panel, '.annotation-message');
  if (messageEl) {
    messageEl.textContent = message;
  }
}

function getPanelAnnotationTarget(panel) {
  const targetSelect = getPanelElement(panel, '.annotation-witness-select');
  return targetSelect ? targetSelect.value : 'P';
}

function hideAllAnnotationRectangles(panel) {
  const overlays = getPanelElements(panel, '.annotation-overlay');
  overlays.forEach(overlay => overlay.classList.add('hidden-rects'));
}

function clearCurrentAnnotationMarkers(overlay) {
  overlay.querySelectorAll('.annotation-rect.current-annotation').forEach(rect => {
    rect.classList.remove('current-annotation');
  });
  overlay.querySelector('.annotation-focus-label')?.remove();
}

function showFocusedAnnotation(panel, witness, annotation) {
  const overlay = getAnnotationOverlay(panel, witness);
  const osdViewer = getAnnotationViewer(panel, witness);
  if (!overlay || !osdViewer || osdViewer.currentPage() !== annotation.page - 1) return;

  clearCurrentAnnotationMarkers(overlay);

  const selector = `.annotation-rect[data-line-id="${annotation.lineId}"][data-poem="${annotation.poem}"]`;
  let rect = overlay.querySelector(selector);
  const overlayRect = getOverlayRectFromImageRect(osdViewer, annotation);

  if (!rect) {
    rect = createAnnotationRect(
      overlay,
      overlayRect.left,
      overlayRect.top,
      overlayRect.width,
      overlayRect.height,
      annotation.page,
      annotation.lineId,
      false,
      annotation.poem
    );
  } else {
    rect.style.left = `${overlayRect.left}px`;
    rect.style.top = `${overlayRect.top}px`;
    rect.style.width = `${overlayRect.width}px`;
    rect.style.height = `${overlayRect.height}px`;
  }

  rect.classList.add('current-annotation');
  const label = document.createElement('span');
  label.className = 'annotation-focus-label';
  label.textContent = `Line ${annotation.lineId}`;
  if (panel.dataset.panelType === PANEL_TYPES.VIEWER) {
    const clearButton = document.createElement('button');
    clearButton.type = 'button';
    clearButton.className = 'annotation-focus-clear';
    clearButton.textContent = '×';
    clearButton.setAttribute('aria-label', 'Clear selected-line highlight');
    clearButton.title = 'Clear selected-line highlight';
    clearButton.addEventListener('click', event => {
      event.stopPropagation();
      clearCurrentAnnotationMarkers(overlay);
      // Return keyboard focus to the viewer without changing its page or zoom.
      osdViewer.element.setAttribute('tabindex', '-1');
      osdViewer.element.focus({ preventScroll: true });
    });
    label.appendChild(clearButton);
  } else {
    label.setAttribute('aria-hidden', 'true');
  }
  overlay.appendChild(label);
  overlay.classList.add('hidden-rects');
  refreshAnnotationOverlayVisibility(panel, witness, osdViewer.currentPage());
}

function positionFocusedAnnotation(panel, witness) {
  const overlay = getAnnotationOverlay(panel, witness);
  const osdViewer = getAnnotationViewer(panel, witness);
  const poem = getPanelElement(panel, '.poem-select')?.value;
  const lineId = annotationState.selectedLineId;
  if (!overlay || !osdViewer || !poem || !lineId) return;

  const annotation = getAnnotationForViewer(panel, lineId, witness, poem);
  const rect = overlay.querySelector('.annotation-rect.current-annotation');
  if (!annotation || annotation.unlocated || !rect || osdViewer.currentPage() !== annotation.page - 1) return;

  const overlayRect = getOverlayRectFromImageRect(osdViewer, annotation);
  rect.style.left = `${overlayRect.left}px`;
  rect.style.top = `${overlayRect.top}px`;
  rect.style.width = `${overlayRect.width}px`;
  rect.style.height = `${overlayRect.height}px`;
}

function attachFocusedAnnotationViewportHandlers(panel, witness, osdViewer) {
  let focusAnimationFrame = null;
  const scheduleFocusedAnnotationPosition = () => {
    if (focusAnimationFrame !== null) return;
    focusAnimationFrame = requestAnimationFrame(() => {
      focusAnimationFrame = null;
      positionFocusedAnnotation(panel, witness);
    });
  };

  // Annotation rectangles are HTML overlays, so keep the active one aligned
  // while OpenSeadragon transforms the manuscript image.
  osdViewer.addHandler('animation', scheduleFocusedAnnotationPosition);
  osdViewer.addHandler('animation-finish', scheduleFocusedAnnotationPosition);
  osdViewer.addHandler('canvas-drag', scheduleFocusedAnnotationPosition);
  osdViewer.addHandler('canvas-scroll', scheduleFocusedAnnotationPosition);
  osdViewer.addHandler('resize', scheduleFocusedAnnotationPosition);
}

function toggleAnnotationMode(panel) {
  const targetWitness = getPanelAnnotationTarget(panel);
  if (!annotationState.selectedLineId) {
    showAnnotationMessage(panel, 'Select a line in the transcription first.');
    return;
  }

  const viewerId = getViewerId(panel, targetWitness);
  if (!osdViewers.has(viewerId)) {
    showAnnotationMessage(panel, `Load witness ${targetWitness} before annotating.`);
    return;
  }

  const alreadyActive = annotationState.activePanelId === panel.id && annotationState.activeWitness === targetWitness;
  const overlays = getPanelElements(panel, '.annotation-overlay');
  if (alreadyActive) {
    overlays.forEach(overlay => {
      overlay.classList.add('hidden-rects');
      clearCurrentAnnotationMarkers(overlay);
    });
    annotationState.activePanelId = null;
    annotationState.activeWitness = null;
    removePreviewRectangle();
    showAnnotationMessage(panel, 'Annotation mode stopped.');
  } else {
    overlays.forEach(overlay => {
      overlay.classList.add('hidden-rects');
      clearCurrentAnnotationMarkers(overlay);
    });
    annotationState.activePanelId = panel.id;
    annotationState.activeWitness = targetWitness;
    annotationState.drawing = false;
    annotationState.previewRect = null;
    showAnnotationMessage(panel, `Annotation mode enabled for ${targetWitness}. Draw a rectangle on the viewer.`);
  }

  refreshAllAnnotationToolbars();
}

function removePreviewRectangle() {
  if (annotationState.previewRect) {
    annotationState.previewRect.remove();
    annotationState.previewRect = null;
  }
  annotationState.drawing = false;
  annotationState.drawStart = null;
  annotationState.activeOverlay = null;
  unbindAnnotationMoveHandlers();
}

function getOverlayCoordinates(event, overlay) {
  const rect = overlay.getBoundingClientRect();
  return {
    x: Math.max(0, Math.min(rect.width, event.clientX - rect.left)),
    y: Math.max(0, Math.min(rect.height, event.clientY - rect.top))
  };
}

function updateAnnotationPreview(current) {
  if (!annotationState.previewRect || !annotationState.drawStart) return;

  const start = annotationState.drawStart;
  const left = Math.min(start.x, current.x);
  const top = Math.min(start.y, current.y);
  const width = Math.abs(current.x - start.x);
  const height = Math.abs(current.y - start.y);

  annotationState.previewRect.style.left = `${left}px`;
  annotationState.previewRect.style.top = `${top}px`;
  annotationState.previewRect.style.width = `${width}px`;
  annotationState.previewRect.style.height = `${height}px`;
}

function finalizeAnnotation(panel, witness, overlay, endPoint) {
  if (!annotationState.drawStart) return;

  const start = annotationState.drawStart;
  const left = Math.min(start.x, endPoint.x);
  const top = Math.min(start.y, endPoint.y);
  const width = Math.abs(endPoint.x - start.x);
  const height = Math.abs(endPoint.y - start.y);

  removePreviewRectangle();

  if (width < 10 || height < 10) {
    showAnnotationMessage(panel, 'Draw a larger annotation region.');
    return;
  }

  const viewerId = getViewerId(panel, witness);
  const osdViewer = osdViewers.get(viewerId);
  if (!osdViewer) {
    showAnnotationMessage(panel, `Unable to annotate ${witness} without a loaded viewer.`);
    return;
  }

  const page = osdViewer.currentPage() + 1;
  const imageRect = getImageRectangleFromOverlayCoords(osdViewer, left, top, width, height);

  // Remove any previous annotation rectangle for this line/witness so the latest one replaces it.
  clearCurrentAnnotationMarkers(overlay);
  removeSavedAnnotationRects(overlay, annotationState.selectedLineId, annotationState.selectedPoem);
  const rect = createAnnotationRect(
    overlay,
    left,
    top,
    width,
    height,
    page,
    annotationState.selectedLineId,
    true,
    annotationState.selectedPoem
  );

  upsertAnnotation({
    panelId: panel.id,
    witness,
    lineId: annotationState.selectedLineId,
    poem: annotationState.selectedPoem,
    sourceWitness: annotationState.selectedLineWitness,
    page,
    x: Math.round(imageRect.x),
    y: Math.round(imageRect.y),
    width: Math.round(imageRect.width),
    height: Math.round(imageRect.height)
  });

  showAnnotationMessage(panel, `Saved annotation for ${witness} page ${page}.`);
  refreshAnnotationOverlayVisibility(panel, witness, osdViewer.currentPage());
}

function getImageRectangleFromOverlayCoords(osdViewer, left, top, width, height) {
  const topLeftViewport = osdViewer.viewport.viewerElementToViewportCoordinates(new OpenSeadragon.Point(left, top));
  const bottomRightViewport = osdViewer.viewport.viewerElementToViewportCoordinates(new OpenSeadragon.Point(left + width, top + height));

  const topLeftImage = osdViewer.viewport.viewportToImageCoordinates(topLeftViewport);
  const bottomRightImage = osdViewer.viewport.viewportToImageCoordinates(bottomRightViewport);

  return {
    x: Math.min(topLeftImage.x, bottomRightImage.x),
    y: Math.min(topLeftImage.y, bottomRightImage.y),
    width: Math.abs(bottomRightImage.x - topLeftImage.x),
    height: Math.abs(bottomRightImage.y - topLeftImage.y)
  };
}

function createAnnotationRect(overlay, left, top, width, height, page, lineId, isCurrent = false, poem = null) {
  const rect = document.createElement('div');
  rect.className = 'annotation-rect';
  if (isCurrent) {
    rect.classList.add('current-annotation');
  }
  rect.style.left = `${left}px`;
  rect.style.top = `${top}px`;
  rect.style.width = `${width}px`;
  rect.style.height = `${height}px`;
  rect.dataset.page = String(page);
  if (lineId) {
    rect.dataset.lineId = lineId;
  }
  if (poem) {
    rect.dataset.poem = poem;
  }
  overlay.appendChild(rect);
  return rect;
}

function clearAnnotations(panel) {
  document.querySelectorAll(`section[data-panel-type="${PANEL_TYPES.LINE_VIEWER}"]`).forEach(lineViewerPanel => {
    getPanelElements(lineViewerPanel, '.annotation-overlay').forEach(overlay => {
      overlay.querySelectorAll('.annotation-rect, .annotation-preview').forEach(el => el.remove());
    });
  });
  annotationState.annotations = [];
  saveAnnotationsToStorage();
  annotationState.drawing = false;
  annotationState.drawStart = null;
  annotationState.previewRect = null;
  annotationState.activeOverlay = null;
  unbindAnnotationMoveHandlers();
  showAnnotationMessage(panel, 'Cleared local annotations. Reload the page to restore the published set.');
  refreshAllAnnotationToolbars();
}

function exportAnnotations(panel) {
  const payload = annotationState.annotations;
  if (!payload.length) {
    showAnnotationMessage(panel, 'No annotations available to export.');
    return;
  }

  const jsonBlob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(jsonBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'amores-annotations.json';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  showAnnotationMessage(panel, `Exported ${payload.length} annotation(s).`);
}

function refreshAnnotationOverlayVisibility(panel, witness, currentPage) {
  const overlay = getAnnotationOverlay(panel, witness);
  if (!overlay) return;

  overlay.querySelectorAll('.annotation-rect').forEach(rect => {
    const rectPage = Number(rect.dataset.page);
    rect.style.display = rectPage === currentPage + 1 ? 'block' : 'none';
  });
}

function handleAnnotationPointerDown(event, panel) {
  const overlay = event.currentTarget;
  const witness = overlay.dataset.witness;
  if (annotationState.activePanelId !== panel.id || annotationState.activeWitness !== witness) return;
  if (!annotationState.selectedLineId) {
    showAnnotationMessage(panel, 'Select a transcription line before annotating.');
    return;
  }

  event.preventDefault();
  event.stopPropagation();
  overlay.setPointerCapture(event.pointerId);

  removePreviewRectangle();
  annotationState.drawing = true;
  annotationState.drawStart = getOverlayCoordinates(event, overlay);
  annotationState.activeOverlay = overlay;

  const preview = document.createElement('div');
  preview.className = 'annotation-preview';
  overlay.appendChild(preview);
  annotationState.previewRect = preview;

  bindAnnotationMoveHandlers(panel);
}

function handleAnnotationPointerMove(event) {
  if (!annotationState.drawing || !annotationState.previewRect || !annotationState.activeOverlay) return;
  const overlay = annotationState.activeOverlay;
  const current = getOverlayCoordinates(event, overlay);
  updateAnnotationPreview(current);
}

function handleAnnotationPointerUp(event) {
  if (!annotationState.drawing || !annotationState.activeOverlay) return;
  const overlay = annotationState.activeOverlay;
  const witness = overlay.dataset.witness;
  const endPoint = getOverlayCoordinates(event, overlay);
  const panel = document.querySelector(`section[data-panel-type="${PANEL_TYPES.LINE_VIEWER}"]#${annotationState.activePanelId}`);
  if (panel) {
    finalizeAnnotation(panel, witness, overlay, endPoint);
  }
  if (overlay.hasPointerCapture && overlay.hasPointerCapture(event.pointerId)) {
    overlay.releasePointerCapture(event.pointerId);
  }
  unbindAnnotationMoveHandlers();
}

function handleAnnotationPointerLeave(event) {
  // Keep drawing alive until pointer up; do not finalize on leave.
}

function bindAnnotationMoveHandlers(panel) {
  if (annotationState.boundMoveHandler || annotationState.boundUpHandler) return;
  annotationState.boundMoveHandler = (event) => handleAnnotationPointerMove(event);
  annotationState.boundUpHandler = (event) => handleAnnotationPointerUp(event);
  document.addEventListener('pointermove', annotationState.boundMoveHandler);
  document.addEventListener('pointerup', annotationState.boundUpHandler);
  document.addEventListener('pointercancel', annotationState.boundUpHandler);
}

function unbindAnnotationMoveHandlers() {
  if (annotationState.boundMoveHandler) {
    document.removeEventListener('pointermove', annotationState.boundMoveHandler);
    annotationState.boundMoveHandler = null;
  }
  if (annotationState.boundUpHandler) {
    document.removeEventListener('pointerup', annotationState.boundUpHandler);
    document.removeEventListener('pointercancel', annotationState.boundUpHandler);
    annotationState.boundUpHandler = null;
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
let synchronizingInitialPoem = false;

function syncEmptyPoemSelectors(sourceSelect, poem) {
  if (!poem || synchronizingInitialPoem) return;

  const otherSelectors = Array.from(document.querySelectorAll('#panels section .poem-select'))
    .filter(select => select !== sourceSelect);

  // This is an initial convenience only. Once any other panel has a poem,
  // every selector remains independent so comparisons can intentionally differ.
  if (!otherSelectors.length || !otherSelectors.every(select => !select.value)) return;

  synchronizingInitialPoem = true;
  try {
    otherSelectors.forEach(select => {
      select.value = poem;
      select.dispatchEvent(new Event('change'));
    });
  } finally {
    synchronizingInitialPoem = false;
  }
}

function attachPanelEventHandlers(panel) {
  const type = getPanelType(panel);
  
  if (type === PANEL_TYPES.TRANSCRIPTION) {
    const poemSelect = getPanelElement(panel, '.poem-select');
    const witnessSelect = getPanelElement(panel, '.witness-select');
    
    if (poemSelect) {
      poemSelect.onchange = (e) => {
        const poem = e.target.value;
        syncEmptyPoemSelectors(poemSelect, poem);
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
      poemSelect.onchange = (event) => {
        const poem = event.target.value;
        syncEmptyPoemSelectors(poemSelect, poem);
        const activeBtn = getPanelElement(panel, '.witness-buttons button.active');
        if (activeBtn && poem) {
          loadManifest(panel, poem, activeBtn.dataset.witness);
        }
        savePanelState(panel);
      };
    }

    witnessBtns.forEach(btn => {
      btn.onclick = () => {
        const poem = poemSelect ? poemSelect.value : '';
        if (!poem) {
          return alert('Please select a poem first.');
        }

        witnessBtns.forEach(witnessBtn => witnessBtn.classList.remove('active'));
        btn.classList.add('active');
        loadManifest(panel, poem, btn.dataset.witness);
        savePanelState(panel);
      };
    });

    if (prevBtn) {
      prevBtn.onclick = () => {
        const osdViewer = osdViewers.get(panel.id);
        if (osdViewer && osdViewer.currentPage() > 0) {
          osdViewer.goToPage(osdViewer.currentPage() - 1);
        }
      };
    }

    if (nextBtn) {
      nextBtn.onclick = () => {
        const osdViewer = osdViewers.get(panel.id);
        if (osdViewer && osdViewer.currentPage() < osdViewer.tileSources.length - 1) {
          osdViewer.goToPage(osdViewer.currentPage() + 1);
        }
      };
    }

    if (goToPageBtn && pageInput) {
      goToPageBtn.onclick = () => {
        const osdViewer = osdViewers.get(panel.id);
        const page = parseInt(pageInput.value, 10) - 1;
        if (osdViewer && !isNaN(page) && page >= 0 && page < osdViewer.tileSources.length) {
          osdViewer.goToPage(page);
        }
      };

      pageInput.onkeydown = (event) => {
        if (event.key === 'Enter') {
          goToPageBtn.click();
        }
      };
    }
  } else if (type === PANEL_TYPES.LINE_VIEWER) {
    const poemSelect = getPanelElement(panel, '.poem-select');
    if (poemSelect) {
      poemSelect.onchange = () => {
        syncEmptyPoemSelectors(poemSelect, poemSelect.value);
        updateLineWitnessSelection(panel, true);
      };
    }
    getPanelElements(panel, '.manuscript-checkbox').forEach(input => {
      input.onchange = () => updateLineWitnessSelection(panel);
    });

    const toggleAnnotationBtn = getPanelElement(panel, '.toggle-annotation');
    const clearAnnotationsBtn = getPanelElement(panel, '.clear-annotations');
    const importAnnotationsBtn = getPanelElement(panel, '.import-annotations');
    const importAnnotationsInput = getPanelElement(panel, '.annotation-import-input');
    const exportAnnotationsBtn = getPanelElement(panel, '.export-annotations');
    const annotationOverlays = getPanelElements(panel, '.annotation-overlay');

    if (toggleAnnotationBtn) {
      toggleAnnotationBtn.onclick = () => {
        toggleAnnotationMode(panel);
      };
    }

    if (clearAnnotationsBtn) {
      clearAnnotationsBtn.onclick = () => {
        clearAnnotations(panel);
      };
    }

    if (importAnnotationsBtn && importAnnotationsInput) {
      importAnnotationsBtn.onclick = () => {
        importAnnotationsInput.click();
      };

      importAnnotationsInput.onchange = async (event) => {
        const file = event.target.files && event.target.files[0];
        if (!file) return;

        try {
          const result = await importAnnotationsFromFile(file);
          showAnnotationMessage(panel, result.message);
        } catch (error) {
          console.error('Failed to import annotations:', error);
          showAnnotationMessage(panel, 'Failed to import annotations. Check that the file is valid JSON.');
        } finally {
          importAnnotationsInput.value = '';
        }
      };
    }

    if (exportAnnotationsBtn) {
      exportAnnotationsBtn.onclick = () => {
        exportAnnotations(panel);
      };
    }

    annotationOverlays.forEach(overlay => {
      overlay.onpointerdown = (event) => handleAnnotationPointerDown(event, panel);
      overlay.onpointermove = (event) => handleAnnotationPointerMove(event, panel);
      overlay.onpointerup = (event) => handleAnnotationPointerUp(event, panel);
      overlay.onpointerleave = (event) => handleAnnotationPointerLeave(event, panel);
      overlay.classList.add('hidden-rects');
    });

    refreshAnnotationToolbar(panel);
  } else if (type === PANEL_TYPES.COMPANION) {
    const poemSelect = getPanelElement(panel, '.poem-select');
    const companionCheckboxes = getPanelElements(panel, '.companion-controls input');
    
    if (poemSelect) {
      poemSelect.onchange = () => {
        syncEmptyPoemSelectors(poemSelect, poemSelect.value);
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
  const stackedLayout = window.matchMedia('(max-width: 900px)');
  
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
        if (!stackedLayout.matches) {
          splitInstance.collapse(idx);
        }
        btn.textContent = '☰';
        btn.title = 'Expand panel';
      } else {
        if (!stackedLayout.matches) {
          splitInstance.setSizes(originalSizes);
        }
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
function openRequestedTranscription() {
  const params = new URLSearchParams(window.location.search);
  const poem = params.get('poem');
  const witness = params.get('witness');
  const textPanel = document.getElementById('text-panel');
  if (!textPanel || !poem || !Object.hasOwn(witnessFiles, witness)) return;
  const poemSelect = getPanelElement(textPanel, '.poem-select');
  const witnessSelect = getPanelElement(textPanel, '.witness-select');
  if (!Array.from(poemSelect.options).some(option => option.value === poem)) return;
  poemSelect.value = poem;
  witnessSelect.value = witness;
  poemSelect.dispatchEvent(new Event('change'));
  const viewerPanel = document.getElementById('viewer-panel');
  getPanelElement(viewerPanel, `.witness-buttons button[data-witness="${witness}"]`)?.click();
  if (params.get('layout') === 'compare') {
    const companion = document.getElementById('comm-panel');
    if (!companion.classList.contains('collapsed')) companion.querySelector('.toggle-btn')?.click();
    window.splitInstance?.setSizes([49, 49, 2]);
  }
}

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
  
  // The research workspace and its heavier data only exist on the home page.
  if (document.getElementById('panels')) {
    initializePanels();
    openRequestedTranscription();

    loadAnnotations().then(loaded => {
      if (loaded) {
        restoreAnnotationsForAllViewerPanels();
        refreshAllAnnotationToolbars();
      }
    });

    bindTutorialEvents();

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
  }
});
