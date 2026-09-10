import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

const root = new URL('../', import.meta.url);
const json = async path => JSON.parse((await readFile(new URL(path, root), 'utf8')).replace(/^\uFEFF/, ''));

test('O covers every canonical verse with a region on its actual scan page', async () => {
  const all = await json('docs/data/annotations.json');
  const annotations = all.filter(a => a.witness === 'O');
  const manifest = await json('docs/data/iiif-manifests/witness-O.json');
  const source = await json('scripts/sources/witness-O-ocr.json');
  const xml = await readFile(new URL('docs/data/witness-LL.xml', root), 'utf8');
  const canonical = [...xml.matchAll(/<poem n="([^"]+)"[\s\S]*?<\/poem>/g)]
    .flatMap(match => [...match[0].matchAll(/<l n="([^"]+)"/g)].map(line => `${match[1]}|${line[1]}`));
  assert.equal(annotations.length, 870);
  assert.deepEqual(annotations.map(a => `${a.poem}|${a.lineId}`).sort(), canonical.sort());
  for (const a of annotations) {
    const canvasIndex = a.page - 1;
    const canvas = manifest.items[canvasIndex];
    const page = source.pages.find(p => p.page === canvasIndex);
    assert.ok(page, `${a.poem}.${a.lineId}: source page exists`);
    const image = canvas.items[0].items[0].body;
    assert.ok(image.id.includes(`_${String(page.leaf).padStart(4, '0')}.jp2`));
    assert.equal(canvas.width, page.width);
    assert.equal(canvas.height, page.height);
    assert.ok(a.x >= 0 && a.y >= 0 && a.x + a.width <= canvas.width && a.y + a.height <= canvas.height);
    const rows = page.lines.filter(row =>
      Math.abs(row.x - a.x) <= 8 && Math.abs(row.y - a.y) <= 7 &&
      a.width >= row.width && a.width - row.width <= 16 &&
      a.height >= row.height && a.height - row.height <= 14);
    assert.equal(rows.length, 1, `${a.poem}.${a.lineId}: rectangle matches one actual OCR row on the displayed page`);
  }
  const find = (poem, line) => annotations.find(a => a.poem === poem && a.lineId === line);
  assert.equal(find('3.1', '1').page, 93); // scan leaf97, printed p45
  assert.equal(find('3.15', '20').page, 117); // scan leaf121, printed p69
  assert.ok(find('3.1', '47').y < find('3.1', '43').y); // printed transposition
});

test('cached zero-based O exports are repaired without discarding local edits', async () => {
  const source = await readFile(new URL('docs/js/script.js', root), 'utf8');
  const functions = source.slice(source.indexOf('function buildAnnotationKey('), source.indexOf('async function loadAnnotationsFromFallbackFile('));
  const context = vm.createContext({});
  vm.runInContext(functions, context);
  const published = {witness: 'O', poem: '3.1', lineId: '1', page: 93, x: 1, y: 2, width: 3, height: 4};
  const stale = {...published, page: 92};
  assert.equal(context.mergeAnnotationLists([published], [stale])[0].page, 93);
  const edited = {...stale, x: 20};
  assert.equal(context.mergeAnnotationLists([published], [edited])[0].x, 20);
  const manuscript = {...stale, witness: 'P'};
  assert.equal(context.mergeAnnotationLists([{...published, witness:'P'}], [manuscript])[0].page, 92);
});

test('line navigation waits for the target image before positioning its rectangle', async () => {
  const source = await readFile(new URL('docs/js/script.js', root), 'utf8');
  const fn = source.slice(source.indexOf('function zoomViewerToAnnotation('), source.indexOf('function zoomAllViewersToLine('));
  let currentPage = 0;
  const calls = [];
  const viewer = {
    currentPage: () => currentPage,
    goToPage: page => calls.push(['navigate', page]),
    viewport: {fitBounds: rectangle => calls.push(['fit', rectangle])}
  };
  const context = vm.createContext({
    getAnnotationViewer: () => viewer,
    getViewerViewportRectFromImageRect: (_viewer, rectangle) => rectangle,
    showFocusedAnnotation: () => calls.push(['highlight'])
  });
  vm.runInContext(fn, context);
  const annotation = {page: 94, x: 100, y: 150, width: 1000, height: 50};
  context.zoomViewerToAnnotation({}, 'O', annotation);
  assert.deepEqual(calls, [['navigate', 93]]);
  // This is the call made by each viewer's open handler after loading page 94.
  currentPage = 93;
  context.zoomViewerToAnnotation({}, 'O', annotation);
  assert.deepEqual(calls.slice(1), [['fit', annotation], ['highlight']]);
});

test('an unlocated verse opens the whole source page without a fabricated highlight', async () => {
  const source = await readFile(new URL('docs/js/script.js', root), 'utf8');
  const fn = source.slice(source.indexOf('function zoomViewerToAnnotation('), source.indexOf('function zoomAllViewersToLine('));
  let currentPage = 0;
  const calls = [];
  const viewer = { currentPage: () => currentPage, goToPage: page => calls.push(['navigate', page]), viewport: { goHome: () => calls.push(['whole-page']), fitBounds: () => assert.fail('No rectangle may be fitted') } };
  const overlay = { appendChild: el => calls.push(['label', el.textContent]), classList: { add: () => {} } };
  const context = vm.createContext({ getAnnotationViewer: () => viewer, getAnnotationOverlay: () => overlay, clearCurrentAnnotationMarkers: () => calls.push(['clear-highlight']), document: { createElement: () => ({}) }, showFocusedAnnotation: () => assert.fail('No rectangle may be highlighted') });
  vm.runInContext(fn, context);
  const target = { page: 97, lineId: '23', unlocated: true };
  context.zoomViewerToAnnotation({}, 'P', target);
  assert.deepEqual(calls, [['clear-highlight'], ['navigate', 96]]);
  currentPage = 96;
  context.zoomViewerToAnnotation({}, 'P', target);
  assert.deepEqual(calls.slice(2), [['clear-highlight'], ['whole-page'], ['label', 'Verse location unverified']]);
});
