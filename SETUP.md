# APE Retail IMS - Setup Guide

## ⚠️ IMPORTANT - Read Before Starting

When you run `create-react-app`, it creates default files (App.js, App.css, logo.svg etc.)
You MUST delete those and use our files instead.

---

## Step 1 — Prepare Frontend Folder

**Delete these CRA default files** (if they exist in your src/ folder):
- src/App.js         ← DELETE
- src/App.test.js    ← DELETE
- src/logo.svg       ← DELETE
- src/reportWebVitals.js ← DELETE
- src/setupTests.js  ← DELETE (optional, keep if you want)

**Keep / Copy our files into src/**:
- src/App.jsx        ← our file
- src/App.css        ← our file (empty, just keeps CRA happy)
- src/index.js       ← our file
- src/index.css      ← our file (Tailwind)
- src/context/
- src/components/
- src/pages/

---

## Step 2 — Install Frontend Dependencies

```bash
cd frontend
npm install
```

---

## Step 3 — Create .env file

```bash
# In frontend/ folder, create a file called .env
REACT_APP_API_URL=http://localhost:5000/api
```

---

## Step 4 — Start Frontend

```bash
npm start
```
Should open at http://localhost:3000

---

## Step 5 — Backend Setup

```bash
cd backend
npm install
```

Create `.env` file in backend/ folder:
```
PORT=5000
FRONTEND_URL=http://localhost:3000
DB_SERVER=YOUR_SQL_SERVER_NAME
DB_USER=sa
DB_PASSWORD=YOUR_PASSWORD
DB_NAME=POSBACK_SYSTEM
JWT_SECRET=ape_retail_ims_secret_2024
```

```bash
npm run dev
```
Should show: ✅ MSSQL Connected + 🚀 Server running on http://localhost:5000

---

## Folder Structure (Final)

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── App.jsx                          ← Main router
│   ├── App.css                          ← Empty (required by CRA)
│   ├── index.js                         ← Entry point
│   ├── index.css                        ← Tailwind + global styles
│   ├── context/
│   │   └── AuthContext.jsx              ← Auth state
│   ├── components/
│   │   ├── auth/
│   │   │   └── ProtectedRoute.jsx       ← Route guard
│   │   └── layout/
│   │       ├── Navbar.jsx               ← Sidebar + topbar
│   │       └── AppLayout.jsx            ← Page wrapper
│   └── pages/
│       ├── LoginPage.jsx                ← Login screen
│       └── DashboardPage.jsx            ← Dashboard
├── tailwind.config.js
├── postcss.config.js
├── package.json
└── .env

backend/
├── config/
│   └── db.js                            ← MSSQL pool
├── controllers/
│   └── authController.js               ← Login logic
├── middleware/
│   └── auth.js                          ← JWT verify
├── routes/
│   └── auth.js                          ← POST /api/auth/login
├── server.js
├── package.json
└── .env
```
