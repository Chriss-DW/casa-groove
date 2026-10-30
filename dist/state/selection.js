// The selection has one persistence boundary; the 3D room remains independent.
export const STORAGE_KEY = 'casa-groove:selection:v1';
export const emptySelection = () => ({ schemaVersion: 1, ids: [], note: '' });

export function validateSelection(value, knownIds) {
  if (!value || value.schemaVersion !== 1 || !Array.isArray(value.ids)
    || value.ids.length > knownIds.size || typeof value.note !== 'string' || value.note.length > 800
    || Object.keys(value).some(key => !['schemaVersion', 'ids', 'note'].includes(key))) {
    throw new Error('La selección guardada no tiene un formato compatible.');
  }
  if (value.ids.some(id => typeof id !== 'string' || !knownIds.has(id))
    || new Set(value.ids).size !== value.ids.length) throw new Error('Hay piezas que no se reconocen.');
  return { schemaVersion: 1, ids: [...value.ids], note: value.note };
}

export function createSelectionStore(knownIds, storage) {
  let state = emptySelection();
  let persistence = 'saved';
  let protectedData = false;
  const subscribers = new Set();
  try {
    const raw = storage?.getItem(STORAGE_KEY);
    if (raw) {
      if (raw.length > 16000) throw new Error('Selección demasiado grande.');
      state = validateSelection(JSON.parse(raw), knownIds);
    }
    if (!storage) persistence = 'memory';
  } catch {
    // Preserve unreadable data rather than replacing it with an empty selection.
    persistence = 'recovery';
    protectedData = true;
  }
  const snapshot = () => ({ ...state, ids: [...state.ids], persistence });
  function commit(next) {
    state = validateSelection(next, knownIds);
    if (!protectedData) {
      try {
        if (!storage) throw new Error('Almacenamiento no disponible.');
        storage.setItem(STORAGE_KEY, JSON.stringify(state));
        persistence = 'saved';
      } catch { persistence = 'memory'; }
    }
    subscribers.forEach(listener => listener(snapshot()));
    return snapshot();
  }
  return {
    snapshot,
    subscribe(listener) { subscribers.add(listener); return () => subscribers.delete(listener); },
    toggle(id) {
      if (!knownIds.has(id)) throw new Error('Pieza desconocida.');
      return commit({ ...state, ids: state.ids.includes(id) ? state.ids.filter(item => item !== id) : [...state.ids, id] });
    },
    setNote(note) { return commit({ ...state, note: note.slice(0, 800) }); },
    clear() { return commit(emptySelection()); },
    restore(previous) { return commit(validateSelection(previous, knownIds)); },
    reload() {
      // Another tab may update the same archive; never merge malformed input.
      try {
        const raw = storage?.getItem(STORAGE_KEY);
        if (raw && raw.length > 16000) throw new Error('Selección demasiado grande.');
        state = raw ? validateSelection(JSON.parse(raw), knownIds) : emptySelection();
        protectedData = false; persistence = storage ? 'saved' : 'memory';
      } catch { protectedData = true; persistence = 'recovery'; }
      subscribers.forEach(listener => listener(snapshot()));
    },
  };
}
