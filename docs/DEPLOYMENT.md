# Deployment Guide
## Sports Anti-Doping Monitoring System

---

## 1. Database Provisioning (Supabase PostgreSQL)

1. Open your Supabase Dashboard: [https://supabase.com/dashboard/project/ckibvzxicpvtrojtalqw](https://supabase.com/dashboard/project/ckibvzxicpvtrojtalqw)
2. Navigate to **Project Settings** > **Database**.
3. Locate your Database Password (or reset it to a secure string).
4. Update `backend/.env`:
   ```ini
   DATABASE_NAME=postgres
   DATABASE_USER=postgres
   DATABASE_PASSWORD=<your_supabase_password>
   DATABASE_HOST=db.ckibvzxicpvtrojtalqw.supabase.co
   DATABASE_PORT=5432
   ```
5. Apply database migrations to Supabase:
   ```bash
   cd backend
   .venv/Scripts/python manage.py migrate
   ```
6. Seed development demo accounts (development only):
   ```bash
   .venv/Scripts/python manage.py seed_demo_data
   ```

---

## 2. Backend Deployment (Gunicorn / Production)

1. Set production environment flags in `backend/.env`:
   ```ini
   DEBUG=False
   SECRET_KEY=<generate_cryptographically_secure_random_key>
   ALLOWED_HOSTS=api.yourdomain.com,localhost,127.0.0.1
   CORS_ALLOWED_ORIGINS=https://sports-anti-doping-monitering-system.vercel.app,http://localhost:5173
   ```
2. Collect static files:
   ```bash
   python manage.py collectstatic --noinput
   ```
3. Run with Gunicorn WSGI:
   ```bash
   gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 3
   ```
4. Suitable container or PaaS hosts: Render, Railway, AWS ECS, Heroku.

---

## 3. Frontend Deployment (Vercel)

The frontend is prepared with `vercel.json` for single-page routing rewrites.
1. Connect your repository: [https://github.com/HanishMuthukumar/Sports-anti-doping-monitering-system](https://github.com/HanishMuthukumar/Sports-anti-doping-monitering-system) on Vercel: [https://vercel.com/hi-s-projec](https://vercel.com/hi-s-projec)
2. Configure Project Settings:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Environment Variables:
   - `VITE_API_BASE_URL`: `https://api.yourdomain.com` (or your deployed backend URL)
4. Trigger Deploy.
