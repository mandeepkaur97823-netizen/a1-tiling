import { useEffect, useMemo, useState } from "react";
import {
  Lock,
  Eye,
  EyeOff,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Download,
  Trash2,
  ArrowLeft,
  LogOut,
  Search,
  ExternalLink,
  KeyRound,
  FileText,
  MessageSquare,
  ShieldCheck,
  Check,
  Power,
  PowerOff,
  Globe,
  Wrench,
  Database,
  X,
} from "lucide-react";
import { A1Logo } from "./A1Logo";
import { business } from "../config/business";
import {
  fetchEnquiriesFromSupabase,
  updateEnquiryStatusInSupabase,
  updateEnquiryNotesInSupabase,
  deleteEnquiryFromSupabase,
  updateSiteSettingsInSupabase,
  fetchSiteSettingsFromSupabase,
  isSupabaseConfigured,
  getSupabaseConfig,
  saveSupabaseConfig,
  clearSupabaseConfig,
  testSupabaseConnection,
} from "../lib/supabase";

export type EnquiryStatus =
  | "new"
  | "contacted"
  | "quoted"
  | "completed"
  | "archived";

export interface StoredEnquiry {
  referenceId: string;
  submittedAt: string;
  fullName: string;
  phone: string;
  email: string;
  location: string;
  service: string;
  projectType: "Residential" | "Commercial";
  description: string;
  hasPhoto: boolean;
  photoName?: string;
  photoDataUrl?: string;
  status: EnquiryStatus;
  notes?: string;
}

interface AdminPanelProps {
  onBackToWebsite: () => void;
  onSiteStatusChange?: (isLive: boolean) => void;
}

const STATUS_CONFIG: Record<
  EnquiryStatus,
  { label: string; bg: string; text: string; border: string }
> = {
  new: {
    label: "New Lead",
    bg: "bg-[#4B8CFF]/15",
    text: "text-[#4B8CFF]",
    border: "border-[#4B8CFF]/30",
  },
  contacted: {
    label: "Contacted",
    bg: "bg-amber-500/15",
    text: "text-amber-400",
    border: "border-amber-500/30",
  },
  quoted: {
    label: "Quoted",
    bg: "bg-purple-500/15",
    text: "text-purple-400",
    border: "border-purple-500/30",
  },
  completed: {
    label: "Completed",
    bg: "bg-emerald-500/15",
    text: "text-emerald-400",
    border: "border-emerald-500/30",
  },
  archived: {
    label: "Archived",
    bg: "bg-white/10",
    text: "text-[#B8B8B8]",
    border: "border-white/20",
  },
};

const DEFAULT_FALLBACK_ENQUIRIES: StoredEnquiry[] = [
  {
    referenceId: "A1-SAMPLE1",
    submittedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    fullName: "Michael Henderson",
    phone: "0412 345 678",
    email: "m.henderson@example.com.au",
    location: "Brisbane",
    service: "Wall & Floor Tiling",
    projectType: "Residential",
    description:
      "Renovation of master bathroom and separate ensuite in New Farm. Approx 45sqm wall and floor tiling with 1200x600 porcelain tiles and mitred niche.",
    hasPhoto: false,
    status: "new",
    notes: "Client requested call back after 3pm. Interested in dark slate finish.",
  },
  {
    referenceId: "A1-SAMPLE2",
    submittedAt: new Date(Date.now() - 3600000 * 26).toISOString(),
    fullName: "Sarah & David Jenkins",
    phone: "0423 889 900",
    email: "sjenkins.design@example.com",
    location: "Gold Coast",
    service: "Stone Work (Wall & Floor)",
    projectType: "Residential",
    description:
      "Architectural dry-stacked sandstone feature wall for outdoor living pavilion and large bluestone floor pavers around alfresco terrace.",
    hasPhoto: false,
    status: "contacted",
    notes: "Initial phone call completed. Site inspection booked for Thursday morning.",
  },
  {
    referenceId: "A1-SAMPLE3",
    submittedAt: new Date(Date.now() - 3600000 * 52).toISOString(),
    fullName: "Liam O'Connor (Coastal Resorts)",
    phone: "0431 772 119",
    email: "liam@coastalresorts.com.au",
    location: "Sunshine Coast",
    service: "Pool Tiling",
    projectType: "Commercial",
    description:
      "Full waterline mosaic tiling (deep teal glass mosaics) and drop-face limestone pool coping for resort swimming pool in Noosa Heads.",
    hasPhoto: false,
    status: "quoted",
    notes: "Formal quote sent ($18,400 inc GST). Awaiting builder approval.",
  },
];

