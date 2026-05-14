/* SJC AI Starter Kit — app.js */

const BASE = (() => {
  const s = document.currentScript || document.querySelector('script[src*="app.js"]');
  if (s) {
    const u = new URL(s.src);
    return u.pathname.replace('/assets/app.js', '');
  }
  return '';
})();

async function loadJSON(file) {
  try {
    const res = await fetch(`${BASE}/data/${file}`);
    if (!res.ok) throw new Error(res.status);
    return await res.json();
  } catch (e) {
    console.warn(`Failed to load ${file}:`, e.message);
    return null;
  }
}

function statusTag(status) {
  const cls = {
    'Ready to use': 'status-ready',
    'Pilot': 'status-pilot',
    'Exploring': 'status-exploring',
    'Using': 'status-using',
  }[status] || 'tag-gray';
  return `<span class="tag ${cls}">${status}</span>`;
}

function diffTag(d) {
  const cls = { Beginner: 'diff-beginner', Intermediate: 'diff-intermediate', Advanced: 'diff-advanced' }[d] || 'tag-gray';
  return `<span class="tag ${cls}">${d}</span>`;
}

function copyBtn(text, label = 'Copy prompt') {
  const id = 'cb-' + Math.random().toString(36).slice(2);
  setTimeout(() => {
    const btn = document.getElementById(id);
    if (!btn) return;
    btn.addEventListener('click', () => {
      navigator.clipboard.writeText(text).then(() => {
        btn.textContent = '✓ Copied';
        btn.classList.add('copied');
        setTimeout(() => { btn.textContent = label; btn.classList.remove('copied'); }, 2000);
      }).catch(() => {
        const ta = document.createElement('textarea');
        ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select();
        document.execCommand('copy'); document.body.removeChild(ta);
        btn.textContent = '✓ Copied'; btn.classList.add('copied');
        setTimeout(() => { btn.textContent = label; btn.classList.remove('copied'); }, 2000);
      });
    });
  }, 0);
  return `<button id="${id}" class="copy-btn btn-sm" aria-label="${label}">${label}</button>`;
}

function errMsg(container, msg) {
  container.innerHTML = `<div class="no-results"><p>${msg}</p><p style="font-size:13px;margin-top:8px;">Try running: <code>python3 -m http.server 8000</code> then visit <code>http://localhost:8000</code></p></div>`;
}

/* ─── NAV ─────────────────────────────────────────────────────────── */
function initNav() {
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open);
    });
  }
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href').split('/').pop();
    if (href === path || (path === '' && href === 'index.html')) a.classList.add('active');
  });
}

