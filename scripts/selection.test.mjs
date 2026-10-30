import test from 'node:test';
import assert from 'node:assert/strict';
import { createSelectionStore, validateSelection, STORAGE_KEY } from '../dist/state/selection.js';
const known = new Set(['lamp','vinyl','sofa']);
const memory = (initial=null) => {
  const values=new Map(initial?[[STORAGE_KEY,initial]]:[]);
  return { getItem:key=>values.get(key)??null, setItem:(key,value)=>values.set(key,value) };
};
test('saves different categories once and restores their order and Unicode note',()=>{
  const storage=memory();const store=createSelectionStore(known,storage);
  store.toggle('lamp');store.toggle('vinyl');store.setNote('Una mañana más lenta 🌅');
  const restored=createSelectionStore(known,storage).snapshot();
  assert.deepEqual(restored.ids,['lamp','vinyl']);assert.equal(restored.note,'Una mañana más lenta 🌅');
  store.toggle('lamp');assert.deepEqual(store.snapshot().ids,['vinyl']);
});
test('rejects duplicate, unknown, future-version and excessive notes',()=>{
  for(const value of [{schemaVersion:1,ids:['lamp','lamp'],note:''},{schemaVersion:1,ids:['missing'],note:''},{schemaVersion:2,ids:[],note:''},{schemaVersion:1,ids:[],note:'a'.repeat(801)}])assert.throws(()=>validateSelection(value,known));
});
test('preserves malformed previous data instead of overwriting it',()=>{
  const storage=memory('{invalid');const store=createSelectionStore(known,storage);
  assert.equal(store.snapshot().persistence,'recovery');store.toggle('sofa');
  assert.equal(storage.getItem(STORAGE_KEY),'{invalid');assert.deepEqual(store.snapshot().ids,['sofa']);
});
test('quota and blocked storage retain in-memory selection without claiming saved',()=>{
  const store=createSelectionStore(known,{getItem:()=>null,setItem:()=>{throw new Error('quota');}});
  store.toggle('lamp');assert.equal(store.snapshot().persistence,'memory');assert.deepEqual(store.snapshot().ids,['lamp']);
  const blocked=createSelectionStore(known,null);blocked.toggle('vinyl');assert.equal(blocked.snapshot().persistence,'memory');
});
test('clear can be undone without losing the note',()=>{
  const store=createSelectionStore(known,memory());store.toggle('lamp');store.setNote('Luz a un lado.');
  const {persistence,...previous}=store.snapshot();store.clear();assert.deepEqual(store.snapshot().ids,[]);
  store.restore(previous);assert.equal(store.snapshot().note,'Luz a un lado.');assert.deepEqual(store.snapshot().ids,['lamp']);
});
test('another tab can update or clear the local archive',()=>{
  const storage=memory();const a=createSelectionStore(known,storage),b=createSelectionStore(known,storage);
  a.toggle('sofa');b.reload();assert.deepEqual(b.snapshot().ids,['sofa']);a.clear();b.reload();assert.deepEqual(b.snapshot().ids,[]);
});
