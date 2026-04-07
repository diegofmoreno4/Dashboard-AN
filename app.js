/* ============================================================
   FACEBOOK ADS DASHBOARD — app.js
   ============================================================ */

/* ── Google Ads Config ──────────────────────────────────────── */
const GOOGLE_SHEET_ID = '1k5pkI8pHS-mOCP-988y9qKKjbJHMz6NV1u6N8GHSm_Q';

const GOOGLE_ACCOUNTS = {
    '6307839929': { metaId: 'act_364446625716525' },
    '9944217293': { metaId: 'act_376245277862263' },
    '7032676839': { metaId: 'act_674548406819081' },
    '9323994741': { metaId: 'act_1074729294779025' },
    '1371132049': { metaId: 'act_1159707378040111' },
    '4603681023': { metaId: 'google_4603681023' },
};

const GOOGLE_BUDGETS = {
    '9944217293': 7500,
    '9323994741': 16000,
    '7032676839': 3000,
    '6307839929': 5000,
    '4603681023': 3000,
    '1371132049': 10000,
};

const RETAINED_SHEET_ID = '1F_vFPgXc6w9tS51ZuKLRlbNKaenIvgGw8uIQpWWIidw';

const RETAINED_BOARD_IDS = {
    '18396670066': 'act_520095449684172',
    '18400667995': 'act_951413483945685',
    '18389952774': 'act_1159707378040111',
    '18400667931': 'act_2306771323018151',
    '18396670323': 'act_674548406819081',
    '18392320525': 'act_376245277862263',
    '18398468710': 'act_1462113892114326',
    '18398469167': 'act_358511638121551',
    '18395192945': 'act_1074729294779025',
    '18402892585': 'act_1200823155221862',
    '18392795889': 'act_364446625716525',
    '18398469042': 'act_1718797132420704',
    '18390812892': 'act_8871491509538618',
    '18398467770': 'act_567417995859866',
    '18398468519': '4603681023',
};

const ACCOUNT_MAX_PRESET = {
    'act_8871491509538618': 'last_30d',
};

// Accounts that need a smaller page limit to avoid "reduce data" API errors
const ACCOUNT_PAGE_LIMIT = {
    'act_8871491509538618': 100,
};

const PRESET_ORDER = ['last_7d', 'last_14d', 'this_month', 'this_month_today', 'last_30d', 'last_month', 'this_year', 'maximum', 'custom'];

function capPreset(accountId, preset) {
    const max = ACCOUNT_MAX_PRESET[accountId];
    if (!max) return preset;
    const pi = PRESET_ORDER.indexOf(preset);
    const mi = PRESET_ORDER.indexOf(max);
    return (pi === -1 || pi <= mi) ? preset : max;
}

const PRESET_TO_GOOGLE_PERIOD = {
    'last_7d': 'LAST_7_DAYS',
    'last_14d': 'LAST_14_DAYS',
    'last_30d': 'LAST_30_DAYS',
    'this_month': 'THIS_MONTH',
    'this_month_today': 'THIS_MONTH',
    'last_month': 'LAST_MONTH',
    'this_year': 'LAST_30_DAYS',
    'maximum': 'LAST_30_DAYS',
    'custom': 'LAST_30_DAYS',
};

const ACCESS_TOKEN = 'EAAWY1EZBnXXMBRHbDb19XOE9Q4OgnjXjmdHWsTazTY7FCleLIwfNZAtTZC4hb1apENBycwZCAw1u8lz9KqOnRuFg1dd9lYeFj2wWWCW1SE3W8dFLt8ZBXimZBulSDU4IdpZBaf4uzz7ZAWUzuu19KMlj78N9NaFvSTGpvHpjSc2AyNDauTwiRLNZCjfGZB2Jes';

const API_VERSION = 'v25.0';
const BASE_URL = `https://graph.facebook.com/${API_VERSION}`;
const TOP_ADS_MAX = 15;

/* ── State ──────────────────────────────────────────────────── */
let mainChart = null;
let currentChartMode = 'spend-leads';
let fetchGeneration = 0;
let globalAdsData = [];
let globalDailyData = [];
let globalAccountsData = [];
let currentAdsData = [];
let currentDailyData = [];
let currentAccountsData = [];
let sortState = { col: 'leads', dir: 'desc' };
let sortStateAcc = { col: 'leads', dir: 'desc' };
let allAccounts = [];
let currentTab = 'general';
let googleAccountNames = {};
let googleAccountStatuses = {};
let googleRawDaily = [];
let googleRawKeywords = [];
let sortStateKw = { col: 'conversions', dir: 'desc' };
let sortStateG = { col: 'conversions', dir: 'desc' };
let sortStateGen = { col: 'convs', dir: 'desc' };
let currentGoogleKeywords = [];
let currentGoogleAccounts = [];
let currentGeneralRows = [];
let retainedRawRows = [];
let retainedByAccount = {};

/* ── Metadata Estática ──────────────────────────────────────── */
const METADATOS_CUENTAS = {
    'act_951413483945685':  { fecha: '25/02/2026', plataformas: 'Meta', categoria: 'Immigration', budget: 4500 },
    'act_1159707378040111': { fecha: '5/01/2026',  plataformas: 'Meta - Google', categoria: 'PI - WC', budget: 0 },
    'act_2306771323018151': { fecha: '19/02/2026', plataformas: 'Meta', categoria: 'PI', budget: 9250 },
    'act_1222146353201614': { fecha: '15/01/2026', plataformas: 'Meta - Google', categoria: 'TT', budget: 2000 },
    'act_674548406819081':  { fecha: '29/01/2026', plataformas: 'Meta - Google', categoria: 'PI', budget: 2000 },
    'act_376245277862263':  { fecha: '7/01/2026',  plataformas: 'Meta - Google', categoria: 'PI - WC', budget: 7500 },
    'act_1462113892114326': { fecha: '4/03/2026',  plataformas: 'Meta', categoria: 'Immigration', budget: 1250 },
    'act_358511638121551':  { fecha: '5/01/2026',  plataformas: 'Meta', categoria: 'PI', budget: 7500 },
    'act_1074729294779025': { fecha: '23/01/2026', plataformas: 'Meta - Google', categoria: 'PI', budget: 14000 },
    'act_1200823155221862': { fecha: '9/03/2026',  plataformas: 'Meta', categoria: 'Immigration', budget: 2000 },
    'act_520095449684172':  { fecha: '23/01/2026', plataformas: 'Meta', categoria: 'WC', budget: 3000 },
    'google_4603681023':    { fecha: '20/02/2026', plataformas: 'Google', categoria: 'WC', budget: 0 },
    'act_364446625716525':  { fecha: '15/01/2026', plataformas: 'Google', categoria: 'PI', budget: 0 },
    'act_1718797132420704': { fecha: '18/03/2026', plataformas: 'Meta', categoria: 'Asbestos', budget: 5000 },
    'act_8871491509538618': { fecha: '9/12/2025',  plataformas: 'Meta', categoria: 'PI', budget: 7500 },
    'act_567417995859866':  { fecha: '4/03/2026',  plataformas: 'Meta', categoria: 'HOA', budget: 3000 },
};

/* ── Campaign Filter ────────────────────────────────────────── */
const CAMPAIGN_FILTER = {
    keywords: ['Ignorar', 'Test', 'promoting', 'instagram', 'mof', 'tof', 'giveaway', 'lead gen'],
    ids: [],
};

function isCampaignAllowed(campaignId, campaignName) {
    if (!campaignName && !campaignId) return true;
    if (campaignId && CAMPAIGN_FILTER.ids.includes(campaignId)) return false;
    if (campaignName) {
        const nameUpper = campaignName.toUpperCase();
        for (const kw of CAMPAIGN_FILTER.keywords) {
            if (kw && nameUpper.includes(kw.toUpperCase())) return false;
        }
    }
    return true;
}

/* ── Formatters ─────────────────────────────────────────────── */
const fmt = {
    currency: (n) => (n === null || n === undefined || isNaN(n)) ? 'N/A'
        : '$' + parseFloat(n).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
    int: (n) => (n === null || n === undefined || isNaN(n)) ? '0'
        : parseInt(n).toLocaleString('en-US'),
    pct: (n) => (n === null || n === undefined || isNaN(n)) ? '0.0%'
        : parseFloat(n).toFixed(1) + '%',
    plain: (n, d = 1) => (n === null || n === undefined || isNaN(n)) ? '0'
        : parseFloat(n).toFixed(d),
};

/* ── API Helpers ────────────────────────────────────────────── */

