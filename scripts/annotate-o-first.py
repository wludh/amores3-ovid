#!/usr/bin/env python3
"""Map O 3.1–3.7 to verified OCR line rectangles, preserving LL identifiers."""
import json, re, difflib, xml.etree.ElementTree as ET
from pathlib import Path
root=Path(__file__).resolve().parents[1]
pages={page['page']:page for page in json.load(open(root/'scripts/sources/witness-O-ocr.json'))['pages']}
manifest=json.load(open(root/'docs/data/iiif-manifests/witness-O.json'))
# Inclusive OCR line-index ranges; indices exclude the running headers.
spans={
 '3.1':[(92,15,35),(93,1,37),(94,1,12)],
 '3.2':[(94,13,36),(95,1,37),(96,1,23)],
 '3.3':[(96,24,36),(97,1,35)],
 '3.4':[(98,1,37),(99,1,11)],
 '3.5':[(99,12,36),(100,1,21)],
 '3.6':[(100,22,36),(101,1,37),(102,1,37),(103,1,17)],
 '3.7':[(103,18,36),(104,1,37),(105,1,28)],
}
xml=ET.parse(root/'docs/data/witness-LL.xml').getroot()
normalize=lambda s: re.sub('[^a-z]','',s.lower()).replace('v','u').replace('j','i')
annotations=[]; audit=[]
for poem in xml.findall('poem'):
 name=poem.get('n')
 if name not in spans:continue
 canon=poem.findall('.//{*}l')
 entries=[(p,i,pages[p]['lines'][i]) for p,a,b in spans[name] for i in range(a,b+1)]
 ids=list(range(1,len(canon)+1))
 # O explicitly prints 47–48 before 43–46. Map by verse content, not position.
 if name=='3.1':ids[42:48]=[47,48,43,44,45,46]
 assert len(entries)==len(canon),(name,len(entries),len(canon))
 for n,(p,i,line) in zip(ids,entries):
  source=canon[n-1]; text=''.join(source.itertext())
  score=difflib.SequenceMatcher(None,normalize(text),normalize(line['text'])).ratio()
  assert score >= 0.75, (name,n,text,line['text'])
  assert pages[p]['width']==manifest['items'][p]['width']
  assert pages[p]['height']==manifest['items'][p]['height']
  x=max(0,line['x']-8);y=max(0,line['y']-7)
  w=min(pages[p]['width']-x,line['width']+16);h=min(pages[p]['height']-y,line['height']+14)
  annotations.append(dict(panelId='viewer-panel',witness='O',lineId=source.get('n'),poem=name,sourceWitness='LL',page=p+1,x=x,y=y,width=w,height=h))
  audit.append(dict(poem=name,lineId=n,page=p,ocrIndex=i,score=round(score,3),ll=text,ocr=line['text']))
assert len({(a['poem'],a['lineId']) for a in annotations}) == len(annotations) == 486
out=root/'scripts/output';out.mkdir(exist_ok=True)
(out/'annotations-O-3.1-3.7.json').write_text(json.dumps(annotations,ensure_ascii=False,indent=2)+'\n')
(out/'O-3.1-3.7-alignment-audit.json').write_text(json.dumps(audit,ensure_ascii=False,indent=2)+'\n')
for a in sorted(audit,key=lambda a:a['score'])[:30]: print(a)
print('TOTAL',len(annotations))
