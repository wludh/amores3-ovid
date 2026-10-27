import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import Vocabulary from '../docs/js/vocabulary.js';
import Lookup from '../docs/js/vocabulary-lookup.js';

const frequency = JSON.parse(await readFile(new URL('../docs/data/latin-frequency.json', import.meta.url), 'utf8'));
const dcc = lemma => frequency.entries.find(entry => entry.lemma === lemma);
const segment = (text, ...kinds) => ({ text, kinds });
const line = (number, segments, readable = true) => ({ number: String(number), segments, readable });

test('lookup normalizes dictionary keys while preserving actual source forms', () => {
  assert.equal(Lookup.normalizeForm('IŪVENIS Œs Æs ſ'), 'iuuenis oes aes s');
  assert.deepEqual(Lookup.sourceForms(line(1, [segment('Mūltōs per annos, Iūvenis.')])), ['Mūltōs', 'per', 'annos', 'Iūvenis']);
});

test('automatic help skips entire words touching damaged, cancelled or abbreviated text', () => {
  const source = line(1, [
    segment('an'), segment('nos', 'unclear'), segment(' per '),
    segment('multos', 'deleted'), segment(' mihi '),
    segment('u', 'abbreviation'), segment('&', 'glyph'), segment('us '),
    segment('mul'), segment('[…]', 'gap'), segment('tos '),
    segment('sunt', 'uncertain'), segment(' annos')
  ]);
  assert.deepEqual(Lookup.sourceForms(source), ['per', 'mihi', 'annos']);
});

test('existing poem glosses take precedence and repeated dictionary words are grouped', () => {
  const per = dcc('per');
  const annus = dcc('annus');
  const lookup = { forms: { per: { dccId: per.id }, annos: { dccId: annus.id }, anni: { dccId: annus.id } } };
  const groups = Vocabulary.parseEntries({ 1: 'per: the original complete line-specific gloss' });
  const lines = [line(1, [segment('per annos anni per')]), line(2, [segment('annos')])];
  const original = JSON.stringify({ groups, lines });
  const enriched = Lookup.enrichGroups(groups, lines, frequency, lookup);
  assert.equal(enriched[0].entries[0].definition, 'the original complete line-specific gloss');
  assert.equal(enriched[0].entries.filter(entry => entry.dccId === per.id).length, 1);
  assert.deepEqual(enriched[0].entries[1].sourceForms, ['annos', 'anni']);
  assert.equal(enriched[0].entries[1].definition, annus.definition);
  const defaults = Vocabulary.selectEntries(enriched, 50, frequency);
  assert.equal(defaults.shownWords, 0, 'every word in this fixture belongs to DCC');
  const full = Vocabulary.selectEntries(enriched, 100, frequency);
  assert.equal(full.shownWords, 2, 'the same lemma is counted once across source forms/lines');
  assert.equal(full.groups.flatMap(group => group.entries).length, 3);
  assert.equal(JSON.stringify({ groups, lines }), original, 'source and glossary stay immutable');
});

test('homographs retain all viable DCC alternatives and never select a rare sense alone', () => {
  const sum = dcc('sum');
  const edo = dcc('edo');
  const lookup = { forms: {}, ambiguousForms: { est: { dccIds: [sum.id, edo.id], allCandidatesCore: true } } };
  const groups = Lookup.enrichGroups([], [line(1, [segment('est')])], frequency, lookup);
  assert.equal(groups[0].entries[0].headword, 'est');
  assert.deepEqual(groups[0].entries[0].alternatives.map(entry => entry.definition), [sum.definition, edo.definition]);
  assert.equal(Vocabulary.frequencyForEntry(groups[0].entries[0], frequency).rank, Math.min(sum.rank, edo.rank));
  assert.equal(Vocabulary.selectEntries(groups, 50, frequency).shownWords, 0);
  assert.equal(Vocabulary.selectEntries(groups, 100, frequency).groups[0].entries[0].alternatives.length, 2);
  lookup.ambiguousForms.est.allCandidatesCore = false;
  assert.deepEqual(Lookup.enrichGroups([], [line(1, [segment('est')])], frequency, lookup), []);
});

