# 🌐 Deployment — Vercel (frontend) + Render (backend) + MongoDB Atlas (DB)

Local MongoDB / Compass is **not reachable** from a public server — the live app needs a cloud
database (**Atlas M0 free tier**). Compass can still manage it (paste the Atlas URI in Compass).

---

## Step 1 — MongoDB Atlas (free, ~5 min)

1. Go to <https://cloud.mongodb.com> → sign up free (M0 Shared is enough)
2. Build a Database → **Free (M0)** → region closest to you → Create
3. **Database Access** → Add New Database User
   - Authentication: Username & Password → set password → e.g. `admin123` → Create User
4. **Network Access** → Add IP Address → **0.0.0.0/0** (Allow Access From Anywhere) → Confirm
5. **Connect** → Connect your application → Driver: **Node**, copy the URI, e.g.

```
mongodb+srv://admin:<password>@cluster0.xxxxx.mongodb.net/wizinoa_erp?retryWrites=true&w=majority
```

> Replace `<password>` with your DB user password. Keep `/wizinoa_erp` at the end.
> 🎉 Bonus: this same URI opens in **Compass** (Compass → New Connection → paste).

---

## Step 2 — Backend on Render (free)

1. Go to <https://render.com> → sign in with GitHub
2. **New + → Web Service** → connect repo `maheswari123256/employee-management-crud`
3. Settings:
   | Field | Value |
   |---|---|
   | Name | `wizinoa-employee-api` (or any) |
   | Root Directory | `backend` |
   | Runtime | `Node` |
   | Build Command | `npm install` |
   | Start Command | `npm start` |
   | Instance Type | **Free** |
4. Add **Environment Variables**:

| Key | Value |
|---|---|
| `MONGO_URI` | your Atlas URI from Step 1 |
| `JWT_SECRET` | any long random string |
| `JWT_EXPIRES_IN` | `7d` |
| `ADMIN_NAME` | `Super Admin` |
| `ADMIN_EMAIL` | `admin@wizinoa.com` |
| `ADMIN_PASSWORD` | `Admin@123` |
| `SEED_DEMO_DATA` | `true` |
| `CLIENT_URL` | `https://YOUR-FRONTEND.vercel.app` (fill after Step 3) |

5. **Create Web Service** → wait for deploy → open the URL
   (e.g. `https://wizinoa-employee-api.onrender.com`) → visit
   `https://wizinoa-employee-api.onrender.com/api/health` → should return JSON ✅
   (first boot seeds admin + 24 demo employees into Atlas)

6. **Copy your backend URL** and tell me — I'll update `frontend/vercel.json` and push.

> ⚠️ Render Free sleeps after 15 min idle → first open takes ~50 s. Photos uploaded live are
> stored on the instance disk and reset on redeploy (demo-acceptable).

---

## Step 3 — Frontend on Vercel (free)

1. Go to <https://vercel.com> → **Add New… → Project** → Import `employee-management-crud`
2. Before importing, make sure `frontend/vercel.json` already has the real backend URL
   (I push this once you share the Render URL)
3. Settings:
   | Field | Value |
   |---|---|
   | Root Directory | `frontend` (Set in → Root Directory) |
   | Framework Preset | **Vite** |
   | Build Command | `npm run build` |
   | Output Directory | `dist` |
4. **Deploy** → live link: `https://employee-management-crud-xxxx.vercel.app`

---

## Step 4 — Final wiring

- On Render, update `CLIENT_URL` = your Vercel URL → Save (auto redeploys)
- Open the Vercel link in a browser (or share with anyone) →
  Login: `admin@wizinoa.com` / `Admin@123` → full UI works ✅

### How requests flow
```
Browser → Vercel (React UI + /api + /uploads rewritten) → Render API → MongoDB Atlas
```
The `vercel.json` rewrite proxies `/api` and `/uploads` to Render — same-origin,
so **no CORS problems**.
