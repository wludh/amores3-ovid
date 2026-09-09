#!/usr/bin/env python3
"""Validate enrolled TEI and audit completeness against all 75 corpus slots."""
from collections import Counter
from pathlib import Path
import hashlib
import json
import subprocess
import tempfile
import xml.etree.ElementTree as ET
import argparse
from urllib.parse import unquote, urlparse

ROOT = Path(__file__).resolve().parents[1]
NS = 'http://www.tei-c.org/ns/1.0'
ID = '{http://www.w3.org/XML/1998/namespace}id'
ET.register_namespace('', NS)


def select_tei(path, poem='3.7'):
    root = ET.parse(path).getroot()
    if root.tag != '{%s}TEI' % NS:
        root = root.find("poem[@n='%s']/{%s}TEI" % (poem, NS))
    assert root is not None, f'Missing {poem} TEI'
    assert any(d.get('type') == 'poem' and d.get('n') == poem for d in root.iter('{%s}div' % NS)), 'Wrong poem in source file'
    root.tail = None
    return root


def xml_digest(root):
    return hashlib.sha256(ET.canonicalize(ET.tostring(root, encoding='unicode')).encode()).hexdigest()


def image_identity(url):
    parsed = urlparse(unquote(url))
    return parsed.netloc.removeprefix('www.') + parsed.path.split('/full/')[0]


def verify_image_provenance(root, witness, poem, lines, by_id):
    annotations = json.loads((ROOT / 'docs/data/annotations.json').read_text(encoding='utf-8-sig'))
    manifest = json.loads((ROOT / f'docs/data/iiif-manifests/witness-{witness}.json').read_text())
    canvases = manifest.get('items') or manifest['sequences'][0]['canvases']
    parents = {child: parent for parent in root.iter() for child in parent}
    for line in lines:
        zone = by_id[line.get('facs')[1:]]
        surface = parents[zone]
        while surface.tag != '{%s}surface' % NS:
            surface = parents[surface]
        graphic = surface.find('{%s}graphic' % NS)
        assert graphic is not None, 'Facsimile surface lacks its source image'
        bounds = tuple(float(zone.get(k)) for k in ('ulx', 'uly', 'lrx', 'lry'))
        matching = [a for a in annotations if a.get('witness') == witness and a.get('poem') == poem and str(a.get('lineId')) == line.get('n') and (a['x'], a['y'], a['x'] + a['width'], a['y'] + a['height']) == bounds]
        assert matching, f'Line {line.get("n")}: zone differs from original annotation evidence'
        images = []
        for annotation in matching:
            canvas = canvases[annotation['page'] - 1]
            if 'images' in canvas:
                resource = canvas['images'][0]['resource']
            else:
                resource = canvas['items'][0]['items'][0]['body']
            images.append(image_identity(resource.get('id') or resource['@id']))
        assert image_identity(graphic.get('url')) in images, f'Line {line.get("n")}: source image does not match the annotation canvas'