/** Helper to get local date as YYYY-MM-DD */
function toLocalISO(d) {
    if (!d || isNaN(d.getTime())) return '';
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

/** Build a Meta Graph API URL */
function metaUrl(path, params = {}) {
    const qs = new URLSearchParams({ ...params, access_token: ACCESS_TOKEN });
    return `${BASE_URL}/${path}?${qs}`;
}

async function apiFetch(url) {
    let response;
    try {
        response = await fetch(url);
    } catch (networkErr) {
        const e = new Error('Error de red. Verifica tu conexión a internet.');
        e.isNetwork = true;
        throw e;
    }
    const json = await response.json();
    if (json.error) {
        const e = new Error(json.error.message || 'Error de la API de Meta');
        e.code = json.error.code;
        e.subcode = json.error.error_subcode;
        e.type = json.error.type;
        throw e;
    }
    return json;
}

function isTokenError(err) {
    const TOKEN_CODES = [190, 102, 104];
    if (TOKEN_CODES.includes(err.code)) return true;
    const msg = (err.message || '').toLowerCase();
    return msg.includes('access token') || msg.includes('oauthexception') ||
           msg.includes('invalid oauth') || msg.includes('session') || msg.includes('expired');
}

async function fetchAllPages(url) {
    let results = [];
    let nextUrl = url;
    let page = 0;
    while (nextUrl && page < 20) {
        const data = await apiFetch(nextUrl);
        if (Array.isArray(data.data)) results = results.concat(data.data);
        nextUrl = data.paging?.next || null;
        page++;
    }
    return results;
}

/** Generic table renderer — clears tbody and renders rows via rowFn */
function renderRows(tbody, data, rowFn, emptyHtml) {
    if (data.length === 0) {
        tbody.innerHTML = emptyHtml;
        return;
    }
    tbody.innerHTML = data.map(rowFn).join('');
}

/* ── Data Fetching ──────────────────────────────────────────── */

async function fetchAdAccounts() {
    const url = metaUrl('me/adaccounts', {
        fields: 'name,account_id,currency,account_status,disable_reason,campaigns.limit(100){status}',
        limit: 200,
    });
    const data = await apiFetch(url);
    return data.data || [];
}

async function fetchAccountSpend(accountId) {
    try {
        const url = metaUrl(`${accountId}/insights`, { fields: 'spend', date_preset: 'maximum' });
        const data = await apiFetch(url);
        if (data.data && data.data.length > 0) return parseFloat(data.data[0].spend) || 0;
    } catch (_) { /* ignore */ }
    return 0;
}

function getDateParam(preset) {
    if (preset === 'custom') {
        const start = document.getElementById('date-start').value;
        const end = document.getElementById('date-end').value;
        return `time_range=${encodeURIComponent(JSON.stringify({ since: start, until: end }))}`;
    }
    if (preset === 'this_month_today') return `date_preset=this_month`;
    
    if (preset === 'this_month') {
        const today = new Date();
        const start = new Date(today.getFullYear(), today.getMonth(), 1);
        let end = new Date(today);
        end.setDate(end.getDate() - 1);
        if (end < start) end = start;
        return `time_range=${encodeURIComponent(JSON.stringify({ since: toLocalISO(start), until: toLocalISO(end) }))}`;
    }
    
    if (preset === 'last_7d' || preset === 'last_14d' || preset === 'last_30d') {
        const today = new Date();
        const days = parseInt(preset.split('_')[1], 10);
        let end = new Date(today); end.setDate(end.getDate() - 1);
        let start = new Date(end); start.setDate(start.getDate() - days + 1);
        return `time_range=${encodeURIComponent(JSON.stringify({ since: toLocalISO(start), until: toLocalISO(end) }))}`;
    }
    
    return `date_preset=${preset}`;
}

function getPreviousPeriodParam(preset) {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    let since, until;
    if (preset === 'last_7d') {
        until = new Date(today); until.setDate(until.getDate() - 8);
        since = new Date(today); since.setDate(since.getDate() - 14);
    } else if (preset === 'last_14d') {
        until = new Date(today); until.setDate(until.getDate() - 15);
        since = new Date(today); since.setDate(since.getDate() - 28);
    } else if (preset === 'last_30d') {
        until = new Date(today); until.setDate(until.getDate() - 31);
        since = new Date(today); since.setDate(since.getDate() - 60);
    } else if (preset === 'this_month' || preset === 'this_month_today') {
        since = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        until = new Date(today.getFullYear(), today.getMonth(), 0);
    } else if (preset === 'last_month') {
        since = new Date(today.getFullYear(), today.getMonth() - 2, 1);
        until = new Date(today.getFullYear(), today.getMonth() - 1, 0);
    } else if (preset === 'this_year') {
        since = new Date(today.getFullYear() - 1, 0, 1);
        until = new Date(today.getFullYear() - 1, 11, 31);
    } else if (preset === 'custom') {
        const s = new Date(document.getElementById('date-start').value);
        const e = new Date(document.getElementById('date-end').value);
        const days = Math.round((e - s) / 86400000) + 1;
        until = new Date(s); until.setDate(until.getDate() - 1);
        since = new Date(until); since.setDate(since.getDate() - days + 1);
    } else { return null; }
    return `time_range=${encodeURIComponent(JSON.stringify({ since: toLocalISO(since), until: toLocalISO(until) }))}`;
}

/**
 * Unified insights fetcher.
 * level: 'account' | 'ad' | 'campaign'
 * timeIncrement: null | 1
 * extraFields: additional comma-separated fields
 */
async function fetchInsights(accountId, preset, { level = 'ad', timeIncrement = null, extraFields = '', limit = 500 } = {}) {
    const baseFields = {
        ad: 'campaign_id,campaign_name,ad_id,account_name,ad_name,reach,spend,impressions,actions,cost_per_action_type,ctr,inline_link_clicks,cpc',
        campaign: 'campaign_id,campaign_name,reach,spend,impressions,actions,cost_per_action_type,ctr,inline_link_clicks,cpc',
        account: 'reach,spend,impressions,actions,inline_link_clicks',
    };
    const fields = extraFields || baseFields[level] || baseFields.ad;
    const param = getDateParam(preset);
    const tiParam = timeIncrement ? `&time_increment=${timeIncrement}` : '';
    const url = `${BASE_URL}/${accountId}/insights?fields=${fields}&level=${level}&${param}${tiParam}&limit=${limit}&access_token=${ACCESS_TOKEN}`;
    return await fetchAllPages(url);
}

function extractMetrics(row) {
    const spend = parseFloat(row.spend) || 0;
    const reach = parseInt(row.reach) || 0;
    const impressions = parseInt(row.impressions) || 0;
    const linkClicks = parseInt(row.inline_link_clicks) || 0;
    let leads = 0, cpl = null;
    if (Array.isArray(row.actions)) {
        const a = row.actions.find(x => x.action_type === 'lead');
        if (a) leads = parseInt(a.value) || 0;
    }
    if (Array.isArray(row.cost_per_action_type)) {
        const c = row.cost_per_action_type.find(x => x.action_type === 'lead');
        if (c) cpl = parseFloat(c.value) || null;
    }
    return {
        spend, reach, impressions, linkClicks, leads,
        ctr: impressions > 0 ? (linkClicks / impressions) * 100 : 0,
        cpc: row.cpc ? (parseFloat(row.cpc) || null) : (linkClicks > 0 ? spend / linkClicks : null),
        cpl: cpl !== null ? cpl : (leads > 0 ? spend / leads : null),
    };
}

async function fetchPreviousInsights(accountId, param) {
    try {
        const fields = 'reach,spend,impressions,actions,inline_link_clicks';
        const url = `${BASE_URL}/${accountId}/insights?fields=${fields}&level=account&${param}&access_token=${ACCESS_TOKEN}`;
        const data = await apiFetch(url);
        return data.data && data.data[0] ? extractMetrics(data.data[0]) : null;
    } catch (_) { return null; }
}

async function fetchPreviousAdInsights(accountId, param) {
    try {
        const fields = 'ad_id,reach,spend,impressions,actions,cost_per_action_type,inline_link_clicks,cpc';
        const url = `${BASE_URL}/${accountId}/insights?fields=${fields}&level=ad&${param}&limit=500&access_token=${ACCESS_TOKEN}`;
        const rows = await fetchAllPages(url);
        const map = {};
        for (const row of rows) {
            const id = row.ad_id || row.id;
            if (id) map[id] = extractMetrics(row);
        }
        return map;
    } catch (_) { return {}; }
}

async function fetch7dAlertData(accountId, param) {
    try {
        const fields = 'ad_id,spend,actions';
        const url = `${BASE_URL}/${accountId}/insights?fields=${fields}&level=ad&${param}&limit=500&access_token=${ACCESS_TOKEN}`;
        const rows = await fetchAllPages(url);
        const map = {};
        for (const row of rows) {
            const id = row.ad_id || row.id;
            if (!id) continue;
            const spend = parseFloat(row.spend) || 0;
            const leads = extractLeads(row.actions);
            map[id] = { spend, leads };
        }
        return map;
    } catch (_) { return {}; }
}

// Creatives don't change with date — cache them for the session
const creativesCache = {};

async function fetchAdCreatives(accountId) {
    if (creativesCache[accountId]) return creativesCache[accountId];
    const url = metaUrl(`${accountId}/ads`, {
        fields: 'id,effective_status,creative{thumbnail_url,image_url}',
        limit: 100,
    });
    const ads = await fetchAllPages(url);
    const map = {};
    for (const ad of ads) {
        const item = { status: ad.effective_status || 'UNKNOWN' };
        item.thumbnail = (ad.creative && (ad.creative.thumbnail_url || ad.creative.image_url)) || null;
        map[ad.id] = item;
    }
    creativesCache[accountId] = map;
    return map;
}

/* ── Data Processing ────────────────────────────────────────── */

function extractLeads(actions) {
    if (!Array.isArray(actions)) return 0;
    const a = actions.find(x => x.action_type === 'lead');
    return a ? (parseInt(a.value) || 0) : 0;
}

function processDaily(row, accountId = null) {
    return {
        accountId,
        date: row.date_start,
        reach: parseInt(row.reach) || 0,
        spend: parseFloat(row.spend) || 0,
        impressions: parseInt(row.impressions) || 0,
        ctr: parseFloat(row.ctr) || 0,
        linkClicks: parseInt(row.inline_link_clicks) || 0,
        leads: extractLeads(row.actions),
    };
}

function processAd(ad, creativesMap = {}, accountId = null) {
    let cpl = null;
    if (Array.isArray(ad.cost_per_action_type)) {
        const c = ad.cost_per_action_type.find(x => x.action_type === 'lead');
        if (c) cpl = parseFloat(c.value) || null;
    }
    const id = ad.ad_id || ad.id || '';
    const creativeInfo = creativesMap[id] || { thumbnail: null, status: 'UNKNOWN' };
    return {
        accountId,
        adId: id,
        thumbnail: creativeInfo.thumbnail,
        status: creativeInfo.status,
        adName: ad.ad_name || 'Sin nombre',
        accountName: ad.account_name || 'N/A',
        reach: parseInt(ad.reach) || 0,
        spend: parseFloat(ad.spend) || 0,
        impressions: parseInt(ad.impressions) || 0,
        ctr: parseFloat(ad.ctr) || 0,
        linkClicks: parseInt(ad.inline_link_clicks) || 0,
        cpc: ad.cpc ? (parseFloat(ad.cpc) || null) : null,
        leads: extractLeads(ad.actions),
        cpl,
    };
}

/* ── UI — KPI Cards ─────────────────────────────────────────── */

function updateKPICards(adsData) {
    // Single pass over adsData for all current-period aggregates
    let totalSpend = 0, totalLeads = 0, totalImpressions = 0, totalClicks = 0;
    let prevSpend = 0, prevLeads = 0, prevImpressions = 0, prevClicks = 0;
    let ctrSum = 0, ctrCount = 0, cplSum = 0, cplCount = 0;

    for (const a of adsData) {
        totalSpend       += a.spend;
        totalLeads       += a.leads;
        totalImpressions += a.impressions;
        totalClicks      += a.linkClicks;
        if (a.ctr > 0) { ctrSum += a.ctr; ctrCount++; }
        if (a.cpl !== null) { cplSum += a.cpl; cplCount++; }
        if (a.prev) {
            prevSpend       += a.prev.spend || 0;
            prevLeads       += a.prev.leads || 0;
            prevImpressions += a.prev.impressions || 0;
            prevClicks      += a.prev.linkClicks || 0;
        }
    }

    const avgCtr = ctrCount ? ctrSum / ctrCount : 0;
    const avgCpl = cplCount ? cplSum / cplCount : null;
    const prevCtr = prevImpressions > 0 ? (prevClicks / prevImpressions) * 100 : 0;
    const prevCpl = prevLeads > 0 ? prevSpend / prevLeads : null;

    animateValue('kpi-total-spend', fmt.currency(totalSpend));
    if (window.updateKPITrend) window.updateKPITrend('trend-spend', totalSpend, prevSpend, true);

    animateValue('kpi-total-leads', fmt.int(totalLeads));
    if (window.updateKPITrend) window.updateKPITrend('trend-leads', totalLeads, prevLeads, false);

    animateValue('kpi-avg-ctr', fmt.pct(avgCtr));
    if (window.updateKPITrend) window.updateKPITrend('trend-ctr', avgCtr, prevCtr, false);

    animateValue('kpi-avg-cpl', avgCpl !== null ? fmt.currency(avgCpl) : 'N/A');
    if (window.updateKPITrend) window.updateKPITrend('trend-cpl', avgCpl || 0, prevCpl || 0, true);

    animateValue('kpi-total-impressions', fmt.int(totalImpressions));
    if (window.updateKPITrend) window.updateKPITrend('trend-reach', totalImpressions, prevImpressions, false);

    animateValue('kpi-total-clicks', fmt.int(totalClicks));
    if (window.updateKPITrend) window.updateKPITrend('trend-clicks', totalClicks, prevClicks, false);

    updateSpendBadge('Meta Spend', fmt.currency(totalSpend));
}

function updateSpendBadge(label, amount) {
    const el = document.getElementById('total-consolidated-spend');
    const lbl = document.querySelector('.consolidated-badge .badge-label');
    if (el) el.textContent = amount;
    if (lbl) lbl.textContent = label;
}

function animateValue(id, finalValueStr) {
    const el = document.getElementById(id);
    if (!el) return;
    if (finalValueStr === 'N/A' || finalValueStr === '—') { el.textContent = finalValueStr; return; }
    const finalNum = parseFloat(String(finalValueStr).replace(/[^0-9.-]+/g, ''));
    const isCurrency = String(finalValueStr).includes('$');
    const isPct = String(finalValueStr).includes('%');
    if (isNaN(finalNum)) { el.textContent = finalValueStr; return; }
    let startNum = parseFloat(el.dataset.currentVal) || 0;
    el.dataset.currentVal = finalNum;
    const duration = 250;
    const startTime = performance.now();
    function update(t) {
        const elapsed = t - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 4);
        const current = startNum + (finalNum - startNum) * easeOut;
        let display;
        if (isCurrency) display = '$' + current.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
        else if (isPct)  display = current.toFixed(1) + '%';
        else             display = Math.round(current).toLocaleString('en-US');
        el.textContent = progress === 1 ? finalValueStr : display;
        if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
}

/* ── UI — Chart ─────────────────────────────────────────────── */

function renderChart(dailyData, mode = 'spend-leads') {
    const canvas = document.getElementById('mainChart');
    const ctx = canvas.getContext('2d');
    const sorted = [...dailyData].sort((a, b) => a.date.localeCompare(b.date));
    const chartEmpty = document.getElementById('chart-empty');
    const chartCont = document.getElementById('chart-container');
    const chartSub = document.getElementById('chart-subtitle');

    if (sorted.length === 0) {
        chartEmpty.classList.remove('hidden');
        chartCont.classList.add('hidden');
        return;
    }

    chartEmpty.classList.add('hidden');
    chartCont.classList.remove('hidden');
    chartSub.textContent = sorted.length === 1
        ? `Datos del ${sorted[0].date}`
        : `Histórico de ${sorted.length} días`;

    const isLight = document.body.classList.contains('light-mode');
    const chartTextColor   = isLight ? '#1e293b' : '#f0f4ff';
    const chartGridColor   = isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.04)';
    const chartTooltipBg   = isLight ? 'rgba(255,255,255,0.97)' : 'rgba(14, 14, 40, 0.97)';
    const chartTooltipBorder = isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.08)';
    const chartTooltipText = isLight ? '#1e293b' : '#f0f4ff';
    const chartTooltipSub  = isLight ? '#64748b' : '#8b9bbf';

    const labels = sorted.map(a => {
        if (!a.date) return '';
        const parts = a.date.split('-');
        return parts.length === 3 ? `${parts[2]}/${parts[1]}` : a.date;
    });

    if (mainChart) mainChart.destroy();

    const makeGrad = (r, g, b, a1, a2) => {
        const gr = ctx.createLinearGradient(0, 0, 0, 300);
        gr.addColorStop(0, `rgba(${r},${g},${b},${a1})`);
        gr.addColorStop(1, `rgba(${r},${g},${b},${a2})`);
        return gr;
    };

    const gradSpend  = makeGrad(138, 38, 133, 0.85, 0.05);
    const gradLeads  = makeGrad(232, 63, 88, 0.4, 0.0);
    const gradCtr    = makeGrad(238, 112, 35, 0.85, 0.05);
    const gradClicks = makeGrad(138, 38, 133, 0.4, 0.0);

    let datasets, scales;
    if (mode === 'spend-leads') {
        datasets = [
            {
                type: 'bar', label: 'Spend ($)',
                data: sorted.map(a => a.spend),
                backgroundColor: gradSpend, borderColor: 'transparent',
                borderWidth: 0, borderRadius: 4, borderSkipped: false,
                yAxisID: 'yLeft', order: 2,
            },
            {
                type: 'line',
                label: currentTab === 'google' ? 'Conversions' : (currentTab === 'general' ? 'Leads + Convs' : 'Leads'),
                data: sorted.map(a => Math.round(a.leads)),
                borderColor: '#E83F58', backgroundColor: gradLeads,
                borderWidth: 3, tension: 0.4,
                pointBackgroundColor: '#E83F58', pointBorderColor: '#E83F58',
                pointBorderWidth: 2, pointRadius: 0, pointHoverRadius: 6,
                fill: true, yAxisID: 'yRight', order: 1,
            },
        ];
        scales = {
            yLeft: {
                type: 'linear', position: 'left',
                ticks: { color: '#8A2685', callback: v => '$' + v.toLocaleString() },
                grid: { color: chartGridColor }, border: { color: 'transparent' },
            },
            yRight: {
                type: 'linear', position: 'right', beginAtZero: true,
                ticks: { color: '#E83F58', stepSize: 1, precision: 0 },
                grid: { drawOnChartArea: false }, border: { color: 'transparent' },
            },
        };
    } else {
        datasets = [
            {
                type: 'bar', label: 'CTR (%)',
                data: sorted.map(a => a.ctr),
                backgroundColor: gradCtr, borderColor: 'transparent',
                borderWidth: 0, borderRadius: 4, borderSkipped: false,
                yAxisID: 'yLeft', order: 2,
            },
            {
                type: 'line', label: 'Link Clicks',
                data: sorted.map(a => a.linkClicks),
                borderColor: '#8A2685', backgroundColor: gradClicks,
                borderWidth: 3, tension: 0.4,
                pointBackgroundColor: '#8A2685', pointBorderColor: '#8A2685',
                pointBorderWidth: 2, pointRadius: 0, pointHoverRadius: 6,
                fill: true, yAxisID: 'yRight', order: 1,
            },
        ];
        scales = {
            yLeft: {
                type: 'linear', position: 'left',
                ticks: { color: '#EE7023', callback: v => v.toFixed(2) + '%' },
                grid: { color: chartGridColor }, border: { color: 'transparent' },
            },
            yRight: {
                type: 'linear', position: 'right', beginAtZero: true,
                ticks: { color: '#8A2685' },
                grid: { drawOnChartArea: false }, border: { color: 'transparent' },
            },
        };
    }

    mainChart = new Chart(ctx, {
        data: { labels, datasets },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 0 },
            transitions: {
                hide: { animation: { duration: 400, easing: 'easeInOutQuart' } },
                show: { animation: { duration: 400, easing: 'easeInOutQuart' } },
            },
            interaction: { mode: 'index', intersect: false },
            plugins: {
                legend: {
                    labels: { color: chartTextColor, font: { size: 12, weight: '600' }, padding: 10, usePointStyle: true, pointStyle: 'circle', boxWidth: 10, boxHeight: 10 },
                },
                tooltip: {
                    usePointStyle: true, boxWidth: 10, boxHeight: 10,
                    backgroundColor: chartTooltipBg, borderColor: chartTooltipBorder, borderWidth: 1,
                    titleColor: chartTooltipText, bodyColor: chartTooltipSub, padding: 14, cornerRadius: 10, displayColors: true,
                    callbacks: {
                        label(ctx) {
                            const v = ctx.parsed.y;
                            if (ctx.dataset.label === 'Spend ($)') return ` Spend: $${v.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}`;
                            if (ctx.dataset.label === 'CTR (%)') return ` CTR: ${v.toFixed(1)}%`;
                            return ` ${ctx.dataset.label}: ${v.toLocaleString('en-US')}`;
                        },
                    },
                },
            },
            scales: {
                x: {
                    ticks: { color: chartTooltipSub, maxRotation: 35, font: { size: 10 } },
                    grid: { color: chartGridColor }, border: { color: chartTooltipBorder },
                },
                ...scales,
            },
        },
    });
}

