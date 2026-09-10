# Changelog

All notable changes to the TrendFit website are documented here.

## [3.0.0] — unreleased

Site revamp for the TrendFit iOS **v2.0 public beta**. Being prepared on the branch
`feature/v3-site-revamp` rather than directly on `main`, by explicit request — `main`
auto-deploys, so merging is the production release and waits on the live TestFlight link.

### Fixed
- Brand orange failed WCAG AA as text on the dawn (light) theme: `#FF8C00` on the cream ground measures **2.16:1** against a 4.5:1 requirement. This is the web mirror of the app's #149 defect. Added `--accent-brand-text`, which resolves to `#FF8C00` on dark and `#A34900` (**5.54:1**) on dawn — the same value the app uses for its `WarningAccent` light variant, so site and app now agree on the shade. Applied to the hero badge, hero accent, hero checkmark glyphs, the what's-new link, and `.expand-intro-accent`. Decorative bullet glyphs stay on `--accent-brand1`: they answer to 3:1, not 4.5:1
- FAQ headings and disclosure markers on dawn used a hand-rolled `rgba(200,100,0)` at **3.68:1** — also short of AA for a 1.1rem heading. Now `--faq-accent-heading` / `--faq-accent-marker`, taking the AA-safe value on dawn
- The `body.page-doc` consolidation above silently swallowed two accent colours on dawn, because `[data-theme="dawn"] body.page-doc h2` and `… body.page-doc p` outrank `body.page-faq .faq-category-heading` and `body.page-features .mode-kicker` — the attribute selector adds a class-column point the page rules cannot match. The FAQ category headings and all four mode kickers were rendering as plain ink and muted grey on the light theme. Restated at dawn's own specificity rather than weakening the blanket rules, which are what keep a new doc page correct with no per-page CSS. Dark was never affected
- `#tile-zoom` carried `aria-expanded="false"` while having no expand panel to open — it is the one focusable tile with no `TILE_DATA` entry, by design, so a screen reader was announcing a collapsed state that could never change. Attribute dropped; the tile stays focusable

### Added
- `--glass-*` token set (surface, blur, border, shadow, hover shadow, six text roles, and the hero/promo/panel/ghost-button variants), bound once per theme. Dark-first at `:root` and rebound under `[data-theme="dawn"]`, because every page on this site renders on a dark scene unless dawn is opted into — dawn is not the fallback
- `--mode-trendfit` / `--mode-stack` / `--mode-group` / `--mode-challenge` mode-identity tokens, mirroring the four app screen tints. Dark values are Apple's system colours verbatim; three of the four fail on the cream ground, so the dawn values are darkened until they clear 4.5:1 there. Measured ratios are recorded beside the primitives
- **New page: `features.html`** — the canonical long-form description of every mode, headed by the app's own four questions verbatim, plus "Built to be readable", "Your data never leaves your iPhone" and "Requirements". Static HTML rather than a `data/features.json` rendered client-side: this and the homepage are the two SEO-critical surfaces, and the other four pages already put their content behind `fetch()`. Carries a violet accent (`--page-accent: 139,92,246`), the one hue still free after FAQ moved to amber
- A **Features** link, first in the shared nav (`Features · Announcements · FAQ · Privacy · Terms`)
- `body.page-doc` — a shared class on all six non-home pages, and `--page-accent` / `--page-card-border-a` per page, so a page's identity is one declaration instead of a name added to twenty selector lists
- `js/faq.js` renders an optional `link` object on an FAQ entry as a real `<a>` element. Answer text is escaped through `esc()` on the way in, so markup inside `a` is impossible by design — the pointer had to be structured data, not inline HTML
- Homepage tile: **TrendFitGroup** (teal), the flagship of app v2.0 — route-matched trends for the loops you repeat
- Homepage tile: **Compare Years** (indigo, because it is a TrendFitStack feature rather than a fifth mode)
- The TrendFitGroup and Compare Years tiles now ship their screenshots (`images/route-carousel.png`, `images/compare-years.png`, palette-quantised like the rest) and hover videos (`media/trendfitgroup.mp4`, `media/compare-years.mp4`), so the two `data-content-pending` slots are gone and every feature tile carries a real image box. Both come from the app repo's Simulator pipeline (`Tools/Demo/README.md` there): a seeded HealthKit store and a scripted autopilot driving the ViewModels, so every gesture is an eased animation rather than a mouse drag
- Every other walkthrough — `trendfit`, `trendfitstack`, `trendfitchallenge`, `zoomablecharts`, `challenge-notifications` — is re-recorded from that same pipeline in the light appearance the tiles use, with a `9:41` status bar and a still closing hold so the loop has a rest point. The App Store promo video is untouched
- Homepage tile: a full-width **beta CTA band** under the hero — "Join the v2.0 Beta" to TestFlight, "See what's new" to `features.html`, and the feedback address
- Mode tints on the feature tiles, carried by `--tile-accent`: a 3px rail across the top of the tile and the tile's icon. Both are decorative — the title names the mode beside them — so they answer to 3:1 rather than 4.5:1, which is the margin they need: against the lightest ground a home tile can sit on (`#423325`, the orange page radial at its centre under the .05 white glass) blue measures 3.32:1 and indigo 3.44:1
- "Learn more →" from each mode tile into its `features.html` section, and a Features link in every page footer
- Explicit `width`/`height` on every `<img>` the site ships — the five homepage screenshots from their real pixel dimensions, and both instances of the app icon SVG (28×28 in the header, where CSS renders it at that size; 1024×1024 on the hero, where CSS sizes it and the attributes only carry the ratio) — so each reserves its space before the image decodes
- Pinned announcement `v2.0-beta`, covering TrendFitGroup, activity filtering and the LATEST badge, Compare Years, the 24- and 36-month ranges, the twelve accessibility issues, and the redesigned entry screen. It states the route bounds the app itself states — 200 most recent outdoor workouts from the last 365 days, occurrences rather than calendar days — so the site does not promise history the app will not draw
- The announcement sets the upgrade expectation explicitly: Workout Routes is a **new row** on Apple's Health sheet, so upgrading users are asked again. Left unsaid it reads as a privacy regression, when the opposite is true — v2.0 removed 15 unused data types and asks for less than v1.5 did. Declining Workout Routes leaves everything but TrendFitGroup working
- `sitemap.xml` carries `features.html` at priority 0.9, and every `lastmod` moves to the revamp date. A comment in the file records that these are the date the work was done, so they need rolling forward if the merge slips past it — a `lastmod` that predates its own deploy is worse than none

