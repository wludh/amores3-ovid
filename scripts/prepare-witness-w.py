#!/usr/bin/env python3
"""Prepare W's image-region candidates from W&L hOCR, never a transcription.

Usage: python3 scripts/prepare-witness-w.py /path/to/downloaded-hocr
The input directory contains 171-hocr.html through 191-hocr.html and the
unmodified archive manifest as manifest.json. Indices are zero based.
Candidates require visual review before publication. LL is used solely to
identify canonical verse IDs, not to supply W's text.
"""
import difflib
import json
import re
import sys
import unicodedata
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CACHE = Path(sys.argv[1])
manifest = json.loads((CACHE / 'manifest.json').read_text())
canvases = manifest['sequences'][0]['canvases']
spans = [(171,172),(172,174),(174,175),(176,177),(177,178),
         (178,180),(180,182),(182,184),(184,185),(185,186),
         (186,187),(188,189),(189,189),(189,191),(191,191)]

def box(node):
    return list(map(int, re.search(r'bbox (\d+ \d+ \d+ \d+)', node.get('title')).group(1).split()))

def normalize(text):
    return re.sub('[^a-z]', '', unicodedata.normalize('NFD', text.lower())).replace('j','i').replace('v','u').replace('f','s')

pages = []
for index in range(171,192):
    canvas = canvases[index]
    rows = []
    for element in ET.parse(CACHE / f'{index:03}-hocr.html').iter():
        if element.get('class') not in {'ocr_line','ocr_header','ocr_textfloat','ocr_caption'}:
            continue
        words = [dict(text=''.join(w.itertext()), bbox=box(w)) for w in element if w.get('class') == 'ocrx_word']
        # Keep original text/geometry for provenance. Exclude isolated margin
        # numbers and gutter noise only from the proposed verse rectangle.
        selected = [w for w in words if re.search('[a-zA-Z&]',w['text'])
                    and w['bbox'][0] >= (550 if index % 2 else 10)]
        if not selected:
            continue
        bounds = [min(w['bbox'][0] for w in selected), min(w['bbox'][1] for w in selected),
                  max(w['bbox'][2] for w in selected), max(w['bbox'][3] for w in selected)]
        rows.append(dict(id=element.get('id'), text=' '.join(w['text'] for w in words),
                         bbox=box(element), text_bbox=bounds, words=words))
    pages.append(dict(page=index, label=canvas['label'], printed_page=index-43,
                      node_id=72384+index, width=canvas['width'], height=canvas['height'],
                      image=canvas['images'][0]['resource']['@id'],
                      hocr=canvas['seeAlso']['@id'], lines=rows))

source = dict(witness='W', manifest=manifest['@id'],
              source='https://digitalarchive.wlu.edu/islandora/p-ovidii-nasonis-operum-tomus-primus-volume-1',
              edition='Apud J. Wetstenium, Amstelaedami, 1751', pages=pages)
(ROOT/'scripts/sources/witness-W-ocr.json').write_text(json.dumps(source,ensure_ascii=False,indent=2)+'\n')
audit = []
for poem in ET.parse(ROOT/'docs/data/witness-LL.xml').getroot().findall('poem'):
    name = poem.get('n')
    start,end = spans[int(name.split('.')[1])-1]
    candidates = [(p,i,row,normalize(row['text'])) for p in pages if start <= p['page'] <= end
                  for i,row in enumerate(p['lines']) if len(normalize(row['text'])) > 10]
    for line in poem.findall('.//{*}l'):
        text = ''.join(line.itertext())
        normal = normalize(text)
        score,(page,i,row,_) = max((
            (difflib.SequenceMatcher(None,normal,c[-1]).ratio(),c) for c in candidates
        ),key=lambda pair:pair[0])
        x1,y1,x2,y2 = row['text_bbox']
        annotation = dict(panelId='viewer-panel',witness='W',lineId=line.get('n'),poem=name,
                          sourceWitness='LL',page=page['page']+1,x=max(0,x1-8),y=max(0,y1-5),
                          width=min(page['width'],x2+8)-max(0,x1-8),
                          height=min(page['height'],y2+5)-max(0,y1-5))
        audit.append(dict(poem=name,lineId=line.get('n'),page=page['page'],ocrIndex=i,
                          score=round(score,3),canonical=text,ocr=row['text'],annotation=annotation))
(ROOT/'scripts/output/W-alignment-first-pass.json').write_text(json.dumps(audit,ensure_ascii=False,indent=2)+'\n')
for row in audit:
    if row['score'] < .7:
        print(row['poem'],row['lineId'],row['page'],row['ocrIndex'],row['score'],row['ocr'])
print(f'{len(audit)} candidate regions. Visual review required.')
