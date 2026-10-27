import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import Vocabulary from '../docs/js/vocabulary.js';
import Lookup from '../docs/js/vocabulary-lookup.js';

const root = new URL('../', import.meta.url);
const read = path => readFile(new URL(path, root), 'utf8');
const hash = value => createHash('sha256').update(value).digest('hex');
const corpus = JSON.parse(await read('docs/data/tei-corpus.json'));
const frequencyText = await read('docs/data/latin-frequency.json');
const formsText = await read('docs/data/vocabulary-forms.json');
const frequency = JSON.parse(frequencyText);
const forms = JSON.parse(formsText);
const enrollment = JSON.parse(await read(forms.source.enrollmentManifest));
const dictionaryIds = new Set(frequency.entries.map(entry => entry.id));

// Parse the actual TEI once, preserving mixed content, without a test dependency.
const parse = spawnSync('python3', ['-c', `
import json, sys, xml.etree.ElementTree as ET
def node(el):
    children = [el.text] if el.text else []
    for child in el:
        children.append(node(child))
        if child.tail: children.append(child.tail)
    return {'tag':el.tag, 'attrs':dict(el.attrib), 'children':children}
print(json.dumps({path:node(ET.parse(path).getroot()) for path in json.load(sys.stdin)}))
`], { cwd: root, input: JSON.stringify(corpus.records.map(record => `docs/${record.path}`)), encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
assert.equal(parse.status, 0, parse.stderr);
const xmlNodes = JSON.parse(parse.stdout);
function dom(value) {
  if (typeof value === 'string') return { nodeType: 3, nodeValue: value };
  const [, namespaceURI, localName] = value.tag.match(/^\{([^}]+)\}(.+)$/) || [null, '', value.tag];
  return { nodeType: 1, namespaceURI, localName, childNodes: value.children.map(dom),
    getAttribute: name => value.attrs[name === 'xml:id' ? '{http://www.w3.org/XML/1998/namespace}id' : name] ?? null };
}

for (let number = 1; number <= 15; number++) {
  const poem = `3.${number}`;
  test(`${poem}: every displayed vocabulary candidate has a current, witness-specific contextual review`, async () => {
    const review = JSON.parse(await read(`docs/data/vocabulary-review/${poem}.json`));
    assert.equal(review.version, 1);
    assert.equal(review.poem, poem);
    assert.ok(review.reviewer && review.reviewedAt);
    const glossaryText = await read(`docs/data/Companion/Vocab/${poem}.json`);
    const glossary = Vocabulary.parseEntries(JSON.parse(glossaryText));
    assert.equal(review.inputs.glossarySha256, hash(glossaryText), 'glossary changed after review');
    assert.equal(review.inputs.frequencySha256, hash(frequencyText), 'frequency data changed after review');
    assert.equal(review.inputs.formsSha256, hash(formsText), 'morphology data changed after review');
    for (const record of enrollment.records.filter(record => record.poem === poem)) {
      const witness = record.witness;
      assert.equal(review.inputs.teiByWitnessSha256[witness], hash(await read(`docs/${record.path}`)), `${witness}: transcription changed after vocabulary review`);
      const lines = Vocabulary.extractWitnessLines({ documentElement: dom(xmlNodes[`docs/${record.path}`]) }, poem);
      const candidates = Lookup.enrichGroups(glossary, lines, frequency, forms);
      const expected = new Map();
      for (const group of candidates) for (const entry of group.entries) {
        if (entry.dictionary) {
          for (const surface of entry.sourceForms) {
            const form = Lookup.normalizeForm(surface);
            expected.set(`dictionary:${group.lineRange}:${form}`, { line: group.lineRange, form, kind: 'source-form' });
          }
        } else {
          const index = glossary.find(item => item.lineRange === group.lineRange).entries.findIndex(item => item.raw === entry.raw);
          expected.set(`legacy:${group.lineRange}:${index}`, { line: group.lineRange, raw: entry.raw, kind: 'legacy-entry' });
        }
      }
      const decisions = review.entries.filter(entry => entry.witnesses.includes(witness));
      const byId = new Map(decisions.map(entry => [entry.id, entry]));
      assert.equal(byId.size, decisions.length, `${witness}: duplicate dispositions`);
      assert.deepEqual([...byId.keys()].sort(), [...expected.keys()].sort(), `${witness}: incomplete or stale contextual review`);
      const coverage = review.coverage.byWitness[witness];
      assert.deepEqual(coverage.extantLines.map(String).sort(), lines.map(line => line.number).sort(), `${witness}: line coverage`);
      assert.deepEqual([...coverage.reviewedEntryIds].sort(), [...expected.keys()].sort(), `${witness}: candidate coverage`);
      for (const [id, candidate] of expected) {
        const decision = byId.get(id);
        assert.equal(String(decision.line), candidate.line, id);
        assert.equal(decision.kind, candidate.kind, id);
        assert.equal(decision.raw, candidate.raw, id);
        assert.equal(decision.form, candidate.form, id);
        assert.ok(['confirm', 'replace', 'suppress'].includes(decision.action), id);
        assert.ok(decision.reason?.trim(), `${id}: missing reasoning`);
        if (decision.dccId) assert.ok(dictionaryIds.has(decision.dccId), `${id}: unknown DCC identity`);
        const quote = decision.sourceEvidence?.quotesByWitness?.[witness];
        const sourceLine = lines.find(line => line.number === candidate.line);
        assert.ok(quote && sourceLine?.text.includes(quote), `${witness} ${id}: evidence must quote this witness`);
        if (decision.action === 'replace' && decision.dccId === null) assert.ok(decision.headword && decision.definition, `${id}: noncore correction needs a complete gloss`);
        if (decision.kind === 'source-form' && decision.dccId === null && decision.action !== 'suppress') assert.ok(decision.headword && decision.definition, `${id}: a dictionary homograph needs its corrected meaning`);
      }
      const checked = Lookup.enrichGroups(glossary, lines, frequency, forms, review, witness);
      assert.ok(checked.flatMap(group => group.entries).every(entry => entry.contextReviewed), `${witness}: unreviewed entry escaped filtering`);
      const defaults = Vocabulary.selectEntries(checked, 50, frequency);
      assert.ok(defaults.groups.flatMap(group => group.entries).every(entry => !Vocabulary.frequencyForEntry(entry, frequency)), `${witness}: default must exclude DCC core`);
      assert.equal(Vocabulary.selectEntries(checked, 0, frequency).shownWords, 0);
    }
  });
}

test('new corpus witnesses receive no vocabulary until they are explicitly enrolled and reviewed', async () => {
  const enrolledKeys = new Set(enrollment.records.map(record => `${record.witness}:${record.poem}`));
  const pending = corpus.records.filter(record => !enrolledKeys.has(`${record.witness}:${record.poem}`));
  assert.equal(pending.filter(record => record.witness === 'W').length, 15);
  for (const record of pending) {
    const review = JSON.parse(await read(`docs/data/vocabulary-review/${record.poem}.json`));
    const glossary = Vocabulary.parseEntries(JSON.parse(await read(`docs/data/Companion/Vocab/${record.poem}.json`)));
    const lines = Vocabulary.extractWitnessLines({ documentElement: dom(xmlNodes[`docs/${record.path}`]) }, record.poem);
    assert.equal(review.inputs.teiByWitnessSha256[record.witness], undefined, 'no review binding may be borrowed');
    assert.equal(review.coverage.byWitness[record.witness], undefined, 'new witness must not inherit coverage');
    assert.ok(review.entries.every(entry => !entry.witnesses.includes(record.witness)), 'new witness must not inherit decisions');
    const checked = Lookup.enrichGroups(glossary, lines, frequency, forms, review, record.witness);
    assert.equal(checked.flatMap(group => group.entries).length, 0, `${record.witness}:${record.poem}: unreviewed vocabulary escaped`);
    assert.equal(Vocabulary.selectEntries(checked, 100, frequency).shownWords, 0, 'maximum help cannot reveal unreviewed guesses');
  }
});

test('contextual corrections reach the reader without importing another witness or homograph', async () => {
  async function at(poem, witness, number) {
    const review = JSON.parse(await read(`docs/data/vocabulary-review/${poem}.json`));
    const glossary = Vocabulary.parseEntries(JSON.parse(await read(`docs/data/Companion/Vocab/${poem}.json`)));
    const lines = Vocabulary.extractWitnessLines({ documentElement: dom(xmlNodes[`docs/data/tei/${witness}/${poem}.xml`]) }, poem);
    return Lookup.enrichGroups(glossary, lines, frequency, forms, review, witness).find(group => group.lineRange === String(number))?.entries || [];
  }
  const matchedForm = (entries, form) => entries.find(entry => entry.sourceForms?.some(value => Lookup.normalizeForm(value) === form));
  assert.equal(matchedForm(await at('3.1', 'LL', 60), 'iam').dccId, 'dcc-iam-34');
  assert.equal(matchedForm(await at('3.2', 'LL', 37), 'uis').dccId, 'dcc-volo-66');
  const foliage = matchedForm(await at('3.5', 'LL', 7), 'frondibus');
  assert.equal(foliage.nonCore, true);
  assert.match(foliage.definition, /foliage|leav/i);
  const incision = matchedForm(await at('3.1', 'P', 53), 'incisa');
  assert.equal(incision.nonCore, true);
  assert.match(incision.definition, /cut|engrave|inscribe/i);
  assert.equal(matchedForm(await at('3.3', 'S', 1), 'e'), undefined);
  assert.equal(matchedForm(await at('3.5', 'Y', 33), 'e'), undefined);
  assert.ok((await at('3.3', 'LL', 36)).every(entry => !entry.headword.startsWith('aliquī')));
  const uttered = matchedForm(await at('3.6', 'LL', 72), 'edidit');
  assert.equal(uttered.nonCore, true);
  assert.match(uttered.definition, /utter|emit/);
  const firstCompany = await at('3.8', 'LL', 27);
  assert.equal(matchedForm(firstCompany, 'primum').dccId, 'dcc-primus-91');
  assert.ok(firstCompany.some(entry => /pīlus/.test(entry.headword) && /company|infantry/.test(entry.definition)));
  assert.ok((await at('3.8', 'Y', 10)).every(entry => !entry.headword.startsWith('pāsc')));
  assert.ok((await at('3.8', 'P', 41)).some(entry => entry.headword.startsWith('findō')));
  const temples = matchedForm(await at('3.13', 'LL', 17), 'tempora');
  assert.equal(temples.dccId, 'dcc-tempus-89');
  assert.match(temples.definition, /temple/);
});