### Removed
- **27 MB of orphaned media**, which GitHub Pages was serving to nobody: `media/app-preview.mp4` (15 MB) and `media/App_Store_Promo.mp4` (12 MB), plus `images/tf-stack-stacked.png`, `images/tf-welcome.jpg`, `images/app-preview-poster.jpg` and `images/og-default.svg`. Each was confirmed unreferenced across every HTML, CSS, JS and JSON file first — `og-default.svg` matched only its own filename embedded in its metadata, and `images/tf-stack-scatter.png` looked orphaned under a careless grep but is live on the homepage, so it stays
- `bimi-logo.svg` is deliberately **kept** despite being unreferenced by every page. BIMI is an email DNS record pointing at the file over HTTPS; nothing links to it and nothing should. Do not "tidy" it away

### Changed
- Glass surfaces on the homepage and on the five non-home pages now consume the shared tokens instead of restating literal `rgba()` values, and the ~75-line `[data-theme="dawn"] body.home …` override block plus the duplicated non-home dawn glass base were deleted. No user-visible behavior change: the rendered output in both themes is unchanged apart from the two contrast fixes above
- About twenty five-page enumerated selector lists (page text colours, header, nav pills and their three states, theme toggle, footer and its links — in both the dark and the dawn half) collapsed onto `body.page-doc` with the hue composed from `rgba(var(--page-accent), …)`. Net effect: `css/style.css` got shorter while gaining a sixth page scene. No user-visible behavior change
- `data/faq.json` answers questions instead of re-describing features. "What is TrendFit / TrendFitStack / TrendFitChallenge?" are each one sentence now, followed by a link into the matching `features.html` anchor; a "What is TrendFitGroup?" entry joins them. "What health data does TrendFit access?" names Workout Routes and the 15 data types v2.0 stopped asking for; the device and personalisation entries pick up iOS 18, the route requirement, and the 24- and 36-month windows
- The stepped `body` top-padding rules below 1180px are now `max(var(--header-h), …)` rather than fixed values. `js/includes.js` already measured the real header and wrote it to `--header-h`; the fixed values were overriding that measurement, so the fifth nav pill — which takes the pills to two rows below 520px — would have left the fixed header sitting on the first heading. The old values survive as floors, so nothing changes where the header is shorter than the guess
- Homepage grid rebuilt at all three breakpoints to carry thirteen areas instead of ten. The `zoom` and `chal` areas are also renamed to match the tiles that occupy them: the 2.0.0 overhaul swapped the two tiles without renaming the areas, so `grid-area: zoom` had been holding the Challenge tile for four months
- Hero: badge reads **v2.0 Public Beta**, a routes bullet joins the list, and the what's-new link points at the v2.0 announcement
- The bottom CTA promotes the beta to the primary button; the App Store demotes to the secondary row and is labelled **App Store (v1.5)**, which is what it actually serves while the beta runs
- `TILE_DATA` in `js/dashboard.js` drops the `benefit` string from all four video tiles. It never rendered — `.tile-expand.has-video` sets `.expand-benefit` to `display: none` — so the copy was invisible maintenance. That prose lives on `features.html`, which each tile now links to. The two new tiles have no recording yet and so carry a benefit panel
- Homepage `© 2025` → `© 2026`, in the CTA tile and the site footer, and on the other five pages
- `v1.5-now-live` unpinned but still published — the App Store is still serving it
- **`softwareVersion` in the `MobileApplication` JSON-LD deliberately stays `"1.5"`, and `datePublished` is untouched.** Structured data describes the app a visitor can install, and during a TestFlight beta that is still 1.5. Both bump at GA, not now. The block's `description` is left alone for the same reason — it should describe 1.5 while it claims to be 1.5
- Bumped the CSS cache-bust string to `?v=2026-09-08-3` across all seven page files, and `VERSION` in `js/faq.js` and `js/announcements.js`
- Every shipping screenshot recompressed to a 256-colour palette: `images/` drops from **4.6 MB to 916 KB**. These are flat-colour UI captures — the largest holds 45,750 unique colours almost entirely in anti-aliasing — so the quantisation is invisible at the size a tile renders them. Each was checked both ways before landing: RMSE against the original (0.39%–1.04%, worst case `trendfitchallenge.png`) and a side-by-side at display scale. `pngquant`/`optipng`/`oxipng` are not installed on the maintainer's machine; this is ImageMagick's `-colors 256`, which needs no new dependency
- `robots.txt` no longer disallows `/design/` or `/beta-feedback.html`; neither path has existed for some time, and a `Disallow` for a 404 only advertises a URL that was once interesting
- `index.html` meta, Open Graph and Twitter descriptions mention the repeated GPS routes, which is the headline of app v2.0. The meta description lands at 152 characters, inside the ~155 where Google truncates
- `images/zoomablecharts.png` also downscaled 2296→1500px wide (1.1 MB → 86 KB, the single largest saving). 1500px is not arbitrary: the widest a homepage screenshot ever renders is the single-column band below 520px, ~495 CSS px inside the container's padding, so 1500 still has headroom at a 3× device pixel ratio. Its `width`/`height` attributes were updated to match — the source of truth is the file, not the old markup. The three phone screenshots are left at their capture size, which is already under that ceiling

