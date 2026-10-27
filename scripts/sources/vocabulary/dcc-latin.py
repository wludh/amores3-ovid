#!/usr/bin/env python3
"""Build the bundled DCC list from its downloaded CSV, without changing rankings."""
import csv
import hashlib
import json
from pathlib import Path
import re
import unicodedata

ROOT = Path(__file__).resolve().parents[3]
SOURCE = Path(__file__).with_suffix('.csv')
DESTINATION = ROOT / 'docs/data/latin-frequency.json'


def normalize(value):
    return ''.join(c for c in unicodedata.normalize('NFD', value.lower()) if not unicodedata.combining(c))


# Only equivalent forms explicitly grouped in a DCC headword are aliases here.
# Principal parts, grammatical endings and inflections are not lemma aliases.
ALIASES = {
    'a': ['ab', 'abs'], 'deinde': ['dein'], 'ex': ['e'],
    'forsitan': ['fortasse'], 'nisi': ['ni'], 'nihil': ['nil'],
    'paulo': ['paulum'], 'satis': ['sat'], 'tantum': ['tantummodo'], 'ut': ['uti']
}

entries = []
for row in csv.DictReader(SOURCE.open(encoding='utf-8')):
    headword = row['Headword']
    lemma = normalize(re.split(r'[\s,/:]', headword)[0])
    rank = int(row['Frequency Rank'])
    entries.append({
        'id': f'dcc-{lemma}-{rank}',
        'lemma': lemma,
        'keys': [lemma, *ALIASES.get(lemma, [])],
        'headword': headword,
        'definition': row['Definition'],
        'rank': rank,
        'partOfSpeech': row['Part of Speech']
    })

payload = {
    'version': 1,
    'source': {
        'title': 'Dickinson College Commentaries — Latin Core Vocabulary',
        'url': 'https://dcc.dickinson.edu/latin-core-list1',
        'downloadUrl': 'https://dcc.dickinson.edu/latin-core-list.csv?page&_format=csv',
        'methodologyUrl': 'https://dcc.dickinson.edu/vocab/core-vocabulary',
        'attribution': 'Dickinson College Commentaries, Christopher Francese and the Dickinson College core-vocabulary team (2012–13; current online list).',
        'license': {'name': 'CC BY-SA 3.0', 'url': 'https://creativecommons.org/licenses/by-sa/3.0/'},
        'retrieved': '2026-10-26',
        'csvSha256': hashlib.sha256(SOURCE.read_bytes()).hexdigest(),
        'entries': len(entries),
        'rankBasis': 'DCC frequency rankings derived from the LASLA Dictionnaire fréquentiel et index inverse de la langue latine (1981). Lower numbers indicate more common words within the list.',
        'scope': 'The current DCC core-list export contains 997 entries. Unlisted words have no measured rank in this dataset; omission is not a precise rarity estimate.',
        'sourceAnomalies': 'Preserved exactly: rank 12 is absent; quisquam and vero both have rank 280; maximum published rank is 997.',
        'adaptation': 'Converted CSV to JSON, added stable IDs and macronless lowercase lemma keys, and added aliases explicitly present in DCC headwords. Definitions and published ranks are unchanged. This adapted dataset is distributed under CC BY-SA 3.0.'
    },
    'entries': entries
}
assert len(entries) == 997
assert len({entry['id'] for entry in entries}) == len(entries)
DESTINATION.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(f'Wrote {len(entries)} DCC entries to {DESTINATION}')
