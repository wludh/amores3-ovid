# Vocabulary Companion: implementation and contextual review

Reviewed 26 October 2026 by OpenAI Codex with three collaborating agents. Work is isolated on `codex/vocabulary-companion`, based on `6f804582702b9316d3835ee8ea8a344fa8dc9734`. The primary checkout and concurrent work were not modified. This review covers the 75 P/Y/S/O/LL poem–witness slots in that snapshot; it does not claim coverage of witnesses added concurrently elsewhere.

The slider selects the number of supported vocabulary headwords, retaining full definitions. Its default excludes the DCC 1000 core list. Above the default, core words enter from less common to more common according to the published DCC ranks. Below it, noncore words enter in source order because DCC supplies no ranks for them. Companion shows notes without repeating the transcription. The separate Text & notes option in every panel-type dropdown presents the witness line by line with vocabulary and commentary. The two modes remember their own note selections. Both use compact, minimizable controls and the project's colors, serif reading typography, light/dark themes, and responsive panels. Export downloads the displayed vocabulary as a two-column UTF-8 TSV for Anki or Quizlet, deduplicating identical cards while respecting the amount, witness, and search.

Every proposed inherited glossary entry and expanded dictionary match was read against its own witness's verse. Corrections address wrong lemmas, senses, principal parts, misplaced line entries, and false matches to fragments or uncertain words. Unresolved matches are withheld; no source reading is silently supplied. This is a vocabulary review of existing transcriptions, not a fresh image review. Original XML, glossaries, annotation rectangles, and TEI review seals are unchanged.

The review overlays preserve literal evidence and input hashes. Their full word-by-word decisions are in `docs/data/vocabulary-review/`; the five range reports in this directory explain the corrections. Independent agents spot-checked each other's substantive changes. The primary agent additionally checked core/noncore consistency across all overlays, preserving distinct homographs while sharing DCC ranks for a single lemma's contextual senses.

| Poem | Witness-specific decisions | Confirm | Replace | Suppress |
| --- | ---: | ---: | ---: | ---: |
| 3.1 | 1,539 | 1,219 | 303 | 17 |
| 3.2 | 1,693 | 1,400 | 275 | 18 |
| 3.3 | 1,038 | 844 | 159 | 35 |
| 3.4 | 1,027 | 867 | 143 | 17 |
| 3.5 | 936 | 799 | 108 | 29 |
| 3.6 | 2,372 | 1,642 | 558 | 172 |
| 3.7 | 1,467 | 1,397 | 19 | 51 |
| 3.8 | 1,189 | 1,040 | 123 | 26 |
| 3.9 | 1,264 | 886 | 351 | 27 |
| 3.10 | 940 | 656 | 265 | 19 |
| 3.11 | 985 | 655 | 276 | 54 |
| 3.12 | 609 | 405 | 174 | 30 |
| 3.13 | 500 | 335 | 155 | 10 |
| 3.14 | 921 | 657 | 219 | 45 |
| 3.15 | 264 | 160 | 94 | 10 |
| Total | 16,744 | 12,962 | 3,222 | 560 |

Counts are candidate decisions per witness, not distinct Latin headwords. A replacement may resolve a dictionary homograph or correct a gloss. Suppression is a reviewed outcome, not an unchecked omission. Not every source word has a supported dictionary match.

Validation: all 92 Node tests pass, including complete candidate coverage and input hashes for all 15 poems. Browser checks cover all slider positions, stable complete definitions, witness absence and gaps, independent panel state, linked navigation, delayed response races, search, retry, stale-review rejection, separate view state, minimized controls, and actual flashcard downloads. Downloaded rows were checked against the displayed vocabulary in both modes, including Unicode, duplicate removal, field separators, filenames, and empty selections. Light, dark, and 390-pixel layouts were visually inspected; the Companion has no horizontal overflow and no JavaScript page errors. Existing TEI validation is blocked by three pre-existing stale seals (P 3.1, Y 3.1, P 3.7); the source and seal files are unchanged from the branch base. All other 72 records passed the per-record validator. This task does not renew transcription seals.

Nothing was committed, pushed, or published. The local preview is served on port 4287; select Companion → Vocabulary.
