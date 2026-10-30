import { items, pairNotes } from './catalog-data.js?v=4';
import { createSelectionStore, STORAGE_KEY } from './state/selection.js';

const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const byId = new Map(items.map(item => [item.id, item]));
const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[char]));
const icon = name => `<svg class="icon" aria-hidden="true"><use href="#${name}"/></svg>`;
let storage;
try { storage = window.localStorage; } catch { storage = null; }
const store = createSelectionStore(new Set(byId.keys()), storage);
const filter = { category: 'all', query: '', route: '', saved: false };
const routes = {
  calma: 'Una tarde sin pendientes: luz suave, superficies cálidas y un lugar donde quedarte. Guardá solo lo que te haga sentir bien.',
  escucha: 'Que suene la casa: un disco al alcance, madera alrededor y una luz que acompañe. El equipo no tiene que ocuparlo todo.',
  historia: 'Paredes con memoria: combiná una gráfica con carácter y muebles que le den aire. No hace falta completar la pared hoy.',
};
const normal = text => text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
let currentPiece = null;
let undoSelection = null;
let announcementTimer;
let pageOpener = null;
let returnToSelection = false;

document.body.insertAdjacentHTML('beforeend', `
<dialog class="selection-dialog" id="selection-dialog" aria-labelledby="selection-title"><div class="drawer-head"><div><h2 id="selection-title" tabindex="-1">Lo que te inspira.</h2><p>No tenés que decidir nada hoy.</p></div><button class="close-dialog" data-close="selection-dialog" aria-label="Cerrar mi selección">${icon('close')}</button></div>
<p class="selection-storage" id="selection-storage"></p><div id="selection-items"></div><div id="selection-notes"><label for="selection-note">Una idea para después</label><textarea id="selection-note" rows="3" maxlength="800" placeholder="Esa luz junto a la ventana, el verde del sofá…"></textarea><span id="note-count">0 / 800</span></div>
<div class="selection-actions"><button id="download-selection">Descargar mi selección ${icon('arrow')}</button><button id="clear-selection">Vaciar selección</button><button id="undo-selection" hidden>Deshacer</button></div><p class="selection-feedback" id="selection-feedback" role="status"></p><div class="selection-companions" id="selection-companions"></div><p class="drawer-footnote">Guardada en este navegador. Podés descargarla para llevar tus ideas con vos.</p></dialog>
<dialog class="piece-dialog" id="piece-dialog" aria-labelledby="piece-title"><button class="close-dialog" data-close="piece-dialog" aria-label="Cerrar detalle">${icon('close')}</button><img id="piece-image" alt="" width="900" height="900"><div class="piece-story"><h2 id="piece-title"></h2><p id="piece-description"></p><div class="piece-pair"><span>Una idea para acompañarlo</span><button id="piece-pair-button"></button><p id="piece-pair-reason"></p></div><button class="save-piece" id="piece-save">${icon('basket')}<span>Guardar en mi selección</span></button><a id="piece-credit" target="_blank" rel="noopener noreferrer"></a><button id="piece-back" hidden>Volver a mi selección ${icon('arrow')}</button></div></dialog>
<div class="catalog-announcement" id="catalog-announcement" role="status" aria-live="polite"></div>`);

$('.site-header nav').insertAdjacentHTML('beforeend', `<button class="header-selection" data-open-selection aria-label="Abrir mi selección">${icon('basket')}<span>Mi selección</span><b data-selection-count>0</b></button>`);

function announce(message) {
  const live = $('#catalog-announcement');
  clearTimeout(announcementTimer);
  live.textContent = message;
  live.classList.add('visible');
  announcementTimer = setTimeout(() => live.classList.remove('visible'), 3800);
}

