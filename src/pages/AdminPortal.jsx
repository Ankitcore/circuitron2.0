import React, { useState, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
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
  EyeOff,
  Check,
  Copy,
  X,
  Home,
  Pencil,
  UserCog,
  Edit3,
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
  updateMember,
  deleteMember,
  resetCustomMembers,
  saveCustomMembers,
  getCustomMembers,
  generateUniqueMemberId,
  TIER_CONFIG,
  normalizeTierKey,
  isMemberVisibleOnWebsite,
  setMemberWebsiteVisibility,
  toggleMemberWebsiteVisibility,
  setTeamWebsiteVisibility,
  fetchMembersFromCloud,
  syncAllMembersToCloud,
  encodeMembersForSync,
  decodeMembersFromSync,
} from "../data/team";
import QRCode from "qrcode";
import { generateMemberIdCard, generateQrCodeDataUrl, downloadDataUrl, getMemberVerificationUrl } from "../utils/idCardGenerator";
import { compressAvatarImage, uploadAvatarToCloud } from "../utils/imageCompressor";
import {
  verifyAdminPasskey,
  isAdminAuthenticated,
  setAdminSession,
  clearAdminSession,
  touchAdminActivity,
  ADMIN_STORAGE_KEY,
} from "../utils/adminAuth";

