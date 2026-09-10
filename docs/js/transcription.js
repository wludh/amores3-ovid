/* The XML is the source of readings and notes; this file only renders them. */
const TEI_NS = 'http://www.tei-c.org/ns/1.0';

function transmissionGapLabel(gap, lines) {
  if (!lines.length) return 'This poem is not transmitted in this witness.';
  const explicitRange = gap.getAttribute('n');
  const quantity = Number(gap.getAttribute('quantity'));
  const before = lines.filter(line => line.compareDocumentPosition(gap) & Node.DOCUMENT_POSITION_FOLLOWING).at(-1);
  const after = lines.find(line => gap.compareDocumentPosition(line) & Node.DOCUMENT_POSITION_FOLLOWING);
  const start = before ? Number(before.getAttribute('n')) + 1 : Number(after.getAttribute('n')) - quantity;
  return `Lines ${explicitRange || `${start}–${start + quantity - 1}`} are not transmitted in this witness.`;
}

function selectTeiPoem(xmlDoc, poem) {
  if (xmlDoc.documentElement.namespaceURI !== TEI_NS) {
    return xmlDoc.querySelector(`poem[n="${poem}"] > TEI`);
  }
  const division = Array.from(xmlDoc.getElementsByTagNameNS(TEI_NS, 'div'))
    .find(el => el.getAttribute('type') === 'poem' && el.getAttribute('n') === poem);
  if (!division) return null;
  const root = xmlDoc.documentElement.cloneNode(true);
  const body = root.getElementsByTagNameNS(TEI_NS, 'body')[0];
  body.replaceChildren(division.cloneNode(true));
  return root;
}

