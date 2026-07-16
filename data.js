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
//   route:  id, name, grade(최고난이도), pitchCount(피치 수),
//           location(위치), stars(별점 0~5),
//           gear(확보장비 — 문자열 배열 예: ["퀵드로 - 10개", "캠 - 소형·중형"]),
//           pitches(피치별 길이 — [{ p, length, grade? }] 예: [{ p:1, length:"35m" }]),
//           topoImageUrl(개념도), latestPhotos[](최신 사진),
//           externalLinks { youtube[], naverBlog[], instagram[] }
//   externalLinks 항목은 문자열 URL 또는 { url, title, date("YYYY-MM-DD") } 객체.
//     title/date 가 있으면 목록에 표시되고 date 기준 최신순으로 정렬됩니다.
//   status: "available"(실데이터 있음) | "coming-soon"(준비 중 스텁)
//
// 링크 신뢰도 안내: 각 루트의 URL은 웹 검색/페치로 실제 확인된 것만 넣었습니다.
// 일부는 페이지 본문이 봇 접근을 차단(HTTP 400/403)하지만 브라우저에서는
// 정상적으로 열리는 실제 주소입니다. 등급/피치는 출처마다 다를 수 있습니다.
//
// ※ 상세정보(위치·피치별 길이·확보장비 등)는 대부분 클라이머 커뮤니티가 정리한
//   루트 개념도/등반기(다음카페·산악잡지·DCinside 등)에서 확인해 채운 것으로,
//   공식 개념도가 아니므로 출처마다 수치가 다를 수 있습니다. 특히 확보장비·피치는
//   안전과 직결되니 실제 등반 전 반드시 최신 개념도로 교차 확인하세요.
//   출처를 명확히 확인하지 못한 루트는 해당 필드를 비워 두었습니다(임의 추정 금지).
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
                grade: "5.8",
                pitchCount: 4,
                pitches: [
                  { p: 1, length: "40m", grade: "5.6" },
                  { p: 2, length: "20m", grade: "5.7" },
                  { p: 3, length: "25m", grade: "5.8" },
                  { p: 4, length: "30m", grade: "5.7" },
                ],
                gear: ["퀵드로 - 8개", "프렌드(캠) 1조"],
                topoImageUrl: "https://www.montblanclines.com/cdn/shop/files/142-insubongEF-shopify.jpg",
                externalLinks: {
                  youtube: [
                    {
                      url: "https://www.youtube.com/watch?v=JE5_SYb_-1k",
                      title: "인수봉 인수a 길 등반 가이드.",
                      date: "2016-09-19",
                    },
                  ],
                  naverBlog: [
                    {
                      url: "https://m.cafe.daum.net/withclimbing5.14/PNtD/70",
                      title: "인수봉(등반루트)",
                      date: "2014-03-06",
                    },
                  ],
                },
              },
              {
                id: "insu-b",
                name: "인수B",
                grade: "5.9",
                pitchCount: 3,
                pitches: [
                  { p: 1, length: "37m", grade: "5.8" },
                  { p: 2, length: "30m", grade: "5.9" },
                  { p: 3, length: "30m", grade: "5.7" },
                ],
                externalLinks: {
                  youtube: [
                    {
                      url: "https://www.youtube.com/watch?v=O-Pcj2xp3wk",
                      title: "Climbing Insu B on Insubong(Insu Peak) - Bukhansan, South Korea",
                      date: "2020-03-07",
                    },
                  ],
                  naverBlog: [
                    {
                      url: "https://m.cafe.daum.net/withclimbing5.14/PNtD/70",
                      title: "인수봉(등반루트)",
                      date: "2014-03-06",
                    },
                  ],
                },
              },
              {
                id: "chouinard-a",
                name: "취나드A",
                grade: "5.10b",
                pitchCount: 6,
                location: "인수봉 전면 오른쪽의 수직 크랙",
                pitches: [
                  { p: 1, length: "21m", grade: "5.6" },
                  { p: 2, length: "30m", grade: "5.7" },
                  { p: 3, length: "22m", grade: "5.6" },
                  { p: 4, length: "40m", grade: "5.10a/b" },
                  { p: 5, length: "40m", grade: "5.6" },
                  { p: 6, length: "25m", grade: "5.6" },
                ],
                gear: ["캠(카멜롯) 1세트", "퀵드로 - 7~8개", "로프 50m 1동"],
                topoImageUrl: "https://moredaysoff.wordpress.com/wp-content/uploads/2020/11/screenshot_20231017-1453217e2.png?w=527",
                externalLinks: {
                  youtube: [
                    {
                      url: "https://www.youtube.com/watch?v=MQrD0McDfqQ",
                      title: "인수봉 명품코스 취나드A를 오르다 (이지민·김계동·김용기의 클라이밍세상)",
                    },
                  ],
                  naverBlog: [
                    {
                      url: "https://www.sansan.co.kr/news/articleView.html?idxno=10407",
                      title: "무자비한 고통의 길, 겸손을 배우는 길, 조금의 용기면 충분한 길!",
                      date: "2019-10-24",
                    },
                  ],
                },
              },
              {
                id: "chouinard-b",
                name: "취나드B",
                pitchCount: 5,
                grade: "5.8",
                stars: 5,
                location: "대슬랩 우측",
                gear: ["퀵드로 - 10개", "캠 - 소형·중형"],
                pitches: [
                  { p: 1, length: "35m" },
                  { p: 2, length: "37m" },
                  { p: 3, length: "25m" },
                  { p: 4, length: "40m" },
                  { p: 5, length: "40m" },
                ],
                topoImageUrl: "image%20copy.png",
                externalLinks: {
                  youtube: [
                    {
                      url: "https://www.youtube.com/watch?v=HxdmcFZcFuU",
                      title: "🧗🏻‍♀️Insu-bong chouinard-b🇰🇷Rock climbing in Seoul 인수봉 June 2023🎐首爾北漢山攀石Vlog｜Katie Daily",
                      date: "2023-07-17",
                    },
                  ],
                  naverBlog: [
                    {
                      url: "https://www.sansan.co.kr/news/articleView.html?idxno=21344",
                      title: "끝내 자태를 보이지 않은 클라이머의 로망, 인수봉!",
                      date: "2023-05-08",
                    },
                  ],
                },
              },
              {
                id: "biwon",
                name: "비원",
                pitchCount: 5,
                grade: "5.11b/c Ao",
                stars: 2,
                location: "대슬랩 우측",
                gear: ["퀵드로 - 10개"],
                pitches: [
                  { p: 1, length: "35m" },
                  { p: 2, length: "35m" },
                  { p: 3, length: "35m" },
                  { p: 4, length: "12m" },
                  { p: 5, length: "35m" },
                ],
                topoImageUrl: "image%20copy.png",
              },
              {
                id: "yangji",
                name: "양지",
                pitchCount: 3,
                grade: "5.11a",
                stars: 4,
                location: "취나드B 1P에서 출발",
                gear: ["퀵드로 - 10개"],
                pitches: [
                  { p: 1, length: "35m" },
                  { p: 2, length: "37m" },
                  { p: 3, length: "30m" },
                ],
                topoImageUrl: "image%20copy.png",
              },
              {
                id: "woojeong-a",
                name: "우정A",
                grade: "5.9",
                pitchCount: 4,
                pitches: [
                  { p: 1, length: "35m", grade: "5.7" },
                  { p: 2, length: "26m", grade: "5.9" },
                  { p: 3, length: "20m", grade: "5.8" },
                  { p: 4, length: "20m", grade: "5.6" },
                ],
                topoImageUrl: "https://m1.daumcdn.net/cfile297/image/995C193359CA0BA7214824",
                externalLinks: {
                  naverBlog: [
                    {
                      url: "https://m.cafe.daum.net/loveclimb/FVuB/512",
                      title: "암벽 30기 5주차 졸업등반 후기 (인수봉 우정A)",
                      date: "2017-09-26",
                    },
                  ],
                },
              },
              {
                id: "woojeong-b",
                name: "우정B",
                grade: "5.8",
                pitchCount: 4,
                pitches: [
                  { p: 1, length: "20m", grade: "5.6" },
                  { p: 2, length: "20m", grade: "5.8" },
                  { p: 3, length: "35m", grade: "5.6" },
                  { p: 4, length: "30m", grade: "5.7" },
                ],
                gear: ["퀵드로 - 10개", "프렌드(캠) 1조"],
              },
              {
                id: "bidulgi-gil",
                name: "비둘기길",
                grade: "5.7",
                pitchCount: 4,
                pitches: [
                  { p: 1, length: "35m", grade: "5.7" },
                  { p: 2, length: "17m", grade: "5.6" },
                  { p: 3, length: "17m", grade: "A1" },
                  { p: 4, length: "20m", grade: "5.7" },
                ],
              },
              {
                id: "godok-gil",
                name: "고독길",
                externalLinks: {
                  naverBlog: [
                    {
                      url: "https://cafe.daum.net/J3C1915/MJap/4574",
                      title: "2024.5.23. 북한산 인수봉 고독길",
                      date: "2024-05-23",
                    },
                  ],
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
                  youtube: [
                    {
                      url: "https://www.youtube.com/watch?v=QE58sJUNWNk",
                      title: "나의 버킷리스트! 인수봉오르기(북한산 인수릿지길)(2021.04.17)",
                      date: "2022-03-07",
                    },
                  ],
                },
              },
              {
                id: "villa-gil",
                name: "빌라길",
                grade: "5.12a",
                pitchCount: 6,
                externalLinks: {
                  youtube: [
                    {
                      url: "https://www.youtube.com/watch?v=gOR1u9IWFCQ",
                      title: "손정준과 함께하는 한국의 암벽 10회 - 북한산 인수봉 빌라코스",
                      date: "2012-07-11",
                    },
                  ],
                },
              },
              {
                id: "bant-gil",
                name: "봔트길",
                grade: "5.11a",
                externalLinks: {
                  youtube: [
                    {
                      url: "https://www.youtube.com/watch?v=o9SU6fxBbGM",
                      title: "인수봉 봔트길 (5.11a)",
                      date: "2020-09-29",
                    },
                  ],
                },
              },
              {
                id: "dongyang-gil",
                name: "동양길",
                grade: "5.10b",
                pitchCount: 8,
                externalLinks: {
                  youtube: [
                    {
                      url: "https://www.youtube.com/watch?v=xPjfqMV1JRY",
                      title: "인수봉 동양길·하늘길 (#인수봉동양길 #암벽등반 #KMG)",
                      date: "2021-08-19",
                    },
                  ],
                },
              },
              {
                id: "georyong-gil",
                name: "거룡길",
                grade: "5.11b",
                pitchCount: 6,
                externalLinks: {
                  youtube: [
                    {
                      url: "https://www.youtube.com/watch?v=SL5yI7cfsfE",
                      title: "인수봉의 인기코스 거룡길 제1피치 (김홍례·이지민/김용기)",
                    },
                  ],
                },
              },
              { id: "crony-gil", name: "크로니길", grade: "5.10a", pitchCount: 9 },
              { id: "insu-bakjwi-gil", name: "박쥐길", grade: "5.10d", pitchCount: 3 },
              {
                id: "haneul-gil",
                name: "하늘길",
                grade: "5.10c",
                pitchCount: 7,
                pitches: [
                  { p: 1, length: "23m", grade: "5.10a" },
                  { p: 2, length: "17m", grade: "5.9" },
                  { p: 3, length: "26m", grade: "5.10a" },
                  { p: 4, length: "30m", grade: "5.8" },
                  { p: 5, length: "31m", grade: "5.10c" },
                  { p: 6, length: "40m", grade: "5.8" },
                  { p: 7, length: "20m", grade: "5.10c" },
                ],
                externalLinks: {
                  youtube: [
                    {
                      url: "https://www.youtube.com/watch?v=xPjfqMV1JRY",
                      title: "인수봉 하늘길·동양길 (#인수봉하늘길 #암벽등반 #KMG)",
                      date: "2021-08-19",
                    },
                  ],
                },
              },
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
                location: "염초봉 리지 암장 (페이스·오버행)",
                pitches: [{ p: 1, length: "18m", grade: "5.10a~b" }],
                externalLinks: {
                  naverBlog: [
                    {
                      url: "https://ilikesan.com/entry/%EB%B6%81%ED%95%9C%EC%82%B0-%EC%97%BC%EC%B4%88%EB%B4%89-%EC%95%94%EB%B2%BD%EC%BD%94%EC%8A%A4",
                      title: "북한산 염초봉 암벽코스",
                      date: "2007-08-16",
                    },
                  ],
                },
              },
              {
                id: "donggul",
                name: "동굴",
                grade: "5.11c~d",
                pitchCount: 1,
                location: "염초봉 리지 암장 (오버행, 볼트 4개)",
                pitches: [{ p: 1, length: "15m", grade: "5.11c~d" }],
              },
              {
                id: "seoktap-gil",
                name: "석탑길",
                grade: "5.10a~b",
                pitchCount: 1,
                location: "염초봉 리지 암장 (페이스·오버행)",
                pitches: [{ p: 1, length: "15m", grade: "5.10a~b" }],
              },
              {
                id: "yeohaeng-gil",
                name: "여행길",
                grade: "5.10c",
                pitchCount: 2,
                location: "염초봉 리지 암장 (슬랩·크랙)",
                pitches: [
                  { p: 1, length: "40m", grade: "5.10c" },
                  { p: 2, length: "40m", grade: "5.9" },
                ],
                gear: ["퀵드로 - 8개", "프렌드(캠) 1조"],
              },
              {
                id: "bandal-b",
                name: "반달B",
                grade: "5.10a",
                pitchCount: 2,
                location: "염초봉 리지 암장 (슬랩·크랙)",
                pitches: [
                  { p: 1, length: "30m", grade: "5.10a" },
                  { p: 2, length: "35m", grade: "5.9" },
                ],
              },
              {
                id: "bandal-a",
                name: "반달A",
                grade: "5.8~5.9",
                pitchCount: 2,
                location: "염초봉 리지 암장 (슬랩·크랙)",
                pitches: [
                  { p: 1, length: "30m", grade: "5.8" },
                  { p: 2, length: "35m", grade: "5.6" },
                ],
              },
              {
                id: "maknae-gil",
                name: "막내길",
                grade: "5.10a",
                pitchCount: 3,
                location: "염초봉 리지 암장 (슬랩·크랙·오버행)",
                gear: ["퀵드로 - 8개", "프렌드(캠) 1조"],
              },
              {
                id: "seolbyeon-gil",
                name: "설변길",
                grade: "5.10a",
                pitchCount: 2,
                location: "염초봉 리지 암장 (슬랩·오버행)",
                pitches: [
                  { p: 1, length: "30m", grade: "5.10a" },
                  { p: 2, length: "40m" },
                ],
              },
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
                    {
                      url: "https://www.youtube.com/watch?v=iHXpJfvTYWo",
                      title: "도봉산의 비경, 가을 도봉산, 선인봉 박쥐길",
                      date: "2021-10-24",
                    },
                    {
                      url: "https://www.youtube.com/watch?v=5TP6LeQg5O4",
                      title: "도봉산 선인봉 박쥐길 6피치 Korea Rock Climbing Guide  IRC 20210509",
                      date: "2021-05-13",
                    },
                    {
                      url: "https://www.youtube.com/watch?v=QxQnQzMW65s",
                      title: "손정준과 함께하는 한국의 암벽 23회 - 선인봉 박쥐길",
                    },
                  ],
                  naverBlog: [
                    {
                      url: "http://www.routefinders.co.kr/news/articleView.html?idxno=1574",
                      title: "[탱자표 두근두근 동반기] 15. 도봉산 선인봉 박쥐길 - 같은 길이 다른 길을 내어 주는 이유",
                      date: "2023-03-04",
                    },
                    {
                      url: "https://m.cafe.daum.net/bigwalls/FMQ0/41",
                      title: "선인 박쥐길 개념도",
                      date: "2008-04-30",
                    },
                  ],
                },
              },
              {
                id: "pyobeom-gil",
                name: "표범길",
                pitchCount: 6,
                grade: "5.10c",
                externalLinks: {
                  naverBlog: [
                    {
                      url: "https://m.cafe.daum.net/chuncle/7TnZ/14",
                      title: "4월 16일 도봉산 선인봉 박쥐길·표범길 각 2피치 등반 (춘천클라이머스)",
                    },
                  ],
                },
              },
              { id: "yangji-gil", name: "양지길", pitchCount: 4, grade: "5.9" },
              {
                id: "seonam-gil",
                name: "선암길",
                pitchCount: 4,
                grade: "5.12c",
                externalLinks: {
                  naverBlog: [
                    {
                      url: "https://www.climbing.kr/bbs/board.php?bo_table=ridge&wr_id=14",
                      title: "도봉산 선인봉 (박쥐길·표범길·선암길·설우길) 루트 개념도",
                    },
                  ],
                },
              },
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
                location: "선인봉 맨 우측 능선; 도봉산 매표소에서 약 1시간 20분 접근",
                gear: ["로프 60m 1동", "캠(프렌드) 1세트", "퀵드로 - 5개", "슬링 3~4개"],
                externalLinks: {
                  naverBlog: [
                    {
                      url: "http://www.routefinders.co.kr/news/articleView.html?idxno=1443",
                      title: "[탱자표 두근두근 동반기] 도봉산 만장봉의 낭만길 – 낭만 자객",
                      date: "2023-01-10",
                    },
                    {
                      url: "http://climbing.or.kr/mt_gallery/125390",
                      title: "080810 도봉산 만장봉 낭만길",
                      date: "2008-08-10",
                    },
                    {
                      url: "https://m.cafe.daum.net/krcp/hyX2/11",
                      title: "[스크랩] 도봉산 만장봉 낭만길루트",
                      date: "2016-10-02",
                    },
                  ],
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
            routes: [
              {
                id: "dwaeji-ridge",
                name: "돼지리지",
                pitchCount: 6,
                grade: "5.9~5.10d",
                location: "경기 이천 도드람산; 서이천 IC에서 약 2km, 접근 30~35분",
                externalLinks: {
                  naverBlog: [
                    {
                      url: "http://www.sansan.co.kr/contents_view.html?contentsid=10391",
                      title: "도드람산 돼지리지 (사람과산)",
                    },
                    {
                      url: "https://m.cafe.daum.net/withclimbing5.14/PNtD/132",
                      title: "경기 이천 도드람 돼지리지 - 등반정보",
                    },
                  ],
                },
              },
            ],
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
              {
                id: "poem-gil",
                name: "한 편의 시를 위한 길",
                grade: "5.8",
                pitchCount: 10,
                externalLinks: {
                  youtube: [
                    {
                      url: "https://www.youtube.com/watch?v=KVsunL7mduI",
                      title: "한 편의 시를 위한 길 - 설악산 노적봉 (KBS 영상앨범 산)",
                      date: "2015-11-08",
                    },
                  ],
                  naverBlog: [
                    {
                      url: "https://www.hankyung.com/news/article/201306209141q",
                      title: "한국의 바윗길을 가다(56) 설악산 노적봉 한 편의 시를 위한 길",
                      date: "2013-06-20",
                    },
                  ],
                },
              },
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
            routes: [
              {
                id: "star-picking-boys",
                name: "별을 따는 소년들",
                grade: "5.9",
                pitchCount: 11,
                location: "토왕골, 선녀봉 우측 리지 (비룡폭포·토왕폭 조망)",
                gear: ["볼트 거의 없음 - 자연확보 위주", "캠(프렌드) 1·2·3호", "여분의 슬링"],
                externalLinks: {
                  naverBlog: [
                    {
                      url: "https://gall.dcinside.com/mgallery/board/view/?id=rock_climbing&no=5834",
                      title: "설악산 별을 따는 소년들 등반기 및 정보 (초장문 주의)",
                      date: "2020-06-30",
                    },
                  ],
                },
              },
            ],
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
                location: "중앙 계단 우측 약 80m, 붉은벽의 사선 침니형 크랙",
                gear: ["로프 60m 1동", "퀵드로 - 15개", "캠(프렌드) 1조 - 중형 이상"],
                externalLinks: {
                  youtube: [
                    {
                      url: "https://www.youtube.com/watch?v=1f-pkutPFpk",
                      title: "울산바위 비너스길 (정면 우측 크랙 ) 개척자 인터뷰 #울산바위 #비너스길 #암벽등반",
                      date: "2021-06-06",
                    },
                    {
                      url: "https://www.youtube.com/watch?v=H8fdbhxNMrk",
                      title: "비너스, 울산바위 오르는 방법: 1~5P 상세 정보",
                    },
                  ],
                  naverBlog: [
                    {
                      url: "https://m.cafe.daum.net/krcp/jboI/25",
                      title: "울산바위 비너스길 - 오늘의 등반, 모두의 등반",
                    },
                  ],
                },
              },
              {
                id: "munlidae-gil",
                name: "문리대길",
                pitchCount: 7,
                grade: "5.7~5.9",
                location: "중앙 계단 우측 10m",
                gear: ["퀵드로 - 10개", "캠(SLCD) 1조", "슬링"],
                externalLinks: {
                  youtube: [
                    {
                      url: "https://www.youtube.com/watch?v=dtVgQGhqaZ4",
                      title: "설악산 울산바위 문리대길 등반 - 부부암벽단 멀티피치 크랙등반",
                    },
                    {
                      url: "https://www.youtube.com/watch?v=w7QTzPZnU_4",
                      title: "울산바위 문리대(4번) 등반 #문리대 #울산바위 #설악산",
                    },
                  ],
                  naverBlog: [
                    {
                      url: "https://v.daum.net/v/20250919075114179",
                      title: "70년 전 열린 길 잊지 못 할 '크랙의 맛' [울산바위 특집] (월간산)",
                      date: "2025-09-19",
                    },
                  ],
                },
              },
              {
                id: "incle-gil",
                name: "인클길",
                pitchCount: 6,
                grade: "5.10a~5.12a",
                gear: ["캠 1세트", "퀵드로 - 20개", "런너 3개"],
              },
              {
                id: "incle-junior-gil",
                name: "인클주니어길",
                pitchCount: 3,
                grade: "5.10a~5.11b",
                location: "3피치 종료 후 인클길과 합류",
                pitches: [
                  { p: 1, length: "20m", grade: "5.10a" },
                  { p: 2, length: "30m", grade: "5.11b" },
                  { p: 3, length: "30m", grade: "5.11b" },
                ],
                externalLinks: {
                  youtube: [
                    {
                      url: "https://www.youtube.com/watch?v=28KTEd3qlGA",
                      title: "암벽등반 추락 설악산 울산바위 인클주니어",
                    },
                    {
                      url: "https://www.youtube.com/watch?v=5voRtw18-qU",
                      title: "[울산바위 인클주니어] 추락먹은 인절미",
                    },
                  ],
                  naverBlog: [
                    {
                      url: "http://www.sansan.co.kr/news/articleView.html?idxno=9511",
                      title: "울산암 | 인클주니어길 천궁을 향한 장쾌한 크랙의 유혹",
                      date: "2015-07-01",
                    },
                  ],
                },
              },
              {
                id: "pc-shangrila",
                name: "PC샹그릴라",
                pitchCount: 6,
                gear: ["퀵드로 - 15개", "블랙다이아몬드 캠 1세트", "에이리언 캠 1세트", "메틀리우스 캠 1세트"],
              },
              {
                id: "yoban-gil",
                name: "요반길",
                pitchCount: 9,
                grade: "5.10+",
                location: "울산바위 중앙벽 사선크랙과 PC샹그릴라 사이",
                gear: ["퀵드로 - 12개", "블랙다이아몬드 캠 6호까지 1조"],
              },
              {
                id: "gyedan-slab-gil",
                name: "계단슬랩길",
                location: "비너스길·인클길 시작점 위쪽 릿지 우측",
                externalLinks: {
                  youtube: [
                    {
                      url: "https://www.youtube.com/watch?v=mgkUfcD5WM4",
                      title: '설악산 울산바위 "계단슬랩" 1P 5.9 Korea Rock Climbing',
                    },
                  ],
                  naverBlog: [
                    {
                      url: "https://m.cafe.daum.net/krcp/jboI/21",
                      title: "울산바위 계단슬랩길 - 오늘의 등반, 모두의 등반",
                    },
                  ],
                },
              },
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
                grade: "5.7",
                location: "천화대에서 설악골로 뻗은 세 지릉(석주길·염라길·흑범길) 중 맨 위쪽 암릉",
                gear: ["자일 2동", "캠(프렌드) 1조", "퀵드로 - 10여 개", "여분의 슬링"],
                topoImageUrl: "https://img1.daumcdn.net/relay/cafe/R400x0/?fname=http%3A%2F%2Fpds47.cafe.daum.net%2Fimage%2F1%2Fcafe%2F2008%2F06%2F26%2F15%2F27%2F486336b686c91",
                externalLinks: {
                  youtube: [
                    {
                      url: "https://www.youtube.com/watch?v=UZIqGFR0nsg",
                      title: "설악산 석주길 - 무릉도원을 걷는 기분, 한번은 가야 할 암벽등반지",
                      date: "2025-05-22",
                    },
                  ],
                  naverBlog: [
                    {
                      url: "https://m.cafe.daum.net/krcp/JcMK/28",
                      title: "강원 설악산 석주길 - 오늘의 등반, 모두의 등반",
                    },
                    {
                      url: "https://m.cafe.daum.net/wjalpine1/AT73/39",
                      title: "석주길 개념도",
                      date: "2014-07-12",
                    },
                  ],
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
            routes: [
              {
                id: "geurium-dul",
                name: "그리움둘",
                grade: "5.8",
                pitchCount: 11,
                location: "유선대 (장군봉 남서벽 맞은편)",
                gear: ["캠(프렌드) 소~중형", "퀵드로 - 10개"],
                externalLinks: {
                  youtube: [
                    {
                      url: "https://www.youtube.com/watch?v=8rCXJXqUsgY",
                      title: "설악산 유선대 - 설악의 추억 (2013.07.28)",
                      date: "2013-07-28",
                    },
                    {
                      url: "https://www.youtube.com/watch?v=LeRPPo9ckUU",
                      title: "한국에서 경치가 제일 아름다운 곳 | 설악산 유선대 릿지 등반",
                    },
                  ],
                  naverBlog: [
                    {
                      url: "https://www.hankyung.com/news/article/201306279154q",
                      title: "한국의 바윗길을 가다(57) 설악산 유선대 그리움둘 리지",
                      date: "2013-06-27",
                    },
                  ],
                },
              },
            ],
          },
          {
            id: "janggunbong",
            name: "장군봉",
            status: "available",
            routes: [
              {
                id: "samhyeongje-gil",
                name: "삼형제길",
                grade: "5.9",
                location: "적벽~피너클(무명봉)~장군봉 능선; 천불동계곡, 소공원에서 약 2km",
                externalLinks: {
                  youtube: [
                    {
                      url: "https://www.youtube.com/watch?v=Y6KjuUqzbT4",
                      title: "설악산 삼형제길, 적벽 무명봉 장군봉까지 한번에 (스카이락알파인클럽)",
                    },
                  ],
                },
              },
            ],
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
                location: "대둔산 상부 케이블카 승강장 뒤편, 용문골 안부 방면",
                externalLinks: {
                  naverBlog: [
                    {
                      url: "https://gall.dcinside.com/mgallery/board/view/?id=rock_climbing&no=7230",
                      title: "대둔산 마대봉가는길(레어정보다)",
                      date: "2020-07-29",
                    },
                  ],
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
                  youtube: [
                    {
                      url: "https://www.youtube.com/watch?v=Yj0JoofpH20",
                      title: "대둔산_연재대_우정길_릿지",
                      date: "2013-04-03",
                    },
                  ],
                  naverBlog: [
                    {
                      url: "http://www.sansan.co.kr/contents_view.html?contentsid=9376",
                      title: "대둔산 우정리지 (월간 사람과산)",
                    },
                  ],
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
                  youtube: [
                    {
                      url: "https://www.youtube.com/watch?v=eaEeqme8NFE",
                      title: '"대둔산" / 역대급 인파와 막바지 단풍  / 허용된 새천년 릿지 /동심바위~칠성봉~새천년 릿지',
                      date: "2025-11-12",
                    },
                  ],
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
                location: "천등산 하늘벽, '벽이벽' 루트 오른쪽",
                externalLinks: {
                  naverBlog: [
                    {
                      url: "https://gall.dcinside.com/mgallery/board/view/?id=rock_climbing&no=10709",
                      title: "천등산'한번쯤' 개념도 정리가 필요하더라",
                      date: "2020-10-18",
                    },
                  ],
                },
              },
              {
                id: "byeogibyeok",
                name: "벽이벽",
                location: "천등산 하늘벽; 트래버스(횡단) 코스",
                externalLinks: {
                  youtube: [
                    {
                      url: "https://www.youtube.com/watch?v=mbVAO-tGdc0",
                      title: "[천등산] 벽이벽 개척😳 대한민국 최고의 트래버스코스 020벽이벽",
                      date: "2022-10-31",
                    },
                  ],
                },
              },
              {
                id: "meonhutnal",
                name: "먼훗날",
                grade: "5.10b~5.11b",
                pitchCount: 5,
                location: "천등산 하늘벽 왼쪽 (하늘벽에서 좌측으로 조금 더 올라감)",
              },
              {
                id: "piryohae",
                name: "필요해",
                pitchCount: 8,
                gear: ["퀵드로 - 10개 이상"],
                externalLinks: {
                  naverBlog: [
                    {
                      url: "http://sujini.com/xe/6064",
                      title: "천등산 필요해 개념도 (엘비자료실)",
                    },
                  ],
                },
              },
            ],
          },
          {
            id: "mindeulle-ridge",
            name: "민들레릿지",
            status: "available",
            routes: [
              {
                id: "mindeulle-ridge-route",
                name: "민들레릿지",
                grade: "5.11b",
                pitchCount: 7,
                location: "천등산 하늘벽; 상급 리지",
              },
            ],
          },
        ],
      },
    ],
  },
];
