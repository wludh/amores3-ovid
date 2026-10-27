# Contextual vocabulary audit: Amores 3.1–3.5

Date: 2026-10-26. Reviewer: Codex contextual lexical review (`vocab_review`).

Every numbered source line and every proposed vocabulary candidate in the frozen bundles for P, Y, S, O and LL was read in context, with differing witness readings compared individually. This is a lexical audit of the existing reviewed TEI, not a new manuscript transcription or an independent reinspection of images. No XML, original glossary, frequency data or morphology data was edited.

The review covers the proposed display entries, not all words in the poems. Missing or uncertain source words are not filled from another witness. Nonstandard but legible witness readings remain visible unchanged. When they support a clear lemma, the lexical aid follows the written reading; when they do not, the candidate is withheld. Abbreviations are not automatically expanded by this audit. A gloss may be retained for a clear traditional abbreviation when the visible spelling and clause support the lexical identity; uncertainty, damage, ambiguous segmentation and unsupported variants are withheld.

Each JSON entry includes the original candidate identity/raw text, an explicit confirm/replace/suppress decision, the witnesses checked, a literal source-line quotation for every listed witness, and references for lexical corrections. Repeated decisions are grouped only after comparison of their witness contexts. Input hashes bind decisions to this exact source and candidate dataset. `dccId: null` explicitly prevents a different core homograph from being inferred.

## Sources and method

