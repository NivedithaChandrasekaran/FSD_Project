import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Load the root .env (project root is one level up from backend)
 dotenv.config({ path: path.resolve(__dirname, '../.env') });

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('GEMINI_API_KEY not set');
  process.exit(1);
}

(async () => {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    const resp = await fetch(url);
    console.log('HTTP status', resp.status, resp.statusText);
    const data = await resp.json();
    if (Array.isArray(data.models)) {
      data.models.forEach((m) => {
        const methods = Array.isArray(m.supportedGenerationMethods)
          ? m.supportedGenerationMethods.join(', ')
          : 'none';
        console.log(`${m.name} - ${methods}`);
      });
    } else {
      console.error('Unexpected response format', data);
    }
  } catch (e) {
    console.error('Error during request:', e.message);
  }
})();
