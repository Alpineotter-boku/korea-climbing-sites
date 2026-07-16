// 등반지 데이터(REGIONS)는 data.js 에서 전역으로 로드됩니다.
// (index.html 에서 data.js 를 script.js 보다 먼저 로드)

const markersEl = document.getElementById("markers");
const mapContainerEl = document.getElementById("mapContainer");
const regionPaths = document.querySelectorAll(".region");
const mapZoomEl = document.getElementById("mapZoom");
const mapHintEl = document.getElementById("mapHint");
const breadcrumbList = document.getElementById("breadcrumbList");
const infoPanel = document.getElementById("infoPanel");
const infoPanelBody = document.getElementById("infoPanelBody");
const infoPanelClose = document.getElementById("infoPanelClose");
const infoPanelBackdrop = document.getElementById("infoPanelBackdrop");
const infoPanelBack = document.getElementById("infoPanelBack");
const routeSearchInput = document.getElementById("routeSearchInput");
const routeSearchResults = document.getElementById("routeSearchResults");

// The SVG map's viewBox (see index.html <svg viewBox>). Region polygons and
// labels are authored in these user units; we convert them to % of the map box
// (which fills the same area) so markers and zoom math share one coordinate space.
const MAP_VB_W = 524;
const MAP_VB_H = 631;

// state.path is the drill-down stack: [{level:"region", id}, {level:"mountain", id}, ...]
const state = { path: [] };

// Where the focused point lands inside the map box, as a % of its width/height.
// Horizontally centered; vertically biased upward so the zoomed-in region sits
// above the bottom info sheet (which covers the lower half of the screen).
const FOCUS_X = 50;
const FOCUS_Y = 30;

// Zoom-to-fit target: the region should fill at most this much of the map box
// (leaving margins so it never touches the edges / clips) and its scale is
// clamped so tiny regions (서울) don't over-magnify and tall ones (강원도) stay
// fully on screen above the info sheet.
const FRAME_W = 82; // max % of box width the framed region may span
const FRAME_H = 50; // max % of box height the framed region may span
const MIN_SCALE = 1.2;
const MAX_SCALE = 8;

// Builds a transform that magnifies the map by `scale` while keeping the
// point at (px%, py%) of the unzoomed map at (FOCUS_X%, FOCUS_Y%) of the box.
// transform-origin is fixed at "0 0" (see CSS), so translate() below operates
// in the map's own unscaled percentage space.
function computeZoomTransform(px, py, scale) {
  const tx = FOCUS_X / scale - px;
  const ty = FOCUS_Y / scale - py;
  return `scale(${scale}) translate(${tx}%, ${ty}%)`;
}

// The exact bounding box of a region's polygon, in % of the map box, read
// straight from the rendered SVG so we never hand-maintain region extents.
function getRegionBBoxPct(regionId) {
  const path = document.querySelector(`.region[data-region="${regionId}"]`);
  if (!path || typeof path.getBBox !== "function") return null;
  const b = path.getBBox();
  return {
    x: (b.x / MAP_VB_W) * 100,
    y: (b.y / MAP_VB_H) * 100,
    w: (b.width / MAP_VB_W) * 100,
    h: (b.height / MAP_VB_H) * 100,
  };
}

// The administrative label position for a region, in % of the map box. These
// are hand-placed in the SVG at each 시·도's representative spot, so they make a
// better "one marker per administrative area" anchor than a bbox center (which
// for a ring-shaped region like 경기도 would land on top of 서울).
function getRegionLabelPct(name) {
  const labels = document.querySelectorAll(".region-labels text");
  for (const label of labels) {
    if (label.textContent.trim() === name) {
      return {
        x: (parseFloat(label.getAttribute("x")) / MAP_VB_W) * 100,
        y: (parseFloat(label.getAttribute("y")) / MAP_VB_H) * 100,
      };
    }
  }
  return null;
}

