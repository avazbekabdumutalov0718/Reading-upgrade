/* ============================================================
   VIVID IELTS — Speaking Mock Test — Engine
   Requires: speaking-mock-data.js loaded before this file.
   Config: window.SPEAKING_MOCK_CONFIG = { submitUrl, botUsername }
   ============================================================ */
(() => {
  const DATA = window.SPEAKING_MOCK_DATA;
  const CONFIG = window.SPEAKING_MOCK_CONFIG || {};
  const root = document.getElementById('mockRoot');
  if (!root || !DATA) return;

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  let session = null;
  let flatQueue = [];
  let currentIndex = 0;
  let mediaRecorder = null, chunks = [], recStream = null, recording = false, recStartTime = 0, recTimerInt = null;
  let recognition = null, liveTranscript = '';

  function startMock() {
    const { PART1_TOPICS, PART2_TOPICS, PART3_GROUPS, P2_TO_P3 } = DATA;
    const p1 = pick(PART1_TOPICS);
    const p2idx = Math.floor(Math.random() * PART2_TOPICS.length);
    const p2 = PART2_TOPICS[p2idx];
    let p3idx = P2_TO_P3[p2idx];
    if (p3idx === -1 || p3idx === undefined) p3idx = Math.floor(Math.random() * PART3_GROUPS.length);
    const p3 = PART3_GROUPS[p3idx];
    const p3final = shuffle(p3[1]).slice(0, Math.min(6, p3[1].length));

    session = { part1: p1, part2: p2, part3group: p3, answers: [], code: 'VV' + Date.now().toString(36).toUpperCase() };

    flatQueue = [];
    p1[1].forEach(q => flatQueue.push({ part: '1', label: p1[0], question: q }));
    flatQueue.push({ part: '2', label: p2[0], question: p2[1], cue: p2[2] });
    p3final.forEach(q => flatQueue.push({ part: '3', label: p3[0], question: q }));

    currentIndex = 0;
    renderQuestion();
  }

  function progressPct() { return Math.round((currentIndex / flatQueue.length) * 100); }

  function renderIntro() {
    root.innerHTML = `
      <div class="mock-intro-card" data-premium-only>
        <p class="mock-eyebrow">MOCK TEST</p>
        <h2>Speaking Mock imtihonini boshlash</h2>
        <p class="mock-lead">Tizim tasodifiy tanlaydi: Part 1'dan 1 ta topic (barcha savollari), Part 2'dan 1 ta cue card va shu mavzuga bog'liq Part 3'dan 5–6 ta savol. Har bir savolga javob berilmaguncha keyingisiga o'tolmaysiz. Oxirida barcha javoblaringiz (audio + matn) tekshirish uchun @${CONFIG.botUsername || 'vividielts_bot'} ga yuboriladi.</p>
        <button class="mock-btn mock-btn-primary" id="mockStartBtn">🎤 Mock testni boshlash</button>
      </div>
    `;
    document.getElementById('mockStartBtn').onclick = async () => {
      if (typeof isPremium === 'function') {
        const premium = await isPremium();
        if (!premium) {
          if (typeof showPremiumModal === 'function') showPremiumModal();
          return;
        }
      }
      startMock();
    };
    if (typeof applyPremiumLocks === 'function') applyPremiumLocks();
  }

  function renderQuestion() {
    stopRecordingCleanup();
    const item = flatQueue[currentIndex];
    const partLabel = item.part === '1' ? 'PART 1' : item.part === '2' ? 'PART 2' : 'PART 3';
    const isPart2 = item.part === '2';

    root.innerHTML = `
      <span class="mock-tag mock-tag-${item.part}">${partLabel} — ${item.label}</span>
      <div class="mock-progress-track"><div class="mock-progress-fill" style="width:${progressPct()}%"></div></div>
      <div class="mock-qbox">
        <div class="mock-qn">Savol ${currentIndex + 1} / ${flatQueue.length}</div>
        <div class="mock-qtext">${item.question}</div>
      </div>
      ${isPart2 ? `<div class="mock-cue"><b>Siz quyidagilarni aytishingiz kerak:</b><br>${item.cue.map(c => '• ' + c).join('<br>')}</div>
      <div id="prepArea">
        <button class="mock-btn mock-btn-outline" id="prepBtn">⏱ 1 daqiqa tayyorgarlik vaqtini boshlash</button>
        <p class="mock-hint">Yoki tayyorgarliksiz to'g'ridan-to'g'ri javob yozishni boshlashingiz mumkin.</p>
      </div>` : ''}
      <div class="mock-rec-area" id="recArea" ${isPart2 ? 'style="display:none"' : ''}>
        <button class="mock-rec-btn" id="recBtn">●</button>
        <div>
          <div class="mock-timer" id="recTimer">00:00</div>
          <div id="audioSlot"></div>
        </div>
      </div>
      <div class="mock-transcript" id="transcriptBox">Matn: (hali yozilmagan)</div>
      <div id="statusBox"></div>
      <div class="mock-row">
        <button class="mock-btn mock-btn-primary" id="nextBtn" disabled>Keyingisi →</button>
      </div>
    `;

    document.getElementById('recBtn').onclick = toggleRecording;
    if (isPart2) document.getElementById('prepBtn').onclick = startPrepTimer;
  }

  function startPrepTimer() {
    let t = 60;
    const btn = document.getElementById('prepBtn');
    btn.disabled = true;
    const iv = setInterval(() => {
      t--;
      btn.textContent = `⏱ Tayyorgarlik: ${t}s`;
      if (t <= 0) {
        clearInterval(iv);
        document.getElementById('prepArea').innerHTML = '<p class="mock-hint">Tayyorgarlik tugadi. Endi javobingizni yozib oling (max 2 daqiqa).</p>';
        document.getElementById('recArea').style.display = 'flex';
      }
    }, 1000);
  }

  async function toggleRecording() {
    if (!recording) {
      try {
        recStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (e) {
        showStatus('err', 'Mikrofonga ruxsat berilmadi. Brauzer sozlamalarini tekshiring.');
        return;
      }
      chunks = [];
      mediaRecorder = new MediaRecorder(recStream);
      mediaRecorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
      mediaRecorder.onstop = onRecordingStop;
      mediaRecorder.start();
      recording = true;
      recStartTime = Date.now();
      document.getElementById('recBtn').classList.add('recording');
      document.getElementById('recBtn').textContent = '■';
      recTimerInt = setInterval(updateRecTimer, 300);
      startLiveTranscript();
    } else {
      mediaRecorder.stop();
      recording = false;
      clearInterval(recTimerInt);
      document.getElementById('recBtn').classList.remove('recording');
      document.getElementById('recBtn').textContent = '●';
      if (recognition) recognition.stop();
      recStream.getTracks().forEach(t => t.stop());
    }
  }

  function updateRecTimer() {
    const s = Math.floor((Date.now() - recStartTime) / 1000);
    const mm = String(Math.floor(s / 60)).padStart(2, '0');
    const ss = String(s % 60).padStart(2, '0');
    const el = document.getElementById('recTimer');
    if (el) el.textContent = `${mm}:${ss}`;
  }

  function startLiveTranscript() {
    liveTranscript = '';
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      document.getElementById('transcriptBox').textContent = "Matn: brauzeringiz avtomatik matnga o'girishni qo'llab-quvvatlamaydi (Chrome tavsiya etiladi).";
      return;
    }
    recognition = new SR();
    recognition.lang = 'en-US';
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onresult = (e) => {
      let text = '';
      for (let i = 0; i < e.results.length; i++) text += e.results[i][0].transcript + ' ';
      liveTranscript = text.trim();
      document.getElementById('transcriptBox').textContent = 'Matn: ' + liveTranscript;
    };
    recognition.onerror = () => {};
    recognition.start();
  }

  function onRecordingStop() {
    const blob = new Blob(chunks, { type: 'audio/webm' });
    const url = URL.createObjectURL(blob);
    document.getElementById('audioSlot').innerHTML = `<audio controls src="${url}"></audio>`;
    const item = flatQueue[currentIndex];
    const dur = Math.floor((Date.now() - recStartTime) / 1000);
    session.answers[currentIndex] = {
      part: item.part, label: item.label, question: item.question,
      text: liveTranscript || '(matn yozilmadi)', blob, durationSec: dur
    };
    document.getElementById('nextBtn').disabled = false;
    showStatus('ok', "Javob saqlandi ✓ Endi keyingisiga o'tishingiz mumkin.");
    document.getElementById('nextBtn').onclick = goNext;
  }

  function stopRecordingCleanup() {
    recording = false; chunks = []; mediaRecorder = null;
    if (recTimerInt) clearInterval(recTimerInt);
    if (recognition) { try { recognition.stop(); } catch (e) {} recognition = null; }
  }

  function showStatus(kind, msg) {
    const box = document.getElementById('statusBox');
    if (box) box.innerHTML = `<div class="mock-status mock-status-${kind}">${msg}</div>`;
  }

  function goNext() {
    if (currentIndex < flatQueue.length - 1) {
      currentIndex++;
      renderQuestion();
    } else {
      renderReview();
    }
  }

  function renderReview() {
    stopRecordingCleanup();
    const groups = {
      '1': 'PART 1 — ' + session.part1[0],
      '2': 'PART 2 — ' + session.part2[0],
      '3': 'PART 3 — ' + session.part3group[0]
    };
    let html = `
      <span class="mock-tag">YAKUN</span>
      <h2>Mock test tugadi 🎉</h2>
      <p class="mock-lead">Barcha javoblaringiz quyida. Tekshirib bo'lgach, "Telegramga yuborish" tugmasini bosing — natija @${CONFIG.botUsername || 'vividielts_bot'} orqali admin'ga yuboriladi va u sizga natijani email yoki Telegram orqali qaytaradi.</p>
      <div class="mock-field">
        <label>Email yoki Telegram username (natijani qaytarish uchun, ixtiyoriy)</label>
        <input type="text" id="contactInput" placeholder="email@example.com yoki @username">
      </div>
    `;
    ['1', '2', '3'].forEach(p => {
      const items = session.answers.filter(a => a && a.part === p);
      if (items.length === 0) return;
      html += `<h3 class="mock-group-title">${groups[p]}</h3>`;
      items.forEach(a => {
        const url = URL.createObjectURL(a.blob);
        html += `<div class="mock-review-block">
          <div class="mock-review-q">${a.question}</div>
          <audio controls src="${url}"></audio>
          <div class="mock-review-a">${a.text}</div>
        </div>`;
      });
    });
    html += `
      <div id="submitStatus"></div>
      <div class="mock-row">
        <button class="mock-btn mock-btn-primary" id="sendBtn">📤 Telegramga yuborish</button>
        <button class="mock-btn mock-btn-outline" id="restartBtn">🔁 Yangi mock boshlash</button>
      </div>
    `;
    root.innerHTML = html;
    document.getElementById('sendBtn').onclick = submitMock;
    document.getElementById('restartBtn').onclick = renderIntro;
  }

  async function submitMock() {
    const box = document.getElementById('submitStatus');
    const submitUrl = CONFIG.submitUrl;
    if (!submitUrl) {
      box.innerHTML = `<div class="mock-status mock-status-err">Yuborish manzili sozlanmagan. Sahifa admin tomonidan speaking-mock.html ichida SPEAKING_MOCK_CONFIG.submitUrl to'ldirilishi kerak.</div>`;
      return;
    }
    box.innerHTML = `<div class="mock-status mock-status-wait">Yuborilmoqda...</div>`;
    const answered = session.answers.filter(Boolean);
    const contact = document.getElementById('contactInput').value.trim();

    const fd = new FormData();
    fd.append('meta', JSON.stringify({
      code: session.code,
      part1Topic: session.part1[0],
      part2Topic: session.part2[0],
      part3Topic: session.part3group[0],
      contact: contact || null,
      createdAt: new Date().toISOString(),
      answers: answered.map((a, i) => ({ index: i, part: a.part, question: a.question, text: a.text, durationSec: a.durationSec }))
    }));
    answered.forEach((a, i) => {
      fd.append(`audio_${i}_part${a.part}`, a.blob, `answer_${i}_part${a.part}.webm`);
    });

    try {
      const res = await fetch(submitUrl, { method: 'POST', body: fd });
      if (!res.ok) throw new Error('Server javobi: ' + res.status);
      box.innerHTML = `<div class="mock-status mock-status-ok">✅ Mock test @${CONFIG.botUsername || 'vividielts_bot'} ga muvaffaqiyatli yuborildi. Admin tekshirib, natijani sizga qaytaradi. Kodingiz: <b>${session.code}</b></div>`;
    } catch (e) {
      box.innerHTML = `<div class="mock-status mock-status-err">❌ Yuborishda xatolik: ${e.message}. Internetni tekshirib qayta urinib ko'ring.</div>`;
    }
  }

  renderIntro();
})();