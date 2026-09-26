# Laboratory of Pharmacognosy — 웹사이트 스타터 킷

제주대학교 약학대학 생약학연구실 소개 PPT의 구성과 디자인(포레스트 그린 + 세이지 그린 + 앰버 팔레트)을
그대로 반영한 영문 웹사이트입니다. GitHub Pages에 올리면 완전 무료로 호스팅되고,
**논문 목록은 ORCID를 통해 자동으로 갱신**됩니다.

## 폴더 구성

```
index.html                 메인 페이지 (섹션: Home, About, Research, Why Jeju,
                            Publications, Funding, People, Join Us, Contact)
css/style.css               디자인 (색상은 :root 변수로 한 곳에 모아둠)
js/main.js                  data/*.json을 읽어 논문·과제 목록을 화면에 렌더링
data/publications.json      논문 목록 — ORCID 자동 동기화가 이 파일을 덮어씀
data/projects.json          연구과제/펀딩 목록 — 직접 수정하는 파일
scripts/fetch_orcid.mjs     ORCID 공개 API에서 논문 목록을 가져오는 스크립트
.github/workflows/
  sync-publications.yml     매주 자동으로 위 스크립트를 실행해 커밋하는 GitHub Action
assets/                     사진을 넣을 폴더 (비어 있음)
```

## 왜 이런 구조인가 (자동 연동 관련 중요 설명)

- **논문(Publications)** → **ORCID 공개 API**로 자동 연동됩니다. ORCID는 공식 공개 API를 제공하고
  이용약관상 이렇게 자동으로 가져다 쓰는 것이 허용되어 있어 가장 안정적입니다.
- **Google Scholar**는 공식 API가 없고 자동 수집(크롤링)이 이용약관 위반 소지가 있어,
  사이트에 직접 끌어오는 대신 "Full list & citations on Google Scholar ↗" 버튼으로 **링크만 연결**해 두었습니다.
  인용수까지 보고 싶은 방문자는 그 링크에서 확인할 수 있습니다.
- **연구과제/수주 내역(Projects & Funding)** → 개인 연구자 단위로 안전하게 자동 수집할 수 있는
  공식 공개 API가 없어서, `data/projects.json` 파일 하나를 새 과제가 생길 때마다 짧게 수정하는
  방식으로 두었습니다(코드 지식 불필요, 아래 3번 참고). 이 사이트는 본인 소유의 홈페이지이므로
  RnDcircle 같은 제3자 플랫폼 페이지로의 링크는 넣지 않았습니다 — 필요하면 언제든 직접 추가/삭제할
  수 있습니다.

## 1) GitHub Pages에 배포하기

1. github.com에서 새 저장소(Repository)를 만듭니다 (예: `pharmacognosy-lab`).
2. 이 폴더의 파일 전체를 그 저장소에 업로드합니다 (웹에서 드래그 앤 드롭으로 업로드 가능,
   또는 `git push`).
3. 저장소의 **Settings → Pages**로 이동 → Source를 "Deploy from a branch" → Branch를
   `main` / `/(root)`로 설정 → Save.
4. 몇 분 후 `https://<github아이디>.github.io/pharmacognosy-lab/` 주소로 사이트가 열립니다.
5. (선택) 학교 도메인이나 개인 도메인을 연결하려면 같은 Pages 설정 화면의 "Custom domain"에
   입력하면 됩니다.

## 2) 논문 자동 연동 켜기 (ORCID)

1. 저장소의 **Settings → Secrets and variables → Actions → Variables** 탭에서
   `New repository variable` 클릭.
2. Name: `ORCID_ID`, Value: 본인의 ORCID iD (예: `0000-0002-1234-5678`) 입력 후 저장.
3. **Actions** 탭 → "Sync publications from ORCID" 워크플로 선택 → **Run workflow** 버튼으로
   한 번 수동 실행해 봅니다. 성공하면 `data/publications.json`이 실제 논문 목록으로 갱신되고
   자동으로 커밋됩니다.
4. 이후로는 매주 월요일(UTC 03:00, 한국시간 정오)마다 자동으로 다시 확인해서, 새 논문이
   ORCID에 등록되면 자동으로 사이트에 반영됩니다. 주기를 바꾸고 싶으면
   `.github/workflows/sync-publications.yml`의 `cron` 값을 수정하면 됩니다.

> 참고: ORCID에 논문이 등록되어 있어야 자동으로 잡힙니다. 아직 등록 안 된 논문이 있다면
> orcid.org에 로그인해서 "Add works" → DOI 또는 Crossref 검색으로 추가해두면,
> 다음 자동 동기화 때 사이트에 반영됩니다.

## 3) 연구과제 목록 수정하기 (수동, 매우 간단)

`data/projects.json` 파일을 열어 아래 형식으로 한 덩어리를 추가/수정/삭제하면 됩니다.
코드를 몰라도 텍스트 편집만으로 가능합니다 (GitHub 웹사이트에서 파일을 열고 연필 아이콘
클릭 → 수정 → Commit).

```json
{
  "title": "과제명 (영문)",
  "funder": "지원 기관명",
  "period": "시작 – 종료",
  "description": "한두 문장 설명"
}
```

## 4) 사진 넣기

`index.html`에서 점선 박스로 표시된 부분(`class="placeholder-box"`)을 찾아
`<div class="placeholder-box ..." data-label="..."></div>`를
`<img src="assets/파일명.jpg" alt="설명">`으로 바꾸고, 실제 사진 파일을 `assets/` 폴더에
넣으면 됩니다.

## 5) 색상·폰트 바꾸기

`css/style.css` 맨 위 `:root { ... }` 부분의 색상 값(포레스트 그린, 세이지 그린, 앰버)과
`--serif` / `--sans` 폰트 값만 바꾸면 사이트 전체 디자인이 함께 바뀝니다.
