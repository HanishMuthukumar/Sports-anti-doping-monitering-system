import os
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as patches

OUTPUT_DIR = r"c:\Users\hanis\Downloads\sports-anti-doping-monitor\docs\diagrams"
os.makedirs(OUTPUT_DIR, exist_ok=True)

plt.rcParams['font.family'] = 'serif'
plt.rcParams['font.serif'] = ['Times New Roman', 'DejaVu Serif']

def draw_use_case():
    fig, ax = plt.subplots(figsize=(12, 9), dpi=300)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')
    
    # System boundary
    rect = patches.FancyBboxPatch((28, 5), 44, 90, boxstyle="round,pad=1", edgecolor="#1e3a8a", facecolor="#f8fafc", linewidth=2)
    ax.add_patch(rect)
    ax.text(50, 92, "Sports Anti-Doping Monitoring System", ha='center', va='center', fontsize=13, fontweight='bold', color="#1e3a8a")

    # Use cases
    use_cases = [
        (50, 83, "Register Profile &\nSubmit for Verification"),
        (50, 72, "Schedule Doping Test\n(In/Out Competition)"),
        (50, 61, "Collect Sample &\nLog Custody Receipt"),
        (50, 50, "Laboratory Intake &\nSeal Inspection"),
        (50, 39, "Conduct Assay Analysis\n& Report Findings"),
        (50, 28, "Auto-Escalate AAF\nViolation Case"),
        (50, 17, "Review Disciplinary Case\n& Enforce Sanctions"),
        (50, 8, "Verify Accreditations\n& Audit System Logs"),
    ]
    for x, y, text in use_cases:
        ellipse = patches.Ellipse((x, y), 32, 7.5, edgecolor="#0284c7", facecolor="#e0f2fe", linewidth=1.5)
        ax.add_patch(ellipse)
        ax.text(x, y, text, ha='center', va='center', fontsize=8.5, color="#0f172a", fontweight='semibold')

    # Actors
    def draw_actor(x, y, name):
        ax.plot([x], [y+3.5], marker='o', markersize=10, color='#0f172a', fillstyle='none', markeredgewidth=2)
        ax.plot([x, x], [y+2, y-2], color='#0f172a', linewidth=2)
        ax.plot([x-3, x+3], [y+0.5, y+0.5], color='#0f172a', linewidth=2)
        ax.plot([x, x-2.5], [y-2, y-6], color='#0f172a', linewidth=2)
        ax.plot([x, x+2.5], [y-2, y-6], color='#0f172a', linewidth=2)
        ax.text(x, y-8.5, name, ha='center', va='top', fontsize=9, fontweight='bold', color='#0f172a')

    draw_actor(12, 78, "Athlete")
    draw_actor(12, 50, "Doping Control\nOfficer (DCO)")
    draw_actor(88, 70, "Laboratory\nStaff")
    draw_actor(88, 38, "Sports Authority\n(Tribunal)")
    draw_actor(12, 20, "System\nAdministrator")

    # Connect lines
    lines = [
        # Athlete
        ((16, 78), (34, 83)),
        ((16, 78), (34, 61)),
        # DCO
        ((16, 50), (34, 72)),
        ((16, 50), (34, 61)),
        # Lab Staff
        ((84, 70), (66, 50)),
        ((84, 70), (66, 39)),
        # Sports Authority
        ((84, 38), (66, 28)),
        ((84, 38), (66, 17)),
        # Admin
        ((16, 20), (34, 8)),
        ((16, 20), (34, 83)),
    ]
    for p1, p2 in lines:
        ax.annotate("", xy=p2, xytext=p1, arrowprops=dict(arrowstyle="-", color="#475569", lw=1.2))

    plt.tight_layout()
    path = os.path.join(OUTPUT_DIR, "1_use_case_diagram.png")
    plt.savefig(path, bbox_inches='tight')
    plt.close()
    print("Saved use case diagram:", path)

