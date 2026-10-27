import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const data = JSON.parse(await readFile(new URL('docs/data/vocabulary-forms.json', root), 'utf8'));
const frequency = JSON.parse(await readFile(new URL('docs/data/latin-frequency.json', root), 'utf8'));

test('generated dictionary lookup is bound to its actual source inputs', async () => {
  for (const [relative, expected] of Object.entries(data.source.inputSha256)) {
    const actual = createHash('sha256').update(await readFile(new URL(relative, root))).digest('hex');
    assert.equal(actual, expected, `${relative}: rebuild vocabulary-forms.json after changing inputs`);
  }
  const script = createHash('sha256').update(await readFile(new URL(data.source.generator, root))).digest('hex');
  assert.equal(script, data.source.generatorSha256);
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
