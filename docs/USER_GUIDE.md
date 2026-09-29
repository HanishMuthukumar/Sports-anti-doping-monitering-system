# User Guide & Operations Manual
## Sports Anti-Doping Monitoring System

---

## 1. Quick Start & Demo Credentials

All pre-seeded demo accounts share the password: `Demo@1234`

| Role | Email | Password | Primary Workflow |
|---|---|---|---|
| **Administrator** | `admin@demo.sadms` | `Demo@1234` | Full platform registry, user creation, audits, CSV exports |
| **Athlete** | `athlete@demo.sadms` | `Demo@1234` | Profile whereabouts, testing calendar, certificate review |
| **Doping Control Officer** | `officer@demo.sadms` | `Demo@1234` | Test scheduling, sample collection, courier dispatch |
| **Laboratory Staff** | `lab@demo.sadms` | `Demo@1234` | Sample intake, analytical screening, issuing certificates |
| **Sports Authority** | `authority@demo.sadms` | `Demo@1234` | Review adverse analytical findings, hearings, sanctions |

---

## 2. Operating the 5 User Roles

### 2.1 Administrator (`/admin`)
- **Users**: View registered accounts, register new personnel with specific roles, or deactivate departed staff.
- **Athletes**: Register competitive athletes with sport disciplines, nationality, and team metadata.
- **Officers & Laboratories**: Review accredited personnel and analytical facilities.
- **Doping Tests & Samples**: Audit the central registry of all past and upcoming missions.
- **Reports**: Review monthly programme throughput and download testing or violations CSV exports.

### 2.2 Athlete (`/athlete`)
- **Dashboard**: Check active testing pool status and scheduled visits.
- **My Profile**: Review registered biometric parameters and sport affiliation.
- **My Tests & Results**: Track verified negative certificates or pending analysis.
- **Violations**: View active casework or confirm clean record status.
- **Notifications**: Real-time alerts regarding test appointments and result certificates.

### 2.3 Doping Control Officer (`/officer`)
- **Schedule Mission**: Assign an athlete to a testing session with location and protocol type.
- **Collect Sample**: Enter bottle barcodes and witness notes. This transitions the test to `SAMPLE_COLLECTED` and logs an initial custody entry.
- **Dispatch Sample**: Hand over sealed containers to couriers, recording shipping tracking codes. Transitions sample to `SUBMITTED`.

### 2.4 Laboratory Staff (`/laboratory`)
- **Sample Intake**: Review incoming shipments. Inspect container seals and click **Confirm Sample Receipt** (`RECEIVED`).
- **Start Analysis**: Begin chromatography screening runs (`UNDER_ANALYSIS`).
- **Certify Result**: Choose the sample and certify finding:
  - `NEGATIVE`: Certifies specimen clear of prohibited substances. Test transitions to `COMPLETED`.
  - `POSITIVE`: Adverse analytical finding. Atomically opens an ADRV casework file and alerts authorities.
  - `INVALID`: Flags specimen dilution or degradation; prompts retesting.
  - `INCONCLUSIVE`: Flags atypical elevation requiring longitudinal monitoring.

### 2.5 Sports Authority (`/authority`)
- **Casework Registry**: Review all Anti-Doping Rule Violations.
- **Adjudication Panel**:
  - `OPEN -> UNDER_REVIEW`: Formally docket case and assign tribunal members.
  - `UNDER_REVIEW -> ACTION_TAKEN`: Impose ineligibility sanctions, record hearing decrees, and effective dates.
  - `ACTION_TAKEN -> CLOSED`: Conclude hearing and archive case file.
