import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import { extname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const annotationPath = new URL('../docs/data/annotations.json', import.meta.url);
const indexPath = new URL('../docs/index.html', import.meta.url);
const scriptPath = new URL('../docs/js/script.js', import.meta.url);

async function findJsonFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nestedFiles = await Promise.all(entries.map(entry => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? findJsonFiles(path) : [path];
  }));
  return nestedFiles.flat().filter(path => extname(path) === '.json');
}

test('new annotations are appended without changing the scholar dataset', async () => {
  const annotations = JSON.parse((await readFile(annotationPath, 'utf8')).replace(/^\uFEFF/, ''));
  const scholarDatasetChecksum = createHash('sha256')
    .update(JSON.stringify(annotations.slice(0, 2657)))
    .digest('hex');

  assert.equal(scholarDatasetChecksum, 'a1c8359185a86703333f3ed497500fdb523c61a8840973e0dac47b77dbacc147');
});

test('annotations retain their complete schema and known logical coverage', async () => {
  const annotations = JSON.parse((await readFile(annotationPath, 'utf8')).replace(/^\uFEFF/, ''));
  assert.equal(annotations.length, 2659);

  const logicalKeys = new Set();
  const witnesses = new Set();
  const poems = new Set();

  for (const annotation of annotations) {
    assert.equal(typeof annotation.panelId, 'string');
    assert.equal(typeof annotation.witness, 'string');
    assert.equal(typeof annotation.lineId, 'string');
    assert.equal(typeof annotation.poem, 'string');
    assert.ok(Number.isInteger(annotation.page) && annotation.page > 0);
    assert.ok(Number.isFinite(annotation.x) && annotation.x >= 0);
    assert.ok(Number.isFinite(annotation.y) && annotation.y >= 0);
    assert.ok(Number.isFinite(annotation.width) && annotation.width > 0);
    assert.ok(Number.isFinite(annotation.height) && annotation.height > 0);

    logicalKeys.add(`${annotation.witness}|${annotation.poem}|${annotation.lineId}`);
    witnesses.add(annotation.witness);
    poems.add(annotation.poem);
  }

  assert.equal(logicalKeys.size, 2159);
  assert.deepEqual([...witnesses].sort(), ['P', 'S', 'Y']);
  assert.equal(poems.size, 15);
});

test('every fixed panel menu offers both viewer modes', async () => {
  const html = await readFile(indexPath, 'utf8');
  const lineViewerOptions = html.match(/<option value="line-viewer">Line-by-line Viewer<\/option>/g) || [];
  const standardViewerOptions = html.match(/<option value="viewer"(?: selected)?>Single Manuscript Viewer<\/option>/g) || [];

  assert.equal(lineViewerOptions.length, 3);
  assert.equal(standardViewerOptions.length, 3);
});

test('dynamic panels distinguish the standard and line-by-line viewer types', async () => {
  const source = await readFile(scriptPath, 'utf8');

  assert.match(source, /LINE_VIEWER:\s*'line-viewer'/);
  assert.match(source, /function createViewerPanelBody\(\)/);
  assert.match(source, /function createLineViewerPanelBody\(\)/);
  assert.match(source, /data-panel-type="\$\{PANEL_TYPES\.LINE_VIEWER\}"/);
});

test('annotation authoring controls are collapsed so they do not shrink the viewers', async () => {
  const source = await readFile(scriptPath, 'utf8');
  const styles = await readFile(new URL('../docs/css/styles.css', import.meta.url), 'utf8');

  assert.match(source, /<details class="annotation-tools">/);
  assert.match(source, /<summary aria-label="Annotation tools">Tools<\/summary>/);
  assert.match(styles, /\.annotation-controls\s*{[^}]*position:\s*absolute;/s);
});

