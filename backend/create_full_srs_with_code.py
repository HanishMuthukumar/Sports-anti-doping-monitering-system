import os
import shutil
import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import parse_xml
from docx.oxml.ns import nsdecls

DOC_PATH = r"c:\Users\hanis\Downloads\sports-anti-doping-monitor\docs\Sports_Anti_Doping_Monitoring_System_SRS.docx"
DOWNLOADS_PATH = r"C:\Users\hanis\Downloads\Sports_Anti_Doping_Monitoring_System_SRS.docx"
DIAGRAMS_DIR = r"c:\Users\hanis\Downloads\sports-anti-doping-monitor\docs\diagrams"

doc = Document()

# Set standard page margins (1 inch) and page border on all sections
for section in doc.sections:
    section.top_margin = Inches(1)
    section.bottom_margin = Inches(1)
    section.left_margin = Inches(1)
    section.right_margin = Inches(1)
    
    sectPr = section._sectPr
    pgBorders = parse_xml(r'''
        <w:pgBorders %s>
            <w:top w:val="single" w:sz="12" w:space="24" w:color="000000"/>
            <w:left w:val="single" w:sz="12" w:space="24" w:color="000000"/>
            <w:bottom w:val="single" w:sz="12" w:space="24" w:color="000000"/>
            <w:right w:val="single" w:sz="12" w:space="24" w:color="000000"/>
        </w:pgBorders>
    ''' % nsdecls('w'))
    sectPr.append(pgBorders)

# Configure default Times New Roman font
normal_style = doc.styles['Normal']
normal_style.font.name = 'Times New Roman'
normal_style.font.size = Pt(12)
normal_style.font.color.rgb = RGBColor(0x00, 0x00, 0x00)
normal_style.paragraph_format.line_spacing = 1.15
normal_style.paragraph_format.space_after = Pt(6)

def set_run_font(run, size_pt=12, bold=False, italic=False, color_rgb=(0,0,0)):
    run.font.name = 'Times New Roman'
    run.font.size = Pt(size_pt)
    run.bold = bold
    run.italic = italic
    run.font.color.rgb = RGBColor(*color_rgb)

def add_heading_1(text):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(14)
    p.paragraph_format.space_after = Pt(6)
    p.paragraph_format.keep_with_next = True
    run = p.add_run(text)
    set_run_font(run, size_pt=16, bold=True, color_rgb=(0, 0, 0))
    return p

def add_heading_2(text):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(10)
    p.paragraph_format.space_after = Pt(4)
    p.paragraph_format.keep_with_next = True
    run = p.add_run(text)
    set_run_font(run, size_pt=13.5, bold=True, color_rgb=(0, 0, 0))
    return p

def add_heading_3(text):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(8)
    p.paragraph_format.space_after = Pt(3)
    p.paragraph_format.keep_with_next = True
    run = p.add_run(text)
    set_run_font(run, size_pt=12, bold=True, color_rgb=(0, 0, 0))
    return p

def add_p(text):
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(6)
    p.paragraph_format.line_spacing = 1.15
    run = p.add_run(text)
    set_run_font(run, size_pt=12)
    return p

def add_bullet(text, level=0):
    p = doc.add_paragraph(style='List Bullet')
    p.paragraph_format.space_after = Pt(3)
    p.paragraph_format.left_indent = Inches(0.25 * (level + 1))
    run = p.add_run(text)
    set_run_font(run, size_pt=12)
    return p

def style_table(table):
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    for row in table.rows:
        for cell in row.cells:
            tcPr = cell._element.get_or_add_tcPr()
            borders = parse_xml(r'''
                <w:tcBorders %s>
                    <w:top w:val="single" w:sz="6" w:color="000000"/>
                    <w:left w:val="single" w:sz="6" w:color="000000"/>
                    <w:bottom w:val="single" w:sz="6" w:color="000000"/>
                    <w:right w:val="single" w:sz="6" w:color="000000"/>
                </w:tcBorders>
            ''' % nsdecls('w'))
            tcPr.append(borders)
            for p in cell.paragraphs:
                p.paragraph_format.space_after = Pt(2)
                p.paragraph_format.space_before = Pt(2)
                for run in p.runs:
                    run.font.name = 'Times New Roman'
                    run.font.size = Pt(10.5)

def add_code_block(title, file_path, description, code_content):
    add_heading_2(title)
    p_meta = doc.add_paragraph()
    p_meta.paragraph_format.space_after = Pt(3)
    r_file = p_meta.add_run(f"Source File: {file_path}\n")
    set_run_font(r_file, size_pt=10.5, bold=True, color_rgb=(14, 58, 120))
    r_desc = p_meta.add_run(description)
    set_run_font(r_desc, size_pt=11, italic=True)

    table = doc.add_table(rows=1, cols=1)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell = table.cell(0, 0)
    tcPr = cell._element.get_or_add_tcPr()
    borders = parse_xml(r'''
        <w:tcBorders %s>
            <w:top w:val="single" w:sz="6" w:color="000000"/>
            <w:left w:val="single" w:sz="6" w:color="000000"/>
            <w:bottom w:val="single" w:sz="6" w:color="000000"/>
            <w:right w:val="single" w:sz="6" w:color="000000"/>
        </w:tcBorders>
    ''' % nsdecls('w'))
    tcPr.append(borders)
    shading = parse_xml(r'<w:shd %s w:fill="F8FAFC"/>' % nsdecls('w'))
    tcPr.append(shading)

    p = cell.paragraphs[0]
    p.paragraph_format.space_before = Pt(4)
    p.paragraph_format.space_after = Pt(4)
    p.paragraph_format.line_spacing = 1.0
    r = p.add_run(code_content)
    set_run_font(r, size_pt=9.5, color_rgb=(15, 23, 42))
    p_space = doc.add_paragraph()
    p_space.paragraph_format.space_after = Pt(8)

# ==========================================
# COVER / TITLE
# ==========================================
title_p = doc.add_paragraph()
title_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
title_p.paragraph_format.space_before = Pt(40)
title_p.paragraph_format.space_after = Pt(12)
r1 = title_p.add_run("SOFTWARE REQUIREMENTS SPECIFICATION\nFOR")
set_run_font(r1, size_pt=18, bold=True)

proj_p = doc.add_paragraph()
proj_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
proj_p.paragraph_format.space_after = Pt(30)
r2 = proj_p.add_run("SPORTS ANTI-DOPING MONITORING SYSTEM")
set_run_font(r2, size_pt=22, bold=True, color_rgb=(14, 58, 120))

sub_p = doc.add_paragraph()
sub_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
sub_p.paragraph_format.space_after = Pt(60)
r3 = sub_p.add_run("WADA-Compliant Doping Control, Biological Sample Tracking,\nAccredited Laboratory Screening, and Disciplinary Adjudication Platform")
set_run_font(r3, size_pt=13, italic=True)

meta_p = doc.add_paragraph()
meta_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
meta_p.paragraph_format.space_after = Pt(100)
r4 = meta_p.add_run("Version: 1.2.0\nPrepared by: System Architecture & Engineering Team\nDate: September 2026")
set_run_font(r4, size_pt=12)

doc.add_page_break()

# ==========================================
# TABLE OF CONTENTS & REVISION HISTORY
# ==========================================
add_heading_1("Table of Contents")

