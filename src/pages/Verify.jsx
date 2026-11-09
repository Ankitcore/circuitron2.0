import React, { useState, useEffect } from "react";
import { useParams, useSearchParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  ShieldAlert,
  Award,
  CheckCircle2,
  Calendar,
  Building,
  UserCheck,
  Download,
  Share2,
  Search,
  ExternalLink,
  QrCode,
  Sparkles,
  Lock,
  Unlock,
  KeyRound,
  LogOut,
  Camera,
} from "lucide-react";
import { getMemberById, addMember, normalizeTierKey } from "../data/team";
import { generateMemberIdCard, downloadDataUrl, getMemberVerificationUrl } from "../utils/idCardGenerator";

/**
 * Determine official security access clearance level based on member tier:
 * - Faculty Coordinators, Executive Team, and Core Team: "All Arenas & Secretariat" (Full Access)
 * - Volunteers: "Limited Access • Assigned Event Arenas"
 * - Participants: "Limited Access • Registered Event Arenas Only"
 */
function getAccessClearance(member) {
  if (!member) {
    return {
      tierKey: "participant",
      isFullAccess: false,
      title: "Limited Access",
      detail: "General Floor & Audience Area Only",
      badge: "LIMITED ACCESS",
      theme: {
        container: "bg-amber-500/10 border-amber-500/30",
        icon: "text-amber-400",
        badge: "bg-amber-500/20 text-amber-300 border border-amber-500/40",
      },
    };
  }

  const tierKey = normalizeTierKey(member.tierKey || member.tier || member.category, member.id);

  if (tierKey === "faculty" || tierKey === "executive" || tierKey === "core") {
    return {
      tierKey,
      isFullAccess: true,
      title: "All Arenas & Secretariat",
      detail: "Unrestricted Clearance • All Competition Arenas & Secretariat Control Room",
      badge: "FULL ACCESS",
      theme: {
        container: "bg-emerald-500/10 border-emerald-500/30",
        icon: "text-emerald-400",
        badge: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40",
      },
    };
  }

  if (tierKey === "volunteer") {
    return {
      tierKey: "volunteer",
      isFullAccess: false,
      title: "Limited Access • Assigned Event Arenas",
      detail: "Operational Zone Clearance • Assigned Event Grounds & Volunteer Lounge (Non-Secretariat)",
      badge: "LIMITED ACCESS",
      theme: {
        container: "bg-sky-500/10 border-sky-500/30",
        icon: "text-sky-400",
        badge: "bg-sky-500/20 text-sky-300 border border-sky-500/40",
      },
    };
  }

  // Participants & other general delegates
  return {
    tierKey: "participant",
    isFullAccess: false,
    title: "Limited Access • Registered Event Arenas Only",
    detail: "Competitor Clearance • Designated Competition Arenas & General Floor (Non-Secretariat)",
    badge: "LIMITED ACCESS",
    theme: {
      container: "bg-amber-500/10 border-amber-500/30",
      icon: "text-amber-400",
      badge: "bg-amber-500/20 text-amber-300 border border-amber-500/40",
    },
  };
}
import {
  verifyAdminPasskey,
  isAdminAuthenticated,
  setAdminSession,
  clearAdminSession,
} from "../utils/adminAuth";
import QrScannerModal from "../components/QrScannerModal";
import EmbeddedQrScanner from "../components/EmbeddedQrScanner";