export function AdminPanel({
  onBackToWebsite,
  onSiteStatusChange,
}: AdminPanelProps) {
  const [token, setToken] = useState<string | null>(() => {
    return (
      localStorage.getItem("a1_admin_token") ||
      sessionStorage.getItem("a1_admin_token") ||
      null
    );
  });

  // Public Site Availability (ON / OFF / Maintenance Mode)
  const [isSiteLive, setIsSiteLive] = useState<boolean>(true);
  const [maintenanceMessage, setMaintenanceMessage] = useState<string>("");
  const [maintenanceMessageDraft, setMaintenanceMessageDraft] =
    useState<string>("");
  const [updatingSiteStatus, setUpdatingSiteStatus] = useState<boolean>(false);
  const [showSiteSettingsModal, setShowSiteSettingsModal] =
    useState<boolean>(false);
  const [siteStatusToast, setSiteStatusToast] = useState<string | null>(null);

  // Fetch site status
  const fetchSiteSettings = async () => {
    if (isSupabaseConfigured()) {
      try {
        const supa = await fetchSiteSettingsFromSupabase();
        if (supa) {
          setIsSiteLive(supa.isSiteLive);
          setMaintenanceMessage(supa.maintenanceMessage);
          setMaintenanceMessageDraft(supa.maintenanceMessage);
          return;
        }
      } catch {}
    }
    try {
      const res = await fetch("/api/site-settings");
      const data = await res.json();
      if (data.ok && data.settings) {
        setIsSiteLive(data.settings.isSiteLive !== false);
        setMaintenanceMessage(data.settings.maintenanceMessage || "");
        setMaintenanceMessageDraft(data.settings.maintenanceMessage || "");
      }
    } catch (err) {
      console.error("Failed to fetch site settings:", err);
    }
  };

  useEffect(() => {
    fetchSiteSettings();
  }, []);

  const handleToggleSiteStatus = async (overrideStatus?: boolean) => {
    if (!token) return;
    const targetStatus =
      typeof overrideStatus === "boolean" ? overrideStatus : !isSiteLive;
    setUpdatingSiteStatus(true);
    if (isSupabaseConfigured()) {
      try {
        await updateSiteSettingsInSupabase({
          isSiteLive: targetStatus,
          maintenanceMessage: maintenanceMessageDraft || maintenanceMessage,
        });
      } catch {}
    }
    try {
      const res = await fetch("/api/admin/site-settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          isSiteLive: targetStatus,
          maintenanceMessage: maintenanceMessageDraft || maintenanceMessage,
        }),
      });
      const data = await res.json();
      if (res.ok && data.settings) {
        setIsSiteLive(data.settings.isSiteLive);
        setMaintenanceMessage(data.settings.maintenanceMessage);
        if (onSiteStatusChange) {
          onSiteStatusChange(data.settings.isSiteLive);
        }
        setSiteStatusToast(
          data.settings.isSiteLive
            ? "Public Website is now ONLINE & LIVE!"
            : "Public Website is now OFFLINE (Maintenance Mode active)!",
        );
        setTimeout(() => setSiteStatusToast(null), 4000);
      }
    } catch (err) {
      console.error("Failed to update site status:", err);
      // Even if API failed, if Supabase or client updated, update state
      setIsSiteLive(targetStatus);
      if (onSiteStatusChange) {
        onSiteStatusChange(targetStatus);
      }
      setSiteStatusToast(
        targetStatus
          ? "Public Website is now ONLINE & LIVE!"
          : "Public Website is now OFFLINE (Maintenance Mode active)!",
      );
      setTimeout(() => setSiteStatusToast(null), 4000);
    } finally {
      setUpdatingSiteStatus(false);
    }
  };

  const handleSaveMaintenanceMessage = async () => {
    if (!token) return;
    setUpdatingSiteStatus(true);
    if (isSupabaseConfigured()) {
      try {
        await updateSiteSettingsInSupabase({
          isSiteLive,
          maintenanceMessage: maintenanceMessageDraft,
        });
      } catch {}
    }
    try {
      const res = await fetch("/api/admin/site-settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          isSiteLive,
          maintenanceMessage: maintenanceMessageDraft,
        }),
      });
      const data = await res.json();
      if (res.ok && data.settings) {
        setMaintenanceMessage(data.settings.maintenanceMessage);
        setShowSiteSettingsModal(false);
        setSiteStatusToast("Maintenance announcement updated successfully!");
        setTimeout(() => setSiteStatusToast(null), 4000);
      }
    } catch (err) {
      console.error("Failed to update maintenance notice:", err);
      setMaintenanceMessage(maintenanceMessageDraft);
      setShowSiteSettingsModal(false);
      setSiteStatusToast("Maintenance announcement updated successfully!");
      setTimeout(() => setSiteStatusToast(null), 4000);
    } finally {
      setUpdatingSiteStatus(false);
    }
  };

  // Login form state
  const [passwordInput, setPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  // Enquiries & Dashboard state
  const [enquiries, setEnquiries] = useState<StoredEnquiry[]>([]);
  const [loadingEnquiries, setLoadingEnquiries] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [locationFilter, setLocationFilter] = useState<string>("all");

  // Notes editing state
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);

  // Change password state
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [changePwdMsg, setChangePwdMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Zoomed photo modal
  const [zoomedPhoto, setZoomedPhoto] = useState<{
    url: string;
    title: string;
  } | null>(null);

  // Supabase connection modal & state
  const [showSupabaseModal, setShowSupabaseModal] = useState(false);
  const [supabaseUrlInput, setSupabaseUrlInput] = useState(() => getSupabaseConfig().url);
  const [supabaseKeyInput, setSupabaseKeyInput] = useState(() => getSupabaseConfig().anonKey);
  const [supabaseTestStatus, setSupabaseTestStatus] = useState<{
    testing: boolean;
    success?: boolean;
    message?: string;
  }>({ testing: false });

  const handleSaveAndTestSupabase = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUrl = supabaseUrlInput.trim();
    const cleanKey = supabaseKeyInput.trim();
    if (!cleanUrl || !cleanKey) {
      setSupabaseTestStatus({
        testing: false,
        success: false,
        message: "Please enter both your Supabase Project URL and Anon Public Key.",
      });
      return;
    }
    setSupabaseTestStatus({ testing: true, message: "Testing connection to Supabase database..." });
    const res = await testSupabaseConnection(cleanUrl, cleanKey);
    if (res.ok) {
      saveSupabaseConfig(cleanUrl, cleanKey);
      setSupabaseTestStatus({
        testing: false,
        success: true,
        message: `Database linked successfully! Found ${res.count ?? 0} existing enquiries.`,
      });
      fetchEnquiries();
      setTimeout(() => {
        setShowSupabaseModal(false);
      }, 1600);
    } else {
      setSupabaseTestStatus({
        testing: false,
        success: false,
        message: `Connection failed: ${res.error}. Make sure you executed supabase_schema.sql in your Supabase SQL Editor.`,
      });
    }
  };

  const handleDisconnectSupabase = () => {
    if (window.confirm("Are you sure you want to disconnect Supabase?")) {
      clearSupabaseConfig();
      setSupabaseUrlInput("");
      setSupabaseKeyInput("");
      setSupabaseTestStatus({ testing: false, success: false, message: "Supabase disconnected." });
      fetchEnquiries();
    }
  };

  // Load enquiries from API with fallback to Supabase / localStorage / sample data
  const fetchEnquiries = async (authToken = token) => {
    if (!authToken) return;
    setLoadingEnquiries(true);

    if (isSupabaseConfigured()) {
      try {
        const supaData = await fetchEnquiriesFromSupabase();
        if (supaData && Array.isArray(supaData) && supaData.length > 0) {
          setEnquiries(supaData);
          setLoadingEnquiries(false);
          try {
            localStorage.setItem("a1_stored_enquiries", JSON.stringify(supaData));
          } catch {}
          return;
        }
      } catch (err) {
        console.warn("Supabase fetch failed, falling back to API / local:", err);
      }
    }

    let loadedFromApi = false;
    try {
      const res = await fetch("/api/admin/enquiries", {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      if (res.status === 401) {
        handleLogout();
        return;
      }
      if (res.ok) {
        const data = await res.json();
        if (data.enquiries && Array.isArray(data.enquiries)) {
          setEnquiries(data.enquiries);
          try {
            localStorage.setItem("a1_stored_enquiries", JSON.stringify(data.enquiries));
          } catch {}
          loadedFromApi = true;
          return;
        }
      }
    } catch {
      // Backend not running (e.g. Vercel static deployment)
    } finally {
      setLoadingEnquiries(false);
    }

    if (!loadedFromApi) {
      try {
        const stored = localStorage.getItem("a1_stored_enquiries");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setEnquiries(parsed);
            return;
          }
        }
      } catch {}
      setEnquiries(DEFAULT_FALLBACK_ENQUIRIES);
      try {
        localStorage.setItem("a1_stored_enquiries", JSON.stringify(DEFAULT_FALLBACK_ENQUIRIES));
      } catch {}
    }
  };

  useEffect(() => {
    if (token) {
      fetchEnquiries(token);
    }
  }, [token]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const entered = passwordInput.trim();
    if (!entered) {
      setLoginError("Please enter the admin password.");
      return;
    }
    setLoginLoading(true);
    setLoginError(null);

    let loggedIn = false;
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: entered }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.token) {
          setToken(data.token);
          localStorage.setItem("a1_admin_token", data.token);
          setPasswordInput("");
          fetchEnquiries(data.token);
          loggedIn = true;
          return;
        }
      } else if (res.status === 401) {
        setLoginError("Incorrect password. Try again.");
        return;
      }
    } catch {
      // API call failed (e.g. static hosting on Vercel)
    } finally {
      setLoginLoading(false);
    }

    if (!loggedIn) {
      // Fallback for Vercel static deployment or offline admin access
      if (entered === "a12026") {
        const fallbackToken = "a1_admin_vercel_session";
        setToken(fallbackToken);
        localStorage.setItem("a1_admin_token", fallbackToken);
        setPasswordInput("");
        fetchEnquiries(fallbackToken);
      } else {
        setLoginError("Incorrect password. Try again.");
      }
    }
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem("a1_admin_token");
    sessionStorage.removeItem("a1_admin_token");
    setEnquiries([]);
  };

  const updateStatus = async (
    referenceId: string,
    newStatus: EnquiryStatus,
  ) => {
    if (!token) return;
    setEnquiries((prev) => {
      const updated = prev.map((e) =>
        e.referenceId === referenceId ? { ...e, status: newStatus } : e,
      );
      try {
        localStorage.setItem("a1_stored_enquiries", JSON.stringify(updated));
      } catch {}
      return updated;
    });
    if (isSupabaseConfigured()) {
      try {
        await updateEnquiryStatusInSupabase(referenceId, newStatus);
      } catch {}
    }
    try {
      await fetch(`/api/admin/enquiries/${referenceId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (err) {
      console.warn("API update failed, updated locally:", err);
    }
  };

  const saveNotes = async (referenceId: string) => {
    if (!token) return;
    setSavingNotes(true);
    setEnquiries((prev) => {
      const updated = prev.map((e) =>
        e.referenceId === referenceId ? { ...e, notes: notesDraft } : e,
      );
      try {
        localStorage.setItem("a1_stored_enquiries", JSON.stringify(updated));
      } catch {}
      return updated;
    });
    setEditingNotesId(null);
    if (isSupabaseConfigured()) {
      try {
        await updateEnquiryNotesInSupabase(referenceId, notesDraft);
      } catch {}
    }
    try {
      await fetch(`/api/admin/enquiries/${referenceId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ notes: notesDraft }),
      });
    } catch (err) {
      console.warn("API notes update failed, saved locally:", err);
    } finally {
      setSavingNotes(false);
    }
  };

  const deleteEnquiry = async (referenceId: string) => {
    if (!token) return;
    if (
      !window.confirm(
        `Are you sure you want to delete enquiry ${referenceId}? This cannot be undone.`,
      )
    ) {
      return;
    }
    setEnquiries((prev) => {
      const updated = prev.filter((e) => e.referenceId !== referenceId);
      try {
        localStorage.setItem("a1_stored_enquiries", JSON.stringify(updated));
      } catch {}
      return updated;
    });
    if (isSupabaseConfigured()) {
      try {
        await deleteEnquiryFromSupabase(referenceId);
      } catch {}
    }
    try {
      await fetch(`/api/admin/enquiries/${referenceId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (err) {
      console.warn("API delete failed, deleted locally:", err);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 4) {
      setChangePwdMsg({
        type: "error",
        text: "Password must be at least 4 characters.",
      });
      return;
    }
    try {
      const res = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newPassword: newPassword.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setChangePwdMsg({
          type: "success",
          text: `Password updated to: "${newPassword.trim()}".`,
        });
        setNewPassword("");
      } else {
        setChangePwdMsg({
          type: "error",
          text: data.error || "Failed to change password",
        });
      }
    } catch {
      setChangePwdMsg({
        type: "error",
        text: "Server error updating password",
      });
    }
  };

  const exportCSV = () => {
    if (enquiries.length === 0) return;
    const headers = [
      "Reference ID",
      "Submitted At",
      "Status",
      "Full Name",
      "Phone",
      "Email",
      "Location",
      "Service",
      "Project Type",
      "Description",
      "Admin Notes",
    ];
    const rows = enquiries.map((e) => [
      `"${e.referenceId}"`,
      `"${new Date(e.submittedAt).toLocaleString()}"`,
      `"${e.status || "new"}"`,
      `"${e.fullName.replace(/"/g, '""')}"`,
      `"${e.phone}"`,
      `"${e.email}"`,
      `"${e.location}"`,
      `"${e.service}"`,
      `"${e.projectType}"`,
      `"${e.description.replace(/"/g, '""')}"`,
      `"${(e.notes || "").replace(/"/g, '""')}"`,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `a1-tiling-enquiries-${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered list
  const filteredEnquiries = useMemo(() => {
    return enquiries.filter((e) => {
      // Status filter
      if (statusFilter !== "all" && e.status !== statusFilter) {
        return false;
      }
      // Location filter
      if (locationFilter !== "all" && e.location !== locationFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          e.fullName.toLowerCase().includes(q) ||
          e.phone.toLowerCase().includes(q) ||
          e.email.toLowerCase().includes(q) ||
          e.referenceId.toLowerCase().includes(q) ||
          e.service.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          (e.notes && e.notes.toLowerCase().includes(q));
        if (!matches) return false;
      }
      return true;
    });
  }, [enquiries, statusFilter, locationFilter, searchQuery]);

  // Aggregate Metrics
  const metrics = useMemo(() => {
    return {
      total: enquiries.length,
      newCount: enquiries.filter((e) => (e.status || "new") === "new").length,
      contacted: enquiries.filter((e) => e.status === "contacted").length,
      quoted: enquiries.filter((e) => e.status === "quoted").length,
      completed: enquiries.filter((e) => e.status === "completed").length,
    };
  }, [enquiries]);

  // ==========================================
  // VIEW 1: LOGIN SCREEN (if not authenticated)
  // ==========================================
  if (!token) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex flex-col justify-between py-12 px-6">
        <div className="max-w-md w-full mx-auto">
          <button
            type="button"
            onClick={onBackToWebsite}
            className="inline-flex items-center gap-2 text-xs font-mono text-[#B8B8B8] hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Public Website
          </button>

          <div className="bg-[#121316] border border-white/15 p-8 sm:p-10 shadow-2xl">
            <div className="flex flex-col items-center text-center mb-8">
              <A1Logo size="lg" showText={false} className="mb-4" />
              <h1 className="font-display text-2xl font-bold tracking-tight text-white">
                A1 TILING ADMIN
              </h1>
              <p className="text-xs text-[#B8B8B8] mt-1.5 font-mono uppercase tracking-wider">
                Management Portal
              </p>
            </div>

            {loginError && (
              <div className="mb-6 p-3.5 bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label
                  htmlFor="admin-password"
                  className="block text-xs font-mono uppercase tracking-wider text-[#B8B8B8] mb-2"
                >
                  Admin Password
                </label>
                <div className="relative">
                  <input
                    id="admin-password"
                    type={showPassword ? "text" : "password"}
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Enter admin password"
                    autoFocus
                    className="w-full px-4 py-3 bg-black/60 border border-white/20 text-white text-sm focus:border-[#4B8CFF] focus:outline-none transition-colors pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#B8B8B8] hover:text-white transition-colors p-1"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full py-3.5 bg-[#4B8CFF] text-white text-xs font-semibold tracking-widest uppercase hover:bg-white hover:text-[#050505] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Lock className="w-4 h-4" />
                {loginLoading ? "Authenticating..." : "Unlock Dashboard"}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-white/10 text-center">
              <p className="text-[11px] font-mono text-[#B8B8B8]/60 flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#4B8CFF]" />
                <span>Authorized Management Portal</span>
              </p>
            </div>
          </div>
        </div>

        <div className="text-center text-xs text-[#B8B8B8]/60 font-mono">
          &copy; {new Date().getFullYear()} {business.name} &middot; Queensland, Australia
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: AUTHENTICATED ADMIN DASHBOARD
  // ==========================================
  return (
    <div className="min-h-screen bg-[#07080a] text-white">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#0b0c0e]/95 backdrop-blur-md border-b border-white/15 px-6 lg:px-10 py-4">
        <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <A1Logo size="sm" showText={false} />
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="font-display text-base font-bold text-white tracking-wide uppercase">
                  A1 Tiling Admin
                </h1>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 border text-[11px] font-mono uppercase tracking-wider font-semibold ${
                    isSiteLive
                      ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                      : "bg-red-500/15 border-red-500/40 text-red-400 animate-pulse"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isSiteLive ? "bg-emerald-400 animate-pulse" : "bg-red-400"
                    }`}
                  />
                  SITE: {isSiteLive ? "ONLINE (LIVE)" : "OFFLINE (MAINTENANCE)"}
                </span>

                <button
                  type="button"
                  onClick={() => setShowSupabaseModal(true)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 border text-[11px] font-mono uppercase tracking-wider font-semibold cursor-pointer transition-colors ${
                    isSupabaseConfigured()
                      ? "bg-[#3ECF8E]/15 border-[#3ECF8E]/40 text-[#3ECF8E] hover:bg-[#3ECF8E]/25"
                      : "bg-amber-500/15 border-amber-500/40 text-amber-400 hover:bg-amber-500/25 animate-pulse"
                  }`}
                  title="Configure Supabase Database Connection"
                >
                  <Database className="w-3 h-3" />
                  <span>
                    {isSupabaseConfigured() ? "Supabase: Connected" : "Link Supabase"}
                  </span>
                </button>
              </div>
              <p className="text-[11px] text-[#B8B8B8] font-mono">
                Queensland Client Enquiries &amp; Project Quotes
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setShowSupabaseModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 border border-white/15 text-xs font-mono text-[#B8B8B8] hover:text-white hover:border-white/30 transition-colors cursor-pointer"
              title="Supabase Database Settings"
            >
              <Database className="w-3.5 h-3.5 text-[#3ECF8E]" />
              <span className="hidden md:inline">Database</span>
            </button>
            {/* Quick Site ON / OFF Toggle Button in Header */}
            <button
              type="button"
              onClick={() => handleToggleSiteStatus()}
              disabled={updatingSiteStatus}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 border text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
                isSiteLive
                  ? "border-red-500/40 text-red-300 bg-red-950/30 hover:bg-red-900/50 hover:border-red-400"
                  : "border-emerald-500/40 text-emerald-300 bg-emerald-950/40 hover:bg-emerald-900/60 hover:border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.25)]"
              }`}
              title={
                isSiteLive
                  ? "Turn public website OFF into Maintenance Mode"
                  : "Turn public website ON (Go Live)"
              }
            >
              {updatingSiteStatus ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Switching...</span>
                </>
              ) : isSiteLive ? (
                <>
                  <PowerOff className="w-3.5 h-3.5 text-red-400" />
                  <span>Turn Site OFF</span>
                </>
              ) : (
                <>
                  <Power className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Turn Site ON</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setShowChangePassword(!showChangePassword)}
              className="inline-flex items-center gap-1.5 px-3 py-2 border border-white/15 text-xs font-mono text-[#B8B8B8] hover:text-white hover:border-white/30 transition-colors"
              title="Change Password"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Password</span>
            </button>

            <button
              type="button"
              onClick={() => fetchEnquiries()}
              disabled={loadingEnquiries}
              className="inline-flex items-center gap-1.5 px-3 py-2 border border-white/15 text-xs font-mono text-[#B8B8B8] hover:text-white hover:border-white/30 transition-colors"
              title="Refresh Enquiries"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${loadingEnquiries ? "animate-spin text-[#4B8CFF]" : ""}`}
              />
              <span className="hidden md:inline">Refresh</span>
            </button>

            <button
              type="button"
              onClick={exportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-2 border border-white/15 text-xs font-mono text-[#B8B8B8] hover:text-white hover:border-white/30 transition-colors"
              title="Export Enquiries to CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Export CSV</span>
            </button>

            <button
              type="button"
              onClick={onBackToWebsite}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white text-[#050505] text-xs font-semibold uppercase tracking-wider hover:bg-[#4B8CFF] hover:text-white transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Website
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-2 border border-red-500/30 text-red-400 text-xs font-mono hover:bg-red-950/40 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* Change password sub-drawer */}
        {showChangePassword && (
          <div className="max-w-[1400px] mx-auto mt-4 pt-4 border-t border-white/10">
            <form
              onSubmit={handleChangePassword}
              className="flex flex-wrap items-center gap-3 bg-[#151619] p-3 border border-white/15"
            >
              <span className="text-xs font-mono text-[#B8B8B8]">
                Change Admin Password:
              </span>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="px-3 py-1.5 bg-black/60 border border-white/20 text-xs text-white focus:outline-none focus:border-[#4B8CFF]"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-[#4B8CFF] text-white text-xs font-medium hover:bg-white hover:text-black transition-colors"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowChangePassword(false);
                  setChangePwdMsg(null);
                }}
                className="px-3 py-1.5 text-xs text-[#B8B8B8] hover:text-white"
              >
                Cancel
              </button>
              {changePwdMsg && (
                <span
                  className={`text-xs ${changePwdMsg.type === "success" ? "text-emerald-400" : "text-red-400"}`}
                >
                  {changePwdMsg.text}
                </span>
              )}
            </form>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="max-w-[1400px] mx-auto px-6 lg:px-10 py-8">
        {/* ======================================================== */}
        {/* PUBLIC SITE VISIBILITY & MAINTENANCE MODE CONTROL BANNER */}
        {/* ======================================================== */}
        <div
          className={`mb-8 border p-5 sm:p-6 transition-all ${
            isSiteLive
              ? "bg-[#0c1218]/90 border-emerald-500/30 shadow-[0_0_25px_rgba(16,185,129,0.05)]"
              : "bg-[#180f11]/95 border-red-500/50 shadow-[0_0_35px_rgba(239,68,68,0.15)]"
          }`}
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div className="flex items-start gap-4">
              <div
                className={`w-12 h-12 shrink-0 flex items-center justify-center border ${
                  isSiteLive
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                    : "bg-red-500/20 border-red-500/40 text-red-400"
                }`}
              >
                {isSiteLive ? (
                  <Globe className="w-6 h-6 text-emerald-400" />
                ) : (
                  <Wrench className="w-6 h-6 text-red-400 animate-pulse" />
                )}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                    Public Website Status:
                  </h2>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-mono font-bold uppercase tracking-wider border ${
                      isSiteLive
                        ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                        : "bg-red-500/25 border-red-500/50 text-red-300 animate-pulse"
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isSiteLive ? "bg-emerald-400" : "bg-red-400"
                      }`}
                    />
                    {isSiteLive
                      ? "ONLINE (ACTIVE & RECEIVING LEADS)"
                      : "OFFLINE (MAINTENANCE MODE ACTIVE)"}
                  </span>
                </div>
                <p className="text-xs text-[#B8B8B8] max-w-2xl leading-relaxed">
                  {isSiteLive
                    ? "The public website is fully online for clients across Brisbane, Gold Coast, and Sunshine Coast. Quote forms and showcase galleries are active."
                    : "The public website is temporarily shut down. Public visitors see your custom Maintenance Notice with direct click-to-call and WhatsApp buttons."}
                </p>
                {!isSiteLive && maintenanceMessage && (
                  <div className="mt-3 p-2.5 bg-black/50 border border-white/10 text-[11px] text-[#B8B8B8] font-mono">
                    <span className="text-amber-400 font-semibold mr-1.5">
                      Visitor Notice:
                    </span>
                    &ldquo;{maintenanceMessage}&rdquo;
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setShowSiteSettingsModal(true)}
                className="px-3.5 py-2.5 border border-white/15 text-xs font-mono text-[#B8B8B8] hover:text-white hover:border-white/30 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                title="Edit notice text shown to visitors during maintenance"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Custom Notice</span>
              </button>

              {/* Master ON / OFF Toggle Button */}
              <button
                type="button"
                onClick={() => handleToggleSiteStatus()}
                disabled={updatingSiteStatus}
                className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 transition-all cursor-pointer shadow-lg ${
                  isSiteLive
                    ? "bg-red-600 hover:bg-red-500 text-white border border-red-400/40 hover:shadow-[0_0_20px_rgba(239,68,68,0.4)]"
                    : "bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-400/40 shadow-[0_0_25px_rgba(16,185,129,0.35)]"
                }`}
              >
                {updatingSiteStatus ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Updating...</span>
                  </>
                ) : isSiteLive ? (
                  <>
                    <PowerOff className="w-4 h-4" />
                    <span>Turn Site OFF (Maintenance)</span>
                  </>
                ) : (
                  <>
                    <Power className="w-4 h-4" />
                    <span>Turn Site ON (Go Live)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Supabase Database Connection Status Banner */}
        <div
          className={`mb-8 border p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
            isSupabaseConfigured()
              ? "bg-[#0b1411]/90 border-[#3ECF8E]/30"
              : "bg-gradient-to-r from-amber-950/30 to-[#121316] border-amber-500/40 shadow-lg"
          }`}
        >
          <div className="flex items-start gap-3.5">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center border shrink-0 ${
                isSupabaseConfigured()
                  ? "bg-[#3ECF8E]/15 border-[#3ECF8E]/40 text-[#3ECF8E]"
                  : "bg-amber-500/15 border-amber-500/40 text-amber-400"
              }`}
            >
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                  Database Link:
                </h3>
                <span
                  className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-mono font-bold uppercase tracking-wider border ${
                    isSupabaseConfigured()
                      ? "bg-[#3ECF8E]/20 border-[#3ECF8E]/40 text-[#3ECF8E]"
                      : "bg-amber-500/20 border-amber-500/40 text-amber-300 animate-pulse"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isSupabaseConfigured()
                        ? "bg-[#3ECF8E]"
                        : "bg-amber-400 animate-ping"
                    }`}
                  />
                  {isSupabaseConfigured()
                    ? "SUPABASE CONNECTED (REAL-TIME SYNC ACTIVE)"
                    : "SUPABASE NOT LINKED YET"}
                </span>
              </div>
              <p className="text-xs text-[#B8B8B8] mt-1 leading-relaxed max-w-2xl">
                {isSupabaseConfigured()
                  ? "Every quote enquiry and review submitted on your live Vercel website syncs instantly to your Supabase PostgreSQL database."
                  : "Link your Supabase Project URL and Anon Public Key so client quotes submitted on your live Vercel website appear here in real time on all devices."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowSupabaseModal(true)}
            className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider inline-flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0 ${
              isSupabaseConfigured()
                ? "border border-[#3ECF8E]/40 text-[#3ECF8E] hover:bg-[#3ECF8E]/10"
                : "bg-[#3ECF8E] text-[#050505] hover:bg-white shadow-lg shadow-[#3ECF8E]/20"
            }`}
          >
            <Database className="w-4 h-4" />
            <span>{isSupabaseConfigured() ? "Manage Supabase" : "Link Supabase Now"}</span>
          </button>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-[#121316] border border-white/10 p-5">
            <p className="text-[11px] font-mono text-[#B8B8B8] uppercase tracking-wider">
              Total Enquiries
            </p>
            <p className="font-display text-3xl font-bold text-white mt-1">
              {metrics.total}
            </p>
          </div>

          <div className="bg-[#121316] border border-[#4B8CFF]/30 p-5 bg-[#4B8CFF]/5">
            <p className="text-[11px] font-mono text-[#4B8CFF] uppercase tracking-wider flex items-center justify-between">
              <span>New Leads</span>
              <span className="w-2 h-2 rounded-full bg-[#4B8CFF]" />
            </p>
            <p className="font-display text-3xl font-bold text-[#4B8CFF] mt-1">
              {metrics.newCount}
            </p>
          </div>

          <div className="bg-[#121316] border border-amber-500/20 p-5">
            <p className="text-[11px] font-mono text-amber-400 uppercase tracking-wider">
              Contacted
            </p>
            <p className="font-display text-3xl font-bold text-amber-400 mt-1">
              {metrics.contacted}
            </p>
          </div>

          <div className="bg-[#121316] border border-purple-500/20 p-5">
            <p className="text-[11px] font-mono text-purple-400 uppercase tracking-wider">
              Quotes Sent
            </p>
            <p className="font-display text-3xl font-bold text-purple-400 mt-1">
              {metrics.quoted}
            </p>
          </div>

          <div className="bg-[#121316] border border-emerald-500/20 p-5 col-span-2 lg:col-span-1">
            <p className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider">
              Completed
            </p>
            <p className="font-display text-3xl font-bold text-emerald-400 mt-1">
              {metrics.completed}
            </p>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-[#121316] border border-white/10 p-4 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#B8B8B8] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by client, phone, email, reference, service..."
              className="w-full pl-9 pr-4 py-2 bg-black/60 border border-white/15 text-xs text-white focus:outline-none focus:border-[#4B8CFF] transition-colors"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full md:w-auto">
            {/* Status Filter */}
            <div className="flex items-center gap-1.5 text-xs overflow-x-auto no-scrollbar py-1">
              <span className="text-[#B8B8B8] font-mono text-[11px] mr-1 shrink-0">
                Status:
              </span>
              {(
                ["all", "new", "contacted", "quoted", "completed", "archived"] as const
              ).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider border transition-colors shrink-0 cursor-pointer ${
                    statusFilter === st
                      ? "bg-white text-black border-white font-semibold"
                      : "bg-black/40 text-[#B8B8B8] border-white/10 hover:border-white/30"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Location Filter */}
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="px-3 py-1 bg-black/60 border border-white/15 text-xs text-white focus:outline-none focus:border-[#4B8CFF] font-mono"
            >
              <option value="all">All Regions</option>
              <option value="Brisbane">Brisbane</option>
              <option value="Gold Coast">Gold Coast</option>
              <option value="Sunshine Coast">Sunshine Coast</option>
            </select>
          </div>
        </div>

        {/* Enquiries Feed / Cards List */}
        {loadingEnquiries ? (
          <div className="text-center py-20 bg-[#121316] border border-white/10">
            <RefreshCw className="w-6 h-6 animate-spin text-[#4B8CFF] mx-auto mb-3" />
            <p className="text-xs font-mono text-[#B8B8B8]">
              Loading enquiries...
            </p>
          </div>
        ) : filteredEnquiries.length === 0 ? (
          <div className="text-center py-16 bg-[#121316] border border-white/10 p-6">
            <FileText className="w-10 h-10 text-white/20 mx-auto mb-3" />
            <h3 className="font-display text-lg font-semibold text-white">
              No matching enquiries found
            </h3>
            <p className="text-xs text-[#B8B8B8] mt-1 max-w-sm mx-auto">
              {searchQuery || statusFilter !== "all" || locationFilter !== "all"
                ? "Try adjusting your search terms or filters."
                : "No client quotes have been submitted yet."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredEnquiries.map((enquiry) => {
              const cfg =
                STATUS_CONFIG[enquiry.status || "new"] || STATUS_CONFIG.new;
              const isEditingNotes = editingNotesId === enquiry.referenceId;
              const dateStr = new Date(enquiry.submittedAt).toLocaleDateString(
                "en-AU",
                {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                },
              );

              return (
                <div
                  key={enquiry.referenceId}
                  className="bg-[#121316] border border-white/10 p-5 sm:p-6 hover:border-white/20 transition-all duration-200"
                >
                  {/* Top line: Reference + Status + Date */}
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-white/10">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold text-white tracking-wider">
                        {enquiry.referenceId}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-mono uppercase tracking-wider border ${cfg.bg} ${cfg.text} ${cfg.border}`}
                      >
                        {cfg.label}
                      </span>
                      <span className="text-xs font-mono text-[#B8B8B8]/60">
                        {dateStr}
                      </span>
                    </div>

                    {/* Change Status Dropdown */}
                    <div className="flex items-center gap-2">
                      <label className="text-[11px] font-mono text-[#B8B8B8]">
                        Update:
                      </label>
                      <select
                        value={enquiry.status || "new"}
                        onChange={(e) =>
                          updateStatus(
                            enquiry.referenceId,
                            e.target.value as EnquiryStatus,
                          )
                        }
                        className="px-2.5 py-1 bg-black/60 border border-white/20 text-xs text-white focus:outline-none focus:border-[#4B8CFF] font-mono cursor-pointer"
                      >
                        <option value="new">New Lead</option>
                        <option value="contacted">Contacted</option>
                        <option value="quoted">Quoted</option>
                        <option value="completed">Completed</option>
                        <option value="archived">Archived</option>
                      </select>

                      <button
                        type="button"
                        onClick={() => deleteEnquiry(enquiry.referenceId)}
                        className="p-1.5 text-white/40 hover:text-red-400 transition-colors ml-1"
                        title="Delete enquiry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Client & Project Core Info */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Left: Client Contact Details */}
                    <div className="lg:col-span-4 space-y-3">
                      <div>
                        <h4 className="font-display text-lg font-bold text-white leading-tight">
                          {enquiry.fullName}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="inline-flex items-center gap-1 text-xs text-[#4B8CFF] font-mono">
                            <MapPin className="w-3 h-3" />
                            {enquiry.location}
                          </span>
                          <span className="text-white/30">&middot;</span>
                          <span className="text-xs text-white/70 font-mono">
                            {enquiry.projectType}
                          </span>
                        </div>
                      </div>

                      {/* Fast Action Buttons: Call, WhatsApp, Email */}
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <a
                          href={`tel:${enquiry.phone.replace(/\s+/g, "")}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#4B8CFF]/15 border border-[#4B8CFF]/30 text-[#4B8CFF] hover:bg-[#4B8CFF] hover:text-white transition-colors text-xs font-mono"
                          title="Call Client"
                        >
                          <Phone className="w-3 h-3" />
                          {enquiry.phone}
                        </a>

                        <a
                          href={`mailto:${enquiry.email}?subject=Quote%20Enquiry%20${enquiry.referenceId}%20-%20A1%20Tiling`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/15 text-white/80 hover:text-white hover:border-white transition-colors text-xs font-mono truncate max-w-[220px]"
                          title="Send Email"
                        >
                          <Mail className="w-3 h-3 shrink-0" />
                          <span className="truncate">{enquiry.email}</span>
                        </a>

                        <a
                          href={`https://wa.me/${enquiry.phone.replace(/\D/g, "")}?text=Hi%20${encodeURIComponent(enquiry.fullName)},%20thank%20you%20for%20contacting%20A1%20Tiling%20Pty%20Ltd%20regarding%20your%20${encodeURIComponent(enquiry.service)}%20project.`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-colors text-xs font-mono"
                          title="Message on WhatsApp"
                        >
                          <MessageSquare className="w-3 h-3" />
                          WhatsApp
                        </a>
                      </div>
                    </div>

                    {/* Middle: Service & Description */}
                    <div className="lg:col-span-5 bg-black/40 border border-white/10 p-4">
                      <div className="text-[11px] font-mono text-[#4B8CFF] uppercase tracking-wider mb-1">
                        Required Service
                      </div>
                      <div className="font-semibold text-sm text-white mb-2.5">
                        {enquiry.service}
                      </div>

                      <div className="text-[11px] font-mono text-[#B8B8B8] uppercase tracking-wider mb-1">
                        Project Scope &amp; Details
                      </div>
                      <p className="text-xs text-white/90 leading-relaxed whitespace-pre-wrap">
                        {enquiry.description}
                      </p>

                      {/* Photo / Plan Attachment if present */}
                      {enquiry.hasPhoto && enquiry.photoDataUrl && (
                        <div className="mt-3 pt-3 border-t border-white/10 flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() =>
                              setZoomedPhoto({
                                url: enquiry.photoDataUrl!,
                                title: `${enquiry.fullName} - ${enquiry.photoName || "Project Attachment"}`,
                              })
                            }
                            className="relative w-14 h-14 bg-black border border-white/20 overflow-hidden shrink-0 group cursor-pointer"
                          >
                            <img
                              src={enquiry.photoDataUrl}
                              alt="Client attachment"
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                            />
                          </button>
                          <div>
                            <span className="text-[11px] font-mono text-white/70 block">
                              Client Attachment:
                            </span>
                            <span className="text-xs text-[#4B8CFF] font-medium">
                              {enquiry.photoName || "Uploaded Site Photo"}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right: Internal Admin Notes */}
                    <div className="lg:col-span-3 bg-black/40 border border-white/10 p-4 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[11px] font-mono text-[#B8B8B8] uppercase tracking-wider">
                            Internal Notes
                          </span>
                          {!isEditingNotes && (
                            <button
                              type="button"
                              onClick={() => {
                                setEditingNotesId(enquiry.referenceId);
                                setNotesDraft(enquiry.notes || "");
                              }}
                              className="text-[10px] font-mono text-[#4B8CFF] hover:underline"
                            >
                              Edit Note
                            </button>
                          )}
                        </div>

                        {isEditingNotes ? (
                          <div className="space-y-2">
                            <textarea
                              value={notesDraft}
                              onChange={(e) => setNotesDraft(e.target.value)}
                              placeholder="e.g. Quoted $3,800, site visit booked for Friday 10am..."
                              rows={3}
                              className="w-full p-2 bg-black border border-white/20 text-xs text-white focus:outline-none focus:border-[#4B8CFF]"
                            />
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => saveNotes(enquiry.referenceId)}
                                disabled={savingNotes}
                                className="px-2.5 py-1 bg-[#4B8CFF] text-white text-[10px] font-mono uppercase"
                              >
                                {savingNotes ? "Saving..." : "Save"}
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingNotesId(null)}
                                className="px-2 py-1 text-[10px] font-mono text-[#B8B8B8] hover:text-white"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-[#B8B8B8] italic leading-relaxed">
                            {enquiry.notes || "No notes added yet."}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Maintenance Message Customizer Modal */}
      {showSiteSettingsModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121316] border border-white/20 max-w-lg w-full p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-[#4B8CFF]" />
                <h3 className="font-display text-sm font-bold uppercase tracking-wider text-white">
                  Maintenance Screen Notice
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSiteSettingsModal(false)}
                className="text-[#B8B8B8] hover:text-white text-xs font-mono cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <p className="text-xs text-[#B8B8B8] mb-4 leading-relaxed">
              This notice is prominently displayed to public visitors when the
              website is turned OFF (Maintenance Mode).
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#B8B8B8] mb-2">
                  Announcement Message
                </label>
                <textarea
                  value={maintenanceMessageDraft}
                  onChange={(e) => setMaintenanceMessageDraft(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 bg-black/60 border border-white/20 text-white text-xs focus:border-[#4B8CFF] focus:outline-none transition-colors"
                  placeholder="Enter notice text for visitors..."
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSiteSettingsModal(false)}
                  className="px-4 py-2 border border-white/15 text-xs font-mono text-[#B8B8B8] hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveMaintenanceMessage}
                  disabled={updatingSiteStatus}
                  className="px-5 py-2 bg-[#4B8CFF] text-white text-xs font-semibold uppercase tracking-wider hover:bg-white hover:text-black transition-colors cursor-pointer"
                >
                  {updatingSiteStatus ? "Saving..." : "Save Notice"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Supabase Connection Setup Modal */}
      {showSupabaseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-[#121316] border border-white/20 w-full max-w-lg p-6 sm:p-8 shadow-2xl relative my-8">
            <div className="flex items-center justify-between pb-4 border-b border-white/15 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#3ECF8E]/20 flex items-center justify-center border border-[#3ECF8E]/40 text-[#3ECF8E]">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-white">
                    Link Supabase Database
                  </h3>
                  <p className="text-xs text-[#B8B8B8]">
                    Sync live client quotes &amp; reviews in real time
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowSupabaseModal(false);
                  setSupabaseTestStatus({ testing: false });
                }}
                className="p-1.5 text-[#B8B8B8] hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAndTestSupabase} className="space-y-4">
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-[#B8B8B8] mb-1.5 font-mono">
                  Supabase Project URL *
                </label>
                <input
                  type="url"
                  required
                  value={supabaseUrlInput}
                  onChange={(e) => setSupabaseUrlInput(e.target.value)}
                  placeholder="https://your-project.supabase.co"
                  className="w-full px-4 py-3 bg-[#07080a] border border-white/20 text-white text-xs font-mono placeholder:text-white/30 focus:outline-none focus:border-[#3ECF8E]"
                />
                <p className="text-[10px] text-[#7E7E7E] mt-1 font-mono">
                  From Supabase Dashboard &gt; Project Settings &gt; API &gt; Project URL
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-[#B8B8B8] mb-1.5 font-mono">
                  Supabase Anon Public API Key *
                </label>
                <textarea
                  rows={3}
                  required
                  value={supabaseKeyInput}
                  onChange={(e) => setSupabaseKeyInput(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="w-full px-4 py-2.5 bg-[#07080a] border border-white/20 text-white text-xs font-mono placeholder:text-white/30 focus:outline-none focus:border-[#3ECF8E]"
                />
                <p className="text-[10px] text-[#7E7E7E] mt-1 font-mono">
                  From Supabase Dashboard &gt; Project Settings &gt; API &gt; Project API keys (anon public)
                </p>
              </div>

              {supabaseTestStatus.message && (
                <div
                  className={`p-3 text-xs flex items-start gap-2 border ${
                    supabaseTestStatus.success
                      ? "bg-emerald-950/60 border-emerald-500/50 text-emerald-200"
                      : "bg-red-950/60 border-red-500/50 text-red-200"
                  }`}
                >
                  {supabaseTestStatus.success ? (
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  )}
                  <span>{supabaseTestStatus.message}</span>
                </div>
              )}

              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="submit"
                  disabled={supabaseTestStatus.testing}
                  className="w-full sm:flex-1 py-3 px-5 bg-[#3ECF8E] text-[#050505] text-xs font-bold uppercase tracking-wider hover:bg-white transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {supabaseTestStatus.testing ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Testing Connection...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Test &amp; Connect Database</span>
                    </>
                  )}
                </button>

                {isSupabaseConfigured() && (
                  <button
                    type="button"
                    onClick={handleDisconnectSupabase}
                    className="w-full sm:w-auto py-3 px-4 border border-red-500/40 text-red-400 hover:bg-red-950/40 text-xs font-medium uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Disconnect
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Status Notification Toast */}
      {siteStatusToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#121316] border border-[#4B8CFF] p-4 text-xs text-white shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-300">
          <CheckCircle className="w-4 h-4 text-[#4B8CFF] shrink-0" />
          <span>{siteStatusToast}</span>
        </div>
      )}

      {/* Lightbox for Zoomed Attachment */}
      {zoomedPhoto && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between p-6 backdrop-blur-md"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-white">
              {zoomedPhoto.title}
            </span>
            <button
              type="button"
              onClick={() => setZoomedPhoto(null)}
              className="p-2 text-white/70 hover:text-white border border-white/20"
            >
              Close
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center my-4 overflow-hidden">
            <img
              src={zoomedPhoto.url}
              alt={zoomedPhoto.title}
              className="max-h-[80vh] max-w-full object-contain border border-white/20"
            />
          </div>
        </div>
      )}
    </div>
  );
}
