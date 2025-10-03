MindEcho Frontend

MindEcho – A mental health journaling platform with AI insights. Users can log moods, track progress, and receive personalized suggestions based on their entries.

This repository contains the frontend built using React, TypeScript, and TailwindCSS with custom UI components and authentication integrated with a backend API.

Table of Contents

*Features
*Tech Stack
*Folder Structure
*Getting Started
*Environment Variables
*Available Scripts
*Authentication Flow
*Components & Pages
*API Integration
*Testing
*Future Enhancements

1.Features

User Authentication: Signup, Login, Logout with JWT tokens.

Journal Entries: Users can write, edit, and track moods.

Mood Tracking: Visual representation with emojis, charts, and timelines.

AI Insights: Sentiment analysis for patterns (connected with backend AI services).

Responsive UI: Modern design using TailwindCSS and custom components.


2.Tech Stack

React (with TypeScript)

TailwindCSS for styling

Lucide React Icons

React Router v6 for routing

Context API for global state management (AuthContext)

Toast Notifications via custom hook

Fetch API for backend integration

Vite for frontend tooling


3.Folder Structure

mindecho-frontend/
├── public/               # Static assets
├── src/
│   ├── api.js            # API calls to backend
│   ├── App.tsx           # Main app with routes
│   ├── main.tsx          # App entry point
│   ├── context/
│   │   └── AuthContext.tsx   # Authentication context
│   ├── hooks/
│   │   └── use-toast.ts        # Toast notifications
│   ├── components/
│   │   └── ui/           # Reusable UI components (Card, Button, Input, Label, Alert)
│   ├── pages/
│   │   ├── Register.tsx   # Signup page
│   │   ├── Login.tsx      # Login page
│   │   ├── Dashboard.tsx  # Main dashboard
│   │   └── Journal.tsx    # Journal page
│   └── styles/            # TailwindCSS custom styles (if any)
├── .env                  # Environment variables
├── package.json
├── tsconfig.json
└── vite.config.ts


4.Getting Started

Prerequisites-
Node.js v18 or above
npm / yarn

Installation
1.Clone the repository

git clone https://github.com/Symbiot24/journal-frontend.git
cd journal-frontend

2.Install dependencies:
npm install
# or
yarn

3.Set up environment variables (see next section).

4.Start the development server:
npm run dev
# or
yarn dev

5.Open your browser at http://localhost:5173 (or the port Vite shows).


5.Authentication Flow

Register / Login

User submits the form → frontend sends POST request to backend.
Backend returns JWT token + user info.
AuthContext saves user & token in state + localStorage.

Protected Routes

Dashboard, Journal pages are protected using AuthContext.
Unauthenticated users are redirected to /login.

Logout

Clears user + token from state and localStorage.


6.Components & Pages

Register.tsx – Signup form with validations + error handling.

Login.tsx – Login form using email/password.

Dashboard.tsx – Main landing page after login.

Journal.tsx – Write, view, and track journal entries.

UI Components:

Card, CardHeader, CardContent, Input, Button, Label, Alert

Toast – Displays success/error messages globally.


7.API Integration

Signup: POST /signup → { username, email, password } → { user, token }

Login: POST /login → { email, password } → { user, token }

Journal Entries: GET/POST/PUT /journal → fetch/add/update user journal entries

Frontend handles errors gracefully and displays messages returned from backend.


8.Testing

Use Postman to test backend endpoints first.

Use frontend forms to test end-to-end flow: signup → login → dashboard → journal.

Check console logs for token and API responses during development.


9.Future Enhancements

AI-powered insights visualization (charts, heatmaps).

Mood-based recommendations and reminders.

Dark mode toggle and accessibility improvements.

Real-time peer support chats using Socket.io.

Deploy frontend on Vercel / Netlify and connect with production backend.