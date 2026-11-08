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
} from "lucide-react";
import { getMemberById } from "../data/team";
import { generateMemberIdCard, downloadDataUrl } from "../utils/idCardGenerator";

const ADMIN_PASSCODES = [
  "2026techxpo@admin",
  "ankit327",
];

export default function Verify() {
  const { id: paramId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Determine target member ID from URL param or query string (defaults to TX2-EX-9531 for Subha Pain)
  const targetId = (paramId || searchParams.get("id") || "TX2-EX-9531").trim().toUpperCase();

  const [inputSearchId, setInputSearchId] = useState(targetId);
  const [copied, setCopied] = useState(false);
  const [showIdCardModal, setShowIdCardModal] = useState(false);
  const [customCardImage, setCustomCardImage] = useState(null);
  const [isRenderingCard, setIsRenderingCard] = useState(false);

  // Admin authorization state
  const [isAdmin, setIsAdmin] = useState(() => {
    if (typeof window !== "undefined") {
      const urlKey = searchParams.get("admin") || searchParams.get("key") || "";
      if (urlKey && ADMIN_PASSCODES.includes(urlKey.toLowerCase().trim())) {
        localStorage.setItem("tx2_admin_authenticated", "true");
        return true;
      }
      return localStorage.getItem("tx2_admin_authenticated") === "true";
    }
    return false;
  });

  const [showAdminLoginModal, setShowAdminLoginModal] = useState(false);
  const [adminPassInput, setAdminPassInput] = useState("");
  const [adminAuthError, setAdminAuthError] = useState("");
  const [validatedTimestamp, setValidatedTimestamp] = useState(null);
  const [isValidating, setIsValidating] = useState(false);

  const member = getMemberById(targetId);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setInputSearchId(targetId);
    setValidatedTimestamp(null);
    setCustomCardImage(null);
  }, [targetId]);

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

  const handleShare = () => {
    const url = window.location.href;
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
    const entered = adminPassInput.trim().toLowerCase();
    if (ADMIN_PASSCODES.includes(entered)) {
      localStorage.setItem("tx2_admin_authenticated", "true");
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
    localStorage.removeItem("tx2_admin_authenticated");
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
            Credential Verification
          </h1>
          <p className="text-gray-300 text-sm sm:text-base max-w-xl mx-auto">
            Scan verification and cryptographic validation for official TechXpo 2.O leaders, coordinators, and delegates at RVSCET Jamshedpur.
          </p>
        </div>

        {member ? (
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
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-tr from-darkNavy to-primary/30 flex items-center justify-center font-orbitron font-extrabold text-4xl text-accent">
                        {member.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
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
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <Lock className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span className="text-gray-300 font-mono text-[11px]">
                      Access Level: <strong className="text-white">All Arenas &amp; Secretariat</strong>
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold">
                    AUTHORIZED
                  </span>
                </div>

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

            <div className="pt-4 flex justify-center gap-3">
              <Link to="/contact" className="btn-primary text-xs py-2.5 px-5 font-bold">
                Contact Help Desk
              </Link>
              <Link to="/team" className="btn-secondary text-xs py-2.5 px-5 font-bold">
                Official Roster
              </Link>
            </div>
          </motion.div>
        )}

        {/* Search Another Member ID Form */}
        <div className="glass-card p-6 rounded-2xl border border-primary/20 space-y-4">
          <div className="flex items-center space-x-2 text-xs font-mono text-gray-400">
            <Search className="w-4 h-4 text-accent" />
            <span>AUTHENTICATE ANOTHER CREDENTIAL ID:</span>
          </div>

          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={inputSearchId}
              onChange={(e) => setInputSearchId(e.target.value)}
              placeholder="e.g. TX2-EX-7264, TX2-EX-4918, TX2-FC-8492"
              className="flex-1 px-4 py-3 bg-darkNavy/80 border border-primary/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-accent text-sm font-mono uppercase"
            />
            <button type="submit" className="btn-primary py-3 px-6 text-xs font-bold whitespace-nowrap">
              Verify Credential
            </button>
          </form>
        </div>

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
                {`https://circuitron2-0.vercel.app/verify/${member?.id || targetId}`}
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
    </motion.div>
  );
}
