# APE Retail IMS

## Folder Structure

```
retail-inventory/
├── frontend/                   # React + Tailwind CSS
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   │   └── ProtectedRoute.jsx   # Route guard
│   │   │   └── layout/
│   │   │       ├── Navbar.jsx           # Sidebar + Topbar
│   │   │       └── AppLayout.jsx        # Page wrapper
│   │   ├── context/
│   │   │   └── AuthContext.jsx          # Global auth state
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx            # Login screen
│   │   │   └── DashboardPage.jsx        # Main dashboard
│   │   ├── App.jsx                      # Router + Routes
│   │   ├── index.js                     # Entry point
│   │   └── index.css                    # Tailwind + Global styles
│   ├── tailwind.config.js
│   ├── package.json
│   └── .env.example
│
└── backend/                    # Node.js + Express
    ├── config/
    │   └── db.js               # MSSQL connection pool
    ├── controllers/
    │   └── authController.js   # Login logic
    ├── middleware/
    │   └── auth.js             # JWT middleware
    ├── routes/
    │   └── auth.js             # Auth endpoints
    ├── server.js               # App entry point
    ├── package.json
    └── .env.example
```

## Setup

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your DB credentials
npm run dev
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm start
```

## Login Flow
- App loads → redirects to `/login`
- User enters credentials → POST `/api/auth/login`
- Backend queries `tb_USERS` where `USER_NAME`, `PASSWORD`, and `LOGIN=1` match
- Returns JWT token + user permissions object
- Frontend stores in localStorage, redirects to `/dashboard`
- Navbar shows only menu items the user has permission for
