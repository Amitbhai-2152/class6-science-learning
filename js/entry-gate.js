(() => {
  'use strict';

  const SUPABASE_CDN = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
  const AUTH_PATH = 'auth.html';

  async function getSession() {
    try {
      const cfg = window.CLASS6_AUTH_CONFIG || {};
      if (!String(cfg.url || '').trim() || !String(cfg.anonKey || '').trim()) return null;
      const { createClient } = await import(SUPABASE_CDN);
      const supabase = createClient(String(cfg.url).trim(), String(cfg.anonKey).trim(), {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
      });
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      return data?.session || null;
    } catch (error) {
      console.error('Class 6 entry gate failed:', error);
      return null;
    }
  }

  async function enforce() {
    const session = await getSession();
    if (!session) {
      const target = `${AUTH_PATH}?next=index.html`;
      if (location.pathname.endsWith('/index.html') || location.pathname.endsWith('/')) {
        location.replace(target);
      }
    }
  }

  enforce();
})();
