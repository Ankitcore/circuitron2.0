/**
 * ============================================================================
 * CIRCUITRON GOOGLE FORMS & GOOGLE SHEETS AUTOMATIC REGISTRATION SYNCHRONIZER
 * TechXpo 2.O — Official Google Apps Script Integration
 * Website: https://www.circuitron.in
 * ============================================================================
 *
 * HOW TO INSTALL IN 3 MINUTES:
 * ----------------------------------------------------------------------------
 * 1. Open your Google Form or its linked Google Sheet.
 * 2. In the top menu, click: Extensions > Apps Script (or Tools > Script editor).
 * 3. Delete any code in the editor, and paste this ENTIRE file.
 * 4. Update the CONFIG object below (especially CIRCUITRON_WEBHOOK_URL and SYNC_SECRET).
 * 5. In the toolbar, select "installTrigger" and click "Run" (authorize permissions when prompted).
 * 6. (Optional) Run "syncAllHistoricalRows" to import all existing responses immediately!
 * 7. Done! Every new submission is now instantly sent to your Circuitron Admin Dashboard.
 */

const CONFIG = {
  // Destination Webhook URL (Use your live domain or local tunnel)
  CIRCUITRON_WEBHOOK_URL: "https://www.circuitron.in/api/registrations",

  // Integration Secret (Must match REGISTRATION_SYNC_SECRET in your backend)
  SYNC_SECRET: "circuitron_sync_secure_2026",

  // Default Event identifier for this specific form:
  // Use: 'project-exhibition' for Project Exhibition (Eklavya, Lakshya, Arjuna)
  // Use: 'robo-war' for Robo War
  // Use: 'robo-race' for Robo Race
  // Or leave blank '' to let the website auto-detect based on form responses
  DEFAULT_EVENT_ID: "project-exhibition",
};

/**
 * 1. Real-Time Trigger: Executes automatically whenever a participant submits a form
 */
function onFormSubmit(e) {
  try {
    console.log("⚡ New form submission detected, initiating sync...");

    var payload = {};

    // Check if triggered from Google Forms
    if (e && e.response) {
      var itemResponses = e.response.getItemResponses();
      var formResponses = {};

      for (var i = 0; i < itemResponses.length; i++) {
        var item = itemResponses[i];
        var question = item.getItem().getTitle();
        var answer = item.getResponse();
        formResponses[question] = answer;
      }

      payload = {
        event_id: CONFIG.DEFAULT_EVENT_ID,
        source: "google_form",
        submission_id: e.response.getId(),
        timestamp: e.response.getTimestamp().toISOString(),
        respondent_email: e.response.getRespondentEmail() || formResponses["Email Address"] || formResponses["Email"] || "",
        form_responses: formResponses,
      };
    }
    // Check if triggered from Google Sheets
    else if (e && e.namedValues) {
      var namedResponses = {};
      for (var key in e.namedValues) {
        if (e.namedValues.hasOwnProperty(key)) {
          var val = e.namedValues[key];
          namedResponses[key] = Array.isArray(val) ? val.join(", ") : val;
        }
      }

      payload = {
        event_id: CONFIG.DEFAULT_EVENT_ID,
        source: "google_sheet",
        submission_id: "sheet_row_" + (e.range ? e.range.getRow() : Date.now()),
        timestamp: namedResponses["Timestamp"] ? new Date(namedResponses["Timestamp"]).toISOString() : new Date().toISOString(),
        respondent_email: namedResponses["Email Address"] || namedResponses["Email"] || "",
        form_responses: namedResponses,
      };
    } else {
      console.warn("⚠️ Unsupported event object received:", e);
      return;
    }

    // Post to Circuitron Backend API
    var response = postToCircuitron(payload);
    console.log("✅ Webhook response:", response);
  } catch (err) {
    console.error("❌ Error in onFormSubmit:", err.message);
  }
}

/**
 * 2. Historical Sync: Imports ALL existing submissions from the Google Sheet in one click
 */