/* ── UI — Tables ─────────────────────────────────────────────── */

function renderGenericTable({ tbodyId, countId, thSelector, sortState, data, countLabel, emptyHtml, rowFn }) {
    const tbody = document.getElementById(tbodyId);
    if (countId) {
        const count = document.getElementById(countId);
        if (count) count.textContent = `${data.length} ${countLabel}${data.length !== 1 ? (countLabel.endsWith('o') ? 's' : 's') : ''}`;
    }
    if (thSelector && sortState) {
        document.querySelectorAll(thSelector).forEach(t => {
            t.classList.remove('sort-asc', 'sort-desc');
            if (t.dataset.col === sortState.col) t.classList.add(sortState.dir === 'asc' ? 'sort-asc' : 'sort-desc');
        });
    }
    renderRows(tbody, data, rowFn, emptyHtml);
}

function renderTable(adsData) {
    renderGenericTable({
        tbodyId: 'ads-table-body', countId: 'table-count', countLabel: 'anuncio',
        data: adsData, emptyHtml: '<tr class="empty-row"><td colspan="9">No se encontraron anuncios para los criterios actuales</td></tr>',
        rowFn: (ad) => {
            const previewHtml = ad.thumbnail
                ? `<div class="ad-preview-wrap"><img src="${escHtml(ad.thumbnail)}" class="ad-preview-img" alt="preview" loading="lazy"></div>`
                : `<div class="ad-preview-wrap empty"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg></div>`;
            let statusText = ad.status, statusColor = 'var(--text-3)';
            if (ad.status === 'ACTIVE')    { statusText = 'Active';    statusColor = 'var(--green)'; }
            if (ad.status === 'PAUSED')    { statusText = 'Paused';    statusColor = 'var(--text-3)'; }
            if (ad.status === 'ARCHIVED')  { statusText = 'Archived';  statusColor = 'var(--purple)'; }
            const p = ad.prev;
            const alertHtml = ad.noLeads7d
                ? '<span class="alert-7d">🚨 7d No Leads</span>'
                : '<span style="color:var(--text-3)">—</span>';
            return `<tr style="animation-delay:0ms">
                <td class="preview-cell">${previewHtml}</td>
                <td class="ad-name-cell col-name" title="${escHtml(ad.adName)}">${escHtml(ad.adName)}</td>
                <td class="col-name" style="color:var(--text-3); font-size:0.85rem; font-weight:500" title="${escHtml(ad.accountName)}">${escHtml(ad.accountName)}</td>
                <td style="color:${statusColor}; font-weight:bold; font-size:0.8rem;">${escHtml(statusText)}</td>
                <td class="currency">${fmt.currency(ad.spend)}${p ? delta(ad.spend, p.spend) : ''}</td>
                <td class="leads-cell ${ad.leads > 0 ? 'has-leads' : ''}">${ad.leads}${p ? delta(ad.leads, p.leads) : ''}</td>
                <td class="currency">${ad.cpl !== null ? fmt.currency(ad.cpl) : 'N/A'}${p ? delta(ad.cpl, p.cpl, true) : ''}</td>
                <td class="currency">${ad.cpc !== null ? fmt.currency(ad.cpc) : 'N/A'}${p ? delta(ad.cpc, p.cpc, true) : ''}</td>
                <td>${alertHtml}</td>
            </tr>`;
        }
    });
}

function delta(current, prev, invert = false) {
    if (prev === null || prev === undefined || prev === 0 || current === null) return '';
    const pct = ((current - prev) / Math.abs(prev)) * 100;
    const positive = invert ? pct < 0 : pct >= 0;
    const color = positive ? 'var(--delta-pos)' : 'var(--delta-neg)';
    const sign = pct >= 0 ? '+' : '';
    return `<span class="kpi-delta" style="color:${color}">${sign}${pct.toFixed(0)}%</span>`;
}

function renderAccountsTable(accountsData) {
    renderGenericTable({
        tbodyId: 'accounts-table-body', countId: 'accounts-count', countLabel: 'account',
        thSelector: 'th.sortable-acc', sortState: sortStateAcc,
        data: accountsData, emptyHtml: '<tr class="empty-row"><td colspan="10">No accounts found for the current criteria</td></tr>',
        rowFn: (acc) => {
            let metaStat = acc.accountStatus != null ? metaStatusInfo(acc.accountStatus) : null;
            if (acc.isPausadaMeta && metaStat && metaStat.cls === 'acct-active') {
                metaStat.label = 'Paused'; metaStat.cls = 'acct-paused';
            }
            const p = acc.prev;
            return `<tr style="animation-delay:0ms">
                <td class="col-name" title="${escHtml(acc.accountName)}">${escHtml(acc.accountName)}</td>
                <td>${acctStatusBadge(metaStat)}</td>
                <td>${escHtml(acc.fecha)}</td>
                <td>${escHtml(acc.categoria)}</td>
                <td class="currency">${acc.budget > 0 ? fmt.currency(acc.budget) : '-'}</td>
                <td>${complianceCellHtml(acc.spend, acc.budget)}</td>
                <td class="currency">${fmt.currency(acc.spend)}${p ? delta(acc.spend, p.spend) : ''}</td>
                <td class="leads-cell ${acc.leads > 0 ? 'has-leads' : ''}">${acc.leads}${p ? delta(acc.leads, p.leads) : ''}</td>
                <td class="currency">${acc.cpl !== null && acc.cpl > 0 ? fmt.currency(acc.cpl) : 'N/A'}${p ? delta(acc.cpl, p.cpl, true) : ''}</td>
                <td class="currency">${acc.cpc !== null && acc.cpc > 0 ? fmt.currency(acc.cpc) : 'N/A'}${p ? delta(acc.cpc, p.cpc, true) : ''}</td>
            </tr>`;
        }
    });
}

function escHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

/* ── UI — Sorting ───────────────────────────────────────────── */

function sortData(data, col, dir) {
    return [...data].sort((a, b) => {
        let va = a[col], vb = b[col];
        if (va === null) va = -Infinity;
        if (vb === null) vb = -Infinity;
        if (typeof va === 'boolean') va = va ? 1 : 0;
        if (typeof vb === 'boolean') vb = vb ? 1 : 0;
        if (typeof va === 'string') return dir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
        return dir === 'asc' ? va - vb : vb - va;
    });
}

function applySortUI(col, dir) {
    document.querySelectorAll('th.sortable').forEach(th => {
        th.classList.remove('sort-asc', 'sort-desc');
        if (th.dataset.col === col) th.classList.add(dir === 'asc' ? 'sort-asc' : 'sort-desc');
    });
}

function applySortUIAcc(col, dir) {
    document.querySelectorAll('th.sortable-acc').forEach(th => {
        th.classList.remove('sort-asc', 'sort-desc');
        if (th.dataset.col === col) th.classList.add(dir === 'asc' ? 'sort-asc' : 'sort-desc');
    });
}

/* ── UI — CSV Export ────────────────────────────────────────── */

