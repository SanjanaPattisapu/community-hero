import React from "react";
import { CivicIssue, UserProfile } from "../types";
import { Award, Eye, ShieldAlert, Crown, HelpCircle, Flame, CheckCircle, Activity, Sparkles } from "lucide-react";

interface ProfileProps {
  user: UserProfile;
  issues: CivicIssue[];
  onSelectIssue: (id: string) => void;
  onNavigateToDashboard: () => void;
}

export default function Profile({
  user,
  issues,
  onSelectIssue,
  onNavigateToDashboard
}: ProfileProps) {
  // Filter issues reported by the user
  const userIssues = issues.filter((i) => i.reportedByEmail === user.email);

  // Helper for Badge Icons
  const renderBadgeIcon = (icon: string) => {
    switch (icon) {
      case "ShieldAlert":
        return <ShieldAlert className="w-5 h-5 text-white" />;
      case "Eye":
        return <Eye className="w-5 h-5 text-white" />;
      case "Crown":
        return <Crown className="w-5 h-5 text-white" />;
      default:
        return <Award className="w-5 h-5 text-white" />;
    }
  };

  // Level thresholds
  const levelLimits = {
    Beginner: 50,
    Volunteer: 200,
    "Community Hero": 500,
    "Gold Hero": 1000
  };

  const getNextLevelInfo = (level: string) => {
    switch (level) {
      case "Beginner": return { next: "Volunteer", limit: 50 };
      case "Volunteer": return { next: "Community Hero", limit: 200 };
      case "Community Hero": return { next: "Gold Hero", limit: 500 };
      default: return { next: "Legendary Pioneer", limit: 1000 };
    }
  };

  const levelInfo = getNextLevelInfo(user.level);
  const currentPoints = user.points;
  const nextLevelPercent = Math.min(100, Math.round((currentPoints / levelInfo.limit) * 100));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-300 text-left bg-[#FFF8F5] dark:bg-[#1C1715]">
      
      {/* Header and User Hero card */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start mb-8">
        
        {/* Profile Card */}
        <div className="md:col-span-4 bg-white dark:bg-[#221C1A] p-6 rounded-3xl border border-[#F2D5CC] dark:border-[#3E302C] shadow-sm text-center space-y-4">
          <div className="relative inline-block">
            <img
              src={user.avatar}
              className="w-24 h-24 rounded-full bg-[#FFF0EB] border-4 border-[#FFD6C9] mx-auto"
              alt="Citizen Avatar"
            />
            <div className="absolute bottom-1 right-1 p-1.5 rounded-full bg-gradient-to-tr from-[#FF6B6B] to-[#FF8A65] text-white shadow-md">
              <Award className="w-4 h-4" />
            </div>
          </div>

          <div>
            <h2 className="text-lg font-extrabold text-[#3A3A3A] dark:text-white leading-tight">{user.name}</h2>
            <span className="text-xs text-[#777777] dark:text-[#A89F9D] font-medium">{user.email}</span>
          </div>

          <div className="flex justify-center gap-3 py-1">
            <span className="px-3 py-1 bg-[#FFF0EB] dark:bg-[#3E2925] text-[#FF6B6B] text-xs font-bold rounded-full border border-[#FFD6C9]">
              Level: {user.level}
            </span>
          </div>

          {/* Core Stat grid */}
          <div className="grid grid-cols-3 gap-2 border-t border-b border-neutral-100 dark:border-neutral-800 py-3.5 text-center">
            <div>
              <span className="block text-[10px] uppercase font-bold text-[#777777] dark:text-[#A89F9D]">My Reports</span>
              <span className="text-base font-black text-[#3A3A3A] dark:text-white block mt-1">{userIssues.length}</span>
            </div>
            <div>
              <span className="block text-[10px] uppercase font-bold text-[#777777] dark:text-[#A89F9D]">Verifications</span>
              <span className="text-base font-black text-[#3A3A3A] dark:text-white block mt-1">{user.verificationsCount}</span>
            </div>
            <div>
              <span className="block text-[10px] uppercase font-bold text-[#777777] dark:text-[#A89F9D]">Resolved</span>
              <span className="text-base font-black text-[#3A3A3A] dark:text-white block mt-1">{userIssues.filter(i=>i.status === "Resolved").length}</span>
            </div>
          </div>

          {/* Progress meter to level up */}
          <div className="space-y-1.5 text-left">
            <div className="flex justify-between text-[11px] font-bold">
              <span className="text-[#777777] dark:text-[#A89F9D]">Level Progress</span>
              <span className="text-[#FF6B6B]">{user.points} / {levelInfo.limit} PTS</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden border border-neutral-200/50 dark:border-neutral-700">
              <div
                className="h-full bg-gradient-to-r from-[#FF6B6B] to-[#FF8A65] rounded-full transition-all"
                style={{ width: `${nextLevelPercent}%` }}
              />
            </div>
            <span className="block text-[10px] text-[#777777] dark:text-[#A89F9D] text-center italic mt-1.5">
              Earn {levelInfo.limit - user.points} more points to become a certified **{levelInfo.next}**!
            </span>
          </div>

        </div>

        {/* Badges and Milestones (Right) */}
        <div className="md:col-span-8 bg-white dark:bg-[#221C1A] p-6 rounded-3xl border border-[#F2D5CC] dark:border-[#3E302C] shadow-sm space-y-6">
          
          <div>
            <h3 className="text-sm font-extrabold text-[#777777] dark:text-[#A89F9D] uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#FF6B6B]" /> Unlocked Citizen Achievements
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {user.badges.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#777777] col-span-2">
                  No achievement badges unlocked yet. Start reporting or verifying issues to unlock!
                </div>
              ) : (
                user.badges.map((badge) => (
                  <div key={badge.id} className="p-4 rounded-2xl border border-[#F2D5CC] dark:border-[#3E302C] bg-[#FFFDFD] dark:bg-[#2A2321] flex items-center gap-4 shadow-sm transition-transform hover:scale-[1.01]">
                    <div className="p-3 rounded-2xl bg-gradient-to-tr from-[#FF6B6B] to-[#FF8A65] text-white shadow-sm flex items-center justify-center shrink-0">
                      {renderBadgeIcon(badge.icon)}
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-[#3A3A3A] dark:text-white">{badge.name}</h4>
                      <p className="text-[11px] text-[#777777] dark:text-[#A89F9D] mt-0.5 leading-tight">{badge.description}</p>
                      <span className="block text-[9px] text-[#777777] mt-1.5 italic">Unlocked: {badge.unlockedAt}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Gamification Points Guide */}
          <div className="p-4 rounded-2xl bg-[#FFFBF9] dark:bg-[#1E1917] border border-[#F5DFD9] dark:border-[#3E302C] space-y-2 text-left">
            <h4 className="text-[11px] font-black text-[#FF6B6B] uppercase tracking-wider flex items-center gap-1">
              <Flame className="w-4 h-4" /> Hyperlocal Action Score Matrix
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1 text-[11px] text-[#777777] dark:text-[#A89F9D]">
              <div>
                <span className="block font-bold text-[#3A3A3A] dark:text-white">+15 PTS</span>
                <span className="block text-[10px]">Submit Issue</span>
              </div>
              <div>
                <span className="block font-bold text-[#3A3A3A] dark:text-white">+5 PTS</span>
                <span className="block text-[10px]">Verify Report</span>
              </div>
              <div>
                <span className="block font-bold text-[#3A3A3A] dark:text-white">+3 PTS</span>
                <span className="block text-[10px]">Comment Discussion</span>
              </div>
              <div>
                <span className="block font-bold text-[#3A3A3A] dark:text-white">+50 PTS</span>
                <span className="block text-[10px]">Issue Resolved!</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* 2. USER'S SPECIFIC COMPLAINT HISTORY LIST */}
      <section className="bg-white dark:bg-[#221C1A] p-6 rounded-3xl border border-[#F2D5CC] dark:border-[#3E302C] shadow-sm">
        
        <div className="flex justify-between items-center border-b border-neutral-50 dark:border-neutral-800 pb-4 mb-4">
          <h3 className="text-xs font-bold text-[#777777] uppercase tracking-wider">My Reported Complaints ({userIssues.length})</h3>
          <button
            onClick={onNavigateToDashboard}
            className="text-xs font-bold text-[#FF6B6B] hover:underline"
          >
            Browse all neighborhood cases →
          </button>
        </div>

        {userIssues.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#777777] dark:text-[#A89F9D] space-y-4">
            <p>You haven't reported any local concerns yet. Help clean and repair your neighborhood!</p>
            <button
              onClick={() => onSelectIssue("report")} // Triggers navigation to report tab in app
              className="px-4 py-2 rounded-xl bg-[#FF6B6B] text-white font-bold"
            >
              Report First Concern
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userIssues.map((issue) => {
              const statusColors: Record<string, string> = {
                Reported: "bg-neutral-100 text-[#777777] border-neutral-200 dark:bg-neutral-800",
                "AI Verified": "bg-blue-50 text-blue-600 border-blue-200",
                "Community Verified": "bg-yellow-50 text-yellow-600 border-yellow-200",
                Assigned: "bg-purple-50 text-purple-600 border-purple-200",
                "Work Started": "bg-orange-50 text-orange-600 border-orange-200",
                Resolved: "bg-green-50 text-green-600 border-green-200"
              };

              return (
                <div
                  key={issue.id}
                  onClick={() => {
                    onSelectIssue(issue.id);
                    onNavigateToDashboard();
                  }}
                  className="p-4 rounded-2xl border border-[#F2D5CC] dark:border-[#3E302C] bg-[#FFFDFD] dark:bg-[#2A2321] cursor-pointer shadow-sm hover:scale-[1.01] transition-transform text-left space-y-2.5"
                >
                  <div className="flex justify-between items-start gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#FFF0EB] text-[#FF6B6B]">
                      {issue.category}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${statusColors[issue.status] || ""}`}>
                      {issue.status}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-[#3A3A3A] dark:text-white line-clamp-1">{issue.title}</h4>
                  <p className="text-[11px] text-[#777777] dark:text-[#A89F9D] line-clamp-2 leading-relaxed">{issue.description}</p>

                  <div className="flex justify-between items-center text-[10px] text-[#777777] dark:text-[#A89F9D] pt-2 border-t border-neutral-100 dark:border-neutral-800">
                    <span>📍 {issue.address.split(",")[0]}</span>
                    <span className="font-bold text-[#FF6B6B]">▲ {issue.upvotes} Supports</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </section>

    </div>
  );
}
