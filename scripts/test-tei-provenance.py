#!/usr/bin/env python3
"""Regression checks for the independently reviewed zone-correction boundary."""
import copy
import importlib.util
import json
from pathlib import Path
import unittest

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


if __name__ == '__main__':
    unittest.main()
