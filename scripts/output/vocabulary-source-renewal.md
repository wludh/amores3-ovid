# Vocabulary renewal after the fresh source review

Reviewed 26 October 2026 by OpenAI Codex agent `/root/w_review_b`. This is a differential contextual vocabulary review following the fresh source-image review of the transcriptions. It does not replace or renew the TEI transcription seals.

## Scope and unchanged inputs

Compared the actual browser-extracted verse text, mixed-content safety flags, source forms and proposed vocabulary candidates for every one of the original 75 enrolled P/Y/S/O/LL poem–witness records against the vocabulary baseline at `48a5c97`. Every baseline TEI file was retrieved from that commit and its exact SHA-256 was checked against the corresponding old contextual overlay. All 75 matched. Every changed context and every added or removed candidate was inspected; existing decisions were retained when their source context and lexical identity remained supported.

The explicit enrollment snapshot is unchanged; W remains outside vocabulary enrollment. Original glossaries, DCC definitions/ranks, the morphology generator, pinned dictionary implementation/data, UI code, annotations, and all TEI files were left intact by this task. The LatinCy checkout is pinned to `4a12d066e5800c941e472fa5af610f156eb022f1`; the rebuild used Python 3.12.14.

## Differential decisions

| Poem | Changed extracted lines | New candidates | Retired candidates | Existing decisions revised | Final witness decisions |
| --- | ---: | ---: | ---: | ---: | ---: |
| 3.1 | 26 | 4 | 4 | 3 | 1539 |
| 3.2 | 14 | 1 | 5 | 0 | 1689 |
| 3.3 | 10 | 0 | 4 | 0 | 1034 |
| 3.4 | 2 | 0 | 0 | 0 | 1027 |
| 3.5 | 0 | 0 | 0 | 0 | 936 |
| 3.6 | 26 | 2 | 11 | 2 | 2363 |
| 3.7 | 29 | 0 | 0 | 0 | 1467 |
| 3.8 | 5 | 0 | 1 | 0 | 1186 |
| 3.9 | 14 | 0 | 1 | 0 | 1263 |
| 3.10 | 3 | 0 | 1 | 0 | 939 |
| 3.11 | 6 | 1 | 1 | 0 | 985 |
| 3.12 | 7 | 0 | 0 | 0 | 609 |
| 3.13 | 2 | 0 | 0 | 0 | 500 |
| 3.14 | 5 | 0 | 0 | 0 | 921 |
| 3.15 | 1 | 0 | 0 | 0 | 264 |

New candidates and all revised decisions are recorded with their exact witness, line, current quotation, rationale and dictionary identity in the overlays and the accompanying differential decision JSON. The substantive changes include:

- Y 3.1.58: restored *mersit* supports **mergō**, replacing the former suppression and correcting the inherited **mersō** headword. Y 3.1.66: complete *uersibus* supports **versus, versūs m.**, replacing the incomplete-word suppression and correcting its inherited gender.
- P 3.1.7 and P 3.6.46: the new local uncertainties inside *ele[i?]gia* and *pomiferaque* require suppression of the inherited glossary matches. P 3.6.9 retains suppression for *quieti*: the damaged context does not settle **quiētus** versus **quiēs**, so its reason now describes the actual ambiguity rather than absence.
- Newly extant safe forms include Y 3.1 *aqua, meum, adde, breues*; P 3.2.52 *manus*; P 3.6.64 *centum*; Y 3.6.36 *manu*; and P 3.11.9 *tam*. Each was checked in its own witness clause. The *adde* gloss explicitly expresses adding short verses to long ones.
- Automatic dictionary candidates touching newly encoded uncertainty or unidentified source marks are removed, as are candidates whose source forms were corrected away. Complete, clearly written words such as Y’s *capillos, ocelli, arcus, crura, pinnis, patenti* and *destituisse* retain their existing manually checked glossary decisions: the documented nonletter marks do not supply a different lemma. This distinguishes manual contextual confirmation from the stricter automatic lookup filter.
- An existing 3.8 `dictionary:63:me` entry contained duplicate witness tags `[Y,Y,O,O,LL]`. It now contains each witness once. The lexical decision is unchanged, and the complete original entry is preserved in review history.

## Preservation and provenance

The preservation proof checks 16,156 unchanged-context witness decisions for exact object equality after isolating their witness and quotation. It separately checks 553 decisions in changed contexts whose lexical disposition remains supported; only their current quotations change. There are 8 newly reviewed candidates, 28 retired candidates, and 5 renewed existing decisions. The original stored total includes two duplicate witness tags; final counts count each witness disposition once.

Each overlay retains its previous reviewer, date, complete input bindings and coverage in `reviewHistory`, with every original entry whose quotation, scope or disposition changed. This preserves the old decisions and quotations for retired candidates, the exact duplicate-tag entry, and the old artifact hash. Unchanged entries remain in the active overlay. `sourceContextRenewal` records the full changed-line coverage, new/retired candidates and revised decisions. No old review identity is silently reassigned.

Enrollment SHA-256: `f365cc7a6f9281c9402bbcc336e2e3cc4efcb69f1f9eaa9c04e1cd04a253c19f`.
Previous morphology artifact SHA-256: `49f9895ec7554d0679975354862ac4faca4f0b638069183734e70edd3307b5f9`.
Rebuilt morphology artifact SHA-256: `a27dc87382562f757750660e6c6a3418cb2378cff1dea5a9de946de100539081`.

Readable source-token coverage changed from 21,943 to 21,905; distinct readable source forms changed from 3,438 to 3,432. The rebuild genuinely reran the pinned analyzer and form generator; it did not substitute checksums for changed source evidence.

## Validation

`npm test` passed all 101 tests with zero failures, including all 22 morphology/contextual-review tests. These checks regenerate complete candidate coverage and evidence quotations for all 75 enrolled records, check every exact input hash, reject duplicate or missing decisions, and require zero vocabulary entries for all 15 unenrolled W records even at maximum help.

The independent preservation proof passed: all unchanged decisions are equal, all changed quotations quote the current witness, every new candidate has an explicit inspected disposition, every removed candidate is retired, and all altered/retired original entries are preserved in history. All 92 generated input hashes were independently compared with the final files before writing. Only the morphology artifact, 15 vocabulary overlays and these renewal reports were written; no TEI, annotation, enrollment snapshot, UI or shared corpus index was edited.

Dictionary corrections consult the preserved Perseus Lewis and Short source, whose SHA-256 is `933ba8fde0ef06823f69a130c95ba6f345ece3cb1603514b17972d1edd421d32`, under the existing attribution/license in `docs/data/vocabulary-sources.md`. Individual corrected entries retain direct dictionary references.
