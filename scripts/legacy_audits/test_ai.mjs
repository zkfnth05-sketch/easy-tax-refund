import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import dotenv from 'dotenv';
import path from 'path';

// Load .env.local
dotenv.config({ path: '.env.local' });

const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-1.5-flash',
});

async function testAi() {
  console.log('Testing AI with key:', process.env.GOOGLE_API_KEY ? 'Present' : 'Missing');
  try {
    const response = await ai.generate('Hello, are you working? Respond with "YES" if you are.');
    console.log('AI Response:', response.text);
  } catch (error) {
    console.error('AI Test Failed:', error);
  }
}

testAi();
