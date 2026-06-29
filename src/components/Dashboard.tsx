import React, { useState, useEffect } from "react";
import { CivicIssue, UserProfile } from "../types";
import CustomMap from "./CustomMap";
import {
  Search,
  Filter,
  ArrowUp,
  MessageSquare,
  Sparkles,
  Calendar,
  User,
  Activity,
  CheckCircle,
  Clock,
  AlertTriangle,
  Send,
  Share2,
  Bookmark,
  ShieldCheck,
  CheckCircle2
} from "lucide-react";

interface DashboardProps {
  issues: CivicIssue[];
  user: UserProfile;
  onUpvote: (id: string) => void;
  onVerify: (id: string, isPositive: boolean) => void;
  onAddComment: (id: string, text: string) => void;
  darkMode: boolean;
  onNavigateToReport: () => void;
}

export default function Dashboard({
  issues,
  user,
  onUpvote,
  onVerify,
  onAddComment,
  darkMode,
  onNavigateToReport
}: DashboardProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedIssueId, setSelectedIssueId] = useState<string | undefined>(
    issues.length > 0 ? issues[0].id : undefined
  );
  const [commentText, setCommentText] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Active highlighted issue
  const activeIssue = issues.find((i) => i.id === selectedIssueId) || issues[0];

  // Auto-select first issue if selected one is removed or on init
  useEffect(() => {
    if (issues.length > 0 && !selectedIssueId) {
      setSelectedIssueId(issues[0].id);
    }
  }, [issues, selectedIssueId]);

  // Handle share click copy
  const handleShare = (id: string) => {
    const url = `${window.location.origin}/#issue/${id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  // Filter issues
  const filteredIssues = issues.filter((issue) => {
    const matchesSearch =
      issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || issue.category === selectedCategory;
    const matchesStatus = selectedStatus === "All" || issue.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Calculate stats
  const totalReports = issues.length;
  const pendingCount = issues.filter((i) => i.status !== "Resolved").length;
  const resolvedCount = issues.filter((i) => i.status === "Resolved").length;
  const criticalCount = issues.filter((i) => i.severity === "Critical" && i.status !== "Resolved").length;
  const resolutionRate = totalReports > 0 ? Math.round((resolvedCount / totalReports) * 100) : 100;

  // Group categories for custom SVG chart
  const categoryCounts: Record<string, number> = {};
  issues.forEach((i) => {
    categoryCounts[i.category] = (categoryCounts[i.category] || 0) + 1;
  });

  const categories = [
    "Pothole",
    "Garbage",
    "Water Leakage",
    "Broken Streetlight",
    "Damaged Road",
    "Drainage Problem",
    "Illegal Dumping",
    "Fallen Tree"
  ];

  // Custom Leaderboard list
  const leaders = [
    { name: "Sanjusri Patel", points: user.points, level: user.level, avatar: user.avatar, badge: "City Legend" },
    { name: "Alex Chen", points: 340, level: "Community Hero", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Alex", badge: "Eagle Eye" },
    { name: "Sophia Patel", points: 215, level: "Community Hero", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Sophia", badge: "First Responder" },
    { name: "Chloe Wong", points: 95, level: "Volunteer", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Chloe", badge: "Pavement Scout" }
  ];

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !activeIssue) return;
    onAddComment(activeIssue.id, commentText);
    setCommentText("");
  };

  // Helper for severity badges
  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "Critical": return "bg-[#F16A6A]/10 text-[#F16A6A] border-[#F16A6A]/30";
      case "High": return "bg-[#FF8A65]/10 text-[#FF8A65] border-[#FF8A65]/30";
      case "Medium": return "bg-[#F6B756]/10 text-[#F6B756] border-[#F6B756]/30";
      default: return "bg-[#FFD6C9]/20 text-[#FF8A65] border-[#FFD6C9]/40";
    }
  };

  // Helper for priority indicator
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "Immediate": return "text-white bg-gradient-to-r from-[#F16A6A] to-[#FF8A65]";
      case "High": return "text-[#FF8A65] bg-[#FFF0EB] border-[#FF8A65]";
      default: return "text-[#777777] bg-neutral-100 border-neutral-300 dark:bg-neutral-800 dark:border-neutral-700";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-300 text-left bg-[#FFF8F5] dark:bg-[#1C1715]">
      
      {/* 1. OVERVIEW STATISTICS PANEL */}
      <section className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        
        {/* Total reports */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#221C1A] border border-[#F2D5CC] dark:border-[#3E302C] shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-[#FFF0EB] dark:bg-[#3E2925] text-[#FF6B6B]">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-[11px] font-bold text-[#777777] dark:text-[#A89F9D] uppercase tracking-wider">Total Reports</span>
            <span className="text-2xl font-extrabold text-[#3A3A3A] dark:text-white leading-tight">{totalReports}</span>
          </div>
        </div>

        {/* Pending */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#221C1A] border border-[#F2D5CC] dark:border-[#3E302C] shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-orange-50 dark:bg-[#3E3224] text-[#F6B756]">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-[11px] font-bold text-[#777777] dark:text-[#A89F9D] uppercase tracking-wider">Pending</span>
            <span className="text-2xl font-extrabold text-[#3A3A3A] dark:text-white leading-tight">{pendingCount}</span>
          </div>
        </div>

        {/* Resolved */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#221C1A] border border-[#F2D5CC] dark:border-[#3E302C] shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-green-50 dark:bg-[#203024] text-[#7BC47F]">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-[11px] font-bold text-[#777777] dark:text-[#A89F9D] uppercase tracking-wider">Resolved</span>
            <span className="text-2xl font-extrabold text-[#3A3A3A] dark:text-white leading-tight">{resolvedCount}</span>
          </div>
        </div>

        {/* Critical */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#221C1A] border border-[#F2D5CC] dark:border-[#3E302C] shadow-sm flex items-center gap-4 col-span-1">
          <div className="p-3 rounded-xl bg-red-50 dark:bg-[#3B2222] text-[#F16A6A]">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-[11px] font-bold text-[#777777] dark:text-[#A89F9D] uppercase tracking-wider">Critical Active</span>
            <span className="text-2xl font-extrabold text-[#3A3A3A] dark:text-white leading-tight">{criticalCount}</span>
          </div>
        </div>

        {/* Resolution rate Donut percentage */}
        <div className="p-4 rounded-2xl bg-gradient-to-tr from-[#FF6B6B] via-[#FF8A65] to-[#FFD6C9] text-white shadow-md col-span-2 lg:col-span-1 flex items-center justify-between">
          <div className="text-left">
            <span className="block text-[10px] uppercase tracking-wider font-extrabold opacity-90">Resolution Rate</span>
            <span className="text-3xl font-black mt-1 block">{resolutionRate}%</span>
          </div>
          {/* Svg ring indicator */}
          <div className="relative w-14 h-14 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="28" cy="28" r="22" stroke="rgba(255, 255, 255, 0.25)" strokeWidth="4.5" fill="transparent" />
              <circle
                cx="28"
                cy="28"
                r="22"
                stroke="white"
                strokeWidth="4.5"
                fill="transparent"
                strokeDasharray={138}
                strokeDashoffset={138 - (138 * resolutionRate) / 100}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute text-[10px] font-black">OK</span>
          </div>
        </div>

      </section>

      {/* 2. DYNAMIC WORKSPACE (MAP & ANALYTICS CHARTS) */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        
        {/* Dynamic Vector GIS Map */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center bg-white dark:bg-[#221C1A] p-4 rounded-2xl border border-[#F2D5CC] dark:border-[#3E302C] shadow-sm">
            <div>
              <h2 className="text-base font-extrabold text-[#3A3A3A] dark:text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B6B]"></span> Live Civic Grid
              </h2>
              <p className="text-xs text-[#777777] dark:text-[#A89F9D]">Interact with localized coordinates to view upvoted concerns.</p>
            </div>
            <button
              onClick={onNavigateToReport}
              className="px-3.5 py-1.5 rounded-xl bg-[#FFF0EB] text-[#FF6B6B] hover:bg-[#FFD6C9] transition-all text-xs font-bold border border-[#FFD6C9]"
            >
              + Place Pin
            </button>
          </div>

          <CustomMap
            issues={issues}
            selectedIssueId={selectedIssueId}
            onSelectIssue={(id) => setSelectedIssueId(id)}
            darkMode={darkMode}
          />
        </div>

        {/* Custom High-Fidelity SVG Charts & Leaderboard */}
        <div className="space-y-6">
          
          {/* Resolution Chart */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#221C1A] border border-[#F2D5CC] dark:border-[#3E302C] shadow-sm text-left">
            <h3 className="text-xs font-bold text-[#777777] dark:text-[#A89F9D] uppercase tracking-wider mb-4">Issues by Category Volume</h3>
            <div className="space-y-2.5">
              {categories.slice(0, 5).map((cat) => {
                const count = categoryCounts[cat] || 0;
                const max = Math.max(...Object.values(categoryCounts), 1);
                const percent = (count / max) * 100;
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex justify-between text-[11px] font-semibold text-[#3A3A3A] dark:text-[#E3DCDA]">
                      <span>{cat}</span>
                      <span className="text-[#FF6B6B] font-bold">{count} cases</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#FF6B6B] to-[#FF8A65] rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Leaderboard panel */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#221C1A] border border-[#F2D5CC] dark:border-[#3E302C] shadow-sm text-left">
            <h3 className="text-xs font-bold text-[#777777] dark:text-[#A89F9D] uppercase tracking-wider mb-4">Community Heroes Leaderboard</h3>
            <div className="space-y-3">
              {leaders.map((l, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs pb-2 border-b border-neutral-50 dark:border-neutral-800 last:border-0 last:pb-0">
                  <div className="flex items-center gap-2.5">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${idx === 0 ? "bg-[#FFD6C9] text-[#FF6B6B]" : "bg-neutral-100 text-[#777777] dark:bg-neutral-800"}`}>
                      {idx + 1}
                    </span>
                    <img src={l.avatar} className="w-7 h-7 rounded-full bg-[#FFF0EB] border border-[#F2D5CC]" alt="" />
                    <div>
                      <span className="font-extrabold text-[#3A3A3A] dark:text-white block leading-none">{l.name}</span>
                      <span className="text-[9px] text-[#777777] dark:text-[#A89F9D]">{l.level}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="block font-bold text-[#FF6B6B]">{l.points} pts</span>
                    <span className="block text-[9px] font-semibold text-green-500">{l.badge}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* 3. SEARCH, FILTER & SPLIT WORKSPACE */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Filtered Issue Feed List */}
        <div className="lg:col-span-1 space-y-4">
          
          {/* Controllers */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#221C1A] border border-[#F2D5CC] dark:border-[#3E302C] shadow-sm space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-[#777777] dark:text-[#A89F9D] absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search description, area..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-[#FFF8F5] dark:bg-[#2C211E] border border-[#F2D5CC] dark:border-[#3E302C] text-[#3A3A3A] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#FF6B6B]"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[9px] font-bold text-[#777777] dark:text-[#A89F9D] uppercase mb-1">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-2 py-1.5 rounded-lg text-[11px] bg-[#FFF8F5] dark:bg-[#2C211E] border border-[#F2D5CC] dark:border-[#3E302C] text-[#3A3A3A] dark:text-white focus:outline-none"
                >
                  <option value="All">All Categories</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[9px] font-bold text-[#777777] dark:text-[#A89F9D] uppercase mb-1">Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-2 py-1.5 rounded-lg text-[11px] bg-[#FFF8F5] dark:bg-[#2C211E] border border-[#F2D5CC] dark:border-[#3E302C] text-[#3A3A3A] dark:text-white focus:outline-none"
                >
                  <option value="All">All Statuses</option>
                  <option value="Reported">Reported</option>
                  <option value="AI Verified">AI Verified</option>
                  <option value="Community Verified">Community Verified</option>
                  <option value="Assigned">Assigned</option>
                  <option value="Work Started">Work Started</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>
            </div>
          </div>

          {/* Issue Cards Stack */}
          <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1">
            {filteredIssues.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#777777] bg-white dark:bg-[#221C1A] rounded-2xl border border-neutral-100">
                No reports match your filters.
              </div>
            ) : (
              filteredIssues.map((issue) => {
                const isSelected = issue.id === selectedIssueId;
                const dateString = new Date(issue.reportedAt).toLocaleDateString([], { month: "short", day: "numeric" });
                return (
                  <div
                    key={issue.id}
                    onClick={() => setSelectedIssueId(issue.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-white dark:bg-[#2A211E] border-[#FF6B6B] shadow-md scale-[1.01]"
                        : "bg-white dark:bg-[#221C1A] border-[#F2D5CC] dark:border-[#3E302C] hover:border-[#FFD6C9] shadow-sm"
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#FFF0EB] text-[#FF6B6B] dark:bg-[#3E2925]">
                        {issue.category}
                      </span>
                      <span className="text-[10px] text-[#777777] dark:text-[#A89F9D] font-mono">{dateString}</span>
                    </div>
                    
                    <h4 className="text-xs font-bold text-[#3A3A3A] dark:text-white mt-2 line-clamp-1">
                      {issue.title}
                    </h4>
                    
                    <p className="text-[11px] text-[#777777] dark:text-[#A89F9D] line-clamp-2 mt-1 leading-relaxed">
                      {issue.description}
                    </p>

                    <div className="flex justify-between items-center mt-3 pt-2 border-t border-neutral-50 dark:border-neutral-800 text-[10px]">
                      <span className="font-semibold text-neutral-500 truncate max-w-[120px]">📍 {issue.address.split(",")[0]}</span>
                      <div className="flex gap-2 font-bold text-[#FF6B6B]">
                        <span>▲ {issue.upvotes} upvotes</span>
                        <span>💬 {issue.comments.length}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: High-Fidelity Active Issue Detail Dashboard */}
        <div className="lg:col-span-2">
          {activeIssue ? (
            <div className="rounded-2xl border border-[#F2D5CC] dark:border-[#3E302C] bg-white dark:bg-[#221C1A] overflow-hidden shadow-sm text-left">
              
              {/* Photo Header block */}
              <div className="relative h-48 w-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                <img
                  src={activeIssue.imageUrl || ""}
                  className="w-full h-full object-cover"
                  alt="Civic Issue report upload"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                
                <div className="absolute bottom-4 left-4 right-4 text-white flex justify-between items-end">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider bg-[#FF6B6B] uppercase">
                      {activeIssue.category}
                    </span>
                    <h3 className="text-base sm:text-lg font-black mt-1.5 leading-tight text-white drop-shadow-sm">
                      {activeIssue.title}
                    </h3>
                  </div>
                  
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider ${getSeverityBadge(activeIssue.severity)}`}>
                    {activeIssue.severity} Severity
                  </span>
                </div>
              </div>

              {/* Main Metadata Panel */}
              <div className="p-6 space-y-6">
                
                {/* AI Analysis Cards Container */}
                <div className="p-4 rounded-xl bg-gradient-to-tr from-[#FFFDFB] to-[#FFF5F2] dark:from-[#2B2321] dark:to-[#221B19] border border-[#FFD6C9] dark:border-[#3E2925]">
                  <div className="flex justify-between items-start">
                    <span className="text-[11px] font-extrabold text-[#FF6B6B] tracking-wider uppercase flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: "3s" }} /> Google Gemini Diagnostics
                    </span>
                    <span className="text-[10px] font-mono text-[#777777] dark:text-[#A89F9D]">
                      Confidence: {Math.round((activeIssue.aiConfidence || 0.9) * 100)}%
                    </span>
                  </div>

                  <p className="text-[11px] text-[#3A3A3A] dark:text-[#E3DCDA] leading-relaxed mt-2.5 italic">
                    "{activeIssue.aiSummary || "AI categorizing is verifying localized street assets."}"
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-3 border-t border-[#F2D5CC]/30">
                    <div className="text-[11px]">
                      <span className="block text-[9px] uppercase tracking-wider text-[#777777] dark:text-[#A89F9D] font-bold">Assigned Department</span>
                      <span className="font-extrabold text-[#3A3A3A] dark:text-[#E3DCDA] block mt-0.5">{activeIssue.department}</span>
                    </div>

                    <div className="text-[11px]">
                      <span className="block text-[9px] uppercase tracking-wider text-[#777777] dark:text-[#A89F9D] font-bold">Estimated Priority</span>
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold mt-1 border ${getPriorityBadge(activeIssue.priority)}`}>
                        {activeIssue.priority}
                      </span>
                    </div>
                  </div>

                  {activeIssue.safetyRisk && (
                    <div className="mt-3.5 p-2.5 rounded-lg bg-red-50/70 dark:bg-[#321C1C] border border-red-200/50 dark:border-[#522929] text-[10px] text-red-700 dark:text-red-300 flex gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-[#F16A6A]" />
                      <div>
                        <span className="font-extrabold uppercase tracking-wide block">Public Safety Warning</span>
                        <span className="block mt-0.5 leading-normal">{activeIssue.safetyRisk}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Complaint Core Details */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-[#777777] dark:text-[#A89F9D] uppercase tracking-wider">Citizen Statement</h4>
                  <p className="text-xs text-[#3A3A3A] dark:text-[#E3DCDA] leading-relaxed">
                    {activeIssue.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-y-1 gap-x-4 pt-3 text-[11px] text-[#777777] dark:text-[#A89F9D]">
                    <span>🗣️ Reported by: <strong>{activeIssue.reportedBy}</strong></span>
                    <span>📍 Address: <strong>{activeIssue.address}</strong></span>
                    <span>📅 Date: <strong>{new Date(activeIssue.reportedAt).toLocaleString()}</strong></span>
                  </div>
                </div>

                {/* UPVOTE & VERIFY INTERACTIVE ACTIONS BAR */}
                <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-neutral-50 dark:bg-[#1E1917] border border-neutral-100 dark:border-[#3E302C]">
                  
                  {/* Upvote support */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => onUpvote(activeIssue.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer ${
                        activeIssue.upvotedBy.includes(user.email)
                          ? "bg-gradient-to-r from-[#FF6B6B] to-[#FF8A65] text-white"
                          : "bg-white dark:bg-[#2A2321] text-[#FF6B6B] border border-[#F2D5CC] dark:border-[#3E302C] hover:bg-neutral-100"
                      }`}
                    >
                      ▲ {activeIssue.upvotes} {activeIssue.upvotedBy.includes(user.email) ? "Supported" : "Support Issue"}
                    </button>
                    <span className="text-[10px] text-[#777777] dark:text-[#A89F9D] font-medium hidden sm:inline">Upvote to prioritize this task.</span>
                  </div>

                  {/* Verification checklist */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onVerify(activeIssue.id, true)}
                      className={`px-3 py-2 rounded-xl text-[10px] font-bold border transition-all cursor-pointer ${
                        activeIssue.verifiedBy.includes(user.email)
                          ? "bg-green-500 text-white border-green-500"
                          : "bg-white dark:bg-[#2A2321] text-[#7BC47F] border-[#7BC47F]/40 hover:bg-green-50/20"
                      }`}
                    >
                      ✓ Verify ({activeIssue.verificationCount})
                    </button>
                    
                    <button
                      onClick={() => onVerify(activeIssue.id, false)}
                      className={`px-3 py-2 rounded-xl text-[10px] font-bold border transition-all cursor-pointer ${
                        activeIssue.notValidBy.includes(user.email)
                          ? "bg-[#F16A6A] text-white border-[#F16A6A]"
                          : "bg-white dark:bg-[#2A2321] text-[#F16A6A] border-[#F16A6A]/40 hover:bg-red-50/20"
                      }`}
                    >
                      ⚠ Flag Invalid ({activeIssue.notValidCount})
                    </button>

                    <button
                      onClick={() => handleShare(activeIssue.id)}
                      className="p-2 rounded-xl bg-white dark:bg-[#2A2321] border border-[#F2D5CC] dark:border-[#3E302C] hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer"
                      title="Share link"
                    >
                      {copiedId === activeIssue.id ? (
                        <span className="text-[10px] text-green-500 font-bold">Copied!</span>
                      ) : (
                        <Share2 className="w-4 h-4 text-[#777777] dark:text-[#A89F9D]" />
                      )}
                    </button>
                  </div>

                </div>

                {/* ANIMATED TIMELINE TRACKER PROGRESS */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-[#777777] dark:text-[#A89F9D] uppercase tracking-wider">Complaint Progress Timeline</h4>
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
                    {activeIssue.timeline.map((step, idx) => {
                      const isCompleted = step.completed;
                      const isCurrent = activeIssue.status === step.status;
                      return (
                        <div
                          key={idx}
                          className={`p-3 rounded-xl border text-center transition-all ${
                            isCompleted
                              ? "bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-300"
                              : isCurrent
                              ? "bg-[#FFF0EB] border-[#FF6B6B] text-[#FF6B6B] font-bold"
                              : "bg-neutral-50 dark:bg-neutral-800 border-neutral-100 dark:border-neutral-700 text-[#777777] dark:text-[#A89F9D]"
                          }`}
                        >
                          <span className="block text-[9px] uppercase tracking-wider font-extrabold opacity-60">Step 0{idx + 1}</span>
                          <span className="block text-[11px] font-bold mt-1 truncate">{step.label}</span>
                          <span className="block text-[9px] mt-1 italic opacity-85">{step.date || "Pending"}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* DISCUSSIONS & COMMENTS MODULE */}
                <div className="border-t border-neutral-100 dark:border-neutral-800 pt-6 space-y-4">
                  <h4 className="text-xs font-bold text-[#777777] dark:text-[#A89F9D] uppercase tracking-wider flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-[#FF6B6B]" /> Discussions ({activeIssue.comments.length})
                  </h4>

                  {/* Comment list */}
                  <div className="space-y-3 max-h-48 overflow-y-auto">
                    {activeIssue.comments.length === 0 ? (
                      <p className="text-[11px] text-[#777777] dark:text-[#A89F9D] italic">No public comments yet. Post a comment to start the discussion.</p>
                    ) : (
                      activeIssue.comments.map((comm) => (
                        <div key={comm.id} className="flex gap-2.5 text-xs pb-3 border-b border-neutral-50 dark:border-neutral-800 last:border-0 last:pb-0">
                          <img src={comm.avatar} className="w-7 h-7 rounded-full bg-neutral-100 border border-[#F2D5CC] dark:border-neutral-700" alt="" />
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-[#3A3A3A] dark:text-white">{comm.author}</span>
                              <span className="text-[9px] text-[#777777] dark:text-[#A89F9D]">{new Date(comm.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p className="text-[#3A3A3A] dark:text-[#E3DCDA] leading-relaxed">{comm.text}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Write comment */}
                  <form onSubmit={handlePostComment} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add public community feedback or update..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl text-xs bg-[#FFF8F5] dark:bg-[#2C211E] border border-[#F2D5CC] dark:border-[#3E302C] text-[#3A3A3A] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#FF6B6B]"
                    />
                    <button
                      type="submit"
                      className="p-2.5 rounded-xl bg-gradient-to-r from-[#FF6B6B] to-[#FF8A65] text-white flex items-center justify-center shadow-sm cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>

              </div>

            </div>
          ) : (
            <div className="p-12 text-center text-xs text-[#777777] bg-white dark:bg-[#221C1A] rounded-2xl border border-neutral-100">
              Select an issue from the list or map to view diagnostic reports and comments.
            </div>
          )}
        </div>

      </section>

    </div>
  );
}
