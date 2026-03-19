
'use server';
/**
 * @fileOverview 이 파일은 외국인 사용자가 '중소기업 취업자 소득세 감면'에 대해 자연어로 질문하고 
 * AI로부터 정확하고 간결한 답변을 받을 수 있도록 하는 Genkit 플로우를 구현합니다.
 *
 * - askFaqQuestion - AI 기반 FAQ 프로세스를 처리하는 함수입니다.
 * - FaqQuestionInput - askFaqQuestion 함수의 입력 유형입니다.
 * - FaqQuestionOutput - askFaqQuestion 함수의 반환 유형입니다.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FaqQuestionInputSchema = z.object({
  question: z
    .string()
    .describe("외국인 중소기업 청년 소득세 감면 및 핸드폰 본인 인증 방법에 대한 사용자의 자연어 질문."),
  language: z
    .string()
    .optional()
    .describe("사용자의 현재 언어 설정 (예: 'ko', 'zh', 'en' 등)"),
});
export type FaqQuestionInput = z.infer<typeof FaqQuestionInputSchema>;

const FaqQuestionOutputSchema = z.object({
  answer: z
    .string()
    .describe(
      "외국인 중소기업 청년 소득세 감면 및 핸드폰 본인 인증 방법에 대한 사용자의 질문에 대한 AI의 정확하고 간결하며 유용한 답변입니다. 사용자가 질문한 언어나 지정된 언어로 답변하십시오."
    ),
});
export type FaqQuestionOutput = z.infer<typeof FaqQuestionOutputSchema>;

export async function askFaqQuestion(
  input: FaqQuestionInput
): Promise<FaqQuestionOutput> {
  return aiPoweredFaqFlow(input);
}

const faqQuestionPrompt = ai.definePrompt({
  name: 'faqQuestionPrompt',
  input: {schema: FaqQuestionInputSchema},
  output: {schema: FaqQuestionOutputSchema},
  prompt: `당신은 대한민국 '조세특례제한법 제30조(중소기업 취업자에 대한 소득세 감면)'를 전문으로 하는 외국인 전용 세무 비서입니다. 
귀하의 핵심 임무는 외국인 근로자가 이 특정 감면 혜택(최대 90% 감면)을 이해하고 신청할 수 있도록 돕는 것과, 본인 인증이 어려운 외국인 사용자를 위해 핸드폰 본인 인증 방법을 자세히 안내하는 것입니다.

[답변 원칙]
1. 범위 제한: 오직 '외국인 중소기업 청년 소득세 감면' 및 '핸드폰 본인 인증 방법'과 관련된 질문에만 답변하십시오. 
2. 거절 처리: 질문이 위 범위를 벗어나는 경우(예: 일반 부가세, 종합소득세, 비자 연장 방법, 타국 세금 등) "죄송합니다. 저는 '외국인 중소기업 청년 소득세 감면' 및 '핸드폰 본인 인증' 전문 비서로서 해당 주제에 대해서만 도움을 드릴 수 있습니다."라고 정중히 거절하십시오.
3. 정확성: 만 15세~34세 청년 요건, 중소기업 요건, 5년 동안 90% 감면(연 200만원 한도) 등 법적 사실과 외국인 등록번호를 통한 실명인증, 통신사 본인 확인 등 기술적 절차에 근거하여 답변하십시오.
4. 서비스 차별점 강조: 취업 직후의 신규 신청은 회사 인사팀을 통해 가능하지만, **지난 5년치 세금을 돌려받는 '경정청구'는 회사 인사팀을 거칠 필요 없이 'Easy Tax Refund'를 통해 직접 세무서에 신청할 수 있다는 점**을 반드시 강조하십시오. 회사의 눈치를 보지 않고도 정당한 권리를 찾을 수 있다는 점이 우리 서비스의 핵심 가치입니다.
5. 언어: 반드시 사용자가 질문한 언어 또는 지정된 언어({{{language}}})로 답변하십시오. 만약 언어가 'zh'라면 반드시 간체 중국어(Simplified Chinese)로 답변하십시오.
6. 간결함: 복잡한 법조문이나 기술 용어보다는 사용자가 이해하기 쉬운 실무적인 언어를 사용하십시오.

사용자의 질문: {{{question}}}`,
});

const aiPoweredFaqFlow = ai.defineFlow(
  {
    name: 'aiPoweredFaqFlow',
    inputSchema: FaqQuestionInputSchema,
    outputSchema: FaqQuestionOutputSchema,
  },
  async input => {
    const {output} = await faqQuestionPrompt(input);
    if (!output) {
      throw new Error('AI 답변을 생성하지 못했습니다.');
    }
    return output;
  }
);
