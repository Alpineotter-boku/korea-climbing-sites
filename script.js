const REGIONS = [
  {
    id: "seoul",
    name: "서울",
    x: 30.2,
    y: 20.2,
    status: "available",
    mountains: [
      {
        id: "bukhansan",
        name: "북한산",
        x: 30.6,
        y: 18.9,
        status: "available",
        peaks: [
          {
            id: "insubong",
            name: "인수봉",
            status: "available",
            routes: [
              {
                id: "insu-a",
                name: "인수A",
                topoImageUrl: "https://www.montblanclines.com/cdn/shop/files/142-insubongEF-shopify.jpg",
                externalLinks: {
                  youtube: ["https://www.youtube.com/watch?v=JE5_SYb_-1k"],
                  naverBlog: ["https://m.cafe.daum.net/withclimbing5.14/PNtD/70"],
                },
              },
              {
                id: "insu-b",
                name: "인수B",
                externalLinks: {
                  youtube: ["https://www.youtube.com/watch?v=O-Pcj2xp3wk"],
                  naverBlog: ["https://m.cafe.daum.net/withclimbing5.14/PNtD/70"],
                },
              },
              {
                id: "chouinard-a",
                name: "취나드A",
                topoImageUrl: "https://moredaysoff.wordpress.com/wp-content/uploads/2020/11/screenshot_20231017-1453217e2.png?w=527",
                externalLinks: {
                  naverBlog: ["https://www.sansan.co.kr/news/articleView.html?idxno=10407"],
                },
              },
              {
                id: "chouinard-b",
                name: "취나드B",
                pitchCount: 5,
                grade: "5.9",
                topoImageUrl: "https://mountainproject.com/assets/photos/climb/112217502_medium_1494327259.jpg?cache=1600403366",
                externalLinks: {
                  youtube: ["https://www.youtube.com/watch?v=HxdmcFZcFuU"],
                  naverBlog: ["https://www.sansan.co.kr/news/articleView.html?idxno=21344"],
                },
              },
              {
                id: "woojeong-a",
                name: "우정A",
                topoImageUrl: "https://m1.daumcdn.net/cfile297/image/995C193359CA0BA7214824",
                externalLinks: {
                  naverBlog: ["https://m.cafe.daum.net/loveclimb/FVuB/512"],
                },
              },
              { id: "woojeong-b", name: "우정B" },
              { id: "bidulgi-gil", name: "비둘기길" },
              {
                id: "godok-gil",
                name: "고독길",
                externalLinks: {
                  naverBlog: ["https://cafe.daum.net/J3C1915/MJap/4574"],
                },
              },
            ],
          },
          { id: "nojeokbong", name: "노적봉", status: "coming-soon" },
          { id: "mangyeongdae", name: "만경대", status: "coming-soon" },
        ],
      },
      {
        id: "dobongsan",
        name: "도봉산",
        x: 31.2,
        y: 18.3,
        status: "available",
        peaks: [
          {
            id: "seoninbong",
            name: "선인봉",
            status: "available",
            routes: [
              { id: "bakjwi-gil", name: "박쥐길", pitchCount: 3, grade: "5.7~5.9" },
              { id: "pyobeom-gil", name: "표범길", pitchCount: 6, grade: "5.6~5.10c" },
              { id: "yangji-gil", name: "양지길", pitchCount: 4, grade: "5.7~5.9" },
              { id: "seonam-gil", name: "선암길", pitchCount: 4, grade: "5.9~5.12c" },
              { id: "jaewon-gil", name: "재원길", grade: "5.12a" },
            ],
          },
        ],
      },
      { id: "gwanaksan", name: "관악산", x: 29.9, y: 22.1, status: "coming-soon" },
    ],
  },
  {
    id: "gyeonggi",
    name: "경기도",
    x: 33.3,
    y: 26.4,
    status: "available",
    mountains: [
      {
        id: "dodramsan",
        name: "도드람산",
        x: 39.7,
        y: 24.8,
        status: "available",
        peaks: [
          {
            id: "hyojabong",
            name: "효자봉",
            status: "available",
            routes: [{ id: "dwaeji-ridge", name: "돼지리지", pitchCount: 6, grade: "5.9~5.10d" }],
          },
        ],
      },
    ],
  },
  {
    id: "gangwon",
    name: "강원도",
    x: 58.2,
    y: 17.1,
    status: "available",
    mountains: [
      {
        id: "seoraksan",
        name: "설악산",
        x: 64.5,
        y: 10.9,
        status: "available",
        peaks: [
          {
            id: "seorak-nojeokbong",
            name: "노적봉",
            status: "available",
            routes: [{ id: "gyeongwondae-gil", name: "경원대길" }],
          },
          {
            id: "sotowanggol",
            name: "소토왕골",
            status: "available",
            routes: [{ id: "sain-woojeong-gil", name: "4인의우정길" }],
          },
          {
            id: "ulsanbawi",
            name: "울산바위",
            status: "available",
            routes: [
              { id: "venus-gil", name: "비너스길", pitchCount: 6, grade: "5.9~5.10c" },
              { id: "munlidae-gil", name: "문리대길", pitchCount: 7, grade: "5.7~5.9" },
            ],
          },
        ],
      },
    ],
  },
];

