#!/usr/bin/env python3
"""Build a conservative, offline DCC form lookup from the existing witnesses.

Requires Python 3.11+ and a checkout of the pinned, dependency-free
latincy-lexicon source (see docs/data/vocabulary-sources.md). Nothing is
written to the transcriptions, review ledgers, or existing glossaries.
"""
from __future__ import annotations

import argparse
from collections import Counter, defaultdict
import hashlib
import json
from pathlib import Path
import re
import subprocess
import sys
import unicodedata
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
NS = '{http://www.tei-c.org/ns/1.0}'
LEXICON_COMMIT = '4a12d066e5800c941e472fa5af610f156eb022f1'
ENROLLMENT_MANIFEST = 'scripts/sources/vocabulary/tei-corpus.json'
NORMALIZATION = 'NFD; remove combining marks; lowercase; v→u, j→i, æ→ae, œ→oe, ſ→s; lookup only'
UNSAFE = '\ufffd'


def normalized(text):
    text = ''.join(c for c in unicodedata.normalize('NFD', text) if not unicodedata.combining(c)).lower()
    return text.translate(str.maketrans({'v': 'u', 'j': 'i', 'æ': 'ae', 'œ': 'oe', 'ſ': 's'}))


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def tag(node):
    return node.tag.removeprefix(NS)


def source_text(node):
    """A marker invalidates the whole touching token, not merely its letters."""
    name = tag(node)
    if name in {'note', 'desc', 'pb', 'fw'}:
        return ''
    if name in {'unclear', 'gap', 'del', 'abbr', 'g', 'metamark', 'damage', 'supplied'}:
        return UNSAFE
    if node.get('cert') in {'low', 'medium'}:
        return UNSAFE
    if name == 'choice':
        children = list(node)
        selected = next((child for preferred in ('abbr', 'orig', 'sic') for child in children if tag(child) == preferred), children[0] if children else None)
        return source_text(selected) if selected is not None else ''
    if name == 'space':
        return ' '
    if name == 'lb':
        return '' if node.get('break') == 'no' else ' '
    return (node.text or '') + ''.join(source_text(child) + (child.tail or '') for child in node)


def safe_tokens(text):
    # Combining marks and uncertainty markers remain part of the word until it
    # is accepted/rejected. Punctuation, whitespace and numbers end a word.
    word = ''
    for char in text + ' ':
        if char.isalpha() or unicodedata.combining(char) or char == UNSAFE:
            word += char
        else:
            if word and UNSAFE not in word:
                form = normalized(word)
                if form.isascii() and form.isalpha():
                    yield form
            word = ''


def dcc_candidates(parse, index, entries):
    lemma = normalized(parse.lemma)
    # The upstream principal_parts.py explicitly documents h as its stored
    # citation artifact for the demonstrative hic (only when POS is PRON).
    if lemma == 'h' and parse.pos == 'PRON':
        lemma = 'hic'
    # Whitaker explicitly labels some participles as separate adjectives.
    # Follow that stated lexical relation, never a guessed stem relation.
    relation = re.search(r'(?:PRES|PERF|FUT) PPL of ([a-z]+)', parse.meaning, re.I)
    if relation:
        related = index.get(normalized(relation.group(1)), set())
        return {key for key in related if entries[key]['partOfSpeech'].startswith('Verb')}
    candidates = index.get(lemma, set())
    if len(candidates) <= 1:
        return candidates
    category = {'V': 'Verb', 'VPAR': 'Verb', 'SUPINE': 'Verb', 'N': 'Noun',
                'ADJ': 'Adjective', 'NUM': 'Adjective', 'PRON': 'Pronoun',
                'PACK': 'Pronoun', 'ADV': 'Adverb', 'PREP': 'Preposition',
                'CONJ': 'Conjunction'}.get(parse.pos)
    return {key for key in candidates if category and entries[key]['partOfSpeech'].startswith(category)}


def explicit_dcc_forms(headword):
    # Only complete printed forms, never hyphenated stems/endings or prose.
    clean = re.sub(r'\([^)]*\)', '', headword)
    for word in re.split(r'[,/\s]+', clean):
        if len(word) > 1 and word.isalpha():
            yield normalized(word)


