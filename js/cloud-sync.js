(() => {
  const cfg = window.CLASS6_AUTH_CONFIG || {};
  const OWNER_KEY = 'class6CloudOwnerV1';
  let clientPromise = null;
  let saveQueue = Promise.resolve();
  let sessionUserId = null;
  let sessionFresh = false;

  function configured() {
    return Boolean(String(cfg.url || '').trim() && String(cfg.anonKey || '').trim());
  }

  async function getClient() {
    if (!configured()) return null;
    if (!clientPromise) {
      clientPromise = import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm')
        .then(({ createClient }) => createClient(String(cfg.url).trim(), String(cfg.anonKey).trim()));
    }
    return clientPromise;
  }

  async function getUser() {
    const supabase = await getClient();
    if (!supabase) return null;
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data?.user || null;
  }

  function prepareUser(userId) {
    const nextUserId = String(userId || '').trim();
    if (!nextUserId) return { changed: false, previousUserId: null, userId: null };
    if (sessionUserId === nextUserId) {
      return { changed: sessionFresh, previousUserId: nextUserId, userId: nextUserId };
    }

    let previousUserId = null;
    try { previousUserId = String(localStorage.getItem(OWNER_KEY) || '').trim() || null; } catch (_) {}
    sessionFresh = previousUserId !== nextUserId;
    sessionUserId = nextUserId;
    if (sessionFresh) {
      try { localStorage.setItem(OWNER_KEY, nextUserId); } catch (_) {}
    }
    return { changed: sessionFresh, previousUserId, userId: nextUserId };
  }

  async function load() {
    const supabase = await getClient();
    if (!supabase) return null;
    const user = await getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('student_state')
      .select('state,schema_version,updated_at')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) throw error;
    return data || null;
  }

  async function save(state, schemaVersion = 1) {
    const write = saveQueue.then(async () => {
      const supabase = await getClient();
      if (!supabase) return { synced: false, reason: 'not_configured' };
      const user = await getUser();
      if (!user) return { synced: false, reason: 'not_signed_in' };

      const incoming = state && typeof state === 'object' ? state : {};
      const existing = await load();
      const cloudState = existing?.state && typeof existing.state === 'object' ? existing.state : {};
      const mergedState = Object.assign({}, cloudState, incoming);

      const { error } = await supabase.from('student_state').upsert({
        user_id: user.id,
        state: mergedState,
        schema_version: Number(schemaVersion) || Number(existing?.schema_version) || 1
      }, { onConflict: 'user_id' });

      if (error) throw error;
      return { synced: true, userId: user.id };
    });

    saveQueue = write.catch(() => undefined);
    return write;
  }

  window.Class6CloudSync = Object.freeze({
    configured,
    getClient,
    getUser,
    prepareUser,
    load,
    save
  });
})();