function exportCSV(adsData, accountName) {
    const headers = ['Ad Name', 'Account Name', 'Status', 'Amount Spent', 'Leads', 'Cost per Lead', 'CPC', '7d Alert'];
    const rows = adsData.map(a => [
        `"${a.adName.replace(/"/g, '""')}"`,
        `"${a.accountName.replace(/"/g, '""')}"`,
        a.status,
        a.spend.toFixed(1),
        a.leads,
        a.cpl !== null ? a.cpl.toFixed(1) : '',
        a.cpc !== null ? a.cpc.toFixed(1) : '',
        a.noLeads7d ? '7d No Leads' : ''
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ads-${(accountName || 'export').replace(/\s+/g, '-')}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    if (window.showToast) window.showToast('CSV Exported');
}

/* ── UI — Loading / Error States ────────────────────────────── */

function setLoading(show) {
    if (show) {
        const skeRow = `<tr class="empty-row"><td colspan="12" style="padding: 16px;"><div class="skeleton" style="height: 24px; width: 100%;"></div></td></tr>`;
        document.querySelectorAll('tbody').forEach(b => {
            if (b.id !== 'kws-table-body') b.innerHTML = skeRow.repeat(3);
        });
        const skeVal = `<div class="skeleton" style="height: 32px; width: 60%; margin-top:4px;"></div>`;
        document.querySelectorAll('.kpi-value').forEach(el => el.innerHTML = skeVal);
    }
}

function showError(message) {
    const overlay = document.getElementById('error-overlay');
    if (message) document.getElementById('error-message').textContent = message;
    overlay.classList.remove('hidden');
}

function resetDashboard() {
    currentAdsData = [];
    currentDailyData = [];
    currentAccountsData = [];
    if (mainChart) { mainChart.destroy(); mainChart = null; }
    updateKPICards([]);
    renderTable([]);
    renderAccountsTable([]);
    document.getElementById('chart-empty').classList.remove('hidden');
    document.getElementById('chart-container').classList.add('hidden');
    document.getElementById('table-count').textContent = '—';
    document.getElementById('accounts-count').textContent = '—';
    document.getElementById('footer-update-time').textContent = 'Loading...';
    document.getElementById('footer-account-name').textContent = 'No account selected';
}

/* ── Init ───────────────────────────────────────────────────── */

async function init() {
    setLoading(true);
    try {
        let fetchedAccounts = await fetchAdAccounts();
        const misCuentasPermitidas = [
            'act_951413483945685', 'act_1159707378040111', 'act_2306771323018151',
            'act_1222146353201614', 'act_674548406819081', 'act_376245277862263',
            'act_1462113892114326', 'act_358511638121551', 'act_1074729294779025',
            'act_1200823155221862', 'act_520095449684172', 'act_364446625716525',
            'act_1718797132420704', 'act_8871491509538618', 'act_567417995859866'
        ];
        const activarFiltro = true;
        allAccounts = activarFiltro
            ? fetchedAccounts.filter(acc => misCuentasPermitidas.includes(acc.id))
            : fetchedAccounts;

        const select = document.getElementById('account-select');
        if (!allAccounts || allAccounts.length === 0) {
            select.innerHTML = '<option value="">No ad accounts found</option>';
            setLoading(false);
            return;
        }

        select.innerHTML =
            `<option value="all">— All accounts (${allAccounts.length}) —</option>` +
            allAccounts.map(acc => `<option value="${escHtml(acc.id)}">${escHtml(acc.name)}</option>`).join('');

        // Set the correct tab labels before any data arrives so the KPI
        // headers read "Total Retained" / "Total CPA" from the very first render
        switchTab('general');

        // Start all fetches in parallel
        const metaPromise = fetchAllData();
        const auxPromise = Promise.all([fetchGoogleData(), fetchRetainedData()]);

        await metaPromise;

        // Then update again once Google + Retained finish
        await auxPromise;

        const googleOnlyAccounts = Object.entries(GOOGLE_ACCOUNTS)
            .filter(([cid, v]) => v.metaId && v.metaId.startsWith('google_'));
        for (const [googleCid, v] of googleOnlyAccounts) {
            const name = googleAccountNames[googleCid] || googleCid;
            const opt = document.createElement('option');
            opt.value = v.metaId;
            opt.textContent = name;
            select.appendChild(opt);
        }
        if (googleOnlyAccounts.length > 0) {
            select.options[0].textContent = `— All accounts (${allAccounts.length + googleOnlyAccounts.length}) —`;
        }

        applyCurrentTab();
    } catch (err) {
        setLoading(false);
        if (isTokenError(err)) {
            showError('Please update the ACCESS_TOKEN in app.js and reload the page.');
        } else if (err.isNetwork) {
            showError(err.message);
        } else {
            showError(`Error loading accounts: ${err.message}`);
        }
    }
}

async function fetchAllData() {
    const myGeneration = ++fetchGeneration;
    setLoading(true);
    document.getElementById('badge-loading').classList.remove('hidden');
    globalAdsData = [];
    globalDailyData = [];
    globalAccountsData = [];
    window.lastFetchTime = Date.now();

    const datePreset = document.getElementById('date-select').value;

    // ── Phase 1: Main insights only (spend, leads, daily chart) ─────────
    // Renders the dashboard immediately with 2 requests per account
    // instead of waiting for 6. Creatives, prev period, and 7d alerts
    // are loaded in Phase 2 and merged in-place.
    const phase1 = allAccounts.map(async (acc) => {
        try {
            const accPreset = capPreset(acc.id, datePreset);
            const accLimit  = ACCOUNT_PAGE_LIMIT[acc.id] || 500;
            const [rawAdData, rawDailyData] = await Promise.all([
                fetchInsights(acc.id, accPreset, { level: 'ad',       limit: accLimit }),
                fetchInsights(acc.id, accPreset, { level: 'campaign', timeIncrement: 1, limit: accLimit }),
            ]);

            if (myGeneration !== fetchGeneration) return;

            const filteredAds   = rawAdData.filter(ad => isCampaignAllowed(ad.campaign_id, ad.campaign_name));
            const filteredDaily = rawDailyData.filter(d  => isCampaignAllowed(d.campaign_id, d.campaign_name));

            // Process ads without creatives/prev — enriched in Phase 2
            const pAds = filteredAds.map(ad => {
                const processed = processAd(ad, {}, acc.id);
                processed.prev      = null;
                processed.noLeads7d = false;
                return processed;
            });
            const pDaily = filteredDaily.map(row => processDaily(row, acc.id));

            globalAdsData.push(...pAds);
            globalDailyData.push(...pDaily);

            // Single pass accumulation for account-level metrics
            let accSpend = 0, accReach = 0, accImpressions = 0, accLinkClicks = 0, accLeads = 0;
            for (const row of pDaily) {
                accSpend       += row.spend;
                accReach       += row.reach;
                accImpressions += row.impressions;
                accLinkClicks  += row.linkClicks;
                accLeads       += row.leads;
            }

            const accCtr = accImpressions > 0 ? (accLinkClicks / accImpressions) * 100 : 0;
            const accCpc = accLinkClicks > 0 ? accSpend / accLinkClicks : null;
            const accCpl = accLeads > 0 ? accSpend / accLeads : null;

            const meta = METADATOS_CUENTAS[acc.id] || { fecha: '-', plataformas: '-', categoria: '-', budget: 0 };
            const budgetPct = meta.budget > 0 ? (accSpend / meta.budget) * 100 : 0;
            const hasCamps = acc.campaigns && acc.campaigns.data && acc.campaigns.data.length > 0;
            const isPausadaMeta = hasCamps && !acc.campaigns.data.some(c => c.status === 'ACTIVE');

            globalAccountsData.push({
                accountId: acc.id,
                accountName: acc.name,
                accountStatus: acc.account_status != null ? parseInt(acc.account_status) : null,
                isPausadaMeta,
                fecha: meta.fecha,
                plataformas: meta.plataformas,
                categoria: meta.categoria,
                budget: meta.budget,
                budgetPct,
                compliance: complianceRatio(accSpend, meta.budget),
                reach: accReach,
                spend: accSpend,
                impressions: accImpressions,
                linkClicks: accLinkClicks,
                leads: accLeads,
                ctr: accCtr,
                cpc: accCpc,
                cpl: accCpl,
                prev: null, // filled in Phase 2
            });
        } catch (e) {
            console.error(`[Dashboard] Error cargando cuenta "${acc.name}" (${acc.id}):`, e.message || e);
        }
    });

    await Promise.allSettled(phase1);
    if (myGeneration !== fetchGeneration) return;

    // Show main data immediately — users see numbers without waiting for
    // thumbnails, trend arrows, or 7d alert badges
    applyCurrentTab();
    setLoading(false);
    document.getElementById('badge-loading').classList.add('hidden');

    // ── Phase 2: Secondary data (creatives cached, prev period, 7d alerts) ─
    // alert7dParam is the same for all accounts — compute once
    const t7 = new Date(); t7.setHours(0, 0, 0, 0);
    const e7 = new Date(t7); e7.setDate(e7.getDate() - 1);
    const s7 = new Date(e7); s7.setDate(s7.getDate() - 6);
    const alert7dParam = `time_range=${encodeURIComponent(JSON.stringify({ since: toLocalISO(s7), until: toLocalISO(e7) }))}`;

    const phase2 = allAccounts.map(async (acc) => {
        try {
            const accPreset   = capPreset(acc.id, datePreset);
            const accPrevParam = getPreviousPeriodParam(accPreset);
            const [creativesMap, prevMetrics, prevAdMap, alert7dMap] = await Promise.all([
                fetchAdCreatives(acc.id), // served from cache on subsequent filter changes
                accPrevParam ? fetchPreviousInsights(acc.id, accPrevParam)   : Promise.resolve(null),
                accPrevParam ? fetchPreviousAdInsights(acc.id, accPrevParam) : Promise.resolve({}),
                fetch7dAlertData(acc.id, alert7dParam),
            ]);

            if (myGeneration !== fetchGeneration) return;

            // Enrich ads in-place (currentAdsData holds the same object refs)
            for (const ad of globalAdsData) {
                if (ad.accountId !== acc.id) continue;
                const cr = creativesMap[ad.adId];
                if (cr) { ad.thumbnail = cr.thumbnail; ad.status = cr.status; }
                ad.prev      = prevAdMap[ad.adId] || null;
                const a7d    = alert7dMap[ad.adId];
                ad.noLeads7d = a7d ? (a7d.spend > 0 && a7d.leads === 0) : false;
            }

            // Update account-level prev metrics
            const accEntry = globalAccountsData.find(a => a.accountId === acc.id);
            if (accEntry) accEntry.prev = prevMetrics;
        } catch (e) {
            console.error(`[Dashboard] Error en datos secundarios "${acc.name}" (${acc.id}):`, e.message || e);
        }
    });

    await Promise.allSettled(phase2);
    if (myGeneration !== fetchGeneration) return;
    applyCurrentTab(); // Re-render with enriched data (thumbnails, trends, alerts)
}

/* ── Google Ads — Data ──────────────────────────────────────── */

function parseCSV(text) {
    if (!text) return [];
    const lines = [];
    let cur = '', inQ = false;
    for (const ch of text + '\n') {
        if (ch === '"' || ch === '“' || ch === '”') inQ = !inQ;
        else if (ch === '\n' && !inQ) { lines.push(cur); cur = ''; }
        else cur += ch;
    }
    if (lines.length < 1) return [];

    const parseRow = line => {
        const cells = []; let cell = '', q = false;
        const s = (line || '') + ',';
        for (let i = 0; i < s.length; i++) {
            const ch = s[i];
            if (ch === '"' || ch === '“' || ch === '”') {
                q = !q;
            } else if (ch === ',' && !q) {
                // Remove wrapping quotes and trim
                cells.push(cell.trim().replace(/^["“']|["”']$/g, '').trim());
                cell = '';
            } else {
                cell += ch;
            }
        }
        return cells;
    };

    const rawHeaders = parseRow(lines[0] || '');
    // Normalize: "Account ID" -> "account_id"
    const headers = rawHeaders.map(h => (h || '').toLowerCase().trim().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, ''));

    return lines.slice(1).filter(l => l.trim()).map(lineContent => {
        const vals = parseRow(lineContent);
        if (vals.length > headers.length && headers.includes('account_name')) {
            // Heuristic: If we have too many columns, someone forgot quotes on a name with a comma
            // e.g. [id, "Apple", "LLC", "ENABLED"] -> merge 1 and 2 if header[1] is name
            const nameIdx = headers.indexOf('account_name');
            if (nameIdx !== -1) {
                const extra = vals.length - headers.length;
                const mergedName = vals.slice(nameIdx, nameIdx + extra + 1).join(', ');
                vals.splice(nameIdx, extra + 1, mergedName);
            }
        }
        const obj = {};
        headers.forEach((h, i) => { if (h) obj[h] = (vals[i] || '').trim(); });
        return obj;
    });
}

async function fetchGoogleSheetTab(sheetName) {
    const url = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`Sheet "${sheetName}" not accessible`);
    return parseCSV(await resp.text());
}

async function fetchGoogleData() {
    if (!GOOGLE_SHEET_ID || GOOGLE_SHEET_ID === 'TU_SHEET_ID_AQUI') return;
    try {
        const [accounts, daily, keywords] = await Promise.all([
            fetchGoogleSheetTab('accounts'),
            fetchGoogleSheetTab('daily'),
            fetchGoogleSheetTab('keywords'),
        ]);
        googleAccountNames = {};
        googleAccountInfo = {};
        for (const r of accounts) {
            const accId = r.account_id || r.id || r.customer_id;
            if (!accId) continue;
            googleAccountNames[accId] = r.account_name || r.name || r.customer_name || accId;
            const basicStatus = r.account_status || r.status || 'ACTIVE';
            googleAccountInfo[accId] = {
                status: basicStatus,
                hasActiveCampaigns: (r.has_active_campaigns || 'YES').toUpperCase()
            };
        }
        googleRawDaily = daily.map(r => ({
            accountId: r.account_id,
            date: r.date,
            impressions: parseInt(r.impressions) || 0,
            clicks: parseInt(r.clicks) || 0,
            cost: parseFloat(r.cost) || 0,
            conversions: parseFloat(r.conversions) || 0,
        }));
        googleRawKeywords = keywords.map(r => ({
            accountId: r.account_id,
            accountName: googleAccountNames[r.account_id] || r.account_id,
            period: r.period,
            keyword: r.keyword,
            matchType: r.match_type,
            campaign: r.campaign,
            adGroup: r.ad_group,
            impressions: parseInt(r.impressions) || 0,
            clicks: parseInt(r.clicks) || 0,
            cost: parseFloat(r.cost) || 0,
            conversions: parseFloat(r.conversions) || 0,
            ctr: parseFloat(r.ctr) || 0,
            avgCpc: parseFloat(r.avg_cpc) || 0,
            costPerConv: parseFloat(r.cost_per_conv) || 0,
        }));
    } catch (e) {
        console.warn('Google Ads Sheet not available:', e.message);
    }
}

async function fetchRetainedData() {
    if (!RETAINED_SHEET_ID) return;
    try {
        const url = `https://docs.google.com/spreadsheets/d/${RETAINED_SHEET_ID}/gviz/tq?tqx=out:csv&sheet=Sheet1`;
        const resp = await fetch(url);
        if (!resp.ok) return;
        const rows = parseCSV(await resp.text());
        retainedRawRows = rows
            .map(r => ({
                accountId: RETAINED_BOARD_IDS[String(r.board_id || '').trim()],
                date: String(r.date || '').trim().split(' ')[0],
            }))
            .filter(r => r.accountId);
    } catch (e) {
        console.warn('Could not fetch retained data:', e);
    }
}

function computeRetainedByAccount(since, until) {
    const result = {};
    for (const r of retainedRawRows) {
        if (since && r.date < since) continue;
        if (until && r.date > until) continue;
        result[r.accountId] = (result[r.accountId] || 0) + 1;
    }
    return result;
}

function getGooglePrevDateRange(preset) {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    let since, until;
    if (preset === 'last_7d') {
        until = new Date(today); until.setDate(until.getDate() - 7);
        since = new Date(today); since.setDate(since.getDate() - 14);
    } else if (preset === 'last_14d') {
        until = new Date(today); until.setDate(until.getDate() - 14);
        since = new Date(today); since.setDate(since.getDate() - 28);
    } else if (preset === 'last_30d') {
        until = new Date(today); until.setDate(until.getDate() - 30);
        since = new Date(today); since.setDate(since.getDate() - 60);
    } else if (preset === 'this_month' || preset === 'this_month_today') {
        since = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        until = new Date(today.getFullYear(), today.getMonth(), 0);
    } else if (preset === 'last_month') {
        since = new Date(today.getFullYear(), today.getMonth() - 2, 1);
        until = new Date(today.getFullYear(), today.getMonth() - 1, 0);
    } else if (preset === 'this_year') {
        since = new Date(today.getFullYear() - 1, 0, 1);
        until = new Date(today.getFullYear() - 1, 11, 31);
    } else { return null; }
    return { since: toLocalISO(since), until: toLocalISO(until) };
}

function getGoogleDateRange(preset) {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    if (preset === 'last_7d') {
        const s = new Date(today); s.setDate(s.getDate() - 7);
        const e = new Date(today); e.setDate(e.getDate() - 1);
        return { since: toLocalISO(s), until: toLocalISO(e) };
    } else if (preset === 'last_14d') {
        const s = new Date(today); s.setDate(s.getDate() - 14);
        const e = new Date(today); e.setDate(e.getDate() - 1);
        return { since: toLocalISO(s), until: toLocalISO(e) };
    } else if (preset === 'last_30d') {
        const s = new Date(today); s.setDate(s.getDate() - 30);
        const e = new Date(today); e.setDate(e.getDate() - 1);
        return { since: toLocalISO(s), until: toLocalISO(e) };
    } else if (preset === 'this_month_today') {
        return { since: toLocalISO(new Date(today.getFullYear(), today.getMonth(), 1)), until: toLocalISO(today) };
    } else if (preset === 'this_month') {
        const start = new Date(today.getFullYear(), today.getMonth(), 1);
        let end = new Date(today); end.setDate(end.getDate() - 1);
        if (end < start) end = start;
        return { since: toLocalISO(start), until: toLocalISO(end) };
    } else if (preset === 'last_month') {
        const s = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const u = new Date(today.getFullYear(), today.getMonth(), 0);
        return { since: toLocalISO(s), until: toLocalISO(u) };
    } else if (preset === 'this_year') {
        return { since: toLocalISO(new Date(today.getFullYear(), 0, 1)), until: toLocalISO(today) };
    } else if (preset === 'custom') {
        return { since: document.getElementById('date-start').value, until: document.getElementById('date-end').value };
    } else if (preset === 'maximum') {
        return { since: '2024-01-01', until: '2029-12-31' }; // Wide range for maximum
    }
    return null;
}

function computeGoogleAccountsData(preset, filterMetaId = null, explicitRange = null) {
    const range = explicitRange || getGoogleDateRange(preset);
    let rows = googleRawDaily;
    if (range) rows = rows.filter(r => r.date >= range.since && r.date <= range.until);
    if (filterMetaId && filterMetaId !== 'all') {
        const entry = Object.entries(GOOGLE_ACCOUNTS).find(([, v]) => v.metaId === filterMetaId);
        if (entry) rows = rows.filter(r => r.accountId === entry[0]);
        else rows = [];
    }
    const byAcc = {};
    for (const r of rows) {
        if (!byAcc[r.accountId]) byAcc[r.accountId] = { imp: 0, clicks: 0, cost: 0, conv: 0, daily: [] };
        byAcc[r.accountId].imp     += r.impressions;
        byAcc[r.accountId].clicks  += r.clicks;
        byAcc[r.accountId].cost    += r.cost;
        byAcc[r.accountId].conv    += r.conversions;
        byAcc[r.accountId].daily.push(r);
    }
    return Object.entries(byAcc).map(([cid, m]) => {
        let fecha = '-', categoria = '-';
        const budget = GOOGLE_BUDGETS[cid] || 0;
        const entry = Object.entries(GOOGLE_ACCOUNTS).find(([kc]) => kc === cid);
        if (entry && entry[1] && entry[1].metaId && METADATOS_CUENTAS[entry[1].metaId]) {
            fecha = METADATOS_CUENTAS[entry[1].metaId].fecha || '-';
            categoria = METADATOS_CUENTAS[entry[1].metaId].categoria || '-';
        }
        const statusObj = googleStatusInfo(googleAccountInfo[cid]?.status, googleAccountInfo[cid]?.hasActiveCampaigns, m.imp, m.cost);
        return {
            accountId: cid,
            accountName: googleAccountNames[cid] || cid,
            statusObj,
            statusSort: statusObj.label,
            fecha, categoria, budget,
            impressions: m.imp,
            clicks: m.clicks,
            cost: m.cost,
            conversions: m.conv,
            avgCpc: m.clicks > 0 ? m.cost / m.clicks : null,
            costPerConv: m.conv > 0 ? m.cost / m.conv : null,
            daily: m.daily,
        };
    });
}

function aggregateGoogleForChart(googleAccounts) {
    const byDate = {};
    for (const acc of googleAccounts) {
        for (const r of acc.daily) {
            if (!byDate[r.date]) byDate[r.date] = { date: r.date, spend: 0, leads: 0, linkClicks: 0, impressions: 0, ctr: 0 };
            byDate[r.date].spend       += r.cost;
            byDate[r.date].leads       += r.conversions;
            byDate[r.date].linkClicks  += r.clicks;
            byDate[r.date].impressions += r.impressions;
        }
    }
    const rows = Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date));
    rows.forEach(r => { r.ctr = r.impressions > 0 ? (r.linkClicks / r.impressions) * 100 : 0; });
    return rows;
}

function aggregateCombinedForChart(metaDailyData, googleAccounts) {
    const byDate = {};
    const add = (date, spend, leads, clicks, impressions) => {
        if (!byDate[date]) byDate[date] = { date, spend: 0, leads: 0, linkClicks: 0, impressions: 0, ctr: 0 };
        byDate[date].spend       += spend;
        byDate[date].leads       += leads;
        byDate[date].linkClicks  += clicks;
        byDate[date].impressions += impressions;
    };
    for (const r of metaDailyData) add(r.date, r.spend, r.leads, r.linkClicks, r.impressions);
    for (const acc of googleAccounts) {
        for (const r of acc.daily) add(r.date, r.cost, r.conversions, r.clicks, r.impressions);
    }
    const rows = Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date));
    rows.forEach(r => { r.ctr = r.impressions > 0 ? (r.linkClicks / r.impressions) * 100 : 0; });
    return rows;
}

