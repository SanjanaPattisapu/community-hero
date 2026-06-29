import React, { useState } from "react";
import { AppNotification, UserProfile } from "../types";
import { Bell, Moon, Sun, Award, HelpCircle, ShieldAlert, Check, X, Compass, Menu } from "lucide-react";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  notifications: AppNotification[];
  onMarkNotificationsRead: (id?: string) => void;
  user: UserProfile;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
}

export default function Navbar({
  activeTab,
  setActiveTab,
  notifications,
  onMarkNotificationsRead,
  user,
  darkMode,
  setDarkMode
}: NavbarProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const navItems = [
    { id: "landing", label: "Home" },
    { id: "dashboard", label: "Dashboard & Map" },
    { id: "report", label: "Report Issue" },
    { id: "insights", label: "AI Planning" },
    { id: "profile", label: "My Profile" },
    { id: "admin", label: "Admin Hub" }
  ];

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Gold Hero": return "text-[#FF8A65] bg-[#FFF0EB] border-[#FF8A65] dark:bg-[#322320] dark:border-[#FF8A65]";
      case "Community Hero": return "text-[#FF6B6B] bg-[#FFF4F2] border-[#FF6B6B] dark:bg-[#2C1D1B] dark:border-[#FF6B6B]";
      case "Volunteer": return "text-[#F6B756] bg-[#FFFBF2] border-[#F6B756] dark:bg-[#2B2318] dark:border-[#F6B756]";
      default: return "text-[#777777] bg-[#F5F5F5] border-[#D6D6D6] dark:bg-[#222] dark:border-[#444]";
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-[#F2D5CC] dark:border-[#3E302C] bg-[#FFF8F5]/95 dark:bg-[#1C1715]/95 backdrop-blur-md transition-colors duration-300 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo Brand with Increased Width and Wrapping Prevented */}
          <div 
            className="flex items-center gap-3 shrink-0 cursor-pointer min-w-[200px] sm:min-w-[240px] select-none" 
            onClick={() => {
              setActiveTab("landing");
              setIsMobileMenuOpen(false);
            }}
          >
            <div className="p-2 rounded-xl bg-gradient-to-tr from-[#FF6B6B] via-[#FF8A65] to-[#FFD6C9] flex items-center justify-center shadow-sm shrink-0 animate-pulse" style={{ animationDuration: "3s" }}>
              <Compass className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-lg sm:text-xl font-bold tracking-tight bg-gradient-to-r from-[#FF6B6B] to-[#FF8A65] bg-clip-text text-transparent whitespace-nowrap leading-none mb-1 font-sans">
                Community Hero
              </span>
              <span className="block text-[9px] text-[#777777] dark:text-[#A89F9D] tracking-wider uppercase font-semibold whitespace-nowrap leading-none">
                Hyperlocal AI Solver
              </span>
            </div>
          </div>

          {/* Desktop Navigation Menu (Aligned right with equal spacing) */}
          <div className="hidden lg:flex items-center justify-end flex-1 px-8 space-x-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-300 cursor-pointer whitespace-nowrap ${
                    isActive
                      ? "text-[#FF6B6B] bg-[#FFF0EB] dark:bg-[#322320] scale-[1.02]"
                      : "text-[#3A3A3A] hover:text-[#FF8A65] dark:text-[#E3DCDA] dark:hover:text-[#FF8A65] hover:bg-[#FFFDFD] dark:hover:bg-[#251F1D]"
                  }`}
                >
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="absolute bottom-1.5 left-3.5 right-3.5 h-0.5 bg-[#FF6B6B] rounded-full" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Right Utilities (Rewards points, Alerts, Dark Mode) - Desktop View */}
          <div className="hidden lg:flex items-center gap-4 shrink-0">
            
            {/* Rewards points dashboard */}
            <div
              onClick={() => setActiveTab("profile")}
              className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-[#F2D5CC] dark:border-[#3E302C] bg-white dark:bg-[#221C1A] text-xs cursor-pointer select-none transition-all duration-300 hover:scale-[1.03] hover:border-[#FF8A65] shadow-sm"
              title="Click to view Citizen rewards dashboard"
            >
              <div className="p-1 rounded-full bg-[#FFD6C9] dark:bg-[#3A241F] text-[#FF6B6B]">
                <Award className="w-3.5 h-3.5" />
              </div>
              <div className="text-left leading-none">
                <span className="block text-[9px] uppercase tracking-wider font-bold text-[#777777] dark:text-[#A89F9D]">Rewards</span>
                <span className="text-xs font-extrabold text-[#3A3A3A] dark:text-[#E3DCDA]">
                  {user.points} <span className="text-[10px] text-[#FF6B6B] font-medium">PTS</span>
                </span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${getLevelColor(user.level)}`}>
                {user.level}
              </span>
            </div>

            {/* Notifications panel */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2.5 rounded-full bg-white dark:bg-[#221C1A] border border-[#F2D5CC] dark:border-[#3E302C] hover:bg-neutral-50 dark:hover:bg-[#2C211E]/45 hover:border-[#FF8A65] text-[#3A3A3A] dark:text-[#E3DCDA] transition-all relative cursor-pointer shadow-sm"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#FF6B6B] text-[9px] text-white font-black flex items-center justify-center animate-bounce">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 rounded-2xl bg-white dark:bg-[#221C1A] shadow-2xl border border-[#F2D5CC] dark:border-[#3E302C] py-2 z-50 text-left overflow-hidden">
                  <div className="flex justify-between items-center px-4 py-2 border-b border-[#F2D5CC] dark:border-[#3E302C]">
                    <h4 className="text-xs font-extrabold tracking-wider uppercase text-[#3A3A3A] dark:text-[#E3DCDA]">
                      Citizen Alerts
                    </h4>
                    {unreadCount > 0 && (
                      <button
                        onClick={() => {
                          onMarkNotificationsRead();
                        }}
                        className="text-[10px] font-bold text-[#FF6B6B] hover:underline cursor-pointer"
                      >
                        Clear all
                      </button>
                    )}
                  </div>

                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-[#777777] dark:text-[#A89F9D]">
                        No notifications yet. You will be alerted when your reports change status.
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`px-4 py-3 border-b border-neutral-50 dark:border-[#2C211E] last:border-0 transition-colors ${
                            notif.read ? "bg-white dark:bg-[#221C1A]" : "bg-[#FFF9F7] dark:bg-[#2A201D]"
                          }`}
                        >
                          <div className="flex justify-between items-start gap-1">
                            <span className="text-xs font-bold text-[#3A3A3A] dark:text-[#E3DCDA]">
                              {notif.title}
                            </span>
                            {!notif.read && (
                              <button
                                onClick={() => onMarkNotificationsRead(notif.id)}
                                className="p-0.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-[#FF6B6B] cursor-pointer"
                                title="Mark as Read"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                          <p className="text-[11px] text-[#777777] dark:text-[#A89F9D] mt-1 leading-relaxed">
                            {notif.message}
                          </p>
                          <span className="block text-[9px] text-[#777777] dark:text-[#A89F9D] mt-1.5 italic">
                            {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2.5 rounded-full bg-white dark:bg-[#221C1A] border border-[#F2D5CC] dark:border-[#3E302C] hover:bg-neutral-50 dark:hover:bg-[#2C211E]/45 hover:border-[#FF8A65] text-[#3A3A3A] dark:text-[#E3DCDA] transition-all cursor-pointer hover:rotate-12 shadow-sm"
              title={darkMode ? "Switch to light mode" : "Switch to warm dark mode"}
            >
              {darkMode ? <Sun className="w-5 h-5 text-[#F6B756]" /> : <Moon className="w-5 h-5 text-[#FF6B6B]" />}
            </button>

          </div>

          {/* Hamburger Menu & Compact Utilities (Mobile/Tablet View) */}
          <div className="flex lg:hidden items-center gap-2">
            
            {/* Rewards pts block */}
            <div
              onClick={() => setActiveTab("profile")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#F2D5CC] dark:border-[#3E302C] bg-white dark:bg-[#221C1A] text-[10px] font-bold text-[#3A3A3A] dark:text-[#E3DCDA] cursor-pointer select-none"
            >
              <Award className="w-4 h-4 text-[#FF6B6B]" />
              <span>{user.points} PTS</span>
            </div>

            {/* Notificationsbell */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                }}
                className="p-2 rounded-full border border-[#F2D5CC] dark:border-[#3E302C] bg-white dark:bg-[#221C1A] text-[#3A3A3A] dark:text-[#E3DCDA] relative cursor-pointer"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-[#FF6B6B] text-[8px] text-white font-black flex items-center justify-center animate-bounce">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-3 w-72 rounded-2xl bg-white dark:bg-[#221C1A] shadow-2xl border border-[#F2D5CC] dark:border-[#3E302C] py-2 z-50 text-left overflow-hidden">
                  <div className="flex justify-between items-center px-3.5 py-2 border-b border-[#F2D5CC] dark:border-[#3E302C]">
                    <h4 className="text-[10px] font-extrabold tracking-wider uppercase text-[#3A3A3A] dark:text-[#E3DCDA]">
                      Citizen Alerts
                    </h4>
                    {unreadCount > 0 && (
                      <button
                        onClick={() => onMarkNotificationsRead()}
                        className="text-[10px] font-bold text-[#FF6B6B] hover:underline cursor-pointer"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <div className="max-h-56 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-[10px] text-[#777777] dark:text-[#A89F9D]">
                        No notifications.
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`px-3 py-2 border-b border-neutral-50 dark:border-[#2C211E] last:border-0 ${
                            notif.read ? "bg-white dark:bg-[#221C1A]" : "bg-[#FFF9F7] dark:bg-[#2A201D]"
                          }`}
                        >
                          <p className="text-[11px] font-bold text-[#3A3A3A] dark:text-[#E3DCDA] leading-tight">{notif.title}</p>
                          <p className="text-[10px] text-[#777777] dark:text-[#A89F9D] leading-tight mt-0.5">{notif.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Dark Mode toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full border border-[#F2D5CC] dark:border-[#3E302C] bg-white dark:bg-[#221C1A] text-[#3A3A3A] dark:text-[#E3DCDA] cursor-pointer"
            >
              {darkMode ? <Sun className="w-4 h-4 text-[#F6B756]" /> : <Moon className="w-4 h-4 text-[#FF6B6B]" />}
            </button>

            {/* Hamburger Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-full border border-[#F2D5CC] dark:border-[#3E302C] bg-white dark:bg-[#221C1A] text-[#3A3A3A] dark:text-[#E3DCDA] hover:border-[#FF8A65] transition-all cursor-pointer"
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-4 h-4 text-[#FF6B6B]" />
              ) : (
                <Menu className="w-4 h-4 text-[#3A3A3A] dark:text-[#E3DCDA]" />
              )}
            </button>

          </div>
        </div>
      </div>
      
      {/* Collapsible Mobile/Tablet Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden w-full border-t border-[#F2D5CC] dark:border-[#3E302C] bg-[#FFF8F5] dark:bg-[#1C1715] px-4 py-4 space-y-2 animate-in slide-in-from-top-4 duration-200">
          <div className="flex flex-col gap-1.5">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full px-4 py-3 rounded-xl text-xs font-bold text-left flex justify-between items-center transition-all ${
                    isActive
                      ? "text-white bg-gradient-to-r from-[#FF6B6B] to-[#FF8A65] shadow-sm"
                      : "text-[#3A3A3A] dark:text-[#E3DCDA] bg-white dark:bg-[#221C1A] border border-[#F2D5CC] dark:border-[#3E302C] hover:border-[#FF8A65]"
                  }`}
                >
                  <span>{item.label}</span>
                  {isActive && <Check className="w-3.5 h-3.5 text-white" />}
                </button>
              );
            })}
          </div>

          {/* Mobile Citizen Rewards Stat card */}
          <div className="p-3.5 bg-white dark:bg-[#221C1A] rounded-2xl border border-[#F2D5CC] dark:border-[#3E302C] flex items-center justify-between mt-2 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-[#FFF0EB] dark:bg-[#3E2925] text-[#FF6B6B]">
                <Award className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="block text-[9px] uppercase font-bold text-[#777777] dark:text-[#A89F9D]">Status Rank</span>
                <span className="text-xs font-extrabold text-[#3A3A3A] dark:text-[#E3DCDA]">{user.level}</span>
              </div>
            </div>
            <div className="text-right">
              <span className="block text-[9px] uppercase font-bold text-[#777777] dark:text-[#A89F9D]">Total Score</span>
              <span className="text-xs font-black text-[#FF6B6B]">{user.points} PTS</span>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
