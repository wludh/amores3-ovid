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

// Initialize Split immediately (no DOMContentLoaded wrapper needed
// because this script runs after the DOM is parsed)
// Capture the instance and original sizes
let splitInstance = Split(
  ['#text-panel', '#viewer-panel', '#comm-panel'],
  {
    sizes:      [30, 40, 30],
    minSize:    [100, 200, 100],
    gutterSize: 6,
    cursor:     'col-resize'
  }
);

// Store the original sizes so we can restore later
const originalSizes = splitInstance.getSizes();

//  ——— Allow panel reordering by dragging the handle ———
const sortableInstance = Sortable.create(
  document.getElementById('panels'),
  {
    handle:     '.drag-handle',   // only this element starts a drag
    draggable:  'section',        // only <section> children are draggable
    animation: 150,
    ghostClass: 'sortable-ghost',
    onEnd: () => {
      // destroy & re-init Split.js just like before
      splitInstance.destroy();
      const selectors = Array.from(
        document.querySelectorAll('#panels > section')
      ).map(el => `#${el.id}`);

      splitInstance = Split(selectors, {
        sizes:      originalSizes,
        minSize:    [100, 200, 100],
        gutterSize: 6,
        cursor:     'col-resize'
      });

      // update our panelIndex map
      selectors.forEach((sel, i) => {
        const id = sel.replace('#', '');
        panelIndex[id] = i;
      });
    }
  }
);



// Map panel IDs to their split index
const panelIndex = {
  'text-panel':   0,
  'viewer-panel': 1,
  'comm-panel':   2
};


// Placeholder text lives in data.js. This table just maps poem numbers to page indices.
const poemPageIndex = {};
for (let i = 1; i <= 15; i++) {
  poemPageIndex[`3.${i}`] = i - 1;
}

// For now, only map 3.1 → f84
const poemFolio = {
  '3.1': 'f84'
};


// Helper to construct IIIF manifest URLs
function getManifestUrl(poem, witness) {
  // Point to our new local manifest files
  let url;

  if (witness === 'P') {
    url = 'data/iiif-manifests/witness-P.json';
  } else if (witness === 'Y') {
    url = 'data/iiif-manifests/witness-Y.json';
  } else if (witness === 'S') {
    url = 'data/iiif-manifests/witness-S.json';
  }

  return url; // Directly return the local path or null
}


// Populate the <select> with options 3.1–3.15
const poemSelect = document.getElementById('poem-select');
Object.keys(companionData).forEach(poem => {
  const opt = document.createElement('option');
  opt.value = poem;
  opt.textContent = `Amores ${poem}`;
  poemSelect.appendChild(opt);
});

const textContent  = document.getElementById('text-content');
const extraContent = document.getElementById('extra-content');
const companionCheckboxes = document.querySelectorAll('#companion-controls input');
const witnessBtns  = document.querySelectorAll('#witness-buttons button');
const prevBtn      = document.getElementById('prev-page');
const nextBtn      = document.getElementById('next-page');
const witnessSelect = document.getElementById('witness-select');
const pageIndicator = document.getElementById('page-indicator');
const pageInput = document.getElementById('page-input');
const goToPageBtn = document.getElementById('go-to-page');
const progressBar = document.getElementById('progress-bar');

// This is the new, async function to handle the companion panel
async function updateCompanionPanel() {
  const poem = poemSelect.value;
  if (!poem) {
    extraContent.innerHTML = '<p>Please select a poem.</p>';
    return;
  }

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
      // Basic function to convert kebab-case to PascalCase
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
        // Use the original extra name for the key
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
          // Add a data attribute to the div for linking
          html += `<div class="companion-item ${extraName} ${colorClass}" data-line-range="${lineRange}">`;
          // Prepend line number only to the first available item for this line range
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
    // NOTE: Listeners are now set up in updateTextAndExtras after all content is loaded.
  } catch (error) {
    console.error('Failed to load companion data:', error);
    extraContent.innerHTML = '<p>Error loading companion data. See console for details.</p>';
  }
}

