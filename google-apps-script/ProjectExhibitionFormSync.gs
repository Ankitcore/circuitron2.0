/**
 * ============================================================================
 * CIRCUITRON: PROJECT EXHIBITION / REGISTRATION SYNCHRONIZER
 * TechXpo 2.O — Official Integration (Universal: Form & Sheet Compatible)
 * Website: https://www.circuitron.in
 * ============================================================================
 * 
 * Works 100% whether opened from GOOGLE FORMS or GOOGLE SHEETS!
 * 
 * Automatically sends registrations into 'Project Exhibition' on the Admin
 * Dashboard, capturing their group (Eklavya, Lakshya, Arjuna) and team info.
 * 
 * INSTRUCTIONS:
 * 1. Click the "⏹ Stop" button if the debugger is paused.
 * 2. Delete all existing code in this editor (Ctrl+A -> Backspace).
 * 3. Paste this ENTIRE code.
 * 4. Click the Save icon (Ctrl+S).
 * 5. In the toolbar, select "installTrigger" and click "▷ Run" (NOT Debug).
 * 6. (Optional) Select "syncAllHistoricalRows" and click "▷ Run" to import all existing responses!
 */

const CONFIG = {
  // Destination Webhook URL (Circuitron Production API)
  CIRCUITRON_WEBHOOK_URL: "https://www.circuitron.in/api/registrations",

  // Integration Secret (matches backend REGISTRATION_SYNC_SECRET)
  SYNC_SECRET: "circuitron_sync_secure_2026",

  // Dedicated Event Identifier
  EVENT_ID: "project-exhibition",
};

/**
 * Universal alert dialog helper (works in both Forms and Sheets)
 */
function showAlert(message) {
  try {
    FormApp.getUi().alert(message);
    return;
  } catch (e) {}

  try {
    SpreadsheetApp.getUi().alert(message);
    return;
  } catch (e) {}

  console.log(message);
}

/**
 * 1. Real-Time Trigger: Runs automatically when a participant submits
 */
function onFormSubmit(e) {
  try {
    console.log("⚡ [Project Exhibition] New form submission detected, initiating sync...");
    var payload = {};

    // Direct Google Form trigger
    if (e && e.response) {
      var itemResponses = e.response.getItemResponses();
      var formResponses = {};

      for (var i = 0; i < itemResponses.length; i++) {
        var item = itemResponses[i];
        formResponses[item.getItem().getTitle()] = item.getResponse();
      }

      payload = {
        event_id: CONFIG.EVENT_ID,
        source: "google_form",
        submission_id: e.response.getId(),
        timestamp: e.response.getTimestamp().toISOString(),
        respondent_email: e.response.getRespondentEmail() || formResponses["Email Address"] || formResponses["Email"] || "",
        form_responses: formResponses,
      };
    }
    // Linked Google Sheet trigger
    else if (e && e.namedValues) {
      var namedResponses = {};
      for (var key in e.namedValues) {
        if (e.namedValues.hasOwnProperty(key)) {
          var val = e.namedValues[key];
          namedResponses[key] = Array.isArray(val) ? val.join(", ") : val;
        }
      }

      payload = {
        event_id: CONFIG.EVENT_ID,
        source: "google_sheet",
        submission_id: "sheet_row_" + (e.range ? e.range.getRow() : Date.now()),
        timestamp: namedResponses["Timestamp"] ? new Date(namedResponses["Timestamp"]).toISOString() : new Date().toISOString(),
        respondent_email: namedResponses["Email Address"] || namedResponses["Email"] || "",
        form_responses: namedResponses,
      };
    } else {
      return;
    }

    var response = postToCircuitron(payload);
    console.log("✅ [Project Exhibition] Webhook response:", response);
  } catch (err) {
    console.error("❌ Error in onFormSubmit:", err.message);
  }
}

/**
 * 2. Historical Sync: Universal importer that supports BOTH Google Forms and Google Sheets
 */