function filterCatalog() {
  const selected = store.snapshot().ids;
  const words = normal(filter.query.trim()).split(/\s+/).filter(Boolean);
  let count = 0;
  items.forEach(item => {
    const haystack = normal([item.name, item.category, item.caption, item.description, ...item.moods].join(' '));
    const visible = (filter.category === 'all' || item.category === filter.category)
      && (!filter.route || item.moods.includes(filter.route))
      && (!filter.saved || selected.includes(item.id))
      && words.every(word => haystack.includes(word));
    $(`[data-product="${item.id}"]`).hidden = !visible;
    if (visible) count++;
  });
  $('#catalog-count').textContent = `${count} ${count === 1 ? 'pieza para mirar' : 'piezas para mirar'} a tu ritmo.${filter.saved ? ' De tu selección.' : ''}`;
  $('#catalog-empty').hidden = count > 0;
  $('#clear-catalog').hidden = !filter.query && filter.category === 'all' && !filter.route && !filter.saved;
  $('#route-description').hidden = !filter.route;
  $('#route-description').textContent = routes[filter.route] || '';
  $$('[data-filter]').forEach(button => {
    const active = button.dataset.filter === filter.category;
    button.classList.toggle('active', active); button.setAttribute('aria-pressed', String(active));
  });
  $$('[data-route]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.route === filter.route)));
  $('#only-saved').setAttribute('aria-pressed', String(filter.saved));
}
function resetFilters() {
  Object.assign(filter, { category:'all', query:'', route:'', saved:false });
  $('#catalog-search').value = ''; filterCatalog();
}

function openDialog(dialog, opener) {
  const candidate = opener || document.activeElement;
  // Keep the page trigger throughout nested selection/detail navigation.
  if (candidate && !candidate.closest('dialog')) pageOpener = candidate;
  dialog.showModal();
  document.documentElement.classList.add('catalog-dialog-open');
}
function closeDialog(dialog) {
  dialog.close();
}
function openPiece(id, opener, fromSelection = false) {
  const item = byId.get(id);
  if (!item) return;
  returnToSelection = fromSelection || returnToSelection;
  if ($('#selection-dialog').open) $('#selection-dialog').close();
  currentPiece = item;
  $('#piece-image').src = item.photo.src;
  $('#piece-image').alt = item.photo.alt;
  $('#piece-image').style.objectPosition = item.photo.position;
  $('#piece-title').textContent = item.name;
  $('#piece-description').textContent = item.description;
  const pair = byId.get(item.pair);
  $('#piece-pair-button').textContent = pair.name + ' →';
  $('#piece-pair-button').dataset.pair = pair.id;
  $('#piece-pair-reason').textContent = pairNotes[item.id];
  $('#piece-credit').textContent = `Fotografía: ${item.photo.author} · Ver original`;
  $('#piece-credit').href = item.photo.source;
  $('#piece-save').dataset.save = item.id;
  $('#piece-back').hidden = !returnToSelection;
  syncSaveButtons(store.snapshot());
  if (!$('#piece-dialog').open) openDialog($('#piece-dialog'), opener);
  else $('#piece-dialog').scrollTop = 0;
}
function syncSaveButtons(state) {
  $$('[data-selection-count]').forEach(counter => { counter.textContent = state.ids.length; });
  $$('[data-save]').forEach(button => {
    const item = byId.get(button.dataset.save);
    const selected = state.ids.includes(item.id);
    button.classList.toggle('is-saved', selected);
    button.setAttribute('aria-pressed', String(selected));
    button.setAttribute('aria-label', `${selected ? 'Quitar' : 'Guardar'} ${item.name} ${selected ? 'de' : 'en'} mi selección`);
    button.querySelector('span').textContent = selected ? 'Guardado' : (button.id === 'piece-save' ? 'Guardar en mi selección' : 'Guardar');
  });
}
function renderSelection(state) {
  const list = $('#selection-items');
  list.innerHTML = state.ids.length ? state.ids.map(id => {
    const item = byId.get(id);
    return `<article class="selection-item"><button class="selection-item-look" data-selection-look="${id}" aria-label="Mirar ${escape(item.name)}"><img src="${item.photo.src}" alt="" width="90" height="105"><span><strong>${escape(item.name)}</strong><small>${escape(item.caption)}</small></span></button><button class="remove-selection" data-remove="${id}" aria-label="Quitar ${escape(item.name)}">${icon('close')}</button></article>`;
  }).join('') : `<div class="selection-empty"><svg aria-hidden="true"><use href="#basket"/></svg><h3>Hay espacio para una idea.</h3><p>Guardá una lámpara, un disco o esa pieza que te hizo detenerte un ratito. Tu selección puede empezar con una sola cosa.</p><button data-close="selection-dialog">Seguir explorando ${icon('arrow')}</button></div>`;
  $('#selection-storage').textContent = state.persistence === 'saved' ? `${state.ids.length} ${state.ids.length === 1 ? 'inspiración guardada' : 'inspiraciones guardadas'}. Podés cambiar de idea cuando querás.`
    : state.persistence === 'recovery' ? 'Hay una selección anterior que no pudimos leer. La conservamos sin sobrescribirla; descargá tus ideas nuevas para no perderlas.'
      : 'Este navegador no permite guardar ahora. Tus ideas siguen acá mientras esta página esté abierta; descargalas para conservarlas.';
  if (document.activeElement !== $('#selection-note')) $('#selection-note').value = state.note;
  $('#note-count').textContent = `${state.note.length} / 800`;
  $('#download-selection').disabled = state.ids.length === 0;
  $('#clear-selection').disabled = state.ids.length === 0 && !state.note;
  $('#undo-selection').hidden = !undoSelection;
  const candidates = [];
  [...state.ids].reverse().forEach(id => {
    const source = byId.get(id);
    const item = byId.get(source.pair);
    if (!state.ids.includes(item.id) && !candidates.some(entry => entry.item.id === item.id)) candidates.push({ item, source });
  });
  $('#selection-companions').innerHTML = candidates.length ? `<h3>Podrían conversar bien.</h3><p>Ideas para acompañar lo que guardaste. Sin necesidad de sumar nada más.</p>${candidates.slice(0,2).map(({item,source}) => `<button data-selection-look="${item.id}" class="companion"><img src="${item.photo.src}" alt="" width="70" height="75"><span><strong>${escape(item.name)}</strong><small>Para acompañar ${escape(source.name)}. ${escape(pairNotes[source.id])}</small></span>${icon('arrow')}</button>`).join('')}` : '';
}

store.subscribe(state => { syncSaveButtons(state); renderSelection(state); filterCatalog(); });
syncSaveButtons(store.snapshot()); renderSelection(store.snapshot()); filterCatalog();
document.body.dataset.selectionReady = 'true';

document.addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button) return;
  if (button.hasAttribute('data-open-selection')) {
    returnToSelection = false; renderSelection(store.snapshot()); openDialog($('#selection-dialog'), button);
  } else if (button.dataset.close) closeDialog(document.getElementById(button.dataset.close));
  else if (button.dataset.save) {
    undoSelection = null;
    const saved = store.snapshot().ids.includes(button.dataset.save);
    const state = store.toggle(button.dataset.save);
    announce(`${byId.get(button.dataset.save).name}: ${saved ? 'quitado de tu selección.' : state.persistence === 'saved' ? 'guardado para después.' : 'en tu selección de esta sesión. Descargala para conservarla.'}`);
  } else if (button.dataset.look) openPiece(button.dataset.look, button);
  else if (button.dataset.pair) openPiece(button.dataset.pair, button);
  else if (button.dataset.selectionLook) openPiece(button.dataset.selectionLook, button, true);
  else if (button.dataset.remove) {
    const index = store.snapshot().ids.indexOf(button.dataset.remove);
    undoSelection = null; store.toggle(button.dataset.remove);
    const remaining = $$('#selection-items .remove-selection');
    (remaining[Math.min(index, remaining.length-1)] || $('#selection-title')).focus();
    $('#selection-feedback').textContent = 'Pieza quitada. Podés volver a guardarla cuando querás.';
  } else if (button.dataset.filter) { filter.category = button.dataset.filter; filterCatalog(); }
  else if (button.dataset.route) {
    Object.assign(filter, { route:button.dataset.route, category:'all', query:'', saved:false });
    $('#catalog-search').value = ''; filterCatalog();
    $('#catalog-controls').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block:'start' });
  }
});
$('#catalog-search').addEventListener('input', event => { filter.query = event.target.value; filterCatalog(); });
$('#only-saved').addEventListener('click', () => { filter.saved = !filter.saved; filterCatalog(); });
$('#clear-catalog').addEventListener('click', resetFilters);
$('#empty-reset').addEventListener('click', () => { resetFilters(); $('#catalog-search').focus(); });
$('#selection-note').addEventListener('input', event => store.setNote(event.target.value));
$('#clear-selection').addEventListener('click', () => {
  const previous = store.snapshot();
  undoSelection = { schemaVersion:1, ids:previous.ids, note:previous.note };
  store.clear(); $('#undo-selection').focus();
  $('#selection-feedback').textContent = 'Tu selección quedó vacía. Podés deshacer este cambio.';
});
$('#undo-selection').addEventListener('click', () => {
  if (!undoSelection) return;
  const previous = undoSelection; undoSelection = null; store.restore(previous);
  $('#selection-feedback').textContent = 'Tu selección está de vuelta.'; $('#selection-title').focus();
});
$('#piece-back').addEventListener('click', () => {
  returnToSelection = true; $('#piece-dialog').close();
});
$$('.selection-dialog, .piece-dialog').forEach(dialog => {
  dialog.addEventListener('click', event => { if (event.target === dialog) { const r=dialog.getBoundingClientRect(); if(event.clientX<r.left || event.clientX>r.right || event.clientY<r.top || event.clientY>r.bottom) dialog.close(); } });
  dialog.addEventListener('close', () => {
    if (dialog.id === 'piece-dialog' && returnToSelection) {
      returnToSelection = false; renderSelection(store.snapshot()); $('#selection-dialog').showModal();
      $('#selection-title').focus(); return;
    }
    if (!$('#piece-dialog').open && !$('#selection-dialog').open) {
      document.documentElement.classList.remove('catalog-dialog-open');
      if (pageOpener?.isConnected && !pageOpener.closest('[hidden]')) pageOpener.focus({preventScroll:true});
      else $('#catalog-search').focus({preventScroll:true});
    }
  });
});
window.addEventListener('storage', event => { if (event.key === STORAGE_KEY || event.key === null) store.reload(); });

