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
  heading.textContent = level === "route" ? routeHeaderText(current) : current.name;
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

// 루트 상세 헤더 텍스트 — "이름 (피치, 최고난이도)" 형태. 예) 취나드B (5P, 5.9)
// 피치·난이도가 둘 다 없으면 이름만 반환한다.
function routeHeaderText(route) {
  const meta = [];
  if (route.pitchCount) meta.push(`${route.pitchCount}P`);
  if (route.grade) meta.push(route.grade);
  return meta.length ? `${route.name} (${meta.join(", ")})` : route.name;
}

// 레벨 4 — 루트 상세. 표시 순서: 메타(위치·별점·길이·확보장비) → 개념도 →
// 최신 사진 → 유튜브 영상 → 블로그/게시물 링크. 이름·피치·난이도는 헤더(h2)에
// 이미 표시되므로 여기서는 다시 쓰지 않는다. 데이터가 없는 항목은 조용히
// 건너뛰고, 아무 상세 정보도 없으면 "준비 중" 안내만 보여준다.
function renderRouteDetail(route) {
  let hasDetail = false;

  // 0) 메타 — 위치 · 별점 (한 줄)
  const metaRow = renderRouteMeta(route);
  if (metaRow) {
    hasDetail = true;
    infoPanelBody.appendChild(metaRow);
  }

  // 0-1) 길이(피치별)
  const pitchSection = renderPitchLengths(route);
  if (pitchSection) {
    hasDetail = true;
    infoPanelBody.appendChild(pitchSection);
  }

  // 0-2) 확보장비
  const gearSection = renderGear(route);
  if (gearSection) {
    hasDetail = true;
    infoPanelBody.appendChild(gearSection);
  }

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

  // 3) 외부 링크
  const links = route.externalLinks || {};

  // 3-1) 유튜브 — 썸네일 카드(클릭 시 그 자리에서 재생), 최신순 최대 3개
  const youtubeItems = pickRecent(links.youtube, 3);
  if (youtubeItems.length > 0) {
    hasDetail = true;
    const section = renderRouteSection("유튜브 영상");
    const grid = document.createElement("div");
    grid.className = "route-video-grid";
    youtubeItems.forEach((item) => grid.appendChild(renderYoutubeCard(item, route)));
    section.appendChild(grid);
    infoPanelBody.appendChild(section);
  }

  // 3-2) 블로그·게시물(최신순 3개) · 인스타그램(전체) — 제목 + 날짜 링크 목록
  const linkGroups = [
    { key: "naverBlog", label: "블로그 · 게시물", items: pickRecent(links.naverBlog, 3) },
    { key: "instagram", label: "인스타그램", items: pickRecent(links.instagram, null) },
  ].filter((g) => g.items.length > 0);

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
      group.items.forEach((item) => {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = item.url;
        a.target = "_blank";
        a.rel = "noopener noreferrer";

        const title = document.createElement("span");
        title.className = "route-link-title";
        title.textContent = item.title || prettyLinkLabel(item.url);
        a.appendChild(title);

        if (item.date) {
          const date = document.createElement("span");
          date.className = "route-link-date";
          date.textContent = item.date;
          a.appendChild(date);
        }

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
      "위치·길이·확보장비, 개념도, 유튜브·블로그 등 상세 정보는 아직 준비 중입니다.";
    infoPanelBody.appendChild(note);
  }
}

// 위치 + 별점을 한 줄(.route-meta)로. 둘 다 없으면 null.
function renderRouteMeta(route) {
  const hasLocation = typeof route.location === "string" && route.location.trim() !== "";
  const hasStars = Number.isFinite(route.stars) && route.stars > 0;
  if (!hasLocation && !hasStars) return null;

  const row = document.createElement("div");
  row.className = "route-meta";

  if (hasLocation) {
    const loc = document.createElement("span");
    loc.className = "route-meta-location";
    const label = document.createElement("b");
    label.textContent = "위치";
    loc.append(label, document.createTextNode(route.location));
    row.appendChild(loc);
  }

  if (hasStars) {
    const n = Math.max(0, Math.min(5, Math.round(route.stars)));
    const stars = document.createElement("span");
    stars.className = "route-stars";
    stars.textContent = "★".repeat(n) + "☆".repeat(5 - n);
    stars.setAttribute("aria-label", `별점 ${n}/5`);
    row.appendChild(stars);
  }

  return row;
}

// 길이(피치별) 섹션. route.pitches = [{ p, length, grade? }] 중 length 가 있는
// 항목만 표시한다. 표시할 게 없으면 null.
function renderPitchLengths(route) {
  if (!Array.isArray(route.pitches)) return null;
  const items = route.pitches.filter((it) => it && it.length);
  if (items.length === 0) return null;

  const section = renderRouteSection("길이");
  const list = document.createElement("ul");
  list.className = "route-pitch-list";
  items.forEach((it, i) => {
    const li = document.createElement("li");
    const label = document.createElement("span");
    label.className = "pitch-label";
    label.textContent = `${it.p || i + 1}P ${it.length}`;
    li.appendChild(label);
    if (it.grade) {
      const grade = document.createElement("span");
      grade.className = "pitch-grade";
      grade.textContent = it.grade;
      li.appendChild(grade);
    }
    list.appendChild(li);
  });
  section.appendChild(list);
  return section;
}

// 확보장비 섹션. route.gear = ["퀵드로 - 10개", ...] (문자열 배열) 또는 단일
// 문자열. 비어 있으면 null.
function renderGear(route) {
  let gear = route.gear;
  if (typeof gear === "string") gear = gear.trim() ? [gear] : [];
  if (!Array.isArray(gear) || gear.length === 0) return null;

  const section = renderRouteSection("확보장비");
  const list = document.createElement("ul");
  list.className = "route-gear-list";
  gear.forEach((g) => {
    const li = document.createElement("li");
    li.textContent = g;
    list.appendChild(li);
  });
  section.appendChild(list);
  return section;
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

// 외부 링크 항목을 {url, title?, date?} 형태로 정규화한다. 기존 데이터는
// 문자열 URL 배열이므로 문자열이면 url 만 채우고, 객체면 url 이 있는 것만 받는다.
function normalizeLink(entry) {
  if (typeof entry === "string") return { url: entry };
  return entry && entry.url ? entry : null;
}

// 최신순 상위 limit 개를 반환한다. 링크에 date 가 하나라도 있으면 날짜
// 내림차순으로 정렬하고, 없으면 데이터 배열 순서(최신순으로 관리)를 그대로
// 사용한다. limit 이 null 이면 전체를 반환한다.
function pickRecent(entries, limit) {
  if (!Array.isArray(entries)) return [];
  const items = entries.map(normalizeLink).filter(Boolean);
  if (items.some((it) => it.date)) {
    items.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  }
  return limit == null ? items : items.slice(0, limit);
}

// 유튜브 URL 에서 영상 ID 를 뽑는다(watch?v= · youtu.be · /embed/ · /shorts/).
function youtubeVideoId(url) {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    if (host === "youtu.be") return u.pathname.split("/").filter(Boolean)[0] || null;
    if (u.searchParams.get("v")) return u.searchParams.get("v");
    const parts = u.pathname.split("/").filter(Boolean);
    const i = parts.findIndex((p) => p === "embed" || p === "shorts");
    return i !== -1 && parts[i + 1] ? parts[i + 1] : null;
  } catch {
    return null;
  }
}

// 유튜브 링크 하나를 썸네일 카드로 만든다. 썸네일(API 없이 열리는
// img.youtube.com 이미지)을 먼저 보여주고, 클릭하면 그 자리에서 iframe 으로
// 바로 재생한다(파사드 패턴 — 팝업을 열 때마다 플레이어를 미리 로드하지 않음).
// 영상 ID를 못 구하거나 썸네일 로드에 실패하면 텍스트 링크로 폴백한다.
function renderYoutubeCard(item, route) {
  const id = youtubeVideoId(item.url);
  const card = document.createElement("div");
  card.className = "route-video-card";

  // 썸네일/폴백을 담는 상단 영역
  if (id) {
    const thumb = document.createElement("div");
    thumb.className = "route-video-thumb";
    thumb.setAttribute("role", "button");
    thumb.tabIndex = 0;
    thumb.setAttribute("aria-label", (item.title || `${route.name} 유튜브 영상`) + " 재생");

    const img = document.createElement("img");
    img.src = `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
    img.alt = item.title || `${route.name} 유튜브 영상`;
    img.loading = "lazy";
    img.addEventListener("error", () => {
      // 썸네일을 못 불러오면 카드를 텍스트 링크로 폴백한다.
      thumb.replaceWith(makeVideoFallbackLink(item, route));
    });

    const play = document.createElement("span");
    play.className = "route-video-play";
    play.textContent = "▶";

    thumb.append(img, play);

    // 클릭/엔터 시 썸네일을 iframe 으로 교체해 바로 재생
    const swap = () => {
      const iframe = document.createElement("iframe");
      iframe.className = "route-video-iframe";
      iframe.src = `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`;
      iframe.title = item.title || `${route.name} 유튜브 영상`;
      iframe.allow =
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      iframe.allowFullscreen = true;
      thumb.innerHTML = "";
      thumb.removeAttribute("role");
      thumb.removeAttribute("tabindex");
      thumb.appendChild(iframe);
    };
    thumb.addEventListener("click", swap);
    thumb.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        swap();
      }
    });

    card.appendChild(thumb);
  } else {
    card.appendChild(makeVideoFallbackLink(item, route));
  }

  // 캡션 — 제목 + 업로드 날짜
  const caption = document.createElement("div");
  caption.className = "route-video-caption";

  const title = document.createElement("span");
  title.className = "route-video-title";
  title.textContent = item.title || prettyLinkLabel(item.url);
  caption.appendChild(title);

  if (item.date) {
    const date = document.createElement("span");
    date.className = "route-video-date";
    date.textContent = item.date;
    caption.appendChild(date);
  }

  card.appendChild(caption);
  return card;
}

// 유튜브 카드에서 썸네일/임베딩을 쓸 수 없을 때의 텍스트 링크 폴백.
function makeVideoFallbackLink(item, route) {
  const a = document.createElement("a");
  a.href = item.url;
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  a.className = "route-video-card-fallback";
  a.textContent = (item.title || prettyLinkLabel(item.url)) + " ↗";
  return a;
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