function syncAllHistoricalRows() {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = sheet.getDataRange().getValues();

    if (!data || data.length < 2) {
      SpreadsheetApp.getUi().alert("No response rows found in this sheet.");
      return;
    }

    var headers = data[0];
    var registrations = [];

    for (var r = 1; r < data.length; r++) {
      var row = data[r];
      var formResponses = {};
      var email = "";
      var timestamp = new Date().toISOString();

      for (var c = 0; c < headers.length; c++) {
        var headerName = String(headers[c]).trim();
        var cellValue = row[c];

        if (cellValue instanceof Date) {
          formResponses[headerName] = cellValue.toISOString();
          if (headerName.toLowerCase().includes("time")) {
            timestamp = cellValue.toISOString();
          }
        } else {
          formResponses[headerName] = String(cellValue);
        }

        if (headerName.toLowerCase().includes("email") && !email) {
          email = String(cellValue).trim();
        }
      }

      registrations.push({
        event_id: CONFIG.DEFAULT_EVENT_ID,
        source: "google_sheet_historical",
        submission_id: "row_" + (r + 1) + "_" + (email || r),
        timestamp: timestamp,
        respondent_email: email,
        form_responses: formResponses,
      });
    }

    console.log("📦 Sending " + registrations.length + " historical registration(s) to Circuitron...");

    // Send in batches of 50 to avoid timeout
    var batchSize = 50;
    var totalImported = 0;

    for (var b = 0; b < registrations.length; b += batchSize) {
      var chunk = registrations.slice(b, b + batchSize);
      var payload = {
        event_id: CONFIG.DEFAULT_EVENT_ID,
        source: "google_sheet_batch",
        registrations: chunk,
      };

      var res = postToCircuitron(payload);
      totalImported += chunk.length;
      console.log("Chunk synced: " + totalImported + "/" + registrations.length);
    }

    var msg = "Successfully synchronized " + totalImported + " historical registrations into the Circuitron Admin Dashboard!";
    console.log("🎉 " + msg);
    try {
      SpreadsheetApp.getUi().alert(msg);
    } catch (e) {}
  } catch (err) {
    console.error("❌ Error syncing historical rows:", err.message);
    try {
      SpreadsheetApp.getUi().alert("Error syncing: " + err.message);
    } catch (e) {}
  }
}

/**
 * 3. Connection Test: Verifies connectivity with Circuitron Backend API
 */
function testWebhookConnection() {
  try {
    var payload = {
      action: "ping",
      source: "google_apps_script_test",
      timestamp: new Date().toISOString(),
    };

    var res = postToCircuitron(payload);
    console.log("Connection Test Result:", res);
    var alertMsg = "Connection Successful!\n\nCircuitron Webhook is active and authenticated.\nServer Response: " + JSON.stringify(res);
    try {
      SpreadsheetApp.getUi().alert(alertMsg);
    } catch (e) {}
  } catch (err) {
    console.error("❌ Connection failed:", err.message);
    try {
      SpreadsheetApp.getUi().alert("Connection Failed: " + err.message);
    } catch (e) {}
  }
}

/**
 * 4. Helper: HTTP POST sender with error handling and authentication
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
    try {
      return JSON.parse(content);
    } catch (e) {
      return content;
    }
  } else {
    throw new Error("HTTP " + statusCode + ": " + content);
  }
}

/**
 * 5. Automatic Trigger Installer: Run this ONCE to automatically bind onFormSubmit
 */
function installTrigger() {
  try {
    // Delete existing triggers for onFormSubmit to avoid duplicates
    var triggers = ScriptApp.getProjectTriggers();
    for (var i = 0; i < triggers.length; i++) {
      if (triggers[i].getHandlerFunction() === "onFormSubmit") {
        ScriptApp.deleteTrigger(triggers[i]);
      }
    }

    // Try installing for Google Form
    try {
      var form = FormApp.getActiveForm();
      if (form) {
        ScriptApp.newTrigger("onFormSubmit")
          .forForm(form)
          .onFormSubmit()
          .create();
        console.log("✅ Trigger successfully bound to Google Form!");
        try {
          SpreadsheetApp.getUi().alert("Trigger successfully activated for Google Form!");
        } catch (e) {}
        return;
      }
    } catch (err) {}

    // Try installing for Google Sheet
    try {
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      if (ss) {
        ScriptApp.newTrigger("onFormSubmit")
          .forSpreadsheet(ss)
          .onFormSubmit()
          .create();
        console.log("✅ Trigger successfully bound to Google Sheet!");
        try {
          SpreadsheetApp.getUi().alert("Trigger successfully activated for Google Sheet!");
        } catch (e) {}
        return;
      }
    } catch (err) {}

    console.log("Could not auto-detect container. Please set an onFormSubmit trigger manually in Apps Script triggers menu.");
  } catch (e) {
    console.error("Trigger installation error:", e.message);
  }
}