// Picks a zoom that frames the whole region (bbox) within FRAME_W×FRAME_H and
// centers it at the focus point, so the administrative area is fully visible and
// never clipped. Returns the transform string and the scale (for counter-scaling
// the markers via --zoom-inv).
function computeFitTransform(bbox) {
  const rawScale = Math.min(FRAME_W / bbox.w, FRAME_H / bbox.h);
  const scale = Math.max(MIN_SCALE, Math.min(rawScale, MAX_SCALE));
  const cx = bbox.x + bbox.w / 2;
  const cy = bbox.y + bbox.h / 2;
  return { transform: computeZoomTransform(cx, cy, scale), scale };
}

// Places a clickable dot marker on each region in REGIONS at the nationwide
// (level 0) view. The labeled polygon underneath is also clickable (see
// wireRegionPaths), but the dot makes the "확대 가능" affordance obvious.
function renderRegionMarkers() {
  markersEl.innerHTML = "";
  REGIONS.forEach((region) => {
    const marker = document.createElement("button");
    marker.type = "button";
    marker.className = `marker region-marker ${region.status}`;

    // Anchor on the administrative representative point (the SVG label), lifted
    // slightly so the dot sits just above the region name instead of over it.
    // Fall back to the region's own x/y if the label can't be resolved.
    const anchor = getRegionLabelPct(region.name);
    const left = anchor ? anchor.x : region.x;
    const top = anchor ? anchor.y - 2.6 : region.y;
    marker.style.left = `${left}%`;
    marker.style.top = `${top}%`;
    marker.dataset.regionId = region.id;

    const dot = document.createElement("span");
    dot.className = "marker-dot";

    const label = document.createElement("span");
    label.className = "marker-label";
    label.textContent = region.name;

    marker.append(dot, label);
    marker.addEventListener("click", () => openRegion(region.id));

    markersEl.appendChild(marker);
  });
}

// The labeled administrative polygons are also click targets. Available regions
// (those with a matching entry in REGIONS) get a click handler wired once at
// startup, so clicking anywhere on the highlighted region zooms in.
function wireRegionPaths() {
  regionPaths.forEach((path) => {
    if (!path.classList.contains("available")) return;
    const regionId = path.dataset.region;
    if (!findRegion(regionId)) return;
    path.addEventListener("click", () => openRegion(regionId));
  });
}

// Highlights the selected region's polygon (and clears others).
function setSelectedRegion(regionId) {
  regionPaths.forEach((path) => {
    path.classList.toggle("selected", path.dataset.region === regionId);
  });
}

function renderMountainMarkers(region) {
  markersEl.innerHTML = "";
  const mountains = region.mountains || [];

  mountains.forEach((mountain) => {
    if (mountain.x == null || mountain.y == null) return; // not yet placed on the map

    const marker = document.createElement("button");
    marker.type = "button";
    marker.className = `marker mountain-marker ${mountain.status}`;
    marker.style.left = `${mountain.x}%`;
    marker.style.top = `${mountain.y}%`;
    marker.dataset.mountainId = mountain.id;

    const dot = document.createElement("span");
    dot.className = "marker-dot";

    const label = document.createElement("span");
    label.className = "marker-label";
    label.textContent = mountain.name;

    marker.append(dot, label);
    if (mountain.status !== "coming-soon") {
      marker.addEventListener("click", () => selectMountain(mountain.id));
    }

    markersEl.appendChild(marker);
  });
}

