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
├── features.html           # Long-form description of every mode (body.page-features)
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
├── media/                  # App preview videos — every file here is referenced;
│                           #   3.0.0 deleted 27 MB that was not
├── bimi-logo.svg           # Unreferenced BY DESIGN — an email BIMI DNS target,
│                           #   not a page asset. Do not "tidy" it away
├── sitemap.xml             # 6 canonical www URLs — keep lastmod current
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

**Dark-first, not dark-as-an-option.** Every page renders on a dark scene unless dawn is
explicitly opted into, so `--glass-*` and `--mode-*` take their **dark** values at bare `:root`
and are rebound only under `[data-theme="dawn"]`. Dawn is not the fallback. Defining a glass or
mode value only inside the dawn block leaves it undefined on the default rendering.

**Text vs. graphics is a token-level distinction.** `--accent-brand1` is for fills, borders and
SVG strokes, which answer to 3:1. `--accent-brand-text` is for text and meaning-bearing glyphs,
which answer to 4.5:1, and it resolves to a darker orange on dawn where the brand orange measures
2.16:1 on the cream ground. Reaching for `--accent-brand1` on a text colour reintroduces that bug.

### Glass tokens

The glass layer is 27 tokens bound per theme — the surface (`--glass-bg`, `--glass-blur`,
`--glass-border`, `--glass-shadow`, `--glass-shadow-hover`), the text roles
(`--glass-heading`, `--glass-body`, `--glass-muted`, `--glass-faint`, `--glass-strong`,
`--glass-tagline`, `--glass-list-accent`), and the `--glass-hero-*`, `--glass-promo-*`,
`--glass-panel-*` and `--glass-ghost-*` variants. Rules consume the token; they never restate an
`rgba()` literal. Before 3.0.0 every value was hardcoded
and then re-stated inside `[data-theme="dawn"] body.home …` override blocks — those are gone, and
re-introducing one is how the two themes drift apart again.

### Mode identity tokens

`--mode-trendfit` (blue) · `--mode-stack` (indigo) · `--mode-group` (teal) ·
`--mode-challenge` (orange) mirror the four app screen tints. Dark values are Apple's system
colours verbatim; the dawn values are darkened until they clear 4.5:1 on cream, and the measured
ratios are recorded beside the primitives — keep that habit when adding one.

On the homepage a tile sets `--tile-accent` from its `data-mode` attribute, and the icon plus the
3px top rail read that single value. Both are decorative (the tile title names the mode beside
them) so they answer to 3:1. Titles and body copy stay on `--glass-heading` / `--glass-body`.

### Page scoping

**Homepage:** all rules use the `body.home` prefix to avoid bleed onto other pages.

**The six non-home pages** share `body.page-doc` and differ only by two custom properties set on
the page's own body class:

```css
body.page-features      { --page-accent: 139, 92,246; --page-card-border-a: .22; }
```

`--page-accent` is an **unwrapped RGB triple**, deliberately — it is composed at several alphas
via `rgba(var(--page-accent), .28)`, which a finished colour cannot be. A new page needs a body
class, those two declarations, and nothing else; it must not be added to enumerated selector
lists, which is what `body.page-doc` replaced.

---

## Key Patterns

### Shared Header
Injected via `data-include="partials/header.html"` — never duplicate nav markup in page files.
Five nav items since 3.0.0: `Features · Announcements · FAQ · Privacy · Terms`. Active state is
matched on `href`, so a new page picks it up with no JS change.

`.site-header` is `position: fixed`, and `js/includes.js` measures the real header and writes it
to `--header-h`. The stepped `body` top-padding rules below 1180px are therefore
`max(var(--header-h), Npx)` — **floors, not overrides**. A hard value there beats the measurement
and puts the fixed header on top of the first heading as soon as the nav wraps to two rows, which
the fifth pill does below 520px. If a sixth item is ever added, re-check that band first.

