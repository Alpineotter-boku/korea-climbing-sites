# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

A static, single-page site (Korean-language, `lang="ko"`) presenting climbing sites ("암벽등반지") across Korea. No build step, no package manager, no dependencies — just `index.html`, `styles.css`, and `script.js` opened directly in a browser or served as static files.

The full product plan lives in `korea-climbing-sites-project-spec.md` — read it before making architectural decisions (data model, navigation depth, tech stack), since the current code only implements a small slice of it (see "Current implementation status" below).

## Development

There is no build/lint/test tooling configured. To preview changes, open `index.html` directly in a browser, or serve the directory with any static file server (e.g. `npx serve .`) and reload.

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

The code implements levels 0–3 of the target drill-down (region → mountain → peak → route list) using vanilla JS DOM manipulation (no framework). Level 4 (full route detail — topo image, photos, external links) is a placeholder only. Real map zoom/pan is not implemented; each level after the map is rendered inside the slide-in info panel instead.

1. **Map view** (`index.html` `.map-stage`) — an inline SVG outline of Korea (`polygon.korea-outline`) with region markers absolutely positioned over it by percentage `x`/`y` coordinates. This is the only level with an actual map; levels 1–4 reuse the info panel.
2. **Data** (`script.js` `REGIONS` array) — the single source of truth, already shaped close to the spec's Region → Mountain → Peak → Route hierarchy (nested `mountains[].peaks[].routes[]`, with `status: "available" | "coming-soon"` at the region/mountain/peak level to mark which branches have real data). Only 서울 → 북한산 → 인수봉 is fully populated (per the spec's suggested pilot scope); other branches are `"coming-soon"` stubs. Routes carry optional `grade`/`pitchCount` (e.g. 취나드B: `5.9`, 5 pitches) — the spec's `topoImageUrl`/`latestPhotos`/`externalLinks` fields are not added yet since level 4 isn't built.
3. **Navigation state** (`state.path` in `script.js`) — an array of `{level, id}` steps (`"region" | "mountain" | "peak" | "route"`) that gets pushed via `drillTo(level, id)` on selection and truncated via `goToStep(index)` on breadcrumb back-navigation. `getChain()` resolves `state.path` against `REGIONS` into the actual node objects for rendering; there's no routing/URL sync, so refreshing the page always returns to the top-level map.
4. **Rendering** (`render()` → `renderBreadcrumb()` + `renderPanelBody()`) — re-renders the breadcrumb (`#breadcrumbList`) and the info panel body (`#infoPanelBody`) from `state.path` on every navigation. `renderPanelBody` branches on the deepest level in the path:
   - `region`/`mountain`/`peak` levels all go through the shared `renderChildList()` helper, which lists the next level down as buttons (showing `grade`/`pitchCount` as trailing meta text when present) or an empty/"준비 중" message when the node's `status` is `"coming-soon"` or has no children yet.
   - `route` level goes through `renderRouteDetail()`, a placeholder showing grade/pitch count plus a "topo/photos/links coming soon" note — this is where level 4 should be built out next.
5. **Marker rendering** (`renderMarkers`) — builds one marker button per region from `REGIONS`, clicking calls `openRegion(regionId)` which resets `state.path` to `[{level:"region", id}]` and opens the panel.

When building out level 4 (route detail), replace `renderRouteDetail()` with real topo/photo/link rendering and extend the `Route` objects in `REGIONS` with `topoImageUrl`/`latestPhotos`/`externalLinks` per the spec's data model — don't add another parallel data structure.

All UI copy is in Korean — match the existing tone and phrasing when adding new strings.