def enrolled_records(enrollment, live_corpus):
    """Vocabulary enrollment is explicit; newer transcriptions do not join it."""
    records = enrollment['records']
    seen = set()
    for record in records:
        key = (record['witness'], record['poem'])
        if key in seen or record.get('status') != 'reviewed' or not record.get('path'):
            raise ValueError(f'Invalid vocabulary enrollment: {key}')
        seen.add(key)
        current = [item for item in live_corpus['records']
                   if (item['witness'], item['poem']) == key]
        if len(current) != 1 or any(current[0].get(field) != record.get(field)
                                    for field in ('path', 'status')):
            raise ValueError(f'Vocabulary enrollment changed in the live corpus: {key}')
    return records


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--lexicon-source', required=True, type=Path, help='Pinned latincy-lexicon checkout')
    parser.add_argument('--output', type=Path, default=ROOT / 'docs/data/vocabulary-forms.json')
    args = parser.parse_args()
    source = args.lexicon_source.resolve()
    commit = subprocess.check_output(['git', '-C', str(source), 'rev-parse', 'HEAD'], text=True).strip()
    if commit != LEXICON_COMMIT:
        raise SystemExit(f'Expected latincy-lexicon {LEXICON_COMMIT}; got {commit}')
    sys.path.insert(0, str(source / 'src'))
    from latincy_lexicon.build import _prepare, _analyzer_payload, _analyzer_from_payload
    from latincy_lexicon.generator import Generator

    frequency_path = ROOT / 'docs/data/latin-frequency.json'
    dcc = json.loads(frequency_path.read_text())
    dcc_index = defaultdict(set)
    explicit_index = defaultdict(set)
    dcc_entries = {entry['id']: entry for entry in dcc['entries']}
    for entry in dcc['entries']:
        for key in entry['keys']:
            dcc_index[normalized(key)].add(entry['id'])
        for form in explicit_dcc_forms(entry['headword']):
            explicit_index[form].add(entry['id'])

    input_hashes = {'docs/data/latin-frequency.json': digest(frequency_path)}
    enrollment_path = ROOT / ENROLLMENT_MANIFEST
    enrollment = json.loads(enrollment_path.read_text())
    live_corpus = json.loads((ROOT / 'docs/data/tei-corpus.json').read_text())
    records = enrolled_records(enrollment, live_corpus)
    input_hashes[ENROLLMENT_MANIFEST] = digest(enrollment_path)
    source_counts = Counter()
    glossary_forms = set()
    witness_counts = {}
    for record in records:
        path = ROOT / 'docs' / record['path']
        input_hashes[str(path.relative_to(ROOT))] = digest(path)
        document = ET.parse(path).getroot()
        division = next((div for div in document.iter(NS + 'div') if div.get('type') == 'poem' and div.get('n') == record['poem']), None)
        if division is None:
            raise ValueError(f'No matching poem: {path}')
        tokens = Counter(token for line in division.iter(NS + 'l') for token in safe_tokens(source_text(line)))
        source_counts.update(tokens)
        witness_counts[f"{record['witness']}:{record['poem']}"] = tokens
    for path in sorted((ROOT / 'docs/data/Companion/Vocab').glob('*.json')):
        input_hashes[str(path.relative_to(ROOT))] = digest(path)
        for value in json.loads(path.read_text()).values():
            for raw in value.splitlines():
                # Exact first dictionary form only. English explanation phrases
                # and later principal parts never become guessed Latin lemmas.
                headword = raw.split(':', 1)[0].strip()
                initial = re.match(r'^([A-Za-zÀ-ž]+)(?=\s*[,<=(]|$)', headword)
                if initial:
                    glossary_forms.add(normalized(initial.group(1)))

    prepared = _prepare()
    payload = _analyzer_payload(prepared['entries'], prepared['inflections'], prepared['uniques'],
                                prepared['addons'], prepared['headwords'], prepared['plural_mappings'])
    analyzer = _analyzer_from_payload(payload)
    generator = Generator(payload['entries'], payload['inflections'], payload['uniques'],
                          {int(key): value for key, value in payload['headwords'].items()})
    paradigms = {}
    def viable(parse, form):
        # A&G 182: only dic/duc/fac/fer (and the specified compounds)
        # have the zero-vowel active imperative. Generic wildcard rules
        # otherwise invent forms such as sum < sumo and ut < utor.
        lemma = normalized(parse.lemma)
        if parse.pos == 'V' and parse.mood == 'IMP' and not parse.ending:
            if not any(lemma.endswith(verb) for verb in ('dico', 'duco', 'facio', 'fero')):
                return False
        # A&G 190: deponent finite forms use passive morphology. A lexical
        # active counterpart, if present, is analyzed under its own entry.
        if parse.pos == 'V' and parse.verb_kind == 'DEP' and parse.voice == 'ACTIVE' and parse.mood in {'IND', 'SUB', 'IMP'}:
            return False
        # The analyzer accepts wildcard declension matches, including bare
        # adjective stems. Verify each against an actual generated paradigm.
        key = normalized(parse.lemma)
        if key not in paradigms:
            paradigms[key] = {normalized(item.form) for item in generator.generate(key, include_variants=True)}
        return form in paradigms[key]

    forms = {}
    ambiguous = {}
    unmatched = []
    analyzed = set(source_counts) | glossary_forms
    for form in sorted(analyzed):
        # No frequency-based candidate pruning: rare dictionary alternatives
        # still prevent an automatic single-definition assignment.
        parses = [parse for parse in analyzer.analyze(form) if viable(parse, form)]
        all_lemmas = sorted({normalized(parse.lemma) for parse in parses})
        candidate_sets = [dcc_candidates(parse, dcc_index, dcc_entries) for parse in parses]
        matched = set().union(*candidate_sets) if candidate_sets else set()
        # A unique surface may be a DCC-listed indeclinable that the analyzer
        # does not know. Direct matching is accepted only if there are no
        # contradictory morphological analyses and one exact DCC key.
        direct = dcc_index.get(form, set()) or explicit_index.get(form, set())
        if not parses and len(direct) == 1:
            matched = direct
            all_lemmas = [form]
        single_lemma = len(all_lemmas) == 1
        all_core = all(candidate_sets) if parses else bool(direct)
        if single_lemma and len(matched) == 1 and all_core:
            forms[form] = {'dccId': next(iter(matched)), 'lemma': all_lemmas[0]}
        elif matched:
            ambiguous[form] = {'lemmas': all_lemmas, 'dccIds': sorted(matched), 'allCandidatesCore': bool(all_core)}
        else:
            unmatched.append(form)

    per_witness = {}
    for name, counts in witness_counts.items():
        matched_tokens = sum(count for form, count in counts.items() if form in forms)
        per_witness[name] = {'readableTokens': sum(counts.values()), 'matchedTokens': matched_tokens,
                             'matchedForms': sum(form in forms for form in counts)}
    result = {
        'version': 1,
        'normalization': NORMALIZATION,
        'source': {
            'title': "LatinCy lexicon / Whitaker's WORDS morphological lookup",
            'url': 'https://github.com/latincy/latincy-lexicon',
            'commit': commit,
            'generator': 'scripts/build-vocabulary-lexicon.py',
            'generatorSha256': digest(Path(__file__)),
            'enrollmentManifest': ENROLLMENT_MANIFEST,
            'grammar': ['https://dcc.dickinson.edu/grammar/latin/peculiarities', 'https://dcc.dickinson.edu/grammar/latin/deponent-verbs'],
            'policy': 'Candidate analyses must round-trip through the generated paradigm; duplicate DCC keys are filtered by part of speech. Explicit dictionary participle relations and complete printed DCC headword forms may resolve missing citation forms. Single mappings require one morphological lemma and one DCC entry. Ambiguous sets are offered only when every analyzed lemma has a DCC entry and must be displayed as possibilities together. Other ambiguous and unrecognized forms omitted. No contextual disambiguation; no inferred transcription.',
            'licenseNotice': 'scripts/sources/vocabulary/latincy-whitaker-LICENSE.txt',
            'libraryFilesSha256': {name: digest(source / 'src/latincy_lexicon' / name) for name in ['analyzer.py', 'build.py', 'generator.py', 'principal_parts.py', 'data/DICTLINE.GEN', 'data/INFLECTS.LAT', 'data/ADDONS.LAT', 'data/UNIQUES.LAT']},
            'inputSha256': input_hashes,
        },
        'forms': forms,
        'ambiguousForms': {form: value for form, value in ambiguous.items() if value['allCandidatesCore']},
        'excluded': {'ambiguous': {form: value for form, value in ambiguous.items() if not value['allCandidatesCore']}, 'unmatched': unmatched},
        'coverage': {
            'analyzedForms': len(analyzed), 'sourceForms': len(source_counts), 'matchedForms': len(forms),
            'ambiguousForms': len(ambiguous), 'allCoreAmbiguousForms': sum(item['allCandidatesCore'] for item in ambiguous.values()), 'unmatchedForms': len(unmatched),
            'matchedSourceTokens': sum(count for form, count in source_counts.items() if form in forms),
            'readableSourceTokens': sum(source_counts.values()), 'byWitnessPoem': per_witness,
        },
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps(result['coverage'], ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
