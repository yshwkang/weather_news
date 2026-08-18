# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

개인용 브라우저 시작 페이지(한국어, `lang="ko"`)로, 빌드 단계·패키지 매니저·테스트 스위트 없이 정적 HTML 파일 하나로 이루어져 있습니다. 화면에는 다음이 표시됩니다.
- 네이버 검색 폼 (`search.naver.com`으로 바로 제출)
- 실시간 시계
- 하드코딩된 도시 목록의 현재 날씨 (OpenWeatherMap API)
- 한국어 최신 뉴스 헤드라인 (NewsAPI.org)

모든 마크업, CSS, JavaScript는 [index.html](index.html) 한 파일에 들어 있습니다. 유일한 예외는 뉴스 API용 Vercel 서버리스 프록시 [api/news.js](api/news.js)입니다 (아래 API 관련 사항 참고).

## 로컬 실행 방법

```
start.bat
```

이 스크립트는 `python -m http.server 8532`로 현재 디렉터리를 서빙한 뒤 기본 브라우저에서 `http://localhost:8532/index.html`을 엽니다. 동일한 동작을 직접 실행하려면:

```
python -m http.server 8532
```

[.claude/launch.json](.claude/launch.json)에 정의된 VS Code 실행 설정도 같은 포트에서 동일한 명령을 실행합니다.

빌드·린트·테스트 명령은 없습니다 — 서빙된 디렉터리에서 바로 여는 정적 페이지이기 때문입니다.

## 배포

이 프로젝트는 Vercel에 연결되어 있으며([.vercel/project.json](.vercel/project.json), 프로젝트명 `weather-news`), 빌드 단계 없이 `index.html`을 그대로 정적 사이트로 배포합니다.

## API 관련 사항 (중요)

`OPENWEATHER_API_KEY`와 `NEWSAPI_KEY`는 [index.html:192-193](index.html#L192-L193)의 `<script>` 블록 상단에 평문 상수로 선언되어 있습니다.

- 두 키 모두 페이지 소스를 보면 누구나 볼 수 있습니다 — 이는 공개 다중 사용자 배포용이 아니라 개인/로컬용 시작 페이지이기 때문에 문제되지 않는 구조입니다.
- 키가 비어 있거나 아직 플레이스홀더 값(`"여기에"`로 시작하는지 문자열 접두사로 확인)일 경우, 해당 섹션은 API를 호출하는 대신 인라인 `.error` 메시지를 표시합니다.
- `loadWeather()`는 `CITIES` 배열(위도/경도 쌍)의 각 항목에 대해 OpenWeatherMap의 "현재 날씨" 엔드포인트(`api.openweathermap.org/data/2.5/weather`)를 클라이언트에서 직접 한 번씩 호출하며, `metric` 단위와 한국어 설명(`lang=kr`)을 사용합니다. OpenWeatherMap은 모든 origin에 CORS를 허용하므로 로컬·배포 환경 모두 직접 호출로 동작합니다.
- `loadNews()`는 NewsAPI의 "everything" 엔드포인트(`newsapi.org/v2/everything`)를 고정된 한국어 쿼리(`q=소식`, `language=ko`)로 호출하고, `publishedAt` 기준으로 정렬해 최대 10개 기사를 가져옵니다. 두 로더 모두 페이지 로드 시 한 번만 실행되는 `async` 함수입니다(폴링/새로고침 없음). 시계는 `setInterval`로 30초마다 다시 렌더링됩니다.

### NewsAPI는 왜 프록시를 거치는가

NewsAPI 무료(Developer) 플랜은 브라우저에서의 직접 호출을 **`localhost`에서만** 허용합니다. `localhost` 외의 origin(예: 배포된 Vercel 도메인)에서 브라우저가 직접 호출하면 NewsAPI가 `426 Upgrade Required`와 `{"code":"corsNotAllowed"}`를 반환하며 차단합니다.

이 때문에 `loadNews()`는 `location.hostname`을 검사해 분기합니다:
- `localhost`/`127.0.0.1`이면 기존처럼 클라이언트에서 `NEWSAPI_KEY`로 NewsAPI를 직접 호출합니다.
- 그 외(배포 환경)에서는 [api/news.js](api/news.js) Vercel 서버리스 함수를 대신 호출합니다. 이 함수가 서버 사이드에서 NewsAPI를 호출해 결과를 그대로 중계하므로 브라우저 CORS 제한을 우회합니다.

`api/news.js`는 자체적으로 `NEWSAPI_KEY` 상수를 갖고 있습니다(환경변수 아님, index.html과 동일한 값을 하드코딩) — `python -m http.server`로 로컬 실행할 때는 서버리스 함수가 동작하지 않으므로, 로컬 경로는 여전히 클라이언트 직접 호출에 의존합니다. 뉴스 API 키를 교체할 때는 두 파일 모두 갱신해야 합니다.

## 수정 시 참고사항

- 도시를 추가/제거하려면 `CITIES` 배열을 수정하세요 (각 항목에 `name`, `lat`, `lon` 필요).
- 테마는 `:root`의 CSS 커스텀 프로퍼티와 `prefers-color-scheme: dark` 오버라이드 블록으로 전부 처리됩니다 — 새 색상을 추가할 때도 값을 하드코딩하지 말고 변수로 관리하세요.
