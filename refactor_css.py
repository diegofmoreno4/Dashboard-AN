import re

file_path = "c:\\Users\\Admin\\facebook-ads-dashboard\\style.css"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. ADD GLASS UTILITIES
glass_utils = '''
/* ── UI Utility Classes ─────────────────────────────────────── */
.glass-card {
    background: var(--bg-card);
    border: 1px solid var(--glass-border);
    backdrop-filter: var(--glass-blur);
    -webkit-backdrop-filter: var(--glass-blur);
}
.glass-panel {
    background: var(--bg-card);
    border: 1px solid var(--glass-border);
    backdrop-filter: var(--glass-blur);
    -webkit-backdrop-filter: var(--glass-blur);
    box-shadow: var(--shadow-md);
}
'''
if "glass-card" not in content:
    content = content.replace("/* ── Overlays ───────────────────────────────────────────────── */", glass_utils + "\n/* ── Overlays ───────────────────────────────────────────────── */")

# 2. REMOVE GLASS PROPERTIES FROM EXISTING CLASSES
replacements = [
    (r"    background: var\(--bg-card\);\s+border: 1px solid rgba\(240, 91, 91, 0\.3\);\s+border-radius: var\(--r-xl\);\s+padding: var\(--s5\) var\(--s4\);\s+max-width: 480px;\s+width: 90%;\s+text-align: center;\s+box-shadow: 0 0 60px rgba\(240, 91, 91, 0\.12\), var\(--shadow-lg\);\s+backdrop-filter: var\(--glass-blur\);\s+-webkit-backdrop-filter: var\(--glass-blur\);",
     "    border: 1px solid rgba(240, 91, 91, 0.3);\n    border-radius: var(--r-xl);\n    padding: var(--s5) var(--s4);\n    max-width: 480px;\n    width: 90%;\n    text-align: center;\n    box-shadow: 0 0 60px rgba(240, 91, 91, 0.12), var(--shadow-lg);"),
    
    (r"    background: var\(--bg-card\);\s+border: 1px solid var\(--glass-border\);\s+border-radius: var\(--r-xl\);\s+backdrop-filter: var\(--glass-blur\);\s+-webkit-backdrop-filter: var\(--glass-blur\);\s+box-shadow: var\(--shadow-md\);",
     "    border-radius: var(--r-xl);"),

    (r"    background: var\(--bg-card\);\s+border: 1px solid var\(--glass-border\);\s+border-radius: var\(--r-lg\);\s+backdrop-filter: var\(--glass-blur\);\s+-webkit-backdrop-filter: var\(--glass-blur\);",
     "    border-radius: var(--r-lg);"),

    (r"    background: var\(--bg-card\);\s+border: 1px solid var\(--glass-border\);\s+border-radius: var\(--r-lg\);\s+backdrop-filter: var\(--glass-blur\);\s+-webkit-backdrop-filter: var\(--glass-blur\);\s+box-shadow: var\(--shadow-md\);",
     "    border-radius: var(--r-lg);")
]

for pat, repl in replacements:
    content = re.sub(pat, repl, content)

# 3. REFACTOR KPI ANIMATION nth-childs
kpi_card_pat = r"\.kpi-card \{(.*?)\}\s+\.kpi-card:nth-child\(1\) \{.*?\}.*?\.kpi-card:nth-child\(6\) \{[^\}]*\}"
kpi_card_repl = r".kpi-card {\1    animation-delay: var(--delay, 0s);\n}"
content = re.sub(kpi_card_pat, kpi_card_repl, content, flags=re.DOTALL)


with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("style.css refactored!")