## [2.0.3] — 2026-08-17

### Changed
- Home links now point at the root path `/` instead of `index.html` (shared header brand link in `partials/header.html`, 404 page "Home" button) — every page previously emitted an internal link to `/index.html`, a 200-status duplicate of `/` that Google Search Console surfaced as a separate crawled URL under "Page with redirect"

## [2.0.2] — 2026-06-11

### Changed
- All absolute site URLs updated from apex `https://trendfitapp.com` to `https://www.trendfitapp.com` to match the new Pages CNAME (canonical links, hreflang alternates, Open Graph/Twitter URLs and images, JSON-LD structured data, sitemap `loc` entries, robots.txt sitemap reference) — canonical URLs no longer point through a 301 redirect

## [2.0.1] — 2026-06-11

### Added
- Pinned v1.5 release announcement (`v1.5-now-live`) covering the rebuilt trend-color classification, cross-chart trend line refresh on zoom/pan, the TrendFitStack "Avg" pill clipping fix, and the refreshed in-app FAQ; v1.4 announcement unpinned
- FAQ entry "What do the red, yellow, and green trend lines mean?" (Features category), aligned with the v1.5 in-app FAQ wording

### Changed
- Homepage hero badge and what's-new link updated v1.4 → v1.5; `softwareVersion` in MobileApplication structured data updated to 1.5
- Hero metric-breadth bullet no longer lists VO₂max — it is not a selectable metric in the app (Apple stores it as a standalone sample, not workout-linked)
- FAQ: removed stale "(Beta)" label from the TrendFitChallenge entry (GA since v1.4)
- Bumped JSON cache-bust versions in `js/announcements.js` and `js/faq.js`; refreshed `sitemap.xml` lastmod dates for home, FAQ, and announcements pages

