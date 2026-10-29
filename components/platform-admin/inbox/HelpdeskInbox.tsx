"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useTheme } from "next-themes";
import {
  Mail,
  Search,
  Lock,
  CheckCircle2,
  Send,
  Paperclip,
  ChevronDown,
  Trash2,
  ArrowRightLeft,
  Inbox,
  RefreshCw,
  FileText,
  Bold,
  Italic,
  List,
  Sparkles,
  Check,
  X,
  Phone,
  FileIcon,
  Download,
  AlertCircle,
  Plus,
  Star,
  Minimize2,
  Maximize2,
  Minus,
  PenSquare,
  Tag,
  Shield,
  Layers,
  Clock,
  ExternalLink,
  ChevronRight,
  Sun,
  Moon,
  ArrowLeft,
  Menu,
} from "lucide-react";

import {
  Department,
  UserProfile,
  EmailThread,
  EmailMessage,
  CannedResponse,
  TicketStatus,
  EmailFolder,
} from "@/types/inbox/helpdesk";

import {
  USER_PROFILES,
  DEPARTMENT_CONFIG,
  CANNED_RESPONSES,
} from "@/lib/inbox/mock-data";

interface LocalAttachment {
  filename: string;
  size: string;
  content: string; // base64
  contentType: string;
}

// All official PhotoOS sending identities available for Admin
const OFFICIAL_IDENTITIES = [
  {
    key: "support",
    email: "support@photoos.in",
    label: "PhotoOS Support",
    desc: "Customer helpdesk, bug reports, studio setup",
    dept: "support" as const,
    color: "text-blue-500 bg-blue-500/10 border-blue-500/30",
  },
  {
    key: "billing",
    email: "billing@photoos.in",
    label: "PhotoOS Billing",
    desc: "GST invoices, payment reminders, plan renewals",
    dept: "billing" as const,
    color: "text-amber-500 bg-amber-500/10 border-amber-500/30",
  },
  {
    key: "marketing",
    email: "marketing@photoos.in",
    label: "PhotoOS Marketing",
    desc: "Creator collaborations, onboarding, promotions",
    dept: "marketing" as const,
    color: "text-purple-500 bg-purple-500/10 border-purple-500/30",
  },
  {
    key: "founder",
    email: "founder@photoos.in",
    label: "PhotoOS Founder & Legal",
    desc: "Enterprise deals, VIP studios, legal/DPDP notices",
    dept: "founder_legal" as const,
    color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/30",
  },
  {
    key: "team",
    email: "team@photoos.in",
    label: "PhotoOS Internal Team",
    desc: "Internal staff updates, team invitations",
    dept: "support" as const,
    color: "text-sky-500 bg-sky-500/10 border-sky-500/30",
  },
  {
    key: "noreply",
    email: "noreply@photoos.in",
    label: "PhotoOS System Alerts",
    desc: "Automated OTPs, 2FA, system notices",
    dept: "support" as const,
    color: "text-slate-500 bg-slate-500/10 border-slate-500/30",
  },
];

