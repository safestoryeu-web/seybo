/* CompTIA Security+ Study App — main logic */
(function() {
'use strict';

const { DOMAINS, CHAPTERS, QUESTIONS } = window.SY701;

/* ============================== State ============================== */
const STORAGE_KEY = 'sy701_state_v1';

const defaultState = {
  read: {},        // { chapterId: timestamp }
  testHistory: [], // [{ ts, total, correct, byDomain: {1:{c,t}, ...}, durationSec, domains:[1,2..] }]
  questionStats: {}, // { qid: { seen, correct } }
  flagged: {},     // { qid: true } - for review
};

let state = loadState();
let currentTab = 'learn';
let route = { name: 'learn-home' };
let testSession = null;

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return Object.assign({}, defaultState, parsed);
    }
  } catch (e) { console.warn('Could not load state', e); }
  return JSON.parse(JSON.stringify(defaultState));
}
function saveState() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
  catch (e) { console.warn('Could not save state', e); }
}

/* ============================== Utilities ============================== */
function $(sel, root) { return (root || document).querySelector(sel); }
function $$(sel, root) { return Array.from((root || document).querySelectorAll(sel)); }
function escHtml(s) {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function fmtDate(ts) {
  const d = new Date(ts);
  const now = Date.now();
  const diff = (now - ts) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return Math.floor(diff/60) + ' min ago';
  if (diff < 86400) return Math.floor(diff/3600) + ' h ago';
  if (diff < 604800) return Math.floor(diff/86400) + ' d ago';
  return d.toLocaleDateString();
}
function fmtDuration(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2,'0')}`;
}

/* Lightweight markdown -> HTML for chapter body */
function md(src) {
  // Split into blocks by blank lines
  const lines = src.split('\n');
  const html = [];
  let i = 0;

  function isTableLine(s) { return /^\|.*\|/.test(s); }

  while (i < lines.length) {
    const line = lines[i];

    // Heading
    if (/^##\s+/.test(line)) {
      html.push('<h2>' + inline(line.replace(/^##\s+/, '')) + '</h2>');
      i++; continue;
    }
    if (/^###\s+/.test(line)) {
      html.push('<h3>' + inline(line.replace(/^###\s+/, '')) + '</h3>');
      i++; continue;
    }
    // Blockquote
    if (/^>\s?/.test(line)) {
      const buf = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        buf.push(lines[i].replace(/^>\s?/, ''));
        i++;
      }
      html.push('<blockquote>' + inline(buf.join(' ')) + '</blockquote>');
      continue;
    }
    // Table (markdown)
    if (isTableLine(line) && i + 1 < lines.length && /^\|[\s\-|:]+\|/.test(lines[i+1])) {
      const headerCells = line.split('|').slice(1, -1).map(s => s.trim());
      i += 2;
      const rows = [];
      while (i < lines.length && isTableLine(lines[i])) {
        rows.push(lines[i].split('|').slice(1, -1).map(s => s.trim()));
        i++;
      }
      let t = '<table><thead><tr>' +
        headerCells.map(h => `<th>${inline(h)}</th>`).join('') +
        '</tr></thead><tbody>';
      rows.forEach(r => {
        t += '<tr>' + r.map(c => `<td>${inline(c)}</td>`).join('') + '</tr>';
      });
      t += '</tbody></table>';
      html.push(t);
      continue;
    }
    // Numbered list
    if (/^\d+\.\s+/.test(line)) {
      const buf = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
        buf.push('<li>' + inline(lines[i].replace(/^\d+\.\s+/, '')) + '</li>');
        i++;
      }
      html.push('<ol>' + buf.join('') + '</ol>');
      continue;
    }
    // Bullet list
    if (/^\*\s+/.test(line)) {
      const buf = [];
      while (i < lines.length && /^\*\s+/.test(lines[i])) {
        let item = lines[i].replace(/^\*\s+/, '');
        // Continuation lines (start with two spaces or hyphens)
        i++;
        while (i < lines.length && /^\s{2,}-?\s+/.test(lines[i])) {
          item += '<br>' + lines[i].trim();
          i++;
        }
        buf.push('<li>' + inline(item) + '</li>');
      }
      html.push('<ul>' + buf.join('') + '</ul>');
      continue;
    }
    // Blank
    if (/^\s*$/.test(line)) { i++; continue; }
    // Paragraph
    const buf = [];
    while (i < lines.length && !/^\s*$/.test(lines[i])
        && !/^##\s+/.test(lines[i]) && !/^###\s+/.test(lines[i])
        && !/^\*\s+/.test(lines[i]) && !/^\d+\.\s+/.test(lines[i])
        && !/^>\s?/.test(lines[i]) && !isTableLine(lines[i])) {
      buf.push(lines[i]);
      i++;
    }
    html.push('<p>' + inline(buf.join(' ')) + '</p>');
  }

  return html.join('\n');

  function inline(s) {
    return escHtml(s)
      .replace(/`([^`]+)`/g, (_, x) => `<code>${x}</code>`)
      .replace(/\*\*([^*]+)\*\*/g, (_, x) => `<strong>${x}</strong>`)
      .replace(/\*([^*]+)\*/g, (_, x) => `<em>${x}</em>`);
  }
}

