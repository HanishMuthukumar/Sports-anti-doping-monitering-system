# Software Requirements Specification (SRS)
## Sports Anti-Doping Monitoring System

---

## 1. Introduction

### 1.1 Purpose
The purpose of the **Sports Anti-Doping Monitoring System** is to provide an end-to-end, tamper-evident digital tracking solution for national and international sports regulatory bodies, ensuring strict adherence to the World Anti-Doping Agency (WADA) International Standards. The system tracks athlete registrations, test mission orders, biological specimen collection, chain of custody, laboratory certificate analysis, and legal disciplinary proceedings for Anti-Doping Rule Violations (ADRVs).

### 1.2 Scope
The system provides role-tailored capabilities for five distinct stakeholder groups:
1. **Administrator**: Platform provisioning, organization registration, user management, and executive audit oversight.
2. **Athlete**: Whereabouts and biological passport monitoring, testing schedule transparency, sample custody receipts, certificate retrieval, and violation inquiry responses.
3. **Doping Control Officer (DCO)**: In-competition and out-of-competition mission scheduling, witness protocol compliance, biological sample collection, and sealed courier dispatch.
4. **Laboratory Staff**: Sample intake verification, tamper seal audits, chromatographical / spectrometric screening, and certificate of analysis issuance.
5. **Sports Authority**: Legal review of adverse analytical findings, tribunal proceedings, sanction decrees, and longitudinal compliance reporting.

---

## 2. Overall Description

### 2.1 User Roles & Authorization Hierarchy

| Role | Key Capabilities | Permitted Routes |
|---|---|---|
| **ADMINISTRATOR** | Full system administration, user and athlete registration, laboratory accreditation, test audits, CSV data exports | `/admin/*` |
| **ATHLETE** | View assigned test missions, custody receipts, certified findings, compliance notices | `/athlete/*` |
| **DOPING_CONTROL_OFFICER** | Schedule testing orders, collect urine/blood samples, record custody seals, dispatch to labs | `/officer/*` |
| **LABORATORY_STAFF** | Verify specimen seals, intake samples, start analytical screening, issue certificates | `/laboratory/*` |
| **SPORTS_AUTHORITY** | Review adverse analytical findings, conduct hearings, impose sanctions, close dockets | `/authority/*` |

### 2.2 Domain Entities & Schema
- **User**: Custom user authentication model with email-based authentication and role enforcement.
- **Athlete**: Athlete profile linked 1:1 with User, containing sport discipline, nationality, team, coach, and license ID.
- **DopingControlOfficer**: Accredited officer profile with WADA accreditation certification number and agency affiliation.
- **Laboratory**: Accredited laboratory facility with geographic and accreditation metadata.
- **LaboratoryStaff**: Accredited analytical personnel linked to an accredited laboratory.
- **DopingTest**: Authorized testing order specifying date, location, testing protocol, assigned DCO, and status timeline.
- **Sample**: Biological specimen (urine/blood) under tamper-evident chain of custody.
- **LaboratoryResult**: Official analytical certificate issued by testing facilities (NEGATIVE, POSITIVE, INVALID, INCONCLUSIVE).
- **Violation**: Anti-Doping Rule Violation (ADRV) casework automatically generated upon positive findings, subject to formal adjudication.
- **Notification**: In-app compliance and dispatch alerts.
- **Report**: Stored operational reports and CSV data export metadata.

---

## 3. Specific System Requirements

### 3.1 Authentication & Security (FR-01 - FR-05)
- **FR-01**: Secure JWT-based authentication using Django REST Framework SimpleJWT with HS256 encryption.
- **FR-02**: Automatic token rotation and token blacklisting on logout.
- **FR-03**: Secure password hashing using PBKDF2 with SHA-256 iterations.
- **FR-04**: Role-based access control (RBAC) enforced on every API view via permission classes.
- **FR-05**: Object-level authorization preventing unauthorized cross-tenant data access.

### 3.2 Testing Operations & Custody (FR-06 - FR-12)
- **FR-06**: DCOs can schedule in-competition, out-of-competition, targeted, and follow-up testing missions.
- **FR-07**: Status state machine for Doping Tests enforces valid sequential transitions:
  `SCHEDULED -> SAMPLE_COLLECTED -> SAMPLE_SUBMITTED -> UNDER_ANALYSIS -> RESULT_GENERATED -> COMPLETED` (or `CANCELLED`).
- **FR-08**: Sample chain-of-custody enforces:
  `COLLECTED -> SUBMITTED -> RECEIVED -> UNDER_ANALYSIS -> ANALYZED` (or `INVALID`).
- **FR-09**: Every custody transition logs officer/analyst timestamp and security notes in an immutable log.

### 3.3 Laboratory Analysis & Adverse Findings (FR-13 - FR-18)
- **FR-13**: Accredited laboratory staff intake samples, verifying tamper-evident container seals.
- **FR-14**: Certification of results requires methodology, findings summary, and optional certificate reference.
- **FR-15 (Critical)**: Submitting a **POSITIVE** result atomically opens an Anti-Doping Rule Violation (`Violation`) record and dispatches urgent alerts to the athlete and sports authority.
- **FR-16**: Duplicate violation protection prevents multiple ADRV records for the same sample.
- **FR-17**: **NEGATIVE** results automatically conclude the linked testing mission and issue a clear notice to the athlete.
- **FR-18**: **INVALID** and **INCONCLUSIVE** results update sample status without opening an ADRV, triggering officer/authority review.

### 3.4 Disciplinary Adjudication (FR-19 - FR-22)
- **FR-19**: Violation workflow enforces sequential legal progression:
  `OPEN -> UNDER_REVIEW -> ACTION_TAKEN -> CLOSED`.
- **FR-20**: Transition to `UNDER_REVIEW` records the reviewing official and review timestamp.
- **FR-21**: Transition to `ACTION_TAKEN` captures the tribunal ruling text and effective sanction date.
- **FR-22**: Transition to `CLOSED` finalizes the case record.

### 3.5 Reporting & Analytics (FR-23 - FR-25)
- **FR-23**: Dashboard KPI summary calculates real metrics directly from relational database tables.
- **FR-24**: Testing and violation registry views support query filtering by date range, sport, status, and laboratory.
- **FR-25**: Dynamic CSV export generation for official compliance reporting.
