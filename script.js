document.getElementById('search-form').addEventListener('submit', function (e) {
  e.preventDefault();

  const query = document.getElementById('search').value.trim();
  if (!query) return;

  // Goes straight to DuckDuckGo — nothing is stored
  window.location.href = 'https://duckduckgo.com/?q=' + encodeURIComponent(query);
});
