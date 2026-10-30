import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import test from 'node:test';

const source = await readFile(new URL('../docs/js/script.js', import.meta.url), 'utf8');

test('a companion mode round trip restores its feature selection before loading', () => {
  const state = {
    poem: '3.2', companionExtras: ['vocab'], vocabularyAmount: 25,
    vocabularyWitness: 'Y', vocabularyQuery: 'mūsa'
  };
  const panel = {};
  const controls = [
    { dataset: { extra: 'commentary' }, checked: true, disabled: false },
    { dataset: { extra: 'text-commentary' }, checked: false, disabled: true },
    { dataset: { extra: 'vocab' }, checked: false, disabled: false }
  ];
  const loads = [];
  let context;
  const poemSelect = {
    value: '',
    // A real change handler saves the newly created template's checkboxes.
    // Dispatching before restoration would overwrite vocabulary-only state.
    dispatchEvent() { context.savePanelState(panel); }
  };
  context = vm.createContext({
    Event: class {},
    PANEL_TYPES: { COMPANION: 'companion' },
    getPanelState: () => state,
    getPanelType: () => 'companion',
    getPanelElement: (_panel, selector) => selector === '.poem-select' ? poemSelect : null,
    getPanelElements: (_panel, selector) => selector.endsWith(':checked') ? controls.filter(control => control.checked) : controls,
    updateCompanionPanel: () => loads.push(controls.filter(control => control.checked).map(control => control.dataset.extra))
  });
  vm.runInContext(source.slice(source.indexOf('function savePanelState('), source.indexOf('// Panel type templates')), context);
  context.restorePanelState(panel);
  assert.equal(poemSelect.value, '3.2');
  assert.deepEqual(controls.map(control => control.checked), [false, false, true]);
  assert.deepEqual(state.companionExtras, ['vocab']);
  assert.equal(state.vocabularyAmount, 25);
  assert.equal(state.vocabularyWitness, 'Y');
  assert.equal(state.vocabularyQuery, 'mūsa');
  assert.deepEqual(loads, [['vocab']]);
});

test('reading and companion remember separate extras, including text only, while sharing vocabulary preferences', () => {
  const panel = { id: 'reader' };
  let type = 'companion';
  const controls = [
    { dataset: { extra: 'commentary' }, checked: true, disabled: false },
    { dataset: { extra: 'text-commentary' }, checked: false, disabled: true },
    { dataset: { extra: 'vocab' }, checked: false, disabled: false }
  ];
  const poemSelect = { value: '3.2' };
  const loads = [];
  const context = vm.createContext({
    panelStates: new Map(),
    DEFAULT_LINE_WITNESSES: ['P', 'Y', 'S'],
    PANEL_TYPES: { COMPANION: 'companion', READING: 'reading' },
    getPanelType: () => type,
    getPanelElement: (_panel, selector) => selector === '.poem-select' ? poemSelect : null,
    getPanelElements: (_panel, selector) => selector.endsWith(':checked') ? controls.filter(control => control.checked) : controls,
    updateCompanionPanel: () => loads.push({ type, extras: controls.filter(control => control.checked).map(control => control.dataset.extra) })
  });
  vm.runInContext(source.slice(source.indexOf('function getPanelState('), source.indexOf('// Panel type templates')), context);
  const state = context.getPanelState(panel);
  state.vocabularyAmount = 75;
  state.vocabularyWitness = 'Y';
  state.vocabularyQuery = 'mūsa';
  function switchTo(nextType) {
    context.savePanelState(panel);
    type = nextType;
    context.restorePanelState(panel);
  }
  switchTo('reading');
  assert.deepEqual(controls.map(control => control.checked), [true, false, true]);
  controls.forEach(control => { control.checked = false; });
  switchTo('companion');
  assert.deepEqual(controls.map(control => control.checked), [true, false, false]);
  controls[0].checked = false;
  controls[2].checked = true;
  switchTo('reading');
  assert.deepEqual(controls.map(control => control.checked), [false, false, false]);
  switchTo('companion');
  assert.deepEqual(controls.map(control => control.checked), [false, false, true]);
  assert.deepEqual(Array.from(state.readingExtras), []);
  assert.deepEqual(Array.from(state.companionExtras), ['vocab']);
  assert.equal(state.poem, '3.2');
  assert.equal(state.vocabularyAmount, 75);
  assert.equal(state.vocabularyWitness, 'Y');
  assert.equal(state.vocabularyQuery, 'mūsa');
  assert.deepEqual(loads, [
    { type: 'reading', extras: ['commentary', 'vocab'] },
    { type: 'companion', extras: ['commentary'] },
    { type: 'reading', extras: [] },
    { type: 'companion', extras: ['vocab'] }
  ]);
});