/* ── Google Ads — Tab Views ─────────────────────────────────── */

function switchTab(tab) {
    currentTab = tab;
    let activeBtn = null;
    document.querySelectorAll('.tab-btn').forEach(b => {
        const isActive = b.dataset.tab === tab;
        b.classList.toggle('active', isActive);
        if (isActive) activeBtn = b;
    });

    if (activeBtn) {
        const ind = document.getElementById('tab-indicator');
        if (ind) {
            ind.style.width = `${activeBtn.offsetWidth}px`;
            ind.style.left = `${activeBtn.offsetLeft}px`;
        }
    }

    const adsSection = document.getElementById('ads-table-section');
    const kwSection  = document.getElementById('keywords-section');

    const labels = {
        general: { leads: 'Leads + Convs', cpl: 'Cost / Conv',        impressions: 'Total Retained', clicks: 'Total CPA' },
        meta:    { leads: 'Total Leads',   cpl: 'Avg Cost per Lead',   impressions: 'Impressions',    clicks: 'Link Clicks' },
        google:  { leads: 'Conversions',   cpl: 'Cost / Conv',         impressions: 'Impressions',    clicks: 'Clicks' },
    };
    const l = labels[tab];
    document.getElementById('label-leads').textContent = l.leads;
    document.getElementById('label-cpl').textContent   = l.cpl;
    const labelImpressions = document.getElementById('label-reach');
    if (labelImpressions) labelImpressions.textContent = l.impressions;
    const labelClicks = document.getElementById('label-clicks');
    if (labelClicks) labelClicks.textContent = l.clicks;

    const thead = document.getElementById('accounts-thead');
    const thG   = (col, lbl) => `<th class="sortable-g"   data-col="${col}">${lbl} <span class="sort-icon">↕</span></th>`;
    const thGen = (col, lbl) => `<th class="sortable-gen" data-col="${col}">${lbl} <span class="sort-icon">↕</span></th>`;
    const thA   = (col, lbl) => `<th class="sortable-acc" data-col="${col}">${lbl} <span class="sort-icon">↕</span></th>`;

    if (tab === 'google') {
        adsSection.classList.add('hidden');
        kwSection.classList.remove('hidden');
        thead.innerHTML = `<tr>
            <th class="col-name sortable-g" data-col="accountName">Account <span class="sort-icon">↕</span></th>
            ${thG('statusSort','Status')}
            ${thG('fecha','Start Date')}${thG('categoria','Category')}
            ${thG('budget','Monthly Budget')}${thG('compliance','% Budget Used')}
            ${thG('cost','Cost')}${thG('conversions','Convs')}${thG('costPerConv','Cost/Conv')}
            ${thG('impressions','Impr')}${thG('avgCpc','CPC')}
        </tr>`;
        document.querySelectorAll('#accounts-thead th.sortable-g').forEach(t => {
            t.addEventListener('click', () => {
                const col = t.dataset.col;
                if (sortStateG.col === col) sortStateG.dir = sortStateG.dir === 'desc' ? 'asc' : 'desc';
                else { sortStateG.col = col; sortStateG.dir = 'desc'; }
                renderGoogleAccountsTable(sortData(currentGoogleAccounts, sortStateG.col, sortStateG.dir));
            });
        });
    } else if (tab === 'general') {
        adsSection.classList.add('hidden');
        kwSection.classList.add('hidden');
        thead.innerHTML = `<tr>
            <th class="col-name sortable-gen" data-col="accountName">Account <span class="sort-icon">↕</span></th>
            <th>Status</th>
            <th>Platforms</th>
            ${thGen('fecha','Start Date')}${thGen('categoria','Category')}
            ${thGen('budget','Budget')}${thGen('compliance','% Budget Used')}
            ${thGen('spend','Total Spend')}${thGen('convs','Leads')}${thGen('cpl','CPL')}
            ${thGen('retained','Retained')}${thGen('cpa','CPA')}
        </tr>`;
        document.querySelectorAll('#accounts-thead th.sortable-gen').forEach(t => {
            t.addEventListener('click', () => {
                const col = t.dataset.col;
                if (sortStateGen.col === col) sortStateGen.dir = sortStateGen.dir === 'desc' ? 'asc' : 'desc';
                else { sortStateGen.col = col; sortStateGen.dir = 'desc'; }
                renderGeneralAccountsTable(sortData(currentGeneralRows, sortStateGen.col, sortStateGen.dir));
            });
        });
    } else {
        adsSection.classList.remove('hidden');
        kwSection.classList.add('hidden');
        thead.innerHTML = `<tr>
            <th class="col-name sortable-acc" data-col="accountName">Account <span class="sort-icon">↕</span></th>
            <th>Status</th>
            ${thA('fecha','Start Date')}${thA('categoria','Category')}
            ${thA('budget','Monthly Budget')}${thA('compliance','% Budget Used')}
            ${thA('spend','Spend')}${thA('leads','Leads')}${thA('cpl','Cost/Lead')}${thA('cpc','CPC')}
        </tr>`;
        document.querySelectorAll('#accounts-thead th.sortable-acc').forEach(t => {
            t.addEventListener('click', () => {
                const col = t.dataset.col;
                if (sortStateAcc.col === col) sortStateAcc.dir = sortStateAcc.dir === 'desc' ? 'asc' : 'desc';
                else { sortStateAcc.col = col; sortStateAcc.dir = col === 'accountName' ? 'asc' : 'desc'; }
                applySortUIAcc(sortStateAcc.col, sortStateAcc.dir);
                renderAccountsTable(sortData(currentAccountsData, sortStateAcc.col, sortStateAcc.dir));
            });
        });
    }
    applyCurrentTab();
}

function applyCurrentTab() {
    if (currentTab === 'meta') {
        applyGlobalData();
    } else if (currentTab === 'google') {
        applyGoogleView();
    } else {
        applyGlobalData();
        applyGeneralView();
    }
}

function applyGoogleView() {
    const preset   = document.getElementById('date-select').value;
    const metaAccId = document.getElementById('account-select').value;
    const filterMeta = metaAccId !== 'all' ? metaAccId : null;
    const gAccounts = computeGoogleAccountsData(preset, filterMeta);
    const prevRange = getGooglePrevDateRange(preset);
    const gPrev = prevRange ? computeGoogleAccountsData(preset, filterMeta, prevRange) : [];
    const prevMap = Object.fromEntries(gPrev.map(a => [a.accountId, a]));
    const period = PRESET_TO_GOOGLE_PERIOD[preset] || 'LAST_30_DAYS';

    // Single pass for Google KPIs
    let totalCost = 0, totalConv = 0, totalImpr = 0, totalClk = 0;
    for (const a of gAccounts) { totalCost += a.cost; totalConv += a.conversions; totalImpr += a.impressions; totalClk += a.clicks; }
    let prevCost = 0, prevConv = 0, prevImpr = 0, prevClk = 0;
    for (const a of gPrev) { prevCost += a.cost; prevConv += a.conversions; prevImpr += a.impressions; prevClk += a.clicks; }

    const avgCtr = totalImpr > 0 ? (totalClk / totalImpr) * 100 : 0;
    const avgCpa = totalConv > 0 ? totalCost / totalConv : null;
    const prevCtr = prevImpr > 0 ? (prevClk / prevImpr) * 100 : 0;
    const prevCpa = prevConv > 0 ? prevCost / prevConv : null;

    animateValue('kpi-total-spend', fmt.currency(totalCost));
    if (window.updateKPITrend) window.updateKPITrend('trend-spend', totalCost, prevCost, true);
    animateValue('kpi-total-leads', fmt.int(totalConv));
    if (window.updateKPITrend) window.updateKPITrend('trend-leads', totalConv, prevConv, false);
    animateValue('kpi-avg-cpl', avgCpa !== null ? fmt.currency(avgCpa) : 'N/A');
    if (window.updateKPITrend) window.updateKPITrend('trend-cpl', avgCpa || 0, prevCpa || 0, true);
    animateValue('kpi-avg-ctr', fmt.pct(avgCtr));
    if (window.updateKPITrend) window.updateKPITrend('trend-ctr', avgCtr, prevCtr, false);
    animateValue('kpi-total-impressions', fmt.int(totalImpr));
    if (window.updateKPITrend) window.updateKPITrend('trend-reach', totalImpr, prevImpr, false);
    animateValue('kpi-total-clicks', fmt.int(totalClk));
    if (window.updateKPITrend) window.updateKPITrend('trend-clicks', totalClk, prevClk, false);

    updateSpendBadge('Google Spend', fmt.currency(totalCost));

    const chartDataGoogle = aggregateGoogleForChart(gAccounts);
    renderChart(chartDataGoogle, currentChartMode);
    if (window.drawKPISparklines) window.drawKPISparklines(chartDataGoogle);

    currentGoogleAccounts = gAccounts.map(a => ({
        ...a,
        prev: prevMap[a.accountId] || null,
        sparklineData: window.generateSparklineArray ? window.generateSparklineArray(a.accountId, 'google') : null
    }));
    renderGoogleAccountsTable(sortData(currentGoogleAccounts, sortStateG.col, sortStateG.dir));

    let kws = googleRawKeywords.filter(k => k.period === period);
    if (filterMeta) {
        const entry = Object.entries(GOOGLE_ACCOUNTS).find(([, v]) => v.metaId === filterMeta);
        kws = entry ? kws.filter(k => k.accountId === entry[0]) : [];
    }
    currentGoogleKeywords = kws;
    renderKeywordsTable(kws);
}

