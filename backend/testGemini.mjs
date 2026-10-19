import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Load project root .env (one level up)
dotenv.config({ path: path.resolve(__dirname, '../.env') });

dotenv.config(); // also load any .env in backend folder

const apiKey = process.env.GEMINI_API_KEY;
console.log('Key present?', !!apiKey);
if (!apiKey) {
  console.log('No GEMINI_API_KEY set, exiting.');
  process.exit(0);
}

const genAI = new GoogleGenerativeAI(apiKey);
const modelName = process.env.GEMINI_MODEL || 'gemini-1.0-pro';
const model = genAI.getGenerativeModel({ model: modelName });

(async () => {
  try {
    const result = await model.generateContent('Return a short JSON: {"hello":"world"}');
    const text = result?.response?.text?.() ?? '';
    console.log('Gemini response text:', text);
  } catch (e) {
    console.error('Gemini request error:', e.message);
  }
})();