// --- Highlighting and Linking Logic ---
// Store references to the handlers so we can remove them
let highlightHandlers = {};

function setupHighlightListeners() {
  // First, remove any old listeners to prevent duplicates
  if (highlightHandlers.handleMouseover) {
    textContent.removeEventListener('mouseover', highlightHandlers.handleMouseover);
    extraContent.removeEventListener('mouseover', highlightHandlers.handleMouseover);
    textContent.removeEventListener('mouseleave', highlightHandlers.clearHighlights);
    extraContent.removeEventListener('mouseleave', highlightHandlers.clearHighlights);
    textContent.removeEventListener('click', highlightHandlers.handleClick);
    extraContent.removeEventListener('click', highlightHandlers.handleClick);
  }

  const allElements = () => document.querySelectorAll('[data-line], [data-line-range]');
  
  const clearHighlights = () => {
    allElements().forEach(el => el.classList.remove('highlight'));
  };

  const handleMouseover = (event) => {
    const target = event.target.closest('[data-line], [data-line-range]');
    if (!target) return;
  
    clearHighlights();
  
    // Determine which panel was hovered and highlight the other one
    if (textContent.contains(target)) {
      // Hover is on a transcription line, so highlight companion items
      const line = parseInt(target.dataset.line, 10);
      if (!isNaN(line)) {
        const companionItems = extraContent.querySelectorAll('[data-line-range]');
        companionItems.forEach(item => {
          const [start, end] = item.dataset.lineRange.split('-').map(Number);
          const itemRange = Array.from({ length: (end || start) - start + 1 }, (_, i) => start + i);
          if (itemRange.includes(line)) {
            item.classList.add('highlight');
          }
        });
      }
    } else if (extraContent.contains(target)) {
      // Hover is on a companion item, so highlight transcription lines
      const range = target.dataset.lineRange;
      if (range) {
        const [start, end] = range.split('-').map(Number);
        const lineNumbers = Array.from({ length: (end || start) - start + 1 }, (_, i) => start + i);
        lineNumbers.forEach(ln => {
          const teiLine = textContent.querySelector(`[data-line="${ln}"]`);
          if (teiLine) teiLine.classList.add('highlight');
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
      // Use more precise selector to avoid matching '1' in '10'
      elementToScrollTo = extraContent.querySelector(`[data-line-range="${line}"], [data-line-range^="${line}-"]`);
    } else if (target.matches('[data-line-range]')) {
      const line = target.dataset.lineRange.split('-')[0];
      elementToScrollTo = textContent.querySelector(`[data-line="${line}"]`);
    }

    if (elementToScrollTo) {
      elementToScrollTo.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Store handlers so they can be removed later
  highlightHandlers = { handleMouseover, clearHighlights, handleClick };

  // Attach new listeners using event delegation
  textContent.addEventListener('mouseover', handleMouseover);
  extraContent.addEventListener('mouseover', handleMouseover);
  
  textContent.addEventListener('mouseleave', clearHighlights);
  extraContent.addEventListener('mouseleave', clearHighlights);

  textContent.addEventListener('click', handleClick);
  extraContent.addEventListener('click', handleClick);
}


async function updateTextAndExtras(poem) {
  // Wait for both panels to be updated before setting up listeners
  await Promise.all([
    updateTranscription(poem, witnessSelect.value),
    updateCompanionPanel()
  ]);
  
  setupHighlightListeners();

  // — Reload IIIF if a witness is active —
  const activeW = document.querySelector('#witness-buttons button.active');
  if (activeW) {
    loadManifest(poem, activeW.dataset.witness);
  }
}


let osdViewer = null;
let witnessXmlCache = {}; // Cache for loaded witness XML files

function updateUi(currentPage, totalPages) {
  // Update page indicator
  pageIndicator.textContent = `${currentPage + 1} / ${totalPages}`;

  // Update input field
  pageInput.value = currentPage + 1;
  pageInput.max = totalPages;

  // Update progress bar
  const progress = totalPages > 1 ? (currentPage / (totalPages - 1)) * 100 : 0;
  progressBar.style.width = `${progress}%`;
}

async function loadManifest(poem, witness) {
  const viewerEl = document.getElementById('viewer');
  
  const manifestUrl = getManifestUrl(poem, witness);

  if (!manifestUrl) {
    // If there's no manifest for this witness, clear the viewer.
    if (osdViewer) {
      await osdViewer.destroy();
      osdViewer = null;
    }
    viewerEl.innerHTML = '<p class="viewer-placeholder">IIIF manifest not available for this witness.</p>';
    return;
  }

  if (osdViewer) {
    await osdViewer.destroy();
    osdViewer = null;
  }
  prevBtn.disabled = true;
  nextBtn.disabled = true;
  pageInput.disabled = true;
  goToPageBtn.disabled = true;
  pageIndicator.textContent = '';
  progressBar.style.width = '0%';

  // Fetch and parse the IIIF manifest
  let manifest;
  try {
    const resp = await fetch(manifestUrl);
    manifest = await resp.json();
  } catch (e) {
    viewerEl.innerHTML = '<p>Failed to load IIIF manifest.</p>';
    return;
  }

  // Extract IIIF Image API URLs for each canvas
  const canvases = manifest.sequences?.[0]?.canvases || manifest.items || [];
  const tileSources = canvases.map(canvas => {
    // IIIF Presentation 2.x (sequences/canvases) or 3.x (items)
    let imageService = null;
    if (canvas.images && canvas.images[0]?.resource?.service) {
      // IIIF 2.x
      imageService = canvas.images[0].resource.service['@id'] || canvas.images[0].resource.service.id;
    } else if (canvas.image && canvas.image.service) {
      // Some manifests
      imageService = canvas.image.service['@id'] || canvas.image.service.id;
    } else if (canvas.items && canvas.items[0]?.items && canvas.items[0].items[0]?.body?.service) {
      // IIIF 3.x
      imageService = canvas.items[0].items[0].body.service['@id'] || canvas.items[0].items[0].body.service.id;
    }
    if (imageService) {
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

  // Determine initial page index
  let initialPage = 0;
  const poemIndex = parseInt(poem.split('.')[1]) - 1;
  const pageTarget = witnessPageData[witness] && witnessPageData[witness][poemIndex];

  if (pageTarget !== null && pageTarget !== undefined) {
    // Handle both page numbers (indices) and page labels (strings)
    if (typeof pageTarget === 'number' && pageTarget < canvases.length) {
      initialPage = pageTarget;
    } else if (typeof pageTarget === 'string') {
      const pageIndex = canvases.findIndex(canvas => canvas.label === pageTarget);
      if (pageIndex !== -1) {
        initialPage = pageIndex;
      }
    }
  }

  osdViewer = OpenSeadragon({
    element: viewerEl,
    prefixUrl: 'https://openseadragon.github.io/openseadragon/images/',
    tileSources: tileSources,
    sequenceMode: true,
    initialPage: initialPage,
    crossOriginPolicy: 'Anonymous' // Fixes tainted canvas / WebGL errors
  });

  osdViewer.addHandler('open', () => {
    updatePageButtons();
    updateUi(osdViewer.currentPage(), osdViewer.tileSources.length);
  });
  osdViewer.addHandler('page', (event) => {
    updateUi(event.page, osdViewer.tileSources.length);
    updatePageButtons();
  });

  // Add an event listener for the 'go-to-page' button
  goToPageBtn.addEventListener('click', () => {
    const page = parseInt(pageInput.value, 10) - 1;
    if (!isNaN(page) && page >= 0 && page < osdViewer.tileSources.length) {
      osdViewer.goToPage(page);
    }
  });

  // Add an event listener for the 'Enter' key in the input field
  pageInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      goToPageBtn.click();
    }
  });

  // Initial UI update is handled by the 'open' event handler
  // updateUi(0, tileSources.length);
}

function updatePageButtons() {
  const currentPage = osdViewer.currentPage();
  const totalPages  = osdViewer.tileSources.length;
  prevBtn.disabled = currentPage === 0;
  nextBtn.disabled = currentPage === totalPages - 1;
  pageInput.disabled = false;
  goToPageBtn.disabled = false;
}

// ——— Panel 2: IIIF viewer & witness buttons ———
witnessBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const poem    = poemSelect.value;
    const witness = btn.dataset.witness;
    if (!poem) {
      return alert('Please select a poem under the Text panel first.');
    }

    // 1) Visually highlight the selected witness
    witnessBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // 2) Load the IIIF manifest into OpenSeadragon
    loadManifest(poem, witness);
  });
});

prevBtn.addEventListener('click', () => {
  if (osdViewer.currentPage() > 0) {
    osdViewer.goToPage(osdViewer.currentPage() - 1);
  }
});

nextBtn.addEventListener('click', () => {
  if (osdViewer.currentPage() < osdViewer.tileSources.length - 1) {
    osdViewer.goToPage(osdViewer.currentPage() + 1);
  }
});

// Panel collapse/expand
// Panel collapse/expand using Split.js API
document.querySelectorAll('.toggle-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const section   = btn.closest('section');
    const id        = section.id;
    const idx       = panelIndex[id];
    const isCollapsed = section.classList.toggle('collapsed');

    if (isCollapsed) {
      // Collapse that pane
      splitInstance.collapse(idx);
      btn.textContent = '☰';
      btn.title = 'Expand panel';
    } else {
      // Restore original layout
      splitInstance.setSizes(originalSizes);
      btn.textContent = '×';
      btn.title = 'Collapse panel';
    }
  });
});

