(function () {
  'use strict';

  var DATA_URL = 'data/faq.json';
  var VERSION  = '2026-05-06-1';
  var root     = document.getElementById('faq-root');

  if (!root) return;

  fetch(DATA_URL + '?v=' + VERSION, { cache: 'no-store' })
    .then(function (r) {
      if (!r.ok) throw new Error('Failed to load faq.json (' + r.status + ')');
      return r.json();
    })
    .then(render)
    .catch(function (err) {
      console.error(err);
      root.innerHTML = '<p class="faq-error">Unable to load FAQ. Please try again later.</p>';
    });

  function esc(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function render(categories) {
    if (!Array.isArray(categories) || categories.length === 0) {
      root.innerHTML = '<p class="faq-error">No FAQ entries found.</p>';
      return;
    }

    var frag = document.createDocumentFragment();

    categories.forEach(function (cat) {
      var section = document.createElement('section');
      section.className = 'faq-category';

      var h2 = document.createElement('h2');
      h2.className = 'faq-category-heading';
      h2.textContent = String(cat.category || '');
      section.appendChild(h2);

      var items = Array.isArray(cat.items) ? cat.items : [];
      items.forEach(function (item) {
        var details = document.createElement('details');
        details.className = 'faq-item';

        var summary = document.createElement('summary');
        summary.className = 'faq-question';
        summary.textContent = String(item.q || '');

        var answer = document.createElement('p');
        answer.className = 'faq-answer';
        answer.innerHTML = esc(String(item.a || ''));

        details.appendChild(summary);
        details.appendChild(answer);
        section.appendChild(details);
      });

      frag.appendChild(section);
    });

    root.replaceChildren(frag);
  }
})();
