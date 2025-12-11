# TrendFit SEO Maintenance Guide

This guide provides instructions for maintaining the SEO and structured data for the TrendFit website.

## 📅 Monthly Updates Required

### 1. Update App Store Ratings (Critical)

**Frequency:** Monthly (1st of each month)
**Time Required:** 5 minutes
**Automation:** GitHub Action creates reminder issue automatically

#### Location
File: `index.html`
Lines: 75-81 (MobileApplication schema)

#### Current Structure
```json
"aggregateRating": {
  "@type": "AggregateRating",
  "ratingValue": "5.0",
  "ratingCount": "7",
  "bestRating": "5",
  "worstRating": "1"
}
```

#### How to Update

1. **Get Current Ratings from App Store Connect:**
   - Visit [App Store Connect](https://appstoreconnect.apple.com/)
   - Sign in with your Apple Developer account
   - Navigate to: My Apps → TrendFit → App Store → Ratings & Reviews
   - Note the current values:
     - **Average Rating** (e.g., 4.8)
     - **Total Ratings Count** (e.g., 42)

2. **Update index.html:**
   ```json
   "aggregateRating": {
     "@type": "AggregateRating",
     "ratingValue": "4.8",      // ← Update this
     "ratingCount": "42",        // ← Update this
     "bestRating": "5",
     "worstRating": "1"
   }
   ```

3. **Commit the changes:**
   ```bash
   git add index.html
   git commit -m "chore: Update App Store ratings - $(date +%B\ %Y)"
   git push
   ```

#### Why This Matters
- **SEO Impact:** Google uses this data for rich snippets in search results
- **Trust Factor:** Displays star ratings in Google Search
- **Accuracy:** Outdated ratings harm credibility

---

## 🔄 Quarterly Updates

### 2. Review and Update Software Version

**Frequency:** Quarterly or after major releases
**Time Required:** 2 minutes

#### Location
File: `index.html`
Line: 85

```json
"softwareVersion": "1.0",  // ← Update when app version changes
```

#### How to Update
When you release a new app version (e.g., 1.1, 2.0):
1. Update this field to match
2. Consider updating `datePublished` to the new release date

---

### 3. Update Social Media Links

**Frequency:** Quarterly
**Time Required:** 10 minutes

#### Locations
1. **Organization Schema** (`index.html` lines 51-56)
2. **Social Links Section** (`index.html` lines 217-223)

#### Verification Checklist
- [ ] Instagram: https://www.instagram.com/trendfitapp
- [ ] Facebook: https://www.facebook.com/trendfitapp
- [ ] X (Twitter): https://x.com/trendfitapp
- [ ] LinkedIn: https://www.linkedin.com/company/trend-fit-app
- [ ] YouTube: https://www.youtube.com/@trendfit_app

Test each link to ensure it's still active and pointing to the correct profile.

---

## 🎯 As-Needed Updates

### 4. Update App Description

**When:** After significant feature additions
**Location:** `index.html` line 82

```json
"description": "TrendFit gives you fast, privacy-first insights..."
```

Keep this aligned with your App Store description.

---

### 5. Add New Screenshots

**When:** After major UI updates
**Location:** `index.html` line 83

```json
"screenshot": "https://trendfitapp.com/images/tf-stack-scatter.png"
```

You can add multiple screenshots using an array:
```json
"screenshot": [
  "https://trendfitapp.com/images/tf-stack-scatter.png",
  "https://trendfitapp.com/images/tf-stack-stacked.png",
  "https://trendfitapp.com/images/tf-trendfit.png"
]
```

---

## 🛠️ Tools & Validation

### Schema Validation Tools

1. **Google Rich Results Test**
   - URL: https://search.google.com/test/rich-results
   - Paste: https://trendfitapp.com/
   - Fix any errors reported

2. **Schema.org Validator**
   - URL: https://validator.schema.org/
   - Paste the JSON-LD code directly
   - Ensure no warnings

3. **Google Search Console**
   - Monitor: Enhancements → Structured Data
   - Check for any reported issues

### Social Media Preview Tools

1. **Facebook Sharing Debugger**
   - URL: https://developers.facebook.com/tools/debug/
   - Test: https://trendfitapp.com/
   - Click "Scrape Again" to refresh cache

2. **Twitter Card Validator**
   - URL: https://cards-dev.twitter.com/validator
   - Test: https://trendfitapp.com/

3. **LinkedIn Post Inspector**
   - URL: https://www.linkedin.com/post-inspector/
   - Test: https://trendfitapp.com/

---

## 📊 Monitoring & Analytics

### Monthly Health Check

Run this checklist on the 1st of each month:

- [ ] **App Store Ratings Updated** (see Section 1)
- [ ] **All Links Working** (use [Dead Link Checker](https://www.deadlinkchecker.com/))
- [ ] **Schema Valid** (Google Rich Results Test)
- [ ] **Sitemap Current** (check sitemap.xml lastmod dates)
- [ ] **Page Speed Good** (Google PageSpeed Insights)
- [ ] **Mobile Friendly** (Google Mobile-Friendly Test)

### Key Metrics to Track

Monitor these in Google Search Console:
- **Impressions:** How often your site appears in search
- **Clicks:** How many people click through
- **CTR:** Click-through rate (aim for >3%)
- **Position:** Average ranking position (aim for <10)
- **Rich Results:** Are your ratings showing in search?

---

## 🚨 Troubleshooting

### Ratings Not Showing in Google Search

**Problem:** Star ratings aren't appearing in search results
**Solutions:**
1. Verify schema is valid (Google Rich Results Test)
2. Ensure you have at least 2 ratings
3. Wait 1-2 weeks for Google to re-crawl
4. Request indexing via Google Search Console

### Schema Validation Errors

**Problem:** Google reports structured data errors
**Solutions:**
1. Check JSON syntax (use jsonlint.com)
2. Verify all required properties are present
3. Ensure ratingValue is between 1-5
4. Check that ratingCount is a positive integer

### Smart App Banner Not Showing

**Problem:** iOS Safari doesn't show the App Store banner
**Solutions:**
1. Verify meta tag: `<meta name="apple-itunes-app" content="app-id=6751863796">`
2. Clear Safari cache
3. Ensure user is on iOS Safari (doesn't work on Chrome iOS)

---

## 🤖 Automation

### GitHub Action Setup

The monthly reminder is automated via GitHub Actions:

**File:** `.github/workflows/monthly-seo-reminder.yml`

**What it does:**
- Runs on the 1st of every month at 9:00 AM UTC
- Creates a GitHub issue with update checklist
- Labels: `maintenance`, `seo`, `automated`

**To manually trigger:**
```bash
# Via GitHub UI: Actions → Monthly SEO Update Reminder → Run workflow

# Or via GitHub CLI:
gh workflow run monthly-seo-reminder.yml
```

### Future Automation Ideas

Consider implementing:
1. **App Store Connect API Integration**
   - Auto-fetch ratings monthly
   - Auto-update index.html
   - Create PR with changes

2. **Schema Validation CI Check**
   - Run validator on every commit
   - Fail build if schema invalid

3. **Broken Link Checker**
   - Weekly cron job
   - Test all external links
   - Create issue if links broken

---

## 📝 Version History

### 2025-12-11: Initial Setup
- Added MobileApplication schema with aggregateRating
- Added Organization schema with alternateName
- Added BreadcrumbList schema
- Configured monthly reminder automation
- Created this maintenance guide

---

## 📞 Support

### Questions or Issues?
- **SEO Questions:** Consult [Google Search Central](https://developers.google.com/search)
- **Schema Questions:** Visit [Schema.org](https://schema.org/)
- **Technical Issues:** Create a GitHub issue in this repository

### Useful Resources
- [Google Search Console](https://search.google.com/search-console)
- [App Store Connect](https://appstoreconnect.apple.com/)
- [Structured Data Testing](https://search.google.com/test/rich-results)
- [Schema.org Mobile Application](https://schema.org/MobileApplication)

---

**Last Updated:** December 11, 2025
**Next Review:** January 1, 2026
