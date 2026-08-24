# KindLink Monorepo

KindLink is structured as a clean monorepo containing three independent projects:
- **`mobile/`**: Expo React Native Mobile Application (Expo SDK 54).
- **`backend/`**: Express + Node.js + MongoDB Atlas + JWT Authentication REST API.
- **`admin/`**: Vite + React + TypeScript Administrator Web Portal.

---

## Project Structure

```
KindLink/
│
├── mobile/                 # Expo SDK 54 React Native Mobile App
│   ├── src/                # App screens, components, hooks, & types
│   │   ├── app/            # Expo Router file-based routes
│   │   ├── components/     # UI Components
│   │   ├── constants/      # Constants & Theme
│   │   ├── hooks/          # Custom Hooks
│   │   └── types/          # TypeScript definitions
│   ├── assets/             # Images, fonts, and splash screen assets
│   ├── scripts/            # Mobile helper scripts
│   ├── app.json            # Expo configuration
│   ├── package.json        # Mobile npm dependencies
│   ├── tsconfig.json       # TypeScript configuration & alias paths
│   └── .gitignore          # Mobile gitignore
│
├── backend/                # Express & Node.js Backend Service
│   ├── src/
│   │   ├── config/         # Database configuration (database.js)
│   │   ├── controllers/    # API Controllers (auth.controller.js)
│   │   ├── middleware/     # Auth Middleware (auth.middleware.js)
│   │   ├── models/         # Mongoose Schemas (User.js)
│   │   ├── routes/         # API Routes (auth.routes.js)
│   │   └── server.js       # Express server entry point
│   ├── .env.example        # Environment variable template
│   ├── .env                # Local environment secrets (Git ignored)
│   ├── .gitignore          # Backend gitignore
│   └── package.json        # Backend npm dependencies
│
├── admin/                  # Vite + React + TypeScript Admin Portal
│   ├── src/
│   │   ├── api/            # Backend API client (auth.ts)
│   │   ├── context/        # Auth context & JWT state (AuthContext.tsx)
│   │   ├── components/     # Sidebar, StatCard, ApprovalRow, ProtectedRoute
│   │   ├── pages/          # LoginPage, DashboardPage, UsersPage, SettingsPage
│   │   ├── App.tsx         # React Router root & layout shell
│   │   ├── main.tsx        # Vite/React entry point
│   │   └── index.css       # Global design system & CSS variables
│   ├── public/             # Static assets (favicon.svg)
│   ├── index.html          # HTML shell (loads Inter font)
│   ├── vite.config.ts      # Vite config + /api proxy to backend :5000
│   ├── tsconfig.json       # TypeScript configuration
│   ├── .env.example        # Environment variable template
│   └── .gitignore          # Admin gitignore
│
├── .gitignore              # Monorepo root gitignore
└── README.md               # Monorepo documentation
```

---

## Quick Start Guide

### 1. Backend Application (`/backend`)

#### Installation
```bash
cd backend
npm install
```

#### Environment Setup
Ensure a `.env` file exists in `backend/` with the following variables:
```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
```

#### Running the Backend
- **Development Mode** (auto-reloading with Nodemon):
  ```bash
  cd backend
  npm run dev
  ```
- **Production Mode**:
  ```bash
  cd backend
  npm start
  ```
The API server runs at `http://localhost:5000`.

---

### 2. Mobile Application (`/mobile`)

#### Installation
```bash
cd mobile
npm install
```

#### Running the Mobile App
```bash
cd mobile
npx expo start
```

Press `a` for Android Emulator / LDPlayer, `i` for iOS Simulator, or scan the QR code using **Expo Go** (SDK 54).

---

## Backend API Documentation

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/health` | Public | Health check |
| **POST** | `/api/auth/register` | Public | Register new user & return JWT |
| **POST** | `/api/auth/login` | Public | Login & return JWT |
| **GET** | `/api/auth/me` | Protected (JWT) | Get authenticated user profile |

---

### 3. Admin Portal (`/admin`)

#### Installation
```bash
cd admin
npm install
```

#### Running the Admin Portal
```bash
cd admin
npm run dev
```

The admin portal runs at `http://localhost:5173`.

> **Note:** The Vite dev server proxies `/api/*` requests to the backend at `http://localhost:5000`.
> Make sure the backend is running before logging in.

#### Authentication
- Log in with an account that has `role: 'admin'` in MongoDB.
- Non-admin accounts will be rejected with an "Access denied" error.

---

## Mobile to Backend Network Configuration

When calling the backend from the Expo app on LDPlayer, Android Emulator, or a physical phone:
- Do **NOT** use `http://localhost:5000` inside the mobile code.
- Use your PC's local Wi-Fi / Ethernet IP address (e.g. `http://192.168.x.x:5000`).
