import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

const source = await readFile(new URL('../docs/js/script.js', import.meta.url), 'utf8');
const helpers = source.slice(source.indexOf('let witnessYBackupActive'), source.indexOf('// Load manifest for a specific panel'));

function setup(stored = false, storageUnavailable = false) {
  const elements = [];
  const storage = new Map(stored ? [['amores-y-image-backup-v1', 'true']] : []);
  const context = vm.createContext({
    sessionStorage: {
      getItem(key) { if (storageUnavailable) throw Error('disabled'); return storage.get(key); },
      setItem(key, value) { if (storageUnavailable) throw Error('disabled'); storage.set(key, value); }
    },
    document: { createElement() {
      const element = {
        children: [], handlers: {}, setAttribute() {}, remove() { this.removed = true; },
        append(...children) { this.children.push(...children); },
        addEventListener(name, handler) { this.handlers[name] = handler; }
      };
      elements.push(element);
      return element;
    } }
  });
  vm.runInContext(helpers, context);
  const backup = context.witnessBackupSources([{}, {}], 'Y');
  function addViewer() {
    let image = {}, page = 1;
    const bounds = { x: 0.2, y: 0.3, width: 0.4, height: 0.5 };
    const handlers = {}, once = {}, calls = [], fits = [];
    const viewer = {
      world: { getItemAt: () => image },
      viewport: { getBounds: () => bounds, fitBounds: (...args) => fits.push(args) },
      currentPage: () => page,
      addHandler(name, callback) { handlers[name] = callback; },
      addOnceHandler(name, callback) { once[name] = callback; },
      open(...args) { calls.push(args); image = {}; }
    };
    const elementOffset = elements.length;
    context.attachWitnessImageRecovery(viewer, { appendChild() {} }, 'Y', backup);
    return { viewer, handlers, once, calls, fits, bounds,
      elements: elements.slice(elementOffset),
      fail: () => handlers['tile-load-failed']({ tiledImage: image }),
      changePage: () => { page = 0; handlers.page(); }
    };
  }
  return { context, storage, backup, addViewer };
}

test('both viewer modes use bounded Berlin requests and a ten-second timeout', () => {
  const { context } = setup();
  const options = context.witnessImageOptions('Y');
  assert.equal(options.imageLoaderLimit, 2);
  assert.equal(options.tileRetryMax, 0);
  assert.equal(options.timeout, 10000);
  assert.equal(Object.keys(context.witnessImageOptions('P')).length, 0);
  assert.equal(source.match(/\.\.\.witnessImageOptions\(witness\)/g).length, 2);
  assert.equal(source.match(/attachWitnessImageRecovery\(osdViewer, viewerEl, witness, backupSources\)/g).length, 2);
  assert.equal(source.match(/tileSources: witness === 'Y' && witnessYBackupActive \? backupSources : tileSources/g).length, 2);
});

test('a remote failure switches all Y viewers once, preserving page and viewport', () => {
  const { storage, backup, addViewer } = setup();
  const a = addViewer(), b = addViewer();
  assert.equal(a.calls.length, 0, 'healthy visits do not fetch backups');
  a.fail();
  for (const viewer of [a, b]) {
    assert.deepEqual(viewer.calls, [[backup, 1]]);
    viewer.once.open();
    assert.deepEqual(viewer.fits, [[viewer.bounds, true]]);
    assert.equal(viewer.elements[0].hidden, true);
  }
  assert.equal(storage.get('amores-y-image-backup-v1'), 'true');
  a.handlers['tile-load-failed']({ tiledImage: {} });
  assert.equal(a.calls.length, 1, 'late remote failures do not reopen the backup');
  assert.equal(a.elements[0].hidden, true);
});

test('source-open failure activates backup and destroyed viewers are released', () => {
  const { addViewer } = setup();
  const a = addViewer(), b = addViewer();
  a.handlers['before-destroy']();
  b.handlers['open-failed']();
  assert.equal(a.calls.length, 0);
  assert.equal(a.elements[0].removed, true);
  assert.equal(b.calls.length, 1);
});

test('stored backup choice is honored and failed backup offers a same-page retry', () => {
  const { backup, addViewer } = setup(true);
  const a = addViewer();
  a.fail();
  assert.equal(a.calls.length, 0, 'do not loop between failed sources');
  assert.equal(a.elements[0].hidden, false);
  a.elements[2].handlers.click();
  assert.deepEqual(a.calls, [[backup, 1]]);
  assert.equal(a.elements[0].hidden, true);
});

test('page changes during failover do not restore an obsolete viewport', () => {
  const { addViewer } = setup();
  const a = addViewer();
  a.fail();
  a.changePage();
  a.once.open();
  assert.equal(a.fits.length, 0);
});

test('blocked session storage does not prevent fallback; mapping preserves all pages', () => {
  const { context, addViewer } = setup(false, true);
  addViewer().fail();
  const sources = context.witnessBackupSources(Array(151).fill({}), 'Y');
  assert.equal(sources.length, 151);
  assert.equal(sources[128].url, 'data/facsimiles/Y/0129.jpg');
  assert.equal(sources[150].url, 'data/facsimiles/Y/0151.jpg');
  assert.equal(context.witnessBackupSources([{}], 'P'), null);
});
