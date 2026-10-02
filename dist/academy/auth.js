// ===== tab switching between Log in / Sign up =====
const tabs = document.querySelectorAll('.auth-tab');
const forms = document.querySelectorAll('.auth-form');
const authStatus = document.getElementById('authStatus');

function showTab(name) {
  tabs.forEach((t) => {
    const active = t.dataset.tab === name;
    t.classList.toggle('active', active);
    t.setAttribute('aria-selected', String(active));
  });
  forms.forEach((f) => {
    f.hidden = f.dataset.form !== name;
  });
  if (authStatus) authStatus.textContent = '';
}

tabs.forEach((tab) => {
  tab.addEventListener('click', () => showTab(tab.dataset.tab));
});

document.querySelectorAll('[data-switch]').forEach((link) => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    showTab(link.dataset.switch);
  });
});

// ===== show/hide password =====
document.querySelectorAll('.pass-toggle').forEach((btn) => {
  btn.addEventListener('click', () => {
    const form = document.getElementById(btn.dataset.toggleFor);
    const input = form.querySelector('input[type="password"], input[type="text"][name="password"]');
    if (!input) return;
    const isHidden = input.type === 'password';
    input.type = isHidden ? 'text' : 'password';
    btn.textContent = isHidden ? 'Hide' : 'Show';
  });
});

// ===== real auth via Supabase (falls back to a friendly notice if not configured) =====
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');

function setStatus(message, isError) {
  if (!authStatus) return;
  authStatus.textContent = message;
  authStatus.classList.toggle('success', !isError);
  authStatus.classList.toggle('error', !!isError);
}

if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!loginForm.checkValidity()) { loginForm.reportValidity(); return; }
    const email = loginForm.email.value.trim();
    const password = loginForm.password.value;

    if (typeof VividDB === 'undefined' || !VividDB.isConfigured) {
      setStatus('Supabase is not connected yet — see supabase-config.js. Continuing as guest…', true);
      setTimeout(() => { window.location.href = 'dashboard.html'; }, 1200);
      return;
    }

    setStatus('Logging you in...', false);
    const { error } = await VividDB.signIn(email, password);
    if (error) { setStatus(error.message, true); return; }
    setStatus('Welcome back!', false);
    window.location.href = 'dashboard.html';
  });
}

// ===== Google sign-in (Supabase OAuth) =====
document.querySelectorAll('[data-oauth="google"]').forEach((btn) => {
  btn.addEventListener('click', async () => {
    if (typeof VividDB === 'undefined' || !VividDB.isConfigured) {
      setStatus('Supabase is not connected yet — see supabase-config.js.', true);
      return;
    }
    setStatus('Opening Google sign-in...', false);
    const { error } = await VividDB.signInWithGoogle();
    if (error) setStatus(error.message, true);
    // On success Supabase redirects the browser to Google, then back to dashboard.html.
  });
});

if (signupForm) {
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!signupForm.checkValidity()) { signupForm.reportValidity(); return; }
    const name = signupForm.name.value.trim();
    const email = signupForm.email.value.trim();
    const password = signupForm.password.value;
    const targetBand = signupForm.targetBand.value;

    if (typeof VividDB === 'undefined' || !VividDB.isConfigured) {
      setStatus('Supabase is not connected yet — see supabase-config.js. Continuing as guest…', true);
      try { localStorage.setItem('vivid_guest_name', name); } catch (e2) {}
      setTimeout(() => { window.location.href = 'dashboard.html'; }, 1200);
      return;
    }

    setStatus('Creating your account...', false);
    const { error } = await VividDB.signUp(email, password, name);
    if (error) { setStatus(error.message, true); return; }
    await VividDB.updateProfile({ target_band: Number(targetBand) });
    setStatus('Account created! Check your email if confirmation is required, then log in.', false);
    setTimeout(() => showTab('login'), 1800);
  });
}