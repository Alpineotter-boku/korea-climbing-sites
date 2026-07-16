// 한국 암벽등반지 데이터베이스
// ---------------------------------------------------------------------------
// 이 파일은 사이트의 단일 데이터 소스(single source of truth)입니다.
// 계층 구조: 지역(Region) → 산/등반지(Mountain) → 봉우리(Peak) → 루트(Route)
//
// 정적 사이트(빌드 없음, file:// 로도 열림)라서 JSON 파일을 fetch() 하면
// 브라우저 보안정책(CORS)에 막히므로, 데이터를 전역 변수 REGIONS 로 노출하고
// index.html 에서 script.js 보다 먼저 로드합니다.
//
// 필드 안내:
//   region / mountain: id, name, x, y(지도상 % 좌표), status, ...children
//   peak:   id, name, status, routes[]
//   route:  id, name, grade(난이도), pitchCount(피치 수),
//           topoImageUrl(개념도), latestPhotos[](최신 사진),
//           externalLinks { youtube[], naverBlog[], instagram[] }
//   status: "available"(실데이터 있음) | "coming-soon"(준비 중 스텁)
//
// 링크 신뢰도 안내: 각 루트의 URL은 웹 검색/페치로 실제 확인된 것만 넣었습니다.
// 일부는 페이지 본문이 봇 접근을 차단(HTTP 400/403)하지만 브라우저에서는
// 정상적으로 열리는 실제 주소입니다. 등급/피치는 출처마다 다를 수 있습니다.
// ---------------------------------------------------------------------------