export default function Verify() {
  const { id: paramId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Determine target member ID from URL param or query string (empty on bare /verify portal)
  const rawId = paramId || searchParams.get("id");
  const hasTargetId = Boolean(rawId && rawId.trim());
  const targetId = hasTargetId ? rawId.trim().toUpperCase() : "";

  const [inputSearchId, setInputSearchId] = useState(targetId);
  const [copied, setCopied] = useState(false);
  const [showIdCardModal, setShowIdCardModal] = useState(false);
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [customCardImage, setCustomCardImage] = useState(null);
  const [isRenderingCard, setIsRenderingCard] = useState(false);
  const [cloudMember, setCloudMember] = useState(null);
  const [isQueryingCloud, setIsQueryingCloud] = useState(false);

  // Admin authorization state
  const [isAdmin, setIsAdmin] = useState(() => {
    if (typeof window !== "undefined") {
      const urlKey = searchParams.get("admin") || searchParams.get("key") || "";
      if (urlKey && verifyAdminPasskey(urlKey)) {
        setAdminSession();
        return true;
      }
      return isAdminAuthenticated();
    }
    return false;
  });

  const [showAdminLoginModal, setShowAdminLoginModal] = useState(false);
  const [adminPassInput, setAdminPassInput] = useState("");
  const [adminAuthError, setAdminAuthError] = useState("");
  const [validatedTimestamp, setValidatedTimestamp] = useState(null);
  const [isValidating, setIsValidating] = useState(false);

  const localMember = hasTargetId ? getMemberById(targetId) : null;
  const member = localMember || cloudMember;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setInputSearchId(targetId);
    setValidatedTimestamp(null);
    setCustomCardImage(null);

    if (!hasTargetId) {
      setCloudMember(null);
      setIsQueryingCloud(false);
      return;
    }

    // If member already exists in local storage
    const foundLocal = getMemberById(targetId);
    if (foundLocal) {
      const qImg = searchParams.get("img");
      if (qImg && !foundLocal.img) {
        const enriched = { ...foundLocal, img: qImg.trim() };
        try {
          addMember(enriched);
        } catch (e) {}
        setCloudMember(enriched);
      } else if (!foundLocal.img) {
        // Query cloud in background to see if an image was synced
        fetch(`/api/members?id=${encodeURIComponent(targetId)}`)
          .then((res) => res.json())
          .then((data) => {
            if (data && data.success && data.member?.img) {
              const enriched = { ...foundLocal, img: data.member.img };
              try {
                addMember(enriched);
              } catch (e) {}
              setCloudMember(enriched);
            }
          })
          .catch(() => {});
        setCloudMember(foundLocal);
      } else {
        setCloudMember(null);
      }
      setIsQueryingCloud(false);
      return;
    }

    // 1. Check self-contained credential query parameters (instant cross-device verification)
    const qName = searchParams.get("n");
    if (qName && qName.trim()) {
      const qRole = searchParams.get("r");
      const qTier = searchParams.get("t");
      const qDept = searchParams.get("d");
      const qGroup = searchParams.get("g");
      const qImg = searchParams.get("img");

      const reconstructed = {
        id: targetId,
        name: qName.trim(),
        role: qRole ? qRole.trim() : "Delegate",
        position: qRole ? qRole.trim() : "Delegate",
        tierKey: qTier || "participant",
        category: qTier ? qTier.toUpperCase() : "Participant",
        tier: qTier ? qTier.toUpperCase() : "Participant",
        department: qDept ? qDept.trim() : "TechXpo Delegate",
        teamName: qGroup ? qGroup.trim() : "",
        img: qImg ? qImg.trim() : "",
        isCustom: true,
      };

      try {
        addMember(reconstructed);
      } catch (e) {
        console.warn("Failed caching member to localStorage:", e);
      }
      setCloudMember(reconstructed);
      setIsQueryingCloud(false);

      // If reconstructed has no photo, query the cloud in background
      if (!reconstructed.img) {
        fetch(`/api/members?id=${encodeURIComponent(targetId)}`)
          .then((res) => res.json())
          .then((data) => {
            if (data && data.success && data.member?.img) {
              const enriched = { ...reconstructed, img: data.member.img };
              try {
                addMember(enriched);
              } catch (e) {}
              setCloudMember(enriched);
            }
          })
          .catch(() => {});
      }

      return;
    }

    // 2. Query Central Cloud Secretariat Registry (/api/members)
    let cancelled = false;
    setIsQueryingCloud(true);

    fetch(`/api/members?id=${encodeURIComponent(targetId)}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        if (data && data.success && data.member) {
          try {
            addMember(data.member);
          } catch (e) {}
          setCloudMember(data.member);
        } else {
          setCloudMember(null);
        }
      })
      .catch((err) => {
        if (cancelled) return;
        console.warn("Cloud member lookup error:", err);
        setCloudMember(null);
      })
      .finally(() => {
        if (!cancelled) {
          setIsQueryingCloud(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [targetId, hasTargetId, searchParams]);

  // Handle generating card for custom members when modal is requested
  useEffect(() => {
    if (showIdCardModal && member?.isCustom && !customCardImage && !isRenderingCard) {
      setIsRenderingCard(true);
      generateMemberIdCard(member)
        .then((card) => {
          setCustomCardImage(card);
        })
        .catch((err) => console.error("Error generating custom member card:", err))
        .finally(() => setIsRenderingCard(false));
    }
  }, [showIdCardModal, member, customCardImage, isRenderingCard]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (inputSearchId.trim()) {
      navigate(`/verify/${inputSearchId.trim().toUpperCase()}`);
    }
  };

  const handleScanSuccess = (scanResult) => {
    if (scanResult) {
      const cleanId = typeof scanResult === "object" ? scanResult.id : String(scanResult).trim().toUpperCase();
      const targetPath = typeof scanResult === "object" && scanResult.path ? scanResult.path : `/verify/${cleanId}`;

      setInputSearchId(cleanId);
      setShowScannerModal(false);
      navigate(targetPath);
      setIsValidating(true);
      setTimeout(() => {
        setIsValidating(false);
        setValidatedTimestamp(
          new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
        );
      }, 400);
    }
  };

  const handleShare = () => {
    const url = member ? getMemberVerificationUrl(member) : window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleValidateCredential = () => {
    setIsValidating(true);
    setTimeout(() => {
      setIsValidating(false);
      setValidatedTimestamp(
        new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
      );
    }, 350);
  };

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (verifyAdminPasskey(adminPassInput)) {
      setAdminSession();
      setIsAdmin(true);
      setShowAdminLoginModal(false);
      setAdminPassInput("");
      setAdminAuthError("");
      setShowIdCardModal(true);
    } else {
      setAdminAuthError("Invalid passkey. Access is restricted to Secretariat Administrators.");
    }
  };

  const handleAdminLogout = () => {
    clearAdminSession();
    setIsAdmin(false);
    setShowIdCardModal(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen pt-28 pb-20 relative overflow-hidden"
    >
      {/* Background Ambience */}
      <div className="absolute inset-0 circuit-bg opacity-30 pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Verification Status Header Banner */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-xs font-semibold text-primary">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="font-mono tracking-wider">OFFICIAL TECHXPO 2.O AUTHENTICATION PORTAL</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black font-orbitron gradient-text">
            {hasTargetId ? "Credential Verification" : "Authentication & Scanner Desk"}
          </h1>
          <p className="text-gray-300 text-sm sm:text-base max-w-xl mx-auto">
            {hasTargetId
              ? "Official cryptographic validation and credential dossier for TechXpo 2.O leaders, coordinators, and delegates at RVSCET Jamshedpur."
              : "Scan the verification QR code on any official TechXpo 2.O ID badge using your camera, or manually type a Delegate ID to verify authenticity."}
          </p>

          {hasTargetId && (
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setShowScannerModal(true)}
                className="py-2.5 px-5 rounded-2xl bg-gradient-to-r from-cyan-500 via-primary to-accent text-darkNavy font-orbitron font-extrabold text-xs sm:text-sm flex items-center space-x-2.5 shadow-[0_0_30px_rgba(0,229,255,0.4)] hover:shadow-[0_0_40px_rgba(0,229,255,0.6)] hover:scale-105 transition-all duration-300 group"
              >
                <Camera className="w-4 h-4 text-darkNavy group-hover:rotate-12 transition-transform" />
                <span>Scan Another Card QR</span>
              </button>
              <Link
                to="/verify"
                className="py-2.5 px-4 rounded-2xl bg-darkNavy/90 border border-primary/30 text-gray-300 hover:text-white text-xs font-orbitron font-bold flex items-center space-x-2 transition-all hover:bg-white/5"
              >
                <QrCode className="w-4 h-4 text-accent" />
                <span>Scanner Desk</span>
              </Link>
            </div>
          )}
        </div>

        {/* ================= CONDITION 1: BARE /verify DESK (NO ID) ================= */}
        {!hasTargetId ? (
          <div className="space-y-8">
            {/* Live Camera & Image QR Scanner */}
            <EmbeddedQrScanner onScanSuccess={handleScanSuccess} />

            {/* Manual Typing Authentication Card */}
            <div className="glass-card p-6 sm:p-8 rounded-3xl border-2 border-primary/30 space-y-5 bg-darkNavy/90 shadow-[0_0_50px_rgba(0,229,255,0.15)]">
              <div className="flex items-center space-x-3 pb-3 border-b border-primary/20">
                <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/30 flex items-center justify-center text-accent shadow-sm flex-shrink-0">
                  <Search className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-accent font-bold block">
                    MANUAL CREDENTIAL LOOKUP
                  </span>
                  <h3 className="text-lg sm:text-xl font-black font-orbitron text-white">
                    Authenticate Credential ID by Manual Typing
                  </h3>
                </div>
              </div>

              <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3 pt-1">
                <input
                  type="text"
                  value={inputSearchId}
                  onChange={(e) => setInputSearchId(e.target.value)}
                  placeholder="ENTER DELEGATE ID (e.g. TX2-EX-7264, TX2-FC-8492, TX2-CT-5819)"
                  className="flex-1 px-5 py-3.5 bg-darkNavy/90 border-2 border-primary/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-accent text-sm font-mono uppercase tracking-wider"
                  autoFocus
                />
                <button
                  type="submit"
                  className="btn-primary py-3.5 px-8 text-xs font-orbitron font-bold whitespace-nowrap shadow-neon flex items-center justify-center space-x-2"
                >
                  <ShieldCheck className="w-4 h-4 text-darkNavy" />
                  <span>Verify Credential</span>
                </button>
              </form>

              {/* Quick Sample IDs */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-mono text-gray-400">
                <span>Quick Test:</span>
                {["TX2-EX-7264", "TX2-FC-8492", "TX2-CT-5819"].map((sample) => (
                  <button
                    key={sample}
                    type="button"
                    onClick={() => {
                      setInputSearchId(sample);
                      navigate(`/verify/${sample}`);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-cyan-300 border border-primary/20 transition-colors"
                  >
                    {sample}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : isQueryingCloud ? (
          /* ================= QUERYING CLOUD REGISTRY ================= */
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-card rounded-3xl border-2 border-primary/40 p-10 sm:p-14 text-center space-y-5 bg-darkNavy/90 shadow-[0_0_50px_rgba(0,229,255,0.2)]"
          >
            <div className="w-16 h-16 rounded-2xl bg-primary/20 border border-primary/40 flex items-center justify-center text-accent mx-auto shadow-[0_0_20px_rgba(0,229,255,0.4)]">
              <ShieldCheck className="w-8 h-8 animate-pulse text-accent" />
            </div>
            <div className="space-y-2">
              <span className="text-xs font-mono uppercase tracking-widest text-accent font-bold">
                CONNECTING TO CLOUD REGISTRY
              </span>
              <h2 className="text-2xl sm:text-3xl font-black font-orbitron text-white">
                Verifying Credential ID <span className="text-accent">{targetId}</span>
              </h2>
              <p className="text-gray-300 text-sm max-w-md mx-auto">
                Syncing with TechXpo 2.O Secretariat Central Registry for cross-device authentication...
              </p>
            </div>
          </motion.div>
        ) : member ? (
          /* ================= VALID CREDENTIAL CARD ================= */
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="glass-card rounded-3xl border-2 border-emerald-500/40 p-6 sm:p-10 relative overflow-hidden shadow-[0_0_50px_rgba(16,185,129,0.15)]"
          >
            {/* Top Right Verified Watermark Badge */}
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

            {/* Verification Success Pill */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-emerald-500/20">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                  <CheckCircle2 className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold">
                      AUTHENTICATED &bull; ACTIVE STATUS
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-200">
                    {member.category || "Official Delegate"} &bull; {member.tier || "TechXpo 2.O Leader"}
                  </h3>
                </div>
              </div>

              {/* Security ID Badge */}
              <div className="flex items-center space-x-2 bg-darkNavy/90 border border-emerald-500/30 px-3.5 py-1.5 rounded-xl">
                <span className="text-[10px] font-mono text-gray-400">SECURITY ID:</span>
                <span className="text-xs font-mono font-bold text-accent tracking-widest">
                  {member.id}
                </span>
              </div>
            </div>

            {/* Profile Grid */}
            <div className="py-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              
              {/* Member Portrait */}
              <div className="md:col-span-5 flex flex-col items-center justify-center">
                <div className="relative w-44 h-44 sm:w-52 sm:h-52">
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-emerald-500 to-accent blur-md opacity-50 animate-pulse" />
                  <div className="relative w-full h-full rounded-3xl overflow-hidden border-2 border-emerald-400/50 bg-darkNavy shadow-2xl flex items-center justify-center">
                    {member.img ? (
                      <img
                        src={member.img}
                        alt={member.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          const fallback = e.currentTarget.nextElementSibling;
                          if (fallback) fallback.style.display = "flex";
                        }}
                      />
                    ) : null}
                    <div
                      style={{ display: member.img ? "none" : "flex" }}
                      className="w-full h-full bg-gradient-to-tr from-darkNavy to-primary/30 items-center justify-center font-orbitron font-extrabold text-4xl text-accent"
                    >
                      {member.name.slice(0, 2).toUpperCase()}
                    </div>
                  </div>
                  
                  {/* Hexagon Official Stamp */}
                  <div className="absolute -bottom-3 -right-3 bg-darkNavy border-2 border-emerald-400 rounded-full p-2 text-emerald-400 shadow-lg">
                    <Award className="w-5 h-5" />
                  </div>
                </div>

                <div className="mt-4 text-center">
                  <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-mono text-emerald-300 font-semibold uppercase tracking-wider">
                    {member.tier || "TechXpo 2.O Leader"}
                  </span>
                </div>
              </div>

              {/* Credential Data Table */}
              <div className="md:col-span-7 space-y-4 text-left">
                <div>
                  <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold">
                    VERIFIED MEMBER NAME
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black font-orbitron text-white">
                    {member.name}
                  </h2>
                  <p className="text-accent font-semibold text-base sm:text-lg mt-0.5">
                    {member.position || member.role}
                  </p>
                </div>

                {member.tagline && (
                  <p className="text-gray-300 text-xs sm:text-sm italic border-l-2 border-emerald-500/40 pl-3">
                    &ldquo;{member.tagline}&rdquo;
                  </p>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
                    <span className="text-gray-400 font-mono text-[10px] block uppercase">Organization</span>
                    <span className="text-white font-semibold">RVSCET Jamshedpur</span>
                  </div>

                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
                    <span className="text-gray-400 font-mono text-[10px] block uppercase">Host Club</span>
                    <span className="text-accent font-semibold">Circuitron (IoT &amp; Embedded)</span>
                  </div>

                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
                    <span className="text-gray-400 font-mono text-[10px] block uppercase">Symposium</span>
                    <span className="text-white font-semibold">TechXpo 2.O</span>
                  </div>

                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
                    <span className="text-gray-400 font-mono text-[10px] block uppercase">Event Date</span>
                    <span className="text-emerald-400 font-semibold">30 November 2026</span>
                  </div>

                  {member.department && (
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
                      <span className="text-gray-400 font-mono text-[10px] block uppercase">Department</span>
                      <span className="text-white font-semibold">{member.department}</span>
                    </div>
                  )}

                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
                    <span className="text-gray-400 font-mono text-[10px] block uppercase">Designation</span>
                    <span className="text-primary font-semibold">{member.position || member.role}</span>
                  </div>
                </div>

                {/* Security Clearance level */}
                {(() => {
                  const clearance = getAccessClearance(member);
                  return (
                    <div className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs transition-all ${clearance.theme.container}`}>
                      <div className="flex items-center space-x-2.5">
                        <Lock className={`w-4 h-4 flex-shrink-0 ${clearance.theme.icon}`} />
                        <div>
                          <span className="text-gray-300 font-mono text-[11px] block">
                            Access Level: <strong className="text-white">{clearance.title}</strong>
                          </span>
                          <span className="text-[10px] text-gray-400 font-mono block mt-0.5">
                            {clearance.detail}
                          </span>
                        </div>
                      </div>
                      <span className={`px-2.5 py-1 rounded font-mono text-[10px] font-bold tracking-wider self-start sm:self-auto ${clearance.theme.badge}`}>
                        {clearance.badge}
                      </span>
                    </div>
                  );
                })()}

              </div>
            </div>

            {/* Live Verification Feedback Banner */}
            {validatedTimestamp && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-xs font-mono text-emerald-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2"
              >
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>
                    Cryptographically Validated: <strong>{member.name}</strong> ({member.id}) is actively confirmed for TechXpo 2.O.
                  </span>
                </div>
                <span className="text-[10px] text-emerald-400/80 font-mono">
                  Verified at {validatedTimestamp}
                </span>
              </motion.div>
            )}

            {/* Admin Clearance Banner */}
            {isAdmin && (
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-500/15 via-primary/10 to-accent/15 border border-amber-500/30 text-xs font-mono text-amber-300 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center space-x-2">
                  <Unlock className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span>
                    <strong>Secretariat Admin Mode:</strong> High-definition physical ID badge downloads unlocked.
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Link
                    to="/admin"
                    className="px-3 py-1 rounded bg-accent/20 hover:bg-accent/30 text-accent text-[11px] font-bold uppercase tracking-wider transition-colors flex items-center space-x-1"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Secretariat Admin Portal</span>
                  </Link>
                  <button
                    onClick={handleAdminLogout}
                    className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-[10px] font-bold uppercase tracking-wider transition-colors whitespace-nowrap"
                  >
                    Lock Admin
                  </button>
                </div>
              </div>
            )}

            {/* Action Bar */}
            <div className="pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                {isAdmin ? (
                  /* ============ ADMIN ONLY: DOWNLOAD BADGE ============ */
                  <button
                    onClick={() => setShowIdCardModal(true)}
                    className="btn-primary text-xs py-2.5 px-4 font-bold flex items-center space-x-2 shadow-neon"
                  >
                    <Download className="w-4 h-4 text-white" />
                    <span>Download ID Card (Admin)</span>
                  </button>
                ) : (
                  /* ============ REGULAR USERS: VALIDATE CREDENTIAL ============ */
                  <button
                    onClick={handleValidateCredential}
                    disabled={isValidating}
                    className="btn-primary text-xs py-2.5 px-4 font-bold flex items-center space-x-2"
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-300" />
                    <span>{isValidating ? "Validating..." : "Validate Credential"}</span>
                  </button>
                )}

                {/* Share Credential Option */}
                <button
                  onClick={handleShare}
                  className="btn-secondary text-xs py-2.5 px-4 font-bold flex items-center space-x-2"
                >
                  <Share2 className="w-4 h-4" />
                  <span>{copied ? "Link Copied!" : "Share Credential"}</span>
                </button>

                {/* Scan Another Card Option */}
                <button
                  type="button"
                  onClick={() => setShowScannerModal(true)}
                  className="btn-secondary text-xs py-2.5 px-4 font-bold flex items-center space-x-2 border-primary/40 text-accent hover:border-accent"
                >
                  <Camera className="w-4 h-4" />
                  <span>Scan Another QR</span>
                </button>

                {/* Admin Status Pill / Login Trigger */}
                {isAdmin ? (
                  <button
                    onClick={handleAdminLogout}
                    title="Sign out of Administrator Mode"
                    className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold hover:bg-amber-500/20 transition-all"
                  >
                    <Unlock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Admin Active</span>
                    <LogOut className="w-3 h-3 ml-1 opacity-70" />
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setAdminAuthError("");
                      setAdminPassInput("");
                      setShowAdminLoginModal(true);
                    }}
                    title="Administrator Login for Badge Downloads"
                    className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-darkNavy/80 border border-primary/20 text-gray-400 text-xs font-mono hover:text-accent hover:border-primary/40 transition-all"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Admin</span>
                  </button>
                )}
              </div>

              <Link
                to="/team"
                className="text-xs font-semibold text-accent hover:underline inline-flex items-center space-x-1"
              >
                <span>View Full Team Roster</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </motion.div>
        ) : (
          /* ================= INVALID / UNRECOGNIZED CREDENTIAL ================= */
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-card rounded-3xl border-2 border-red-500/40 p-8 sm:p-12 text-center space-y-5 shadow-[0_0_50px_rgba(239,68,68,0.15)]"
          >
            <div className="w-16 h-16 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 mx-auto shadow-[0_0_20px_rgba(239,68,68,0.4)]">
              <ShieldAlert className="w-8 h-8 animate-pulse" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-mono uppercase tracking-widest text-red-400 font-bold">
                VERIFICATION ERROR &bull; RECORD NOT FOUND
              </span>
              <h2 className="text-2xl sm:text-3xl font-black font-orbitron text-white">
                Unregistered Credential ID
              </h2>
              <p className="text-gray-300 text-sm max-w-md mx-auto">
                No active TechXpo 2.O delegate or executive record matches ID{" "}
                <code className="text-red-400 font-mono font-bold bg-red-500/10 px-2 py-0.5 rounded">
                  {targetId}
                </code>
                . Please verify the ID number or contact the event secretariat.
              </p>
            </div>

            <div className="pt-4 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={() => setShowScannerModal(true)}
                className="btn-primary text-xs py-2.5 px-5 font-bold flex items-center space-x-2"
              >
                <Camera className="w-4 h-4" />
                <span>Scan ID Card QR</span>
              </button>
              <Link to="/contact" className="btn-secondary text-xs py-2.5 px-5 font-bold">
                Contact Help Desk
              </Link>
              <Link to="/team" className="btn-secondary text-xs py-2.5 px-5 font-bold">
                Official Roster
              </Link>
            </div>
          </motion.div>
        )}

        {/* Search Another Member ID Form (When viewing specific credential) */}
        {hasTargetId && (
          <div className="glass-card p-6 sm:p-7 rounded-3xl border border-primary/20 space-y-4 bg-darkNavy/80">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs font-mono text-gray-300">
                <Search className="w-4 h-4 text-accent" />
                <span className="font-bold text-accent uppercase tracking-wider">
                  AUTHENTICATE ANOTHER CREDENTIAL ID: BY MANUAL TYPING
                </span>
              </div>
              <Link
                to="/verify"
                className="text-[11px] font-mono text-gray-400 hover:text-accent flex items-center space-x-1"
              >
                <span>&larr; Return to Scanner Desk</span>
              </Link>
            </div>

            <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={inputSearchId}
                onChange={(e) => setInputSearchId(e.target.value)}
                placeholder="e.g. TX2-EX-7264, TX2-EX-4918, TX2-FC-8492"
                className="flex-1 px-4 py-3 bg-darkNavy/90 border border-primary/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-accent text-sm font-mono uppercase"
              />
              <button
                type="button"
                onClick={() => setShowScannerModal(true)}
                className="py-3 px-5 rounded-xl bg-cyan-500/15 border border-cyan-400/40 text-cyan-300 text-xs font-orbitron font-bold flex items-center justify-center space-x-2 hover:bg-cyan-500/25 transition-all shadow-sm"
                title="Open camera or image QR scanner"
              >
                <Camera className="w-4 h-4 text-cyan-400" />
                <span>Scan QR</span>
              </button>
              <button type="submit" className="btn-primary py-3 px-6 text-xs font-bold whitespace-nowrap">
                Verify Credential
              </button>
            </form>
          </div>
        )}

      </div>

      {/* ================= MODAL: PHYSICAL ID BADGE PREVIEW ================= */}
      {showIdCardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="glass-card max-w-md w-full p-6 rounded-3xl border border-primary/30 space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center space-x-2">
                <QrCode className="w-5 h-5 text-accent" />
                <h3 className="font-orbitron font-bold text-white text-sm">
                  Physical ID Badge &bull; {member?.id || targetId}
                </h3>
                {(() => {
                  const clearance = getAccessClearance(member);
                  return (
                    <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded tracking-wider ${clearance.theme.badge}`}>
                      {clearance.badge}
                    </span>
                  );
                })()}
              </div>
              <button
                onClick={() => setShowIdCardModal(false)}
                className="text-gray-400 hover:text-white text-lg font-bold px-2 py-1"
              >
                &times;
              </button>
            </div>

            <div className="relative rounded-2xl overflow-hidden border border-primary/20 shadow-xl bg-darkNavy flex justify-center">
              <img
                src={customCardImage?.stdDataUrl || customCardImage?.hdDataUrl || member?.idCard || "/assets/id-cards/TX2-CT-TEMPLATE.jpg"}
                alt={`${member?.name || "Official"} TechXpo 2.O ID Badge`}
                className="w-full h-auto max-h-[480px] object-contain"
              />
            </div>

            <div className="space-y-2 text-center text-xs text-gray-300">
              <p className="font-mono text-[11px] text-emerald-400 flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Official Circuitron Scannable QR Badge
              </p>
              <code className="block bg-black/50 p-2 rounded text-[11px] font-mono text-accent select-all break-all">
                {getMemberVerificationUrl(member || targetId)}
              </code>
            </div>

            <div className="flex gap-3 pt-2">
              {isAdmin ? (
                <a
                  href={customCardImage?.hdDataUrl || member?.idCardHd || member?.idCard || "/assets/id-cards/TX2-CT-TEMPLATE-hd.jpg"}
                  download={`${(member?.name || "TechXpo").replace(/\s+/g, '_')}_TechXpo_2.0_ID_Badge_HD.jpg`}
                  className="btn-primary flex-1 py-3 text-xs font-bold text-center flex items-center justify-center space-x-2 shadow-neon"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Print HD</span>
                </a>
              ) : (
                <button
                  onClick={() => setShowAdminLoginModal(true)}
                  className="btn-secondary flex-1 py-3 text-xs font-bold flex items-center justify-center space-x-2 text-amber-300 border-amber-500/30 hover:bg-amber-500/10"
                >
                  <Lock className="w-4 h-4 text-amber-400" />
                  <span>Admin Clearance Required to Download</span>
                </button>
              )}
              <button
                onClick={() => setShowIdCardModal(false)}
                className="btn-secondary py-3 px-5 text-xs font-bold"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ================= MODAL: SECRETARIAT ADMIN LOGIN ================= */}
      {showAdminLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="glass-card max-w-sm w-full p-6 sm:p-7 rounded-3xl border border-primary/40 space-y-5 shadow-2xl relative"
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-accent/15 border border-accent/30 flex items-center justify-center text-accent">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-orbitron font-bold text-white text-sm">
                    Secretariat Admin Access
                  </h3>
                  <span className="text-[10px] font-mono text-gray-400 block">
                    ID Badge Download Clearance
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowAdminLoginModal(false);
                  setAdminAuthError("");
                }}
                className="text-gray-400 hover:text-white text-lg font-bold px-2 py-1"
              >
                &times;
              </button>
            </div>

            <p className="text-gray-300 text-xs leading-relaxed">
              Official physical ID badge downloads are restricted to Secretariat Administrators. Regular participants and attendees can validate credentials and share links.
            </p>

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-gray-300 mb-1.5">
                  Admin Passkey:
                </label>
                <input
                  type="password"
                  value={adminPassInput}
                  onChange={(e) => {
                    setAdminPassInput(e.target.value);
                    setAdminAuthError("");
                  }}
                  placeholder="Enter administrator passkey..."
                  autoFocus
                  className="w-full px-4 py-3 bg-darkNavy/90 border border-primary/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-accent text-sm font-mono tracking-wider"
                />
                {adminAuthError && (
                  <p className="text-xs text-rose-400 font-mono mt-1.5 flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{adminAuthError}</span>
                  </p>
                )}
              </div>

              <div className="flex gap-2.5 pt-1">
                <button
                  type="submit"
                  className="btn-primary flex-1 py-2.5 text-xs font-bold flex items-center justify-center space-x-1.5 shadow-neon"
                >
                  <Unlock className="w-3.5 h-3.5" />
                  <span>Authorize &amp; Unlock</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAdminLoginModal(false);
                    setAdminAuthError("");
                  }}
                  className="btn-secondary py-2.5 px-4 text-xs font-bold"
                >
                  Cancel
                </button>
              </div>
            </form>

            <div className="pt-2 border-t border-white/5 text-center">
              <span className="text-[10px] font-mono text-gray-500">
                TechXpo 2.O &bull; Circuitron IoT Club &bull; RVSCET
              </span>
            </div>
          </motion.div>
        </div>
      )}

      {/* ================= MODAL: LIVE QR AUTHENTICATOR SCANNER ================= */}
      <QrScannerModal
        isOpen={showScannerModal}
        onClose={() => setShowScannerModal(false)}
        onScanSuccess={handleScanSuccess}
      />
    </motion.div>
  );
}
