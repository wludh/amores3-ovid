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
import re
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


def surface_navigation_from_ledger(ledger):
    """Export page-only navigation after verify_image_provenance has checked it."""
    return [{'lineId': str(item['line']), 'page': item['viewer_page']}
            for item in ledger.get('unlocated_lines', [])]


def verify_image_provenance(root, witness, poem, lines, by_id, ledger):
    annotations = json.loads((ROOT / 'docs/data/annotations.json').read_text(encoding='utf-8-sig'))
    manifest = json.loads((ROOT / f'docs/data/iiif-manifests/witness-{witness}.json').read_text())
    canvases = manifest.get('items') or manifest['sequences'][0]['canvases']
    def canvas_image(canvas):
        resource = canvas['images'][0]['resource'] if 'images' in canvas else canvas['items'][0]['items'][0]['body']
        return image_identity(resource.get('id') or resource['@id'])
    parents = {child: parent for parent in root.iter() for child in parent}
    corrections = {str(c['line']): c for c in ledger.get('zone_corrections', [])}
    assert len(corrections) == len(ledger.get('zone_corrections', [])), 'Duplicate zone correction'
    assert set(corrections) <= {line.get('n') for line in lines}, 'Zone correction lacks a verse'
    unlocated = {str(item['line']): item for item in ledger.get('unlocated_lines', [])}
    assert len(unlocated) == len(ledger.get('unlocated_lines', [])), 'Duplicate unlocated position'
    assert set(unlocated) <= {line.get('n') for line in lines}, 'Unlocated position lacks an alignment container'
    assert not set(unlocated) & set(corrections), 'Unlocated position cannot also claim a corrected rectangle'
    navigation_overrides = []
    preserved_numbers = set()
    checked_zones = set()
    for line in lines:
        zone = by_id.get(line.get('facs', '')[1:])
        assert zone is not None, 'Missing verse facsimile target'
        if line.get('n') in unlocated:
            item = unlocated[line.get('n')]
            assert item.get('status') == 'illegible_unlocated' and item.get('evidence'), 'Unlocated position lacks independent evidence'
            assert item.get('target') == line.get(ID) and item.get('facs') == line.get('facs'), 'Unlocated position differs from reviewed target'
            assert zone.tag == '{%s}surface' % NS, 'Unlocated position must link to a whole surface'
            assert not any(a.get('witness') == witness and a.get('poem') == poem and str(a.get('lineId')) == line.get('n') for a in annotations), 'Unlocated position cannot bypass original annotation provenance'
            children = list(line)
            assert len(children) == 1 and children[0].tag == '{%s}gap' % NS, 'Unlocated position must contain only an illegibility gap'
            gap = children[0]
            assert not (line.text or '').strip() and not (gap.tail or '').strip(), 'Unlocated position cannot supply readable verse text'
            assert gap.get('reason') == 'illegible' and gap.get('unit') == 'line' and gap.get('quantity') == '1', 'Unlocated position must preserve one illegible alignment position'
            desc = gap.find('{%s}desc' % NS)
            assert desc is not None and ''.join(desc.itertext()).strip(), 'Unlocated position needs an explanation'
            note = by_id.get(item.get('note_id'))
            assert note is not None and note.tag == '{%s}note' % NS and note.get('type') == 'uncertainty' and line.get(ID) in note.get('target', '').replace('#', '').split(), 'Unlocated position needs a targeted uncertainty note'
            graphic = zone.find('{%s}graphic' % NS)
            assert graphic is not None and item.get('source_graphic') and image_identity(graphic.get('url')) == image_identity(item['source_graphic']), 'Unlocated source image differs from review'
            pages = [i + 1 for i, canvas in enumerate(canvases) if canvas_image(canvas) == image_identity(item['source_graphic'])]
            assert len(pages) == 1 and item.get('viewer_page') == pages[0], 'Unlocated source page differs from manifest'
            continue
        assert zone.tag == '{%s}zone' % NS, 'Surface-level verse links require independent unlocated evidence'
        correction = corrections.get(line.get('n'))
        if correction:
            assert correction.get('reason') and correction.get('evidence'), 'Zone correction lacks independent evidence'
            assert line.get('facs') == correction['corrected_facs'], 'Verse does not use reviewed correction'
            assert correction['original_facs'] != correction['corrected_facs'], 'Original zone must be preserved separately'
            original = by_id[correction['original_facs'][1:]]
            for label, element in [('original', original), ('corrected', zone)]:
                assert element.tag == '{%s}zone' % NS
                assert {k: float(element.get(k)) for k in ('ulx', 'uly', 'lrx', 'lry')} == correction[label + '_bounds'], 'Zone differs from reviewed bounds'
            corrected_surface = parents[zone]
            while corrected_surface.tag != '{%s}surface' % NS:
                corrected_surface = parents[corrected_surface]
            corrected_graphic = corrected_surface.find('{%s}graphic' % NS)
            assert image_identity(corrected_graphic.get('url')) == image_identity(correction['source_graphic']), 'Corrected zone image differs from review'
            corrected_pages = [i + 1 for i, c in enumerate(canvases) if canvas_image(c) == image_identity(correction['source_graphic'])]
            assert len(corrected_pages) == 1, 'Corrected image must identify one manifest canvas'
            zone = original
        surface = parents[zone]
        while surface.tag != '{%s}surface' % NS:
            surface = parents[surface]
        graphic = surface.find('{%s}graphic' % NS)
        assert graphic is not None, 'Facsimile surface lacks its source image'
        bounds = tuple(float(zone.get(k)) for k in ('ulx', 'uly', 'lrx', 'lry'))
        matching = [a for a in annotations if a.get('witness') == witness and a.get('poem') == poem and str(a.get('lineId')) == line.get('n') and (a['x'], a['y'], a['x'] + a['width'], a['y'] + a['height']) == bounds]
        assert matching, f'Line {line.get("n")}: zone differs from original annotation evidence'
        if correction:
            reviewed_bounds = correction['corrected_bounds']
            original_annotation = matching[0]
            fields = ('page', 'x', 'y', 'width', 'height')
            navigation_overrides.append({
                'lineId': line.get('n'),
                'original': {k: original_annotation[k] for k in fields},
                'corrected': {'page': corrected_pages[0], 'x': reviewed_bounds['ulx'], 'y': reviewed_bounds['uly'],
                              'width': reviewed_bounds['lrx'] - reviewed_bounds['ulx'], 'height': reviewed_bounds['lry'] - reviewed_bounds['uly']}
            })
        images = []
        for annotation in matching:
            canvas = canvases[annotation['page'] - 1]
            if 'images' in canvas:
                resource = canvas['images'][0]['resource']
            else:
                resource = canvas['items'][0]['items'][0]['body']
            images.append(image_identity(resource.get('id') or resource['@id']))
        assert image_identity(graphic.get('url')) in images, f'Line {line.get("n")}: source image does not match the annotation canvas'
        preserved_numbers.add(line.get('n'))
        checked_zones.add(zone.get(ID))
        if correction:
            checked_zones.add(correction['corrected_facs'][1:])
    manifest_images = {canvas_image(canvas) for canvas in canvases}
    for surface in root.iter('{%s}surface' % NS):
        graphics = list(surface.iter('{%s}graphic' % NS))
        assert graphics, 'Evidence surface lacks a source image'
        assert all(image_identity(g.get('url', '')) in manifest_images for g in graphics), 'Evidence surface image is outside the witness manifest'
    original_annotations = [a for a in annotations if a.get('witness') == witness and a.get('poem') == poem]
    for zone in root.iter('{%s}zone' % NS):
        if zone.get(ID) in checked_zones:
            continue
        # Unused original rectangles remain evidence even where their former
        # verse assignments proved absent. Their stable IDs preserve that link.
        match = re.search(r'-zone-(\d+)$', zone.get(ID, ''))
        assert match, 'Unused zone lacks a stable original annotation identity'
        number = match.group(1)
        surface = parents[zone]
        while surface.tag != '{%s}surface' % NS:
            surface = parents[surface]
        graphic = surface.find('{%s}graphic' % NS)
        bounds = tuple(float(zone.get(k)) for k in ('ulx', 'uly', 'lrx', 'lry'))
        matching = [a for a in original_annotations if str(a['lineId']) == number
                    and (a['x'], a['y'], a['x'] + a['width'], a['y'] + a['height']) == bounds
                    and canvas_image(canvases[a['page'] - 1]) == image_identity(graphic.get('url'))]
        assert matching, f'Unused zone {number}: original annotation provenance changed'
        preserved_numbers.add(number)
    expected_originals = {str(a['lineId']) for a in original_annotations}
    assert expected_originals <= preserved_numbers, 'Missing preserved original annotation zone'
    return navigation_overrides


