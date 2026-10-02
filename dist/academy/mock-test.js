/* ============================================================
   VIVID IELTS — Mock Test page logic
   reading.js / listening.js / db.js dagi haqiqiy ma'lumotlar bilan ulangan
   ============================================================ */

// ⚙️ SOZLAMA: bot.js ishlab turgan Render (yoki boshqa hosting) manzili.
// Masalan: 'https://vivid-ielts-bot.onrender.com'
const WRITING_API_BASE = 'https://YOUR-BOT-DOMAIN.onrender.com';
const WRITING_API_URL = WRITING_API_BASE + '/submit-writing';

// ---- Tab almashtirish ----
document.querySelectorAll('.mock-subtab').forEach((tabBtn) => {
  tabBtn.addEventListener('click', () => {
    document.querySelectorAll('.mock-subtab').forEach((b) => b.classList.remove('active'));
    document.querySelectorAll('.mock-panel').forEach((p) => p.classList.remove('active'));
    tabBtn.classList.add('active');
    document.getElementById('panel-' + tabBtn.dataset.tab).classList.add('active');
  });
});

/* ============================================================
   READING — reading.js dagi 23 ta passage'dan foydalanadi.
   ------------------------------------------------------------
   ESLATMA: hozirda saytda har bir passage alohida sahifa
   (reading-test-N.html, 13–14 savol, cheklanmagan vaqt).
   Haqiqiy IELTS Full Mock Reading (3 ta passage, 60 daqiqa,
   bitta umumiy taymer bilan) uchun alohida "combined test runner"
   sahifasi kerak bo'ladi — buni xohlasangiz alohida qurib beraman.
   Hozircha bu yerda passage'lar 3 tadan guruhlab, "Full Mock
   Reading Test N" nomi bilan ko'rsatiladi; bosilganda birinchi
   passage sahifasiga o'tadi (foydalanuvchi 3 tasini ketma-ket
   o'zi ochib chiqadi).
   ============================================================ */

const READING_PASSAGES = [
  { id: 'passage-1', title: 'The link between low light and mood', part: 'Passage 1', questions: 13, href: 'reading-test-1.html' },
  { id: 'passage-2', title: 'Bird Migration', part: 'Passage 2', questions: 13, href: 'reading-test-2.html' },
  { id: 'passage-3', title: 'Listening to the Ocean', part: 'Passage 1', questions: 13, href: 'reading-test-3.html' },
  { id: 'passage-4', title: 'The Blockbuster Phenomenon', part: 'Passage 1', questions: 13, href: 'reading-test-4.html' },
  { id: 'passage-5', title: 'The lost animals of Australia', part: 'Passage 3', questions: 14, href: 'reading-test-5.html' },
  { id: 'passage-6', title: 'The Blockbuster Phenomenon: a new museum trend', part: 'Passage 1', questions: 13, href: 'reading-test-6.html' },
  { id: 'passage-8', title: 'Traditional Maori Medicine', part: 'Passage 1', questions: 13, href: 'reading-test-8.html' },
  { id: 'passage-9', title: 'Improving Patient Safety', part: 'Passage 3', questions: 14, href: 'reading-test-9.html' },
  { id: 'passage-13', title: 'Antarctic Research', part: 'Passage 2', questions: 13, href: 'reading-test-13.html' },
  { id: 'passage-14', title: 'Violins and Very Cold Weather – A Hypothesis', part: 'Passage 2', questions: 13, href: 'reading-test-14.html' },
  { id: 'passage-15', title: 'Game Theory', part: 'Passage 3', questions: 14, href: 'reading-test-15.html' },
  { id: 'passage-16', title: 'The Terracotta Army', part: 'Passage 1', questions: 16, href: 'reading-test-16.html' },
  { id: 'passage-17', title: 'What Should Companies Do to Survive?', part: 'Passage 3', questions: 14, href: 'reading-test-17.html' },
  { id: 'passage-18', title: 'The Return of Monkey Life', part: 'Passage 2', questions: 13, href: 'reading-test-18.html' },
  { id: 'passage-19', title: 'European Heatwave of Summer 2003', part: 'Passage 2', questions: 13, href: 'reading-test-19.html' },
  { id: 'passage-20', title: 'Research into the Effects of Different Teaching Styles', part: 'Passage 3', questions: 14, href: 'reading-test-20.html' },
];