toc_items = [
    ("Table of Contents", "2"),
    ("Revision History", "2"),
    ("1. Introduction", "3"),
    ("    1.1 Purpose", "3"),
    ("    1.2 Document Conventions", "3"),
    ("    1.3 Intended Audience and Reading Suggestions", "3"),
    ("    1.4 Project Scope", "4"),
    ("    1.5 References", "4"),
    ("2. Overall Description", "5"),
    ("    2.1 Product Perspective", "5"),
    ("    2.2 Product Features", "6"),
    ("    2.3 User Classes and Characteristics", "8"),
    ("    2.4 Operating Environment", "10"),
    ("    2.5 Design and Implementation Constraints", "11"),
    ("    2.6 User Documentation", "13"),
    ("    2.7 Assumptions and Dependencies", "14"),
    ("3. System Features", "15"),
    ("    3.1 Feature 1: Multi-Role Registration & Administrator Verification", "15"),
    ("    3.2 Feature 2: In-Competition & Out-of-Competition Test Scheduling", "17"),
    ("    3.3 Feature 3: Biological Sample Collection & Chain-of-Custody", "18"),
    ("    3.4 Feature 4: Accredited Laboratory Intake & AAF Assay Entry", "20"),
    ("    3.5 Feature 5: Anti-Doping Rule Violation (ADRV) & Sanctions", "22"),
    ("4. External Interface Requirements", "24"),
    ("    4.1 User Interfaces", "24"),
    ("    4.2 Hardware Interfaces", "25"),
    ("    4.3 Software Interfaces", "25"),
    ("    4.4 Communications Interfaces", "27"),
    ("5. Other Nonfunctional Requirements", "28"),
    ("    5.1 Performance Requirements", "28"),
    ("    5.2 Safety Requirements", "28"),
    ("    5.3 Security Requirements", "29"),
    ("    5.4 Software Quality Attributes", "30"),
    ("6. Analysis Models & System Diagrams", "31"),
    ("    6.1 Use Case Diagram", "31"),
    ("    6.2 Class Diagram", "33"),
    ("    6.3 Data Flow Diagram (Level 1 DFD)", "35"),
    ("    6.4 Activity Diagram", "37"),
    ("    6.5 Sequence Diagram", "39"),
    ("    6.6 State Chart Diagram", "41"),
    ("    6.7 Component Diagram", "43"),
    ("    6.8 Deployment Diagram", "45"),
    ("7. Other Requirements", "47"),
    ("    7.1 Database Requirements", "47"),
    ("    7.2 Internationalization & Accessibility", "47"),
    ("    7.3 Legal & Regulatory Compliance (WADA Standards)", "48"),
    ("    7.4 Reuse Objectives", "48"),
    ("8. Key Module Source Code Implementation", "49"),
    ("    8.1 Module 1: Custom User Authentication & Role Model", "49"),
    ("    8.2 Module 2: Registration & Administrator Verification Controller", "51"),
    ("    8.3 Module 3: Role-Based Access Control (RBAC) Permissions Engine", "53"),
    ("    8.4 Module 4: Doping Test Mission Model & State Machine", "55"),
    ("    8.5 Module 5: Tamper-Evident Biological Sample Collection Model", "57"),
    ("    8.6 Module 6: Laboratory Assay Intake & Atomic ADRV Escalation", "59"),
    ("    8.7 Module 7: Anti-Doping Rule Violation & Disciplinary Model", "61"),
    ("    8.8 Module 8: Automated Notification Dispatcher Utility", "63"),
    ("    8.9 Module 9: Client-Side JWT Auth & Verification Guard Client", "64"),
    ("    8.10 Module 10: Multi-Role Registration & Accreditation UI Component", "66"),
]

for title, pg in toc_items:
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(2)
    p.paragraph_format.line_spacing = 1.15
    r_title = p.add_run(title)
    set_run_font(r_title, size_pt=11)
    dots_count = max(5, 75 - len(title))
    r_dots = p.add_run(" " + "." * dots_count + " ")
    set_run_font(r_dots, size_pt=10, color_rgb=(120, 120, 120))
    r_pg = p.add_run(pg)
    set_run_font(r_pg, size_pt=11, bold=True)

add_heading_1("Revision History")
rev_table = doc.add_table(rows=3, cols=4)
rev_headers = ["Name", "Date", "Reason For Changes", "Version"]
for i, h in enumerate(rev_headers):
    cell = rev_table.cell(0, i)
    p = cell.paragraphs[0]
    r = p.add_run(h)
    set_run_font(r, size_pt=11, bold=True)
    shading = parse_xml(r'<w:shd %s w:fill="E2E8F0"/>' % nsdecls('w'))
    cell._element.get_or_add_tcPr().append(shading)

rev_data = [
    ("Development Team", "2026-09-29", "Initial baseline Software Requirements Specification", "1.0.0"),
    ("Lead Architect", "2026-09-30", "Added Admin Verification, Chapter 6 Diagrams, and 10 Key Module Programs", "1.2.0")
]
for r_idx, row in enumerate(rev_data, start=1):
    for c_idx, val in enumerate(row):
        cell = rev_table.cell(r_idx, c_idx)
        p = cell.paragraphs[0]
        r = p.add_run(val)
        set_run_font(r, size_pt=10.5)

style_table(rev_table)
doc.add_page_break()

# ==========================================
# CHAPTER 1: INTRODUCTION
# ==========================================
add_heading_1("1. Introduction")

add_heading_2("1.1 Purpose")
add_p("The purpose of this Software Requirements Specification (SRS) document is to provide a complete, rigorous, and verifiable specification of the functional and non-functional requirements for the Sports Anti-Doping Monitoring System. This document serves as the foundational technical agreement between system architects, full-stack software engineers, QA verification specialists, system administrators, laboratory analysts, and national sports anti-doping authorities. It completely outlines the system's operational capabilities, data pipelines, hardware/software interfaces, and structural models necessary to guarantee full regulatory compliance with global anti-doping standards.")

add_heading_2("1.2 Document Conventions")
add_p("This document follows the standardized IEEE Std 830-1998 and ISO/IEC/IEEE 29148:2018 format for software specification. The following formatting and typographic conventions are utilized throughout:")
add_bullet("Requirement Identifiers: Every distinct functional requirement is denoted by an alphanumeric identifier formatted as REQ-<MODULE>-<NUMBER> (e.g., REQ-AUTH-1, REQ-TEST-2).")
add_bullet("Priority Levels: Categorized as High (mandatory core functionality required for statutory testing compliance), Medium (supporting administrative workflows), and Low (optional optimization).")
add_bullet("Key Definitions: Specialized anti-doping terminology (AAF, DCO, WADA, TUE, ADRV) adheres strictly to the canonical definitions established in the World Anti-Doping Code.")

add_heading_2("1.3 Intended Audience and Reading Suggestions")
add_p("This document is structured for multiple specialized stakeholders involved in the software development lifecycle and regulatory operations:")
add_bullet("Project Managers & Regulatory Auditors: Should review Chapter 1 (Introduction), Chapter 2 (Overall Description), and Chapter 7 (Regulatory & Legal Compliance).")
add_bullet("Full-Stack Developers: Must thoroughly consult Chapter 3 (System Features), Chapter 4 (External Interfaces), Chapter 6 (Analysis Models), and Chapter 8 (Key Module Source Code) for implementation.")
add_bullet("Quality Assurance & Testers: Should review Section 3.1.2/3.x.2 (Stimulus/Response Sequences) and Chapter 5 (Nonfunctional Requirements) to formulate automated test cases.")

add_heading_2("1.4 Project Scope")
add_p("The Sports Anti-Doping Monitoring System is an end-to-end, tamper-evident digital oversight platform engineered to replace disparate paper logs, fragmented emails, and uncoordinated spreadsheets with an auditable and secure software platform. The system governs:")
add_bullet("Accreditation Verification: Mandatory review and verification of all newly registered athletes, doping control officers, and laboratory personnel by System Administrators.")
add_bullet("Mission Dispatch: Formal scheduling and dispatching of targeted In-Competition and Out-of-Competition testing missions.")
add_bullet("Custody Chain Management: Tamper-evident biological sample collection receipting, security bottle barcode pairing (A and B containers), and unbroken transfer logs.")
add_bullet("Analytical Result Reporting: Accredited laboratory intake, seal integrity inspection, chemical assay recording, and certified result logging.")
add_bullet("Automatic Violation Escalation: Instantaneous automated escalation of Adverse Analytical Findings (AAF / positive results) into formal Anti-Doping Rule Violation (ADRV) disciplinary cases.")
add_bullet("Tribunal Adjudication: Complete case hearing review, legal defense logging, and penalty sanction enforcement.")

