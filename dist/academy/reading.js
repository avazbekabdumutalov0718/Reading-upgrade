(() => {
  const readingDatabase = {
    single: [
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
      { id: "imported-passage-01", title: "Australia's Airborne Dentists", part: "Passage 1", questions: 13, href: "reading-passages/passage-01.html" },
      { id: "imported-passage-02", title: "When people are ‘deaf’ to music", part: "Passage 3", questions: 14, href: "reading-passages/passage-02.html" },
      { id: "imported-passage-03", title: "How to be Happy", part: "Passage 2", questions: 13, href: "reading-passages/passage-03.html" },
      { id: "imported-passage-04", title: "Mind Music", part: "Passage 2", questions: 13, href: "reading-passages/passage-04.html" },
      { id: "imported-passage-05", title: "The early history of olive oil", part: "Passage 1", questions: 13, href: "reading-passages/passage-05.html" },
      { id: "imported-passage-06", title: "Optimism and Health", part: "Passage 1", questions: 13, href: "reading-passages/passage-06.html" },
      { id: "imported-passage-07", title: "The origin of language", part: "Passage 3", questions: 14, href: "reading-passages/passage-07.html" },
      { id: "imported-passage-08", title: "Reef Fish Study", part: "Passage 1", questions: 13, href: "reading-passages/passage-08.html" },
      { id: "imported-passage-09", title: "Liquorice", part: "Passage 1", questions: 16, href: "reading-passages/passage-09.html" },
      { id: "imported-passage-10", title: "Memory in Plants", part: "Passage 2", questions: 16, href: "reading-passages/passage-10.html" },
      { id: "imported-passage-11", title: "Decision Fatigue", part: "Passage 2", questions: 13, href: "reading-passages/passage-11.html" },
      { id: "imported-passage-12", title: "Will Eating Less Make You Live Longer?", part: "Passage 2", questions: 13, href: "reading-passages/passage-12.html" },
      { id: "imported-passage-13", title: "The importance of icebergs to ocean life", part: "Passage 2", questions: 16, href: "reading-passages/passage-13.html" },
      { id: "imported-passage-14", title: "How do plants talk to each other?", part: "Passage 2", questions: 13, href: "reading-passages/passage-14.html" },
      { id: "imported-passage-15", title: "Practical Learning in the Classroom", part: "Passage 3", questions: 14, href: "reading-passages/passage-15.html" },
      { id: "imported-passage-16", title: "Redesigning the Cleveland Museum of Art", part: "Passage 3", questions: 17, href: "reading-passages/passage-16.html" },
      { id: "imported-passage-17", title: "Seeing the colour of sounds, hearing the colour of numbers When the senses mix together", part: "Passage 3", questions: 14, href: "reading-passages/passage-17.html" },
      { id: "imported-passage-18", title: "The benefits of learning an instrument", part: "Passage 3", questions: 14, href: "reading-passages/passage-18.html" },
      { id: "imported-passage-19", title: "The History of Pencil", part: "Passage 1", questions: 13, href: "reading-passages/passage-19.html" },
      { id: "imported-passage-20", title: "The Importance of Law", part: "Passage 2", questions: 13, href: "reading-passages/passage-20.html" },
      { id: "imported-passage-21", title: "The significant role of mother tongue language in education", part: "Passage 3", questions: 14, href: "reading-passages/passage-21.html" },
      { id: "imported-passage-22", title: "The Voynich Manuscript", part: "Passage 3", questions: 14, href: "reading-passages/passage-22.html" },
      { id: "imported-passage-23", title: "The Whale Goes to Court", part: "Passage 1", questions: 13, href: "reading-passages/passage-23.html" },
      { id: "imported-passage-24", title: "Why don't we sleep?", part: "Passage 2", questions: 13, href: "reading-passages/passage-24.html" },
      { id: "imported-passage-25", title: "William Gilbert and Magnetism", part: "Passage 1", questions: 13, href: "reading-passages/passage-25.html" },
      {"id": "new-reading-01-p1", "title": "Starting school later has positive effects on teens (Mock 01)", "part": "Passage 1", "questions": 13, "href": "imported-reading/exam.html?test=new-reading-01&part=1", "free": true},
      {"id": "new-reading-01-p2", "title": "Born to trade (Mock 01)", "part": "Passage 2", "questions": 13, "href": "imported-reading/exam.html?test=new-reading-01&part=2", "free": true},
      {"id": "new-reading-01-p3", "title": "New Zealand home textile crafts of the 1930s to 1950s (Mock 01)", "part": "Passage 3", "questions": 14, "href": "imported-reading/exam.html?test=new-reading-01&part=3", "free": true},
      {"id": "new-reading-02-p1", "title": "Traditional Maori Medicine (Mock 02)", "part": "Passage 1", "questions": 13, "href": "imported-reading/exam.html?test=new-reading-02&part=1", "free": true},
      {"id": "new-reading-02-p2", "title": "Classical Music Over the Centuries (Mock 02)", "part": "Passage 2", "questions": 13, "href": "imported-reading/exam.html?test=new-reading-02&part=2", "free": true},
      {"id": "new-reading-02-p3", "title": "Mapping the Mind (Mock 02)", "part": "Passage 3", "questions": 14, "href": "imported-reading/exam.html?test=new-reading-02&part=3", "free": true},
      {"id": "new-reading-03-p1", "title": "How to find your way out of a food desert (Mock 03)", "part": "Passage 1", "questions": 13, "href": "imported-reading/exam.html?test=new-reading-03&part=1", "free": true},
      {"id": "new-reading-03-p2", "title": "The dingo debate (Mock 03)", "part": "Passage 2", "questions": 13, "href": "imported-reading/exam.html?test=new-reading-03&part=2", "free": true},
      {"id": "new-reading-03-p3", "title": "Pacific navigation and voyaging (Mock 03)", "part": "Passage 3", "questions": 14, "href": "imported-reading/exam.html?test=new-reading-03&part=3", "free": true},
      {"id": "new-reading-04-p1", "title": "The Importance of Business Cards (Mock 04)", "part": "Passage 1", "questions": 13, "href": "imported-reading/exam.html?test=new-reading-04&part=1", "free": true},
      {"id": "new-reading-04-p2", "title": "The Importance of Law (Mock 04)", "part": "Passage 2", "questions": 13, "href": "imported-reading/exam.html?test=new-reading-04&part=2", "free": true},
      {"id": "new-reading-04-p3", "title": "The Voynich Manuscript (Mock 04)", "part": "Passage 3", "questions": 14, "href": "imported-reading/exam.html?test=new-reading-04&part=3", "free": true},
      {"id": "new-reading-05-p1", "title": "A survivor’s story (Mock 05)", "part": "Passage 1", "questions": 13, "href": "imported-reading/exam.html?test=new-reading-05&part=1", "free": true},
      {"id": "new-reading-05-p2", "title": "Ideal Homes (Mock 05)", "part": "Passage 2", "questions": 13, "href": "imported-reading/exam.html?test=new-reading-05&part=2", "free": true},
      {"id": "new-reading-05-p3", "title": "Conformity (Mock 05)", "part": "Passage 3", "questions": 14, "href": "imported-reading/exam.html?test=new-reading-05&part=3", "free": true},
      {"id": "new-reading-06-p1", "title": "The history of the pencil (Mock 06)", "part": "Passage 1", "questions": 13, "href": "imported-reading/exam.html?test=new-reading-06&part=1", "free": true},
      {"id": "new-reading-06-p2", "title": "Olympic athletes: increasingly dependent on technology to help them win? (Mock 06)", "part": "Passage 2", "questions": 13, "href": "imported-reading/exam.html?test=new-reading-06&part=2", "free": true},
      {"id": "new-reading-06-p3", "title": "Theories of planet formation questioned (Mock 06)", "part": "Passage 3", "questions": 14, "href": "imported-reading/exam.html?test=new-reading-06&part=3", "free": true},
      {"id": "new-reading-07-p1", "title": "New perspectives on food production (Mock 07)", "part": "Passage 1", "questions": 13, "href": "imported-reading/exam.html?test=new-reading-07&part=1", "free": true},
      {"id": "new-reading-07-p2", "title": "Egypt’s ancient boat-builders (Mock 07)", "part": "Passage 2", "questions": 13, "href": "imported-reading/exam.html?test=new-reading-07&part=2", "free": true},
      {"id": "new-reading-07-p3", "title": "The communication of science (Mock 07)", "part": "Passage 3", "questions": 14, "href": "imported-reading/exam.html?test=new-reading-07&part=3", "free": true},
      {"id": "new-reading-08-p1", "title": "Classifying Societies (Mock 08)", "part": "Passage 1", "questions": 13, "href": "imported-reading/exam.html?test=new-reading-08&part=1", "free": true},
      {"id": "new-reading-08-p2", "title": "Corporate Social Responsibility (Mock 08)", "part": "Passage 2", "questions": 13, "href": "imported-reading/exam.html?test=new-reading-08&part=2", "free": true},
      {"id": "new-reading-08-p3", "title": "Amateur Naturalists (Mock 08)", "part": "Passage 3", "questions": 14, "href": "imported-reading/exam.html?test=new-reading-08&part=3", "free": true},
      {"id": "new-reading-09-p1", "title": "When Maps Were Made for the Public (Mock 09)", "part": "Passage 1", "questions": 13, "href": "imported-reading/exam.html?test=new-reading-09&part=1", "free": true},
      {"id": "new-reading-09-p2", "title": "Preserving Antarctic History (Mock 09)", "part": "Passage 2", "questions": 13, "href": "imported-reading/exam.html?test=new-reading-09&part=2", "free": true},
      {"id": "new-reading-09-p3", "title": "Flower Power (Mock 09)", "part": "Passage 3", "questions": 14, "href": "imported-reading/exam.html?test=new-reading-09&part=3", "free": true},
      {"id": "new-reading-10-p1", "title": "The Formation of Continents and the Evolution of Species (Mock 10)", "part": "Passage 1", "questions": 13, "href": "imported-reading/exam.html?test=new-reading-10&part=1", "free": true},
      {"id": "new-reading-10-p2", "title": "Demystifying Yawn (Mock 10)", "part": "Passage 2", "questions": 13, "href": "imported-reading/exam.html?test=new-reading-10&part=2", "free": true},
      {"id": "new-reading-10-p3", "title": "Incorrect Terminology in Science (Mock 10)", "part": "Passage 3", "questions": 14, "href": "imported-reading/exam.html?test=new-reading-10&part=3", "free": true},
      {"id": "new-reading-11-p1", "title": "A Brief History of Glassmaking (Mock 11)", "part": "Passage 1", "questions": 13, "href": "imported-reading/exam.html?test=new-reading-11&part=1", "free": true},
      {"id": "new-reading-11-p2", "title": "The return of the black-footed ferret (Mock 11)", "part": "Passage 2", "questions": 13, "href": "imported-reading/exam.html?test=new-reading-11&part=2", "free": true},
      {"id": "new-reading-11-p3", "title": "Rights for apes (Mock 11)", "part": "Passage 3", "questions": 14, "href": "imported-reading/exam.html?test=new-reading-11&part=3", "free": true},
      {"id": "new-reading-12-p1", "title": "Sleep Study on Modern-Day Hunter-Gatherers Dispels Popular Notions (Mock 12)", "part": "Passage 1", "questions": 13, "href": "imported-reading/exam.html?test=new-reading-12&part=1", "free": true},
      {"id": "new-reading-12-p2", "title": "Bristlecone Pines (Mock 12)", "part": "Passage 2", "questions": 13, "href": "imported-reading/exam.html?test=new-reading-12&part=2", "free": true},
      {"id": "new-reading-12-p3", "title": "Loss of Rare Languages (Mock 12)", "part": "Passage 3", "questions": 14, "href": "imported-reading/exam.html?test=new-reading-12&part=3", "free": true},
      {"id": "new-reading-13-p1", "title": "Renewable Energy (Mock 13)", "part": "Passage 1", "questions": 13, "href": "imported-reading/exam.html?test=new-reading-13&part=1", "free": true},
      {"id": "new-reading-13-p2", "title": "The Fruit Book (Mock 13)", "part": "Passage 2", "questions": 13, "href": "imported-reading/exam.html?test=new-reading-13&part=2", "free": true},
      {"id": "new-reading-13-p3", "title": "Petrol power: an eco-revolution? (Mock 13)", "part": "Passage 3", "questions": 14, "href": "imported-reading/exam.html?test=new-reading-13&part=3", "free": true},
      {"id": "new-passage-01", "title": "Ambergris – what is it and where does it come from?", "part": "Passage 1", "questions": 13, "href": "imported-reading/exam.html?test=new-passage-01", "free": true},
      {"id": "new-passage-02", "title": "The plan to bring an asteroid to Earth", "part": "Passage 2", "questions": 13, "href": "imported-reading/exam.html?test=new-passage-02", "free": true},
      {"id": "new-passage-03", "title": "Dark Chocolate’s Health-giving Benefits", "part": "Passage 2", "questions": 13, "href": "imported-reading/exam.html?test=new-passage-03", "free": true},
      {"id": "new-passage-04", "title": "Growing More for Less", "part": "Passage 2", "questions": 13, "href": "imported-reading/exam.html?test=new-passage-04", "free": true},
      {"id": "new-passage-05", "title": "Some views on the use of headphones", "part": "Passage 3", "questions": 14, "href": "imported-reading/exam.html?test=new-passage-05", "free": true},
      {"id": "new-passage-06", "title": "Marketing and the information age", "part": "Passage 3", "questions": 14, "href": "imported-reading/exam.html?test=new-passage-06", "free": true},
      {"id": "new-passage-07", "title": "The Origins of Cinema", "part": "Passage 1", "questions": 13, "href": "imported-reading/exam.html?test=new-passage-07", "free": true},
      {"id": "new-passage-08", "title": "Effect and Cause", "part": "Passage 1", "questions": 13, "href": "imported-reading/exam.html?test=new-passage-08", "free": true},
      {"id": "new-passage-09", "title": "In Deep Water", "part": "Passage 1", "questions": 13, "href": "imported-reading/exam.html?test=new-passage-09", "free": true},
      {"id": "new-passage-10", "title": "Libraries", "part": "Passage 2", "questions": 13, "href": "imported-reading/exam.html?test=new-passage-10", "free": true},
      {"id": "new-passage-11", "title": "Australia's Megafauna Controversy", "part": "Passage 3", "questions": 14, "href": "imported-reading/exam.html?test=new-passage-11", "free": true},
      {"id": "new-passage-12", "title": "Termite Mounds", "part": "Passage 3", "questions": 14, "href": "imported-reading/exam.html?test=new-passage-12", "free": true},
    ],
    full: [
      { id: "imported-mock-01", title: "Cranberry Fruit / Dark Chocolate's Health-giving Benefits / All in the family", part: "Full Reading Test", questions: 40, href: "reading-passages/mock-01.html" },
      { id: "imported-mock-02", title: "Effect and Cause / Australia's camouflaged creatures / The Pirahã people of Brazil", part: "Full Reading Test", questions: 40, href: "reading-passages/mock-02.html" },
      { id: "imported-mock-03", title: "The Origin of Paper / The Myth of the Eight-hour Sleep / The art of deception", part: "Full Reading Test", questions: 40, href: "reading-passages/mock-03.html" },
      { id: "imported-mock-04", title: "James Hargreaves and the Spinning Jenny / The Remarkable Power of Placebos / Practical Learning in the Classroom", part: "Full Reading Test", questions: 40, href: "reading-passages/mock-04.html" },
      { id: "imported-mock-05", title: "The culture of Chimpanzee! / Numeracy: can animals tell numbers? / Company Innovation", part: "Full Reading Test", questions: 40, href: "reading-passages/mock-05.html" },
      { id: "imported-mock-06", title: "Insects and Inspired Artificial Robots / Extinction of Aussie Animals / Amateur Naturalists", part: "Full Reading Test", questions: 40, href: "reading-passages/mock-06.html" },
      { id: "imported-mock-07", title: "THE SEED HUNTERS / Bees and Pollination / The Strange World of Sight", part: "Full Reading Test", questions: 40, href: "reading-passages/mock-07.html" },
      {"id": "new-reading-01", "title": "Starting school later has positive effects on teens / Born to trade / New Zealand home textile crafts of the 1930s to 1950s", "part": "Full Reading Test", "questions": 40, "href": "imported-reading/exam.html?test=new-reading-01", "free": true},
      {"id": "new-reading-02", "title": "Traditional Maori Medicine / Classical Music Over the Centuries / Mapping the Mind", "part": "Full Reading Test", "questions": 40, "href": "imported-reading/exam.html?test=new-reading-02", "free": true},
      {"id": "new-reading-03", "title": "How to find your way out of a food desert / The dingo debate / Pacific navigation and voyaging", "part": "Full Reading Test", "questions": 40, "href": "imported-reading/exam.html?test=new-reading-03", "free": true},
      {"id": "new-reading-04", "title": "The Importance of Business Cards / The Importance of Law / The Voynich Manuscript", "part": "Full Reading Test", "questions": 40, "href": "imported-reading/exam.html?test=new-reading-04", "free": true},
      {"id": "new-reading-05", "title": "A survivor’s story / Ideal Homes / Conformity", "part": "Full Reading Test", "questions": 40, "href": "imported-reading/exam.html?test=new-reading-05", "free": true},
      {"id": "new-reading-06", "title": "The history of the pencil / Olympic athletes: increasingly dependent on technology to help them win? / Theories of planet formation questioned", "part": "Full Reading Test · 2 answers unavailable", "questions": 40, "href": "imported-reading/exam.html?test=new-reading-06", "free": true},
      {"id": "new-reading-07", "title": "New perspectives on food production / Egypt’s ancient boat-builders / The communication of science", "part": "Full Reading Test", "questions": 40, "href": "imported-reading/exam.html?test=new-reading-07", "free": true},
      {"id": "new-reading-08", "title": "Classifying Societies / Corporate Social Responsibility / Amateur Naturalists", "part": "Full Reading Test", "questions": 40, "href": "imported-reading/exam.html?test=new-reading-08", "free": true},
      {"id": "new-reading-09", "title": "When Maps Were Made for the Public / Preserving Antarctic History / Flower Power", "part": "Full Reading Test", "questions": 40, "href": "imported-reading/exam.html?test=new-reading-09", "free": true},
      {"id": "new-reading-10", "title": "The Formation of Continents and the Evolution of Species / Demystifying Yawn / Incorrect Terminology in Science", "part": "Full Reading Test", "questions": 40, "href": "imported-reading/exam.html?test=new-reading-10", "free": true},
      {"id": "new-reading-11", "title": "A Brief History of Glassmaking / The return of the black-footed ferret / Rights for apes", "part": "Full Reading Test", "questions": 40, "href": "imported-reading/exam.html?test=new-reading-11", "free": true},
      {"id": "new-reading-12", "title": "Sleep Study on Modern-Day Hunter-Gatherers Dispels Popular Notions / Bristlecone Pines / Loss of Rare Languages", "part": "Full Reading Test", "questions": 40, "href": "imported-reading/exam.html?test=new-reading-12", "free": true},
      {"id": "new-reading-13", "title": "Renewable Energy / The Fruit Book / Petrol power: an eco-revolution?", "part": "Full Reading Test", "questions": 40, "href": "imported-reading/exam.html?test=new-reading-13", "free": true}
    ]
  };

  const articleDatabase = [
    { id: 'article-1', title: 'Healing Outdoors: How Nature Helps Us Process Loss', meta: 'Article 1 · B2–C1 · 6 min read', description: 'Highlight, notes, live dictionary + 20-word vocab test', href: 'article-1.html' },
    { id: 'article-2', title: 'Post-Workout Nutrition: Simple Pillars for Recovery', meta: 'Article 2 · B2–C1 · 6 min read', description: 'Science-based reading with vocabulary clues and notes', href: 'article-2.html' },
    { id: 'article-3', title: 'How Hot Weather Accelerates Biological Ageing', meta: 'Article 3 · C1 · 6 min read', description: 'Academic style text with a short vocabulary practice round', href: 'article-3.html' },
    { id: 'article-4', title: 'Couples Who Cope Together, Stay Together', meta: 'Article 4 · B2–C1 · 6 min read', description: 'Relationship and wellbeing reading with highlighting tools', href: 'article-4.html' },
    { id: 'article-5', title: 'The Carbon-Free Energy of the Future: Fusion Breakthrough', meta: 'Article 5 · C1–C2 · 7 min read', description: 'Nuclear fusion breakthrough report from The Guardian with C1 vocabulary', href: 'article-5.html' }
  ];

  function getCompletedSet() {
    try {
      return new Set(JSON.parse(localStorage.getItem('vivid_reading_completed') || '[]'));
    } catch (e) {
      return new Set();
    }
  }

  const state = { view: 'home', stack: [], searchTerm: '', category: 'single' };

  const navRoot = document.getElementById('readingNavigator');
  const backBtn = document.getElementById('readingBackBtn');

  function renderHome() {
    navRoot.innerHTML = `
      <div class="reading-landing-grid">
        <button class="reading-landing-card" type="button" data-view="single" style="text-align:left; cursor:pointer; border:1px solid var(--line);">
          <span class="eyebrow">Reading Real Exam Practice</span>
          <h3>All Passages</h3>
          <p>Single-passage practice from the reading database</p>
          <span class="cta">Open practice →</span>
        </button>


        <button class="reading-landing-card" type="button" data-view="full" style="text-align:left; cursor:pointer; border:1px solid var(--line);">
          <span class="eyebrow">Full Reading Practice</span>
          <h3>Full mock tests</h3>
          <p>Three passages and 40 questions in each test</p>
          <span class="cta">Open mock tests →</span>
        </button>

        <button class="reading-landing-card" type="button" data-view="articles" style="text-align:left; cursor:pointer; border:1px solid var(--line);">
          <span class="eyebrow">Article</span>
          <h3>Independent reading articles</h3>
          <p>Short academic-style articles with notes and vocabulary support</p>
          <span class="cta">Open articles →</span>
        </button>

        <a class="reading-landing-card" href="reading-rocket/index.html">
          <span class="eyebrow">Interactive Booster</span>
          <h3>Avazbek Reader Booster</h3>
          <p>30 passages, interactive audio, flashcards and 7 full mock tests</p>
          <span class="cta">Open booster →</span>
        </a>
      </div>
    `;

    navRoot.querySelectorAll('[data-view]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-view');
        state.stack.push({ view: 'home' });
        if (target === 'single' || target === 'full') {
          state.category = target;
          state.searchTerm = '';
          state.view = 'single';
          renderSingle();
        } else if (target === 'articles') {
          state.view = 'articles';
          renderArticles();
        }
      });
    });
  }

  function renderSingle() {
    const completed = getCompletedSet();
    const isFull = state.category === 'full';
    const database = isFull ? readingDatabase.full : readingDatabase.single;

    navRoot.innerHTML = `
      <div class="reading-toptabs">
        <button class="reading-toptab ${isFull ? '' : 'active'}" type="button" data-category="single">Passages</button>
        <button class="reading-toptab ${isFull ? 'active' : ''}" type="button" data-category="full">Full mock (${readingDatabase.full.length})</button>
      </div>

      <div class="reading-subtabs">
        <span class="reading-subtab active">📖 Reading</span>
      </div>

      <div class="reading-toolbar">
        <div class="reading-search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
          <input type="text" id="passageSearchInput" placeholder="Search passages by title...">
        </div>
        <select class="reading-filter" id="passageSortSelect">
          <option value="default">Default order</option>
          <option value="az">Title A–Z</option>
        </select>
      </div>

      <div class="reading-section-title">${isFull ? 'Full Reading Mock Tests' : 'Reading Question Sets'}</div>
      <div class="ielts-card-grid" id="passageCardGrid"></div>
    `;

    function renderCards() {
      const grid = document.getElementById('passageCardGrid');
      const term = state.searchTerm.trim().toLowerCase();
      let items = database.filter((item) =>
        !term || item.title.toLowerCase().includes(term)
      );

      const sortSelect = document.getElementById('passageSortSelect');
      if (sortSelect && sortSelect.value === 'az') {
        items = [...items].sort((a, b) => a.title.localeCompare(b.title));
      }

      if (items.length === 0) {
        grid.innerHTML = `<p style="color:var(--ink-soft); grid-column:1/-1;">Hech narsa topilmadi.</p>`;
        return;
      }

      grid.innerHTML = items.map((item) => {
        const originalIdx = database.indexOf(item);
        const isFree = item.free === true || (!isFull && originalIdx < 2);
        const done = completed.has(item.id);
        return `
          <a href="${item.href}" class="ielts-card" ${isFree ? '' : 'data-premium-only'}>
            <div class="ielts-card-top">
              <span class="ielts-card-day">${isFull ? 'Mock' : 'Day'} ${originalIdx + 1}: ${item.title}</span>
              ${done ? '<span class="ielts-badge done">Done</span>' : isFree ? '<span class="ielts-badge free">Free</span>' : '<span class="ielts-badge premium">Premium</span>'}
            </div>
            <span class="ielts-card-part">${item.part} · ${item.questions} questions</span>
            ${done ? '<span class="ielts-card-done">✓ Completed</span>' : ''}
          </a>
        `;
      }).join('');

      if (typeof applyPremiumLocks === 'function') applyPremiumLocks();
    }

    navRoot.querySelectorAll('[data-category]').forEach((tab) => {
      tab.addEventListener('click', () => {
        state.category = tab.dataset.category;
        state.searchTerm = '';
        renderSingle();
      });
    });

    renderCards();

    const searchInput = document.getElementById('passageSearchInput');
    searchInput.addEventListener('input', (e) => {
      state.searchTerm = e.target.value;
      renderCards();
    });

    const sortSelect = document.getElementById('passageSortSelect');
    sortSelect.addEventListener('change', renderCards);
  }

  function renderArticles() {
    navRoot.innerHTML = `
      <div class="reading-section-title">Independent Reading Articles</div>
      <div class="ielts-card-grid">
        ${articleDatabase.map((article) => `
          <a href="${article.href}" class="ielts-card">
            <div class="ielts-card-top">
              <span class="ielts-card-day">${article.title}</span>
              <span class="ielts-badge free">Free</span>
            </div>
            <span class="ielts-card-part">${article.meta}</span>
          </a>
        `).join('')}
      </div>
    `;
  }

  function renderCurrentView() {
    if (!navRoot) return;

    if (state.view === 'home') {
      if (backBtn) backBtn.style.display = 'none';
      renderHome();
      return;
    }

    if (state.view === 'articles') {
      if (backBtn) backBtn.style.display = 'inline-flex';
      renderArticles();
      return;
    }

    if (state.view === 'single') {
      if (backBtn) backBtn.style.display = 'inline-flex';
      renderSingle();
    }
  }

  if (backBtn) {
    backBtn.addEventListener('click', () => {
      state.searchTerm = '';
      if (state.stack.length > 0) {
        const previous = state.stack.pop();
        state.view = previous.view;
        renderCurrentView();
        return;
      }
      state.view = 'home';
      renderCurrentView();
    });
  }

  renderCurrentView();
})();
