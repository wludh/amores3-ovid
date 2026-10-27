/* Workspace controls preserve panel DOM and selection state across layouts. */
function initializeWorkspaceUI() {
  const workspace = document.getElementById('panels');
  const mobile = matchMedia('(max-width: 600px)');
  const tabs = document.createElement('div');
  tabs.className = 'workspace-tabs';
  tabs.setAttribute('role', 'tablist');
  tabs.setAttribute('aria-label', 'Reading workspace');
  workspace.before(tabs);
  const announcement = document.createElement('p');
  announcement.className = 'visually-hidden';
  announcement.setAttribute('role', 'status');
  workspace.before(announcement);
  let activeId = 'text-panel';
  const panels = () => [...workspace.querySelectorAll(':scope > section')];
  const title = panel => panel.querySelector('.panel-type-select').selectedOptions[0].textContent;
  const shortTitle = panel => ({transcription:'Text', viewer:'Images', 'line-viewer':'Compare', companion:'Companion'})[panel.dataset.panelType] || title(panel);
  function activate(panel) {
    activeId = panel.id;
    if (panel.classList.contains('collapsed')) panel.querySelector('.toggle-btn').click();
    refresh();
    window.dispatchEvent(new Event('resize'));
  }
  function refresh() {
    const ordered = panels();
    ordered.forEach((panel, i) => {
      const name = `${title(panel)}, panel ${i + 1}`;
      panel.setAttribute('aria-label', name);
      panel.classList.toggle('mobile-active', panel.id === activeId);
      if (mobile.matches) {
        panel.setAttribute('role', 'tabpanel');
        panel.setAttribute('aria-labelledby', `${panel.id}-tab`);
      } else {
        panel.removeAttribute('role'); panel.removeAttribute('aria-labelledby');
      }
      const body = panel.querySelector('.panel-body');
      body.id = `${panel.id}-body`;
      const collapsed = panel.classList.contains('collapsed');
      const toggle = panel.querySelector('.toggle-btn');
      toggle.textContent = collapsed ? 'Expand' : '−';
      toggle.title = `${collapsed ? 'Expand' : 'Collapse'} ${name}`;
      toggle.setAttribute('aria-label', toggle.title);
      toggle.setAttribute('aria-expanded', String(!collapsed));
      toggle.setAttribute('aria-controls', body.id);
      for (const [selector, label] of [['.panel-type-select','Panel type'],['.poem-select','Poem'],['.witness-select','Witness'],['.page-input','Page number'],['.prev-page','Previous page'],['.next-page','Next page']]) {
        panel.querySelectorAll(selector).forEach(el => el.setAttribute('aria-label', `${label} — ${name}`));
      }
      panel.querySelector('.panel-actions-button').setAttribute('aria-label', `Arrange ${name}`);
      panel.querySelector('[data-move="-1"]').disabled = i === 0;
      panel.querySelector('[data-move="1"]').disabled = i === ordered.length - 1;
      const tab = document.getElementById(`${panel.id}-tab`);
      tab.textContent = shortTitle(panel);
      tab.setAttribute('aria-label', `${shortTitle(panel)}, panel ${i + 1}`);
      tab.setAttribute('aria-selected', String(panel.id === activeId));
      tab.tabIndex = panel.id === activeId ? 0 : -1;
      tabs.append(tab);
    });
  }
  panels().forEach(panel => {
    const tab = document.createElement('button');
    tab.type = 'button'; tab.id = `${panel.id}-tab`;
    tab.setAttribute('role', 'tab'); tab.setAttribute('aria-controls', panel.id);
    tab.addEventListener('click', () => activate(panel));
    tabs.append(tab);
    const oldHandle = panel.querySelector('.drag-handle');
    const handle = document.createElement('button');
    handle.type = 'button'; handle.className = 'drag-handle panel-actions-button';
    handle.textContent = '☰'; handle.title = 'Drag to reorder or open arrangement controls';
    handle.setAttribute('aria-expanded', 'false');
    const actions = document.createElement('div');
    actions.id = `${panel.id}-actions`; actions.className = 'panel-actions'; actions.hidden = true;
    handle.setAttribute('aria-controls', actions.id);
    for (const [direction, label] of [[-1,'Move left'],[1,'Move right']]) {
      const button = document.createElement('button');
      button.type = 'button'; button.textContent = label; button.dataset.move = direction;
      button.addEventListener('click', () => {
        const ordered = panels(), index = ordered.indexOf(panel), neighbor = ordered[index + direction];
        if (!neighbor) return;
        if (direction < 0) workspace.insertBefore(panel, neighbor);
        else workspace.insertBefore(neighbor, panel);
        workspace.dispatchEvent(new Event('panel-reordered'));
        actions.hidden = true; handle.setAttribute('aria-expanded','false');
        refresh(); handle.focus(); announcement.textContent = `${title(panel)} moved to position ${panels().indexOf(panel) + 1}.`;
      });
      actions.append(button);
    }
    handle.addEventListener('click', () => {
      actions.hidden = !actions.hidden;
      handle.setAttribute('aria-expanded', String(!actions.hidden));
    });
    panel.addEventListener('keydown', event => {
      if (event.key === 'Escape' && !actions.hidden) {
        actions.hidden = true; handle.setAttribute('aria-expanded','false'); handle.focus();
      }
    });
    oldHandle.replaceWith(handle); panel.querySelector('.panel-header').append(actions);
    panel.querySelector('.toggle-btn').addEventListener('click', refresh);
    panel.querySelector('.panel-type-select').addEventListener('change', refresh);
  });
  tabs.addEventListener('keydown', event => {
    const ordered = panels(); let index = ordered.findIndex(panel => panel.id === activeId);
    if (event.key === 'ArrowRight') index = (index + 1) % ordered.length;
    else if (event.key === 'ArrowLeft') index = (index + ordered.length - 1) % ordered.length;
    else if (event.key === 'Home') index = 0;
    else if (event.key === 'End') index = ordered.length - 1;
    else return;
    event.preventDefault(); activate(ordered[index]); document.getElementById(`${activeId}-tab`).focus();
  });
  workspace.addEventListener('panel-order-updated', refresh);
  workspace.classList.add('mobile-workspace-ready');
  mobile.addEventListener('change', () => {
    if (mobile.matches) activate(document.getElementById(activeId));
    else refresh();
  });
  refresh();
}

