# AI 프롬프트 생성기

목적에 맞는 최적화된 AI 프롬프트를 생성하는 웹 애플리케이션입니다.

## 기능

- **AI 모델 선택**: Claude (claude-sonnet-4-6) / Gemini (gemini-1.5-pro)
- **10가지 목적별 프롬프트 생성**: 업무문서, 이메일, 보고서, 엑셀수식, 공문서, 회의록, 트레이드, 클로드코드, 로블록스 Lua, 기타
- **다크모드 UI**: Claude 선택 시 오렌지 테마, Gemini 선택 시 블루 테마
- **반응형 디자인**: 모바일/태블릿/데스크톱 대응

## 기술 스택

- Next.js 14 (App Router)
- Tailwind CSS
- TypeScript

## 로컬 실행

```bash
# 의존성 설치
npm install

# 환경변수 설정
cp .env.local.example .env.local
# .env.local 파일에 API 키 입력

# 개발 서버 실행
npm run dev
```

http://localhost:3000 에서 확인할 수 있습니다.

## 환경 변수

| 변수명 | 설명 |
|--------|------|
| `ANTHROPIC_API_KEY` | Anthropic API 키 |
| `GEMINI_API_KEY` | Google Gemini API 키 |

## Vercel 배포

### 방법 1: Vercel CLI

```bash
npm i -g vercel
vercel
```

### 방법 2: GitHub 연동

1. 이 프로젝트를 GitHub에 push
2. [vercel.com](https://vercel.com)에서 Import Project
3. GitHub 저장소 선택
4. Environment Variables에 `ANTHROPIC_API_KEY`, `GEMINI_API_KEY` 추가
5. Deploy 클릭

### 환경 변수 설정 (Vercel 대시보드)

1. Vercel 프로젝트 → Settings → Environment Variables
2. `ANTHROPIC_API_KEY`와 `GEMINI_API_KEY` 추가
3. Redeploy