// Zooms/pans the map and swaps the marker set to match state.path[0] (the
// selected region), independent of how much deeper the panel has drilled —
// per current scope, only the region->mountain step gets a map view; peak
// and route levels reuse the same zoomed-in region map.
function updateMapView() {
  const regionStep = state.path[0];

  if (!regionStep) {
    mapZoomEl.style.transform = "";
    markersEl.style.setProperty("--zoom-inv", "1");
    renderRegionMarkers();
    mapContainerEl.classList.remove("zoomed");
    setSelectedRegion(null);
    mapHintEl.textContent = "노란색으로 표시된 지역(마커)을 클릭하면 지도가 확대되며 등반지(산) 위치가 표시됩니다.";
    return;
  }

  const region = findRegion(regionStep.id);

  // Frame the entire administrative region (its polygon bbox) rather than
  // magnifying by a fixed amount around a single point — so large regions like
  // 강원도/경기도 are fully visible instead of being cut off.
  const bbox = getRegionBBoxPct(region.id);
  const fit = bbox
    ? computeFitTransform(bbox)
    : { transform: computeZoomTransform(region.x, region.y, 4), scale: 4 };

  mapZoomEl.style.transform = fit.transform;
  markersEl.style.setProperty("--zoom-inv", String(1 / fit.scale));
  mapContainerEl.classList.add("zoomed");
  setSelectedRegion(region.id);
  renderMountainMarkers(region);
  mapHintEl.textContent = `${region.name} 지역입니다. 산을 클릭하면 봉우리 목록을 볼 수 있어요.`;
}

// Resets the path to [region, mountain] regardless of current depth, so a
// map marker click always jumps straight to that mountain's peak list.
function selectMountain(mountainId) {
  state.path = [state.path[0], { level: "mountain", id: mountainId }];
  render();
}

function findRegion(id) {
  return REGIONS.find((r) => r.id === id);
}

function findMountain(region, id) {
  return region?.mountains?.find((m) => m.id === id);
}

function findPeak(mountain, id) {
  return mountain?.peaks?.find((p) => p.id === id);
}

function findRoute(peak, id) {
  return peak?.routes?.find((r) => r.id === id);
}

// Walks state.path against REGIONS and returns the resolved node at each step
// (e.g. [regionObj, mountainObj, peakObj]) so rendering never re-parses ids.
function getChain() {
  const chain = [];
  let region, mountain, peak;

  for (const step of state.path) {
    if (step.level === "region") {
      region = findRegion(step.id);
      chain.push(region);
    } else if (step.level === "mountain") {
      mountain = findMountain(region, step.id);
      chain.push(mountain);
    } else if (step.level === "peak") {
      peak = findPeak(mountain, step.id);
      chain.push(peak);
    } else if (step.level === "route") {
      chain.push(findRoute(peak, step.id));
    }
  }

  return chain;
}

function openRegion(regionId) {
  state.path = [{ level: "region", id: regionId }];
  render();
}

function drillTo(level, id) {
  state.path.push({ level, id });
  render();
}

function goToStep(index) {
  state.path = state.path.slice(0, index + 1);
  render();
}

// 패널 상단 back 버튼: 한 단계 위로. 최상위(지역)면 닫아서 전국으로.
function goBack() {
  if (state.path.length <= 1) {
    closePanel();
    return;
  }
  goToStep(state.path.length - 2);
}

function render() {
  const chain = getChain();
  renderBreadcrumb(chain);
  renderPanelBody(chain);
  updateMapView();

  infoPanel.classList.add("open");
  infoPanel.setAttribute("aria-hidden", "false");
  infoPanelBackdrop.classList.add("open");
}

function renderBreadcrumb(chain) {
  breadcrumbList.innerHTML = "";

  const homeItem = document.createElement("li");
  homeItem.className = "breadcrumb-item";
  if (chain.length === 0) {
    homeItem.classList.add("current");
    homeItem.textContent = "전국";
  } else {
    const homeButton = document.createElement("button");
    homeButton.type = "button";
    homeButton.textContent = "전국";
    homeButton.addEventListener("click", closePanel);
    homeItem.appendChild(homeButton);
  }
  breadcrumbList.appendChild(homeItem);

  chain.forEach((node, index) => {
    const item = document.createElement("li");
    item.className = "breadcrumb-item";
    const isCurrent = index === chain.length - 1;

    if (isCurrent) {
      item.classList.add("current");
      item.textContent = node.name;
    } else {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = node.name;
      button.addEventListener("click", () => goToStep(index));
      item.appendChild(button);
    }

    breadcrumbList.appendChild(item);
  });
}

