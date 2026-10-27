import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';
const source = await readFile(new URL('../docs/js/workspace-ui.js', import.meta.url), 'utf8');
function fixture() {
  const timers = new Map(); let timerId = 0;
  const create = () => ({children:[], hidden:false, events:{}, setAttribute(){}, append(...els){this.children.push(...els)}, addEventListener(name,fn){this.events[name]=fn}, remove(){this.removed=true}});
  const context = vm.createContext({ document:{createElement:create}, setTimeout(fn){timers.set(++timerId,fn);return timerId}, clearTimeout(id){timers.delete(id)} });
  vm.runInContext(source, context);
  const handlers = {}, itemHandlers = {}; let page = 2, loaded = false;
  let item = {getFullyLoaded:()=>loaded,addHandler:(name,fn)=>itemHandlers[name]=fn};
  const calls = [], viewer = {tileSources:['a','b','c','d'],currentPage:()=>page,world:{getItemAt:()=>item},addHandler:(name,fn)=>handlers[name]=fn,open:(...args)=>calls.push(args)};
  const element = create(); context.attachImageLoadingStatus(viewer,element,'P');
  const status = element.children[0], [message,retry]=status.children;
  return {handlers,itemHandlers,viewer,calls,status,message,retry,timers,get item(){return item}, setPage:n=>page=n, load:()=>loaded=true, replace:()=>item={getFullyLoaded:()=>false,addHandler(){}}};
}
test('loading waits for actual tiles, ignores stale page completion, and clears on destroy',()=>{
  const f=fixture(); f.handlers.open(); assert.equal(f.status.hidden,false);
  f.replace(); f.load(); f.itemHandlers['fully-loaded-change'](); assert.equal(f.status.hidden,false);
  f.handlers['before-destroy'](); assert.equal(f.timers.size,0); assert.equal(f.status.removed,true);
});
test('retry uses the current page and clears error feedback until the image loads',()=>{
  const f=fixture(); f.handlers['tile-load-failed']({tiledImage:f.item}); assert.equal(f.retry.hidden,false);
  f.setPage(3); f.retry.events.click(); assert.equal(f.calls[0][1],3); assert.equal(f.retry.hidden,true);
  assert.match(f.message.textContent,/page 4/); f.handlers.open(); f.load(); f.itemHandlers['fully-loaded-change'](); assert.equal(f.status.hidden,true);
});
test('slow images offer retry and late tile failures from an old image are ignored',()=>{
  const f=fixture(); [...f.timers.values()][0](); assert.equal(f.retry.hidden,false);
  f.handlers.page(); f.handlers['tile-load-failed']({tiledImage:{}}); assert.equal(f.retry.hidden,true);
  assert.match(f.message.textContent,/Loading/);
});