async function dataImage(src) {
  const response = await fetch(src);
  if (!response.ok) throw new Error('No se pudo incluir una fotografía.');
  const blob = await response.blob();
  return new Promise((resolve,reject) => { const reader=new FileReader(); reader.onload=()=>resolve(reader.result); reader.onerror=reject; reader.readAsDataURL(blob); });
}
$('#download-selection').addEventListener('click', async () => {
  const button = $('#download-selection');
  const state = store.snapshot();
  if (!state.ids.length) return;
  button.disabled = true; button.textContent = 'Preparando tus ideas…';
  try {
    const entries = await Promise.all(state.ids.map(async id => ({item:byId.get(id), image:await dataImage(byId.get(id).photo.src)})));
    const html = `<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Mi selección · CASA GROOVE</title><style>body{margin:0;padding:6%;background:#211b18;color:#eee3d0;font:16px/1.7 system-ui,sans-serif}main{max-width:1100px;margin:auto}h1{font:normal clamp(40px,7vw,75px)/1.1 Georgia,serif;margin:40px 0 20px}header p{max-width:55ch;color:#cfbba2}.notes{white-space:pre-wrap;border-block:1px solid #79634c;padding:25px 0}section{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:40px;margin:50px 0}article img{width:100%;height:280px;object-fit:cover}h2{font:26px/1.2 Georgia,serif}article p{color:#cfbba2}a{color:#dec395;font-size:12px}footer{border-top:1px solid #79634c;padding-top:25px}@media print{body{background:white;color:#211b18}article{break-inside:avoid}article p,header p,a{color:#3d3026}}</style><main><header><p>CASA GROOVE</p><h1>Lo que me inspira.</h1><p>Podés llevarte una idea. Lo demás puede esperar.</p></header>${state.note ? `<p class="notes">${escape(state.note)}</p>` : ''}<section>${entries.map(({item,image})=>`<article><img src="${image}" alt="${escape(item.photo.alt)}"><h2>${escape(item.name)}</h2><p>${escape(item.description)}</p><a href="${escape(item.photo.source)}">Fotografía: ${escape(item.photo.author)}</a></article>`).join('')}</section><footer>Una selección personal de fotografías de inspiración. Nombres y dirección editorial: CASA GROOVE. <a href="https://unsplash.com/license">Licencia de las fotografías</a>.</footer></main></html>`;
    const url = URL.createObjectURL(new Blob([html], {type:'text/html;charset=utf-8'}));
    const link = document.createElement('a'); link.href=url; link.download='mi-seleccion-casa-groove.html'; document.body.append(link); link.click(); link.remove();
    setTimeout(()=>URL.revokeObjectURL(url),10000);
    $('#selection-feedback').textContent = 'Tu archivo está listo. Abrilo en el navegador para volver a tus ideas, incluso sin conexión.';
  } catch { $('#selection-feedback').textContent = 'No pudimos preparar el archivo. Tu selección sigue acá; probá descargarla otra vez.'; }
  finally { button.disabled=store.snapshot().ids.length===0; button.innerHTML='Descargar mi selección '+icon('arrow'); }
});