test('linked reading stays within a poem and repeated rendering binds one navigation handler', () => {
  function container(kind, poem) {
    return {
      kind, poem, dataset: { poem }, listeners: new Map(),
      classList: { contains: () => false },
      addEventListener(type, handler) {
        if (!this.listeners.has(type)) this.listeners.set(type, new Set());
        this.listeners.get(type).add(handler);
      },
      removeEventListener(type, handler) { this.listeners.get(type)?.delete(handler); }
    };
  }
  const text = container('text', '3.1');
  const same = container('companion', '3.1');
  const reading = container('reading', '3.1');
  const other = container('companion', '3.2');
  let scrolls = 0;
  function line(owner, number) {
    const classes = new Set();
    return {
      owner,
      dataset: owner.kind === 'text' ? { line: number } : { lineRange: number },
      classList: { add: name => classes.add(name), remove: name => classes.delete(name), contains: name => classes.has(name) },
      matches: selector => selector === '[data-line]' && owner.kind === 'text',
      closest(selector) {
        if (selector === '.extra-content') return owner.kind === 'text' ? null : owner;
        if (selector === 'section') return owner;
        if (selector === '[data-line], [data-line-range]') return this;
        return null;
      },
      scrollIntoView() { scrolls += 1; }
    };
  }
  const textLine = line(text, '2');
  const matchingLine = line(same, '1–3');
  const readingLine = line(reading, '2');
  const differentPoemLine = line(other, '1');
  const lines = [textLine, matchingLine, readingLine, differentPoemLine];
  const context = vm.createContext({
    getPanelElement: owner => ({ value: owner.poem }),
    document: {
      querySelectorAll(selector) {
        if (selector.startsWith('section[')) {
          assert.ok(selector.includes('section[data-panel-type="reading"] .extra-content'));
          return [text, same, reading, other];
        }
        if (selector === '.extra-content [data-line-range]') return [matchingLine, readingLine, differentPoemLine];
        if (selector === '.text-content [data-line]') return [textLine];
        return lines.filter(item => item.classList.contains('highlight'));
      }
    }
  });
  vm.runInContext(source.slice(source.indexOf('const companionHighlightHandlers'), source.indexOf('// Attach event handlers for a panel')), context);
  context.scrollLinkedVerseIntoView = () => { scrolls += 1; };
  context.setupHighlightListeners(same);
  context.setupHighlightListeners(same);
  context.setupHighlightListeners(same);
  for (const handler of text.listeners.get('mouseover')) handler({ target: textLine });
  assert.equal(matchingLine.classList.contains('highlight'), true);
  assert.equal(readingLine.classList.contains('highlight'), true);
  assert.equal(differentPoemLine.classList.contains('highlight'), false);
  for (const handler of same.listeners.get('click')) handler({ target: matchingLine });
  assert.equal(scrolls, 1);
  for (const handler of other.listeners.get('click')) handler({ target: differentPoemLine });
  assert.equal(scrolls, 1);
  for (const handler of reading.listeners.get('click')) handler({ target: readingLine });
  assert.equal(scrolls, 2);
  for (const handler of text.listeners.get('click')) handler({ target: textLine });
  assert.equal(scrolls, 4, 'scroll each matching companion and reading panel once');
});

