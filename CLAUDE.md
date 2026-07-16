# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

A static, single-page site (Korean-language, `lang="ko"`) presenting climbing sites ("암벽등반지") across Korea. No build step, no package manager, no dependencies — just `index.html`, `styles.css`, `script.js`, and the `data.js` database, opened directly in a browser or served as static files.

The full product plan lives in `korea-climbing-sites-project-spec.md` — read it before making architectural decisions (data model, navigation depth, tech stack), since the current code implements only part of it (see "Current implementation status" below).

## Development

There is no build/lint/test tooling configured. To preview changes, open `index.html` directly in a browser, or serve the directory with any static file server (e.g. `npx serve .`) and reload.

- **`data.js`, not JSON, is deliberate.** The data is exposed as a global `const REGIONS` loaded via `<script src="data.js">` *before* `script.js`. This is because the site must work opened directly as a `file://` URL, where `fetch()`-ing a `.json` file is blocked by the browser's CORS policy. Keep this loading order and the global-variable shape; don't convert the data to a fetched JSON file.
- After editing `data.js`/`script.js`, sanity-check with `node --check data.js && node --check script.js` (there is no test runner). For a fuller check, the render functions can be exercised against a minimal DOM stub under Node (see `renderRouteDetail` — it takes a plain route object).

## Target architecture (per spec)

The intended navigation is a 5-level map drill-down, zooming in and adding a breadcrumb entry at each step:

| 단계 | 화면 | 예시 |
|---|---|---|
| 0 | 전국 지도 (지역 마커) | 서울, 경기도, 강원도 |
| 1 | 지역 지도 (등반지/산) | 북한산, 도봉산, 관악산 |
| 2 | 등반지(산) 지도 (봉우리) | 인수봉, 노적봉, 만경대 |
| 3 | 봉우리 (루트 목록) | 취나드A, 취나드B, 우정A... |
| 4 | 루트 상세 | 취나드B (1~5피치): 개념도 → 최신 사진 → 외부 링크(네이버/유튜브/인스타) → 난이도·피치 수 |

Data model hierarchy: **Region → Mountain → Peak → Route**, e.g.:

```json
{
  "region": { "id": "seoul", "name": "서울" },
  "mountain": { "id": "bukhansan", "name": "북한산", "regionId": "seoul" },
  "peak": { "id": "insubong", "name": "인수봉", "mountainId": "bukhansan" },
  "route": {
    "id": "chouinard-b", "name": "취나드B", "peakId": "insubong",
    "pitchCount": 5, "grade": "5.9",
    "topoImageUrl": "/topos/insubong-chouinard-b.png",
    "latestPhotos": ["https://..."],
    "externalLinks": { "naverBlog": [], "youtube": [], "instagram": [] }
  }
}
```

Planned features beyond navigation: topo (개념도) viewer, grade display, curated latest reviews/photos/video links (manual entry or API), and search by region/mountain/peak/route name.

**Open decisions (not yet resolved — check the spec before assuming an answer):** map implementation (illustrated map vs. real-coordinate API like Kakao/Naver/OSM), content collection method (manual vs. crawling/API, copyright review), grade system (한국식/YDS/UIAA), whether to build membership/favorites/reviews, whether to build an admin content page, search scope, and overall tech stack (framework, map library, data storage — static JSON vs. DB).

## Current implementation status

All five levels (0–4) of the target drill-down are implemented in vanilla JS DOM manipulation (no framework). Levels 0–1 are shown on the real SVG map; levels 2–4 render inside the slide-in info panel.

1. **Data** (`data.js` `REGIONS` array) — the single source of truth, shaped per the spec's Region → Mountain → Peak → Route hierarchy (nested `mountains[].peaks[].routes[]`, with `status: "available" | "coming-soon"` at the region/mountain/peak level to mark which branches have real data vs. stubs). Route objects carry optional `grade`, `pitchCount`, `topoImageUrl`, `latestPhotos[]`, and `externalLinks { youtube[], naverBlog[], instagram[] }`; any absent field is simply skipped at render time. Coverage currently spans 서울(북한산·도봉산), 경기도(도드람산), 강원도(설악산), 전라북도(대둔산·천등산). **The `new-page-make` skill exists for adding entries here — prefer it when adding a 산/봉우리/루트 or filling a `coming-soon` branch.**
2. **The map is a real administrative SVG** (`index.html`, `viewBox="0 0 524 631"`) — 17 시·도 polygons (`path.region[data-region]`) plus hand-placed name labels (`.region-labels text`). A region is clickable/highlighted only if its polygon AND label both carry the `available` class *and* a matching entry exists in `REGIONS`; **activating a new region requires adding `available` to both SVG nodes** (see how 전라북도 was enabled). `script.js` reads geometry straight from the rendered SVG (`getBBox()`, label `x`/`y`) and converts SVG user units to % of the map box via `MAP_VB_W/H`, so region extents are never hand-maintained.
3. **Map zoom** (`updateMapView` → `computeFitTransform`/`computeZoomTransform`) — selecting a region zooms/pans the map to frame that region's polygon bbox (clamped by `FRAME_W/H`, `MIN/MAX_SCALE`) and swaps in per-mountain markers (`renderMountainMarkers`); markers counter-scale via the `--zoom-inv` CSS var. Levels deeper than mountain reuse the same zoomed region map.
4. **Navigation state** (`state.path` in `script.js`) — an array of `{level, id}` steps (`"region" | "mountain" | "peak" | "route"`), pushed via `drillTo(level, id)` and truncated via `goToStep(index)` on breadcrumb back-navigation. `getChain()` resolves `state.path` against `REGIONS` into node objects for rendering. No routing/URL sync — refreshing returns to the top-level map.
5. **Rendering** (`render()` → `renderBreadcrumb()` + `renderPanelBody()` + `updateMapView()`) — `renderPanelBody` branches on the deepest level:
   - `region`/`mountain`/`peak` go through the shared `renderChildList()` helper (next level as buttons, `grade`/`pitchCount` shown as trailing meta; "준비 중" message when `coming-soon`/empty).
   - `route` goes through `renderRouteDetail()`, which renders, in the spec's priority order, 개념도 → 최신 사진 → 외부 링크(유튜브·블로그·인스타) → 난이도·피치, falling back to a "준비 중" note when a route has no detail. Topo/photo `<img>` tags have an `error` handler that swaps in a text link if the image fails to load.

When adding data, extend the existing `REGIONS` objects in `data.js` — do not introduce a parallel data structure. All UI copy is in Korean; match the existing tone and phrasing.
