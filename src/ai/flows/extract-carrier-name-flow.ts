'use server';
/**
 * @fileOverview 통신사 앱(SKT, KT, LGU+) 마이페이지/내 정보 캡처 화면에서 
 * 사용자의 '등록 성함'을 정확하게 추출하는 AI OCR 플로우입니다.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ExtractCarrierNameInputSchema = z.object({
  photoDataUri: z.string().describe("통신사 앱 캡처 사진 (Base64 데이터 URI)"),
});

const ExtractCarrierNameOutputSchema = z.object({
  extractedName: z.string().describe('추출된 영문 또는 한글 성명'),
  carrierType: z.enum(['SKT', 'KT', 'LGU+', 'UNKNOWN']).describe('식별된 통신사 종류'),
  confidence: z.number().describe('추출 정확도 (0~1)'),
  rawText: z.string().optional().describe('전체 추출 텍스트 (디버깅용)'),
  recommendation: z.string().describe('사용자에게 보여줄 안내 메시지 (한국어)'),
});

const carrierOcrPrompt = ai.definePrompt({
  name: 'carrierOcrPrompt',
  input: { schema: ExtractCarrierNameInputSchema },
  output: { schema: ExtractCarrierNameOutputSchema },
  prompt: `당신은 대한민국 통신사(SKT PASS, KT PASS, LGU+ PASS) 앱 화면 판독 전문가입니다.
첨부된 통신사 앱 캡처 이미지에서 사용자의 '성함(이름)' 정보를 정확하게 찾아내십시오.

판독 규칙:
1. '내 정보', '프로필', '회원정보' 등의 영역에서 성명을 찾습니다.
2. 외국인인 경우 보통 영문 대문자(띄어쓰기 포함)로 기재되어 있습니다. (예: HONG GILDONG)
3. 해당 이름이 어떤 통신사 앱인지 로고나 텍스트를 보고 판단하십시오. (SKT T-World, KT, U+ 등)
4. 추출된 이름이 신분증과 한 글자만 달라도 인증이 실패하므로, 띄어쓰기 하나까지 아주 정밀하게 반환하십시오.

안내 메시지(recommendation) 예시:
- "고객님의 통신사 등록 이름 'HONG GILDONG'을 찾았습니다. 띄어쓰기를 포함해 그대로 입력해 보세요!"
- "이미지가 흐려 이름 판독이 불분명하지만 'HONG GILDONG'으로 보입니다."

이미지 데이터: {{media url=photoDataUri}}`,
});

export async function extractCarrierName(input: { photoDataUri: string }) {
  const { output } = await carrierOcrPrompt(input);
  if (!output) throw new Error('통신사 정보 판독에 실패했습니다.');
  return output;
}
