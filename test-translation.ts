import { translateChatMessage } from './src/ai/flows/chat-translation-flow';

async function test() {
  try {
    const res = await translateChatMessage({
      message: "2023년 월급명세서",
      sourceLanguage: 'ko',
      targetLanguage: 'en'
    });
    console.log("SUCCESS_TRANSLATION:", res.translatedMessage);
  } catch (err) {
    console.error("FAILURE_TRANSLATION:", err);
  }
}
test();
