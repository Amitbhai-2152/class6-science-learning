(() => {
  const cfg = window.CLASS6_AUTH_CONFIG || {};
  const AVATARS = ['🧑‍🎓', '🦊', '🐼', '🐯', '🐸', '🦁', '🚀', '⭐'];
  let client = null;

  const $ = (selector) => document.querySelector(selector);
  const statusEl = () => $("#authStatus");

  function setStatus(message, kind = "info") {
    const el = statusEl();
    if (!el) return;
    el.textContent = message;
    el.dataset.kind = kind;
  }

  function configured() {
    return Boolean(String(cfg.url || "").trim() && String(cfg.anonKey || "").trim());
  }

  function localAvatar() {
    try {
      const value = String(localStorage.getItem('class6Avatar') || '').trim();
      return AVATARS.includes(value) ? value : AVATARS[0];
    } catch (_) {
      return AVATARS[0];
    }
  }

  function setLocalAvatar(value) {
    if (!AVATARS.includes(value)) return;
    try { localStorage.setItem('class6Avatar', value); } catch (_) {}
  }

  function renderAvatar(value) {
    const avatar = AVATARS.includes(value) ? value : localAvatar();
    const current = $("#profileAvatar");
    if (current) current.textContent = avatar;
    document.querySelectorAll('[data-avatar]').forEach((button) => {
      const selected = button.dataset.avatar === avatar;
      button.classList.toggle('selected', selected);
      button.setAttribute('aria-pressed', selected ? 'true' : 'false');
    });
  }

  function renderAvatarPicker() {
    const wrap = $("#avatarOptions");
    if (!wrap) return;
    wrap.innerHTML = AVATARS.map((avatar) => `<button type="button" class="avatar-option" data-avatar="${avatar}" aria-label="Avatar ${avatar}" aria-pressed="false">${avatar}</button>`).join('');
    wrap.addEventListener('click', async (event) => {
      const button = event.target.closest('[data-avatar]');
      if (!button) return;
      const avatar = button.dataset.avatar;
      setLocalAvatar(avatar);
      renderAvatar(avatar);
      try {
        const supabase = await loadClient();
        if (supabase) {
          const { data } = await supabase.auth.getSession();
          if (data?.session?.user) {
            const { error } = await supabase.auth.updateUser({ data: { avatar } });
            if (error) throw error;
            setStatus('Avatar save हो गया है।', 'success');
          } else {
            setStatus('Avatar local guest profile में save हो गया है। Login के बाद account से जुड़ जाएगा।', 'success');
          }
        } else {
          setStatus('Avatar local guest profile में save हो गया है।', 'success');
        }
      } catch (error) {
        setStatus(String(error?.message || 'Avatar save नहीं हो पाया।'), 'error');
      }
    });
    renderAvatar(localAvatar());
  }

  async function loadClient() {
    if (!configured()) return null;
    if (client) return client;
    const mod = await import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm");
    client = mod.createClient(String(cfg.url).trim(), String(cfg.anonKey).trim());
    return client;
  }

  function setBusy(form, busy) {
    form?.querySelectorAll("button").forEach((button) => {
      button.disabled = busy;
    });
  }

  async function refreshSession() {
    const supabase = await loadClient();
    const account = $("#accountState");
    const guest = $("#guestLink");
    const logout = $("#logoutBtn");
    const profileEmail = $("#profileEmail");
    if (!supabase) {
      if (account) account.textContent = "Guest mode — account sync अभी configured नहीं है।";
      if (guest) guest.hidden = false;
      if (logout) logout.hidden = true;
      if (profileEmail) profileEmail.textContent = 'Guest / not signed in';
      renderAvatar(localAvatar());
      return null;
    }
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    const session = data.session;
    if (session?.user) {
      const email = session.user.email || "Student account";
      const avatar = AVATARS.includes(session.user.user_metadata?.avatar) ? session.user.user_metadata.avatar : localAvatar();
      setLocalAvatar(avatar);
      renderAvatar(avatar);
      if (profileEmail) profileEmail.textContent = email;
      if (account) account.textContent = `Signed in as ${email}`;
      if (guest) guest.hidden = true;
      if (logout) logout.hidden = false;
    } else {
      if (account) account.textContent = "Not signed in — continue as guest or create an account.";
      if (profileEmail) profileEmail.textContent = 'Guest / not signed in';
      if (guest) guest.hidden = false;
      if (logout) logout.hidden = true;
      renderAvatar(localAvatar());
    }
    return session;
  }

  async function signUp(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const email = String($("#signupEmail")?.value || "").trim();
    const password = String($("#signupPassword")?.value || "");
    if (!email || password.length < 8) {
      setStatus("Email भरें और कम-से-कम 8 characters का password रखें।", "error");
      return;
    }
    try {
      const supabase = await loadClient();
      if (!supabase) {
        setStatus("Account system अभी configured नहीं है। Supabase project details जोड़ने के बाद signup चालू होगा।", "error");
        return;
      }
      setBusy(form, true);
      const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { avatar: localAvatar() } } });
      if (error) throw error;
      if (data.session) {
        setStatus("Account बन गया और आप signed in हैं।", "success");
      } else {
        setStatus("Account बन गया। Email confirmation required हो सकती है; अपने inbox को check करें।", "success");
      }
      await refreshSession();
    } catch (error) {
      setStatus(String(error?.message || "Signup failed."), "error");
    } finally {
      setBusy(form, false);
    }
  }

  async function signIn(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const email = String($("#loginEmail")?.value || "").trim();
    const password = String($("#loginPassword")?.value || "");
    if (!email || !password) {
      setStatus("Email और password दोनों भरें।", "error");
      return;
    }
    try {
      const supabase = await loadClient();
      if (!supabase) {
        setStatus("Account system अभी configured नहीं है। Supabase project details जोड़ने के बाद login चालू होगा।", "error");
        return;
      }
      setBusy(form, true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      setStatus("Login successful. आपका account पहचान लिया गया है।", "success");
      await refreshSession();
    } catch (error) {
      setStatus(String(error?.message || "Login failed."), "error");
    } finally {
      setBusy(form, false);
    }
  }

  async function logout() {
    try {
      const supabase = await loadClient();
      if (!supabase) return;
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setStatus("Logout successful.", "success");
      await refreshSession();
    } catch (error) {
      setStatus(String(error?.message || "Logout failed."), "error");
    }
  }

  window.Class6Auth = Object.freeze({ configured, getClient: loadClient, getSession: refreshSession, signOut: logout, avatars: AVATARS.slice() });

  document.addEventListener("DOMContentLoaded", async () => {
    renderAvatarPicker();
    $("#signupForm")?.addEventListener("submit", signUp);
    $("#loginForm")?.addEventListener("submit", signIn);
    $("#logoutBtn")?.addEventListener("click", logout);
    $("#guestLink")?.addEventListener("click", () => { window.location.href = "index.html"; });
    if (!configured()) setStatus("Login UI तैयार है। अगला setup step: Supabase project URL और anon key जोड़ना।", "info");
    try { await refreshSession(); } catch (error) { setStatus(String(error?.message || "Account status load नहीं हो पाया।"), "error"); }
  });
})();
