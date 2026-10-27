import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

const require = createRequire(import.meta.url);
const Vocabulary = require('../docs/js/vocabulary.js');
const root = new URL('../', import.meta.url);
const ns = 'http://www.tei-c.org/ns/1.0';

// Standard-library XML parsing supplies genuine mixed-content node order without
// adding a browser or XML package to this static site's runtime dependencies.
const serializeXml = `
import json, sys
import xml.etree.ElementTree as ET

def node(el):
    children = []
    if el.text: children.append(el.text)
    for child in el:
        children.append(node(child))
        if child.tail: children.append(child.tail)
    return {'tag':el.tag, 'attrs':dict(el.attrib), 'children':children}
print(json.dumps(node(ET.fromstring(sys.stdin.read()))))
`;
function documentFromXml(xml) {
  const result = spawnSync('python3', ['-c', serializeXml], { input: xml, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });
  assert.equal(result.status, 0, result.stderr);
  function toDom(value) {
    if (typeof value === 'string') return { nodeType: 3, nodeValue: value };
    const [, namespaceURI, localName] = value.tag.match(/^\{([^}]+)\}(.+)$/) || [null, '', value.tag];
    return {
      nodeType: 1, namespaceURI, localName,
      childNodes: value.children.map(toDom),
      getAttribute: name => value.attrs[name === 'xml:id' ? '{http://www.w3.org/XML/1998/namespace}id' : name] ?? null
    };
  }
  return { documentElement: toDom(JSON.parse(result.stdout)) };
}
const wrapped = (body, header = '') => documentFromXml(`<TEI xmlns="${ns}">${header}<text><body><div type="poem" n="3.1">${body}</div></body></text></TEI>`);

const corpus = JSON.parse(await readFile(new URL('docs/data/tei-corpus.json', root), 'utf8'));
const frequency = JSON.parse(await readFile(new URL('docs/data/latin-frequency.json', root), 'utf8'));

test('glossary parsing preserves exact dictionary forms, full definitions, and colonless notes', () => {
  const groups = Vocabulary.parseEntries({
    '10': 'subeō, subīre, subiī, subitum = to go under; to approach',
    '2': 'mūsa, mūsae f.: Muse, song, poem; sciences\ninplēbit = implēbit',
    '3': 'lemma: a sense (with; qualification); another sense',
    invalid: '<b>not a verse</b>',
    '4': null
  });
  assert.deepEqual(groups.map(group => group.lineRange), ['2', '3', '10']);
  assert.equal(groups[0].entries[0].headword, 'mūsa, mūsae f.');
  assert.equal(groups[0].entries[0].definition, 'Muse, song, poem; sciences');
  assert.equal(groups[0].entries[1].headword, 'inplēbit = implēbit');
  assert.equal(groups[0].entries[1].definition, '');
  assert.equal(groups[1].entries[0].definition, 'a sense (with; qualification); another sense');
  assert.equal(groups[2].entries[0].raw, 'subeō, subīre, subiī, subitum = to go under; to approach');
});

test('flashcard export preserves complete Unicode fields and produces exactly two import columns', () => {
  const entries = [
    {
      headword: '  mūsa,\tmūsae f.\r\n',
      definition: 'Muse,\n song;\tpoem\r\n(sciences\u00a0 and  arts)',
      forms: ['mūsās'], dictionary: true, dccId: 'dcc-musa', raw: 'not exported'
    },
    { headword: ' quę\u2003/\u2003quae ', definition: 'which; “what” — relative pronoun' },
    { headword: 'm\u0304', definition: 'a combining macron remains intact' }
  ];
  const before = JSON.stringify(entries);
  const result = Vocabulary.toFlashcardTsv(entries);
  assert.deepEqual(result, {
    text: 'mūsa, mūsae f.\tMuse, song; poem (sciences and arts)\nquę / quae\twhich; “what” — relative pronoun\nm\u0304\ta combining macron remains intact',
    count: 3
  });
  assert.ok(result.text.split('\n').every(row => row.split('\t').length === 2));
  assert.equal(JSON.stringify(entries), before, 'export does not modify visible entries');
});