function buildMockReadingGroups(passages, size = 3) {
  const groups = [];
  for (let i = 0; i < passages.length; i += size) {
    const chunk = passages.slice(i, i + size);
    if (chunk.length < size) break; // to'liq bo'lmagan guruhni tashlab yuboramiz
    groups.push({
      title: `Full Mock Reading Test ${groups.length + 1}`,
      part: `${chunk.length} Passages · ~${chunk.reduce((s, p) => s + p.questions, 0)} questions · 60 min`,
      free: false, // full mock tests are Premium-only
      href: chunk[0].href, // birinchi passage'dan boshlanadi
    });
  }
  return groups;
}

/* ============================================================
   LISTENING — listening.js dagi 19 ta to'liq test (Parts 1–4,
   40 savol) — bular allaqachon to'liq mock test, o'zgarishsiz
   ishlatiladi.
   ============================================================ */

const LISTENING_TESTS = [
  { title: 'Full Listening Test 1', meta: 'Car Servicing + Rosedale Library + Samuel Prout + Chocozine', href: 'listening-test-1.html' },
  { title: 'Full Listening Test 2', meta: 'Washing Machine Warranty + Driving Licences + Hotel Internship + Salt History', href: 'listening-test-2.html' },
  { title: 'Full Listening Test 4', meta: 'Party Reservation + The Power of Smell', href: 'listening-test-4.html' },
  { title: 'Full Listening Test 5', meta: 'Birthday Party Arrangements + Curling + Art & Science + Sustainability', href: 'listening-test-5.html' },
  { title: 'Full Listening Test 6', meta: 'Hennings Travel Agency + Spring Festival + Archaeology Course', href: 'listening-test-6.html' },
  { title: 'Full Listening Test 7', meta: 'Drama Club Membership + City Centre Field Trip + Manufacturing Process', href: 'listening-test-7.html' },
  { title: 'Full Listening Test 8', meta: 'Corton Insurance Claim + Campsite Map + Dolphin Presentation + The Lontar Palm', href: 'listening-test-8.html' },
  { title: 'Full Listening Test 9', meta: 'International Club Membership + Assignment Notes + Australian Species Extinction', href: 'listening-test-9.html' },
  { title: 'Full Listening Test 10', meta: 'Manor Farm Fruit Picking + Karrara Sports Centre + House Prices Survey + Drama in Classrooms', href: 'listening-test-10.html' },
  { title: 'Full Listening Test 11', meta: 'Adventure Camp + Canadian Maple Syrup', href: 'listening-test-11.html' },
  { title: 'Full Listening Test 12', meta: 'Theatre Booking + Tourism Research + Patent Attorney Career', href: 'listening-test-12.html' },
  { title: 'Full Listening Test 13', meta: 'Jackson Island Holiday + Grampic Arts Campus + Geography Lesson Plan + Biomass Fuel', href: 'listening-test-13.html' },
  { title: 'Full Listening Test 14', meta: 'Newspaper Photo Reprint + Hospitality Training Courses + History of the Telescope', href: 'listening-test-14.html' },
  { title: 'Full Listening Test 15', meta: 'Film Club + extrahands.com + Song-Writing Course + Office Design', href: 'listening-test-15.html' },
  { title: 'Full Listening Test 16', meta: 'Family Presents + Work Experience Programme + Theories of Intelligence', href: 'listening-test-16.html' },
  { title: 'Full Listening Test 17', meta: 'Clarence House Hotel Wedding + Group Project + Impact of Cars in Australia', href: 'listening-test-17.html' },
  { title: 'Full Listening Test 18', meta: 'Job Details + Eyewitness Reliability + Plastics Exhibition', href: 'listening-test-18.html' },
  { title: 'Full Listening Test 19', meta: 'Darwin Hostel & Kangaroo Lodge + Anglia Sculpture Park + Marketing Report + Fireworks History', href: 'listening-test-19.html' },
];

function renderReadingGrid() {
  const grid = document.getElementById('mockReadingGrid');
  if (!grid) return;
  const groups = buildMockReadingGroups(READING_PASSAGES, 3);
  grid.innerHTML = groups.map((g) => `
    <a class="ielts-card" href="${g.href}" ${g.free ? '' : 'data-premium-only'}>
      <div class="ielts-card-top">
        <span class="ielts-card-day">${g.title}</span>
        <span class="ielts-badge ${g.free ? 'free' : 'premium'}">${g.free ? 'Free' : 'Premium'}</span>
      </div>
      <span class="ielts-card-part">${g.part}</span>
    </a>
  `).join('');
}

