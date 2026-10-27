# Contextual vocabulary audit: Amores 3.9–3.10

Date: 2026-10-26. Reviewer: Codex contextual lexical review (`vocab_review`).

All numbered lines and all proposed vocabulary entries were read against the exact P, Y, O and LL witness contexts. S has no extant numbered lines in either poem. This audits lexical output from the existing reviewed TEI; no image transcription, XML, original glossary, frequency source or morphology map was changed. It does not certify a new TEI review seal.

Each candidate has an explicit witness-specific decision and a literal source quotation. Missing, altered or uncertain targets are withheld where a definite lexical match would be unsupported. Legible different readings retain their own lemmas rather than being silently replaced by LL/O. The audit covers proposed display entries, not every untranslated source token. Input hashes bind the decisions to the reviewed snapshot.

## Evidence

- [Lewis and Short, Perseus digital dictionary](https://raw.githubusercontent.com/PerseusDL/lexica/master/CTS_XML_TEI/perseus/pdllex/lat/ls/lat.ls.perseus-eng2.xml), consulted through the local searchable index. Individual entry links accompany every definition/headword correction.
- [DCC Latin Core Vocabulary](https://dcc.dickinson.edu/latin-core-list1), using the frozen local dataset for explicit core identities. Frequency rankings do not prove a contextual meaning.

## Consequential corrections

- 3.9 restores the actual parts of speech in **magnas, inane, luce, infesta, ora, divum, obscuras, victas, summa, nigro, dolo, mala, aurea, humo, ultima, aliquid** and **prodige**. Names are identified as **Aeneas, Iulus, Venus, Nemesis, Calvus** and **Gallus**, not unrelated adjectives, animals or common nouns. Untranslated or copied editorial prose is repaired or removed.
- 3.10 identifies **Ceres**, **Crete** and **Jupiter**; **iugis** is the yoke noun, **laetari** means rejoice, **secubitu** is sleeping apart, **coli** is worship, **testi** is a witness, **ferina** modifies animal backs, **inrita** means vain, **vota** are prayers, and **anno** is a year. Missing definitions for the crowned hair, marrow and furrows are supplied.
- Source-form corrections include **ā** as an interjection, **tēne** as tē + -ne, **fēlīcius** as an adverb, **tempora** as the temples of the head, **anime** as animae, relative **que** as quae, and manuscript **tenere** as tenerae. The anatomical tempus sense remains associated with the same DCC lemma, while its definition is corrected for this verse.
- P/Y **diffugiunt**, O **descendens**, and P **ardere** are treated as those written verbs, rather than silently converted to other witnesses’ readings. Broken or uncertain source words are withheld locally.

## Coverage

Counts are per witness-candidate, after repeated identical forms within one verse are deduplicated. Grouped JSON decisions may cover several witnesses.

| Poem | Confirm | Replace | Suppress | Total witness-candidates | Grouped rows |
| --- | ---: | ---: | ---: | ---: | ---: |
| 3.9 | 886 | 351 | 27 | 1264 | 398 |
| 3.10 | 656 | 265 | 19 | 940 | 304 |

## 3.9: corrected and withheld entries

| Candidate | Witnesses | Decision | Rationale |
| --- | --- | --- | --- |
| legacy:1:0 | P | suppress | The verb belongs to the uncertain span [plorabat acillem?]; do not assert a definite lexical match. |
| legacy:2:0 | P, Y, O, LL | replace | Magnas agrees with deas; it is an adjective, not the noun magnās “magnate”. → **magnus, magna, magnum**: great, mighty [Evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n27649/) |
| dictionary:2:fata | P, Y, O, LL | replace | fata is a plural noun “fates”, not a participle of for. [Evidence](https://dcc.dickinson.edu/latin-core-list1) |
| legacy:3:1 | P, Y, O, LL | replace | The hair is undeserving of this mourning treatment; complete the truncated adjective entry. → **indignus, indigna, indignum**: undeserving (of something); unworthy [Evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n22824/) |
| legacy:3:2 | Y | suppress | The name is written with an uncertain initial [e?]legia. |
| legacy:3:3 | P, Y, O, LL | replace | Complete the truncated hair definition. → **capillus, capillī m.**: hair of the head; a hair [Evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n6613/) |
| dictionary:4:a | P, O, LL | replace | Ā is an exclamation before nimis; it is not the preposition ā/ab. → **ā (interj.)**: ah! oh! [Evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n1649/) |
| dictionary:5:tui | P, Y, O, LL | replace | tui is a possessive adjective agreeing with a noun, not the genitive of tū. [Evidence](https://dcc.dickinson.edu/latin-core-list1) |
| legacy:6:0 | P, Y, O, LL | replace | The participle describes the constructed funeral pyre; complete the broken definition. → **exstrūctus, exstrūcta, exstrūctum**: piled up, built up [Evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n17274/) |
| legacy:6:1 | P, Y, O, LL | replace | Inane modifies corpus, the lifeless body; it is not īna, a paper fibre. → **inānis, ināne**: empty; here lifeless [Evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n22186/) |
| legacy:7:0 | P, O, LL | replace | Cupid carries his quiver overturned; the sweeping verb ēverrō gives the wrong sense. → **ēversus, ēversa, ēversum**: overturned, turned upside down; from ēvertō [Evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n16472/) |
| legacy:7:0 | Y | suppress | This witness writes uersāq rather than eversamque; the ēvertō identification is not supported. |
| legacy:8:0 | P | suppress | The word crosses an uncertain deleted letter and a replacement; withhold a definite matched entry. |
| legacy:8:1 | P, Y, O, LL | replace | Cupid’s bows are broken; remove the incomplete collection of unrelated senses. → **arcus, arcūs m.**: a bow [Evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n3485/) |
| legacy:8:2 | P, Y, O, LL | replace | Sine luce means without light: luce is the ablative noun, not an adverb “by daylight”. → **lūx, lūcis f.**: light [Evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n27303/) |
| dictionary:8:sine | P, Y, O, LL | replace | sine is a preposition with an ablative complement, not sinō or sinus. [Evidence](https://dcc.dickinson.edu/latin-core-list1) |
| legacy:9:2 | P, Y, O, LL | replace | Alis denotes Cupid’s drooping wings; complete the truncated definition. → **āla, ālae f.**: a wing [Evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n1666/) |
| legacy:10:0 | P, Y, O, LL | replace | Infesta agrees with manu, the hand striking the chest; it is not the verb infestō. → **infestus, infesta, infestum**: hostile, violent [Evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n23184/) |
| legacy:10:2 | P, Y, O, LL | replace | Aperta describes the bare breast; remove the stray “Antonym” artifact. → **apertus, aperta, apertum**: uncovered, bare [Evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n2980/) |
| legacy:11:0 | P, Y, O, LL | replace | Colla is the poetic plural for the neck on which hair lies; replace the truncated non-definition. → **collum, collī n.**: neck [Evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n9110/) |
| legacy:11:1 | P, Y, O, LL | replace | Complete the truncated hair definition. → **capillus, capillī m.**: hair of the head; a hair [Evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n6613/) |
| legacy:12:0 | P, Y, O, LL | replace | Ora refers to mouths/faces, not the boundary noun ōra. → **ōs, ōris n. (plural ōra)**: mouth, face [Evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n33093/) |
| legacy:12:3 | P, Y, O, LL | replace | The line contains the finite verb sonant, not the noun sonus. → **sonō, sonāre, sonuī, sonitum**: to sound, resound [Evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n44723/) |
| legacy:13:0 | P | suppress | The proposed word is inside an explicitly uncertain multiword reading. |
| legacy:13:0 | Y, O, LL | replace | Aeneae names the brother of Cupid whose funeral is recalled; it is not aēneus “bronze”. → **Aenēās, Aenēae m.**: Aeneas, the Trojan hero [Evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n1234/) |
| legacy:14:0 | P | suppress | The proposed word is inside an explicitly uncertain multiword reading. |
| legacy:14:0 | Y, O, LL | replace | Egressum is the perfect participle of ēgredior in the reported departure, not an untranslated inflection label. → **ēgredior, ēgredī, ēgressus sum**: to go out, depart [Evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n15329/) |
| legacy:14:1 | P, Y, O, LL | replace | Iule is a vocative proper name in the address; it is not a woodlouse or fish. → **Iūlus, Iūlī m.**: Iulus (proper name) [Evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n25141/) |
| legacy:15:0 | P, Y, O, LL | replace | Venus is dismayed by Tibullus’s death, not physically mixed with something. → **confūsus, confūsa, confūsum**: disturbed, dismayed; from confundō [Evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n10218/) |
| legacy:15:1 | P, Y, O, LL | replace | The goddess is the subject of the bereavement comparison, not abstract attractiveness. → **Venus, Veneris f.**: Venus, goddess of love [Evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n50478/) |
| dictionary:15:est | P, Y, O, LL | replace | est is a copular or auxiliary “is”, not “eats”. [Evidence](https://dcc.dickinson.edu/latin-core-list1) |
| legacy:16:0 | P, Y, O, LL | replace | The boar wounds the young man’s groin; complete the unfinished anatomical gloss. → **inguen, inguinis n.**: groin [Evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n23399/) |
| legacy:17:0 | P, Y, O, LL | replace | Divum is the poetic genitive plural in “care of the gods”, not the neuter noun for the sky. → **dīvus, dīvī m. (plural dīvī)**: a god; dīvum: of the gods [Evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n14598/) |
| dictionary:17:cura | P, Y, O, LL | replace | cura is a noun “care/concern”, not an imperative of cūrō. [Evidence](https://dcc.dickinson.edu/latin-core-list1) |
| legacy:19:0 | P, Y, O, LL | replace | Death is hostile and relentless; the trivial “inconvenient” sense does not fit the funeral. → **importūnus, importūna, importūnum**: cruel, relentless, untimely [Evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n21988/) |
| legacy:19:1 | P, Y, O, LL | replace | Death desecrates everything sacred; repair the broken definition. → **profānō, profānāre, profānāvī, profānātum**: to profane, desecrate [Evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n38598/) |
| legacy:20:0 | P, Y, O, LL | replace | Obscuras agrees with manus; it is not a finite form of obscūrō. → **obscūrus, obscūra, obscūrum**: dark, shadowy [Evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n31813/) |
| legacy:22:0 | P, Y, O, LL | replace | Victas modifies feras overcome by Orpheus’s song; it is not the noun vīctus “food/livelihood”. → **vincō, vincere, vīcī, victum**: to conquer, overcome; victas: overcome [Evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n50968/) |
| legacy:22:1 | P, Y, O, LL | replace | The beasts are astonished by song; state the attested spelling and complete the definition. → **obstipēscō (also obstupēscō), obstipēscere, obstipuī**: to be astonished, struck dumb [Evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n31907/) |
| dictionary:22:uictas | O, LL | replace | victas is a participle “overcome” describing the beasts, not a form of vīvō. [Evidence](https://dcc.dickinson.edu/latin-core-list1) |
| dictionary:22:uictas | P, Y | replace | uictas is a participle “overcome” describing the beasts, not a form of vīvō. [Evidence](https://dcc.dickinson.edu/latin-core-list1) |
| legacy:24:0 | P, O, LL | replace | Invita describes the unwilling lyre; remove the first-person wording. → **invītus, invīta, invītum**: unwilling, reluctant [Evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n24802/) |
| legacy:24:0 | Y | suppress | The revised witness reading is inuicta, not invita; do not transfer the unwilling adjective. |
| legacy:24:2 | P, Y, O, LL | replace | The musical instrument accompanies the mourning song; the constellation fragment is irrelevant. → **lyra, lyrae f.**: a lyre [Evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n27391/) |
| legacy:25:0 | P, O, LL | replace | Adice Maeoniden asks the reader to add Homer to the examples, not to throw him. → **adiciō, adicere, adiēcī, adiectum**: to add [Evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n797/) |
| legacy:25:0 | Y | suppress | This witness has adde from addō, not adice from adiciō; the written verb already has its own source lookup. |
| legacy:26:0 | P, Y, O, LL | replace | Ora refers to mouths/faces, not the boundary noun ōra. → **ōs, ōris n. (plural ōra)**: mouth, face [Evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n33093/) |
| legacy:26:1 | P, Y, O, LL | replace | The poets’ mouths are figuratively watered from a perennial spring; complete the definition. → **rigō, rigāre, rigāvī, rigātum**: to water, moisten [Evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n41760/) |
| legacy:27:0 | P, Y, O, LL | replace | Summa modifies dies and means the final day; it is not the noun summa. → **summus, summa, summum**: highest, final; summa dies: the last day [Evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n46901/) |
| legacy:27:1 | P, Y, O, LL | replace | Nigro agrees with Averno, the dark underworld; it is not the verb nigrō. → **niger, nigra, nigrum**: black, dark [Evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n30930/) |
| legacy:27:2 | P | suppress | The target is marked uncertain or crosses an uncertain alteration; no certain lexical output is asserted. |
| legacy:28:0 | P, Y | replace | P/Y write diffugiunt rather than defugiunt; retain their distinct compound verb. → **diffugiō, diffugere, diffūgī**: to flee apart, disperse, escape [Evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n13888/) |
| dictionary:28:sola | P, Y, O, LL | replace | Sola agrees with carmina: the poems alone escape the pyres. [Evidence](https://dcc.dickinson.edu/latin-core-list1) |
| legacy:29:0 | P | suppress | The target is marked uncertain or crosses an uncertain alteration; no certain lexical output is asserted. |
| legacy:29:0 | Y, O, LL | replace | The poems’ fame and the web story endure; hardening/drying is the wrong sense. → **dūrō, dūrāre, dūrāvī, dūrātum**: to last, endure [Evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n14988/) |
| legacy:30:1 | P | suppress | The target is marked uncertain or crosses an uncertain alteration; no certain lexical output is asserted. |
| legacy:30:1 | Y, O, LL | replace | Tela is Penelope’s woven fabric; complete the definition. → **tēla, tēlae f.**: a woven web, fabric [Evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n47647/) |
| legacy:30:2 | P, Y, O, LL | replace | Lewis–Short cites this exact verse for unweaving; replace the untranslated editorial instruction. → **retextus, retexta, retextum**: unwoven, unravelled; from retexō [Evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n41477/) |
| legacy:30:3 | P, Y, O, LL | replace | Nocturno dolo is the ablative noun “by a nighttime trick”, not the verb dolō. → **dolus, dolī m.**: a trick, deception [Evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n14674/) |
| legacy:31:0 | P, Y, O, LL | replace | This is Tibullus’s beloved Nemesis; Lewis–Short distinguishes her from the goddess and cites 3.9.31. → **Nemesis, Nemesis f.**: Nemesis, a woman loved by Tibullus [Evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n30708/) |
| dictionary:32:amor | P, Y, O, LL | replace | amor is a noun “love” (sometimes personified), not a passive form of amō. [Evidence](https://dcc.dickinson.edu/latin-core-list1) |
| dictionary:32:cura | P, Y, O, LL | replace | cura is a noun “care/concern”, not an imperative of cūrō. [Evidence](https://dcc.dickinson.edu/latin-core-list1) |
| legacy:33:0 | P, Y | suppress | P marks the word uncertain and Y writes the nonstandard egypta; this review does not silently restore Aegyptia. |
| legacy:34:0 | P, Y, O, LL | replace | The Egyptian religious instrument needs an explanatory gloss. → **sīstrum, sīstrī n.**: a metal rattle used in the rites of Isis [Evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n44482/) |
| legacy:34:2 | P, Y, O, LL | replace | Vacuo toro is an empty bed, not a bulge. → **torus, torī m.**: a bed, couch [Evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n48615/) |
| legacy:35:0 | P, Y, O, LL | replace | Mala agrees with fata; it is not the noun māla “jaw”. → **malus, mala, malum**: bad, evil, harmful [Evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n27776/) |
| dictionary:35:fata | P, Y, O, LL | replace | fata is a plural noun “fates”, not a participle of for. [Evidence](https://dcc.dickinson.edu/latin-core-list1) |
| dictionary:36:esse | P, Y, O, LL | replace | esse is a infinitive “be”, not “eat”. [Evidence](https://dcc.dickinson.edu/latin-core-list1) |
| legacy:38:1 | P, Y, O, LL | replace | Busta names the tombs into which death draws worshippers; complete the definition. → **bustum, bustī n.**: a grave, tomb; a place of cremation [Evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n5881/) |
| legacy:40:0 | P, O, LL | replace | The context is cremated remains, not voting urns; remove unrelated copied material. → **urna, urnae f.**: an urn; here an urn holding the dead person’s ashes [Evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n49916/) |
| legacy:40:0 | Y | suppress | The proposed noun [urna?] is explicitly uncertain. |
| dictionary:41:tene | P, Y, O, LL | replace | Tene is tē plus interrogative -ne, addressing the dead poet; it is not the imperative tenē. → **tū, tuī (tē + -ne)**: you; tēne introduces the emphatic question “you ...?” [Evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n49339/) |
| legacy:42:0 | P, Y, O, LL | replace | Pasci is the passive infinitive used of flames feeding on the poet’s breast. → **pāscō, pāscere, pāvī, pāstum**: to feed; passive pāscī: to feed on [Evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n34012/) |
| legacy:43:0 | P, Y, O, LL | replace | Aurea agrees with templa; it is not a late Latin noun for a bridle. → **aureus, aurea, aureum**: golden, made of gold [Evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n4547/) |
| dictionary:44:que | P | replace | Written que is relative quae in this clause, not the conjunction -que. [Evidence](https://dcc.dickinson.edu/latin-core-list1) |
| dictionary:44:tantum | P, Y, O, LL | replace | Tantum agrees with the neuter noun nefas: so great a crime, not “only”. [Evidence](https://dcc.dickinson.edu/latin-core-list1) |
| dictionary:45:que | P | replace | Written que is relative quae in this clause, not the conjunction -que. [Evidence](https://dcc.dickinson.edu/latin-core-list1) |
| dictionary:47:melius | P, Y, O, LL | replace | Melius is predicative with hoc: “this is better”, rather than an adverb modifying an action. [Evidence](https://dcc.dickinson.edu/latin-core-list1) |
| legacy:48:0 | P, Y, O, LL | replace | Ignotum describes an unknown dead man in a foreign land, not the participle of ignōscō “forgiven”. → **ignōtus, ignōta, ignōtum**: unknown, unrecognized [Evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n21428/) |
| legacy:48:3 | P, Y, O, LL | replace | Humo is an ablative noun in the burial phrase, not the verb humō. → **humus, humī f.**: earth, ground [Evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n21065/) |
| legacy:49:0 | P | suppress | This witness has nunc rather than hinc; the hinc gloss is absent. |
| legacy:49:0 | Y | suppress | The hinc/hic sequence is altered and madidos is deleted in favour of manibus; do not show the unrevised glossary targets as secure. |
| legacy:49:1 | Y | suppress | The hinc/hic sequence is altered and madidos is deleted in favour of manibus; do not show the unrevised glossary targets as secure. |
| legacy:49:2 | P, Y, O, LL | replace | The participle refers to the dying poet, not a literal runner. → **fugiēns, fugientis**: departing; here passing out of life [Evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n18943/) |
| legacy:49:3 | P, Y, O, LL | replace | The mother closes the dying poet’s eyes; “darling” is not the referent. → **ocellus, ocellī m.**: an eye (diminutive of oculus) [Evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n32149/) |
| dictionary:49:certe | P, Y, O, LL | replace | certe is a adverb “certainly/at least”, not a vocative adjective. [Evidence](https://dcc.dickinson.edu/latin-core-list1) |
| legacy:50:0 | P, Y, O, LL | replace | Ultima modifies dona, the final gifts at the funeral. → **ultimus, ultima, ultimum**: last, final [Evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n49656/) |
| dictionary:50:dona | P, Y, O, LL | replace | dona is a plural noun “gifts”, object of tulit, not an imperative of dōnō. [Evidence](https://dcc.dickinson.edu/latin-core-list1) |
| legacy:51:0 | Y | suppress | The word touches an uncertain addition Hinc⟨[h?]⟩; withhold a definite target identification. |
| legacy:52:1 | P, Y, O, LL | replace | The sister’s hair is torn in mourning; give the concrete participial meaning. → **dīlaniātus, dīlaniāta, dīlaniātum**: torn, rent; from dīlaniō [Evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n13959/) |
| legacy:53:0 | P, Y, O, LL | replace | This is Tibullus’s beloved Nemesis; Lewis–Short distinguishes her from the goddess and cites 3.9.31. → **Nemesis, Nemesis f.**: Nemesis, a woman loved by Tibullus [Evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n30708/) |
| legacy:55:0 | O | replace | O writes descendens, a different verb from LL discedens; do not replace the witness reading. → **dēscendō, dēscendere, dēscendī, dēscēnsum**: to go down, descend [Evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n13329/) |
| legacy:55:0 | P, Y | suppress | P marks discedens uncertain and Y has altered discendens; this review does not silently choose discedō. |
| dictionary:55:felicius | P, Y, O, LL | replace | Felicius modifies amata adverbially: “more happily”; identify the adverb rather than the adjective. → **fēlīciter (comparative fēlīcius)**: happily, fortunately; fēlīcius: more happily [Evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n17887/) |
| legacy:57:0 | P, Y, O, LL | replace | This is Tibullus’s beloved Nemesis; Lewis–Short distinguishes her from the goddess and cites 3.9.31. → **Nemesis, Nemesis f.**: Nemesis, a woman loved by Tibullus [Evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n30708/) |
| dictionary:57:damna | P, Y, O, LL | replace | damna is a plural noun “losses”, object of tuli, not an imperative. [Evidence](https://dcc.dickinson.edu/latin-core-list1) |
| dictionary:58:me | LL | replace | me is a personal pronoun “me”, not a possessive adjective. [Evidence](https://dcc.dickinson.edu/latin-core-list1) |
| dictionary:58:me | P, Y, O | replace | Me is a personal pronoun “me”, not a possessive adjective. [Evidence](https://dcc.dickinson.edu/latin-core-list1) |
| legacy:59:0 | P, Y, O, LL | replace | Aliquid is the subject of restat, “anything remains”, not the adverbial “somewhat”. → **aliquis, aliquid**: someone, something; aliquid: anything [Evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n1874/) |
| legacy:60:1 | P, Y, O, LL | replace | Elysia valle is a valley in Elysium; remove the unrelated sentence fragment. → **vallis, vallis f.**: a valley [Evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n50142/) |
| legacy:62:0 | P, Y, O, LL | replace | Cum Calvo names Catullus’s fellow poet, not a bald person. → **Calvus, Calvī m.**: Calvus, the Roman poet [Evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n6350/) |
| dictionary:62:tempora | P, O, LL | replace | The ivy encircles the youthful temples of the head. Lewis–Short places this anatomical sense under tempus; retain the lemma but replace the time-only definition. → **tempus, temporis n. (plural tempora)**: temple, side of the head; usually plural [Evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n47738/) |
| legacy:63:0 | P, Y, O, LL | replace | Temerati modifies amici in the charge of wronging a friend. → **temerātus, temerāta, temerātum**: violated, wronged; from temerō [Evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n47693/) |
| dictionary:63:est | P, Y, LL | replace | est is a copular or auxiliary “is”, not “eats”. [Evidence](https://dcc.dickinson.edu/latin-core-list1) |
| legacy:64:0 | P, Y, O, LL | replace | Replace the broken heading “s” with sanguis; the poem addresses Gallus’s blood. → **sanguis, sanguinis m.**: blood [Evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n42533/) |
| legacy:64:1 | P, O, LL | replace | Prodige is a vocative adjective governing blood and life, not an imperative of prōdigō. → **prōdigus, prōdiga, prōdigum**: lavish, wasteful, prodigal (+ genitive) [Evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n38559/) |
| legacy:64:1 | Y | suppress | Prodig[e?] has an uncertain ending; withhold a definite matched entry. |
| legacy:64:2 | P, Y, O, LL | replace | Galle addresses the poet; Lewis–Short cites this exact verse for the proper name, not the rooster. → **Gallus, Gallī m.**: Cornelius Gallus, the Roman poet [Evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n19275/) |
| dictionary:64:anime | P | replace | Anime represents animae in the genitive phrase “of your life/soul”, not a vocative of animus. [Evidence](https://dcc.dickinson.edu/latin-core-list1) |
| legacy:65:0 | P, Y, O, LL | suppress | This is copied grammatical/etymological prose, not a Latin glossary entry for this verse; the source pronoun his has its own reviewed lookup. |
| legacy:65:1 | P, Y, O, LL | replace | Correct the conditional indefinite’s forms; the witnesses use siqua or siquid. → **sī quis, sī qua, sī quid**: if anyone, if anything; if any [Evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n44439/) |
| dictionary:65:est | P, Y, LL | replace | est is a copular or auxiliary “is”, not “eats”. [Evidence](https://dcc.dickinson.edu/latin-core-list1) |
| dictionary:65:modo | P, Y, O, LL | replace | Modo is the limiting adverb “only/just”, within the condition about a surviving shade. [Evidence](https://dcc.dickinson.edu/latin-core-list1) |
| legacy:66:0 | P, Y, O, LL | replace | Culte addresses Tibullus as a polished poet, not as tilled land. → **cultus, culta, cultum**: cultivated, polished, refined [Evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n9134/) |
| legacy:67:0 | P, Y, O, LL | replace | Quieta describes the bones at peace; remove the stray nap/quietude fragments. → **quiētus, quiēta, quiētum**: at rest, undisturbed [Evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n40130/) |
| legacy:67:1 | P | suppress | The targets lie in [requiescite urna?], an explicitly uncertain span. |
| legacy:67:1 | Y, O, LL | replace | Complete the prayer that the bones may rest. → **requiēscō, requiēscere, requiēvī, requiētum**: to rest, repose [Evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n41284/) |
| legacy:67:2 | P | suppress | The targets lie in [requiescite urna?], an explicitly uncertain span. |
| legacy:67:2 | Y, O, LL | replace | The context is cremated remains, not voting urns; remove unrelated copied material. → **urna, urnae f.**: an urn; here an urn holding the dead person’s ashes [Evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n49916/) |

Source SHA-256 bindings:

```json
{
  "teiByWitnessSha256": {
    "P": "7ae49dcca26ae6acf3bf57436019c552ff6f40115267b1a2f98f6868e6d5f9ee",
    "Y": "1b36734096e7fb8184cf267165ca353279baca9cfba44333dd2d7553b43a3d58",
    "S": "54853e68e5e27e42e641f4a250a9c3a0affc59301b1fa9291fb0bd939406d1ba",
    "O": "3c061094feaa2fd7c89e904faa610a1c6664e9c3e5ded3471a94bb52dda53db1",
    "LL": "adfe2ca17a6ed2bebf0c779acf85414473b4f021735647ac9f92cc177a5542a9"
  },
  "glossarySha256": "0cf5a4f4f19067ae53a59aa07c5bdd0e5cd572b25ec3f540d091c65357c63c10",
  "frequencySha256": "0071be2a4271288610d8217144819e5177dcca1235b78b41f6d97693b59e04f7",
  "formsSha256": "a0166f81bf1d784c27bf4c358a5d7aedd46c4dc774ef954683d14fba917ea15f"
}
```

Witness coverage:
- P: 68 numbered lines; 315 candidate decisions.
- Y: 68 numbered lines; 306 candidate decisions.
- S: 0 numbered lines; 0 candidate decisions.
- O: 68 numbered lines; 320 candidate decisions.
- LL: 68 numbered lines; 323 candidate decisions.

## 3.10: corrected and withheld entries

| Candidate | Witnesses | Decision | Rationale |
| --- | --- | --- | --- |
| legacy:2:1 | P, Y, O, LL | replace | The girl sleeps alone in a bed; the swelling/bulge sense is inappropriate. → **torus, torī m.**: a bed, couch [Evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n48615/) |
| dictionary:2:sola | P, Y, O, LL | replace | Sola modifies puella: the girl sleeps alone. [Evidence](https://dcc.dickinson.edu/latin-core-list1) |
| legacy:3:1 | P, Y, O, LL | replace | Ceres/Cereris is the goddess’s name, not the verb cērō “coat with wax”. → **Cerēs, Cereris f.**: Ceres, goddess of agriculture [Evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n7538/) |
| legacy:3:4 | P, Y, O, LL | replace | The goddess’s hair is crowned with ears of grain; supply the missing definition. → **redimītus, redimīta, redimītum**: wreathed, crowned; from redimiō [Evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n40732/) |
| legacy:3:5 | P, Y, O, LL | replace | Complete the truncated hair definition. → **capillus, capillī m.**: hair of the head; a hair [Evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n6613/) |
| legacy:4:1 | P, Y, O, LL | replace | The speaker complains that religious observance interrupts the lovers’ enjoyment. → **commodum, commodī n.**: an advantage, benefit; here a pleasure or enjoyment [Evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n9428/) |
| legacy:5:0 | P | suppress | The adjective [munificam?] is explicitly uncertain. |
| legacy:6:0 | P, Y, O, LL | replace | The goddess is said not to begrudge human pleasures; give the applicable sense. → **invideō, invidēre, invīdī, invīsum**: to envy, begrudge [Evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n24760/) |
| legacy:7:0 | P | suppress | The witness has ornabat rather than torrebant; the roasting verb is absent. |
| legacy:7:0 | Y, O, LL | replace | The farmers parch grain; correct the truncated fourth principal part. → **torreō, torrēre, torruī, tostum**: to parch, roast [Evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n48591/) |
| legacy:7:1 | P, Y, O, LL | replace | Far/farra is grain; complete the truncated definition. → **far, farris n.**: spelt, grain [Evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n17689/) |
| legacy:7:2 | P, Y, O, LL | replace | Coloni are the early farmers; remove unrelated copied examples. → **colōnus, colōnī m.**: a farmer, cultivator [Evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n9153/) |
| legacy:8:0 | P, Y, O, LL | replace | In this agricultural passage area is a threshing floor, not a town building plot. → **ārea, āreae f.**: a threshing floor [Evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n3502/) |
| legacy:9:0 | P | suppress | The witness has the uncertain adjective G[landiferas?], not the noun glandem. |
| legacy:9:0 | Y, O, LL | replace | The oak trees bear acorns used as early food; bullets/anatomical senses are irrelevant. → **glāns, glandis f.**: an acorn [Evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n19627/) |
| dictionary:10:teneri | P, Y, O, LL | replace | Teneri agrees with caespitis: soft turf, not a passive infinitive. [Evidence](https://dcc.dickinson.edu/latin-core-list1) |
| legacy:11:0 | P, Y, O, LL | replace | Ceres/Cereris is the goddess’s name, not the verb cērō “coat with wax”. → **Cerēs, Cereris f.**: Ceres, goddess of agriculture [Evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n7538/) |
| legacy:11:2 | P, Y, O, LL | replace | The agricultural context requires seed; complete the definition. → **sēmen, sēminis n.**: seed [Evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n43414/) |
| legacy:12:0 | P | suppress | The proposed target belongs to an explicitly uncertain reading; do not fill it from the complete witnesses. |
| legacy:13:0 | P | suppress | The proposed target belongs to an explicitly uncertain reading; do not fill it from the complete witnesses. |
| legacy:13:0 | Y, O, LL | replace | Iugis is the dative plural noun, the yokes beneath which oxen put their necks; not the adjective iūgis. → **iugum, iugī n.**: a yoke [Evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n25322/) |
| legacy:13:1 | P, Y, O, LL | replace | The working cattle are literal animals; remove the unrelated constellation and torture senses. → **taurus, taurī m.**: a bull, ox [Evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n47579/) |
| legacy:13:2 | P | suppress | The proposed target belongs to an explicitly uncertain reading; do not fill it from the complete witnesses. |
| legacy:13:2 | Y, O, LL | replace | Supponere colla means put the neck beneath the yoke. → **suppōnō, suppōnere, supposuī, suppositum**: to put underneath, subject to [Evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n46980/) |
| legacy:13:3 | P | suppress | The proposed target belongs to an explicitly uncertain reading; do not fill it from the complete witnesses. |
| legacy:13:3 | Y, O, LL | replace | Colla denotes the oxen’s necks; replace the incomplete non-definition. → **collum, collī n.**: neck [Evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n9110/) |
| legacy:14:0 | P | suppress | The proposed target belongs to an explicitly uncertain reading; do not fill it from the complete witnesses. |
| legacy:14:0 | Y, O, LL | replace | Veterem agrees with humum; it is an adjective, not a form of veterō. → **vetus, veteris**: old, ancient [Evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n50773/) |
| legacy:14:1 | P | suppress | The proposed target belongs to an explicitly uncertain reading; do not fill it from the complete witnesses. |
| legacy:14:1 | Y, O, LL | replace | Curvo modifies dente, the curved plough-tooth; it is not the verb curvō. → **curvus, curva, curvum**: curved, bent [Evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n12059/) |
| legacy:14:2 | P | suppress | The proposed target belongs to an explicitly uncertain reading; do not fill it from the complete witnesses. |
| legacy:15:0 | P | suppress | The line is incomplete and does not securely contain laetari. |
| legacy:15:0 | Y, O, LL | replace | Laetari governs the lovers’ tears in the rhetorical question; manuring soil is the wrong homograph. → **laetor, laetārī, laetātus sum**: to rejoice, take pleasure in [Evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n25651/) |
| legacy:16:0 | P, Y, O, LL | replace | The question concerns lovers’ sufferings, not artillery. → **tormentum, tormentī n.**: torment, suffering [Evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n48563/) |
| legacy:16:1 | P, Y, O, LL | replace | Secubitu is the noun in the ablative, coordinated with tormentis; Lewis–Short cites this verse. → **sēcubitus, sēcubitūs m.**: sleeping alone or apart [Evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n43258/) |
| legacy:16:2 | P, Y, O, LL | replace | Coli is the passive infinitive of colō referring to the goddess, not a form of colum “strainer”. → **colō, colere, coluī, cultum**: to honour, worship; colī: to be worshipped [Evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n9134/) |
| dictionary:17:est | P, Y, O, LL | replace | est is a copular or auxiliary “is”, not “eats”. [Evidence](https://dcc.dickinson.edu/latin-core-list1) |
| legacy:20:0 | P, Y, O, LL | replace | Crete is a place name, not the participle crētus “separated”. → **Crētē, Crētēs f. (also Crēta)**: Crete, the island [Evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n11572/) |
| legacy:20:2 | P, Y, O, LL | replace | The island is proud of having nurtured Jupiter; Iove is not the exclamation iō. → **Iuppiter, Iovis m.**: Jupiter; Iove/Iovi: an oblique form of the name [Evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n25359/) |
| legacy:21:1 | P, Y, O, LL | replace | Mundi is the genitive noun in “the starry citadel of the universe”, not the adjective “clean” or an inflection placeholder. → **mundus, mundī m.**: the world, universe [Evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n29978/) |
| legacy:21:2 | P, Y, O, LL | replace | Jupiter governs the heavenly citadel; the word is not about dividing an object. → **temperō, temperāre, temperāvī, temperātum**: to regulate, govern, control [Evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n47717/) |
| dictionary:21:mundi | P, Y, O, LL | replace | Mundi denotes the universe, not the adjective clean. [Evidence](https://dcc.dickinson.edu/latin-core-list1) |
| legacy:22:0 | P, Y, O, LL | replace | The word describes Jupiter as a small child; “strict, exact” misleads. → **exiguus, exigua, exiguum**: small, little [Evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n16876/) |
| legacy:22:1 | P, Y, O, LL | replace | Supply the missing noun lemma in place of the copied singular label and examples. → **lac, lactis n.**: milk [Evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n25520/) |
| dictionary:22:ore | P, Y, O, LL | replace | ore is a mouth/face, not bone or a form of ōrō. [Evidence](https://dcc.dickinson.edu/latin-core-list1) |
| legacy:23:0 | P, Y, O, LL | replace | Testi/testis refers to Crete as witness; it is not testum, an earthenware pot. → **testis, testis m./f.**: a witness [Evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n47980/) |
| legacy:23:1 | P, Y, O, LL | replace | Alumnus names the child raised in Crete (Jupiter); the substantive sense is needed. → **alumnus, alumnī m.**: a foster child, nursling [Evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n2074/) |
| legacy:25:0 | Y | suppress | The written sequence crete adua fub does not securely contain diva; do not silently repair it. |
| legacy:26:1 | P, Y, O, LL | replace | Ferina modifies terga, the animals’ backs; it is not the feminine noun for game meat. → **ferīnus, ferīna, ferīnum**: of wild animals [Evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n17952/) |
| legacy:27:0 | P, Y, O, LL | replace | The goddess’s marrow catches the flame of love; replace the meaningless “such as” fragment. → **medulla, medullae f.**: marrow; the innermost parts of the body [Evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n28375/) |
| dictionary:27:tenere | P, Y | replace | Written tenere represents tenerae agreeing with medullae; the adjective tener is required, not tenēre. [Evidence](https://dcc.dickinson.edu/latin-core-list1) |
| dictionary:28:amor | P, Y, O, LL | replace | amor is a noun “love” (sometimes personified), not a passive form of amō. [Evidence](https://dcc.dickinson.edu/latin-core-list1) |
| dictionary:28:parte | P, Y, O, LL | replace | parte is a ablative noun “part/side”, not a participle of pariō. [Evidence](https://dcc.dickinson.edu/latin-core-list1) |
| legacy:29:0 | P, Y, O, LL | replace | Pudor is overcome by love; victus is a participle, not the livelihood/food noun. → **vincō, vincere, vīcī, victum**: to conquer, overcome; victus: overcome [Evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n50968/) |
| legacy:29:1 | P, Y, O, LL | replace | The agricultural furrows need a definition. → **sulcus, sulcī m.**: a furrow [Evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n46513/) |
| legacy:29:2 | P | suppress | This witness has ardere, the burning verb, not arere “be dry”; retain the separately reviewed source lookup. |
| legacy:29:2 | Y, O, LL | replace | The neglected furrows dry out; complete the definition without confusing āreō and ārdeō. → **āreō, ārēre**: to be dry, dry up [Evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n3520/) |
| legacy:30:0 | P, Y, O, LL | replace | Sata is substantivized from serō: the sown crop returns only a fraction of itself; replace the plural-label heading. → **sata, satōrum n. pl.**: sown seed, crops [Evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n43883/) |
| legacy:30:1 | P, Y, O, LL | replace | Minima modifies parte, the tiny part of the crop returned. → **parvus, parva, parvum (superlative minimus)**: small; minimus: smallest, very small [Evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n34005/) |
| dictionary:30:parte | P, Y, O, LL | replace | parte is a ablative noun “part/side”, not a participle of pariō. [Evidence](https://dcc.dickinson.edu/latin-core-list1) |
| legacy:31:0 | P, Y, O, LL | replace | The mattocks are vigorously wielded, not insulted. → **iactātus, iactāta, iactātum**: swung, wielded; from iactō [Evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n25166/) |
| legacy:31:1 | P | suppress | The proposed target is explicitly uncertain in P. |
| legacy:32:0 | P, Y, O, LL | replace | Remove the extra unparsed form after the definition. → **vōmer, vōmeris m.**: a ploughshare [Evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n51367/) |
| legacy:33:0 | P, Y, O, LL | replace | The agricultural context requires seed; complete the definition. → **sēmen, sēminis n.**: seed [Evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n43414/) |
| legacy:33:1 | P, Y, O, LL | replace | Latos describes the broad fields, not a participle of ferō. → **lātus, lāta, lātum**: broad, wide [Evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n26047/) |
| dictionary:33:latos | P, O, LL | replace | Latos agrees with agros: broad fields, not a participle of ferō. [Evidence](https://dcc.dickinson.edu/latin-core-list1) |
| legacy:34:0 | P | suppress | The proposed target is explicitly uncertain in P. |
| legacy:34:0 | Y, O, LL | replace | Inrita/irrita agrees with vota; it is not the verb irrītō. → **irritus, irrita, irritum**: vain, ineffectual [Evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n25002/) |
| legacy:34:1 | P | suppress | The proposed target is explicitly uncertain in P. |
| legacy:34:2 | P, Y, O, LL | replace | Vota is the plural noun for the disappointed cultivator’s prayers, not the participle “vowed”. → **vōtum, vōtī n.**: a wish, prayer, vow [Evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n51403/) |
| legacy:35:2 | P, Y, O, LL | replace | Ceres lingers in the forest while the fields suffer; mere stopping is too narrow. → **cessō, cessāre, cessāvī, cessātum**: to linger, be idle, neglect work [Evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n7622/) |
| legacy:36:0 | P, Y, O, LL | replace | The garlands fall from the goddess’s hair, not a cutting verb. → **dēcidō, dēcidere, dēcidī**: to fall off, fall down [Evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n12483/) |
| legacy:36:2 | P, Y, O, LL | replace | Spicea serta is a neuter plural phrase, not singular feminine serta. → **sertum, sertī n. (plural serta)**: a wreath, garland [Evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n43884/) |
| dictionary:36:longe | P | replace | Written longe and come represent longae comae: the garlands fall from the long hair. The agreeing adjective is longus, not the distance adverb. [Evidence](https://dcc.dickinson.edu/latin-core-list1) |
| legacy:37:0 | P | suppress | The proposed name or adjective belongs to an explicitly uncertain span. |
| legacy:37:0 | Y, O, LL | replace | Crete is a place name, not the participle crētus “separated”. → **Crētē, Crētēs f. (also Crēta)**: Crete, the island [Evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n11572/) |
| legacy:37:1 | P, Y, O, LL | replace | Fecundo agrees with anno; it is not the verb fēcundō. → **fēcundus, fēcunda, fēcundum**: fruitful, fertile, productive [Evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n17873/) |
| legacy:37:2 | P | suppress | The proposed name or adjective belongs to an explicitly uncertain span. |
| legacy:37:3 | P, Y, O, LL | replace | Anno is the ablative noun, not a form of adnō “swim toward”. → **annus, annī m.**: a year [Evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n2698/) |
| dictionary:37:sola | O, LL | replace | Sola modifies Crete: Crete alone was fertile. [Evidence](https://dcc.dickinson.edu/latin-core-list1) |
| legacy:38:0 | P, Y, O, LL | replace | Se is the reflexive pronoun in se tulerat; supply its missing definition. → **suī, sibi, sē**: oneself; sē: herself here [Evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n46498/) |
| legacy:38:1 | P, Y, O, LL | replace | Complete the truncated harvest definition. → **messis, messis f.**: a harvest, crop [Evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n28884/) |
| legacy:40:0 | P, Y, O, LL | replace | Far/farra is grain; complete the truncated definition. → **far, farris n.**: spelt, grain [Evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n17689/) |
| legacy:42:0 | P | suppress | The proposed name or adjective belongs to an explicitly uncertain span. |
| legacy:42:0 | Y, O, LL | replace | Ceres/Cereris is the goddess’s name, not the verb cērō “coat with wax”. → **Cerēs, Cereris f.**: Ceres, goddess of agriculture [Evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n7538/) |
| dictionary:42:amor | Y, O, LL | replace | amor is a noun “love” (sometimes personified), not a passive form of amō. [Evidence](https://dcc.dickinson.edu/latin-core-list1) |
| dictionary:42:esset | O, LL | replace | esset is a subjunctive “be”, not “eat”. [Evidence](https://dcc.dickinson.edu/latin-core-list1) |
| legacy:45:0 | P, Y, O, LL | replace | Nata is Ceres’s recovered daughter; remove the stray “informal” tag. → **nāta, nātae f.**: a daughter [Evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n30423/) |
| legacy:45:1 | P, Y, O, LL | replace | Reperta describes the recovered daughter; complete the definition. → **repertus, reperta, repertum**: found, recovered; from reperiō [Evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n41176/) |
| legacy:47:0 | P, Y, O, LL | replace | Festa modifies dies and is an adjective, not a first-declension noun for a feast. → **festus, festa, festum**: festive, belonging to a festival [Evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n18045/) |
| legacy:47:1 | P, Y, O, LL | replace | Cantus is a noun coordinated with love and wine, not a participle “sung”. → **cantus, cantūs m.**: singing, song [Evidence](https://atlas.perseus.tufts.edu/dictionaries/entry/urn:cite2:scaife-viewer:dictionary-entries.atlas_v1:lat.ls.perseus-eng2-n6576/) |

Source SHA-256 bindings:

```json
{
  "teiByWitnessSha256": {
    "P": "bf1d251613a35cbd29b558436bd319945c8fc264b410ad092ac2c54c50361eb0",
    "Y": "a8944f7154a8b91a681e87622a904216a95a3eb1b8cf2817215b8fc76c8f9de3",
    "S": "cb0d910294c7600d1eae343344e90d3e6c23b887b97bee55bc532a3347a28e11",
    "O": "e99fdb7402fde18d989bce54c91b1e7112accd6d3ce26c74d4a0f0c2c443e75a",
    "LL": "e5324ab95ff4ca6fe1a8345e464df92d538184cd5e2fca20dfb8066e452758a0"
  },
  "glossarySha256": "3eeaf889c96bccd3a3051f24d8544e24b97f3ee96b809ef6382d9235496b9ee1",
  "frequencySha256": "0071be2a4271288610d8217144819e5177dcca1235b78b41f6d97693b59e04f7",
  "formsSha256": "a0166f81bf1d784c27bf4c358a5d7aedd46c4dc774ef954683d14fba917ea15f"
}
```

Witness coverage:
- P: 48 numbered lines; 226 candidate decisions.
- Y: 48 numbered lines; 226 candidate decisions.
- S: 0 numbered lines; 0 candidate decisions.
- O: 48 numbered lines; 243 candidate decisions.
- LL: 48 numbered lines; 245 candidate decisions.

## Remaining limitations

The withheld cases are documented in each JSON file’s `openIssues`. Absence or damage does not become a new proposed transcription. An incomplete or nonstandard witness reading may remain without lexical aid. The review is invalidated if its input hashes change; the source evidence and candidate identity must then be checked again.