function renderPanelBody(chain) {
  infoPanelBody.innerHTML = "";

  const current = chain[chain.length - 1];
  const level = state.path[state.path.length - 1].level;

  const heading = document.createElement("h2");
  heading.textContent = current.name;
  infoPanelBody.appendChild(heading);

  if (level === "region") {
    renderChildList({
      status: current.status,
      items: current.mountains,
      emptyMessage: "이 지역의 등반지 정보는 아직 준비 중입니다.",
      introMessage: "이 지역의 등반지(산) 목록입니다. 산을 선택하면 봉우리 목록을 볼 수 있어요.",
      onSelect: (item) => selectMountain(item.id),
    });
  } else if (level === "mountain") {
    renderChildList({
      status: current.status,
      items: current.peaks,
      emptyMessage: "이 등반지의 봉우리 정보는 아직 준비 중입니다.",
      introMessage: "이 등반지의 봉우리 목록입니다. 봉우리를 선택하면 루트 목록을 볼 수 있어요.",
      onSelect: (item) => drillTo("peak", item.id),
    });
  } else if (level === "peak") {
    renderChildList({
      status: current.status,
      items: current.routes,
      emptyMessage: "이 봉우리의 루트 정보는 아직 준비 중입니다.",
      introMessage: "이 봉우리의 루트 목록입니다. 루트를 선택하면 상세 정보를 볼 수 있어요.",
      onSelect: (item) => drillTo("route", item.id),
    });
  } else if (level === "route") {
    renderRouteDetail(current);
  }
}

function renderChildList({ status, items, emptyMessage, introMessage, onSelect }) {
  const hasItems = status !== "coming-soon" && items && items.length > 0;

  if (!hasItems) {
    const message = document.createElement("p");
    message.textContent = emptyMessage;
    infoPanelBody.appendChild(message);
    return;
  }

  const intro = document.createElement("p");
  intro.textContent = introMessage;
  infoPanelBody.appendChild(intro);

  const list = document.createElement("ul");
  list.className = "drill-list";

  items.forEach((item) => {
    const listItem = document.createElement("li");
    listItem.className = "drill-item";

    const button = document.createElement("button");
    button.type = "button";

    const name = document.createElement("span");
    name.className = "drill-item-name";
    name.textContent = item.name;
    button.appendChild(name);

    const metaParts = [];
    if (item.grade) metaParts.push(item.grade);
    if (item.pitchCount) metaParts.push(`${item.pitchCount}피치`);

    if (metaParts.length > 0) {
      const meta = document.createElement("span");
      meta.className = "drill-item-meta";
      meta.textContent = metaParts.join(" · ");
      button.appendChild(meta);
    }

    button.addEventListener("click", () => onSelect(item));
    listItem.appendChild(button);
    list.appendChild(listItem);
  });

  infoPanelBody.appendChild(list);
}

