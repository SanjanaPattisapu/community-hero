import React, { useState, useEffect } from "react";
import { CivicIssue, UserProfile, AppNotification } from "./types";
import {
  fetchIssues,
  createIssue,
  upvoteIssue,
  verifyIssue,
  addComment,
  fetchNotifications,
  markNotificationsRead
} from "./services/api";

import Navbar from "./components/Navbar";
import LandingPage from "./components/LandingPage";
import Dashboard from "./components/Dashboard";
import ReportIssue from "./components/ReportIssue";
import AiInsights from "./components/AiInsights";
import Profile from "./components/Profile";
import AdminPanel from "./components/AdminPanel";
import ChatBot from "./components/ChatBot";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("landing");
  const [issues, setIssues] = useState<CivicIssue[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load app state from backend
  const loadAppState = async () => {
    try {
      const { issues: loadedIssues, user: loadedUser } = await fetchIssues();
      setIssues(loadedIssues);
      setUser(loadedUser);
      
      const loadedNotifs = await fetchNotifications();
      setNotifications(loadedNotifs);
    } catch (error) {
      console.error("Failed to load application state:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAppState();
  }, []);

  // Sync HTML Dark Mode classes
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // Handlers for interactive actions
  const handleCreateReport = async (payload: any) => {
    try {
      const res = await createIssue(payload);
      if (res.success) {
        setIssues((prev) => [res.issue, ...prev]);
        setUser(res.user);
        
        // Refresh notifications
        const latestNotifs = await fetchNotifications();
        setNotifications(latestNotifs);

        alert("Complaint successfully registered! Thank you for being a Community Hero.");
        setActiveTab("dashboard");
      }
    } catch (e: any) {
      alert(`Submission failed: ${e.message}`);
    }
  };

  const handleUpvote = async (id: string) => {
    try {
      const res = await upvoteIssue(id);
      if (res.success) {
        setIssues((prev) =>
          prev.map((i) => (i.id === id ? res.issue : i))
        );
        setUser(res.user);
      }
    } catch (e) {
      console.error("Upvote failed:", e);
    }
  };

  const handleVerify = async (id: string, isPositive: boolean) => {
    try {
      const res = await verifyIssue(id, isPositive);
      if (res.success) {
        setIssues((prev) =>
          prev.map((i) => (i.id === id ? res.issue : i))
        );
        setUser(res.user);
        
        // Refresh notifications if verifications trigger milestone achievements
        const latestNotifs = await fetchNotifications();
        setNotifications(latestNotifs);
      }
    } catch (e) {
      console.error("Verification failed:", e);
    }
  };

  const handleAddComment = async (id: string, text: string) => {
    try {
      const res = await addComment(id, text);
      if (res.success) {
        setIssues((prev) =>
          prev.map((i) => (i.id === id ? res.issue : i))
        );
        setUser(res.user);
      }
    } catch (e) {
      console.error("Comment submission failed:", e);
    }
  };

  const handleMarkNotificationsRead = async (id?: string) => {
    try {
      const updatedNotifs = await markNotificationsRead(id);
      setNotifications(updatedNotifs);
    } catch (e) {
      console.error("Failed to clear notifications:", e);
    }
  };

  const handleStatusUpdatedByAdmin = (updatedIssue: CivicIssue) => {
    setIssues((prev) =>
      prev.map((i) => (i.id === updatedIssue.id ? updatedIssue : i))
    );
    // Refresh notifications as well
    fetchNotifications().then(setNotifications).catch(console.error);
  };

  const handleResetDb = (newIssues: CivicIssue[]) => {
    setIssues(newIssues);
    // Hard refresh state elements
    loadAppState();
  };

  const handleDeleteIssueLocal = (id: string) => {
    setIssues((prev) => prev.filter((i) => i.id !== id));
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen w-full flex flex-col justify-center items-center bg-[#FFF8F5] dark:bg-[#1C1715] text-center space-y-4">
        <div className="w-12 h-12 border-4 border-t-transparent border-[#FF6B6B] rounded-full animate-spin" />
        <p className="text-sm font-bold text-[#FF6B6B] animate-pulse">Initializing Community Hero Civic Grid...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#FFF8F5] dark:bg-[#1C1715] transition-colors duration-300">
      
      {/* Dynamic Sticky Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        notifications={notifications}
        onMarkNotificationsRead={handleMarkNotificationsRead}
        user={user}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full bg-[#FFF8F5] dark:bg-[#1C1715]">
        {activeTab === "landing" && (
          <LandingPage
            onCTA={(tab) => setActiveTab(tab)}
            darkMode={darkMode}
          />
        )}
        
        {activeTab === "dashboard" && (
          <Dashboard
            issues={issues}
            user={user}
            onUpvote={handleUpvote}
            onVerify={handleVerify}
            onAddComment={handleAddComment}
            darkMode={darkMode}
            onNavigateToReport={() => setActiveTab("report")}
          />
        )}
        
        {activeTab === "report" && (
          <ReportIssue
            issues={issues}
            user={user}
            onSubmitReport={handleCreateReport}
            darkMode={darkMode}
            onNavigateToDashboard={() => setActiveTab("dashboard")}
          />
        )}
        
        {activeTab === "insights" && (
          <AiInsights />
        )}
        
        {activeTab === "profile" && (
          <Profile
            user={user}
            issues={issues}
            onSelectIssue={(id) => setActiveTab("report")} // Navigate back to list or reporting
            onNavigateToDashboard={() => setActiveTab("dashboard")}
          />
        )}
        
        {activeTab === "admin" && (
          <AdminPanel
            issues={issues}
            onStatusUpdated={handleMarkNotificationsRead && handleStatusUpdatedByAdmin}
            onResetDb={handleResetDb}
            onDeleteIssueLocal={handleDeleteIssueLocal}
          />
        )}
      </main>

      {/* Persistent Floating Chat Assistant */}
      <ChatBot />

    </div>
  );
}
