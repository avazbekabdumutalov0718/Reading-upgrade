/* Include AFTER db.js on every protected page (dashboard, vocabulary, grammar, reading). */
(async function authGuard() {
  const logoutLink = document.getElementById('logoutLink');
  if (logoutLink) {
    logoutLink.addEventListener('click', async (e) => {
      e.preventDefault();
      if (typeof VividDB !== 'undefined' && VividDB.isConfigured) await VividDB.signOut();
      window.location.href = '../index.html';
    });
  }

  const configured = typeof VividDB !== 'undefined' && VividDB.isConfigured;

  if (configured) {
    let session = await VividDB.getSession();
    if (!session) {
      // Session restore from localStorage can occasionally lag by a tick right
      // after page load — retry once before concluding the user is logged out,
      // so a real session isn't lost to a timing race.
      await new Promise((r) => setTimeout(r, 400));
      session = await VividDB.getSession();
    }
    if (!session) {
      window.location.href = '../index.html';
      return;
    }
  }

  await refreshUserDisplay();
  initEditableName();
})();

async function getFullProfile() {
  if (typeof VividDB !== 'undefined' && VividDB.isConfigured) {
    const profile = await VividDB.getProfile();
    return {
      full_name: profile?.full_name || 'IELTS Student',
      target_band: profile?.target_band ?? 7.0,
      current_band: profile?.current_band ?? 5.5,
    };
  }
  let name = 'IELTS Student';
  try { name = localStorage.getItem('vivid_guest_name') || name; } catch (e) {}
  return { full_name: name, target_band: 7.0, current_band: 5.5 };
}

async function getDisplayName() {
  const p = await getFullProfile();
  return p.full_name;
}

function initialsOf(name) {
  return name.split(' ').filter(Boolean).map((w) => w[0]).join('').slice(0, 2).toUpperCase() || 'IS';
}

function firstNameOf(name) {
  return (name || '').trim().split(/\s+/)[0] || 'there';
}

function timeOfDayGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

async function refreshUserDisplay() {
  try {
    const profile = await getFullProfile();
    const name = profile.full_name;

    // Sidebar / topbar identity
    document.querySelectorAll('.dash-user-name').forEach((el) => (el.textContent = name));
    document.querySelectorAll('.dash-avatar').forEach((el) => (el.textContent = initialsOf(name)));

    // Dashboard greeting header (was hardcoded to a single demo user before)
    const greetingNameEl = document.getElementById('greetingName');
    if (greetingNameEl) greetingNameEl.textContent = firstNameOf(name);
    const greetingTitleEl = document.getElementById('greetingTitle');
    if (greetingTitleEl && greetingNameEl) {
      greetingTitleEl.childNodes[0].textContent = `${timeOfDayGreeting()}, `;
    }

    // Band score pill — now reflects this user's own profile row
    const bandCurrentEl = document.getElementById('bandCurrent');
    if (bandCurrentEl) bandCurrentEl.textContent = Number(profile.current_band).toFixed(1);
    const bandTargetEl = document.getElementById('bandTarget');
    if (bandTargetEl) bandTargetEl.textContent = Number(profile.target_band).toFixed(1);
  } catch (e) {
    console.warn('Could not load profile', e);
  }
}

// Click on your name in the sidebar to rename yourself (works with or without Supabase).
function initEditableName() {
  document.querySelectorAll('.dash-user-name').forEach((el) => {
    el.title = 'Click to edit your name';
    el.style.cursor = 'pointer';
    el.addEventListener('click', async () => {
      const current = el.textContent;
      const next = prompt('Your name:', current);
      if (!next || !next.trim() || next.trim() === current) return;
      const name = next.trim();
      try { localStorage.setItem('vivid_guest_name', name); } catch (e) {}
      if (typeof VividDB !== 'undefined' && VividDB.isConfigured) {
        await VividDB.updateProfile({ full_name: name });
      }
      refreshUserDisplay();
    });
  });
}// Add to auth-guard.js — checks if the user has active premium access.
async function isPremium() {
  if (typeof VividDB === 'undefined' || !VividDB.isConfigured) return false;
  const profile = await VividDB.getProfile();
  if (!profile || profile.tariff !== 'premium') return false;

  // Agar muddat belgilangan bo'lsa, muddati o'tganini tekshiramiz
  if (profile.premium_expires_at) {
    const expires = new Date(profile.premium_expires_at);
    if (expires < new Date()) return false;
  }
  return true;
}

// Premium sahifa boshida chaqiring: agar false bo'lsa, foydalanuvchini qaytaradi.
async function requirePremium(redirectTo = '../index.html') {
  const ok = await isPremium();
  if (!ok) {
    window.location.href = redirectTo;
  }
  return ok;
}

// Dashboarddagi qulf (🔒) belgilarini avtomatik yashirish/ko'rsatish uchun
async function applyPremiumLocks() {
  const premium = await isPremium();
  document.querySelectorAll('[data-premium-only]').forEach((el) => {
    if (premium) {
      el.classList.remove('locked');
      el.style.opacity = '1';
      el.style.filter = 'none';
      // Don't set pointer-events: none for premium users
      const lockOverlay = el.querySelector('.premium-lock-overlay');
      if (lockOverlay) lockOverlay.remove();
    } else {
      el.classList.add('locked');
      el.style.opacity = '0.6';
      el.style.filter = 'grayscale(1)';
      // Keep pointer-events auto so we can capture the click
      el.style.pointerEvents = 'auto';
      
      // Create lock overlay if it doesn't exist
      if (!el.querySelector('.premium-lock-overlay')) {
        const overlay = document.createElement('div');
        overlay.className = 'premium-lock-overlay';
        overlay.innerHTML = `
          <div class="premium-lock-content">
            <div class="premium-lock-icon">🔒</div>
            <div class="premium-lock-text">Only for Premium users</div>
          </div>
        `;
        el.style.position = 'relative';
        el.appendChild(overlay);
      }
      
      // Add click handler to show modal and prevent default behavior
      el.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        showPremiumModal();
        return false;
      }, true);
    }
  });
}

// Show premium upgrade modal
function showPremiumModal(e) {
  if (e) e.stopPropagation();
  const modal = document.getElementById('premiumModal');
  if (modal) {
    modal.style.display = 'flex';
  } else {
    // Create modal if it doesn't exist
    const newModal = document.createElement('div');
    newModal.id = 'premiumModal';
    newModal.className = 'premium-modal';
    newModal.innerHTML = `
      <div class="premium-modal-content">
        <button class="premium-modal-close" onclick="document.getElementById('premiumModal').style.display = 'none';">&times;</button>
        <div class="premium-modal-icon">🔒</div>
        <h2>Premium Feature</h2>
        <p>Bu bo'lim faqat Premium tarif uchun mavjud.</p>
        <p>Premiumga o'tish uchun Telegram orqali murojaat qiling:</p>
        <a href="https://t.me/vividieltsadmin" class="btn btn-primary" target="_blank" rel="noopener noreferrer">
          📱 Telegram bilan bog'lanish
        </a>
        <button class="btn btn-outline" onclick="document.getElementById('premiumModal').style.display = 'none';">Yopish</button>
      </div>
      <div class="premium-modal-backdrop" onclick="document.getElementById('premiumModal').style.display = 'none';"></div>
    `;
    document.body.appendChild(newModal);
    newModal.style.display = 'flex';
  }
}