// 레벨 4 — 루트 상세. 기획서의 표시 우선순위(개념도 → 최신 사진 → 외부 링크
// → 난이도·피치)를 따른다. 데이터가 없는 항목은 조용히 건너뛰고, 아무 상세
// 정보도 없으면 "준비 중" 안내만 보여준다.
function renderRouteDetail(route) {
  const summaryParts = [];
  if (route.grade) summaryParts.push(`난이도 ${route.grade}`);
  if (route.pitchCount) summaryParts.push(`${route.pitchCount}피치`);

  if (summaryParts.length > 0) {
    const summary = document.createElement("p");
    summary.className = "route-summary";
    summary.textContent = summaryParts.join(" · ");
    infoPanelBody.appendChild(summary);
  }

  let hasDetail = summaryParts.length > 0;

  // 1) 개념도(topo)
  if (route.topoImageUrl) {
    hasDetail = true;
    infoPanelBody.appendChild(renderRouteFigure("개념도", route.topoImageUrl));
  }

  // 2) 최신 사진
  if (Array.isArray(route.latestPhotos) && route.latestPhotos.length > 0) {
    hasDetail = true;
    const section = renderRouteSection("최신 사진");
    const gallery = document.createElement("div");
    gallery.className = "route-photo-grid";
    route.latestPhotos.forEach((url) => {
      const img = document.createElement("img");
      img.className = "route-photo";
      img.src = url;
      img.alt = `${route.name} 사진`;
      img.loading = "lazy";
      gallery.appendChild(img);
    });
    section.appendChild(gallery);
    infoPanelBody.appendChild(section);
  }

  // 3) 외부 링크 (네이버 블로그 · 유튜브 · 인스타그램)
  const links = route.externalLinks || {};
  const linkGroups = [
    { key: "youtube", label: "유튜브 영상" },
    { key: "naverBlog", label: "블로그 · 후기" },
    { key: "instagram", label: "인스타그램" },
  ].filter((g) => Array.isArray(links[g.key]) && links[g.key].length > 0);

  if (linkGroups.length > 0) {
    hasDetail = true;
    const section = renderRouteSection("관련 링크");
    linkGroups.forEach((group) => {
      const groupTitle = document.createElement("p");
      groupTitle.className = "route-link-group-title";
      groupTitle.textContent = group.label;
      section.appendChild(groupTitle);

      const list = document.createElement("ul");
      list.className = "route-link-list";
      links[group.key].forEach((url) => {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = url;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.textContent = prettyLinkLabel(url);
        li.appendChild(a);
        list.appendChild(li);
      });
      section.appendChild(list);
    });
    infoPanelBody.appendChild(section);
  }

  if (!hasDetail) {
    const note = document.createElement("p");
    note.className = "next-step-note";
    note.textContent =
      "개념도, 최신 사진, 외부 링크(네이버 블로그·유튜브·인스타그램) 등 상세 정보는 아직 준비 중입니다.";
    infoPanelBody.appendChild(note);
  }
}

// 섹션 제목(h3)만 가진 <section>을 만들어 반환한다.
function renderRouteSection(title) {
  const section = document.createElement("section");
  section.className = "route-section";
  const heading = document.createElement("h3");
  heading.textContent = title;
  section.appendChild(heading);
  return section;
}

// 제목 + 단일 이미지(figure)를 가진 섹션. 이미지 로드 실패 시 링크로 대체한다.
function renderRouteFigure(title, url) {
  const section = renderRouteSection(title);
  const figure = document.createElement("figure");
  figure.className = "route-figure";

  const img = document.createElement("img");
  img.className = "route-topo";
  img.src = url;
  img.alt = `${title} 이미지`;
  img.loading = "lazy";
  img.addEventListener("error", () => {
    figure.innerHTML = "";
    const fallback = document.createElement("a");
    fallback.href = url;
    fallback.target = "_blank";
    fallback.rel = "noopener noreferrer";
    fallback.className = "route-figure-fallback";
    fallback.textContent = "이미지를 불러올 수 없습니다. 원본 링크 열기 ↗";
    figure.appendChild(fallback);
  });

  figure.appendChild(img);
  section.appendChild(figure);
  return section;
}

// URL을 사람이 읽기 좋은 짧은 라벨로 바꾼다(도메인 + 경로 일부).
function prettyLinkLabel(url) {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "").replace(/^m\./, "");
    let path = u.pathname && u.pathname !== "/" ? u.pathname : "";
    try {
      path = decodeURI(path); // 한글 등 퍼센트 인코딩을 읽기 좋게 복원
    } catch {
      /* 잘못된 인코딩이면 원문 유지 */
    }
    return host + path;
  } catch {
    return url;
  }
}

function closePanel() {
  state.path = [];
  infoPanel.classList.remove("open");
  infoPanel.setAttribute("aria-hidden", "true");
  infoPanelBackdrop.classList.remove("open");
  routeSearchInput.value = "";
  hideSearchResults();
  renderBreadcrumb([]);
  updateMapView();
}

// ---------- 검색 (루트·산·봉우리 이름) ----------

