#!/usr/bin/env python3
"""Build a FIRST-PASS O candidate only from an image-checked, numbered transcription."""
from pathlib import Path
import json,xml.etree.ElementTree as E,sys
ROOT=Path(__file__).resolve().parents[1];N='http://www.tei-c.org/ns/1.0';X='{http://www.w3.org/XML/1998/namespace}id';E.register_namespace('',N)
def t(name):return '{%s}%s'%(N,name)
poem=sys.argv[1];out=ROOT/f'scripts/output/O-{poem}.xml'
assert not (ROOT/f'scripts/output/O-{poem}-review.json').exists(),'Reviewed candidate must not be regenerated'
source=ROOT/f'scripts/sources/tei/O-{poem}-first-pass.txt';lines=[(int(s.split('\t',1)[0]),s.split('\t',1)[1]) for s in source.read_text().splitlines() if s.strip()]
metadata_path=source.with_suffix('.json');metadata=json.loads(metadata_path.read_text()) if metadata_path.exists() else {}
a={int(a['lineId']):a for a in json.load(open(ROOT/'docs/data/annotations.json',encoding='utf-8-sig')) if a.get('witness')=='O' and a.get('poem')==poem};m=json.load(open(ROOT/'docs/data/iiif-manifests/witness-O.json'));pages=sorted({a[n]['page'] for n,_ in lines});printed={p:p-48 for p in pages}
assert set(a)=={n for n,_ in lines};r=E.Element(t('TEI'),{'n':'O',X:'O-'+poem})
r.append(E.fromstring(f'''<teiHeader xmlns="{N}" xml:lang="en"><fileDesc><titleStmt><title>Ovid, Amores {poem} — O, Teubner 1888</title><author>Publius Ovidius Naso</author><respStmt xml:id="O-{poem}-encoder"><resp>First source-image reading and TEI encoding</resp><name>OpenAI Codex primary agent</name></respStmt></titleStmt><publicationStmt><p>Amores Project working transcription, September 2026; independent source review pending.</p></publicationStmt><sourceDesc><bibl><author>P. Ovidius Naso</author><title>Amores</title><editor>R. Ehwald</editor><respStmt><resp>Recension</resp><name>R. Merkel</name></respStmt><pubPlace>Lipsiae</pubPlace><publisher>B. G. Teubner</publisher><date when="1888">1888</date><biblScope unit="page" from="{printed[pages[0]]}" to="{printed[pages[-1]]}">{printed[pages[0]]}–{printed[pages[-1]]}</biblScope><ref target="https://archive.org/details/operaovid03oviduoft">Internet Archive scan operaovid03oviduoft</ref><note>The scanned title identifies Tom. I despite the archive catalogue volume label. One-based viewer pages {pages[0]}–{pages[-1]} have been inspected; source links are recorded in the facsimile.</note></bibl></sourceDesc></fileDesc><encodingDesc><editorialDecl><normalization><p>Source wording, capitalization, contracted forms and punctuation retained. Typographic ligatures use constituent letters; quotation marks are represented schematically by curly quotes. OCR locates text but does not determine readings.</p></normalization><segmentation><p>Each l corresponds to a printed verse; n preserves the corpus verse identifier. Verses follow the source order, including any transposed couplets, rather than being silently reordered. Each line links to its existing annotation rectangle. Page breaks may occur within couplets. Source headings and running titles are encoded separately.</p></segmentation><correction><p>Source readings are not silently replaced by a modern edition. Distinctive features are explained in notes for independent checking.</p></correction></editorialDecl></encodingDesc><revisionDesc status="draft"><change when="2026-09-09" who="#O-{poem}-encoder">Read all {len(lines)} verses from enlarged source images and prepared first-pass encoding.</change></revisionDesc></teiHeader>'''))
f=E.SubElement(r,t('facsimile'));surfaces={}
for p in pages:
 c=m['items'][p-1];s=E.SubElement(f,t('surface'),{X:f'O-{poem}-p{printed[p]}','n':str(printed[p]),'ulx':'0','uly':'0','lrx':str(c['width']),'lry':str(c['height'])});surfaces[p]=s;E.SubElement(s,t('graphic'),{'url':c['items'][0]['items'][0]['body']['id']})