def draw_class_diagram():
    fig, ax = plt.subplots(figsize=(13, 9.5), dpi=300)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')

    def draw_class_box(x, y, w, h, title, fields, methods):
        # Outer box
        rect = patches.Rectangle((x, y), w, h, edgecolor="#1e293b", facecolor="#ffffff", linewidth=1.5)
        ax.add_patch(rect)
        # Header box
        header = patches.Rectangle((x, y + h - 3.5), w, 3.5, edgecolor="#1e293b", facecolor="#f1f5f9", linewidth=1.5)
        ax.add_patch(header)
        ax.text(x + w/2, y + h - 1.8, title, ha='center', va='center', fontsize=9, fontweight='bold', color="#0f172a")

        # Line separator for fields
        sep_y = y + h - 3.5 - (len(fields) * 2.2 + 1)
        ax.plot([x, x + w], [sep_y, sep_y], color="#cbd5e1", linewidth=1)

        # Fields
        cur_y = y + h - 5.2
        for f in fields:
            ax.text(x + 1, cur_y, f, ha='left', va='center', fontsize=7.5, color="#334155")
            cur_y -= 2.2

        # Methods
        cur_y = sep_y - 2
        for m in methods:
            ax.text(x + 1, cur_y, m, ha='left', va='center', fontsize=7.5, color="#0369a1")
            cur_y -= 2.2

    # Draw classes
    draw_class_box(38, 74, 24, 23, "User", [
        "+ id: UUID",
        "+ email: String",
        "+ full_name: String",
        "+ role: RoleEnum",
        "+ is_verified: Boolean",
        "+ is_active: Boolean"
    ], [
        "+ set_password()",
        "+ check_password()",
        "+ get_full_name()"
    ])

    draw_class_box(5, 74, 24, 21, "Athlete", [
        "+ id: UUID",
        "+ athlete_id: String",
        "+ sport: String",
        "+ nationality: String",
        "+ team: String",
        "+ status: AthleteStatus"
    ], [
        "+ update_whereabouts()",
        "+ view_test_history()"
    ])

    draw_class_box(71, 74, 24, 21, "DopingControlOfficer", [
        "+ id: UUID",
        "+ officer_id: String",
        "+ certification_no: String",
        "+ organization: String",
        "+ status: OfficerStatus"
    ], [
        "+ assign_mission()",
        "+ log_collection()"
    ])

    draw_class_box(5, 38, 25, 24, "DopingTest", [
        "+ id: UUID",
        "+ test_number: String",
        "+ athlete_id: UUID",
        "+ officer_id: UUID",
        "+ scheduled_date: Date",
        "+ test_type: TestType",
        "+ status: TestStatus"
    ], [
        "+ transition_status()",
        "+ cancel_mission()"
    ])

    draw_class_box(37, 38, 26, 24, "Sample", [
        "+ id: UUID",
        "+ sample_number: String",
        "+ doping_test_id: UUID",
        "+ sample_type: SampleType",
        "+ bottle_a_code: String",
        "+ bottle_b_code: String",
        "+ status: SampleStatus"
    ], [
        "+ transition_status()",
        "+ append_custody_log()"
    ])

    draw_class_box(70, 38, 25, 24, "LaboratoryResult", [
        "+ id: UUID",
        "+ sample_id: UUID",
        "+ laboratory_id: UUID",
        "+ result_status: ResultStatus",
        "+ findings: String",
        "+ analyzed_at: DateTime"
    ], [
        "+ certify_result()",
        "+ flag_adverse_finding()"
    ])

    draw_class_box(37, 4, 26, 24, "Violation", [
        "+ id: UUID",
        "+ violation_number: String",
        "+ athlete_id: UUID",
        "+ sample_id: UUID",
        "+ status: ViolationStatus",
        "+ action_taken: String",
        "+ hearing_date: Date"
    ], [
        "+ review_case()",
        "+ enforce_sanction()",
        "+ close_case()"
    ])

    # Connect lines
    def connect(p1, p2, label=""):
        ax.annotate("", xy=p2, xytext=p1, arrowprops=dict(arrowstyle="->", color="#334155", lw=1.5))
        if label:
            mx, my = (p1[0]+p2[0])/2, (p1[1]+p2[1])/2
            ax.text(mx, my+1.5, label, fontsize=7.5, color="#475569", ha='center', backgroundcolor='white')

    connect((38, 85), (29, 85), "1..1")
    connect((62, 85), (71, 85), "1..1")
    connect((17, 74), (17, 62), "1..*")
    connect((71, 74), (30, 52), "1..*")
    connect((30, 50), (37, 50), "1..*")
    connect((63, 50), (70, 50), "1..1")
    connect((82, 38), (55, 28), "0..1 (AAF)")
    connect((50, 38), (50, 28), "1..1")

    plt.tight_layout()
    path = os.path.join(OUTPUT_DIR, "2_class_diagram.png")
    plt.savefig(path, bbox_inches='tight')
    plt.close()
    print("Saved class diagram:", path)

