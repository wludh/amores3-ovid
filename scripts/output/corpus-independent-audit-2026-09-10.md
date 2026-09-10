# Independent cross-corpus audit — 10 September 2026

Auditor: `/root/encode_s`. This is a bounded, read-only audit of metadata, TEI semantics, review bindings, provenance and validator coverage across all 75 poem–witness slots. It is **not a third visual reading** and does not certify disputed readings or confer human scholarly approval. Root owns final browser inspection, promotion and the complete npm audit. This audit did not run the validator entry point or modify its shared status report, any XML, review ledger, original annotation or corpus index.

## Snapshot and pending work

The final inventory snapshot contained **74/75 reviewed slots**; pending: Y 3.15. Reviews and promotions were proceeding concurrently. Earlier snapshots had O 3.14/3.15 pending; their subsequent integration is expected progress, not a defect. The remaining pending source reviews must be completed and promoted before a 75/75 completion claim. Every non-trial slot has a standalone candidate; legacy Y 3.7 uses its existing source wrapper rather than `scripts/output/Y-3.7.xml`.

## Concrete findings requiring attention

1. **Legacy 3.7 provenance and enforcement gap.** All five trial ledgers lack explicit `author_agent`/`reviewer_agent` fields, and `validate-tei.py` exempts 3.7 from the distinct-agent, raw-candidate and independent absence-evidence checks applied elsewhere. Their reports do identify independent second readers, so this is not evidence that source review was omitted. Root has undertaken migration to standalone poem XML and removal of the exemptions. Historical responsibility supported by this task’s actual assignment/release messages and the retained reports is: S first reader `/root/encode_s`, full textual second reader `/root/encode_p`, plus root’s later scoped indentation review; O and LL first reader `/root`, second reader `/root/encode_s`. P/Y trial identities should be reconciled from their author and reviewer evidence rather than inferred from generic names.

2. **Legacy S 3.7 mixed-content formatting.** Sixty verse trees still contain formatting newlines. Much of this is between whole-word choices, but it violates the current mixed-content policy and can introduce extra collapsed whitespace around source forms and initials. The rendering path retains source text nodes, and choice display hides alternative elements rather than removing every formatting text node. Normalize during trial migration using actual intended boundaries: do not blanket-delete all whitespace because some separates successive words. Check the changed rendering and reseal. This audit identifies the formatting issue without asserting that all sixty verses currently display a lexical split.

3. **Five legacy editorial escalations require an explicit final disposition.** P 3.7 has review notes at 23 and 36; Y 3.7 at 10, 51 and 55. Later corpus entries have no escalations. Root has assigned these five to a source reviewer. P 36 chiefly asks for a complete reading of faded letters, which should be reassessed against the policy that ordinary image uncertainty is documentation rather than a human task. This metadata audit does not close or reclassify any note. A final report must not claim zero human questions while these remain `type="review"`.

## Validator false-completeness risks

These are gaps in protection against future mutations, **not observed corruptions of the present source data**.

- `verify_image_provenance` validates zones reached from verse containers. It does not enforce preservation of unused original zones, notably P 3.14 positions 1–2 and P 3.15 positions 9–20. Those current zones were preserved in the source reviews, but a later deletion or alteration could escape this gate. Add coverage for explicitly retained unused provenance and a regression case.
- Gap-only poems have no verse loop, so their supporting surface graphics are not validated against the witness manifest by that function. The current S absence dossier and P boundary dossiers are source-grounded and their checked local hashes match; nevertheless a changed evidence surface could pass the present structural gate. Validate evidence surfaces independently of verse presence.
- Not-transmitted gaps are checked by total quantity plus a nonempty description and ledger evidence. The validator does not independently bind each individual gap to a canonical span, and it does not explicitly reject an unexpected not-transmitted gap when the absent inventory is empty. Present extents agree; future tests should reject swapped/overlapping spans and unlisted gaps.
- Distinct author/reviewer strings and a nonempty evidence field establish accountability metadata, not proof that actual independent reading occurred. This limit is inherent; retain precise source coverage, signed review artifacts and the explicit distinction between machine validation and scholarly approval. There is no automatic inference that every represented position contains readable writing.