/* ─── RECIPES ─────────────────────────────────────────────────────── */
async function renderRecipes(featuredOnly = false, limit = null) {
  const el = document.getElementById('recipes-container');
  if (!el) return;
  const data = await loadJSON('recipes.json');
  if (!data) { errMsg(el, 'Could not load recipes.'); return; }

  let recipes = featuredOnly ? data.filter(r => r.featured) : data;
  if (limit) recipes = recipes.slice(0, limit);

  const searchEl = document.getElementById('recipe-search');
  const pillarEl = document.getElementById('filter-pillar');
  const teamEl   = document.getElementById('filter-team');
  const toolEl   = document.getElementById('filter-tool');
  const diffEl   = document.getElementById('filter-difficulty');
  const countEl  = document.getElementById('recipes-count');

  function render(list) {
    if (countEl) countEl.textContent = `${list.length} recipe${list.length !== 1 ? 's' : ''}`;
    if (!list.length) { el.innerHTML = '<div class="no-results">No recipes match your filters. Try clearing a filter.</div>'; return; }
    el.innerHTML = list.map(r => `
      <article class="card recipe-card" aria-label="${r.title}">
        <div class="recipe-card-summary">
          <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px;">
            ${statusTag(r.status)}${diffTag(r.difficulty)}
            ${r.featured ? '<span class="featured-badge">★ May 13</span>' : ''}
          </div>
          <div class="card-title">${r.title}</div>
          <div class="card-meta" style="margin-top:6px;">
            <span class="tag tag-teal">${r.pillar}</span>
            ${r.team.map(t => `<span class="tag tag-gray">${t}</span>`).join('')}
          </div>
          <div class="card-body" style="margin-top:8px;">${r.useWhen}</div>
          ${r.partnerNote ? `<div class="callout callout-info" style="margin:12px 0;font-size:14px;"><span>💡</span><div>${r.partnerNote}</div></div>` : ''}
          <div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
            <span class="time-saved">⏱ ${r.timeSaved}</span>
            ${r.tools.map(t => `<span class="tag tag-blue">${t}</span>`).join('')}
          </div>
          <button class="expand-btn" onclick="toggleRecipe(this)" aria-expanded="false" style="margin-top:10px;">Show workflow ↓</button>
        </div>
        <div class="recipe-detail">
          <h4>Inputs needed</h4>
          <div class="recipe-inputs">${r.inputsNeeded.map(i => `<span class="tag tag-gray">${i}</span>`).join('')}</div>
          <h4>Steps</h4>
          <ol class="recipe-steps">${r.steps.map(s => `<li>${s}</li>`).join('')}</ol>
          <h4>Prompt</h4>
          <div class="recipe-prompt-block">${escHtml(r.prompt)}</div>
          <div style="margin-top:10px;">${copyBtn(r.prompt, 'Copy prompt')}</div>
          ${r.exampleOutput ? `<h4>Example output</h4><p style="font-size:13.5px;color:var(--text-muted);font-style:italic;">${r.exampleOutput}</p>` : ''}
          <h4>Human check</h4>
          <div class="callout callout-human"><span class="callout-icon">👤</span><div class="callout-body"><ul class="recipe-checks">${r.humanCheck.map(c => `<li>${c}</li>`).join('')}</ul></div></div>
          ${r.partnerNote ? `<div class="callout callout-info" style="margin:12px 0;font-size:14px;"><span>💡</span><div>${r.partnerNote}</div></div>` : ''}
        </div>
      </article>`).join('');
  }

  function filter() {
    const q    = searchEl ? searchEl.value.toLowerCase() : '';
    const p    = pillarEl ? pillarEl.value : '';
    const team = teamEl   ? teamEl.value : '';
    const tool = toolEl   ? toolEl.value : '';
    const diff = diffEl   ? diffEl.value : '';
    render(data.filter(r =>
      (!q    || r.title.toLowerCase().includes(q) || r.team.join(' ').toLowerCase().includes(q) || r.tools.join(' ').toLowerCase().includes(q) || (r.sourceTheme||'').toLowerCase().includes(q)) &&
      (!p    || r.pillar === p) &&
      (!team || r.team.includes(team)) &&
      (!tool || r.tools.includes(tool)) &&
      (!diff || r.difficulty === diff)
    ));
  }

  if (!featuredOnly) {
    [searchEl, pillarEl, teamEl, toolEl, diffEl].forEach(e => e && e.addEventListener('input', filter));
    filter();
  } else {
    render(recipes);
  }
}

window.toggleRecipe = function(btn) {
  const detail = btn.closest('.recipe-card').querySelector('.recipe-detail');
  const open = detail.classList.toggle('open');
  btn.textContent = open ? 'Hide workflow ↑' : 'Show workflow ↓';
  btn.setAttribute('aria-expanded', open);
};