/* ── Account status helpers ─────────────────────────────────── */

function metaStatusInfo(code) {
    const map = {
        1: { label: 'Active', cls: 'acct-active' },
        2: { label: 'Disabled', cls: 'acct-paused' },
        3: { label: 'Payment Issue', cls: 'acct-payment' },
        7: { label: 'In Review', cls: 'acct-review' },
        8: { label: 'Closed', cls: 'acct-paused' },
        9: { label: 'Grace Period', cls: 'acct-payment' },
        100: { label: 'Unavailable', cls: 'acct-paused' },
        101: { label: 'Closed', cls: 'acct-paused' },
    };
    return map[parseInt(code)] || { label: 'Unknown', cls: 'acct-paused' };
}

function googleStatusInfo(statusStr, hasActiveCamps, impressions, cost) {
    let s = (statusStr || '').toUpperCase().trim();
    
    // Si aparece 'LLC', 'INC' o fragmentos de nombre, es un error de split en el CSV.
    // Usamos el status por defecto 'Active' y confiamos en hasActiveCamps.
    const looksLikeName = s === 'LLC' || s === 'INC' || s === 'CORP' || s.length < 2;

    if (s.includes('SUSPENDED')) return { label: 'Payment Issue', cls: 'acct-payment' };

    // Explicitly Enabled/Active accounts or if it looks like a name-split error
    if (s.includes('ENABLED') || s.includes('ACTIVE') || s === '' || s === 'ACTIVA' || looksLikeName) {
        if (hasActiveCamps === 'YES' && impressions === 0 && cost === 0) {
            return { label: 'Payment Issue', cls: 'acct-payment' };
        }
        return { label: 'Active', cls: 'acct-active' };
    }

    // Explicitly non-active
    if (s.includes('PAUSED') || s.includes('CANCEL') || s.includes('DETENIDA') || s.includes('SIN CAMPAÑAS')) {
        return { label: 'Paused', cls: 'acct-paused' };
    }

    // Default fallback
    return { label: statusStr || 'Active', cls: s === 'DISABLED' ? 'acct-paused' : 'acct-active' };
}

function acctStatusBadge(info) {
    if (!info) return '<span style="color:var(--text-3)">—</span>';
    return `<span class="acct-status-badge ${info.cls}">${escHtml(info.label)}</span>`;
}

function getPacingDays() {
    const preset = document.getElementById('date-select')?.value || 'this_month';
    const today = new Date();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    if (preset === 'this_month') return [Math.max(1, today.getDate() - 1), daysInMonth];
    if (preset === 'this_month_today') return [today.getDate(), daysInMonth];
    if (preset === 'last_month') { const past = new Date(today.getFullYear(), today.getMonth(), 0); return [past.getDate(), past.getDate()]; }
    if (preset === 'last_7d')  return [7, daysInMonth];
    if (preset === 'last_14d') return [14, daysInMonth];
    if (preset === 'last_30d') return [30, daysInMonth];
    if (preset === 'this_year') {
        const start = new Date(today.getFullYear(), 0, 1);
        return [Math.ceil((today - start) / 86400000), 365];
    }
    if (preset === 'custom') {
        const s = new Date(document.getElementById('date-start').value);
        const e = new Date(document.getElementById('date-end').value);
        if (!isNaN(s) && !isNaN(e)) return [Math.round((e - s) / 86400000) + 1, daysInMonth];
    }
    return [today.getDate(), daysInMonth];
}

function complianceCellHtml(spend, budget) {
    if (!budget || budget <= 0) return '<span style="color:var(--text-3)">—</span>';
    const [elapsedDays, totalTargetDays] = getPacingDays();
    const elapsedPct = (elapsedDays / totalTargetDays) * 100;
    const actualPct  = (spend / budget) * 100;
    const ratio      = elapsedPct > 0 ? actualPct / elapsedPct : 1;
    let clsUrl = actualPct < 70 ? 'comp-budget-safe' : actualPct <= 90 ? 'comp-budget-warn' : 'comp-budget-danger';
    const icon = ratio >= 1 ? '▲' : '▼';
    return `<span class="compliance-badge comp-info"><strong class="${clsUrl}">${actualPct.toFixed(1)}%</strong> <small title="Expected for ${elapsedDays} days">${icon} exp. ${elapsedPct.toFixed(1)}%</small></span>`;
}

function complianceRatio(spend, budget) {
    if (!budget || budget <= 0) return null;
    const [elapsedDays, totalTargetDays] = getPacingDays();
    const expected = budget * (elapsedDays / totalTargetDays);
    return expected > 0 ? spend / expected : null;
}

function applyGeneralView() {
    const preset    = document.getElementById('date-select').value;
    const metaAccId = document.getElementById('account-select').value;
    const filterMeta = metaAccId !== 'all' ? metaAccId : null;
    const gAccounts  = computeGoogleAccountsData(preset, filterMeta);
    const retainedRange = getGoogleDateRange(preset);
    retainedByAccount = computeRetainedByAccount(
        retainedRange ? retainedRange.since : null,
        retainedRange ? retainedRange.until : null
    );
    const prevRange = getGooglePrevDateRange(preset);
    const gPrev    = prevRange ? computeGoogleAccountsData(preset, filterMeta, prevRange) : [];
    const gPrevMap = Object.fromEntries(gPrev.map(a => [a.accountId, a]));

    const metaAds = currentAdsData;
    // Single pass for Meta aggregates
    let mSpend = 0, mLeads = 0, mImpr = 0, mClicks = 0;
    for (const a of metaAds) { mSpend += a.spend; mLeads += a.leads; mImpr += a.impressions; mClicks += a.linkClicks; }
    // Single pass for Google aggregates
    let gCost = 0, gConv = 0, gImpr = 0, gClk = 0;
    for (const a of gAccounts) { gCost += a.cost; gConv += a.conversions; gImpr += a.impressions; gClk += a.clicks; }

    const totalSpend = mSpend + gCost;
    const totalConv  = mLeads + gConv;
    const totalImpr  = mImpr  + gImpr;
    const totalClk   = mClicks + gClk;
    const avgCtr = totalImpr > 0 ? (totalClk / totalImpr) * 100 : 0;
    const avgCpa = totalConv > 0 ? totalSpend / totalConv : null;

    let mPrevSpend = 0, mPrevLeads = 0, mPrevImpr = 0, mPrevClicks = 0;
    for (const a of currentAccountsData) {
        mPrevSpend += a.prev?.spend || 0; mPrevLeads += a.prev?.leads || 0;
        mPrevImpr += a.prev?.impressions || 0; mPrevClicks += a.prev?.linkClicks || 0;
    }
    let gPrevCost = 0, gPrevConv = 0, gPrevImpr = 0, gPrevClk = 0;
    for (const a of gPrev) { gPrevCost += a.cost; gPrevConv += a.conversions; gPrevImpr += a.impressions; gPrevClk += a.clicks; }

    const prevTotalSpend = mPrevSpend + gPrevCost;
    const prevTotalConv  = mPrevLeads + gPrevConv;
    const prevTotalImpr  = mPrevImpr + gPrevImpr;
    const prevTotalClk   = mPrevClicks + gPrevClk;
    const prevAvgCpa = prevTotalConv > 0 ? prevTotalSpend / prevTotalConv : null;
    const prevAvgCtr = prevTotalImpr > 0 ? (prevTotalClk / prevTotalImpr) * 100 : 0;

    // Previous retained
    const prevRetainedByAccount = prevRange ? computeRetainedByAccount(
        prevRange.since || null, prevRange.until || null
    ) : {};
    const prevTotalRetained = Object.values(prevRetainedByAccount).reduce((s, v) => s + v, 0);
    const prevTotalCpa = prevTotalRetained > 0 ? prevTotalSpend / prevTotalRetained : null;

    animateValue('kpi-total-spend', fmt.currency(totalSpend));
    if (window.updateKPITrend) window.updateKPITrend('trend-spend', totalSpend, prevTotalSpend, true);
    animateValue('kpi-total-leads', fmt.int(totalConv));
    if (window.updateKPITrend) window.updateKPITrend('trend-leads', totalConv, prevTotalConv, false);
    animateValue('kpi-avg-cpl', avgCpa !== null ? fmt.currency(avgCpa) : 'N/A');
    if (window.updateKPITrend) window.updateKPITrend('trend-cpl', avgCpa || 0, prevAvgCpa || 0, true);
    animateValue('kpi-avg-ctr', fmt.pct(avgCtr));
    if (window.updateKPITrend) window.updateKPITrend('trend-ctr', avgCtr, prevAvgCtr, false);

    const totalRetained = Object.values(retainedByAccount).reduce((s, v) => s + v, 0);
    const totalCpa = totalRetained > 0 ? totalSpend / totalRetained : null;
    animateValue('kpi-total-impressions', fmt.int(totalRetained));
    if (window.updateKPITrend) window.updateKPITrend('trend-reach', totalRetained, prevTotalRetained, false);
    animateValue('kpi-total-clicks', totalCpa !== null ? fmt.currency(totalCpa) : 'N/A');
    if (window.updateKPITrend) window.updateKPITrend('trend-clicks', totalCpa || 0, prevTotalCpa || 0, true);

    updateSpendBadge('Consolidated Spend', fmt.currency(totalSpend));

    const chartDataGen = aggregateCombinedForChart(currentDailyData, gAccounts);
    renderChart(chartDataGen, currentChartMode);
    if (window.drawKPISparklines) window.drawKPISparklines(chartDataGen);

    currentGeneralRows = [];
    for (const acc of currentAccountsData) {
        const gEntry = Object.entries(GOOGLE_ACCOUNTS).find(([, v]) => v.metaId === acc.accountId);
        const gData  = gEntry ? gAccounts.find(g => g.accountId === gEntry[0]) : null;
        const gP     = gEntry ? gPrevMap[gEntry[0]] : null;
        const combinedSpend  = acc.spend + (gData ? gData.cost : 0);
        const combinedConvs  = acc.leads + (gData ? gData.conversions : 0);
        const combinedClicks = acc.linkClicks + (gData ? gData.clicks : 0);

        let metaStat = acc.accountStatus != null ? metaStatusInfo(acc.accountStatus) : { label: 'Active', cls: 'acct-active' };
        if (acc.isPausadaMeta && metaStat.cls === 'acct-active') { metaStat.label = 'Paused'; metaStat.cls = 'acct-paused'; }
        const gooStat = gData ? gData.statusObj : null;

        let finalLabel = metaStat.label, finalCls = metaStat.cls;
        
        if (gooStat) {
            const mPay = metaStat.label.includes('Payment Issue');
            const gPay = gooStat.label.includes('Payment Issue');
            const mAct = metaStat.label.includes('Active');
            const gAct = gooStat.label.includes('Active');
            const mPau = metaStat.label.includes('Paused') || metaStat.label.includes('Disabled') || metaStat.label.includes('Closed');
            const gPau = gooStat.label.includes('Paused') || gooStat.label.includes('Closed');

            if (mAct && gAct) { finalLabel = 'Active Meta & Google'; finalCls = 'acct-active'; }
            else if (mAct && !gAct) { finalLabel = 'Active Meta'; finalCls = 'acct-active'; }
            else if (!mAct && gAct) { finalLabel = 'Active Google'; finalCls = 'acct-active'; }
            else if (mPau && gPau) { finalLabel = 'Paused Meta & Google'; finalCls = 'acct-paused'; }
            else if (mPay && gPay) { finalLabel = 'Payment Issue Meta & Google'; finalCls = 'acct-payment'; }
            else if (mPay) { finalLabel = 'Payment Issue Meta'; finalCls = 'acct-payment'; }
            else if (gPay) { finalLabel = 'Payment Issue Google'; finalCls = 'acct-payment'; }
            else { finalLabel = `${metaStat.label} Meta, ${gooStat.label} Google`; finalCls = 'acct-paused'; }
        } else {
            if (finalLabel === 'Active') finalLabel = 'Active Meta';
            else if (finalLabel === 'Paused') finalLabel = 'Paused Meta';
            else if (finalLabel === 'Payment Issue') finalLabel = 'Payment Issue Meta';
        }

        const gBudget = GOOGLE_BUDGETS[gEntry ? gEntry[0] : null] || 0;
        const combinedBudget = (acc.budget || 0) + gBudget;

        currentGeneralRows.push({
            accountId: acc.accountId,
            name: acc.accountName,
            platforms: acc.plataformas || 'Meta',
            categoria: acc.categoria || '-',
            fecha: acc.fecha || '-',
            budget: combinedBudget,
            statusInfo: { label: finalLabel, cls: finalCls },
            spend: combinedSpend,
            convs: combinedConvs,
            cpl: combinedConvs > 0 ? combinedSpend / combinedConvs : null,
            compliance: complianceRatio(combinedSpend, combinedBudget),
            retained: retainedByAccount[acc.accountId] || 0,
            prev: acc.prev ? { spend: (acc.prev.spend || 0) + (gP ? gP.cost : 0), convs: (acc.prev.leads || 0) + (gP ? gP.conversions : 0) } : null,
            sparklineData: window.generateSparklineArray ? window.generateSparklineArray(acc.accountId, 'meta') : null
        });
    }

    for (const g of gAccounts) {
        const linked = Object.entries(GOOGLE_ACCOUNTS).find(([cid, v]) => cid === g.accountId && v.metaId);
        const hasMetaAcc = linked ? currentAccountsData.some(a => a.accountId === linked[1].metaId) : false;
        if (!linked || !hasMetaAcc) {
            const gP = gPrevMap[g.accountId];
            const metaIdFound = linked ? linked[1].metaId : null;
            const metaData    = metaIdFound ? (METADATOS_CUENTAS[metaIdFound] || {}) : {};
            const explBudgetG = GOOGLE_BUDGETS[g.accountId] || 0;
            const explBudgetM = metaData.budget || 0;
            const combinedBudget = (explBudgetM > 0 || explBudgetG > 0) ? (explBudgetM + explBudgetG) : (g.budget || 0);
            currentGeneralRows.push({
                accountId: g.accountId,
                name: g.accountName,
                platforms: metaData.plataformas || 'Google',
                categoria: metaData.categoria || g.categoria || '-',
                fecha: metaData.fecha || g.fecha || '-',
                budget: combinedBudget,
                statusInfo: g.statusObj,
                spend: g.cost,
                convs: g.conversions,
                cpl: g.conversions > 0 ? g.cost / g.conversions : null,
                compliance: complianceRatio(g.cost, g.budget),
                retained: retainedByAccount[g.accountId] || 0,
                prev: gP ? { spend: gP.cost, convs: gP.conversions } : null,
                sparklineData: window.generateSparklineArray ? window.generateSparklineArray(g.accountId, 'google') : null
            });
        }
    }
    renderGeneralAccountsTable(sortData(currentGeneralRows, sortStateGen.col, sortStateGen.dir));
}

