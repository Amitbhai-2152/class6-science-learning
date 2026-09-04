(() => {
  const cfg = window.CLASS6_AUTH_CONFIG || {};
  let clientPromise = null;

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
    const supabase = await getClient();
    if (!supabase) return { synced: false, reason: 'not_configured' };
    const user = await getUser();
    if (!user) return { synced: false, reason: 'not_signed_in' };

    const { error } = await supabase.from('student_state').upsert({
      user_id: user.id,
      state: state && typeof state === 'object' ? state : {},
      schema_version: Number(schemaVersion) || 1
    }, { onConflict: 'user_id' });

    if (error) throw error;
    return { synced: true, userId: user.id };
  }

  window.Class6CloudSync = Object.freeze({
    configured,
    getClient,
    getUser,
    load,
    save
  });
})();