- Reviewed project TEI quoted from the supplied extraction bundles `/tmp/amores-vocabulary-audit/3.1.json` through `3.5.json`; hashes below. These preserve the source-oriented display including uncertainty and alterations.
- [Dickinson College Commentaries, Latin Core Vocabulary](https://dcc.dickinson.edu/latin-core-list1), using the frozen local `latin-frequency.json` to identify core lemmas. Frequency ranks are not evidence for contextual word senses.
- [Lewis and Short, Perseus digital text](https://raw.githubusercontent.com/PerseusDL/lexica/master/CTS_XML_TEI/perseus/pdllex/lat/ls/lat.ls.perseus-eng2.xml), consulted through the local searchable index; individual verified entry IDs are linked in each lexical correction. Original dictionary public domain; digital source metadata/license remains documented in the project’s vocabulary source notes.

## Main corrections

- Context resolves all proposed DCC homograph alternatives: `est/es/esse` to **sum**, `amor` to the noun, `ore` to mouth/face, `facta` separately as deeds or made, `leges` to laws, `legi` to read, and `victurum` to live. No unrelated “eat”, “bone”, “torch”, etc. alternatives survive merely because a morphological analyzer proposed them.
- **iam** is the temporal adverb, not **eō**; **vis** in 3.2.37 is **volō**. Manuscript **tenere/tenerę** before girls is **tenerae**; relative **que/quę** is **quae**, not enclitic **-que**.
- **frondibus/fronde** in 3.5.7–8 is foliage **frōns, frondis**, not forehead **frōns, frontis** or the verb **frondeō**. **incisa** in P/Y 3.1.53 is cutting/engraving **incīdō**, not falling **incidō**. These are explicitly noncore rather than being assigned their core homographs.
- Existing glosses are corrected for **parce** (parcō), **plausus** (applause), **signa** (signum), **vota** (vōtum), **inseruisse** (insert, with īnseruī/īnsertum), **intus** (adverb), **verum** (truth), **labes** (stain), **versus** (masculine), and deponent/principal-part errors. Incomplete definitions and irrelevant primary senses are repaired.
- Words absent from a particular witness are withheld there, including P/Y **manu** versus **genu**, Y **axe[u?]** versus **hasta**, S **suspecta** versus **conspecta**, S **addas** versus **abdas**, and the many damaged P 3.5 lines. The unsupported **aliquī** entry at 3.3.36 is suppressed in all witnesses.
- Detached or interrupted word fragments are not given unrelated lexical meanings: S `E sse`, Y `per ennem`, Y `e{!}rgo`, and ambiguous `que quid` receive explicit suppression.

## Coverage

Counts below count a candidate once for each witness in which it was proposed. Grouped JSON rows can cover several witnesses. “Suppressed” is a deliberate conservative disposition, not an unreviewed omission.

| Poem | Witness candidate decisions | Confirm | Replace | Suppress | Grouped decisions |
| --- | ---: | ---: | ---: | ---: | ---: |
| 3.1 | 1539 | 1219 | 303 | 17 | 438 |
| 3.2 | 1693 | 1400 | 275 | 18 | 459 |
| 3.3 | 1038 | 844 | 159 | 35 | 307 |
| 3.4 | 1027 | 867 | 143 | 17 | 301 |
| 3.5 | 936 | 799 | 108 | 29 | 284 |

## 3.1: interventions and remaining withheld readings

| Candidate | Witnesses | Decision | Reason |
| --- | --- | --- | --- |
| dictionary:2:est | P, Y, LL | replace | est is a copular or auxiliary “is”, not “eats”. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| legacy:5:0 | P, Y, S, O, LL | replace | The speaker is walking in woodland shade; “accompany” is not the sense here. → **spatior, spatiārī, spatiātus sum**: to stroll, walk about [Lexical evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n44899/) |
| dictionary:5:hic | P, Y, S, O, LL | replace | Hic locates the speaker’s woodland walk: “here”. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| legacy:7:0 | P | suppress | This witness reads adoratos, not odoratos; the perfumed-hair gloss is not confirmed for its written form. |
| legacy:7:3 | P, Y, S, O, LL | replace | Complete the truncated definition of capillus. → **capillus, capillī m.**: hair of the head; a hair [Lexical evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n6613/) |
| legacy:13:0 | P, Y, S, O, LL | replace | Laeva agrees with manus; supply the adjective rather than a separate feminine noun. → **laevus, laeva, laevum**: left; laeva manus: the left hand [Lexical evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n25665/) |
| legacy:13:1 | P, Y, S, O, LL | replace | Complete the truncated definition of the royal staff moved by Tragedy. → **scēptrum, scēptrī n.**: a royal staff, sceptre [Lexical evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n42929/) |
| legacy:15:0 | P, Y, S | suppress | This witness writes separate words or a different sequence rather than ecquis; do not impose the other witnesses’ compound. |
| dictionary:16:tui | P, Y, S, O, LL | replace | tui is a possessive adjective agreeing with a noun, not the genitive of tū. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| legacy:17:1 | P, Y, S, O, LL | replace | Vinosa convivia are wine-filled drinking parties, not merely something tasting of wine. → **vīnōsus, vīnōsa, vīnōsum**: full of wine, wine-soaked [Lexical evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n51006/) |
| legacy:18:1 | P, Y, S, O, LL | replace | Secta describes the crossroads divided into roads; remove the truncated gloss. → **sectus, secta, sectum**: cut, divided; here branching into several roads [Lexical evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n43232/) |
| dictionary:20:amor | O, LL | replace | Amor is a noun “love” (sometimes personified), not a passive form of amō. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| dictionary:20:amor | P, S | replace | amor is a noun “love” (sometimes personified), not a passive form of amō. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| dictionary:20:est | P, Y, O, LL | replace | est is a copular or auxiliary “is”, not “eats”. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| dictionary:20:hic | P, Y, S, O, LL | replace | Hic identifies the poet: “this is the one”. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| legacy:21:0 | P, Y, S, O, LL | replace | The poet is the talk of the city: iactaris is figurative, not physical throwing. → **iactō, iactāre, iactāvī, iactātum**: to toss about; here to bandy about in conversation [Lexical evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n25166/) |
| dictionary:22:facta | P, Y, S, O, LL | replace | Tua facta is the object of refers: “your deeds”. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| legacy:23:0 | P, S, O, LL | replace | Explain the Bacchic staff used metaphorically for a weightier poetic inspiration. → **thyrsus, thyrsī m.**: a staff carried by Bacchus and his followers [Lexical evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n48290/) |
| legacy:23:0 | Y | suppress | The proposed target th[y?]rso includes an uncertain reading; withhold a definite lexical match. |
| legacy:23:1 | P, Y, S, O, LL | replace | The comparative describes the more serious poetic impulse, not pregnancy. → **gravis, grave (comparative gravior)**: weighty, serious; graviore: more weighty or serious [Lexical evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n19937/) |
| legacy:24:0 | P, Y, S, O, LL | replace | Cessatum is the neuter passive participle in an impersonal perfect construction; correct the fourth principal part. → **cessō, cessāre, cessāvī, cessātum**: to delay, linger, be idle [Lexical evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n7622/) |
| dictionary:24:est | P, O, LL | replace | est is a copular or auxiliary “is”, not “eats”. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| dictionary:25:facta | P, Y, S, O, LL | replace | Facta virorum is the object of cane: “men’s deeds”. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| dictionary:26:est | P, Y, LL | replace | est is a copular or auxiliary “is”, not “eats”. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| dictionary:26:facta | P, Y, S, O, LL | replace | Facta agrees with area in a passive/resultative clause: “made/suited”. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| legacy:27:0 | P, Y, S, O, LL | replace | The girls sing the poet’s verses; the magical sense is not applicable here. → **cantō, cantāre, cantāvī, cantātum**: to sing [Lexical evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n6571/) |
| legacy:27:1 | P, Y, O, LL | replace | Lusit refers to the Muse’s playful poetry; repair the truncated definition. → **lūdō, lūdere, lūsī, lūsum**: to play; here to compose light or playful verse [Lexical evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n27169/) |
| legacy:27:1 | S | suppress | The witness reads [risit?], not lusit; lūdō is unsupported in this line. |
| dictionary:27:que | S | replace | Written que/quę is the relative pronoun quae in this syntax, not the enclitic conjunction -que. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| dictionary:27:tenere | P, Y, S | replace | Written tenere/tenerę represents tenerae modifying puellae; the context requires tener, not the infinitive tenēre. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| legacy:30:0 | P, Y, S, O, LL | replace | The spirit will fulfil Tragedy’s laws; expand the spelling note into a usable gloss. → **impleō, implēre, implēvī, implētum**: to fill, fulfil; inplēbit: will fulfil [Lexical evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n21948/) |
| dictionary:30:leges | P, Y, S, O, LL | replace | Leges is the object of implebit: the laws/rules of Tragedy. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| legacy:31:1 | P, Y, S, O, LL | replace | Pictis describes decorated buskins; correct the fourth principal part. → **pingō, pingere, pīnxī, pictum**: to paint, decorate, embroider [Lexical evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n36349/) |
| legacy:31:2 | P, O, LL | replace | Innixa describes Tragedy supported on her buskins; provide the deponent principal part. → **innītor, innītī, innīxus sum**: to lean or rest upon [Lexical evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n23553/) |
| legacy:31:2 | S | suppress | The witness reads inuicta rather than innixa; the leaning gloss is absent. |
| legacy:31:2 | Y | suppress | The written form is innexa rather than innixa; do not identify it as innītor. |
| legacy:32:1 | P | suppress | The target is an uncertain addition ⟨[.cæsarie?]⟩; do not present its identification as certain. |
| legacy:32:2 | P, Y, S, O, LL | replace | Terque quaterque counts the repeated movement; remove an unfinished explanatory fragment. → **ter (adv.)**: three times [Lexical evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n47829/) |
| dictionary:36:esse | P, Y, S, O, LL | replace | esse is a infinitive “be”, not “eat”. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| dictionary:36:me | LL | replace | me is a personal pronoun “me”, not a possessive adjective. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| dictionary:36:me | P, Y, S, O | replace | Me is a personal pronoun “me”, not a possessive adjective. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| legacy:37:1 | P, Y, S, O, LL | replace | Dignata is the deponent perfect participle; supply the complete principal part. → **dignor, dignārī, dignātus sum**: to deem worthy; to deign [Lexical evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n13933/) |
| dictionary:37:es | S, O, LL | replace | es is a copular “you are”, not “you eat”. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| dictionary:37:est | P, Y | replace | est is a copular or auxiliary “is”, not “eats”. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| legacy:38:0 | P, Y, S, O, LL | replace | Correct the fourth principal part in the metaphorical poetic contest. → **pugnō, pugnāre, pugnāvī, pugnātum**: to fight, contend [Lexical evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n39477/) |
| legacy:38:1 | P, Y, S, O, LL | replace | Versibus denotes poetic verses; the noun is masculine, not feminine. → **versus, versūs m.**: a line of verse [Lexical evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n50636/) |
| dictionary:38:me | P, Y, S, O, LL | replace | me is a personal pronoun “me”, not a possessive adjective. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| legacy:40:1 | P, Y, S, O, LL | replace | The adjective describes small doors or a short allowance of time; “strict, exact” misleads here. → **exiguus, exigua, exiguum**: small, little; short in extent or duration [Lexical evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n16876/) |
| dictionary:41:cura | P, Y, S, O, LL | replace | cura is a noun “care/concern”, not an imperative of cūrō. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| dictionary:41:est | P, Y, O, LL | replace | est is a copular or auxiliary “is”, not “eats”. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| dictionary:43:est | Y | replace | est is a copular or auxiliary “is”, not “eats”. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| dictionary:43:me | P, Y, S, O, LL | replace | me is a personal pronoun “me”, not a possessive adjective. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| dictionary:43:sine | Y, S, O, LL | replace | sine is a preposition with an ablative complement, not sinō or sinus. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| legacy:45:0 | P | suppress | The witness writes raserare; its identification with reserāre is not established by this review. |
| dictionary:46:est | P, Y, O, LL | replace | est is a copular or auxiliary “is”, not “eats”. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| legacy:47:1 | P, Y, S, O, LL | replace | Plus quam tu is a comparison, not “additionally, several, many”. → **plūs, plūris**: more [Lexical evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n29945/) |
| legacy:48:0 | P, Y, S, O, LL | replace | The eyebrow represents Tragedy’s disdain for conduct she would not tolerate. → **supercilium, superciliī n.**: eyebrow; figuratively, haughtiness or disdain [Lexical evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n46655/) |
| legacy:49:0 | P, Y, S, O, LL | replace | The keeper is deceived; remove the extra c and correct the fourth principal part. → **dēcipiō, dēcipere, dēcēpī, dēceptum**: to deceive, trick [Lexical evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n12498/) |
| dictionary:49:me | P, Y, S, O, LL | replace | me is a personal pronoun “me”, not a possessive adjective. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| legacy:50:0 | P, Y, S, O, LL | replace | The adjective refers to the fastened doorway, not concise expression. → **astrictus, astricta, astrictum**: fastened, barred, shut tight [Lexical evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n4175/) |
| legacy:51:1 | P, Y, S, O, LL | replace | Corinna slips from a bed; retain the relevant concrete sense. → **torus, torī m.**: a bed, couch [Lexical evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n48615/) |
| legacy:51:3 | P, Y, S, O, LL | replace | Velata describes Corinna covered by a loose tunic; correct “warp” and the principal part. → **vēlō, vēlāre, vēlāvī, vēlātum**: to cover, wrap, veil [Lexical evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n50371/) |
| legacy:52:0 | P, Y, S, O, LL | replace | Lewis–Short explicitly cites this verse for noiseless feet; correct the neuter ending. → **impercussus, impercussa, impercussum**: making no impact or noise; noiseless [Lexical evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n21865/) |
| legacy:53:1 | P, Y, S, O | suppress | This witness has a different verb (incisa, illusa or inlisa); infixa/infigō belongs only to LL here. |
| dictionary:53:a | LL | replace | Ā introduces an exclamation (“ah, how often”); it is not the preposition ā/ab. → **ā (interj.)**: ah! oh! [Lexical evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n1649/) |
| dictionary:53:incisa | P, Y | replace | Incisa describes something cut/inscribed into the door: incīdō from in-caedō, not incidō “fall into”. → **incīdō, incīdere, incīdī, incīsum**: to cut into, engrave, inscribe [Lexical evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n22338/) |
| dictionary:54:legi | P, S, O, LL | replace | Legi is a passive infinitive: the written poem is read by passers-by. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| dictionary:55:me | P, Y, S, O, LL | replace | me is a personal pronoun “me”, not a possessive adjective. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| dictionary:56:miseram | LL | replace | miseram is a adjective of distress, not a pluperfect form of mittō. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| dictionary:57:me | P, Y, S, O, LL | replace | me is a personal pronoun “me”, not a possessive adjective. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| legacy:58:0 | P | suppress | The witness writes at posita as separate words, not apposita; do not silently join or emend them. |
| legacy:58:0 | Y, S, O, LL | replace | The adjective describes water placed nearby; “appointed, assigned” is inappropriate. → **appositus, apposita, appositum**: placed nearby, at hand [Lexical evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n3177/) |
| legacy:58:2 | P, S | replace | The written mersit is the perfect of mergō, not the present mersat of mersō. → **mergō, mergere, mersī, mersum**: to immerse, sink [Lexical evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n28797/) |
| legacy:58:2 | Y | suppress | This shortened witness line has no mersat/mersit or corresponding verb. |
| dictionary:60:iam | P, Y, O, LL | replace | Iam is the temporal adverb “now/already” in this clause, not a form of eō. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| dictionary:60:que | S | replace | Written que/quę is the relative pronoun quae in this syntax, not the enclitic conjunction -que. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| legacy:61:0 | P, Y, S, O, LL | replace | Correct the fourth principal part and identify the pluperfect used here. → **dēsinō, dēsinere, dēsiī, dēsitum**: to cease, leave off; dēsierat: she had finished [Lexical evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n13385/) |
| dictionary:63:me | P, Y, S, O, LL | replace | me is a personal pronoun “me”, not a possessive adjective. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| dictionary:64:iam | P, Y, O, LL | replace | Iam is the temporal adverb “now/already” in this clause, not a form of eō. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| dictionary:64:ore | P, Y, S, O, LL | replace | ore is a mouth/face, not bone or a form of ōrō. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| dictionary:65:uicturum | O, LL | replace | victurum is a future participle “destined to live”, not “destined to conquer”. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| dictionary:65:uicturum | P, Y | replace | uicturum is a future participle “destined to live”, not “destined to conquer”. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| legacy:66:0 | P, S, O, LL | replace | Versibus denotes poetic verses; the noun is masculine, not feminine. → **versus, versūs m.**: a line of verse [Lexical evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n50636/) |
| legacy:66:0 | Y | suppress | The witness ends with the incomplete form uersi; this review does not supply the missing inflection. |
| legacy:67:0 | P, Y, S, O, LL | replace | The adjective describes small doors or a short allowance of time; “strict, exact” misleads here. → **exiguus, exigua, exiguum**: small, little; short in extent or duration [Lexical evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n16876/) |
| dictionary:68:est | P, LL | replace | est is a copular or auxiliary “is”, not “eats”. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| dictionary:69:teneri | P, Y, S, O, LL | replace | teneri is a adjective agreeing with amores, not a passive infinitive. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |

Input SHA-256 values:

```json
{
  "teiByWitnessSha256": {
    "P": "3925c157427ad457b9841656bfda3af6edf902ea55e802a26086697672e9dfbc",
    "Y": "f6989f5791b4b4da4ff6fa632a9c0147f527d2467a92db88d09bbbf8f2b584e5",
    "S": "d1056e804785873200ab4ca6e1dfb121d580cf11443f234d4d3902842eee1857",
    "O": "45794e148d1517eba1c9e57e09d5e390213413af75da0e7769dd505adbfeab76",
    "LL": "eeed28fa65888925b15a87a0278a876b0c4b61e0c739272ec9fb043282ebe2be"
  },
  "glossarySha256": "88854735be779374657d1f3c8442b7555d163866eacffd195d49678293a9cea7",
  "frequencySha256": "0071be2a4271288610d8217144819e5177dcca1235b78b41f6d97693b59e04f7",
  "formsSha256": "a0166f81bf1d784c27bf4c358a5d7aedd46c4dc774ef954683d14fba917ea15f"
}
```

Witness coverage:
- P: 70 numbered lines, 316 candidate decisions.
- Y: 70 numbered lines, 300 candidate decisions.
- S: 70 numbered lines, 253 candidate decisions.
- O: 70 numbered lines, 333 candidate decisions.
- LL: 70 numbered lines, 337 candidate decisions.

## 3.2: interventions and remaining withheld readings

| Candidate | Witnesses | Decision | Reason |
| --- | --- | --- | --- |
| legacy:1:0 | S | suppress | The written studios is incomplete/nonstandard; do not silently restore studiosus. |
| dictionary:4:amor | P, Y, O, LL | replace | amor is a noun “love” (sometimes personified), not a passive form of amō. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| dictionary:4:esset | O, LL | replace | esset is a subjunctive “be”, not “eat”. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| dictionary:4:facis | P, Y, S, O, LL | replace | facis is a second-person verb “you do/make”, not a form of fax. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| dictionary:5:cursum | Y | replace | cursum is a noun for the race, not a supine of currō. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| dictionary:5:cursus | P, O, LL | replace | cursus is a noun for the races, not a participial form of currō. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| dictionary:8:e | S | suppress | The isolated ē is an abbreviated component of the copular phrase, not the preposition ē; do not turn it into a word lookup. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| dictionary:8:esse | P, Y, O, LL | replace | esse is a infinitive “be”, not “eat”. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| legacy:10:1 | P, Y, S, O, LL | replace | Vehendus is the future passive participle: the speaker will be carried by the horses. → **vehō, vehere, vēxī, vectum**: to carry; passive, to ride or be borne [Lexical evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n50322/) |
| dictionary:10:forti | P, Y, S, O, LL | replace | forti is a adjective modifying mente, not the noun fors. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| dictionary:11:modo | P, Y, O, LL | replace | Repeated modo ... modo means “now ... now/at one time ... at another”. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| legacy:13:0 | S | suppress | This witness reads suspecta rather than conspecta; conspiciō is not the written verb. |
| legacy:15:1 | P, S, O, LL | replace | Complete the truncated spear gloss where hasta/asta is actually written. → **hasta, hastae f.**: a spear, lance [Lexical evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n20273/) |
| legacy:15:1 | Y | suppress | The witness has axe[u?] rather than hasta/asta; the spear gloss is absent. |
| legacy:19:0 | Y | suppress | The target refug[et?] contains uncertainty; withhold a definite lexical match. |
| legacy:19:1 | P, Y, S, O, LL | replace | Lewis–Short cites this verse for the lines separating seats in the circus; replace the unresolved row-of-seats suggestion. → **līnea, līneae f.**: a line; here a boundary marking seats [Lexical evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n26680/) |
| legacy:20:1 | P, Y, S, O, LL | replace | The Circus is the setting; remove the unfinished definition. → **circus, circī m.**: the circus, racecourse [Lexical evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n8377/) |
| dictionary:20:lege | P, Y, S, O, LL | replace | In lege loci refers to the rule of the seating-place, not the imperative of legō. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| legacy:21:0 | P, Y, O, LL | replace | Parce puellae is an imperative of parcō with a dative, not parcus “frugal”. → **parcō, parcere, pepercī, parsum**: to spare, show consideration for (+ dative) [Lexical evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n33828/) |
| legacy:21:0 | S | suppress | This witness reads parte rather than parce; do not insert the imperative parcō. |
| dictionary:21:es | P, Y, S, O, LL | replace | es is a copular “you are”, not “you eat”. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| dictionary:21:parte | S | suppress | The witness writes parte where the others have parce; the clause is not sufficiently clear to choose a contextual lemma safely. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| dictionary:22:tui | P, Y, O, LL | replace | tui is a possessive adjective agreeing with a noun, not the genitive of tū. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| legacy:23:0 | P, Y, S, O, LL | replace | Contrahe crura asks the neighbour to draw in his legs, not amass them. → **contrahō, contrahere, contrāxī, contractum**: to draw together or draw in [Lexical evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n10877/) |
| legacy:24:1 | P, Y | suppress | These witnesses have manu instead of genu; the knee gloss is absent. |
| legacy:24:1 | S, O, LL | replace | Supply a normal dictionary heading and a complete definition for genu. → **genū, genūs n.**: a knee [Lexical evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n19471/) |
| dictionary:24:est | P, Y, O, LL | replace | est is a copular or auxiliary “is”, not “eats”. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| dictionary:27:que | S | replace | Written que/quę is the relative pronoun quae in this syntax, not the enclitic conjunction -que. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| dictionary:28:quoque | P, Y, O, LL | suppress | Quoque here is quo + -que in the comparative-purpose expression, not the independent adverb quoque “also”; withhold the misleading lookup. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| dictionary:32:fortes | P, Y, S, O, LL | replace | fortes is a adjective modifying feras, not the noun fors. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| legacy:36:0 | P, Y, S, O, LL | replace | Condita refers to body parts hidden beneath clothing, not a constructed object. → **conditus, condita, conditum**: hidden, concealed; from condō [Lexical evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n10029/) |
| dictionary:36:que | S | replace | Written que/quę is the relative pronoun quae in this syntax, not the enclitic conjunction -que. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| dictionary:37:uentos | O, LL | replace | ventos is a noun for breezes, not a participial form of veniō. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| dictionary:37:uentos | P, Y, S | replace | uentos is a noun for breezes, not a participial form of veniō. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| dictionary:37:uis | P, Y, S, O, LL | replace | Vis governs arcessere: “do you wish to summon”; it is volō, not the noun vīs. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| legacy:38:0 | P, Y, S, O, LL | replace | The moving tablet creates a breeze; retain the physical object and its contextual use. → **tabella, tabellae f.**: a small board or tablet; here used as a fan [Lexical evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n47322/) |
| dictionary:39:est | P, Y, O, LL | replace | est is a copular or auxiliary “is”, not “eats”. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| dictionary:39:hic | P, Y, S, O, LL | replace | Hic modifies aestus: “this heat of mine”. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| legacy:40:0 | P, Y, S, O, LL | replace | Femineus qualifies love for a woman; the pejorative senses are not called for. → **fēmineus, fēminea, fēmineum**: of a woman, womanly [Lexical evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n17908/) |
| legacy:40:1 | P, Y, S, O, LL | replace | Love burns the speaker’s heart; repair the truncated fourth principal part. → **torreō, torrēre, torruī, tostum**: to scorch, burn [Lexical evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n48591/) |
| dictionary:40:amor | P, Y, O, LL | replace | amor is a noun “love” (sometimes personified), not a passive form of amō. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| dictionary:41:est | P, Y, LL | replace | est is a copular or auxiliary “is”, not “eats”. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| legacy:42:0 | P, Y, S, O, LL | replace | The vocative addresses unwanted dust; remove the incomplete trailing words. → **sordidus, sordida, sordidum**: dirty, filthy [Lexical evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n44788/) |
| dictionary:43:iam | P, Y, O, LL | replace | Iam is the temporal adverb “now/already” in this clause, not a form of eō. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| legacy:44:0 | P, Y, S, O, LL | replace | Tempus plausus means the time for applause; plausus is a fourth-declension noun, not the participle “struck”. → **plausus, plausūs m.**: clapping, applause [Lexical evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n36622/) |
| dictionary:45:uictoria | O, LL | replace | Victoria is a the goddess Victory, not a form of victor. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| dictionary:45:uictoria | P, Y, S | replace | uictoria is a the goddess Victory, not a form of victor. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| dictionary:46:amor | P, Y, O, LL | replace | amor is a noun “love” (sometimes personified), not a passive form of amō. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| dictionary:46:hic | P, Y, S, O, LL | replace | Hic modifies meus amor: “this love of mine”. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| legacy:47:0 | P, Y, S, O, LL | replace | The crowd is asked to applaud Neptune. → **plaudō, plaudere, plausī, plausum**: to applaud, clap for (+ dative) [Lexical evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n36608/) |
| dictionary:48:me | P, Y, S, O, LL | replace | me is a personal pronoun “me”, not a possessive adjective. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| legacy:50:0 | P, Y, S, O, LL | replace | Repertus describes love found amid peace; complete the truncated definition. → **repertus, reperta, repertum**: found, discovered [Lexical evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n41176/) |
| dictionary:50:amor | P, Y, S, O, LL | replace | amor is a noun “love” (sometimes personified), not a passive form of amō. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| legacy:51:1 | P | suppress | This witness writes venatibus, a noun, rather than venantibus; do not equate it with the participle of vēnor. |
| legacy:51:1 | Y, S, O, LL | replace | Venantibus is the participle “those hunting”; supply the deponent principal part. → **vēnor, vēnārī, vēnātus sum**: to hunt [Lexical evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n50445/) |
| legacy:53:0 | Y | suppress | Ruric[i?]lae contains an uncertain letter; withhold a certain lemma match. |
| legacy:53:1 | P, Y, S, O, LL | replace | The farmers are called on to rise for Ceres and Bacchus. → **assurgō, assurgere, assurrēxī, assurrēctum**: to rise, stand up in honour of (+ dative) [Lexical evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n4112/) |
| legacy:58:1 | P, Y, S, O, LL | replace | Signa is the plural noun, object of dedit, not the verb signō. → **signum, signī n.**: a sign, signal [Lexical evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n44227/) |
| dictionary:63:forte | P, Y, S, O, LL | replace | forte is a adverb “perhaps/by chance”, not fortis or the noun fors. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| legacy:64:1 | P, Y, S, O, LL | replace | Inseruisse pedes means put the feet into the railings; replace the principal parts of the distinct sow/graft verb. → **īnserō, īnserere, īnseruī, īnsertum**: to put into, insert [Lexical evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n23805/) |
| dictionary:65:iam | P, Y, O, LL | replace | Iam is the temporal adverb “now/already” in this clause, not a form of eō. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| dictionary:69:me | LL | replace | me is a personal pronoun “me”, not a possessive adjective. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| dictionary:69:me | P, Y, S, O | replace | Me is a personal pronoun “me”, not a possessive adjective. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| dictionary:69:miseram | Y | replace | miseram is a adjective of distress, not a pluperfect form of mittō. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| legacy:70:2 | P, Y, S, O, LL | replace | The nearest charioteer advances alongside; turn the colonless note into a complete gloss. → **subeō, subīre, subiī, subitum**: to approach, draw near [Lexical evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n45844/) |
| dictionary:70:facis | P, Y, S, O, LL | replace | facis is a second-person verb “you do/make”, not a form of fax. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| legacy:71:1 | P, Y, S, O, LL | replace | Vota denotes the girl’s wishes/prayers for victory, not a participle “vowed”. → **vōtum, vōtī n.**: a vow, prayer, wish [Lexical evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n51403/) |
| dictionary:71:facis | P, Y, S, O, LL | replace | facis is a second-person verb “you do/make”, not a form of fax. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| legacy:72:0 | P, Y, S, O, LL | replace | Sinistra agrees with manu: the left hand, not hostility. → **sinister, sinistra, sinistrum**: left [Lexical evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n44397/) |
| legacy:74:2 | Y | suppress | The toga target has uncertain duplicated letters to[gis?].[gis?]; retain the source uncertainty without a definite match. |
| legacy:75:0 | P, Y, S, O, LL | replace | Complete the truncated definition of capillus. → **capillus, capillī m.**: hair of the head; a hair [Lexical evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n6613/) |
| legacy:76:0 | S | suppress | The witness reads addas, not abdas; abdō is absent. |
| legacy:78:0 | P, S, O, LL | replace | The team rushes out of the gates; complete the truncated definition. → **ēvolō, ēvolāre, ēvolāvī, ēvolātum**: to fly out, rush forth [Lexical evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n16510/) |
| legacy:78:0 | Y | suppress | The witness writes euoluat rather than euolat; this review does not normalize it to ēvolō. |
| legacy:78:1 | P, Y, S, O, LL | replace | Admissis equis describes horses let go at full speed, not simply admitted indoors. → **admissus, admissa, admissum**: let loose, given free rein; from admittō [Lexical evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n902/) |
| legacy:79:1 | P, Y, S, O, LL | replace | The exhortation tells the driver to press on over the open track. → **īnsurgō, īnsurgere, īnsurrēxī, īnsurrēctum**: to rise up; here press on with effort [Lexical evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n24072/) |
| legacy:79:2 | P, Y, S, O, LL | replace | Patenti modifies the available space of the track. → **patēns, patentis**: open, unobstructed [Lexical evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n34095/) |
| legacy:80:0 | P, Y, S, O, LL | replace | Vota denotes the girl’s wishes/prayers for victory, not a participle “vowed”. → **vōtum, vōtī n.**: a vow, prayer, wish [Lexical evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n51403/) |
| dictionary:82:est | P, Y, LL | replace | est is a copular or auxiliary “is”, not “eats”. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| dictionary:84:est | P, Y, O, LL | replace | est is a copular or auxiliary “is”, not “eats”. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| dictionary:84:hic | S, O | replace | Hic is locative “here” in the written O/S variant; the other place is contrasted. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |

Input SHA-256 values:

```json
{
  "teiByWitnessSha256": {
    "P": "b415627995f2d59b5570a23c008ec2749827006b980f36965d9b1450a3fe6c3c",
    "Y": "2c4d362b78ed5a8d15a96806ad521d7a3e083ef4fccc92e1083512ec12c629a6",
    "S": "7c2e9cf92571cfaac9e346f22611bf1cbfc156f160bc629f16b547d445f86a17",
    "O": "9cd42192cb4b67f4c6f7eeec4533f61feede378da3259e3c3d64c5ff5799a124",
    "LL": "33fd8de45c6ef42f096cb2332d9f5af1b6ea526ee837a9b5b98aef5be4c19f25"
  },
  "glossarySha256": "d436312ea9b315a581561d6574ac2771a8ed906b80eb68b471c8c4473ce67227",
  "frequencySha256": "0071be2a4271288610d8217144819e5177dcca1235b78b41f6d97693b59e04f7",
  "formsSha256": "a0166f81bf1d784c27bf4c358a5d7aedd46c4dc774ef954683d14fba917ea15f"
}
```

Witness coverage:
- P: 84 numbered lines, 353 candidate decisions.
- Y: 84 numbered lines, 358 candidate decisions.
- S: 84 numbered lines, 240 candidate decisions.
- O: 84 numbered lines, 370 candidate decisions.
- LL: 84 numbered lines, 372 candidate decisions.

## 3.3: interventions and remaining withheld readings

| Candidate | Witnesses | Decision | Reason |
| --- | --- | --- | --- |
| legacy:1:0 | Y, S, O | suppress | The witness does not securely read the standalone imperative ī: Y/O have hic and S has an unclear sequence. |
| dictionary:1:e | S | suppress | The token E is the detached decorated initial of E sse, not the preposition ē. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| dictionary:1:esse | P, Y, O, LL | replace | Esse is a infinitive “be”, not “eat”. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| dictionary:1:hic | Y, O | replace | Hic modifies crede: “here/now believe”; it does not agree with a noun. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| dictionary:2:facies | P, Y, S, O, LL | replace | facies is a noun “appearance”, subject of manet, not a future verb. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| dictionary:2:que | Y, S | replace | Written que/quę is the relative pronoun quae in this syntax, not the enclitic conjunction -que. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| legacy:3:1 | P, Y, S, O, LL | replace | Complete the truncated definition of capillus. → **capillus, capillī m.**: hair of the head; a hair [Lexical evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n6613/) |
| legacy:5:3 | P, Y | suppress | The witness has colore (P) or robore (Y), not rubore; rubor is absent from this verse. |
| dictionary:6:ore | P, Y, S, O, LL | replace | ore is a mouth/face, not bone or a form of ōrō. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| legacy:7:0 | P, Y, S, O, LL | replace | The size of the foot is described; remove unrelated senses. → **exiguus, exigua, exiguum**: small, little [Lexical evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n16876/) |
| legacy:7:1 | P, S | suppress | This witness reads aptissima, not artissima; the artus gloss is unsupported. |
| dictionary:7:est | P, Y, O, LL | replace | est is a copular or auxiliary “is”, not “eats”. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| legacy:9:1 | S | suppress | The radiating verb is marked uncertain [radiauit?]; do not assert a definite form identification. |
| legacy:10:0 | P, Y, S, O, LL | replace | Mentita is deponent; correct its principal part. → **mentior, mentīrī, mentītus sum**: to lie, speak falsely [Lexical evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n28730/) |
| dictionary:10:est | P, Y, LL | replace | est is a copular or auxiliary “is”, not “eats”. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| legacy:13:1 | P, Y, S, O, LL | replace | Recordor is deponent; correct the principal part. → **recordor, recordārī, recordātus sum**: to recall, remember [Lexical evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n40641/) |
| legacy:14:0 | P, Y, S, O | suppress | Only LL has en; the other witnesses have et, an ampersand, or a different abbreviation. |
| legacy:16:0 | P, Y, S, O, LL | replace | Alterius meriti is a genitive noun phrase about another person’s desert or conduct, not merely the adjective “earned”. → **meritum, meritī n.**: what is deserved; an act or conduct meriting a consequence [Lexical evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n28816/) |
| dictionary:16:damna | P, Y, S, O, LL | replace | damna is a plural noun “losses”, object of tuli, not an imperative. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| dictionary:17:est | P, Y, LL | replace | est is a copular or auxiliary “is”, not “eats”. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| dictionary:18:male | P, Y, S, O, LL | replace | male is a adverb modifying formosa or vitabas, not a vocative adjective. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| dictionary:19:est | P, Y, O, LL | replace | est is a copular or auxiliary “is”, not “eats”. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| dictionary:19:sine | P, Y, O, LL | replace | sine is a preposition with an ablative complement, not sinō or sinus. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| legacy:20:0 | S | suppress | The witness has [lusos?] and irride multa; neither the uncertain lūsōs nor inulta supports a confident retained gloss. |
| legacy:20:1 | S | suppress | The witness has [lusos?] and irride multa; neither the uncertain lūsōs nor inulta supports a confident retained gloss. |
| legacy:21:0 | S | suppress | This witness has reluant rather than redimat; redimō is absent. |
| legacy:21:1 | P, Y, S, O, LL | replace | The poem concerns false swearing; give the specific noun sense. → **periūrium, periūriī n.**: a false oath, perjury [Lexical evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n35132/) |
| dictionary:21:nostrum | P, Y | suppress | The transmitted per nostrum ... poenam does not show grammatical agreement; do not confidently resolve this corrupt phrase to noster or nos. |
| legacy:22:0 | S | suppress | The whole relevant phrase is uncertain ([Virgine?] [decepta?] [deceptore?]); no confident lexical output is warranted. |
| legacy:22:1 | S | suppress | The whole relevant phrase is uncertain ([Virgine?] [decepta?] [deceptore?]); no confident lexical output is warranted. |
| dictionary:23:est | P, Y, O, LL | replace | est is a copular or auxiliary “is”, not “eats”. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| dictionary:23:sine | P, Y, S, O, LL | replace | sine is a preposition with an ablative complement, not sinō or sinus. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| legacy:24:0 | S | suppress | The witness writes forma, not stulta; stultus is absent. |
| legacy:25:0 | P, Y, O, LL | replace | Correct the pronoun forms; the conditional indefinite may be written as one word or separately. → **sī quis, sī qua, sī quid**: if anyone, if anything; if any [Lexical evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n44439/) |
| legacy:25:0 | S | suppress | The witness has At tu sis, not si quis/siquis; the conditional indefinite is absent. |
| dictionary:25:est | P, Y, O, LL | replace | est is a copular or auxiliary “is”, not “eats”. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| legacy:27:0 | P | suppress | The target [ensi?] is marked uncertain; withhold a definite sword identification. |
| legacy:31:0 | P, Y, S, O, LL | replace | The gods fear offending beautiful women; physical collision is not the sense here. → **offendō, offendere, offendī, offēnsum**: to offend, displease, injure [Lexical evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n32359/) |
| dictionary:32:que | S | replace | Written que/quę is the relative pronoun quae in this syntax, not the enclitic conjunction -que. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| legacy:33:0 | P | suppress | The tura phrase is uncertain and focis is missing; do not borrow the complete line from another witness. |
| legacy:33:0 | S | suppress | Tura is absent and [focis?] is uncertain in this witness. |
| legacy:33:0 | Y | suppress | The witness has [piatur?], not a secure tura; withhold the incense gloss. |
| legacy:33:1 | P | suppress | The tura phrase is uncertain and focis is missing; do not borrow the complete line from another witness. |
| legacy:33:1 | S | suppress | Tura is absent and [focis?] is uncertain in this witness. |
| legacy:34:0 | P, Y, S, O, LL | replace | Plus animi means more spirit/courage; replace “additionally, several, many”. → **plūs, plūris**: more [Lexical evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n29945/) |
| dictionary:34:certe | LL | replace | certe is a adverb “certainly/at least”, not a vocative adjective. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| dictionary:34:certe | P, Y, S, O | replace | Certe is a adverb “certainly/at least”, not a vocative adjective. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| legacy:35:1 | P, Y, S, O, LL | replace | Jupiter strikes groves and citadels with his fire; give the deponent principal part and the transitive sense. → **iaculor, iaculārī, iaculātus sum**: to hurl at, strike with a missile [Lexical evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n25181/) |
| legacy:36:2 | P, Y, S, O, LL | suppress | No aliquī/aliquis form occurs in this line in any witness; this glossary item was attached to the wrong verse. |
| legacy:38:0 | P, Y, S, O, LL | replace | The punishment is found for Semele’s compliance; repair the unfinished definition. → **repertus, reperta, repertum**: found, devised [Lexical evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n41176/) |
| dictionary:38:est | P, Y, LL | replace | est is a copular or auxiliary “is”, not “eats”. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| legacy:39:0 | P, Y, S, O, LL | replace | Semele might have withdrawn from her coming lover, not lifted herself up. → **subdūcō, subdūcere, subdūxī, subductum**: to withdraw; se subducere: to keep oneself away [Lexical evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n45834/) |
| dictionary:43:sine | P, Y, S, O, LL | replace | sine is a preposition with an ablative complement, not sinō or sinus. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| dictionary:44:ore | Y, S, O, LL | replace | ore is a mouth/face, not bone or a form of ōrō. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| legacy:45:0 | P, Y, S, O, LL | replace | Verum qualifies the truth of the women’s oath; it does not mean “still”. → **vērus, vēra, vērum**: true; vērum iurāre: to swear truthfully [Lexical evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n50667/) |
| legacy:46:0 | S | suppress | The witness reads triuiis rather than tetricis; the tetricus gloss is absent. |
| dictionary:46:esse | P, Y, O, LL | replace | esse is a infinitive “be”, not “eat”. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| legacy:47:0 | P, Y, O, LL | replace | Moderatius modifies utere adverbially: use the gift with more restraint. → **moderātē (comparative moderātius)**: moderately; more moderately [Lexical evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n29365/) |
| legacy:47:0 | S | suppress | Moderat[i?]ꝰ contains an uncertain letter; withhold a definite lexical identification. |
| dictionary:47:dono | P, Y, S, O, LL | replace | dono is a noun “gift” governed by utere, not the verb dōnō. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| dictionary:48:certe | P, Y, S, O, LL | replace | certe is a adverb “certainly/at least”, not a vocative adjective. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |

Input SHA-256 values:

```json
{
  "teiByWitnessSha256": {
    "P": "15dd0bace511ca98a2723ebfb96b5f190b5d14d8d214c69e9147b66caf47ba8a",
    "Y": "461314320604a59b89821340b35372dec31fcf4da4712a680f9191d6bda58ade",
    "S": "cf344617d25f5d8cc877e198d67413c99e9927500ba8027b963e4d4e4a4a6a7c",
    "O": "4979614782f2573dfe00907d740ee22854b3ff375f725d4bf23aefa1441ea405",
    "LL": "16762216bd1fae553a4187dddb6102e25413e68e0589b6ad231efcb17c2a74ab"
  },
  "glossarySha256": "1d103947ac92908f494c22ee1cdda99325b5dc770ba885d793cf2fffa8c91645",
  "frequencySha256": "0071be2a4271288610d8217144819e5177dcca1235b78b41f6d97693b59e04f7",
  "formsSha256": "a0166f81bf1d784c27bf4c358a5d7aedd46c4dc774ef954683d14fba917ea15f"
}
```

Witness coverage:
- P: 48 numbered lines, 209 candidate decisions.
- Y: 48 numbered lines, 217 candidate decisions.
- S: 48 numbered lines, 167 candidate decisions.
- O: 48 numbered lines, 221 candidate decisions.
- LL: 48 numbered lines, 224 candidate decisions.

## 3.4: interventions and remaining withheld readings

| Candidate | Witnesses | Decision | Reason |
| --- | --- | --- | --- |
| legacy:1:0 | S | suppress | The proposed target [inposito?] is explicitly uncertain. |
| dictionary:1:tenere | S | replace | Written tenere/tenerę represents tenerae modifying puellae; the context requires tener, not the infinitive tenēre. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| legacy:2:0 | P, Y, S, O, LL | replace | Correct the deponent principal part; guarding is the relevant sense. → **tueor, tuērī, tuitus sum**: to watch over, guard, protect [Lexical evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n49372/) |
| dictionary:2:est | P, Y, LL | replace | est is a copular or auxiliary “is”, not “eats”. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| legacy:3:0 | P, Y, S, O, LL | replace | Correct the pronoun forms; the conditional indefinite may be written as one word or separately. → **sī quis, sī qua, sī quid**: if anyone, if anything; if any [Lexical evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n44439/) |
| dictionary:3:est | P, Y, LL | replace | est is a copular or auxiliary “is”, not “eats”. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| dictionary:4:que | S | replace | Written que/quę is the relative pronoun quae in this syntax, not the enclitic conjunction -que. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| legacy:5:0 | P, Y, O, LL | replace | Adultera modifies mens and is an adjective; Lewis–Short cites this verse for that sense. → **adulter, adultera, adulterum**: adulterous, unfaithful [Lexical evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n1030/) |
| legacy:5:0 | S | suppress | The adultery adjective is written as uncertain [adultā?]. |
| dictionary:5:est | P, Y, O, LL | replace | est is a copular or auxiliary “is”, not “eats”. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| dictionary:5:iam | P, Y, O, LL | replace | Iam is the temporal adverb “now/already” in this clause, not a form of eō. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| legacy:7:0 | P, Y, S, O, LL | replace | Correct claudere to the third-conjugation infinitive. → **claudō, claudere, clausī, clausum**: to shut, close [Lexical evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n8535/) |
| legacy:8:0 | S | suppress | The witness reads occlusis, not exclusis; do not transfer the excluded gloss. |
| legacy:8:1 | P, Y, S, O, LL | replace | Intus is an adverb and has no feminine inta or neuter intum. → **intus (adv.)**: within, inside [Lexical evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n24654/) |
| legacy:8:2 | P, Y, O, LL | replace | Intus adulter erit has a masculine noun as its subject. → **adulter, adulterī m.**: an adulterer, illicit lover [Lexical evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n1029/) |
| legacy:8:2 | S | suppress | The written [adult̄?] is uncertain; withhold a definite adulterer identification. |
| legacy:10:1 | S | suppress | The target [neqūe?] is uncertain. |
| legacy:12:0 | P | suppress | The target is inside [Obsequio uinces?], an uncertain reading. |
| legacy:13:1 | P | suppress | Tenacem belongs to the uncertain span [equum contra sua uincla tenacem?]. |
| dictionary:14:modo | P, Y, O, LL | replace | Fulminis modo is an ablative noun phrase “in the manner of lightning”. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| dictionary:14:ore | LL | replace | ore is a mouth/face, not bone or a form of ōrō. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| dictionary:14:ore | P, Y, S, O | replace | Ore is a mouth/face, not bone or a form of ōrō. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| dictionary:15:constitit | LL | replace | constitit is a the subject stops/takes its stand, not constō. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| dictionary:15:constitit | Y, S, O | replace | Constitit is a the subject stops/takes its stand, not constō. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| dictionary:15:primum | P, Y, O, LL | replace | primum is a adverb in ut primum “as soon as”, not an adjective. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| legacy:16:1 | P, Y, S, O, LL | replace | Effusa describes the horse’s loose mane; repair the broken generic wording. → **effūsus, effūsa, effūsum**: flowing loose, spread out [Lexical evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n15293/) |
| legacy:16:3 | P, Y, S, O, LL | replace | Iuba is the flowing mane, not the crest of the horse. → **iuba, iubae f.**: a mane [Lexical evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n25260/) |
| legacy:17:0 | P, Y, S, O, LL | replace | Nitimur in vetitum describes striving for the forbidden; correct the deponent principal part. → **nītor, nītī, nīsus sum**: to strive, press toward [Lexical evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n31035/) |
| legacy:17:1 | P, Y, O, LL | replace | The substantivized participle is the object of striving. → **vetitum, vetitī n.**: what is forbidden, a forbidden thing [Lexical evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n50764/) |
| legacy:17:1 | S | suppress | The written [inuetitū?] is uncertain; do not separate and confidently identify vetitum. |
| dictionary:20:amor | O, LL | replace | Amor is a noun “love” (sometimes personified), not a passive form of amō. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| dictionary:20:amor | P, Y, S | replace | amor is a noun “love” (sometimes personified), not a passive form of amō. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| legacy:21:1 | S | suppress | The proposed target [Ꝑennē?] is uncertain. |
| dictionary:21:per | Y | suppress | Per is the first written segment of per ennem (perennem), not an independent preposition. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| dictionary:22:que | S | replace | Written que/quę is the relative pronoun quae in this syntax, not the enclitic conjunction -que. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| dictionary:25:que | Y | suppress | Que quid is a divided/nonstandard rendering of the surrounding indefinite expression; it is not a standalone conjunction -que. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| dictionary:26:cura | LL | replace | cura is a noun “care/concern”, not an imperative of cūrō. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| dictionary:26:cura | Y, S, O | replace | Cura is a noun “care/concern”, not an imperative of cūrō. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| dictionary:28:esse | Y, S, O, LL | replace | esse is a infinitive “be”, not “eat”. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| legacy:29:1 | S | suppress | The target [adultā?] is uncertain. |
| legacy:31:0 | P, Y, S, O, LL | replace | Indignere is a deponent subjunctive; supply its proper principal part. → **indignor, indignārī, indignātus sum**: to be indignant, resent [Lexical evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n22823/) |
| legacy:32:0 | P | suppress | The conditional indefinite falls within [siqua potest?], an uncertain span. |
| legacy:32:0 | Y, S, O, LL | replace | Correct the pronoun forms; the conditional indefinite may be written as one word or separately. → **sī quis, sī qua, sī quid**: if anyone, if anything; if any [Lexical evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n44439/) |
| dictionary:32:sola | LL | replace | sola is a adjective referring to the woman, not the noun solum. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| dictionary:32:sola | P, Y, S, O | replace | Sola is a adjective referring to the woman, not the noun solum. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| dictionary:33:est | P, Y, O, LL | replace | est is a copular or auxiliary “is”, not “eats”. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| legacy:34:0 | P | suppress | Externae belongs to an uncertain multiword span in this witness. |
| dictionary:34:est | Y | replace | est is a copular or auxiliary “is”, not “eats”. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| dictionary:34:hic | P, Y, S, O, LL | replace | Hic modifies metus: “this fear”. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| dictionary:36:laudem | Y, S, O, LL | replace | laudem is a noun “praise” after in, not a subjunctive of laudō. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| dictionary:36:tui | Y, S, O, LL | replace | tui is a possessive adjective agreeing with a noun, not the genitive of tū. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| legacy:37:1 | P, S | suppress | The adultery adjective is in an explicitly uncertain span. |
| legacy:37:1 | Y, O, LL | replace | Adultera modifies coniunx rather than forming a separate noun phrase. → **adulter, adultera, adulterum**: adulterous, unfaithful [Lexical evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n1030/) |
| dictionary:37:est | P, Y, O, LL | replace | est is a copular or auxiliary “is”, not “eats”. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| dictionary:39:sine | Y, S, O, LL | replace | sine is a preposition with an ablative complement, not sinō or sinus. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| legacy:44:2 | P, S, O, LL | replace | Correct the deponent principal part; guarding is the relevant sense. → **tueor, tuērī, tuitus sum**: to watch over, guard, protect [Lexical evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n49372/) |
| legacy:44:2 | Y | suppress | The proposed target crosses the deletion tu⟦[en?]⟧ere; this review does not resolve the altered reading. |
| dictionary:48:que | Y, S | replace | Written que/quę is the relative pronoun quae in this syntax, not the enclitic conjunction -que. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |

Input SHA-256 values:

```json
{
  "teiByWitnessSha256": {
    "P": "a1bfc741890597f356d5990d11badbc37141fd6222e12f145f0ad1b2fcf39eb4",
    "Y": "066d4d396f3e4416d7f28c07754a9fc6dba9f865c2147b92ff85b7b33b80ae42",
    "S": "453554784c0ef986b37c8aab4bf60dd99fa711bfe88c330c640fdd2d91a7c329",
    "O": "08f593ccb4f62bc594949338b342102b08b63817e5ff1abd37d010898f98f7e7",
    "LL": "79a190cf943929047987cb7fcba5f8280e50bd595be15b162c7efe00b0dfdeb4"
  },
  "glossarySha256": "f1997217abd77c96154f02985f1a7494653df947a654531cbd0fc637f14b0b22",
  "frequencySha256": "0071be2a4271288610d8217144819e5177dcca1235b78b41f6d97693b59e04f7",
  "formsSha256": "a0166f81bf1d784c27bf4c358a5d7aedd46c4dc774ef954683d14fba917ea15f"
}
```

Witness coverage:
- P: 48 numbered lines, 187 candidate decisions.
- Y: 48 numbered lines, 220 candidate decisions.
- S: 48 numbered lines, 175 candidate decisions.
- O: 48 numbered lines, 221 candidate decisions.
- LL: 48 numbered lines, 224 candidate decisions.

## 3.5: interventions and remaining withheld readings

| Candidate | Witnesses | Decision | Reason |
| --- | --- | --- | --- |
| dictionary:2:animum | P, Y, O, LL | replace | animum is a noun for the speaker’s mind, not anima. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| legacy:5:4 | P, Y, S, O, LL | replace | Prato denotes meadowland; remove the unrelated unfinished crop sentence. → **prātum, prātī n.**: a meadow [Lexical evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n38217/) |
| legacy:6:2 | S | suppress | The ending in sonant[is?] is uncertain; withhold a definite matched entry. |
| legacy:7:0 | P, Y, S, O, LL | replace | Arboreis frondibus means tree foliage, not leaves made of wood. → **arboreus, arborea, arboreum**: of a tree, belonging to trees [Lexical evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n3378/) |
| dictionary:7:frondibus | P, Y, O, LL | replace | Arboreis frondibus denotes tree foliage: frōns/frondis, not forehead frōns/frontis. → **frōns, frondis f.**: foliage, a leafy branch [Lexical evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n18844/) |
| legacy:8:0 | P, Y, S, O, LL | replace | Fronde is the ablative of foliage frōns/frondis, not the verb frondeō or forehead frōns/frontis. → **frōns, frondis f.**: foliage, a leafy branch [Lexical evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n18844/) |
| legacy:8:1 | P | suppress | The glossary target is absent, lost, or explicitly uncertain in this witness; do not fill it from the complete witnesses. |
| legacy:10:0 | P | suppress | The glossary target is absent, lost, or explicitly uncertain in this witness; do not fill it from the complete witnesses. |
| dictionary:10:constitit | LL | replace | constitit is a the subject stops/takes its stand, not constō. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| dictionary:10:constitit | P, Y, S, O | replace | Constitit is a the subject stops/takes its stand, not constō. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| dictionary:11:cecidere | P, Y, S, O, LL | replace | cecidere is a snow has fallen; perfect of cadō, not caedō “cut”. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| legacy:13:0 | Y | suppress | The witness reads sumpsit, not spumis; the foam gloss is absent. |
| dictionary:14:modo | P, Y, O, LL | replace | Modo is temporal “just now/recently”, modifying the milking. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| legacy:15:0 | P | suppress | The glossary target is absent, lost, or explicitly uncertain in this witness; do not fill it from the complete witnesses. |
| legacy:17:2 | P, Y, S, O, LL | replace | The text has active ruminat; Lewis–Short cites this exact verse under the active form rūminō. → **rūminō, rūmināre**: to chew the cud [Lexical evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n42005/) |
| legacy:18:1 | P, Y, S, O, LL | replace | Complete and normalize the food gloss. → **cibus, cibī m.**: food [Lexical evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n7957/) |
| dictionary:18:facto | Y | replace | Facto agrees with cibo in Y’s written variant: food prepared/made, not a noun for a deed. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| legacy:19:0 | P | suppress | The glossary target is absent, lost, or explicitly uncertain in this witness; do not fill it from the complete witnesses. |
| legacy:19:0 | Y, S, O, LL | replace | Sleep removes strength; correct the fourth principal part. → **adimō, adimere, adēmī, ademptum**: to take away, deprive of [Lexical evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n799/) |
| legacy:20:0 | P | suppress | The glossary target is absent, lost, or explicitly uncertain in this witness; do not fill it from the complete witnesses. |
| legacy:20:1 | P | suppress | The glossary target is absent, lost, or explicitly uncertain in this witness; do not fill it from the complete witnesses. |
| legacy:20:1 | S, O, LL | replace | The bull lays its head on the ground; supply the specific sense. → **dēpōnō, dēpōnere, dēposuī, dēpositum**: to lay or put down [Lexical evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n13201/) |
| legacy:20:1 | Y | suppress | The witness reads disposuisse, not deposuisse; dēpōnō is unsupported. |
| legacy:21:3 | P | suppress | The glossary target is absent, lost, or explicitly uncertain in this witness; do not fill it from the complete witnesses. |
| legacy:22:1 | Y | suppress | The garrula target touches an uncertain deletion; its clean form is not securely established here. |
| legacy:23:2 | P, Y, S, O, LL | replace | The adjective describes the crow’s intrusive beak or action. → **petulāns, petulantis**: forward, aggressive, impudent [Lexical evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n35852/) |
| legacy:24:1 | P, Y, S, O, LL | replace | The crow pulls out the cow’s white hair. → **iuba, iubae f.**: mane, long hair [Lexical evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n25260/) |
| dictionary:24:ore | P, Y, S, O, LL | replace | ore is a mouth/face, not bone or a form of ōrō. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| legacy:29:1 | P | suppress | The relevant target is lost or only supplied as an uncertain reading in P; the complete reading of another witness is not evidence for P. |
| legacy:29:1 | S | suppress | The initial letters of [im?]miscuit are uncertain; withhold a confident lexical match. |
| legacy:30:0 | P | suppress | The relevant target is lost or only supplied as an uncertain reading in P; the complete reading of another witness is not evidence for P. |
| legacy:31:0 | P | suppress | The relevant target is lost or only supplied as an uncertain reading in P; the complete reading of another witness is not evidence for P. |
| dictionary:31:es | Y, S, O, LL | replace | es is a copular “you are”, not “you eat”. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| legacy:32:0 | P | suppress | The relevant target is lost or only supplied as an uncertain reading in P; the complete reading of another witness is not evidence for P. |
| legacy:32:0 | Y, S, O, LL | replace | Correct the pronoun forms; the conditional indefinite may be written as one word or separately. → **sī quis, sī qua, sī quid**: if anyone, if anything; if any [Lexical evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n44439/) |
| dictionary:33:e | Y | suppress | The e belongs to e{!}rgo interrupted by a mark; it is not the independent preposition ē. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| legacy:34:0 | P | suppress | The relevant target is lost or only supplied as an uncertain reading in P; the complete reading of another witness is not evidence for P. |
| legacy:34:0 | Y, S, O, LL | replace | The interpreter weighs each detail in his mind; correct “weight out”. → **expendō, expendere, expendī, expensum**: to weigh; consider carefully [Lexical evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n17005/) |
| legacy:34:1 | P | suppress | The relevant target is lost or only supplied as an uncertain reading in P; the complete reading of another witness is not evidence for P. |
| legacy:35:0 | P | suppress | The relevant target is lost or only supplied as an uncertain reading in P; the complete reading of another witness is not evidence for P. |
| legacy:35:1 | P | suppress | The relevant target is lost or only supplied as an uncertain reading in P; the complete reading of another witness is not evidence for P. |
| dictionary:36:male | Y, S, O, LL | replace | male is a adverb modifying formosa or vitabas, not a vocative adjective. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| dictionary:37:color | Y, S, O, LL | replace | color is a noun “colour”, not a passive form of colō. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| dictionary:37:est | Y, LL | replace | est is a copular or auxiliary “is”, not “eats”. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |
| legacy:38:0 | Y, S, O, LL | replace | Compare refers to the cow as the bull’s mate; Lewis–Short gives a substantive partner sense. → **compar, comparis**: a mate, partner; as an adjective, matching or equal [Lexical evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n9517/) |
| legacy:40:0 | P | suppress | The relevant target is lost or only supplied as an uncertain reading in P; the complete reading of another witness is not evidence for P. |
| legacy:40:1 | P | suppress | The relevant target is lost or only supplied as an uncertain reading in P; the complete reading of another witness is not evidence for P. |
| legacy:41:0 | P | suppress | The relevant target is lost or only supplied as an uncertain reading in P; the complete reading of another witness is not evidence for P. |
| legacy:41:0 | Y, S, O, LL | replace | Cunctata is the perfect participle of a deponent verb. → **cunctor, cunctārī, cunctātus sum**: to delay, hesitate [Lexical evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n11913/) |
| legacy:43:0 | P | suppress | The relevant target is lost or only supplied as an uncertain reading in P; the complete reading of another witness is not evidence for P. |
| legacy:43:1 | P | suppress | The relevant target is lost or only supplied as an uncertain reading in P; the complete reading of another witness is not evidence for P. |
| legacy:44:0 | P | suppress | The relevant target is lost or only supplied as an uncertain reading in P; the complete reading of another witness is not evidence for P. |
| legacy:44:1 | P | suppress | The relevant target is lost or only supplied as an uncertain reading in P; the complete reading of another witness is not evidence for P. |
| legacy:44:1 | Y, S, O, LL | replace | Labe adulterii is the stain of adultery, not the homonymous noun for collapse. → **lābēs, lābis f.**: a stain, blemish; moral taint [Lexical evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n25483/) |
| legacy:45:0 | P | suppress | The relevant target is lost or only supplied as an uncertain reading in P; the complete reading of another witness is not evidence for P. |
| dictionary:45:ore | Y, S, O, LL | replace | ore is a mouth/face, not bone or a form of ōrō. [Lexical evidence](https://dcc.dickinson.edu/latin-core-list1) |

Input SHA-256 values:

```json
{
  "teiByWitnessSha256": {
    "P": "9dc16fb2153595e8689ad261b9c4a59c9c68b63a6e3f3401b696ead784e96e8b",
    "Y": "19f294c812985c5eb47d3ded9968e855f0ec81e7781aa605bbd3f794a9137ea4",
    "S": "dfa962c0f405d42d29cfc373835152ca729bb43608be57a453f35ea275f594ac",
    "O": "e4bfab0b16e377a6d7875986a2d7b413184bc9ee835687867a3fc42928faee3a",
    "LL": "391c975871d9bfde55bdab7563fcb4da6a1b0f4f4487fd9aafbe40aaa62cb67d"
  },
  "glossarySha256": "a52ba4d442a58b04a7f0dd43882defe64d6309f948e153a664b7b894e8b6289c",
  "frequencySha256": "0071be2a4271288610d8217144819e5177dcca1235b78b41f6d97693b59e04f7",
  "formsSha256": "a0166f81bf1d784c27bf4c358a5d7aedd46c4dc774ef954683d14fba917ea15f"
}
```

Witness coverage:
- P: 46 numbered lines, 140 candidate decisions.
- Y: 46 numbered lines, 206 candidate decisions.
- S: 46 numbered lines, 164 candidate decisions.
- O: 46 numbered lines, 212 candidate decisions.
- LL: 46 numbered lines, 214 candidate decisions.

## Limits and follow-up

Withheld readings are listed explicitly in each file’s `openIssues` array. They are not presented as resolved transcription problems: many are simply uncertain or absent source words for which no vocabulary aid should be asserted. Clear nonstandard variants have not been silently emended to O or LL. The audit does not certify the underlying image transcription or extend an existing TEI review seal. Any change to an input hash requires renewed contextual review of the affected candidates.

The generator output remains a candidate list. The contextual overlay is the authority for displayed lexical identities in these poems.
