import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import test from 'node:test';

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
