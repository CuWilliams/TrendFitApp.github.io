# TrendFit Website — Development Guide

**Static GitHub Pages marketing site for the TrendFit iOS fitness analytics app.**
Live at `trendfitapp.com`. No build step. No dependencies.

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
└── media/                  # App preview videos
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

### CSS Version Busting
`css/style.css?v=YYYY-MM-DD-N` — bump when making CSS changes so browsers fetch fresh.

---

## Git Workflow

**Active overhaul branch:** `feature/v2-overhaul` (all v2 issues — do not merge to `main`)
**Parent epic:** Issue #16 (tracks all v2 milestone issues on GitHub)

**Commit style:**
```
Resolve #NN: short description

- Bullet detail
- Bullet detail

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```

**CHANGELOG.md** must be updated in every feature commit. A post-commit hook will remind if skipped. Exception: `CLAUDE.md`-only commits do not require a CHANGELOG entry.

---

## Important Constraints

- **No build tools** — do not introduce npm, bundlers, or preprocessors
- **No hardcoded hex values** — use semantic tokens only
- **Foundation-only rule does NOT apply here** — this is a web repo, not the iOS app
- **Quote hygiene** — always use straight ASCII double quotes `"` in HTML attributes; smart/curly quotes (`"`) break attribute parsing