function renderGoogleAccountsTable(accounts) {
    renderGenericTable({
        tbodyId: 'accounts-table-body', countId: 'accounts-count', countLabel: 'account',
        thSelector: '#accounts-thead th.sortable-g', sortState: sortStateG,
        data: accounts, emptyHtml: '<tr class="empty-row"><td colspan="11">No Google Ads data for this period</td></tr>',
        rowFn: (a) => {
            const p = a.prev;
            return `<tr style="animation-delay:0ms">
                <td class="col-name">${escHtml(a.accountName)}</td>
                <td>${acctStatusBadge(a.statusObj)}</td>
                <td>${escHtml(a.fecha)}</td>
                <td>${escHtml(a.categoria)}</td>
                <td class="currency">${a.budget > 0 ? fmt.currency(a.budget) : '-'}</td>
                <td>${complianceCellHtml(a.cost, a.budget)}</td>
                <td class="currency">${fmt.currency(a.cost)}${p ? delta(a.cost, p.cost) : ''}</td>
                <td class="leads-cell ${a.conversions > 0 ? 'has-leads' : ''}">${fmt.int(a.conversions)}${p ? delta(a.conversions, p.conversions) : ''}</td>
                <td class="currency">${a.costPerConv !== null ? fmt.currency(a.costPerConv) : 'N/A'}${p ? delta(a.costPerConv, p.costPerConv, true) : ''}</td>
                <td>${fmt.int(a.impressions)}${p ? delta(a.impressions, p.impressions) : ''}</td>
                <td class="currency">${a.avgCpc !== null ? fmt.currency(a.avgCpc) : 'N/A'}${p ? delta(a.avgCpc, p.avgCpc, true) : ''}</td>
            </tr>`;
        }
    });
}

function renderGeneralAccountsTable(rows) {
    renderGenericTable({
        tbodyId: 'accounts-table-body', countId: 'accounts-count', countLabel: 'account',
        thSelector: '#accounts-thead th.sortable-gen', sortState: sortStateGen,
        data: rows, emptyHtml: '<tr class="empty-row"><td colspan="12">No data for this period</td></tr>',
        rowFn: (r) => {
            const p = r.prev;
            const pcpl = p && p.convs > 0 ? p.spend / p.convs : null;
            const cpa  = r.retained > 0 ? r.spend / r.retained : null;
            return `<tr style="animation-delay:0ms">
                <td class="col-name">${escHtml(r.name)}</td>
                <td>${acctStatusBadge(r.statusInfo)}</td>
                <td style="font-size:0.8rem; color:var(--text-3)">${escHtml(r.platforms)}</td>
                <td style="font-size:0.8rem; color:var(--text-3)">${escHtml(r.fecha)}</td>
                <td style="font-size:0.8rem; color:var(--text-3)">${escHtml(r.categoria)}</td>
                <td class="currency">${r.budget > 0 ? fmt.currency(r.budget) : '<span style="color:var(--text-3)">—</span>'}</td>
                <td>${complianceCellHtml(r.spend, r.budget)}</td>
                <td class="currency">${fmt.currency(r.spend)}${p ? delta(r.spend, p.spend) : ''}</td>
                <td class="leads-cell ${r.convs > 0 ? 'has-leads' : ''}">${fmt.int(r.convs)}${p ? delta(r.convs, p.convs) : ''}</td>
                <td class="currency">${r.cpl !== null ? fmt.currency(r.cpl) : 'N/A'}${p ? delta(r.cpl, pcpl, true) : ''}</td>
                <td class="retained-cell ${r.retained > 0 ? 'has-retained' : ''}">${r.retained > 0 ? fmt.int(r.retained) : '<span style="color:var(--text-3)">—</span>'}</td>
                <td class="currency">${cpa !== null ? fmt.currency(cpa) : '<span style="color:var(--text-3)">—</span>'}</td>
            </tr>`;
        }
    });
}

function renderKeywordsTable(data) {
    const term      = (document.getElementById('keywords-search')?.value || '').trim().toLowerCase();
    const matchType = document.getElementById('kw-match-select')?.value || 'all';

    let filtered = data;
    if (term) filtered = filtered.filter(k => (k.keyword || '').toLowerCase().includes(term));
    if (matchType !== 'all') filtered = filtered.filter(k => k.matchType === matchType);
    const sorted = [...filtered].sort((a, b) => {
        const va = a[sortStateKw.col] ?? -Infinity;
        const vb = b[sortStateKw.col] ?? -Infinity;
        return sortStateKw.dir === 'desc' ? vb - va : va - vb;
    });

    const matchLabel = { 'EXACT': 'Exact', 'PHRASE': 'Phrase', 'BROAD': 'Broad' };
    renderGenericTable({
        tbodyId: 'keywords-table-body', countId: 'keywords-count', countLabel: 'keyword',
        thSelector: '#keywords-table th.sortable-kw', sortState: sortStateKw,
        data: sorted, emptyHtml: '<tr class="empty-row"><td colspan="9">No keywords for this period</td></tr>',
        rowFn: (k) => `<tr style="animation-delay:0ms">
            <td class="ad-name-cell col-name" title="${escHtml(k.keyword)}">${escHtml(k.keyword)}</td>
            <td class="col-name" style="font-size:0.8rem; color:var(--text-3);" title="${escHtml(k.accountName)}">${escHtml(k.accountName)}</td>
            <td><span class="match-badge match-${(k.matchType || '').toLowerCase()}">${matchLabel[k.matchType] || k.matchType}</span></td>
            <td class="col-name" style="color:var(--text-3); font-size:0.82rem; font-weight:500" title="${escHtml(k.campaign)}">${escHtml(k.campaign)}</td>
            <td>${fmt.int(k.impressions)}</td>
            <td>${fmt.int(k.clicks)}</td>
            <td class="currency">${k.avgCpc > 0 ? fmt.currency(k.avgCpc) : 'N/A'}</td>
            <td class="currency">${fmt.currency(k.cost)}</td>
            <td class="leads-cell ${k.conversions > 0 ? 'has-leads' : ''}">${fmt.int(k.conversions)}</td>
            <td class="currency">${k.costPerConv > 0 ? fmt.currency(k.costPerConv) : 'N/A'}</td>
        </tr>`
    });
}

function getFilteredAds() {
    const term      = document.getElementById('table-search').value.trim().toLowerCase();
    const cplVal    = document.getElementById('cpl-select').value;
    const statusVal = document.getElementById('status-select').value;
    return currentAdsData.filter(a => {
        if (term && !a.adName.toLowerCase().includes(term)) return false;
        if (cplVal === 'na' && a.cpl !== null) return false;
        if (cplVal === 'valid' && a.cpl === null) return false;
        if (statusVal !== 'all' && a.status !== statusVal) return false;
        return true;
    });
}

function applyTableFilters() {
    const filtered = getFilteredAds();
    updateKPICards(filtered);
    renderTable(sortData(filtered, sortState.col, sortState.dir));
}

function applyGlobalData() {
    const select    = document.getElementById('account-select');
    const accountId = select.value;
    const accountName = select.options[select.selectedIndex]?.text || '';

    if (!accountId) { resetDashboard(); return; }

    if (accountId === 'all') {
        currentAdsData      = [...globalAdsData];
        currentDailyData    = [...globalDailyData];
        currentAccountsData = [...globalAccountsData];
        document.getElementById('footer-account-name').textContent = 'All accounts consolidated';
    } else {
        currentAdsData      = globalAdsData.filter(ad => ad.accountId === accountId);
        currentDailyData    = globalDailyData.filter(d  => d.accountId === accountId);
        currentAccountsData = globalAccountsData.filter(a => a.accountId === accountId);
        document.getElementById('footer-account-name').textContent = accountName.replace(/^—\s*/, '');
    }

    const adsForTable  = getFilteredAds();
    const sortedAds    = sortData(adsForTable, sortState.col, sortState.dir);
    const sortedAccs   = sortData(currentAccountsData, sortStateAcc.col, sortStateAcc.dir);
    applySortUI(sortState.col, sortState.dir);
    applySortUIAcc(sortStateAcc.col, sortStateAcc.dir);

    updateKPICards(adsForTable);

    const chartData = aggregateDailyData(currentDailyData);
    renderChart(chartData, currentChartMode);
    if (window.drawKPISparklines) window.drawKPISparklines(chartData);

    renderTable(sortedAds);
    renderAccountsTable(sortedAccs);

    const totalSpend = currentAccountsData.reduce((s, a) => s + a.spend, 0);
    document.getElementById('total-consolidated-spend').textContent = fmt.currency(totalSpend);
    document.getElementById('footer-update-time').textContent = 'Updated: ' + new Date().toLocaleTimeString('en-US');
    document.getElementById('table-search').value = '';
    document.getElementById('cpl-select').value = 'all';
}

function aggregateDailyData(data) {
    const map = {};
    for (const d of data) {
        if (!map[d.date]) map[d.date] = { date: d.date, spend: 0, leads: 0, ctr: 0, linkClicks: 0, impressions: 0 };
        map[d.date].spend       += d.spend;
        map[d.date].leads       += d.leads;
        map[d.date].linkClicks  += d.linkClicks;
        map[d.date].impressions += d.impressions;
    }
    Object.values(map).forEach(m => {
        m.ctr = m.impressions > 0 ? (m.linkClicks / m.impressions) * 100 : 0;
    });
    return Object.values(map);
}

