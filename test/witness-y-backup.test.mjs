import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

const root = new URL('../docs/data/facsimiles/Y/', import.meta.url);
function jpegSize(data) {
  assert.equal(data.readUInt16BE(0), 0xffd8, 'JPEG start marker');
  let offset = 2;
  while (offset < data.length) {
    assert.equal(data[offset++], 0xff);
    while (data[offset] === 0xff) offset++;
    const marker = data[offset++];
    if ([0xc0, 0xc1, 0xc2].includes(marker)) {
      return { height: data.readUInt16BE(offset + 3), width: data.readUInt16BE(offset + 5) };
    }
    offset += data.readUInt16BE(offset);
  }
  throw new Error('JPEG dimensions missing');
}

test('every Y canvas has an intact full-resolution backup with source provenance', async () => {
  const manifest = JSON.parse(await readFile(new URL('../docs/data/iiif-manifests/witness-Y.json', import.meta.url)));
  const index = JSON.parse(await readFile(new URL('index.json', root)));
  const canvases = manifest.sequences[0].canvases;
  assert.equal(index.images.length, canvases.length);
  assert.equal(index.sourceManifest, manifest['@id']);
  assert.equal(index.rights, 'https://creativecommons.org/publicdomain/mark/1.0/');
  assert.equal(index.shelfmark, 'Ms. Ham. 471');
  const files = (await readdir(root)).filter(file => file.endsWith('.jpg')).sort();
  assert.deepEqual(files, index.images.map(record => record.file));
  for (const [i, canvas] of canvases.entries()) {
    const record = index.images[i];
    assert.equal(record.page, i + 1);
    assert.equal(record.file, `${String(i + 1).padStart(4, '0')}.jpg`);
    assert.equal(record.source, canvas.images[0].resource['@id']);
    const data = await readFile(new URL(record.file, root));
    assert.equal(data.length, record.bytes);
    assert.equal(createHash('sha256').update(data).digest('hex'), record.sha256);
    assert.deepEqual(jpegSize(data), { width: canvas.width, height: canvas.height });
    assert.equal(data.readUInt16BE(data.length - 2), 0xffd9, 'JPEG end marker');
  }
});

test('P Book III copies preserve source dimensions, page identity and annotation coordinates', async () => {
  const pRoot = new URL('../docs/data/facsimiles/P/', import.meta.url);
  const index = JSON.parse(await readFile(new URL('index.json', pRoot)));
  const manifest = JSON.parse(await readFile(new URL('../docs/data/iiif-manifests/witness-P.json', import.meta.url)));
  const canvases = manifest.sequences[0].canvases;
  const source = await readFile(new URL('../docs/js/script.js', import.meta.url), 'utf8');
  const context = vm.createContext({});
  vm.runInContext(source.slice(source.indexOf('function cachedWitnessImageSource'), source.indexOf('// Keep Berlin as the primary source')), context);
  assert.equal(index.sourceManifest, manifest['@id']);
  assert.equal(index.shelfmark, 'BnF Latin 8242');
  assert.deepEqual(index.images.map(image => image.page), Array.from({ length: 18 }, (_, i) => i + 84));
  for (const record of index.images) {
    const canvas = canvases[record.page - 1];
    const data = await readFile(new URL(record.file, pRoot));
    assert.equal(record.source, canvas.images[0].resource['@id']);
    assert.match(record.filePage, /commons\.wikimedia\.org\/wiki\/File:/);
    assert.match(record.archivalCopy, /upload\.wikimedia\.org\/wikipedia\/commons\//);
    assert.equal(data.length, record.bytes);
    assert.equal(createHash('sha256').update(data).digest('hex'), record.sha256);
    assert.deepEqual(jpegSize(data), { width: canvas.width, height: canvas.height });
    assert.equal(data.readUInt16BE(data.length - 2), 0xffd9);
    assert.equal(context.cachedWitnessImageSource(canvas, 'P').url, `data/facsimiles/P/${record.file}`);
  }
  assert.equal(context.cachedWitnessImageSource(canvases[82], 'P'), null, 'pages outside the saved range retain Gallica');
  assert.equal(context.cachedWitnessImageSource(canvases[83], 'Y'), null, 'other witnesses retain their source handling');
  assert.equal(context.cachedWitnessImageSource({ '@id': 'https://example.com/canvas/f84' }, 'P'), null, 'page number alone cannot select an archival copy');
  assert.equal(source.match(/const cachedSource = cachedWitnessImageSource\(canvas, witness\)/g).length, 2, 'single and parallel viewers both use the copies');
});
