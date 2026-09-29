# Database Migration & Schema Assets
## Sports Anti-Doping Monitoring System

This directory documents the database architecture and provides manual SQL setup scripts if executing directly against PostgreSQL without Django's migration engine.

---

## 1. Migration Management

The system uses Django native migrations:
```bash
# Apply all schema migrations
python manage.py migrate

# Seed development demo data
python manage.py seed_demo_data

# Re-run migrations with Supabase password
DATABASE_PASSWORD="your-supabase-password" python manage.py migrate
```

---

## 2. Table Dependency Graph

1. `users` (independent custom user model)
2. `athletes` (depends on `users`)
3. `officers` (depends on `users`)
4. `laboratories` (independent testing facilities)
5. `laboratory_staff` (depends on `users`, `laboratories`)
6. `doping_tests` (depends on `athletes`, `officers`)
7. `samples` (depends on `doping_tests`, `users`, `laboratory_staff`)
8. `laboratory_results` (depends on `samples`, `laboratories`, `users`)
9. `violations` (depends on `athletes`, `doping_tests`, `samples`, `laboratory_results`, `users`)
10. `notifications` (depends on `users`)
11. `reports` (depends on `users`)

---

## 3. Production PostgreSQL Connection Parameters

- **Host**: `db.ckibvzxicpvtrojtalqw.supabase.co`
- **Port**: `5432`
- **Database**: `postgres`
- **Username**: `postgres`
- **SSL Mode**: `require`
