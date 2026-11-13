import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileSpreadsheet,
  Search,
  Filter,
  Download,
  Upload,
  RefreshCw,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  Eye,
  Trash2,
  Copy,
  Check,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Building,
  Mail,
  Phone,
  Tag,
  FileText,
  HelpCircle,
  Layers,
  Send,
  Sparkles,
  Info,
  CheckCheck,
  X,
} from "lucide-react";
import {
  fetchRegistrations,
  updateRegistration,
  deleteRegistration,
  triggerManualSync,
  submitRegistrationBatch,
  downloadRegistrationsCsv,
  syncGoogleSheetsDirect,
} from "../utils/registrationService";

export default function RegistrationManagement() {
  // Data state
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [registrations, setRegistrations] = useState([]);
  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);
  const [collegesList, setCollegesList] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [successToast, setSuccessToast] = useState("");

  // Filter & Pagination state
  const [selectedEvent, setSelectedEvent] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedCollege, setSelectedCollege] = useState("all");
  const [duplicateFilter, setDuplicateFilter] = useState("no_duplicates"); // 'no_duplicates' (default) | 'all' | 'duplicates_only'
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("newest"); // 'newest' | 'oldest' | 'name'
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [totalPages, setTotalPages] = useState(1);

  // Modals state
  const [selectedRegDetails, setSelectedRegDetails] = useState(null);
  const [editingNotes, setEditingNotes] = useState("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [showWebhookGuide, setShowWebhookGuide] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [copiedField, setCopiedField] = useState(null);

  // Import Modal state
  const [importTargetEvent, setImportTargetEvent] = useState("project-exhibition");
  const [importCsvText, setImportCsvText] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [importPreview, setImportPreview] = useState([]);
  const [importResult, setImportResult] = useState(null);

  // Webhook ping state
  const [isPinging, setIsPinging] = useState(false);
  const [pingResult, setPingResult] = useState(null);
  const [copiedAppsScript, setCopiedAppsScript] = useState(false);

  // Google Sheets Direct Sync state
  const [showSheetsModal, setShowSheetsModal] = useState(false);
  const [sheetExhibitionUrl, setSheetExhibitionUrl] = useState(() => {
    if (typeof window !== "undefined") return localStorage.getItem("circuitron_sheet_exhibition") || "";
    return "";
  });
  const [sheetRoboticsUrl, setSheetRoboticsUrl] = useState(() => {
    if (typeof window !== "undefined") return localStorage.getItem("circuitron_sheet_robotics") || "";
    return "";
  });
  const [isSyncingSheets, setIsSyncingSheets] = useState(false);
  const [sheetsSyncResult, setSheetsSyncResult] = useState(null);

  // Load registrations from backend API
  const loadData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    setErrorMessage("");
    try {
      const data = await fetchRegistrations({
        event: selectedEvent,
        status: selectedStatus,
        college: selectedCollege,
        duplicate: duplicateFilter,
        search: searchQuery,
        sort: sortOption,
        page,
        limit,
      });

      setRegistrations(data.registrations || []);
      setStats(data.stats || null);
      setEvents(data.events || []);
      setCollegesList(data.collegesList || []);
      setTotalRecords(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      setErrorMessage(err.message || "Failed to load registrations from backend.");
    } finally {
      if (!isSilent) setLoading(false);
      setSyncing(false);
    }
  }, [selectedEvent, selectedStatus, selectedCollege, duplicateFilter, searchQuery, sortOption, page, limit]);

  // Initial load & dependency re-fetch
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Toast auto-clear
  useEffect(() => {
    if (successToast) {
      const timer = setTimeout(() => setSuccessToast(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [successToast]);

  // Copy helper
  const handleCopy = (text, fieldName) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2500);
  };

  // Trigger manual sync / status refresh
  const handleManualSync = async () => {
    setSyncing(true);
    try {
      const res = await triggerManualSync();
      setSuccessToast(res.message || "Synchronized with backend!");
      await loadData(true);
    } catch (err) {
      setErrorMessage("Sync failed: " + err.message);
      setSyncing(false);
    }
  };

  // Status Change handler
  const handleStatusChange = async (registrationId, newStatus) => {
    setIsUpdatingStatus(true);
    try {
      await updateRegistration(registrationId, {
        verificationStatus: newStatus,
        adminNotes: editingNotes,
      });

      setSuccessToast(`Updated status to ${newStatus.toUpperCase()}`);
      if (selectedRegDetails && selectedRegDetails.registration_id === registrationId) {
        setSelectedRegDetails((prev) => ({
          ...prev,
          verification_status: newStatus,
          admin_notes: editingNotes,
        }));
      }
      await loadData(true);
    } catch (err) {
      setErrorMessage("Failed to update status: " + err.message);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Save notes
  const handleSaveNotes = async () => {
    if (!selectedRegDetails) return;
    setIsUpdatingStatus(true);
    try {
      await updateRegistration(selectedRegDetails.registration_id, {
        verificationStatus: selectedRegDetails.verification_status,
        adminNotes: editingNotes,
      });
      setSuccessToast("Notes saved successfully!");
      setSelectedRegDetails((prev) => ({
        ...prev,
        admin_notes: editingNotes,
      }));
      await loadData(true);
    } catch (err) {
      setErrorMessage("Failed to save notes: " + err.message);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Delete registration handler
  const handleDeleteRegistration = async (registrationId) => {
    if (!window.confirm(`Are you sure you want to permanently delete registration ${registrationId}?`)) {
      return;
    }

    try {
      await deleteRegistration(registrationId);
      setSuccessToast(`Registration ${registrationId} deleted successfully.`);
      if (selectedRegDetails && selectedRegDetails.registration_id === registrationId) {
        setSelectedRegDetails(null);
      }
      await loadData();
    } catch (err) {
      setErrorMessage("Delete failed: " + err.message);
    }
  };

  // Parse CSV for Import Modal preview
  const handleCsvTextChange = (text) => {
    setImportCsvText(text);
    setImportResult(null);
    if (!text.trim()) {
      setImportPreview([]);
      return;
    }

    try {
      const lines = text.trim().split(/\r?\n/).filter(Boolean);
      if (lines.length < 2) {
        setImportPreview([]);
        return;
      }

      // Simple CSV header parse (supports quotes)
      const parseLine = (line) => {
        const result = [];
        let cur = "";
        let inQuote = false;
        for (let i = 0; i < line.length; i++) {
          const c = line[i];
          if (c === '"') {
            inQuote = !inQuote;
          } else if (c === "," && !inQuote) {
            result.push(cur.trim().replace(/^"|"$/g, ""));
            cur = "";
          } else {
            cur += c;
          }
        }
        result.push(cur.trim().replace(/^"|"$/g, ""));
        return result;
      };

      const headers = parseLine(lines[0]);
      const rows = [];
      for (let i = 1; i < Math.min(lines.length, 6); i++) {
        const cols = parseLine(lines[i]);
        const obj = {};
        headers.forEach((h, idx) => {
          obj[h] = cols[idx] || "";
        });
        rows.push(obj);
      }
      setImportPreview(rows);
    } catch (e) {
      setImportPreview([]);
    }
  };

  // Execute Batch Import
  const handleExecuteImport = async () => {
    if (!importCsvText.trim()) return;
    setIsImporting(true);
    setImportResult(null);

    try {
      const lines = importCsvText.trim().split(/\r?\n/).filter(Boolean);
      if (lines.length < 2) {
        throw new Error("CSV requires a header line and at least one data row.");
      }

      const parseLine = (line) => {
        const result = [];
        let cur = "";
        let inQuote = false;
        for (let i = 0; i < line.length; i++) {
          const c = line[i];
          if (c === '"') {
            inQuote = !inQuote;
          } else if (c === "," && !inQuote) {
            result.push(cur.trim().replace(/^"|"$/g, ""));
            cur = "";
          } else {
            cur += c;
          }
        }
        result.push(cur.trim().replace(/^"|"$/g, ""));
        return result;
      };

      const headers = parseLine(lines[0]);
      const recordsToImport = [];

      for (let i = 1; i < lines.length; i++) {
        const cols = parseLine(lines[i]);
        if (!cols.some((c) => c.trim())) continue;

        const formResponses = {};
        let email = "";
        let timestamp = new Date().toISOString();

        headers.forEach((h, idx) => {
          const val = cols[idx] || "";
          formResponses[h] = val;
          if (h.toLowerCase().includes("email") && !email) email = val;
          if (h.toLowerCase().includes("time")) timestamp = val;
        });

        recordsToImport.push({
          event_id: importTargetEvent,
          source: "csv_import",
          submission_id: `csv_row_${i}_${Date.now()}`,
          timestamp,
          respondent_email: email,
          form_responses: formResponses,
        });
      }

      const res = await submitRegistrationBatch(recordsToImport, importTargetEvent);
      setImportResult({
        success: true,
        message: `Successfully imported ${res.newRecords || recordsToImport.length} registration(s)! (${res.duplicates || 0} duplicates prevented)`,
      });
      setSuccessToast(`Imported ${recordsToImport.length} records!`);
      await loadData();
    } catch (err) {
      setImportResult({
        success: false,
        message: err.message || "Failed to import CSV",
      });
    } finally {
      setIsImporting(false);
    }
  };

  // Direct Google Sheets Synchronizer
  const handleSyncSheetsDirect = async () => {
    setIsSyncingSheets(true);
    setSheetsSyncResult(null);
    try {
      if (typeof window !== "undefined") {
        if (sheetExhibitionUrl) localStorage.setItem("circuitron_sheet_exhibition", sheetExhibitionUrl);
        if (sheetRoboticsUrl) localStorage.setItem("circuitron_sheet_robotics", sheetRoboticsUrl);
      }

      const sheets = [];
      if (sheetExhibitionUrl.trim()) {
        sheets.push({ url: sheetExhibitionUrl.trim(), event_id: "project-exhibition" });
      }
      if (sheetRoboticsUrl.trim()) {
        sheets.push({ url: sheetRoboticsUrl.trim(), event_id: "robo-war" });
      }

      if (sheets.length === 0) {
        throw new Error("Please enter at least one Google Sheet URL or Spreadsheet ID.");
      }

      const res = await syncGoogleSheetsDirect(sheets);
      setSheetsSyncResult({
        success: true,
        message: `Successfully synchronized ${res.processed || 0} registration(s) directly from Google Sheets!`,
      });
      setSuccessToast(`Synchronized ${res.processed || 0} registration(s)!`);
      await loadData();
    } catch (err) {
      setSheetsSyncResult({
        success: false,
        message: err.message || "Failed to sync Google Sheets.",
      });
    } finally {
      setIsSyncingSheets(false);
    }
  };

  // Ping Webhook
  const handleTestPing = async () => {
    setIsPinging(true);
    setPingResult(null);
    try {
      const res = await triggerManualSync();
      setPingResult({
        success: true,
        message: "Circuitron Webhook is online and responsive!",
        data: res,
      });
    } catch (err) {
      setPingResult({
        success: false,
        message: err.message || "Ping failed",
      });
    } finally {
      setIsPinging(false);
    }
  };

  // Google Apps Script sample code
  const appsScriptCode = `/**
 * TechXpo 2.O — Official Google Forms & Sheets Webhook Synchronizer
 * Automatically synchronizes submissions to Circuitron Admin Dashboard
 */
const CONFIG = {
  CIRCUITRON_WEBHOOK_URL: "https://www.circuitron.in/api/registrations",
  SYNC_SECRET: "circuitron_sync_secure_2026",
  DEFAULT_EVENT_ID: "${selectedEvent !== "all" ? selectedEvent : "project-exhibition"}"
};

function onFormSubmit(e) {
  try {
    var payload = {};
    if (e && e.response) {
      var itemResponses = e.response.getItemResponses();
      var formResponses = {};
      for (var i = 0; i < itemResponses.length; i++) {
        formResponses[itemResponses[i].getItem().getTitle()] = itemResponses[i].getResponse();
      }
      payload = {
        event_id: CONFIG.DEFAULT_EVENT_ID,
        source: "google_form",
        submission_id: e.response.getId(),
        timestamp: e.response.getTimestamp().toISOString(),
        respondent_email: e.response.getRespondentEmail() || formResponses["Email Address"] || "",
        form_responses: formResponses
      };
    } else if (e && e.namedValues) {
      var named = {};
      for (var k in e.namedValues) {
        named[k] = Array.isArray(e.namedValues[k]) ? e.namedValues[k].join(", ") : e.namedValues[k];
      }
      payload = {
        event_id: CONFIG.DEFAULT_EVENT_ID,
        source: "google_sheet",
        submission_id: "sheet_" + Date.now(),
        timestamp: named["Timestamp"] || new Date().toISOString(),
        respondent_email: named["Email Address"] || "",
        form_responses: named
      };
    }
    
    var options = {
      method: "post",
      contentType: "application/json",
      headers: { "x-sync-secret": CONFIG.SYNC_SECRET },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };
    UrlFetchApp.fetch(CONFIG.CIRCUITRON_WEBHOOK_URL, options);
  } catch(err) {
    console.error("Sync error:", err.message);
  }
}

function syncAllHistoricalRows() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = sheet.getDataRange().getValues();
  if (data.length < 2) return;
  var headers = data[0];
  var list = [];
  for (var r = 1; r < data.length; r++) {
    var row = data[r];
    var responses = {};
    for (var c = 0; c < headers.length; c++) {
      responses[headers[c]] = row[c];
    }
    list.push({
      event_id: CONFIG.DEFAULT_EVENT_ID,
      source: "google_sheet_historical",
      submission_id: "row_" + (r + 1),
      timestamp: responses["Timestamp"] || new Date().toISOString(),
      form_responses: responses
    });
  }
  var options = {
    method: "post",
    contentType: "application/json",
    headers: { "x-sync-secret": CONFIG.SYNC_SECRET },
    payload: JSON.stringify({ registrations: list }),
    muteHttpExceptions: true
  };
  UrlFetchApp.fetch(CONFIG.CIRCUITRON_WEBHOOK_URL, options);
  SpreadsheetApp.getUi().alert("Synchronized " + list.length + " historical registrations!");
}`;

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      <AnimatePresence>
        {successToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-6 z-[100000] p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 backdrop-blur-md shadow-2xl flex items-center space-x-3 text-sm font-bold font-mono"
          >
            <CheckCheck className="w-5 h-5 text-emerald-400" />
            <span>{successToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage("")} className="text-rose-400 hover:text-white font-bold">
            Dismiss
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. METRICS & OVERVIEW CARDS                                                */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Card 1: Total Registrations */}
        <div className="glass-card p-4 rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-darkNavy to-darkNavy flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest font-bold">
              Total Registrations
            </span>
            <FileSpreadsheet className="w-4 h-4 text-primary" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-black font-orbitron text-white">
              {stats?.totalRegistrations ?? totalRecords}
            </span>
            <span className="text-[10px] font-mono text-emerald-400">All Forms</span>
          </div>
        </div>

        {/* Card 2: Today's Registrations */}
        <div className="glass-card p-4 rounded-2xl border border-accent/30 bg-gradient-to-br from-accent/10 via-darkNavy to-darkNavy flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest font-bold">
              Today's Submissions
            </span>
            <Calendar className="w-4 h-4 text-accent" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-black font-orbitron text-accent">
              {stats?.todayRegistrations ?? 0}
            </span>
            <span className="text-[10px] font-mono text-gray-400">Past 24h</span>
          </div>
        </div>

        {/* Card 3: Project Exhibition */}
        <div className="glass-card p-4 rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-darkNavy to-darkNavy flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest font-bold">
              Project Exhibition
            </span>
            <span className="text-[9px] font-mono text-gray-400">₹54,000 Pool</span>
          </div>
          <div className="mt-2">
            <span className="text-2xl sm:text-3xl font-black font-orbitron text-emerald-300">
              {stats?.eventCounts?.["project-exhibition"] ?? 0}
            </span>
            <div className="flex items-center space-x-2 mt-1 text-[9px] font-mono text-gray-400">
              <span>E: {stats?.exhibitionGroupCounts?.eklavya ?? 0}</span>
              <span>•</span>
              <span>L: {stats?.exhibitionGroupCounts?.lakshya ?? 0}</span>
              <span>•</span>
              <span>A: {stats?.exhibitionGroupCounts?.arjuna ?? 0}</span>
            </div>
          </div>
        </div>

        {/* Card 4: Robotics Competitions */}
        <div className="glass-card p-4 rounded-2xl border border-rose-500/30 bg-gradient-to-br from-rose-500/10 via-darkNavy to-darkNavy flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-rose-400 uppercase tracking-widest font-bold">
              Robo War & Race
            </span>
            <span className="text-[9px] font-mono text-gray-400">₹20,000 Pool</span>
          </div>
          <div className="mt-2 flex items-baseline space-x-3">
            <div>
              <span className="text-xl sm:text-2xl font-black font-orbitron text-rose-400">
                {stats?.eventCounts?.["robo-war"] ?? 0}
              </span>
              <span className="text-[9px] font-mono text-gray-400 ml-1">War</span>
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-black font-orbitron text-cyan-400">
                {stats?.eventCounts?.["robo-race"] ?? 0}
              </span>
              <span className="text-[9px] font-mono text-gray-400 ml-1">Race</span>
            </div>
          </div>
        </div>

        {/* Card 5: Sync Status & Health */}
        <div className="col-span-2 lg:col-span-1 glass-card p-4 rounded-2xl border border-white/10 bg-darkNavy flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest font-bold">
              Sync Engine
            </span>
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">
                {stats?.syncHealth || "Active"}
              </span>
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <div className="text-[10px] font-mono text-gray-400 truncate max-w-[120px]">
              {stats?.lastSyncTime ? new Date(stats.lastSyncTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Connected"}
            </div>
            <button
              onClick={handleManualSync}
              disabled={syncing}
              className="btn-secondary py-1.5 px-3 text-[10px] font-bold flex items-center space-x-1 shadow-sm"
              title="Synchronize from Cloud Database"
            >
              <RefreshCw className={`w-3 h-3 text-accent ${syncing ? "animate-spin" : ""}`} />
              <span>{syncing ? "Syncing..." : "Sync Now"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. EVENT SELECTOR TABS & ACTION TOOLBAR                                    */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Event selector tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-white/5 border border-white/10">
          <button
            onClick={() => { setSelectedEvent("all"); setPage(1); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              selectedEvent === "all"
                ? "bg-primary text-black shadow-neon"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <span>All Events</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20 font-mono">
              {stats?.totalRegistrations ?? 0}
            </span>
          </button>

          <button
            onClick={() => { setSelectedEvent("project-exhibition"); setPage(1); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              selectedEvent === "project-exhibition"
                ? "bg-emerald-500 text-black shadow-neon"
                : "text-gray-400 hover:text-emerald-300 hover:bg-white/5"
            }`}
          >
            <span>Project Exhibition</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20 font-mono">
              {stats?.eventCounts?.["project-exhibition"] ?? 0}
            </span>
          </button>

          <button
            onClick={() => { setSelectedEvent("robo-war"); setPage(1); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              selectedEvent === "robo-war"
                ? "bg-rose-500 text-black shadow-neon"
                : "text-gray-400 hover:text-rose-300 hover:bg-white/5"
            }`}
          >
            <span>Robo War</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20 font-mono">
              {stats?.eventCounts?.["robo-war"] ?? 0}
            </span>
          </button>

          <button
            onClick={() => { setSelectedEvent("robo-race"); setPage(1); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              selectedEvent === "robo-race"
                ? "bg-cyan-500 text-black shadow-neon"
                : "text-gray-400 hover:text-cyan-300 hover:bg-white/5"
            }`}
          >
            <span>Robo Race</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20 font-mono">
              {stats?.eventCounts?.["robo-race"] ?? 0}
            </span>
          </button>
        </div>

        {/* Top Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowSheetsModal(true)}
            className="btn-secondary py-2 px-3 text-xs font-bold flex items-center space-x-1.5 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/20"
            title="Connect & directly sync Google Sheets response spreadsheets"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Connect Sheets</span>
          </button>

          <button
            onClick={() => downloadRegistrationsCsv(selectedEvent)}
            className="btn-secondary py-2 px-3 text-xs font-bold flex items-center space-x-1.5 hover:border-emerald-500/40 hover:text-emerald-300"
            title="Download CSV Spreadsheet with complete responses"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setShowImportModal(true)}
            className="btn-secondary py-2 px-3 text-xs font-bold flex items-center space-x-1.5 hover:border-accent/40 hover:text-accent"
            title="Import historical submissions from Google Sheets"
          >
            <Upload className="w-3.5 h-3.5 text-accent" />
            <span>Import Data</span>
          </button>

          <button
            onClick={() => setShowWebhookGuide(true)}
            className="btn-primary py-2 px-3 text-xs font-bold flex items-center space-x-1.5 shadow-neon"
            title="View Google Forms Webhook Setup & Google Apps Script"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Google Forms Integration</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. MULTI-FILTER & SEARCH TOOLBAR                                          */}
      {/* ========================================================================= */}
      <div className="glass-card p-4 rounded-2xl border border-white/10 bg-darkNavy/80 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
            placeholder="Search by participant name, email, phone, college, project title, or ID..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-xs font-mono focus:border-primary/50 focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-xs"
            >
              &times;
            </button>
          )}
        </div>

        {/* Secondary Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status filter */}
          <select
            value={selectedStatus}
            onChange={(e) => { setSelectedStatus(e.target.value); setPage(1); }}
            className="py-2 px-3 rounded-xl bg-white/5 border border-white/10 text-gray-300 text-xs font-mono focus:border-primary/50 focus:outline-none"
          >
            <option value="all" className="bg-darkNavy text-white">All Statuses</option>
            <option value="pending" className="bg-darkNavy text-amber-300">Pending</option>
            <option value="verified" className="bg-darkNavy text-emerald-300">Verified</option>
            <option value="rejected" className="bg-darkNavy text-rose-300">Rejected</option>
          </select>

          {/* Duplicate filter */}
          <select
            value={duplicateFilter}
            onChange={(e) => { setDuplicateFilter(e.target.value); setPage(1); }}
            className="py-2 px-3 rounded-xl bg-white/5 border border-white/10 text-gray-300 text-xs font-mono focus:border-primary/50 focus:outline-none"
          >
            <option value="no_duplicates" className="bg-darkNavy text-emerald-400">Unique Participants (Clean)</option>
            <option value="all" className="bg-darkNavy text-white">Show All Submissions</option>
            <option value="duplicates_only" className="bg-darkNavy text-amber-400">Duplicates Only</option>
          </select>

          {/* College Filter */}
          {collegesList.length > 0 && (
            <select
              value={selectedCollege}
              onChange={(e) => { setSelectedCollege(e.target.value); setPage(1); }}
              className="py-2 px-3 rounded-xl bg-white/5 border border-white/10 text-gray-300 text-xs font-mono focus:border-primary/50 focus:outline-none max-w-[150px] truncate"
            >
              <option value="all" className="bg-darkNavy text-white">All Colleges</option>
              {collegesList.map((c) => (
                <option key={c} value={c} className="bg-darkNavy text-white">
                  {c}
                </option>
              ))}
            </select>
          )}

          {/* Sort order */}
          <select
            value={sortOption}
            onChange={(e) => { setSortOption(e.target.value); setPage(1); }}
            className="py-2 px-3 rounded-xl bg-white/5 border border-white/10 text-gray-300 text-xs font-mono focus:border-primary/50 focus:outline-none"
          >
            <option value="newest" className="bg-darkNavy text-white">Newest First</option>
            <option value="oldest" className="bg-darkNavy text-white">Oldest First</option>
            <option value="name" className="bg-darkNavy text-white">Name (A-Z)</option>
          </select>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. REGISTRATIONS DATA TABLE & CARDS                                       */}
      {/* ========================================================================= */}
      <div className="glass-card rounded-2xl border border-white/10 overflow-hidden bg-darkNavy/90">
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-accent animate-spin mx-auto" />
            <p className="text-xs font-mono text-gray-400">Retrieving registrations from database...</p>
          </div>
        ) : registrations.length === 0 ? (
          <div className="py-20 px-4 text-center space-y-4">
            <FileSpreadsheet className="w-12 h-12 text-gray-600 mx-auto" />
            <div className="space-y-1">
              <h4 className="text-lg font-bold font-orbitron text-white">No Registrations Found</h4>
              <p className="text-xs font-mono text-gray-400 max-w-md mx-auto">
                {searchQuery || selectedEvent !== "all" || selectedStatus !== "all"
                  ? "No registrations match your current search and filter criteria."
                  : "Google Form submissions will automatically appear here once participants register or when historical responses are imported."}
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setShowWebhookGuide(true)}
                className="btn-primary py-2 px-4 text-xs font-bold flex items-center space-x-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Connect Google Forms</span>
              </button>
              <button
                onClick={() => setShowImportModal(true)}
                className="btn-secondary py-2 px-4 text-xs font-bold flex items-center space-x-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Import CSV</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/5 text-[10px] font-mono uppercase tracking-wider text-gray-400">
                  <th className="py-3 px-4">ID & Source</th>
                  <th className="py-3 px-4">Participant</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Event / Program</th>
                  <th className="py-3 px-4">Category / Project</th>
                  <th className="py-3 px-4">Submitted At</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs font-mono">
                {registrations.map((reg) => {
                  const eventId = (reg.event_id || "").toLowerCase();
                  const eventBadgeColor = eventId.includes("war")
                    ? "bg-rose-500/20 text-rose-300 border-rose-500/30"
                    : eventId.includes("race")
                    ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/30"
                    : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";

                  const statusColor =
                    reg.verification_status === "verified"
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                      : reg.verification_status === "rejected"
                      ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                      : "bg-amber-500/20 text-amber-300 border-amber-500/40";

                  return (
                    <tr
                      key={reg.registration_id}
                      className="hover:bg-white/[0.03] transition-colors group cursor-pointer"
                      onClick={() => {
                        setSelectedRegDetails(reg);
                        setEditingNotes(reg.admin_notes || "");
                      }}
                    >
                      {/* Registration ID */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-white group-hover:text-primary transition-colors flex items-center space-x-1.5">
                          <span>{reg.registration_id}</span>
                          {reg.is_duplicate && (
                            <span
                              className="px-1.5 py-0.2 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-bold"
                              title="Multiple submissions from this participant for this event"
                            >
                              DUP
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-gray-500 block">
                          {reg.source === "google_form" ? "Google Form" : "Google Sheet"}
                        </span>
                      </td>

                      {/* Participant Profile */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-white truncate max-w-[160px]">
                          {reg.participant_details?.name || "Participant"}
                        </div>
                        <div className="text-[10px] text-gray-400 truncate max-w-[180px]">
                          {reg.participant_details?.college || "RVSCET Jamshedpur"}
                          {reg.participant_details?.department && ` • ${reg.participant_details.department}`}
                        </div>
                      </td>

                      {/* Contact Details with Quick Copy */}
                      <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center space-x-1.5">
                          <span className="truncate max-w-[150px] text-gray-300">
                            {reg.participant_details?.email || "—"}
                          </span>
                          {reg.participant_details?.email && (
                            <button
                              onClick={() => handleCopy(reg.participant_details.email, `email_${reg.registration_id}`)}
                              className="text-gray-500 hover:text-white p-1 rounded hover:bg-white/5 transition-colors"
                              title="Copy Email"
                            >
                              {copiedField === `email_${reg.registration_id}` ? (
                                <Check className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          )}
                        </div>
                        <div className="flex items-center space-x-1.5 text-[10px] text-gray-400">
                          <span>{reg.participant_details?.phone || "—"}</span>
                          {reg.participant_details?.phone && (
                            <button
                              onClick={() => handleCopy(reg.participant_details.phone, `phone_${reg.registration_id}`)}
                              className="text-gray-500 hover:text-white p-0.5 rounded hover:bg-white/5 transition-colors"
                              title="Copy Phone"
                            >
                              {copiedField === `phone_${reg.registration_id}` ? (
                                <Check className="w-2.5 h-2.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-2.5 h-2.5" />
                              )}
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Event */}
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold border ${eventBadgeColor}`}>
                          {reg.event_name || reg.event_id}
                        </span>
                      </td>

                      {/* Category / Project Title */}
                      <td className="py-3 px-4">
                        <div className="text-gray-200 truncate max-w-[140px] font-medium">
                          {reg.participant_details?.project_title || reg.participant_details?.category || "—"}
                        </div>
                        {reg.participant_details?.year && (
                          <span className="text-[10px] text-gray-500 block">
                            {reg.participant_details.year}
                          </span>
                        )}
                      </td>

                      {/* Submitted At */}
                      <td className="py-3 px-4 text-gray-400 text-[11px]">
                        <div>{new Date(reg.submitted_at).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}</div>
                        <div className="text-[10px] text-gray-500">{new Date(reg.submitted_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                      </td>

                      {/* Verification Status */}
                      <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase ${statusColor}`}>
                          {reg.verification_status || "pending"}
                        </span>
                      </td>

                      {/* Action buttons */}
                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => {
                              setSelectedRegDetails(reg);
                              setEditingNotes(reg.admin_notes || "");
                            }}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
                            title="View Full Registration Dossier"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteRegistration(reg.registration_id)}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                            title="Delete Registration"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 5. PAGINATION CONTROLS                                                    */}
        {/* ========================================================================= */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-gray-400">
            <div>
              Showing <span className="text-white font-bold">{(page - 1) * limit + 1}</span> to{" "}
              <span className="text-white font-bold">{Math.min(page * limit, totalRecords)}</span> of{" "}
              <span className="text-white font-bold">{totalRecords}</span> registrations
            </div>

            <div className="flex items-center space-x-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="btn-secondary py-1.5 px-3 text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>

              <span className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white font-bold">
                {page} / {totalPages}
              </span>

              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="btn-secondary py-1.5 px-3 text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-1"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 6. REGISTRATION DETAILS DOSSIER MODAL                                     */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {selectedRegDetails && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] bg-black/90 backdrop-blur-md flex items-start sm:items-center justify-center p-3 sm:p-6 pt-20 sm:pt-24 pb-12 overflow-y-auto"
            onClick={() => setSelectedRegDetails(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="max-w-2xl w-full p-6 sm:p-8 rounded-3xl border border-primary/40 space-y-6 shadow-[0_0_50px_rgba(0,0,0,0.95)] relative my-auto bg-[#0a0f29] text-white"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-start justify-between border-b border-white/10 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold">
                      OFFICIAL REGISTRATION DOSSIER
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-white/10 text-gray-300 text-[10px] font-mono">
                      {selectedRegDetails.source === "google_form" ? "Google Form" : "Google Sheet"}
                    </span>
                  </div>
                  <h3 className="text-2xl font-black font-orbitron text-white">
                    {selectedRegDetails.participant_details?.name || "Participant"}
                  </h3>
                  <p className="text-xs text-gray-400 font-mono">
                    ID: <span className="text-accent">{selectedRegDetails.registration_id}</span> &bull; Event:{" "}
                    <span className="text-white font-bold">{selectedRegDetails.event_name}</span>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedRegDetails(null)}
                  className="p-2.5 rounded-xl bg-white/10 hover:bg-rose-500 hover:text-white border border-white/10 text-gray-300 transition-all cursor-pointer flex-shrink-0"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status and Action Controls */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-gray-400 font-bold uppercase">
                    Verification Status
                  </span>
                  <div className="flex items-center space-x-2">
                    <button
                      disabled={isUpdatingStatus}
                      onClick={() => handleStatusChange(selectedRegDetails.registration_id, "verified")}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                        selectedRegDetails.verification_status === "verified"
                          ? "bg-emerald-500 text-black shadow-neon"
                          : "bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
                      }`}
                    >
                      Verify
                    </button>
                    <button
                      disabled={isUpdatingStatus}
                      onClick={() => handleStatusChange(selectedRegDetails.registration_id, "pending")}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                        selectedRegDetails.verification_status === "pending"
                          ? "bg-amber-500 text-black"
                          : "bg-amber-500/10 text-amber-300 hover:bg-amber-500/20"
                      }`}
                    >
                      Pending
                    </button>
                    <button
                      disabled={isUpdatingStatus}
                      onClick={() => handleStatusChange(selectedRegDetails.registration_id, "rejected")}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                        selectedRegDetails.verification_status === "rejected"
                          ? "bg-rose-500 text-white"
                          : "bg-rose-500/10 text-rose-300 hover:bg-rose-500/20"
                      }`}
                    >
                      Reject
                    </button>
                  </div>
                </div>

                {/* Coordinator Internal Notes */}
                <div className="pt-2 border-t border-white/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-gray-400">Coordinator Notes:</span>
                    <button
                      onClick={handleSaveNotes}
                      disabled={isUpdatingStatus}
                      className="text-[10px] font-mono text-primary hover:underline font-bold"
                    >
                      Save Notes
                    </button>
                  </div>
                  <textarea
                    rows={2}
                    value={editingNotes}
                    onChange={(e) => setEditingNotes(e.target.value)}
                    placeholder="Add internal notes regarding this registration (e.g. fee verified, team confirmed)..."
                    className="w-full p-2.5 rounded-xl bg-black/30 border border-white/10 text-xs text-white placeholder-gray-500 font-mono focus:border-primary/40 focus:outline-none"
                  />
                </div>
              </div>

              {/* Participant Quick Profile */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
                  <span className="text-[10px] text-gray-500 uppercase font-bold block">Email Address</span>
                  <div className="flex items-center justify-between">
                    <span className="text-white truncate">{selectedRegDetails.participant_details?.email || "—"}</span>
                    {selectedRegDetails.participant_details?.email && (
                      <button
                        onClick={() => handleCopy(selectedRegDetails.participant_details.email, "dossier_email")}
                        className="text-gray-400 hover:text-white p-1"
                        title="Copy"
                      >
                        {copiedField === "dossier_email" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
                  <span className="text-[10px] text-gray-500 uppercase font-bold block">Phone Number</span>
                  <div className="flex items-center justify-between">
                    <span className="text-white">{selectedRegDetails.participant_details?.phone || "—"}</span>
                    {selectedRegDetails.participant_details?.phone && (
                      <button
                        onClick={() => handleCopy(selectedRegDetails.participant_details.phone, "dossier_phone")}
                        className="text-gray-400 hover:text-white p-1"
                        title="Copy"
                      >
                        {copiedField === "dossier_phone" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
                  <span className="text-[10px] text-gray-500 uppercase font-bold block">College / Institution</span>
                  <span className="text-white block">{selectedRegDetails.participant_details?.college || "RVSCET Jamshedpur"}</span>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
                  <span className="text-[10px] text-gray-500 uppercase font-bold block">Department & Year</span>
                  <span className="text-white block">
                    {selectedRegDetails.participant_details?.department || "—"}{" "}
                    {selectedRegDetails.participant_details?.year && `(${selectedRegDetails.participant_details.year})`}
                  </span>
                </div>
              </div>

              {/* Complete Original Form Responses (Preserves every question & answer) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-accent font-bold flex items-center space-x-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Submitted Form Responses (Full Raw Data)</span>
                  </h4>
                  <span className="text-[10px] font-mono text-gray-500">
                    {Object.keys(selectedRegDetails.form_responses || {}).length} Fields Recorded
                  </span>
                </div>

                <div className="max-h-[280px] overflow-y-auto space-y-2 pr-1">
                  {Object.entries(selectedRegDetails.form_responses || {}).map(([question, answer], idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-black/20 border border-white/5 space-y-1 hover:border-white/10 transition-colors"
                    >
                      <span className="text-[11px] font-bold text-gray-300 block">{question}</span>
                      <span className="text-xs text-white block break-words whitespace-pre-wrap">
                        {Array.isArray(answer) ? answer.join(", ") : String(answer || "—")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submission Metadata */}
              <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between text-[10px] font-mono text-gray-500 gap-2">
                <span>Submitted: {new Date(selectedRegDetails.submitted_at).toLocaleString()}</span>
                <span>Synced: {new Date(selectedRegDetails.synced_at).toLocaleString()}</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 7. GOOGLE WEBHOOK & APPS SCRIPT SETUP GUIDE MODAL                        */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showWebhookGuide && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] bg-black/90 backdrop-blur-md flex items-start sm:items-center justify-center p-3 sm:p-6 pt-20 sm:pt-24 pb-12 overflow-y-auto"
            onClick={() => setShowWebhookGuide(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="max-w-3xl w-full p-6 sm:p-8 rounded-3xl border border-primary/40 space-y-6 shadow-[0_0_50px_rgba(0,0,0,0.95)] relative my-auto bg-[#0a0f29] text-white"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-start justify-between border-b border-white/10 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold">
                      AUTOMATED GOOGLE FORMS INTEGRATION
                    </span>
                  </div>
                  <h3 className="text-2xl font-black font-orbitron text-white">
                    Google Apps Script Setup Guide
                  </h3>
                  <p className="text-xs text-gray-400 font-mono">
                    Connect your existing Google Forms or Google Sheets directly to this Admin Dashboard in 3 simple steps.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowWebhookGuide(false)}
                  className="p-2.5 rounded-xl bg-white/10 hover:bg-rose-500 hover:text-white border border-white/10 text-gray-300 transition-all cursor-pointer flex-shrink-0"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Step by step */}
              <div className="space-y-4 text-xs font-mono">
                {/* Step 1 */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                  <div className="flex items-center space-x-2 text-white font-bold">
                    <span className="w-5 h-5 rounded-full bg-primary text-black flex items-center justify-center text-[10px] font-bold">
                      1
                    </span>
                    <span>Open Apps Script in your Google Form or Google Sheet</span>
                  </div>
                  <p className="text-gray-400 pl-7 text-[11px]">
                    Open your Google Form or its linked Google Sheet. In the top navigation menu, click{" "}
                    <span className="text-primary font-bold">Extensions &gt; Apps Script</span> (or Tools &gt; Script editor).
                  </p>
                </div>

                {/* Step 2 */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-white font-bold">
                      <span className="w-5 h-5 rounded-full bg-accent text-black flex items-center justify-center text-[10px] font-bold">
                        2
                      </span>
                      <span>Paste Integration Script into Apps Script Editor</span>
                    </div>

                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(appsScriptCode);
                        setCopiedAppsScript(true);
                        setTimeout(() => setCopiedAppsScript(false), 3000);
                      }}
                      className="btn-secondary py-1 px-3 text-[10px] font-bold flex items-center space-x-1"
                    >
                      {copiedAppsScript ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>Copied Code!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-accent" />
                          <span>Copy Script</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="relative rounded-xl bg-black/50 border border-white/10 p-3 max-h-48 overflow-y-auto">
                    <pre className="text-[10px] text-gray-300 font-mono whitespace-pre-wrap">
                      {appsScriptCode}
                    </pre>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                  <div className="flex items-center space-x-2 text-white font-bold">
                    <span className="w-5 h-5 rounded-full bg-emerald-400 text-black flex items-center justify-center text-[10px] font-bold">
                      3
                    </span>
                    <span>Save and Run "installTrigger" (or "syncAllHistoricalRows")</span>
                  </div>
                  <p className="text-gray-400 pl-7 text-[11px]">
                    Click the Save icon (💾). In the function dropdown, select{" "}
                    <span className="text-emerald-300 font-bold">installTrigger</span> and click{" "}
                    <span className="text-emerald-300 font-bold">Run</span>. Authorize Google permissions once. Done!
                    Every new submission will now automatically post to your website backend.
                  </p>
                </div>
              </div>

              {/* Ping Connection Test */}
              <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-white font-orbitron">Verify Webhook API</span>
                    <p className="text-[10px] font-mono text-gray-400">
                      Test that your Circuitron backend endpoint is reachable and authenticating properly.
                    </p>
                  </div>

                  <button
                    onClick={handleTestPing}
                    disabled={isPinging}
                    className="btn-primary py-2 px-4 text-xs font-bold flex items-center space-x-1.5 shadow-neon"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isPinging ? "animate-spin" : ""}`} />
                    <span>{isPinging ? "Testing..." : "Send Test Ping"}</span>
                  </button>
                </div>

                {pingResult && (
                  <div
                    className={`mt-2 p-2.5 rounded-xl border text-[11px] font-mono flex items-center space-x-2 ${
                      pingResult.success
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                        : "bg-rose-500/10 border-rose-500/30 text-rose-300"
                    }`}
                  >
                    {pingResult.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                    <span>{pingResult.message}</span>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 8. IMPORT HISTORICAL DATA MODAL                                          */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showImportModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] bg-black/90 backdrop-blur-md flex items-start sm:items-center justify-center p-3 sm:p-6 pt-20 sm:pt-24 pb-12 overflow-y-auto"
            onClick={() => setShowImportModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="max-w-2xl w-full p-6 sm:p-8 rounded-3xl border border-accent/40 space-y-6 shadow-[0_0_50px_rgba(0,0,0,0.95)] relative my-auto bg-[#0a0f29] text-white"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-start justify-between border-b border-white/10 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <Upload className="w-4 h-4 text-accent" />
                    <span className="text-[10px] font-mono uppercase tracking-widest text-accent font-bold">
                      HISTORICAL REGISTRATIONS IMPORT
                    </span>
                  </div>
                  <h3 className="text-2xl font-black font-orbitron text-white">
                    Import Existing Google Sheets Data
                  </h3>
                  <p className="text-xs text-gray-400 font-mono">
                    Paste raw CSV export from your Google Sheet to import all past registrations directly.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="p-2.5 rounded-xl bg-white/10 hover:bg-rose-500 hover:text-white border border-white/10 text-gray-300 transition-all cursor-pointer flex-shrink-0"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Target Event Selector */}
              <div className="space-y-2">
                <label className="text-xs font-mono text-gray-300 font-bold block">
                  Select Target Event for these Registrations:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setImportTargetEvent("project-exhibition")}
                    className={`p-2.5 rounded-xl text-xs font-bold font-mono border transition-all text-center ${
                      importTargetEvent === "project-exhibition"
                        ? "bg-emerald-500/20 border-emerald-500 text-emerald-300"
                        : "bg-white/5 border-white/10 text-gray-400"
                    }`}
                  >
                    Project Exhibition
                  </button>
                  <button
                    type="button"
                    onClick={() => setImportTargetEvent("robo-war")}
                    className={`p-2.5 rounded-xl text-xs font-bold font-mono border transition-all text-center ${
                      importTargetEvent === "robo-war"
                        ? "bg-rose-500/20 border-rose-500 text-rose-300"
                        : "bg-white/5 border-white/10 text-gray-400"
                    }`}
                  >
                    Robo War
                  </button>
                  <button
                    type="button"
                    onClick={() => setImportTargetEvent("robo-race")}
                    className={`p-2.5 rounded-xl text-xs font-bold font-mono border transition-all text-center ${
                      importTargetEvent === "robo-race"
                        ? "bg-cyan-500/20 border-cyan-500 text-cyan-300"
                        : "bg-white/5 border-white/10 text-gray-400"
                    }`}
                  >
                    Robo Race
                  </button>
                </div>
              </div>

              {/* CSV Textarea */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-gray-300 font-bold">Paste CSV Rows (including header):</span>
                  <span className="text-gray-500 text-[10px]">Auto-maps Name, Email, Phone & preserves all answers</span>
                </div>
                <textarea
                  rows={6}
                  value={importCsvText}
                  onChange={(e) => handleCsvTextChange(e.target.value)}
                  placeholder={`Timestamp,Email Address,Full Name,Phone Number,College,Department\n2026-11-12,student@gmail.com,Aman Verma,9876543210,RVSCET,EEE`}
                  className="w-full p-3 rounded-2xl bg-black/40 border border-white/10 text-xs font-mono text-white placeholder-gray-600 focus:border-accent focus:outline-none"
                />
              </div>

              {/* Preview */}
              {importPreview.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[11px] font-mono text-accent font-bold block">
                    Detected First {importPreview.length} Rows Preview:
                  </span>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 max-h-36 overflow-y-auto space-y-1 text-[10px] font-mono text-gray-300">
                    {importPreview.map((row, i) => (
                      <div key={i} className="truncate">
                        Row {i + 1}: {Object.values(row).filter(Boolean).slice(0, 4).join(" | ")}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Result feedback */}
              {importResult && (
                <div
                  className={`p-3 rounded-xl border text-xs font-mono flex items-center space-x-2 ${
                    importResult.success
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                      : "bg-rose-500/10 border-rose-500/30 text-rose-300"
                  }`}
                >
                  {importResult.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                  <span>{importResult.message}</span>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="btn-secondary py-2.5 px-4 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleExecuteImport}
                  disabled={isImporting || !importCsvText.trim()}
                  className="btn-primary py-2.5 px-6 text-xs font-bold flex items-center space-x-1.5 shadow-neon disabled:opacity-40"
                >
                  <Upload className={`w-3.5 h-3.5 ${isImporting ? "animate-spin" : ""}`} />
                  <span>{isImporting ? "Importing Data..." : "Execute Import"}</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 9. CONNECT GOOGLE SHEETS MODAL (DIRECT LIVE SYNC)                        */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showSheetsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] bg-black/90 backdrop-blur-md flex items-start sm:items-center justify-center p-3 sm:p-6 pt-20 sm:pt-24 pb-12 overflow-y-auto"
            onClick={() => setShowSheetsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="max-w-2xl w-full p-6 sm:p-8 rounded-3xl border border-emerald-500/40 space-y-6 shadow-[0_0_50px_rgba(0,0,0,0.95)] relative my-auto bg-[#0a0f29] text-white"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-start justify-between border-b border-white/10 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                    <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold">
                      DIRECT SPREADSHEET SYNCHRONIZATION
                    </span>
                  </div>
                  <h3 className="text-2xl font-black font-orbitron text-white">
                    Connect Google Sheets
                  </h3>
                  <p className="text-xs text-gray-400 font-mono">
                    Paste your Google Form response spreadsheet links to synchronize all registrations directly into the Admin Dashboard.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowSheetsModal(false)}
                  className="p-2.5 rounded-xl bg-white/10 hover:bg-rose-500 hover:text-white border border-white/10 text-gray-300 transition-all cursor-pointer flex-shrink-0"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Instructions Tip */}
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-mono text-emerald-200 space-y-1">
                <div className="flex items-center space-x-1.5 font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>How to get the Google Sheet link:</span>
                </div>
                <p className="text-[11px] text-gray-300 leading-relaxed">
                  In your Google Form, open the <strong>Responses</strong> tab and click the green <strong>Link to Sheets</strong> icon. In the opened spreadsheet, click <strong>Share</strong> &gt; set General access to <strong>"Anyone with the link can view"</strong>, then copy and paste the link below.
                </p>
              </div>

              {/* Input: Project Exhibition */}
              <div className="space-y-2">
                <label className="text-xs font-mono text-gray-200 font-bold flex items-center justify-between">
                  <span>Project Exhibition Google Sheet URL or ID:</span>
                  <span className="text-[10px] text-emerald-400">Eklavya, Lakshya, Arjuna</span>
                </label>
                <input
                  type="text"
                  value={sheetExhibitionUrl}
                  onChange={(e) => setSheetExhibitionUrl(e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5.../edit"
                  className="w-full p-3 rounded-2xl bg-black/40 border border-white/10 text-xs font-mono text-white placeholder-gray-600 focus:border-emerald-400 focus:outline-none"
                />
              </div>

              {/* Input: Robotics Competitions */}
              <div className="space-y-2">
                <label className="text-xs font-mono text-gray-200 font-bold flex items-center justify-between">
                  <span>Robotics Competitions Google Sheet URL or ID:</span>
                  <span className="text-[10px] text-rose-400">Robo War & Robo Race</span>
                </label>
                <input
                  type="text"
                  value={sheetRoboticsUrl}
                  onChange={(e) => setSheetRoboticsUrl(e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5.../edit"
                  className="w-full p-3 rounded-2xl bg-black/40 border border-white/10 text-xs font-mono text-white placeholder-gray-600 focus:border-rose-400 focus:outline-none"
                />
              </div>

              {/* Result feedback */}
              {sheetsSyncResult && (
                <div
                  className={`p-3 rounded-xl border text-xs font-mono flex items-center space-x-2 ${
                    sheetsSyncResult.success
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                      : "bg-rose-500/10 border-rose-500/30 text-rose-300"
                  }`}
                >
                  {sheetsSyncResult.success ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <AlertTriangle className="w-4 h-4 flex-shrink-0" />}
                  <span>{sheetsSyncResult.message}</span>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSheetsModal(false)}
                  className="btn-secondary py-2.5 px-4 text-xs font-bold"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleSyncSheetsDirect}
                  disabled={isSyncingSheets || (!sheetExhibitionUrl.trim() && !sheetRoboticsUrl.trim())}
                  className="btn-primary py-2.5 px-6 text-xs font-bold flex items-center space-x-1.5 shadow-neon disabled:opacity-40 bg-gradient-to-r from-emerald-500 to-teal-500 border-emerald-400 text-black font-bold"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncingSheets ? "animate-spin" : ""}`} />
                  <span>{isSyncingSheets ? "Syncing Google Sheets..." : "Sync Google Sheets Now"}</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