Existing tests are meaningful for changed original/corrected zones and unlocated-line safeguards: they reject wrong images/pages, readable text in an unlocated container, missing uncertainty notes and bypass of an existing annotation. They do not currently test the three cases above. No test failures are asserted here; root performs the final prescribed suite.

## Checks that passed

The read-only cross-slot checks found no mismatch in:

- The exact 75-slot inventory, unchanged raw annotation digest and all stored annotation inventories.
- Reviewed integrated canonical XML seals, report hashes and available candidate/integrated semantic XML comparisons. The standalone-candidate comparison was inapplicable to legacy Y 3.7’s wrapper path.
- Canonical verse inventories, represented/absent disjointness, review coverage ranges, unique IDs and local references.
- Exact note-to-disposition scope, targets, evidence presence and type/status mapping.
- Source image/rectangle provenance for every linked verse, reviewed correction exports and published page-only navigation, using the read-only provenance function.
- `choice` alternative structures and `subst` pairs; no incomplete choice/substitution structure was found.
- Twenty-one distinct explicitly hashed local source-evidence file/hash pairs encountered in the ledgers. All existed and matched. This is not a hash audit of every unsealed photograph or a new visual source review.

No stale “awaiting/pending/before integration” statement was found in the current project/interpretation policy sections of reviewed files. Historical first-pass revisions remain historical records and are not mistaken for current status.

## Extent and layout consistency

Across the 75 candidate/reviewed slots, the TEI represents 3,888 canonical verse positions out of 4,350 possible witness positions; 462 positions are source-confirmed absent. Of the represented positions, 27 P containers contain a whole-line illegibility gap, including the three individually unlocated P 3.12 positions. These figures describe encoding coverage, not the number of fully deciphered verses.

| Witness | Represented positions | Absent positions | Whole-line illegibility containers | Encoded indents |
| --- | ---: | ---: | ---: | ---: |
| P | 802 | 68 | 27 | 367 |
| Y | 870 | 0 | 0 | 435 |
| S | 476 | 394 | 0 | 5 |
| O | 870 | 0 | 0 | 435 |
| LL | 870 | 0 | 0 | 435 |

S’s five indents are exceptional opening verse 2 in 3.1, 3.2, 3.4, 3.5 and 3.7; no parity-based insets remain in 3.3/3.6 or gap-only poems. P’s selective insets and Y/O/LL’s alternating patterns agree with their recorded source-layout policies; this audit does not newly infer indentation from those counts.

The absent spans are S 3.7.75–84 and all of S 3.8–3.15; P 3.12.27–44, all of P 3.13, P 3.14.1–2, and P 3.15.9–20. P 3.12.23–25 remain **illegible and individually unlocated**, not absent: each links to the actual full surface, contains only a described one-line gap, and has a targeted independent uncertainty entry. Their three locations are not invented rectangles.

S’s later-poem absence dossier records Scherrer’s explicit III.7.74 endpoint and ten missing final verses plus eight missing elegies, inspection of the terminal 396 page, blank 397–404, distinct material on 405, and residual writing on 406. The 3.7 migration should carry this corroboration into its terminal-gap ledger. P’s missing spans are corroborated by Chatelain’s direct description of 3.12.26 → 3.14.3 and the 3.15.8 endpoint, together with the photographed sequence. Neither dossier treats missing annotations alone as absence or infers a historical cause or original leaf count.

The final browser and npm results remain root’s separate responsibility. This report is a snapshot audit and may precede subsequent migrations, note reassessments or promotions.

## Follow-up ownership and completed provenance migration

After the snapshot, root authorized this reviewer to update only the O/LL 3.7 review ledgers. Both standalone candidates were independently checked to have canonical XML identical to their prior `reviewed_xml_sha256` seals and current integrated poem TEI; both unchanged report hashes matched. The ledgers now explicitly identify `/root` as first author and `/root/encode_s` as independent second reader, record the actual original assignment/release history, and seal the raw standalone candidate bytes. No XML or source-review report changed, and this migration does not claim another visual reading. Root owns subsequent promotion.

Root assigned S 3.7 boundary-aware whitespace correction and provenance/absence metadata to its original second reader, encode_p; review_y owns renewed dispositions for the five P/Y trial escalations. Root also accepted hardening for unused original zones, all source surfaces, and individual absent spans. Those actions are outside this audit report’s completion claim until their respective owners verify and release them.