// REGIONS 를 평탄화한 검색 인덱스. 각 항목은 전체 path 를 저장해
// (id 가 봉우리 간 전역 유일하지 않으므로) 정확히 해당 노드로 이동한다.
const SEARCH_INDEX = buildSearchIndex();
const MAX_SEARCH_RESULTS = 12;

function buildSearchIndex() {
  const index = [];
  (REGIONS || []).forEach((region) => {
    (region.mountains || []).forEach((mountain) => {
      index.push({
        name: mountain.name,
        sub: region.name,
        keyword: mountain.name.toLowerCase(),
        path: [
          { level: "region", id: region.id },
          { level: "mountain", id: mountain.id },
        ],
      });
      (mountain.peaks || []).forEach((peak) => {
        index.push({
          name: peak.name,
          sub: `${region.name} > ${mountain.name}`,
          keyword: peak.name.toLowerCase(),
          path: [
            { level: "region", id: region.id },
            { level: "mountain", id: mountain.id },
            { level: "peak", id: peak.id },
          ],
        });
        (peak.routes || []).forEach((route) => {
          const sub = route.grade
            ? `${mountain.name} > ${peak.name} · ${route.grade}`
            : `${mountain.name} > ${peak.name}`;
          index.push({
            name: route.name,
            sub,
            keyword: route.name.toLowerCase(),
            path: [
              { level: "region", id: region.id },
              { level: "mountain", id: mountain.id },
              { level: "peak", id: peak.id },
              { level: "route", id: route.id },
            ],
          });
        });
      });
    });
  });
  return index;
}

function hideSearchResults() {
  routeSearchResults.hidden = true;
  routeSearchResults.innerHTML = "";
}

function goToSearchResult(entry) {
  state.path = entry.path.map((step) => ({ ...step }));
  routeSearchInput.value = "";
  hideSearchResults();
  render();
}

function renderSearchResults(query) {
  const q = query.trim().toLowerCase();
  routeSearchResults.innerHTML = "";

  if (!q) {
    hideSearchResults();
    return;
  }

  const matches = SEARCH_INDEX.filter((entry) => entry.keyword.includes(q)).slice(
    0,
    MAX_SEARCH_RESULTS
  );

  if (matches.length === 0) {
    const empty = document.createElement("li");
    empty.className = "route-search-empty";
    empty.textContent = "검색 결과가 없습니다.";
    routeSearchResults.appendChild(empty);
    routeSearchResults.hidden = false;
    return;
  }

  matches.forEach((entry) => {
    const li = document.createElement("li");
    const button = document.createElement("button");
    button.type = "button";

    const name = document.createElement("span");
    name.className = "route-search-result-name";
    name.textContent = entry.name;
    button.appendChild(name);

    const sub = document.createElement("span");
    sub.className = "route-search-result-sub";
    sub.textContent = entry.sub;
    button.appendChild(sub);

    // blur 로 목록이 먼저 닫히지 않도록 mousedown 에서 이동 처리.
    button.addEventListener("mousedown", (event) => {
      event.preventDefault();
      goToSearchResult(entry);
    });
    li.appendChild(button);
    routeSearchResults.appendChild(li);
  });

  routeSearchResults.hidden = false;
}

routeSearchInput.addEventListener("input", (event) => {
  renderSearchResults(event.target.value);
});

routeSearchInput.addEventListener("focus", (event) => {
  if (event.target.value.trim()) {
    renderSearchResults(event.target.value);
  }
});

routeSearchInput.addEventListener("blur", () => {
  // 결과 항목 클릭(mousedown) 처리가 끝난 뒤 닫히도록 약간 지연.
  window.setTimeout(hideSearchResults, 120);
});

routeSearchInput.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    routeSearchInput.value = "";
    hideSearchResults();
    routeSearchInput.blur();
  }
});

infoPanelBack.addEventListener("click", goBack);
infoPanelClose.addEventListener("click", closePanel);
infoPanelBackdrop.addEventListener("click", closePanel);

wireRegionPaths();
updateMapView();
renderBreadcrumb([]);
