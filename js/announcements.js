/* 
  TrendFit Announcements Renderer (clean)
  - Fetches /data/announcements.json (with cache-busting)
  - Sorts by pinned + date (newest first)
  - Renders accessible cards using existing styles
*/

(function () {
  // Accept multiple possible root IDs for robustness
  const ROOT_IDS = ["announce-root", "announcements-root", "announcements-list"];

  function getRoot() {
    for (const id of ROOT_IDS) {
      const el = document.getElementById(id);
      if (el) return el;
    }
    return null;
  }

  // JSON location (adjust if you keep it elsewhere)
  const DATA_URL = "data/announcements.json";

  // Bump this when you change data/renderer to dodge device caching
  const VERSION = "2025-09-20-2";
  const withCacheBust = (url) => url + (url.includes("?") ? "&" : "?") + "v=" + VERSION;

  const root = getRoot();
  if (!root) return; // No target container on this page

  fetch(withCacheBust(DATA_URL), { cache: "no-store" })
    .then((r) => {
      if (!r.ok) throw new Error("Failed to load announcements.json");
      return r.json();
    })
    .then(renderAnnouncements)
    .catch((err) => {
      console.error(err);
      root.innerHTML = `<article class="card announce">
        <h3>Unable to load announcements</h3>
        <p style="color:var(--muted)">${err.message}</p>
      </article>`;
    });

  // --- Minimal Markdown renderer (trusted JSON only)
  function mdToHtml(s) {
    const esc = String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    return esc
      .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>");
  }

  function renderAnnouncements(items) {
    const posts = (items || [])
      .map(safePost)
      .sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return new Date(b.date) - new Date(a.date);
      });

    if (posts.length === 0) {
      root.innerHTML = `<article class="card announce">
        <h3>No announcements yet</h3>
        <p style="color:var(--muted)">Check back soon for updates.</p>
      </article>`;
      return;
    }

    const frag = document.createDocumentFragment();

    posts.forEach((post) => {
      const card = document.createElement("article");
      card.className = "card announce";

      // Title row
      const titleRow = document.createElement("div");
      titleRow.className = "title-row";

      const h3 = document.createElement("h3");
      h3.textContent = post.title;

      const pin = document.createElement("div");
      pin.className = "pinned";
      pin.innerHTML = post.pinned ? `<i class="fa-solid fa-thumbtack"></i> Pinned` : "";

      titleRow.appendChild(h3);
      titleRow.appendChild(pin);

      // Meta line
      const meta = document.createElement("div");
      meta.className = "meta";

      const when = document.createElement("time");
      when.dateTime = post.date;
      when.textContent = formatDate(post.date);
      meta.appendChild(when);

      if (Array.isArray(post.tags) && post.tags.length) {
        post.tags.forEach((t) => {
          const badge = document.createElement("span");
          badge.className = "badge";
          badge.textContent = t;
          meta.appendChild(badge);
        });
      }

      // Body (markdown + bullets)
      const bodyWrap = document.createElement("div");
      const lines = Array.isArray(post.body) ? post.body : [];
      let idx = 0;

      while (idx < lines.length) {
        const line = lines[idx];

        if (/^•\s/.test(line)) {
          const ul = document.createElement("ul");
          while (idx < lines.length && /^•\s/.test(lines[idx])) {
            const li = document.createElement("li");
            li.innerHTML = mdToHtml(lines[idx].replace(/^•\s/, ""));
            ul.appendChild(li);
            idx++;
          }
          bodyWrap.appendChild(ul);
          continue;
        }

        const p = document.createElement("p");
        p.innerHTML = mdToHtml(line);
        bodyWrap.appendChild(p);
        idx++;
      }

      // Links
      if (Array.isArray(post.links) && post.links.length) {
        const links = document.createElement("div");
        links.className = "links";
        post.links.forEach((lnk) => {
          const a = document.createElement("a");
          a.href = lnk.href;
          a.className = "btn btn-ghost btn-compact";
          a.innerHTML = `<i class="fa-solid fa-link"></i> ${lnk.label}`;
          links.appendChild(a);
        });
        bodyWrap.appendChild(links);
      }

      card.appendChild(titleRow);
      card.appendChild(meta);
      card.appendChild(bodyWrap);
      frag.appendChild(card);
    });

    root.replaceChildren(frag);
  }

  function safePost(p) {
    return {
      id: String(p.id || ""),
      date: String(p.date || ""),
      title: String(p.title || "Untitled"),
      pinned: Boolean(p.pinned),
      tags: Array.isArray(p.tags) ? p.tags.map(String) : [],
      body: Array.isArray(p.body) ? p.body.map(String) : [],
      links: Array.isArray(p.links)
        ? p.links.map((l) => ({
            label: String(l.label || "Learn more"),
            href: String(l.href || l.url || "#")
          }))
        : []
    };
  }

  function formatDate(iso) {
    const d = new Date(iso);
    if (isNaN(d)) return iso;
    const opts = { year: "numeric", month: "short", day: "numeric" };
    return d.toLocaleDateString(undefined, opts);
  }
})();