function syncAllHistoricalRows() {
  try {
    var registrations = [];

    // Check if opened inside Google Forms
    var form = null;
    try {
      form = FormApp.getActiveForm();
    } catch (e) {}

    if (form) {
      console.log("📝 Detected Google Form container: " + form.getTitle());
      var formResponsesList = form.getResponses();

      if (!formResponsesList || formResponsesList.length === 0) {
        showAlert("No responses submitted to this Google Form yet.");
        return;
      }

      for (var i = 0; i < formResponsesList.length; i++) {
        var resp = formResponsesList[i];
        var items = resp.getItemResponses();
        var responsesObj = {};

        for (var j = 0; j < items.length; j++) {
          var item = items[j];
          responsesObj[item.getItem().getTitle()] = item.getResponse();
        }

        var respondentEmail = resp.getRespondentEmail() || responsesObj["Email Address"] || responsesObj["Email"] || "";
        var ts = resp.getTimestamp() ? resp.getTimestamp().toISOString() : new Date().toISOString();

        registrations.push({
          event_id: CONFIG.EVENT_ID,
          source: "google_form_historical",
          submission_id: resp.getId() || ("form_resp_" + i),
          timestamp: ts,
          respondent_email: respondentEmail,
          form_responses: responsesObj,
        });
      }
    }
    // Check if opened inside Google Sheets
    else {
      var ss = null;
      try {
        ss = SpreadsheetApp.getActiveSpreadsheet();
      } catch (e) {}

      if (ss) {
        console.log("📊 Detected Google Sheet container: " + ss.getName());
        var sheet = ss.getActiveSheet();
        var data = sheet.getDataRange().getValues();

        if (!data || data.length < 2) {
          showAlert("No response rows found in this sheet.");
          return;
        }

        var headers = data[0];

        for (var r = 1; r < data.length; r++) {
          var row = data[r];
          var sheetResponses = {};
          var email = "";
          var timestamp = new Date().toISOString();

          for (var c = 0; c < headers.length; c++) {
            var headerName = String(headers[c]).trim();
            var cellValue = row[c];

            if (cellValue instanceof Date) {
              sheetResponses[headerName] = cellValue.toISOString();
              if (headerName.toLowerCase().indexOf("time") !== -1) {
                timestamp = cellValue.toISOString();
              }
            } else {
              sheetResponses[headerName] = String(cellValue);
            }

            if (headerName.toLowerCase().indexOf("email") !== -1 && !email) {
              email = String(cellValue).trim();
            }
          }

          registrations.push({
            event_id: CONFIG.EVENT_ID,
            source: "google_sheet_historical",
            submission_id: "row_" + (r + 1) + "_" + (email || r),
            timestamp: timestamp,
            respondent_email: email,
            form_responses: sheetResponses,
          });
        }
      } else {
        throw new Error("Could not detect active Google Form or Google Sheet.");
      }
    }

    if (registrations.length === 0) {
      showAlert("No registrations found to synchronize.");
      return;
    }

    // Send in batches of 50
    var batchSize = 50;
    var totalImported = 0;

    for (var b = 0; b < registrations.length; b += batchSize) {
      var chunk = registrations.slice(b, b + batchSize);
      postToCircuitron({
        event_id: CONFIG.EVENT_ID,
        source: "google_historical_batch",
        registrations: chunk,
      });
      totalImported += chunk.length;
    }

    var msg = "🎉 Successfully synchronized " + totalImported + " Project Exhibition registrations into the Circuitron Admin Dashboard!";
    console.log(msg);
    showAlert(msg);
  } catch (err) {
    console.error("❌ Error syncing historical responses:", err.message);
    showAlert("Error syncing: " + err.message);
  }
}

/**
 * 3. Connection Test
 */
function testWebhookConnection() {
  try {
    var res = postToCircuitron({
      action: "ping",
      source: "project_exhibition_sync_test",
      timestamp: new Date().toISOString(),
    });
    var alertMsg = "Connection Successful!\n\nCircuitron Webhook is online and authenticated.\nServer Response: " + JSON.stringify(res);
    showAlert(alertMsg);
  } catch (err) {
    showAlert("Connection Failed: " + err.message);
  }
}

/**
 * 4. Helper: HTTP POST sender
 */
function postToCircuitron(payload) {
  var options = {
    method: "post",
    contentType: "application/json",
    headers: {
      "x-sync-secret": CONFIG.SYNC_SECRET,
      Authorization: "Bearer " + CONFIG.SYNC_SECRET,
      "Bypass-Tunnel-Reminder": "true",
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  };

  var res = UrlFetchApp.fetch(CONFIG.CIRCUITRON_WEBHOOK_URL, options);
  var statusCode = res.getResponseCode();
  var content = res.getContentText();

  if (statusCode >= 200 && statusCode < 300) {
    try { return JSON.parse(content); } catch (e) { return content; }
  } else {
    throw new Error("HTTP " + statusCode + ": " + content);
  }
}

/**
 * 5. Automatic Trigger Installer: Binds onFormSubmit automatically
 */
function installTrigger() {
  try {
    var triggers = ScriptApp.getProjectTriggers();
    for (var i = 0; i < triggers.length; i++) {
      if (triggers[i].getHandlerFunction() === "onFormSubmit") {
        ScriptApp.deleteTrigger(triggers[i]);
      }
    }

    // Try Google Form container
    try {
      var form = FormApp.getActiveForm();
      if (form) {
        ScriptApp.newTrigger("onFormSubmit").forForm(form).onFormSubmit().create();
        showAlert("✅ Trigger successfully activated for Google Form!\nEvery new submission will now automatically sync to Circuitron.");
        return;
      }
    } catch (err) {}

    // Try Google Sheet container
    try {
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      if (ss) {
        ScriptApp.newTrigger("onFormSubmit").forSpreadsheet(ss).onFormSubmit().create();
        showAlert("✅ Trigger successfully activated for Google Sheet!\nEvery new submission will now automatically sync to Circuitron.");
        return;
      }
    } catch (err) {}

    showAlert("Could not detect active Form or Sheet. Please ensure you opened Apps Script from inside Google Forms or Google Sheets.");
  } catch (e) {
    console.error("Trigger error:", e.message);
    showAlert("Error installing trigger: " + e.message);
  }
}
