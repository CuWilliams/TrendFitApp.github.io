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

  // ===== NEW: Announcements "new" badge logic =====
  async function initAnnouncementsBadge() {
    try {
      // Ensure nav exists
      const annLink = document.querySelector('nav.nav-links a[href$="announcements.html"]');
      if (!annLink) return;

      // Fetch announcements list
      const res = await fetch('announcements.json', { cache: 'no-store' });
      if (!res.ok) return; // fail silently
      const items = await res.json();
      if (!Array.isArray(items) || items.length === 0) return;

      // Determine the latest announcement date (expects ISO yyyy-mm-dd)
      let latest = '';
      for (const it of items) {
        const d = (it && it.date) ? String(it.date) : '';
        if (d && d > latest) latest = d;
      }
      if (!latest) return;

      const LS_KEY = 'announcements:lastSeen';
      const page = (location.pathname.split('/').pop() || 'index.html').toLowerCase();

      // On the announcements page, mark all as seen and remove badge
      if (page === 'announcements.html') {
        localStorage.setItem(LS_KEY, latest);
        removeAnnouncementsBadge(annLink);
        return;
      }

      // Elsewhere: compare latest vs lastSeen and show badge if newer
      const lastSeen = localStorage.getItem(LS_KEY) || '';
      if (latest > lastSeen) {
        addAnnouncementsBadge(annLink);
      } else {
        removeAnnouncementsBadge(annLink);
      }
    } catch (err) {
      // Non-fatal; badge just won't show
      console.warn('Announcements badge init failed:', err);
    }
  }

  function addAnnouncementsBadge(linkEl) {
    if (!linkEl) return;
    linkEl.classList.add('has-badge');
    if (!linkEl.querySelector('.nav-badge')) {
      const dot = document.createElement('span');
      dot.className = 'nav-badge';
      dot.setAttribute('aria-hidden', 'true');
      linkEl.appendChild(dot);
    }
    // Accessible label hint
    const baseLabel = linkEl.getAttribute('aria-label') || linkEl.textContent.trim();
    if (!/new\)$/i.test(baseLabel)) {
      linkEl.setAttribute('aria-label', baseLabel.replace(/\s*\(new\)$/i, '') + ' (new)');
    }
  }

  function removeAnnouncementsBadge(linkEl) {
    if (!linkEl) return;
    linkEl.classList.remove('has-badge');
    const dot = linkEl.querySelector('.nav-badge');
    if (dot) dot.remove();
    // Restore label to plain text
    const baseText = linkEl.textContent.trim();
    linkEl.setAttribute('aria-label', baseText);
  }

  // Run once DOM is parsed
  document.addEventListener('DOMContentLoaded', async () => {
    await includeFragments();
    // Wait a tick so the header is in the DOM
    requestAnimationFrame(() => {
      markActiveNav();
      setHeaderH();
      // After header/nav present, initialize the badge
      initAnnouncementsBadge();
    });
    window.addEventListener('resize', setHeaderH);
  });
})();