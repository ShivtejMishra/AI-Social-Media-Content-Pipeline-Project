# SocialX Studio

AI-powered social media content pipeline.

- **Frontend** → branch `frontend` (Vite + React + Tailwind)
- **Backend** → branch `backend` (Node.js + Express + MongoDB)

## Setup

### Frontend
```bash
git clone -b frontend <repo-url> socialx-frontend
cd socialx-frontend
npm install
cp .env.production.example .env.local
# Set VITE_API_BASE_URL=http://localhost:5000/api
npm run dev
```

### Backend
```bash
git clone -b backend <repo-url> socialx-backend
cd socialx-backend
npm install
cp .env.example .env
# Fill in all env vars
npm run dev
```
