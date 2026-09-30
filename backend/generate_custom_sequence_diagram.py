import os
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as patches

# Output file targets
OUTPUT_DOCS = r"c:\Users\hanis\Downloads\sports-anti-doping-monitor\docs\diagrams\5_sequence_diagram_uml.png"
OUTPUT_DOWNLOADS_1 = r"C:\Users\hanis\Downloads\Sports_Anti_Doping_Sequence_Diagram.png"
OUTPUT_DOWNLOADS_2 = r"C:\Users\hanis\Downloads\sequence_diagram.png"

# Setup figure with exact proportions
plt.rcParams['font.sans-serif'] = 'Arial'
plt.rcParams['font.family'] = 'sans-serif'

fig, ax = plt.subplots(figsize=(11, 8.5), dpi=300)
ax.set_xlim(0, 100)
ax.set_ylim(0, 100)
ax.axis('off')

fig.patch.set_facecolor('white')
ax.set_facecolor('white')

# Exact Rational Rose UML Color Palette
LINE_COLOR = "#521422"   # Classic UML deep plum / burgundy
BOX_FILL = "#ffffcc"     # Pale yellow / cream header box
BAR_FILL = "#ffffff"     # White activation bar
TEXT_COLOR = "#000000"   # Black crisp text
LINE_WIDTH = 1.35

# Coordinates of Lifelines
actor_x = 9.0
ui_x = 31.0
test_x = 61.0
violation_x = 88.0

# ==========================================
# 1. ACTOR: : DCO (Stick Figure)
# ==========================================
head_center = (actor_x, 92.2)
head_r = 2.0
circle = patches.Circle(head_center, head_r, edgecolor=LINE_COLOR, facecolor='white', lw=LINE_WIDTH)
ax.add_patch(circle)

# Neck & Torso
ax.plot([actor_x, actor_x], [90.2, 83.5], color=LINE_COLOR, lw=LINE_WIDTH)
# Arms
ax.plot([actor_x - 3.5, actor_x + 3.5], [88.0, 88.0], color=LINE_COLOR, lw=LINE_WIDTH)
# Legs
ax.plot([actor_x, actor_x - 3.2], [83.5, 77.2], color=LINE_COLOR, lw=LINE_WIDTH)
ax.plot([actor_x, actor_x + 3.2], [83.5, 77.2], color=LINE_COLOR, lw=LINE_WIDTH)

# Label & Underline
ax.text(actor_x, 74.8, ": DCO", ha='center', va='center', fontsize=11.5, color=TEXT_COLOR)
ax.plot([actor_x - 3.2, actor_x + 3.2], [73.4, 73.4], color=TEXT_COLOR, lw=LINE_WIDTH)

# Lifeline
ax.plot([actor_x, actor_x], [72.0, 5.0], linestyle='--', color=LINE_COLOR, lw=LINE_WIDTH)
# Long Activation Bar
actor_bar = patches.Rectangle((actor_x - 0.85, 7.0), 1.7, 61.5, edgecolor=LINE_COLOR, facecolor=BAR_FILL, lw=LINE_WIDTH)
ax.add_patch(actor_bar)

# ==========================================
# 2. OBJECT 1: : UI
# ==========================================
ui_box = patches.Rectangle((ui_x - 8.5, 71.5), 17.0, 6.5, edgecolor=LINE_COLOR, facecolor=BOX_FILL, lw=LINE_WIDTH)
ax.add_patch(ui_box)
ax.text(ui_x, 75.0, ": UI", ha='center', va='center', fontsize=11.5, color=TEXT_COLOR)
ax.plot([ui_x - 2.8, ui_x + 2.8], [73.6, 73.6], color=TEXT_COLOR, lw=LINE_WIDTH)

# Lifeline
ax.plot([ui_x, ui_x], [71.5, 4.0], linestyle='--', color=LINE_COLOR, lw=LINE_WIDTH)
# Main Activation Bar
ui_bar = patches.Rectangle((ui_x - 0.85, 9.0), 1.7, 59.5, edgecolor=LINE_COLOR, facecolor=BAR_FILL, lw=LINE_WIDTH)
ax.add_patch(ui_bar)