test('source absence and wholly unreadable lines cannot acquire dictionary definitions', () => {
  const groups = Vocabulary.parseEntries({ 1: 'annus: year', 2: 'annus: year' });
  const lookup = { forms: { annos: { dccId: dcc('annus').id } } };
  assert.deepEqual(Lookup.enrichGroups(groups, [], frequency, lookup), []);
  assert.deepEqual(Lookup.enrichGroups(groups, [line(1, [segment('[…]', 'gap')], false)], frequency, lookup), []);
});

test('an inflected existing headword joins its DCC lemma without changing its definition', () => {
  const eo = frequency.entries.find(entry => entry.lemma === 'eo' && entry.partOfSpeech.includes('Verb'));
  const groups = Vocabulary.parseEntries({ 1: 'iēns, euntis: going, moving' });
  const merged = Lookup.enrichGroups(groups, [line(1, [segment('iens')])], frequency, { forms: { iens: { dccId: eo.id } } });
  assert.equal(merged[0].entries.length, 1);
  assert.equal(merged[0].entries[0].definition, 'going, moving');
  assert.equal(merged[0].entries[0].dccId, eo.id);
  assert.equal(Vocabulary.selectEntries(merged, 50, frequency).shownWords, 0);
});

test('contextual review resolves homographs per witness and omits unreviewed matches', () => {
  const sum = dcc('sum');
  const edo = dcc('edo');
  const per = dcc('per');
  const lookup = { forms: { per: { dccId: per.id } }, ambiguousForms: { est: { dccIds: [sum.id, edo.id], allCandidatesCore: true } } };
  const lines = [line(1, [segment('est per')])];
  const review = { entries: [{ id: 'dictionary:1:est', kind: 'source-form', line: '1', form: 'est', witnesses: ['LL'], action: 'confirm', dccId: sum.id }] };
  const output = Lookup.enrichGroups([], lines, frequency, lookup, review, 'LL');
  assert.equal(output[0].entries.length, 1, 'unreviewed per is not added');
  assert.equal(output[0].entries[0].definition, sum.definition);
  assert.equal(output[0].entries[0].alternatives, undefined);
  assert.deepEqual(Lookup.enrichGroups([], lines, frequency, lookup, review, 'P'), [], 'another witness never inherits this decision');
  review.entries.push({ ...review.entries[0] });
  assert.deepEqual(Lookup.enrichGroups([], lines, frequency, lookup, { entries: review.entries }, 'LL'), [], 'duplicate decisions fail closed');
});

test('review corrections preserve original files and can identify a noncore homograph', () => {
  const a = dcc('a');
  const groups = Vocabulary.parseEntries({ 1: 'a: from, by' });
  const review = { entries: [{ id: 'legacy:1:0', kind: 'legacy-entry', line: '1', raw: 'a: from, by', witnesses: ['LL'], action: 'replace', dccId: null, headword: 'ā (interjection)', definition: 'ah!, alas!' }] };
  const output = Lookup.enrichGroups(groups, [line(1, [segment('a quotiens')])], frequency, { forms: { a: { dccId: a.id } } }, review, 'LL');
  assert.equal(output[0].entries[0].definition, 'ah!, alas!');
  assert.equal(Vocabulary.frequencyForEntry(output[0].entries[0], frequency), null, 'the preposition rank must not hide the interjection');
  assert.equal(groups[0].entries[0].definition, 'from, by', 'the archived glossary stays intact');
  const editedGroups = Vocabulary.parseEntries({ 1: 'a: changed source definition' });
  assert.deepEqual(Lookup.enrichGroups(editedGroups, [line(1, [segment('a')])], frequency, {}, review, 'LL'), [], 'a review cannot silently apply to edited source data');
});
