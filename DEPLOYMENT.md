# Deployment Guide

## Recommended setup

Deploy this project as **two services**:

1. `frontend`: Vercel or Netlify
2. `backend`: Render, Railway, Fly.io, or any Node host that supports long-running servers and WebSockets

Do **not** deploy the backend to Vercel serverless if you want `socket.io` to stay reliable. This backend creates an HTTP server and attaches Socket.IO to it, which fits a long-running Node service much better.

## Backend deployment

### Build and start commands

- Install command: `npm install`
- Start command: `npm start`
- Root directory: `backend`

### Backend environment variables

- `MONGO_URI=...`
- `JWT_SECRET=...`
- `CLIENT_URL=https://your-frontend-domain.com`

If you need multiple frontend domains, use:

- `CLIENT_URLS=https://your-frontend-domain.com,https://www.your-frontend-domain.com`

For Render, do not add a fixed `PORT` environment variable. Render injects `PORT` dynamically, and this backend already listens on `process.env.PORT || 5000`.
Set `MONGO_URI` to your hosted MongoDB connection string, such as MongoDB Atlas. Do not use `mongodb://localhost:27017/...` on Render, because Render cannot reach your local machine.

### MongoDB Atlas checklist

- Add your database user credentials to `MONGO_URI`
- In Atlas Network Access, allow the backend host IP or use `0.0.0.0/0` for testing
- After deploy, open `https://your-backend-domain.com/api/v1/health`

## Frontend deployment

### Build settings

- Install command: `npm install`
- Build command: `npm run build`
- Output directory: `build`
- Root directory: `frontend`

### Frontend environment variable

- `REACT_APP_BASE_URL=https://your-backend-domain.com`

Redeploy the frontend after the backend URL is known.

## Why JWT and Socket.IO need extra care

- JWT login uses an HTTP-only cookie
- Cross-site cookies in production need HTTPS
- The backend now switches to `SameSite=None` and `Secure=true` when `NODE_ENV=production`
- CORS now reads allowed frontend origins from `CLIENT_URL` or `CLIENT_URLS`
- Socket.IO uses the same backend base URL as the API

## Suggested deploy order

1. Deploy backend
2. Set backend env vars
3. Confirm `/api/v1/health` works
4. Deploy frontend with `REACT_APP_BASE_URL` set to the backend URL
5. Test signup, login, message sending, and real-time updates

## Current project note

There is a `backend/vercel.json` file in the repo, but this app is not a good fit for a serverless Vercel backend because of the long-lived Socket.IO server.
