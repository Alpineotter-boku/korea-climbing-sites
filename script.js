const REGIONS = [
  {
    id: "seoul",
    name: "서울",
    x: 40,
    y: 28,
    status: "available",
    mountains: [
      {
        id: "bukhansan",
        name: "북한산",
        status: "available",
        peaks: [
          {
            id: "insubong",
            name: "인수봉",
            status: "available",
            routes: [
              { id: "insu-a", name: "인수A" },
              { id: "insu-b", name: "인수B" },
              { id: "chouinard-a", name: "취나드A" },
              { id: "chouinard-b", name: "취나드B", pitchCount: 5, grade: "5.9" },
              { id: "woojeong-a", name: "우정A" },
              { id: "woojeong-b", name: "우정B" },
              { id: "bidulgi-gil", name: "비둘기길" },
              { id: "godok-gil", name: "고독길" },
            ],
          },
          { id: "nojeokbong", name: "노적봉", status: "coming-soon" },
          { id: "mangyeongdae", name: "만경대", status: "coming-soon" },
        ],
      },
      { id: "dobongsan", name: "도봉산", status: "coming-soon" },
      { id: "gwanaksan", name: "관악산", status: "coming-soon" },
    ],
  },
  {
    id: "gyeonggi",
    name: "경기도",
    x: 33,
    y: 35,
    status: "coming-soon",
  },
  {
    id: "gangwon",
    name: "강원도",
    x: 62,
    y: 24,
    status: "available",
    mountains: [
      {
        id: "seoraksan",
        name: "설악산",
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
        ],
      },
    ],
  },
];

const markersEl = document.getElementById("markers");
const breadcrumbList = document.getElementById("breadcrumbList");
const infoPanel = document.getElementById("infoPanel");
const infoPanelBody = document.getElementById("infoPanelBody");
const infoPanelClose = document.getElementById("infoPanelClose");
const infoPanelBackdrop = document.getElementById("infoPanelBackdrop");

// state.path is the drill-down stack: [{level:"region", id}, {level:"mountain", id}, ...]
const state = { path: [] };

function renderMarkers() {
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
      onSelect: (item) => drillTo("mountain", item.id),
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
}

infoPanelClose.addEventListener("click", closePanel);
infoPanelBackdrop.addEventListener("click", closePanel);

renderMarkers();
renderBreadcrumb([]);
