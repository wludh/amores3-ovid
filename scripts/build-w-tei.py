#!/usr/bin/env python3
"""Build an unreviewed W candidate from an image-checked first-pass source file."""
import argparse
import json
from pathlib import Path
import xml.etree.ElementTree as E

ROOT = Path(__file__).resolve().parents[1]
NS = 'http://www.tei-c.org/ns/1.0'
ID = '{http://www.w3.org/XML/1998/namespace}id'
E.register_namespace('', NS)


def tag(name):
    return f'{{{NS}}}{name}'


def add(parent, name, text=None, **attrs):
    child = E.SubElement(parent, tag(name), attrs)
    child.text = text
    return child


def indent_structure(element, depth=0):
    # Never insert formatting whitespace into a verse or other mixed content.
    if element.tag == tag('l') or (element.text or '').strip() or any((c.tail or '').strip() for c in element):
        return
    if len(element):
        element.text = '\n' + '  ' * (depth + 1)
        for child in element:
            indent_structure(child, depth + 1)
            child.tail = '\n' + '  ' * (depth + 1)
        element[-1].tail = '\n' + '  ' * depth


def build(poem):
    prefix = f'W-{poem}'
    source = ROOT / f'scripts/sources/tei/{prefix}-first-pass.txt'
    metadata = json.loads(source.with_suffix('.json').read_text())
    assert metadata.get('author_agent'), 'Record the actual source reader'
    assert metadata.get('source_pass_complete') is True, 'First reader must finish image correction before encoding'
    assert metadata.get('indentation_evidence') and 'indented_lines' in metadata
    assert not (ROOT / f'scripts/output/{prefix}-review.json').exists(), 'Do not regenerate a reviewed candidate'
    lines = [(int(row.split('\t', 1)[0]), row.split('\t', 1)[1]) for row in source.read_text().splitlines() if row.strip()]
    annotations = {int(a['lineId']): a for a in json.loads((ROOT / 'docs/data/annotations.json').read_text(encoding='utf-8-sig')) if a['witness'] == 'W' and a['poem'] == poem}
    assert {n for n, _ in lines} == set(annotations) and len(lines) == len(annotations), 'Complete, unique canonical coverage is required'
    assert set(metadata['indented_lines']) <= set(annotations)
    manifest = json.loads((ROOT / 'docs/data/iiif-manifests/witness-W.json').read_text())
    canvases = manifest['sequences'][0]['canvases']
    pages = sorted({a['page'] for a in annotations.values()})
    root = E.Element(tag('TEI'), {'n': 'W', ID: prefix})
    header = add(root, 'teiHeader', **{'{http://www.w3.org/XML/1998/namespace}lang': 'en'})
    file_desc = add(header, 'fileDesc')
    title = add(file_desc, 'titleStmt')
    add(title, 'title', f'Ovid, Amores {poem} — W, Wetstein 1751')
    add(title, 'author', 'Publius Ovidius Naso')
    resp = add(title, 'respStmt', **{ID: prefix + '-encoder'})
    add(resp, 'resp', 'First source-image reading and transcription')
    add(resp, 'name', 'OpenAI Codex ' + metadata['author_agent'])
    encoder = add(title, 'respStmt', **{ID: prefix + '-xml-encoder'})
    add(encoder, 'resp', 'TEI encoding of the source reader’s first-pass transcription')
    add(encoder, 'name', 'OpenAI Codex /root')
    publication = add(file_desc, 'publicationStmt')
    add(publication, 'p', 'Amores Project working transcription, 26 October 2026; independent source review pending.')
    source_desc = add(file_desc, 'sourceDesc')
    bibl = add(source_desc, 'bibl')
    add(bibl, 'author', 'P. Ovidius Naso')
    add(bibl, 'title', 'P. Ovidii Nasonis operum tomus primus')
    add(bibl, 'pubPlace', 'Amstelaedami')
    add(bibl, 'publisher', 'Apud J. Wetstenium')
    add(bibl, 'date', '1751', when='1751')
    add(bibl, 'biblScope', f'{pages[0]-44}–{pages[-1]-44}', unit='page', **{'from': str(pages[0]-44), 'to': str(pages[-1]-44)})
    add(bibl, 'ref', 'Washington and Lee University Special Collections, PA6519 .A2 1751, volume 1', target='https://digitalarchive.wlu.edu/islandora/p-ovidii-nasonis-operum-tomus-primus-volume-1')
    add(bibl, 'ref', 'Native IIIF source manifest', target='https://digitalarchive.wlu.edu/node/72383/manifest')
    add(bibl, 'note', f'One-based viewer images {pages[0]}–{pages[-1]}; printed page numbers are 44 lower. Archive page labels differ from both. The actual images, rather than another witness or uncorrected OCR, supply the readings.')
    editorial = add(add(header, 'encodingDesc'), 'editorialDecl')
    add(add(editorial, 'normalization'), 'p', 'Source spelling, capitalization, punctuation, written ampersands and visible accents are retained. Long s and typographic ligatures are represented by standard s and constituent letters. Letter spacing in display capitals and quotation glyph shapes may be represented schematically. No modern-edition readings are substituted.')
    add(add(editorial, 'segmentation'), 'p', 'Each l represents one canonical verse, with stable numbering and a link to its existing image region. Source verse order and headings are retained. Couplet grouping and canonical line numbers are editorial. A displaced word may remain within its verse with its position marked.')
    add(add(editorial, 'segmentation'), 'p', metadata['indentation_evidence'])
    add(add(editorial, 'correction'), 'p', 'Uncertain readings remain locally marked with unclear or gap. Observations and uncertainties are documented for a different source reader; ink colour alone does not establish erasure or a separate hand.')
    revision = add(header, 'revisionDesc', status='draft')
    add(revision, 'change', f'First reader inspected and transcribed all {len(lines)} verses from the source images; independent source review pending.', when='2026-10-26', who='#' + prefix + '-encoder')
    facsimile = add(root, 'facsimile')
    surfaces = {}
    for page in pages:
        canvas = canvases[page - 1]
        surface = add(facsimile, 'surface', **{ID: f'{prefix}-p{page-44}', 'n': str(page-44), 'ulx': '0', 'uly': '0', 'lrx': str(canvas['width']), 'lry': str(canvas['height'])})
        add(surface, 'graphic', url=canvas['images'][0]['resource']['@id'])
        surfaces[page] = surface
    for number, _ in lines:
        a = annotations[number]
        add(surfaces[a['page']], 'zone', **{ID: f'{prefix}-zone-{number}', 'ulx': str(a['x']), 'uly': str(a['y']), 'lrx': str(a['x']+a['width']), 'lry': str(a['y']+a['height'])})
    text = add(root, 'text', **{'{http://www.w3.org/XML/1998/namespace}lang': 'la'})
    div = add(add(text, 'body'), 'div', type='poem', n=poem, **{ID: prefix + '-poem'})
    group = None
    last_page = None
    for index, (number, content) in enumerate(lines):
        if index % 2 == 0:
            group = add(div, 'lg', type='couplet')
        page = annotations[number]['page']
        if page != last_page:
            add(group, 'pb', n=str(page-44), facs=f'#{prefix}-p{page-44}')
            last_page = page
            if str(page) in metadata.get('page_headers', {}):
                add(group, 'fw', metadata['page_headers'][str(page)], type='header', place='top')
            add(group, 'fw', str(page-44), type='pageNum', place='top')
        if str(number) in metadata.get('headings', {}):
            add(group, 'label', metadata['headings'][str(number)], type='source-heading')
        attrs = {'n': str(number), ID: f'{prefix}-l{number}', 'facs': f'#{prefix}-zone-{number}'}
        if number in metadata['indented_lines']:
            attrs['rend'] = 'indent'
        verse = E.fromstring(f'<l xmlns="{NS}">{content}</l>')
        verse.attrib.update(attrs)
        assert '\n' not in ''.join(verse.itertext()), 'No formatting newlines within verse mixed content'
        group.append(verse)
        for footer in metadata.get('footers', {}).get(str(number), []):
            add(group, 'fw', footer['text'], type=footer['type'], place=footer.get('place', 'bottom'))
    if metadata.get('notes'):
        note_div = add(add(text, 'back'), 'div', type='editorial-notes')
        add(note_div, 'head', 'Transcription notes')
        for index, note in enumerate(metadata['notes'], 1):
            assert note['line'] in annotations and note['type'] in {'observation', 'uncertainty', 'review'}
            assert note.get('evidence'), 'Every first-pass note needs precise source evidence'
            add(note_div, 'note', note['text'], **{ID: f'{prefix}-note-{index}', 'n': str(note['line']), 'type': note['type'], 'target': f'#{prefix}-l{note["line"]}', 'resp': '#' + prefix + '-encoder'})
    indent_structure(root)
    destination = ROOT / f'scripts/output/{prefix}.xml'
    destination.write_text('<?xml version="1.0" encoding="UTF-8"?>\n' + E.tostring(root, encoding='unicode') + '\n')
    print(destination)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('poem')
    build(parser.parse_args().poem)
