/* 
  TrendFit Announcements Renderer
  - Fetches /data/announcements.json
  - Sorts by pinned + date (newest first)
  - Renders accessible cards using existing styles
*/

(function () {
  const ROOT_ID = "announce-root";
  const DATA_URL = "data/announcements.json";

  const root = document.getElementById(ROOT_ID);
  if (!root) return;

  fetch(DATA_URL, { cache: "no-store" })
    .then((r) => {
      if (!r.ok) throw new Error("Failed to load announcements");
      return r.json();
    })
    .then(renderAnnouncements)
    .catch((err) => {
      root.innerHTML = `<article class="card announce">
        <h3>Unable to load announcements</h3>
        <p style="color:var(--muted)">${err.message}</p>
      </article>`;
    });

  function renderAnnouncements(items) {
    // normalize + sort: pinned first, then date desc
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

      // Body
      const bodyWrap = document.createElement("div");
      (post.body || []).forEach((para) => {
        const p = document.createElement("p");
        p.textContent = para;
        bodyWrap.appendChild(p);
      });

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
        ? p.links.map((l) => ({ label: String(l.label || "Learn more"), href: String(l.href || "#") }))
        : [],
    };
  }

  function formatDate(iso) {
    const d = new Date(iso);
    if (isNaN(d)) return iso;
    const opts = { year: "numeric", month: "short", day: "numeric" };
    return d.toLocaleDateString(undefined, opts);
  }
})();
