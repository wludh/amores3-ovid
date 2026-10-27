import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const read = path => readFile(new URL(path, root), 'utf8');
const json = async path => JSON.parse(await read(path));
const sha = text => createHash('sha256').update(text).digest('hex');

test('all fifteen W transcriptions are complete and bound to independent source reviews', async () => {
  const corpus = await json('docs/data/tei-corpus.json');
  assert.equal(corpus.records.length, 90);
  const expected = [70, 84, 48, 48, 46, 106, 84, 66, 68, 48, 52, 44, 36, 50, 20];
  let total = 0;
  for (let n = 1; n <= 15; n++) {
    const poem = `3.${n}`;
    const records = corpus.records.filter(r => r.witness === 'W' && r.poem === poem);
    assert.equal(records.length, 1);
    const record = records[0];
    assert.equal(record.status, 'reviewed', poem);
    assert.equal(record.path, `data/tei/W/${poem}.xml`);
    assert.equal(record.canonical_line_count, expected[n - 1]);
    const xml = await read(`docs/${record.path}`);
    const candidate = await read(`scripts/output/W-${poem}.xml`);
    const ledger = await json(record.review_path);
    assert.equal(xml, candidate, 'Published source must be the reviewed candidate');
    assert.equal(sha(xml), ledger.reviewed_candidate_sha256);
    assert.equal(sha(await read(record.report_path)), ledger.review_report_sha256);
    assert.notEqual(ledger.author_agent, ledger.reviewer_agent);
    assert.equal(ledger.line_coverage.count, expected[n - 1]);
    const verses = [...xml.matchAll(/<l\b[^>]*\bn="(\d+)"[^>]*>/g)];
    assert.deepEqual(verses.map(match => Number(match[1])).sort((a, b) => a - b),
      Array.from({ length: expected[n - 1] }, (_, i) => i + 1));
    for (const verse of verses) {
      assert.ok(verse[0].includes(`xml:id="W-${poem}-l${verse[1]}"`));
      assert.ok(verse[0].includes(`facs="#W-${poem}-zone-${verse[1]}"`));
    }
    assert.match(xml, /digitalarchive\.wlu\.edu/);
    assert.doesNotMatch(xml, /gallica\.bnf\.fr|iiif\.archive\.org/);
    total += verses.length;
  }
  assert.equal(total, 870);
});

test('W is selectable in fixed and dynamic transcription panels with TEI access', async () => {
  const html = await read('docs/index.html');
  const script = await read('docs/js/script.js');
  assert.match(html.match(/<select id="witness-select"[\s\S]*?<\/select>/)[0], /<option value="W">W<\/option>/);
  const template = script.slice(script.indexOf('function createTranscriptionPanelBody('), script.indexOf('function createViewerPanelBody('));
  assert.match(template, /<option value="W">W<\/option>/);
  assert.match(script, /Object\.hasOwn\(witnessFiles, witness\)/);
  assert.match(await read('docs/js/tei-source.js'), /if \(!path\) throw new Error/);
});
