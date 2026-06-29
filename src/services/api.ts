import { CivicIssue, UserProfile, AppNotification, AIInsights } from "../types";

const API_BASE = "";

export async function fetchIssues(): Promise<{ issues: CivicIssue[]; user: UserProfile }> {
  const res = await fetch(`${API_BASE}/api/issues`);
  if (!res.ok) throw new Error("Failed to fetch issues");
  return res.json();
}

export interface ReportPayload {
  title: string;
  description: string;
  category: string;
  latitude: number;
  longitude: number;
  address: string;
  imageUrl?: string;
  aiAnalysis?: {
    aiConfidence: number;
    aiSummary: string;
    severity: string;
    priority: string;
    department: string;
    safetyRisk: string | null;
  };
}

export async function createIssue(payload: ReportPayload): Promise<{ success: boolean; issue: CivicIssue; user: UserProfile }> {
  const res = await fetch(`${API_BASE}/api/issues/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to submit issue");
  return res.json();
}

export async function detectDuplicates(lat: number, lng: number, category: string): Promise<CivicIssue[]> {
  const res = await fetch(`${API_BASE}/api/issues/detect-duplicates`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ latitude: lat, longitude: lng, category }),
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.duplicates || [];
}

export async function upvoteIssue(id: string): Promise<{ success: boolean; issue: CivicIssue; user: UserProfile }> {
  const res = await fetch(`${API_BASE}/api/issues/upvote`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  });
  if (!res.ok) throw new Error("Failed to upvote issue");
  return res.json();
}

export async function verifyIssue(id: string, isPositive: boolean): Promise<{ success: boolean; issue: CivicIssue; user: UserProfile }> {
  const res = await fetch(`${API_BASE}/api/issues/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, isPositive }),
  });
  if (!res.ok) throw new Error("Failed to verify issue");
  return res.json();
}

export async function addComment(id: string, text: string): Promise<{ success: boolean; issue: CivicIssue; user: UserProfile }> {
  const res = await fetch(`${API_BASE}/api/issues/comment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, text }),
  });
  if (!res.ok) throw new Error("Failed to add comment");
  return res.json();
}

export async function updateIssueStatus(id: string, status: string, department?: string): Promise<{ success: boolean; issue: CivicIssue; user: UserProfile }> {
  const res = await fetch(`${API_BASE}/api/issues/update-status`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, status, department }),
  });
  if (!res.ok) throw new Error("Failed to update status");
  return res.json();
}

export async function enhanceComplaintText(text: string): Promise<{ enhancedText: string; simulated: boolean }> {
  const res = await fetch(`${API_BASE}/api/ai/enhance`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error("Failed to enhance text");
  return res.json();
}

export async function analyzeImage(base64Image: string): Promise<{
  category: string;
  aiConfidence: number;
  aiSummary: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  priority: "Low" | "Medium" | "High" | "Immediate";
  department: string;
  safetyRisk: string | null;
  simulated?: boolean;
}> {
  const res = await fetch(`${API_BASE}/api/ai/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ base64Image }),
  });
  if (!res.ok) throw new Error("Image analysis request failed");
  return res.json();
}

export async function fetchAIInsights(): Promise<AIInsights & { simulated?: boolean }> {
  const res = await fetch(`${API_BASE}/api/ai/insights`);
  if (!res.ok) throw new Error("Failed to fetch AI insights");
  return res.json();
}

export async function sendChatMessage(message: string, chatHistory: { role: string; content: string }[]): Promise<{ responseText: string; simulated?: boolean }> {
  const res = await fetch(`${API_BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, chatHistory }),
  });
  if (!res.ok) throw new Error("Failed to send chat message");
  return res.json();
}

export async function fetchNotifications(): Promise<AppNotification[]> {
  const res = await fetch(`${API_BASE}/api/notifications`);
  if (!res.ok) throw new Error("Failed to fetch notifications");
  const data = await res.json();
  return data.notifications || [];
}

export async function markNotificationsRead(id?: string): Promise<AppNotification[]> {
  const res = await fetch(`${API_BASE}/api/notifications/mark-read`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  });
  if (!res.ok) throw new Error("Failed to mark notifications read");
  const data = await res.json();
  return data.notifications || [];
}

export async function resetDatabase(): Promise<{ success: boolean; issues: CivicIssue[] }> {
  const res = await fetch(`${API_BASE}/api/admin/reset`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to reset database");
  return res.json();
}
