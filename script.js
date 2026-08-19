// denser stars
(function makeStars() {
  const container = document.getElementById('stars');
  const count = 180; // way more than before
  for (let i = 0; i < count; i++) {
    const s = document.createElement('div');
    s.className = 'star';
    const size = Math.random() * 2.2 + 0.4;
    s.style.width = size + 'px';
    s.style.height = size + 'px';
    s.style.left = Math.random() * 100 + '%';
    s.style.top = Math.random() * 100 + '%';
    s.style.opacity = (Math.random() * 0.7 + 0.15).toFixed(2);
    container.appendChild(s);
  }
})();

const tabBar = document.getElementById('tab-bar');
const homePage = document.getElementById('page-home');
const iframeContainer = document.getElementById('iframe-container');
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search');

let tabs = [{ id: 'home', title: 'home', type: 'home' }];
let activeId = 'home';
let nextId = 1;

function switchTo(id) {
  activeId = id;
  // update tab styles
  document.querySelectorAll('.tab').forEach(t => {
    t.classList.toggle('active', t.dataset.tab === id);
  });

  if (id === 'home') {
    homePage.classList.remove('hidden');
    iframeContainer.classList.add('hidden');
    iframeContainer.innerHTML = '';
  } else {
    homePage.classList.add('hidden');
    iframeContainer.classList.remove('hidden');
    // show the matching iframe
    iframeContainer.innerHTML = '';
    const tab = tabs.find(t => t.id === id);
    if (tab && tab.url) {
      const frame = document.createElement('iframe');
      frame.src = tab.url;
      frame.allow = 'fullscreen';
      frame.loading = 'lazy';
      iframeContainer.appendChild(frame);

      // fallback notice after a short delay (most sites block embedding)
      setTimeout(() => {
        // if still empty-ish we show a soft note, but cant reliably detect blocked
        // just leave it, user can close and open externally if needed
      }, 1500);
    }
  }
}

function addTab(title, url) {
  const id = 't' + (nextId++);
  tabs.push({ id, title, url, type: 'iframe' });

  const tabEl = document.createElement('div');
  tabEl.className = 'tab';
  tabEl.dataset.tab = id;
  tabEl.innerHTML = `<span>${escapeHtml(title)}</span><span class="close" data-close="${id}">×</span>`;
  tabBar.appendChild(tabEl);

  tabEl.addEventListener('click', (e) => {
    if (e.target.classList.contains('close')) {
      closeTab(id);
      return;
    }
    switchTo(id);
  });

  switchTo(id);
  return id;
}

function closeTab(id) {
  if (id === 'home') return;
  tabs = tabs.filter(t => t.id !== id);
  const el = document.querySelector(`.tab[data-tab="${id}"]`);
  if (el) el.remove();

  if (activeId === id) {
    // go to last remaining or home
    const last = tabs[tabs.length - 1];
    switchTo(last ? last.id : 'home');
  }
}

function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// search
searchForm.addEventListener('submit', function (e) {
  e.preventDefault();
  const query = searchInput.value.trim();
  if (!query) return;

  const url = 'https://duckduckgo.com/?q=' + encodeURIComponent(query);
  addTab(query.length > 18 ? query.slice(0, 16) + '…' : query, url);
  searchInput.value = '';
});

// home tab click
document.getElementById('tab-home').addEventListener('click', () => switchTo('home'));

// apps open in internal tabs too
document.querySelectorAll('.app').forEach(app => {
  app.addEventListener('click', (e) => {
    e.preventDefault();
    const url = app.dataset.url;
    const title = app.dataset.title || 'app';
    if (url) addTab(title, url);
  });
});