export default function AdminPortal() {
  const navigate = useNavigate();

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(() => isAdminAuthenticated());
  const [passcodeInput, setPasscodeInput] = useState("");
  const [authError, setAuthError] = useState("");

  // Navigation workspace tabs: 'roster' | 'add' | 'bulk' | 'backup'
  const [activeTab, setActiveTab] = useState("roster");

  // Roster Filter & Search
  const [tierFilter, setTierFilter] = useState("all");
  const [visibilityFilter, setVisibilityFilter] = useState("all"); // 'all' | 'visible' | 'hidden'
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
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [formShowOnWebsite, setFormShowOnWebsite] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSuccessMessage, setFormSuccessMessage] = useState("");

  // Bulk Import State
  const [bulkTier, setBulkTier] = useState("participant");
  const [bulkTextInput, setBulkTextInput] = useState("");
  const [bulkParsedPreview, setBulkParsedPreview] = useState([]);
  const [bulkDefaultDept, setBulkDefaultDept] = useState("RVSCET Jamshedpur");
  const [bulkDefaultRole, setBulkDefaultRole] = useState("Registered Participant");
  const [bulkShowOnWebsite, setBulkShowOnWebsite] = useState(false);
  const [isBulkImporting, setIsBulkImporting] = useState(false);
  const [bulkSuccessMessage, setBulkSuccessMessage] = useState("");

  // Card Modal State
  const [selectedMemberForCard, setSelectedMemberForCard] = useState(null);
  const [generatingCard, setGeneratingCard] = useState(false);
  const [generatedCardData, setGeneratedCardData] = useState(null);

  // Device Peer Sync State (1-click QR / Link transfer between phone and PC)
  const [showDeviceSyncModal, setShowDeviceSyncModal] = useState(false);
  const [deviceSyncQrUrl, setDeviceSyncQrUrl] = useState("");
  const [deviceSyncShareUrl, setDeviceSyncShareUrl] = useState("");
  const [isCopiedSyncLink, setIsCopiedSyncLink] = useState(false);

  // Cloud Registry Synchronization State
  const [isCloudSyncing, setIsCloudSyncing] = useState(false);
  const [cloudSyncMessage, setCloudSyncMessage] = useState("");

  // Edit Custom Member State
  const [editSelectedId, setEditSelectedId] = useState("");
  const [editTier, setEditTier] = useState("participant");
  const [editName, setEditName] = useState("");
  const [editRole, setEditRole] = useState("");
  const [editDept, setEditDept] = useState("RVSCET Jamshedpur");
  const [editTeamName, setEditTeamName] = useState("");
  const [editImage, setEditImage] = useState("");
  const [editImagePreview, setEditImagePreview] = useState("");
  const [isUploadingEditPhoto, setIsUploadingEditPhoto] = useState(false);
  const [editShowOnWebsite, setEditShowOnWebsite] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editSuccessMessage, setEditSuccessMessage] = useState("");

  // Auto-generate ID & default visibility preview when formTier changes
  useEffect(() => {
    setFormCustomId(generateUniqueMemberId(formTier));
    setFormShowOnWebsite(formTier === "executive" || formTier === "core");
  }, [formTier]);

  // Default bulk visibility when bulkTier changes
  useEffect(() => {
    setBulkShowOnWebsite(bulkTier === "executive" || bulkTier === "core");
  }, [bulkTier]);

  // Listen for custom members updates across tabs/storage
  useEffect(() => {
    const handleUpdate = () => {
      setRegistryVersion((v) => v + 1);
    };
    window.addEventListener("tx2_members_updated", handleUpdate);
    return () => window.removeEventListener("tx2_members_updated", handleUpdate);
  }, []);

  // Escape key closes modals
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        if (selectedMemberForCard) {
          setSelectedMemberForCard(null);
          setGeneratedCardData(null);
        }
        if (showDeviceSyncModal) {
          setShowDeviceSyncModal(false);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedMemberForCard, showDeviceSyncModal]);

  // Auto-detect & import sync payload from URL parameters (e.g., when scanned with phone)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const syncToken = params.get("sync") || params.get("import");
    if (syncToken) {
      try {
        const imported = decodeMembersFromSync(decodeURIComponent(syncToken));
        if (Array.isArray(imported) && imported.length > 0) {
          const current = getCustomMembers();
          const map = new Map(current.map((m) => [m.id?.toUpperCase(), m]));
          imported.forEach((m) => {
            if (m && m.id) map.set(m.id.toUpperCase(), m);
          });
          const merged = Array.from(map.values());
          saveCustomMembers(merged);
          setRegistryVersion((v) => v + 1);
          setCloudSyncMessage(`Successfully synced ${imported.length} member(s) from peer device!`);
          setTimeout(() => setCloudSyncMessage(""), 5000);
          // Clean search params from URL without reloading
          const url = new URL(window.location.href);
          url.searchParams.delete("sync");
          url.searchParams.delete("import");
          window.history.replaceState({}, document.title, url.pathname + (url.search ? url.search : ""));
        }
      } catch (err) {
        console.warn("Failed parsing sync URL token:", err);
      }
    }
  }, []);

  // Generate Sync QR code whenever modal opens
  useEffect(() => {
    if (showDeviceSyncModal) {
      try {
        const custom = getCustomMembers();
        const token = encodeMembersForSync(custom);
        const origin = typeof window !== "undefined" ? window.location.origin : "https://circuitron2-0.vercel.app";
        const shareUrl = `${origin}/admin?sync=${encodeURIComponent(token)}`;
        setDeviceSyncShareUrl(shareUrl);

        QRCode.toDataURL(shareUrl, {
          width: 500,
          margin: 2,
          color: { dark: "#0A1A36", light: "#FFFFFF" },
          errorCorrectionLevel: "M",
        })
          .then((dataUrl) => {
            setDeviceSyncQrUrl(dataUrl);
          })
          .catch((err) => {
            console.warn("Failed generating sync QR:", err);
          });
      } catch (err) {
        console.warn("Error preparing sync URL:", err);
      }
    }
  }, [showDeviceSyncModal, registryVersion]);

  const autoUpgradeLocalImages = async () => {
    const custom = getCustomMembers();
    let updated = false;
    const modified = [];

    for (const m of custom) {
      if (m.img && typeof m.img === "string" && m.img.startsWith("data:image")) {
        try {
          const cdnUrl = await uploadAvatarToCloud(m.img);
          if (cdnUrl && cdnUrl.startsWith("http")) {
            modified.push({ ...m, img: cdnUrl });
            updated = true;
            continue;
          }
        } catch (e) {
          console.warn("Failed upgrading member avatar:", m.id, e);
        }
      }
      modified.push(m);
    }

    if (updated) {
      saveCustomMembers(modified);
      setRegistryVersion((v) => v + 1);
    }
  };

  const handleCloudSync = async () => {
    setIsCloudSyncing(true);
    setCloudSyncMessage("");
    try {
      const fetched = await fetchMembersFromCloud();
      await autoUpgradeLocalImages();
      await syncAllMembersToCloud();
      const count = Array.isArray(fetched) ? fetched.length : getCustomMembers().length;
      setRegistryVersion((v) => v + 1);
      setCloudSyncMessage(`Cloud Registry Synced (${count} custom delegates active)`);
      setTimeout(() => setCloudSyncMessage(""), 4000);
    } catch (e) {
      console.warn("Cloud sync error:", e);
      setCloudSyncMessage("Cloud sync fallback: local registry active");
      setTimeout(() => setCloudSyncMessage(""), 4000);
    } finally {
      setIsCloudSyncing(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      handleCloudSync();
    }
  }, [isAuthenticated]);

  // --------------------------------------------------------------------------
  // Auto-logout: automatically log out after 30 minutes of inactivity
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (!isAuthenticated) return;

    // Immediately register activity on load / authentication
    touchAdminActivity();

    // Throttled activity updater: write to localStorage at most once every 10 seconds
    let lastRecorded = Date.now();
    const handleUserActivity = () => {
      const now = Date.now();
      if (now - lastRecorded > 10000) {
        lastRecorded = now;
        touchAdminActivity();
      }
    };

    const events = ["mousedown", "mousemove", "keydown", "scroll", "touchstart", "click"];
    events.forEach((evt) => window.addEventListener(evt, handleUserActivity, { passive: true }));

    // Periodic check every 5 seconds to verify if 30 minutes have elapsed
    const checkTimeout = () => {
      if (!isAdminAuthenticated()) {
        clearAdminSession();
        setIsAuthenticated(false);
        setAuthError("Session expired due to 30 minutes of inactivity. Please re-authenticate.");
      }
    };

    const intervalId = setInterval(checkTimeout, 5000);

    // Immediate check on tab focus or visibility return
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkTimeout();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", checkTimeout);

    // Cross-tab synchronization
    const handleStorageChange = (e) => {
      if (e.key === ADMIN_STORAGE_KEY && e.newValue !== "true") {
        setIsAuthenticated(false);
      }
    };
    window.addEventListener("storage", handleStorageChange);

    return () => {
      events.forEach((evt) => window.removeEventListener(evt, handleUserActivity));
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", checkTimeout);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [isAuthenticated]);

  // Retrieve current members list
  const allMembers = useMemo(() => {
    return getAllMembers();
  }, [registryVersion]);

  // Compute live statistics
  const stats = useMemo(() => {
    const execs = allMembers.filter((m) => normalizeTierKey(m.tierKey || m.tier || m.category, m.id) === "executive");
    const core = allMembers.filter((m) => normalizeTierKey(m.tierKey || m.tier || m.category, m.id) === "core");
    const participants = allMembers.filter((m) => normalizeTierKey(m.tierKey || m.tier || m.category, m.id) === "participant");
    const volunteers = allMembers.filter((m) => normalizeTierKey(m.tierKey || m.tier || m.category, m.id) === "volunteer");
    const faculty = allMembers.filter((m) => normalizeTierKey(m.tierKey || m.tier || m.category, m.id) === "faculty");
    const onWebsite = allMembers.filter(isMemberVisibleOnWebsite);
    return {
      total: allMembers.length,
      executives: execs.length,
      core: core.length,
      participants: participants.length,
      volunteers: volunteers.length,
      faculty: faculty.length,
      customCount: allMembers.filter((m) => m.isCustom).length,
      onWebsite: onWebsite.length,
    };
  }, [allMembers]);

  // Filtered Roster
  const filteredRoster = useMemo(() => {
    return allMembers.filter((m) => {
      // Tier filter
      const tKey = normalizeTierKey(m.tierKey || m.tier || m.category, m.id);
      if (tierFilter !== "all" && tKey !== tierFilter) {
        return false;
      }

      // Visibility filter
      const isVisible = isMemberVisibleOnWebsite(m);
      if (visibilityFilter === "visible" && !isVisible) return false;
      if (visibilityFilter === "hidden" && isVisible) return false;

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
  }, [allMembers, tierFilter, visibilityFilter, searchQuery]);

  // Handle Admin Login
  const handleLogin = (e) => {
    e.preventDefault();
    if (verifyAdminPasskey(passcodeInput)) {
      setAdminSession(passcodeInput);
      setIsAuthenticated(true);
      setAuthError("");
    } else {
      setAuthError("Invalid administrative passcode. Please verify your clearance.");
    }
  };

  // Handle Admin Logout
  const handleLogout = () => {
    clearAdminSession();
    setIsAuthenticated(false);
    setPasscodeInput("");
  };

  // Toggle Single Member Visibility
  const handleToggleMemberVisibility = (member) => {
    toggleMemberWebsiteVisibility(member.id);
    setRegistryVersion((v) => v + 1);
  };

  // Batch Toggle Visibility for all currently filtered members
  const handleBatchVisibility = (isVisible) => {
    if (filteredRoster.length === 0) return;
    const actionWord = isVisible ? "Show" : "Hide";
    if (
      window.confirm(
        `${actionWord} all ${filteredRoster.length} currently filtered members on the Website Team page (/team)?`
      )
    ) {
      filteredRoster.forEach((m) => {
        setMemberWebsiteVisibility(m.id, isVisible);
      });
      setRegistryVersion((v) => v + 1);
    }
  };

  // Handle Photo File Upload with Auto-Compression & Cloud CDN Hosting
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      alert("Please select an image smaller than 15MB.");
      return;
    }

    setIsUploadingPhoto(true);
    try {
      // 1. Immediately compress the avatar locally (instant preview & tiny ~20KB payload)
      const compressedDataUrl = await compressAvatarImage(file, 380, 0.82);
      setFormImage(compressedDataUrl);
      setFormImagePreview(compressedDataUrl);

      // 2. Upload to permanent CDN to obtain cross-device public HTTPS URL
      const cdnUrl = await uploadAvatarToCloud(compressedDataUrl);
      if (cdnUrl && (cdnUrl.startsWith("http://") || cdnUrl.startsWith("https://"))) {
        setFormImage(cdnUrl);
      }
    } catch (err) {
      console.warn("Avatar processing error:", err);
    } finally {
      setIsUploadingPhoto(false);
    }
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
        img: formImage || "/assets/default-avatar.jpg",
        showOnWebsite: formShowOnWebsite,
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

  // Start editing a specific custom member
  const handleStartEditMember = (member) => {
    if (!member) return;
    setEditSelectedId(member.id);
    setEditName(member.name || "");
    const tKey = normalizeTierKey(member.tierKey || member.tier || member.category, member.id);
    setEditTier(tKey);
    setEditRole(member.role || member.position || "");
    setEditDept(member.department || "RVSCET Jamshedpur");
    setEditTeamName(member.teamName || "");
    setEditImage(member.img || "");
    setEditImagePreview(member.img || "");
    setEditShowOnWebsite(isMemberVisibleOnWebsite(member));
    setEditSuccessMessage("");
    setActiveTab("edit");
  };

  // Change member to edit via dropdown selector
  const handleSelectMemberToEdit = (id) => {
    if (!id) {
      setEditSelectedId("");
      return;
    }
    const customList = getCustomMembers();
    const found = customList.find((m) => m.id?.toUpperCase() === id?.toUpperCase());
    if (found) {
      handleStartEditMember(found);
    }
  };

  // Auto-select first custom member when entering edit tab if none selected
  useEffect(() => {
    if (activeTab === "edit" && !editSelectedId) {
      const custom = getCustomMembers();
      if (custom.length > 0 && custom[0]) {
        handleStartEditMember(custom[0]);
      }
    }
  }, [activeTab, editSelectedId]);

  // Handle Edit Member Photo Upload
  const handleEditPhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingEditPhoto(true);
    try {
      const compressedDataUrl = await compressAvatarImage(file, 380, 0.82);
      setEditImage(compressedDataUrl);
      setEditImagePreview(compressedDataUrl);

      const cdnUrl = await uploadAvatarToCloud(compressedDataUrl);
      if (cdnUrl && (cdnUrl.startsWith("http://") || cdnUrl.startsWith("https://"))) {
        setEditImage(cdnUrl);
      }
    } catch (err) {
      console.warn("Avatar processing error during edit:", err);
    } finally {
      setIsUploadingEditPhoto(false);
    }
  };

  // Handle Edit Member Form Submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editSelectedId) {
      alert("Please select a custom member to edit.");
      return;
    }
    if (!editName.trim()) {
      alert("Please enter the person's full name.");
      return;
    }

    setIsSavingEdit(true);
    try {
      const updated = updateMember(editSelectedId, {
        name: editName.trim(),
        role: editRole.trim() || (editTier === "participant" ? "Competitor" : TIER_CONFIG[editTier]?.label),
        tier: editTier,
        tierKey: editTier,
        category: TIER_CONFIG[editTier]?.label,
        department: editDept.trim() || "RVSCET Jamshedpur",
        teamName: editTier === "participant" ? editTeamName.trim() : "",
        img: editImage || "/assets/default-avatar.jpg",
        showOnWebsite: editShowOnWebsite,
      });

      if (updated) {
        setMemberWebsiteVisibility(editSelectedId, editShowOnWebsite);
        setRegistryVersion((v) => v + 1);
        setEditSuccessMessage(`Changes saved successfully for ${updated.name} (${updated.id})!`);
        setTimeout(() => setEditSuccessMessage(""), 5000);
      } else {
        alert("Could not find the custom member to update.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update member: " + err.message);
    } finally {
      setIsSavingEdit(false);
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
        showOnWebsite: bulkShowOnWebsite,
      };
    });

    setBulkParsedPreview(parsed);
  }, [bulkTextInput, bulkTier, bulkDefaultRole, bulkDefaultDept, bulkShowOnWebsite]);

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
      const added = addMembersBulk(bulkParsedPreview, bulkTier, {
        showOnWebsite: bulkShowOnWebsite,
      });
      setRegistryVersion((v) => v + 1);
      setBulkSuccessMessage(
        `Successfully enrolled ${added.length} people into ${TIER_CONFIG[bulkTier]?.label}! (Website visibility: ${
          bulkShowOnWebsite ? "Published to /team" : "Badge/Verification only"
        })`
      );
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
      alert("Built-in committee members cannot be deleted from this portal. You can toggle their visibility on the Website Team section instead.");
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
      if (!member.isCustom && member.idCardHd) {
        setGeneratedCardData({
          hdDataUrl: member.idCardHd,
          stdDataUrl: member.idCard || member.idCardHd,
          qrDataUrl: member.qrCode || `/assets/id-cards/${member.id}_qr.png`,
        });
      } else {
        const result = await generateMemberIdCard(member);
        setGeneratedCardData(result);
      }
    } catch (err) {
      console.error("Failed to generate member card:", err);
      alert("Error generating ID Card: " + err.message);
    } finally {
      setGeneratingCard(false);
    }
  };

  // Export Full Roster as CSV
  const handleExportCSV = () => {
    const headers = ["MemberID", "Name", "Tier", "Role", "Department", "TeamName", "ShowOnWebsite", "VerifiedURL"];
    const rows = allMembers.map((m) => [
      `"${m.id || ""}"`,
      `"${(m.name || "").replace(/"/g, '""')}"`,
      `"${m.category || m.tier || ""}"`,
      `"${(m.role || m.position || "").replace(/"/g, '""')}"`,
      `"${(m.department || "").replace(/"/g, '""')}"`,
      `"${(m.teamName || "").replace(/"/g, '""')}"`,
      `"${isMemberVisibleOnWebsite(m) ? "YES" : "NO"}"`,
      `"${getMemberVerificationUrl(m)}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `TechXpo_Roster_${tierFilter}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Export Custom Members Backup JSON
  const handleExportJSON = () => {
    const custom = getCustomMembers();
    const overrides = localStorage.getItem("tx2_visibility_overrides") || "{}";
    const data = {
      version: "2.0",
      exportedAt: new Date().toISOString(),
      customMembers: custom,
      visibilityOverrides: JSON.parse(overrides),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
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
          if (parsed.visibilityOverrides) {
            localStorage.setItem("tx2_visibility_overrides", JSON.stringify(parsed.visibilityOverrides));
          }
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
    if (
      window.confirm(
        "Are you sure you want to clear all custom added members? This will restore the roster back to default official members only."
      )
    ) {
      resetCustomMembers();
      localStorage.removeItem("tx2_visibility_overrides");
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
          {/* Top-Right "X" Cancel Button */}
          <Link
            to="/"
            className="absolute top-5 right-5 w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all z-20 group"
            title="Cancel & Return to Home"
            aria-label="Cancel and return to home"
          >
            <X className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </Link>

          {/* Cyber ambient glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center text-accent mx-auto shadow-neon">
              <KeyRound className="w-8 h-8" />
            </div>
            <span className="text-xs font-mono uppercase tracking-widest text-accent font-bold">
              TECHXPO 2.O ADMIN
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
                Admin Passcode
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
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center space-x-2"
              >
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span>{authError}</span>
              </motion.div>
            )}

            <button
              type="submit"
              className="w-full btn-primary py-3.5 text-xs font-bold tracking-wider uppercase shadow-neon flex items-center justify-center space-x-2"
            >
              <Unlock className="w-4 h-4" />
              <span>Authenticate Clearance</span>
            </button>

            <div className="pt-3 border-t border-white/10 flex flex-col items-center space-y-2">
              <Link
                to="/"
                className="w-full py-2.5 px-4 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/25 text-cyan-300 hover:text-cyan-200 text-xs font-mono font-bold flex items-center justify-center space-x-2 transition-all shadow-sm group"
              >
                <Home className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                <span>Return to Home</span>
              </Link>

              <Link
                to="/verify"
                className="text-[11px] font-mono text-gray-400 hover:text-accent transition-colors pt-0.5"
              >
                &larr; Return to Public Verification Desk
              </Link>
            </div>
          </form>
        </motion.div>
      </div>
    );
  }

  // ==========================================================================
  // VIEW: AUTHENTICATED ADMIN PORTAL
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
              <span>ADMIN CLEARANCE &bull; ACTIVE &bull; 30M IDLE AUTO-LOCK</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black font-orbitron gradient-text">
              TechXpo 2.O Admin Portal
            </h1>
            <p className="text-gray-300 text-xs sm:text-sm max-w-xl">
              Enroll, manage, and issue high-definition ID cards with active verification links across Executive, Core Team, Participant, and Volunteer tiers. Choose whether each member or team appears on the public website Team section.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 relative z-10">
            <Link
              to="/verify"
              className="btn-secondary text-xs py-2.5 px-4 font-bold flex items-center space-x-1.5"
              target="_blank"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Public Verify Page</span>
            </Link>

            <button
              type="button"
              onClick={() => setShowDeviceSyncModal(true)}
              className="btn-secondary text-xs py-2.5 px-4 font-bold flex items-center space-x-1.5 text-purple-300 border-purple-500/40 hover:bg-purple-500/10 transition-all shadow-[0_0_15px_rgba(168,85,247,0.15)]"
              title="Sync custom delegates to phone, tablet or other browser via QR code or 1-click link"
            >
              <QrCode className="w-3.5 h-3.5 text-purple-400" />
              <span>Sync Devices</span>
            </button>

            <button
              type="button"
              onClick={handleCloudSync}
              disabled={isCloudSyncing}
              className="btn-secondary text-xs py-2.5 px-4 font-bold flex items-center space-x-1.5 text-accent border-accent/40 hover:bg-accent/10 transition-all"
              title="Synchronize delegates with Central Cloud Registry"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isCloudSyncing ? "animate-spin text-accent" : ""}`} />
              <span>{isCloudSyncing ? "Syncing..." : "Sync Cloud"}</span>
            </button>

            <button
              onClick={handleLogout}
              className="px-4 py-2.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 hover:bg-red-500/25 text-xs font-mono font-bold flex items-center space-x-1.5 transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Lock Admin</span>
            </button>
          </div>
        </div>

        {/* Cloud Sync Status Banner */}
        {cloudSyncMessage && (
          <div className="px-4 py-2.5 rounded-2xl bg-accent/10 border border-accent/30 text-accent font-mono text-xs flex items-center justify-between shadow-[0_0_20px_rgba(0,229,255,0.15)]">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              {cloudSyncMessage}
            </span>
            <button onClick={() => setCloudSyncMessage("")} className="text-gray-400 hover:text-white font-bold">&times;</button>
          </div>
        )}

        {/* Live Metric Statistics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
          <div className="glass-card p-4 rounded-2xl border border-white/10 text-center space-y-1">
            <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">Total Roster</span>
            <span className="text-2xl sm:text-3xl font-black font-orbitron text-white">{stats.total}</span>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-emerald-500/30 text-center space-y-1 bg-emerald-500/[0.03]">
            <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block">On Website /team</span>
            <span className="text-2xl sm:text-3xl font-black font-orbitron text-emerald-300">{stats.onWebsite}</span>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-sky-400/20 text-center space-y-1">
            <span className="text-[10px] font-mono text-sky-400 uppercase tracking-wider block">Faculty</span>
            <span className="text-2xl sm:text-3xl font-black font-orbitron text-sky-300">{stats.faculty}</span>
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
            onClick={() => setActiveTab("edit")}
            className={`flex items-center space-x-2 py-3 px-4 sm:px-6 rounded-2xl text-xs sm:text-sm font-orbitron font-bold transition-all whitespace-nowrap ${
              activeTab === "edit"
                ? "bg-amber-500/20 border border-amber-500/40 text-amber-300 shadow-neon"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <UserCog className="w-4 h-4 text-amber-400" />
            <span>Edit Custom Person {stats.customCount > 0 ? `(${stats.customCount})` : ""}</span>
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
            <div className="glass-card p-4 sm:p-5 rounded-2xl border border-primary/20 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
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

              {/* Website Visibility Filter & Search Box */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center bg-darkNavy/90 border border-primary/20 rounded-xl p-0.5">
                  {[
                    { id: "all", label: "All" },
                    { id: "visible", label: "On /team" },
                    { id: "hidden", label: "Hidden" },
                  ].map((btn) => (
                    <button
                      key={btn.id}
                      onClick={() => setVisibilityFilter(btn.id)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all ${
                        visibilityFilter === btn.id
                          ? "bg-primary/30 text-accent"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>

                <div className="relative min-w-[220px]">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search name, ID, role..."
                    className="w-full pl-10 pr-4 py-2 bg-darkNavy/90 border border-primary/20 rounded-xl text-white placeholder-gray-500 text-xs font-mono focus:outline-none focus:border-accent"
                  />
                </div>
              </div>
            </div>

            {/* Quick Batch Visibility Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-1 text-xs font-mono">
              <span className="text-gray-400">
                Showing <strong>{filteredRoster.length}</strong> members of {allMembers.length}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleBatchVisibility(true)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25 text-xs font-mono font-bold flex items-center space-x-1.5 transition-all"
                  title="Show all currently filtered members on public /team page"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Show Filtered on /team</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleBatchVisibility(false)}
                  className="px-3 py-1.5 rounded-xl bg-gray-500/15 border border-gray-500/30 text-gray-300 hover:bg-gray-500/25 text-xs font-mono font-bold flex items-center space-x-1.5 transition-all"
                  title="Hide all currently filtered members from public /team page"
                >
                  <EyeOff className="w-3.5 h-3.5" />
                  <span>Hide Filtered from /team</span>
                </button>
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
                      <th className="py-3.5 px-4 text-center">Website /team Section</th>
                      <th className="py-3.5 px-4">Origin</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredRoster.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-gray-400 font-mono">
                          No members match the current filter or search query.
                        </td>
                      </tr>
                    ) : (
                      filteredRoster.map((m) => {
                        const tKey = normalizeTierKey(m.tierKey || m.tier || m.category, m.id);
                        const cfg = TIER_CONFIG[tKey] || TIER_CONFIG.participant;
                        const isVisible = isMemberVisibleOnWebsite(m);

                        return (
                          <tr key={m.id} className="hover:bg-white/[0.02] transition-colors group">
                            {/* Member Info */}
                            <td className="py-3 px-4">
                              <div className="flex items-center space-x-3">
                                <div className="w-9 h-9 rounded-full overflow-hidden bg-darkNavy border border-primary/30 flex-shrink-0 flex items-center justify-center font-bold text-accent">
                                  <img
                                    src={m.img || "/assets/default-avatar.jpg"}
                                    alt={m.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.currentTarget.onerror = null;
                                      e.currentTarget.src = "/assets/default-avatar.jpg";
                                    }}
                                  />
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
                                  Team: {m.teamName}
                                </span>
                              )}
                            </td>

                            {/* Website /team Toggle Action */}
                            <td className="py-3 px-4 text-center">
                              <button
                                type="button"
                                onClick={() => handleToggleMemberVisibility(m)}
                                className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-bold inline-flex items-center space-x-1.5 transition-all shadow-sm ${
                                  isVisible
                                    ? "bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25"
                                    : "bg-gray-500/15 border border-gray-500/30 text-gray-400 hover:bg-gray-500/25 hover:text-gray-300"
                                }`}
                                title="Click to toggle whether this member appears on public /team page"
                              >
                                {isVisible ? (
                                  <>
                                    <Eye className="w-3.5 h-3.5 text-emerald-400" />
                                    <span>On /team</span>
                                  </>
                                ) : (
                                  <>
                                    <EyeOff className="w-3.5 h-3.5 text-gray-400" />
                                    <span>Hidden</span>
                                  </>
                                )}
                              </button>
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
                                  onClick={() => handleStartEditMember(m)}
                                  className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 inline-flex items-center space-x-1 text-xs font-semibold transition-all"
                                  title="Edit this Custom Member"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                  <span className="hidden sm:inline">Edit</span>
                                </button>
                              )}

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
        {/* TAB 2: ADD INDIVIDUAL PERSON FORM                                  */}
        {/* ================================================================== */}
        {activeTab === "add" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Enrollment Form Column (7 cols) */}
            <div className="lg:col-span-7 glass-card p-6 sm:p-8 rounded-3xl border border-primary/30 space-y-6">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-accent font-bold">
                  DELEGATE ENROLLMENT
                </span>
                <h2 className="text-2xl font-black font-orbitron text-white mt-1">
                  Add Single Member
                </h2>
                <p className="text-gray-300 text-xs mt-1">
                  Enroll an individual into the official TechXpo 2.O registry. A unique ID, encrypted QR code, and ID card will be minted immediately.
                </p>
              </div>

              {formSuccessMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs flex items-center space-x-2"
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <span>{formSuccessMessage}</span>
                </motion.div>
              )}

              <form onSubmit={handleSingleSubmit} className="space-y-5">
                {/* 1. Target Tier Selector */}
                <div>
                  <label className="block text-xs font-mono text-gray-300 mb-1.5 uppercase tracking-wider font-semibold">
                    1. Select Delegate Tier *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {[
                      { id: "executive", label: "Executive Team", color: "#A855F7" },
                      { id: "core", label: "Core Team", color: "#00E5FF" },
                      { id: "participant", label: "Participant", color: "#10B981" },
                      { id: "volunteer", label: "Volunteer", color: "#F59E0B" },
                      { id: "faculty", label: "Faculty", color: "#38BDF8" },
                    ].map((t) => (
                      <button
                        type="button"
                        key={t.id}
                        onClick={() => {
                          setFormTier(t.id);
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
                    placeholder="e.g. AMIT SHARMA"
                    className="w-full px-4 py-3 bg-darkNavy/90 border border-primary/20 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-accent uppercase font-bold"
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

                {/* Team / Group Name */}
                <div>
                  <label className="block text-xs font-mono text-amber-300 mb-1.5 uppercase tracking-wider font-semibold">
                    5. Group / Team Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={formTeamName}
                    onChange={(e) => setFormTeamName(e.target.value)}
                    placeholder="e.g. Circuitron Core, RoboKnights, Web Wing"
                    className="w-full px-4 py-3 bg-darkNavy/90 border border-amber-500/30 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-amber-400"
                  />
                </div>

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
                    className="w-full px-4 py-3 bg-darkNavy/90 border border-primary/20 rounded-xl text-white text-sm font-mono tracking-wider focus:outline-none focus:border-accent uppercase font-bold"
                  />
                </div>

                {/* Member Photo Upload */}
                <div>
                  <label className="block text-xs font-mono text-gray-300 mb-1.5 uppercase tracking-wider font-semibold">
                    Profile Portrait (Optional)
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-darkNavy border-2 border-primary/30 flex items-center justify-center flex-shrink-0 relative">
                      {formImagePreview ? (
                        <img src={formImagePreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <img src="/assets/default-avatar.jpg" alt="Default Avatar" className="w-full h-full object-cover opacity-85" />
                      )}
                      {isUploadingPhoto && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <RefreshCw className="w-5 h-5 text-accent animate-spin" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="block w-full text-xs text-gray-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary/20 file:text-accent hover:file:bg-primary/30 cursor-pointer"
                      />
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-400 font-mono">OR URL:</span>
                        <input
                          type="url"
                          value={formImage && formImage.startsWith("http") ? formImage : ""}
                          onChange={(e) => {
                            setFormImage(e.target.value);
                            setFormImagePreview(e.target.value);
                          }}
                          placeholder="Paste image link (https://...)"
                          className="flex-1 px-2.5 py-1 bg-darkNavy border border-primary/20 rounded-lg text-white text-[11px] focus:outline-none focus:border-accent"
                        />
                      </div>
                      <span className="text-[10px] text-gray-500 block">
                        {isUploadingPhoto ? (
                          <span className="text-accent flex items-center gap-1 font-mono">
                            <RefreshCw className="w-3 h-3 animate-spin" />
                            Optimizing and uploading to cloud CDN...
                          </span>
                        ) : formImage && formImage.startsWith("http") ? (
                          <span className="text-emerald-400 flex items-center gap-1 font-mono">
                            <CheckCircle2 className="w-3 h-3" />
                            Cloud CDN Ready: Image will load on any device!
                          </span>
                        ) : (
                          "Square photo recommended. Auto-compressed & hosted across all devices."
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Website Team Section Toggle Switch */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-darkNavy/80 border border-primary/20">
                  <div className="space-y-0.5 pr-4">
                    <div className="flex items-center space-x-2">
                      <Eye className="w-4 h-4 text-cyan-400" />
                      <span className="text-xs font-mono text-white uppercase tracking-wider font-bold">
                        Add to Website Team Section (/team)
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400">
                      {formShowOnWebsite
                        ? "Visible: This member will appear publicly in the website Team section (/team)."
                        : "Hidden: This member is enrolled for ID badge & verification only, and will NOT appear on /team."}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormShowOnWebsite(!formShowOnWebsite)}
                    className={`w-12 h-6 rounded-full transition-colors relative p-0.5 flex-shrink-0 ${
                      formShowOnWebsite ? "bg-cyan-500" : "bg-gray-700"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white transition-transform ${
                        formShowOnWebsite ? "translate-x-6" : "translate-x-0"
                      }`}
                    />
                  </button>
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
                    borderColor: TIER_CONFIG[formTier]?.color || "#00E5FF",
                  }}
                >
                  {/* Category Ribbon Indicator */}
                  <div
                    className="text-[10px] font-mono font-bold uppercase tracking-widest py-1 px-3 rounded-full inline-block"
                    style={{
                      backgroundColor: `${TIER_CONFIG[formTier]?.color}20`,
                      color: TIER_CONFIG[formTier]?.color,
                      border: `1px solid ${TIER_CONFIG[formTier]?.color}40`,
                    }}
                  >
                    {TIER_CONFIG[formTier]?.badgeLabel}
                  </div>

                  {/* Avatar Circle */}
                  <div className="relative w-28 h-28 mx-auto">
                    <div
                      className="w-full h-full rounded-full overflow-hidden border-2 flex items-center justify-center bg-darkNavy shadow-lg"
                      style={{ borderColor: TIER_CONFIG[formTier]?.color }}
                    >
                      {formImagePreview ? (
                        <img src={formImagePreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <span
                          className="font-black text-2xl font-orbitron"
                          style={{ color: TIER_CONFIG[formTier]?.color }}
                        >
                          {formName ? formName.slice(0, 2).toUpperCase() : "TX"}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Name (Bold Exo 2) */}
                  <div>
                    <h3 className="font-black text-lg text-white font-exo tracking-tight uppercase">
                      {formName || "DELEGATE NAME"}
                    </h3>
                    <p
                      className="font-black text-xs uppercase tracking-wider mt-1"
                      style={{ color: TIER_CONFIG[formTier]?.color }}
                    >
                      {formRole || TIER_CONFIG[formTier]?.roleDefault || "PARTICIPANT"}
                    </p>
                  </div>

                  {/* Credential ID */}
                  <div className="pt-2 border-t border-white/10 text-left">
                    <span className="text-[9px] font-mono text-gray-400 uppercase block">CREDENTIAL ID</span>
                    <span className="font-mono text-sm font-bold text-white tracking-widest">
                      {formCustomId || "TX2-XX-0000"}
                    </span>
                    {formTeamName && (
                      <span className="text-[10px] font-mono text-amber-300 block mt-0.5">
                        Team: {formTeamName}
                      </span>
                    )}
                  </div>

                  {/* Website /team status badge */}
                  <div className="pt-1">
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full inline-block ${
                        formShowOnWebsite
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : "bg-gray-500/20 text-gray-400 border border-gray-500/30"
                      }`}
                    >
                      {formShowOnWebsite ? "Will feature on /team" : "Hidden from /team"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================== */}
        {/* TAB 2.5: EDIT CUSTOM PERSON SECTION                                */}
        {/* ================================================================== */}
        {activeTab === "edit" && (
          <div className="space-y-6">
            {/* Top Selector Card */}
            <div className="glass-card p-6 sm:p-8 rounded-3xl border border-amber-500/30 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold">
                    <UserCog className="w-3.5 h-3.5" />
                    <span>DELEGATE MANAGEMENT &bull; EDIT CUSTOM PERSON</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black font-orbitron text-white mt-1.5">
                    Edit Custom Member
                  </h2>
                  <p className="text-gray-300 text-xs sm:text-sm mt-1">
                    Select any custom enrolled person to modify their credentials, tier, role, department, portrait, or public website visibility.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab("roster")}
                    className="btn-secondary py-2.5 px-4 text-xs font-mono font-bold flex items-center space-x-1.5"
                  >
                    <span>&larr; View All Roster</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("add")}
                    className="btn-primary py-2.5 px-4 text-xs font-mono font-bold flex items-center space-x-1.5"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>+ Add New Person</span>
                  </button>
                </div>
              </div>

              {/* Custom Delegate Selector Dropdown */}
              <div className="pt-2">
                <label className="block text-xs font-mono text-amber-300 mb-1.5 uppercase tracking-wider font-bold">
                  Choose Custom Person to Edit:
                </label>
                {allMembers.filter((m) => m.isCustom).length === 0 ? (
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-gray-400 text-xs">
                    No custom members added yet. Use{" "}
                    <button
                      type="button"
                      onClick={() => setActiveTab("add")}
                      className="text-accent underline font-bold"
                    >
                      Add Individual Person
                    </button>{" "}
                    to enroll someone first.
                  </div>
                ) : (
                  <select
                    value={editSelectedId}
                    onChange={(e) => handleSelectMemberToEdit(e.target.value)}
                    className="w-full px-4 py-3.5 bg-darkNavy border-2 border-amber-500/40 rounded-xl text-white font-mono text-sm font-bold focus:outline-none focus:border-amber-400 shadow-neon cursor-pointer"
                  >
                    {allMembers
                      .filter((m) => m.isCustom)
                      .map((m) => {
                        const tCfg =
                          TIER_CONFIG[
                            normalizeTierKey(m.tierKey || m.tier || m.category, m.id)
                          ] || TIER_CONFIG.participant;
                        return (
                          <option key={m.id} value={m.id} className="bg-darkNavy text-white">
                            {m.name} ({m.id}) — {tCfg.label}
                            {m.teamName ? ` [Team: ${m.teamName}]` : ""}
                          </option>
                        );
                      })}
                  </select>
                )}
              </div>
            </div>

            {/* Edit Form & Live Preview Grid */}
            {editSelectedId && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Form Column (7 cols) */}
                <div className="lg:col-span-7 glass-card p-6 sm:p-8 rounded-3xl border border-primary/30 space-y-6">
                  {editSuccessMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs flex items-center space-x-2"
                    >
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                      <span>{editSuccessMessage}</span>
                    </motion.div>
                  )}

                  <form onSubmit={handleEditSubmit} className="space-y-5">
                    {/* Credential ID Banner (Read-only) */}
                    <div className="p-4 rounded-xl bg-darkNavy/90 border border-primary/30 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest block">
                          PERMANENT MINTED CREDENTIAL ID
                        </span>
                        <span className="text-xl font-bold font-orbitron text-accent tracking-wider">
                          {editSelectedId}
                        </span>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-accent/10 border border-accent/30 text-accent text-[11px] font-mono font-bold">
                        VERIFIED SECURE
                      </span>
                    </div>

                    {/* 1. Delegate Tier Selector */}
                    <div>
                      <label className="block text-xs font-mono text-gray-300 mb-1.5 uppercase tracking-wider font-semibold">
                        1. Delegate Tier &amp; Category *
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        {[
                          { id: "executive", label: "Executive Team", color: "#A855F7" },
                          { id: "core", label: "Core Team", color: "#00E5FF" },
                          { id: "participant", label: "Participant", color: "#10B981" },
                          { id: "volunteer", label: "Volunteer", color: "#F59E0B" },
                          { id: "faculty", label: "Faculty", color: "#38BDF8" },
                        ].map((t) => (
                          <button
                            type="button"
                            key={t.id}
                            onClick={() => setEditTier(t.id)}
                            className={`p-3 rounded-xl border text-center transition-all ${
                              editTier === t.id
                                ? "bg-darkNavy border-2 text-white shadow-neon"
                                : "bg-darkNavy/50 border-white/10 text-gray-400 hover:text-white"
                            }`}
                            style={{
                              borderColor: editTier === t.id ? t.color : undefined,
                            }}
                          >
                            <span
                              className="block text-xs font-bold font-orbitron"
                              style={{ color: t.color }}
                            >
                              {t.label}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 2. Full Name */}
                    <div>
                      <label className="block text-xs font-mono text-gray-300 mb-1.5 uppercase tracking-wider font-semibold">
                        2. Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="e.g. Amit Sharma"
                        className="w-full px-4 py-3 bg-darkNavy/90 border border-primary/20 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-accent"
                      />
                    </div>

                    {/* 3. Role / Designation */}
                    <div>
                      <label className="block text-xs font-mono text-gray-300 mb-1.5 uppercase tracking-wider font-semibold">
                        3. Role / Designation *
                      </label>
                      <input
                        type="text"
                        required
                        value={editRole}
                        onChange={(e) => setEditRole(e.target.value)}
                        placeholder={
                          editTier === "participant"
                            ? "e.g. Project Exhibitor, RoboWar Driver"
                            : "e.g. Event Lead, Media Specialist"
                        }
                        className="w-full px-4 py-3 bg-darkNavy/90 border border-primary/20 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-accent"
                      />
                    </div>

                    {/* 4. Department / Organization */}
                    <div>
                      <label className="block text-xs font-mono text-gray-300 mb-1.5 uppercase tracking-wider font-semibold">
                        4. College Department or Organization
                      </label>
                      <input
                        type="text"
                        value={editDept}
                        onChange={(e) => setEditDept(e.target.value)}
                        placeholder="e.g. Dept. of ECE, RVSCET Jamshedpur"
                        className="w-full px-4 py-3 bg-darkNavy/90 border border-primary/20 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-accent"
                      />
                    </div>

                    {/* 5. Team / Group Name */}
                    <div>
                      <label className="block text-xs font-mono text-amber-300 mb-1.5 uppercase tracking-wider font-semibold">
                        5. Group / Project / Robot Team Name (Optional)
                      </label>
                      <input
                        type="text"
                        value={editTeamName}
                        onChange={(e) => setEditTeamName(e.target.value)}
                        placeholder="e.g. RoboKnights, Circuitron Core, Innovators"
                        className="w-full px-4 py-3 bg-darkNavy/90 border border-amber-500/30 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    {/* 6. Profile Portrait */}
                    <div>
                      <label className="block text-xs font-mono text-gray-300 mb-1.5 uppercase tracking-wider font-semibold">
                        6. Profile Portrait
                      </label>
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 rounded-full overflow-hidden bg-darkNavy border-2 border-primary/30 flex items-center justify-center flex-shrink-0 relative">
                          {editImagePreview || editImage ? (
                            <img
                              src={editImagePreview || editImage}
                              alt="Preview"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <img
                              src="/assets/default-avatar.jpg"
                              alt="Default Avatar"
                              className="w-full h-full object-cover opacity-85"
                            />
                          )}
                          {isUploadingEditPhoto && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                              <RefreshCw className="w-5 h-5 text-accent animate-spin" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 space-y-2">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleEditPhotoUpload}
                            className="block w-full text-xs text-gray-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary/20 file:text-accent hover:file:bg-primary/30 cursor-pointer"
                          />
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-gray-400 font-mono">OR URL:</span>
                            <input
                              type="url"
                              value={editImage && editImage.startsWith("http") ? editImage : ""}
                              onChange={(e) => {
                                setEditImage(e.target.value);
                                setEditImagePreview(e.target.value);
                              }}
                              placeholder="Paste image link (https://...)"
                              className="flex-1 px-2.5 py-1 bg-darkNavy border border-primary/20 rounded-lg text-white text-[11px] focus:outline-none focus:border-accent"
                            />
                          </div>
                          <span className="text-[10px] text-gray-500 block">
                            {isUploadingEditPhoto ? (
                              <span className="text-accent flex items-center gap-1 font-mono">
                                <RefreshCw className="w-3 h-3 animate-spin" />
                                Uploading image...
                              </span>
                            ) : (
                              "Square image recommended. Stored cross-device."
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 7. Website Visibility Toggle */}
                    <div className="flex items-center justify-between p-4 rounded-xl bg-darkNavy/80 border border-primary/20">
                      <div className="space-y-0.5 pr-4">
                        <div className="flex items-center space-x-2">
                          <Eye className="w-4 h-4 text-cyan-400" />
                          <span className="text-xs font-mono text-white uppercase tracking-wider font-bold">
                            Feature on Website Team Section (/team)
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-400">
                          {editShowOnWebsite
                            ? "Published: This person appears publicly in the website Team section."
                            : "Hidden: This person is issued credentials & ID badge, but is not listed on /team."}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEditShowOnWebsite(!editShowOnWebsite)}
                        className={`w-12 h-6 rounded-full transition-colors relative p-0.5 flex-shrink-0 ${
                          editShowOnWebsite ? "bg-cyan-500" : "bg-gray-700"
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full bg-white transition-transform ${
                            editShowOnWebsite ? "translate-x-6" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>

                    {/* Buttons: Save Changes, Preview Badge, Delete */}
                    <div className="pt-2 flex flex-wrap items-center gap-3">
                      <button
                        type="submit"
                        disabled={isSavingEdit}
                        className="flex-1 btn-primary py-3.5 text-xs font-bold shadow-neon flex items-center justify-center space-x-2"
                      >
                        <Check className="w-4 h-4" />
                        <span>{isSavingEdit ? "Saving..." : "Save Member Changes"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const m = getCustomMembers().find(
                            (x) => x.id?.toUpperCase() === editSelectedId?.toUpperCase()
                          );
                          if (m) handleOpenCardModal(m);
                        }}
                        className="btn-secondary py-3.5 px-5 text-xs font-bold flex items-center space-x-1.5"
                        title="Preview & Issue ID Badge"
                      >
                        <QrCode className="w-4 h-4 text-accent" />
                        <span>ID Badge</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const m = getCustomMembers().find(
                            (x) => x.id?.toUpperCase() === editSelectedId?.toUpperCase()
                          );
                          if (m) handleDeleteMember(m);
                        }}
                        className="px-4 py-3.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold flex items-center space-x-1"
                        title="Delete this custom member"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </form>
                </div>

                {/* Live Preview Column (5 cols) */}
                <div className="lg:col-span-5 glass-card p-6 sm:p-7 rounded-3xl border border-primary/20 space-y-4 text-center">
                  <span className="text-xs font-mono uppercase tracking-widest text-accent font-bold block">
                    LIVE UPDATED CARD PREVIEW
                  </span>
                  <div className="relative rounded-2xl overflow-hidden border border-primary/30 bg-darkNavy shadow-2xl p-4 flex flex-col items-center">
                    <div
                      className="w-full max-w-[280px] rounded-xl overflow-hidden shadow-2xl border relative text-center p-5 space-y-4"
                      style={{
                        backgroundColor: "#0A1A36",
                        borderColor: TIER_CONFIG[editTier]?.color || "#00E5FF",
                      }}
                    >
                      {/* Category Ribbon Indicator */}
                      <div
                        className="text-[10px] font-mono font-bold uppercase tracking-widest py-1 px-3 rounded-full inline-block"
                        style={{
                          backgroundColor: `${TIER_CONFIG[editTier]?.color}20`,
                          color: TIER_CONFIG[editTier]?.color,
                          border: `1px solid ${TIER_CONFIG[editTier]?.color}40`,
                        }}
                      >
                        {TIER_CONFIG[editTier]?.badgeLabel}
                      </div>

                      {/* Avatar Circle */}
                      <div className="relative w-28 h-28 mx-auto">
                        <div
                          className="w-full h-full rounded-full overflow-hidden border-2 shadow-neon flex items-center justify-center bg-darkNavy/80"
                          style={{
                            borderColor: TIER_CONFIG[editTier]?.color || "#00E5FF",
                          }}
                        >
                          {editImagePreview ? (
                            <img
                              src={editImagePreview}
                              alt="Avatar Preview"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ImageIcon className="w-10 h-10 text-gray-500" />
                          )}
                        </div>
                      </div>

                      {/* Name & Role */}
                      <div className="space-y-1">
                        <h3 className="font-orbitron font-black text-white text-base truncate">
                          {editName || "DELEGATE NAME"}
                        </h3>
                        <p
                          className="font-bold text-xs uppercase tracking-wider"
                          style={{ color: TIER_CONFIG[editTier]?.color }}
                        >
                          {editRole || TIER_CONFIG[editTier]?.label}
                        </p>
                      </div>

                      {/* Dept & Group */}
                      <div className="pt-2 border-t border-white/10 space-y-1">
                        <span className="text-[11px] font-mono text-gray-300 block">
                          {editDept || "RVSCET Jamshedpur"}
                        </span>
                        {editTeamName && (
                          <span className="text-[11px] font-mono text-amber-300 block font-bold">
                            Team: {editTeamName}
                          </span>
                        )}
                        <span className="text-[10px] font-mono text-gray-400 block pt-1">
                          ID: {editSelectedId}
                        </span>
                      </div>

                      {/* Website status badge */}
                      <div className="pt-1">
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-full inline-block ${
                            editShowOnWebsite
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              : "bg-gray-500/20 text-gray-400 border border-gray-500/30"
                          }`}
                        >
                          {editShowOnWebsite ? "Will feature on /team" : "Hidden from /team"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================================================================== */}
        {/* TAB 3: BULK IMPORT MANY NAMES                                      */}
        {/* ================================================================== */}
        {activeTab === "bulk" && (
          <div className="glass-card p-6 sm:p-8 rounded-3xl border border-primary/30 space-y-6">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-accent font-bold">
                BATCH DELEGATE ENROLLMENT
              </span>
              <h2 className="text-2xl font-black font-orbitron text-white">
                Bulk Import Many Names
              </h2>
              <p className="text-gray-300 text-xs max-w-2xl">
                Paste lists of names or CSV lines to enroll dozens or hundreds of people in seconds. Unique IDs will be auto-generated for each delegate, and you can publish the whole batch to the public Website Team section with 1 click.
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
                  <option value="faculty">Faculty Coordinator (TX2-FC-)</option>
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
Amit Sharma, RoboWars Fighter, Dept. of ME, IronFist
Priya Singh, Line Follower, Dept. of ECE, CyberSquad`}
                className="w-full px-4 py-3 bg-darkNavy/90 border border-primary/20 rounded-xl text-white placeholder-gray-500 font-mono text-xs focus:outline-none focus:border-accent leading-relaxed"
              />
            </div>

            {/* Bulk Website Team Section Toggle */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-darkNavy/80 border border-primary/20">
              <div className="space-y-0.5 pr-4">
                <div className="flex items-center space-x-2">
                  <Eye className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-mono text-white uppercase tracking-wider font-bold">
                    Publish this Entire Batch to Website Team Section (/team)
                  </span>
                </div>
                <p className="text-[11px] text-gray-400">
                  {bulkShowOnWebsite
                    ? `Yes: All ${bulkParsedPreview.length} imported members will be published publicly on the website /team page.`
                    : "No: Members remain registered in the Admin database with official ID cards & verification links, but will not show on /team."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setBulkShowOnWebsite(!bulkShowOnWebsite)}
                className={`w-12 h-6 rounded-full transition-colors relative p-0.5 flex-shrink-0 ${
                  bulkShowOnWebsite ? "bg-cyan-500" : "bg-gray-700"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    bulkShowOnWebsite ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
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
                        <th className="py-2.5 px-3">Team / Group</th>
                        <th className="py-2.5 px-3 text-center">Team Page</th>
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
                          <td className="py-2 px-3 text-center">
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                bulkShowOnWebsite
                                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                  : "bg-gray-500/20 text-gray-400 border border-gray-500/30"
                              }`}
                            >
                              {bulkShowOnWebsite ? "Will Show" : "Hidden"}
                            </span>
                          </td>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Multi-Device Peer Sync */}
            <div className="glass-card p-6 sm:p-8 rounded-3xl border border-purple-500/40 space-y-5 bg-purple-500/[0.03]">
              <div className="space-y-1">
                <span className="text-xs font-mono uppercase tracking-widest text-purple-400 font-bold">
                  MULTI-DEVICE SYNC
                </span>
                <h3 className="text-xl font-bold font-orbitron text-white">
                  Sync with Phone / Tablet
                </h3>
                <p className="text-gray-300 text-xs">
                  Generate a quick sync QR code or 1-click URL to instantly clone all custom delegates onto another browser or mobile device.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeviceSyncModal(true)}
                  className="w-full btn-primary py-3 px-4 text-xs font-bold flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-600 to-indigo-600 border border-purple-400/40 shadow-neon"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Open Multi-Device Sync QR</span>
                </button>
              </div>
            </div>

            {/* Export Options */}
            <div className="glass-card p-6 sm:p-8 rounded-3xl border border-primary/30 space-y-5">
              <div className="space-y-1">
                <span className="text-xs font-mono uppercase tracking-widest text-accent font-bold">
                  DATA EXPORTS
                </span>
                <h3 className="text-xl font-bold font-orbitron text-white">
                  Export &amp; Download Rosters
                </h3>
                <p className="text-gray-300 text-xs">
                  Download spreadsheet records of delegates, active verification URLs, and backup datasets.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <button
                  onClick={handleExportCSV}
                  className="w-full btn-secondary py-3 px-4 text-xs font-bold flex items-center justify-between"
                >
                  <span className="flex items-center space-x-2">
                    <FileSpreadsheet className="w-4 h-4 text-accent" />
                    <span>Download Roster as CSV Spreadsheet</span>
                  </span>
                  <Download className="w-4 h-4 text-gray-400" />
                </button>

                <button
                  onClick={handleExportJSON}
                  className="w-full btn-secondary py-3 px-4 text-xs font-bold flex items-center justify-between"
                >
                  <span className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-purple-400" />
                    <span>Export Full JSON Database &amp; Visibility Backup</span>
                  </span>
                  <Download className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Restore / Reset Options */}
            <div className="glass-card p-6 sm:p-8 rounded-3xl border border-primary/30 space-y-5">
              <div className="space-y-1">
                <span className="text-xs font-mono uppercase tracking-widest text-accent font-bold">
                  DATABASE RESTORATION
                </span>
                <h3 className="text-xl font-bold font-orbitron text-white">
                  Restore or Reset
                </h3>
                <p className="text-gray-300 text-xs">
                  Upload a previously exported JSON backup file to instantly restore custom members, teams, and visibility configurations.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <label className="w-full btn-secondary py-3 px-4 text-xs font-bold flex items-center justify-between cursor-pointer">
                  <span className="flex items-center space-x-2">
                    <Upload className="w-4 h-4 text-emerald-400" />
                    <span>Upload &amp; Restore JSON Backup</span>
                  </span>
                  <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
                </label>

                <button
                  onClick={handleResetData}
                  className="w-full px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-300 hover:bg-red-500/20 text-xs font-mono font-bold flex items-center justify-between transition-all"
                >
                  <span className="flex items-center space-x-2">
                    <Trash2 className="w-4 h-4 text-red-400" />
                    <span>Clear All Custom Members</span>
                  </span>
                  <span className="text-[10px] text-red-400">Default Only</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================== */}
        {/* MODAL: MULTI-DEVICE ADMIN ROSTER SYNC (PORTAL IN BODY)       */}
        {/* ================================================================== */}
        {typeof document !== "undefined" &&
          createPortal(
            <AnimatePresence>
              {showDeviceSyncModal && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={(e) => {
                    if (e.target === e.currentTarget) {
                      setShowDeviceSyncModal(false);
                    }
                  }}
                  className="fixed inset-0 z-[99999] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
                >
                  {/* Floating Close Button */}
                  <button
                    type="button"
                    onClick={() => setShowDeviceSyncModal(false)}
                    className="fixed top-4 right-4 sm:top-6 sm:right-6 z-[100000] p-2.5 sm:p-3 rounded-2xl bg-darkNavy/95 hover:bg-rose-500 border border-purple-500/40 hover:border-rose-400 text-white shadow-2xl transition-all duration-200 flex items-center space-x-2 group cursor-pointer"
                    title="Close Sync Modal (Esc)"
                    aria-label="Close Sync Modal"
                  >
                    <X className="w-5 h-5 text-purple-400 group-hover:text-white transition-colors" />
                    <span className="text-xs font-mono font-bold hidden sm:inline text-gray-200 group-hover:text-white">
                      Close (Esc)
                    </span>
                  </button>

                  <motion.div
                    initial={{ scale: 0.92, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.92, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    className="glass-card max-w-lg w-full p-6 sm:p-8 rounded-3xl border border-purple-500/40 space-y-6 shadow-[0_0_50px_rgba(168,85,247,0.2)] relative my-auto max-h-[92vh] overflow-y-auto"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 border-b border-purple-500/20 pb-4">
                      <div className="space-y-1">
                        <span className="text-xs font-mono uppercase tracking-widest text-purple-400 font-bold block">
                          MULTI-DEVICE ROSTER SYNC
                        </span>
                        <h3 className="text-xl sm:text-2xl font-black font-orbitron text-white">
                          Sync with Mobile / Scanner
                        </h3>
                        <p className="text-xs text-gray-300">
                          Instantly transfer all enrolled custom members across devices with zero setup.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowDeviceSyncModal(false)}
                        className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/20 border border-white/10 hover:border-rose-500/40 text-gray-400 hover:text-white transition-all"
                      >
                        <X className="w-5 h-5 text-gray-300 hover:text-rose-400" />
                      </button>
                    </div>

                    {/* QR Code Container */}
                    <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-darkNavy/90 border border-purple-500/30 space-y-3">
                      {deviceSyncQrUrl ? (
                        <div className="p-3 bg-white rounded-2xl shadow-2xl">
                          <img
                            src={deviceSyncQrUrl}
                            alt="Sync QR Code"
                            className="w-56 h-56 object-contain"
                          />
                        </div>
                      ) : (
                        <div className="w-56 h-56 flex items-center justify-center text-xs font-mono text-purple-300">
                          <RefreshCw className="w-6 h-6 animate-spin" />
                        </div>
                      )}
                      <p className="text-xs text-center font-mono text-gray-300 max-w-xs">
                        Scan this QR code using your phone or tablet camera to open the admin portal and instantly load the entire roster!
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3">
                      <button
                        type="button"
                        onClick={() => {
                          if (deviceSyncShareUrl && navigator.clipboard) {
                            navigator.clipboard.writeText(deviceSyncShareUrl);
                            setIsCopiedSyncLink(true);
                            setTimeout(() => setIsCopiedSyncLink(false), 3000);
                          }
                        }}
                        className="w-full btn-primary py-3 px-4 text-xs font-bold flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-600 to-indigo-600 border border-purple-400/40 shadow-neon"
                      >
                        {isCopiedSyncLink ? (
                          <>
                            <Check className="w-4 h-4 text-emerald-300" />
                            <span>1-Click Sync Link Copied to Clipboard!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            <span>Copy 1-Click Sync Link (Share via WhatsApp)</span>
                          </>
                        )}
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleExportJSON}
                          className="flex-1 btn-secondary py-2.5 px-3 text-xs font-bold flex items-center justify-center space-x-1.5"
                        >
                          <Download className="w-3.5 h-3.5 text-accent" />
                          <span>Download Backup</span>
                        </button>

                        <label className="flex-1 btn-secondary py-2.5 px-3 text-xs font-bold flex items-center justify-center space-x-1.5 cursor-pointer">
                          <Upload className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Import Backup</span>
                          <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
                        </label>
                      </div>
                    </div>

                    {/* Cloud Sync Permanent Setup Tip */}
                    <div className="p-3.5 rounded-2xl bg-primary/10 border border-primary/20 text-[11px] text-gray-300 space-y-1.5">
                      <div className="flex items-center space-x-1.5 text-accent font-bold">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Optional: 100% Automated Background Cloud Sync</span>
                      </div>
                      <p className="leading-relaxed">
                        To enable hands-free automatic cloud synchronization across all devices without needing to scan QR codes, add <code className="text-cyan-300 bg-white/5 px-1 py-0.5 rounded">UPSTASH_REDIS_REST_URL</code> and <code className="text-cyan-300 bg-white/5 px-1 py-0.5 rounded">UPSTASH_REDIS_REST_TOKEN</code> to your Vercel Project Settings &gt; Environment Variables.
                      </p>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>,
            document.body
          )}

        {/* ================================================================== */}
        {/* MODAL: ID BADGE PREVIEW & DOWNLOAD (RENDERED VIA PORTAL IN BODY)   */}
        {/* ================================================================== */}
        {typeof document !== "undefined" &&
          createPortal(
            <AnimatePresence>
              {selectedMemberForCard && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={(e) => {
                    if (e.target === e.currentTarget) {
                      setSelectedMemberForCard(null);
                      setGeneratedCardData(null);
                    }
                  }}
                  className="fixed inset-0 z-[99999] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
                >
                  {/* Floating Top-Right Close Button (Always visible on any screen) */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedMemberForCard(null);
                      setGeneratedCardData(null);
                    }}
                    className="fixed top-4 right-4 sm:top-6 sm:right-6 z-[100000] p-2.5 sm:p-3 rounded-2xl bg-darkNavy/95 hover:bg-rose-500 border border-primary/40 hover:border-rose-400 text-white shadow-2xl transition-all duration-200 flex items-center space-x-2 group cursor-pointer"
                    title="Close Badge Preview (Esc)"
                    aria-label="Close Badge Preview"
                  >
                    <X className="w-5 h-5 text-accent group-hover:text-white transition-colors" />
                    <span className="text-xs font-mono font-bold hidden sm:inline text-gray-200 group-hover:text-white">
                      Close (Esc)
                    </span>
                  </button>

                  <motion.div
                    initial={{ scale: 0.92, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.92, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    className="glass-card max-w-xl w-full p-5 sm:p-7 rounded-3xl border border-primary/40 space-y-5 shadow-2xl relative my-auto max-h-[92vh] overflow-y-auto"
                  >
                    {/* Header Row with Close Button */}
                    <div className="flex items-start justify-between gap-3 border-b border-primary/20 pb-4">
                      <div className="space-y-1 min-w-0 flex-1">
                        <span className="text-xs font-mono uppercase tracking-widest text-accent font-bold block">
                          OFFICIAL 2026 BADGE
                        </span>
                        <h3 className="text-xl sm:text-2xl font-black font-orbitron text-white truncate">
                          {selectedMemberForCard.name}
                        </h3>
                        <p className="text-xs text-gray-400 font-mono flex flex-wrap items-center gap-2">
                          <span>
                            ID: {selectedMemberForCard.id} &bull; Tier:{" "}
                            {selectedMemberForCard.category || selectedMemberForCard.tier}
                          </span>
                          {(() => {
                            const tKey = normalizeTierKey(
                              selectedMemberForCard.tierKey ||
                                selectedMemberForCard.tier ||
                                selectedMemberForCard.category,
                              selectedMemberForCard.id
                            );
                            const isFull =
                              tKey === "faculty" || tKey === "executive" || tKey === "core";
                            return isFull ? (
                              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/40">
                                ALL ARENAS &amp; ADMIN CONTROL
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/40">
                                LIMITED ACCESS
                              </span>
                            );
                          })()}
                        </p>
                      </div>

                      {/* Header Close Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedMemberForCard(null);
                          setGeneratedCardData(null);
                        }}
                        className="p-2 sm:p-2.5 rounded-xl bg-white/5 hover:bg-rose-500/20 border border-white/10 hover:border-rose-500/40 text-gray-400 hover:text-white transition-all flex items-center justify-center flex-shrink-0"
                        title="Close Badge Preview"
                        aria-label="Close"
                      >
                        <X className="w-5 h-5 text-gray-300 hover:text-rose-400" />
                      </button>
                    </div>

                    {/* Card Canvas / Image Render */}
                    <div className="relative rounded-2xl overflow-hidden border border-primary/30 bg-darkNavy flex items-center justify-center min-h-[300px] p-3">
                      {generatingCard ? (
                        <div className="text-center space-y-3 py-12">
                          <RefreshCw className="w-8 h-8 text-accent animate-spin mx-auto" />
                          <p className="text-xs font-mono text-gray-300">
                            Generating High-Definition ID Badge (1224x1806)...
                          </p>
                        </div>
                      ) : generatedCardData?.hdDataUrl ? (
                        <img
                          src={generatedCardData.hdDataUrl}
                          alt={selectedMemberForCard.name}
                          className="max-h-[min(460px,50vh)] w-auto rounded-xl shadow-2xl object-contain"
                        />
                      ) : (
                        <div className="text-center text-red-400 text-xs font-mono py-12">
                          Failed to render badge. Please try again.
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-2.5">
                      <button
                        disabled={!generatedCardData?.hdDataUrl}
                        onClick={() => {
                          if (generatedCardData?.hdDataUrl) {
                            downloadDataUrl(
                              generatedCardData.hdDataUrl,
                              `${selectedMemberForCard.id}_badge_hd.jpg`
                            );
                          }
                        }}
                        className="flex-1 btn-primary py-3 text-xs font-bold shadow-neon flex items-center justify-center space-x-2 min-w-[180px]"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download Print HD</span>
                      </button>

                      <button
                        disabled={!generatedCardData?.qrDataUrl}
                        onClick={() => {
                          if (generatedCardData?.qrDataUrl) {
                            downloadDataUrl(
                              generatedCardData.qrDataUrl,
                              `${selectedMemberForCard.id}_qr.png`
                            );
                          }
                        }}
                        className="btn-secondary py-3 px-3.5 text-xs font-bold flex items-center space-x-1.5"
                        title="Download QR code PNG"
                      >
                        <QrCode className="w-4 h-4 text-accent" />
                        <span>QR Only</span>
                      </button>

                      <Link
                        to={`/verify/${selectedMemberForCard.id}`}
                        target="_blank"
                        className="btn-secondary py-3 px-3.5 text-xs font-bold flex items-center space-x-1.5"
                        title="Open verification page in new tab"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>Verify</span>
                      </Link>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedMemberForCard(null);
                          setGeneratedCardData(null);
                        }}
                        className="btn-secondary py-3 px-3.5 text-xs font-bold flex items-center space-x-1.5 text-gray-300 hover:text-white hover:border-rose-500/40"
                        title="Close preview"
                      >
                        <X className="w-4 h-4 text-rose-400" />
                        <span>Close</span>
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>,
            document.body
          )}
      </div>
    </div>
  );
}