const markersEl = document.getElementById("markers");
const mapZoomEl = document.getElementById("mapZoom");
const mapHintEl = document.getElementById("mapHint");
const breadcrumbList = document.getElementById("breadcrumbList");
const infoPanel = document.getElementById("infoPanel");
const infoPanelBody = document.getElementById("infoPanelBody");
const infoPanelClose = document.getElementById("infoPanelClose");
const infoPanelBackdrop = document.getElementById("infoPanelBackdrop");

// How much the map magnifies when zoomed into a region. Marker dots/labels
// counter-scale by 1/ZOOM_SCALE (via the --zoom-inv CSS var) so pins stay a
// constant on-screen size while their position still tracks the zoomed map.
const ZOOM_SCALE = 4;

// state.path is the drill-down stack: [{level:"region", id}, {level:"mountain", id}, ...]
const state = { path: [] };

// Builds a transform that magnifies the map by `scale` while keeping the
// point at (px%, py%) of the unzoomed map centered in the viewport.
// transform-origin is fixed at "0 0" (see CSS), so translate() below operates
// in the map's own unscaled percentage space.
function computeZoomTransform(px, py, scale) {
  const tx = 50 / scale - px;
  const ty = 50 / scale - py;
  return `scale(${scale}) translate(${tx}%, ${ty}%)`;
}

function renderRegionMarkers() {
  markersEl.innerHTML = "";
  REGIONS.forEach((region) => {
    const marker = document.createElement("button");
    marker.type = "button";
    marker.className = `marker ${region.status}`;
    marker.style.left = `${region.x}%`;
    marker.style.top = `${region.y}%`;
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

function renderMountainMarkers(region) {
  markersEl.innerHTML = "";
  const mountains = region.mountains || [];

  mountains.forEach((mountain) => {
    if (mountain.x == null || mountain.y == null) return; // not yet placed on the map

    const marker = document.createElement("button");
    marker.type = "button";
    marker.className = `marker ${mountain.status}`;
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
    mapHintEl.textContent = "지역을 클릭하면 지도가 확대되며 등반지(산) 위치가 표시됩니다.";
    return;
  }

  const region = findRegion(regionStep.id);
  mapZoomEl.style.transform = computeZoomTransform(region.x, region.y, ZOOM_SCALE);
  markersEl.style.setProperty("--zoom-inv", String(1 / ZOOM_SCALE));
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

function renderRouteDetail(route) {
  const summaryParts = [];
  if (route.grade) summaryParts.push(`난이도 ${route.grade}`);
  if (route.pitchCount) summaryParts.push(`${route.pitchCount}피치`);

  const summary = document.createElement("p");
  summary.textContent =
    summaryParts.length > 0 ? summaryParts.join(" · ") : "난이도·피치 정보는 아직 준비 중입니다.";
  infoPanelBody.appendChild(summary);

  const note = document.createElement("p");
  note.className = "next-step-note";
  note.textContent = "개념도, 최신 사진, 외부 링크(네이버 블로그·유튜브·인스타그램) 등 상세 정보는 아직 준비 중입니다.";
  infoPanelBody.appendChild(note);
}

function closePanel() {
  state.path = [];
  infoPanel.classList.remove("open");
  infoPanel.setAttribute("aria-hidden", "true");
  infoPanelBackdrop.classList.remove("open");
  renderBreadcrumb([]);
  updateMapView();
}

infoPanelClose.addEventListener("click", closePanel);
infoPanelBackdrop.addEventListener("click", closePanel);

updateMapView();
renderBreadcrumb([]);
