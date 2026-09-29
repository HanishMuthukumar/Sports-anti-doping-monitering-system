# Database Documentation
## Sports Anti-Doping Monitoring System

---

## 1. Relational Schema Overview

The database uses a normalized relational architecture with PostgreSQL UUID primary keys, foreign key constraints, and performance indexes.

```
                           +----------------------+
                           |        users         |
                           +----------------------+
                           | id (UUID, PK)        |
                           | email (unique)       |
                           | username (unique)    |
                           | role (enum)          |
                           | is_active (bool)     |
                           +----------+-----------+
                                      |
         +----------------------------+---------------------------+
         | 1:1                        | 1:1                       | 1:1
+--------v---------+        +---------v--------+       +----------v---------+
|     athletes     |        |     officers     |       |  laboratory_staff  |
+------------------+        +------------------+       +--------------------+
| id (UUID, PK)    |        | id (UUID, PK)    |       | id (UUID, PK)      |
| user_id (FK)     |        | user_id (FK)     |       | user_id (FK)       |
| athlete_id (uniq)|        | officer_id (uniq)|       | laboratory_id (FK) |
| sport            |        | status           |       | staff_id (uniq)    |
+--------+---------+        +---------+--------+       +--------------------+
         | 1:N                        | 1:N                       |
         +-------------+  +-----------+                           |
                       |  |                                       |
                +------v--v--------+                              |
                |   doping_tests   |                              |
                +------------------+                              |
                | id (UUID, PK)    |                              |
                | test_number (uq) |                              |
                | athlete_id (FK)  |                              |
                | officer_id (FK)  |                              |
                | status (enum)    |                              |
                +--------+---------+                              |
                         | 1:N                                    |
                +--------v---------+                              |
                |     samples      |                              |
                +------------------+                              |
                | id (UUID, PK)    |                              |
                | sample_number(uq)|                              |
                | doping_test_id(FK|                              |
                | status (enum)    |                              |
                +--------+---------+                              |
                         | 1:1                                    |
                +--------v-----------+                            |
                | laboratory_results |                            |
                +--------------------+                            |
                | id (UUID, PK)      |                            |
                | sample_id (FK, uq) |                            |
                | laboratory_id (FK) |<---------------------------+
                | result_status      |
                +--------+-----------+
                         | 1:N
                +--------v---------+
                |    violations    |
                +------------------+
                | id (UUID, PK)    |
                | violation_num(uq)|
                | athlete_id (FK)  |
                | sample_id (FK)   |
                | result_id (FK)   |
                | status (enum)    |
                | reviewed_by (FK) |
                +------------------+
```

---

## 2. Table Definitions

### 2.1 `users`
- `id`: UUID (Primary Key, default `gen_random_uuid()`)
- `email`: VARCHAR(254), UNIQUE, INDEXED
- `username`: VARCHAR(150), UNIQUE
- `first_name`: VARCHAR(150)
- `last_name`: VARCHAR(150)
- `phone`: VARCHAR(20)
- `role`: VARCHAR(50), INDEXED (`ADMINISTRATOR`, `ATHLETE`, `DOPING_CONTROL_OFFICER`, `LABORATORY_STAFF`, `SPORTS_AUTHORITY`)
- `is_active`: BOOLEAN, default `TRUE`
- `is_staff`: BOOLEAN, default `FALSE`
- `created_at`: TIMESTAMP WITH TIME ZONE
- `updated_at`: TIMESTAMP WITH TIME ZONE

### 2.2 `athletes`
- `id`: UUID (Primary Key)
- `user_id`: UUID (Foreign Key -> `users.id`, ON DELETE CASCADE, UNIQUE)
- `athlete_id`: VARCHAR(50), UNIQUE, INDEXED
- `date_of_birth`: DATE, nullable
- `gender`: VARCHAR(20)
- `sport`: VARCHAR(100), INDEXED
- `nationality`: VARCHAR(100)
- `team`: VARCHAR(100)
- `coach`: VARCHAR(100)
- `address`: TEXT
- `emergency_contact`: VARCHAR(100)
- `emergency_phone`: VARCHAR(20)
- `status`: VARCHAR(20) (`ACTIVE`, `INACTIVE`, `SUSPENDED`)

### 2.3 `officers`
- `id`: UUID (Primary Key)
- `user_id`: UUID (Foreign Key -> `users.id`, ON DELETE CASCADE, UNIQUE)
- `officer_id`: VARCHAR(50), UNIQUE
- `certification_number`: VARCHAR(100)
- `organization`: VARCHAR(200)
- `phone`: VARCHAR(20)
- `status`: VARCHAR(20) (`ACTIVE`, `INACTIVE`)

### 2.4 `laboratories`
- `id`: UUID (Primary Key)
- `laboratory_name`: VARCHAR(200)
- `accreditation_number`: VARCHAR(100), UNIQUE
- `address`: TEXT
- `city`: VARCHAR(100)
- `country`: VARCHAR(100)
- `phone`: VARCHAR(20)
- `email`: VARCHAR(254)
- `status`: VARCHAR(20) (`ACTIVE`, `INACTIVE`)

