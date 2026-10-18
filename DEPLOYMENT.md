# Deployment Guide

This project is structured for a production deployment using:

- Frontend: Vercel
- Backend: Render
- Data: local JSON file (`backend/data/careerforge.json`)

## 1) Frontend deployment on Vercel

1. Push the repository to GitHub.
2. Go to Vercel and import the project.
3. Keep the repository root as the project root.
4. Vercel will use the existing [vercel.json](vercel.json) config.
5. Add this environment variable:

```env
VITE_API_URL=https://your-render-backend-url.onrender.com/api
```

6. Deploy.

## 2) Backend deployment on Render

1. Create a new Web Service on Render.
2. Connect the same GitHub repository.
3. Use the root folder as the repo root.
4. Set the service type to Node and use the following values:

- Build command: `npm install --prefix backend`
- Start command: `npm --prefix backend start`

5. Add environment variables:

```env
NODE_ENV=production
PORT=10000
JWT_SECRET=generate_a_random_secret_of_at_least_32_characters
AI_API_KEY=your_openai_api_key
CLIENT_URL=https://your-vercel-frontend-url.vercel.app
```

6. Deploy.

## 3) Persistent data storage

The backend writes data to `backend/data/careerforge.json`. Configure a persistent disk mounted at `backend/data` before deploying; otherwise, user data can be lost when the service restarts or redeploys. The local JSON store is intended for development and small single-instance deployments, not horizontally scaled production workloads.

## 4) Final verification

After deployment:

- Frontend loads on Vercel
- Backend health works at `https://your-render-backend-url.onrender.com/api/health` and reports `database: "local"`
- Register/login works from the frontend using the deployed backend URL

## 5) Notes

- The frontend must never contain the AI API key.
- All AI requests should go through the backend only.
- Configure `VITE_API_URL` in Vercel as `https://your-render-backend-url.onrender.com/api`.
- AI-powered endpoints require a valid `AI_API_KEY`; they return an explicit error when the provider is not configured or unavailable.
