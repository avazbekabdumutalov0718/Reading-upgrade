async function loadProgressHistory() {
  const rowsEl = document.getElementById('progressRows');
  const emptyEl = document.getElementById('progressEmpty');
  const tableEl = document.getElementById('progressTable');
  const countEl = document.getElementById('progressCount');
  const badgeEl = document.getElementById('progressBadge');

  if (!rowsEl || !emptyEl || !tableEl) return;

  try {
    const readingResults = typeof VividDB !== 'undefined' && typeof VividDB.getReadingResults === 'function'
      ? await VividDB.getReadingResults()
      : [];
    const grammarProgress = typeof VividDB !== 'undefined' && typeof VividDB.getGrammarProgress === 'function'
      ? await VividDB.getGrammarProgress()
      : {};
    const articleProgress = typeof VividDB !== 'undefined' && typeof VividDB.loadUserState === 'function'
      ? await VividDB.loadUserState('article_progress', [])
      : [];
    const collocationProgress = typeof VividDB !== 'undefined' && typeof VividDB.getCollocationProgress === 'function'
      ? await VividDB.getCollocationProgress()
      : {};

    const history = [];
    readingResults.forEach((row) => {
      history.push({
        type: 'reading',
        title: row.test_id || row.testId || 'Reading test',
        date: row.completed_at || row.completedAt || new Date().toISOString(),
        detail: `${row.score ?? 0}/${row.total ?? 0} correct`,
      });
    });

    Object.entries(grammarProgress).forEach(([tenseId, item]) => {
      if (!item?.passed) return;
      const lesson = (window.GRAMMAR_TENSES || []).find((t) => String(t.id) === String(tenseId));
      history.push({
        type: 'grammar',
        title: lesson?.name || `Grammar lesson ${tenseId}`,
        date: item.updated_at || new Date().toISOString(),
        detail: 'Completed',
      });
    });

    (articleProgress || []).forEach((item) => {
      history.push({
        type: 'article',
        title: item.title || 'Article',
        date: item.completed_at || new Date().toISOString(),
        detail: 'Read',
      });
    });

    Object.entries(collocationProgress || {}).forEach(([unitId, item]) => {
      history.push({
        type: 'collocation',
        title: item?.title ? `Collocations • ${item.title}` : `Collocations Unit ${unitId}`,
        date: item?.completed_at || new Date().toISOString(),
        detail: 'Completed',
      });
    });

    history.sort((a, b) => new Date(b.date) - new Date(a.date));

    if (!history.length) {
      emptyEl.hidden = false;
      tableEl.hidden = true;
      if (countEl) countEl.textContent = '0 completed';
      if (badgeEl) badgeEl.textContent = '0 completed';
      return;
    }

    emptyEl.hidden = true;
    tableEl.hidden = false;
    rowsEl.innerHTML = history.map((row) => {
      const formattedDate = new Date(row.date).toLocaleString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });
      return `
        <tr>
          <td>${row.title}</td>
          <td>${formattedDate}</td>
          <td>${row.detail}</td>
        </tr>`;
    }).join('');

    const countText = `${history.length} completed`;
    if (countEl) countEl.textContent = countText;
    if (badgeEl) badgeEl.textContent = countText;
  } catch (err) {
    console.error('Failed to load progress history:', err);
  }
}

loadProgressHistory();