## [2.0.0] — 2026-05-31

### Fixed
- Announcements badge never appeared in nav — `includes.js` was fetching `announcements.json` (404) instead of `data/announcements.json`

### Changed
- **Dawn (light) mode — home page**: replaced near-black background with warm cream gradient (`#fdf5eb → #fffaf4`) with brand-orange radial glows; tiles now use high-opacity white frosted glass (`rgba(255,255,255,.72)`) with orange accent borders; all hardcoded white-rgba text (headings, body copy, hero title/kicker/bullets, CTA tagline, ghost button, social links, footer) overridden to `--text-ink` / `--text-muted` semantic tokens
- **Dawn mode — expand panels**: Privacy-First and Instant Clarity tile hover panels now render with `rgba(255,255,255,.92)` frosted glass background instead of the dark `rgba(7,11,22,.94)` base; text tokens already in place now read correctly
- **Instant Clarity sparkline SVG**: baseline stroke and scatter dot fills replaced with CSS custom properties (`--sparkline-base-stroke`, `--sparkline-dot-fill`); dark defaults preserved on `body.home`, dawn overrides use `rgba(0,0,0,…)` values so the graphic renders visibly on the cream tile
- **FAQ color scheme**: recolored from violet (`rgba(139,92,246,…)`) to amber/brand-orange (`rgba(255,140,0,…)`) throughout — page background, card borders, category headings, expand toggles, item borders, hover ring, nav pill borders, hover/active pill states, and all dawn-mode counterparts
- **Nav pill order**: Announcements now leads, FAQ follows (updated `partials/header.html`)
- **Dawn mode — per-page nav pill borders**: all non-home pages now render per-page accent borders in dawn mode (sky blue / amber / emerald / indigo / red) matching the dark mode behavior, replacing the uniform orange border that previously applied to all pages
- Updated `trendfitchallenge.png` screenshot

### Changed
- Privacy-First tile hover panel: replaced single benefit paragraph with an intro line + 5 HealthKit-specific bullets (read-only access, approve metrics, revoke anytime, no upload, on-device analysis); intro line highlights "Apple HealthKit" in orange accent; `buildExpandPanel` extended to support `introHtml` (renders via `innerHTML`) and `bullets` array (renders `<ul class="expand-bullets">` with `<strong>` labels)
- Personalization tile renamed to **Instant Clarity**: icon changed to `fa-bolt`, copy rewritten to lead with speed-to-insight value prop; SVG replaced with an upward sparkline (scattered data dots + orange trend line + orange bullseye endpoint); hover panel updated with intro + 5 bullets contrasting TrendFit's one-tap trend view against the effort required in Apple Fitness
- `css/style.css` — added `.expand-intro` (semi-bold white, 13 px), `.expand-intro-accent` (orange brand color, bold), `.expand-bullets` / `li` / `li::before` / `li strong` rules; explicit `rgba(255,255,255,…)` colors used throughout to avoid `--text-muted` rendering as dark text on the dark overlay panel; `min-height: 210px` added to both `#tile-privacy` and `#tile-personal` so row-layout tiles have room for the full hover content

### Added
- Zoomable Charts tile: real screenshot (`zoomablecharts.png`) replaces SVG placeholder; tagline updated to "Explore every detail, at any scale."; four orange bullet points listing pinch-zoom, pan, double-tap reset, and long-press data reveal interactions
- Zoomable Charts image-area-only hover video (`zoomablecharts.mp4`): video fades in over the screenshot on hover while title, tagline, and bullets remain visible above — tile removed from `TILE_DATA` (no full-tile expand panel); dedicated `mouseenter`/`mouseleave` JS handler added to `init()`; `.zoom-hover-video` CSS rules added
- Challenge Notifications tile: real screenshot (`challenge-notifications.png`) and hover video (`challenge-notifications.mp4`) replace SVG placeholder; `dashboard.js` path updated to `media/challenge-notifications.mp4`
- `.feat-bullets` CSS class: orange (`--accent-brand1`) bullet markers and text, compact gap-based list layout, used by Zoomable Charts tile
- Real app screenshots (`trendfit.png`, `trendfitstack.png`, `trendfitchallenge.png`) and hover screen recordings (`trendfit.mp4`, `trendfitstack.mp4`, `trendfitchallenge.mp4`) wired into the three second-tier feature tiles; old `tf-trendfit.png` removed
- `has-video` CSS pattern for expand panels: when a tile has a video, the recording fills the full tile overlay (`position: absolute; inset: 0; object-fit: cover`) and the benefit text is hidden — video speaks for itself
- Hero kicker restyled: larger (`clamp(17px, 2.2vw, 24px)`), italic, semi-bold, bright white with a subtle orange ambient glow (`text-shadow`)

