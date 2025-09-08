/*
  TrendFit Policy Renderer (privacy/terms)
  - Reads ?lang= code (default "en")
  - Loads /data/policies/{policy}.{lang}.json (fallback to .en.json)
  - Renders title, effectiveDate, version, sections, bullets, notes
  - Works for both terms.html and privacy.html via data-policy attribute
*/

(function () {
  const root = document.getElementById("policy-root");
  if (!root) return;

  const policyName = root.dataset.policy || inferPolicyFromPath() || "privacy";
  const lang = (new URLSearchParams(location.search).get("lang") || "en").toLowerCase();
  const base = `data/policies/${policyName}.${lang}.json`;
  const fallback = `data/policies/${policyName}.en.json`;

  // Try requested language first, then fallback to English
  fetchJson(base).catch(() => fetchJson(fallback))
    .then((data) => renderPolicy(root, data))
    .catch((err) => {
      root.innerHTML = `<article class="card">
        <h2>Unable to load policy</h2>
        <p style="color:var(--muted)">${err?.message || err}</p>
      </article>`;
    });

  function inferPolicyFromPath() {
    const file = (location.pathname.split("/").pop() || "").toLowerCase();
    if (file.includes("terms")) return "terms";
    if (file.includes("privacy")) return "privacy";
    return null;
  }

  async function fetchJson(url) {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`Fetch failed: ${url} (${res.status})`);
    return res.json();
  }

  function renderPolicy(root, data) {
    // Normalize incoming data with safe defaults
    const policy = normalize(data);

    const container = document.createElement("div");

    // Title
    const h1 = document.createElement("h1");
    h1.textContent = policy.title || titleCase(policyName);
    container.appendChild(h1);

    // Meta line: Effective Date + Version
    const meta = document.createElement("p");
    meta.className = "policy-meta";
    const eff = policy.effectiveDate ? `Effective Date: ${formatDate(policy.effectiveDate)}` : "";
    const ver = policy.version ? `Version: ${policy.version}` : "";
    meta.textContent = [eff, ver].filter(Boolean).join("  •  ");
    if (meta.textContent) container.appendChild(meta);

    // Divider
    container.appendChild(hr());

    // Intro paragraphs
    (policy.intro || []).forEach((para) => {
      const p = document.createElement("p");
      p.textContent = para;
      container.appendChild(p);
    });

    // Sections
    (policy.sections || []).forEach((sec, idx) => {
      const secWrap = document.createElement("section");
      secWrap.className = "policy-section";
      const h2 = document.createElement("h2");
      h2.textContent = sec.heading || `Section ${idx + 1}`;
      secWrap.appendChild(h2);

      (sec.paragraphs || []).forEach((para) => {
        const p = document.createElement("p");
        p.textContent = para;
        secWrap.appendChild(p);
      });

      if (Array.isArray(sec.bullets) && sec.bullets.length) {
        const ul = document.createElement("ul");
        sec.bullets.forEach((b) => {
          const li = document.createElement("li");
          li.textContent = b;
          ul.appendChild(li);
        });
        secWrap.appendChild(ul);
      }

      if (Array.isArray(sec.notes) && sec.notes.length) {
        sec.notes.forEach((note) => {
          const p = document.createElement("p");
          p.style.color = "var(--muted)";
          p.textContent = note;
          secWrap.appendChild(p);
        });
      }

      container.appendChild(secWrap);
    });

    // Contact (if present)
    if (policy.contact?.mailto || policy.contact?.label) {
      container.appendChild(hr());
      const h2 = document.createElement("h2");
      h2.textContent = "Contact Us";
      container.appendChild(h2);

      const p = document.createElement("p");
      const label = policy.contact.label || policy.contact.mailto || "";
      const mailto = policy.contact.mailto || `mailto:${label}`;
      const link = document.createElement("a");
      link.href = mailto;
      link.textContent = label;
      p.append("For questions, email: ");
      p.appendChild(link);
      container.appendChild(p);
    }

    // Render
    root.replaceChildren(container);
  }

  function normalize(d) {
    return {
      version: str(d.version),
      effectiveDate: str(d.effectiveDate),
      title: str(d.title),
      intro: arr(d.intro).map(str),
      sections: arr(d.sections).map((s) => ({
        heading: str(s.heading),
        paragraphs: arr(s.paragraphs).map(str),
        bullets: arr(s.bullets).map(str),
        notes: arr(s.notes).map(str),
      })),
      contact: d.contact ? { label: str(d.contact.label), mailto: str(d.contact.mailto) } : null,
    };
  }

  function arr(v) { return Array.isArray(v) ? v : []; }
  function str(v) { return v == null ? "" : String(v); }
  function titleCase(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function formatDate(iso) {
    const d = new Date(iso);
    if (isNaN(d)) return iso;
    return d.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
  }
  function hr() {
    const div = document.createElement("hr");
    div.setAttribute("aria-hidden", "true");
    return div;
  }
})();