async function loadTranscriptionFromXml(poem, witness) {
  const textContent = document.getElementById('text-content');
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
      // We need to pass a full document to CETEI, not just an element.
      const serializer = new XMLSerializer();
      const teiString = serializer.serializeToString(poemNode);
      const teiDoc = new DOMParser().parseFromString(teiString, "application/xml");

      const html = cetei.domToHTML5(teiDoc);
      textContent.innerHTML = '';
      textContent.appendChild(html);
      // Set up listeners after transcription is loaded
      setupHighlightListeners();
    } else {
      textContent.innerHTML = '<p>Transcription not available for this poem.</p>';
    }
  } catch (e) {
    console.error('Error loading or processing transcription:', e);
    textContent.innerHTML = '<p>Error loading transcription data.</p>';
  }
}


function updateTranscription(poem, witness) {
  if (witness) {
    loadTranscriptionFromXml(poem, witness);
  } else {
    // Clear the text content if no witness is selected.
    textContent.innerHTML = '<p>Select a witness to see the transcription.</p>';
  }
}

// When the poem or witness <select> changes
poemSelect.addEventListener('change', (e) => {
  const poem = e.target.value;
  const activeWitnessBtn = document.querySelector('#witness-buttons button.active');

  if (activeWitnessBtn) {
    const witness = activeWitnessBtn.dataset.witness;
    const poemIndex = parseInt(poem.split('.')[1]) - 1;
    const pageTarget = witnessPageData[witness]?.[poemIndex];

    if (pageTarget !== null && pageTarget !== undefined && osdViewer) {
      const targetPage = (typeof pageTarget === 'number') ? pageTarget - 1 : -1;
      
      if (targetPage !== -1 && targetPage < osdViewer.tileSources.length && osdViewer.currentPage() !== targetPage) {
        osdViewer.goToPage(targetPage);
      }
    }
  }

  updateTextAndExtras(poem);
});

witnessSelect.addEventListener('change', () => {
  updateTranscription(poemSelect.value, witnessSelect.value);
});

// Add event listeners for our new checkboxes
companionCheckboxes.forEach(checkbox => {
  checkbox.addEventListener('change', updateCompanionPanel);
});

// On page load, show the default transcription if any
if (poemSelect.value && witnessSelect.value) {
  updateTranscription(poemSelect.value, witnessSelect.value);
}
// Also trigger the initial companion load
updateCompanionPanel();

document.addEventListener('DOMContentLoaded', function() {
  // Theme toggle logic
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
});
