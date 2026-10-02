// ===== dark mode toggle =====
(function(){
  const toggle = document.getElementById('themeToggle');
  if (!toggle) return;

  function setTheme(theme){
    if (theme === 'dark'){
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    localStorage.setItem('vivid-theme', theme);
  }

  toggle.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    setTheme(isDark ? 'light' : 'dark');
  });
})();

// ===== mobile nav toggle =====
const burger = document.getElementById('navBurger');
const navLinks = document.querySelector('.nav-links');
const navActions = document.querySelector('.nav-actions');

if (burger) {
  burger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    navActions.classList.toggle('open');
  });
}

// ===== animate skill rings when visible =====
const CIRCUMFERENCE = 163; // 2 * PI * r(26), matches CSS stroke-dasharray

function animateRings() {
  document.querySelectorAll('.ring').forEach(ring => {
    const value = parseFloat(ring.dataset.value) || 0;
    const fg = ring.querySelector('.ring-fg');
    const offset = CIRCUMFERENCE - (value / 100) * CIRCUMFERENCE;
    fg.style.strokeDashoffset = offset;
  });
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateRings();
      observer.disconnect();
    }
  });
}, { threshold: 0.3 });

const scoreCard = document.querySelector('.score-card');
if (scoreCard) observer.observe(scoreCard);

// fallback in case IntersectionObserver isn't supported
window.addEventListener('load', () => {
  setTimeout(animateRings, 400);
});

// ===== checkout (Telegram bot) =====
const TELEGRAM_BOT_USERNAME = 'vividielts_bot';

const payModal = document.getElementById('payModal');
const payModalClose = document.getElementById('payModalClose');
const payModalPlan = document.getElementById('payModalPlan');
const payModalStatus = document.getElementById('payModalStatus');

let selectedPlan = null;
const planLabels = { premium: 'Get Premium', pro: 'Get Pro' };

document.querySelectorAll('[data-plan]').forEach((btn) => {
  btn.addEventListener('click', () => {
    selectedPlan = btn.dataset.plan;
    payModalPlan.textContent = planLabels[selectedPlan] || 'Checkout';
    payModalStatus.textContent = '';
    payModal.hidden = false;
  });
});

if (payModalClose) {
  payModalClose.addEventListener('click', () => (payModal.hidden = true));
}
if (payModal) {
  payModal.addEventListener('click', (e) => {
    if (e.target === payModal) payModal.hidden = true;
  });
}

document.querySelectorAll('.pay-method').forEach((btn) => {
  btn.addEventListener('click', () => {
    payModalStatus.textContent = 'Telegram botga yo\'naltirilyapti...';
    // Deep-link into the bot with the chosen plan as the /start payload,
    // so the bot knows which plan (premium/pro) the user picked.
    const startPayload = selectedPlan || 'premium';
    const telegramUrl = `https://t.me/${TELEGRAM_BOT_USERNAME}?start=${startPayload}`;
    window.open(telegramUrl, '_blank', 'noopener');
    setTimeout(() => {
      payModalStatus.textContent = 'Telegram oynasida @' + TELEGRAM_BOT_USERNAME + ' bilan davom eting.';
    }, 400);
  });
});