const companionSource = await readFile(new URL('../docs/js/companion.js', import.meta.url), 'utf8');

function renderFixture({ type = 'reading', query = '', extras = ['vocab', 'commentary'], lines, commentary, amount = 50 } = {}) {
  const panel = {};
  const content = { innerHTML: '', querySelectorAll: () => [] };
  const control = { setAttribute() {} };
  const entry = (headword, definition) => ({ headword, definition, raw: `${headword}: ${definition}` });
  const glossary = [
    { lineRange: '1', entries: [entry('silva', 'a wood')] },
    { lineRange: '2', entries: [entry('numen', 'divine power')] },
    { lineRange: '3', entries: [entry('fons', 'a spring')] }
  ];
  const model = {
    poem: '3.1', witness: 'Y', extras, absentLines: [],
    lines: lines || [
      { number: '1', text: 'Stat vetus silva', readable: true },
      { number: '2', text: '  numen inesse loco', readable: true },
      { number: '3', text: 'fons sacer', readable: true },
      { number: '4', text: 'dulce queruntur aves', readable: true }
    ],
    datasets: extras.map(extra => ({ extra, data: extra === 'vocab' ? glossary : commentary || { 1: 'First note', 2: 'Second note' } }))
  };
  const exported = [];
  const context = vm.createContext({
    fixturePanel: panel, fixtureModel: model,
    PANEL_TYPES: { COMPANION: 'companion', READING: 'reading' },
    getPanelType: () => type,
    getPanelState: () => ({ vocabularyAmount: amount, vocabularyQuery: query }),
    getPanelElement: (_panel, selector) => selector === '.extra-content' ? content : control,
    setupHighlightListeners() {},
    VocabularyLookup: { enrichGroups: groups => groups },
    Vocabulary: {
      parseEntries: data => data,
      selectEntries: groups => ({ groups: amount ? groups : [], shownWords: 3, totalWords: 3 }),
      toFlashcardTsv(entries) { exported.push(...entries); return { text: entries.map(entry => entry.raw).join('\n'), count: entries.length }; }
    }
  });
  vm.runInContext(companionSource + '\ncompanionModels.set(fixturePanel, fixtureModel); renderCompanionModel(fixturePanel);', context);
  return { html: content.innerHTML, exported, context };
}