def draw_dfd():
    fig, ax = plt.subplots(figsize=(12, 8.5), dpi=300)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')

    ax.text(50, 96, "Data Flow Diagram (Level 1) - Anti-Doping Lifecycle", ha='center', fontsize=12, fontweight='bold', color="#0f172a")

    # Entities
    def draw_entity(x, y, text):
        rect = patches.Rectangle((x-7, y-4), 14, 8, edgecolor="#0f172a", facecolor="#f8fafc", lw=2)
        ax.add_patch(rect)
        ax.text(x, y, text, ha='center', va='center', fontsize=8.5, fontweight='bold', color="#0f172a")

    draw_entity(10, 80, "Athlete")
    draw_entity(10, 48, "DCO Officer")
    draw_entity(90, 48, "Lab Staff")
    draw_entity(90, 18, "Disciplinary\nAuthority")
    draw_entity(10, 18, "System Admin")

    # Processes
    def draw_proc(x, y, num, text):
        circle = patches.Circle((x, y), 6.5, edgecolor="#0369a1", facecolor="#e0f2fe", lw=1.8)
        ax.add_patch(circle)
        ax.text(x, y+2, num, ha='center', va='center', fontsize=8, fontweight='bold', color="#0369a1")
        ax.text(x, y-1.5, text, ha='center', va='center', fontsize=7.5, fontweight='semibold', color="#0f172a")

    draw_proc(32, 80, "1.0", "Verify\nAccount")
    draw_proc(35, 52, "2.0", "Schedule\nTest")
    draw_proc(55, 52, "3.0", "Custody\nTransfer")
    draw_proc(72, 52, "4.0", "Analyze\nSample")
    draw_proc(68, 22, "5.0", "ADRV Case\nReview")

    # Data Stores
    def draw_store(x, y, num, text):
        rect = patches.Rectangle((x-10, y-3), 20, 6, edgecolor="#334155", facecolor="#f1f5f9", lw=1.5)
        ax.add_patch(rect)
        ax.plot([x-10, x-10], [y-3, y+3], color="#334155", lw=2)
        ax.plot([x+10, x+10], [y-3, y+3], color="#334155", lw=2)
        ax.text(x, y, f"{num} {text}", ha='center', va='center', fontsize=8, fontweight='bold', color="#334155")

    draw_store(50, 80, "D1", "Users & Profiles")
    draw_store(45, 36, "D2", "Tests & Samples")
    draw_store(72, 36, "D3", "Lab Results")
    draw_store(45, 12, "D4", "Violations & Sanctions")

    # Connect data flows
    def flow(p1, p2, text):
        ax.annotate("", xy=p2, xytext=p1, arrowprops=dict(arrowstyle="->", color="#0284c7", lw=1.3))
        mx, my = (p1[0]+p2[0])/2, (p1[1]+p2[1])/2
        ax.text(mx, my+1.2, text, fontsize=6.8, ha='center', color="#0369a1", backgroundcolor='white')

    flow((17, 80), (25.5, 80), "Credentials")
    flow((38.5, 80), (40, 80), "Store User")
    flow((17, 20), (32, 73.5), "Approve")
    flow((17, 48), (28.5, 52), "Mission Specs")
    flow((41.5, 52), (48.5, 52), "Sample Code")
    flow((45, 48), (45, 39), "Save Sample")
    flow((61.5, 52), (65.5, 52), "Intake Kit")
    flow((83, 48), (78.5, 52), "Findings")
    flow((72, 45.5), (72, 39), "Save Result")
    flow((72, 33), (72, 28.5), "AAF Escalation")
    flow((83, 20), (74.5, 22), "Sanction Order")
    flow((61.5, 18), (55, 14), "Record Sanction")

    plt.tight_layout()
    path = os.path.join(OUTPUT_DIR, "3_dfd_diagram.png")
    plt.savefig(path, bbox_inches='tight')
    plt.close()
    print("Saved DFD diagram:", path)

