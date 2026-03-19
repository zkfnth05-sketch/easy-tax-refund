import dotenv from 'dotenv';
import axios from 'axios';

// Load .env.local
dotenv.config({ path: '.env.local' });

const apiKey = process.env.GOOGLE_API_KEY;

async function listModels() {
  console.log('API Key:', apiKey ? 'Present' : 'Missing');
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    const response = await axios.get(url);
    console.log('Available Models:');
    response.data.models.forEach(m => {
      console.log(`- ${m.name} (${m.displayName})`);
    });
  } catch (error) {
    console.error('Failed to list models:', error.response?.data || error.message);
  }
}

listModels();