function renderTrialEdition(fragment, xml, panel, witness, poem) {
  const edition = document.createElement('article');
  edition.className = 'tei-edition';
  edition.dataset.witness = witness;
  edition.setAttribute('aria-label', `Amores ${poem}, witness ${witness}, transcription`);

  const sourceElements = Array.from(xml.getElementsByTagNameNS(TEI_NS, '*'));
  const byId = new Map(sourceElements.filter(el => el.hasAttribute('xml:id')).map(el => [el.getAttribute('xml:id'), el]));
  const lines = sourceElements.filter(el => el.localName === 'l');
  const notes = sourceElements.filter(el => el.localName === 'note' && ['review', 'observation', 'uncertainty'].includes(el.getAttribute('type')));
  const header = document.createElement('div');
  header.className = 'edition-toolbar';
  const teiLink = document.createElement('a');
  teiLink.className = 'tei-source-link';
  teiLink.textContent = 'TEI ↗';
  teiLink.setAttribute('aria-label', `Read TEI for Amores ${poem}, witness ${witness}`);
  teiLink.href = `tei.html?poem=${encodeURIComponent(poem)}&witness=${encodeURIComponent(witness)}`;
  header.appendChild(teiLink);
  edition.appendChild(header);

  const scroll = document.createElement('div');
  scroll.className = 'edition-scroll';
  scroll.tabIndex = 0;
  scroll.setAttribute('aria-label', lines.length ? 'Verse text; scroll horizontally for full manuscript lines' : 'Source coverage');
  // Keep metadata in the downloadable XML. Do not instantiate hidden image viewers.
  fragment.querySelectorAll('tei-teiheader, tei-facsimile, tei-back').forEach(el => el.remove());
  scroll.appendChild(fragment);
  edition.appendChild(scroll);

  // Namespace rendered IDs by panel, so the same witness can appear twice.
  scroll.querySelectorAll('[id]').forEach(el => { el.id = `${panel.id}-${el.id}`; });
  scroll.querySelectorAll('tei-g').forEach(el => {
    const declaration = byId.get((el.getAttribute('ref') || '').replace(/^#/, ''));
    const mappings = declaration ? Array.from(declaration.getElementsByTagNameNS(TEI_NS, 'mapping')) : [];
    const mapping = mappings.find(item => item.getAttribute('type') === 'display');
    if (mapping) el.textContent = mapping.textContent;
    if (!el.textContent) el.textContent = '�';
    el.title = declaration?.getElementsByTagNameNS(TEI_NS, 'desc')[0]?.textContent || 'Unresolved glyph';
  });
  scroll.querySelectorAll('tei-add[place="above"], tei-add[place="below"]').forEach(el => {
    el.classList.add('interlinear');
    const content = document.createElement('span');
    content.className = 'addition-text';
    content.append(...el.childNodes);
    el.appendChild(content);
    const position = el.getAttribute('place') === 'below' ? 'Sublinear' : 'Supralinear';
    el.title = el.getAttribute('cert') === 'low' ? `Uncertain ${position.toLowerCase()} addition — see transcription note` : `${position} addition`;
  });
  scroll.querySelectorAll('tei-del').forEach(el => { el.title = `Marked deletion: ${el.getAttribute('rend') || 'method unspecified'}`; });
  scroll.querySelectorAll('tei-unclear').forEach(el => { el.title = 'Uncertain reading — see transcription note'; });
  scroll.querySelectorAll('tei-hi[rend="darker-ink"]').forEach(el => { el.title = 'Darker ink; earlier letters and hand not inferred'; });
  scroll.querySelectorAll('tei-space').forEach(el => {
    el.style.display = 'inline-block';
    const defaultWidth = el.getAttribute('extent') === 'large' ? 4 : 1;
    el.style.width = `${Math.min(Number(el.getAttribute('quantity')) || defaultWidth, 20)}ch`;
    el.setAttribute('aria-label', 'Space in manuscript');
  });
  // Page boundaries remain in the source XML; the reading view stays continuous.
  scroll.querySelectorAll('tei-pb').forEach(el => el.remove());
  const manuscriptNotes = sourceElements.filter(el => el.localName === 'note' && el.getAttribute('type') === 'manuscript');
  scroll.querySelectorAll('tei-note[type="manuscript"]').forEach((el, index) => {
    el.setAttribute('data-processed', '');
    el.classList.add('manuscript-margin-note');
    // Avoid CETEI's default editorial parentheses around manuscript content.
    const source = manuscriptNotes[index];
    const uncertain = source?.querySelector('unclear') || source?.getAttribute('cert') === 'low';
    const place = source?.getAttribute('place') === 'bottom' ? 'Lower margin' : 'Margin';
    const copySourceNode = node => {
      if (node.nodeType === Node.TEXT_NODE) return document.createTextNode(node.textContent);
      if (node.nodeType !== Node.ELEMENT_NODE) return document.createTextNode('');
      const copy = document.createElement(`tei-${node.localName.toLowerCase()}`);
      for (const attr of node.attributes) copy.setAttribute(attr.name, attr.value);
      copy.append(...Array.from(node.childNodes, copySourceNode));
      return copy;
    };
    el.replaceChildren(document.createTextNode(`${place}: `), ...Array.from(source?.childNodes || [], copySourceNode));
    el.title = `${uncertain ? 'Uncertain ' : ''}manuscript annotation; see notes and full source`;
  });

  const details = document.createElement('details');
  details.className = 'edition-notes';
  details.innerHTML = '<summary>Transcription notes</summary>';
  const noteIds = new Map();
  for (const note of notes) {
    const id = `${panel.id}-${note.getAttribute('xml:id')}-visible`;
    const item = document.createElement('div');
    item.id = id;
    item.className = 'edition-note';
    item.tabIndex = -1;
    const n = note.getAttribute('n');
    const label = document.createElement('strong');
    const targetId = note.getAttribute('target')?.split(/\s+/)[0]?.replace(/^#/, '');
    const sourceTarget = byId.get(targetId);
    const absenceNote = sourceTarget?.localName === 'gap' && sourceTarget.getAttribute('reason') === 'not-transmitted';
    label.textContent = absenceNote ? 'Source coverage' : note.getAttribute('target')?.includes('lower-margin') ? 'Lower margin' : `Line ${n}`;
    item.appendChild(label);
    if (note.getAttribute('type') === 'review') {
      const tag = document.createElement('span');
      tag.className = 'review-tag';
      tag.textContent = 'Editorial question';
      item.appendChild(tag);
    }
    const text = document.createElement('p');
    text.textContent = note.textContent;
    item.appendChild(text);
    const back = document.createElement('a');
    const sourceLine = lines.find(line => line.getAttribute('n') === n);
    const returnId = sourceLine?.getAttribute('xml:id') || targetId;
    back.href = `#${panel.id}-${returnId || ''}`;
    back.textContent = absenceNote ? 'Return to source coverage' : `Return to line ${n}`;
    back.addEventListener('click', event => {
      event.preventDefault();
      const line = Array.from(scroll.querySelectorAll('[id]')).find(el => el.id === `${panel.id}-${returnId}`);
      line?.scrollIntoView({ block: 'center' });
      line?.focus({ preventScroll: true });
    });
    item.appendChild(back);
    details.appendChild(item);
    if (!noteIds.has(n)) noteIds.set(n, { id, review: note.getAttribute('type') === 'review' });
  }
  edition.appendChild(details);
  for (const line of scroll.querySelectorAll('tei-l')) {
    const n = line.getAttribute('n');
    line.dataset.line = n;
    line.tabIndex = 0;
    const note = noteIds.get(n);
    if (!note) continue;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `editorial-note-button${note.review ? ' needs-review' : ''}`;
    button.textContent = note.review ? '?' : 'i';
    button.setAttribute('aria-label', `Line ${n}: ${note.review ? 'reading to review' : 'transcription note'}`);
    button.addEventListener('click', event => {
      event.stopPropagation();
      details.open = true;
      const item = details.querySelector(`[id="${note.id}"]`);
      item.focus({ preventScroll: true });
      item.scrollIntoView({ block: 'start' });
    });
    line.appendChild(button);
  }
  // Display only the source form; expansions remain available in the TEI and tooltips.
  scroll.querySelectorAll('tei-choice').forEach(choice => {
    const children = Array.from(choice.children);
    const selected = ['tei-abbr', 'tei-orig', 'tei-sic'].map(name => children.find(el => el.localName === name)).find(Boolean) || children[0];
    children.forEach(el => { el.hidden = el !== selected; });
    choice.title = children.filter(el => el !== selected).map(el => {
      const qualified = ['low', 'medium'].includes(el.getAttribute('cert'));
      return `${el.textContent}${qualified ? ' (tentative expansion)' : ''}`;
    }).join(' / ');
  });
  scroll.querySelectorAll('tei-gap').forEach(gap => {
    if (['notInscribed', 'not-inscribed'].includes(gap.getAttribute('reason'))) {
      gap.replaceChildren();
      gap.style.display = 'inline-block';
      gap.style.width = `${Math.min(Number(gap.getAttribute('quantity')) || 1, 20)}ch`;
      gap.title = 'Uninscribed space in the manuscript';
      gap.setAttribute('aria-label', gap.title);
      return;
    }
    const label = document.createElement('span');
    const inline = Boolean(gap.closest('tei-l, tei-note'));
    label.className = inline ? 'inline-gap' : 'transcription-gap';
    const quantity = Number(gap.getAttribute('quantity'));
    label.textContent = inline ? '[…]' : gap.getAttribute('reason') === 'not-transmitted'
      ? transmissionGapLabel(gap, Array.from(scroll.querySelectorAll('tei-l')))
      : gap.getAttribute('n') || `${quantity || ''} ${gap.getAttribute('unit') || 'text'} unavailable in this witness`;
    label.title = gap.querySelector('tei-desc')?.textContent || `Gap: ${gap.getAttribute('reason') || 'unspecified'}`;
    gap.appendChild(label);
    if (!inline) gap.tabIndex = -1;
  });
  if (!notes.length) details.hidden = true;
  if (lines.length) addAlterationFinder(edition, scroll, header);
  return edition;
}

// Feature categories describe encoded evidence, not conjectured historical actions.
const alterationTypes = [
  ['substitution', 'Corrections / substitutions', 'tei-subst'],
  ['erasure', 'Erasures', 'tei-del[rend~="erasure"]'],
  ['cancellation', 'Cancellations', 'tei-del:not([rend~="erasure"])'],
  ['above', 'Additions above the line', 'tei-add[place="above"]'],
  ['below', 'Additions below the line', 'tei-add[place="below"]'],
  ['marginal', 'Marginal additions / annotations', 'tei-add[place^="margin"], tei-note[type="manuscript"]'],
  ['ink', 'Darker ink / reworking', 'tei-hi[rend~="darker-ink"]'],
  ['surface', 'Disturbed surfaces', 'tei-hi[rend~="disturbed-surface"]'],
  ['marks', 'Insertion and other marks', 'tei-metamark'],
  ['uncertain', 'Uncertain readings / traces', 'tei-unclear'],
  ['gap', 'Illegible or absent text', 'tei-gap'],
  ['abbreviation', 'Abbreviations', 'tei-abbr'],
];

function addAlterationFinder(edition, scroll, toolbar) {
  const finder = document.createElement('details');
  finder.className = 'alteration-finder';
  const summary = document.createElement('summary');
  summary.textContent = 'Find alterations';
  finder.appendChild(summary);
  const controls = document.createElement('div');
  controls.className = 'alteration-controls';
  const select = document.createElement('select');
  select.setAttribute('aria-label', 'Alteration or feature type');
  const placeholder = new Option('Choose a type…', '');
  select.appendChild(placeholder);
  const groups = new Map();
  const all = new Set();
  for (const [key, label, selector] of alterationTypes) {
    const matches = Array.from(scroll.querySelectorAll(selector)).filter(el => !el.closest('[hidden]'));
    matches.forEach(el => {
      all.add(el);
      el.dataset.alterations = [el.dataset.alterations, key].filter(Boolean).join(' ');
    });
    groups.set(key, matches);
    const option = new Option(label, key);
    option.disabled = !matches.length;
    select.appendChild(option);
  }
  const previous = document.createElement('button');
  previous.type = 'button'; previous.textContent = '←'; previous.setAttribute('aria-label', 'Previous matching feature');
  const next = document.createElement('button');
  next.type = 'button'; next.textContent = '→'; next.setAttribute('aria-label', 'Next matching feature');
  const status = document.createElement('output');
  status.setAttribute('aria-live', 'polite');
  const clear = document.createElement('button');
  clear.type = 'button'; clear.textContent = 'Clear';
  controls.append(select, previous, status, next, clear);
  finder.appendChild(controls);
  toolbar.prepend(finder);
  let matches = []; let current = -1;
  function update(move = 0) {
    all.forEach(el => el.classList.remove('alteration-hit', 'alteration-current'));
    matches = groups.get(select.value) || [];
    matches.forEach(el => el.classList.add('alteration-hit'));
    previous.disabled = next.disabled = !matches.length;
    clear.disabled = !select.value;
    if (!matches.length) { current = -1; status.textContent = ''; return; }
    current = (current + move + matches.length) % matches.length;
    const active = matches[current];
    active.classList.add('alteration-current');
    const verse = active.closest('tei-l');
    status.textContent = verse ? `Line ${verse.getAttribute('n')}` : 'Outside verse';
    active.scrollIntoView({ block: 'center', inline: 'center', behavior: 'smooth' });
    if (verse) verse.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  }
  select.addEventListener('change', () => { current = 0; update(); });
  previous.addEventListener('click', () => update(-1));
  next.addEventListener('click', () => update(1));
  clear.addEventListener('click', () => { select.value = ''; update(); });
  update();
}
