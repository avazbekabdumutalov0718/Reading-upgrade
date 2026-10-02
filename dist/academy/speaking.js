(() => {
  const state = { view: 'home', topicId: null, stack: [] };

  const root = document.getElementById('speakingRoot');
  const backBtn = document.getElementById('speakingBackBtn');

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  // Wraps the exact substrings (phrase.find) inside the answer text with
  // <mark> tags so they appear highlighted, matching the reference design.
  function highlightAnswer(answer, phrases) {
    let result = escapeHtml(answer);
    phrases.forEach((p) => {
      const escapedFind = escapeHtml(p.find);
      const idx = result.indexOf(escapedFind);
      if (idx !== -1) {
        result =
          result.slice(0, idx) +
          `<mark class="phrase-mark">${escapedFind}</mark>` +
          result.slice(idx + escapedFind.length);
      }
    });
    return result;
  }

  function renderHome() {
    backBtn.style.display = 'none';
    root.innerHTML = `
      <div class="speaking-topic-grid">
        <button class="speaking-topic-card mock-entry" type="button" data-view="mocks" data-premium-only>
          <span class="speaking-topic-icon">🎓</span>
          <span class="speaking-topic-title">Full Mock Exams</span>
          <span class="speaking-topic-count">🔒 Premium — ${MOCK_EXAMS.length} full exams · Part 1 + 2 + 3</span>
        </button>
        ${SPEAKING_TOPICS.map((t) => {
          const isFree = t.id === 'travelling';
          return `
          <button class="speaking-topic-card" type="button" data-topic="${t.id}" ${isFree ? '' : 'data-premium-only'}>
            <span class="speaking-topic-icon">${t.icon}</span>
            <span class="speaking-topic-title">${t.title}</span>
            <span class="speaking-topic-count">${isFree ? `${t.questions.length} questions · ${t.questions.reduce((s, q) => s + q.phrases.length, 0)} phrases` : '🔒 Premium'}</span>
          </button>
        `;
        }).join('')}
      </div>
    `;
    root.querySelectorAll('[data-topic]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const topicId = btn.getAttribute('data-topic');
        if (topicId !== 'travelling' && typeof isPremium === 'function') {
          const premium = await isPremium();
          if (!premium) {
            if (typeof showPremiumModal === 'function') showPremiumModal();
            return;
          }
        }
        state.stack.push({ view: 'home' });
        state.view = 'topic';
        state.topicId = topicId;
        renderTopic();
      });
    });
    const mocksBtn = root.querySelector('[data-view="mocks"]');
    if (mocksBtn) {
      mocksBtn.addEventListener('click', async () => {
        if (typeof isPremium === 'function') {
          const premium = await isPremium();
          if (!premium) {
            if (typeof showPremiumModal === 'function') showPremiumModal();
            return;
          }
        }
        state.stack.push({ view: 'home' });
        state.view = 'mocks';
        renderMockList();
      });
    }
    if (typeof applyPremiumLocks === 'function') applyPremiumLocks();
  }

  function renderMockList() {
    backBtn.style.display = 'inline-flex';
    root.innerHTML = `
      <div class="speaking-topic-header">
        <span class="speaking-topic-icon lg">🎓</span>
        <div>
          <h2>Full Mock Exams</h2>
          <p>${MOCK_EXAMS.length} ta to'liq imtihon — har birida Part 1, Part 2 (Cue Card) va Part 3</p>
        </div>
      </div>
      <div class="speaking-topic-grid">
        ${MOCK_EXAMS.map((m) => `
          <button class="speaking-topic-card" type="button" data-mock="${m.id}">
            <span class="speaking-topic-icon">📋</span>
            <span class="speaking-topic-title">${m.examLabel}</span>
            <span class="speaking-topic-count">${m.meta}</span>
          </button>
        `).join('')}
      </div>
    `;
    root.querySelectorAll('[data-mock]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.stack.push({ view: 'mocks' });
        state.view = 'mock-detail';
        state.mockId = btn.getAttribute('data-mock');
        state.mockPart = 'part1';
        renderMockDetail();
      });
    });
  }

  function renderMockDetail() {
    backBtn.style.display = 'inline-flex';
    const mock = MOCK_EXAMS.find((m) => m.id === state.mockId);
    if (!mock) return renderMockList();

    root.innerHTML = `
      <div class="speaking-topic-header">
        <span class="speaking-topic-icon lg">📋</span>
        <div>
          <h2>${mock.examLabel}</h2>
          <p>${mock.meta}</p>
        </div>
      </div>
      <div class="reading-toptabs">
        <span class="reading-toptab" data-part="part1">Part 1</span>
        <span class="reading-toptab" data-part="part2">Part 2 (Cue Card)</span>
        <span class="reading-toptab" data-part="part3">Part 3</span>
      </div>
      <div id="mockPartBody"></div>
    `;

    function renderPartBody() {
      root.querySelectorAll('.reading-toptab').forEach((tab) => {
        tab.classList.toggle('active', tab.getAttribute('data-part') === state.mockPart);
      });
      const body = document.getElementById('mockPartBody');

      if (state.mockPart === 'part1' || state.mockPart === 'part3') {
        const questions = mock[state.mockPart];
        body.innerHTML = `
          <div class="speaking-question-list">
            ${questions.map((q, idx) => `
              <div class="speaking-q-card">
                <button class="speaking-q-toggle" type="button">
                  <span class="speaking-q-num">${String(idx + 1).padStart(2, '0')}</span>
                  <span class="speaking-q-text">${q.q}</span>
                  <span class="speaking-q-arrow">▾</span>
                </button>
                <div class="speaking-q-body" hidden>
                  <p class="speaking-answer-label">ANSWER</p>
                  <p class="speaking-answer-text">${highlightAnswer(q.answer, q.chunks)}</p>
                  ${q.chunks.length ? `
                    <p class="speaking-phrases-label">Useful Chunks — bosing va kartani ag'daring</p>
                    <div class="flip-grid">
                      ${q.chunks.map((p) => `
                        <div class="flip-card">
                          <div class="flip-card-inner">
                            <div class="flip-card-face flip-card-front"><span>${p.phrase}</span></div>
                            <div class="flip-card-face flip-card-back">
                              <p class="flip-uz">${p.uz}</p>
                              <p class="flip-def">${p.def}</p>
                              <p class="flip-ex">${p.ex1}</p>
                              <p class="flip-ex">${p.ex2}</p>
                            </div>
                          </div>
                        </div>
                      `).join('')}
                    </div>
                  ` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        `;
      } else {
        const p2 = mock.part2;
        const paragraphs = p2.answer.split('\n\n').map((para) => `<p class="speaking-answer-text">${highlightAnswer(para, p2.chunks)}</p>`).join('');
        body.innerHTML = `
          <div class="speaking-q-card" style="padding: 20px;">
            <p class="speaking-answer-label">CUE CARD</p>
            <p class="speaking-q-text" style="margin-bottom:8px;">${p2.prompt}</p>
            <ul style="margin:0 0 16px 20px; color:var(--ink-soft); font-size:0.9rem; line-height:1.6;">
              ${p2.bullets.map((b) => `<li>${b}</li>`).join('')}
            </ul>
            <p class="speaking-answer-label">SAMPLE ANSWER</p>
            ${paragraphs}
            <p class="speaking-phrases-label">Useful Chunks — bosing va kartani ag'daring</p>
            <div class="flip-grid">
              ${p2.chunks.map((p) => `
                <div class="flip-card">
                  <div class="flip-card-inner">
                    <div class="flip-card-face flip-card-front"><span>${p.phrase}</span></div>
                    <div class="flip-card-face flip-card-back">
                      <p class="flip-uz">${p.uz}</p>
                      <p class="flip-def">${p.def}</p>
                      <p class="flip-ex">${p.ex1}</p>
                      <p class="flip-ex">${p.ex2}</p>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      }

      body.querySelectorAll('.speaking-q-toggle').forEach((btn) => {
        btn.addEventListener('click', () => {
          const bodyEl = btn.nextElementSibling;
          const arrow = btn.querySelector('.speaking-q-arrow');
          const isHidden = bodyEl.hasAttribute('hidden');
          if (isHidden) { bodyEl.removeAttribute('hidden'); arrow.textContent = '▴'; }
          else { bodyEl.setAttribute('hidden', ''); arrow.textContent = '▾'; }
        });
      });
      body.querySelectorAll('.flip-card').forEach((card) => {
        card.addEventListener('click', () => card.classList.toggle('flipped'));
      });
    }

    root.querySelectorAll('.reading-toptab').forEach((tab) => {
      tab.addEventListener('click', () => {
        state.mockPart = tab.getAttribute('data-part');
        renderPartBody();
      });
    });

    renderPartBody();
  }

  function renderTopic() {
    backBtn.style.display = 'inline-flex';
    const topic = SPEAKING_TOPICS.find((t) => t.id === state.topicId);
    if (!topic) return renderHome();

    root.innerHTML = `
      <div class="speaking-topic-header">
        <span class="speaking-topic-icon lg">${topic.icon}</span>
        <div>
          <h2>${topic.title}</h2>
          <p>${topic.questions.length} savol · har birida sample answer va 5 ta kolokatsiya</p>
        </div>
      </div>
      <div class="speaking-question-list">
        ${topic.questions.map((q, idx) => `
          <div class="speaking-q-card" id="q-${idx}">
            <button class="speaking-q-toggle" type="button" data-qidx="${idx}">
              <span class="speaking-q-num">${String(idx + 1).padStart(2, '0')}</span>
              <span class="speaking-q-text">${q.q}</span>
              <span class="speaking-q-arrow">▾</span>
            </button>
            <div class="speaking-q-body" hidden>
              <p class="speaking-answer-label">ANSWER</p>
              <p class="speaking-answer-text">${highlightAnswer(q.answer, q.phrases)}</p>
              <p class="speaking-phrases-label">Native Phrases — bosing va kartani ag'daring</p>
              <div class="flip-grid">
                ${q.phrases.map((p, pIdx) => `
                  <div class="flip-card" data-flip="${idx}-${pIdx}">
                    <div class="flip-card-inner">
                      <div class="flip-card-face flip-card-front">
                        <span>${p.phrase}</span>
                      </div>
                      <div class="flip-card-face flip-card-back">
                        <p class="flip-uz">${p.uz}</p>
                        <p class="flip-def">${p.def}</p>
                        <p class="flip-ex">${p.ex1}</p>
                        <p class="flip-ex">${p.ex2}</p>
                      </div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;

    root.querySelectorAll('.speaking-q-toggle').forEach((btn) => {
      btn.addEventListener('click', () => {
        const body = btn.nextElementSibling;
        const arrow = btn.querySelector('.speaking-q-arrow');
        const isHidden = body.hasAttribute('hidden');
        if (isHidden) {
          body.removeAttribute('hidden');
          arrow.textContent = '▴';
        } else {
          body.setAttribute('hidden', '');
          arrow.textContent = '▾';
        }
      });
    });

    root.querySelectorAll('.flip-card').forEach((card) => {
      card.addEventListener('click', () => {
        card.classList.toggle('flipped');
      });
    });
  }

  function renderCurrentView() {
    if (!root) return;
    if (state.view === 'home') return renderHome();
    if (state.view === 'topic') return renderTopic();
    if (state.view === 'mocks') return renderMockList();
    if (state.view === 'mock-detail') return renderMockDetail();
  }

  if (backBtn) {
    backBtn.addEventListener('click', () => {
      if (state.stack.length > 0) {
        const prev = state.stack.pop();
        state.view = prev.view;
        renderCurrentView();
        return;
      }
      state.view = 'home';
      renderCurrentView();
    });
  }

  renderCurrentView();
})();