test('flashcard export removes repeated pairs but retains distinct contextual definitions in display order', () => {
  const result = Vocabulary.toFlashcardTsv([
    { headword: 'tempus, temporis n.', definition: 'time', lineRange: '1' },
    { headword: 'mūsa', definition: 'Muse; song' },
    { headword: ' tempus,  temporis n. ', definition: '\t time\n', lineRange: '20' },
    { headword: 'tempus, temporis n.', definition: 'temple, side of the forehead', lineRange: '21' },
    { headword: 'mūsa', definition: 'Muse; song', dccId: 'a-different-source-id' }
  ]);
  assert.deepEqual(result, {
    text: 'tempus, temporis n.\ttime\nmūsa\tMuse; song\ntempus, temporis n.\ttemple, side of the forehead',
    count: 3
  });
});

test('flashcard export omits notes and incomplete entries and has no header or empty rows', () => {
  const entries = [
    { headword: 'Original glossary note', definition: 'prose', unparsed: true },
    { headword: 'colonless source note', definition: '' },
    { headword: '\t\n', definition: 'missing headword' },
    { headword: 'lemma', definition: ' \r\n\t' },
    { definition: 'no headword' }, { headword: 'no definition' },
    { headword: null, definition: 'missing' }, null
  ];
  assert.deepEqual(Vocabulary.toFlashcardTsv(entries), { text: '', count: 0 });
  assert.deepEqual(Vocabulary.toFlashcardTsv([]), { text: '', count: 0 });
  assert.deepEqual(Vocabulary.toFlashcardTsv([...entries, { headword: 'et', definition: 'and' }]), { text: 'et\tand', count: 1 });
});

test('every published vocabulary entry survives parsing without rewritten scholarship', async () => {
  for (let number = 1; number <= 15; number += 1) {
    const legacy = JSON.parse(await readFile(new URL(`docs/data/Companion/Vocab/3.${number}.json`, root), 'utf8'));
    const parsed = Vocabulary.parseEntries(legacy);
    const original = Object.values(legacy).flatMap(value => value.split(/\r?\n/).map(value => value.trim()).filter(Boolean));
    assert.deepEqual(parsed.flatMap(group => group.entries.map(entry => entry.raw)), original, `3.${number}`);
    for (const group of parsed) for (const entry of group.entries) {
      assert.ok(entry.raw.startsWith(entry.headword));
    }
  }
});

test('witness choices only offer reviewed poem-specific sources with actual TEI paths', () => {
  assert.deepEqual(Vocabulary.reviewedWitnesses(corpus, '3.1').map(record => record.witness), ['P', 'Y', 'S', 'O', 'LL', 'W']);
  assert.deepEqual(Vocabulary.reviewedWitnesses({ records: [
    { poem: '3.1', witness: 'P', status: 'pending', path: 'candidate.xml' },
    { poem: '3.1', witness: 'W', status: 'reviewed' },
    { poem: '3.2', witness: 'Y', status: 'reviewed', path: 'reviewed.xml' }
  ] }, '3.1'), []);
});

test('source choices and glyphs retain the manuscript spelling and omit annotations', () => {
  const xml = wrapped(`<l n="1"><note type="manuscript">a</note><space quantity="3" unit="chars"/>mnis <choice><abbr>harundinib<g ref="#us">?</g></abbr><expan>harundinibus</expan></choice> <choice><orig>quę</orig><reg>quae</reg></choice><note type="editorial">Evidence prose</note>.</l>`, '<teiHeader><encodingDesc><charDecl><char xml:id="us"><mapping type="display">ꝰ</mapping><mapping type="expansion">us</mapping></char></charDecl></encodingDesc></teiHeader>');
  const [line] = Vocabulary.extractWitnessLines(xml, '3.1');
  assert.equal(line.text, '   mnis harundinibꝰ quę.');
  assert.equal(line.readable, true);
  assert.equal(line.hasUncertainty, false);
  assert.equal(Vocabulary.extractWitnessLines(xml, '3.2').length, 0);
});

test('uncertainty, gaps and alterations cannot silently produce an invented reading', () => {
  const xml = wrapped('<l n="7">sur<subst><del><unclear>dis</unclear></del><add place="below"><unclear>a</unclear></add></subst> <gap reason="illegible"><desc>unreadable evidence description</desc></gap><metamark function="unknown">⌃<desc>editorial description</desc></metamark></l><l n="8"><gap reason="illegible" quantity="1" unit="lines"/></l><l n="9"><gap reason="notInscribed" quantity="2" unit="chars"/></l>');
  const lines = Vocabulary.extractWitnessLines(xml, '3.1');
  assert.equal(lines[0].text, 'sur⟦[dis?]⟧⟨[a?]⟩ […]{⌃}');
  assert.equal(lines[0].hasUncertainty, true);
  assert.equal(lines[0].hasGap, true);
  assert.equal(lines[0].readable, true);
  assert.equal(lines[1].text, '[…]');
  assert.equal(lines[1].readable, false);
  assert.equal(lines[2].text, '  ');
  assert.equal(lines[2].hasGap, false);
  assert.equal(lines[2].readable, false);
});