function renderListeningGrid() {
  const grid = document.getElementById('mockListeningGrid');
  if (!grid) return;
  grid.innerHTML = LISTENING_TESTS.map((t) => `
    <a class="ielts-card" href="${t.href}" data-premium-only>
      <div class="ielts-card-top">
        <span class="ielts-card-day">${t.title}</span>
        <span class="ielts-badge premium">Premium</span>
      </div>
      <span class="ielts-card-part">${t.meta}</span>
    </a>
  `).join('');
}

renderReadingGrid();
renderListeningGrid();
if (typeof applyPremiumLocks === 'function') applyPremiumLocks();

/* ============================================================
   WRITING — Timer, so'z sanash, yuborish (bepul, saytdan)
   ============================================================ */

const WRITING_DURATION_SEC = 40 * 60;
let writingSecondsLeft = WRITING_DURATION_SEC;
let writingTimerInterval = null;

const writingTextarea = document.getElementById('writingTextarea');
const writingTimerEl = document.getElementById('writingTimer');
const writingWordCountEl = document.getElementById('writingWordCount');
const writingSubmitBtn = document.getElementById('writingSubmitBtn');

function formatTime(sec) {
  const m = Math.floor(sec / 60).toString().padStart(2, '0');
  const s = Math.floor(sec % 60).toString().padStart(2, '0');
  return `⏱ ${m}:${s}`;
}

function startWritingTimer() {
  if (writingTimerInterval) return;
  writingTimerInterval = setInterval(() => {
    writingSecondsLeft--;
    if (writingSecondsLeft <= 0) {
      writingSecondsLeft = 0;
      clearInterval(writingTimerInterval);
      submitWriting(); // vaqt tugaganda avtomatik yuborish
    }
    writingTimerEl.textContent = formatTime(writingSecondsLeft);
  }, 1000);
}

if (writingTextarea) {
  writingTextarea.addEventListener('focus', startWritingTimer, { once: true });
  writingTextarea.addEventListener('input', () => {
    const words = writingTextarea.value.trim().split(/\s+/).filter(Boolean).length;
    writingWordCountEl.textContent = `${words} so'z`;
  });
}

// db.js dagi VividDB orqali joriy foydalanuvchi email/ismini olamiz
// (agar mehmon bo'lsa yoki Supabase sozlanmagan bo'lsa — bo'sh qaytadi,
// baribir yuborish ishlaydi, faqat admin xabarida "kiritilmagan" ko'rinadi)
async function getCurrentUser() {
  try {
    if (typeof VividDB === 'undefined') return { email: '', name: '' };
    const user = await VividDB.getUser();
    const profile = await VividDB.getProfile();
    return {
      email: user?.email || '',
      name: profile?.full_name || '',
    };
  } catch (e) {
    return { email: '', name: '' };
  }
}

async function submitWriting() {
  const essayText = (writingTextarea.value || '').trim();
  if (essayText.length < 20) {
    alert('Iltimos, inshoyingizni to\'liq yozing.');
    return;
  }

  writingSubmitBtn.disabled = true;
  writingSubmitBtn.textContent = 'Yuborilmoqda...';
  clearInterval(writingTimerInterval);

  const user = await getCurrentUser();

  try {
    const res = await fetch(WRITING_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: user.email,
        studentName: user.name,
        taskType: 'Task 2',
        essayText,
      }),
    });
    const data = await res.json();

    if (!data.ok) {
      alert('Xatolik: ' + (data.message || 'Yuborib bo\'lmadi. Birozdan keyin qayta urinib ko\'ring.'));
      writingSubmitBtn.disabled = false;
      writingSubmitBtn.textContent = 'Yuborish';
      return;
    }

    document.getElementById('writingResultCode').textContent = data.code;
    document.getElementById('writingResultCode2').textContent = data.code;
    document.getElementById('writingFormView').style.display = 'none';
    document.getElementById('writingResultView').style.display = 'block';

    if (typeof VividDB !== 'undefined' && VividDB.showSavedToast) {
      VividDB.showSavedToast('Insho yuborildi ✅');
    }
  } catch (e) {
    console.error(e);
    alert('Server bilan bog\'lanib bo\'lmadi. Internetingizni tekshirib, qayta urinib ko\'ring.');
    writingSubmitBtn.disabled = false;
    writingSubmitBtn.textContent = 'Yuborish';
  }
}

if (writingSubmitBtn) {
  writingSubmitBtn.addEventListener('click', submitWriting);
}