/* ─── PROMPTS ─────────────────────────────────────────────────────── */
async function renderPrompts() {
  const el = document.getElementById('prompts-container');
  if (!el) return;
  const data = await loadJSON('prompts.json');
  if (!data) { errMsg(el, 'Could not load prompts.'); return; }

  const searchEl = document.getElementById('prompt-search');
  const catEl    = document.getElementById('filter-category');
  const toolEl   = document.getElementById('filter-prompt-tool');
  const diffEl   = document.getElementById('filter-prompt-diff');
  const countEl  = document.getElementById('prompts-count');

  function render(list) {
    if (countEl) countEl.textContent = `${list.length} prompt${list.length !== 1 ? 's' : ''}`;
    if (!list.length) { el.innerHTML = '<div class="no-results">No prompts match your filters.</div>'; return; }
    el.innerHTML = list.map(p => `
      <article class="card prompt-card" aria-label="${p.title}">
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px;">
          <span class="tag tag-teal">${p.category}</span>${diffTag(p.difficulty)}
        </div>
        <div class="card-title">${p.title}</div>
        <div class="card-body" style="margin-top:6px;">${p.bestFor}</div>
        <div style="margin-top:8px;display:flex;gap:6px;flex-wrap:wrap;">
          ${p.tools.map(t => `<span class="tag tag-blue">${t}</span>`).join('')}
        </div>
        <button class="expand-btn" onclick="togglePrompt(this)" aria-expanded="false" style="margin-top:10px;">Show prompt ↓</button>
        <div class="prompt-detail">
          <h4 style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:var(--text-muted);margin-bottom:8px;margin-top:0;">How to use</h4>
          <ul style="padding-left:18px;margin-bottom:12px;">${p.howToUse.map(h => `<li style="font-size:13.5px;margin-bottom:4px;">${h}</li>`).join('')}</ul>
          <h4 style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:var(--text-muted);margin-bottom:8px;">Prompt</h4>
          <div class="prompt-text-block">${escHtml(p.promptText)}</div>
          <div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
            ${copyBtn(p.promptText)}
            ${p.followUp ? copyBtn(p.followUp, 'Copy follow-up') : ''}
          </div>
          <div class="callout callout-human" style="margin-top:14px;"><span class="callout-icon">👤</span><div class="callout-body"><strong>Human check</strong><ul style="padding-left:18px;margin:0;">${p.humanCheck.map(c => `<li style="font-size:13px;">${c}</li>`).join('')}</ul></div></div>
          ${p.followUp ? `<div style="margin-top:12px;"><h4 style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:var(--text-muted);margin-bottom:6px;">Follow-up prompt</h4><div class="prompt-text-block" style="max-height:160px;">${escHtml(p.followUp)}</div></div>` : ''}
        </div>
      </article>`).join('');
  }

  function filter() {
    const q    = searchEl ? searchEl.value.toLowerCase() : '';
    const cat  = catEl    ? catEl.value : '';
    const tool = toolEl   ? toolEl.value : '';
    const diff = diffEl   ? diffEl.value : '';
    render(data.filter(p =>
      (!q    || p.title.toLowerCase().includes(q) || p.bestFor.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)) &&
      (!cat  || p.category === cat) &&
      (!tool || p.tools.includes(tool)) &&
      (!diff || p.difficulty === diff)
    ));
  }

  [searchEl, catEl, toolEl, diffEl].forEach(e => e && e.addEventListener('input', filter));
  filter();
}

window.togglePrompt = function(btn) {
  const detail = btn.closest('.prompt-card').querySelector('.prompt-detail');
  const open = detail.classList.toggle('open');
  btn.textContent = open ? 'Hide prompt ↑' : 'Show prompt ↓';
  btn.setAttribute('aria-expanded', open);
};

/* ─── TOOLS ───────────────────────────────────────────────────────── */
async function renderTools() {
  const el = document.getElementById('tools-container');
  if (!el) return;
  const data = await loadJSON('tools.json');
  if (!data) { errMsg(el, 'Could not load tools.'); return; }

  const searchEl = document.getElementById('tool-search');
  const catEl    = document.getElementById('filter-tool-cat');
  const statusEl = document.getElementById('filter-tool-status');
  const countEl  = document.getElementById('tools-count');

  function render(list) {
    if (countEl) countEl.textContent = `${list.length} tool${list.length !== 1 ? 's' : ''}`;
    if (!list.length) { el.innerHTML = '<div class="no-results">No tools match your filters.</div>'; return; }
    el.innerHTML = list.map(t => `
      <article class="card tool-card" aria-label="${t.name}">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:8px;">
          <div>
            <div class="tool-name">${t.name}${t.tryFirst ? ' <span class="tag" style="background:#e6f4ea;color:#1e6b3a;font-size:11px;vertical-align:middle;">✅ Start here</span>' : ''}</div>
            ${t.accessNote ? `<p class="tool-access-note" style="font-size:13px;color:var(--text-muted);margin-top:4px;">🔒 ${t.accessNote}</p>` : ''}
          </div>
          <div style="display:flex;gap:6px;flex-wrap:wrap;">
            ${statusTag(t.status)}<span class="tag tag-gray">${t.category}</span>
          </div>
        </div>
        <div style="margin-top:10px;">
          <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:var(--text-muted);margin-bottom:6px;">Best for</div>
          <ul class="tool-uses">${t.bestFor.map(b => `<li>${b}</li>`).join('')}</ul>
        </div>
        <div style="margin-top:10px;">
          <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:var(--text-muted);margin-bottom:6px;">Common uses at SJC</div>
          <ul class="tool-uses">${t.commonUses.map(c => `<li>${c}</li>`).join('')}</ul>
        </div>
        <div style="margin-top:10px;">
          <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#b71c1c;margin-bottom:6px;">Watch out for</div>
          <ul class="tool-watchouts">${t.watchouts.map(w => `<li>${w}</li>`).join('')}</ul>
        </div>
        ${t.pricingNote ? `<div style="margin-top:10px;font-size:12.5px;color:var(--text-muted);">💰 ${t.pricingNote}</div>` : ''}
        ${t.teams ? `<div style="margin-top:10px;display:flex;gap:6px;flex-wrap:wrap;">${t.teams.map(tm => `<span class="tag tag-teal">${tm}</span>`).join('')}</div>` : ''}
      </article>`).join('');
  }

  function filter() {
    const q   = searchEl ? searchEl.value.toLowerCase() : '';
    const cat = catEl    ? catEl.value : '';
    const st  = statusEl ? statusEl.value : '';
    render(data.filter(t =>
      (!q   || t.name.toLowerCase().includes(q) || t.category.toLowerCase().includes(q) || t.bestFor.join(' ').toLowerCase().includes(q)) &&
      (!cat || t.category === cat) &&
      (!st  || t.status === st)
    ));
  }

  [searchEl, catEl, statusEl].forEach(e => e && e.addEventListener('input', filter));
  filter();
}

/* ─── AHAS ────────────────────────────────────────────────────────── */
async function renderAhas() {
  const el = document.getElementById('ahas-container');
  if (!el) return;
  const data = await loadJSON('aha-examples.json');
  if (!data) { errMsg(el, 'Could not load aha examples.'); return; }
  el.innerHTML = data.map(a => `
    <article class="card aha-card" aria-label="${a.title}">
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px;">
        <div class="aha-team-badge">${a.team}</div>
        ${a.tool ? `<span class="tag tag-blue">${a.tool}</span>` : ''}
      </div>
      ${a.person ? `<div style="font-size:13px;color:var(--text-muted);margin-bottom:6px;">Shared by ${a.person}</div>` : ''}
      <div class="card-title">${a.title}</div>
      ${a.whatTried ? `<div class="aha-section"><h4>What I tried</h4><p>${a.whatTried}</p></div>` : ''}
      ${a.whatSurprisedMe ? `<div class="aha-section"><h4>What surprised me</h4><p>${a.whatSurprisedMe}</p></div>` : ''}
      ${a.whatWorked ? `<div class="aha-section"><h4>What worked</h4><p>${a.whatWorked}</p></div>` : ''}
      ${a.whatFailed ? `<div class="aha-section"><h4>What failed</h4><p>${a.whatFailed}</p></div>` : ''}
      ${a.nextTime ? `<div class="aha-section"><h4>Next time</h4><p>${a.nextTime}</p></div>` : ''}
    </article>`).join('');
}

/* ─── TOOL CHOOSER ────────────────────────────────────────────────── */
const CHOOSER_DATA = {
  'Write or revise copy': {
    tools: ['Gemini', 'ChatGPT', 'Claude', 'Gemini Gems'],
    recipes: ['draft-headlines-decks-copy', 'brand-voice-style-review', 'repurpose-article-multi-channel'],
    tip: 'Paste your draft and ask for a specific improvement — tone, length, clarity, or brand voice. Always review before publishing.'
  },
  'Summarize research or transcripts': {
    tools: ['NotebookLM', 'Otter', 'Gemini', 'ChatGPT'],
    recipes: ['transcribe-summarize-interview', 'research-ideation-assistant'],
    tip: 'Upload your source material and ask for a structured summary. Verify all key facts against the original.'
  },
  'Generate ideas': {
    tools: ['Gemini', 'ChatGPT', 'Perplexity'],
    recipes: ['generate-content-briefs', 'research-ideation-assistant', 'ab-test-headlines-subject-lines'],
    tip: 'Start with context about your audience and publication. Treat AI ideas as inputs to your own thinking — not final decisions.'
  },
  'Analyze performance data': {
    tools: ['Gemini Gems', 'GA4', 'Looker Studio', 'Statera'],
    recipes: ['analytics-weekly-recommendations'],
    tip: 'Export your data first, then ask specific questions. AI is good at spotting patterns — human judgment is needed to decide what to do next.'
  },
  'Create social/newsletter assets': {
    tools: ['Gemini', 'ChatGPT', 'Sprout Social'],
    recipes: ['repurpose-article-multi-channel', 'newsletter-assembly-support', 'ab-test-headlines-subject-lines'],
    tip: 'Provide the source article plus brand voice notes. Review captions for accuracy and tone before publishing.'
  },
  'Edit video or generate clips': {
    tools: ['Submagic', 'CapCut', 'Descript', 'Runway'],
    recipes: ['social-captions-from-video', 'video-podcast-script'],
    tip: 'Review all AI-generated captions for accuracy. Runway output must be disclosed if published. Never create synthetic replicas of real people.'
  },
  'Translate content': {
    tools: ['DeepL', 'Gemini'],
    recipes: ['translate-en-fr'],
    tip: 'DeepL is excellent for EN/FR first drafts. Always have a bilingual human reviewer before publishing translated content.'
  },
  'Create images or visual concepts': {
    tools: ['Canva', 'Adobe Express', 'MidJourney', 'Adobe Photoshop / Firefly'],
    recipes: [],
    tip: 'AI-generated images must be disclosed when published. Do not use for original cover photography or sensitive imagery. Review all outputs for accuracy and appropriateness.'
  },
  'Manage tasks or workflows': {
    tools: ['ClickUp Brain', 'ClickUp Agents', 'Zapier', 'Supernormal'],
    recipes: ['meeting-notes-action-items', 'prioritize-editorial-queue', 'email-inbox-triage'],
    tip: 'Automation is a starting point — review AI-generated tasks and action items before assigning them to the team.'
  },
  'Build audience-facing tools': {
    tools: ['Gemini', 'ChatGPT'],
    recipes: ['generate-content-briefs'],
    tip: 'Consumer-facing AI tools require additional review, disclosure, and approval. Contact the Data & Analytics team before building.'
  }
};

async function initToolChooser() {
  const grid = document.getElementById('chooser-grid');
  const result = document.getElementById('chooser-result');
  if (!grid || !result) return;

  grid.innerHTML = Object.keys(CHOOSER_DATA).map(k =>
    `<button class="chooser-option" onclick="selectTask(this, '${escAttr(k)}')">${k}</button>`
  ).join('');

  const allRecipes = await loadJSON('recipes.json') || [];

  window.selectTask = function(btn, task) {
    document.querySelectorAll('.chooser-option').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    const d = CHOOSER_DATA[task];
    const relRecipes = allRecipes.filter(r => d.recipes.includes(r.id));
    result.classList.add('visible');
    result.innerHTML = `
      <h3>For: ${task}</h3>
      <div class="chooser-section">
        <h4>Recommended tools</h4>
        <div class="tool-pill-list">${d.tools.map(t => `<span class="tool-pill">${t}</span>`).join('')}</div>
      </div>
      ${relRecipes.length ? `<div class="chooser-section">
        <h4>Related recipes</h4>
        <div style="display:flex;flex-wrap:wrap;gap:8px;">${relRecipes.map(r => `<a href="recipes.html" class="btn btn-outline btn-sm">${r.title}</a>`).join('')}</div>
      </div>` : ''}
      <div class="chooser-section">
        <h4>Tip</h4>
        <div class="callout callout-info"><span class="callout-icon">💡</span><div class="callout-body"><p>${d.tip}</p></div></div>
      </div>
      <div class="callout callout-human"><span class="callout-icon">👤</span><div class="callout-body"><strong>Human check required</strong><p>AI can help draft, summarize, reformat, and suggest. Before using any output, confirm facts, sources, tone, rights, privacy, and policy fit.</p></div></div>`;
    result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };
}

/* ─── UTILS ───────────────────────────────────────────────────────── */
function escHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function escAttr(str) {
  return String(str).replace(/'/g,"\\'");
}

/* ─── INIT ────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  const page = location.pathname.split('/').pop() || 'index.html';
  if (page === 'index.html' || page === '') {
    renderRecipes(false, 6);
  } else if (page === 'recipes.html') {
    renderRecipes();
  } else if (page === 'prompts.html') {
    renderPrompts();
  } else if (page === 'tools.html') {
    renderTools();
  } else if (page === 'aha-archive.html') {
    renderAhas();
  } else if (page === 'tools.html') {
    initToolChooser();
  }
  if (page === 'tools.html') initToolChooser();
});