test('source order, explicit word joins, and wholly absent text are preserved', () => {
  const xml = wrapped('<l n="3">iu<lb break="no"/>uat</l><gap reason="not-transmitted" n="4–5" quantity="2" unit="lines"/><l n="2">prima<lb/>uerba</l>');
  const lines = Vocabulary.extractWitnessLines(xml, '3.1');
  assert.deepEqual(lines.map(line => line.number), ['3', '2']);
  assert.deepEqual(lines.map(line => line.text), ['iuuat', 'prima uerba']);
  assert.deepEqual(Vocabulary.extractWitnessLines(wrapped('<gap reason="not-transmitted" n="1–70" quantity="70" unit="lines"/>'), '3.1'), []);
});

test('actual reviewed manuscript and print sources yield only their extant numbered verses', async () => {
  for (const [witness, poem, count] of [['P', '3.1', 70], ['Y', '3.7', 84], ['S', '3.7', 74], ['O', '3.1', 70], ['LL', '3.1', 70], ['S', '3.8', 0], ['P', '3.13', 0]]) {
    const xml = documentFromXml(await readFile(new URL(`docs/data/tei/${witness}/${poem}.xml`, root), 'utf8'));
    const lines = Vocabulary.extractWitnessLines(xml, poem);
    assert.equal(lines.length, count, `${witness} ${poem}`);
    if (witness === 'Y') assert.ok(lines.find(line => line.number === '12').text.includes('Etquę'));
    if (witness === 'LL') assert.equal(lines[0].text, 'Stat vetus et multos incaedua silva per annos;');
    for (const line of lines) assert.match(line.number, /^\d+$/);
  }
});

test('amount selects increasing numbers of headwords, with complete definitions at every level', () => {
  const groups = Vocabulary.parseEntries({
    '1': 'saepe: often; frequently\nrarus: rare; unusual',
    '2': 'mūsa, mūsae f.: Muse, song, poem\nSAEPE: often, time and again',
    '3': 'musa, musae f.: a song; the Muse',
    '4': 'silva, silvae f.: forest; woods'
  });
  const before = JSON.stringify(groups);
  const none = Vocabulary.selectEntries(groups, 0);
  assert.equal(none.totalWords, 4);
  assert.equal(none.shownWords, 0);
  assert.deepEqual(none.groups, []);
  let previousEntries = new Set();
  for (const amount of [12.5, 25, 37.5, 50, 75, 100]) {
    const selected = Vocabulary.selectEntries(groups, amount);
    assert.equal(selected.shownWords, Math.min(amount / 12.5, 4));
    const entries = new Set(selected.groups.flatMap(group => group.entries));
    for (const entry of previousEntries) assert.ok(entries.has(entry), `entry retained at ${amount}%`);
    for (const entry of entries) {
      assert.ok(groups.some(group => group.entries.includes(entry)), 'complete original entry retained');
      assert.equal(entry.definition, entry.raw.slice(entry.raw.indexOf(':') + 1).trim());
    }
    previousEntries = entries;
  }
  assert.deepEqual(Vocabulary.selectEntries(groups, 100).groups, groups);
  assert.equal(JSON.stringify(groups), before, 'selection must not mutate source groups');
});

