from pathlib import Path
from html.parser import HTMLParser
import xml.etree.ElementTree as E
import json,hashlib,re
ROOT=Path(__file__).resolve().parents[1];N='http://www.tei-c.org/ns/1.0';X='{http://www.w3.org/XML/1998/namespace}id';E.register_namespace('',N)
roman=['I','II','III','IV','V','VI','VII','VIII','IX','X','XIa','XIb','XII','XIII','XIV','XV'];mapping={s:'3.'+str(i if i<12 else i-1) for i,s in enumerate(roman,1)};mapping['XIb']='3.11'
class Source(HTMLParser):
 def __init__(self):super().__init__();self.heading=False;self.buffer='';self.poem=None;self.lines={}
 def flush(self):
  s=' '.join(self.buffer.split());self.buffer=''
  if self.poem and s:self.lines.setdefault(self.poem,[]).append(s)
 def handle_starttag(self,tag,attrs):
  if tag=='b':self.heading=True;self.flush()
  elif tag=='br':self.flush()
 def handle_endtag(self,tag):
  if tag=='b':self.heading=False
  elif tag=='p':self.flush()
 def handle_data(self,s):
  if self.heading:
   self.poem=mapping.get(s.strip());return
  if self.poem:self.buffer+=s
source=ROOT/'scripts/sources/tei/latinlibrary-amores3-2026-09-09.html';p=Source();p.feed(source.read_text());p.flush()
old=E.parse(ROOT/'docs/data/witness-LL.xml');out=ROOT/'scripts/output';diff=[]
for poem in old.getroot():
 name=poem.get('n');lines=list(poem.iter('{%s}l'%N));src=p.lines[name][:len(lines)];assert len(src)==len(lines),(name,len(src),len(lines));previous=[' '.join(''.join(l.itertext()).split()) for l in lines];delta=[{'line':i,'old':a,'source':b} for i,(a,b) in enumerate(zip(previous,src),1) if a!=b];diff.append({'poem':name,'count':len(src),'differences':delta})
 if name=='3.7' or (out/f'LL-{name}-review.json').exists():continue
 r=E.Element('{%s}TEI'%N,{'n':'LL',X:'LL-'+name});h=E.fromstring(f'''<teiHeader xmlns="{N}" xml:lang="en"><fileDesc><titleStmt><title>Ovid, Amores {name} — The Latin Library</title><author>Publius Ovidius Naso</author><respStmt xml:id="LL-{name}-encoder"><resp>Source collation and first-pass TEI encoding</resp><name>OpenAI Codex primary agent</name></respStmt></titleStmt><publicationStmt><p>Amores Project working transcription; not a human-approved critical edition.</p></publicationStmt><sourceDesc><bibl><title>The Latin Library: Ovid, Amores III</title><ref target="https://www.thelatinlibrary.com/ovid/ovid.amor3.shtml">Source web text</ref><date when="2026-09-09">Accessed 9 September 2026</date></bibl></sourceDesc></fileDesc><encodingDesc><editorialDecl><p>Wording, capitalization and punctuation follow the source webpage. HTML entities are decoded and HTML whitespace normalized; couplets and line numbers are editorial. This web text does not carry invented manuscript features or facsimile zones. The site's XIa and XIb are treated as continuous Amores 3.11, while preserving the source division explicitly. Independent source review is pending.</p></editorialDecl></encodingDesc><revisionDesc status="draft"><change when="2026-09-09" who="#LL-{name}-encoder">Collated all {len(src)} verses against a fresh source retrieval and encoded first pass for independent review.</change></revisionDesc></teiHeader>''');r.append(h);text=E.SubElement(r,'{%s}text'%N,{'{http://www.w3.org/XML/1998/namespace}lang':'la'});body=E.SubElement(text,'{%s}body'%N);division=E.SubElement(body,'{%s}div'%N,{'type':'poem','n':name,X:'LL-'+name+'-poem'})
 for i,s in enumerate(src,1):
  if i%2==1:
   if name=='3.11' and i in (1,33):
    section=E.SubElement(division,'{%s}div'%N,{'type':'section','n':'XIa' if i==1 else 'XIb'})
    E.SubElement(section,'{%s}head'%N).text='XIa' if i==1 else 'XIb'
   lg=E.SubElement(section if name=='3.11' else division,'{%s}lg'%N,{'type':'couplet'})
  attrs={'n':str(i),X:f'LL-{name}-l{i}'}
  if i%2==0:attrs['rend']='indent'
  E.SubElement(lg,'{%s}l'%N,attrs).text=s
 E.indent(r,space='  ');(out/f'LL-{name}.xml').write_text('<?xml version="1.0" encoding="UTF-8"?>\n'+E.tostring(r,encoding='unicode')+'\n')
 (out/f'LL-{name}-encoding.md').write_text(f'# LL {name} first pass\n\nAll {len(src)} lines collated against https://www.thelatinlibrary.com/ovid/ovid.amor3.shtml retrieved 2026-09-09. Source snapshot: scripts/sources/tei/latinlibrary-amores3-2026-09-09.html (SHA256 {hashlib.sha256(source.read_bytes()).hexdigest()}). HTML entities decoded and whitespace normalized. {len(delta)} differences from previous local text; see LL-corpus-first-pass-comparison.json. No source-image or independent-review claim is made for this web-text pass.\n')
(out/'LL-corpus-first-pass-comparison.json').write_text(json.dumps(diff,ensure_ascii=False,indent=2)+'\n');print(json.dumps(diff,ensure_ascii=False,indent=2))
