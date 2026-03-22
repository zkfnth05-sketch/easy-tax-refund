
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
  const original = input.name.trim().toUpperCase();
  if (!original) return { combinations: [], recommendation: "" };

  const hasSpace = original.includes(' ');
  const noSpace = original.replace(/\s+/g, '');
  
  const combinations = [];
  
  // 1. ORIGINAL
  combinations.push({
    name: original,
    label: "신분증 이름과 동일"
  });

  if (hasSpace) {
    // 2. REVERSED (swap first and last groups)
    const words = original.split(/\s+/);
    if (words.length >= 2) {
      const first = words[0];
      const rest = words.slice(1).join(' ');
      combinations.push({
         name: `${rest} ${first}`,
         label: "이름과 성 순서 반대"
      });
    }

    // 3. NO SPACE
    combinations.push({
      name: noSpace,
      label: "띄어쓰기 없이 입력 (원본 순서)"
    });
    
    // 4. LASTFIRST NO SPACE
    if (words.length >= 2) {
      const first = words[0];
      const rest = words.slice(1).join('');
      const reversedNoSpace = `${rest}${first}`;
      if (reversedNoSpace !== noSpace) {
         combinations.push({
            name: reversedNoSpace,
            label: "순서 반대 및 띄어쓰기 생략"
         });
      }
    }
  }

  // Deduplicate combinations ensuring uniqueness
  const uniqueNames = new Set();
  const filteredCombinations = [];
  for (const combo of combinations) {
    if (!uniqueNames.has(combo.name)) {
      uniqueNames.add(combo.name);
      filteredCombinations.push(combo);
    }
  }

  // 1초 인위적인 딜레이(UI의 부드러운 전환을 위해 원한다면 추가, 근데 여기선 필요없음)
  // await new Promise(resolve => setTimeout(resolve, 300)); 

  return {
    combinations: filteredCombinations,
    recommendation: original
  };
}
