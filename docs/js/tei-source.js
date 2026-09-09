(async () => {
  const params = new URLSearchParams(location.search);
  const witness = params.get('witness');
  const poem = params.get('poem');
  const output = document.getElementById('source');
  if (!Object.hasOwn(witnessFiles, witness) || !/^3\.(?:[1-9]|1[0-5])$/.test(poem || '')) {
    output.textContent = 'Choose a poem and witness from the transcription page.';
    return;
  }
  document.getElementById('back').href = `index.html?poem=${encodeURIComponent(poem)}&witness=${encodeURIComponent(witness)}&layout=compare`;
  document.getElementById('title').textContent = `Amores ${poem} · ${witness} · TEI`;
  document.title = `Amores ${poem} — ${witness} TEI`;
  try {
    const response = await fetch(await resolveWitnessFile(witness, poem));
    if (!response.ok) throw new Error('Source unavailable');
    const doc = new DOMParser().parseFromString(await response.text(), 'application/xml');
    if (doc.querySelector('parsererror')) throw new Error('Invalid XML');
    const tei = selectTeiPoem(doc, poem);
    if (!tei?.firstElementChild) throw new Error('No transcription available for this selection');
    const xml = '<?xml version="1.0" encoding="UTF-8"?>\n' + new XMLSerializer().serializeToString(tei);
    output.textContent = xml;
    const download = document.getElementById('download');
    const url = URL.createObjectURL(new Blob([xml], { type: 'application/xml;charset=utf-8' }));
    download.href = url;
    download.download = `Amores-${poem}-${witness}.xml`;
    download.hidden = false;
    window.addEventListener('pagehide', () => URL.revokeObjectURL(url), { once: true });
  } catch (error) {
    output.textContent = `${error.message}. Use “Back to poem” to return.`;
  }
})();
