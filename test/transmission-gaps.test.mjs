import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

const source = await readFile(new URL('../docs/js/transcription.js', import.meta.url), 'utf8');
const context = vm.createContext({ Node: { DOCUMENT_POSITION_FOLLOWING: 4 } });
vm.runInContext(source, context);

// Minimal document nodes model source order separately from canonical verse numbers.
function node(position, attributes) {
  return {
    position,
    getAttribute: name => attributes[name] ?? null,
    compareDocumentPosition: other => other.position > position ? 4 : 2
  };
}

test('an opening lacuna precedes the first surviving verse', () => {
  const gap = node(0, { quantity: '2' });
  const verses = [node(1, { n: '3' }), node(2, { n: '50' })];
  assert.equal(context.transmissionGapLabel(gap, verses), 'Lines 1–2 are not transmitted in this witness.');
});

test('interior and terminal lacunae follow their adjacent source verses', () => {
  const verses = [node(0, { n: '4' }), node(2, { n: '7' }), node(3, { n: '8' })];
  assert.equal(context.transmissionGapLabel(node(1, { quantity: '2' }), verses), 'Lines 5–6 are not transmitted in this witness.');
  assert.equal(context.transmissionGapLabel(node(4, { quantity: '12' }), verses), 'Lines 9–20 are not transmitted in this witness.');
});

test('explicit canonical ranges and wholly absent poems retain their descriptions', () => {
  assert.equal(context.transmissionGapLabel(node(1, { n: '10–12', quantity: '3' }), [node(0, { n: '8' })]), 'Lines 10–12 are not transmitted in this witness.');
  assert.equal(context.transmissionGapLabel(node(0, { quantity: '36' }), []), 'This poem is not transmitted in this witness.');
});
