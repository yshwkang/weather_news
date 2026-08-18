# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

개인용 브라우저 시작 페이지(한국어, `lang="ko"`)로, 빌드 단계·패키지 매니저·테스트 스위트 없이 정적 HTML 파일 하나로 이루어져 있습니다. 화면에는 다음이 표시됩니다.
- 네이버 검색 폼 (`search.naver.com`으로 바로 제출)
- 실시간 시계
- 하드코딩된 도시 목록의 현재 날씨 (OpenWeatherMap API)
- 한국어 최신 뉴스 헤드라인 (NewsAPI.org)

화면(마크업·CSS·JS)은 [index.html](index.html) 한 파일에 들어 있고, 날씨·뉴스 API 호출은 각각 [api/weather.js](api/weather.js), [api/news.js](api/news.js) Vercel 서버리스 함수가 대신 수행합니다 (아래 API 관련 사항 참고).

## 로컬 실행 방법

```
start.bat
```

이 스크립트는 `vercel dev --listen 8532`로 정적 파일과 `api/` 서버리스 함수를 함께 서빙한 뒤 기본 브라우저에서 `http://localhost:8532/index.html`을 엽니다. 동일한 동작을 직접 실행하려면:

```
vercel dev --listen 8532
```

`api/` 함수가 로컬에서 동작하려면 프로젝트 루트에 `OPENWEATHER_API_KEY`, `NEWSAPI_KEY`를 담은 `.env` 파일이 필요합니다(형식은 [.env.example](.env.example) 참고, `.env`는 git에 커밋되지 않음). `vercel env pull`로 Vercel에 등록된 값을 받아오거나 직접 채워 넣으면 됩니다.

[.claude/launch.json](.claude/launch.json)에 정의된 VS Code 실행 설정도 같은 포트에서 동일한 명령을 실행합니다.

빌드·린트·테스트 명령은 없습니다. (참고: 예전에는 `python -m http.server`로도 정적 페이지만 볼 수 있었지만, 날씨·뉴스가 서버리스 함수 프록시로 바뀐 뒤로는 `vercel dev`가 필요합니다 — python 서버로는 `/api/*` 요청이 404가 됩니다.)

## 배포

이 프로젝트는 Vercel에 연결되어 있으며([.vercel/project.json](.vercel/project.json), 프로젝트명 `weather-news`), 빌드 단계 없이 정적 파일 + `api/` 서버리스 함수 구성으로 배포합니다. `OPENWEATHER_API_KEY`와 `NEWSAPI_KEY`는 Vercel 프로젝트의 Environment Variables(Settings → Environment Variables)에 등록되어 있어야 하며, 값을 바꾸면 재배포가 필요합니다.

## API 관련 사항 (중요)

이 저장소는 GitHub에 public으로 공개되어 있으므로, API 키는 어떤 커밋 파일에도 평문으로 들어가지 않도록 관리합니다. 두 키 모두 클라이언트(브라우저)나 git에 노출되지 않고, `api/weather.js`와 `api/news.js` 안에서 `process.env.OPENWEATHER_API_KEY` / `process.env.NEWSAPI_KEY`로만 참조됩니다.

- `loadWeather()`(index.html)는 `CITIES` 배열(위도/경도 쌍)의 각 항목에 대해 `/api/weather?lat=…&lon=…`을 호출합니다. [api/weather.js](api/weather.js)가 서버 사이드에서 OpenWeatherMap의 "현재 날씨" 엔드포인트(`api.openweathermap.org/data/2.5/weather`)를 `metric` 단위·한국어 설명(`lang=kr`)으로 호출해 응답을 그대로 중계합니다.
- `loadNews()`(index.html)는 `/api/news`를 호출합니다. [api/news.js](api/news.js)가 서버 사이드에서 NewsAPI의 "everything" 엔드포인트(`newsapi.org/v2/everything`)를 고정된 한국어 쿼리(`q=소식`, `language=ko`)로 호출하고, `publishedAt` 기준 정렬로 최대 10개 기사를 가져와 중계합니다.
- 두 로더 모두 페이지 로드 시 한 번만 실행되는 `async` 함수입니다(폴링/새로고침 없음). 시계는 `setInterval`로 30초마다 다시 렌더링됩니다.
- NewsAPI 무료(Developer) 플랜은 브라우저에서의 직접 호출을 `localhost`에서만 허용하고 그 외 origin은 `426 corsNotAllowed`로 차단합니다 — `/api/news` 프록시는 이 CORS 제한을 우회하는 역할도 겸합니다(서버 사이드 호출은 이 제한을 받지 않음).
- 키를 교체할 때는 로컬 `.env`와 Vercel 대시보드의 Environment Variables를 모두 갱신해야 합니다(코드 안에는 갱신할 곳이 없음).

## 수정 시 참고사항

- 도시를 추가/제거하려면 `CITIES` 배열을 수정하세요 (각 항목에 `name`, `lat`, `lon` 필요).
- 테마는 `:root`의 CSS 커스텀 프로퍼티와 `prefers-color-scheme: dark` 오버라이드 블록으로 전부 처리됩니다 — 새 색상을 추가할 때도 값을 하드코딩하지 말고 변수로 관리하세요.
