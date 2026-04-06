// ============================================================
// GOOGLE ADS SCRIPT — Dashboard Data Export
// Pegar en: Google Ads > Herramientas > Scripts (nivel MCC)
// Luego programar para correr diariamente (Frecuencia: Diaria)
// ============================================================

var CONFIG = {
  SPREADSHEET_URL: 'https://docs.google.com/spreadsheets/d/1k5pkI8pHS-mOCP-988y9qKKjbJHMz6NV1u6N8GHSm_Q/edit?gid=0#gid=0',
  CUSTOMER_IDS: [
    '6307839929',
    '9944217293',
    '7032676839',
    '9323994741',
    '1371132049',
    '4603681023'
  ],
  DAYS_HISTORY: 90,    // días de historial diario exportado
  KEYWORD_LIMIT: 300   // máximo de keywords por cuenta por periodo
};

var PERIODS = ['LAST_7_DAYS', 'LAST_14_DAYS', 'LAST_30_DAYS', 'THIS_MONTH', 'LAST_MONTH'];

function main() {
  var ss = SpreadsheetApp.openByUrl(CONFIG.SPREADSHEET_URL);

  var accountsSheet = getOrCreateSheet(ss, 'accounts');
  var dailySheet = getOrCreateSheet(ss, 'daily');
  var kwSheet = getOrCreateSheet(ss, 'keywords');

  // Limpiar y escribir encabezados
  accountsSheet.clearContents();
  accountsSheet.appendRow(['account_id', 'account_name', 'status']);

  dailySheet.clearContents();
  dailySheet.appendRow(['account_id', 'date', 'impressions', 'clicks', 'cost', 'conversions']);

  kwSheet.clearContents();
  kwSheet.appendRow([
    'account_id', 'period', 'keyword', 'match_type', 'campaign', 'ad_group',
    'impressions', 'clicks', 'cost', 'conversions', 'ctr', 'avg_cpc', 'cost_per_conv'
  ]);

  var accountRows = [];
  var dailyRows = [];
  var kwRows = [];

  var accountIterator = AdsManagerApp.accounts()
    .withIds(CONFIG.CUSTOMER_IDS)
    .get();

  while (accountIterator.hasNext()) {
    var account = accountIterator.next();
    AdsManagerApp.select(account);

    var cid = account.getCustomerId().replace(/-/g, '');
    var name = account.getName();
    Logger.log('Procesando: ' + name + ' (' + cid + ')');

    var status = 'Activa';
    try {
      var enabledCampaigns = AdsApp.campaigns().withCondition('Status = ENABLED').get();
      if (enabledCampaigns.totalNumEntities() === 0) {
        status = 'Sin campañas activas';
      }
    } catch(e) { status = 'Sin acceso'; }
    accountRows.push([cid, name, status]);

    var daily = fetchDailyMetrics(cid);
    dailyRows = dailyRows.concat(daily);

    for (var i = 0; i < PERIODS.length; i++) {
      var kws = fetchKeywords(cid, PERIODS[i]);
      kwRows = kwRows.concat(kws);
    }
  }

  if (accountRows.length > 0)
    accountsSheet.getRange(2, 1, accountRows.length, 3).setValues(accountRows);
  if (dailyRows.length > 0)
    dailySheet.getRange(2, 1, dailyRows.length, 6).setValues(dailyRows);
  if (kwRows.length > 0)
    kwSheet.getRange(2, 1, kwRows.length, 13).setValues(kwRows);

  Logger.log('Listo. Cuentas: ' + accountRows.length +
    ' | Filas diarias: ' + dailyRows.length +
    ' | Keywords: ' + kwRows.length);
}

// ── Métricas diarias por cuenta ───────────────────────────────
function fetchDailyMetrics(accountId) {
  var end = new Date();
  var start = new Date();
  start.setDate(start.getDate() - CONFIG.DAYS_HISTORY);

  var query =
    'SELECT segments.date, metrics.impressions, metrics.clicks, ' +
    'metrics.cost_micros, metrics.conversions ' +
    'FROM campaign ' +
    'WHERE segments.date BETWEEN \'' + fmtDate(start) + '\' AND \'' + fmtDate(end) + '\' ' +
    'ORDER BY segments.date ASC';

  var byDate = {};
  var result = AdsApp.search(query);
  while (result.hasNext()) {
    var row = result.next();
    var date = row.segments.date;
    if (!byDate[date]) byDate[date] = { imp: 0, clicks: 0, cost: 0, conv: 0 };
    byDate[date].imp += Number(row.metrics.impressions) || 0;
    byDate[date].clicks += Number(row.metrics.clicks) || 0;
    byDate[date].cost += (Number(row.metrics.costMicros) || 0) / 1e6;
    byDate[date].conv += parseFloat(row.metrics.conversions) || 0;
  }

  var rows = [];
  var dates = Object.keys(byDate).sort();
  for (var i = 0; i < dates.length; i++) {
    var m = byDate[dates[i]];
    rows.push([
      accountId, dates[i],
      m.imp, m.clicks,
      +m.cost.toFixed(2),
      +m.conv.toFixed(2)
    ]);
  }
  return rows;
}

// ── Keywords por periodo ──────────────────────────────────────
function fetchKeywords(accountId, period) {
  var query =
    'SELECT ad_group_criterion.keyword.text, ad_group_criterion.keyword.match_type, ' +
    'campaign.name, ad_group.name, ' +
    'metrics.impressions, metrics.clicks, metrics.cost_micros, ' +
    'metrics.conversions, metrics.ctr, metrics.average_cpc ' +
    'FROM keyword_view ' +
    'WHERE segments.date DURING ' + period + ' ' +
    'AND ad_group_criterion.status != \'REMOVED\' ' +
    'AND metrics.impressions > 0 ' +
    'ORDER BY metrics.cost_micros DESC ' +
    'LIMIT ' + CONFIG.KEYWORD_LIMIT;

  var rows = [];
  var result = AdsApp.search(query);
  while (result.hasNext()) {
    var row = result.next();
    var cost = (Number(row.metrics.costMicros) || 0) / 1e6;
    var cpc = (Number(row.metrics.averageCpc) || 0) / 1e6;
    var conv = parseFloat(row.metrics.conversions) || 0;
    var ctr = (parseFloat(row.metrics.ctr) || 0) * 100;
    var cpa = conv > 0 ? cost / conv : 0;

    rows.push([
      accountId, period,
      row.adGroupCriterion.keyword.text,
      row.adGroupCriterion.keyword.matchType,
      row.campaign.name,
      row.adGroup.name,
      Number(row.metrics.impressions) || 0,
      Number(row.metrics.clicks) || 0,
      +cost.toFixed(2),
      +conv.toFixed(2),
      +ctr.toFixed(4),
      +cpc.toFixed(2),
      +cpa.toFixed(2)
    ]);
  }
  return rows;
}

// ── Helpers ───────────────────────────────────────────────────
function getOrCreateSheet(ss, name) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);
  return sheet;
}

function fmtDate(date) {
  var y = date.getFullYear();
  var m = ('0' + (date.getMonth() + 1)).slice(-2);
  var d = ('0' + date.getDate()).slice(-2);
  return y + '-' + m + '-' + d;
}
