# Vocabulary release integration

## Scope and provenance

The live corpus now includes 15 newly transcribed W poem records. The completed contextual vocabulary audit covers only the original 75 P/Y/S/O/LL records. Transcription approval does not automatically enroll a witness in vocabulary review.

`scripts/sources/vocabulary/tei-corpus.json` is the byte-for-byte original corpus from commit `6f80458`; its SHA-256 matches the corpus input recorded in the previously reviewed morphology artifact. The builder reads only that explicit enrollment snapshot and verifies every enrolled witness/poem against the live corpus for unique identity, unchanged path, and reviewed status. New live records are allowed but do not contribute analyzed forms or coverage statistics. All 75 actual XML files, 15 original glossaries, DCC data, and dictionary implementation/data files retain their original content hashes.

Snapshot SHA-256: `f365cc7a6f9281c9402bbcc336e2e3cc4efcb69f1f9eaa9c04e1cd04a253c19f`.

## Rebuild equality proof

A complete rebuild used the pinned LatinCy checkout `4a12d066e5800c941e472fa5af610f156eb022f1`. The following parsed payloads were compared for exact equality, then hashed as UTF-8 JSON with sorted keys, compact separators, and unescaped Unicode. Every before/after pair is identical.

| Payload | Before SHA-256 | After SHA-256 |
|---|---|---|
| `normalization` | `c194a4fbe37b2596442ed76ce84c12d4dae7acb0e5a94c5c6e28d0faebfb25d7` | `c194a4fbe37b2596442ed76ce84c12d4dae7acb0e5a94c5c6e28d0faebfb25d7` |
| `forms` | `17aebc28c61128affed90f9a1cc0b3d1f8f95f1ff27a1d746c45f51afcb18e9d` | `17aebc28c61128affed90f9a1cc0b3d1f8f95f1ff27a1d746c45f51afcb18e9d` |
| `ambiguousForms` | `7f08b6f8d738cec220548083b590a89becaacb7a7d1a43c66aebf2e8fc8d46a5` | `7f08b6f8d738cec220548083b590a89becaacb7a7d1a43c66aebf2e8fc8d46a5` |
| `excluded` | `812b60e9a85b0d5b20d59ff0b89f8ab29bf5b01495802a3d6e2acff005984be9` | `812b60e9a85b0d5b20d59ff0b89f8ab29bf5b01495802a3d6e2acff005984be9` |
| `coverage` | `a8b81f16a26a79c4353270faa76d6226293f6556179942c0b15c0dee372757af` | `a8b81f16a26a79c4353270faa76d6226293f6556179942c0b15c0dee372757af` |

Original full morphology artifact SHA-256: `a0166f81bf1d784c27bf4c358a5d7aedd46c4dc774ef954683d14fba917ea15f`.
Rebuilt full morphology artifact SHA-256: `49f9895ec7554d0679975354862ac4faca4f0b638069183734e70edd3307b5f9`.

The only source-metadata changes are the generator checksum, the explicit enrollmentManifest field, and relocation of the original corpus checksum from the live path to the frozen snapshot path. This was verified by exact comparison after removing only those expected differences. The generated lookup still contains 1102 single mappings and the same ambiguous/excluded analyses and 75 witness/poem coverage records.

## Contextual review bindings

All 15 review overlays were updated by replacing only the old formsSha256 value with the rebuilt artifact hash. Every other byte was preserved, and the parsed review objects were checked for equality after changing only that field. TEI hashes, glossary hashes, frequency hashes, witness coverage, decisions, evidence quotations, references, reviewers, dates, and open issues are unchanged. This is a provenance-only rebinding; it is not a new lexical approval and gives W no review status.

## Validation

The forms tests bind the exact enrollment snapshot and every real source input, require the 75 enrolled records to retain their live identity/path/status, and exercise rejection of missing, duplicated, moved, or downgraded enrollment records. Contextual review tests retain full coverage assertions for every enrolled witness and separately require zero entries for all 15 W records, including at maximum help. A new witness cannot inherit another witness’s evidence, coverage, or lexical decisions.

`node --test test/vocabulary-forms.test.mjs test/vocabulary-review.test.mjs` passed all 22 tests after the rebuild and review rebinding. Root integration will add the full merge validation and browser verification here. No TEI, live corpus index, original glossary, annotation rectangle, or transcription review seal was edited by this enrollment change.
