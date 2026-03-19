
'use server';

/**
/**
 * @fileOverview 어드민이 작성한 한글 알림 메시지를 사용자의 선호 언어로 번역하는 Genkit 플로우입니다.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TranslationInputSchema = z.object({
  message: z.string().describe("어드민이 작성한 한글 메시지"),
  targetLanguage: z.string().describe("사용자의 선호 언어 코드 (예: 'vi', 'zh', 'en' 등)"),
});
export type TranslationInput = z.infer<typeof TranslationInputSchema>;

const TranslationOutputSchema = z.object({
  translatedMessage: z.string().describe("대상 언어로 번역된 메시지"),
});
export type TranslationOutput = z.infer<typeof TranslationOutputSchema>;

const notificationTranslationPrompt = ai.definePrompt({
  name: 'notificationTranslationPrompt',
  input: {schema: TranslationInputSchema},
  output: {schema: TranslationOutputSchema},
  prompt: `당신은 대한민국 '이지텍스(Easy Tax Refund)' 서비스의 전문 번역가입니다.
관리자가 한국어로 작성한 알림 메시지를 사용자의 언어({{{targetLanguage}}})로 정확하고 친근하게 번역하십시오.

[번역 지침]
1. 내용 유지: 원래 메시지의 의미와 느낌을 그대로 유지하십시오.
2. 친근한 고지사항: 외국인 사용자들이 이해하기 쉬운 명확한 용어를 사용하십시오.
3. 상황 맥락: 주로 세금 환급 신청 결과, 서류 보완 요청, 서류 오처리 안내 등의 맥락입니다.
4. 언어 특정 규칙: 
   - 'zh'인 경우 중국어 간체(Simplified Chinese)로 답변하십시오.
   - 메시지가 '서류 보완 요청'인 경우, 사용자가 무엇을 해야 하는지 명확히 전달되도록 하십시오.

한국어 메시지: {{{message}}}
대상 언어: {{{targetLanguage}}}`,
});

export const translateNotification = ai.defineFlow(
  {
    name: 'notificationTranslationFlow',
    inputSchema: TranslationInputSchema,
    outputSchema: TranslationOutputSchema,
  },
  async input => {
    const {output} = await notificationTranslationPrompt(input);
    if (!output) {
      throw new Error('번역 결과를 생성하지 못했습니다.');
    }
    return output;
  }
);