test('Text & notes pairs canonical verses and places every note before the couplet vocabulary', () => {
  const { html } = renderFixture();
  assert.equal((html.match(/class="companion-line-group companion-couplet"/g) || []).length, 2);
  assert.match(html, /data-line-range="1–2"/);
  assert.match(html, /data-line-range="3–4"/);
  assert.ok(html.indexOf('First note') < html.indexOf('Second note'));
  assert.ok(html.indexOf('Second note') < html.indexOf('class="vocabulary-entries"'));
  for (const number of ['1', '2', '3', '4']) {
    assert.match(html, new RegExp(`class="companion-line-link companion-source-line" data-line="${number}" data-witness="Y"`));
  }
  assert.match(html, /lang="la">  numen inesse loco<\/span>/, 'preserve source whitespace');
  assert.doesNotMatch(html, /aria-label="Highlight line/, 'visible Latin must remain the accessible button name');
});

test('Companion keeps individual line groups but puts notes before vocabulary', () => {
  const { html } = renderFixture({ type: 'companion' });
  assert.doesNotMatch(html, /companion-couplet|companion-source-line/);
  assert.match(html, /data-line-range="1"/);
  assert.ok(html.indexOf('First note') < html.indexOf('class="vocabulary-entries"'));
});

test('couplets retain absent partners, odd endings, and cross-couplet note attribution without copies', () => {
  const { html } = renderFixture({
    extras: ['commentary'],
    lines: [{ number: '2', text: 'surviving second verse', readable: true }, { number: '5', text: 'last verse', readable: true }],
    commentary: { '1-5': 'A range note' }
  });
  assert.match(html, /data-line-range="1–2"/);
  assert.match(html, /data-line-range="5–6"/);
  assert.doesNotMatch(html, /data-line="[1346]"/);
  assert.match(html, /companion-note-range">1-5<\/span>A range note/);
  assert.equal((html.match(/A range note/g) || []).length, 1);
});

test('search retains the complete matching couplet and exports only its displayed vocabulary', () => {
  const { html, exported } = renderFixture({ query: 'numen' });
  assert.match(html, /data-line="1"/);
  assert.match(html, /data-line="2"/);
  assert.doesNotMatch(html, /data-line="3"/);
  assert.deepEqual(exported.map(entry => entry.headword), ['silva', 'numen']);
});

test('text-only and vocabulary-off reading remain paired and individually actionable', () => {
  for (const options of [{ extras: [] }, { amount: 0 }]) {
    const { html, exported } = renderFixture(options);
    assert.equal((html.match(/class="companion-line-group companion-couplet"/g) || []).length, 2);
    assert.equal((html.match(/class="companion-line-link companion-source-line"/g) || []).length, 4);
    assert.equal(exported.length, 0);
    assert.doesNotMatch(html, /class="vocabulary-entries"/);
  }
});

test('repeated reading renders navigate each exact verse through existing viewer selection, never the pair', () => {
  const selected = [], zoomed = [], scrolled = [];
  const panel = { classList: { contains: () => false } };
  const reading = { dataset: { poem: '3.1' }, listeners: new Map(),
    addEventListener: (type, fn) => reading.listeners.set(type, fn),
    removeEventListener: type => reading.listeners.delete(type) };
  const textLine = {
    dataset: { line: '2' }, classList: { add() {} },
    closest: selector => selector === 'section' ? panel : null
  };
  const verse = number => ({
    dataset: { line: number, witness: 'Y' },
    classList: { contains: name => ['companion-line-link', 'companion-source-line'].includes(name) },
    closest(selector) {
      if (selector === '.extra-content') return reading;
      if (selector === 'section') return panel;
      return this;
    }
  });
  const context = vm.createContext({
    document: { querySelectorAll(selector) {
      if (selector.startsWith('section[')) return [reading];
      if (selector === '.text-content [data-line]') return [textLine];
      return [];
    } },
    getPanelElement: () => ({ value: '3.1' }),
    setSelectedAnnotationLine: (...args) => selected.push(args),
    zoomAllViewersToLine: (...args) => zoomed.push(args)
  });
  vm.runInContext(source.slice(source.indexOf('const companionHighlightHandlers'), source.indexOf('// Attach event handlers for a panel')), context);
  context.scrollLinkedVerseIntoView = element => scrolled.push(element);
  for (let i = 0; i < 3; i++) context.setupHighlightListeners(panel);
  reading.listeners.get('mouseover')({ target: verse('2') });
  assert.equal(selected.length, 0, 'hover must not move image viewers');
  for (const number of ['1', '2', '2']) reading.listeners.get('click')({ target: verse(number) });
  assert.deepEqual(selected, [['1', 'Y', '3.1'], ['2', 'Y', '3.1'], ['2', 'Y', '3.1']]);
  assert.deepEqual(zoomed, [['1', '3.1'], ['2', '3.1'], ['2', '3.1']]);
  assert.equal(scrolled.length, 2, 'exact reading verse still links to the matching transcription');
  reading.dataset.poem = '3.2';
  const newVerse = verse('4'); newVerse.dataset.witness = 'S';
  reading.listeners.get('click')({ target: newVerse });
  assert.deepEqual(selected.at(-1), ['4', 'S', '3.2'], 'delegated handler uses the current poem and witness');
});