def draw_activity():
    fig, ax = plt.subplots(figsize=(10, 11), dpi=300)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')

    ax.text(50, 98, "Activity Diagram - Comprehensive Testing & Resolution Workflow", ha='center', fontsize=11, fontweight='bold', color="#0f172a")

    # Start node
    start = patches.Circle((50, 94), 2, facecolor="#0f172a", edgecolor="#0f172a")
    ax.add_patch(start)

    def draw_act(x, y, w, h, text):
        rect = patches.FancyBboxPatch((x-w/2, y-h/2), w, h, boxstyle="round,pad=0.8", edgecolor="#0369a1", facecolor="#f0f9ff", lw=1.5)
        ax.add_patch(rect)
        ax.text(x, y, text, ha='center', va='center', fontsize=8, color="#0f172a", fontweight='semibold')

    def draw_decision(x, y, w, h, text):
        poly = patches.Polygon([[x, y+h/2], [x+w/2, y], [x, y-h/2], [x-w/2, y]], edgecolor="#d97706", facecolor="#fef3c7", lw=1.5)
        ax.add_patch(poly)
        ax.text(x, y, text, ha='center', va='center', fontsize=7.5, color="#92400e", fontweight='bold')

    draw_act(50, 86, 42, 5, "DCO Schedules Test Mission (In/Out-of-Comp)")
    draw_act(50, 76, 42, 5, "Notify Athlete & DCO Dispatches to Location")
    draw_act(50, 66, 42, 5, "Collect Urine/Blood & Split into Bottles A & B")
    draw_act(50, 56, 42, 5, "Seal Security Containers & Log Chain of Custody")
    draw_act(50, 46, 42, 5, "Ship Tamper-Evident Kit to Accredited Lab")
    draw_act(50, 36, 42, 5, "Lab Intake: Verify Seals & Conduct Chromatography")
    draw_decision(50, 24, 26, 8, "Result Status?")

    draw_act(22, 12, 32, 5, "Log Negative Finding\n& Notify Athlete")
    draw_act(78, 12, 34, 5, "Auto-Generate ADRV Case\n& Escalate to Tribunal")

    draw_act(78, 2, 34, 4.5, "Conduct Hearing & Enforce Sanctions")

    # End node
    end_outer = patches.Circle((22, 2), 2.5, edgecolor="#0f172a", facecolor="none", lw=1.5)
    end_inner = patches.Circle((22, 2), 1.5, edgecolor="#0f172a", facecolor="#0f172a")
    ax.add_patch(end_outer)
    ax.add_patch(end_inner)

    # Connections
    def arrow(p1, p2, text=""):
        ax.annotate("", xy=p2, xytext=p1, arrowprops=dict(arrowstyle="->", color="#334155", lw=1.3))
        if text:
            mx, my = (p1[0]+p2[0])/2, (p1[1]+p2[1])/2
            ax.text(mx+1.5, my, text, fontsize=7.5, color="#b45309", fontweight='bold')

    arrow((50, 92), (50, 88.5))
    arrow((50, 83.5), (50, 78.5))
    arrow((50, 73.5), (50, 68.5))
    arrow((50, 63.5), (50, 58.5))
    arrow((50, 53.5), (50, 48.5))
    arrow((50, 43.5), (50, 38.5))
    arrow((50, 33.5), (50, 28))

    # Branches
    ax.annotate("", xy=(22, 14.5), xytext=(37, 24), arrowprops=dict(arrowstyle="->", color="#334155", lw=1.3))
    ax.text(26, 22, "[Negative]", fontsize=8, color="#059669", fontweight='bold')

    ax.annotate("", xy=(78, 14.5), xytext=(63, 24), arrowprops=dict(arrowstyle="->", color="#334155", lw=1.3))
    ax.text(70, 22, "[Positive (AAF)]", fontsize=8, color="#dc2626", fontweight='bold')

    arrow((22, 9.5), (22, 4.5))
    arrow((78, 9.5), (78, 4.3))

    plt.tight_layout()
    path = os.path.join(OUTPUT_DIR, "4_activity_diagram.png")
    plt.savefig(path, bbox_inches='tight')
    plt.close()
    print("Saved activity diagram:", path)

