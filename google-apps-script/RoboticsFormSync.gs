/**
 * ============================================================================
 * CIRCUITRON: ROBOTICS REGISTRATION SYNCHRONIZER (ROBO WAR & ROBO RACE)
 * TechXpo 2.O — Official Google Apps Script Integration
 * Website: https://www.circuitron.in
 * ============================================================================
 * 
 * This script is specifically configured for the combined Robotics Form:
 * "REGISTRATION FORM (ROBO RACE / ROBO WAR)"
 * 
 * It automatically inspects each participant's "Event Choice" response:
 * - If they selected "Robo Race" -> routed to Robo Race in Admin Dashboard
 * - If they selected "Robo War"  -> routed to Robo War in Admin Dashboard
 * 
 * INSTRUCTIONS:
 * 1. Open the Google Form or Google Sheet for Robo Race / Robo War.
 * 2. Click: Extensions > Apps Script (or Tools > Script editor).
 * 3. Delete any existing code and PASTE THIS ENTIRE SCRIPT.
 * 4. In the top toolbar dropdown, select "installTrigger" and click "Run".
 *    (Accept Google's permission prompt if asked).
 * 5. (Optional) Select "syncAllHistoricalRows" and click "Run" to import
 *    all past responses into the website immediately!
 */

const CONFIG = {
  // Destination Webhook URL (Circuitron Production API)
  CIRCUITRON_WEBHOOK_URL: "https://www.circuitron.in/api/registrations",

  // Integration Secret
  SYNC_SECRET: "circuitron_sync_secure_2026",

  // Fallback Event ID if choice is somehow not found
  FALLBACK_EVENT_ID: "robo-war",
};

/**
 * Helper to determine whether a response is for Robo War or Robo Race
 */
function detectRoboticsEvent(formResponses) {
  if (!formResponses) return CONFIG.FALLBACK_EVENT_ID;

  // Check specific keys first (e.g. "Event Choice", "Competition", "Choose")
  for (var key in formResponses) {
    if (formResponses.hasOwnProperty(key)) {
      var k = String(key).toLowerCase();
      var val = String(formResponses[key]).toLowerCase().trim();

      if (k.indexOf("event") !== -1 || k.indexOf("competition") || k.indexOf("participate") || k.indexOf("choice")) {
        if (val.indexOf("race") !== -1) return "robo-race";
        if (val.indexOf("war") !== -1) return "robo-war";
      }
    }
  }

  // Check all values for exact or partial match
  for (var k2 in formResponses) {
    if (formResponses.hasOwnProperty(k2)) {
      var v2 = String(formResponses[k2]).toLowerCase().trim();
      if (v2 === "robo race" || v2 === "roborace") return "robo-race";
      if (v2 === "robo war" || v2 === "robowar") return "robo-war";
    }
  }

  return CONFIG.FALLBACK_EVENT_ID;
}

/**
 * 1. Real-Time Trigger: Runs automatically whenever a participant submits the form
 */
function onFormSubmit(e) {
  try {
    console.log("⚡ [Robotics] New form submission detected, initiating sync...");

    var payload = {};

    // Triggered directly from Google Form
    if (e && e.response) {
      var itemResponses = e.response.getItemResponses();
      var formResponses = {};

      for (var i = 0; i < itemResponses.length; i++) {
        var item = itemResponses[i];
        var question = item.getItem().getTitle();
        var answer = item.getResponse();
        formResponses[question] = answer;
      }

      var detectedEvent = detectRoboticsEvent(formResponses);

      payload = {
        event_id: detectedEvent,
        source: "google_form",
        submission_id: e.response.getId(),
        timestamp: e.response.getTimestamp().toISOString(),
        respondent_email: e.response.getRespondentEmail() || formResponses["Email Address"] || formResponses["Email"] || "",
        form_responses: formResponses,
      };
    }
    // Triggered from linked Google Sheet
    else if (e && e.namedValues) {
      var namedResponses = {};
      for (var key in e.namedValues) {
        if (e.namedValues.hasOwnProperty(key)) {
          var val = e.namedValues[key];
          namedResponses[key] = Array.isArray(val) ? val.join(", ") : val;
        }
      }

      var detectedEventSheet = detectRoboticsEvent(namedResponses);

      payload = {
        event_id: detectedEventSheet,
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
    console.log("✅ [Robotics] Webhook response:", response);
  } catch (err) {
    console.error("❌ Error in onFormSubmit:", err.message);
  }
}

/**
 * 2. Historical Sync: Imports ALL existing submissions from the Google Sheet
 */
function syncAllHistoricalRows() {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = sheet.getDataRange().getValues();

    if (!data || data.length < 2) {
      var emptyMsg = "No response rows found in this sheet.";
      console.log(emptyMsg);
      try { SpreadsheetApp.getUi().alert(emptyMsg); } catch (e) {}
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
          if (headerName.toLowerCase().indexOf("time") !== -1) {
            timestamp = cellValue.toISOString();
          }
        } else {
          formResponses[headerName] = String(cellValue);
        }

        if (headerName.toLowerCase().indexOf("email") !== -1 && !email) {
          email = String(cellValue).trim();
        }
      }

      var rowEventId = detectRoboticsEvent(formResponses);

      registrations.push({
        event_id: rowEventId,
        source: "google_sheet_historical",
        submission_id: "row_" + (r + 1) + "_" + (email || r),
        timestamp: timestamp,
        respondent_email: email,
        form_responses: formResponses,
      });
    }

    console.log("📦 Sending " + registrations.length + " historical robotics registration(s) to Circuitron...");

    // Send in batches of 50
    var batchSize = 50;
    var totalImported = 0;

    for (var b = 0; b < registrations.length; b += batchSize) {
      var chunk = registrations.slice(b, b + batchSize);
      var payload = {
        source: "google_sheet_batch",
        registrations: chunk,
      };

      postToCircuitron(payload);
      totalImported += chunk.length;
      console.log("Synced batch: " + totalImported + "/" + registrations.length);
    }

    var msg = "🎉 Successfully synchronized " + totalImported + " Robotics (Robo War / Robo Race) registrations into the Circuitron Admin Dashboard!";
    console.log(msg);
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
 * 3. Connection Test: Pings the Circuitron Backend API
 */
function testWebhookConnection() {
  try {
    var payload = {
      action: "ping",
      source: "robotics_form_sync_test",
      timestamp: new Date().toISOString(),
    };

    var res = postToCircuitron(payload);
    console.log("Connection Test Result:", res);
    var alertMsg = "Connection Successful!\n\nCircuitron Webhook is online and authenticated.\nServer Response: " + JSON.stringify(res);
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
 * 5. Automatic Trigger Installer: Run this ONCE to bind onFormSubmit
 */
function installTrigger() {
  try {
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
        try { SpreadsheetApp.getUi().alert("Trigger successfully activated for Google Form!"); } catch (e) {}
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
        try { SpreadsheetApp.getUi().alert("Trigger successfully activated for Google Sheet!"); } catch (e) {}
        return;
      }
    } catch (err) {}

    console.log("Trigger configured.");
  } catch (e) {
    console.error("Trigger installation error:", e.message);
  }
}
