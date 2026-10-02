/* ===================== VIVID IELTS — Listening Tools (30-day podcast plan + 15-day note-taking) =====================
   Self-contained: no backend required. Progress + written answers persist in localStorage per browser.
========================================================================================================== */
(function () {
  'use strict';

  var LS_POD = 'vivid_listening_podcast_v1';   // { "1": {done:true, notes:"", summary:"", retell:""}, ... }
  var LS_NOTE = 'vivid_listening_notetaking_v1'; // { "1": {done:true, mainIdea:"", keywords:"", numbers:"", summary5:""}, ... }

  function loadJSON(key) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : {};
    } catch (e) { return {}; }
  }
  function saveJSON(key, obj) {
    try { localStorage.setItem(key, JSON.stringify(obj)); } catch (e) { /* ignore quota errors */ }
  }

  var podState = loadJSON(LS_POD);
  var noteState = loadJSON(LS_NOTE);

  /* ---------------- 30-day podcast plan data ----------------
     Mostly TED-Ed (closest in style/topic to IELTS Listening academic mini-lectures),
     mixed with Diary of a CEO, Jay Shetty, Alex Hormozi and Cleo Abram.
     "q" is used to build a YouTube search link (safer than guessing exact video IDs —
     always opens the real, correct video as the first result).
  --------------------------------------------------------------- */
  var POD_DAYS = [
    { d: 1,  src: 'ted',     title: "Nega tush ko'ramiz?", en: "Why do we dream?", level: 'B2', mins: 5,  q: 'TED-Ed Why do we dream' },
    { d: 2,  src: 'ted',     title: "Ikki tilli miyaning foydalari", en: "The benefits of a bilingual brain", level: 'B2', mins: 5, q: 'TED-Ed The benefits of a bilingual brain' },
    { d: 3,  src: 'ted',     title: "Stress tanangizga qanday ta'sir qiladi?", en: "How stress affects your body", level: 'B2', mins: 4, q: 'TED-Ed How stress affects your body' },
    { d: 4,  src: 'ted',     title: "Mahbus qalpoqchasi jumbog'i", en: "The prisoner hat riddle", level: 'B1+', mins: 5, q: 'TED-Ed The prisoner hat riddle' },
    { d: 5,  src: 'doac',    title: "Muvaffaqiyat va aqliy salomatlik haqida suhbat", en: "Success & mental health interview", level: 'C1', mins: 35, q: 'The Diary of a CEO mental health success interview' },
    { d: 6,  src: 'ted',     title: "Chivinlar nega dunyodagi eng xavfli jonzot?", en: "The world's deadliest animal (mosquitoes)", level: 'B2', mins: 5, q: "TED-Ed The world's deadliest animal" },
    { d: 7,  src: 'ted',     title: "Yaxshi uyqu miyaga qanday foyda beradi?", en: "The benefits of a good night's sleep", level: 'B2', mins: 5, q: "TED-Ed The benefits of a good night's sleep" },
    { d: 8,  src: 'jay',     title: "Maqsad va hissiy intellekt haqida", en: "Purpose & emotional intelligence", level: 'B2', mins: 45, q: 'Jay Shetty podcast purpose emotional intelligence' },
    { d: 9,  src: 'ted',     title: "Soxta yangilikni qanday aniqlash mumkin?", en: "How to tell fake news from real news", level: 'B2', mins: 4, q: 'TED-Ed How to tell fake news from real news' },
    { d: 10, src: 'ted',     title: "Vaksinalar qanday ishlaydi?", en: "How do vaccines work?", level: 'C1', mins: 5, q: 'TED-Ed How do vaccines work' },
    { d: 11, src: 'hormozi', title: "Rad etib bo'lmaydigan taklif qanday yaratiladi?", en: "How to make offers people can't refuse", level: 'C1', mins: 20, q: "Alex Hormozi how to make offers people can't refuse" },
    { d: 12, src: 'ted',     title: "Fond bozori qanday ishlaydi?", en: "How does the stock market work?", level: 'C1', mins: 5, q: 'TED-Ed How does the stock market work' },
    { d: 13, src: 'ted',     title: "Nega ba'zan zerikamiz?", en: "Why do we get bored?", level: 'B2', mins: 5, q: 'TED-Ed Why do we get bored' },
    { d: 14, src: 'cleo',    title: "Kelajak texnologiyalariga optimistik nazar", en: "Huge If True — future technology", level: 'C1', mins: 15, q: 'Cleo Abram Huge If True future technology' },
    { d: 15, src: 'ted',     title: "Nega yelim yopishqoq bo'ladi?", en: "Why is glue sticky?", level: 'B2', mins: 5, q: 'TED-Ed Why is glue sticky' },
    { d: 16, src: 'ted',     title: "Tor bolg'asi afsonasi", en: "The myth of Thor's hammer", level: 'B2', mins: 5, q: "TED-Ed The myth of Thor's hammer" },
    { d: 17, src: 'jay',     title: "Munosabatlar va his-tuyg'ular haqida maslahatlar", en: "Relationship advice", level: 'B2', mins: 40, q: 'Jay Shetty podcast relationship advice' },
    { d: 18, src: 'ted',     title: "Alkogol tanaga qanday ta'sir qiladi?", en: "How alcohol affects your body", level: 'C1', mins: 5, q: 'TED-Ed How alcohol affects your body' },
    { d: 19, src: 'ted',     title: "Nega ishni keyinga suramiz?", en: "Why do we procrastinate?", level: 'C1', mins: 5, q: 'TED-Ed Why do we procrastinate' },
    { d: 20, src: 'doac',    title: "Uyqu ilmi bo'yicha mutaxassis bilan suhbat", en: "Sleep science expert interview", level: 'C1', mins: 40, q: 'The Diary of a CEO sleep expert interview' },
    { d: 21, src: 'ted',     title: "Qarg'a bilan o'ynashmang — ular esini yodda tutadi", en: "Don't mess with a crow", level: 'B2', mins: 5, q: "TED-Ed Don't mess with a crow" },
    { d: 22, src: 'ted',     title: "Yurish sog'liqqa qanday foyda beradi?", en: "The benefits of walking", level: 'B2', mins: 4, q: 'TED-Ed The benefits of walking' },
    { d: 23, src: 'hormozi', title: "Boyib ketish uchun qanday ko'nikmalar kerak?", en: "Skills to get rich", level: 'C1', mins: 18, q: 'Alex Hormozi skills to get rich' },
    { d: 24, src: 'ted',     title: "Fibonachchi ketma-ketligi nima?", en: "What is the Fibonacci sequence?", level: 'C1', mins: 5, q: 'TED-Ed What is the Fibonacci sequence' },
    { d: 25, src: 'ted',     title: "Tanqidiy fikrlashni yaxshilash bo'yicha 5 maslahat", en: "5 tips to improve your critical thinking", level: 'B2', mins: 4, q: '5 tips to improve your critical thinking TED-Ed' },
    { d: 26, src: 'jay',     title: "Yaxshi odatlarni shakllantirish haqida", en: "Build better habits", level: 'B2', mins: 40, q: 'Jay Shetty podcast build better habits' },
    { d: 27, src: 'ted',     title: "Suv ichmasangiz nima bo'ladi?", en: "What would happen if you stopped drinking water?", level: 'B2', mins: 5, q: 'TED-Ed What would happen if you stopped drinking water' },
    { d: 28, src: 'cleo',    title: "Yadro energiyasi haqida haqiqat", en: "Huge If True — nuclear energy", level: 'C1', mins: 15, q: 'Cleo Abram Huge If True nuclear energy' },
    { d: 29, src: 'ted',     title: "Mushuklar nega g'alati harakat qiladi?", en: "Why do cats act so weird?", level: 'B1+', mins: 5, q: 'TED-Ed Why do cats act so weird' },
    { d: 30, src: 'doac',    title: "Pul va moliyaviy erkinlik haqida suhbat", en: "Money & financial freedom interview", level: 'C1', mins: 40, q: 'The Diary of a CEO money financial freedom interview' }
  ];

  var SRC_LABEL = { ted: 'TED-Ed', doac: 'Diary of a CEO', jay: 'Jay Shetty', hormozi: 'Alex Hormozi', cleo: 'Cleo Abram' };
  var SRC_CLASS = { ted: 'ted', doac: 'doac', jay: 'jay', hormozi: 'hormozi', cleo: 'cleo' };

  /* ---------------- 15-day note-taking track ----------------
     Real, verified British Council LearnEnglish resource: leveled audio + official transcript + exercises.
     Days 1-8 -> B2 index page, days 9-15 -> C1 index page (each page lists several real audios to pick from).
  --------------------------------------------------------------- */
  var NOTE_B2_URL = 'https://learnenglish.britishcouncil.org/free-resources/listening/b2';
  var NOTE_C1_URL = 'https://learnenglish.britishcouncil.org/free-resources/listening/c1';
  var NOTE_AUDIOZONE_URL = 'https://learnenglish.britishcouncil.org/general-english/audio-zone';

  var NOTE_DAYS = [];
  for (var i = 1; i <= 15; i++) {
    var level = i <= 8 ? 'B2' : 'C1';
    var url = i <= 8 ? NOTE_B2_URL : NOTE_C1_URL;
    NOTE_DAYS.push({ d: i, level: level, url: url });
  }

  /* ---------------- render: 30-day podcast grid ---------------- */
  var podGrid = document.getElementById('lpPodGrid');

  function ytSearchUrl(q) {
    return 'https://www.youtube.com/results?search_query=' + encodeURIComponent(q);
  }

  function podEntry(day) {
    if (!podState[day]) podState[day] = { done: false, notes: '', summary: '', retell: '' };
    return podState[day];
  }

  function renderPodCard(item) {
    var entry = podEntry(item.d);
    var card = document.createElement('div');
    card.className = 'lp-card' + (entry.done ? ' is-done' : '');
    card.dataset.day = item.d;

    card.innerHTML =
      '<div class="lp-card-top">' +
        '<span class="lp-day-num">Kun ' + item.d + '</span>' +
        '<span class="lp-done-check">✓ bajarildi</span>' +
      '</div>' +
      '<div class="lp-title">' + item.title + '</div>' +
      '<div class="lp-desc">' + item.en + '</div>' +
      '<div class="lp-meta-row">' +
        '<span class="lp-tag ' + SRC_CLASS[item.src] + '">' + SRC_LABEL[item.src] + '</span>' +
        '<span class="lp-tag lvl">' + item.level + '</span>' +
        '<span class="lp-tag lvl">~' + item.mins + ' daq</span>' +
      '</div>' +
      '<a class="lp-watch-btn" target="_blank" rel="noopener" href="' + ytSearchUrl(item.q) + '">▶ YouTube\u2019da qidirish</a>' +
      '<button type="button" class="lp-toggle-ex">📝 Mashqni ochish (note-taking / summary / retelling)</button>' +
      '<div class="lp-ex-panel">' +
        '<label>1) Note-taking — kalit so\u2018zlar, raqamlar, asosiy fikrlar</label>' +
        '<textarea data-field="notes" placeholder="Video davomida eshitgan kalit so\u2018z va faktlaringizni shu yerga yozing..."></textarea>' +
        '<label>2) Summary — o\u2018z so\u2018zingiz bilan 5-6 gapli xulosa</label>' +
        '<textarea data-field="summary" placeholder="Videoning asosiy g\u2018oyasini o\u2018z so\u2018zlaringiz bilan qisqacha yozing..."></textarea>' +
        '<label>3) Retelling — videoni yodingizdan (yoki ovoz yozib) qayta hikoya qiling</label>' +
        '<textarea data-field="retell" placeholder="Videoni ko\u2018rmasdan, xotiradan qayta hikoya qilib yozing (yoki ovozli qayta hikoya qilib, shu yerga qisqa reja yozing)..."></textarea>' +
        '<button type="button" class="lp-mark-btn">' + (entry.done ? '✓ Bajarildi (bekor qilish)' : 'Bajarildi deb belgilash') +
      '</div>';

    var notes = card.querySelector('[data-field="notes"]');
    var summary = card.querySelector('[data-field="summary"]');
    var retell = card.querySelector('[data-field="retell"]');
    notes.value = entry.notes || '';
    summary.value = entry.summary || '';
    retell.value = entry.retell || '';

    [notes, summary, retell].forEach(function (ta) {
      ta.addEventListener('input', function () {
        entry[ta.dataset.field] = ta.value;
        saveJSON(LS_POD, podState);
      });
    });

    card.querySelector('.lp-toggle-ex').addEventListener('click', function () {
      card.querySelector('.lp-ex-panel').classList.toggle('open');
    });

    card.querySelector('.lp-mark-btn').addEventListener('click', function () {
      entry.done = !entry.done;
      saveJSON(LS_POD, podState);
      card.classList.toggle('is-done', entry.done);
      this.textContent = entry.done ? '✓ Bajarildi (bekor qilish)' : 'Bajarildi deb belgilash';
      updateOverview();
    });

    return card;
  }

  function renderPodGrid() {
    podGrid.innerHTML = '';
    POD_DAYS.forEach(function (item) { podGrid.appendChild(renderPodCard(item)); });
  }

  /* ---------------- render: 15-day note-taking grid ---------------- */
  var noteGrid = document.getElementById('lpNoteGrid');

  function noteEntry(day) {
    if (!noteState[day]) noteState[day] = { done: false, mainIdea: '', keywords: '', numbers: '', summary5: '' };
    return noteState[day];
  }

  function renderNoteCard(item) {
    var entry = noteEntry(item.d);
    var card = document.createElement('div');
    card.className = 'lp-note-card' + (entry.done ? ' is-done' : '');
    card.dataset.day = item.d;

    card.innerHTML =
      '<div class="lp-note-head">' +
        '<h4>Kun ' + item.d + ' — <span class="lp-tag lvl">' + item.level + '</span></h4>' +
        '<a class="lp-source-link" target="_blank" rel="noopener" href="' + item.url + '">🎧 British Council — ' + item.level + ' listening ro\u2018yxati</a>' +
      '</div>' +
      '<div class="lp-note-fields">' +
        '<div><label>Asosiy g\u2018oya (main idea)</label><textarea data-field="mainIdea"></textarea></div>' +
        '<div><label>Kalit so\u2018zlar (5-8 ta)</label><textarea data-field="keywords"></textarea></div>' +
        '<div class="lp-field-full"><label>Raqamlar / sanalar / foizlar eshitilgan holda</label><textarea data-field="numbers" style="min-height:40px"></textarea></div>' +
        '<div class="lp-field-full"><label>5 gapli xulosa (o\u2018z so\u2018zingiz bilan)</label><textarea data-field="summary5"></textarea></div>' +
      '</div>' +
      '<button type="button" class="lp-mark-btn" style="margin-top:10px;">' + (entry.done ? '✓ Bajarildi (bekor qilish)' : 'Bajarildi deb belgilash') + '</button>';

    ['mainIdea', 'keywords', 'numbers', 'summary5'].forEach(function (field) {
      var ta = card.querySelector('[data-field="' + field + '"]');
      ta.value = entry[field] || '';
      ta.addEventListener('input', function () {
        entry[field] = ta.value;
        saveJSON(LS_NOTE, noteState);
      });
    });

    card.querySelector('.lp-mark-btn').addEventListener('click', function () {
      entry.done = !entry.done;
      saveJSON(LS_NOTE, noteState);
      card.classList.toggle('is-done', entry.done);
      this.textContent = entry.done ? '✓ Bajarildi (bekor qilish)' : 'Bajarildi deb belgilash';
      updateOverview();
    });

    return card;
  }

  function renderNoteGrid() {
    noteGrid.innerHTML = '';
    NOTE_DAYS.forEach(function (item) { noteGrid.appendChild(renderNoteCard(item)); });
  }

  /* ---------------- overview stats ---------------- */
  function updateOverview() {
    var podDone = POD_DAYS.filter(function (item) { return podEntry(item.d).done; }).length;
    var noteDone = NOTE_DAYS.filter(function (item) { return noteEntry(item.d).done; }).length;
    document.getElementById('lpPodDoneNum').textContent = podDone + '/30';
    document.getElementById('lpNoteDoneNum').textContent = noteDone + '/15';
    var pct = Math.round(((podDone + noteDone) / 45) * 100);
    document.getElementById('lpOverallBar').style.width = pct + '%';
    document.getElementById('lpOverallPct').textContent = pct + '%';
  }

  /* ---------------- PDF export ---------------- */
  function exportPdf() {
    var btn = document.getElementById('lpExportPdfBtn');
    if (!window.jspdf || !window.jspdf.jsPDF) {
      alert("PDF kutubxonasi yuklanmadi. Internetga ulanishni tekshiring va sahifani qayta yuklang.");
      return;
    }
    btn.disabled = true;
    btn.textContent = '⏳ Tayyorlanmoqda...';

    try {
      var jsPDF = window.jspdf.jsPDF;
      var doc = new jsPDF({ unit: 'pt', format: 'a4' });
      var pageW = doc.internal.pageSize.getWidth();
      var margin = 42;
      var maxW = pageW - margin * 2;
      var y = margin;
      var lineH = 14;

      function ensureSpace(needed) {
        if (y + needed > doc.internal.pageSize.getHeight() - margin) {
          doc.addPage();
          y = margin;
        }
      }
      function heading(text, size) {
        ensureSpace(size + 10);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(size);
        doc.text(text, margin, y);
        y += size + 8;
        doc.setFont('helvetica', 'normal');
      }
      function bodyLine(label, value) {
        var text = (label ? label + ': ' : '') + (value && value.trim() ? value.trim() : '—');
        doc.setFontSize(10);
        var lines = doc.splitTextToSize(text, maxW);
        ensureSpace(lines.length * lineH + 4);
        doc.text(lines, margin, y);
        y += lines.length * lineH + 6;
      }

      heading('VIVID IELTS — Listening jurnali', 16);
      doc.setFontSize(10);
      doc.text('Yaratilgan sana: ' + new Date().toLocaleDateString('uz-UZ'), margin, y);
      y += 22;

      heading('1) 30 kunlik podcast reja', 13);
      POD_DAYS.forEach(function (item) {
        var entry = podEntry(item.d);
        ensureSpace(20);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        var title = 'Kun ' + item.d + ' — [' + SRC_LABEL[item.src] + ', ' + item.level + '] ' + item.title + ' (' + item.en + ')';
        var titleLines = doc.splitTextToSize(title, maxW);
        ensureSpace(titleLines.length * lineH + 4);
        doc.text(titleLines, margin, y);
        y += titleLines.length * lineH + 2;
        doc.setFont('helvetica', 'normal');
        bodyLine('Note-taking', entry.notes);
        bodyLine('Summary', entry.summary);
        bodyLine('Retelling', entry.retell);
        y += 6;
      });

      doc.addPage();
      y = margin;
      heading('2) 15 kunlik note-taking mashqi (British Council B2/C1)', 13);
      NOTE_DAYS.forEach(function (item) {
        var entry = noteEntry(item.d);
        ensureSpace(20);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text('Kun ' + item.d + ' — [' + item.level + ']', margin, y);
        y += lineH + 2;
        doc.setFont('helvetica', 'normal');
        bodyLine("Asosiy g'oya", entry.mainIdea);
        bodyLine('Kalit so\u2018zlar', entry.keywords);
        bodyLine('Raqamlar/sanalar', entry.numbers);
        bodyLine('5 gapli xulosa', entry.summary5);
        y += 6;
      });

      doc.save('vivid-ielts-listening-journal.pdf');
    } catch (err) {
      console.error('PDF export failed', err);
      alert('PDF yaratishda xatolik yuz berdi. Iltimos qayta urinib ko\u2018ring.');
    } finally {
      btn.disabled = false;
      btn.textContent = '📄 Hammasini PDF qilib yuklab olish';
    }
  }

  /* ---------------- init ---------------- */
  document.addEventListener('DOMContentLoaded', function () {
    renderPodGrid();
    renderNoteGrid();
    updateOverview();
    var exportBtn = document.getElementById('lpExportPdfBtn');
    if (exportBtn) exportBtn.addEventListener('click', exportPdf);
  });
})();
