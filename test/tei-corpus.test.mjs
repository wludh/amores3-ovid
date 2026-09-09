import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

const root = new URL('../', import.meta.url);
const code = await readFile(new URL('docs/js/data.js', root), 'utf8');
const corpus = JSON.parse(await readFile(new URL('docs/data/tei-corpus.json', root), 'utf8'));

function runtime(index) {
  const calls = [];
  const context = vm.createContext({ fetch: async url => {
    calls.push(url);
    return { ok: true, json: async () => structuredClone(index) };
  }});
  vm.runInContext(code, context);
  return { context, calls };
}

test('only reviewed corpus candidates replace legacy witness files', async () => {
  const index = { records: [
    { witness: 'Y', poem: '3.1', status: 'reviewed', path: 'data/tei/Y/3.1.xml' },
    { witness: 'Y', poem: '3.2', status: 'in-review', path: 'unreviewed.xml' }
  ] };
  const { context, calls } = runtime(index);
  assert.equal(await vm.runInContext("resolveWitnessFile('Y', '3.1')", context), 'data/tei/Y/3.1.xml');
  assert.equal(await vm.runInContext("resolveWitnessFile('Y', '3.2')", context), 'data/witness-Y.xml');
  assert.equal(await vm.runInContext("resolveWitnessFile('P', '3.3')", context), 'data/witness-P.xml');
  assert.equal(calls.length, 1);
});

test('reviewed navigation repairs the original rectangle without changing scholar edits', async () => {
  const { context } = runtime(corpus);
  const record = corpus.records.find(r => r.witness === 'Y' && r.poem === '3.1');
  const correction = record.navigation_overrides.find(c => c.lineId === '67');
  await vm.runInContext('loadTeiCorpus()', context);
  const original = { witness: 'Y', poem: '3.1', lineId: '67', ...correction.original };
  context.annotation = original;
  const repaired = vm.runInContext("applyReviewedNavigation(annotation, 'Y', '3.1', '67')", context);
  assert.deepEqual(JSON.parse(JSON.stringify(repaired)), { ...original, ...correction.corrected });
  assert.equal(original.y, correction.original.y, 'published annotation stays intact');
  context.annotation = { ...original, y: original.y + 5 };
  assert.equal(vm.runInContext("applyReviewedNavigation(annotation, 'Y', '3.1', '67')", context), context.annotation);
  context.annotation = original;
  assert.equal(vm.runInContext("applyReviewedNavigation(annotation, 'Y', '3.2', '67')", context), original);
});