function toast(msg) {
  const old = $('.toast');
  if (old) old.remove();
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; el.style.transition = 'opacity 0.3s'; }, 1500);
  setTimeout(() => el.remove(), 1900);
}

function modal(title, body, actions) {
  const bg = document.createElement('div');
  bg.className = 'modal-bg';
  bg.innerHTML = `
    <div class="modal">
      <h3>${escHtml(title)}</h3>
      <p>${escHtml(body)}</p>
      <div class="modal-actions">
        ${actions.map((a, i) => `<button class="btn ${a.style || ''}" data-i="${i}">${escHtml(a.label)}</button>`).join('')}
      </div>
    </div>`;
  document.body.appendChild(bg);
  bg.addEventListener('click', e => {
    if (e.target === bg) bg.remove();
    const btn = e.target.closest('button');
    if (btn) {
      const idx = parseInt(btn.dataset.i, 10);
      bg.remove();
      if (actions[idx].onClick) actions[idx].onClick();
    }
  });
}

/* Donut chart SVG */
function donutSvg(pct, color, size) {
  size = size || 50;
  const r = (size - 8) / 2;
  const c = 2 * Math.PI * r;
  const dash = (pct / 100) * c;
  return `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
    <circle cx="${size/2}" cy="${size/2}" r="${r}" class="donut-track" />
    <circle cx="${size/2}" cy="${size/2}" r="${r}" class="donut-fill" stroke="${color}"
      stroke-dasharray="${dash} ${c}" />
    <text x="${size/2}" y="${size/2}" class="donut-text">${Math.round(pct)}%</text>
  </svg>`;
}

/* ============================== Routing ============================== */
function setTab(tab) {
  currentTab = tab;
  $$('nav.bottom-nav button').forEach(b => {
    b.classList.toggle('active', b.dataset.nav === tab);
  });
  if (tab === 'learn') route = { name: 'learn-home' };
  if (tab === 'test') route = { name: 'test-home' };
  if (tab === 'score') route = { name: 'score-home' };
  render();
  window.scrollTo({ top: 0 });
}

function navigate(name, params) {
  route = { name, params };
  render();
  window.scrollTo({ top: 0 });
}

/* ============================== Stats helpers ============================== */
function chaptersForDomain(d) {
  return CHAPTERS.filter(c => c.domain === d);
}
function questionsForDomain(d) {
  return QUESTIONS.filter(q => q.domain === d);
}
function readPctForDomain(d) {
  const ch = chaptersForDomain(d);
  if (ch.length === 0) return 0;
  const r = ch.filter(c => state.read[c.id]).length;
  return (r / ch.length) * 100;
}
function readCount() {
  return CHAPTERS.filter(c => state.read[c.id]).length;
}
function questionAccuracyForDomain(d) {
  const qs = questionsForDomain(d);
  let seen = 0, correct = 0;
  qs.forEach(q => {
    const s = state.questionStats[q.id];
    if (s && s.seen > 0) {
      seen += s.seen;
      correct += s.correct;
    }
  });
  return { seen, correct, pct: seen > 0 ? (correct/seen)*100 : 0, total: qs.length };
}
function overallAccuracy() {
  let seen = 0, correct = 0;
  Object.values(state.questionStats).forEach(s => { seen += s.seen; correct += s.correct; });
  return { seen, correct, pct: seen > 0 ? (correct/seen)*100 : 0 };
}
function recordAnswer(qid, isCorrect) {
  if (!state.questionStats[qid]) state.questionStats[qid] = { seen: 0, correct: 0 };
  state.questionStats[qid].seen += 1;
  if (isCorrect) state.questionStats[qid].correct += 1;
}

