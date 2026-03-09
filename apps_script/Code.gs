function _json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function _getConfig() {
  var props = PropertiesService.getScriptProperties();
  var spreadsheetId = String(props.getProperty('SPREADSHEET_ID') || '').trim();
  var sheetName = String(props.getProperty('SHEET_NAME') || '').trim();
  var rangeA1 = String(props.getProperty('RANGE_A1') || '').trim();
  return { spreadsheetId: spreadsheetId, sheetName: sheetName, rangeA1: rangeA1 };
}

function _getTargetSheet_(ss, cfg) {
  if (cfg.sheetName) {
    var sheet = ss.getSheetByName(cfg.sheetName);
    if (sheet) return sheet;
  }
  var sheets = ss.getSheets();
  if (!sheets || sheets.length === 0) throw new Error('Spreadsheet has no sheets');
  return sheets[0];
}

function doPost(e) {
  try {
    var cfg = _getConfig();
    if (!cfg.spreadsheetId) {
      return _json({ ok: false, message: 'Missing SPREADSHEET_ID in Script Properties' });
    }

    var raw = '';
    if (e && e.parameter && e.parameter.payload) {
      raw = String(e.parameter.payload || '');
    } else if (e && e.postData && e.postData.contents) {
      raw = String(e.postData.contents || '');
    }

    if (!raw) {
      return _json({ ok: false, message: 'Missing payload' });
    }

    var payload = JSON.parse(raw);

    var name = String(payload.name || '').trim();
    var contact = String(payload.contact || payload.id || '').trim();
    var attendance = String(payload.attendance || '').trim().toLowerCase();
    var attendanceText = attendance === 'yes' ? 'Да' : attendance === 'no' ? 'Нет' : attendance;

    var plusOnes = payload.plus_ones;
    if (!Array.isArray(plusOnes)) plusOnes = [];
    plusOnes = plusOnes
      .map(function (x) { return String(x || '').trim(); })
      .filter(function (x) { return Boolean(x); })
      .slice(0, 2);

    var song = String(payload.song || '').trim();

    var ss = SpreadsheetApp.openById(cfg.spreadsheetId);
    var sheet = _getTargetSheet_(ss, cfg);

    // Columns: name | attendance | Контакт(phone/@tg) | +1(json) | song
    sheet.appendRow([name, attendanceText, contact, JSON.stringify(plusOnes), song]);

    return _json({ ok: true });
  } catch (err) {
    var message = err && err.message ? String(err.message) : String(err);
    return _json({ ok: false, message: message });
  }
}