### Changed
- Hero kicker copy updated to "Your data knows. Now you will too."
- Hero bullets rewritten as evergreen marketing pillars (trend intelligence, challenges, metric breadth, privacy) replacing changelog-style v1.3→v1.4 entries
- Feature tile taglines updated: TrendFit → "See your trend for any workout, any metric — in an instant."; TrendFitStack → "Your week vs. your year. One sport vs. another. See it all at a glance."; TrendFit Challenge → "Set a goal, track every step, and celebrate — all on your device."
- Tile renamed from "Challenges" to "TrendFit Challenge" to match app screen name
- Tile grid positions swapped: TrendFit Challenge moved to `zoom` area (second tier alongside TrendFit and TrendFitStack); Zoomable Charts moved to `chal` area — second tier now follows the app's natural screen flow
- `feat-img-wrap` top-aligned: removed `margin-top: auto` and changed `align-items` from `flex-end` to `flex-start` so screenshots anchor at the top of the image area
- `dashboard.js` — `buildExpandPanel` adds `has-video` class when tile has a video; `TILE_DATA` video paths updated to match new asset naming convention (`media/trendfit.mp4`, `media/trendfitstack.mp4`, `media/trendfitchallenge.mp4`)
- `index.html` tile DOM order resequenced to match visual grid reading order: TrendFit → TrendFitStack → TrendFit Challenge → Privacy-First → Personalization → Zoomable Charts → Challenge Notifications → CTA
- `#tile-challenge-notifications .feat-img-wrap` — `align-items: center` vertically centres the screenshot within the wrap; `class="feat-img"` added to image for consistent `border-radius: 8px` rounded corners and `loading="lazy"`
- Updated `trendfit.png`, `trendfitchallenge.png`, and `trendfit.mp4` with refreshed captures

### Added
- Full dark glass-morphism visual redesign across all pages — deep charcoal background with radial brand-color glows, frosted glass cards (`backdrop-filter: blur(20px) saturate(1.4)`), hover lift + per-page glow ring, staggered `tileReveal` entrance animation
- `index.html` hero tile restructured — `hero-top` flex row (icon top-left + v1.4 badge pill), `hero-body` fills remaining height; title enlarged to `clamp(32px, 4.5vw, 58px)`; bullets styled with orange `✓` markers; "What's new →" link
- Real app screenshots wired into TrendFit and Stack feature tiles (`tf-trendfit.png`, `tf-stack-stacked.png`) replacing placeholder SVGs; area-fill gradient added to Zoom tile SVG
- Per-page dark background scenes for all non-home pages — each page has a distinct accent glow: sky blue (Announcements), violet (FAQ), emerald (Privacy), indigo (Terms), red (404)
- Per-page glass card treatment — `.card.announce`, `.faq-category`, `.policy-section`, `.oops .container` each get frosted glass with per-page accent-colored border
- Dark glass header on non-home pages — always dark regardless of theme toggle; nav pill borders match each page's accent color; hover/active pill tinted with page accent
- Dark glass footer on non-home pages
- Genuine dawn/dark mode for non-home pages — dark mode: cool charcoal glass; dawn mode: light cream background + high-opacity white frosted glass + orange-pastel nav pills + dark text
- v1.4 pinned announcement in `data/announcements.json` — consumer-friendly, covers Challenges, on-device notifications, trend color accuracy, calorie accuracy, chart data fixes; App Store download link; old beta announcement suppressed

### Changed
- `data/announcements.json` — `v1.4.0-beta` marked `published: false`, `pinned: false` (superseded by new v1.4 release announcement)
- `js/announcements.js` — cache-bust version bumped to `2026-05-28-1`
- `faq.html`, `announcements.html`, `privacy.html`, `terms.html`, `404.html` — body class changed from `bg-gradient` to `page-<name>` for per-page dark glass scoping