### Pending Content
```html
<article data-content-pending="true" aria-hidden="true">…</article>
```
Global rule: `[data-content-pending="true"] { display: none !important; }` — hides with no grid gap.
To activate: remove the attribute, add `style="grid-area: <name>"`, expand `grid-template-areas`.

It also works on **part** of a tile. The TrendFitGroup and Compare Years tiles shipped with it on
the `.feat-img-wrap` alone until their screenshots arrived, so the copy, tint and "Learn more"
link all shipped while only the missing screenshot's slot collapsed. Prefer that to hiding a
whole tile — hiding the flagship feature until a screenshot exists is the worse trade. Nothing
carries the attribute today.

Any image activated this way needs its real `width`/`height` before it lands; every other `<img>`
on the site declares its box, and the odd one out is the one that shifts the layout.

### Screenshots and videos come from the app repo

Every feature tile's PNG and hover MP4 is produced by the Simulator pipeline in the app repo
(`TrendFitApp_App/Tools/Demo/README.md`): a seeded HealthKit store, a scripted autopilot, and
`record.sh`, which writes `<script>.mp4` — the README's table maps those to the names in
`media/`. Re-recording a tile means re-running that script there, not screen-recording a phone.

**The PNG and the MP4 are the same script.** `stills.sh` there plays a script to a frame the
script itself marks and screenshots it, so a tile's rest state is a frame of its own hover video.
Six of the seven scripts carry a mark; `challenge-notifications` has no still. Do not replace a
tile PNG with a hand capture — that is what let the six stills sit a whole dataset behind the
seven videos. Framing is the crop table in `stills.sh`, not `object-position` here: `.feat-img`
is `width:100%; height:auto`, so the box already matches the file's aspect ratio and there is
nothing for `object-fit: cover` to crop. What the tile shows is the top of the file, clipped by
`.feat-img-wrap`'s height.
All seven takes are portrait 1170×2544 (the tiles use `object-fit: cover`, so the 12px over the
old 2532 does not show). `zoomablecharts.mp4` was a 1036×740 crop of the chart card until 3.0.0;
it is a full-screen take like the rest now, and `#tile-zoom` goes through `TILE_DATA` with no
bespoke video markup or CSS.

### Dashboard Grid (index.html)
`body.home .dashboard-grid` uses `grid-template-areas` at three breakpoints, carrying **thirteen**
areas since 3.0.0:

- **>840px** — 12-column, 6 rows: `hero/video` · `beta` · `tf/stack/group` · `chal/years/zoom` · `priv/pers` · `notif/cta`
- **520–840px** — 6-column, 10 rows: `hero` · `video` · `beta` · `tf/stack` · `group/chal` · `years/zoom` · `priv` · `pers` · `notif` · `cta`
- **<520px** — 1-column, 13 rows (each area stacked, in that same reading order)

Named grid areas: `hero`, `video` (promo tile), `beta`, `tf`, `stack`, `group`, `chal`, `years`,
`zoom`, `priv`, `pers`, `notif`, `cta`.

**All three breakpoints must be edited together** — the 520–840 band is the one routinely
forgotten. An area named in the HTML but missing from a breakpoint's template silently drops the
tile out of the grid flow at that width only.

An area name now matches the tile that occupies it. It did not before 3.0.0: the 2.0.0 overhaul
swapped the Challenge and Zoomable Charts tiles without renaming their areas, so `grid-area: zoom`
held the Challenge tile for four months. Keep them in step.

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

**Branching:** Work directly on `main` — it auto-deploys to GitHub Pages, so a commit there
*is* a production deploy. Create a branch only when explicitly requested.

**Active branch: `feature/v3-site-revamp`** — the 3.0.0 revamp for the app's v2.0 public beta,
branched by explicit request precisely because `main` auto-deploys. It must not merge until
(a) the maintainer approves and (b) the public TestFlight link is live. `grep -rn "PLACEHOLDER" .`
must return nothing first — a dead "Join the Beta" button is worse than no button.

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