/* ============================== Render ============================== */
function render() {
  const root = $('#view-root');
  root.innerHTML = '';
  if (currentTab === 'learn') {
    if (route.name === 'learn-home') return renderLearnHome(root);
    if (route.name === 'chapter') return renderChapter(root, route.params.id);
  }
  if (currentTab === 'test') {
    if (route.name === 'test-home') return renderTestHome(root);
    if (route.name === 'test-running') return renderTestRunning(root);
    if (route.name === 'test-results') return renderTestResults(root);
  }
  if (currentTab === 'score') return renderScore(root);
}

/* ====== Learn home ====== */
function renderLearnHome(root) {
  const totalChapters = CHAPTERS.length;
  const readChapters = readCount();
  const overallPct = (readChapters / totalChapters) * 100;

  let html = `
    <div class="card">
      <div style="display:flex; align-items:center; gap:14px;">
        <div style="flex:1;">
          <div style="font-size:13px; color: var(--text-muted); font-weight:600; text-transform: uppercase; letter-spacing:0.05em;">Reading Progress</div>
          <div style="font-size:24px; font-weight:700; margin-top:4px;">${readChapters} / ${totalChapters}</div>
          <div style="font-size:13px; color: var(--text-dim); margin-top:2px;">chapters completed</div>
        </div>
        <div>${donutSvg(overallPct, 'var(--primary)', 64)}</div>
      </div>
    </div>
  `;

  DOMAINS.forEach(d => {
    const chs = chaptersForDomain(d.id);
    const readN = chs.filter(c => state.read[c.id]).length;
    const pct = chs.length ? (readN / chs.length) * 100 : 0;
    html += `
      <div class="domain-header">
        <div class="domain-pill" style="background:${d.color}">${d.code}</div>
        <div class="domain-info">
          <div class="title">${escHtml(d.title)}</div>
          <div class="meta">Exam weight: ${d.weight} · ${readN}/${chs.length} read</div>
        </div>
        <div>${donutSvg(pct, d.color, 50)}</div>
      </div>`;
    chs.forEach(c => {
      const isRead = !!state.read[c.id];
      html += `
        <button class="chapter" data-act="open-chapter" data-id="${c.id}">
          <div class="chapter-icon ${isRead ? 'read' : ''}">${isRead ? '✓' : c.id}</div>
          <div class="chapter-body">
            <div class="title">${escHtml(c.title)}</div>
            <div class="meta">${c.estMinutes} min read</div>
          </div>
          <div class="chapter-arrow">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </div>
        </button>`;
    });
  });

  root.innerHTML = html;
  $$('[data-act="open-chapter"]').forEach(btn => {
    btn.addEventListener('click', () => navigate('chapter', { id: btn.dataset.id }));
  });
}

/* ====== Chapter view ====== */
function renderChapter(root, id) {
  const c = CHAPTERS.find(x => x.id === id);
  if (!c) { navigate('learn-home'); return; }
  const d = DOMAINS.find(x => x.id === c.domain);
  const idx = CHAPTERS.findIndex(x => x.id === id);
  const next = CHAPTERS[idx + 1];
  const prev = CHAPTERS[idx - 1];
  const isRead = !!state.read[c.id];

  root.innerHTML = `
    <div class="reading">
      <button class="btn ghost" id="back-btn" style="margin-bottom:12px; max-width:140px;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right:4px;"><polyline points="15 18 9 12 15 6"></polyline></svg>
        Back
      </button>
      <div class="crumb">
        <span style="color:${d.color}; font-weight:600;">Domain ${d.code} · ${escHtml(d.title)}</span>
      </div>
      <h2>${escHtml(c.title)}</h2>
      <div style="font-size:12px; color:var(--text-muted); margin-bottom:18px;">~${c.estMinutes} min read</div>
      <div class="reading-content">${md(c.body)}</div>

      <div class="reading-actions">
        ${prev ? `<button class="btn" data-act="prev"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg> Prev</button>` : ''}
        <button class="btn ${isRead ? 'success' : 'primary'}" data-act="toggle-read">
          ${isRead ? '✓ Marked as read' : 'Mark as read'}
        </button>
        ${next ? `<button class="btn primary" data-act="next">Next <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg></button>` : ''}
      </div>
    </div>
  `;
  $('#back-btn').addEventListener('click', () => navigate('learn-home'));
  $('[data-act="toggle-read"]').addEventListener('click', () => {
    if (state.read[c.id]) {
      delete state.read[c.id];
      toast('Marked as unread');
    } else {
      state.read[c.id] = Date.now();
      toast('✓ Chapter completed');
    }
    saveState();
    renderChapter(root, id);
  });
  if (prev) $('[data-act="prev"]').addEventListener('click', () => navigate('chapter', { id: prev.id }));
  if (next) $('[data-act="next"]').addEventListener('click', () => navigate('chapter', { id: next.id }));
}

