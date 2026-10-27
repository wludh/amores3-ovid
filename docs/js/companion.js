/* Companion reading aids use the reviewed witness and the existing glossary. */
const companionRequests = new WeakMap();
const companionModels = new WeakMap();
const companionFetches = new Map();

function companionEscape(value) {
  return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}

function fetchCompanionResource(path, format = 'json') {
  const key = `${format}:${path}`;
  if (!companionFetches.has(key)) {
    const request = fetch(path).then(response => {
      if (!response.ok) throw new Error(`Unable to load ${path}`);
      return response[format]();
    }).catch(error => {
      if (companionFetches.get(key) === request) companionFetches.delete(key);
      throw error;
    });
    companionFetches.set(key, request);
  }
  return companionFetches.get(key);
}

async function vocabularyHash(text) {
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
}

async function fetchVocabularyData(path) {
  const text = await fetchCompanionResource(path, 'text');
  return { data: JSON.parse(text), sha256: await vocabularyHash(text) };
}

function setupVocabularyControls(panel) {
  if (getPanelElement(panel, '.vocabulary-controls')) return;
  const controls = document.createElement('div');
  controls.className = 'vocabulary-controls';
  controls.hidden = true;
  controls.innerHTML = `
    <div class="vocabulary-scale">
      <button type="button" class="vocabulary-toggle" aria-expanded="true"><span aria-hidden="true">▾</span> Settings</button>
      <input class="vocabulary-amount" type="range" min="0" max="100" step="1" value="50" aria-label="Number of words with vocabulary help">
      <output class="vocabulary-count" aria-live="polite"></output>
      <button type="button" class="vocabulary-export" disabled title="Download the displayed vocabulary for Anki or Quizlet">Export</button>
    </div>
    <div class="vocabulary-options">
      <div class="vocabulary-stops">
        <button type="button" data-amount="0">No words</button><button type="button" data-amount="50">DCC 1000 excluded</button><button type="button" data-amount="100">All words</button>
      </div>
      <div class="vocabulary-tools">
        <label>Witness <select class="vocabulary-witness" aria-label="Vocabulary witness"></select></label>
        <input class="vocabulary-search" type="search" aria-label="Find a word or line" placeholder="Find a word or line…">
      </div>
    </div>`;
  const content = getPanelElement(panel, '.extra-content');
  content.before(controls);
  const state = getPanelState(panel);
  state.vocabularyAmount ??= 50;
  state.vocabularyQuery ??= '';
  state.vocabularyMinimized ??= false;
  controls.querySelector('.vocabulary-options').id = `${panel.id}-vocabulary-options`;
  controls.querySelector('.vocabulary-amount').id = `${panel.id}-vocabulary-amount`;
  controls.querySelector('.vocabulary-toggle').setAttribute('aria-controls', `${panel.id}-vocabulary-options ${panel.id}-vocabulary-amount`);
  controls.querySelector('.vocabulary-toggle').onclick = () => {
    state.vocabularyMinimized = !state.vocabularyMinimized;
    syncVocabularyControls(panel);
  };
  controls.querySelector('.vocabulary-export').onclick = () => exportVocabulary(panel);
  const setAmount = value => {
    state.vocabularyAmount = Number(value);
    syncVocabularyControls(panel);
    renderCompanionModel(panel);
  };
  controls.querySelector('.vocabulary-amount').oninput = event => setAmount(event.target.value);
  controls.querySelectorAll('[data-amount]').forEach(button => {
    button.onclick = () => setAmount(button.dataset.amount);
  });
  controls.querySelector('.vocabulary-witness').onchange = event => {
    state.vocabularyWitness = event.target.value;
    updateCompanionPanel(panel);
  };
  controls.querySelector('.vocabulary-search').oninput = event => {
    state.vocabularyQuery = event.target.value;
    renderCompanionModel(panel);
  };
  syncVocabularyControls(panel);
}

