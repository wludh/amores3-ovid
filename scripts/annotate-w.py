#!/usr/bin/env python3
"""Rebuild reviewed W image annotations without changing the published dataset."""
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ledger = json.loads((ROOT/'scripts/output/W-image-review.json').read_text())
assert ledger['scope'] == 'image-regions-only'
for item in ledger['sources']:
    assert hashlib.sha256((ROOT/item['path']).read_bytes()).hexdigest() == item['sha256'], item['path']
manifest = json.loads((ROOT/'docs/data/iiif-manifests/witness-W.json').read_text())
canvases = manifest['sequences'][0]['canvases']
annotations = []
for review in ledger['reviews']:
    assert review['reviewer'] != ledger['first_reader']
    for key in ['fragment', 'report']:
        assert hashlib.sha256((ROOT/review[key]).read_bytes()).hexdigest() == review[key+'_sha256'], review[key]
    annotations.extend(row['annotation'] for row in json.loads((ROOT/review['fragment']).read_text()))
assert len(annotations) == len({(a['poem'],a['lineId']) for a in annotations}) == 870
for a in annotations:
    c = canvases[a['page']-1]
    assert a['witness'] == 'W' and a['x'] >= 0 and a['y'] >= 0
    assert a['width'] > 0 and a['height'] > 0
    assert a['x']+a['width'] <= c['width'] and a['y']+a['height'] <= c['height']
digest = hashlib.sha256(json.dumps(annotations,separators=(',',':')).encode()).hexdigest()
assert digest == ledger['annotations_sha256'], 'Regions changed since source review'
(ROOT/'scripts/output/annotations-W.json').write_text(json.dumps(annotations,indent=2)+'\n')
print('Rebuilt 870 source-reviewed W annotations; published dataset unchanged.')
