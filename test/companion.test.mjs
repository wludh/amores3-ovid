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
  const textLine = line(text, '1');
  const matchingLine = line(same, '1');
  const readingLine = line(reading, '1');
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
});
