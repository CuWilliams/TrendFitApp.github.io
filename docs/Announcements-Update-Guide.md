# TrendFit Website — Announcements Update Guide

This guide explains how to add a new announcement to the website. Announcements are rendered from a JSON file and automatically sorted on the page.

- **File to edit:** `data/announcements.json`  
- **Page that displays them:** `announcements.html`  
- **Renderer script:** `js/announcements.js` (auto-sorts by pinned → newest date)

> ✅ The page fetches the JSON with `cache: "no-store"`, so updates typically appear after a normal refresh.

---

## Quick Steps (TL;DR)

1. Open **`data/announcements.json`**.
2. Add a **new object** at the **bottom** of the array using the template below.
3. Ensure **valid JSON** (no trailing commas, double quotes only, ISO date).
4. Save, commit, and push.  
5. Refresh `announcements.html` to verify (pinned items show first, otherwise newest first).

---

## JSON Field Reference

| Field      | Type      | Required | Example                         | Notes |
|----------- |-----------|---------:|----------------------------------|-------|
| `id`       | string    | ✅        | `"2025-09-14-beta-window"`      | Unique per post. Use a date prefix + short slug. |
| `date`     | ISO date  | ✅        | `"2025-09-14"`                  | Must be `YYYY-MM-DD`. Used for sorting & display. |
| `title`    | string    | ✅        | `"Public Beta Window Announced"` | Headline shown on the card. |
| `pinned`   | boolean   | optional | `true`                           | Puts the post above non-pinned ones. Keep pins rare. |
| `tags`     | string[]  | optional | `["Roadmap","Beta"]`          | Short labels (e.g., `Feature`, `Policy`, `Community`). |
| `body`     | string[]  | ✅        | `["Para 1", "Para 2"]`         | Each array item renders as a paragraph. |
| `links`    | object[]  | optional | `[{ "label": "Read Privacy", "href": "privacy.html" }]` | Buttons shown under the body. Relative links preferred. |

---

## Add a New Announcement (Template)

Copy this block and edit each field:

```json
{
  "id": "YYYY-MM-DD-your-slug",
  "date": "YYYY-MM-DD",
  "title": "Your announcement title",
  "pinned": false,
  "tags": ["Tag1", "Tag2"],
  "body": [
    "First paragraph of your update.",
    "Optional second paragraph for more details."
  ],
  "links": [
    { "label": "Optional button label", "href": "features.html" }
  ]
}
```

👉 **Where to place it:** add the new object **at the bottom** of the existing array in `data/announcements.json`. The page will auto-sort posts (pinned → newest date).

---

## Example — “Public Beta Window Announced”

```json
{
  "id": "2025-10-05-beta-window",
  "date": "2025-10-05",
  "title": "Public Beta Window Announced",
  "pinned": false,
  "tags": ["Beta", "Roadmap"],
  "body": [
    "We’re targeting a public beta window this fall. Exact dates will be shared as we clear Apple’s external TestFlight review.",
    "Thanks to all Founding Members and early testers for the feedback so far!"
  ],
  "links": [
    { "label": "Become a Beta Tester", "href": "beta-feedback.html" },
    { "label": "See Features", "href": "features.html" }
  ]
}
```

---

## Pinning a Post

To keep an important post at the top, set `"pinned": true`.

Use sparingly—ideally **one** pinned item at any time.

```json
"pinned": true
```

Unpin later by switching it back to `false`.

---

## Validation & Common Gotchas

- **Valid JSON only:**
  - Double quotes for strings.
  - **No trailing commas** after the last item in arrays/objects.
  - Wrap all keys and string values in double quotes.
- **Date format:** `YYYY-MM-DD`. (Sorting relies on this format.)
- **Relative links:** use `"privacy.html"`, `"features.html#screenshots"`, `"index.html#signup"`, etc.
- **Encoding:** keep the file as UTF-8.
- **Cache:** the page uses `no-store`, so a normal refresh should pick up changes. If not, do a hard refresh.

---

## Troubleshooting

- **“Unable to load announcements”** on the page:
  - Check that `data/announcements.json` is **valid JSON** (a missing quote or trailing comma will break it).
  - Ensure the file path is correct (`/data/announcements.json`).
- **Post order looks wrong:**
  - Verify the `date` values and pinned status.
- **Buttons/links don’t work:**
  - Confirm each `href` is a valid relative path to an existing page.

---

## Housekeeping Tips

- Keep titles short and scannable. Use the body array for details.
- Prefer 1–3 short paragraphs per post.
- Reuse tags consistently: e.g., `Feature`, `Roadmap`, `Beta`, `Policy`, `Community`.
- When an item becomes outdated, consider unpinning or adding a newer post that supersedes it.

---

*Last updated: 2025-09-04*
