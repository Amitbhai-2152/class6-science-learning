(() => {
  const cfg = window.CLASS6_AUTH_CONFIG || {};
  const OWNER_KEY = 'class6CloudOwnerV2';
  const LOCAL_PROGRESS_KEYS = [
    'class6XPSystemV1',
    'class6ScienceProgressV9',
    'mathsExamHistory',
    'class6EnglishProgressV1',
    'class6HindiProgressV2',
    'class6GKProgressV1',
    'socialScienceProgressV3',
    'class6RevisionProgressV1'
  ];
  const SAVE_RETRIES = 8;
  let clientPromise = null;
  let saveQueue = Promise.resolve();
  let sessionUserId = null;

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

  function clearLocalProgress() {
    LOCAL_PROGRESS_KEYS.forEach((key) => {
      try { localStorage.removeItem(key); } catch (_) {}
    });
  }

  function prepareUser(userId) {
    const nextUserId = String(userId || '').trim();
    if (!nextUserId) return { changed: false, previousUserId: null, userId: null };

    if (sessionUserId === nextUserId) {
      return { changed: false, previousUserId: nextUserId, userId: nextUserId };
    }

    let previousUserId = null;
    try { previousUserId = String(localStorage.getItem(OWNER_KEY) || '').trim() || null; } catch (_) {}
    const changed = previousUserId !== nextUserId;
    sessionUserId = nextUserId;

    if (changed) {
      clearLocalProgress();
      try { localStorage.setItem(OWNER_KEY, nextUserId); } catch (_) {}
    }

    return { changed, previousUserId, userId: nextUserId };
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

  function mergeTopLevel(cloudState, incoming) {
    return Object.assign(
      {},
      cloudState && typeof cloudState === 'object' ? cloudState : {},
      incoming && typeof incoming === 'object' ? incoming : {}
    );
  }

  async function save(state, schemaVersion = 1) {
    const write = saveQueue.then(async () => {
      const supabase = await getClient();
      if (!supabase) return { synced: false, reason: 'not_configured' };
      const user = await getUser();
      if (!user) return { synced: false, reason: 'not_signed_in' };

      const incoming = state && typeof state === 'object' ? state : {};
      const requestedVersion = Math.max(1, Number(schemaVersion) || 1);

      // schema_version is used as an explicit row revision counter. It is
      // more reliable than updated_at because it does not depend on a
      // database trigger being installed. Every successful update increments
      // the revision, so two browsers cannot both successfully update the
      // same revision. A loser detects the zero-row conditional update,
      // reloads the newest state, merges again, and retries.
      for (let attempt = 1; attempt <= SAVE_RETRIES; attempt += 1) {
        const existing = await load();
        const cloudState = existing?.state && typeof existing.state === 'object' ? existing.state : {};
        const mergedState = mergeTopLevel(cloudState, incoming);

        if (!existing) {
          const { data, error } = await supabase
            .from('student_state')
            .insert({
              user_id: user.id,
              state: mergedState,
              schema_version: requestedVersion
            })
            .select('user_id,schema_version')
            .maybeSingle();

          if (!error && data?.user_id === user.id) {
            return { synced: true, userId: user.id, created: true, revision: Number(data.schema_version) || requestedVersion };
          }

          if (String(error?.code || '') === '23505' && attempt < SAVE_RETRIES) {
            await new Promise((resolve) => window.setTimeout(resolve, Math.min(1200, 100 * attempt)));
            continue;
          }
          if (error) throw error;
          if (attempt < SAVE_RETRIES) continue;
          return { synced: false, reason: 'conflict' };
        }

        const expectedRevision = Math.max(1, Number(existing.schema_version) || requestedVersion);
        const nextRevision = expectedRevision + 1;

        const { data, error } = await supabase
          .from('student_state')
          .update({
            state: mergedState,
            schema_version: nextRevision
          })
          .eq('user_id', user.id)
          .eq('schema_version', expectedRevision)
          .select('user_id,schema_version')
          .maybeSingle();

        if (error) throw error;
        if (data?.user_id === user.id) {
          return {
            synced: true,
            userId: user.id,
            conflictRetried: attempt > 1,
            revision: Number(data.schema_version) || nextRevision
          };
        }

        if (attempt < SAVE_RETRIES) {
          await new Promise((resolve) => window.setTimeout(resolve, Math.min(1200, 100 * attempt)));
          continue;
        }
        return { synced: false, reason: 'conflict' };
      }

      return { synced: false, reason: 'conflict' };
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