/* ====== Test home (configurator) ====== */
let testConfig = {
  domains: new Set([1,2,3,4,5]),
  numQuestions: 20,
  timed: false,
  mode: 'practice', // practice = explain after each, exam = explain at end
};

function renderTestHome(root) {
  const totalAvail = QUESTIONS.filter(q => testConfig.domains.has(q.domain)).length;
  const sizeChoices = [10, 20, 30, 50, 90];
  const filteredSizes = sizeChoices.filter(n => n <= totalAvail);
  if (filteredSizes.length === 0) filteredSizes.push(totalAvail);
  if (testConfig.numQuestions > totalAvail) testConfig.numQuestions = totalAvail;

  root.innerHTML = `
    <div class="test-config">
      <h2>Build a test</h2>
      <div class="help">Practice with explanations or simulate the real exam.</div>

      <div class="field">
        <label>Mode</label>
        <div class="choice-row">
          <button class="chip ${testConfig.mode === 'practice' ? 'active' : ''}" data-mode="practice">Practice (explain each)</button>
          <button class="chip ${testConfig.mode === 'exam' ? 'active' : ''}" data-mode="exam">Exam mode</button>
        </div>
      </div>

      <div class="field">
        <label>Domains (${testConfig.domains.size} selected · ${totalAvail} questions available)</label>
        <div class="choice-row">
          ${DOMAINS.map(d => `
            <button class="chip ${testConfig.domains.has(d.id) ? 'active' : ''}" data-dom="${d.id}"
              style="${testConfig.domains.has(d.id) ? `background:${d.color}; border-color:${d.color}; color:white;` : ''}">
              ${d.code} ${escHtml(d.title.split(' ').slice(0,2).join(' '))}
            </button>
          `).join('')}
        </div>
      </div>

      <div class="field">
        <label>Number of questions</label>
        <div class="choice-row">
          ${filteredSizes.map(n => `<button class="chip ${testConfig.numQuestions === n ? 'active' : ''}" data-size="${n}">${n}</button>`).join('')}
          <button class="chip ${testConfig.numQuestions === totalAvail && !filteredSizes.includes(totalAvail) ? 'active' : ''}" data-size="${totalAvail}">All ${totalAvail}</button>
        </div>
      </div>

      <div class="field">
        <label>Timer (90 min like the real exam)</label>
        <div class="choice-row">
          <button class="chip ${!testConfig.timed ? 'active' : ''}" data-timed="off">Untimed</button>
          <button class="chip ${testConfig.timed ? 'active' : ''}" data-timed="on">90 min timer</button>
        </div>
      </div>

      <button class="btn primary" id="start-test" style="margin-top:16px;" ${testConfig.domains.size === 0 ? 'disabled' : ''}>
        Start ${testConfig.numQuestions}-question test
      </button>
    </div>
  `;

  $$('[data-mode]').forEach(b => b.addEventListener('click', () => {
    testConfig.mode = b.dataset.mode; renderTestHome(root);
  }));
  $$('[data-dom]').forEach(b => b.addEventListener('click', () => {
    const id = parseInt(b.dataset.dom, 10);
    if (testConfig.domains.has(id)) testConfig.domains.delete(id);
    else testConfig.domains.add(id);
    renderTestHome(root);
  }));
  $$('[data-size]').forEach(b => b.addEventListener('click', () => {
    testConfig.numQuestions = parseInt(b.dataset.size, 10);
    renderTestHome(root);
  }));
  $$('[data-timed]').forEach(b => b.addEventListener('click', () => {
    testConfig.timed = b.dataset.timed === 'on';
    renderTestHome(root);
  }));
  $('#start-test').addEventListener('click', startTest);
}

/* ====== Test session ====== */
function startTest() {
  const pool = QUESTIONS.filter(q => testConfig.domains.has(q.domain));
  const picked = shuffle(pool).slice(0, testConfig.numQuestions);
  // Shuffle answer choices per question while remembering correct index
  const prepared = picked.map(q => {
    const order = shuffle([0,1,2,3]);
    return {
      ...q,
      shuffledOptions: order.map(i => q.options[i]),
      newAnswerIndex: order.indexOf(q.answer),
    };
  });
  testSession = {
    startedAt: Date.now(),
    config: { ...testConfig, domains: Array.from(testConfig.domains) },
    questions: prepared,
    answers: new Array(prepared.length).fill(null),
    submitted: new Array(prepared.length).fill(false),
    currentIdx: 0,
    timed: testConfig.timed,
    timeLimitSec: testConfig.timed ? 90 * 60 : null,
    finished: false,
  };
  navigate('test-running');
}