def verify_absent_spans(root, lines, canonical, absent, ledger):
    """Bind every absence gap to its actual place in the source sequence."""
    elements = list(root.iter())
    positions = {element: index for index, element in enumerate(elements)}
    parents = {child: parent for parent in elements for child in parent}
    gaps = [e for e in elements if e.tag == '{%s}gap' % NS and e.get('reason') == 'not-transmitted']
    represented = {int(line.get('n')) for line in lines}
    covered = set()
    for gap in gaps:
        ancestor = parents.get(gap)
        while ancestor is not None and ancestor.tag != '{%s}div' % NS:
            assert ancestor.tag != '{%s}l' % NS, 'Canonical absence gap cannot sit inside a represented verse'
            ancestor = parents.get(ancestor)
        assert ancestor is not None and ancestor.get('type') == 'poem', 'Canonical absence gap must belong to the poem'
        assert gap.get('unit') == 'line', 'Canonical absence must use line units'
        quantity = int(gap.get('quantity', '0'))
        assert quantity > 0, 'Absent span needs a positive extent'
        desc = gap.find('{%s}desc' % NS)
        assert desc is not None and ''.join(desc.itertext()).strip(), 'Missing source-absence explanation'
        before = [line for line in lines if positions[line] < positions[gap]]
        after = [line for line in lines if positions[line] > positions[gap]]
        start = int(before[-1].get('n')) + 1 if before else int(after[0].get('n')) - quantity if after else 1
        end = start + quantity - 1
        if gap.get('n'):
            explicit = re.fullmatch(r'(\d+)(?:[–-](\d+))?', gap.get('n'))
            assert explicit and (int(explicit[1]), int(explicit[2] or explicit[1])) == (start, end), 'Absent span label differs from its source position'
        span = set(range(start, end + 1))
        assert span <= canonical and span <= absent and not span & represented, 'Absent span differs from canonical absence inventory'
        assert not covered & span, 'Overlapping absent spans'
        if after:
            assert int(after[0].get('n')) == end + 1, 'Absent span does not meet the next surviving verse'
        covered.update(span)
    assert covered == absent, 'Absent spans do not cover the complete absence inventory'
    if absent:
        assert set(ledger.get('absent_lines', [])) == absent and ledger.get('absence_evidence'), 'Absence needs independent source evidence'


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
    assert all('\n' not in ''.join(line.itertext()) for line in lines), 'Formatting newline inside verse mixed content'
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
            assert zone is not None, 'Missing verse image target'
            if zone.tag == '{%s}zone' % NS:
                assert float(zone.get('lrx')) > float(zone.get('ulx')) and float(zone.get('lry')) > float(zone.get('uly')), 'Invalid zone geometry'
        overrides = verify_image_provenance(root, witness, poem, lines, by_id, ledger)
        assert record.get('navigation_overrides', []) == overrides, 'Published navigation differs from reviewed TEI zones'
        assert record.get('surface_navigation', []) == surface_navigation_from_ledger(ledger), 'Published page-only navigation differs from independent review'
    verify_absent_spans(root, lines, canonical, absent, ledger)
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
            rows.append(f'| {poem} | {w} | {record["status"]} | — | — | — | — |')
            continue
        count, counts, remaining = validate(w, poem, record)
        unlocated_count = len(json.loads((ROOT / record['review_path']).read_text()).get('unlocated_lines', []))
        rows.append(f'| {poem} | {w} | reviewed | {count} | {len(record["absent_lines"])} | {unlocated_count} | {counts["escalate"]} |')
        questions.extend(f'- **{w} {poem}, line {n}:** {text}' for n, text in remaining)
        print(f'{w} {poem}: schema, coverage, references, review dispositions and seal passed ({count} verse positions; {unlocated_count} unlocated)', flush=True)
    output = '# Amores III — corpus audit status\n\nGenerated by `npm run validate:tei`. Scope: all 15 poems × all five witnesses.\n\n'
    output += f'**{75-len(incomplete)} / 75 slots independently reviewed and structurally verified; {len(incomplete)} incomplete.** Human scholarly approval is not implied.\n\n'
    output += 'Represented verse positions may be wholly illegible; their count does not imply recovered wording. Individually unlocated positions and source-confirmed absent spans are distinguished below.\n\n'
    output += '| Poem | Witness | State | Represented verse positions | Absent positions | Unlocated positions | Editorial questions |\n| --- | --- | --- | ---: | ---: | ---: | ---: |\n' + '\n'.join(rows)
    output += '\n\n## Remaining editorial questions\n\n' + ('\n'.join(questions) or 'None. Image uncertainty remains documented in the reviewed TEI and ledgers.') + '\n'
    (ROOT / 'scripts/output/corpus-review-status.md').write_text(output)
    print(f'Corpus coverage: {75-len(incomplete)}/75 reviewed; {len(incomplete)} incomplete.')
    if args.require_complete and incomplete:
        raise SystemExit('Corpus incomplete: ' + ', '.join(incomplete))


if __name__ == '__main__':
    main()
