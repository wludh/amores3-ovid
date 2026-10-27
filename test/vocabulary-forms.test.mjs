import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const data = JSON.parse(await readFile(new URL('docs/data/vocabulary-forms.json', root), 'utf8'));
const frequency = JSON.parse(await readFile(new URL('docs/data/latin-frequency.json', root), 'utf8'));
const enrollment = JSON.parse(await readFile(new URL(data.source.enrollmentManifest, root), 'utf8'));
const liveCorpus = JSON.parse(await readFile(new URL('docs/data/tei-corpus.json', root), 'utf8'));

test('generated dictionary lookup is bound to its actual source inputs', async () => {
  for (const [relative, expected] of Object.entries(data.source.inputSha256)) {
    const actual = createHash('sha256').update(await readFile(new URL(relative, root))).digest('hex');
    assert.equal(actual, expected, `${relative}: rebuild vocabulary-forms.json after changing inputs`);
  }
  const script = createHash('sha256').update(await readFile(new URL(data.source.generator, root))).digest('hex');
  assert.equal(script, data.source.generatorSha256);
});

test('vocabulary enrollment preserves its reviewed sources while allowing additive corpus records', () => {
  const key = record => `${record.witness}:${record.poem}`;
  const enrolledKeys = enrollment.records.map(key);
  assert.equal(new Set(enrolledKeys).size, enrolledKeys.length, 'duplicate vocabulary enrollment');
  assert.deepEqual([...new Set(enrollment.records.map(record => record.witness))].sort(), ['LL', 'O', 'P', 'S', 'Y']);
  assert.deepEqual(Object.keys(data.coverage.byWitnessPoem).sort(), enrolledKeys.sort());
  assert.deepEqual(Object.keys(data.source.inputSha256).filter(path => path.startsWith('docs/data/tei/')).sort(),
    enrollment.records.map(record => `docs/${record.path}`).sort());
  assert.ok(data.source.inputSha256[data.source.enrollmentManifest], 'enrollment snapshot must be hashed');
  for (const record of enrollment.records) {
    const current = liveCorpus.records.filter(item => key(item) === key(record));
    assert.equal(current.length, 1, `${key(record)} must still exist exactly once`);
    assert.equal(record.status, 'reviewed');
    assert.equal(current[0].status, record.status, `${key(record)}: enrollment status changed`);
    assert.equal(current[0].path, record.path, `${key(record)}: enrolled path changed`);
  }
  assert.ok(liveCorpus.records.some(record => record.witness === 'W'), 'the additive witness remains in the live corpus');
  assert.ok(!enrollment.records.some(record => record.witness === 'W'), 'W requires a separate vocabulary review');
});

test('builder rejects changes to enrolled records and does not enroll newer witnesses', () => {
  const script = `
import copy, json, runpy
v=runpy.run_path('scripts/build-vocabulary-lexicon.py')
enrollment=json.load(open(v['ENROLLMENT_MANIFEST']))
live=json.load(open('docs/data/tei-corpus.json'))
selected=v['enrolled_records'](enrollment, live)
assert selected==enrollment['records']
assert all(record['witness']!='W' for record in selected)
target=selected[0]
for change in ('missing', 'duplicate', 'path', 'status'):
    altered=copy.deepcopy(live)
    row=next(record for record in altered['records'] if (record['witness'],record['poem'])==(target['witness'],target['poem']))
    if change=='missing': altered['records'].remove(row)
    elif change=='duplicate': altered['records'].append(copy.deepcopy(row))
    else: row[change]='changed'
    try: v['enrolled_records'](enrollment, altered)
    except ValueError: continue
    raise AssertionError('accepted changed enrollment: '+change)
print('checked')
`;
  const result = spawnSync('python3', ['-c', script], { cwd: root, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout.trim(), 'checked');
});

test('dictionary mappings retain DCC identities and distinguish genuine ambiguity', () => {
  const ids = new Set(frequency.entries.map(entry => entry.id));
  for (const [form, mapping] of Object.entries(data.forms)) {
    assert.match(form, /^[a-z]+$/u);
    assert.ok(ids.has(mapping.dccId), form);
    assert.equal(data.ambiguousForms[form], undefined, `${form} cannot be single and ambiguous`);
  }
  for (const [form, mapping] of Object.entries(data.ambiguousForms)) {
    assert.equal(mapping.allCandidatesCore, true, form);
    assert.ok(mapping.dccIds.length > 0, form);
    assert.ok(mapping.dccIds.every(id => ids.has(id)), form);
  }
  assert.equal(data.forms.annos.dccId, 'dcc-annus-167');
  assert.equal(data.forms.sum.dccId, 'dcc-sum-2');
  assert.equal(data.forms.ut.dccId, 'dcc-ut-15');
  assert.equal(data.forms.haec.dccId, 'dcc-hic-7');
  assert.equal(data.forms.hoc.dccId, 'dcc-hic-7');
  assert.equal(data.forms.iens.dccId, 'dcc-eo-97');
  assert.equal(data.forms.mihi.dccId, 'dcc-ego-11');
  assert.deepEqual(data.ambiguousForms.est.dccIds, ['dcc-edo-688', 'dcc-sum-2']);
  assert.equal(data.forms.multos, undefined, 'Do not erase an unresolved noncore alternative');
  assert.equal(data.ambiguousForms.multos, undefined);
});

test('build tokenizer rejects complete words touching uncertain or abbreviated source text', () => {
  const script = `
import json, runpy, xml.etree.ElementTree as ET
v=runpy.run_path('scripts/build-vocabulary-lexicon.py')
xml='<l xmlns="http://www.tei-c.org/ns/1.0">Et m<unclear>ar</unclear>e a<gap/>mo <choice><abbr>q</abbr><expan>que</expan></choice> <del>olim</del> uerba <note>hidden words</note> <add>nunc</add> haec.</l>'
print(json.dumps(list(v['safe_tokens'](v['source_text'](ET.fromstring(xml))))))
`;
  const result = spawnSync('python3', ['-c', script], { cwd: root, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(JSON.parse(result.stdout), ['et', 'uerba', 'nunc', 'haec']);
});