/* ── Event Listeners ────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {

    setTimeout(() => {
        const activeBtn = document.querySelector('.tab-btn.active');
        const ind = document.getElementById('tab-indicator');
        if (activeBtn && ind) {
            ind.style.width = `${activeBtn.offsetWidth}px`;
            ind.style.left  = `${activeBtn.offsetLeft}px`;
        }
    }, 150);

    document.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentChartMode = btn.dataset.chart;
            if (currentDailyData && currentDailyData.length > 0) {
                renderChart(aggregateDailyData(currentDailyData), currentChartMode);
            }
        });
    });

    const btnPdf = document.getElementById('btn-export-pdf');
    if (btnPdf) {
        btnPdf.addEventListener('click', () => {
            if (typeof html2pdf === 'undefined') { window.print(); return; }

            window.scrollTo(0, 0);
            const element  = document.querySelector('.dashboard');
            const controls = document.querySelectorAll('.header-right, .table-controls, .chart-toggle-group');
            controls.forEach(c => c.style.display = 'none');

            const dateSelect = document.getElementById('date-select');
            let dateText = dateSelect.options[dateSelect.selectedIndex]?.text || '';
            if (dateSelect.value === 'custom') {
                const s = document.getElementById('date-start').value;
                const e = document.getElementById('date-end').value;
                if (s && e) dateText = `${s} to ${e}`;
            }
            const accSelect = document.getElementById('account-select');
            const accText   = accSelect.options[accSelect.selectedIndex]?.text || 'All Accounts';
            const stSelect  = document.getElementById('status-select');
            let stText = stSelect.options[stSelect.selectedIndex]?.text || '';
            if (stSelect.value === 'all') stText = ''; else stText = ` &nbsp;|&nbsp; <strong>Status:</strong> ${stText}`;

            const pdfInfo = document.getElementById('pdf-report-info');
            if (pdfInfo) {
                pdfInfo.innerHTML = `<span><strong>Account:</strong> ${accText}</span>
                ${dateText ? `<span><strong>Period:</strong> ${dateText}</span>` : ''}
                <span><strong>Exported:</strong> ${new Date().toLocaleString()}</span>${stText}`;
                pdfInfo.style.display = 'block';
            }

            const wrappers = document.querySelectorAll('.table-wrapper');
            const wrapperOrigStyles = Array.from(wrappers).map(w => ({ maxHeight: w.style.maxHeight, overflow: w.style.overflow }));
            wrappers.forEach(w => { w.style.maxHeight = 'none'; w.style.overflow = 'visible'; });

            const cards = document.querySelectorAll('.table-card, .kpi-card, .chart-card, .header');
            cards.forEach(c => {
                c.dataset.origBackdrop  = c.style.backdropFilter || '';
                c.dataset.origWebkit    = c.style.webkitBackdropFilter || '';
                c.dataset.origOverflow  = c.style.overflow || '';
                c.dataset.origBg        = c.style.background || '';
                c.style.backdropFilter  = 'none';
                c.style.webkitBackdropFilter = 'none';
                c.style.overflow = 'visible';
                c.style.background = 'rgb(14, 14, 40)';
            });

            const styleFix = document.createElement('style');
            styleFix.id = 'pdf-export-style';
            styleFix.innerHTML = `
                *, *::before, *::after { animation: none !important; transition: none !important; transform: none !important; }
                * { opacity: 1 !important; }
                .kpi-card::before, .kpi-card::after,
                .chart-card::before, .chart-card::after,
                .table-card::before, .table-card::after { opacity: 0 !important; }
                .kpi-sparkline-wrap .sparkline-path { stroke-dashoffset: 0 !important; }
            `;
            document.head.appendChild(styleFix);

            const origPadding = element.style.padding;
            const origBgHex   = element.style.backgroundColor;
            element.style.padding = '0.4in';
            element.style.backgroundColor = '#06010F';

            const opt = {
                margin: 0,
                filename: `dashboard-meta-${new Date().toISOString().slice(0, 10)}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 1.5, useCORS: true, logging: false, windowWidth: 1600, scrollY: 0, backgroundColor: '#06010F' },
                jsPDF: { unit: 'in', format: 'tabloid', orientation: 'landscape' },
                pagebreak: { mode: 'css', avoid: ['tr', '.kpi-card', '.chart-card'] }
            };

            const kpiValueSnapshots = Array.from(document.querySelectorAll('.kpi-value')).map(el => ({ el, html: el.innerHTML }));
            document.getElementById('loading-overlay').classList.remove('hidden');
            const overlayText = document.querySelector('.overlay-text');
            const origText    = overlayText.textContent;
            overlayText.textContent = 'Generando PDF, por favor espera...';
            kpiValueSnapshots.forEach(({ el, html }) => { el.innerHTML = html; });

            const restorePdf = () => {
                const sf = document.getElementById('pdf-export-style');
                if (sf) sf.remove();
                element.style.padding = origPadding;
                element.style.backgroundColor = origBgHex;
                controls.forEach(c => c.style.display = '');
                if (pdfInfo) pdfInfo.style.display = 'none';
                wrappers.forEach((w, i) => { w.style.maxHeight = wrapperOrigStyles[i].maxHeight; w.style.overflow = wrapperOrigStyles[i].overflow; });
                cards.forEach(c => {
                    c.style.backdropFilter = c.dataset.origBackdrop;
                    c.style.webkitBackdropFilter = c.dataset.origWebkit;
                    c.style.overflow = c.dataset.origOverflow;
                    c.style.background = c.dataset.origBg;
                });
                document.getElementById('loading-overlay').classList.add('hidden');
                overlayText.textContent = origText;
            };

            html2pdf().set(opt).from(element).save().then(() => {
                restorePdf();
                if (window.showToast) window.showToast('PDF Exported');
                applyCurrentTab();
            }).catch(err => {
                console.error('Error al generar PDF:', err);
                restorePdf();
                applyCurrentTab();
                alert('Hubo un error al generar el PDF.');
            });
        });
    }

    document.getElementById('status-select')?.addEventListener('change', applyTableFilters);

    document.getElementById('date-select').addEventListener('change', async (e) => {
        const isCustom = e.target.value === 'custom';
        const customWrap = document.getElementById('custom-date-wrap');
        if (isCustom) {
            customWrap.classList.remove('hidden');
        } else {
            customWrap.classList.add('hidden');
            const metaP = fetchAllData();
            // Google Sheets and Retained data cover all dates and are filtered
            // client-side — no need to re-fetch on every filter change
            const needsAux = googleRawDaily.length === 0 || retainedRawRows.length === 0;
            const auxP = needsAux ? Promise.all([fetchGoogleData(), fetchRetainedData()]) : Promise.resolve();
            await metaP;
            applyCurrentTab();
            await auxP;
            if (needsAux) applyCurrentTab();
        }
    });

    document.getElementById('btn-apply-dates').addEventListener('click', async () => {
        const start = document.getElementById('date-start').value;
        const end   = document.getElementById('date-end').value;
        if (!start || !end) { alert('Por favor selecciona fecha de inicio y fin.'); return; }
        if (start > end)    { alert('La fecha de inicio debe ser anterior o igual a la de fin.'); return; }
        const metaP = fetchAllData();
        const needsAux = googleRawDaily.length === 0 || retainedRawRows.length === 0;
        const auxP = needsAux ? Promise.all([fetchGoogleData(), fetchRetainedData()]) : Promise.resolve();
        await metaP;
        applyCurrentTab();
        await auxP;
        if (needsAux) applyCurrentTab();
    });

    document.getElementById('table-search').addEventListener('input', applyTableFilters);
    document.getElementById('cpl-select').addEventListener('change', applyTableFilters);

    document.querySelectorAll('th.sortable').forEach(th => {
        th.addEventListener('click', () => {
            const col = th.dataset.col;
            if (sortState.col === col) sortState.dir = sortState.dir === 'desc' ? 'asc' : 'desc';
            else { sortState.col = col; sortState.dir = col === 'adName' ? 'asc' : 'desc'; }
            applySortUI(sortState.col, sortState.dir);
            applyTableFilters();
        });
    });

    document.querySelectorAll('th.sortable-acc').forEach(th => {
        th.addEventListener('click', () => {
            const col = th.dataset.col;
            if (sortStateAcc.col === col) sortStateAcc.dir = sortStateAcc.dir === 'desc' ? 'asc' : 'desc';
            else { sortStateAcc.col = col; sortStateAcc.dir = col === 'accountName' ? 'asc' : 'desc'; }
            applySortUIAcc(sortStateAcc.col, sortStateAcc.dir);
            renderAccountsTable(sortData(currentAccountsData, sortStateAcc.col, sortStateAcc.dir));
        });
    });

    document.getElementById('btn-export').addEventListener('click', () => {
        if (currentAdsData.length === 0) return;
        exportCSV(currentAdsData, document.getElementById('footer-account-name').textContent);
    });

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    document.querySelectorAll('th.sortable-kw').forEach(th => {
        th.addEventListener('click', () => {
            const col = th.dataset.col;
            if (sortStateKw.col === col) sortStateKw.dir = sortStateKw.dir === 'desc' ? 'asc' : 'desc';
            else { sortStateKw.col = col; sortStateKw.dir = 'desc'; }
            document.querySelectorAll('th.sortable-kw').forEach(t => t.classList.remove('sort-asc', 'sort-desc'));
            th.classList.add(sortStateKw.dir === 'asc' ? 'sort-asc' : 'sort-desc');
            renderKeywordsTable(currentGoogleKeywords);
        });
    });

    document.getElementById('keywords-search')?.addEventListener('input', () => {
        renderKeywordsTable(currentGoogleKeywords);
    });

    document.getElementById('account-select').addEventListener('change', () => applyCurrentTab());

    init();
});

/* ── UI Helpers (global) ────────────────────────────────────── */

window.showToast = function (msg) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const t = document.createElement('div');
    t.className = 'toast';
    t.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color:var(--delta-pos)"><polyline points="20 6 9 17 4 12"></polyline></svg> ${msg}`;
    container.appendChild(t);
    setTimeout(() => { t.classList.add('hide'); setTimeout(() => t.remove(), 300); }, 2500);
};

window.updateKPITrend = function (id, current, prev, invert = false) {
    const el = document.getElementById(id);
    if (!el) return;
    if (prev == null || prev === 0) { el.innerHTML = '&nbsp;'; el.className = 'kpi-trend trend-neu'; return; }
    const ratio = ((current - prev) / prev) * 100;
    if (Math.abs(ratio) < 0.1) { el.innerHTML = '&nbsp;'; el.className = 'kpi-trend trend-neu'; return; }
    const isAbove = ratio > 0;
    const isGood  = invert ? !isAbove : isAbove;
    const cls  = isGood ? 'trend-pos' : 'trend-neg';
    const icon = isAbove ? '▲' : '▼';
    const sign = isAbove ? '+' : '';
    el.innerHTML  = `${icon} ${sign}${Math.abs(ratio).toFixed(1)}%`;
    el.className  = `kpi-trend ${cls}`;
};

window.generateSparklineArray = function (accountId, platform) {
    const preset = document.getElementById('date-select')?.value || 'this_month';
    const range  = platform === 'meta' ? null : getGoogleDateRange(preset);
    let rows = [];
    if (platform === 'meta') {
        rows = globalDailyData.filter(d => d.accountId === accountId);
    } else {
        rows = googleRawDaily.filter(d => {
            if (d.accountId !== accountId) return false;
            if (range && d.date < range.since) return false;
            if (range && d.date > range.until) return false;
            return true;
        });
    }
    rows.sort((a, b) => a.date.localeCompare(b.date));
    const vals = rows.map(r => r.spend || r.cost || 0);
    return vals.length < 2 ? null : vals;
};

window.generateSparklineSVG = function (dataArray, w = 60, h = 20, hexColor = 'var(--purple)') {
    if (!dataArray || dataArray.length < 2) return '';
    const max = Math.max(...dataArray) || 1;
    let min = Math.min(...dataArray);
    if (min === max) min = 0;
    const MathRange = max - min || 1;
    const step = w / (dataArray.length - 1);
    const UsableHeight = h * 0.4;
    const points = dataArray.map((val, i) => {
        const x = Number((i * step).toFixed(1));
        const y = Number((h - ((val - min) / MathRange) * UsableHeight - 2).toFixed(1));
        return `${x},${y}`;
    });
    const fillStr = `M ${points.join(' L ')} L ${w},${h} L 0,${h} Z`;
    return `<div style="width: 100%; height: 100%; display: flex; align-items: flex-end; justify-content: flex-end;">
        <svg width="100%" height="100%" class="sparkline-svg" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">
            <path d="${fillStr}" fill="${hexColor}" fill-opacity="0.15" stroke="none" />
            <path d="M ${points.join(' L ')}" fill="none" stroke="${hexColor}" class="sparkline-path" />
        </svg>
    </div>`;
};

window.drawKPISparklines = function (dataArray) {
    if (!dataArray || dataArray.length < 2) return;
    const draw = (id, mapper, color) => {
        const wrap = document.getElementById(id);
        if (!wrap) return;
        const vals = dataArray.map(mapper);
        if (vals.every(v => v === 0)) { wrap.innerHTML = ''; return; }
        wrap.innerHTML = window.generateSparklineSVG(vals, 150, 40, color);
    };
    draw('spark-spend',       d => d.spend,                             '#ef4444');
    draw('spark-leads',       d => d.leads,                             '#8b5cf6');
    draw('spark-cpl',         d => d.leads > 0 ? d.spend / d.leads : 0,'#ef4444');
    draw('spark-ctr',         d => d.ctr || 0,                          '#10b981');
    draw('spark-impressions', d => d.impressions,                        '#10b981');
    draw('spark-clicks',      d => d.linkClicks,                         '#3b82f6');
};

document.getElementById('theme-toggle')?.addEventListener('click', () => {
    const isLightMode = document.body.classList.toggle('light-mode');
    const logoImg = document.getElementById('main-logo');
    if (logoImg) {
        logoImg.src = isLightMode ? 'logo_oscuro.png' : 'logo.png';
    }
    if (currentDailyData && currentDailyData.length > 0) {
        renderChart(aggregateDailyData(currentDailyData), currentChartMode);
    }
});

setInterval(() => {
    const span = document.getElementById('footer-update-time');
    if (!span || !window.lastFetchTime) return;
    const diff = Math.floor((Date.now() - window.lastFetchTime) / 60000);
    span.textContent = diff === 0 ? 'Updated just now' : `Updated ${diff} min ago`;
}, 60000);

document.addEventListener('mousemove', e => {
    for (const card of document.querySelectorAll('.kpi-card, .chart-card, .table-card')) {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
        card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
    }
});

window.addEventListener('resize', () => {
    const activeBtn = document.querySelector('.tab-btn.active');
    const ind = document.getElementById('tab-indicator');
    if (activeBtn && ind) {
        ind.style.width = `${activeBtn.offsetWidth}px`;
        ind.style.left  = `${activeBtn.offsetLeft}px`;
    }
});