def draw_sequence():
    fig, ax = plt.subplots(figsize=(12, 9), dpi=300)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')

    ax.text(50, 97, "Sequence Diagram - Sample Collection, Analysis & Violation Trigger", ha='center', fontsize=11, fontweight='bold', color="#0f172a")

    lifelines = [
        (12, "DCO Officer"),
        (34, "Frontend Portal"),
        (56, "Django Backend API"),
        (76, "Lab Analyst"),
        (92, "Authority Panel"),
    ]

    for x, name in lifelines:
        # Header box
        rect = patches.Rectangle((x-7, 88), 14, 6, edgecolor="#1e293b", facecolor="#f1f5f9", lw=1.5)
        ax.add_patch(rect)
        ax.text(x, 91, name, ha='center', va='center', fontsize=8, fontweight='bold', color="#0f172a")
        # Line
        ax.plot([x, x], [88, 5], linestyle='--', color="#94a3b8", lw=1.2)

    # Messages
    msgs = [
        ((12, 82), (34, 82), "scheduleTest(specs)"),
        ((34, 76), (56, 76), "POST /api/tests/"),
        ((56, 70), (12, 70), "201 Created (Test #DST-2026)"),
        ((12, 64), (34, 64), "collectSample(bottles A/B)"),
        ((34, 58), (56, 58), "POST /api/samples/"),
        ((56, 52), (76, 52), "notifySampleDispatched()"),
        ((76, 46), (56, 46), "POST /api/samples/{id}/receive/"),
        ((76, 38), (56, 38), "POST /api/results/ (POSITIVE AAF)"),
        ((56, 30), (56, 24), "atomic: autoCreateViolation()"),
        ((56, 18), (92, 18), "notifyViolationAlert(ADR-2026)"),
        ((92, 11), (56, 11), "POST /api/violations/{id}/review/"),
    ]

    for p1, p2, text in msgs:
        if p1[0] == p2[0]:
            # self loop
            ax.annotate("", xy=(p1[0], p2[1]), xytext=(p1[0], p1[1]),
                        arrowprops=dict(arrowstyle="->", color="#dc2626", lw=1.5, connectionstyle="arc3,rad=-0.5"))
            ax.text(p1[0]+8, (p1[1]+p2[1])/2, text, fontsize=7.5, color="#dc2626", fontweight='bold')
        else:
            ax.annotate("", xy=p2, xytext=p1, arrowprops=dict(arrowstyle="->", color="#0284c7", lw=1.3))
            mx = (p1[0]+p2[0])/2
            ax.text(mx, p1[1]+1.2, text, fontsize=7.5, color="#0f172a", ha='center', backgroundcolor='white')

    plt.tight_layout()
    path = os.path.join(OUTPUT_DIR, "5_sequence_diagram.png")
    plt.savefig(path, bbox_inches='tight')
    plt.close()
    print("Saved sequence diagram:", path)