let timerInterval = null;
function renderTestRunning(root) {
  if (!testSession) { navigate('test-home'); return; }
  const s = testSession;
  const i = s.currentIdx;
  const q = s.questions[i];
  const total = s.questions.length;
  const pct = ((i + 1) / total) * 100;
  const isPractice = s.config.mode === 'practice';
  const submitted = s.submitted[i];
  const userAns = s.answers[i];

  let timerHtml = '';
  if (s.timed) {
    const elapsed = Math.floor((Date.now() - s.startedAt) / 1000);
    const remaining = Math.max(0, s.timeLimitSec - elapsed);
    timerHtml = `<div class="timer" id="timer-display">${fmtDuration(remaining)}</div>`;
  }

  root.innerHTML = `
    <div class="test-bar">
      <div class="progress">Q ${i + 1} / ${total}</div>
      ${timerHtml}
      <button class="btn ghost" id="quit-test" style="flex:0; max-width:60px; min-height:32px; padding: 4px 10px; font-size: 12px;">Quit</button>
    </div>
    <div class="q-progress"><div class="q-progress-fill" style="width:${pct}%"></div></div>

    <div class="card">
      <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px;">
        <div style="font-size:11px; color:${DOMAINS.find(d=>d.id===q.domain).color}; font-weight:700; text-transform:uppercase; letter-spacing:0.04em;">
          Domain ${q.domain}
        </div>
        <button class="flag-btn ${state.flagged[q.id] ? 'flagged' : ''}" data-act="flag" title="Flag for review">
          ${state.flagged[q.id] ? '⚑ Flagged' : '⚐ Flag'}
        </button>
      </div>
      <div class="question-text">${escHtml(q.q)}</div>
      <div class="options" id="options">
        ${q.shuffledOptions.map((opt, k) => {
          let cls = 'option';
          if (submitted) {
            if (k === q.newAnswerIndex) cls += ' correct';
            else if (k === userAns) cls += ' incorrect';
            cls += ' locked';
          } else if (userAns === k) cls += ' selected';
          return `
            <button class="${cls}" data-opt="${k}">
              <span class="opt-letter">${String.fromCharCode(65 + k)}</span>
              <span>${escHtml(opt)}</span>
            </button>`;
        }).join('')}
      </div>
      ${submitted && isPractice ? `
        <div class="explain"><strong>${userAns === q.newAnswerIndex ? '✓ Correct.' : '✗ Incorrect.'}</strong> ${escHtml(q.explain)}</div>
      ` : ''}
    </div>

    <div class="reading-actions">
      ${i > 0 ? `<button class="btn" data-act="prev">‹ Prev</button>` : ''}
      ${!submitted && isPractice
        ? `<button class="btn primary" data-act="submit" ${userAns === null ? 'disabled' : ''}>Submit</button>`
        : (i < total - 1
          ? `<button class="btn primary" data-act="next">Next ›</button>`
          : `<button class="btn primary" data-act="finish">Finish test</button>`)
      }
      ${!isPractice && !submitted ? `<button class="btn primary" data-act="exam-next" ${userAns === null ? 'disabled' : ''}>${i < total - 1 ? 'Next ›' : 'Finish'}</button>` : ''}
    </div>
  `;

  // Set up timer
  if (timerInterval) clearInterval(timerInterval);
  if (s.timed) {
    timerInterval = setInterval(() => {
      const td = $('#timer-display');
      if (!td) { clearInterval(timerInterval); return; }
      const elapsed = Math.floor((Date.now() - s.startedAt) / 1000);
      const remaining = Math.max(0, s.timeLimitSec - elapsed);
      td.textContent = fmtDuration(remaining);
      if (remaining === 0) {
        clearInterval(timerInterval);
        finishTest(true);
      }
    }, 1000);
  }

  // Listeners
  $$('.option').forEach(opt => opt.addEventListener('click', () => {
    if (s.submitted[i]) return;
    s.answers[i] = parseInt(opt.dataset.opt, 10);
    if (!isPractice) {
      // exam mode auto-progress on click
      renderTestRunning(root);
    } else {
      renderTestRunning(root);
    }
  }));
  const submitBtn = $('[data-act="submit"]');
  if (submitBtn) submitBtn.addEventListener('click', () => {
    s.submitted[i] = true;
    recordAnswer(q.id, s.answers[i] === q.newAnswerIndex);
    saveState();
    renderTestRunning(root);
  });
  const examNext = $('[data-act="exam-next"]');
  if (examNext) examNext.addEventListener('click', () => {
    s.submitted[i] = true;
    recordAnswer(q.id, s.answers[i] === q.newAnswerIndex);
    saveState();
    if (i < total - 1) { s.currentIdx++; renderTestRunning(root); }
    else { finishTest(false); }
  });
  const nextBtn = $('[data-act="next"]');
  if (nextBtn) nextBtn.addEventListener('click', () => {
    s.currentIdx++;
    renderTestRunning(root);
  });
  const prevBtn = $('[data-act="prev"]');
  if (prevBtn) prevBtn.addEventListener('click', () => {
    s.currentIdx--;
    renderTestRunning(root);
  });
  const finishBtn = $('[data-act="finish"]');
  if (finishBtn) finishBtn.addEventListener('click', () => finishTest(false));
  const flagBtn = $('[data-act="flag"]');
  if (flagBtn) flagBtn.addEventListener('click', () => {
    if (state.flagged[q.id]) delete state.flagged[q.id]; else state.flagged[q.id] = true;
    saveState();
    renderTestRunning(root);
  });
  const quitBtn = $('#quit-test');
  if (quitBtn) quitBtn.addEventListener('click', () => {
    modal('Quit test?', 'Your progress in this test will be lost (your stats from answered questions are kept).', [
      { label: 'Keep going', style: 'ghost' },
      { label: 'Quit', style: 'danger', onClick: () => { testSession = null; if (timerInterval) clearInterval(timerInterval); navigate('test-home'); } }
    ]);
  });
}

