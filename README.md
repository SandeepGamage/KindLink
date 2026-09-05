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

# Optional — see "Avatar Storage" below. Omit to use local disk.
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SECRET_KEY=sb_secret_your_key_here
SUPABASE_AVATAR_BUCKET=avatars
```

#### Avatar Storage
Profile pictures uploaded through `POST /api/uploads/avatar` are stored by one
of two drivers, chosen automatically at startup (the server logs which):

- **Local disk** (default) — files go to `backend/uploads/avatars/` and are
  served from `/uploads/...`. No setup, but the files only exist on the machine
  running the server, so they are lost on a redeploy.
- **Supabase Storage** — used when `SUPABASE_URL` and `SUPABASE_SECRET_KEY` are
  both set. Files get permanent public URLs.

To set up Supabase:
1. Create a free project at [supabase.com](https://supabase.com).
2. **Storage → New bucket**, name it `avatars`, and turn **Public bucket** ON.
   Optionally cap it at 5MB and allow only `image/jpeg, image/png, image/webp`.
3. **Project URL** — the **Connect** button at the top of the dashboard. (Or read
   it off the address bar: `.../project/<ref>` → `https://<ref>.supabase.co`.)
4. **Secret key** — **Settings → API Keys**. If the project shows only a
   publishable key, click **Create new secret key**; it is not created for you.
   Use the **secret** key (`sb_secret_...`), **not** the publishable one — the
   publishable key is client-safe and cannot write to storage.

No RLS policies or SQL are needed — the secret key bypasses row-level security
and a public bucket serves reads directly. That key must stay server-side: never
put it in `mobile/`, `admin/`, or a commit.

> The older `SUPABASE_SERVICE_ROLE_KEY` name is still read as a fallback, so
> existing setups keep working. Supabase deprecates those legacy JWT keys
> (`anon` / `service_role`) at the end of 2026.

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
| **PUT** | `/api/auth/update-user` | Protected (JWT) | Update the authenticated user's profile |
| **POST** | `/api/uploads/avatar` | Protected (JWT) | Upload an image (`avatar` form field), returns its stored URL |

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
