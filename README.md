# MindEcho Frontend

> **MindEcho** – A mental health journaling platform with AI insights. Users can log moods, track progress, and receive personalized suggestions based on their entries.

This repository contains the **frontend** built using **React, TypeScript, and TailwindCSS** with custom UI components and authentication integrated with a backend API.

---

## Table of Contents

1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Folder Structure](#folder-structure)
4. [Getting Started](#getting-started)
5. [Environment Variables](#environment-variables)
6. [Available Scripts](#available-scripts)
7. [Authentication Flow](#authentication-flow)
8. [Components & Pages](#components--pages)
9. [API Integration](#api-integration)
10. [Testing](#testing)
11. [Future Enhancements](#future-enhancements)

---

## Features

* **User Authentication**: Signup, Login, Logout with JWT tokens.
* **Journal Entries**: Users can write, edit, and track moods.
* **Mood Tracking**: Visual representation with emojis, charts, and timelines.
* **AI Insights**: Sentiment analysis for patterns (connected with backend AI services).
* **Notifications**: Toast messages for success/error feedback.
* **Responsive UI**: Modern design using TailwindCSS and custom components.

---

## Tech Stack

* **React** (with TypeScript)
* **TailwindCSS** for styling
* **Lucide React Icons**
* **React Router v6** for routing
* **Context API** for global state management (`AuthContext`)
* **Toast Notifications** via custom hook
* **Fetch API** for backend integration
* **Vite** for frontend tooling

---

## Folder Structure

```
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
```

---

## Getting Started

### Prerequisites

* Node.js v18 or above
* npm / yarn

### Installation

1. Clone the repository:

```bash
git clone https://github.com/<username>/mindecho-frontend.git
cd mindecho-frontend
```

2. Install dependencies:

```bash
npm install
# or
yarn
```

3. Set up environment variables (see next section).

4. Start the development server:

```bash
npm run dev
# or
yarn dev
```

5. Open your browser at `http://localhost:5173` (or the port Vite shows).

---

## Environment Variables

Create a `.env` file in the root:

```env
VITE_APP_API_URL=http://localhost:2430
```

* `VITE_APP_API_URL`: Base URL of your backend API. Change it to your production backend when deploying.

> Note: Vite requires all environment variables to start with `VITE_`.

---

## Available Scripts

| Script            | Description                       |
| ----------------- | --------------------------------- |
| `npm run dev`     | Start dev server with hot reload  |
| `npm run build`   | Build optimized production bundle |
| `npm run preview` | Preview production build locally  |

---

## Authentication Flow

1. **Register / Login**

   * User submits the form → frontend sends `POST` request to backend.
   * Backend returns JWT token + user info.
   * `AuthContext` saves user & token in state + localStorage.

2. **Protected Routes**

   * Dashboard, Journal pages are protected using `AuthContext`.
   * Unauthenticated users are redirected to `/login`.

3. **Logout**

   * Clears user + token from state and localStorage.

---

## Components & Pages

* **Register.tsx** – Signup form with validations + error handling.
* **Login.tsx** – Login form using email/password.
* **Dashboard.tsx** – Main landing page after login.
* **Journal.tsx** – Write, view, and track journal entries.
* **UI Components**:

  * `Card`, `CardHeader`, `CardContent`, `Input`, `Button`, `Label`, `Alert`
* **Toast** – Displays success/error messages globally.

---

## API Integration

* **Signup**: `POST /signup` → `{ username, email, password }` → `{ user, token }`
* **Login**: `POST /login` → `{ email, password }` → `{ user, token }`
* **Journal Entries**: `GET/POST/PUT /journal` → fetch/add/update user journal entries

> Frontend handles errors gracefully and displays messages returned from backend.

---

## Testing

* Use **Postman** to test backend endpoints first.
* Use frontend forms to test end-to-end flow: signup → login → dashboard → journal.
* Check console logs for token and API responses during development.

---

## Future Enhancements

* AI-powered insights visualization (charts, heatmaps).
* Mood-based recommendations and reminders.
* Dark mode toggle and accessibility improvements.
* Real-time peer support chats using Socket.io.
* Deploy frontend on **Vercel / Netlify** and connect with production backend.