function showManifestStatus(element, witness, retryAction) {
  element.replaceChildren();
  const status = document.createElement('div'); status.className = 'image-status';
  status.setAttribute('role', 'status');
  status.textContent = retryAction ? `Witness ${witness} could not load. ` : `Loading witness ${witness}…`;
  if (retryAction) {
    const retry = document.createElement('button'); retry.type = 'button'; retry.textContent = 'Retry witness';
    retry.addEventListener('click', retryAction); status.append(retry);
  }
  element.append(status);
}

function attachImageLoadingStatus(viewer, element, witness) {
  const status = document.createElement('div'); status.className = 'image-status'; status.setAttribute('role','status');
  const message = document.createElement('span'), retry = document.createElement('button');
  retry.type = 'button'; retry.textContent = 'Retry image'; retry.hidden = true;
  status.append(message, retry); element.append(status);
  let timer;
  function loading() {
    clearTimeout(timer); status.hidden = false; retry.hidden = true;
    message.textContent = `Loading witness ${witness}, page ${viewer.currentPage() + 1}… `;
    timer = setTimeout(() => {
      message.textContent = `Witness ${witness}, page ${viewer.currentPage() + 1} is taking longer than expected. `;
      retry.hidden = false;
    }, 15000);
  }
  function failed() {
    if (witness === 'Y') { clearTimeout(timer); status.hidden = true; return; }
    clearTimeout(timer); status.hidden = false; retry.hidden = false;
    message.textContent = `Witness ${witness}, page ${viewer.currentPage() + 1} could not load completely. `;
  }
  viewer.addHandler('page', loading);
  viewer.addHandler('open', () => {
    loading();
    const item = viewer.world.getItemAt(0);
    const complete = () => { if (item && item === viewer.world.getItemAt(0) && item.getFullyLoaded()) {clearTimeout(timer); status.hidden = true;} };
    item?.addHandler('fully-loaded-change', complete); complete();
  });
  viewer.addHandler('open-failed', failed);
  viewer.addHandler('tile-load-failed', event => { if (event.tiledImage === viewer.world.getItemAt(0)) failed(); });
  viewer.addHandler('before-destroy', () => {clearTimeout(timer); status.remove();});
  retry.addEventListener('click', () => { loading(); viewer.open(viewer.tileSources, viewer.currentPage()); });
  loading();
}
