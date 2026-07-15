---
name: new-page-make
description: Add a new climbing site entry (region/mountain/peak/route) to the REGIONS data in script.js. Use when the user wants to add a new 산/봉우리/루트 or fill in a "coming-soon" branch with real data.
---

Add new climbing site data to the `REGIONS` array in `script.js`. This is the
single source of truth (no separate data files) — see `korea-climbing-sites-project-spec.md`
and `CLAUDE.md` for the full Region → Mountain → Peak → Route data model.

## Steps

1. Read the current `REGIONS` array in `script.js` to find where the new entry
   belongs (existing region → mountain → peak → route chain).
2. Ask the user for whatever fields are missing: region/mountain/peak/route
   Korean name, romanized `id` (kebab-case, e.g. `bukhansan`, `chouinard-b`),
   and for routes: `grade` (e.g. `5.9`) and `pitchCount` if known.
3. Insert the new node at the correct level, matching the exact shape already
   used in `REGIONS`:
   - **Region**: `{ id, name, x, y, status, mountains: [] }` — `x`/`y` are
     percentage coordinates over the Korea outline SVG map; ask the user for
     placement or estimate from nearby regions if not given.
   - **Mountain**: `{ id, name, status, peaks: [] }`.
   - **Peak**: `{ id, name, status, routes: [] }`.
   - **Route**: `{ id, name }`, optionally with `grade` and `pitchCount`
     (e.g. `{ id: "chouinard-b", name: "취나드B", pitchCount: 5, grade: "5.9" }`).
4. Set `status: "available"` on every node from the new entry up to the region
   root if any of them were previously `"coming-soon"` or missing a `status`
   — a node only renders its children when its own status is `"available"`
   (see `renderChildList` in `script.js`). A parent stuck on `"coming-soon"`
   will hide a fully-populated child, so update the whole chain, not just the
   leaf you're adding.
5. Leave nodes with no real data yet as `status: "coming-soon"` and no
   children array — don't invent placeholder mountains/peaks/routes.
6. Don't add `topoImageUrl`/`latestPhotos`/`externalLinks` unless the user is
   also asking to build out level 4 (route detail) — those fields aren't
   rendered yet (`renderRouteDetail` is still a placeholder).
7. All names and any user-facing copy stay in Korean, matching existing tone.
