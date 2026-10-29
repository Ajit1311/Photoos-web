"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import {
  Mail,
  Search,
  Filter,
  ShieldCheck,
  User,
  Lock,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Send,
  Paperclip,
  ChevronDown,
  Trash2,
  ArrowRightLeft,
  Inbox,
  Building2,
  ExternalLink,
  Eye,
  RefreshCw,
  FileText,
  Bold,
  Italic,
  List,
  Sparkles,
  Check,
  X,
  Phone,
  HelpCircle,
} from "lucide-react";

import {
  Department,
  UserRole,
  TicketStatus,
  UserProfile,
  EmailThread,
  EmailMessage,
  CannedResponse,
} from "@/types/inbox/helpdesk";

import {
  USER_PROFILES,
  DEPARTMENT_CONFIG,
  INITIAL_THREADS,
  CANNED_RESPONSES,
} from "@/lib/inbox/mock-data";

export default function HelpdeskInbox() {
  // Current Active User (for Role & RBAC switching demo)
  const [currentUser, setCurrentUser] = useState<UserProfile>(USER_PROFILES[0]);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Department Filter
  const [activeDepartment, setActiveDepartment] = useState<Department>("all");

  // Status Filter
  const [statusFilter, setStatusFilter] = useState<TicketStatus>("all");

  // Search Query
  const [searchQuery, setSearchQuery] = useState("");

  // Threads State (persistent in component)
  const [threads, setThreads] = useState<EmailThread[]>(INITIAL_THREADS);

  // Selected Thread ID
  const [selectedThreadId, setSelectedThreadId] = useState<string>(
    INITIAL_THREADS[0].id
  );

  // Reply Draft & Sending State
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [sendSuccessToast, setSendSuccessToast] = useState<string | null>(null);

  // Custom Super Admin "Send From" override (if any)
  const [customSendFrom, setCustomSendFrom] = useState<string | null>(null);

  // Department Transfer Dropdown
  const [transferMenuOpen, setTransferMenuOpen] = useState(false);

  // Canned Responses Dropdown
  const [cannedMenuOpen, setCannedMenuOpen] = useState(false);

  // Textarea Ref for rich controls
  const replyInputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Role permissions check
  const isSuperAdmin = currentUser.role === "SUPER_ADMIN";

  // When switching user role, auto-adjust department if user has restricted access
  const handleUserChange = (profile: UserProfile) => {
    setCurrentUser(profile);
    setUserDropdownOpen(false);
    if (profile.role !== "SUPER_ADMIN") {
      setActiveDepartment(profile.allowedDepartment);
    } else {
      setActiveDepartment("all");
    }
    setCustomSendFrom(null);
  };

  // Determine if active department tab is allowed for current user
  const isDepartmentAllowed = (dept: Department): boolean => {
    if (isSuperAdmin) return true;
    if (dept === "all") return false;
    return currentUser.allowedDepartment === dept;
  };

  // Filter threads by user permission, department tab, status, and search query
  const filteredThreads = useMemo(() => {
    return threads.filter((thread) => {
      // 1. RBAC Restriction: Department agents can only see their department
      if (!isSuperAdmin && thread.department !== currentUser.allowedDepartment) {
        return false;
      }

      // 2. Department Tab Filter
      if (activeDepartment !== "all" && thread.department !== activeDepartment) {
        return false;
      }

      // 3. Status Filter
      if (statusFilter === "unread" && !thread.unread) {
        return false;
      }
      if (statusFilter === "open" && thread.status !== "open") {
        return false;
      }
      if (statusFilter === "resolved" && thread.status !== "resolved") {
        return false;
      }

      // 4. Search Filter
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
  }, [threads, isSuperAdmin, currentUser, activeDepartment, statusFilter, searchQuery]);

  // Active Selected Thread
  const selectedThread = useMemo(() => {
    return threads.find((t) => t.id === selectedThreadId) || null;
  }, [threads, selectedThreadId]);

  // Ensure selected thread is within filtered results when switching views
  useEffect(() => {
    if (filteredThreads.length > 0) {
      const stillVisible = filteredThreads.some((t) => t.id === selectedThreadId);
      if (!stillVisible) {
        setSelectedThreadId(filteredThreads[0].id);
      }
    }
  }, [filteredThreads, selectedThreadId]);

  // Mark thread as read when selected
  const handleSelectThread = (thread: EmailThread) => {
    setSelectedThreadId(thread.id);
    if (thread.unread) {
      setThreads((prev) =>
        prev.map((t) => (t.id === thread.id ? { ...t, unread: false } : t))
      );
    }
  };

  // Auto scroll messages to bottom on thread change or reply
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedThread?.messages.length, selectedThreadId]);

  // Re-assign / Transfer thread department (Super Admin Only)
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

  // Toggle Ticket Status (Open vs Resolved)
  const handleToggleStatus = () => {
    if (!selectedThread) return;
    const nextStatus = selectedThread.status === "resolved" ? "open" : "resolved";
    setThreads((prev) =>
      prev.map((t) =>
        t.id === selectedThread.id ? { ...t, status: nextStatus } : t
      )
    );
  };

  // Mark as Unread
  const handleMarkUnread = () => {
    if (!selectedThread) return;
    setThreads((prev) =>
      prev.map((t) =>
        t.id === selectedThread.id ? { ...t, unread: true } : t
      )
    );
  };

  // Delete Thread
  const handleDeleteThread = () => {
    if (!selectedThread) return;
    const confirmDelete = window.confirm(
      `Are you sure you want to delete thread: "${selectedThread.subject}"?`
    );
    if (!confirmDelete) return;

    setThreads((prev) => prev.filter((t) => t.id !== selectedThread.id));
    if (filteredThreads.length > 1) {
      const nextThread = filteredThreads.find((t) => t.id !== selectedThread.id);
      if (nextThread) setSelectedThreadId(nextThread.id);
    }
  };

  // Insert canned template into reply editor
  const handleInsertCanned = (canned: CannedResponse) => {
    setReplyText((prev) => (prev ? `${prev}\n\n${canned.content}` : canned.content));
    setCannedMenuOpen(false);
    replyInputRef.current?.focus();
  };

  // Formatting helpers
  const handleFormatText = (prefix: string, suffix = prefix) => {
    const el = replyInputRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const text = el.value;
    const selected = text.substring(start, end) || "text";
    const replacement = `${prefix}${selected}${suffix}`;
    const nextVal = text.substring(0, start) + replacement + text.substring(end);
    setReplyText(nextVal);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 0);
  };

  // Computed send-from address
  const activeSendFrom = useMemo(() => {
    if (customSendFrom) return customSendFrom;
    if (!selectedThread) return "support@photoos.in";
    return selectedThread.departmentEmail;
  }, [customSendFrom, selectedThread]);

  // Send Reply Handler
  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedThread) return;

    setSendingReply(true);

    try {
      // 1. Dispatch real email via Resend API
      const deptKey =
        selectedThread.department === "founder_legal"
          ? "founder"
          : selectedThread.department;

      const res = await fetch("/api/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          department: deptKey,
          to: selectedThread.customerEmail,
          subject: `Re: ${selectedThread.subject}`,
          html: `<div style="font-family: sans-serif; line-height: 1.6; color: #1e293b;">
            <p>${replyText.replace(/\n/g, "<br/>")}</p>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
            <p style="font-size: 12px; color: #64748b;">
              Sent by ${currentUser.name} (${activeSendFrom}) &bull; PhotoOS Operations Center
            </p>
          </div>`,
        }),
      });

      if (!res.ok) {
        console.warn("Resend email dispatch returned non-200, continuing in local state.");
      }
    } catch (err) {
      console.warn("Live email dispatch warning (falling back to local state):", err);
    } finally {
      // 2. Append new message to local state thread
      const newMsg: EmailMessage = {
        id: `msg_rep_${Date.now()}`,
        threadId: selectedThread.id,
        senderType: "agent",
        senderName: `${currentUser.name} (${DEPARTMENT_CONFIG[selectedThread.department].label})`,
        senderEmail: activeSendFrom,
        departmentEmail: activeSendFrom,
        timestamp: "Just now",
        body: replyText.trim(),
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

      setReplyText("");
      setSendingReply(false);
      setSendSuccessToast(`Reply dispatched to ${selectedThread.customerEmail} via ${activeSendFrom}`);
      setTimeout(() => setSendSuccessToast(null), 3500);
    }
  };

  // Department counts
  const departmentCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: 0,
      support: 0,
      billing: 0,
      marketing: 0,
      founder_legal: 0,
    };

    threads.forEach((t) => {
      counts.all += 1;
      if (counts[t.department] !== undefined) {
        counts[t.department] += 1;
      }
    });

    return counts;
  }, [threads]);

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-slate-950 font-sans text-slate-100 antialiased selection:bg-sky-500/30 selection:text-white">
      {/* ===================================================================== */}
      {/* 1. TOP BAR / ROLE SWITCHER & DEPARTMENT TABS HEADER */}
      {/* ===================================================================== */}
      <header className="relative z-30 flex h-16 shrink-0 items-center justify-between border-b border-white/10 bg-slate-900/90 px-6 backdrop-blur-md">
        {/* Left: Brand & Inbox Title */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-[#0A3F61] to-[#0d5583] text-sky-400 shadow-lg shadow-sky-950/40 border border-sky-400/20">
            <Mail className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold tracking-tight text-white">
                PhotoOS Multi-Department Helpdesk
              </h1>
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                Resend Live
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Role-Based Email Routing & Ticketing Hub
            </p>
          </div>
        </div>

        {/* Center: Department Filter Tabs */}
        <div className="hidden items-center rounded-xl border border-white/10 bg-slate-950/60 p-1 md:flex">
          {/* ALL TAB (Super Admin only) */}
          {isSuperAdmin && (
            <button
              onClick={() => setActiveDepartment("all")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                activeDepartment === "all"
                  ? "bg-white/15 text-white shadow-sm font-semibold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Inbox className="h-3.5 w-3.5" />
              <span>All Inboxes</span>
              <span className="ml-1 rounded-full bg-white/10 px-1.5 py-0.2 text-[10px] text-slate-300">
                {departmentCounts.all}
              </span>
            </button>
          )}

          {/* SUPPORT TAB */}
          <button
            onClick={() => isDepartmentAllowed("support") && setActiveDepartment("support")}
            disabled={!isDepartmentAllowed("support")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              activeDepartment === "support"
                ? "bg-blue-600 text-white shadow-sm font-semibold"
                : isDepartmentAllowed("support")
                ? "text-slate-400 hover:text-slate-200"
                : "cursor-not-allowed opacity-30 text-slate-600"
            }`}
          >
            <span>Support</span>
            {!isDepartmentAllowed("support") && <Lock className="h-3 w-3" />}
            <span className="ml-1 rounded-full bg-white/10 px-1.5 py-0.2 text-[10px]">
              {departmentCounts.support}
            </span>
          </button>

          {/* BILLING TAB */}
          <button
            onClick={() => isDepartmentAllowed("billing") && setActiveDepartment("billing")}
            disabled={!isDepartmentAllowed("billing")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              activeDepartment === "billing"
                ? "bg-amber-600 text-white shadow-sm font-semibold"
                : isDepartmentAllowed("billing")
                ? "text-slate-400 hover:text-slate-200"
                : "cursor-not-allowed opacity-30 text-slate-600"
            }`}
          >
            <span>Billing</span>
            {!isDepartmentAllowed("billing") && <Lock className="h-3 w-3" />}
            <span className="ml-1 rounded-full bg-white/10 px-1.5 py-0.2 text-[10px]">
              {departmentCounts.billing}
            </span>
          </button>

          {/* MARKETING TAB */}
          <button
            onClick={() => isDepartmentAllowed("marketing") && setActiveDepartment("marketing")}
            disabled={!isDepartmentAllowed("marketing")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              activeDepartment === "marketing"
                ? "bg-purple-600 text-white shadow-sm font-semibold"
                : isDepartmentAllowed("marketing")
                ? "text-slate-400 hover:text-slate-200"
                : "cursor-not-allowed opacity-30 text-slate-600"
            }`}
          >
            <span>Marketing</span>
            {!isDepartmentAllowed("marketing") && <Lock className="h-3 w-3" />}
            <span className="ml-1 rounded-full bg-white/10 px-1.5 py-0.2 text-[10px]">
              {departmentCounts.marketing}
            </span>
          </button>

          {/* FOUNDER & LEGAL TAB (Super Admin only) */}
          <button
            onClick={() => isDepartmentAllowed("founder_legal") && setActiveDepartment("founder_legal")}
            disabled={!isDepartmentAllowed("founder_legal")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              activeDepartment === "founder_legal"
                ? "bg-slate-700 text-white shadow-sm font-semibold"
                : isDepartmentAllowed("founder_legal")
                ? "text-slate-400 hover:text-slate-200"
                : "cursor-not-allowed opacity-30 text-slate-600"
            }`}
          >
            <span>Founder/Legal</span>
            {!isDepartmentAllowed("founder_legal") && <Lock className="h-3 w-3" />}
            <span className="ml-1 rounded-full bg-white/10 px-1.5 py-0.2 text-[10px]">
              {departmentCounts.founder_legal}
            </span>
          </button>
        </div>

        {/* Right: Active Role & User Switcher Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="flex items-center gap-2.5 rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 transition hover:bg-white/10"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500/20 text-xs font-bold text-sky-400 border border-sky-400/30">
              {currentUser.avatar}
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-white">
                  {currentUser.name}
                </span>
                <span
                  className={`rounded-md px-1.5 py-0.2 text-[9px] font-bold tracking-wider uppercase ${
                    isSuperAdmin
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      : "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                  }`}
                >
                  {currentUser.roleTitle}
                </span>
              </div>
              <div className="text-[10px] text-slate-400">{currentUser.email}</div>
            </div>
            <ChevronDown className="h-4 w-4 text-slate-400" />
          </button>

          {/* User Profile Switcher Menu */}
          {userDropdownOpen && (
            <div className="absolute right-0 mt-2 w-80 overflow-hidden rounded-2xl border border-white/15 bg-slate-900 p-2 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 z-50">
              <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-white/10">
                Demo Role Switcher (RBAC)
              </div>
              <div className="mt-1 space-y-1">
                {USER_PROFILES.map((profile) => (
                  <button
                    key={profile.id}
                    onClick={() => handleUserChange(profile)}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs transition ${
                      currentUser.id === profile.id
                        ? "bg-sky-500/15 text-white font-semibold"
                        : "text-slate-300 hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-[11px] font-bold">
                        {profile.avatar}
                      </div>
                      <div>
                        <div className="font-medium text-white">{profile.name}</div>
                        <div className="text-[10px] text-slate-400">
                          {profile.roleTitle} &bull; {profile.email}
                        </div>
                      </div>
                    </div>
                    {currentUser.id === profile.id && (
                      <Check className="h-4 w-4 text-sky-400" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Toast Notification */}
      {sendSuccessToast && (
        <div className="absolute top-20 right-6 z-50 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-950/90 px-4 py-2.5 text-xs text-emerald-200 shadow-2xl backdrop-blur-md animate-in slide-in-from-top-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{sendSuccessToast}</span>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 2. MAIN 2-PANE WORKSPACE: LEFT THREAD LIST & RIGHT CONVERSATION */}
      {/* ===================================================================== */}
      <div className="flex flex-1 overflow-hidden">
        {/* =================================================================== */}
        {/* LEFT COLUMN: DEPARTMENT-FILTERED THREAD LIST (~380px fixed) */}
        {/* =================================================================== */}
        <aside className="flex w-[380px] shrink-0 flex-col border-r border-white/10 bg-slate-900/50">
          {/* Header with Active Inbox Info */}
          <div className="border-b border-white/10 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  {activeDepartment === "all"
                    ? "All Inboxes"
                    : `${DEPARTMENT_CONFIG[activeDepartment].label} Inbox`}
                </span>
                <span className="rounded-full bg-sky-500/10 px-2 py-0.5 text-[10px] font-semibold text-sky-400 border border-sky-500/20">
                  {filteredThreads.filter((t) => t.unread).length} unread
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                {filteredThreads.length} threads
              </span>
            </div>

            {/* Department email subtitle */}
            <div className="mt-1 text-[11px] text-slate-400 truncate">
              {activeDepartment === "all"
                ? "Unified platform routing (support, billing, marketing, founder)"
                : DEPARTMENT_CONFIG[activeDepartment].email}
            </div>

            {/* Search Input */}
            <div className="relative mt-3">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search subject, customer, or content..."
                className="w-full rounded-xl border border-white/10 bg-white/5 py-1.5 pl-9 pr-8 text-xs text-white placeholder-slate-500 outline-none transition focus:border-sky-400 focus:bg-white/10"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Ticket Status Filters */}
            <div className="mt-3 flex items-center gap-1.5">
              {(["all", "unread", "open", "resolved"] as TicketStatus[]).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-medium capitalize transition ${
                    statusFilter === st
                      ? "bg-white/15 text-white font-semibold"
                      : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Scrollable Thread Cards List */}
          <div className="flex-1 overflow-y-auto divide-y divide-white/5">
            {filteredThreads.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400">
                <Inbox className="h-8 w-8 text-slate-600 mb-2" />
                <p className="text-xs font-semibold text-slate-300">No conversations found</p>
                <p className="mt-1 text-[11px] text-slate-500">
                  {searchQuery
                    ? "Try adjusting your search criteria"
                    : !isSuperAdmin
                    ? `Only assigned to ${currentUser.allowedDepartment} are visible to you.`
                    : "No threads matching this status."}
                </p>
              </div>
            ) : (
              filteredThreads.map((thread) => {
                const isSelected = thread.id === selectedThreadId;
                const deptConf = DEPARTMENT_CONFIG[thread.department];

                return (
                  <div
                    key={thread.id}
                    onClick={() => handleSelectThread(thread)}
                    className={`group relative flex cursor-pointer gap-3 p-4 transition ${
                      isSelected
                        ? "bg-sky-500/10 border-l-4 border-sky-400"
                        : "hover:bg-white/[0.03] border-l-4 border-transparent"
                    } ${thread.unread ? "bg-white/[0.02]" : ""}`}
                  >
                    {/* Customer Initials Avatar */}
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-xs font-bold text-slate-200 border border-white/10">
                      {thread.customerAvatar || thread.customerName.slice(0, 2).toUpperCase()}
                    </div>

                    {/* Card Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span
                          className={`text-xs truncate ${
                            thread.unread
                              ? "font-bold text-white"
                              : "font-medium text-slate-300"
                          }`}
                        >
                          {thread.customerName}
                        </span>
                        <span className="text-[10px] text-slate-500 shrink-0">
                          {thread.lastUpdated}
                        </span>
                      </div>

                      {/* Department Badge & Status */}
                      <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`rounded-md px-1.5 py-0.5 text-[9px] font-semibold border ${deptConf.badgeBg} ${deptConf.badgeText} ${deptConf.borderCol}`}
                        >
                          {deptConf.label}
                        </span>

                        <span className="rounded-md bg-white/5 px-1.5 py-0.5 text-[9px] text-slate-400 border border-white/5">
                          {thread.customerPlan}
                        </span>

                        {thread.status === "resolved" && (
                          <span className="rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[9px] text-emerald-400 border border-emerald-500/20">
                            Resolved
                          </span>
                        )}

                        {thread.priority === "urgent" && (
                          <span className="rounded-md bg-rose-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-rose-400 border border-rose-500/20">
                            Urgent
                          </span>
                        )}
                      </div>

                      {/* Subject Line */}
                      <div
                        className={`mt-1 text-xs truncate ${
                          thread.unread ? "font-bold text-white" : "text-slate-200"
                        }`}
                      >
                        {thread.subject}
                      </div>

                      {/* Preview Snippet */}
                      <p className="mt-0.5 line-clamp-2 text-[11px] text-slate-400">
                        {thread.snippet}
                      </p>
                    </div>

                    {/* Unread indicator dot */}
                    {thread.unread && (
                      <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-sky-400 ring-2 ring-slate-900" />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </aside>

        {/* =================================================================== */}
        {/* RIGHT PANE: ACTIVE CONVERSATION & DEPARTMENT REPLY VIEW (flex-1) */}
        {/* =================================================================== */}
        <main className="flex flex-1 flex-col overflow-hidden bg-slate-950">
          {selectedThread ? (
            <>
              {/* TOP CONVERSATION HEADER */}
              <div className="flex h-20 shrink-0 items-center justify-between border-b border-white/10 bg-slate-900/60 px-6 backdrop-blur-sm">
                <div className="min-w-0 flex-1 pr-4">
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-white truncate">
                      {selectedThread.subject}
                    </h2>
                    <span
                      className={`rounded-md px-2 py-0.5 text-[10px] font-semibold border ${
                        DEPARTMENT_CONFIG[selectedThread.department].badgeBg
                      } ${DEPARTMENT_CONFIG[selectedThread.department].badgeText} ${
                        DEPARTMENT_CONFIG[selectedThread.department].borderCol
                      }`}
                    >
                      {DEPARTMENT_CONFIG[selectedThread.department].label}
                    </span>
                    <span className="rounded-md bg-white/5 px-2 py-0.5 text-[10px] text-slate-300 border border-white/10">
                      {selectedThread.customerPlan}
                    </span>
                  </div>

                  {/* Customer details row */}
                  <div className="mt-1 flex items-center gap-3 text-xs text-slate-400">
                    <span className="font-semibold text-white">
                      {selectedThread.customerName}
                    </span>
                    <span>&bull;</span>
                    <a
                      href={`mailto:${selectedThread.customerEmail}`}
                      className="text-sky-400 hover:underline"
                    >
                      {selectedThread.customerEmail}
                    </a>
                    {selectedThread.customerPhone && (
                      <>
                        <span>&bull;</span>
                        <span className="flex items-center gap-1 text-slate-300">
                          <Phone className="h-3 w-3" />
                          {selectedThread.customerPhone}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Header Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {/* Department Transfer Dropdown (Super Admin only) */}
                  {isSuperAdmin && (
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setTransferMenuOpen(!transferMenuOpen)}
                        className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:bg-white/10"
                      >
                        <ArrowRightLeft className="h-3.5 w-3.5 text-sky-400" />
                        <span>Transfer Dept</span>
                        <ChevronDown className="h-3 w-3 text-slate-400" />
                      </button>

                      {transferMenuOpen && (
                        <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-white/15 bg-slate-900 p-1.5 shadow-2xl backdrop-blur-xl z-50 animate-in fade-in zoom-in-95">
                          <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Re-assign to Department
                          </div>
                          {(
                            ["support", "billing", "marketing", "founder_legal"] as Array<
                              Exclude<Department, "all">
                            >
                          ).map((dept) => {
                            const conf = DEPARTMENT_CONFIG[dept];
                            const isCurrent = selectedThread.department === dept;
                            return (
                              <button
                                key={dept}
                                onClick={() => handleTransferDepartment(dept)}
                                disabled={isCurrent}
                                className={`flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-xs text-left transition ${
                                  isCurrent
                                    ? "bg-white/10 font-bold text-white opacity-60 cursor-default"
                                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                                }`}
                              >
                                <span>{conf.label}</span>
                                <span className="text-[10px] text-slate-500 font-mono">
                                  {conf.email.split("@")[0]}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Mark as Resolved / Reopen */}
                  <button
                    type="button"
                    onClick={handleToggleStatus}
                    className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition ${
                      selectedThread.status === "resolved"
                        ? "border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20"
                        : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
                    }`}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>
                      {selectedThread.status === "resolved" ? "Reopen Ticket" : "Mark Resolved"}
                    </span>
                  </button>

                  {/* Mark Unread */}
                  <button
                    type="button"
                    onClick={handleMarkUnread}
                    title="Mark as unread"
                    className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-slate-400 transition hover:bg-white/10 hover:text-white"
                  >
                    <Mail className="h-3.5 w-3.5" />
                  </button>

                  {/* Delete Thread */}
                  <button
                    type="button"
                    onClick={handleDeleteThread}
                    title="Delete thread"
                    className="flex h-8 w-8 items-center justify-center rounded-xl border border-rose-500/20 bg-rose-500/5 text-rose-400 transition hover:bg-rose-500/15"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* MESSAGE STREAM (Middle Scrollable Section) */}
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                {selectedThread.messages.map((message) => {
                  const isAgent = message.senderType === "agent";

                  return (
                    <div
                      key={message.id}
                      className={`flex gap-3.5 max-w-3xl ${
                        isAgent ? "ml-auto flex-row-reverse" : "mr-auto"
                      }`}
                    >
                      {/* Avatar */}
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold border ${
                          isAgent
                            ? "bg-sky-600/20 text-sky-300 border-sky-500/30"
                            : "bg-slate-800 text-slate-200 border-white/10"
                        }`}
                      >
                        {isAgent ? "PO" : selectedThread.customerAvatar || "CU"}
                      </div>

                      {/* Card Content */}
                      <div
                        className={`rounded-2xl p-4 shadow-sm text-xs leading-relaxed border ${
                          isAgent
                            ? "bg-blue-600/15 border-blue-500/30 text-slate-100"
                            : "bg-white/5 border-white/10 text-slate-200"
                        }`}
                      >
                        {/* Header */}
                        <div className="flex items-center justify-between gap-4 mb-2 pb-2 border-b border-white/10">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white">
                              {message.senderName}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {isAgent ? `via ${message.departmentEmail}` : message.senderEmail}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 shrink-0">
                            {message.timestamp}
                          </span>
                        </div>

                        {/* Body */}
                        <div className="whitespace-pre-line text-slate-200 text-xs">
                          {message.body}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* BOTTOM REPLY EDITOR (Sticky) */}
              <div className="shrink-0 border-t border-white/10 bg-slate-900/80 p-4 backdrop-blur-md">
                {/* Send From Identity Bar */}
                <div className="mb-2.5 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-400">Send From:</span>
                    <span className="rounded-md border border-sky-500/30 bg-sky-500/10 px-2 py-0.5 font-mono text-[11px] font-semibold text-sky-300">
                      PhotoOS {DEPARTMENT_CONFIG[selectedThread.department].label} &lt;{activeSendFrom}&gt;
                    </span>
                    {isSuperAdmin && (
                      <span className="text-[10px] text-slate-500">
                        (Super Admin Identity Authority)
                      </span>
                    )}
                  </div>

                  {/* Canned Responses Dropdown Button */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setCannedMenuOpen(!cannedMenuOpen)}
                      className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-slate-300 hover:bg-white/10 hover:text-white"
                    >
                      <Sparkles className="h-3 w-3 text-amber-400" />
                      <span>Canned Responses</span>
                      <ChevronDown className="h-3 w-3 text-slate-400" />
                    </button>

                    {cannedMenuOpen && (
                      <div className="absolute right-0 bottom-full mb-2 w-80 overflow-hidden rounded-2xl border border-white/15 bg-slate-900 p-2 shadow-2xl backdrop-blur-xl z-50 animate-in fade-in zoom-in-95">
                        <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-white/10">
                          Quick Response Templates
                        </div>
                        <div className="mt-1 space-y-1">
                          {CANNED_RESPONSES.map((canned) => (
                            <button
                              key={canned.id}
                              onClick={() => handleInsertCanned(canned)}
                              className="flex w-full flex-col rounded-xl px-2.5 py-2 text-left transition hover:bg-white/10"
                            >
                              <div className="text-xs font-semibold text-white">
                                {canned.title}
                              </div>
                              <div className="text-[10px] text-slate-400 line-clamp-1">
                                {canned.content}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Editor Textarea */}
                <div className="overflow-hidden rounded-2xl border border-white/15 bg-slate-950 focus-within:border-sky-400">
                  {/* Formatting Toolbar */}
                  <div className="flex items-center gap-1 border-b border-white/10 bg-white/[0.02] px-3 py-1.5 text-slate-400">
                    <button
                      type="button"
                      onClick={() => handleFormatText("**")}
                      title="Bold"
                      className="rounded p-1 hover:bg-white/10 hover:text-white"
                    >
                      <Bold className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFormatText("*")}
                      title="Italic"
                      className="rounded p-1 hover:bg-white/10 hover:text-white"
                    >
                      <Italic className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFormatText("\n- ")}
                      title="Bullet list"
                      className="rounded p-1 hover:bg-white/10 hover:text-white"
                    >
                      <List className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFormatText("`")}
                      title="Inline Code"
                      className="rounded p-1 hover:bg-white/10 hover:text-white"
                    >
                      <FileText className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <textarea
                    ref={replyInputRef}
                    rows={3}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={`Reply to ${selectedThread.customerName} via ${activeSendFrom}...`}
                    className="w-full resize-none bg-transparent p-3 text-xs text-white placeholder-slate-500 outline-none"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                        void handleSendReply();
                      }
                    }}
                  />

                  {/* Actions & Submit Row */}
                  <div className="flex items-center justify-between border-t border-white/10 bg-white/[0.02] px-3 py-2">
                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <Paperclip className="h-3.5 w-3.5 text-slate-400" />
                      <span>Attach file</span>
                      <span className="hidden sm:inline">&bull; Cmd + Enter to send</span>
                    </div>

                    <button
                      type="button"
                      disabled={sendingReply || !replyText.trim()}
                      onClick={handleSendReply}
                      className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 px-4 py-1.5 text-xs font-bold text-white shadow-md shadow-sky-950 transition hover:brightness-110 disabled:opacity-50"
                    >
                      {sendingReply ? (
                        <>
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          <span>Dispatching via Resend...</span>
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
            /* Empty State */
            <div className="flex flex-1 flex-col items-center justify-center p-8 text-center text-slate-400">
              <Mail className="h-12 w-12 text-slate-700 mb-3" />
              <h3 className="text-sm font-bold text-white">No active thread selected</h3>
              <p className="mt-1 text-xs text-slate-400 max-w-sm">
                Select a conversation from the left to read messages and dispatch department replies.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