- `faq.html` — standalone FAQ page (shell pattern matching `privacy.html`/`terms.html`); SEO meta, OG, Twitter Card
- `js/faq.js` — fetches `data/faq.json` and renders `<details>`/`<summary>` accordion by category into `#faq-root`; follows `announcements.js` fetch pattern
- `data/faq.json` — 14 Q&A entries across four categories: Privacy & Data, Getting Started, Features, Challenges; seeded from existing site copy and announcement content
- FAQ link added to shared nav (`partials/header.html`) and all page footers (index, faq, announcements, privacy, terms, 404)
- `.faq-category`, `.faq-category-heading`, `.faq-item`, `.faq-question`, `.faq-answer`, `.faq-error` CSS rules in `css/style.css`; accordion uses native `<details>` with `+`/`×` toggle via `::after`
- `tile-challenges` and `tile-challenge-notifications` dashboard tiles activated in `index.html`; grid areas `chal` and `notif` added to all three CSS breakpoints; placeholder SVGs (goal progress bars / notification cards) in each `feat-img-wrap`
- `tile-promo` tile in `index.html` — replaces the portrait phone video tile; displays promo hero (h2, subtitle, `App_Store_Promo-V1.2.mp4`, App Store CTA); scoped `body.home .tile-promo` CSS rules preserve warm-surface + orange-glow tile aesthetic

### Changed
- `js/dashboard.js` — tile expand panels for 5 feature tiles (TrendFit, TrendFitStack, Zoomable Charts, Challenges, Challenge Notifications) now reveal a looping muted `<video>` on hover instead of a static image; Privacy-First and Personalization tiles now reveal text only (no image); `TILE_DATA` entries added for `tile-challenges` and `tile-challenge-notifications` (previously unregistered); `reducedMotion` moved to module scope; `openTile` calls `vid.play()`, `closeTile` calls `vid.pause()` + resets `currentTime`; video files expected at `media/tile-{trendfit,stack,zoom,challenges,notif}.mp4`
- `css/style.css` — `.expand-video` rule added (mirrors `.expand-img` layout; adds `display: block`)
- `index.html` CTA tile — "Learn more about features" row replaced with "Have questions? → FAQ" row
- `index.html` reduced-motion script — selector broadened to catch `video.app-store-promo-video` (replaces `video.preview` which no longer exists)
- `404.html` — Features button replaced with FAQ button
- `data/announcements.json` — all `features.html` links redirected: `features.html#challenges` → `faq.html`, `features.html#screenshots` → `index.html`, remaining `features.html` → `faq.html`
- `js/dashboard.js` — removed `btn-appstore` CTA from tile expand panels; removed `APP_STORE_URL` constant; removed `btn-appstore` click-guard from touch handler
- `css/style.css` — removed `body.home .tile-video`, `.video-wrap`, `.preview` rules and two responsive `preview` height overrides; removed `.tile-expand .btn-appstore` and `:hover` rules; added `video` to global `img, svg` max-width rule
- `CLAUDE.md` — project structure updated (features.html removed, faq.html/faq.js/faq.json added, dashboard.js listed); Dashboard Grid section updated with correct row counts, named grid areas, tile classes, and full pending-tile activation checklist

### Removed
- `features.html` — page retired; content consolidated into `index.html` (hero → promo tile, feature tiles) and `faq.html` (FAQ section)
- `partials/header.html` — Features nav link removed

