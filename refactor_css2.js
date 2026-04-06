const fs = require('fs');
const file_path = 'c:/Users/Admin/facebook-ads-dashboard/style.css';
let content = fs.readFileSync(file_path, 'utf8');

const glassCardStr = '\n.glass-card {\n    background: var(--bg-card);\n    border: 1px solid var(--glass-border);\n    backdrop-filter: var(--glass-blur);\n    -webkit-backdrop-filter: var(--glass-blur);\n}\n';
const glassPanelStr = '.glass-panel {\n    background: var(--bg-card);\n    border: 1px solid var(--glass-border);\n    backdrop-filter: var(--glass-blur);\n    -webkit-backdrop-filter: var(--glass-blur);\n    box-shadow: var(--shadow-md);\n}\n';

if (!content.includes('.glass-card {')) {
    content = content.replace('/* ── Overlays ───────────────────────────────────────────────── */', glassCardStr + glassPanelStr + '/* ── Overlays ───────────────────────────────────────────────── */');
}

content = content.replace(/    background: var\(--bg-card\);\s+border: 1px solid rgba\(240, 91, 91, 0\.3\);\s+border-radius: var\(--r-xl\);\s+padding: var\(--s5\) var\(--s4\);\s+max-width: 480px;\s+width: 90%;\s+text-align: center;\s+box-shadow: 0 0 60px rgba\(240, 91, 91, 0\.12\), var\(--shadow-lg\);\s+backdrop-filter: var\(--glass-blur\);\s+-webkit-backdrop-filter: var\(--glass-blur\);/g, '    border: 1px solid rgba(240, 91, 91, 0.3);\n    border-radius: var(--r-xl);\n    padding: var(--s5) var(--s4);\n    max-width: 480px;\n    width: 90%;\n    text-align: center;\n    box-shadow: 0 0 60px rgba(240, 91, 91, 0.12), var(--shadow-lg);');

content = content.replace(/    background: var\(--bg-card\);\s+border: 1px solid var\(--glass-border\);\s+border-radius: var\(--r-xl\);\s+backdrop-filter: var\(--glass-blur\);\s+-webkit-backdrop-filter: var\(--glass-blur\);\s+box-shadow: var\(--shadow-md\);/g, '    border-radius: var(--r-xl);');
content = content.replace(/    background: var\(--bg-card\);\s+border: 1px solid var\(--glass-border\);\s+border-radius: var\(--r-lg\);\s+backdrop-filter: var\(--glass-blur\);\s+-webkit-backdrop-filter: var\(--glass-blur\);\s+box-shadow: var\(--shadow-md\);/g, '    border-radius: var(--r-lg);');
content = content.replace(/    background: var\(--bg-card\);\s+border: 1px solid var\(--glass-border\);\s+border-radius: var\(--r-lg\);\s+backdrop-filter: var\(--glass-blur\);\s+-webkit-backdrop-filter: var\(--glass-blur\);/g, '    border-radius: var(--r-lg);');

const kpi_card_pat = /\.kpi-card \{([^}]*)\}\s+\.kpi-card:nth-child\(1\) \{[^}]*\}\s*\.kpi-card:nth-child\(2\) \{[^}]*\}\s*\.kpi-card:nth-child\(3\) \{[^}]*\}\s*\.kpi-card:nth-child\(4\) \{[^}]*\}\s*\.kpi-card:nth-child\(5\) \{[^}]*\}\s*\.kpi-card:nth-child\(6\) \{[^}]*\}/;
content = content.replace(kpi_card_pat, '.kpi-card {    animation-delay: var(--delay, 0s);\n}');

fs.writeFileSync(file_path, content, 'utf8');
console.log('style.css refactored!');
