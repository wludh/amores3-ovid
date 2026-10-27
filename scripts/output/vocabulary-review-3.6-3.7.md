# Contextual vocabulary review: Amores 3.6–3.7

Reviewed 26 October 2026. Every candidate glossary entry and proposed automatic dictionary lookup was checked against the supplied, current TEI source text for each extant witness (P, Y, S, O, LL). This is a lexical review of the existing transcriptions, not a new manuscript transcription or a change to a transcription review seal. No source XML, original glossary, or annotation rectangle was edited.

The JSON overlays record a disposition for every candidate and witness, the literal witness line used as evidence, and the exact SHA-256 hashes of the TEI, glossary, DCC list, and frozen form map. Incomplete, unclear, abbreviated, absent, and unresolved forms were not restored from another witness. An inherited glossary item requires its own securely readable token in that witness and verse.

| Poem | Witness | Candidates reviewed | Confirmed | Replaced | Suppressed |
|---|---|---:|---:|---:|---:|
| 3.6 | P | 403 | 234 | 78 | 91 |
| 3.6 | Y | 510 | 368 | 121 | 21 |
| 3.6 | S | 405 | 252 | 99 | 54 |
| 3.6 | O | 526 | 393 | 130 | 3 |
| 3.6 | LL | 528 | 395 | 130 | 3 |
| 3.7 | P | 305 | 294 | 4 | 7 |
| 3.7 | Y | 290 | 271 | 3 | 16 |
| 3.7 | S | 225 | 201 | 2 | 22 |
| 3.7 | O | 322 | 314 | 5 | 3 |
| 3.7 | LL | 325 | 317 | 5 | 3 |

## Consequential corrections

- 3.6: corrected inherited proper-name errors: Ilia is Rhea Silvia, Xanthus and Nilus are rivers, Martia refers to Mars, and Iliacis is Trojan. Corrected edidit at 72 to ēdō, utter or give out, rather than DCC edō, eat. Corrected talus to ankle (Lewis–Short explicitly cites Amores 3.6.6); lustrum to the five-year period; consero to join, not sow; quies to the noun rest; noster, nudus, locus, os, propago, and uber to their contextual lemmas. Removed truncated scraping fragments and unrelated senses such as zinc oxide, a worm, and the historian Eutropius.
- 3.6: retained separate witness outcomes. Y conseruasse receives conservō, Y oppressa receives oppressus, and P/Y/S tecta receives tegō where O/LL have lecta. Absent or uncertain readings receive no borrowed gloss. S ideo at54 is documented as the transmitted spelling modifying Laomedonte, with the contextual adjective Idaeus; Y ue at101 is the interjection vae. The uncertain tantum lookup at64 is omitted.
- 3.7: completed the deponent principal parts of luctor and clarified deprehendo as catch/seize/detect in deprensus inermis. The remaining confirmed inherited entries were checked for lemma, principal parts, and full definition. Exactum means ascertained or established, a before pudet is an interjection, and bis means twice rather than duo/two. Context resolves latus as side, facti as deed, usus as a noun at3 and a participle of utor at45, tantum as only at39 and quantity at49, and nostri as of us at69.
- Relative spellings que were distinguished from the enclitic conjunction. The divided & iam strings in Y 3.7.40,45,73 remain omitted because an independent dictionary token is not assured. Legacy surdus at3.7.57, praemortuus at3.7.66, and lana at3.7.77 belong to other verses and are suppressed at their inherited locations.

## Dictionary evidence and attribution

Corrections were checked against the official PerseusDL Lewis–Short XML supplied in the audit workspace, with individual dictionary entry URLs recorded on every replacement. Direct homonym links are used where needed: Ilia2, Iliacus1, consero2, lustrum2, propago2, uber2, cultus2, os1, and a3. Context-resolved DCC identifications retain the official DCC meanings unless an explicit replacement is recorded.

- [Lewis and Short, A Latin Dictionary, Perseus digital edition](https://www.perseus.tufts.edu/hopper/text?doc=Perseus:text:1999.04.0059), Oxford 1879; digital source distributed by [PerseusDL/lexica](https://github.com/PerseusDL/lexica) under CC BY-SA 4.0. Definitions here are concise contextual paraphrases.
- [DCC Latin Core Vocabulary](https://dcc.dickinson.edu/latin-core-list1), current imported list and metadata in docs/data/latin-frequency.json.
- [University of Chicago Logeion: resisto](https://logeion.uchicago.edu/resisto) and [Vestalis](https://logeion.uchicago.edu/vestalis) are linked for the two headwords absent from the supplied Lewis–Short index.

## Verification and limits

`node --test --test-name-pattern="3.[67]:" test/vocabulary-review.test.mjs` passes both poem tests: every source line and candidate ID is covered, every quotation matches its own witness, and every bound input hash is current. These checks verify coverage and provenance; the contextual lexical decisions above are the manual review. Missing or conflicting overlay decisions fail closed in the reader. Suppressed readings remain documented rather than silently resolved.

## Independent spot-review of 3.11–3.15

The vocabulary expansion reviewer independently inspected all source-form replacements with explicit new definitions, the nontrivial homograph resolutions, and selected high-risk inherited-gloss replacements in the other agent’s overlays. Each was read with its quoted witness clause. Checks included adserui, potentia, rivalis, furata, pube, mare/mensa, lacertus, anatomical tempora, amica, imperative sine, artus, ignotus, prona palma, cultus, gravior, and superstes. No blocking lexical error was found in that sample. A minor furor definition refinement (steal; furata, having stolen) was sent to the owning reviewer and accepted. This is a targeted independent check, not a claim to have repeated the entire first review of those five poems.

## Independent review of these overlays

The separate vocabulary review agent spot-checked the 3.6 and 3.7 replacements and homograph choices against the witness clauses. The review specifically confirmed Idaeus, vae, relative que, edidit meaning utter, bis, the interjection a, and legi in the gathering of bones. No actionable defect was reported. This second check supplements the complete first contextual review and the automated coverage/provenance validation.
