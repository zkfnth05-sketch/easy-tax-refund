'use server';
/**
 * @fileOverview 대한민국 외국인 등록증(ARC) 사진에서 필수 정보를 추출하는 OCR AI 플로우입니다.
 * 
 * 추출 항목:
 * 1. 성명 (영문 대문자)
 * 2. 외국인 등록번호 (13자리)
 * 3. 발급일자 (YYYY.MM.DD)
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractIdInfoInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "신분증 사진 (Base64 데이터 URI, 'data:<mimetype>;base64,<encoded_data>' 형식)."
    ),
});
export type ExtractIdInfoInput = z.infer<typeof ExtractIdInfoInputSchema>;

const ExtractIdInfoOutputSchema = z.object({
  name: z.string().describe('추출된 영문 성명 (대문자)'),
  registrationNumber: z.string().describe('추출된 외국인 등록번호 (13자리 숫자, 하이픈 제외 가능)'),
  issueDate: z.string().describe('추출된 발급일자 (YYYY.MM.DD 형식)'),
  confidence: z.number().describe('추출 결과에 대한 종합 신뢰도 (0~1)'),
  message: z.string().describe('사용자 안내 메시지 (한국어)'),
});
export type ExtractIdInfoOutput = z.infer<typeof ExtractIdInfoOutputSchema>;

export async function extractIdInfo(
  input: ExtractIdInfoInput
): Promise<ExtractIdInfoOutput> {
  return extractIdInfoFlow(input);
}

const ocrPrompt = ai.definePrompt({
  name: 'ocrPrompt',
  input: {schema: ExtractIdInfoInputSchema},
  output: {schema: ExtractIdInfoOutputSchema},
  prompt: `당신은 대한민국 외국인 등록증(ARC) 판독 전문가입니다.
첨부된 신분증 이미지에서 다음 3가지 필수 정보를 정확하게 추출하십시오:

1. 성명 (NAME): 보통 상단에 영문 대문자로 기재되어 있습니다. 띄어쓰기를 포함하여 있는 그대로 추출하십시오.
2. 외국인 등록번호 (Registration No.): 앞 6자리와 뒤 7자리를 찾아 13자리 숫자로 조합하십시오.
3. 발급일자 (Date of Issue): 등록증 하단 혹은 사진 근처에 위치한 발급 연월일을 찾아 YYYY.MM.DD 형식으로 반환하십시오.

이미지가 흐리거나 정보가 누락된 경우 가장 근접한 텍스트를 반환하되, confidence 점수를 낮게 설정하고 message에 주의 사항을 적어주십시오. 모든 메시지는 한국어로 작성하십시오.

이미지 데이터: {{media url=photoDataUri}}`,
});

const extractIdInfoFlow = ai.defineFlow(
  {
    name: 'extractIdInfoFlow',
    inputSchema: ExtractIdInfoInputSchema,
    outputSchema: ExtractIdInfoOutputSchema,
  },
  async input => {
    const {output} = await ocrPrompt(input);
    if (!output) throw new Error('신분증 판독에 실패했습니다.');
    return output;
  }
);
