# System Architecture Document
## Sports Anti-Doping Monitoring System

---

## 1. Architectural Overview

The Sports Anti-Doping Monitoring System is engineered as a decoupled modern full-stack web application:
- **Frontend**: Single Page Application (SPA) built with React 18, TypeScript, Tailwind CSS, Lucide icons, and React Router v6, compiled via Vite.
- **Backend**: RESTful API service built with Python 3.14, Django 5.0, Django REST Framework, SimpleJWT, and Psycopg 3.
- **Database**: Managed PostgreSQL hosted on Supabase with normalized relational tables and foreign key constraints (with automatic SQLite fallback for local unit test execution).
- **Deployment**: Vercel for frontend static hosting (with SPA routing rewrites) and Gunicorn WSGI for backend container execution.

```
+-------------------------------------------------------------------------+
|                        Client Browser (React SPA)                       |
|   React Router v6  |  Axios JWT Interceptor  |  Tailwind CSS Responsive  |
+------------------------------------+------------------------------------+
                                     |
                          HTTPS / JSON REST API
                                     |
+------------------------------------v------------------------------------+
|                         Backend API Service                             |
|                           (Django 5 + DRF)                              |
|                                                                         |
|  +------------------+  +-------------------+  +----------------------+  |
|  |   Simple JWT     |  | Role Permissions  |  | State Machine Logic  |  |
|  | Authentication   |  |   Authorization   |  |  Validation Engine   |  |
|  +------------------+  +-------------------+  +----------------------+  |
|                                                                         |
|  +-------------------------------------------------------------------+  |
|  | Django Apps: accounts, athletes, officers, laboratories,         |  |
|  | doping_tests, samples, laboratory_results, violations,            |  |
|  | notifications, reports                                            |  |
|  +-------------------------------------------------------------------+  |
+------------------------------------+------------------------------------+
                                     |
                           SQL / Psycopg 3 Pool
                                     |
+------------------------------------v------------------------------------+
|                    Database Tier (Supabase PostgreSQL)                  |
|                                                                         |
|  users <---> athletes <---> doping_tests <---> samples <---> results     |
|    |                                              |            |        |
|    +-------> notifications                        +------------+        |
|    |                                                           |        |
|    +-------> officers                                     violations    |
|    |                                                           |        |
|    +-------> laboratories <---> lab_staff                      v        |
|                                                             reports     |
+-------------------------------------------------------------------------+
```

---

## 2. Frontend Architecture

### 2.1 Route Guard Hierarchy
1. `BrowserRouter`
2. `AuthProvider` (provides user, role, token lifecycle, and authentication state)
3. `ProtectedRoute` (redirects unauthenticated users to `/login`)
4. `RoleProtectedRoute` (verifies authorized roles, redirecting unauthorized users)
5. `Layout` (renders top navigation, unread notifications badge, and role-tailored sidebar)
6. Page Component (`AdminDashboard`, `AthleteDashboard`, `OfficerTestDetail`, etc.)

### 2.2 HTTP Client & Token Refresh Strategy
- `axiosInstance.ts` transparently injects `Authorization: Bearer <access_token>` on all requests.
- When an API response returns HTTP 401 Unauthorized, an interceptor pauses outgoing requests, invokes `POST /api/auth/refresh/` using the stored refresh token, updates `localStorage`, and retries the original request seamlessly.

---

## 3. Backend Architecture

### 3.1 Django Modular Application Layout
The backend decomposes anti-doping responsibilities into 10 decoupled Django apps:
- `accounts`: User authentication, role choices, and user profiles.
- `athletes`: Registered athletes, sport disciplines, and whereabouts details.
- `officers`: Doping Control Officers and credentials.
- `laboratories`: Testing facilities and accredited staff.
- `doping_tests`: Testing orders and test mission status lifecycle.
- `samples`: Biological specimens and chain-of-custody timeline.
- `laboratory_results`: Analytical certificates and atomic adverse finding triggers.
- `violations`: ADRV casework, tribunal reviews, and disciplinary sanctions.
- `notifications`: In-app compliance dispatch.
- `reports`: Dynamic statistical aggregations and CSV data export endpoints.

### 3.2 State Machines & Business Logic Enforcement
State transitions are validated at both the Model method level (`transition_status`) and the Serializer level (`validate`). Disallowed state changes (e.g. attempting to collect a sample on a completed test) immediately raise `ValidationError` and return HTTP 400 Bad Request.

### 3.3 Atomic Transaction Guarantees
Adverse analytical findings (`POST /api/results/` with `result_status = POSITIVE`) are wrapped in `@transaction.atomic`. Within this single database transaction:
1. The `LaboratoryResult` record is inserted.
2. The `Sample` status is updated to `ANALYZED`.
3. The `DopingTest` status is updated to `RESULT_GENERATED`.
4. A `Violation` record is generated with a unique case reference (`ADR-YYYY-XXXXXX`).
5. Notification records are generated for the athlete and sports authority members.
If any step fails, the entire transaction is rolled back, preventing orphaned or duplicate violation records.
