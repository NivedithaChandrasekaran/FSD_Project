import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Load the project‑root .env manually (no external package)
const envPath = path.resolve(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const envData = fs.readFileSync(envPath, 'utf8');
  envData.split(/\r?\n/).forEach((line) => {
    const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (match) {
      const key = match[1];
      const val = match[2];
      if (!process.env[key]) process.env[key] = val;
    }
  });
}

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('GEMINI_API_KEY not set');
  process.exit(1);
}

(async () => {
  try {
    let nextPageToken = null;
    do {
      const url = new URL('https://generativelanguage.googleapis.com/v1beta/models');
      if (nextPageToken) url.searchParams.append('pageToken', nextPageToken);
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: { 'x-goog-api-key': apiKey },
      });
      console.log('HTTP status', response.status, response.statusText);
      const data = await response.json();
      if (!Array.isArray(data.models)) {
        console.error('Unexpected response format');
        console.error(data);
        break;
      }
      data.models.forEach((model) => {
        const methods = Array.isArray(model.supportedGenerationMethods)
          ? model.supportedGenerationMethods.join(', ')
          : 'none';
        console.log(`${model.name} - ${methods}`);
      });
      nextPageToken = data.nextPageToken;
    } while (nextPageToken);
  } catch (e) {
    console.error('Error during request:', e.message);
  }
})();
