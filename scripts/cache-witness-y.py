#!/usr/bin/env python3
"""Mirror the public-domain Y facsimiles sequentially; resume verified downloads."""
import hashlib
import io
import json
import time
import urllib.error
import urllib.request
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'docs/data/facsimiles/Y'
MANIFEST = ROOT / 'docs/data/iiif-manifests/witness-Y.json'


def validate(data, canvas):
    with Image.open(io.BytesIO(data)) as image:
        assert image.format == 'JPEG', 'Expected JPEG'
        assert image.size == (canvas['width'], canvas['height']), 'Source dimensions changed'
        image.load()  # Decode the complete file; reject truncated/corrupt JPEGs.


def main():
    manifest = json.loads(MANIFEST.read_text())
    assert any(x.get('label') == 'Lizenz' and x.get('value') == 'Public Domain Mark 1.0'
               for x in manifest['metadata'])
    OUT.mkdir(parents=True, exist_ok=True)
    records = []
    for page, canvas in enumerate(manifest['sequences'][0]['canvases'], 1):
        source = canvas['images'][0]['resource']['@id']
        path = OUT / f'{page:04d}.jpg'
        data = path.read_bytes() if path.exists() else None
        if data is not None:
            validate(data, canvas)
        else:
            for attempt in range(5):
                try:
                    request = urllib.request.Request(source, headers={
                        'User-Agent': 'AmoresProject-FacsimileBackup/1.0 (https://github.com/wludh/amores3-ovid)'
                    })
                    with urllib.request.urlopen(request, timeout=40) as response:
                        data = response.read()
                    validate(data, canvas)
                    temp = path.with_suffix('.part')
                    temp.write_bytes(data)
                    temp.replace(path)
                    break
                except (OSError, AssertionError) as error:
                    if attempt == 4:
                        raise
                    delay = 15 * (attempt + 1)
                    if isinstance(error, urllib.error.HTTPError):
                        retry_after = error.headers.get('Retry-After', '')
                        if retry_after.isdigit():
                            delay = max(delay, int(retry_after))
                    print(f'Page {page}: {error}; retry in {delay}s', flush=True)
                    time.sleep(delay)
            time.sleep(1)
        records.append({'page': page, 'label': canvas['label'], 'source': source,
                        'file': path.name, 'width': canvas['width'], 'height': canvas['height'],
                        'bytes': len(data), 'sha256': hashlib.sha256(data).hexdigest()})
        print(f'{page}/151 verified ({len(data):,} bytes)', flush=True)
    index = {'witness': 'Y', 'shelfmark': 'Ms. Ham. 471',
             'provider': 'Staatsbibliothek zu Berlin – Preußischer Kulturbesitz',
             'sourceManifest': manifest['@id'],
             'sourceRecord': 'https://resolver.staatsbibliothek-berlin.de/SBB00034ABB00000000',
             'rights': 'https://creativecommons.org/publicdomain/mark/1.0/',
             'description': 'Unmodified full-resolution library JPEGs, retained as an availability fallback.',
             'images': records}
    (OUT / 'index.json').write_text(json.dumps(index, indent=2, ensure_ascii=False) + '\n')
    print(f'Complete: {sum(x["bytes"] for x in records):,} bytes', flush=True)


if __name__ == '__main__':
    main()
