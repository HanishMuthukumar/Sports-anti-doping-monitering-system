# Sports Anti-Doping Monitoring System

An enterprise-grade, tamper-evident anti-doping monitoring platform engineered to the World Anti-Doping Agency (WADA) International Standards. Tracks athlete biological profiles, mission scheduling, chain of custody, analytical laboratory screening, adverse analytical findings, and tribunal adjudications.

[![Python](https://img.shields.io/badge/Python-3.14-blue.svg)](https://python.org)
[![Django](https://img.shields.io/badge/Django-5.0.6-darkgreen.svg)](https://djangoproject.com)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue.svg)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8.svg)](https://tailwindcss.com)
[![Tests](https://img.shields.io/badge/Tests-20%2F20%20Passing-brightgreen.svg)]()

---

## Architecture & Technology Stack

- **Backend**: Python 3.14, Django 5.0, Django REST Framework, SimpleJWT with token blacklisting, django-filter, django-cors-headers, Psycopg 3.
- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide icons, React Hook Form, Zod, React Router v6, Vite.
- **Database**: Supabase PostgreSQL (normalized relational schema with automatic SQLite fallback for tests and development).
- **Automated Tests**: Pytest + pytest-django test suite covering authentication, role permissions, state machines, and end-to-end workflows.
- **Deployment**: Vercel ready (`vercel.json`) with Gunicorn WSGI backend entrypoint.

---

## 5 System Roles & Permissions

1. **Administrator** (`/admin/*`): User registry, athlete onboarding, officer/lab accreditation, audit logs, CSV exports.
2. **Athlete** (`/athlete/*`): Whereabouts, testing mission schedule, sample custody receipts, lab findings, notices.
3. **Doping Control Officer** (`/officer/*`): Test mission scheduling, witness sample collection, chain of custody sealing, lab courier dispatch.
4. **Laboratory Staff** (`/laboratory/*`): Specimen intake, security seal verification, analytical screening runs, certificate of analysis issuance.
5. **Sports Authority** (`/authority/*`): Review of adverse analytical findings, tribunal proceedings, disciplinary sanctions, and longitudinal reports.

---

## Quick Start (Development)

### 1. Backend Setup
```bash
cd backend
.venv\Scripts\activate

# Apply migrations
python manage.py migrate

# Seed demo users (admin, athlete, officer, lab, authority)
python manage.py seed_demo_data

# Run backend test suite (20/20 passing)
pytest

# Start API server
python manage.py runserver 8000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run build
npm run dev
```
Open `http://localhost:5173` to access the application.

---

## Demo Credentials

All seeded demo accounts share the password: `Demo@1234`

| Role | Email | Password |
|---|---|---|
| **Administrator** | `admin@demo.sadms` | `Demo@1234` |
| **Athlete** | `athlete@demo.sadms` | `Demo@1234` |
| **Doping Control Officer** | `officer@demo.sadms` | `Demo@1234` |
| **Laboratory Staff** | `lab@demo.sadms` | `Demo@1234` |
| **Sports Authority** | `authority@demo.sadms` | `Demo@1234` |

---

## Documentation Suite

Detailed technical guides are available in the [`docs/`](docs/) directory:
- [`docs/SRS.md`](docs/SRS.md) — Complete Software Requirements Specification
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — System Architecture, State Machines & Security
- [`docs/DATABASE.md`](docs/DATABASE.md) — Relational Database Schema & Table Definitions
- [`docs/API.md`](docs/API.md) — Comprehensive REST API Reference
- [`docs/TESTING.md`](docs/TESTING.md) — Automated Test Suite & Coverage Guide
- [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) — Supabase, Vercel, and Gunicorn Deployment Manual
- [`docs/USER_GUIDE.md`](docs/USER_GUIDE.md) — User Operations Manual for all 5 roles
- [`database/README.md`](database/README.md) — Database Migration & Schema Overview