function syncVocabularyControls(panel) {
  const controls = getPanelElement(panel, '.vocabulary-controls');
  if (!controls) return;
  const state = getPanelState(panel);
  const amount = state.vocabularyAmount ?? 50;
  const minimized = state.vocabularyMinimized === true;
  controls.dataset.minimized = String(minimized);
  controls.querySelector('.vocabulary-options').hidden = minimized;
  controls.querySelector('.vocabulary-amount').hidden = minimized;
  const toggle = controls.querySelector('.vocabulary-toggle');
  toggle.setAttribute('aria-expanded', String(!minimized));
  toggle.setAttribute('aria-label', `${minimized ? 'Expand' : 'Minimize'} vocabulary settings`);
  toggle.title = `${minimized ? 'Expand' : 'Minimize'} settings`;
  toggle.querySelector('span').textContent = minimized ? '▸' : '▾';
  controls.querySelector('.vocabulary-amount').value = amount;
  controls.querySelector('.vocabulary-search').value = state.vocabularyQuery || '';
  controls.querySelectorAll('[data-amount]').forEach(button => {
    button.setAttribute('aria-pressed', String(Number(button.dataset.amount) === amount));
  });
}

function exportVocabulary(panel) {
  const model = companionModels.get(panel);
  if (!model?.exportText) return;
  const url = URL.createObjectURL(new Blob([model.exportText], { type: 'text/tab-separated-values;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `amores-${model.poem}-${model.witness}-vocabulary.tsv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function defaultVocabularyWitness(poem, records) {
  const textPanels = document.querySelectorAll('section[data-panel-type="transcription"]');
  for (const panel of textPanels) {
    if (getPanelElement(panel, '.poem-select')?.value !== poem) continue;
    const witness = getPanelElement(panel, '.witness-select')?.value;
    if (records.some(record => record.witness === witness)) return witness;
  }
  return records.find(record => record.witness === 'LL')?.witness || records[0]?.witness;
}

// Every request is bound to the current panel body, poem and feature selection.
// A slower response cannot replace a newer selection or a different panel mode.
async function updateCompanionPanel(panel) {
  const content = getPanelElement(panel, '.extra-content');
  const poem = getPanelElement(panel, '.poem-select')?.value;
  if (!content) return;
  setupVocabularyControls(panel);
  const request = {};
  const panelType = getPanelType(panel);
  const hasTranscription = panelType === PANEL_TYPES.READING;
  companionRequests.set(panel, request);
  companionModels.delete(panel);
  const isCurrent = () => companionRequests.get(panel) === request &&
    getPanelElement(panel, '.extra-content') === content && getPanelType(panel) === panelType;
  const extras = Array.from(getPanelElements(panel, '.companion-controls input:checked'))
    .filter(input => !input.disabled).map(input => input.dataset.extra);
  const hasVocabulary = extras.includes('vocab');
  const needsWitness = hasVocabulary || hasTranscription;
  const controls = getPanelElement(panel, '.vocabulary-controls');
  controls.hidden = !needsWitness;
  controls.dataset.vocabulary = String(hasVocabulary);
  content.dataset.poem = poem || '';
  content.classList.toggle('has-vocabulary', hasVocabulary);
  content.classList.toggle('has-transcription', hasTranscription);
  content.removeAttribute('aria-busy');
  if (!poem || (!extras.length && !hasTranscription)) {
    controls.hidden = true;
    content.innerHTML = `<p class="companion-empty">${!poem ? 'Choose a poem to begin.' : 'Select a companion feature to display.'}</p>`;
    return;
  }
  syncVocabularyControls(panel);
  content.setAttribute('aria-busy', 'true');
  content.innerHTML = '<p class="companion-empty" role="status">Loading companion…</p>';
  const state = getPanelState(panel);
  controls.querySelector('.vocabulary-witness').disabled = true;
  controls.querySelector('.vocabulary-count').textContent = '';
  controls.querySelector('.vocabulary-export').disabled = true;
  controls.querySelector('.vocabulary-amount').setAttribute('aria-valuetext', `${state.vocabularyAmount ?? 50}% of available glossary words`);
  try {
    const datasets = await Promise.all(extras.map(async extra => {
      const name = extra.replace(/-(\w)/g, (_, letter) => letter.toUpperCase()).replace(/^\w/, letter => letter.toUpperCase());
      try {
        const path = `data/Companion/${name}/${poem}.json`;
        return extra === 'vocab' ? { extra, ...await fetchVocabularyData(path) } : { extra, data: await fetchCompanionResource(path) };
      }
      catch { return { extra, error: true, data: {} }; }
    }));
    if (!isCurrent()) return;
    const model = { poem, extras, datasets, lines: [], witness: null, sourceError: false, frequency: null, lookup: null, dictionaryError: false, review: null, reviewError: false, reviewPending: false };
    if (needsWitness) {
      try {
        const [corpus, dictionary] = await Promise.all([
          fetchCompanionResource('data/tei-corpus.json'),
          hasVocabulary ? Promise.all([
            fetchVocabularyData('data/latin-frequency.json'),
            fetchVocabularyData('data/vocabulary-forms.json'),
            fetchCompanionResource(`data/vocabulary-review/${poem}.json`).catch(() => null)
          ]).catch(() => null) : null
        ]);
        if (dictionary) {
          model.frequency = dictionary[0].data;
          model.lookup = dictionary[1].data;
          model.review = dictionary[2];
        }
        else if (hasVocabulary) model.dictionaryError = true;
        if (!isCurrent()) return;
        const records = Vocabulary.reviewedWitnesses(corpus, poem);
        if (!records.length) throw new Error('No reviewed transcription available');
        const witness = records.some(record => record.witness === state.vocabularyWitness)
          ? state.vocabularyWitness : defaultVocabularyWitness(poem, records);
        state.vocabularyWitness = witness;
        const select = controls.querySelector('.vocabulary-witness');
        select.replaceChildren(...records.map(record => new Option(record.witness, record.witness)));
        select.value = witness;
        select.disabled = false;
        const record = records.find(item => item.witness === witness);
        const xmlText = await fetchCompanionResource(record.path, 'text');
        if (!isCurrent()) return;
        const xml = new DOMParser().parseFromString(xmlText, 'application/xml');
        if (xml.getElementsByTagName('parsererror').length) throw new Error('Invalid transcription XML');
        model.lines = Vocabulary.extractWitnessLines(xml, poem);
        model.witness = witness;
        model.absentLines = record.absent_lines || [];
        if (dictionary) {
          const inputs = model.review?.inputs;
          model.reviewPending = model.review?.poem === poem && !Object.hasOwn(inputs?.teiByWitnessSha256 || {}, witness);
          model.reviewError = model.review?.poem !== poem ||
            inputs?.teiByWitnessSha256?.[witness] !== await vocabularyHash(xmlText) ||
            inputs?.glossarySha256 !== datasets.find(item => item.extra === 'vocab')?.sha256 ||
            inputs?.frequencySha256 !== dictionary[0].sha256 || inputs?.formsSha256 !== dictionary[1].sha256;
        }
      } catch (error) {
        if (!isCurrent()) return;
        model.sourceError = true;
      }
    }
    if (!isCurrent()) return;
    companionModels.set(panel, model);
    renderCompanionModel(panel);
  } finally {
    if (isCurrent()) content.removeAttribute('aria-busy');
  }
}

function renderVocabularyEntry(entry) {
  if (entry.unparsed) return `<details class="vocabulary-original-note"><summary>Original glossary note</summary><p>${companionEscape(entry.raw)}</p></details>`;
  const source = entry.dictionary ? (entry.reviewedDefinition ? '<abbr class="vocabulary-credit" title="Contextual gloss; dictionary evidence is recorded in the vocabulary review">Gloss</abbr>' : '<abbr class="vocabulary-credit" title="Dickinson College Commentaries">DCC</abbr>') : '';
  const differentForms = (entry.sourceForms || []).filter(form => VocabularyLookup.normalizeForm(form) !== VocabularyLookup.normalizeForm(entry.headword.split(/[ ,]/)[0]));
  const forms = entry.dictionary && !entry.alternatives && differentForms.length ? `<span class="vocabulary-form" lang="la">${companionEscape(differentForms.join(', '))} → </span>` : '';
  const alternatives = entry.alternatives ? `<p class="vocabulary-possibilities">Possible headwords</p>${entry.alternatives.map(item => `<p class="vocabulary-definition"><span lang="la">${companionEscape(item.headword)}</span> — ${companionEscape(item.definition)}</p>`).join('')}` : '';
  return `<div class="vocabulary-entry${entry.dictionary ? ' vocabulary-dictionary-entry' : ''}">${forms}<span class="vocabulary-headword" lang="la">${companionEscape(entry.headword)}</span>${source}
    ${entry.definition ? `<p class="vocabulary-definition">${companionEscape(entry.definition)}</p>` : ''}${alternatives}</div>`;
}

function companionSearchText(value) {
  return String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function renderCompanionModel(panel) {
  const model = companionModels.get(panel);
  const content = getPanelElement(panel, '.extra-content');
  if (!model || !content || ![PANEL_TYPES.COMPANION, PANEL_TYPES.READING].includes(getPanelType(panel))) return;
  const state = getPanelState(panel);
  const amount = state.vocabularyAmount ?? 50;
  const hasVocabulary = model.extras.includes('vocab');
  const hasTranscription = getPanelType(panel) === PANEL_TYPES.READING;
  const needsWitness = hasVocabulary || hasTranscription;
  const query = needsWitness ? companionSearchText(state.vocabularyQuery || '').trim() : '';
  const groups = new Map();
  const groupFor = range => {
    if (!groups.has(range)) groups.set(range, { range, lines: [], entries: [], commentary: [] });
    return groups.get(range);
  };
  if (hasTranscription && !model.sourceError) {
    model.lines.forEach(line => groupFor(String(line.number)).lines.push(line));
  }
  for (const { extra, data, error } of model.datasets) {
    if (error) continue;
    if (extra === 'vocab') {
      if (!model.sourceError && !model.dictionaryError && !model.reviewError) {
        const eligible = VocabularyLookup.enrichGroups(Vocabulary.parseEntries(data), model.lines, model.frequency, model.lookup, model.review, model.witness);
        const selection = Vocabulary.selectEntries(eligible, amount, model.frequency);
        const count = `${selection.shownWords} of ${selection.totalWords} words`;
        getPanelElement(panel, '.vocabulary-count').textContent = `${selection.shownWords} / ${selection.totalWords}`;
        getPanelElement(panel, '.vocabulary-count').setAttribute('aria-label', count);
        getPanelElement(panel, '.vocabulary-count').title = count;
        getPanelElement(panel, '.vocabulary-amount').setAttribute('aria-valuetext', count);
        for (const { lineRange, entries } of selection.groups) {
          const [start, end = start] = lineRange.split(/[-–]/).map(Number);
          const lines = model.lines.filter(line => Number(line.number) >= start && Number(line.number) <= end);
          // Canonical-line glosses are never offered as readings of absent/illegible verses.
          if (lines.some(line => line.readable)) groupFor(lineRange).entries.push(...entries);
        }
      }
    } else {
      Object.entries(data).forEach(([range, text]) => groupFor(range).commentary.push({ extra, text }));
    }
  }
  let html = '';
  let sourceInfo = '';
  if (needsWitness) {
    if (model.sourceError) {
      html += '<p class="companion-empty" role="status">The witness text could not be loaded. <button type="button" class="companion-retry">Try again</button></p>';
    } else {
      sourceInfo += `<div class="vocabulary-source-heading"><span>Amores ${companionEscape(model.poem)} · ${companionEscape(model.witness)}</span>
        <a href="tei.html?poem=${encodeURIComponent(model.poem)}&amp;witness=${encodeURIComponent(model.witness)}" title="Read this witness’s TEI">TEI ↗</a></div>`;
      if (hasVocabulary) {
        sourceInfo += '<details class="vocabulary-about"><summary>About this vocabulary</summary><p>The default excludes the DCC 1000 core vocabulary. More help adds core words from less common to most common, using DCC frequency ranks. Less help reduces noncore glossary words in their order of appearance; DCC gives no frequency ranks for those words. Definitions stay complete. Existing poem glosses take precedence and remain linked by line number, so spellings and readings may differ. Glosses and added dictionary matches are checked against each witness’s verse. Unsupported matches are omitted. The contextual review is bound to the exact transcription and dictionary files; changed sources require a new review. Abbreviations, damaged words and unmatched forms receive no automatic definition. All words means all available glossary and dictionary matches, not every source word.</p><p>Export downloads the entries currently shown as tab-separated text, with duplicate cards removed. In Anki, import the file using Tab as the separator and map the columns to Front and Back. In Quizlet, paste the file contents into Import with tabs between terms and definitions and new lines between cards.</p><p>Vocabulary review: OpenAI Codex; evidence and corrections are recorded in the downloadable review data. Core vocabulary © Dickinson College Commentaries, Christopher Francese and team. Adapted under <a href="https://creativecommons.org/licenses/by-sa/3.0/" target="_blank" rel="noopener noreferrer">CC BY-SA 3.0</a>. <a href="https://dcc.dickinson.edu/latin-core-list1" target="_blank" rel="noopener noreferrer">DCC list</a> · <a href="https://dcc.dickinson.edu/vocab/core-vocabulary" target="_blank" rel="noopener noreferrer">Frequency method</a> · <a href="https://github.com/latincy/latincy-lexicon" target="_blank" rel="noopener noreferrer">Morphology</a>. Corrected glosses also consult <a href="https://github.com/PerseusDL/lexica" target="_blank" rel="noopener noreferrer">Lewis and Short, Perseus Digital Library</a> (<a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener noreferrer">CC BY-SA 4.0</a>).</p>';
        if (model.review && !model.reviewError) sourceInfo += `<p class="vocabulary-review-link"><a href="data/vocabulary-review/${encodeURIComponent(model.poem)}.json" download>Vocabulary review ↗</a></p>`;
        sourceInfo += '</details>';
      }
      if (!model.lines.length) html += '<p class="companion-empty">This poem is not transmitted in this witness. Choose another witness above.</p>';
      else if (model.absentLines.length) html += '<p class="vocabulary-coverage">This witness transmits only part of the poem. Missing lines have no vocabulary entries.</p>';
    }
  }
  if (hasVocabulary && model.reviewPending) html += `<p class="companion-empty" role="status">Vocabulary review pending for witness ${companionEscape(model.witness)}. Choose another witness for vocabulary help.</p>`;
  else if (hasVocabulary && model.reviewError) html += '<p class="companion-empty" role="status">Vocabulary for this text needs a current review before it can be shown. <button type="button" class="companion-retry">Try again</button></p>';
  if (hasVocabulary && model.dictionaryError) html += '<p class="companion-empty" role="status">Vocabulary frequency data could not be loaded. <button type="button" class="companion-retry">Try again</button></p>';
  for (const dataset of model.datasets.filter(item => item.error)) {
    html += `<p class="companion-empty" role="status">${dataset.extra === 'vocab' ? 'The glossary' : 'Commentary'} could not be loaded. <button type="button" class="companion-retry">Try again</button></p>`;
  }
  let shown = 0;
  const visibleEntries = [];
  for (const group of Array.from(groups.values()).sort((a, b) => parseInt(a.range, 10) - parseInt(b.range, 10))) {
    if (!hasTranscription && !group.entries.length && !group.commentary.length) continue;
    const searchable = [group.range, ...group.lines.map(line => line.text), ...group.entries.map(entry => entry.raw), ...group.commentary.map(item => item.text)].join(' ');
    if (query && !companionSearchText(searchable).includes(query)) continue;
    shown++;
    visibleEntries.push(...group.entries);
    html += `<div class="companion-line-group" data-line-range="${companionEscape(group.range)}" data-poem="${companionEscape(model.poem)}">
      <div class="companion-line-heading"><button type="button" class="companion-line-link" aria-label="Go to line ${companionEscape(group.range)} in the transcription">${companionEscape(group.range)}</button>
      ${group.lines.map(line => `<p class="vocabulary-source-line" lang="la">${companionEscape(line.text)}</p>`).join('')}</div>`;
    if (group.entries.length) html += `<div class="vocabulary-entries">${group.entries.map(entry => renderVocabularyEntry(entry)).join('')}</div>`;
    for (const { extra, text } of group.commentary) {
      html += `<div class="companion-item ${extra} ${extra}-color">${text.replace(/\n/g, '<br>')}</div>`;
    }
    html += '</div>';
  }
  if (!shown && query) html += '<p class="companion-empty" role="status">No matching lines or entries. Try another word or clear the search.</p>';
  else if (!shown && hasVocabulary && !hasTranscription && amount === 0 && model.lines.length && !model.reviewError && !model.dictionaryError) html += '<p class="companion-empty" role="status">Vocabulary help is off.</p>';
  else if (!shown && !needsWitness && !model.datasets.some(item => item.error)) html += '<p class="companion-empty">No commentary available for this poem.</p>';
  if (sourceInfo) html += `<footer class="vocabulary-footer">${sourceInfo}</footer>`;
  const exported = Vocabulary.toFlashcardTsv(visibleEntries);
  model.exportText = exported.text;
  const exportButton = getPanelElement(panel, '.vocabulary-export');
  exportButton.disabled = exported.count === 0;
  exportButton.title = exported.count ? `Download ${exported.count} displayed entries for Anki or Quizlet (tab-separated text)` : 'No vocabulary entries to export';
  content.innerHTML = html;
  content.querySelectorAll('.companion-retry').forEach(button => {
    button.onclick = () => {
      companionFetches.clear();
      updateCompanionPanel(panel);
    };
  });
  setupHighlightListeners(panel);
}