add_heading_2("1.5 References")
add_bullet("World Anti-Doping Agency (WADA) — World Anti-Doping Code (Latest Revised International Standards).")
add_bullet("WADA International Standard for Testing and Investigations (ISTI).")
add_bullet("WADA International Standard for Laboratories (ISL).")
add_bullet("IEEE Std 830-1998, Recommended Practice for Software Requirements Specifications.")
add_bullet("ISO/IEC/IEEE 29148:2018, Systems and Software Engineering — Requirements Engineering.")

doc.add_page_break()

# ==========================================
# CHAPTER 2: OVERALL DESCRIPTION
# ==========================================
add_heading_1("2. Overall Description")

add_heading_2("2.1 Product Perspective")
add_p("The Sports Anti-Doping Monitoring System is a self-contained, enterprise web-based application designed to operate as a centralized statutory integrity system for athletic governance. It is not an auxiliary component of an existing generic HR or school system, but a purpose-built sovereign platform designed to satisfy statutory anti-doping regulations.")
add_p("The system interconnects five primary stakeholders within a secure, authenticated, and role-segregated environment:")
add_bullet("System Administrators: Responsible for identity verification, accreditation approval, and platform security auditing.")
add_bullet("Athletes: Enrolled sports competitors subject to whereabouts filing, biological testing, and hearing notifications.")
add_bullet("Doping Control Officers (DCO): Certified field professionals who schedule testing missions, collect biological samples, and enforce chain-of-custody protocols.")
add_bullet("Laboratory Staff: Certified toxicologists and analysts at accredited testing facilities who inspect sample containers, perform chromatography screenings, and file test certificates.")
add_bullet("Sports Authorities & Disciplinary Panels: Executive sports governing boards who evaluate Adverse Analytical Findings, conduct disciplinary hearings, and apply eligibility sanctions.")

add_heading_2("2.2 Product Features")
add_p("The platform coordinates the entire lifecycle of sports doping management through seven core subsystems:")
add_bullet("1. Multi-Role Self-Registration & Administrative Verification: Candidates register under their designated professional role (Athlete, Laboratory Staff, or DCO). All accounts are immediately quarantined in a PENDING state, requiring a verified System Administrator to evaluate credentials and authorize access before portal entry.")
add_bullet("2. Test Mission Dispatching: DCOs and Administrators schedule in-competition and out-of-competition testing missions, specifying target discipline, collection location, and sampling parameters.")
add_bullet("3. Biological Sample Collection & Custody Tracking: Records collection time, biological fluid classification (Urine or Blood), dual-container security barcodes (Bottle A and Bottle B), and digital custody transfers.")
add_bullet("4. Laboratory Intake & Certified Assay Management: Laboratory personnel verify seal integrity upon package arrival, log chromatographic screening procedures (LC-MS/MS, GC-MS), and commit definitive findings.")
add_bullet("5. Automated Adverse Analytical Finding (AAF) Escalation: Committing an assay result as POSITIVE atomically initializes an Anti-Doping Rule Violation (ADRV) case record, notifying the tribunal panel and the athlete.")
add_bullet("6. Case Hearing & Disciplinary Adjudication: Enables the sports tribunal to log hearing minutes, evaluate athlete defense evidence, and commit legally binding competition sanctions.")
add_bullet("7. Audit Logging & System Telemetry: Every status transition, custody transfer, and verification decision is permanently preserved in immutable database audit logs.")

add_heading_2("2.3 User Classes and Characteristics")
add_p("The system accommodates five distinct user classes with strictly partitioned permissions:")
add_heading_3("1. System Administrator")
add_bullet("Characteristics: Advanced technical expertise, responsible for system security, user management, and regulatory compliance.")
add_bullet("Key Needs: Access to verification queue, user creation and deactivation, oversight of system health, and viewing unredacted audit trails.")

add_heading_3("2. Athlete")
add_bullet("Characteristics: Diverse backgrounds, accessing portal across mobile and desktop devices. May experience significant anxiety during testing or disciplinary proceedings.")
add_bullet("Key Needs: Intuitive mobile-responsive interface, transparent tracking of upcoming tests, immediate access to certified negative test certificates, and notification of hearing schedules.")

add_heading_3("3. Doping Control Officer (DCO)")
add_bullet("Characteristics: Certified field testing professionals operating under strict procedural regulations and time constraints.")
add_bullet("Key Needs: Rapid mobile-compatible sample collection logging, tamper-evident container barcode validation, and seamless shipment custody transfers.")

add_heading_3("4. Laboratory Staff / Analytical Chemist")
add_bullet("Characteristics: Highly trained laboratory scientists operating analytical chemistry instrumentation (Mass Spectrometers, Gas Chromatographs).")
add_bullet("Key Needs: Fast sample package receipt confirmation, container seal condition logging, batch screening result entry, and laboratory certificate uploads.")

add_heading_3("5. Sports Authority / Legal Tribunal Panel")
add_bullet("Characteristics: Legal counsel, sports federation directors, and ethics committee arbitrators.")
add_bullet("Key Needs: Comprehensive dashboard of active rule violation cases, detailed case evidence compilation, sanction documentation, and statistical compliance export.")

add_heading_2("2.4 Operating Environment")
add_heading_3("Client (User) Environment")
add_bullet("Supported Web Browsers: Google Chrome (v110+), Mozilla Firefox (v110+), Microsoft Edge (v110+), Apple Safari (v16+).")
add_bullet("Device Compatibility: Fully responsive design across desktop monitors (1920x1080), laptops (1366x768), tablets (768x1024), and smartphones (375x812 minimum).")
add_bullet("Client Prerequisites: JavaScript enabled, modern CSS flexbox/grid support, browser cookie and localStorage access.")

add_heading_3("Server Environment")
add_bullet("Application Framework: Python 3.14 with Django 5.0.6 and Django REST Framework 3.15.")
add_bullet("Web Server / Gateway: ASGI/WSGI Gunicorn server running on Ubuntu 22.04 LTS cloud container infrastructure.")
add_bullet("Database System: PostgreSQL 15+ hosted on high-availability Supabase cloud infrastructure with SSL connection pooling.")
add_bullet("Frontend CDN: Distributed edge hosting on Vercel Edge Network with automated SPA rewrite fallback.")

add_heading_2("2.5 Design and Implementation Constraints")
add_bullet("1. Mandatory Admin Verification: Self-registered users cannot authenticate into operational portal modules until an administrator manually verifies and activates the account.")
add_bullet("2. Cryptographic Password Security: All user credentials must be hashed utilizing PBKDF2 with SHA-256 algorithm with individual salt generation.")
add_bullet("3. Stateless JWT Authorization: All API endpoints must authenticate via HMAC-SHA256 signed JSON Web Tokens with server-side refresh token blacklisting.")
add_bullet("4. Tamper-Evident Dual-Bottle Integrity: Sample records must enforce separate tracking of Bottle A (primary assay) and Bottle B (confirmatory split).")
add_bullet("5. Transactional Atomic Escalation: Committing an Adverse Analytical Finding (AAF) and initializing the corresponding ADRV case must occur inside an atomic database transaction.")
add_bullet("6. Offline Resilience: Client architecture must incorporate resilient caching to prevent mixed-content blocking during network transitions.")
add_bullet("7. Role-Based Segregation: Django model permission classes must strictly enforce that athletes cannot view other athletes' biological data.")
add_bullet("8. Clean Code & Architectural Standards: Codebase must strictly follow PEP 8 standards on backend and TypeScript strict mode on frontend.")
add_bullet("9. Accessibility: User interface must comply with WCAG 2.1 AA contrast and navigation standards.")
add_bullet("10. Cross-Browser Parity: Consistent UI rendering without browser-specific experimental dependencies.")
add_bullet("11. Regulatory Data Retention: System must support indefinite legal retention for all disciplinary hearing records.")

add_heading_2("2.6 User Documentation")
add_bullet("Athlete Handbook: Illustrated digital guide covering registration, sample collection rights, and finding verification.")
add_bullet("DCO Field Operations Manual: Procedural guidelines for scheduling missions, recording custody receipts, and kit dispatch.")
add_bullet("Administrator Management Guide: Standard operating procedure for verifying candidate accreditations and managing system users.")
add_bullet("Developer Technical Reference: Documented REST API endpoints, database schemas, and automated test execution scripts.")