export default function HelpdeskInbox() {
  // Theme Toggle State
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isDark = mounted ? resolvedTheme === "dark" || theme === "dark" : true;

  // Mobile View Navigation State: "threads" | "folders" | "conversation"
  const [mobileTab, setMobileTab] = useState<"threads" | "folders" | "conversation">("threads");

  // Current Active User (Super Admin / Agent Switcher)
  const [currentUser, setCurrentUser] = useState<UserProfile>(USER_PROFILES[0]);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Folder state (Inbox, Sent, Starred, Drafts, Trash)
  const [activeFolder, setActiveFolder] = useState<EmailFolder>("inbox");

  // Department Filter
  const [activeDepartment, setActiveDepartment] = useState<Department>("all");

  // Status Filter
  const [statusFilter, setStatusFilter] = useState<TicketStatus>("all");

  // Search Query
  const [searchQuery, setSearchQuery] = useState("");

  // Live Threads from Resend API & Server
  const [threads, setThreads] = useState<EmailThread[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Selected Thread ID
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);

  // Reply Draft & Sending State
  const [replyText, setReplyText] = useState("");
  const [replySendFrom, setReplySendFrom] = useState<string>("support");
  const [sendingReply, setSendingReply] = useState(false);
  const [sendSuccessToast, setSendSuccessToast] = useState<string | null>(null);

  // File Attachments for Reply
  const [attachments, setAttachments] = useState<LocalAttachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Transfer & Canned dropdowns
  const [transferMenuOpen, setTransferMenuOpen] = useState(false);
  const [cannedMenuOpen, setCannedMenuOpen] = useState(false);
  const [replyFromDropdownOpen, setReplyFromDropdownOpen] = useState(false);

  // =========================================================================
  // GMAIL-STYLE COMPOSE MODAL STATE
  // =========================================================================
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [isComposeMinimized, setIsComposeMinimized] = useState(false);
  const [isComposeMaximized, setIsComposeMaximized] = useState(false);

  const [composeFrom, setComposeFrom] = useState<string>("support");
  const [composeFromDropdownOpen, setComposeFromDropdownOpen] = useState(false);
  const [composeTo, setComposeTo] = useState("");
  const [composeCc, setComposeCc] = useState("");
  const [composeBcc, setComposeBcc] = useState("");
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [composeSubject, setComposeSubject] = useState("");
  const [composeBody, setComposeBody] = useState("");
  const [composeAttachments, setComposeAttachments] = useState<LocalAttachment[]>([]);
  const [composeCannedOpen, setComposeCannedOpen] = useState(false);
  const [isSendingCompose, setIsSendingCompose] = useState(false);
  const composeFileInputRef = useRef<HTMLInputElement>(null);
  const composeBodyRef = useRef<HTMLTextAreaElement>(null);

  // Textarea Ref & Auto-scroll
  const replyInputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isSuperAdmin = currentUser.role === "SUPER_ADMIN";

  // Fetch Live Emails from Server API (Resend & Cloudflare routed)
  const fetchLiveEmails = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await fetch("/api/email/inbox", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        const liveThreads: EmailThread[] = data.threads || [];
        setThreads(liveThreads);

        if (liveThreads.length > 0 && !selectedThreadId) {
          setSelectedThreadId(liveThreads[0].id);
        }
      }
    } catch (err) {
      console.warn("Failed to fetch live emails:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void fetchLiveEmails();
  }, []);

  // When switching user role, auto-adjust allowed department
  const handleUserChange = (profile: UserProfile) => {
    setCurrentUser(profile);
    setUserDropdownOpen(false);
    if (profile.role !== "SUPER_ADMIN") {
      setActiveDepartment(profile.allowedDepartment);
      setComposeFrom(profile.allowedDepartment === "founder_legal" ? "founder" : profile.allowedDepartment);
      setReplySendFrom(profile.allowedDepartment === "founder_legal" ? "founder" : profile.allowedDepartment);
    } else {
      setActiveDepartment("all");
    }
  };

  const isDepartmentAllowed = (dept: Department): boolean => {
    if (isSuperAdmin) return true;
    if (dept === "all") return false;
    return currentUser.allowedDepartment === dept;
  };

  // Filter threads by Folder, User permission, Department tab, Status, and Search
  const filteredThreads = useMemo(() => {
    return threads.filter((thread) => {
      // 1. RBAC Restriction: Department agents only see their department
      if (!isSuperAdmin && thread.department !== currentUser.allowedDepartment) {
        return false;
      }

      // 2. Folder filter (Gmail style)
      if (activeFolder === "sent") {
        if (thread.folder !== "sent") return false;
      } else if (activeFolder === "starred") {
        if (!thread.starred) return false;
      } else if (activeFolder === "trash") {
        if (thread.folder !== "trash") return false;
      } else if (activeFolder === "drafts") {
        if (thread.folder !== "drafts") return false;
      } else {
        // "inbox": show normal incoming/active tickets (exclude trash)
        if (thread.folder === "trash") return false;
      }

      // 3. Department Tab Filter
      if (activeDepartment !== "all" && thread.department !== activeDepartment) {
        return false;
      }

      // 4. Status Filter
      if (statusFilter === "unread" && !thread.unread) return false;
      if (statusFilter === "open" && thread.status !== "open") return false;
      if (statusFilter === "resolved" && thread.status !== "resolved") return false;

      // 5. Search Filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesSubject = thread.subject.toLowerCase().includes(query);
        const matchesCustomer =
          thread.customerName.toLowerCase().includes(query) ||
          thread.customerEmail.toLowerCase().includes(query);
        const matchesSnippet = thread.snippet.toLowerCase().includes(query);
        const matchesMessage = thread.messages.some((m) =>
          m.body.toLowerCase().includes(query)
        );
        return matchesSubject || matchesCustomer || matchesSnippet || matchesMessage;
      }

      return true;
    });
  }, [threads, isSuperAdmin, currentUser, activeFolder, activeDepartment, statusFilter, searchQuery]);

  // Active Selected Thread
  const selectedThread = useMemo(() => {
    if (!selectedThreadId) return filteredThreads[0] || null;
    return threads.find((t) => t.id === selectedThreadId) || filteredThreads[0] || null;
  }, [threads, selectedThreadId, filteredThreads]);

  useEffect(() => {
    if (filteredThreads.length > 0 && selectedThreadId) {
      const stillVisible = filteredThreads.some((t) => t.id === selectedThreadId);
      if (!stillVisible) {
        setSelectedThreadId(filteredThreads[0].id);
      }
    }
  }, [filteredThreads, selectedThreadId]);

  const handleSelectThread = (thread: EmailThread) => {
    setSelectedThreadId(thread.id);
    if (thread.unread) {
      setThreads((prev) =>
        prev.map((t) => (t.id === thread.id ? { ...t, unread: false } : t))
      );
    }
    // On mobile, automatically show the conversation pane
    setMobileTab("conversation");
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedThread?.messages.length, selectedThreadId]);

  // Toggle Starred
  const handleToggleStar = (threadId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setThreads((prev) =>
      prev.map((t) => (t.id === threadId ? { ...t, starred: !t.starred } : t))
    );
  };

  // Re-assign / Transfer thread department (Super Admin)
  const handleTransferDepartment = (newDept: Exclude<Department, "all">) => {
    if (!isSuperAdmin || !selectedThread) return;
    const config = DEPARTMENT_CONFIG[newDept];
    setThreads((prev) =>
      prev.map((t) =>
        t.id === selectedThread.id
          ? {
              ...t,
              department: newDept,
              departmentEmail: config.email,
              lastUpdated: "Just now",
            }
          : t
      )
    );
    setTransferMenuOpen(false);
    setSendSuccessToast(`Thread reassigned to ${config.label} (${config.email})`);
    setTimeout(() => setSendSuccessToast(null), 3000);
  };

  // Mark status
  const handleToggleStatus = () => {
    if (!selectedThread) return;
    const nextStatus = selectedThread.status === "resolved" ? "open" : "resolved";
    setThreads((prev) =>
      prev.map((t) =>
        t.id === selectedThread.id ? { ...t, status: nextStatus } : t
      )
    );
  };

  // Move thread to Trash (or Restore)
  const handleMoveToTrash = () => {
    if (!selectedThread) return;
    const isAlreadyTrash = selectedThread.folder === "trash";
    const newFolder: EmailFolder = isAlreadyTrash ? "inbox" : "trash";

    setThreads((prev) =>
      prev.map((t) =>
        t.id === selectedThread.id ? { ...t, folder: newFolder } : t
      )
    );

    setSendSuccessToast(
      isAlreadyTrash ? "Conversation restored to Inbox" : "Conversation moved to Trash"
    );
    setTimeout(() => setSendSuccessToast(null), 3000);
  };

  const handleInsertCanned = (canned: CannedResponse) => {
    setReplyText((prev) => (prev ? `${prev}\n\n${canned.content}` : canned.content));
    setCannedMenuOpen(false);
    replyInputRef.current?.focus();
  };

  const handleInsertComposeCanned = (canned: CannedResponse) => {
    setComposeBody((prev) => (prev ? `${prev}\n\n${canned.content}` : canned.content));
    setComposeCannedOpen(false);
    composeBodyRef.current?.focus();
  };

  // File Upload Handlers
  const handleFilesSelected = (
    e: React.ChangeEvent<HTMLInputElement>,
    isCompose = false
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64Data = (reader.result as string).split(",")[1];
        const sizeFormatted =
          file.size < 1024 * 1024
            ? `${Math.round(file.size / 1024)} KB`
            : `${(file.size / (1024 * 1024)).toFixed(1)} MB`;

        const newAtt: LocalAttachment = {
          filename: file.name,
          size: sizeFormatted,
          content: base64Data,
          contentType: file.type || "application/octet-stream",
        };

        if (isCompose) {
          setComposeAttachments((prev) => [...prev, newAtt]);
        } else {
          setAttachments((prev) => [...prev, newAtt]);
        }
      };
      reader.readAsDataURL(file);
    });

    e.target.value = "";
  };

  const handleRemoveAttachment = (indexToRemove: number, isCompose = false) => {
    if (isCompose) {
      setComposeAttachments((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    } else {
      setAttachments((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    }
  };

  const handleFormatText = (
    targetRef: React.RefObject<HTMLTextAreaElement | null>,
    prefix: string,
    suffix = prefix,
    setter: (val: string) => void
  ) => {
    const el = targetRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const text = el.value;
    const selected = text.substring(start, end) || "text";
    const replacement = `${prefix}${selected}${suffix}`;
    const nextVal = text.substring(0, start) + replacement + text.substring(end);
    setter(nextVal);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 0);
  };

  // Dispatch Outbound Email Reply via Resend
  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedThread) return;

    setSendingReply(true);

    try {
      const payloadAttachments = attachments.map((a) => ({
        filename: a.filename,
        content: a.content,
      }));

      const activeIdentity =
        OFFICIAL_IDENTITIES.find((id) => id.key === replySendFrom) ||
        OFFICIAL_IDENTITIES[0];

      // 1. Dispatch live email via Resend API
      const res = await fetch("/api/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          department: activeIdentity.key,
          to: selectedThread.customerEmail,
          subject: `Re: ${selectedThread.subject}`,
          html: `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1e293b;">
            <p>${replyText.replace(/\n/g, "<br/>")}</p>
            ${
              payloadAttachments.length > 0
                ? `<p style="font-size: 13px; color: #475569;"><strong>Attachments:</strong> ${payloadAttachments
                    .map((a) => a.filename)
                    .join(", ")}</p>`
                : ""
            }
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
            <p style="font-size: 12px; color: #64748b;">
              Sent by ${currentUser.name} via ${activeIdentity.label} &lt;${activeIdentity.email}&gt;
            </p>
          </div>`,
          attachments: payloadAttachments,
        }),
      });

      const resData = await res.json();
      if (!res.ok) {
        console.warn("Live email notice:", resData);
      }

      // 2. Append message to local thread state
      const newMsg: EmailMessage = {
        id: `msg_rep_${Date.now()}`,
        threadId: selectedThread.id,
        senderType: "agent",
        senderName: `${currentUser.name} (${activeIdentity.label})`,
        senderEmail: activeIdentity.email,
        departmentEmail: activeIdentity.email,
        timestamp: "Just now",
        body: replyText.trim(),
        attachments: attachments.map((a) => ({
          name: a.filename,
          size: a.size,
          type: a.contentType,
        })),
      };

      setThreads((prev) =>
        prev.map((t) =>
          t.id === selectedThread.id
            ? {
                ...t,
                unread: false,
                lastUpdated: "Just now",
                messages: [...t.messages, newMsg],
              }
            : t
        )
      );

      // 3. Register reply in live server inbox store
      await fetch("/api/email/inbox", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          threadId: selectedThread.id,
          message: newMsg,
        }),
      }).catch(() => null);

      setReplyText("");
      setAttachments([]);
      setSendSuccessToast(`Email delivered to ${selectedThread.customerEmail} from ${activeIdentity.email}!`);
      setTimeout(() => setSendSuccessToast(null), 4000);
    } catch (err) {
      console.error("Live reply error:", err);
      setSendSuccessToast("Reply saved locally.");
      setTimeout(() => setSendSuccessToast(null), 3000);
    } finally {
      setSendingReply(false);
    }
  };

  // =========================================================================
  // GMAIL-STYLE COMPOSE SEND HANDLER (NEW EMAIL TO ANY RECIPIENT)
  // =========================================================================
  const handleSendCompose = async () => {
    if (!composeTo.trim()) {
      alert("Please enter a recipient email address (To).");
      return;
    }
    if (!composeSubject.trim()) {
      alert("Please enter an email subject line.");
      return;
    }
    if (!composeBody.trim()) {
      alert("Please enter an email message body.");
      return;
    }

    setIsSendingCompose(true);

    try {
      const activeIdentity =
        OFFICIAL_IDENTITIES.find((id) => id.key === composeFrom) ||
        OFFICIAL_IDENTITIES[0];

      const payloadAttachments = composeAttachments.map((a) => ({
        filename: a.filename,
        content: a.content,
      }));

      // Parse multi-recipient commas or semicolons
      const parseList = (str: string) =>
        str
          .split(/[,;]/)
          .map((s) => s.trim())
          .filter(Boolean);

      const toList = parseList(composeTo);
      const ccList = showCc && composeCc.trim() ? parseList(composeCc) : undefined;
      const bccList = showBcc && composeBcc.trim() ? parseList(composeBcc) : undefined;

      // 1. Dispatch live via Resend API
      const res = await fetch("/api/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          department: activeIdentity.key,
          to: toList,
          cc: ccList,
          bcc: bccList,
          subject: composeSubject,
          html: `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1e293b;">
            <p>${composeBody.replace(/\n/g, "<br/>")}</p>
            ${
              payloadAttachments.length > 0
                ? `<p style="font-size: 13px; color: #475569;"><strong>Attachments:</strong> ${payloadAttachments
                    .map((a) => a.filename)
                    .join(", ")}</p>`
                : ""
            }
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
            <p style="font-size: 12px; color: #64748b;">
              Sent by ${currentUser.name} via ${activeIdentity.label} &lt;${activeIdentity.email}&gt;
            </p>
          </div>`,
          attachments: payloadAttachments,
        }),
      });

      const resData = await res.json();
      if (!res.ok) {
        console.warn("Compose Resend API status:", resData);
      }

      // 2. Build local thread representation for Sent folder
      const newThreadId = `th_comp_${Date.now()}`;
      const firstRecipient = toList[0] || composeTo;
      const recipientName = firstRecipient.split("@")[0];

      const newSentThread: EmailThread = {
        id: newThreadId,
        department: activeIdentity.dept,
        departmentEmail: activeIdentity.email,
        subject: composeSubject,
        snippet: composeBody.slice(0, 140),
        customerName: recipientName,
        customerEmail: firstRecipient,
        customerPlan: "Direct Recipient",
        status: "open",
        priority: "normal",
        unread: false,
        starred: false,
        folder: "sent",
        createdAt: new Date().toISOString(),
        lastUpdated: "Just now",
        messages: [
          {
            id: `msg_comp_${Date.now()}`,
            threadId: newThreadId,
            senderType: "agent",
            senderName: `${currentUser.name} (${activeIdentity.label})`,
            senderEmail: activeIdentity.email,
            departmentEmail: activeIdentity.email,
            timestamp: "Just now",
            body: composeBody,
            attachments: composeAttachments.map((a) => ({
              name: a.filename,
              size: a.size,
              type: a.contentType,
            })),
          },
        ],
      };

      setThreads((prev) => [newSentThread, ...prev]);
      setSelectedThreadId(newThreadId);
      setActiveFolder("sent");
      setMobileTab("conversation");

      // 3. Save to server store
      await fetch("/api/email/inbox", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newThread: newSentThread }),
      }).catch(() => null);

      // Reset and close Compose
      setComposeTo("");
      setComposeCc("");
      setComposeBcc("");
      setShowCc(false);
      setShowBcc(false);
      setComposeSubject("");
      setComposeBody("");
      setComposeAttachments([]);
      setIsComposeOpen(false);

      setSendSuccessToast(`Email successfully dispatched to ${firstRecipient} via ${activeIdentity.email}!`);
      setTimeout(() => setSendSuccessToast(null), 4000);
    } catch (err) {
      console.error("Compose send error:", err);
      alert("Failed to deliver email. Check connection or credentials.");
    } finally {
      setIsSendingCompose(false);
    }
  };

  // Folder and Department count metrics
  const counts = useMemo(() => {
    let inboxCount = 0;
    let sentCount = 0;
    let starredCount = 0;
    let draftsCount = 0;
    let trashCount = 0;

    const deptCounts: Record<string, number> = {
      all: 0,
      support: 0,
      billing: 0,
      marketing: 0,
      founder_legal: 0,
    };

    threads.forEach((t) => {
      if (t.folder === "sent") sentCount += 1;
      else if (t.folder === "trash") trashCount += 1;
      else if (t.folder === "drafts") draftsCount += 1;
      else {
        inboxCount += 1;
        if (t.unread) deptCounts.all += 1;
      }

      if (t.starred) starredCount += 1;

      if (deptCounts[t.department] !== undefined) {
        deptCounts[t.department] += 1;
      }
    });

    return {
      inbox: inboxCount,
      sent: sentCount,
      starred: starredCount,
      drafts: draftsCount,
      trash: trashCount,
      departments: deptCounts,
    };
  }, [threads]);

  return (
    <div
      className={`flex h-full w-full flex-col overflow-hidden font-sans transition-colors duration-200 ${
        isDark ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-800"
      }`}
    >
      {/* Hidden File Input for Reply Attachments */}
      <input
        type="file"
        ref={fileInputRef}
        multiple
        className="hidden"
        onChange={(e) => handleFilesSelected(e, false)}
      />

      {/* Hidden File Input for Compose Attachments */}
      <input
        type="file"
        ref={composeFileInputRef}
        multiple
        className="hidden"
        onChange={(e) => handleFilesSelected(e, true)}
      />

      {/* ===================================================================== */}
      {/* 1. TOP HEADER BAR */}
      {/* ===================================================================== */}
      <header
        className={`relative z-30 flex h-14 shrink-0 items-center justify-between border-b px-3 sm:px-5 transition-colors duration-200 ${
          isDark
            ? "border-white/10 bg-slate-900/90 text-white"
            : "border-slate-200 bg-white text-slate-900 shadow-xs"
        }`}
      >
        {/* Left: Mobile Navigation Button & Brand Title */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile Folder Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileTab(mobileTab === "folders" ? "threads" : "folders")}
            className={`flex items-center gap-1.5 rounded-xl border p-2 text-xs font-semibold lg:hidden transition ${
              isDark
                ? "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                : "border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
            title="Folders & Departments"
          >
            <Menu className="h-4 w-4 text-sky-500" />
            <span className="hidden xs:inline">Folders</span>
          </button>

          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-[#0A3F61] to-[#0d5583] text-sky-400 shadow-md">
            <Mail className="h-4 w-4" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xs sm:text-sm font-bold tracking-tight truncate max-w-[150px] sm:max-w-none">
                PhotoOS Helpdesk
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-500 border border-emerald-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Resend Live
              </span>
            </div>
          </div>
        </div>

        {/* Center: Active Identity Tag */}
        <div
          className={`hidden md:flex items-center gap-2 rounded-xl border px-3 py-1 text-xs ${
            isDark
              ? "border-white/10 bg-slate-950/70 text-slate-400"
              : "border-slate-200 bg-slate-100/80 text-slate-600"
          }`}
        >
          <Shield className="h-3.5 w-3.5 text-sky-500" />
          <span>Active Identity:</span>
          <strong className={isDark ? "text-white" : "text-slate-900"}>
            {OFFICIAL_IDENTITIES.find((i) => i.key === composeFrom)?.email}
          </strong>
        </div>

        {/* Right: Light/Dark Theme Switcher, Sync, & User Switcher */}
        <div className="flex items-center gap-2">
          {/* Light / Dark Mode Toggle Button */}
          <button
            type="button"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className={`flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-semibold transition ${
              isDark
                ? "border-white/15 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
                : "border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900"
            }`}
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDark ? (
              <>
                <Sun className="h-3.5 w-3.5 text-amber-400" />
                <span className="hidden sm:inline text-[11px]">Light</span>
              </>
            ) : (
              <>
                <Moon className="h-3.5 w-3.5 text-slate-600" />
                <span className="hidden sm:inline text-[11px]">Dark</span>
              </>
            )}
          </button>

          {/* Sync Button */}
          <button
            type="button"
            onClick={() => void fetchLiveEmails(true)}
            disabled={refreshing}
            title="Refresh Live Emails from Resend"
            className={`flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs transition disabled:opacity-50 ${
              isDark
                ? "border-white/15 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
                : "border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900"
            }`}
          >
            <RefreshCw className={`h-3.5 w-3.5 text-sky-500 ${refreshing ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline text-[11px]">{refreshing ? "Syncing..." : "Sync"}</span>
          </button>

          {/* User Role Switcher */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className={`flex items-center gap-2 rounded-xl border px-2.5 py-1.5 transition ${
                isDark
                  ? "border-white/15 bg-white/5 text-white hover:bg-white/10"
                  : "border-slate-200 bg-slate-100 text-slate-900 hover:bg-slate-200"
              }`}
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-sky-500/20 text-xs font-bold text-sky-500 border border-sky-400/30">
                {currentUser.avatar}
              </div>
              <div className="text-left hidden lg:block">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold">{currentUser.name}</span>
                </div>
              </div>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>

            {/* Dropdown Menu */}
            {userDropdownOpen && (
              <div
                className={`absolute right-0 top-11 z-50 w-72 rounded-2xl border p-2 shadow-2xl backdrop-blur-xl ${
                  isDark
                    ? "border-white/15 bg-slate-900/95 text-white"
                    : "border-slate-200 bg-white/95 text-slate-900"
                }`}
              >
                <div className="px-3 py-2 border-b border-white/10">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Switch Test User Role
                  </div>
                </div>

                <div className="mt-1 space-y-1">
                  {USER_PROFILES.map((profile) => {
                    const isSelected = profile.id === currentUser.id;
                    return (
                      <button
                        key={profile.id}
                        type="button"
                        onClick={() => handleUserChange(profile)}
                        className={`flex w-full items-center justify-between rounded-xl p-2.5 text-left text-xs transition ${
                          isSelected
                            ? "bg-sky-500/20 font-semibold"
                            : isDark
                            ? "text-slate-300 hover:bg-white/5"
                            : "text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500/10 text-[11px] font-bold text-sky-500">
                            {profile.avatar}
                          </div>
                          <div>
                            <div className="font-semibold">{profile.name}</div>
                            <div className="text-[10px] text-slate-400">{profile.roleTitle}</div>
                          </div>
                        </div>
                        {isSelected && <Check className="h-4 w-4 text-sky-500" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Toast Notification */}
      {sendSuccessToast && (
        <div className="absolute top-16 right-4 sm:right-6 z-50 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-950/90 px-4 py-2.5 text-xs text-emerald-200 shadow-2xl backdrop-blur-md animate-in slide-in-from-top-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{sendSuccessToast}</span>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 2. RESPONSIVE THREE-PANE WORKSPACE */}
      {/* Mobile: Switch between Folders, Threads, and Conversation view */}
      {/* Desktop: 3-pane layout side-by-side */}
      {/* ===================================================================== */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* ================================================================= */}
        {/* PANE 1: GMAIL LEFT RAIL / FOLDER NAVIGATION (~230px fixed) */}
        {/* Mobile: Shown when mobileTab === 'folders' */}
        {/* ================================================================= */}
        <nav
          className={`flex-col border-r p-3 select-none transition-colors duration-200 ${
            isDark ? "border-white/10 bg-slate-900/70" : "border-slate-200 bg-white"
          } ${
            mobileTab === "folders"
              ? "flex absolute inset-0 z-40 bg-slate-950 lg:relative lg:inset-auto lg:w-[230px] lg:flex"
              : "hidden lg:flex lg:w-[230px] shrink-0"
          }`}
        >
          {/* Mobile Back / Close Button */}
          {mobileTab === "folders" && (
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-white/10 lg:hidden">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Navigation
              </span>
              <button
                type="button"
                onClick={() => setMobileTab("threads")}
                className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold text-sky-400 hover:bg-white/10"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>View Messages</span>
              </button>
            </div>
          )}

          {/* Prominent Gmail-style Compose Button */}
          <button
            type="button"
            onClick={() => {
              setIsComposeOpen(true);
              setIsComposeMinimized(false);
            }}
            className="group flex w-full items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 px-4 py-2.5 sm:py-3 text-xs font-bold text-white shadow-lg shadow-sky-950/40 transition hover:brightness-110 active:scale-[0.98]"
          >
            <Plus className="h-4 w-4 transition group-hover:rotate-90" />
            <span>Compose Email</span>
          </button>

          {/* Standard Folders List */}
          <div className="mt-4 space-y-1">
            <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Folders
            </div>

            {/* Inbox */}
            <button
              type="button"
              onClick={() => {
                setActiveFolder("inbox");
                setActiveDepartment("all");
                setMobileTab("threads");
              }}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition ${
                activeFolder === "inbox"
                  ? isDark
                    ? "bg-sky-500/15 text-white font-semibold"
                    : "bg-sky-50 text-sky-700 font-bold border border-sky-100"
                  : isDark
                  ? "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Inbox className={`h-4 w-4 ${activeFolder === "inbox" ? "text-sky-500" : ""}`} />
                <span>Inbox</span>
              </div>
              {counts.inbox > 0 && (
                <span className="rounded-full bg-sky-500/20 px-2 py-0.5 text-[10px] font-bold text-sky-500">
                  {counts.inbox}
                </span>
              )}
            </button>

            {/* Sent */}
            <button
              type="button"
              onClick={() => {
                setActiveFolder("sent");
                setMobileTab("threads");
              }}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition ${
                activeFolder === "sent"
                  ? isDark
                    ? "bg-sky-500/15 text-white font-semibold"
                    : "bg-sky-50 text-sky-700 font-bold border border-sky-100"
                  : isDark
                  ? "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Send className={`h-4 w-4 ${activeFolder === "sent" ? "text-sky-500" : ""}`} />
                <span>Sent</span>
              </div>
              {counts.sent > 0 && (
                <span className="rounded-full bg-slate-500/10 px-2 py-0.5 text-[10px] text-slate-400">
                  {counts.sent}
                </span>
              )}
            </button>

            {/* Starred */}
            <button
              type="button"
              onClick={() => {
                setActiveFolder("starred");
                setMobileTab("threads");
              }}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition ${
                activeFolder === "starred"
                  ? isDark
                    ? "bg-amber-500/15 text-amber-200 font-semibold"
                    : "bg-amber-50 text-amber-800 font-bold border border-amber-100"
                  : isDark
                  ? "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Star
                  className={`h-4 w-4 ${
                    activeFolder === "starred" ? "text-amber-500 fill-amber-500" : ""
                  }`}
                />
                <span>Starred</span>
              </div>
              {counts.starred > 0 && (
                <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-500">
                  {counts.starred}
                </span>
              )}
            </button>

            {/* Drafts */}
            <button
              type="button"
              onClick={() => {
                setActiveFolder("drafts");
                setMobileTab("threads");
              }}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition ${
                activeFolder === "drafts"
                  ? isDark
                    ? "bg-sky-500/15 text-white font-semibold"
                    : "bg-sky-50 text-sky-700 font-bold border border-sky-100"
                  : isDark
                  ? "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileText className="h-4 w-4" />
                <span>Drafts</span>
              </div>
              {counts.drafts > 0 && (
                <span className="rounded-full bg-slate-500/10 px-2 py-0.5 text-[10px] text-slate-400">
                  {counts.drafts}
                </span>
              )}
            </button>

            {/* Trash */}
            <button
              type="button"
              onClick={() => {
                setActiveFolder("trash");
                setMobileTab("threads");
              }}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition ${
                activeFolder === "trash"
                  ? isDark
                    ? "bg-rose-500/15 text-rose-200 font-semibold"
                    : "bg-rose-50 text-rose-700 font-bold border border-rose-100"
                  : isDark
                  ? "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Trash2 className="h-4 w-4" />
                <span>Trash</span>
              </div>
              {counts.trash > 0 && (
                <span className="rounded-full bg-slate-500/10 px-2 py-0.5 text-[10px] text-slate-400">
                  {counts.trash}
                </span>
              )}
            </button>
          </div>

          {/* Department Labels Filter */}
          <div className="mt-5 flex-1 space-y-1">
            <div className="flex items-center justify-between px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <span>Departments</span>
              <Tag className="h-3 w-3 text-slate-400" />
            </div>

            {/* All Inboxes */}
            {isSuperAdmin && (
              <button
                type="button"
                onClick={() => {
                  setActiveDepartment("all");
                  setActiveFolder("inbox");
                  setMobileTab("threads");
                }}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition ${
                  activeDepartment === "all" && activeFolder === "inbox"
                    ? isDark
                      ? "bg-white/15 text-white font-semibold"
                      : "bg-slate-200 text-slate-900 font-bold"
                    : isDark
                    ? "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-sky-500" />
                  <span>All Inboxes</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  {counts.departments.all}
                </span>
              </button>
            )}

            {/* Support */}
            <button
              type="button"
              onClick={() => {
                if (isDepartmentAllowed("support")) {
                  setActiveDepartment("support");
                  setMobileTab("threads");
                }
              }}
              disabled={!isDepartmentAllowed("support")}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition ${
                activeDepartment === "support"
                  ? "bg-blue-500/15 text-blue-500 font-bold border border-blue-500/20"
                  : isDepartmentAllowed("support")
                  ? isDark
                    ? "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  : "opacity-40 cursor-not-allowed text-slate-400"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                <span>Support Desk</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                {counts.departments.support}
              </span>
            </button>

            {/* Billing */}
            <button
              type="button"
              onClick={() => {
                if (isDepartmentAllowed("billing")) {
                  setActiveDepartment("billing");
                  setMobileTab("threads");
                }
              }}
              disabled={!isDepartmentAllowed("billing")}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition ${
                activeDepartment === "billing"
                  ? "bg-amber-500/15 text-amber-500 font-bold border border-amber-500/20"
                  : isDepartmentAllowed("billing")
                  ? isDark
                    ? "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  : "opacity-40 cursor-not-allowed text-slate-400"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                <span>Billing Desk</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                {counts.departments.billing}
              </span>
            </button>

            {/* Marketing */}
            <button
              type="button"
              onClick={() => {
                if (isDepartmentAllowed("marketing")) {
                  setActiveDepartment("marketing");
                  setMobileTab("threads");
                }
              }}
              disabled={!isDepartmentAllowed("marketing")}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition ${
                activeDepartment === "marketing"
                  ? "bg-purple-500/15 text-purple-500 font-bold border border-purple-500/20"
                  : isDepartmentAllowed("marketing")
                  ? isDark
                    ? "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  : "opacity-40 cursor-not-allowed text-slate-400"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-purple-500" />
                <span>Marketing & Leads</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                {counts.departments.marketing}
              </span>
            </button>

            {/* Founder & Legal */}
            <button
              type="button"
              onClick={() => {
                if (isDepartmentAllowed("founder_legal")) {
                  setActiveDepartment("founder_legal");
                  setMobileTab("threads");
                }
              }}
              disabled={!isDepartmentAllowed("founder_legal")}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition ${
                activeDepartment === "founder_legal"
                  ? "bg-emerald-500/15 text-emerald-500 font-bold border border-emerald-500/20"
                  : isDepartmentAllowed("founder_legal")
                  ? isDark
                    ? "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  : "opacity-40 cursor-not-allowed text-slate-400"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span>Founder & Legal</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                {counts.departments.founder_legal}
              </span>
            </button>
          </div>
        </nav>

        {/* ================================================================= */}
        {/* PANE 2: THREAD LIST COLUMN (~380px on desktop, full-width on mobile) */}
        {/* ================================================================= */}
        <aside
          className={`flex-col border-r transition-colors duration-200 ${
            isDark ? "border-white/10 bg-slate-900/40" : "border-slate-200 bg-white"
          } ${
            mobileTab === "threads"
              ? "flex w-full lg:w-[380px] shrink-0"
              : "hidden lg:flex lg:w-[380px] shrink-0"
          }`}
        >
          {/* Header Search & Filters */}
          <div className={`border-b p-3 sm:p-4 ${isDark ? "border-white/10" : "border-slate-200"}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider">
                  {activeFolder === "sent"
                    ? "Sent"
                    : activeFolder === "starred"
                    ? "Starred"
                    : activeFolder === "trash"
                    ? "Trash"
                    : activeDepartment === "all"
                    ? "All Inboxes"
                    : `${DEPARTMENT_CONFIG[activeDepartment].label}`}
                </span>
                <span className="rounded-full bg-sky-500/10 px-2 py-0.5 text-[10px] font-bold text-sky-500 border border-sky-500/20">
                  {filteredThreads.length}
                </span>
              </div>

              {/* Mobile Compose shortcut */}
              <button
                type="button"
                onClick={() => {
                  setIsComposeOpen(true);
                  setIsComposeMinimized(false);
                }}
                className="flex items-center gap-1 text-[11px] font-bold text-sky-500 lg:hidden hover:underline"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Compose</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative mt-2.5">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search subject, sender, or message..."
                className={`w-full rounded-xl border py-1.5 pl-9 pr-8 text-xs outline-none transition ${
                  isDark
                    ? "border-white/10 bg-white/5 text-white placeholder-slate-500 focus:border-sky-400 focus:bg-white/10"
                    : "border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:bg-white"
                }`}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Status Filter Chips */}
            {activeFolder !== "trash" && (
              <div className="mt-2.5 flex items-center gap-1.5 overflow-x-auto pb-0.5">
                {(["all", "unread", "open", "resolved"] as TicketStatus[]).map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-medium capitalize shrink-0 transition ${
                      statusFilter === st
                        ? isDark
                          ? "bg-white/15 text-white font-semibold"
                          : "bg-slate-900 text-white font-semibold"
                        : isDark
                        ? "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Thread Cards List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-white/5">
            {loading ? (
              <div className="flex flex-col items-center justify-center p-12 text-center text-slate-400">
                <RefreshCw className="h-7 w-7 text-sky-500 animate-spin mb-3" />
                <p className="text-xs font-semibold">Loading emails...</p>
                <p className="mt-1 text-[11px] text-slate-400">Fetching live messages from Resend</p>
              </div>
            ) : filteredThreads.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400">
                <Inbox className="h-8 w-8 text-slate-400 mb-2" />
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  No conversations in this view
                </p>
                <p className="mt-1 text-[11px] text-slate-400 max-w-xs">
                  {searchQuery
                    ? "No emails matched your search query."
                    : "Sent emails and incoming replies will appear here."}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIsComposeOpen(true);
                    setIsComposeMinimized(false);
                  }}
                  className="mt-4 flex items-center gap-1.5 rounded-xl bg-sky-500/10 px-3 py-1.5 text-xs font-bold text-sky-500 border border-sky-400/30 hover:bg-sky-500/20 transition"
                >
                  <PenSquare className="h-3.5 w-3.5" />
                  <span>Compose New Email</span>
                </button>
              </div>
            ) : (
              filteredThreads.map((thread) => {
                const isSelected = selectedThread?.id === thread.id;
                const deptConf = DEPARTMENT_CONFIG[thread.department];
                const hasAttachments = thread.messages.some((m) => (m.attachments?.length || 0) > 0);

                return (
                  <div
                    key={thread.id}
                    onClick={() => handleSelectThread(thread)}
                    className={`group relative flex cursor-pointer gap-3 p-3 sm:p-3.5 transition ${
                      isSelected
                        ? isDark
                          ? "bg-sky-500/10 border-l-2 border-sky-400"
                          : "bg-sky-50/90 border-l-4 border-sky-600 shadow-xs"
                        : isDark
                        ? "hover:bg-white/[0.04]"
                        : "hover:bg-slate-50/80"
                    } ${thread.unread ? "font-semibold" : ""}`}
                  >
                    {/* Star Button */}
                    <button
                      type="button"
                      onClick={(e) => handleToggleStar(thread.id, e)}
                      title={thread.starred ? "Unstar" : "Star"}
                      className="mt-1 text-slate-400 hover:text-amber-500 shrink-0"
                    >
                      <Star
                        className={`h-4 w-4 ${
                          thread.starred ? "text-amber-500 fill-amber-500" : ""
                        }`}
                      />
                    </button>

                    {/* Sender Avatar */}
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-slate-700 to-slate-800 text-xs font-bold text-white border border-white/10 shadow-sm">
                      {thread.customerAvatar || thread.customerName.slice(0, 2).toUpperCase()}
                    </div>

                    {/* Card Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className={`truncate text-xs font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                          {thread.customerName}
                        </span>
                        <span className="shrink-0 text-[10px] text-slate-400">
                          {thread.lastUpdated}
                        </span>
                      </div>

                      <div className="mt-0.5 flex items-center gap-1.5">
                        <span
                          className={`rounded px-1.5 py-0.2 text-[9px] font-bold uppercase ${deptConf?.badgeBg} ${deptConf?.badgeText} border ${deptConf?.borderCol}`}
                        >
                          {deptConf?.label || thread.department}
                        </span>
                        <span className="truncate text-[10px] text-slate-400">
                          {thread.customerEmail}
                        </span>
                      </div>

                      <div className="mt-1 flex items-center justify-between gap-2">
                        <p
                          className={`truncate text-xs ${
                            thread.unread
                              ? isDark
                                ? "text-white font-bold"
                                : "text-slate-950 font-bold"
                              : isDark
                              ? "text-slate-300"
                              : "text-slate-700"
                          }`}
                        >
                          {thread.subject}
                        </p>
                        {hasAttachments && (
                          <Paperclip className="h-3 w-3 shrink-0 text-slate-400" />
                        )}
                      </div>

                      <p className="mt-0.5 line-clamp-1 text-[11px] text-slate-400">
                        {thread.snippet}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </aside>

        {/* ================================================================= */}
        {/* PANE 3: ACTIVE CONVERSATION & REPLY VIEW (flex-1) */}
        {/* ================================================================= */}
        <main
          className={`flex-1 flex-col overflow-hidden transition-colors duration-200 ${
            isDark ? "bg-slate-950" : "bg-slate-50/50"
          } ${
            mobileTab === "conversation"
              ? "flex w-full"
              : "hidden lg:flex"
          }`}
        >
          {selectedThread ? (
            <>
              {/* Conversation Top Header */}
              <div
                className={`flex items-center justify-between border-b p-3 sm:p-4 transition-colors duration-200 ${
                  isDark ? "border-white/10 bg-slate-900/60" : "border-slate-200 bg-white shadow-xs"
                }`}
              >
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  {/* Mobile Back Button */}
                  <button
                    type="button"
                    onClick={() => setMobileTab("threads")}
                    className={`flex items-center gap-1 rounded-xl border p-2 text-xs font-semibold lg:hidden transition ${
                      isDark
                        ? "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                        : "border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                    title="Back to thread list"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span className="hidden xs:inline">Back</span>
                  </button>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className={`truncate text-sm sm:text-base font-bold ${isDark ? "text-white" : "text-slate-950"}`}>
                        {selectedThread.subject}
                      </h2>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[9px] sm:text-[10px] font-bold uppercase shrink-0 ${
                          selectedThread.status === "resolved"
                            ? "bg-emerald-500/20 text-emerald-500 border border-emerald-500/30"
                            : "bg-sky-500/20 text-sky-500 border border-sky-500/30"
                        }`}
                      >
                        {selectedThread.status}
                      </span>
                    </div>

                    <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                      <span className={`font-medium ${isDark ? "text-white" : "text-slate-900"}`}>
                        {selectedThread.customerName} &lt;{selectedThread.customerEmail}&gt;
                      </span>
                      <span className="hidden sm:inline">&bull;</span>
                      <span className="hidden sm:inline-block rounded bg-sky-500/10 px-1.5 py-0.2 text-[10px] font-semibold text-sky-500">
                        {selectedThread.customerPlan}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions: Transfer, Resolve, Star, Trash */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Super Admin Transfer Dropdown */}
                  {isSuperAdmin && (
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setTransferMenuOpen(!transferMenuOpen)}
                        className={`flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-medium transition ${
                          isDark
                            ? "border-white/15 bg-white/5 text-slate-300 hover:bg-white/10"
                            : "border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}
                      >
                        <ArrowRightLeft className="h-3.5 w-3.5 text-sky-500" />
                        <span className="hidden md:inline">Transfer</span>
                      </button>

                      {transferMenuOpen && (
                        <div
                          className={`absolute right-0 top-10 z-50 w-56 rounded-2xl border p-1.5 shadow-2xl backdrop-blur-xl ${
                            isDark
                              ? "border-white/15 bg-slate-900/95 text-white"
                              : "border-slate-200 bg-white/95 text-slate-900"
                          }`}
                        >
                          <div className="px-2.5 py-1 text-[10px] font-bold uppercase text-slate-400">
                            Re-route Department
                          </div>
                          {(["support", "billing", "marketing", "founder_legal"] as const).map(
                            (dept) => (
                              <button
                                key={dept}
                                type="button"
                                onClick={() => handleTransferDepartment(dept)}
                                className={`flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-left text-xs transition ${
                                  isDark ? "hover:bg-white/10" : "hover:bg-slate-100"
                                }`}
                              >
                                <span>{DEPARTMENT_CONFIG[dept].label}</span>
                                <span className="text-[10px] text-slate-400">
                                  {DEPARTMENT_CONFIG[dept].email}
                                </span>
                              </button>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Toggle Resolved */}
                  <button
                    type="button"
                    onClick={handleToggleStatus}
                    className={`flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-medium transition ${
                      isDark
                        ? "border-white/15 bg-white/5 text-slate-300 hover:bg-white/10"
                        : "border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    <CheckCircle2
                      className={`h-3.5 w-3.5 ${
                        selectedThread.status === "resolved" ? "text-emerald-500" : "text-slate-400"
                      }`}
                    />
                    <span className="hidden sm:inline">
                      {selectedThread.status === "resolved" ? "Reopen" : "Resolve"}
                    </span>
                  </button>

                  {/* Star Toggle */}
                  <button
                    type="button"
                    onClick={() => handleToggleStar(selectedThread.id)}
                    title="Star thread"
                    className={`rounded-xl border p-1.5 transition ${
                      isDark
                        ? "border-white/15 bg-white/5 text-slate-300 hover:bg-white/10"
                        : "border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    <Star
                      className={`h-4 w-4 ${
                        selectedThread.starred ? "text-amber-500 fill-amber-500" : "text-slate-400"
                      }`}
                    />
                  </button>

                  {/* Move to Trash */}
                  <button
                    type="button"
                    onClick={handleMoveToTrash}
                    title={selectedThread.folder === "trash" ? "Restore to Inbox" : "Move to Trash"}
                    className={`rounded-xl border p-1.5 transition ${
                      isDark
                        ? "border-white/15 bg-white/5 text-slate-300 hover:bg-rose-500/20 hover:text-rose-400"
                        : "border-slate-200 bg-slate-100 text-slate-700 hover:bg-rose-50 hover:text-rose-600"
                    }`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Message Stream Scroll Area */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
                {selectedThread.messages.map((msg) => {
                  const isAgent = msg.senderType === "agent";
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isAgent ? "items-end" : "items-start"}`}
                    >
                      <div className="flex items-center gap-2 mb-1 text-[11px] text-slate-400">
                        <span className={`font-semibold ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                          {msg.senderName}
                        </span>
                        <span>&bull;</span>
                        <span className="text-[10px] font-mono text-slate-400">{msg.departmentEmail}</span>
                        <span>&bull;</span>
                        <span>{msg.timestamp}</span>
                      </div>

                      <div
                        className={`max-w-2xl rounded-2xl p-4 text-xs leading-relaxed shadow-sm ${
                          isAgent
                            ? "bg-gradient-to-r from-sky-600 to-blue-600 text-white"
                            : isDark
                            ? "bg-slate-900/90 text-slate-200 border border-white/10"
                            : "bg-white text-slate-800 border border-slate-200 shadow-xs"
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.body}</p>

                        {/* Attachments rendering */}
                        {msg.attachments && msg.attachments.length > 0 && (
                          <div
                            className={`mt-3 pt-3 border-t flex flex-wrap gap-2 ${
                              isAgent ? "border-white/20" : isDark ? "border-white/10" : "border-slate-200"
                            }`}
                          >
                            {msg.attachments.map((att, idx) => (
                              <div
                                key={idx}
                                className={`flex items-center gap-2 rounded-xl px-2.5 py-1 text-[11px] ${
                                  isAgent
                                    ? "bg-black/20 text-white"
                                    : isDark
                                    ? "bg-white/5 text-slate-200"
                                    : "bg-slate-100 text-slate-700"
                                }`}
                              >
                                <FileIcon className="h-3.5 w-3.5" />
                                <span className="font-medium truncate max-w-[160px]">{att.name}</span>
                                <span className="text-[10px] opacity-75">({att.size})</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Bottom Reply Area */}
              <div
                className={`border-t p-3 sm:p-4 transition-colors duration-200 ${
                  isDark ? "border-white/10 bg-slate-900/90" : "border-slate-200 bg-white"
                }`}
              >
                {/* Send From Identity Selector */}
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Replying As:</span>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setReplyFromDropdownOpen(!replyFromDropdownOpen)}
                        className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold transition ${
                          isDark
                            ? "border-white/15 bg-white/5 text-white hover:bg-white/10"
                            : "border-slate-200 bg-slate-100 text-slate-900 hover:bg-slate-200"
                        }`}
                      >
                        <span>{OFFICIAL_IDENTITIES.find((i) => i.key === replySendFrom)?.label}</span>
                        <span className="text-sky-500 font-mono text-[11px] hidden sm:inline">
                          &lt;{OFFICIAL_IDENTITIES.find((i) => i.key === replySendFrom)?.email}&gt;
                        </span>
                        <ChevronDown className="h-3 w-3 text-slate-400" />
                      </button>

                      {replyFromDropdownOpen && (
                        <div
                          className={`absolute left-0 bottom-8 z-50 w-72 rounded-2xl border p-1.5 shadow-2xl backdrop-blur-xl ${
                            isDark
                              ? "border-white/15 bg-slate-900/95 text-white"
                              : "border-slate-200 bg-white/95 text-slate-900"
                          }`}
                        >
                          <div className="px-2.5 py-1 text-[10px] font-bold uppercase text-slate-400">
                            Select Dispatch Identity
                          </div>
                          {OFFICIAL_IDENTITIES.map((id) => (
                            <button
                              key={id.key}
                              type="button"
                              onClick={() => {
                                setReplySendFrom(id.key);
                                setReplyFromDropdownOpen(false);
                              }}
                              className={`flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-left text-xs transition ${
                                isDark ? "hover:bg-white/10" : "hover:bg-slate-100"
                              }`}
                            >
                              <div>
                                <div className="font-semibold">{id.label}</div>
                                <div className="text-[10px] text-slate-400">{id.email}</div>
                              </div>
                              {replySendFrom === id.key && <Check className="h-3.5 w-3.5 text-sky-500" />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Canned Templates Dropdown */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setCannedMenuOpen(!cannedMenuOpen)}
                      className="flex items-center gap-1 text-[11px] text-sky-500 hover:underline"
                    >
                      <Sparkles className="h-3 w-3" />
                      <span>Quick Templates</span>
                    </button>

                    {cannedMenuOpen && (
                      <div
                        className={`absolute right-0 bottom-8 z-50 w-72 rounded-2xl border p-1.5 shadow-2xl backdrop-blur-xl ${
                          isDark
                            ? "border-white/15 bg-slate-900/95 text-white"
                            : "border-slate-200 bg-white/95 text-slate-900"
                        }`}
                      >
                        <div className="px-2.5 py-1 text-[10px] font-bold uppercase text-slate-400">
                          Insert Canned Response
                        </div>
                        {CANNED_RESPONSES.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => handleInsertCanned(c)}
                            className={`flex w-full flex-col rounded-xl px-2.5 py-1.5 text-left text-xs transition ${
                              isDark ? "hover:bg-white/10" : "hover:bg-slate-100"
                            }`}
                          >
                            <span className="font-semibold">{c.title}</span>
                            <span className="line-clamp-1 text-[10px] text-slate-400">{c.content}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Reply Attachments preview */}
                {attachments.length > 0 && (
                  <div className="mb-2 flex flex-wrap gap-2">
                    {attachments.map((att, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center gap-1.5 rounded-xl border px-2.5 py-1 text-xs ${
                          isDark
                            ? "border-white/15 bg-white/5 text-slate-200"
                            : "border-slate-200 bg-slate-100 text-slate-700"
                        }`}
                      >
                        <FileIcon className="h-3.5 w-3.5 text-sky-500" />
                        <span className="font-medium truncate max-w-[140px]">{att.filename}</span>
                        <span className="text-[10px] text-slate-400">({att.size})</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveAttachment(idx, false)}
                          className="hover:text-rose-500"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reply Box */}
                <div
                  className={`rounded-2xl border p-2 transition-colors duration-200 ${
                    isDark ? "border-white/15 bg-slate-950/70" : "border-slate-200 bg-slate-50"
                  }`}
                >
                  <div
                    className={`flex items-center gap-1 border-b pb-1.5 text-slate-400 ${
                      isDark ? "border-white/10" : "border-slate-200"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleFormatText(replyInputRef, "**", "**", setReplyText)}
                      className={`rounded p-1 ${isDark ? "hover:bg-white/10 hover:text-white" : "hover:bg-slate-200 hover:text-slate-900"}`}
                      title="Bold"
                    >
                      <Bold className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFormatText(replyInputRef, "_", "_", setReplyText)}
                      className={`rounded p-1 ${isDark ? "hover:bg-white/10 hover:text-white" : "hover:bg-slate-200 hover:text-slate-900"}`}
                      title="Italic"
                    >
                      <Italic className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFormatText(replyInputRef, "\n- ", "", setReplyText)}
                      className={`rounded p-1 ${isDark ? "hover:bg-white/10 hover:text-white" : "hover:bg-slate-200 hover:text-slate-900"}`}
                      title="Bullet List"
                    >
                      <List className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <textarea
                    ref={replyInputRef}
                    rows={3}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={`Write a reply to ${selectedThread.customerEmail}...`}
                    className={`w-full resize-none bg-transparent p-2 text-xs outline-none ${
                      isDark ? "text-white placeholder-slate-500" : "text-slate-900 placeholder-slate-400"
                    }`}
                  />

                  <div
                    className={`flex items-center justify-between pt-2 border-t ${
                      isDark ? "border-white/10" : "border-slate-200"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className={`flex items-center gap-1.5 rounded-xl border px-2.5 py-1 text-xs transition ${
                        isDark
                          ? "border-white/15 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <Paperclip className="h-3.5 w-3.5 text-sky-500" />
                      <span>Attach file</span>
                      {attachments.length > 0 && (
                        <span className="rounded-full bg-sky-500/20 px-1.5 text-[10px] font-bold text-sky-500">
                          {attachments.length}
                        </span>
                      )}
                    </button>

                    <button
                      type="button"
                      disabled={sendingReply || !replyText.trim()}
                      onClick={handleSendReply}
                      className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 px-4 py-1.5 text-xs font-bold text-white shadow-md shadow-sky-950/30 transition hover:brightness-110 disabled:opacity-50"
                    >
                      {sendingReply ? (
                        <>
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          <span>Delivering...</span>
                        </>
                      ) : (
                        <>
                          <Send className="h-3.5 w-3.5" />
                          <span>Send Reply</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center p-8 text-center text-slate-400">
              <Mail className="h-12 w-12 text-slate-400 mb-3" />
              <h3 className={`text-sm font-bold ${isDark ? "text-white" : "text-slate-800"}`}>
                No active conversation selected
              </h3>
              <p className="mt-1 text-xs text-slate-400 max-w-sm">
                Select a thread from the list or click &apos;Compose Email&apos; to dispatch a new message to a client or team member.
              </p>
            </div>
          )}
        </main>
      </div>

      {/* ===================================================================== */}
      {/* 3. GMAIL FLOATING COMPOSE WINDOW (RESPONSIVE & DOCKABLE) */}
      {/* Mobile: Fullscreen modal */}
      {/* Desktop: Docked floating window at bottom-right */}
      {/* ===================================================================== */}
      {isComposeOpen && (
        <div
          className={`fixed z-50 border shadow-2xl transition-all duration-200 flex flex-col ${
            isDark
              ? "bg-slate-900 border-slate-700 text-white"
              : "bg-white border-slate-300 text-slate-900"
          } ${
            isComposeMinimized
              ? "bottom-0 right-4 sm:right-8 w-72 h-11 rounded-t-xl overflow-hidden"
              : isComposeMaximized
              ? "inset-2 sm:inset-6 rounded-2xl overflow-hidden"
              : "inset-0 sm:inset-auto sm:bottom-0 sm:right-8 sm:w-[580px] sm:max-h-[85vh] rounded-none sm:rounded-t-2xl overflow-hidden"
          }`}
        >
          {/* Compose Header Bar */}
          <div
            className={`flex h-11 shrink-0 items-center justify-between border-b px-4 ${
              isDark ? "border-white/10 bg-slate-950 text-white" : "border-slate-200 bg-slate-100 text-slate-900"
            }`}
          >
            <div
              className="flex flex-1 cursor-pointer items-center gap-2"
              onClick={() => setIsComposeMinimized(!isComposeMinimized)}
            >
              <PenSquare className="h-4 w-4 text-sky-500" />
              <span className="text-xs font-bold truncate">
                {composeSubject ? composeSubject : "New Message"}
              </span>
            </div>

            {/* Window Controls */}
            <div className="flex items-center gap-1.5 text-slate-400">
              <button
                type="button"
                onClick={() => setIsComposeMinimized(!isComposeMinimized)}
                title={isComposeMinimized ? "Expand" : "Minimize"}
                className="hidden sm:inline-block rounded p-1 hover:bg-slate-500/10 hover:text-white"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsComposeMaximized(!isComposeMaximized);
                  setIsComposeMinimized(false);
                }}
                title={isComposeMaximized ? "Restore" : "Maximize"}
                className="hidden sm:inline-block rounded p-1 hover:bg-slate-500/10 hover:text-white"
              >
                {isComposeMaximized ? (
                  <Minimize2 className="h-3.5 w-3.5" />
                ) : (
                  <Maximize2 className="h-3.5 w-3.5" />
                )}
              </button>
              <button
                type="button"
                onClick={() => setIsComposeOpen(false)}
                title="Close"
                className="rounded p-1 hover:bg-slate-500/10 hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Compose Form Body (Hidden if minimized) */}
          {!isComposeMinimized && (
            <div
              className={`flex flex-1 flex-col overflow-y-auto p-4 space-y-3 ${
                isDark ? "bg-slate-900/95" : "bg-white"
              }`}
            >
              {/* "From / Send As" Selector */}
              <div
                className={`flex items-center justify-between border-b pb-2 ${
                  isDark ? "border-white/10" : "border-slate-200"
                }`}
              >
                <span className="text-xs font-semibold text-slate-400 w-16">From:</span>
                <div className="relative flex-1">
                  <button
                    type="button"
                    onClick={() => setComposeFromDropdownOpen(!composeFromDropdownOpen)}
                    className={`flex w-full items-center justify-between rounded-xl border px-3 py-1.5 text-xs transition ${
                      isDark
                        ? "border-white/15 bg-white/5 text-white hover:bg-white/10"
                        : "border-slate-200 bg-slate-50 text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="font-bold text-sky-500">
                        {OFFICIAL_IDENTITIES.find((i) => i.key === composeFrom)?.label}
                      </span>
                      <span className="font-mono text-slate-400 text-[11px] truncate">
                        &lt;{OFFICIAL_IDENTITIES.find((i) => i.key === composeFrom)?.email}&gt;
                      </span>
                    </div>
                    <ChevronDown className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  </button>

                  {/* Dropdown Menu */}
                  {composeFromDropdownOpen && (
                    <div
                      className={`absolute left-0 top-10 z-50 w-full rounded-2xl border p-2 shadow-2xl backdrop-blur-xl ${
                        isDark
                          ? "border-white/15 bg-slate-950 text-white"
                          : "border-slate-200 bg-white text-slate-900"
                      }`}
                    >
                      <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Choose Dispatch Identity
                      </div>
                      {OFFICIAL_IDENTITIES.map((id) => (
                        <button
                          key={id.key}
                          type="button"
                          onClick={() => {
                            setComposeFrom(id.key);
                            setComposeFromDropdownOpen(false);
                          }}
                          className={`flex w-full items-center justify-between rounded-xl p-2.5 text-left text-xs transition ${
                            composeFrom === id.key
                              ? "bg-sky-500/20 font-semibold"
                              : isDark
                              ? "hover:bg-white/5"
                              : "hover:bg-slate-100"
                          }`}
                        >
                          <div>
                            <div className="font-semibold">{id.label}</div>
                            <div className="text-[11px] font-mono text-sky-500">{id.email}</div>
                            <div className="text-[10px] text-slate-400 mt-0.5">{id.desc}</div>
                          </div>
                          {composeFrom === id.key && <Check className="h-4 w-4 text-sky-500" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* "To" Field with CC/BCC triggers */}
              <div
                className={`flex items-center border-b pb-2 ${
                  isDark ? "border-white/10" : "border-slate-200"
                }`}
              >
                <span className="text-xs font-semibold text-slate-400 w-16">To:</span>
                <input
                  type="text"
                  value={composeTo}
                  onChange={(e) => setComposeTo(e.target.value)}
                  placeholder="Recipient email(s), comma separated"
                  className={`flex-1 bg-transparent text-xs outline-none ${
                    isDark ? "text-white placeholder-slate-500" : "text-slate-900 placeholder-slate-400"
                  }`}
                />
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  {!showCc && (
                    <button
                      type="button"
                      onClick={() => setShowCc(true)}
                      className="hover:text-sky-500 px-1.5 py-0.5 rounded"
                    >
                      Cc
                    </button>
                  )}
                  {!showBcc && (
                    <button
                      type="button"
                      onClick={() => setShowBcc(true)}
                      className="hover:text-sky-500 px-1.5 py-0.5 rounded"
                    >
                      Bcc
                    </button>
                  )}
                </div>
              </div>

              {/* "Cc" Line (if active) */}
              {showCc && (
                <div
                  className={`flex items-center border-b pb-2 animate-in fade-in ${
                    isDark ? "border-white/10" : "border-slate-200"
                  }`}
                >
                  <span className="text-xs font-semibold text-slate-400 w-16">Cc:</span>
                  <input
                    type="text"
                    value={composeCc}
                    onChange={(e) => setComposeCc(e.target.value)}
                    placeholder="Carbon copy recipients"
                    className={`flex-1 bg-transparent text-xs outline-none ${
                      isDark ? "text-white placeholder-slate-500" : "text-slate-900 placeholder-slate-400"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setShowCc(false);
                      setComposeCc("");
                    }}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}

              {/* "Bcc" Line (if active) */}
              {showBcc && (
                <div
                  className={`flex items-center border-b pb-2 animate-in fade-in ${
                    isDark ? "border-white/10" : "border-slate-200"
                  }`}
                >
                  <span className="text-xs font-semibold text-slate-400 w-16">Bcc:</span>
                  <input
                    type="text"
                    value={composeBcc}
                    onChange={(e) => setComposeBcc(e.target.value)}
                    placeholder="Blind copy recipients"
                    className={`flex-1 bg-transparent text-xs outline-none ${
                      isDark ? "text-white placeholder-slate-500" : "text-slate-900 placeholder-slate-400"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setShowBcc(false);
                      setComposeBcc("");
                    }}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}

              {/* Subject Field */}
              <div
                className={`flex items-center border-b pb-2 ${
                  isDark ? "border-white/10" : "border-slate-200"
                }`}
              >
                <span className="text-xs font-semibold text-slate-400 w-16">Subject:</span>
                <input
                  type="text"
                  value={composeSubject}
                  onChange={(e) => setComposeSubject(e.target.value)}
                  placeholder="Email subject line"
                  className={`flex-1 bg-transparent text-xs font-semibold outline-none ${
                    isDark ? "text-white placeholder-slate-500" : "text-slate-900 placeholder-slate-400"
                  }`}
                />
              </div>

              {/* Formatting Toolbar */}
              <div
                className={`flex items-center justify-between border-b pb-1.5 text-slate-400 ${
                  isDark ? "border-white/10" : "border-slate-200"
                }`}
              >
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleFormatText(composeBodyRef, "**", "**", setComposeBody)}
                    className="rounded p-1 hover:text-sky-500"
                    title="Bold"
                  >
                    <Bold className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFormatText(composeBodyRef, "_", "_", setComposeBody)}
                    className="rounded p-1 hover:text-sky-500"
                    title="Italic"
                  >
                    <Italic className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFormatText(composeBodyRef, "\n- ", "", setComposeBody)}
                    className="rounded p-1 hover:text-sky-500"
                    title="Bullet List"
                  >
                    <List className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Canned Templates */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setComposeCannedOpen(!composeCannedOpen)}
                    className="flex items-center gap-1 text-[11px] text-sky-500 hover:underline"
                  >
                    <Sparkles className="h-3 w-3" />
                    <span>Templates</span>
                  </button>

                  {composeCannedOpen && (
                    <div
                      className={`absolute right-0 top-6 z-50 w-72 rounded-2xl border p-2 shadow-2xl backdrop-blur-xl ${
                        isDark
                          ? "border-white/15 bg-slate-950 text-white"
                          : "border-slate-200 bg-white text-slate-900"
                      }`}
                    >
                      <div className="px-2.5 py-1 text-[10px] font-bold uppercase text-slate-400">
                        Insert Studio Template
                      </div>
                      {CANNED_RESPONSES.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => handleInsertComposeCanned(c)}
                          className={`flex w-full flex-col rounded-xl px-2.5 py-1.5 text-left text-xs transition ${
                            isDark ? "hover:bg-white/10" : "hover:bg-slate-100"
                          }`}
                        >
                          <span className="font-semibold">{c.title}</span>
                          <span className="line-clamp-1 text-[10px] text-slate-400">{c.content}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Message Body Area */}
              <textarea
                ref={composeBodyRef}
                rows={isComposeMaximized ? 18 : 8}
                value={composeBody}
                onChange={(e) => setComposeBody(e.target.value)}
                placeholder="Compose your message here..."
                className={`w-full resize-none bg-transparent text-xs leading-relaxed outline-none ${
                  isDark ? "text-white placeholder-slate-500" : "text-slate-900 placeholder-slate-400"
                }`}
              />

              {/* Attachments preview */}
              {composeAttachments.length > 0 && (
                <div
                  className={`flex flex-wrap gap-2 pt-2 border-t ${
                    isDark ? "border-white/10" : "border-slate-200"
                  }`}
                >
                  {composeAttachments.map((att, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center gap-1.5 rounded-xl border px-2.5 py-1 text-xs ${
                        isDark
                          ? "border-white/15 bg-white/5 text-slate-200"
                          : "border-slate-200 bg-slate-100 text-slate-700"
                      }`}
                    >
                      <FileIcon className="h-3.5 w-3.5 text-sky-500" />
                      <span className="font-medium truncate max-w-[150px]">{att.filename}</span>
                      <span className="text-[10px] text-slate-400">({att.size})</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAttachment(idx, true)}
                        className="hover:text-rose-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Bottom Actions Row */}
              <div
                className={`flex items-center justify-between pt-3 border-t ${
                  isDark ? "border-white/10" : "border-slate-200"
                }`}
              >
                <div className="flex items-center gap-2">
                  {/* Primary Send Button */}
                  <button
                    type="button"
                    disabled={isSendingCompose || !composeTo.trim() || !composeSubject.trim()}
                    onClick={handleSendCompose}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-sky-950/40 transition hover:brightness-110 disabled:opacity-50"
                  >
                    {isSendingCompose ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        <span>Sending Live Mail...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-3.5 w-3.5" />
                        <span>Send Mail</span>
                      </>
                    )}
                  </button>

                  {/* Attachment Button */}
                  <button
                    type="button"
                    onClick={() => composeFileInputRef.current?.click()}
                    title="Attach files"
                    className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition ${
                      isDark
                        ? "border-white/15 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
                        : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <Paperclip className="h-4 w-4 text-sky-500" />
                    <span>Attach</span>
                    {composeAttachments.length > 0 && (
                      <span className="rounded-full bg-sky-500/20 px-1.5 text-[10px] font-bold text-sky-500">
                        {composeAttachments.length}
                      </span>
                    )}
                  </button>
                </div>

                {/* Discard Draft Button */}
                <button
                  type="button"
                  onClick={() => {
                    if (confirm("Discard this message?")) {
                      setIsComposeOpen(false);
                      setComposeTo("");
                      setComposeSubject("");
                      setComposeBody("");
                      setComposeAttachments([]);
                    }
                  }}
                  title="Discard Draft"
                  className="rounded-xl p-2 text-slate-400 hover:bg-slate-500/10 hover:text-rose-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
