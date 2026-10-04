(() => {
  'use strict';

  const VERSION = 'v29-local-supabase-2026-10-04';
  const TIMEOUT = 15000;

  class SupabaseCompatError extends Error {
    constructor(message, meta = {}) {
      super(message || 'Supabase request failed.');
      this.name = meta.name || 'SupabaseError';
      this.code = meta.code || '';
      this.status = meta.status || 0;
      this.details = meta.details || null;
      this.hint = meta.hint || null;
    }
  }

  const parse = async r => {
    if (r.status === 204) return null;
    const t = r.headers.get('content-type') || '';
    try { return t.includes('json') ? await r.json() : await r.text(); }
    catch { return null; }
  };

  const signal = (ms = TIMEOUT) => {
    if (globalThis.AbortSignal?.timeout) return AbortSignal.timeout(ms);
    const c = new AbortController();
    setTimeout(() => c.abort(), ms);
    return c.signal;
  };

  const jwt = token => {
    try {
      let p = String(token || '').split('.')[1] || '';
      p = p.replace(/-/g, '+').replace(/_/g, '/');
      p += '='.repeat((4 - p.length % 4) % 4);
      return JSON.parse(decodeURIComponent(escape(atob(p))));
    } catch { return null; }
  };

  const projectRef = url => {
    try { return new URL(url).hostname.split('.')[0] || 'vivid'; }
    catch { return 'vivid'; }
  };

  const normalizeSession = raw => {
    if (!raw?.access_token) return null;
    const p = jwt(raw.access_token);
    const expires_in = Number(raw.expires_in || 3600);
    const expires_at = Number(raw.expires_at || p?.exp || (Math.floor(Date.now()/1000) + expires_in));
    return {...raw, expires_in, expires_at, token_type: raw.token_type || 'bearer', user: raw.user || null};
  };

  function createClient(url, key, options = {}) {
    const base = String(url || '').replace(/\/+$/, '');
    const apiKey = String(key || '').trim();
    if (!base || !apiKey) throw new SupabaseCompatError('Supabase URL yoki key topilmadi.');

    const ref = projectRef(base);
    const storeKey = options?.auth?.storageKey || ('vivid-supabase-session:' + ref);
    let memory = null;
    let refreshPromise = null;

    const load = () => {
      if (memory) return memory;
      try {
        const raw = JSON.parse(localStorage.getItem(storeKey) || 'null');
        memory = normalizeSession(raw?.session || raw);
      } catch {}
      return memory;
    };

    const save = s => {
      memory = normalizeSession(s);
      try {
        if (memory) localStorage.setItem(storeKey, JSON.stringify(memory));
        else localStorage.removeItem(storeKey);
      } catch {}
      return memory;
    };

    const authFetch = async (path, init = {}) => {
      let r;
      try {
        r = await fetch(base + '/auth/v1' + path, {
          ...init,
          headers: {'apikey': apiKey, 'Content-Type': 'application/json', ...(init.headers || {})},
          signal: init.signal || signal()
        });
      } catch (e) {
        throw new SupabaseCompatError('Supabase serveriga ulanib bo‘lmadi.', {name:'AuthRetryableFetchError', details:e});
      }
      const body = await parse(r);
      if (!r.ok) throw new SupabaseCompatError(body?.msg || body?.message || body?.error_description || body?.error || ('Auth error ' + r.status), {
        name:'AuthApiError', code:body?.code || body?.error_code || '', status:r.status, details:body
      });
      return body;
    };

    const refresh = async refresh_token => {
      if (!refresh_token) return null;
      if (refreshPromise) return refreshPromise;
      refreshPromise = authFetch('/token?grant_type=refresh_token', {
        method:'POST', body:JSON.stringify({refresh_token})
      }).then(save).finally(() => { refreshPromise = null; });
      return refreshPromise;
    };

    const consumeCallback = async () => {
      if (options?.auth?.detectSessionInUrl === false) return load();
      const h = new URLSearchParams((location.hash || '').replace(/^#/, ''));
      const access_token = h.get('access_token');
      if (!access_token) return load();
      const session = save({
        access_token,
        refresh_token:h.get('refresh_token') || '',
        token_type:h.get('token_type') || 'bearer',
        expires_in:Number(h.get('expires_in') || 3600),
        expires_at:Number(h.get('expires_at') || 0)
      });
      try { history.replaceState({}, document.title, location.pathname + location.search); } catch {}
      return session;
    };

    const current = async () => {
      await consumeCallback();
      let s = load();
      if (!s) return null;
      if (s.expires_at * 1000 <= Date.now() + 60000 && s.refresh_token) {
        try { s = await refresh(s.refresh_token); } catch {}
      }
      return load();
    };

    const headers = async extra => {
      const s = await current();
      return {'apikey':apiKey, 'Authorization':'Bearer ' + (s?.access_token || apiKey), ...(extra || {})};
    };

    const auth = {
      async getSession() {
        try { return {data:{session:await current()}, error:null}; }
        catch (error) { return {data:{session:null}, error}; }
      },

      async getUser() {
        const s = await current();
        if (!s?.access_token) {
          return {data:{user:null}, error:new SupabaseCompatError('Auth session missing!', {name:'AuthSessionMissingError'})};
        }
        try {
          const r = await fetch(base + '/auth/v1/user', {
            headers:{apikey:apiKey, Authorization:'Bearer ' + s.access_token},
            signal:signal()
          });
          const body = await parse(r);
          if (!r.ok) throw new SupabaseCompatError(body?.message || body?.msg || ('Auth error ' + r.status), {name:'AuthApiError', status:r.status, details:body});
          save({...s, user:body});
          return {data:{user:body}, error:null};
        } catch (error) { return {data:{user:null}, error}; }
      },

      async signInWithPassword({email, password} = {}) {
        try {
          const body = await authFetch('/token?grant_type=password', {
            method:'POST', body:JSON.stringify({email:String(email || '').trim(), password:String(password || '')})
          });
          const session = save(body);
          return {data:{user:session?.user || null, session}, error:null};
        } catch (error) { return {data:{user:null, session:null}, error}; }
      },

      async signUp({email, password, options:opts = {}} = {}) {
        try {
          const redirect = opts?.emailRedirectTo;
          const path = redirect ? '/signup?redirect_to=' + encodeURIComponent(redirect) : '/signup';
          const body = await authFetch(path, {
            method:'POST',
            body:JSON.stringify({email:String(email || '').trim(), password:String(password || ''), data:opts?.data || {}})
          });
          const session = body?.access_token ? save(body) : null;
          return {data:{user:body?.user || session?.user || body || null, session}, error:null};
        } catch (error) { return {data:{user:null, session:null}, error}; }
      },

      async signInWithOAuth({provider, options:opts = {}} = {}) {
        try {
          const p = String(provider || '').trim();
          if (!p) throw new SupabaseCompatError('OAuth provider topilmadi.');
          const redirect = opts.redirectTo || (location.origin + location.pathname);
          const q = new URLSearchParams({provider:p, redirect_to:redirect});
          if (opts.scopes) q.set('scopes', opts.scopes);
          if (opts.queryParams) Object.entries(opts.queryParams).forEach(([k,v]) => q.set(k, String(v)));
          const authUrl = base + '/auth/v1/authorize?' + q.toString();
          if (!opts.skipBrowserRedirect) location.assign(authUrl);
          return {data:{provider:p, url:authUrl}, error:null};
        } catch (error) { return {data:{provider:provider || null, url:null}, error}; }
      },

      async resetPasswordForEmail(email, opts = {}) {
        try {
          const redirect = opts.redirectTo;
          const path = redirect ? '/recover?redirect_to=' + encodeURIComponent(redirect) : '/recover';
          await authFetch(path, {method:'POST', body:JSON.stringify({email:String(email || '').trim()})});
          return {data:{}, error:null};
        } catch (error) { return {data:null, error}; }
      },

      async signOut() {
        const s = await current();
        try {
          if (s?.access_token) await authFetch('/logout?scope=global', {
            method:'POST',
            headers:{Authorization:'Bearer ' + s.access_token},
            body:'{}'
          });
        } catch {}
        save(null);
        return {error:null};
      }
    };

    class SelectBuilder {
      constructor(table, columns) { this.table = table; this.columns = columns || '*'; this.filters = []; }
      eq(column, value) { this.filters.push([column, value]); return this; }
      async maybeSingle() {
        try {
          const q = new URLSearchParams({select:this.columns, limit:'1'});
          this.filters.forEach(([c,v]) => q.append(c, 'eq.' + v));
          const r = await fetch(base + '/rest/v1/' + encodeURIComponent(this.table) + '?' + q.toString(), {
            headers:await headers({Accept:'application/json'}), signal:signal()
          });
          const body = await parse(r);
          if (!r.ok) throw new SupabaseCompatError(body?.message || ('Database error ' + r.status), {name:'PostgrestError', code:body?.code || '', status:r.status, details:body, hint:body?.hint});
          return {data:Array.isArray(body) ? (body[0] || null) : (body || null), error:null};
        } catch (error) { return {data:null, error}; }
      }
    }

    const from = table => ({
      select(columns='*') { return new SelectBuilder(String(table || ''), columns); },
      async upsert(values, opts={}) {
        try {
          const q = new URLSearchParams();
          if (opts.onConflict) q.set('on_conflict', opts.onConflict);
          const r = await fetch(base + '/rest/v1/' + encodeURIComponent(String(table || '')) + (q.toString() ? '?' + q.toString() : ''), {
            method:'POST',
            headers:await headers({'Content-Type':'application/json', Prefer:'resolution=merge-duplicates,return=minimal'}),
            body:JSON.stringify(values), signal:signal()
          });
          const body = await parse(r);
          if (!r.ok) throw new SupabaseCompatError(body?.message || ('Database error ' + r.status), {name:'PostgrestError', code:body?.code || '', status:r.status, details:body, hint:body?.hint});
          return {data:body, error:null};
        } catch (error) { return {data:null, error}; }
      }
    });

    const storage = {
      from(bucket) {
        const b = encodeURIComponent(String(bucket || ''));
        return {
          async upload(path, body, opts={}) {
            try {
              const p = String(path || '').split('/').map(encodeURIComponent).join('/');
              const r = await fetch(base + '/storage/v1/object/' + b + '/' + p, {
                method:'POST',
                headers:await headers({'Content-Type':opts.contentType || body?.type || 'application/octet-stream', 'x-upsert':opts.upsert ? 'true' : 'false'}),
                body, signal:signal(30000)
              });
              const data = await parse(r);
              if (!r.ok) throw new SupabaseCompatError(data?.message || ('Storage error ' + r.status), {name:'StorageApiError', status:r.status, details:data});
              return {data:data || {path}, error:null};
            } catch (error) { return {data:null, error}; }
          },
          async download(path) {
            try {
              const p = String(path || '').split('/').map(encodeURIComponent).join('/');
              const r = await fetch(base + '/storage/v1/object/' + b + '/' + p, {headers:await headers(), signal:signal(30000)});
              if (!r.ok) {
                const data = await parse(r);
                throw new SupabaseCompatError(data?.message || ('Storage error ' + r.status), {name:'StorageApiError', status:r.status, details:data});
              }
              return {data:await r.blob(), error:null};
            } catch (error) { return {data:null, error}; }
          }
        };
      }
    };

    return {auth, from, storage, __vividCompat:true, __version:VERSION};
  }

  window.supabase = {createClient, __vividLocal:true, __version:VERSION};
  window.VividSupabaseLoader = {ready:async()=>window.supabase, reset(){}, get loaded(){return true;}, version:VERSION};
  window.dispatchEvent(new CustomEvent('vivid:supabase-ready', {detail:{local:true, version:VERSION}}));
})();