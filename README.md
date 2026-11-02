# Wizinoa HR — Employee Management Module

Full-stack **Employee CRUD** interview task: React (Vite) + Bootstrap frontend, Express + MongoDB (Mongoose) backend with **MVC pattern**, **JWT auth middleware**, **admin-only** operations and **Multer photo uploads**.

---

## ✨ Features

| Area | Details |
|---|---|
| **Pages** | Login · Dashboard (charts) · Employee list · Create employee · Edit employee |
| **Employee list** | Server-side **pagination**, search (name/email/ID/phone), department & status filters, sortable columns, responsive **table (desktop) / cards (mobile)** |
| **Employee form** | Essential fields (personal, employment, address) + **photo upload** with live preview, client-side validation, create & edit modes |
| **Dashboard** | Stat counters, **bar chart** (headcount per department), **donut chart** (status split), recent joiners |
| **Auth** | JWT login, `protect` middleware puts the logged-in user on `req.user`, `adminOnly` guards every create/update/delete |
| **Uploads** | Multer disk storage, image-only filter, 2 MB limit, old photo auto-deleted on replace/delete |
| **UI** | Responsive (off-canvas sidebar on mobile), Inter font, toasts, confirm-delete modal, loading skeletons |

## 🛠 Tech Stack

- **Frontend:** React 18, Vite, React Router 6, Bootstrap 5, Bootstrap Icons, Axios, Recharts
- **Backend:** Node.js, Express 4, Mongoose 8, Multer 2, JSON Web Token, bcryptjs, CORS, dotenv
- **Database:** MongoDB (local / MongoDB Compass)

---

## 📁 Project structure

```
wizinoa/
├── backend/
│   ├── config/           # db.js (Mongo connection), upload.js (Multer config)
│   ├── middleware/       # auth.js (protect + adminOnly), upload.js, error.js
│   ├── model/            # User.js, Employee.js
│   ├── controller/       # authController.js, employeeController.js
│   ├── route/            # authRoutes.js, employeeRoutes.js
│   ├── utils/            # seedAdmin, seedEmployees, generateEmployeeId, file.js
│   ├── uploads/employees/ # stored photos (git-ignored)
│   ├── .env.example
│   └── server.js         # app entry
│
└── frontend/
    └── src/
        ├── components/   # Sidebar, Navbar, EmployeeTable, EmployeeForm, Pagination, ConfirmDelete
        ├── pages/        # Login, Dashboard, EmployeeList, CreateEmployee, EditEmployee
        ├── services/     # employeeApi.js (axios + all API calls)
        ├── context/      # AuthContext, ToastContext
        ├── hooks/        # useDebounce, useDocumentTitle
        ├── config/       # API url, departments, statuses, options
        ├── utils/        # validators, formatters
        ├── styles/       # theme.css (design tokens + Bootstrap overrides)
        ├── App.jsx / App.css / index.css / main.jsx
```

---

## 🚀 Getting started

### Prerequisites
- Node.js 18+
- MongoDB running locally (or a connection string) — e.g. **MongoDB Compass** connected to `mongodb://127.0.0.1:27017`

### 1) Backend

```powershell
cd backend
copy .env.example .env      # then edit values if needed
npm install
npm run dev                 # or: npm start
```

Server → `http://localhost:5000`
On first boot it seeds an **admin account** and **24 demo employees**.

### 2) Frontend

```powershell
cd frontend
npm install
npm run dev
```

UI → `http://localhost:3000` (Vite proxies `/api` and `/uploads` to the backend)

### 🔑 Default admin

```
Email:    admin@wizinoa.com
Password: Admin@123
```

### Environment (`backend/.env`)

| Key | Purpose |
|---|---|
| `PORT` | API port (default 5000) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` / `JWT_EXPIRES_IN` | Token signing |
| `ADMIN_*` | Seeded admin account |
| `SEED_DEMO_DATA` | `true`/`false` — demo employees |
| `CLIENT_URL` | CORS origin (default http://localhost:3000) |

---

## 🔌 API reference

Base URL: `http://localhost:5000/api`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/login` | – | `{email, password}` → `{token, user}` |
| GET | `/auth/me` | Bearer | Authenticated user (from `req.user`) |
| GET | `/employees?page=1&limit=10&search=&department=&status=&sortBy=&order=` | Bearer | Paged list + `pagination` |
| GET | `/employees/stats` | Bearer | Totals, status split, `byDepartment` |
| GET | `/employees/:id` | Bearer | Single employee |
| POST | `/employees` | Bearer + **admin** | `multipart/form-data` (photo optional) |
| PUT | `/employees/:id` | Bearer + **admin** | `multipart/form-data` (new photo optional) |
| DELETE | `/employees/:id` | Bearer + **admin** | Deletes record + photo file |

**Role rule:** any logged-in user can *read*; only `role: "admin"` can create/update/delete — enforced by `adminOnly` middleware, and `createdBy`/`updatedBy` store which admin acted.

---

## 🗄 MongoDB Compass

```
Connection:  mongodb://127.0.0.1:27017
Database:    wizinoa_erp
Collections: users, employees
```

## 📦 Production build

```powershell
cd frontend
npm run build      # outputs frontend/dist
npm run preview    # preview the build
```

## 🔐 Security notes

- `.env` is git-ignored — only `.env.example` is committed
- Passwords hashed with bcryptjs (10 rounds)
- JWT verified on every protected route; invalid/expired tokens → 401
- Uploads restricted to JPG/PNG/WEBP/GIF, max 2 MB, randomised filenames