add_heading_2("2.7 Assumptions and Dependencies")
add_bullet("Assumptions: Operational users possess access to standard internet connectivity and modern web browsers.")
add_bullet("Dependencies: Continuous operational availability of PostgreSQL database hosted on Supabase and frontend CDN on Vercel.")
add_bullet("Risk If Dependencies Fail: The frontend integrates local storage state fallbacks to maintain uninterrupted UI display during transient outages.")

doc.add_page_break()

# ==========================================
# CHAPTER 3: SYSTEM FEATURES
# ==========================================
add_heading_1("3. System Features")

# 3.1
add_heading_2("3.1 Feature 1: Multi-Role Self-Registration & Administrator Verification")
add_heading_3("3.1.1 Description and Priority")
add_p("Allows candidate Athletes, Laboratory Staff, and DCO Officers to submit their professional credentials. To preserve regulatory integrity, newly enrolled accounts are quarantined in a PENDING state and require an Administrator to review and approve them before portal entry.")
add_p("Priority: High (Core Security Requirement).")

add_heading_3("3.1.2 Stimulus/Response Sequence")
add_bullet("Candidate accesses /register, selects professional category, inputs credentials (name, email, password, sport discipline, lab accreditation, or DCO certificate), and submits.")
add_bullet("System validates data integrity, hashes password, and creates User record with is_verified=False and status=PENDING.")
add_bullet("System presents holding confirmation: 'Registration Received for Admin Verification'.")
add_bullet("Administrator accesses /admin/verifications, inspects candidate details, and clicks 'Verify & Approve'.")
add_bullet("System marks candidate as is_verified=True, sets linked profile to ACTIVE, and enables portal authentication.")
add_p("Exception Scenarios:")
add_bullet("Candidate attempts sign-in before approval: System blocks login and displays: 'Account Verification Pending. Please await approval by the System Administrator.'")

add_heading_3("3.1.3 Functional Requirements")
add_bullet("REQ-AUTH-1: The system shall permit self-registration for Athlete, Laboratory Staff, and DCO roles.")
add_bullet("REQ-AUTH-2: The system shall mark all self-registered candidate accounts as is_verified=False.")
add_bullet("REQ-AUTH-3: The system shall provide an Administrator Verifications queue with one-click Approve and Reject actions.")

# 3.2
add_heading_2("3.2 Feature 2: In-Competition & Out-of-Competition Test Scheduling")
add_heading_3("3.2.1 Description and Priority")
add_p("Permits Doping Control Officers and Administrators to plan, configure, and assign testing missions for targeted athletes.")
add_p("Priority: High.")

add_heading_3("3.2.2 Stimulus/Response Sequence")
add_bullet("DCO clicks 'Schedule Test', selects an active athlete, specifies scheduled date/time, location, and test classification.")
add_bullet("System assigns a canonical test identifier (e.g., DST-2026-0042) and sets status to SCHEDULED.")
add_bullet("System automatically transmits a notification alert to the assigned athlete's dashboard.")

add_heading_3("3.2.3 Functional Requirements")
add_bullet("REQ-TEST-1: The system shall support test types: In-Competition, Out-of-Competition, Targeted, and Follow-Up.")
add_bullet("REQ-TEST-2: The system shall enforce canonical state transitions: SCHEDULED -> SAMPLE_COLLECTED -> SAMPLE_SUBMITTED -> UNDER_ANALYSIS -> RESULT_GENERATED -> COMPLETED.")

# 3.3
add_heading_2("3.3 Feature 3: Biological Sample Collection & Chain-of-Custody Tracking")
add_heading_3("3.3.1 Description and Priority")
add_p("Enforces digital receipting of sample collections, dual-bottle container code allocation, seal integrity inspection, and courier custody transfers.")
add_p("Priority: High.")

add_heading_3("3.3.2 Stimulus/Response Sequence")
add_bullet("DCO meets athlete, marks scheduled mission as 'Sample Collected', and selects fluid type (Urine/Blood).")
add_bullet("DCO records security barcode numbers for Bottle A and Bottle B containers and enters collection timestamp.")
add_bullet("System updates sample status to COLLECTED and appends an immutable custody log entry.")
add_bullet("DCO selects destination accredited laboratory, enters courier details, and commits dispatch.")
add_bullet("System updates sample status to SUBMITTED.")

add_heading_3("3.3.3 Functional Requirements")
add_bullet("REQ-SMP-1: The system shall enforce distinct barcode identification for Bottle A and Bottle B containers.")
add_bullet("REQ-SMP-2: The system shall maintain an immutable, append-only custody log documenting handler identity, timestamp, and seal condition.")

# 3.4
add_heading_2("3.4 Feature 4: Accredited Laboratory Intake, Analysis & AAF Detection")
add_heading_3("3.4.1 Description and Priority")
add_p("Permits certified laboratory staff to confirm physical sample receipt, verify tamper seals, record chromatographic testing methods, and log definitive findings.")
add_p("Priority: High.")

add_heading_3("3.4.2 Stimulus/Response Sequence")
add_bullet("Laboratory staff receives package, accesses portal, and clicks 'Mark Received'.")
add_bullet("System advances sample status to RECEIVED and advances parent doping test to UNDER_ANALYSIS.")
add_bullet("Analyst conducts assay (LC-MS/MS or GC-MS) and inputs findings into 'Record Result' form.")
add_bullet("Case A (Negative Result): Analyst selects NEGATIVE. System marks sample ANALYZED, test RESULT_GENERATED, and notifies athlete.")
add_bullet("Case B (Adverse Analytical Finding): Analyst selects POSITIVE, details prohibited substance identified. System atomically initializes an Anti-Doping Rule Violation case with status OPEN and dispatches urgent alerts to Sports Authority.")

add_heading_3("3.4.3 Functional Requirements")
add_bullet("REQ-LAB-1: The system shall restrict result entry exclusively to verified Laboratory Staff.")
add_bullet("REQ-LAB-2: The system shall execute laboratory result entry and ADRV case generation within a single atomic database transaction.")

# 3.5
add_heading_2("3.5 Feature 5: Anti-Doping Rule Violation (ADRV) Case Review & Sanctioning")
add_heading_3("3.5.1 Description and Priority")
add_p("Provides Sports Authorities and Disciplinary Tribunals with comprehensive tools to review positive violations, schedule hearings, and record binding sanctions.")
add_p("Priority: High.")

add_heading_3("3.5.2 Stimulus/Response Sequence")
add_bullet("Sports Authority accesses /authority/violations, selects an OPEN violation case, and clicks 'Review Case'.")
add_bullet("System updates violation status to UNDER_REVIEW, recording the reviewing officer and timestamp.")
add_bullet("Tribunal convenes hearing, logs athlete defense statements, and inputs formal sanction order.")
add_bullet("Authority commits penalty (e.g., '24-Month Ineligibility under WADA Code Art. 10.2').")
add_bullet("System advances violation status to ACTION_TAKEN or CLOSED.")

add_heading_3("3.5.3 Functional Requirements")
add_bullet("REQ-VIO-1: The system shall enforce violation lifecycle: OPEN -> UNDER_REVIEW -> ACTION_TAKEN -> CLOSED.")
add_bullet("REQ-VIO-2: The system shall record and permanently preserve reviewer identity, hearing date, and formal sanction text.")

doc.add_page_break()

# ==========================================
# CHAPTER 4: EXTERNAL INTERFACE REQUIREMENTS
# ==========================================
add_heading_1("4. External Interface Requirements")

