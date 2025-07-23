# build_amores3_xml.py
import re, pathlib, textwrap, html

# ------------ configuration ------------
INPUT_FILE  = "amores3.txt"          # your plain–text source
OUTPUT_FILE = "amores3_LL.xml"       # the file you’ll upload
WITNESS_SIG = "LL"                   # <- change if needed
# ---------------------------------------

roman_re   = re.compile(r"^[IVXLCDM]+[ab]?$")  # I, II, XIa, etc.

def split_poems(lines):
    poems, current = [], []
    for ln in lines:
        ln = ln.rstrip()
        if roman_re.fullmatch(ln):
            if current: poems.append(current)
            current = []
        elif ln:                         # skip blank lines
            current.append(ln.lstrip())
    if current:
        poems.append(current)
    return poems

def build_couplets(lines):
    couplets, i = [], 1
    for l1, l2 in zip(lines[::2], lines[1::2]):
        couplets.append(
            f'    <lg type="couplet" n="{i}">\n'
            f'      <l n="{2*i-1}">{html.escape(l1)}</l>\n'
            f'      <l n="{2*i}" rend="indent">{html.escape(l2)}</l>\n'
            f'    </lg>'
        )
        i += 1
    if len(lines) % 2:                     # odd last line?
        last = html.escape(lines[-1])
        couplets.append(
            f'    <lg type="couplet" n="{i}">\n'
            f'      <l n="{2*i-1}">{last}</l>\n'
            f'    </lg>'
        )
    return "\n".join(couplets)

def header(n):
    return textwrap.dedent(f"""\
      <teiHeader>
        <fileDesc>
          <titleStmt>
            <title>Ovid, Amores {n}</title>
            <respStmt><resp>Encoded by</resp><name>ChatGPT (o3 model)</name></respStmt>
          </titleStmt>
          <publicationStmt><p>Public‑domain Latin text, TEI encoded for personal study.</p></publicationStmt>
          <sourceDesc><p>Source: The Latin Library.</p></sourceDesc>
        </fileDesc>
      </teiHeader>""")

# ---------- main ----------
raw_lines = pathlib.Path(INPUT_FILE).read_text(encoding="utf-8").splitlines()
poems = split_poems(raw_lines)

xml_poems = []
for idx, lines in enumerate(poems, start=1):
    poem_no = f"3.{idx}"
    tei_body = build_couplets(lines)
    tei_block = f"""  <poem n="{poem_no}"><TEI xmlns="http://www.tei-c.org/ns/1.0">
{header(poem_no)}
    <text><body>
{tei_body}
    </body></text>
  </TEI></poem>"""
    xml_poems.append(tei_block)

xml_out = f'''<?xml version="1.0" encoding="UTF-8"?>
<witness n="{WITNESS_SIG}">
{"\n".join(xml_poems)}
</witness>
'''

pathlib.Path(OUTPUT_FILE).write_text(xml_out, encoding="utf-8")
print(f"Wrote {OUTPUT_FILE} with {len(poems)} poems.")
