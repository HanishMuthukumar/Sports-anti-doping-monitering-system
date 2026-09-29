# Testing Guide
## Sports Anti-Doping Monitoring System

---

## 1. Automated Test Suite

The system includes a 100% automated test suite using **pytest** and **pytest-django** covering authentication, role permissions, state machine transitions, and the complete 12-step end-to-end workflow.

### Running Backend Tests
```bash
cd backend
.venv/Scripts/activate     # On Windows (.venv\Scripts\activate)
pytest
```

### Running with Test Coverage
```bash
pytest --cov=. --cov-report=term-missing
```

---

## 2. Test File Inventory

| Test File | Focus | Scenarios Verified |
|---|---|---|
| `tests/test_auth.py` | Authentication & Tokens | Health check, login success, invalid credentials, nonexistent user, authenticated `/me`, unauthenticated `/me` (401), token refresh, token logout blacklisting |
| `tests/test_authorization.py` | Role-Based Access Control | Athlete data isolation (can only view own tests), athlete forbidden from creating users, athlete forbidden from creating tests, officer permission to schedule tests, administrator full platform access |
| `tests/test_workflow.py` | 12-Step Full Lifecycle | Multi-actor protocol: admin setup -> officer schedule -> sample collect -> sample submit -> lab receive -> lab analyze -> negative result workflow -> positive result atomic ADRV generation -> duplicate violation prevention -> authority tribunal adjudication (OPEN -> UNDER_REVIEW -> ACTION_TAKEN -> CLOSED) -> invalid sample workflow -> inconclusive sample workflow |
| `tests/test_state_machines.py` | State Transition Validation | Model-level and API-level rejection of invalid transitions on Doping Tests, Samples, and Violations (HTTP 400 with descriptive error payload) |

---

## 3. Frontend Verification

### Running Frontend Production Build
```bash
cd frontend
npm run build
```
Build output produces optimized bundles in `dist/` with zero TypeScript errors.

### Development Preview Server
```bash
cd frontend
npm run preview
```
Previews the production-compiled single-page application at `http://localhost:4173`.
