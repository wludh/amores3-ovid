#!/usr/bin/env python3
"""Rebuild O's 3.8–3.15 image regions from reviewed OCR line ranges.

Input coordinates originate in the archive's DjVu XML and are in canvas pixels.
Ranges below were checked against complete OCR text and printed poem boundaries.
No guessed evenly-spaced regions and no modern-text substitutions are used.
"""
import difflib
import json
from pathlib import Path
import re
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'scripts/sources/witness-O-ocr.json'
# (canvas index, first OCR line index, final OCR line index), inclusive.
SPANS = {
    '3.8': [(105,29,36),(106,1,37),(107,1,21)],
    '3.9': [(107,22,36),(108,1,37),(109,1,16)],
    '3.10': [(109,17,36),(110,1,28)],
    '3.11': [(110,29,36),(111,1,36),(112,1,8)],
    '3.12': [(112,9,36),(113,1,16)],
    '3.13': [(113,17,36),(114,1,16)],
    '3.14': [(114,17,36),(115,1,30)],
    '3.15': [(115,31,36),(116,1,14)],
}

def normalize(text):
    return re.sub('[^a-z]', '', text.lower().replace('j','i').replace('v','u'))

def main():
    pages = {p['page']:p for p in json.loads(SOURCE.read_text())['pages']}
    poems = {p.attrib['n']:p.findall('.//{http://www.tei-c.org/ns/1.0}l')
             for p in ET.parse(ROOT / 'docs/data/witness-LL.xml').getroot().findall('poem')}
    manifest = json.loads((ROOT / 'docs/data/iiif-manifests/witness-O.json').read_text())
    annotations, evidence = [], []
    for poem, spans in SPANS.items():
        rows = [(page,i,pages[page]['lines'][i]) for page,start,end in spans for i in range(start,end+1)]
        assert len(rows) == len(poems[poem]), (poem, len(rows), len(poems[poem]))
        for canonical,(page,ocr_index,row) in zip(poems[poem], rows):
            text = ''.join(canonical.itertext()).strip()
            score = difflib.SequenceMatcher(None, normalize(text), normalize(row['text'])).ratio()
            assert score > .69, (poem, canonical.attrib['n'], score, row['text'], text)
            canvas = manifest['items'][page]
            assert (pages[page]['width'],pages[page]['height']) == (canvas['width'],canvas['height'])
            # Small padding protects ink edges while keeping adjacent lines separate.
            x, y = max(0,row['x']-5), max(0,row['y']-5)
            right = min(canvas['width'],row['x']+row['width']+5)
            bottom = min(canvas['height'],row['y']+row['height']+5)
            annotations.append(dict(panelId='viewer-panel',witness='O',lineId=canonical.attrib['n'],
                poem=poem,sourceWitness='LL',page=page+1,x=x,y=y,width=right-x,height=bottom-y))
            evidence.append((poem,canonical.attrib['n'],page,ocr_index,score,text,row['text']))
    out = ROOT / 'scripts/output'
    out.mkdir(exist_ok=True)
    (out / 'annotations-O-3.8-3.15.json').write_text(json.dumps(annotations,ensure_ascii=False,indent=2)+'\n')
    report = '''# Witness O: Amores 3.8–3.15 image-region review

Source: Internet Archive `operaovid03oviduoft`, printed Tom. I, Teubner 1888; image
canvas indices in this report are zero based; exported annotation pages are one based. Coordinates come from actual OCR LINE rectangles,
with five pixels padding on each side. OCR and manifest dimensions are asserted
equal for every region. This work maps image regions; it does not transcribe a new
critical text or create interpretive annotations.

All 384 canonical LL lines in the assigned eight poems are present and mapped.
Full OCR text was read in sequence against LL; none of these poems needs a
transposition or omitted-line placeholder. Starts: 3.8=105, 3.9=107, 3.10=109,
3.11=110, 3.12=112, 3.13=113, 3.14=114, 3.15=115.

Visual checks used the manifest image services for canvases 106, 108, 110 and
111; printed variants and the XIb boundary were confirmed against the scans.

## Editorial and OCR differences checked

- O marks 3.11.33 as the start of **XIb**, also preserving continuous numbering
  (35, 40, etc.) at the left. LL's 3.11.33–52 map to this printed second part;
  they are not omitted or renumbered in the application. Page 111 was visually
  inspected to verify the dual numbering and exact line positions.
- O brackets 3.8.51–52, 3.10.45–46, and 3.14.39–40. These are printed lines
  and all remain mapped.
- At 3.8.28, O reads “Hoc tibi, si velles, posset, Homere, dari.”, whereas LL
  has “nox tibi, si belles, possit, Homere, dari.” Both occupy the same verse
  position; similarity is lower but this is a valid correspondence.
- At 3.9.29, O reads “Durat, opus vatum” versus LL “durant, vatis opus”.
- At 3.10.39, O reads “Ipse locus nemorum ... Idae” versus LL
  “ipsa, locus nemorum ... Ide”. At 3.10.42, O has “Optavit” versus “optasset”.
- O's 3.11.19 “cantata”, 3.11.32 “sum”, and 3.11.52 “quamvis” differ from
  LL's “comitata”, “nunc”, and “quam, si”; printed correspondence is retained.
- OCR errors are retained below as evidence, not introduced into the LL text.

## Complete alignment evidence

Each row gives canonical line, zero-based canvas and OCR line index, normalized
text similarity, canonical text and raw source OCR. Similarity only validates the
explicitly reviewed sequential ranges; it does not select a different verse.

| Poem.line | Canvas | OCR row | Similarity | LL text | O OCR |
|---|---:|---:|---:|---|---|
'''
    for poem,line,page,index,score,canonical,ocr in evidence:
        report += f'| {poem}.{line} | {page} | {index} | {score:.3f} | {canonical.replace(chr(124),"/")} | {ocr.replace(chr(124),"/")} |\n'
    (out / 'O-3.8-3.15-review.md').write_text(report)
    print(f'Wrote {len(annotations)} annotations; minimum normalized similarity {min(r[4] for r in evidence):.3f}')
    for r in sorted(evidence,key=lambda r:r[4])[:8]: print(r)

if __name__ == '__main__':
    main()