def draw_state_chart():
    fig, ax = plt.subplots(figsize=(11, 8.5), dpi=300)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')

    ax.text(50, 96, "State Chart Diagram - Doping Test & Sample State Machine", ha='center', fontsize=11, fontweight='bold', color="#0f172a")

    # Start
    start = patches.Circle((8, 70), 2, facecolor="#0f172a", edgecolor="#0f172a")
    ax.add_patch(start)

    def draw_state(x, y, w, h, text):
        rect = patches.FancyBboxPatch((x-w/2, y-h/2), w, h, boxstyle="round,pad=1", edgecolor="#0284c7", facecolor="#f0f9ff", lw=1.8)
        ax.add_patch(rect)
        ax.text(x, y, text, ha='center', va='center', fontsize=8.5, fontweight='bold', color="#0f172a")

    draw_state(28, 70, 18, 7, "SCHEDULED")
    draw_state(58, 70, 22, 7, "SAMPLE_COLLECTED")
    draw_state(88, 70, 20, 7, "SAMPLE_SUBMITTED")

    draw_state(88, 35, 20, 7, "UNDER_ANALYSIS")
    draw_state(55, 35, 22, 7, "RESULT_GENERATED")
    draw_state(20, 35, 18, 7, "COMPLETED")

    # End
    end_out = patches.Circle((20, 12), 2.5, edgecolor="#0f172a", facecolor="none", lw=1.5)
    end_in = patches.Circle((20, 12), 1.5, edgecolor="#0f172a", facecolor="#0f172a")
    ax.add_patch(end_out)
    ax.add_patch(end_in)

    def transition(p1, p2, label=""):
        ax.annotate("", xy=p2, xytext=p1, arrowprops=dict(arrowstyle="->", color="#334155", lw=1.4))
        if label:
            mx, my = (p1[0]+p2[0])/2, (p1[1]+p2[1])/2
            ax.text(mx, my+1.8, label, fontsize=7.2, color="#0369a1", ha='center', backgroundcolor='white')

    transition((10, 70), (19, 70))
    transition((37, 70), (47, 70), "DCO collects sample")
    transition((69, 70), (78, 70), "DCO dispatches kit")

    # down to under analysis
    ax.annotate("", xy=(88, 38.5), xytext=(88, 66.5), arrowprops=dict(arrowstyle="->", color="#334155", lw=1.4))
    ax.text(90, 52.5, "Lab intake\n& verifies seals", fontsize=7.2, color="#0369a1", va='center')

    transition((78, 35), (66, 35), "Assay committed")
    transition((44, 35), (29, 35), "Formal sign-off")
    transition((20, 31.5), (20, 14.5), "Audit finalized")

    # Cancelled transition
    draw_state(28, 90, 18, 6, "CANCELLED")
    ax.annotate("", xy=(28, 87), xytext=(28, 73.5), arrowprops=dict(arrowstyle="->", color="#dc2626", lw=1.2, linestyle='--'))
    ax.text(29, 80, "Admin Aborts", fontsize=7, color="#dc2626")

    plt.tight_layout()
    path = os.path.join(OUTPUT_DIR, "6_state_chart_diagram.png")
    plt.savefig(path, bbox_inches='tight')
    plt.close()
    print("Saved state chart diagram:", path)

def draw_component():
    fig, ax = plt.subplots(figsize=(12, 9), dpi=300)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')

    ax.text(50, 96, "Component Diagram - Software Subsystems & Integrations", ha='center', fontsize=12, fontweight='bold', color="#0f172a")

    def draw_comp(x, y, w, h, text):
        rect = patches.Rectangle((x-w/2, y-h/2), w, h, edgecolor="#1e3a8a", facecolor="#f8fafc", lw=1.8)
        ax.add_patch(rect)
        # Tab 1
        t1 = patches.Rectangle((x-w/2-2, y+h/4-1.5), 3, 3, edgecolor="#1e3a8a", facecolor="#ffffff", lw=1.2)
        ax.add_patch(t1)
        # Tab 2
        t2 = patches.Rectangle((x-w/2-2, y-h/4-1.5), 3, 3, edgecolor="#1e3a8a", facecolor="#ffffff", lw=1.2)
        ax.add_patch(t2)
        ax.text(x, y, text, ha='center', va='center', fontsize=8, fontweight='bold', color="#0f172a")

    # Client Tier
    draw_comp(18, 75, 26, 12, "<<Component>>\nReact 18 SPA\n(Vite + Tailwind CSS)")
    draw_comp(18, 45, 26, 12, "<<Component>>\nAxios API Client\n(JWT Interceptor)")
    draw_comp(18, 18, 26, 12, "<<Component>>\nOffline Cache Store\n(LocalStorage Fallback)")

    # Server Components
    draw_comp(55, 75, 28, 14, "<<Component>>\nAuth & Verification Engine\n(SimpleJWT + Role Guards)")
    draw_comp(55, 48, 28, 14, "<<Component>>\nTesting & Custody Controller\n(Atomic State Machines)")
    draw_comp(55, 20, 28, 14, "<<Component>>\nADRV & Reporting Engine\n(Adverse Finding Trigger)")

    # Persistence
    draw_comp(88, 48, 20, 28, "<<Database Component>>\nPostgreSQL\n(Supabase Cloud)\n\n[10 Entity Tables]")

    def comp_link(p1, p2):
        ax.annotate("", xy=p2, xytext=p1, arrowprops=dict(arrowstyle="->", color="#0284c7", lw=1.5))

    comp_link((18, 69), (18, 51))
    comp_link((18, 39), (18, 24))
    comp_link((31, 48), (41, 75))
    comp_link((31, 48), (41, 48))
    comp_link((31, 48), (41, 20))
    comp_link((69, 75), (78, 55))
    comp_link((69, 48), (78, 48))
    comp_link((69, 20), (78, 40))

    plt.tight_layout()
    path = os.path.join(OUTPUT_DIR, "7_component_diagram.png")
    plt.savefig(path, bbox_inches='tight')
    plt.close()
    print("Saved component diagram:", path)