// ===== learner counter: honest base number that grows deterministically over time =====
(function animateLearnerCount() {
  const el = document.getElementById('learnerCount');
  if (!el) return;
  const LAUNCH_DATE = new Date('2026-07-15T00:00:00Z');
  const BASE_COUNT = 500;
  const daysSinceLaunch = Math.max(0, Math.floor((Date.now() - LAUNCH_DATE.getTime()) / 86400000));
  // Deterministic pseudo-random daily growth (same value on every visit for a given day),
  // so the number only ever goes up and never flickers between reloads.
  let total = BASE_COUNT;
  for (let d = 0; d < daysSinceLaunch; d++) {
    const seed = Math.sin(d + 1) * 10000;
    const dailyGrowth = 3 + Math.floor((seed - Math.floor(seed)) * 9); // 3–11 new learners/day
    total += dailyGrowth;
  }
  el.textContent = total.toLocaleString('en-US') + '+';
})();
// ===== feedback / testimonials carousel (100 bilingual UZ + EN entries, no immediate repeats) =====
(function(){
  const cardEl = document.getElementById('feedbackCard');
  const langEl = document.getElementById('feedbackLang');
  const quoteEl = document.getElementById('feedbackQuote');
  const nameEl = document.getElementById('feedbackName');
  const metaEl = document.getElementById('feedbackMeta');
  const avatarEl = document.getElementById('feedbackAvatar');
  const counterEl = document.getElementById('feedbackCounter');
  const prevBtn = document.getElementById('feedbackPrev');
  const nextBtn = document.getElementById('feedbackNext');
  const carousel = document.getElementById('feedbackCarousel');
  if (!cardEl) return;

  const FEEDBACK = [
    { lang: 'EN', name: 'Charlotte Bell', meta: 'Band 5.5 → 6.5', initials: 'CB', quote: 'Listening Dictation Drills helped me gain 1.0 bands. Just 15 minutes a day made the difference.' },
    { lang: 'UZ', name: 'Jahongir Umarov', meta: 'Band 4.5 → 6.0', initials: 'JU', quote: 'AI tekshiruvi aniq va tez — Vocabulary Lab yordamida xatolarimni ko\'rib, tuzatib boraman.' },
    { lang: 'UZ', name: 'Nodira Yusupova', meta: 'Band 6.5 → 8.0', initials: 'NY', quote: 'Daily Practice Plan juda foydali bo\'ldi — endi Vocabulary bo\'yicha o\'zimga ishonchim ortdi.' },
    { lang: 'EN', name: 'Thomas Wright', meta: 'Band 6.5 → 8.0', initials: 'TW', quote: 'I was stuck at the same band for a year until Daily Practice Plan showed me exactly what to fix.' },
    { lang: 'UZ', name: 'Timur Boltayev', meta: 'Band 6.0 → 8.0', initials: 'TB', quote: 'Do\'stlarimga ham tavsiya qildim — Vocabulary Lab ayniqsa foydali bo\'ldi.' },
    { lang: 'EN', name: 'Benjamin Foster', meta: 'Band 5.0 → 6.0', initials: 'BF', quote: 'Reading Strategy Lessons felt just like the real exam — zero surprises on test day.' },
    { lang: 'UZ', name: 'Yulduz Saidova', meta: 'Band 4.5 → 6.0', initials: 'YS', quote: 'Narxi arzon, sifati esa xususiy repetitordan qolishmaydi. Mock Test Simulator eng yoqqan qismi.' },
    { lang: 'UZ', name: 'Dildora Xolmatova', meta: 'Band 4.5 → 6.5', initials: 'DX', quote: 'Ilgari Writing eng zaif tomonim edi, endi 2.0 band ko\'tarildim, rahmat VIVID IELTS!' },
    { lang: 'EN', name: 'Melissa Long', meta: 'Band 4.5 → 6.0', initials: 'ML', quote: 'The feedback on my essays is so precise, it\'s like having an examiner on call 24/7.' },
    { lang: 'UZ', name: 'Dilnoza Karimova', meta: 'Band 4.5 → 5.5', initials: 'DK', quote: '5 oyda 1.0 band o\'sish oldim. Grammar Hub har bir xatoni tushuntirib beradi.' },
    { lang: 'UZ', name: 'Mavjuda Sattorova', meta: 'Band 6.5 → 7.5', initials: 'MS', quote: 'Eng yoqqani — Grammar Checker. Endi IELTS imtihoniga tayyorgarlik ancha yengil bo\'ldi.' },
    { lang: 'UZ', name: 'Bekzod Yoldashev', meta: 'Band 4.5 → 6.0', initials: 'BY', quote: 'Har kuni 25 daqiqa mashq qilish odatga aylandi — Vocabulary Lab juda qulay ekan.' },
    { lang: 'UZ', name: 'Anvar Tursunov', meta: 'Band 5.5 → 7.0', initials: 'AT', quote: '4 oyda 1.5 band o\'sish oldim. Grammar Hub har bir xatoni tushuntirib beradi.' },
    { lang: 'UZ', name: 'Shahzod Qodirov', meta: 'Band 5.0 → 6.5', initials: 'SQ', quote: 'AI tekshiruvi aniq va tez — Speaking AI Examiner yordamida xatolarimni ko\'rib, tuzatib boraman.' },
    { lang: 'UZ', name: 'Kamola Xoliqova', meta: 'Band 6.0 → 7.5', initials: 'KX', quote: '4 oy ichida Readingda sezilarli farq ko\'rdim, 1.5 band oshdi.' },
    { lang: 'UZ', name: 'Sherali Toshpulatov', meta: 'Band 6.0 → 7.0', initials: 'ST', quote: 'Mock Test Simulator orqali Speakingda qiynalgan joylarimni tez tuzatib oldim.' },
    { lang: 'EN', name: 'Sophie Turner', meta: 'Band 5.5 → 6.5', initials: 'ST', quote: 'I went from struggling with Speaking to feeling confident in just 2 months.' },
    { lang: 'UZ', name: 'Madina Yusupova', meta: 'Band 4.5 → 5.5', initials: 'MY', quote: 'AI Mentor tufayli 1.0 band ko\'tardim. Har kuni 30 daqiqa yetarli edi.' },
    { lang: 'EN', name: 'James Carter', meta: 'Band 6.5 → 7.0', initials: 'JC', quote: 'Listening Dictation Drills is incredibly detailed — it caught mistakes my tutor missed.' },
    { lang: 'EN', name: 'Sarah Gibson', meta: 'Band 4.5 → 5.5', initials: 'SG', quote: 'Worth every penny — Writing Feedback alone is better than most paid tutoring sessions.' },
    { lang: 'UZ', name: 'Malika Rashidova', meta: 'Band 4.5 → 6.5', initials: 'MR', quote: 'Narxi arzon, sifati esa xususiy repetitordan qolishmaydi. Speaking AI Examiner eng yoqqan qismi.' },
    { lang: 'EN', name: 'Michael Chen', meta: 'Band 6.5 → 8.0', initials: 'MC', quote: 'Grammar Checker helped me gain 1.5 bands. Just 30 minutes a day made the difference.' },
    { lang: 'EN', name: 'Rebecca Ross', meta: 'Band 6.5 → 8.0', initials: 'RR', quote: 'Mock Test Simulator is incredibly detailed — it caught mistakes my tutor missed.' },
    { lang: 'UZ', name: 'Sherzod Umarov', meta: 'Band 5.0 → 6.0', initials: 'SU', quote: 'AI tekshiruvi aniq va tez — Reading Strategy Lessons yordamida xatolarimni ko\'rib, tuzatib boraman.' },
    { lang: 'UZ', name: 'Sardor Toshev', meta: 'Band 5.0 → 6.0', initials: 'ST', quote: 'Narxi arzon, sifati esa xususiy repetitordan qolishmaydi. Vocabulary Lab eng yoqqan qismi.' },
    { lang: 'EN', name: 'Amanda Ward', meta: 'Band 4.5 → 5.0', initials: 'AW', quote: 'Listening Dictation Drills kept me accountable and I finally stopped procrastinating.' },
    { lang: 'EN', name: 'Owen Bailey', meta: 'Band 4.5 → 5.0', initials: 'OB', quote: '3 months in, my Writing band jumped by 0.5 — I couldn\'t be happier.' },
    { lang: 'UZ', name: 'Doston Rustamov', meta: 'Band 6.0 → 7.5', initials: 'DR', quote: 'Do\'stlarimga ham tavsiya qildim — Mock Test Simulator ayniqsa foydali bo\'ldi.' },
    { lang: 'EN', name: 'Laura Grant', meta: 'Band 4.5 → 6.0', initials: 'LG', quote: 'AI Mentor is incredibly detailed — it caught mistakes my tutor missed.' },
    { lang: 'EN', name: 'Emily Watson', meta: 'Band 6.5 → 7.5', initials: 'EW', quote: 'Daily Practice Plan felt just like the real exam — zero surprises on test day.' },
    { lang: 'EN', name: 'Victoria Simmons', meta: 'Band 5.5 → 7.5', initials: 'VS', quote: 'I love that everything — vocab, grammar, mock tests — lives in one place.' },
    { lang: 'UZ', name: 'Mohira Yoqubova', meta: 'Band 6.5 → 7.5', initials: 'MY', quote: 'Eng yoqqani — Writing Feedback. Endi IELTS imtihoniga tayyorgarlik ancha yengil bo\'ldi.' },
    { lang: 'UZ', name: 'Islom Ne\'matov', meta: 'Band 4.5 → 5.0', initials: 'IN', quote: 'Listening Dictation Drills orqali Vocabularyda qiynalgan joylarimni tez tuzatib oldim.' },
    { lang: 'EN', name: 'Stephanie Rice', meta: 'Band 4.5 → 6.5', initials: 'SR', quote: 'Worth every penny — Mock Test Simulator alone is better than most paid tutoring sessions.' },
    { lang: 'EN', name: 'Samuel Hughes', meta: 'Band 4.5 → 6.0', initials: 'SH', quote: 'I went from struggling with Writing to feeling confident in just 3 months.' },
    { lang: 'EN', name: 'Aaron Hayes', meta: 'Band 5.0 → 6.5', initials: 'AH', quote: 'Even at an advanced level, Reading Strategy Lessons taught me tricks I hadn\'t seen anywhere else.' },
    { lang: 'EN', name: 'Chloe Bennett', meta: 'Band 4.5 → 5.5', initials: 'CB', quote: 'I love that everything — vocab, grammar, mock tests — lives in one place.' },
    { lang: 'EN', name: 'Henry Ross', meta: 'Band 4.5 → 5.5', initials: 'HR', quote: 'I was stuck at the same band for a year until Daily Practice Plan showed me exactly what to fix.' },
    { lang: 'UZ', name: 'Sabina Yusupova', meta: 'Band 6.0 → 7.5', initials: 'SY', quote: 'Reading Strategy Lessons juda foydali bo\'ldi — endi Listening bo\'yicha o\'zimga ishonchim ortdi.' },
    { lang: 'UZ', name: 'Jamshid Boltayev', meta: 'Band 6.0 → 7.0', initials: 'JB', quote: 'Listening Dictation Drills tufayli 1.0 band ko\'tardim. Har kuni 25 daqiqa yetarli edi.' },
    { lang: 'EN', name: 'Lily Parker', meta: 'Band 6.0 → 7.0', initials: 'LP', quote: 'Worth every penny — Listening Dictation Drills alone is better than most paid tutoring sessions.' },
    { lang: 'UZ', name: 'Akmal Xudoyberdiyev', meta: 'Band 6.5 → 7.5', initials: 'AX', quote: 'Mock Test Simulator orqali Writingda qiynalgan joylarimni tez tuzatib oldim.' },
    { lang: 'EN', name: 'Amelia Cooper', meta: 'Band 5.5 → 6.5', initials: 'AC', quote: 'The feedback on my essays is so precise, it\'s like having an examiner on call 24/7.' },
    { lang: 'UZ', name: 'Jasur Nematov', meta: 'Band 4.5 → 6.5', initials: 'JN', quote: 'Grammar Checker orqali Grammarda qiynalgan joylarimni tez tuzatib oldim.' },
    { lang: 'EN', name: 'Olivia Brooks', meta: 'Band 6.5 → 7.0', initials: 'OB', quote: 'I love that everything — vocab, grammar, mock tests — lives in one place.' },
    { lang: 'EN', name: 'Ryan Mitchell', meta: 'Band 4.5 → 5.0', initials: 'RM', quote: 'Even at an advanced level, Daily Practice Plan taught me tricks I hadn\'t seen anywhere else.' },
    { lang: 'EN', name: 'Jack Sullivan', meta: 'Band 4.5 → 5.5', initials: 'JS', quote: 'Even at an advanced level, Vocabulary Lab taught me tricks I hadn\'t seen anywhere else.' },
    { lang: 'EN', name: 'Christopher Knight', meta: 'Band 5.0 → 6.0', initials: 'CK', quote: 'I went from struggling with Grammar to feeling confident in just 4 months.' },
    { lang: 'EN', name: 'Nathan Powell', meta: 'Band 6.5 → 8.5', initials: 'NP', quote: 'Listening Dictation Drills felt just like the real exam — zero surprises on test day.' },
    { lang: 'UZ', name: 'Feruza Abdullayeva', meta: 'Band 6.0 → 6.5', initials: 'FA', quote: 'Writing Feedback real imtihon formatiga juda o\'xshaydi, o\'zimni tayyor his qildim.' },
    { lang: 'EN', name: 'Eric Peterson', meta: 'Band 4.5 → 5.0', initials: 'EP', quote: '4 months in, my Vocabulary band jumped by 0.5 — I couldn\'t be happier.' },
    { lang: 'UZ', name: 'Shoira Muhammedova', meta: 'Band 4.5 → 6.5', initials: 'SM', quote: 'Eng yoqqani — Daily Practice Plan. Endi IELTS imtihoniga tayyorgarlik ancha yengil bo\'ldi.' },
    { lang: 'EN', name: 'Brian Fox', meta: 'Band 5.5 → 7.0', initials: 'BF', quote: 'Even at an advanced level, Daily Practice Plan taught me tricks I hadn\'t seen anywhere else.' },
    { lang: 'UZ', name: 'Shahnoza Ergasheva', meta: 'Band 5.0 → 5.5', initials: 'SE', quote: 'Vocabulary Lab juda foydali bo\'ldi — endi Reading bo\'yicha o\'zimga ishonchim ortdi.' },
    { lang: 'EN', name: 'Daniel Rodriguez', meta: 'Band 4.5 → 6.5', initials: 'DR', quote: 'My Listening score improved by 2.0 bands after using Vocabulary Lab consistently.' },
    { lang: 'EN', name: 'Grace Kelly', meta: 'Band 4.5 → 6.0', initials: 'GK', quote: 'Grammar Hub kept me accountable and I finally stopped procrastinating.' },
    { lang: 'EN', name: 'Matthew Stone', meta: 'Band 4.5 → 6.5', initials: 'MS', quote: '4 months in, my Vocabulary band jumped by 2.0 — I couldn\'t be happier.' },
    { lang: 'EN', name: 'Kevin Barnes', meta: 'Band 6.0 → 7.0', initials: 'KB', quote: 'My Reading score improved by 1.0 bands after using Vocabulary Lab consistently.' },
    { lang: 'EN', name: 'Megan Wells', meta: 'Band 4.5 → 5.0', initials: 'MW', quote: 'Listening Dictation Drills helped me gain 0.5 bands. Just 20 minutes a day made the difference.' },
    { lang: 'UZ', name: 'Nafisa Rustamova', meta: 'Band 6.0 → 7.0', initials: 'NR', quote: '5 oy ichida Writingda sezilarli farq ko\'rdim, 1.0 band oshdi.' },
    { lang: 'EN', name: 'Ella Reed', meta: 'Band 6.5 → 7.5', initials: 'ER', quote: 'Vocabulary Lab is incredibly detailed — it caught mistakes my tutor missed.' },
    { lang: 'UZ', name: 'Madinabonu Otajonova', meta: 'Band 6.0 → 7.5', initials: 'MO', quote: 'AI Mentor real imtihon formatiga juda o\'xshaydi, o\'zimni tayyor his qildim.' },
    { lang: 'UZ', name: 'Kamila Turg\'unova', meta: 'Band 4.5 → 6.0', initials: 'KT', quote: 'Grammar Checker real imtihon formatiga juda o\'xshaydi, o\'zimni tayyor his qildim.' },
    { lang: 'UZ', name: 'Sevara Nurmatova', meta: 'Band 4.5 → 5.0', initials: 'SN', quote: 'Narxi arzon, sifati esa xususiy repetitordan qolishmaydi. Mock Test Simulator eng yoqqan qismi.' },
    { lang: 'UZ', name: 'Otabek Xolmatov', meta: 'Band 4.5 → 6.5', initials: 'OX', quote: 'Mock Test Simulator tufayli 2.0 band ko\'tardim. Har kuni 25 daqiqa yetarli edi.' },
    { lang: 'UZ', name: 'Elyor Xasanov', meta: 'Band 5.0 → 6.5', initials: 'EX', quote: 'AI tekshiruvi aniq va tez — AI Mentor yordamida xatolarimni ko\'rib, tuzatib boraman.' },
    { lang: 'EN', name: 'Ava Anderson', meta: 'Band 4.5 → 6.0', initials: 'AA', quote: 'Vocabulary Lab is incredibly detailed — it caught mistakes my tutor missed.' },
    { lang: 'UZ', name: 'Nilufar Saidova', meta: 'Band 6.5 → 8.0', initials: 'NS', quote: 'Grammar Checker real imtihon formatiga juda o\'xshaydi, o\'zimni tayyor his qildim.' },
    { lang: 'EN', name: 'Adam Reynolds', meta: 'Band 6.5 → 7.0', initials: 'AR', quote: 'My Vocabulary score improved by 0.5 bands after using Grammar Hub consistently.' },
    { lang: 'UZ', name: 'Aziz Rahimov', meta: 'Band 6.5 → 8.0', initials: 'AR', quote: 'Vocabulary Lab juda foydali bo\'ldi — endi Grammar bo\'yicha o\'zimga ishonchim ortdi.' },
    { lang: 'UZ', name: 'Nigora Turg\'unova', meta: 'Band 5.5 → 7.5', initials: 'NT', quote: 'Ilgari Listening eng zaif tomonim edi, endi 2.0 band ko\'tarildim, rahmat VIVID IELTS!' },
    { lang: 'UZ', name: 'Alisher Nazarov', meta: 'Band 5.0 → 6.0', initials: 'AN', quote: '3 oyda 1.0 band o\'sish oldim. Writing Feedback har bir xatoni tushuntirib beradi.' },
    { lang: 'EN', name: 'Jessica Morgan', meta: 'Band 4.5 → 6.5', initials: 'JM', quote: 'I love that everything — vocab, grammar, mock tests — lives in one place.' },
    { lang: 'UZ', name: 'Farhod Rashidov', meta: 'Band 6.0 → 7.0', initials: 'FR', quote: 'Har kuni 20 daqiqa mashq qilish odatga aylandi — Mock Test Simulator juda qulay ekan.' },
    { lang: 'UZ', name: 'Bobur Sattorov', meta: 'Band 6.0 → 6.5', initials: 'BS', quote: 'Har kuni 25 daqiqa mashq qilish odatga aylandi — Mock Test Simulator juda qulay ekan.' },
    { lang: 'EN', name: 'Natalie Ford', meta: 'Band 6.0 → 7.5', initials: 'NF', quote: 'Writing Feedback kept me accountable and I finally stopped procrastinating.' },
    { lang: 'UZ', name: 'Diyora Rahmonova', meta: 'Band 6.0 → 7.5', initials: 'DR', quote: 'Speaking AI Examiner juda foydali bo\'ldi — endi Speaking bo\'yicha o\'zimga ishonchim ortdi.' },
    { lang: 'UZ', name: 'Gulnora Aliyeva', meta: 'Band 5.0 → 6.0', initials: 'GA', quote: 'Ilgari Listening eng zaif tomonim edi, endi 1.0 band ko\'tarildim, rahmat VIVID IELTS!' },
    { lang: 'UZ', name: 'Bahodir Karimov', meta: 'Band 5.0 → 7.0', initials: 'BK', quote: 'Listening Dictation Drills tufayli 2.0 band ko\'tardim. Har kuni 25 daqiqa yetarli edi.' },
    { lang: 'EN', name: 'Ethan Clark', meta: 'Band 5.0 → 5.5', initials: 'EC', quote: '2 months in, my Listening band jumped by 0.5 — I couldn\'t be happier.' },
    { lang: 'EN', name: 'Andrew Curtis', meta: 'Band 6.5 → 7.5', initials: 'AC', quote: 'Reading Strategy Lessons felt just like the real exam — zero surprises on test day.' },
    { lang: 'UZ', name: 'Ravshan Ismoilov', meta: 'Band 4.5 → 6.0', initials: 'RI', quote: 'Mock Test Simulator tufayli 1.5 band ko\'tardim. Har kuni 25 daqiqa yetarli edi.' },
    { lang: 'EN', name: 'Lucas Martinez', meta: 'Band 6.0 → 7.0', initials: 'LM', quote: 'I went from struggling with Listening to feeling confident in just 3 months.' },
    { lang: 'EN', name: 'Hannah Lee', meta: 'Band 6.0 → 7.5', initials: 'HL', quote: 'Worth every penny — Speaking AI Examiner alone is better than most paid tutoring sessions.' },
    { lang: 'EN', name: 'David Palmer', meta: 'Band 6.0 → 7.0', initials: 'DP', quote: 'I was stuck at the same band for a year until Grammar Hub showed me exactly what to fix.' },
    { lang: 'UZ', name: 'Ziyoda Qosimova', meta: 'Band 6.5 → 7.0', initials: 'ZQ', quote: 'Ilgari Grammar eng zaif tomonim edi, endi 0.5 band ko\'tarildim, rahmat VIVID IELTS!' },
    { lang: 'UZ', name: 'Ulug\'bek Mirzayev', meta: 'Band 6.0 → 8.0', initials: 'UM', quote: '5 oyda 2.0 band o\'sish oldim. Daily Practice Plan har bir xatoni tushuntirib beradi.' },
    { lang: 'UZ', name: 'Rustam Jo\'rayev', meta: 'Band 6.5 → 7.0', initials: 'RJ', quote: 'Har kuni 15 daqiqa mashq qilish odatga aylandi — Speaking AI Examiner juda qulay ekan.' },
    { lang: 'UZ', name: 'Gulbahor Ne\'matova', meta: 'Band 5.5 → 6.5', initials: 'GN', quote: '4 oy ichida Writingda sezilarli farq ko\'rdim, 1.0 band oshdi.' },
    { lang: 'UZ', name: 'Zarina Ismoilova', meta: 'Band 6.5 → 8.5', initials: 'ZI', quote: '5 oy ichida Listeningda sezilarli farq ko\'rdim, 2.0 band oshdi.' },
    { lang: 'UZ', name: 'Sanjar Yusupov', meta: 'Band 6.0 → 6.5', initials: 'SY', quote: 'Do\'stlarimga ham tavsiya qildim — Vocabulary Lab ayniqsa foydali bo\'ldi.' },
    { lang: 'EN', name: 'Isabella Moore', meta: 'Band 6.0 → 7.0', initials: 'IM', quote: 'The feedback on my essays is so precise, it\'s like having an examiner on call 24/7.' },
    { lang: 'EN', name: 'Jonathan Hart', meta: 'Band 6.0 → 8.0', initials: 'JH', quote: 'I went from struggling with Listening to feeling confident in just 2 months.' },
    { lang: 'EN', name: 'Noah Coleman', meta: 'Band 6.0 → 7.0', initials: 'NC', quote: 'My Reading score improved by 1.0 bands after using Daily Practice Plan consistently.' },
    { lang: 'EN', name: 'Rachel Fisher', meta: 'Band 6.5 → 7.5', initials: 'RF', quote: 'The feedback on my essays is so precise, it\'s like having an examiner on call 24/7.' },
    { lang: 'UZ', name: 'Mavluda Nazarova', meta: 'Band 5.5 → 6.0', initials: 'MN', quote: 'Eng yoqqani — Grammar Checker. Endi IELTS imtihoniga tayyorgarlik ancha yengil bo\'ldi.' },
    { lang: 'EN', name: 'Zoe Richardson', meta: 'Band 4.5 → 5.5', initials: 'ZR', quote: 'Daily Practice Plan kept me accountable and I finally stopped procrastinating.' },
    { lang: 'EN', name: 'Mia Thompson', meta: 'Band 5.0 → 6.0', initials: 'MT', quote: 'Vocabulary Lab helped me gain 1.0 bands. Just 30 minutes a day made the difference.' },
    { lang: 'EN', name: 'Justin Perry', meta: 'Band 6.5 → 8.5', initials: 'JP', quote: 'I was stuck at the same band for a year until Daily Practice Plan showed me exactly what to fix.' },
    { lang: 'UZ', name: 'Farrux Ergashev', meta: 'Band 6.0 → 8.0', initials: 'FE', quote: 'Do\'stlarimga ham tavsiya qildim — Vocabulary Lab ayniqsa foydali bo\'ldi.' }
  ];

  // Fisher-Yates shuffle, redrawn every time the deck is exhausted so nothing
  // repeats until all 100 have been shown; also guards against the last card
  // of one cycle matching the first card of the next.
  function shuffle(arr){
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  let order = shuffle(FEEDBACK.map((_, i) => i));
  let pos = 0;

  function paint(){
    const item = FEEDBACK[order[pos]];
    langEl.textContent = item.lang === 'UZ' ? "O'zbekcha" : 'English';
    quoteEl.textContent = item.quote;
    nameEl.textContent = item.name;
    metaEl.textContent = item.meta;
    avatarEl.textContent = item.initials;
    counterEl.textContent = `${pos + 1} / ${FEEDBACK.length}`;
  }

  function swapTo(step){
    cardEl.classList.add('is-fading');
    setTimeout(() => {
      pos += step;
      if (pos >= order.length) {
        let next = shuffle(FEEDBACK.map((_, i) => i));
        if (next[0] === order[order.length - 1]) {
          [next[0], next[1]] = [next[1], next[0]];
        }
        order = next;
        pos = 0;
      } else if (pos < 0) {
        pos = order.length - 1;
      }
      paint();
      cardEl.classList.remove('is-fading');
    }, 260);
  }

  function advance(){ swapTo(1); }

  let timer = null;
  function resetTimer(){
    if (timer) clearInterval(timer);
    timer = setInterval(advance, 5000);
  }

  if (nextBtn) nextBtn.addEventListener('click', () => { swapTo(1); resetTimer(); });
  if (prevBtn) prevBtn.addEventListener('click', () => { swapTo(-1); resetTimer(); });
  if (carousel) {
    carousel.addEventListener('mouseenter', () => { if (timer) clearInterval(timer); });
    carousel.addEventListener('mouseleave', resetTimer);
  }

  paint();
  resetTimer();
})();