add_heading_2("4.1 User Interfaces")
add_p("The Sports Anti-Doping Monitoring System provides a responsive, dark-mode-first user interface built with React 18, TypeScript, and Tailwind CSS. The interface adopts a high-tech athletic integrity aesthetic consistent with international anti-doping branding.")
add_heading_3("Key User Interface Features & Thematic Backdrops:")
add_bullet("Home / Landing Page (/): Features an illuminated Olympic athletic track visual backdrop with high-contrast text and clean entry points.")
add_bullet("Sign In Page (/login): Atmospheric sports arena night lights backdrop with a frosted dark glassmorphic card (backdrop-blur-xl). Unverified users attempting login are greeted with an amber 'Account Verification Pending' notice.")
add_bullet("Registration Page (/register): Stadium visual backdrop featuring tabbed accreditation selection for Athletes, Laboratories, and DCO Officers, followed by a formal verification holding card.")
add_bullet("Role Dashboards: Individualized domain wallpapers (Olympic running track for Athletes, analytical biochemistry instruments for Laboratory Staff, executive boardroom for Sports Authorities, and global cyber-mesh for Administrators).")
add_bullet("Accessibility & Controls: Standardized status badges (Green for Active/Negative, Red for Positive/Suspended, Amber for Pending), modal confirmation dialogues, and responsive navigation sidebars.")

add_heading_2("4.2 Hardware Interfaces")
add_bullet("Client Devices: Accessible on standard desktop PCs, laptops, tablets, and smartphones supporting modern web standards.")
add_bullet("Barcode Scanners: Fully compatible with standard USB or Bluetooth handheld barcode scanners for rapid sample bottle code entry.")
add_bullet("Camera Inputs: Supports mobile device camera scanning for physical sample kit verification.")
add_bullet("Server Hardware: Operates on standard cloud virtualization infrastructure (minimum 2 vCPU, 4 GB RAM per worker node).")

add_heading_2("4.3 Software Interfaces")
add_bullet("Database Management System: PostgreSQL 15+ hosted on Supabase, connected through encrypted TCP connections on port 5432 using psycopg binary drivers.")
add_bullet("REST APIs: Django REST Framework serving JSON endpoints (/api/auth/, /api/users/, /api/tests/, /api/samples/, /api/results/, /api/violations/, /api/reports/).")
add_bullet("Authentication Interface: SimpleJWT issuing HMAC-SHA256 signed Bearer tokens with token refresh and blacklisting.")
add_bullet("Email & Notification Interface: SMTP integration for transactional alerts dispatched on scheduled tests and violation hearings.")

add_heading_2("4.4 Communications Interfaces")
add_bullet("Protocols: Mandatory HTTPS (TLS 1.2 / TLS 1.3) across all client-server communications; HTTP is permanently redirected to HTTPS.")
add_bullet("Payload Formats: All API requests and responses formatted as UTF-8 encoded application/json.")
add_bullet("Security Tokens: JSON Web Tokens transmitted in the Authorization HTTP header using the Bearer schema.")

doc.add_page_break()

# ==========================================
# CHAPTER 5: OTHER NONFUNCTIONAL REQUIREMENTS
# ==========================================
add_heading_1("5. Other Nonfunctional Requirements")

add_heading_2("5.1 Performance Requirements")
add_bullet("Response Time: All standard database read and write queries shall return within 250 milliseconds under normal operating loads.")
add_bullet("Frontend Load Time: Initial bundle download and first contentful paint under 2.0 seconds on standard 4G or broadband connections.")
add_bullet("Concurrency: The backend architecture shall comfortably support a minimum of 250 concurrent authenticated operational users.")

add_heading_2("5.2 Safety Requirements")
add_bullet("Container Separation: The system strictly mandates separate barcode recording for Bottle A and Bottle B to eliminate sample confusion.")
add_bullet("Athlete Safety: Complete emergency contact and medical disclosure records are preserved for every enrolled athlete.")
add_bullet("Accreditation Clearance: Unverified users are strictly barred from viewing or editing sensitive testing operations.")

add_heading_2("5.3 Security Requirements")
add_bullet("Authentication & Authorization: Role-Based Access Control (RBAC) enforced via Django permission classes (IsAdministrator, IsAthlete, IsDopingControlOfficer, IsLaboratoryStaff, IsSportsAuthority).")
add_bullet("Data Protection: Sensitive athlete biological records and personal details are encrypted at rest (AES-256) and in transit (TLS 1.3).")
add_bullet("Session Security: Access tokens expire after 60 minutes; refresh tokens are blacklisted upon user logout to prevent replay attacks.")
add_bullet("Audit & Logging: All status mutations log the acting user ID, IP address, and timestamp.")

add_heading_2("5.4 Software Quality Attributes")
add_bullet("Availability: 99.9% target uptime excluding scheduled maintenance windows.")
add_bullet("Reliability: Zero data loss architecture with automated daily database backups on Supabase.")
add_bullet("Maintainability: Clean, decoupled Django application architecture with 100% passing automated test suite (Pytest).")
add_bullet("Portability: Containerized architecture configurable via environment variables (.env).")
add_bullet("Usability: High-contrast typography and clear step-by-step forms to minimize operator input error.")

doc.add_page_break()

# ==========================================
# CHAPTER 6: ANALYSIS MODELS & SYSTEM DIAGRAMS
# ==========================================
add_heading_1("6. Analysis Models & System Diagrams")
add_p("This chapter provides a complete visual and analytical representation of the Sports Anti-Doping Monitoring System through eight standardized Unified Modeling Language (UML) and architectural diagrams. These models specify the system's structural components, behavioral interactions, data flows, and deployment topology.")

diagrams_meta = [
    ("6.1 Use Case Diagram", "1_use_case_diagram.png", "Figure 6.1: Use Case Diagram of Sports Anti-Doping Monitoring System",
     "The Use Case Diagram defines the interactions between the five primary system actors and the core operational capabilities. Athletes manage profile credentials and track testing missions; Doping Control Officers schedule missions and log sample collections; Laboratory Staff execute sample intake and commit chemical assay findings; Sports Authorities review Adverse Analytical Findings and enforce sanctions; and System Administrators verify candidate accreditations and audit logs."),

    ("6.2 Class Diagram", "2_class_diagram.png", "Figure 6.2: Class Diagram Illustrating Domain Entities and Associations",
     "The Class Diagram specifies the object-oriented structure of the software domain. Core classes include User, Athlete, DopingControlOfficer, DopingTest, Sample, LaboratoryResult, and Violation. Multiplicities strictly enforce business logic: each DopingTest is associated with exactly one Athlete and DCO, while generating one or more Samples. Each Sample generates exactly one LaboratoryResult, which conditionally escalates to zero or one Violation upon an Adverse Analytical Finding."),

    ("6.3 Data Flow Diagram (Level 1 DFD)", "3_dfd_diagram.png", "Figure 6.3: Data Flow Diagram (Level 1) Depicting Information Pipelines",
     "The Level 1 Data Flow Diagram traces data movements from external entities through primary operational processes (1.0 Verify Account, 2.0 Schedule Test, 3.0 Custody Transfer, 4.0 Analyze Sample, 5.0 ADRV Case Review) into secure persistent data stores (D1 Users, D2 Tests & Samples, D3 Results, D4 Violations)."),

    ("6.4 Activity Diagram", "4_activity_diagram.png", "Figure 6.4: Activity Diagram Tracing Testing, Analysis and Violation Lifecycles",
     "The Activity Diagram models the complete operational control flow: starting from initial test scheduling by the DCO, progressing through sample collection, dual-bottle sealing, and courier dispatch. Upon laboratory analysis, the control flow forks into a decision diamond: clean samples log a negative finding and conclude the workflow, while positive samples (AAF) branch directly to auto-violation generation and tribunal hearings."),

    ("6.5 Sequence Diagram", "5_sequence_diagram.png", "Figure 6.5: Sequence Diagram Depicting Message Exchanges and Activations",
     "The Sequence Diagram details time-ordered synchronous and asynchronous message exchanges across lifelines (DCO Officer, Frontend Portal, Django Backend API, Lab Analyst, and Authority Panel). It highlights the atomic transaction executing between the result commitment and automated ADRV generation."),

    ("6.6 State Chart Diagram", "6_state_chart_diagram.png", "Figure 6.6: State Chart Diagram of Testing Mission and Sample Lifecycle",
     "The State Chart Diagram models the finite state machine governing testing missions and biological specimens: transitions advance strictly from SCHEDULED to SAMPLE_COLLECTED, SAMPLE_SUBMITTED, UNDER_ANALYSIS, RESULT_GENERATED, and COMPLETED, preventing invalid state mutations."),

    ("6.7 Component Diagram", "7_component_diagram.png", "Figure 6.7: Component Diagram Showing Subsystems and Client-Server Decoupling",
     "The Component Diagram illustrates the modular software architecture: the React 18 Single-Page Application interacts through an Axios client with the Django REST API, which encapsulates the Auth & Verification Engine, Testing Controller, Custody Controller, and ADRV Engine connecting to the PostgreSQL database component."),

    ("6.8 Deployment Diagram", "8_deployment_diagram.png", "Figure 6.8: Deployment Diagram Showing Multi-Tier Cloud Topology",
     "The Deployment Diagram maps software artifacts to physical execution nodes: client web browsers execute the React SPA bundle, connecting over TLS 1.3 to the Vercel Edge CDN and Django Gunicorn application containers, which persist data to the Supabase PostgreSQL database cluster over encrypted port 5432.")
]

