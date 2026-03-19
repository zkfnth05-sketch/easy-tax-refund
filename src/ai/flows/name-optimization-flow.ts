
'use server';
/**
 * @fileOverview 외국인 사용자의 성명 조합을 생성하여 본인 인증 성공률을 높이는 Genkit 플로우입니다.
 *
 * - optimizeName - 성-이름 순서 등을 변경하여 다양한 조합을 생성합니다.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const NameOptimizationInputSchema = z.object({
  name: z.string().describe("사용자가 입력한 성명 (예: JOHN DOE)"),
});
export type NameOptimizationInput = z.infer<typeof NameOptimizationInputSchema>;

const NameOptimizationOutputSchema = z.object({
  combinations: z.array(z.object({
    name: z.string().describe("성명 조합"),
    label: z.string().describe("조합에 대한 설명 (신분증과 동일, 성/이름 반대, 띄어쓰기 없음 등)"),
  })).describe("생성된 성명 조합 목록"),
  recommendation: z.string().describe("가장 가능성 높은 조합"),
});
export type NameOptimizationOutput = z.infer<typeof NameOptimizationOutputSchema>;

export async function optimizeName(input: NameOptimizationInput): Promise<NameOptimizationOutput> {
  return nameOptimizationFlow(input);
}

const nameOptimizationPrompt = ai.definePrompt({
  name: 'nameOptimizationPrompt',
  input: {schema: NameOptimizationInputSchema},
  output: {schema: NameOptimizationOutputSchema},
  prompt: `당신은 한국의 본인 인증 시스템(KCB, NICE 등) 전문가입니다.
외국인 사용자가 입력한 이름 '{{{name}}}'을 기반으로, 한국 통신사나 외국인 등록증에 등록되어 있을 법한 성명 조합을 생성하십시오.

반드시 다음 3가지 조합을 포함하십시오:
1. 원본: 입력된 이름 그대로 (대문자 변환). Label: "신분증 이름과 동일"
2. 순서 변경: 성과 이름의 순서를 바꾼 형태 (예: JOHN DOE -> DOE JOHN). Label: "성과 이름 순서 반대"
3. 공백 제거: 모든 공백을 제거한 형태 (예: JOHN DOE -> JOHNDOE). Label: "띄어쓰기 없이 입력"

결과는 반드시 영문 대문자로 변환하여 응답하십시오.
가장 가능성이 높은 한국식 등록 형식을 'recommendation'에 담고, 전체 목록을 'combinations'에 담으십시오.`,
});

const nameOptimizationFlow = ai.defineFlow(
  {
    name: 'nameOptimizationFlow',
    inputSchema: NameOptimizationInputSchema,
    outputSchema: NameOptimizationOutputSchema,
  },
  async input => {
    const {output} = await nameOptimizationPrompt(input);
    if (!output) throw new Error('성명 최적화에 실패했습니다.');
    return output;
  }
);