def draw_deployment():
    fig, ax = plt.subplots(figsize=(12, 9), dpi=300)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')

    ax.text(50, 96, "Deployment Diagram - Cloud Infrastructure Topology", ha='center', fontsize=12, fontweight='bold', color="#0f172a")

    def draw_node(x, y, w, h, title, sub):
        # 3D Node
        rect = patches.Rectangle((x-w/2, y-h/2), w, h, edgecolor="#0f172a", facecolor="#f8fafc", lw=1.8)
        ax.add_patch(rect)
        ax.plot([x-w/2, x-w/2+3], [y+h/2, y+h/2+3], color="#0f172a", lw=1.5)
        ax.plot([x+w/2, x+w/2+3], [y+h/2, y+h/2+3], color="#0f172a", lw=1.5)
        ax.plot([x+w/2, x+w/2+3], [y-h/2, y-h/2+3], color="#0f172a", lw=1.5)
        ax.plot([x-w/2+3, x+w/2+3], [y+h/2+3, y+h/2+3], color="#0f172a", lw=1.5)
        ax.plot([x+w/2+3, x+w/2+3], [y-h/2+3, y+h/2+3], color="#0f172a", lw=1.5)

        ax.text(x, y+h/2-3, title, ha='center', va='center', fontsize=9, fontweight='bold', color="#0f172a")
        ax.text(x, y-1, sub, ha='center', va='center', fontsize=7.5, color="#334155")

    draw_node(18, 65, 26, 26, "<<Client Device>>", "Athletes, Officers, Labs\n(Chrome, Safari, Edge)\n\nArtifact: React 18 SPA\nBundle (HTML5/JS/CSS)")
    draw_node(55, 65, 30, 26, "<<Web & App Server>>", "Vercel Edge / Cloud VM\n(Ubuntu 22.04 LTS)\n\nArtifact: Gunicorn WSGI\nDjango 5.0.6 + DRF\nPython 3.14 Runtime")
    draw_node(55, 20, 30, 24, "<<Database Cluster>>", "Supabase Cloud\n(AWS us-east)\n\nPostgreSQL 15 Instance\nPgBouncer Connection Pool\nAutomated SSL Encryption")

    def dep_link(p1, p2, text):
        ax.annotate("", xy=p2, xytext=p1, arrowprops=dict(arrowstyle="<->", color="#0284c7", lw=1.8))
        mx, my = (p1[0]+p2[0])/2, (p1[1]+p2[1])/2
        ax.text(mx, my+2, text, fontsize=7.5, color="#0369a1", ha='center', backgroundcolor='white')

    dep_link((31, 65), (40, 65), "HTTPS / TLS 1.3\n(REST JSON & JWT)")
    dep_link((55, 52), (55, 32), "Encrypted TCP\n(Port 5432 / SSL)")

    plt.tight_layout()
    path = os.path.join(OUTPUT_DIR, "8_deployment_diagram.png")
    plt.savefig(path, bbox_inches='tight')
    plt.close()
    print("Saved deployment diagram:", path)

draw_use_case()
draw_class_diagram()
draw_dfd()
draw_activity()
draw_sequence()
draw_state_chart()
draw_component()
draw_deployment()
print("All 8 diagrams generated successfully!")
