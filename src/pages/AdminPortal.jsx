import React, { useState, useEffect, useMemo, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Shield,
  Lock,
  Unlock,
  KeyRound,
  UserPlus,
  Users,
  FileSpreadsheet,
  Download,
  Upload,
  Search,
  CheckCircle2,
  Trash2,
  ExternalLink,
  QrCode,
  Sparkles,
  RefreshCw,
  LogOut,
  AlertCircle,
  FileText,
  UserCheck,
  Layers,
  Image as ImageIcon,
  Eye,
  Check,
  Copy,
} from "lucide-react";
import {
  getAllMembers,
  getAllExecutives,
  getAllCoreTeam,
  getAllParticipants,
  getAllVolunteers,
  facultyCoordinators,
  addMember,
  addMembersBulk,
  deleteMember,
  resetCustomMembers,
  saveCustomMembers,
  getCustomMembers,
  generateUniqueMemberId,
  TIER_CONFIG,
  normalizeTierKey,
} from "../data/team";
import { generateMemberIdCard, generateQrCodeDataUrl, downloadDataUrl } from "../utils/idCardGenerator";

const ADMIN_PASSCODES = ["2026techxpo@admin", "ankit327"];

export default function AdminPortal() {
  const navigate = useNavigate();

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("tx2_admin_authenticated") === "true";
    }
    return false;
  });
  const [passcodeInput, setPasscodeInput] = useState("");
  const [authError, setAuthError] = useState("");

  // Navigation workspace tabs: 'roster' | 'add' | 'bulk' | 'backup'
  const [activeTab, setActiveTab] = useState("roster");

  // Roster Filter & Search
  const [tierFilter, setTierFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [registryVersion, setRegistryVersion] = useState(0);

  // Single Member Form State
  const [formTier, setFormTier] = useState("participant");
  const [formName, setFormName] = useState("");
  const [formRole, setFormRole] = useState("");
  const [formDept, setFormDept] = useState("RVSCET Jamshedpur");
  const [formTeamName, setFormTeamName] = useState("");
  const [formCustomId, setFormCustomId] = useState("");
  const [formImage, setFormImage] = useState("");
  const [formImagePreview, setFormImagePreview] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSuccessMessage, setFormSuccessMessage] = useState("");

  // Bulk Import State
  const [bulkTier, setBulkTier] = useState("participant");
  const [bulkTextInput, setBulkTextInput] = useState("");
  const [bulkParsedPreview, setBulkParsedPreview] = useState([]);
  const [bulkDefaultDept, setBulkDefaultDept] = useState("RVSCET Jamshedpur");
  const [bulkDefaultRole, setBulkDefaultRole] = useState("Registered Participant");
  const [isBulkImporting, setIsBulkImporting] = useState(false);
  const [bulkSuccessMessage, setBulkSuccessMessage] = useState("");

  // Card Modal State
  const [selectedMemberForCard, setSelectedMemberForCard] = useState(null);
  const [generatingCard, setGeneratingCard] = useState(false);
  const [generatedCardData, setGeneratedCardData] = useState(null);

  // Auto-generate ID preview when formTier changes
  useEffect(() => {
    if (!formCustomId) {
      setFormCustomId(generateUniqueMemberId(formTier));
    }
  }, [formTier]);

  // Listen for custom members updates across tabs/storage
  useEffect(() => {
    const handleUpdate = () => {
      setRegistryVersion((v) => v + 1);
    };
    window.addEventListener("tx2_members_updated", handleUpdate);
    return () => window.removeEventListener("tx2_members_updated", handleUpdate);
  }, []);

  // Retrieve current members list
  const allMembers = useMemo(() => {
    return getAllMembers();
  }, [registryVersion]);

  // Compute live statistics
  const stats = useMemo(() => {
    const execs = allMembers.filter((m) => m.tierKey === "executive" || m.category === "Executive Team");
    const core = allMembers.filter((m) => m.tierKey === "core" || m.category === "Core Team");
    const participants = allMembers.filter((m) => m.tierKey === "participant" || m.category === "Participant");
    const volunteers = allMembers.filter((m) => m.tierKey === "volunteer" || m.category === "Volunteer");
    const faculty = facultyCoordinators;
    return {
      total: allMembers.length,
      executives: execs.length,
      core: core.length,
      participants: participants.length,
      volunteers: volunteers.length,
      faculty: faculty.length,
      customCount: allMembers.filter((m) => m.isCustom).length,
    };
  }, [allMembers]);

  // Filtered Roster
  const filteredRoster = useMemo(() => {
    return allMembers.filter((m) => {
      // Tier filter
      const tKey = normalizeTierKey(m.tierKey || m.tier || m.category);
      if (tierFilter !== "all" && tKey !== tierFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchName = m.name?.toLowerCase().includes(q);
        const matchId = m.id?.toLowerCase().includes(q);
        const matchRole = (m.role || m.position)?.toLowerCase().includes(q);
        const matchDept = m.department?.toLowerCase().includes(q);
        const matchTeam = m.teamName?.toLowerCase().includes(q);
        return matchName || matchId || matchRole || matchDept || matchTeam;
      }
      return true;
    });
  }, [allMembers, tierFilter, searchQuery]);

  // Handle Admin Login
  const handleLogin = (e) => {
    e.preventDefault();
    const entered = passcodeInput.trim().toLowerCase();
    if (ADMIN_PASSCODES.includes(entered)) {
      localStorage.setItem("tx2_admin_authenticated", "true");
      setIsAuthenticated(true);
      setAuthError("");
    } else {
      setAuthError("Invalid administrative passcode. Please verify your clearance.");
    }
  };

  // Handle Admin Logout
  const handleLogout = () => {
    localStorage.removeItem("tx2_admin_authenticated");
    setIsAuthenticated(false);
    setPasscodeInput("");
  };

  // Handle Photo File Upload
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Please select an image smaller than 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFormImage(reader.result);
      setFormImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Handle Single Member Submit
  const handleSingleSubmit = async (e) => {
    e.preventDefault();
    if (!formName.trim()) {
      alert("Please enter the person's full name.");
      return;
    }

    setIsSubmitting(true);
    try {
      const targetId = formCustomId.trim().toUpperCase() || generateUniqueMemberId(formTier);
      const newEntry = addMember({
        id: targetId,
        name: formName.trim(),
        role: formRole.trim() || (formTier === "participant" ? "Competitor" : TIER_CONFIG[formTier]?.label),
        tier: formTier,
        category: TIER_CONFIG[formTier]?.label,
        department: formDept.trim() || "RVSCET Jamshedpur",
        teamName: formTier === "participant" ? formTeamName.trim() : "",
        img: formImage || "",
      });

      setRegistryVersion((v) => v + 1);
      setFormSuccessMessage(`Enrolled ${newEntry.name} successfully with ID: ${newEntry.id}`);

      // Reset form
      setFormName("");
      setFormRole("");
      setFormTeamName("");
      setFormImage("");
      setFormImagePreview("");
      setFormCustomId(generateUniqueMemberId(formTier));

      setTimeout(() => setFormSuccessMessage(""), 4000);
    } catch (err) {
      console.error(err);
      alert("Failed to enroll member: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Parse bulk text whenever bulkTextInput or defaults change
  useEffect(() => {
    if (!bulkTextInput.trim()) {
      setBulkParsedPreview([]);
      return;
    }

    const lines = bulkTextInput.split("\n").filter((l) => l.trim().length > 0);
    const parsed = lines.map((line, idx) => {
      // Supports CSV "Name, Role, Department, TeamName" or simple "Name"
      const parts = line.split(",").map((p) => p.trim());
      const name = parts[0] || `Person ${idx + 1}`;
      const role = parts[1] || bulkDefaultRole || (bulkTier === "participant" ? "Participant" : TIER_CONFIG[bulkTier]?.label);
      const department = parts[2] || bulkDefaultDept || "RVSCET Jamshedpur";
      const teamName = parts[3] || "";

      return {
        name,
        role,
        department,
        teamName,
        tier: bulkTier,
      };
    });

    setBulkParsedPreview(parsed);
  }, [bulkTextInput, bulkTier, bulkDefaultRole, bulkDefaultDept]);

  // Handle Bulk Import File Upload
  const handleBulkFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setBulkTextInput(event.target.result || "");
    };
    reader.readAsText(file);
  };

  // Submit Bulk Import
  const handleBulkSubmit = async () => {
    if (bulkParsedPreview.length === 0) {
      alert("No valid entries to import. Please paste names or upload a CSV.");
      return;
    }

    setIsBulkImporting(true);
    try {
      const added = addMembersBulk(bulkParsedPreview, bulkTier);
      setRegistryVersion((v) => v + 1);
      setBulkSuccessMessage(`Successfully enrolled ${added.length} people into ${TIER_CONFIG[bulkTier]?.label}!`);
      setBulkTextInput("");
      setBulkParsedPreview([]);
      setTimeout(() => setBulkSuccessMessage(""), 5000);
    } catch (err) {
      console.error(err);
      alert("Bulk import failed: " + err.message);
    } finally {
      setIsBulkImporting(false);
    }
  };

  // Delete Member
  const handleDeleteMember = (member) => {
    if (!member.isCustom) {
      alert("Built-in committee members cannot be deleted from this portal.");
      return;
    }
    if (window.confirm(`Are you sure you want to remove ${member.name} (${member.id})?`)) {
      deleteMember(member.id);
      setRegistryVersion((v) => v + 1);
    }
  };

  // Open ID Card Modal & Generate Card
  const handleOpenCardModal = async (member) => {
    setSelectedMemberForCard(member);
    setGeneratingCard(true);
    setGeneratedCardData(null);

    try {
      // If member already has a static pre-rendered card and is not custom, use it
      if (!member.isCustom && member.idCardHd) {
        setGeneratedCardData({
          hdDataUrl: member.idCardHd,
          stdDataUrl: member.idCard,
          qrDataUrl: member.qrCode,
        });
      } else {
        // Generate live canvas card
        const card = await generateMemberIdCard(member);
        setGeneratedCardData(card);
      }
    } catch (err) {
      console.error("Failed to render card:", err);
    } finally {
      setGeneratingCard(false);
    }
  };

  // Export Roster to CSV
  const handleExportCSV = () => {
    const headers = ["Member ID", "Name", "Tier", "Role / Position", "Department", "Team Name", "Created At"];
    const rows = allMembers.map((m) => [
      `"${m.id || ""}"`,
      `"${(m.name || "").replace(/"/g, '""')}"`,
      `"${(m.category || m.tier || "").replace(/"/g, '""')}"`,
      `"${(m.role || m.position || "").replace(/"/g, '""')}"`,
      `"${(m.department || "").replace(/"/g, '""')}"`,
      `"${(m.teamName || "").replace(/"/g, '""')}"`,
      `"${m.createdAt || "Official"}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `TechXpo_2.0_Roster_Export_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Export Full JSON Backup
  const handleExportJSON = () => {
    const custom = getCustomMembers();
    const dataStr = JSON.stringify({ version: "2.0", exportedAt: new Date().toISOString(), customMembers: custom }, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `TechXpo_Custom_Registry_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Restore JSON Backup
  const handleImportJSON = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        const members = Array.isArray(parsed) ? parsed : parsed.customMembers;
        if (Array.isArray(members)) {
          saveCustomMembers(members);
          setRegistryVersion((v) => v + 1);
          alert(`Restored ${members.length} custom members successfully!`);
        } else {
          alert("Invalid backup file format.");
        }
      } catch (err) {
        alert("Error parsing JSON file: " + err.message);
      }
    };
    reader.readAsText(file);
  };

  // Reset Custom Members
  const handleResetData = () => {
    if (window.confirm("Are you sure you want to clear all custom added members? This will restore the roster back to default official members only.")) {
      resetCustomMembers();
      setRegistryVersion((v) => v + 1);
    }
  };

  // ==========================================================================
  // VIEW: UN-AUTHENTICATED ADMIN LOGIN
  // ==========================================================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen pt-28 pb-20 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card max-w-md w-full p-8 sm:p-10 rounded-3xl border border-primary/30 space-y-6 shadow-2xl relative overflow-hidden"
        >
          {/* Cyber ambient glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center text-accent mx-auto shadow-neon">
              <KeyRound className="w-8 h-8" />
            </div>
            <span className="text-xs font-mono uppercase tracking-widest text-accent font-bold">
              TECHXPO 2.O SECRETARIAT
            </span>
            <h1 className="text-2xl sm:text-3xl font-black font-orbitron text-white">
              Admin Portal
            </h1>
            <p className="text-gray-300 text-xs sm:text-sm">
              Authorized clearance required to manage delegates, volunteers, executive rosters, and issue official ID cards.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-gray-300 mb-1.5 uppercase tracking-wider">
                Secretariat Passcode
              </label>
              <input
                type="password"
                value={passcodeInput}
                onChange={(e) => setPasscodeInput(e.target.value)}
                placeholder="Enter admin passcode"
                className="w-full px-4 py-3 bg-darkNavy/90 border border-primary/25 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-accent text-sm font-mono tracking-wider"
                autoFocus
              />
            </div>

            {authError && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center space-x-2"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{authError}</span>
              </motion.div>
            )}

            <button type="submit" className="w-full btn-primary py-3.5 text-xs font-bold shadow-neon">
              Authenticate Clearance
            </button>
          </form>

          <div className="pt-2 text-center">
            <Link to="/verify" className="text-xs text-gray-400 hover:text-accent font-mono transition-colors">
              &larr; Return to Public Verification Desk
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // ==========================================================================
  // VIEW: AUTHENTICATED SECRETARIAT ADMIN PORTAL
  // ==========================================================================
  return (
    <div className="min-h-screen pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Top Header & Admin Status Bar */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-primary/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-32 bg-gradient-to-l from-primary/10 via-accent/5 to-transparent pointer-events-none" />

          <div className="space-y-2 relative z-10">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>SECRETARIAT CLEARANCE &bull; ACTIVE</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black font-orbitron gradient-text">
              TechXpo 2.O Admin Portal
            </h1>
            <p className="text-gray-300 text-xs sm:text-sm max-w-xl">
              Enroll, manage, and issue high-definition ID cards with active verification links across Executive, Core Team, Participant, and Volunteer tiers.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 relative z-10">
            <Link
              to="/verify"
              className="btn-secondary text-xs py-2.5 px-4 font-bold flex items-center space-x-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Public Verify Page</span>
            </Link>

            <button
              onClick={handleLogout}
              className="px-4 py-2.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 hover:bg-red-500/25 text-xs font-mono font-bold flex items-center space-x-1.5 transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Lock Admin</span>
            </button>
          </div>
        </div>

        {/* Live Metric Statistics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          <div className="glass-card p-4 rounded-2xl border border-white/10 text-center space-y-1">
            <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">Total Roster</span>
            <span className="text-2xl sm:text-3xl font-black font-orbitron text-white">{stats.total}</span>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-primary/20 text-center space-y-1">
            <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block">Executive</span>
            <span className="text-2xl sm:text-3xl font-black font-orbitron text-cyan-300">{stats.executives}</span>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-sky-500/20 text-center space-y-1">
            <span className="text-[10px] font-mono text-sky-400 uppercase tracking-wider block">Core Team</span>
            <span className="text-2xl sm:text-3xl font-black font-orbitron text-sky-300">{stats.core}</span>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-amber-500/20 text-center space-y-1">
            <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider block">Participants</span>
            <span className="text-2xl sm:text-3xl font-black font-orbitron text-amber-300">{stats.participants}</span>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-emerald-500/20 text-center space-y-1">
            <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block">Volunteers</span>
            <span className="text-2xl sm:text-3xl font-black font-orbitron text-emerald-300">{stats.volunteers}</span>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-purple-500/20 text-center space-y-1">
            <span className="text-[10px] font-mono text-purple-400 uppercase tracking-wider block">Custom Added</span>
            <span className="text-2xl sm:text-3xl font-black font-orbitron text-purple-300">{stats.customCount}</span>
          </div>
        </div>

        {/* Tab Selection Bar */}
        <div className="flex border-b border-white/10 gap-2 sm:gap-4 overflow-x-auto no-scrollbar pb-1">
          <button
            onClick={() => setActiveTab("roster")}
            className={`flex items-center space-x-2 py-3 px-4 sm:px-6 rounded-2xl text-xs sm:text-sm font-orbitron font-bold transition-all whitespace-nowrap ${
              activeTab === "roster"
                ? "bg-primary/20 border border-primary/40 text-accent shadow-neon"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>All Rosters &amp; Cards ({allMembers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("add")}
            className={`flex items-center space-x-2 py-3 px-4 sm:px-6 rounded-2xl text-xs sm:text-sm font-orbitron font-bold transition-all whitespace-nowrap ${
              activeTab === "add"
                ? "bg-primary/20 border border-primary/40 text-accent shadow-neon"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Individual Person</span>
          </button>

          <button
            onClick={() => setActiveTab("bulk")}
            className={`flex items-center space-x-2 py-3 px-4 sm:px-6 rounded-2xl text-xs sm:text-sm font-orbitron font-bold transition-all whitespace-nowrap ${
              activeTab === "bulk"
                ? "bg-primary/20 border border-primary/40 text-accent shadow-neon"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Bulk Import Many Names</span>
          </button>

          <button
            onClick={() => setActiveTab("backup")}
            className={`flex items-center space-x-2 py-3 px-4 sm:px-6 rounded-2xl text-xs sm:text-sm font-orbitron font-bold transition-all whitespace-nowrap ${
              activeTab === "backup"
                ? "bg-primary/20 border border-primary/40 text-accent shadow-neon"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Export &amp; Backup</span>
          </button>
        </div>

        {/* ================================================================== */}
        {/* TAB 1: ALL ROSTERS & CARDS TABLE                                    */}
        {/* ================================================================== */}
        {activeTab === "roster" && (
          <div className="space-y-6">
            {/* Filter and Search Bar */}
            <div className="glass-card p-4 sm:p-5 rounded-2xl border border-primary/20 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              {/* Tier Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {[
                  { id: "all", label: "All Tiers" },
                  { id: "executive", label: "Executive" },
                  { id: "core", label: "Core Team" },
                  { id: "participant", label: "Participants" },
                  { id: "volunteer", label: "Volunteers" },
                  { id: "faculty", label: "Faculty" },
                ].map((pill) => (
                  <button
                    key={pill.id}
                    onClick={() => setTierFilter(pill.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all ${
                      tierFilter === pill.id
                        ? "bg-accent text-darkNavy shadow-sm"
                        : "bg-darkNavy/80 text-gray-300 hover:text-white hover:bg-white/5 border border-white/5"
                    }`}
                  >
                    {pill.label}
                  </button>
                ))}
              </div>

              {/* Search Box */}
              <div className="relative min-w-[260px]">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, ID, role, group..."
                  className="w-full pl-10 pr-4 py-2 bg-darkNavy/90 border border-primary/20 rounded-xl text-white placeholder-gray-500 text-xs font-mono focus:outline-none focus:border-accent"
                />
              </div>
            </div>

            {/* Members Roster Table */}
            <div className="glass-card rounded-2xl border border-primary/20 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-darkNavy/90 text-gray-400 font-mono uppercase tracking-wider border-b border-white/10">
                    <tr>
                      <th className="py-3.5 px-4">Member / Delegate</th>
                      <th className="py-3.5 px-4">Tier &amp; Category</th>
                      <th className="py-3.5 px-4">Role / Designation</th>
                      <th className="py-3.5 px-4">Organization / Group</th>
                      <th className="py-3.5 px-4">Origin</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredRoster.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-gray-400 font-mono">
                          No members match the current filter or search query.
                        </td>
                      </tr>
                    ) : (
                      filteredRoster.map((m) => {
                        const tKey = normalizeTierKey(m.tierKey || m.tier || m.category);
                        const cfg = TIER_CONFIG[tKey] || TIER_CONFIG.participant;

                        return (
                          <tr key={m.id} className="hover:bg-white/[0.02] transition-colors group">
                            {/* Member Info */}
                            <td className="py-3 px-4">
                              <div className="flex items-center space-x-3">
                                <div className="w-9 h-9 rounded-full overflow-hidden bg-darkNavy border border-primary/30 flex-shrink-0 flex items-center justify-center font-bold text-accent">
                                  {m.img ? (
                                    <img src={m.img} alt={m.name} className="w-full h-full object-cover" />
                                  ) : (
                                    <span className="text-[11px] font-orbitron">
                                      {m.name.slice(0, 2).toUpperCase()}
                                    </span>
                                  )}
                                </div>
                                <div>
                                  <div className="font-bold text-white text-sm group-hover:text-accent transition-colors">
                                    {m.name}
                                  </div>
                                  <div className="font-mono text-[11px] text-gray-400">
                                    {m.id}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Tier Badge */}
                            <td className="py-3 px-4">
                              <span
                                className="inline-block px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider"
                                style={{
                                  backgroundColor: `${cfg.color}15`,
                                  color: cfg.color,
                                  border: `1px solid ${cfg.color}40`,
                                }}
                              >
                                {cfg.label}
                              </span>
                            </td>

                            {/* Role */}
                            <td className="py-3 px-4 text-gray-300 font-semibold">
                              {m.role || m.position}
                            </td>

                            {/* Dept / Group */}
                            <td className="py-3 px-4 text-gray-400">
                              <div>{m.department || "RVSCET Jamshedpur"}</div>
                              {m.teamName && (
                                <span className="text-amber-300 text-[10px] font-mono block">
                                  Group: {m.teamName}
                                </span>
                              )}
                            </td>

                            {/* Origin */}
                            <td className="py-3 px-4">
                              {m.isCustom ? (
                                <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[10px] font-mono font-bold">
                                  Added Custom
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded bg-white/10 text-gray-300 text-[10px] font-mono">
                                  Official
                                </span>
                              )}
                            </td>

                            {/* Actions */}
                            <td className="py-3 px-4 text-right space-x-2 whitespace-nowrap">
                              <button
                                onClick={() => handleOpenCardModal(m)}
                                className="btn-secondary text-[11px] py-1.5 px-3 font-bold inline-flex items-center space-x-1"
                                title="Preview & Download Official ID Badge"
                              >
                                <QrCode className="w-3.5 h-3.5 text-accent" />
                                <span>ID Card</span>
                              </button>

                              <Link
                                to={`/verify/${m.id}`}
                                target="_blank"
                                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white inline-flex items-center"
                                title="Open Live Public Verification Page"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </Link>

                              {m.isCustom && (
                                <button
                                  onClick={() => handleDeleteMember(m)}
                                  className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 inline-flex items-center"
                                  title="Remove from Registry"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================== */}
        {/* TAB 2: ADD INDIVIDUAL PERSON                                       */}
        {/* ================================================================== */}
        {activeTab === "add" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Form Column (7 cols) */}
            <div className="lg:col-span-7 glass-card p-6 sm:p-8 rounded-3xl border border-primary/30 space-y-6">
              <div className="space-y-1">
                <span className="text-xs font-mono uppercase tracking-widest text-accent font-bold">
                  DELEGATE ENROLLMENT
                </span>
                <h2 className="text-2xl font-black font-orbitron text-white">
                  Add Individual Person
                </h2>
                <p className="text-gray-300 text-xs">
                  Fill in delegate details to immediately enroll them and generate their scannable official 2026 ID card.
                </p>
              </div>

              {formSuccessMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs flex items-center space-x-2"
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <span>{formSuccessMessage}</span>
                </motion.div>
              )}

              <form onSubmit={handleSingleSubmit} className="space-y-5">
                {/* Tier Selector */}
                <div>
                  <label className="block text-xs font-mono text-gray-300 mb-2 uppercase tracking-wider font-semibold">
                    1. Select Tier / Category *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: "executive", label: "Executive Team", color: "#0DBAE3" },
                      { id: "core", label: "Core Team", color: "#7FE6FF" },
                      { id: "participant", label: "Participant", color: "#FFD700" },
                      { id: "volunteer", label: "Volunteer", color: "#34D399" },
                    ].map((t) => (
                      <button
                        type="button"
                        key={t.id}
                        onClick={() => {
                          setFormTier(t.id);
                          setFormCustomId(generateUniqueMemberId(t.id));
                        }}
                        className={`p-3 rounded-xl border text-center transition-all ${
                          formTier === t.id
                            ? "bg-darkNavy border-2 text-white shadow-neon"
                            : "bg-darkNavy/50 border-white/10 text-gray-400 hover:text-white"
                        }`}
                        style={{
                          borderColor: formTier === t.id ? t.color : undefined,
                        }}
                      >
                        <span
                          className="block text-xs font-bold font-orbitron"
                          style={{ color: t.color }}
                        >
                          {t.label}
                        </span>
                        <span className="text-[10px] font-mono text-gray-400 block mt-0.5">
                          {TIER_CONFIG[t.id]?.prefix}XXXX
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Full Name */}
                <div>
                  <label className="block text-xs font-mono text-gray-300 mb-1.5 uppercase tracking-wider font-semibold">
                    2. Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. RAHUL VERMA"
                    className="w-full px-4 py-3 bg-darkNavy/90 border border-primary/20 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-accent uppercase"
                  />
                </div>

                {/* Role / Designation */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-gray-300 mb-1.5 uppercase tracking-wider font-semibold">
                      3. Role / Designation
                    </label>
                    <input
                      type="text"
                      value={formRole}
                      onChange={(e) => setFormRole(e.target.value)}
                      placeholder={
                        formTier === "participant"
                          ? "e.g. RoboWars Fighter"
                          : formTier === "volunteer"
                          ? "e.g. Arena Marshall"
                          : "e.g. Technical Lead"
                      }
                      className="w-full px-4 py-3 bg-darkNavy/90 border border-primary/20 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-accent"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-gray-300 mb-1.5 uppercase tracking-wider font-semibold">
                      4. Department / Institution
                    </label>
                    <input
                      type="text"
                      value={formDept}
                      onChange={(e) => setFormDept(e.target.value)}
                      placeholder="e.g. Dept. of ECE / College Name"
                      className="w-full px-4 py-3 bg-darkNavy/90 border border-primary/20 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>

                {/* Team / Group Name (if participant) */}
                {formTier === "participant" && (
                  <div>
                    <label className="block text-xs font-mono text-amber-300 mb-1.5 uppercase tracking-wider font-semibold">
                      5. Group / Team Name (Optional)
                    </label>
                    <input
                      type="text"
                      value={formTeamName}
                      onChange={(e) => setFormTeamName(e.target.value)}
                      placeholder="e.g. RoboKnights, Circuit Breakers"
                      className="w-full px-4 py-3 bg-darkNavy/90 border border-amber-500/30 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-amber-400"
                    />
                  </div>
                )}

                {/* Member ID Field with Refresh Button */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-mono text-gray-300 uppercase tracking-wider font-semibold">
                      Credential ID (Auto-Generated)
                    </label>
                    <button
                      type="button"
                      onClick={() => setFormCustomId(generateUniqueMemberId(formTier))}
                      className="text-[11px] font-mono text-accent hover:underline flex items-center space-x-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Generate New ID</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    value={formCustomId}
                    onChange={(e) => setFormCustomId(e.target.value)}
                    placeholder="e.g. TX2-PT-8294"
                    className="w-full px-4 py-3 bg-darkNavy/90 border border-primary/20 rounded-xl text-white text-sm font-mono tracking-wider focus:outline-none focus:border-accent uppercase"
                  />
                </div>

                {/* Member Photo Upload */}
                <div>
                  <label className="block text-xs font-mono text-gray-300 mb-1.5 uppercase tracking-wider font-semibold">
                    Profile Portrait (Optional)
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-darkNavy border-2 border-primary/30 flex items-center justify-center flex-shrink-0">
                      {formImagePreview ? (
                        <img src={formImagePreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="w-6 h-6 text-gray-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="block w-full text-xs text-gray-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary/20 file:text-accent hover:file:bg-primary/30 cursor-pointer"
                      />
                      <span className="text-[10px] text-gray-500 block mt-1">
                        Square photo recommended. If omitted, a clean cyber emblem will be generated.
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full btn-primary py-3.5 text-xs font-bold shadow-neon flex items-center justify-center space-x-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{isSubmitting ? "Enrolling & Minting..." : "Enroll Delegate & Generate ID Card"}</span>
                </button>
              </form>
            </div>

            {/* Live Preview Column (5 cols) */}
            <div className="lg:col-span-5 glass-card p-6 sm:p-7 rounded-3xl border border-primary/20 space-y-4 text-center">
              <span className="text-xs font-mono uppercase tracking-widest text-accent font-bold block">
                LIVE BADGE PREVIEW
              </span>
              <div className="relative rounded-2xl overflow-hidden border border-primary/30 bg-darkNavy shadow-2xl p-4 flex flex-col items-center">
                <div
                  className="w-full max-w-[280px] rounded-xl overflow-hidden shadow-2xl border relative text-center p-5 space-y-4"
                  style={{
                    backgroundColor: "#0A1A36",
                    borderColor: TIER_CONFIG[formTier]?.color || "#0DBAE3",
                  }}
                >
                  {/* Category Ribbon Indicator */}
                  <div
                    className="inline-block px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider"
                    style={{
                      backgroundColor: `${TIER_CONFIG[formTier]?.color}20`,
                      color: TIER_CONFIG[formTier]?.color,
                    }}
                  >
                    {TIER_CONFIG[formTier]?.label}
                  </div>

                  {/* Avatar Circle */}
                  <div className="w-24 h-24 rounded-full mx-auto overflow-hidden border-2 bg-darkNavy flex items-center justify-center shadow-lg"
                    style={{ borderColor: TIER_CONFIG[formTier]?.color }}
                  >
                    {formImagePreview ? (
                      <img src={formImagePreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xl font-bold font-orbitron" style={{ color: TIER_CONFIG[formTier]?.color }}>
                        {formName ? formName.slice(0, 2).toUpperCase() : "TX"}
                      </span>
                    )}
                  </div>

                  {/* Name */}
                  <div className="space-y-0.5">
                    <h3 className="font-black font-exo2 text-white text-base leading-tight uppercase">
                      {formName || "MEMBER NAME"}
                    </h3>
                    <p
                      className="font-bold text-xs uppercase tracking-widest"
                      style={{ color: TIER_CONFIG[formTier]?.color }}
                    >
                      {formRole || (formTier === "participant" ? "PARTICIPANT" : "ROLE")}
                    </p>
                  </div>

                  {/* ID & Scan Box */}
                  <div className="bg-black/40 p-2.5 rounded-xl border border-white/10 text-left flex items-center justify-between">
                    <div>
                      <span className="text-[9px] font-mono text-gray-400 block uppercase">
                        {TIER_CONFIG[formTier]?.label} ID
                      </span>
                      <span className="font-mono font-bold text-white text-xs">
                        {formCustomId || "TX2-XX-0000"}
                      </span>
                    </div>
                    <QrCode className="w-7 h-7 text-white/80" />
                  </div>

                  <span className="text-[9px] font-mono text-gray-400 block">
                    RVSCET &bull; 30 NOV 2026
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-gray-400 font-mono">
                Official 1224 &times; 1806 HD print template will be rendered upon enrollment.
              </p>
            </div>
          </div>
        )}

        {/* ================================================================== */}
        {/* TAB 3: BULK IMPORT MANY NAMES                                      */}
        {/* ================================================================== */}
        {activeTab === "bulk" && (
          <div className="glass-card p-6 sm:p-8 rounded-3xl border border-primary/30 space-y-6">
            <div className="space-y-1">
              <span className="text-xs font-mono uppercase tracking-widest text-accent font-bold">
                BATCH ROSTER IMPORT
              </span>
              <h2 className="text-2xl font-black font-orbitron text-white">
                Bulk Import Many Names
              </h2>
              <p className="text-gray-300 text-xs max-w-2xl">
                Paste lists of names or CSV lines to enroll dozens or hundreds of people in seconds. Unique IDs will be auto-generated for each delegate.
              </p>
            </div>

            {bulkSuccessMessage && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs flex items-center space-x-2"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <span>{bulkSuccessMessage}</span>
              </motion.div>
            )}

            {/* Bulk Setup Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-xs font-mono text-gray-300 mb-1.5 uppercase font-semibold">
                  Target Tier *
                </label>
                <select
                  value={bulkTier}
                  onChange={(e) => setBulkTier(e.target.value)}
                  className="w-full px-4 py-3 bg-darkNavy/90 border border-primary/20 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-accent"
                >
                  <option value="participant">Participant (TX2-PT-)</option>
                  <option value="volunteer">Volunteer (TX2-VL-)</option>
                  <option value="executive">Executive Team (TX2-EX-)</option>
                  <option value="core">Core Team (TX2-CT-)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-300 mb-1.5 uppercase font-semibold">
                  Default Role / Position
                </label>
                <input
                  type="text"
                  value={bulkDefaultRole}
                  onChange={(e) => setBulkDefaultRole(e.target.value)}
                  placeholder="e.g. Registered Participant"
                  className="w-full px-4 py-3 bg-darkNavy/90 border border-primary/20 rounded-xl text-white text-xs focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-300 mb-1.5 uppercase font-semibold">
                  Default Organization / Dept
                </label>
                <input
                  type="text"
                  value={bulkDefaultDept}
                  onChange={(e) => setBulkDefaultDept(e.target.value)}
                  placeholder="e.g. RVSCET Jamshedpur"
                  className="w-full px-4 py-3 bg-darkNavy/90 border border-primary/20 rounded-xl text-white text-xs focus:outline-none focus:border-accent"
                />
              </div>
            </div>

            {/* Paste Box & File Upload */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono text-gray-300 uppercase font-semibold">
                  Paste Names or CSV Lines (One per line)
                </label>
                <label className="text-xs font-mono text-accent hover:underline cursor-pointer flex items-center space-x-1">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload .CSV / .TXT</span>
                  <input type="file" accept=".csv,.txt" onChange={handleBulkFileUpload} className="hidden" />
                </label>
              </div>

              <textarea
                rows={7}
                value={bulkTextInput}
                onChange={(e) => setBulkTextInput(e.target.value)}
                placeholder={`Example formats accepted:
Aman Kumar
Sneha Sharma
Rahul Verma, RoboWars Fighter, Dept. of ME, IronFist
Priya Singh, Line Follower, Dept. of ECE, CyberSquad`}
                className="w-full px-4 py-3 bg-darkNavy/90 border border-primary/20 rounded-xl text-white placeholder-gray-500 font-mono text-xs focus:outline-none focus:border-accent leading-relaxed"
              />
            </div>

            {/* Live Parsing Preview Table */}
            {bulkParsedPreview.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-gray-300">
                    Previewing <strong>{bulkParsedPreview.length}</strong> parsed entries ready to enroll:
                  </span>
                  <button
                    onClick={() => {
                      setBulkTextInput("");
                      setBulkParsedPreview([]);
                    }}
                    className="text-red-400 hover:underline"
                  >
                    Clear All
                  </button>
                </div>

                <div className="max-h-64 overflow-y-auto rounded-xl border border-white/10 bg-darkNavy/50">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-darkNavy text-gray-400 border-b border-white/10 sticky top-0">
                      <tr>
                        <th className="py-2.5 px-3">#</th>
                        <th className="py-2.5 px-3">Name</th>
                        <th className="py-2.5 px-3">Role</th>
                        <th className="py-2.5 px-3">Department</th>
                        <th className="py-2.5 px-3">Group</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {bulkParsedPreview.map((item, idx) => (
                        <tr key={idx} className="hover:bg-white/[0.02]">
                          <td className="py-2 px-3 text-gray-500">{idx + 1}</td>
                          <td className="py-2 px-3 font-bold text-white uppercase">{item.name}</td>
                          <td className="py-2 px-3 text-cyan-300">{item.role}</td>
                          <td className="py-2 px-3 text-gray-400">{item.department}</td>
                          <td className="py-2 px-3 text-amber-300">{item.teamName || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <button
                  onClick={handleBulkSubmit}
                  disabled={isBulkImporting}
                  className="btn-primary py-3 px-6 text-xs font-bold flex items-center space-x-2 shadow-neon"
                >
                  <Users className="w-4 h-4" />
                  <span>
                    {isBulkImporting
                      ? `Importing ${bulkParsedPreview.length} delegates...`
                      : `Import All ${bulkParsedPreview.length} People into ${TIER_CONFIG[bulkTier]?.label}`}
                  </span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ================================================================== */}
        {/* TAB 4: BACKUP, RESTORE & EXPORT                                    */}
        {/* ================================================================== */}
        {activeTab === "backup" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Export Options */}
            <div className="glass-card p-6 sm:p-8 rounded-3xl border border-primary/30 space-y-5">
              <div className="space-y-1">
                <span className="text-xs font-mono uppercase tracking-widest text-accent font-bold">
                  DATA EXPORTS
                </span>
                <h3 className="text-xl font-black font-orbitron text-white">
                  Export Roster Records
                </h3>
                <p className="text-gray-300 text-xs">
                  Download full roster sheets for offline accreditation, certificate printing, or secretariat archives.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <button
                  onClick={handleExportCSV}
                  className="w-full btn-secondary py-3 text-xs font-bold flex items-center justify-center space-x-2"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  <span>Export Full Roster as CSV (.csv)</span>
                </button>

                <button
                  onClick={handleExportJSON}
                  className="w-full btn-secondary py-3 text-xs font-bold flex items-center justify-center space-x-2"
                >
                  <FileText className="w-4 h-4 text-primary" />
                  <span>Export Complete Database Backup (.json)</span>
                </button>
              </div>
            </div>

            {/* Restore & Danger Zone */}
            <div className="glass-card p-6 sm:p-8 rounded-3xl border border-red-500/30 space-y-5">
              <div className="space-y-1">
                <span className="text-xs font-mono uppercase tracking-widest text-red-400 font-bold">
                  RESTORE &amp; MAINTENANCE
                </span>
                <h3 className="text-xl font-black font-orbitron text-white">
                  Database Management
                </h3>
                <p className="text-gray-300 text-xs">
                  Restore from an exported JSON backup or reset custom additions back to default official members.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <label className="w-full btn-secondary py-3 text-xs font-bold flex items-center justify-center space-x-2 cursor-pointer">
                  <Upload className="w-4 h-4 text-accent" />
                  <span>Restore from JSON Backup File</span>
                  <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
                </label>

                <button
                  onClick={handleResetData}
                  className="w-full py-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 hover:bg-red-500/25 text-xs font-mono font-bold flex items-center justify-center space-x-2 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Clear All Custom Additions</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ==================================================================== */}
      {/* MODAL: ID BADGE PREVIEW & DOWNLOAD                                  */}
      {/* ==================================================================== */}
      {selectedMemberForCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="glass-card max-w-lg w-full p-6 sm:p-7 rounded-3xl border border-primary/40 space-y-5 shadow-2xl relative"
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-accent/15 border border-accent/30 flex items-center justify-center text-accent">
                  <QrCode className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-orbitron font-bold text-white text-sm">
                    Official ID Badge Preview
                  </h3>
                  <span className="text-[10px] font-mono text-gray-400 block">
                    {selectedMemberForCard.name} &bull; {selectedMemberForCard.id}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedMemberForCard(null)}
                className="text-gray-400 hover:text-white text-lg font-bold px-2 py-1"
              >
                &times;
              </button>
            </div>

            {/* Badge Render Box */}
            <div className="relative rounded-2xl overflow-hidden border border-primary/20 bg-darkNavy flex items-center justify-center min-h-[380px]">
              {generatingCard ? (
                <div className="text-center space-y-2 py-12">
                  <RefreshCw className="w-8 h-8 text-accent animate-spin mx-auto" />
                  <span className="text-xs font-mono text-gray-300 block">
                    Generating Official 1224 &times; 1806 Card...
                  </span>
                </div>
              ) : generatedCardData ? (
                <img
                  src={generatedCardData.stdDataUrl || generatedCardData.hdDataUrl}
                  alt={`${selectedMemberForCard.name} Official ID Badge`}
                  className="w-full h-auto max-h-[460px] object-contain shadow-2xl"
                />
              ) : (
                <div className="text-center text-gray-400 text-xs py-12 font-mono">
                  Card failed to generate.
                </div>
              )}
            </div>

            {/* Active Link feedback */}
            <div className="space-y-1.5 text-center text-xs text-gray-300">
              <p className="font-mono text-[11px] text-emerald-400 flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Official Circuitron Scannable QR Badge
              </p>
              <code className="block bg-black/50 p-2 rounded text-[11px] font-mono text-accent select-all break-all">
                {`https://circuitron2-0.vercel.app/verify/${selectedMemberForCard.id}`}
              </code>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                disabled={!generatedCardData}
                onClick={() => {
                  if (generatedCardData?.hdDataUrl) {
                    downloadDataUrl(
                      generatedCardData.hdDataUrl,
                      `${selectedMemberForCard.name.replace(/\s+/g, "_")}_TechXpo_2.0_ID_Badge_HD.jpg`
                    );
                  }
                }}
                className="btn-primary flex-1 py-3 text-xs font-bold text-center flex items-center justify-center space-x-2 shadow-neon"
              >
                <Download className="w-4 h-4" />
                <span>Download Print HD (1224&times;1806)</span>
              </button>

              <button
                disabled={!generatedCardData}
                onClick={() => {
                  if (generatedCardData?.qrDataUrl) {
                    downloadDataUrl(
                      generatedCardData.qrDataUrl,
                      `${selectedMemberForCard.id}_QR.png`
                    );
                  }
                }}
                className="btn-secondary py-3 px-4 text-xs font-bold flex items-center justify-center space-x-1.5"
                title="Download Standalone QR Code"
              >
                <QrCode className="w-4 h-4 text-accent" />
                <span>QR Only</span>
              </button>

              <button
                onClick={() => setSelectedMemberForCard(null)}
                className="btn-secondary py-3 px-4 text-xs font-bold"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}