function finishTest(timedOut) {
  if (timerInterval) clearInterval(timerInterval);
  const s = testSession;
  s.finished = true;
  // For exam mode, ensure all answered Qs are recorded (they are in handler).
  const total = s.questions.length;
  let correct = 0;
  const byDomain = {};
  s.questions.forEach((q, i) => {
    const isCorrect = s.answers[i] === q.newAnswerIndex;
    if (!byDomain[q.domain]) byDomain[q.domain] = { c: 0, t: 0 };
    byDomain[q.domain].t += 1;
    if (isCorrect) { correct++; byDomain[q.domain].c += 1; }
    if (s.config.mode === 'exam' && !s.submitted[i] && s.answers[i] !== null) {
      // already recorded above in submit handler; skip
    }
  });
  const durationSec = Math.floor((Date.now() - s.startedAt) / 1000);
  state.testHistory.unshift({
    ts: Date.now(),
    total,
    correct,
    byDomain,
    durationSec,
    domains: s.config.domains,
    mode: s.config.mode,
    timedOut: !!timedOut,
  });
  if (state.testHistory.length > 50) state.testHistory = state.testHistory.slice(0, 50);
  saveState();
  navigate('test-results');
}

function renderTestResults(root) {
  if (!testSession) { navigate('test-home'); return; }
  const s = testSession;
  const total = s.questions.length;
  let correct = 0;
  const byDomain = {};
  const wrong = [];
  s.questions.forEach((q, i) => {
    const isCorrect = s.answers[i] === q.newAnswerIndex;
    if (!byDomain[q.domain]) byDomain[q.domain] = { c: 0, t: 0 };
    byDomain[q.domain].t += 1;
    if (isCorrect) { correct++; byDomain[q.domain].c += 1; }
    else wrong.push({ q, idx: i, userAns: s.answers[i] });
  });
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
  const passColor = pct >= 75 ? 'var(--success)' : (pct >= 60 ? 'var(--warning)' : 'var(--danger)');
  const passLabel = pct >= 75 ? 'PASS' : (pct >= 60 ? 'CLOSE' : 'BELOW');

  let html = `
    <div class="card" style="text-align:center; padding:24px;">
      <div style="font-size:13px; color:var(--text-muted); font-weight:600; text-transform:uppercase; letter-spacing:0.05em;">Test results</div>
      <div style="font-size:48px; font-weight:800; color:${passColor}; margin:8px 0; letter-spacing:-0.03em;">${pct}%</div>
      <div style="font-size:14px; color:var(--text-dim);">${correct} of ${total} correct · ${passLabel}</div>
      <div style="font-size:12px; color:var(--text-muted); margin-top:6px;">Duration: ${fmtDuration(Math.floor((Date.now() - s.startedAt) / 1000))}</div>
    </div>

    <div class="section-title">By domain</div>
    ${Object.entries(byDomain).map(([d, v]) => {
      const dom = DOMAINS.find(x => x.id === parseInt(d, 10));
      const p = v.t > 0 ? (v.c / v.t) * 100 : 0;
      return `
        <div class="bar-row">
          <div class="name">${dom.code} ${escHtml(dom.title.split(' ').slice(0,3).join(' '))}</div>
          <div class="bar"><div style="width:${p}%; background:${dom.color}"></div></div>
          <div class="pct">${v.c}/${v.t}</div>
        </div>`;
    }).join('')}

    ${wrong.length > 0 ? `
      <div class="section-title">Review missed (${wrong.length})</div>
      ${wrong.map(({ q, userAns }) => `
        <div class="card">
          <div style="font-size:11px; color:${DOMAINS.find(d=>d.id===q.domain).color}; font-weight:700; text-transform:uppercase; letter-spacing:0.04em; margin-bottom:6px;">Domain ${q.domain}</div>
          <div style="font-weight:500; font-size:15px; line-height:1.4; margin-bottom:10px;">${escHtml(q.q)}</div>
          ${userAns !== null ? `<div style="font-size:13px; color:var(--danger); margin-bottom:4px;">✗ Your answer: ${escHtml(q.shuffledOptions[userAns])}</div>` : `<div style="font-size:13px; color:var(--text-muted); margin-bottom:4px;">— No answer given —</div>`}
          <div style="font-size:13px; color:var(--success); margin-bottom:8px;">✓ Correct: ${escHtml(q.shuffledOptions[q.newAnswerIndex])}</div>
          <div class="explain" style="margin-top:6px;">${escHtml(q.explain)}</div>
        </div>
      `).join('')}
    ` : `
      <div class="card" style="text-align:center; padding:24px; color:var(--success);">
        🏆 Perfect score!
      </div>
    `}

    <div class="reading-actions">
      <button class="btn" id="back-test">Back to tests</button>
      <button class="btn primary" id="retry-test">Try again</button>
    </div>
  `;
  root.innerHTML = html;
  $('#back-test').addEventListener('click', () => { testSession = null; navigate('test-home'); });
  $('#retry-test').addEventListener('click', () => { testSession = null; startTest(); });
}