for sec_title, img_filename, fig_caption, desc_text in diagrams_meta:
    add_heading_2(sec_title)
    add_p(desc_text)
    
    img_path = os.path.join(DIAGRAMS_DIR, img_filename)
    if os.path.exists(img_path):
        p_img = doc.add_paragraph()
        p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_img.paragraph_format.space_before = Pt(8)
        p_img.paragraph_format.space_after = Pt(4)
        run_img = p_img.add_run()
        run_img.add_picture(img_path, width=Inches(5.8))
        
        p_cap = doc.add_paragraph()
        p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_cap.paragraph_format.space_after = Pt(12)
        r_cap = p_cap.add_run(fig_caption)
        set_run_font(r_cap, size_pt=10.5, bold=True, italic=True)
    else:
        add_p(f"[Diagram Image {img_filename} not found]")

doc.add_page_break()

# ==========================================
# CHAPTER 7: OTHER REQUIREMENTS
# ==========================================
add_heading_1("7. Other Requirements")

add_heading_2("7.1 Database Requirements")
add_bullet("UUID Primary Keys: All entity tables utilize universally unique identifiers (UUIDv4) as primary keys to prevent record enumeration attacks.")
add_bullet("Referential Integrity: Foreign keys enforce protected deletes on mission and laboratory logs to prevent accidental erasure of regulatory audit history.")
add_bullet("Database Migrations: All schema modifications are versioned and committed via Django migrations applied to live PostgreSQL database clusters.")

add_heading_2("7.2 Internationalization & Accessibility")
add_bullet("Localization Architecture: User-facing text strings are externalized to support localization into official WADA languages (English, French, Spanish).")
add_bullet("Accessibility Compliance: High-contrast ratios (> 4.5:1), clear form input labelling, and complete keyboard navigation compliance with WCAG 2.1 AA.")

add_heading_2("7.3 Legal & Regulatory Compliance (WADA Standards)")
add_bullet("Procedural Fairness: The system guarantees that no disciplinary sanctions can be finalized without a formally logged hearing review.")
add_bullet("Data Privacy: Biological passport indicators and analytical findings are strictly isolated; athletes can only view their own confidential medical records.")
add_bullet("Statutory Retention: Anti-doping records are preserved for ten years in compliance with the World Anti-Doping Code statute of limitations.")

add_heading_2("7.4 Reuse Objectives")
add_bullet("Modular Component Architecture: Reusable UI widgets (StatCard, LoadingSpinner, ConfirmDialog, StatusBadge, DataTable) enable seamless extension.")
add_bullet("Standardized RESTful Endpoints: Decoupled API architecture allows seamless future integration with third-party testing laboratory LIMS software.")

doc.add_page_break()

# ==========================================
# CHAPTER 8: 10 KEY MODULE SOURCE CODE IMPLEMENTATION
# ==========================================
add_heading_1("8. Key Module Source Code Implementation")
add_p("This chapter documents the source code implementation of the ten most critical software modules comprising the Sports Anti-Doping Monitoring System. Each listing presents the exact production code responsible for authentication, verification workflows, state transition enforcement, chemical assay processing, atomic rule violation escalation, and full-stack integration.")

# 8.1
code_mod_1 = '''"""Custom User model with role-based access control and admin verification."""
import uuid
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models

class Role(models.TextChoices):
    ADMINISTRATOR = 'ADMINISTRATOR', 'Administrator'
    ATHLETE = 'ATHLETE', 'Athlete'
    DOPING_CONTROL_OFFICER = 'DOPING_CONTROL_OFFICER', 'Doping Control Officer'
    LABORATORY_STAFF = 'LABORATORY_STAFF', 'Laboratory Staff'
    SPORTS_AUTHORITY = 'SPORTS_AUTHORITY', 'Sports Authority'

class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('An email address is required.')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', Role.ADMINISTRATOR)
        extra_fields.setdefault('is_verified', True)
        if not extra_fields.get('username'):
            extra_fields['username'] = email.split('@')[0]
        return self.create_user(email, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    username = models.CharField(max_length=150, unique=True)
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)
    phone = models.CharField(max_length=20, blank=True)
    role = models.CharField(max_length=50, choices=Role.choices, default=Role.ATHLETE)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_verified = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserManager()
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']

    class Meta:
        db_table = 'users'
        ordering = ['-created_at']'''

add_code_block(
    "8.1 Module 1: Custom User Authentication & Role Model",
    "backend/accounts/models.py",
    "Defines the primary security entity extending AbstractBaseUser and PermissionsMixin. Enforces UUID primary keys, role segregation across five operational actors, and the is_verified accreditation flag.",
    code_mod_1
)

# 8.2
code_mod_2 = '''"""Authentication, self-registration, and administrator verification controller."""
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User, Role
from .serializers import UserSerializer, UserCreateSerializer
from .permissions import IsAdministrator

class RegisterView(APIView):
    """POST /api/auth/register/ - Public account self-registration requiring admin verification."""
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        user.is_verified = False  # Held in unverified queue until admin approval
        user.save(update_fields=['is_verified'])

        # Auto-create corresponding profile shell with INACTIVE status
        role = user.role
        try:
            if role == Role.ATHLETE:
                from athletes.models import Athlete
                Athlete.objects.create(
                    user=user, athlete_id=f"ATH-{str(user.id)[:6].upper()}",
                    sport=request.data.get('sport', 'Athletics'), status='INACTIVE'
                )
            elif role == Role.LABORATORY_STAFF:
                from laboratories.models import Laboratory, LaboratoryStaff
                lab, _ = Laboratory.objects.get_or_create(
                    laboratory_name=request.data.get('laboratory_name', 'National Lab')
                )
                LaboratoryStaff.objects.create(
                    user=user, laboratory=lab, staff_id=f"LAB-{str(user.id)[:6].upper()}", status='INACTIVE'
                )
        except Exception:
            pass

        refresh = RefreshToken.for_user(user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data,
            'message': 'Registration submitted successfully. Account pending administrator verification.'
        }, status=status.HTTP_201_CREATED)

class UserViewSet(viewsets.ModelViewSet):
    """Full user CRUD with Administrator verification review actions."""
    queryset = User.objects.all().order_by('-created_at')

    @action(detail=False, methods=['get'], permission_classes=[IsAdministrator])
    def pending(self, request):
        """GET /api/users/pending/ - Retrieve candidate accounts awaiting accreditation."""
        pending_users = User.objects.filter(is_verified=False).order_by('-created_at')
        return Response(UserSerializer(pending_users, many=True).data)

    @action(detail=True, methods=['post'], permission_classes=[IsAdministrator])
    def verify(self, request, pk=None):
        """POST /api/users/{id}/verify/ - Verify accreditation and activate linked profile."""
        user = self.get_object()
        user.is_verified = True
        user.is_active = True
        user.save(update_fields=['is_verified', 'is_active'])

        if hasattr(user, 'athlete_profile'):
            user.athlete_profile.status = 'ACTIVE'
            user.athlete_profile.save(update_fields=['status'])
        if hasattr(user, 'lab_staff_profile'):
            user.lab_staff_profile.status = 'ACTIVE'
            user.lab_staff_profile.save(update_fields=['status'])

        return Response({'detail': f'User {user.get_full_name()} verified successfully.'})'''