def validate(witness, poem='3.7', record=None):
    if record is None:
        corpus = json.loads((ROOT / 'docs/data/tei-corpus.json').read_text())
        record = next(r for r in corpus['records'] if r['witness'] == witness and r['poem'] == poem)
    root = select_tei(ROOT / 'docs' / record['path'], poem)
    ledger = json.loads((ROOT / record['review_path']).read_text())
    report = ROOT / record['report_path']
    assert ledger['reviewed_xml_sha256'] == xml_digest(root), 'XML changed since independent review; re-review required'
    assert ledger['review_report_sha256'] == hashlib.sha256(report.read_bytes()).hexdigest(), 'Review report changed since seal'
    assert ledger['reviewer'] and ledger['witness'] == witness and ledger['poem'] == poem
    if poem != '3.7':
        assert ledger.get('author_agent') and ledger.get('reviewer_agent') and ledger['author_agent'] != ledger['reviewer_agent'], 'Review must be by a different source-reading agent'
        assert ledger.get('review_type', '').startswith('independent-second'), 'Missing independent source review'
        assert ledger.get('reviewed_candidate_sha256') == hashlib.sha256((ROOT / 'docs' / record['path']).read_bytes()).hexdigest(), 'Integrated candidate differs from the independent review'
    with tempfile.NamedTemporaryFile(suffix='.xml') as tmp:
        tmp.write(ET.tostring(root, encoding='utf-8', xml_declaration=True)); tmp.flush()
        result = subprocess.run(['xmllint', '--noout', '--relaxng', str(ROOT / 'docs/schema/tei_all-4.12.0.rng'), tmp.name], capture_output=True, text=True)
        assert result.returncode == 0, result.stderr
    elements = list(root.iter())
    ids = [e.get(ID) for e in elements if e.get(ID)]
    assert len(ids) == len(set(ids)), 'Duplicate XML IDs'
    by_id = {e.get(ID): e for e in elements if e.get(ID)}
    for el in elements:
        for attr in ('facs', 'target', 'ref', 'who', 'resp', 'corresp', 'ana', 'hand'):
            for ref in el.get(attr, '').split():
                assert not ref.startswith('#') or ref[1:] in by_id, f'Broken {attr}: {ref}'
    lines = list(root.iter('{%s}l' % NS))
    canonical = set(range(1, record['canonical_line_count'] + 1))
    absent = set(record['absent_lines'])
    assert absent <= canonical, 'Invalid absent-line inventory'
    expected = canonical - absent
    actual_order = [int(e.get('n')) for e in lines]
    count = len(expected)
    assert set(actual_order) == expected and len(actual_order) == count, 'Verse coverage mismatch'
    assert all(e.get(ID) == f'{witness}-{poem}-l{e.get("n")}' for e in lines), 'Unstable verse IDs'
    assert ledger['line_coverage']['count'] == count, 'Incomplete independent line coverage'
    coverage = [n for span in ledger['line_coverage']['ranges'] for n in range(span['start'], span['end'] + 1)]
    assert set(coverage) == expected and len(coverage) == count, 'Review coverage ranges are incomplete'
    if 'line_order' in ledger:
        actual_ids = [e.get(ID) for e in lines]
        assert ledger['line_order'] in (actual_order, actual_ids), 'Source order differs from independent review'
    else:
        assert actual_order == sorted(expected), 'Noncanonical source order needs explicit independent review'
    if witness != 'LL':
        for line in lines:
            zone = by_id.get(line.get('facs', '')[1:])
            assert zone is not None and zone.tag == '{%s}zone' % NS, 'Missing verse image zone'
            assert float(zone.get('lrx')) > float(zone.get('ulx')) and float(zone.get('lry')) > float(zone.get('uly')), 'Invalid zone geometry'
        verify_image_provenance(root, witness, poem, lines, by_id)
    if absent:
        gaps = [g for g in root.iter('{%s}gap' % NS) if g.get('unit') == 'line' and g.get('reason') == 'not-transmitted']
        assert sum(int(g.get('quantity', '0')) for g in gaps) == len(absent), 'Missing explicit absent extent'
        assert all(g.find('{%s}desc' % NS) is not None for g in gaps), 'Missing source-absence explanation'
        if poem != '3.7':
            assert set(ledger.get('absent_lines', [])) == absent and ledger.get('absence_evidence'), 'Absence needs independent source evidence'
    notes = [e for e in elements if e.tag == '{%s}note' % NS and e.get('type') in ('review', 'uncertainty', 'observation')]
    dispositions = {n['note_id']: n for n in ledger['notes']}
    assert len(dispositions) == len(ledger['notes']), 'Duplicate review dispositions'
    assert set(dispositions) == {n.get(ID) for n in notes}, 'Every note needs an independent disposition'
    statuses = {'review': 'escalate', 'uncertainty': 'documented-uncertainty', 'observation': 'resolved'}
    for note in notes:
        record = dispositions[note.get(ID)]
        assert record['status'] == statuses[note.get('type')], 'Note type disagrees with review disposition'
        assert record['target'] == note.get('target') and record.get('evidence'), 'Missing or mismatched review evidence'
    counts = Counter(n['status'] for n in ledger['notes'])
    assert all(ledger['counts'][k] == counts[k] for k in statuses.values()), 'Disposition counts disagree'
    questions = [(n.get('n'), ' '.join(n.itertext())) for n in notes if n.get('type') == 'review']
    return count, counts, questions


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--require-complete', action='store_true', help='Fail unless every corpus slot has passed independent review')
    args = parser.parse_args()
    corpus = json.loads((ROOT / 'docs/data/tei-corpus.json').read_text())
    records = corpus['records']
    scope = {(w, f'3.{n}') for w in ['P', 'Y', 'S', 'O', 'LL'] for n in range(1, 16)}
    assert {(r['witness'], r['poem']) for r in records} == scope and len(records) == 75, 'Corpus scope was narrowed or duplicated'
    assert hashlib.sha256((ROOT / 'docs/data/annotations.json').read_bytes()).hexdigest() == corpus['annotations_sha256'], 'Annotation corpus changed; audit its provenance'
    rows = []; questions = []; incomplete = []
    for record in records:
        w, poem = record['witness'], record['poem']
        assert record['status'] in ('pending', 'first-pass', 'in-review', 'reviewed'), 'Unknown review state'
        if record['status'] != 'reviewed':
            incomplete.append(f'{w} {poem}')
            rows.append(f'| {poem} | {w} | {record["status"]} | — | — |')
            continue
        count, counts, remaining = validate(w, poem, record)
        rows.append(f'| {poem} | {w} | reviewed | {count} | {counts["escalate"]} |')
        questions.extend(f'- **{w} {poem}, line {n}:** {text}' for n, text in remaining)
        print(f'{w} {poem}: schema, coverage, references, review dispositions and seal passed ({count} verses)', flush=True)
    output = '# Amores III — corpus audit status\n\nGenerated by `npm run validate:tei`. Scope: all 15 poems × all five witnesses.\n\n'
    output += f'**{75-len(incomplete)} / 75 slots independently reviewed and structurally verified; {len(incomplete)} incomplete.** Human scholarly approval is not implied.\n\n'
    output += '| Poem | Witness | State | Extant verses reviewed | Editorial questions |\n| --- | --- | --- | ---: | ---: |\n' + '\n'.join(rows)
    output += '\n\n## Remaining editorial questions\n\n' + '\n'.join(questions) + '\n'
    (ROOT / 'scripts/output/corpus-review-status.md').write_text(output)
    print(f'Corpus coverage: {75-len(incomplete)}/75 reviewed; {len(incomplete)} incomplete.')
    if args.require_complete and incomplete:
        raise SystemExit('Corpus incomplete: ' + ', '.join(incomplete))


if __name__ == '__main__':
    main()
