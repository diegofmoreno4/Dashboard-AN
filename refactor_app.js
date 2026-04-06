const fs = require('fs');
const file_path = 'c:/Users/Admin/facebook-ads-dashboard/app.js';
let content = fs.readFileSync(file_path, 'utf8');

const tableHelper = 
function renderGenericTable({ tbodyId, countId, thSelector, sortState, data, countLabel, emptyHtml, rowFn }) {
    const tbody = document.getElementById(tbodyId);
    if (countId) {
        const count = document.getElementById(countId);
        if (count) count.textContent = \\ \\\;
    }
    if (thSelector && sortState) {
        document.querySelectorAll(thSelector).forEach(t => {
            t.classList.remove('sort-asc', 'sort-desc');
            if (t.dataset.col === sortState.col) t.classList.add(sortState.dir === 'asc' ? 'sort-asc' : 'sort-desc');
        });
    }
    renderRows(tbody, data, rowFn, emptyHtml);
}
;

if (!content.includes('renderGenericTable')) {
    content = content.replace('/* ── UI — Tables ─────────────────────────────────────────────── */', '/* ── UI — Tables ─────────────────────────────────────────────── */\n' + tableHelper);
}

// 1. renderTable
const renderTablePat = /function renderTable\(adsData\) \{\s*const tbody = document\.getElementById\('ads-table-body'\);\s*const count = document\.getElementById\('table-count'\);\s*count\.textContent = \$\{adsData\.length\} anuncio\$\{adsData\.length !== 1 \? 's' : ''\};\s*renderRows\(tbody, adsData,([\s\S]*?),\s*'<tr class="empty-row"><td colspan="9">No se encontraron anuncios para los criterios actuales<\/td><\/tr>'\s*\);\s*\}/;
content = content.replace(renderTablePat, unction renderTable(adsData) {
    renderGenericTable({
        tbodyId: 'ads-table-body', countId: 'table-count', countLabel: 'anuncio',
        data: adsData, emptyHtml: '<tr class="empty-row"><td colspan="9">No se encontraron anuncios para los criterios actuales</td></tr>',
        rowFn: 
    });
});

const renderAccsPat = /function renderAccountsTable\(accountsData\) \{\s*const tbody = document\.getElementById\('accounts-table-body'\);\s*const count = document\.getElementById\('accounts-count'\);\s*count\.textContent = \$\{accountsData\.length\} account\$\{accountsData\.length !== 1 \? 's' : ''\};\s*renderRows\(tbody, accountsData,([\s\S]*?),\s*'<tr class="empty-row"><td colspan="10">No accounts found for the current criteria<\/td><\/tr>'\s*\);\s*\}/;
content = content.replace(renderAccsPat, unction renderAccountsTable(accountsData) {
    renderGenericTable({
        tbodyId: 'accounts-table-body', countId: 'accounts-count', countLabel: 'account',
        thSelector: '#accounts-thead th.sortable-acc', sortState: sortStateAcc,
        data: accountsData, emptyHtml: '<tr class="empty-row"><td colspan="10">No accounts found for the current criteria</td></tr>',
        rowFn: 
    });
});

const renderGoogleAccsPat = /function renderGoogleAccountsTable\(accounts\) \{\s*const tbody = document\.getElementById\('accounts-table-body'\);\s*const count = document\.getElementById\('accounts-count'\);\s*count\.textContent = \$\{accounts\.length\} account\$\{accounts\.length !== 1 \? 's' : ''\};\s*document\.querySelectorAll\('#accounts-thead th\.sortable-g'\)\.forEach\(t => \{\s*t\.classList\.remove\('sort-asc', 'sort-desc'\);\s*if \(t\.dataset\.col === sortStateG\.col\) t\.classList\.add\(sortStateG\.dir === 'asc' \? 'sort-asc' : 'sort-desc'\);\s*\}\);\s*renderRows\(tbody, accounts,([\s\S]*?),\s*'<tr class="empty-row"><td colspan="9">No Google Ads data for this period<\/td><\/tr>'\s*\);\s*\}/;
content = content.replace(renderGoogleAccsPat, unction renderGoogleAccountsTable(accounts) {
    renderGenericTable({
        tbodyId: 'accounts-table-body', countId: 'accounts-count', countLabel: 'account',
        thSelector: '#accounts-thead th.sortable-g', sortState: sortStateG,
        data: accounts, emptyHtml: '<tr class="empty-row"><td colspan="9">No Google Ads data for this period</td></tr>',
        rowFn: 
    });
});

const renderGenAccsPat = /function renderGeneralAccountsTable\(rows\) \{\s*const tbody = document\.getElementById\('accounts-table-body'\);\s*const count = document\.getElementById\('accounts-count'\);\s*count\.textContent = \$\{rows\.length\} account\$\{rows\.length !== 1 \? 's' : ''\};\s*document\.querySelectorAll\('#accounts-thead th\.sortable-gen'\)\.forEach\(t => \{\s*t\.classList\.remove\('sort-asc', 'sort-desc'\);\s*if \(t\.dataset\.col === sortStateGen\.col\) t\.classList\.add\(sortStateGen\.dir === 'asc' \? 'sort-asc' : 'sort-desc'\);\s*\}\);\s*renderRows\(tbody, rows,([\s\S]*?),\s*'<tr class="empty-row"><td colspan="12">No data for this period<\/td><\/tr>'\s*\);\s*\}/;
content = content.replace(renderGenAccsPat, unction renderGeneralAccountsTable(rows) {
    renderGenericTable({
        tbodyId: 'accounts-table-body', countId: 'accounts-count', countLabel: 'account',
        thSelector: '#accounts-thead th.sortable-gen', sortState: sortStateGen,
        data: rows, emptyHtml: '<tr class="empty-row"><td colspan="12">No data for this period</td></tr>',
        rowFn: 
    });
});

fs.writeFileSync(file_path, content, 'utf8');
console.log('Tables refactored in app.js');
