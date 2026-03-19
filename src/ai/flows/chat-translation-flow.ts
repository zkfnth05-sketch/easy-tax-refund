
'use server';

/**
/**
 * @fileOverview 어드민과 사용자 간의 1:1 채팅 메시지를 실시간으로 번역하는 Genkit 플로우입니다.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChatTranslationInputSchema = z.object({
  message: z.string().describe("번역할 메시지 원문"),
  sourceLanguage: z.string().describe("메시지의 원래 언어 코드"),
  targetLanguage: z.string().describe("번역될 결과 언어 코드"),
});
export type ChatTranslationInput = z.infer<typeof ChatTranslationInputSchema>;

const ChatTranslationOutputSchema = z.object({
  translatedMessage: z.string().describe("번역된 메시지"),
});
export type ChatTranslationOutput = z.infer<typeof ChatTranslationOutputSchema>;

const chatTranslationPrompt = ai.definePrompt({
  name: 'chatTranslationPrompt',
  input: {schema: ChatTranslationInputSchema},
  output: {schema: ChatTranslationOutputSchema},
  prompt: `당신은 '이지텍스(Easy Tax Refund)' 1:1 관리자 상담 전문 실시간 번역가입니다.
사용자와 관리자(어드민) 간의 원활한 소통을 위해 메시지를 정확하게 번역하십시오.

[번역 지침]
1. 상황 맥락: 대한민국 세금 환급(중소기업 취업자 감면) 서비스 상담입니다.
2. 톤앤매너: 
   - 관리자의 메시지는 친절하고 전문적이어야 합니다.
   - 사용자의 메시지는 그 의미를 명확하게 전달해야 합니다.
3. 언어 특정 규칙:
   - 'zh'인 경우 중국어 간체(Simplified Chinese)로 번역하십시오.
   - 대상 언어가 'ko'인 경우 한국어 표준어로 정중하게 번역하십시오.
4. 짧은 메시지 대응: 채팅 특성상 짧은 인사나 의성어도 그 분위기에 맞게 자연스럽게 번역하십시오.

원본 언어: {{{sourceLanguage}}}
대상 언어: {{{targetLanguage}}}
원본 메시지: {{{message}}}`,
});

export const translateChatMessage = ai.defineFlow(
  {
    name: 'chatTranslationFlow',
    inputSchema: ChatTranslationInputSchema,
    outputSchema: ChatTranslationOutputSchema,
  },
  async input => {
    const {output} = await chatTranslationPrompt(input);
    if (!output) {
      throw new Error('채팅 번역 결과를 생성하지 못했습니다.');
    }
    return output;
  }
);