for n,_ in lines:
 z=a[n];E.SubElement(surfaces[z['page']],t('zone'),{X:f'O-{poem}-zone-{n}','ulx':str(z['x']),'uly':str(z['y']),'lrx':str(z['x']+z['width']),'lry':str(z['y']+z['height'])})
text=E.SubElement(r,t('text'),{'{http://www.w3.org/XML/1998/namespace}lang':'la'});body=E.SubElement(text,t('body'));d=E.SubElement(body,t('div'),{'type':'poem','n':poem,X:f'O-{poem}-poem'});lastpage=None;lg=None
for n,content in lines:
 p=a[n]['page']
 if n%2:lg=E.SubElement(d,t('lg'),{'type':'couplet',**({'subtype':'transposed'} if poem=='3.1' and n==47 else {})})
 if p!=lastpage:
  E.SubElement(lg,t('pb'),{'n':str(printed[p]),'facs':f'#O-{poem}-p{printed[p]}'});lastpage=p
  if str(p) in metadata.get('page_headers',{}):
   E.SubElement(lg,t('fw'),{'type':'header','place':'top'}).text=metadata['page_headers'][str(p)]
   E.SubElement(lg,t('fw'),{'type':'pageNum','place':'top'}).text=str(printed[p])
 if str(n) in metadata.get('headings',{}):E.SubElement(lg,t('label'),{'type':'source-heading'}).text=metadata['headings'][str(n)]
 if poem=='3.1':
  if n==1:E.SubElement(lg,t('fw'),{'type':'header','place':'top'}).text='II, XVIIII, 11 — III, I, 21.';E.SubElement(lg,t('fw'),{'type':'pageNum','place':'top'}).text='45';E.SubElement(lg,t('label'),{'type':'source-heading'}).text='LIBER TERTIUS. I.'
  if n==22:E.SubElement(lg,t('fw'),{'type':'header','place':'top'}).text='AMORUM';E.SubElement(lg,t('fw'),{'type':'pageNum','place':'top'}).text='46'
  if n==59:E.SubElement(lg,t('fw'),{'type':'header','place':'top'}).text='III, I, 22 — II, 24.';E.SubElement(lg,t('fw'),{'type':'pageNum','place':'top'}).text='47'
 attrs={'n':str(n),X:f'O-{poem}-l{n}','facs':f'#O-{poem}-zone-{n}'}
 if n%2==0:attrs['rend']='indent'
 E.SubElement(lg,t('l'),attrs).text=content
 for footer in metadata.get('footers',{}).get(str(n),[]):E.SubElement(lg,t('fw'),{'type':footer['type'],'place':'bottom'}).text=footer['text']
if poem=='3.1' or metadata.get('notes'):
 b=E.SubElement(text,t('back'));nd=E.SubElement(b,t('div'),{'type':'editorial-notes'});E.SubElement(nd,t('head')).text='Transcription notes'
 observations=metadata.get('notes') or {2:'The printed contraction Credibilest is retained without expansion.',7:'The source reads Elegeia, with the extra e, rather than the modern spelling Elegia.',26:'The contraction meost is printed and retained.',47:'The printed edition places canonical verses 47–48 after 42 and before 43–46, with printed numbers marking the order. The TEI preserves this source sequence and stable canonical identifiers; this does not assert a manuscript correction.',53:'The printed reading is Vel quotiens ... inlisa, not the Latin Library a quotiens ... infixa.',56:'The image prints missam, not miseram. No replacement from another edition is made.',68:'The source contraction brevest is retained.'}
 for n,s in observations.items():E.SubElement(nd,t('note'),{X:f'O-{poem}-note-{n}','n':str(n),'type':'observation','target':f'#O-{poem}-l{n}'}).text=s
E.indent(r,space='  ');out.write_text('<?xml version="1.0" encoding="UTF-8"?>\n'+E.tostring(r,encoding='unicode')+'\n');print(out)