# ==========================================
# 3. OBJECT 2: : DopingTest
# ==========================================
test_box = patches.Rectangle((test_x - 12.0, 71.5), 24.0, 6.5, edgecolor=LINE_COLOR, facecolor=BOX_FILL, lw=LINE_WIDTH)
ax.add_patch(test_box)
ax.text(test_x, 75.0, ": DopingTest", ha='center', va='center', fontsize=11.5, color=TEXT_COLOR)
ax.plot([test_x - 8.2, test_x + 8.2], [73.6, 73.6], color=TEXT_COLOR, lw=LINE_WIDTH)

# Lifeline
ax.plot([test_x, test_x], [71.5, 4.0], linestyle='--', color=LINE_COLOR, lw=LINE_WIDTH)
# Main Activation Bar
test_bar = patches.Rectangle((test_x - 0.85, 16.0), 1.7, 49.0, edgecolor=LINE_COLOR, facecolor=BAR_FILL, lw=LINE_WIDTH)
ax.add_patch(test_bar)

# ==========================================
# 4. OBJECT 3: : Violation (Created dynamically midway)
# ==========================================
v_y_top = 58.0
v_box = patches.Rectangle((violation_x - 10.0, v_y_top - 6.5), 20.0, 6.5, edgecolor=LINE_COLOR, facecolor=BOX_FILL, lw=LINE_WIDTH)
ax.add_patch(v_box)
ax.text(violation_x, v_y_top - 3.0, ": Violation", ha='center', va='center', fontsize=11.5, color=TEXT_COLOR)
ax.plot([violation_x - 6.5, violation_x + 6.5], [v_y_top - 4.4, v_y_top - 4.4], color=TEXT_COLOR, lw=LINE_WIDTH)

# Lifeline
ax.plot([violation_x, violation_x], [v_y_top - 6.5, 23.0], linestyle='--', color=LINE_COLOR, lw=LINE_WIDTH)
# Activation Bar
v_bar = patches.Rectangle((violation_x - 0.85, 40.0), 1.7, 7.5, edgecolor=LINE_COLOR, facecolor=BAR_FILL, lw=LINE_WIDTH)
ax.add_patch(v_bar)

# Termination 'X' at end of lifeline
ax.plot([violation_x - 2.2, violation_x + 2.2], [21.0, 25.0], color=LINE_COLOR, lw=LINE_WIDTH)
ax.plot([violation_x - 2.2, violation_x + 2.2], [25.0, 21.0], color=LINE_COLOR, lw=LINE_WIDTH)

# ==========================================
# HELPER FUNCTIONS
# ==========================================
def draw_arrow(x1, y1, x2, y2, is_dashed=False):
    style = "--" if is_dashed else "-"
    ax.annotate("", xy=(x2, y2), xytext=(x1, y1),
                arrowprops=dict(arrowstyle="->", color=LINE_COLOR, lw=LINE_WIDTH,
                                linestyle=style))

# ==========================================
# CALLS & MESSAGES
# ==========================================

# 1. Enter Sample ID( )
draw_arrow(actor_x + 0.85, 68.0, ui_x - 0.85, 68.0)
ax.text((actor_x + ui_x) / 2, 69.2, "Enter Sample ID( )", ha='center', va='bottom', fontsize=10.5, color=TEXT_COLOR)

# 2. VerifySampleStatus(sID)
draw_arrow(ui_x + 0.85, 63.5, test_x - 0.85, 63.5)
ax.text((ui_x + test_x) / 2, 64.7, "VerifySampleStatus(sID)", ha='center', va='bottom', fontsize=10.5, color=TEXT_COLOR)

# 3. <<create>> arrow pointing to : Violation header box
draw_arrow(test_x + 0.85, v_y_top - 3.25, violation_x - 10.0, v_y_top - 3.25)
ax.text((test_x + violation_x - 10.0) / 2, v_y_top - 2.0, "<<create>>", ha='center', va='bottom', fontsize=10.5, color=TEXT_COLOR)

# 4. RecordViolationDetails(sID)
draw_arrow(test_x + 0.85, 47.5, violation_x - 0.85, 47.5)
ax.text((test_x + violation_x) / 2 - 1.0, 48.7, "RecordViolationDetails(sID)", ha='center', va='bottom', fontsize=10.5, color=TEXT_COLOR)