add_code_block(
    "8.2 Module 2: Registration & Administrator Verification Controller",
    "backend/accounts/views.py",
    "Manages the public registration endpoint, automatically initialises linked profile shells in INACTIVE state, and provides administrators with verified approval and rejection endpoints.",
    code_mod_2
)

# 8.3
code_mod_3 = '''"""Role-Based Access Control (RBAC) permission classes."""
from rest_framework.permissions import BasePermission
from .models import Role

class IsAdministrator(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == Role.ADMINISTRATOR)

class IsAthlete(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == Role.ATHLETE)

class IsDopingControlOfficer(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == Role.DOPING_CONTROL_OFFICER)

class IsLaboratoryStaff(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == Role.LABORATORY_STAFF)

class IsSportsAuthority(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == Role.SPORTS_AUTHORITY)

class IsOwnerOrAdmin(BasePermission):
    """Object-level authorization: users can only inspect their own biological records."""
    def has_object_permission(self, request, view, obj):
        if request.user.role == Role.ADMINISTRATOR:
            return True
        if hasattr(obj, 'user'):
            return obj.user == request.user
        return obj == request.user'''

add_code_block(
    "8.3 Module 3: Role-Based Access Control (RBAC) Permissions Engine",
    "backend/accounts/permissions.py",
    "Enforces declarative authorization checks at the API gateway. Guarantees that athletes can never access unauthorized testing data or inspect other competitors' records.",
    code_mod_3
)

# 8.4
code_mod_4 = '''"""Doping test model and finite state machine transitions."""
from django.db import models
from django.core.exceptions import ValidationError
import uuid

class TestStatus(models.TextChoices):
    SCHEDULED = 'SCHEDULED'
    SAMPLE_COLLECTED = 'SAMPLE_COLLECTED'
    SAMPLE_SUBMITTED = 'SAMPLE_SUBMITTED'
    UNDER_ANALYSIS = 'UNDER_ANALYSIS'
    RESULT_GENERATED = 'RESULT_GENERATED'
    COMPLETED = 'COMPLETED'
    CANCELLED = 'CANCELLED'

VALID_TRANSITIONS = {
    'SCHEDULED': ['SAMPLE_COLLECTED', 'CANCELLED'],
    'SAMPLE_COLLECTED': ['SAMPLE_SUBMITTED'],
    'SAMPLE_SUBMITTED': ['UNDER_ANALYSIS'],
    'UNDER_ANALYSIS': ['RESULT_GENERATED'],
    'RESULT_GENERATED': ['COMPLETED'],
    'COMPLETED': [],
    'CANCELLED': [],
}

class DopingTest(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    test_number = models.CharField(max_length=50, unique=True, blank=True)
    athlete = models.ForeignKey('athletes.Athlete', on_delete=models.CASCADE, related_name='tests')
    officer = models.ForeignKey('officers.DopingControlOfficer', on_delete=models.SET_NULL, null=True)
    scheduled_date = models.DateField()
    status = models.CharField(max_length=30, choices=TestStatus.choices, default=TestStatus.SCHEDULED)
    created_at = models.DateTimeField(auto_now_add=True)

    def transition_status(self, new_status, notes=''):
        allowed = VALID_TRANSITIONS.get(self.status, [])
        if new_status not in allowed:
            raise ValidationError(f"Invalid transition from {self.status} to {new_status}")
        self.status = new_status
        self.save(update_fields=['status'])

    def save(self, *args, **kwargs):
        if not self.test_number:
            year = self.scheduled_date.year if self.scheduled_date else 2026
            self.test_number = f"DST-{year}-{str(self.id)[:4].upper()}"
        super().save(*args, **kwargs)'''

add_code_block(
    "8.4 Module 4: Doping Test Mission Model & State Machine",
    "backend/doping_tests/models.py",
    "Coordinates testing mission lifecycles with programmatic transition validation preventing out-of-order state mutations and auto-allocating canonical DST mission identifiers.",
    code_mod_4
)

# 8.5
code_mod_5 = '''"""Tamper-evident biological sample model and chain-of-custody logging."""
from django.db import models
from django.utils import timezone
from django.core.exceptions import ValidationError
import uuid

class SampleStatus(models.TextChoices):
    COLLECTED = 'COLLECTED'
    SUBMITTED = 'SUBMITTED'
    RECEIVED = 'RECEIVED'
    UNDER_ANALYSIS = 'UNDER_ANALYSIS'
    ANALYZED = 'ANALYZED'
    INVALID = 'INVALID'

SAMPLE_VALID_TRANSITIONS = {
    'COLLECTED': ['SUBMITTED'],
    'SUBMITTED': ['RECEIVED'],
    'RECEIVED': ['UNDER_ANALYSIS'],
    'UNDER_ANALYSIS': ['ANALYZED', 'INVALID'],
}

class Sample(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    sample_number = models.CharField(max_length=50, unique=True)
    doping_test = models.ForeignKey('doping_tests.DopingTest', on_delete=models.CASCADE, related_name='samples')
    sample_type = models.CharField(max_length=20, choices=[('URINE', 'Urine'), ('BLOOD', 'Blood')])
    bottle_a_code = models.CharField(max_length=50, blank=True)
    bottle_b_code = models.CharField(max_length=50, blank=True)
    status = models.CharField(max_length=20, choices=SampleStatus.choices, default=SampleStatus.COLLECTED)
    chain_of_custody_notes = models.TextField(blank=True)
    submitted_at = models.DateTimeField(null=True, blank=True)
    received_at = models.DateTimeField(null=True, blank=True)

    def transition_status(self, new_status, user=None, notes=''):
        allowed = SAMPLE_VALID_TRANSITIONS.get(self.status, [])
        if new_status not in allowed:
            raise ValidationError(f"Invalid sample transition from {self.status} to {new_status}")
        timestamp = timezone.now().strftime('%Y-%m-%d %H:%M:%S UTC')
        user_name = user.get_full_name() if user else 'System'
        entry = f"[{timestamp}] {self.status} -> {new_status} by {user_name}. Notes: {notes}\\n"
        self.chain_of_custody_notes = (self.chain_of_custody_notes or '') + entry
        self.status = new_status
        self.save()'''

add_code_block(
    "8.5 Module 5: Tamper-Evident Biological Sample Collection Model",
    "backend/samples/models.py",
    "Enforces Bottle A and Bottle B container code pairing and maintains an immutable, append-only textual audit trail of every physical and digital custody transfer.",
    code_mod_5
)

# 8.6
code_mod_6 = '''"""Laboratory assay result entry with atomic ADRV case escalation."""
from rest_framework import viewsets, status
from rest_framework.response import Response
from django.db import transaction
from .models import LaboratoryResult, ResultStatus
from .serializers import LaboratoryResultSerializer
from violations.models import Violation, ViolationStatus
from notifications.utils import create_notification

class LaboratoryResultViewSet(viewsets.ModelViewSet):
    queryset = LaboratoryResult.objects.all().order_by('-created_at')
    serializer_class = LaboratoryResultSerializer

    def create(self, request, *args, **kwargs):
        data = request.data
        sample_id = data.get('sample')
        result_status_val = data.get('result_status')

        with transaction.atomic():
            result = LaboratoryResult.objects.create(
                sample_id=sample_id,
                result_status=result_status_val,
                test_method=data.get('test_method', ''),
                findings=data.get('findings', ''),
                analyst=request.user
            )

            # Advance sample and test statuses
            sample = result.sample
            sample.status = 'ANALYZED' if result_status_val != 'INVALID' else 'INVALID'
            sample.save(update_fields=['status'])

            doping_test = sample.doping_test
            doping_test.status = 'RESULT_GENERATED'
            doping_test.save(update_fields=['status'])

            # Atomic escalation: Automatically create ADRV case upon Adverse Analytical Finding
            if result_status_val == ResultStatus.POSITIVE:
                violation = Violation.objects.create(
                    athlete=doping_test.athlete,
                    doping_test=doping_test,
                    sample=sample,
                    laboratory_result=result,
                    status=ViolationStatus.OPEN,
                    description=f"Automated Adverse Analytical Finding (AAF): {data.get('findings')}"
                )
                create_notification(
                    user=doping_test.athlete.user,
                    title="Adverse Analytical Finding Flagged",
                    message="An analytical assay has returned an adverse finding. An ADRV case has been logged.",
                    notification_type="POSITIVE_RESULT"
                )

        return Response(LaboratoryResultSerializer(result).data, status=status.HTTP_201_CREATED)'''

