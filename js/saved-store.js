// Account-scoped cache + replayable atomic operations. No automatic legacy import.
export class SavedStore {
  constructor({storage, adapter, onChange = () => {}, onStatus = () => {}}) {
    Object.assign(this, {storage, adapter, onChange, onStatus});
    this.user = null; this.generation = 0; this.list = []; this.pending = {}; this.queue = Promise.resolve();
    const legacy = this.get('soriSaved');
    if (legacy && !this.get('soriSaved:legacy-backup')) this.put('soriSaved:legacy-backup', legacy);
  }
  get(key) { try { return this.storage.getItem(key); } catch { return null; } }
  put(key, value) { try { this.storage.setItem(key, value); return true; } catch { this.onStatus('local-error'); return false; } }
  key(uid) { return 'soriSaved:user:' + uid; }
  clean(list) { return [...new Set((Array.isArray(list) ? list : []).filter(x => typeof x === 'string' && x.length))]; }
  cache() { if (this.user) this.put(this.key(this.user.uid), JSON.stringify({list:this.list, pending:this.pending})); }
  publish() { this.put('soriSaved', JSON.stringify(this.list)); this.onChange([...this.list]); }
  apply(list, pending) {
    const result = new Set(this.clean(list));
    for (const [id, op] of Object.entries(pending)) op.saved ? result.add(id) : result.delete(id);
    return [...result];
  }
  async setUser(user) {
    const generation = ++this.generation;
    this.user = user; this.list = []; this.pending = {}; this.loadingOps=null; this.queue = Promise.resolve();
    if (user) {
      try { const cache = JSON.parse(this.get(this.key(user.uid)) || '{}'); this.list=this.clean(cache.list); this.pending=cache.pending || {}; } catch {}
    }
    this.publish();
    if (!user) return;
    this.loadingOps = {...this.pending};
    this.onStatus('loading');
    try {
      const remote = await this.adapter.read(user);
      if (generation !== this.generation) return;
      this.list = this.apply(remote, {...this.loadingOps, ...this.pending}); this.loadingOps=null; this.cache(); this.publish(); this.onStatus('synced');
      for (const [id, op] of Object.entries(this.pending)) this.enqueue(user, generation, id, op);
    } catch { if (generation === this.generation) this.onStatus('offline'); }
  }
  toggle(id) {
    if (!this.user || typeof id !== 'string' || !id) return;
    const op = {saved: !this.list.includes(id), version: (this.pending[id]?.version || 0) + 1};
    this.pending[id] = op; if (this.loadingOps) this.loadingOps[id]=op; this.list = this.apply(this.list, {[id]:op}); this.cache(); this.publish();
    this.enqueue(this.user, this.generation, id, op);
  }
  enqueue(user, generation, id, op) {
    this.queue = this.queue.then(async () => {
      if (generation !== this.generation) return;
      try {
        await this.adapter.update(user, id, op.saved);
        if (generation !== this.generation) return;
        if (this.pending[id] === op) { delete this.pending[id]; this.cache(); }
        this.onStatus(Object.keys(this.pending).length ? 'pending' : 'synced');
      } catch { if (generation === this.generation) this.onStatus('offline'); }
    });
    return this.queue;
  }
}
