# TrendFit Website — Development Guide

**Static GitHub Pages marketing site for the TrendFit iOS fitness analytics app.**
Live at `www.trendfitapp.com` (canonical host, set by `CNAME`). The apex `trendfitapp.com`
and all `http://` variants 301 to it — expected, and the reason Search Console reports
non-www URLs under "Page with redirect". No build step. No dependencies.

---

## Tech Stack

- **HTML5 / CSS3 / Vanilla JS** — no frameworks, no npm
- **Hosting:** GitHub Pages (`main` branch auto-deploys)
- **Local dev:** VS Code Go Live (Live Server) → `http://127.0.0.1:5500`
- **Analytics:** Cloudflare Web Analytics (CORS errors on localhost are expected and harmless)

---

## Project Structure

```
trendfitapp.github.io/
├── index.html              # Homepage (body.home)
├── faq.html                # FAQ page (rendered by js/faq.js)
├── announcements.html      # Announcements shell (rendered by JS)
├── privacy.html            # Policy shell (rendered by JS)
├── terms.html              # Policy shell (rendered by JS)
├── 404.html                # Custom 404 page
├── css/style.css           # Single stylesheet — all pages
├── js/
│   ├── includes.js         # Partial injection + nav active state + header height
│   ├── motion.js           # Motion One scroll-reveal (TFMotion global)
│   ├── announcements.js    # Fetches + renders data/announcements.json
│   ├── faq.js              # Fetches + renders data/faq.json
│   ├── dashboard.js        # Homepage tile hover/expand interaction
│   └── policy.js           # Fetches + renders data/policies/*.json
├── partials/header.html    # Shared header (injected via includes.js)
├── data/
│   ├── announcements.json
│   ├── faq.json            # FAQ content (categories + Q&A entries)
│   └── policies/           # privacy.en.json, terms.en.json
├── images/                 # App screenshots + OG images + SVG logo
├── media/                  # App preview videos
├── sitemap.xml             # 5 canonical www URLs — keep lastmod current
├── robots.txt              # Points at www sitemap
├── CNAME                   # www.trendfitapp.com
└── privacy-policy.html     # Legacy meta-refresh stubs (+ terms-of-service.html);
                            # serve 200 not 301, noindex'd, unlinked — leave them
```

---

## CSS Architecture (`css/style.css`)

Three-tier token system — never use hardcoded hex values in rules:

| Tier | Example | Purpose |
|---|---|---|
| Primitives | `--color-orange-500` | Raw values only — never used directly in rules |
| Semantic | `--surface-card`, `--text-ink`, `--border-accent` | Use these in all rules |
| Theme blocks | `[data-theme="dawn"]`, `[data-theme="dark"]` | Bind primitives to semantic tokens |

`prefers-color-scheme: dark` auto-applies the dark theme without JS.

**Home page scoping:** All homepage rules use `body.home` prefix to avoid bleed onto other pages.

---

## Key Patterns

### Shared Header
Injected via `data-include="partials/header.html"` — never duplicate nav markup in page files.

### Pending Content
```html
<article data-content-pending="true" aria-hidden="true">…</article>
```
Global rule: `[data-content-pending="true"] { display: none !important; }` — hides with no grid gap.
To activate: remove the attribute, add `style="grid-area: <name>"`, expand `grid-template-areas`.

### Dashboard Grid (index.html)
`body.home .dashboard-grid` uses `grid-template-areas` at three breakpoints:
- **>840px** — 12-column, 5 rows: `hero/video` · `tf/stack/zoom` · `priv/pers` · `chal/notif` · `cta`
- **520–840px** — 6-column, 7 rows: `hero` · `video` · `tf/stack` · `zoom/priv` · `pers` · `chal/notif` · `cta`
- **<520px** — 1-column, 10 rows (each area stacked)

Named grid areas: `hero`, `video` (promo tile), `tf`, `stack`, `zoom`, `priv`, `pers`, `chal`, `notif`, `cta`.

Tile classes: `tile-hero`, `tile-promo` (formerly tile-video — now holds promo hero content), `tile-feature`, `tile-row-layout`, `tile-cta-social`.

**Activating a pending tile** (`data-content-pending="true"`): remove the attribute, add `style="grid-area: <name>"` and `tabindex="0" aria-expanded="false"`, add a `feat-img-wrap` SVG, expand all three `grid-template-areas` breakpoints in CSS, add an entry to `TILE_DATA` in `js/dashboard.js` once a screenshot is ready.

### Internal Links
Link the homepage as `href="/"`, never `index.html` — the latter is a crawlable 200-status
duplicate of `/`. Other pages use bare filenames (`faq.html`). Note `js/includes.js`
normalizes an empty path to the *string* `'index.html'` for nav active-state — not a link.

### CSS Version Busting
`css/style.css?v=YYYY-MM-DD-N` — bump when making CSS changes so browsers fetch fresh.

---

## Git Workflow

**Branching:** Work directly on `main` — it auto-deploys to GitHub Pages. There is no
active feature branch. Create one only when explicitly requested.

**Commit style:**
```
Resolve #NN: short description      # omit the prefix when there's no issue

- Bullet detail
- Bullet detail

Co-Authored-By: Claude <model> <noreply@anthropic.com>   # name the model doing the work
```

**CHANGELOG.md** must be updated in every feature commit. A post-commit hook will remind if skipped. Exception: `CLAUDE.md`-only commits do not require a CHANGELOG entry.

---

## Important Constraints

- **No build tools** — do not introduce npm, bundlers, or preprocessors
- **No hardcoded hex values** — use semantic tokens only
- **Foundation-only rule does NOT apply here** — this is a web repo, not the iOS app
- **Quote hygiene** — always use straight ASCII double quotes `"` in HTML attributes; smart/curly quotes (`"`) break attribute parsing
