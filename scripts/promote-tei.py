#!/usr/bin/env python3
"""Integrate an independently reviewed candidate after validating its review binding."""
from pathlib import Path
import argparse
import hashlib
import importlib.util
import json

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('validation', ROOT / 'scripts/validate-tei.py')
validation = importlib.util.module_from_spec(spec)
spec.loader.exec_module(validation)

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('witness', choices=['P', 'Y', 'S', 'O', 'LL'])
parser.add_argument('poem')
args = parser.parse_args()
index = ROOT / 'docs/data/tei-corpus.json'
corpus = json.loads(index.read_text())
record = next(r for r in corpus['records'] if r['witness'] == args.witness and r['poem'] == args.poem)
candidate = ROOT / f'scripts/output/{args.witness}-{args.poem}.xml'
ledger_path = ROOT / record['review_path']
ledger = json.loads(ledger_path.read_text())
assert ledger.get('author_agent') and ledger.get('reviewer_agent') and ledger['author_agent'] != ledger['reviewer_agent'], 'A different agent must review the source'
assert ledger.get('reviewed_candidate_sha256') == hashlib.sha256(candidate.read_bytes()).hexdigest(), 'Candidate changed after independent review'
assert ledger.get('review_report_sha256') == hashlib.sha256((ROOT / record['report_path']).read_bytes()).hexdigest(), 'Review report changed after handoff'
ledger['reviewed_xml_sha256'] = validation.xml_digest(validation.select_tei(candidate, args.poem))
original_ledger = ledger_path.read_bytes()
ledger_path.write_text(json.dumps(ledger, ensure_ascii=False, indent=2) + '\n')
proposed = dict(record, path=str(candidate), absent_lines=ledger.get('absent_lines', []))
try:
    validation.validate(args.witness, args.poem, proposed)
except BaseException:
    ledger_path.write_bytes(original_ledger)
    raise
destination = ROOT / f'docs/data/tei/{args.witness}/{args.poem}.xml'
destination.parent.mkdir(parents=True, exist_ok=True)
destination.write_bytes(candidate.read_bytes())
record.update(status='reviewed', path=str(destination.relative_to(ROOT / 'docs')), absent_lines=proposed['absent_lines'])
record.pop('candidate_path', None)
index.write_text(json.dumps(corpus, indent=2) + '\n')
print(f'Integrated reviewed {args.witness} {args.poem}; complete-corpus audit remains required.')
