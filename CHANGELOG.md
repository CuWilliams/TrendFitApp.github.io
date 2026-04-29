# Changelog

All notable changes to the TrendFit website are documented here.

## [Unreleased] — v2.0.0 overhaul

### Added
- `privacy-policy.html` — proper HTML redirect page (instant meta-refresh + canonical) for legacy `/privacy-policy` URL (Issue #8)
- `terms-of-service.html` — proper HTML redirect page (instant meta-refresh + canonical) for legacy `/terms-of-service` URL (Issue #8)
- Motion One animation library (~3 KB) via jsDelivr CDN, loaded on all pages through `partials/header.html` (Issue #19)
- `js/motion.js` — global animation utilities: `prefers-reduced-motion` guard (with live OS setting tracking via `matchMedia` listener), `IntersectionObserver` scroll-reveal for `.reveal` elements, and `window.TFMotion.reducedMotion` accessor for Phase 2 consumers (Issue #19)

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
