# Changelog

All notable changes to the TrendFit website are documented here.

## [Unreleased] — v2.0.0 overhaul

### Added
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