const REGIONS = [
  {
    id: "seoul",
    name: "서울",
    x: 29.3,
    y: 20.4,
    status: "available",
    mountains: [
      {
        id: "bukhansan",
        name: "북한산",
        x: 29.3,
        y: 18.7,
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
                grade: "5.10b",
                pitchCount: 6,
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
                  instagram: [
                    "https://www.instagram.com/p/DJgh2BpvnA9/",
                    "https://www.instagram.com/p/DJZDSf5PwGY/",
                  ],
                },
              },
              {
                id: "insu-ridge",
                name: "인수릿지",
                pitchCount: 11,
                externalLinks: {
                  youtube: ["https://www.youtube.com/watch?v=QE58sJUNWNk"],
                },
              },
              {
                id: "villa-gil",
                name: "빌라길",
                grade: "5.12a",
                pitchCount: 6,
                externalLinks: {
                  youtube: ["https://www.youtube.com/watch?v=gOR1u9IWFCQ"],
                },
              },
              {
                id: "bant-gil",
                name: "봔트길",
                grade: "5.11a",
                externalLinks: {
                  youtube: ["https://www.youtube.com/watch?v=o9SU6fxBbGM"],
                },
              },
              { id: "dongyang-gil", name: "동양길", grade: "5.10b", pitchCount: 8 },
              { id: "georyong-gil", name: "거룡길", grade: "5.11b", pitchCount: 6 },
              { id: "crony-gil", name: "크로니길", grade: "5.10a", pitchCount: 9 },
              { id: "insu-bakjwi-gil", name: "박쥐길", grade: "5.10d", pitchCount: 3 },
              { id: "haneul-gil", name: "하늘길", grade: "5.10c", pitchCount: 7 },
              { id: "yeojeong-gil", name: "여정길", grade: "5.9", pitchCount: 6 },
            ],
          },
          {
            id: "yeomchobong",
            name: "염초봉",
            status: "available",
            routes: [
              {
                id: "hyeona-gil",
                name: "현아길",
                grade: "5.10a~b",
                pitchCount: 1,
                externalLinks: {
                  naverBlog: ["https://ilikesan.com/entry/%EB%B6%81%ED%95%9C%EC%82%B0-%EC%97%BC%EC%B4%88%EB%B4%89-%EC%95%94%EB%B2%BD%EC%BD%94%EC%8A%A4"],
                },
              },
              { id: "donggul", name: "동굴", grade: "5.11c~d", pitchCount: 1 },
              { id: "seoktap-gil", name: "석탑길", grade: "5.10a~b", pitchCount: 1 },
              { id: "yeohaeng-gil", name: "여행길", grade: "5.10c", pitchCount: 2 },
              { id: "bandal-b", name: "반달B", grade: "5.10a", pitchCount: 2 },
              { id: "bandal-a", name: "반달A", grade: "5.8~5.9", pitchCount: 2 },
              { id: "maknae-gil", name: "막내길", grade: "5.10a", pitchCount: 3 },
              { id: "seolbyeon-gil", name: "설변길", grade: "5.10a", pitchCount: 2 },
            ],
          },
          {
            id: "baegundae",
            name: "백운대",
            status: "available",
            routes: [{ id: "sindongyeop-gil", name: "신동엽길" }],
          },
          { id: "nojeokbong", name: "노적봉", status: "coming-soon" },
          { id: "mangyeongdae", name: "만경대", status: "coming-soon" },
          { id: "sumeunbyeok", name: "숨은벽", status: "coming-soon" },
        ],
      },
      {
        id: "dobongsan",
        name: "도봉산",
        x: 30.0,
        y: 18.0,
        status: "available",
        peaks: [
          {
            id: "seoninbong",
            name: "선인봉",
            status: "available",
            routes: [
              {
                id: "bakjwi-gil",
                name: "박쥐길",
                pitchCount: 6,
                grade: "5.9",
                topoImageUrl: "https://img1.daumcdn.net/relay/cafe/R400x0/?fname=http%3A%2F%2Fcfs6.blog.daum.net%2Fupload_control%2Fdownload.blog%3Ffhandle%3DMDk3amhAZnM2LmJsb2cuZGF1bS5uZXQ6L0lNQUdFLzEvMTc0LmpwZy50aHVtYg%3D%3D%26filename%3D174.jpg",
                externalLinks: {
                  youtube: [
                    "https://www.youtube.com/watch?v=5TP6LeQg5O4",
                    "https://www.youtube.com/watch?v=iHXpJfvTYWo",
                  ],
                  naverBlog: ["https://m.cafe.daum.net/bigwalls/FMQ0/41"],
                },
              },
              { id: "pyobeom-gil", name: "표범길", pitchCount: 6, grade: "5.10c" },
              { id: "yangji-gil", name: "양지길", pitchCount: 4, grade: "5.9" },
              { id: "seonam-gil", name: "선암길", pitchCount: 4, grade: "5.12c" },
              { id: "jaewon-gil", name: "재원길", grade: "5.12a" },
            ],
          },
          {
            id: "manjangbong",
            name: "만장봉",
            status: "available",
            routes: [
              {
                id: "nangman-gil",
                name: "낭만길",
                grade: "5.7",
                pitchCount: 9,
                externalLinks: {
                  naverBlog: ["https://m.cafe.daum.net/krcp/hyX2/11"],
                },
              },
            ],
          },
        ],
      },
      { id: "gwanaksan", name: "관악산", x: 28.8, y: 21.9, status: "coming-soon" },
    ],
  },
  {
    id: "gyeonggi",
    name: "경기도",
    x: 32.5,
    y: 20.8,
    status: "available",
    mountains: [
      {
        id: "dodramsan",
        name: "도드람산",
        x: 38.0,
        y: 27.4,
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
    x: 52.6,
    y: 17.2,
    status: "available",
    mountains: [
      {
        id: "seoraksan",
        name: "설악산",
        x: 55.7,
        y: 10.4,
        status: "available",
        peaks: [
          {
            id: "seorak-nojeokbong",
            name: "노적봉",
            status: "available",
            routes: [
              {
                id: "gyeongwondae-gil",
                name: "경원대길",
                externalLinks: {
                  instagram: ["https://www.instagram.com/p/Cfk3Y9FpjCs/"],
                },
              },
              { id: "poem-gil", name: "한 편의 시를 위한 길", grade: "5.8", pitchCount: 10 },
            ],
          },
          {
            id: "sotowanggol",
            name: "소토왕골",
            status: "available",
            routes: [{ id: "sain-woojeong-gil", name: "4인의우정길" }],
          },
          {
            id: "towanggol",
            name: "토왕골",
            status: "available",
            routes: [{ id: "star-picking-boys", name: "별을 따는 소년들", grade: "5.9", pitchCount: 11 }],
          },
          {
            id: "ulsanbawi",
            name: "울산바위",
            status: "available",
            routes: [
              {
                id: "venus-gil",
                name: "비너스길",
                pitchCount: 6,
                grade: "5.9~5.10c",
                externalLinks: {
                  youtube: ["https://www.youtube.com/watch?v=1f-pkutPFpk"],
                },
              },
              { id: "munlidae-gil", name: "문리대길", pitchCount: 7, grade: "5.7~5.9" },
              { id: "incle-gil", name: "인클길", pitchCount: 6, grade: "5.10a~5.12a" },
              { id: "incle-junior-gil", name: "인클주니어길", pitchCount: 3, grade: "5.10a~5.11b" },
              { id: "pc-shangrila", name: "PC샹그릴라", pitchCount: 6 },
              { id: "yoban-gil", name: "요반길", pitchCount: 9, grade: "5.10+" },
              { id: "gyedan-slab-gil", name: "계단슬랩길" },
            ],
          },
          {
            id: "cheonhwadae",
            name: "천화대(적벽)",
            status: "available",
            routes: [
              {
                id: "seokju-gil",
                name: "석주길",
                topoImageUrl: "https://img1.daumcdn.net/relay/cafe/R400x0/?fname=http%3A%2F%2Fpds47.cafe.daum.net%2Fimage%2F1%2Fcafe%2F2008%2F06%2F26%2F15%2F27%2F486336b686c91",
                externalLinks: {
                  naverBlog: ["https://m.cafe.daum.net/wjalpine1/AT73/39"],
                },
              },
              { id: "yeomna-gil", name: "염라길" },
              { id: "heukbeom-gil", name: "흑범길" },
            ],
          },
          {
            id: "yuseondae",
            name: "유선대",
            status: "available",
            routes: [{ id: "geurium-dul", name: "그리움둘", grade: "5.8", pitchCount: 11 }],
          },
          {
            id: "janggunbong",
            name: "장군봉",
            status: "available",
            routes: [{ id: "samhyeongje-gil", name: "삼형제길", grade: "5.9" }],
          },
        ],
      },
    ],
  },
  {
    id: "north-jeolla",
    name: "전라북도",
    x: 32.1,
    y: 54.7,
    status: "available",
    mountains: [
      {
        id: "daedunsan",
        name: "대둔산",
        x: 31.0,
        y: 47.0,
        status: "available",
        peaks: [
          {
            id: "madaebong",
            name: "마대봉",
            status: "available",
            routes: [
              {
                id: "madaebong-ganeun-gil",
                name: "마대봉 가는 길",
                grade: "5.10c",
                pitchCount: 5,
                externalLinks: {
                  naverBlog: ["https://gall.dcinside.com/mgallery/board/view/?id=rock_climbing&no=7230"],
                },
              },
            ],
          },
          {
            id: "yeonjaedae",
            name: "연재대",
            status: "available",
            routes: [
              {
                id: "ujeong-gil",
                name: "우정길(우정리지)",
                externalLinks: {
                  youtube: ["https://www.youtube.com/watch?v=Yj0JoofpH20"],
                },
              },
            ],
          },
          {
            id: "saecheonnyeon-ridge",
            name: "새천년릿지",
            status: "available",
            routes: [
              {
                id: "saecheonnyeon-ridge-route",
                name: "새천년릿지",
                externalLinks: {
                  youtube: ["https://www.youtube.com/watch?v=eaEeqme8NFE"],
                },
              },
            ],
          },
        ],
      },
      {
        id: "cheondeungsan",
        name: "천등산",
        x: 33.0,
        y: 47.5,
        status: "available",
        peaks: [
          {
            id: "haneulbyeok",
            name: "하늘벽",
            status: "available",
            routes: [
              {
                id: "hanbeonjjeum",
                name: "한번쯤",
                grade: "5.10c",
                pitchCount: 5,
                externalLinks: {
                  naverBlog: ["https://gall.dcinside.com/mgallery/board/view/?id=rock_climbing&no=10709"],
                },
              },
              {
                id: "byeogibyeok",
                name: "벽이벽",
                externalLinks: {
                  youtube: ["https://www.youtube.com/watch?v=mbVAO-tGdc0"],
                },
              },
              { id: "meonhutnal", name: "먼훗날", grade: "5.10b~5.11b", pitchCount: 5 },
              { id: "piryohae", name: "필요해" },
            ],
          },
          {
            id: "mindeulle-ridge",
            name: "민들레릿지",
            status: "available",
            routes: [{ id: "mindeulle-ridge-route", name: "민들레릿지", grade: "5.11b", pitchCount: 7 }],
          },
        ],
      },
    ],
  },
];
