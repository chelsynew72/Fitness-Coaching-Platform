# 🏋️ Fitness Coaching Platform

A full-stack fitness coaching platform built with NestJS, Next.js, and MongoDB.
Coaches build workout and meal plans, assign them to clients, and track progress
in real time. Clients follow daily sessions, log metrics, and chat with their coach live.

## Tech Stack
- **Frontend:** Next.js 14, Tailwind CSS, Chart.js
- **Backend:** NestJS, MongoDB, Mongoose, WebSockets
- **Auth:** JWT with refresh tokens
- **Media:** Cloudinary

## Prerequisites
- Node.js 18+
- MongoDB installed and running locally — download from https://www.mongodb.com/try/download/community

## Getting Started

```bash
git clone https://github.com/yourusername/fitness-platform.git
cd fitness-platform
npm install
cd backend && npm install
cd ../frontend && npm install
cd ..
```

## Running in Development

Make sure MongoDB is running locally first, then:

```bash
# From root — runs both frontend and backend together
npm run dev

# Frontend only → http://localhost:3000
npm run dev:frontend

# Backend only → http://localhost:4000
npm run dev:backend
```

## Project Structure
```
fitness-platform/
├── frontend/     # Next.js App Router
├── backend/      # NestJS REST API + WebSockets
└── package.json  # Root workspace config
```

## Features
- Role-based auth (Coach, Client, Admin)
- Workout and meal plan template builder
- Template cloning and client assignment
- Daily workout session with set tracking and rest timer
- Progress logging with charts
- Real-time coach-client chat
- Mock subscription billing with automated renewal cron job
- Coach discovery and public profiles