test('compact line viewers omit OpenSeadragon overlay controls', async () => {
  const source = await readFile(scriptPath, 'utf8');
  const standardViewerInitializer = source.match(
    /function initializeOpenSeadragon\(\)\s*{([\s\S]*?)osdViewers\.set\(panelId, osdViewer\);/
  );
  const lineViewerInitializer = source.match(
    /function initializeOpenSeadragonForWitness\(\)\s*{([\s\S]*?)osdViewers\.set\(viewerId, osdViewer\);/
  );

  assert.ok(standardViewerInitializer, 'standard viewer initializer should exist');
  assert.ok(lineViewerInitializer, 'line-viewer initializer should exist');
  assert.doesNotMatch(standardViewerInitializer[1], /showNavigationControl:\s*false/);
  assert.match(lineViewerInitializer[1], /showNavigationControl:\s*false/);
  assert.match(lineViewerInitializer[1], /showSequenceControl:\s*false/);
});

test('line-viewer comparison omits page controls and uses overlay witness badges', async () => {
  const source = await readFile(scriptPath, 'utf8');
  const template = source.match(/function createLineViewerPanelBody\(\)\s*{([\s\S]*?)function createCompanionPanelBody/);

  assert.ok(template, 'line-viewer template should exist');
  assert.doesNotMatch(template[1], /class="page-controls"/);
  assert.match(template[1], /class="viewer-label" title="Manuscript P">P<\/span>/);
  assert.match(template[1], /class="viewer-label" title="Manuscript Y">Y<\/span>/);
  assert.match(template[1], /class="viewer-label" title="Manuscript S">S<\/span>/);
});

test('line clicks synchronize the comparison poem and survive asynchronous manifest loads', async () => {
  const source = await readFile(scriptPath, 'utf8');

  assert.match(source, /const lineViewerLoadTokens = new Map\(\)/);
  assert.match(source, /poemSelect\.value = poem;\s*poemSelect\.dispatchEvent\(new Event\('change'\)\)/);
  assert.match(source, /annotationState\.selectedPoem === poem && annotationState\.selectedLineId/);
  assert.match(source, /lineViewerLoadTokens\.get\(viewerId\) !== loadToken/);
});

test('the focused manuscript line receives a labeled spotlight', async () => {
  const source = await readFile(scriptPath, 'utf8');
  const styles = await readFile(new URL('../docs/css/styles.css', import.meta.url), 'utf8');

  assert.match(source, /function showFocusedAnnotation\(panel, witness, annotation\)/);
  assert.match(source, /label\.textContent = `Line \$\{annotation\.lineId\}`/);
  assert.match(source, /overlay\.appendChild\(label\)/);
  assert.match(source, /showFocusedAnnotation\(panel, witness, annotation\)/);
  assert.match(styles, /\.annotation-rect\.current-annotation\s*{[^}]*box-shadow:/s);
  assert.match(styles, /\.annotation-focus-label\s*{[^}]*position:\s*absolute;[^}]*right:\s*7px;/s);
  assert.match(styles, /\.annotation-rect\.current-annotation\s*{[^}]*background:\s*transparent;/s);
});

test('the focused line overlay follows OpenSeadragon viewport changes', async () => {
  const source = await readFile(scriptPath, 'utf8');

  assert.match(source, /function positionFocusedAnnotation\(panel, witness\)/);
  assert.match(source, /requestAnimationFrame\(\(\) =>/);
  assert.match(source, /addHandler\('animation', scheduleFocusedAnnotationPosition\)/);
  assert.match(source, /addHandler\('canvas-drag', scheduleFocusedAnnotationPosition\)/);
  assert.match(source, /addHandler\('canvas-scroll', scheduleFocusedAnnotationPosition\)/);
  assert.match(source, /addHandler\('resize', scheduleFocusedAnnotationPosition\)/);
});

test('single manuscript viewers reuse the click-to-focus annotation overlay', async () => {
  const html = await readFile(indexPath, 'utf8');
  const source = await readFile(scriptPath, 'utf8');
  const styles = await readFile(new URL('../docs/css/styles.css', import.meta.url), 'utf8');

  assert.match(html, /class="annotation-overlay single-viewer-annotation-overlay hidden-rects"/);
  assert.match(source, /function getAnnotationViewer\(panel, witness\)/);
  assert.match(source, /function getAnnotationOverlay\(panel, witness\)/);
  assert.match(source, /section\[data-panel-type="\$\{PANEL_TYPES\.VIEWER\}"\]/);
  assert.match(source, /viewerEl\.dataset\.witness = witness/);
  assert.match(styles, /\.single-viewer-wrapper\s*{[^}]*position:\s*relative;/s);
  assert.match(styles, /\.single-viewer-wrapper #viewer,\s*\.single-viewer-wrapper \.viewer\s*{[^}]*height:\s*100%;/s);
});

test('the first poem choice fills all panels only when the others are empty', async () => {
  const source = await readFile(scriptPath, 'utf8');

  assert.match(source, /function syncEmptyPoemSelectors\(sourceSelect, poem\)/);
  assert.match(source, /otherSelectors\.every\(select => !select\.value\)/);
  assert.match(source, /select\.dispatchEvent\(new Event\('change'\)\)/);
  assert.match(source, /if \(!poem \|\| synchronizingInitialPoem\) return/);
});

test('companion uses the manuscript commentary label without changing its data key', async () => {
  const html = await readFile(indexPath, 'utf8');
  const source = await readFile(scriptPath, 'utf8');

  assert.doesNotMatch(html, /> Text Commentary<\/label>/);
  assert.doesNotMatch(source, /> Text Commentary<\/label>/);
  assert.match(html, /data-extra="text-commentary"> Manuscript Commentary/);
  assert.match(source, /data-extra="text-commentary"> Manuscript Commentary/);
});

test('missing transcriptions offer actionable witness fallbacks', async () => {
  const source = await readFile(scriptPath, 'utf8');

  assert.match(source, /function getAvailableTranscriptionWitnesses\(poem\)/);
  assert.match(source, /Continue with the Latin Library \(LL\) text or another available witness:/);
  assert.match(source, /button\.className = 'transcription-fallback'/);
  assert.match(source, /witnessSelect\.dispatchEvent\(new Event\('change'\)\)/);
});

test('shared page behavior does not require home-page dependencies', async () => {
  const source = await readFile(scriptPath, 'utf8');

  assert.match(source, /typeof CETEI === 'function' \? new CETEI\(\) : null/);
  assert.match(source, /if \(document\.getElementById\('panels'\)\)/);
});

test('narrow layouts stack full-width panels', async () => {
  const styles = await readFile(new URL('../docs/css/styles.css', import.meta.url), 'utf8');

  assert.match(styles, /@media \(max-width: 900px\)[\s\S]*#panels\s*{[^}]*flex-direction:\s*column;/);
  assert.match(styles, /#panels section\s*{[^}]*width:\s*100% !important;/s);
  assert.match(styles, /#panels > \.gutter\s*{[^}]*display:\s*none;/s);
});

test('content pages have distinct titles and current workspace instructions', async () => {
  const about = await readFile(new URL('../docs/about.html', import.meta.url), 'utf8');
  const editions = await readFile(new URL('../docs/editions.html', import.meta.url), 'utf8');

  assert.match(about, /<title>Amores — About<\/title>/);
  assert.match(editions, /<title>Amores — Editions<\/title>/);
  assert.match(about, /<strong>Line-by-line Viewer<\/strong>/);
  assert.match(about, /panels stack vertically/);
  assert.match(about, /<h3>Using Line Annotations<\/h3>/);
});

test('complete GitHub commentary is retained in the reconciled dataset', async () => {
  const expectedCounts = new Map([
    ['Commentary/3.8.json', 61],
    ['Commentary/3.10.json', 19],
    ['Commentary/3.13.json', 31],
    ['TextCommentary/3.7.json', 57]
  ]);

  for (const [relativePath, count] of expectedCounts) {
    const source = await readFile(new URL(`../docs/data/Companion/${relativePath}`, import.meta.url), 'utf8');
    assert.equal(Object.keys(JSON.parse(source)).length, count, relativePath);
  }
});

test('essay layout converts the supplied draft into readable article paragraphs', async () => {
  const html = await readFile(new URL('../docs/essays.html', import.meta.url), 'utf8');
  const styles = await readFile(new URL('../docs/css/styles.css', import.meta.url), 'utf8');

  assert.match(html, /paragraphMarkup = firstEssayDraft\.innerHTML\.trim\(\)\.split/);
  assert.match(html, /document\.createElement\(index === 12 \? 'blockquote' : 'p'\)/);
  assert.match(styles, /\.essays-content\s*{[^}]*max-width:\s*76ch;/s);
  assert.match(styles, /\.essay-section > p\s*{[^}]*margin:\s*0 0 1\.25em;/s);
  assert.doesNotMatch(html, /<h3>Summary<\/h3>/);
});

test('unused witness T payload is not published', async () => {
  await assert.rejects(
    readFile(new URL('../docs/data/iiif-manifests/witness-T.json', import.meta.url)),
    error => error.code === 'ENOENT'
  );
});

test('all checked-in JSON files parse', async () => {
  const jsonFiles = await findJsonFiles(fileURLToPath(new URL('../docs/data/', import.meta.url)));
  for (const path of jsonFiles) {
    const source = (await readFile(path, 'utf8')).replace(/^\uFEFF/, '');
    assert.doesNotThrow(() => JSON.parse(source), path);
  }
});
