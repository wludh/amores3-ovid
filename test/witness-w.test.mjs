import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

const root = new URL('../', import.meta.url);
const read = path => readFile(new URL(path, root), 'utf8');
const json = async path => JSON.parse((await read(path)).replace(/^\uFEFF/, ''));
const sha = text => createHash('sha256').update(text).digest('hex');

test('W covers all 870 canonical verses with source-reviewed image regions', async () => {
  const all = await json('docs/data/annotations.json');
  const annotations = all.filter(a => a.witness === 'W');
  const manifest = await json('docs/data/iiif-manifests/witness-W.json');
  const source = await json('scripts/sources/witness-W-ocr.json');
  const ledger = await json('scripts/output/W-image-review.json');
  const canonical = [...(await read('docs/data/witness-LL.xml')).matchAll(/<poem n="([^"]+)"[\s\S]*?<\/poem>/g)]
    .flatMap(poem => [...poem[0].matchAll(/<l n="([^"]+)"/g)].map(line => `${poem[1]}|${line[1]}`));
  assert.equal(annotations.length, 870);
  assert.deepEqual(annotations.map(a => `${a.poem}|${a.lineId}`).sort(), canonical.sort());
  const reviewed = [];
  for (const review of ledger.reviews) {
    assert.notEqual(review.reviewer, ledger.first_reader);
    for (const field of ['report', 'fragment']) assert.equal(sha(await read(review[field])), review[`${field}_sha256`]);
    reviewed.push(...(await json(review.fragment)).map(row => row.annotation));
  }
  assert.deepEqual(annotations, reviewed);
  assert.equal(sha(JSON.stringify(annotations)), ledger.annotations_sha256);
  for (const item of ledger.sources) assert.equal(sha(await read(item.path)), item.sha256, item.path);
  for (const a of annotations) {
    const c = manifest.sequences[0].canvases[a.page - 1];
    const p = source.pages.find(page => page.page === a.page - 1);
    assert.ok(p, `${a.poem}.${a.lineId}: verified source page`);
    assert.equal(c.images[0].resource['@id'], p.image);
    assert.ok(a.x >= 0 && a.y >= 0 && a.width > 0 && a.height > 0);
    assert.ok(a.x + a.width <= c.width && a.y + a.height <= c.height);
  }
  // Preserve every pre-existing P/Y/S/O rectangle, including their order.
  assert.equal(sha(JSON.stringify(all.filter(a => a.witness !== 'W'))),
    '2cac9d2e9f3762e2af99b8df43d185e446c1b89cf9954fb738a3c0e2a95b220d');
  assert.equal((await json('docs/data/tei-corpus.json')).annotations_sha256,
    sha(await read('docs/data/annotations.json')));
});

test('W scan positions match the supplied node index and actual poem starts', async () => {
  const manifest = await json('docs/data/iiif-manifests/witness-W.json');
  const nodes = await json('scripts/sources/witness-W-node-index.json');
  assert.equal(manifest.sequences[0].canvases.length, 296);
  assert.equal(nodes.pages.length, 296);
  for (const page of nodes.pages) {
    const c = manifest.sequences[0].canvases[page.manifest_index];
    assert.equal(page.viewer_page, page.manifest_index + 1);
    assert.equal(page.archive_label, c.label);
    assert.equal(page.identifier, c.metadata.find(item => item.label === 'Identifier').value);
    assert.ok(c.images[0].resource.service['@id'].includes(`${page.node_id}-Service%2520File.jpg`));
  }
  const context = vm.createContext({});
  vm.runInContext(`${await read('docs/js/data.js')}\nthis.pages = witnessPageData.W; this.files = witnessFiles;`, context);
  const annotations = (await json('docs/data/annotations.json')).filter(a => a.witness === 'W');
  for (let n = 1; n <= 15; n++) {
    assert.equal(context.pages[n - 1] + 1, annotations.find(a => a.poem === `3.${n}` && a.lineId === '1').page);
  }
  assert.equal(context.pages[0], 171);
  assert.equal(nodes.pages[171].node_id, 72555);
  // W must never fall back to another witness's text or an unreviewed draft.
  assert.equal(context.files.W, null);
});

test('both W viewers use the archive image-service capabilities with unchanged encoded IDs', async () => {
  const script = await read('docs/js/script.js');
  assert.match(script, /FACSIMILE_WITNESSES = \['P', 'Y', 'S', 'O', 'W'\]/);
  assert.equal((script.match(/witness === 'W' \|\| service.type === 'ImageService3'/g) || []).length, 2);
  assert.match(script, /return `\$\{imageService\}\/info\.json`/);
  assert.match(script, /<option value="W">W<\/option>/);
  assert.match(script, /data-witness="W" title="W — Wetstein 1751/);
  assert.match(await read('docs/index.html'), /data-witness="W" title="W — Wetstein 1751/);
  const manifest = await json('docs/data/iiif-manifests/witness-W.json');
  const service = manifest.sequences[0].canvases[171].images[0].resource.service['@id'];
  assert.equal(decodeURIComponent(service.split('/iiif/2/')[1]),
    'https://digitalarchive.wlu.edu/_flysystem/fedora/2026-10/72555-Service%20File.jpg');
});

test('browsing source pages after a line selection does not snap back to its page', async () => {
  const script = await read('docs/js/script.js');
  const handler = script.slice(script.indexOf('let initialImageOpen = true;'),
    script.indexOf('\n  }\n}\n\n// Load a witness manifest', script.indexOf('let initialImageOpen = true;')));
  let currentPage = 171;
  const handlers = {};
  const focused = [];
  let cleared = 0;
  const annotation = { page: 173 };
  const context = vm.createContext({
    panel: {}, witness: 'W', poem: '3.1',
    annotationState: { selectedPoem: '3.1', selectedLineId: '31' },
    osdViewer: { currentPage: () => currentPage, tileSources: [], addHandler: (event, callback) => { handlers[event] = callback; } },
    updateSingleViewerPageButtons: () => {}, updateSingleViewerUI: () => {},
    getAnnotationOverlay: () => ({}), clearCurrentAnnotationMarkers: () => { cleared++; },
    refreshAnnotationOverlayVisibility: () => {},
    getAnnotationForViewer: () => annotation,
    zoomViewerToAnnotation: () => focused.push(currentPage)
  });
  vm.runInContext(handler, context);
  const open = handlers.open;
  open(); // Initial load follows the selected verse, even on another page.
  currentPage = 172;
  open(); // The target image has loaded; focus the verse.
  currentPage = 173;
  handlers.page({ page: currentPage });
  open(); // Manual next-page navigation must remain on this page.
  currentPage = 171;
  open(); // Manual previous-page navigation must also remain.
  currentPage = 172;
  open(); // Clicking the verse again can focus it normally.
  assert.deepEqual(focused, [171, 172, 172]);
  assert.equal(cleared, 1, 'Remove the previous page highlight before showing the new source image');
});