# 5. Self-Call 1 on DopingTest: ValidateChainOfCustody(sID)
sc1_top = 40.5
sc1_bot = 36.0
ax.add_patch(patches.Rectangle((test_x + 0.85, sc1_bot), 1.6, sc1_top - sc1_bot, edgecolor=LINE_COLOR, facecolor=BAR_FILL, lw=LINE_WIDTH))
ax.plot([test_x + 0.85, test_x + 10.5], [sc1_top, sc1_top], color=LINE_COLOR, lw=LINE_WIDTH)
ax.plot([test_x + 10.5, test_x + 10.5], [sc1_top, sc1_bot], color=LINE_COLOR, lw=LINE_WIDTH)
draw_arrow(test_x + 10.5, sc1_bot, test_x + 2.5, sc1_bot)
ax.text(test_x + 2.0, sc1_top + 1.2, "ValidateChainOfCustody(sID)", ha='left', va='bottom', fontsize=10.5, color=TEXT_COLOR)

# 6. Self-Call 2 on DopingTest: IsSubstanceProhibited(sID)
sc2_top = 31.5
sc2_bot = 27.0
ax.add_patch(patches.Rectangle((test_x + 0.85, sc2_bot), 1.6, sc2_top - sc2_bot, edgecolor=LINE_COLOR, facecolor=BAR_FILL, lw=LINE_WIDTH))
ax.plot([test_x + 0.85, test_x + 10.5], [sc2_top, sc2_top], color=LINE_COLOR, lw=LINE_WIDTH)
ax.plot([test_x + 10.5, test_x + 10.5], [sc2_top, sc2_bot], color=LINE_COLOR, lw=LINE_WIDTH)
draw_arrow(test_x + 10.5, sc2_bot, test_x + 2.5, sc2_bot)
ax.text(test_x + 2.0, sc2_top + 1.2, "IsSubstanceProhibited(sID)", ha='left', va='bottom', fontsize=10.5, color=TEXT_COLOR)

# 7. Return Message (Dashed): Violation Status: Confirmed
draw_arrow(test_x - 0.85, 23.0, ui_x + 2.5, 23.0, is_dashed=True)
ax.text((ui_x + test_x) / 2, 24.2, "Violation Status: Confirmed", ha='center', va='bottom', fontsize=10.5, color=TEXT_COLOR)
# Nested bar on UI receiving return
ax.add_patch(patches.Rectangle((ui_x + 0.85, 19.5), 1.6, 4.2, edgecolor=LINE_COLOR, facecolor=BAR_FILL, lw=LINE_WIDTH))

# 8. Conditional Action on UI
ax.text(ui_x + 2.0, 17.2, "[Violation Status = Confirmed]", ha='left', va='bottom', fontsize=10.0, color=TEXT_COLOR)
ax.text(ui_x + 2.0, 14.0, "Display ADRV Alert Msg( )", ha='left', va='bottom', fontsize=10.0, color=TEXT_COLOR)

# Self-call loop on UI
ui_sc_top = 13.5
ui_sc_bot = 9.8
ax.add_patch(patches.Rectangle((ui_x + 0.85, ui_sc_bot), 1.6, ui_sc_top - ui_sc_bot, edgecolor=LINE_COLOR, facecolor=BAR_FILL, lw=LINE_WIDTH))
ax.plot([ui_x + 0.85, ui_x + 9.5], [ui_sc_top, ui_sc_top], color=LINE_COLOR, lw=LINE_WIDTH)
ax.plot([ui_x + 9.5, ui_x + 9.5], [ui_sc_top, ui_sc_bot], color=LINE_COLOR, lw=LINE_WIDTH)
draw_arrow(ui_x + 9.5, ui_sc_bot, ui_x + 2.5, ui_sc_bot)

plt.tight_layout()

# Save image files to diagrams folder and downloads folder
os.makedirs(os.path.dirname(OUTPUT_DOCS), exist_ok=True)
plt.savefig(OUTPUT_DOCS, bbox_inches='tight', dpi=300)
plt.savefig(OUTPUT_DOWNLOADS_1, bbox_inches='tight', dpi=300)
plt.savefig(OUTPUT_DOWNLOADS_2, bbox_inches='tight', dpi=300)
plt.close()

print("Successfully saved sequence diagram:")
print(" - Project Docs:", OUTPUT_DOCS)
print(" - Downloads:", OUTPUT_DOWNLOADS_1)
print(" - Downloads (Alt):", OUTPUT_DOWNLOADS_2)
