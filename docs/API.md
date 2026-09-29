# REST API Reference
## Sports Anti-Doping Monitoring System

Base URL: `/api/`
Authentication: HTTP Header `Authorization: Bearer <access_token>`

---

## 1. Authentication Endpoints

### `POST /api/auth/login/`
Authenticates a user and issues JWT tokens.
- **Request Body**:
  ```json
  {
    "email": "admin@demo.sadms",
    "password": "Demo@1234"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "access": "<jwt_access_token>",
    "refresh": "<jwt_refresh_token>",
    "user": {
      "id": "uuid",
      "email": "admin@demo.sadms",
      "full_name": "System Administrator",
      "role": "ADMINISTRATOR"
    }
  }
  ```

### `POST /api/auth/refresh/`
Issues a new access token using a valid refresh token.
- **Request Body**: `{"refresh": "<jwt_refresh_token>"}`
- **Response (200 OK)**: `{"access": "<new_jwt_access_token>"}`

### `POST /api/auth/logout/`
Blacklists the refresh token to prevent further use.
- **Request Body**: `{"refresh": "<jwt_refresh_token>"}`
- **Response (200 OK)**: `{"detail": "Logged out successfully."}`

### `GET /api/auth/me/`
Returns current authenticated user details.
- **Response (200 OK)**: User profile object.

---

## 2. Core Entities

### User Management (`/api/users/`)
- `GET /api/users/`: List users (Admin only)
- `POST /api/users/`: Register user (Admin only)
- `GET /api/users/{id}/`: Retrieve user (Admin or self)
- `PATCH /api/users/{id}/`: Update user (Admin or self)
- `DELETE /api/users/{id}/`: Soft-delete/deactivate user (Admin only)

### Athletes (`/api/athletes/`)
- `GET /api/athletes/`: List athletes (Role filtered: Athlete sees own record)
- `POST /api/athletes/`: Register athlete with User account (Admin only)
- `GET /api/athletes/{id}/`: Retrieve athlete profile
- `PATCH /api/athletes/{id}/`: Update athlete profile
- `DELETE /api/athletes/{id}/`: Deactivate athlete

### Officers (`/api/officers/`)
- `GET /api/officers/`: List DCOs
- `POST /api/officers/`: Create DCO profile (Admin only)

### Laboratories (`/api/laboratories/`)
- `GET /api/laboratories/`: List accredited laboratories
- `POST /api/laboratories/`: Register laboratory (Admin only)
- `GET /api/laboratories/staff/`: List laboratory personnel
- `POST /api/laboratories/staff/`: Create laboratory personnel (Admin only)

---

## 3. Workflows & Operations

### Doping Tests (`/api/tests/`)
- `GET /api/tests/`: List tests (Filters: `status`, `test_type`, `search`)
- `POST /api/tests/`: Schedule test (Admin or DCO)
- `GET /api/tests/{id}/`: Retrieve test details
- `POST /api/tests/{id}/update-status/`:
  - Request: `{"status": "SAMPLE_COLLECTED", "notes": "..."}`
  - Enforces state transition validation.

### Samples (`/api/samples/`)
- `GET /api/samples/`: List biological samples
- `POST /api/samples/`: Collect and log sample (Admin or DCO)
- `POST /api/samples/{id}/transition/`:
  - Request: `{"status": "SUBMITTED" | "RECEIVED" | "UNDER_ANALYSIS", "notes": "...", "received_by": "<uuid>"}`
  - Updates chain of custody timeline and timestamps.

### Laboratory Results (`/api/results/`)
- `GET /api/results/`: List analytical findings certificates
- `POST /api/results/`:
  - Request:
    ```json
    {
      "sample": "<sample_uuid>",
      "result_status": "POSITIVE" | "NEGATIVE" | "INVALID" | "INCONCLUSIVE",
      "test_method": "GC-MS / LC-MS",
      "findings": "Analytical findings summary",
      "comments": "Optional remarks",
      "report_reference": "CERT-2026-001"
    }
    ```
  - **Atomic Transaction**: If `result_status` is `POSITIVE`, automatically creates an Anti-Doping Rule Violation record (`Violation`) and dispatches high-priority notifications.

### Violations (`/api/violations/`)
- `GET /api/violations/`: List ADRV casework (Filters: `status`, `search`)
- `GET /api/violations/{id}/`: Retrieve case evidentiary file
- `POST /api/violations/{id}/review/`:
  - Request:
    ```json
    {
      "status": "UNDER_REVIEW" | "ACTION_TAKEN" | "CLOSED",
      "remarks": "Tribunal decree notes",
      "action_taken": "2-year period of ineligibility",
      "action_date": "2026-10-25"
    }
    ```

### Notifications (`/api/notifications/`)
- `GET /api/notifications/`: List user notices
- `GET /api/notifications/unread-count/`: Returns `{"count": N}`
- `POST /api/notifications/{id}/mark-read/`: Mark notice read
- `POST /api/notifications/mark-all-read/`: Mark all user notices read

### Reports & Analytics (`/api/reports/`)
- `GET /api/reports/dashboard/`: Real KPI metrics from database
- `GET /api/reports/testing/`: Testing log (Add `?format=csv` for CSV export)
- `GET /api/reports/violations/`: Violations log (Add `?format=csv` for CSV export)
- `GET /api/reports/monthly/`: 6-month longitudinal trends
- `GET /api/reports/laboratories/`: Laboratory throughput metrics
- `GET /api/health/`: System health check (`{"status": "ok"}`)