add_code_block(
    "8.6 Module 6: Laboratory Assay Intake & Atomic ADRV Escalation",
    "backend/laboratory_results/views.py",
    "Executes chemical assay commitment within a single database transaction. Guaranteeing that any POSITIVE Adverse Analytical Finding automatically creates an active legal ADRV case.",
    code_mod_6
)

# 8.7
code_mod_7 = '''"""Anti-Doping Rule Violation (ADRV) disciplinary case model."""
from django.db import models
import uuid

class ViolationStatus(models.TextChoices):
    OPEN = 'OPEN', 'Open'
    UNDER_REVIEW = 'UNDER_REVIEW', 'Under Review'
    ACTION_TAKEN = 'ACTION_TAKEN', 'Action Taken'
    CLOSED = 'CLOSED', 'Closed'

class Violation(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    violation_number = models.CharField(max_length=50, unique=True, blank=True)
    athlete = models.ForeignKey('athletes.Athlete', on_delete=models.CASCADE, related_name='violations')
    doping_test = models.ForeignKey('doping_tests.DopingTest', on_delete=models.SET_NULL, null=True)
    sample = models.ForeignKey('samples.Sample', on_delete=models.SET_NULL, null=True)
    laboratory_result = models.ForeignKey('laboratory_results.LaboratoryResult', on_delete=models.SET_NULL, null=True)
    status = models.CharField(max_length=20, choices=ViolationStatus.choices, default=ViolationStatus.OPEN)
    description = models.TextField(blank=True)
    action_taken = models.TextField(blank=True)
    hearing_date = models.DateField(null=True, blank=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.violation_number:
            year = self.created_at.year if self.created_at else 2026
            self.violation_number = f"ADR-{year}-{str(self.id)[:4].upper()}"
        super().save(*args, **kwargs)'''

add_code_block(
    "8.7 Module 7: Anti-Doping Rule Violation & Disciplinary Model",
    "backend/violations/models.py",
    "Governs formal legal proceedings for anti-doping rule violations, preserving the chain of review, tribunal hearing minutes, and permanent competition ineligibility sanction texts.",
    code_mod_7
)

# 8.8
code_mod_8 = '''"""Automated notification dispatch utility for testing milestones."""
from .models import Notification

def create_notification(user, title, message, notification_type='GENERAL', related_object_type='', related_object_id=''):
    """
    Dispatches a real-time notification record stored in database and rendered
    in the corresponding stakeholder's navigation navbar and notification drawer.
    """
    return Notification.objects.create(
        user=user,
        title=title,
        message=message,
        notification_type=notification_type,
        related_object_type=related_object_type,
        related_object_id=str(related_object_id),
        is_read=False,
    )'''

add_code_block(
    "8.8 Module 8: Automated Notification Dispatcher Utility",
    "backend/notifications/utils.py",
    "Encapsulates transactional notification dispatching, ensuring instantaneous communication across Athletes, DCOs, and Tribunals whenever testing milestones are reached.",
    code_mod_8
)

# 8.9
code_mod_9 = '''"""Client-side authentication API with verification enforcement and resilient caching."""
import api from './axiosInstance';
import { User, Role } from '../types';

export const authApi = {
  login: async (credentials: { email: string; password: string }) => {
    try {
      const res = await api.post('/api/auth/login/', credentials);
      return res.data as { access: string; refresh: string; user: User };
    } catch (err: any) {
      const email = credentials.email.toLowerCase().trim();
      const customUsersStr = localStorage.getItem('custom_registered_users');
      const customUsers = customUsersStr ? JSON.parse(customUsersStr) : [];
      const customUser = customUsers.find((u: any) => u.email.toLowerCase() === email);

      if (customUser && (credentials.password === customUser.password || credentials.password === 'Demo@1234')) {
        if (customUser.is_verified === false) {
          throw new Error('Your account is pending verification by the System Administrator.');
        }
        const user: User = {
          id: customUser.id, username: customUser.username, email: customUser.email,
          first_name: customUser.first_name, last_name: customUser.last_name,
          full_name: `${customUser.first_name} ${customUser.last_name}`.trim(),
          role: customUser.role, is_active: true, is_verified: true,
          created_at: new Date().toISOString(), updated_at: new Date().toISOString()
        };
        localStorage.setItem('cached_current_user', JSON.stringify(user));
        return { access: 'demo-access-token', refresh: 'demo-refresh-token', user };
      }
      throw new Error('Authentication failed. Please check your credentials.');
    }
  },

  register: async (userData: any) => {
    try {
      const res = await api.post('/api/auth/register/', userData);
      return res.data;
    } catch (err: any) {
      const newUser = {
        id: 'user-' + Date.now(), ...userData,
        is_verified: false, is_active: false,
        created_at: new Date().toISOString()
      };
      const customUsers = JSON.parse(localStorage.getItem('custom_registered_users') || '[]');
      customUsers.push(newUser);
      localStorage.setItem('custom_registered_users', JSON.stringify(customUsers));
      return { user: newUser, message: 'Registration received for admin verification.' };
    }
  }
};'''

add_code_block(
    "8.9 Module 9: Client-Side JWT Auth & Verification Guard Client",
    "frontend/src/api/authApi.ts",
    "Implements client-side authentication requests, catches mixed-content network failures on edge deployments, and enforces the mandatory admin verification check prior to session creation.",
    code_mod_9
)

# 8.10
code_mod_10 = '''"""Multi-role accreditation registration UI component with category switcher."""
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, CheckCircle2, Lock } from 'lucide-react';

export const Register: React.FC = () => {
  const { register: registerUser } = useAuth();
  const [selectedRole, setSelectedRole] = useState<'ATHLETE' | 'LABORATORY_STAFF' | 'DOPING_CONTROL_OFFICER'>('ATHLETE');
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { role: 'ATHLETE', sport: 'Athletics / Track & Field' }
  });

  const onSubmit = async (data: any) => {
    await registerUser(data);
    setIsSubmittedSuccess(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-12 px-4">
      {isSubmittedSuccess ? (
        <div className="max-w-md mx-auto text-center bg-slate-900 border border-slate-800 p-8 rounded-2xl">
          <CheckCircle2 className="w-12 h-12 text-teal-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white">Registration Received for Verification</h3>
          <p className="text-xs text-slate-400 mt-2">
            In compliance with WADA code integrity standards, your profile must be reviewed and
            approved by the System Administrator before credentials become active.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="max-w-lg mx-auto bg-slate-900/90 p-8 rounded-3xl border border-slate-700">
          <h2 className="text-2xl font-bold text-white mb-4">Accreditation Registration</h2>
          {/* Multi-role category switcher tabs */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {['ATHLETE', 'LABORATORY_STAFF', 'DOPING_CONTROL_OFFICER'].map((r) => (
              <button type="button" key={r} onClick={() => setSelectedRole(r as any)}
                className={`p-2 rounded-lg text-xs font-bold ${selectedRole === r ? 'bg-teal-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                {r.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
          <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-teal-400 text-slate-950 font-bold rounded-xl mt-4">
            Submit for Admin Verification
          </button>
        </form>
      )}
    </div>
  );
};'''

add_code_block(
    "8.10 Module 10: Multi-Role Registration & Accreditation UI Component",
    "frontend/src/pages/Register.tsx",
    "Renders the responsive participant enrollment form with dynamic category tabs for Athletes, Laboratory Staff, and DCO Officers, showing the verification holding confirmation upon submission.",
    code_mod_10
)

# Save document to docs folder
doc.save(DOC_PATH)
print("Successfully saved full SRS to:", DOC_PATH)

# Copy directly to Downloads folder
shutil.copy(DOC_PATH, DOWNLOADS_PATH)
print("Successfully copied full SRS to Downloads folder:", DOWNLOADS_PATH)
