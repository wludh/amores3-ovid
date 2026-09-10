#!/usr/bin/env python3
"""Regression checks for the independently reviewed zone-correction boundary."""
import copy
import importlib.util
import json
from pathlib import Path
import unittest
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('validation', ROOT / 'scripts/validate-tei.py')
validation = importlib.util.module_from_spec(spec)
spec.loader.exec_module(validation)


class ZoneProvenanceTests(unittest.TestCase):
    def setUp(self):
        self.root = validation.select_tei(ROOT / 'docs/data/tei/Y/3.1.xml', '3.1')
        self.ledger = json.loads((ROOT / 'scripts/output/Y-3.1-review.json').read_text())

    def check(self):
        ids = {e.get(validation.ID): e for e in self.root.iter() if e.get(validation.ID)}
        lines = list(self.root.iter('{%s}l' % validation.NS))
        return validation.verify_image_provenance(self.root, 'Y', '3.1', lines, ids, self.ledger)

    def test_reviewed_correction_retains_original_and_exports_verified_target(self):
        result = self.check()
        self.assertEqual(result[0]['lineId'], '67')
        self.assertEqual(result[0]['original']['y'], 536)
        self.assertEqual(result[0]['corrected']['y'], 265)

    def test_unreviewed_changed_rectangle_is_rejected(self):
        self.ledger.pop('zone_corrections')
        with self.assertRaisesRegex(AssertionError, 'original annotation'):
            self.check()

    def test_changed_original_provenance_is_rejected(self):
        original = next(e for e in self.root.iter() if e.get(validation.ID) == 'Y-3.1-zone-67')
        original.set('uly', '530')
        with self.assertRaisesRegex(AssertionError, 'reviewed bounds'):
            self.check()

    def test_wrong_corrected_image_is_rejected(self):
        self.ledger['zone_corrections'][0]['source_graphic'] = 'https://example.invalid/wrong.jpg'
        with self.assertRaisesRegex(AssertionError, 'image differs'):
            self.check()


class SurfaceProvenanceTests(unittest.TestCase):
    """Synthetic extra alignment position exercises page-only provenance gates."""
    def setUp(self):
        ZoneProvenanceTests.setUp(self)
        tag = lambda name: '{%s}%s' % (validation.NS, name)
        self.group = next(self.root.iter(tag('lg')))
        surface = next(self.root.iter(tag('surface')))
        graphic = surface.find(tag('graphic')).get('url')
        self.line = ET.SubElement(self.group, tag('l'), {'n': '71', validation.ID: 'test-unlocated-71', 'facs': '#' + surface.get(validation.ID)})
        gap = ET.SubElement(self.line, tag('gap'), {'reason': 'illegible', 'unit': 'line', 'quantity': '1'})
        ET.SubElement(gap, tag('desc')).text = 'Synthetic test: individual verse location is unverified.'
        self.note = ET.SubElement(next(self.root.iter(tag('back'))), tag('note'), {validation.ID: 'test-unlocated-note', 'type': 'uncertainty', 'target': '#test-unlocated-71'})
        self.note.text = 'Synthetic source-location uncertainty.'
        manifest = json.loads((ROOT / 'docs/data/iiif-manifests/witness-Y.json').read_text())
        canvases = manifest.get('items') or manifest['sequences'][0]['canvases']
        def image(canvas):
            resource = canvas['images'][0]['resource'] if 'images' in canvas else canvas['items'][0]['items'][0]['body']
            return validation.image_identity(resource.get('id') or resource['@id'])
        page = next(i + 1 for i, canvas in enumerate(canvases) if image(canvas) == validation.image_identity(graphic))
        self.entry = {'line': 71, 'target': 'test-unlocated-71', 'facs': self.line.get('facs'), 'status': 'illegible_unlocated', 'evidence': 'Independent source-location assessment for synthetic test.', 'note_id': 'test-unlocated-note', 'source_graphic': graphic, 'viewer_page': page}
        self.ledger['unlocated_lines'] = [self.entry]

    def check(self):
        return ZoneProvenanceTests.check(self)

    def test_verified_surface_exports_only_a_page_without_rectangle(self):
        self.check()
        result = validation.surface_navigation_from_ledger(self.ledger)
        self.assertEqual(result, [{'lineId': '71', 'page': self.entry['viewer_page']}])

    def test_surface_without_review_is_rejected(self):
        self.ledger.pop('unlocated_lines')
        with self.assertRaisesRegex(AssertionError, 'require independent unlocated evidence'):
            self.check()

    def test_readable_text_cannot_be_supplied_in_an_unlocated_position(self):
        self.line.text = 'Invented words'
        with self.assertRaisesRegex(AssertionError, 'cannot supply readable verse text'):
            self.check()

    def test_wrong_surface_image_is_rejected(self):
        self.entry['source_graphic'] = 'https://example.invalid/wrong.jpg'
        with self.assertRaisesRegex(AssertionError, 'source image differs'):
            self.check()

    def test_wrong_page_is_rejected(self):
        self.entry['viewer_page'] += 1
        with self.assertRaisesRegex(AssertionError, 'page differs from manifest'):
            self.check()

    def test_missing_uncertainty_note_is_rejected(self):
        self.entry['note_id'] = 'missing'
        with self.assertRaisesRegex(AssertionError, 'targeted uncertainty note'):
            self.check()

    def test_surface_cannot_bypass_an_existing_original_rectangle(self):
        self.group.remove(self.line)
        line = next(self.root.iter('{%s}l' % validation.NS))
        number, xml_id = line.get('n'), line.get(validation.ID)
        line.clear()
        line.attrib.update(self.line.attrib, n=number)
        line.set(validation.ID, xml_id)
        line.append(copy.deepcopy(list(self.line)[0]))
        self.entry.update(line=int(number), target=xml_id)
        self.note.set('target', '#' + xml_id)
        with self.assertRaisesRegex(AssertionError, 'cannot bypass original annotation provenance'):
            self.check()


