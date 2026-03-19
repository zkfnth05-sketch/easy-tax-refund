# Easy Tax Refund

외국인 청년 근로자를 위한 소득세 환급 서비스 앱입니다.

## 로컬 개발 환경 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:9002](http://localhost:9002) 접속

## 환경 변수 설정

`.env.local` 파일에 Google AI API 키를 설정하세요:

```
GOOGLE_API_KEY=your_google_api_key_here
```

API 키 발급: [Google AI Studio](https://aistudio.google.com/app/apikey)

## 기술 스택

- **Framework**: Next.js 15 (Turbopack)
- **UI**: Tailwind CSS + Radix UI
- **AI**: Google Genkit (Gemini 2.5 Flash)
- **Language**: TypeScript
