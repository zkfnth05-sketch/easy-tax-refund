/**
 * [서버 전용 번역 데이터 모듈]
 * ⚠️ 이 파일은 절대 클라이언트 컴포넌트에서 import하지 마세요.
 * ⚠️ 클라이언트에서는 반드시 /api/translations/[lang] API를 사용하세요.
 *
 * 사용 위치: src/app/api/translations/[lang]/route.ts (서버 API)
 */

// 클라이언트 안전한 설정값은 config.ts에서 re-export
export type { Language } from './config';
export { languages } from './config';