### Added
- `<meta name="theme-color">` to `features.html`, `privacy.html`, and `terms.html` — dawn value `#FF8C00`, updated dynamically to `#1c1c1e` in dark mode via `syncThemeColorMeta()` in `js/includes.js` (Issue #28)
- Full Open Graph block (`og:type`, `og:site_name`, `og:title`, `og:description`, `og:image`, `og:image:width/height/alt/type`) to `features.html`, `privacy.html`, and `terms.html` (Issue #28)
- Twitter Card block (`twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`, `twitter:image:alt`) to `features.html`, `privacy.html`, and `terms.html` (Issue #28)
- `syncThemeColorMeta()` helper in `initThemeToggle()` (`js/includes.js`) — updates `<meta name="theme-color">` content on page init and on each theme toggle click (Issue #28)
- Theme toggle button (☀️/🌙) in `partials/header.html` — pill-style, matches nav, switches between `dawn` and `dark` themes (Issue #26)
- Inline theme-init `<script>` in all five HTML pages — reads `localStorage('theme:preference')` and sets `data-theme` on `<html>` before CSS parses, preventing flash-of-wrong-theme (Issue #26)
- `initThemeToggle()` in `js/includes.js` — wires toggle click handler, persists preference to `localStorage`, and syncs `aria-label` to current state (Issue #26)
- Theme transition block in `css/style.css` — `background-color`, `color`, and `border-color` transitions on key elements under `@media (prefers-reduced-motion: no-preference)` (Issue #26)
- `privacy-policy.html` — proper HTML redirect page (instant meta-refresh + canonical) for legacy `/privacy-policy` URL (Issue #8)
- `terms-of-service.html` — proper HTML redirect page (instant meta-refresh + canonical) for legacy `/terms-of-service` URL (Issue #8)
- Motion One animation library (~3 KB) via jsDelivr CDN, loaded on all pages through `partials/header.html` (Issue #19)
- `js/motion.js` — global animation utilities: `prefers-reduced-motion` guard (with live OS setting tracking via `matchMedia` listener), `IntersectionObserver` scroll-reveal for `.reveal` elements, and `window.TFMotion.reducedMotion` accessor for Phase 2 consumers (Issue #19)
- Hidden Challenges `<section>` slot in `features.html` with two image placeholder slots (`data-final-src` swap points) and a `<video>` slot for the future Challenges promo video (Issue #20)
- Two hidden dashboard tile slots in `index.html` (`#tile-challenges`, `#tile-challenge-notifications`) with named SVG placeholder, img slot, and benefit copy stubs in HTML comments — ready for v2 grid layout (Issue #20)
- Draft `v1.4.0-app-store` announcement entry in `data/announcements.json` with `"published": false` — invisible until flipped to `true` (Issue #20)
- `[data-content-pending="true"] { display: none }` utility rule in `css/style.css` to hide all pending slots (Issue #20)

### Changed
- `index.html`, `announcements.html` — corrected `<meta name="theme-color">` from `#FF6A00` to `#FF8C00` (aligns with `--color-orange-500` CSS primitive) (Issue #28)
- `css/style.css` — added `.policy-meta` and `.policy-section` rules (moved from inline `<style>` blocks in `privacy.html` and `terms.html`); added `.oops` rules (moved from inline `<style>` block in `404.html`); all color references use `var(--text-muted)` semantic token (Issue #27)
- `privacy.html` — removed inline `<style>` block (rules now in `css/style.css`); bumped CSS version to `2026-05-02-2` (Issue #27)
- `terms.html` — removed inline `<style>` block (rules now in `css/style.css`); bumped CSS version to `2026-05-02-2` (Issue #27)
- `404.html` — removed inline `<style>` block (rules now in `css/style.css`); added missing theme-init `<script>` to prevent flash-of-wrong-theme; bumped CSS version to `2026-05-02-2` (Issue #27)
- `announcements.html`, `features.html`, `index.html` — bumped CSS version to `2026-05-02-2` (Issue #27)
- `features.html` — rewrote all five feature card headings and body copy to benefit-led framing matching dashboard tile labels; replaced one hardcoded `#fff` on the Beta badge with `var(--color-white)` (Issue #25)
- `js/announcements.js` — entries with `"published": false` are now filtered out before render; `published` field defaults to `true` when absent for backwards compatibility (Issue #20)
- `index.html` — replaced two-column flex layout (`left-content` / `right-content`) with CSS Grid dashboard tile structure; 8 named `grid-template-areas`: `hero`, `video`, `tf`, `stack`, `zoom`, `priv`, `pers`, `cta` (Issue #21)
- `css/style.css` — removed old home flex rules (`body.home .page-wrap > .container`, `.left-content`, `.right-content`, `.video-wrap`, `.logo-hero-row`, `@media (max-width: 900px)` home block, `@media (min-width: 901px)` right-content block); added `body.home .dashboard-grid` grid layout with shared `.dash-tile` base, per-tile rules (`tile-hero`, `tile-video`, `tile-feature`, `tile-row-layout`, `tile-cta-social`), and responsive breakpoints at 840 px and 519 px (Issue #21)
- `index.html` — replaced placeholder `<img>` screenshots in TrendFit, TrendFitStack, and Zoomable Charts tiles with hand-authored inline SVGs; added shield/padlock and unit-toggle pair SVG illustrations to Privacy-First and Personalization row-layout tiles; all SVG colors reference CSS semantic tokens (`--trend-positive`, `--accent-action`, etc.) for dark-mode compatibility; each SVG carries `role="img"` and `aria-label` (Issue #22)
- `css/style.css` — added `.feat-svg-wrap` and `body.home .feat-img-wrap svg` rules to support SVG scaling in both standard and row-layout tiles (Issue #22)
- `js/dashboard.js` — tile expand/collapse interaction: hover (desktop) or tap (mobile) reveals benefit copy, a screenshot, and a "Download on the App Store" CTA; collapses on second tap, click-away, or Escape; Motion One choreography when available; instant show/hide when `prefers-reduced-motion` is set (Issue #23)
- `css/style.css` — `.tile-expand` absolute overlay panel with CSS transition fallback, `.btn-appstore` CTA button styles, and `@media (prefers-reduced-motion)` no-transition override (Issue #23)
- `index.html` — added `tabindex="0"` and `aria-expanded="false"` to all five `tile-feature` articles for keyboard and screen-reader support; added `<script defer src="js/dashboard.js">` (Issue #23)

### Changed
- Refactored `css/style.css` color layer into a three-tier token system: 17 primitive `--color-*` variables, semantic tokens (`--surface-*`, `--border-*`, `--text-*`, `--shadow-*`, `--trend-*`), and theme blocks — prerequisite for dark mode (Issue #18)
- Added `[data-theme="dawn"]` block formalizing the existing orange/cream identity
- Added `[data-theme="dark"]` block with iOS app dark palette
- Wired `prefers-color-scheme: dark` to auto-apply dark tokens without JavaScript; theme can also be forced via `data-theme` attribute
- Replaced all hardcoded hex values in style rules with semantic tokens; zero hardcoded hex values remain outside the primitive definitions

---

## [1.3.0] — 2026-04-28

### Added
- v1.4.0 beta announcement (pinned) to data/announcements.json covering TrendFit Challenges, smart target pre-population, edit/delete, custom names, and local push notifications; includes TestFlight link
- TrendFitChallenge feature card (Card 3) to features.html grid, positioned between TrendFitStack and Zoomable Charts; includes Beta pill badge

### Changed
- index.html hero title updated to "v1.4 Beta is Now Live" with a link to the announcements page
- Previous v1.3 App Store announcement un-pinned in favour of the v1.4 beta entry
- Bumped announcements.js cache-bust version to 2026-04-28-1

---

## [1.2.0] — 2026-04-19

### Changed
- Repositioned site as a personal-utility, privacy-first tool; removed community/commercial marketing copy from index.html and features.html
- Redesigned video-wrap container to match warm-panel aesthetic
- Updated contact email to trendfitapp@gmail.com
- Refreshed sitemap.xml lastmod dates for Google Search Console resubmission
- Updated App Store ratings (January 2026)

### Added
- Contact email link to all page footers
- Cloudflare Web Analytics tracking on all pages
- Comprehensive SEO and structured data optimizations
- App Store promo video (V1.2) embedded in Features page

### Removed
- Community, Beta Testers, Beta Feedback, and Sign Up pages (community.html, beta-testers.html, beta-feedback.html, signup.html)
- GitHub Actions monthly SEO automation workflow
- SEO-MAINTENANCE.md, design wireframe SVGs, Announcements-Update-Guide.md
- Duplicate image asset

### Fixed
- Updated Google Search Console site verification file
- Removed signup.html from sitemap; fixed 404.html canonical tag

---

## [1.1.2] — 2025-09-23

### Fixed
- Signup page now loads from the top of the page instead of the bottom

---

## [1.1.1] — 2025-09-22

### Changed
- SEO and meta tag updates across all pages
- Sitemap and robots.txt polish
- Repo hygiene: removed .DS_Store, updated .gitignore

---

## [1.1.0] — 2025-09-19

### Added
- Members Forum page
- Beta Testers recruitment page
- Announcement "new" badge indicator in navbar
- Public beta CTA and App Store launch content
- Branded social preview image (og-default.png)

### Changed
- Refactored site structure (site-refactor branch)
- Converted Beta Feedback page to Members Forum

---

## [1.0.0] — 2025-09-08

### Added
- Initial full-site launch: index, features, announcements, privacy, terms, 404, signup pages
- Core site styling, JavaScript includes, announcements system
- HealthKit-focused content and App Store link
