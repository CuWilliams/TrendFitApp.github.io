// js/includes.js
(function () {
  // Replace any element like: <div data-include="partials/header.html"></div>
  async function includeFragments() {
    const nodes = document.querySelectorAll('[data-include]');
    for (const node of nodes) {
      const url = node.getAttribute('data-include');
      try {
        const res = await fetch(url, { credentials: 'same-origin' });
        if (!res.ok) throw new Error(res.status + ' ' + res.statusText);
        const html = await res.text();
        node.outerHTML = html;
      } catch (err) {
        console.warn('Include failed for', url, err);
      }
    }
  }

  // Mark current page's nav link
  function markActiveNav() {
    const links = document.querySelectorAll('nav.nav-links a[href]');
    const path = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    links.forEach(a => {
      const href = a.getAttribute('href').split('#')[0].toLowerCase();
      if (href === path || (path === '' && href === 'index.html')) {
        a.setAttribute('aria-current', 'page');
      }
    });
  }

  // Keep --header-h in sync with actual header height
  function setHeaderH() {
    const header = document.querySelector('.site-header');
    const h = header ? header.offsetHeight : 56;
    document.documentElement.style.setProperty('--header-h', h + 'px');
  }

  // Run once DOM is parsed
  document.addEventListener('DOMContentLoaded', async () => {
    await includeFragments();
    // Wait a tick so the header is in the DOM
    requestAnimationFrame(() => {
      markActiveNav();
      setHeaderH();
    });
    window.addEventListener('resize', setHeaderH);
  });
})();