### 2.5 `laboratory_staff`
- `id`: UUID (Primary Key)
- `user_id`: UUID (Foreign Key -> `users.id`, ON DELETE CASCADE, UNIQUE)
- `laboratory_id`: UUID (Foreign Key -> `laboratories.id`, ON DELETE CASCADE)
- `staff_id`: VARCHAR(50), UNIQUE
- `designation`: VARCHAR(100)
- `qualification`: VARCHAR(200)
- `status`: VARCHAR(20)

### 2.6 `doping_tests`
- `id`: UUID (Primary Key)
- `test_number`: VARCHAR(50), UNIQUE (`DST-YYYY-XXXXXX`)
- `athlete_id`: UUID (Foreign Key -> `athletes.id`, ON DELETE CASCADE, INDEXED)
- `officer_id`: UUID (Foreign Key -> `officers.id`, ON DELETE SET NULL, nullable, INDEXED)
- `scheduled_date`: DATE
- `scheduled_time`: TIME, nullable
- `test_type`: VARCHAR(30) (`IN_COMPETITION`, `OUT_OF_COMPETITION`, `TARGETED`, `FOLLOW_UP`)
- `location`: VARCHAR(255)
- `reason`: TEXT
- `status`: VARCHAR(30), INDEXED (`SCHEDULED`, `SAMPLE_COLLECTED`, `SAMPLE_SUBMITTED`, `UNDER_ANALYSIS`, `RESULT_GENERATED`, `COMPLETED`, `CANCELLED`)
- `notes`: TEXT

### 2.7 `samples`
- `id`: UUID (Primary Key)
- `sample_number`: VARCHAR(50), UNIQUE (`SMP-XXXXXX`)
- `doping_test_id`: UUID (Foreign Key -> `doping_tests.id`, ON DELETE CASCADE, INDEXED)
- `sample_type`: VARCHAR(20) (`URINE`, `BLOOD`, `OTHER`)
- `collection_date`: DATE
- `collection_time`: TIME, nullable
- `collected_by_id`: UUID (Foreign Key -> `users.id`, ON DELETE SET NULL, nullable)
- `submitted_at`: TIMESTAMP WITH TIME ZONE, nullable
- `received_at`: TIMESTAMP WITH TIME ZONE, nullable
- `received_by_id`: UUID (Foreign Key -> `laboratory_staff.id`, ON DELETE SET NULL, nullable)
- `status`: VARCHAR(20), INDEXED (`COLLECTED`, `SUBMITTED`, `RECEIVED`, `UNDER_ANALYSIS`, `ANALYZED`, `INVALID`)
- `chain_of_custody_notes`: TEXT

### 2.8 `laboratory_results`
- `id`: UUID (Primary Key)
- `sample_id`: UUID (Foreign Key -> `samples.id`, ON DELETE CASCADE, UNIQUE)
- `laboratory_id`: UUID (Foreign Key -> `laboratories.id`, ON DELETE SET NULL, nullable)
- `analyst_id`: UUID (Foreign Key -> `users.id`, ON DELETE SET NULL, nullable)
- `result_status`: VARCHAR(20) (`NEGATIVE`, `POSITIVE`, `INVALID`, `INCONCLUSIVE`)
- `test_method`: VARCHAR(200)
- `findings`: TEXT
- `comments`: TEXT
- `report_reference`: VARCHAR(200)
- `analyzed_at`: TIMESTAMP WITH TIME ZONE

### 2.9 `violations`
- `id`: UUID (Primary Key)
- `violation_number`: VARCHAR(50), UNIQUE, INDEXED (`ADR-YYYY-XXXXXX`)
- `athlete_id`: UUID (Foreign Key -> `athletes.id`, ON DELETE CASCADE, INDEXED)
- `doping_test_id`: UUID (Foreign Key -> `doping_tests.id`, ON DELETE SET NULL, nullable)
- `sample_id`: UUID (Foreign Key -> `samples.id`, ON DELETE SET NULL, nullable)
- `laboratory_result_id`: UUID (Foreign Key -> `laboratory_results.id`, ON DELETE SET NULL, nullable)
- `description`: TEXT
- `status`: VARCHAR(20), INDEXED (`OPEN`, `UNDER_REVIEW`, `ACTION_TAKEN`, `CLOSED`)
- `reviewed_by_id`: UUID (Foreign Key -> `users.id`, ON DELETE SET NULL, nullable)
- `reviewed_at`: TIMESTAMP WITH TIME ZONE, nullable
- `action_taken`: TEXT
- `action_date`: DATE, nullable
- `remarks`: TEXT

### 2.10 `notifications`
- `id`: UUID (Primary Key)
- `user_id`: UUID (Foreign Key -> `users.id`, ON DELETE CASCADE, INDEXED)
- `title`: VARCHAR(255)
- `message`: TEXT
- `notification_type`: VARCHAR(50)
- `related_object_type`: VARCHAR(50)
- `related_object_id`: VARCHAR(100)
- `is_read`: BOOLEAN, default `FALSE`, INDEXED
- `created_at`: TIMESTAMP WITH TIME ZONE

### 2.11 `reports`
- `id`: UUID (Primary Key)
- `report_number`: VARCHAR(50), UNIQUE (`REP-YYYY-XXXXXX`)
- `report_type`: VARCHAR(50)
- `generated_by_id`: UUID (Foreign Key -> `users.id`, ON DELETE SET NULL, nullable)
- `description`: TEXT
- `file_path`: VARCHAR(500)
- `created_at`: TIMESTAMP WITH TIME ZONE