test('the midpoint excludes DCC core words and higher help adds less common core entries first', () => {
  const groups = Vocabulary.parseEntries({
    '1': 'et: and\nincaeduus: uncut\nadveniō, advenīre: arrive\namō, amāre: love',
    '2': 'incipiens-unknown: an unlisted form\nET: and also'
  });
  const middle = Vocabulary.selectEntries(groups, 50, frequency);
  assert.equal(middle.totalWords, 5);
  assert.equal(middle.coreWords, 3);
  assert.equal(middle.nonCoreWords, 2);
  assert.deepEqual(middle.groups.flatMap(group => group.entries.map(entry => entry.headword)), ['incaeduus', 'incipiens-unknown']);
  assert.deepEqual(Vocabulary.selectEntries(groups, 25, frequency).groups[0].entries.map(entry => entry.headword), ['incaeduus']);
  assert.equal(Vocabulary.selectEntries(groups, 51, frequency).groups[0].entries.at(-1).headword, 'adveniō, advenīre');
  const more = Vocabulary.selectEntries(groups, 80, frequency);
  assert.equal(more.shownWords, 4);
  assert.ok(more.groups.flatMap(group => group.entries).some(entry => entry.headword === 'amō, amāre'));
  assert.ok(!more.groups.flatMap(group => group.entries).some(entry => entry.headword === 'et'));
  assert.deepEqual(Vocabulary.selectEntries(groups, 100, frequency).groups, groups);
  let previous = new Set();
  for (let amount = 0; amount <= 100; amount += 1) {
    const current = new Set(Vocabulary.selectEntries(groups, amount, frequency).groups.flatMap(group => group.entries));
    for (const entry of previous) assert.ok(current.has(entry), `selection is nested at ${amount}`);
    previous = current;
  }
});

test('identity preserves u/v, explicit form-to-lemma notes, and colonless source notes', () => {
  const groups = Vocabulary.parseEntries({
    '1': 'uir: man\nvir: man\ndēsierat < dēsinō, dēsinere: had ceased\ndēsinō, dēsinere: cease\ninplēbit = implēbit\nhāctenus (adv.): so far',
    '2': 'Hactenus (adv.): thus far'
  });
  const selected = Vocabulary.selectEntries(groups, 100);
  assert.equal(selected.totalWords, 6);
  assert.equal(selected.shownWords, 6);
  assert.deepEqual(selected.groups, groups);
  assert.deepEqual(Vocabulary.selectEntries(groups, -30).groups, []);
  assert.deepEqual(Vocabulary.selectEntries(groups, 'invalid').groups, []);
  assert.deepEqual(Vocabulary.selectEntries(groups, 120).groups, groups);
  assert.deepEqual(Vocabulary.selectEntries([], 50), { groups: [], shownWords: 0, totalWords: 0, coreWords: 0, nonCoreWords: 0 });
});


test('DCC snapshot preserves all published ranks and definitions with source and license metadata', async () => {
  assert.equal(frequency.entries.length, 997);
  assert.equal(new Set(frequency.entries.map(entry => entry.id)).size, 997);
  assert.equal(frequency.source.license.name, 'CC BY-SA 3.0');
  assert.equal(frequency.entries.find(entry => entry.id === 'dcc-et-1').definition, 'and');
  assert.equal(frequency.entries.find(entry => entry.id === 'dcc-quisquam-280').rank, 280);
  assert.equal(frequency.entries.find(entry => entry.id === 'dcc-vero-280').rank, 280);
  const rebuilt = spawnSync('python3', ['-c', `
import csv, json, sys
with open('scripts/sources/vocabulary/dcc-latin.csv', encoding='utf-8') as f:
 print(json.dumps([{'headword':r['Headword'], 'definition':r['Definition'], 'rank':int(r['Frequency Rank'])} for r in csv.DictReader(f)]))
`], { cwd: root, encoding: 'utf8' });
  assert.equal(rebuilt.status, 0, rebuilt.stderr);
  assert.deepEqual(frequency.entries.map(({headword, definition, rank}) => ({headword, definition, rank})), JSON.parse(rebuilt.stdout));
});

test('frequency lookup is conservative about aliases, linked forms, malformed notes, and homographs', () => {
  const entry = headword => ({ headword });
  assert.equal(Vocabulary.frequencyForEntry(entry('āb'), frequency).rank, 21);
  assert.equal(Vocabulary.frequencyForEntry(entry('vehendus < vehō, vehere'), frequency).dccIds[0], 'dcc-veho-632');
  assert.equal(Vocabulary.frequencyForEntry(entry('capiō capere, cēpī'), frequency).rank, 131);
  assert.equal(Vocabulary.frequencyForEntry(entry('From in + other etymology prose'), frequency), null);
  assert.equal(Vocabulary.frequencyForEntry(entry('incaeduus, incaedua'), frequency), null);
  assert.equal(Vocabulary.frequencyForEntry(entry('pl, satōrum'), frequency), null);
  assert.equal(Vocabulary.frequencyForEntry(entry('adversus, adversa, adversum'), frequency).rank, 657);
  assert.equal(Vocabulary.frequencyForEntry(entry('latus, lateris, n'), frequency).rank, 382);
  assert.equal(Vocabulary.frequencyForEntry(entry('latus'), frequency).ambiguous, true);
  assert.notEqual(Vocabulary.entryIdentity(entry('pl, satōrum')), Vocabulary.entryIdentity(entry('pl, āctōrum')));
  assert.notEqual(Vocabulary.entryIdentity(entry('sg, Eutropiī')), Vocabulary.entryIdentity(entry('sg, Opis')));
});