class PreservedEvidenceTests(unittest.TestCase):
    def setUp(self):
        self.poem = '3.15'
        self.root = validation.select_tei(ROOT / 'docs/data/tei/P/3.15.xml', self.poem)
        self.ledger = json.loads((ROOT / 'scripts/output/P-3.15-review.json').read_text())

    def check(self):
        ids = {e.get(validation.ID): e for e in self.root.iter() if e.get(validation.ID)}
        return validation.verify_image_provenance(self.root, 'P', self.poem,
            list(self.root.iter('{%s}l' % validation.NS)), ids, self.ledger)

    def test_repeated_unused_original_rectangles_are_preserved(self):
        self.assertEqual(self.check(), [])

    def test_changed_unused_original_rectangle_is_rejected(self):
        zone = next(e for e in self.root.iter() if e.get(validation.ID) == 'P-3.15-zone-9')
        zone.set('uly', str(float(zone.get('uly')) + 1))
        with self.assertRaisesRegex(AssertionError, 'Unused zone 9'):
            self.check()

    def test_deleted_unused_original_rectangle_is_rejected(self):
        for parent in self.root.iter():
            for child in list(parent):
                if child.get(validation.ID) == 'P-3.15-zone-9':
                    parent.remove(child)
        with self.assertRaisesRegex(AssertionError, 'Missing preserved original'):
            self.check()

    def test_gap_only_source_image_must_belong_to_witness_manifest(self):
        self.poem = '3.13'
        self.root = validation.select_tei(ROOT / 'docs/data/tei/P/3.13.xml', self.poem)
        self.ledger = json.loads((ROOT / 'scripts/output/P-3.13-review.json').read_text())
        self.check()
        next(self.root.iter('{%s}graphic' % validation.NS)).set('url', 'https://example.invalid/false-source.jpg')
        with self.assertRaisesRegex(AssertionError, 'Evidence surface image'):
            self.check()


class AbsentSpanTests(unittest.TestCase):
    def setUp(self):
        self.root = validation.select_tei(ROOT / 'docs/data/tei/P/3.14.xml', '3.14')
        self.ledger = json.loads((ROOT / 'scripts/output/P-3.14-review.json').read_text())
        self.gap = next(g for g in self.root.iter('{%s}gap' % validation.NS) if g.get('reason') == 'not-transmitted')
        self.absent = {1, 2}

    def check(self):
        validation.verify_absent_spans(self.root, list(self.root.iter('{%s}l' % validation.NS)), set(range(1, 51)), self.absent, self.ledger)

    def test_opening_absence_matches_the_first_surviving_verse(self):
        self.check()

    def test_wrong_label_with_unchanged_quantity_is_rejected(self):
        self.gap.set('n', '51–52')
        with self.assertRaisesRegex(AssertionError, 'source position'):
            self.check()

    def test_moved_gap_with_unchanged_quantity_is_rejected(self):
        parent = next(p for p in self.root.iter() if self.gap in list(p))
        parent.remove(self.gap)
        parent.append(self.gap)
        with self.assertRaisesRegex(AssertionError, 'canonical absence inventory'):
            self.check()

    def test_overlapping_gaps_with_unchanged_total_are_rejected(self):
        parent = next(p for p in self.root.iter() if self.gap in list(p))
        self.gap.set('quantity', '1')
        parent.insert(list(parent).index(self.gap), copy.deepcopy(self.gap))
        with self.assertRaisesRegex(AssertionError, 'Overlapping absent spans'):
            self.check()

    def test_unlisted_absence_is_rejected(self):
        self.absent = set()
        with self.assertRaisesRegex(AssertionError, 'canonical absence inventory'):
            self.check()


if __name__ == '__main__':
    unittest.main()