/* ====== Score view ====== */
function renderScore(root) {
  const overall = overallAccuracy();
  const totalChapters = CHAPTERS.length;
  const readChapters = readCount();
  const readPct = (readChapters / totalChapters) * 100;
  const totalQ = QUESTIONS.length;
  const seenQ = Object.values(state.questionStats).filter(s => s.seen > 0).length;

  // Suggest weakest domain
  const domainStats = DOMAINS.map(d => {
    const acc = questionAccuracyForDomain(d.id);
    const rp = readPctForDomain(d.id);
    return { d, acc, rp };
  });
  const seenDomains = domainStats.filter(x => x.acc.seen > 0);
  let focus = null;
  if (seenDomains.length > 0) {
    focus = seenDomains.slice().sort((a,b) => a.acc.pct - b.acc.pct)[0];
  } else {
    // Suggest least-read
    focus = domainStats.slice().sort((a,b) => a.rp - b.rp)[0];
  }

  let html = `
    <div class="score-summary">
      <div class="stat-card">
        <div class="label">Reading</div>
        <div class="value" style="color: var(--primary)">${Math.round(readPct)}%</div>
        <div class="sub">${readChapters} / ${totalChapters} chapters</div>
      </div>
      <div class="stat-card">
        <div class="label">Test accuracy</div>
        <div class="value" style="color: ${overall.pct >= 75 ? 'var(--success)' : overall.pct >= 60 ? 'var(--warning)' : 'var(--danger)'}">${overall.seen > 0 ? Math.round(overall.pct) + '%' : '—'}</div>
        <div class="sub">${overall.correct} / ${overall.seen} answered correctly</div>
      </div>
    </div>

    <div class="card">
      <div style="font-size:12px; font-weight:600; text-transform: uppercase; letter-spacing:0.05em; color:var(--text-muted); margin-bottom:8px;">📚 Recommended focus</div>
      ${focus ? `
        <div style="display:flex; align-items:center; gap:12px;">
          <div class="domain-pill" style="background:${focus.d.color}">${focus.d.code}</div>
          <div style="flex:1;">
            <div style="font-weight:600; font-size:14px;">${escHtml(focus.d.title)}</div>
            <div style="font-size:12px; color:var(--text-muted); margin-top:2px;">
              ${focus.acc.seen > 0 ? `${Math.round(focus.acc.pct)}% accuracy · ` : ''}${Math.round(focus.rp)}% read
            </div>
          </div>
        </div>
        <button class="btn primary" style="margin-top:12px; width:100%;" id="focus-btn">Study this domain</button>
      ` : '<div style="color:var(--text-muted); font-size:14px;">Take a test to get a recommendation.</div>'}
    </div>

    <div class="section-title">Reading progress per domain</div>
    ${DOMAINS.map(d => {
      const pct = readPctForDomain(d.id);
      const ch = chaptersForDomain(d.id);
      const r = ch.filter(c => state.read[c.id]).length;
      return `
        <div class="bar-row">
          <div class="name">${d.code} ${escHtml(d.title.split(' ').slice(0,3).join(' '))}</div>
          <div class="bar"><div style="width:${pct}%; background:${d.color}"></div></div>
          <div class="pct">${r}/${ch.length}</div>
        </div>`;
    }).join('')}

    <div class="section-title">Test accuracy per domain</div>
    ${DOMAINS.map(d => {
      const acc = questionAccuracyForDomain(d.id);
      return `
        <div class="bar-row">
          <div class="name">${d.code} ${escHtml(d.title.split(' ').slice(0,3).join(' '))}</div>
          <div class="bar"><div style="width:${acc.pct}%; background:${acc.pct >= 75 ? 'var(--success)' : acc.pct >= 60 ? 'var(--warning)' : 'var(--danger)'}"></div></div>
          <div class="pct">${acc.seen > 0 ? Math.round(acc.pct) + '%' : '—'}</div>
        </div>`;
    }).join('')}

    <div class="section-title">Recent tests</div>
    ${state.testHistory.length === 0 ? `
      <div class="empty-state">
        <div class="emoji">📝</div>
        <div class="title">No tests yet</div>
        <div class="sub">Take a test to see history here.</div>
      </div>
    ` : state.testHistory.slice(0, 10).map(h => {
      const p = Math.round((h.correct / h.total) * 100);
      const color = p >= 75 ? 'var(--success)' : p >= 60 ? 'var(--warning)' : 'var(--danger)';
      return `
        <div class="history-item">
          <div style="flex:1;">
            <div class="what">${h.total} Q · ${fmtDuration(h.durationSec)} · ${escHtml(h.mode)}</div>
            <div class="when">${fmtDate(h.ts)}${h.timedOut ? ' · timed out' : ''}</div>
          </div>
          <div class="score-badge" style="background:${color}; color:white;">${p}%</div>
        </div>`;
    }).join('')}

    <div class="section-title">Manage data</div>
    <div class="card">
      <div style="font-size:13px; color:var(--text-dim); margin-bottom:10px;">${seenQ} of ${totalQ} questions attempted at least once.</div>
      <div style="display:flex; gap:8px;">
        <button class="btn ghost" id="export-btn">Export progress</button>
        <button class="btn danger" id="reset-btn">Reset all</button>
      </div>
    </div>
  `;

  root.innerHTML = html;
  if (focus) {
    $('#focus-btn').addEventListener('click', () => {
      // Open first unread chapter for that domain, or first chapter
      const ch = chaptersForDomain(focus.d.id);
      const first = ch.find(c => !state.read[c.id]) || ch[0];
      setTab('learn');
      setTimeout(() => navigate('chapter', { id: first.id }), 50);
    });
  }
  $('#reset-btn').addEventListener('click', () => {
    modal('Reset all progress?', 'This will clear reading progress, test history, and stats. Cannot be undone.', [
      { label: 'Cancel', style: 'ghost' },
      { label: 'Reset', style: 'danger', onClick: () => {
        state = JSON.parse(JSON.stringify(defaultState));
        saveState();
        toast('All progress reset');
        render();
      } }
    ]);
  });
  $('#export-btn').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'sy701-progress.json';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast('Exported progress');
  });
}

/* ============================== Init ============================== */
$$('nav.bottom-nav button').forEach(b => {
  b.addEventListener('click', () => setTab(b.dataset.nav));
});
$('#header-action').addEventListener('click', () => {
  modal('Security+ SY0-701 Study App',
    'Tap Learn to read chapters · Test to build a quiz · Score to see progress. All data is stored locally on your device.',
    [{ label: 'OK', style: 'primary' }]);
});

render();
})();