test('explicit ambiguity bundles stay together and use the most common possible DCC rank', () => {
  const candidates = ['dcc-sum-2', frequency.entries.find(entry => entry.lemma === 'edo').id];
  const bundle = { identity: 'dictionary-form:est', dccIds: candidates, frequencyRank: 999, headword: 'Possible headwords', definition: 'be / eat', raw: 'est' };
  const result = Vocabulary.frequencyForEntry(bundle, frequency);
  assert.deepEqual(result, { rank: 2, dccIds: candidates, ambiguous: true });
  assert.equal(Vocabulary.entryIdentity(bundle), 'dictionary-form:est');
  assert.equal(Vocabulary.frequencyForEntry({ ...bundle, dccIds: [...candidates, 'unknown'] }, frequency), null);
  const groups = [{ lineRange: '1', entries: [bundle, { headword: 'amo', definition: 'love', dccId: 'dcc-amo-219' }] }];
  assert.deepEqual(Vocabulary.selectEntries(groups, 50, frequency).groups, []);
  assert.equal(Vocabulary.selectEntries(groups, 75, frequency).groups[0].entries[0].headword, 'amo');
  assert.deepEqual(Vocabulary.selectEntries(groups, 100, frequency).groups[0].entries, groups[0].entries);
});

test('abbreviation and qualified-certainty metadata protects automatic vocabulary lookup without changing displayed text', () => {
  const xml = wrapped('<l n="1"><choice><abbr>m̄</abbr><expan>meum</expan></choice> <seg cert="low">amo</seg> <add cert="medium">a</add></l>');
  const [line] = Vocabulary.extractWitnessLines(xml, '3.1');
  assert.equal(line.text, 'm̄ amo ⟨a⟩');
  assert.ok(line.segments.find(segment => segment.text === 'm̄').kinds.includes('abbreviation'));
  assert.ok(line.segments.find(segment => segment.text === 'amo').kinds.includes('uncertain'));
  assert.ok(line.segments.find(segment => segment.text === 'a').kinds.includes('uncertain'));
  assert.equal(line.hasUncertainty, true);
});


test('unparsed legacy prose is preserved only at full help and never counted as a vocabulary word', () => {
  const notes = [
    'From Mārs + -ius . As a noun: original prose',
    'Cognate with forās, forīs: original definition',
    'Martirosyan connects cassis and catēna: chain',
    'The feminine and neuter forms: original text',
    'Unknown according to de Vaan: garlic',
    'pl, satōrum n.: offspring',
    'sg, Opis: the goddess Ops'
  ];
  const groups = Vocabulary.parseEntries({ '1': ['incaeduus: uncut', 'plūs: more', ...notes].join('\n') });
  assert.equal(groups[0].entries.filter(entry => entry.unparsed).length, notes.length);
  assert.equal(groups[0].entries.find(entry => entry.headword === 'plūs').unparsed, undefined, 'a Latin word beginning pl must not match the placeholder pl');
  assert.deepEqual(groups[0].entries.filter(entry => entry.unparsed).map(entry => entry.raw), notes);
  for (const amount of [0, 25, 50, 99]) {
    const result = Vocabulary.selectEntries(groups, amount, frequency);
    assert.equal(result.totalWords, 2);
    assert.ok(result.groups.every(group => group.entries.every(entry => !entry.unparsed)));
  }
  const full = Vocabulary.selectEntries(groups, 100, frequency);
  assert.equal(full.totalWords, 2);
  assert.equal(full.shownWords, 2);
  assert.deepEqual(full.groups, groups);
  const onlyNotes = Vocabulary.selectEntries(Vocabulary.parseEntries({ '1': notes.join('\n') }), 100, frequency);
  assert.equal(onlyNotes.totalWords, 0);
  assert.equal(onlyNotes.shownWords, 0);
  assert.deepEqual(onlyNotes.groups[0].entries.map(entry => entry.raw), notes);
});
